
export const EDUCATIONAL_STANDARDS = [
  'Common Core State Standards', 'Next Generation Science Standards (NGSS)',
  'International Baccalaureate (IB)', 'Advanced Placement (AP)', 'State Standards',
  'British National Curriculum', 'Australian Curriculum', 'Canadian Curriculum',
  'Custom Curriculum'
];

export const SUBJECTS = [
  { 
    id: 'mathematics', 
    name: 'Mathematics', 
    categories: ['Algebra','Geometry','Calculus','Statistics'],
    exampleTopics: ['Linear Equations', 'Pythagorean Theorem', 'Limits and Derivatives', 'Probability Distributions']
  },
  { 
    id: 'science', 
    name: 'Science', 
    categories: ['Biology','Chemistry','Physics','Earth Science'],
    exampleTopics: ['Cellular Respiration', 'The Periodic Table', 'Newton\'s Laws of Motion', 'The Rock Cycle']
  },
  { 
    id: 'english', 
    name: 'English Language Arts', 
    categories: ['Reading','Writing','Literature','Grammar'],
    exampleTopics: ['Analyzing Shakespeare', 'Crafting a Persuasive Essay', 'Symbolism in "The Great Gatsby"', 'Proper Use of Commas']
  },
  { 
    id: 'history', 
    name: 'History & Social Studies', 
    categories: ['US History','World History','Civics','Geography'],
    exampleTopics: ['The American Revolution', 'Ancient Roman Empire', 'The U.S. Constitution', 'Mapping Global Trade Routes']
  },
  { 
    id: 'computer_science', 
    name: 'Computer Science', 
    categories: ['Programming','Data Structures','AI','Web'],
    exampleTopics: ['Introduction to Python', 'Arrays and Linked Lists', 'Neural Networks Explained', 'Building a Simple Website with HTML/CSS']
  },
  { 
    id: 'foreign_language', 
    name: 'World Languages', 
    categories: ['Spanish','French','German','Mandarin'],
    exampleTopics: ['Spanish Verb Conjugation', 'French Cafe Culture', 'German Noun Genders', 'Basic Mandarin Phrases']
  },
  { 
    id: 'arts', 
    name: 'Arts', 
    categories: ['Music','Visual Arts','Drama','Design'],
    exampleTopics: ['Music Theory Basics', 'Introduction to Perspective Drawing', 'Improvisational Acting Techniques', 'Principles of Graphic Design']
  },
  { 
    id: 'pe', 
    name: 'Physical Education', 
    categories: ['Fitness','Health','Nutrition'],
    exampleTopics: ['Benefits of Cardiovascular Exercise', 'Understanding Mental Health', 'The Food Pyramid', 'Team Sports Strategies']
  },
  { 
    id: 'economics', 
    name: 'Economics', 
    categories: ['Micro','Macro','Personal Finance'],
    exampleTopics: ['Supply and Demand', 'GDP and Inflation', 'Budgeting and Saving', 'Stock Market Basics']
  },
  { 
    id: 'career', 
    name: 'Career & Technical', 
    categories: ['Business','Marketing','Trades'],
    exampleTopics: ['Writing a Business Plan', 'Digital Marketing Funnels', 'Introduction to Welding Safety', 'Public Speaking for Professionals']
  }
];

export const GRADE_LEVELS = [
  'Pre-K','Kindergarten','1st Grade','2nd Grade','3rd Grade',
  '4th Grade','5th Grade','6th Grade','7th Grade','8th Grade',
  '9th Grade','10th Grade','11th Grade','12th Grade',
  'College/University','Adult Education','Professional Development'
];

