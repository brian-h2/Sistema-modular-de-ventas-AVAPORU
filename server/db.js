import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { dbName: "avaporu" });
    console.log("🗄️  MongoDB conectado");
  } catch (err) {
    console.error("❌ Error conectando a Mongo:", err.message);
    process.exit(1);
  }
}