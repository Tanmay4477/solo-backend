import config from '../config';

/**
 * Email template for welcome emails
 * @param {string} firstName - User's first name
 * @param {string} verificationUrl - Email verification URL
 * @returns {object} Email subject and HTML body
 */
export const welcomeEmail = (
  firstName: string,
  verificationUrl: string
): { subject: string; html: string } => {
  const subject = `Welcome to SoloPreneur!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SoloPreneur</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .button { display: inline-block; background-color: #4a7bfa; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="logo">
        <h1>SoloPreneur</h1>
      </div>
      <div class="content">
        <h2>Welcome, ${firstName}!</h2>
        <p>Thank you for joining SoloPreneur. We're excited to have you on board!</p>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email</a>
        </p>
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SoloPreneur. All rights reserved.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

/**
 * Email template for password reset
 * @param {string} firstName - User's first name
 * @param {string} resetUrl - Password reset URL
 * @returns {object} Email subject and HTML body
 */
export const passwordResetEmail = (
  firstName: string,
  resetUrl: string
): { subject: string; html: string } => {
  const subject = `Reset Your SoloPreneur Password`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your SoloPreneur Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .button { display: inline-block; background-color: #4a7bfa; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="logo">
        <h1>SoloPreneur</h1>
      </div>
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello, ${firstName}!</p>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </p>
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SoloPreneur. All rights reserved.</p>
        <p>If you didn't request a password reset, please contact support.</p>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

/**
 * Email template for module unlock notification
 * @param {string} firstName - User's first name
 * @param {string} courseName - Course name
 * @param {string} moduleName - Module name
 * @param {string} moduleUrl - Module URL
 * @returns {object} Email subject and HTML body
 */
export const moduleUnlockEmail = (
  firstName: string,
  courseName: string,
  moduleName: string,
  moduleUrl: string
): { subject: string; html: string } => {
  const subject = `New Module Unlocked: ${moduleName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Module Unlocked</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .button { display: inline-block; background-color: #4a7bfa; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="logo">
        <h1>SoloPreneur</h1>
      </div>
      <div class="content">
        <h2>🎉 New Module Unlocked!</h2>
        <p>Hello, ${firstName}!</p>
        <p>Great news! A new module has been unlocked in your "${courseName}" course:</p>
        <h3>${moduleName}</h3>
        <p>Continue your learning journey by accessing this new content:</p>
        <p style="text-align: center;">
          <a href="${moduleUrl}" class="button">Start Learning</a>
        </p>
        <p>Happy learning!</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SoloPreneur. All rights reserved.</p>
        <p>You received this email because you're enrolled in one of our courses.</p>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

/**
 * Email template for payment receipt
 * @param {string} firstName - User's first name
 * @param {string} courseName - Course name
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 * @param {string} paymentDate - Payment date string
 * @param {string} invoiceUrl - Invoice URL
 * @returns {object} Email subject and HTML body
 */
export const paymentReceiptEmail = (
  firstName: string,
  courseName: string,
  amount: number,
  currency: string,
  paymentDate: string,
  invoiceUrl: string
): { subject: string; html: string } => {
  const subject = `Payment Receipt for ${courseName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .receipt { background-color: white; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background-color: #4a7bfa; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="logo">
        <h1>SoloPreneur</h1>
      </div>
      <div class="content">
        <h2>Payment Receipt</h2>
        <p>Hello, ${firstName}!</p>
        <p>Thank you for your payment. Below is your receipt:</p>
        <div class="receipt">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Date:</strong> ${paymentDate}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
        <p>You can view and download your invoice by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${invoiceUrl}" class="button">View Invoice</a>
        </p>
        <p>Thank you for choosing SoloPreneur!</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SoloPreneur. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

/**
 * Email template for payment reminder
 * @param {string} firstName - User's first name
 * @param {string} courseName - Course name
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 * @param {string} dueDate - Due date string
 * @param {string} paymentUrl - Payment URL
 * @returns {object} Email subject and HTML body
 */
export const paymentReminderEmail = (
  firstName: string,
  courseName: string,
  amount: number,
  currency: string,
  dueDate: string,
  paymentUrl: string
): { subject: string; html: string } => {
  const subject = `Payment Reminder for ${courseName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .reminder { background-color: white; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background-color: #4a7bfa; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="logo">
        <h1>SoloPreneur</h1>
      </div>
      <div class="content">
        <h2>Payment Reminder</h2>
        <p>Hello, ${firstName}!</p>
        <p>This is a friendly reminder that your next payment for "${courseName}" is due soon:</p>
        <div class="reminder">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please make your payment on time to ensure uninterrupted access to your course.</p>
        <p style="text-align: center;">
          <a href="${paymentUrl}" class="button">Make Payment</a>
        </p>
        <p>If you've already made this payment, please disregard this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SoloPreneur. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

/**
 * Email template for certificate issuance
 * @param {string} firstName - User's first name
 * @param {string} certificateTitle - Certificate title
 * @param {string} courseName - Course name
 * @param {string} certificateUrl - Certificate URL
 * @returns {object} Email subject and HTML body
 */
