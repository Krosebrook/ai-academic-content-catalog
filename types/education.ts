
import { z } from 'zod';

export type ContentType = 'lesson' | 'activity' | 'resource' | 'printable' | 'assessment' | 'rubric' | 'image' | 'assessment-questions';

export interface BaseContent {
  id: string;
  title: string;
  type: ContentType;
  generatedAt: string; // ISO 8601 timestamp
  toolId: string;
  collectionId?: string;
}

export interface Source {
    uri: string;
    title: string;
}

export interface EducationalContent extends BaseContent {
  type: 'lesson' | 'activity' | 'resource' | 'printable';
  targetAudience: 'educator' | 'student' | 'both' | 'seller';
  subject: string;
  gradeLevel: string;
  standard?: string;
  content: string; // The full content in HTML or Markdown format
  metadata: {
    duration?: string;
    materials?: string[];
    objectives?: string[];
    differentiation?: string[];
  };
  sources?: Source[];
}

export interface RubricLevel {
  label: string;
  description: string;
  points: number;
}

export interface RubricRow {
  id: string; // A UUID for the row
  criterion: string;
  levels: RubricLevel[];
}

export interface RubricContent extends BaseContent {
  type: 'rubric';
  title: string;
  rows: RubricRow[];
}

export interface AssessmentQuestion {
  id: string; // A UUID for the question
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
  prompt: string;
  choices?: string[];
  answerKey: string | string[];
  points: number;
}

export interface Assessment extends BaseContent {
  type: 'assessment' | 'assessment-questions';
  subject: string;
  gradeLevel: string;
  questions: AssessmentQuestion[];
  pointsTotal: number;
  rubric?: RubricContent;
  sources?: Source[];
}


export interface ImageContent extends BaseContent {
  type: 'image';
  prompt: string;
  base64Image: string;
}

export interface EducationalAnalytics {
  contentCreated: number;
  popularSubjects: { subject: string; count: number }[];
  popularGrades: { grade: string; count: number }[];
  toolUsage: { toolId: string; name: string; usage: number }[];
  userSatisfaction: number;
}

// Zod schemas for validation
const sourceSchema = z.object({
  uri: z.string().url(),
  title: z.string(),
});

export const rubricLevelSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  points: z.number().min(0),
});

export const rubricRowSchema = z.object({
  id: z.string().uuid(),
  criterion: z.string().min(1),
  levels: z.array(rubricLevelSchema).min(1),
});

export const rubricContentSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('rubric'),
  title: z.string().min(1),
  rows: z.array(rubricRowSchema).min(1),
  generatedAt: z.string().datetime(),
  toolId: z.string(),
  collectionId: z.string().uuid().optional(),
});

export const assessmentQuestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['multiple-choice', 'short-answer', 'essay', 'true-false']),
  prompt: z.string().min(1),
  choices: z.array(z.string()).optional(),
  answerKey: z.union([z.string(), z.array(z.string())]),
  points: z.number().min(0),
});

export const assessmentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['assessment', 'assessment-questions']),
  title: z.string().min(1),
  subject: z.string(),
  gradeLevel: z.string(),
  questions: z.array(assessmentQuestionSchema).min(1),
  pointsTotal: z.number().min(0),
  rubric: rubricContentSchema.optional(),
  generatedAt: z.string().datetime(),
  toolId: z.string(),
  collectionId: z.string().uuid().optional(),
  sources: z.array(sourceSchema).optional(),
});

export const educationalContentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['lesson', 'activity', 'resource', 'printable']),
  title: z.string().min(1),
  targetAudience: z.enum(['educator', 'student', 'both', 'seller']),
  subject: z.string(),
  gradeLevel: z.string(),
  standard: z.string().optional(),
  content: z.string().min(1),
  metadata: z.object({
    duration: z.string().optional(),
    materials: z.array(z.string()).optional(),
    objectives: z.array(z.string()).optional(),
    differentiation: z.array(z.string()).optional(),
  }),
  generatedAt: z.string().datetime(),
  toolId: z.string(),
  collectionId: z.string().uuid().optional(),
  sources: z.array(sourceSchema).optional(),
});

export const imageContentSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('image'),
    title: z.string().min(1, 'Title is required.'),
    prompt: z.string().min(1, 'Prompt is required.'),
    base64Image: z.string(),
    generatedAt: z.string().datetime(),
    toolId: z.string(),
    collectionId: z.string().uuid().optional(),
});
