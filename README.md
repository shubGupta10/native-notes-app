# 📱 NoteNest

**NoteNest** is a mobile notes + habit tracker app built using **React Native (Expo)**.
It allows users to manage their notes and track daily habits with a clean, modern UI and smooth performance.

---

## 🚀 Tech Stack

-   **React Native (Expo)**
-   **NativeWind** – Tailwind for React Native styling
-   **Appwrite** – Backend as a Service for auth and database
-   **EAS Build** – For APK export and deployment

---

## ✨ Features

### 📝 Notes App

-   Create, edit, delete notes (CRUD functionality)
-   Clean UI for managing all your notes
-   Works offline with sync support

### 📊 Habit Tracker

-   Select a month and view your habit summary
-   Track daily habits with visual stats:
    -   Monthly success/missed count
    -   Success rate %
    -   Performance score
-   Refresh stats in real-time

### 📱 UI

-   Built with **NativeWind** for responsive and beautiful design
-   Smooth animations and consistent mobile layout

---

## 🛠️ Installation

1.  **Clone the repo**

    ```bash
    git clone https://github.com/shubGupta10/native-notes-app
    ```

    Navigate to the project directory

    ```bash
    cd notenest
    ```

    Install dependencies

    ```bash
    npm install
    ```

    Start the development server

    ```bash
    npx expo start
    ```

2.  🛠️ **Setup Environment Variables**

    Create a `.env` file in the root of your project and add the following:

    ```bash
    EXPO_PUBLIC_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
    EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    EXPO_PUBLIC_APPWRITE_DATABASE_ID=YOUR_DATABASE_ID
    EXPO_PUBLIC_APPWRITE_COLLECTION_ID=YOUR_NOTES_COLLECTION_ID
    EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID=YOUR_TRACKER_COLLECTION_ID
    EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID=YOUR_ENTRIES_COLLECTION_ID
    EXPO_PUBLIC_APPWRITE_FEEDBACKANDCONTACT_COLLECTION_ID=YOUR_FEEDBACK_COLLECTION_ID
    ```

3.  📦 **Build APK with EAS**

    Before building with EAS, you need to:

    -   Create an Expo account (if you don't have one)
    -   Create a new project on Expo
    -   Link your local app to the Expo project.

    You can install the Expo CLI globally:

     ```bash
     npm install -g expo-cli
     ```

    Then, to build an APK file:

    ```bash
    npx eas build -p android --profile preview
    ```

4.  🧭 **Navigate the App**

    Once you have the app running, you can navigate between:

    -   Notes Section: Create and manage your notes
    -   Habit Tracker: Monitor your daily habits and view progress
    -   Settings: Customize your app experience
