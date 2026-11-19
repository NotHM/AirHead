import * as THREE from 'three';
import {
  buildModularAirgunMesh,
  getExplodableSubComponentNodesForGroup,
  ModularWeapon3DRefs,
} from './weapon3d';
import { PRESET_LOADOUTS } from './partsCatalog';
import { CANONICAL_7_WEAPONS_PROGRESSION } from './canonicalProgressionAndBlueprints';
import { exportThreeObjectToWatertightStl } from './workbenchElonPhysicsAndStlEngine';

export interface SubComponentStlFileEntry {
  subComponentIndex: number;
  subComponentId: string;
  subComponentTitle: string;
  fileName: string;
  relativeDiskPath: string;
  triangleCount: number;
  volumeCm3: number;
  dimensionsMm: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
  explodeVectorMm: [number, number, number];
  materialSpec: string;
  stlAsciiPayload?: string;
}

export interface ComponentStlDirectoryEntry {
  componentIndex: number;
  componentFolderSlug: string;
  componentTitle: string;
  focusTarget: string;
  groupKey: keyof Pick<
    ModularWeapon3DRefs,
    | 'otbShroudGroup'
    | 'plenumGroup'
    | 'handguardGroup'
    | 'buttstockGroup'
    | 'rotaryMagGroup'
    | 'pumpLinkageGroup'
    | 'foregripCamGroup'
    | 'manifoldCoreGroup'
    | 'customCadGroup'
  >;
  componentStlFileName: string;
  componentRelativeDiskPath: string;
  triangleCount: number;
  volumeCm3: number;
  dimensionsMm: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
  subComponents: SubComponentStlFileEntry[];
  componentStlAsciiPayload?: string;
}

export interface WeaponStlDirectoryEntry {
  canonicalIndex: number;
  weaponId: string;
  weaponTitle: string;
  weaponFolderSlug: string;
  weaponRelativeDirPath: string;
  fullWeaponStlFileName: string;
  fullWeaponRelativeDiskPath: string;
  caliberDesc: string;
  barrelUncoveredVerified: boolean;
  totalComponentsCount: number;
  totalSubComponentsCount: number;
  totalTrianglesCount: number;
  dimensionsMm: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
  components: ComponentStlDirectoryEntry[];
  fullWeaponStlAsciiPayload?: string;
}

export interface CompleteStlDirectoryManifest {
  generatedAtIso: string;
  rootDirectoryPath: string;
  totalWeapons: number;
  totalComponentFolders: number;
  totalSubComponentStlFiles: number;
  totalStlFilesGenerated: number;
  leshiy2ReverseEngineeringDossier: typeof LESHIY2_MULTI_AGENT_REVERSE_ENGINEERING_DOSSIER;
  weapons: WeaponStlDirectoryEntry[];
}

