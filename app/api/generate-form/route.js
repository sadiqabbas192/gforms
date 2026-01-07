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

        // 3. Parse Body & Intent
        const body = await request.json();
        const { prompt, fixed_questions = [], total_questions } = body;

        if (!prompt) {
            return Response.json({ status: 'error', message: 'Prompt is required.' }, { status: 400 });
        }

        let generateCount = 10; // Default
        let selectCount = null;
        let isMergeMode = false;

        // --- Logic Branching ---

        // Capability 2: Fixed Questions Provided
        if (Array.isArray(fixed_questions) && fixed_questions.length > 0 && total_questions) {
            isMergeMode = true;
            generateCount = parseInt(total_questions) - fixed_questions.length;

            if (generateCount <= 0) {
                return Response.json({
                    status: 'error',
                    message: `Total questions (${total_questions}) must be greater than fixed questions (${fixed_questions.length}).`
                }, { status: 400 });
            }
        }
        // Capability 1: Parse "Create N ... select M" from text
        else {
            const nSelectMPattern = /(?:create|generate|make)\s+(\d+)\s+.*?(?:select|add|use|pick|choose)\s+(\d+)/i;
            const match = prompt.match(nSelectMPattern);

            if (match) {
                generateCount = parseInt(match[1]);
                selectCount = parseInt(match[2]);

                if (selectCount > generateCount) {
                    return Response.json({
                        status: 'error',
                        message: `Cannot select ${selectCount} questions from ${generateCount} generated questions.`
                    }, { status: 400 });
                }
            } else {
                // Parse simple count "Create 50 questions"
                const simpleCountPattern = /(?:create|generate|make)\s+(\d+)/i;
                const simpleMatch = prompt.match(simpleCountPattern);
                if (simpleMatch) {
                    generateCount = parseInt(simpleMatch[1]);
                }
                // selectCount remains null (implies select all)
            }
        }

        // 4. Gemini Generation
        // We instruct Gemini to generate `generateCount` questions
        const rawData = await generateFormJson(prompt, generateCount);

        // 4.1 Check for System Prompt Error Returns
        if (rawData.error) {
            return Response.json({ status: 'error', message: rawData.error }, { status: 400 });
        }

        // 5. Validation (Strict Count Check on Generated Data)
        let formData = validateFormJson(rawData, generateCount);

        // 6. Post-Processing

        // 6.1 Capability 1: Random Selection
        if (selectCount && selectCount < formData.questions.length) {
            // Shuffle and Select
            const shuffled = formData.questions.sort(() => Math.random() - 0.5);
            formData.questions = shuffled.slice(0, selectCount);
        }

        // 6.2 Capability 2: Merging
        if (isMergeMode) {
            const safeFixed = fixed_questions.map((q, i) => {
                // Basic validation for fixed questions to prevent errors
                if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct_option_index !== 'number') {
                    throw new Error(`Fixed question at index ${i} is invalid.`);
                }
                return q;
            });

            // Check for duplicates between fixed and generated
            const fixedTexts = new Set(safeFixed.map(q => q.question.trim().toLowerCase()));
            const uniqueGenerated = formData.questions.filter(q => !fixedTexts.has(q.question.trim().toLowerCase()));

            // Merge
            formData.questions = [...safeFixed, ...uniqueGenerated];

            // Ensure total count (might be less if duplicates were removed, but mostly exact)
            if (formData.questions.length !== parseInt(total_questions)) {
                // Start with fixed, fill with unique generated. If we dropped duplicates, we might be short.
                // The prompt doesn't say what to do if duplicates reduce count, but "Fail fast" is mentioned for validation.
                // However, "Gemini output remains strictly valid JSON" was the key.
                // If we drop duplicates, we might be under the total. 
                // For now, let's respect the user instruction "Final merged questions count === total_questions".
                // If we have fewer, strict validation should probably fail? Or we can just proceed.
                // Step 5 says "Fail fast on any violation". So verify total.
                if (formData.questions.length !== parseInt(total_questions)) {
                    // Actually, if we remove duplicates, we might have fewer. It's better to error than send wrong count if strict.
                    return Response.json({
                        status: 'error',
                        message: `Generated duplications found. Result came to ${formData.questions.length}/${total_questions} questions after merge.`
                    }, { status: 400 });
                }
            }
        }

        // Final Validation of final dataset before creating form
        // Re-validate the *final* list size and structure?
        // validateFormJson checks unique in the passed generated list.
        // We merged, so we should double check uniqueness overall.
        // We essentially did that with the Set filter above.

        // 7. Create Form
        const result = await createGoogleForm(accessToken, formData);

        // 8. Success Response
        return Response.json({
            status: 'success',
            ...result,
            form_title: formData.form_title,
            questions: formData.questions
        });

    } catch (error) {
        console.error("Generate API Error:", error);
        return Response.json({
            status: 'error',
            message: error.message || 'An unexpected error occurred.'
        }, { status: 500 });
    }
}
