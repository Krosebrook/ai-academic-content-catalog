
import { z } from 'zod';

// Base Schemas
export const zAudience = z.enum(['educator', 'student', 'both', 'seller']);
export const zContentKind = z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']);

export const zRubricRow = z.object({
  criterion: z.string(),
  levels: z.array(z.object({
    label: z.string(),
    description: z.string(),
    points: z.number().positive(),
  })),
});

export const zRubric = z.object({
  title: z.string(),
  rows: z.array(zRubricRow),
  pointsTotal: z.number().positive(),
});

export const zAssessmentQuestion = z.object({
  id: z.string().uuid(),
  type: z.enum(['multiple-choice', 'short-answer', 'essay', 'true-false']),
  prompt: z.string(),
  choices: z.array(z.string()).optional(),
  answerKey: z.union([z.string(), z.number(), z.boolean()]).optional(),
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
});

// Parser functions/guards
export const parseEducationalContent = (data: unknown) => {
  return zEducationalContent.safeParse(data);
};

export const parseAssessment = (data: unknown) => {
  return zAssessment.safeParse(data);
};
