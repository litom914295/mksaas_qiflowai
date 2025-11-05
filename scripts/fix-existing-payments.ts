import { resolve } from 'path';
import { config } from 'dotenv';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { eq, isNull, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Stripe from 'stripe';
import { payment } from '../src/db/schema';

const connectionString =
  process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found');
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

async function fixExistingPayments() {
  console.log('\n🔧 Fixing existing payment records...\n');

  try {
    // Get all payment records with missing fields
    const payments = await db
      .select()
      .from(payment)
      .where(
        or(
          eq(payment.scene, null),
          eq(payment.paid, false),
          eq(payment.invoiceId, null)
        )
      );

    console.log(`Found ${payments.length} payment records to fix\n`);

    for (const p of payments) {
      console.log(`\n📝 Fixing Payment ID: ${p.id}`);
      console.log(`   Type: ${p.type}`);
      console.log(`   Subscription ID: ${p.subscriptionId}`);

      const updates: any = {};

      // Set scene based on type
      if (!p.scene) {
        if (p.type === 'subscription') {
          updates.scene = 'subscription';
          console.log('   ✓ Setting scene to: subscription');
        } else if (p.type === 'one-time') {
          updates.scene = 'lifetime';
          console.log('   ✓ Setting scene to: lifetime');
        }
      }

      // Get invoice info from Stripe if subscription exists
      if (p.subscriptionId && (!p.paid || !p.invoiceId)) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            p.subscriptionId
          );
          const latestInvoiceId = subscription.latest_invoice as string;

          if (latestInvoiceId) {
            const invoice = await stripe.invoices.retrieve(latestInvoiceId);

            if (!p.invoiceId) {
              updates.invoiceId = invoice.id;
              console.log(`   ✓ Setting invoice ID to: ${invoice.id}`);
            }

            if (!p.paid && invoice.paid) {
              updates.paid = true;
              console.log('   ✓ Setting paid to: true');
            }
          }
        } catch (error: any) {
          console.log(`   ⚠️  Could not fetch Stripe data: ${error.message}`);
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await db.update(payment).set(updates).where(eq(payment.id, p.id));
        console.log('   ✅ Updated successfully');
      } else {
        console.log('   ℹ️  No updates needed');
      }
    }

    console.log('\n\n✅ All payment records fixed!\n');
  } catch (error) {
    console.error('❌ Error fixing payments:', error);
    throw error;
  } finally {
    await client.end();
  }
}

fixExistingPayments()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
