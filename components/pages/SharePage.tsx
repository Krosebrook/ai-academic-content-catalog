
import React, { useState, useEffect } from 'react';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import ContentRenderer from '../education/shared/ContentRenderer';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

const SharePage: React.FC = () => {
    const [content, setContent] = useState<StorableContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const encodedData = window.location.pathname.split('/share/')[1];
            if (!encodedData) {
                throw new Error("No content data found in the URL.");
            }
            const jsonString = atob(encodedData);
            const parsedContent = JSON.parse(jsonString);
            setContent(parsedContent);
        } catch (e: any) {
            console.error("Failed to decode shared content:", e);
            setError("Could not load the shared content. The link may be invalid or corrupted.");
        }
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ff-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 12 2.5zm5.72 6.55-4.22 3.12 1.34 4.88a.5.5 0 0 1-.73.55l-4.11-2.16-4.11 2.16a.5.5 0 0 1-.73-.55l1.34-4.88-4.22-3.12a.5.5 0 0 1 .28-.85l4.9-.71 2.19-4.44a.5.5 0 0 1 .9 0l2.19 4.44 4.9 .71a.5.5 0 0 1 .28.85z"/></svg>
                    <h1 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
                        FlashFusion AI Content
                    </h1>
                </div>
                <p className="text-sm text-ff-text-muted mt-2">Shared Content</p>
            </header>
            
            {error && (
                <div className="p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">
                    <h2 className="font-bold mb-2">Error Loading Content</h2>
                    <p>{error}</p>
                </div>
            )}
            
            {content && <ContentRenderer content={content} />}
        </div>
    );
};

export default SharePage;
