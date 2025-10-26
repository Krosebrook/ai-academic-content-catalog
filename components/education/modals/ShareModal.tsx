
import React, { useState, useEffect } from 'react';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../../types/education';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

interface ShareModalProps {
  content: StorableContent;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ content, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const jsonString = JSON.stringify(content);
    const encodedData = btoa(jsonString);
    const url = `${window.location.origin}/share/${encodedData}`;
    setShareUrl(url);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <FFCard className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }}>
              Share Content
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <p className="text-ff-text-secondary mb-4">Anyone with this link will be able to view a read-only version of this content.</p>
        
        <div className="flex gap-2">
            <input 
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-ff-bg-dark border border-slate-600 rounded-lg p-2 font-mono text-sm"
            />
            <FFButton onClick={handleCopy} variant="primary" className="shrink-0">
                {copied ? 'Copied!' : 'Copy'}
            </FFButton>
        </div>
      </FFCard>
    </div>
  );
};

export default ShareModal;
