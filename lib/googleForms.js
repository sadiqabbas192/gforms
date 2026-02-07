import { google } from 'googleapis';

export async function createGoogleForm(accessToken, formData) {
    try {
        // 1. Setup Auth
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const forms = google.forms({ version: 'v1', auth });

        // 2. Create the Form
        const createResponse = await forms.forms.create({
            requestBody: {
                info: {
                    title: formData.form_title,
                    documentTitle: formData.form_title,
                },
            },
        });

        const formId = createResponse.data.formId;
        const viewUrl = createResponse.data.responderUri;
        const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

        // 3. Prepare Batch Requests (Enable Quiz + Add Questions)
        const requests = [];

        // 3.1 Enable Quiz Mode
        if (formData.is_quiz) {
            requests.push({
                updateSettings: {
                    settings: {
                        quizSettings: {
                            isQuiz: true,
                        },
                    },
                    updateMask: 'quizSettings.isQuiz',
                },
            });
        }

        // 3.2 Add Questions
        formData.questions.forEach((q, index) => {
            requests.push({
                createItem: {
                    item: {
                        title: q.question,
                        questionItem: {
                            question: {
                                required: true,
                                question: {
                                    required: true,
                                    grading: (q.type === 'radio' && typeof q.correct_option_index === 'number') ? {
                                        pointValue: 1,
                                        correctAnswers: {
                                            answers: [{ value: q.options[q.correct_option_index] }],
                                        },
                                    } : undefined,

                                    // Choice Question (Radio / Checkbox)
                                    choiceQuestion: (q.type === 'radio' || q.type === 'checkbox') ? {
                                        type: q.type.toUpperCase(), // RADIO or CHECKBOX
                                        options: q.options.map((opt) => ({ value: opt })),
                                        shuffle: q.type === 'radio', // Shuffle only for radio usually
                                    } : undefined,

                                    // Text Question (Short / Paragraph)
                                    textQuestion: (q.type === 'text' || q.type === 'paragraph') ? {
                                        paragraph: q.type === 'paragraph'
                                    } : undefined
                                },
                            },
                        },
                    },
                    location: {
                        index: index,
                    },
                },
            });
        });

        // 4. Execute Batch Update
        await forms.forms.batchUpdate({
            formId: formId,
            requestBody: {
                requests: requests,
            },
        });

        return {
            edit_url: editUrl,
            view_url: viewUrl,
        };
    } catch (error) {
        console.error("Google Forms API Error:", error);
        throw new Error("Failed to create Google Form. Please check your permissions.");
    }
}
