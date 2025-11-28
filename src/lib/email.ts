import nodemailer from 'nodemailer';

// For development, use Gmail (you need to enable 2FA and generate app password)
const isDevelopment = process.env.NODE_ENV === 'development';

const APP_BASE_URL = (() => {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    process.env.APP_URL;
  const fallback = 'https://feinraumshop.ch';
  return (envUrl || fallback).replace(/\/$/, '');
})();

let transporter: nodemailer.Transporter;

if (isDevelopment) {
  // Use SMTP for development (configure with your email provider)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'support@feinraumshop.ch',
      pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'your-app-password',
    },
  });

  // Override sendMail to use real sending in development
  const originalSendMail = transporter.sendMail.bind(transporter);
  transporter.sendMail = async (mailOptions: any) => {
    try {
      const result = await originalSendMail(mailOptions);
      console.log('=== EMAIL SENT (Development Mode) ===');
      console.log('From: support@feinraumshop.ch');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Message ID:', result.messageId);
      console.log('✅ Email sent successfully!');
      console.log('=====================================');
      return result;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // Fallback to console logging if sending fails
      console.log('=== EMAIL SENT (Fallback - Console) ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('HTML:', mailOptions.html);
      console.log('=====================================');
      return { messageId: 'fallback-id' };
    }
  };
} else {
  // Production SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>You recently requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request this, please ignore this email. The link will expire in 1 hour.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">This email was sent from ${process.env.FROM_NAME || 'Your App'}. If you have any questions, please contact our support team.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: email,
      subject: 'Welcome to Feinraum Shop!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Feinraum Shop!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for creating an account with Feinraum Shop! We're excited to have you as part of our community.</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Your account has been successfully created. You can now:</p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>Browse our wide selection of products</li>
              <li>Add items to your cart and checkout securely</li>
              <li>Track your orders</li>
              <li>Manage your profile and preferences</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}" style="background-color: #a97f57; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Start Shopping</a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">This email was sent from Feinraum Shop. If you didn't create this account, please contact our support team immediately.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    // Don't throw error for welcome email - it's not critical
  }
}

export async function sendOrderConfirmationEmail(email: string, name: string, orderDetails: {
  orderId: string;
  totalAmount: number;
  currency: string;
  items: Array<{ productTitle: string; quantity: number; price: number }>;
}) {
  const itemsHtml = orderDetails.items.map(item =>
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productTitle}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
    to: email,
    subject: `Order Confirmation - Order #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Your order has been successfully placed! Here are the details:
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Order #${orderDetails.orderId}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #e9ecef; font-weight: bold;">
                  <td colspan="2" style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">${orderDetails.totalAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We'll send you another email when your order ships. You can track your order status by logging into your account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/orders"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Your Orders
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Questions about your order? Contact our support team at
            <a href="mailto:support@feinraumshop.ch" style="color: #667eea;">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This email was sent from Feinraum Shop. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

export async function sendOrderNotificationToMerchant(email: string, merchantName: string, orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  items: Array<{ productTitle: string; quantity: number; price: number }>;
}) {
  const itemsHtml = orderDetails.items.map(item =>
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productTitle}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
    to: email,
    subject: `New Order Received - Order #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Order!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">You have received a new order</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${merchantName},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Congratulations! You have received a new order. Here are the details:
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div>
                <strong>Order #${orderDetails.orderId}</strong>
              </div>
              <div>
                <strong>Customer:</strong> ${orderDetails.customerName} (${orderDetails.customerEmail})
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #e9ecef; font-weight: bold;">
                  <td colspan="2" style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">${orderDetails.totalAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              ⚡ Action Required: Please process this order within 24 hours to maintain customer satisfaction.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/merchant/orders"
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Need help with order processing? Contact our support team at
            <a href="mailto:support@feinraumshop.ch" style="color: #28a745;">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This email was sent from Feinraum Shop. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send merchant order notification:', error);
    throw error;
  }
}

