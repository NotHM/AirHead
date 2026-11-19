import React, { useEffect, useState } from 'react';
import {
  PhysicsSimulationResult,
  SavedWeaponVersion,
} from '../game/popular25Catalog';
import { FourZonePneumaticState } from '../wasm/pneumaticWasm';
import {
  RANGE_5_CALIBERS_CATALOG,
  RangeCaliberId,
  REAL_LIFE_AIR_STORAGE_EXPLANATIONS,
  RealLifeAirStorageTypeId,
  PRINCESS_DONUT_4_PHASE_TRIGGER_LOCK_BARREL_PULL_SPECS,
  simulateAirReleasePelletAndModeratorPhysics,
  simulateCaliberImpactOnDccEnemies,
} from '../game/airPhysicsRangeAndStorageEngine';

interface VirtualPhysicsRangeProps {
  activeVersion: SavedWeaponVersion;
  savedVersions: SavedWeaponVersion[];
  pneumaticState?: FourZonePneumaticState;
  simResult: PhysicsSimulationResult;
  inventory?: unknown;
  customCaliberMm?: number;
  explodedAmount: number;
  componentExplodeAmount?: number;
  xrayGasMode: boolean;
  onSelectVersion: (v: SavedWeaponVersion) => void;
  onChangeCustomCaliber?: (calMm: number) => void;
  onSetExploded: (val: number) => void;
  onSetComponentExploded?: (val: number) => void;
  onToggleXray: () => void;
  onFireRangeShot: () => void;
  onPumpRangeStroke?: () => void;
  onPumpStroke?: () => void;
  onRefillRange250Bar?: () => void;
  onBackToWorkbench: () => void;
  onDeployToArena?: () => void;
  onDeployZombieRaid?: () => void;
}

function mapCaliberMmToRangeCaliberId(calMm: number): RangeCaliberId {
  if (calMm <= 6.8) return 'CAL_25';
  if (calMm <= 8.5) return 'CAL_30';
  if (calMm <= 12.0) return 'CAL_45';
  if (calMm <= 15.0) return 'CAL_50';
  return 'CAL_72';
}

