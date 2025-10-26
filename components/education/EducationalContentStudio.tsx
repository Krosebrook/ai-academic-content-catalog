import React, { useState, useEffect } from 'react';
import { GenerationParams, EducationalContent, Assessment, RubricContent, Rubric, ImageContent } from '../../types/education';
import { generateContent, generateImage } from '../../services/geminiService';
import { saveContent } from '../../utils/contentStorage';
import { SUBJECTS, GRADE_LEVELS, DIFFICULTY_LEVELS, EDUCATIONAL_STANDARDS, BLOOMS_TAXONOMY_LEVELS, DIFFERENTIATION_PROFILES } from '../../constants/education';
import FFCard from './shared/FFCard';
import FFButton from './shared/FFButton';
import ExportMenu from './exports/ExportMenu';
import RubricBuilderModal from './tools/RubricBuilderModal';
import SelectRubricModal from './tools/SelectRubricModal';
import { toMarkdown } from '../../utils/exports';
import { parseEducationalContent, parseAssessment, parseImageContent } from '../../utils/validation';

interface StudioProps {
    toolSelection?: {
        id: string;
        name: string;
        categoryId: string;
    } | null;
}

const EducationalContentStudio: React.FC<StudioProps> = ({ toolSelection }) => {
    const [params, setParams] = useState<Omit<GenerationParams, 'includeRubric' | 'associatedRubric'>>({
        audience: 'educator',
        type: 'lesson',
        subject: 'Science',
        grade: '9th Grade',
        topic: 'Photosynthesis',
        standard: '',
        objectives: [],
        difficulty: 'Intermediate',
        bloomsLevel: 'Apply',
        differentiationProfiles: [],
    });
    const [imagePrompt, setImagePrompt] = useState('A photorealistic image of a vibrant coral reef teeming with life.');
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [error, setError] = useState('');
    const [generatedContent, setGeneratedContent] = useState<EducationalContent | Assessment | RubricContent | ImageContent | null>(null);
    
    // State for rubric modals
    const [isRubricBuilderOpen, setIsRubricBuilderOpen] = useState(false);
    const [rubricBuilderMode, setRubricBuilderMode] = useState<'primary' | 'association'>('primary');
    const [isSelectRubricModalOpen, setIsSelectRubricModalOpen] = useState(false);

    // State for associating rubrics with assessments
    const [includeRubric, setIncludeRubric] = useState(false);
    const [associatedRubric, setAssociatedRubric] = useState<RubricContent | null>(null);
    
    const isImageTool = toolSelection?.id === 'pp-09';

    useEffect(() => {
        if (toolSelection) {
            let newType: GenerationParams['type'] = 'lesson';
            if (toolSelection.id === 'as-11') { // Custom Rubric Builder
                newType = 'rubric';
            } else if (toolSelection.id === 'pp-09') { // Image Generator
                newType = 'image';
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

    useEffect(() => {
        // Clear differentiation profiles if content type is not 'lesson'
        if (params.type !== 'lesson') {
            setParams(prev => ({ ...prev, differentiationProfiles: [] }));
        }

        if (params.type === 'lesson' && params.topic && params.subject) {
             setParams(prev => ({
                ...prev,
                objectives: [
                    `Students will be able to define key terms related to ${prev.topic}.`,
                    `Students will be able to explain the significance of ${prev.topic} in ${prev.subject}.`,
                    `Students will be able to analyze a case study involving ${prev.topic}.`
                ]
            }));
        }
    }, [params.type, params.topic, params.subject]);


    const handleParamChange = (field: keyof Omit<GenerationParams, 'includeRubric' | 'associatedRubric'>, value: string | string[]) => {
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
    
    const handleDifferentiationChange = (profileName: string) => {
        setParams(prev => {
            const currentProfiles = prev.differentiationProfiles || [];
            const newProfiles = currentProfiles.includes(profileName)
                ? currentProfiles.filter(p => p !== profileName)
                : [...currentProfiles, profileName];
            return { ...prev, differentiationProfiles: newProfiles };
        });
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedContent(null);
        setStreamedText('');

        const onChunk = (chunk: string) => {
            setStreamedText(prev => prev + chunk);
        };
        
        if (isImageTool) {
            const result = await generateImage(imagePrompt, onChunk);
            if ('error' in result) {
                setError(result.error);
            } else {
                 const validation = parseImageContent(result);
                 if (validation.success) {
                    setGeneratedContent(validation.data);
                    saveContent(validation.data);
                 } else {
                    console.error("Validation failed:", validation.error);
                    setError("Received invalid data structure from the API.");
                 }
            }
        } else {
            const isAssessmentType = params.type === 'assessment' || params.type === 'assessment-questions';
            
            let rubricDataForApi: Rubric | undefined = undefined;
            if (isAssessmentType && includeRubric && associatedRubric) {
                const { id, type, generatedAt, ...rest } = associatedRubric;
                rubricDataForApi = rest;
            }

            const apiParams: GenerationParams = {
                ...params,
                includeRubric: isAssessmentType ? includeRubric : undefined,
                associatedRubric: rubricDataForApi,
            };

            const result = await generateContent(apiParams, onChunk);

            if ('error' in result) {
                setError(result.error);
            } else {
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
        }

        setIsGenerating(false);
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (params.type === 'rubric') {
            setRubricBuilderMode('primary');
            setIsRubricBuilderOpen(true);
        } else {
            handleGenerate();
        }
    };
    
    const openRubricBuilderForAssociation = () => {
        setRubricBuilderMode('association');
        setIsRubricBuilderOpen(true);
    };

    const onRubricGeneratedPrimary = (rubric: RubricContent) => {
        setGeneratedContent(rubric);
        // The modal already saves the content, so we just close it.
        setIsRubricBuilderOpen(false);
    };

    const onRubricGeneratedAssociation = (rubric: RubricContent) => {
        setAssociatedRubric(rubric);
        // The modal already saves it via its own logic
        setIsRubricBuilderOpen(false);
    };
    
    const onRubricSelected = (rubric: RubricContent) => {
        setAssociatedRubric(rubric);
        setIsSelectRubricModalOpen(false);
    };

    const renderContent = () => {
        if (!generatedContent) return null;
        
        if (generatedContent.type === 'image') {
            const image = generatedContent as ImageContent;
            return (
                <div className="bg-ff-bg-dark p-4 rounded-md border border-slate-700">
                    <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-bold mb-4">{image.title}</h2>
                    <img 
                        src={`data:image/png;base64,${image.base64Image}`} 
                        alt={image.prompt}
                        className="rounded-lg w-full object-contain"
                    />
                </div>
            );
        }

        const markdown = toMarkdown(generatedContent);
    
        let html = '';
        let inTable = false;
        let inList = false;
        const lines = markdown.split('\n');
    
        for (const line of lines) {
            if (line.startsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    html += '<table>';
                    const headers = line.split('|').slice(1, -1).map(h => `<th>${h.trim()}</th>`).join('');
                    html += `<thead><tr>${headers}</tr></thead><tbody>`;
                } else if (line.includes('---')) {
                    // skip separator line
                } else {
                    const cells = line.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
                    html += `<tr>${cells}</tr>`;
                }
            } else {
                if (inTable) {
                    inTable = false;
                    html += '</tbody></table>';
                }
    
                if (line.startsWith('- ')) {
                    if (!inList) {
                        inList = true;
                        html += '<ul>';
                    }
                    html += `<li>${line.substring(2)}</li>`;
                } else {
                    if (inList) {
                        inList = false;
                        html += '</ul>';
                    }
                    if (line.startsWith('# ')) html += `<h1>${line.substring(2)}</h1>`;
                    else if (line.startsWith('## ')) html += `<h2>${line.substring(3)}</h2>`;
                    else if (line.startsWith('### ')) html += `<h3>${line.substring(4)}</h3>`;
                    else if (line.match(/^---\s*$/)) html += `<hr />`;
                    else if (line.trim() !== '') html += `<p>${line}</p>`;
                }
            }
        }
        if (inTable) html += '</tbody></table>';
        if (inList) html += '</ul>';
    
        // Inline formatting
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    
        return (
            <div className="prose prose-invert max-w-none bg-ff-bg-dark p-4 rounded-md border border-slate-700"
                 dangerouslySetInnerHTML={{ __html: html }} />
        );
    };
    
    const isAssessmentType = params.type === 'assessment' || params.type === 'assessment-questions';

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM PANEL */}
                <FFCard className="lg:col-span-1 h-fit">
                    <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)'}} className="mb-4">
                        {isImageTool ? 'Image Generator' : 'Content Generator'}
                    </h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {isImageTool ? (
                            <div className="ff-fade-in-up">
                                <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-400 mb-1">Prompt</label>
                                <textarea
                                    id="image-prompt"
                                    value={imagePrompt}
                                    onChange={e => setImagePrompt(e.target.value)}
                                    rows={5}
                                    className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
                                    placeholder="e.g., A futuristic classroom with holographic displays..."
                                />
                            </div>
                        ) : (
                            <>
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
                                
                                {(params.type === 'lesson' || isAssessmentType) && (
                                    <div className="ff-fade-in-up">
                                        <label htmlFor="educational-standard" className="block text-sm font-medium text-gray-400 mb-1">Educational Standard (optional)</label>
                                        <input
                                            type="text"
                                            id="educational-standard"
                                            list="standards-list"
                                            value={params.standard}
                                            onChange={e => handleParamChange('standard', e.target.value)}
                                            className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
                                            placeholder="e.g., Common Core, NGSS"
                                        />
                                        <datalist id="standards-list">
                                            {EDUCATIONAL_STANDARDS.map(s => <option key={s} value={s} />)}
                                        </datalist>
                                    </div>
                                )}

                                {(params.type === 'lesson' || isAssessmentType) && (
                                    <div className="ff-fade-in-up">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Bloom's Taxonomy Level</label>
                                        <select value={params.bloomsLevel} onChange={e => handleParamChange('bloomsLevel', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
                                            {BLOOMS_TAXONOMY_LEVELS.map(d => <option key={d.name} value={d.name} title={d.description}>{d.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {(params.type === 'lesson' || isAssessmentType) && (
                                    <div className="ff-fade-in-up">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty Level</label>
                                        <select value={params.difficulty} onChange={e => handleParamChange('difficulty', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600">
                                            {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
                                    <input type="text" value={params.topic} onChange={e => handleParamChange('topic', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                                </div>
                                
                                {(params.type === 'lesson' || isAssessmentType) && (
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

                                {params.type === 'lesson' && (
                                    <div className="ff-fade-in-up space-y-2 pt-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Advanced Differentiation</label>
                                        <div className="p-3 bg-ff-bg-dark rounded-md border border-slate-700 space-y-2">
                                            {DIFFERENTIATION_PROFILES.map(profile => (
                                                <div key={profile.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`diff-${profile.id}`}
                                                        checked={(params.differentiationProfiles || []).includes(profile.name)}
                                                        onChange={() => handleDifferentiationChange(profile.name)}
                                                        className="h-4 w-4 rounded bg-ff-surface border-slate-600 text-ff-primary focus:ring-ff-primary"
                                                    />
                                                    <label htmlFor={`diff-${profile.id}`} className="text-sm font-medium text-gray-300 cursor-pointer" title={profile.description}>
                                                        {profile.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {isAssessmentType && (
                                    <div className="ff-fade-in-up space-y-3 pt-3 border-t border-ff-surface">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="includeRubric" checked={includeRubric} onChange={e => {
                                                setIncludeRubric(e.target.checked);
                                                if (!e.target.checked) setAssociatedRubric(null);
                                            }} className="h-4 w-4 rounded bg-ff-surface border-slate-600 text-ff-primary focus:ring-ff-primary" />
                                            <label htmlFor="includeRubric" className="text-sm font-medium text-gray-300">Include Rubric</label>
                                        </div>

                                        {includeRubric && (
                                            <div className="p-3 bg-ff-bg-dark rounded-md border border-slate-700 space-y-3">
                                                {associatedRubric ? (
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-sm">
                                                            <p className="text-ff-text-muted">Associated Rubric:</p>
                                                            <p className="font-semibold text-ff-text-primary">{associatedRubric.title}</p>
                                                        </div>
                                                        <button type="button" onClick={() => setAssociatedRubric(null)} className="text-xs text-red-400 hover:underline">Remove</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <FFButton type="button" onClick={openRubricBuilderForAssociation} variant="secondary" className="w-full text-xs">Create New Rubric</FFButton>
                                                        <FFButton type="button" onClick={() => setIsSelectRubricModalOpen(true)} variant="secondary" className="w-full text-xs" style={{backgroundColor: 'var(--ff-surface)'}}>Select Existing</FFButton>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        <div className="pt-2">
                            <FFButton 
                                type="submit"
                                disabled={isGenerating} 
                                className="w-full"
                            >
                                {params.type === 'rubric' 
                                    ? 'Open Rubric Builder' 
                                    : (isGenerating ? 'Generating...' : (isImageTool ? 'Generate Image' : 'Generate Content'))}
                            </FFButton>
                        </div>
                    </form>
                </FFCard>

                {/* RESULT PANEL */}
                <div className="lg:col-span-2">
                    {isGenerating && (
                        <FFCard>
                            <h3 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)'}} className="mb-4">
                                Generating Response...
                            </h3>
                            <div className="bg-ff-bg-dark p-4 rounded-md border border-slate-700 max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-mono text-ff-text-secondary">
                                    {streamedText}
                                </pre>
                            </div>
                        </FFCard>
                    )}
                    {error && <FFCard><p className="text-red-400">{error}</p></FFCard>}
                    {generatedContent && !isGenerating && (
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
                                    {isImageTool ? 'Describe the image you want to create.' : 'Fill out the form to generate new educational content.'}
                                </p>
                            </div>
                        </FFCard>
                    )}
                </div>
            </div>
            {isRubricBuilderOpen && <RubricBuilderModal 
                onClose={() => setIsRubricBuilderOpen(false)} 
                onRubricGenerated={rubricBuilderMode === 'primary' ? onRubricGeneratedPrimary : onRubricGeneratedAssociation}
                initialTopic={params.topic} 
                initialTitle={params.topic} 
            />}
            {isSelectRubricModalOpen && <SelectRubricModal
                onClose={() => setIsSelectRubricModalOpen(false)}
                onSelect={onRubricSelected}
            />}
        </>
    );
};

export default EducationalContentStudio;