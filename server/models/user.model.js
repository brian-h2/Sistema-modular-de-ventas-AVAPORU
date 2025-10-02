import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  nombre:   { type: String, trim: true },
  role:     { type: String, enum: ["Gerente","Encargado"], default: "Encargado" },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);