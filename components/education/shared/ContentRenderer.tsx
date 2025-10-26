
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../../types/education';
import AssessmentViewer from './AssessmentViewer';
import SourcesList from './SourcesList';
import FFCard from './FFCard';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

interface ContentRendererProps {
  content: StorableContent;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
    
    const renderContent = () => {
        switch (content.type) {
            case 'lesson':
            case 'activity':
            case 'resource':
            case 'printable':
                // Using dangerouslySetInnerHTML because content is stored as HTML
                return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />;
            
            case 'assessment':
            case 'assessment-questions':
                return <AssessmentViewer assessment={content as Assessment} studentView={false} />;

            case 'image':
                 return <img src={`data:image/png;base64,${content.base64Image}`} alt={content.title} className="rounded-lg mb-4 max-w-full mx-auto" />;

            case 'rubric':
                 const rubric = content as RubricContent;
                 return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-600 border border-slate-600">
                            <thead className="bg-ff-bg-dark">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600">Criterion</th>
                                    {rubric.rows[0]?.levels.map((level, index) => (
                                        <th key={index} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            {level.label} ({level.points} pts)
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {rubric.rows.map(row => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-semibold border-r border-slate-600">{row.criterion}</td>
                                        {row.levels.map((level, index) => (
                                            <td key={index} className="px-4 py-3 align-top">{level.description}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 );
            default:
                return <p>Unsupported content type.</p>
        }
    }
    
    const hasSources = 'sources' in content && content.sources && content.sources.length > 0;

    return (
        <FFCard>
            <h1 style={{ fontFamily: 'var(--ff-font-primary)' }} className="text-3xl font-bold mb-2">{content.title}</h1>
            <div className="text-sm text-ff-text-muted mb-6">
                {'subject' in content && <span>Subject: {content.subject}</span>}
                {'gradeLevel' in content && <span className="ml-4">Grade: {content.gradeLevel}</span>}
            </div>
            
            {renderContent()}

            {hasSources && <SourcesList sources={(content as any).sources} />}

        </FFCard>
    );
};

export default ContentRenderer;
