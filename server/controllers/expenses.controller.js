import Expense from "../models/expense.model.js";

export async function listExpenses(req, res) {
  const { desde, hasta } = req.query;
  const filtro = {};

  if (desde || hasta) filtro.fecha = {};
  if (desde) filtro.fecha.$gte = new Date(desde);
  if (hasta) filtro.fecha.$lte = new Date(hasta);

  const items = await Expense.find(filtro).sort({ fecha: -1 });
  res.json(items);
}

export async function createExpense(req, res) {
  try {
    const ex = await Expense.create(req.body);
    res.status(201).json(ex);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateExpense(req, res) {
  try {
    const ex = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ex) return res.status(404).json({ error: "Gasto no encontrado" });
    res.json(ex);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteExpense(req, res) {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Gasto eliminado" });
}
