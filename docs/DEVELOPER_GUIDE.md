# Developer Guide - AI Academic Content Catalog

> Technical documentation for developers contributing to or extending the platform

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Core Concepts](#core-concepts)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Database Schema](#database-schema)
9. [Authentication System](#authentication-system)
10. [Adding New Features](#adding-new-features)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Coding Standards](#coding-standards)
14. [Troubleshooting](#troubleshooting)

---

## Development Environment Setup

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Git** for version control
- **VS Code** (recommended) or your preferred IDE
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))
- **Supabase Account** (optional, for database features)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-academic-content-catalog.git
cd ai-academic-content-catalog

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```env
# Required: Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase (for database features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Development settings
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true
```

### Running the Development Server

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Lint (if configured)
npm run lint
```

---

## Project Structure

```
ai-academic-content-catalog/
├── components/                 # React components
│   ├── education/             # Education feature components
│   │   ├── EducationalContentStudio.tsx
│   │   ├── EducationalToolsRouter.tsx
│   │   ├── analytics/         # Analytics components
│   │   │   └── EducationAnalyticsPanel.tsx
│   │   ├── exports/           # Export functionality
│   │   │   └── ExportMenu.tsx
│   │   └── shared/            # Shared UI components
│   │       ├── FFButton.tsx
│   │       ├── FFCard.tsx
│   │       └── ProgressBar.tsx
│   └── pages/                 # Page-level components
│       └── EducationPage.tsx
├── constants/                 # Static configuration
│   └── education.ts           # Subjects, grades, standards, tools
├── types/                     # TypeScript type definitions
│   └── education.ts           # Education domain types
├── services/                  # External service integrations
│   └── geminiService.ts       # Gemini API client
├── utils/                     # Utility functions
│   ├── auth-protection.ts     # Authentication & guards
│   ├── validation.ts          # Zod validation schemas
│   └── exports.ts             # Export format utilities
├── supabase/                  # Supabase backend
│   ├── migrations/            # Database migrations
│   │   └── 001_education.sql
│   └── policies/              # Row-level security
│       └── education_rls.sql
├── edge-functions/            # Supabase Edge Functions
│   └── generate-education-content/
│       └── index.ts           # Content generation endpoint
├── docs/                      # Documentation
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── FEATURES.md
├── public/                    # Static assets
├── App.tsx                    # Root component
├── index.tsx                  # React entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

---

## Technology Stack

### Frontend Framework
- **React 19.1.1** - Component-based UI library
- **TypeScript 5.8.2** - Static typing for JavaScript
- **Vite 6.2.0** - Build tool and dev server

### Styling
- **Tailwind CSS** (via CDN) - Utility-first CSS framework
- **Custom CSS Variables** - FlashFusion design system
- **Google Fonts** - Sora, Inter, JetBrains Mono

### State Management
- **React Context API** - For auth state
- **React Hooks** - useState, useEffect, useContext, useCallback
- **Local Component State** - For UI state

### AI Integration
- **@google/genai 1.21.0** - Google Generative AI SDK
- **Gemini 2.5 Flash** - AI model for content generation

### Validation
- **Zod 4.1.11** - Runtime schema validation
- **TypeScript** - Compile-time type checking

### Backend (Optional)
- **Supabase** - PostgreSQL database, edge functions, auth
- **Deno** - Runtime for edge functions

---

## Core Concepts

### 1. Educational Content Types

All educational content conforms to these base types:

```typescript
// Content types available
type ContentKind = 'lesson' | 'assessment' | 'activity' | 'resource' | 'printable';

// Target audiences
type Audience = 'educator' | 'student' | 'both' | 'seller';

// Main content interface
interface EducationalContent {
  id: string;
  title: string;
  type: ContentKind;
  targetAudience: Audience;
  subject: string;
  gradeLevel: string;
  content: string;  // Markdown formatted
  metadata: {
    objectives?: string[];
    standards?: string[];
    materials?: string[];
    duration?: string;
    [key: string]: any;
  };
  generatedAt: string;  // ISO timestamp
}
```

### 2. Generation Parameters

Content generation is controlled by these parameters:

```typescript
interface GenerationParams {
  targetAudience: Audience;
  subject: string;
  gradeLevel: string;
  contentType: ContentKind;
  topic: string;
  standard?: string;
}
```

### 3. Assessment Structure

Assessments have a specialized structure:

```typescript
interface Assessment {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  questions: AssessmentQuestion[];
  rubric?: Rubric;
  answerKey?: Record<string, string>;
  totalPoints: number;
  estimatedTime: string;
  generatedAt: string;
}

interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  question: string;
  options?: string[];  // For multiple choice
  correctAnswer?: string;
  points: number;
  explanation?: string;
}
```

### 4. Educational Standards

Standards are defined as constants:

```typescript
const EDUCATIONAL_STANDARDS = [
  'Common Core State Standards (CCSS)',
  'Next Generation Science Standards (NGSS)',
  'International Baccalaureate (IB)',
  'Advanced Placement (AP)',
  'Texas Essential Knowledge and Skills (TEKS)',
  // ... more standards
];
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx
└── AuthProvider (Context)
    └── Router
        ├── Public Routes
        │   ├── HomePage
        │   ├── AboutPage
        │   └── PricingPage
        └── Protected Routes (AuthGuard)
            └── EducationPage
                ├── EducationalContentStudio
                │   ├── Audience Selector
                │   ├── Subject Selector
                │   ├── Grade Level Selector
                │   ├── Content Type Selector
                │   ├── Topic Input
                │   ├── Standard Selector
                │   ├── Generate Button
                │   ├── Progress Bar
                │   ├── Content Preview
                │   └── ExportMenu
                ├── EducationalToolsRouter
                │   ├── Category Filters
                │   ├── Search Bar
                │   └── Tool Cards
                └── EducationAnalyticsPanel
                    ├── Content Stats
                    ├── Subject Chart
                    └── Usage Metrics
```

### Key Components

#### EducationalContentStudio

**Location:** `components/education/EducationalContentStudio.tsx`

**Purpose:** Main content generation interface

**State:**
```typescript
const [generationParams, setGenerationParams] = useState<GenerationParams>({
  targetAudience: 'educator',
  subject: 'Mathematics',
  gradeLevel: '6th Grade',
  contentType: 'lesson',
  topic: '',
  standard: undefined
});
const [isGenerating, setIsGenerating] = useState(false);
const [generatedContent, setGeneratedContent] = useState<EducationalContent | null>(null);
const [progress, setProgress] = useState(0);
```

**Key Methods:**
- `handleGenerate()` - Initiates content generation
- `streamContent()` - Handles streaming response
- `validateParams()` - Validates generation parameters

#### EducationalToolsRouter

**Location:** `components/education/EducationalToolsRouter.tsx`

**Purpose:** Browse and search educational tools library

**Features:**
- Category filtering
- Search functionality
- Tool popularity display
- Responsive grid layout

#### ExportMenu

**Location:** `components/education/exports/ExportMenu.tsx`

**Purpose:** Export content in multiple formats

**Exports:**
- Markdown (.md)
- JSON (.json)
- CSV (.csv) for flashcards
- DOCX outline
- PPT outline

---

## State Management

### Authentication State

**Location:** `utils/auth-protection.ts`

**Context:**
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signIn: () => void;
  signOut: () => void;
  startDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**Usage:**
```typescript
import { useAuth } from '@/utils/auth-protection';

function MyComponent() {
  const { isAuthenticated, signIn, signOut } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={signIn}>Sign In</button>;
  }

  return <button onClick={signOut}>Sign Out</button>;
}
```

### Component-Level State

Most components use local state with React hooks:

```typescript
// Form state
const [formData, setFormData] = useState({...});

// Loading states
const [isLoading, setIsLoading] = useState(false);

// Error handling
const [error, setError] = useState<string | null>(null);

// Data fetching
const [data, setData] = useState<DataType[]>([]);
```

### Future: Redux/Zustand

For more complex state, consider:
- **Redux Toolkit** - For global state management
- **Zustand** - For lightweight global state
- **React Query** - For server state management

---

## API Integration

### Gemini API Service

**Location:** `services/geminiService.ts`

**Setup:**
```typescript
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

**Generating Content:**
```typescript
export async function generateEducationalContent(
  params: GenerationParams
): Promise<EducationalContent> {
  // Build prompt from parameters
  const prompt = buildPrompt(params);

  // Configure generation
  const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: educationalContentSchema,
  };

  // Generate content
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
  });

  // Parse and validate response
  const content = JSON.parse(result.response.text());
  return zEducationalContent.parse(content);
}
```

**Streaming Content:**
```typescript
export async function* streamEducationalContent(
  params: GenerationParams
): AsyncGenerator<string> {
  const prompt = buildPrompt(params);
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}
```

### Edge Functions (Supabase)

**Location:** `edge-functions/generate-education-content/index.ts`

**Handler:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/genai';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const params = await req.json();

    // Validate with Zod
    const validParams = zGenerationParams.parse(params);

    // Generate content
    const content = await generateEducationalContent(validParams);

    // Return response
    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

**Invoking from Frontend:**
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke(
  'generate-education-content',
  {
    body: generationParams
  }
);
```

