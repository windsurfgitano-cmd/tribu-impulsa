// services/surveyService.ts
// Gestión del almacenamiento y validación de encuestas

export type SurveyFormState = {
  email: string;
  name: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  otherChannel: string;
  phone: string;
  city: string;
  category: string;
  affinity: string;
  scope: string;
  sector: string;
  comuna: string;
  selectedRegions: string[];
  revenue: string;
  copyResponse: boolean;
};

export const SURVEY_STORAGE_KEY = 'tribuSurveyResponse';

export const EMPTY_SURVEY_FORM: SurveyFormState = {
  email: '',
  name: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  website: '',
  otherChannel: '',
  phone: '',
  city: '',
  category: '',
  affinity: '',
  scope: '',
  sector: '',
  comuna: '',
  selectedRegions: [],
  revenue: '',
  copyResponse: false,
};

/**
 * Obtiene la respuesta de encuesta almacenada
 */
export const getStoredSurveyResponse = (): SurveyFormState | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SURVEY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Error reading survey response', error);
    return null;
  }
};

/**
 * Verifica si el usuario ha completado la encuesta
 */
export const hasCompletedSurvey = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(SURVEY_STORAGE_KEY));
};

/**
 * Persiste la respuesta de la encuesta
 */
export const persistSurveyResponse = (data: SurveyFormState): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Limpia la respuesta de la encuesta
 */
export const clearSurveyResponse = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SURVEY_STORAGE_KEY);
};

