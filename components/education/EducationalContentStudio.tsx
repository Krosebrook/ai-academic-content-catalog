import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    GenerationParams, ContentKind, EducationalContent,
    Assessment, RubricContent, ImageContent
} from '../../types/education';
import {
    SUBJECTS, GRADE_LEVELS
} from '../../constants/education';
import { generateEducationalContent, generateImage, streamedRefineText } from '../../services/geminiService';
import { saveContent } from '../../utils/contentStorage';
import { toMarkdown } from '../../utils/exports';

import FFButton from './shared/FFButton';
import FFCard from './shared/FFCard';
import ProgressBar from './shared/ProgressBar';
import ExportMenu from './exports/ExportMenu';
import RubricBuilderModal from './tools/RubricBuilderModal';
import SelectRubricModal from './tools/SelectRubricModal';

type GeneratedContent = EducationalContent | Assessment | RubricContent | ImageContent;

// --- Sub-components for Interactive Editing ---

const RefinementToolbar: React.FC<{
    position: { top: number; left: number };
    onRefine: (instruction: string) => void;
    onClose: () => void;
}> = ({ position, onRefine, onClose }) => {
    const [instruction, setInstruction] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleRefineClick = () => {
        if (instruction.trim()) {
            onRefine(instruction);
        }
    };

    return (
        <div
            ref={ref}
            className="absolute z-10 bg-ff-surface p-2 rounded-lg shadow-2xl border border-slate-600 flex gap-2"
            style={{ top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefineClick()}
                placeholder="e.g., Make this simpler"
                className="bg-ff-bg-dark border border-slate-700 rounded-md px-2 py-1 text-sm w-48"
                autoFocus
            />
            <FFButton onClick={handleRefineClick} variant="primary" className="py-1 px-3 text-sm">
                Refine
            </FFButton>
        </div>
    );
};

const EditableContentViewer: React.FC<{
    initialContent: string;
    onContentChange: (newHtml: string) => void;
}> = ({ initialContent, onContentChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [toolbarState, setToolbarState] = useState<{ top: number; left: number } | null>(null);
    const selectionRef = useRef<Range | null>(null);

    const handleMouseUp = () => {
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
                const range = selection.getRangeAt(0);
                selectionRef.current = range;
                const rect = range.getBoundingClientRect();
                setToolbarState({
                    top: rect.top - 50 + window.scrollY,
                    left: rect.left + window.scrollX,
                });
            } else {
                setToolbarState(null);
            }
        }, 10);
    };
    
    const handleRefine = async (instruction: string) => {
        const range = selectionRef.current;
        if (!range || !editorRef.current) return;
    
        const originalText = range.toString();
        range.deleteContents();
        const placeholder = document.createElement('span');
        placeholder.className = 'text-ff-primary animate-pulse';
        placeholder.textContent = '[Refining...]';
        range.insertNode(placeholder);
        
        let refinedText = '';
        try {
            for await (const chunk of streamedRefineText(instruction, originalText)) {
                refinedText += chunk;
                placeholder.textContent = refinedText;
            }
        } catch (e) {
            placeholder.textContent = `[Error] ${originalText}`;
        } finally {
             const finalNode = document.createTextNode(placeholder.textContent || '');
             placeholder.parentNode?.replaceChild(finalNode, placeholder);
             onContentChange(editorRef.current.innerHTML);
        }
        setToolbarState(null);
    };

    return (
        <FFCard>
             {toolbarState && (
                <RefinementToolbar
                    position={toolbarState}
                    onRefine={handleRefine}
                    onClose={() => setToolbarState(null)}
                />
            )}
            <div
                ref={editorRef}
                className="prose prose-invert max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg focus:outline-none focus:ring-2 focus:ring-ff-primary rounded-md p-2 -m-2"
                contentEditable={true}
                suppressContentEditableWarning={true}
                onMouseUp={handleMouseUp}
                onInput={() => onContentChange(editorRef.current?.innerHTML || '')}
                dangerouslySetInnerHTML={{ __html: initialContent }}
            />
        </FFCard>
    );
};

// --- Main Component ---

interface EducationalContentStudioProps {
  toolSelection: {
    id: string;
    name: string;
    categoryId: string;
  } | null;
}

