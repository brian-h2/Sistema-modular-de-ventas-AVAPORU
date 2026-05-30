export interface SaleItem {
  product?: string;
  cantidad: number;
  precioUnitario: number;
  nombre: string;
}

export interface Sale {
  _id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: "CREADA" | "PAGADA" | "FACTURADA" | "CANCELADA";
  items: SaleItem[];
  notas: string;
  vendedor?: {
    _id: string;
    nombre: string;
    email: string;
  } | null;
}
