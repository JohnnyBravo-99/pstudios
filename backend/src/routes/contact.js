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
    return res.status(503).json({
      error: 'Unable to send your message right now. Please try again later or reach us by phone or social media.',
    });
  }
});

module.exports = router;
