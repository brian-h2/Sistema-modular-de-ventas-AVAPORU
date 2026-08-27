import {
  Router
} from "express";

import {
  generarComprobante,
  descargarComprobantePDF
} from "../controllers/invoices.controller.js";

import {
  authRequired
} from "../middlewares/auth.middleware.js";


const router =
  Router();


/*
 * Generar comprobante.
 *
 * PAGADA → FACTURADA
 */
router.post(
  "/:saleId/generate",
  authRequired,
  generarComprobante
);


/*
 * Descargar PDF.
 */
router.get(
  "/:saleId/pdf",
  authRequired,
  descargarComprobantePDF
);


export default router;