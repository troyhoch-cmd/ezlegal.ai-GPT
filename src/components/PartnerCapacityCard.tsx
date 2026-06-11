import { Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CapacitySettings {
  maxWeeklyReferrals: number;
  currentWeekCount: number;
  acceptingReferrals: boolean;
  practiceAreas: string[];
  languages: string[];
  responseTimeSLA: string;
}

interface PartnerCapacityCardProps {
  capacity?: CapacitySettings;
  isDemo?: boolean;
}

const demoCapacity: CapacitySettings = {
  maxWeeklyReferrals: 15,
  currentWeekCount: 8,
  acceptingReferrals: true,
  practiceAreas: ['Housing', 'Family', 'Immigration', 'Employment'],
  languages: ['English', 'Spanish'],
  responseTimeSLA: '48 hours',
};

export function PartnerCapacityCard({ capacity, isDemo = true }: PartnerCapacityCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const data = capacity || demoCapacity;
  const utilization = Math.round((data.currentWeekCount / data.maxWeeklyReferrals) * 100);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span className="text-[11px] text-amber-700 font-medium">
            {en ? 'Demo — example capacity settings' : 'Demo — configuración de capacidad de ejemplo'}
          </span>
        </div>
      )}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <h4 className="text-xs font-semibold text-slate-700">
            {en ? 'Partner capacity' : 'Capacidad del socio'}
          </h4>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            data.acceptingReferrals
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {data.acceptingReferrals
            ? en ? 'Accepting referrals' : 'Aceptando referencias'
            : en ? 'At capacity' : 'A capacidad máxima'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-600 font-medium">
              {en ? 'Weekly utilization' : 'Utilización semanal'}
            </span>
            <span className="text-[11px] font-semibold text-slate-800">
              {data.currentWeekCount}/{data.maxWeeklyReferrals}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                utilization > 80 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${utilization}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {utilization}% {en ? 'of weekly capacity used' : 'de capacidad semanal usada'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">
              {en ? 'Practice areas' : 'Áreas de práctica'}
            </p>
            <div className="flex flex-wrap gap-1">
              {data.practiceAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600 font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">
              {en ? 'Languages' : 'Idiomas'}
            </p>
            <div className="flex flex-wrap gap-1">
              {data.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center rounded bg-sky-50 px-1.5 py-0.5 text-[9px] text-sky-700 font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-[10px] text-slate-600">
              {en ? 'Response SLA:' : 'SLA de respuesta:'} {data.responseTimeSLA}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-[10px] text-slate-600">
              {en ? 'Avg response: 18h' : 'Respuesta promedio: 18h'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
