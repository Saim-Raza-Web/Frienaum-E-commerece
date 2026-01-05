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
      subject: 'Passwort zurücksetzen - Feinraum Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Passwort zurücksetzen</h2>
          <p>Hallo ${name},</p>
          <p>Sie haben kürzlich eine Zurücksetzung Ihres Passworts angefordert. Klicken Sie auf die Schaltfläche unten, um es zurückzusetzen:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Passwort zurücksetzen</a>
          </div>
          <p>Wenn Sie dies nicht angefordert haben, ignorieren Sie bitte diese E-Mail. Der Link läuft in 1 Stunde ab.</p>
          <p>Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Diese E-Mail wurde von ${process.env.FROM_NAME || 'Feinraum Shop'} gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.</p>
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
      subject: 'Willkommen bei Feinraum Shop!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Willkommen bei Feinraum Shop!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hallo ${name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Vielen Dank, dass Sie ein Konto bei Feinraum Shop erstellt haben! Wir freuen uns, Sie als Teil unserer Community begrüßen zu dürfen.</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Ihr Konto wurde erfolgreich erstellt. Sie können jetzt:</p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>Unsere große Auswahl an Produkten durchsuchen</li>
              <li>Artikel sicher in den Warenkorb legen und bezahlen</li>
              <li>Ihre Bestellungen verfolgen</li>
              <li>Ihr Profil und Ihre Einstellungen verwalten</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}" style="background-color: #a97f57; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Einkaufen beginnen</a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">Bei Fragen oder wenn Sie Hilfe benötigen, zögern Sie bitte nicht, unser Support-Team zu kontaktieren.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">Diese E-Mail wurde von Feinraum Shop gesendet. Wenn Sie dieses Konto nicht erstellt haben, kontaktieren Sie bitte sofort unser Support-Team.</p>
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
    subject: `Bestellbestätigung - Bestellung #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Bestellung bestätigt!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Vielen Dank für Ihren Einkauf</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hallo ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Ihre Bestellung wurde erfolgreich aufgegeben! Hier sind die Details:
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Bestellung #${orderDetails.orderId}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Produkt</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Menge</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #e9ecef; font-weight: bold;">
                  <td colspan="2" style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">Gesamtbetrag:</td>
                  <td style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">${orderDetails.totalAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Wir senden Ihnen eine weitere E-Mail, wenn Ihre Bestellung versendet wird. Sie können den Status Ihrer Bestellung verfolgen, indem Sie sich in Ihr Konto einloggen.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/orders"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Ihre Bestellungen ansehen
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Fragen zu Ihrer Bestellung? Kontaktieren Sie unser Support-Team unter
            <a href="mailto:support@feinraumshop.ch" style="color: #667eea;">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
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
    subject: `Neue Bestellung erhalten - Bestellung #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Neue Bestellung!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Sie haben eine neue Bestellung erhalten</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hallo ${merchantName},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Herzlichen Glückwunsch! Sie haben eine neue Bestellung erhalten. Hier sind die Details:
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div>
                <strong>Bestellung #${orderDetails.orderId}</strong>
              </div>
              <div>
                <strong>Kunde:</strong> ${orderDetails.customerName} (${orderDetails.customerEmail})
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Produkt</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Menge</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #e9ecef; font-weight: bold;">
                  <td colspan="2" style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">Gesamtbetrag:</td>
                  <td style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">${orderDetails.totalAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              ⚡ Aktion erforderlich: Bitte bearbeiten Sie diese Bestellung innerhalb von 24 Stunden, um die Kundenzufriedenheit zu gewährleisten.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/merchant/orders"
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Bestelldetails ansehen
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Hilfe bei der Bestellbearbeitung benötigt? Kontaktieren Sie unser Support-Team unter
            <a href="mailto:support@feinraumshop.ch" style="color: #28a745;">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
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
      title: 'Bestellung wird bearbeitet',
      message: 'Ihre Bestellung wird nun bearbeitet. Wir senden Ihnen ein weiteres Update, wenn sie versendet wird.',
      color: '#ffc107'
    },
    'SHIPPED': {
      title: 'Bestellung versendet!',
      message: 'Ihre Bestellung wurde versendet und ist auf dem Weg zu Ihnen.',
      color: '#17a2b8'
    },
    'DELIVERED': {
      title: 'Bestellung zugestellt',
      message: 'Ihre Bestellung wurde erfolgreich zugestellt. Vielen Dank für Ihren Einkauf bei uns!',
      color: '#28a745'
    },
    'CANCELLED': {
      title: 'Bestellung storniert',
      message: 'Ihre Bestellung wurde storniert. Bei Fragen kontaktieren Sie bitte unser Support-Team.',
      color: '#dc3545'
    }
  };

  const statusInfo = statusMessages[orderDetails.status as keyof typeof statusMessages] || {
    title: 'Bestellstatus aktualisiert',
    message: `Der Status Ihrer Bestellung wurde auf ${orderDetails.status} aktualisiert.`,
    color: '#6c757d'
  };

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
    to: email,
    subject: `${statusInfo.title} - Bestellung #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${statusInfo.color}; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${statusInfo.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Bestellung #${orderDetails.orderId}</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hallo ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${statusInfo.message}
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #333;">Bestelldetails</h3>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">
              Gesamt: ${orderDetails.totalAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${orderDetails.currency}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/orders"
               style="background: ${statusInfo.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Bestellung verfolgen
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Fragen zu Ihrer Bestellung? Kontaktieren Sie unser Support-Team unter
            <a href="mailto:support@feinraumshop.ch" style="color: ${statusInfo.color};">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
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
    subject: `Willkommen bei Feinraum - Ihr Store "${storeName}" ist bereit!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Willkommen bei Feinraum!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Ihre Händler-Reise beginnt jetzt</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hallo ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Herzlichen Glückwunsch! Ihr Store <strong>"${storeName}"</strong> wurde erfolgreich auf der Feinraum-Marktplattform erstellt.
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Was kommt als Nächstes?</h3>
            <div style="space-y: 10px;">
              <div style="display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">1</span>
                <span style="color: #333;">Fügen Sie Ihre ersten Produkte zu Ihrem Store hinzu</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">2</span>
                <span style="color: #333;">Passen Sie Ihre Store-Einstellungen an</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">3</span>
                <span style="color: #333;">Beginnen Sie, Bestellungen von Kunden zu erhalten</span>
              </div>
            </div>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              📋 Wichtig: Ihr Store befindet sich derzeit im Genehmigungsprozess. Wir werden ihn innerhalb von 24 Stunden überprüfen und Sie benachrichtigen, sobald er live ist.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/merchant"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Zum Händler-Dashboard
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Fragen zum Verkaufen auf Feinraum? Kontaktieren Sie unseren Händler-Support unter
            <a href="mailto:merchants@feinraumshop.ch" style="color: #667eea;">merchants@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
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
    subject: `Neue Anmeldung bei Ihrem Feinraum-Konto`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Konto-Anmeldungsbenachrichtigung</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Wir haben eine neue Anmeldung bei Ihrem Konto festgestellt</p>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hallo ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Wir möchten Sie darüber informieren, dass kürzlich auf Ihr Feinraum-Konto zugegriffen wurde. Wenn Sie das waren, ist keine weitere Aktion erforderlich.
          </p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Anmeldedetails:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 120px;">Zeit:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${new Date(loginDetails.loginTime).toLocaleString('de-CH')}</td>
              </tr>
              ${loginDetails.ipAddress ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">IP-Adresse:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${loginDetails.ipAddress}</td>
              </tr>
              ` : ''}
              ${loginDetails.location ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">Standort:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${loginDetails.location}</td>
              </tr>
              ` : ''}
              ${loginDetails.userAgent ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Gerät:</td>
                <td style="padding: 8px 0;">${loginDetails.userAgent.substring(0, 100)}${loginDetails.userAgent.length > 100 ? '...' : ''}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              🔐 Sicherheitshinweis: Wenn Sie sich nicht bei Ihrem Konto angemeldet haben, ändern Sie bitte sofort Ihr Passwort und kontaktieren Sie unser Support-Team.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/profile"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Kontoaktivität überprüfen
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 20px;">
            Diese Anmeldungsbenachrichtigung wurde automatisch gesendet. Sie können Ihre Konto-Sicherheitseinstellungen in Ihren Profileinstellungen verwalten.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Fragen zu Ihrem Konto? Kontaktieren Sie unser Support-Team unter
            <a href="mailto:support@feinraumshop.ch" style="color: #667eea;">support@feinraumshop.ch</a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
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
      subject: 'Ihr Passwort wurde geändert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Passwort erfolgreich geändert</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hallo ${name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Dies ist eine Bestätigung, dass Ihr Passwort erfolgreich geändert wurde.</p>
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Sicherheitshinweis:</strong> Wenn Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie bitte sofort unser Support-Team und erwägen Sie, Ihr Passwort zurückzusetzen.
              </p>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Für Ihre Sicherheit empfehlen wir:</p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>Verwendung eines starken, einzigartigen Passworts</li>
              <li>Nicht teilen Ihres Passworts mit anderen</li>
              <li>Aktivierung der Zwei-Faktor-Authentifizierung, falls verfügbar</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/profile" style="background-color: #a97f57; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Ihr Profil ansehen</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen oder Bedenken kontaktieren Sie bitte unser Support-Team.</p>
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
      subject: `Bestellbestätigung - Bestellung #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bestellung bestätigt!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Vielen Dank für Ihren Einkauf</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hallo ${customer.name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Vielen Dank für Ihre Bestellung! Wir freuen uns, Ihren Einkauf zu bearbeiten.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a97f57;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Bestelldetails</h3>
              <p style="margin: 5px 0;"><strong>Bestell-ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Gesamtbetrag:</strong> CHF ${totalAmount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
            </div>

            <h4 style="color: #333; margin: 20px 0 10px 0;">Bestellte Artikel:</h4>
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              ${items.map((item: any) => `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${item.product.title_en}</strong><br>
                      <span style="color: #666;">Menge: ${item.quantity}</span>
                    </div>
                    <span style="font-weight: bold;">CHF ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Was passiert als Nächstes?</strong><br>
                Wir bearbeiten Ihre Bestellung und senden Ihnen Versand-Updates. Sie erhalten eine E-Mail, wenn Ihre Bestellung versendet wird.
              </p>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Bei Fragen zu Ihrer Bestellung kontaktieren Sie bitte unser Support-Team.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/orders"
                 style="background: #a97f57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ihre Bestellungen ansehen
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
      subject: `Neue Bestellung erhalten - Bestellung #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Neue Bestellung erhalten!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sie haben eine neue Bestellung zu bearbeiten</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hallo ${merchant.user.name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Tolle Neuigkeiten! Sie haben eine neue Bestellung in Ihrem Store erhalten.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a97f57;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Bestellübersicht</h3>
              <p style="margin: 5px 0;"><strong>Bestell-ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Kunde:</strong> ${customer.name} (${customer.email})</p>
              <p style="margin: 5px 0;"><strong>Gesamtbetrag:</strong> CHF ${totalAmount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
              <p style="margin: 5px 0;"><strong>Lieferadresse:</strong> ${order.shippingAddress}</p>
            </div>

            <h4 style="color: #333; margin: 20px 0 10px 0;">Bestellte Artikel:</h4>
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              ${items.map((item: any) => `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${item.product.title_en}</strong><br>
                      <span style="color: #666;">Menge: ${item.quantity} | Preis: CHF ${item.price.toFixed(2)}</span>
                    </div>
                    <span style="font-weight: bold;">CHF ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Aktion erforderlich:</strong><br>
                Bitte aktualisieren Sie den Bestellstatus, während Sie diese Bestellung bearbeiten und versenden. Ihre Provision wird nach der Lieferung berechnet.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/merchant"
                 style="background: #a97f57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Bestellung verwalten
              </a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Denken Sie daran, den Bestellstatus zu aktualisieren, wenn Sie die Artikel versenden. Dies hilft, Ihre Kunden informiert zu halten.
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

export async function sendProductSubmissionForApprovalEmail(
  merchantEmail: string,
  merchantName: string,
  productTitle: string,
  productId: string
) {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: merchantEmail,
      subject: 'Produkt zur Genehmigung eingereicht - Feinraum Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Produkt eingereicht</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Ihr Produkt wurde zur Genehmigung eingereicht</p>
          </div>

          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Hallo ${merchantName},
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Vielen Dank! Ihr Produkt <strong>"${productTitle}"</strong> wurde erfolgreich zur Genehmigung eingereicht.
            </p>

            <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Nächste Schritte:</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">
                Unser Team wird Ihr Produkt innerhalb von 24-48 Stunden überprüfen. Sie erhalten eine E-Mail-Benachrichtigung, sobald Ihr Produkt genehmigt und veröffentlicht wurde.
              </p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                📋 Status: Ihr Produkt befindet sich im Genehmigungsprozess. Sie können den Status in Ihrem Händler-Dashboard verfolgen.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/merchant"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Zum Händler-Dashboard
              </a>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Fragen zu Ihrem Produkt? Kontaktieren Sie unseren Support unter
              <a href="mailto:merchants@feinraumshop.ch" style="color: #667eea;">merchants@feinraumshop.ch</a>
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 10px;">
              Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Product submission email sent successfully to ${merchantEmail}`);
  } catch (error) {
    console.error('Error sending product submission email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
    // Don't throw error - email failure shouldn't break the submission
  }
}

export async function sendProductApprovalEmail(
  merchantEmail: string,
  merchantName: string,
  productTitle: string,
  productId: string
) {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: merchantEmail,
      subject: 'Produkt genehmigt - Feinraum Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Produkt genehmigt!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Ihr Produkt wurde erfolgreich genehmigt</p>
          </div>

          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Hallo ${merchantName},
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Große Neuigkeiten! Ihr Produkt <strong>"${productTitle}"</strong> wurde genehmigt und ist jetzt auf der Plattform veröffentlicht.
            </p>

            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 0; color: #155724; font-weight: bold;">
                ✅ Status: Ihr Produkt ist jetzt live und für Kunden sichtbar!
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/merchant"
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Zum Händler-Dashboard
              </a>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Fragen zu Ihrem Produkt? Kontaktieren Sie unseren Support unter
              <a href="mailto:merchants@feinraumshop.ch" style="color: #28a745;">merchants@feinraumshop.ch</a>
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 10px;">
              Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Product approval email sent successfully to ${merchantEmail}`);
  } catch (error) {
    console.error('Error sending product approval email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
  }
}

