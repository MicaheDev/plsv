
# PLSV - Guía Rápida de Trabajo
¡Bienvenido al proyecto! Esta guía es para que sepas cómo encender el proyecto y dónde trabajar sin preocuparte por la arquitectura compleja.
---
## 🚀 1. Comandos Básicos (Acode / Termux)

Para trabajar, solo necesitas estos dos comandos en la consola:

* **Iniciar servidores (Vue + PocketBase):**
```bash
  npm run acode-start

```
* **Detener servidores:**
```bash
    npm run acode-stop
```
---

## 📁 2. ¿Dónde vas a trabajar?
Solo te enfocarás en la carpeta `src/`:
1. **`src/components/`**: Aquí creamos las piezas pequeñas reutilizables (tarjetas, botones, headers).
2. **`src/views/`**: Aquí van las pantallas principales (Inicio, Login, Lecciones).
> ⚠️ **Nota:** Las carpetas `router/`, `services/`, `stores/`, `layouts/` y archivos de configuración déjalos como están. De esa lógica y conexión con la base de datos me encargo yo.
---
## 🎨 3. ¿Cómo crear un componente de interfaz?
Cada archivo `.vue` que crees solo necesita esta estructura básica (HTML + Tailwind CSS):
```html
<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-bold text-gray-800">Título del componente</h2>
    <p class="text-gray-600">Escribe aquí tu HTML normal y usa clases de Tailwind.</p>
  </div>
</template>
```
---
## 🛠️ 4. Flujo de Trabajo
1. Inicia el servidor con `npm run acode-start`.
2. Crea o edita las vistas en `src/views/` o componentes en `src/components/`.
3. Revisa los cambios en la app.
4. Al terminar tu jornada, ejecuta `npm run acode-stop`.
