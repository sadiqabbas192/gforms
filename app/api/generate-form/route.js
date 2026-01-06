import { cookies } from 'next/headers';
import { generateFormJson } from '../../../lib/gemini';
import { validateFormJson } from '../../../lib/validateJson';
import { createGoogleForm } from '../../../lib/googleForms';

export async function POST(request) {
    try {
        // 1. Security Check
        const appKey = request.headers.get('x-app-key');
        if (appKey !== process.env.APP_API_KEY) {
            return Response.json({ status: 'error', message: 'Unauthorized: Invalid API Key' }, { status: 401 });
        }

        // 2. Auth Check
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('google_access_token')?.value;

        if (!accessToken) {
            return Response.json({ status: 'error', message: 'Session expired. Please log in again.' }, { status: 401 });
        }

        // 3. Parse Body
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return Response.json({ status: 'error', message: 'Prompt is required.' }, { status: 400 });
        }

        // 4. Gemini Generation
        const rawData = await generateFormJson(prompt);

        // 4.1 Check for System Prompt Guardrails
        if (rawData.error) {
            return Response.json({ status: 'error', message: rawData.error }, { status: 400 });
        }

        // 5. Validation
        const formData = validateFormJson(rawData);

        // 6. Create Form
        const result = await createGoogleForm(accessToken, formData);

        // 7. Success Response
        return Response.json({
            status: 'success',
            ...result
        });

    } catch (error) {
        console.error("Generate API Error:", error);
        return Response.json({
            status: 'error',
            message: error.message || 'An unexpected error occurred.'
        }, { status: 500 });
    }
}
