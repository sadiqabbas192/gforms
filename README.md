# Google Forms Automation (Next.js)

This is a production-ready Next.js application that uses AI to generate Google Forms. It allows users to create quizzes and forms instantly using natural language prompts, leveraging the power of Google Gemini and the Google Forms API.

## 🧠 Supported Prompting Capabilities

This app supports **natural-language prompts** to generate **Google Forms quizzes (MCQs)**.
All forms are created **directly in your Google account**.

Below are the **supported ways you can prompt the system**.

---

### 1️⃣ Basic Quiz Creation

Create a simple MCQ-based quiz.

**Example prompt:**

```
Create a 10 question MCQ quiz on Python basics
```

**What happens:**

* AI generates 10 MCQs
* Each question has 4 options
* Quiz mode is enabled
* Each question carries 1 mark
* Form is created in your Google account

---

### 2️⃣ Topic + Difficulty Based Quiz

You can mention topic and difficulty level.

**Example prompt:**

```
Create a 15 question quiz on DBMS with easy to medium difficulty
```

**What happens:**

* Questions match the given subject
* Difficulty stays easy to medium
* Language remains simple and clear

---

### 3️⃣ Generate More Questions Than Needed (Random Selection)

You can ask the system to **generate many questions** but **add only some of them randomly** to the Google Form.

**Example prompt:**

```
Create 50 MCQ questions on Operating Systems and add 30 questions randomly to the form
```

**What happens:**

* AI generates 50 questions
* System randomly selects 30 questions
* Only the selected 30 are added to the Google Form
* Random selection is handled safely by the backend

✅ Useful when you want **variation** each time you create a form.

---

### 4️⃣ Use Your Own MCQs + Auto Complete Remaining Questions

You can provide **some MCQs yourself**, and let the system generate the rest.

**Example prompt:**

```
I already have 10 MCQs on Computer Networks. Create the remaining questions so that the total number of questions is 25.
```

**What happens:**

* Your provided questions are **always included**
* AI generates only the remaining required questions
* Total questions in the final form = 25
* Your original questions are **never modified or removed**

✅ Ideal for teachers who already prepared part of the quiz.

---

### 5️⃣ Fixed Total Question Count (Guaranteed)

Whenever you specify a total number of questions, the system **guarantees** the final form matches that count exactly.

**Example prompts:**

```
Create a quiz with exactly 20 MCQs on Data Structures
```

```
I have 5 MCQs already. Generate the rest so the total is 15.
```

---

## 🚫 What Is NOT Supported

To keep the system reliable and safe, the following are **not supported**:

* Non-MCQ question types (short answer, paragraph, etc.)
* Less or more than 4 options per question
* Multiple correct answers
* Negative marking
* Subjective or opinion-based questions
* Non-educational or unrelated prompts

If an unsupported request is made, the system will return an error.

---

## ✅ Summary of Capabilities

| Feature | Supported |
| :--- | :--- |
| Basic MCQ quiz | ✅ |
| Random question selection | ✅ |
| User-provided MCQs | ✅ |
| Guaranteed total question count | ✅ |
| Quiz mode enabled | ✅ |
| Google account form creation | ✅ |

---

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   - Copy `env_template.txt` to `.env.local`:
     ```bash
     cp env_template.txt .env.local
     ```
   - Fill in your Google Cloud credentials and Gemini API Key.
   - Set a secure random string for `APP_API_KEY` and `NEXT_PUBLIC_APP_API_KEY`.

3. **Google OAuth Setup:**
   - Go to Google Cloud Console.
   - Create OAuth 2.0 Credentials.
   - Authorized Redirect URI: `http://localhost:3010/api/auth/google` (matches strict structure).
   - Enable APIs: `Google Forms API`, `Google Drive API`.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Architecture

- **Frontend:** `app/page.js` (Client-side UI).
- **Auth:** `app/api/auth/google/route.js` (Manual OAuth flow).
- **Backend:** `app/api/generate-form/route.js` (Orchestrates Gemini + Forms API).
- **Libraries:**
  - `lib/gemini.js`: Generates JSON.
  - `lib/googleForms.js`: Creates/Updates Forms.
  - `lib/validateJson.js`: Ensures data integrity.

## Notes
- Strict adherence to spec.
- No TypeScript.
- Tailwind CSS used for styling.
