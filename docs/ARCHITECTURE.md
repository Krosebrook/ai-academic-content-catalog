# Architecture Documentation - AI Academic Content Catalog

> System design, architecture decisions, and technical implementation details

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Flow](#data-flow)
6. [AI Integration Architecture](#ai-integration-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Design](#database-design)
9. [API Design](#api-design)
10. [Performance Considerations](#performance-considerations)
11. [Security Architecture](#security-architecture)
12. [Scalability Considerations](#scalability-considerations)
13. [Design Decisions](#design-decisions)
14. [Future Architecture Plans](#future-architecture-plans)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         React SPA (Vite + TypeScript)                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │Components│  │  Utils   │  │  State (Context) │  │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      API Layer                               │
│  ┌───────────────────┐         ┌───────────────────────┐   │
│  │  Google Gemini    │         │  Supabase Edge        │   │
│  │  API (AI)         │         │  Functions (Deno)     │   │
│  └───────────────────┘         └───────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    Data Layer                                │
│  ┌───────────────────┐         ┌───────────────────────┐   │
│  │  Supabase         │         │  Browser Storage      │   │
│  │  PostgreSQL       │         │  (LocalStorage)       │   │
│  └───────────────────┘         └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Client Tier:**
- React 19.1.1 (UI rendering)
- TypeScript 5.8.2 (Type safety)
- Vite 6.2.0 (Build tool)
- Tailwind CSS (Styling via CDN)

**API Tier:**
- Google Gemini API (AI content generation)
- Supabase Edge Functions (Serverless compute)
- Deno runtime (Edge function execution)

**Data Tier:**
- Supabase/PostgreSQL (Structured data)
- Browser LocalStorage (Client-side cache)

**Validation & Security:**
- Zod 4.1.11 (Runtime validation)
- TypeScript (Compile-time validation)
- Supabase RLS (Row-level security)

---

## Architecture Patterns

### 1. Single Page Application (SPA)

**Pattern:** Client-side rendering with React Router

**Benefits:**
- Fast page transitions
- Rich interactive experience
- No full page reloads
- Optimal for web applications

**Implementation:**
```typescript
// App.tsx
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/education" element={
            <AuthGuard>
              <EducationPage />
            </AuthGuard>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 2. Component-Based Architecture

**Pattern:** Reusable, composable UI components

**Component Hierarchy:**
```
App
├── AuthProvider (Context)
├── Router
│   ├── Public Routes
│   │   ├── HomePage
│   │   ├── AboutPage
│   │   └── PricingPage
│   └── Protected Routes
│       └── EducationPage
│           ├── ContentStudio
│           ├── ToolsLibrary
│           └── Analytics
└── Shared Components
    ├── FFButton
    ├── FFCard
    └── ProgressBar
```

### 3. Service Layer Pattern

**Pattern:** Separate business logic from UI components

**Implementation:**
```typescript
// services/geminiService.ts
export class GeminiService {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateContent(params: GenerationParams): Promise<EducationalContent> {
    // AI generation logic
  }
}
```

### 4. Repository Pattern (Future)

**Pattern:** Abstract data access from business logic

**Future Implementation:**
```typescript
// repositories/contentRepository.ts
export class ContentRepository {
  async findById(id: string): Promise<EducationalContent | null> {
    const { data, error } = await supabase
      .from('educational_content')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  async save(content: EducationalContent): Promise<void> {
    await supabase.from('educational_content').insert(content);
  }
}
```

### 5. Context Pattern for State

**Pattern:** React Context API for global state

**Implementation:**
```typescript
// utils/auth-protection.ts
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isDemoMode: false,
  });

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Frontend Architecture

### Component Structure

```
components/
├── education/              # Feature: Education tools
│   ├── EducationalContentStudio.tsx
│   ├── EducationalToolsRouter.tsx
│   ├── analytics/
│   │   └── EducationAnalyticsPanel.tsx
│   ├── exports/
│   │   └── ExportMenu.tsx
│   └── shared/             # Shared within feature
│       ├── FFButton.tsx
│       ├── FFCard.tsx
│       └── ProgressBar.tsx
└── pages/                  # Page-level components
    └── EducationPage.tsx
```

### State Management Strategy

**Local State** (useState):
- Component-specific UI state
- Form inputs
- Loading indicators

**Context State** (React Context):
- Authentication state
- User preferences
- Global settings

**Future Considerations:**
- Redux Toolkit for complex state
- React Query for server state
- Zustand for lightweight global state

### Routing Architecture

**Client-Side Routing with React Router:**

```typescript
const routes = [
  { path: '/', component: HomePage, protected: false },
  { path: '/education', component: EducationPage, protected: true },
  { path: '/dashboard', component: DashboardPage, protected: true },
  { path: '/tools', component: ToolsPage, protected: true },
];
```

**Route Protection:**
```typescript
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

### Design System (FlashFusion)

**CSS Variables Architecture:**

```css
:root {
  /* Color System */
  --ff-primary: #FF7B00;      /* Orange */
  --ff-secondary: #00B4D8;    /* Cyan */
  --ff-accent: #E91E63;       /* Magenta */

  /* Spacing System */
  --ff-spacing-xs: 0.25rem;   /* 4px */
  --ff-spacing-sm: 0.5rem;    /* 8px */
  --ff-spacing-md: 1rem;      /* 16px */
  --ff-spacing-lg: 2rem;      /* 32px */

  /* Typography Scale */
  --ff-font-primary: 'Sora', sans-serif;
  --ff-font-secondary: 'Inter', sans-serif;
  --ff-font-mono: 'JetBrains Mono', monospace;
}
```

**Component Styling Pattern:**
```typescript
function FFButton({ variant = 'primary', children, ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all';
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#FF7B00] to-[#FF5722] text-white',
    secondary: 'bg-[#00B4D8] text-white hover:bg-[#0096C7]',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

---

## Backend Architecture

### Edge Functions (Serverless)

**Runtime:** Deno on Supabase Edge Functions

**Architecture:**
```
edge-functions/
└── generate-education-content/
    └── index.ts              # Main handler

Handler Flow:
1. Receive HTTP request
2. Validate request body (Zod)
3. Call Gemini API
4. Validate response (Zod)
5. Return JSON response
```

**Implementation:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  // 1. CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Parse and validate request
    const body = await req.json();
    const params = zGenerationParams.parse(body);

    // 3. Generate content
    const content = await generateEducationalContent(params);

    // 4. Return response
    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 5. Error handling
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### API Gateway Pattern

**Current:** Direct Gemini API calls from client

**Future:** API Gateway via Supabase Edge Functions

**Benefits of Gateway:**
- API key security (not exposed to client)
- Rate limiting
- Request caching
- Logging and monitoring
- Request/response transformation

---

## Data Flow

### Content Generation Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Fills form & clicks "Generate"
     ▼
┌──────────────────────┐
│ ContentStudio (UI)   │
└────┬─────────────────┘
     │ 2. Validates params & calls service
     ▼
┌──────────────────────┐
│ GeminiService        │
└────┬─────────────────┘
     │ 3. Sends API request
     ▼
┌──────────────────────┐
│ Google Gemini API    │
└────┬─────────────────┘
     │ 4. Returns generated content
     ▼
┌──────────────────────┐
│ GeminiService        │
└────┬─────────────────┘
     │ 5. Validates with Zod
     ▼
┌──────────────────────┐
│ ContentStudio (UI)   │
└────┬─────────────────┘
     │ 6. Updates state & displays
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### Streaming Content Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Initiates generation
     ▼
┌──────────────────────┐
│ ContentStudio        │
└────┬─────────────────┘
     │ 2. Calls streamContent()
     ▼
┌──────────────────────┐
│ GeminiService        │
└────┬─────────────────┘
     │ 3. Opens stream
     ▼
┌──────────────────────┐
│ Gemini API Stream    │
└────┬─────────────────┘
     │ 4. Yields chunks
     ▼
┌──────────────────────┐
│ GeminiService        │◄───┐
└────┬─────────────────┘    │
     │ 5. Forwards chunk     │ Loop for each chunk
     ▼                       │
┌──────────────────────┐    │
│ ContentStudio        │────┘
└────┬─────────────────┘
     │ 6. Updates preview
     ▼
┌──────────┐
│  User    │ (sees real-time preview)
└──────────┘
```

### Data Persistence Flow (Future)

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Saves content
     ▼
┌──────────────────────┐
│ ContentStudio        │
└────┬─────────────────┘
     │ 2. Calls save()
     ▼
┌──────────────────────┐
│ ContentRepository    │
└────┬─────────────────┘
     │ 3. Inserts to DB
     ▼
┌──────────────────────┐
│ Supabase/PostgreSQL  │
└────┬─────────────────┘
     │ 4. RLS checks auth
     ▼
┌──────────────────────┐
│ Database Table       │
└────┬─────────────────┘
     │ 5. Returns success
     ▼
┌──────────┐
│  User    │ (sees confirmation)
└──────────┘
```

---

## AI Integration Architecture

### Gemini API Integration

**Service Design:**

```typescript
class GeminiService {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  async generateContent(params: GenerationParams): Promise<EducationalContent> {
    // Build prompt
    const prompt = this.buildPrompt(params);

    // Configure generation
    const config = {
      temperature: 0.7,        // Balance creativity & consistency
      topK: 40,                // Top-k sampling
      topP: 0.95,              // Nucleus sampling
      maxOutputTokens: 8192,   // Max response length
      responseMimeType: "application/json",
      responseSchema: educationalContentSchema,
    };

    // Generate
    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: config,
    });

    // Parse and validate
    const content = JSON.parse(result.response.text());
    return zEducationalContent.parse(content);
  }

  private buildPrompt(params: GenerationParams): string {
    // Prompt engineering based on params
    const audience = params.targetAudience;
    const type = params.contentType;

    const systemContext = `You are an expert educational content creator...`;
    const userRequest = `Create a ${type} for ${audience} on topic: ${params.topic}`;
    const constraints = `Subject: ${params.subject}, Grade: ${params.gradeLevel}`;

    return `${systemContext}\n\n${userRequest}\n\n${constraints}`;
  }
}
```

### Prompt Engineering Strategy

**Prompt Structure:**

```
1. System Context (Role definition)
   "You are an expert educational content creator with 20 years of experience..."

2. Task Definition (What to generate)
   "Create a lesson plan for educators on the topic of Photosynthesis"

3. Constraints (Parameters)
   - Subject: Science
   - Grade Level: 8th Grade
   - Standard: NGSS MS-LS1-6
   - Content Type: Lesson

4. Output Format (JSON schema)
   {
     "title": "string",
     "objectives": ["string"],
     "content": "markdown string",
     ...
   }

5. Quality Guidelines
   - Be engaging and age-appropriate
   - Include real-world examples
   - Provide differentiation strategies
```

### Response Validation

**Two-Stage Validation:**

1. **Schema Validation (Gemini):**
   - Gemini uses `responseSchema` to ensure structure
   - Reduces malformed responses

2. **Runtime Validation (Zod):**
   - Additional client-side validation
   - Type coercion and transformation
   - Error handling

```typescript
// Zod schema
const zEducationalContent = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  type: z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']),
  targetAudience: z.enum(['educator', 'student', 'both', 'seller']),
  subject: z.string(),
  gradeLevel: z.string(),
  content: z.string().min(10),
  metadata: z.object({
    objectives: z.array(z.string()).optional(),
    standards: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    duration: z.string().optional(),
  }).passthrough(),
  generatedAt: z.string().datetime().optional(),
});

// Usage
try {
  const validated = zEducationalContent.parse(rawContent);
  // Type is now EducationalContent
} catch (error) {
  // Handle validation error
}
```

---

## Authentication & Authorization

### Current: Mock Authentication

**Architecture:**

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**Flow:**
```
User clicks "Sign In"
     ↓
signIn() called
     ↓
setIsAuthenticated(true)
     ↓
AuthGuard allows access
     ↓
User sees protected routes
```

### Future: Supabase Authentication

**Architecture:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// OAuth (Google, GitHub, etc.)
await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Update app state
  }
});
```

### Authorization with RLS

**Row-Level Security Policies:**

```sql
-- Users can only read their own content
CREATE POLICY "Users view own content"
  ON educational_content FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create content
CREATE POLICY "Users create content"
  ON educational_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their content
CREATE POLICY "Users update own content"
  ON educational_content FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────────┐
│   auth.users     │
│  (Supabase)      │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│ educational_content  │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ title                │
│ type                 │
│ target_audience      │
│ subject              │
│ grade_level          │
│ content (TEXT)       │
│ metadata (JSONB)     │
│ generated_at         │
│ created_at           │
└────────┬─────────────┘
         │
         │ 1:1
         ▼
┌──────────────────┐
│   assessments    │
├──────────────────┤
│ id (PK)          │
│ content_id (FK)  │
│ questions (JSONB)│
│ rubric (JSONB)   │
│ answer_key (JSONB)│
└──────────────────┘

┌──────────────────┐
│ user_analytics   │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ content_created  │
│ popular_subjects │
│ tool_usage       │
└──────────────────┘
```

### Table Schemas

#### educational_content

```sql
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX idx_content_user_id ON educational_content(user_id);
CREATE INDEX idx_content_subject ON educational_content(subject);
CREATE INDEX idx_content_grade ON educational_content(grade_level);
CREATE INDEX idx_content_type ON educational_content(type);
CREATE INDEX idx_content_created_at ON educational_content(created_at DESC);

-- Full-text search index
CREATE INDEX idx_content_search ON educational_content USING GIN (to_tsvector('english', title || ' ' || content));
```

### Data Modeling Decisions

**Why JSONB for metadata?**
- Flexible schema for different content types
- Each content type has unique metadata requirements
- Easy to query and index specific JSON fields
- PostgreSQL has excellent JSONB support

**Why separate assessments table?**
- Assessments have complex structure (questions, rubrics)
- Not all content is an assessment
- Easier to query and analyze assessment-specific data

---

## API Design

### REST API Conventions (Future)

**Endpoints:**

```
GET    /api/content              # List all content
GET    /api/content/:id          # Get specific content
POST   /api/content              # Create new content
PUT    /api/content/:id          # Update content
DELETE /api/content/:id          # Delete content

POST   /api/content/generate     # Generate new content via AI

GET    /api/tools                # List educational tools
GET    /api/tools/:id            # Get specific tool

GET    /api/analytics            # Get user analytics
```

**Request/Response Format:**

```typescript
// POST /api/content/generate
Request:
{
  "targetAudience": "educator",
  "subject": "Mathematics",
  "gradeLevel": "6th Grade",
  "contentType": "lesson",
  "topic": "Fractions",
  "standard": "CCSS.MATH.CONTENT.6.NS.A.1"
}

Response (200 OK):
{
  "id": "uuid",
  "title": "Introduction to Fractions",
  "type": "lesson",
  "content": "# Lesson Plan...",
  "metadata": {
    "objectives": ["..."],
    "duration": "45 minutes"
  },
  "generatedAt": "2025-10-22T10:00:00Z"
}

Error Response (400 Bad Request):
{
  "error": "Validation failed",
  "details": {
    "topic": "Topic is required"
  }
}
```

---

## Performance Considerations

### Frontend Optimization

**Code Splitting:**
```typescript
// Lazy load heavy components
const EducationalContentStudio = lazy(() =>
  import('./components/education/EducationalContentStudio')
);

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <EducationalContentStudio />
</Suspense>
```

**Memoization:**
```typescript
// Expensive calculations
const processedData = useMemo(() => {
  return processLargeDataset(rawData);
}, [rawData]);

// Callback stability
const handleSubmit = useCallback((data) => {
  submitToAPI(data);
}, []);

// Component memoization
const MemoizedToolCard = React.memo(ToolCard);
```

**Debouncing:**
```typescript
// Search input
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);
```

### API Optimization

**Caching:**
```typescript
// Cache generated content
const contentCache = new Map<string, EducationalContent>();

function getCachedContent(key: string) {
  if (contentCache.has(key)) {
    return contentCache.get(key);
  }
  // Generate and cache
}
```

**Request Batching (Future):**
```typescript
// Batch multiple generation requests
async function batchGenerate(requests: GenerationParams[]) {
  return Promise.all(requests.map(generateContent));
}
```

### Database Optimization

**Indexes:**
- Primary keys (automatic)
- Foreign keys
- Frequently queried fields (subject, grade_level, user_id)
- Full-text search index

**Query Optimization:**
```sql
-- Use indexes
SELECT * FROM educational_content
WHERE user_id = $1
  AND subject = $2
ORDER BY created_at DESC
LIMIT 10;

-- Use JSONB operators efficiently
SELECT * FROM educational_content
WHERE metadata @> '{"objectives": ["photosynthesis"]}';
```

---

## Security Architecture

### API Key Protection

**Current:** Client-side API key (development only)
**Production:** Use Edge Functions to hide API keys

```typescript
// ❌ Don't do this in production
const gemini = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ✅ Use Edge Functions instead
const response = await supabase.functions.invoke('generate-content', {
  body: { params }
});
```

### Input Validation

**Client-Side:**
```typescript
const zGenerationParams = z.object({
  targetAudience: z.enum(['educator', 'student', 'both', 'seller']),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  contentType: z.enum(['lesson', 'assessment', 'activity', 'resource', 'printable']),
  topic: z.string().min(3).max(500),
  standard: z.string().optional(),
});
```

**Server-Side:**
```typescript
// Edge function validation
const body = await req.json();
const validParams = zGenerationParams.parse(body);
// Will throw if invalid
```

### XSS Prevention

**React's Built-in Protection:**
- React escapes content by default
- Use `dangerouslySetInnerHTML` only when necessary

**Content Sanitization:**
```typescript
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userContent);
```

### CSRF Protection

**Supabase handles CSRF** via:
- JWT tokens
- Short-lived session tokens
- Automatic token refresh

---

## Scalability Considerations

### Horizontal Scaling

**Stateless Frontend:**
- SPA can be served from CDN
- No server-side state
- Scales infinitely

**Serverless Backend:**
- Edge Functions auto-scale
- Pay per request
- No server management

### Database Scaling

**PostgreSQL (Supabase):**
- Vertical scaling (upgrade instance)
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)

**Future: Caching Layer:**
- Redis for frequently accessed data
- CDN for static assets

### Rate Limiting

**Gemini API:**
- Implement client-side rate limiting
- Queue requests if necessary
- Show user-friendly messages

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 3;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
    }
  }
}
```

---

## Design Decisions

### Why Vite over Create React App?

- **Performance:** Faster dev server (ES modules)
- **Build Speed:** Faster production builds
- **Modern:** Better support for latest features
- **Ecosystem:** Growing plugin ecosystem

### Why TypeScript?

- **Type Safety:** Catch errors at compile time
- **IntelliSense:** Better IDE support
- **Refactoring:** Safer code changes
- **Documentation:** Types serve as documentation

### Why Zod?

- **Runtime Validation:** TypeScript only checks at compile time
- **Schema Definition:** Single source of truth
- **Type Inference:** Generate TypeScript types from schemas
- **Error Messages:** Helpful validation errors

### Why Tailwind CSS?

- **Utility-First:** Rapid development
- **No CSS Files:** Styles co-located with components
- **Purging:** Automatically removes unused CSS
- **Consistency:** Design system built-in

### Why Supabase?

- **PostgreSQL:** Powerful, reliable database
- **Edge Functions:** Serverless compute
- **Auth:** Built-in authentication
- **Real-time:** WebSocket support (future use)
- **Open Source:** Self-hostable

---

## Future Architecture Plans

### Phase 1: Real Authentication (Q1 2026)
- Implement Supabase Auth
- Add user profiles
- Enable content history

### Phase 2: Data Persistence (Q2 2026)
- Save generated content to database
- Implement content management
- Add search and filtering

### Phase 3: Collaboration (Q3 2026)
- Multi-user editing
- Sharing and permissions
- Comments and feedback

### Phase 4: Marketplace (Q4 2026)
- Buy/sell educational content
- Payment integration (Stripe)
- Revenue sharing

### Phase 5: Mobile App (2027)
- React Native app
- Offline support
- Mobile-optimized UI

### Phase 6: Advanced AI (2027)
- Fine-tuned models
- Custom AI training
- Multi-modal content (images, videos)

---

**This architecture is designed for growth, maintainability, and scalability.**

*Last updated: October 2025*
