import React from 'react';
import FFCard from '../shared/FFCard';
import FFButton from '../shared/FFButton';

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${filled ? 'text-yellow-400' : 'text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const CategoryIcons: Record<string, React.ReactNode> = {
    'lesson-planning': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    'assessments': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'communications': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    'study-aids': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    'interactive': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    'printables': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    'language': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9.9a.5.5 0 01.5.5v2.2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2.2a.5.5 0 01.5-.5h1zM15.3 9.9a.5.5 0 01.5.5v2.2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2.2a.5.5 0 01.5-.5h1zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

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

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, categoryId, categoryName, onClose, onSelect }) => {
    
    const handleSelect = () => {
        onSelect(tool.id);
    }
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-detail-title"
        >
            <FFCard className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-ff-secondary">{CategoryIcons[categoryId] && React.cloneElement(CategoryIcons[categoryId] as React.ReactElement, { className: "h-8 w-8" })}</span>
                           <span style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-muted)'}}>{categoryName}</span>
                        </div>
                        <h2 id="tool-detail-title" style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)'}} className="mb-1">{tool.name}</h2>
                    </div>
                     <div className="flex items-center gap-0.5 mt-1 shrink-0 ml-4" aria-label={`Popularity: ${tool.popularity} out of 5 stars`}>
                        {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < tool.popularity} />)}
                    </div>
                </div>

                <p style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-base)', color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)'}} className="my-6">
                    {tool.description}
                </p>
                
                <div className="flex justify-end gap-3">
                    <FFButton variant="secondary" onClick={onClose} style={{backgroundColor: 'var(--ff-surface)'}}>Cancel</FFButton>
                    <FFButton onClick={handleSelect}>Select This Tool</FFButton>
                </div>
            </FFCard>
        </div>
    );
};

export default ToolDetailModal;
