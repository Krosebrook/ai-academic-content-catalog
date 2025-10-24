import React, { useState, useEffect } from 'react';
import { GenerationParams, EducationalContent, Assessment, RubricContent } from '../../types/education';
import { generateContent } from '../../services/geminiService';
import { saveContent } from '../../utils/contentStorage';
import { SUBJECTS, GRADE_LEVELS } from '../../constants/education';
import FFCard from './shared/FFCard';
import FFButton from './shared/FFButton';
import ProgressBar from './shared/ProgressBar';
import ExportMenu from './exports/ExportMenu';
import RubricBuilderModal from './tools/RubricBuilderModal';
import { toMarkdown } from '../../utils/exports';
import { parseEducationalContent, parseAssessment } from '../../utils/validation';

interface StudioProps {
    toolSelection?: {
        id: string;
        name: string;
        categoryId: string;
    } | null;
}

const EducationalContentStudio: React.FC<StudioProps> = ({ toolSelection }) => {
    const [params, setParams] = useState<GenerationParams>({
        audience: 'educator',
        type: 'lesson',
        subject: 'Science',
        grade: '9th Grade',
        topic: 'Photosynthesis',
        standard: '',
        objectives: [],
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [generatedContent, setGeneratedContent] = useState<EducationalContent | Assessment | RubricContent | null>(null);
    const [isRubricBuilderOpen, setIsRubricBuilderOpen] = useState(false);

    useEffect(() => {
        if (toolSelection) {
            let newType: GenerationParams['type'] = 'lesson';
            if (toolSelection.id === 'as-11') { // Custom Rubric Builder
                newType = 'rubric';
            } else if (toolSelection.categoryId === 'assessments') {
                newType = 'assessment-questions';
            } else if (toolSelection.categoryId === 'printables') {
                newType = 'printable';
            }

            setParams(prev => ({
                ...prev,
                type: newType,
                topic: toolSelection.name
            }));
        }
    }, [toolSelection]);

    // This effect pre-fills objectives when the topic, subject or type changes to 'lesson'.
    useEffect(() => {
        if (params.type === 'lesson') {
            setParams(prev => ({
                ...prev,
                objectives: [
                    `Students will be able to define key terms related to ${prev.topic}.`,
                    `Students will be able to explain the significance of ${prev.topic} in ${prev.subject}.`,
                    `Students will be able to analyze a case study involving ${prev.topic}.`
                ]
            }));
        } else {
             // If the type is not lesson, ensure objectives are cleared.
             if(params.objectives && params.objectives.length > 0) {
                 setParams(prev => ({...prev, objectives: []}))
             }
        }
    }, [params.type, params.topic, params.subject]);


    const handleParamChange = (field: keyof GenerationParams, value: string | string[]) => {
        setParams(prev => ({ ...prev, [field]: value }));
    };

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...(params.objectives || [])];
        newObjectives[index] = value;
        setParams(prev => ({ ...prev, objectives: newObjectives }));
    };

    const handleAddObjective = () => {
        const newObjectives = [...(params.objectives || []), ''];
        setParams(prev => ({ ...prev, objectives: newObjectives }));
    };

    const handleRemoveObjective = (index: number) => {
        const newObjectives = [...(params.objectives || [])];
        newObjectives.splice(index, 1);
        setParams(prev => ({ ...prev, objectives: newObjectives }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedContent(null);
        setProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setProgress(p => (p < 90 ? p + 5 : p));
        }, 200);

        const result = await generateContent(params);
        clearInterval(progressInterval);
        setProgress(100);

        if ('error' in result) {
            setError(result.error);
        } else {
            // Validate the result
            const isAssessmentType = params.type === 'assessment' || params.type === 'assessment-questions';
            const validation = isAssessmentType ? parseAssessment(result) : parseEducationalContent(result);
            if(validation.success) {
                const finalContent = validation.data;
                setGeneratedContent(finalContent as EducationalContent | Assessment);
                saveContent(finalContent as EducationalContent | Assessment);
            } else {
                console.error("Validation failed:", validation.error);
                setError("Received invalid data structure from the API.");
            }
        }
        setIsGenerating(false);
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (params.type === 'rubric') {
            setIsRubricBuilderOpen(true);
        } else {
            handleGenerate();
        }
    };

    const renderContent = () => {
        if (!generatedContent) return null;
        const markdown = toMarkdown(generatedContent);
        // This is a simplified markdown renderer. A real app would use a library like react-markdown.
        return (
            <div className="prose prose-invert max-w-none bg-ff-bg-dark p-4 rounded-md border border-slate-700"
                 dangerouslySetInnerHTML={{ __html: markdown.replace(/\n/g, '<br />') }} />
        );
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM PANEL */}
                <FFCard className="lg:col-span-1 h-fit">
                    <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)'}} className="mb-4">Content Generator</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Content Type</label>
                            <select value={params.type} onChange={e => handleParamChange('type', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
                                <option value="lesson">Lesson Plan</option>
                                <option value="assessment-questions">Assessment Questions</option>
                                <option value="activity">Activity</option>
                                <option value="resource">Resource</option>
                                <option value="printable">Printable</option>
                                <option value="rubric">Custom Rubric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                            <select value={params.subject} onChange={e => handleParamChange('subject', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
                                {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Grade Level</label>
                            <select value={params.grade} onChange={e => handleParamChange('grade', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
                                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
                            <input type="text" value={params.topic} onChange={e => handleParamChange('topic', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                        </div>
                        
                        {params.type === 'lesson' && (
                            <div className="ff-fade-in-up space-y-2 pt-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Learning Objectives</label>
                                {(params.objectives || []).map((obj, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={obj} 
                                            onChange={e => handleObjectiveChange(index, e.target.value)} 
                                            className="w-full bg-ff-bg-dark p-2 rounded-md border border-slate-700" 
                                            placeholder={`Objective ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => handleRemoveObjective(index)} className="text-red-400 hover:text-red-300 p-1 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddObjective} className="text-sm text-ff-secondary hover:text-ff-primary">+ Add Objective</button>
                            </div>
                        )}

                        <div className="pt-2">
                            <FFButton 
                                type="submit"
                                disabled={isGenerating} 
                                className="w-full"
                            >
                                {params.type === 'rubric' 
                                    ? 'Open Rubric Builder' 
                                    : (isGenerating ? 'Generating...' : 'Generate Content')}
                            </FFButton>
                        </div>
                    </form>
                </FFCard>

                {/* RESULT PANEL */}
                <div className="lg:col-span-2">
                    {isGenerating && (
                        <FFCard>
                            <div className="text-center p-8">
                                <h3 className="text-lg font-semibold mb-4">Generating your content...</h3>
                                <ProgressBar value={progress} />
                            </div>
                        </FFCard>
                    )}
                    {error && <FFCard><p className="text-red-400">{error}</p></FFCard>}
                    {generatedContent && (
                        <FFCard className="ff-fade-in-up">
                            {renderContent()}
                            <ExportMenu content={generatedContent} />
                        </FFCard>
                    )}
                    {!isGenerating && !generatedContent && (
                         <FFCard>
                            <div className="text-center py-20">
                                <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>Welcome to the Studio</h2>
                                <p style={{ color: 'var(--ff-text-muted)', marginTop: 'var(--ff-space-4)' }}>
                                    Fill out the form to generate new educational content.
                                </p>
                            </div>
                        </FFCard>
                    )}
                </div>
            </div>
            {isRubricBuilderOpen && <RubricBuilderModal 
                onClose={() => setIsRubricBuilderOpen(false)} 
                initialTopic={params.topic} 
                initialTitle={`Rubric for ${params.topic}`} 
            />}
        </>
    );
};

export default EducationalContentStudio;