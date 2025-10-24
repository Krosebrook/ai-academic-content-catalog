import { EducationalContent, Assessment, RubricContent } from '../types/education';

const STORAGE_KEY = 'flashfusion_ai_content';

export const loadContent = (): (EducationalContent | Assessment | RubricContent)[] => {
  try {
    const storedContent = localStorage.getItem(STORAGE_KEY);
    if (storedContent) {
      return JSON.parse(storedContent);
    }
  } catch (error) {
    console.error("Failed to load content from localStorage", error);
  }
  return [];
};

export const saveContent = (newContent: EducationalContent | Assessment | RubricContent): void => {
  try {
    const existingContent = loadContent();
    // Prepend new content to show it at the top
    const updatedContent = [newContent, ...existingContent];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContent));
    // FIX: Added curly braces to the catch block to correctly scope the error variable.
  } catch (error) {
    console.error("Failed to save content to localStorage", error);
  }
};
