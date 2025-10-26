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
  const [selectedRubricId, setSelectedRubricId] = useState<string | null>(null);

  useEffect(() => {
    const allContent = loadContent();
    const savedRubrics = allContent.filter(c => c.type === 'rubric') as RubricContent[];
    setRubrics(savedRubrics);
  }, []);

  const handleSelect = () => {
    const selected = rubrics.find(r => r.id === selectedRubricId);
    if (selected) {
        onSelect(selected);
        onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <FFCard className="max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }}>
            Select an Existing Rubric
          </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 pr-2">
            {rubrics.length > 0 ? rubrics.map(rubric => (
                <div
                    key={rubric.id}
                    onClick={() => setSelectedRubricId(rubric.id)}
                    className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${selectedRubricId === rubric.id ? 'border-ff-primary bg-ff-primary/10' : 'border-slate-700 bg-ff-surface hover:bg-slate-800'}`}
                >
                    <h3 className="font-semibold">{rubric.title}</h3>
                    <p className="text-sm text-ff-text-muted">{rubric.rows.length} criteria</p>
                </div>
            )) : (
                <p className="text-center text-ff-text-muted py-8">No saved rubrics found.</p>
            )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>
            Cancel
          </FFButton>
          <FFButton onClick={handleSelect} variant="primary" disabled={!selectedRubricId}>
            Select Rubric
          </FFButton>
        </div>
      </FFCard>
    </div>
  );
};

export default SelectRubricModal;
