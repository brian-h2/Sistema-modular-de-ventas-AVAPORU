import nodemailer from "nodemailer";

let transporter = null;

/**
 * El transporter se crea recién en el primer uso (no al importar el módulo)
 * para que el server pueda arrancar aunque todavía no estén configuradas
 * las variables de entorno SMTP_*.
 */
function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Faltan variables de entorno SMTP_HOST, SMTP_PORT, SMTP_USER y/o SMTP_PASS para enviar emails."
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true para 465 (SSL), false para 587 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export function isMailerConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
}

export async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await t.sendMail({ from, to, subject, html });
}
