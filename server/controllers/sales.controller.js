import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";

// Crea una venta y descuenta stock
export async function createSale(req, res) {
  try {
    const { items = [], cliente } = req.body;
    if (!items.length) return res.status(400).json({ error: "Sin items" });

    const mapeados = [];
    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) throw new Error("Producto inexistente");
      if (prod.stockDisponible < it.cantidad) {
        throw new Error(`Stock insuficiente para ${prod.nombre}`);
      }
      const precioUnitario = it.precioUnitario ?? prod.precio;
      mapeados.push({
        product: prod._id,
        cantidad: it.cantidad,
        precioUnitario,
        subtotal: precioUnitario * it.cantidad,
      });
    }

    const total = mapeados.reduce((acc, it) => acc + it.subtotal, 0);
    const venta = await Sale.create({ items: mapeados, total, cliente });

    // Descontar stock
    await Promise.all(
      mapeados.map(it =>
        Product.findByIdAndUpdate(it.product, { $inc: { stockDisponible: -it.cantidad } })
      )
    );

    res.status(201).json(venta);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getSale(req, res) {
  const sale = await Sale.findById(req.params.id).populate("items.product");
  if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
  res.json(sale);
}