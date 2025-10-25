import React, { useState, useEffect } from 'react';
import { RubricContent } from '../../../types/education';
import { loadContent } from '../../../utils/contentStorage';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';

interface SelectRubricModalProps {
  onClose: () => void;
  onSelect: (rubric: RubricContent) => void;
}

const SelectRubricModal: React.FC<SelectRubricModalProps> = ({ onClose, onSelect }) => {
    const [rubrics, setRubrics] = useState<RubricContent[]>([]);

    useEffect(() => {
        const allContent = loadContent();
        const rubricItems = allContent.filter(c => c.type === 'rubric') as RubricContent[];
        setRubrics(rubricItems);
    }, []);

    const handleSelect = (rubric: RubricContent) => {
        onSelect(rubric);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <FFCard className="max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)'}}>Select a Rubric</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3">
                    {rubrics.length > 0 ? (
                        rubrics.map(rubric => (
                            <div 
                                key={rubric.id} 
                                onClick={() => handleSelect(rubric)} 
                                className="p-4 bg-ff-surface rounded-lg border border-slate-700 hover:border-ff-primary cursor-pointer transition-colors ff-hover-lift"
                            >
                                <h3 className="font-semibold text-ff-text-primary">{rubric.title}</h3>
                                <p className="text-sm text-ff-text-muted mt-1">
                                    Criteria: {rubric.rows.map(r => r.criterion).slice(0, 3).join(', ')}{rubric.rows.length > 3 ? '...' : ''}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-ff-text-muted">No rubrics found.</p>
                            <p className="text-sm text-ff-text-muted">Go to the Studio to create a new rubric first.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-ff-surface flex justify-end">
                    <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>
                        Cancel
                    </FFButton>
                </div>
            </FFCard>
        </div>
    );
};

export default SelectRubricModal;