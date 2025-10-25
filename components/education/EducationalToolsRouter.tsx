
import React, { useState, useMemo } from 'react';
import { EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';
import FFCard from './shared/FFCard';
import ToolDetailModal from './modals/ToolDetailModal';

interface Tool {
  id: string;
  name: string;
  description: string;
  popularity: number;
}
interface ToolWithCategory extends Tool {
    categoryId: string;
    categoryName: string;
}
interface SelectedToolInfo {
    tool: Tool;
    categoryId: string;
    categoryName: string;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${filled ? 'text-yellow-400' : 'text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CategoryIcons: Record<string, React.ReactNode> = {
    'lesson-planning': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    'assessments': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'communications': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    'study-aids': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    'interactive': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    'printables': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    'language': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9.9a.5.5 0 01.5.5v2.2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2.2a.5.5 0 01.5-.5h1zM15.3 9.9a.5.5 0 01.5.5v2.2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2.2a.5.5 0 01.5-.5h1zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

interface EducationalToolsRouterProps {
    onSelectTool: (tool: { id: string; name: string; categoryId: string; }) => void;
}

const EducationalToolsRouter: React.FC<EducationalToolsRouterProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState(EDUCATIONAL_TOOL_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolInfo, setSelectedToolInfo] = useState<SelectedToolInfo | null>(null);

  const allToolsWithCategory = useMemo<ToolWithCategory[]>(() => 
      EDUCATIONAL_TOOL_CATEGORIES.flatMap(cat => 
          cat.tools.map(tool => ({ ...tool, categoryId: cat.id, categoryName: cat.name }))
      ),
      []
  );

  const popularTools = useMemo(() => 
      allToolsWithCategory.filter(tool => tool.popularity >= 5),
      [allToolsWithCategory]
  );

  const filteredTools = useMemo(() => {
    const category = EDUCATIONAL_TOOL_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!category) return [];
    
    const categoryTools = category.tools.map(tool => ({...tool, categoryId: category.id, categoryName: category.name}));

    if (!searchQuery) return categoryTools;
    
    return categoryTools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCategory, searchQuery]);
  
  const handleSelectAndClose = (toolId: string) => {
      const tool = allToolsWithCategory.find(t => t.id === toolId);
      if (tool) {
        onSelectTool({ id: tool.id, name: tool.name, categoryId: tool.categoryId });
      }
      setSelectedToolInfo(null);
  };


  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-1/4 lg:w-1/5">
          <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)'}} className="mb-4 px-2">
            Categories
          </h2>
          <ul className="space-y-1">
            {EDUCATIONAL_TOOL_CATEGORIES.map(cat => (
              <li key={cat.id}>
                <button 
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${selectedCategory === cat.id ? 'bg-ff-primary text-white shadow-lg' : 'hover:bg-ff-surface text-ff-text-secondary hover:text-ff-text-primary'}`}
                  style={{ fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)' }}
                >
                  <span className={selectedCategory === cat.id ? 'text-white' : 'text-ff-secondary'}>{CategoryIcons[cat.id]}</span>
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6">
            <input 
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools in this category..."
              className="w-full bg-ff-surface border border-slate-600 rounded-lg p-3"
              style={{ fontSize: 'var(--ff-text-base)', color: 'var(--ff-text-primary)' }}
            />
          </div>
          <div>
              <h3 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)'}} className="mb-4">
                Most Popular Tools
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                  {popularTools.map(tool => (
                      <button 
                         key={tool.id} 
                         onClick={() => setSelectedToolInfo({ tool, categoryId: tool.categoryId, categoryName: tool.categoryName })} 
                         className="bg-ff-accent bg-opacity-20 text-ff-accent py-1 px-3 rounded-full hover:bg-opacity-40 transition-colors"
                         style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-xs)'}}
                       >
                          {tool.name}
                      </button>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ff-stagger-fade">
            {filteredTools.map((tool, index) => (
              <FFCard 
                key={tool.id} 
                className="ff-hover-lift cursor-pointer flex flex-col group"
                onClick={() => setSelectedToolInfo({ tool, categoryId: tool.categoryId, categoryName: tool.categoryName })}
                style={{'--stagger-index': index} as React.CSSProperties}
              >
                <div className="mb-4 text-ff-secondary group-hover:text-ff-primary transition-colors duration-300 transform group-hover:-translate-y-1">
                  {CategoryIcons[tool.categoryId] && React.cloneElement(CategoryIcons[tool.categoryId] as React.ReactElement, { className: "h-8 w-8" })}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)', color: 'var(--ff-text-primary)'}}>
                      {tool.name}
                    </h4>
                    <div className="flex items-center gap-0.5 mt-1 shrink-0 ml-2">
                      {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < tool.popularity} />)}
                    </div>
                  </div>
                  <p style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)'}}>
                    {tool.description}
                  </p>
                </div>
              </FFCard>
            ))}
          </div>
        </main>
      </div>
      {selectedToolInfo && (
        <ToolDetailModal
            tool={selectedToolInfo.tool}
            categoryId={selectedToolInfo.categoryId}
            categoryName={selectedToolInfo.categoryName}
            onClose={() => setSelectedToolInfo(null)}
            onSelect={handleSelectAndClose}
        />
      )}
    </>
  );
};

export default EducationalToolsRouter;
