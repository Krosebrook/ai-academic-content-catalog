
import React, { useState, useCallback } from 'react';
import { Audience, ContentKind, EducationalContent, Assessment, GenerationParams } from '../../types/education';
import { SUBJECTS, GRADE_LEVELS, EDUCATIONAL_STANDARDS } from '../../constants/education';
import { generateContent, generateContentSimulation } from '../../services/geminiService';
import FFButton from './shared/FFButton';
import FFCard from './shared/FFCard';
import ProgressBar from './shared/ProgressBar';
import ExportMenu from './exports/ExportMenu';

const EducationalContentStudio: React.FC = () => {
  const [audience, setAudience] = useState<Audience>('educator');
  const [contentKind, setContentKind] = useState<ContentKind>('lesson');
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [grade, setGrade] = useState(GRADE_LEVELS[9]);
  const [standard, setStandard] = useState(EDUCATIONAL_STANDARDS[0]);
  const [topic, setTopic] = useState('Introduction to Algebra');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [streamingPreview, setStreamingPreview] = useState('');
  const [generatedContent, setGeneratedContent] = useState<EducationalContent | Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setGenerationProgress(0);
    setStreamingPreview('');
    setError(null);

    const params: GenerationParams = {
      audience,
      type: contentKind,
      subject: SUBJECTS.find(s => s.id === subject)?.name || subject,
      grade,
      topic,
      standard,
    };

    // Using client-side simulation as requested
    const result = await generateContentSimulation(params, (progress, chunk) => {
        setGenerationProgress(progress);
        setStreamingPreview(prev => prev + chunk);
    });

    setGeneratedContent(result);
    setIsGenerating(false);

  }, [audience, contentKind, subject, grade, topic, standard]);

  const renderForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
          {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Grade Level</label>
        <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
          {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
       <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-400 mb-1">Topic / Title</label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Content Type</label>
        <select value={contentKind} onChange={e => setContentKind(e.target.value as ContentKind)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
          <option value="lesson">Lesson Plan</option>
          <option value="assessment">Assessment</option>
          <option value="activity">Interactive Activity</option>
          <option value="resource">Resource/Study Guide</option>
          <option value="printable">Printable Pack</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Curriculum Standard</label>
        <select value={standard} onChange={e => setStandard(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
          {EDUCATIONAL_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <FFCard>
          <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-4">
            Content Studio
          </h2>
          <div className="mb-4">
             <div className="flex border-b border-slate-700">
              {(['educator', 'student', 'both', 'seller'] as Audience[]).map(aud => (
                <button 
                    key={aud} 
                    onClick={() => setAudience(aud)}
                    className={`capitalize px-4 py-2 -mb-px border-b-2 ${audience === aud ? 'border-ff-primary text-ff-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
                    style={{fontFamily: 'var(--ff-font-primary)', fontWeight: 'var(--ff-weight-semibold)', fontSize: 'var(--ff-text-sm)'}}
                >
                    {aud}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {renderForm()}
            <FFButton onClick={handleGenerate} disabled={isGenerating} className="w-full justify-center ff-pulse-glow mt-4">
              {isGenerating ? 'Generating...' : 'Generate'}
            </FFButton>
          </div>
        </FFCard>
      </div>

      <div className="lg:w-2/3">
        <FFCard className="min-h-[600px]">
          <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-4">
            Generated Output
          </h2>
          {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
          {isGenerating && (
            <div className="space-y-3 ff-fade-in-up">
                <div className="flex items-center gap-3">
                    <ProgressBar value={generationProgress} />
                    <span style={{ color:'var(--ff-primary)', fontFamily: 'var(--ff-font-mono)' }}>{generationProgress}%</span>
                </div>
                <div className="p-4 bg-ff-bg-dark rounded-md mt-4 max-h-96 overflow-y-auto">
                    <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--ff-font-mono)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-secondary)'}}>
                        {streamingPreview}
                    </pre>
                </div>
            </div>
          )}
          {generatedContent && (
             <div className="ff-fade-in-up">
                <div className="prose prose-invert max-w-none p-4 bg-ff-bg-dark rounded-md border border-slate-700">
                    <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-bold)' }}>{generatedContent.title}</h3>
                    {generatedContent.type !== 'assessment' ? 
                        <p style={{fontFamily: 'var(--ff-font-secondary)', color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)'}}>
                           {generatedContent.content.substring(0, 500)}...
                        </p> 
                        :
                        <ul>
                           {generatedContent.questions.map(q => <li key={q.id}>{q.prompt}</li>)} 
                        </ul>
                    }
                </div>
                <ExportMenu content={generatedContent} />
             </div>
          )}
          {!isGenerating && !generatedContent && (
            <div className="text-center py-20">
              <p style={{color: 'var(--ff-text-muted)'}}>Your generated content will appear here.</p>
            </div>
          )}
        </FFCard>
      </div>
    </div>
  );
};

export default EducationalContentStudio;
