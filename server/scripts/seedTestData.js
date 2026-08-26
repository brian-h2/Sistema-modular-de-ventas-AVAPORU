import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Sale from "../models/sale.model.js";
import User from "../models/user.model.js";

dotenv.config();

const PRODUCTS_TO_CREATE = 40;
const SALES_TO_CREATE = 150;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const CATEGORIES = {
  Calzado: ["Zapatilla Runner", "Botín Urbano", "Sandalia Trekking", "Zapatilla Slip-On", "Mocasín Clásico", "Bota de Lluvia"],
  Accesorios: ["Cinturón Cuero", "Gorra Deportiva", "Billetera Slim", "Mochila Urbana", "Riñonera", "Bufanda Lana"],
};

const CLIENTES = [
  "Juan Pérez", "María González", "Carlos Rodríguez", "Ana Fernández", "Luis Martínez",
  "Sofía López", "Diego Sánchez", "Valentina Díaz", "Martín Romero", "Camila Torres",
  "Federico Ruiz", "Lucía Álvarez", "Nicolás Gómez", "Julieta Castro", "Tomás Ortiz",
  "Agustina Silva", "Franco Molina", "Florencia Vega", "Ignacio Morales", "Paula Rojas",
];

const ESTADOS = ["CREADA", "PAGADA", "FACTURADA", "CANCELADA"];
const ESTADO_WEIGHTS = [1, 4, 3, 1]; // más peso a PAGADA/FACTURADA

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

function randomDateThisYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = now.getTime();
  return new Date(start + Math.random() * (end - start));
}

async function seedProducts() {
  const created = [];
  const catNames = Object.keys(CATEGORIES);
  // Base aleatoria para evitar colisión de SKU (único) si el script se corre más de una vez
  let skuCounter = randInt(1000, 900000);

  for (let i = 0; i < PRODUCTS_TO_CREATE; i++) {
    const categoria = catNames[i % catNames.length];
    const baseNames = CATEGORIES[categoria];
    const nombre = `${pick(baseNames)} ${randInt(1, 99)}`;
    const sku = `T${skuCounter++}`;

    // Distribución de stock: la mayoría normal, algunos críticos, algunos en 0
    const roll = Math.random();
    let stockMinimo = randInt(3, 15);
    let stockDisponible;
    if (roll < 0.12) {
      stockDisponible = 0; // sin stock
    } else if (roll < 0.25) {
      stockDisponible = randInt(0, stockMinimo); // crítico
    } else {
      stockDisponible = randInt(stockMinimo + 5, stockMinimo + 150); // normal
    }

    const precio = randInt(2, 300) * 500; // múltiplos de $500, entre $1.000 y $150.000

    const product = await Product.create({
      sku,
      nombre,
      precio,
      stockDisponible,
      stockMinimo,
      categoria,
    });
    created.push(product);
  }

  console.log(`✅ ${created.length} productos creados`);
  return created;
}

async function seedSales(products, vendedores) {
  let created = 0;

  for (let i = 0; i < SALES_TO_CREATE; i++) {
    const itemCount = randInt(1, 4);
    const chosenProducts = new Set();
    while (chosenProducts.size < itemCount && chosenProducts.size < products.length) {
      chosenProducts.add(pick(products));
    }

    const items = Array.from(chosenProducts).map((prod) => {
      const cantidad = randInt(1, 5);
      const precioUnitario = prod.precio;
      return {
        product: prod._id,
        sku: prod.sku,
        nombre: prod.nombre,
        cantidad,
        precioUnitario,
        subtotal: precioUnitario * cantidad,
      };
    });

    const total = items.reduce((acc, it) => acc + it.subtotal, 0);
    const vendedor = vendedores.length > 0 && Math.random() > 0.1 ? pick(vendedores)._id : undefined;

    await Sale.create({
      fecha: randomDateThisYear(),
      cliente: pick(CLIENTES),
      vendedor,
      items,
      total,
      estado: weightedPick(ESTADOS, ESTADO_WEIGHTS),
    });
    created++;
  }

  console.log(`✅ ${created} ventas creadas`);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Falta MONGODB_URI en el .env");
    process.exit(1);
  }

  // Nos conectamos usando el nombre de base de datos tal cual viene en la URI
  // (connectDB fuerza dbName:"Avaporu" con mayúscula, lo que en Windows genera
  // conflicto de mayúsculas/minúsculas contra la base real "avaporu").
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("🗄️  MongoDB conectado:", mongoose.connection.name);

  const vendedores = await User.find({});
  console.log(`ℹ️  ${vendedores.length} usuarios existentes encontrados para asignar como vendedores`);

  const products = await seedProducts();
  await seedSales(products, vendedores);

  console.log("🎉 Datos de prueba generados con éxito");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error generando datos de prueba:", err);
  process.exit(1);
});
