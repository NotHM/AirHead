import React, { useState } from 'react';
import { WeaponBuildLoadout, computeWeaponStats, PRESET_LOADOUTS } from '../game/partsCatalog';
import { FourZonePneumaticState } from '../wasm/pneumaticWasm';
import { GeneratedArenaMap } from '../game/rules';
import {
  SurvivorPrintInventory,
  POPULAR_25_AIRGUNS,
  SavedWeaponVersion,
} from '../game/popular25Catalog';
import {
  ASCENT_45_300BAR_12_PARTS_CATALOG,
  Ascent45PartSpec,
} from '../game/weaponFamiliesAndCompatibility';
import {
  CANONICAL_7_WEAPONS_PROGRESSION,
  BlueprintUniquePartNode,
  computeVersionEvolvedBlueprintAccuracy,
  MULTI_AGENT_GUN_REVIEW_REPORTS,
} from '../game/canonicalProgressionAndBlueprints';
import { FIVE_STEP_COMPRESSION_TO_FIRE_CYCLE } from './HighMagPartAndAirflowInspector';
import {
  ElonAlgoVersionState,
  PART_LIST_COMPLETION_AGENT_SQUAD,
  MAIN_SCREEN_BLUEPRINT_AGENT_SQUAD,
  ComputeBudgetTierId,
  buildComputeBudgetDailyAndWeeklySmartPlan,
} from '../game/hermesVertexOrchestratorAndElonAlgo';
import { synthesizeUniqueBenchmarkComponentAsset } from '../game/interactiveModelBenchmarks';
import { generateAutomatedEngineeringBlueprintSpec } from '../game/automatedBlueprintGenerator';

export type GameShellState =
  | 'title'
  | 'workbench'
  | 'range'
  | 'printer_room'
  | 'playing'
  | 'paused'
  | 'gameover';

interface GameHudAndModalsProps {
  shellState: GameShellState;
  loadout: WeaponBuildLoadout;
  pneumaticState: FourZonePneumaticState;
  arenaMap: GeneratedArenaMap;
  inventory: SurvivorPrintInventory;
  playerPos: { x: number; z: number; yaw: number };
  playerHp: number;
  maxPlayerHp: number;
  score: number;
  bestScore: number;
  wave: number;
  clearTimeSec: number;
  isVictory: boolean;
  muted: boolean;
  statusMessage: string;
  hitMarkerActive: boolean;
  savedVersions?: SavedWeaponVersion[];
  activeVersionId?: string;
  onSelectSavedVersion?: (ver: SavedWeaponVersion) => void;
  elonVersionState?: ElonAlgoVersionState;
  onRunElonVersionUpgrade?: () => void;
  onOpenHermesModal?: () => void;
  onPumpAscentTo300Bar?: (mode: 'SINGLE_3STAGE_STROKE' | 'FULL_300BAR_PUMP_UP') => void;
  onStartGame: () => void;
  onOpenWorkbench: () => void;
  onOpenRange: () => void;
  onOpenPrinterRoom?: () => void;
  onSelectPreset: (preset: WeaponBuildLoadout) => void;
  onRerollMapSeed: () => void;
  onResumeGame: () => void;
  onPauseGame: () => void;
  onRestartGame: () => void;
  onReturnToTitle: () => void;
  onToggleMute: () => void;
  onFireWeapon: () => void;
  onReloadMagazine: () => void;
  onToggleForegripCamLock: () => void;
  onPumpStroke: (dir: 'PULL' | 'PUSH') => void;
  onCycleOneWayTarget: () => void;
  graphicsModeBadge?: string;
  isRetroGraphics?: boolean;
  onToggleGraphicsMode?: () => void;
  onOpenCadReferencesModal?: () => void;
  onAutoGenerateFutureBlueprintVersion?: (customLabel: string) => void;
}

