import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import {
    GenerationParams,
    RubricGenerationParams,
    ImageGenerationParams,
    EducationalContent,
    Assessment,
    RubricContent,
    ImageContent,
    parseEducationalContent,
    parseAssessment,
    parseRubricContent,
} from '../types/education';

// Per guidelines, initialize with named parameter. API key is from env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for JSON response validation from Gemini, based on types/education.ts
const lessonPlanSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A UUID for the content. Generate a new one.' },
        title: { type: Type.STRING, description: 'A creative and descriptive title for the lesson plan.' },
        type: { type: Type.STRING, enum: ['lesson', 'activity', 'resource', 'printable'] },
        targetAudience: { type: Type.STRING, enum: ['educator', 'student', 'both', 'seller'] },
        subject: { type: Type.STRING },
        gradeLevel: { type: Type.STRING },
        standard: { type: Type.STRING, description: "The educational standard, if provided. Can be an empty string." },
        content: { type: Type.STRING, description: "The full lesson plan content in well-structured HTML format. Use tags like <h2>, <p>, <ul>, <li>, and <strong>. Do not include <html> or <body> tags." },
        metadata: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING, description: "Estimated duration, e.g., '45 minutes'." },
                materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of materials needed." },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of clear learning objectives (e.g., 'Students will be able to...')." },
                differentiation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of strategies for differentiation." },
            },
            required: ['duration', 'materials', 'objectives', 'differentiation'],
        },
        generatedAt: { type: Type.STRING, description: 'The ISO 8601 timestamp of generation.' },
    },
    required: ['id', 'title', 'type', 'targetAudience', 'subject', 'gradeLevel', 'content', 'metadata', 'generatedAt']
};

const assessmentSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A UUID for the assessment. Generate a new one.' },
        title: { type: Type.STRING, description: 'A clear title for the assessment.' },
        type: { type: Type.STRING, enum: ['assessment']},
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: 'A UUID for the question. Generate a new one.' },
                    type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer', 'essay', 'true-false'] },
                    prompt: { type: Type.STRING, description: 'The question prompt.' },
                    choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of choices for multiple-choice questions. Omit for other types.' },
                    answerKey: {
                        type: Type.STRING,
                        description: 'The correct answer. For multiple-choice with multiple correct answers, provide a JSON string array of the correct choices (e.g., \'["Choice A", "Choice C"]\'). For essay questions, this can be a sample answer or key points. For true/false, it should be "true" or "false".'
                    },
                    points: { type: Type.NUMBER, description: 'The point value for the question.' },
                },
                required: ['id', 'type', 'prompt', 'answerKey', 'points']
            }
        },
        pointsTotal: { type: Type.NUMBER, description: 'The sum of all question points.' },
        generatedAt: { type: Type.STRING, description: 'The ISO 8601 timestamp of generation.' },
    },
    required: ['id', 'title', 'type', 'questions', 'pointsTotal', 'generatedAt']
};

const rubricSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        pointsTotal: { type: Type.NUMBER },
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
                                description: { type: Type.STRING, description: "A detailed description of what this level of achievement looks like for the criterion." },
                                points: { type: Type.NUMBER },
                            },
                            required: ['label', 'description', 'points']
                        }
                    }
                },
                required: ['criterion', 'levels']
            }
        }
    },
    required: ['title', 'rows', 'pointsTotal']
};


