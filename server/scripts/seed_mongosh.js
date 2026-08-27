// Script para ejecutar directamente en mongosh o MongoDB Compass
// Comando: mongosh "tu_mongodb_uri" seed_mongosh.js

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

// 1. Usuarios / Vendedores
const USERS_RAW = [
  { _id: new ObjectId(), email: "carlos.vendedor@avaporu.com", nombre: "Carlos Pérez", role: "Vendedor", status: "active", passwordHash: "$2a$10$e8w5hH4...hashed" },
  { _id: new ObjectId(), email: "ana.vendedora@avaporu.com", nombre: "Ana Martínez", role: "Vendedor", status: "active", passwordHash: "$2a$10$e8w5hH4...hashed" },
  { _id: new ObjectId(), email: "roberto.encargado@avaporu.com", nombre: "Roberto Fernández", role: "Encargado", status: "active", passwordHash: "$2a$10$e8w5hH4...hashed" },
  { _id: new ObjectId(), email: "lucia.gerente@avaporu.com", nombre: "Lucía Gómez", role: "Gerente", status: "active", passwordHash: "$2a$10$e8w5hH4...hashed" }
];

// Comprobar si ya existen usuarios o insertarlos
let existingUsers = db.users.find({}).toArray();
if (existingUsers.length === 0) {
  db.users.insertMany(USERS_RAW);
  existingUsers = db.users.find({}).toArray();
  print(`✅ Insertados ${existingUsers.length} usuarios/vendedores`);
} else {
  print(`ℹ️ Encontrados ${existingUsers.length} usuarios existentes para ventas`);
}

