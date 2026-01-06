import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // Callback URL must strictly match what you registered in Google Cloud Console
    // We use the same route for both initiation and callback to keep file structure minimal
    // HARDCODED to ensure exact match with Google Console (bypassing potential Env Var typos)
    const redirectUri = 'https://gforms-two.vercel.app/api/auth/google';

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );

    // 1. If 'code' is present, this is the callback from Google
    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code);

            // Store tokens in HTTP-only cookies
            const cookieStore = await cookies();

            cookieStore.set('google_access_token', tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600, // 1 hour expiration usually
                path: '/',
                sameSite: 'lax'
            });

            // Set a non-httpOnly cookie for the client to know it's logged in
            cookieStore.set('is_authenticated', 'true', {
                httpOnly: false, // Client can read
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600,
                path: '/',
                sameSite: 'lax'
            });

            if (tokens.refresh_token) {
                cookieStore.set('google_refresh_token', tokens.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: '/',
                    sameSite: 'lax'
                });
            }

            // successfully logged in, redirect to home
            return redirect('/');

        } catch (error) {
            console.error("OAuth Token Exchange Error:", error);
            return Response.json({ error: "Failed to authenticate with Google." }, { status: 500 });
        }
    }

    // 2. If 'code' is NOT present, initiate the OAuth flow
    const scopes = [
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/drive.file',
        // We don't strictly need userinfo.email for the logic, but usually good for UI? 
        // Spec doesn't require showing user email, only Creating Form.
        // Stick to Spec Scopes exactly.
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // get refresh token
        scope: scopes,
        include_granted_scopes: true,
        prompt: 'consent' // force refresh token generation
    });

    console.log("FINAL GOOGLE OAUTH URL:", authUrl);

    return redirect(authUrl);
}
