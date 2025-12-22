import { TRIBE_CATEGORY_OPTIONS } from '../data/tribeCategories';
import { AFFINITIES } from '../constants/affinities';
import type { SearchableOption } from '../components/SearchableSelect';

const sortByGroupAndLabel = (a: SearchableOption, b: SearchableOption) => {
  if ((a.group || '') === (b.group || '')) {
    return a.label.localeCompare(b.label, 'es');
  }
  return (a.group || '').localeCompare(b.group || '', 'es');
};

export const buildCategorySelectOptions = (): SearchableOption[] => {
  return TRIBE_CATEGORY_OPTIONS.map((raw) => {
    const parts = raw.split('  ').map(token => token.trim()).filter(Boolean);
    const group = parts[0] || 'Otro';
    const subparts = parts.slice(1);
    const label = subparts[subparts.length - 1] || group;
    const description = subparts.length > 1
      ? subparts.join(' → ')
      : subparts.length === 1
        ? subparts[0]
        : undefined;

    return {
      value: raw,
      label,
      group,
      description
    };
  }).sort(sortByGroupAndLabel);
};

export const buildAffinitySelectOptions = (): SearchableOption[] => {
  return AFFINITIES.map(({ group, label }) => ({
    value: `${group} - ${label}`,
    label,
    group,
    description: `Grupo: ${group}`
  })).sort(sortByGroupAndLabel);
};

export const CATEGORY_SELECT_OPTIONS = buildCategorySelectOptions();
export const AFFINITY_SELECT_OPTIONS_WITH_GROUP = buildAffinitySelectOptions();
