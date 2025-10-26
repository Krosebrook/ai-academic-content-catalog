import React, { useState, Suspense, lazy } from 'react';
import EducationalContentStudio from '../education/EducationalContentStudio';
import MyContentPanel from '../education/MyContentPanel';
import EducationalToolsRouter from '../education/EducationalToolsRouter';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../types/education';
import { EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';

type Tab = 'studio' | 'my-content' | 'tools' | 'analytics' | 'settings' | 'marketplace' | 'classrooms';

interface ToolSelection {
  id: string;
  name: string;
  categoryId: string;
}

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

const EducationAnalyticsPanel = lazy(() => import('../education/analytics/EducationAnalyticsPanel'));
const SettingsPanel = lazy(() => import('../education/SettingsPanel'));
// Placeholders for future components
const MarketplacePage = () => <div className="text-center p-8">Marketplace Feature Coming Soon!</div>;
const ClassroomDashboard = () => <div className="text-center p-8">Classroom Management Coming Soon!</div>;


const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');
  const [selectedTool, setSelectedTool] = useState<ToolSelection | null>(null);
  const [remixContent, setRemixContent] = useState<StorableContent | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'my-content', label: 'My Content' },
    { id: 'tools', label: 'Tools' },
    { id: 'marketplace', label: 'Marketplace'},
    { id: 'classrooms', label: 'Classrooms' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleSelectTool = (tool: ToolSelection) => {
    setSelectedTool(tool);
    setActiveTab('studio');
  };

  const handleRemixContent = (contentToRemix: StorableContent) => {
    const tool = EDUCATIONAL_TOOL_CATEGORIES.flatMap(cat => cat.tools).find(t => t.id === contentToRemix.toolId);
    if (tool) {
        const category = EDUCATIONAL_TOOL_CATEGORIES.find(cat => cat.tools.some(t => t.id === tool.id));
        if (category) {
            setSelectedTool({ id: tool.id, name: tool.name, categoryId: category.id });
            setRemixContent(contentToRemix);
            setActiveTab('studio');
        }
    }
  };

  const handleRemixComplete = () => setRemixContent(null);
  const handleTabChange = (tabId: Tab) => {
    if (tabId === 'studio' && activeTab !== 'tools') setSelectedTool(null);
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'studio': return <EducationalContentStudio toolSelection={selectedTool} remixContent={remixContent} onRemixComplete={handleRemixComplete} />;
      case 'my-content': return <MyContentPanel onRemix={handleRemixContent} />;
      case 'tools': return <EducationalToolsRouter onSelectTool={handleSelectTool} />;
      case 'marketplace': return <MarketplacePage />;
      case 'classrooms': return <ClassroomDashboard />;
      case 'analytics': return <Suspense fallback={<div>Loading...</div>}><EducationAnalyticsPanel /></Suspense>;
      case 'settings': return <Suspense fallback={<div>Loading...</div>}><SettingsPanel /></Suspense>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="border-b border-ff-surface mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id ? 'border-ff-primary text-ff-primary' : 'border-transparent text-ff-text-secondary hover:text-ff-text-primary hover:border-gray-500'}`
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

export default EducationPage;