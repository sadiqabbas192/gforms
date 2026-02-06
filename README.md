# 🚀 Prompt → Google Form (Agentic AI)

Create **Google Forms instantly using natural language prompts**.  
This open-source **Agentic AI project** converts plain English instructions into **fully functional Google Forms quizzes (MCQs)** — created **directly in your Google account**.

🔗 **Live Demo (Vercel):** https://gforms.vercel.app  
⭐ **Star the repo if you find it useful — it really helps!**

---

## ✨ Why This Project?

Most AI tools stop at *text generation*.

This project goes further by demonstrating **Agentic AI**:
- The AI **understands intent**
- Makes **structured decisions**
- Takes **real actions** using APIs
- Produces a **usable artifact** (Google Form)

👉 From **prompt → action → result**, not just chat.

---

## 🧠 What This App Can Do

- Generate **MCQ-based quizzes** using natural language
- Automatically enable **Quiz mode**
- Guarantee **exact question counts**
- Mix **user-provided questions + AI-generated questions**
- Randomly select questions for variation
- Create forms **directly inside your Google account**

✅ Built for **teachers, trainers, students, and AI builders**

---

## 🧩 Supported Prompting Capabilities

### 1️⃣ Basic Quiz Creation

**Prompt**
```text
Create a 10 question MCQ quiz on Python basics
````

**Result**

* 10 MCQs
* 4 options per question
* 1 correct answer
* Quiz mode enabled
* Form created in Google Forms

---

### 2️⃣ Topic + Difficulty Based Quiz

**Prompt**

```text
Create a 15 question quiz on DBMS with easy to medium difficulty
```

✔ Difficulty respected
✔ Language kept simple

---

### 3️⃣ Random Question Selection (Variation)

**Prompt**

```text
Create 50 MCQ questions on Operating Systems and add 30 questions randomly to the form
```

✔ AI generates 50
✔ Backend safely selects 30
✔ Each run produces variation

---

### 4️⃣ Use Your Own MCQs + Auto-Complete

**Prompt**

```text
I already have 10 MCQs on Computer Networks. Create the remaining questions so the total number of questions is 25.
```

✔ Your questions are preserved
✔ AI fills only the missing ones
✔ Final count is guaranteed

---

### 5️⃣ Guaranteed Total Question Count

**Examples**

```text
Create a quiz with exactly 20 MCQs on Data Structures
```

```text
I have 5 MCQs already. Generate the rest so the total is 15.
```

✔ System always enforces exact totals

---

## 🚫 What Is NOT Supported (By Design)

To keep the system **reliable and predictable**, these are intentionally blocked:

* Non-MCQ questions
* More or less than 4 options
* Multiple correct answers
* Negative marking
* Subjective or opinion-based prompts
* Non-educational content

Unsupported requests return **clear validation errors**.

---

## ✅ Feature Summary

| Feature                      | Supported |
| ---------------------------- | --------- |
| MCQ quiz generation          | ✅         |
| Random question selection    | ✅         |
| User-provided MCQs           | ✅         |
| Guaranteed question count    | ✅         |
| Quiz mode enabled            | ✅         |
| Google account form creation | ✅         |

---

## 🏗️ Architecture Overview

### Frontend

* `app/page.js` – UI (Next.js App Router)

### Authentication

* `app/api/auth/google/route.js` – Manual OAuth flow

### Backend (Agent Orchestration)

* `app/api/generate-form/route.js` – Gemini + Google Forms API controller

### Core Libraries

* `lib/gemini.js` – Structured JSON generation
* `lib/googleForms.js` – Google Forms creation & updates
* `lib/validateJson.js` – Strict schema validation

---

## ⚙️ Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Environment Variables

```bash
cp env_template.txt .env.local
```

Fill in:

* Google OAuth credentials
* Gemini API Key
* Secure values for:

  * `APP_API_KEY`
  * `NEXT_PUBLIC_APP_API_KEY`

---

### 3️⃣ Google OAuth Configuration

* Create OAuth 2.0 credentials
* Authorized Redirect URI:

```text
http://localhost:3010/api/auth/google
```

* Enable APIs:

  * Google Forms API
  * Google Drive API

---

### 4️⃣ Run Locally

```bash
npm run dev
```

---

## 🧪 Design Notes

* Strict schema validation (no hallucinated forms)
* Deterministic question counts
* No TypeScript (intentional simplicity)
* Tailwind CSS for styling

---

## 🤝 Contributing

Contributions are welcome!

* Ideas
* Issues
* Pull requests
* Improvements to agent logic

⭐ If this project helped you, please **star the repository**
🍴 Fork it and build on top of it!

---

## 📌 Future Enhancements

* Support non-MCQ questions
* Analytics on generated forms
* Prompt templates
* Multi-language support

---

### Built with ❤️ to explore **Agentic AI beyond chat**
