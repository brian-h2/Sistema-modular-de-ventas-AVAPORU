# 🧭 Guía de trabajo con Git

Este documento define el flujo de ramas, convención de commits y un ejemplo práctico para el proyecto de Avaporu.

---

## 🌱 Flujo de Ramas

- **develop** → Rama de desarrollo (trabajo diario, features nuevas).
- **testing** → Rama de validación / QA (para pruebas de lo que viene de `develop`).
- **main** → Rama de producción (solo código estable).

### Resumen visual
```
(main) ----o----------o-------------------  → Producción
            \          \
(testing)    o----o-----o-----------------  → QA / Validación
              \          \
(develop)      o----o-----o---------------  → Desarrollo
```

### Regla simple
1. Trabajar en **develop**.
2. Pasar a **testing** cuando algo está listo para validar.
3. Pasar a **main** cuando ya fue probado.

---

## 📂 Chuleta de Comandos

### Crear y moverte a `develop`
```bash
git checkout -b develop
```

### Hacer cambios
```bash
git status
git add .
git commit -m "feat: agrego gestión de empleados"
```

### Subir cambios
```bash
git push -u origin develop
```

### Pasar cambios a `testing`
```bash
git checkout testing
git pull origin testing
git merge develop
git push origin testing
```

### Pasar cambios a `main`
```bash
git checkout main
git pull origin main
git merge testing
git push origin main
```

### Crear rama de feature (opcional, recomendado)
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre
# ... trabajar ...
git add .
git commit -m "feat: implemento login de usuarios"
git checkout develop
git merge feature/nombre
git push origin develop
```

---

## 📝 Convención de Mensajes de Commit

Prefijos recomendados:

- `feat:` → Nueva funcionalidad  
- `fix:` → Corrección de bug  
- `docs:` → Documentación  
- `style:` → Estilo / formato (sin cambios en lógica)  
- `refactor:` → Refactorización de código  
- `test:` → Agregar/cambiar tests  
- `chore:` → Configuración o tareas menores  

### Ejemplos
```
feat: agregar login de usuarios con JWT
fix: corregir bug en cálculo de vacaciones
docs: actualizar guía de instalación
refactor: optimizar consulta de reportes
```

---

## 🔖 Versionado con tags

Cada vez que se sube algo estable a `main`, marcarlo con un tag:

```bash
git tag -a v1.0 -m "Primera versión estable"
git push origin v1.0
```

---

## ⚡ Ejemplo de flujo real

### 1. Crear rama de feature en `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/empleados
```

### 2. Hacer cambios y confirmar
```bash
# editar archivos...
git add .
git commit -m "feat: CRUD de empleados"
```

### 3. Subir cambios
```bash
git push -u origin feature/empleados //Se debe hacer esto y luego el paso 4 porque si no aprobamos el PR de estos cambios van directos a la main.


### 4. Fusionar en `develop`
```bash
git checkout develop
git pull origin develop
git merge feature/empleados
git push origin develop
```

### 5. Pasar a `testing`
```bash
git checkout testing
git pull origin testing
git merge develop
git push origin testing
```

### 6. Pasar a `main`
```bash
git checkout main
git pull origin main
git merge testing
git push origin main
```

### 7. Marcar versión
```bash
git tag -a v1.0 -m "Primera versión estable"
git push origin v1.0
```
