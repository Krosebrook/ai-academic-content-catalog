
export type Audience = 'educator' | 'student' | 'both' | 'seller';
export type ContentKind = 'lesson' | 'assessment' | 'activity' | 'resource' | 'printable';

export interface EducationalContent {
  id: string;
  title: string;
  type: ContentKind;
  targetAudience: Audience;
  subject: string;
  gradeLevel: string;
  standard?: string;
  content: string; // markdown body
  metadata: {
    duration?: string;
    materials?: string[];
    objectives?: string[];
    differentiation?: string[];
    alignment?: { framework: string; codes: string[] }[];
  };
  generatedAt: string; // ISO
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
  prompt: string;
  choices?: string[];
  answerKey?: string | number | boolean;
  points: number;
}

export interface RubricRow { 
  criterion: string; 
  levels: { label: string; description: string; points: number }[]; 
}
export interface Rubric { 
  title: string; 
  rows: RubricRow[]; 
  pointsTotal: number; 
}

export interface Assessment {
  id: string;
  title: string;
  type: 'assessment';
  questions: AssessmentQuestion[];
  rubric?: Rubric;
  pointsTotal: number;
}

export interface EducationalAnalytics {
  contentCreated: number;
  popularSubjects: { subject: string; count: number }[];
  popularGrades: { grade: string; count: number }[];
  toolUsage: { toolId: string; name: string, usage: number }[];
  userSatisfaction: number; // 1-5
}

export interface GenerationEvent {
  id: string;
  owner_id: string;
  type: ContentKind;
  subject: string;
  grade_level: string;
  created_at: string;
}

export interface GenerationParams {
    audience: Audience;
    type: ContentKind;
    subject: string;
    grade: string;
    topic: string;
    standard?: string;
}