export async function sendOrderStatusUpdateEmail(email: string, name: string, orderDetails: {
  orderId: string;
  status: string;
  totalAmount: number;
  currency: string;
}) {
  const statusMessages = {
    'PROCESSING': {
      title: 'Order Processing Started',
      message: 'Your order is now being processed. We\'ll send you another update when it ships.',
      color: '#ffc107'
    },
    'SHIPPED': {
      title: 'Order Shipped!',
      message: 'Your order has been shipped and is on its way to you.',
      color: '#17a2b8'
    },
    'DELIVERED': {
      title: 'Order Delivered',
      message: 'Your order has been successfully delivered. Thank you for shopping with us!',
      color: '#28a745'
    },
    'CANCELLED': {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
      color: '#dc3545'
    }
  };

  const statusInfo = statusMessages[orderDetails.status as keyof typeof statusMessages] || {
    title: 'Order Status Update',
    message: `Your order status has been updated to ${orderDetails.status}.`,
    color: '#6c757d'
  };

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
    to: email,
    subject: `${statusInfo.title} - Order #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${statusInfo.color}; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${statusInfo.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Order #${orderDetails.orderId}</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${statusInfo.message}
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #333;">Order Details</h3>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">
              Total: ${orderDetails.totalAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/orders"
               style="background: ${statusInfo.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Track Your Order
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Questions about your order? Contact our support team at
            <a href="mailto:support@feinraumshop.ch" style="color: ${statusInfo.color};">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This email was sent from Feinraum Shop. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    throw error;
  }
}

export async function sendMerchantWelcomeEmail(email: string, name: string, storeName: string) {
  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
    to: email,
    subject: `Welcome to Feinraum - Your store "${storeName}" is ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Feinraum!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your merchant journey begins now</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Congratulations! Your store <strong>"${storeName}"</strong> has been successfully created on Feinraum marketplace.
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">What's next?</h3>
            <div style="space-y: 10px;">
              <div style="display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">1</span>
                <span style="color: #333;">Add your first products to your store</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">2</span>
                <span style="color: #333;">Customize your store settings</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">3</span>
                <span style="color: #333;">Start receiving orders from customers</span>
              </div>
            </div>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              📋 Important: Your store is currently pending approval. We'll review it within 24 hours and notify you once it's live.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/merchant"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Merchant Dashboard
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Questions about selling on Feinraum? Contact our merchant support at
            <a href="mailto:merchants@feinraumshop.ch" style="color: #667eea;">merchants@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This email was sent from Feinraum Shop. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send merchant welcome email:', error);
    throw error;
  }
}

