
import { EducationalContent, Assessment, RubricContent, ImageContent } from '../types/education';
import { v4 as uuidv4 } from 'uuid';

const CONTENT_STORAGE_KEY = 'flashfusion_ai_content';
const COLLECTIONS_STORAGE_KEY = 'flashfusion_ai_collections';


export type StorableContent = EducationalContent | Assessment | RubricContent | ImageContent;

export interface Collection {
    id: string;
    name: string;
}

// Content Management
export const loadContent = (): StorableContent[] => {
  try {
    const storedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
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

    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(updatedContent));
  } catch (error) {
    console.error("Failed to save content to localStorage", error);
  }
};

export const saveAllContent = (allContent: StorableContent[]): void => {
    try {
        localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(allContent));
    } catch (error) {
        console.error("Failed to save all content to localStorage", error);
    }
};


// Collection Management
export const getCollections = (): Collection[] => {
    try {
        const storedCollections = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
        if (storedCollections) {
            return JSON.parse(storedCollections);
        }
    } catch (error) {
        console.error("Failed to load collections from localStorage", error);
    }
    return [];
};

export const saveCollections = (collections: Collection[]): void => {
    try {
        localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    } catch (error) {
        console.error("Failed to save collections to localStorage", error);
    }
};

export const createCollection = (name: string): Collection => {
    const collections = getCollections();
    const newCollection: Collection = { id: uuidv4(), name };
    saveCollections([...collections, newCollection]);
    return newCollection;
};

export const deleteCollection = (collectionId: string): void => {
    const collections = getCollections();
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    saveCollections(updatedCollections);

    // Also unassign content from this collection
    const allContent = loadContent();
    const updatedContent = allContent.map(item => {
        if (item.collectionId === collectionId) {
            return { ...item, collectionId: undefined };
        }
        return item;
    });
    saveAllContent(updatedContent);
};
