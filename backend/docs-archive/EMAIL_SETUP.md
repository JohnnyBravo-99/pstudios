# Email setup (Nodemailer) — API & contact form

The marketing site **Contact** form calls:

`POST https://api.paradigmstudios.art/api/contact/intake`

The Express route uses **`nodemailer`** in `src/utils/email.js` to send mail to **`CONTACT_INTAKE_TO`** (default `jarnold@paradigmstudios.art`).

## Why you see “Unable to send your message right now”

That response is **HTTP 503** when `sendMail` fails **or** when **no email transport is configured** in production.

**Principle:** Nodemailer must have a **real SMTP (or Gmail) account** in environment variables. The inbox address (`CONTACT_INTAKE_TO`) is only **who receives** the message; it does **not** authenticate sending.

## Where to configure (VPS / Docker)

1. **File used by Compose:** check `docker-compose.yml` → `env_file`. Some deployments use `backend/.env`, others `backend/envs/api.env` — they are equivalent for Nodemailer; use whichever your Compose file references.
2. **SMTP password** can be set as `SMTP_PASSWORD=...` **or** (recommended if you avoid storing secrets in `.env`) `SMTP_PASSWORD_FILE=/usr/src/app/secrets/smtp_password.txt` with the password in a single-line file mounted into the API container (see `docker-compose.yml` `secrets` volume).
3. Edit on the server (e.g. `~/mernvps/backend/.env`).
4. **Restart** the API container after changes:

   ```bash
   cd /path/to/backend
   docker compose up -d --build api
   ```

5. **Check logs** if sending still fails:

   ```bash
   docker compose logs api --tail 80
   ```

   Look for `EMAIL_TRANSPORT_NOT_CONFIGURED`, SMTP errors, or Gmail auth errors.

## Required variables (pick **one** method)

### Option A — Gmail (app password)

Use a Google account that allows “App passwords” (2FA on, then create an app password).

In `envs/api.env`:

```env
NODE_ENV=production
CONTACT_INTAKE_TO=jarnold@paradigmstudios.art
EMAIL_FROM=noreply@paradigmstudios.art
EMAIL_SERVICE=gmail
EMAIL_USER=your.sender@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

- **`EMAIL_FROM`:** Must be an address Gmail is allowed to send as (often same as `EMAIL_USER`, or a verified alias).

### Option B — SMTP (Hostinger, SendGrid, Mailgun, your domain, etc.)

```env
NODE_ENV=production
CONTACT_INTAKE_TO=jarnold@paradigmstudios.art
EMAIL_FROM=noreply@paradigmstudios.art
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

Do **not** set `EMAIL_SERVICE=gmail` if you use pure SMTP unless you also supply Gmail fields.

## Code reference

| Piece | Location |
|--------|----------|
| Route | `backend/src/routes/contact.js` → `POST /api/contact/intake` |
| Send + Nodemailer | `backend/src/utils/email.js` → `sendContactIntakeEmail` |
| Recipient default | `CONTACT_INTAKE_TO` or `jarnold@paradigmstudios.art` |
| Example env | `backend/.env.example` |

## Local development

With `NODE_ENV=development` and **no** Gmail/SMTP variables, the API **logs** the email to the console instead of sending (see `mockTransporter` in `email.js`).

To test **real** sends locally, set Gmail or SMTP variables in `backend/.env.development` (or your local env file).

## CORS

The browser must be allowed to call the API (already configured in `src/index.js` for `https://www.paradigmstudios.art`). A **503** from this route is almost always **mail misconfiguration**, not CORS.