export const GameHudAndModals: React.FC<GameHudAndModalsProps> = ({
  shellState,
  loadout,
  pneumaticState,
  arenaMap,
  inventory,
  playerPos,
  playerHp,
  maxPlayerHp,
  score,
  bestScore,
  wave,
  clearTimeSec,
  isVictory,
  muted,
  statusMessage,
  hitMarkerActive,
  savedVersions,
  activeVersionId,
  onSelectSavedVersion,
  elonVersionState,
  onRunElonVersionUpgrade,
  onPumpAscentTo300Bar,
  onStartGame,
  onOpenWorkbench,
  onOpenRange,
  onOpenPrinterRoom,
  onSelectPreset,
  onRerollMapSeed,
  onResumeGame,
  onPauseGame,
  onRestartGame,
  onReturnToTitle,
  onToggleMute,
  onFireWeapon,
  onReloadMagazine,
  onToggleForegripCamLock,
  onPumpStroke,
  onCycleOneWayTarget,
  graphicsModeBadge,
  isRetroGraphics,
  onToggleGraphicsMode,
  onOpenCadReferencesModal,
  onAutoGenerateFutureBlueprintVersion,
}) => {
  const stats = computeWeaponStats(loadout);
  const [titleAirStepIdx, setTitleAirStepIdx] = useState<number>(2);
  const [titlePartNum, setTitlePartNum] = useState<number>(1);
  const [downloadedPartCode, setDownloadedPartCode] = useState<string | null>(null);
  const [minimizeTitleBlueprint, setMinimizeTitleBlueprint] = useState<boolean>(false);
  const [showAgentSquadsDrawer, setShowAgentSquadsDrawer] = useState<boolean>(false);
  const [activeAgentSquadView, setActiveAgentSquadView] = useState<
    'DAILY_WEEKLY_SMART_BUDGET' | 'PART_LIST_SQUAD' | 'BLUEPRINT_SQUAD'
  >('DAILY_WEEKLY_SMART_BUDGET');
  const [computeBudgetTier, setComputeBudgetTier] = useState<ComputeBudgetTierId>(
    'BALANCED_1B_4B_SWARM'
  );
  const [customVramGb, setCustomVramGb] = useState<number>(6);
  const [customGpuMinutesPerDay, setCustomGpuMinutesPerDay] = useState<number>(60);

  const activeSavedVersionObj =
    savedVersions?.find((v) => v.versionId === activeVersionId) ||
    savedVersions?.[0];
  const canonicalMatch = CANONICAL_7_WEAPONS_PROGRESSION.find(
    (g) => g.versionId === activeVersionId
  );
  const selectedMenuGun = canonicalMatch || CANONICAL_7_WEAPONS_PROGRESSION[0];
  const isCustomGeneratedVersion = Boolean(activeSavedVersionObj && !canonicalMatch);

  const automatedBlueprintSpec = activeSavedVersionObj
    ? generateAutomatedEngineeringBlueprintSpec(
        activeSavedVersionObj,
        canonicalMatch
      )
    : null;

  const currentVersionNumber = elonVersionState
    ? Math.max(1, elonVersionState.runCount || elonVersionState.dailyCyclesCompletedToday || 4)
    : 4;
  const menuVersionAccuracy = computeVersionEvolvedBlueprintAccuracy(
    selectedMenuGun,
    currentVersionNumber
  );
  const selectedMenuAgentReview =
    MULTI_AGENT_GUN_REVIEW_REPORTS.find(
      (r) => r.progressionId === selectedMenuGun.progressionId
    ) || MULTI_AGENT_GUN_REVIEW_REPORTS[0];
  const selectedMenuUniquePart: BlueprintUniquePartNode =
    selectedMenuGun.uniqueParts[(titlePartNum - 1) % selectedMenuGun.uniqueParts.length] ||
    selectedMenuGun.uniqueParts[0];

  const computeBudgetSmartPlan = buildComputeBudgetDailyAndWeeklySmartPlan(
    computeBudgetTier,
    customVramGb,
    customGpuMinutesPerDay,
    currentVersionNumber
  );

  const handleDownloadCanonicalPartStlFromTitle = (part: BlueprintUniquePartNode) => {
    const dimsMatch = part.dimensionsMm.match(/(\d+(?:\.\d+)?)/g);
    const lenMm = dimsMatch && dimsMatch[0] ? parseFloat(dimsMatch[0]) : 110;
    const odMm = dimsMatch && dimsMatch[1] ? parseFloat(dimsMatch[1]) : 32;
    const idMm = dimsMatch && dimsMatch[2] ? parseFloat(dimsMatch[2]) : selectedMenuGun.defaultCaliberMm;
    const syntheticSubSpec = {
      partCode: part.partCode,
      name: part.partName,
      steampunkRustAlias: `${selectedMenuGun.shortTitle} ${part.partName}`,
      category: 'PRESSURE_VESSEL_OR_PLENUM' as const,
      materialAndDurometer: part.material,
      dimensionsMm: {
        lengthOrThicknessMm: lenMm,
        outerDiameterMm: odMm,
        innerDiameterMm: idMm,
        wallOrCrossSectionMm: Math.max(2.0, (odMm - idMm) * 0.5),
        toleranceMm: menuVersionAccuracy.machiningToleranceMm,
      },
      svgNodeX: part.pinX,
      svgNodeY: part.pinY,
      photoPinX: 50,
      photoPinY: 50,
      realPhysicsSpec: {
        governingEquation: 'Lamé Thick-Wall Hoop Stress & Real Compressible Isentropic Flow',
        operatingPressureBar: selectedMenuGun.operatingPressureBar,
        squeezeOrClearancePct: '19.5% Viton FKM-90 Radial Gland Squeeze',
        hoopOrShearSafetyFactor: 3.25,
        failureModeIfOmitted: 'Loss of pneumatic containment or breech lock',
      },
      howItWorksWithNeighbors: part.roleDescription,
    };
    const asset = synthesizeUniqueBenchmarkComponentAsset(
      syntheticSubSpec,
      `${selectedMenuGun.fullTitle} (${menuVersionAccuracy.evolvedRevisionTag})`
    );
    setDownloadedPartCode(part.partCode);
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([asset.watertightStlAscii], { type: 'model/stl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${part.partCode.toLowerCase()}_v${currentVersionNumber}_submm.stl`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // ============================================================================
  // 1. UPGRADED MAIN MENU COMMAND DECK + PER-GUN VERSION-PROGRESSIVE BLUEPRINT INSPECTOR
  // ============================================================================
  if (shellState === 'title') {
    const reserveBar = Math.max(
      Math.round(pneumaticState.foregripPressureBar),
      selectedMenuGun.operatingPressureBar
    );
    const plenumBar = Math.max(
      Math.round(pneumaticState.plenumPressureBar),
      Math.round(selectedMenuGun.operatingPressureBar * 0.72)
    );

    return (
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 md:p-6 overflow-y-auto">
        {/* Top Unified Game Development, Graphics Mode & CAD Agent Banner */}
        <div className="pointer-events-auto w-full max-w-[1400px] mx-auto bg-zinc-950/95 border border-amber-500/60 rounded-xl px-3.5 py-2 shadow-xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold">
              {elonVersionState ? elonVersionState.versionLabel : 'v2.4'} · {menuVersionAccuracy.evolvedRevisionTag}
            </span>
            <span className="text-emerald-400 font-bold">
              {selectedMenuGun.shortTitle} Schematic: {menuVersionAccuracy.dimensionalAccuracyPct} Spec ({menuVersionAccuracy.cadMeshFacetCount} Facets)
            </span>
            <span className="text-fuchsia-300 font-bold">
              · Tol: {menuVersionAccuracy.machiningToleranceMm}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono">
            {onToggleGraphicsMode && (
              <button
                type="button"
                onClick={onToggleGraphicsMode}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow transition cursor-pointer ${
                  isRetroGraphics
                    ? 'border-amber-400 bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'border-cyan-400 bg-cyan-950/90 text-cyan-200 hover:bg-cyan-900'
                }`}
                title="Toggle live between Minescript/Doom Retro Voxel Graphics and Photorealistic Studio PBR Graphics [Shortcut: G]"
              >
                {graphicsModeBadge || '✨ Photorealistic PBR Studio'} ⇄ [G]
              </button>
            )}
            {onOpenCadReferencesModal && (
              <button
                type="button"
                onClick={onOpenCadReferencesModal}
                className="rounded-lg border border-emerald-400/80 bg-emerald-950/90 px-2.5 py-1 text-[11px] font-bold text-emerald-200 shadow hover:bg-emerald-900 transition cursor-pointer"
                title="Open /game_references/ folder, inspect caliper dimensions & agent notes, upload files, and run the Expert Reverse-Engineering & Parametric CAD Agent [Shortcut: K]"
              >
                📂 /game_references &amp; CAD Agent [K]
              </button>
            )}
            <button
              type="button"
              data-testid="toggle-agent-squads-drawer"
              onClick={() => setShowAgentSquadsDrawer((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 text-[11px] font-bold hover:bg-amber-500 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {showAgentSquadsDrawer
                ? '▾ Hide SMART Budget & Squads'
                : '🎯 Daily & Weekly SMART Goals (Compute Budget)'}
            </button>
            {onRunElonVersionUpgrade && (
              <button
                type="button"
                onClick={onRunElonVersionUpgrade}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 text-[11px] font-bold hover:bg-emerald-400 transition-colors cursor-pointer shadow"
              >
                🚀 Run 21 Agents (+1 Ver)
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Drawer: Compute-Budget Daily & Weekly SMART Goals + Part Squad + Blueprint CAD Squad */}
        {showAgentSquadsDrawer && (
          <div className="pointer-events-auto w-full max-w-[1400px] mx-auto my-2 bg-zinc-950/95 border-2 border-amber-500/60 rounded-xl p-3.5 shadow-2xl font-mono text-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveAgentSquadView('DAILY_WEEKLY_SMART_BUDGET')}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                    activeAgentSquadView === 'DAILY_WEEKLY_SMART_BUDGET'
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                  }`}
                >
                  🎯 Daily (Mon–Sun) &amp; Weekly (W1–W4) SMART Goals by Compute Budget
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAgentSquadView('PART_LIST_SQUAD')}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                    activeAgentSquadView === 'PART_LIST_SQUAD'
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                  }`}
                >
                  🔩 Part-List Completion Squad (9 Guns)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAgentSquadView('BLUEPRINT_SQUAD')}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                    activeAgentSquadView === 'BLUEPRINT_SQUAD'
                      ? 'bg-sky-500 text-zinc-950'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                  }`}
                >
                  📐 Main-Screen Blueprint CAD Squad (9 Guns)
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentSquadsDrawer(false)}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {activeAgentSquadView === 'DAILY_WEEKLY_SMART_BUDGET' && (
              <div className="space-y-3">
                {/* Compute Budget Controls */}
                <div className="bg-zinc-900/90 border border-amber-500/40 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10.5px] font-bold text-amber-300 uppercase">
                      Compute Budget Profile:
                    </span>
                    {(
                      [
                        ['EDGE_1B_SAVER', 'Eco Edge (1B Only · 2GB VRAM · 20m/day)'],
                        ['BALANCED_1B_4B_SWARM', 'Balanced 1B+4B Swarm (6GB VRAM · 60m/day)'],
                        ['MAX_4B_CLOUD_ARGON', 'Max 4B + Cloud Argon (16GB VRAM · 180m/day)'],
                      ] as Array<[ComputeBudgetTierId, string]>
                    ).map(([tierKey, label]) => (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => {
                          setComputeBudgetTier(tierKey);
                          setCustomVramGb(
                            tierKey === 'EDGE_1B_SAVER'
                              ? 2
                              : tierKey === 'BALANCED_1B_4B_SWARM'
                              ? 6
                              : 16
                          );
                          setCustomGpuMinutesPerDay(
                            tierKey === 'EDGE_1B_SAVER'
                              ? 20
                              : tierKey === 'BALANCED_1B_4B_SWARM'
                              ? 60
                              : 180
                          );
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          computeBudgetTier === tierKey
                            ? 'bg-amber-500 text-zinc-950'
                            : 'bg-zinc-950 border border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10.5px]">
                    <label className="flex items-center gap-1.5 text-zinc-300">
                      <span>VRAM Cap (GB):</span>
                      <input
                        type="number"
                        min={1}
                        max={64}
                        step={0.5}
                        value={customVramGb}
                        onChange={(e) => setCustomVramGb(Math.max(1, parseFloat(e.target.value) || 2))}
                        className="w-14 rounded bg-zinc-950 border border-zinc-700 px-1.5 py-0.5 text-amber-300 font-bold"
                      />
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-300">
                      <span>Daily GPU-Min:</span>
                      <input
                        type="number"
                        min={5}
                        max={480}
                        step={5}
                        value={customGpuMinutesPerDay}
                        onChange={(e) =>
                          setCustomGpuMinutesPerDay(Math.max(5, parseInt(e.target.value, 10) || 20))
                        }
                        className="w-16 rounded bg-zinc-950 border border-zinc-700 px-1.5 py-0.5 text-emerald-300 font-bold"
                      />
                    </label>
                    <span className="text-sky-300 font-bold">
                      {computeBudgetSmartPlan.estimatedTokensPerDay} · {computeBudgetSmartPlan.active1BCount}× 1B + {computeBudgetSmartPlan.active4BCount}× 4B Agents
                    </span>
                  </div>
                </div>

                <div className="text-[10.5px] text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 rounded px-2.5 py-1.5">
                  ✓ <strong>Budget Allocation Strategy:</strong> {computeBudgetSmartPlan.budgetEfficiencySummary}
                </div>

                {/* Daily SMART Schedule (Mon–Sun) */}
                <div>
                  <div className="text-[10.5px] font-bold uppercase text-amber-400 mb-1.5">
                    📅 Every-Day SMART Goals &amp; Agent Assignments (Monday – Sunday)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {computeBudgetSmartPlan.dailySmartSchedule.map((dayItem) => (
                      <div
                        key={dayItem.dayCode}
                        className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 space-y-1 text-[10px]"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-amber-300">{dayItem.dayLabel}</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-[8.5px] text-emerald-300 font-bold">
                            {dayItem.computeBudgetAllocated}
                          </span>
                        </div>
                        <div className="text-sky-300 font-semibold">{dayItem.activeModelsUsed}</div>
                        <div className="text-zinc-200 leading-snug">
                          <strong>S/M:</strong> {dayItem.specificGoal} ({dayItem.measurableKpi})
                        </div>
                        <div className="text-zinc-400 leading-snug">
                          <strong>A/T:</strong> {dayItem.achievableStrategy} [{dayItem.timeBoundWindow}]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly SMART Objectives (Weeks 1–4) */}
                <div>
                  <div className="text-[10.5px] font-bold uppercase text-sky-400 mb-1.5">
                    📆 Weekly SMART Objectives &amp; Milestones (Weeks 1 – 4)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {computeBudgetSmartPlan.weeklySmartMilestones.map((wk) => (
                      <div
                        key={wk.weekNumber}
                        className="bg-zinc-900/90 border border-sky-500/30 rounded-lg p-2 space-y-1 text-[10px]"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sky-300">{wk.weekTitle}</span>
                          <span className="text-emerald-400 font-bold">{wk.completionPct}%</span>
                        </div>
                        <div className="text-[9px] text-amber-300">{wk.weeklyComputeAllocation}</div>
                        <div className="text-zinc-200 leading-snug">{wk.specificObjective}</div>
                        <div className="text-emerald-300 leading-snug">
                          <strong>Target:</strong> {wk.measurableOutcome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeAgentSquadView === 'PART_LIST_SQUAD' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {PART_LIST_COMPLETION_AGENT_SQUAD.map((item) => (
                  <div
                    key={item.agentId}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 space-y-1 text-[10px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300">{item.agentName}</span>
                      <span className="text-amber-300 font-bold">{item.localModelTag}</span>
                    </div>
                    <div className="font-bold text-zinc-100">
                      {item.assignedWeapons.join(' · ')}
                    </div>
                    <div className="text-sky-300">
                      {item.partsOrPinsAuditedCount} Parts/Screws/O-Rings Audited ({item.modelTier})
                    </div>
                    <div className="text-zinc-400 leading-snug">{item.lastActionSummary}</div>
                  </div>
                ))}
              </div>
            )}

            {activeAgentSquadView === 'BLUEPRINT_SQUAD' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {MAIN_SCREEN_BLUEPRINT_AGENT_SQUAD.map((item) => (
                  <div
                    key={item.agentId}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 space-y-1 text-[10px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-300">{item.agentName}</span>
                      <span className="text-emerald-300 font-bold">{item.localModelTag}</span>
                    </div>
                    <div className="font-bold text-zinc-100">
                      {item.assignedWeapons.join(' · ')}
                    </div>
                    <div className="text-amber-300">{item.specialty}</div>
                    <div className="text-zinc-400 leading-snug">{item.lastActionSummary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main 2-Column Command Deck */}
        <div className="pointer-events-auto w-full max-w-[1400px] mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-4 py-2">
          {/* LEFT COLUMN (5 Cols): Title Lockup, 9-Weapon Progression Selector & Primary Modes */}
          <div className="lg:col-span-5 bg-zinc-950/95 border border-zinc-800/90 rounded-xl p-4 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Custom Inline SVG Title Emblem (Fixed subtitle fit so #09 THE PROTECTOR never clips) */}
              <div className="mb-2.5">
                <svg
                  viewBox="0 0 560 82"
                  className="w-full h-auto"
                  role="img"
                  aria-label="BAR-250 Tactical Pneumatic Arena"
                >
                  <path
                    d="M4 14 L22 4 L556 4 L556 70 L538 78 L4 78 Z"
                    fill="#09090b"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <circle cx="44" cy="41" r="24" fill="#18181b" stroke="#f59e0b" strokeWidth="2.5" />
                  <path
                    d="M27 50 A 20 20 0 1 1 61 50"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line x1="44" y1="41" x2="58" y2="28" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="44" cy="41" r="3.5" fill="#f4f4f5" />
                  <text
                    x="82"
                    y="44"
                    fill="#f4f4f5"
                    fontFamily="Barlow Condensed, sans-serif"
                    fontWeight="700"
                    fontSize="34"
                    letterSpacing="1.4"
                  >
                    BAR-250 // PNEUMATIC
                  </text>
                  <text
                    x="82"
                    y="64"
                    fill="#f59e0b"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                    fontSize="8.8"
                    letterSpacing="0.5"
                  >
                    #01 MONGO · #02 REX-P · #03 DEFENDER · #04 LESHIY · #07 P50 · #09 THE PROTECTOR
                  </text>
                </svg>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
                Select any of the <strong>9 canonical airguns (#01 Mongo through #09 The Protector)</strong> below to inspect its custom 2D CAD cross-section schematic, metric screws, and Viton O-rings.
              </p>

              {/* Survivor 3D-Print & Pneumatic Telemetry Strip */}
              <div className="grid grid-cols-3 gap-2 mb-2.5 font-mono tabular-nums text-xs">
                <div className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1">
                  <div className="text-[10px] text-emerald-400">PA12-CF FILAMENT</div>
                  <div className="font-bold text-zinc-100">{inventory.pa12CfFilamentGrams}g</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1">
                  <div className="text-[10px] text-amber-400">BURST DISK FOILS</div>
                  <div className="font-bold text-zinc-100">{inventory.burstDiskFoils}x</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1">
                  <div className="text-[10px] text-sky-400">9-GUN SCHEMATICS</div>
                  <div className="font-bold text-zinc-100">
                    {CANONICAL_7_WEAPONS_PROGRESSION.length}/9 CAD VERIFIED
                  </div>
                </div>
              </div>

              {/* 9-Weapon Canonical Progression Selector (All 9 visible & clickable) */}
              <div className="mb-2.5 border-t border-b border-zinc-800 py-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-1.5">
                  <span className="font-bold text-amber-300">
                    WEAPON PROGRESSION &amp; PER-GUN SCHEMATIC (#01–#09):
                  </span>
                  <button
                    type="button"
                    onClick={onRerollMapSeed}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Sector Seed #{arenaMap.seed} [Reroll]
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {savedVersions && onSelectSavedVersion
                    ? savedVersions.map((v) => {
                        const isSelected = activeVersionId === v.versionId;
                        return (
                          <button
                            key={v.versionId}
                            type="button"
                            onClick={() => {
                              onSelectSavedVersion(v);
                              setTitlePartNum(1);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold shadow'
                                : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            <span className="leading-snug truncate">
                              {v.versionTag}: {v.customName}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 shrink-0">
                              {isSelected ? 'SCHEMATIC ACTIVE' : `${v.computedEnergyJoules}J`}
                            </span>
                          </button>
                        );
                      })
                    : PRESET_LOADOUTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onSelectPreset(p)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            loadout.id === p.id
                              ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-semibold'
                              : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className="leading-snug">{p.name}</span>
                          <span className="text-[10px] font-mono text-amber-400 shrink-0">
                            {loadout.id === p.id ? 'ACTIVE' : 'SELECT'}
                          </span>
                        </button>
                      ))}
                </div>
              </div>
            </div>

            {/* Primary Launch Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenWorkbench}
                className="col-span-2 px-4 py-2.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-sm tracking-wide hover:bg-amber-400 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>🔧 Open Full 3D Gunsmith &amp; Sub-mm Cutaway Workbench [B]</span>
              </button>

              {onOpenPrinterRoom && (
                <button
                  type="button"
                  data-testid="open-printer-room-btn"
                  onClick={onOpenPrinterRoom}
                  className="col-span-2 px-4 py-2 rounded-lg bg-purple-500/20 border-2 border-purple-400 text-purple-200 font-mono font-bold text-xs tracking-wide hover:bg-purple-500 hover:text-zinc-950 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <span>🖨️ Enter 3-Printer Fabrication Room (9-Gun Rack + 1B/4B Ollama Swarm) [P]</span>
                </button>
              )}

              <button
                type="button"
                data-start="true"
                onClick={onStartGame}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs tracking-wide hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                ▶ Deploy 3D Raid (Wave {wave})
              </button>

              <button
                type="button"
                onClick={onOpenRange}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-sky-500/60 text-sky-300 font-mono font-bold text-xs hover:bg-sky-500/15 transition-colors cursor-pointer"
              >
                🎯 Virtual Physics Range [T]
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Dedicated 9-Weapon Custom 2D CAD Schematic, Version-Progressive Accuracy & Multi-Agent Review Inspector */}
          <div className="lg:col-span-7 bg-zinc-950/95 border border-zinc-800/90 rounded-xl p-4 shadow-2xl flex flex-col justify-between self-start">
            {/* Top Bar: Active Weapon Custom Blueprint Header + Quick 9-Gun Schematic Switcher */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    {automatedBlueprintSpec
                      ? `${automatedBlueprintSpec.blueprintSerialCode} · ${automatedBlueprintSpec.isoStandardLabel}`
                      : `DEDICATED WEAPON CAD SCHEMATIC · ${menuVersionAccuracy.evolvedRevisionTag}`}{' '}
                    · SPEC ACCURACY {menuVersionAccuracy.dimensionalAccuracyPct}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {isCustomGeneratedVersion && activeSavedVersionObj
                      ? `${activeSavedVersionObj.versionTag}: ${activeSavedVersionObj.customName} (${activeSavedVersionObj.regulatorSetpointBar}B · ${activeSavedVersionObj.computedEnergyJoules}J)`
                      : `${selectedMenuGun.fullTitle} (${selectedMenuGun.imperialCaliberLabel} · ${selectedMenuGun.muzzleEnergyJoules}J)`}
                  </h3>
                </div>

                {/* Automated Blueprint Synth + Physics Range Link + Minimize Buttons on Main Menu */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {onAutoGenerateFutureBlueprintVersion && (
                    <button
                      type="button"
                      data-testid="auto-generate-new-blueprint-btn"
                      onClick={() =>
                        onAutoGenerateFutureBlueprintVersion(
                          `Auto-CAD ${selectedMenuGun.shortTitle.split(' ')[1] || 'Hybrid'} .${Math.round((selectedMenuGun.defaultCaliberMm || 12.7) * 3.937)}`
                        )
                      }
                      title="Automatically generate a new custom weapon version and synthesize its ISO-128 / ASME Y14.5 CAD blueprint"
                      className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400 text-purple-200 font-mono text-[11px] font-bold hover:bg-purple-500 hover:text-zinc-950 cursor-pointer"
                    >
                      ⚡ Auto-Gen New Blueprint
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenRange}
                    className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-mono text-[11px] font-bold hover:bg-emerald-500 hover:text-zinc-950 cursor-pointer"
                  >
                    🔬 Air &amp; .25–.72 Cal Physics Range [T]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFireWeapon();
                      setTitleAirStepIdx(3);
                    }}
                    className="px-3 py-1 rounded bg-rose-500 text-white font-mono text-[11px] font-bold hover:bg-rose-400 cursor-pointer shadow"
                  >
                    🔥 FIRE {selectedMenuGun.imperialCaliberLabel.split(' ')[0]}
                  </button>
                  <button
                    type="button"
                    data-testid="toggle-title-blueprint"
                    onClick={() => setMinimizeTitleBlueprint((v) => !v)}
                    className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-mono text-[11px] font-bold hover:text-white cursor-pointer"
                  >
                    {minimizeTitleBlueprint ? '▸ Expand Blueprint' : '▾ Min Blueprint'}
                  </button>
                </div>
              </div>

              {/* Quick 9-Gun Schematic Switcher Pill Bar */}
              {savedVersions && onSelectSavedVersion && (
                <div className="flex flex-wrap items-center gap-1 mb-2 pb-2 border-b border-zinc-800/80 font-mono">
                  <span className="text-[9.5px] font-bold uppercase text-zinc-400 mr-1">
                    9 Schematics:
                  </span>
                  {CANONICAL_7_WEAPONS_PROGRESSION.map((g) => {
                    const verMatch = savedVersions.find((sv) => sv.versionId === g.versionId);
                    const isAct = g.progressionId === selectedMenuGun.progressionId;
                    return (
                      <button
                        key={g.progressionId}
                        type="button"
                        onClick={() => {
                          if (verMatch) {
                            onSelectSavedVersion(verMatch);
                            setTitlePartNum(1);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          isAct
                            ? 'bg-amber-500 text-zinc-950 shadow'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-400/60 hover:text-white'
                        }`}
                      >
                        {g.shortTitle.split(' (')[0]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {!minimizeTitleBlueprint && (
              <>
                {/* Version-Progressive Blueprint Accuracy Banner */}
                <div className="bg-emerald-950/35 border border-emerald-500/50 rounded-lg px-3 py-1.5 mb-2 font-mono text-[11px] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-emerald-300 font-bold">
                      VERSION-PROGRESSIVE CAD SCHEMATIC ({menuVersionAccuracy.evolvedRevisionTag}):
                    </span>{' '}
                    <span className="text-zinc-200">
                      <strong className="text-amber-300">{menuVersionAccuracy.dimensionalAccuracyPct} Spec</strong> · Tol{' '}
                      <strong className="text-sky-300">{menuVersionAccuracy.machiningToleranceMm}</strong> ·{' '}
                      <strong className="text-purple-300">{menuVersionAccuracy.cadMeshFacetCount} B-Rep Facets</strong> · CFD{' '}
                      <strong className="text-emerald-300">{menuVersionAccuracy.cfdConvergenceResidual}</strong>
                    </span>
                    <div className="text-[10px] text-zinc-300 mt-0.5">
                      {menuVersionAccuracy.versionUpgradeHighlight}
                    </div>
                  </div>
                </div>

                {/* Weapon-Specific High-Precision 2D CAD Cross-Section Schematic SVG for All 9 Canonical Airguns */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 mb-2.5">
                  <svg
                    viewBox="0 0 900 250"
                    className="w-full h-auto select-none"
                    role="img"
                    aria-label={`${selectedMenuGun.fullTitle} Dedicated 2D CAD Cross-Section Schematic`}
                  >
                    <defs>
                      <pattern id="titleCadGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                        <path
                          d="M 25 0 L 0 0 0 25"
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="0.7"
                        />
                      </pattern>
                    </defs>
                    <rect width="900" height="250" rx="8" fill="#050811" />
                    <rect width="900" height="250" rx="8" fill="url(#titleCadGrid)" />

                    {/* Top Title & Telemetry Legend inside SVG */}
                    <rect x="8" y="5" width="884" height="20" rx="4" fill="#09090b" stroke="#1e293b" strokeWidth="1" opacity="0.92" />
                    <text x="16" y="18" fill="#38bdf8" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="700">
                      {selectedMenuGun.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
                        ? `CAD SCHEMATIC // ${selectedMenuGun.shortTitle.toUpperCase()} · FRONT-FILL CARTRIDGE: 310 BAR (4,500 PSI) · DIRECT DUMP (0cc PLENUM / NO REG) · REAR 5,000 PSI BURST DISK`
                        : `CAD SCHEMATIC // ${selectedMenuGun.fullTitle.toUpperCase()} · FILL: ${reserveBar} BAR · PLENUM: ${plenumBar} BAR · ${selectedMenuGun.magazineCapacity} RDS`}
                    </text>

                    {/* ========================================================================= */}
                    {/* #01 MONGO (GUN_01_PEN): Texoma VID105/VID107 .45 / 9mm / .410 Pen Gun     */}
                    {/* + Video x9feufnloKc Front-Fill Shuttle Piston & Rear 5,000 PSI Burst Disk */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_01_PEN' && (
                      <g>
                        {/* Overall Dimension Callout Line */}
                        <line x1="56" y1="36" x2="844" y2="36" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
                        <text x="450" y="33" textAnchor="middle" fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          ├──────────── TEXOMA VID105 / VID107 + x9feufnloKc SPEC · 3-PIECE UNSHROUDED COAXIAL PEN LAUNCHER (ZERO REGULATOR / ZERO BAFFLES) ────────────┤
                        </text>

                        {/* 1. REAR SECTION (#4 PEN-04): L-Slot Striker Tube, Coil Mainspring & Ti Pocket Clip */}
                        <rect x="58" y="92" width="196" height="54" rx="6" fill="rgba(39,39,42,0.92)" stroke="#a1a1aa" strokeWidth="2" />
                        {/* Ti-6Al-4V Pocket Clip */}
                        <path d="M 78 92 L 78 78 L 195 78 L 208 88" fill="none" stroke="#38bdf8" strokeWidth="2.6" />
                        <text x="142" y="74" textAnchor="middle" fill="#7dd3fc" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          [PEN-04] L-SLOT STRIKER TUBE &amp; CLIP
                        </text>
                        {/* Coil Mainspring */}
                        <path d="M 68 119 Q 78 103 88 119 T 108 119 T 128 119 T 148 119 T 168 119" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
                        {/* Striker Hammer Mass & Forward Firing Pin */}
                        <rect x={titleAirStepIdx === 3 ? 194 : 172} y="103" width="46" height="32" rx="4" fill="#52525b" stroke="#f4f4f5" strokeWidth="1.5" />
                        <polygon
                          points={`${titleAirStepIdx === 3 ? 240 : 218},114 ${titleAirStepIdx === 3 ? 268 : 242},119 ${titleAirStepIdx === 3 ? 240 : 218},124`}
                          fill="#facc15"
                        />
                        {/* L-Slot Safety & Thumb Cocking Knob */}
                        <path d="M 135 97 L 205 97 L 205 109" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={titleAirStepIdx === 3 ? 205 : 142} cy="97" r="5" fill="#f59e0b" stroke="#fff" strokeWidth="1.2" />

                        {/* 2. MIDDLE SECTION (#3 PEN-03 & #2 SHELL-50-220B): Front-Fill 4,500 PSI Cartridge + Rear 5,000 PSI Burst Disk */}
                        <rect x="258" y="86" width="262" height="66" rx="6" fill="rgba(24,24,27,0.95)" stroke="#f59e0b" strokeWidth="1.8" />
                        {/* Rear Stainless Burst-Disk Retainer Cap (#3 PEN-03) */}
                        <rect x="264" y="92" width="48" height="54" rx="4" fill="rgba(161,161,170,0.28)" stroke="#e4e4e7" strokeWidth="1.8" />
                        {/* Flat/Domed 5,000 PSI Metal Burst Disk */}
                        <line x1="312" y1="94" x2="312" y2="144" stroke="#facc15" strokeWidth="3.5" strokeDasharray="3 2" />
                        <text x="288" y="115" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="7" fontWeight="700">
                          REAR CAP
                        </text>
                        <text x="288" y="126" textAnchor="middle" fill="#fef08a" fontFamily="JetBrains Mono, monospace" fontSize="6.8">
                          5000 PSI
                        </text>
                        <text x="288" y="136" textAnchor="middle" fill="#fef08a" fontFamily="JetBrains Mono, monospace" fontSize="6.8">
                          BURST DISK
                        </text>

                        {/* Red Anodized 310-Bar (4,500 PSI) Cartridge Body (#2 SHELL-50-220B) */}
                        <rect x="314" y="92" width="198" height="54" rx="5" fill="rgba(220,38,38,0.34)" stroke="#ef4444" strokeWidth="2" />
                        {/* Internal Sliding Shuttle Piston + Return Spring (Pushed Rearward by Front Fill per Video x9feufnloKc) */}
                        <path d="M 322 119 Q 332 108 342 119 T 362 119 T 382 119" fill="none" stroke="#fca5a5" strokeWidth="1.8" />
                        <rect x={titleAirStepIdx === 3 ? 442 : 386} y="98" width="34" height="42" rx="3" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1.5" />
                        <text x={titleAirStepIdx === 3 ? 459 : 403} y="122" textAnchor="middle" fill="#09090b" fontFamily="JetBrains Mono, monospace" fontSize="6.8" fontWeight="800">
                          SHUTTLE
                        </text>
                        {/* Front Nozzle Fill & Discharge Port */}
                        <path d="M 512 119 L 478 119" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
                        <text x="415" y="81" textAnchor="middle" fill="#fecaca" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          AEA 310B (4,500 PSI) FRONT-FILL SHUTTLE CARTRIDGE (x9feufnloKc)
                        </text>
                        <text x="466" y="112" textAnchor="middle" fill="#fef2f2" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          ← FRONT FILL
                        </text>
                        <text x="466" y="134" textAnchor="middle" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="7" fontWeight="700">
                          DUMP OUT →
                        </text>

                        {/* 3. FRONT SECTION (#1 PEN-01): 3 Interchangeable Screw-On Unshrouded Barrels (VID105 & VID107) */}
                        {/* Top Swappable Barrel: .410 Smoothbore Shotgun Barrel w/ #4 Buckshot / Dual .32 Balls Wad (VID107) */}
                        <rect x="526" y="76" width="318" height="26" rx="4" fill="rgba(220,38,38,0.25)" stroke="#ef4444" strokeWidth="1.8" />
                        <rect x="534" y="81" width="306" height="16" fill="#09090b" stroke="#f59e0b" strokeWidth="1.3" />
                        {/* .410 Shot Cup Wad + 4x #4 Buckshot / Dual .32 Lead Pellets */}
                        <rect x={titleAirStepIdx === 3 ? 755 : 546} y="83" width="38" height="12" rx="2" fill="rgba(245,158,11,0.35)" stroke="#facc15" strokeWidth="1.2" />
                        {[0, 1, 2, 3].map((pIdx) => (
                          <circle
                            key={pIdx}
                            cx={(titleAirStepIdx === 3 ? 762 : 553) + pIdx * 8}
                            cy="89"
                            r="3"
                            fill="#fde047"
                          />
                        ))}
                        <text x="695" y="92" textAnchor="middle" fill="#fef3c7" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          BARREL A (VID107): .410 SHOTGUN (#4 BUCK / 2×.32 BALLS)
                        </text>

                        {/* Middle Swappable Barrel: .45 Cal (11.43mm) Rifled Barrel w/ Lead Slug (VID105) */}
                        <rect x="526" y="106" width="275" height="24" rx="4" fill="rgba(14,165,233,0.24)" stroke="#38bdf8" strokeWidth="1.8" />
                        <rect x="534" y="111" width="262" height="14" fill="#09090b" stroke="#38bdf8" strokeWidth="1.2" />
                        <rect x={titleAirStepIdx === 3 ? 745 : 546} y="113" width="22" height="10" rx="3" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1" />
                        <text x="675" y="121" textAnchor="middle" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          BARREL B (VID105): .45 CAL (11.43mm) RIFLED SLUG BARREL
                        </text>

                        {/* Bottom Swappable Barrel: 9mm (.357 Cal) Rifled Barrel (VID105) */}
                        <rect x="526" y="134" width="245" height="22" rx="4" fill="rgba(16,185,129,0.22)" stroke="#10b981" strokeWidth="1.6" />
                        <rect x="534" y="138" width="232" height="14" fill="#09090b" stroke="#10b981" strokeWidth="1.2" />
                        <rect x={titleAirStepIdx === 3 ? 725 : 546} y="140" width="18" height="10" rx="3" fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
                        <text x="658" y="148" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          BARREL C (VID105): 9mm (.357 CAL) SCREW-ON BARREL
                        </text>

                        <text x="450" y="180" textAnchor="middle" fill="#6ee7b7" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          HOW IT WORKS: SEAT REAR 5,000 PSI DISK → PUMP 4,500 PSI INTO FRONT NOZZLE → SCREW ON .45 / 9mm / .410 BARREL → FIRE
                        </text>
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #02 REX-P (GUN_02_REXP): Korean 57-Part Coaxial Poppet + #14-#20 Underlever */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_02_REXP' && (
                      <g>
                        {/* Top Dimension & Architecture Callout */}
                        <text x="450" y="35" textAnchor="middle" fill="#93c5fd" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          KOREAN 57-PART COAXIAL MONOLITH · #37/#38 REAR 250B BOTTLE · #31/#32 BALANCED PEEK POPPET · #14–#20 5-HOLE UNDERLEVER
                        </text>

                        {/* Rear Axial Manometer (#52) + Rear 250-Bar Coaxial Cylinder (#37/#38, 190cc Pistol / 480cc Carbine) */}
                        <rect x="55" y="88" width="22" height="54" rx="4" fill="#18181b" stroke="#facc15" strokeWidth="2" />
                        <text x="66" y="79" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          #52 GAUGE
                        </text>
                        <rect x="77" y="82" width="235" height="66" rx="10" fill="rgba(14,165,233,0.25)" stroke="#38bdf8" strokeWidth="2.2" />
                        <text x="92" y="106" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700">
                          [REX-08] #37/#38 COAXIAL 250-BAR TANK
                        </text>
                        <text x="92" y="121" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="8">
                          190cc PISTOL / 480cc CARBINE · M18×1.5 NECK
                        </text>
                        {/* Coaxial Balanced PEEK Poppet (#31/#32) + Return Spring (#27) */}
                        <rect x="255" y="96" width="52" height="38" rx="4" fill="rgba(16,185,129,0.32)" stroke="#10b981" strokeWidth="1.8" />
                        <text x="281" y="118" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          #32 POPPET
                        </text>

                        {/* Monolithic Tubular Receiver (#22) + Top 21.2mm Picatinny Rail (#24) */}
                        <rect x="312" y="76" width="210" height="58" rx="4" fill="rgba(39,39,42,0.95)" stroke="#a1a1aa" strokeWidth="2" />
                        <rect x="320" y="66" width="195" height="10" fill="#27272a" stroke="#f59e0b" strokeWidth="1.2" />
                        <text x="418" y="62" textAnchor="middle" fill="#fcd34d" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          #22 MONOLITHIC RECEIVER &amp; #24 PICATINNY RAIL
                        </text>

                        {/* Vertical Sliding Single-Shot Breech Block (#11) & Twist Cam Lever (#14) */}
                        <rect x="392" y={titleAirStepIdx === 1 ? 56 : 72} width="42" height="56" rx="3" fill="rgba(245,158,11,0.35)" stroke="#f59e0b" strokeWidth="2.2" />
                        <text x="413" y={titleAirStepIdx === 1 ? 52 : 92} textAnchor="middle" fill="#fef08a" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          #11 BREECH
                        </text>
                        {/* Single .30 Cal (7.62mm) Slug Loading Directly Into Breech */}
                        <rect x={titleAirStepIdx === 3 ? 670 : 404} y="97" width="20" height="10" rx="3" fill="#facc15" stroke="#fff" strokeWidth="1" />

                        {/* Rebuilt Factory Trigger Group (#16 2-Stage Blade -> #17 68mm Transfer Bar -> #18 Sear -> #20 5-Hole Underlever Guard) */}
                        <rect x="335" y="136" width="128" height="16" rx="2" fill="rgba(16,185,129,0.26)" stroke="#10b981" strokeWidth="1.5" />
                        <text x="399" y="147" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          #16 TRIGGER → #17 68mm TRANSFER BAR → #18 SEAR
                        </text>
                        {/* 5-Hole Skeletonized Underlever Trigger Guard (#14–#20) */}
                        <path d="M 355 152 L 378 184 L 485 184 L 502 134" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth="2.8" />
                        {[0, 1, 2, 3, 4].map((hIdx) => (
                          <circle key={hIdx} cx={392 + hIdx * 19} cy="172" r="4.5" fill="#09090b" stroke="#fcd34d" strokeWidth="1.2" />
                        ))}
                        {/* Contoured Pistol Grip (#28) */}
                        <polygon points="315,134 358,134 334,186 286,186" fill="#18181b" stroke="#71717a" strokeWidth="1.8" />

                        {/* Slotted Barrel Shroud (#01/#02) + .30 Cal (7.62mm) Rifled Barrel (#04) + 8-Baffle Moderator */}
                        <rect x="522" y="82" width="235" height="42" rx="4" fill="rgba(39,39,42,0.9)" stroke="#38bdf8" strokeWidth="2" />
                        {[0, 1, 2, 3, 4].map((slotIdx) => (
                          <rect key={slotIdx} x={542 + slotIdx * 38} y="87" width="22" height="7" rx="2" fill="#09090b" stroke="#38bdf8" strokeWidth="0.9" />
                        ))}
                        <line x1="434" y1="102" x2="765" y2="102" stroke="#f4f4f5" strokeWidth="5.5" />
                        <text x="638" y="75" textAnchor="middle" fill="#7dd3fc" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [REX-01/02] #02 SLOTTED SHROUD &amp; #04 .30 BARREL
                        </text>
                        <rect x="757" y="78" width="118" height="50" rx="5" fill="#18181b" stroke="#a855f7" strokeWidth="2" />
                        <text x="816" y="106" textAnchor="middle" fill="#d8b4fe" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          8-BAFFLE MOD
                        </text>
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #03 AEA HARPOON & .72 WALKING CANE (GUN_03_DEFENDER): x9feufnloKc & jgDYcypjHeI */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_03_DEFENDER' && (
                      <g>
                        <text x="450" y="34" textAnchor="middle" fill="#fca5a5" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          AEA HARPOON (x9feufnloKc) &amp; .72 CAL WALKING CANE (jgDYcypjHeI) · FRONT-FILL 4,500 PSI SHUTTLE CARTRIDGES + REAR 5,000 PSI BURST DISKS
                        </text>

                        {/* Rear Standing Breech Receiver & Dual Alternating 17-4PH Striker Hammers (#3 DEF-03) */}
                        <rect x="85" y="70" width="165" height="90" rx="6" fill="rgba(39,39,42,0.95)" stroke="#a1a1aa" strokeWidth="2.2" />
                        {/* Upper & Lower Striker Hammers + Rotating Ratchet Cam */}
                        <rect x="102" y="80" width="54" height="22" rx="3" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.8" />
                        <rect x="102" y="122" width="54" height="22" rx="3" fill="rgba(14,165,233,0.3)" stroke="#38bdf8" strokeWidth="1.8" />
                        <circle cx="182" cy="112" r="12" fill="#18181b" stroke="#10b981" strokeWidth="2" />
                        <text x="168" y="64" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          [DEF-03] ALTERNATING REAR STRIKERS
                        </text>
                        {/* Ergonomic Grip / Cane Handle (#4 DEF-04) */}
                        <polygon points="95,160 165,160 142,188 78,188" fill="#18181b" stroke="#71717a" strokeWidth="1.8" />

                        {/* Break-Action Front Hinge Pivot Pin (DEF-SCR-02) */}
                        <circle cx="262" cy="162" r="7" fill="#facc15" stroke="#09090b" strokeWidth="2" />

                        {/* Over-Under Twin Barrel & Cartridge Block (#1 DEF-01) */}
                        <rect x="256" y="68" width="575" height="92" rx="6" fill="rgba(24,24,27,0.92)" stroke="#ef4444" strokeWidth="2" />

                        {/* Upper Chamber: Front-Fill 310B Cartridge #1 (Rear 5,000 PSI Disk + Shuttle) + .50 Slug / .72 Cane Bore */}
                        <rect x="266" y="76" width="175" height="32" rx="4" fill="rgba(239,68,68,0.38)" stroke="#ef4444" strokeWidth="1.8" />
                        <line x1="274" y1="78" x2="274" y2="106" stroke="#facc15" strokeWidth="3" strokeDasharray="3 2" />
                        <rect x="335" y="80" width="24" height="24" rx="2" fill="#38bdf8" />
                        <text x="362" y="95" fill="#fef2f2" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          310B SHUTTLE CART #1
                        </text>
                        <rect x="442" y="80" width="380" height="24" fill="#09090b" stroke="#38bdf8" strokeWidth="1.6" />
                        <rect x={titleAirStepIdx === 3 ? 755 : 456} y="84" width="34" height="16" rx="3" fill="#f59e0b" />
                        <text x="635" y="95" textAnchor="middle" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          UPPER: .50 SLUG / BUCKSHOT OR .72 CAL (18.3mm) WALKING CANE SHAFT
                        </text>

                        {/* Lower Chamber: Front-Fill 310B Cartridge #2 + 375gr Carbon Harpoon Arrow (x9feufnloKc) */}
                        <rect x="266" y="118" width="175" height="32" rx="4" fill="rgba(239,68,68,0.38)" stroke="#ef4444" strokeWidth="1.8" />
                        <line x1="274" y1="120" x2="274" y2="148" stroke="#facc15" strokeWidth="3" strokeDasharray="3 2" />
                        <rect x="335" y="122" width="24" height="24" rx="2" fill="#38bdf8" />
                        <text x="362" y="137" fill="#fef2f2" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          310B SHUTTLE CART #2
                        </text>
                        <rect x="442" y="122" width="380" height="24" fill="#09090b" stroke="#10b981" strokeWidth="1.6" />
                        <line x1="452" y1="134" x2="852" y2="134" stroke="#10b981" strokeWidth="4.5" />
                        <polygon points="874,134 848,125 848,143" fill="#facc15" />
                        <text x="635" y="137" textAnchor="middle" fill="#6ee7b7" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          LOWER: 375gr COAXIAL CARBON HARPOON ARROW (x9feufnloKc)
                        </text>
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #04 LESHIY 2 (GUN_04_LESHIY): 180° Folding Dual-Tube + 1.4ms EAR + 8-Rd   */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_04_LESHIY' && (
                      <g>
                        <text x="450" y="35" textAnchor="middle" fill="#7dd3fc" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          EDGUN LESHIY 2 OPEN-BREECH SEMI-AUTO · 179cc (137cc 300B + 42cc R.E.P.R. PLENUM) · 1.4ms EAR VALVE · 8-RD MAG
                        </text>

                        {/* Rear Buttpad + Upper 42cc Regulated Plenum (LSH-10) + Lower 137cc 300-Bar Reservoir */}
                        <rect x="52" y="72" width="24" height="96" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                        <rect x="76" y="76" width="265" height="36" rx="6" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2" />
                        <text x="88" y="98" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [LSH-10] UPPER 42cc R.E.P.R. PLENUM (130–240B) + LSH-09 1.4ms EAR SPOOL
                        </text>
                        <rect x="76" y="122" width="265" height="36" rx="6" fill="rgba(168,85,247,0.26)" stroke="#a855f7" strokeWidth="2" />
                        <text x="88" y="144" fill="#f3e8ff" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          LOWER 137cc 300-BAR RESERVOIR TUBE (179cc TOTAL)
                        </text>

                        {/* 180° Folding Hinge + 8-Round Magnetic Rotary Drum (LSH-06) + Red PU-90A Puff-Seal Puck (LSH-07) */}
                        <rect x="344" y="70" width="38" height="90" rx="4" fill="rgba(239,68,68,0.42)" stroke="#ef4444" strokeWidth="2.2" />
                        <circle cx="390" cy="95" r="8" fill="#ef4444" stroke="#fef2f2" strokeWidth="1.5" />
                        <polygon points="365,160 415,160 392,188 342,188" fill="#18181b" stroke="#ef4444" strokeWidth="1.8" />

                        {/* LSH-01 350mm Alfa .30 Barrel + LSH-02 Valkyrie Carbon M-LOK Handguard */}
                        <rect x="402" y="74" width="275" height="50" rx="5" fill="rgba(24,24,27,0.92)" stroke="#38bdf8" strokeWidth="2" />
                        <line x1="382" y1="95" x2="845" y2="95" stroke="#f4f4f5" strokeWidth="5" />
                        <text x="538" y="115" textAnchor="middle" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          LSH-01 350mm ALFA .30 BARREL · LSH-02 VALKYRIE M-LOK
                        </text>

                        {/* LSH-03 Tishina 200 6-Baffle Eccentric Moderator */}
                        <rect x="680" y="68" width="180" height="62" rx="6" fill="rgba(16,185,129,0.22)" stroke="#10b981" strokeWidth="2" />
                        <text x="770" y="115" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fontWeight="700">
                          LSH-03 TISHINA 6-BAFFLE
                        </text>
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #05 THE LEAF (GUN_04B_THE_LEAF_45): .45 Cal Open-Breech + 165cc OTB       */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_04B_THE_LEAF_45' && (
                      <g>
                        <text x="450" y="35" textAnchor="middle" fill="#6ee7b7" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          #05 THE LEAF (.45 CAL / 11.43mm) · LESHIY-2 OPEN-BREECH FOLDING FRAME + 165cc CONCENTRIC OVER-BARREL AIR RESERVE
                        </text>

                        {/* Rear Folding Stock: Upper 68cc 195-Bar Plenum + Lower 220cc 300-Bar Tube */}
                        <rect x="58" y="76" width="275" height="36" rx="6" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2" />
                        <text x="72" y="98" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [LEAF-04] 68cc 195-BAR R.E.P.R. BIG-BORE PLENUM
                        </text>
                        <rect x="58" y="120" width="275" height="36" rx="6" fill="rgba(168,85,247,0.28)" stroke="#a855f7" strokeWidth="2" />
                        <text x="72" y="142" fill="#f3e8ff" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          220cc 300-BAR FOLDING STOCK TUBE (385cc TOTAL HPA)
                        </text>

                        {/* 6-Round .45 Cal Scalloped Rotary Drum (LEAF-03) + Enlarged Red PU-90A Puff-Seal Puck */}
                        <rect x="338" y="70" width="40" height="88" rx="4" fill="rgba(239,68,68,0.45)" stroke="#ef4444" strokeWidth="2.2" />
                        <polygon points="355,158 408,158 386,188 336,188" fill="#18181b" stroke="#10b981" strokeWidth="1.8" />

                        {/* Concentric 165cc Over-the-Barrel (OTB) Air Reserve Jacket (LEAF-01) around 6-Baffle Silencer & .45 Barrel */}
                        <rect x="384" y="68" width="475" height="72" rx="8" fill="rgba(16,185,129,0.24)" stroke="#10b981" strokeWidth="2.4" />
                        <rect x="400" y="84" width="445" height="40" rx="5" fill="rgba(220,38,38,0.24)" stroke="#ef4444" strokeWidth="1.6" />
                        <line x1="380" y1="104" x2="860" y2="104" stroke="#f4f4f5" strokeWidth="6.5" />
                        <text x="620" y="80" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [LEAF-01] 165cc CONCENTRIC OVER-BARREL AIR RESERVE (300 BAR)
                        </text>
                        <text x="620" y="120" textAnchor="middle" fill="#fecaca" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [LEAF-02] 380mm .45 CAL (11.43mm) BARREL + INTEGRATED 6-BAFFLE MODERATOR
                        </text>
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #06 MP30 (GUN_05_MP30): Dual-Cylinder 300cc (2x150cc) Korean Tactical SMG */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_05_MP30' && (
                      <g>
                        <text x="450" y="35" textAnchor="middle" fill="#7dd3fc" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          #06 MP30 (.30 CAL TACTICAL PCP SMG) · DUAL OVER-UNDER 2×150cc = 300cc (250B) CYLINDERS · 48cc PLENUM · 12-RD MAG
                        </text>

                        {/* MP30-12: 180° Side-Folding M4 Telescoping Buttstock */}
                        <rect x="52" y="84" width="26" height="72" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
                        <rect x="78" y="92" width="165" height="24" rx="3" fill="#27272a" stroke="#a1a1aa" strokeWidth="1.8" />

                        {/* MP30-07/08/09: Monolithic SMG Receiver + 48cc Regulated Vertical Plenum + 12-Rd .30 Drum */}
                        <rect x="245" y="72" width="195" height="72" rx="5" fill="rgba(63,63,70,0.92)" stroke="#d4d4d8" strokeWidth="2" />
                        <rect x="335" y="144" width="52" height="44" rx="4" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="2" />
                        <polygon points="255,144 302,144 285,188 238,188" fill="#18181b" stroke="#71717a" strokeWidth="1.8" />
                        <text x="342" y="98" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          48cc PLENUM (165B) · SIDE-LEVER
                        </text>

                        {/* MP30-01/02: 320mm .30 Barrel + 10-Chamber Whisper Shroud */}
                        <rect x="440" y="70" width="395" height="30" rx="4" fill="rgba(39,39,42,0.95)" stroke="#38bdf8" strokeWidth="2" />
                        <line x1="415" y1="85" x2="840" y2="85" stroke="#f4f4f5" strokeWidth="5" />

                        {/* MP30-04/05: Dual Parallel Over-Under 150cc = 300cc 250-Bar Air Cylinders + Figure-8 Bridge */}
                        <rect x="448" y="106" width="325" height="22" rx="6" fill="rgba(14,165,233,0.3)" stroke="#38bdf8" strokeWidth="1.8" />
                        <text x="610" y="120" textAnchor="middle" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          UPPER 150cc HPA CYLINDER (250 BAR)
                        </text>
                        <rect x="448" y="132" width="325" height="22" rx="6" fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="1.8" />
                        <text x="610" y="146" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          LOWER 150cc HPA CYLINDER (300cc TOTAL) + 165B REGULATOR
                        </text>
                        {/* Figure-8 Regulator Manifold Bridge */}
                        <rect x="456" y="102" width="32" height="56" rx="4" fill="rgba(245,158,11,0.38)" stroke="#f59e0b" strokeWidth="1.8" />
                        {/* MP30-10: Angled Foregrip w/ Bottom Gauge */}
                        <rect x="595" y="154" width="38" height="34" rx="5" fill="#18181b" stroke="#10b981" strokeWidth="1.8" />
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #07 THE P50 (GUN_06_P50): 250B Pressurized Top Mag + 90° Interlock + OTB  */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_06_P50' && (
                      <g>
                        <text x="450" y="35" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          #07 THE P50 (.50 CAL) · 250B SELF-PRESSURIZED TOP MAG · 90° BREECH SAFETY INTERLOCK · SCREW-OFF BARREL RESERVE
                        </text>

                        {/* Rear Buttstock Dual Cylinders (225cc) + 110cc 200-Bar Full-Auto Plenum */}
                        <rect x="62" y="104" width="265" height="58" rx="8" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2" />
                        <text x="194" y="130" textAnchor="middle" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          BUTTSTOCK RESERVE (225cc) + 110cc 200B AUTO PLENUM
                        </text>
                        <text x="194" y="146" textAnchor="middle" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="7.2">
                          HERMETICALLY SEALED FOR SPACE / SAND / UNDERWATER
                        </text>

                        {/* Rear 90° Helical Cam Turret Saddle & Breech-Alignment Safety Interlock (P50-02) */}
                        <circle cx="348" cy="96" r="22" fill="rgba(16,185,129,0.34)" stroke="#10b981" strokeWidth="2.2" />
                        <path d="M 348 76 L 348 116" stroke="#facc15" strokeWidth="3.5" />

                        {/* Top Smoked-Polycarbonate 20-Rd Horizontal .50 Spine + Self-Contained 250-Bar Mag Air Reserve (P50-01) */}
                        <rect x="372" y="64" width="310" height="22" rx="4" fill="rgba(245,158,11,0.28)" stroke="#f59e0b" strokeWidth="2" />
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((sIdx) => (
                          <rect key={sIdx} x={384 + sIdx * 32} y="68" width="20" height="14" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.9" />
                        ))}
                        <rect x="372" y="88" width="295" height="14" rx="3" fill="rgba(56,189,248,0.36)" stroke="#38bdf8" strokeWidth="1.5" />
                        <text x="520" y="98" textAnchor="middle" fill="#e0f2fe" fontFamily="JetBrains Mono, monospace" fontSize="7.2" fontWeight="700">
                          [P50-01] SELF-CONTAINED 250-BAR MAG RESERVE + POPPET INTERLOCK
                        </text>

                        {/* M32x1.5 Screw-Off Quick-Change Barrel + Concentric OTB Reserve (P50-03: 85cc / 160cc / 220cc) */}
                        <rect x="372" y="106" width="395" height="36" rx="6" fill="rgba(16,185,129,0.26)" stroke="#10b981" strokeWidth="2" />
                        <line x1="335" y1="124" x2="845" y2="124" stroke="#f4f4f5" strokeWidth="6" />
                        <text x="570" y="120" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [P50-03] M32×1.5 SCREW-OFF BARREL &amp; OTB RESERVE (160cc .50 CAL)
                        </text>

                        {/* Extended Forward Refill Pump Foregrip (P50-04: 180cc Bottle + 3-Stage Hand Refill) & Folding Bipod */}
                        <rect x="520" y="146" width="165" height="38" rx="6" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" strokeWidth="2" />
                        <text x="602" y="168" textAnchor="middle" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          [P50-04] EXTENDED REFILL FOREGRIP
                        </text>
                        <line x1="725" y1="142" x2="700" y2="188" stroke="#d4d4d8" strokeWidth="3.5" />
                        <line x1="738" y1="142" x2="762" y2="188" stroke="#d4d4d8" strokeWidth="3.5" />
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #08 CUSTOM .45 ASCENT (GUN_07_ASCENT45): 140cc OTB + 300B 3-Stage Pump    */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_07_ASCENT45' && (
                      <g>
                        <text x="450" y="35" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          #08 CUSTOM .45 ASCENT (12-PART SCHEMATIC) · #09 140cc OTB 210B PLENUM · #10 M18×1 SILENCER · #12 300B 3-STAGE PUMP
                        </text>

                        {/* #01 Skeletonized Thumbhole Polymer Stock + #02 Breech & #03 Quattro 2-Stage Sear */}
                        <path d="M 48 142 L 185 104 L 352 104 L 352 152 L 195 158 L 64 186 Z" fill="#27272a" stroke="#a1a1aa" strokeWidth="2" />
                        <text x="195" y="134" textAnchor="middle" fill="#e4e4e7" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          #01 STOCK · #02 BREECH · #03 QUATTRO SEAR
                        </text>

                        {/* #09 Concentric 140cc Over-the-Barrel (OTB) 210-Bar Regulated Plenum + #08 580mm .45 Barrel */}
                        <rect x="355" y="70" width="385" height="42" rx="6" fill="rgba(16,185,129,0.28)" stroke="#10b981" strokeWidth="2.2" />
                        <line x1="340" y1="91" x2="860" y2="91" stroke="#f4f4f5" strokeWidth="6" />
                        <text x="548" y="85" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [#09] 140cc CONCENTRIC OVER-BARREL PLENUM (210 BAR · 2.6+ SHOTS)
                        </text>

                        {/* #10 M18x1.0 Screw-On 7-Baffle QuietEnergy Silencer */}
                        <rect x="742" y="66" width="132" height="50" rx="5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                        <text x="808" y="95" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [#10] M18×1 SILENCER
                        </text>

                        {/* #11 240cc 300-Bar Under-Barrel Reserve Tube */}
                        <rect x="372" y="118" width="320" height="26" rx="5" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2" />
                        <text x="532" y="135" textAnchor="middle" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [#11] 240cc 300-BAR UNDER-BARREL RESERVE + COAXIAL CHECK VALVE
                        </text>

                        {/* #12 58° Front-Fulcrum 4-Bar Toggle Linkage 3-Stage 300-Bar Onboard Hand Pump */}
                        <circle cx="682" cy="152" r="6" fill="#facc15" stroke="#09090b" strokeWidth="1.5" />
                        <line x1="682" y1="152" x2="445" y2={titleAirStepIdx === 1 ? 186 : 176} stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                        <line x1="572" y1={titleAirStepIdx === 1 ? 170 : 164} x2="522" y2="144" stroke="#facc15" strokeWidth="3" />
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* #09 THE PROTECTOR (GUN_09_PROTECTOR): Dual Threaded Barrel Reserves + Loop */}
                    {/* ========================================================================= */}
                    {selectedMenuGun.progressionId === 'GUN_09_PROTECTOR' && (
                      <g>
                        <text x="450" y="35" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          #09 THE PROTECTOR (.50 CAL) · DUAL M28×1.5 BARREL AIR RESERVES (2×110cc @ 250B) · 180° REAR-TO-CENTER-BARREL GAS LOOP
                        </text>

                        {/* Sawed-Off Tactical Grip & Stock + Break-Action Receiver & 3-Position Selector (PRO-02/PRO-03) */}
                        <path d="M 55 148 L 185 96 L 348 82 L 348 158 L 205 158 L 152 188 L 92 188 L 122 158 Z" fill="#27272a" stroke="#a1a1aa" strokeWidth="2" />
                        <rect x="218" y="72" width="148" height="86" rx="5" fill="rgba(39,39,42,0.95)" stroke="#f59e0b" strokeWidth="2.2" />
                        <text x="292" y="104" textAnchor="middle" fill="#fde047" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                          [PRO-03] 180° REAR LOOP
                        </text>
                        <text x="292" y="120" textAnchor="middle" fill="#fed7aa" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          SELECTOR: TOP / BOT / SALVO
                        </text>
                        {/* Break-Action Pivot Hinge Pin */}
                        <circle cx="372" cy="160" r="7" fill="#facc15" stroke="#09090b" strokeWidth="2" />

                        {/* Upper M28x1.5 Threaded Barrel = Independent 110cc 250-Bar Annular Air Reserve (PRO-01) */}
                        <rect x="372" y="70" width="368" height="38" rx="6" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2.2" />
                        <line x1="366" y1="89" x2="745" y2="89" stroke="#f4f4f5" strokeWidth="6" />
                        <text x="556" y="83" textAnchor="middle" fill="#bae6fd" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          [PRO-01] UPPER M28×1.5 BARREL AIR RESERVE (110cc @ 250B · .50 BORE)
                        </text>

                        {/* Lower M28x1.5 Threaded Barrel = Independent 110cc 250-Bar Annular Air Reserve */}
                        <rect x="372" y="116" width="368" height="38" rx="6" fill="rgba(16,185,129,0.28)" stroke="#10b981" strokeWidth="2.2" />
                        <line x1="366" y1="135" x2="745" y2="135" stroke="#f4f4f5" strokeWidth="6" />
                        <text x="556" y="129" textAnchor="middle" fill="#a7f3d0" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fontWeight="700">
                          LOWER M28×1.5 BARREL AIR RESERVE (110cc @ 250B · 220cc TOTAL)
                        </text>

                        {/* 180° Reverse-Loop Airflow Path: Barrel Reserve -> Rear Receiver Valve -> Loops Forward into MIDDLE OF BARREL */}
                        <path d="M 525 70 L 325 70 L 325 89 L 545 89" fill="none" stroke="#facc15" strokeWidth="2.2" strokeDasharray="4 2" />
                        <path d="M 525 154 L 325 154 L 325 135 L 545 135" fill="none" stroke="#facc15" strokeWidth="2.2" strokeDasharray="4 2" />
                        <circle cx="545" cy="89" r="5" fill="#ef4444" stroke="#fef2f2" strokeWidth="1.5" />
                        <circle cx="545" cy="135" r="5" fill="#ef4444" stroke="#fef2f2" strokeWidth="1.5" />

                        {/* Post-Muzzle 8-Flechette Break-Apart Scatter Cone (PRO-04) */}
                        <polygon points="745,89 875,60 875,112" fill="rgba(250,204,21,0.2)" stroke="#facc15" strokeWidth="1.6" strokeDasharray="4 2" />
                        <polygon points="745,135 875,112 875,164" fill="rgba(250,204,21,0.2)" stroke="#facc15" strokeWidth="1.6" strokeDasharray="4 2" />
                      </g>
                    )}

                    {/* ========================================================================= */}
                    {/* NON-OVERLAPPING LEADER-LINE CALLOUT TRACKS:                               */}
                    {/*   - Top Track (y=50): Unique Part Callouts (1..N)                         */}
                    {/*   - Bottom Track 1 (y=198): O-Ring Seal Callouts (O1..On)                 */}
                    {/*   - Bottom Track 2 (y=214): Metric Screw Fasteners (S1..Sn)               */}
                    {/* ========================================================================= */}

                    {/* O-Ring Seal Callout Dots (Cyan Circles O1..On) on Dedicated Bottom Track 1 (y=198) */}
                    {selectedMenuGun.oringPlacements.map((or, idx) => {
                      const totalOr = selectedMenuGun.oringPlacements.length;
                      const slotX = Math.round(95 + (idx * 710) / Math.max(1, totalOr - 1));
                      const targetX = Math.min(855, Math.max(45, or.pinX));
                      const oy = 197;
                      return (
                        <g key={or.code}>
                          <line
                            x1={slotX}
                            y1={oy - 7}
                            x2={targetX}
                            y2="146"
                            stroke="rgba(56,189,248,0.35)"
                            strokeWidth="0.9"
                            strokeDasharray="2 2"
                          />
                          <circle
                            cx={slotX}
                            cy={oy}
                            r="6.5"
                            fill="#09090b"
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                          />
                          <text
                            x={slotX}
                            y={oy + 2.5}
                            textAnchor="middle"
                            fill="#7dd3fc"
                            fontFamily="JetBrains Mono, monospace"
                            fontSize="6.8"
                            fontWeight="700"
                          >
                            O{idx + 1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Metric Screw Fasteners (Gold Squares S1..Sn) on Dedicated Bottom Track 2 (y=214) */}
                    {selectedMenuGun.screwsAndFasteners.map((scr, idx) => {
                      const totalScr = selectedMenuGun.screwsAndFasteners.length;
                      const slotX = Math.round(135 + (idx * 650) / Math.max(1, totalScr - 1));
                      const targetX = Math.min(855, Math.max(45, scr.pinX));
                      const sy = 213;
                      return (
                        <g key={scr.code}>
                          <line
                            x1={slotX}
                            y1={sy - 7}
                            x2={targetX}
                            y2="152"
                            stroke="rgba(250,204,21,0.32)"
                            strokeWidth="0.9"
                            strokeDasharray="2 2"
                          />
                          <rect
                            x={slotX - 8}
                            y={sy - 6.5}
                            width="16"
                            height="13"
                            rx="2"
                            fill="#18181b"
                            stroke="#facc15"
                            strokeWidth="1.2"
                          />
                          <text
                            x={slotX}
                            y={sy + 2.5}
                            textAnchor="middle"
                            fill="#fde047"
                            fontFamily="JetBrains Mono, monospace"
                            fontSize="6.8"
                            fontWeight="700"
                          >
                            S{idx + 1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Clickable Weapon-Specific Blueprint Part Pins (1..N) on Dedicated Top Track (y=50) */}
                    {selectedMenuGun.uniqueParts.map((part, idx) => {
                      const partIndex1 = idx + 1;
                      const totalPts = selectedMenuGun.uniqueParts.length;
                      const slotX = Math.round(110 + (idx * 680) / Math.max(1, totalPts - 1));
                      const targetX = Math.min(855, Math.max(45, part.pinX));
                      const py = 50;
                      const isSelected =
                        ((titlePartNum - 1) % selectedMenuGun.uniqueParts.length) + 1 ===
                        partIndex1;
                      return (
                        <g
                          key={part.partCode}
                          onClick={() => setTitlePartNum(partIndex1)}
                          className="cursor-pointer"
                        >
                          <line
                            x1={slotX}
                            y1={py + 9}
                            x2={targetX}
                            y2="88"
                            stroke={isSelected ? '#facc15' : 'rgba(245,158,11,0.45)'}
                            strokeWidth={isSelected ? '1.6' : '1'}
                            strokeDasharray="3 2"
                          />
                          <circle
                            cx={slotX}
                            cy={py}
                            r={isSelected ? 10.5 : 8.5}
                            fill={isSelected ? '#f59e0b' : '#18181b'}
                            stroke={isSelected ? '#ffffff' : '#f59e0b'}
                            strokeWidth={isSelected ? '2.2' : '1.5'}
                          />
                          <text
                            x={slotX}
                            y={py + 3}
                            textAnchor="middle"
                            fill={isSelected ? '#09090b' : '#f4f4f5'}
                            fontFamily="JetBrains Mono, monospace"
                            fontSize="8.5"
                            fontWeight="800"
                          >
                            {partIndex1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Automated ISO-128 / ASME Y14.5 Dimension Callout Footer inside SVG */}
                    {automatedBlueprintSpec && (
                      <g>
                        <rect
                          x="10"
                          y="224"
                          width="880"
                          height="22"
                          rx="4"
                          fill="#09090b"
                          stroke="#1e293b"
                          strokeWidth="1"
                          opacity="0.94"
                        />
                        <text
                          x="20"
                          y="238"
                          fill="#a7f3d0"
                          fontFamily="JetBrains Mono, monospace"
                          fontSize="8"
                          fontWeight="700"
                        >
                          SECTION A-A // OAL: {automatedBlueprintSpec.overallLengthMm}.0mm ±0.01 ·{' '}
                          {automatedBlueprintSpec.baffleCount === 0
                            ? 'UNSHROUDED INTERCHANGEABLE BARREL (NO BAFFLES) · 0cc EXTERNAL PLENUM (310B DIRECT CARTRIDGE DUMP)'
                            : `SHROUD: Ø${automatedBlueprintSpec.shroudOuterDiaMm}mm · BORE: Ø${automatedBlueprintSpec.boreInnerDiaMm}mm · ${automatedBlueprintSpec.baffleCount}-BAFFLE MODERATOR`}{' '}
                          · {automatedBlueprintSpec.automatedPipelineNote.toUpperCase()}
                        </text>
                      </g>
                    )}
                  </svg>

                  {/* Automated Magnified Detail Loupe Strip (Detail B: Breech Seal & Detail C: Moderator K-Baffles) */}
                  {automatedBlueprintSpec && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/90 font-mono text-[10px]">
                      <div className="bg-zinc-950/90 border border-sky-500/40 rounded px-2.5 py-1.5 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sky-400 font-bold">
                            🔍 {automatedBlueprintSpec.breechDetailLoupe.title}
                          </div>
                          <div className="text-zinc-300">
                            {automatedBlueprintSpec.breechDetailLoupe.subtitle} · {automatedBlueprintSpec.breechDetailLoupe.sealAndThreadNote}
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold shrink-0">
                          {automatedBlueprintSpec.breechDetailLoupe.toleranceCallout}
                        </span>
                      </div>
                      <div className="bg-zinc-950/90 border border-purple-500/40 rounded px-2.5 py-1.5 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-purple-300 font-bold">
                            🔍 {automatedBlueprintSpec.moderatorDetailLoupe.title}
                          </div>
                          <div className="text-zinc-300">
                            {automatedBlueprintSpec.moderatorDetailLoupe.subtitle} · {automatedBlueprintSpec.moderatorDetailLoupe.sealAndThreadNote}
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200 font-bold shrink-0">
                          {automatedBlueprintSpec.moderatorDetailLoupe.toleranceCallout}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Inspector Card: Selected Gun Airflow + Selected Blueprint Part + Multi-Agent Review Sign-Off */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3">
                  {/* Left 6 Cols: Selected Weapon Airflow & Multi-Agent Engineering Sign-Off */}
                  <div className="md:col-span-6 border-b md:border-b-0 md:border-r border-zinc-800 pr-0 md:pr-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">
                        <span>{selectedMenuGun.shortTitle} AIRFLOW &amp; AGENT SIGN-OFF</span>
                        <span className="text-amber-300">
                          {selectedMenuAgentReview.auditStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-snug mb-1.5 line-clamp-2">
                        {selectedMenuGun.airflowCompressionToReleaseSummary}
                      </p>
                      <div className="text-[10px] font-mono text-sky-300 space-y-0.5">
                        {selectedMenuAgentReview.keyFixesAndUpgradesCompleted
                          .slice(0, 2)
                          .map((up: string, i: number) => (
                            <div key={i} className="truncate" title={up}>
                              ✓ {up}
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-purple-300 mt-1.5 pt-1 border-t border-zinc-800 truncate">
                      Lead: {selectedMenuAgentReview.assignedAgentCallsign} ({selectedMenuGun.screwsAndFasteners.length} Screws · {selectedMenuGun.oringPlacements.length} Viton Seals)
                    </div>
                  </div>

                  {/* Right 6 Cols: Selected Weapon Blueprint Part Spec & Instant .STL Download */}
                  <div className="md:col-span-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-300 truncate">
                          [{selectedMenuUniquePart.partCode}]: {selectedMenuUniquePart.partName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadCanonicalPartStlFromTitle(selectedMenuUniquePart)}
                          className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-mono text-[10px] font-bold hover:bg-sky-400 cursor-pointer shrink-0"
                        >
                          {downloadedPartCode === selectedMenuUniquePart.partCode
                            ? '✓ .STL Exported'
                            : '⬇ Printable .STL'}
                        </button>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-300 mb-1">
                        <span className="text-emerald-400 font-bold">
                          {selectedMenuUniquePart.dimensionsMm}
                        </span>{' '}
                        · Tol:{' '}
                        <strong className="text-sky-300">
                          {menuVersionAccuracy.machiningToleranceMm}
                        </strong>{' '}
                        · {selectedMenuUniquePart.material}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                        {selectedMenuUniquePart.roleDescription}
                      </p>
                    </div>

                    {/* Quick Per-Gun Part Selector Strip */}
                    <div className="flex flex-wrap items-center gap-1 mt-2 pt-1.5 border-t border-zinc-800">
                      {selectedMenuGun.uniqueParts.map((p, idx) => {
                        const pNum = idx + 1;
                        const isActivePart =
                          ((titlePartNum - 1) % selectedMenuGun.uniqueParts.length) + 1 === pNum;
                        return (
                          <button
                            key={p.partCode}
                            type="button"
                            onClick={() => setTitlePartNum(pNum)}
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] cursor-pointer ${
                              isActivePart
                                ? 'bg-amber-500 text-zinc-950 font-bold'
                                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            #{pNum} {p.partCode}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Single Flat Borderless Inline Control Hint in Bottom Safe Margin */}
        <div className="w-full max-w-[1400px] mx-auto text-[11px] font-mono text-zinc-400 tracking-wide flex flex-wrap items-center justify-between gap-2">
          <span>
            WASD Move · Mouse / Space Fire · F Cam-Lock Foregrip · Q/E Pump · R Reload · B Gunsmith Workbench · P 3-Printer Room · T Physics Range
          </span>
          <span className="text-emerald-400">
            Sub-mm Watertight B-Rep Kernel Ready · 60 FPS Locked
          </span>
        </div>
      </div>
    );
  }

  if (
    shellState === 'workbench' ||
    shellState === 'range' ||
    shellState === 'printer_room'
  ) {
    return null;
  }

  // Compute vitality pips (5 discrete sockets: Full, Damaged, Empty)
  const pipCount = 5;
  const hpPerPip = maxPlayerHp / pipCount;

  // ============================================================================
  // 2. PLAYING HUD & PAUSE / GAMEOVER MODALS
  // ============================================================================
  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
      {/* Low HP Peripheral Vignette */}
      {playerHp <= 35 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 90px rgba(239, 68, 68, 0.45)',
          }}
        />
      )}

      {/* Center Reticle & Gaze-Routed Plenum Readiness Arc */}
      {shellState === 'playing' && (
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
          aria-hidden="true"
        >
          <svg viewBox="0 0 64 64" className="w-14 h-14">
            {/* Outer dark silhouette + pressure arc */}
            <circle
              cx="32"
              cy="32"
              r="22"
              fill="none"
              stroke="#09090b"
              strokeWidth="4"
              opacity="0.75"
            />
            <circle
              cx="32"
              cy="32"
              r="22"
              fill="none"
              stroke={
                pneumaticState.foregripCamPosition === 'BOTTOM_UNLOCKED_6_OCLOCK'
                  ? '#10b981'
                  : pneumaticState.plenumPressureBar < 50
                  ? '#ef4444'
                  : '#f59e0b'
              }
              strokeWidth="2.2"
              strokeDasharray={`${Math.min(138, (pneumaticState.plenumPressureBar / Math.max(1, pneumaticState.regulatorSetpointBar)) * 138)} 140`}
              transform="rotate(-90 32 32)"
            />
            {/* Crosshair ticks & ballistic drop dots */}
            <line x1="20" y1="32" x2="27" y2="32" stroke="#f4f4f5" strokeWidth="1.5" />
            <line x1="37" y1="32" x2="44" y2="32" stroke="#f4f4f5" strokeWidth="1.5" />
            <line x1="32" y1="20" x2="32" y2="27" stroke="#f4f4f5" strokeWidth="1.5" />
            <line x1="32" y1="37" x2="32" y2="48" stroke="#f4f4f5" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="1.8" fill="#f59e0b" />
            <circle cx="32" cy="41" r="1" fill="#38bdf8" />
            <circle cx="32" cy="45" r="1" fill="#38bdf8" />
            {hitMarkerActive && (
              <g stroke="#ef4444" strokeWidth="2.2">
                <line x1="22" y1="22" x2="27" y2="27" />
                <line x1="42" y1="22" x2="37" y2="27" />
                <line x1="22" y1="42" x2="27" y2="37" />
                <line x1="42" y1="42" x2="37" y2="37" />
              </g>
            )}
          </svg>
          {pneumaticState.foregripCamPosition === 'BOTTOM_UNLOCKED_6_OCLOCK' && (
            <span className="mt-1 px-2 py-0.5 rounded bg-zinc-950/90 text-[11px] font-mono text-emerald-400">
              6 O&apos;CLOCK PUMP MODE · [Q] PULL / [E] PUSH · [F] LOCK TO SHOOT
            </span>
          )}
        </div>
      )}

      {/* Top Row: Corner Cluster 1 (Vitality, Wave/Score & Minimap) + Top-Right Utility Controls */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left Cluster: Vitality Pips + Score/Wave + Live Radar Minimap */}
        <div className="flex items-start gap-3 bg-zinc-950/90 border border-zinc-800 rounded-lg p-3 shadow-lg">
          {/* Live Navigable Level Geometry Minimap */}
          <svg
            viewBox={`0 0 ${arenaMap.gridSize * 6} ${arenaMap.gridSize * 6}`}
            className="w-24 h-24 rounded bg-zinc-900 border border-zinc-800 shrink-0"
            aria-label="Sector Radar Minimap"
          >
            {arenaMap.cells.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                if (cell === 0) return null;
                return (
                  <rect
                    key={`${rIdx}-${cIdx}`}
                    x={cIdx * 6}
                    y={rIdx * 6}
                    width={5.5}
                    height={5.5}
                    fill={cell === 3 ? '#f59e0b' : cell === 1 ? '#52525b' : '#3f3f46'}
                  />
                );
              })
            )}
            {/* Pickups */}
            {arenaMap.pickups
              .filter((p) => !p.collected)
              .map((p) => {
                const gx = (p.x / arenaMap.tileSize + arenaMap.gridSize / 2) * 6;
                const gz = (p.z / arenaMap.tileSize + arenaMap.gridSize / 2) * 6;
                return <circle key={p.id} cx={gx} cy={gz} r="2.2" fill="#38bdf8" />;
              })}
            {/* Active Enemies */}
            {arenaMap.enemies
              .filter((e) => e.hp > 0)
              .map((e) => {
                const gx = (e.x / arenaMap.tileSize + arenaMap.gridSize / 2) * 6;
                const gz = (e.z / arenaMap.tileSize + arenaMap.gridSize / 2) * 6;
                return (
                  <circle
                    key={e.id}
                    cx={gx}
                    cy={gz}
                    r={e.archetype === 'HEAVY_BREACHER_MECH' ? '3.2' : '2.4'}
                    fill={e.state === 'WINDUP_TELEGRAPH' ? '#facc15' : '#ef4444'}
                  />
                );
              })}
            {/* Player Position & Heading */}
            {(() => {
              const px = (playerPos.x / arenaMap.tileSize + arenaMap.gridSize / 2) * 6;
              const pz = (playerPos.z / arenaMap.tileSize + arenaMap.gridSize / 2) * 6;
              const lookX = px - Math.sin(playerPos.yaw) * 7;
              const lookZ = pz - Math.cos(playerPos.yaw) * 7;
              return (
                <g>
                  <line x1={px} y1={pz} x2={lookX} y2={lookZ} stroke="#10b981" strokeWidth="1.8" />
                  <circle cx={px} cy={pz} r="3" fill="#10b981" stroke="#09090b" strokeWidth="1" />
                </g>
              );
            })()}
          </svg>

          <div className="flex flex-col justify-between">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              {arenaMap.sectorName}
            </div>

            {/* Vitality Pips & Hero Integer Readout (~3:1 scale hierarchy) */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex items-center gap-1" aria-label={`Armor Integrity ${Math.round(playerHp)}`}>
                {Array.from({ length: pipCount }).map((_, idx) => {
                  const thresholdFull = (idx + 1) * hpPerPip;
                  const thresholdHalf = idx * hpPerPip + hpPerPip * 0.35;
                  const state =
                    playerHp >= thresholdFull
                      ? 'FULL'
                      : playerHp >= thresholdHalf
                      ? 'DAMAGED'
                      : 'EMPTY';
                  return (
                    <svg key={idx} viewBox="0 0 24 24" className="w-5 h-5">
                      <polygon
                        points="4,4 20,4 18,20 2,20"
                        fill={
                          state === 'FULL'
                            ? '#10b981'
                            : state === 'DAMAGED'
                            ? '#f59e0b'
                            : '#18181b'
                        }
                        stroke="#09090b"
                        strokeWidth="2"
                      />
                      {state === 'DAMAGED' && (
                        <line x1="6" y1="6" x2="16" y2="18" stroke="#09090b" strokeWidth="2" />
                      )}
                    </svg>
                  );
                })}
              </div>
              <div className="flex items-baseline gap-1 font-mono tabular-nums">
                <span className="text-2xl font-bold text-zinc-100 leading-none">
                  {Math.round(playerHp)}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase">HP</span>
              </div>
            </div>

            {/* Wave, Infected Remaining, Scavenged Filament & Score */}
            <div className="flex items-center gap-3.5 font-mono tabular-nums text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase mr-1">WAVE</span>
                <span className="text-base font-bold text-amber-400">{wave}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase mr-1">INFECTED</span>
                <span className="text-base font-bold text-zinc-100">
                  {arenaMap.enemies.filter((e) => e.hp > 0).length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase mr-1">PA12-CF</span>
                <span className="text-base font-bold text-emerald-400">
                  {inventory.pa12CfFilamentGrams}g
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase mr-1">DISKS</span>
                <span className="text-base font-bold text-sky-400">
                  {inventory.burstDiskFoils}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right Compact Utility Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Open Gunsmith Workbench [B]"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenWorkbench();
            }}
            className="px-3 h-9 rounded bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-amber-400 hover:border-amber-500 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Gunsmith [B]</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-9 h-9 rounded bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {!muted ? (
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              ) : (
                <line x1="23" y1="9" x2="17" y2="15" />
              )}
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Pause Game [P]"
            onClick={(e) => {
              e.currentTarget.blur();
              onPauseGame();
            }}
            className="w-9 h-9 rounded bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Restart Arena [K]"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestartGame();
            }}
            className="w-9 h-9 rounded bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Row: Left Status Feed + Right 4-Zone Pneumatic Manometer & Cam-Lock HUD Cluster */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-300 max-w-md">
          <div className="text-amber-400 font-semibold truncate">{loadout.name}</div>
          <div className="text-zinc-400 truncate">
            {statusMessage || 'Click Arena to lock mouse · Space/Click to Fire · [F] Cam-Lock · [Q/E] Pump'}
          </div>
        </div>

        {/* Bottom-Right 4-Zone Pneumatic Manometer & Tactical Action Cluster */}
        <div className="pointer-events-auto bg-zinc-950/95 border border-zinc-800 rounded-xl p-3.5 shadow-2xl flex flex-col gap-2.5 min-w-[360px]">
          {/* Primary Hero Readouts: Regulated Plenum Bar & Rotary Cartridge Magazine */}
          <div className="flex items-center justify-between gap-6 border-b border-zinc-800 pb-2">
            <div className="flex items-baseline gap-2 font-mono tabular-nums">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Z4 REGULATED PLENUM</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-amber-400 leading-none">
                    {Math.round(pneumaticState.plenumPressureBar)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    / {pneumaticState.regulatorSetpointBar} BAR
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2 font-mono tabular-nums text-right">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">ROTARY CARTRIDGE</div>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-3xl font-bold text-zinc-100 leading-none">
                    {pneumaticState.magazineLoaded}
                  </span>
                  <span className="text-xs text-zinc-400">
                    / {pneumaticState.magazineCapacity} RDS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 High-Pressure Storage Reservoirs (Priority Isolation Check Block) */}
          <div className="grid grid-cols-3 gap-2 font-mono tabular-nums text-xs">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded p-1.5">
              <div className="text-[10px] text-sky-400">Z1 OTB SHROUD</div>
              <div className="font-bold text-zinc-100">{Math.round(pneumaticState.otbPressureBar)} bar</div>
              <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden mt-1">
                <div
                  className="h-full bg-sky-400"
                  style={{ width: `${Math.min(100, (pneumaticState.otbPressureBar / 250) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded p-1.5">
              <div className="text-[10px] text-purple-400">Z2 BUTTSTOCK</div>
              <div className="font-bold text-zinc-100">{Math.round(pneumaticState.buttstockPressureBar)} bar</div>
              <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden mt-1">
                <div
                  className="h-full bg-purple-400"
                  style={{ width: `${Math.min(100, (pneumaticState.buttstockPressureBar / 250) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded p-1.5">
              <div className="text-[10px] text-emerald-400">Z3 FOREGRIP</div>
              <div className="font-bold text-zinc-100">{Math.round(pneumaticState.foregripPressureBar)} bar</div>
              <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${Math.min(100, (pneumaticState.foregripPressureBar / 250) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Direct Tactile Pneumatic Controls (Keyboard + Clickable) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[11px]">
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onFireWeapon();
              }}
              className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              Fire [Space]
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onReloadMagazine();
              }}
              className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-zinc-500 cursor-pointer whitespace-nowrap shrink-0"
            >
              Reload [R]
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleForegripCamLock();
              }}
              className={`px-2.5 py-1 rounded border cursor-pointer whitespace-nowrap shrink-0 ${
                pneumaticState.foregripCamPosition === 'SIDE_LOCKED_3_OCLOCK'
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                  : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
              }`}
            >
              {pneumaticState.foregripCamPosition === 'SIDE_LOCKED_3_OCLOCK'
                ? 'Cam: 3 O\'Clock Shoot [F]'
                : 'Cam: 6 O\'Clock Pump [F]'}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onPumpStroke('PULL');
              }}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-emerald-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              Pull [Q]
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onPumpStroke('PUSH');
              }}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-emerald-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              Push [E]
            </button>

            {pneumaticState.pumpMode === 'ONE_WAY_ROTARY_SELECT' && (
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onCycleOneWayTarget();
                }}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-sky-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                Collar [V]: {pneumaticState.oneWayFillTarget.split('_')[0]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================
          3. SINGLE FOCUSED STATUS MODAL CARD (PAUSED / VICTORY / GAME OVER)
         ======================================================================== */}
      {(shellState === 'paused' || shellState === 'gameover') && (
        <div className="fixed inset-0 z-30 bg-zinc-950/80 flex items-center justify-center p-4 pointer-events-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-status-heading"
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              {shellState === 'paused'
                ? 'Tactical Telemetry Hold'
                : isVictory
                ? 'Proving Ground Cleared'
                : 'Pneumatic Rig Offline'}
            </div>
            <h2
              id="modal-status-heading"
              className="text-3xl font-bold text-zinc-100 font-display mb-4"
            >
              {shellState === 'paused'
                ? 'Mission Paused'
                : isVictory
                ? 'Sector Mastery Achieved'
                : 'Operator Down'}
            </h2>

            {/* 3 Tabular-Nums Stat Tiles */}
            <div className="grid grid-cols-3 gap-2.5 mb-6 font-mono tabular-nums">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <div className="text-[10px] text-zinc-400 uppercase">SCORE / BEST</div>
                <div className="text-lg font-bold text-emerald-400">
                  {Math.round(score)} <span className="text-xs text-zinc-500">/ {Math.round(bestScore)}</span>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <div className="text-[10px] text-zinc-400 uppercase">WAVE REACHED</div>
                <div className="text-lg font-bold text-amber-400">Wave {wave}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <div className="text-[10px] text-zinc-400 uppercase">CLEAR TIME</div>
                <div className="text-lg font-bold text-zinc-100">{Math.round(clearTimeSec)}s</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {shellState === 'paused' ? (
                <button
                  type="button"
                  onClick={onResumeGame}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                >
                  Resume Combat [Esc]
                </button>
              ) : (
                <button
                  type="button"
                  data-start="true"
                  onClick={onRestartGame}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                >
                  {isVictory ? 'Deploy Next Wave' : 'Try Again'}
                </button>
              )}

              <button
                type="button"
                onClick={onOpenWorkbench}
                className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-semibold text-xs hover:border-amber-500 cursor-pointer whitespace-nowrap"
              >
                Gunsmith [B]
              </button>

              <button
                type="button"
                onClick={onReturnToTitle}
                className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs cursor-pointer whitespace-nowrap"
              >
                Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
