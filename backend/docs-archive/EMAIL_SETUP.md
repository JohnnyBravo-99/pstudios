# Email setup (Nodemailer) — API & contact form

The marketing site **Contact** form calls:

`POST https://api.paradigmstudios.art/api/contact/intake`

The Express route uses **`nodemailer`** in `src/utils/email.js` to send mail to **`CONTACT_INTAKE_TO`** (default `jarnold@paradigmstudios.art`).

## Why you see “Unable to send your message right now”

That response is **HTTP 503** when `sendMail` fails **or** when **no email transport is configured** in production.

**Principle:** Nodemailer must have a **real SMTP (or Gmail) account** in environment variables. The inbox address (`CONTACT_INTAKE_TO`) is only **who receives** the message; it does **not** authenticate sending.

### Troubleshooting: 503 + logs show `535` / `EAUTH`

| What you see | Cause |
|----------------|--------|
| `Invalid login: 535 Authentication failed` | Wrong **SMTP password**, **SMTP_USER** is not the full Microsoft 365 sign-in address, or **[SMTP AUTH is disabled](#microsoft-365--godaddy-email-essentials)** for that mailbox. |
| `SMTP_PASSWORD` still a placeholder | Replace **`REPLACEME`** in **`envs/api.env`** with the real mailbox password (or an **app password** if MFA is on). |
| `EMAIL_TRANSPORT_NOT_CONFIGURED` | No Gmail/SMTP env, or SMTP password is empty / treated as a placeholder in production. |

After changing the password, **recreate** the API container so the new env is loaded: `docker compose up -d --force-recreate api`.

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

### Option B — Generic SMTP (SendGrid, Mailgun, ISP, etc.)

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

### Microsoft 365 / GoDaddy Email Essentials

If the mailbox is **Microsoft 365 Email Essentials** (sold through GoDaddy), outbound SMTP uses **Microsoft’s** servers, not your VPS host’s email.

**Typical settings (confirm in [GoDaddy’s Microsoft 365 server settings](https://www.godaddy.com/help/find-my-microsoft-365-server-settings-9012)):**

| Variable | Value |
|----------|--------|
| `SMTP_HOST` | `smtp.office365.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` (STARTTLS on 587 — our Nodemailer config sets `requireTLS` for 587) |
| `SMTP_USER` | Full email address (e.g. `you@paradigmstudios.art`) |
| `SMTP_PASSWORD` | That mailbox’s password, or a **Microsoft 365 app password** if the account uses MFA |
| `EMAIL_FROM` | Usually the **same** address as `SMTP_USER` (Microsoft often requires “send as” to match the authenticated mailbox) |

**Enable SMTP authentication:** For many tenants, SMTP AUTH must be turned on for the mailbox (admin) — see GoDaddy: [Enable SMTP authentication](https://www.godaddy.com/help/enable-smtp-authentication-40981).

**Principle:** `CONTACT_INTAKE_TO` can still be `jarnold@…` for **delivery**; `SMTP_USER` / `EMAIL_FROM` must be a mailbox that is allowed to **authenticate** to `smtp.office365.com` (often your primary sending address).

Example `envs/api.env` fragment:

```env
CONTACT_INTAKE_TO=jarnold@paradigmstudios.art
EMAIL_FROM=jarnold@paradigmstudios.art
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jarnold@paradigmstudios.art
SMTP_PASSWORD=your_microsoft365_password_or_app_password
```

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
