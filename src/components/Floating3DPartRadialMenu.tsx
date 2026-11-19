import React from 'react';

export interface RadialQuickMenuActionNode {
  id: string;
  angleDeg: number;
  shortLabel: string;
  subLabel: string;
  accentColor: 'amber' | 'cyan' | 'emerald' | 'fuchsia' | 'rose' | 'sky';
  onTrigger: () => void;
}

interface Floating3DPartRadialMenuProps {
  visible: boolean;
  anchorXPercent?: number;
  anchorYPercent?: number;
  partCode: string;
  partTitle: string;
  materialAndMassBadge: string;
  safetyAndToleranceBadge: string;
  delegationStatusBadge?: string;
  nodes: RadialQuickMenuActionNode[];
  onClose: () => void;
}

const ACCENT_CLASSES: Record<
  RadialQuickMenuActionNode['accentColor'],
  string
> = {
  amber:
    'bg-zinc-950 border-amber-400 text-amber-200 hover:bg-amber-500 hover:text-zinc-950',
  cyan: 'bg-zinc-950 border-cyan-400 text-cyan-200 hover:bg-cyan-500 hover:text-zinc-950',
  emerald:
    'bg-zinc-950 border-emerald-400 text-emerald-200 hover:bg-emerald-500 hover:text-zinc-950',
  fuchsia:
    'bg-zinc-950 border-fuchsia-400 text-fuchsia-200 hover:bg-fuchsia-500 hover:text-zinc-950',
  rose: 'bg-zinc-950 border-rose-400 text-rose-200 hover:bg-rose-500 hover:text-zinc-950',
  sky: 'bg-zinc-950 border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950',
};

export const Floating3DPartRadialMenu: React.FC<Floating3DPartRadialMenuProps> = ({
  visible,
  anchorXPercent = 50,
  anchorYPercent = 46,
  partCode,
  partTitle,
  materialAndMassBadge,
  safetyAndToleranceBadge,
  delegationStatusBadge,
  nodes,
  onClose,
}) => {
  if (!visible) return null;

  const clampedX = Math.max(22, Math.min(78, anchorXPercent));
  const clampedY = Math.max(26, Math.min(72, anchorYPercent));
  const radiusPx = 118;

  return (
    <div
      data-testid="floating-3d-radial-menu"
      style={{
        left: `${clampedX}%`,
        top: `${clampedY}%`,
      }}
      className="pointer-events-auto absolute z-30 -translate-x-1/2 -translate-y-1/2 select-none font-mono"
    >
      {/* Radial SVG Connector Ring & Spokes */}
      <svg
        width="300"
        height="300"
        viewBox="-150 -150 300 300"
        className="pointer-events-none overflow-visible"
      >
        <circle
          cx="0"
          cy="0"
          r={radiusPx}
          fill="none"
          stroke="rgba(6, 182, 212, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle
          cx="0"
          cy="0"
          r="46"
          fill="rgba(9, 13, 22, 0.94)"
          stroke="rgba(245, 158, 11, 0.75)"
          strokeWidth="1.75"
        />
        {nodes.map((node) => {
          const rad = ((node.angleDeg - 90) * Math.PI) / 180;
          const x2 = Math.cos(rad) * (radiusPx - 18);
          const y2 = Math.sin(rad) * (radiusPx - 18);
          const x1 = Math.cos(rad) * 46;
          const y1 = Math.sin(rad) * 46;
          return (
            <line
              key={node.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(148, 163, 184, 0.45)"
              strokeWidth="1.25"
            />
          );
        })}
      </svg>

      {/* Center Hub: Selected 3D Part Telemetry Readout */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 bg-zinc-950 border border-amber-400/80 rounded-xl px-2.5 py-2 text-center shadow-2xl">
        <div className="flex items-center justify-between gap-1 text-[9px] text-amber-300 font-bold mb-0.5">
          <span className="truncate">{partCode}</span>
          <button
            type="button"
            onClick={onClose}
            title="Close Radial Menu"
            className="px-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="text-[10.5px] font-bold text-zinc-100 truncate">
          {partTitle}
        </div>
        <div className="text-[8.5px] text-cyan-300 mt-0.5 truncate tabular-nums">
          {materialAndMassBadge}
        </div>
        <div className="text-[8.5px] text-emerald-300 truncate tabular-nums">
          {safetyAndToleranceBadge}
        </div>
        {delegationStatusBadge && (
          <div className="text-[8px] text-fuchsia-300 font-bold mt-0.5 truncate">
            {delegationStatusBadge}
          </div>
        )}
      </div>

      {/* Orbiting Radial Quick-Action Nodes */}
      {nodes.map((node) => {
        const rad = ((node.angleDeg - 90) * Math.PI) / 180;
        const offsetX = Math.cos(rad) * radiusPx;
        const offsetY = Math.sin(rad) * radiusPx;
        return (
          <button
            key={node.id}
            type="button"
            data-testid={`radial-node-${node.id}`}
            onClick={node.onTrigger}
            style={{
              transform: `translate(calc(-50% + ${Math.round(offsetX)}px), calc(-50% + ${Math.round(offsetY)}px))`,
            }}
            className={`absolute left-1/2 top-1/2 px-2.5 py-1.5 rounded-lg border text-left shadow-xl transition-transform hover:scale-105 cursor-pointer whitespace-nowrap ${
              ACCENT_CLASSES[node.accentColor]
            }`}
          >
            <div className="text-[10px] font-bold leading-tight">
              {node.shortLabel}
            </div>
            <div className="text-[8.5px] opacity-80 leading-tight tabular-nums">
              {node.subLabel}
            </div>
          </button>
        );
      })}
    </div>
  );
};