const PRODUCTS_RAW = [
  // --- CALZADO (55 variedades) ---
  { sku: "CAL-001", nombre: "Zapatilla Running Air Pegasus 40", precio: 95000, categoria: "Calzado", stockDisponible: 25, stockMinimo: 5 },
  { sku: "CAL-002", nombre: "Zapatilla Running Ultraboost Light", precio: 115000, categoria: "Calzado", stockDisponible: 18, stockMinimo: 5 },
  { sku: "CAL-003", nombre: "Botín Urbano Cuero Legítimo Marrón", precio: 85000, categoria: "Calzado", stockDisponible: 12, stockMinimo: 4 },
  { sku: "CAL-004", nombre: "Zapatilla Deportiva Nike Downshifter", precio: 68000, categoria: "Calzado", stockDisponible: 30, stockMinimo: 8 },
  { sku: "CAL-005", nombre: "Zapato de Vestir Mocasín Italiano Negro", precio: 92000, categoria: "Calzado", stockDisponible: 8, stockMinimo: 3 },
  { sku: "CAL-006", nombre: "Zapatilla Canvas Chuck Taylor All Star", precio: 54000, categoria: "Calzado", stockDisponible: 45, stockMinimo: 10 },
  { sku: "CAL-007", nombre: "Sandalia Trekking Columbia Vent", precio: 62000, categoria: "Calzado", stockDisponible: 14, stockMinimo: 5 },
  { sku: "CAL-008", nombre: "Botines de Fútbol Puma Future FG", precio: 78000, categoria: "Calzado", stockDisponible: 20, stockMinimo: 6 },
  { sku: "CAL-009", nombre: "Zapatilla Slip-On Vans Classic Checkerboard", precio: 58000, categoria: "Calzado", stockDisponible: 35, stockMinimo: 8 },
  { sku: "CAL-010", nombre: "Bota de Lluvia Impermeable PVC", precio: 32000, categoria: "Calzado", stockDisponible: 22, stockMinimo: 5 },
  { sku: "CAL-011", nombre: "Zapatilla Skate Nike SB Alleyoop", precio: 74000, categoria: "Calzado", stockDisponible: 16, stockMinimo: 5 },
  { sku: "CAL-012", nombre: "Zapato Derby Cuero Vacuno Suela Goma", precio: 89000, categoria: "Calzado", stockDisponible: 10, stockMinimo: 3 },
  { sku: "CAL-013", nombre: "Zapatilla Retro Puma Suede Classic", precio: 66000, categoria: "Calzado", stockDisponible: 28, stockMinimo: 6 },
  { sku: "CAL-014", nombre: "Sandalia Plana Cuero Verano Dama", precio: 42000, categoria: "Calzado", stockDisponible: 15, stockMinimo: 5 },
  { sku: "CAL-015", nombre: "Zapatilla Trail Running Salomon Speedcross 6", precio: 128000, categoria: "Calzado", stockDisponible: 9, stockMinimo: 3 },
  { sku: "CAL-016", nombre: "Borcego Táctico de Trabajo Reforzado", precio: 98000, categoria: "Calzado", stockDisponible: 11, stockMinimo: 4 },
  { sku: "CAL-017", nombre: "Zapatilla Plataforma Fila Disruptor II", precio: 72000, categoria: "Calzado", stockDisponible: 19, stockMinimo: 5 },
  { sku: "CAL-018", nombre: "Ojotas Havaianas Brasil Logo Original", precio: 18000, categoria: "Calzado", stockDisponible: 60, stockMinimo: 15 },
  { sku: "CAL-019", nombre: "Zapatilla Deportiva Adidas Duramo SL", precio: 59000, categoria: "Calzado", stockDisponible: 40, stockMinimo: 10 },
  { sku: "CAL-020", nombre: "Zapato Guillermina Cuero Dama", precio: 64000, categoria: "Calzado", stockDisponible: 13, stockMinimo: 4 },
  { sku: "CAL-021", nombre: "Botín de Montaña Impermeable Gore-Tex", precio: 110000, categoria: "Calzado", stockDisponible: 7, stockMinimo: 3 },
  { sku: "CAL-022", nombre: "Zapatilla Basket Reebok Club C 85", precio: 69000, categoria: "Calzado", stockDisponible: 21, stockMinimo: 5 },
  { sku: "CAL-023", nombre: "Alpargatas Tradicionales de Yute y Lona", precio: 22000, categoria: "Calzado", stockDisponible: 50, stockMinimo: 12 },
  { sku: "CAL-024", nombre: "Zapatos Náuticos Timberland Cuero Marrón", precio: 105000, categoria: "Calzado", stockDisponible: 8, stockMinimo: 3 },
  { sku: "CAL-025", nombre: "Zapatilla Running Asics Gel-Nimbus 25", precio: 135000, categoria: "Calzado", stockDisponible: 14, stockMinimo: 4 },
  { sku: "CAL-026", nombre: "Sandalia de Tacón Elegante Fiesta", precio: 76000, categoria: "Calzado", stockDisponible: 12, stockMinimo: 3 },
  { sku: "CAL-027", nombre: "Zapatilla Vans Old Skool Black/White", precio: 68000, categoria: "Calzado", stockDisponible: 33, stockMinimo: 8 },
  { sku: "CAL-028", nombre: "Botitas Urbanas de Lona High Top", precio: 56000, categoria: "Calzado", stockDisponible: 27, stockMinimo: 6 },
  { sku: "CAL-029", nombre: "Zapatilla Deportiva Under Armour Charged", precio: 82000, categoria: "Calzado", stockDisponible: 16, stockMinimo: 5 },
  { sku: "CAL-030", nombre: "Zapato Oxford Clásico Formal", precio: 96000, categoria: "Calzado", stockDisponible: 6, stockMinimo: 2 },
  { sku: "CAL-031", nombre: "Sandalia Bio Anatómica Confort Corcho", precio: 48000, categoria: "Calzado", stockDisponible: 22, stockMinimo: 5 },
  { sku: "CAL-032", nombre: "Botín Texano de Cuero Flex Suela de Madera", precio: 89000, categoria: "Calzado", stockDisponible: 9, stockMinimo: 3 },
  { sku: "CAL-033", nombre: "Zapatilla Running New Balance 574 Core", precio: 88000, categoria: "Calzado", stockDisponible: 24, stockMinimo: 6 },
  { sku: "CAL-034", nombre: "Pantuflas Térmicas de Peluche Confort", precio: 24000, categoria: "Calzado", stockDisponible: 35, stockMinimo: 8 },
  { sku: "CAL-035", nombre: "Crocs Classic Clog Unisex", precio: 45000, categoria: "Calzado", stockDisponible: 38, stockMinimo: 10 },
  { sku: "CAL-036", nombre: "Zapato Sueco de Cuero Urbano Dama", precio: 67000, categoria: "Calzado", stockDisponible: 15, stockMinimo: 4 },
  { sku: "CAL-037", nombre: "Botas Caña Alta Cuero Vacuno Suela Flex", precio: 125000, categoria: "Calzado", stockDisponible: 10, stockMinimo: 3 },
  { sku: "CAL-038", nombre: "Zapatilla Basket Nike Air Force 1 '07", precio: 110000, categoria: "Calzado", stockDisponible: 20, stockMinimo: 5 },
  { sku: "CAL-039", nombre: "Zapatilla Running Brooks Ghost 15", precio: 122000, categoria: "Calzado", stockDisponible: 12, stockMinimo: 4 },
  { sku: "CAL-040", nombre: "Zapatos Stiletto Taco Aguja 7cm", precio: 84000, categoria: "Calzado", stockDisponible: 8, stockMinimo: 3 },
  { sku: "CAL-041", nombre: "Botines Futsal Nike Mercurial Vapor", precio: 79000, categoria: "Calzado", stockDisponible: 17, stockMinimo: 5 },
  { sku: "CAL-042", nombre: "Sandalia Romanas Gladiadoras Cuero", precio: 51000, categoria: "Calzado", stockDisponible: 14, stockMinimo: 4 },
  { sku: "CAL-043", nombre: "Borceguíes de Seguridad Punta de Acero", precio: 94000, categoria: "Calzado", stockDisponible: 25, stockMinimo: 6 },
  { sku: "CAL-044", nombre: "Zapatilla Casual Adidas Stan Smith", precio: 75000, categoria: "Calzado", stockDisponible: 29, stockMinimo: 7 },
  { sku: "CAL-045", nombre: "Mocasín Náutico Acordonado Nobuk", precio: 82000, categoria: "Calzado", stockDisponible: 11, stockMinimo: 3 },
  { sku: "CAL-046", nombre: "Zapatilla Running Mizuno Wave Rider", precio: 118000, categoria: "Calzado", stockDisponible: 13, stockMinimo: 4 },
  { sku: "CAL-047", nombre: "Botín Chelsea Cuero Gamuzado", precio: 91000, categoria: "Calzado", stockDisponible: 16, stockMinimo: 5 },
  { sku: "CAL-048", nombre: "Sandalia Plataforma Yute Verano", precio: 53000, categoria: "Calzado", stockDisponible: 22, stockMinimo: 6 },
  { sku: "CAL-049", nombre: "Zapatilla Retro Converse Weapon 86", precio: 87000, categoria: "Calzado", stockDisponible: 10, stockMinimo: 3 },
  { sku: "CAL-050", nombre: "Pantufla Abierta de Gamuza con Cordero", precio: 29000, categoria: "Calzado", stockDisponible: 40, stockMinimo: 10 },
  { sku: "CAL-051", nombre: "Zapato Ballerina Chata de Charol", precio: 46000, categoria: "Calzado", stockDisponible: 18, stockMinimo: 5 },
  { sku: "CAL-052", nombre: "Botitas de Agua Infantil Estampadas", precio: 28000, categoria: "Calzado", stockDisponible: 30, stockMinimo: 8 },
  { sku: "CAL-053", nombre: "Ojotas Deportivas Slide Nike Victori", precio: 26000, categoria: "Calzado", stockDisponible: 45, stockMinimo: 12 },
  { sku: "CAL-054", nombre: "Zapatilla Trail Merrell Moab 3 Waterproof", precio: 130000, categoria: "Calzado", stockDisponible: 9, stockMinimo: 3 },
  { sku: "CAL-055", nombre: "Zapato Monkstrap Doble Hebilla Cuero", precio: 102000, categoria: "Calzado", stockDisponible: 7, stockMinimo: 2 },

  // --- ACCESORIOS (35 productos) ---
  { sku: "ACC-001", nombre: "Cinturón de Cuero Vacuno Clásico", precio: 24000, categoria: "Accesorios", stockDisponible: 40, stockMinimo: 10 },
  { sku: "ACC-002", nombre: "Cinturón Táctico Reversible", precio: 18000, categoria: "Accesorios", stockDisponible: 30, stockMinimo: 8 },
  { sku: "ACC-003", nombre: "Billetera Slim Cuero Genuino", precio: 28000, categoria: "Accesorios", stockDisponible: 35, stockMinimo: 8 },
  { sku: "ACC-004", nombre: "Billetera Plegable con Tarjetero RFID", precio: 32000, categoria: "Accesorios", stockDisponible: 28, stockMinimo: 6 },
  { sku: "ACC-005", nombre: "Mochila Urbana Porta Notebook 15.6\"", precio: 58000, categoria: "Accesorios", stockDisponible: 20, stockMinimo: 5 },
  { sku: "ACC-006", nombre: "Mochila Antirrobo Ejecutiva Waterproof", precio: 68000, categoria: "Accesorios", stockDisponible: 15, stockMinimo: 4 },
  { sku: "ACC-007", nombre: "Mochila Deportiva Gym Bag", precio: 35000, categoria: "Accesorios", stockDisponible: 25, stockMinimo: 6 },
  { sku: "ACC-008", nombre: "Riñonera Casual Unisex", precio: 22000, categoria: "Accesorios", stockDisponible: 45, stockMinimo: 10 },
  { sku: "ACC-009", nombre: "Gorra Deportiva Visera Curva Nike", precio: 26000, categoria: "Accesorios", stockDisponible: 50, stockMinimo: 12 },
  { sku: "ACC-010", nombre: "Gorro de Lana Térmico Beanie", precio: 16000, categoria: "Accesorios", stockDisponible: 40, stockMinimo: 10 },
  { sku: "ACC-011", nombre: "Sombrero Fedora Elegante Paño", precio: 38000, categoria: "Accesorios", stockDisponible: 12, stockMinimo: 3 },
  { sku: "ACC-012", nombre: "Bufanda Tejida de Lana Soft", precio: 21000, categoria: "Accesorios", stockDisponible: 30, stockMinimo: 8 },
  { sku: "ACC-013", nombre: "Guantes de Cuero Térmicos Touchscreen", precio: 34000, categoria: "Accesorios", stockDisponible: 18, stockMinimo: 5 },
  { sku: "ACC-014", nombre: "Guantes Deportivos Gimnasio", precio: 19000, categoria: "Accesorios", stockDisponible: 32, stockMinimo: 8 },
  { sku: "ACC-015", nombre: "Lentes de Sol Polarizados UV400", precio: 45000, categoria: "Accesorios", stockDisponible: 22, stockMinimo: 5 },
  { sku: "ACC-016", nombre: "Reloj Analógico Cuero Clásico", precio: 89000, categoria: "Accesorios", stockDisponible: 10, stockMinimo: 3 },
  { sku: "ACC-017", nombre: "Reloj Deportivo Digital Sumergible", precio: 54000, categoria: "Accesorios", stockDisponible: 16, stockMinimo: 4 },
  { sku: "ACC-018", nombre: "Bandolera de Cuero Porta Tablet", precio: 49000, categoria: "Accesorios", stockDisponible: 14, stockMinimo: 4 },
  { sku: "ACC-019", nombre: "Tarjetero Metálico RFID Popup", precio: 25000, categoria: "Accesorios", stockDisponible: 38, stockMinimo: 8 },
  { sku: "ACC-020", nombre: "Valija Carry On 20 Pulgadas Cabina", precio: 112000, categoria: "Accesorios", stockDisponible: 8, stockMinimo: 2 },
  { sku: "ACC-021", nombre: "Paraguas Automático Antiviento", precio: 27000, categoria: "Accesorios", stockDisponible: 25, stockMinimo: 6 },
  { sku: "ACC-022", nombre: "Pack x3 Medias Deportivas Algodón", precio: 12000, categoria: "Accesorios", stockDisponible: 80, stockMinimo: 20 },
  { sku: "ACC-023", nombre: "Pack x5 Medias Invisibles Footies", precio: 15000, categoria: "Accesorios", stockDisponible: 70, stockMinimo: 18 },
  { sku: "ACC-024", nombre: "Pañuelo de Seda Estampado", precio: 19000, categoria: "Accesorios", stockDisponible: 24, stockMinimo: 5 },
  { sku: "ACC-025", nombre: "Funda de Notebook Neoprene 15\"", precio: 18000, categoria: "Accesorios", stockDisponible: 30, stockMinimo: 8 },
  { sku: "ACC-026", nombre: "Neceser de Viaje Impermeable", precio: 23000, categoria: "Accesorios", stockDisponible: 26, stockMinimo: 6 },
  { sku: "ACC-027", nombre: "Botella Térmica Acero Inoxidable 750ml", precio: 31000, categoria: "Accesorios", stockDisponible: 35, stockMinimo: 8 },
  { sku: "ACC-028", nombre: "Llavero de Cuero con Mosquetón", precio: 9000, categoria: "Accesorios", stockDisponible: 90, stockMinimo: 20 },
  { sku: "ACC-029", nombre: "Cordones Elásticos Reflectivos", precio: 7500, categoria: "Accesorios", stockDisponible: 100, stockMinimo: 25 },
  { sku: "ACC-030", nombre: "Cepillo y Cera para Limpieza de Cuero", precio: 14000, categoria: "Accesorios", stockDisponible: 40, stockMinimo: 10 },
  { sku: "ACC-031", nombre: "Impermeabilizante en Spray para Calzado", precio: 16500, categoria: "Accesorios", stockDisponible: 35, stockMinimo: 8 },
  { sku: "ACC-032", nombre: "Plantillas Anatómicas Gel Confort", precio: 13000, categoria: "Accesorios", stockDisponible: 55, stockMinimo: 12 },
  { sku: "ACC-033", nombre: "Portapasaporte de Cuero Travel", precio: 21000, categoria: "Accesorios", stockDisponible: 20, stockMinimo: 5 },
  { sku: "ACC-034", nombre: "Antifaz de Descanso para Viaje", precio: 8500, categoria: "Accesorios", stockDisponible: 45, stockMinimo: 10 },
  { sku: "ACC-035", nombre: "Almohada de Viaje Cervical Viscoelástica", precio: 29000, categoria: "Accesorios", stockDisponible: 18, stockMinimo: 5 }
];

