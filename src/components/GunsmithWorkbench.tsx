import React, { useEffect, useState } from 'react';
import {
  WeaponBuildLoadout,
  PNEUMATIC_PARTS_CATALOG,
  PneumaticComponentSpec,
} from '../game/partsCatalog';
import {
  FourZonePneumaticState,
  SUPPORTED_CAD_CALIBERS,
} from '../wasm/pneumaticWasm';
import {
  POPULAR_25_AIRGUNS,
  CONNECTOR_PORT_SPECS,
  DISCHARGE_ARCHITECTURE_SPECS,
  DischargeMechanismType,
  SavedWeaponVersion,
  SurvivorPrintInventory,
  PhysicsSimulationResult,
  generatePrintableStlString,
  PrintableCadSubsystemType,
} from '../game/popular25Catalog';
import { Weapon3DFamilyContext } from '../game/weapon3d';
import {
  ASCENT_45_300BAR_12_PARTS_CATALOG,
  Ascent45PartSpec,
} from '../game/weaponFamiliesAndCompatibility';
import {
  SubMillimeterPartAndOringSpec,
  SynthesizedUniqueSubComponentAsset,
  synthesizeUniqueBenchmarkComponentAsset,
} from '../game/interactiveModelBenchmarks';
import {
  HighMagPartAndAirflowInspector,
  Workbench3DCameraPresetId,
  WorkbenchViewLayoutMode,
} from './HighMagPartAndAirflowInspector';
import {
  CANONICAL_7_WEAPONS_PROGRESSION,
  CanonicalWeaponBlueprintSpec,
  resolveCanonicalWeaponFromContext,
  P50_EXTREME_ENVIRONMENTS,
  P50_HERMETIC_6PHASE_CYCLE_STAGES,
  P50_SCREW_ON_BARREL_OPTIONS,
  LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS,
} from '../game/canonicalProgressionAndBlueprints';
import {
  Isolated3DFocusPartId,
  InspectableSubComponentSpec,
  getSubComponentsForIsolatedPart,
  getElonRoadmapForGun,
} from '../game/elonReverseEngineeringRoadmaps';
import { WeaponCustomBlueprintAndOringStudio } from './WeaponCustomBlueprintAndOringStudio';
import { GameDevAndMarketingRoadmapView } from './GameDevAndMarketingRoadmapView';
import { ElonAlgoVersionState } from '../game/hermesVertexOrchestratorAndElonAlgo';
import {
  getWeaponUnique5StepAirflowProfile,
  computePartMaterialMassAndCollisionSpec,
  ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS,
  runAgentPartResearchAndUpgrade,
  AgentPartResearchUpgradeResult,
  parseStlContentToMeshSummary,
  ImportedStlMeshTelemetry,
  filterCuratedExternal3DStlParts,
  External3DPartSearchResult,
} from '../game/workbenchElonPhysicsAndStlEngine';
import {
  Floating3DPartRadialMenu,
  RadialQuickMenuActionNode,
} from './Floating3DPartRadialMenu';
import {
  generateComplete9WeaponStlDirectoryManifest,
  generateSingleStlPayloadByHierarchy,
  CompleteStlDirectoryManifest,
  LESHIY2_MULTI_AGENT_REVERSE_ENGINEERING_DOSSIER,
} from '../game/hierarchicalStlDirectoryGenerator';
import {
  getPerWeapon3DFocusCategories,
  generateAndRunAllPerGunImplementationPlans,
  PerGunAutomatedImplementationPlan,
} from '../game/perGunAgentImplementationPlanEngine';

export type WorkbenchPrimaryView =
  | '3D_FOCUS_STAGE'
  | 'CUSTOM_BLUEPRINT_AND_ORINGS'
  | 'FIVE_STEP_AIRFLOW_CUTAWAY'
  | 'STL_HUB_AND_EXTERNAL_SEARCH'
  | 'MODULAR_PARTS_AND_HYBRID'
  | 'GAME_DEVELOPMENT_ROADMAP';

interface GunsmithWorkbenchProps {
  loadout: WeaponBuildLoadout;
  pneumaticState: FourZonePneumaticState;
  explodedAmount: number;
  componentExplodeAmount?: number;
  onSetComponentExploded?: (val: number) => void;
  xrayGasMode: boolean;
  statusBanner: string;
  upperPlatformId: string;
  lowerPlatformId: string;
  dischargeType: DischargeMechanismType;
  customCaliberMm: number;
  weaponFamilyContext?: Weapon3DFamilyContext;
  onChangeWeaponFamilyContext?: (
    nextCtx: Weapon3DFamilyContext,
    customCalOverride?: number
  ) => void;
  savedVersions: SavedWeaponVersion[];
  activeVersionId: string;
  inventory: SurvivorPrintInventory;
  simResult: PhysicsSimulationResult;
  selectedHfModel: string;
  onUpdateLoadout: (next: WeaponBuildLoadout) => void;
  onSetExploded: (val: number) => void;
  onToggleXray: () => void;
  onBenchFire: () => void;
  onBenchToggleCamLock: () => void;
  onBenchPumpStroke: (dir: 'PULL' | 'PUSH') => void;
  onBenchRefill250Bar: () => void;
  onPumpAscentTo300Bar?: (mode: 'SINGLE_3STAGE_STROKE' | 'FULL_300BAR_PUMP_UP') => void;
  onChangeHybridPlatforms: (upperId: string, lowerId: string) => void;
  onChangeDischargeType: (dt: DischargeMechanismType) => void;
  onChangeCustomCaliber: (calMm: number) => void;
  onChangeHfModel: (model: string) => void;
  onPrintAdapterAndPart: () => void;
  onSaveNewVersion: (customLabel: string) => void;
  onSelectSavedVersion: (v: SavedWeaponVersion) => void;
  onOpenPhysicsRange: () => void;
  onDeployToArena: () => void;
  onBackToTitle: () => void;
  elonVersionState?: ElonAlgoVersionState;
  onRunElonVersionUpgrade?: () => void;
  onResolveHitlWebhook?: (
    approvalId: string,
    decision: 'APPROVED_WEBHOOK_RECEIVED' | 'REJECTED_BY_HUMAN'
  ) => void;
  onOpenHermesModal?: () => void;
}

