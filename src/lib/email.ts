import nodemailer from 'nodemailer';

// For development, use Gmail (you need to enable 2FA and generate app password)
const isDevelopment = process.env.NODE_ENV === 'development';

let transporter: nodemailer.Transporter;

if (isDevelopment) {
  // Use Gmail for development (replace with your Gmail credentials)
  transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail service
    auth: {
      user: 'asif.saeed78650@gmail.com', // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password', // Use app password, not regular password
    },
  });

  // Override sendMail to use real sending in development
  const originalSendMail = transporter.sendMail.bind(transporter);
  transporter.sendMail = async (mailOptions: any) => {
    try {
      const result = await originalSendMail(mailOptions);
      console.log('=== EMAIL SENT TO YOUR GMAIL (Development Mode) ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Message ID:', result.messageId);
      console.log('✅ Email sent successfully to your Gmail!');
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
      from: `"${process.env.FROM_NAME || 'E-commerce App'}" <${process.env.FROM_EMAIL || 'asif.saeed78650@gmail.com'}>`,
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
