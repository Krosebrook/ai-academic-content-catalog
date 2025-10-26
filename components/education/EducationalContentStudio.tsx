
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SUBJECTS, GRADE_LEVELS, EDUCATIONAL_STANDARDS, EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';
import { EducationalContent, Assessment, RubricContent, ImageContent, Source } from '../../types/education';
import { generateEducationalContent, generateAssessment, generateRubric, generateImage } from '../../services/geminiService';
import { saveContent } from '../../utils/contentStorage';
import FFCard from './shared/FFCard';
import FFButton from './shared/FFButton';
import ProgressBar from './shared/ProgressBar';
import ExportMenu from './exports/ExportMenu';
import SelectRubricModal from './tools/SelectRubricModal';
import RubricBuilderModal from './tools/RubricBuilderModal';
import AssessmentViewer from './shared/AssessmentViewer';
import SourcesList from './shared/SourcesList';

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
  const [useGrounding, setUseGrounding] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<StorableContent | null>(null);
  const [progress, setProgress] = useState(0);

  // State for rubric management
  const [associatedRubric, setAssociatedRubric] = useState<RubricContent | null>(null);
  const [isSelectRubricModalOpen, setIsSelectRubricModalOpen] = useState(false);
  const [isBuildRubricModalOpen, setIsBuildRubricModalOpen] = useState(false);

  // State for student view
  const [isStudentView, setIsStudentView] = useState(false);
  
  const isImageTool = useMemo(() => toolSelection?.id === 'pp-09', [toolSelection]);
  const isAssessmentToolForRubric = useMemo(() => {
    if (!toolSelection) return false;
    const isAssessmentCategory = toolSelection.categoryId === 'assessments';
    const isNotRubricGenerator = toolSelection.id !== 'as-06' && toolSelection.id !== 'as-11';
    return isAssessmentCategory && isNotRubricGenerator;
  }, [toolSelection]);


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
        if (remixContent.type === 'image') {
            setTopic(remixContent.prompt);
        } else {
            setTopic(remixContent.title);
        }
        
        if ('subject' in remixContent && typeof remixContent.subject === 'string') {
            setSubject(remixContent.subject);
        }
        if ('gradeLevel' in remixContent && typeof remixContent.gradeLevel === 'string') {
            setGradeLevel(remixContent.gradeLevel);
        }
        if ('standard' in remixContent && typeof remixContent.standard === 'string' && remixContent.standard) {
            setStandard(remixContent.standard);
        } else {
            setStandard(EDUCATIONAL_STANDARDS[0]);
        }
        if (remixContent.type === 'assessment' && remixContent.rubric) {
            setAssociatedRubric(remixContent.rubric);
        } else {
            setAssociatedRubric(null);
        }

        setCustomInstructions('');
        setGeneratedContent(null);
        setError(null);
        onRemixComplete();
    }
  }, [remixContent, onRemixComplete]);

  useEffect(() => {
    if (toolSelection) {
      setGeneratedContent(null);
      setError(null);
      setAssociatedRubric(null);
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
      useGrounding,
    };
    
    try {
      let content;
      
      if (isAssessmentToolForRubric) {
          const assessment = await generateAssessment(params);
          if (associatedRubric) {
              assessment.rubric = associatedRubric;
          }
          content = assessment;
      } else if (toolSelection.id === 'as-06' || toolSelection.id === 'as-11') {
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

  const handleSelectRubric = (rubric: RubricContent) => {
    setAssociatedRubric(rubric);
    setIsSelectRubricModalOpen(false);
  };

  const handleSaveNewRubric = (rubric: RubricContent) => {
    saveContent(rubric); // Save the new rubric to storage
    setAssociatedRubric(rubric); // Associate it with the current assessment
    setIsBuildRubricModalOpen(false);
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
    if (generatedContent.type === 'assessment' && generatedContent.rubric) {
        setAssociatedRubric(generatedContent.rubric);
    } else {
        setAssociatedRubric(null);
    }

    setCustomInstructions('');
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
    <>
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
              
              {isAssessmentToolForRubric && (
                <div className="p-3 bg-ff-surface rounded-lg border border-slate-700">
                    <label className="block text-sm font-medium text-ff-text-secondary mb-2">Rubric (Optional)</label>
                    {associatedRubric ? (
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{associatedRubric.title}</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsSelectRubricModalOpen(true)} className="text-xs text-ff-secondary hover:underline">Change</button>
                                <button type="button" onClick={() => setAssociatedRubric(null)} className="text-xs text-red-400 hover:underline">Remove</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <FFButton type="button" onClick={() => setIsBuildRubricModalOpen(true)} variant="secondary" style={{backgroundColor: 'var(--ff-bg-dark)', fontSize: 'var(--ff-text-xs)'}}>Create New Rubric</FFButton>
                            <FFButton type="button" onClick={() => setIsSelectRubricModalOpen(true)} variant="secondary" style={{backgroundColor: 'var(--ff-bg-dark)', fontSize: 'var(--ff-text-xs)'}}>Select Existing</FFButton>
                        </div>
                    )}
                </div>
              )}

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

           <div className="flex items-center justify-between bg-ff-surface p-3 rounded-lg border border-slate-700">
              <label htmlFor="grounding" className="text-sm font-medium text-ff-text-secondary">
                Fact-Check with Google Search
              </label>
              <input
                id="grounding"
                type="checkbox"
                checked={useGrounding}
                onChange={(e) => setUseGrounding(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-ff-primary focus:ring-ff-primary"
              />
            </div>

          <div className="pt-4">
            <FFButton type="submit" variant="primary" disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : '✨ Generate Content'}
            </FFButton>
          </div>
        </form>
      </FFCard>

      {/* Output Panel */}
      <FFCard>
        <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
              Generated Output
            </h2>
            {(generatedContent?.type === 'assessment' || generatedContent?.type === 'assessment-questions') && (
                <div className="flex items-center gap-2">
                    <label htmlFor="student-view" className="text-sm font-medium text-ff-text-secondary">Student View</label>
                    <input
                        id="student-view"
                        type="checkbox"
                        checked={isStudentView}
                        onChange={(e) => setIsStudentView(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-ff-primary focus:ring-ff-primary"
                    />
                </div>
            )}
        </div>
        
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
                ) : (generatedContent.type === 'assessment' || generatedContent.type === 'assessment-questions') ? (
                    <AssessmentViewer assessment={generatedContent as Assessment} studentView={isStudentView} />
                ) : 'content' in generatedContent ? (
                    <SimpleRichTextEditor value={generatedContent.content} onChange={handleContentChange} />
                ) : 'rows' in generatedContent ? (
                     <div className="prose prose-invert max-w-none text-ff-text-primary">
                        <h3>{generatedContent.title}</h3>
                        <p>{generatedContent.rows.length} criteria defined.</p>
                    </div>
                ) : null}

                {'sources' in generatedContent && generatedContent.sources && <SourcesList sources={generatedContent.sources} />}

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
    
    {isSelectRubricModalOpen && (
        <SelectRubricModal 
            onClose={() => setIsSelectRubricModalOpen(false)}
            onSelect={handleSelectRubric}
        />
    )}
    {isBuildRubricModalOpen && (
        <RubricBuilderModal
            onClose={() => setIsBuildRubricModalOpen(false)}
            onSave={handleSaveNewRubric}
        />
    )}
    </>
  );
};

export default EducationalContentStudio;
