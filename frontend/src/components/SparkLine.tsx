interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function SparkLine({ data, width = 80, height = 36, positive }: SparkLineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;

  const pts = data.map((val, i) => ({
    x: (i / (data.length - 1)) * (width - pad * 2) + pad,
    y: height - pad - ((val - min) / range) * (height - pad * 2),
  }));

  // Courbe lissée avec bezier
  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    const cp1y = pts[i - 1].y;
    const cp2x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    const cp2y = pts[i].y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`;
  }

  // Zone de remplissage sous la courbe
  const fillD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

  const isUp = positive !== undefined ? positive : data[data.length - 1] >= data[0];
  const color = isUp ? '#00C49A' : '#E74C3C';
  const fillColor = isUp ? '#00C49A25' : '#E74C3C25';

  const lastPt = pts[pts.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Zone remplie sous la courbe */}
      <path d={fillD} fill={fillColor} />
      {/* Ligne courbe */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Point final */}
      <circle cx={lastPt.x} cy={lastPt.y} r="2.5" fill={color} />
    </svg>
  );
}