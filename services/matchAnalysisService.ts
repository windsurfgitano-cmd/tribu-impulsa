// services/matchAnalysisService.ts
// Servicio para análisis de compatibilidad de matches con LLM

import { MatchProfile } from '../types';

const MATCH_ANALYSIS_STORAGE_KEY = 'tribu_match_analysis';
const MATCH_ANALYSIS_MONTH_KEY = 'tribu_match_analysis_month';

export interface MatchAnalysis {
  profileId: string;
  analysis: string;
  generatedAt: string;
  month: string;
}

export interface EnrichedAnalysis {
  insight: string;
  opportunities: string[];
  icebreaker: string;
}

export const getStoredAnalysis = (profileId: string): MatchAnalysis | null => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const storedMonth = localStorage.getItem(MATCH_ANALYSIS_MONTH_KEY);

  // Si cambió el mes, limpiar análisis antiguos
  if (storedMonth !== currentMonth) {
    localStorage.removeItem(MATCH_ANALYSIS_STORAGE_KEY);
    localStorage.setItem(MATCH_ANALYSIS_MONTH_KEY, currentMonth);
    return null;
  }

  const allAnalysis = JSON.parse(localStorage.getItem(MATCH_ANALYSIS_STORAGE_KEY) || '{}');
  return allAnalysis[profileId] || null;
};

export const saveAnalysis = (profileId: string, analysis: string): void => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const allAnalysis = JSON.parse(localStorage.getItem(MATCH_ANALYSIS_STORAGE_KEY) || '{}');

  allAnalysis[profileId] = {
    profileId,
    analysis,
    generatedAt: new Date().toISOString(),
    month: currentMonth
  };

  localStorage.setItem(MATCH_ANALYSIS_STORAGE_KEY, JSON.stringify(allAnalysis));
  localStorage.setItem(MATCH_ANALYSIS_MONTH_KEY, currentMonth);
};

// Master Prompt para análisis de compatibilidad
export const generateMatchAnalysisPrompt = (myProfile: MatchProfile, targetProfile: MatchProfile): string => {
  return `Eres el "Algoritmo Tribal X" de Tribu Impulsa, una plataforma de cross-promotion para emprendedores chilenos.

CONTEXTO:
- Usuario actual: ${myProfile.name} de "${myProfile.companyName}"
- Categoría: ${myProfile.category}
- Ubicación: ${myProfile.location}
- Bio: ${myProfile.bio}
- Tags: ${myProfile.tags?.join(', ') || 'N/A'}

EMPRENDEDOR A ANALIZAR:
- Nombre: ${targetProfile.name} de "${targetProfile.companyName}"
- Categoría: ${targetProfile.category}  
- Subcategoría: ${targetProfile.subCategory}
- Ubicación: ${targetProfile.location}
- Bio: ${targetProfile.bio}
- Instagram: ${targetProfile.instagram}
- Tags: ${targetProfile.tags?.join(', ') || 'N/A'}

INSTRUCCIONES:
Genera un análisis breve (máximo 3-4 oraciones) explicando por qué estos dos emprendedores podrían tener una buena sinergia comercial para hacer cross-promotion en Chile. Considera:
1. Complementariedad de rubros (no competencia directa)
2. Potencial de audiencia compartida
3. Oportunidades de colaboración específicas

Responde en español chileno, de forma cercana y profesional. NO uses bullets, solo texto fluido.`;
};

export const clearMatchAnalysis = (): void => {
  localStorage.removeItem(MATCH_ANALYSIS_STORAGE_KEY);
  localStorage.removeItem(MATCH_ANALYSIS_MONTH_KEY);
};

