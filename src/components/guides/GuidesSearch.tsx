import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Suggestion {
  text: string;
  category: string;
}

const SUGGESTIONS_EN: Suggestion[] = [
  { text: "My landlord won't return my security deposit", category: 'Housing Law' },
  { text: 'I received an eviction notice', category: 'Housing Law' },
  { text: 'My apartment has mold or needs repairs', category: 'Housing Law' },
  { text: 'Rent increase seems illegal', category: 'Housing Law' },
  { text: "My employer didn't pay overtime", category: 'Employment Law' },
  { text: 'I was fired without reason', category: 'Employment Law' },
  { text: 'Workplace harassment or discrimination', category: 'Employment Law' },
  { text: 'My final paycheck is late', category: 'Employment Law' },
  { text: 'A debt collector keeps calling me', category: 'Consumer Protection' },
  { text: 'I was scammed by a business', category: 'Consumer Protection' },
  { text: 'Unfair charges on my account', category: 'Consumer Protection' },
  { text: 'I want to dispute a medical bill', category: 'Consumer Protection' },
  { text: 'Filing for divorce', category: 'Family Law' },
  { text: 'Child custody arrangement', category: 'Family Law' },
  { text: 'Child support modification', category: 'Family Law' },
  { text: 'I need to create a will', category: 'Wills & Probate' },
  { text: 'Estate planning basics', category: 'Wills & Probate' },
  { text: 'Probate process after a death', category: 'Wills & Probate' },
  { text: 'Suing someone in small claims court', category: 'Civil Law' },
  { text: 'Someone owes me money', category: 'Civil Law' },
  { text: 'Neighbor or property dispute', category: 'Civil Law' },
];

const SUGGESTIONS_ES: Suggestion[] = [
  { text: 'Mi arrendador no devuelve mi depósito de seguridad', category: 'Housing Law' },
  { text: 'Recibi un aviso de desalojo', category: 'Housing Law' },
  { text: 'Mi apartamento tiene moho o necesita reparaciones', category: 'Housing Law' },
  { text: 'El aumento de renta parece ilegal', category: 'Housing Law' },
  { text: 'Mi empleador no pago horas extra', category: 'Employment Law' },
  { text: 'Me despidieron sin razon', category: 'Employment Law' },
  { text: 'Acoso o discriminacion en el trabajo', category: 'Employment Law' },
  { text: 'Mi ultimo cheque de pago esta atrasado', category: 'Employment Law' },
  { text: 'Un cobrador de deudas sigue llamandome', category: 'Consumer Protection' },
  { text: 'Fui estafado por un negocio', category: 'Consumer Protection' },
  { text: 'Cargos injustos en mi cuenta', category: 'Consumer Protection' },
  { text: 'Quiero disputar una factura medica', category: 'Consumer Protection' },
  { text: 'Presentar divorcio', category: 'Family Law' },
  { text: 'Arreglo de custodia de hijos', category: 'Family Law' },
  { text: 'Modificacion de pension alimenticia', category: 'Family Law' },
  { text: 'Necesito crear un testamento', category: 'Wills & Probate' },
  { text: 'Conceptos basicos de planificacion patrimonial', category: 'Wills & Probate' },
  { text: 'Proceso de sucesion despues de un fallecimiento', category: 'Wills & Probate' },
  { text: 'Demandar a alguien en tribunal de reclamos menores', category: 'Civil Law' },
  { text: 'Alguien me debe dinero', category: 'Civil Law' },
  { text: 'Disputa con vecino o de propiedad', category: 'Civil Law' },
];

interface GuidesSearchProps {
  onSearch: (query: string, category?: string) => void;
  onClear: () => void;
}

export default function GuidesSearch({ onSearch, onClear }: GuidesSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  const suggestions = language === 'es' ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  const quickSearches = [
    t('guides.quick.securityDeposit'),
    t('guides.quick.eviction'),
    t('guides.quick.wageTheft'),
    t('guides.quick.childCustody'),
    t('guides.quick.debtCollector'),
    t('guides.quick.smallClaims'),
  ];

  const filteredSuggestions =
    query.length >= 2
      ? suggestions.filter(
          (s) =>
            s.text.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6)
      : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
      const s = filteredSuggestions[selectedIndex];
      setQuery(s.text);
      onSearch(s.text, s.category);
    } else if (query.trim()) {
      onSearch(query.trim());
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    setQuery(suggestion.text);
    onSearch(suggestion.text, suggestion.category);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }

  function handleQuickSearch(term: string) {
    setQuery(term);
    onSearch(term);
  }

  function clearSearch() {
    setQuery('');
    onClear();
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  const categoryDisplayName = (dbCategory: string) => {
    if (language !== 'es') return dbCategory;
    const map: Record<string, string> = {
      'Housing Law': 'Derecho de Vivienda',
      'Employment Law': 'Derecho Laboral',
      'Consumer Protection': 'Proteccion al Consumidor',
      'Family Law': 'Derecho Familiar',
      'Wills & Probate': 'Testamentos y Sucesiones',
      'Civil Law': 'Derecho Civil',
    };
    return map[dbCategory] || dbCategory;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.length >= 2);
                setSelectedIndex(-1);
              }}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={t('guides.searchPlaceholder')}
              className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-navy-300 focus:outline-none focus:bg-white/15 focus:border-teal-400 transition-all text-lg backdrop-blur-sm"
              aria-label={t('guides.searchLabel')}
              aria-expanded={showSuggestions && filteredSuggestions.length > 0}
              aria-autocomplete="list"
              role="combobox"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-navy-300 hover:text-white transition-colors"
                aria-label={t('guides.clearSearch')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-navy-200 rounded-xl shadow-2xl overflow-hidden z-20"
            role="listbox"
          >
            <div className="px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wider bg-navy-50 border-b border-navy-100">
              {t('guides.commonSituations')}
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  index === selectedIndex ? 'bg-teal-50' : 'hover:bg-navy-50'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span
                  className={`text-sm ${index === selectedIndex ? 'text-teal-700 font-medium' : 'text-navy-700'}`}
                >
                  {suggestion.text}
                </span>
                <span className="text-xs text-navy-400 ml-3 whitespace-nowrap">
                  {categoryDisplayName(suggestion.category)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
        <span className="text-navy-300 text-sm">{t('guides.popular')}</span>
        {quickSearches.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            className="px-3 py-1 text-sm text-navy-200 bg-white/10 rounded-full hover:bg-white/20 hover:text-white transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
