
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Assessment, RubricContent } from '../../../types/education';

interface AssessmentViewerProps {
    assessment: Assessment;
    studentView: boolean;
}

const RubricViewer: React.FC<{ rubric: RubricContent }> = ({ rubric }) => {
    return (
        <div className="mt-6 border-t border-slate-700 pt-4">
            <h4 className="font-bold text-lg mb-2">{rubric.title}</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-600 border border-slate-600">
                    <thead className="bg-ff-surface">
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
        </div>
    );
};


const AssessmentViewer: React.FC<AssessmentViewerProps> = ({ assessment, studentView }) => {
    return (
        <div className="prose prose-invert max-w-none text-ff-text-primary">
            <div className="flex justify-between items-baseline">
                <h3 className="mb-1">{assessment.title}</h3>
                <span className="text-sm font-mono text-ff-text-muted">{assessment.pointsTotal} Points</span>
            </div>
            <hr className="my-4 border-slate-700" />
            
            <div className="space-y-6">
                {assessment.questions.map((q, index) => (
                    <div key={q.id} className="p-4 rounded-lg bg-ff-surface border border-slate-700">
                        <p className="font-semibold">{index + 1}. {q.prompt} <span className="text-xs font-mono text-ff-text-muted">({q.points} pts)</span></p>
                        {q.type === 'multiple-choice' && q.choices && (
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {q.choices.map((choice, i) => <li key={i}>{choice}</li>)}
                            </ul>
                        )}
                        {!studentView && (
                            <div className="mt-3 p-2 bg-ff-bg-dark rounded text-sm">
                                <strong className="text-ff-secondary">Answer:</strong> {Array.isArray(q.answerKey) ? q.answerKey.join(', ') : q.answerKey}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {assessment.rubric && !studentView && (
                <RubricViewer rubric={assessment.rubric} />
            )}
        </div>
    );
};

export default AssessmentViewer;
