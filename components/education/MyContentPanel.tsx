import React, { useState, useEffect, useMemo } from 'react';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import { loadContent } from '../../utils/contentStorage';
import FFCard from './shared/FFCard';
import ExportMenu from './exports/ExportMenu';
import FFButton from './shared/FFButton';
import { GRADE_LEVELS } from '../../constants/education';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

interface MyContentPanelProps {
    onRemix: (content: StorableContent) => void;
}

const ContentTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const iconMap: Record<string, string> = {
        'lesson': '📚',
        'assessment': '📝',
        'assessment-questions': '📝',
        'activity': '🎲',
        'resource': '💡',
        'printable': '📄',
        'rubric': '⚖️',
        'image': '🖼️',
    };
    const displayType = type.replace('-questions', '');
    return <span className="text-2xl mr-4" title={displayType}>{iconMap[type] || '📄'}</span>;
};


const MyContentPanel: React.FC<MyContentPanelProps> = ({ onRemix }) => {
    const [contentList, setContentList] = useState<StorableContent[]>([]);
    const [selectedContent, setSelectedContent] = useState<StorableContent | null>(null);

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [gradeFilter, setGradeFilter] = useState('all');

    useEffect(() => {
        setContentList(loadContent());
    }, []);

    const filteredContent = useMemo(() => {
        return contentList.filter(content => {
            // Search query filter (case-insensitive)
            if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Type filter
            if (typeFilter !== 'all' && content.type !== typeFilter) {
                return false;
            }
            // Subject filter
            if (subjectFilter !== 'all') {
                if (!('subject' in content) || (content as EducationalContent).subject !== subjectFilter) {
                    return false;
                }
            }
            // Grade filter
            if (gradeFilter !== 'all') {
                if (!('gradeLevel' in content) || (content as EducationalContent).gradeLevel !== gradeFilter) {
                    return false;
                }
            }
            return true;
        });
    }, [contentList, searchQuery, typeFilter, subjectFilter, gradeFilter]);
    
    // Get unique, sorted values for filter dropdowns
    const contentTypes = useMemo(() => [...new Set(contentList.map(c => c.type))].sort(), [contentList]);
    const subjects = useMemo(() => {
        // FIX: Replaced a problematic flatMap with a more reliable map/filter chain to correctly extract and type subjects as strings.
        const allSubjects = contentList.map(c => 'subject' in c ? (c as EducationalContent | Assessment).subject : null);
        const uniqueSubjects = [...new Set(allSubjects.filter((s): s is string => Boolean(s)))];
        return uniqueSubjects.sort((a, b) => a.localeCompare(b));
    }, [contentList]);
    const gradeLevels = useMemo(() => {
        // FIX: Replaced a problematic flatMap with a more reliable map/filter chain to correctly extract and type grade levels as strings.
        const allGrades = contentList.map(c => 'gradeLevel' in c ? (c as EducationalContent | Assessment).gradeLevel : null);
        const uniqueGrades = [...new Set(allGrades.filter((s): s is string => Boolean(s)))];
        // Sort based on the master GRADE_LEVELS array order
        return uniqueGrades.sort((a, b) => GRADE_LEVELS.indexOf(a) - GRADE_LEVELS.indexOf(b));
    }, [contentList]);


    if (contentList.length === 0) {
        return (
            <div className="text-center py-20 ff-fade-in-up">
                <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }}>My Content Library</h2>
                <p style={{ color: 'var(--ff-text-muted)', marginTop: 'var(--ff-space-4)' }}>
                    You haven't generated any content yet.
                    <br />
                    Go to the 'Studio' tab to create your first lesson or assessment!
                </p>
            </div>
        );
    }
    
    const formatDate = (isoString: string) => {
        if(!isoString) return 'N/A';
        try {
             return new Date(isoString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch(e) {
            return 'Invalid Date'
        }
    }

    const capitalize = (s: string) => {
        if (!s) return '';
        return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="ff-fade-in-up">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-6">
                My Content Library ({filteredContent.length})
            </h2>

            {/* Filter Controls */}
            <FFCard className="mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <input 
                        type="text" 
                        placeholder="Search by title..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10"
                    />
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10 capitalize">
                        <option value="all">All Types</option>
                        {contentTypes.map(type => <option key={type} value={type} className="capitalize">{capitalize(type)}</option>)}
                    </select>
                    <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10" disabled={subjects.length === 0}>
                        <option value="all">All Subjects</option>
                        {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                    </select>
                    <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className="w-full bg-ff-surface p-2 rounded-md border border-slate-600 h-10" disabled={gradeLevels.length === 0}>
                        <option value="all">All Grades</option>
                        {gradeLevels.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                </div>
            </FFCard>

            {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((content) => (
                        <FFCard key={content.id} className="flex flex-col cursor-pointer ff-hover-lift" onClick={() => setSelectedContent(selectedContent?.id === content.id ? null : content)}>
                            <div className="flex items-start">
                                <ContentTypeIcon type={content.type} />
                                <div className="flex-1">
                                    <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontWeight: 'var(--ff-weight-semibold)' }} className="text-lg leading-tight mb-1">
                                        {content.title}
                                    </h3>
                                    <p className="text-sm text-ff-text-muted capitalize">
                                        {capitalize(content.type)}
                                        {'subject' in content && ` • ${(content as EducationalContent).subject}`}
                                        {'gradeLevel' in content && ` • ${(content as EducationalContent).gradeLevel}`}
                                    </p>
                                    <p className="text-xs text-ff-text-muted mt-2">
                                        Generated on: {formatDate(content.generatedAt)}
                                    </p>
                                </div>
                            </div>
                            {selectedContent?.id === content.id && (
                                <div className="mt-4 pt-4 border-t border-slate-700 ff-fade-in-up">
                                    {selectedContent.type === 'image' && (
                                        <img src={`data:image/png;base64,${(selectedContent as ImageContent).base64Image}`} alt={selectedContent.title} className="rounded-lg mb-4" />
                                    )}
                                    <ExportMenu content={selectedContent} />
                                    <div className="mt-4">
                                        <FFButton variant="accent" onClick={() => onRemix(selectedContent)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                                            Remix This Content
                                        </FFButton>
                                    </div>
                                </div>
                            )}
                        </FFCard>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-20">
                    <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>No Content Found</h3>
                    <p style={{ color: 'var(--ff-text-muted)', marginTop: 'var(--ff-space-4)' }}>
                        No items match your current search and filter criteria.
                        <br />
                        Try adjusting your filters or clearing the search.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyContentPanel;