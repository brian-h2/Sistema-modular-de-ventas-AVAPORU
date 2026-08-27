import "dotenv/config";
import nodemailer from "nodemailer";

let transporter = null;

export async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = (process.env.SMTP_USER || "").trim();
  const rawPass = (process.env.SMTP_PASS || "").trim();
  const pass = rawPass.replace(/["']/g, "").replace(/\s+/g, "");

  if (user && pass) {
    console.log(`📡 [Mailer] Inicializando SMTP con ${host}:${port} para ${user}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  // Fallback de desarrollo para no bloquear el flujo si no hay SMTP configurado
  console.log("ℹ️ [Mailer] No hay SMTP_* en .env. Creando transporter de prueba (Ethereal)...");
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  transporter._isTest = true;
  return transporter;
}

export function isMailerConfigured() {
  return true; // Siempre habilitado (vía SMTP configurado o fallback de prueba)
}

export async function sendMail({ to, subject, html }) {
  const t = await getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || '"AVAPORU Reportes" <reportes@avaporu.com>';

  const info = await t.sendMail({ from, to, subject, html });
  console.log(`✉️ Correo enviado a ${to} - Asunto: ${subject}`);
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log(`🔗 Vista previa del correo de prueba: ${preview}`);
  }
  return { messageId: info.messageId, previewUrl: preview || null };
}
