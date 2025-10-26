
import React, { useState } from 'react';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';

interface NewCollectionModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
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
      <FFCard className="max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-4">
          Create New Collection
        </h2>
        
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., 'Unit 3: The Civil War'"
          className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>
            Cancel
          </FFButton>
          <FFButton onClick={handleSave} variant="primary" disabled={!name.trim()}>
            Create
          </FFButton>
        </div>
      </FFCard>
    </div>
  );
};

export default NewCollectionModal;
