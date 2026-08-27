import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);
    // Usamos el nombre de base de datos directamente desde la URI (avaporu) para evitar conflictos de mayúsculas/minúsculas
    await mongoose.connect(uri);
    console.log("🗄️  MongoDB conectado:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ Error conectando a Mongo:", err.message);
    process.exit(1);
  }
}