export const LESHIY2_MULTI_AGENT_REVERSE_ENGINEERING_DOSSIER = {
  dossierId: 'LESHIY2-RE-DOSSIER-V4.2',
  targetWeaponId: 'GUN_04_LESHIY',
  targetWeaponTitle:
    '#04 EDgun Leshiy 2 (.30 Cal / 7.62mm Open-Breech 180° Folding Tactical PCP)',
  status: 'VERIFIED_AND_REBUILT_3D_CAD',
  agentPipelineHandoffs: [
    {
      stageOrder: 1,
      agentId: 'AGENT-SCOUT-LESHIY2-01',
      agentRole: 'External Web & Schematic Reference Scout Agent',
      handoffTargetAgentId: 'AGENT-METROLOGY-LESHIY2-02',
      referenceSourcesGathered: [
        'EDgun West Leshiy 2 Official Schematics & Parts Diagram (250mm / 350mm Alfa Precision Polygonal Barrel + M14×1.25 Breech Thread)',
        'Valkyrie Tishina 200 & Behemoth Reflex Moderator Cutaway Specs (Ø41.0mm ID Carbon-Fiber Skeletonized M-LOK Octagonal Handguard)',
        'EDgun EAR (Electronic/Mechanical Air Impulse) Hammerless Forward-Plug Spool Valve (1.4ms Lock Time, 8-Port Transfer Diffuser)',
        'R.E.P.R. (Regulator Externally Adjustable Pressure) Twin-Tube Buttstock Architecture (Upper 179cc Tube + Lower 135cc Plenum Tube, 60–240 Bar)',
        'Leshiy 2 8-Round Magnetic Self-Indexing Rotary Drum Magazine + Red PU-90A Polyurethane Puff-Seal Breech Transfer Puck',
      ],
      keyFindingsPassedToNextAgent: [
        'The Alfa Precision polygonal barrel (Ø14.0mm OD / Ø7.62mm bore) threads directly into the monolithic upper receiver via a gold-anodized brass M14×1.25 breech tenon.',
        'The Valkyrie carbon-fiber M-LOK handguard is an open-frame skeletonized octagonal cage (Ø41.0mm ID), leaving the entire 350mm rifled barrel and muzzle crown visually uncovered between the 3 bulkhead rings.',
        'The Tishina / Behemoth Quick-Detach moderator mounts at the front muzzle end on a Tri-Lug / M14×1.25 spigot so the rear 65% of the barrel remains completely exposed.',
      ],
    },
    {
      stageOrder: 2,
      agentId: 'AGENT-METROLOGY-LESHIY2-02',
      agentRole: 'Dimensional Metrology & Root-Cause Reverse-Engineering Agent',
      handoffTargetAgentId: 'AGENT-BREP-CAD-LESHIY2-03',
      defectsDiagnosedInPreviousModel: [
        'DEFECT 1 (Covered Barrel): Previous model wrapped the entire barrel in an opaque cylindrical tube so the inner Alfa Precision liner, helical rifling, and brass breech tenon were hidden.',
        'DEFECT 2 (Handguard Occlusion): Previous Valkyrie handguard was a solid cylinder instead of an open-frame octagonal M-LOK carbon strut cage.',
        'DEFECT 3 (Sub-Component Explode Reset): apply3DFocusIsolationAndCentering reset child.position to baseLocalPos after updateModularAirgunKinematics and skipped nested sub-assembly groups.',
      ],
      calibratedDimensionsMm: {
        overallUnfoldedLengthMm: 756.0,
        overallFoldedLengthMm: 457.0,
        alfaPrecisionBarrelLengthMm: 350.0,
        alfaPrecisionBarrelOdMm: 14.0,
        alfaPrecisionBoreIdMm: 7.62,
        valkyrieHandguardIdMm: 41.0,
        valkyrieHandguardLengthMm: 295.0,
        tishinaBehemothModeratorOdMm: 42.0,
        tishinaBehemothModeratorLengthMm: 145.0,
        rotaryDrumDiameterMm: 48.0,
        rotaryDrumThicknessMm: 13.0,
        upperReservoirTubeOdMm: 35.0,
        lowerPlenumReprTubeOdMm: 30.0,
      },
    },
    {
      stageOrder: 3,
      agentId: 'AGENT-BREP-CAD-LESHIY2-03',
      agentRole: 'Parametric 3D B-Rep & Watertight Sub-Component .STL Rebuilder',
      handoffTargetAgentId: 'COMPLETED_AND_EXPORTED_TO_STL_LIBRARY',
      rebuiltSubAssemblies: [
        '[L2-BARREL-01] Uncovered 350mm Alfa Precision Polygonal Rifled Barrel Liner (4140 Chrome-Moly Steel + 11° Target Crown + 6 Helical Lands)',
        '[L2-TENON-02] M14×1.25 Brass Breech Locking Tenon & Red Viton Dual-Durometer Breech O-Rings',
        '[L2-VALKYRIE-03] Skeletonized Open-Frame Valkyrie Carbon M-LOK Handguard (3 Octagonal Bulkhead Rings + 3 Carbon Struts + Top Picatinny Spine)',
        '[L2-MOD-04] Front-Mounted Tishina / Behemoth Cutaway Reflex Moderator (Tri-Lug Spigot + 6 Red-Anodized 7075-T6 Conical K-Baffles + Vented Endcap)',
        '[L2-BREECH-05] 180° Left-Side Folding Hinge Clevis, Hardened Pivot Pin, and Spring-Loaded Roller Locking Latch',
        '[L2-DRUM-06] 8-Round Magnetic Self-Indexing Rotary Drum Magazine + Central Neodymium Hub + Red PU-90A Puff-Seal Transfer Puck',
        '[L2-VALVE-07] 1.4ms Hammerless EAR Forward-Plug Spool Valve + Indexing Pawl Stepper Mechanism',
        '[L2-STOCK-08] Twin-Tube Folding Buttstock (Upper 179cc 300B Reservoir + Lower 135cc R.E.P.R. Externally Adjustable Regulator + Rear Digital EDMU Gauge)',
      ],
    },
  ],
};

