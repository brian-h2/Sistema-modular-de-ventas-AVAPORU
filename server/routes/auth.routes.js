import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const r = Router();

r.post("/register", register);
r.post("/login",    login);
r.get("/me", authRequired, me);

export default r;