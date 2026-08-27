import "dotenv/config";
import dns from "node:dns";
import nodemailer from "nodemailer";

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

function ipv4Lookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  return dns.lookup(hostname, { ...options, family: 4, all: false }, callback);
}

let transporter = null;

export function isMailerConfigured() {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  return Boolean(user && pass);
}

export async function getTransporter() {
  if (transporter) return transporter;

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const user = (process.env.SMTP_USER || "").trim();
  const rawPass = (process.env.SMTP_PASS || "").trim();
  const pass = rawPass.replace(/["']/g, "").replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error(
      "El servicio de correo no está configurado. Asegúrate de definir SMTP_USER y SMTP_PASS en el archivo .env o en las variables de entorno de tu servidor."
    );
  }

  console.log(`📡 [Mailer] Inicializando SMTP (${host}:${port}) para ${user}`);

  const isSecure = port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    requireTLS: !isSecure,
    auth: { user, pass },
    lookup: ipv4Lookup,
    connectionTimeout: 10000, // 10 segundos max para handshake
    greetingTimeout: 10000,
    socketTimeout: 15000,    // 15 segundos max para socket
    tls: {
      rejectUnauthorized: false,
      servername: host,
    },
  });

  return transporter;
}

export async function sendMail({ to, subject, html }) {
  if (!isMailerConfigured()) {
    throw new Error(
      "Servicio de correo no configurado (faltan variables SMTP_USER / SMTP_PASS en el servidor)."
    );
  }

  const t = await getTransporter();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    '"AVAPORU Reportes" <reportes@avaporu.com>';

  const info = await t.sendMail({ from, to, subject, html });
  console.log(`✉️ Correo enviado a ${to} - Asunto: ${subject} (ID: ${info.messageId})`);
  return { messageId: info.messageId };
}
