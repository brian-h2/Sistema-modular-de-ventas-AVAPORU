import { Router } from "express";
import {
  listarReportes,
  crearReporte,
  borrarReporte
} from "../controllers/reports.controller.js";

const r = Router();

r.get("/", listarReportes);
r.post("/", crearReporte);
r.delete("/:id", borrarReporte);

export default r;
