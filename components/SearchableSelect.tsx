import React, { useEffect, useMemo, useRef, useState } from 'react';

export type SearchableOption = {
  value: string;
  label: string;
  group?: string;
  description?: string;
};

interface SearchableSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  helperText?: string;
  emptyStateText?: string;
  className?: string;
  inputClassName?: string;
  listClassName?: string;
  maxVisibleGroups?: number;
}

/**
 * Selector híbrido: permite escribir para buscar o navegar por categorías madre/hija.
 * Ideal para menús con jerarquías (ej: "Moda > Accesorios > Joyas").
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Escribe para buscar...',
  helperText = 'Puedes escribir para filtrar o abrir el menú y navegar por categorías madre → hija.',
  emptyStateText = 'Sin resultados que coincidan',
  className = '',
  inputClassName = '',
  listClassName = '',
  maxVisibleGroups = 50
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, SearchableOption[]> = {};
    options.forEach((option) => {
      const key = option.group || 'Otras categorías';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(option);
    });
    return Object.entries(groups)
      .map(([group, groupOptions]) => ({
        group,
        options: groupOptions.sort((a, b) => a.label.localeCompare(b.label, 'es'))
      }))
      .sort((a, b) => a.group.localeCompare(b.group, 'es'));
  }, [options]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return groupedOptions
      .map(({ group, options }) => ({
        group,
        options: options.filter(option => {
          const searchableText = `${group} ${option.label} ${option.description ?? ''}`.toLowerCase();
          return normalizedQuery ? searchableText.includes(normalizedQuery) : true;
        })
      }))
      .filter(group => group.options.length > 0)
      .slice(0, maxVisibleGroups);
  }, [groupedOptions, query, maxVisibleGroups]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setQuery(''); // Limpiar búsqueda al seleccionar
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="mb-1 text-xs text-[#7C8193] flex items-start gap-2">
        <span className="font-semibold text-[#6161FF] uppercase tracking-wide text-[0.65rem] mt-[1px]">¿Cómo usarlo?</span>
        <span className="leading-snug">{helperText}</span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          className={`w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20 ${inputClassName}`}
        />

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8193] text-xs font-semibold"
        >
          {isOpen ? 'Cerrar ▲' : 'Abrir ▼'}
        </button>
      </div>

      {selectedOption && (
        <div className="mt-2 rounded-xl bg-[#F0F4FF] border border-[#D9E1FF] px-3 py-2 text-xs text-[#4A4F63]">
          <span className="font-semibold text-[#6161FF]">✓ Seleccionado:</span>{' '}
          <span className="font-medium">
            {selectedOption.group ? `${selectedOption.group} → ${selectedOption.label}` : selectedOption.label}
          </span>
        </div>
      )}

      {isOpen && (
        <div
          className={`absolute z-20 mt-3 max-h-64 w-full overflow-auto rounded-2xl border border-[#E4E7EF] bg-white shadow-2xl ${listClassName}`}
        >
          {filteredGroups.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[#7C8193]">{emptyStateText}</div>
          ) : (
            filteredGroups.map(({ group, options }) => (
              <div key={group} className="border-b border-[#F0F0F5] last:border-0">
                <div className="bg-[#F8F8FF] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[#7C8193] flex items-center justify-between">
                  <span>{group}</span>
                  <span className="text-[0.65rem] text-[#9AA0B5]">Selecciona una subcategoría</span>
                </div>
                <ul className="py-1">
                  {options.map(option => {
                    const isActive = option.value === value;
                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          onMouseDown={event => event.preventDefault()}
                          onClick={() => handleSelect(option.value)}
                          className={`flex w-full items-start gap-2 px-4 py-2 text-left text-sm transition ${
                            isActive ? 'bg-[#6161FF]/10 text-[#181B34] font-semibold' : 'hover:bg-[#F5F7FB] text-[#181B34]'
                          }`}
                        >
                          <span className="text-xs text-[#9AA0B5] mt-[2px]">↳</span>
                          <div>
                            <p>{option.label}</p>
                            {option.description && (
                              <p className="text-[0.7rem] text-[#9AA0B5]">{option.description}</p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};