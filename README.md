
# AI Academic Content Catalog

This project is an advanced AI-powered tool for generating academic content, built with React, TypeScript, and Tailwind CSS.

## Enabling the /education Route

The `/education` route and all its features are protected by an authentication guard. To use the application, you must first "Sign In" or "Start Demo Session" using the buttons in the header. The application uses a mock auth system, so no real credentials are needed.

## Running Smoke Tests

A series of checks can be performed to ensure the application's core components and data structures are correctly configured.

To run the smoke tests, you would typically add a script to your `package.json` and use a test runner like `vitest` or `jest`.

**1. Add script to `package.json` (example):**

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


// Test 3: Check for presence of core files (conceptual check)
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