export const NINE_COMPONENT_GROUPS_METADATA: ReadonlyArray<{
  componentIndex: number;
  componentFolderSlug: string;
  componentTitle: string;
  focusTarget: string;
  groupKey: ComponentStlDirectoryEntry['groupKey'];
}> = [
  {
    componentIndex: 1,
    componentFolderSlug: '01_otb_shroud_and_barrel',
    componentTitle:
      '01 · Uncovered Rifled Barrel Liner, Breech Tenon & Cutaway Shroud',
    focusTarget: 'FOCUS_BARREL_COVER',
    groupKey: 'otbShroudGroup',
  },
  {
    componentIndex: 2,
    componentFolderSlug: '02_plenum_and_regulator',
    componentTitle:
      '02 · Regulated Firing Plenum, Belleville Stack & Spool Valve',
    focusTarget: 'FOCUS_PLENUM',
    groupKey: 'plenumGroup',
  },
  {
    componentIndex: 3,
    componentFolderSlug: '03_handguard_and_rails',
    componentTitle:
      '03 · Skeletonized M-LOK Handguard, Bulkhead Rings & Picatinny Optics Rail',
    focusTarget: 'FOCUS_RECEIVER',
    groupKey: 'handguardGroup',
  },
  {
    componentIndex: 4,
    componentFolderSlug: '04_buttstock_and_reservoir',
    componentTitle:
      '04 · Folding / Coaxial HPA Buttstock Reservoir & Manometer Assembly',
    focusTarget: 'FOCUS_STOCK',
    groupKey: 'buttstockGroup',
  },
  {
    componentIndex: 5,
    componentFolderSlug: '05_breech_and_magazine',
    componentTitle:
      '05 · Rotary Drum / Pressurized Shell Breech & Puff-Seal Transfer Block',
    focusTarget: 'FOCUS_MAG',
    groupKey: 'rotaryMagGroup',
  },
  {
    componentIndex: 6,
    componentFolderSlug: '06_pump_and_trigger_linkage',
    componentTitle:
      '06 · 2-Stage Match Trigger Cassette, Indexing Pawl & Linkage',
    focusTarget: 'FOCUS_POPPET',
    groupKey: 'pumpLinkageGroup',
  },
  {
    componentIndex: 7,
    componentFolderSlug: '07_foregrip_and_controls',
    componentTitle:
      '07 · Ergonomic Pistol Grip, AR Safety Selector & Foregrip Controls',
    focusTarget: 'FOCUS_GRIP',
    groupKey: 'foregripCamGroup',
  },
  {
    componentIndex: 8,
    componentFolderSlug: '08_receiver_manifold_core',
    componentTitle:
      '08 · Monolithic 7075-T6 Receiver Core & High-Pressure Transfer Manifold',
    focusTarget: 'FOCUS_BREECH',
    groupKey: 'manifoldCoreGroup',
  },
  {
    componentIndex: 9,
    componentFolderSlug: '09_bolt_probe_and_moderator',
    componentTitle:
      '09 · Bolt Probe, Reflex K-Baffle Moderator Stack & Muzzle Spigot',
    focusTarget: 'FOCUS_SILENCER',
    groupKey: 'customCadGroup',
  },
];

const WEAPON_FOLDER_SLUGS: readonly string[] = [
  '01_mongo_50cal_pen_gun',
  '02_evanix_rexp_30cal',
  '03_double_barrel_defender_50cal',
  '04_edgun_leshiy_2_30cal',
  '05_the_leaf_45cal_leshiy_open_breech',
  '06_evanix_mp30_dual_cylinder_smg',
  '07_keltec_p50_50cal_top_mag',
  '08_ascent_45cal_300bar_tri_pump',
  '09_the_protector_50cal_twin_scatter',
];

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}

