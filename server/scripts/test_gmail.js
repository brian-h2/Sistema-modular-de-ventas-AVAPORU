import { sendMail } from "../services/mailer.js";

async function run() {
  try {
    const res = await sendMail({
      to: "brianheredia200309@gmail.com",
      subject: "[AVAPORU] ¡Configuración Exitosa de Reportes!",
      html: "<div style='font-family:Arial,sans-serif;background:#10b981;color:#ffffff;padding:24px;border-radius:12px;'><h1>¡Excelente! Correo conectado con éxito</h1><p>Tu cuenta de Gmail está configurada y lista para emitir reportes automáticos en Sistema AVAPORU.</p></div>"
    });
    console.log("SUCCESS_GMAIL_DELIVERED:", res);
  } catch (err) {
    console.error("FAILURE:", err);
  }
}

run();
