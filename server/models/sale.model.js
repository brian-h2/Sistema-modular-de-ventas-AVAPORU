import mongoose from "mongoose";


/*
 * ============================================================
 * ITEMS DE LA VENTA
 * ============================================================
 */

const saleItemSchema =
  new mongoose.Schema(
    {
      product: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },

      sku: {
        type: String,
        required: true
      },

      nombre: {
        type: String,
        required: true
      },

      cantidad: {
        type: Number,
        required: true,
        min: 1
      },

      precioUnitario: {
        type: Number,
        required: true,
        min: 0
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0
      }
    },
    {
      _id: false
    }
  );


/*
 * ============================================================
 * INFORMACIÓN DEL PAGO
 * ============================================================
 */

const paymentSchema =
  new mongoose.Schema(
    {
      metodo: {
        type: String,

        enum: [
          "MERCADO_PAGO",
          "EFECTIVO",
          "TRANSFERENCIA",
          "TARJETA_DEBITO",
          "TARJETA_CREDITO",
          "OTRO"
        ]
      },

      estado: {
        type: String,

        enum: [
          "PENDIENTE",
          "APROBADO",
          "RECHAZADO",
          "CANCELADO"
        ],

        default:
          "PENDIENTE"
      },

      preferenceId: {
        type: String
      },

      paymentId: {
        type: String
      },

      fechaPago: {
        type: Date
      }
    },
    {
      _id: false
    }
  );


/*
 * ============================================================
 * COMPROBANTE INTERNO
 * ============================================================
 *
 * IMPORTANTE:
 *
 * No representa una factura fiscal de ARCA.
 *
 * Es un comprobante interno generado por AVAPORU
 * para documentar una venta ya pagada.
 */

const invoiceSchema =
  new mongoose.Schema(
    {
      numero: {
        type: String,
        required: true
      },

      fechaEmision: {
        type: Date,
        default: Date.now
      },

      tipo: {
        type: String,
        default:
          "COMPROBANTE_VENTA"
      },

      condicionCliente: {
        type: String,
        default:
          "Consumidor Final"
      },

      validezFiscal: {
        type: Boolean,
        default: false
      }
    },
    {
      _id: false
    }
  );


/*
 * ============================================================
 * VENTA
 * ============================================================
 */

const saleSchema =
  new mongoose.Schema(
    {
      fecha: {
        type: Date,
        default: Date.now
      },

      cliente: {
        type: String
      },

      vendedor: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User"
      },

      items: {
        type: [
          saleItemSchema
        ],

        required: true
      },

      total: {
        type: Number,
        required: true,
        min: 0
      },

      estado: {
        type: String,

        enum: [
          "CREADA",
          "PAGADA",
          "FACTURADA",
          "CANCELADA"
        ],

        default:
          "CREADA"
      },

      /*
       * Información proveniente de Mercado Pago.
       */
      pago: {
        type:
          paymentSchema,

        default:
          undefined
      },

      /*
       * Comprobante interno AVAPORU.
       */
      factura: {
        type:
          invoiceSchema,

        default:
          undefined
      }
    },
    {
      timestamps: true
    }
  );


export default
  mongoose.models.Sale ||
  mongoose.model(
    "Sale",
    saleSchema
  );