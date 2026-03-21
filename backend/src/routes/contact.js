const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

const { sendContactIntakeEmail } = require('../utils/email');

const router = express.Router();

/** Stricter cap for anonymous public submissions (abuse / spam). */
const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions from this address. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const intakeSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  email: Joi.string().trim().email().max(254).required(),
  subject: Joi.string().trim().min(1).max(200).required(),
  message: Joi.string().trim().min(1).max(8000).required(),
});

/**
 * POST /api/contact/intake
 * Body: { name, email, subject, message }
 */
router.post('/intake', intakeLimiter, async (req, res) => {
  const { error, value } = intakeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Please check your entries and try again.',
      details: error.details.map((d) => d.message),
    });
  }

  try {
    await sendContactIntakeEmail(value);
    return res.status(200).json({ ok: true, message: 'Your message was sent.' });
  } catch (err) {
    console.error('Contact intake route error:', err);
    if (err.code === 'EAUTH') {
      console.error(
        '[contact/intake] SMTP authentication failed (535). Check SMTP_USER / SMTP_PASSWORD, EMAIL_FROM vs mailbox, SMTP AUTH enabled (Microsoft 365), and docs-archive/EMAIL_SETUP.md'
      );
    }
    if (err.code === 'EMAIL_TRANSPORT_NOT_CONFIGURED') {
      console.error('[contact/intake] No email transport (missing Gmail/SMTP or SMTP_PASSWORD still a placeholder).');
    }
    if (process.env.NODE_ENV === 'development' && err.code === 'EMAIL_TRANSPORT_NOT_CONFIGURED') {
      return res.status(503).json({
        error:
          'Email is not configured on this server. Set Gmail or SMTP in env (see backend/docs-archive/EMAIL_SETUP.md).',
      });
    }
    return res.status(503).json({
      error: 'Unable to send your message right now. Please try again later or reach us by phone or social media.',
    });
  }
});

module.exports = router;
