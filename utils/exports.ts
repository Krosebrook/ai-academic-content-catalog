import { EducationalContent, Assessment, RubricContent, ImageContent, AssessmentQuestion, RubricRow } from '../types/education';

type ExportableContent = EducationalContent | Assessment | RubricContent | ImageContent;

const stripHtml = (html: string): string => {
    if (!html) return '';
    // A more robust implementation to convert basic HTML to readable text.
    // Adds newlines for block elements before stripping all tags.
    let text = html;
    text = text.replace(/<\/h[1-6]>/gi, '\n\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<[^>]*>?/gm, '');
    // Replace multiple newlines with a maximum of two
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    return text.trim();
};


const formatQuestionForExport = (q: AssessmentQuestion, index: number): string => {
    let text = `${index + 1}. **(${q.points} pts) ${q.prompt}**\n`;
    if (q.type === 'multiple-choice' && q.choices) {
        q.choices.forEach((choice, i) => {
            text += `   ${String.fromCharCode(65 + i)}. ${choice}\n`;
        });
    }
    text += `\n*Answer: ${Array.isArray(q.answerKey) ? q.answerKey.join(', ') : q.answerKey}*\n\n`;
    return text;
};

const formatRubricForExport = (rubric: { title: string, rows: RubricRow[] }): string => {
    let text = `## Rubric: ${rubric.title}\n\n`;
    if (!rubric.rows || rubric.rows.length === 0) return text;

    const headers = ['Criterion', ...rubric.rows[0].levels.map(l => `${l.label} (${l.points} pts)`)];
    text += `| ${headers.join(' | ')} |\n`;
    text += `| ${headers.map(() => '---').join(' | ')} |\n`;

    rubric.rows.forEach(row => {
        const cells = [row.criterion, ...row.levels.map(l => l.description.replace(/\n/g, '<br>'))];
        text += `| ${cells.join(' | ')} |\n`;
    });
    return text;
};

export const toMarkdown = (content: ExportableContent): string => {
    let md = `# ${content.title}\n\n`;

    switch (content.type) {
        case 'lesson':
        case 'activity':
        case 'resource':
        case 'printable':
            const eduContent = content as EducationalContent;
            md += `**Subject:** ${eduContent.subject} | **Grade Level:** ${eduContent.gradeLevel}\n\n`;
            if (eduContent.standard) {
                md += `**Standard:** ${eduContent.standard}\n\n`;
            }
            if (eduContent.metadata.objectives && eduContent.metadata.objectives.length > 0) {
                md += `### Learning Objectives\n- ${eduContent.metadata.objectives.join('\n- ')}\n\n`;
            }
            if (eduContent.metadata.materials && eduContent.metadata.materials.length > 0) {
                md += `### Materials\n- ${eduContent.metadata.materials.join('\n- ')}\n\n`;
            }
            // Since the content can now be HTML from the editor, strip it for clean markdown export.
            md += `--- \n\n${stripHtml(eduContent.content)}`;
            break;
        
        case 'assessment':
            const assessment = content as Assessment;
            md += `**Total Points:** ${assessment.pointsTotal}\n\n---\n\n`;
            assessment.questions.forEach((q, i) => {
                md += formatQuestionForExport(q, i);
            });
            if (assessment.rubric) {
                md += `\n\n---\n\n${formatRubricForExport(assessment.rubric)}`;
            }
            break;

        case 'rubric':
            md += formatRubricForExport(content as RubricContent);
            break;
        
        case 'image':
            md += `Image Prompt: "${(content as ImageContent).prompt}"\n\n (Image data is not included in Markdown export.)`;
            break;
    }

    return md;
};

export const toJSON = (content: ExportableContent): string => {
    return JSON.stringify(content, null, 2);
};

export const toCSVFlashcards = (content: Assessment): string => {
    const headers = '"Prompt","Answer"\n';
    const rows = content.questions.map(q => {
        const prompt = `"${q.prompt.replace(/"/g, '""')}"`;
        const answer = Array.isArray(q.answerKey) ? q.answerKey.join('; ') : q.answerKey;
        const answerStr = `"${String(answer).replace(/"/g, '""')}"`;
        return `${prompt},${answerStr}`;
    }).join('\n');
    return headers + rows;
};

export const toDocxTextOutline = (content: ExportableContent): string => {
    // A simpler version of markdown for copy-pasting
    let text = `${content.title}\n\n`;
     switch (content.type) {
        case 'lesson':
        case 'activity':
        case 'resource':
        case 'printable':
            const eduContent = content as EducationalContent;
            text += `Subject: ${eduContent.subject}\nGrade Level: ${eduContent.gradeLevel}\n`;
            if (eduContent.standard) text += `Standard: ${eduContent.standard}\n`;
            text += '\n';
            if (eduContent.metadata.objectives && eduContent.metadata.objectives.length > 0) {
                text += `Learning Objectives:\n- ${eduContent.metadata.objectives.join('\n- ')}\n\n`;
            }
            text += stripHtml(eduContent.content); // Use stripped content
            break;
        
        case 'assessment':
            const assessment = content as Assessment;
            text += `Total Points: ${assessment.pointsTotal}\n\n`;
            assessment.questions.forEach((q, i) => {
                text += `${i + 1}. (${q.points} pts) ${q.prompt}\n`;
                if(q.choices) text += q.choices.join('\n') + '\n';
                text += `Answer: ${Array.isArray(q.answerKey) ? q.answerKey.join(', ') : q.answerKey}\n\n`;
            });
            break;
        
        default:
            text += toMarkdown(content).replace(/\||---|#/g, ''); // Simple conversion
            break;
    }
    return text;
};

export const toPptOutlineText = (content: EducationalContent): string => {
    let text = `Slide 1: Title\n${content.title}\n${content.subject} - ${content.gradeLevel}\n\n`;
    
    if (content.metadata.objectives && content.metadata.objectives.length > 0) {
        text += `Slide 2: Learning Objectives\n- ${content.metadata.objectives.join('\n- ')}\n\n`;
    }

    // Attempt to split content into slides based on headers from the stripped text
    const sections = stripHtml(content.content).split(/\n\n/); 
    sections.forEach((section, i) => {
        if(section.trim()){
            const lines = section.trim().split('\n');
            text += `Slide ${i + 3}: ${lines[0]}\n`; // Use first line as title
            text += lines.slice(1).join('\n') + '\n\n';
        }
    });

    return text;
};