'use client';

import { useState } from 'react';

// 支付系统集成
export interface PaymentConfig {
  provider: 'alipay' | 'wechat' | 'stripe';
  apiKey?: string;
  appId?: string;
  merchantId?: string;
  sandbox?: boolean;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

// 支付管理器
export class PaymentManager {
  private static instance: PaymentManager;
  private config: PaymentConfig;

  private constructor() {
    this.config = {
      provider: 'alipay',
      sandbox: process.env.NODE_ENV !== 'production'
    };
  }

  static getInstance(): PaymentManager {
    if (!this.instance) {
      this.instance = new PaymentManager();
    }
    return this.instance;
  }

  // 创建支付订单
  async createOrder(params: {
    amount: number;
    productId: string;
    userId: string;
    metadata?: any;
  }): Promise<PaymentOrder> {
    const order: PaymentOrder = {
      id: this.generateOrderId(),
      amount: params.amount,
      currency: 'CNY',
      description: this.getProductDescription(params.productId),
      userId: params.userId,
      metadata: params.metadata,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存订单到数据库
    await this.saveOrder(order);

    return order;
  }

  // 处理支付
  async processPayment(
    orderId: string,
    paymentMethod: 'alipay' | 'wechat'
  ): Promise<PaymentResult> {
    try {
      const order = await this.getOrder(orderId);
      
      if (!order) {
        return {
          success: false,
          error: '订单不存在'
        };
      }

      if (order.status !== 'pending') {
        return {
          success: false,
          error: '订单状态无效'
        };
      }

      // 更新订单状态
      await this.updateOrderStatus(orderId, 'processing');

      // 根据支付方式处理
      let result: PaymentResult;
      
      switch (paymentMethod) {
        case 'alipay':
          result = await this.processAlipay(order);
          break;
        case 'wechat':
          result = await this.processWechat(order);
          break;
        default:
          result = {
            success: false,
            error: '不支持的支付方式'
          };
      }

      // 更新订单状态
      if (result.success) {
        await this.updateOrderStatus(orderId, 'completed');
        await this.onPaymentSuccess(order);
      } else {
        await this.updateOrderStatus(orderId, 'failed');
      }

      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: '支付处理失败'
      };
    }
  }