export async function sendProductRejectionEmail(
  merchantEmail: string,
  merchantName: string,
  productTitle: string,
  productId: string,
  reason?: string
) {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: merchantEmail,
      subject: 'Produkt abgelehnt - Feinraum Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Produkt abgelehnt</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Ihr Produkt wurde nicht genehmigt</p>
          </div>

          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Hallo ${merchantName},
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Leider wurde Ihr Produkt <strong>"${productTitle}"</strong> nicht genehmigt.
            </p>

            ${reason ? `
            <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Ablehnungsgrund:</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">${reason}</p>
            </div>
            ` : ''}

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                📋 Nächste Schritte: Bitte überarbeiten Sie Ihr Produkt entsprechend den Richtlinien und reichen Sie es erneut zur Genehmigung ein.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/merchant"
                 style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Zum Händler-Dashboard
              </a>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Fragen zur Ablehnung? Kontaktieren Sie unseren Support unter
              <a href="mailto:merchants@feinraumshop.ch" style="color: #dc3545;">merchants@feinraumshop.ch</a>
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 10px;">
              Diese E-Mail wurde von Feinraum Shop gesendet. Bei Fragen kontaktieren Sie bitte unser Support-Team.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Product rejection email sent successfully to ${merchantEmail}`);
  } catch (error) {
    console.error('Error sending product rejection email:', error);
    if (isDevelopment) {
      console.log('Note: In development mode, emails are logged to console instead of being sent');
    }
  }
}

export async function sendOrderStatusUpdateToCustomer(orderData: any, oldStatus: string, newStatus: string) {
  try {
    const { customer, order, items } = orderData;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const statusMessages = {
      'PROCESSING': 'Ihre Bestellung wird nun bearbeitet',
      'SHIPPED': 'Ihre Bestellung wurde versendet!',
      'DELIVERED': 'Ihre Bestellung wurde zugestellt',
      'CANCELLED': 'Ihre Bestellung wurde storniert'
    };

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Feinraum Shop'}" <${process.env.FROM_EMAIL || 'support@feinraumshop.ch'}>`,
      to: customer.email,
      subject: `Bestellupdate - Bestellung #${order.id} - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a97f57 0%, #8e6a49 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bestellstatus aktualisiert</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${statusMessages[newStatus as keyof typeof statusMessages] || 'Der Bestellstatus hat sich geändert'}</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hallo ${customer.name},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Wir informieren Sie über Ihren Bestellstatus.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a97f57;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Bestelldetails</h3>
              <p style="margin: 5px 0;"><strong>Bestell-ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${oldStatus} → <strong>${newStatus}</strong></p>
              <p style="margin: 5px 0;"><strong>Gesamtbetrag:</strong> CHF ${totalAmount.toFixed(2)}</p>
            </div>

            ${newStatus === 'SHIPPED' ? `
            <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Versandinformationen:</strong><br>
                Ihre Bestellung wurde versendet! Sie sollten bald Tracking-Informationen erhalten, falls verfügbar.
              </p>
            </div>
            ` : ''}

            ${newStatus === 'DELIVERED' ? `
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Lieferbestätigung:</strong><br>
                Wir hoffen, Sie genießen Ihren Einkauf! Bitte erwägen Sie, eine Bewertung für die erhaltenen Produkte zu hinterlassen.
              </p>
            </div>
            ` : ''}

            ${newStatus === 'CANCELLED' ? `
            <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #721c24; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Bestellung storniert:</strong><br>
                Es tut uns leid, aber Ihre Bestellung wurde storniert. Bei Fragen kontaktieren Sie bitte unser Support-Team.
              </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/orders"
                 style="background: #a97f57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Bestelldetails ansehen
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
