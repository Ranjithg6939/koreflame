/**
 * KoreFlame - Email Delivery Service
 * Secure token delivery for email verification and password resets.
 */

const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

async function sendEmail({ to, subject, html, text }) {
  if (!isConfigured) {
    // Development fallback: Log link to server terminal safely
    console.log('\n================== [KoreFlame Email Notification] ==================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Content:\n' + (text || html));
    console.log('====================================================================\n');
    return {
      sent: true,
      mode: 'development_console',
      message: 'Email logged to server console (SMTP provider not configured).'
    };
  }

  // If SMTP is configured, we can dispatch via nodemailer
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'KoreFlame <concierge@koreflame.com>',
      to,
      subject,
      text,
      html
    });

    return { sent: true, mode: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error('[KoreFlame Email Error]', err);
    throw new Error('Email delivery failed. Please verify your SMTP server configuration.');
  }
}

async function sendPasswordResetEmail(email, resetUrl) {
  const subject = 'Reset Your KoreFlame Dining Account Password';
  const text = `Hello,\n\nA password reset request was received for your KoreFlame account.\nClick the link below to set a new password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not make this request, please ignore this email. Your account remains secure.\n\nWarm regards,\nKoreFlame Concierge Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #151210; color: #FAF3E7; border-radius: 12px; border: 1px solid #374151;">
      <h2 style="color: #FF7628; margin-top: 0;">KoreFlame Korean BBQ</h2>
      <p style="color: #D1C7BA;">Hello,</p>
      <p style="color: #D1C7BA;">We received a request to reset the password for your KoreFlame dining account.</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #E63924; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #9CA3AF; font-size: 0.85rem;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html, text });
}

async function sendVerificationEmail(email, verifyUrl) {
  const subject = 'Verify Your KoreFlame Dining Account';
  const text = `Welcome to KoreFlame!\n\nPlease verify your email address by visiting this link:\n\n${verifyUrl}\n\nWarm regards,\nKoreFlame Concierge Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #151210; color: #FAF3E7; border-radius: 12px; border: 1px solid #374151;">
      <h2 style="color: #FF7628; margin-top: 0;">Welcome to KoreFlame!</h2>
      <p style="color: #D1C7BA;">Thank you for joining KoreFlame Club. Please verify your email to unlock your table reservation privileges and claim 200 welcome loyalty points.</p>
      <div style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background: #E63924; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html, text });
}

module.exports = {
  isConfigured,
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};
