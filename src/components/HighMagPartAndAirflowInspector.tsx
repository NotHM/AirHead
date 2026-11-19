import React, { useEffect, useState } from 'react';
import {
  ASCENT_45_300BAR_12_PARTS_CATALOG,
  Ascent45PartSpec,
  BaseWeaponFamilyId,
} from '../game/weaponFamiliesAndCompatibility';
import { FourZonePneumaticState } from '../wasm/pneumaticWasm';
import {
  SubMillimeterPartAndOringSpec,
  SynthesizedUniqueSubComponentAsset,
} from '../game/interactiveModelBenchmarks';
import { CanonicalGunProgressionId } from '../game/canonicalProgressionAndBlueprints';
import {
  getWeaponUnique5StepAirflowProfile,
  computePartMaterialMassAndCollisionSpec,
} from '../game/workbenchElonPhysicsAndStlEngine';

export type WorkbenchViewLayoutMode =
  | 'SPLIT_3D_AND_CUTAWAY'
  | 'FULL_CUTAWAY_AND_PART_MACRO'
  | 'FULL_3D_MACRO_STAGE';

export type Workbench3DCameraPresetId =
  | 'FULL_SIDE_PROFILE'
  | 'FOCUS_SILENCER'
  | 'FOCUS_BARREL_COVER'
  | 'FOCUS_RECEIVER'
  | 'FOCUS_BREECH'
  | 'FOCUS_POPPET'
  | 'FOCUS_MAG'
  | 'FOCUS_PLENUM'
  | 'FOCUS_FOREGRIP'
  | 'FOCUS_GRIP'
  | 'FOCUS_STOCK'
  | 'OVER_BARREL_PLENUM_AND_SILENCER'
  | 'UNDER_BARREL_300B_PUMP_AND_RESERVE'
  | 'BREECH_VALVE_AND_ROTARY_MAG'
  | 'STOCK_LEVER_AND_TRIGGER';

export interface CompressionToFireStageSpec {
  stepIndex: number;
  stepCode: string;
  shortTitle: string;
  headline: string;
  pumpZoneBar: number;
  underBarrelReserveBar: number;
  overBarrelPlenumBar: number;
  breechAndBarrelBar: number;
  checkValveState: 'OPEN_CHARGING' | 'SEALED_CLOSED';
  regulatorValveState: 'METERING_210B' | 'LOCKED_AT_SETPOINT';
  poppetFiringValveState: 'SEALED_HOLDING_210B' | 'DUMPING_210B_FIRE';
  whatAirIsDoing: string;
  howSealsHoldOrRelease: string;
  highlightedPartNumbers: number[];
}

export const FIVE_STEP_COMPRESSION_TO_FIRE_CYCLE: CompressionToFireStageSpec[] = [
  {
    stepIndex: 0,
    stepCode: 'STEP 1 · INTAKE',
    shortTitle: '1. Pump Intake (1 Bar)',
    headline: 'Down/Outward Pump Stroke Draws 1 Bar Ambient Air Through Micron Intake Filter',
    pumpZoneBar: 1,
    underBarrelReserveBar: 240,
    overBarrelPlenumBar: 210,
    breechAndBarrelBar: 0,
    checkValveState: 'SEALED_CLOSED',
    regulatorValveState: 'LOCKED_AT_SETPOINT',
    poppetFiringValveState: 'SEALED_HOLDING_210B',
    whatAirIsDoing:
      'Pulling the under-barrel pump handle extends the 3 coaxial telescopic tubes. Ambient 1 Bar air enters through the breather port past the Stage-1 floating NBR-90 intake O-ring.',
    howSealsHoldOrRelease:
      'The 1-Way Brass Non-Return Check Valve (Hold-Back Seal) is pressed TIGHTLY CLOSED by the 240–300 Bar pressure already inside the Under-Barrel Reserve. Zero stored air leaks back into the pump, and the PEEK Poppet Valve keeps 210 Bar locked inside the Over-Barrel Plenum.',
    highlightedPartNumbers: [12, 11],
  },
  {
    stepIndex: 1,
    stepCode: 'STEP 2 · COMPRESS 300B',
    shortTitle: '2. 3-Stage Compress → 300B',
    headline: 'Coaxial Pistons Compress Air (6B → 45B → 300B) Past 1-Way Check Valve Into Under-Barrel Reserve',
    pumpZoneBar: 300,
    underBarrelReserveBar: 300,
    overBarrelPlenumBar: 210,
    breechAndBarrelBar: 0,
    checkValveState: 'OPEN_CHARGING',
    regulatorValveState: 'METERING_210B',
    poppetFiringValveState: 'SEALED_HOLDING_210B',
    whatAirIsDoing:
      'Pushing the under-forend pump handle drives the Ø5.6mm 17-4PH Stage-3 high-pressure piston rod forward, compressing trapped air to 300 Bar (4,350 PSI) and forcing open the spring-loaded 1-Way Check Valve into the 240cc Under-Barrel Storage Cylinder (#11).',
    howSealsHoldOrRelease:
      'Glass-filled PTFE + Viton FKM-90 dynamic piston rings prevent blow-by at 300 Bar. As soon as the stroke ends, the 1-Way Check Valve snaps shut so 300 Bar stays trapped in the Under-Barrel Reserve. NO air enters the barrel!',
    highlightedPartNumbers: [12, 11, 9],
  },
  {
    stepIndex: 2,
    stepCode: 'STEP 3 · SEALED HOLD',
    shortTitle: '3. Held in Plenum (210B Locked)',
    headline: 'Regulator Steps 300B → 210B Into Over-Barrel 140cc Plenum & HOLDS IT SEALED Before Firing',
    pumpZoneBar: 1,
    underBarrelReserveBar: 300,
    overBarrelPlenumBar: 210,
    breechAndBarrelBar: 0,
    checkValveState: 'SEALED_CLOSED',
    regulatorValveState: 'LOCKED_AT_SETPOINT',
    poppetFiringValveState: 'SEALED_HOLDING_210B',
    whatAirIsDoing:
      'Air from the 300-Bar Under-Barrel Reserve (#11) passes up the Belleville-Washer Regulator Bridge into the 140cc Concentric Over-the-Barrel Plenum (#09) until it reaches exactly 210 Bar (enough regulated volume for 2.6 full-power .45 Cal shots).',
    howSealsHoldOrRelease:
      'CRITICAL HOLD STATE: Both reservoirs are now fully pressurized and STATICALLY SEALED. Dual FKM-90A Viton bulkhead O-rings (18.5% squeeze) and the Balanced PEEK Poppet Valve hold all 210 Bar locked around the barrel. Barrel pressure is 0 Bar while Lever (#02) indexes the 6-Rd Rotary Mag (#05).',
    highlightedPartNumbers: [9, 11, 5, 2],
  },
  {
    stepIndex: 3,
    stepCode: 'STEP 4 · FIRED RELEASE',
    shortTitle: '4. Trigger Fired! (210B Dump)',
    headline: 'Quattro Trigger Drops Sear → Hammer Opens PEEK Poppet 2.8mm → 210B Air Blasts Behind .45 Slug',
    pumpZoneBar: 1,
    underBarrelReserveBar: 300,
    overBarrelPlenumBar: 178,
    breechAndBarrelBar: 210,
    checkValveState: 'SEALED_CLOSED',
    regulatorValveState: 'LOCKED_AT_SETPOINT',
    poppetFiringValveState: 'DUMPING_210B_FIRE',
    whatAirIsDoing:
      'ONLY WHEN FIRED: Pulling the Quattro 2-Stage Trigger (#03) drops the sear. The striker hammer knocks the Balanced PEEK Poppet Valve open for 2.2 ms. 210 Bar air stored in the Over-Barrel Plenum (#09) rushes radially inward through the Ø8.2mm transfer port directly behind the 350gr .457 slug!',
    howSealsHoldOrRelease:
      'The stainless probe tip PU-90A O-ring seals the rear of the .45 breech at 210 Bar so 100% of the expanding gas drives the slug down the 580mm Precision Rifled & Choked Barrel (#08) at 286.6 Joules.',
    highlightedPartNumbers: [3, 9, 8, 5],
  },
  {
    stepIndex: 4,
    stepCode: 'STEP 5 · BAFFLE & REFILL',
    shortTitle: '5. Silencer Strip & Recharge',
    headline: 'QuietEnergy 6-Baffle Silencer Strips Muzzle Gas (-26.5 dB) While Reserve Instantly Recharges Plenum',
    pumpZoneBar: 1,
    underBarrelReserveBar: 278,
    overBarrelPlenumBar: 210,
    breechAndBarrelBar: 18,
    checkValveState: 'SEALED_CLOSED',
    regulatorValveState: 'METERING_210B',
    poppetFiringValveState: 'SEALED_HOLDING_210B',
    whatAirIsDoing:
      'As the .457 slug exits the choked crown, 6 angled K-baffles and side diffuser gills in the QuietEnergy Moderator (#10) strip and cool the turbulent air jet. Simultaneously, the PEEK Poppet snaps shut at 168 Bar, preserving Over-Barrel Plenum air.',
    howSealsHoldOrRelease:
      'The Belleville Regulator immediately senses the plenum drop (168 Bar < 210 Bar) and opens to meter fresh air from the 300-Bar Under-Barrel Reserve (#11) back into the Over-Barrel Plenum (#09), restoring 210 Bar in 0.18 seconds for shot #2.',
    highlightedPartNumbers: [10, 8, 9, 11],
  },
];

