export function validateFormJson(data) {
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

        // 4. Validate Each Question
        data.questions.forEach((q, index) => {
            // Question Text
            if (!q.question || typeof q.question !== 'string') {
                throw new Error(`Question ${index + 1} is missing text.`);
            }

            // Options (Exactly 4)
            if (!Array.isArray(q.options) || q.options.length !== 4) {
                throw new Error(`Question ${index + 1} must have exactly 4 options.`);
            }

            // Correct Option Index (0-3)
            if (
                typeof q.correct_option_index !== 'number' ||
                q.correct_option_index < 0 ||
                q.correct_option_index > 3
            ) {
                throw new Error(`Question ${index + 1} has an invalid correct_option_index (must be 0-3).`);
            }
        });

        return data; // Validated
    } catch (error) {
        console.error("Validation Error:", error.message);
        throw new Error(`JSON Validation Failed: ${error.message}`);
    }
}
