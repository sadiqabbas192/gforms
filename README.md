# Google Forms Automation (Next.js)

This is a production-ready Next.js application that uses AI to generate Google Forms.

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
