
import React, { useState } from 'react';
import { RubricContent, RubricRow, RubricLevel } from '../../../types/education';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';
import { v4 as uuidv4 } from 'uuid';

interface RubricBuilderModalProps {
  onClose: () => void;
  onSave: (rubric: RubricContent) => void;
  initialRubric?: RubricContent;
}

const defaultLevels: RubricLevel[] = [
    { label: 'Excellent', points: 4, description: '' }, 
    { label: 'Good', points: 3, description: '' }, 
    { label: 'Needs Improvement', points: 1, description: '' }
];

const RubricBuilderModal: React.FC<RubricBuilderModalProps> = ({ onClose, onSave, initialRubric }) => {
  const [title, setTitle] = useState(initialRubric?.title || 'New Rubric');
  const [rows, setRows] = useState<RubricRow[]>(initialRubric?.rows || [
    { id: uuidv4(), criterion: '', levels: JSON.parse(JSON.stringify(defaultLevels)) }
  ]);

  const handleSave = () => {
    const newRubric: RubricContent = {
      id: initialRubric?.id || uuidv4(),
      type: 'rubric',
      title,
      rows,
      generatedAt: new Date().toISOString(),
      toolId: initialRubric?.toolId || 'as-11', // Custom Rubric Builder
    };
    onSave(newRubric);
    onClose();
  };

  const handleUpdateCriterion = (rowIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex].criterion = value;
    setRows(newRows);
  };

  const handleUpdateLevel = (rowIndex: number, levelIndex: number, field: keyof RubricLevel, value: string | number) => {
    const newRows = [...rows];
    (newRows[rowIndex].levels[levelIndex] as any)[field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { id: uuidv4(), criterion: '', levels: JSON.parse(JSON.stringify(defaultLevels)) }]);
  };
  
  const removeRow = (rowIndex: number) => {
    setRows(rows.filter((_, index) => index !== rowIndex));
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <FFCard className="max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }}>
              Rubric Builder
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="overflow-y-auto pr-2">
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Rubric Title"
                className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 mb-4 text-lg font-semibold"
            />
            
            <div className="space-y-4">
            {rows.map((row, rowIndex) => (
                <div key={row.id} className="bg-ff-bg-dark p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={row.criterion}
                            onChange={e => handleUpdateCriterion(rowIndex, e.target.value)}
                            placeholder="Criterion (e.g., 'Clarity')"
                            className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 font-semibold"
                        />
                         <button onClick={() => removeRow(rowIndex)} className="text-red-400 hover:text-red-300 p-1">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {row.levels.map((level, levelIndex) => (
                            <div key={levelIndex}>
                                <div className="flex justify-between items-center bg-ff-surface p-1 rounded-t-md">
                                     <input type="text" value={level.label} onChange={e => handleUpdateLevel(rowIndex, levelIndex, 'label', e.target.value)} className="bg-transparent text-sm font-bold w-full"/>
                                     <input type="number" value={level.points} onChange={e => handleUpdateLevel(rowIndex, levelIndex, 'points', parseInt(e.target.value))} className="bg-transparent text-sm w-12 text-right"/>
                                </div>
                                <textarea
                                    value={level.description}
                                    onChange={e => handleUpdateLevel(rowIndex, levelIndex, 'description', e.target.value)}
                                    placeholder="Description for this level..."
                                    rows={3}
                                    className="w-full bg-ff-surface p-2 rounded-b-md border-t-0 border border-slate-600 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
             <FFButton onClick={addRow} variant="secondary" style={{backgroundColor: 'var(--ff-surface)'}} className="mt-4">
                + Add Criterion
            </FFButton>
        </div>


        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>
            Cancel
          </FFButton>
          <FFButton onClick={handleSave} variant="primary">
            Save Rubric
          </FFButton>
        </div>
      </FFCard>
    </div>
  );
};

export default RubricBuilderModal;
