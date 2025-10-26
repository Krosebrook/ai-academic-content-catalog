
import React from 'react';
import { Source } from '../../../types/education';

interface SourcesListProps {
  sources: Source[];
}

const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-slate-700 pt-4">
      <h4 className="font-semibold text-lg mb-3 text-ff-text-secondary">Sources</h4>
      <ul className="space-y-2 list-disc pl-5">
        {sources.map((source, index) => (
          <li key={index} className="text-sm">
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ff-secondary hover:underline"
              title={source.uri}
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourcesList;
