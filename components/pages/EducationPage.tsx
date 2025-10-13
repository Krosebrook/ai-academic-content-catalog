
import React, { useState, Suspense, lazy } from 'react';

const EducationalContentStudio = lazy(() => import('../education/EducationalContentStudio'));
const EducationalToolsRouter = lazy(() => import('../education/EducationalToolsRouter'));
const EducationAnalyticsPanel = lazy(() => import('../education/analytics/EducationAnalyticsPanel'));

type Tab = 'studio' | 'tools' | 'analytics';

const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'studio':
        return <EducationalContentStudio />;
      case 'tools':
        return <EducationalToolsRouter onSelectTool={(id) => console.log(`Tool selected: ${id}`)} />;
      case 'analytics':
        return <EducationAnalyticsPanel />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 border-b border-ff-surface">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {(['studio', 'tools', 'analytics'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 capitalize transition-colors
                ${
                  activeTab === tab
                    ? 'border-ff-primary text-ff-primary'
                    : 'border-transparent text-ff-text-muted hover:text-ff-text-primary hover:border-ff-text-secondary'
                }`}
              style={{
                fontFamily: 'var(--ff-font-primary)',
                fontWeight: 'var(--ff-weight-semibold)',
                fontSize: 'var(--ff-text-base)',
              }}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      <div>
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div style={{color: 'var(--ff-text-muted)'}}>Loading...</div>
          </div>
        }>
          {renderTabContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default EducationPage;
