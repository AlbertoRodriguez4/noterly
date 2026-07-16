<div align="center">
  <img src="Noterly-Logo.jpg" alt="Noterly Logo" width="120" height="120" style="border-radius: 20%" />
  <h1>Noterly</h1>
  <p><strong>A Next-Generation AI-Powered Productivity & Habit Tracking App</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Capacitor-Android-green?style=for-the-badge&logo=android" alt="Android" />
    <img src="https://img.shields.io/badge/Puter.js-AI-FF6B6B?style=for-the-badge" alt="Puter AI" />
  </p>
</div>

---

## 🌟 Overview

**Noterly** is a premium, modern, and highly responsive productivity application designed to help you organize your life effortlessly. By combining traditional task management, habit-forming routines, and quick notes with cutting-edge **Natural Language AI**, Noterly adapts to your workflow rather than forcing you to adapt to it.

Available both as a Lightning-fast Web Application and a Native Android App.

## ✨ Key Features

- 🧠 **AI Smart Planner (Puter.js)**: Tell the app what you want to achieve in natural language (e.g., *"I want to run 30 minutes every morning and read a book at night"*), and Noterly will automatically create the perfect routine and task breakdown for you.
- 🔥 **Habits & Streaks**: Build consistency. Track your daily points, view your best streaks, and monitor your success rate globally.
- 📝 **Color-Coded Quick Notes**: Keep track of brilliant ideas instantly with a beautiful, sticky-note style grid layout.
- ↩️ **Smart Undo System**: Accidentally checked off a task? A quick, non-intrusive toast allows you to undo any action within 5 seconds.
- ⏱️ **Time Estimation**: Block time efficiently by assigning estimated minutes to your tasks using quick shortcuts (15m, 30m, 1h, 2h).
- 🌓 **Dark & Light Mode**: A meticulously crafted UI featuring glassmorphism, smooth micro-animations, and full theme support.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with arbitrary values & custom animations)
- **Icons**: Lucide React
- **AI Integration**: Puter.js
- **Mobile Wrapper**: Ionic Capacitor (Android)
- **State Management**: Custom LocalStorage Hooks (Fully offline-first!)

## 🚀 Getting Started (Web Development)

To get a local copy up and running, follow these simple steps:

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/AlbertoRodriguez4/noterly.git
   ```
2. Navigate to the project directory
   ```sh
   cd noterly
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```

## 📱 Mobile Build (Android)

Noterly is fully configured to be compiled natively for Android using Capacitor.

1. Build the production web assets:
   ```sh
   npm run build
   ```
2. Sync the web code to the Android project:
   ```sh
   npx cap sync android
   ```
3. Open the project in Android Studio to build the `.apk` or `.aab`:
   ```sh
   npx cap open android
   ```
> **Note:** The Android project is configured to use AGP 8.1.2 and Java 17 for maximum compatibility across different Android Studio environments.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

We follow standard **Gitflow** practices:
- Develop new features on the `develop` branch or a `feature/` branch.
- Submit a Pull Request targeting `develop`.

---
<div align="center">
  <i>Designed and built with ❤️</i>
</div>
