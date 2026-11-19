import React, { useState } from 'react';
import {
  WeaponBuildLoadout,
  PNEUMATIC_PARTS_CATALOG,
  PneumaticComponentSpec,
  PRESET_LOADOUTS,
} from '../game/partsCatalog';
import {
  POPULAR_25_AIRGUNS,
  CONNECTOR_PORT_SPECS,
  DISCHARGE_ARCHITECTURE_SPECS,
  DischargeMechanismType,
  PhysicsSimulationResult,
  SurvivorPrintInventory,
} from '../game/popular25Catalog';
import {
  FourZonePneumaticState,
  SUPPORTED_CAD_CALIBERS,
  synthesizeLeshiy2OpenBreechBenchmark,
} from '../wasm/pneumaticWasm';
import {
  REX_P_57_PARTS_CATALOG,
  REX_P_6_INTERACTION_STAGES,
  REX_P_8_STEP_DISASSEMBLY_SEQUENCE,
  IN_GAME_WEAPON_SCHEMATICS,
  executeLocalPartBuildCode,
  SchematicPartBuildStatus,
  LocalCodeBuildResult,
} from '../game/rexPCatalog';
import { Weapon3DFamilyContext, inferWeapon3DFamilyContext } from '../game/weapon3d';
import {
  BASE_WEAPON_FAMILIES,
  BURST_DISK_4_STAGE_EVOLUTION,
  BURST_DISK_FITTING_SUBCOMPONENTS,
  ASCENT_45_300BAR_12_PARTS_CATALOG,
  Ascent45PartSpec,
  BaseWeaponFamilyId,
  BurstDiskEvolutionStage,
  computeAccurateMagCapacityByWeaponAndCaliber,
} from '../game/weaponFamiliesAndCompatibility';
import {
  INTERACTIVE_WEAPON_BENCHMARK_MODELS,
  InteractiveBenchmarkModelId,
  SubMillimeterPartAndOringSpec,
  SynthesizedUniqueSubComponentAsset,
  synthesizeUniqueBenchmarkComponentAsset,
} from '../game/interactiveModelBenchmarks';
import {
  AIRGUN_MECHANICS_VIDEO_LIBRARY,
  DEFAULT_AGENT_COMPONENT_REMINDERS,
  AgentComponentTaskAndReminder,
  getAirflowProfileForContext,
  synthesizeComponentWatertightStl,
} from '../game/airgunVideoTranscriptionStudio';
import { OllamaStudioAndRoadmapModal } from './OllamaStudioAndRoadmapModal';
import {
  HighMagPartAndAirflowInspector,
  Workbench3DCameraPresetId,
  WorkbenchViewLayoutMode,
} from './HighMagPartAndAirflowInspector';

interface TarkovRadialCalloutsProps {
  loadout: WeaponBuildLoadout;
  pneumaticState: FourZonePneumaticState;
  upperPlatformId: string;
  lowerPlatformId: string;
  dischargeType: DischargeMechanismType;
  customCaliberMm: number;
  weaponFamilyContext?: Weapon3DFamilyContext;
  onChangeWeaponFamilyContext?: (
    nextCtx: Weapon3DFamilyContext,
    customCalOverride?: number
  ) => void;
  simResult: PhysicsSimulationResult;
  inventory: SurvivorPrintInventory;
  explodedAmount: number;
  xrayGasMode: boolean;
  onUpdateLoadout: (next: WeaponBuildLoadout) => void;
  onChangeHybridPlatforms: (upperId: string, lowerId: string) => void;
  onChangeDischargeType: (dt: DischargeMechanismType) => void;
  onChangeCustomCaliber: (calMm: number) => void;
  onSynthesizeAndPrintCad: () => void;
  onSetExploded: (val: number) => void;
  onToggleXray: () => void;
  onBenchFire: () => void;
  onBenchToggleCamLock: () => void;
  onBenchPumpStroke: (dir: 'PULL' | 'PUSH') => void;
  onBenchRefill250Bar: () => void;
  onPumpAscentTo300Bar?: (mode: 'SINGLE_3STAGE_STROKE' | 'FULL_300BAR_PUMP_UP') => void;
  onOpenDetailedDock: () => void;
  onOpenPhysicsRange: () => void;
  onExportStl: () => void;
}

