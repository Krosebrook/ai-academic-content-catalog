
// FIX: Add a Deno global type definition to resolve "Cannot find name 'Deno'" errors
// in environments where Deno's types are not automatically available. This replaces
// the /// <reference lib="deno.unstable" /> directive which was causing a
// "Cannot find lib definition" error.
declare const Deno: any;

// Note: This is a Deno-based Supabase Edge Function.
// It requires setting the SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY environment variables in Supabase.
// FIX: Corrected import path for @google/genai to a more recent version.
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@0.8.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const generationParamsSchema = z.object({
  audience: z.enum(['educator', 'student', 'both', 'seller']),
  type: z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']),
  subject: z.string(),
  grade: z.string(),
  topic: z.string(),
  standard: z.string().optional(),
});

// FIX: Completed the schema definitions for consistent and valid JSON output.
const lessonPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        targetAudience: { type: Type.STRING, enum: ['educator', 'student', 'both', 'seller'] },
        subject: { type: Type.STRING },
        gradeLevel: { type: Type.STRING },
        standard: { type: Type.STRING, description: "The educational standard, if provided." },
        content: { type: Type.STRING, description: "The full lesson plan in rich HTML format, including headings, lists, bold text, etc." },
        metadata: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING, description: "Estimated duration, e.g., '45 minutes'." },
                materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                differentiation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strategies for different learner needs." },
            },
            required: ["duration", "materials", "objectives", "differentiation"]
        },
    },
    required: ["title", "targetAudience", "subject", "gradeLevel", "content", "metadata"]
};
const assessmentSchema = {
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
                required: ["type", "prompt", "answerKey", "points"]
            }
        },
    },
    required: ["title", "subject", "gradeLevel", "questions"]
};


Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const body = await req.json();
    const validation = generationParamsSchema.safeParse(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const params = validation.data;
    const isAssessment = params.type === 'assessment';
    
    const API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }
    // FIX: Corrected GoogleGenAI initialization to use a named `apiKey` parameter.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `
        You are an expert curriculum designer. Generate an ${params.type} for the following specifications:
        - Audience: ${params.audience}
        - Subject: ${params.subject}
        - Grade Level: ${params.grade}
        - Topic: ${params.topic}
        ${params.standard ? `- Align to Standard: ${params.standard}` : ''}
        
        The output must be a single JSON object that strictly adheres to the provided schema. For lesson plans, the content field must be rich HTML.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: isAssessment ? assessmentSchema : lessonPlanSchema,
        },
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);

    if (isAssessment) {
        if (result.questions && Array.isArray(result.questions)) {
            result.questions.forEach((q: any) => {
                if (q.type === 'multiple-choice' && typeof q.answerKey === 'string' && q.answerKey.startsWith('[')) {
                    try {
                        q.answerKey = JSON.parse(q.answerKey);
                    } catch (e) {
                        // Ignore if parsing fails, leave as string.
                    }
                }
            });
        }
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    });
  }
});
