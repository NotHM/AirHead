import React, { useState } from 'react';
import {
  CANONICAL_7_WEAPONS_PROGRESSION,
  CanonicalWeaponBlueprintSpec,
  INITIAL_MERCH_CATALOG,
  MerchAndMarketingItemSpec,
  PersistentRoadmapMapNode,
  StudioDepartmentId,
  getCanonicalWeaponByProgressionId,
  loadPersistentRoadmapNodes,
  runDivideAndConquerRoadmapPass,
  savePersistentRoadmapNodes,
} from '../game/canonicalProgressionAndBlueprints';
import {
  ELON_FIVE_STEP_ALGORITHM,
  ElonAlgoVersionState,
} from '../game/hermesVertexOrchestratorAndElonAlgo';
import {
  runFullGamePlaytestAndPartQualityAudit,
  type FullGamePlaytestAndAuditReport,
} from '../game/fullWeaponPlaytestAndPartAudit';
import { PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS } from '../game/elonReverseEngineeringRoadmaps';

interface GameDevAndMarketingRoadmapViewProps {
  elonVersionState?: ElonAlgoVersionState;
  onRunElonVersionUpgrade?: () => void;
  onResolveHitlWebhook?: (
    approvalId: string,
    decision: 'APPROVED_WEBHOOK_RECEIVED' | 'REJECTED_BY_HUMAN'
  ) => void;
  onEquipCanonicalGun: (gunSpec: CanonicalWeaponBlueprintSpec) => void;
  onOpenBlueprintForGun: (gunSpec: CanonicalWeaponBlueprintSpec) => void;
  onCloseView?: () => void;
}

type StudioSubTab =
  | 'INTERACTIVE_MAP_ROADMAP'
  | 'ELON_PER_GUN_ROADMAPS'
  | 'GAME_DEV_DEPARTMENT'
  | 'MARKETING_AND_MERCH_DEPARTMENT'
  | 'FULL_PLAYTEST_AND_PART_AUDIT';

export const GameDevAndMarketingRoadmapView: React.FC<
  GameDevAndMarketingRoadmapViewProps
