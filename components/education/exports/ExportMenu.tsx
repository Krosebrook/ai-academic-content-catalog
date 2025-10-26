
import React from 'react';
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../../../types/education';
import { toMarkdown, toJSON, toCSVFlashcards, toDocxTextOutline, toPptOutlineText } from '../../../utils/exports';
import FFButton from '../shared/FFButton';

interface ExportMenuProps {
  content: EducationalContent | Assessment | RubricContent | ImageContent;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ content }) => {
  if (!content) return null;

  const handleExport = (format: 'md' | 'json' | 'csv' | 'docx' | 'ppt' | 'png', studentView: boolean = false) => {
    let data = '';
    let filename = `${content.title.replace(/\s/g, '_')}`;
    let mimeType = 'text/plain';
    let blob: Blob;
    
    if (studentView) {
        filename += '_student_version';
    }

    switch (format) {
      case 'md':
        data = toMarkdown(content, studentView);
        filename += '.md';
        mimeType = 'text/markdown';
        break;
      case 'json':
        data = toJSON(content);
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        if (content.type === 'assessment' || content.type === 'assessment-questions') {
          data = toCSVFlashcards(content as Assessment);
          filename += '_flashcards.csv';
          mimeType = 'text/csv';
        }
        break;
      case 'docx':
        data = toDocxTextOutline(content, studentView);
        filename += '.txt';
        break;
      case 'ppt':
        if (content.type === 'lesson') {
          data = toPptOutlineText(content as EducationalContent);
        }
        break;
      case 'png':
        if (content.type === 'image') {
            data = (content as ImageContent).base64Image;
            filename += '.png';
            mimeType = 'image/png';
        }
        break;
    }

    if (data) {
        if (format === 'png') {
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: mimeType });
        } else {
            blob = new Blob([data], { type: mimeType });
        }

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
        {content.type === 'image' ? (
             <FFButton variant="primary" onClick={() => handleExport('png')}>Download PNG</FFButton>
        ) : (
            <>
                <FFButton variant="secondary" onClick={() => handleExport('md')}>Markdown</FFButton>
                { (content.type === 'assessment' || content.type === 'assessment-questions') && 
                    <FFButton variant="accent" onClick={() => handleExport('md', true)}>Student Version (MD)</FFButton> 
                }
                <FFButton variant="secondary" onClick={() => handleExport('docx')}>Docx Outline</FFButton>
                {content.type === 'lesson' && <FFButton variant="secondary" onClick={() => handleExport('ppt')}>PPT Outline</FFButton>}
                {(content.type === 'assessment' || content.type === 'assessment-questions') && <FFButton variant="secondary" onClick={() => handleExport('csv')}>CSV Flashcards</FFButton>}
            </>
        )}
        <FFButton variant="secondary" onClick={() => handleExport('json')}>JSON</FFButton>
      </div>
    </div>
  );
};

export default ExportMenu;
