export function DonutChart({ segments }: { segments: { pct: number; color: string }[] }) {
  const R = 70;
  const CX = 90;
  const CY = 90;
  const circumference = 2 * Math.PI * R;
  const gap = 3; // degrees gap between segments

  let offset = 0;
  const paths: ReactElement[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dashLen = (seg.pct / 100) * circumference - (gap / 360) * circumference;
    if (dashLen <= 0) { offset += (seg.pct / 100) * circumference; continue; }

    paths.push(
      <circle
        key={i}
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={seg.color}
        strokeWidth={20}
        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
        strokeDashoffset={-offset + circumference / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    );
    offset += (seg.pct / 100) * circumference;
  }

  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={20} />
      {paths}
    </svg>
  );
}
