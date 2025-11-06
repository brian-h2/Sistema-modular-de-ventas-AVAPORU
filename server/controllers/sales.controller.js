import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";
import mongoose from "mongoose";


// Crea una venta y descuenta stock
export async function createSale(req, res) {

  try {

    const { productos: items } = req.body;
    const { cliente, total, fecha } = req.body;

    if (!items.length) return res.status(400).json({ error: "Sin items" });

    const mapeados = [];
    let stockDisponible = 0;

    for (const it of items) {
      let prod = null;


      // 1️⃣ Intentar buscar por ID si es válido
      if (mongoose.Types.ObjectId.isValid(it.productId)) {
        prod = await Product.findById(it.productId);
      }

      // 2️⃣ Si no lo encontró por SKU, intentar por nombre
      if (!prod) {
        prod = await Product.findOne({ sku: it.productId });
      }


      if (!prod) {
        throw new Error(`Producto no encontrado: ${it.productId}`);
      }

      if (prod.stockDisponible < it.quantity) {
        throw new Error(`Stock insuficiente para ${prod.nombre}`);
      }

      stockDisponible = prod.stockDisponible - it.quantity;

      const precioUnitario = it.precioUnitario ?? prod.precio;
      mapeados.push({
        product: prod._id,
        sku: prod.sku,
        nombre: prod.nombre,
        cantidad: it.quantity,
        precioUnitario,
        subtotal: precioUnitario * it.quantity,
      });

    }

    // const total = mapeados.reduce((acc, it) => acc + it.subtotal, 0);
    const venta = await Sale.create({ items: mapeados, total, cliente });

    // Descontar stock
    await Promise.all(
      mapeados.map(it =>
        Product.findOneAndUpdate(
          { nombre: it.nombre },                // filtro por campo 'nombre'
          { $inc: { stockDisponible: -it.cantidad } } // actualización
        )
      )
    );

    res.status(201).json(venta);
  } catch (e) {
    console.error("Error creando la venta:", e.message);
    res.status(400).json({ error: e.message});
  }
}

export async function getSale(req, res) {
  
  try {
    const {id} = req.params;

    if (!id) {
      // Listar todas las ventas
      const sales = await Sale.find().populate("items.product");

      return res.json(sales);
    }

    // Obtener una venta por ID
    const sale = await Sale.findById(id).populate("items.product");
    if (!sale) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }
    

    res.json(sale);
  } catch (error) {
    console.error("Error obteniendo la venta:", error);
    res.status(500).json({ error: "Error del servidor" });
  }

}