> = ({
  elonVersionState,
  onRunElonVersionUpgrade,
  onResolveHitlWebhook,
  onEquipCanonicalGun,
  onOpenBlueprintForGun,
  onCloseView,
}) => {
  const [subTab, setSubTab] = useState<StudioSubTab>('INTERACTIVE_MAP_ROADMAP');
  const [roadmapNodes, setRoadmapNodes] = useState<PersistentRoadmapMapNode[]>(() =>
    loadPersistentRoadmapNodes()
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_gd_01_pen');
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | StudioDepartmentId>('ALL');
  const [merchCatalog, setMerchCatalog] =
    useState<MerchAndMarketingItemSpec[]>(INITIAL_MERCH_CATALOG);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [playtestReport, setPlaytestReport] =
    useState<FullGamePlaytestAndAuditReport>(() =>
      runFullGamePlaytestAndPartQualityAudit()
    );
  const [selectedPlaytestGunIdx, setSelectedPlaytestGunIdx] = useState<number>(0);

  const selectedNode =
    roadmapNodes.find((n) => n.nodeId === selectedNodeId) || roadmapNodes[0];

  const handleDivideAndConquerAll = (dept?: StudioDepartmentId | 'ALL') => {
    const res = runDivideAndConquerRoadmapPass(roadmapNodes, dept || 'ALL');
    setRoadmapNodes(res.nextNodes);
    setActionBanner(res.summaryBanner);
    onRunElonVersionUpgrade?.();
  };

  const handleAdvanceSingleNode = (nodeId: string) => {
    const nextNodes = roadmapNodes.map((n) => {
      if (n.nodeId !== nodeId) return n;
      const nextPct = Math.min(100, n.completionPct + 10);
      return {
        ...n,
        completionPct: nextPct,
        status: nextPct >= 100 ? ('COMPLETED' as const) : ('IN_PROGRESS' as const),
        screwsAndOringsAudited: true,
        stlToleranceMm: Math.max(0.002, Number((n.stlToleranceMm - 0.0005).toFixed(4))),
        accomplishedGoalCount: (nextPct >= 100 ? 3 : 2) as 2 | 3,
      };
    });
    savePersistentRoadmapNodes(nextNodes);
    setRoadmapNodes(nextNodes);
    setActionBanner(`Updated & Persisted Node ${nodeId} to LocalStorage.`);
  };

  const handleApproveMerchItem = (itemId: string) => {
    setMerchCatalog((prev) =>
      prev.map((m) =>
        m.itemId === itemId ? { ...m, status: 'LIVE_IN_STORE' } : m
      )
    );
    setActionBanner('Approved Collector Merch SKU via HITL #approvals Gate — Now Live in Store.');
  };

  const gdNodes = roadmapNodes.filter((n) => n.department === 'GAME_DEVELOPMENT');
  const mmNodes = roadmapNodes.filter((n) => n.department === 'MARKETING_AND_MERCH');
  const completedTotal = roadmapNodes.filter((n) => n.status === 'COMPLETED').length;

  return (
    <div className="pointer-events-auto w-full bg-zinc-950/96 border border-zinc-800 rounded-xl p-3.5 font-mono text-xs shadow-2xl flex flex-col gap-3 max-h-[72vh] overflow-y-auto">
      {/* Unified Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
        <div>
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider">
            UNIFIED MULTI-DEPARTMENT OPERATING SYSTEM · PERSISTENT LOCALSTORAGE ROADMAP ({completedTotal}/{roadmapNodes.length} COMPLETED)
          </div>
          <h3 className="text-sm md:text-base font-bold text-zinc-100 font-display">
            Game Development &amp; CAD Physics Division + Marketing &amp; Collector Merch Division
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleDivideAndConquerAll('ALL')}
            className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Divide &amp; Conquer All 7 Guns + Run Daily Cycle ({elonVersionState ? elonVersionState.versionLabel : 'v1.2'})
          </button>
          {onCloseView && (
            <button
              type="button"
              onClick={onCloseView}
              className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] cursor-pointer whitespace-nowrap"
            >
              Return to 3D Stage
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              [
                'INTERACTIVE_MAP_ROADMAP',
                '01. Interactive Persistent Map Roadmap (12 Nodes)',
              ],
              [
                'ELON_PER_GUN_ROADMAPS',
                '02. Elon Musk 5-Step Per-Gun Roadmaps (All 8 Guns)',
              ],
              [
                'GAME_DEV_DEPARTMENT',
                '03. Game Development Dept (8 Guns · Screws/O-Rings)',
              ],
              [
                'MARKETING_AND_MERCH_DEPARTMENT',
                '04. Marketing & Merch Dept (1:1 Cutaways · HITL)',
              ],
              [
                'FULL_PLAYTEST_AND_PART_AUDIT',
                '05. Full Playtest & Part-by-Part Agent QA (All 8 Guns)',
              ],
            ] as Array<[StudioSubTab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSubTab(key)}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                subTab === key
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {subTab === 'INTERACTIVE_MAP_ROADMAP' && (
          <div className="flex items-center gap-1">
            {(
              [
                ['ALL', 'All Departments'],
                ['GAME_DEVELOPMENT', 'Game Dev Track'],
                ['MARKETING_AND_MERCH', 'Marketing & Merch Track'],
              ] as const
            ).map(([fKey, fLabel]) => (
              <button
                key={fKey}
                type="button"
                onClick={() => setDepartmentFilter(fKey)}
                className={`px-2 py-1 rounded text-[10px] cursor-pointer whitespace-nowrap ${
                  departmentFilter === fKey
                    ? 'bg-sky-500 text-zinc-950 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {fLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {actionBanner && (
        <div className="bg-emerald-950/60 border border-emerald-500/60 rounded px-3 py-1.5 text-[11px] text-emerald-200 flex items-center justify-between">
          <span>{actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ====================================================================
          SUB-TAB 1: INTERACTIVE PERSISTENT 2D NODE MAP ROADMAP
         ==================================================================== */}
      {subTab === 'INTERACTIVE_MAP_ROADMAP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Interactive 2D Dependency Graph Map (8 cols) */}
          <div className="lg:col-span-8 bg-zinc-900/70 border border-zinc-800 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
              <span>
                Click any node on the persistent map to inspect SMART goals, screw/O-ring status, or equip the weapon:
              </span>
              <span className="text-emerald-400">
                Upper Track: Game Dev (GD-01..07) · Lower Track: Marketing &amp; Merch (MM-01..04)
              </span>
            </div>

            <svg
              viewBox="0 0 1000 375"
              className="w-full h-64 bg-zinc-950 rounded-lg border border-zinc-800"
            >
              <defs>
                <pattern
                  id="roadmap-map-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="1000" height="375" fill="url(#roadmap-map-grid)" />

              {/* Track Swimlane Labels */}
              <text
                x="18"
                y="32"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                DEPARTMENT 01 // GAME DEVELOPMENT, WEAPON BLUEPRINTS, SCREWS &amp; O-RINGS (PROGRESSION #01 → #07)
              </text>
              <line x1="15" y1="195" x2="985" y2="195" stroke="#27272a" strokeWidth="1.5" strokeDasharray="6 4" />
              <text
                x="18"
                y="222"
                fill="#f59e0b"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                DEPARTMENT 02 // MARKETING, COMMUNITY DEVLOGS &amp; COLLECTOR CUTAWAY MERCH DROPS
              </text>

              {/* Dependency Edges */}
              {roadmapNodes.map((node) =>
                node.dependsOnNodeIds.map((depId) => {
                  const parent = roadmapNodes.find((p) => p.nodeId === depId);
                  if (!parent) return null;
                  const isDone = parent.status === 'COMPLETED' && node.status === 'COMPLETED';
                  return (
                    <line
                      key={`${parent.nodeId}->${node.nodeId}`}
                      x1={parent.mapX}
                      y1={parent.mapY}
                      x2={node.mapX}
                      y2={node.mapY}
                      stroke={isDone ? '#10b981' : '#52525b'}
                      strokeWidth={isDone ? '2.5' : '1.8'}
                      strokeDasharray={isDone ? undefined : '4 3'}
                    />
                  );
                })
              )}

              {/* Interactive Map Nodes */}
              {roadmapNodes.map((node) => {
                const isSelected = node.nodeId === selectedNode.nodeId;
                const isFilteredOut =
                  departmentFilter !== 'ALL' && node.department !== departmentFilter;
                const strokeColor =
                  node.status === 'COMPLETED'
                    ? '#10b981'
                    : node.department === 'GAME_DEVELOPMENT'
                    ? '#38bdf8'
                    : '#f59e0b';

                return (
                  <g
                    key={node.nodeId}
                    onClick={() => setSelectedNodeId(node.nodeId)}
                    className="cursor-pointer"
                    opacity={isFilteredOut ? 0.25 : 1}
                  >
                    <rect
                      x={node.mapX - 54}
                      y={node.mapY - 32}
                      width="108"
                      height="64"
                      rx="8"
                      fill={isSelected ? '#18181b' : '#09090b'}
                      stroke={isSelected ? '#facc15' : strokeColor}
                      strokeWidth={isSelected ? '3' : '1.8'}
                    />
                    <text
                      x={node.mapX}
                      y={node.mapY - 14}
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {node.code} · {node.completionPct}%
                    </text>
                    <text
                      x={node.mapX}
                      y={node.mapY + 2}
                      textAnchor="middle"
                      fill="#f4f4f5"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono"
                    >
                      {node.title.split(':')[0]}
                    </text>
                    <text
                      x={node.mapX}
                      y={node.mapY + 18}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="7.5"
                      fontFamily="JetBrains Mono"
                    >
                      ±{node.stlToleranceMm}mm · {node.accomplishedGoalCount}/3 SMART
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Elon's 5-Step Algorithm Compact Strip */}
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {ELON_FIVE_STEP_ALGORITHM.map((st) => (
                <div
                  key={st.stepNumber}
                  className="bg-zinc-950/90 border border-zinc-800 rounded p-1.5 text-[10px]"
                >
                  <div className="text-amber-400 font-bold truncate">
                    Step {st.stepNumber}: {st.title}
                  </div>
                  <div className="text-zinc-400 text-[9px] truncate mt-0.5">
                    {st.principle}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Roadmap Node Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-zinc-900/75 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase">
                  {selectedNode.code} · {selectedNode.department.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {selectedNode.completionPct}% ({selectedNode.status})
                </span>
              </div>

              <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                {selectedNode.title}
              </h4>

              <div className="text-[10px] text-sky-300">
                Owner: {selectedNode.assignedAgentName}
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-950/80 border border-zinc-800 rounded p-2">
                {selectedNode.deliverableSummary}
              </p>

              {/* 3 SMART Goals (Accomplish 2+ Every Run) */}
              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  3 SMART Goals ({selectedNode.accomplishedGoalCount}/3 Accomplished):
                </div>
                <div className="space-y-1">
                  {selectedNode.smartGoals.map((goal, idx) => {
                    const done = idx < selectedNode.accomplishedGoalCount;
                    return (
                      <div
                        key={idx}
                        className={`p-1.5 rounded border text-[10px] ${
                          done
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="font-bold mr-1">
                          {done ? '[DONE]' : '[ACTIVE]'}
                        </span>
                        {goal}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2.5 mt-2 border-t border-zinc-800 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAdvanceSingleNode(selectedNode.nodeId)}
                className="flex-1 py-1.5 px-2.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer"
              >
                Task Agent: Advance Node (+10%)
              </button>
              {selectedNode.linkedGunId && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onEquipCanonicalGun(
                        getCanonicalWeaponByProgressionId(selectedNode.linkedGunId!)
                      )
                    }
                    className="py-1.5 px-2.5 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
                  >
                    Equip Gun
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenBlueprintForGun(
                        getCanonicalWeaponByProgressionId(selectedNode.linkedGunId!)
                      )
                    }
                    className="py-1.5 px-2.5 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                  >
                    View Blueprint
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-TAB 2: GAME DEVELOPMENT & CAD PHYSICS DEPARTMENT
         ==================================================================== */}
      {subTab === 'GAME_DEV_DEPARTMENT' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5">
            <div>
              <div className="text-xs font-bold text-sky-400">
                Game Development Division: 7-Weapon Divide &amp; Conquer Assignment Matrix
              </div>
              <div className="text-[10px] text-zinc-400">
                Default progression order: #01 Pen Gun / #02 REX-P → #03 Defender .50 → #04 Leshiy → #05 MP30 → #06 P50 Air Rifle → #07 .45 Ascent 300B
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDivideAndConquerAll('GAME_DEVELOPMENT')}
              className="px-3 py-1.5 rounded bg-sky-500 text-zinc-950 font-bold text-[11px] hover:bg-sky-400 cursor-pointer"
            >
              Run Game Dev Divide &amp; Conquer Pass
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {CANONICAL_7_WEAPONS_PROGRESSION.map((gun) => {
              const matchingNode = gdNodes.find((n) => n.linkedGunId === gun.progressionId);
              return (
                <div
                  key={gun.progressionId}
                  className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
                      <span>TIER {gun.tierOrder}</span>
                      <span>
                        {matchingNode ? `${matchingNode.completionPct}% Ready` : '100% Ready'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-100 mt-0.5">
                      {gun.shortTitle}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {gun.imperialCaliberLabel} · {gun.operatingPressureBar} Bar · {gun.muzzleEnergyJoules} J
                    </div>
                    <div className="mt-1.5 text-[10px] text-emerald-300">
                      Screws: {gun.screwsAndFasteners.length} Specs · O-Rings: {gun.oringPlacements.length} Glands
                    </div>
                    <div className="text-[9.5px] text-zinc-400 mt-1 line-clamp-3">
                      {gun.functionalCycleSummary}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => onEquipCanonicalGun(gun)}
                      className="flex-1 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
                    >
                      Equip in 3D
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenBlueprintForGun(gun)}
                      className="flex-1 py-1 rounded bg-zinc-800 text-sky-300 hover:bg-sky-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer"
                    >
                      Screws &amp; O-Rings
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily /schedule Self-Maintaining PR Conveyor Summary */}
          {elonVersionState && (
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5">
              <div className="text-[11px] font-bold text-emerald-400 mb-1.5">
                Daily /schedule Self-Maintaining Codebase &amp; CAD PR Conveyor ({elonVersionState.dailyCyclesCompletedToday} Cycles Run Today)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {elonVersionState.selfMaintainingRoutines.map((rt) => (
                  <div
                    key={rt.id}
                    className="bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px]"
                  >
                    <div className="text-amber-300 font-bold">{rt.truckBadgeLabel}</div>
                    <div className="text-zinc-200 font-semibold mt-0.5">{rt.title}</div>
                    <div className="text-zinc-400 text-[9.5px] mt-0.5">
                      {rt.dailyPrSummary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          SUB-TAB 3: MARKETING, COMMUNITY & COLLECTOR MERCH DEPARTMENT
         ==================================================================== */}
      {subTab === 'MARKETING_AND_MERCH_DEPARTMENT' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5">
            <div>
              <div className="text-xs font-bold text-amber-400">
                Marketing, Community Devlog &amp; Physical Collector Merch Department
              </div>
              <div className="text-[10px] text-zinc-400">
                Turns each weapon’s custom CAD blueprint, screw schedule &amp; 5-step cutaway into collector physical models and viral physics devlogs
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDivideAndConquerAll('MARKETING_AND_MERCH')}
              className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-[11px] hover:bg-amber-400 cursor-pointer"
            >
              Run Marketing &amp; Merch Campaign Pass
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {merchCatalog.map((item) => (
              <div
                key={item.itemId}
                className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-bold">
                      {item.skuCode} · {item.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={
                        item.status === 'LIVE_IN_STORE'
                          ? 'text-emerald-400 font-bold'
                          : 'text-sky-300 font-bold'
                      }
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-zinc-100 mt-1">{item.title}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">{item.specSummary}</div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] tabular-nums">
                  <div className="text-zinc-300">
                    Unit BOM: <span className="text-zinc-100">${item.unitCostUsd.toFixed(2)}</span> · Retail:{' '}
                    <span className="text-emerald-400 font-bold">${item.retailPriceUsd.toFixed(2)}</span> · Margin:{' '}
                    <span className="text-amber-300 font-bold">{item.grossMarginPct}%</span>
                  </div>
                  {item.status !== 'LIVE_IN_STORE' && (
                    <button
                      type="button"
                      onClick={() => handleApproveMerchItem(item.itemId)}
                      className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 cursor-pointer"
                    >
                      Approve SKU (#approvals)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Marketing Roadmap Nodes & Hermes Approval Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5">
              <div className="text-[11px] font-bold text-sky-400 mb-1.5">
                Marketing &amp; Merch Milestones ({mmNodes.length})
              </div>
              <div className="space-y-1.5">
                {mmNodes.map((n) => (
                  <div
                    key={n.nodeId}
                    className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-zinc-100">
                        {n.code}: {n.title}
                      </div>
                      <div className="text-[9.5px] text-zinc-400">{n.assignedAgentName}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                      {n.completionPct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5">
              <div className="text-[11px] font-bold text-amber-400 mb-1.5">
                Hermes Mandatory HITL #approvals Gate (External Quotes &amp; Merch Runs)
              </div>
              <div className="space-y-1.5">
                {(elonVersionState?.hitlApprovalQueue || []).slice(0, 3).map((card) => (
                  <div
                    key={card.approvalId}
                    className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2 text-[10px]"
                  >
                    <div>
                      <div className="font-bold text-zinc-100">
                        {card.clientName} — ${card.totalQuoteValueUsd.toLocaleString()}
                      </div>
                      <div className="text-zinc-400">
                        Status: {card.webhookStatus} · Sim: {card.wonDealSimilarityScorePct}%
                      </div>
                    </div>
                    {card.webhookStatus === 'PENDING_HUMAN_SIGN_OFF' && onResolveHitlWebhook && (
                      <button
                        type="button"
                        onClick={() =>
                          onResolveHitlWebhook(
                            card.approvalId,
                            'APPROVED_WEBHOOK_RECEIVED'
                          )
                        }
                        className="px-2 py-1 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer shrink-0"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-TAB 4: FULL PLAYTEST & PART-BY-PART AGENT QUALITY AUDIT
         ==================================================================== */}
      {subTab === 'FULL_PLAYTEST_AND_PART_AUDIT' && (
        <div className="space-y-2.5">
          <div className="bg-zinc-900/80 border border-emerald-500/40 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase">
                AUTOMATED FULL PLAYTEST &amp; PART-BY-PART AGENT QUALITY HARNESS · {playtestReport.totalWeaponsPlaytested}/8 GUNS VERIFIED
              </div>
              <div className="text-xs text-zinc-200 mt-0.5">
                Fired <span className="text-amber-300 font-bold">{playtestReport.totalShotsFiredAcrossAllGuns}</span> rounds across all 8 guns · Inspected <span className="text-sky-300 font-bold">{playtestReport.totalPartsScrewsOringsInspected}</span> Parts, Screws &amp; O-Rings · Zero Floating CAD Gaps: <span className="text-emerald-400 font-bold">{playtestReport.allWeaponsCenteredAndContiguous ? 'PASS (100%)' : 'CHECKING'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const fresh = runFullGamePlaytestAndPartQualityAudit();
                setPlaytestReport(fresh);
                setActionBanner(
                  `Re-ran Full Playtest across all ${fresh.totalWeaponsPlaytested} guns (${fresh.totalShotsFiredAcrossAllGuns} shots fired, ${fresh.totalPartsScrewsOringsInspected} parts/screws/O-rings verified by agents).`
                );
              }}
              className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-[11px] hover:bg-amber-400 cursor-pointer"
            >
              ▶ Re-Run Full Playtest &amp; Agent Part Audit
            </button>
          </div>

          {/* Gun Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {playtestReport.weaponReports.map((w, idx) => (
              <button
                key={w.gunId}
                type="button"
                onClick={() => setSelectedPlaytestGunIdx(idx)}
                className={`px-2.5 py-1 rounded border text-[10px] cursor-pointer ${
                  selectedPlaytestGunIdx === idx
                    ? 'bg-sky-500 text-zinc-950 border-sky-300 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-sky-400'
                }`}
              >
                {w.shortTitle} ({w.totalPartsInspected} Parts · {w.averageQualityScoreAfter}%)
              </button>
            ))}
          </div>

          {/* Selected Gun Playtest & Part-by-Part Agent Assignment Table */}
          {(() => {
            const activeW =
              playtestReport.weaponReports[selectedPlaytestGunIdx] ||
              playtestReport.weaponReports[0];
            return (
              <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                  <div>
                    <div className="text-xs font-bold text-zinc-100">{activeW.fullTitle}</div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">
                      {activeW.realSpecComplianceSummary}
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-zinc-300 shrink-0">
                    <div>
                      Playtest Shots Fired: <span className="text-amber-300 font-bold">{activeW.shotsFiredInPlaytest}/{activeW.magazineCapacity} Rds</span>
                    </div>
                    <div>
                      3D Center [X,Y,Z]: <span className="text-sky-300 font-bold">[{activeW.assembledGeometricCenterM.x}, {activeW.assembledGeometricCenterM.y}, {activeW.assembledGeometricCenterM.z}]m</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {activeW.partAgentAssignments.map((item) => (
                    <div
                      key={`${item.gunId}-${item.itemCode}`}
                      className="p-2 rounded bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-1 text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-amber-300">
                          [{item.itemCategory.replace(/_/g, ' ')}] {item.itemCode}: {item.itemName}
                        </span>
                        <span className="text-emerald-400 font-bold shrink-0">
                          {item.qualityScoreBefore}% → {item.qualityScoreAfter}%
                        </span>
                      </div>
                      <div className="text-sky-300 font-semibold">
                        Agent: {item.assignedAgentName}
                      </div>
                      <div className="text-zinc-400">{item.qualityFixApplied}</div>
                      <div className="text-[9.5px] text-zinc-500">
                        Spec Metric: {item.specVerificationMetric}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ====================================================================
          SUB-TAB 5: ELON MUSK 5-STEP PER-GUN REVERSE-ENGINEERING ROADMAPS
         ==================================================================== */}
      {subTab === 'ELON_PER_GUN_ROADMAPS' && (
        <div className="space-y-2.5">
          <div className="bg-zinc-900/80 border border-amber-500/40 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase">
                HOW ELON MUSK TASKS AGENTS TO REVERSE-ENGINEER ALL 8 GUNS TO 100% SPEC OR BETTER
              </div>
              <div className="text-xs text-zinc-200 mt-0.5">
                Every weapon has a dedicated 5-Step First-Principles Roadmap: <span className="text-amber-300 font-bold">1. Question Spec &amp; Factory Teardown</span> → <span className="text-red-300 font-bold">2. Delete Obsolete Parts</span> → <span className="text-sky-300 font-bold">3. Simplify &amp; Optimize Sub-mm Tolerance</span> → <span className="text-emerald-300 font-bold">4. Accelerate Valve &amp; Cycle Physics</span> → <span className="text-purple-300 font-bold">5. Automate CNC/.STL &amp; Playtest Verification</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
            {Object.values(PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS).map((rm) => {
              const gunSpec = getCanonicalWeaponByProgressionId(rm.gunId);
              return (
                <div
                  key={rm.gunId}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{rm.gunFullTitle}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          Spec: {rm.specAccuracyPct}% ({rm.blueprintCode})
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-200/90 mt-0.5">
                        {rm.elonExecutiveDirective}
                      </div>
                      <div className="text-[10px] text-sky-300 mt-0.5">
                        Interactive State: {rm.uniqueInteractiveStateSummary}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEquipCanonicalGun(gunSpec)}
                        className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer"
                      >
                        Equip in 3D
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenBlueprintForGun(gunSpec)}
                        className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                      >
                        Inspect Blueprint
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {rm.milestones.map((m) => (
                      <div
                        key={m.stepNumber}
                        className="bg-zinc-950/90 border border-zinc-800 rounded p-2 text-[10px]"
                      >
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>Step {m.stepNumber}</span>
                          <span className="text-emerald-400 text-[9px]">{m.completionPct}%</span>
                        </div>
                        <div className="text-zinc-200 font-semibold mt-0.5">{m.elonPrincipleLabel}</div>
                        <div className="text-sky-300 text-[9.5px] mt-0.5">{m.assignedAgentName}</div>
                        <div className="text-zinc-400 text-[9.5px] mt-1">{m.reverseEngineeredSolution}</div>
                        <div className="text-emerald-300/90 text-[9px] mt-1 border-t border-zinc-800 pt-1">
                          {m.subMillimeterSpecVerification}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
