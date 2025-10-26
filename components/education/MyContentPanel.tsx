import React, { useState, useMemo } from 'react';
import { Assessment, RubricContent, ImageContent } from '../../types/education';
import { useData } from '../../data/DataProvider';
import { GRADE_LEVELS } from '../../constants/education';
import FFCard from './shared/FFCard';
import ExportMenu from './exports/ExportMenu';
import FFButton from './shared/FFButton';
import ShareModal from './modals/ShareModal';
import NewCollectionModal from './modals/NewCollectionModal';
import MoveToCollectionModal from './modals/MoveToCollectionModal';
import AssessmentViewer from './shared/AssessmentViewer';
import CommentsSidebar from '../collaboration/CommentsSidebar';
import CollaborationShareModal from '../collaboration/CollaborationShareModal';

type StorableContent = ReturnType<typeof useData>['content'][0];

interface MyContentPanelProps {
    onRemix: (content: StorableContent) => void;
}

const ContentTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const iconMap: Record<string, string> = { 'lesson': '📚', 'assessment': '📝', 'assessment-questions': '📝', 'activity': '🎲', 'resource': '💡', 'printable': '📄', 'rubric': '⚖️', 'image': '🖼️' };
    return <span className="text-2xl mr-4" title={type}>{iconMap[type] || '📄'}</span>;
};

