const nodemailer = require('nodemailer');

// Create transporter based on environment configuration
function createTransporter() {
  // For development, use a mock/console transporter if email is not configured
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    return {
      sendMail: async (options) => {
        console.log('📧 [DEV MODE] Email would be sent:');
        console.log('  To:', options.to);
        console.log('  Subject:', options.subject);
        console.log('  Text:', options.text);
        console.log('  HTML:', options.html);
        return { messageId: 'dev-mock-' + Date.now() };
      }
    };
  }

  // Production email configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Custom SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

const transporter = createTransporter();

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@paradigmstudios.art',
    to: email,
    subject: 'Password Reset Request - Paradigm Studios',
    text: `You requested a password reset. Click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006699;">Password Reset Request</h2>
        <p>You requested a password reset for your Paradigm Studios admin account.</p>
        <p><a href="${resetUrl}" style="background-color: #006699; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send password setup email (for initial admin setup)
 * @param {string} email - Recipient email address
 * @param {string} setupToken - Password setup token
 */
async function sendPasswordSetupEmail(email, setupToken) {
  const setupUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/admin/setup-password?token=${setupToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@paradigmstudios.art',
    to: email,
    subject: 'Set Up Your Admin Password - Paradigm Studios',
    text: `Welcome! Please set up your admin password by clicking the following link:\n\n${setupUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006699;">Welcome to Paradigm Studios Admin</h2>
        <p>Please set up your admin password by clicking the link below:</p>
        <p><a href="${setupUrl}" style="background-color: #006699; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Up Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${setupUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password setup email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password setup email:', error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordSetupEmail
};
