
import React, { useState, useMemo } from 'react';
import { EDUCATIONAL_TOOL_CATEGORIES } from '../../constants/education';
import FFCard from './shared/FFCard';

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${filled ? 'text-yellow-400' : 'text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);


const EducationalToolsRouter: React.FC<{ onSelectTool: (toolId: string) => void }> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState(EDUCATIONAL_TOOL_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const popularTools = useMemo(() => 
      EDUCATIONAL_TOOL_CATEGORIES.flatMap(cat => cat.tools).filter(tool => tool.popularity >= 5),
      []
  );

  const filteredTools = useMemo(() => {
    const category = EDUCATIONAL_TOOL_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!category) return [];
    if (!searchQuery) return category.tools;
    return category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="md:w-1/4 lg:w-1/5">
        <h2 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)'}} className="mb-4">
          Categories
        </h2>
        <ul>
          {EDUCATIONAL_TOOL_CATEGORIES.map(cat => (
            <li key={cat.id} className="mb-2">
              <button 
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left p-2 rounded-md transition-colors ${selectedCategory === cat.id ? 'bg-ff-primary' : 'hover:bg-ff-surface'}`}
                style={{ fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)' }}
              >
                {cat.name}
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
            placeholder="Search tools..."
            className="w-full bg-ff-surface border border-slate-600 rounded-lg p-3"
            style={{ fontSize: 'var(--ff-text-base)', color: 'var(--ff-text-primary)' }}
          />
        </div>
        <div>
            <h3 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)'}} className="mb-4">
               Popular Tools
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
                {popularTools.map(tool => (
                     <button key={tool.id} onClick={() => onSelectTool(tool.id)} className="bg-ff-accent bg-opacity-20 text-ff-accent py-1 px-3 rounded-full hover:bg-opacity-40 transition-colors"
                        style={{fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-xs)'}}>
                        {tool.name}
                     </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ff-stagger-fade">
          {filteredTools.map((tool, index) => (
            <FFCard 
              key={tool.id} 
              className="ff-hover-lift cursor-pointer flex flex-col"
              onClick={() => onSelectTool(tool.id)}
              style={{'--stagger-index': index} as React.CSSProperties}
            >
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 style={{fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)', color: 'var(--ff-text-primary)'}}>
                    {tool.name}
                  </h4>
                  <div className="flex items-center gap-0.5 mt-1">
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
  );
};

export default EducationalToolsRouter;
