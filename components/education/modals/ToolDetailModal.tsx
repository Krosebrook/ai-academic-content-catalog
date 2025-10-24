import React from 'react';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';

interface Tool {
  id: string;
  name: string;
  description: string;
  popularity: number;
}

interface ToolDetailModalProps {
  tool: Tool;
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  onSelect: (toolId: string) => void;
}

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, categoryName, onClose, onSelect }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <FFCard className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <p style={{ color: 'var(--ff-text-secondary)', fontSize: 'var(--ff-text-sm)' }}>
              {categoryName}
            </p>
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-4">
              {tool.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p style={{ color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)' }} className="mb-6">
          {tool.description}
        </p>

        <div className="flex justify-end gap-3">
          <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>
            Cancel
          </FFButton>
          <FFButton onClick={() => onSelect(tool.id)} variant="primary">
            Use This Tool
          </FFButton>
        </div>
      </FFCard>
    </div>
  );
};

export default ToolDetailModal;
