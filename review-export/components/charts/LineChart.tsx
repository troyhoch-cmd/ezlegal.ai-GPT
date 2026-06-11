interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  showArea?: boolean;
  showDots?: boolean;
  showGrid?: boolean;
}

export default function LineChart({
  data,
  height = 200,
  color = 'stroke-teal-500',
  showArea = true,
  showDots = true,
  showGrid = true
}: LineChartProps) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const padding = 20;
  const chartWidth = 100;
  const chartHeight = 100;

  const points = data.map((item, idx) => ({
    x: padding + (idx / (data.length - 1)) * (chartWidth - padding * 2),
    y: padding + ((max - item.value) / range) * (chartHeight - padding * 2),
    value: item.value,
    label: item.label
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  const fillColor = color.replace('stroke-', 'fill-').replace('-500', '-100');

  return (
    <div style={{ height }} className="relative">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
        {showGrid && (
          <g className="stroke-stone-200" strokeWidth="0.5">
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1={padding} y1={y * (chartHeight - padding * 2) / 100 + padding} x2={chartWidth - padding} y2={y * (chartHeight - padding * 2) / 100 + padding} />
            ))}
          </g>
        )}
        {showArea && (
          <path d={areaD} className={fillColor} opacity="0.3" />
        )}
        <path d={pathD} fill="none" className={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {showDots && points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3" className={`${color.replace('stroke-', 'fill-')} stroke-white`} strokeWidth="1.5" />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-stone-500">
        {data.map((item, idx) => (
          idx % Math.ceil(data.length / 6) === 0 && <span key={idx}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
