import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { US_STATES, US_TERRITORIES } from '../../data/jurisdictions';

interface JurisdictionModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export default function JurisdictionModal({ open, value, onChange, onClose }: JurisdictionModalProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const jurisdictions = [...US_STATES, ...US_TERRITORIES];

  const filtered = search.trim()
    ? jurisdictions.filter(
        (j) =>
          j.name.toLowerCase().includes(search.toLowerCase()) ||
          j.code.toLowerCase().includes(search.toLowerCase())
      )
    : jurisdictions;

  useEffect(() => {
    if (open) {
      setPending(value);
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const selectedName = jurisdictions.find((j) => j.code === pending)?.name || pending;

  const handleConfirm = () => {
    if (pending) {
      onChange(pending);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={en ? 'Select your state' : 'Selecciona tu estado'}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">
              {en ? 'Select your state' : 'Selecciona tu estado'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={en ? 'Close' : 'Cerrar'}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <p className="px-5 text-sm text-slate-500 mb-3">
          {en
            ? 'Laws vary by state. Select yours so we can provide relevant information.'
            : 'Las leyes varían por estado. Selecciona el tuyo para recibir información relevante.'}
        </p>

        {/* Search */}
        <div className="px-5 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={en ? 'Search for your state...' : 'Busca tu estado...'}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              aria-label={en ? 'Search states' : 'Buscar estados'}
            />
          </div>
        </div>

        {/* State list */}
        <div className="flex-1 overflow-y-auto px-5 pb-3" role="listbox" aria-label={en ? 'States' : 'Estados'}>
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((j) => (
              <button
                key={j.code}
                role="option"
                aria-selected={pending === j.code}
                onClick={() => setPending(j.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  pending === j.code
                    ? 'bg-teal-50 border-2 border-teal-500 text-teal-800 font-semibold'
                    : 'border border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {pending === j.code && <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />}
                <span className="truncate">{j.name}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              {en ? 'No states match your search.' : 'Ningún estado coincide con tu búsqueda.'}
            </p>
          )}
        </div>

        {/* Confirm */}
        <div className="px-5 py-4 border-t border-slate-200">
          <button
            onClick={handleConfirm}
            disabled={!pending}
            data-testid="jurisdiction-change"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors"
          >
            {pending
              ? (en ? `Use ${selectedName}` : `Usar ${selectedName}`)
              : (en ? 'Select a state' : 'Selecciona un estado')}
          </button>
        </div>
      </div>
    </div>
  );
}
