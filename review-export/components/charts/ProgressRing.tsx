interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  thickness?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressRing({
  value,
  max,
  size = 100,
  thickness = 8,
  color = 'stroke-teal-500',
  label,
  showPercentage = true
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-stone-200"
            strokeWidth={thickness}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={color}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className="text-lg font-bold text-stone-900">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>
      {label && <span className="text-xs text-stone-600 text-center">{label}</span>}
    </div>
  );
}
