import ScheduledReport from "../models/scheduledReport.model.js";
import { buildReportData, renderReportHtml, rangoPorFrecuencia } from "../services/reportData.js";
import { sendMail, isMailerConfigured } from "../services/mailer.js";

export async function listSchedules(req, res) {
  try {
    const items = await ScheduledReport.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createSchedule(req, res) {
  try {
    const { tipo, frecuencia, email } = req.body;
    if (!tipo || !frecuencia || !email) {
      return res.status(400).json({ error: "tipo, frecuencia y email son obligatorios" });
    }

    const schedule = await ScheduledReport.create({
      tipo,
      frecuencia,
      email,
      creadoPor: req.user?.id,
    });

    if (!isMailerConfigured()) {
      return res.status(201).json({
        ...schedule.toObject(),
        emailSent: false,
        message: `Reporte programado con éxito. (Configura SMTP_USER y SMTP_PASS en el servidor para habilitar el envío automático).`,
      });
    }

    // Enviar el primer reporte de inmediato al correo del usuario
    try {
      const { desde, hasta } = rangoPorFrecuencia(frecuencia);
      const data = await buildReportData(tipo, desde, hasta);
      const html = renderReportHtml(data, { frecuencia, desde, hasta });

      await sendMail({
        to: email,
        subject: `[AVAPORU] ${data.titulo} — Programado (${frecuencia})`,
        html,
      });

      schedule.ultimoEnvio = new Date();
      await schedule.save();

      return res.status(201).json({
        ...schedule.toObject(),
        emailSent: true,
        message: `Reporte programado exitosamente y enviado a ${email}`,
      });
    } catch (mailErr) {
      console.error("Aviso al enviar correo inicial:", mailErr.message);
      return res.status(201).json({
        ...schedule.toObject(),
        emailSent: false,
        message: `Reporte programado exitosamente (Aviso: No se pudo enviar el correo inicial: ${mailErr.message})`,
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function toggleSchedule(req, res) {
  try {
    const schedule = await ScheduledReport.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Reporte programado no encontrado" });

    schedule.activo = !schedule.activo;
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteSchedule(req, res) {
  try {
    await ScheduledReport.findByIdAndDelete(req.params.id);
    res.json({ message: "Reporte programado eliminado" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Envía el reporte de un schedule ahora mismo, sin esperar al cron (para probar). */
export async function sendScheduleNow(req, res) {
  try {
    const schedule = await ScheduledReport.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Reporte programado no encontrado" });

    if (!isMailerConfigured()) {
      return res.status(400).json({
        error: "El servicio de correo no está configurado (faltan SMTP_USER / SMTP_PASS en el servidor).",
      });
    }

    const { desde, hasta } = rangoPorFrecuencia(schedule.frecuencia);
    const data = await buildReportData(schedule.tipo, desde, hasta);
    const html = renderReportHtml(data, { frecuencia: schedule.frecuencia, desde, hasta });

    await sendMail({
      to: schedule.email,
      subject: `[AVAPORU] ${data.titulo} — ${schedule.frecuencia}`,
      html,
    });

    schedule.ultimoEnvio = new Date();
    await schedule.save();

    return res.json({ message: `Reporte enviado con éxito a ${schedule.email}` });
  } catch (err) {
    console.error("Error en sendScheduleNow:", err.message);
    return res.status(500).json({
      error: `Error al enviar correo: ${err.message}`,
    });
  }
}
