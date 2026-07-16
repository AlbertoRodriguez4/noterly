<div align="center">
  <img src="Noterly-Logo.jpg" alt="Logo de Noterly" width="120" height="120" style="border-radius: 20%" />
  <h1>Noterly</h1>
  <p><strong>Aplicación de Productividad, Seguimiento de Hábitos y Notas con IA de Nueva Generación</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Capacitor-Android-green?style=for-the-badge&logo=android" alt="Android" />
    <img src="https://img.shields.io/badge/Puter.js-IA-FF6B6B?style=for-the-badge" alt="Puter AI" />
  </p>
</div>

---

## 🌟 Visión General

**Noterly** es una aplicación de productividad premium, moderna y altamente responsiva, diseñada para ayudarte a organizar tu vida sin esfuerzo. Al combinar la gestión tradicional de tareas, la creación de rutinas/hábitos y notas rápidas con la tecnología de punta de la **Inteligencia Artificial de Lenguaje Natural**, Noterly se adapta a tu flujo de trabajo en lugar de obligarte a adaptarte a ella.

Disponible tanto como Aplicación Web ultrarrápida como Aplicación Nativa para Android.

## ✨ Funcionalidades Principales

- 🧠 **Planificador Inteligente (Puter.js)**: Dile a la app lo que quieres lograr usando lenguaje natural (ej. *"Quiero correr 30 minutos cada mañana y leer un libro por la noche"*), y Noterly creará automáticamente la rutina perfecta y el desglose de tareas para ti.
- 🔥 **Hábitos y Rachas**: Construye consistencia. Haz un seguimiento de tus puntos diarios, visualiza tus mejores rachas y monitorea tu tasa de éxito global.
- 📝 **Notas Rápidas por Colores**: Apunta ideas brillantes al instante con un diseño de cuadrícula tipo "post-it", muy visual y ordenado.
- ↩️ **Sistema Inteligente de Deshacer**: ¿Marcaste una tarea por accidente? Una pequeña notificación (toast) te permite deshacer cualquier acción en un margen de 5 segundos.
- ⏱️ **Estimación de Tiempo**: Organiza tus bloques de tiempo asignando minutos a tus tareas de forma sencilla, usando atajos rápidos (15m, 30m, 1h, 2h).
- 🌓 **Modo Oscuro y Claro**: Una interfaz de usuario meticulosamente elaborada con "glassmorphism", microanimaciones fluidas y soporte completo de temas.

## 🛠️ Tecnologías Usadas

- **Framework Frontend**: React 18
- **Empaquetador (Build Tool)**: Vite
- **Estilos**: Tailwind CSS (con valores arbitrarios y animaciones personalizadas)
- **Iconos**: Lucide React
- **Integración de IA**: Puter.js
- **Contenedor Móvil**: Ionic Capacitor (Android)
- **Gestión del Estado**: Hooks personalizados de LocalStorage (¡Funciona 100% sin conexión!)

## 🚀 Empezando (Desarrollo Web)

Para tener una copia local funcionando, sigue estos sencillos pasos:

### Prerrequisitos
- Node.js (versión 18 o superior recomendada)
- npm o yarn

### Instalación
1. Clona el repositorio
   ```sh
   git clone https://github.com/AlbertoRodriguez4/noterly.git
   ```
2. Navega al directorio del proyecto
   ```sh
   cd noterly
   ```
3. Instala los paquetes de NPM
   ```sh
   npm install
   ```
4. Inicia el servidor de desarrollo
   ```sh
   npm run dev
   ```

## 📱 Compilación Móvil (Android)

Noterly está completamente configurada para compilarse nativamente para Android usando Capacitor.

1. Compila los recursos web de producción:
   ```sh
   npm run build
   ```
2. Sincroniza el código web con el proyecto de Android:
   ```sh
   npx cap sync android
   ```
3. Abre el proyecto en Android Studio para construir el `.apk` o `.aab`:
   ```sh
   npx cap open android
   ```
> **Nota:** El proyecto de Android está configurado para usar AGP 8.1.2 y Java 17 para máxima compatibilidad entre diferentes versiones de Android Studio.

## 🤝 Contribución

Las contribuciones son lo que hace a la comunidad open source un lugar increíble para aprender, inspirar y crear. Cualquier contribución que hagas es **muy agradecida**.

Seguimos los estándares de la metodología **Gitflow**:
- Desarrolla nuevas funcionalidades en la rama `develop` o en una rama `feature/`.
- Envía un "Pull Request" apuntando a la rama `develop`.

---
<div align="center">
  <i>Diseñado y construido con ❤️</i>
</div>
