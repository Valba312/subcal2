export default function Logo({ withText=false }: { withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(262 83% 58%)"/><stop offset="100%" stopColor="hsl(189 92% 48%)"/>
          </linearGradient>
        </defs>
        <path fill="url(#g)" d="M4 7c0-2.2 2-4 5-4h6a1 1 0 010 2H9c-1.7 0-3 .9-3 2s1.3 2 3 2h6c3 0 5 1.8 5 4s-2 4-5 4H9a1 1 0 010-2h6c1.7 0 3-.9 3-2s-1.3-2-3-2H9C6 9 4 8 4 7z"/>
      </svg>
      {withText && <span className="font-extrabold text-lg tracking-tight">SubKeeper</span>}
    </div>
  );
}
