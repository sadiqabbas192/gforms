export function validateFormJson(data, expectedCount = null) {
    try {
        // 1. Check Root Object
        if (!data || typeof data !== 'object') {
            throw new Error("Response is not a valid JSON object.");
        }

        // 2. Check Form Title
        if (!data.form_title || typeof data.form_title !== 'string') {
            throw new Error("Missing 'form_title' in response.");
        }

        // 3. Check Questions Array
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
            throw new Error("Response must contain at least one question.");
        }

        // 3.1 Strict Count Check
        if (expectedCount !== null && data.questions.length !== expectedCount) {
            throw new Error(`Expected exactly ${expectedCount} questions, but got ${data.questions.length}.`);
        }

        // 4. Validate Each Question
        const seenQuestions = new Set();

        data.questions.forEach((q, index) => {
            // Question Text
            if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
                throw new Error(`Question ${index + 1} is missing text or empty.`);
            }

            // Uniqueness Check
            const qKey = q.question.trim().toLowerCase();
            if (seenQuestions.has(qKey)) {
                throw new Error(`Duplicate question found: "${q.question}"`);
            }
            seenQuestions.add(qKey);

            // Validate Type
            const validTypes = ['radio', 'checkbox', 'text', 'paragraph'];
            if (!q.type || !validTypes.includes(q.type)) {
                // Fallback for legacy prompts or missing type -> assume radio if options exist
                if (Array.isArray(q.options) && q.options.length > 0) {
                    q.type = 'radio';
                } else {
                    q.type = 'text'; // Default to text if no options
                }
            }

            // Validate Options based on Type
            if (q.type === 'radio' || q.type === 'checkbox') {
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    throw new Error(`Question ${index + 1} (${q.type}) must have at least 2 options.`);
                }

                // Validate Correct Option Index (Optional now, but if present must be valid)
                if (q.correct_option_index !== undefined && q.correct_option_index !== null) {
                    if (
                        typeof q.correct_option_index !== 'number' ||
                        q.correct_option_index < 0 ||
                        q.correct_option_index >= q.options.length
                    ) {
                        throw new Error(`Question ${index + 1} has an invalid correct_option_index.`);
                    }
                }
            } else {
                // Text/Paragraph should not have options (or ignore them)
                // We don't need to throw error, just ensure we don't use them or maybe clear them.
                // strict validation might fail if prompt generates options for text. 
                // Let's just ignore.
            }
        });

        return data; // Validated
    } catch (error) {
        console.error("Validation Error:", error.message);
        throw new Error(`JSON Validation Failed: ${error.message}`);
    }
}
