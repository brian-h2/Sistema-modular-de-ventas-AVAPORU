import cron from "node-cron";
import ScheduledReport from "../models/scheduledReport.model.js";
import { buildReportData, renderReportHtml, rangoPorFrecuencia } from "./reportData.js";
import { sendMail, isMailerConfigured } from "./mailer.js";

const MS_POR_FRECUENCIA = {
  Diario: 24 * 60 * 60 * 1000,
  Semanal: 7 * 24 * 60 * 60 * 1000,
  Mensual: 30 * 24 * 60 * 60 * 1000,
};

function estaVencido(schedule) {
  if (!schedule.ultimoEnvio) return true;
  const intervalo = MS_POR_FRECUENCIA[schedule.frecuencia] ?? MS_POR_FRECUENCIA.Diario;
  return Date.now() - new Date(schedule.ultimoEnvio).getTime() >= intervalo;
}

export async function procesarReportesProgramados() {
  if (!isMailerConfigured()) {
    console.warn("⚠️  Reportes programados: SMTP no configurado, se omite el envío.");
    return;
  }

  const pendientes = await ScheduledReport.find({ activo: true });

  for (const schedule of pendientes) {
    if (!estaVencido(schedule)) continue;

    try {
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
      console.log(`✅ Reporte "${schedule.tipo}" enviado a ${schedule.email}`);
    } catch (err) {
      console.error(`❌ Error enviando reporte programado ${schedule._id}:`, err.message);
    }
  }
}

/**
 * Corre cada hora y decide, según ultimoEnvio y la frecuencia de cada
 * schedule, cuáles están vencidos y hay que mandar.
 */
export function iniciarSchedulerReportes() {
  cron.schedule("0 * * * *", () => {
    procesarReportesProgramados().catch((err) =>
      console.error("❌ Error en el ciclo de reportes programados:", err)
    );
  });
  console.log("🗓️  Scheduler de reportes automáticos iniciado (revisa cada hora)");
}