export const TarkovRadialCallouts: React.FC<TarkovRadialCalloutsProps> = ({
  loadout,
  pneumaticState,
  upperPlatformId,
  lowerPlatformId,
  dischargeType,
  customCaliberMm,
  weaponFamilyContext,
  onChangeWeaponFamilyContext,
  simResult,
  explodedAmount,
  xrayGasMode,
  onUpdateLoadout,
  onChangeHybridPlatforms,
  onChangeDischargeType,
  onChangeCustomCaliber,
  onSynthesizeAndPrintCad,
  onSetExploded,
  onToggleXray,
  onBenchFire,
  onBenchToggleCamLock,
  onBenchPumpStroke,
  onBenchRefill250Bar,
  onPumpAscentTo300Bar,
  onOpenDetailedDock,
  onOpenPhysicsRange,
  onExportStl,
}) => {
  const [showVital] = useState(true);
  const [showFunctional] = useState(true);
  const [showGear] = useState(true);
  const [showLeftInspector, setShowLeftInspector] = useState(true);
  const [showNodeCards, setShowNodeCards] = useState(false);
  const [viewLayoutMode, setViewLayoutMode] = useState<WorkbenchViewLayoutMode>(
    'SPLIT_3D_AND_CUTAWAY'
  );
  const [activeCompressionStep, setActiveCompressionStep] = useState<number>(2);
  const [cameraPreset, setCameraPreset] =
    useState<Workbench3DCameraPresetId>('FULL_SIDE_PROFILE');
  const [cameraZoom, setCameraZoom] = useState<number>(1.8);
  const [autoOrbit, setAutoOrbit] = useState<boolean>(false);
  const [showBomModal, setShowBomModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [showSchematicsModal, setShowSchematicsModal] = useState(false);
  const [showAscent12PartPumpModal, setShowAscent12PartPumpModal] = useState(false);
  const [selectedAscentPartNumber, setSelectedAscentPartNumber] = useState<number>(9);
  const [showAirflowDrawer, setShowAirflowDrawer] = useState(false);
  const [selectedAirflowStageIdx, setSelectedAirflowStageIdx] = useState<number>(0);
  const [showVideoStudioModal, setShowVideoStudioModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    AIRGUN_MECHANICS_VIDEO_LIBRARY[0].videoId
  );
  const [selectedVideoSegmentIdx, setSelectedVideoSegmentIdx] = useState<number>(0);
  const [capturedScreenshots, setCapturedScreenshots] = useState<
    Array<{
      id: string;
      title: string;
      timestampLabel: string;
      thumbnailAssetPath: string;
      verbatimTranscript: string;
      extractedPhysicsRule: string;
    }>
  >([]);
  const [showAgentComponentTaskerModal, setShowAgentComponentTaskerModal] =
    useState(false);
  const [agentComponentReminders, setAgentComponentReminders] = useState<
    AgentComponentTaskAndReminder[]
  >(DEFAULT_AGENT_COMPONENT_REMINDERS);
  const [newAgentTaskTitle, setNewAgentTaskTitle] = useState<string>(
    'Ascent .45 140cc Over-Barrel 2+ Round Plenum & 300-Bar Check Valve'
  );
  const [newAgentTaskAgentName, setNewAgentTaskAgentName] = useState<string>(
    'Agent-02 (Kinematics & O-Ring Seal Boss)'
  );
  const [bomFilter, setBomFilter] = useState<string>('ALL');

  // Interactive 8-Model Sub-Component, O-Ring & Real-Physics Benchmark State
  const [selectedBenchmarkModelId, setSelectedBenchmarkModelId] =
    useState<InteractiveBenchmarkModelId>('MODEL_01_P90_45_HELICAL_PLENUM');
  const [selectedBenchmarkPinNumber, setSelectedBenchmarkPinNumber] =
    useState<number>(1);
  const [benchmarkVisualMode, setBenchmarkVisualMode] = useState<
    'PHOTO_WITH_PINS' | 'STEAMPUNK_CAD_BLUEPRINT'
  >('PHOTO_WITH_PINS');
  const [benchmarkRightTab, setBenchmarkRightTab] = useState<
    'ORINGS_AND_SUBCOMPONENTS' | 'CALIBER_REMAKE_MATRIX'
  >('ORINGS_AND_SUBCOMPONENTS');
  const [createdUniquePartsByCode, setCreatedUniquePartsByCode] = useState<
    Record<string, SynthesizedUniqueSubComponentAsset>
  >({});
  const [rexPInGameAssetCreated, setRexPInGameAssetCreated] = useState<boolean>(false);
  const [showOllamaModal, setShowOllamaModal] = useState<boolean>(false);
  const [ollamaModalInitialTab, setOllamaModalInitialTab] = useState<
    'OLLAMA_PART_BUILDER' | 'SCHEMATIC_CODE_SYNTH' | 'SMART_25_ROADMAP'
  >('OLLAMA_PART_BUILDER');

  // In-Game Collectible Schematics & Local Code Part Builder State
  const [selectedSchematicId, setSelectedSchematicId] = useState<string>(
    'schem_01_evanix_rex_p_762'
  );
  const [blueprintViewMode, setBlueprintViewMode] = useState<
    'VECTOR_CAD_BLUEPRINT' | 'FACTORY_EXPLODED_PNG'
  >('VECTOR_CAD_BLUEPRINT');
  const [schematicSubTab, setSchematicSubTab] = useState<
    'PARTS_AND_LOCAL_CODE' | 'HOW_THEY_WORK_TOGETHER' | 'DISASSEMBLY_SEQUENCE'
  >('PARTS_AND_LOCAL_CODE');
  const [selectedRexPartNo, setSelectedRexPartNo] = useState<string>('#11');
  const [partStatusOverrides, setPartStatusOverrides] = useState<
    Record<string, SchematicPartBuildStatus>
  >({});
  const [lastCodeBuildResult, setLastCodeBuildResult] =
    useState<LocalCodeBuildResult | null>(null);
  const [partStatusFilter, setPartStatusFilter] = useState<
    'ALL' | 'NEEDS_BUILD' | 'WORKING' | 'BUILT_BY_LOCAL_CODE'
  >('ALL');

  const upperPlat =
    POPULAR_25_AIRGUNS.find((p) => p.id === upperPlatformId) || POPULAR_25_AIRGUNS[0];
  const lowerPlat =
    POPULAR_25_AIRGUNS.find((p) => p.id === lowerPlatformId) || POPULAR_25_AIRGUNS[1];
  const dischargeSpec = DISCHARGE_ARCHITECTURE_SPECS[dischargeType];
  const cadSpec = simResult.otbCadSpec;
  const leshiyBenchmark = synthesizeLeshiy2OpenBreechBenchmark({
    targetCaliberMm: customCaliberMm,
    operatingPressureBar: pneumaticState.regulatorSetpointBar,
    material: loadout.custom3dPart.polymerMaterial,
  });

  const activeSchematic =
    IN_GAME_WEAPON_SCHEMATICS.find((s) => s.schematicId === selectedSchematicId) ||
    IN_GAME_WEAPON_SCHEMATICS[0];

  const getEffectiveStatus = (
    partNo: string,
    initial: SchematicPartBuildStatus
  ): SchematicPartBuildStatus =>
    partStatusOverrides[`${selectedSchematicId}_${partNo}`] || initial;

  const selectedRexPart =
    REX_P_57_PARTS_CATALOG.find((p) => p.partNumber === selectedRexPartNo) ||
    REX_P_57_PARTS_CATALOG[10];

  const handleRunLocalCodeForPart = (partNo: string) => {
    const part =
      REX_P_57_PARTS_CATALOG.find((p) => p.partNumber === partNo) || selectedRexPart;
    const result = executeLocalPartBuildCode({
      part,
      targetCaliberMm: customCaliberMm,
      operatingPressureBar: pneumaticState.regulatorSetpointBar,
      polymerOrAlloy: loadout.custom3dPart.polymerMaterial,
    });
    setPartStatusOverrides((prev) => ({
      ...prev,
      [`${selectedSchematicId}_${part.partNumber}`]: 'BUILT_BY_LOCAL_CODE',
    }));
    setLastCodeBuildResult(result);
  };

  const handleRunLocalCodeForAllMissing = () => {
    const nextOverrides = { ...partStatusOverrides };
    let lastRes: LocalCodeBuildResult | null = null;
    for (const p of REX_P_57_PARTS_CATALOG) {
      const currentSt = getEffectiveStatus(p.partNumber, p.initialStatus);
      if (currentSt === 'NEEDS_BUILD') {
        lastRes = executeLocalPartBuildCode({
          part: p,
          targetCaliberMm: customCaliberMm,
          operatingPressureBar: pneumaticState.regulatorSetpointBar,
          polymerOrAlloy: loadout.custom3dPart.polymerMaterial,
        });
        nextOverrides[`${selectedSchematicId}_${p.partNumber}`] = 'BUILT_BY_LOCAL_CODE';
      }
    }
    if (!lastRes) {
      lastRes = executeLocalPartBuildCode({
        part: selectedRexPart,
        targetCaliberMm: customCaliberMm,
        operatingPressureBar: pneumaticState.regulatorSetpointBar,
        polymerOrAlloy: loadout.custom3dPart.polymerMaterial,
      });
    }
    setPartStatusOverrides(nextOverrides);
    setLastCodeBuildResult(lastRes);
  };

  const effectiveFamilyCtx: Weapon3DFamilyContext =
    weaponFamilyContext ?? inferWeapon3DFamilyContext(loadout);
  const activeFamilySpec = BASE_WEAPON_FAMILIES[effectiveFamilyCtx.familyId];
  const activeBurstStageSpec =
    BURST_DISK_4_STAGE_EVOLUTION[effectiveFamilyCtx.burstStage];
  const activeMagSpec = computeAccurateMagCapacityByWeaponAndCaliber(
    effectiveFamilyCtx.familyId,
    customCaliberMm,
    effectiveFamilyCtx.burstStage
  );

  const activeBenchmarkModel =
    INTERACTIVE_WEAPON_BENCHMARK_MODELS.find(
      (m) => m.modelId === selectedBenchmarkModelId
    ) || INTERACTIVE_WEAPON_BENCHMARK_MODELS[0];

  const activeBenchmarkSubComp =
    activeBenchmarkModel.subComponentsAndOrings[selectedBenchmarkPinNumber - 1] ||
    activeBenchmarkModel.subComponentsAndOrings[0];

  const activeAirflowProfile = getAirflowProfileForContext(
    effectiveFamilyCtx.familyId,
    effectiveFamilyCtx.rexMode
  );
  const activeAirflowStage =
    activeAirflowProfile.stages[selectedAirflowStageIdx] ||
    activeAirflowProfile.stages[0];

  const activeVideo =
    AIRGUN_MECHANICS_VIDEO_LIBRARY.find((v) => v.videoId === selectedVideoId) ||
    AIRGUN_MECHANICS_VIDEO_LIBRARY[0];
  const activeVideoSegment =
    activeVideo.timestamps[selectedVideoSegmentIdx] ||
    activeVideo.timestamps[0];

  const selectedAscentPart =
    ASCENT_45_300BAR_12_PARTS_CATALOG.find(
      (p) => p.partNumber === selectedAscentPartNumber
    ) || ASCENT_45_300BAR_12_PARTS_CATALOG[11];

  const handleCaptureVideoScreenshot = () => {
    const shot = {
      id: `shot_${Date.now()}`,
      title: `${activeVideo.title} (${activeVideoSegment.timestampFormatted})`,
      timestampLabel: activeVideoSegment.timestampFormatted,
      thumbnailAssetPath: '/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg',
      verbatimTranscript: activeVideoSegment.transcribedNarrationAndPhysics,
      extractedPhysicsRule: `Valve Lift: ${activeVideoSegment.extractedParameters.valveLiftMm}mm · Dwell: ${activeVideoSegment.extractedParameters.dwellTimeMs}ms · Port: Ø${activeVideoSegment.extractedParameters.transferPortDiaMm}mm · Squeeze: ${activeVideoSegment.extractedParameters.sealSqueezePct}% · Peak: ${activeVideoSegment.extractedParameters.peakBreechBar} Bar`,
    };
    setCapturedScreenshots((prev) => [shot, ...prev]);
  };

  const handleApplyVideoMechanicInGame = () => {
    onChangeCustomCaliber(activeVideo.targetCaliberMm);
    onChangeWeaponFamilyContext?.(
      {
        familyId: activeVideo.linkedFamilyId,
        burstStage: activeVideo.linkedBurstStage ?? effectiveFamilyCtx.burstStage,
        rexMode: activeVideo.linkedRexMode ?? effectiveFamilyCtx.rexMode,
        p90AmmoType: effectiveFamilyCtx.p90AmmoType ?? 'SABOT_SLUG_45_BOATTAIL',
      },
      activeVideo.targetCaliberMm
    );
    onSetExploded(0.72);
    if (!xrayGasMode) {
      onToggleXray();
    }
    setShowVideoStudioModal(false);
    setShowAirflowDrawer(true);
  };

  const handleTaskAgentMakeComponentStl = () => {
    if (!newAgentTaskTitle.trim()) return;
    const partCode = `CAD-${agentComponentReminders.length + 10}`;
    const stlRes = synthesizeComponentWatertightStl({
      partCode,
      partName: newAgentTaskTitle.trim(),
      lengthMm: 95.0,
      outerDiameterMm: customCaliberMm + 26.0,
      innerDiameterMm: customCaliberMm,
      caliberMm: customCaliberMm,
    });
    const created: AgentComponentTaskAndReminder = {
      id: `rem_${Date.now()}`,
      weaponFamilyId: effectiveFamilyCtx.familyId,
      partCode,
      partName: newAgentTaskTitle.trim(),
      assignedAgentId: 'agent_custom',
      assignedAgentName: newAgentTaskAgentName,
      status: 'WORKING',
      reminderNote: `VERIFIED BY ${newAgentTaskAgentName}: Generated ${stlRes.facetCount}-facet watertight manifold .STL rated for ${pneumaticState.maxReliefBar} Bar (${customCaliberMm}mm bore).`,
      caliberMm: customCaliberMm,
      subMmDimensionsSummary: `L=95.0mm · OD=Ø${(customCaliberMm + 26).toFixed(2)}mm · ID=Ø${customCaliberMm.toFixed(2)}mm`,
      generatedStlFacetCount: stlRes.facetCount,
      generatedStlAscii: stlRes.stlString,
      updatedAtIso: new Date().toISOString(),
    };
    setAgentComponentReminders((prev) => [created, ...prev]);
    setNewAgentTaskTitle('');
  };

  const handleToggleReminderWorkingStatus = (reminderId: string) => {
    setAgentComponentReminders((prev) =>
      prev.map((r) => {
        if (r.id !== reminderId) return r;
        const nextStatus = r.status === 'WORKING' ? 'NEEDS_REBUILD' : 'WORKING';
        return {
          ...r,
          status: nextStatus,
          reminderNote:
            nextStatus === 'WORKING'
              ? `WORKING (Verified in Bench Test): ${r.subMmDimensionsSummary} holds ${pneumaticState.maxReliefBar} Bar with 0 leak.`
              : `NEEDS REBUILD: Inspect dynamic O-ring gland squeeze and breech face concentricity before 300-Bar proof test.`,
        };
      })
    );
  };

  const handleDownloadAgentComponentStl = (rem: AgentComponentTaskAndReminder) => {
    const stlText =
      rem.generatedStlAscii ||
      synthesizeComponentWatertightStl({
        partCode: rem.partCode,
        partName: rem.partName,
        lengthMm: 85.0,
        outerDiameterMm: rem.caliberMm + 24.0,
        innerDiameterMm: rem.caliberMm,
        caliberMm: rem.caliberMm,
      }).stlString;
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([stlText], { type: 'model/stl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rem.partCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${rem.caliberMm.toFixed(2)}mm.stl`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSelectFamily = (
    familyId: BaseWeaponFamilyId,
    burstStageOverride?: BurstDiskEvolutionStage,
    calOverride?: number
  ) => {
    const nextStage = burstStageOverride ?? effectiveFamilyCtx.burstStage;
    const nextCal = calOverride ?? BASE_WEAPON_FAMILIES[familyId].defaultCaliberMm;
    onChangeCustomCaliber(nextCal);
    onChangeWeaponFamilyContext?.(
      {
        familyId,
        burstStage: nextStage,
        rexMode: effectiveFamilyCtx.rexMode,
        p90AmmoType: effectiveFamilyCtx.p90AmmoType ?? 'SABOT_SLUG_45_BOATTAIL',
      },
      nextCal
    );
    const matchingModel = INTERACTIVE_WEAPON_BENCHMARK_MODELS.find(
      (m) => m.linkedFamilyContext.familyId === familyId
    );
    if (matchingModel) {
      setSelectedBenchmarkModelId(matchingModel.modelId);
      setSelectedBenchmarkPinNumber(1);
    }
  };

  const handleEquipBenchmarkModelIn3D = (modelId: InteractiveBenchmarkModelId) => {
    const model =
      INTERACTIVE_WEAPON_BENCHMARK_MODELS.find((m) => m.modelId === modelId) ||
      INTERACTIVE_WEAPON_BENCHMARK_MODELS[0];
    setSelectedBenchmarkModelId(model.modelId);
    setSelectedBenchmarkPinNumber(1);
    onChangeCustomCaliber(model.linkedFamilyContext.defaultCaliberMm);
    onChangeWeaponFamilyContext?.(
      {
        familyId: model.linkedFamilyContext.familyId,
        burstStage: model.linkedFamilyContext.burstStage,
        rexMode: model.linkedFamilyContext.rexMode,
        p90AmmoType: effectiveFamilyCtx.p90AmmoType ?? 'SABOT_SLUG_45_BOATTAIL',
      },
      model.linkedFamilyContext.defaultCaliberMm
    );
    onSetExploded(0.75);
  };

  const handleEquipRexPMasterIn3D = () => {
    const rexPreset = PRESET_LOADOUTS.find(
      (p) => p.id === 'preset_evanix_rexp_762_master'
    );
    if (rexPreset) {
      onUpdateLoadout({ ...rexPreset });
    }
    onChangeHybridPlatforms('plat_22_fx_panthera', 'plat_22_fx_panthera');
    onChangeCustomCaliber(7.62);
    onChangeWeaponFamilyContext?.(
      {
        familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
        burstStage: effectiveFamilyCtx.burstStage,
        rexMode: 'REX_P_PISTOL_1SHOT',
      },
      7.62
    );
    onSetExploded(0.55);
  };

  const handleCreateUniqueBenchmarkComponent = (
    part: SubMillimeterPartAndOringSpec,
    pinNumber: number
  ) => {
    const synthesized = synthesizeUniqueBenchmarkComponentAsset(
      part,
      activeBenchmarkModel.fullTitle
    );
    setCreatedUniquePartsByCode((prev) => ({
      ...prev,
      [part.partCode]: synthesized,
    }));
    setSelectedBenchmarkPinNumber(pinNumber);
  };

  const handleDownloadUniqueComponentStl = (
    asset: SynthesizedUniqueSubComponentAsset
  ) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([asset.watertightStlAscii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asset.stlFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateAndEquipEvanixRexPInGameAsset = () => {
    handleEquipRexPMasterIn3D();
    handleRunLocalCodeForAllMissing();
    const rexModel = INTERACTIVE_WEAPON_BENCHMARK_MODELS.find(
      (m) => m.modelId === 'MODEL_05_EVANIX_REXP_COAXIAL_MONOLITH'
    );
    if (rexModel) {
      const nextMap: Record<string, SynthesizedUniqueSubComponentAsset> = {
        ...createdUniquePartsByCode,
      };
      for (const comp of rexModel.subComponentsAndOrings) {
        nextMap[comp.partCode] = synthesizeUniqueBenchmarkComponentAsset(
          comp,
          rexModel.fullTitle
        );
      }
      setCreatedUniquePartsByCode(nextMap);
    }
    setRexPInGameAssetCreated(true);
  };

  const dispatchWorkbenchCameraState = (
    nextPreset: Workbench3DCameraPresetId,
    nextZoom: number,
    nextOrbit: boolean,
    nextStep: number
  ) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('bar250-workbench-camera', {
        detail: {
          preset: nextPreset,
          zoom: nextZoom,
          autoOrbit: nextOrbit,
          compressionStep: nextStep,
        },
      })
    );
  };

  const handleCreateUniqueAscentPart = (part: Ascent45PartSpec) => {
    const dimsMatch = part.dimensionsMm.match(/(\d+(?:\.\d+)?)/g);
    const lenMm = dimsMatch && dimsMatch[0] ? parseFloat(dimsMatch[0]) : 120;
    const odMm = dimsMatch && dimsMatch[1] ? parseFloat(dimsMatch[1]) : 36;
    const idMm = dimsMatch && dimsMatch[2] ? parseFloat(dimsMatch[2]) : 11.43;
    const syntheticSubSpec: SubMillimeterPartAndOringSpec = {
      partCode: part.partCode,
      name: part.diagramCalloutTitle,
      steampunkRustAlias: `Redesigned .45 ${part.diagramCalloutTitle}`,
      category:
        part.operatingPressureBar >= 200
          ? 'PRESSURE_VESSEL_OR_PLENUM'
          : part.partNumber === 10 || part.partNumber === 8
          ? 'BARREL_BAFFLE_OR_SHROUD'
          : 'BREECH_MAG_OR_SABOT',
      materialAndDurometer: part.materialAndSealSpec,
      dimensionsMm: {
        lengthOrThicknessMm: lenMm,
        outerDiameterMm: odMm,
        innerDiameterMm: idMm,
        wallOrCrossSectionMm: Math.max(2.2, (odMm - idMm) * 0.5),
        toleranceMm: '±0.010mm',
      },
      svgNodeX: 400,
      svgNodeY: 180,
      photoPinX: part.photoPinX,
      photoPinY: part.photoPinY,
      realPhysicsSpec: {
        governingEquation: 'Lamé Thick-Wall Hoop Stress & Adiabatic 210B/300B Discharge',
        operatingPressureBar: part.operatingPressureBar,
        squeezeOrClearancePct: '21.8% Viton FKM-90 Radial Gland Squeeze',
        hoopOrShearSafetyFactor: 3.15,
        failureModeIfOmitted:
          'Loss of 300-Bar / 210-Bar pneumatic containment or breech indexing lock.',
      },
      howItWorksWithNeighbors: part.redesigned45EngineeringRole,
    };
    const built = synthesizeUniqueBenchmarkComponentAsset(
      syntheticSubSpec,
      'Redesigned Ascent × Vectis .45 Cal (300B Pump + 140cc Over-Barrel Plenum)'
    );
    setCreatedUniquePartsByCode((prev) => ({
      ...prev,
      [part.partCode]: built,
    }));
  };

  const getParts = (slot: PneumaticComponentSpec['slot']) =>
    PNEUMATIC_PARTS_CATALOG.filter((p) => p.slot === slot);

  const filteredBomParts =
    bomFilter === 'ALL'
      ? PNEUMATIC_PARTS_CATALOG
      : PNEUMATIC_PARTS_CATALOG.filter((p) => p.category === bomFilter);

  const filteredRexParts = REX_P_57_PARTS_CATALOG.filter((p) => {
    const st = getEffectiveStatus(p.partNumber, p.initialStatus);
    if (partStatusFilter === 'ALL') return true;
    return st === partStatusFilter;
  });

  const rexWorkingCount = REX_P_57_PARTS_CATALOG.filter(
    (p) => getEffectiveStatus(p.partNumber, p.initialStatus) !== 'NEEDS_BUILD'
  ).length;
  const rexNeedsBuildCount = REX_P_57_PARTS_CATALOG.length - rexWorkingCount;

  return (
    <div className="relative w-full max-w-[1440px] mx-auto flex-1 min-h-0 flex flex-col justify-between pointer-events-none select-none overflow-hidden px-1.5 py-1">
      {/* ====================================================================
          1. COMPACT SINGLE-LINE VIEW SWITCHER & STUDIO TOOLS BAR
             (Removed redundant BASE FAMILIES row per user request)
         ==================================================================== */}
      <div className="pointer-events-auto mx-auto w-full flex flex-wrap items-center justify-between gap-1.5 bg-zinc-950/94 border border-zinc-800/90 px-2.5 py-1 rounded text-[10px] font-mono text-zinc-300 shadow-md">
        {/* Left: Primary View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-sky-400 font-bold uppercase mr-1">VIEW:</span>
          <button
            type="button"
            onClick={() => {
              setShowNodeCards(false);
              setViewLayoutMode('SPLIT_3D_AND_CUTAWAY');
            }}
            className={`px-2 py-0.5 rounded border font-bold transition-colors cursor-pointer ${
              !showNodeCards && viewLayoutMode === 'SPLIT_3D_AND_CUTAWAY'
                ? 'bg-sky-400 text-zinc-950 border-sky-200'
                : 'bg-zinc-900 text-sky-200 border-zinc-700 hover:border-sky-400'
            }`}
          >
            🔍 Split: 3D + Cutaway &amp; Air Steps
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNodeCards(false);
              setViewLayoutMode('FULL_CUTAWAY_AND_PART_MACRO');
            }}
            className={`px-2 py-0.5 rounded border font-bold transition-colors cursor-pointer ${
              !showNodeCards && viewLayoutMode === 'FULL_CUTAWAY_AND_PART_MACRO'
                ? 'bg-emerald-400 text-zinc-950 border-emerald-200'
                : 'bg-zinc-900 text-emerald-200 border-zinc-700 hover:border-emerald-400'
            }`}
          >
            🔬 Full Cutaway &amp; Fine Part Loupe
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNodeCards(false);
              setViewLayoutMode('FULL_3D_MACRO_STAGE');
            }}
            className={`px-2 py-0.5 rounded border font-bold transition-colors cursor-pointer ${
              !showNodeCards && viewLayoutMode === 'FULL_3D_MACRO_STAGE'
                ? 'bg-amber-400 text-zinc-950 border-amber-200'
                : 'bg-zinc-900 text-amber-200 border-zinc-700 hover:border-amber-400'
            }`}
          >
            🎮 Full 3D Macro Stage
          </button>
          <button
            type="button"
            onClick={() => setShowNodeCards((v) => !v)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showNodeCards
                ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            {showNodeCards ? '🎛 8-Slot Nodes: ON' : '🎛 8-Slot Nodes'}
          </button>
        </div>

        {/* Right: Deep-Dive Modals & Sidebar Toggle */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => {
              handleSelectFamily('ASCENT_3STAGE_ONBOARD_PUMP_FAMILY', undefined, 11.43);
              setShowAscent12PartPumpModal(true);
            }}
            className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/80 text-emerald-200 hover:bg-emerald-500 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            📋 12-Part Ascent Diagram
          </button>
          <button
            type="button"
            onClick={() => {
              onSetExploded(0.75);
              setShowBenchmarkModal(true);
            }}
            className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/70 text-red-300 hover:bg-red-500 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            🔬 8-Model O-Rings ({leshiyBenchmark.benchmarkAccuracyScorePct}%)
          </button>
          <button
            type="button"
            onClick={() => {
              handleEquipRexPMasterIn3D();
              setShowSchematicsModal(true);
            }}
            className="px-2 py-0.5 rounded bg-sky-500/25 border border-sky-400 text-sky-200 hover:bg-sky-400 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            📐 10 Schematics
          </button>
          <button
            type="button"
            onClick={() => {
              setOllamaModalInitialTab('OLLAMA_PART_BUILDER');
              setShowOllamaModal(true);
            }}
            className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-200 hover:bg-amber-400 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            🦙 Ollama &amp; 25 SMART Goals
          </button>
          <button
            type="button"
            onClick={() => setShowAgentComponentTaskerModal(true)}
            className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/80 text-emerald-200 hover:bg-emerald-400 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            🤖 Task Agent (.STL)
          </button>
          <button
            type="button"
            onClick={() => setShowVideoStudioModal(true)}
            className="px-2 py-0.5 rounded bg-purple-500/25 border border-purple-400/80 text-purple-200 hover:bg-purple-400 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            🎬 Video Studio
          </button>
          <button
            type="button"
            onClick={() => setShowLeftInspector((v) => !v)}
            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
          >
            {showLeftInspector ? 'Sidebar: ON' : 'Sidebar: OFF'}
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. MAIN 2-COLUMN WORKSPACE:
             LEFT (200px, min-w-0, no left clipping): Rust + Physics CAD Re-Borer & Live Bench Actions
             RIGHT (minmax(0,1fr)): Top 4 Node Cards + Open 3D Stage w/ SVG Lines + Bottom 4 Node Cards
         ==================================================================== */}
      <div
        className={`w-full flex-1 min-h-0 grid ${
          showLeftInspector ? 'grid-cols-[205px_minmax(0,1fr)]' : 'grid-cols-1'
        } gap-2.5 items-stretch mt-1.5`}
      >
        {/* LEFT SIDEBAR: Rust + Physics CAD Caliber Re-Borer & Bench Controls (Closable) */}
        {showLeftInspector && (
          <div className="pointer-events-auto min-w-0 flex flex-col justify-between bg-zinc-950/92 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] shadow-xl">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1 bg-red-600 text-white font-bold px-2 py-1 rounded-sm text-[10px] tracking-wider uppercase">
                <span className="truncate">{activeFamilySpec.shortTabLabel}</span>
                <button
                  type="button"
                  onClick={() => setShowLeftInspector(false)}
                  className="text-white/80 hover:text-white text-[10px] cursor-pointer"
                  title="Collapse Left Sidebar"
                >
                  ✕
                </button>
              </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => onSetExploded(explodedAmount > 0.1 ? 0 : 0.78)}
                className={`px-1 py-1 rounded border text-[10px] cursor-pointer transition-colors truncate ${
                  explodedAmount > 0.1
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-amber-400'
                }`}
              >
                {explodedAmount > 0.1 ? 'Close Breech' : 'Open Breech'}
              </button>
              <button
                type="button"
                onClick={onToggleXray}
                className={`px-1 py-1 rounded border text-[10px] cursor-pointer transition-colors truncate ${
                  xrayGasMode
                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-sky-400'
                }`}
              >
                {xrayGasMode ? 'X-Ray: ON' : 'X-Ray: OFF'}
              </button>
            </div>

            {/* Quick Family Preset Switchers */}
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() =>
                  handleSelectFamily(
                    'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                    'STAGE_2_SIMPLE_RED_AIR_PEN',
                    6.35
                  )
                }
                className="py-1 px-1 rounded bg-red-500/20 border border-red-500/70 text-red-300 hover:bg-red-500 hover:text-white font-bold text-[9px] transition-colors cursor-pointer truncate"
              >
                🧨 Red Air Pen
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSelectFamily(
                    'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                    'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
                    12.7
                  )
                }
                className="py-1 px-1 rounded bg-red-500/20 border border-red-500/70 text-red-300 hover:bg-red-500 hover:text-white font-bold text-[9px] transition-colors cursor-pointer truncate"
              >
                🧨 2-Shell Gun
              </button>
            </div>

            {/* Autonomous Rust + Physics Caliber Re-Borer */}
            <div className="border-t border-zinc-800 pt-1.5">
              <div className="text-[10px] text-amber-400 font-bold uppercase truncate">
                Ammo &amp; Caliber ({activeMagSpec.imperialCaliberLabel})
              </div>
              <label
                htmlFor="tarkov-caliber-select"
                className="block text-[9px] text-zinc-400 mb-1 truncate"
              >
                Re-Bore Barrel &amp; Scale Mag:
              </label>
              <select
                id="tarkov-caliber-select"
                value={customCaliberMm}
                onChange={(e) => onChangeCustomCaliber(parseFloat(e.target.value))}
                className="w-full bg-zinc-900 border border-amber-500/60 rounded px-1 py-1 text-[10px] text-amber-200 font-semibold cursor-pointer"
              >
                {SUPPORTED_CAD_CALIBERS.map((c) => (
                  <option key={c.caliberMm} value={c.caliberMm}>
                    {c.imperialLabel}{' '}
                    {Math.abs(c.caliberMm - activeFamilySpec.defaultCaliberMm) < 0.2
                      ? '[Native]'
                      : '[CAD Re-Bore]'}
                  </option>
                ))}
              </select>

              <div className="mt-1.5 bg-zinc-900/90 border border-zinc-800 rounded p-1.5 text-[9px] space-y-0.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ammo Cap:</span>
                  <span className="text-amber-300 font-bold truncate ml-1">
                    {activeMagSpec.capacityDisplayBadge}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sub-Layers:</span>
                  <span className="text-sky-300 font-semibold truncate ml-1">
                    {activeFamilySpec.hasConcentricOverBarrelAirReserve
                      ? 'Barrel+Silencer+Air'
                      : 'Barrel+Silencer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Compat Idx:</span>
                  <span
                    className={`font-semibold ${
                      effectiveFamilyCtx.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
                        ? 'text-red-400'
                        : 'text-emerald-300'
                    }`}
                  >
                    {effectiveFamilyCtx.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
                      ? '0% Isolated'
                      : `${activeFamilySpec.compatibilityIndexPct}% Match`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live 4-Zone Manometers & Bench Test Actions */}
          <div className="border-t border-zinc-800 pt-1.5 space-y-1">
            <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[9px] tabular-nums">
              <span className="text-sky-400 truncate">
                Z1 OTB: {Math.round(pneumaticState.otbPressureBar)}B
              </span>
              <span className="text-purple-400 truncate">
                Z2 Stk: {Math.round(pneumaticState.buttstockPressureBar)}B
              </span>
              <span className="text-emerald-400 truncate">
                Z3 Grp: {Math.round(pneumaticState.foregripPressureBar)}B
              </span>
              <span className="text-amber-400 font-bold truncate">
                Z4 Pln: {Math.round(pneumaticState.plenumPressureBar)}B
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={onBenchFire}
                className="px-1 py-1 rounded bg-amber-500/20 border border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 font-semibold text-[10px] cursor-pointer truncate"
              >
                Fire ({pneumaticState.magazineLoaded}/{pneumaticState.magazineCapacity})
              </button>
              <button
                type="button"
                onClick={onBenchToggleCamLock}
                className="px-1 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-zinc-500 text-[10px] cursor-pointer truncate"
              >
                Cam: {pneumaticState.foregripCamPosition === 'SIDE_LOCKED_3_OCLOCK' ? '3h' : '6h'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (effectiveFamilyCtx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
                    onPumpAscentTo300Bar?.('SINGLE_3STAGE_STROKE');
                  } else {
                    onBenchPumpStroke('PUSH');
                  }
                }}
                className="px-1 py-1 rounded bg-emerald-500/20 border border-emerald-500/70 text-emerald-300 hover:bg-emerald-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer truncate"
              >
                {effectiveFamilyCtx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY'
                  ? 'Pump +28B'
                  : 'Pump [Q/E]'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (effectiveFamilyCtx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
                    onPumpAscentTo300Bar?.('FULL_300BAR_PUMP_UP');
                  } else {
                    onBenchRefill250Bar();
                  }
                }}
                className="px-1 py-1 rounded bg-zinc-900 border border-zinc-700 text-sky-300 hover:border-sky-500 text-[10px] cursor-pointer truncate"
              >
                {effectiveFamilyCtx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY'
                  ? 'Fill 300B'
                  : 'Fill 250B'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={onSynthesizeAndPrintCad}
                className="py-1 px-1 rounded bg-lime-500/20 border border-lime-500/60 text-lime-300 hover:bg-lime-500 hover:text-zinc-950 font-bold text-[9px] transition-colors cursor-pointer truncate"
              >
                🖨 Print CAD
              </button>
              <button
                type="button"
                onClick={onOpenDetailedDock}
                className="py-1 px-1 rounded bg-zinc-900 border border-zinc-700 text-amber-300 hover:border-amber-400 font-bold text-[9px] transition-colors cursor-pointer truncate"
              >
                ⚙ 8-Tab Dock
              </button>
            </div>

            <button
              type="button"
              onClick={onExportStl}
              className="w-full py-1 rounded bg-sky-500/20 border border-sky-500/60 text-sky-300 hover:bg-sky-500 hover:text-zinc-950 font-bold text-[10px] transition-colors cursor-pointer truncate"
            >
              ⬇ Export Watertight .STL
            </button>
          </div>
        </div>
        )}

        {/* RIGHT COLUMN: High-Magnification Part & Air-Flow Cutaway OR 8-Node Tarkov Radial Stage */}
        <div className="flex flex-col justify-between min-h-0 min-w-0 h-full">
          {!showNodeCards ? (
            <HighMagPartAndAirflowInspector
              viewLayoutMode={viewLayoutMode}
              onChangeViewLayoutMode={setViewLayoutMode}
              activeFamilyId={effectiveFamilyCtx.familyId}
              customCaliberMm={customCaliberMm}
              pneumaticState={pneumaticState}
              explodedAmount={explodedAmount}
              xrayGasMode={xrayGasMode}
              selectedAscentPartNumber={selectedAscentPartNumber}
              onSelectAscentPartNumber={setSelectedAscentPartNumber}
              activeCompressionStep={activeCompressionStep}
              onSelectCompressionStep={(stepIdx) => {
                setActiveCompressionStep(stepIdx);
                dispatchWorkbenchCameraState(
                  cameraPreset,
                  cameraZoom,
                  autoOrbit,
                  stepIdx
                );
              }}
              cameraPreset={cameraPreset}
              onSelectCameraPreset={(nextPreset) => {
                setCameraPreset(nextPreset);
                const targetZoom =
                  nextPreset === 'FULL_SIDE_PROFILE'
                    ? 1.8
                    : nextPreset === 'BREECH_VALVE_AND_ROTARY_MAG'
                    ? 2.8
                    : 2.5;
                setCameraZoom(targetZoom);
                dispatchWorkbenchCameraState(
                  nextPreset,
                  targetZoom,
                  autoOrbit,
                  activeCompressionStep
                );
              }}
              cameraZoom={cameraZoom}
              onChangeCameraZoom={(nextZoom) => {
                setCameraZoom(nextZoom);
                dispatchWorkbenchCameraState(
                  cameraPreset,
                  nextZoom,
                  autoOrbit,
                  activeCompressionStep
                );
              }}
              autoOrbit={autoOrbit}
              onToggleAutoOrbit={() => {
                const next = !autoOrbit;
                setAutoOrbit(next);
                dispatchWorkbenchCameraState(
                  cameraPreset,
                  cameraZoom,
                  next,
                  activeCompressionStep
                );
              }}
              onSetExploded={onSetExploded}
              onToggleXray={onToggleXray}
              onPumpAscentTo300Bar={onPumpAscentTo300Bar}
              onBenchFire={onBenchFire}
              activeBenchmarkSubComp={activeBenchmarkSubComp}
              createdUniquePartsByCode={createdUniquePartsByCode}
              onCreateUniquePartForAscent={handleCreateUniqueAscentPart}
              onDownloadUniqueComponentStl={handleDownloadUniqueComponentStl}
            />
          ) : (
            <>
              {/* TOP 4 CALLOUT CARDS */}
              <div className="grid grid-cols-4 gap-2 pointer-events-auto">
                {/* CARD 1: MUZZLE / BAFFLE MODERATOR */}
                <div
                  className={`bg-zinc-950/92 border border-sky-500/60 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showGear ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-sky-400 uppercase">
                    <span className="truncate">01. MUZZLE / CAP #01</span>
                    <span>{loadout.custom3dPart.polymerMaterial.split('_')[0]}</span>
                  </div>
                  <select
                    aria-label="Muzzle or 3D Printed CAD Attachment"
                    value={loadout.custom3dPart.geometryType}
                    onChange={(e) =>
                      onUpdateLoadout({
                        ...loadout,
                        custom3dPart: {
                          ...loadout.custom3dPart,
                          enabled: true,
                          geometryType: e.target
                            .value as WeaponBuildLoadout['custom3dPart']['geometryType'],
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    <option value="INTEGRATED_BAFFLE_MODERATOR">
                      Welrod 12-Baffle Wipe Moderator
                    </option>
                    <option value="VENTURI_SHOTGUN_CHOKE">
                      Venturi .50 Shot Concentrator
                    </option>
                    <option value="STEN_SIDE_FEED_RECEIVER">
                      Sten Mk.II Horizontal Drum Sleeve
                    </option>
                    <option value="BULLPUP_MANIFOLD_CHASSIS">
                      PA12-CF Bullpup Cheek Manifold
                    </option>
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    Clearance: {(cadSpec.targetCaliberMm + 1.2).toFixed(1)}mm Bore · M28x1.25
                  </div>
                </div>

                {/* CARD 2: UPPER PLATFORM A (BARREL & OTB RESERVOIR) */}
                <div
                  className={`bg-zinc-950/92 border border-amber-500/70 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showVital ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-amber-400 uppercase">
                    <span className="truncate">02. UPPER BARREL &amp; OTB</span>
                    <span>{cadSpec.wasReboredByCadEngine ? 'CAD RE-BORED' : 'NATIVE'}</span>
                  </div>
                  <select
                    aria-label="Upper Platform A"
                    value={upperPlatformId}
                    onChange={(e) => onChangeHybridPlatforms(e.target.value, lowerPlatformId)}
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {POPULAR_25_AIRGUNS.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.index} {p.name} ({p.caliberMm}mm)
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    Shroud OD: {cadSpec.otbShroudOuterDiameterMm}mm ·{' '}
                    {upperPlat.upperConnectorPort.split('_')[0]}
                  </div>
                </div>

                {/* CARD 3: DISCHARGE / REX-P COAXIAL POPPET #32 / BURST DISK */}
                <div
                  className={`bg-zinc-950/92 border border-emerald-500/70 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showVital ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-emerald-400 uppercase">
                    <span className="truncate">03. VALVE / POPPET #32</span>
                    <span>{dischargeSpec.openingTimeMs}ms</span>
                  </div>
                  <select
                    aria-label="Breech Discharge Architecture"
                    value={dischargeType}
                    onChange={(e) =>
                      onChangeDischargeType(e.target.value as DischargeMechanismType)
                    }
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {Object.values(DISCHARGE_ARCHITECTURE_SPECS).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    Dump: {Math.round(dischargeSpec.airDumpEfficiency * 100)}% · Foil:{' '}
                    {dischargeSpec.burstDiskFoilCostPerShot}/shot
                  </div>
                </div>

                {/* CARD 4: LOWER PLATFORM B (REAR STOCK / REX-P AIR TUBE #38) */}
                <div
                  className={`bg-zinc-950/92 border border-purple-500/70 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showVital ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-purple-300 uppercase">
                    <span className="truncate">04. REAR AIR TUBE #38</span>
                    <span>{lowerPlat.defaultStorageCc}cc</span>
                  </div>
                  <select
                    aria-label="Lower Platform B"
                    value={lowerPlatformId}
                    onChange={(e) => onChangeHybridPlatforms(upperPlatformId, e.target.value)}
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {POPULAR_25_AIRGUNS.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.index} {p.name} ({p.defaultStorageCc}cc)
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    Port: {lowerPlat.lowerConnectorPort}
                  </div>
                </div>
              </div>

              {/* CENTER OPEN 3D STAGE: Unobstructed 3D Weapon + Crisp SVG Leader Lines */}
              <div className="relative flex-1 min-h-[180px] w-full pointer-events-none">
                <svg
                  viewBox="0 0 1000 300"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <g stroke="#71717a" strokeWidth="1.4" strokeDasharray="3 2" fill="none">
                    <polyline points="125,0 165,65 240,125" />
                    <circle cx="240" cy="125" r="4" fill="#38bdf8" stroke="none" />

                    <polyline points="375,0 385,60 405,120" />
                    <circle cx="405" cy="120" r="4" fill="#f59e0b" stroke="none" />

                    <polyline points="625,0 595,60 565,125" />
                    <circle cx="565" cy="125" r="4" fill="#10b981" stroke="none" />

                    <polyline points="875,0 825,65 755,135" />
                    <circle cx="755" cy="135" r="4" fill="#a855f7" stroke="none" />

                    <polyline points="125,300 210,235 310,185" />
                    <circle cx="310" cy="185" r="4" fill="#10b981" stroke="none" />

                    <polyline points="375,300 415,235 450,185" />
                    <circle cx="450" cy="185" r="4" fill="#38bdf8" stroke="none" />

                    <polyline points="625,300 580,235 535,190" />
                    <circle cx="535" cy="190" r="4" fill="#f59e0b" stroke="none" />

                    <polyline points="875,300 785,235 675,175" />
                    <circle cx="675" cy="175" r="4" fill="#f97316" stroke="none" />
                  </g>
                </svg>

                <div className="absolute bottom-1.5 right-2 pointer-events-auto flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-950/85 px-2.5 py-1 rounded border border-zinc-800/90">
                  <span>Drag 3D Weapon to Orbit · Scroll to Zoom</span>
                  <button
                    type="button"
                    onClick={() => setShowNodeCards(false)}
                    className="px-1.5 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold hover:bg-sky-400 cursor-pointer"
                  >
                    🔍 Switch to Cutaway &amp; Part Loupe
                  </button>
                </div>
              </div>

              {/* BOTTOM 4 CALLOUT CARDS */}
              <div className="grid grid-cols-4 gap-2 pointer-events-auto">
                <div
                  className={`bg-zinc-950/92 border border-emerald-500/60 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showFunctional ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-emerald-400 uppercase">
                    <span className="truncate">05. FOREGRIP / CELL</span>
                    <span>3/6 O&apos;CLOCK</span>
                  </div>
                  <select
                    aria-label="Movable Foregrip Bottle"
                    value={loadout.foregripBottleId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, foregripBottleId: e.target.value })
                    }
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {getParts('foregrip_bottle').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    Cam Collar + Priority Check Block
                  </div>
                </div>

                <div
                  className={`bg-zinc-950/92 border border-sky-500/60 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showFunctional ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-sky-400 uppercase">
                    <span className="truncate">06. 3-STAGE APEX PUMP</span>
                    <span>250 BAR</span>
                  </div>
                  <select
                    aria-label="Onboard 3-Stage Pump"
                    value={loadout.pumpCylinderId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, pumpCylinderId: e.target.value })
                    }
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {getParts('pump_cylinder').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    Part 116 2,000 PSI Counter-Balancer
                  </div>
                </div>

                <div
                  className={`bg-zinc-950/92 border border-amber-500/60 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showFunctional ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-amber-400 uppercase">
                    <span className="truncate">07. LOWER PLENUM / CART</span>
                    <span>REGULATED</span>
                  </div>
                  <select
                    aria-label="Modular Lower Plenum"
                    value={loadout.modularPlenumId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, modularPlenumId: e.target.value })
                    }
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {getParts('modular_plenum').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    45° Angled Manometer Bracket (#30)
                  </div>
                </div>

                <div
                  className={`bg-zinc-950/92 border border-orange-500/60 rounded p-1.5 font-mono transition-opacity min-w-0 ${
                    showFunctional ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-orange-400 uppercase">
                    <span className="truncate">08. BREECH &amp; AMMO MAG</span>
                    <span>{activeMagSpec.capacityDisplayBadge}</span>
                  </div>
                  <select
                    aria-label="Rotary Cartridge Magazine"
                    value={loadout.rotaryMagId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, rotaryMagId: e.target.value })
                    }
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 cursor-pointer"
                  >
                    {getParts('rotary_magazine').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                    {activeMagSpec.magazineTypeLabel}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ====================================================================
          3. CLOSABLE AIR FLOW & 5-STAGE FIRING / SEALING / CYCLING DRAWER
         ==================================================================== */}
      {showAirflowDrawer && (
        <div className="pointer-events-auto fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-[1260px] bg-zinc-950/95 border border-sky-500/80 rounded-xl p-3 shadow-2xl font-mono text-[11px]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                LIVE AIR FLOW &amp; 5-STAGE BREACH SEALING / CYCLING INSPECTOR ·{' '}
              </span>
              <span className="text-zinc-100 font-bold">{activeAirflowProfile.weaponTitle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleXray}
                className={`px-2 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                  xrayGasMode
                    ? 'bg-sky-500 text-zinc-950 border-sky-300'
                    : 'bg-zinc-900 text-sky-300 border-sky-500/50'
                }`}
              >
                {xrayGasMode ? '3D X-Ray Air Streamlines: ON' : 'Enable 3D X-Ray Streamlines'}
              </button>
              <button
                type="button"
                onClick={onBenchFire}
                className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
              >
                🔥 Pulse Shot ({pneumaticState.magazineLoaded}/{pneumaticState.magazineCapacity})
              </button>
              <button
                type="button"
                onClick={() => setShowAirflowDrawer(false)}
                className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white text-[10px] cursor-pointer"
              >
                Close ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 my-2">
            {activeAirflowProfile.stages.map((st, idx) => {
              const isSel = idx === selectedAirflowStageIdx;
              return (
                <button
                  key={st.stageIndex}
                  type="button"
                  onClick={() => setSelectedAirflowStageIdx(idx)}
                  className={`text-left p-1.5 rounded border transition-colors cursor-pointer ${
                    isSel
                      ? 'bg-sky-500/20 border-sky-400 text-zinc-100'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-[9px] text-sky-400 font-bold uppercase">
                    {st.shortLabel} · {st.timingWindowMs}
                  </div>
                  <div className="font-bold text-[10px] truncate">{st.title}</div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 text-[10px]">
            <div>
              <div className="text-sky-400 font-bold uppercase mb-0.5">
                Air Flow Vector &amp; Pressure Path:
              </div>
              <div className="text-zinc-200">{activeAirflowStage.pneumaticPathActive}</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold uppercase mb-0.5">
                How It Seals &amp; Cycles Rounds:
              </div>
              <div className="text-zinc-200">{activeAirflowStage.breechAndSealState}</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold uppercase mb-0.5">
                Breech &amp; Magazine Summary:
              </div>
              <div className="text-zinc-300">{activeAirflowProfile.howItSealsAt250Bar}</div>
              <div className="text-sky-300 mt-1">{activeAirflowProfile.howItCyclesNextRound}</div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. IN-GAME COLLECTIBLE SCHEMATICS, 57-PART EVANIX REX-P SUB-MM INSPECTOR
             & LOCAL CODE PART COMPILER MODAL
         ==================================================================== */}
      {showSchematicsModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/94 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-950 border border-sky-500/70 rounded-xl max-w-[1400px] w-full max-h-[92vh] flex flex-col shadow-2xl font-mono overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
              <div>
                <div className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">
                  IN-GAME COLLECTIBLE SCHEMATIC ITEMS (10 WEAPONS) · SUB-MM CURVES, 8-STEP DISASSEMBLY &amp; LOCAL CODE PART COMPILER
                </div>
                <h3 className="text-sm md:text-base font-bold text-zinc-100">
                  {activeSchematic.weaponName} — [{activeSchematic.itemCode}] ({rexWorkingCount}/
                  {REX_P_57_PARTS_CATALOG.length} REX-P Parts Working · {rexNeedsBuildCount} Need Local Code Build)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunLocalCodeForAllMissing}
                  className="px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  ⚡ Run Local Code: Build All Missing Parts ({rexNeedsBuildCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShowSchematicsModal(false)}
                  className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Close Schematics
                </button>
              </div>
            </div>

            {/* 10-Weapon Collectible Schematic Item Bar */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 overflow-x-auto">
              {IN_GAME_WEAPON_SCHEMATICS.map((item, idx) => {
                const isSelected = item.schematicId === selectedSchematicId;
                return (
                  <button
                    key={item.schematicId}
                    type="button"
                    onClick={() => setSelectedSchematicId(item.schematicId)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-zinc-950 border-sky-300 font-bold'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-sky-500/60'
                    }`}
                  >
                    [PHASE {idx + 5}] {item.itemCode} ({item.totalCatalogedParts} Parts)
                  </button>
                );
              })}
            </div>

            {/* Main 12-Column Schematic & Local Code Compiler Workspace */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
              {/* LEFT 6 COLUMNS: Dual-Mode Interactive Vector CAD Blueprint + Factory Exploded Diagram */}
              <div className="lg:col-span-6 flex flex-col justify-between bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="text-xs font-bold text-sky-300">
                      {blueprintViewMode === 'VECTOR_CAD_BLUEPRINT'
                        ? 'Sub-mm Vector CAD Blueprint (Click Any Part Node #01–#59)'
                        : `Factory Exploded Schematic (${activeSchematic.weaponName})`}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBlueprintViewMode('VECTOR_CAD_BLUEPRINT')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          blueprintViewMode === 'VECTOR_CAD_BLUEPRINT'
                            ? 'bg-sky-500 text-zinc-950 font-bold'
                            : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        Vector CAD Blueprint (Sub-mm Curves)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlueprintViewMode('FACTORY_EXPLODED_PNG')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          blueprintViewMode === 'FACTORY_EXPLODED_PNG'
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        Factory Exploded Sheet
                      </button>
                    </div>
                  </div>

                  {/* MODE A: Interactive Sub-mm Vector CAD Blueprint (Precision Orthographic SVG) */}
                  {blueprintViewMode === 'VECTOR_CAD_BLUEPRINT' ? (
                    <div className="relative rounded-lg border border-sky-500/40 bg-[#07111e] p-2 overflow-hidden">
                      <svg
                        viewBox="0 0 800 390"
                        className="w-full h-auto select-none"
                        role="img"
                        aria-label="Evanix REX-P 7.62mm Sub-Millimeter Vector CAD Blueprint"
                      >
                        {/* Blueprint Technical Grid */}
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
                              stroke="#0f2942"
                              strokeWidth="0.6"
                            />
                          </pattern>
                          <pattern
                            id="cadGridLarge"
                            width="100"
                            height="100"
                            patternUnits="userSpaceOnUse"
                          >
                            <rect width="100" height="100" fill="url(#cadGridSmall)" />
                            <path
                              d="M 100 0 L 0 0 0 100"
                              fill="none"
                              stroke="#163e63"
                              strokeWidth="1.1"
                            />
                          </pattern>
                        </defs>
                        <rect width="800" height="390" fill="url(#cadGridLarge)" />

                        {/* Blueprint Title Block */}
                        <rect
                          x="10"
                          y="10"
                          width="780"
                          height="370"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                        />
                        <text x="22" y="28" fill="#7dd3fc" fontSize="10" fontWeight="bold">
                          CAD DRAWING: EVANIX REX-P (7.62MM / .30 CAL) COAXIAL MONOLITHIC PCP — 59 SUB-MM PARTS (#01–#59)
                        </text>
                        <text x="22" y="42" fill="#94a3b8" fontSize="9">
                          SCALE: 1:1 PARAMETRIC B-REP · THREADS: M28x1.25-6g (SHROUD/TUBE) &amp; M22x1.0 (BREECH/VALVE) · GREEN=WORKING · AMBER=NEEDS BUILD · CYAN=LOCAL CODE BUILT
                        </text>

                        {/* 1. High-Profile Cantilever Scope Rail (#29) + Dual 45° Swept Risers */}
                        <g stroke="#38bdf8" strokeWidth="1.4" fill="#0c233b" fillOpacity="0.7">
                          <rect x="255" y="64" width="215" height="14" rx="2" />
                          <polygon points="285,78 308,116 326,116 305,78" />
                          <polygon points="435,78 415,116 397,116 418,78" />
                          <text x="262" y="59" fill="#38bdf8" fontSize="8">
                            #29 CANTILEVER SCOPE RAIL (L=168.00mm · MIL-STD-1913 · 45° SWEPT STRUTS)
                          </text>
                        </g>

                        {/* 2. Knurled Muzzle Cap (#01) + Front Barrel Shroud (#02) + 5-Slot Handguard (#06) */}
                        <g stroke="#22d3ee" strokeWidth="1.5" fill="#091d32" fillOpacity="0.8">
                          {/* #01 Muzzle Cap */}
                          <rect x="36" y="122" width="24" height="36" rx="2" />
                          {/* #02 Barrel Shroud */}
                          <rect x="60" y="120" width="185" height="40" rx="2" />
                          {/* #06 5-Slot Handguard */}
                          <rect x="75" y="114" width="155" height="52" rx="4" fill="none" stroke="#38bdf8" strokeDasharray="4 2" />
                          {/* 5 Ventilated Oblong Slots */}
                          {[88, 115, 142, 169, 196].map((sx, i) => (
                            <rect
                              key={i}
                              x={sx}
                              y="135"
                              width="18"
                              height="10"
                              rx="5"
                              fill="#06101c"
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                          ))}
                          {/* #03 Precision 7.62mm Rifled Barrel along centerline */}
                          <line
                            x1="50"
                            y1="140"
                            x2="335"
                            y2="140"
                            stroke="#fbbf24"
                            strokeWidth="3.2"
                          />
                          <text x="40" y="108" fill="#7dd3fc" fontSize="8">
                            #01 CAP (OD 31.8mm) · #02 SHROUD (OD 32.0mm) · #03 7.62mm RIFLED BARREL (L=215.00mm · 6-GROOVE)
                          </text>
                        </g>

                        {/* 3. Main Coaxial Tubular Receiver (#09) + Vertical Breech Block Slide (#11) */}
                        <g stroke="#38bdf8" strokeWidth="1.7" fill="#0f2942" fillOpacity="0.85">
                          <rect x="245" y="116" width="235" height="48" rx="3" />
                          {/* #11 Vertical Breech Slide Pocket */}
                          <rect
                            x="332"
                            y="108"
                            width="24"
                            height="56"
                            rx="2"
                            fill="#1e293b"
                            stroke="#f59e0b"
                            strokeWidth="1.8"
                          />
                          {/* #32 Coaxial Poppet Valve & #33 Valve Spring + #35 Hammer */}
                          <polygon
                            points="435,140 458,128 458,152"
                            fill="#10b981"
                            stroke="#34d399"
                            strokeWidth="1.3"
                          />
                          <rect
                            x="388"
                            y="127"
                            width="34"
                            height="26"
                            rx="3"
                            fill="#334155"
                            stroke="#f43f5e"
                            strokeWidth="1.3"
                          />
                        </g>

                        {/* 4. Rear Coaxial 250-Bar Air Cylinder Tube (#38) + Foster Fill Endcap (#41/#45) */}
                        <g stroke="#a855f7" strokeWidth="1.6" fill="#1b1435" fillOpacity="0.8">
                          <rect x="480" y="114" width="245" height="52" rx="4" />
                          <rect x="725" y="118" width="38" height="44" rx="4" fill="#311b47" />
                          <text x="490" y="106" fill="#d8b4fe" fontSize="8">
                            #38 250-BAR COAXIAL AIR TUBE (OD 35.00mm × ID 28.60mm × Wall 3.20mm · 7075-T6) + #45 FOSTER FILL
                          </text>
                        </g>

                        {/* 5. 5-Hole Skeletonized Underlever (#14) + Gold Curved Trigger (#20) + AR Pistol Grip (#28) */}
                        <g>
                          {/* #28 Ergonomic AR Grip */}
                          <polygon
                            points="318,164 362,164 338,278 292,272"
                            fill="#18181b"
                            stroke="#52525b"
                            strokeWidth="1.6"
                          />
                          {/* #20 Gold Anodized Curved Trigger Blade */}
                          <path
                            d="M 358 168 Q 348 188 360 202"
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          {/* #14 5-Hole Skeletonized Underlever Trigger Guard */}
                          <path
                            d="M 372 164 L 455 212 C 462 225 445 242 425 235 L 342 195 Z"
                            fill="#1e293b"
                            stroke="#f59e0b"
                            strokeWidth="1.6"
                          />
                          {/* 5 Drilled Lightning Holes (Ø5.50mm–Ø7.00mm) */}
                          {[382, 397, 412, 427, 442].map((hx, idx) => (
                            <circle
                              key={idx}
                              cx={hx}
                              cy={186 + idx * 8}
                              r="4.2"
                              fill="#07111e"
                              stroke="#fbbf24"
                              strokeWidth="1"
                            />
                          ))}
                          <text x="355" y="256" fill="#fcd34d" fontSize="8">
                            #14 5-HOLE SKELETONIZED UNDERLEVER (L=142.50mm) + #20 GOLD TRIGGER (R14.5mm ARC)
                          </text>
                        </g>

                        {/* Dimension Leader Lines at Bottom */}
                        <g stroke="#64748b" strokeWidth="1">
                          <line x1="36" y1="335" x2="763" y2="335" />
                          <line x1="36" y1="328" x2="36" y2="342" />
                          <line x1="763" y1="328" x2="763" y2="342" />
                          <text x="275" y="350" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                            OVERALL COAXIAL LENGTH: 582.50 mm (±0.015 mm B-REP TOLERANCE)
                          </text>
                        </g>

                        {/* Interactive Clickable Part Nodes mapped across the Blueprint */}
                        {REX_P_57_PARTS_CATALOG.map((part, idx) => {
                          const st = getEffectiveStatus(part.partNumber, part.initialStatus);
                          const isSelected = part.partNumber === selectedRexPartNo;
                          const cx = Math.round((part.pinX / 100) * 740 + 30);
                          const cy = Math.round((part.pinY / 100) * 245 + 65);
                          const fillCol =
                            st === 'BUILT_BY_LOCAL_CODE'
                              ? '#06b6d4'
                              : st === 'NEEDS_BUILD'
                              ? '#f59e0b'
                              : '#10b981';
                          if (
                            !isSelected &&
                            st !== 'NEEDS_BUILD' &&
                            st !== 'BUILT_BY_LOCAL_CODE' &&
                            idx % 2 === 1
                          ) {
                            return null;
                          }
                          return (
                            <g
                              key={part.partNumber}
                              onClick={() => setSelectedRexPartNo(part.partNumber)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isSelected ? 10 : 7.5}
                                fill={fillCol}
                                stroke={isSelected ? '#ffffff' : '#090d16'}
                                strokeWidth={isSelected ? 2.2 : 1.2}
                              />
                              <text
                                x={cx}
                                y={cy + 3}
                                textAnchor="middle"
                                fill="#090d16"
                                fontSize="7"
                                fontWeight="bold"
                              >
                                {part.partNumber.replace('#', '')}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    /* MODE B: Factory Exploded Schematic Sheet with Interactive Numbered Pins */
                    <div className="relative rounded-lg border border-zinc-700 bg-white overflow-hidden max-h-[370px] overflow-y-auto">
                      <img
                        src={activeSchematic.schematicImageUrl}
                        alt={activeSchematic.weaponName}
                        className="w-full h-auto object-contain"
                      />
                      {REX_P_57_PARTS_CATALOG.filter(
                        (p) =>
                          getEffectiveStatus(p.partNumber, p.initialStatus) !== 'WORKING' ||
                          p.partNumber === selectedRexPartNo
                      ).map((part) => {
                        const st = getEffectiveStatus(part.partNumber, part.initialStatus);
                        return (
                          <button
                            key={part.partNumber}
                            type="button"
                            onClick={() => setSelectedRexPartNo(part.partNumber)}
                            style={{
                              top: `${part.pinY}%`,
                              left: `${part.pinX}%`,
                            }}
                            title={`${part.partNumber} ${part.englishName} (${part.koreanName})`}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center border shadow-md cursor-pointer ${
                              st === 'BUILT_BY_LOCAL_CODE'
                                ? 'bg-sky-500 text-zinc-950 border-white'
                                : st === 'NEEDS_BUILD'
                                ? 'bg-amber-500 text-zinc-950 border-zinc-950 animate-pulse'
                                : 'bg-emerald-500 text-zinc-950 border-white'
                            }`}
                          >
                            {part.partNumber.replace('#', '')}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Part Sub-mm Dimension & Curve Inspector Card + Local Code Runner */}
                <div className="mt-2.5 bg-zinc-950 border border-sky-500/50 rounded-lg p-2.5 text-[11px] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-amber-400 font-bold">
                        PART {selectedRexPart.partNumber} ({selectedRexPart.koreanName})
                      </span>{' '}
                      <span className="text-zinc-100 font-bold">
                        — {selectedRexPart.englishName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          getEffectiveStatus(
                            selectedRexPart.partNumber,
                            selectedRexPart.initialStatus
                          ) === 'BUILT_BY_LOCAL_CODE'
                            ? 'bg-sky-500/25 text-sky-300 border border-sky-400'
                            : getEffectiveStatus(
                                selectedRexPart.partNumber,
                                selectedRexPart.initialStatus
                              ) === 'NEEDS_BUILD'
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-400'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {getEffectiveStatus(
                          selectedRexPart.partNumber,
                          selectedRexPart.initialStatus
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRunLocalCodeForPart(selectedRexPart.partNumber)}
                        className="px-2.5 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                      >
                        ⚡ Run Local Code to Build {selectedRexPart.partNumber}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded p-1.5 text-[10px] tabular-nums">
                    <div>
                      <span className="text-zinc-500 block">Length:</span>
                      <span className="text-zinc-100 font-bold">
                        {selectedRexPart.subMmDimensions.lengthMm.toFixed(2)} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Outer OD:</span>
                      <span className="text-sky-300 font-bold">
                        {selectedRexPart.subMmDimensions.outerDiameterMm.toFixed(2)} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Inner ID:</span>
                      <span className="text-amber-300 font-bold">
                        {selectedRexPart.subMmDimensions.innerDiameterMm.toFixed(2)} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Wall:</span>
                      <span className="text-emerald-300 font-bold">
                        {selectedRexPart.subMmDimensions.wallThicknessMm.toFixed(2)} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Tolerance:</span>
                      <span className="text-purple-300 font-bold">
                        {selectedRexPart.subMmDimensions.toleranceMm}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-300">
                    <strong className="text-sky-300">Sub-mm Curves &amp; Threads:</strong>{' '}
                    {selectedRexPart.curveAndThreadProfile}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    <strong className="text-emerald-300">How It Works Together:</strong>{' '}
                    {selectedRexPart.howItWorks}
                  </div>
                </div>
              </div>

              {/* RIGHT 6 COLUMNS: 3 Sub-Tabs (59 Parts List & Local Code / 6-Stage Interaction / 8-Step Disassembly) */}
              <div className="lg:col-span-6 flex flex-col justify-between bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 min-h-0">
                <div>
                  {/* Sub-Tab Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 mb-2 border-b border-zinc-800">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSchematicSubTab('PARTS_AND_LOCAL_CODE')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          schematicSubTab === 'PARTS_AND_LOCAL_CODE'
                            ? 'bg-sky-500 text-zinc-950'
                            : 'bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        01. Parts Status &amp; Local Code ({REX_P_57_PARTS_CATALOG.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchematicSubTab('HOW_THEY_WORK_TOGETHER')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          schematicSubTab === 'HOW_THEY_WORK_TOGETHER'
                            ? 'bg-sky-500 text-zinc-950'
                            : 'bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        02. How Parts Work Together (6 Stages)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchematicSubTab('DISASSEMBLY_SEQUENCE')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          schematicSubTab === 'DISASSEMBLY_SEQUENCE'
                            ? 'bg-sky-500 text-zinc-950'
                            : 'bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        03. 8-Step Disassembly Sequence
                      </button>
                    </div>

                    {schematicSubTab === 'PARTS_AND_LOCAL_CODE' && (
                      <select
                        aria-label="Filter Schematic Parts by Build Status"
                        value={partStatusFilter}
                        onChange={(e) =>
                          setPartStatusFilter(
                            e.target.value as
                              | 'ALL'
                              | 'NEEDS_BUILD'
                              | 'WORKING'
                              | 'BUILT_BY_LOCAL_CODE'
                          )
                        }
                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        <option value="ALL">All 59 Parts (#01–#59)</option>
                        <option value="NEEDS_BUILD">
                          Needs Local Code Build ({rexNeedsBuildCount})
                        </option>
                        <option value="WORKING">Working Factory Parts</option>
                        <option value="BUILT_BY_LOCAL_CODE">Built by Local Code</option>
                      </select>
                    )}
                  </div>

                  {/* SUB-TAB 1: 59-PART TABLE & LOCAL CODE EXECUTOR */}
                  {schematicSubTab === 'PARTS_AND_LOCAL_CODE' && (
                    <div className="max-h-[260px] overflow-y-auto border border-zinc-800 rounded">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase">
                          <tr>
                            <th className="py-1 px-2">#</th>
                            <th className="py-1 px-2">Part Name (KR / EN)</th>
                            <th className="py-1 px-2">Sub-mm (L × OD × ID)</th>
                            <th className="py-1 px-2">Status</th>
                            <th className="py-1 px-2">Local Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/70">
                          {filteredRexParts.map((part) => {
                            const st = getEffectiveStatus(
                              part.partNumber,
                              part.initialStatus
                            );
                            const isSel = part.partNumber === selectedRexPartNo;
                            return (
                              <tr
                                key={part.partNumber}
                                onClick={() => setSelectedRexPartNo(part.partNumber)}
                                className={`cursor-pointer transition-colors ${
                                  isSel ? 'bg-sky-500/20' : 'hover:bg-zinc-800/60'
                                }`}
                              >
                                <td className="py-1.5 px-2 font-bold text-amber-400">
                                  {part.partNumber}
                                </td>
                                <td className="py-1.5 px-2 text-zinc-100">
                                  <div className="font-semibold">{part.englishName}</div>
                                  <div className="text-[9px] text-zinc-400">
                                    {part.koreanName} · {part.materialSpec}
                                  </div>
                                </td>
                                <td className="py-1.5 px-2 text-sky-300 tabular-nums whitespace-nowrap">
                                  {part.subMmDimensions.lengthMm} ×{' '}
                                  {part.subMmDimensions.outerDiameterMm} ×{' '}
                                  {part.subMmDimensions.innerDiameterMm}mm
                                </td>
                                <td className="py-1.5 px-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      st === 'BUILT_BY_LOCAL_CODE'
                                        ? 'bg-sky-500/25 text-sky-300 border border-sky-400'
                                        : st === 'NEEDS_BUILD'
                                        ? 'bg-amber-500/25 text-amber-300 border border-amber-400'
                                        : 'bg-emerald-500/20 text-emerald-300'
                                    }`}
                                  >
                                    {st}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRexPartNo(part.partNumber);
                                      handleRunLocalCodeForPart(part.partNumber);
                                    }}
                                    className="px-2 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[9px] hover:bg-sky-400 cursor-pointer whitespace-nowrap"
                                  >
                                    ⚡ Build Code
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SUB-TAB 2: 6-STAGE MECHANICAL INTERACTION (HOW ALL 57 PARTS WORK TOGETHER) */}
                  {schematicSubTab === 'HOW_THEY_WORK_TOGETHER' && (
                    <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                      {REX_P_6_INTERACTION_STAGES.map((st) => (
                        <div
                          key={st.stageNumber}
                          className="bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px]"
                        >
                          <div className="flex items-center justify-between text-amber-400 font-bold mb-0.5">
                            <span>
                              STAGE {st.stageNumber}: {st.stageTitle}
                            </span>
                            <span className="text-sky-300">
                              Parts: {st.involvedParts.join(', ')}
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed mb-1">
                            {st.kinematicChainSummary}
                          </p>
                          <div className="text-emerald-400 font-semibold">
                            Sub-mm Physics: {st.subMmPhysicsDetail}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUB-TAB 3: 8-STEP MASTER DISASSEMBLY SEQUENCE */}
                  {schematicSubTab === 'DISASSEMBLY_SEQUENCE' && (
                    <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                      {REX_P_8_STEP_DISASSEMBLY_SEQUENCE.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px]"
                        >
                          <div className="flex items-center justify-between text-sky-400 font-bold mb-0.5">
                            <span>
                              STEP {step.stepNumber}: {step.stepTitle}
                            </span>
                            <span className="text-amber-300">{step.requiredTooling}</span>
                          </div>
                          <div className="text-red-400 font-semibold mb-0.5">
                            ⚠ {step.warningOrTorqueSpec}
                          </div>
                          <p className="text-zinc-300 leading-relaxed">{step.procedureDetail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Local Code Compiler Terminal Output */}
                <div className="mt-2.5 bg-zinc-950 border border-emerald-500/50 rounded-lg p-2.5 text-[10px]">
                  <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                    <span>
                      IN-GAME LOCAL CODE CAD COMPILER TERMINAL (PART {selectedRexPart.partNumber})
                    </span>
                    <span className="text-sky-300">
                      {lastCodeBuildResult
                        ? `✓ COMPILED ${lastCodeBuildResult.watertightFacets} TRIANGLES · SF ${lastCodeBuildResult.computedSafetyFactor}x`
                        : 'READY TO EXECUTE'}
                    </span>
                  </div>
                  <pre className="text-[10px] text-zinc-200 bg-zinc-900/90 p-2 rounded overflow-x-auto max-h-[120px] leading-relaxed">
                    {lastCodeBuildResult
                      ? lastCodeBuildResult.executionLogLines.join('\n')
                      : selectedRexPart.localCodeSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. 8-MODEL INTERACTIVE SUB-COMPONENT, O-RING & REAL-PHYSICS BENCHMARK SUITE
             (Rust × Steampunk Aesthetic · 100% Real Gas, Lamé & Parker O-Ring Physics)
         ==================================================================== */}
      {showBenchmarkModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/94 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-950 border border-red-500/70 rounded-xl max-w-[1400px] w-full max-h-[92vh] flex flex-col shadow-2xl font-mono overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
              <div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  RUST × STEAMPUNK PNEUMATIC BENCHMARK SUITE (8 WEAPON MODELS) · SUB-MM O-RINGS, SEALS &amp; REAL PHYSICS · ACCURACY 99%
                </div>
                <h3 className="text-sm md:text-base font-bold text-zinc-100">
                  {activeBenchmarkModel.fullTitle}
                </h3>
                <div className="text-[10px] text-sky-300 mt-0.5">
                  {activeBenchmarkModel.steampunkRustLoreSubtitle}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleEquipBenchmarkModelIn3D(activeBenchmarkModel.modelId);
                    setShowBenchmarkModal(false);
                  }}
                  className="px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  ⚡ Equip This 3D Model on Workbench
                </button>
                <button
                  type="button"
                  onClick={onExportStl}
                  className="px-3 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-xs hover:bg-sky-400 cursor-pointer"
                >
                  ⬇ Export Remade Model .STL
                </button>
                <button
                  type="button"
                  onClick={() => setShowBenchmarkModal(false)}
                  className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Close Benchmarks
                </button>
              </div>
            </div>

            {/* 8-Model Selector Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 overflow-x-auto">
              {INTERACTIVE_WEAPON_BENCHMARK_MODELS.map((m) => {
                const isSelected = m.modelId === activeBenchmarkModel.modelId;
                return (
                  <button
                    key={m.modelId}
                    type="button"
                    onClick={() => {
                      setSelectedBenchmarkModelId(m.modelId);
                      setSelectedBenchmarkPinNumber(1);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white border-amber-300 font-bold shadow'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-500/60'
                    }`}
                  >
                    {m.shortBadge}
                  </button>
                );
              })}
            </div>

            {/* Main 12-Column Interactive Benchmark & O-Ring Inspector */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
              {/* LEFT 5 COLUMNS: Interactive Reference Photo + Steampunk Vector CAD Cross-Section with Clickable Pins */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-900/70 border border-zinc-800 rounded-lg p-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <div className="text-xs font-bold text-amber-300">
                      Click Any Pin [1]–[{activeBenchmarkModel.subComponentsAndOrings.length}] to Inspect O-Ring / Part
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBenchmarkVisualMode('PHOTO_WITH_PINS')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          benchmarkVisualMode === 'PHOTO_WITH_PINS'
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        Hardware Reference + Pins
                      </button>
                      <button
                        type="button"
                        onClick={() => setBenchmarkVisualMode('STEAMPUNK_CAD_BLUEPRINT')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          benchmarkVisualMode === 'STEAMPUNK_CAD_BLUEPRINT'
                            ? 'bg-sky-500 text-zinc-950 font-bold'
                            : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        Steampunk CAD Section SVG
                      </button>
                    </div>
                  </div>

                  {benchmarkVisualMode === 'PHOTO_WITH_PINS' ? (
                    <div className="relative rounded-lg overflow-hidden border border-amber-500/40 bg-zinc-950 max-h-[290px] flex items-center justify-center">
                      <img
                        src={activeBenchmarkModel.referenceImageUrl}
                        alt={activeBenchmarkModel.fullTitle}
                        className="w-full max-h-[285px] object-contain"
                      />
                      {activeBenchmarkModel.subComponentsAndOrings.map((part, idx) => {
                        const pinNum = idx + 1;
                        const isPinSelected = pinNum === selectedBenchmarkPinNumber;
                        const pinColor =
                          part.category === 'HIGH_PRESSURE_ORING_SEAL'
                            ? '#ef4444'
                            : part.category === 'VALVE_POPPET_OR_BURST_FOIL'
                            ? '#f59e0b'
                            : part.category === 'PRESSURE_VESSEL_OR_PLENUM'
                            ? '#38bdf8'
                            : '#10b981';
                        return (
                          <button
                            key={part.partCode}
                            type="button"
                            onClick={() => setSelectedBenchmarkPinNumber(pinNum)}
                            style={{
                              top: `${part.photoPinY}%`,
                              left: `${part.photoPinX}%`,
                              backgroundColor: pinColor,
                            }}
                            title={`[${pinNum}] ${part.partCode}: ${part.name}`}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border shadow-lg cursor-pointer transition-transform ${
                              isPinSelected
                                ? 'scale-125 border-2 border-white text-zinc-950 ring-2 ring-amber-400'
                                : 'border-zinc-950 text-zinc-950 opacity-95 hover:scale-110'
                            }`}
                          >
                            {pinNum}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Steampunk × Rust Orthographic CAD Cross-Section SVG with Live O-Ring Callouts */
                    <div className="relative rounded-lg overflow-hidden border border-amber-500/50 bg-[#0d1117] p-2">
                      <svg
                        viewBox="0 0 800 390"
                        className="w-full h-auto select-none"
                        role="img"
                        aria-label={`${activeBenchmarkModel.fullTitle} Steampunk CAD Section`}
                      >
                        <defs>
                          <pattern
                            id="steampunkGrid"
                            width="28"
                            height="28"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 28 0 L 0 0 0 28"
                              fill="none"
                              stroke="#1e293b"
                              strokeWidth="0.8"
                            />
                          </pattern>
                        </defs>
                        <rect width="800" height="390" fill="url(#steampunkGrid)" />
                        <rect
                          x="10"
                          y="10"
                          width="780"
                          height="370"
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="1.6"
                        />
                        <text x="24" y="30" fill="#fbbf24" fontSize="11.5" fontWeight="bold">
                          STEAMPUNK × RUST B-REP SECTION: {activeBenchmarkModel.shortBadge.toUpperCase()}
                        </text>
                        <text x="24" y="46" fill="#94a3b8" fontSize="9.5">
                          CLICK ANY PIN [1]–[{activeBenchmarkModel.subComponentsAndOrings.length}] TO INSPECT O-RING GLANDS, SQUEEZE %, &amp; REAL PHYSICS
                        </text>

                        {/* Dynamic Model Cross-Section Geometry */}
                        {activeBenchmarkModel.modelId === 'MODEL_01_P90_45_HELICAL_PLENUM' ? (
                          <g>
                            {/* Top Smoked Polycarbonate P90 Spine + Transverse .45 Sabot Stack */}
                            <rect
                              x="160"
                              y="66"
                              width="380"
                              height="52"
                              rx="6"
                              fill="#1c1917"
                              fillOpacity="0.88"
                              stroke="#f59e0b"
                              strokeWidth="2"
                            />
                            {[185, 215, 245, 275, 305, 335, 365, 395, 425, 455, 485].map((sx, i) => (
                              <ellipse
                                key={i}
                                cx={sx}
                                cy="92"
                                rx="8"
                                ry="18"
                                fill="#d97706"
                                stroke="#fef3c7"
                                strokeWidth="1.1"
                              />
                            ))}
                            {/* 145cc Mag Reserve Spine Tube */}
                            <rect
                              x="175"
                              y="124"
                              width="350"
                              height="24"
                              rx="4"
                              fill="#0c4a6e"
                              stroke="#38bdf8"
                              strokeWidth="1.8"
                            />
                            {/* 90° Helical Turret Drop-In Breech */}
                            <circle
                              cx="565"
                              cy="145"
                              r="42"
                              fill="#27272a"
                              stroke="#fbbf24"
                              strokeWidth="2.4"
                            />
                            <rect
                              x="546"
                              y="134"
                              width="38"
                              height="20"
                              rx="4"
                              fill="#b45309"
                              stroke="#fef08a"
                            />
                            {/* Dry-Break Stinger Tube into Lower Plenum */}
                            <rect
                              x="410"
                              y="148"
                              width="22"
                              height="84"
                              fill="#fbbf24"
                              stroke="#f59e0b"
                            />
                            {/* Lower Regulated Plenum & .45 Rifled Barrel */}
                            <rect
                              x="75"
                              y="175"
                              width="445"
                              height="32"
                              rx="4"
                              fill="#0f172a"
                              stroke="#22d3ee"
                              strokeWidth="1.8"
                            />
                            <rect
                              x="335"
                              y="230"
                              width="265"
                              height="54"
                              rx="6"
                              fill="#064e3b"
                              stroke="#10b981"
                              strokeWidth="2"
                            />
                          </g>
                        ) : activeBenchmarkModel.modelId ===
                          'MODEL_02_BURST_DISK_4STAGE_FAMILY' ? (
                          <g>
                            {/* Stage 1 Fitting Body + CuNi Burst Disk + Retainer + Stage 2 Red Pen + Stage 3 2-Shell */}
                            <rect
                              x="75"
                              y="95"
                              width="260"
                              height="62"
                              rx="5"
                              fill="#334155"
                              stroke="#38bdf8"
                              strokeWidth="2"
                            />
                            {/* Coned CuNi Burst Disk */}
                            <path
                              d="M 340 95 Q 368 126 340 157"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="5"
                            />
                            {/* Hex Retainer */}
                            <rect
                              x="348"
                              y="88"
                              width="135"
                              height="76"
                              rx="4"
                              fill="#1e293b"
                              stroke="#10b981"
                              strokeWidth="2"
                            />
                            {/* Red Air Pen & Twin AEA Shells below */}
                            <rect
                              x="110"
                              y="205"
                              width="510"
                              height="32"
                              rx="14"
                              fill="#991b1b"
                              stroke="#f87171"
                              strokeWidth="2"
                            />
                            <rect
                              x="180"
                              y="265"
                              width="180"
                              height="30"
                              rx="5"
                              fill="#dc2626"
                              stroke="#fde047"
                            />
                            <rect
                              x="390"
                              y="265"
                              width="180"
                              height="30"
                              rx="5"
                              fill="#dc2626"
                              stroke="#fde047"
                            />
                          </g>
                        ) : (
                          <g>
                            {/* Concentric Multi-Layer Barrel + Silencer Baffles + Outer OTB Air Reserve + Breech */}
                            <rect
                              x="60"
                              y="102"
                              width="425"
                              height="118"
                              rx="10"
                              fill="#1e1b4b"
                              fillOpacity="0.65"
                              stroke="#a855f7"
                              strokeWidth="2"
                            />
                            <rect
                              x="78"
                              y="128"
                              width="390"
                              height="66"
                              rx="6"
                              fill="#0f172a"
                              stroke="#38bdf8"
                              strokeWidth="1.8"
                            />
                            {[120, 175, 230, 285, 340, 395].map((bx, i) => (
                              <line
                                key={i}
                                x1={bx}
                                y1="128"
                                x2={bx - 14}
                                y2="194"
                                stroke="#22d3ee"
                                strokeWidth="2.4"
                              />
                            ))}
                            <line
                              x1="68"
                              y1="161"
                              x2="650"
                              y2="161"
                              stroke="#fbbf24"
                              strokeWidth="5"
                            />
                            <circle
                              cx="525"
                              cy="161"
                              r="46"
                              fill="#7f1d1d"
                              stroke="#f87171"
                              strokeWidth="2.4"
                            />
                            <rect
                              x="485"
                              y="232"
                              width="240"
                              height="64"
                              rx="8"
                              fill="#18181b"
                              stroke="#10b981"
                              strokeWidth="2"
                            />
                          </g>
                        )}

                        {/* Clickable Numbered Sub-Component & O-Ring Pins on SVG */}
                        {activeBenchmarkModel.subComponentsAndOrings.map((part, idx) => {
                          const pinNum = idx + 1;
                          const isSelected = pinNum === selectedBenchmarkPinNumber;
                          const cx = part.svgNodeX;
                          const cy = part.svgNodeY;
                          const pinColor =
                            part.category === 'HIGH_PRESSURE_ORING_SEAL'
                              ? '#ef4444'
                              : part.category === 'VALVE_POPPET_OR_BURST_FOIL'
                              ? '#f59e0b'
                              : part.category === 'PRESSURE_VESSEL_OR_PLENUM'
                              ? '#38bdf8'
                              : '#10b981';
                          return (
                            <g
                              key={part.partCode}
                              onClick={() => setSelectedBenchmarkPinNumber(pinNum)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isSelected ? 15 : 11}
                                fill={pinColor}
                                stroke={isSelected ? '#ffffff' : '#090d16'}
                                strokeWidth={isSelected ? 3 : 1.6}
                              />
                              <text
                                x={cx}
                                y={cy + 4}
                                textAnchor="middle"
                                fill="#090d16"
                                fontSize="10.5"
                                fontWeight="bold"
                              >
                                {pinNum}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}

                  {/* Architecture & Real-Physics Summary */}
                  <p className="mt-2 text-[10px] text-zinc-300 leading-relaxed bg-zinc-950/80 border border-zinc-800 rounded p-2">
                    {activeBenchmarkModel.realThermodynamicSummary}
                  </p>
                </div>

                {/* Clickable Pin Legend List */}
                <div className="mt-2 grid grid-cols-1 gap-1 max-h-[195px] overflow-y-auto text-[10px] bg-zinc-950/95 border border-zinc-800 rounded p-2">
                  {activeBenchmarkModel.subComponentsAndOrings.map((part, idx) => {
                    const pinNum = idx + 1;
                    const isSelected = pinNum === selectedBenchmarkPinNumber;
                    const pinColor =
                      part.category === 'HIGH_PRESSURE_ORING_SEAL'
                        ? '#ef4444'
                        : part.category === 'VALVE_POPPET_OR_BURST_FOIL'
                        ? '#f59e0b'
                        : part.category === 'PRESSURE_VESSEL_OR_PLENUM'
                        ? '#38bdf8'
                        : '#10b981';
                    return (
                      <button
                        key={part.partCode}
                        type="button"
                        onClick={() => setSelectedBenchmarkPinNumber(pinNum)}
                        className={`text-left px-2 py-1 rounded border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-zinc-100 font-bold'
                            : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="truncate">
                          <span
                            style={{ color: pinColor }}
                            className="font-bold mr-1"
                          >
                            [{pinNum}] {part.partCode}:
                          </span>
                          {part.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 shrink-0">
                          {part.category.replace(/_/g, ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT 7 COLUMNS: O-Ring & Sub-Component Inspector + Multi-Agent Caliber Remake Matrix */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-900/70 border border-zinc-800 rounded-lg p-3">
                <div>
                  {/* Sub-Tab Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBenchmarkRightTab('ORINGS_AND_SUBCOMPONENTS')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          benchmarkRightTab === 'ORINGS_AND_SUBCOMPONENTS'
                            ? 'bg-amber-500 text-zinc-950'
                            : 'bg-zinc-950 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        01. Sub-Components, O-Rings &amp; Seals ({activeBenchmarkModel.subComponentsAndOrings.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBenchmarkRightTab('CALIBER_REMAKE_MATRIX')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          benchmarkRightTab === 'CALIBER_REMAKE_MATRIX'
                            ? 'bg-red-500 text-white'
                            : 'bg-zinc-950 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        02. Autonomous Caliber Remake Matrix (.22 → .50 Cal)
                      </button>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Real Parker O-Ring &amp; Lamé Stress Physics
                    </span>
                  </div>

                  {benchmarkRightTab === 'ORINGS_AND_SUBCOMPONENTS' ? (
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950/90 border border-zinc-800 rounded px-2.5 py-1.5 text-[10px]">
                        <span className="text-zinc-300">
                          Click <strong className="text-amber-300">⚡ Create Unique Part</strong> on any component row below to generate a bespoke, shape-accurate 3D `.STL` &amp; SVG part for that exact component:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextMap = { ...createdUniquePartsByCode };
                              activeBenchmarkModel.subComponentsAndOrings.forEach((comp) => {
                                nextMap[comp.partCode] = synthesizeUniqueBenchmarkComponentAsset(
                                  comp,
                                  activeBenchmarkModel.fullTitle
                                );
                              });
                              setCreatedUniquePartsByCode(nextMap);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 cursor-pointer"
                          >
                            ⚡ Create All {activeBenchmarkModel.subComponentsAndOrings.length} Unique Model Parts
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateAndEquipEvanixRexPInGameAsset}
                            className="px-2 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold hover:bg-sky-400 cursor-pointer"
                          >
                            {rexPInGameAssetCreated
                              ? '✓ REX-P In-Game 3D Asset Active'
                              : '⚡ Build & Equip Evanix REX-P 3D Asset'}
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[215px] overflow-y-auto border border-zinc-800 rounded">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase">
                            <tr>
                              <th className="py-1.5 px-2">Pin / Code</th>
                              <th className="py-1.5 px-2">Part / O-Ring Seal</th>
                              <th className="py-1.5 px-2">Compound / Durometer</th>
                              <th className="py-1.5 px-2">Sub-mm (L × OD × ID)</th>
                              <th className="py-1.5 px-2 text-right">Unique Part / Asset</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/70">
                            {activeBenchmarkModel.subComponentsAndOrings.map((item, idx) => {
                              const pinNum = idx + 1;
                              const isSelected = pinNum === selectedBenchmarkPinNumber;
                              const createdAsset = createdUniquePartsByCode[item.partCode];
                              return (
                                <tr
                                  key={item.partCode}
                                  onClick={() => setSelectedBenchmarkPinNumber(pinNum)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-amber-500/20 border-l-2 border-amber-400'
                                      : 'hover:bg-zinc-800/60'
                                  }`}
                                >
                                  <td className="py-1.5 px-2 font-bold text-amber-400 whitespace-nowrap">
                                    [{pinNum}] {item.partCode}
                                  </td>
                                  <td className="py-1.5 px-2 text-zinc-100 font-semibold">
                                    {item.name}
                                  </td>
                                  <td className="py-1.5 px-2 text-amber-300">
                                    {item.materialAndDurometer}
                                  </td>
                                  <td className="py-1.5 px-2 text-sky-300 tabular-nums whitespace-nowrap">
                                    {item.dimensionsMm.lengthOrThicknessMm} × Ø{item.dimensionsMm.outerDiameterMm} × Ø{item.dimensionsMm.innerDiameterMm}mm
                                  </td>
                                  <td className="py-1.5 px-2 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCreateUniqueBenchmarkComponent(item, pinNum);
                                        }}
                                        className={`px-2 py-0.5 rounded font-bold text-[9px] cursor-pointer ${
                                          createdAsset
                                            ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 hover:bg-emerald-500 hover:text-zinc-950'
                                            : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                                        }`}
                                      >
                                        {createdAsset
                                          ? `✓ Built (${createdAsset.stlTriangleCount} Tris)`
                                          : `⚡ Create ${item.partCode} Part`}
                                      </button>
                                      {createdAsset && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadUniqueComponentStl(createdAsset);
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[9px] hover:bg-sky-400 cursor-pointer"
                                          title={`Download watertight ${createdAsset.stlFileName}`}
                                        >
                                          ⬇ .STL
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-zinc-400 mb-1.5">
                        Click any caliber row below to dynamically re-bore the 3D Barrel, Magazine/Sabot Carrier, Valve Port, and O-Ring Gland ID/OD:
                      </p>
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                            <th className="py-1.5 pr-2">Caliber</th>
                            <th className="py-1.5 px-2">Mag / Shell Capacity</th>
                            <th className="py-1.5 px-2">Indexing / Helical Pitch</th>
                            <th className="py-1.5 px-2">Breech / Sabot OD</th>
                            <th className="py-1.5 px-2">Port / Shroud OD</th>
                            <th className="py-1.5 px-2">Energy / SF</th>
                            <th className="py-1.5 pl-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/70">
                          {activeBenchmarkModel.caliberRemakeMatrix.map((row) => {
                            const isSelected =
                              Math.abs(row.caliberMm - customCaliberMm) < 0.2;
                            return (
                              <tr
                                key={row.caliberMm}
                                onClick={() => {
                                  onChangeCustomCaliber(row.caliberMm);
                                  onChangeWeaponFamilyContext?.(
                                    {
                                      familyId: activeBenchmarkModel.linkedFamilyContext.familyId,
                                      burstStage:
                                        activeBenchmarkModel.linkedFamilyContext.burstStage ??
                                        effectiveFamilyCtx.burstStage,
                                      rexMode:
                                        activeBenchmarkModel.linkedFamilyContext.rexMode ??
                                        effectiveFamilyCtx.rexMode,
                                      p90Payload:
                                        activeBenchmarkModel.linkedFamilyContext.p90Payload ??
                                        effectiveFamilyCtx.p90Payload ??
                                        'SLUG_45_BOATTAIL_220GR',
                                    },
                                    row.caliberMm
                                  );
                                  onSetExploded(0.75);
                                }}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-red-500/20 border-l-2 border-red-500'
                                    : 'hover:bg-zinc-800/60'
                                }`}
                              >
                                <td className="py-1.5 pr-2 font-bold text-zinc-100 whitespace-nowrap">
                                  {row.caliberLabel}
                                </td>
                                <td className="py-1.5 px-2 text-red-300 font-semibold">
                                  {row.magOrShellCapacity}
                                </td>
                                <td className="py-1.5 px-2 text-amber-300">
                                  {row.indexingAngleOrPitch}
                                </td>
                                <td className="py-1.5 px-2 text-emerald-300">
                                  {row.breechOrSabotOdMm}
                                </td>
                                <td className="py-1.5 px-2 text-sky-300">
                                  {row.transferPortOrOtbOdMm}
                                </td>
                                <td className="py-1.5 px-2 text-zinc-300 whitespace-nowrap">
                                  {row.muzzleEnergyJoules}J · SF {row.safetyFactor}x
                                </td>
                                <td className="py-1.5 pl-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      isSelected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-zinc-800 text-zinc-300'
                                    }`}
                                  >
                                    {isSelected ? 'ACTIVE' : 'REMAKE'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* SELECTED SUB-COMPONENT / O-RING DEEP-DIVE REAL-PHYSICS INSPECTOR CARD */}
                <div className="mt-2.5 bg-zinc-950 border border-amber-500/60 rounded-lg p-3 text-[11px] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                    <div>
                      <span className="text-amber-400 font-bold uppercase">
                        PIN [{selectedBenchmarkPinNumber}] {activeBenchmarkSubComp.partCode}
                      </span>{' '}
                      <span className="text-zinc-100 font-bold">
                        — {activeBenchmarkSubComp.name}
                      </span>
                      <span className="text-sky-400 text-[10px] ml-2">
                        ({activeBenchmarkSubComp.steampunkRustAlias})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-bold">
                      {activeBenchmarkSubComp.materialAndDurometer}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded p-2">
                      <span className="text-zinc-400 block uppercase text-[9px]">
                        Sub-mm Geometry &amp; Tolerance:
                      </span>
                      <span className="text-sky-300 font-bold">
                        L/T={activeBenchmarkSubComp.dimensionsMm.lengthOrThicknessMm}mm · OD=Ø{activeBenchmarkSubComp.dimensionsMm.outerDiameterMm}mm · ID=Ø{activeBenchmarkSubComp.dimensionsMm.innerDiameterMm}mm · Wall/CS={activeBenchmarkSubComp.dimensionsMm.wallOrCrossSectionMm}mm ({activeBenchmarkSubComp.dimensionsMm.toleranceMm})
                      </span>
                    </div>
                    <div className="bg-zinc-900/90 border border-amber-500/40 rounded p-2">
                      <span className="text-amber-400 block uppercase text-[9px] font-bold">
                        O-Ring Gland Squeeze &amp; Safety Factor:
                      </span>
                      <span className="text-amber-200 font-semibold">
                        {activeBenchmarkSubComp.realPhysicsSpec.squeezeOrClearancePct} · P={activeBenchmarkSubComp.realPhysicsSpec.operatingPressureBar} Bar · SF={activeBenchmarkSubComp.realPhysicsSpec.hoopOrShearSafetyFactor}x
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-200 leading-relaxed">
                    <strong className="text-emerald-400">
                      How Sub-Component &amp; Seals Work Together:
                    </strong>{' '}
                    {activeBenchmarkSubComp.howItWorksWithNeighbors}
                  </div>

                  <div className="bg-zinc-900/95 border border-sky-500/40 rounded p-2 text-[10px] text-sky-200 font-mono">
                    <strong className="text-sky-400">Real Physics Equation:</strong>{' '}
                    {activeBenchmarkSubComp.realPhysicsSpec.governingEquation}
                  </div>

                  <div className="text-[10px] text-red-300">
                    <strong className="text-red-400">
                      Failure Mode if Omitted / Damaged:
                    </strong>{' '}
                    {activeBenchmarkSubComp.realPhysicsSpec.failureModeIfOmitted}
                  </div>

                  {/* BESPOKE UNIQUE PART & IN-GAME ASSET SYNTHESIS BAR FOR SELECTED COMPONENT */}
                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCreateUniqueBenchmarkComponent(
                            activeBenchmarkSubComp,
                            selectedBenchmarkPinNumber
                          )
                        }
                        className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
                      >
                        ⚡ Create Unique {activeBenchmarkSubComp.partCode} Part &amp; 3D Asset
                      </button>
                      {createdUniquePartsByCode[activeBenchmarkSubComp.partCode] && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadUniqueComponentStl(
                              createdUniquePartsByCode[activeBenchmarkSubComp.partCode]
                            )
                          }
                          className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                        >
                          ⬇ Download {createdUniquePartsByCode[activeBenchmarkSubComp.partCode].stlFileName} ({createdUniquePartsByCode[activeBenchmarkSubComp.partCode].stlTriangleCount} Tris)
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-emerald-400">
                      {createdUniquePartsByCode[activeBenchmarkSubComp.partCode]
                        ? `✓ Unique Archetype: ${createdUniquePartsByCode[activeBenchmarkSubComp.partCode].shapeArchetype}`
                        : 'Ready to synthesize unique sub-mm geometry'}
                    </span>
                  </div>

                  {createdUniquePartsByCode[activeBenchmarkSubComp.partCode] && (
                    <div className="mt-2 bg-zinc-900/95 border border-emerald-500/50 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="text-emerald-300 font-bold uppercase">
                          ✓ UNIQUE GENERATED PART ASSET: {createdUniquePartsByCode[activeBenchmarkSubComp.partCode].partCode} ({createdUniquePartsByCode[activeBenchmarkSubComp.partCode].shapeArchetype})
                        </span>
                        <span className="text-sky-300">
                          {createdUniquePartsByCode[activeBenchmarkSubComp.partCode].dimensionsSummary}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300">
                        {createdUniquePartsByCode[activeBenchmarkSubComp.partCode].uniqueFeatureSummary}
                      </p>
                      <div
                        className="w-full h-[145px] bg-zinc-950 border border-zinc-800 rounded p-1 overflow-hidden"
                        dangerouslySetInnerHTML={{
                          __html:
                            createdUniquePartsByCode[activeBenchmarkSubComp.partCode]
                              .customSvgDrawing,
                        }}
                      />
                      <div className="text-[9px] text-amber-300 font-mono truncate">
                        $ {createdUniquePartsByCode[activeBenchmarkSubComp.partCode].ollamaCommandUsed}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          6. MASTER LIST OF PARTS (BILL OF MATERIALS) MODAL OVERLAY
         ==================================================================== */}
      {showBomModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 rounded-xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800">
              <div>
                <div className="text-[10px] text-amber-400 uppercase tracking-widest">
                  MASTER PNEUMATIC &amp; 3D-PRINTABLE BILL OF MATERIALS (BOM)
                </div>
                <h3 className="text-base font-bold text-zinc-100">
                  Complete Functional Parts List ({PNEUMATIC_PARTS_CATALOG.length} Engineered
                  Components)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Filter BOM Subsystem"
                  value={bomFilter}
                  onChange={(e) => setBomFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-100"
                >
                  <option value="ALL">
                    All Subsystems ({PNEUMATIC_PARTS_CATALOG.length})
                  </option>
                  <option value="FX_DRS_OTB_AND_PLENUM">
                    OTB Barrels, Shrouds, Plenums &amp; QE Moderators
                  </option>
                  <option value="LESHIY2_STOCK_AND_ROTARY">
                    Stocks, Underlevers, Lever-Actions &amp; Rotary Mags
                  </option>
                  <option value="SENECA_ASPEN_3STAGE_PUMP">
                    Air Venturi Ascent/Aspen 3-Stage Apex Pump &amp; Part 116 Balancer
                  </option>
                  <option value="CAM_LOCK_FOREGRIP_AND_MANIFOLD">
                    Cam-Lock Foregrip, MP30 Grip Tank &amp; Velox Cells
                  </option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowBomModal(false)}
                  className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                    <th className="py-1.5 pr-2">Part Ref</th>
                    <th className="py-1.5 px-2">Component Name</th>
                    <th className="py-1.5 px-2">Subsystem</th>
                    <th className="py-1.5 px-2">Capacity / Spec</th>
                    <th className="py-1.5 pl-2">Primary Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredBomParts.map((part) => (
                    <tr key={part.id} className="hover:bg-zinc-900/60">
                      <td className="py-1.5 pr-2 text-amber-400 font-semibold whitespace-nowrap">
                        {part.partRef}
                      </td>
                      <td className="py-1.5 px-2 text-zinc-100 font-medium">
                        {part.name}
                      </td>
                      <td className="py-1.5 px-2 text-sky-300 whitespace-nowrap">
                        {part.subsystem}
                      </td>
                      <td className="py-1.5 px-2 text-emerald-300">
                        {part.capacityOrSpec}
                      </td>
                      <td className="py-1.5 pl-2 text-zinc-400">
                        {part.primaryFunction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          7. REDESIGNED ASCENT × HATSAN VECTIS .45 CAL (12 PARTS WRITTEN DOWN +
             IN-GAME 300-BAR ONBOARD HAND PUMP OBJECT & OVER-BARREL 2+ RD PLENUM)
         ==================================================================== */}
      {showAscent12PartPumpModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/94 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-950 border border-emerald-500/80 rounded-xl max-w-[1380px] w-full max-h-[92vh] flex flex-col shadow-2xl font-mono overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/85">
              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                  REDESIGNED ASCENT × HATSAN VECTIS .45 CAL (11.43MM) · ALL 12 PARTS WRITTEN DOWN · IN-GAME 300-BAR PUMP OBJECT
                </div>
                <h3 className="text-sm md:text-base font-bold text-zinc-100">
                  Concentric Over-Barrel 140cc Regulated Plenum (2.6 Full .45 Shots) + QuietEnergy Silencer + 300-Bar Under-Barrel Air Reserve &amp; Pump
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectFamily('ASCENT_3STAGE_ONBOARD_PUMP_FAMILY', undefined, 11.43);
                    onSetExploded(0.65);
                  }}
                  className="px-3 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-xs hover:bg-sky-400 cursor-pointer"
                >
                  🔧 Equip .45 Ascent in 3D Stage
                </button>
                <button
                  type="button"
                  onClick={() => setShowAscent12PartPumpModal(false)}
                  className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3.5 overflow-y-auto">
              {/* LEFT 5 COLS: Reference Diagram w/ Interactive Numbered Pins + In-Game 300-Bar Pump Object */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {/* Annotated Reference Hardware Image */}
                <div className="relative bg-white rounded-lg border border-zinc-700 overflow-hidden p-2">
                  <img
                    src="/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg"
                    alt="Ascent x Hatsan Vectis Lever Action Reference Diagram"
                    className="w-full h-48 object-contain"
                  />
                  {ASCENT_45_300BAR_12_PARTS_CATALOG.map((pt) => {
                    const isSel = pt.partNumber === selectedAscentPartNumber;
                    return (
                      <button
                        key={pt.partCode}
                        type="button"
                        onClick={() => setSelectedAscentPartNumber(pt.partNumber)}
                        style={{ left: `${pt.photoPinX}%`, top: `${pt.photoPinY}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border shadow cursor-pointer ${
                          isSel
                            ? 'bg-emerald-500 text-zinc-950 border-zinc-950 scale-125 z-10'
                            : 'bg-zinc-950/90 text-amber-300 border-amber-400 hover:scale-110'
                        }`}
                        title={`${pt.partCode}: ${pt.diagramCalloutTitle}`}
                      >
                        {pt.partNumber}
                      </button>
                    );
                  })}
                </div>

                {/* INTERACTIVE IN-GAME 300-BAR ONBOARD HAND PUMP OBJECT */}
                <div className="bg-zinc-900/95 border-2 border-emerald-500/80 rounded-xl p-3 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      ⚡ In-Game Interactive 3-Stage 300-Bar Pump Object
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-bold">
                      MAX 300 BAR (4,350 PSI)
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-300 leading-relaxed">
                    Connected directly to the <strong>240cc Under-Barrel 300-Bar Air Reserve (#11)</strong>. Pumping compresses air to <strong>300 Bar</strong>, which feeds through the regulator into the <strong>140cc Concentric Over-the-Barrel Plenum (#09)</strong> at <strong>210 Bar</strong> (storing <strong>2.6 full-power .45 Cal shots</strong> inside the barrel shroud itself + QuietEnergy Moderator #10).
                  </p>

                  {/* Dual Live Pressure Gauges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
                      <div className="text-[9px] text-zinc-400 uppercase">
                        Under-Barrel Air Reserve (#11)
                      </div>
                      <div className="text-base font-bold text-amber-400 tabular-nums">
                        {Math.round(pneumaticState.otbPressureBar)} / 300 Bar
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded overflow-hidden mt-1">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((pneumaticState.otbPressureBar / 300) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
                      <div className="text-[9px] text-zinc-400 uppercase">
                        Over-Barrel 140cc Plenum (#09)
                      </div>
                      <div className="text-base font-bold text-sky-400 tabular-nums">
                        {Math.round(pneumaticState.plenumPressureBar)} / 210 Bar
                      </div>
                      <div className="text-[9px] text-emerald-300 font-semibold mt-0.5">
                        Capacity: 2.6 Full .45 Cal Shots in Barrel Plenum
                      </div>
                    </div>
                  </div>

                  {/* Interactive Pump & Fire Controls */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onPumpAscentTo300Bar?.('SINGLE_3STAGE_STROKE')}
                      className="py-2 px-2 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                    >
                      🔧 Pump 1 Stroke (+28 Bar)
                    </button>
                    <button
                      type="button"
                      onClick={() => onPumpAscentTo300Bar?.('FULL_300BAR_PUMP_UP')}
                      className="py-2 px-2 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                    >
                      ⚡ Pump Full to 300 Bar
                    </button>
                    <button
                      type="button"
                      onClick={onBenchFire}
                      className="py-2 px-2 rounded bg-red-500 text-white font-bold text-xs hover:bg-red-400 cursor-pointer"
                    >
                      🔥 Test Fire .45 ({pneumaticState.magazineLoaded}/{pneumaticState.magazineCapacity})
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT 7 COLS: Complete Written-Down 12-Part Ascent .45 Catalog & Selected Part Inspector */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-2.5">
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-2.5 overflow-y-auto max-h-[340px]">
                  <div className="text-[10px] text-amber-400 font-bold uppercase mb-1.5">
                    ALL 12 WRITTEN-DOWN PARTS OF THE REDESIGNED ASCENT × VECTIS .45 CAL (CLICK ANY PART TO INSPECT)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {ASCENT_45_300BAR_12_PARTS_CATALOG.map((pt) => {
                      const isSel = pt.partNumber === selectedAscentPartNumber;
                      return (
                        <button
                          key={pt.partCode}
                          type="button"
                          onClick={() => setSelectedAscentPartNumber(pt.partNumber)}
                          className={`text-left p-2 rounded border transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-emerald-500/20 border-emerald-400 text-zinc-100'
                              : 'bg-zinc-950/90 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-emerald-400">
                              #{String(pt.partNumber).padStart(2, '0')} · {pt.partCode}
                            </span>
                            <span className="text-amber-300">
                              {pt.operatingPressureBar > 0
                                ? `${pt.operatingPressureBar} Bar`
                                : 'Mechanical'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-zinc-100 truncate mt-0.5">
                            {pt.diagramCalloutTitle}
                          </div>
                          <div className="text-[9px] text-zinc-400 truncate">
                            {pt.dimensionsMm}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Part Deep-Dive Card */}
                <div className="bg-zinc-900/95 border border-emerald-500/60 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                    <div>
                      <span className="text-emerald-400 font-bold">
                        PART #{String(selectedAscentPart.partNumber).padStart(2, '0')} ({selectedAscentPart.partCode}):
                      </span>{' '}
                      <span className="text-zinc-100 font-bold">
                        {selectedAscentPart.diagramCalloutTitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-bold">
                      {selectedAscentPart.materialAndSealSpec}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-200 leading-relaxed">
                    {selectedAscentPart.redesigned45EngineeringRole}
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[10px] text-sky-300 pt-1">
                    <span>Sub-mm Dimensions: {selectedAscentPart.dimensionsMm}</span>
                    <span>
                      Rated Pressure:{' '}
                      {selectedAscentPart.operatingPressureBar > 0
                        ? `${selectedAscentPart.operatingPressureBar} Bar`
                        : 'Mechanical Linkage'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          8. AIRGUN MECHANICS VIDEO WATCHER, SCREENSHOT CAPTURER & TRANSCRIPTION STUDIO
         ==================================================================== */}
      {showVideoStudioModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/94 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-950 border border-purple-500/80 rounded-xl max-w-[1360px] w-full max-h-[90vh] flex flex-col shadow-2xl font-mono overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/85">
              <div>
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                  AIRGUN MECHANICS VIDEO STUDIO · WATCH, TRANSCRIBE, CAPTURE SCREENSHOTS &amp; RECREATE IN-GAME
                </div>
                <h3 className="text-sm md:text-base font-bold text-zinc-100">
                  {activeVideo.title} ({activeVideo.durationSec}s · {activeVideo.channelOrSource})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoStudioModal(false)}
                className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
              >
                Close Studio [ESC]
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 overflow-x-auto">
              {AIRGUN_MECHANICS_VIDEO_LIBRARY.map((vid) => (
                <button
                  key={vid.videoId}
                  type="button"
                  onClick={() => {
                    setSelectedVideoId(vid.videoId);
                    setSelectedVideoSegmentIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] border whitespace-nowrap cursor-pointer ${
                    vid.videoId === selectedVideoId
                      ? 'bg-purple-500 text-zinc-950 border-purple-300 font-bold'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-purple-400'
                  }`}
                >
                  🎬 {vid.title}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3.5 overflow-y-auto">
              <div className="lg:col-span-6 flex flex-col gap-2.5">
                <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  <img
                    src="/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg"
                    alt={activeVideo.title}
                    className="w-full h-56 object-contain bg-zinc-950"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/90 border border-purple-500/60 rounded p-2 text-[10px] text-zinc-100">
                    <span className="text-purple-400 font-bold">
                      [{activeVideoSegment.timestampFormatted}] CC TRANSCRIPT:
                    </span>{' '}
                    {activeVideoSegment.transcribedNarrationAndPhysics}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureVideoScreenshot}
                    className="px-3 py-1.5 rounded bg-sky-500 text-zinc-950 font-bold text-xs hover:bg-sky-400 cursor-pointer"
                  >
                    📸 Take Screenshot &amp; Save Mechanic Note ({capturedScreenshots.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyVideoMechanicInGame}
                    className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                  >
                    ⚡ Recreate This Mechanic in 3D Workbench Now
                  </button>
                </div>

                {capturedScreenshots.length > 0 && (
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2 space-y-1 max-h-36 overflow-y-auto">
                    <div className="text-[10px] text-sky-400 font-bold uppercase">
                      Captured Mechanic Screenshots ({capturedScreenshots.length}):
                    </div>
                    {capturedScreenshots.map((sc) => (
                      <div
                        key={sc.id}
                        className="text-[10px] bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                      >
                        <strong className="text-amber-300">{sc.title}:</strong>{' '}
                        {sc.extractedPhysicsRule}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 flex flex-col gap-2">
                <div className="text-[10px] text-purple-400 font-bold uppercase">
                  Timestamped Video Transcript &amp; Extracted Real-Physics Rules:
                </div>
                {activeVideo.timestamps.map((seg, idx) => {
                  const isSel = idx === selectedVideoSegmentIdx;
                  return (
                    <div
                      key={seg.timeSec}
                      onClick={() => setSelectedVideoSegmentIdx(idx)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-purple-500/20 border-purple-400 text-zinc-100'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                        <span>
                          ⏱ {seg.timestampFormatted} · {seg.mechanicalEventTitle}
                        </span>
                        <span>Click to Sync Video Frame</span>
                      </div>
                      <p className="text-xs text-zinc-100 mt-1">
                        {seg.transcribedNarrationAndPhysics}
                      </p>
                      <div className="mt-1.5 text-[10px] text-emerald-300 bg-zinc-950/80 border border-emerald-500/30 rounded p-1.5">
                        <strong>Extracted Physics &amp; CAD Parameters:</strong> Valve Lift{' '}
                        {seg.extractedParameters.valveLiftMm}mm · Dwell{' '}
                        {seg.extractedParameters.dwellTimeMs}ms · Port Ø
                        {seg.extractedParameters.transferPortDiaMm}mm · Squeeze{' '}
                        {seg.extractedParameters.sealSqueezePct}% · Peak{' '}
                        {seg.extractedParameters.peakBreechBar} Bar
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          9. AGENT COMPONENT TASKER (.STL GENERATOR + WORKING / NEEDS-FIX REMINDER LOG)
         ==================================================================== */}
      {showAgentComponentTaskerModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/94 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-950 border border-emerald-500/80 rounded-xl max-w-[1280px] w-full max-h-[90vh] flex flex-col shadow-2xl font-mono overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/85">
              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                  AUTONOMOUS CAD AGENT COMPONENT TASKER · .STL GENERATOR &amp; WORKING / NEEDS-FIX REMINDER LOG
                </div>
                <h3 className="text-sm md:text-base font-bold text-zinc-100">
                  Task an Agent to Build Any Component, Generate Watertight .STL &amp; Track Verification Reminders
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentComponentTaskerModal(false)}
                className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
              >
                Close Tasker [ESC]
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Task Creation Form */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-6">
                  <label className="block text-[10px] text-emerald-400 font-bold uppercase mb-1">
                    Component Name &amp; Spec for Agent to CAD + Generate .STL:
                  </label>
                  <input
                    type="text"
                    value={newAgentTaskTitle}
                    onChange={(e) => setNewAgentTaskTitle(e.target.value)}
                    placeholder="e.g., Ascent .45 140cc Over-Barrel Plenum & 300-Bar Check Valve..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] text-sky-400 font-bold uppercase mb-1">
                    Assign Specialist Agent:
                  </label>
                  <select
                    value={newAgentTaskAgentName}
                    onChange={(e) => setNewAgentTaskAgentName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100"
                  >
                    <option value="Agent-01 (300-Bar Pressure Vessel Boss)">
                      Agent-01 (300-Bar Pressure Vessel Boss)
                    </option>
                    <option value="Agent-02 (Kinematics & O-Ring Seal Boss)">
                      Agent-02 (Kinematics &amp; O-Ring Seal Boss)
                    </option>
                    <option value="Agent-03 (CFD Supersonic Port & Plenum Boss)">
                      Agent-03 (CFD Supersonic Port &amp; Plenum Boss)
                    </option>
                    <option value="Agent-04 (Watertight Manifold .STL Boss)">
                      Agent-04 (Watertight Manifold .STL Boss)
                    </option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleTaskAgentMakeComponentStl}
                    className="w-full py-1.5 px-3 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                  >
                    ⚡ Task Agent: Build .STL &amp; Reminder
                  </button>
                </div>
              </div>

              {/* Component Reminders List */}
              <div className="space-y-2">
                {agentComponentReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            rem.status === 'WORKING'
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-amber-500/20 border-amber-400 text-amber-300'
                          }`}
                        >
                          {rem.status === 'WORKING'
                            ? '✓ WORKING (VERIFIED)'
                            : '⚠ NEEDS SEAL / TOLERANCE CHECK'}
                        </span>
                        <span className="text-xs font-bold text-zinc-100">
                          [{rem.partCode}] {rem.partName}
                        </span>
                        <span className="text-[10px] text-sky-400">
                          [{rem.assignedAgentName}]
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-300">{rem.reminderNote}</div>
                      <div className="text-[10px] text-zinc-400">
                        Sub-mm Spec: <span className="text-amber-300">{rem.subMmDimensionsSummary}</span> · Watertight Mesh:{' '}
                        <span className="text-sky-300">{rem.generatedStlFacetCount} facets</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleReminderWorkingStatus(rem.id)}
                        className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-[10px] cursor-pointer"
                      >
                        Toggle Working / Needs Fix
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadAgentComponentStl(rem)}
                        className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                      >
                        ⬇ Download .STL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          9. SPECIALIZED LOCAL OLLAMA STUDIO & 25 SMART GOALS ROADMAP MODAL
         ==================================================================== */}
      <OllamaStudioAndRoadmapModal
        isOpen={showOllamaModal}
        onClose={() => setShowOllamaModal(false)}
        initialTab={ollamaModalInitialTab}
        activeWeaponFamilyId={effectiveFamilyCtx.familyId}
        activeCaliberMm={customCaliberMm}
        onEquipSynthesizedPartInGame={(part) => {
          handleSelectFamily(part.weaponFamilyId, undefined, part.targetCaliberMm);
        }}
      />
    </div>
  );
};
