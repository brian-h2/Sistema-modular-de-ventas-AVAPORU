import ScheduledReport from "../models/scheduledReport.model.js";
import { buildReportData, renderReportHtml, rangoPorFrecuencia } from "../services/reportData.js";
import { sendMail, isMailerConfigured } from "../services/mailer.js";

export async function listSchedules(req, res) {
  const items = await ScheduledReport.find().sort({ createdAt: -1 });
  res.json(items);
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

    res.status(201).json(schedule);
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
  await ScheduledReport.findByIdAndDelete(req.params.id);
  res.json({ message: "Reporte programado eliminado" });
}

/** Envía el reporte de un schedule ahora mismo, sin esperar al cron (para probar). */
export async function sendScheduleNow(req, res) {
  try {
    if (!isMailerConfigured()) {
      return res.status(503).json({ error: "El envío de emails no está configurado en el servidor (faltan variables SMTP_*)." });
    }

    const schedule = await ScheduledReport.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Reporte programado no encontrado" });

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

    res.json({ message: `Reporte enviado a ${schedule.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
