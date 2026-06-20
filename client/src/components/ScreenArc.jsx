export default function ScreenArc() {
  return (
    <div className="flex flex-col items-center pt-4 pb-2">
      <svg width="280" height="40" viewBox="0 0 280 40" fill="none">
        <path
          d="M10 35 Q140 5 270 35"
          stroke="url(#arcGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#7B61FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#7B61FF" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
      {/* Glow reflection */}
      <div className="w-[200px] h-1.5 rounded-full bg-purple/20 blur-sm -mt-1" />
      <span className="text-[10px] font-semibold text-white/40 tracking-[0.2em] uppercase mt-1.5">
        SCREEN
      </span>
    </div>
  );
}
