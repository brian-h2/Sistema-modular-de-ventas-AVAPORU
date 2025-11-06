📖 API – Sistema de Ventas

🔑 Autenticación:

- Método: JWT (Bearer Token)

- Registro/Login: contraseñas encriptadas con bcrypt

- Header requerido en endpoints protegidos:

Authorization: Bearer <token>

🔐 Auth Routes
POST /auth/register

Registra un nuevo usuario.
Body (JSON):
    {
        "nombre": "Brian",
        "email": "brian@mail.com",
        "password": "123456"
    }

Respuestas:

✅ 201 Created
{ "id": 1, "nombre": "Brian", "email": "brian@mail.com" }
❌ 400 Bad Request → datos inválidos.

POST /auth/login

Inicia sesión y devuelve un token JWT.
Body (JSON): 
    { "email": "brian@mail.com", "password": "123456" }

Respuestas:

✅ 200 OK
{ "token": "<jwt-token>" }
❌ 401 Unauthorized → credenciales inválidas.

POST /auth/me

Devuelve los datos del usuario autenticado.
Header:
    Authorization: Bearer <token>

✅ 200 OK
{ "id": 1, "nombre": "Brian", "email": "brian@mail.com" }

💰 Expense Routes

GET /expenses

Lista todas las expensas.
Respuestas:

✅ 200 OK
[
  { "id": 1, "monto": 5000, "descripcion": "Luz" },
  { "id": 2, "monto": 7000, "descripcion": "Agua" }
]

POST /expenses

Crea una nueva expensa.
Body (JSON):
{ "monto": 5000, "descripcion": "Internet" }

Respuestas:

✅ 201 Created
{ "id": 3, "monto": 5000, "descripcion": "Internet" }

🛒 Products Routes
GET /products

Devuelve listado de productos.
Respuestas:
[
  { "id": 1, "nombre": "Zapatillas Nike", "precio": 12000 },
  { "id": 2, "nombre": "Remera Adidas", "precio": 6000 }
]

POST /products

Crea un producto nuevo.
Body (JSON):
{ "nombre": "Campera Puma", "precio": 20000 }

PATCH /products

Modifica un producto existente.
Body (JSON):
{ "id": 1, "nombre": "Zapatillas Nike Air", "precio": 12500 }

🧾 Sales Routes
POST /sales

Crea una nueva venta.
Body (JSON):
{
  "id_producto": 1,
  "cantidad": 2,
  "total": 25000
}

GET /sales/:id

Obtiene una venta específica.
Ejemplo: /sales/10
Respuesta:
{
  "id": 10,
  "id_producto": 1,
  "cantidad": 2,
  "total": 25000,
  "fecha": "2025-10-02T12:00:00Z"
}
