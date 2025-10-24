import React, { useState } from 'react';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';
import { generateRubric } from '../../../services/geminiService';
import { RubricContent, RubricRow } from '../../../types/education';
import { saveContent } from '../../../utils/contentStorage';

interface RubricBuilderModalProps {
  onClose: () => void;
  initialTitle?: string;
  initialTopic?: string;
}

type Level = { label: string; points: number };
type Criterion = { id: string; name: string };

const RubricBuilderModal: React.FC<RubricBuilderModalProps> = ({ onClose, initialTitle, initialTopic }) => {
    const [title, setTitle] = useState(initialTitle || 'Essay Grading Rubric');
    const [topic, setTopic] = useState(initialTopic || 'Analysis of The Great Gatsby');
    const [criteria, setCriteria] = useState<Criterion[]>([
        { id: self.crypto.randomUUID(), name: 'Thesis Statement' },
        { id: self.crypto.randomUUID(), name: 'Evidence and Analysis' },
        { id: self.crypto.randomUUID(), name: 'Organization' },
    ]);
    const [levels, setLevels] = useState<Level[]>([
        { label: 'Excellent', points: 4 },
        { label: 'Good', points: 3 },
        { label: 'Fair', points: 2 },
        { label: 'Poor', points: 1 },
    ]);
    
    const [generatedRubric, setGeneratedRubric] = useState<RubricContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleUpdateCriterion = (id: string, value: string) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, name: value } : c));
    };

    const handleAddCriterion = () => {
        setCriteria([...criteria, { id: self.crypto.randomUUID(), name: '' }]);
    };
    
    const handleRemoveCriterion = (id: string) => {
        setCriteria(criteria.filter(c => c.id !== id));
    }

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedRubric(null);

        const params = {
            title,
            topic,
            criteria: criteria.map(c => c.name),
            levels,
        };
        const result = await generateRubric(params);
        
        if ('error' in result) {
            setError(result.error);
        } else {
            setGeneratedRubric(result);
        }
        setIsGenerating(false);
    };

    const handleSaveAndClose = () => {
        if (generatedRubric) {
            saveContent(generatedRubric);
            onClose();
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <FFCard className="max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)'}} className="mb-4">Custom Rubric Builder</h2>
                
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Rubric Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Assignment Topic</label>
                            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-semibold mb-2">Criteria</h3>
                        {criteria.map((c, index) => (
                            <div key={c.id} className="flex items-center gap-2 mb-2">
                                <input type="text" value={c.name} onChange={e => handleUpdateCriterion(c.id, e.target.value)} className="w-full bg-ff-bg-dark p-2 rounded-md border border-slate-700" placeholder={`Criterion ${index + 1}`} />
                                <button onClick={() => handleRemoveCriterion(c.id)} className="text-red-400 hover:text-red-300 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                        <button onClick={handleAddCriterion} className="text-sm text-ff-secondary hover:text-ff-primary">+ Add Criterion</button>
                    </div>

                    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md my-4">{error}</div>}

                    {isGenerating && <div className="text-center p-8">Generating descriptions...</div>}

                    {generatedRubric && (
                        <div className="mt-4 border-t border-ff-surface pt-4">
                             <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-semibold mb-2">Generated Rubric Preview</h3>
                             <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border border-slate-600 p-2 text-left">Criterion</th>
                                            {generatedRubric.rows[0].levels.map(l => <th key={l.label} className="border border-slate-600 p-2 text-left">{l.label} ({l.points}pts)</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedRubric.rows.map(row => (
                                            <tr key={row.criterion}>
                                                <td className="border border-slate-600 p-2 font-semibold align-top">{row.criterion}</td>
                                                {row.levels.map(l => <td key={l.label} className="border border-slate-600 p-2 text-sm text-ff-text-secondary align-top">{l.description}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-ff-surface flex justify-end gap-3">
                    <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>Cancel</FFButton>
                    <FFButton onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate Descriptions with AI'}
                    </FFButton>
                    <FFButton onClick={handleSaveAndClose} disabled={!generatedRubric} variant="primary">
                        Save and Close
                    </FFButton>
                </div>
            </FFCard>
        </div>
    );
};

export default RubricBuilderModal;