const MyContentPanel: React.FC<MyContentPanelProps> = ({ onRemix }) => {
    const { content: allContent, collections, addCollection, updateContent, loading, error } = useData();
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>('all');
    
    const [shareContent, setShareContent] = useState<StorableContent | null>(null);
    const [moveContent, setMoveContent] = useState<StorableContent | null>(null);
    const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
    const [collabShareContent, setCollabShareContent] = useState<StorableContent | null>(null);
    const [viewingComments, setViewingComments] = useState<StorableContent | null>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [sortOption, setSortOption] = useState('date-desc');
    const [isStudentView, setIsStudentView] = useState(false);

    const handleCreateCollection = (name: string) => addCollection(name);
    const handleMoveContent = (collectionId: string | null) => {
        if (!moveContent) return;
        updateContent(moveContent.id, { ...moveContent, collectionId: collectionId || undefined });
        setMoveContent(null);
    };

    const sortedAndFilteredContent = useMemo(() => {
        const filtered = allContent.filter(c => {
            if (selectedCollectionId !== 'all' && c.collectionId !== selectedCollectionId) return false;
            if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (typeFilter !== 'all' && c.type !== typeFilter) return false;
            if (subjectFilter !== 'all' && (!c.data || !c.data.subject || c.data.subject !== subjectFilter)) return false;
            return true;
        });

        const [key, direction] = sortOption.split('-');
        return filtered.sort((a, b) => {
            if (key === 'date') return direction === 'asc' ? new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime() : new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
            const valA = (key === 'title' ? a.title : a.type);
            const valB = (key === 'title' ? b.title : b.type);
            return direction === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        });
    }, [allContent, selectedCollectionId, searchQuery, typeFilter, subjectFilter, sortOption]);
    
    const { contentTypes, subjects } = useMemo(() => {
        const uniqueTypes = [...new Set(allContent.map(c => c.type))].sort();
        const uniqueSubjects = [...new Set(allContent.map(c => c.data?.subject).filter(Boolean))].sort((a,b) => String(a).localeCompare(String(b)));
        return { contentTypes: uniqueTypes, subjects };
    }, [allContent]);
    
    const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const capitalize = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (loading) return <div>Loading content...</div>;
    if (error) return <div className="text-red-400">Error: {error}</div>;

    return (
        <div className="ff-fade-in-up">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)' }} className="text-2xl font-bold mb-6">My Content Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <FFButton onClick={() => setIsNewCollectionOpen(true)} className="w-full mb-4">New Collection</FFButton>
                    <div className="space-y-2"><button onClick={() => setSelectedCollectionId('all')} className={`w-full text-left p-3 rounded-lg ${selectedCollectionId === 'all' ? 'bg-ff-primary text-white' : 'bg-ff-surface'}`}>All Content</button>
                        {collections.map(col => (<button key={col.id} onClick={() => setSelectedCollectionId(col.id)} className={`w-full text-left p-3 rounded-lg ${selectedCollectionId === col.id ? 'bg-ff-primary text-white' : 'bg-ff-surface'}`}>{col.name}</button>))}
                    </div>
                </aside>
                <main className="md:col-span-3">
                    <FFCard className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                            <input type="text" placeholder="Search by title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10 md:col-span-2 lg:col-span-1" />
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10 capitalize"><option value="all">All Types</option>{contentTypes.map(type => <option key={type} value={type}>{capitalize(type)}</option>)}</select>
                            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10"><option value="all">All Subjects</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10"><option value="date-desc">Sort: Date (Newest)</option><option value="date-asc">Sort: Date (Oldest)</option><option value="title-asc">Sort: Title (A-Z)</option><option value="title-desc">Sort: Title (Z-A)</option><option value="type-asc">Sort: Type (A-Z)</option><option value="type-desc">Sort: Type (Z-A)</option></select>
                        </div>
                    </FFCard>

                    {sortedAndFilteredContent.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sortedAndFilteredContent.map(content => {
                                const isSelected = selectedContentId === content.id;
                                const selectedContent = isSelected ? content : null;
                                return (
                                <FFCard key={content.id} className="flex flex-col cursor-pointer ff-hover-lift" onClick={() => setSelectedContentId(isSelected ? null : content.id)}>
                                    <div className="flex items-start">
                                        <ContentTypeIcon type={content.type} /><div className="flex-1"><h3 className="text-lg leading-tight mb-1 font-semibold">{content.title}</h3><p className="text-sm text-ff-text-muted capitalize">{capitalize(content.type)}{content.data?.subject && ` • ${content.data.subject}`}</p><p className="text-xs text-ff-text-muted mt-2">Generated: {formatDate(content.generatedAt)}</p></div>
                                    </div>
                                    {isSelected && selectedContent && (
                                        <div className="mt-4 pt-4 border-t border-slate-700 ff-fade-in-up">
                                            {(selectedContent.type === 'assessment' || selectedContent.type === 'assessment-questions') ? (<><div className="flex justify-end items-center mb-2"><label htmlFor="student-view" className="text-sm mr-2">Student View</label><input type="checkbox" id="student-view" checked={isStudentView} onChange={e => setIsStudentView(e.target.checked)} /></div><AssessmentViewer assessment={selectedContent.data as Assessment} studentView={isStudentView} /></>) : selectedContent.type === 'image' && (<img src={`data:image/png;base64,${selectedContent.data.base64Image}`} alt={selectedContent.title} className="rounded-lg mb-4" />)}
                                            <ExportMenu content={selectedContent.data} />
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <FFButton variant="accent" onClick={(e) => { e.stopPropagation(); onRemix(selectedContent.data); }}>Remix</FFButton>
                                                <FFButton variant="secondary" onClick={(e) => { e.stopPropagation(); setShareContent(selectedContent.data); }}>Share Publicly</FFButton>
                                                <FFButton variant="secondary" onClick={(e) => { e.stopPropagation(); setCollabShareContent(selectedContent); }}>Collaborate</FFButton>
                                                <FFButton variant="secondary" onClick={(e) => { e.stopPropagation(); setViewingComments(selectedContent); }}>Comments</FFButton>
                                                <FFButton variant="secondary" onClick={(e) => { e.stopPropagation(); setMoveContent(selectedContent); }}>Move</FFButton>
                                                <FFButton variant="primary" className="bg-teal-600">Publish</FFButton>
                                            </div>
                                        </div>
                                    )}
                                </FFCard>
                            )})}
                        </div>
                    ) : (<div className="text-center py-20"><h3 className="text-xl font-bold">No Content Found</h3><p className="text-ff-text-muted mt-4">No items match your current criteria.</p></div>)}
                </main>
            </div>
            {shareContent && <ShareModal content={shareContent} onClose={() => setShareContent(null)} />}
            {collabShareContent && <CollaborationShareModal content={collabShareContent} onClose={() => setCollabShareContent(null)} />}
            {isNewCollectionOpen && <NewCollectionModal onClose={() => setIsNewCollectionOpen(false)} onSave={handleCreateCollection} />}
            {moveContent && <MoveToCollectionModal collections={collections} onClose={() => setMoveContent(null)} onMove={handleMoveContent} />}
            {viewingComments && <CommentsSidebar content={viewingComments} onClose={() => setViewingComments(null)} />}
        </div>
    );
};

export default MyContentPanel;