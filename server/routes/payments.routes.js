import { Router } from "express";

import {
  createPaymentPreference,
  mercadoPagoWebhook
} from "../controllers/payments.controller.js";

import {
  authRequired
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/preference/:saleId",
  authRequired,
  createPaymentPreference
);

router.post(
  "/webhook",
  mercadoPagoWebhook
);

export default router;