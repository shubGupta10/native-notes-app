# 📱 NoteNest

**NoteNest** is a mobile notes + habit tracker app built using **React Native (Expo)**.  
It allows users to manage their notes and track daily habits with a clean, modern UI and smooth performance.

---

## 🚀 Tech Stack

- **React Native (Expo)**
- **NativeWind** – Tailwind for React Native styling
- **Appwrite** – Backend as a Service for auth and database
- **EAS Build** – For APK export and deployment

---

## ✨ Features

### 📝 Notes App
- Create, edit, delete notes (CRUD functionality)
- Clean UI for managing all your notes
- Works offline with sync support

### 📊 Habit Tracker
- Select a month and view your habit summary
- Track daily habits with visual stats:
  - Monthly success/missed count
  - Success rate %
  - Performance score
- Refresh stats in real-time

### 📱 UI
- Built with **NativeWind** for responsive and beautiful design
- Smooth animations and consistent mobile layout

---

## 🛠️ Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/shubGupta10/native-notes-app
   
   cd notenest

   npm install

   npx expo start

---

## 📦 Build APK with EAS

 If you want to generate an APK file:

 ```bash
   npx eas build -p android --profile preview
