import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import {
  EducationalContent,
  Assessment,
  RubricContent,
  ImageContent,
  educationalContentSchema,
  assessmentSchema,
  rubricContentSchema,
  imageContentSchema
} from '../types/education';
import { z } from 'zod';

// According to guidelines, API key must come from process.env.API_KEY
// We initialize it once here.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for Gemini API
const lessonPlanSchemaForAPI = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        targetAudience: { type: Type.STRING, enum: ['educator', 'student', 'both', 'seller'] },
        subject: { type: Type.STRING },
        gradeLevel: { type: Type.STRING },
        standard: { type: Type.STRING, description: "The educational standard, if provided." },
        content: { type: Type.STRING, description: "The full lesson plan content in rich HTML format, including headings, lists, bold text, etc." },
        metadata: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING, description: "Estimated duration, e.g., '45 minutes'." },
                materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                differentiation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strategies for different learner needs." },
            },
            required: ['duration', 'materials', 'objectives', 'differentiation']
        }
    },
    required: ['title', 'targetAudience', 'subject', 'gradeLevel', 'content', 'metadata']
};

const assessmentSchemaForAPI = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        subject: { type: Type.STRING },
        gradeLevel: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer', 'essay', 'true-false'] },
                    prompt: { type: Type.STRING },
                    choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of choices for multiple-choice questions." },
                    answerKey: {
                        type: Type.STRING,
                        description: 'The correct answer. For multiple-choice with multiple answers, provide a JSON string array of the correct choices (e.g., \'["Choice A", "Choice C"]\'). For essay questions, this can be a sample answer or key points. For true/false, it should be "true" or "false".'
                    },
                    points: { type: Type.INTEGER },
                },
                required: ['type', 'prompt', 'answerKey', 'points']
            }
        },
    },
    required: ['title', 'subject', 'gradeLevel', 'questions']
};

const rubricSchemaForAPI = {
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
                  description: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                },
                required: ['label', 'description', 'points'],
              },
            },
          },
          required: ['criterion', 'levels'],
        },
      },
    },
    required: ['title', 'rows'],
};


export interface GenerationParams {
  toolId: string;
  toolName: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  standard?: string;
  customInstructions?: string;
  [key: string]: any; // for other params
}

async function generateAndValidate<T>(prompt: string, schemaForApi: any, zodSchema: z.ZodType<T>, model: string = 'gemini-2.5-flash'): Promise<T> {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schemaForApi,
        },
    });

    const jsonText = response.text;
    const parsedJson = JSON.parse(jsonText);

    // Validate with Zod before assigning an ID to avoid validation errors
    const tempParsedData = { ...parsedJson, id: uuidv4(), type: 'lesson', generatedAt: new Date().toISOString() };
    const validationResult = zodSchema.safeParse(tempParsedData);
    if (!validationResult.success) {
        console.error("Zod validation failed:", validationResult.error.flatten());
        throw new Error("Received invalid data structure from API.");
    }

    return parsedJson;
}

export const generateEducationalContent = async (params: GenerationParams): Promise<EducationalContent> => {
    const prompt = `
        You are an expert curriculum designer. Generate a high-quality educational resource based on the following specifications.
        The output must be a single JSON object that strictly adheres to the provided schema.
        The main 'content' field should be formatted as rich HTML.

        Tool: ${params.toolName}
        Topic: ${params.topic}
        Subject: ${params.subject}
        Grade Level: ${params.gradeLevel}
        ${params.standard ? `Align to Standard: ${params.standard}` : ''}
        ${params.customInstructions ? `Additional Instructions: ${params.customInstructions}` : ''}
    `;

    const type: EducationalContent['type'] = params.toolId.startsWith('lp-') ? 'lesson' : params.toolId.startsWith('pp-') ? 'printable' : 'activity';

    const generatedData = await generateAndValidate(prompt, lessonPlanSchemaForAPI, educationalContentSchema);

    return {
        ...generatedData,
        id: uuidv4(),
        type: type,
        generatedAt: new Date().toISOString()
    };
};

export const generateAssessment = async (params: GenerationParams): Promise<Assessment> => {
    const prompt = `
        You are an expert assessment creator. Generate a high-quality assessment based on the following specifications.
        The output must be a single JSON object that strictly adheres to the provided schema.
        For multiple choice questions with multiple correct answers, the answerKey should be a JSON string array.

        Tool: ${params.toolName}
        Topic: ${params.topic}
        Subject: ${params.subject}
        Grade Level: ${params.gradeLevel}
        ${params.standard ? `Align to Standard: ${params.standard}` : ''}
        ${params.customInstructions ? `Additional Instructions: ${params.customInstructions}` : ''}
    `;

    const generatedData = await generateAndValidate(prompt, assessmentSchemaForAPI, assessmentSchema.omit({id: true, type: true, generatedAt: true, rubric: true, pointsTotal: true, questions: true}));

    // Post-process answer keys and calculate total points
    let pointsTotal = 0;
    const questions = generatedData.questions.map((q: any) => {
        pointsTotal += q.points;
        let answerKey = q.answerKey;
        if (q.type === 'multiple-choice' && typeof q.answerKey === 'string' && q.answerKey.startsWith('[')) {
            try {
                answerKey = JSON.parse(q.answerKey);
            } catch (e) { /* ignore */ }
        }
        return { ...q, id: uuidv4(), answerKey };
    });

    const result = {
        ...generatedData,
        id: uuidv4(),
        type: 'assessment' as const,
        questions,
        pointsTotal,
        generatedAt: new Date().toISOString()
    };
    
    assessmentSchema.parse(result);
    return result;
};

export const generateRubric = async (params: GenerationParams): Promise<RubricContent> => {
    const prompt = `
        You are an expert in educational rubrics. Generate a detailed rubric based on the following specifications.
        The output must be a single JSON object that strictly adheres to the provided schema.

        Tool: ${params.toolName}
        Topic/Assignment: ${params.topic}
        Grade Level: ${params.gradeLevel}
        ${params.customInstructions ? `Additional Instructions: ${params.customInstructions}` : ''}
    `;
    
    const generatedData = await generateAndValidate(prompt, rubricSchemaForAPI, rubricContentSchema.omit({id: true, type: true, generatedAt: true}));

    const result: RubricContent = {
        ...generatedData,
        id: uuidv4(),
        type: 'rubric',
        rows: generatedData.rows.map((r: any) => ({...r, id: uuidv4()})),
        generatedAt: new Date().toISOString()
    };

    rubricContentSchema.parse(result);
    return result;
};


export const generateImage = async (prompt: string, title: string): Promise<ImageContent> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed.");
    }
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;

    const imageData: ImageContent = {
        id: uuidv4(),
        type: 'image',
        title: title || 'Generated Image',
        prompt: prompt,
        base64Image: base64ImageBytes,
        generatedAt: new Date().toISOString()
    };
    
    // Validate with Zod
    imageContentSchema.parse(imageData);

    return imageData;
};
