
import React, { useState, useEffect } from 'react';
import { EducationalAnalytics } from '../../../types/education';
import FFCard from '../shared/FFCard';

const MOCK_ANALYTICS: EducationalAnalytics = {
    contentCreated: 128,
    popularSubjects: [
        { subject: 'Mathematics', count: 45 },
        { subject: 'Science', count: 32 },
        { subject: 'English Language Arts', count: 25 },
        { subject: 'History & Social Studies', count: 18 },
    ],
    popularGrades: [
        { grade: '9th Grade', count: 30 },
        { grade: '10th Grade', count: 25 },
        { grade: '5th Grade', count: 20 },
    ],
    toolUsage: [
        { toolId: 'lp-01', name: 'Differentiated Lesson Plan', usage: 50 },
        { toolId: 'as-01', name: 'Multiple Choice Quiz', usage: 42 },
        { toolId: 'sa-02', name: 'Smart Study Guide', usage: 35 },
    ],
    userSatisfaction: 4.7
};

const AnalyticsBar: React.FC<{ label: string; value: number; maxValue: number; color: string }> = ({ label, value, maxValue, color }) => (
    <div className="flex items-center gap-4 mb-2">
        <div className="w-48 text-right" style={{ fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-secondary)'}}>
            {label}
        </div>
        <div className="flex-1 bg-ff-surface rounded-full h-6">
            <div className="h-6 rounded-full flex items-center px-2" style={{ width: `${(value / maxValue) * 100}%`, backgroundColor: color }}>
                <span style={{ fontFamily: 'var(--ff-font-primary)', fontWeight: 'var(--ff-weight-semibold)', color: 'white', fontSize: 'var(--ff-text-xs)' }}>
                    {value}
                </span>
            </div>
        </div>
    </div>
);

const EducationAnalyticsPanel: React.FC = () => {
    const [analytics, setAnalytics] = useState<EducationalAnalytics | null>(null);

    useEffect(() => {
        // Simulate fetching analytics data
        setTimeout(() => setAnalytics(MOCK_ANALYTICS), 500);
    }, []);

    if (!analytics) {
        return <div style={{color: 'var(--ff-text-muted)'}}>Loading analytics...</div>;
    }
    
    const maxSubjectCount = Math.max(...analytics.popularSubjects.map(s => s.count), 0);
    const maxGradeCount = Math.max(...analytics.popularGrades.map(g => g.count), 0);
    const maxToolUsage = Math.max(...analytics.toolUsage.map(t => t.usage), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ff-fade-in-up">
            <FFCard>
                <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
                    Content Overview
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                        <p style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-3xl)', fontWeight: 'var(--ff-weight-bold)', color: 'var(--ff-primary)'}}>{analytics.contentCreated}</p>
                        <p style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-muted)'}}>Content Items Created</p>
                    </div>
                     <div className="text-center">
                        <p style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-3xl)', fontWeight: 'var(--ff-weight-bold)', color: 'var(--ff-secondary)'}}>{analytics.userSatisfaction}/5</p>
                        <p style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-muted)'}}>Avg. User Satisfaction</p>
                    </div>
                </div>
            </FFCard>

            <FFCard>
                <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
                    Popular Tools
                </h2>
                <div className="mt-4 space-y-2">
                   {analytics.toolUsage.map(tool => (
                       <AnalyticsBar key={tool.toolId} label={tool.name} value={tool.usage} maxValue={maxToolUsage} color="var(--ff-accent)" />
                   ))}
                </div>
            </FFCard>

            <FFCard className="lg:col-span-2">
                <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
                    Content Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', marginBottom: 'var(--ff-space-3)' }}>By Subject</h3>
                        {analytics.popularSubjects.map(subject => (
                           <AnalyticsBar key={subject.subject} label={subject.subject} value={subject.count} maxValue={maxSubjectCount} color="var(--ff-primary)" />
                        ))}
                    </div>
                     <div>
                        <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', marginBottom: 'var(--ff-space-3)' }}>By Grade Level</h3>
                        {analytics.popularGrades.map(grade => (
                           <AnalyticsBar key={grade.grade} label={grade.grade} value={grade.count} maxValue={maxGradeCount} color="var(--ff-secondary)" />
                        ))}
                    </div>
                </div>
            </FFCard>
        </div>
    );
};

export default EducationAnalyticsPanel;
