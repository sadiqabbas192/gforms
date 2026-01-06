# Deploying to Vercel

This guide will help you deploy your Google Forms AI Generator to Vercel.

## Prerequisites
- A GitHub account (to push your code).
- A Vercel account (login with GitHub).

## Step 1: Push Code to GitHub
1. Initialize git if you haven't:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub.
3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.
4. **Framework Preset**: standard "Next.js".

## Step 3: Configure Environment Variables (CRITICAL)
In the "Environment Variables" section of the Vercel deployment screen, add the following. 

**Wait to deploy** until you have the URL, or deploy once, get the URL, and then redeploy. 
*Actually, Vercel gives you a domain like `project-name.vercel.app` automatically.*

Add these variables:

| Variable Name | Value | Description |
|---|---|---|
| `GEMINI_API_KEY` | `...` | Your Gemini Key |
| `GOOGLE_CLIENT_ID` | `...` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | `...` | Your Google Client Secret |
| `APP_API_KEY` | `some_random_secure_string` | Internal security key |
| `NEXT_PUBLIC_APP_API_KEY` | `same_random_string_as_above` | Client-side security key |
| `NEXT_PUBLIC_APP_URL` | `https://your-project-name.vercel.app` | **Target Vercel Domain** |

> **Note:** If you don't know your domain yet, enter `https://temp.com` for now, deploy, copy the resulting domain, update the variable in Project Settings, and redeploy.

## Step 4: Update Google Cloud Console
**This is the most important step for Auth to work.**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Credential.
3. **Authorized JavaScript Origins**:
   - Add: `https://your-project-name.vercel.app`
4. **Authorized Redirect URIs**:
   - Add: `https://your-project-name.vercel.app/api/auth/google`

## Step 5: Final Redeploy
If you changed environment variables after the first build, go to **Deployments** in Vercel, click the three dots on the latest build, and select **Redeploy**.

---

## Troubleshooting
- **Error 400: redirect_uri_mismatch**: This means the URL in your browser (`.../api/auth/google`) does not EXACTLY match what is in Google Console.
- **Error 500 during generation**: Check if `GEMINI_API_KEY` is correct in Vercel settings.