const CLIENTES = [
  "Juan Pérez", "María González", "Carlos Rodríguez", "Ana Fernández", "Luis Martínez",
  "Sofía López", "Diego Sánchez", "Valentina Díaz", "Martín Romero", "Camila Torres",
  "Federico Ruiz", "Lucía Álvarez", "Nicolás Gómez", "Julieta Castro", "Tomás Ortiz",
  "Agustina Silva", "Franco Molina", "Florencia Vega", "Ignacio Morales", "Paula Rojas"
];

const ESTADOS = ["CREADA", "PAGADA", "FACTURADA", "CANCELADA"];
const ESTADO_WEIGHTS = [1, 5, 4, 1];

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

function getRandomDate(startYear = 2023) {
  const now = new Date();
  const start = new Date(startYear, 0, 1).getTime();
  const end = now.getTime();
  return new Date(start + Math.random() * (end - start));
}

// 2. Preparar Productos con ObjectId
const productsToInsert = PRODUCTS_RAW.map(p => ({
  _id: new ObjectId(),
  sku: p.sku,
  nombre: p.nombre,
  precio: p.precio,
  stockDisponible: p.stockDisponible,
  stockMinimo: p.stockMinimo,
  categoria: p.categoria,
  createdAt: new Date(),
  updatedAt: new Date()
}));

