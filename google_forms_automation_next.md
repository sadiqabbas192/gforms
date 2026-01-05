# Google Forms Automation – Production Next.js App (Agentic Coding Guide)

## Audience
This document is written **for an agentic coder (Antigravity)** who will **fully implement** the system end-to-end.

The **user (Sadiq)** is **new to Next.js**, so:
- ❌ **NO TypeScript**
- ✅ **JavaScript only**
- ✅ Clear separation of **frontend routes** and **API routes**
- ✅ Clean, readable, beginner-friendly code

---

## 1. Project Goal (Very Clear)

Build a **production-ready Next.js web app** where:

1. User logs in with **Google OAuth**
2. User enters a **natural-language prompt** describing a Google Form
3. On submit:
   - Gemini generates structured MCQ JSON
   - JSON is cleaned & validated
   - Google Forms API is called using **user OAuth**
   - Google Form is created in **user’s own Google account**
4. App returns:
   - Google Form **edit link**
   - Google Form **view link**

❌ No Apps Script  
❌ No manual deployment  
✅ Fully public SaaS-ready architecture

---

## 2. Tech Stack (Locked)

| Layer | Tech |
|---|---|
Frontend | Next.js (App Router) – JavaScript |
Backend | Next.js API Routes |
LLM | Google Gemini (via REST API) |
Auth | Google OAuth 2.0 |
Forms | Google Forms API |
Styling | Tailwind CSS |
State | React useState |
Secrets | `.env.local` |

---

## 3. High-Level Architecture

```
Browser (UI)
   ↓
Next.js Frontend (/)
   ↓
POST /api/generate-form
   ↓
Gemini API (JSON generation)
   ↓
JSON validation & cleanup
   ↓
Google Forms API (OAuth token)
   ↓
Form created in user's account
   ↓
Form URLs returned to UI
```

---

## 4. Folder Structure (STRICT)

Antigravity MUST follow this structure:

```
/google-form-ai
├── app/
│   ├── page.js                # Frontend UI
│   ├── layout.js
│   └── globals.css
│
├── app/api/
│   ├── auth/
│   │   └── google/route.js    # Google OAuth handler
│   │
│   └── generate-form/
│       └── route.js           # Main automation logic
│
├── lib/
│   ├── gemini.js              # Gemini API call
│   ├── googleForms.js         # Google Forms API logic
│   └── validateJson.js        # JSON cleaning & validation
│
├── public/
│
├── .env.local
├── package.json
└── README.md
```

---

## 5. Environment Variables (MANDATORY)

```env
# Gemini
GEMINI_API_KEY=your_gemini_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# App security
APP_API_KEY=your_internal_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Google OAuth Requirements

### Scopes (MUST USE EXACTLY)
```
https://www.googleapis.com/auth/forms.body
https://www.googleapis.com/auth/drive.file
```

### OAuth Flow
- User clicks **Login with Google**
- Consent screen appears
- Access token + refresh token stored in session/cookie
- Token used for Google Forms API

---

## 7. Frontend UI Specification (VERY IMPORTANT)

### Design Language
- Minimal
- Professional
- Calm
- Clean spacing
- Neutral colors (white, gray, black)
- Soft shadows
- Rounded corners

### Page Layout (`app/page.js`)
```
---------------------------------
| Google Form AI Generator       |
|--------------------------------
| [ Textarea Prompt Input ]     |
|                               |
| Example:                      |
| "Create a quiz on Python..."|
|                               |
| [ Generate Form ]             |
|                               |
| Status / Loader               |
|                               |
| Result:                       |
| Edit Link                     |
| View Link                     |
---------------------------------
```

### UI Components
- One **large textarea**
- One **primary CTA button**
- One **loading indicator**
- One **result card**

❌ No dashboard  
❌ No clutter  
❌ No animations overload

---

## 8. Frontend Behavior

### On Submit
```js
POST /api/generate-form
Headers:
  x-app-key: APP_API_KEY

Body:
{
  "prompt": "Create a 5 question MCQ quiz on Python basics"
}
```

### Handle Responses
- Show loading
- On success → show links
- On error → show message

---

## 9. Gemini Integration (`lib/gemini.js`)

### System Prompt (STRICT)

Gemini MUST return **ONLY JSON**, no explanation.

Schema:
```json
{
  "form_title": "string",
  "is_quiz": true,
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_option_index": 0
    }
  ]
}
```

Rules:
- MCQ only
- Exactly 4 options
- Exactly 1 correct answer
- Simple language
- Educational tone

---

## 10. JSON Validation (`lib/validateJson.js`)

### Responsibilities
- Parse Gemini response
- Ensure schema correctness
- Reject malformed output
- Prevent runtime crashes

### Validation Rules
- form_title exists
- questions array length ≥ 1
- Each question has:
  - 4 options
  - correct_option_index between 0–3

---

## 11. Google Forms API Logic (`lib/googleForms.js`)

### Step 1 – Create Form
```
POST https://forms.googleapis.com/v1/forms
```

Payload:
```json
{
  "info": {
    "title": "Form Title"
  }
}
```

### Step 2 – Enable Quiz
```
POST /forms/{formId}:batchUpdate
```

### Step 3 – Add Questions (batchUpdate)
- Convert options
- Mark correct answer
- Required = true
- Type = RADIO

---

## 12. API Route (`app/api/generate-form/route.js`)

### Responsibilities
1. Validate APP_API_KEY
2. Read user OAuth token
3. Call Gemini
4. Validate JSON
5. Create Google Form
6. Add questions
7. Return URLs

### Response
```json
{
  "status": "success",
  "edit_url": "https://docs.google.com/forms/d/...",
  "view_url": "https://forms.gle/..."
}
```

---

## 13. Error Handling (Required)

- Gemini failure
- Invalid JSON
- OAuth expired
- Google API quota errors

Return:
```json
{
  "status": "error",
  "message": "Human readable error"
}
```

---

## 14. Security Rules

- Never expose Gemini key to frontend
- Never expose Google tokens to frontend
- Validate every request
- Rate-limit (basic)

---

## 15. What NOT to Build

❌ Apps Script  
❌ Server Actions (keep simple)  
❌ TypeScript  
❌ Complex state management  
❌ Database (v1)  

---

## 16. Success Criteria (Antigravity Checklist)

- [ ] User logs in with Google
- [ ] User enters prompt
- [ ] Gemini generates valid JSON
- [ ] Google Form created in user account
- [ ] Edit + View links returned
- [ ] Clean UI
- [ ] Simple JS code
- [ ] Production-safe structure

---

## 17. Final Instruction to Antigravity (IMPORTANT)

> Build **exactly** what is described.  
> Do not improvise architecture.  
> Keep JavaScript simple.  
> Comment code clearly.  
> Assume the user is a beginner in Next.js.

---

### 🚀 This document is COMPLETE.
It can be directly pasted into an agentic coder LLM and executed.

**End of specification.**