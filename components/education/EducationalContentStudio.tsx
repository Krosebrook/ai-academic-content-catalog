import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SUBJECTS, GRADE_LEVELS, EDUCATIONAL_STANDARDS, EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import { generateEducationalContent, generateAssessment, generateRubric, generateImage } from '../../services/geminiService';
import { saveContent } from '../../utils/contentStorage';
import FFCard from './shared/FFCard';
import FFButton from './shared/FFButton';
import ProgressBar from './shared/ProgressBar';
import ExportMenu from './exports/ExportMenu';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

interface EducationalContentStudioProps {
  toolSelection: { id: string; name: string; categoryId: string; } | null;
  remixContent: StorableContent | null;
  onRemixComplete: () => void;
}

const SimpleRichTextEditor: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    return (
        <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full bg-ff-bg-dark border border-slate-600 rounded-lg p-3 h-96 overflow-y-auto"
            style={{ color: 'var(--ff-text-primary)' }}
        />
    );
};


const EducationalContentStudio: React.FC<EducationalContentStudioProps> = ({ toolSelection, remixContent, onRemixComplete }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[11]);
  const [standard, setStandard] = useState(EDUCATIONAL_STANDARDS[0]);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<EducationalContent | Assessment | RubricContent | ImageContent | null>(null);
  const [progress, setProgress] = useState(0);
  
  const isImageTool = useMemo(() => toolSelection?.id === 'pp-09', [toolSelection]);

  const promptSuggestion = useMemo(() => {
    if (!toolSelection) {
      return "e.g., 'Focus on hands-on activities', 'Include a section on historical context'";
    }
    const tool = EDUCATIONAL_TOOL_CATEGORIES
      .flatMap(cat => cat.tools)
      .find(t => t.id === toolSelection.id);

    return (tool as any)?.promptSuggestion || "e.g., 'Focus on hands-on activities', 'Include a section on historical context'";
  }, [toolSelection]);

  useEffect(() => {
    if (remixContent) {
        // For images, the 'topic' is the prompt. For others, it's the title.
        if (remixContent.type === 'image') {
            setTopic(remixContent.prompt);
        } else {
            setTopic(remixContent.title);
        }
        
        // Pre-fill common fields if they exist
        if ('subject' in remixContent && typeof remixContent.subject === 'string') {
            setSubject(remixContent.subject);
        }
        if ('gradeLevel' in remixContent && typeof remixContent.gradeLevel === 'string') {
            setGradeLevel(remixContent.gradeLevel);
        }
        if ('standard' in remixContent && typeof remixContent.standard === 'string' && remixContent.standard) {
            setStandard(remixContent.standard);
        } else {
            // Reset to default if not present in the remixed content
            setStandard(EDUCATIONAL_STANDARDS[0]);
        }

        // Clear instructions for the new remix
        setCustomInstructions('');
        
        // Reset the view
        setGeneratedContent(null);
        setError(null);
        
        // Signal that the remix data has been consumed
        onRemixComplete();
    }
  }, [remixContent, onRemixComplete]);

  useEffect(() => {
    if (toolSelection) {
      setGeneratedContent(null);
      setError(null);
    }
  }, [toolSelection]);
  
  useEffect(() => {
      let timer: ReturnType<typeof setInterval> | undefined;
      if (isLoading) {
          setProgress(0);
          timer = setInterval(() => {
              setProgress(oldProgress => {
                  if (oldProgress >= 95) {
                      clearInterval(timer);
                      return 95;
                  }
                  const diff = Math.random() * 10;
                  return Math.min(oldProgress + diff, 95);
              });
          }, 800);
      } else {
          setProgress(100);
      }
      return () => {
          if (timer) clearInterval(timer);
      };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolSelection) {
      setError("Please select a tool first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    const params = {
      toolId: toolSelection.id,
      toolName: toolSelection.name,
      topic,
      gradeLevel,
      subject,
      standard,
      customInstructions,
    };
    
    try {
      let content;
      const categoryId = toolSelection.categoryId;
      if (categoryId === 'assessments' && toolSelection.id !== 'as-06' && toolSelection.id !== 'as-11') {
          content = await generateAssessment(params);
      } else if (toolSelection.id === 'as-06' || toolSelection.id === 'as-11') { // Rubric tools
          content = await generateRubric(params);
      } else if (isImageTool) {
          content = await generateImage(params);
      } else {
          content = await generateEducationalContent(params);
      }
      
      setGeneratedContent(content);
      saveContent(content);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during content generation.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContentChange = (newContent: string) => {
    if (generatedContent && 'content' in generatedContent) {
        const updatedContent = {...generatedContent, content: newContent};
        setGeneratedContent(updatedContent as EducationalContent);
        saveContent(updatedContent);
    }
  };
  
  const handleRemixFromStudio = () => {
    if (!generatedContent) return;

    // Use the generated content itself to pre-fill the form
    if (generatedContent.type === 'image') {
        setTopic(generatedContent.prompt);
    } else {
        setTopic(generatedContent.title);
    }

    if ('subject' in generatedContent && typeof generatedContent.subject === 'string') {
        setSubject(generatedContent.subject);
    }
    if ('gradeLevel' in generatedContent && typeof generatedContent.gradeLevel === 'string') {
        setGradeLevel(generatedContent.gradeLevel);
    }
    if ('standard' in generatedContent && typeof generatedContent.standard === 'string' && generatedContent.standard) {
        setStandard(generatedContent.standard);
    } else {
        setStandard(EDUCATIONAL_STANDARDS[0]);
    }

    // Clear instructions, allowing user to add new ones
    setCustomInstructions('');
    
    // Clear the output panel to prepare for a new generation
    setGeneratedContent(null);
    setError(null);
  };


  if (!toolSelection) {
    return (
      <div className="text-center py-20 ff-fade-in-up">
        <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }}>Welcome to the Studio</h2>
        <p style={{ color: 'var(--ff-text-muted)', marginTop: 'var(--ff-space-4)' }}>
          Please select a tool from the 'Tools' tab to begin creating content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ff-fade-in-up">
      {/* Form Panel */}
      <FFCard>
        <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
          {toolSelection.name}
        </h2>
        <p style={{ color: 'var(--ff-text-secondary)', marginBottom: 'var(--ff-space-6)' }}>
            Fill in the details below to generate your content.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-ff-text-secondary mb-1">
              {isImageTool ? 'Image Prompt / Description' : 'Topic / Title'}
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
              required
            />
          </div>

          {!isImageTool && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-ff-text-secondary mb-1">Subject</label>
                  <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                    {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="gradeLevel" className="block text-sm font-medium text-ff-text-secondary mb-1">Grade Level</label>
                  <select id="gradeLevel" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="standard" className="block text-sm font-medium text-ff-text-secondary mb-1">Educational Standard (Optional)</label>
                <select id="standard" value={standard} onChange={e => setStandard(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                  {EDUCATIONAL_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="customInstructions" className="block text-sm font-medium text-ff-text-secondary mb-1">Additional Instructions (Optional)</label>
                <textarea
                  id="customInstructions"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
                  placeholder={promptSuggestion}
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <FFButton type="submit" variant="primary" disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : '✨ Generate Content'}
            </FFButton>
          </div>
        </form>
      </FFCard>

      {/* Output Panel */}
      <FFCard>
        <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)', marginBottom: 'var(--ff-space-4)' }}>
          Generated Output
        </h2>
        {isLoading && (
          <div className="space-y-4">
            <p className="text-ff-text-secondary">AI is thinking... Please wait a moment.</p>
            <ProgressBar value={progress} />
          </div>
        )}
        {error && <div className="p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
        
        {generatedContent && (
            <div className="ff-fade-in-up">
                {generatedContent.type === 'image' ? (
                     <img src={`data:image/png;base64,${generatedContent.base64Image}`} alt={generatedContent.title} className="rounded-lg mb-4" />
                ) : 'content' in generatedContent ? (
                    <SimpleRichTextEditor value={generatedContent.content} onChange={handleContentChange} />
                ) : 'questions' in generatedContent ? (
                    <div className="prose prose-invert max-w-none text-ff-text-primary">
                        <h3>{generatedContent.title}</h3>
                        <ol>
                            {generatedContent.questions.map(q => <li key={q.id}>{q.prompt} ({q.points} pts)</li>)}
                        </ol>
                    </div>
                ): 'rows' in generatedContent ? (
                     <div className="prose prose-invert max-w-none text-ff-text-primary">
                        <h3>{generatedContent.title}</h3>
                        <p>{generatedContent.rows.length} criteria defined.</p>
                    </div>
                ) : null}
                <ExportMenu content={generatedContent} />
                <div className="mt-4">
                    <FFButton variant="accent" onClick={handleRemixFromStudio}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                        Remix This Content
                    </FFButton>
                </div>
            </div>
        )}
        
        {!isLoading && !error && !generatedContent && (
          <div className="text-center py-10">
            <p className="text-ff-text-muted">Your generated content will appear here.</p>
          </div>
        )}
      </FFCard>
    </div>
  );
};

export default EducationalContentStudio;