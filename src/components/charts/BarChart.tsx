interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  maxValue?: number;
  orientation?: 'vertical' | 'horizontal';
}

export default function BarChart({
  data,
  height = 200,
  showLabels = true,
  showValues = true,
  maxValue,
  orientation = 'vertical'
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const colors = [
    'bg-teal-500', 'bg-blue-500', 'bg-warning-500', 'bg-success-500',
    'bg-error-500', 'bg-stone-500', 'bg-teal-400', 'bg-blue-400'
  ];

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-stone-700 font-medium">{item.label}</span>
              {showValues && <span className="text-stone-900 font-bold">{item.value}</span>}
            </div>
            <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color || colors[idx % colors.length]}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ height }} className="flex items-end justify-between gap-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex flex-col items-center justify-end flex-1">
            {showValues && (
              <span className="text-xs font-bold text-stone-700 mb-1">{item.value}</span>
            )}
            <div
              className={`w-full max-w-12 rounded-t transition-all duration-500 ${item.color || colors[idx % colors.length]}`}
              style={{ height: `${(item.value / max) * 100}%`, minHeight: 4 }}
            />
          </div>
          {showLabels && (
            <span className="text-xs text-stone-500 text-center truncate w-full">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