db.products.deleteMany({});
db.products.insertMany(productsToInsert);
print(`✅ Insertados ${productsToInsert.length} productos (55 Calzado y 35 Accesorios)`);

// 3. Generar Ventas vinculadas a Vendedores (2023 - 2026)
const salesToInsert = [];
for (let i = 0; i < 250; i++) {
  const itemCount = randInt(1, 4);
  const chosenProds = [];
  while (chosenProds.length < itemCount) {
    const p = pick(productsToInsert);
    if (!chosenProds.find(x => x._id === p._id)) chosenProds.push(p);
  }

  const items = chosenProds.map(prod => {
    const cantidad = randInt(1, 4);
    const precioUnitario = prod.precio;
    return {
      product: prod._id,
      sku: prod.sku,
      nombre: prod.nombre,
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      subtotal: precioUnitario * cantidad
    };
  });

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);
  const fecha = getRandomDate(2023);
  // Asignar ObjectId de Vendedor (User)
  const vendedor = pick(existingUsers)._id;

  salesToInsert.push({
    fecha: fecha,
    cliente: pick(CLIENTES),
    vendedor: vendedor,
    items: items,
    total: total,
    estado: weightedPick(ESTADOS, ESTADO_WEIGHTS),
    createdAt: fecha,
    updatedAt: fecha
  });
}

