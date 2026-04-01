Try Now https://medintelli.netlify.app/
# 🩺 MySymptoms — Clinical AI Assistant

> Intelligent, fast, and structured health guidance — available instantly, 24/7.

---

## 📌 What It Does

**MySymptoms** is a Clinical AI Assistant that analyzes your symptoms, age, gender, and medications to deliver safe and structured health triage guidance in seconds — powered by open-source AI.

---

## ✨ Features

- 🎙️ **Voice Input** — describe symptoms naturally by speaking
- 🫀 **3D Body Map** — tap exactly where it hurts
- 🧩 **Diagnosis Quiz** — interactive step-by-step symptom checking
- 📈 **Symptom Tracker** — log and monitor your health over time
- 🚨 **Emergency SOS Guide** — instant visual first-aid for strokes, CPR, choking and more
- 🌍 **Multi-language Support** — accessible to everyone globally
- 💊 **Drug Interaction Check** — flags dangerous medication combinations

---

## 🤖 AI Stack

| Technology | Purpose |
|---|---|
| 🦙 **LLaMA 3** (Meta) | Core AI triage engine |
| ⚡ **Groq API** | Ultra-fast model inference |

---

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| 🌐 HTML5 + CSS3 + JavaScript | Frontend UI |
| 🔐 Firebase Auth | User authentication |
| 🗄️ Firestore | Database & data persistence |
| 📊 Firebase Analytics | Performance monitoring |
| 🌐 Web Speech API | Voice input |

---

## 🏗️ Architecture

```
User Input (symptoms + age + gender + medications)
        ↓
Vanilla JS Frontend
        ↓
Firebase Auth & Firestore (user data & history)
        ↓
Structured Clinical Prompt
        ↓
Groq API → LLaMA 3
        ↓
Safe Triage Response → User
```

---

## ⚙️ How To Run

### 1️⃣ Clone the repo
```bash
git clone https://github.com/yourusername/mysymptoms.git
cd mysymptoms
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create a `.env` file
```bash
GROQ_API_KEY=your_groq_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

### 4️⃣ Run the app
```bash
npm start
```

Open `http://localhost:3000` in your browser 🚀

---

## 🎮 Demo Steps

1. Sign up or log in
2. Enter your **age** and **gender**
3. Type or **speak** your symptoms
4. Set your **pain level** on the slider
5. *(Optional)* Tap the **Body Map** to select location
6. *(Optional)* Enter your **current medications**
7. Click **"Analyze Symptoms"** 🔍
8. View your **AI triage result** ✅

---

## 🚨 Emergency SOS

1. Click **SOS Guide** in the navbar
2. Select an emergency — Heart Attack, CPR, or Choking
3. Follow instant visual first-aid instructions ⚡

---

## 🚀 What's Next

- 📸 Photo upload for AI visual symptom analysis
- 👨‍⚕️ Secure Doctor Portal for sharing symptom history
- 📱 Native iOS & Android app with offline SOS
- 🔔 Smart health reminders

---

## ⚠️ Disclaimer

> MySymptoms is an AI-assisted triage tool and does **not** replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.

---

## 📄 License

MIT License © 2025 MySymptoms Team

---

> ⭐ If you found this useful, give it a star on GitHub!
