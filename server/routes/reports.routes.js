import { Router } from "express";
import {
  listarReportes,
  crearReporte,
  borrarReporte,
  reporteVentas
} from "../controllers/reports.controller.js";

const r = Router();

r.get("/", listarReportes);
r.post("/", crearReporte);
r.delete("/:id", borrarReporte);
r.get("/ventas", reporteVentas);

export default r;