export const VirtualPhysicsRange: React.FC<VirtualPhysicsRangeProps> = ({
  activeVersion,
  savedVersions,
  pneumaticState,
  simResult,
  customCaliberMm,
  explodedAmount,
  componentExplodeAmount: propComponentExplodeAmount,
  xrayGasMode,
  onSelectVersion,
  onChangeCustomCaliber,
  onSetExploded,
  onSetComponentExploded,
  onToggleXray,
  onFireRangeShot,
  onPumpRangeStroke,
  onPumpStroke,
  onRefillRange250Bar,
  onBackToWorkbench,
  onDeployToArena,
  onDeployZombieRaid,
}) => {
  const effectiveCaliberMm =
    customCaliberMm ?? simResult.otbCadSpec?.targetCaliberMm ?? 12.7;
  const [selectedCaliberId, setSelectedCaliberId] = useState<RangeCaliberId>(() =>
    mapCaliberMmToRangeCaliberId(effectiveCaliberMm)
  );
  const [selectedStorageId, setSelectedStorageId] =
    useState<RealLifeAirStorageTypeId>('PRINCESS_DONUT_REXP_FORK_SLIDING_BARREL_250B');
  const [airOnlyIsolatedView, setAirOnlyIsolatedView] = useState<boolean>(false);
  const [cutawaySubMode, setCutawaySubMode] = useState<
    'INTEGRATED_RESERVE_AND_MODERATOR_FLOW' | 'PRINCESS_DONUT_4PHASE_BARREL_PULL'
  >('INTEGRATED_RESERVE_AND_MODERATOR_FLOW');
  const [donutPhaseIdx, setDonutPhaseIdx] = useState<0 | 1 | 2 | 3>(0);
  const [activeStationIdx, setActiveStationIdx] = useState<number>(8);
  const [selectedEnemyIdx, setSelectedEnemyIdx] = useState<number>(0);
  const [localComponentExplode, setLocalComponentExplode] = useState<number>(0);

  const componentExplodeAmount =
    propComponentExplodeAmount !== undefined
      ? propComponentExplodeAmount
      : localComponentExplode;

  const handleSetComponentExploded = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setLocalComponentExplode(clamped);
    onSetComponentExploded?.(clamped);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bar250-component-explode', {
          detail: { componentExplodeAmount: clamped },
        })
      );
    }
  };

  const handleToggleAirOnlyIsolatedView = () => {
    const next = !airOnlyIsolatedView;
    setAirOnlyIsolatedView(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bar250-air-only-storage-view', {
          detail: { airOnlyStorageView: next },
        })
      );
    }
  };

  const handleOpenPrincessDonutCutaway = () => {
    setSelectedStorageId('PRINCESS_DONUT_REXP_FORK_SLIDING_BARREL_250B');
    setCutawaySubMode('PRINCESS_DONUT_4PHASE_BARREL_PULL');
    if (!airOnlyIsolatedView) {
      setAirOnlyIsolatedView(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('bar250-air-only-storage-view', {
            detail: { airOnlyStorageView: true },
          })
        );
      }
    }
  };

  // Ensure air-only view resets cleanly when leaving the Physics Range
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('bar250-air-only-storage-view', {
            detail: { airOnlyStorageView: false },
          })
        );
      }
    };
  }, []);

  const handleSelectCaliber = (calId: RangeCaliberId) => {
    setSelectedCaliberId(calId);
    const spec = RANGE_5_CALIBERS_CATALOG.find((c) => c.caliberId === calId);
    if (spec && onChangeCustomCaliber) {
      onChangeCustomCaliber(spec.caliberMm);
    }
  };

  const gasSim = simulateAirReleasePelletAndModeratorPhysics(
    selectedCaliberId,
    selectedStorageId
  );
  const enemyImpacts = simulateCaliberImpactOnDccEnemies(
    selectedCaliberId,
    selectedStorageId
  );
  const activeStation =
    gasSim.stations[activeStationIdx] || gasSim.stations[0];
  const activeEnemyImpact =
    enemyImpacts[selectedEnemyIdx] || enemyImpacts[0];
  const activeDonutPhase =
    PRINCESS_DONUT_4_PHASE_TRIGGER_LOCK_BARREL_PULL_SPECS[donutPhaseIdx] ||
    PRINCESS_DONUT_4_PHASE_TRIGGER_LOCK_BARREL_PULL_SPECS[0];

  const hasIntegratedOtbReserveAndModerator =
    selectedStorageId === 'PRINCESS_DONUT_REXP_FORK_SLIDING_BARREL_250B' ||
    selectedStorageId === 'OVER_BARREL_CONCENTRIC_SHROUD_250B' ||
    selectedStorageId === 'HELICAL_4_RESERVE_HERMETIC_P50_250B' ||
    selectedStorageId === 'ONBOARD_3STAGE_300B_HAND_PUMP_ASCENT';

  const handleFireAndAnimateGas = () => {
    onFireRangeShot();
    setActiveStationIdx(14);
    if (cutawaySubMode === 'PRINCESS_DONUT_4PHASE_BARREL_PULL') {
      setDonutPhaseIdx(3);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-2.5 font-mono">
      {/* ====================================================================
          TOP HEADER: EXCLUSIVE AIR PHYSICS, .25–.72 CALIBER & COMPONENT EXPLODE LAB
         ==================================================================== */}
      <header className="pointer-events-auto flex flex-col gap-1.5 bg-zinc-950/94 border border-emerald-500/60 px-3.5 py-2 rounded-xl max-w-[1460px] w-full mx-auto shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
              EXCLUSIVE AIR PHYSICS &amp; .25 / .30 / .45 / .50 / .72 TERMINAL BALLISTICS RANGE · CONTAINER RELEASE → BORE → MODERATOR EXPANSION
            </div>
            <h2 className="text-sm md:text-base font-bold text-zinc-100 font-display truncate">
              {activeVersion.customName} — {gasSim.caliber.imperialLabel} ({gasSim.caliber.massGrains}gr) · {gasSim.muzzleVelocityMs} m/s ({gasSim.muzzleVelocityFps} FPS) · {gasSim.muzzleEnergyJoules} J ({gasSim.muzzleEnergyFtLbs} ft-lbs)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <select
              aria-label="Select Weapon Version in Range"
              value={activeVersion.versionId}
              onChange={(e) => {
                const found = savedVersions.find((v) => v.versionId === e.target.value);
                if (found) {
                  onSelectVersion(found);
                }
              }}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-amber-300 font-bold cursor-pointer"
            >
              {savedVersions.map((v) => (
                <option key={v.versionId} value={v.versionId}>
                  {v.versionTag}: {v.customName} ({v.computedEnergyJoules}J)
                </option>
              ))}
            </select>

            {/* Quick Button: Princess Donut (REX-P Fork) Trigger-Lock Barrel Pull + Watertight Seal Cutaway */}
            <button
              type="button"
              data-testid="open-princess-donut-cutaway-btn"
              onClick={handleOpenPrincessDonutCutaway}
              className="px-2.5 py-1 rounded text-xs font-bold border bg-pink-500/20 border-pink-400 text-pink-200 hover:bg-pink-400 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              👑 Princess Donut (REX-P Fork) Cutaway
            </button>

            {/* Toggle Isolated Air-Only Storage & Moderator View */}
            <button
              type="button"
              data-testid="toggle-air-only-storage-view"
              onClick={handleToggleAirOnlyIsolatedView}
              className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                airOnlyIsolatedView
                  ? 'bg-cyan-400 text-zinc-950 border-cyan-200 shadow-lg'
                  : 'bg-cyan-950/70 border-cyan-400/70 text-cyan-200 hover:bg-cyan-400 hover:text-zinc-950'
              }`}
            >
              🔬 {airOnlyIsolatedView ? 'Exit Cutaway & Storage View' : 'Air-Only Storage & Moderator Cutaways'}
            </button>

            <button
              type="button"
              onClick={onToggleXray}
              className={`px-2 py-1 rounded text-xs font-semibold border cursor-pointer ${
                xrayGasMode
                  ? 'bg-sky-400 text-zinc-950 border-sky-300'
                  : 'bg-zinc-900 text-sky-300 border-zinc-700'
              }`}
            >
              {xrayGasMode ? 'X-Ray: ON' : 'X-Ray: OFF'}
            </button>

            {/* Weapon Explode */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => onSetExploded(explodedAmount > 0.1 ? 0 : 0.72)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  explodedAmount > 0.1
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-amber-300'
                }`}
              >
                {explodedAmount > 0.1 ? 'Assemble Gun' : 'Weapon Explode'}
              </button>
              <input
                type="range"
                aria-label="Range Weapon Explode"
                min={0}
                max={1}
                step={0.05}
                value={explodedAmount}
                onChange={(e) => onSetExploded(parseFloat(e.target.value))}
                className="w-10 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Component-Level Micro-Explode */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-fuchsia-500/60 rounded px-1.5 py-0.5">
              <button
                type="button"
                onClick={() =>
                  handleSetComponentExploded(
                    componentExplodeAmount > 0.1 ? 0 : 0.78
                  )
                }
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  componentExplodeAmount > 0.1
                    ? 'bg-fuchsia-400 text-zinc-950'
                    : 'text-fuchsia-300'
                }`}
              >
                {componentExplodeAmount > 0.1
                  ? 'Assemble Parts'
                  : '🔩 Component Explode'}
              </button>
              <input
                type="range"
                aria-label="Range Component Explode"
                min={0}
                max={1}
                step={0.05}
                value={componentExplodeAmount}
                onChange={(e) =>
                  handleSetComponentExploded(parseFloat(e.target.value))
                }
                className="w-10 accent-fuchsia-400 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={onBackToWorkbench}
              className="px-2.5 py-1 rounded text-xs bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white cursor-pointer"
            >
              Gunsmith [B]
            </button>

            <button
              type="button"
              onClick={onDeployToArena ?? onDeployZombieRaid}
              className="px-3 py-1 rounded text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer"
            >
              Deploy 3D Raid
            </button>
          </div>
        </div>

        {/* Row 2: 5 Caliber Selector (.25, .30, .45, .50, .72) + 8 Real-Life Air Storage Architecture Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80 text-[10.5px]">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-amber-400 font-bold uppercase mr-1">
              SIMULATE PELLET / SLUG CALIBER:
            </span>
            {RANGE_5_CALIBERS_CATALOG.map((cal) => (
              <button
                key={cal.caliberId}
                type="button"
                data-testid={`range-caliber-${cal.caliberId}`}
                onClick={() => handleSelectCaliber(cal.caliberId)}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCaliberId === cal.caliberId
                    ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold shadow'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400'
                }`}
              >
                {cal.imperialLabel} ({cal.massGrains}gr)
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-cyan-400 font-bold uppercase">
              REAL-LIFE AIR STORAGE &amp; CUTAWAY TYPE:
            </span>
            <select
              aria-label="Real-Life Air Storage Architecture"
              value={selectedStorageId}
              onChange={(e) =>
                setSelectedStorageId(e.target.value as RealLifeAirStorageTypeId)
              }
              className="bg-zinc-900 border border-cyan-500/60 rounded px-2 py-0.5 text-[10.5px] text-cyan-200 font-bold cursor-pointer"
            >
              {REAL_LIFE_AIR_STORAGE_EXPLANATIONS.map((st) => (
                <option key={st.storageId} value={st.storageId}>
                  {st.title} ({st.weaponsUsingThis})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ====================================================================
          ISOLATED AIR-ONLY STORAGE, INTEGRATED RESERVE+MODERATOR & PRINCESS DONUT CUTAWAY STUDIO
          (Shown when user clicks "🔬 Air-Only Storage & Moderator Cutaways" or "👑 Princess Donut Cutaway")
         ==================================================================== */}
      {airOnlyIsolatedView && (
        <div className="pointer-events-auto max-w-[1460px] w-full mx-auto bg-zinc-950/96 border-2 border-cyan-400/85 rounded-xl p-3 shadow-2xl flex flex-col gap-2 text-xs max-h-[58vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <div>
              <div className="text-[10px] text-cyan-300 font-bold uppercase">
                🔬 ISOLATED AIR-ONLY STORAGE, INTEGRATED RESERVE+MODERATOR BULKHEAD &amp; TRIGGER-LOCK BARREL PULL CUTAWAYS
              </div>
              <div className="text-sm font-bold text-white">
                {gasSim.storage.title} — Used on:{' '}
                <span className="text-amber-300">{gasSim.storage.weaponsUsingThis}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setCutawaySubMode('INTEGRATED_RESERVE_AND_MODERATOR_FLOW')
                }
                className={`px-2.5 py-1 rounded border text-[10px] font-bold cursor-pointer ${
                  cutawaySubMode === 'INTEGRATED_RESERVE_AND_MODERATOR_FLOW'
                    ? 'bg-cyan-400 text-zinc-950 border-cyan-200'
                    : 'bg-zinc-900 text-cyan-200 border-cyan-500/50'
                }`}
              >
                🌊 Cutaway 1: Container / Integrated OTB Reserve → 180° Breech U-Turn → Moderator
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStorageId(
                    'PRINCESS_DONUT_REXP_FORK_SLIDING_BARREL_250B'
                  );
                  setCutawaySubMode('PRINCESS_DONUT_4PHASE_BARREL_PULL');
                }}
                className={`px-2.5 py-1 rounded border text-[10px] font-bold cursor-pointer ${
                  cutawaySubMode === 'PRINCESS_DONUT_4PHASE_BARREL_PULL'
                    ? 'bg-pink-400 text-zinc-950 border-pink-200'
                    : 'bg-zinc-900 text-pink-200 border-pink-500/50'
                }`}
              >
                👑 Cutaway 2: &ldquo;Princess Donut&rdquo; (REX-P Fork) Trigger-Lock Barrel Pull &amp; Watertight Seal (4 Phases)
              </button>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold">
                Fill: {gasSim.storage.fillPressureBar}B → Reg/Plenum: {gasSim.storage.regulatedPlenumBar}B · Vol: {gasSim.storage.vesselVolumeCc}cc
              </span>
              <button
                type="button"
                onClick={handleToggleAirOnlyIsolatedView}
                className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-600 text-amber-300 hover:text-white text-[10px] font-bold cursor-pointer"
              >
                ✕ Return to Standard Range View
              </button>
            </div>
          </div>

          {/* Quick-Select Cutaway Switcher for All 8 Storage & Weapon Architectures */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-amber-300 font-bold uppercase mr-1">
              SELECT WEAPON / STORAGE CUTAWAY ({REAL_LIFE_AIR_STORAGE_EXPLANATIONS.length} ARCHITECTURES):
            </span>
            {REAL_LIFE_AIR_STORAGE_EXPLANATIONS.map((st) => {
              const isSel = selectedStorageId === st.storageId;
              const shortBadge =
                st.storageId === 'PRINCESS_DONUT_REXP_FORK_SLIDING_BARREL_250B'
                  ? '👑 #02B Princess Donut (REX-P Fork)'
                  : st.storageId === 'SACRIFICIAL_BURST_SHELL_220B'
                  ? '#01/#03 220B Burst Shell'
                  : st.storageId === 'COAXIAL_REAR_CYLINDER_POPPET_250B'
                  ? '#02 REX-P Coaxial'
                  : st.storageId === 'FOLDING_BUTTSTOCK_TWIN_TUBE_EAR_300B'
                  ? '#04 Leshiy 2 Twin-Tube'
                  : st.storageId === 'OVER_BARREL_CONCENTRIC_SHROUD_250B'
                  ? '#05/#09 Integrated OTB Reserve+Mod'
                  : st.storageId === 'DUAL_PARALLEL_OVER_UNDER_SMG_250B'
                  ? '#06 MP30 Dual-Cylinder'
                  : st.storageId === 'HELICAL_4_RESERVE_HERMETIC_P50_250B'
                  ? '#07 P50 4-Reserve Hermetic'
                  : '#08 Ascent 300B Tri-Pump';
              return (
                <button
                  key={st.storageId}
                  type="button"
                  onClick={() => setSelectedStorageId(st.storageId)}
                  className={`px-2 py-0.5 rounded border text-[9.5px] cursor-pointer transition-colors ${
                    isSel
                      ? 'bg-cyan-400 text-zinc-950 border-cyan-200 font-bold'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-cyan-400'
                  }`}
                >
                  {shortBadge}
                </button>
              );
            })}
          </div>

          {/* ====================================================================
              CUTAWAY MODE 2: "PRINCESS DONUT" (REX-P FORK) 4-PHASE TRIGGER-LOCK
                              BARREL PULL, ROUND INSERTION & WATERTIGHT SEAL STEPPER
             ==================================================================== */}
          {cutawaySubMode === 'PRINCESS_DONUT_4PHASE_BARREL_PULL' ? (
            <div className="bg-zinc-900/95 border border-pink-500/60 rounded-lg p-2.5 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-pink-300 font-bold text-[11px] uppercase">
                    👑 &ldquo;PRINCESS DONUT&rdquo; (REX-P FORK) — HOW TRIGGER-LOCK PULLS BARREL OUT (+38mm), LOADS ROUND &amp; WATERTIGHT-SEALS BEFORE FIRING:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {PRINCESS_DONUT_4_PHASE_TRIGGER_LOCK_BARREL_PULL_SPECS.map(
                    (ph) => (
                      <button
                        key={ph.phaseIndex}
                        type="button"
                        onClick={() => setDonutPhaseIdx(ph.phaseIndex)}
                        className={`px-2 py-0.5 rounded border text-[9.5px] font-bold cursor-pointer ${
                          donutPhaseIdx === ph.phaseIndex
                            ? 'bg-pink-400 text-zinc-950 border-pink-200'
                            : 'bg-zinc-950 text-pink-200 border-zinc-700 hover:border-pink-400'
                        }`}
                      >
                        {ph.phaseBadge}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Animated SVG Cutaway of Princess Donut Trigger-Lock Sliding Barrel + Watertight Seal + Integrated Reserve & Moderator */}
              <svg
                viewBox="0 0 940 190"
                className="w-full h-40 md:h-44 select-none"
                role="img"
                aria-label="Princess Donut REX-P Fork Trigger-Lock Sliding Barrel and Watertight Seal Cutaway"
              >
                <rect x="0" y="0" width="940" height="190" rx="8" fill="#070510" />

                {/* 1. Rear Coaxial 250-Bar Air Bottle (#37-DONUT) + Balanced Inline PEEK Poppet (#32-DONUT) */}
                <rect
                  x="16"
                  y="36"
                  width="185"
                  height="62"
                  rx="10"
                  fill="#0284c7"
                  fillOpacity="0.28"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="26" y="56" fill="#7dd3fc" fontSize="9.5" fontWeight="bold">
                  1. REAR 250B BOTTLE (190cc)
                </text>
                <text x="26" y="70" fill="#bae6fd" fontSize="8.5">
                  + Inline Balanced Poppet (#32)
                </text>
                <text x="26" y="84" fill="#38bdf8" fontSize="8.5">
                  Coupled to 145cc OTB Reserve
                </text>

                {/* Receiver Breech Socket & Triple Watertight Seal Seat */}
                <rect
                  x="202"
                  y="28"
                  width="88"
                  height="78"
                  rx="6"
                  fill="#1e1b4b"
                  stroke="#f472b6"
                  strokeWidth="2"
                />
                <text x="210" y="22" fill="#f9a8d4" fontSize="9" fontWeight="bold">
                  WATERTIGHT BREECH CONE SOCKET (24.5% FFKM + PU-95A SQUEEZE)
                </text>

                {/* Compute dynamic X shift when Trigger-Lock pulls the Barrel + Integrated Shroud forward (+38mm -> +68px on diagram) */}
                {(() => {
                  const pullShiftPx =
                    activeDonutPhase.barrelAxialOffsetMm > 0 ? 68 : 0;
                  const barrelStartX = 252 + pullShiftPx;
                  const bulkheadX = barrelStartX + 225;
                  const modStartX = bulkheadX + 8;

                  return (
                    <g>
                      {/* Twin Stainless Linear Barrel Pull Guide Rods */}
                      <line
                        x1="230"
                        y1="96"
                        x2={barrelStartX + 80}
                        y2="96"
                        stroke="#94a3b8"
                        strokeWidth="3.5"
                        strokeDasharray="5 2"
                      />

                      {/* 2. Integrated Concentric Over-the-Barrel (OTB) 250-Bar Air Reserve (Rear Half of Shroud) */}
                      <rect
                        x={barrelStartX + 26}
                        y="24"
                        width="198"
                        height="86"
                        rx="6"
                        fill="#0369a1"
                        fillOpacity="0.3"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      <text
                        x={barrelStartX + 34}
                        y="40"
                        fill="#7dd3fc"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        2. INTEGRATED OTB AIR RESERVE (145cc / 250B)
                      </text>
                      <text
                        x={barrelStartX + 34}
                        y="102"
                        fill="#bae6fd"
                        fontSize="8.5"
                      >
                        Flows rearward → 180° U-turn behind round!
                      </text>

                      {/* 180-Degree Rearward U-Turn Airflow Arrows from OTB Reserve into Breech */}
                      <path
                        d={`M ${barrelStartX + 60} 44 L ${barrelStartX - 18} 44 L ${barrelStartX - 18} 64 L ${barrelStartX + 12} 64`}
                        fill="none"
                        stroke={donutPhaseIdx === 3 ? '#facc15' : '#22d3ee'}
                        strokeWidth="3"
                        strokeDasharray="5 3"
                      />

                      {/* 3. Center Gold-Anodized Hermetic Bulkhead Wall (Isolates 250B Reserve from Front Moderator!) */}
                      <rect
                        x={bulkheadX}
                        y="21"
                        width="10"
                        height="92"
                        fill="#facc15"
                        stroke="#fef08a"
                        strokeWidth="1.5"
                      />
                      <text
                        x={bulkheadX - 38}
                        y="16"
                        fill="#fde047"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        HERMETIC BULKHEAD WALL
                      </text>

                      {/* 4. Integrated Front 7-Baffle Royal Reflex Moderator (Forward of Bulkhead) */}
                      <rect
                        x={modStartX}
                        y="24"
                        width="215"
                        height="86"
                        rx="6"
                        fill="#4c1d95"
                        fillOpacity="0.36"
                        stroke="#c084fc"
                        strokeWidth="2"
                      />
                      {[0, 1, 2, 3, 4, 5].map((bIdx) => {
                        const bx = modStartX + 20 + bIdx * 31;
                        return (
                          <g key={bIdx}>
                            <polygon
                              points={`${bx},26 ${bx + 11},48 ${bx + 11},52 ${bx},32`}
                              fill="#e879f9"
                            />
                            <polygon
                              points={`${bx},108 ${bx + 11},86 ${bx + 11},82 ${bx},102`}
                              fill="#e879f9"
                            />
                          </g>
                        );
                      })}
                      <text
                        x={modStartX + 12}
                        y="40"
                        fill="#f5d0fe"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        4. FRONT 7-BAFFLE MODERATOR (-31 dB)
                      </text>

                      {/* 5. Sliding Rifled Barrel Liner + 12° Tapered Brass Breech Cone + Triple Watertight O-Rings */}
                      <polygon
                        points={`${barrelStartX},56 ${barrelStartX + 24},50 ${barrelStartX + 24},84 ${barrelStartX},78`}
                        fill="#fbbf24"
                        stroke="#fef08a"
                        strokeWidth="1.5"
                      />
                      {/* Triple Watertight Seals (2x Pink FFKM Radial O-Rings + 1x Cyan PU-95A Face Seal) */}
                      <circle
                        cx={barrelStartX + 4}
                        cy="54"
                        r="4"
                        fill="#22d3ee"
                      />
                      <circle
                        cx={barrelStartX + 4}
                        cy="80"
                        r="4"
                        fill="#22d3ee"
                      />
                      <circle
                        cx={barrelStartX + 12}
                        cy="52"
                        r="4"
                        fill="#ec4899"
                      />
                      <circle
                        cx={barrelStartX + 12}
                        cy="82"
                        r="4"
                        fill="#ec4899"
                      />
                      <circle
                        cx={barrelStartX + 20}
                        cy="51"
                        r="4"
                        fill="#ec4899"
                      />
                      <circle
                        cx={barrelStartX + 20}
                        cy="83"
                        r="4"
                        fill="#ec4899"
                      />

                      {/* Uncovered Rifled Barrel Bore running through Reserve & Moderator */}
                      <rect
                        x={barrelStartX + 24}
                        y="55"
                        width="388"
                        height="24"
                        fill="#0f172a"
                        stroke="#e2e8f0"
                        strokeWidth="2"
                      />

                      {/* Open Breech Gap Callout when Barrel is Pulled Forward (+38mm in Phase 1 & 2) */}
                      {pullShiftPx > 0 && (
                        <g>
                          <rect
                            x="252"
                            y="46"
                            width="66"
                            height="42"
                            rx="4"
                            fill="#ec4899"
                            fillOpacity="0.22"
                            stroke="#f472b6"
                            strokeDasharray="4 2"
                          />
                          <text
                            x="256"
                            y="64"
                            fill="#fbcfe8"
                            fontSize="8.5"
                            fontWeight="bold"
                          >
                            +38mm OPEN
                          </text>
                          <text x="256" y="76" fill="#f9a8d4" fontSize="8">
                            LOAD WINDOW
                          </text>
                        </g>
                      )}

                      {/* Round / Projectile Position in Each Phase */}
                      {(() => {
                        const slugX =
                          donutPhaseIdx === 0
                            ? 284 // Hovering above open barrel throat in Phase 1
                            : donutPhaseIdx === 1
                            ? barrelStartX + 14 // Seated directly into pulled-out barrel throat in Phase 2
                            : donutPhaseIdx === 2
                            ? barrelStartX + 14 // Locked inside watertight sealed breech cone in Phase 3
                            : barrelStartX + 295; // Accelerating down bore into moderator in Phase 4!
                        const slugY = donutPhaseIdx === 0 ? 32 : 67;
                        return (
                          <g>
                            {donutPhaseIdx === 3 && (
                              <rect
                                x={barrelStartX + 10}
                                y="58"
                                width="282"
                                height="18"
                                fill="#22d3ee"
                                fillOpacity="0.55"
                              />
                            )}
                            <polygon
                              points={`${slugX - 10},${slugY - 8} ${slugX + 12},${slugY - 5} ${slugX + 12},${slugY + 5} ${slugX - 10},${slugY + 8}`}
                              fill="#f59e0b"
                              stroke="#fef08a"
                              strokeWidth="1.5"
                            />
                          </g>
                        );
                      })()}

                      {/* 6. 5-Hole Trigger-Guard Cam-Lock Underlever (#14-DONUT) */}
                      <g
                        transform={`translate(242, 108) rotate(${activeDonutPhase.leverAngleDeg > 0 ? 24 : 0})`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width="155"
                          height="20"
                          rx="6"
                          fill="#334155"
                          stroke="#f472b6"
                          strokeWidth="2"
                        />
                        {[0, 1, 2, 3, 4].map((h) => (
                          <circle
                            key={h}
                            cx={24 + h * 26}
                            cy="10"
                            r="5"
                            fill="#090d16"
                            stroke="#94a3b8"
                          />
                        ))}
                        <text
                          x="12"
                          y="34"
                          fill="#f472b6"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          #14-DONUT TRIGGER-LOCK CAM ({activeDonutPhase.leverAngleDeg}° · Barrel Offset +{activeDonutPhase.barrelAxialOffsetMm}mm · Seal Squeeze {activeDonutPhase.sealCompressionPct}%)
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>

              {/* Active Phase Detailed Mechanical & Watertight Seal Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
                <div className="bg-zinc-950 border border-pink-500/40 rounded p-2">
                  <div className="text-pink-300 font-bold mb-0.5">
                    ⚙️ {activeDonutPhase.phaseBadge}: {activeDonutPhase.title}
                  </div>
                  <p className="text-zinc-200 leading-relaxed">
                    {activeDonutPhase.mechanicalActionDetail}
                  </p>
                </div>
                <div className="bg-zinc-950 border border-cyan-500/40 rounded p-2">
                  <div className="text-cyan-300 font-bold mb-0.5">
                    💧 WATERTIGHT SEAL &amp; INTEGRATED RESERVE-TO-MODERATOR AIRFLOW:
                  </div>
                  <p className="text-zinc-200 leading-relaxed">
                    {activeDonutPhase.watertightSealAndAirflowDetail}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ====================================================================
               CUTAWAY MODE 1: CONTAINER / INTEGRATED OTB AIR RESERVE + HERMETIC BULKHEAD
                               + 180° BREECH U-TURN + BORE + MODERATOR EXPANSION DIAGRAM
               ==================================================================== */
            <div className="bg-zinc-900/90 border border-cyan-500/40 rounded-lg p-2">
              <svg
                viewBox="0 0 920 170"
                className="w-full h-36 md:h-40 select-none"
                role="img"
                aria-label="Air Storage Release, Bore Pellet Push, and Moderator Baffle Expansion Diagram"
              >
                <rect x="0" y="0" width="920" height="170" rx="8" fill="#050b14" />

                {/* If architecture has Integrated Over-the-Barrel Air Reserve + Moderator, render the Coaxial Annular Reserve & Center Hermetic Bulkhead! */}
                {hasIntegratedOtbReserveAndModerator && (
                  <g>
                    <rect
                      x="280"
                      y="16"
                      width="290"
                      height="68"
                      rx="6"
                      fill="#0284c7"
                      fillOpacity="0.22"
                      stroke="#38bdf8"
                      strokeWidth="1.75"
                      strokeDasharray="5 2"
                    />
                    <text
                      x="288"
                      y="29"
                      fill="#7dd3fc"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      INTEGRATED OVER-BARREL (OTB) ANNULAR AIR RESERVE ({gasSim.storage.fillPressureBar}B)
                    </text>
                    {/* Rearward flow arrow from OTB Reserve into 180° Breech U-Turn */}
                    <path
                      d="M 410 76 L 265 76 L 265 50 L 288 50"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                    {/* Gold Center Hermetic Bulkhead Wall isolating OTB Reserve from Front Moderator */}
                    <rect
                      x="572"
                      y="14"
                      width="10"
                      height="72"
                      fill="#facc15"
                      stroke="#fef08a"
                      strokeWidth="1.5"
                    />
                    <text
                      x="518"
                      y="11"
                      fill="#fde047"
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      HERMETIC BULKHEAD (SEALS 250B RESERVE FROM MODERATOR)
                    </text>
                  </g>
                )}

                {/* Stage 1: Primary Pressurized Air Storage Container */}
                <rect
                  x="18"
                  y="94"
                  width="260"
                  height="54"
                  rx="10"
                  fill="#0284c7"
                  fillOpacity="0.28"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="28" y="114" fill="#7dd3fc" fontSize="10" fontWeight="bold">
                  1. AIR STORAGE CONTAINER ({gasSim.storage.fillPressureBar} BAR / {gasSim.storage.vesselVolumeCc}cc)
                </text>
                <text x="28" y="130" fill="#bae6fd" fontSize="9">
                  Releases {gasSim.releasedAirMassGrams}g air via {gasSim.storage.valveOpeningTimeMs}ms valve/foil opening
                </text>
                <text x="28" y="142" fill="#67e8f9" fontSize="8.5">
                  180° Breech U-Turn routes gas behind projectile skirt
                </text>

                {/* 180° Breech Transfer Port Loop */}
                <path
                  d="M 255 94 L 255 50 L 295 50"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="6"
                  strokeDasharray="6 3"
                />
                <circle cx="255" cy="72" r="5.5" fill="#facc15" />

                {/* Stage 2: Uncovered Rifled Barrel Bore & Accelerating Pellet */}
                <rect
                  x="280"
                  y="38"
                  width="360"
                  height="24"
                  fill="#0f172a"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                {/* Expanding High-Pressure Gas Column behind Pellet */}
                <rect
                  x="282"
                  y="41"
                  width={Math.max(30, Math.min(340, activeStationIdx * 22))}
                  height="18"
                  fill="#06b6d4"
                  fillOpacity="0.45"
                />
                {/* Pellet / Slug */}
                <polygon
                  points={`${Math.min(630, 310 + activeStationIdx * 21)},41 ${Math.min(648, 328 + activeStationIdx * 21)},45 ${Math.min(648, 328 + activeStationIdx * 21)},55 ${Math.min(630, 310 + activeStationIdx * 21)},59`}
                  fill="#f59e0b"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                />
                <text x="290" y="98" fill="#fbbf24" fontSize="10" fontWeight="bold">
                  2. BORE PROPULSION ({gasSim.caliber.imperialLabel} · Peak Force {gasSim.peakBreechThrustNewtons} N → {gasSim.muzzleVelocityMs} m/s)
                </text>

                {/* Stage 3: Multi-Baffle Moderator / Silencer Expansion Chamber */}
                <rect
                  x="640"
                  y="20"
                  width="262"
                  height="60"
                  rx="6"
                  fill="#3b0764"
                  fillOpacity="0.32"
                  stroke="#c084fc"
                  strokeWidth="2"
                />
                {[0, 1, 2, 3, 4, 5].map((bIdx) => {
                  const bx = 668 + bIdx * 38;
                  return (
                    <g key={bIdx}>
                      <polygon
                        points={`${bx},22 ${bx + 14},38 ${bx + 14},42 ${bx},28`}
                        fill="#a855f7"
                      />
                      <polygon
                        points={`${bx},78 ${bx + 14},62 ${bx + 14},58 ${bx},72`}
                        fill="#a855f7"
                      />
                      <circle
                        cx={bx + 8}
                        cy={30}
                        r="3.5"
                        fill="#38bdf8"
                        fillOpacity="0.75"
                      />
                      <circle
                        cx={bx + 8}
                        cy={68}
                        r="3.5"
                        fill="#38bdf8"
                        fillOpacity="0.75"
                      />
                    </g>
                  );
                })}
                <text x="646" y="98" fill="#d8b4fe" fontSize="10" fontWeight="bold">
                  3. MODERATOR BAFFLE EXPANSION ({gasSim.moderatorPeakPressureBar}B → {gasSim.moderatorExitPressureBar}B)
                </text>
                <text x="646" y="114" fill="#e9d5ff" fontSize="9">
                  Displaces {gasSim.moderatorDisplacedVolumeCc}cc gas into K-baffles (-{gasSim.acousticSuppressionDb} dB · -{gasSim.recoilReductionFromModeratorPct}% recoil)
                </text>
              </svg>
            </div>
          )}

          {/* 6-Column Real-Life Engineering Breakdown for the Selected Air Storage & Moderator Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-[10.5px]">
            <div className="bg-zinc-900/90 border border-sky-500/40 rounded p-2">
              <div className="text-sky-400 font-bold mb-1">
                1. HOW AIR IS STORED IN REAL LIFE
              </div>
              <p className="text-zinc-200 leading-relaxed">
                {gasSim.storage.howAirIsStoredInRealLife}
              </p>
            </div>
            <div className="bg-zinc-900/90 border border-emerald-500/40 rounded p-2">
              <div className="text-emerald-300 font-bold mb-1">
                2. HOW INTEGRATED RESERVE &amp; MODERATOR CO-EXIST (180° FLOW)
              </div>
              <p className="text-zinc-200 leading-relaxed">
                {gasSim.storage.howIntegratedReserveAndModeratorCoexist}
              </p>
            </div>
            <div className="bg-zinc-900/90 border border-pink-500/40 rounded p-2">
              <div className="text-pink-300 font-bold mb-1">
                3. HOW BREECH / TRIGGER-LOCK LOADS &amp; WATERTIGHT-SEALS
              </div>
              <p className="text-zinc-200 leading-relaxed">
                {gasSim.storage.howBreechLoadsAndWatertightSeals}
              </p>
            </div>
            <div className="bg-zinc-900/90 border border-cyan-500/40 rounded p-2">
              <div className="text-cyan-300 font-bold mb-1">
                4. HOW AIR RELEASES FROM CONTAINER
              </div>
              <p className="text-zinc-200 leading-relaxed">
                {gasSim.storage.howAirReleasesFromContainer}
              </p>
            </div>
            <div className="bg-zinc-900/90 border border-amber-500/40 rounded p-2">
              <div className="text-amber-300 font-bold mb-1">
                5. HOW AIR PUSHES THE {gasSim.caliber.imperialLabel} PELLET
              </div>
              <p className="text-zinc-200 leading-relaxed">
                {gasSim.storage.howAirPushesPelletInBore}
              </p>
            </div>
            <div className="bg-zinc-900/90 border border-purple-500/40 rounded p-2">
              <div className="text-purple-300 font-bold mb-1">
                6. HOW AIR EXPANDS &amp; DISPLACES IN THE MODERATOR
              </div>
              <p className="text-zinc-200 leading-relaxed">
                {gasSim.storage.howAirExpandsAndDisplacesInModerator}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          BOTTOM SPLIT DOCK:
          LEFT: 20-Station Container -> Bore -> Moderator Gas Telemetry & Scrubber
          RIGHT: .25, .30, .45, .50, .72 Impact on Ridiculous DCC Enemies
         ==================================================================== */}
      <div className="w-full max-w-[1460px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-end">
        {/* LEFT 5 COLS: CONTAINER RELEASE -> PELLET BORE -> MODERATOR EXPANSION SCRUBBER */}
        <section className="pointer-events-auto lg:col-span-5 bg-zinc-950/94 border border-zinc-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-sky-400 font-bold uppercase text-[10.5px]">
              CONTAINER RELEASE → BORE → MODERATOR GAS SCRUBBER
            </span>
            <span className="text-emerald-300 font-bold text-[10px]">
              Station {activeStation.stationIndex + 1}/20 ({activeStation.stage.replace(/_/g, ' ')})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400">Scrub:</span>
            <input
              type="range"
              aria-label="Scrub Gas Expansion Station"
              min={0}
              max={gasSim.stations.length - 1}
              step={1}
              value={activeStationIdx}
              onChange={(e) => setActiveStationIdx(parseInt(e.target.value, 10))}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="text-amber-300 font-bold text-[10.5px]">
              x = {activeStation.axialPositionMm} mm
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
            <div className="bg-zinc-900 border border-zinc-800 rounded p-1.5">
              <div className="text-zinc-400">Container P</div>
              <div className="text-sky-300 font-bold text-xs">
                {activeStation.containerPressureBar} Bar
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded p-1.5">
              <div className="text-zinc-400">Bore Behind Slug</div>
              <div className="text-amber-300 font-bold text-xs">
                {activeStation.borePressureBehindPelletBar} Bar
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded p-1.5">
              <div className="text-zinc-400">Moderator Baffle</div>
              <div className="text-purple-300 font-bold text-xs">
                {activeStation.moderatorChamberPressureBar} Bar
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded p-1.5">
              <div className="text-zinc-400">Pellet Velocity</div>
              <div className="text-emerald-300 font-bold text-xs">
                {activeStation.pelletVelocityMs} m/s
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-300 bg-zinc-900/80 border border-zinc-800 rounded px-2 py-1">
            <span className="text-cyan-300 font-bold">Gas Physics:</span> Thrust on {gasSim.caliber.imperialLabel} base = <span className="text-amber-300 font-bold">{activeStation.gasForceOnPelletNewtons} N</span> · Moderator displaced air = <span className="text-purple-300 font-bold">{activeStation.displacedAirVolumeCc} cc</span> · Suppression = <span className="text-emerald-300 font-bold">-{gasSim.acousticSuppressionDb} dB</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleFireAndAnimateGas}
              className="flex-1 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
            >
              🔥 Fire {gasSim.caliber.imperialLabel} Test Shot ({pneumaticState?.magazineLoaded ?? 1}/{pneumaticState?.magazineCapacity ?? 1})
            </button>
            <button
              type="button"
              onClick={onPumpRangeStroke ?? onPumpStroke}
              className="px-2.5 py-1.5 rounded bg-sky-500/20 border border-sky-500/60 text-sky-300 hover:bg-sky-500 hover:text-zinc-950 font-bold text-xs cursor-pointer"
            >
              Pump +25B
            </button>
            {onRefillRange250Bar && (
              <button
                type="button"
                onClick={onRefillRange250Bar}
                className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-xs cursor-pointer"
              >
                Refill {gasSim.storage.fillPressureBar}B
              </button>
            )}
          </div>
        </section>

        {/* RIGHT 7 COLS: .25, .30, .45, .50, .72 TERMINAL EFFECT ON RIDICULOUS DCC ENEMIES */}
        <section className="pointer-events-auto lg:col-span-7 bg-zinc-950/94 border border-amber-500/50 rounded-xl p-3 shadow-2xl flex flex-col gap-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[10.5px]">
                💥 {gasSim.caliber.imperialLabel} ({gasSim.muzzleEnergyJoules}J) TERMINAL IMPACT ON RIDICULOUS DCC ENEMIES
              </span>
            </div>
            <span className="text-[10px] text-emerald-300">
              Select any DCC Enemy to inspect wound channel, armor breach &amp; shots-to-kill:
            </span>
          </div>

          {/* 8 Ridiculous DCC Enemies Selector Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {enemyImpacts.map((imp, idx) => (
              <button
                key={imp.enemy.enemyId}
                type="button"
                onClick={() => setSelectedEnemyIdx(idx)}
                className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer transition-colors ${
                  selectedEnemyIdx === idx
                    ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400'
                }`}
              >
                Lv.{imp.enemy.dungeonFloorLevel} {imp.enemy.shortName} ({imp.shotsToEliminate}x STK)
              </button>
            ))}
          </div>

          {/* Active DCC Enemy Terminal Ballistics Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-amber-300 text-xs">
                {activeEnemyImpact.enemy.fullTitle}
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    activeEnemyImpact.armorBreached
                      ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                      : 'bg-rose-500/20 border border-rose-400 text-rose-300'
                  }`}
                >
                  {activeEnemyImpact.armorBreached
                    ? `✓ ARMOR BREACHED (${activeEnemyImpact.armorPenetrationRatio}x)`
                    : `⚠ ARMOR DEFLECTS (${activeEnemyImpact.armorPenetrationRatio}x)`}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold">
                  {activeEnemyImpact.shotsToEliminate} Shot(s) to Kill ({activeEnemyImpact.effectiveHpDamage} DMG / {activeEnemyImpact.enemy.maxHp} HP)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
              <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5">
                <div className="text-zinc-400">Wound Channel Ø</div>
                <div className="text-rose-300 font-bold">
                  {activeEnemyImpact.woundChannelDiameterMm} mm
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5">
                <div className="text-zinc-400">Penetration Depth</div>
                <div className="text-sky-300 font-bold">
                  {activeEnemyImpact.penetrationDepthCm} cm
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5">
                <div className="text-zinc-400">Knockback Impulse</div>
                <div className="text-amber-300 font-bold">
                  {activeEnemyImpact.knockbackImpulseNs} N·s ({activeEnemyImpact.staggerOrRagdollState.replace(/_/g, ' ')})
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5">
                <div className="text-zinc-400">50m Energy / Drop</div>
                <div className="text-emerald-300 font-bold">
                  {activeEnemyImpact.impactEnergy50mJoules} J / -{gasSim.dropAt50mCm} cm
                </div>
              </div>
            </div>

            <div className="text-[10.5px] text-zinc-200 leading-snug">
              <span className="text-amber-400 font-bold">DCC Terminal Effect:</span>{' '}
              {activeEnemyImpact.comicalDccTerminalDescription}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
