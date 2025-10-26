
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import {
  EducationalContent,
  Assessment,
  RubricContent,
  ImageContent,
  Source,
  educationalContentSchema,
  assessmentSchema,
  rubricContentSchema,
  imageContentSchema,
  rubricRowSchema
} from '../types/education';
import { getPersona } from '../api/apiService';
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
  useGrounding?: boolean;
  packageContents?: string[]; // For package generation
  [key: string]: any; // for other params
}

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

async function generateAndValidate<S extends z.ZodType<any>>(
    prompt: string, 
    schemaForApi: any, 
    zodSchema: S, 
    useGrounding: boolean, 
    model: string = 'gemini-2.5-flash'
): Promise<{ data: z.infer<S>; sources?: Source[] }> {
    
    const persona = await getPersona(); // Now async
    const config: any = {};
    if (persona) {
        config.systemInstruction = persona;
    }

    if (useGrounding) {
        config.tools = [{googleSearch: {}}];
    } else {
        config.responseMimeType = 'application/json';
        config.responseSchema = schemaForApi;
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config,
    });

    const jsonText = response.text;
    
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error("Could not find a valid JSON object in the API response.");
    }
    const parsableText = jsonMatch[1] || jsonMatch[2];
    const parsedJson = JSON.parse(parsableText);

    const validationResult = zodSchema.safeParse(parsedJson);
    if (!validationResult.success) {
        console.error("Zod validation failed:", validationResult.error.flatten());
        throw new Error("Received invalid data structure from API.");
    }

    let sources: Source[] | undefined;
    if (useGrounding) {
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            sources = groundingChunks
                .map((chunk: any) => ({
                    uri: chunk.web?.uri,
                    title: chunk.web?.title,
                }))
                .filter((s: any) => s.uri && s.title);
        }
    }

    return { data: validationResult.data, sources };
}


export const generateEducationalContent = async (params: GenerationParams, userId: string, lessonContext: string = ''): Promise<Omit<EducationalContent, 'id' | 'user_id' | 'generatedAt'>> => {
    const prompt = `
        You are an expert curriculum designer. Generate a high-quality educational resource based on the following specifications.
        The output must be a single JSON object that strictly adheres to the provided schema.
        The main 'content' field should be formatted as rich HTML.
        
        ${params.useGrounding ? 'Use your knowledge and the provided search results to create an accurate and informative response.' : ''}
        ${lessonContext ? `Base this resource on the following context: ${lessonContext}` : ''}

        Tool: ${params.toolName}
        Topic: ${params.topic}
        Subject: ${params.subject}
        Grade Level: ${params.gradeLevel}
        ${params.standard ? `Align to Standard: ${params.standard}` : ''}
        ${params.customInstructions ? `Additional Instructions: ${params.customInstructions}` : ''}
    `;

    const type: EducationalContent['type'] = params.toolId.startsWith('lp-') ? 'lesson' : params.toolId.startsWith('pp-') ? 'printable' : 'activity';

    const zodSchema = educationalContentSchema.omit({ id: true, user_id: true, generatedAt: true, toolId: true, collectionId: true, sources: true, type: true });
    const { data, sources } = await generateAndValidate(prompt, lessonPlanSchemaForAPI, zodSchema, !!params.useGrounding);

    return {
        ...data,
        type: type,
        sources: sources,
        toolId: params.toolId,
    };
};

export const generateAssessment = async (params: GenerationParams, userId: string, lessonContext: string = ''): Promise<Omit<Assessment, 'id' | 'user_id' | 'generatedAt'>> => {
    const prompt = `
        You are an expert assessment creator. Generate a high-quality assessment based on the following specifications.
        The output must be a single JSON object that strictly adheres to the provided schema.
        For multiple choice questions with multiple correct answers, the answerKey should be a JSON string array.
        
        ${params.useGrounding ? 'Use your knowledge and the provided search results to create accurate and relevant questions.' : ''}
        ${lessonContext ? `Base this assessment on the following lesson content to ensure relevance: ${lessonContext}` : ''}

        Tool: ${params.toolName}
        Topic: ${params.topic}
        Subject: ${params.subject}
        Grade Level: ${params.gradeLevel}
        ${params.standard ? `Align to Standard: ${params.standard}` : ''}
        ${params.customInstructions ? `Additional Instructions: ${params.customInstructions}` : ''}
    `;

    const apiResponseSchema = z.object({
        title: z.string(),
        subject: z.string(),
        gradeLevel: z.string(),
        questions: z.array(z.object({
            type: z.enum(['multiple-choice', 'short-answer', 'essay', 'true-false']),
            prompt: z.string(),
            choices: z.array(z.string()).optional(),
            answerKey: z.string(), // API returns string, we parse it later
            points: z.number().int(),
        }))
    });

    const { data, sources } = await generateAndValidate(prompt, assessmentSchemaForAPI, apiResponseSchema, !!params.useGrounding);

    let pointsTotal = 0;
    const questions = data.questions.map((q) => {
        pointsTotal += q.points;
        let answerKey: string | string[] = q.answerKey;
        if (q.type === 'multiple-choice' && typeof q.answerKey === 'string' && q.answerKey.startsWith('[')) {
            try { answerKey = JSON.parse(q.answerKey); } catch (e) { /* ignore */ }
        }
        return { ...q, id: uuidv4(), answerKey };
    });

    return {
        ...data,
        type: 'assessment' as const,
        questions,
        pointsTotal,
        sources: sources,
        toolId: params.toolId,
    };
};

