import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SUBJECTS, GRADE_LEVELS, EDUCATIONAL_STANDARDS, EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import { generateEducationalContent, generateAssessment, generateRubric, generateImage, generateContentPackage } from '../../services/geminiService';
import { useData } from '../../data/DataProvider';
import { useAuth } from '../../auth/AuthContext';
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
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => onChange(e.currentTarget.innerHTML);
    return <div ref={editorRef} contentEditable onInput={handleInput} className="w-full bg-ff-bg-dark border border-slate-600 rounded-lg p-3 h-96 overflow-y-auto" style={{ color: 'var(--ff-text-primary)' }} />;
};


const EducationalContentStudio: React.FC<EducationalContentStudioProps> = ({ toolSelection, remixContent, onRemixComplete }) => {
  const { addContent, addCollection } = useData();
  const { session } = useAuth();

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[11]);
  const [standard, setStandard] = useState(EDUCATIONAL_STANDARDS[0]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [useGrounding, setUseGrounding] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<StorableContent | StorableContent[] | null>(null);
  const [progress, setProgress] = useState(0);

  const [associatedRubric, setAssociatedRubric] = useState<RubricContent | null>(null);
  const [isSelectRubricModalOpen, setIsSelectRubricModalOpen] = useState(false);
  const [isBuildRubricModalOpen, setIsBuildRubricModalOpen] = useState(false);
  const [isStudentView, setIsStudentView] = useState(false);

  // For Package tool
  const [packageContents, setPackageContents] = useState<string[]>(['lesson', 'assessment', 'study-guide']);
  
  const isImageTool = useMemo(() => toolSelection?.id === 'pp-09', [toolSelection]);
  const isPackageTool = useMemo(() => toolSelection?.categoryId === 'packages', [toolSelection]);
  const isAssessmentToolForRubric = useMemo(() => toolSelection?.categoryId === 'assessments' && !['as-06', 'as-11'].includes(toolSelection.id), [toolSelection]);
  
  const promptSuggestion = useMemo(() => {
    if (!toolSelection) return "e.g., 'Focus on hands-on activities'";
    const tool = EDUCATIONAL_TOOL_CATEGORIES.flatMap(cat => cat.tools).find(t => t.id === toolSelection.id);
    return (tool as any)?.promptSuggestion || "Provide specific details for best results.";
  }, [toolSelection]);

  useEffect(() => {
    if (remixContent) {
        setTopic(remixContent.type === 'image' ? remixContent.prompt : remixContent.title);
        if ('subject' in remixContent) setSubject(remixContent.subject);
        if ('gradeLevel' in remixContent) setGradeLevel(remixContent.gradeLevel);
        setStandard('standard' in remixContent && remixContent.standard ? remixContent.standard : EDUCATIONAL_STANDARDS[0]);
        setAssociatedRubric(remixContent.type === 'assessment' && remixContent.rubric ? remixContent.rubric : null);
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
          timer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 10, 95)), 800);
      } else {
          setProgress(100);
      }
      return () => { if (timer) clearInterval(timer); };
  }, [isLoading]);

  // FIX: Refactored the handleSubmit function to correctly handle content types.
  // The generate... functions return partial content objects, which were incorrectly assigned
  // to a variable typed for full content objects. This fix introduces an intermediate variable
  // for the partial content, uses `addContent` to persist it and get the full object, and
  // then updates the state, resolving the type errors.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolSelection || !session) {
      setError("Please select a tool and ensure you are logged in.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Generating...');
    setError(null);
    setGeneratedContent(null);

    const params = {
      toolId: toolSelection.id,
      toolName: toolSelection.name,
      topic, gradeLevel, subject, standard, customInstructions, useGrounding,
      packageContents
    };
    
    try {
      let contentResult: StorableContent | StorableContent[];
      
      if (isPackageTool) {
        const newCollection = await addCollection(`Unit: ${topic}`);
        contentResult = await generateContentPackage(params, session.user.id, setLoadingMessage);
        for (const item of contentResult) {
          await addContent({ ...item, collectionId: newCollection.id });
        }
      } else {
        let contentToSave;
        if (isAssessmentToolForRubric) {
          const assessment = await generateAssessment(params, session.user.id);
          if (associatedRubric) (assessment as Assessment).rubric = associatedRubric;
          contentToSave = assessment;
        } else if (toolSelection.id === 'as-06' || toolSelection.id === 'as-11') {
          contentToSave = await generateRubric(params, session.user.id);
        } else if (isImageTool) {
          contentToSave = await generateImage(params, session.user.id);
        } else {
          contentToSave = await generateEducationalContent(params, session.user.id);
        }
        contentResult = await addContent(contentToSave);
      }
      
      setGeneratedContent(contentResult);
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

  const handleSaveNewRubric = async (rubric: RubricContent) => {
    const newRubric = await addContent(rubric);
    setAssociatedRubric(newRubric as RubricContent);
    setIsBuildRubricModalOpen(false);
  };
  
  const handleContentChange = (newContent: string) => { /* Disabled for now with backend */ };
  
  const handlePackageContentToggle = (item: string) => {
    setPackageContents(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
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

  const displayedContent = Array.isArray(generatedContent) ? generatedContent[0] : generatedContent;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ff-fade-in-up">
      <FFCard>
        <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>{toolSelection.name}</h2>
        <p style={{ color: 'var(--ff-text-secondary)', marginBottom: 'var(--ff-space-6)' }}>Fill in the details below to generate your content.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-ff-text-secondary mb-1">{isImageTool ? 'Image Prompt / Description' : isPackageTool ? 'Unit Topic' : 'Topic / Title'}</label>
            <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" required />
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
                <label htmlFor="customInstructions" className="block text-sm font-medium text-ff-text-secondary mb-1">Additional Instructions (Optional)</label>
                <textarea id="customInstructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={3} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" placeholder={promptSuggestion}/>
              </div>
              
              {isPackageTool && (
                <div className="p-3 bg-ff-surface rounded-lg border border-slate-700">
                    <label className="block text-sm font-medium text-ff-text-secondary mb-2">Package Contents</label>
                    <div className="flex gap-4">
                      {['lesson', 'assessment', 'study-guide'].map(item => (
                        <label key={item} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={packageContents.includes(item)} onChange={() => handlePackageContentToggle(item)} className="h-4 w-4 rounded border-gray-300 text-ff-primary focus:ring-ff-primary"/>{item.replace('-', ' ')}</label>
                      ))}
                    </div>
                </div>
              )}
              {isAssessmentToolForRubric && (
                 <div className="p-3 bg-ff-surface rounded-lg border border-slate-700">
                    <label className="block text-sm font-medium text-ff-text-secondary mb-2">Rubric (Optional)</label>
                    {associatedRubric ? (
                        <div className="flex justify-between items-center"><p className="font-semibold">{associatedRubric.title}</p><div className="flex gap-2"><button type="button" onClick={() => setIsSelectRubricModalOpen(true)} className="text-xs text-ff-secondary hover:underline">Change</button><button type="button" onClick={() => setAssociatedRubric(null)} className="text-xs text-red-400 hover:underline">Remove</button></div></div>
                    ) : (
                        <div className="flex gap-2"><FFButton type="button" onClick={() => setIsBuildRubricModalOpen(true)} variant="secondary" style={{backgroundColor: 'var(--ff-bg-dark)', fontSize: 'var(--ff-text-xs)'}}>Create New Rubric</FFButton><FFButton type="button" onClick={() => setIsSelectRubricModalOpen(true)} variant="secondary" style={{backgroundColor: 'var(--ff-bg-dark)', fontSize: 'var(--ff-text-xs)'}}>Select Existing</FFButton></div>
                    )}
                </div>
              )}
            </>
          )}

           <div className="flex items-center justify-between bg-ff-surface p-3 rounded-lg border border-slate-700">
              <label htmlFor="grounding" className="text-sm font-medium text-ff-text-secondary">Fact-Check with Google Search</label>
              <input id="grounding" type="checkbox" checked={useGrounding} onChange={(e) => setUseGrounding(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-ff-primary focus:ring-ff-primary" />
            </div>

          <div className="pt-4">
            <FFButton type="submit" variant="primary" disabled={isLoading} className="w-full">{isLoading ? 'Generating...' : '✨ Generate Content'}</FFButton>
          </div>
        </form>
      </FFCard>

      <FFCard>
        <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>Generated Output</h2>
            {displayedContent && (displayedContent.type === 'assessment' || displayedContent.type === 'assessment-questions') && (
                <div className="flex items-center gap-2"><label htmlFor="student-view" className="text-sm font-medium text-ff-text-secondary">Student View</label><input id="student-view" type="checkbox" checked={isStudentView} onChange={(e) => setIsStudentView(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-ff-primary focus:ring-ff-primary" /></div>
            )}
        </div>
        {isLoading && (<div className="space-y-4"><p className="text-ff-text-secondary">{loadingMessage}</p><ProgressBar value={progress} /></div>)}
        {error && <div className="p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
        
        {generatedContent && (
            <div className="ff-fade-in-up">
                {Array.isArray(generatedContent) ? (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Generated Package:</h3>
                    {generatedContent.map(item => (
                      <div key={item.id} className="p-3 bg-ff-surface rounded-lg">{item.title} ({item.type})</div>
                    ))}
                  </div>
                ) : generatedContent.type === 'image' ? (
                     <img src={`data:image/png;base64,${generatedContent.base64Image}`} alt={generatedContent.title} className="rounded-lg mb-4" />
                ) : (generatedContent.type === 'assessment' || generatedContent.type === 'assessment-questions') ? (
                    <AssessmentViewer assessment={generatedContent as Assessment} studentView={isStudentView} />
                ) : 'content' in generatedContent ? (
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: generatedContent.content }} />
                ) : 'rows' in generatedContent ? (
                     <div className="prose prose-invert max-w-none text-ff-text-primary"><h3>{generatedContent.title}</h3><p>{generatedContent.rows.length} criteria defined.</p></div>
                ) : null}

                {'sources' in (displayedContent || {}) && (displayedContent as any).sources && <SourcesList sources={(displayedContent as any).sources} />}
                {displayedContent && <ExportMenu content={displayedContent} />}
            </div>
        )}
        {!isLoading && !error && !generatedContent && (<div className="text-center py-10"><p className="text-ff-text-muted">Your generated content will appear here.</p></div>)}
      </FFCard>
    </div>
    
    {isSelectRubricModalOpen && (<SelectRubricModal onClose={() => setIsSelectRubricModalOpen(false)} onSelect={handleSelectRubric}/>)}
    {isBuildRubricModalOpen && (<RubricBuilderModal onClose={() => setIsBuildRubricModalOpen(false)} onSave={handleSaveNewRubric}/>)}
    </>
  );
};

export default EducationalContentStudio;