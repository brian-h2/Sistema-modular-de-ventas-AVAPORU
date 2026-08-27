import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
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

}, { _id: false });


const paymentSchema = new mongoose.Schema({

  metodo: {
    type: String,
    enum: [
      "MERCADO_PAGO",
      "EFECTIVO",
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
    default: "PENDIENTE"
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

}, { _id: false });


const saleSchema = new mongoose.Schema({

  fecha: {
    type: Date,
    default: Date.now
  },

  cliente: {
    type: String
  },

  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: {
    type: [saleItemSchema],
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
    default: "CREADA"
  },

  pago: {
    type: paymentSchema,
    default: undefined
  }

}, {
  timestamps: true
});


export default mongoose.models.Sale ||
  mongoose.model(
    "Sale",
    saleSchema
  );