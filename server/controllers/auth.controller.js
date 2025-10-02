import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

function signToken(user) {
  const payload = { id: user._id, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "2d" });
}

export async function register(req, res) {
  try {
    const { email, password, nombre, role } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email y password son requeridos" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "El email ya está registrado" });

    // reglas simples de password
    if (String(password).length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, nombre, role, passwordHash });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, nombre: user.nombre, role: user.role }
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y password son requeridos" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, nombre: user.nombre, role: user.role }
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function me(req, res) {
  // req.user viene del middleware authRequired
  const user = await User.findById(req.user.id).select("_id email nombre role createdAt");
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(user);
}