import { EducationalContent, Assessment, RubricContent, ImageContent } from '../types/education';

const STORAGE_KEY = 'flashfusion_ai_content';

type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

export const loadContent = (): StorableContent[] => {
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

export const saveContent = (contentToSave: StorableContent): void => {
  try {
    const existingContent = loadContent();
    const index = existingContent.findIndex(item => item.id === contentToSave.id);

    let updatedContent: StorableContent[];

    if (index !== -1) {
      // This is an update. Replace the item at its original position.
      updatedContent = [...existingContent];
      updatedContent[index] = contentToSave;
    } else {
      // This is a new item. Prepend it to show at the top.
      updatedContent = [contentToSave, ...existingContent];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContent));
  } catch (error) {
    console.error("Failed to save content to localStorage", error);
  }
};