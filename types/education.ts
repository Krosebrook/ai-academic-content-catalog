import { z } from 'zod';

// Base Schemas
export const zAudience = z.enum(['educator', 'student', 'both', 'seller']);
export const zContentKind = z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable', 'rubric', 'assessment-questions', 'flashcard', 'infographic']);

export const zRubricRow = z.object({
  criterion: z.string(),
  levels: z.array(z.object({
    label: z.string(),
    description: z.string(),
    points: z.number(),
  })),
});

export const zRubric = z.object({
  title: z.string(),
  rows: z.array(zRubricRow),
  pointsTotal: z.number(),
});

export const zAssessmentQuestion = z.object({
  id: z.string().uuid(),
  type: z.enum(['multiple-choice', 'short-answer', 'essay', 'true-false']),
  prompt: z.string(),
  choices: z.array(z.string()).optional(),
  answerKey: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
  points: z.number().positive(),
});

// Main Content Schemas
export const zEducationalContent = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: zContentKind,
  targetAudience: zAudience,
  subject: z.string(),
  gradeLevel: z.string(),
  standard: z.string().optional(),
  content: z.string(), // markdown body
  metadata: z.object({
    duration: z.string().optional(),
    materials: z.array(z.string()).optional(),
    objectives: z.array(z.string()).optional(),
    differentiation: z.array(z.string()).optional(),
    alignment: z.array(z.object({
      framework: z.string(),
      codes: z.array(z.string()),
    })).optional(),
  }),
  generatedAt: z.string().datetime(),
});

export const zAssessment = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.literal('assessment'),
  questions: z.array(zAssessmentQuestion),
  rubric: zRubric.optional(),
  pointsTotal: z.number().positive(),
  generatedAt: z.string().datetime(),
});

export const zRubricContent = zRubric.extend({
  id: z.string().uuid(),
  type: z.literal('rubric'),
  generatedAt: z.string().datetime(),
});


// Parser functions/guards
export const parseEducationalContent = (data: unknown) => {
  return zEducationalContent.safeParse(data);
};

export const parseAssessment = (data: unknown) => {
  return zAssessment.safeParse(data);
};

export const parseRubricContent = (data: unknown) => {
    return zRubricContent.safeParse(data);
}

// FIX: Add inferred types and interfaces to fix import errors across the application.
// Type definitions inferred from schemas
export type Audience = z.infer<typeof zAudience>;
export type ContentKind = z.infer<typeof zContentKind>;
export type RubricRow = z.infer<typeof zRubricRow>;
export type Rubric = z.infer<typeof zRubric>;
export type AssessmentQuestion = z.infer<typeof zAssessmentQuestion>;
export type EducationalContent = z.infer<typeof zEducationalContent>;
export type Assessment = z.infer<typeof zAssessment>;
export type RubricContent = z.infer<typeof zRubricContent>;

// Other types that are missing
export interface GenerationParams {
  audience: Audience;
  type: ContentKind;
  subject: string;
  grade: string;
  topic: string;
  standard?: string;
  objectives?: string[];
  difficulty?: string;
  bloomsLevel?: string;
  differentiationProfiles?: string[];
  includeRubric?: boolean;
  associatedRubric?: Rubric | null;
}

export interface RubricGenerationParams {
  title: string;
  topic: string;
  criteria: string[];
  levels: { label: string; points: number }[];
}

export interface EducationalAnalytics {
  contentCreated: number;
  popularSubjects: { subject: string; count: number }[];
  popularGrades: { grade: string; count: number }[];
  toolUsage: { toolId: string; name: string; usage: number }[];
  userSatisfaction: number;
}