export const generateEducationalContent = async (params: GenerationParams): Promise<EducationalContent | Assessment | { error: string }> => {
    try {
        const isAssessment = params.type.startsWith('assessment');
        let prompt = `You are an expert curriculum designer and teacher. Generate a high-quality, ready-to-use '${params.type}' for the following specifications. The output must be a single, valid JSON object that strictly adheres to the provided schema.\n\n`;
        prompt += `**Audience:** ${params.audience}\n`;
        prompt += `**Subject:** ${params.subject}\n`;
        prompt += `**Grade Level:** ${params.grade}\n`;
        prompt += `**Topic:** ${params.topic}\n`;
        if (params.standard) prompt += `**Align to Standard:** ${params.standard}\n`;
        if (params.objectives) prompt += `**Learning Objectives:** ${params.objectives.join(', ')}\n`;
        if (params.difficulty) prompt += `**Difficulty:** ${params.difficulty}\n`;
        if (params.bloomsLevel) prompt += `**Bloom's Taxonomy Level:** ${params.bloomsLevel}\n`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using pro for complex generation
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: isAssessment ? assessmentSchema : lessonPlanSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        
        // Post-processing to ensure data integrity
        data.id = uuidv4();
        data.generatedAt = new Date().toISOString();
        if (isAssessment) {
            data.questions.forEach((q: any) => {
                q.id = uuidv4();
                 // Attempt to parse stringified array for answer key
                if (q.type === 'multiple-choice' && typeof q.answerKey === 'string' && q.answerKey.startsWith('[')) {
                    try { q.answerKey = JSON.parse(q.answerKey); } catch (e) { /* ignore */ }
                }
            });
            const validation = parseAssessment(data);
            if (validation.success) return validation.data;
            return { error: `AI response validation failed: ${validation.error.message}` };
        } else {
            const validation = parseEducationalContent(data);
            if (validation.success) return validation.data;
            return { error: `AI response validation failed: ${validation.error.message}` };
        }
    } catch (e: any) {
        console.error("Error generating educational content:", e);
        return { error: e.message || "An unknown error occurred while generating content." };
    }
};

export const generateRubric = async (params: RubricGenerationParams): Promise<RubricContent | { error: string }> => {
    try {
        let prompt = `You are an expert educator. Your task is to generate the descriptive text for a grading rubric. You will be given the rubric's structure (title, topic, criteria, and achievement levels with points). Fill in the 'description' field for each level of each criterion with clear, specific, and helpful language. The output must be a single, valid JSON object that strictly adheres to the provided schema.\n\n`;
        prompt += `**Rubric Title:** ${params.title}\n`;
        prompt += `**Assignment Topic:** ${params.topic}\n`;
        prompt += `**Criteria:** ${params.criteria.join(', ')}\n`;
        prompt += `**Achievement Levels:** ${params.levels.map(l => `${l.label} (${l.points} pts)`).join(', ')}\n`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: rubricSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        
        const rubricData = { ...data, id: uuidv4(), type: 'rubric', generatedAt: new Date().toISOString() };
        const validation = parseRubricContent(rubricData);

        if (validation.success) {
            return validation.data;
        } else {
            return { error: `AI response validation failed: ${validation.error.message}` };
        }
    } catch (e: any) {
        console.error("Error generating rubric:", e);
        return { error: e.message || "An unknown error occurred while generating rubric." };
    }
};


export const generateImage = async (params: ImageGenerationParams): Promise<ImageContent | { error: string }> => {
    try {
        const finalPrompt = (params.style && params.style.toLowerCase() !== 'default')
            ? `${params.style} style, ${params.prompt}`
            : params.prompt;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001', // High-quality image model
            prompt: finalPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: params.aspectRatio,
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;

        if (!base64ImageBytes) {
            return { error: "The AI did not return an image. Please try a different prompt." };
        }

        const imageContent: ImageContent = {
            id: uuidv4(),
            title: params.prompt,
            type: 'image',
            prompt: params.prompt,
            base64Image: base64ImageBytes,
            generatedAt: new Date().toISOString(),
        };

        return imageContent;
    } catch (e: any) {
        console.error("Error generating image:", e);
        return { error: e.message || "An unknown error occurred while generating the image." };
    }
};

export async function* streamedRefineText(instruction: string, textToRefine: string): AsyncGenerator<string, void, unknown> {
    try {
        const prompt = `You are an expert editor. Follow the user's instruction to refine the provided text. Return only the refined text, without any preamble or explanation.\n\n**Instruction:** ${instruction}\n\n**Text to Refine:**\n---\n${textToRefine}\n---`;
        
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error refining text:", error);
        yield "Error: Could not refine the text.";
    }
}