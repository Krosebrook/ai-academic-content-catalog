
const PERSONA_STORAGE_KEY = 'flashfusion_ai_persona';

export const savePersona = (persona: string): void => {
  try {
    localStorage.setItem(PERSONA_STORAGE_KEY, persona);
  } catch (error) {
    console.error("Failed to save persona to localStorage", error);
  }
};

export const getPersona = (): string => {
  try {
    return localStorage.getItem(PERSONA_STORAGE_KEY) || '';
  } catch (error) {
    console.error("Failed to load persona from localStorage", error);
    return '';
  }
};