db.sales.deleteMany({});
db.sales.insertMany(salesToInsert);
print(`✅ Insertadas ${salesToInsert.length} ventas asociadas a vendedores en 'sales'`);

// 4. Generar Gastos (2023 - 2026)
const categories = [
  "Alquiler Local", "Servicios (Luz, Agua, Gas)", "Proveedores Calzado", 
  "Proveedores Accesorios", "Marketing y Publicidad", "Sueldos y Comisiones", 
  "Mantenimiento y Equipamiento", "Impuestos y Tasas", "Logística y Envíos"
];

const expensesToInsert = [];
let presupuestoDisponible = 5000000;

for (let i = 0; i < 80; i++) {
  const categoria = pick(categories);
  const monto = randInt(15, 300) * 1000;
  presupuestoDisponible = Math.max(100000, presupuestoDisponible - monto + randInt(50000, 200000));
  const fecha = getRandomDate(2023);

  expensesToInsert.push({
    fecha: fecha,
    categoria: categoria,
    descripcion: `Gasto correspondiente a ${categoria.toLowerCase()}`,
    monto: monto,
    presupuestoDisponible: presupuestoDisponible,
    createdAt: fecha,
    updatedAt: fecha
  });
}

expensesToInsert.sort((a, b) => a.fecha - b.fecha);

db.expenses.deleteMany({});
db.expenses.insertMany(expensesToInsert);
print(`✅ Insertados ${expensesToInsert.length} gastos en 'expenses'`);
