export interface SaleItem {
  product?: string;

  sku?: string;

  cantidad: number;

  precioUnitario: number;

  nombre: string;

  subtotal?: number;
}


export interface PaymentInfo {
  metodo?:
    | "MERCADO_PAGO"
    | "EFECTIVO"
    | "TRANSFERENCIA"
    | "TARJETA_DEBITO"
    | "TARJETA_CREDITO"
    | "OTRO";

  estado?:
    | "PENDIENTE"
    | "APROBADO"
    | "RECHAZADO"
    | "CANCELADO";

  preferenceId?:
    string;

  paymentId?:
    string;

  fechaPago?:
    string;
}


export interface InvoiceInfo {
  numero:
    string;

  fechaEmision:
    string;

  tipo:
    string;

  condicionCliente:
    string;

  validezFiscal:
    boolean;
}


export interface Sale {
  _id:
    string;

  cliente:
    string;

  fecha:
    string;

  total:
    number;

  estado:
    | "CREADA"
    | "PAGADA"
    | "FACTURADA"
    | "CANCELADA";

  items:
    SaleItem[];

  notas?:
    string;

  pago?:
    PaymentInfo;

  factura?:
    InvoiceInfo;

  vendedor?: {
    _id:
      string;

    nombre:
      string;

    email:
      string;
  } | null;
}