export const generateRubric = async (params: GenerationParams, userId: string): Promise<Omit<RubricContent, 'id' | 'user_id' | 'generatedAt'>> => {
    const prompt = `
        You are an expert in educational rubrics. Generate a detailed rubric based on the following specifications.
        The output must be a single JSON object that strictly adheres to the provided schema.

        Tool: ${params.toolName}
        Topic/Assignment: ${params.topic}
        Grade Level: ${params.gradeLevel}
        ${params.customInstructions ? `Additional Instructions: ${params.customInstructions}` : ''}
    `;
    
    const apiResponseSchema = rubricContentSchema.omit({id: true, user_id: true, type: true, generatedAt: true, toolId: true, collectionId: true});

    const { data } = await generateAndValidate(prompt, rubricSchemaForAPI, apiResponseSchema, false);

    return {
        ...data,
        type: 'rubric',
        rows: data.rows.map((r) => ({...r, id: uuidv4()})),
        toolId: params.toolId,
    };
};


export const generateImage = async (params: GenerationParams, userId: string): Promise<Omit<ImageContent, 'id' | 'user_id' | 'generatedAt'>> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: params.topic,
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

    // FIX: Added subject and gradeLevel to the return object to match the ImageContent type.
    return {
        type: 'image',
        title: `Image for ${params.subject}: ${params.topic}`,
        prompt: params.topic,
        base64Image: base64ImageBytes,
        toolId: params.toolId,
        subject: params.subject,
        gradeLevel: params.gradeLevel,
    };
};

export const generateContentPackage = async (params: GenerationParams, userId: string, onProgress: (message: string) => void): Promise<StorableContent[]> => {
    const results: StorableContent[] = [];
    let lessonContext = '';

    // 1. Generate Lesson Plan
    if (params.packageContents?.includes('lesson')) {
        onProgress('Generating Lesson Plan...');
        const lessonParams: GenerationParams = {...params, toolId: 'lp-01', toolName: 'Differentiated Lesson Plan' };
        const lessonData = await generateEducationalContent(lessonParams, userId);
        const lesson = { ...lessonData, id: uuidv4(), user_id: userId, generatedAt: new Date().toISOString() };
        results.push(lesson);
        lessonContext = lesson.content; // Use this for other generations
    }

    // 2. Generate Assessment
    if (params.packageContents?.includes('assessment')) {
        onProgress('Generating Assessment...');
        const assessmentParams: GenerationParams = {...params, toolId: 'as-01', toolName: 'Multiple Choice Quiz' };
        const assessmentData = await generateAssessment(assessmentParams, userId, lessonContext);
        const assessment = { ...assessmentData, id: uuidv4(), user_id: userId, generatedAt: new Date().toISOString() };
        results.push(assessment);
    }

    // 3. Generate Study Guide (as an 'activity' type)
    if (params.packageContents?.includes('study-guide')) {
        onProgress('Generating Study Guide...');
        const studyGuideParams: GenerationParams = {...params, toolId: 'sa-02', toolName: 'Smart Study Guide', customInstructions: "Create a concise study guide based on the provided lesson context. Include key vocabulary, main concepts, and a few practice questions." };
        const studyGuideData = await generateEducationalContent(studyGuideParams, userId, lessonContext);
        studyGuideData.title = `Study Guide for: ${params.topic}`;
        const studyGuide = { ...studyGuideData, id: uuidv4(), user_id: userId, generatedAt: new Date().toISOString() };
        results.push(studyGuide);
    }

    onProgress('Package generation complete!');
    return results;
};


// Phase 5: Student Assistant
export async function getTutorResponse(content: string, studentQuestion: string): Promise<string> {
    const prompt = `
      You are a helpful AI teaching assistant. Your knowledge is strictly limited to the provided text below.
      Answer the student's question based *only* on this text. Do not use any outside information.
      If the answer is not in the text, say "I'm sorry, but I can only answer questions about the provided lesson material."

      --- LESSON MATERIAL ---
      ${content}
      --- END LESSON MATERIAL ---

      Student's Question: "${studentQuestion}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
}
