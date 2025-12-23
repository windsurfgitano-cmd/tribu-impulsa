// constants/surveyOptions.ts
// Opciones para el formulario de survey/registro

import { TRIBE_CATEGORY_OPTIONS } from '../data/tribeCategories';
import { AFFINITIES } from './affinities';

export const SURVEY_CATEGORY_OPTIONS = TRIBE_CATEGORY_OPTIONS;

// Afinidades generadas desde constants/affinities.ts - formato "Grupo - Label"
export const SURVEY_AFFINITY_OPTIONS = AFFINITIES.map(aff => `${aff.group} - ${aff.label}`);

export const SURVEY_SCOPE_OPTIONS = [
  { value: 'LOCAL', label: 'LOCAL (sólo si operas en una comuna específica)' },
  { value: 'REGIONAL', label: 'REGIONAL (si cubres una o varias regiones de Chile)' },
  { value: 'NACIONAL', label: 'NACIONAL (llegas a todo Chile)' }
];

export const SURVEY_REVENUE_OPTIONS = [
  'Menos de $500.000',
  '$500.000 - $2.000.000',
  '$2.000.000 - $5.000.000',
  '$5.000.000 - $10.000.000',
  'Más de $10.000.000'
];

