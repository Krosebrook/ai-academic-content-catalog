# API Reference - AI Academic Content Catalog

> Complete API documentation for integrating with the platform

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Gemini AI Service API](#gemini-ai-service-api)
4. [Supabase Edge Functions](#supabase-edge-functions)
5. [Data Types](#data-types)
6. [Validation Schemas](#validation-schemas)
7. [Error Handling](#error-handling)
8. [Rate Limits](#rate-limits)
9. [Code Examples](#code-examples)
10. [SDKs and Libraries](#sdks-and-libraries)

---

## Overview

The AI Academic Content Catalog provides both **client-side APIs** and **server-side APIs** for generating and managing educational content.

### API Endpoints

| Endpoint Type | Purpose | Location |
|--------------|---------|----------|
| **Gemini AI Service** | Content generation | `services/geminiService.ts` |
| **Edge Functions** | Serverless content generation | `edge-functions/generate-education-content/` |
| **Supabase Database** | Data persistence (future) | Supabase PostgreSQL |

### Base URLs

```
# Development
Client: http://localhost:3000
Edge Functions: https://your-project.supabase.co/functions/v1

# Production
Client: https://your-domain.com
Edge Functions: https://your-project.supabase.co/functions/v1
```

---

## Authentication

### Current: No Authentication Required

The development version uses **mock authentication** and does not require API authentication for most operations.

### Future: Supabase Authentication

Future versions will use Supabase Auth with JWT tokens:

```typescript
// Get JWT token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use token in requests
const response = await fetch('https://api.example.com/content', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## Gemini AI Service API

### Overview

The Gemini AI Service provides methods for generating educational content using Google's Gemini AI.

**Location:** `services/geminiService.ts`

### Methods

#### `generateEducationalContent()`

Generates educational content based on provided parameters.

**Signature:**
```typescript
function generateEducationalContent(
  params: GenerationParams
): Promise<EducationalContent>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | `GenerationParams` | Yes | Content generation parameters |
| `params.targetAudience` | `'educator' \| 'student' \| 'both' \| 'seller'` | Yes | Target audience |
| `params.subject` | `string` | Yes | Subject area |
| `params.gradeLevel` | `string` | Yes | Grade level |
| `params.contentType` | `'lesson' \| 'assessment' \| 'activity' \| 'resource' \| 'printable'` | Yes | Type of content |
| `params.topic` | `string` | Yes | Topic description |
| `params.standard` | `string` | No | Educational standard (e.g., "CCSS") |

**Returns:**
- `Promise<EducationalContent>` - Generated content object

**Example:**
```typescript
import { generateEducationalContent } from '@/services/geminiService';

const params: GenerationParams = {
  targetAudience: 'educator',
  subject: 'Science',
  gradeLevel: '8th Grade',
  contentType: 'lesson',
  topic: 'Photosynthesis in plants',
  standard: 'NGSS MS-LS1-6',
};

const content = await generateEducationalContent(params);

console.log(content.title); // "Introduction to Photosynthesis"
console.log(content.content); // Markdown-formatted lesson plan
```

**Error Handling:**
```typescript
try {
  const content = await generateEducationalContent(params);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation error:', error.errors);
  } else if (error instanceof Error) {
    console.error('Generation error:', error.message);
  }
}
```

---

#### `streamEducationalContent()`

Generates content with streaming response for real-time preview.

**Signature:**
```typescript
async function* streamEducationalContent(
  params: GenerationParams
): AsyncGenerator<string, void, unknown>
```

**Parameters:**
- Same as `generateEducationalContent()`

**Returns:**
- `AsyncGenerator<string>` - Yields content chunks as they're generated

**Example:**
```typescript
import { streamEducationalContent } from '@/services/geminiService';

const params = { /* ... */ };

for await (const chunk of streamEducationalContent(params)) {
  console.log('Received chunk:', chunk);
  updatePreview(chunk); // Update UI in real-time
}
```

**React Integration:**
```typescript
const [preview, setPreview] = useState('');

async function handleGenerate() {
  setPreview('');

  for await (const chunk of streamEducationalContent(params)) {
    setPreview(prev => prev + chunk);
  }
}
```

---

#### `generateAssessment()`

Generates an assessment with questions, rubric, and answer key.

**Signature:**
```typescript
function generateAssessment(
  params: GenerationParams
): Promise<Assessment>
```

**Parameters:**
- Same as `generateEducationalContent()` with `contentType: 'assessment'`

**Returns:**
- `Promise<Assessment>` - Assessment object with questions and rubric

**Example:**
```typescript
const params: GenerationParams = {
  targetAudience: 'educator',
  subject: 'Mathematics',
  gradeLevel: '6th Grade',
  contentType: 'assessment',
  topic: 'Fractions and decimals',
};

const assessment = await generateAssessment(params);

console.log(assessment.questions.length); // Number of questions
console.log(assessment.totalPoints); // Total points
console.log(assessment.answerKey); // Answer key object
```

---

### Configuration

The Gemini service can be configured with custom settings:

```typescript
// services/geminiService.ts
const generationConfig = {
  temperature: 0.7,         // Creativity level (0.0 - 1.0)
  topK: 40,                 // Top-k sampling
  topP: 0.95,               // Nucleus sampling
  maxOutputTokens: 8192,    // Maximum response length
  responseMimeType: "application/json",
  responseSchema: schema,   // JSON schema for structured output
};
```

**Adjusting Temperature:**
- `0.0` - Deterministic, consistent outputs
- `0.5` - Balanced
- `1.0` - Creative, varied outputs

**Example:**
```typescript
// For consistent lesson plans
const config = { temperature: 0.5 };

// For creative activities
const config = { temperature: 0.9 };
```

---

## Supabase Edge Functions

### Overview

Edge Functions provide serverless API endpoints for content generation with improved security (API keys hidden from client).

**Runtime:** Deno
**Location:** `edge-functions/generate-education-content/index.ts`

---

### `POST /generate-education-content`

Generates educational content via serverless function.

**Endpoint:**
```
POST https://your-project.supabase.co/functions/v1/generate-education-content
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

**Request Body:**
```json
{
  "targetAudience": "educator",
  "subject": "Mathematics",
  "gradeLevel": "6th Grade",
  "contentType": "lesson",
  "topic": "Introduction to Fractions",
  "standard": "CCSS.MATH.CONTENT.6.NS.A.1"
}
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "title": "Introduction to Fractions",
  "type": "lesson",
  "targetAudience": "educator",
  "subject": "Mathematics",
  "gradeLevel": "6th Grade",
  "content": "# Lesson Plan: Introduction to Fractions...",
  "metadata": {
    "objectives": [
      "Students will understand the concept of fractions",
      "Students will be able to identify numerators and denominators"
    ],
    "duration": "45 minutes",
    "materials": ["Fraction tiles", "Whiteboard", "Worksheets"]
  },
  "generatedAt": "2025-10-22T10:30:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": {
    "topic": "Topic must be at least 3 characters"
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Content generation failed",
  "message": "API rate limit exceeded"
}
```

---

### Using Edge Functions from Client

**Using Supabase Client:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase.functions.invoke(
  'generate-education-content',
  {
    body: {
      targetAudience: 'educator',
      subject: 'Science',
      gradeLevel: '8th Grade',
      contentType: 'lesson',
      topic: 'Photosynthesis',
    },
  }
);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Generated content:', data);
}
```

**Using Fetch API:**
```typescript
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/generate-education-content',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      targetAudience: 'student',
      subject: 'History',
      gradeLevel: '10th Grade',
      contentType: 'resource',
      topic: 'The American Revolution',
    }),
  }
);

const data = await response.json();
```

---

## Data Types

### TypeScript Interfaces

All data types are defined in `types/education.ts`.

---

#### `EducationalContent`

Main content object returned by generation APIs.

```typescript
interface EducationalContent {
  id?: string;                     // UUID (generated if not provided)
  title: string;                   // Content title
  type: ContentKind;               // Content type
  targetAudience: Audience;        // Target audience
  subject: string;                 // Subject area
  gradeLevel: string;              // Grade level
  content: string;                 // Markdown-formatted content
  metadata: {
    objectives?: string[];         // Learning objectives
    standards?: string[];          // Educational standards
    materials?: string[];          // Materials needed
    duration?: string;             // Estimated time
    [key: string]: any;            // Additional metadata
  };
  generatedAt?: string;            // ISO timestamp
}
```

---

#### `Assessment`

Assessment-specific content structure.

```typescript
interface Assessment {
  id: string;                      // UUID
  title: string;                   // Assessment title
  subject: string;                 // Subject area
  gradeLevel: string;              // Grade level
  questions: AssessmentQuestion[]; // Array of questions
  rubric?: Rubric;                 // Grading rubric
  answerKey?: Record<string, string>; // Question ID -> Answer
  totalPoints: number;             // Total possible points
  estimatedTime: string;           // Time to complete
  generatedAt: string;             // ISO timestamp
}
```

---

#### `AssessmentQuestion`

Individual question in an assessment.

```typescript
interface AssessmentQuestion {
  id: string;                      // Question UUID
  type: QuestionType;              // Question type
  question: string;                // Question text
  options?: string[];              // Options (for multiple choice)
  correctAnswer?: string;          // Correct answer
  points: number;                  // Point value
  explanation?: string;            // Answer explanation
}

type QuestionType = 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
```

---

#### `Rubric`

Grading rubric for assessments.

```typescript
interface Rubric {
  id: string;
  title: string;
  criteria: RubricCriterion[];    // Array of criteria
  totalPoints: number;             // Sum of all criteria points
}

interface RubricCriterion {
  id: string;
  name: string;                    // Criterion name (e.g., "Accuracy")
  description: string;             // What's being evaluated
  levels: RubricLevel[];           // Performance levels
  weight?: number;                 // Weighting factor
}

interface RubricLevel {
  level: string;                   // Level name (e.g., "Exemplary")
  points: number;                  // Points for this level
  description: string;             // What qualifies for this level
}
```

---

#### `GenerationParams`

Parameters for content generation.

```typescript
interface GenerationParams {
  targetAudience: Audience;
  subject: string;
  gradeLevel: string;
  contentType: ContentKind;
  topic: string;
  standard?: string;               // Optional standard alignment
}

type Audience = 'educator' | 'student' | 'both' | 'seller';
type ContentKind = 'lesson' | 'assessment' | 'activity' | 'resource' | 'printable';
```

---

#### `EducationalAnalytics`

User analytics data.

```typescript
interface EducationalAnalytics {
  userId: string;
  contentCreated: number;          // Total content pieces
  popularSubjects: Array<{
    subject: string;
    count: number;
  }>;
  popularGradeLevels: Array<{
    gradeLevel: string;
    count: number;
  }>;
  toolUsage: Record<string, number>; // Tool ID -> usage count
  satisfactionRating?: number;     // 1-5 rating
  lastUpdated: string;             // ISO timestamp
}
```

---

## Validation Schemas

All inputs and outputs are validated using **Zod** schemas.

**Location:** `utils/validation.ts`

---

### `zGenerationParams`

Validates content generation parameters.

```typescript
import { z } from 'zod';

const zGenerationParams = z.object({
  targetAudience: z.enum(['educator', 'student', 'both', 'seller']),
  subject: z.string().min(1, 'Subject is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  contentType: z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']),
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(500, 'Topic too long'),
  standard: z.string().optional(),
});

// Type inference
type GenerationParams = z.infer<typeof zGenerationParams>;
```

**Usage:**
```typescript
try {
  const validParams = zGenerationParams.parse(userInput);
  // validParams is now type-safe
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors);
    // [{ path: ['topic'], message: 'Topic is required' }]
  }
}
```

---

### `zEducationalContent`

Validates generated educational content.

```typescript
const zEducationalContent = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']),
  targetAudience: z.enum(['educator', 'student', 'both', 'seller']),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  metadata: z.object({
    objectives: z.array(z.string()).optional(),
    standards: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    duration: z.string().optional(),
  }).passthrough(), // Allow additional fields
  generatedAt: z.string().datetime().optional(),
});
```

---

### `zAssessment`

Validates assessment structure.

```typescript
const zAssessmentQuestion = z.object({
  id: z.string().uuid(),
  type: z.enum(['multiple_choice', 'short_answer', 'essay', 'true_false']),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  points: z.number().positive(),
  explanation: z.string().optional(),
});

const zAssessment = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  questions: z.array(zAssessmentQuestion).min(1),
  rubric: z.any().optional(), // Rubric schema
  answerKey: z.record(z.string()).optional(),
  totalPoints: z.number().positive(),
  estimatedTime: z.string(),
  generatedAt: z.string().datetime(),
});
```

---

## Error Handling

### Error Types

#### Validation Errors

**ZodError** - Input validation failed

```typescript
try {
  const params = zGenerationParams.parse(userInput);
} catch (error) {
  if (error instanceof z.ZodError) {
    // error.errors is an array of validation issues
    error.errors.forEach(err => {
      console.log(`${err.path.join('.')}: ${err.message}`);
    });
  }
}
```

**Example Error Object:**
```json
{
  "issues": [
    {
      "path": ["topic"],
      "message": "Topic must be at least 3 characters",
      "code": "too_small"
    }
  ]
}
```

---

#### API Errors

**Gemini API Errors**

```typescript
try {
  const content = await generateEducationalContent(params);
} catch (error) {
  if (error.message.includes('API key')) {
    // Invalid API key
  } else if (error.message.includes('rate limit')) {
    // Rate limit exceeded
  } else if (error.message.includes('quota')) {
    // Quota exceeded
  }
}
```

**Common Error Messages:**
- `"API key is invalid"` - Check your Gemini API key
- `"Rate limit exceeded"` - Too many requests, wait and retry
- `"Quota exceeded"` - Free tier limit reached
- `"Content filtered"` - Content violated safety policies

---

#### Network Errors

```typescript
try {
  const content = await generateEducationalContent(params);
} catch (error) {
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    // Network connectivity issue
    console.error('Network error. Please check your connection.');
  }
}
```

---

### Error Response Format

**Standard Error Response:**
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

---

## Rate Limits

### Gemini API Limits

**Free Tier:**
- 60 requests per minute
- 1,500 requests per day

**Paid Tier:**
- Higher limits based on plan
- See [Gemini API Pricing](https://ai.google.dev/pricing)

### Handling Rate Limits

**Client-Side Rate Limiting:**
```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxPerMinute = 50; // Stay under 60 limit

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);

    return this.requests.length < this.maxPerMinute;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }
}

const limiter = new RateLimiter();

async function generateWithRateLimit(params: GenerationParams) {
  if (!limiter.canMakeRequest()) {
    throw new Error('Rate limit exceeded. Please wait.');
  }

  limiter.recordRequest();
  return await generateEducationalContent(params);
}
```

**Exponential Backoff:**
```typescript
async function generateWithRetry(
  params: GenerationParams,
  maxRetries = 3
): Promise<EducationalContent> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateEducationalContent(params);
    } catch (error) {
      if (error.message.includes('rate limit') && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Code Examples

### Complete Generation Flow

```typescript
import { generateEducationalContent } from '@/services/geminiService';
import { zGenerationParams } from '@/utils/validation';

async function generateLesson() {
  // 1. Collect user input
  const userInput = {
    targetAudience: 'educator',
    subject: 'Science',
    gradeLevel: '8th Grade',
    contentType: 'lesson',
    topic: 'Photosynthesis',
    standard: 'NGSS MS-LS1-6',
  };

  try {
    // 2. Validate input
    const validParams = zGenerationParams.parse(userInput);

    // 3. Generate content
    const content = await generateEducationalContent(validParams);

    // 4. Display result
    console.log('Title:', content.title);
    console.log('Objectives:', content.metadata.objectives);
    console.log('Content:', content.content);

    return content;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid input:', error.errors);
    } else {
      console.error('Generation failed:', error.message);
    }
    throw error;
  }
}
```

---

### React Hook Integration

```typescript
import { useState } from 'react';
import { generateEducationalContent } from '@/services/geminiService';
import type { GenerationParams, EducationalContent } from '@/types/education';

function useContentGeneration() {
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateEducationalContent(params);
      setContent(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { content, isLoading, error, generate };
}

// Usage in component
function ContentStudio() {
  const { content, isLoading, error, generate } = useContentGeneration();

  const handleGenerate = async () => {
    const params = {
      targetAudience: 'educator',
      subject: 'Math',
      gradeLevel: '6th Grade',
      contentType: 'lesson',
      topic: 'Fractions',
    };

    await generate(params);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      {error && <div>Error: {error}</div>}
      {content && <div>{content.title}</div>}
    </div>
  );
}
```

---

### Streaming with Progress

```typescript
import { streamEducationalContent } from '@/services/geminiService';

async function generateWithProgress(
  params: GenerationParams,
  onProgress: (text: string, percent: number) => void
) {
  let accumulated = '';
  const estimatedLength = 5000; // Estimated content length

  for await (const chunk of streamEducationalContent(params)) {
    accumulated += chunk;
    const progress = Math.min(
      100,
      (accumulated.length / estimatedLength) * 100
    );

    onProgress(accumulated, progress);
  }

  return accumulated;
}

// Usage
await generateWithProgress(params, (text, percent) => {
  console.log(`Progress: ${percent.toFixed(0)}%`);
  updatePreview(text);
});
```

---

## SDKs and Libraries

### Required Dependencies

```json
{
  "dependencies": {
    "@google/genai": "^1.21.0",
    "@supabase/supabase-js": "^2.x.x",
    "zod": "^4.1.11",
    "react": "^19.1.1",
    "typescript": "^5.8.2"
  }
}
```

### Installation

```bash
npm install @google/genai @supabase/supabase-js zod
```

### Initialization

```typescript
// Gemini AI
import { GoogleGenerativeAI } from '@google/genai';
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

// Supabase
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Changelog

### v1.0.0 (Current)
- Initial release
- Gemini AI integration
- Client-side content generation
- Mock authentication
- Export functionality

### Planned (v1.1)
- Supabase Edge Functions API
- Real authentication
- Content persistence
- Search and filtering APIs

---

**For support and questions, see the [Developer Guide](./DEVELOPER_GUIDE.md)**

*Last updated: October 2025*
