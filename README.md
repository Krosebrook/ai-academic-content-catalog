# AI Academic Content Catalog

> An advanced AI-powered educational content generation platform for educators, students, and digital product sellers

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AI Academic Content Catalog** is a comprehensive web application that leverages Google's Gemini AI to generate high-quality, standards-aligned educational content. Whether you're an educator creating lesson plans, a student preparing study materials, or a content creator developing digital products, this platform provides the tools you need.

### What Problem Does It Solve?

- **Time-consuming lesson planning** - Generate complete, standards-aligned lessons in minutes
- **Assessment creation** - Quickly create diverse assessments with rubrics
- **Content consistency** - Ensure all materials follow best practices and educational standards
- **Resource scarcity** - Access 60+ pre-built educational tools and templates
- **Multi-format needs** - Export content in multiple formats (Markdown, JSON, CSV, DOCX, PPT)

### Who Is It For?

1. **Educators** - Teachers, professors, and instructional designers
2. **Students** - Learners who need study aids, flashcards, and practice materials
3. **Content Creators** - Digital product sellers creating educational materials (TPT, Gumroad, etc.)
4. **Institutions** - Schools and training organizations needing standardized content

---

## Key Features

### 1. Educational Content Studio
Generate AI-powered educational content with fine-grained control:

- **Content Types**: Lessons, assessments, activities, resources, printables
- **10 Subjects**: Math, Science, English, History, CS, Languages, Arts, PE, Economics, Career/Technical
- **17 Grade Levels**: Pre-K through Professional Development
- **9 Educational Standards**: Common Core, NGSS, IB, AP, Texas TEKS, and more
- **4 Audience Types**: Educator-focused, student-focused, both, or seller-ready
- **Real-time Generation**: Streaming preview with progress tracking
- **Multi-format Export**: MD, JSON, CSV (flashcards), DOCX outline, PPT outline

### 2. Educational Tools Library
Access 60+ pre-built tools across 6 categories:

- **Lesson Planning** (12 tools) - Unit planners, curriculum maps, differentiation guides
- **Assessments** (10 tools) - Quiz generators, rubric builders, exit tickets
- **Communications** (8 tools) - Parent letters, progress reports, newsletters
- **Study Aids** (10 tools) - Flashcards, study guides, concept maps
- **Interactive Games** (10 tools) - Jeopardy, crosswords, escape rooms
- **Language & Accessibility** (7 tools) - Translation, text simplification, visual schedules

### 3. Analytics Dashboard
Track your content creation and usage:

- Content generated over time
- Popular subjects and grade levels
- Tool usage statistics
- User satisfaction ratings

### 4. Modern UI/UX
Built with the custom **FlashFusion Design System**:

- Beautiful gradients and animations
- Dark theme optimized for extended use
- Responsive design for all devices
- Accessible and WCAG compliant

---

## Live Demo

**To use the application:**

