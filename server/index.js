import "dotenv/config";

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import {
  connectDB
} from "./db.js";


import productsRouter
  from "./routes/products.routes.js";

import salesRouter
  from "./routes/sales.routes.js";

import expensesRouter
  from "./routes/expenses.routes.js";

import authRouter
  from "./routes/auth.routes.js";

import reportesRouter
  from "./routes/reports.routes.js";

import scheduledReportsRouter
  from "./routes/scheduledReports.routes.js";

import paymentsRoutes
  from "./routes/payments.routes.js";

import invoicesRoutes
  from "./routes/invoices.routes.js";


import {
  authRequired
} from "./middlewares/auth.middleware.js";


import {
  iniciarSchedulerReportes
} from "./services/scheduler.js";


const app =
  express();


/*
 * ============================================================
 * SWAGGER
 * ============================================================
 */

const swaggerDocument =
  YAML.load(
    "swagger.yaml"
  );


app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerDocument
  )
);


/*
 * ============================================================
 * MIDDLEWARES
 * ============================================================
 */

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite solicitudes sin origen (mobile/Postman) o cualquier origen web devolviendo el origen del cliente
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);


app.use(
  express.json()
);


/*
 * ============================================================
 * RUTAS PÚBLICAS
 * ============================================================
 */

app.get(
  "/",
  (req, res) => {
    res.send(
      "API funcionando 🚀"
    );
  }
);


app.get(
  "/health",
  (req, res) =>
    res.json({
      ok: true
    })
);


app.use(
  "/auth",
  authRouter
);


/*
 * ============================================================
 * RUTAS DEL SISTEMA
 * ============================================================
 */

app.use(
  "/products",
  authRequired,
  productsRouter
);


app.use(
  "/sales",
  authRequired,
  salesRouter
);


app.use(
  "/expenses",
  authRequired,
  expensesRouter
);


/*
 * Mercado Pago maneja internamente
 * qué rutas requieren autenticación.
 *
 * El webhook debe quedar público.
 */
app.use(
  "/payments",
  paymentsRoutes
);


/*
 * Comprobantes internos.
 */
app.use(
  "/invoices",
  invoicesRoutes
);


app.use(
  "/reportes",
  authRequired,
  reportesRouter
);


app.use(
  "/scheduled-reports",
  authRequired,
  scheduledReportsRouter
);


/*
 * ============================================================
 * INICIAR SERVIDOR
 * ============================================================
 */

const PORT =
  process.env.PORT ||
  4000;


app.listen(
  PORT,
  async () => {
    try {
      await connectDB(
        process.env.MONGODB_URI
      );


      console.log(
        `🚀 API en http://localhost:${PORT}`
      );


      iniciarSchedulerReportes();

    } catch (error) {
      console.error(
        "Error iniciando servidor:",
        error
      );
    }
  }
);