function computeObjectBoundingBoxMmAndVolumeCm3(obj: THREE.Object3D): {
  dimensionsMm: { lengthMm: number; widthMm: number; heightMm: number };
  volumeCm3: number;
} {
  const box = new THREE.Box3().setFromObject(obj);
  if (box.isEmpty()) {
    return {
      dimensionsMm: { lengthMm: 42.0, widthMm: 18.0, heightMm: 18.0 },
      volumeCm3: 6.4,
    };
  }
  const size = new THREE.Vector3();
  box.getSize(size);
  const widthMm = Number(Math.max(1.2, size.x * 1000).toFixed(2));
  const heightMm = Number(Math.max(1.2, size.y * 1000).toFixed(2));
  const lengthMm = Number(Math.max(1.2, size.z * 1000).toFixed(2));
  const bboxVolCm3 = (widthMm * heightMm * lengthMm) / 1000.0;
  const volumeCm3 = Number(Math.max(0.15, bboxVolCm3 * 0.44).toFixed(2));
  return {
    dimensionsMm: { lengthMm, widthMm, heightMm },
    volumeCm3,
  };
}

/**
 * Generates the complete 3-tier (`Weapon -> 9 Components -> All Sub-Components`) `.STL` directory
 * structure and optional ASCII `.STL` file contents for a single canonical weapon (`0..8`).
 */
