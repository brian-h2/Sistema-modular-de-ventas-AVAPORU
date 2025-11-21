# Sistema Modular de Ventas --- **AVAPORU**

**Integrantes:**\
- **Pablo Cozzi**\
- **Brian Heredia**

------------------------------------------------------------------------

# 🎯 Objetivo del Proyecto

Desarrollar un **sistema modular de gestión comercial**, orientado a
pequeñas y medianas empresas del rubro calzado/indumentaria.\
El sistema permite administrar de manera centralizada:

-   Ventas\
-   Gastos\
-   Stock\
-   Usuarios\
-   Reportes\
-   Indicadores inteligentes

Además, integra **modelos de predicción con IA** para anticipar
tendencias, optimizar decisiones y potenciar las ventas.

------------------------------------------------------------------------

# 🚀 Tecnologías Utilizadas

### **Frontend**

-   React + TypeScript\
-   Vite\
-   TailwindCSS\
-   Recharts (gráficos)\
-   SweetAlert2\
-   React Router DOM

### **Backend**

-   Node.js\
-   Express.js\
-   Bcrypt\
-   JWT Authentication\
-   CORS

### **Base de Datos**

-   MongoDB Atlas\
-   Mongoose ORM

### **Infraestructura**

-   Deploy Frontend → **Vercel**\
-   Deploy Backend → **Railway**\
-   Variables de entorno seguras (ENV)\
-   CI/CD automático con cada push

------------------------------------------------------------------------

# 🧩 Arquitectura del Sistema

    Frontend (Vercel)
           |
           |  API REST HTTPS
           |
    Backend (Railway)
           |
           |  MongoDB Driver
           |
    MongoDB Atlas (DB en la nube)

Diseño modular, escalable y preparado para incorporar lógica avanzada de
predicción.

------------------------------------------------------------------------

# 📊 Módulos Principales

### ✔ **Dashboard**

Panel general con métricas clave y visualizaciones.

### ✔ **Ventas**

Registro y análisis de ventas.

### ✔ **Stock**

Control de inventario.

### ✔ **Usuarios**

Gestión y autenticación (JWT).

### ✔ **Gastos**

Panel de gastos diarios.

### ✔ **Reportes**

Gráficos dinámicos y análisis.

------------------------------------------------------------------------

# 🤖 Inteligencia Artificial (Futuro Cercano)

Predicción de ventas, forecasting de demanda, recomendaciones y más.

------------------------------------------------------------------------

# 🛠️ Instalación y Ejecución

### Clonar

    git clone https://github.com/.../Sistema-modular-de-ventas-AVAPORU.git

## Frontend

    cd client
    npm install
    npm run dev

## Backend

    cd server
    npm install

Crear `.env`

    MONGO_URI=TU_URI
    JWT_SECRET=CLAVE
    PORT=4000

Ejecutar

    npm run dev

------------------------------------------------------------------------

# 🌎 Deploy

-   Frontend: https://sistema-modular-de-ventas-avaporu.vercel.app\
-   Backend:
    https://sistema-modular-de-ventas-avaporu-production.up.railway.app

------------------------------------------------------------------------

# 📘 Estado

🟢 Producción\
🛠️ Mejoras en curso\
🤖 IA próximamente

------------------------------------------------------------------------

# 🤝 Contribución

Pull requests bienvenidos.

------------------------------------------------------------------------

# 🏁 Licencia

Proyecto académico de **Cozzi & Heredia**.
