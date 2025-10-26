
import React, { useState, useMemo } from 'react';
import { useData } from '../../data/DataProvider';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import FFCard from './shared/FFCard';
import FFButton from './shared/FFButton';
import NewCollectionModal from './modals/NewCollectionModal';
import MoveToCollectionModal from './modals/MoveToCollectionModal';
import ShareModal from './modals/ShareModal';
import ContentRenderer from './shared/ContentRenderer';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

interface MyContentPanelProps {
  onRemix: (content: StorableContent) => void;
}

const MyContentPanel: React.FC<MyContentPanelProps> = ({ onRemix }) => {
  const { content, collections, loading, error, addCollection, updateContent } = useData();
  
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingContent, setViewingContent] = useState<StorableContent | null>(null);

  // Modals state
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<StorableContent | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<StorableContent | null>(null);

  const filteredContent = useMemo(() => {
    return content
      .filter(c => selectedCollectionId === null || c.collectionId === selectedCollectionId)
      .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [content, selectedCollectionId, searchQuery]);

  const handleSaveCollection = async (name: string) => {
    await addCollection(name);
    setIsNewCollectionModalOpen(false);
  };

  const handleMoveContent = async (collectionId: string | null) => {
    if (isMoveModalOpen) {
      await updateContent(isMoveModalOpen.id, { collectionId });
      setIsMoveModalOpen(null);
    }
  };

  if (viewingContent) {
    return (
      <div className="ff-fade-in-up">
        <FFButton onClick={() => setViewingContent(null)} variant="secondary" className="mb-4">&larr; Back to My Content</FFButton>
        <ContentRenderer content={viewingContent} />
         <div className="flex justify-end gap-2 mt-4">
            <FFButton variant="secondary" onClick={() => onRemix(viewingContent)}>Remix</FFButton>
            <FFButton variant="secondary" onClick={() => setIsShareModalOpen(viewingContent)}>Share</FFButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 ff-fade-in-up">
        {/* Sidebar */}
        <aside className="md:w-1/4 lg:w-1/5">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-lg font-semibold">Collections</h2>
            <button onClick={() => setIsNewCollectionModalOpen(true)} className="text-ff-primary hover:text-ff-secondary text-2xl font-light">+</button>
          </div>
          <ul className="space-y-1">
            <li>
                <button onClick={() => setSelectedCollectionId(null)} className={`w-full text-left p-3 rounded-lg ${selectedCollectionId === null ? 'bg-ff-primary text-white' : 'hover:bg-ff-surface'}`}>
                    All Content
                </button>
            </li>
            {collections.map(col => (
              <li key={col.id}>
                <button onClick={() => setSelectedCollectionId(col.id)} className={`w-full text-left p-3 rounded-lg ${selectedCollectionId === col.id ? 'bg-ff-primary text-white' : 'hover:bg-ff-surface'}`}>
                  {col.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          <input 
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your content..."
            className="w-full bg-ff-surface border border-slate-600 rounded-lg p-3 mb-6"
          />
          {loading && <p>Loading content...</p>}
          {error && <p className="text-red-400">Error: {error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && filteredContent.map(item => (
              <FFCard key={item.id} className="flex flex-col justify-between ff-hover-lift">
                <div>
                    <h3 onClick={() => setViewingContent(item)} className="font-bold text-lg cursor-pointer hover:text-ff-primary">{item.title}</h3>
                    <p className="text-sm text-ff-text-muted capitalize">{item.type}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <FFButton variant="secondary" style={{fontSize: '12px', padding: '4px 8px'}} onClick={() => onRemix(item)}>Remix</FFButton>
                    <FFButton variant="secondary" style={{fontSize: '12px', padding: '4px 8px'}} onClick={() => setIsMoveModalOpen(item)}>Move</FFButton>
                    <FFButton variant="secondary" style={{fontSize: '12px', padding: '4px 8px'}} onClick={() => setIsShareModalOpen(item)}>Share</FFButton>
                </div>
              </FFCard>
            ))}
          </div>
          {!loading && filteredContent.length === 0 && (
            <div className="text-center py-16 text-ff-text-muted">
                <p>No content found.</p>
            </div>
          )}
        </main>
      </div>

      {isNewCollectionModalOpen && <NewCollectionModal onClose={() => setIsNewCollectionModalOpen(false)} onSave={handleSaveCollection} />}
      {isMoveModalOpen && <MoveToCollectionModal collections={collections} onClose={() => setIsMoveModalOpen(null)} onMove={handleMoveContent} />}
      {isShareModalOpen && <ShareModal content={isShareModalOpen} onClose={() => setIsShareModalOpen(null)} />}
    </>
  );
};

export default MyContentPanel;