interface HighMagPartAndAirflowInspectorProps {
  viewLayoutMode: WorkbenchViewLayoutMode;
  onChangeViewLayoutMode: (mode: WorkbenchViewLayoutMode) => void;
  activeFamilyId: BaseWeaponFamilyId;
  activeProgressionId?: CanonicalGunProgressionId;
  customCaliberMm: number;
  pneumaticState: FourZonePneumaticState;
  explodedAmount: number;
  xrayGasMode: boolean;
  selectedAscentPartNumber: number;
  onSelectAscentPartNumber: (partNumber: number) => void;
  activeCompressionStep: number;
  onSelectCompressionStep: (stepIdx: number) => void;
  cameraPreset: Workbench3DCameraPresetId;
  onSelectCameraPreset: (preset: Workbench3DCameraPresetId) => void;
  cameraZoom: number;
  onChangeCameraZoom: (zoom: number) => void;
  autoOrbit: boolean;
  onToggleAutoOrbit: () => void;
  onSetExploded: (val: number) => void;
  onToggleXray: () => void;
  onPumpAscentTo300Bar?: (mode: 'SINGLE_3STAGE_STROKE' | 'FULL_300BAR_PUMP_UP') => void;
  onBenchFire: () => void;
  activeBenchmarkSubComp?: SubMillimeterPartAndOringSpec;
  createdUniquePartsByCode: Record<string, SynthesizedUniqueSubComponentAsset>;
  onCreateUniquePartForAscent: (part: Ascent45PartSpec) => void;
  onDownloadUniqueComponentStl: (asset: SynthesizedUniqueSubComponentAsset) => void;
}

export const HighMagPartAndAirflowInspector: React.FC<
  HighMagPartAndAirflowInspectorProps
