import { EducationalContent, Assessment, AssessmentQuestion, RubricContent } from '../types/education';

export function toMarkdown(content: EducationalContent | Assessment | RubricContent): string {
  if (content.type === 'rubric') {
    const rubric = content as RubricContent;
    let md = `# Rubric: ${rubric.title}\n\n`;
    md += `**Total Points:** ${rubric.pointsTotal}\n\n`;
    
    // Create header row
    const headers = ['Criterion', ...rubric.rows[0].levels.map(l => `${l.label} (${l.points} pts)`)];
    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    // Create content rows
    rubric.rows.forEach(row => {
      const cells = [row.criterion, ...row.levels.map(l => l.description.replace(/\n/g, '<br>'))];
      md += `| ${cells.join(' | ')} |\n`;
    });

    return md;
  }
  
  if (content.type === 'assessment' && 'questions' in content) {
    const assessment = content as Assessment;
    let md = `# ${assessment.title}\n\n`;
    md += `## Questions (${assessment.pointsTotal} points)\n\n`;
    assessment.questions.forEach((q, index) => {
        md += `**${index + 1}. (${q.points} pts) ${q.prompt}**\n\n`;
        if (q.type === 'multiple-choice' && q.choices) {
            q.choices.forEach(choice => md += `- ${choice}\n`);
        }
        md += `\n*Answer Key: ${q.answerKey}*\n\n`;
    });
    if (assessment.rubric) {
        md += `## Rubric\n\n`;
        assessment.rubric.rows.forEach(row => {
            md += `### ${row.criterion}\n`;
            row.levels.forEach(level => md += `- **${level.label} (${level.points} pts):** ${level.description}\n`);
            md += `\n`;
        });
    }
    return md;
  } else {
    const educationalContent = content as EducationalContent;
    let md = `# ${educationalContent.title}\n\n`;
    md += `**Subject:** ${educationalContent.subject}\n`;
    md += `**Grade Level:** ${educationalContent.gradeLevel}\n\n`;
    md += `## Metadata\n`;
    if (educationalContent.metadata.duration) md += `- **Duration:** ${educationalContent.metadata.duration}\n`;
    if (educationalContent.metadata.objectives) md += `- **Objectives:**\n${educationalContent.metadata.objectives.map(o => `  - ${o}`).join('\n')}\n`;
    md += `\n---\n\n`;
    md += educationalContent.content;
    return md;
  }
}

export function toJSON(content: EducationalContent | Assessment | RubricContent): string {
  return JSON.stringify(content, null, 2);
}

export function toCSVFlashcards(assessment: Assessment): string {
  const headers = '"Front (Prompt)","Back (Answer)"\n';
  const rows = assessment.questions
    .filter(q => q.type === 'multiple-choice' || q.type === 'short-answer' || q.type === 'true-false')
    .map(q => {
      const front = q.prompt.replace(/"/g, '""');
      const back = (q.answerKey ?? '').toString().replace(/"/g, '""');
      return `"${front}","${back}"`;
    })
    .join('\n');
  return headers + rows;
}

export function toDocxTextOutline(content: EducationalContent | Assessment | RubricContent): string {
  const md = toMarkdown(content);
  // Simple conversion for text outline: remove markdown formatting
  return md
    .replace(/^#+\s/gm, '') // remove headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // remove italic
    .replace(/^-+\s*$/gm, '\n------------------------------------\n'); // standardize rule lines
}

export function toPptOutlineText(content: EducationalContent): string {
  let outline = `Slide 1: Title\n- ${content.title}\n- ${content.subject} | ${content.gradeLevel}\n\n`;
  
  if (content.metadata.objectives) {
    outline += `Slide 2: Learning Objectives\n`;
    content.metadata.objectives.forEach(obj => {
      outline += `- ${obj}\n`;
    });
    outline += '\n';
  }

  // Attempt to split content by headers to create slides
  const sections = content.content.split(/\n(?=##\s)/);
  let slideNum = 3;
  sections.forEach(section => {
    const lines = section.split('\n');
    const title = lines[0].replace(/##\s/, '').trim();
    outline += `Slide ${slideNum}: ${title}\n`;
    lines.slice(1).forEach(line => {
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        outline += `${line.trim()}\n`;
      }
    });
    outline += '\n';
    slideNum++;
  });
  
  return outline;
}