export async function sendLoginNotificationEmail(email: string, name: string, loginDetails: {
  ipAddress?: string;
  userAgent?: string;
  loginTime: string;
  location?: string;
}) {
  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
    to: email,
    subject: `New Login to Your Feinraum Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Account Login Notification</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">We detected a new login to your account</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We wanted to let you know that your Feinraum account was recently accessed. If this was you, no further action is required.
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Login Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 120px;">Time:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${new Date(loginDetails.loginTime).toLocaleString('de-CH')}</td>
              </tr>
              ${loginDetails.ipAddress ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">IP Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${loginDetails.ipAddress}</td>
              </tr>
              ` : ''}
              ${loginDetails.location ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${loginDetails.location}</td>
              </tr>
              ` : ''}
              ${loginDetails.userAgent ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Device:</td>
                <td style="padding: 8px 0;">${loginDetails.userAgent.substring(0, 100)}${loginDetails.userAgent.length > 100 ? '...' : ''}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              🔐 Security Notice: If you did not log in to your account, please change your password immediately and contact our support team.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/profile"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Review Account Activity
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 20px;">
            This login notification was sent automatically. You can manage your account security preferences in your profile settings.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Questions about your account? Contact our support team at
            <a href="mailto:support@feinraumshop.ch" style="color: #667eea;">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This email was sent from Feinraum Shop. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send login notification email:', error);
    throw error;
  }
}

export async function sendPasswordChangeNotification(email: string, name: string) {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: email,
      subject: 'Your Password Has Been Changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Changed Successfully</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">This is to confirm that your password has been successfully changed.</p>
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately and consider resetting your password.
              </p>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">For your security, we recommend:</p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>Using a strong, unique password</li>
              <li>Not sharing your password with anyone</li>
              <li>Enabling two-factor authentication if available</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/profile" style="background-color: #a97f57; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Your Profile</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">This email was sent from Feinraum Shop. If you have any questions or concerns, please contact our support team.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password change notification email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending password change notification email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    // Don't throw error for notification email - it's not critical
  }
}

// Order notification emails
export async function sendOrderConfirmationToCustomer(orderData: any) {
  try {
    const { customer, order, items } = orderData;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: customer.email,
      subject: `Order Confirmation - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${customer.name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your order! We're excited to process your purchase.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a97f57;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> CHF ${totalAmount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
            </div>

            <h4 style="color: #333; margin: 20px 0 10px 0;">Items Ordered:</h4>
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              ${items.map((item: any) => `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${item.product.title_en}</strong><br>
                      <span style="color: #666;">Quantity: ${item.quantity}</span>
                    </div>
                    <span style="font-weight: bold;">CHF ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>What happens next?</strong><br>
                We'll process your order and send you shipping updates. You'll receive an email when your order ships.
              </p>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions about your order, please contact our support team.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/orders"
                 style="background: #a97f57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Your Orders
              </a>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent successfully to ${customer.email}`);
    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    // Don't throw error for order emails - they shouldn't break the checkout process
  }
}

export async function sendNewOrderNotificationToMerchant(orderData: any) {
  try {
    const { merchant, order, items, customer } = orderData;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: merchant.user.email,
      subject: `New Order Received - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Order Received!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">You have a new order to fulfill</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${merchant.user.name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Great news! You've received a new order on your store.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a97f57;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Order Summary</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> CHF ${totalAmount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
              <p style="margin: 5px 0;"><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
            </div>

            <h4 style="color: #333; margin: 20px 0 10px 0;">Items Ordered:</h4>
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              ${items.map((item: any) => `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${item.product.title_en}</strong><br>
                      <span style="color: #666;">Quantity: ${item.quantity} | Price: CHF ${item.price.toFixed(2)}</span>
                    </div>
                    <span style="font-weight: bold;">CHF ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Action Required:</strong><br>
                Please update the order status as you process and ship this order. Your commission will be calculated after delivery.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/merchant"
                 style="background: #a97f57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Manage Order
              </a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Remember to update the order status when you ship the items. This helps keep your customers informed.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`New order notification email sent successfully to merchant ${merchant.user.email}`);
    return result;
  } catch (error) {
    console.error('Error sending new order notification email to merchant:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    // Don't throw error for order emails - they shouldn't break the checkout process
  }
}

export async function sendOrderStatusUpdateToCustomer(orderData: any, oldStatus: string, newStatus: string) {
  try {
    const { customer, order, items } = orderData;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const statusMessages = {
      'PROCESSING': 'Your order is now being processed',
      'SHIPPED': 'Your order has been shipped!',
      'DELIVERED': 'Your order has been delivered',
      'CANCELLED': 'Your order has been cancelled'
    };

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: customer.email,
      subject: `Order Update - Order #${order.id} - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Status Updated</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${statusMessages[newStatus as keyof typeof statusMessages] || 'Order status has changed'}</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${customer.name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">We're updating you on your order status.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a97f57;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${oldStatus} → <strong>${newStatus}</strong></p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> CHF ${totalAmount.toFixed(2)}</p>
            </div>

            ${newStatus === 'SHIPPED' ? `
            <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Shipping Information:</strong><br>
                Your order has been shipped! You should receive tracking information soon if available.
              </p>
            </div>
            ` : ''}

            ${newStatus === 'DELIVERED' ? `
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Delivery Confirmation:</strong><br>
                We hope you're enjoying your purchase! Please consider leaving a review for the products you received.
              </p>
            </div>
            ` : ''}

            ${newStatus === 'CANCELLED' ? `
            <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #721c24; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Order Cancelled:</strong><br>
                We're sorry, but your order has been cancelled. If you have any questions, please contact our support team.
              </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/orders"
                 style="background: #a97f57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Order Details
              </a>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent successfully to ${customer.email}`);
    return result;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    // Don't throw error for order emails - they shouldn't break the order update process
  }
}
