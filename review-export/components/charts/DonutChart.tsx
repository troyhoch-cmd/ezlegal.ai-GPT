interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({
  data,
  size = 160,
  thickness = 24,
  centerLabel,
  centerValue
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, idx) => {
            const percentage = item.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset * circumference;
            currentOffset += percentage;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                className={item.color}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-2xl font-bold text-stone-900">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-stone-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color.replace('stroke-', 'bg-')}`} />
            <span className="text-xs text-stone-600">{item.label}</span>
            <span className="text-xs font-bold text-stone-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
