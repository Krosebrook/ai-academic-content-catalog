import React, { useState, Suspense, lazy } from 'react';
import EducationalContentStudio from '../education/EducationalContentStudio';
import MyContentPanel from '../education/MyContentPanel';
import EducationalToolsRouter from '../education/EducationalToolsRouter';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import { EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';

type Tab = 'studio' | 'my-content' | 'tools' | 'analytics';

interface ToolSelection {
  id: string;
  name: string;
  categoryId: string;
}

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

const EducationAnalyticsPanel = lazy(() => import('../education/analytics/EducationAnalyticsPanel'));

const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');
  const [selectedTool, setSelectedTool] = useState<ToolSelection | null>(null);
  const [remixContent, setRemixContent] = useState<StorableContent | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'my-content', label: 'My Content' },
    { id: 'tools', label: 'Tools' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const handleSelectTool = (tool: ToolSelection) => {
    setSelectedTool(tool);
    setActiveTab('studio');
  };

  const handleRemixContent = (contentToRemix: StorableContent) => {
    // Find the tool and its category based on the toolId stored in the content
    const tool = EDUCATIONAL_TOOL_CATEGORIES
        .flatMap(cat => cat.tools)
        .find(t => t.id === contentToRemix.toolId);

    if (tool) {
        const category = EDUCATIONAL_TOOL_CATEGORIES.find(cat => cat.tools.some(t => t.id === tool.id));
        if (category) {
            setSelectedTool({
                id: tool.id,
                name: tool.name,
                categoryId: category.id,
            });
            setRemixContent(contentToRemix);
            setActiveTab('studio');
        } else {
             console.error("Could not find category for tool:", tool.id);
        }
    } else {
        console.error("Could not find tool with ID:", contentToRemix.toolId);
    }
  };

  const handleRemixComplete = () => {
      setRemixContent(null);
  };


  const handleTabChange = (tabId: Tab) => {
    if (tabId === 'studio' && activeTab !== 'tools') {
      setSelectedTool(null);
    }
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <EducationalContentStudio toolSelection={selectedTool} remixContent={remixContent} onRemixComplete={handleRemixComplete} />;
      case 'my-content':
        return <MyContentPanel onRemix={handleRemixContent} />;
      case 'tools':
        return <EducationalToolsRouter onSelectTool={handleSelectTool} />;
      case 'analytics':
        return (
          <Suspense fallback={<div className="p-8 text-center">Loading Analytics...</div>}>
            <EducationAnalyticsPanel />
          </Suspense>
        );
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
              onClick={() => handleTabChange(tab.id)}
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