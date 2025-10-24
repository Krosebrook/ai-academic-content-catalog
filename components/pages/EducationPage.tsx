import React, { useState } from 'react';
import EducationalContentStudio from '../education/EducationalContentStudio';
import MyContentPanel from '../education/MyContentPanel';
import EducationalToolsRouter from '../education/EducationalToolsRouter';
import EducationAnalyticsPanel from '../education/analytics/EducationAnalyticsPanel';

type Tab = 'studio' | 'my-content' | 'tools' | 'analytics';

const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'my-content', label: 'My Content' },
    { id: 'tools', label: 'Tools' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <EducationalContentStudio />;
      case 'my-content':
        return <MyContentPanel />;
      case 'tools':
        return <EducationalToolsRouter onSelectTool={(toolId) => console.log('Selected tool:', toolId)} />;
      case 'analytics':
        return <EducationAnalyticsPanel />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="border-b border-ff-surface mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-ff-primary text-ff-primary'
                  : 'border-transparent text-ff-text-secondary hover:text-ff-text-primary hover:border-gray-500'
                }`
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default EducationPage;
