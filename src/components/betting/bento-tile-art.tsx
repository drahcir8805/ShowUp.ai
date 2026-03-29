import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Decorative calendar — month sheet + grid (Active Classes tile). */
export function CalendarBentoArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect
        x="24"
        y="36"
        width="172"
        height="148"
        rx="14"
        className="fill-white/50 stroke-purple-400/50"
        strokeWidth="2"
      />
      <path
        d="M24 64h172"
        className="stroke-purple-400/45"
        strokeWidth="2"
      />
      <rect x="44" y="20" width="10" height="28" rx="3" className="fill-purple-500/35" />
      <rect x="166" y="20" width="10" height="28" rx="3" className="fill-purple-500/35" />
      <rect x="84" y="42" width="52" height="10" rx="3" className="fill-purple-400/40" />
      {Array.from({ length: 42 }, (_, i) => {
        const row = Math.floor(i / 7);
        const col = i % 7;
        return (
          <circle
            key={i}
            cx={48 + col * 22}
            cy={88 + row * 18}
            r="3.5"
            className={
              row === 2 && col === 3
                ? "fill-pink-500/55"
                : "fill-purple-300/35"
            }
          />
        );
      })}
    </svg>
  );
}

/** Coins + bill stack (Total Bankroll tile). */
export function BankrollBentoArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <ellipse cx="110" cy="148" rx="72" ry="18" className="fill-amber-600/25" />
      <ellipse cx="110" cy="132" rx="72" ry="18" className="fill-amber-500/35" />
      <ellipse cx="110" cy="116" rx="72" ry="18" className="fill-amber-400/45" />
      <rect
        x="56"
        y="52"
        width="108"
        height="72"
        rx="8"
        className="fill-white/55 stroke-amber-700/30"
        strokeWidth="2"
      />
      <path
        d="M110 68v40M92 88h36"
        className="stroke-amber-700/40"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="110" cy="44" r="22" className="fill-[var(--accent)]/35 stroke-[var(--accent)]/50" strokeWidth="2" />
      <text
        x="110"
        y="52"
        textAnchor="middle"
        fill="rgba(74,74,74,0.65)"
        style={{ fontSize: 18, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
      >
        $
      </text>
    </svg>
  );
}

/** New class / add sheet (Insert Class tile). */
export function InsertClassBentoArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect
        x="44"
        y="32"
        width="132"
        height="152"
        rx="12"
        className="fill-white/55 stroke-emerald-500/40"
        strokeWidth="2"
      />
      <path
        d="M64 72h92M64 96h72M64 120h92"
        className="stroke-emerald-600/25"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="150"
        cy="150"
        r="36"
        className="fill-emerald-500/45 stroke-white/80"
        strokeWidth="3"
      />
      <path
        d="M150 132v36M132 150h36"
        className="stroke-white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Analytics bars + trend (View AI Report tile). */
export function AnalyticsBentoArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect
        x="32"
        y="40"
        width="156"
        height="120"
        rx="10"
        className="fill-white/45 stroke-cyan-500/35"
        strokeWidth="2"
      />
      <path
        d="M52 128 V88 M82 128 V64 M112 128 V96 M142 128 V52 M172 128 V72"
        className="stroke-cyan-600/40"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M52 118 Q92 72 112 88 T172 48"
        className="stroke-blue-500/50"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="172" cy="48" r="6" className="fill-blue-500/60" />
    </svg>
  );
}

type LayerProps = {
  gradient: string;
  children: ReactNode;
};

/** Full-bleed gradient + positioned art for BentoCard `background` slot. */
export function BentoTileArtLayer({ gradient, children }: LayerProps) {
  return (
    <>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden p-4 md:justify-end md:pr-2 md:pt-8">
        <div className="max-h-[min(200px,85%)] max-w-[min(220px,90%)] opacity-[0.92] drop-shadow-sm">
          {children}
        </div>
      </div>
    </>
  );
}
