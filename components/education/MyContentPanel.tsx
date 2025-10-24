import React, { useState, useEffect } from 'react';
import { EducationalContent, Assessment, RubricContent } from '../../types/education';
import { loadContent } from '../../utils/contentStorage';
import FFCard from './shared/FFCard';
import ExportMenu from './exports/ExportMenu';

const ContentTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const iconMap: Record<string, string> = {
        'lesson': '📚',
        'assessment': '📝',
        'activity': '🎲',
        'resource': '💡',
        'printable': '📄',
        'rubric': '⚖️',
    };
    return <span className="text-2xl mr-4">{iconMap[type] || '📄'}</span>;
};


const MyContentPanel: React.FC = () => {
    const [contentList, setContentList] = useState<(EducationalContent | Assessment | RubricContent)[]>([]);
    const [selectedContent, setSelectedContent] = useState<EducationalContent | Assessment | RubricContent | null>(null);

    useEffect(() => {
        setContentList(loadContent());
    }, []);

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

    return (
        <div className="ff-fade-in-up">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-6">
                My Content Library ({contentList.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentList.map((content) => (
                    <FFCard key={content.id} className="flex flex-col cursor-pointer ff-hover-lift" onClick={() => setSelectedContent(selectedContent?.id === content.id ? null : content)}>
                        <div className="flex items-start">
                            <ContentTypeIcon type={content.type} />
                            <div className="flex-1">
                                <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontWeight: 'var(--ff-weight-semibold)' }} className="text-lg leading-tight mb-1">
                                    {content.title}
                                </h3>
                                <p className="text-sm text-ff-text-muted capitalize">
                                    {content.type}
                                    {content.type === 'lesson' && ` • ${content.subject} • ${content.gradeLevel}`}
                                </p>
                                <p className="text-xs text-ff-text-muted mt-2">
                                    Generated on: {formatDate(content.generatedAt)}
                                </p>
                            </div>
                        </div>
                        {selectedContent?.id === content.id && (
                             <div className="mt-4 pt-4 border-t border-slate-700 ff-fade-in-up">
                                 <ExportMenu content={selectedContent} />
                             </div>
                        )}
                    </FFCard>
                ))}
            </div>
        </div>
    );
};

export default MyContentPanel;
