
import { z } from 'zod';

// Base schemas
export const sourceSchema = z.object({
  uri: z.string().url(),
  title: z.string(),
});
export type Source = z.infer<typeof sourceSchema>;

export const rubricLevelSchema = z.object({
  label: z.string(),
  description: z.string(),
  points: z.number().int(),
});
export type RubricLevel = z.infer<typeof rubricLevelSchema>;

export const rubricRowSchema = z.object({
  id: z.string(), // Can be uuid or other string from API
  criterion: z.string(),
  levels: z.array(rubricLevelSchema),
});
export type RubricRow = z.infer<typeof rubricRowSchema>;

const baseContentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  generatedAt: z.string(), // ISO date string
  title: z.string(),
  toolId: z.string(),
  collectionId: z.string().nullable().optional(),
});

// Content-specific schemas
export const educationalContentSchema = baseContentSchema.extend({
  type: z.enum(['lesson', 'activity', 'resource', 'printable']),
  subject: z.string(),
  gradeLevel: z.string(),
  standard: z.string().optional(),
  content: z.string(), // HTML content
  metadata: z.object({
    duration: z.string(),
    materials: z.array(z.string()),
    objectives: z.array(z.string()),
    differentiation: z.array(z.string()).optional(),
  }),
  sources: z.array(sourceSchema).optional(),
});
export type EducationalContent = z.infer<typeof educationalContentSchema>;

export const assessmentQuestionSchema = z.object({
  id: z.string(), // Can be uuid or other string from API
  type: z.enum(['multiple-choice', 'short-answer', 'essay', 'true-false']),
  prompt: z.string(),
  choices: z.array(z.string()).optional(),
  answerKey: z.union([z.string(), z.array(z.string())]),
  points: z.number().int(),
});
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const rubricContentSchema = baseContentSchema.extend({
    type: z.literal('rubric'),
    rows: z.array(rubricRowSchema),
    subject: z.string().optional(), // For consistency
    gradeLevel: z.string().optional(), // For consistency
});
export type RubricContent = z.infer<typeof rubricContentSchema>;

export const assessmentSchema = baseContentSchema.extend({
  type: z.enum(['assessment', 'assessment-questions']),
  subject: z.string(),
  gradeLevel: z.string(),
  questions: z.array(assessmentQuestionSchema),
  pointsTotal: z.number().int(),
  rubric: rubricContentSchema.optional().nullable(),
  sources: z.array(sourceSchema).optional(),
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const imageContentSchema = baseContentSchema.extend({
  type: z.literal('image'),
  prompt: z.string(),
  base64Image: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
});
export type ImageContent = z.infer<typeof imageContentSchema>;

// Analytics types
export const educationalAnalyticsSchema = z.object({
  contentCreated: z.number(),
  popularSubjects: z.array(z.object({ subject: z.string(), count: z.number() })),
  popularGrades: z.array(z.object({ grade: z.string(), count: z.number() })),
  toolUsage: z.array(z.object({ toolId: z.string(), name: z.string(), usage: z.number() })),
  userSatisfaction: z.number(),
});
export type EducationalAnalytics = z.infer<typeof educationalAnalyticsSchema>;

// Collaboration types
export type PermissionLevel = 'viewer' | 'editor';