  // 支付宝支付处理
  private async processAlipay(order: PaymentOrder): Promise<PaymentResult> {
    // 这里应该调用支付宝SDK
    // 示例代码，实际需要集成支付宝SDK
    
    const formData = {
      out_trade_no: order.id,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: order.amount,
      subject: order.description,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/notify`
    };

    // 模拟支付成功（开发环境）
    if (this.config.sandbox) {
      console.log('Alipay sandbox payment:', formData);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        orderId: order.id,
        transactionId: `ALIPAY_${Date.now()}`,
        redirectUrl: `/payment/success?orderId=${order.id}`
      };
    }

    // 生产环境调用真实API
    // const alipaySDK = new AlipaySdk({
    //   appId: this.config.appId,
    //   privateKey: this.config.apiKey,
    //   ...
    // });
    // 
    // const result = await alipaySDK.exec('alipay.trade.page.pay', formData);
    
    return {
      success: false,
      error: '请配置支付宝支付参数'
    };
  }

  // 微信支付处理
  private async processWechat(order: PaymentOrder): Promise<PaymentResult> {
    // 这里应该调用微信支付SDK
    // 示例代码，实际需要集成微信支付SDK
    
    const params = {
      appid: this.config.appId,
      mch_id: this.config.merchantId,
      out_trade_no: order.id,
      total_fee: Math.round(order.amount * 100), // 转换为分
      body: order.description,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
      trade_type: 'JSAPI' // 或 'NATIVE' 用于扫码支付
    };

    // 模拟支付成功（开发环境）
    if (this.config.sandbox) {
      console.log('WeChat sandbox payment:', params);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        orderId: order.id,
        transactionId: `WECHAT_${Date.now()}`,
        redirectUrl: `/payment/success?orderId=${order.id}`
      };
    }

    // 生产环境调用真实API
    // const wechatPay = new WechatPay({
    //   appid: this.config.appId,
    //   mchid: this.config.merchantId,
    //   privateKey: this.config.apiKey,
    //   ...
    // });
    //
    // const result = await wechatPay.transactions_jsapi(params);
    
    return {
      success: false,
      error: '请配置微信支付参数'
    };
  }

  // 验证支付回调
  async verifyCallback(
    provider: 'alipay' | 'wechat',
    params: any
  ): Promise<boolean> {
    // 验证签名等安全措施
    // 这里需要根据具体的支付提供商实现
    
    if (this.config.sandbox) {
      console.log('Payment callback verification:', { provider, params });
      return true;
    }

    // 实际验证逻辑
    switch (provider) {
      case 'alipay':
        // return this.verifyAlipaySignature(params);
        break;
      case 'wechat':
        // return this.verifyWechatSignature(params);
        break;
    }

    return false;
  }

  // 处理退款
  async processRefund(
    orderId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
    try {
      const order = await this.getOrder(orderId);
      
      if (!order) {
        return {
          success: false,
          error: '订单不存在'
        };
      }

      if (order.status !== 'completed') {
        return {
          success: false,
          error: '只能退款已完成的订单'
        };
      }

      const refundAmount = amount || order.amount;
      
      if (refundAmount > order.amount) {
        return {
          success: false,
          error: '退款金额不能超过订单金额'
        };
      }

      // 模拟退款（开发环境）
      if (this.config.sandbox) {
        await this.updateOrderStatus(orderId, 'refunded');
        
        return {
          success: true,
          orderId: orderId,
          transactionId: `REFUND_${Date.now()}`
        };
      }

      // 实际退款逻辑
      // ...

      return {
        success: false,
        error: '退款功能未配置'
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: '退款处理失败'
      };
    }
  }

  // 支付成功回调
  private async onPaymentSuccess(order: PaymentOrder) {
    // 解锁用户权限
    await this.unlockUserFeatures(order.userId!);
    
    // 发送通知
    await this.sendPaymentNotification(order);
    
    // 记录分析
    this.trackPaymentAnalytics(order);
  }

  // 解锁用户功能
  private async unlockUserFeatures(userId: string) {
    // TODO: 实现用户功能解锁
    console.log(`Unlocking features for user: ${userId}`);
    
    // 示例：更新用户权限
    // await db.users.update({
    //   where: { id: userId },
    //   data: {
    //     plan: 'professional',
    //     planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    //   }
    // });
  }

  // 发送支付通知
  private async sendPaymentNotification(order: PaymentOrder) {
    // TODO: 发送邮件/短信通知
    console.log('Sending payment notification:', order);
    
    // 示例：发送邮件
    // await emailService.send({
    //   to: order.userEmail,
    //   subject: '支付成功',
    //   template: 'payment-success',
    //   data: order
    // });
  }

  // 记录支付分析
  private trackPaymentAnalytics(order: PaymentOrder) {
    // 记录到分析系统
    if (typeof window !== 'undefined') {
      // Google Analytics事件
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: order.id,
          value: order.amount,
          currency: order.currency,
          items: [{
            id: order.metadata?.productId,
            name: order.description,
            category: 'professional',
            quantity: 1,
            price: order.amount
          }]
        });
      }
    }
  }

  // 辅助方法
  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `ORD_${timestamp}_${random}`.toUpperCase();
  }

  private getProductDescription(productId: string): string {
    const products: Record<string, string> = {
      'professional': 'AI风水大师专业版',
      'basic': 'AI风水大师基础版',
      'premium': 'AI风水大师高级版'
    };
    
    return products[productId] || '风水分析服务';
  }

  private async saveOrder(order: PaymentOrder) {
    // TODO: 保存到数据库
    console.log('Saving order:', order);
    
    // 暂时保存到localStorage（仅用于演示）
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }

  private async getOrder(orderId: string): Promise<PaymentOrder | null> {
    // TODO: 从数据库获取
    console.log('Getting order:', orderId);
    
    // 暂时从localStorage获取（仅用于演示）
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      return orders.find((o: PaymentOrder) => o.id === orderId) || null;
    }
    
    return null;
  }

  private async updateOrderStatus(
    orderId: string,
    status: PaymentOrder['status']
  ) {
    // TODO: 更新数据库
    console.log('Updating order status:', { orderId, status });
    
    // 暂时更新localStorage（仅用于演示）
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const index = orders.findIndex((o: PaymentOrder) => o.id === orderId);
      if (index !== -1) {
        orders[index].status = status;
        orders[index].updatedAt = new Date();
        localStorage.setItem('orders', JSON.stringify(orders));
      }
    }
  }
}

// 支付按钮组件的辅助Hook
export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (
    amount: number,
    productId: string,
    paymentMethod: 'alipay' | 'wechat'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const manager = PaymentManager.getInstance();
      
      // 创建订单
      const order = await manager.createOrder({
        amount,
        productId,
        userId: 'user_' + Date.now(), // TODO: 从用户会话获取
        metadata: { productId }
      });

      // 处理支付
      const result = await manager.processPayment(order.id, paymentMethod);
      
      if (result.success) {
        // 跳转到支付成功页面或显示二维码
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
        return result;
      } else {
        setError(result.error || '支付失败');
        return result;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('支付处理出错');
      return { success: false, error: '支付处理出错' };
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    loading,
    error
  };
}
