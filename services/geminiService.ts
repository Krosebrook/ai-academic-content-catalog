import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, EducationalContent, Assessment, RubricGenerationParams, RubricContent, ImageContent } from "../types/education";

// This would be in a .env file
const API_KEY = process.env.API_KEY; 
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const lessonPlanSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A UUID for the content.' },
        title: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['lesson'] },
        targetAudience: { type: Type.STRING, enum: ['educator', 'student', 'both', 'seller'] },
        subject: { type: Type.STRING },
        gradeLevel: { type: Type.STRING },
        standard: { type: Type.STRING, description: "The educational standard, if provided." },
        content: { type: Type.STRING, description: "The full lesson plan in Markdown format." },
        metadata: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING, description: "Estimated duration, e.g., '45 minutes'." },
                materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                differentiation: { type: Type.ARRAY, items: { type: Type.STRING, description: "A list of specific, actionable differentiation strategies for the specified student profiles." } },
            }
        },
        generatedAt: { type: Type.STRING, description: 'The ISO 8601 timestamp of generation.' },
    }
};

const rubricSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        rows: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    criterion: { type: Type.STRING },
                    levels: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                description: { type: Type.STRING, description: 'A detailed, objective description for this specific cell of the rubric.'},
                                points: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        },
        pointsTotal: { type: Type.NUMBER }
    }
};

const assessmentSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A UUID for the assessment.' },
        title: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['assessment']},
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: 'A UUID for the question.' },
                    type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer', 'essay', 'true-false'] },
                    prompt: { type: Type.STRING },
                    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answerKey: {
                        type: Type.STRING,
                        description: 'The correct answer. For multiple-choice with multiple answers, provide a JSON string array of the correct choices (e.g., \'["Choice A", "Choice C"]\'). For essay questions, this can be a sample answer or key points. For true/false, it should be "true" or "false".'
                    },
                    points: { type: Type.NUMBER },
                }
            }
        },
        rubric: rubricSchema,
        pointsTotal: { type: Type.NUMBER },
    }
};

export const generateImage = async (
    prompt: string,
    onChunk: (chunk: string) => void
): Promise<ImageContent | { error: string }> => {
    try {
        onChunk("Sending prompt to image generation model...");
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        onChunk("\nImage data received.");

        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

        if (!base64ImageBytes) {
            throw new Error("API did not return image data.");
        }

        const imageContent: ImageContent = {
            id: self.crypto.randomUUID(),
            title: prompt.length > 100 ? prompt.substring(0, 97) + '...' : prompt,
            type: 'image',
            prompt: prompt,
            base64Image: base64ImageBytes,
            generatedAt: new Date().toISOString(),
        };

        return imageContent;

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        let errorMessage = "Failed to generate image. Please try again.";
        if (error instanceof Error) {
            errorMessage = `Failed to generate image: ${error.message}. Please check your API key and try again.`;
        }
        return { error: errorMessage };
    }
};