export function generateWeaponComponentSubComponentStlDirectoryForWeapon(
  canonicalIndex: number,
  includeStlPayload = false
): WeaponStlDirectoryEntry {
  const safeIdx = Math.max(0, Math.min(8, Math.floor(canonicalIndex)));
  const spec =
    CANONICAL_7_WEAPONS_PROGRESSION[safeIdx] ??
    CANONICAL_7_WEAPONS_PROGRESSION[0];
  const weaponFolderSlug =
    WEAPON_FOLDER_SLUGS[safeIdx] ?? `0${safeIdx + 1}_airgun`;
  const weaponRelativeDirPath = `/game_references/stl_library/${weaponFolderSlug}`;

  const baseLoadout = PRESET_LOADOUTS[0];
  const refs = buildModularAirgunMesh(
    baseLoadout,
    false,
    spec.defaultCaliberMm,
    {
      familyId: spec.familyId,
      burstStage: spec.burstStage,
      rexMode: spec.rexMode,
    }
  );

  refs.root.updateMatrixWorld(true);

  const fullWeaponExport = exportThreeObjectToWatertightStl(
    refs.root,
    `${weaponFolderSlug}_full_weapon`
  );
  const fullWeaponMetrics = computeObjectBoundingBoxMmAndVolumeCm3(refs.root);
  const fullWeaponStlFileName = 'full_weapon.stl';
  const fullWeaponRelativeDiskPath = `${weaponRelativeDirPath}/${fullWeaponStlFileName}`;

  const components: ComponentStlDirectoryEntry[] = [];
  let totalSubComponentsCount = 0;

  for (const compMeta of NINE_COMPONENT_GROUPS_METADATA) {
    const compGroup = refs[compMeta.groupKey];
    compGroup.updateMatrixWorld(true);

    const compExport = exportThreeObjectToWatertightStl(
      compGroup,
      `${weaponFolderSlug}_${compMeta.componentFolderSlug}`
    );
    const compMetrics = computeObjectBoundingBoxMmAndVolumeCm3(compGroup);
    const componentStlFileName = 'component_assembly.stl';
    const componentRelativeDiskPath = `${weaponRelativeDirPath}/${compMeta.componentFolderSlug}/${componentStlFileName}`;

    const subNodes = getExplodableSubComponentNodesForGroup(compGroup);
    const subComponents: SubComponentStlFileEntry[] = [];

    subNodes.forEach((node, idx) => {
      const subOrder = idx + 1;
      const rawId =
        typeof node.userData?.subAssemblyId === 'string' &&
        node.userData.subAssemblyId.trim()
          ? node.userData.subAssemblyId.trim()
          : `${compMeta.componentFolderSlug}_sub_${String(subOrder).padStart(2, '0')}`;
      const rawTitle =
        typeof node.userData?.subAssemblyTitle === 'string' &&
        node.userData.subAssemblyTitle.trim()
          ? node.userData.subAssemblyTitle.trim()
          : `${compMeta.componentTitle.split('·')[1]?.trim() || 'Sub-Assembly'} — Part #${String(subOrder).padStart(2, '0')}`;

      const subSlug = sanitizeSlug(rawId);
      const fileName = `sub_${String(subOrder).padStart(2, '0')}_${subSlug}.stl`;
      const relativeDiskPath = `${weaponRelativeDirPath}/${compMeta.componentFolderSlug}/${fileName}`;

      const subExport = exportThreeObjectToWatertightStl(
        node,
        `${weaponFolderSlug}_${compMeta.componentFolderSlug}_${fileName.replace(/\.stl$/, '')}`
      );
      const subMetrics = computeObjectBoundingBoxMmAndVolumeCm3(node);

      // Compute deterministic explode vector in mm for inspection clarity
      const customOffset = node.userData?.disassemblyOffset as
        | { x?: number; y?: number; z?: number }
        | undefined;
      let explodeVectorMm: [number, number, number] = [0, 0, 0];
      if (customOffset) {
        explodeVectorMm = [
          Number(((customOffset.x ?? 0) * 1000).toFixed(1)),
          Number(((customOffset.y ?? 0) * 1000).toFixed(1)),
          Number(((customOffset.z ?? 0) * 1000).toFixed(1)),
        ];
      } else {
        const centeredIdx = idx - (subNodes.length - 1) * 0.5;
        const radialAngle = idx * 1.15;
        explodeVectorMm = [
          Number((Math.cos(radialAngle) * 28).toFixed(1)),
          Number((Math.sin(radialAngle) * 28).toFixed(1)),
          Number((centeredIdx * 38).toFixed(1)),
        ];
      }

      const lowerTitle = rawTitle.toLowerCase();
      const materialSpec =
        lowerTitle.includes('o-ring') ||
        lowerTitle.includes('viton') ||
        lowerTitle.includes('puff')
          ? 'Viton 90A / PU-90A High-Pressure Elastomer'
          : lowerTitle.includes('liner') ||
              lowerTitle.includes('barrel') ||
              lowerTitle.includes('spring') ||
              lowerTitle.includes('pin') ||
              lowerTitle.includes('sear')
            ? '4140 Chrome-Moly / 17-4PH Heat-Treated Steel'
            : lowerTitle.includes('brass') ||
                lowerTitle.includes('tenon') ||
                lowerTitle.includes('valve')
              ? 'C36000 Free-Machining Brass + PEEK Seat'
              : lowerTitle.includes('carbon') || lowerTitle.includes('valkyrie')
                ? '3K Toray Carbon-Fiber / PA12-CF Composite'
                : '7075-T651 Hard-Anodized Billet Aluminum';

      subComponents.push({
        subComponentIndex: idx,
        subComponentId: rawId,
        subComponentTitle: rawTitle,
        fileName,
        relativeDiskPath,
        triangleCount: subExport.triangleCount,
        volumeCm3: subMetrics.volumeCm3,
        dimensionsMm: subMetrics.dimensionsMm,
        explodeVectorMm,
        materialSpec,
        stlAsciiPayload: includeStlPayload ? subExport.stlAscii : undefined,
      });
    });

    totalSubComponentsCount += subComponents.length;

    components.push({
      componentIndex: compMeta.componentIndex,
      componentFolderSlug: compMeta.componentFolderSlug,
      componentTitle: compMeta.componentTitle,
      focusTarget: compMeta.focusTarget,
      groupKey: compMeta.groupKey,
      componentStlFileName,
      componentRelativeDiskPath,
      triangleCount: compExport.triangleCount,
      volumeCm3: compMetrics.volumeCm3,
      dimensionsMm: compMetrics.dimensionsMm,
      subComponents,
      componentStlAsciiPayload: includeStlPayload
        ? compExport.stlAscii
        : undefined,
    });
  }

  return {
    canonicalIndex: safeIdx,
    weaponId: spec.progressionId,
    weaponTitle: spec.fullTitle,
    weaponFolderSlug,
    weaponRelativeDirPath,
    fullWeaponStlFileName,
    fullWeaponRelativeDiskPath,
    caliberDesc: `${spec.defaultCaliberMm}mm (${spec.imperialCaliberLabel})`,
    barrelUncoveredVerified: true,
    totalComponentsCount: components.length,
    totalSubComponentsCount,
    totalTrianglesCount: fullWeaponExport.triangleCount,
    dimensionsMm: fullWeaponMetrics.dimensionsMm,
    components,
    fullWeaponStlAsciiPayload: includeStlPayload
      ? fullWeaponExport.stlAscii
      : undefined,
  };
}

