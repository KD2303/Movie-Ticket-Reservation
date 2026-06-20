export default function ScreenArc() {
  return (
    <div className="flex flex-col items-center pt-3 pb-3 bg-white">
      <svg width="280" height="30" viewBox="0 0 280 30" fill="none">
        <path
          d="M10 25 Q140 5 270 25"
          stroke="url(#arcGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5F33E1" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#5F33E1" stopOpacity="1" />
            <stop offset="100%" stopColor="#5F33E1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[10px] font-bold text-gray-300 tracking-[0.25em] uppercase mt-1">
        SCREEN
      </span>
    </div>
  );
}
