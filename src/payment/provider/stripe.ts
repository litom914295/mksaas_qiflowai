import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import {
  addCredits,
  addLifetimeMonthlyCredits,
  addSubscriptionCredits,
} from '@/credits/credits';
import { getCreditPackageById } from '@/credits/server';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { payment, stripeWebhookEvents, user } from '@/db/schema';
import {
  findPlanByPlanId,
  findPlanByPriceId,
  findPriceInPlan,
} from '@/lib/price-plan';
import { sendNotification } from '@/notification/notification';
import { desc, eq } from 'drizzle-orm';
import { Stripe } from 'stripe';
import {
  type CheckoutResult,
  type CreateCheckoutParams,
  type CreateCreditCheckoutParams,
  type CreatePortalParams,
  type PaymentProvider,
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PortalResult,
  type Subscription,
  type getSubscriptionsParams,
} from '../types';

/**
 * Stripe payment provider implementation
 *
 * docs:
 * https://qiflowai.com/docs/payment
 */
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  /**
   * Initialize Stripe provider with API key
   */
  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (
      !webhookSecret ||
      webhookSecret === 'whsec_PLACEHOLDER_TO_BE_REPLACED_BY_STRIPE_CLI'
    ) {
      console.warn(
        '⚠️ STRIPE_WEBHOOK_SECRET is not configured. Webhook events will not work.'
      );
      console.warn(
        'Run: stripe listen --forward-to http://localhost:3000/api/webhooks/stripe'
      );
    }

    // Initialize Stripe without specifying apiVersion to use default/latest version
    this.stripe = new Stripe(apiKey);
    this.webhookSecret = webhookSecret || '';
  }

  /**
   * Create a customer in Stripe if not exists
   * @param email Customer email
   * @param name Optional customer name
   * @returns Stripe customer ID
   */
  private async createOrGetCustomer(
    email: string,
    name?: string
  ): Promise<string> {
    try {
      // Search for existing customer
      const customers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      // Find existing customer
      if (customers.data && customers.data.length > 0) {
        const customerId = customers.data[0].id;

        // Find user id by customer id
        const userId = await this.findUserIdByCustomerId(customerId);
        // user does not exist, update user with customer id
        // in case you deleted user in database, but forgot to delete customer in Stripe
        if (!userId) {
          console.log('User does not exist, update with customer id (hidden)');
          await this.updateUserWithCustomerId(customerId, email);
        }
        return customerId;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name: name || undefined,
      });

      // Update user record in database with the new customer ID
      await this.updateUserWithCustomerId(customer.id, email);

      return customer.id;
    } catch (error) {
      console.error('Create or get customer error:', error);
      throw new Error('Failed to create or get customer');
    }
  }

  /**
   * Updates a user record with a Stripe customer ID
   * @param customerId Stripe customer ID
   * @param email Customer email
   * @returns Promise that resolves when the update is complete
   */
  private async updateUserWithCustomerId(
    customerId: string,
    email: string
  ): Promise<void> {
    try {
      // Update user record with customer ID if email matches
      const db = await getDb();
      const result = await db
        .update(user)
        .set({
          customerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.email, email))
        .returning({ id: user.id });

      if (result.length > 0) {
        console.log('Updated user with customer ID (hidden)');
      } else {
        console.log('No user found with given email');
      }
    } catch (error) {
      console.error('Update user with customer ID error:', error);
      throw new Error('Failed to update user with customer ID');
    }
  }

  /**
   * Finds a user by customerId
   * @param customerId Stripe customer ID
   * @returns User ID or undefined if not found
   */
  private async findUserIdByCustomerId(
    customerId: string
  ): Promise<string | undefined> {
    try {
      // Query the user table for a matching customerId
      const db = await getDb();
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.customerId, customerId))
        .limit(1);

      if (result.length > 0) {
        return result[0].id;
      }
      console.warn('No user found with given customerId');

      return undefined;
    } catch (error) {
      console.error('Find user by customer ID error:', error);
      return undefined;
    }
  }

  /**
   * Create a checkout session for a plan
   * @param params Parameters for creating the checkout session
   * @returns Checkout result
   */
  public async createCheckout(
    params: CreateCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      planId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      console.log('[StripeProvider] Creating checkout session:', {
        planId,
        priceId,
        customerEmail,
      });

      // Get plan and price
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        console.error('[StripeProvider] Plan not found:', planId);
        throw new Error(`Plan with ID ${planId} not found`);
      }
      console.log('[StripeProvider] Plan found:', plan.id);

      // Find price in plan
      const price = findPriceInPlan(planId, priceId);
      if (!price) {
        console.error('[StripeProvider] Price not found in plan:', {
          planId,
          priceId,
        });
        throw new Error(`Price ID ${priceId} not found in plan ${planId}`);
      }
      console.log('[StripeProvider] Price found:', price);

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata, so we can get it in the webhook event
      const customMetadata = {
        ...metadata,
        planId,
        priceId,
      };

      // Set up the line items
      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      // Create checkout session parameters
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode:
          price.type === PaymentTypes.SUBSCRIPTION ? 'subscription' : 'payment',
        success_url: successUrl ?? '',
        cancel_url: cancelUrl ?? '',
        metadata: customMetadata,
        allow_promotion_codes: price.allowPromotionCode ?? false,
      };

      // Add customer to checkout session
      checkoutParams.customer = customerId;

      // Add locale if provided
      if (locale) {
        checkoutParams.locale = this.mapLocaleToStripeLocale(
          locale
        ) as Stripe.Checkout.SessionCreateParams.Locale;
      }

      // Add payment intent data for one-time payments
      if (price.type === PaymentTypes.ONE_TIME) {
        checkoutParams.payment_intent_data = {
          metadata: customMetadata,
        };
        // Automatically create an invoice for the one-time payment
        checkoutParams.invoice_creation = {
          enabled: true,
        };
      }

      // Add subscription data for recurring payments
      if (price.type === PaymentTypes.SUBSCRIPTION) {
        // Initialize subscription_data with metadata
        checkoutParams.subscription_data = {
          metadata: customMetadata,
        };

        // Add trial period if applicable
        if (price.trialPeriodDays && price.trialPeriodDays > 0) {
          checkoutParams.subscription_data.trial_period_days =
            price.trialPeriodDays;
        }
      }

      // Create the checkout session
      console.log(
        '[StripeProvider] Creating Stripe session with params:',
        JSON.stringify(checkoutParams, null, 2)
      );
      const session =
        await this.stripe.checkout.sessions.create(checkoutParams);

      console.log('[StripeProvider] Checkout session created successfully:', {
        id: session.id,
        url: session.url,
      });
      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      console.error('Create checkout session error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a checkout session for a plan
   * @param params Parameters for creating the checkout session
   * @returns Checkout result
   */
  public async createCreditCheckout(
    params: CreateCreditCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      packageId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      console.log('[StripeProvider] Creating credit checkout session:', {
        packageId,
        priceId,
        customerEmail,
      });

      // Get credit package
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        console.error('[StripeProvider] Credit package not found:', packageId);
        throw new Error(`Credit package with ID ${packageId} not found`);
      }
      console.log('[StripeProvider] Credit package found:', creditPackage.id);

      // Validate priceId
      if (!priceId) {
        console.error(
          '[StripeProvider] Price ID not provided for package:',
          packageId
        );
        throw new Error(`Price ID not found for credit package ${packageId}`);
      }
      console.log('[StripeProvider] Using priceId:', priceId);

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata, so we can get it in the webhook event
      const customMetadata = {
        ...metadata,
        packageId,
        priceId,
      };

      // Set up the line items
      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      // Create checkout session parameters
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl ?? '',
        cancel_url: cancelUrl ?? '',
        metadata: customMetadata,
        allow_promotion_codes: creditPackage.price.allowPromotionCode ?? false,
      };

      // Add customer to checkout session
      checkoutParams.customer = customerId;

      // Add locale if provided
      if (locale) {
        checkoutParams.locale = this.mapLocaleToStripeLocale(
          locale
        ) as Stripe.Checkout.SessionCreateParams.Locale;
      }

      // Add payment intent data for one-time payments
      checkoutParams.payment_intent_data = {
        metadata: customMetadata,
      };
      // Automatically create an invoice for the one-time payment
      checkoutParams.invoice_creation = {
        enabled: true,
      };

      // Create the checkout session
      console.log(
        '[StripeProvider] Creating Stripe credit session with params:',
        JSON.stringify(checkoutParams, null, 2)
      );
      const session =
        await this.stripe.checkout.sessions.create(checkoutParams);

      console.log(
        '[StripeProvider] Credit checkout session created successfully:',
        { id: session.id, url: session.url }
      );
      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      console.error(
        '[StripeProvider] Create credit checkout session error:',
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create credit checkout session');
    }
  }

  /**
   * Create a customer portal session
   * @param params Parameters for creating the portal
   * @returns Portal result
   */
  public async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId, returnUrl, locale } = params;

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl ?? '',
        locale: locale
          ? (this.mapLocaleToStripeLocale(
              locale
            ) as Stripe.BillingPortal.SessionCreateParams.Locale)
          : undefined,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Create customer portal error:', error);
      throw new Error('Failed to create customer portal');
    }
  }

  /**
   * Get subscriptions
   * @param params Parameters for getting subscriptions
   * @returns Array of subscription objects
   */
  public async getSubscriptions(
    params: getSubscriptionsParams
  ): Promise<Subscription[]> {
    const { userId } = params;

    try {
      // Build query to fetch subscriptions from database
      const db = await getDb();
      const subscriptions = await db
        .select()
        .from(payment)
        .where(eq(payment.userId, userId))
        .orderBy(desc(payment.createdAt)); // Sort by creation date, newest first

      // Map database records to our subscription model
      return subscriptions.map((subscription) => ({
        id: subscription.subscriptionId || '',
        customerId: subscription.customerId,
        priceId: subscription.priceId,
        status: subscription.status as PaymentStatus,
        type: subscription.type as PaymentTypes,
        interval: subscription.interval as PlanInterval,
        currentPeriodStart: subscription.periodStart || undefined,
        currentPeriodEnd: subscription.periodEnd || undefined,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        trialStartDate: subscription.trialStart || undefined,
        trialEndDate: subscription.trialEnd || undefined,
        createdAt: subscription.createdAt,
      }));
    } catch (error) {
      console.error('List customer subscriptions error:', error);
      return [];
    }
  }

  /**
   * Handle webhook event
   * @param payload Raw webhook payload
   * @param signature Webhook signature
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<void> {
    const db = await getDb();
    let event: Stripe.Event;

    try {
      // Verify the event signature if webhook secret is available
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      console.error('[Webhook] Signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }

    const eventType = event.type;
    const eventId = event.id;

    try {
      // Phase 1: 幂等性检查 - 防止重复处理
      const [existingEvent] = await db
        .select()
        .from(stripeWebhookEvents)
        .where(eq(stripeWebhookEvents.id, eventId))
        .limit(1);

      if (existingEvent) {
        console.log(
          `[Webhook] Event ${eventId} (${eventType}) already processed at ${existingEvent.processedAt}`
        );
        return; // 已处理，跳过
      }

      console.log(
        `[Webhook] Processing new event ${eventId}, type: ${eventType}`
      );

      // 记录事件（处理前）
      await db.insert(stripeWebhookEvents).values({
        id: eventId,
        eventType: eventType,
        processedAt: new Date(),
        payload: event as any, // 存储完整 event 对象
        success: true, // 先设为 true，如果失败会更新
      });

      // Handle subscription events
      if (eventType.startsWith('customer.subscription.')) {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        // Process based on subscription status and event type
        switch (eventType) {
          case 'customer.subscription.created': {
            await this.onCreateSubscription(stripeSubscription);
            break;
          }
          case 'customer.subscription.updated': {
            await this.onUpdateSubscription(stripeSubscription);
            break;
          }
          case 'customer.subscription.deleted': {
            await this.onDeleteSubscription(stripeSubscription);
            break;
          }
        }
      } else if (eventType.startsWith('invoice.')) {
        // Handle invoice events
        if (eventType === 'invoice.paid') {
          const invoice = event.data.object as Stripe.Invoice;
          await this.onInvoicePaid(invoice);
        }
      } else if (eventType.startsWith('checkout.')) {
        // Handle checkout events
        if (eventType === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;

          // Only process one-time payments (likely for lifetime plan)
          if (session.mode === 'payment') {
            if (session.metadata?.type === 'credit_purchase') {
              await this.onCreditPurchase(session);
            } else {
              await this.onOnetimePayment(session);
            }
          }
        }
      }

      console.log(`[Webhook] Event ${eventId} processed successfully`);
    } catch (error) {
      console.error(`[Webhook] Event ${eventId} processing failed:`, error);

      // 更新事件记录为失败状态
      try {
        await db
          .update(stripeWebhookEvents)
          .set({
            success: false,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          })
          .where(eq(stripeWebhookEvents.id, eventId));
      } catch (updateError) {
        console.error(
          '[Webhook] Failed to update event error status:',
          updateError
        );
      }

      throw new Error('Failed to handle webhook event');
    }
  }

  /**
   * Create payment record
   * @param stripeSubscription Stripe subscription
   */
  private async onCreateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Create payment record for Stripe subscription');
    const customerId = stripeSubscription.customer as string;

    // get priceId from subscription items (this is always available)
    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      console.warn('No priceId found for subscription');
      return;
    }

    // get userId from metadata, we add it in the createCheckout session
    const userId = stripeSubscription.metadata.userId;
    if (!userId) {
      console.warn('No userId found for subscription');
      return;
    }

    // create fields
    const createFields: any = {
      id: randomUUID(),
      priceId: priceId,
      type: PaymentTypes.SUBSCRIPTION,
      scene: 'subscription',
      userId: userId,
      customerId: customerId,
      subscriptionId: stripeSubscription.id,
      interval: this.mapStripeIntervalToPlanInterval(stripeSubscription),
      status: this.mapSubscriptionStatusToPaymentStatus(
        stripeSubscription.status
      ),
      paid: false, // Will be updated to true when invoice.paid event is received
      periodStart: stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : null,
      periodEnd: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDb();
    const result = await db
      .insert(payment)
      .values(createFields)
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Created new payment record for Stripe subscription');
    } else {
      console.warn('<< No payment record created for Stripe subscription');
    }

    // Conditionally handle credits after subscription creation if enables credits
    if (websiteConfig.credits?.enableCredits) {
      await addSubscriptionCredits(userId, priceId);
      console.log('<< Added subscription monthly credits for user');
    }
  }

  /**
   * Update payment record
   * @param stripeSubscription Stripe subscription
   */
  private async onUpdateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Update payment record for Stripe subscription');

    // get priceId from subscription items (this is always available)
    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      console.warn('No priceId found for subscription');
      return;
    }

    // Get current payment record to check for period changes (indicating renewal)
    const db = await getDb();
    const payments = await db
      .select({
        userId: payment.userId,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
      })
      .from(payment)
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .limit(1);

    // get new period start and end
    const newPeriodStart = stripeSubscription.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000)
      : undefined;
    const newPeriodEnd = stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000)
      : undefined;

    // Check if this is a renewal (period has changed and subscription is active)
    const isRenewal =
      payments.length > 0 &&
      stripeSubscription.status === 'active' &&
      payments[0].periodStart &&
      newPeriodStart &&
      payments[0].periodStart.getTime() !== newPeriodStart.getTime();

    // update fields
    const updateFields: any = {
      priceId: priceId,
      interval: this.mapStripeIntervalToPlanInterval(stripeSubscription),
      status: this.mapSubscriptionStatusToPaymentStatus(
        stripeSubscription.status
      ),
      periodStart: newPeriodStart,
      periodEnd: newPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : undefined,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : undefined,
      updatedAt: new Date(),
    };

    const result = await db
      .update(payment)
      .set(updateFields)
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Updated payment record for Stripe subscription');

      // Add credits for subscription renewal
      const currentPayment = payments[0];
      const userId = currentPayment.userId;
      // Add subscription renewal credits if plan config enables credits
      if (isRenewal && userId && websiteConfig.credits?.enableCredits) {
        // Note: For yearly subscriptions, this webhook only triggers once per year
        // Monthly credits for yearly subscribers are handled by the distributeCreditsToAllUsers cron job
        await addSubscriptionCredits(userId, priceId);
        console.log('<< Added subscription renewal credits for user');
      } else {
        console.log(
          '<< No renewal credits added for user, isRenewal: ' + isRenewal
        );
      }
    } else {
      console.warn('<< No payment record found for Stripe subscription');
    }
  }

  /**
   * Update payment record, set status to canceled
   * @param stripeSubscription Stripe subscription
   */
  private async onDeleteSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Mark payment record for Stripe subscription as canceled');
    const db = await getDb();
    const result = await db
      .update(payment)
      .set({
        status: this.mapSubscriptionStatusToPaymentStatus(
          stripeSubscription.status
        ),
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Marked payment record for subscription as canceled');
    } else {
      console.warn(
        '<< No payment record found to cancel for Stripe subscription'
      );
    }
  }

  /**
   * Handle invoice paid event
   * Updates payment record with invoice ID and paid status
   * @param invoice Stripe invoice
   */
  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('>> Handle invoice.paid event');
    const subscriptionId = invoice.subscription as string;
    const invoiceId = invoice.id;

    if (!subscriptionId) {
      console.warn('No subscription ID found for invoice');
      return;
    }

    const db = await getDb();
    const result = await db
      .update(payment)
      .set({
        invoiceId: invoiceId,
        paid: true,
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, subscriptionId))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log(`<< Updated payment record with invoice ID: ${invoiceId}`);
    } else {
      console.warn(
        '<< No payment record found for subscription in invoice.paid event'
      );
    }
  }

  /**
   * Handle one-time payment
   * @param session Stripe checkout session
   */
  private async onOnetimePayment(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const customerId = session.customer as string;
    console.log('>> Handle onetime payment for customer');

    // get userId from session metadata, we add it in the createCheckout session
    const userId = session.metadata?.userId;
    if (!userId) {
      console.warn('No userId found for checkout session');
      return;
    }

    // get priceId from session metadata, not from line items
    // const priceId = session.line_items?.data[0]?.price?.id;
    const priceId = session.metadata?.priceId;
    if (!priceId) {
      console.warn('No priceId found for checkout session');
      return;
    }

    try {
      const db = await getDb();

      // Check if this session has already been processed to prevent duplicate processing
      const existingPayment = await db
        .select({ id: payment.id })
        .from(payment)
        .where(eq(payment.sessionId, session.id))
        .limit(1);

      if (existingPayment.length > 0) {
        console.log(
          'One-time payment session already processed: ' + session.id
        );
        return;
      }

      // Create a one-time payment record
      const now = new Date();
      const result = await db
        .insert(payment)
        .values({
          id: randomUUID(),
          priceId: priceId,
          type: PaymentTypes.ONE_TIME,
          userId: userId,
          customerId: customerId,
          sessionId: session.id, // Track the session ID
          status: 'completed', // One-time payments are always completed
          periodStart: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: payment.id });

      if (result.length === 0) {
        console.warn('<< Failed to create one-time payment record for user');
        return;
      }
      console.log('Created one-time payment record for user');

      // Conditionally handle credits after one-time payment
      if (websiteConfig.credits?.enableCredits) {
        // For now, one time payment is only for lifetime plan
        await addLifetimeMonthlyCredits(userId, priceId);
        console.log('<< Added lifetime monthly credits for user');
      }

      // Send notification
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      await sendNotification(session.id, customerId, userId, amount);
    } catch (error) {
      console.error('onOnetimePayment error for session: ' + session.id, error);
      throw error;
    }
  }

  /**
   * Handle credit purchase
   * @param session Stripe checkout session
   */
  private async onCreditPurchase(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const customerId = session.customer as string;
    console.log('>> Handle credit purchase for customer');

    // get userId from session metadata, we add it in the createCheckout session
    const userId = session.metadata?.userId;
    if (!userId) {
      console.warn('No userId found for checkout session');
      return;
    }

    // get packageId from session metadata
    const packageId = session.metadata?.packageId;
    if (!packageId) {
      console.warn('No packageId found for checkout session');
      return;
    }

    // get credits from session metadata
    const credits = session.metadata?.credits;
    if (!credits) {
      console.warn('No credits found for checkout session');
      return;
    }

    // get credit package
    const creditPackage = getCreditPackageById(packageId);
    if (!creditPackage) {
      console.warn('Credit package ' + packageId + ' not found');
      return;
    }

    try {
      // Check if this session has already been processed to prevent duplicate credit additions
      const db = await getDb();
      const existingPayment = await db
        .select({ id: payment.id })
        .from(payment)
        .where(eq(payment.sessionId, session.id))
        .limit(1);

      if (existingPayment.length > 0) {
        console.log('Credit purchase session already processed: ' + session.id);
        return;
      }

      // Create payment record first to mark this session as processed
      const now = new Date();
      await db.insert(payment).values({
        id: randomUUID(),
        priceId: session.metadata?.priceId || '',
        type: PaymentTypes.ONE_TIME,
        userId: userId,
        customerId: customerId,
        sessionId: session.id, // Use sessionId to track processed sessions
        status: 'completed',
        periodStart: now,
        createdAt: now,
        updatedAt: now,
      });

      // add credits to user account
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      await addCredits({
        userId,
        amount: Number.parseInt(credits),
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        description: `+${credits} credits for package ${packageId} ($${amount.toLocaleString()})`,
        paymentId: session.id,
        expireDays: creditPackage.expireDays,
      });

      console.log('Added ' + credits + ' credits to user');
    } catch (error) {
      console.error('onCreditPurchase error for session: ' + session.id, error);
      throw error;
    }
  }

  /**
   * Map Stripe subscription interval to our own interval types
   * @param subscription Stripe subscription
   * @returns PlanInterval
   */
  private mapStripeIntervalToPlanInterval(
    subscription: Stripe.Subscription
  ): PlanInterval {
    switch (subscription.items.data[0]?.plan.interval) {
      case 'month':
        return PlanIntervals.MONTH;
      case 'year':
        return PlanIntervals.YEAR;
      default:
        return PlanIntervals.MONTH;
    }
  }

  /**
   * Convert Stripe subscription status to PaymentStatus,
   * we narrow down the status to our own status types
   * @param status Stripe subscription status
   * @returns PaymentStatus
   */
  private mapSubscriptionStatusToPaymentStatus(
    status: Stripe.Subscription.Status
  ): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      past_due: 'past_due',
      trialing: 'trialing',
      unpaid: 'unpaid',
      paused: 'paused',
    };

    return statusMap[status] || 'failed';
  }

  /**
   * Map application locale to Stripe's supported locales
   * @param locale Application locale (e.g., 'en', 'zh-CN')
   * @returns Stripe locale string
   */
  private mapLocaleToStripeLocale(locale: string): string {
    // Stripe supported locales as of 2023:
    // https://stripe.com/docs/js/appendix/supported_locales
    const stripeLocales = [
      'bg',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'es',
      'et',
      'fi',
      'fil',
      'fr',
      'hr',
      'hu',
      'id',
      'it',
      'ja',
      'ko',
      'lt',
      'lv',
      'ms',
      'mt',
      'nb',
      'nl',
      'pl',
      'pt',
      'ro',
      'ru',
      'sk',
      'sl',
      'sv',
      'th',
      'tr',
      'vi',
      'zh',
    ];

    // First check if the exact locale is supported
    if (stripeLocales.includes(locale)) {
      return locale;
    }

    // If not, try to get the base language
    const baseLocale = locale.split('-')[0];
    if (stripeLocales.includes(baseLocale)) {
      return baseLocale;
    }

    // Default to auto to let Stripe detect the language
    return 'auto';
  }
}
