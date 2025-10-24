import React from 'react';
import { EducationalContent, Assessment, RubricContent } from '../../../types/education';
import { toMarkdown, toJSON, toCSVFlashcards, toDocxTextOutline, toPptOutlineText } from '../../../utils/exports';
import FFButton from '../shared/FFButton';

interface ExportMenuProps {
  content: EducationalContent | Assessment | RubricContent;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ content }) => {
  if (!content) return null;

  const handleExport = (format: 'md' | 'json' | 'csv' | 'docx' | 'ppt') => {
    let data = '';
    let filename = `${content.title.replace(/\s/g, '_')}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'md':
        data = toMarkdown(content);
        filename += '.md';
        mimeType = 'text/markdown';
        break;
      case 'json':
        data = toJSON(content);
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        if (content.type === 'assessment') {
          data = toCSVFlashcards(content);
          filename += '_flashcards.csv';
          mimeType = 'text/csv';
        }
        break;
      case 'docx':
        data = toDocxTextOutline(content);
        filename += '.txt';
        break;
      case 'ppt':
        if (content.type === 'lesson') {
          data = toPptOutlineText(content as EducationalContent);
        }
        break;
    }

    if (data) {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-4 bg-ff-surface rounded-lg mt-4 border border-slate-700">
      <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-lg)', fontWeight: 'var(--ff-weight-semibold)'}}>
        Export Content
      </h3>
      <div className="flex flex-wrap gap-2 mt-3">
        <FFButton variant="secondary" onClick={() => handleExport('md')}>Markdown</FFButton>
        <FFButton variant="secondary" onClick={() => handleExport('json')}>JSON</FFButton>
        <FFButton variant="secondary" onClick={() => handleExport('docx')}>Docx Outline</FFButton>
        {content.type === 'lesson' && <FFButton variant="secondary" onClick={() => handleExport('ppt')}>PPT Outline</FFButton>}
        {content.type === 'assessment' && <FFButton variant="secondary" onClick={() => handleExport('csv')}>CSV Flashcards</FFButton>}
      </div>
    </div>
  );
};

export default ExportMenu;
