import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    GenerationParams, ContentKind, EducationalContent,
    Assessment, RubricContent, ImageContent, AspectRatio
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

// --- Reducer for complex form state management ---

interface StudioFormState {
    params: GenerationParams;
    imagePrompt: string;
    aspectRatio: AspectRatio;
    imageStyle: string;
}

const initialFormState: StudioFormState = {
    params: {
        audience: 'educator',
        type: 'lesson',
        subject: 'Mathematics',
        grade: '9th Grade',
        topic: 'Introduction to Algebra',
    },
    imagePrompt: '',
    aspectRatio: '1:1',
    imageStyle: 'Default',
};

type StudioFormAction =
    | { type: 'UPDATE_PARAM'; payload: { field: keyof GenerationParams; value: any } }
    | { type: 'UPDATE_IMAGE_PARAM'; payload: { field: 'imagePrompt' | 'aspectRatio' | 'imageStyle'; value: string } }
    | { type: 'SET_TOOL_TYPE'; payload: { type: ContentKind; includeRubric?: boolean } };

function studioFormReducer(state: StudioFormState, action: StudioFormAction): StudioFormState {
    switch (action.type) {
        case 'UPDATE_PARAM':
            return {
                ...state,
                params: { ...state.params, [action.payload.field]: action.payload.value },
            };
        case 'UPDATE_IMAGE_PARAM':
            return {
                ...state,
                [action.payload.field]: action.payload.value,
            };
        case 'SET_TOOL_TYPE':
            return {
                ...state,
                params: {
                    ...state.params,
                    type: action.payload.type,
                    includeRubric: action.payload.includeRubric || false,
                    associatedRubric: null,
                },
            };
        default:
            return state;
    }
}


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


// --- Content Viewer Component ---

interface ContentViewerProps {
    content: GeneratedContent;
    editedBody: string | null;
    onContentChange: (newHtml: string) => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ content, editedBody, onContentChange }) => {
    const isEditable = 'content' in content && ['lesson', 'activity', 'resource', 'printable'].includes(content.type);

    if (content.type === 'image') {
        return (
            <FFCard>
                <h2 className="text-xl font-bold mb-4">{content.title}</h2>
                <img src={`data:image/png;base64,${(content as ImageContent).base64Image}`} alt={content.title} className="rounded-lg w-full" />
            </FFCard>
        );
    }

    if (isEditable && editedBody !== null) {
        return <EditableContentViewer initialContent={editedBody} onContentChange={onContentChange} />;
    }

    // Fallback for non-editable content like assessments and rubrics
    return (
        <FFCard>
            <div className="prose prose-invert max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                <ReactMarkdown>{toMarkdown(content as EducationalContent | Assessment | RubricContent)}</ReactMarkdown>
            </div>
        </FFCard>
    );
};


// --- Main Studio Component ---

interface EducationalContentStudioProps {
  toolSelection: {
    id: string;
    name: string;
    categoryId: string;
  } | null;
}

const EducationalContentStudio: React.FC<EducationalContentStudioProps> = ({ toolSelection }) => {
    const [formState, dispatch] = useReducer(studioFormReducer, initialFormState);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    
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
            } else if (toolSelection.id === 'as-03') {
                dispatch({ type: 'SET_TOOL_TYPE', payload: { type: 'assessment', includeRubric: true } });
            } else {
                dispatch({ type: 'SET_TOOL_TYPE', payload: { type: newType } });
            }
        }
    }, [toolSelection]);
    
     useEffect(() => {
        if (generatedContent && 'content' in generatedContent) {
            setEditedContentBody((generatedContent as EducationalContent).content);
            setIsDirty(false);
        }
    }, [generatedContent]);

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
                result = await generateImage({
                    prompt: formState.imagePrompt,
                    aspectRatio: formState.aspectRatio,
                    style: formState.imageStyle
                });
            } else {
                result = await generateEducationalContent(formState.params);
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
        setGeneratedContent(contentToSave);
        alert("Content saved to 'My Content'!");
        setIsDirty(false);
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
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Image Description</label>
                                <textarea 
                                    value={formState.imagePrompt} 
                                    onChange={e => dispatch({ type: 'UPDATE_IMAGE_PARAM', payload: { field: 'imagePrompt', value: e.target.value } })}
                                    rows={3} 
                                    className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" 
                                    placeholder="e.g., A red panda coding on a laptop in a bamboo forest" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Style</label>
                                    <select 
                                        value={formState.imageStyle} 
                                        onChange={e => dispatch({ type: 'UPDATE_IMAGE_PARAM', payload: { field: 'imageStyle', value: e.target.value } })}
                                        className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                                        {['Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Fantasy', 'Anime', 'Line Art'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Aspect Ratio</label>
                                    <select 
                                        value={formState.aspectRatio}
                                        onChange={e => dispatch({ type: 'UPDATE_IMAGE_PARAM', payload: { field: 'aspectRatio', value: e.target.value as AspectRatio } })}
                                        className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                        <option value="4:3">4:3 (Standard)</option>
                                        <option value="3:4">3:4 (Tall)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                                    <select value={formState.params.subject} onChange={e => dispatch({ type: 'UPDATE_PARAM', payload: { field: 'subject', value: e.target.value } })} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                                        {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Grade Level</label>
                                    <select value={formState.params.grade} onChange={e => dispatch({ type: 'UPDATE_PARAM', payload: { field: 'grade', value: e.target.value } })} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10">
                                        {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Topic / Title</label>
                                <input type="text" value={formState.params.topic} onChange={e => dispatch({ type: 'UPDATE_PARAM', payload: { field: 'topic', value: e.target.value } })} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                            </div>
                            
                            {formState.params.includeRubric && (
                                 <div className="pt-2">
                                     {formState.params.associatedRubric ? (
                                         <FFCard>
                                             <div className="flex justify-between items-center">
                                                 <div>
                                                    <p className="text-sm text-green-400">Rubric Attached</p>
                                                    <p className="font-semibold">{formState.params.associatedRubric.title}</p>
                                                 </div>
                                                 <FFButton variant="secondary" onClick={() => dispatch({ type: 'UPDATE_PARAM', payload: { field: 'associatedRubric', value: null } })}>Remove</FFButton>
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
                        <FFButton onClick={handleGenerate} disabled={isLoading || !toolSelection || (!isImageTool && !formState.params.topic) || (isImageTool && !formState.imagePrompt)} className="w-full text-lg py-3">
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
                        <ContentViewer 
                            content={generatedContent}
                            editedBody={editedContentBody}
                            onContentChange={handleContentChange}
                        />
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
                    initialTitle={formState.params.topic ? `Rubric for ${formState.params.topic}`: ''}
                    initialTopic={formState.params.topic}
                    onClose={() => setIsRubricBuilderOpen(false)}
                    onRubricGenerated={(rubric) => {
                        dispatch({ type: 'UPDATE_PARAM', payload: { field: 'associatedRubric', value: rubric } });
                        setIsRubricBuilderOpen(false);
                    }}
                />
            )}
             {isSelectRubricOpen && (
                <SelectRubricModal
                    onClose={() => setIsSelectRubricOpen(false)}
                    onSelect={(rubric) => {
                        dispatch({ type: 'UPDATE_PARAM', payload: { field: 'associatedRubric', value: rubric } });
                        setIsSelectRubricOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default EducationalContentStudio;