> = ({
  viewLayoutMode,
  onChangeViewLayoutMode,
  activeFamilyId,
  activeProgressionId,
  customCaliberMm,
  pneumaticState,
  explodedAmount,
  xrayGasMode,
  selectedAscentPartNumber,
  onSelectAscentPartNumber,
  activeCompressionStep,
  onSelectCompressionStep,
  cameraPreset,
  onSelectCameraPreset,
  cameraZoom,
  onChangeCameraZoom,
  autoOrbit,
  onToggleAutoOrbit,
  onSetExploded,
  onToggleXray,
  onPumpAscentTo300Bar,
  onBenchFire,
  createdUniquePartsByCode,
  onCreateUniquePartForAscent,
  onDownloadUniqueComponentStl,
}) => {
  const [autoPlayCycle, setAutoPlayCycle] = useState(false);

  useEffect(() => {
    if (!autoPlayCycle) return;
    const timer = window.setInterval(() => {
      onSelectCompressionStep((activeCompressionStep + 1) % 5);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [autoPlayCycle, activeCompressionStep, onSelectCompressionStep]);

  const resolvedGunId: CanonicalGunProgressionId =
    activeProgressionId ||
    (activeFamilyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY'
      ? 'GUN_02_REXP'
      : activeFamilyId === 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY'
      ? 'GUN_04_LESHIY'
      : activeFamilyId === 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY'
      ? 'GUN_04B_THE_LEAF_45'
      : activeFamilyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY'
      ? 'GUN_05_MP30'
      : activeFamilyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY'
      ? 'GUN_06_P50'
      : activeFamilyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
      ? 'GUN_03_DEFENDER'
      : 'GUN_07_ASCENT45');

  const weaponUniqueAirflow = getWeaponUnique5StepAirflowProfile(resolvedGunId);
  const uniqueStepSpec =
    weaponUniqueAirflow.steps[activeCompressionStep] || weaponUniqueAirflow.steps[2];

  const baseStageSpec =
    FIVE_STEP_COMPRESSION_TO_FIRE_CYCLE[activeCompressionStep] ||
    FIVE_STEP_COMPRESSION_TO_FIRE_CYCLE[2];

  const stageSpec: CompressionToFireStageSpec = {
    ...baseStageSpec,
    stepIndex: uniqueStepSpec.stepIndex,
    stepCode: uniqueStepSpec.stepCode,
    shortTitle: uniqueStepSpec.shortButtonLabel,
    headline: uniqueStepSpec.headline,
    pumpZoneBar: uniqueStepSpec.zone1ReserveBar,
    underBarrelReserveBar: uniqueStepSpec.zone2RegulatorOrBridgeBar,
    overBarrelPlenumBar: uniqueStepSpec.zone3PlenumOrChamberBar,
    breechAndBarrelBar: uniqueStepSpec.zone4BarrelBreechBar,
    whatAirIsDoing: uniqueStepSpec.whatAirIsDoing,
    howSealsHoldOrRelease: uniqueStepSpec.howSealsAndMechanicsWork,
  };

  const selectedPart =
    ASCENT_45_300BAR_12_PARTS_CATALOG.find(
      (p) => p.partNumber === selectedAscentPartNumber
    ) || ASCENT_45_300BAR_12_PARTS_CATALOG[8]; // Default #09 Over-Barrel 140cc Plenum

  const selectedPartPhysics = computePartMaterialMassAndCollisionSpec(
    {
      subIndex: 0,
      code: selectedPart.partCode,
      name: selectedPart.diagramCalloutTitle,
      dimensionsMm: selectedPart.dimensionsMm,
      toleranceMm: '±0.010mm',
      material: selectedPart.materialAndSealSpec,
      pressureBar: selectedPart.operatingPressureBar,
      engineeringFunction: selectedPart.redesigned45EngineeringRole,
      assignedAgent: 'GD-Agent-08',
    },
    'FOCUS_PLENUM',
    0
  );

  const createdAsset = createdUniquePartsByCode[selectedPart.partCode];

  // Map part selection to best 3D camera macro preset
  const handleSelectPartWithCameraFocus = (partNo: number) => {
    onSelectAscentPartNumber(partNo);
    if (partNo === 8 || partNo === 9 || partNo === 10) {
      onSelectCameraPreset('OVER_BARREL_PLENUM_AND_SILENCER');
    } else if (partNo === 11 || partNo === 12 || partNo === 7) {
      onSelectCameraPreset('UNDER_BARREL_300B_PUMP_AND_RESERVE');
    } else if (partNo === 5 || partNo === 6) {
      onSelectCameraPreset('BREECH_VALVE_AND_ROTARY_MAG');
    } else {
      onSelectCameraPreset('STOCK_LEVER_AND_TRIGGER');
    }
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-2 pointer-events-none select-none">
      {/* ====================================================================
          TOP 3D CAMERA FOCUS, MACRO ZOOM & STEP-BY-STEP AIR CYCLE BAR
         ==================================================================== */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 bg-zinc-950/92 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono shadow-lg">
        {/* Left: 3D Macro Camera Focus Presets */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-sky-400 font-bold uppercase mr-1">3D FOCUS:</span>
          {(
            [
              { id: 'FULL_SIDE_PROFILE', label: '🎯 Full Side Profile' },
              {
                id: 'OVER_BARREL_PLENUM_AND_SILENCER',
                label: '💨 Over-Barrel Plenum & Silencer',
              },
              {
                id: 'UNDER_BARREL_300B_PUMP_AND_RESERVE',
                label: '🔧 300B Pump & Check Valve',
              },
              {
                id: 'BREECH_VALVE_AND_ROTARY_MAG',
                label: '⚙ Breech, Poppet & Rotary Mag',
              },
              {
                id: 'STOCK_LEVER_AND_TRIGGER',
                label: '🪵 Lever & Quattro Trigger',
              },
            ] as Array<{ id: Workbench3DCameraPresetId; label: string }>
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectCameraPreset(p.id)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                cameraPreset === p.id
                  ? 'bg-sky-500 text-zinc-950 border-sky-300 font-bold'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-sky-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Right: Zoom Slider + X-Ray + Open Breech + Auto-Orbit */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-amber-400 font-bold">
              Zoom {cameraZoom.toFixed(1)}x
            </span>
            <input
              type="range"
              aria-label="3D Macro Camera Zoom"
              min={1.0}
              max={3.5}
              step={0.1}
              value={cameraZoom}
              onChange={(e) => onChangeCameraZoom(parseFloat(e.target.value))}
              className="w-20 accent-amber-400 cursor-pointer"
            />
          </label>
          <button
            type="button"
            onClick={onToggleXray}
            className={`px-2 py-0.5 rounded border font-bold cursor-pointer ${
              xrayGasMode
                ? 'bg-sky-400 text-zinc-950 border-sky-200'
                : 'bg-zinc-900 text-sky-300 border-sky-500/50'
            }`}
          >
            {xrayGasMode ? 'X-Ray Cutaway: ON' : 'X-Ray Cutaway: OFF'}
          </button>
          <button
            type="button"
            onClick={() => onSetExploded(explodedAmount > 0.1 ? 0 : 0.72)}
            className={`px-2 py-0.5 rounded border font-bold cursor-pointer ${
              explodedAmount > 0.1
                ? 'bg-amber-500 text-zinc-950 border-amber-300'
                : 'bg-zinc-900 text-amber-300 border-amber-500/50'
            }`}
          >
            {explodedAmount > 0.1 ? 'Exploded: ON' : 'Explode Parts'}
          </button>
          <button
            type="button"
            onClick={onToggleAutoOrbit}
            className={`px-2 py-0.5 rounded border cursor-pointer ${
              autoOrbit
                ? 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
          >
            {autoOrbit ? 'Spin: ON' : 'Spin: LOCKED'}
          </button>
        </div>
      </div>

      {/* ====================================================================
          MAIN VIEWPORT AREA:
          - If FULL_3D_MACRO_STAGE: leaves the middle open for full-screen 3D + compact bottom air-step bar
          - If SPLIT_3D_AND_CUTAWAY or FULL_CUTAWAY_AND_PART_MACRO: renders the high-detail interactive cutaway & fine part loupe
         ==================================================================== */}
      {viewLayoutMode === 'FULL_3D_MACRO_STAGE' ? (
        <div className="flex-1 min-h-[260px] flex flex-col justify-end pointer-events-none">
          <div className="pointer-events-auto bg-zinc-950/92 border border-sky-500/70 rounded-xl p-2.5 font-mono text-[11px] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-bold uppercase">
                  5-STEP COMPRESSION → SEALED HOLD → FIRING RELEASE:
                </span>
                <span className="text-zinc-100 font-bold">{stageSpec.headline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeViewLayoutMode('SPLIT_3D_AND_CUTAWAY')}
                  className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                >
                  🔍 Show High-Detail Cutaway &amp; Part Loupe
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {weaponUniqueAirflow.steps.map((st) => (
                <button
                  key={st.stepIndex}
                  type="button"
                  onClick={() => onSelectCompressionStep(st.stepIndex)}
                  className={`text-left p-1.5 rounded border transition-colors cursor-pointer ${
                    activeCompressionStep === st.stepIndex
                      ? 'bg-sky-500/25 border-sky-400 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-[9px] text-sky-400 font-bold">{st.stepCode}</div>
                  <div className="text-[10px] font-bold truncate">{st.shortButtonLabel}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full flex-1 min-h-0 flex flex-col ${
            viewLayoutMode === 'SPLIT_3D_AND_CUTAWAY' ? 'justify-end' : 'justify-between'
          } pointer-events-none`}
        >
          {/* In SPLIT mode, the top 42% of the center stage is open so the zoomed-in 3D weapon is clearly visible right above the live cutaway! */}
          {viewLayoutMode === 'SPLIT_3D_AND_CUTAWAY' && (
            <div className="flex-1 min-h-[165px] relative pointer-events-none">
              <div className="absolute top-1 left-2 pointer-events-auto bg-zinc-950/85 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-300 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">
                  LIVE 3D STAGE ({cameraZoom.toFixed(1)}x):
                </span>
                <span>
                  Drag 3D Rifle to Orbit · Scroll Wheel to Zoom · Click Pump Handle to Pump
                </span>
              </div>
            </div>
          )}

          {/* HIGH-MAGNIFICATION INTERACTIVE CUTAWAY + FINE PART DETAIL INSPECTOR PANEL */}
          <div className="pointer-events-auto w-full bg-zinc-950/96 border border-sky-500/80 rounded-xl p-2.5 font-mono shadow-2xl flex flex-col gap-2 max-h-[64vh] overflow-y-auto">
            {/* 1. 5-STEP AIR COMPRESSION -> HOLD -> FIRE RELEASE STEPPER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-800 pb-1.5">
              <div className="flex flex-wrap items-center gap-1">
                {weaponUniqueAirflow.steps.map((st) => {
                  const isSel = activeCompressionStep === st.stepIndex;
                  const isFiredStep = st.stepIndex === 3;
                  return (
                    <button
                      key={st.stepIndex}
                      type="button"
                      onClick={() => {
                        setAutoPlayCycle(false);
                        onSelectCompressionStep(st.stepIndex);
                      }}
                      className={`px-2.5 py-1 rounded border text-left transition-colors cursor-pointer ${
                        isSel
                          ? isFiredStep
                            ? 'bg-red-500 text-white border-red-300 font-bold shadow'
                            : 'bg-sky-400 text-zinc-950 border-sky-200 font-bold shadow'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-sky-400'
                      }`}
                    >
                      <span className="text-[10px]">{st.shortButtonLabel}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setAutoPlayCycle((v) => !v)}
                  className={`px-2 py-1 rounded border text-[10px] font-bold cursor-pointer ${
                    autoPlayCycle
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                      : 'bg-zinc-900 text-emerald-300 border-emerald-500/60 hover:bg-emerald-500 hover:text-zinc-950'
                  }`}
                >
                  {autoPlayCycle ? '⏸ Pause Cycle' : '▶ Auto-Play 5 Steps'}
                </button>
              </div>

              {/* Live Action Triggers Synchronized with Compression & Firing Steps */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onPumpAscentTo300Bar?.('SINGLE_3STAGE_STROKE');
                    onSelectCompressionStep(1);
                  }}
                  className="px-2 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
                >
                  🔧 Pump Stroke (+28B → Step 2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPumpAscentTo300Bar?.('FULL_300BAR_PUMP_UP');
                    onSelectCompressionStep(2);
                  }}
                  className="px-2 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer"
                >
                  ⚡ Pump 300B &amp; Hold (→ Step 3)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBenchFire();
                    onSelectCompressionStep(3);
                  }}
                  className="px-2.5 py-1 rounded bg-red-500 text-white font-bold text-[10px] hover:bg-red-400 cursor-pointer"
                >
                  🔥 Pull Trigger &amp; Release Air (→ Step 4)
                </button>
              </div>
            </div>

            {/* 2. TWO-COLUMN HIGH-MAGNIFICATION CUTAWAY + PART LOUPE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
              {/* LEFT 7 COLS: LARGE INTERACTIVE LONGITUDINAL CROSS-SECTION CUTAWAY */}
              <div className="lg:col-span-7 bg-zinc-900/95 border border-zinc-800 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div className="text-[10px] font-bold text-sky-300">
                    LONGITUDINAL ENGINEERING CUTAWAY (CLICK ANY PART #01–#12 OR VALVE TO MAGNIFY)
                  </div>
                  <div className="flex items-center gap-2 text-[9px]">
                    <span className="text-amber-400 font-bold">
                      ■ 300B Reserve ({Math.round(pneumaticState.otbPressureBar)}B)
                    </span>
                    <span className="text-sky-400 font-bold">
                      ■ 210B Over-Barrel Plenum ({Math.round(pneumaticState.plenumPressureBar)}B)
                    </span>
                    <span className="text-red-400 font-bold">
                      ● Viton FKM-90 / PU-90A Seals
                    </span>
                  </div>
                </div>

                {/* CRISP VECTOR CROSS-SECTION DIAGRAM OF ASCENT .45 300-BAR PUMP + OVER-BARREL PLENUM + SILENCER */}
                <svg
                  viewBox="0 0 860 250"
                  className="w-full h-auto max-h-[235px] bg-[#070b12] rounded border border-zinc-800"
                >
                  <defs>
                    <pattern
                      id="cadGridSmall"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="0.6"
                      />
                    </pattern>
                  </defs>
                  <rect width="860" height="250" fill="url(#cadGridSmall)" />

                  {/* 1. THUMBHOLE SYNTHETIC STOCK (#01) & LEVER-ACTION (#02) & QUATTRO TRIGGER (#03) */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(1)}
                    className="cursor-pointer"
                  >
                    <path
                      d="M 18 58 L 195 58 L 210 95 L 195 168 L 145 168 L 130 128 L 78 128 L 68 175 L 18 182 Z"
                      fill={selectedAscentPartNumber === 1 ? '#1e3a5f' : '#182232'}
                      stroke={selectedAscentPartNumber === 1 ? '#38bdf8' : '#475569'}
                      strokeWidth="2"
                    />
                    {/* Thumbhole Cutout */}
                    <ellipse
                      cx="104"
                      cy="112"
                      rx="28"
                      ry="20"
                      fill="#070b12"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                    <text x="26" y="76" fill="#94a3b8" fontSize="9" fontWeight="bold">
                      #01 THUMBHOLE STOCK
                    </text>
                  </g>

                  {/* LEVER-ACTION REPEATER (#02) & QUATTRO TRIGGER (#03) & SAFETY (#04) */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(2)}
                    className="cursor-pointer"
                  >
                    <path
                      d={
                        activeCompressionStep === 2
                          ? 'M 205 125 L 255 178 L 300 172 L 265 125'
                          : 'M 205 125 L 222 166 L 278 166 L 265 125'
                      }
                      fill="none"
                      stroke={selectedAscentPartNumber === 2 ? '#fbbf24' : '#cbd5e1'}
                      strokeWidth="4"
                    />
                    <text x="195" y="192" fill="#fbbf24" fontSize="9" fontWeight="bold">
                      #02 LEVER REPEATER
                    </text>
                  </g>

                  {/* QUATTRO TRIGGER (#03) + STRIKER HAMMER */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(3)}
                    className="cursor-pointer"
                  >
                    {/* Striker Hammer & Spring inside receiver */}
                    <rect
                      x="208"
                      y="86"
                      width="34"
                      height="16"
                      rx="2"
                      fill={activeCompressionStep === 3 ? '#ef4444' : '#fbbf24'}
                      stroke="#fef08a"
                      strokeWidth="1.2"
                    />
                    <text x="148" y="97" fill="#fde047" fontSize="8.5" fontWeight="bold">
                      HAMMER {activeCompressionStep === 3 ? '→ STRIKE!' : '(COCKED)'}
                    </text>
                    {/* Trigger Blade */}
                    <path
                      d="M 244 126 Q 248 145 238 152"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                    />
                    <text x="285" y="162" fill="#38bdf8" fontSize="8.5">
                      #03 QUATTRO · #04 SAFETY
                    </text>
                  </g>

                  {/* 2. TOP 6-ROUND .45 ROTARY MAGAZINE (#05) & STAINLESS PROBE + BREECH O-RING */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(5)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="252"
                      y="18"
                      width="38"
                      height="42"
                      rx="5"
                      fill="#991b1b"
                      stroke={selectedAscentPartNumber === 5 ? '#fef08a' : '#ef4444'}
                      strokeWidth="2"
                    />
                    <circle cx="271" cy="34" r="6" fill="#fbbf24" />
                    <circle cx="271" cy="50" r="6" fill="#fbbf24" />
                    <text x="225" y="13" fill="#fca5a5" fontSize="9" fontWeight="bold">
                      #05 .45 ROTARY MAG (6-RD)
                    </text>
                  </g>

                  {/* 3. CONCENTRIC OVER-THE-BARREL (OTB) 140CC 2+ ROUND REGULATED PLENUM (#09) */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(9)}
                    className="cursor-pointer"
                  >
                    {/* Outer 140cc Over-Barrel Plenum Chamber (210 Bar Regulated) */}
                    <rect
                      x="295"
                      y="32"
                      width="365"
                      height="56"
                      rx="6"
                      fill={
                        activeCompressionStep >= 2
                          ? 'rgba(14, 165, 233, 0.34)'
                          : 'rgba(14, 165, 233, 0.14)'
                      }
                      stroke={selectedAscentPartNumber === 9 ? '#38bdf8' : '#0284c7'}
                      strokeWidth="2.5"
                    />
                    {/* Dual Viton FKM-90 Bulkhead O-Rings sealing the Over-Barrel Plenum */}
                    <circle cx="303" cy="36" r="4" fill="#ef4444" />
                    <circle cx="303" cy="84" r="4" fill="#ef4444" />
                    <circle cx="652" cy="36" r="4" fill="#ef4444" />
                    <circle cx="652" cy="84" r="4" fill="#ef4444" />
                    <text x="302" y="26" fill="#38bdf8" fontSize="8.5" fontWeight="bold">
                      #09 OVER-BARREL 140CC PLENUM (210B · 2.6 SHOTS HELD)
                    </text>
                  </g>

                  {/* 4. PRECISION RIFLED & CHOKED .45 CAL BARREL LINER (#08) INSIDE THE PLENUM */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(8)}
                    className="cursor-pointer"
                  >
                    {/* Upper & Lower Barrel Wall */}
                    <rect
                      x="275"
                      y="50"
                      width="405"
                      height="5"
                      fill="#e2e8f0"
                      stroke="#64748b"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="275"
                      y="65"
                      width="405"
                      height="5"
                      fill="#e2e8f0"
                      stroke="#64748b"
                      strokeWidth="0.8"
                    />
                    {/* Inner Bore (Pressurized ONLY in Step 4 & 5!) */}
                    <rect
                      x="278"
                      y="55"
                      width="400"
                      height="10"
                      fill={
                        activeCompressionStep === 3
                          ? 'rgba(251, 191, 36, 0.75)'
                          : activeCompressionStep === 4
                          ? 'rgba(56, 189, 248, 0.45)'
                          : '#090d16'
                      }
                    />
                    {/* Reciprocating Stainless Bolt Probe + Breech PU-90A O-Ring */}
                    <rect
                      x={activeCompressionStep === 2 ? '234' : '250'}
                      y="56"
                      width="28"
                      height="8"
                      fill="#cbd5e1"
                    />
                    <circle cx="278" cy="54" r="3.2" fill="#ef4444" />
                    <circle cx="278" cy="66" r="3.2" fill="#ef4444" />
                    {/* .457 Lead Slug at Breech (Step 0,1,2) or Accelerating Down Barrel (Step 3,4) */}
                    <path
                      d={
                        activeCompressionStep === 3
                          ? 'M 510 55 L 528 55 L 535 60 L 528 65 L 510 65 Z'
                          : activeCompressionStep === 4
                          ? 'M 790 55 L 808 55 L 815 60 L 808 65 L 790 65 Z'
                          : 'M 296 55 L 312 55 L 318 60 L 312 65 L 296 65 Z'
                      }
                      fill="#fbbf24"
                      stroke="#fef08a"
                      strokeWidth="1"
                    />
                    <text x="415" y="63" fill="#f8fafc" fontSize="8.5" fontWeight="bold">
                      #08 .457 RIFLED BARREL LINER{' '}
                      {activeCompressionStep < 3
                        ? '(0 BAR — SEALED BY POPPET)'
                        : '(210 BAR SUPERSONIC PROPULSION!)'}
                    </text>
                  </g>

                  {/* 5. BALANCED PEEK POPPET FIRING VALVE & Ø8.2MM RADIAL TRANSFER PORT */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(9)}
                    className="cursor-pointer"
                  >
                    {/* Transfer Port Channel between Over-Barrel Plenum and Barrel Breech */}
                    <rect
                      x="284"
                      y="68"
                      width="14"
                      height="24"
                      fill={
                        activeCompressionStep === 3
                          ? '#fbbf24'
                          : 'rgba(14, 165, 233, 0.35)'
                      }
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                    />
                    {/* PEEK Poppet Seal Head (Closed in Steps 1-3 & 5, Open in Step 4!) */}
                    <rect
                      x={activeCompressionStep === 3 ? '262' : '278'}
                      y="76"
                      width="14"
                      height="14"
                      rx="2"
                      fill={activeCompressionStep === 3 ? '#22c55e' : '#ef4444'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="304"
                      y="82"
                      fill={activeCompressionStep === 3 ? '#fde047' : '#fda4af'}
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      {activeCompressionStep === 3
                        ? '★ POPPET OPEN (2.8mm) → 210B DUMPS INTO BREECH!'
                        : '🔒 PEEK POPPET SEALED (HOLDS 210B IN PLENUM)'}
                    </text>
                  </g>

                  {/* 6. QUIETENERGY 6-BAFFLE MODERATOR / SILENCER (#10) AT MUZZLE */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(10)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="662"
                      y="34"
                      width="176"
                      height="52"
                      rx="5"
                      fill={
                        activeCompressionStep === 4
                          ? 'rgba(56, 189, 248, 0.38)'
                          : '#111827'
                      }
                      stroke={selectedAscentPartNumber === 10 ? '#38bdf8' : '#64748b'}
                      strokeWidth="2"
                    />
                    {/* 6 Angled K-Baffles inside QuietEnergy Moderator */}
                    {[682, 706, 730, 754, 778, 802].map((bx, i) => (
                      <g key={bx}>
                        <polygon
                          points={`${bx},36 ${bx + 12},52 ${bx + 12},68 ${bx},84`}
                          fill="none"
                          stroke={activeCompressionStep === 4 ? '#38bdf8' : '#94a3b8'}
                          strokeWidth="1.8"
                        />
                        {activeCompressionStep === 4 && (
                          <circle
                            cx={bx + 6}
                            cy={i % 2 === 0 ? 44 : 76}
                            r="3.5"
                            fill="#38bdf8"
                          />
                        )}
                      </g>
                    ))}
                    <text x="652" y="26" fill="#a7f3d0" fontSize="8.5" fontWeight="bold">
                      #10 QUIETENERGY 6-BAFFLE SILENCER (-26.5 dB)
                    </text>
                  </g>

                  {/* 7. BELLEVILLE-WASHER REGULATOR BRIDGE (300B UNDER-BARREL -> 210B OVER-BARREL) */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(11)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="332"
                      y="88"
                      width="22"
                      height="32"
                      fill={
                        activeCompressionStep === 1 ||
                        activeCompressionStep === 2 ||
                        activeCompressionStep === 4
                          ? 'rgba(251, 191, 36, 0.65)'
                          : '#334155'
                      }
                      stroke="#fbbf24"
                      strokeWidth="1.8"
                    />
                    <text x="358" y="106" fill="#fde047" fontSize="8.5" fontWeight="bold">
                      REGULATOR BRIDGE (300B → 210B)
                    </text>
                  </g>

                  {/* 8. UNDER-BARREL 300-BAR AIR RESERVE CYLINDER (#11: 240CC) + MANOMETER */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(11)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="305"
                      y="118"
                      width="335"
                      height="42"
                      rx="6"
                      fill="rgba(245, 158, 11, 0.32)"
                      stroke={selectedAscentPartNumber === 11 ? '#fbbf24' : '#d97706'}
                      strokeWidth="2.2"
                    />
                    {/* 1-Way Brass Non-Return Check Valve at Front of Reserve (#11 / #12 Boundary) */}
                    <polygon
                      points={
                        activeCompressionStep === 1
                          ? '618,139 630,130 630,148'
                          : '626,139 638,130 638,148'
                      }
                      fill={activeCompressionStep === 1 ? '#22c55e' : '#ef4444'}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                    <text x="315" y="136" fill="#fef08a" fontSize="9.5" fontWeight="bold">
                      #11 UNDER-BARREL 300-BAR AIR RESERVE (240CC @{' '}
                      {Math.round(pneumaticState.otbPressureBar)} BAR)
                    </text>
                    <text x="315" y="151" fill="#fed7aa" fontSize="8.5">
                      1-Way Check Valve:{' '}
                      {activeCompressionStep === 1
                        ? 'OPEN (Charging 300B from Pump)'
                        : 'SEALED SHUT (Holds 300B — Zero Backflow)'}
                    </text>
                  </g>

                  {/* 9. IN-GAME 3-STAGE 300-BAR ONBOARD HAND PUMP (#12) BELOW THE RESERVE */}
                  <g
                    onClick={() => handleSelectPartWithCameraFocus(12)}
                    className="cursor-pointer"
                  >
                    {/* Outer Stage 1 & 2 Tube */}
                    <rect
                      x="320"
                      y="174"
                      width="320"
                      height="30"
                      rx="4"
                      fill={
                        activeCompressionStep === 0
                          ? 'rgba(56, 189, 248, 0.28)'
                          : activeCompressionStep === 1
                          ? 'rgba(245, 158, 11, 0.45)'
                          : '#1e293b'
                      }
                      stroke={selectedAscentPartNumber === 12 ? '#10b981' : '#64748b'}
                      strokeWidth="2"
                    />
                    {/* Inner Ø5.6mm Stage-3 High-Pressure Piston Rod */}
                    <rect
                      x={activeCompressionStep === 0 ? '480' : '345'}
                      y="183"
                      width="195"
                      height="12"
                      rx="2"
                      fill="#fbbf24"
                      stroke="#fef08a"
                      strokeWidth="1"
                    />
                    {/* Vertical Transfer Passage from Pump Stage-3 -> 1-Way Check Valve -> 300B Reserve */}
                    <rect
                      x="622"
                      y="156"
                      width="12"
                      height="20"
                      fill={activeCompressionStep === 1 ? '#fbbf24' : '#334155'}
                      stroke="#fbbf24"
                      strokeWidth="1"
                    />
                    <text x="328" y="218" fill="#6ee7b7" fontSize="9.5" fontWeight="bold">
                      #12 3-STAGE 300-BAR UNDER-BARREL PUMP (1B → 6B → 45B → 300B · CLICK TO INSPECT)
                    </text>
                  </g>

                  {/* ANIMATED STEP-ACCURATE AIR FLOW ARROWS */}
                  {activeCompressionStep === 0 && (
                    <g fill="#38bdf8">
                      <circle cx="655" cy="189" r="4" />
                      <circle cx="605" cy="189" r="4" />
                      <circle cx="555" cy="189" r="4" />
                      <text x="665" y="193" fill="#38bdf8" fontSize="9" fontWeight="bold">
                        ← 1 BAR INTAKE AIR
                      </text>
                    </g>
                  )}
                  {activeCompressionStep === 1 && (
                    <g fill="#fbbf24">
                      <circle cx="520" cy="189" r="4.5" />
                      <circle cx="585" cy="189" r="4.5" />
                      <circle cx="628" cy="165" r="4.5" />
                      <circle cx="560" cy="139" r="4.5" />
                      <circle cx="460" cy="139" r="4.5" />
                    </g>
                  )}
                  {activeCompressionStep === 2 && (
                    <g fill="#38bdf8">
                      <circle cx="343" cy="112" r="4" fill="#fbbf24" />
                      <circle cx="343" cy="96" r="4" fill="#38bdf8" />
                      <circle cx="365" cy="42" r="4" />
                      <circle cx="445" cy="42" r="4" />
                      <circle cx="535" cy="42" r="4" />
                      <circle cx="365" cy="78" r="4" />
                      <circle cx="445" cy="78" r="4" />
                      <circle cx="535" cy="78" r="4" />
                    </g>
                  )}
                  {activeCompressionStep === 3 && (
                    <g fill="#fef08a">
                      <circle cx="291" cy="76" r="4.5" />
                      <circle cx="291" cy="60" r="4.5" />
                      <circle cx="360" cy="60" r="4.5" />
                      <circle cx="430" cy="60" r="4.5" />
                      <circle cx="495" cy="60" r="4.5" />
                    </g>
                  )}
                </svg>

                {/* Step Explanation Banner + Real Gas Thermodynamics & Agent Audit */}
                <div className="mt-1.5 flex flex-col gap-1.5 bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px]">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-zinc-800/80 text-[9.5px]">
                    <span className="text-amber-300 font-bold">
                      {weaponUniqueAirflow.gunTitle} · {weaponUniqueAirflow.architectureSummary}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-sky-300">
                      <span>ρ={uniqueStepSpec.gasDensityKgM3} kg/m³</span>
                      <span>·</span>
                      <span>v={uniqueStepSpec.flowVelocityMs} m/s (Mach {uniqueStepSpec.machNumber})</span>
                      <span>·</span>
                      <span>ṁ={uniqueStepSpec.massFlowRateGs} g/s</span>
                      <span>·</span>
                      <span>A={uniqueStepSpec.orificeAreaMm2} mm²</span>
                      <span>·</span>
                      <span>T={uniqueStepSpec.adiabaticTempKelvin} K</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-sky-400 font-bold uppercase">
                        [{stageSpec.stepCode}] HOW AIR FLOWS AT THIS STEP:
                      </span>
                      <p className="text-zinc-200 mt-0.5 leading-snug">
                        {stageSpec.whatAirIsDoing}
                      </p>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold uppercase">
                        HOW VALVES &amp; O-RINGS HOLD OR RELEASE PRESSURE:
                      </span>
                      <p className="text-zinc-200 mt-0.5 leading-snug">
                        {stageSpec.howSealsHoldOrRelease}
                      </p>
                    </div>
                  </div>
                  <div className="text-[9.5px] text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 rounded px-2 py-1">
                    🤖 <span className="font-bold">{weaponUniqueAirflow.verifyingAgentName}:</span>{' '}
                    {uniqueStepSpec.agentVerificationNote}
                  </div>
                </div>
              </div>

              {/* RIGHT 5 COLS: FINE-DETAIL PART MAGNIFIER LOUPE & 12-PART SELECTOR */}
              <div className="lg:col-span-5 bg-zinc-900/95 border border-emerald-500/60 rounded-lg p-2.5 flex flex-col justify-between gap-2">
                {/* Quick 12-Part Selector Strip */}
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-emerald-400 font-bold uppercase">
                      FINE-DETAIL PART LOUPE (SELECT PART #01–#12):
                    </span>
                    <span className="text-amber-300 font-bold">
                      Caliber: {customCaliberMm.toFixed(2)}mm (.457)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {ASCENT_45_300BAR_12_PARTS_CATALOG.map((pt) => {
                      const isSel = pt.partNumber === selectedAscentPartNumber;
                      const isStageHighlighted =
                        stageSpec.highlightedPartNumbers.includes(pt.partNumber);
                      return (
                        <button
                          key={pt.partCode}
                          type="button"
                          onClick={() => handleSelectPartWithCameraFocus(pt.partNumber)}
                          className={`px-1.5 py-1 rounded border text-left text-[9px] transition-colors cursor-pointer truncate ${
                            isSel
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-200 font-bold'
                              : isStageHighlighted
                              ? 'bg-sky-500/20 text-sky-200 border-sky-400/80 font-semibold'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                          }`}
                          title={pt.diagramCalloutTitle}
                        >
                          #{String(pt.partNumber).padStart(2, '0')}{' '}
                          {pt.diagramCalloutTitle.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* High-Magnification Sub-mm Cross-Section Loupe of the Selected Part */}
                <div className="bg-[#070b12] border border-zinc-800 rounded-lg p-2">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-amber-400 font-bold">
                      MAGNIFIED PART CROSS-SECTION · #{String(selectedPart.partNumber).padStart(2, '0')}{' '}
                      ({selectedPart.partCode})
                    </span>
                    <span className="text-sky-300 font-semibold">
                      {selectedPart.operatingPressureBar > 0
                        ? `${selectedPart.operatingPressureBar} Bar Rated`
                        : 'Precision Linkage'}
                    </span>
                  </div>

                  {/* Magnified Part Schematic SVG */}
                  <svg
                    viewBox="0 0 380 96"
                    className="w-full h-24 bg-zinc-950/90 rounded border border-zinc-800/90"
                  >
                    {/* Centerline */}
                    <line
                      x1="12"
                      y1="48"
                      x2="368"
                      y2="48"
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                    {/* Outer Machined Wall */}
                    <rect
                      x="38"
                      y="14"
                      width="304"
                      height="68"
                      rx="6"
                      fill="rgba(30, 41, 59, 0.75)"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    {/* Internal Bore / Pressure Gallery */}
                    <rect
                      x="38"
                      y="30"
                      width="304"
                      height="36"
                      fill={
                        selectedPart.operatingPressureBar >= 250
                          ? 'rgba(245, 158, 11, 0.35)'
                          : selectedPart.operatingPressureBar > 0
                          ? 'rgba(14, 165, 233, 0.35)'
                          : '#090d16'
                      }
                    />
                    {/* Dual Precision O-Ring Glands (Parker 18.5% Squeeze) */}
                    <rect
                      x="58"
                      y="20"
                      width="14"
                      height="10"
                      fill="#090d16"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <circle cx="65" cy="25" r="4.5" fill="#ef4444" />
                    <rect
                      x="58"
                      y="66"
                      width="14"
                      height="10"
                      fill="#090d16"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <circle cx="65" cy="71" r="4.5" fill="#ef4444" />

                    <rect
                      x="308"
                      y="20"
                      width="14"
                      height="10"
                      fill="#090d16"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <circle cx="315" cy="25" r="4.5" fill="#ef4444" />
                    <rect
                      x="308"
                      y="66"
                      width="14"
                      height="10"
                      fill="#090d16"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <circle cx="315" cy="71" r="4.5" fill="#ef4444" />

                    {/* Dimension Callouts Inside Cross-Section Box */}
                    <text
                      x="190"
                      y="27"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="7.8"
                      fontWeight="bold"
                    >
                      {selectedPart.dimensionsMm.slice(0, 46)}
                    </text>
                    <text
                      x="190"
                      y="51"
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {selectedPart.materialAndSealSpec.slice(0, 44)}
                    </text>
                    <text
                      x="190"
                      y="74"
                      textAnchor="middle"
                      fill="#fda4af"
                      fontSize="7.8"
                    >
                      Dual Seal Glands · ±0.010mm B-Rep Tolerance
                    </text>
                  </svg>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[9.5px] font-mono bg-zinc-950/90 border border-zinc-800/80 rounded px-2 py-1">
                    <span className="text-sky-300">{selectedPart.dimensionsMm}</span>
                    <span className="text-amber-300">{selectedPart.materialAndSealSpec}</span>
                  </div>

                  {/* Hyper-Real Material Density, Volume, Mass, Weight & Collision Clearance */}
                  <div className="mt-1 grid grid-cols-3 gap-1 text-[9px] font-mono bg-zinc-950 border border-zinc-800 rounded px-2 py-1">
                    <div className="text-emerald-300">
                      Density: <span className="font-bold">{selectedPartPhysics.materialSpec.densityGPerCm3} g/cm³</span>
                    </div>
                    <div className="text-amber-300">
                      Mass: <span className="font-bold">{selectedPartPhysics.massGrams}g ({selectedPartPhysics.weightNewtons}N)</span>
                    </div>
                    <div className="text-sky-300">
                      Vol: <span className="font-bold">{selectedPartPhysics.solidVolumeCm3} cm³ (SF {selectedPartPhysics.hoopOrContactSafetyFactor}×)</span>
                    </div>
                  </div>

                  <div className="mt-1.5 text-[10px] text-zinc-100 font-bold">
                    {selectedPart.diagramCalloutTitle}
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-snug mt-0.5">
                    {selectedPart.redesigned45EngineeringRole}
                  </p>
                </div>

                {/* Create Unique In-Game CAD Part Asset & Watertight .STL Button */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onCreateUniquePartForAscent(selectedPart)}
                    className={`flex-1 py-1.5 px-2.5 rounded font-bold text-[10px] border transition-colors cursor-pointer ${
                      createdAsset
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                        : 'bg-amber-500 text-zinc-950 border-amber-300 hover:bg-amber-400'
                    }`}
                  >
                    {createdAsset
                      ? `✓ Built ${selectedPart.partCode} (${createdAsset.stlTriangleCount} Tri · ${createdAsset.shapeArchetype})`
                      : `⚡ Create Unique ${selectedPart.partCode} Part Asset`}
                  </button>
                  {createdAsset && (
                    <button
                      type="button"
                      onClick={() => onDownloadUniqueComponentStl(createdAsset)}
                      className="py-1.5 px-2.5 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                    >
                      ⬇ .STL
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