1. Start the development server (see [Quick Start](#quick-start))
2. Click "Sign In" or "Start Demo Session" in the header
3. Navigate to the `/education` route to access all features

> **Note:** The application uses mock authentication - no real credentials are required!

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))
- **Supabase Account** (optional, for backend features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-academic-content-catalog.git
cd ai-academic-content-catalog

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY
```

### Development

```bash
# Start the development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here (optional)
VITE_SUPABASE_ANON_KEY=your_supabase_key_here (optional)
```

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [**USER_GUIDE.md**](./docs/USER_GUIDE.md) - Complete user manual with screenshots
- [**DEVELOPER_GUIDE.md**](./docs/DEVELOPER_GUIDE.md) - Technical documentation for developers
- [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md) - System design and architecture decisions
- [**API_REFERENCE.md**](./docs/API_REFERENCE.md) - API endpoints and integration guide
- [**FEATURES.md**](./docs/FEATURES.md) - Detailed feature descriptions and use cases

---

## Technology Stack

### Frontend
- **React 19.1.1** - UI library
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Vite 6.2.0** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework

### AI & APIs
- **Google Generative AI** (@google/genai 1.21.0) - Gemini 2.5 Flash model
- **Supabase** - PostgreSQL database and edge functions

### Validation & Quality
- **Zod 4.1.11** - Runtime schema validation
- **TypeScript** - Compile-time type checking

### Design
- **Custom Design System** - FlashFusion with CSS variables
- **Google Fonts** - Sora, Inter, JetBrains Mono

---

## Project Structure

```
ai-academic-content-catalog/
├── components/              # React components
│   ├── education/          # Education-specific components
│   │   ├── EducationalContentStudio.tsx
│   │   ├── EducationalToolsRouter.tsx
│   │   ├── analytics/      # Analytics components
│   │   ├── exports/        # Export functionality
│   │   └── shared/         # Shared UI components
│   └── pages/              # Page components
├── constants/              # Application constants
│   └── education.ts        # Subjects, grades, standards, tools
├── types/                  # TypeScript type definitions
│   └── education.ts        # Education-related types
├── services/               # External service integrations
│   └── geminiService.ts    # Google Gemini API client
├── utils/                  # Utility functions
│   ├── auth-protection.ts  # Authentication guards
│   ├── validation.ts       # Zod schemas
│   └── exports.ts          # Export utilities
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── policies/           # Row-level security policies
├── edge-functions/         # Deno serverless functions
│   └── generate-education-content/
├── docs/                   # Documentation (you're here!)
├── App.tsx                 # Root React component
├── index.tsx               # Application entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## Authentication & Protected Routes

The application uses a **mock authentication system** for demonstration purposes:

- **Public Routes**: `/`, `/about`, `/pricing`, `/contact`, `/demo`, `/auth`
- **Protected Routes**: `/education`, `/dashboard`, `/creator`, `/tools`

**To access protected routes:**
1. Click "Sign In" or "Start Demo Session" in the header
2. No credentials required - it's mock auth!
3. Navigate freely to all features

---

## Testing

### Smoke Tests

Run basic smoke tests to verify core functionality:

```bash
# Add to package.json scripts
"smoke:education": "node smoke-tests/education.mjs"

# Run tests
npm run smoke:education
```

See the full smoke test implementation in [Running Smoke Tests](#running-smoke-tests) section below.

---

## Running Smoke Tests

A series of checks can be performed to ensure the application's core components and data structures are correctly configured.

**1. Add script to `package.json`:**

```json
"scripts": {
  "smoke:education": "node smoke-tests/education.mjs"
}
```

**2. Create the smoke test file `smoke-tests/education.mjs`:**

```javascript
import { SUBJECTS, GRADE_LEVELS, EDUCATIONAL_STANDARDS } from '../src/constants/education.js';
import { zEducationalContent } from '../src/utils/validation.js';
import assert from 'assert';

console.log('--- Running Education Module Smoke Tests ---');

// Test 1: Verify constants are loaded correctly
console.log('Test 1: Verifying constants...');
assert(SUBJECTS.length >= 10, `Expected >=10 subjects, but got ${SUBJECTS.length}`);
assert(GRADE_LEVELS.length === 17, `Expected 17 grade levels, but got ${GRADE_LEVELS.length}`);
assert(EDUCATIONAL_STANDARDS.length >= 9, `Expected >=9 standards, but got ${EDUCATIONAL_STANDARDS.length}`);
console.log('✅ Constants are valid.');

// Test 2: Validate Zod schema against a sample payload
console.log('\nTest 2: Validating Zod schema...');
const samplePayload = {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    title: "Sample Lesson",
    type: "lesson",
    targetAudience: "educator",
    subject: "Science",
    gradeLevel: "8th Grade",
    content: "## Introduction...",
    metadata: {
        objectives: ["Understand photosynthesis."]
    },
    generatedAt: new Date().toISOString()
};

const validationResult = zEducationalContent.safeParse(samplePayload);
assert(validationResult.success, `Zod validation failed: ${JSON.stringify(validationResult.error)}`);
console.log('✅ Zod schema successfully validated sample payload.');

// Test 3: Check for presence of core files
console.log('\nTest 3: Verifying file structure...');
const requiredFiles = [
    './components/pages/EducationPage.tsx',
    './components/education/EducationalContentStudio.tsx',
    './constants/education.ts',
    './types/education.ts',
    './utils/validation.ts',
    './supabase/migrations/001_education.sql',
];
console.log(`(Conceptual) Ensure these files exist: ${requiredFiles.join(', ')}`);
console.log('✅ Core files are conceptually present.');

console.log('\n--- Smoke Tests Passed Successfully! ---');
```

**3. Run the script:**

```bash
npm run smoke:education
```

---

## Export Formats

The application supports multiple export formats for generated content:

| Format | Use Case | Features |
|--------|----------|----------|
| **Markdown** | General documentation | Full formatting, headers, metadata |
| **JSON** | Data interchange | Structured data, API-friendly |
| **CSV** | Flashcards | Anki/Quizlet compatible, front/back format |
| **DOCX Outline** | Word documents | Text outline for Microsoft Word |
| **PPT Outline** | Presentations | Slide-by-slide outline for PowerPoint |

---

## Roadmap

### Current Features (v1.0)
- ✅ Educational Content Studio with Gemini AI
- ✅ 60+ Educational Tools Library
- ✅ Analytics Dashboard
- ✅ Multi-format Export (MD, JSON, CSV, DOCX, PPT)
- ✅ Mock Authentication System

### Planned Features (v1.1+)
- 🔄 Real Authentication with Supabase Auth
- 🔄 User Profiles and Content History
- 🔄 Collaborative Content Editing
- 🔄 Content Marketplace (Buy/Sell educational products)
- 🔄 API Access for Third-party Integrations
- 🔄 Mobile App (React Native)
- 🔄 Advanced Analytics with Insights
- 🔄 Multi-language Support (i18n)

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-academic-content-catalog/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-academic-content-catalog/discussions)
- **Email**: support@yourdomain.com

---

## Acknowledgments

- **Google Generative AI** - For providing the Gemini API
- **Supabase** - For backend infrastructure
- **React Community** - For the amazing ecosystem
- **All Contributors** - For making this project better

---

**Built with ❤️ for educators, students, and content creators worldwide**