export const GunsmithWorkbench: React.FC<GunsmithWorkbenchProps> = ({
  loadout,
  pneumaticState,
  explodedAmount,
  componentExplodeAmount: propComponentExplodeAmount,
  onSetComponentExploded,
  xrayGasMode,
  statusBanner,
  upperPlatformId,
  lowerPlatformId,
  dischargeType,
  customCaliberMm,
  weaponFamilyContext,
  onChangeWeaponFamilyContext,
  savedVersions,
  activeVersionId,
  inventory,
  simResult,
  onUpdateLoadout,
  onSetExploded,
  onToggleXray,
  onBenchFire,
  onBenchPumpStroke,
  onBenchRefill250Bar,
  onPumpAscentTo300Bar,
  onChangeHybridPlatforms,
  onChangeDischargeType,
  onChangeCustomCaliber,
  onPrintAdapterAndPart,
  onSaveNewVersion,
  onSelectSavedVersion,
  onOpenPhysicsRange,
  onDeployToArena,
  onBackToTitle,
  elonVersionState,
  onRunElonVersionUpgrade,
  onResolveHitlWebhook,
}) => {
  // Primary Workbench View controlled by the clean Elon bottom bar
  const [primaryView, setPrimaryView] =
    useState<WorkbenchPrimaryView>('3D_FOCUS_STAGE');
  const [cutawaySubLayout, setCutawaySubLayout] =
    useState<WorkbenchViewLayoutMode>('SPLIT_3D_AND_CUTAWAY');
  const [modularSubTab, setModularSubTab] = useState<
    'EIGHT_SLOT_NODES' | 'HYBRID_25_COMBINER'
  >('EIGHT_SLOT_NODES');
  const [cameraPreset, setCameraPreset] =
    useState<Workbench3DCameraPresetId>('FULL_SIDE_PROFILE');
  // Default to null so isolating a focus group keeps the assembly intact until exploded or a sub-part is clicked!
  const [selectedSubComponentIdx, setSelectedSubComponentIdx] = useState<number | null>(null);
  const [cameraZoom, setCameraZoom] = useState<number>(1.65);
  const [dragMode, setDragMode] = useState<'MOVE' | 'ORBIT' | 'ZOOM'>('MOVE');
  const [autoOrbit, setAutoOrbit] = useState<boolean>(false);
  const [activeCompressionStep, setActiveCompressionStep] = useState<number>(2);
  const [selectedAscentPartNumber, setSelectedAscentPartNumber] = useState<number>(9);
  const [createdUniquePartsByCode, setCreatedUniquePartsByCode] = useState<
    Record<string, SynthesizedUniqueSubComponentAsset>
  >({});
  const [newVersionLabel, setNewVersionLabel] = useState('Custom Tuned Rig');
  const [zenHideOverlays, setZenHideOverlays] = useState<boolean>(false);
  const [minimize3DFocusOptions, setMinimize3DFocusOptions] = useState<boolean>(false);
  const [minimizeBottomBlueprintStrip, setMinimizeBottomBlueprintStrip] =
    useState<boolean>(false);
  const [showPartRadialMenu, setShowPartRadialMenu] = useState<boolean>(false);
  const [collapseBottomDock, setCollapseBottomDock] = useState<boolean>(false);

  // Ascent 2-Stage Quattro Trigger & 4-Bar 300B Pump Mechanics Inspector state
  const [showAscentTriggerPumpDrawer, setShowAscentTriggerPumpDrawer] =
    useState<boolean>(false);
  const [selectedAscentMechIdx, setSelectedAscentMechIdx] = useState<number>(0);

  // Interactive Part Selection & Agent Custom-Prompt Learning Loop state
  const [selectedBlueprintPartIndex, setSelectedBlueprintPartIndex] = useState<number>(0);
  const [agentCustomPrompt, setAgentCustomPrompt] = useState<string>(
    'Optimize wall thickness for 300-Bar fatigue life, reduce mass with Ti-6Al-4V aerospace grade, and tighten O-ring gland squeeze.'
  );
  const [isAgentResearching, setIsAgentResearching] = useState<boolean>(false);
  const [agentUpgradesByPartCode, setAgentUpgradesByPartCode] = useState<
    Record<string, AgentPartResearchUpgradeResult>
  >({});

  // 3D .STL Export / Import & HuggingFace + Thingiverse External Search + P2P Swarm Sharing state
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

  interface P2PSharedModelItem {
    id: string;
    peerNodeId: string;
    peerCallsign: string;
    partCode: string;
    partTitle: string;
    weaponFamilyLabel: string;
    caliberMm: number;
    dimensionsMm: string;
    materialSpec: string;
    triangleCount: number;
    stlAsciiPreview: string;
    sharedAtIso: string;
    upvotes: number;
    verifiedBySwarmAgent: string;
  }

  const [p2pNodeId] = useState<string>(
    () => `peer-${Math.random().toString(36).slice(2, 8)}`
  );
  const [p2pConnectedPeers, setP2pConnectedPeers] = useState<number>(4);
  const [p2pSharedModels, setP2pSharedModels] = useState<P2PSharedModelItem[]>([]);
  const [p2pStatusBanner, setP2pStatusBanner] = useState<string>(
    'P2P CAD Mesh Swarm Online — Connected via WebSocket (/ws/p2p-models) & WebRTC/BroadcastChannel.'
  );
  const [isSharingP2p, setIsSharingP2p] = useState<boolean>(false);

  const [importedStlSummary, setImportedStlSummary] =
    useState<ImportedStlMeshTelemetry | null>(null);
  const [externalSearchQuery, setExternalSearchQuery] = useState<string>('');
  const [externalSourceFilter, setExternalSourceFilter] = useState<
    'ALL' | 'HUGGINGFACE_3D_HUB' | 'THINGIVERSE_API' | 'PRINTABLES_CAD_INDEX'
  >('ALL');
  const [liveApiExternalHits, setLiveApiExternalHits] = useState<
    External3DPartSearchResult[]
  >([]);
  const [isSearchingExternalApis, setIsSearchingExternalApis] = useState<boolean>(false);
  const [externalApiBanner, setExternalApiBanner] = useState<string>(
    'P2P Swarm + HuggingFace 3D Hub & Thingiverse CAD Index Ready — Share or mount verified 3D airgun parts.'
  );

  // 3-Tier Hierarchical .STL Directory (Weapon -> Component -> Sub-Component) & Leshiy 2 Agent Dossier state
  const [stlDirectoryManifest, setStlDirectoryManifest] =
    useState<CompleteStlDirectoryManifest>(() =>
      generateComplete9WeaponStlDirectoryManifest(false)
    );
  const [selectedDirWeaponIdx, setSelectedDirWeaponIdx] = useState<number>(3); // Default #04 EDgun Leshiy 2
  const [selectedDirComponentIdx, setSelectedDirComponentIdx] = useState<number>(1); // Default 01_otb_shroud_and_barrel
  const [isGeneratingDiskStlTree, setIsGeneratingDiskStlTree] = useState<boolean>(false);
  const [stlDiskStatusBanner, setStlDiskStatusBanner] = useState<string>(
    '✓ 3-Tier .STL Directory Ready (/game_references/stl_library/) — Inspect or download any Weapon, Component, or Sub-Component .STL.'
  );
  const [showLeshiy2AgentDossier, setShowLeshiy2AgentDossier] = useState<boolean>(true);

  // Automated Per-Gun Agent Implementation Plans (9/9 Guns Auto-Generated & Executed)
  const [agentPlanRunIteration, setAgentPlanRunIteration] = useState<number>(1);
  const [perGunAgentPlans, setPerGunAgentPlans] = useState<
    PerGunAutomatedImplementationPlan[]
  >(() => Object.values(generateAndRunAllPerGunImplementationPlans()));
  const [showPerGunAgentPlanDrawer, setShowPerGunAgentPlanDrawer] =
    useState<boolean>(false);

  const handleReRunAllPerGunAgentPlans = () => {
    const nextIter = agentPlanRunIteration + 1;
    setAgentPlanRunIteration(nextIter);
    setPerGunAgentPlans(Object.values(generateAndRunAllPerGunImplementationPlans()));
    setShowPerGunAgentPlanDrawer(true);
  };

  // Connect to P2P Model Sharing WebSocket (/ws/p2p-models), BroadcastChannel, and REST seed list
  useEffect(() => {
    let isMounted = true;
    fetch('/api/p2p/models')
      .then((r) => r.json())
      .then(
        (data: {
          connectedPeersCount?: number;
          models?: P2PSharedModelItem[];
        }) => {
          if (!isMounted) return;
          if (typeof data.connectedPeersCount === 'number') {
            setP2pConnectedPeers(data.connectedPeersCount);
          }
          if (Array.isArray(data.models)) {
            setP2pSharedModels(data.models);
          }
        }
      )
      .catch(() => {
        // Ignore offline error
      });

    let ws: WebSocket | null = null;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/ws/p2p-models`);
      ws.onmessage = (ev) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(String(ev.data)) as {
            type?: string;
            connectedPeersCount?: number;
            models?: P2PSharedModelItem[];
            model?: P2PSharedModelItem;
            modelId?: string;
            upvotes?: number;
          };
          if (typeof msg.connectedPeersCount === 'number') {
            setP2pConnectedPeers(msg.connectedPeersCount);
          }
          if (msg.type === 'p2p:init' && Array.isArray(msg.models)) {
            setP2pSharedModels(msg.models);
          } else if (msg.type === 'p2p:model_shared' && msg.model) {
            const shared = msg.model;
            setP2pSharedModels((prev) =>
              prev.some((m) => m.id === shared.id) ? prev : [shared, ...prev]
            );
            setP2pStatusBanner(
              `📡 P2P Live Broadcast: ${shared.peerCallsign} shared [${shared.partCode}] ${shared.partTitle}!`
            );
          } else if (
            msg.type === 'p2p:model_upvoted' &&
            msg.modelId &&
            typeof msg.upvotes === 'number'
          ) {
            setP2pSharedModels((prev) =>
              prev.map((m) =>
                m.id === msg.modelId ? { ...m, upvotes: msg.upvotes! } : m
              )
            );
          }
        } catch {
          // Ignore malformed packet
        }
      };
    } catch {
      // Fallback to BroadcastChannel
    }

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('bar250_p2p_cad_mesh');
      bc.onmessage = (ev) => {
        if (!isMounted) return;
        const data = ev.data as {
          type?: string;
          model?: P2PSharedModelItem;
        };
        if (data?.type === 'p2p:model_shared' && data.model) {
          const shared = data.model;
          setP2pSharedModels((prev) =>
            prev.some((m) => m.id === shared.id) ? prev : [shared, ...prev]
          );
        }
      };
    }

    return () => {
      isMounted = false;
      try {
        ws?.close();
      } catch {
        // Ignore
      }
      try {
        bc?.close();
      } catch {
        // Ignore
      }
    };
  }, []);

  const activeCanonicalGun = resolveCanonicalWeaponFromContext(
    weaponFamilyContext,
    activeVersionId
  );
  const activeElonRoadmap = getElonRoadmapForGun(activeCanonicalGun.progressionId);
  const activeWeaponAirflowProfile = getWeaponUnique5StepAirflowProfile(
    activeCanonicalGun.progressionId
  );
  const activeAirflowStepSpec =
    activeWeaponAirflowProfile.steps[activeCompressionStep] ||
    activeWeaponAirflowProfile.steps[2];

  const isolatedSubComponents = getSubComponentsForIsolatedPart(
    activeCanonicalGun.progressionId,
    cameraPreset as Isolated3DFocusPartId
  );
  const activeIsolatedSubComp =
    selectedSubComponentIdx !== null
      ? isolatedSubComponents[selectedSubComponentIdx] || isolatedSubComponents[0]
      : isolatedSubComponents[0];

  const activeBlueprintPart =
    activeCanonicalGun.uniqueParts[selectedBlueprintPartIndex] ||
    activeCanonicalGun.uniqueParts[0];

  const activeInspectableSubComp: InspectableSubComponentSpec =
    cameraPreset !== 'FULL_SIDE_PROFILE' && activeIsolatedSubComp
      ? activeIsolatedSubComp
      : {
          subIndex: 0,
          code: activeBlueprintPart.partCode,
          name: activeBlueprintPart.partName,
          dimensionsMm: activeBlueprintPart.dimensionsMm,
          toleranceMm: '±0.010mm',
          material: activeBlueprintPart.material,
          pressureBar: activeBlueprintPart.pressureZoneBar,
          engineeringFunction: activeBlueprintPart.roleDescription,
          assignedAgent: 'GD-Agent-Lead',
        };

  // Compute hyper-real material density, volume, mass, weight, inertia & collision clearance for the active part
  const inspectedPartSpec = computePartMaterialMassAndCollisionSpec(
    activeInspectableSubComp,
    (cameraPreset === 'FULL_SIDE_PROFILE'
      ? 'FOCUS_RECEIVER'
      : cameraPreset) as Isolated3DFocusPartId,
    selectedSubComponentIdx ?? 0
  );

  const activePartAgentUpgrade = agentUpgradesByPartCode[inspectedPartSpec.partCode];

  const upperPlat =
    POPULAR_25_AIRGUNS.find((p) => p.id === upperPlatformId) || POPULAR_25_AIRGUNS[0];
  const lowerPlat =
    POPULAR_25_AIRGUNS.find((p) => p.id === lowerPlatformId) || POPULAR_25_AIRGUNS[1];
  const portA = CONNECTOR_PORT_SPECS[upperPlat.upperConnectorPort];
  const portB = CONNECTOR_PORT_SPECS[lowerPlat.lowerConnectorPort];
  const dischargeSpec = DISCHARGE_ARCHITECTURE_SPECS[dischargeType];

  const getPartsForSlot = (slot: PneumaticComponentSpec['slot']) =>
    PNEUMATIC_PARTS_CATALOG.filter((p) => p.slot === slot);

  const dispatchWorkbenchCameraState = (
    nextPreset: Workbench3DCameraPresetId,
    nextZoom: number,
    nextOrbit: boolean,
    nextStep: number,
    extra?: {
      subComponentIdx?: number | null;
      nudgePanX?: number;
      nudgePanY?: number;
      nudgeZoom?: number;
      dragMode?: 'MOVE' | 'ORBIT' | 'ZOOM';
      resetToCenter?: boolean;
    }
  ) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('bar250-workbench-camera', {
        detail: {
          preset: nextPreset,
          zoom: nextZoom,
          autoOrbit: nextOrbit,
          compressionStep: nextStep,
          ...extra,
        },
      })
    );
  };

  // Listen for direct 3D canvas clicks on weapon parts
  useEffect(() => {
    const on3DPartClicked = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          groupKey?: Workbench3DCameraPresetId;
          subAssemblyId?: string;
          subAssemblyTitle?: string;
        }>
      ).detail;
      if (!detail) return;
      if (
        detail.groupKey &&
        detail.groupKey !== 'FULL_SIDE_PROFILE' &&
        cameraPreset === 'FULL_SIDE_PROFILE'
      ) {
        // Highlight matching blueprint part if we stay in full profile
        const foundBpIdx = activeCanonicalGun.uniqueParts.findIndex((p) =>
          detail.subAssemblyTitle
            ?.toLowerCase()
            .includes(p.partName.split(' ')[0].toLowerCase())
        );
        if (foundBpIdx >= 0) {
          setSelectedBlueprintPartIndex(foundBpIdx);
        }
      }
    };
    window.addEventListener('bar250-3d-part-clicked', on3DPartClicked);
    return () => window.removeEventListener('bar250-3d-part-clicked', on3DPartClicked);
  }, [activeCanonicalGun.uniqueParts, cameraPreset]);

  const handleResetObjectToMiddle = () => {
    setCameraPreset('FULL_SIDE_PROFILE');
    setSelectedSubComponentIdx(null);
    setCameraZoom(1.65);
    setAutoOrbit(false);
    onSetExploded(0);
    dispatchWorkbenchCameraState('FULL_SIDE_PROFILE', 1.65, false, activeCompressionStep, {
      subComponentIdx: null,
      resetToCenter: true,
    });
  };

  const handleSelectCameraPreset = (nextPreset: Workbench3DCameraPresetId) => {
    setCameraPreset(nextPreset);
    // Keep subComponentIdx null when first isolating a focus category so the assembly stays intact until a sub-component or Explode is clicked!
    setSelectedSubComponentIdx(null);
    const targetZoom = nextPreset === 'FULL_SIDE_PROFILE' ? 1.65 : 2.15;
    setCameraZoom(targetZoom);
    dispatchWorkbenchCameraState(
      nextPreset,
      targetZoom,
      autoOrbit,
      activeCompressionStep,
      { subComponentIdx: null }
    );
  };

  const handleSelectSubComponent = (idx: number | null) => {
    setSelectedSubComponentIdx(idx);
    dispatchWorkbenchCameraState(
      cameraPreset,
      cameraZoom,
      autoOrbit,
      activeCompressionStep,
      { subComponentIdx: idx }
    );
  };

  const handleEquipCanonicalGun = (gun: CanonicalWeaponBlueprintSpec) => {
    setCameraPreset('FULL_SIDE_PROFILE');
    setSelectedSubComponentIdx(null);
    setSelectedBlueprintPartIndex(0);
    dispatchWorkbenchCameraState('FULL_SIDE_PROFILE', 1.65, autoOrbit, activeCompressionStep, {
      subComponentIdx: null,
      resetToCenter: true,
    });
    const matchingSaved = savedVersions.find((v) => v.versionId === gun.versionId);
    if (matchingSaved) {
      onSelectSavedVersion(matchingSaved);
      return;
    }
    onChangeHybridPlatforms(gun.upperPlatformId, gun.lowerPlatformId);
    onChangeDischargeType(gun.dischargeType);
    onChangeCustomCaliber(gun.defaultCaliberMm);
    onChangeWeaponFamilyContext?.(
      {
        familyId: gun.familyId,
        burstStage: gun.burstStage,
        rexMode: gun.rexMode,
        p90AmmoType: 'SABOT_SLUG_45_BOATTAIL',
        p50Environment: 'SPACE_VACUUM_0BAR',
        p50CyclePhase: 0,
        p50AutoCycleLoop: true,
      },
      gun.defaultCaliberMm
    );
  };

  const handleExportStl = (overrideSubsystem?: PrintableCadSubsystemType) => {
    const subType = overrideSubsystem || 'OTB_COAXIAL_BARREL_SHROUD_ASSEMBLY';
    const stl = generatePrintableStlString({
      partName: `${activeCanonicalGun.progressionId}_${simResult.otbCadSpec.targetCaliberMm.toFixed(2)}mm`,
      upperPort: upperPlat.upperConnectorPort,
      lowerPort: lowerPlat.lowerConnectorPort,
      wallThicknessMm: loadout.custom3dPart.wallThicknessMm,
      subsystemType: subType,
      otbCadSpec: simResult.otbCadSpec,
    });
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([stl], { type: 'model/stl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bar250_${activeCanonicalGun.progressionId.toLowerCase()}_${simResult.otbCadSpec.targetCaliberMm.toFixed(2)}mm.stl`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Export live Three.js 3D Weapon or Isolated 3D Focus Assembly to watertight .STL
  const handleExportLive3DSceneToStl = (
    scope: 'FULL_WEAPON' | 'ISOLATED_FOCUS_GROUP'
  ) => {
    if (typeof window === 'undefined') return;
    const focusSuffix =
      scope === 'ISOLATED_FOCUS_GROUP' && cameraPreset !== 'FULL_SIDE_PROFILE'
        ? `_${cameraPreset.toLowerCase()}`
        : '_full_3d_assembly';
    const solidName = `${activeCanonicalGun.progressionId}${focusSuffix}`;
    window.dispatchEvent(
      new CustomEvent('bar250-export-live-3d-stl', {
        detail: {
          scope,
          solidName,
          fileName: `bar250_${solidName.toLowerCase()}.stl`,
        },
      })
    );
  };

  const handleDownloadHierarchicalStl = (params: {
    canonicalIndex: number;
    componentIndex?: number;
    subComponentIndex?: number;
  }) => {
    const payload = generateSingleStlPayloadByHierarchy(params);
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([payload.stlContent], { type: 'model/stl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = payload.fileName;
      a.click();
      URL.revokeObjectURL(url);
      setStlDiskStatusBanner(
        `⬇ Downloaded ${payload.fileName} (${payload.triangleCount} Triangles · ${payload.dimensionsMm.lengthMm}×${payload.dimensionsMm.widthMm}×${payload.dimensionsMm.heightMm}mm)`
      );
    }
  };

  const handleGenerateAllDiskStlFiles = async (targetWeaponIdx?: number) => {
    setIsGeneratingDiskStlTree(true);
    try {
      const resp = await fetch('/api/stl-directory/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          typeof targetWeaponIdx === 'number'
            ? { canonicalIndex: targetWeaponIdx }
            : {}
        ),
      });
      if (resp.ok) {
        const data = (await resp.json()) as {
          filesWrittenToDisk?: number;
          rootDirectoryPath?: string;
          manifest?: CompleteStlDirectoryManifest;
        };
        if (data.manifest) {
          setStlDirectoryManifest(data.manifest);
        }
        setStlDiskStatusBanner(
          `✓ Wrote ${data.filesWrittenToDisk ?? stlDirectoryManifest.totalStlFilesGenerated} watertight .STL files to ${data.rootDirectoryPath || '/game_references/stl_library'} (Weapons, Components & Sub-Components)!`
        );
      }
    } catch {
      const refreshed = generateComplete9WeaponStlDirectoryManifest(false);
      setStlDirectoryManifest(refreshed);
      setStlDiskStatusBanner(
        `✓ Generated ${refreshed.totalStlFilesGenerated} watertight .STL files across 9 Weapons, ${refreshed.totalComponentFolders} Components & ${refreshed.totalSubComponentStlFiles} Sub-Components!`
      );
    } finally {
      setIsGeneratingDiskStlTree(false);
    }
  };

  const handleIsolateAndExplodeDirectoryItemIn3D = (params: {
    canonicalIndex: number;
    focusTarget?: Workbench3DCameraPresetId;
    subComponentIndex?: number | null;
    explodeSubComponents?: boolean;
  }) => {
    const targetGun =
      CANONICAL_7_WEAPONS_PROGRESSION[params.canonicalIndex] ??
      CANONICAL_7_WEAPONS_PROGRESSION[0];
    if (targetGun && targetGun.progressionId !== activeCanonicalGun.progressionId) {
      handleEquipCanonicalGun(targetGun);
    }
    const nextPreset = params.focusTarget || 'FULL_SIDE_PROFILE';
    setCameraPreset(nextPreset);
    const nextSubIdx =
      params.subComponentIndex !== undefined ? params.subComponentIndex : null;
    setSelectedSubComponentIdx(nextSubIdx);
    const targetZoom = nextPreset === 'FULL_SIDE_PROFILE' ? 1.65 : 2.25;
    setCameraZoom(targetZoom);
    if (params.explodeSubComponents) {
      handleSetComponentExploded(0.82);
    }
    dispatchWorkbenchCameraState(
      nextPreset,
      targetZoom,
      autoOrbit,
      activeCompressionStep,
      { subComponentIdx: nextSubIdx }
    );
    setPrimaryView('3D_FOCUS_STAGE');
  };

  // Task an Engineering Agent with a custom prompt to research the selected part, upgrade its game specs, and synthesize/mount its custom .STL
  const handleTaskAgentResearchSelectedPart = async () => {
    setIsAgentResearching(true);
    try {
      const baseUpgrade = runAgentPartResearchAndUpgrade({
        subComp: activeInspectableSubComp,
        focusCategory: (cameraPreset === 'FULL_SIDE_PROFILE'
          ? 'FOCUS_RECEIVER'
          : cameraPreset) as Isolated3DFocusPartId,
        gunTitle: activeCanonicalGun.fullTitle,
        customPrompt: agentCustomPrompt,
      });

      // Optionally enrich with backend Agent research endpoint (with graceful fallback)
      try {
        const resp = await fetch('/api/dcc/agent-part-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weaponTitle: activeCanonicalGun.fullTitle,
            partCode: inspectedPartSpec.partCode,
            partName: inspectedPartSpec.partName,
            currentMaterial: inspectedPartSpec.materialSpec.displayName,
            currentDimensionsMm: activeInspectableSubComp.dimensionsMm,
            operatingPressureBar: activeInspectableSubComp.pressureBar,
            userResearchPrompt: agentCustomPrompt,
          }),
        });
        if (resp.ok) {
          const data = (await resp.json()) as {
            ok?: boolean;
            research?: {
              learnedEngineeringSummary?: string;
              upgradedMaterialSpec?: string;
            };
          };
          if (data?.research?.learnedEngineeringSummary) {
            baseUpgrade.learnedEngineeringInsight = data.research.learnedEngineeringSummary;
          }
          if (data?.research?.upgradedMaterialSpec) {
            baseUpgrade.updatedMaterialSpec = data.research.upgradedMaterialSpec;
          }
        }
      } catch {
        // Deterministic local physics synthesis already computed in baseUpgrade
      }

      setAgentUpgradesByPartCode((prev) => ({
        ...prev,
        [inspectedPartSpec.partCode]: baseUpgrade,
      }));

      // Parse the newly synthesized watertight .STL and mount it on the live 3D weapon
      const parsed = parseStlContentToMeshSummary(
        baseUpgrade.watertightStlAscii,
        baseUpgrade.stlFileName,
        inspectedPartSpec.materialSpec.materialId
      );
      setImportedStlSummary(parsed);
      if (typeof window !== 'undefined' && parsed.positionsFloat32.length > 0) {
        window.dispatchEvent(
          new CustomEvent('bar250-mount-custom-stl', {
            detail: {
              positionsFloat32: parsed.positionsFloat32,
              partTitle: `${baseUpgrade.partCode} (${baseUpgrade.updatedMaterialSpec})`,
              colorHex: 0x38bdf8,
            },
          })
        );
      }
    } finally {
      setIsAgentResearching(false);
    }
  };

  // Import any user .STL file (ASCII or Binary) into the game & mount onto the live 3D weapon
  const handleImportStlFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const summary = parseStlContentToMeshSummary(
      buffer,
      file.name,
      inspectedPartSpec.materialSpec.materialId
    );
    setImportedStlSummary(summary);
    if (typeof window !== 'undefined' && summary.positionsFloat32.length > 0) {
      window.dispatchEvent(
        new CustomEvent('bar250-mount-custom-stl', {
          detail: {
            positionsFloat32: summary.positionsFloat32,
            partTitle: summary.fileName,
            colorHex: 0x10b981,
          },
        })
      );
    }
  };

  // Query live HuggingFace Hub & Thingiverse APIs via /api/stl-search
  const handleQueryExternal3DRepositories = async () => {
    setIsSearchingExternalApis(true);
    try {
      const q = encodeURIComponent(externalSearchQuery.trim() || 'pcp airgun stl');
      const src = encodeURIComponent(externalSourceFilter);
      const res = await fetch(`/api/stl-search?q=${q}&source=${src}`);
      if (res.ok) {
        const json = (await res.json()) as {
          ok?: boolean;
          liveResults?: Array<{
            id: string;
            source: 'HUGGINGFACE_3D_HUB' | 'THINGIVERSE_API' | 'PRINTABLES_CAD_INDEX';
            title: string;
            author: string;
            license: string;
            downloads: number;
            likes: number;
            externalUrl: string;
            description: string;
          }>;
        };
        if (Array.isArray(json.liveResults) && json.liveResults.length > 0) {
          const mapped: External3DPartSearchResult[] = json.liveResults.map((r, i) => ({
            id: r.id || `live-hit-${i}`,
            sourcePlatform: r.source || 'HUGGINGFACE_3D_HUB',
            repositoryOrThingId: r.id || `hf-live-${i}`,
            title: r.title,
            author: r.author,
            targetWeaponCompatibility: activeCanonicalGun.shortTitle,
            targetFocusSlot: 'FOCUS_RECEIVER',
            dimensionsMm: { lengthMm: 115, outerDiameterMm: 34, innerDiameterMm: 11.43 },
            recommendedMaterialId: 'AL_7075_T6',
            downloadsCount: r.downloads || 120,
            likesCount: r.likes || 24,
            license: r.license || 'CC-BY-4.0',
            externalUrl: r.externalUrl,
            agentVerificationBadge: 'Agent-09 Live External 3D Index Match',
            description: r.description,
          }));
          setLiveApiExternalHits(mapped);
          setExternalApiBanner(
            `Found ${mapped.length} live external repository matches + curated agent-verified 3D CAD assets.`
          );
        } else {
          setExternalApiBanner(
            'Displayed curated HuggingFace 3D Hub, Thingiverse & Printables agent-verified CAD parts.'
          );
        }
      }
    } catch {
      setExternalApiBanner(
        'Offline/Local Mode: Showing curated HuggingFace 3D Hub & Thingiverse agent-verified CAD parts.'
      );
    } finally {
      setIsSearchingExternalApis(false);
    }
  };

  const handleMountAndDownloadExternalHit = (hit: External3DPartSearchResult) => {
    const synthesized = runAgentPartResearchAndUpgrade({
      subComp: {
        subIndex: 0,
        code: hit.id.toUpperCase(),
        name: hit.title,
        dimensionsMm: `${hit.dimensionsMm.lengthMm}mm × Ø${hit.dimensionsMm.outerDiameterMm}mm × Ø${hit.dimensionsMm.innerDiameterMm}mm`,
        toleranceMm: '±0.005mm',
        material: hit.recommendedMaterialId,
        pressureBar: activeCanonicalGun.operatingPressureBar,
        engineeringFunction: hit.description,
        assignedAgent: hit.agentVerificationBadge.split('·')[0].trim(),
      },
      focusCategory: hit.targetFocusSlot,
      gunTitle: activeCanonicalGun.fullTitle,
      customPrompt: `Synthesize and adapt ${hit.title} (${hit.sourcePlatform}) for ${activeCanonicalGun.fullTitle}: ${hit.description}`,
    });
    const parsed = parseStlContentToMeshSummary(
      synthesized.watertightStlAscii,
      synthesized.stlFileName,
      hit.recommendedMaterialId
    );
    setImportedStlSummary(parsed);
    if (typeof window !== 'undefined' && parsed.positionsFloat32.length > 0) {
      window.dispatchEvent(
        new CustomEvent('bar250-mount-custom-stl', {
          detail: {
            positionsFloat32: parsed.positionsFloat32,
            partTitle: `${hit.title} (${hit.sourcePlatform})`,
            colorHex: 0xf59e0b,
          },
        })
      );
    }
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
        toleranceMm: '±0.005mm',
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
      activeCanonicalGun.fullTitle
    );
    setCreatedUniquePartsByCode((prev) => ({
      ...prev,
      [part.partCode]: built,
    }));
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

  const currentCtx: Weapon3DFamilyContext = weaponFamilyContext || {
    familyId: activeCanonicalGun.familyId,
    burstStage: activeCanonicalGun.burstStage,
    rexMode: activeCanonicalGun.rexMode,
  };

  const activeWeaponFocusConfig = getPerWeapon3DFocusCategories(
    activeCanonicalGun.progressionId,
    currentCtx
  );
  const activeGunAgentPlan =
    perGunAgentPlans.find((p) => p.gunId === activeCanonicalGun.progressionId) ||
    perGunAgentPlans[0];

  // Auto-reset cameraPreset if switching to a gun that doesn't have the previously selected focus category
  useEffect(() => {
    const validIds = new Set(activeWeaponFocusConfig.categories.map((c) => c.id));
    if (!validIds.has(cameraPreset as Isolated3DFocusPartId)) {
      setCameraPreset('FULL_SIDE_PROFILE');
      setSelectedSubComponentIdx(null);
      dispatchWorkbenchCameraState(
        'FULL_SIDE_PROFILE',
        1.65,
        autoOrbit,
        activeCompressionStep,
        { subComponentIdx: null, resetToCenter: true }
      );
    }
  }, [activeCanonicalGun.progressionId, activeWeaponFocusConfig.categories, cameraPreset]);

  const curatedExternalHits = filterCuratedExternal3DStlParts(
    externalSearchQuery,
    externalSourceFilter
  );
  const combinedExternalHits = [...liveApiExternalHits, ...curatedExternalHits];

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-2.5 gap-2">
      {/* ====================================================================
          1. ELON FIRST-PRINCIPLES WORKBENCH COMMAND DECK
             Weapon Progression Selector + 10 Non-Overlapping 3D Focus Groups +
             Universal Per-Weapon 5-Step Airflow Bar
         ==================================================================== */}
      <header className="pointer-events-auto flex flex-col gap-1.5 bg-zinc-950/94 border border-zinc-800 px-3.5 py-2 rounded-lg max-w-[1440px] w-full mx-auto shadow-xl shrink-0">
        {/* Top Row: Active Weapon Progression (1–8) + Clean Action Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="text-[10px] text-amber-400 font-mono uppercase tracking-wider truncate">
                ELON WORKBENCH v4.0 · TIER {activeCanonicalGun.tierOrder}/{CANONICAL_7_WEAPONS_PROGRESSION.length} · {activeCanonicalGun.imperialCaliberLabel} · {simResult.predictedEnergyJoules}J · {activeCanonicalGun.uniqueParts.length} PARTS / {activeCanonicalGun.screwsAndFasteners.length} SCREWS / {activeCanonicalGun.oringPlacements.length} O-RINGS
              </div>
              <h2 className="text-sm md:text-base font-bold tracking-tight text-zinc-100 font-display truncate">
                {activeCanonicalGun.fullTitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <select
              aria-label="Weapon Progression Selector (1 to 8)"
              value={activeCanonicalGun.progressionId}
              onChange={(e) => {
                const found = CANONICAL_7_WEAPONS_PROGRESSION.find(
                  (g) => g.progressionId === e.target.value
                );
                if (found) handleEquipCanonicalGun(found);
              }}
              className="bg-zinc-900 border border-amber-500/60 rounded px-2.5 py-1 text-xs font-mono text-amber-200 font-semibold cursor-pointer"
            >
              {CANONICAL_7_WEAPONS_PROGRESSION.map((gun) => (
                <option key={gun.progressionId} value={gun.progressionId}>
                  {gun.shortTitle} ({gun.muzzleEnergyJoules}J)
                </option>
              ))}
            </select>

            <button
              type="button"
              data-testid="toggle-3d-part-radial-menu"
              onClick={() => setShowPartRadialMenu((v) => !v)}
              className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showPartRadialMenu
                  ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                  : 'bg-zinc-900 border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-zinc-950'
              }`}
            >
              🎯 {showPartRadialMenu ? 'Hide Radial Menu' : '3D Part Radial Menu'}
            </button>

            <button
              type="button"
              data-testid="toggle-per-gun-agent-plan-drawer"
              onClick={() => setShowPerGunAgentPlanDrawer((v) => !v)}
              title="Inspect or re-run the automated 5-Agent Implementation Plan for each of the 9 canonical airguns"
              className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showPerGunAgentPlanDrawer
                  ? 'bg-cyan-400 text-zinc-950 border-cyan-200 font-bold'
                  : 'bg-cyan-950/80 border-cyan-400/70 text-cyan-200 hover:bg-cyan-400 hover:text-zinc-950'
              }`}
            >
              🤖 Agent Plans ({perGunAgentPlans.length}/9 Executed)
            </button>

            <button
              type="button"
              data-testid="workbench-toggle-webxr-btn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('bar250-toggle-webxr'));
                }
              }}
              title="Toggle WebXR Spatial Mode (Immersive VR Headset, Passthrough AR, or 6DoF Spatial Dual-Controller Rig) [Shortcut: X]"
              className="px-2.5 py-1 text-xs font-semibold rounded bg-fuchsia-950/80 border border-fuchsia-400/80 text-fuchsia-200 hover:bg-fuchsia-400 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              🥽 WebXR [X]
            </button>

            <button
              type="button"
              data-testid="toggle-3d-focus-options"
              onClick={() => setMinimize3DFocusOptions((v) => !v)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-zinc-900 border border-sky-500/60 text-sky-300 hover:bg-sky-500 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {minimize3DFocusOptions ? '▸ Expand 3D Focus' : '▾ Min 3D Focus'}
            </button>

            <button
              type="button"
              onClick={() => handleExportLive3DSceneToStl('FULL_WEAPON')}
              title="Export the entire live 3D weapon scene graph into a watertight .STL file"
              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/20 border border-emerald-400 text-emerald-200 hover:bg-emerald-500 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ⬇ Export 3D .STL
            </button>

            <button
              type="button"
              data-testid="open-stl-directory-tree-btn"
              onClick={() => {
                setZenHideOverlays(false);
                setSelectedDirWeaponIdx(
                  Math.max(
                    0,
                    CANONICAL_7_WEAPONS_PROGRESSION.findIndex(
                      (g) => g.progressionId === activeCanonicalGun.progressionId
                    )
                  )
                );
                setPrimaryView('STL_HUB_AND_EXTERNAL_SEARCH');
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/20 border border-purple-400 text-purple-200 hover:bg-purple-500 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              🗂️ .STL Directory Tree &amp; P2P Hub ({stlDirectoryManifest.totalStlFilesGenerated} .STLs)
            </button>

            <button
              type="button"
              onClick={() => {
                setZenHideOverlays(false);
                setPrimaryView('CUSTOM_BLUEPRINT_AND_ORINGS');
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              📐 Blueprint ({activeCanonicalGun.shortTitle.split(' ')[0]})
            </button>

            <button
              type="button"
              onClick={onOpenPhysicsRange}
              className="px-3 py-1 text-xs font-semibold rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Physics Range [T]
            </button>

            <button
              type="button"
              onClick={onBackToTitle}
              className="px-2.5 py-1 text-xs font-medium rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Title
            </button>

            <button
              type="button"
              data-start="true"
              onClick={onDeployToArena}
              className="px-3 py-1 text-xs font-bold rounded bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Deploy Raid
            </button>
          </div>
        </div>

        {/* Second Row: 3D FOCUS PART ISOLATION + NON-TOUCHING EXPLODE SLIDER + UNIVERSAL 5-STEP AIRFLOW */}
        {minimize3DFocusOptions ? (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">
                3D FOCUS MINIMIZED ({cameraPreset === 'FULL_SIDE_PROFILE' ? 'Full Weapon' : cameraPreset.replace('FOCUS_', '')})
              </span>
              <button
                type="button"
                onClick={handleResetObjectToMiddle}
                className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer"
              >
                🎯 Reset [0,0]
              </button>
              <button
                type="button"
                onClick={onToggleXray}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-sky-300 cursor-pointer"
              >
                {xrayGasMode ? 'X-Ray: ON' : 'X-Ray: OFF'}
              </button>
              <button
                type="button"
                onClick={() => onSetExploded(explodedAmount > 0.1 ? 0 : 0.72)}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 cursor-pointer"
              >
                {explodedAmount > 0.1 ? 'Assemble Weapon' : 'Weapon Explode'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSetComponentExploded(componentExplodeAmount > 0.1 ? 0 : 0.75)
                }
                className="px-2 py-0.5 rounded bg-zinc-900 border border-fuchsia-500/70 text-fuchsia-300 cursor-pointer"
              >
                {componentExplodeAmount > 0.1
                  ? 'Assemble Component'
                  : '🔩 Component Explode'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMinimize3DFocusOptions(false)}
              className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 font-bold cursor-pointer"
            >
              ▴ Show All 3D Focus &amp; Explode Options
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80 text-[11px] font-mono">
              <div className="flex flex-wrap items-center gap-1">
                <span
                  className="text-sky-400 font-bold uppercase mr-1"
                  title={activeWeaponFocusConfig.gunShortTitle}
                >
                  3D FOCUS ({activeCanonicalGun.shortTitle.split(' ')[0]} · {activeWeaponFocusConfig.categories.length} VERIFIED GROUPS):
                </span>
                <button
                  type="button"
                  onClick={handleResetObjectToMiddle}
                  title="Reset 3D weapon position and show all parts in the middle of the screen (Shortcut: C or Double-Click)"
                  className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 border border-emerald-300 hover:bg-emerald-400 font-bold cursor-pointer whitespace-nowrap"
                >
                  🎯 Reset [0,0]
                </button>

                {activeWeaponFocusConfig.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    title={cat.description}
                    onClick={() =>
                      handleSelectCameraPreset(cat.id as Workbench3DCameraPresetId)
                    }
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      cameraPreset === cat.id
                        ? 'bg-sky-500 text-zinc-950 border-sky-300 font-bold shadow'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-sky-400'
                    }`}
                  >
                    {cat.shortLabel}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Mouse Drag Mode Selector */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 gap-0.5">
                  {(
                    [
                      { id: 'MOVE', label: '✋ Move' },
                      { id: 'ORBIT', label: '🔄 Orbit' },
                      { id: 'ZOOM', label: '🔍 Closer' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setDragMode(mode.id);
                        dispatchWorkbenchCameraState(
                          cameraPreset,
                          cameraZoom,
                          autoOrbit,
                          activeCompressionStep,
                          { dragMode: mode.id }
                        );
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer whitespace-nowrap ${
                        dragMode === mode.id
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Zoom Slider */}
                <div className="flex items-center gap-1 text-zinc-300">
                  <button
                    type="button"
                    title="Push Object Further Back"
                    onClick={() => {
                      const nextZ = Math.max(0.75, Number((cameraZoom - 0.25).toFixed(2)));
                      setCameraZoom(nextZ);
                      dispatchWorkbenchCameraState(
                        cameraPreset,
                        nextZ,
                        autoOrbit,
                        activeCompressionStep
                      );
                    }}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-amber-400 font-bold whitespace-nowrap">
                    {cameraZoom.toFixed(1)}x
                  </span>
                  <input
                    type="range"
                    aria-label="3D Macro Camera Zoom"
                    min={0.75}
                    max={3.5}
                    step={0.05}
                    value={cameraZoom}
                    onChange={(e) => {
                      const nextZ = parseFloat(e.target.value);
                      setCameraZoom(nextZ);
                      dispatchWorkbenchCameraState(
                        cameraPreset,
                        nextZ,
                        autoOrbit,
                        activeCompressionStep
                      );
                    }}
                    className="w-12 accent-amber-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Pull Object Closer Toward You"
                    onClick={() => {
                      const nextZ = Math.min(3.5, Number((cameraZoom + 0.25).toFixed(2)));
                      setCameraZoom(nextZ);
                      dispatchWorkbenchCameraState(
                        cameraPreset,
                        nextZ,
                        autoOrbit,
                        activeCompressionStep
                      );
                    }}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 hover:border-amber-400 font-bold cursor-pointer"
                  >
                    +Closer
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onToggleXray}
                  className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                    xrayGasMode
                      ? 'bg-sky-400 text-zinc-950 border-sky-200'
                      : 'bg-zinc-900 text-sky-300 border-zinc-700'
                  }`}
                >
                  {xrayGasMode ? 'X-Ray: ON' : 'X-Ray: OFF'}
                </button>

                {/* Weapon-Level Explode Button + Continuous Clearance Slider */}
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5">
                  <button
                    type="button"
                    data-testid="weapon-explode-toggle-btn"
                    onClick={() => onSetExploded(explodedAmount > 0.1 ? 0 : 0.72)}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer whitespace-nowrap text-[10px] ${
                      explodedAmount > 0.1
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-amber-300 hover:text-white'
                    }`}
                  >
                    {explodedAmount > 0.1 ? 'Assemble Weapon' : 'Weapon Explode'}
                  </button>
                  <input
                    type="range"
                    aria-label="Weapon-Level Explode Clearance"
                    min={0}
                    max={1}
                    step={0.05}
                    value={explodedAmount}
                    onChange={(e) => onSetExploded(parseFloat(e.target.value))}
                    className="w-11 accent-amber-400 cursor-pointer"
                    title="Weapon-Level Explode: separates major assemblies (0% to 100%)"
                  />
                </div>

                {/* Component-Level Micro-Explode Button + Slider (Separates internal sub-parts inside each component!) */}
                <div className="flex items-center gap-1 bg-zinc-900 border border-fuchsia-500/60 rounded px-1.5 py-0.5">
                  <button
                    type="button"
                    data-testid="component-explode-toggle-btn"
                    onClick={() =>
                      handleSetComponentExploded(
                        componentExplodeAmount > 0.1 ? 0 : 0.78
                      )
                    }
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer whitespace-nowrap text-[10px] ${
                      componentExplodeAmount > 0.1
                        ? 'bg-fuchsia-400 text-zinc-950'
                        : 'text-fuchsia-300 hover:text-white'
                    }`}
                  >
                    {componentExplodeAmount > 0.1
                      ? 'Assemble Sub-Parts'
                      : '🔩 Component Explode'}
                  </button>
                  <input
                    type="range"
                    aria-label="Component-Level Sub-Part Explode Clearance"
                    min={0}
                    max={1}
                    step={0.05}
                    value={componentExplodeAmount}
                    onChange={(e) =>
                      handleSetComponentExploded(parseFloat(e.target.value))
                    }
                    className="w-11 accent-fuchsia-400 cursor-pointer"
                    title="Component-Level Explode: separates internal baffles, O-rings, Belleville washers, pistons, and bolts inside each component (0% to 100%)"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !autoOrbit;
                    setAutoOrbit(next);
                    dispatchWorkbenchCameraState(
                      cameraPreset,
                      cameraZoom,
                      next,
                      activeCompressionStep
                    );
                  }}
                  className={`px-2 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
                    autoOrbit
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {autoOrbit ? 'Spin: ON' : 'Spin: OFF'}
                </button>
              </div>
            </div>

            {/* Per-Gun Automated Agent Implementation Plan Drawer & De-Hallucinated Focus Summary */}
            {showPerGunAgentPlanDrawer && activeGunAgentPlan && (
              <div
                data-testid="per-gun-agent-plan-drawer"
                className="flex flex-col gap-2 pt-2 pb-1.5 px-2.5 mt-1 rounded bg-cyan-950/35 border border-cyan-500/40 text-[10px] font-mono"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-zinc-950 font-bold">
                      {activeGunAgentPlan.planId} · RUN #{agentPlanRunIteration}
                    </span>
                    <span className="text-cyan-200 font-bold">
                      {activeGunAgentPlan.gunTitle} — 5/5 Agents Executed ({activeGunAgentPlan.hallucinationsRemovedCount} Hallucinations Removed)
                    </span>
                    {activeWeaponFocusConfig.prunedHallucinatedCategories.length > 0 && (
                      <span className="text-amber-300">
                        Pruned Non-Existent Tabs: [{activeWeaponFocusConfig.prunedHallucinatedCategories.join(', ')}]
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="rerun-all-per-gun-agent-plans-btn"
                      onClick={handleReRunAllPerGunAgentPlans}
                      className="px-2 py-0.5 rounded bg-emerald-400 text-zinc-950 font-bold hover:bg-emerald-300 cursor-pointer"
                    >
                      ⚡ Re-Run All 9 Gun Implementation Plans
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPerGunAgentPlanDrawer(false)}
                      className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5">
                  {activeGunAgentPlan.steps.map((step) => (
                    <div
                      key={step.stepIndex}
                      className="rounded bg-zinc-950/90 border border-cyan-500/30 p-1.5 flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-cyan-300 font-bold truncate">
                          #{step.stepIndex} {step.assignedAgent}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          DONE
                        </span>
                      </div>
                      <div className="text-zinc-200 font-semibold truncate">
                        {step.objectiveTitle}
                      </div>
                      <div className="text-zinc-400 text-[9px] leading-tight line-clamp-2">
                        {step.cadAndPhysicsAction}
                      </div>
                      <div className="text-emerald-400 text-[9px] font-bold mt-auto pt-0.5">
                        ✓ {step.verificationMetric}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Third Row: Dedicated Link to Virtual Physics Range (Air Physics & .25–.72 Cal Terminal Ballistics live exclusively in the Range) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80 text-[10px] font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-emerald-400 font-bold uppercase">
                  🔬 AIR RELEASE, MODERATOR BAFFLE EXPANSION &amp; .25/.30/.45/.50/.72 CALIBER LAB:
                </span>
                <span className="text-zinc-300">
                  Moved exclusively to the Virtual Physics Range for isolated container-to-moderator gas simulation &amp; DCC enemy terminal testing.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenPhysicsRange}
                className="px-2.5 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer hover:bg-emerald-400 whitespace-nowrap"
              >
                🎯 Open Air Physics &amp; .25–.72 Caliber Range [T]
              </button>
            </div>

            {/* Fourth Row: WEAPON-SPECIFIC MECHANICAL CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/70 text-[10px] font-mono">
              {/* #01 MONGO (.50 CAL BURST-DISK PEN GUN): SINGLE-ROUND BREECH RELOAD ANIMATION + SLUG/BUCKSHOT SHELL */}
              {activeCanonicalGun.progressionId === 'GUN_01_PEN' && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-amber-400 font-bold uppercase">
                      #01 MONGO (.50 BURST-DISK PEN GUN):
                    </span>
                    <button
                      type="button"
                      data-testid="mongo-single-round-reload-btn"
                      onClick={() => {
                        const nextPhase = (((currentCtx.singleRoundReloadPhase ?? 0) + 1) % 4) as
                          | 0
                          | 1
                          | 2
                          | 3;
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
                          singleRoundReloadPhase: nextPhase,
                        });
                      }}
                      className="px-2.5 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer whitespace-nowrap shadow"
                    >
                      🔄 Animate Single-Round Reload (Phase {currentCtx.singleRoundReloadPhase ?? 0}/3:{' '}
                      {(currentCtx.singleRoundReloadPhase ?? 0) === 0
                        ? 'Ready in Breech'
                        : (currentCtx.singleRoundReloadPhase ?? 0) === 1
                        ? '1. Unscrew M16×1.0 Rear Cap'
                        : (currentCtx.singleRoundReloadPhase ?? 0) === 2
                        ? '2. Insert Singular .50 Shell'
                        : '3. Thread & Torque Cap'}
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
                          burstShellPayload:
                            currentCtx.burstShellPayload === 'BUCKSHOT_8PELLET_50CAL'
                              ? 'SLUG_50CAL_335GR_HP'
                              : 'BUCKSHOT_8PELLET_50CAL',
                        })
                      }
                      className="px-2.5 py-0.5 rounded bg-zinc-900 border border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
                    >
                      Shell Payload:{' '}
                      {currentCtx.burstShellPayload === 'BUCKSHOT_8PELLET_50CAL'
                        ? '💥 8-Pellet Buckshot'
                        : '🎯 335gr .50 Slug'}
                    </button>
                  </div>
                </div>
              )}

              {/* #07 THE P50 (.50 CAL AUTO): PRESSURIZED MAG SAFETY INTERLOCK + SCREW-OFF BARREL SWAP + FORWARD REFILL FOREGRIP */}
              {activeCanonicalGun.progressionId === 'GUN_06_P50' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-amber-400 font-bold uppercase">
                        P50 SCREW-OFF BARREL SWAP (CALIBER + AIR VOLUME):
                      </span>
                      {P50_SCREW_ON_BARREL_OPTIONS.map((brl) => {
                        const isSelectedBrl =
                          (currentCtx.p50BarrelOptionId || 'BRL_50CAL_160CC') === brl.optionId;
                        return (
                          <button
                            key={brl.optionId}
                            type="button"
                            onClick={() => {
                              onChangeCustomCaliber(brl.caliberMm);
                              onChangeWeaponFamilyContext?.(
                                {
                                  ...currentCtx,
                                  familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
                                  p50BarrelOptionId: brl.optionId,
                                  p50BarrelUnscrewed: false,
                                },
                                brl.caliberMm
                              );
                            }}
                            className={`px-2 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
                              isSelectedBrl
                                ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            🔩 {brl.label}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        data-testid="p50-unscrew-barrel-btn"
                        onClick={() =>
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
                            p50BarrelUnscrewed: !currentCtx.p50BarrelUnscrewed,
                          })
                        }
                        className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                          currentCtx.p50BarrelUnscrewed
                            ? 'bg-rose-500 text-white border-rose-300'
                            : 'bg-zinc-900 text-sky-300 border-sky-500/60 hover:bg-sky-500 hover:text-zinc-950'
                        }`}
                      >
                        {currentCtx.p50BarrelUnscrewed
                          ? '🔩 Screw Barrel Into Receiver'
                          : '🔧 Unscrew Barrel (Inspect M24×1.5 Threads)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onBenchPumpStroke('PUSH');
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
                            p50ForegripPumpOffset:
                              (currentCtx.p50ForegripPumpOffset ?? 0) > 0.2 ? 0 : 1,
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
                      >
                        ⛽ Pump Forward Refill Foregrip (+Refill Barrel &amp; Gun)
                      </button>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-[9.5px]">
                      🔒 250B Pressurized Mag Interlock:{' '}
                      {(currentCtx.p50CyclePhase ?? 0) === 2 && !currentCtx.p50BarrelUnscrewed
                        ? 'ALIGNED IN BREECH (READY TO FIRE)'
                        : 'SAFETY LOCKED UNTIL ROTATED 90° INTO BREECH'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-amber-400 font-bold uppercase">P50 ENVIRONMENT:</span>
                      {P50_EXTREME_ENVIRONMENTS.map((env) => {
                        const isCurrentEnv =
                          (currentCtx.p50Environment || 'SPACE_VACUUM_0BAR') === env.id;
                        return (
                          <button
                            key={env.id}
                            type="button"
                            title={env.sealingAndCyclingAdaptation}
                            onClick={() =>
                              onChangeWeaponFamilyContext?.({
                                ...currentCtx,
                                familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
                                p50Environment: env.id,
                              })
                            }
                            className={`px-2 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
                              isCurrentEnv
                                ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            {env.shortBadge}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sky-400 font-bold uppercase">6-PHASE SLUG CYCLE:</span>
                      {P50_HERMETIC_6PHASE_CYCLE_STAGES.map((st) => {
                        const isCurrentPhase =
                          !currentCtx.p50AutoCycleLoop &&
                          (currentCtx.p50CyclePhase ?? 0) === st.phaseIndex;
                        return (
                          <button
                            key={st.phaseCode}
                            type="button"
                            title={`${st.shortTitle}: ${st.mechanicalAction}`}
                            onClick={() =>
                              onChangeWeaponFamilyContext?.({
                                ...currentCtx,
                                familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
                                p50CyclePhase: st.phaseIndex,
                                p50AutoCycleLoop: false,
                              })
                            }
                            className={`px-2 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
                              isCurrentPhase
                                ? 'bg-sky-500 text-zinc-950 border-sky-300 font-bold'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-sky-400'
                            }`}
                          >
                            {st.shortTitle}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() =>
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
                            p50AutoCycleLoop: !currentCtx.p50AutoCycleLoop,
                          })
                        }
                        className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                          currentCtx.p50AutoCycleLoop
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                            : 'bg-zinc-900 text-emerald-300 border-zinc-700'
                        }`}
                      >
                        {currentCtx.p50AutoCycleLoop ? '🔄 Auto-Cycle: ON' : '🔄 Auto-Cycle: OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* #09 THE PROTECTOR (.50 DUAL THREADED BARREL-RESERVE SCATTER GUN): COCK OPEN / LOAD / COCK UP / FIRE SELECTOR */}
              {activeCanonicalGun.progressionId === 'GUN_09_PROTECTOR' && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-amber-400 font-bold uppercase">
                      #09 THE PROTECTOR (2× 110CC THREADED BARREL RESERVES):
                    </span>
                    <button
                      type="button"
                      data-testid="protector-cock-open-btn"
                      onClick={() => {
                        const nextOpen = !currentCtx.protectorBreechOpen;
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY',
                          protectorBreechOpen: nextOpen,
                          singleRoundReloadPhase: nextOpen ? 2 : 0,
                        });
                      }}
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.protectorBreechOpen
                          ? 'bg-amber-500 text-zinc-950 border-amber-300'
                          : 'bg-zinc-900 text-amber-300 border-amber-500/60 hover:bg-amber-500 hover:text-zinc-950'
                      }`}
                    >
                      {currentCtx.protectorBreechOpen
                        ? '🔒 Cock Up & Lock Dual Breech (Ready to Fire)'
                        : '🔓 Cock Open 40° & Load 2× .50 Scatter Sabots'}
                    </button>

                    <span className="text-sky-400 font-bold uppercase ml-1">FIRE SELECTOR:</span>
                    {(
                      [
                        { id: 'BARREL_1_UPPER', label: '1. Upper Barrel Reserve (110cc)' },
                        { id: 'BARREL_2_LOWER', label: '2. Lower Barrel Reserve (110cc)' },
                        { id: 'DUAL_SALVO', label: '3. Dual Salvo (220cc Combined)' },
                      ] as const
                    ).map((sel) => {
                      const isSel =
                        (currentCtx.protectorFireSelector || 'BARREL_1_UPPER') === sel.id;
                      return (
                        <button
                          key={sel.id}
                          type="button"
                          onClick={() =>
                            onChangeWeaponFamilyContext?.({
                              ...currentCtx,
                              familyId: 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY',
                              protectorFireSelector: sel.id,
                            })
                          }
                          className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                            isSel
                              ? 'bg-rose-500 text-white border-rose-300'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-rose-400'
                          }`}
                        >
                          {sel.label}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-emerald-300 text-[9.5px] font-semibold">
                    ✓ Airflow: Barrel Annular Jacket → Rear 180° U-Turn Loop → Center Bore → Post-Muzzle 8-Pellet Scatter
                  </span>
                </div>
              )}

              {/* #04 LESHIY 2 & #05 THE LEAF (.45): FAST 180° FOLDING STOCK + QUICK-DETACH AIR CONTAINER */}
              {(activeCanonicalGun.progressionId === 'GUN_04_LESHIY' ||
                activeCanonicalGun.progressionId === 'GUN_04B_THE_LEAF_45') && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-amber-400 font-bold uppercase">
                      {activeCanonicalGun.progressionId === 'GUN_04_LESHIY'
                        ? 'LESHIY 2 STATE:'
                        : 'THE LEAF .45 STATE:'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          leshiyFolded: !currentCtx.leshiyFolded,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.leshiyFolded
                          ? 'bg-amber-500 text-zinc-950 border-amber-300'
                          : 'bg-zinc-900 text-amber-300 border-amber-500/60 hover:bg-amber-500 hover:text-zinc-950'
                      }`}
                    >
                      {currentCtx.leshiyFolded
                        ? '🔒 Unfold & Lock Stock (756mm Ready)'
                        : '🔀 Fast Fold Stock 180° (Open Breech · 457mm)'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          leshiyContainerDetached: !currentCtx.leshiyContainerDetached,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.leshiyContainerDetached
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                          : 'bg-zinc-900 text-emerald-300 border-emerald-500/60 hover:bg-emerald-500 hover:text-zinc-950'
                      }`}
                    >
                      {currentCtx.leshiyContainerDetached
                        ? '🔌 Re-Couple 300B Rear Container (QD Dry-Break)'
                        : '⚡ Quick-Detach Rear 300B Air Container (QD Bayonet)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZenHideOverlays(false);
                        setSelectedDirWeaponIdx(3);
                        setSelectedDirComponentIdx(1);
                        setShowLeshiy2AgentDossier(true);
                        setPrimaryView('STL_HUB_AND_EXTERNAL_SEARCH');
                      }}
                      className="px-2.5 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
                    >
                      🤖 Leshiy 2 Scout→CAD Agent Dossier &amp; .STL Tree
                    </button>
                  </div>
                  <span className="text-emerald-300">
                    ✓ Rebuilt by Scout→CAD Agents: Uncovered 350mm Alfa Precision Barrel · Open-Frame Valkyrie Carbon M-LOK · Tishina Cutaway Moderator
                  </span>
                </div>
              )}

              {/* #06 MP30: DUAL-CYLINDER 300CC REWORK + FAST FOLD + QD CONTAINERS + SIDE-LEVER */}
              {activeCanonicalGun.progressionId === 'GUN_05_MP30' && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-amber-400 font-bold uppercase">
                      #06 MP30 (.30 DUAL-CYLINDER 300CC):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
                          mp30StockFolded: !currentCtx.mp30StockFolded,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.mp30StockFolded
                          ? 'bg-amber-500 text-zinc-950 border-amber-300'
                          : 'bg-zinc-900 text-amber-300 border-amber-500/60 hover:bg-amber-500 hover:text-zinc-950'
                      }`}
                    >
                      {currentCtx.mp30StockFolded
                        ? '🔒 Extend M4 Buttstock (755mm)'
                        : '🔀 Fast Fold Side-Folding M4 Stock (520mm)'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
                          mp30ContainerDetached: !currentCtx.mp30ContainerDetached,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.mp30ContainerDetached
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                          : 'bg-zinc-900 text-emerald-300 border-emerald-500/60 hover:bg-emerald-500 hover:text-zinc-950'
                      }`}
                    >
                      {currentCtx.mp30ContainerDetached
                        ? '🔌 Re-Couple Dual 300cc Containers (M18×1.5 QD)'
                        : '⚡ Quick-Detach Dual 300cc Air Containers'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
                          mp30SideLeverCocked: !currentCtx.mp30SideLeverCocked,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.mp30SideLeverCocked
                          ? 'bg-sky-500 text-zinc-950 border-sky-300'
                          : 'bg-zinc-900 text-sky-300 border-sky-500/60 hover:bg-sky-500 hover:text-zinc-950'
                      }`}
                    >
                      {currentCtx.mp30SideLeverCocked
                        ? '🔒 Close Biathlon Side-Lever'
                        : '⚙️ Cock Biathlon Side-Lever (Index 12-Rd Drum)'}
                    </button>
                  </div>
                </div>
              )}

              {/* #03 DOUBLE BARREL DEFENDER: SINGLE-ROUND / TWIN-SHELL RELOAD ANIMATION + SLUG/BUCKSHOT/ARROW + HAMMER */}
              {activeCanonicalGun.progressionId === 'GUN_03_DEFENDER' && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-amber-400 font-bold uppercase">
                      #03 DOUBLE BARREL DEFENDER:
                    </span>
                    <button
                      type="button"
                      data-testid="defender-single-round-reload-btn"
                      onClick={() => {
                        const nextPhase = (((currentCtx.singleRoundReloadPhase ?? 0) + 1) % 4) as
                          | 0
                          | 1
                          | 2
                          | 3;
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
                          singleRoundReloadPhase: nextPhase,
                        });
                      }}
                      className="px-2.5 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer whitespace-nowrap shadow"
                    >
                      🔄 Animate Break-Action Shell Reload (Phase {currentCtx.singleRoundReloadPhase ?? 0}/3)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
                          defenderPayload: 'SLUG_50CAL_335GR_HP',
                          burstShellPayload: 'SLUG_50CAL_335GR_HP',
                        })
                      }
                      className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.defenderPayload === 'SLUG_50CAL_335GR_HP'
                          ? 'bg-sky-500 text-zinc-950 border-sky-300'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      🎯 .50 335gr Slug Shell
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
                          defenderPayload: 'BUCKSHOT_8PELLET_50CAL',
                          burstShellPayload: 'BUCKSHOT_8PELLET_50CAL',
                        })
                      }
                      className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        (currentCtx.defenderPayload || 'BUCKSHOT_8PELLET_50CAL') ===
                        'BUCKSHOT_8PELLET_50CAL'
                          ? 'bg-amber-500 text-zinc-950 border-amber-300'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      💥 .50 8-Pellet Buckshot Shell
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
                          defenderPayload: 'GIANT_CARBON_ARROW_375GR',
                        })
                      }
                      className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.defenderPayload === 'GIANT_CARBON_ARROW_375GR'
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      🏹 Carbon Arrow
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
                          defenderHammerCocked: !currentCtx.defenderHammerCocked,
                        })
                      }
                      className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.defenderHammerCocked
                          ? 'bg-rose-500 text-white border-rose-300'
                          : 'bg-zinc-900 text-rose-300 border-rose-500/60 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      {currentCtx.defenderHammerCocked
                        ? '🔨 Release Dual Striker Hammer'
                        : '⚙️ Cock Dual Alternating Hammer'}
                    </button>
                  </div>
                </div>
              )}

              {/* #02 REX-P & #02B PRINCESS DONUT FORK: SINGLE-ROUND BREECH RELOAD + TRIGGER-LOCK BARREL PULL (+38mm) & WATERTIGHT SEAL */}
              {activeCanonicalGun.progressionId === 'GUN_02_REXP' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-amber-400 font-bold uppercase">
                        {currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                          ? '👑 #02B PRINCESS DONUT (REX-P FORK · SLIDING BARREL + WATERTIGHT SEAL):'
                          : '#02 REX-P (.30 COAXIAL UNDERLEVER):'}
                      </span>
                      <button
                        type="button"
                        data-testid="rexp-single-round-reload-btn"
                        onClick={() => {
                          const nextPhase = (((currentCtx.singleRoundReloadPhase ?? 0) + 1) % 4) as
                            | 0
                            | 1
                            | 2
                            | 3;
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
                            rexLeverCocked: nextPhase === 1 || nextPhase === 2,
                            singleRoundReloadPhase: nextPhase,
                          });
                        }}
                        className="px-2.5 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer whitespace-nowrap shadow"
                      >
                        🔄 Animate {currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL' ? 'Trigger-Lock Barrel-Pull' : 'Single-Round Breech'} Reload (Phase {currentCtx.singleRoundReloadPhase ?? 0}/3:{' '}
                        {(currentCtx.singleRoundReloadPhase ?? 0) === 0
                          ? currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                            ? '0. Cam-Locked & Watertight Sealed (24.5% FFKM Squeeze)'
                            : 'Locked & Ready'
                          : (currentCtx.singleRoundReloadPhase ?? 0) === 1
                          ? currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                            ? '1. Trigger-Lock Pulls Barrel Forward +38.0mm'
                            : '1. Cock 5-Hole Underlever 42° & Rise Breech Slide #11'
                          : (currentCtx.singleRoundReloadPhase ?? 0) === 2
                          ? currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                            ? '2. Drop Round Directly Into Exposed Barrel Throat'
                            : '2. Thumb-Load Singular .30 Slug Into Bore'
                          : currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                          ? '3. 5.8:1 Cam Retracts Barrel -38mm & Watertight Seals Cone'
                          : '3. Close Lever & Seal Dual Breech O-Rings'}
                        )
                      </button>
                      <button
                        type="button"
                        data-testid="rexp-princess-donut-fork-btn"
                        onClick={() => {
                          const isDonut =
                            currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL';
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
                            rexMode: isDonut
                              ? 'REX_P_PISTOL_1SHOT'
                              : 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL',
                            singleRoundReloadPhase: isDonut ? 0 : 1,
                            rexLeverCocked: !isDonut,
                          });
                        }}
                        className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap transition-colors ${
                          currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                            ? 'bg-pink-500 text-zinc-950 border-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.45)]'
                            : 'bg-pink-950/70 text-pink-200 border-pink-500/60 hover:bg-pink-500 hover:text-zinc-950'
                        }`}
                      >
                        {currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                          ? '👑 Active Fork: "Princess Donut" (Sliding Barrel + Watertight Seal + OTB Reserve)'
                          : '👑 Activate Fork: "Princess Donut" (Trigger-Lock Pulls Barrel + Watertight Seal)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
                            rexLeverCocked: !currentCtx.rexLeverCocked,
                          })
                        }
                        className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                          currentCtx.rexLeverCocked
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-900 text-amber-300 border-amber-500/60 hover:bg-amber-500 hover:text-zinc-950'
                        }`}
                      >
                        {currentCtx.rexLeverCocked
                          ? currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                            ? '🔒 Cam Barrel Rearward (-38mm) & Watertight Seal Cone'
                            : '🔒 Close 5-Hole Underlever & Lock Breech (#11)'
                          : currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                          ? '🔓 Unlock Trigger-Guard Cam (#14-DONUT) & Pull Barrel Forward (+38mm)'
                          : '⚙️ Cock 5-Hole Underlever 42° & Engage Sear (#14–#20)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextRexMode =
                            currentCtx.rexMode === 'REX_P_PISTOL_1SHOT'
                              ? 'REX_SNIPER_CARBINE_MODERATED'
                              : currentCtx.rexMode === 'REX_SNIPER_CARBINE_MODERATED'
                              ? 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                              : 'REX_P_PISTOL_1SHOT';
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
                            rexMode: nextRexMode,
                          });
                        }}
                        className="px-2.5 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
                      >
                        {currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL'
                          ? 'Variant: Princess Donut Fork'
                          : currentCtx.rexMode === 'REX_SNIPER_CARBINE_MODERATED'
                          ? 'Variant: REX Sniper Carbine'
                          : 'Variant: REX-P Pistol'}
                      </button>
                    </div>
                  </div>
                  {currentCtx.rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL' && (
                    <div className="rounded bg-pink-950/35 border border-pink-500/40 px-2.5 py-1.5 text-[10px] text-pink-100 leading-relaxed flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-pink-300 uppercase">
                          👑 Princess Donut REX-P Fork Mechanics:{' '}
                        </span>
                        <span>
                          <strong>1. Trigger-Lock Pulls Barrel (+38.0mm):</strong> Rotating trigger-guard cam-lever (#14-DONUT) 48° drives twin stainless guide rods to slide the entire rifled barrel + shroud forward out of the receiver cone while cocking the coaxial poppet (#32).{' '}
                          <strong>2. Direct Barrel-Throat Loading:</strong> Round drops directly into the exposed 11° barrel leade.{' '}
                          <strong>3. Watertight Triple-Seal:</strong> Closing the trigger-lock pulls the barrel rearward (-38.0mm) with a 5.8:1 cam advantage, wedging the 12° brass breech cone into Dual FFKM-90 Radial O-Rings (24.5% squeeze) + a PU-95A Axial Face Seal (IP68 50m submersible & 250-Bar gas-tight).{' '}
                          <strong>4. Integrated Reserve + Moderator:</strong> A Center Gold Hermetic Bulkhead separates the rear 145cc 250-Bar OTB air reserve from the front 7-baffle reflex moderator.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* #08 CUSTOM .45 ASCENT: COMPOUND 4-BAR 300B PUMP + 2-STAGE MATCH TRIGGER + SNIPER VARIANT + CALIBER SWAP */}
              {activeCanonicalGun.progressionId === 'GUN_07_ASCENT45' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-amber-400 font-bold uppercase">.45 ASCENT CONTROLS:</span>
                      <button
                        type="button"
                        onClick={() => onPumpAscentTo300Bar?.('SINGLE_3STAGE_STROKE')}
                        className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
                      >
                        🔧 4-Bar Linkage Pump (+28B)
                      </button>
                      <button
                        type="button"
                        onClick={() => onPumpAscentTo300Bar?.('FULL_300BAR_PUMP_UP')}
                        className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
                      >
                        ⚡ Full 300B Pump
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAscentTriggerPumpDrawer((prev) => !prev)
                        }
                        className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                          showAscentTriggerPumpDrawer
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-900 text-amber-300 border-amber-500/70 hover:bg-amber-500 hover:text-zinc-950'
                        }`}
                      >
                        ⚙️ Inspect 2-Stage Match Trigger &amp; 4-Bar Pump (7 Parts)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
                            ascentSniperVariant: !currentCtx.ascentSniperVariant,
                          })
                        }
                        className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                          currentCtx.ascentSniperVariant
                            ? 'bg-purple-500 text-zinc-950 border-purple-300'
                            : 'bg-zinc-900 text-purple-300 border-purple-500/60 hover:bg-purple-500 hover:text-zinc-950'
                        }`}
                      >
                        {currentCtx.ascentSniperVariant
                          ? '🔭 Variant: Ascent Long-Range Sniper (720mm + Bipod)'
                          : '🔫 Variant: Standard Bullpup Carbine'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeWeaponFamilyContext?.({
                            ...currentCtx,
                            familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
                            ascentSilencerUnscrewed: !currentCtx.ascentSilencerUnscrewed,
                          })
                        }
                        className={`px-2 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                          currentCtx.ascentSilencerUnscrewed
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-900 text-amber-300 border-amber-500/60 hover:bg-amber-500 hover:text-zinc-950'
                        }`}
                      >
                        {currentCtx.ascentSilencerUnscrewed
                          ? '🔩 Screw On M18×1.0 6-Gill Silencer'
                          : '🔩 Unscrew M18×1.0 Silencer'}
                      </button>
                    </div>

                    {/* Live Ammo Caliber Swap */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sky-400 font-bold uppercase">
                        CALIBER SWAP (BARREL+MAG):
                      </span>
                      {SUPPORTED_CAD_CALIBERS.map((cal) => {
                        const isCurrentCal =
                          Math.abs(customCaliberMm - cal.caliberMm) < 0.25;
                        return (
                          <button
                            key={cal.caliberMm}
                            type="button"
                            onClick={() => onChangeCustomCaliber(cal.caliberMm)}
                            className={`px-1.5 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
                              isCurrentCal
                                ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            {cal.imperialLabel} ({cal.caliberMm}mm)
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded Ascent 2-Stage Match Trigger & Compound 4-Bar 300B Pump Mechanics Drawer */}
                  {showAscentTriggerPumpDrawer && (
                    <div className="bg-zinc-900/95 border border-amber-500/60 rounded-lg p-2 flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-amber-300 font-bold">
                          ASCENT .45 2-STAGE MATCH TRIGGER &amp; COMPOUND 4-BAR 300B PUMP KINEMATICS:
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          {ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS.map((comp, idx) => (
                            <button
                              key={comp.componentCode}
                              type="button"
                              onClick={() => {
                                setSelectedAscentMechIdx(idx);
                                handleSelectCameraPreset(
                                  comp.componentCode.includes('TRIG')
                                    ? 'FOCUS_GRIP'
                                    : 'FOCUS_FOREGRIP'
                                );
                              }}
                              className={`px-2 py-0.5 rounded border text-[9.5px] cursor-pointer ${
                                selectedAscentMechIdx === idx
                                  ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-amber-400'
                              }`}
                            >
                              {comp.componentCode}: {comp.title.split('(')[0].trim()}
                            </button>
                          ))}
                        </div>
                      </div>
                      {(() => {
                        const activeMech =
                          ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS[selectedAscentMechIdx] ||
                          ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS[0];
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px]">
                            <div className="md:col-span-5 flex flex-col gap-0.5">
                              <div className="text-amber-300 font-bold">
                                [{activeMech.componentCode}] {activeMech.title}
                              </div>
                              <div className="text-sky-300">
                                Material: {activeMech.material} · ρ={activeMech.densityGPerCm3} g/cm³ · Mass: {activeMech.massGrams}g ({((activeMech.massGrams / 1000) * 9.81).toFixed(2)}N)
                              </div>
                              <div className="text-emerald-300">
                                Force/Rate: {activeMech.forceOrPressureSpec} · Travel: {activeMech.strokeOrRotationSpec}
                              </div>
                            </div>
                            <div className="md:col-span-7 flex flex-col gap-0.5">
                              <div className="text-zinc-200">
                                <span className="text-sky-400 font-bold">Kinematics:</span>{' '}
                                {activeMech.kinematicRole}
                              </div>
                              <div className="text-zinc-400">
                                <span className="text-emerald-400 font-bold">
                                  Zero-Interference Clearance:
                                </span>{' '}
                                {activeMech.clearanceMm}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* #01 PEN GUN: COAXIAL BURST-DISK CAPSULE STATE (SLUG vs BUCKSHOT) */}
              {activeCanonicalGun.progressionId === 'GUN_01_PEN' && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-amber-400 font-bold uppercase">
                      #01 PEN GUN (`SHELL-50-220B` 6-PETAL BURST-DISK CONTAINER):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
                          burstShellPayload: 'SLUG_50CAL_335GR_HP',
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        (currentCtx.burstShellPayload || 'SLUG_50CAL_335GR_HP') ===
                        'SLUG_50CAL_335GR_HP'
                          ? 'bg-sky-500 text-zinc-950 border-sky-300'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      🎯 .50 Cal 335gr Hollow-Point Slug Shell
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeWeaponFamilyContext?.({
                          ...currentCtx,
                          familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
                          burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
                          burstShellPayload: 'BUCKSHOT_8PELLET_50CAL',
                        })
                      }
                      className={`px-2.5 py-0.5 rounded border font-bold cursor-pointer whitespace-nowrap ${
                        currentCtx.burstShellPayload === 'BUCKSHOT_8PELLET_50CAL'
                          ? 'bg-amber-500 text-zinc-950 border-amber-300'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      💥 .50 Cal 8-Pellet #000 Buckshot Shell
                    </button>
                  </div>
                  <span className="text-emerald-300">
                    Shared 220B Burst-Disk Container · M18×1.0 Coupler Threads · Ti-6Al-4V Pocket Clip
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      {/* ====================================================================
          2. MAIN WORKSPACE AREA (Controlled cleanly by the Elon Bottom Bar)
         ==================================================================== */}
      <main className="w-full max-w-[1440px] mx-auto flex-1 min-h-0 flex flex-col justify-end pointer-events-none">
        {/* VIEW 1: 3D_FOCUS_STAGE — Interactive Part Selection, Hyper-Real Mass/Density/Collision Telemetry & Agent Research Loop */}
        {!zenHideOverlays && primaryView === '3D_FOCUS_STAGE' && (
          minimizeBottomBlueprintStrip ? (
            <div className="pointer-events-auto self-end bg-zinc-950/95 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-[11px] shadow-xl flex items-center gap-2">
              <span className="text-amber-300 font-bold">
                {cameraPreset !== 'FULL_SIDE_PROFILE'
                  ? `Isolated: ${cameraPreset.replace('FOCUS_', '')}`
                  : `${activeCanonicalGun.shortTitle} Blueprint Strip Minimized`}
              </span>
              <button
                type="button"
                data-testid="restore-bottom-blueprint-strip"
                onClick={() => setMinimizeBottomBlueprintStrip(false)}
                className="px-2 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] cursor-pointer"
              >
                ▴ Expand Blueprint &amp; Focus Strip
              </button>
            </div>
          ) : (
            <div className="pointer-events-auto w-full bg-zinc-950/94 border border-zinc-800 rounded-xl p-2.5 font-mono text-xs shadow-2xl flex flex-col gap-2">
              {cameraPreset !== 'FULL_SIDE_PROFILE' ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[10px]">
                        ISOLATED 3D PART: {cameraPreset.replace('FOCUS_', '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-zinc-300 text-[11px]">
                        Assembly centered at [0,0,0] with non-touching disassembly vectors — click a Sub-Component to separate or keep All Assembled:
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectSubComponent(null)}
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                          selectedSubComponentIdx === null
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                            : 'bg-zinc-900 text-emerald-300 border-zinc-700'
                        }`}
                      >
                        ✓ Keep Group Assembled
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportLive3DSceneToStl('ISOLATED_FOCUS_GROUP')}
                        className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 text-[10px] font-bold cursor-pointer"
                      >
                        ⬇ Export Isolated .STL
                      </button>
                      <button
                        type="button"
                        onClick={handleResetObjectToMiddle}
                        className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-amber-300 hover:text-white text-[10px] font-bold cursor-pointer"
                      >
                        ✕ Show Full Weapon
                      </button>
                      <button
                        type="button"
                        onClick={() => setMinimizeBottomBlueprintStrip(true)}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[10px] cursor-pointer"
                      >
                        ▾ Min
                      </button>
                    </div>
                  </div>

                  {/* Sub-Component Selector Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isolatedSubComponents.map((sub, idx) => (
                      <button
                        key={sub.code}
                        type="button"
                        onClick={() => handleSelectSubComponent(idx)}
                        className={`px-2.5 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
                          selectedSubComponentIdx === idx
                            ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                            : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-amber-400'
                        }`}
                      >
                        [{sub.code}] {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Full Weapon Selected: Show Dedicated Weapon Blueprint Parts Strip (Click any part to inspect & task an agent!) */
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[10px]">
                      SELECT PART TO INSPECT ({activeCanonicalGun.uniqueParts.length} PARTS):
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {activeCanonicalGun.uniqueParts.map((bp, idx) => (
                        <button
                          key={bp.partCode}
                          type="button"
                          onClick={() => setSelectedBlueprintPartIndex(idx)}
                          className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer ${
                            selectedBlueprintPartIndex === idx
                              ? 'bg-amber-500 text-zinc-950 border-amber-300 font-bold'
                              : 'bg-zinc-900 border-zinc-800 hover:border-amber-400 text-zinc-300'
                          }`}
                        >
                          {bp.partCode}: {bp.partName}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-emerald-300">
                      Elon Spec: {activeElonRoadmap.specAccuracyPct}% ({activeElonRoadmap.blueprintCode})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrimaryView('CUSTOM_BLUEPRINT_AND_ORINGS')}
                      className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                    >
                      Inspect {activeCanonicalGun.shortTitle.split(' ')[0]} Blueprint &amp; O-Rings
                    </button>
                    <button
                      type="button"
                      data-testid="minimize-bottom-blueprint-strip"
                      onClick={() => setMinimizeBottomBlueprintStrip(true)}
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-amber-300 hover:text-white text-[10px] font-bold cursor-pointer"
                    >
                      ▾ Min Blueprint Strip
                    </button>
                  </div>
                </div>
              )}

              {/* HYPER-REAL PART PHYSICS, COLLISION CLEARANCE & AGENT CUSTOM-PROMPT LEARNING DOCK */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 flex flex-col gap-1.5 text-[10.5px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-amber-300 font-bold">
                      🔍 {inspectedPartSpec.partCode}: {inspectedPartSpec.partName}
                    </span>
                    <span className="text-sky-300">
                      · Material: {activePartAgentUpgrade ? activePartAgentUpgrade.updatedMaterialSpec : inspectedPartSpec.materialSpec.displayName}
                    </span>
                    <span className="text-emerald-300">
                      · Density: {inspectedPartSpec.materialSpec.densityGPerCm3} g/cm³
                    </span>
                    <span className="text-amber-200 font-bold">
                      · Mass: {activePartAgentUpgrade ? activePartAgentUpgrade.updatedMassGrams : inspectedPartSpec.massGrams}g ({inspectedPartSpec.weightNewtons}N)
                    </span>
                    <span className="text-purple-300">
                      · Vol: {inspectedPartSpec.solidVolumeCm3} cm³ · Safety Factor: {activePartAgentUpgrade ? activePartAgentUpgrade.updatedSafetyFactor : inspectedPartSpec.hoopOrContactSafetyFactor}×
                    </span>
                  </div>
                  <span className="text-emerald-400 text-[10px]">
                    ✓ Collision: {inspectedPartSpec.aabbCollisionCheck} (Clearance ≥{inspectedPartSpec.minNeighborClearanceMm}mm)
                  </span>
                </div>

                {/* Agent Custom-Prompt Research & Live Upgrade Input */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/80">
                  <span className="text-sky-400 font-bold text-[10px] whitespace-nowrap">
                    🤖 TASK AGENT ON PART:
                  </span>
                  <input
                    type="text"
                    aria-label="Custom Agent Part Research Prompt"
                    value={agentCustomPrompt}
                    onChange={(e) => setAgentCustomPrompt(e.target.value)}
                    placeholder="Ask Agent to research & upgrade this part from specs (e.g., Ti-6Al-4V, 300B fatigue, tighter O-ring)..."
                    className="flex-1 min-w-[220px] bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[10.5px] text-zinc-100"
                  />
                  <button
                    type="button"
                    disabled={isAgentResearching}
                    onClick={() => void handleTaskAgentResearchSelectedPart()}
                    className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                  >
                    {isAgentResearching
                      ? '⏳ Agent Researching...'
                      : '⚡ Task Agent → Learn, Upgrade & Mount .STL'}
                  </button>
                  {activePartAgentUpgrade && (
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob(
                          [activePartAgentUpgrade.watertightStlAscii],
                          { type: 'model/stl' }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = activePartAgentUpgrade.stlFileName;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] cursor-pointer whitespace-nowrap"
                    >
                      ⬇ Upgraded .STL ({activePartAgentUpgrade.triangleCount} Tri)
                    </button>
                  )}
                </div>

                {activePartAgentUpgrade && (
                  <div className="bg-emerald-950/35 border border-emerald-500/50 rounded px-2.5 py-1.5 text-[10px] text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-emerald-300">
                        ✓ {activePartAgentUpgrade.agentName} Upgraded {activePartAgentUpgrade.partCode}:
                      </span>{' '}
                      {activePartAgentUpgrade.learnedEngineeringInsight}
                    </div>
                    <span className="text-amber-300 font-bold whitespace-nowrap">
                      +{activePartAgentUpgrade.muzzleEnergyDeltaJoules}J · SF {activePartAgentUpgrade.updatedSafetyFactor}× · {activePartAgentUpgrade.updatedMassGrams}g
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* VIEW 2: CUSTOM_BLUEPRINT_AND_ORINGS */}
        {!zenHideOverlays && primaryView === 'CUSTOM_BLUEPRINT_AND_ORINGS' && (
          <WeaponCustomBlueprintAndOringStudio
            equippedGunId={activeCanonicalGun.progressionId}
            onEquipCanonicalGun={handleEquipCanonicalGun}
            onTriggerDivideAndConquerAll={() => {
              onRunElonVersionUpgrade?.();
              setPrimaryView('GAME_DEVELOPMENT_ROADMAP');
            }}
          />
        )}

        {/* VIEW 3: FIVE_STEP_AIRFLOW_CUTAWAY */}
        {!zenHideOverlays && primaryView === 'FIVE_STEP_AIRFLOW_CUTAWAY' && (
          <HighMagPartAndAirflowInspector
            viewLayoutMode={cutawaySubLayout}
            onChangeViewLayoutMode={setCutawaySubLayout}
            activeFamilyId={activeCanonicalGun.familyId}
            activeProgressionId={activeCanonicalGun.progressionId}
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
            onSelectCameraPreset={handleSelectCameraPreset}
            cameraZoom={cameraZoom}
            onChangeCameraZoom={(nextZ) => {
              setCameraZoom(nextZ);
              dispatchWorkbenchCameraState(
                cameraPreset,
                nextZ,
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
            activeBenchmarkSubComp={undefined}
            createdUniquePartsByCode={createdUniquePartsByCode}
            onCreateUniquePartForAscent={handleCreateUniqueAscentPart}
            onDownloadUniqueComponentStl={handleDownloadUniqueComponentStl}
          />
        )}

        {/* VIEW 4: STL_HUB_AND_EXTERNAL_SEARCH — Real-Time Peer-to-Peer (P2P) CAD Model Sharing + Universal 3D .STL Export/Import & HF/Thingiverse Search */}
        {!zenHideOverlays && primaryView === 'STL_HUB_AND_EXTERNAL_SEARCH' && (
          <div className="pointer-events-auto w-full bg-zinc-950/96 border border-purple-500/70 rounded-xl p-3 font-mono text-xs shadow-2xl flex flex-col gap-2.5 max-h-[64vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <div>
                <div className="text-[10px] text-purple-300 font-bold uppercase flex items-center gap-2">
                  <span>📡 REAL-TIME P2P CAD MODEL SHARING SWARM ({p2pConnectedPeers} ACTIVE PEERS) + 3D .STL HUB</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[9px]">
                    NODE: {p2pNodeId}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  Broadcast &amp; mount watertight `.STL` parts Peer-to-Peer across WebSockets &amp; BroadcastChannel (auto-calibrated to 0.001x meter scale).
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={isSharingP2p}
                  onClick={async () => {
                    setIsSharingP2p(true);
                    try {
                      const stl = generatePrintableStlString({
                        partName: `${activeCanonicalGun.progressionId}_${inspectedPartSpec.partCode}`,
                        upperPort: upperPlat.upperConnectorPort,
                        lowerPort: lowerPlat.lowerConnectorPort,
                        wallThicknessMm: loadout.custom3dPart.wallThicknessMm,
                        subsystemType: 'OTB_COAXIAL_BARREL_SHROUD_ASSEMBLY',
                        otbCadSpec: simResult.otbCadSpec,
                      });
                      const res = await fetch('/api/p2p/share', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          peerNodeId: p2pNodeId,
                          peerCallsign: `Crawler-${p2pNodeId.slice(-4).toUpperCase()}`,
                          partCode: inspectedPartSpec.partCode,
                          partTitle: `${activeCanonicalGun.shortTitle} · ${inspectedPartSpec.partName}`,
                          weaponFamilyLabel: activeCanonicalGun.fullTitle,
                          caliberMm: customCaliberMm,
                          dimensionsMm: activeInspectableSubComp.dimensionsMm,
                          materialSpec: inspectedPartSpec.materialSpec.displayName,
                          triangleCount: 224,
                          stlAsciiPreview: stl,
                        }),
                      });
                      if (res.ok) {
                        const data = (await res.json()) as {
                          sharedModel?: P2PSharedModelItem;
                          models?: P2PSharedModelItem[];
                        };
                        if (Array.isArray(data.models)) {
                          setP2pSharedModels(data.models);
                        }
                        if (data.sharedModel && typeof BroadcastChannel !== 'undefined') {
                          const bc = new BroadcastChannel('bar250_p2p_cad_mesh');
                          bc.postMessage({
                            type: 'p2p:model_shared',
                            model: data.sharedModel,
                          });
                          bc.close();
                        }
                        setP2pStatusBanner(
                          `✓ Broadcasted [${inspectedPartSpec.partCode}] ${inspectedPartSpec.partName} to ${p2pConnectedPeers} P2P Swarm Peers!`
                        );
                      }
                    } finally {
                      setIsSharingP2p(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-purple-500 text-zinc-950 font-bold text-[10px] hover:bg-purple-400 cursor-pointer"
                >
                  {isSharingP2p
                    ? '📡 Broadcasting P2P...'
                    : `📡 Share Active Part [${inspectedPartSpec.partCode}] to P2P Swarm`}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLive3DSceneToStl('FULL_WEAPON')}
                  className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer"
                >
                  ⬇ Export Full 3D Weapon (.STL)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLive3DSceneToStl('ISOLATED_FOCUS_GROUP')}
                  className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                >
                  ⬇ Export Isolated 3D Group (.STL)
                </button>
                <label className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer">
                  📂 Import .STL Into 3D Scene
                  <input
                    type="file"
                    accept=".stl"
                    onChange={(e) => void handleImportStlFileChange(e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* ====================================================================
                SECTION A: 3-TIER HIERARCHICAL .STL DIRECTORY & SUB-COMPONENT INSPECTOR
                           (/game_references/stl_library/<weapon>/<component>/<sub_component>.stl)
               ==================================================================== */}
            {(() => {
              const activeDirWeapon =
                stlDirectoryManifest.weapons[selectedDirWeaponIdx] ??
                stlDirectoryManifest.weapons[0];
              const activeDirComponent =
                activeDirWeapon?.components.find(
                  (c) => c.componentIndex === selectedDirComponentIdx
                ) ?? activeDirWeapon?.components[0];

              return (
                <div className="bg-zinc-900/95 border border-emerald-500/50 rounded-lg p-2.5 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                    <div>
                      <div className="text-[10.5px] font-bold text-emerald-300 uppercase flex items-center gap-2">
                        <span>
                          🗂️ 3-TIER .STL DIRECTORY GENERATOR &amp; SUB-COMPONENT INSPECTOR ({stlDirectoryManifest.rootDirectoryPath})
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[9.5px]">
                          {stlDirectoryManifest.totalWeapons} Weapons · {stlDirectoryManifest.totalComponentFolders} Components · {stlDirectoryManifest.totalSubComponentStlFiles} Sub-Components = {stlDirectoryManifest.totalStlFilesGenerated} .STL Files
                        </span>
                      </div>
                      <div className="text-[10px] text-sky-300 mt-0.5">
                        {stlDiskStatusBanner}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        data-testid="generate-all-stl-directory-btn"
                        disabled={isGeneratingDiskStlTree}
                        onClick={() => void handleGenerateAllDiskStlFiles()}
                        className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer whitespace-nowrap"
                      >
                        {isGeneratingDiskStlTree
                          ? '⏳ Writing .STL Directory Tree...'
                          : `⚡ Generate / Sync All ${stlDirectoryManifest.totalStlFilesGenerated} .STL Files to Disk`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLeshiy2AgentDossier((v) => !v)}
                        className={`px-2.5 py-1 rounded border font-bold text-[10px] cursor-pointer whitespace-nowrap ${
                          showLeshiy2AgentDossier
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-950 text-amber-300 border-amber-500/60'
                        }`}
                      >
                        🤖 {showLeshiy2AgentDossier ? 'Hide' : 'Show'} Leshiy 2 Scout→CAD Agent Dossier
                      </button>
                    </div>
                  </div>

                  {/* Multi-Agent Scout -> Reverse-Engineering Pipeline Dossier for #04 EDgun Leshiy 2 */}
                  {showLeshiy2AgentDossier && (
                    <div className="bg-amber-950/25 border border-amber-500/50 rounded-lg p-2 flex flex-col gap-1.5 text-[10px]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-amber-300 uppercase">
                          🤖 MULTI-AGENT SCOUT → REVERSE-ENGINEERING PIPELINE: {LESHIY2_MULTI_AGENT_REVERSE_ENGINEERING_DOSSIER.targetWeaponTitle}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDirWeaponIdx(3);
                              setSelectedDirComponentIdx(1);
                              handleIsolateAndExplodeDirectoryItemIn3D({
                                canonicalIndex: 3,
                                focusTarget: 'FULL_SIDE_PROFILE',
                                subComponentIndex: null,
                                explodeSubComponents: true,
                              });
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[9.5px] hover:bg-amber-400 cursor-pointer"
                          >
                            👁️ Inspect Rebuilt #04 Leshiy 2 in 3D (Uncovered Barrel + Explode)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadHierarchicalStl({ canonicalIndex: 3 })
                            }
                            className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[9.5px] hover:bg-emerald-400 cursor-pointer"
                          >
                            ⬇ Download Rebuilt Leshiy 2 Full .STL
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {LESHIY2_MULTI_AGENT_REVERSE_ENGINEERING_DOSSIER.agentPipelineHandoffs.map(
                          (stage) => (
                            <div
                              key={stage.agentId}
                              className="bg-zinc-950/90 border border-zinc-800 rounded p-2 flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-amber-300 font-bold text-[9.5px]">
                                  STAGE {stage.stageOrder}: {stage.agentId}
                                </span>
                                <span className="text-emerald-400 text-[9px]">
                                  → {stage.handoffTargetAgentId}
                                </span>
                              </div>
                              <div className="text-zinc-200 font-semibold text-[9.5px]">
                                {stage.agentRole}
                              </div>
                              {'referenceSourcesGathered' in stage &&
                                stage.referenceSourcesGathered && (
                                  <ul className="text-zinc-400 text-[9px] list-disc pl-3.5 space-y-0.5">
                                    {stage.referenceSourcesGathered
                                      .slice(0, 3)
                                      .map((refStr, rIdx) => (
                                        <li key={rIdx}>{refStr}</li>
                                      ))}
                                  </ul>
                                )}
                              {'defectsDiagnosedInPreviousModel' in stage &&
                                stage.defectsDiagnosedInPreviousModel && (
                                  <ul className="text-rose-300 text-[9px] list-disc pl-3.5 space-y-0.5">
                                    {stage.defectsDiagnosedInPreviousModel.map(
                                      (defStr, dIdx) => (
                                        <li key={dIdx}>{defStr}</li>
                                      )
                                    )}
                                  </ul>
                                )}
                              {'rebuiltSubAssemblies' in stage &&
                                stage.rebuiltSubAssemblies && (
                                  <ul className="text-emerald-300 text-[9px] list-disc pl-3.5 space-y-0.5">
                                    {stage.rebuiltSubAssemblies
                                      .slice(0, 4)
                                      .map((subStr, sIdx) => (
                                        <li key={sIdx}>{subStr}</li>
                                      ))}
                                  </ul>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* TIER 1: WEAPON DIRECTORY SELECTOR (01..09) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                      <span className="text-amber-300 font-bold uppercase">
                        TIER 1 — WEAPON FOLDERS (9 WEAPONS · UNCOVERED RIFLED BARREL LINERS VERIFIED):
                      </span>
                      {activeDirWeapon && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400 font-mono text-[9.5px]">
                            Path: {activeDirWeapon.fullWeaponRelativeDiskPath} ({activeDirWeapon.totalTrianglesCount} Tri · {activeDirWeapon.dimensionsMm.lengthMm}×{activeDirWeapon.dimensionsMm.widthMm}×{activeDirWeapon.dimensionsMm.heightMm}mm)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleIsolateAndExplodeDirectoryItemIn3D({
                                canonicalIndex: activeDirWeapon.canonicalIndex,
                                focusTarget: 'FULL_SIDE_PROFILE',
                                subComponentIndex: null,
                                explodeSubComponents: false,
                              })
                            }
                            className="px-2 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[9.5px] cursor-pointer"
                          >
                            👁️ View Weapon in 3D
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadHierarchicalStl({
                                canonicalIndex: activeDirWeapon.canonicalIndex,
                              })
                            }
                            className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[9.5px] cursor-pointer"
                          >
                            ⬇ {activeDirWeapon.fullWeaponStlFileName}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {stlDirectoryManifest.weapons.map((w) => (
                        <button
                          key={w.weaponFolderSlug}
                          type="button"
                          onClick={() => {
                            setSelectedDirWeaponIdx(w.canonicalIndex);
                          }}
                          className={`px-2 py-1 rounded border text-[10px] cursor-pointer transition-colors ${
                            selectedDirWeaponIdx === w.canonicalIndex
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-emerald-400'
                          }`}
                        >
                          📁 {w.weaponFolderSlug} ({w.totalSubComponentsCount} Sub-.STLs)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TIER 2: COMPONENT DIRECTORY SELECTOR (9 COMPONENT GROUPS PER WEAPON) */}
                  {activeDirWeapon && (
                    <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                        <span className="text-sky-300 font-bold uppercase">
                          TIER 2 — COMPONENT FOLDERS IN `{activeDirWeapon.weaponFolderSlug}` (9 MODULAR GROUPS):
                        </span>
                        {activeDirComponent && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400 font-mono text-[9.5px]">
                              Path: {activeDirComponent.componentRelativeDiskPath} ({activeDirComponent.triangleCount} Tri · {activeDirComponent.dimensionsMm.lengthMm}×{activeDirComponent.dimensionsMm.widthMm}×{activeDirComponent.dimensionsMm.heightMm}mm)
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleIsolateAndExplodeDirectoryItemIn3D({
                                  canonicalIndex: activeDirWeapon.canonicalIndex,
                                  focusTarget:
                                    activeDirComponent.focusTarget as Workbench3DCameraPresetId,
                                  subComponentIndex: null,
                                  explodeSubComponents: true,
                                })
                              }
                              className="px-2 py-0.5 rounded bg-fuchsia-400 text-zinc-950 font-bold text-[9.5px] cursor-pointer"
                            >
                              🔩 Isolate &amp; Explode Component in 3D
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadHierarchicalStl({
                                  canonicalIndex: activeDirWeapon.canonicalIndex,
                                  componentIndex: activeDirComponent.componentIndex,
                                })
                              }
                              className="px-2 py-0.5 rounded bg-sky-500 text-zinc-950 font-bold text-[9.5px] cursor-pointer"
                            >
                              ⬇ {activeDirComponent.componentStlFileName}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {activeDirWeapon.components.map((comp) => (
                          <button
                            key={comp.componentFolderSlug}
                            type="button"
                            onClick={() =>
                              setSelectedDirComponentIdx(comp.componentIndex)
                            }
                            className={`px-2 py-1 rounded border text-[9.5px] cursor-pointer transition-colors ${
                              selectedDirComponentIdx === comp.componentIndex
                                ? 'bg-sky-500 text-zinc-950 border-sky-300 font-bold'
                                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-sky-400'
                            }`}
                          >
                            📂 {comp.componentFolderSlug} ({comp.subComponents.length} Sub-Parts)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TIER 3: SUB-COMPONENT .STL FILES INSIDE SELECTED COMPONENT */}
                  {activeDirWeapon && activeDirComponent && (
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="text-fuchsia-300 font-bold uppercase">
                          TIER 3 — SUB-COMPONENT .STL FILES IN `{activeDirWeapon.weaponFolderSlug}/{activeDirComponent.componentFolderSlug}/` ({activeDirComponent.subComponents.length} FILES):
                        </span>
                        <span className="text-emerald-300 text-[9.5px]">
                          Click &ldquo;👁️ Isolate Sub-Part&rdquo; to inspect in 3D or &ldquo;⬇ .STL&rdquo; to download the individual sub-component mesh
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {activeDirComponent.subComponents.map((sub) => (
                          <div
                            key={sub.fileName}
                            className="bg-zinc-950 border border-zinc-800 hover:border-fuchsia-500/60 rounded p-2 flex flex-col justify-between gap-1 text-[9.5px]"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-amber-300 font-bold truncate">
                                  📄 {sub.fileName}
                                </span>
                                <span className="text-emerald-300 font-mono shrink-0">
                                  {sub.triangleCount} Tri
                                </span>
                              </div>
                              <div
                                className="text-zinc-100 font-semibold truncate mt-0.5"
                                title={sub.subComponentTitle}
                              >
                                {sub.subComponentTitle}
                              </div>
                              <div className="text-sky-300 mt-0.5">
                                BBox: {sub.dimensionsMm.lengthMm}×{sub.dimensionsMm.widthMm}×{sub.dimensionsMm.heightMm}mm · Vol: {sub.volumeCm3} cm³
                              </div>
                              <div className="text-zinc-400 truncate">
                                {sub.materialSpec} · Explode Δ: [{sub.explodeVectorMm.join(', ')}]mm
                              </div>
                            </div>
                            <div className="flex items-center gap-1 pt-1 border-t border-zinc-900">
                              <button
                                type="button"
                                onClick={() =>
                                  handleIsolateAndExplodeDirectoryItemIn3D({
                                    canonicalIndex: activeDirWeapon.canonicalIndex,
                                    focusTarget:
                                      activeDirComponent.focusTarget as Workbench3DCameraPresetId,
                                    subComponentIndex: sub.subComponentIndex,
                                    explodeSubComponents: true,
                                  })
                                }
                                className="flex-1 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 hover:bg-fuchsia-500 hover:text-zinc-950 font-bold cursor-pointer"
                              >
                                👁️ Isolate Sub-Part in 3D
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadHierarchicalStl({
                                    canonicalIndex: activeDirWeapon.canonicalIndex,
                                    componentIndex: activeDirComponent.componentIndex,
                                    subComponentIndex: sub.subComponentIndex,
                                  })
                                }
                                className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 cursor-pointer"
                              >
                                ⬇ .STL
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Live P2P Swarm Shared Models Feed */}
            <div className="bg-purple-950/25 border border-purple-500/40 rounded-lg p-2 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <span className="text-purple-200 font-bold">{p2pStatusBanner}</span>
                <span className="text-emerald-300">
                  ✓ Meter-Scale Normalization (0.001x mm→m) Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {p2pSharedModels.slice(0, 3).map((peerItem) => (
                  <div
                    key={peerItem.id}
                    className="bg-zinc-900/95 border border-purple-500/40 rounded p-2 flex flex-col justify-between gap-1 text-[10px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-[9px]">
                          P2P PEER · {peerItem.peerCallsign}
                        </span>
                        <span className="text-amber-300 font-bold text-[9px]">
                          ▲ {peerItem.upvotes}
                        </span>
                      </div>
                      <div className="text-zinc-100 font-bold truncate mt-0.5">
                        [{peerItem.partCode}] {peerItem.partTitle}
                      </div>
                      <div className="text-sky-300 text-[9.5px]">
                        {peerItem.dimensionsMm} · {peerItem.materialSpec}
                      </div>
                      <div className="text-emerald-400 text-[9px] truncate">
                        ✓ {peerItem.verifiedBySwarmAgent}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = parseStlContentToMeshSummary(
                            peerItem.stlAsciiPreview,
                            `${peerItem.partCode.toLowerCase()}_p2p.stl`,
                            'AL_7075_T6'
                          );
                          setImportedStlSummary(parsed);
                          if (
                            typeof window !== 'undefined' &&
                            parsed.positionsFloat32.length > 0
                          ) {
                            window.dispatchEvent(
                              new CustomEvent('bar250-mount-custom-stl', {
                                detail: {
                                  positionsFloat32: parsed.positionsFloat32,
                                  partTitle: `[P2P] ${peerItem.partCode}: ${peerItem.partTitle}`,
                                  colorHex: 0x38bdf8,
                                },
                              })
                            );
                          }
                        }}
                        className="flex-1 py-1 rounded bg-purple-500 text-zinc-950 font-bold text-[9.5px] hover:bg-purple-400 cursor-pointer"
                      >
                        ⚡ Mount P2P .STL on 3D Gun
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([peerItem.stlAsciiPreview], {
                            type: 'model/stl',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${peerItem.partCode.toLowerCase()}_p2p.stl`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-2 py-1 rounded bg-zinc-800 border border-zinc-600 text-zinc-200 hover:text-white text-[9.5px] cursor-pointer"
                      >
                        ⬇ .STL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Imported or Synthesized .STL Telemetry Banner */}
            {importedStlSummary && (
              <div className="bg-emerald-950/35 border border-emerald-500/60 rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                <div>
                  <span className="text-emerald-300 font-bold">
                    ✓ Mounted 3D .STL on Active Weapon (0.001x Meter-Scaled): {importedStlSummary.fileName}
                  </span>{' '}
                  <span className="text-zinc-200">
                    ({importedStlSummary.format} · {importedStlSummary.triangleCount} Triangles)
                  </span>
                </div>
                <div className="text-amber-300 font-bold">
                  BBox: {importedStlSummary.boundingBoxMm.xMm}×{importedStlSummary.boundingBoxMm.yMm}×{importedStlSummary.boundingBoxMm.zMm}mm · Vol: {importedStlSummary.estimatedVolumeCm3} cm³ · Mass: {importedStlSummary.estimatedMassGrams}g
                </div>
              </div>
            )}

            {/* HuggingFace 3D Hub & Thingiverse Search Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                type="text"
                aria-label="Search HuggingFace and Thingiverse 3D STL Parts"
                value={externalSearchQuery}
                onChange={(e) => setExternalSearchQuery(e.target.value)}
                placeholder="Search HuggingFace 3D Hub & Thingiverse (e.g., Leshiy plenum, P50 helical, .50 burst shell, Ascent pump)..."
                className="flex-1 min-w-[240px] bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-100"
              />
              {(
                [
                  ['ALL', 'All Repos'],
                  ['HUGGINGFACE_3D_HUB', '🤗 HuggingFace 3D Hub'],
                  ['THINGIVERSE_API', '🔩 Thingiverse API'],
                  ['PRINTABLES_CAD_INDEX', '🖨️ Printables CAD'],
                ] as const
              ).map(([srcKey, label]) => (
                <button
                  key={srcKey}
                  type="button"
                  onClick={() => setExternalSourceFilter(srcKey)}
                  className={`px-2 py-1 rounded border text-[10px] cursor-pointer ${
                    externalSourceFilter === srcKey
                      ? 'bg-purple-500 text-zinc-950 border-purple-300 font-bold'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-purple-400'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                disabled={isSearchingExternalApis}
                onClick={() => void handleQueryExternal3DRepositories()}
                className="px-3 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-xs hover:bg-sky-400 cursor-pointer"
              >
                {isSearchingExternalApis ? 'Searching APIs...' : '🔍 Query Live APIs'}
              </button>
            </div>

            <div className="text-[10px] text-sky-300">{externalApiBanner}</div>

            {/* Search Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {combinedExternalHits.slice(0, 8).map((hit) => (
                <div
                  key={hit.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 flex flex-col justify-between gap-1.5 text-[10px]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/50 text-purple-200 font-bold text-[9px]">
                        {hit.sourcePlatform.replace(/_/g, ' ')}
                      </span>
                      <span className="text-zinc-400 text-[9px]">
                        ⬇{hit.downloadsCount} · ★{hit.likesCount}
                      </span>
                    </div>
                    <div className="text-zinc-100 font-bold truncate" title={hit.title}>
                      {hit.title}
                    </div>
                    <div className="text-sky-300 text-[9.5px] mt-0.5">
                      {hit.dimensionsMm.lengthMm}×Ø{hit.dimensionsMm.outerDiameterMm}mm · {hit.recommendedMaterialId}
                    </div>
                    <p className="text-zinc-400 text-[9.5px] mt-0.5 line-clamp-2">
                      {hit.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800">
                    <div className="text-[9px] text-emerald-300 truncate">
                      ✓ {hit.agentVerificationBadge}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMountAndDownloadExternalHit(hit)}
                      className="w-full py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
                    >
                      ⚡ Synthesize &amp; Mount on 3D Gun (0.001x Scale)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: MODULAR_PARTS_AND_HYBRID */}
        {!zenHideOverlays && primaryView === 'MODULAR_PARTS_AND_HYBRID' && (
          <div className="pointer-events-auto w-full bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 font-mono text-xs shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModularSubTab('EIGHT_SLOT_NODES')}
                  className={`px-2.5 py-1 rounded text-[11px] cursor-pointer ${
                    modularSubTab === 'EIGHT_SLOT_NODES'
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-900 text-zinc-300'
                  }`}
                >
                  Sub-View A: 8-Slot Component Nodes
                </button>
                <button
                  type="button"
                  onClick={() => setModularSubTab('HYBRID_25_COMBINER')}
                  className={`px-2.5 py-1 rounded text-[11px] cursor-pointer ${
                    modularSubTab === 'HYBRID_25_COMBINER'
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-900 text-zinc-300'
                  }`}
                >
                  Sub-View B: 25-Gun Hybrid Combiner &amp; Port Adapter
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>PA12-CF: {inventory.pa12CfFilamentGrams}g</span>
                <span>·</span>
                <span>Foils: {inventory.burstDiskFoils}</span>
                <button
                  type="button"
                  onClick={() => handleExportStl()}
                  className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                >
                  Export Watertight .STL
                </button>
              </div>
            </div>

            {modularSubTab === 'EIGHT_SLOT_NODES' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2">
                  <div className="text-[10px] text-sky-400 font-bold mb-1">
                    01. OTB Barrel Shroud &amp; Plenum
                  </div>
                  <select
                    aria-label="OTB Barrel Shroud"
                    value={loadout.otbShroudId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, otbShroudId: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100"
                  >
                    {getPartsForSlot('otb_shroud').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">
                    02. Discharge Architecture ({dischargeSpec.openingTimeMs}ms)
                  </div>
                  <select
                    aria-label="Discharge Mechanism"
                    value={dischargeType}
                    onChange={(e) =>
                      onChangeDischargeType(e.target.value as DischargeMechanismType)
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100"
                  >
                    {Object.values(DISCHARGE_ARCHITECTURE_SPECS).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2">
                  <div className="text-[10px] text-amber-400 font-bold mb-1">
                    03. Breech &amp; Magazine System
                  </div>
                  <select
                    aria-label="Rotary or Helical Magazine"
                    value={loadout.rotaryMagId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, rotaryMagId: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100"
                  >
                    {getPartsForSlot('rotary_magazine').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2">
                  <div className="text-[10px] text-purple-300 font-bold mb-1">
                    04. 3-Stage Pump &amp; Foregrip Tank
                  </div>
                  <select
                    aria-label="Onboard Pump Cylinder"
                    value={loadout.pumpCylinderId}
                    onChange={(e) =>
                      onUpdateLoadout({ ...loadout, pumpCylinderId: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100"
                  >
                    {getPartsForSlot('pump_cylinder').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2.5">
                  <div className="text-[10px] text-sky-400 font-bold mb-1">
                    Piece A — Upper Barrel &amp; Breech (25 Platforms)
                  </div>
                  <select
                    aria-label="Piece A Upper Platform"
                    value={upperPlatformId}
                    onChange={(e) => onChangeHybridPlatforms(e.target.value, lowerPlatformId)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 mb-1"
                  >
                    {POPULAR_25_AIRGUNS.map((plat) => (
                      <option key={plat.id} value={plat.id}>
                        #{String(plat.index).padStart(2, '0')} {plat.name} ({plat.caliberMm}mm)
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-zinc-400">Port: {portA.name}</div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2.5">
                  <div className="text-[10px] text-purple-300 font-bold mb-1">
                    Piece B — Lower Reservoir &amp; Stock (25 Platforms)
                  </div>
                  <select
                    aria-label="Piece B Lower Platform"
                    value={lowerPlatformId}
                    onChange={(e) => onChangeHybridPlatforms(upperPlatformId, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 mb-1"
                  >
                    {POPULAR_25_AIRGUNS.map((plat) => (
                      <option key={plat.id} value={plat.id}>
                        #{String(plat.index).padStart(2, '0')} {plat.name} ({plat.defaultStorageCc}cc)
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-zinc-400">Port: {portB.name}</div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newVersionLabel}
                      onChange={(e) => setNewVersionLabel(e.target.value)}
                      placeholder="Custom Build Name..."
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => onSaveNewVersion(newVersionLabel)}
                      className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs cursor-pointer"
                    >
                      Save Build
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={onPrintAdapterAndPart}
                    className="w-full py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer mt-2"
                  >
                    3D Print Port Bridge &amp; Seat O-Rings (-45g)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: GAME_DEVELOPMENT_ROADMAP */}
        {!zenHideOverlays && primaryView === 'GAME_DEVELOPMENT_ROADMAP' && (
          <GameDevAndMarketingRoadmapView
            elonVersionState={elonVersionState}
            onRunElonVersionUpgrade={onRunElonVersionUpgrade}
            onResolveHitlWebhook={onResolveHitlWebhook}
            onEquipCanonicalGun={(gun) => {
              handleEquipCanonicalGun(gun);
              setPrimaryView('3D_FOCUS_STAGE');
            }}
            onOpenBlueprintForGun={(gun) => {
              handleEquipCanonicalGun(gun);
              setPrimaryView('CUSTOM_BLUEPRINT_AND_ORINGS');
            }}
            onCloseView={() => setPrimaryView('3D_FOCUS_STAGE')}
          />
        )}
      </main>

      {/* ====================================================================
          2B. FLOATING 3D PART RADIAL QUICK-MENU AROUND SELECTED 3D PART
         ==================================================================== */}
      <Floating3DPartRadialMenu
        visible={showPartRadialMenu}
        anchorXPercent={50}
        anchorYPercent={47}
        partCode={activeInspectableSubComp.code}
        partTitle={activeInspectableSubComp.name}
        materialAndMassBadge={`${inspectedPartSpec.materialSpec.displayName} · ${inspectedPartSpec.massGrams.toFixed(1)}g (${inspectedPartSpec.materialSpec.densityGPerCm3} g/cm³)`}
        safetyAndToleranceBadge={`SF ${inspectedPartSpec.hoopOrContactSafetyFactor.toFixed(2)} · Tol ${activeInspectableSubComp.toleranceMm}`}
        delegationStatusBadge={`Agent: ${activeInspectableSubComp.assignedAgent} (1B → 4B Ready)`}
        onClose={() => setShowPartRadialMenu(false)}
        nodes={[
          {
            id: 'cad-spec',
            angleDeg: 0,
            shortLabel: '1. CAD & Blueprint',
            subLabel: activeInspectableSubComp.dimensionsMm,
            accentColor: 'amber',
            onTrigger: () => {
              setZenHideOverlays(false);
              setPrimaryView('CUSTOM_BLUEPRINT_AND_ORINGS');
              setShowPartRadialMenu(false);
            },
          },
          {
            id: 'isolate-explode',
            angleDeg: 60,
            shortLabel: explodedAmount > 0.1 ? '2. Collapse Assembly' : '2. Damped Explode',
            subLabel: `${inspectedPartSpec.minNeighborClearanceMm}mm Clearance`,
            accentColor: 'cyan',
            onTrigger: () => {
              onSetExploded(explodedAmount > 0.1 ? 0 : 0.65);
            },
          },
          {
            id: 'agent-research',
            angleDeg: 120,
            shortLabel: '3. 1B→4B Research',
            subLabel: isAgentResearching ? 'Solving CFD...' : 'Task Swarm Agent',
            accentColor: 'fuchsia',
            onTrigger: () => {
              void handleTaskAgentResearchSelectedPart();
            },
          },
          {
            id: 'queue-print',
            angleDeg: 180,
            shortLabel: '4. Fabricate Part',
            subLabel: 'Send to 3D Printer',
            accentColor: 'emerald',
            onTrigger: () => {
              onPrintAdapterAndPart();
              setShowPartRadialMenu(false);
            },
          },
          {
            id: 'export-stl',
            angleDeg: 240,
            shortLabel: '5. Export .STL',
            subLabel: 'Watertight Mesh',
            accentColor: 'sky',
            onTrigger: () => {
              handleExportLive3DSceneToStl('ISOLATED_FOCUS_GROUP');
            },
          },
          {
            id: 'cycle-mechanism',
            angleDeg: 300,
            shortLabel: '6. Cycle Action',
            subLabel: 'Animate Breech/Fire',
            accentColor: 'rose',
            onTrigger: () => {
              onBenchFire();
            },
          },
        ]}
      />

      {/* ====================================================================
          3. COLLAPSIBLE BOTTOM CONTROL DOCK (Zero Viewport Occlusion Mode)
         ==================================================================== */}
      {collapseBottomDock ? (
        <div className="pointer-events-auto mx-auto mb-1 font-mono">
          <button
            type="button"
            data-testid="expand-workbench-bottom-dock"
            onClick={() => setCollapseBottomDock(false)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-amber-500/70 text-amber-300 font-bold text-xs shadow-2xl hover:bg-amber-500 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            ▴ Show Workbench Controls Dock ({activeCanonicalGun.shortTitle} · {Math.round(pneumaticState.plenumPressureBar)}B)
          </button>
        </div>
      ) : (
        <footer className="pointer-events-auto max-w-[1440px] w-full mx-auto bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 shadow-2xl shrink-0 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                data-testid="collapse-workbench-bottom-dock"
                onClick={() => setCollapseBottomDock(true)}
                title="Collapse Bottom Dock for 100% Unobstructed 3D Viewport"
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-[10px] text-amber-300 hover:bg-amber-500 hover:text-zinc-950 font-bold cursor-pointer mr-1"
              >
                ▾ Hide Dock
              </button>
              <span className="text-[10px] text-zinc-400 mr-1">
                Workbench:
              </span>
            {(
              [
                ['3D_FOCUS_STAGE', '1. 3D Focus & Part Agent'],
                ['CUSTOM_BLUEPRINT_AND_ORINGS', '2. Blueprint & O-Rings'],
                ['STL_HUB_AND_EXTERNAL_SEARCH', '3. P2P Model Share & STL Hub'],
                ['MODULAR_PARTS_AND_HYBRID', '4. Modular & Hybrid'],
                ['GAME_DEVELOPMENT_ROADMAP', '5. Elon Roadmap & Agents'],
              ] as Array<[WorkbenchPrimaryView, string]>
            ).map(([viewKey, label]) => (
              <button
                key={viewKey}
                type="button"
                onClick={() => {
                  setZenHideOverlays(false);
                  setPrimaryView(viewKey);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  !zenHideOverlays && primaryView === viewKey
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] tabular-nums">
            <div className="hidden xl:flex items-center gap-2 text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1">
              <span className="text-sky-400">
                Reserve: {Math.round(pneumaticState.otbPressureBar)}B
              </span>
              <span>·</span>
              <span className="text-amber-400 font-bold">
                Plenum: {Math.round(pneumaticState.plenumPressureBar)}B
              </span>
            </div>

            <select
              aria-label="Re-Bore Caliber"
              value={customCaliberMm}
              onChange={(e) => onChangeCustomCaliber(parseFloat(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200 cursor-pointer"
            >
              {SUPPORTED_CAD_CALIBERS.map((c) => (
                <option key={c.caliberMm} value={c.caliberMm}>
                  {c.imperialLabel}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onBenchFire}
              className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 cursor-pointer whitespace-nowrap"
            >
              Fire ({pneumaticState.magazineLoaded}/{pneumaticState.magazineCapacity})
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeCanonicalGun.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
                  onPumpAscentTo300Bar?.('SINGLE_3STAGE_STROKE');
                } else {
                  onBenchPumpStroke('PUSH');
                }
              }}
              className="px-2.5 py-1 rounded bg-sky-500/20 border border-sky-500/60 text-sky-300 hover:bg-sky-500 hover:text-zinc-950 font-bold cursor-pointer whitespace-nowrap"
            >
              Pump +28B
            </button>

            <button
              type="button"
              onClick={onBenchRefill250Bar}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer whitespace-nowrap"
            >
              Fill Max
            </button>

            {primaryView !== '3D_FOCUS_STAGE' && (
              <button
                type="button"
                onClick={() => setZenHideOverlays((v) => !v)}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-amber-300 hover:text-white cursor-pointer whitespace-nowrap"
              >
                {zenHideOverlays ? '▴ Show Panel' : '▾ Hide Panel'}
              </button>
            )}
          </div>
        </div>

        {statusBanner && (
          <div className="mt-1.5 pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="truncate text-emerald-300">{statusBanner}</span>
            <span>
              Click 🎯 3D Part Radial Menu or any Part · Drag to Orbit · Scroll Wheel to Zoom
            </span>
          </div>
        )}
      </footer>
      )}
    </div>
  );
};
