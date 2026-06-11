interface HeatMapProps {
  data: { county: string; value: number; lat?: number; lng?: number }[];
  title?: string;
  maxValue?: number;
}

export default function HeatMap({ data, title, maxValue }: HeatMapProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  const getIntensity = (value: number) => {
    const ratio = value / max;
    if (ratio >= 0.8) return 'bg-teal-600 text-white';
    if (ratio >= 0.6) return 'bg-teal-500 text-white';
    if (ratio >= 0.4) return 'bg-teal-400 text-white';
    if (ratio >= 0.2) return 'bg-teal-300 text-stone-900';
    return 'bg-teal-100 text-stone-700';
  };

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div>
      {title && <h4 className="text-sm font-semibold text-stone-700 mb-3">{title}</h4>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {sortedData.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg text-center transition-all hover:scale-105 ${getIntensity(item.value)}`}
          >
            <div className="text-lg font-bold">{item.value}</div>
            <div className="text-xs opacity-80 truncate">{item.county}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-stone-500">Low</span>
        <div className="flex gap-0.5">
          {['bg-teal-100', 'bg-teal-300', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600'].map((color, idx) => (
            <div key={idx} className={`w-6 h-3 ${color} ${idx === 0 ? 'rounded-l' : ''} ${idx === 4 ? 'rounded-r' : ''}`} />
          ))}
        </div>
        <span className="text-xs text-stone-500">High</span>
      </div>
    </div>
  );
}