const EducationalContentStudio: React.FC<EducationalContentStudioProps> = ({ toolSelection }) => {
    const [params, setParams] = useState<GenerationParams>({
        audience: 'educator',
        type: 'lesson',
        subject: 'Mathematics',
        grade: '9th Grade',
        topic: 'Introduction to Algebra',
    });
    const [imagePrompt, setImagePrompt] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    
    // State for interactive editing
    const [editedContentBody, setEditedContentBody] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);


    const [isRubricBuilderOpen, setIsRubricBuilderOpen] = useState(false);
    const [isSelectRubricOpen, setIsSelectRubricOpen] = useState(false);

    const isImageTool = useMemo(() => toolSelection?.id === 'pp-09', [toolSelection]);

    useEffect(() => {
        if (toolSelection) {
            setGeneratedContent(null);
            setError(null);
            setIsDirty(false);
            setEditedContentBody(null);

            const typeMap: Record<string, ContentKind> = {
                'lp-': 'lesson', 'as-': 'assessment', 'sa-': 'resource', 'pp-': 'printable', 'ig-': 'activity'
            };
            const prefix = toolSelection.id.substring(0, 3);
            const newType = typeMap[prefix] || 'resource';

            if (toolSelection.id === 'as-06' || toolSelection.id === 'as-11') {
                setIsRubricBuilderOpen(true);
            } else if (toolSelection.id === 'as-03') { // Essay Prompt & Rubric
                setParams(p => ({ ...p, type: 'assessment', includeRubric: true }));
            } else {
                setParams(p => ({ ...p, type: newType, includeRubric: false, associatedRubric: null }));
            }
        }
    }, [toolSelection]);
    
     useEffect(() => {
        // When new content is generated, initialize the editor's state
        if (generatedContent && 'content' in generatedContent) {
            setEditedContentBody((generatedContent as EducationalContent).content);
            setIsDirty(false);
        }
    }, [generatedContent]);

    const handleParamChange = useCallback((field: keyof GenerationParams, value: any) => {
        setParams(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setIsDirty(false);
        setEditedContentBody(null);
        setLoadingProgress(0);

        const progressInterval = setInterval(() => {
            setLoadingProgress(old => (old < 90 ? old + 5 : 90));
        }, 300);

        try {
            let result;
            if (isImageTool) {
                result = await generateImage(imagePrompt);
            } else {
                result = await generateEducationalContent(params);
            }

            if (result && 'error' in result) {
                setError(result.error);
            } else if (result) {
                setGeneratedContent(result as GeneratedContent);
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            clearInterval(progressInterval);
            setLoadingProgress(100);
            setTimeout(() => setIsLoading(false), 500);
        }
    };
    
    const handleContentChange = (newHtml: string) => {
        setEditedContentBody(newHtml);
        if (!isDirty) {
            setIsDirty(true);
        }
    };

    const handleSave = () => {
        if (!generatedContent) return;

        let contentToSave = { ...generatedContent };

        if (isDirty && editedContentBody !== null && 'content' in contentToSave) {
            (contentToSave as EducationalContent).content = editedContentBody;
        }

        saveContent(contentToSave);
        // After saving, we update the "master" content state so that if the user
        // exports *after* saving, they get the latest version.
        setGeneratedContent(contentToSave);
        alert("Content saved to 'My Content'!");
        setIsDirty(false); // Reset dirty state after saving
    };

    const renderGeneratedContent = () => {
        if (!generatedContent) return null;

        const isEditable = 'content' in generatedContent && ['lesson', 'activity', 'resource', 'printable'].includes(generatedContent.type);

        if (generatedContent.type === 'image') {
            return (
                <FFCard>
                    <h2 className="text-xl font-bold mb-4">{generatedContent.title}</h2>
                    <img src={`data:image/png;base64,${generatedContent.base64Image}`} alt={generatedContent.title} className="rounded-lg w-full max-w-md mx-auto" />
                </FFCard>
            );
        }

        if (isEditable && editedContentBody !== null) {
            return <EditableContentViewer initialContent={editedContentBody} onContentChange={handleContentChange} />;
        }

        // Fallback for non-editable content like assessments and rubrics
        return (
            <FFCard>
                <div className="prose prose-invert max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                    <ReactMarkdown>{toMarkdown(generatedContent as EducationalContent | Assessment | RubricContent)}</ReactMarkdown>
                </div>
            </FFCard>
        );
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel */}
            <div className="ff-fade-in-up">
                <h2 className="text-2xl font-bold mb-1" style={{fontFamily: 'var(--ff-font-primary)'}}>
                    {toolSelection?.name || 'Content Studio'}
                </h2>
                <p className="text-ff-text-secondary mb-6">
                    {toolSelection ? 'Fill in the details below to generate your content.' : 'Select a tool from the Tools tab to get started.'}
                </p>

                <FFCard>
                    {isImageTool ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image Description</label>
                            <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={4} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" placeholder="e.g., A photorealistic image of a red panda coding on a laptop in a bamboo forest" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Standard form fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                                    <select value={params.subject} onChange={e => handleParamChange('subject', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                                        {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Grade Level</label>
                                    <select value={params.grade} onChange={e => handleParamChange('grade', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                                        {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Topic / Title</label>
                                <input type="text" value={params.topic} onChange={e => handleParamChange('topic', e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                            </div>
                            
                            {params.includeRubric && (
                                 <div className="pt-2">
                                     {params.associatedRubric ? (
                                         <FFCard>
                                             <div className="flex justify-between items-center">
                                                 <div>
                                                    <p className="text-sm text-green-400">Rubric Attached</p>
                                                    <p className="font-semibold">{params.associatedRubric.title}</p>
                                                 </div>
                                                 <FFButton variant="secondary" onClick={() => handleParamChange('associatedRubric', null)}>Remove</FFButton>
                                             </div>
                                         </FFCard>
                                     ) : (
                                         <div className="flex gap-2">
                                            <FFButton onClick={() => setIsRubricBuilderOpen(true)}>Create New Rubric</FFButton>
                                            <FFButton onClick={() => setIsSelectRubricOpen(true)}>Select Existing Rubric</FFButton>
                                         </div>
                                     )}
                                 </div>
                            )}

                        </div>
                    )}

                    <div className="mt-6">
                        <FFButton onClick={handleGenerate} disabled={isLoading || !toolSelection || (!isImageTool && !params.topic) || (isImageTool && !imagePrompt)} className="w-full text-lg py-3">
                            {isLoading ? 'Generating...' : '✨ Generate Content'}
                        </FFButton>
                    </div>
                </FFCard>
            </div>

            {/* Output Panel */}
            <div className="ff-fade-in-up" style={{'--fade-delay': '150ms'} as React.CSSProperties}>
                {isLoading && (
                    <FFCard>
                        <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4">Generating your content...</h3>
                            <p className="text-ff-text-muted mb-6">The AI is working its magic. This may take a moment.</p>
                            <ProgressBar value={loadingProgress} />
                        </div>
                    </FFCard>
                )}
                {error && <FFCard><div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div></FFCard>}
                {generatedContent && (
                    <div className="space-y-4">
                        {renderGeneratedContent()}
                        <div className="flex gap-3">
                             <FFButton onClick={handleSave} variant="primary" className={isDirty ? 'ff-pulse-glow' : ''}>
                                {isDirty ? 'Save Changes' : 'Save to My Content'}
                            </FFButton>
                        </div>
                        <ExportMenu content={generatedContent} />
                    </div>
                )}
                {!isLoading && !error && !generatedContent && (
                     <FFCard>
                        <div className="text-center p-12 text-ff-text-muted border-2 border-dashed border-slate-700 rounded-lg">
                            <p>Your generated content will appear here.</p>
                        </div>
                     </FFCard>
                )}
            </div>

            {isRubricBuilderOpen && (
                <RubricBuilderModal
                    initialTitle={params.topic ? `Rubric for ${params.topic}`: ''}
                    initialTopic={params.topic}
                    onClose={() => setIsRubricBuilderOpen(false)}
                    onRubricGenerated={(rubric) => {
                        handleParamChange('associatedRubric', rubric)
                        setIsRubricBuilderOpen(false);
                    }}
                />
            )}
             {isSelectRubricOpen && (
                <SelectRubricModal
                    onClose={() => setIsSelectRubricOpen(false)}
                    onSelect={(rubric) => {
                        handleParamChange('associatedRubric', rubric);
                        setIsSelectRubricOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default EducationalContentStudio;