export const EDUCATIONAL_TOOL_CATEGORIES = [
  { 
    id: 'lesson-planning', 
    name: 'Lesson Planning', 
    tools: [
      { id: 'lp-01', name: 'Differentiated Lesson Plan', description: 'Generate a complete lesson plan with variations for gifted, ESL, and remedial students.', popularity: 5 },
      { id: 'lp-02', name: '5E Model Lesson', description: 'Structure a science lesson using the Engage, Explore, Explain, Elaborate, Evaluate model.', popularity: 4 },
      { id: 'lp-03', name: 'Project-Based Learning Unit', description: 'Outline a multi-week PBL unit with driving questions, milestones, and final products.', popularity: 5 },
      { id: 'lp-04', name: 'Curriculum Map Generator', description: 'Create a year-long curriculum map aligned to specific standards.', popularity: 4 },
      { id: 'lp-05', name: 'Learning Objectives Creator', description: 'Write clear, measurable learning objectives (SWBAT).', popularity: 3 },
      { id: 'lp-06', name: 'Substitute Teacher Plans', description: 'Generate easy-to-follow plans for a substitute teacher.', popularity: 4 },
      { id: 'lp-07', name: 'Lab Activity Designer', description: 'Design a hands-on science lab with safety protocols and procedures.', popularity: 4 },
      { id: 'lp-08', name: 'Socratic Seminar Planner', description: 'Develop questions and a structure for a student-led discussion.', popularity: 3 },
      { id: 'lp-09', name: 'Bell Ringer/Exit Ticket Pack', description: 'Create a week\'s worth of quick warm-up and cool-down activities.', popularity: 5 },
      { id: 'lp-10', name: 'Field Trip Itinerary', description: 'Plan an educational field trip with learning goals and logistical details.', popularity: 2 },
      { id: 'lp-11', name: 'Thematic Unit Outline', description: 'Brainstorm ideas and structure for a cross-curricular thematic unit.', popularity: 3 },
      { id: 'lp-12', name: 'Guest Speaker Briefing', description: 'Prepare a guide for a guest speaker with relevant topics and questions.', popularity: 2 },
    ] 
  },
  { 
    id: 'assessments', 
    name: 'Assessments', 
    tools: [
      { id: 'as-01', name: 'Multiple Choice Quiz', description: 'Generate a quiz with plausible distractors and an answer key.', popularity: 5 },
      { id: 'as-02', name: 'Short Answer Test', description: 'Create open-ended questions to assess deeper understanding.', popularity: 4 },
      { id: 'as-03', name: 'Essay Prompt & Rubric', description: 'Develop a compelling essay prompt with a detailed grading rubric.', popularity: 5 },
      { id: 'as-04', name: 'True/False Worksheet', description: 'Quickly create a true/false assessment on any topic.', popularity: 3 },
      { id: 'as-05', name: 'Performance Task Designer', description: 'Design an assessment where students demonstrate a skill.', popularity: 4 },
      { id: 'as-06', name: 'Rubric Generator', description: 'Create a custom rubric for any project or assignment.', popularity: 5 },
      { id: 'as-07', name: 'Diagnostic Pre-Assessment', description: 'Create a test to gauge prior knowledge before a unit.', popularity: 4 },
      { id: 'as-08', name: 'Summative Unit Test', description: 'Build a comprehensive test covering an entire unit of study.', popularity: 4 },
      { id: 'as-09', name: 'Peer Review Form', description: 'Generate a structured form for students to give each other feedback.', popularity: 3 },
      { id: 'as-10', name: 'Portfolio Checklist', description: 'Create a checklist of required items for a student portfolio.', popularity: 2 },
      { id: 'as-11', name: 'Custom Rubric Builder', description: 'Specify criteria, levels of achievement (e.g., Excellent, Good, Poor), and point values to generate a detailed rubric.', popularity: 5 },
      { id: 'as-12', name: 'Quiz Question Generator', description: 'Generate a variety of quiz questions (multiple-choice, short-answer, etc.) on a specific topic.', popularity: 5 },
    ] 
  },
  { 
    id: 'communications', 
    name: 'Parent & Class Comms', 
    tools: [
        { id: 'cm-01', name: 'Parent Newsletter', description: 'Draft a weekly or monthly newsletter for parents.', popularity: 5 },
        { id: 'cm-02', name: 'Positive Behavior Note', description: 'Write an encouraging note home about a student\'s success.', popularity: 4 },
        { id: 'cm-03', name: 'Progress Report Comments', description: 'Generate personalized comments for student report cards.', popularity: 5 },
        { id: 'cm-04', name: 'Difficult Conversation Script', description: 'Prepare talking points for a challenging parent-teacher conference.', popularity: 3 },
        { id: 'cm-05', name: 'Class Website Update', description: 'Write a quick update for your class blog or website.', popularity: 3 },
        { id: 'cm-06', name: 'Field Trip Permission Slip', description: 'Draft the text for a field trip permission form.', popularity: 2 },
        { id: 'cm-07', name: 'Student of the Month Blurb', description: 'Write a celebratory announcement for a standout student.', popularity: 4 },
        { id: 'cm-08', name: 'Supply Request Letter', description: 'Compose a letter to parents requesting classroom supplies.', popularity: 2 },
    ] 
  },
  { 
    id: 'study-aids', 
    name: 'Study Aids & Flashcards', 
    tools: [
        { id: 'sa-01', name: 'Flashcard Generator (CSV)', description: 'Create term/definition pairs for import into Anki/Quizlet.', popularity: 5 },
        { id: 'sa-02', name: 'Smart Study Guide', description: 'Generate a study guide with key concepts, vocabulary, and practice questions.', popularity: 5 },
        { id: 'sa-03', name: 'Mind Map Outline', description: 'Create a textual hierarchy for a visual mind map.', popularity: 4 },
        { id: 'sa-04', name: 'Personalized Study Plan', description: 'Develop a weekly study schedule based on subjects and goals.', popularity: 4 },
        { id: 'sa-05', name: 'Essay Outline Creator', description: 'Structure an essay with a thesis statement, arguments, and evidence.', popularity: 5 },
        { id: 'sa-06', name: 'ELI12 Explainer', description: 'Explain a complex topic as if you were talking to a 12-year-old.', popularity: 4 },
        { id: 'sa-07', name: 'Mnemonic Device Creator', description: 'Generate acronyms or clever sentences to remember information.', popularity: 3 },
        { id: 'sa-08', name: 'Cornell Notes Template', description: 'Create a structured notes template for a specific topic.', popularity: 3 },
        { id: 'sa-09', name: 'Citation Helper (APA/MLA)', description: 'Get help formatting citations for a bibliography.', popularity: 4 },
        { id: 'sa-10', name: 'Self-Correction Test', description: 'Create a practice test with detailed answer explanations.', popularity: 4 },
        { id: 'sa-11', name: 'Flashcard Generator', description: 'Create term/definition pairs for import into Anki/Quizlet.', popularity: 5 },
    ] 
  },
  { 
    id: 'interactive', 
    name: 'Interactive & Games', 
    tools: [
        { id: 'ig-01', name: 'Jeopardy Game Board', description: 'Create categories and questions for a classroom Jeopardy game.', popularity: 5 },
        { id: 'ig-02', name: 'Crossword Puzzle Generator', description: 'Generate clues and answers for a crossword puzzle.', popularity: 4 },
        { id: 'ig-03', name: 'Role-Playing Scenario', description: 'Write a script for a history or literature role-playing activity.', popularity: 3 },
        { id: 'ig-04', name: 'Classroom Debate Prompts', description: 'Generate a controversial topic and structured debate format.', popularity: 4 },
        { id: 'ig-05', name: 'Escape Room Puzzles', description: 'Design a series of themed puzzles for a digital or physical escape room.', popularity: 4 },
        { id: 'ig-06', name: 'Word Search Creator', description: 'Generate a word search from a list of vocabulary words.', popularity: 3 },
        { id: 'ig-07', name: 'Choose Your Own Adventure', description: 'Outline a branching narrative for an interactive story.', popularity: 4 },
        { id: 'ig-08', name: 'Group Project Roles', description: 'Define specific roles and responsibilities for a group project.', popularity: 5 },
        { id: 'ig-09', name: 'Bingo Card Content', description: 'Create items for a vocabulary or concept review bingo game.', popularity: 2 },
        { id: 'ig-10', name: 'Simulation Parameters', description: 'Define the rules and variables for a classroom simulation (e.g., stock market).', popularity: 3 },
    ] 
  },
  { 
    id: 'printables', 
    name: 'Printables & Packs', 
    tools: [
        { id: 'pp-01', name: 'Coloring Pages Ideas', description: 'Generate descriptions for themed coloring pages.', popularity: 4 },
        { id: 'pp-02', name: 'Worksheet Pack Generator', description: 'Create a set of practice worksheets with an answer key.', popularity: 5 },
        { id: 'pp-03', name: 'Themed Activity Pack', description: 'Design a bundle of activities (maze, word search, etc.) around a theme.', popularity: 4 },
        { id: 'pp-04', name: 'Student Planner Pages', description: 'Generate layouts for daily, weekly, and monthly planner pages.', popularity: 3 },
        { id: 'pp-05', name: 'Habit Tracker Template', description: 'Design a printable habit tracker for students.', popularity: 3 },
        { id: 'pp-06', name: 'Exam Prep Kit Outline', description: 'Outline the contents of a comprehensive exam prep kit for SAT/ACT.', popularity: 4 },
        { id: 'pp-07', name: 'Classroom Posters Content', description: 'Write the text for educational posters (e.g., grammar rules, lab safety).', popularity: 4 },
        { id: 'pp-08', name: 'Certificate of Achievement', description: 'Draft the wording for a printable award certificate.', popularity: 2 },
        { id: 'pp-09', name: 'Infographic Creator', description: 'Generate engaging infographic outlines or content suggestions for visual topics.', popularity: 4 },
    ] 
  },
  { 
    id: 'language', 
    name: 'Language & Accessibility', 
    tools: [
        { id: 'la-01', name: 'Text Leveler', description: 'Rewrite a text at different reading levels (Lexile scores).', popularity: 5 },
        { id: 'la-02', name: 'Vocabulary in Context', description: 'Provide a list of vocabulary words with contextual sentences.', popularity: 4 },
        { id: 'la-03', name: 'Simple Translation', description: 'Translate key instructions or vocabulary into another language.', popularity: 3 },
        { id: 'la-04', name: 'Social Story Creator', description: 'Write a social story to help students navigate social situations.', popularity: 4 },
        { id: 'la-05', name: 'Audio Script for Text', description: 'Convert a reading passage into a script for audio recording.', popularity: 2 },
        { id: 'la-06', name: 'Visual Schedule Steps', description: 'Break down a task into simple, image-friendly steps for a visual schedule.', popularity: 3 },
        { id: 'la-07', name: 'Sentence Starters', description: 'Provide sentence starters to help students with writing assignments.', popularity: 5 },
    ] 
  },
];

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

export const BLOOMS_TAXONOMY_LEVELS = [
    { name: 'Remember', description: 'Recall facts and basic concepts.' },
    { name: 'Understand', description: 'Explain ideas or concepts.' },
    { name: 'Apply', description: 'Use information in new situations.' },
    { name: 'Analyze', description: 'Draw connections among ideas.' },
    { name: 'Evaluate', description: 'Justify a stand or decision.' },
    { name: 'Create', description: 'Produce new or original work.' },
];

export const DIFFERENTIATION_PROFILES = [
    { id: 'ell', name: 'English Language Learner', description: 'Students who are learning English as a second language.' },
    { id: 'gifted', name: 'Gifted/Talented', description: 'Students who require enrichment and more complex challenges.' },
    { id: 'reading_difficulties', name: 'Student with Reading Difficulties', description: 'Students who struggle with grade-level text, such as those with dyslexia.' },
    { id: 'adhd', name: 'Student with Attention Difficulties', description: 'Students who may have ADHD and require support for focus and engagement.' },
];