export const generateContent = async (
    params: GenerationParams,
    onChunk: (chunk: string) => void
): Promise<EducationalContent | Assessment | { error: string }> => {
    
    const isAssessment = params.type === 'assessment' || params.type === 'assessment-questions';
    
    let rubricInstructions = '';
    if (isAssessment) {
        if (params.includeRubric && params.associatedRubric) {
            const rubricStructure = {
                title: params.associatedRubric.title,
                criteria: params.associatedRubric.rows.map(r => r.criterion),
                levels: params.associatedRubric.rows[0]?.levels.map(l => ({ label: l.label, points: l.points })) || []
            };
            rubricInstructions = `
- A rubric is required for this assessment. Use the following structure and generate detailed descriptions for each cell. The assessment questions should directly correspond to the criteria in this rubric.
- Rubric Structure:
  - Title: ${rubricStructure.title}
  - Criteria: ${rubricStructure.criteria.join(', ')}
  - Levels: ${rubricStructure.levels.map(l => `${l.label} (${l.points} pts)`).join(', ')}
`;
        } else if (params.includeRubric) {
            rubricInstructions = `- Also, generate a comprehensive grading rubric for this assessment. The rubric should be included in the 'rubric' field of the JSON output. It should contain 3-4 relevant criteria and 3-4 performance levels.`;
        }
    }

    const prompt = `
        You are an expert curriculum designer. Generate an ${isAssessment ? 'assessment' : params.type} for the following specifications:
        - Audience: ${params.audience}
        - Subject: ${params.subject}
        - Grade Level: ${params.grade}
        ${params.difficulty ? `- Difficulty Level: ${params.difficulty}` : ''}
        ${params.bloomsLevel ? `- Cognitive Level (Bloom's Taxonomy): ${params.bloomsLevel}. Tailor the content to this cognitive level.` : ''}
        - Topic: ${params.topic}
        ${params.standard ? `- Align to Standard: ${params.standard}` : ''}
        ${(params.objectives && params.objectives.length > 0)
            ? `- Learning Objectives:\n${params.objectives.map(o => `  - ${o}`).join('\n')}`
            : ''}
        ${(params.differentiationProfiles && params.differentiationProfiles.length > 0 && !isAssessment)
            ? `- Differentiation: Generate specific, actionable differentiation strategies for the following student profiles: ${params.differentiationProfiles.join(', ')}. These strategies should be included in the 'differentiation' array in the metadata.`
            : ''}
        ${rubricInstructions}
        
        The output must be a single JSON object that strictly adheres to the provided schema.
        ${(params.objectives && params.objectives.length > 0)
            ? `The generated ${isAssessment ? 'assessment questions' : 'lesson plan content and activities'} must directly support and align with the provided learning objectives.`
            : ''}
        Do not include any text or formatting outside of the JSON object.
    `;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: isAssessment ? assessmentSchema : lessonPlanSchema,
            },
        });

        let aggregatedJsonText = '';
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                aggregatedJsonText += chunkText;
                onChunk(chunkText);
            }
        }
        
        const result = JSON.parse(aggregatedJsonText);
        
        // Add fields not generated by AI
        if (!isAssessment) {
            (result as EducationalContent).generatedAt = new Date().toISOString();
        } else {
            (result as Assessment).generatedAt = new Date().toISOString();
            // Post-process answer keys for multiple-choice questions
            if (result.questions && Array.isArray(result.questions)) {
                result.questions.forEach((q: any) => {
                    if (q.type === 'multiple-choice' && typeof q.answerKey === 'string' && q.answerKey.startsWith('[')) {
                        try {
                            q.answerKey = JSON.parse(q.answerKey);
                        } catch (e) {
                            console.warn('Could not parse answerKey as JSON array:', q.answerKey);
                        }
                    }
                });
            }
        }

        return result;

    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        return { error: "Failed to generate content. Please check your API key and try again." };
    }
};

export const generateRubric = async (
    params: RubricGenerationParams
): Promise<RubricContent | { error: string }> => {
    const prompt = `
        You are an expert instructional designer. Your task is to generate the descriptive text for a grading rubric.
        I will provide the rubric's title, the assignment topic, the criteria, and the achievement levels with their point values.
        You must fill in the "description" for each cell in the rubric. The descriptions should be clear, objective, and specific to the criterion and achievement level.
        
        - Rubric Title: ${params.title}
        - Assignment Topic: ${params.topic}
        - Criteria: ${params.criteria.join(', ')}
        - Achievement Levels: ${params.levels.map(l => `${l.label} (${l.points} pts)`).join(', ')}

        Generate a complete JSON object for the rubric, filling in all description fields.
        The output must be a single JSON object that strictly adheres to the provided schema.
        Do not include any text or formatting outside of the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: rubricSchema,
            },
        });

        const jsonText = response.text;
        const result = JSON.parse(jsonText) as Omit<RubricContent, 'id' | 'type' | 'generatedAt'>;

        const finalRubric: RubricContent = {
            ...result,
            id: self.crypto.randomUUID(),
            type: 'rubric',
            generatedAt: new Date().toISOString(),
        };

        return finalRubric;

    } catch (error) {
        console.error("Error generating rubric with Gemini:", error);
        return { error: "Failed to generate rubric descriptions. Please try again." };
    }
};

export const generateContentSimulation = (
    params: GenerationParams,
    onProgress: (progress: number, chunk: string) => void
): Promise<EducationalContent | Assessment> => {
    return new Promise((resolve) => {
        const isAssessment = params.type === 'assessment' || params.type === 'assessment-questions';
        let progress = 0;
        let streamedContent = "";

        const interval = setInterval(() => {
            progress += 10;
            const chunk = `\nGenerating part ${progress / 10}...`;
            streamedContent += chunk;
            onProgress(progress, chunk);

            if (progress >= 100) {
                clearInterval(interval);
                const finalContent: EducationalContent | Assessment = isAssessment
                    ? {
                        id: self.crypto.randomUUID(),
                        title: `Quiz on ${params.topic}`,
                        type: 'assessment',
                        pointsTotal: 20,
                        questions: [
                            { id: self.crypto.randomUUID(), type: 'multiple-choice', prompt: `What is the capital of ${params.subject}?`, choices: ['A', 'B', 'C', 'D'], answerKey: 'A', points: 10 },
                            { id: self.crypto.randomUUID(), type: 'short-answer', prompt: 'Explain the main concept.', answerKey: 'The main concept is...', points: 10 },
                        ],
                        generatedAt: new Date().toISOString(),
                    }
                    : {
                        id: self.crypto.randomUUID(),
                        title: `Lesson Plan for ${params.topic}`,
                        type: 'lesson',
                        targetAudience: params.audience,
                        subject: params.subject,
                        gradeLevel: params.grade,
                        standard: params.standard,
                        content: `# Lesson: ${params.topic}\n\nThis is a detailed lesson plan.\n\n${streamedContent}`,
                        metadata: {
                            duration: "1 hour",
                            materials: ["Textbook", "Worksheet"],
                            objectives: ["Students will be able to..."],
                            differentiation: ["For advanced learners..."]
                        },
                        generatedAt: new Date().toISOString(),
                    };
                resolve(finalContent);
            }
        }, 300);
    });
};