---

## Database Schema

**Location:** `supabase/migrations/001_education.sql`

### Tables

#### educational_content

```sql
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'assessment', 'activity', 'resource', 'printable')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('educator', 'student', 'both', 'seller')),
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_educational_content_user_id ON educational_content(user_id);
CREATE INDEX idx_educational_content_subject ON educational_content(subject);
CREATE INDEX idx_educational_content_grade_level ON educational_content(grade_level);
CREATE INDEX idx_educational_content_type ON educational_content(type);
```

#### assessments

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  rubric JSONB,
  answer_key JSONB,
  total_points INTEGER,
  estimated_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_analytics

```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  content_created INTEGER DEFAULT 0,
  popular_subjects JSONB DEFAULT '[]',
  popular_grade_levels JSONB DEFAULT '[]',
  tool_usage JSONB DEFAULT '{}',
  satisfaction_rating DECIMAL(3,2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security

**Location:** `supabase/policies/education_rls.sql`

```sql
-- Users can only see their own content
CREATE POLICY "Users can view own content"
  ON educational_content FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own content
CREATE POLICY "Users can create content"
  ON educational_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update own content"
  ON educational_content FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON educational_content FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Authentication System

### Mock Authentication (Current)

**Location:** `utils/auth-protection.ts`

**Implementation:**
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const signIn = () => {
    setIsAuthenticated(true);
    setIsDemoMode(false);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
  };

  const startDemo = () => {
    setIsAuthenticated(true);
    setIsDemoMode(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isDemoMode, signIn, signOut, startDemo }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Routes

**Using AuthGuard:**
```typescript
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const protectedRoutes = ['/education', '/dashboard', '/creator', '/tools'];
  const isProtected = protectedRoutes.some(route => location.pathname.startsWith(route));

  if (isProtected && !isAuthenticated) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

### Future: Supabase Auth

To implement real authentication:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## Adding New Features

### Adding a New Content Type

**1. Update Types** (`types/education.ts`):
```typescript
type ContentKind = 'lesson' | 'assessment' | 'activity' | 'resource' | 'printable' | 'worksheet'; // Add 'worksheet'
```

**2. Update Constants** (`constants/education.ts`):
```typescript
export const CONTENT_TYPES = [
  { value: 'lesson', label: 'Lesson Plan' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'activity', label: 'Activity' },
  { value: 'resource', label: 'Resource' },
  { value: 'printable', label: 'Printable' },
  { value: 'worksheet', label: 'Worksheet' }, // Add new type
];
```

**3. Update Validation** (`utils/validation.ts`):
```typescript
const zContentKind = z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable', 'worksheet']);
```

**4. Update Prompt Builder** (`services/geminiService.ts`):
```typescript
function buildPrompt(params: GenerationParams): string {
  // Add handling for 'worksheet' type
  if (params.contentType === 'worksheet') {
    return `Generate a worksheet for ${params.topic}...`;
  }
  // ... existing logic
}
```

**5. Update UI** (`components/education/EducationalContentStudio.tsx`):
- Add option to content type selector
- Test generation workflow

### Adding a New Subject

**1. Update Constants** (`constants/education.ts`):
```typescript
export const SUBJECTS = [
  'Mathematics',
  'Science',
  // ... existing subjects
  'Psychology', // Add new subject
];
```

**2. Test Content Generation:**
- Generate content with new subject
- Verify prompts include subject-specific context
- Ensure standards alignment

### Adding a New Tool

**1. Update Constants** (`constants/education.ts`):
```typescript
export const EDUCATIONAL_TOOLS = [
  // ... existing tools
  {
    id: 'new-tool-id',
    name: 'New Tool Name',
    category: 'lesson-planning', // or appropriate category
    description: 'Detailed description of what the tool does',
    icon: '📝', // Emoji icon
    popularity: 4, // 1-5 star rating
  },
];
```

**2. Implement Tool Logic** (if interactive):
```typescript
// In a new file: components/education/tools/NewTool.tsx
export function NewTool({ params }: { params: ToolParams }) {
  // Tool implementation
  return <div>Tool UI</div>;
}
```

**3. Add to Router** (if needed):
```typescript
// In EducationalToolsRouter.tsx
import { NewTool } from './tools/NewTool';

// Add route or modal trigger
```

---

## Testing

### Unit Testing (Future)

**Framework:** Vitest + React Testing Library

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Example Test:**
```typescript
// components/education/__tests__/EducationalContentStudio.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EducationalContentStudio } from '../EducationalContentStudio';

describe('EducationalContentStudio', () => {
  it('renders all selectors', () => {
    render(<EducationalContentStudio />);

    expect(screen.getByLabelText('Target Audience')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade Level')).toBeInTheDocument();
  });

  it('generates content when button clicked', async () => {
    render(<EducationalContentStudio />);

    fireEvent.change(screen.getByLabelText('Topic'), { target: { value: 'Photosynthesis' } });
    fireEvent.click(screen.getByText('Generate Content'));

    expect(await screen.findByText(/generating/i)).toBeInTheDocument();
  });
});
```

### Integration Testing

**Testing API Integration:**
```typescript
// services/__tests__/geminiService.test.ts
import { generateEducationalContent } from '../geminiService';

describe('Gemini Service', () => {
  it('generates valid educational content', async () => {
    const params = {
      targetAudience: 'educator',
      subject: 'Science',
      gradeLevel: '8th Grade',
      contentType: 'lesson',
      topic: 'Photosynthesis',
    };

    const content = await generateEducationalContent(params);

    expect(content).toHaveProperty('id');
    expect(content).toHaveProperty('title');
    expect(content.subject).toBe('Science');
  });
});
```

### Smoke Tests

**Current Implementation:** See README.md for smoke test script

**Run Tests:**
```bash
npm run smoke:education
```

---

## Deployment

### Vite Production Build

```bash
# Build the app
npm run build

# Output: dist/ directory
# - index.html
# - assets/ (JS, CSS, etc.)
```

### Deployment Options

#### 1. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### 3. GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

#### 4. Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```bash
docker build -t ai-academic-content-catalog .
docker run -p 80:80 ai-academic-content-catalog
```

### Environment Variables in Production

**Netlify/Vercel:**
- Add environment variables in dashboard
- Prefix with `VITE_` for client-side access

**Docker:**
- Use `.env` file or environment variable injection
- Never commit `.env` to version control

---

## Coding Standards

### TypeScript

**Always use explicit types:**
```typescript
// Good
function generateContent(params: GenerationParams): Promise<EducationalContent> {
  // ...
}

// Avoid
function generateContent(params: any): any {
  // ...
}
```

**Use interfaces for objects:**
```typescript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}
```

### React Components

**Use functional components with hooks:**
```typescript
export function MyComponent({ prop1, prop2 }: Props) {
  const [state, setState] = useState<StateType>(initialState);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div>...</div>;
}
```

**Name components descriptively:**
- `EducationalContentStudio` ✓
- `ContentStudio` ✗ (too generic)

### File Organization

**One component per file:**
- File name matches component name
- Export component as named export or default

**Imports order:**
1. React imports
2. External library imports
3. Internal imports (components, utils, types)
4. CSS imports

```typescript
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/genai';
import { EducationalContent } from '@/types/education';
import { generateContent } from '@/services/geminiService';
import './styles.css';
```

### Error Handling

**Always handle errors:**
```typescript
try {
  const content = await generateContent(params);
  setGeneratedContent(content);
} catch (error) {
  console.error('Content generation failed:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
}
```

### Comments and Documentation

**Document complex logic:**
```typescript
/**
 * Generates educational content using Google Gemini AI
 *
 * @param params - Generation parameters including subject, grade, topic
 * @returns Promise resolving to generated content
 * @throws Error if API call fails or validation fails
 */
export async function generateEducationalContent(
  params: GenerationParams
): Promise<EducationalContent> {
  // Implementation
}
```

---

## Troubleshooting

### Common Development Issues

#### TypeScript Errors

**Issue:** "Cannot find module '@/...'"`
**Solution:** Check `tsconfig.json` path alias configuration:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Vite Import Errors

**Issue:** "Failed to resolve import"
**Solution:** Ensure file extensions are included or omitted consistently:
```typescript
// Good
import { MyComponent } from './MyComponent';

// Also good (with extension)
import { MyComponent } from './MyComponent.tsx';
```

#### API Key Not Working

**Issue:** "API key invalid"
**Solutions:**
1. Verify `.env` file has correct key
2. Restart dev server after changing `.env`
3. Ensure `VITE_` prefix is used
4. Check API key is active in Google AI Studio

#### CORS Errors

**Issue:** "CORS policy blocked"
**Solution:** Use Supabase Edge Functions or configure CORS on backend:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Debug Mode

**Enable verbose logging:**
```typescript
if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
  console.log('[DEBUG] Generation params:', params);
  console.log('[DEBUG] API response:', response);
}
```

### Performance Optimization

**Code splitting:**
```typescript
// Lazy load heavy components
const EducationalContentStudio = lazy(() => import('./components/education/EducationalContentStudio'));

<Suspense fallback={<Loading />}>
  <EducationalContentStudio />
</Suspense>
```

**Memoization:**
```typescript
const MemoizedComponent = React.memo(MyComponent);

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

---

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Code follows project conventions
- [ ] No console.log statements (use debug mode)
- [ ] Responsive design works on mobile
- [ ] Accessibility standards met
- [ ] Documentation updated

---

## Resources

### Official Documentation

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

### Community

- [GitHub Discussions](https://github.com/yourusername/ai-academic-content-catalog/discussions)
- [Discord Server](https://discord.gg/your-server)

---

**Happy coding!**

*Last updated: October 2025*
