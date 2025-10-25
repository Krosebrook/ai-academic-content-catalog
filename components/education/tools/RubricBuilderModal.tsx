import React, { useState, useMemo } from 'react';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';
import { generateRubric } from '../../../services/geminiService';
import { RubricContent } from '../../../types/education';
import { saveContent } from '../../../utils/contentStorage';

interface RubricBuilderModalProps {
  onClose: () => void;
  onRubricGenerated: (rubric: RubricContent) => void;
  initialTitle?: string;
  initialTopic?: string;
}

type Level = { label: string; points: number };
type EditableCriterion = { id: string; name: string; descriptions: string[] };

const RubricBuilderModal: React.FC<RubricBuilderModalProps> = ({ onClose, onRubricGenerated, initialTitle, initialTopic }) => {
    const [title, setTitle] = useState(initialTitle || 'Essay Grading Rubric');
    const [topic, setTopic] = useState(initialTopic || 'Analysis of The Great Gatsby');
    
    const initialLevels: Level[] = [
        { label: 'Excellent', points: 4 },
        { label: 'Good', points: 3 },
        { label: 'Fair', points: 2 },
        { label: 'Poor', points: 1 },
    ];
    
    const initialCriteria: EditableCriterion[] = [
        { id: self.crypto.randomUUID(), name: 'Thesis Statement', descriptions: Array(initialLevels.length).fill('') },
        { id: self.crypto.randomUUID(), name: 'Evidence and Analysis', descriptions: Array(initialLevels.length).fill('') },
        { id: self.crypto.randomUUID(), name: 'Organization', descriptions: Array(initialLevels.length).fill('') },
    ];

    const [criteria, setCriteria] = useState<EditableCriterion[]>(initialCriteria);
    const [levels, setLevels] = useState<Level[]>(initialLevels);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const isFormValid = useMemo(() => {
        if (!title.trim() || !topic.trim()) return false;
        if (criteria.length === 0 || levels.length < 2) return false;
        if (criteria.some(c => !c.name.trim())) return false;
        
        const pointValues = new Set<number>();
        for (const level of levels) {
            if (!level.label.trim() || !level.points || level.points <= 0) return false;
            if (pointValues.has(level.points)) return false;
            pointValues.add(level.points);
        }
        return true;
    }, [title, topic, criteria, levels]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) newErrors.title = 'Rubric Title is required.';
        if (!topic.trim()) newErrors.topic = 'Assignment Topic is required.';

        if (criteria.length === 0) newErrors.criteria = 'At least one criterion is required.';
        criteria.forEach((criterion) => {
            if (!criterion.name.trim()) {
                newErrors[`criterion-${criterion.id}`] = 'Criterion name cannot be empty.';
            }
        });

        if (levels.length < 2) newErrors.levels = 'At least two achievement levels are required.';
        const pointValues = new Set<number>();
        levels.forEach((level, index) => {
            if (!level.label.trim()) newErrors[`level-label-${index}`] = 'Level label cannot be empty.';
            if (!level.points || level.points <= 0) {
                newErrors[`level-points-${index}`] = 'Points must be a positive number.';
            } else if (pointValues.has(level.points)) {
                newErrors[`level-points-${index}`] = 'Point values must be unique.';
            } else {
                pointValues.add(level.points);
            }
        });

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // --- State Management ---
    const handleUpdateCriterionName = (id: string, value: string) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, name: value } : c));
    };
    const handleAddCriterion = () => setCriteria([...criteria, { id: self.crypto.randomUUID(), name: '', descriptions: Array(levels.length).fill('') }]);
    const handleRemoveCriterion = (id: string) => setCriteria(criteria.filter(c => c.id !== id));

    const handleUpdateLevel = (index: number, field: 'label' | 'points', value: string) => {
        setLevels(prevLevels => {
            const newLevels = [...prevLevels];
            if (field === 'label') {
                newLevels[index] = { ...newLevels[index], label: value };
            } else if (field === 'points') {
                const parsedValue = parseInt(value, 10);
                newLevels[index] = { ...newLevels[index], points: isNaN(parsedValue) ? 0 : parsedValue };
            }
            return newLevels;
        });
    };
    const handleAddLevel = () => {
        setLevels([...levels, { label: '', points: 0 }]);
        setCriteria(prev => prev.map(c => ({...c, descriptions: [...c.descriptions, '']})));
    };
    const handleRemoveLevel = (indexToRemove: number) => {
        setLevels(levels.filter((_, i) => i !== indexToRemove));
        setCriteria(prev => prev.map(c => {
            const newDescriptions = c.descriptions.filter((_, i) => i !== indexToRemove);
            return {...c, descriptions: newDescriptions};
        }));
    };
     const handleUpdateDescription = (criterionId: string, levelIndex: number, value: string) => {
        setCriteria(prevCriteria => 
            prevCriteria.map(c => {
                if (c.id === criterionId) {
                    const newDescriptions = [...c.descriptions];
                    newDescriptions[levelIndex] = value;
                    return { ...c, descriptions: newDescriptions };
                }
                return c;
            })
        );
    };

    // --- AI & Saving ---
    const handleGenerate = async () => {
        if (!validateForm()) return;
        setIsGenerating(true);
        setError('');

        const params = { title, topic, criteria: criteria.map(c => c.name), levels };
        const result = await generateRubric(params);
        
        if ('error' in result) {
            setError(result.error);
        } else {
            // Populate the descriptions in our state with the AI response
            setCriteria(prevCriteria => {
                return prevCriteria.map(editableCriterion => {
                    const foundRow = result.rows.find(r => r.criterion === editableCriterion.name);
                    if (foundRow) {
                        const newDescriptions = levels.map(level => {
                           const foundLevel = foundRow.levels.find(l => l.label === level.label && l.points === level.points);
                           return foundLevel ? foundLevel.description : '';
                        });
                        return { ...editableCriterion, descriptions: newDescriptions };
                    }
                    return editableCriterion;
                });
            });
        }
        setIsGenerating(false);
    };

    const handleSaveAndClose = () => {
        if (!validateForm()) return;
        
        const finalRubric: RubricContent = {
            id: self.crypto.randomUUID(),
            type: 'rubric',
            generatedAt: new Date().toISOString(),
            title: title,
            pointsTotal: levels.length > 0 ? criteria.length * Math.max(...levels.map(l => l.points)) : 0,
            rows: criteria.map(criterion => ({
                criterion: criterion.name,
                levels: levels.map((level, levelIndex) => ({
                    label: level.label,
                    points: level.points,
                    description: criterion.descriptions[levelIndex] || '',
                }))
            }))
        };
        
        saveContent(finalRubric);
        onRubricGenerated(finalRubric);
        onClose();
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <FFCard className="max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)'}} className="mb-4">Custom Rubric Builder</h2>
                
                <div className="flex-grow overflow-y-auto pr-2">
                    {/* --- STRUCTURE DEFINITION --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Rubric Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                            {validationErrors.title && <p className="text-red-400 text-xs mt-1">{validationErrors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Assignment Topic</label>
                            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                             {validationErrors.topic && <p className="text-red-400 text-xs mt-1">{validationErrors.topic}</p>}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-semibold mb-2">Achievement Levels</h3>
                            {levels.map((level, index) => (
                                <div key={index} className="flex items-start gap-2 mb-2">
                                    <div className="w-2/3">
                                        <input type="text" value={level.label} onChange={e => handleUpdateLevel(index, 'label', e.target.value)} className="w-full bg-ff-bg-dark p-2 rounded-md border border-slate-700" placeholder={`Level ${index + 1} Label`} />
                                        {validationErrors[`level-label-${index}`] && <p className="text-red-400 text-xs mt-1">{validationErrors[`level-label-${index}`]}</p>}
                                    </div>
                                    <div className="w-1/3">
                                        <input type="number" value={level.points || ''} onChange={e => handleUpdateLevel(index, 'points', e.target.value)} className="w-full bg-ff-bg-dark p-2 rounded-md border border-slate-700" placeholder="Points" />
                                        {validationErrors[`level-points-${index}`] && <p className="text-red-400 text-xs mt-1">{validationErrors[`level-points-${index}`]}</p>}
                                    </div>
                                    <button onClick={() => handleRemoveLevel(index)} className="text-gray-400 hover:text-red-400 p-2 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button onClick={handleAddLevel} className="text-sm text-ff-secondary hover:text-ff-primary">+ Add Level</button>
                            {validationErrors.levels && <p className="text-red-400 text-xs mt-1">{validationErrors.levels}</p>}
                        </div>
                        <div>
                             <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-semibold mb-2">Criteria</h3>
                            {criteria.map((c, index) => (
                                <div key={c.id} className="flex items-start gap-2 mb-2">
                                    <div className="w-full">
                                        <input type="text" value={c.name} onChange={e => handleUpdateCriterionName(c.id, e.target.value)} className="w-full bg-ff-bg-dark p-2 rounded-md border border-slate-700" placeholder={`Criterion ${index + 1}`} />
                                        {validationErrors[`criterion-${c.id}`] && <p className="text-red-400 text-xs mt-1">{validationErrors[`criterion-${c.id}`]}</p>}
                                    </div>
                                    <button onClick={() => handleRemoveCriterion(c.id)} className="text-gray-400 hover:text-red-400 p-2 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button onClick={handleAddCriterion} className="text-sm text-ff-secondary hover:text-ff-primary">+ Add Criterion</button>
                            {validationErrors.criteria && <p className="text-red-400 text-xs mt-1">{validationErrors.criteria}</p>}
                        </div>
                    </div>
                   
                    {/* --- EDITABLE GRID --- */}
                    <div className="overflow-x-auto">
                        <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-semibold mb-2">Rubric Descriptions</h3>
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-ff-surface">
                                    <th className="border border-slate-600 p-2 text-left w-1/4">Criterion</th>
                                    {levels.map(l => <th key={l.label} className="border border-slate-600 p-2 text-left">{l.label} ({l.points}pts)</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {criteria.map((criterion) => (
                                    <tr key={criterion.id}>
                                        <td className="border border-slate-600 p-2 font-semibold align-top bg-ff-surface/50">{criterion.name}</td>
                                        {levels.map((level, levelIndex) => (
                                            <td key={`${criterion.id}-${level.label}`} className="border border-slate-700 p-1 align-top">
                                                <textarea
                                                    value={criterion.descriptions[levelIndex]}
                                                    onChange={(e) => handleUpdateDescription(criterion.id, levelIndex, e.target.value)}
                                                    className="w-full h-32 bg-ff-bg-dark p-2 rounded-md border-none resize-y text-sm text-ff-text-secondary focus:ring-1 focus:ring-ff-primary"
                                                    placeholder={`Description for ${criterion.name} at ${level.label} level...`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md my-4">{error}</div>}
                    {isGenerating && <div className="text-center p-8 text-ff-text-muted">Generating descriptions with AI...</div>}
                </div>

                <div className="mt-6 pt-4 border-t border-ff-surface flex justify-end gap-3">
                    <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>Cancel</FFButton>
                    <FFButton onClick={handleGenerate} disabled={isGenerating || !isFormValid} title={!isFormValid ? 'Please fill out all required fields' : ''}>
                        {isGenerating ? 'Generating...' : 'Generate Descriptions with AI'}
                    </FFButton>
                    <FFButton onClick={handleSaveAndClose} disabled={!isFormValid} variant="primary" title={!isFormValid ? 'Please fill out all required fields' : ''}>
                        Save and Close
                    </FFButton>
                </div>
            </FFCard>
        </div>
    );
};

export default RubricBuilderModal;