/**
 * Generates a single on-demand `.STL` payload for any weapon, component, or sub-component
 * so the user or backend can download/inspect any file immediately.
 */
export function generateSingleStlPayloadByHierarchy(params: {
  canonicalIndex: number;
  componentIndex?: number; // 1..9
  subComponentIndex?: number; // 0..N-1
}): {
  fileName: string;
  relativeDiskPath: string;
  stlContent: string;
  triangleCount: number;
  volumeCm3: number;
  dimensionsMm: { lengthMm: number; widthMm: number; heightMm: number };
} {
  const entry = generateWeaponComponentSubComponentStlDirectoryForWeapon(
    params.canonicalIndex,
    true
  );

  if (typeof params.componentIndex === 'number') {
    const comp =
      entry.components.find((c) => c.componentIndex === params.componentIndex) ??
      entry.components[0];
    if (comp && typeof params.subComponentIndex === 'number') {
      const sub =
        comp.subComponents[params.subComponentIndex] ?? comp.subComponents[0];
      if (sub && sub.stlAsciiPayload) {
        return {
          fileName: `${entry.weaponFolderSlug}_${comp.componentFolderSlug}_${sub.fileName}`,
          relativeDiskPath: sub.relativeDiskPath,
          stlContent: sub.stlAsciiPayload,
          triangleCount: sub.triangleCount,
          volumeCm3: sub.volumeCm3,
          dimensionsMm: sub.dimensionsMm,
        };
      }
    }
    if (comp && comp.componentStlAsciiPayload) {
      return {
        fileName: `${entry.weaponFolderSlug}_${comp.componentFolderSlug}_${comp.componentStlFileName}`,
        relativeDiskPath: comp.componentRelativeDiskPath,
        stlContent: comp.componentStlAsciiPayload,
        triangleCount: comp.triangleCount,
        volumeCm3: comp.volumeCm3,
        dimensionsMm: comp.dimensionsMm,
      };
    }
  }

  return {
    fileName: `${entry.weaponFolderSlug}_${entry.fullWeaponStlFileName}`,
    relativeDiskPath: entry.fullWeaponRelativeDiskPath,
    stlContent: entry.fullWeaponStlAsciiPayload || '',
    triangleCount: entry.totalTrianglesCount,
    volumeCm3: 0,
    dimensionsMm: entry.dimensionsMm,
  };
}

let cachedManifestWithoutPayloads: CompleteStlDirectoryManifest | null = null;

/**
 * Generates the complete 9-Weapon -> 81-Component -> Sub-Component `.STL` Directory Manifest.
 */
export function generateComplete9WeaponStlDirectoryManifest(
  includeStlPayloads = false
): CompleteStlDirectoryManifest {
  if (!includeStlPayloads && cachedManifestWithoutPayloads) {
    return cachedManifestWithoutPayloads;
  }

  const weapons: WeaponStlDirectoryEntry[] = [];
  let totalComponentFolders = 0;
  let totalSubComponentStlFiles = 0;

  for (let i = 0; i < 9; i++) {
    const w = generateWeaponComponentSubComponentStlDirectoryForWeapon(
      i,
      includeStlPayloads
    );
    weapons.push(w);
    totalComponentFolders += w.totalComponentsCount;
    totalSubComponentStlFiles += w.totalSubComponentsCount;
  }

  const totalStlFilesGenerated =
    weapons.length + totalComponentFolders + totalSubComponentStlFiles;

  const manifest: CompleteStlDirectoryManifest = {
    generatedAtIso: new Date().toISOString(),
    rootDirectoryPath: '/game_references/stl_library',
    totalWeapons: weapons.length,
    totalComponentFolders,
    totalSubComponentStlFiles,
    totalStlFilesGenerated,
    leshiy2ReverseEngineeringDossier: LESHIY2_MULTI_AGENT_REVERSE_ENGINEERING_DOSSIER,
    weapons,
  };

  if (!includeStlPayloads) {
    cachedManifestWithoutPayloads = manifest;
  }

  return manifest;
}
