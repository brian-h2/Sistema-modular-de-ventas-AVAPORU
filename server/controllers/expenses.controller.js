import Expense from "../models/Expense.model.js";

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
    const e = await Expense.create(req.body);
    res.status(201).json(e);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}