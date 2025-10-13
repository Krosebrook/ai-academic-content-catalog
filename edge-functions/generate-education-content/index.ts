
// FIX: Added a triple-slash directive to include Deno types and resolve "Cannot find name 'Deno'" errors.
/// <reference lib="deno.ns" />

// Note: This is a Deno-based Supabase Edge Function.
// It requires setting the SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY environment variables in Supabase.
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@0.1.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const generationParamsSchema = z.object({
  audience: z.enum(['educator', 'student', 'both', 'seller']),
  type: z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']),
  subject: z.string(),
  grade: z.string(),
  topic: z.string(),
  standard: z.string().optional(),
});

// FIX: Completed the schema definitions by copying them from geminiService.ts.
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
                differentiation: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        generatedAt: { type: Type.STRING, description: 'The ISO 8601 timestamp of generation.' },
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
                    answerKey: { type: Type.STRING },
                    points: { type: Type.NUMBER },
                }
            }
        },
        pointsTotal: { type: Type.NUMBER },
    }
};


Deno.serve(async (req) => {
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
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `
        You are an expert curriculum designer. Generate an ${params.type} for the following specifications:
        - Audience: ${params.audience}
        - Subject: ${params.subject}
        - Grade Level: ${params.grade}
        - Topic: ${params.topic}
        ${params.standard ? `- Align to Standard: ${params.standard}` : ''}
        
        The output must be a single JSON object that strictly adheres to the provided schema.
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
