import Product from "../models/product.model.js";

export async function listProducts(req, res) {
  const productos = await Product.find().sort({ nombre: 1 });
  res.json(productos);
}

export async function createProduct(req, res) {
  try {
    const nuevo = await Product.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const upd = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!upd) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(upd);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}