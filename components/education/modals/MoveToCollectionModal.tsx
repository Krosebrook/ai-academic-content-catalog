
import React, { useState } from 'react';
import { Collection } from '../../../utils/contentStorage';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';

interface MoveToCollectionModalProps {
  collections: Collection[];
  onClose: () => void;
  onMove: (collectionId: string | null) => void;
}

const MoveToCollectionModal: React.FC<MoveToCollectionModalProps> = ({ collections, onClose, onMove }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const handleMove = () => {
    onMove(selectedCollectionId);
    onClose();
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
          Move to Collection
        </h2>

        <div className="space-y-2 max-h-64 overflow-y-auto">
            <div
                onClick={() => setSelectedCollectionId(null)}
                className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${selectedCollectionId === null ? 'border-ff-primary bg-ff-primary/10' : 'border-slate-700 bg-ff-surface hover:bg-slate-800'}`}
            >
                (No Collection)
            </div>
          {collections.map(collection => (
            <div
              key={collection.id}
              onClick={() => setSelectedCollectionId(collection.id)}
              className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${selectedCollectionId === collection.id ? 'border-ff-primary bg-ff-primary/10' : 'border-slate-700 bg-ff-surface hover:bg-slate-800'}`}
            >
              {collection.name}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>
            Cancel
          </FFButton>
          <FFButton onClick={handleMove} variant="primary">
            Move
          </FFButton>
        </div>
      </FFCard>
    </div>
  );
};

export default MoveToCollectionModal;
