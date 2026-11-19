import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { WeaponBuildLoadout } from './partsCatalog';
import { ForegripCamPosition } from '../wasm/pneumaticWasm';
import {
  BaseWeaponFamilyId,
  BurstDiskEvolutionStage,
  P90AmmoPayloadType,
  RexConfigurationMode,
  computeAccurateMagCapacityByWeaponAndCaliber,
} from './weaponFamiliesAndCompatibility';

// Attach BVH spatial acceleration to Three.js prototypes for sub-millimeter raycasting & CSG
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const _csgEvaluator = new Evaluator();
_csgEvaluator.useGroups = false;

export interface Weapon3DFamilyContext {
  familyId: BaseWeaponFamilyId;
  burstStage: BurstDiskEvolutionStage;
  rexMode: RexConfigurationMode;
  p90Payload?: P90AmmoPayloadType;
  p90AmmoType?: P90AmmoPayloadType;
  burstShellPayload?:
    | 'SLUG_50CAL_335GR_HP'
    | 'BUCKSHOT_8PELLET_50CAL'
    | 'GIANT_CARBON_ARROW_375GR';
  defenderPayload?:
    | 'SLUG_50CAL_335GR_HP'
    | 'BUCKSHOT_8PELLET_50CAL'
    | 'GIANT_CARBON_ARROW_375GR';
  defenderHammerCocked?: boolean;
  leshiyFolded?: boolean;
  leshiyContainerDetached?: boolean;
  rexLeverCocked?: boolean;
  mp30StockFolded?: boolean;
  mp30ContainerDetached?: boolean;
  mp30SideLeverCocked?: boolean;
  ascentSniperVariant?: boolean;
  ascentSilencerUnscrewed?: boolean;
  p50Environment?:
    | 'SPACE_VACUUM_0BAR'
    | 'SAHARA_QUARTZ_SAND_IP69K'
    | 'ABYSSAL_UNDERWATER_30M_4BAR';
  p50CyclePhase?: number; // 0: Empty/Feed, 1: Rotate 90°, 2: Push Down, 3: Cycle Bolt, 4: Seal Collars, 5: Fire & Repeat
  p50AutoCycleLoop?: boolean;
  p50BarrelOptionId?: 'BRL_30CAL_85CC' | 'BRL_50CAL_160CC' | 'BRL_50CAL_EXT_220CC';
  p50BarrelUnscrewed?: boolean;
  p50ForegripPumpOffset?: number;
  singleRoundReloadPhase?: number; // 0: Ready, 1: Open Breech/Unthread, 2: Insert Single Round, 3: Lock Breech
  protectorBreechOpen?: boolean;
  protectorCockPhase?: number;
  protectorFireSelector?: 'BARREL_1_UPPER' | 'BARREL_2_LOWER' | 'DUAL_SALVO';
  protectorUpperReserveBar?: number;
  protectorLowerReserveBar?: number;
  protectorScatterActive?: boolean;
}

export interface ModularWeapon3DRefs {
  root: THREE.Group;
  familyContext: Weapon3DFamilyContext;
  // 9 Canonical Sub-Groups for Open-Breech / Exploded View & Mechanical Animation
  otbShroudGroup: THREE.Group;
  plenumGroup: THREE.Group;
  handguardGroup: THREE.Group;
  buttstockGroup: THREE.Group;
  rotaryMagGroup: THREE.Group;
  pumpLinkageGroup: THREE.Group;
  foregripCamGroup: THREE.Group;
  manifoldCoreGroup: THREE.Group;
  customCadGroup: THREE.Group;
  airflowStreamGroup?: THREE.Group;
}

/**
 * Uses `three-bvh-csg` boolean SUBTRACTION to machine a true hollow cylinder
 * with optional radial ventilation / exhaust slots.
 */
function createCsgHollowSlottedTube(params: {
  outerRadius: number;
  innerRadius: number;
  length: number;
  radialSegments?: number;
  slotCount?: number;
  slotWidth?: number;
  slotLength?: number;
  material: THREE.Material;
}): THREE.Mesh {
  const segs = params.radialSegments ?? 24;
  const outerGeo = new THREE.CylinderGeometry(
    params.outerRadius,
    params.outerRadius,
    params.length,
    segs
  );
  outerGeo.rotateX(Math.PI / 2);
  let resultBrush = new Brush(outerGeo);
  resultBrush.updateMatrixWorld();

  const innerGeo = new THREE.CylinderGeometry(
    params.innerRadius,
    params.innerRadius,
    params.length + 0.02,
    segs
  );
  innerGeo.rotateX(Math.PI / 2);
  const innerBrush = new Brush(innerGeo);
  innerBrush.updateMatrixWorld();

  try {
    resultBrush = _csgEvaluator.evaluate(resultBrush, innerBrush, SUBTRACTION);
    const slotCount = params.slotCount ?? 0;
    if (slotCount > 0) {
      const slotW = params.slotWidth ?? params.outerRadius * 0.55;
      const slotL = params.slotLength ?? (params.length * 0.55) / slotCount;
      const startZ = -params.length * 0.36;
      const stepZ = slotCount > 1 ? (params.length * 0.72) / (slotCount - 1) : 0;
      for (let i = 0; i < slotCount; i++) {
        const cutterGeo = new THREE.BoxGeometry(
          params.outerRadius * 2.6,
          slotW,
          slotL
        );
        const cutterBrush = new Brush(cutterGeo);
        cutterBrush.position.set(0, 0, startZ + i * stepZ);
        cutterBrush.updateMatrixWorld();
        resultBrush = _csgEvaluator.evaluate(resultBrush, cutterBrush, SUBTRACTION);
      }
    }
    const mesh = new THREE.Mesh(resultBrush.geometry, params.material);
    mesh.geometry.computeVertexNormals();
    return mesh;
  } catch {
    const fallback = new THREE.Mesh(outerGeo, params.material);
    return fallback;
  }
}

/**
 * Builds an uncovered, high-visibility concentric stack of K-Baffles + Precision Rifled Barrel Liner
 * + Exposed Muzzle Crown & Thread Spigot. Every sub-part is tagged with `subAssemblyId`,
 * `subAssemblyTitle`, and `disassemblyOffset` so sub-component explode and per-sub-component
 * `.STL` generation work with 100% precision.
 */
function populateConcentricBarrelAndSilencerSubcomponents(
  targetGroup: THREE.Group,
  params: {
    barrelLen: number;
    shroudRadius: number;
    caliberMm: number;
    baffleCount: number;
    zCenter: number;
    yCenter: number;
    linerMat: THREE.Material;
    baffleMat: THREE.Material;
    riflingMat: THREE.Material;
  }
) {
  const linerRadius = Math.max(
    0.0068,
    Math.min(params.shroudRadius * 0.48, 0.0055 + (params.caliberMm / 12.7) * 0.008)
  );

  // 1. Precision Inner Rifled Barrel Liner (Extended +8% past shroud so the uncovered barrel & crown protrude visibly!)
  const exposedBarrelLen = params.barrelLen * 1.06;
  const linerGeo = new THREE.CylinderGeometry(
    linerRadius,
    linerRadius * 1.06,
    exposedBarrelLen,
    24
  );
  linerGeo.rotateX(Math.PI / 2);
  const linerMesh = new THREE.Mesh(linerGeo, params.linerMat);
  linerMesh.position.set(0, params.yCenter, params.zCenter - params.barrelLen * 0.03);
  linerMesh.userData = {
    subAssemblyId: `SUB_BARREL_LINER_${Math.round(params.caliberMm * 100)}`,
    subAssemblyTitle: `Precision Cold-Hammer-Forged Rifled Barrel Liner (Ø${params.caliberMm.toFixed(2)}mm Bore · L=${Math.round(params.barrelLen * 1000)}mm)`,
    disassemblyOffset: { x: 0, y: 0.012, z: -0.045 },
  };
  targetGroup.add(linerMesh);

  // Exposed Muzzle Crown & Thread Protector Ring at the front of the uncovered barrel tip
  const muzzleTipZ =
    params.zCenter - params.barrelLen * 0.03 - exposedBarrelLen * 0.5;
  const muzzleCrownCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(
      linerRadius * 1.32,
      linerRadius * 1.32,
      0.018,
      20
    ),
    params.riflingMat
  );
  muzzleCrownCollar.rotation.x = Math.PI / 2;
  muzzleCrownCollar.position.set(0, params.yCenter, muzzleTipZ + 0.009);
  muzzleCrownCollar.userData = {
    subAssemblyId: 'SUB_MUZZLE_THREAD_CROWN',
    subAssemblyTitle: `11° Target Muzzle Crown & Threaded Moderator Spigot (Ø${(linerRadius * 2600).toFixed(1)}mm)`,
    disassemblyOffset: { x: 0, y: 0, z: -0.095 },
  };
  targetGroup.add(muzzleCrownCollar);

  // Dark inner bore hole at muzzle tip
  const boreHoleGeo = new THREE.CylinderGeometry(
    linerRadius * 0.68,
    linerRadius * 0.68,
    exposedBarrelLen * 1.01,
    16
  );
  boreHoleGeo.rotateX(Math.PI / 2);
  const boreHoleMesh = new THREE.Mesh(
    boreHoleGeo,
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 })
  );
  boreHoleMesh.position.set(0, params.yCenter, params.zCenter - params.barrelLen * 0.032);
  boreHoleMesh.userData = {
    subAssemblyId: 'SUB_RIFLED_BORE_CORE',
    subAssemblyTitle: `Internal Polygonal Rifled Bore Channel (Ø${params.caliberMm.toFixed(2)}mm)`,
    disassemblyOffset: { x: 0, y: 0.014, z: -0.05 },
  };
  targetGroup.add(boreHoleMesh);

  // Helical Rifling Lands Indicator Rings along the uncovered barrel liner (Coaxial disassembly — zero vertical sky scatter!)
  const riflingRings = 6;
  for (let r = 0; r < riflingRings; r++) {
    const ringGeo = new THREE.TorusGeometry(linerRadius * 1.08, 0.0016, 10, 20);
    const ringMesh = new THREE.Mesh(ringGeo, params.riflingMat);
    const zPos =
      params.zCenter +
      params.barrelLen * 0.36 -
      (r / Math.max(1, riflingRings - 1)) * (params.barrelLen * 0.78);
    ringMesh.position.set(0, params.yCenter, zPos);
    ringMesh.userData = {
      subAssemblyId: `SUB_RIFLING_LAND_RING_0${r + 1}`,
      subAssemblyTitle: `Helical Rifling Land & Twist Harmonics Ring #0${r + 1}`,
      disassemblyOffset: {
        x: 0,
        y: 0.008,
        z: (0.5 - r / riflingRings) * 0.035,
      },
    };
    targetGroup.add(ringMesh);
  }

  // 2. Concentric Internal Silencer / Moderator K-Baffle Stack positioned at the front muzzle third (Strictly Coaxial Z-Axis Telescoping!)
  const baffleOuterR = params.shroudRadius * 0.84;
  const baffleConeLen = Math.min(
    0.026,
    (params.barrelLen * 0.38) / Math.max(1, params.baffleCount)
  );
  const startBaffleZ = params.zCenter - params.barrelLen * 0.16;
  const stepBaffleZ =
    (params.barrelLen * 0.32) / Math.max(1, params.baffleCount);

  for (let b = 0; b < params.baffleCount; b++) {
    const kBaffleGeo = new THREE.ConeGeometry(
      baffleOuterR,
      baffleConeLen,
      20,
      1,
      true
    );
    kBaffleGeo.rotateX(-Math.PI / 2);
    const kBaffleMesh = new THREE.Mesh(kBaffleGeo, params.baffleMat);
    kBaffleMesh.position.set(
      0,
      params.yCenter,
      startBaffleZ - b * stepBaffleZ
    );
    kBaffleMesh.userData = {
      subAssemblyId: `SUB_K_BAFFLE_CONE_0${b + 1}`,
      subAssemblyTitle: `7075-T6 Angled K-Baffle Stripper Cone #0${b + 1} (OD Ø${(baffleOuterR * 2000).toFixed(1)}mm)`,
      disassemblyOffset: {
        x: 0,
        y: 0,
        z: -0.025 - b * 0.018,
      },
    };
    targetGroup.add(kBaffleMesh);

    const spacerGeo = new THREE.CylinderGeometry(
      baffleOuterR,
      baffleOuterR,
      0.0045,
      20
    );
    spacerGeo.rotateX(Math.PI / 2);
    const spacerMesh = new THREE.Mesh(spacerGeo, params.baffleMat);
    spacerMesh.position.set(
      0,
      params.yCenter,
      startBaffleZ - b * stepBaffleZ + baffleConeLen * 0.45
    );
    spacerMesh.userData = {
      subAssemblyId: `SUB_BAFFLE_SPACER_0${b + 1}`,
      subAssemblyTitle: `Moderator Expansion Chamber Spacer Ring #0${b + 1}`,
      disassemblyOffset: {
        x: 0,
        y: 0,
        z: -0.02 - b * 0.016,
      },
    };
    targetGroup.add(spacerMesh);
  }
}

/**
 * Builds a single .45 Cal Sabot Cartridge (either 220gr Copper/Blue-Tip Boattail Slug
 * matching the user's P90 photo OR Clear/Blue 6-Pellet Sabot Buckshot).
 * Oriented along the Z-axis by default (`rotation.y = Math.PI / 2` makes it transverse!).
 */
function createP90SabotCartridgeMesh(params: {
  payloadType: P90AmmoPayloadType;
  brassMat: THREE.Material;
  copperMat: THREE.Material;
  blueTipMat: THREE.Material;
  clearSabotMat: THREE.Material;
  leadShotMat: THREE.Material;
}): THREE.Group {
  const g = new THREE.Group();

  // Rear Brass/Anodized Sabot Carrier Base Sleeve
  const caseGeo = new THREE.CylinderGeometry(0.0072, 0.0075, 0.032, 14);
  caseGeo.rotateX(Math.PI / 2);
  const caseMesh = new THREE.Mesh(
    caseGeo,
    params.payloadType === 'SABOT_45_BUCKSHOT_6PELLET'
      ? params.clearSabotMat
      : params.brassMat
  );
  g.add(caseMesh);

  if (params.payloadType === 'SABOT_45_BUCKSHOT_6PELLET') {
    // 6 Dark #1 Buckshot Spheres inside the Clear Delrin/Polycarbonate Sabot + Blue Wad Cap
    for (let i = 0; i < 4; i++) {
      const pellet = new THREE.Mesh(
        new THREE.SphereGeometry(0.0038, 8, 8),
        params.leadShotMat
      );
      pellet.position.set(
        (i % 2 === 0 ? -1 : 1) * 0.0022,
        0,
        -0.01 + i * 0.006
      );
      g.add(pellet);
    }
    const blueCapGeo = new THREE.CylinderGeometry(0.0068, 0.0072, 0.008, 12);
    blueCapGeo.rotateX(Math.PI / 2);
    const blueCap = new THREE.Mesh(blueCapGeo, params.blueTipMat);
    blueCap.position.set(0, 0, -0.019);
    g.add(blueCap);
  } else {
    // Copper-jacketed .45 Boattail Slug Ogive + Blue Ballistic Tip (matching the P90 photo!)
    const ogiveGeo = new THREE.ConeGeometry(0.0065, 0.015, 14);
    ogiveGeo.rotateX(-Math.PI / 2);
    const ogiveMesh = new THREE.Mesh(ogiveGeo, params.copperMat);
    ogiveMesh.position.set(0, 0, -0.022);
    g.add(ogiveMesh);

    const tipGeo = new THREE.ConeGeometry(0.0032, 0.007, 12);
    tipGeo.rotateX(-Math.PI / 2);
    const tipMesh = new THREE.Mesh(tipGeo, params.blueTipMat);
    tipMesh.position.set(0, 0, -0.029);
    g.add(tipMesh);
  }

  return g;
}

/**
 * Builds the 4-component Burst Disk Fitting Sub-Assembly (`fitting body`, `burst disk`,
 * `retainer` with radial exhaust ports, and `fluid system` pressure column)
 * matching `/assets/aistudio/image_59e3a409.png`.
 */
function buildBurstDiskSubAssemblyNodes(params: {
  scale: number;
  zOffset: number;
  yOffset: number;
  fittingBodyGroup: THREE.Group;
  burstDiskGroup: THREE.Group;
  retainerGroup: THREE.Group;
  fluidSystemGroup: THREE.Group;
  xrayMode: boolean;
}) {
  const s = params.scale;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.25,
    metalness: 0.88,
    transparent: params.xrayMode,
    opacity: params.xrayMode ? 0.36 : 1.0,
  });

  const goldBurstDiskMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.94,
  });

  const retainerMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.28,
    metalness: 0.85,
    transparent: params.xrayMode,
    opacity: params.xrayMode ? 0.48 : 1.0,
  });

  const fluidSystemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.82,
  });

  // 1. FITTING BODY
  const lathePoints = [
    new THREE.Vector2(0.014 * s, -0.065 * s),
    new THREE.Vector2(0.032 * s, -0.065 * s),
    new THREE.Vector2(0.032 * s, -0.015 * s),
    new THREE.Vector2(0.042 * s, -0.015 * s),
    new THREE.Vector2(0.042 * s, 0.055 * s),
    new THREE.Vector2(0.018 * s, 0.055 * s),
    new THREE.Vector2(0.018 * s, -0.012 * s),
    new THREE.Vector2(0.014 * s, -0.022 * s),
  ];
  const fittingLatheGeo = new THREE.LatheGeometry(lathePoints, 24);
  fittingLatheGeo.rotateX(Math.PI / 2);
  const fittingMesh = new THREE.Mesh(fittingLatheGeo, bodyMat);
  fittingMesh.position.set(0, params.yOffset, params.zOffset + 0.02 * s);
  params.fittingBodyGroup.add(fittingMesh);

  const hexShoulderGeo = new THREE.CylinderGeometry(
    0.045 * s,
    0.045 * s,
    0.032 * s,
    6
  );
  hexShoulderGeo.rotateX(Math.PI / 2);
  const hexShoulderMesh = new THREE.Mesh(hexShoulderGeo, bodyMat);
  hexShoulderMesh.position.set(0, params.yOffset, params.zOffset + 0.045 * s);
  params.fittingBodyGroup.add(hexShoulderMesh);

  // 2. BURST DISK
  const diskRingGeo = new THREE.CylinderGeometry(
    0.027 * s,
    0.027 * s,
    0.005 * s,
    24
  );
  diskRingGeo.rotateX(Math.PI / 2);
  const diskRingMesh = new THREE.Mesh(diskRingGeo, goldBurstDiskMat);
  diskRingMesh.position.set(0, params.yOffset, params.zOffset - 0.018 * s);
  params.burstDiskGroup.add(diskRingMesh);

  const domeGeo = new THREE.SphereGeometry(
    0.018 * s,
    18,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.45
  );
  domeGeo.rotateX(-Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, goldBurstDiskMat);
  domeMesh.position.set(0, params.yOffset, params.zOffset - 0.019 * s);
  params.burstDiskGroup.add(domeMesh);

  // 3. RETAINER
  const retainerTube = createCsgHollowSlottedTube({
    outerRadius: 0.028 * s,
    innerRadius: 0.015 * s,
    length: 0.052 * s,
    radialSegments: 20,
    slotCount: 1,
    slotWidth: 0.014 * s,
    slotLength: 0.022 * s,
    material: retainerMat,
  });
  retainerTube.position.set(0, params.yOffset, params.zOffset - 0.048 * s);
  params.retainerGroup.add(retainerTube);

  for (const side of [-1, 1]) {
    const radialJetGeo = new THREE.CylinderGeometry(
      0.005 * s,
      0.009 * s,
      0.038 * s,
      12
    );
    radialJetGeo.rotateZ((side * Math.PI) / 2);
    const radialJetMesh = new THREE.Mesh(radialJetGeo, fluidSystemMat);
    radialJetMesh.position.set(
      side * 0.036 * s,
      params.yOffset,
      params.zOffset - 0.048 * s
    );
    params.retainerGroup.add(radialJetMesh);
  }

  // 4. FLUID SYSTEM
  const fluidCoreGeo = new THREE.CylinderGeometry(
    0.016 * s,
    0.016 * s,
    0.095 * s,
    18
  );
  fluidCoreGeo.rotateX(Math.PI / 2);
  const fluidCoreMesh = new THREE.Mesh(fluidCoreGeo, fluidSystemMat);
  fluidCoreMesh.position.set(0, params.yOffset, params.zOffset + 0.042 * s);
  params.fluidSystemGroup.add(fluidCoreMesh);
}

/**
 * Infers the default Weapon3DFamilyContext when not explicitly supplied.
 */
export function inferWeapon3DFamilyContext(
  loadout: WeaponBuildLoadout
): Weapon3DFamilyContext {
  if (
    loadout.buttstockTankId === 'buttstock_texoma_red_pen_lslot' ||
    loadout.id.includes('pen')
  ) {
    return {
      familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      p90Payload: 'SLUG_45_BOATTAIL_220GR',
    };
  }
  if (loadout.otbShroudId === 'otb_cane_6barrel_insert_kit') {
    return {
      familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
      burstStage: 'STAGE_4_CONCEALED_AIRGUN_CANE',
      rexMode: 'REX_P_PISTOL_1SHOT',
      p90Payload: 'SLUG_45_BOATTAIL_220GR',
    };
  }
  if (
    loadout.modularPlenumId === 'plenum_aea_red_burst_cartridges' ||
    loadout.otbShroudId === 'otb_aea_harpoon_twin_tubes' ||
    loadout.weaponClass === 'AIR_SHOTGUN'
  ) {
    return {
      familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
      burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
      rexMode: 'REX_P_PISTOL_1SHOT',
      p90Payload: 'SLUG_45_BOATTAIL_220GR',
    };
  }
  if (
    loadout.firingValveId === 'valve_rexp_coaxial_poppet_32' ||
    loadout.firingValveId === 'valve_evanix_rex_underlever_guard' ||
    loadout.handguardId === 'handguard_evanix_rex_slotted' ||
    loadout.buttstockTankId === 'buttstock_evanix_rex_crosshatch' ||
    loadout.id.includes('rexp')
  ) {
    const isSniper =
      loadout.otbShroudId === 'otb_fx_drs_307' ||
      loadout.buttstockExtensionId === 'ext_leshiy_carbon_350';
    return {
      familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: isSniper ? 'REX_SNIPER_CARBINE_MODERATED' : 'REX_P_PISTOL_1SHOT',
      p90Payload: 'SLUG_45_BOATTAIL_220GR',
    };
  }
  if (
    loadout.foregripBottleId === 'foregrip_evanix_mp30_vertical_gauge' ||
    loadout.handguardId === 'handguard_evanix_mp30_chevron'
  ) {
    return {
      familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      p90Payload: 'SLUG_45_BOATTAIL_220GR',
    };
  }
  return {
    familyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    p90Payload: 'SLUG_45_BOATTAIL_220GR',
  };
}

/**
 * Builds an engineering-accurate, family-specific 3D CAD assembly (`ModularWeapon3DRefs`)
 * using CSG boolean operations (`three-bvh-csg`), `LatheGeometry`, and concentric sub-components.
 */
export function buildModularAirgunMesh(
  loadout: WeaponBuildLoadout,
  xrayGasMode: boolean = false,
  customCaliberMm: number = 6.35,
  explicitContext?: Weapon3DFamilyContext
): ModularWeapon3DRefs {
  const familyContext = explicitContext ?? inferWeapon3DFamilyContext(loadout);
  const { familyId, burstStage, rexMode } = familyContext;
  const p90Payload: P90AmmoPayloadType =
    familyContext.p90Payload ??
    familyContext.p90AmmoType ??
    'SLUG_45_BOATTAIL_220GR';

  const root = new THREE.Group();
  const otbShroudGroup = new THREE.Group();
  const plenumGroup = new THREE.Group();
  const handguardGroup = new THREE.Group();
  const buttstockGroup = new THREE.Group();
  const rotaryMagGroup = new THREE.Group();
  const pumpLinkageGroup = new THREE.Group();
  const foregripCamGroup = new THREE.Group();
  const manifoldCoreGroup = new THREE.Group();
  const customCadGroup = new THREE.Group();
  const airflowStreamGroup = new THREE.Group();

  otbShroudGroup.userData = {
    subAssemblyId: 'OTB_SHROUD_AND_BARREL',
    subAssemblyTitle: '01/02. Concentric Barrel, Silencer Baffles & OTB Shroud',
  };
  plenumGroup.userData = {
    subAssemblyId: 'PLENUM_AND_VALVE',
    subAssemblyTitle: '03/07. Regulated Plenum, Poppet/Plug Valve & Transfer Port',
  };
  handguardGroup.userData = {
    subAssemblyId: 'OPTIC_AND_RAILS',
    subAssemblyTitle: 'Cantilever Scope Mount, Upper Rail & Inner Shroud',
  };
  buttstockGroup.userData = {
    subAssemblyId: 'REAR_RESERVOIR_STOCK',
    subAssemblyTitle: '04. Rear 250-Bar Coaxial Air Tube, Manometer & Buttstock',
  };
  rotaryMagGroup.userData = {
    subAssemblyId: 'BREECH_MAGAZINE_TURRET',
    subAssemblyTitle: '08. Breech Magazine / P90 90° Helical Turret / Axial Slide',
  };
  pumpLinkageGroup.userData = {
    subAssemblyId: 'ONBOARD_3STAGE_PUMP',
    subAssemblyTitle: '06. Onboard 3-Stage Telescopic Pump & Linkage',
  };
  foregripCamGroup.userData = {
    subAssemblyId: 'FOREGRIP_AND_BIPOD',
    subAssemblyTitle: '05. Pressurized Foregrip Bottle / Bow Grip / Bipod',
  };
  manifoldCoreGroup.userData = {
    subAssemblyId: 'RECEIVER_AND_SEALS',
    subAssemblyTitle: 'Monolithic CNC Receiver Block & High-Pressure Breech O-Rings',
  };
  customCadGroup.userData = {
    subAssemblyId: 'BOLT_PROBE_OR_MOD',
    subAssemblyTitle: 'Reciprocating Sealing Probe Bolt / Sniper Reflex Moderator',
  };

  // Populate 28 High-Pressure Gas Streamline Particles for Live 3D Air Flow Inspection
  const gasParticleGeo = new THREE.SphereGeometry(0.0085, 10, 10);
  for (let pIdx = 0; pIdx < 28; pIdx++) {
    const isHighEnergyCore = pIdx % 3 === 0;
    const gasMat = new THREE.MeshStandardMaterial({
      color: isHighEnergyCore ? 0xfbbf24 : 0x38bdf8,
      emissive: isHighEnergyCore ? 0xf59e0b : 0x0284c7,
      emissiveIntensity: 1.35,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92,
    });
    const pMesh = new THREE.Mesh(gasParticleGeo, gasMat);
    pMesh.userData = { tOffset: pIdx / 28 };
    airflowStreamGroup.add(pMesh);
  }

  root.add(
    otbShroudGroup,
    plenumGroup,
    handguardGroup,
    buttstockGroup,
    rotaryMagGroup,
    pumpLinkageGroup,
    foregripCamGroup,
    manifoldCoreGroup,
    customCadGroup,
    airflowStreamGroup
  );

  // Calibrated Studio Cutaway PBR Materials (Uncovered Barrel Visibility — Shrouds & Jackets are Cutaway/Translucent so Inner Barrels are ALWAYS Visible!)
  const outerShroudGlassOrMetalMat = new THREE.MeshStandardMaterial({
    color: xrayGasMode ? 0x38bdf8 : 0x475569,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: xrayGasMode ? 0.18 : 0.28,
    depthWrite: false,
  });

  const receiverMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(loadout.finishColorHex || '#334155'),
    emissive: 0x0f172a,
    emissiveIntensity: 0.35,
    roughness: 0.38,
    metalness: 0.58,
    transparent: xrayGasMode,
    opacity: xrayGasMode ? 0.32 : 1.0,
    depthWrite: !xrayGasMode,
  });

  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0x334155,
    emissiveIntensity: 0.22,
    roughness: 0.14,
    metalness: 0.94,
  });

  const darkGunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    emissive: 0x1e293b,
    emissiveIntensity: 0.28,
    roughness: 0.36,
    metalness: 0.65,
  });

  const crimsonAnodizedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.22,
    metalness: 0.88,
    transparent: xrayGasMode,
    opacity: xrayGasMode ? 0.34 : 1.0,
    depthWrite: !xrayGasMode,
  });

  const bronzeBarrelMat = new THREE.MeshStandardMaterial({
    color: 0x78553a,
    roughness: 0.24,
    metalness: 0.78,
    transparent: true,
    opacity: xrayGasMode ? 0.22 : 0.36,
    depthWrite: false,
  });

  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: xrayGasMode ? 0xb45309 : 0x000000,
    emissiveIntensity: xrayGasMode ? 0.4 : 0,
    roughness: 0.22,
    metalness: 0.9,
  });

  const hpaFluidGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: xrayGasMode ? 0.75 : 0.25,
    roughness: 0.2,
    metalness: 0.4,
    transparent: true,
    opacity: xrayGasMode ? 0.78 : 0.9,
  });

  const silencerBaffleMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: xrayGasMode ? 0xd97706 : 0x000000,
    emissiveIntensity: xrayGasMode ? 0.5 : 0.1,
    roughness: 0.25,
    metalness: 0.85,
  });

  // ==========================================================================
  // FAMILY 0: P90_45_TOP_HELICAL_PLENUM_FAMILY (#07 THE P50 — .50 CAL P90-STYLE AUTOMATIC)
  // (.50 Cal / 12.7mm P90-Style Full-Auto Bullpup with 4 Interconnected 250-Bar Air Reserves:
  //  1. Reserve in the MAG [145cc twin spine tubes + M14x1.25 dry-break stinger],
  //  2. Reserve in the BARREL [160cc concentric Over-the-Barrel annular jacket around .50 silencer],
  //  3. Reserve in the BUTTSTOCK [280cc dual rear cylinders + full-auto blowback plenum],
  //  4. Reserve in the FOREGRIP [120cc pressurized front foregrip bottle],
  //  + Folding Twin-Leg Tactical Bipod + Coaxial Tactical Laser Sight with 3D Laser Beam)
  // ==========================================================================
  if (familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
    const p50BarrelOpt = familyContext.p50BarrelOptionId || 'BRL_50CAL_160CC';
    const barrelLen =
      p50BarrelOpt === 'BRL_50CAL_EXT_220CC'
        ? 0.76
        : p50BarrelOpt === 'BRL_30CAL_85CC'
        ? 0.54
        : 0.62;
    const boreAxisY = 0.032;
    const silencerRadius = p50BarrelOpt === 'BRL_30CAL_85CC' ? 0.020 : 0.024;
    const outerAirRadius =
      p50BarrelOpt === 'BRL_50CAL_EXT_220CC'
        ? 0.044
        : p50BarrelOpt === 'BRL_30CAL_85CC'
        ? 0.031
        : 0.038;
    const p50ResolvedCaliberMm =
      p50BarrelOpt === 'BRL_30CAL_85CC' ? 7.62 : Math.max(11.43, customCaliberMm);

    // 1. RESERVE #2 (IN THE BARREL): Screw-On Quick-Change Coaxial Over-the-Barrel HPA Reserve (.30 85cc / .50 160cc / .50 Ext 220cc)
    const innerSilencerShroud = createCsgHollowSlottedTube({
      outerRadius: silencerRadius,
      innerRadius: silencerRadius * 0.76,
      length: barrelLen * 0.96,
      radialSegments: 24,
      slotCount: 4,
      slotWidth: 0.011,
      slotLength: 0.034,
      material: bronzeBarrelMat,
    });
    innerSilencerShroud.position.set(0, boreAxisY, -barrelLen * 0.44);
    handguardGroup.add(innerSilencerShroud);

    populateConcentricBarrelAndSilencerSubcomponents(handguardGroup, {
      barrelLen,
      shroudRadius: silencerRadius * 0.9,
      caliberMm: p50ResolvedCaliberMm,
      baffleCount: p50BarrelOpt === 'BRL_50CAL_EXT_220CC' ? 8 : 6,
      zCenter: -barrelLen * 0.44,
      yCenter: boreAxisY,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    const outerOtbAirTube = createCsgHollowSlottedTube({
      outerRadius: outerAirRadius,
      innerRadius: silencerRadius * 1.05,
      length: barrelLen * 0.78,
      radialSegments: 26,
      slotCount: 3,
      slotWidth: 0.012,
      slotLength: 0.042,
      material: outerShroudGlassOrMetalMat,
    });
    outerOtbAirTube.position.set(0, boreAxisY, -barrelLen * 0.41);
    outerOtbAirTube.userData = {
      subAssemblyId: 'P50_RESERVE_2_BARREL',
      subAssemblyTitle: `P50 Screw-On Barrel Reserve (${p50BarrelOpt}): 250-Bar Quick-Change Coaxial Air Jacket`,
    };
    otbShroudGroup.add(outerOtbAirTube);

    // Visible M32×1.5 Quick-Change Barrel Reserve Threads at the Receiver Tenon
    for (let th = 0; th < 5; th++) {
      const m32ThreadRing = new THREE.Mesh(
        new THREE.TorusGeometry(outerAirRadius * 0.86, 0.0016, 8, 24),
        goldBrassMat
      );
      m32ThreadRing.position.set(0, boreAxisY, -0.025 - th * 0.0065);
      otbShroudGroup.add(m32ThreadRing);
    }

    // Glowing High-Pressure Annular Air Column inside the Screw-On Barrel Reserve Jacket
    const barrelReserveGlowGeo = new THREE.CylinderGeometry(
      outerAirRadius * 0.91,
      outerAirRadius * 0.91,
      barrelLen * 0.72,
      24,
      1,
      true
    );
    barrelReserveGlowGeo.rotateX(Math.PI / 2);
    const barrelReserveGlow = new THREE.Mesh(barrelReserveGlowGeo, hpaFluidGlowMat);
    barrelReserveGlow.position.set(0, boreAxisY, -barrelLen * 0.41);
    otbShroudGroup.add(barrelReserveGlow);

    // Front & Rear Titanium Bulkhead Caps for the Screw-On Barrel Reserve
    for (const zBulkhead of [-barrelLen * 0.79, -0.03]) {
      const bulkheadCap = new THREE.Mesh(
        new THREE.CylinderGeometry(outerAirRadius * 1.02, outerAirRadius * 1.02, 0.022, 24),
        brushedSteelMat
      );
      bulkheadCap.rotation.x = Math.PI / 2;
      bulkheadCap.position.set(0, boreAxisY, zBulkhead);
      otbShroudGroup.add(bulkheadCap);
    }

    // 2. COAXIAL TACTICAL LASER SIGHT MODULE + VISIBLE 3D LASER BEAM (Mounted on Front Shroud / Optic Bridge)
    const laserPodBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, 0.022, 0.078),
      darkGunmetalMat
    );
    laserPodBody.position.set(0.034, boreAxisY + 0.016, -0.38);
    laserPodBody.userData = {
      subAssemblyId: 'P50_COAXIAL_LASER',
      subAssemblyTitle: 'P50 Coaxial 650nm Tactical Laser Sight Module (Windage/Elevation Zeroed)',
    };
    handguardGroup.add(laserPodBody);

    const laserEmitterMat = new THREE.MeshStandardMaterial({
      color: 0xff1133,
      emissive: 0xff0022,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.92,
    });
    const laserLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0055, 0.0055, 0.008, 14),
      laserEmitterMat
    );
    laserLens.rotation.x = Math.PI / 2;
    laserLens.position.set(0.034, boreAxisY + 0.016, -0.422);
    handguardGroup.add(laserLens);

    const laserBeamMat = new THREE.MeshStandardMaterial({
      color: 0xff1133,
      emissive: 0xff0022,
      emissiveIntensity: 1.6,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const laserBeamGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.65, 10);
    laserBeamGeo.rotateX(Math.PI / 2);
    const laserBeamMesh = new THREE.Mesh(laserBeamGeo, laserBeamMat);
    laserBeamMesh.position.set(0.034, boreAxisY + 0.016, -0.75);
    handguardGroup.add(laserBeamMesh);

    // 3. TOP-MOUNTED P90 HORIZONTAL SMOKED POLYCARBONATE MAGAZINE + 90° HELICAL BREECH TURRET (rotaryMagGroup)
    const smokedPolyMat = new THREE.MeshStandardMaterial({
      color: 0x785532,
      emissive: 0x3b2510,
      emissiveIntensity: 0.35,
      roughness: 0.16,
      metalness: 0.15,
      transparent: true,
      opacity: 0.68,
    });
    const copperSlugMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.32,
      roughness: 0.2,
      metalness: 0.9,
    });
    const bluePolymerTipMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    });
    const clearSabotMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.15,
      transparent: true,
      opacity: 0.78,
    });

    const p90SpineLen = 0.48;
    const p90SpineWidth = 0.086;
    const p90SpineHeight = 0.038;
    const magY = 0.088;
    const magCenterZ = -0.09;
    const turretZ = 0.165;

    const polyBoxGeo = new THREE.BoxGeometry(
      p90SpineWidth,
      p90SpineHeight,
      p90SpineLen
    );
    const polyBoxMesh = new THREE.Mesh(polyBoxGeo, smokedPolyMat);
    polyBoxMesh.position.set(0, magY, magCenterZ);
    rotaryMagGroup.add(polyBoxMesh);

    for (const xEdge of [-p90SpineWidth * 0.49, p90SpineWidth * 0.49]) {
      const edgeRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.005, 0.006, p90SpineLen),
        goldBrassMat
      );
      edgeRail.position.set(xEdge, magY + p90SpineHeight * 0.48, magCenterZ);
      rotaryMagGroup.add(edgeRail);
    }

    for (const xRib of [-0.016, 0.016]) {
      const ribGeo = new THREE.BoxGeometry(0.0038, 0.004, p90SpineLen * 0.92);
      const ribMesh = new THREE.Mesh(ribGeo, goldBrassMat);
      ribMesh.position.set(xRib, magY + p90SpineHeight * 0.52, magCenterZ);
      rotaryMagGroup.add(ribMesh);

      for (let t = 0; t < 6; t++) {
        const tickGeo = new THREE.BoxGeometry(0.014, 0.004, 0.004);
        const tickMesh = new THREE.Mesh(tickGeo, goldBrassMat);
        tickMesh.position.set(
          xRib,
          magY + p90SpineHeight * 0.52,
          magCenterZ + 0.18 - t * 0.068
        );
        rotaryMagGroup.add(tickMesh);
      }
    }

    const followerFrontZ = magCenterZ - p90SpineLen * 0.45;
    const followerRearZ = magCenterZ + p90SpineLen * 0.36;
    const followerPiston = new THREE.Mesh(
      new THREE.BoxGeometry(p90SpineWidth * 0.84, p90SpineHeight * 0.72, 0.022),
      crimsonAnodizedMat
    );
    followerPiston.position.set(0, magY, followerFrontZ);
    followerPiston.userData = {
      isP50SpineFollower: true,
      followerBaseZ: followerFrontZ,
      zFront: followerFrontZ,
      zRear: followerRearZ,
      subAssemblyId: 'P50_NITINOL_FOLLOWER',
      subAssemblyTitle: 'P50 Zero-G Nitinol Constant-Force Spring & 5-Bar Pneumatic Follower',
    };
    rotaryMagGroup.add(followerPiston);

    // Nitinol Constant-Force Guide Spring Coil behind the Follower Piston
    const nitinolGuideBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.0045, p90SpineLen * 0.88, 12),
      goldBrassMat
    );
    nitinolGuideBar.rotation.x = Math.PI / 2;
    nitinolGuideBar.position.set(0, magY, magCenterZ);
    rotaryMagGroup.add(nitinolGuideBar);

    const stackedRoundsToRender = 14;
    for (let i = 0; i < stackedRoundsToRender; i++) {
      const roundGroup = createP90SabotCartridgeMesh({
        payloadType: p90Payload,
        brassMat: goldBrassMat,
        copperMat: copperSlugMat,
        blueTipMat: bluePolymerTipMat,
        clearSabotMat,
        leadShotMat: darkGunmetalMat,
      });
      roundGroup.scale.setScalar(1.22);
      roundGroup.rotation.y = Math.PI / 2;
      const staggerX = (i % 2 === 0 ? -1 : 1) * 0.007;
      const staggerY = magY + (i % 2 === 0 ? 0.005 : -0.005);
      const posZ = magCenterZ - p90SpineLen * 0.39 + i * 0.028;
      roundGroup.position.set(staggerX, staggerY, posZ);
      roundGroup.userData = {
        isP50SpineSlug: true,
        slugIndex: i, // 0 = frontmost (empties first), 13 = rearmost (nearest turret)
        slugSlotIndex: i,
        totalVisibleSlugs: stackedRoundsToRender,
        totalSpineSlots: stackedRoundsToRender,
        baseX: staggerX,
        baseY: staggerY,
        baseZ: posZ,
      };
      rotaryMagGroup.add(roundGroup);
    }

    // 4. REAR CIRCULAR 90° HELICAL ROTATION TURRET + DROP-IN BREECH FEED THROAT
    const turretRadius = 0.048;
    const turretThickY = 0.044;

    const turretOuterHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(turretRadius, turretRadius * 0.96, turretThickY, 32),
      darkGunmetalMat
    );
    turretOuterHousing.position.set(0, magY - 0.008, turretZ);
    rotaryMagGroup.add(turretOuterHousing);

    const turretWindowDisk = new THREE.Mesh(
      new THREE.CylinderGeometry(turretRadius * 0.88, turretRadius * 0.88, 0.006, 28),
      smokedPolyMat
    );
    turretWindowDisk.position.set(0, magY + 0.016, turretZ);
    rotaryMagGroup.add(turretWindowDisk);

    const helicalRampRing = new THREE.Mesh(
      new THREE.TorusGeometry(turretRadius * 0.68, 0.0065, 14, 28, Math.PI * 1.55),
      goldBrassMat
    );
    helicalRampRing.rotation.x = Math.PI / 2;
    helicalRampRing.position.set(0, magY - 0.004, turretZ);
    rotaryMagGroup.add(helicalRampRing);

    const dropInBreechChute = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.056, 0.068),
      outerShroudGlassOrMetalMat
    );
    dropInBreechChute.position.set(0, (magY + boreAxisY) * 0.5, turretZ);
    rotaryMagGroup.add(dropInBreechChute);

    // Hermetic Cam Elevator Push-Down Finger (positively drives the 90°-rotated round down -56mm in zero-G/underwater)
    const elevatorFingerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.014, 0.036),
      crimsonAnodizedMat
    );
    elevatorFingerMesh.position.set(0, magY + 0.012, turretZ - 0.008);
    elevatorFingerMesh.userData = {
      isP50ElevatorFinger: true,
      baseY: magY + 0.012,
      topY: magY + 0.012,
      bottomY: boreAxisY + 0.014,
      baseZ: turretZ - 0.008,
    };
    rotaryMagGroup.add(elevatorFingerMesh);

    for (const [stepIdx, rotAngle] of [Math.PI / 3, Math.PI / 6].entries()) {
      const rampRound = createP90SabotCartridgeMesh({
        payloadType: p90Payload,
        brassMat: goldBrassMat,
        copperMat: copperSlugMat,
        blueTipMat: bluePolymerTipMat,
        clearSabotMat,
        leadShotMat: darkGunmetalMat,
      });
      rampRound.scale.setScalar(1.26);
      rampRound.rotation.y = rotAngle;
      rampRound.position.set(
        0,
        magY + 0.008 - stepIdx * 0.014,
        turretZ - 0.022 + stepIdx * 0.01
      );
      rotaryMagGroup.add(rampRound);
    }

    // Active 6-Phase Cycling Round: Rotates 90° -> Pushes Down (-56mm) -> Cycles Forward into Chamber -> Seals -> Fires!
    const axialBreechChamberedRound = createP90SabotCartridgeMesh({
      payloadType: p90Payload,
      brassMat: goldBrassMat,
      copperMat: copperSlugMat,
      blueTipMat: bluePolymerTipMat,
      clearSabotMat,
      leadShotMat: darkGunmetalMat,
    });
    axialBreechChamberedRound.scale.setScalar(1.32);
    axialBreechChamberedRound.rotation.y = 0;
    axialBreechChamberedRound.position.set(0, boreAxisY, turretZ - 0.01);
    axialBreechChamberedRound.userData = {
      isP50ActiveCyclingRound: true,
      magY: magY + 0.004,
      boreY: boreAxisY,
      turretZ: turretZ - 0.01,
      turretTopY: magY + 0.004,
      breechSaddleY: boreAxisY,
      turretEntryZ: turretZ - 0.01,
      chamberSeatedZ: turretZ - 0.048,
    };
    rotaryMagGroup.add(axialBreechChamberedRound);

    // 5. RECIPROCATING STAINLESS HOLLOW-PROBE SEALING BOLT + FULL-AUTO BLOWBACK OP-ROD (customCadGroup)
    const hollowProbeGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.115, 20);
    hollowProbeGeo.rotateX(Math.PI / 2);
    const hollowProbeBolt = new THREE.Mesh(hollowProbeGeo, brushedSteelMat);
    hollowProbeBolt.position.set(0, boreAxisY, turretZ + 0.055);
    customCadGroup.add(hollowProbeBolt);

    const boltCarrierBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.038, 0.085),
      brushedSteelMat
    );
    boltCarrierBlock.position.set(0, boreAxisY, turretZ + 0.105);
    customCadGroup.add(boltCarrierBlock);

    const redSealMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });
    for (const zProbeOring of [turretZ + 0.008, turretZ + 0.026]) {
      const probeOring = new THREE.Mesh(
        new THREE.TorusGeometry(0.012, 0.0028, 12, 24),
        redSealMat
      );
      probeOring.position.set(0, boreAxisY, zProbeOring);
      customCadGroup.add(probeOring);
    }

    // 6. RESERVE #1 (IN THE MAG): 145cc 250-BAR TWIN MAGAZINE SPINE AIR RESERVE + EXTENDED PLENUM DUAL DRY-BREAK STINGERS
    for (const sideX of [-0.032, 0.032]) {
      const magReserveTubeGeo = new THREE.CylinderGeometry(
        0.0125,
        0.0125,
        p90SpineLen * 0.94,
        18
      );
      magReserveTubeGeo.rotateX(Math.PI / 2);
      const magReserveTube = new THREE.Mesh(magReserveTubeGeo, hpaFluidGlowMat);
      magReserveTube.position.set(sideX, magY - 0.025, magCenterZ);
      magReserveTube.userData = {
        subAssemblyId: 'P50_RESERVE_1_MAG',
        subAssemblyTitle: 'P50 Reserve #1 (Mag): 145cc 250-Bar Twin Magazine Spine HPA Tubes (Feeds Extended Plenum)',
      };
      rotaryMagGroup.add(magReserveTube);
    }

    // Dual M14×1.25 Self-Sealing Dry-Break Stingers coupling Top Mag Spine directly into Extended Plenum Supply
    for (const zStinger of [-0.045, 0.065]) {
      const dryBreakStinger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.088, 20),
        goldBrassMat
      );
      dryBreakStinger.position.set(0, 0.018, zStinger);
      dryBreakStinger.userData = {
        subAssemblyId: 'P50_MAG_EXTENDED_PLENUM_STINGER',
        subAssemblyTitle: 'P50 Mag-to-Extended-Plenum M14×1.25 Dry-Break Supply Coupler',
      };
      plenumGroup.add(dryBreakStinger);
    }

    // Lower Regulated 110cc Extended Supply Plenum Vessel + Balanced Poppet + Vertical Ø10.8mm .50 Transfer Port
    const lowerPlenumCylinderGeo = new THREE.CylinderGeometry(0.029, 0.029, 0.31, 24);
    lowerPlenumCylinderGeo.rotateX(Math.PI / 2);
    const lowerPlenumCylinder = new THREE.Mesh(lowerPlenumCylinderGeo, hpaFluidGlowMat);
    lowerPlenumCylinder.position.set(0, -0.026, 0.065);
    lowerPlenumCylinder.userData = {
      subAssemblyId: 'P50_EXTENDED_SUPPLY_PLENUM',
      subAssemblyTitle: 'P50 110cc 200-Bar Extended Regulated Plenum (Fed by Grip->Barrel->Buttstock + Mag Spine)',
    };
    plenumGroup.add(lowerPlenumCylinder);

    // Coaxial Grip-to-Barrel Reserve Fill Riser Conduit (Routes HPA from Grip/Foregrip up into 160cc Barrel Reserve!)
    const gripToBarrelRiser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0095, 0.0095, 0.135, 16),
      goldBrassMat
    );
    gripToBarrelRiser.position.set(0, -0.028, -0.185);
    gripToBarrelRiser.rotation.x = 0.24;
    gripToBarrelRiser.userData = {
      subAssemblyId: 'P50_GRIP_TO_BARREL_CONDUIT',
      subAssemblyTitle: 'P50 Grip-to-Barrel Reserve High-Pressure Fill Conduit (1-Way Check Valve)',
    };
    plenumGroup.add(gripToBarrelRiser);

    // Laminar Barrel-Reserve-to-Buttstock Flow Bus (Flows rearward from 160cc Barrel Reserve right past the Grip into 280cc Buttstock & Extended Plenum!)
    for (const sideBusX of [-0.036, 0.036]) {
      const laminarFlowBusPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0085, 0.0085, 0.42, 16),
        hpaFluidGlowMat
      );
      laminarFlowBusPipe.rotation.x = Math.PI / 2;
      laminarFlowBusPipe.position.set(sideBusX, 0.004, 0.02);
      laminarFlowBusPipe.userData = {
        subAssemblyId: 'P50_BARREL_TO_BUTTSTOCK_FLOW_BUS',
        subAssemblyTitle: 'P50 Laminar Flow Bus: 160cc Barrel Reserve -> Past Grip -> 280cc Buttstock & Extended Plenum',
      };
      plenumGroup.add(laminarFlowBusPipe);
    }

    const verticalTransferPortGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.064, 16);
    const verticalTransferPort = new THREE.Mesh(verticalTransferPortGeo, goldBrassMat);
    verticalTransferPort.position.set(0, 0.004, turretZ - 0.01);
    plenumGroup.add(verticalTransferPort);

    // 7. Monolithic P90 Bullpup Receiver & Dual Hermetic PU-95A + FFKM Breech Seal Collars
    const breechReceiverGeo = new THREE.BoxGeometry(0.078, 0.078, 0.42);
    const breechReceiver = new THREE.Mesh(breechReceiverGeo, receiverMat);
    breechReceiver.position.set(0, 0.026, 0.04);
    manifoldCoreGroup.add(breechReceiver);

    const frontOpticBridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.052, 0.055, 0.095),
      darkGunmetalMat
    );
    frontOpticBridge.position.set(0, 0.086, -0.355);
    handguardGroup.add(frontOpticBridge);

    for (const [cIdx, zSeal] of [turretZ - 0.036, turretZ + 0.018].entries()) {
      const sealRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.014, 24),
        redSealMat
      );
      sealRing.rotation.x = Math.PI / 2;
      sealRing.position.set(0, boreAxisY, zSeal);
      sealRing.userData = {
        isP50HermeticSealCollar: true,
        collarIndex: cIdx, // 0 = Front Leade Seal Collar, 1 = Rear Probe Seal Collar
        baseZ: zSeal,
        baseY: boreAxisY,
      };
      manifoldCoreGroup.add(sealRing);
    }

    // 8. RESERVE #4 (IN THE FOREGRIP — POSITIONED FURTHER DOWN THE BARREL AT Z=-0.31m AS AN OPTIONAL MANUAL REFILL PUMP!)
    const frontBowGrip = new THREE.Mesh(
      new THREE.TorusGeometry(0.048, 0.013, 12, 22, Math.PI * 1.15),
      darkGunmetalMat
    );
    frontBowGrip.rotation.y = Math.PI / 2;
    frontBowGrip.position.set(0, -0.042, -0.31);
    frontBowGrip.userData = { isP50ForwardPumpForegrip: true, baseZ: -0.31 };
    foregripCamGroup.add(frontBowGrip);

    // 120cc 250-Bar Pressurized Forward Refill Pump Foregrip Bottle (Reserve #4, positioned further down the barrel)
    const foregripBottleLen = 0.165;
    const foregripBottleOuter = createCsgHollowSlottedTube({
      outerRadius: 0.026,
      innerRadius: 0.019,
      length: foregripBottleLen,
      radialSegments: 20,
      slotCount: 2,
      slotWidth: 0.01,
      slotLength: 0.04,
      material: outerShroudGlassOrMetalMat,
    });
    foregripBottleOuter.rotation.x = Math.PI / 2;
    foregripBottleOuter.position.set(0, -0.095, -0.31);
    foregripBottleOuter.userData = {
      isP50ForwardPumpForegrip: true,
      baseZ: -0.31,
      subAssemblyId: 'P50_RESERVE_4_FOREGRIP',
      subAssemblyTitle: 'P50 Reserve #4 (Forward Refill Pump Foregrip): 120cc 250B Auxiliary Pump & Bottle',
    };
    foregripCamGroup.add(foregripBottleOuter);

    const foregripBottleHpaCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, foregripBottleLen * 0.86, 16),
      hpaFluidGlowMat
    );
    foregripBottleHpaCore.position.set(0, -0.095, -0.31);
    foregripBottleHpaCore.userData = { isP50ForwardPumpForegrip: true, baseZ: -0.31 };
    foregripCamGroup.add(foregripBottleHpaCore);

    const foregripGauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.014, 18),
      goldBrassMat
    );
    foregripGauge.position.set(0, -0.182, -0.31);
    foregripGauge.userData = { isP50ForwardPumpForegrip: true, baseZ: -0.31 };
    foregripCamGroup.add(foregripGauge);

    // Folding Twin-Leg Tactical Bipod mounted under the Front Barrel Shroud
    const bipodHingeBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.022, 0.048),
      darkGunmetalMat
    );
    bipodHingeBlock.position.set(0, boreAxisY - outerAirRadius - 0.01, -0.44);
    bipodHingeBlock.userData = {
      subAssemblyId: 'P50_FOLDING_BIPOD',
      subAssemblyTitle: 'P50 Folding Twin-Leg Carbon/Steel Tactical Bipod',
    };
    foregripCamGroup.add(bipodHingeBlock);

    for (const sideX of [-0.028, 0.028]) {
      const bipodLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.006, 0.195, 14),
        brushedSteelMat
      );
      bipodLeg.position.set(sideX * 1.55, boreAxisY - 0.135, -0.45);
      bipodLeg.rotation.z = sideX > 0 ? -0.22 : 0.22;
      bipodLeg.rotation.x = 0.14;
      foregripCamGroup.add(bipodLeg);

      const bipodFoot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.013, 0.018, 14),
        crimsonAnodizedMat
      );
      bipodFoot.position.set(sideX * 2.2, boreAxisY - 0.228, -0.465);
      foregripCamGroup.add(bipodFoot);
    }

    // Rebuilt P50 Ergonomic Bullpup Grip with Internal High-Pressure Barrel-Reserve Fill Channel & Foster Nipple
    const p90PistolGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.125, 0.062),
      darkGunmetalMat
    );
    p90PistolGrip.position.set(0, -0.062, -0.065);
    p90PistolGrip.rotation.x = -0.22;
    p90PistolGrip.userData = {
      subAssemblyId: 'P50_GRIP_AND_FILL_MANIFOLD',
      subAssemblyTitle: 'P50 Ergonomic Bullpup Grip with Internal 250B Barrel-Reserve Fill Conduit',
    };
    foregripCamGroup.add(p90PistolGrip);

    // Internal Glowing High-Pressure Fill Core running up through the P50 Grip into the Barrel Reserve
    const gripInternalFillCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.145, 14),
      hpaFluidGlowMat
    );
    gripInternalFillCore.position.set(0, -0.042, -0.075);
    gripInternalFillCore.rotation.x = -0.22;
    foregripCamGroup.add(gripInternalFillCore);

    // Bottom Grip 1-Way Male Foster Quick-Fill Nipple & Wika 250B Grip Gauge
    const gripFosterNipple = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0075, 0.009, 0.024, 16),
      goldBrassMat
    );
    gripFosterNipple.position.set(0, -0.128, -0.052);
    foregripCamGroup.add(gripFosterNipple);

    const p50TriggerGuardLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.0055, 10, 22, Math.PI * 1.15),
      brushedSteelMat
    );
    p50TriggerGuardLoop.rotation.y = Math.PI / 2;
    p50TriggerGuardLoop.position.set(0, -0.042, -0.105);
    foregripCamGroup.add(p50TriggerGuardLoop);

    const p50MatchTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.009, 0.032, 0.014),
      crimsonAnodizedMat
    );
    p50MatchTrigger.position.set(0, -0.036, -0.098);
    p50MatchTrigger.rotation.x = 0.22;
    foregripCamGroup.add(p50MatchTrigger);

    // 9. RESERVE #3 (IN THE BUTTSTOCK): 280cc Dual Rear High-Pressure Cylinders + Automatic Blowback Plenum (buttstockGroup)
    const bullpupChassisBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.074, 0.145, 0.32),
      outerShroudGlassOrMetalMat
    );
    bullpupChassisBody.position.set(0, -0.005, 0.27);
    buttstockGroup.add(bullpupChassisBody);

    for (const yTank of [0.032, -0.036]) {
      const buttstockTankGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.27, 20);
      buttstockTankGeo.rotateX(Math.PI / 2);
      const buttstockTank = new THREE.Mesh(buttstockTankGeo, hpaFluidGlowMat);
      buttstockTank.position.set(0, yTank, 0.27);
      buttstockTank.userData = {
        subAssemblyId: 'P50_RESERVE_3_BUTTSTOCK',
        subAssemblyTitle: 'P50 Reserve #3 (Buttstock): 280cc 250-Bar Dual Rear Cylinders & Full-Auto Plenum',
      };
      buttstockGroup.add(buttstockTank);
    }

    const rearButtstockGauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.016, 18),
      goldBrassMat
    );
    rearButtstockGauge.rotation.z = Math.PI / 2;
    rearButtstockGauge.position.set(0.038, 0.032, 0.36);
    buttstockGroup.add(rearButtstockGauge);

    const buttpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.078, 0.162, 0.032),
      crimsonAnodizedMat
    );
    buttpad.position.set(0, -0.005, 0.44);
    buttstockGroup.add(buttpad);

    return {
      root,
      familyContext,
      otbShroudGroup,
      plenumGroup,
      handguardGroup,
      buttstockGroup,
      rotaryMagGroup,
      pumpLinkageGroup,
      foregripCamGroup,
      manifoldCoreGroup,
      customCadGroup,
      airflowStreamGroup,
    };
  }

  // ==========================================================================
  // FAMILY 1: SHOTGUN_BURST_CARTRIDGE_FAMILY
  // (Stage 1: Burst Disk Fitting -> Stage 2: Red Air Pen -> Stage 3: AEA 2-Shell Break-Action -> Stage 4: Airgun Cane)
  // ==========================================================================
  if (familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
    if (burstStage === 'STAGE_1_BURST_DISK_FITTING') {
      buildBurstDiskSubAssemblyNodes({
        scale: 4.2,
        zOffset: 0,
        yOffset: 0.03,
        fittingBodyGroup: manifoldCoreGroup,
        burstDiskGroup: rotaryMagGroup,
        retainerGroup: otbShroudGroup,
        fluidSystemGroup: buttstockGroup,
        xrayMode: xrayGasMode,
      });
      return {
        root,
        familyContext,
        otbShroudGroup,
        plenumGroup,
        handguardGroup,
        buttstockGroup,
        rotaryMagGroup,
        pumpLinkageGroup,
        foregripCamGroup,
        manifoldCoreGroup,
        customCadGroup,
      };
    }

    // Shared helper: Builds the standardized .50 Cal (12.7mm) 220-Bar SHELL-50-220B Pre-Charged Burst-Disk Container
    // Used identically in #01 Pen Gun (1× coaxial) and #03 AEA Defender (2× over-under)
    // Supports Slug (.50 Cal 335gr Hollow-Point), Buckshot (.50 Cal 8-Pellet #000), and Giant 375gr Carbon Arrow
    const buildShared50Cal220BarBurstCartridge = (opts: {
      payloadMode:
        | 'SLUG_50CAL_335GR_HP'
        | 'BUCKSHOT_8PELLET_50CAL'
        | 'GIANT_CARBON_ARROW_375GR';
      includeburstNodes?: boolean;
    }): THREE.Group => {
      const shellGroup = new THREE.Group();
      shellGroup.userData = {
        subAssemblyId: 'SHELL-50-220B',
        subAssemblyTitle:
          'Shared SHELL-50-220B: .50 Cal (12.7mm) 220-Bar Pre-Charged Burst-Disk Container (Slug / Buckshot / Arrow)',
      };

      // 1. Rear M16×1.0 Threaded 316L Burst-Disk Retainer Cap + Central Striker Piercing Port & High-Pressure Fill Check Ball
      const brassRimGeo = new THREE.CylinderGeometry(0.0195, 0.0195, 0.016, 6);
      brassRimGeo.rotateX(Math.PI / 2);
      const brassRim = new THREE.Mesh(brassRimGeo, goldBrassMat);
      brassRim.position.set(0, 0, 0.089);
      brassRim.userData = {
        subAssemblyId: 'SHELL-50-RETAINER-CAP',
        subAssemblyTitle:
          'SHELL-50-CAP: M16×1.0 14mm Hex Burst-Disk Retainer Nut & Striker Guide Throat',
      };
      shellGroup.add(brassRim);

      // Rear Striker Guide Funnel & 316L Fill Check-Ball Seat
      const strikerGuidePort = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0062, 0.0045, 0.018, 14),
        darkGunmetalMat
      );
      strikerGuidePort.rotation.x = Math.PI / 2;
      strikerGuidePort.position.set(0, 0, 0.091);
      shellGroup.add(strikerGuidePort);

      const checkValveBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.0038, 12, 12),
        brushedSteelMat
      );
      checkValveBall.position.set(0, 0.0072, 0.084);
      shellGroup.add(checkValveBall);

      // 2. Dual Opposed Viton FKM-90 Clamping O-Rings sandwiching the 0.12mm 6-Petal CuNi Burst Disk
      for (const zClampRing of [0.081, 0.074]) {
        const clampOring = new THREE.Mesh(
          new THREE.TorusGeometry(0.0132, 0.0018, 10, 20),
          crimsonAnodizedMat
        );
        clampOring.position.set(0, 0, zClampRing);
        shellGroup.add(clampOring);
      }

      // 3. Functional 0.12mm Laser-Scored 6-Petal CuNi Sacrificial Burst Disk (petals shear open on impact/explosion!)
      const petalGroup = new THREE.Group();
      petalGroup.position.set(0, 0, 0.0775);
      petalGroup.userData = {
        isBurstDiskPetalGroup: true,
        subAssemblyId: 'SHELL-50-CUNI-FOIL',
        subAssemblyTitle:
          'SHELL-50-FOIL: 0.12mm Laser-Scored 6-Petal CuNi 90/10 Sacrificial Burst Disk (235 Bar Rupture)',
      };
      for (let p = 0; p < 6; p++) {
        const pAng = (p * Math.PI * 2) / 6;
        const petalGeo = new THREE.CylinderGeometry(
          0.0134,
          0.0134,
          0.0035,
          6,
          1,
          false,
          pAng,
          Math.PI / 3 - 0.06
        );
        petalGeo.rotateX(Math.PI / 2);
        const petalMesh = new THREE.Mesh(petalGeo, goldBrassMat);
        petalMesh.userData = { petalIndex: p, petalAngle: pAng };
        petalGroup.add(petalMesh);
      }
      shellGroup.add(petalGroup);

      // 4. Red Anodized 7075-T651 220-Bar Self-Contained HPA Container Vessel (Ø18.0mm OD, Slotted Inspection Window)
      const redBase = createCsgHollowSlottedTube({
        outerRadius: 0.018,
        innerRadius: 0.0138,
        length: 0.074,
        radialSegments: 22,
        slotCount: 3,
        slotWidth: 0.007,
        slotLength: 0.038,
        material: crimsonAnodizedMat,
      });
      redBase.position.set(0, 0, 0.041);
      redBase.userData = {
        subAssemblyId: 'SHELL-50-220B-VESSEL',
        subAssemblyTitle:
          'SHELL-50-VESSEL: 7075-T651 220-Bar (3,200 PSI) 11.2cc Micro-Plenum Container Body',
      };
      shellGroup.add(redBase);

      // 5. Glowing 220-Bar (3,200 PSI) 11.2cc Nitrogen/HPA Annular Core + Internal Diverter Nozzle Cone
      const innerCoreGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.064, 18);
      innerCoreGeo.rotateX(Math.PI / 2);
      const innerCore = new THREE.Mesh(innerCoreGeo, hpaFluidGlowMat);
      innerCore.position.set(0, 0, 0.041);
      shellGroup.add(innerCore);

      const nozzleThroatCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.0135, 0.022, 18, 1, true),
        goldBrassMat
      );
      nozzleThroatCone.rotation.x = -Math.PI / 2;
      nozzleThroatCone.position.set(0, 0, 0.004);
      shellGroup.add(nozzleThroatCone);

      // 6. Stepped Stainless Front Payload Neck (Ø16.0mm OD × Ø12.70mm ID Bore) + Dual Parker 2-015 Viton Neck O-Rings
      const silverTube = createCsgHollowSlottedTube({
        outerRadius: 0.0162,
        innerRadius: 0.0127,
        length: 0.116,
        radialSegments: 22,
        slotCount: 2,
        slotWidth: 0.008,
        slotLength: 0.055,
        material: brushedSteelMat,
      });
      silverTube.position.set(0, 0, -0.052);
      shellGroup.add(silverTube);

      for (const zNeckOring of [-0.006, -0.098]) {
        const vitonNeckOring = new THREE.Mesh(
          new THREE.TorusGeometry(0.0165, 0.0021, 10, 22),
          crimsonAnodizedMat
        );
        vitonNeckOring.position.set(0, 0, zNeckOring);
        shellGroup.add(vitonNeckOring);
      }

      const translucentWadMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.15,
        transparent: true,
        opacity: 0.52,
      });
      const carbonArrowMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.25,
        metalness: 0.65,
      });

      if (opts.payloadMode === 'GIANT_CARBON_ARROW_375GR') {
        const arrowShaftGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.42, 16);
        arrowShaftGeo.rotateX(Math.PI / 2);
        const arrowShaft = new THREE.Mesh(arrowShaftGeo, carbonArrowMat);
        arrowShaft.position.set(0, 0, -0.25);
        shellGroup.add(arrowShaft);

        const arrowCollarGeo = new THREE.CylinderGeometry(0.0125, 0.0125, 0.022, 16);
        arrowCollarGeo.rotateX(Math.PI / 2);
        const arrowCollar = new THREE.Mesh(arrowCollarGeo, crimsonAnodizedMat);
        arrowCollar.position.set(0, 0, -0.13);
        shellGroup.add(arrowCollar);

        for (let v = 0; v < 3; v++) {
          const vAng = (v * Math.PI * 2) / 3;
          const vaneMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.002, 0.015, 0.062),
            crimsonAnodizedMat
          );
          vaneMesh.position.set(
            Math.cos(vAng) * 0.0088,
            Math.sin(vAng) * 0.0088,
            -0.35
          );
          vaneMesh.rotation.z = vAng;
          shellGroup.add(vaneMesh);
        }

        const broadheadTipGeo = new THREE.ConeGeometry(0.0155, 0.054, 3);
        broadheadTipGeo.rotateX(-Math.PI / 2);
        const broadheadTip = new THREE.Mesh(broadheadTipGeo, brushedSteelMat);
        broadheadTip.position.set(0, 0, -0.485);
        shellGroup.add(broadheadTip);
      } else if (opts.payloadMode === 'SLUG_50CAL_335GR_HP') {
        // Functional .50 Cal (12.70mm) 335gr Hollow-Point Boattail Slug + Red PU-90A Gas-Check Obturation Cup & 3 Driving Bands
        const gasCheckSabot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0127, 0.0129, 0.016, 20),
          crimsonAnodizedMat
        );
        gasCheckSabot.rotation.x = Math.PI / 2;
        gasCheckSabot.position.set(0, 0, -0.112);
        gasCheckSabot.userData = {
          subAssemblyId: 'SHELL-50-SLUG-SABOT',
          subAssemblyTitle:
            'SHELL-50-SLUG: .50 Cal (12.70mm) 335gr Hollow-Point Slug w/ PU-90A Gas-Check Obturation Base',
        };
        shellGroup.add(gasCheckSabot);

        const slugBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0126, 0.0127, 0.036, 22),
          goldBrassMat
        );
        slugBody.rotation.x = Math.PI / 2;
        slugBody.position.set(0, 0, -0.136);
        shellGroup.add(slugBody);

        // 3 Precision Rifling Driving Bands along the .50 Cal 335gr Slug
        for (const zBand of [-0.124, -0.136, -0.148]) {
          const drivingBand = new THREE.Mesh(
            new THREE.TorusGeometry(0.0127, 0.0009, 8, 22),
            brushedSteelMat
          );
          drivingBand.position.set(0, 0, zBand);
          shellGroup.add(drivingBand);
        }

        // Ogive Nose Cone + Recessed Hollow-Point Meplat Cavity
        const slugOgive = new THREE.Mesh(
          new THREE.ConeGeometry(0.0126, 0.024, 22),
          goldBrassMat
        );
        slugOgive.rotation.x = -Math.PI / 2;
        slugOgive.position.set(0, 0, -0.164);
        shellGroup.add(slugOgive);

        const hollowPointCavity = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0052, 0.0028, 0.012, 16),
          darkGunmetalMat
        );
        hollowPointCavity.rotation.x = Math.PI / 2;
        hollowPointCavity.position.set(0, 0, -0.172);
        shellGroup.add(hollowPointCavity);
      } else {
        // Functional .50 Cal (12.7mm) 8-Pellet #000 Buckshot 4-Petal Splitting Sabot Wad + Rear Cushion Piston + Front Crimp Disc
        const rearObturationDisc = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0127, 0.0128, 0.01, 18),
          goldBrassMat
        );
        rearObturationDisc.rotation.x = Math.PI / 2;
        rearObturationDisc.position.set(0, 0, -0.106);
        shellGroup.add(rearObturationDisc);

        const wadCupGeo = new THREE.CylinderGeometry(0.0127, 0.0127, 0.068, 18);
        wadCupGeo.rotateX(Math.PI / 2);
        const wadCup = new THREE.Mesh(wadCupGeo, translucentWadMat);
        wadCup.position.set(0, 0, -0.142);
        wadCup.userData = {
          subAssemblyId: 'SHELL-50-BUCKSHOT-WAD',
          subAssemblyTitle:
            'SHELL-50-BUCK: 4-Petal Splitting UHMWPE Shot Cup w/ 8× .36" (9.1mm) #000 Lead Buckshot Pellets',
        };
        shellGroup.add(wadCup);

        for (let p = 0; p < 8; p++) {
          const ringIdx = Math.floor(p / 4);
          const ang = (p % 4) * (Math.PI / 2) + ringIdx * 0.4;
          const buckshotPellet = new THREE.Mesh(
            new THREE.SphereGeometry(0.0046, 12, 12),
            goldBrassMat
          );
          buckshotPellet.position.set(
            Math.cos(ang) * 0.0056,
            Math.sin(ang) * 0.0056,
            -0.128 - ringIdx * 0.022
          );
          shellGroup.add(buckshotPellet);
        }

        // Translucent Frangible Front Over-Shot Crimp Card
        const frontCrimpCard = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0126, 0.0126, 0.004, 18),
          crimsonAnodizedMat
        );
        frontCrimpCard.rotation.x = Math.PI / 2;
        frontCrimpCard.position.set(0, 0, -0.177);
        shellGroup.add(frontCrimpCard);
      }

      return shellGroup;
    };

    if (burstStage === 'STAGE_2_SIMPLE_RED_AIR_PEN') {
      // Standardized .50 Cal (12.7mm) Pocket Pen Launcher using 1× Shared SHELL-50-220B Cartridge
      // Zero-collision coaxial dimensions: Shroud OD = 0.0245m, Chamber ID = 0.0198m, Shell OD = 0.0180m (+0.05mm scaled radial clearance)
      const penShroudRadius = 0.0245;
      const bronzeBarrelLen = 0.34;
      const redBodyLen = 0.48;
      const boreCenterY = 0.03;

      const bronzeShroudMesh = createCsgHollowSlottedTube({
        outerRadius: penShroudRadius * 0.96,
        innerRadius: 0.0165,
        length: bronzeBarrelLen,
        radialSegments: 24,
        slotCount: 0,
        material: bronzeBarrelMat,
      });
      bronzeShroudMesh.position.set(0, boreCenterY, -0.27);
      bronzeShroudMesh.userData = {
        subAssemblyId: 'PEN-01_SHARED_50_BARREL',
        subAssemblyTitle:
          'PEN-01: 12.70mm (.50 Cal) Seamless Barrel Liner & Pocket Shroud (Shared Bore w/ AEA Defender)',
      };
      otbShroudGroup.add(bronzeShroudMesh);

      const muzzleCrownGeo = new THREE.CylinderGeometry(
        penShroudRadius * 0.9,
        penShroudRadius * 0.96,
        0.042,
        24
      );
      muzzleCrownGeo.rotateX(Math.PI / 2);
      const muzzleCrown = new THREE.Mesh(muzzleCrownGeo, bronzeBarrelMat);
      muzzleCrown.position.set(0, boreCenterY, -0.45);
      otbShroudGroup.add(muzzleCrown);

      // Detail Upgrade #1 for Pen Gun: Visible M18×1.0 Breech Coupler Helical Threads + Dual FKM-90 Breech Face O-Rings
      for (let tIdx = 0; tIdx < 5; tIdx++) {
        const couplerThread = new THREE.Mesh(
          new THREE.TorusGeometry(0.0215, 0.0014, 8, 24),
          goldBrassMat
        );
        couplerThread.position.set(0, boreCenterY, -0.095 + tIdx * 0.0065);
        otbShroudGroup.add(couplerThread);
      }

      // Identical 12.70mm (.50 Cal) Rifled Barrel Liner + 3-Baffle Micro-Silencer as AEA Defender
      populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
        barrelLen: bronzeBarrelLen,
        shroudRadius: 0.022,
        caliberMm: 12.7,
        baffleCount: 3,
        zCenter: -0.27,
        yCenter: boreCenterY,
        linerMat: brushedSteelMat,
        baffleMat: silencerBaffleMat,
        riflingMat: goldBrassMat,
      });

      // 1× Shared SHELL-50-220B Cartridge seated coaxially inside the Pen Gun breech chamber (supports Slug or Buckshot!)
      const penPayloadMode =
        familyContext.burstShellPayload === 'SLUG_50CAL_335GR_HP' ||
        familyContext.defenderPayload === 'SLUG_50CAL_335GR_HP'
          ? 'SLUG_50CAL_335GR_HP'
          : 'BUCKSHOT_8PELLET_50CAL';
      const sharedPenShell = buildShared50Cal220BarBurstCartridge({
        payloadMode: penPayloadMode,
      });
      sharedPenShell.position.set(0, boreCenterY, 0.025);
      rotaryMagGroup.add(sharedPenShell);

      const redPenTube = createCsgHollowSlottedTube({
        outerRadius: penShroudRadius,
        innerRadius: 0.0198, // Guaranteed clearance around Ø0.018m SHELL-50-220B
        length: redBodyLen,
        radialSegments: 24,
        slotCount: 1,
        slotWidth: 0.011,
        slotLength: 0.092,
        material: crimsonAnodizedMat,
      });
      redPenTube.position.set(0, boreCenterY, 0.22);
      manifoldCoreGroup.add(redPenTube);

      // Detail Upgrade #2 for Pen Gun: Spring-Tempered Titanium Pocket Clip + Dual M2.5×5mm Torx Screws + Safety J-Notch Detent
      const titaniumPocketClip = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.0045, 0.195),
        brushedSteelMat
      );
      titaniumPocketClip.position.set(0, boreCenterY + penShroudRadius + 0.004, 0.34);
      manifoldCoreGroup.add(titaniumPocketClip);

      for (const zClipScrew of [0.415, 0.432]) {
        const torxClipScrew = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0028, 0.0028, 0.006, 6),
          goldBrassMat
        );
        torxClipScrew.position.set(
          0,
          boreCenterY + penShroudRadius + 0.006,
          zClipScrew
        );
        manifoldCoreGroup.add(torxClipScrew);
      }

      for (const zBand of [-0.01, 0.18, 0.25]) {
        const knurlBandGeo = new THREE.CylinderGeometry(
          penShroudRadius * 1.03,
          penShroudRadius * 1.03,
          0.022,
          28
        );
        knurlBandGeo.rotateX(Math.PI / 2);
        const knurlBand = new THREE.Mesh(knurlBandGeo, crimsonAnodizedMat);
        knurlBand.position.set(0, boreCenterY, zBand);
        manifoldCoreGroup.add(knurlBand);
      }

      const boltKnobGeo = new THREE.CylinderGeometry(0.0105, 0.0105, 0.028, 16);
      const boltKnob = new THREE.Mesh(boltKnobGeo, darkGunmetalMat);
      boltKnob.position.set(0, boreCenterY + penShroudRadius * 1.08, 0.34);
      buttstockGroup.add(boltKnob);

      const strikerRodGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.17, 14);
      strikerRodGeo.rotateX(Math.PI / 2);
      const strikerRod = new THREE.Mesh(strikerRodGeo, brushedSteelMat);
      strikerRod.position.set(0, boreCenterY, 0.32);
      buttstockGroup.add(strikerRod);

      // Concentric Chrome-Silicon Striker Mainspring Coil around the Pen Striker Rod
      const penMainspring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0155, 0.0155, 0.135, 16, 12, true),
        goldBrassMat
      );
      penMainspring.rotation.x = Math.PI / 2;
      penMainspring.position.set(0, boreCenterY, 0.35);
      buttstockGroup.add(penMainspring);

      const rearDomeGeo = new THREE.SphereGeometry(penShroudRadius, 20, 14);
      const rearDome = new THREE.Mesh(rearDomeGeo, crimsonAnodizedMat);
      rearDome.position.set(0, boreCenterY, 0.465);
      buttstockGroup.add(rearDome);

      const lanyardGeo = new THREE.TorusGeometry(0.038, 0.0042, 10, 24);
      lanyardGeo.rotateY(Math.PI / 2);
      const lanyardMesh = new THREE.Mesh(
        lanyardGeo,
        new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.65 })
      );
      lanyardMesh.position.set(0, -0.01, 0.37);
      buttstockGroup.add(lanyardMesh);

      return {
        root,
        familyContext,
        otbShroudGroup,
        plenumGroup,
        handguardGroup,
        buttstockGroup,
        rotaryMagGroup,
        pumpLinkageGroup,
        foregripCamGroup,
        manifoldCoreGroup,
        customCadGroup,
      };
    }

    if (burstStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL') {
      // Standardized .50 Cal (12.7mm) Over-Under Twin-Barrel AEA Defender using 2× Shared SHELL-50-220B Cartridges
      const shroudLen = 0.44;
      const shroudHeight = 0.125;
      const shroudWidth = 0.068;

      otbShroudGroup.position.set(0, -0.01, -0.05);

      const upperBoxGeo = new THREE.BoxGeometry(shroudWidth, shroudHeight, shroudLen);
      const upperBoxMesh = new THREE.Mesh(upperBoxGeo, outerShroudGlassOrMetalMat);
      upperBoxMesh.position.set(0, 0.065, -0.14);
      upperBoxMesh.userData = {
        subAssemblyId: 'DEF-01_TWIN_50_BARREL_BLOCK',
        subAssemblyTitle:
          'DEF-01: Over-Under Twin 12.70mm (.50 Cal) Barrel Block (2× Shared SHELL-50-220B Chambers)',
      };
      otbShroudGroup.add(upperBoxMesh);

      for (const rowY of [0.088, 0.038]) {
        for (const colZ of [-0.18, -0.29]) {
          const slotCut = new THREE.Mesh(
            new THREE.BoxGeometry(shroudWidth * 1.04, 0.014, 0.065),
            darkGunmetalMat
          );
          slotCut.position.set(0, rowY, colZ);
          otbShroudGroup.add(slotCut);
        }
      }

      const topRailGeo = new THREE.BoxGeometry(0.032, 0.014, shroudLen * 0.92);
      const topRail = new THREE.Mesh(topRailGeo, darkGunmetalMat);
      topRail.position.set(0, 0.132, -0.14);
      otbShroudGroup.add(topRail);

      // Exact same 12.70mm (.50 Cal) barrel liner & 3-baffle dimensions as #01 Pen Gun, stacked Over-Under!
      for (const barrelY of [0.088, 0.038]) {
        populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
          barrelLen: shroudLen * 0.95,
          shroudRadius: 0.022,
          caliberMm: 12.7,
          baffleCount: 3,
          zCenter: -0.14,
          yCenter: barrelY,
          linerMat: brushedSteelMat,
          baffleMat: silencerBaffleMat,
          riflingMat: goldBrassMat,
        });
      }

      // Spring-Loaded Mechanical Shell Ejector/Extractor Star Rod between Upper & Lower Chambers
      const shellExtractorRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0048, 0.0048, 0.14, 14),
        goldBrassMat
      );
      shellExtractorRod.rotation.x = Math.PI / 2;
      shellExtractorRod.position.set(0, 0.063, 0.025);
      shellExtractorRod.userData = {
        subAssemblyId: 'DEF-08_EXTRACTOR_STAR',
        subAssemblyTitle:
          'DEF-08: Twin-Chamber Spring-Loaded Shell Extractor Star & Guide Rod',
      };
      otbShroudGroup.add(shellExtractorRod);

      const payloadMode =
        familyContext.defenderPayload === 'GIANT_CARBON_ARROW_375GR'
          ? 'GIANT_CARBON_ARROW_375GR'
          : familyContext.defenderPayload === 'SLUG_50CAL_335GR_HP' ||
            familyContext.burstShellPayload === 'SLUG_50CAL_335GR_HP'
          ? 'SLUG_50CAL_335GR_HP'
          : 'BUCKSHOT_8PELLET_50CAL';

      // Load 2× Shared SHELL-50-220B Cartridges coaxially aligned at y=0.078 and y=0.028 (matching barrelY - 0.010 group offset)
      for (const [idx, shellY] of [0.078, 0.028].entries()) {
        const singleShellGroup = buildShared50Cal220BarBurstCartridge({
          payloadMode,
        });
        singleShellGroup.position.set(0, shellY, 0.055 + idx * 0.008);
        rotaryMagGroup.add(singleShellGroup);
      }

      // ======================================================================
      // GENERATED AEA DEFENDER HAMMER, RATCHET CAM SELECTOR, FIRING PINS & TOP LATCH
      // ======================================================================
      // 1. DEF-LATCH-05: Top Break-Barrel Stirrup Locking Latch & Release Ears (`handguardGroup`)
      const topBreakLatchStirrup = new THREE.Mesh(
        new THREE.BoxGeometry(0.052, 0.024, 0.068),
        crimsonAnodizedMat
      );
      topBreakLatchStirrup.position.set(0, 0.118, 0.118);
      topBreakLatchStirrup.userData = {
        isDefenderTopLatch: true,
        subAssemblyId: 'DEF-LATCH-05',
        subAssemblyTitle:
          'DEF-LATCH-05: Top Break-Barrel Stirrup Locking Wedge & Bilateral Thumb Release',
      };
      handguardGroup.add(topBreakLatchStirrup);

      // 2. DEF-PIN-07: Dual Over-Under 440C Piercing Firing Needles + Return Springs inside Standing Breech (`customCadGroup`)
      for (const [pIdx, pinY] of [0.078, 0.028].entries()) {
        const firingNeedle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0022, 0.0042, 0.056, 14),
          goldBrassMat
        );
        firingNeedle.rotation.x = Math.PI / 2;
        firingNeedle.position.set(0, pinY, 0.158);
        firingNeedle.userData = {
          isDefenderFiringNeedle: true,
          needleIndex: pIdx,
          subAssemblyId: `DEF-PIN-0${pIdx + 1}`,
          subAssemblyTitle: `DEF-PIN-0${pIdx + 1}: ${
            pIdx === 0 ? 'Upper' : 'Lower'
          } 440C Hardened Burst-Disk Piercing Needle (HRC 60)`,
        };
        customCadGroup.add(firingNeedle);
      }

      // 3. DEF-HAMMER-01/02 & DEF-SPR-04: Dual Over-Under Alternating Striker Hammers + Concentric Mainsprings (`plenumGroup`)
      for (const [hIdx, hammerY] of [0.078, 0.028].entries()) {
        const strikerHammer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.011, 0.011, 0.052, 18),
          brushedSteelMat
        );
        strikerHammer.rotation.x = Math.PI / 2;
        strikerHammer.position.set(0, hammerY, 0.195);
        strikerHammer.userData = {
          isDefenderAlternatingHammer: true,
          hammerIndex: hIdx,
          baseZ: 0.195,
          subAssemblyId: `DEF-HAMMER-0${hIdx + 1}`,
          subAssemblyTitle: `DEF-HAMMER-0${hIdx + 1}: ${
            hIdx === 0 ? 'Upper' : 'Lower'
          } 17-4PH Linear Striker Hammer & Cocking Spur`,
        };
        plenumGroup.add(strikerHammer);

        // Exposed Rear Hammer Cocking Spur for manual/double-action visual inspection
        const hammerSpur = new THREE.Mesh(
          new THREE.BoxGeometry(0.016, 0.014, 0.024),
          crimsonAnodizedMat
        );
        hammerSpur.position.set(0, hammerY + (hIdx === 0 ? 0.01 : -0.01), 0.224);
        hammerSpur.userData = {
          isDefenderAlternatingHammer: true,
          hammerIndex: hIdx,
          baseZ: 0.224,
        };
        plenumGroup.add(hammerSpur);

        const mainspringCoil = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0135, 0.0135, 0.044, 14, 8, true),
          goldBrassMat
        );
        mainspringCoil.rotation.x = Math.PI / 2;
        mainspringCoil.position.set(0, hammerY, 0.205);
        plenumGroup.add(mainspringCoil);
      }

      // 4. DEF-RATCHET-03: Oscillating Over-Under Ratchet Cam Selector Drum (`plenumGroup`)
      const ratchetSelectorDrum = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.038, 12),
        goldBrassMat
      );
      ratchetSelectorDrum.rotation.z = Math.PI / 2;
      ratchetSelectorDrum.position.set(0, 0.053, 0.188);
      ratchetSelectorDrum.userData = {
        isDefenderRatchetCam: true,
        subAssemblyId: 'DEF-RATCHET-03',
        subAssemblyTitle:
          'DEF-RATCHET-03: Auto-Indexing Over-Under Barrel Selector Ratchet Cam (180° Flip per Pull)',
      };
      plenumGroup.add(ratchetSelectorDrum);

      // 5. DEF-TRIG-06: Double-Action Trigger Blade, Sear Transfer Bar & Cross-Bolt Safety (`pumpLinkageGroup`)
      const daTriggerBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.009, 0.036, 0.014),
        goldBrassMat
      );
      daTriggerBlade.position.set(0, -0.038, 0.052);
      daTriggerBlade.rotation.x = 0.28;
      daTriggerBlade.userData = {
        subAssemblyId: 'DEF-TRIG-06',
        subAssemblyTitle:
          'DEF-TRIG-06: Double-Action Trigger Blade & Vertical Ratchet Transfer Bar',
      };
      pumpLinkageGroup.add(daTriggerBlade);

      const daTransferLinkBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.078, 0.095),
        brushedSteelMat
      );
      daTransferLinkBar.position.set(0, 0.008, 0.125);
      daTransferLinkBar.rotation.x = -0.35;
      pumpLinkageGroup.add(daTransferLinkBar);

      const defenderCrossSafety = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.058, 14),
        crimsonAnodizedMat
      );
      defenderCrossSafety.rotation.z = Math.PI / 2;
      defenderCrossSafety.position.set(0, -0.01, 0.088);
      pumpLinkageGroup.add(defenderCrossSafety);

      const hingeKnuckleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.072, 16);
      hingeKnuckleGeo.rotateZ(Math.PI / 2);
      const hingeKnuckle = new THREE.Mesh(hingeKnuckleGeo, brushedSteelMat);
      hingeKnuckle.position.set(0, -0.01, -0.05);
      manifoldCoreGroup.add(hingeKnuckle);

      const triggerGuardGeo = new THREE.BoxGeometry(0.028, 0.075, 0.12);
      const triggerGuard = new THREE.Mesh(triggerGuardGeo, receiverMat);
      triggerGuard.position.set(0, -0.045, 0.02);
      manifoldCoreGroup.add(triggerGuard);

      const standingBreech = createCsgHollowSlottedTube({
        outerRadius: 0.042,
        innerRadius: 0.026,
        length: 0.068,
        radialSegments: 8,
        slotCount: 2,
        slotWidth: 0.016,
        slotLength: 0.042,
        material: receiverMat,
      });
      standingBreech.position.set(0, 0.052, 0.175);
      standingBreech.userData = {
        subAssemblyId: 'DEF-BREECH-HOUSING',
        subAssemblyTitle:
          'DEF-BREECH: Slotted 7075-T6 Standing Breech & Dual Hammer Lock Housing',
      };
      buttstockGroup.add(standingBreech);

      const pistolGripGeo = new THREE.BoxGeometry(0.048, 0.165, 0.064);
      const pistolGrip = new THREE.Mesh(pistolGripGeo, darkGunmetalMat);
      pistolGrip.position.set(0, -0.095, 0.165);
      pistolGrip.rotation.x = -0.32;
      buttstockGroup.add(pistolGrip);

      return {
        root,
        familyContext,
        otbShroudGroup,
        plenumGroup,
        handguardGroup,
        buttstockGroup,
        rotaryMagGroup,
        pumpLinkageGroup,
        foregripCamGroup,
        manifoldCoreGroup,
        customCadGroup,
      };
    }

    // STAGE_4_CONCEALED_AIRGUN_CANE
    const caneRadius = 0.022;
    const caneLen = 1.05;

    const caneShaftMesh = createCsgHollowSlottedTube({
      outerRadius: caneRadius,
      innerRadius: caneRadius * 0.76,
      length: caneLen,
      radialSegments: 24,
      slotCount: 0,
      material: outerShroudGlassOrMetalMat,
    });
    caneShaftMesh.position.set(0, 0.02, -0.35);
    otbShroudGroup.add(caneShaftMesh);

    populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
      barrelLen: caneLen * 0.94,
      shroudRadius: caneRadius * 0.92,
      caliberMm: customCaliberMm,
      baffleCount: 8,
      zCenter: -0.35,
      yCenter: 0.02,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    const rubberTipGeo = new THREE.CylinderGeometry(
      caneRadius * 1.12,
      caneRadius * 0.95,
      0.055,
      20
    );
    rubberTipGeo.rotateX(Math.PI / 2);
    const rubberTip = new THREE.Mesh(rubberTipGeo, darkGunmetalMat);
    rubberTip.position.set(0, 0.02, -0.89);
    otbShroudGroup.add(rubberTip);

    buildBurstDiskSubAssemblyNodes({
      scale: 0.65,
      zOffset: 0.21,
      yOffset: 0.02,
      fittingBodyGroup: manifoldCoreGroup,
      burstDiskGroup: plenumGroup,
      retainerGroup: rotaryMagGroup,
      fluidSystemGroup: rotaryMagGroup,
      xrayMode: xrayGasMode,
    });

    const brassCollarGeo = new THREE.CylinderGeometry(
      caneRadius * 1.08,
      caneRadius * 1.08,
      0.045,
      24
    );
    brassCollarGeo.rotateX(Math.PI / 2);
    const brassCollar = new THREE.Mesh(brassCollarGeo, goldBrassMat);
    brassCollar.position.set(0, 0.02, 0.18);
    manifoldCoreGroup.add(brassCollar);

    const crookTorusGeo = new THREE.TorusGeometry(0.085, caneRadius * 0.95, 16, 28, Math.PI);
    crookTorusGeo.rotateY(Math.PI / 2);
    crookTorusGeo.rotateX(Math.PI / 2);
    const crookHandle = new THREE.Mesh(crookTorusGeo, crimsonAnodizedMat);
    crookHandle.position.set(0, -0.065, 0.26);
    buttstockGroup.add(crookHandle);

    return {
      root,
      familyContext,
      otbShroudGroup,
      plenumGroup,
      handguardGroup,
      buttstockGroup,
      rotaryMagGroup,
      pumpLinkageGroup,
      foregripCamGroup,
      manifoldCoreGroup,
      customCadGroup,
    };
  }

  // ==========================================================================
  // FAMILY 2: EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY
  // Complete 57-Part Korean Blueprint (REX-P Pistol #01-#57 + REX Sniper Carbine +
  // "PRINCESS DONUT" Fork: Trigger-Lock Sliding Barrel + Watertight Seal + Integrated Coaxial Reserve & Moderator)
  // ==========================================================================
  if (familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
    const isSniperMode = rexMode === 'REX_SNIPER_CARBINE_MODERATED';
    const isPrincessDonutFork =
      rexMode === 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL';
    const boreY = 0.055;
    const shroudRadius = isPrincessDonutFork ? 0.032 : 0.028;
    const baseShroudLen = isSniperMode
      ? 0.56
      : isPrincessDonutFork
      ? 0.46
      : 0.34;

    // 1. Over-Barrel Sound Moderator Shroud (#02) + Rifled Barrel Liner (#03) + Baffles
    const rexShroudMesh = createCsgHollowSlottedTube({
      outerRadius: shroudRadius,
      innerRadius: shroudRadius * 0.78,
      length: baseShroudLen,
      radialSegments: 26,
      slotCount: isPrincessDonutFork ? 6 : 5,
      slotWidth: 0.013,
      slotLength: 0.032,
      material: outerShroudGlassOrMetalMat,
    });
    rexShroudMesh.position.set(0, boreY, -baseShroudLen * 0.5 - 0.055);
    rexShroudMesh.userData = {
      subAssemblyId: isPrincessDonutFork
        ? 'DONUT-INTEGRATED-RESERVE-MOD-SHROUD'
        : 'REX-02-SHROUD',
      subAssemblyTitle: isPrincessDonutFork
        ? 'Princess Donut Integrated Dual-Chamber Shroud (Rear 250B Annular Air Reserve + Front 7-Baffle Moderator)'
        : 'REX-P #02 Slotted Coaxial Shroud',
      disassemblyOffset: { x: 0, y: 0.035, z: -0.09 },
    };
    otbShroudGroup.add(rexShroudMesh);

    populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
      barrelLen: baseShroudLen,
      shroudRadius: shroudRadius * 0.92,
      caliberMm: customCaliberMm,
      baffleCount: isSniperMode || isPrincessDonutFork ? 7 : 4,
      zCenter: -baseShroudLen * 0.5 - 0.055,
      yCenter: boreY,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    if (isPrincessDonutFork) {
      // PRINCESS DONUT FORK EXCLUSIVE SUB-COMPONENTS:
      // (A) Rear Concentric 250-Bar Over-the-Barrel Annular Air Reserve Sleeve (behind the Center Hermetic Bulkhead)
      const rearReserveLen = baseShroudLen * 0.48;
      const rearAnnularReserveMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
          shroudRadius * 0.91,
          shroudRadius * 0.91,
          rearReserveLen,
          24,
          1,
          true
        ),
        hpaFluidGlowMat
      );
      rearAnnularReserveMesh.rotation.x = Math.PI / 2;
      rearAnnularReserveMesh.position.set(
        0,
        boreY,
        -0.055 - rearReserveLen * 0.52
      );
      rearAnnularReserveMesh.userData = {
        subAssemblyId: 'DONUT-OTB-ANNULAR-AIR-RESERVE',
        subAssemblyTitle:
          'Princess Donut 145cc 250-Bar Concentric Over-Barrel Air Reserve (Routes via 180° Breech U-Turn behind Round)',
        disassemblyOffset: { x: 0, y: 0.045, z: -0.04 },
      };
      otbShroudGroup.add(rearAnnularReserveMesh);

      // (B) Center Gold-Anodized Hermetic Bulkhead Wall + Dual FFKM/Viton O-Rings (Separates 250B Rear Reserve from Front Reflex Moderator!)
      const bulkheadZ = -0.055 - rearReserveLen;
      const hermeticBulkheadWall = new THREE.Mesh(
        new THREE.CylinderGeometry(
          shroudRadius * 0.99,
          shroudRadius * 0.99,
          0.018,
          24
        ),
        goldBrassMat
      );
      hermeticBulkheadWall.rotation.x = Math.PI / 2;
      hermeticBulkheadWall.position.set(0, boreY, bulkheadZ);
      hermeticBulkheadWall.userData = {
        subAssemblyId: 'DONUT-HERMETIC-BULKHEAD-SEPARATOR',
        subAssemblyTitle:
          'Princess Donut Center Hermetic Bulkhead Wall (Isolates 250-Bar Rear Air Reserve from Front K-Baffle Moderator)',
        disassemblyOffset: { x: 0, y: 0.055, z: -0.08 },
      };
      otbShroudGroup.add(hermeticBulkheadWall);

      // (C) Sliding Barrel 12° Tapered Brass Breech Cone + Triple-Redundant Watertight Seal Stack (Dual FFKM Radial O-Rings + Cyan PU-95A Face Seal)
      const taperedBreechCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.016, 0.032, 24),
        goldBrassMat
      );
      taperedBreechCone.rotation.x = Math.PI / 2;
      taperedBreechCone.position.set(0, boreY, -0.038);
      taperedBreechCone.userData = {
        subAssemblyId: 'DONUT-12DEG-TAPERED-BREECH-CONE',
        subAssemblyTitle:
          'Princess Donut 12° Tapered Brass Sliding Barrel Breech Cone (Cam-Locked by Trigger Guard)',
        disassemblyOffset: { x: 0, y: 0.032, z: 0.045 },
      };
      otbShroudGroup.add(taperedBreechCone);

      const ffkmSealMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xbe185d,
        emissiveIntensity: 0.65,
        roughness: 0.2,
      });
      for (const [sIdx, zSeal] of [-0.046, -0.036, -0.026].entries()) {
        const watertightOring = new THREE.Mesh(
          new THREE.TorusGeometry(0.0135, 0.0026, 12, 24),
          sIdx === 2 ? hpaFluidGlowMat : ffkmSealMat
        );
        watertightOring.position.set(0, boreY, zSeal);
        watertightOring.userData = {
          subAssemblyId: `DONUT-WATERTIGHT-SEAL-0${sIdx + 1}`,
          subAssemblyTitle:
            sIdx === 2
              ? 'Princess Donut PU-95A Axial Crush Face Seal (30m Subsea Watertight & 250B Gas-Tight)'
              : `Princess Donut FFKM-90 Radial Breech O-Ring #${sIdx + 1} (24.5% Cam-Locked Squeeze)`,
          disassemblyOffset: {
            x: (sIdx - 1) * 0.022,
            y: 0.042,
            z: 0.03 + sIdx * 0.018,
          },
        };
        otbShroudGroup.add(watertightOring);
      }

      // (D) Twin Stainless Linear Barrel Pull Guide Rods + Trigger-Lock Cam-Fork Linkbars (#14-DONUT-LINK)
      for (const sideX of [-0.019, 0.019]) {
        const guideRod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0036, 0.0036, 0.16, 12),
          brushedSteelMat
        );
        guideRod.rotation.x = Math.PI / 2;
        guideRod.position.set(sideX, boreY - 0.012, -0.055);
        guideRod.userData = {
          subAssemblyId:
            sideX < 0 ? 'DONUT-GUIDE-ROD-LEFT' : 'DONUT-GUIDE-ROD-RIGHT',
          subAssemblyTitle:
            'Princess Donut Precision Linear Barrel Slide Guide Rod (+38mm Trigger-Lock Pull Travel)',
          disassemblyOffset: { x: sideX * 2.2, y: -0.025, z: -0.04 },
        };
        otbShroudGroup.add(guideRod);
      }
    }

    // Barrel Retaining Holder & Centering Bushing (#02-B)
    const barrelHolderBushingGeo = new THREE.CylinderGeometry(
      shroudRadius * 0.98,
      shroudRadius * 0.98,
      0.022,
      24
    );
    barrelHolderBushingGeo.rotateX(Math.PI / 2);
    const barrelHolderBushing = new THREE.Mesh(barrelHolderBushingGeo, goldBrassMat);
    barrelHolderBushing.position.set(0, boreY, -0.065);
    otbShroudGroup.add(barrelHolderBushing);

    if (isSniperMode) {
      // Extended REX Sniper 8-Chamber Front Reflex Moderator (#02-SNIPER)
      const sniperModLen = 0.28;
      const sniperModTube = createCsgHollowSlottedTube({
        outerRadius: shroudRadius * 1.18,
        innerRadius: shroudRadius * 0.84,
        length: sniperModLen,
        radialSegments: 26,
        slotCount: 4,
        slotWidth: 0.01,
        slotLength: 0.028,
        material: outerShroudGlassOrMetalMat,
      });
      const modZ = -baseShroudLen - sniperModLen * 0.5 - 0.055;
      sniperModTube.position.set(0, boreY, modZ);
      customCadGroup.add(sniperModTube);

      populateConcentricBarrelAndSilencerSubcomponents(customCadGroup, {
        barrelLen: sniperModLen * 0.94,
        shroudRadius: shroudRadius * 1.1,
        caliberMm: customCaliberMm,
        baffleCount: 8,
        zCenter: modZ,
        yCenter: boreY,
        linerMat: brushedSteelMat,
        baffleMat: silencerBaffleMat,
        riflingMat: goldBrassMat,
      });

      // Folding Front Tactical Sniper Bipod Legs attached to Lower Picatinny Adapter
      const bipodMountBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.022, 0.048),
        darkGunmetalMat
      );
      bipodMountBlock.position.set(0, boreY - shroudRadius - 0.01, -0.34);
      foregripCamGroup.add(bipodMountBlock);

      for (const sideX of [-0.028, 0.028]) {
        const bipodLegGeo = new THREE.CylinderGeometry(0.007, 0.006, 0.21, 14);
        const bipodLeg = new THREE.Mesh(bipodLegGeo, brushedSteelMat);
        bipodLeg.position.set(sideX * 1.6, boreY - 0.125, -0.35);
        bipodLeg.rotation.z = sideX > 0 ? -0.22 : 0.22;
        bipodLeg.rotation.x = 0.14;
        foregripCamGroup.add(bipodLeg);

        const rubberFoot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.011, 0.012, 0.018, 14),
          darkGunmetalMat
        );
        rubberFoot.position.set(sideX * 2.3, boreY - 0.225, -0.365);
        foregripCamGroup.add(rubberFoot);
      }
    } else {
      // Knurled Muzzle Stripping Cap & Crown (#01)
      const muzzleCapGeo = new THREE.CylinderGeometry(
        shroudRadius * 1.06,
        shroudRadius * 1.06,
        0.026,
        24
      );
      muzzleCapGeo.rotateX(Math.PI / 2);
      const muzzleCap = new THREE.Mesh(
        muzzleCapGeo,
        isPrincessDonutFork ? goldBrassMat : brushedSteelMat
      );
      muzzleCap.position.set(0, boreY, -baseShroudLen - 0.068);
      muzzleCap.userData = {
        subAssemblyId: isPrincessDonutFork
          ? 'DONUT-DUCKBILL-WATERTIGHT-MUZZLE-CAP'
          : 'REX-01-MUZZLE-CAP',
        subAssemblyTitle: isPrincessDonutFork
          ? 'Princess Donut Royal Gold Muzzle Cap with Self-Healing Silicone Hydro-Check Purge Lip'
          : 'REX-P #01 Knurled Muzzle Cap',
        disassemblyOffset: { x: 0, y: 0, z: -0.14 },
      };
      otbShroudGroup.add(muzzleCap);
    }

    // 2. Monolithic CNC Receiver Body (#08) with Stepped Side Flats & Single-Shot Loading Window
    const receiverTubeGeo = new THREE.CylinderGeometry(
      shroudRadius * 0.98,
      shroudRadius * 0.98,
      0.24,
      26
    );
    receiverTubeGeo.rotateX(Math.PI / 2);
    const receiverTube = new THREE.Mesh(receiverTubeGeo, receiverMat);
    receiverTube.position.set(0, boreY, 0.065);
    manifoldCoreGroup.add(receiverTube);

    const receiverLowerBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.044, 0.22),
      receiverMat
    );
    receiverLowerBlock.position.set(0, boreY - 0.024, 0.068);
    manifoldCoreGroup.add(receiverLowerBlock);

    // Exposed Single-Shot Breech Loading Trough + Dual Concentric NBR90 Breech O-Rings (#05 & #06)
    const exposedBreechThroatGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.085, 20);
    exposedBreechThroatGeo.rotateX(Math.PI / 2);
    const exposedBreechThroat = new THREE.Mesh(exposedBreechThroatGeo, brushedSteelMat);
    exposedBreechThroat.position.set(0, boreY, -0.015);
    manifoldCoreGroup.add(exposedBreechThroat);

    const redOringMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });
    for (const zOring of [-0.036, 0.008]) {
      const breechOring = new THREE.Mesh(
        new THREE.TorusGeometry(0.013, 0.0028, 12, 24),
        redOringMat
      );
      breechOring.position.set(0, boreY, zOring);
      manifoldCoreGroup.add(breechOring);
    }

    // 3. Cylindrical Axial Breech Slide Sleeve (#11) + Knurled Finger Collar + Chambered Slug
    const breechSlideGeo = new THREE.CylinderGeometry(
      shroudRadius * 0.92,
      shroudRadius * 0.92,
      0.088,
      24
    );
    breechSlideGeo.rotateX(Math.PI / 2);
    const breechSlideMesh = new THREE.Mesh(breechSlideGeo, brushedSteelMat);
    breechSlideMesh.position.set(0, boreY, -0.012);
    rotaryMagGroup.add(breechSlideMesh);

    const knurledCollarGeo = new THREE.CylinderGeometry(
      shroudRadius * 1.06,
      shroudRadius * 1.06,
      0.022,
      28
    );
    knurledCollarGeo.rotateX(Math.PI / 2);
    const knurledCollar = new THREE.Mesh(knurledCollarGeo, crimsonAnodizedMat);
    knurledCollar.position.set(0, boreY, -0.044);
    rotaryMagGroup.add(knurledCollar);

    const slugRadius = 0.0045 + (customCaliberMm / 12.7) * 0.005;
    const singleSlugGeo = new THREE.ConeGeometry(slugRadius, 0.028, 18);
    singleSlugGeo.rotateX(-Math.PI / 2);
    const singleSlugMesh = new THREE.Mesh(singleSlugGeo, goldBrassMat);
    singleSlugMesh.position.set(0, boreY, -0.022);
    singleSlugMesh.userData = {
      isRexPSingleRoundSlug: true,
      baseY: boreY,
      baseZ: -0.022,
    };
    rotaryMagGroup.add(singleSlugMesh);

    // 4. High-Profile Cantilever Picatinny Scope Mount Rail (#29) + Optional 4-16×50 Sniper Scope
    for (const zStrut of [0.085, -0.115]) {
      const strutGeo = new THREE.BoxGeometry(0.022, 0.048, 0.024);
      const strutMesh = new THREE.Mesh(strutGeo, darkGunmetalMat);
      strutMesh.position.set(0, 0.096, zStrut);
      strutMesh.rotation.x = -0.28;
      handguardGroup.add(strutMesh);
    }
    const railGeo = new THREE.BoxGeometry(0.032, 0.014, 0.32);
    const railMesh = new THREE.Mesh(railGeo, darkGunmetalMat);
    railMesh.position.set(0, 0.122, -0.035);
    handguardGroup.add(railMesh);

    if (isSniperMode) {
      // Complete 4-16×50 Long-Range Side-Parallax Sniper Riflescope + Dual Picatinny Scope Rings
      const scopeY = 0.162;
      for (const ringZ of [-0.095, 0.025]) {
        const ringMount = new THREE.Mesh(
          new THREE.BoxGeometry(0.036, 0.038, 0.022),
          darkGunmetalMat
        );
        ringMount.position.set(0, 0.142, ringZ);
        handguardGroup.add(ringMount);
      }

      const mainTubeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.28, 22);
      mainTubeGeo.rotateX(Math.PI / 2);
      const mainTube = new THREE.Mesh(mainTubeGeo, darkGunmetalMat);
      mainTube.position.set(0, scopeY, -0.035);
      handguardGroup.add(mainTube);

      // Front 50mm Objective Bell & Sunshade + Cyan Coated Lens
      const objBellGeo = new THREE.CylinderGeometry(0.028, 0.016, 0.085, 24);
      objBellGeo.rotateX(Math.PI / 2);
      const objBell = new THREE.Mesh(objBellGeo, darkGunmetalMat);
      objBell.position.set(0, scopeY, -0.205);
      handguardGroup.add(objBell);

      const objLensGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.006, 22);
      objLensGeo.rotateX(Math.PI / 2);
      const objLens = new THREE.Mesh(objLensGeo, hpaFluidGlowMat);
      objLens.position.set(0, scopeY, -0.246);
      handguardGroup.add(objLens);

      // Rear Ocular Bell & Fast-Focus Eyepiece
      const ocularBellGeo = new THREE.CylinderGeometry(0.016, 0.023, 0.072, 22);
      ocularBellGeo.rotateX(Math.PI / 2);
      const ocularBell = new THREE.Mesh(ocularBellGeo, darkGunmetalMat);
      ocularBell.position.set(0, scopeY, 0.125);
      handguardGroup.add(ocularBell);

      // Elevation & Side-Parallax Turret Knobs
      const elevTurret = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, 0.024, 16),
        goldBrassMat
      );
      elevTurret.position.set(0, scopeY + 0.022, -0.035);
      handguardGroup.add(elevTurret);
    }

    // 5. REBUILT KOREAN 57-PART TRIGGER & UNDERLEVER GROUP (#14–#20 + #31)
    // #15 Front Underlever Pivot Axle at front of receiver (plenumGroup pivots around this point!)
    plenumGroup.position.set(0, -0.008, -0.032);

    const frontPivotPin15 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.048, 16),
      goldBrassMat
    );
    frontPivotPin15.rotation.z = Math.PI / 2;
    frontPivotPin15.position.set(0, 0, 0);
    plenumGroup.add(frontPivotPin15);

    // #14 5-Hole Skeletonized Underlever Cocking Guard (pivots from z=0 back to z=+0.22)
    const leverBowGeo = new THREE.BoxGeometry(0.022, 0.038, 0.215);
    let leverBrush = new Brush(leverBowGeo);
    leverBrush.updateMatrixWorld();
    try {
      for (let h = 0; h < 5; h++) {
        const holeGeo = new THREE.CylinderGeometry(0.0095, 0.0095, 0.04, 14);
        holeGeo.rotateZ(Math.PI / 2);
        const holeBrush = new Brush(holeGeo);
        holeBrush.position.set(0, 0, -0.072 + h * 0.036);
        holeBrush.updateMatrixWorld();
        leverBrush = _csgEvaluator.evaluate(leverBrush, holeBrush, SUBTRACTION);
      }
    } catch {
      // Fallback if CSG skipped
    }
    const leverMesh = new THREE.Mesh(leverBrush.geometry, brushedSteelMat);
    leverMesh.position.set(0, -0.046, 0.105);
    plenumGroup.add(leverMesh);

    // Front Clevis Strut connecting #15 Pivot Pin to #14 5-Hole Underlever Beam
    const frontLeverClevis = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.048, 0.024),
      brushedSteelMat
    );
    frontLeverClevis.position.set(0, -0.024, 0.008);
    plenumGroup.add(frontLeverClevis);

    // #16 Dedicated CNC Inner Trigger Guard Bow + Curved 2-Stage Gold Match Trigger Blade
    const innerTriggerBow = new THREE.Mesh(
      new THREE.TorusGeometry(0.026, 0.0038, 10, 20, Math.PI * 1.15),
      darkGunmetalMat
    );
    innerTriggerBow.rotation.y = Math.PI / 2;
    innerTriggerBow.position.set(0, -0.026, 0.055);
    pumpLinkageGroup.add(innerTriggerBow);

    const triggerBlade16 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.007, 0.036, 12),
      goldBrassMat
    );
    triggerBlade16.position.set(0, -0.024, 0.055);
    triggerBlade16.rotation.x = 0.28;
    pumpLinkageGroup.add(triggerBlade16);

    // #17 Horizontal Sear Transfer Bar (68mm × 4mm 17-4PH linkage connecting #16 Trigger to #18 Rear Sear)
    const searTransferBar17 = new THREE.Mesh(
      new THREE.BoxGeometry(0.009, 0.006, 0.095),
      brushedSteelMat
    );
    searTransferBar17.position.set(0, 0.002, 0.095);
    pumpLinkageGroup.add(searTransferBar17);

    // #18 Hardened Primary Sear Dog & Striker Catch Hook (A2 Tool Steel HRC 58)
    const primarySearDog18 = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, 0.028, 0.022),
      crimsonAnodizedMat
    );
    primarySearDog18.position.set(0, 0.018, 0.142);
    pumpLinkageGroup.add(primarySearDog18);

    // #19 Dual Helical Sear Return & Trigger Weight Coil Springs
    for (const zSpr of [0.068, 0.138]) {
      const searSpring19 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0045, 0.022, 10),
        goldBrassMat
      );
      searSpring19.position.set(0, -0.006, zSpr);
      pumpLinkageGroup.add(searSpring19);
    }

    // #20 Cross-Bolt Manual Safety Plunger (Red/Silver Anodized)
    const crossBoltSafety20 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.048, 14),
      crimsonAnodizedMat
    );
    crossBoltSafety20.rotation.z = Math.PI / 2;
    crossBoltSafety20.position.set(0, -0.008, 0.036);
    pumpLinkageGroup.add(crossBoltSafety20);

    // #31 Coaxial Linear Striker Sleeve & Hammer Spring driving #32 Poppet
    const coaxialStriker31 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.052, 18),
      brushedSteelMat
    );
    coaxialStriker31.rotation.x = Math.PI / 2;
    coaxialStriker31.position.set(0, boreY, 0.128);
    pumpLinkageGroup.add(coaxialStriker31);

    // #28 Ergonomic Checkered Target Pistol Grip
    const rexGripGeo = new THREE.BoxGeometry(0.042, 0.148, 0.056);
    const rexGrip = new THREE.Mesh(rexGripGeo, darkGunmetalMat);
    rexGrip.position.set(0, -0.082, 0.115);
    rexGrip.rotation.x = -0.28;
    manifoldCoreGroup.add(rexGrip);

    // 6. Coaxial In-Line Poppet Valve (#30-#35) + Rear 250-Bar Air Cylinder (#37) + Axial Manometer (#40)
    const rearTankLen = isSniperMode ? 0.42 : 0.29;
    const rearTankRadius = isSniperMode ? 0.036 : 0.031;

    // High-Pressure Coaxial Valve Housing Manifold (#34) + Gold Assemble Cap (#33) + PEEK Poppet Stem (#32)
    const valveHousingGeo = new THREE.CylinderGeometry(
      rearTankRadius * 1.02,
      rearTankRadius * 1.02,
      0.055,
      24
    );
    valveHousingGeo.rotateX(Math.PI / 2);
    const valveHousing = new THREE.Mesh(valveHousingGeo, brushedSteelMat);
    valveHousing.position.set(0, boreY, 0.195);
    buttstockGroup.add(valveHousing);

    const poppetValveGeo = new THREE.ConeGeometry(0.018, 0.045, 18);
    poppetValveGeo.rotateX(Math.PI / 2);
    const poppetValve = new THREE.Mesh(poppetValveGeo, goldBrassMat);
    poppetValve.position.set(0, boreY, 0.165);
    buttstockGroup.add(poppetValve);

    // Rear Coaxial 250-Bar Air Tank (#37)
    const rearTankTube = createCsgHollowSlottedTube({
      outerRadius: rearTankRadius,
      innerRadius: rearTankRadius * 0.78,
      length: rearTankLen,
      radialSegments: 26,
      slotCount: 0,
      material: outerShroudGlassOrMetalMat,
    });
    const tankCenterZ = 0.22 + rearTankLen * 0.5;
    rearTankTube.position.set(0, boreY, tankCenterZ);
    buttstockGroup.add(rearTankTube);

    const hpaCoreGeo = new THREE.CylinderGeometry(
      rearTankRadius * 0.72,
      rearTankRadius * 0.72,
      rearTankLen * 0.88,
      18
    );
    hpaCoreGeo.rotateX(Math.PI / 2);
    const hpaCore = new THREE.Mesh(hpaCoreGeo, hpaFluidGlowMat);
    hpaCore.position.set(0, boreY, tankCenterZ);
    buttstockGroup.add(hpaCore);

    // Rear Check Valve Endcap (#38) + Axial 0-300 Bar Luminous Manometer (#40) + Rotary Dust Cover (#41)
    const rearEndZ = 0.22 + rearTankLen;
    const endcapGeo = new THREE.CylinderGeometry(
      rearTankRadius * 1.03,
      rearTankRadius * 1.03,
      0.036,
      24
    );
    endcapGeo.rotateX(Math.PI / 2);
    const endcapMesh = new THREE.Mesh(endcapGeo, brushedSteelMat);
    endcapMesh.position.set(0, boreY, rearEndZ + 0.016);
    buttstockGroup.add(endcapMesh);

    const axialGaugeGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.014, 20);
    axialGaugeGeo.rotateX(Math.PI / 2);
    const axialGauge = new THREE.Mesh(axialGaugeGeo, goldBrassMat);
    axialGauge.position.set(0, boreY, rearEndZ + 0.036);
    buttstockGroup.add(axialGauge);

    // Detail Upgrade #1 for REX-P: Luminous 250-Bar Manometer Dial Face + Indicator Needle (#40) & Knurled Rotary Foster Dust Cap (#41)
    const gaugeDialFace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.017, 0.004, 20),
      hpaFluidGlowMat
    );
    gaugeDialFace.rotation.x = Math.PI / 2;
    gaugeDialFace.position.set(0, boreY, rearEndZ + 0.043);
    buttstockGroup.add(gaugeDialFace);

    const gaugeNeedle = new THREE.Mesh(
      new THREE.BoxGeometry(0.0022, 0.014, 0.002),
      crimsonAnodizedMat
    );
    gaugeNeedle.position.set(0.003, boreY + 0.004, rearEndZ + 0.045);
    gaugeNeedle.rotation.z = -0.65;
    buttstockGroup.add(gaugeNeedle);

    const rotaryDustCollar41 = new THREE.Mesh(
      new THREE.CylinderGeometry(
        rearTankRadius * 1.06,
        rearTankRadius * 1.06,
        0.018,
        28
      ),
      crimsonAnodizedMat
    );
    rotaryDustCollar41.rotation.x = Math.PI / 2;
    rotaryDustCollar41.position.set(0, boreY, rearEndZ + 0.004);
    buttstockGroup.add(rotaryDustCollar41);

    // Detail Upgrade #2 for REX-P: Spring-Loaded Breech Slide Ball Detent Plunger & Set Screw (#58 & #59)
    const breechBallDetent = new THREE.Mesh(
      new THREE.SphereGeometry(0.0042, 12, 12),
      goldBrassMat
    );
    breechBallDetent.position.set(0, boreY + shroudRadius * 0.95, -0.044);
    rotaryMagGroup.add(breechBallDetent);

    if (isSniperMode) {
      // REX Sniper Adjustable Cheek Rest (#58) + Drop-Down Carbon Reserve Cylinder + Ventilated Recoil Buttpad (#59)
      const cheekRestGeo = new THREE.BoxGeometry(0.056, 0.034, 0.19);
      const cheekRest = new THREE.Mesh(cheekRestGeo, crimsonAnodizedMat);
      cheekRest.position.set(0, boreY + 0.042, tankCenterZ + 0.02);
      buttstockGroup.add(cheekRest);

      const lowerStockBottleGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.32, 20);
      lowerStockBottleGeo.rotateX(Math.PI / 2);
      const lowerStockBottle = new THREE.Mesh(lowerStockBottleGeo, darkGunmetalMat);
      lowerStockBottle.position.set(0, boreY - 0.058, tankCenterZ + 0.02);
      buttstockGroup.add(lowerStockBottle);

      const sniperButtpadGeo = new THREE.BoxGeometry(0.054, 0.175, 0.034);
      const sniperButtpad = new THREE.Mesh(sniperButtpadGeo, crimsonAnodizedMat);
      sniperButtpad.position.set(0, boreY - 0.032, rearEndZ + 0.052);
      buttstockGroup.add(sniperButtpad);
    }

    return {
      root,
      familyContext,
      otbShroudGroup,
      plenumGroup,
      handguardGroup,
      buttstockGroup,
      rotaryMagGroup,
      pumpLinkageGroup,
      foregripCamGroup,
      manifoldCoreGroup,
      customCadGroup,
      airflowStreamGroup,
    };
  }

  // ==========================================================================
  // FAMILY 3: EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY
  // Complete High-Precision Rework: Korean Evanix MP30 (.30 Cal / 7.62mm Dual-Cylinder 300cc Tactical PCP SMG)
  // ==========================================================================
  if (familyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY') {
    const barrelLen = 0.56;
    const shroudRadius = 0.025;
    const boreY = 0.068;

    // 1. MP30-03 & MP30-04: 270mm Korean Choked .30 Cal (7.62mm) Match Barrel & Ø34mm 10-Chamber K-Baffle Whisper Shroud (otbShroudGroup)
    const mp30Shroud = createCsgHollowSlottedTube({
      outerRadius: shroudRadius,
      innerRadius: shroudRadius * 0.76,
      length: barrelLen,
      radialSegments: 26,
      slotCount: 8,
      slotWidth: 0.011,
      slotLength: 0.028,
      material: outerShroudGlassOrMetalMat,
    });
    mp30Shroud.position.set(0, boreY, -barrelLen * 0.45);
    mp30Shroud.userData = {
      subAssemblyId: 'MP30-04_WHISPER_SHROUD',
      subAssemblyTitle: 'MP30-04: Ø34.0mm 10-Chamber K-Baffle Whisper Moderator Shroud',
    };
    otbShroudGroup.add(mp30Shroud);

    populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
      barrelLen,
      shroudRadius: shroudRadius * 0.9,
      caliberMm: customCaliberMm,
      baffleCount: 8,
      zCenter: -barrelLen * 0.45,
      yCenter: boreY,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    // Threaded 1/2"-20 UNF Knurled Front Muzzle Endcap + Brass Barrel Leade Cone
    const muzzleThreadCap = new THREE.Mesh(
      new THREE.CylinderGeometry(shroudRadius * 1.04, shroudRadius * 0.96, 0.028, 24),
      brushedSteelMat
    );
    muzzleThreadCap.rotation.x = Math.PI / 2;
    muzzleThreadCap.position.set(0, boreY, -barrelLen * 0.95 - 0.01);
    otbShroudGroup.add(muzzleThreadCap);

    // 2. MP30-05 & MP30-06: Dual Over-Under 300cc (2 × 150cc) 250-Bar High-Pressure Air Cylinders (plenumGroup)
    const cylLen = 0.45;
    const cylRadius = 0.0215;
    for (const [cIdx, cylY] of [0.016, -0.029].entries()) {
      const dualCylOuter = createCsgHollowSlottedTube({
        outerRadius: cylRadius,
        innerRadius: cylRadius * 0.76,
        length: cylLen,
        radialSegments: 24,
        slotCount: 3,
        slotWidth: 0.009,
        slotLength: 0.036,
        material: outerShroudGlassOrMetalMat,
      });
      dualCylOuter.position.set(0, cylY, -0.255);
      dualCylOuter.userData = {
        subAssemblyId: `MP30_DUAL_CYL_${cIdx + 1}`,
        subAssemblyTitle: `MP30-0${cIdx + 5}: ${cIdx === 0 ? 'Upper' : 'Lower'} 150cc 250-Bar Seamless Air Cylinder (300cc Combined)`,
      };
      plenumGroup.add(dualCylOuter);

      // Glowing 250-Bar HPA Fluid Core inside each 150cc cylinder
      const dualCylGlowGeo = new THREE.CylinderGeometry(
        cylRadius * 0.72,
        cylRadius * 0.72,
        cylLen * 0.9,
        20
      );
      dualCylGlowGeo.rotateX(Math.PI / 2);
      const dualCylGlow = new THREE.Mesh(dualCylGlowGeo, hpaFluidGlowMat);
      dualCylGlow.position.set(0, cylY, -0.255);
      plenumGroup.add(dualCylGlow);

      // Carbon-Weave Reinforcement Bands & Dual NBR-90 Bulkhead O-Rings on each cylinder
      for (const zBand of [-0.11, -0.41]) {
        const bulkOring = new THREE.Mesh(
          new THREE.TorusGeometry(cylRadius * 0.88, 0.0024, 10, 22),
          crimsonAnodizedMat
        );
        bulkOring.position.set(0, cylY, zBand);
        plenumGroup.add(bulkOring);
      }

      // MP30 Quick-Detach (QD) Self-Sealing M18×1.5 Dry-Break Bayonet Valve at Rear of each 150cc Cylinder
      const qdBayonetCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(cylRadius * 1.08, cylRadius * 1.02, 0.028, 12),
        goldBrassMat
      );
      qdBayonetCollar.rotation.x = Math.PI / 2;
      qdBayonetCollar.position.set(0, cylY, -0.028);
      qdBayonetCollar.userData = {
        subAssemblyId: `MP30-QD-VALVE-${cIdx + 1}`,
        subAssemblyTitle: `MP30-QD-0${cIdx + 1}: Self-Sealing M18×1.5 Dry-Break Quick-Detach Cylinder Valve (Zero-Loss Hot-Swap)`,
      };
      plenumGroup.add(qdBayonetCollar);

      // Front Anodized Bulkhead Cap + Upper Wika 250B Manometer / Lower Male Foster Quick-Fill Nipple
      const frontBulkhead = new THREE.Mesh(
        new THREE.CylinderGeometry(cylRadius * 1.02, cylRadius * 1.02, 0.022, 22),
        brushedSteelMat
      );
      frontBulkhead.rotation.x = Math.PI / 2;
      frontBulkhead.position.set(0, cylY, -0.255 - cylLen * 0.5 - 0.008);
      plenumGroup.add(frontBulkhead);

      const frontNippleOrGauge = new THREE.Mesh(
        new THREE.CylinderGeometry(
          cIdx === 0 ? cylRadius * 0.78 : 0.0065,
          cIdx === 0 ? cylRadius * 0.78 : 0.0065,
          cIdx === 0 ? 0.012 : 0.024,
          18
        ),
        goldBrassMat
      );
      frontNippleOrGauge.rotation.x = Math.PI / 2;
      frontNippleOrGauge.position.set(0, cylY, -0.255 - cylLen * 0.5 - 0.024);
      plenumGroup.add(frontNippleOrGauge);
    }

    // 3. MP30-07 & MP30-08: Twin CNC Figure-8 Over-Under Regulator Manifold & 165-Bar Belleville Regulator + 48cc Receiver Plenum
    for (const [bIdx, zBridge] of [-0.135, -0.375].entries()) {
      const fig8Bridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.054, 0.138, 0.028),
        brushedSteelMat
      );
      fig8Bridge.position.set(0, 0.02, zBridge);
      fig8Bridge.userData = {
        subAssemblyId: `MP30-07_FIG8_BRIDGE_${bIdx + 1}`,
        subAssemblyTitle: 'MP30-07: CNC Twin Figure-8 Over-Under Regulator Manifold & Harmonic Truss Clamp',
      };
      plenumGroup.add(fig8Bridge);

      // Dual M5×18mm 12.9 Truss Pinch Bolts on each Figure-8 Bridge
      for (const yBolt of [0.044, -0.006]) {
        const pinchBolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.004, 0.058, 12),
          goldBrassMat
        );
        pinchBolt.rotation.z = Math.PI / 2;
        pinchBolt.position.set(0, yBolt, zBridge);
        plenumGroup.add(pinchBolt);
      }
    }

    // 165-Bar Belleville Regulator Cartridge & 48cc Vertical Firing Plenum + Side 165B Wika Manometer
    const bellevilleRegCartridge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.068, 18),
      goldBrassMat
    );
    bellevilleRegCartridge.rotation.x = Math.PI / 2;
    bellevilleRegCartridge.position.set(0, -0.006, -0.035);
    plenumGroup.add(bellevilleRegCartridge);

    const vertical48ccPlenum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.019, 0.088, 20),
      hpaFluidGlowMat
    );
    vertical48ccPlenum.position.set(0, 0.022, 0.005);
    vertical48ccPlenum.userData = {
      subAssemblyId: 'MP30-08_48CC_PLENUM',
      subAssemblyTitle: 'MP30-08: 48cc Regulated Vertical Firing Plenum (165 Bar Setpoint)',
    };
    plenumGroup.add(vertical48ccPlenum);

    const sideRegulatedGauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.016, 18),
      goldBrassMat
    );
    sideRegulatedGauge.rotation.z = Math.PI / 2;
    sideRegulatedGauge.position.set(0.034, 0.015, -0.015);
    plenumGroup.add(sideRegulatedGauge);

    // MP30-09: High-Flow Balanced PEEK Poppet Valve & Ø6.2mm Vertical Transfer Port
    const peekPoppetValve = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.034, 16),
      goldBrassMat
    );
    peekPoppetValve.rotation.x = -Math.PI / 2;
    peekPoppetValve.position.set(0, 0.038, 0.015);
    plenumGroup.add(peekPoppetValve);

    // 4. MP30-01 & MP30-02: Monolithic CNC 7075-T6 Billet Upper SMG Receiver (with Lightening Pockets) + Lower Flared SMG Receiver
    const smgUpperReceiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.062, 0.074, 0.31),
      receiverMat
    );
    smgUpperReceiver.position.set(0, 0.052, 0.035);
    smgUpperReceiver.userData = {
      subAssemblyId: 'MP30-01_UPPER_RECEIVER',
      subAssemblyTitle: 'MP30-01: Monolithic CNC 7075-T6 Billet Upper SMG Receiver',
    };
    manifoldCoreGroup.add(smgUpperReceiver);

    // 4× Machined Side Weight-Reduction Lightening Pockets & Engraved Serial Plate on Upper Receiver
    for (const sideX of [-0.032, 0.032]) {
      for (let p = 0; p < 3; p++) {
        const pocketInsert = new THREE.Mesh(
          new THREE.BoxGeometry(0.004, 0.022, 0.044),
          darkGunmetalMat
        );
        pocketInsert.position.set(sideX, 0.056, -0.055 + p * 0.062);
        manifoldCoreGroup.add(pocketInsert);
      }
    }

    const smgLowerReceiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.056, 0.054, 0.25),
      darkGunmetalMat
    );
    smgLowerReceiver.position.set(0, -0.004, 0.045);
    manifoldCoreGroup.add(smgLowerReceiver);

    // Flared SMG Magwell Collar + Captive Cross-Lock Takedown Pins (MP30-SCR-04)
    const flaredMagwellCollar = new THREE.Mesh(
      new THREE.BoxGeometry(0.064, 0.028, 0.076),
      crimsonAnodizedMat
    );
    flaredMagwellCollar.position.set(0, -0.028, -0.035);
    manifoldCoreGroup.add(flaredMagwellCollar);

    for (const zPin of [-0.055, 0.135]) {
      const takedownPin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.066, 14),
        goldBrassMat
      );
      takedownPin.rotation.z = Math.PI / 2;
      takedownPin.position.set(0, 0.012, zPin);
      manifoldCoreGroup.add(takedownPin);
    }

    // 5. Full-Length MIL-STD-1913 Top Picatinny Rail + Free-Float M-LOK Handguard + Reflex Red-Dot Sight (handguardGroup)
    const fullTopRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.014, 0.56),
      darkGunmetalMat
    );
    fullTopRail.position.set(0, 0.098, -0.085);
    handguardGroup.add(fullTopRail);

    for (let lug = 0; lug < 15; lug++) {
      const picLug = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.005, 0.012),
        brushedSteelMat
      );
      picLug.position.set(0, 0.106, 0.16 - lug * 0.035);
      handguardGroup.add(picLug);
    }

    // Top Reflex Red-Dot Optic Housing + Glowing Illuminated Reticle Lens
    const reflexBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.038, 0.018, 0.068),
      darkGunmetalMat
    );
    reflexBase.position.set(0, 0.116, 0.02);
    handguardGroup.add(reflexBase);

    const reflexHood = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.0045, 10, 20, Math.PI),
      crimsonAnodizedMat
    );
    reflexHood.position.set(0, 0.126, 0.005);
    handguardGroup.add(reflexHood);

    const reflexLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.004, 18),
      hpaFluidGlowMat
    );
    reflexLens.rotation.x = Math.PI / 2;
    reflexLens.position.set(0, 0.134, 0.005);
    handguardGroup.add(reflexLens);

    // 6. MP30-10: Articulated Biathlon Side-Lever Cocking Handle, Toggle Bar & .30 Cal Stainless Bolt Probe
    const sideLeverTrack = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.014, 0.135),
      brushedSteelMat
    );
    sideLeverTrack.position.set(0.036, 0.056, 0.065);
    pumpLinkageGroup.add(sideLeverTrack);

    const toggleLinkageArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.012, 0.085),
      goldBrassMat
    );
    toggleLinkageArm.position.set(0.044, 0.056, 0.095);
    toggleLinkageArm.rotation.y = 0.18;
    pumpLinkageGroup.add(toggleLinkageArm);

    const biathlonDropHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0075, 0.009, 0.052, 16),
      crimsonAnodizedMat
    );
    biathlonDropHandle.position.set(0.052, 0.034, 0.125);
    pumpLinkageGroup.add(biathlonDropHandle);

    const mp30BoltProbe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0068, 0.0068, 0.135, 18),
      brushedSteelMat
    );
    mp30BoltProbe.rotation.x = Math.PI / 2;
    mp30BoltProbe.position.set(0, boreY, 0.045);
    customCadGroup.add(mp30BoltProbe);

    const probeSealOring = new THREE.Mesh(
      new THREE.TorusGeometry(0.0075, 0.002, 10, 18),
      crimsonAnodizedMat
    );
    probeSealOring.position.set(0, boreY, -0.012);
    customCadGroup.add(probeSealOring);

    // 7. MP30-11: 9-Round .30 Cal Auto-Indexing Rotary Magazine Cassette (grouped so slugs stay inside drum!) + Lower Spare-Mag Tower (rotaryMagGroup)
    const mp30RotaryDrumCassette = new THREE.Group();
    mp30RotaryDrumCassette.position.set(0, boreY + 0.008, -0.015);
    mp30RotaryDrumCassette.userData = {
      subAssemblyId: 'MP30-11_ROTARY_DRUM_CASSETTE',
      subAssemblyTitle: 'MP30-11: 12-Round .30 Cal Auto-Indexing Rotary Magazine Cassette',
      disassemblyOffset: { x: 0, y: 0.042, z: 0 },
    };
    const rotaryCassette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.026, 20),
      crimsonAnodizedMat
    );
    rotaryCassette.rotation.x = Math.PI / 2;
    mp30RotaryDrumCassette.add(rotaryCassette);

    for (let s = 0; s < 9; s++) {
      const ang = (s / 9) * Math.PI * 2;
      const slugMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0045, 0.022, 10),
        goldBrassMat
      );
      slugMesh.rotation.x = Math.PI / 2;
      slugMesh.position.set(Math.cos(ang) * 0.022, Math.sin(ang) * 0.022, 0);
      mp30RotaryDrumCassette.add(slugMesh);
    }
    rotaryMagGroup.add(mp30RotaryDrumCassette);

    const lowerSmgMagTower = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.142, 0.058),
      darkGunmetalMat
    );
    lowerSmgMagTower.position.set(0, -0.088, -0.035);
    lowerSmgMagTower.rotation.x = 0.1;
    rotaryMagGroup.add(lowerSmgMagTower);

    // 8. Forward M-LOK Vertical Foregrip + AR-15 Beavertail Pistol Grip & 2-Stage Match Trigger (foregripCamGroup & manifoldCoreGroup)
    foregripCamGroup.position.set(0, -0.02, -0.32);
    const mlokMountPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.038, 0.016, 0.085),
      brushedSteelMat
    );
    mlokMountPlate.position.set(0, -0.024, 0);
    foregripCamGroup.add(mlokMountPlate);

    const verticalForegrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.022, 0.118, 20),
      darkGunmetalMat
    );
    verticalForegrip.position.set(0, -0.085, 0);
    foregripCamGroup.add(verticalForegrip);

    const arPistolGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.148, 0.058),
      darkGunmetalMat
    );
    arPistolGrip.position.set(0, -0.086, 0.115);
    arPistolGrip.rotation.x = -0.26;
    manifoldCoreGroup.add(arPistolGrip);

    const winterTriggerGuard = new THREE.Mesh(
      new THREE.TorusGeometry(0.028, 0.004, 10, 20, Math.PI * 1.1),
      brushedSteelMat
    );
    winterTriggerGuard.rotation.y = Math.PI / 2;
    winterTriggerGuard.position.set(0, -0.036, 0.062);
    manifoldCoreGroup.add(winterTriggerGuard);

    const mp30TriggerBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.034, 0.012),
      goldBrassMat
    );
    mp30TriggerBlade.position.set(0, -0.036, 0.062);
    mp30TriggerBlade.rotation.x = 0.24;
    manifoldCoreGroup.add(mp30TriggerBlade);

    // 9. MP30-12: 180° Left-Side Folding Knuckle & 6-Position Telescoping M4 Tactical Buttstock (buttstockGroup)
    const foldingStockKnuckle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.019, 0.068, 18),
      brushedSteelMat
    );
    foldingStockKnuckle.position.set(-0.028, 0.035, 0.19);
    buttstockGroup.add(foldingStockKnuckle);

    const castleLockNut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.018, 16),
      goldBrassMat
    );
    castleLockNut.rotation.x = Math.PI / 2;
    castleLockNut.position.set(0, 0.038, 0.205);
    buttstockGroup.add(castleLockNut);

    const m4BufferTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.019, 0.28, 20),
      brushedSteelMat
    );
    m4BufferTube.rotation.x = Math.PI / 2;
    m4BufferTube.position.set(0, 0.038, 0.32);
    buttstockGroup.add(m4BufferTube);

    const m4StockFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.048, 0.128, 0.185),
      darkGunmetalMat
    );
    m4StockFrame.position.set(0, 0.012, 0.37);
    buttstockGroup.add(m4StockFrame);

    const adjustableCheekRiser = new THREE.Mesh(
      new THREE.BoxGeometry(0.052, 0.028, 0.145),
      crimsonAnodizedMat
    );
    adjustableCheekRiser.position.set(0, 0.062, 0.355);
    buttstockGroup.add(adjustableCheekRiser);

    const buttpadGeo = new THREE.BoxGeometry(0.054, 0.156, 0.028);
    const buttpad = new THREE.Mesh(buttpadGeo, crimsonAnodizedMat);
    buttpad.position.set(0, 0.008, 0.472);
    buttstockGroup.add(buttpad);

    return {
      root,
      familyContext,
      otbShroudGroup,
      plenumGroup,
      handguardGroup,
      buttstockGroup,
      rotaryMagGroup,
      pumpLinkageGroup,
      foregripCamGroup,
      manifoldCoreGroup,
      customCadGroup,
      airflowStreamGroup,
    };
  }

  // ==========================================================================
  // FAMILY 4: LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY
  // ==========================================================================
  if (familyId === 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY') {
    const compactBarrelLen = 0.62;
    const silencerShroudRadius = 0.029;
    const outerAirReserveRadius = 0.052;

    const middleSilencerTube = createCsgHollowSlottedTube({
      outerRadius: silencerShroudRadius,
      innerRadius: silencerShroudRadius * 0.78,
      length: compactBarrelLen * 0.68,
      radialSegments: 24,
      slotCount: 6,
      slotWidth: 0.016,
      slotLength: 0.042,
      material: outerShroudGlassOrMetalMat,
    });
    middleSilencerTube.position.set(0, 0.06, -compactBarrelLen * 0.36);
    middleSilencerTube.userData = {
      subAssemblyId: 'LEAF-02_SLOTTED_INNER_SHROUD',
      subAssemblyTitle: 'LEAF-02: Slotted Concentric Inner Barrel Tension Cage',
      disassemblyOffset: { x: 0, y: 0.038, z: -0.09 },
    };
    handguardGroup.add(middleSilencerTube);

    populateConcentricBarrelAndSilencerSubcomponents(handguardGroup, {
      barrelLen: compactBarrelLen,
      shroudRadius: silencerShroudRadius * 0.92,
      caliberMm: customCaliberMm,
      baffleCount: 6,
      zCenter: -compactBarrelLen * 0.45,
      yCenter: 0.06,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    const outerAirReserveTube = createCsgHollowSlottedTube({
      outerRadius: outerAirReserveRadius,
      innerRadius: silencerShroudRadius * 1.08,
      length: compactBarrelLen * 0.88,
      radialSegments: 28,
      slotCount: 0,
      material: outerShroudGlassOrMetalMat,
    });
    outerAirReserveTube.position.set(0, 0.06, -compactBarrelLen * 0.43);
    otbShroudGroup.add(outerAirReserveTube);

    const annularAirRingGeo = new THREE.CylinderGeometry(
      outerAirReserveRadius * 0.92,
      outerAirReserveRadius * 0.92,
      compactBarrelLen * 0.82,
      24,
      1,
      true
    );
    annularAirRingGeo.rotateX(Math.PI / 2);
    const annularAirRing = new THREE.Mesh(annularAirRingGeo, hpaFluidGlowMat);
    annularAirRing.position.set(0, 0.06, -compactBarrelLen * 0.43);
    otbShroudGroup.add(annularAirRing);

    for (const zCap of [-compactBarrelLen * 0.87, -0.02]) {
      const capGeo = new THREE.CylinderGeometry(
        outerAirReserveRadius * 1.03,
        outerAirReserveRadius * 1.03,
        0.028,
        24
      );
      capGeo.rotateX(Math.PI / 2);
      const capMesh = new THREE.Mesh(capGeo, brushedSteelMat);
      capMesh.position.set(0, 0.06, zCap);
      otbShroudGroup.add(capMesh);
    }

    const l3RailGeo = new THREE.BoxGeometry(0.036, 0.016, compactBarrelLen * 0.85);
    const l3Rail = new THREE.Mesh(l3RailGeo, brushedSteelMat);
    l3Rail.position.set(0, 0.06 + outerAirReserveRadius + 0.01, -compactBarrelLen * 0.38);
    otbShroudGroup.add(l3Rail);
  } else if (familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
    // ========================================================================
    // FAMILY 5: REDESIGNED ASCENT × VECTIS .45 CAL 300-BAR ONBOARD-PUMP CARBINE & SNIPER VARIANT
    // - Dynamic Caliber Swap (.22 / .25 / .30 / .357 / .45 / .50): updates barrel liner bore, bolt probe, and rotary mag!
    // - Modular Over-the-Barrel (OTB) Dual-Zone Air Reserve (300B Front) + Internal Belleville Regulator Bulkhead + 210B Rear Plenum
    // - Screw-On QuietEnergy 6-Gill Silencer on visible M18×1.0 Muzzle Threads (`ascentSilencerUnscrewed`)
    // - Compound 4-Bar Over-Center Lever-Action 300-Bar Hand Pump w/ Sliding Bronze Crosshead & Telescopic Stage-2/3 Rods
    // - Optional Ascent Sniper Variant (`ascentSniperVariant`): Extended Heavy Barrel, 6-24×50 FFP Scope, Folding Carbon Bipod
    // ========================================================================
    const isSniperVariant = Boolean(familyContext.ascentSniperVariant);
    const magSpec = computeAccurateMagCapacityByWeaponAndCaliber(
      familyId,
      customCaliberMm
    );
    const boreY = 0.064;
    const totalBarrelLen = isSniperVariant ? 0.94 : 0.78;
    const otbPlenumLen = isSniperVariant ? 0.66 : 0.52; // Modular Over-Barrel Reserve + Regulated 2+ Rd Plenum
    const qeModeratorLen = isSniperVariant ? 0.30 : 0.26; // Screw-On QuietEnergy 6-Gill Vented Moderator
    const otbPlenumRadius = isSniperVariant ? 0.034 : 0.032;
    const caliberScaleRatio = Math.max(0.45, Math.min(1.25, customCaliberMm / 11.43));

    // 1. Precision Rifled & Choked Caliber-Swappable Barrel Liner (ASC-45-08) + Internal Rifling
    populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
      barrelLen: totalBarrelLen,
      shroudRadius: otbPlenumRadius * 0.88,
      caliberMm: customCaliberMm,
      baffleCount: isSniperVariant ? 7 : 5,
      zCenter: -totalBarrelLen * 0.44,
      yCenter: boreY,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    // 2. Modular Over-the-Barrel (OTB) Coaxial Air Reserve (Front 300B Zone) + Internal Regulator Bulkhead + Rear 210B Firing Plenum (ASC-45-09)
    const otbPlenumJacket = createCsgHollowSlottedTube({
      outerRadius: otbPlenumRadius,
      innerRadius: otbPlenumRadius * 0.76,
      length: otbPlenumLen,
      radialSegments: 24,
      slotCount: 4,
      slotWidth: 0.012,
      slotLength: 0.038,
      material: outerShroudGlassOrMetalMat,
    });
    otbPlenumJacket.position.set(0, boreY, -otbPlenumLen * 0.44);
    otbPlenumJacket.userData = {
      subAssemblyId: 'ASC-45-09_MODULAR_BARREL_PLENUM',
      subAssemblyTitle: `ASC-45-09: Modular Coaxial Over-Barrel Air Reserve & 210B Regulated Plenum (${
        isSniperVariant ? '260cc Sniper' : '195cc Carbine'
      })`,
    };
    otbShroudGroup.add(otbPlenumJacket);

    // Rear 210-Bar Regulated Firing Plenum Glow Core (feeds directly into radial barrel transfer ports)
    const rearPlenumGlowGeo = new THREE.CylinderGeometry(
      otbPlenumRadius * 0.86,
      otbPlenumRadius * 0.86,
      otbPlenumLen * 0.46,
      20,
      1,
      true
    );
    rearPlenumGlowGeo.rotateX(Math.PI / 2);
    const rearPlenumGlow = new THREE.Mesh(rearPlenumGlowGeo, hpaFluidGlowMat);
    rearPlenumGlow.position.set(0, boreY, -otbPlenumLen * 0.23);
    otbShroudGroup.add(rearPlenumGlow);

    // Internal Annular Belleville Regulator Bulkhead Ring separating Front 300B Coaxial Barrel Reserve from Rear 210B Firing Plenum
    const internalBarrelRegBulkhead = new THREE.Mesh(
      new THREE.CylinderGeometry(
        otbPlenumRadius * 0.96,
        otbPlenumRadius * 0.96,
        0.024,
        24
      ),
      goldBrassMat
    );
    internalBarrelRegBulkhead.rotation.x = Math.PI / 2;
    internalBarrelRegBulkhead.position.set(0, boreY, -otbPlenumLen * 0.48);
    internalBarrelRegBulkhead.userData = {
      subAssemblyId: 'ASC-45-09_COAXIAL_REG_BULKHEAD',
      subAssemblyTitle:
        'ASC-45-09B: Coaxial Over-Barrel Belleville Regulator Bulkhead (300B Front Barrel Reserve -> 210B Rear Plenum)',
    };
    otbShroudGroup.add(internalBarrelRegBulkhead);

    // Front 300-Bar Modular Coaxial Barrel Reserve Core
    const frontBarrelReserveGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(
        otbPlenumRadius * 0.82,
        otbPlenumRadius * 0.82,
        otbPlenumLen * 0.38,
        20,
        1,
        true
      ),
      hpaFluidGlowMat
    );
    frontBarrelReserveGlow.rotation.x = Math.PI / 2;
    frontBarrelReserveGlow.position.set(0, boreY, -otbPlenumLen * 0.69);
    otbShroudGroup.add(frontBarrelReserveGlow);

    // Dual Viton FKM-90 Bulkhead O-Rings on the Over-Barrel Modular Plenum
    for (const zOring of [-0.04, -otbPlenumLen * 0.48, -otbPlenumLen * 0.86]) {
      const vitonRingGeo = new THREE.TorusGeometry(
        otbPlenumRadius * 0.88,
        0.0032,
        10,
        22
      );
      const vitonRing = new THREE.Mesh(vitonRingGeo, crimsonAnodizedMat);
      vitonRing.position.set(0, boreY, zOring);
      otbShroudGroup.add(vitonRing);
    }

    // Exposed M18×1.0 Male Muzzle Thread Spigot & FKM-90 Crown O-Ring Seat where the Screw-On Silencer threads onto the Barrel Plenum
    const qeStartZ = -otbPlenumLen * 0.88;
    const muzzleThreadSpigot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.036, 20),
      goldBrassMat
    );
    muzzleThreadSpigot.rotation.x = Math.PI / 2;
    muzzleThreadSpigot.position.set(0, boreY, qeStartZ - 0.016);
    muzzleThreadSpigot.userData = {
      subAssemblyId: 'ASC-45-10_M18_MUZZLE_THREADS',
      subAssemblyTitle:
        'ASC-45-10T: Precision M18×1.0 Male Muzzle Thread Spigot & Viton Shoulder Seal',
    };
    otbShroudGroup.add(muzzleThreadSpigot);

    for (let th = 0; th < 5; th++) {
      const threadHelixRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0145, 0.0011, 8, 20),
        brushedSteelMat
      );
      threadHelixRing.position.set(0, boreY, qeStartZ - 0.004 - th * 0.006);
      otbShroudGroup.add(threadHelixRing);
    }

    // 3. Screw-On QuietEnergy Moderator (ASC-45-10: Front 6-Gill Vented Muzzle Brake + K-Baffles, screws onto M18×1.0 spigot)
    const qeCenterZ = qeStartZ - qeModeratorLen * 0.48;
    const screwOnSilencerGroup = new THREE.Group();
    screwOnSilencerGroup.position.set(0, boreY, qeCenterZ);
    screwOnSilencerGroup.userData = {
      isAscentScrewOnSilencer: true,
      baseZ: qeCenterZ,
      subAssemblyId: 'ASC-45-10_SCREW_ON_SILENCER',
      subAssemblyTitle:
        'ASC-45-10: Screw-On M18×1.0 QuietEnergy 6-Gill Vented Moderator & K-Baffle Stack',
    };

    const qeShroudTube = createCsgHollowSlottedTube({
      outerRadius: otbPlenumRadius * 0.96,
      innerRadius: otbPlenumRadius * 0.72,
      length: qeModeratorLen,
      radialSegments: 24,
      slotCount: 6,
      slotWidth: 0.014,
      slotLength: 0.024,
      material: darkGunmetalMat,
    });
    screwOnSilencerGroup.add(qeShroudTube);

    // Knurled Rear M18×1.0 Female Thread Collar on the Screw-On Silencer
    const rearThreadCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(
        otbPlenumRadius * 1.02,
        otbPlenumRadius * 1.02,
        0.028,
        28
      ),
      crimsonAnodizedMat
    );
    rearThreadCollar.rotation.x = Math.PI / 2;
    rearThreadCollar.position.set(0, 0, qeModeratorLen * 0.45);
    screwOnSilencerGroup.add(rearThreadCollar);

    // 6 Angled QuietEnergy Side Diffuser Gills near the muzzle
    for (let g = 0; g < 6; g++) {
      const gillZ = -qeModeratorLen * 0.25 + g * 0.022;
      const gillGeo = new THREE.BoxGeometry(otbPlenumRadius * 2.02, 0.014, 0.008);
      const gillMesh = new THREE.Mesh(gillGeo, brushedSteelMat);
      gillMesh.position.set(0, 0, gillZ);
      gillMesh.rotation.y = 0.22;
      screwOnSilencerGroup.add(gillMesh);
    }

    // Caliber-Scaled Muzzle Exit Aperture Ring
    const muzzleExitCap = new THREE.Mesh(
      new THREE.RingGeometry(
        0.0035 + caliberScaleRatio * 0.0045,
        otbPlenumRadius * 0.94,
        24
      ),
      goldBrassMat
    );
    muzzleExitCap.position.set(0, 0, -qeModeratorLen * 0.5 - 0.002);
    screwOnSilencerGroup.add(muzzleExitCap);

    otbShroudGroup.add(screwOnSilencerGroup);

    // 4. Full-Length Top Picatinny Rail + Lower Forend Rail (ASC-45-07) + Flip-Up Fiber Optic Sights or Sniper 6-24×50 FFP Scope
    const topPicatinnyLen = isSniperVariant ? 0.72 : 0.62;
    const topPicatinnyGeo = new THREE.BoxGeometry(0.028, 0.014, topPicatinnyLen);
    const topPicatinny = new THREE.Mesh(topPicatinnyGeo, brushedSteelMat);
    topPicatinny.position.set(0, boreY + otbPlenumRadius + 0.008, -0.24);
    handguardGroup.add(topPicatinny);

    for (let r = 0; r < 16; r++) {
      const lugGeo = new THREE.BoxGeometry(0.03, 0.006, 0.012);
      const lug = new THREE.Mesh(lugGeo, darkGunmetalMat);
      lug.position.set(0, boreY + otbPlenumRadius + 0.016, 0.06 - r * 0.036);
      handguardGroup.add(lug);
    }

    const sightBaseY = boreY + otbPlenumRadius + 0.024;
    if (isSniperVariant) {
      // ASCENT SNIPER VARIANT: 6-24×50 FFP Illuminated Long-Range Riflescope + Cantilever Rings + Folding Carbon Bipod
      const scopeCenterY = sightBaseY + 0.026;
      for (const zRing of [-0.04, -0.20]) {
        const scopeRing = new THREE.Mesh(
          new THREE.BoxGeometry(0.036, 0.038, 0.022),
          darkGunmetalMat
        );
        scopeRing.position.set(0, sightBaseY + 0.006, zRing);
        handguardGroup.add(scopeRing);
      }

      const scopeMainTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.34, 22),
        darkGunmetalMat
      );
      scopeMainTube.rotation.x = Math.PI / 2;
      scopeMainTube.position.set(0, scopeCenterY, -0.12);
      scopeMainTube.userData = {
        subAssemblyId: 'ASC-SNIPER-OPTIC-6-24X50',
        subAssemblyTitle:
          'ASC-SNIPER-OPTIC: 6-24×50 FFP Illuminated Sniper Riflescope w/ Zero-Stop Turrets',
      };
      handguardGroup.add(scopeMainTube);

      const scopeObjBell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.029, 0.016, 0.095, 24),
        darkGunmetalMat
      );
      scopeObjBell.rotation.x = Math.PI / 2;
      scopeObjBell.position.set(0, scopeCenterY, -0.32);
      handguardGroup.add(scopeObjBell);

      const scopeObjLens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.005, 22),
        hpaFluidGlowMat
      );
      scopeObjLens.rotation.x = Math.PI / 2;
      scopeObjLens.position.set(0, scopeCenterY, -0.368);
      handguardGroup.add(scopeObjLens);

      const scopeOcularBell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.023, 0.075, 22),
        darkGunmetalMat
      );
      scopeOcularBell.rotation.x = Math.PI / 2;
      scopeOcularBell.position.set(0, scopeCenterY, 0.075);
      handguardGroup.add(scopeOcularBell);

      const zeroStopTurret = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, 0.024, 16),
        goldBrassMat
      );
      zeroStopTurret.position.set(0, scopeCenterY + 0.022, -0.12);
      handguardGroup.add(zeroStopTurret);

      // Folding Carbon-Fiber Front Sniper Bipod mounted to lower Picatinny rail
      for (const sideX of [-0.032, 0.032]) {
        const bipodLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0075, 0.006, 0.22, 14),
          darkGunmetalMat
        );
        bipodLeg.position.set(sideX * 1.45, -0.145, -0.38);
        bipodLeg.rotation.z = sideX > 0 ? -0.22 : 0.22;
        bipodLeg.rotation.x = 0.14;
        bipodLeg.userData = {
          subAssemblyId: 'ASC-SNIPER-BIPOD',
          subAssemblyTitle: 'ASC-SNIPER-BIPOD: Folding Carbon-Fiber Telescope Bipod Leg',
        };
        handguardGroup.add(bipodLeg);

        const bipodFoot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.013, 0.018, 14),
          crimsonAnodizedMat
        );
        bipodFoot.position.set(sideX * 2.1, -0.245, -0.395);
        handguardGroup.add(bipodFoot);
      }
    } else {
      // Removable Flip-Up Fiber Optic Open Sights (ASC-45-06: Rear Green & Front Red TruGlo)
      const rearSightTower = new THREE.Mesh(
        new THREE.BoxGeometry(0.026, 0.032, 0.022),
        darkGunmetalMat
      );
      rearSightTower.position.set(0, sightBaseY, 0.01);
      handguardGroup.add(rearSightTower);

      const rearGreenFiber = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, 0.018, 10),
        new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x16a34a,
          emissiveIntensity: 0.9,
        })
      );
      rearGreenFiber.rotation.z = Math.PI / 2;
      rearGreenFiber.position.set(0, sightBaseY + 0.01, 0.01);
      handguardGroup.add(rearGreenFiber);

      const frontSightTower = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, 0.034, 0.022),
        darkGunmetalMat
      );
      frontSightTower.position.set(0, sightBaseY, -0.49);
      handguardGroup.add(frontSightTower);

      const frontRedFiber = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0038, 0.0038, 0.02, 10),
        crimsonAnodizedMat
      );
      frontRedFiber.rotation.x = Math.PI / 2;
      frontRedFiber.position.set(0, sightBaseY + 0.011, -0.49);
      handguardGroup.add(frontRedFiber);
    }

    // Lower Forend Picatinny Accessory Rail (ASC-45-07)
    const lowerRailGeo = new THREE.BoxGeometry(0.026, 0.012, 0.14);
    const lowerRail = new THREE.Mesh(lowerRailGeo, brushedSteelMat);
    lowerRail.position.set(0, -0.048, -0.34);
    handguardGroup.add(lowerRail);

    // 5. Under-Barrel 300-Bar Air Reserve Cylinder (ASC-45-11: 240cc/165cc) + Recessed Belly Pressure Gauge
    const underReserveLen = isSniperVariant ? 0.56 : 0.48;
    const underReserveRadius = 0.025;
    const underReserveY = 0.004;
    const underReserveZ = isSniperVariant ? -0.30 : -0.26;

    const underReserveTube = createCsgHollowSlottedTube({
      outerRadius: underReserveRadius,
      innerRadius: underReserveRadius * 0.76,
      length: underReserveLen,
      radialSegments: 22,
      slotCount: 0,
      material: outerShroudGlassOrMetalMat,
    });
    underReserveTube.position.set(0, underReserveY, underReserveZ);
    plenumGroup.add(underReserveTube);

    const underReserveGlowGeo = new THREE.CylinderGeometry(
      underReserveRadius * 0.72,
      underReserveRadius * 0.72,
      underReserveLen * 0.9,
      18
    );
    underReserveGlowGeo.rotateX(Math.PI / 2);
    const underReserveGlow = new THREE.Mesh(underReserveGlowGeo, hpaFluidGlowMat);
    underReserveGlow.position.set(0, underReserveY, underReserveZ);
    plenumGroup.add(underReserveGlow);

    // Protruding Front 300-Bar Fill Cap with Foster Port (matches diagram right under barrel)
    const frontFillCapGeo = new THREE.CylinderGeometry(
      underReserveRadius * 0.96,
      underReserveRadius * 0.96,
      0.045,
      20
    );
    frontFillCapGeo.rotateX(Math.PI / 2);
    const frontFillCap = new THREE.Mesh(frontFillCapGeo, brushedSteelMat);
    frontFillCap.position.set(
      0,
      underReserveY,
      underReserveZ - underReserveLen * 0.5 - 0.018
    );
    plenumGroup.add(frontFillCap);

    // Recessed Bottom 0–300 Bar Pressure Gauge at belly of stock (ASC-45-11)
    const bellyGaugeBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.016, 20),
      goldBrassMat
    );
    bellyGaugeBezel.position.set(0, -0.044, -0.09);
    plenumGroup.add(bellyGaugeBezel);

    // Dual Vertical High-Pressure Bridges:
    // (a) Front Equalizer Bridge connecting Under-Barrel 300B Cylinder <-> Front Over-Barrel 300B Coaxial Reserve
    // (b) Rear Regulated Transfer Bridge feeding 210B Plenum -> Valve
    for (const zBridge of [-0.36, -0.08]) {
      const regBridgeGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.062, 16);
      const regBridge = new THREE.Mesh(regBridgeGeo, goldBrassMat);
      regBridge.position.set(0, (boreY + underReserveY) * 0.5, zBridge);
      plenumGroup.add(regBridge);
    }

    // 6. REBUILT COMPOUND 4-BAR OVER-CENTER LEVER-ACTION 3-STAGE 300-BAR HAND PUMP (ASC-45-12)
    // Stationary Outer Stage-1 (Ø28mm) Pump Cylinder + Finned Interstage Heat Exchanger + Part #116 Check Block
    const pumpLen = 0.44;
    const stationaryPumpCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0155, 0.0155, pumpLen, 20),
      brushedSteelMat
    );
    stationaryPumpCylinder.rotation.x = Math.PI / 2;
    stationaryPumpCylinder.position.set(0, -0.032, -0.26);
    stationaryPumpCylinder.userData = {
      isInteractivePumpObject: true,
      subAssemblyId: 'ASC-45-12_PUMP_TUBE',
      subAssemblyTitle:
        'ASC-45-12: Stationary 3-Stage 300-Bar Pump Cylinder, Desiccant Intake & Part #116 Check Block',
    };
    plenumGroup.add(stationaryPumpCylinder);

    // Cooling Fins on Rear High-Pressure Stage-3 Compression Head (dissipates adiabatic 300B heat)
    for (let f = 0; f < 5; f++) {
      const coolingFin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.019, 0.019, 0.004, 20),
        goldBrassMat
      );
      coolingFin.rotation.x = Math.PI / 2;
      coolingFin.position.set(0, -0.032, -0.065 - f * 0.012);
      plenumGroup.add(coolingFin);
    }

    // Sliding Phosphor-Bronze Guide Crosshead Collar riding along the Stationary Pump Tube
    const slidingCrossheadCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0195, 0.0195, 0.032, 18),
      goldBrassMat
    );
    slidingCrossheadCollar.rotation.x = Math.PI / 2;
    slidingCrossheadCollar.position.set(0, -0.032, -0.32);
    slidingCrossheadCollar.userData = {
      isInteractivePumpObject: true,
      isAscentPumpCrosshead: true,
      baseZ: -0.32,
      subAssemblyId: 'ASC-45-12_CROSSHEAD_COLLAR',
      subAssemblyTitle:
        'ASC-45-12C: Sliding Phosphor-Bronze Linear Crosshead Guide Collar (Eliminates Side-Load Buckling)',
    };
    plenumGroup.add(slidingCrossheadCollar);

    // Front Clevis Fulcrum Bracket & Hardened M6×1.0 Pivot Pin at Muzzle End of Pump Tube (z = -0.46, y = -0.042)
    const frontFulcrumBracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.028, 0.028),
      darkGunmetalMat
    );
    frontFulcrumBracket.position.set(0, -0.042, -0.46);
    plenumGroup.add(frontFulcrumBracket);

    const frontFulcrumPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0055, 0.0055, 0.042, 14),
      goldBrassMat
    );
    frontFulcrumPin.rotation.z = Math.PI / 2;
    frontFulcrumPin.position.set(0, -0.042, -0.46);
    plenumGroup.add(frontFulcrumPin);

    // `pumpLinkageGroup` is anchored at the Front Fulcrum Pivot (z = -0.46, y = -0.042) so it swings like a Compound 4-Bar Lever!
    pumpLinkageGroup.position.set(0, -0.042, -0.46);

    // Forged Compound Over-Center Under-Barrel Pump Arm extending rearward from the front fulcrum
    const pumpHandleArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.024, 0.36),
      crimsonAnodizedMat
    );
    pumpHandleArm.position.set(0, -0.014, 0.18);
    pumpHandleArm.userData = {
      isInteractivePumpObject: true,
      subAssemblyId: 'ASC-45-12_PUMP_HANDLE',
      subAssemblyTitle:
        'ASC-45-12: Compound 4-Bar Over-Center 300-Bar Pump Lever (6.8:1 Mechanical Advantage)',
    };
    pumpLinkageGroup.add(pumpHandleArm);

    // Ergonomic Contoured Finger-Groove Overmold Grip on Rear of Pump Lever
    const pumpGripOvermold = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.028, 0.12),
      darkGunmetalMat
    );
    pumpGripOvermold.position.set(0, -0.018, 0.28);
    pumpGripOvermold.userData = { isInteractivePumpObject: true };
    pumpLinkageGroup.add(pumpGripOvermold);

    // Twin 17-4PH Compound 4-Bar Toggle Linkage Struts + Clevis Pins connecting Mid-Lever to Crosshead & Telescopic Rods
    for (const sideX of [-0.021, 0.021]) {
      const toggleLinkStrut = new THREE.Mesh(
        new THREE.BoxGeometry(0.0055, 0.013, 0.155),
        goldBrassMat
      );
      toggleLinkStrut.position.set(sideX, 0.006, 0.115);
      toggleLinkStrut.rotation.x = -0.22;
      toggleLinkStrut.userData = {
        isInteractivePumpObject: true,
        subAssemblyId: 'ASC-45-12_4BAR_LINKAGE',
        subAssemblyTitle:
          'ASC-45-12: Twin 17-4PH Compound 4-Bar Over-Center Toggle Linkage Struts',
      };
      pumpLinkageGroup.add(toggleLinkStrut);
    }

    // Telescopic Stage-2 (Ø14mm Floating Hollow Piston) & Concentric Stage-3 (Ø6.0mm 300-Bar High-Pressure Rod)
    const pumpStage2Sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, pumpLen * 0.48, 16),
      brushedSteelMat
    );
    pumpStage2Sleeve.rotation.x = Math.PI / 2;
    pumpStage2Sleeve.position.set(0, 0.01, 0.12);
    pumpStage2Sleeve.userData = {
      isInteractivePumpObject: true,
      subAssemblyId: 'ASC-45-12_STAGE2_SLEEVE',
      subAssemblyTitle:
        'ASC-45-12S2: Stage-2 (65 Bar) Telescopic Floating Intermediate Piston Sleeve',
    };
    pumpLinkageGroup.add(pumpStage2Sleeve);

    const pumpStage3Rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, pumpLen * 0.76, 14),
      goldBrassMat
    );
    pumpStage3Rod.rotation.x = Math.PI / 2;
    pumpStage3Rod.position.set(0, 0.01, 0.175);
    pumpStage3Rod.userData = {
      isInteractivePumpObject: true,
      subAssemblyId: 'ASC-45-12_STAGE3_ROD',
      subAssemblyTitle:
        'ASC-45-12S3: Stage-3 (300 Bar) Ø6.0mm 17-4PH Hardened High-Pressure Plunger Rod',
    };
    pumpLinkageGroup.add(pumpStage3Rod);

    // 7. Caliber-Responsive Top-Loading Rotary Mag (ASC-45-05: 5 Rds .50 / 6 Rds .45 / 7 Rds .357 / 9 Rds .30 / 10 Rds .25 / 12 Rds .22)
    // Grouped into a cohesive CNC drum cassette so isolating Breech/Mag never scatters individual chamber bores or slugs!
    const chamberCount = magSpec.exactCapacity;
    const dynamicSlugRadius = Math.max(
      0.0028,
      Math.min(0.0068, 0.0055 * caliberScaleRatio)
    );
    rotaryMagGroup.position.set(0, boreY + 0.026, 0.068);
    const ascentRotaryDrumCassette = new THREE.Group();
    ascentRotaryDrumCassette.userData = {
      subAssemblyId: 'ASC-45-05_CALIBER_ROTARY_MAG',
      subAssemblyTitle: `ASC-45-05: ${chamberCount}-Round (${customCaliberMm.toFixed(
        2
      )}mm) CNC Auto-Indexing Rotary Magazine Drum`,
      disassemblyOffset: { x: 0, y: 0.048, z: 0 },
    };

    const rotaryWheel = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.034,
        0.034,
        0.024,
        Math.max(12, chamberCount * 2)
      ),
      crimsonAnodizedMat
    );
    rotaryWheel.rotation.x = Math.PI / 2;
    ascentRotaryDrumCassette.add(rotaryWheel);

    for (let c = 0; c < chamberCount; c++) {
      const ang = (c / chamberCount) * Math.PI * 2;
      const chamberBoreHole = new THREE.Mesh(
        new THREE.CylinderGeometry(
          dynamicSlugRadius * 1.16,
          dynamicSlugRadius * 1.16,
          0.025,
          12
        ),
        darkGunmetalMat
      );
      chamberBoreHole.rotation.x = Math.PI / 2;
      chamberBoreHole.position.set(Math.cos(ang) * 0.021, Math.sin(ang) * 0.021, 0);
      ascentRotaryDrumCassette.add(chamberBoreHole);

      const slugPellet = new THREE.Mesh(
        new THREE.CylinderGeometry(
          dynamicSlugRadius * 0.92,
          dynamicSlugRadius,
          0.026,
          12
        ),
        goldBrassMat
      );
      slugPellet.rotation.x = Math.PI / 2;
      slugPellet.position.set(Math.cos(ang) * 0.021, Math.sin(ang) * 0.021, 0);
      ascentRotaryDrumCassette.add(slugPellet);
    }
    rotaryMagGroup.add(ascentRotaryDrumCassette);

    // Caliber-Scaled Reciprocating Stainless Bolt Probe + PU-90A Tip O-Ring (VEC-02 / ASC-45-08) grouped as one bolt assembly
    const probeAssemblyGroup = new THREE.Group();
    probeAssemblyGroup.userData = {
      subAssemblyId: 'ASC-45-08_BOLT_PROBE',
      subAssemblyTitle: `ASC-45-08: Caliber-Scaled Ø${customCaliberMm.toFixed(2)}mm Stainless Bolt Probe & PU-90A Face Seal`,
      disassemblyOffset: { x: 0, y: 0.022, z: 0.068 },
    };
    const probeRadius = Math.max(0.004, Math.min(0.0085, 0.0072 * caliberScaleRatio));
    const probeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(probeRadius, probeRadius, 0.14, 14),
      brushedSteelMat
    );
    probeMesh.rotation.x = Math.PI / 2;
    probeMesh.position.set(0, boreY, 0.11);
    probeAssemblyGroup.add(probeMesh);

    const probeOring = new THREE.Mesh(
      new THREE.TorusGeometry(probeRadius * 1.1, 0.0018, 8, 16),
      crimsonAnodizedMat
    );
    probeOring.position.set(0, boreY, 0.048);
    probeAssemblyGroup.add(probeOring);
    customCadGroup.add(probeAssemblyGroup);

    // 8. Lever-Action Operated Repeater Loop (ASC-45-02) + Complete 5-Element Quattro 2-Stage Match Trigger & Sear Linkage
    foregripCamGroup.position.set(0, -0.022, 0.06);
    const leverLoopOuter = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.007, 10, 24),
      brushedSteelMat
    );
    leverLoopOuter.rotation.y = Math.PI / 2;
    leverLoopOuter.scale.set(1.35, 0.78, 1);
    leverLoopOuter.position.set(0, -0.038, 0.055);
    leverLoopOuter.userData = {
      subAssemblyId: 'ASC-45-02_REPEATER_LEVER',
      subAssemblyTitle: 'ASC-45-02: Lever-Action Repeater Cocking Loop (48° Throw)',
      disassemblyOffset: { x: 0, y: -0.052, z: 0.025 },
    };
    foregripCamGroup.add(leverLoopOuter);

    // ASC-TRIG-01: Quattro 2-Stage Adjustable Match Trigger Blade + Overtravel Screw
    const quattroTriggerGroup = new THREE.Group();
    quattroTriggerGroup.position.set(0, -0.028, 0.045);
    quattroTriggerGroup.rotation.x = 0.25;
    quattroTriggerGroup.userData = {
      isAscentTriggerShoe: true,
      baseRotX: 0.25,
      subAssemblyId: 'ASC-TRIG-01_QUATTRO_SHOE',
      subAssemblyTitle: 'ASC-TRIG-01: Quattro 2-Stage TiN Brass Match Trigger Blade (4.2N Stage-1 / 9.8N Stage-2 Break)',
      disassemblyOffset: { x: 0, y: -0.034, z: -0.018 },
    };
    const quattroTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.032, 0.012),
      goldBrassMat
    );
    quattroTriggerGroup.add(quattroTrigger);
    const overtravelScrew = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0022, 0.0022, 0.012, 10),
      brushedSteelMat
    );
    overtravelScrew.rotation.x = Math.PI / 2;
    overtravelScrew.position.set(0, -0.008, 0.006);
    quattroTriggerGroup.add(overtravelScrew);
    foregripCamGroup.add(quattroTriggerGroup);

    // ASC-TRIG-02: 17-4PH Needle-Roller Forward-to-Rear Sear Transfer Bar (92mm stroke link)
    const transferBarMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.009, 0.092),
      brushedSteelMat
    );
    transferBarMesh.position.set(0, -0.011, 0.088);
    transferBarMesh.userData = {
      isAscentTransferBar: true,
      baseZ: 0.088,
      subAssemblyId: 'ASC-TRIG-02_TRANSFER_BAR',
      subAssemblyTitle: 'ASC-TRIG-02: 17-4PH H900 Needle-Roller Bullpup Sear Transfer Bar (92mm Axial Link)',
      disassemblyOffset: { x: 0.024, y: -0.022, z: 0.035 },
    };
    foregripCamGroup.add(transferBarMesh);

    // ASC-TRIG-03: Hardened A2 Tool-Steel Primary & Secondary Drop-Sear Interlock Dog
    const dropSearDog = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.024, 0.022),
      goldBrassMat
    );
    dropSearDog.position.set(0, 0.004, 0.128);
    dropSearDog.userData = {
      isAscentDropSear: true,
      baseY: 0.004,
      subAssemblyId: 'ASC-TRIG-03_DROP_SEAR',
      subAssemblyTitle: 'ASC-TRIG-03: A2 Tool-Steel (60 HRC) Primary & Secondary Drop-Sear Interlock Dog (0.45mm Bite)',
      disassemblyOffset: { x: -0.024, y: -0.028, z: 0.055 },
    };
    foregripCamGroup.add(dropSearDog);

    // ASC-TRIG-04: 4140 Linear Hammer Striker Shuttle & Chrome-Silicon Mainspring
    const strikerAssembly = new THREE.Group();
    strikerAssembly.position.set(0, 0.018, 0.135);
    strikerAssembly.userData = {
      isAscentHammerStriker: true,
      baseZ: 0.135,
      subAssemblyId: 'ASC-TRIG-04_HAMMER_STRIKER',
      subAssemblyTitle: 'ASC-TRIG-04: 48.5g 4140 Chromoly Linear Hammer Striker & 165N Chrome-Silicon Mainspring',
      disassemblyOffset: { x: 0, y: 0.018, z: 0.085 },
    };
    const strikerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0095, 0.0095, 0.044, 16),
      brushedSteelMat
    );
    strikerBody.rotation.x = Math.PI / 2;
    strikerAssembly.add(strikerBody);
    const strikerMainspring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.048, 12),
      goldBrassMat
    );
    strikerMainspring.rotation.x = Math.PI / 2;
    strikerMainspring.position.set(0, 0, 0.036);
    strikerAssembly.add(strikerMainspring);
    foregripCamGroup.add(strikerAssembly);

    // ASC-TRIG-05: Manual Safety Toggle S <-> F & Anti-Bear-Trap Interlock right in front of Quattro Trigger (ASC-45-04)
    const manualSafetyBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.024, 0.009),
      crimsonAnodizedMat
    );
    manualSafetyBlade.position.set(0, -0.026, 0.018);
    manualSafetyBlade.userData = {
      subAssemblyId: 'ASC-TRIG-05_SAFETY_INTERLOCK',
      subAssemblyTitle: 'ASC-TRIG-05: Cross-Bolt Safety & Anti-Bear-Trap Lever Interlock',
      disassemblyOffset: { x: 0, y: -0.038, z: -0.042 },
    };
    foregripCamGroup.add(manualSafetyBlade);

    // Sculpted Synthetic Forend Shroud & Monolithic CNC Upper/Lower Receiver Breech Housing (Zero Floating Gaps!)
    const vectisForend = new THREE.Mesh(
      new THREE.BoxGeometry(0.058, 0.078, 0.42),
      receiverMat
    );
    vectisForend.position.set(0, 0.002, -0.14);
    vectisForend.userData = {
      subAssemblyId: 'ASC-45-07_VECTIS_FOREND',
      subAssemblyTitle: 'ASC-45-07: Sculpted Synthetic Forend & Under-Barrel Pump Saddle',
      disassemblyOffset: { x: 0, y: -0.035, z: -0.085 },
    };
    manifoldCoreGroup.add(vectisForend);

    // Monolithic CNC Upper & Lower Receiver Breech Block grouped with its Machined Side Receiver Cheek Plates
    const ascentUpperReceiverAssembly = new THREE.Group();
    ascentUpperReceiverAssembly.userData = {
      subAssemblyId: 'ASC-45-06_UPPER_RECEIVER',
      subAssemblyTitle: 'ASC-45-06: Monolithic CNC 7075-T6 Upper Receiver Bridge & Side Cheek Plates',
      disassemblyOffset: { x: 0, y: 0.045, z: 0 },
    };
    const upperReceiverBridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.056, 0.064, 0.24),
      receiverMat
    );
    upperReceiverBridge.position.set(0, 0.056, 0.045);
    ascentUpperReceiverAssembly.add(upperReceiverBridge);

    for (const sideX of [-0.024, 0.024]) {
      const receiverSidePlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.088, 0.21),
        brushedSteelMat
      );
      receiverSidePlate.position.set(sideX, 0.036, 0.055);
      ascentUpperReceiverAssembly.add(receiverSidePlate);
    }
    manifoldCoreGroup.add(ascentUpperReceiverAssembly);

    // Lower Receiver Trigger & Lever-Pivot Housing connecting Forend (z=-0.04) directly to Thumbhole Grip (z=+0.135)
    const lowerReceiverBridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.052, 0.058, 0.19),
      darkGunmetalMat
    );
    lowerReceiverBridge.position.set(0, -0.006, 0.065);
    lowerReceiverBridge.userData = {
      subAssemblyId: 'ASC-45-06B_LOWER_SEAR_HOUSING',
      subAssemblyTitle: 'ASC-45-06B: CNC Lower Sear Housing & Lever Fulcrum Block',
      disassemblyOffset: { x: 0, y: -0.042, z: 0.045 },
    };
    manifoldCoreGroup.add(lowerReceiverBridge);

    // 9. Ambidextrous, Thumbhole Synthetic Stock (ASC-45-01)
    const stockSpineUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.052, 0.058, 0.38),
      receiverMat
    );
    stockSpineUpper.position.set(0, 0.032, 0.27);
    buttstockGroup.add(stockSpineUpper);

    // Raised Monte Carlo / Adjustable Sniper Cheek Comb
    const cheekComb = new THREE.Mesh(
      new THREE.BoxGeometry(0.054, isSniperVariant ? 0.048 : 0.034, 0.19),
      isSniperVariant ? crimsonAnodizedMat : darkGunmetalMat
    );
    cheekComb.position.set(0, isSniperVariant ? 0.074 : 0.064, 0.31);
    buttstockGroup.add(cheekComb);

    // Pistol Grip Bridge & Lower Thumbhole Strut (framing the open thumbhole cutout!)
    const thumbholeFrontGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.046, 0.135, 0.052),
      receiverMat
    );
    thumbholeFrontGrip.position.set(0, -0.048, 0.135);
    thumbholeFrontGrip.rotation.x = -0.32;
    buttstockGroup.add(thumbholeFrontGrip);

    const thumbholeRearPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.046, 0.125, 0.065),
      receiverMat
    );
    thumbholeRearPillar.position.set(0, -0.038, 0.36);
    thumbholeRearPillar.rotation.x = 0.18;
    buttstockGroup.add(thumbholeRearPillar);

    const thumbholeLowerBridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.028, 0.24),
      receiverMat
    );
    thumbholeLowerBridge.position.set(0, -0.098, 0.255);
    thumbholeLowerBridge.rotation.x = 0.08;
    buttstockGroup.add(thumbholeLowerBridge);

    // Ventilated Rubber Recoil Buttpad
    const recoilPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.054, 0.168, 0.032),
      darkGunmetalMat
    );
    recoilPad.position.set(0, -0.008, 0.465);
    buttstockGroup.add(recoilPad);

    return {
      root,
      familyContext,
      otbShroudGroup,
      plenumGroup,
      handguardGroup,
      buttstockGroup,
      rotaryMagGroup,
      pumpLinkageGroup,
      foregripCamGroup,
      manifoldCoreGroup,
      customCadGroup,
      airflowStreamGroup,
    };
  } else if (familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY') {
    // ========================================================================
    // FAMILY 9: #09 THE PROTECTOR (.50 CAL DUAL THREADED AIR-RESERVE BARREL SCATTER GUN)
    // - Two Over/Under M28×1.5 Threaded Barrels (PRT-01 Upper / PRT-02 Lower), each storing 110cc @ 250 Bar inside its outer titanium jacket
    // - Cock Open (40° Break-Action Hinge) -> Load 2× .50 Scatter Sabots -> Cock Up -> 3-Pos Fire Selector
    // - 180° Reverse-Loop Airflow: Air travels from Barrel Reserve -> Back Collector (PRT-05) -> 180° U-Turn Loop -> Middle of Barrel (Z=-0.21m)
    // - Post-Muzzle Break-Apart Scatter: 8-Segment Tungsten Flechette cone separates after leaving the barrel!
    // ========================================================================
    const barrelLen = 0.56;
    const upperBoreY = 0.056;
    const lowerBoreY = -0.004;
    const reserveOuterR = 0.024;

    // 1. Upper & Lower M28×1.5 Threaded Air-Reserve Barrels (otbShroudGroup pivots around front hinge!)
    for (const [bIdx, boreY] of [upperBoreY, lowerBoreY].entries()) {
      const barrelJacket = createCsgHollowSlottedTube({
        outerRadius: reserveOuterR,
        innerRadius: 0.015,
        length: barrelLen,
        radialSegments: 24,
        slotCount: 3,
        slotWidth: 0.01,
        slotLength: 0.036,
        material: bIdx === 0 ? outerShroudGlassOrMetalMat : bronzeBarrelMat,
      });
      barrelJacket.position.set(0, boreY, -barrelLen * 0.45);
      barrelJacket.userData = {
        subAssemblyId: bIdx === 0 ? 'PRT-01_UPPER_BARREL_RESERVE' : 'PRT-02_LOWER_BARREL_RESERVE',
        subAssemblyTitle: `PRT-0${bIdx + 1}: ${bIdx === 0 ? 'Upper' : 'Lower'} M28×1.5 Threaded Barrel & 110cc 250-Bar Coaxial Air Reserve`,
      };
      otbShroudGroup.add(barrelJacket);

      populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
        barrelLen,
        shroudRadius: reserveOuterR * 0.88,
        caliberMm: 12.7,
        baffleCount: 4,
        zCenter: -barrelLen * 0.45,
        yCenter: boreY,
        linerMat: brushedSteelMat,
        baffleMat: silencerBaffleMat,
        riflingMat: goldBrassMat,
      });

      // Glowing 110cc 250-Bar Annular Air Reserve Core inside each Threaded Barrel
      const barrelAirGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(reserveOuterR * 0.88, reserveOuterR * 0.88, barrelLen * 0.78, 20, 1, true),
        hpaFluidGlowMat
      );
      barrelAirGlow.rotation.x = Math.PI / 2;
      barrelAirGlow.position.set(0, boreY, -barrelLen * 0.45);
      otbShroudGroup.add(barrelAirGlow);

      // Visible M28×1.5 Rear Dry-Break Threads on each Barrel
      for (let t = 0; t < 4; t++) {
        const threadTorus = new THREE.Mesh(
          new THREE.TorusGeometry(reserveOuterR * 0.92, 0.0015, 8, 22),
          goldBrassMat
        );
        threadTorus.position.set(0, boreY, -0.01 + t * 0.006);
        otbShroudGroup.add(threadTorus);
      }

      // Mid-Barrel 6-Port Radial Loop Injection Collar at Z = -0.24m (Middle of Barrel!)
      const midInjectionCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(reserveOuterR * 1.12, reserveOuterR * 1.12, 0.038, 24),
        crimsonAnodizedMat
      );
      midInjectionCollar.rotation.x = Math.PI / 2;
      midInjectionCollar.position.set(0, boreY, -0.24);
      midInjectionCollar.userData = {
        subAssemblyId: 'PRT-06_MID_BARREL_INJECTOR',
        subAssemblyTitle: 'PRT-06: Mid-Barrel 6-Port Radial Reverse-Loop Injection Collar (Pushes Round Out From Middle of Barrel)',
      };
      otbShroudGroup.add(midInjectionCollar);
    }

    // 2. Twin External 180° Reverse-Loop Return Tubes routing air from Rear Breech Collector (Z=+0.08) to Middle of Barrels (Z=-0.24)
    for (const sideX of [-0.032, 0.032]) {
      const returnPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0065, 0.0065, 0.32, 14),
        goldBrassMat
      );
      returnPipe.rotation.x = Math.PI / 2;
      returnPipe.position.set(sideX, 0.026, -0.08);
      otbShroudGroup.add(returnPipe);

      const rearUTurnLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.024, 0.0065, 12, 20, Math.PI),
        crimsonAnodizedMat
      );
      rearUTurnLoop.rotation.y = Math.PI / 2;
      rearUTurnLoop.position.set(sideX, 0.026, 0.08);
      rearUTurnLoop.userData = {
        subAssemblyId: 'PRT-05_REAR_180_UTURN_MANIFOLD',
        subAssemblyTitle: 'PRT-05: 180° Rear U-Turn Reverse-Loop Manifold (Loops Barrel Air Back Into Center Bore)',
      };
      plenumGroup.add(rearUTurnLoop);
    }

    // 3. 2× Chambered .50 Cal 8-Segment Break-Apart Scatter Sabot Cartridges (rotaryMagGroup)
    for (const [sIdx, boreY] of [upperBoreY, lowerBoreY].entries()) {
      const sabotGroup = new THREE.Group();
      sabotGroup.position.set(0, boreY, 0.015);
      sabotGroup.userData = {
        isProtectorScatterSabot: true,
        sabotIndex: sIdx,
        baseY: boreY,
        baseZ: 0.015,
      };
      const brassBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0095, 0.0095, 0.026, 18),
        goldBrassMat
      );
      brassBase.rotation.x = Math.PI / 2;
      sabotGroup.add(brassBase);

      const scoredDelrinCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.0092, 0.032, 8),
        crimsonAnodizedMat
      );
      scoredDelrinCone.rotation.x = -Math.PI / 2;
      scoredDelrinCone.position.set(0, 0, -0.028);
      sabotGroup.add(scoredDelrinCone);
      rotaryMagGroup.add(sabotGroup);
    }

    // 4. Post-Muzzle 8-Pellet Break-Apart Scatter Flechette Cloud outside the muzzle (Z = -0.58m)
    const scatterCloudGroup = new THREE.Group();
    scatterCloudGroup.position.set(0, 0.026, -0.58);
    scatterCloudGroup.userData = { isProtectorPostMuzzleScatterCloud: true };
    for (let f = 0; f < 8; f++) {
      const ang = (f / 8) * Math.PI * 2;
      const flechette = new THREE.Mesh(
        new THREE.ConeGeometry(0.0045, 0.022, 8),
        goldBrassMat
      );
      flechette.rotation.x = -Math.PI / 2;
      flechette.position.set(Math.cos(ang) * 0.028, Math.sin(ang) * 0.028, -0.04 * (f % 2));
      flechette.userData = { flechetteAngle: ang };
      scatterCloudGroup.add(flechette);
    }
    customCadGroup.add(scatterCloudGroup);

    // 5. Standing Breech Receiver, Ø8mmH7 Break-Action Hinge Pin, 3-Position Fire Selector & Tactical Stock
    const standingBreech = new THREE.Mesh(
      new THREE.BoxGeometry(0.062, 0.115, 0.14),
      receiverMat
    );
    standingBreech.position.set(0, 0.024, 0.095);
    manifoldCoreGroup.add(standingBreech);

    const hingeAxlePin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.074, 16),
      goldBrassMat
    );
    hingeAxlePin.rotation.z = Math.PI / 2;
    hingeAxlePin.position.set(0, -0.032, -0.025);
    manifoldCoreGroup.add(hingeAxlePin);

    // 3-Position Ambidextrous Fire Selector Lever (PRT-04)
    const selectorDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.072, 16),
      crimsonAnodizedMat
    );
    selectorDial.rotation.z = Math.PI / 2;
    selectorDial.position.set(0, 0.045, 0.115);
    selectorDial.userData = { isProtectorFireSelectorDial: true };
    foregripCamGroup.add(selectorDial);

    const gripFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.135, 0.056),
      darkGunmetalMat
    );
    gripFrame.position.set(0, -0.068, 0.145);
    gripFrame.rotation.x = -0.28;
    foregripCamGroup.add(gripFrame);

    const buttstockBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.048, 0.11, 0.28),
      receiverMat
    );
    buttstockBeam.position.set(0, 0.012, 0.29);
    buttstockGroup.add(buttstockBeam);

    return {
      root,
      familyContext,
      otbShroudGroup,
      plenumGroup,
      handguardGroup,
      buttstockGroup,
      rotaryMagGroup,
      pumpLinkageGroup,
      foregripCamGroup,
      manifoldCoreGroup,
      customCadGroup,
      airflowStreamGroup,
    };
  } else {
    // ========================================================================
    // FAMILY 6: LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY (#04 EDGUN LESHIY 2 — REBUILT BY SCOUT & REVERSE-ENGINEERING CAD AGENTS)
    // - Uncovered 350mm Alfa Precision Polygonal Rifled Barrel Liner (Ø14.0mm OD, M14×1.25 Muzzle Spigot, Brass Breech Leade Cone)
    // - Open-Frame Skeletonized Valkyrie Carbon M-LOK Handguard Cage (Ø41mm ID, 4 Open Bridge Ribs so the Barrel is 100% Visible!)
    // - Front-Mounted Tishina / Behemoth Reflex Sound Moderator (Ø40mm OD × 185mm at Muzzle End w/ 6 Cutaway K-Baffles)
    // - Full-Length Picatinny Upper Rail + Compact Prismatic Reflex Optic
    // ========================================================================
    const barrelLen = 0.66;
    const shroudRadius = 0.034;
    const boreY = 0.058;

    // LSH-01: Uncovered Alfa Precision 350mm Rifled Barrel Liner + M14×1.25 Muzzle Spigot + 6 Tishina K-Baffles
    populateConcentricBarrelAndSilencerSubcomponents(otbShroudGroup, {
      barrelLen,
      shroudRadius: shroudRadius * 0.86,
      caliberMm: customCaliberMm,
      baffleCount: 6,
      zCenter: -barrelLen * 0.44,
      yCenter: boreY,
      linerMat: brushedSteelMat,
      baffleMat: silencerBaffleMat,
      riflingMat: goldBrassMat,
    });

    // Brass Breech Barrel Tenon & Dual 14×1.5mm NBR-90 Radial O-Rings at Receiver Entry
    const barrelBreechTenon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0115, 0.0115, 0.056, 20),
      goldBrassMat
    );
    barrelBreechTenon.rotation.x = Math.PI / 2;
    barrelBreechTenon.position.set(0, boreY, 0.042);
    barrelBreechTenon.userData = {
      subAssemblyId: 'LSH-01B_BARREL_BREECH_TENON',
      subAssemblyTitle: 'LSH-01B: Alfa Precision Brass Breech Leade Cone & Dual 14×1.5mm O-Ring Seat',
      disassemblyOffset: { x: 0, y: 0.034, z: -0.045 },
    };
    otbShroudGroup.add(barrelBreechTenon);

    // LSH-03: Tishina / Behemoth Front Reflex Moderator (Positioned ONLY on the front muzzle half so the mid/rear barrel is completely uncovered!)
    const tishinaModLen = barrelLen * 0.42;
    const tishinaModZ = -barrelLen * 0.68;
    const tishinaModerator = createCsgHollowSlottedTube({
      outerRadius: shroudRadius * 0.94,
      innerRadius: shroudRadius * 0.74,
      length: tishinaModLen,
      radialSegments: 24,
      slotCount: 6,
      slotWidth: 0.016,
      slotLength: 0.034,
      material: outerShroudGlassOrMetalMat,
    });
    tishinaModerator.position.set(0, boreY, tishinaModZ);
    tishinaModerator.userData = {
      subAssemblyId: 'LSH-03_TISHINA_REFLEX_MODERATOR',
      subAssemblyTitle: 'LSH-03: Tishina 200 / Behemoth Ø40mm 6-Baffle Cutaway Reflex Moderator',
      disassemblyOffset: { x: 0, y: 0.02, z: -0.14 },
    };
    otbShroudGroup.add(tishinaModerator);

    // Knurled Rear M14×1.25 Moderator Mount Collar & Front Behemoth Tri-Lug Endcap
    for (const [capIdx, zCap] of [
      tishinaModZ + tishinaModLen * 0.48,
      tishinaModZ - tishinaModLen * 0.48,
    ].entries()) {
      const modEndcap = new THREE.Mesh(
        new THREE.CylinderGeometry(
          shroudRadius * 0.98,
          shroudRadius * 0.98,
          0.018,
          24
        ),
        capIdx === 0 ? crimsonAnodizedMat : brushedSteelMat
      );
      modEndcap.rotation.x = Math.PI / 2;
      modEndcap.position.set(0, boreY, zCap);
      modEndcap.userData = {
        subAssemblyId: `LSH-03_MOD_CAP_0${capIdx + 1}`,
        subAssemblyTitle:
          capIdx === 0
            ? 'LSH-03C: M14×1.25 Rear Reflex Moderator Thread Bulkhead'
            : 'LSH-03D: Tishina / Behemoth Front Stripping Crown Endcap',
        disassemblyOffset: {
          x: 0,
          y: capIdx === 0 ? -0.028 : 0.028,
          z: capIdx === 0 ? -0.09 : -0.18,
        },
      };
      otbShroudGroup.add(modEndcap);
    }

    // LSH-02: Open-Frame Skeletonized Valkyrie Carbon M-LOK Handguard (4 Longitudinal Carbon Struts + 2 Octagonal Bulkhead Rings so the inner Alfa Barrel is 100% uncovered & visible!)
    const handguardLen = barrelLen * 0.52;
    const handguardCenterZ = -barrelLen * 0.25;
    for (const [rIdx, zRing] of [
      handguardCenterZ + handguardLen * 0.46,
      handguardCenterZ,
      handguardCenterZ - handguardLen * 0.46,
    ].entries()) {
      const octRing = new THREE.Mesh(
        new THREE.TorusGeometry(shroudRadius * 1.02, 0.0042, 8, 8),
        darkGunmetalMat
      );
      octRing.position.set(0, boreY, zRing);
      octRing.userData = {
        subAssemblyId: `LSH-02_VALKYRIE_BULKHEAD_0${rIdx + 1}`,
        subAssemblyTitle: `LSH-02R: Valkyrie Octagonal Carbon Free-Float Ring #0${rIdx + 1} (ID Ø41.0mm)`,
        disassemblyOffset: {
          x: 0,
          y: 0.042 + rIdx * 0.012,
          z: -0.04 - rIdx * 0.03,
        },
      };
      handguardGroup.add(octRing);
    }

    const strutAngles = [
      { angle: 0, label: 'Right 3-OClock M-LOK Strut' },
      { angle: Math.PI, label: 'Left 9-OClock M-LOK Strut' },
      { angle: -Math.PI / 2, label: 'Bottom 6-OClock M-LOK Bipod Rail' },
    ];
    for (const [sIdx, st] of strutAngles.entries()) {
      const sx = Math.cos(st.angle) * shroudRadius * 1.02;
      const sy = boreY + Math.sin(st.angle) * shroudRadius * 1.02;
      const strutMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          Math.abs(Math.cos(st.angle)) > 0.5 ? 0.005 : 0.016,
          Math.abs(Math.sin(st.angle)) > 0.5 ? 0.005 : 0.014,
          handguardLen
        ),
        darkGunmetalMat
      );
      strutMesh.position.set(sx, sy, handguardCenterZ);
      strutMesh.userData = {
        subAssemblyId: `LSH-02_VALKYRIE_STRUT_0${sIdx + 1}`,
        subAssemblyTitle: `LSH-02S: Valkyrie Carbon M-LOK Skeleton Strut (${st.label})`,
        disassemblyOffset: {
          x: Math.cos(st.angle) * 0.048,
          y: Math.sin(st.angle) * 0.048,
          z: -0.05,
        },
      };
      handguardGroup.add(strutMesh);
    }

    // Full-Length Top Picatinny Bridge Spine (12 O'Clock) with Machined Recoil Lugs
    const topRailGeo = new THREE.BoxGeometry(0.026, 0.012, handguardLen * 1.05);
    const topRail = new THREE.Mesh(topRailGeo, brushedSteelMat);
    topRail.position.set(0, boreY + shroudRadius * 1.08, handguardCenterZ);
    topRail.userData = {
      subAssemblyId: 'LSH-02_TOP_PICATINNY_BRIDGE',
      subAssemblyTitle: 'LSH-02T: Valkyrie Full-Length 21.2mm Picatinny Upper Rail Spine',
      disassemblyOffset: { x: 0, y: 0.068, z: -0.04 },
    };
    handguardGroup.add(topRail);
  }

  // ==========================================================================
  // SHARED FOR #05 THE LEAF (.45 CAL ON LESHIY 2) & #04 EDGUN LESHIY 2 (.30 REAL SPEC):
  // High-Detail CNC Monolithic Upper Receiver Clamp + 180° Left-Side Folding Hinge Frame +
  // Cohesive Scalloped Rotary Drum Assembly + 8/6-Tooth Star Ratchet + Red PU-90A Puck +
  // R.E.P.R. Regulated Plenum (42cc / 68cc) + 1.4ms Hammerless Forward-Plug (EAR) Valve
  // ==========================================================================
  const magSpec = computeAccurateMagCapacityByWeaponAndCaliber(
    familyId,
    customCaliberMm
  );
  const chamberCount = magSpec.exactCapacity;
  const magRadius = 0.048;

  // LSH-04: Cohesive CNC 7075-T6 Upper Receiver Clamp Assembly (Octagonal Chamfered Housing + Picatinny Rail Lugs + Twin M5 Pinch Bolts)
  const edgunUpperReceiverAssembly = new THREE.Group();
  edgunUpperReceiverAssembly.userData = {
    subAssemblyId: 'LSH-04_UPPER_RECEIVER_CLAMP',
    subAssemblyTitle: 'LSH-04: Monolithic 7075-T6 Upper Receiver Clamp, Picatinny Rail & Dual M5×18 Pinch Bolts',
    disassemblyOffset: { x: 0, y: 0.046, z: -0.058 },
  };
  const edgunUpperReceiverBody = createCsgHollowSlottedTube({
    outerRadius: 0.038,
    innerRadius: 0.016,
    length: 0.165,
    radialSegments: 8,
    slotCount: 3,
    slotWidth: 0.012,
    slotLength: 0.026,
    material: receiverMat,
  });
  edgunUpperReceiverBody.position.set(0, 0.056, 0.005);
  edgunUpperReceiverAssembly.add(edgunUpperReceiverBody);

  // Integral Picatinny Top Rail Spine + 7 Machined Cross-Slots on Upper Receiver
  const receiverRailSpine = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.012, 0.162),
    brushedSteelMat
  );
  receiverRailSpine.position.set(0, 0.094, 0.005);
  edgunUpperReceiverAssembly.add(receiverRailSpine);
  for (let slotIdx = 0; slotIdx < 7; slotIdx++) {
    const lug = new THREE.Mesh(
      new THREE.BoxGeometry(0.031, 0.006, 0.012),
      darkGunmetalMat
    );
    lug.position.set(0, 0.101, -0.062 + slotIdx * 0.022);
    edgunUpperReceiverAssembly.add(lug);
  }

  // Dual M5×18mm Quick-Change Barrel Clamp Pinch Bolts grouped inside Upper Receiver Assembly (LSH-SCR-01)
  for (const zBolt of [-0.042, -0.012]) {
    const pinchBolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.0045, 0.072, 12),
      goldBrassMat
    );
    pinchBolt.rotation.z = Math.PI / 2;
    pinchBolt.position.set(0, 0.078, zBolt);
    edgunUpperReceiverAssembly.add(pinchBolt);
  }
  manifoldCoreGroup.add(edgunUpperReceiverAssembly);

  // LSH-05: Cohesive CNC Lower Folding Hinge & Breech Latch Frame (Replaces plain cube + floating cylinder!)
  const edgunLowerHingeBreechAssembly = new THREE.Group();
  edgunLowerHingeBreechAssembly.userData = {
    subAssemblyId: 'LSH-05_FOLDING_BREECH_FRAME',
    subAssemblyTitle: 'LSH-05: 180° Left-Side Folding Breech Clevis Frame, Ø6mmH7 Hinge Pin & Roller Detent Latch',
    disassemblyOffset: { x: 0, y: -0.042, z: 0.052 },
  };
  const lowerClevisFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.064, 0.068, 0.082),
    brushedSteelMat
  );
  lowerClevisFrame.position.set(0, 0.012, 0.055);
  edgunLowerHingeBreechAssembly.add(lowerClevisFrame);

  // Machined Left & Right Cheek Relief Flutes on Lower Breech Frame
  for (const sideX of [-0.033, 0.033]) {
    const cheekFlute = new THREE.Mesh(
      new THREE.BoxGeometry(0.004, 0.044, 0.064),
      darkGunmetalMat
    );
    cheekFlute.position.set(sideX, 0.014, 0.055);
    edgunLowerHingeBreechAssembly.add(cheekFlute);
  }

  // Left-Side 180° Folding Breech Hinge Knuckle & Hardened Ø6mmH7 Hinge Pin (-299mm Fold Delta, LSH-SCR-02)
  const foldingHingePin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0095, 0.0095, 0.096, 16),
    goldBrassMat
  );
  foldingHingePin.position.set(-0.036, 0.032, 0.092);
  edgunLowerHingeBreechAssembly.add(foldingHingePin);

  // Spring-Loaded Roller Detent Latch on Right Receiver Side (LSH-05)
  const rollerDetentLatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.044, 14),
    crimsonAnodizedMat
  );
  rollerDetentLatch.position.set(0.035, 0.032, 0.092);
  edgunLowerHingeBreechAssembly.add(rollerDetentLatch);
  manifoldCoreGroup.add(edgunLowerHingeBreechAssembly);

  // LSH-06: Cohesive Scalloped Rotary Drum Magazine Assembly (Chambers + Slugs + Star Ratchet Hub stay together inside the Drum!)
  rotaryMagGroup.position.set(0, 0.048, 0.085);
  const leshiyRotaryDrumCassette = new THREE.Group();
  leshiyRotaryDrumCassette.userData = {
    subAssemblyId: 'LSH-06_ROTARY_DRUM_CASSETTE',
    subAssemblyTitle: `LSH-06: ${chamberCount}-Round (${customCaliberMm.toFixed(2)}mm) Scalloped CNC Rotary Drum & Star Ratchet Hub`,
    disassemblyOffset: { x: 0, y: 0.044, z: 0 },
  };

  const magBodyGeo = new THREE.CylinderGeometry(
    magRadius,
    magRadius,
    0.032,
    Math.max(16, chamberCount * 3)
  );
  magBodyGeo.rotateX(Math.PI / 2);
  const magBodyMesh = new THREE.Mesh(magBodyGeo, crimsonAnodizedMat);
  leshiyRotaryDrumCassette.add(magBodyMesh);

  const chamberHoleRadius = Math.min(
    0.0115,
    0.005 + (customCaliberMm / 12.7) * 0.006
  );
  const pcdRadius = magRadius * 0.64;

  for (let i = 0; i < chamberCount; i++) {
    const angle = (i / chamberCount) * Math.PI * 2;
    const cx = Math.cos(angle) * pcdRadius;
    const cy = Math.sin(angle) * pcdRadius;

    const boreGeo = new THREE.CylinderGeometry(
      chamberHoleRadius,
      chamberHoleRadius,
      0.034,
      14
    );
    boreGeo.rotateX(Math.PI / 2);
    const boreMesh = new THREE.Mesh(boreGeo, darkGunmetalMat);
    boreMesh.position.set(cx, cy, 0);
    leshiyRotaryDrumCassette.add(boreMesh);

    const slugGeo = new THREE.CylinderGeometry(
      chamberHoleRadius * 0.82,
      chamberHoleRadius * 0.82,
      0.028,
      12
    );
    slugGeo.rotateX(Math.PI / 2);
    const slugMesh = new THREE.Mesh(slugGeo, goldBrassMat);
    slugMesh.position.set(cx, cy, 0);
    leshiyRotaryDrumCassette.add(slugMesh);
  }

  const starHubGeo = new THREE.CylinderGeometry(
    magRadius * 0.3,
    magRadius * 0.3,
    0.036,
    chamberCount
  );
  starHubGeo.rotateX(Math.PI / 2);
  const starHubMesh = new THREE.Mesh(starHubGeo, brushedSteelMat);
  leshiyRotaryDrumCassette.add(starHubMesh);
  rotaryMagGroup.add(leshiyRotaryDrumCassette);

  // Magnetic Steel Front Keeper Plate (0.8mm, separates forward along -Z when exploded)
  const magKeeperPlate = new THREE.Mesh(
    new THREE.RingGeometry(magRadius * 0.28, magRadius * 0.96, Math.max(16, chamberCount * 2)),
    brushedSteelMat
  );
  magKeeperPlate.position.set(0, 0, -0.018);
  magKeeperPlate.userData = {
    subAssemblyId: 'LSH-06B_MAGNETIC_KEEPER_RING',
    subAssemblyTitle: 'LSH-06B: 0.8mm Magnetic Steel Front Pellet Keeper Plate',
    disassemblyOffset: { x: 0, y: 0.018, z: -0.042 },
  };
  rotaryMagGroup.add(magKeeperPlate);

  // LSH-08: 1.8cc Pneumatic Bleed-Jet Indexing Pawl & Star Ratchet Actuator in customCadGroup
  const bleedJetPawl = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.034, 0.028),
    goldBrassMat
  );
  bleedJetPawl.position.set(0.018, 0.032, 0.095);
  bleedJetPawl.rotation.z = 0.32;
  bleedJetPawl.userData = {
    subAssemblyId: 'LSH-08_BLEED_INDEX_PAWL',
    subAssemblyTitle: 'LSH-08: 1.8cc Pneumatic Bleed-Jet Indexing Pawl & Star Ratchet Finger',
    disassemblyOffset: { x: 0.038, y: 0.024, z: 0.028 },
  };
  customCadGroup.add(bleedJetPawl);

  // LSH-09: Forward-Plug Balanced Spool Shuttle (PEEK + Ti, 1.4ms dwell) inside customCadGroup
  const earSpoolShuttle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0085, 0.011, 0.048, 18),
    brushedSteelMat
  );
  earSpoolShuttle.rotation.x = Math.PI / 2;
  earSpoolShuttle.position.set(0, 0.048, 0.135);
  earSpoolShuttle.userData = {
    subAssemblyId: 'LSH-09_EAR_SPOOL_SHUTTLE',
    subAssemblyTitle: 'LSH-09: 1.4ms Hammerless Forward-Plug (EAR) Differential Spool Shuttle',
    disassemblyOffset: { x: 0, y: 0.035, z: 0.068 },
  };
  customCadGroup.add(earSpoolShuttle);

  // LSH-11: Forward Trigger Pilot Bleed Valve Linkage Rod & Return Spring (pumpLinkageGroup / foregripCamGroup)
  const pilotBleedRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.115, 10),
    goldBrassMat
  );
  pilotBleedRod.rotation.x = Math.PI / 2;
  pilotBleedRod.position.set(0, 0.004, 0.085);
  pumpLinkageGroup.add(pilotBleedRod);

  const triggerBladeL2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.032, 0.012),
    crimsonAnodizedMat
  );
  triggerBladeL2.position.set(0, -0.022, 0.042);
  triggerBladeL2.rotation.x = 0.24;
  foregripCamGroup.add(triggerBladeL2);

  const coilSpringGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.038, 12);
  const coilSpringMesh = new THREE.Mesh(coilSpringGeo, brushedSteelMat);
  coilSpringMesh.position.set(0.008, -0.008, 0.098);
  pumpLinkageGroup.add(coilSpringMesh);

  // LSH-12: Red & Black Laminated Wood / AR15 Beavertail Grip
  const gripGeo = new THREE.BoxGeometry(0.046, 0.155, 0.058);
  const gripMesh = new THREE.Mesh(gripGeo, darkGunmetalMat);
  gripMesh.position.set(0, -0.095, 0.08);
  gripMesh.rotation.x = -0.26;
  foregripCamGroup.add(gripMesh);

  for (let s = 0; s < 3; s++) {
    const stripeGeo = new THREE.BoxGeometry(0.048, 0.014, 0.06);
    const stripeMesh = new THREE.Mesh(stripeGeo, crimsonAnodizedMat);
    stripeMesh.position.set(0, -0.055 - s * 0.034, 0.072 + s * 0.008);
    stripeMesh.rotation.x = -0.26;
    foregripCamGroup.add(stripeMesh);
  }

  // R.E.P.R. Regulator Piston + 16-Disc Belleville Spring Stack + 1.4ms Hammerless Forward-Plug (EAR) Valve + 42cc/68cc Plenum Core (plenumGroup)
  const earValveHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.019, 0.019, 0.068, 20),
    goldBrassMat
  );
  earValveHousing.rotation.x = Math.PI / 2;
  earValveHousing.position.set(0, 0.048, 0.145);
  plenumGroup.add(earValveHousing);

  const reprRegulatorColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.062, 16),
    hpaFluidGlowMat
  );
  reprRegulatorColumn.position.set(0, 0.017, 0.21);
  plenumGroup.add(reprRegulatorColumn);

  // 8 Visible Belleville Disc Spring Pairs along Upper R.E.P.R. Regulator Spindle (LSH-10)
  for (let b = 0; b < 8; b++) {
    const bellevilleWasher = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0155, 0.0155, 0.004, 16),
      goldBrassMat
    );
    bellevilleWasher.rotation.x = Math.PI / 2;
    bellevilleWasher.position.set(0, 0.048, 0.215 + b * 0.0085);
    plenumGroup.add(bellevilleWasher);
  }

  const stockLen = 0.38;
  const stockManifoldGeo = new THREE.BoxGeometry(0.068, 0.118, 0.056);
  const stockManifold = new THREE.Mesh(stockManifoldGeo, receiverMat);
  stockManifold.position.set(0, 0.022, 0.135);
  buttstockGroup.add(stockManifold);

  // LSH-07 / LSH-OR-01: Red PU-90A Dynamic Puff-Seal Transfer Puck at Breech Face
  const puckOuterRadius = 0.013 + (customCaliberMm / 12.7) * 0.005;
  const redPuckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(puckOuterRadius, puckOuterRadius, 0.014, 24),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    })
  );
  redPuckMesh.rotation.x = Math.PI / 2;
  redPuckMesh.position.set(-0.008, 0.012, 0.105);
  buttstockGroup.add(redPuckMesh);

  for (const [tubeIdx, yTube] of [0.048, -0.014].entries()) {
    // Quick-Detach (QD) Self-Sealing Twin-Pin Bayonet Coupler Collar at Front of Upper & Lower Air Containers
    const qdBayonetCoupler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0255, 0.0255, 0.028, 12),
      goldBrassMat
    );
    qdBayonetCoupler.rotation.x = Math.PI / 2;
    qdBayonetCoupler.position.set(0, yTube, 0.155);
    qdBayonetCoupler.userData = {
      isLeshiyDetachableContainer: true,
      baseZ: 0.155,
      subAssemblyId: `LSH-QD-BAYONET-${tubeIdx + 1}`,
      subAssemblyTitle: `LSH-QD-0${tubeIdx + 1}: Quarter-Turn Dry-Break Self-Sealing Container Coupler (Hot-Swap 300B Bottle while Folded)`,
    };
    buttstockGroup.add(qdBayonetCoupler);

    const tubeGeo = new THREE.CylinderGeometry(0.023, 0.023, stockLen, 20);
    tubeGeo.rotateX(Math.PI / 2);
    const tubeMesh = new THREE.Mesh(tubeGeo, outerShroudGlassOrMetalMat);
    tubeMesh.position.set(0, yTube, stockLen * 0.5 + 0.14);
    tubeMesh.userData = {
      isLeshiyDetachableContainer: true,
      baseZ: stockLen * 0.5 + 0.14,
      subAssemblyId: `LSH-CONTAINER-TUBE-${tubeIdx + 1}`,
      subAssemblyTitle: `LSH-TUBE-0${tubeIdx + 1}: Quick-Detach ${
        tubeIdx === 0 ? 'Upper Regulated Plenum' : 'Lower 300-Bar Reserve'
      } Pressure Vessel`,
    };
    buttstockGroup.add(tubeMesh);

    const innerGasGeo = new THREE.CylinderGeometry(0.017, 0.017, stockLen * 0.9, 14);
    innerGasGeo.rotateX(Math.PI / 2);
    const innerGas = new THREE.Mesh(innerGasGeo, hpaFluidGlowMat);
    innerGas.position.set(0, yTube, stockLen * 0.5 + 0.14);
    innerGas.userData = {
      isLeshiyDetachableContainer: true,
      baseZ: stockLen * 0.5 + 0.14,
    };
    if (yTube > 0) {
      plenumGroup.add(innerGas);
    } else {
      buttstockGroup.add(innerGas);
    }
  }

  // External R.E.P.R. Micrometer Adjustment Dial Ring & Rear M10×1.0 EDgun Manometer Bezel (LSH-SCR-06)
  const reprExternalScaleRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.0245, 0.0024, 10, 24),
    crimsonAnodizedMat
  );
  reprExternalScaleRing.position.set(0, 0.048, 0.255);
  reprExternalScaleRing.userData = {
    isLeshiyDetachableContainer: true,
    baseZ: 0.255,
  };
  buttstockGroup.add(reprExternalScaleRing);

  const edgunRearGauge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.019, 0.019, 0.016, 20),
    goldBrassMat
  );
  edgunRearGauge.rotation.x = Math.PI / 2;
  edgunRearGauge.position.set(0, 0.048, stockLen + 0.155);
  edgunRearGauge.userData = {
    isLeshiyDetachableContainer: true,
    baseZ: stockLen + 0.155,
  };
  buttstockGroup.add(edgunRearGauge);

  const padGeo = new THREE.BoxGeometry(0.056, 0.16, 0.032);
  const padMesh = new THREE.Mesh(padGeo, darkGunmetalMat);
  padMesh.position.set(0, 0.005, stockLen + 0.14);
  padMesh.userData = {
    isLeshiyDetachableContainer: true,
    baseZ: stockLen + 0.14,
  };
  buttstockGroup.add(padMesh);

  return {
    root,
    familyContext,
    otbShroudGroup,
    plenumGroup,
    handguardGroup,
    buttstockGroup,
    rotaryMagGroup,
    pumpLinkageGroup,
    foregripCamGroup,
    manifoldCoreGroup,
    customCadGroup,
    airflowStreamGroup,
  };
}

/**
 * Updates 3D weapon kinematics with authentic, family-specific Open/Close Breech
 * mechanics, sub-component separation, and 3D high-pressure air flow streamlines.
 */
export function updateModularAirgunKinematics(
  refs: ModularWeapon3DRefs,
  params: {
    explodedAmount: number;
    foregripCamPosition: ForegripCamPosition;
    pumpStrokeOffset: number;
    rotaryIndexAngleDeg: number;
    recoilImpulse: number;
    dt: number;
    airflowActive?: boolean;
    firingCycleProgress?: number; // optional manual stage override 0..1
    compressionStepIndex?: number; // 0: Intake, 1: Compress 300B, 2: Held in Plenum 210B, 3: Fired Release, 4: Baffle & Recharge
    magazineLoaded?: number;
    magazineCapacity?: number;
    componentExplodeAmount?: number; // 0..1 separates internal sub-parts (baffles, O-rings, Belleville washers, pistons, bolts) within each component
    airOnlyStorageView?: boolean; // when true in Physics Range, isolates pressurized air containers, transfer ports, bore pellet, and moderator baffles
  }
) {
  const e = params.explodedAmount;
  const compE = params.componentExplodeAmount ?? 0;
  const k = 1 - Math.exp(-14 * params.dt);
  const { familyId, burstStage } = refs.familyContext;
  const stepIdx =
    params.recoilImpulse > 0.08
      ? 3
      : params.pumpStrokeOffset > 0.2
      ? 1
      : params.compressionStepIndex ?? 2;

  // Apply Component-Level Micro-Explode (separating internal sub-meshes inside each component) & Air-Only Storage View
  applyComponentLevelMicroExplodeAndAirView(
    refs,
    compE,
    Boolean(params.airOnlyStorageView),
    k
  );

  // Compute P50 6-Phase Space/Sand/Underwater Cycle State (0..5)
  const nowSec = typeof performance !== 'undefined' ? performance.now() * 0.001 : 0;
  const p50AutoLoop = Boolean(refs.familyContext.p50AutoCycleLoop);
  const p50ManualPhase = refs.familyContext.p50CyclePhase ?? 0;
  const p50ContinuousPhase = p50AutoLoop
    ? (nowSec * 1.45) % 6.0
    : params.recoilImpulse > 0.02
    ? 1.0 + (1.0 - Math.min(1, params.recoilImpulse)) * 4.99
    : p50ManualPhase;
  const p50PhaseIndex = Math.floor(p50ContinuousPhase) % 6;
  const p50PhaseSubProgress = p50ContinuousPhase - Math.floor(p50ContinuousPhase);

  // 1. Update Live 3D High-Pressure Air Flow Streamline Particles (Strictly active in Virtual Physics Range!)
  if (refs.airflowStreamGroup) {
    const showFlow =
      Boolean(params.airflowActive) || Boolean(params.airOnlyStorageView);
    refs.airflowStreamGroup.visible = showFlow;
    if (showFlow) {
      const nowPhase =
        typeof performance !== 'undefined' ? performance.now() * 0.00055 : 0;
      const children = refs.airflowStreamGroup.children;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const tOffset = (node.userData?.tOffset as number) ?? i / children.length;
        const t =
          params.firingCycleProgress !== undefined
            ? (params.firingCycleProgress * 0.75 + tOffset * 0.25) % 1.0
            : (nowPhase + tOffset) % 1.0;

        if (familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
          const isFiringPhase = p50PhaseIndex === 5 || stepIdx >= 3;
          const isPurgePhase = p50PhaseIndex === 3 || p50PhaseIndex === 4;
          if (!isFiringPhase && !isPurgePhase) {
            // Phases 0..2: Complete Elon-Verified P50 4-Stage Closed-Loop Air Architecture:
            // Stream 0: Grip Base Foster Fill (z=-0.045, y=-0.155) -> Grip Riser -> 160cc Over-Barrel Reserve (y=+0.038, z=-0.42..-0.04)
            // Stream 1: 160cc Over-Barrel Reserve -> Twin Laminar Bypass Conduits past Grip (y=-0.012, z=-0.05..+0.15) -> 280cc Buttstock Tanks (z=+0.15..+0.39)
            // Stream 2: Top Mag Spine 145cc Twin Tubes (y=+0.094) -> Dual Stinger Couplers (z=+0.088) -> 110cc Extended Regulated Plenum (y=-0.032, z=-0.05..+0.17)
            if (i % 3 === 0) {
              if (t < 0.35) {
                const u = t / 0.35;
                node.position.set(0, -0.155 + u * 0.193, -0.045 - u * 0.035);
              } else {
                const u = (t - 0.35) / 0.65;
                node.position.set(0, 0.038, -0.08 - u * 0.34);
              }
            } else if (i % 3 === 1) {
              if (t < 0.48) {
                const u = t / 0.48;
                node.position.set(
                  i % 2 === 0 ? -0.028 : 0.028,
                  -0.012,
                  -0.06 + u * 0.22
                );
              } else {
                const u = (t - 0.48) / 0.52;
                node.position.set(
                  0,
                  i % 2 === 0 ? 0.032 : -0.036,
                  0.16 + u * 0.23
                );
              }
            } else {
              if (t < 0.45) {
                const u = t / 0.45;
                node.position.set(
                  i % 2 === 0 ? -0.025 : 0.025,
                  0.094,
                  -0.24 + u * 0.328
                );
              } else if (t < 0.68) {
                const u = (t - 0.45) / 0.23;
                node.position.set(
                  i % 2 === 0 ? -0.025 : 0.025,
                  0.094 - u * 0.126,
                  0.088
                );
              } else {
                const u = (t - 0.68) / 0.32;
                node.position.set(0, -0.032, -0.04 + u * 0.21);
              }
            }
          } else if (isPurgePhase) {
            // Phases 3..4 (CYCLE BOLT & SEAL COLLARS): 3-Bar sand/water wiper purge + Dual Opposed PU-95A/FFKM Collar radial inflation at z=+0.088..0.145
            if (i % 2 === 0) {
              const ang = t * Math.PI * 6 + i;
              node.position.set(
                Math.cos(ang) * 0.015,
                0.038 + Math.sin(ang) * 0.015,
                0.088 + (i % 2) * 0.048
              );
            } else {
              node.position.set(0, -0.032, -0.05 + t * 0.22);
            }
          } else {
            // Phase 5 (FIRE 200 BAR / 318 J & REPEAT): 110cc Extended Plenum dumps up transfer port & accelerates .50 Cal slug down 457mm barrel + 3.5B Gas Return Piston!
            if (t < 0.26) {
              const u = t / 0.26;
              node.position.set(0, -0.032 + u * 0.07, 0.145 - u * 0.035);
            } else if (t < 0.82) {
              const u = (t - 0.26) / 0.56;
              node.position.set(0, 0.038, 0.11 - u * 0.64);
            } else {
              // Gas return bleed line cycling bolt carrier in Space / Sand / Underwater
              const u = (t - 0.82) / 0.18;
              node.position.set(0, 0.052, -0.35 + u * 0.46);
            }
          }
        } else if (familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
          // Strictly obey the 5 Compression -> Hold -> Fire Steps:
          if (stepIdx === 0) {
            // STEP 1 (INTAKE): Ambient 1 Bar air drawn into outer 3-Stage Pump tube only
            node.position.set(0, -0.032, -0.46 + t * 0.28);
          } else if (stepIdx === 1) {
            // STEP 2 (3-STAGE COMPRESSION -> 300B UNDER-BARREL & MODULAR FRONT BARREL RESERVE)
            if (t < 0.45) {
              const u = t / 0.45;
              node.position.set(0, -0.032, -0.22 - u * 0.26);
            } else {
              const u = (t - 0.45) / 0.55;
              node.position.set(
                0,
                i % 2 === 0 ? 0.004 : 0.064,
                -0.48 + u * 0.42
              );
            }
          } else if (stepIdx === 2) {
            // STEP 3 (REGULATED 210B HOLD IN OVER-BARREL PLENUM): Air held inside 300B Reserve & 140cc Over-Barrel Plenum (SEALED by Poppet — 0 air in barrel!)
            if (t < 0.35) {
              const u = t / 0.35;
              node.position.set(0, 0.004, -0.46 + u * 0.38);
            } else if (t < 0.5) {
              const u = (t - 0.35) / 0.15;
              node.position.set(0, 0.004 + u * 0.06, -0.08);
            } else {
              const u = (t - 0.5) / 0.5;
              const ringAng = u * Math.PI * 4 + i;
              node.position.set(
                Math.cos(ringAng) * 0.024,
                0.064 + Math.sin(ringAng) * 0.024,
                -0.42 + u * 0.38
              );
            }
          } else if (stepIdx === 3) {
            // STEP 4 (TRIGGER FIRED!): Poppet opens 2.8mm -> 210B air in Over-Barrel Plenum dumps radially into breech behind slug & blasts down barrel!
            if (t < 0.28) {
              const u = t / 0.28;
              const r = (1 - u) * 0.024;
              const ringAng = i * 0.8;
              node.position.set(
                Math.cos(ringAng) * r,
                0.064 + Math.sin(ringAng) * r,
                -0.18 + u * 0.22
              );
            } else {
              const u = (t - 0.28) / 0.72;
              node.position.set(0, 0.064, 0.04 - u * 0.76);
            }
          } else {
            // STEP 5 (QUIETENERGY BAFFLE STRIPPING & RECHARGE): Gas expands into 6 silencer baffles at muzzle while Regulator refills Over-Barrel Plenum
            if (i % 2 === 0) {
              const ringAng = t * Math.PI * 6 + i;
              node.position.set(
                Math.cos(ringAng) * 0.025,
                0.064 + Math.sin(ringAng) * 0.025,
                -0.48 - t * 0.26
              );
            } else {
              node.position.set(0, 0.004 + t * 0.06, -0.08);
            }
          }
        } else if (familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
          // 5-Step Unique Coaxial Airflow for #02 Evanix REX-P (.30 Coaxial Pistol & Sniper Carbine):
          if (stepIdx === 0) {
            // Step 1: 250B Rear Coaxial Tank Fill via #39 Foster Nipple
            node.position.set(0, 0.055, 0.48 - t * 0.28);
          } else if (stepIdx === 1) {
            // Step 2: 5-Hole Underlever 42° Cocking & Striker Tensioning inside Tank #22
            const ang = t * Math.PI * 4 + i;
            node.position.set(
              Math.cos(ang) * 0.016,
              0.055 + Math.sin(ang) * 0.016,
              0.16 + t * 0.26
            );
          } else if (stepIdx === 2) {
            // Step 3: Vertical Breech #11 Sealed — 215-250B Poised Behind Coaxial PEEK Poppet #32
            node.position.set(0, 0.055, 0.19 - t * 0.11);
          } else if (stepIdx === 3) {
            // Step 4: Coaxial Sear Break -> Poppet Opens 3.1mm -> 180° Straight Inline Blast Down .30 Barrel!
            node.position.set(0, 0.055, 0.12 - t * 0.68);
          } else {
            // Step 5: Slotted Barrel Shroud #02 & Sniper Moderator Radial Baffle Stripping
            const ang = t * Math.PI * 6 + i;
            node.position.set(
              Math.cos(ang) * 0.018,
              0.055 + Math.sin(ang) * 0.018,
              -0.28 - t * 0.36
            );
          }
        } else if (familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY') {
          // 5-Step Reverse-Loop Center-Barrel Airflow & Post-Muzzle Scatter for #09 The Protector:
          const sel = refs.familyContext.protectorFireSelector || 'DUAL_SALVO';
          const yBore =
            sel === 'BARREL_1_UPPER'
              ? 0.056
              : sel === 'BARREL_2_LOWER'
              ? -0.004
              : i % 2 === 0
              ? 0.056
              : -0.004;
          if (stepIdx === 0) {
            // Step 1: 250B Stored Inside Dual Threaded Annular Barrel Reserves
            const ang = t * Math.PI * 4 + i;
            node.position.set(
              Math.cos(ang) * 0.018,
              yBore + Math.sin(ang) * 0.018,
              -0.44 + t * 0.38
            );
          } else if (stepIdx === 1) {
            // Step 2: Air Flows BACKWARD from Threaded Barrel Reserve out to the Rear Breech Collector!
            node.position.set(0, yBore, -0.36 + t * 0.44);
          } else if (stepIdx === 2) {
            // Step 3: 180° Rear U-Turn Loop & Forward Return Tubes toward Middle of Barrel (Z=-0.24)
            if (t < 0.35) {
              const u = t / 0.35;
              const loopAng = u * Math.PI;
              node.position.set(
                (i % 2 === 0 ? -1 : 1) * 0.028,
                yBore + Math.sin(loopAng) * 0.018,
                0.04 + Math.cos(loopAng) * 0.045
              );
            } else {
              const u = (t - 0.35) / 0.65;
              node.position.set(
                (i % 2 === 0 ? -1 : 1) * 0.032,
                yBore,
                0.08 - u * 0.32
              );
            }
          } else if (stepIdx === 3) {
            // Step 4: Air Pushes Round Out From the MIDDLE of the Barrel (Z=-0.24 -> -0.56)
            node.position.set(0, yBore, -0.24 - t * 0.34);
          } else {
            // Step 5: Breaks Apart & Scatters into an 8-Pellet Cone After Leaving the Barrel!
            const coneAng = ((i % 8) / 8) * Math.PI * 2 + t * 2.0;
            const spreadR = 0.012 + t * 0.075;
            node.position.set(
              Math.cos(coneAng) * spreadR,
              yBore + Math.sin(coneAng) * spreadR,
              -0.54 - t * 0.28
            );
          }
        } else if (familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
          // 5-Step Unique Burst-Disk Airflow for #01 Pen Gun & #03 AEA Defender (Shared SHELL-50-220B):
          const isDefenderTwin = burstStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL';
          const yBore = isDefenderTwin && i % 2 === 1 ? -0.008 : 0.035;
          if (stepIdx === 0) {
            // Step 1: 220B (3,200 PSI) SHELL-50-220B Annular Chamber Charge
            const ang = t * Math.PI * 4 + i;
            node.position.set(
              Math.cos(ang) * 0.011,
              yBore + Math.sin(ang) * 0.011,
              0.08 + t * 0.12
            );
          } else if (stepIdx === 1) {
            // Step 2: L-Slot Striker / Alternating Ratchet Cam Cocked — Static 220B Seal Behind 0.12mm CuNi Foil
            node.position.set(0, yBore, 0.18 - t * 0.08);
          } else if (stepIdx === 2) {
            // Step 3: 0.12mm CuNi 6-Petal Foil Rupture in 0.14ms (Upper Bore Fires First on Defender)
            const activeY = isDefenderTwin ? 0.035 : yBore;
            node.position.set(0, activeY, 0.12 - t * 0.34);
          } else if (stepIdx === 3) {
            // Step 4: Full 12.7mm Bore Sonic Expansion (Lower Bore Alternating Fire on Defender)
            const activeY = isDefenderTwin ? -0.008 : yBore;
            node.position.set(0, activeY, 0.12 - t * 0.56);
          } else {
            // Step 5: Muzzle Vent & Spent SHELL-50-220B Extraction
            const ang = t * Math.PI * 5 + i;
            node.position.set(
              Math.cos(ang) * 0.015,
              yBore + Math.sin(ang) * 0.015,
              -0.32 - t * 0.18
            );
          }
        } else if (familyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY') {
          // Korean Evanix MP30 5-Stage Dual-Cylinder 300cc (2x150cc) -> Figure-8 Bridge -> 165B Regulator -> 48cc Vertical Plenum -> .30 Barrel & 10-Chamber K-Baffle Shroud
          if (stepIdx === 0) {
            const yCyl = i % 2 === 0 ? -0.016 : -0.056;
            node.position.set(0, yCyl, -0.34 + t * 0.28);
          } else if (stepIdx === 1) {
            if (t < 0.5) {
              const u = t / 0.5;
              node.position.set(0, -0.056 + u * 0.04, -0.04);
            } else {
              const u = (t - 0.5) / 0.5;
              node.position.set(0, -0.016, -0.04 + u * 0.05);
            }
          } else if (stepIdx === 2) {
            if (i % 2 === 0) {
              node.position.set(0, -0.016 + t * 0.068, 0.012);
            } else {
              node.position.set(0, -0.016, -0.28 + t * 0.24);
            }
          } else if (stepIdx === 3) {
            if (t < 0.25) {
              const u = t / 0.25;
              node.position.set(0, -0.016 + u * 0.072, 0.012);
            } else {
              const u = (t - 0.25) / 0.75;
              node.position.set(0, 0.056, 0.012 - u * 0.56);
            }
          } else {
            if (i % 2 === 0) {
              const ang = t * Math.PI * 6 + i;
              node.position.set(
                Math.cos(ang) * 0.016,
                0.056 + Math.sin(ang) * 0.016,
                -0.36 - t * 0.22
              );
            } else {
              node.position.set(0, -0.016 + t * 0.068, 0.012);
            }
          }
        } else {
          // EDgun Leshiy 2 (.30) & The Leaf (.45 on Leshiy 2): Strict 5-Stage EAR & R.E.P.R. Airflow Simulation!
          if (stepIdx === 0) {
            node.position.set(0, -0.014, 0.16 + t * 0.34);
          } else if (stepIdx === 1) {
            if (t < 0.45) {
              const u = t / 0.45;
              node.position.set(0, -0.014, 0.48 - u * 0.27);
            } else if (t < 0.65) {
              const u = (t - 0.45) / 0.2;
              node.position.set(0, -0.014 + u * 0.062, 0.21);
            } else {
              const u = (t - 0.65) / 0.35;
              node.position.set(0, 0.048, 0.28 - u * 0.14);
            }
          } else if (stepIdx === 2) {
            if (i % 2 === 0) {
              node.position.set(0, 0.048, 0.14 + t * 0.16);
            } else {
              node.position.set(0, -0.014, 0.18 + t * 0.3);
            }
          } else if (stepIdx === 3) {
            if (t < 0.22) {
              const u = t / 0.22;
              node.position.set(0, 0.048, 0.18 - u * 0.095);
            } else {
              const u = (t - 0.22) / 0.78;
              node.position.set(0, 0.058, 0.085 - u * 0.72);
            }
          } else {
            if (i % 3 === 0) {
              const ang = t * Math.PI * 2;
              node.position.set(
                Math.cos(ang) * 0.022,
                0.048 + Math.sin(ang) * 0.022,
                0.085
              );
            } else {
              const ang = t * Math.PI * 6 + i;
              node.position.set(
                Math.cos(ang) * 0.024,
                0.056 + Math.sin(ang) * 0.024,
                -0.38 - t * 0.28
              );
            }
          }
        }
      }
    }
  }

  if (familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
    // ========================================================================
    // #07 THE P50 (.50 CAL P90 AUTO) — ELON-TUNED 6-PHASE SPACE / SAND / UNDERWATER CYCLE
    // Phase 0: EMPTY MAG SPINE (Nitinol constant-force spring + pneumatic follower advances rearward as rounds fire)
    // Phase 1: ROTATE 90° IN TURRET (Transverse .50 slug rotates 90° in spiral cam ramp to align with bore)
    // Phase 2: PUSH DOWN TO BREECH (Cam elevator finger pushes aligned slug vertically down -56mm into coaxial breech saddle)
    // Phase 3: CYCLE BOLT & PURGE (Hollow-probe bolt cycles forward +42mm, purging sand/water and seating slug into chamber)
    // Phase 4: HERMETIC SEAL LOCK (Dual Opposed PU-95A + FFKM Breech Collars radially inflate 1.28x to lock chamber)
    // Phase 5: FIRE 200 BAR & REPEAT (Balanced spool dumps 110cc Extended Plenum; 3.5B gas-return piston recycles bolt)
    // ========================================================================
    const magCap = Math.max(1, params.magazineCapacity ?? 20);
    const magLoaded = Math.max(0, Math.min(magCap, params.magazineLoaded ?? magCap));
    const loadedRatio =
      p50AutoLoop
        ? Math.max(0.15, 1.0 - ((nowSec * 0.24) % 0.85))
        : magLoaded / magCap;

    // 1. Update visible .50 Cal slugs in top spine, Nitinol follower, elevator finger, AND the Active Cycling Round inside rotaryMagGroup!
    for (const child of refs.rotaryMagGroup.children) {
      if (child.userData?.isP50SpineSlug) {
        const idx = (child.userData.slugIndex as number) ?? 0;
        const totalVisible = (child.userData.totalVisibleSlugs as number) ?? 12;
        const emptyCount = Math.floor((1.0 - loadedRatio) * totalVisible);
        child.visible = idx >= emptyCount;
      } else if (child.userData?.isP50SpineFollower) {
        const zFront = (child.userData.zFront as number) ?? -0.278;
        const zRear = (child.userData.zRear as number) ?? 0.015;
        const targetFollowerZ = zFront + (1.0 - loadedRatio) * (zRear - zFront);
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetFollowerZ, k);
      } else if (child.userData?.isP50ElevatorFinger) {
        const baseY = (child.userData.baseY as number) ?? 0.126;
        // Phase 2 pushes elevator finger down -52mm (-0.052m) into the coaxial breech saddle
        const pushDownOffset =
          p50PhaseIndex === 2
            ? -0.052 * Math.sin(p50PhaseSubProgress * Math.PI)
            : p50PhaseIndex === 3
            ? -0.016
            : 0;
        child.position.y = THREE.MathUtils.lerp(
          child.position.y,
          baseY + pushDownOffset,
          k * 1.35
        );
      } else if (child.userData?.isP50ActiveCyclingRound) {
        const magY = (child.userData.magY as number) ?? 0.094;
        const boreY = (child.userData.boreY as number) ?? 0.038;
        const turretZ = (child.userData.turretZ as number) ?? 0.088;

        let targetRotZ = 0;
        let targetY = boreY;
        let targetZ = turretZ;

        if (p50PhaseIndex === 0) {
          // Transverse in top spine approaching 90° helical feed turret (rotZ = Math.PI/2)
          targetRotZ = Math.PI / 2;
          targetY = magY;
          targetZ = turretZ - 0.042 + p50PhaseSubProgress * 0.042;
        } else if (p50PhaseIndex === 1) {
          // ROTATE 90° inside spiral cam ramp (Math.PI/2 -> 0) while descending slightly into feed throat
          targetRotZ = (1.0 - p50PhaseSubProgress) * (Math.PI / 2);
          targetY = magY - p50PhaseSubProgress * 0.014;
          targetZ = turretZ;
        } else if (p50PhaseIndex === 2) {
          // PUSH DOWN vertically (-56mm total) into coaxial breech saddle (magY -> boreY)
          targetRotZ = 0;
          targetY = THREE.MathUtils.lerp(magY - 0.014, boreY, p50PhaseSubProgress);
          targetZ = turretZ;
        } else if (p50PhaseIndex === 3) {
          // CYCLE BOLT forward +42mm seating slug into chamber throat (turretZ -> turretZ - 0.042)
          targetRotZ = 0;
          targetY = boreY;
          targetZ = turretZ - p50PhaseSubProgress * 0.042;
        } else if (p50PhaseIndex === 4) {
          // HERMETIC SEAL LOCK inside Dual Opposed PU-95A + FFKM Breech Collars
          targetRotZ = 0;
          targetY = boreY;
          targetZ = turretZ - 0.042;
        } else {
          // Phase 5: FIRE 200 BAR down 457mm barrel!
          targetRotZ = 0;
          targetY = boreY;
          targetZ = turretZ - 0.042 - p50PhaseSubProgress * 0.48;
        }

        child.rotation.z = THREE.MathUtils.lerp(child.rotation.z, targetRotZ, k * 1.5);
        child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, k * 1.5);
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, k * 1.5);
      }
    }

    // 2. Animate Dual Opposed PU-95A + FFKM Hermetic Seal Collars inside manifoldCoreGroup (and customCadGroup fallback)
    for (const groupToScan of [refs.manifoldCoreGroup, refs.customCadGroup]) {
      for (const child of groupToScan.children) {
        if (child.userData?.isP50HermeticSealCollar) {
          const isSealed = p50PhaseIndex === 4 || p50PhaseIndex === 5;
          const targetScale = isSealed ? 1.28 : 1.0;
          child.scale.setScalar(
            THREE.MathUtils.lerp(child.scale.x, targetScale, k * 1.5)
          );
        }
      }
    }

    // 3. Animate Reciprocating Hollow-Probe Bolt Carrier inside customCadGroup
    let boltCycleOffsetZ = 0;
    if (p50PhaseIndex === 1 || p50PhaseIndex === 2) {
      boltCycleOffsetZ = 0.042; // Bolt retracted rearward while slug rotates & pushes down into breech saddle
    } else if (p50PhaseIndex === 3) {
      boltCycleOffsetZ = 0.042 * (1.0 - p50PhaseSubProgress); // Bolt drives forward +42mm seating slug into chamber
    } else if (p50PhaseIndex === 5) {
      boltCycleOffsetZ =
        params.recoilImpulse * 0.045 + p50PhaseSubProgress * 0.038;
    }

    refs.customCadGroup.position.z = THREE.MathUtils.lerp(
      refs.customCadGroup.position.z,
      e * 0.11 + boltCycleOffsetZ + params.recoilImpulse * 0.05,
      k
    );
    refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.position.y,
      e * 0.085,
      k
    );
    refs.plenumGroup.position.y = THREE.MathUtils.lerp(
      refs.plenumGroup.position.y,
      -e * 0.065,
      k
    );
    const isP50BarrelUnscrewed = Boolean(refs.familyContext.p50BarrelUnscrewed);
    const p50ForegripPump = refs.familyContext.p50ForegripPumpOffset ?? 0;

    refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
      refs.otbShroudGroup.position.z,
      -e * 0.18 - (isP50BarrelUnscrewed ? 0.14 : 0),
      k
    );
    refs.otbShroudGroup.rotation.z = THREE.MathUtils.lerp(
      refs.otbShroudGroup.rotation.z,
      isP50BarrelUnscrewed ? Math.PI * 2 : 0,
      k
    );
    refs.handguardGroup.position.z = THREE.MathUtils.lerp(
      refs.handguardGroup.position.z,
      -e * 0.06 - (isP50BarrelUnscrewed ? 0.14 : 0),
      k
    );
    for (const child of refs.foregripCamGroup.children) {
      if (child.userData?.isP50ForwardPumpForegrip) {
        const baseZ = (child.userData.baseZ as number) ?? -0.31;
        child.position.z = THREE.MathUtils.lerp(
          child.position.z,
          baseZ + p50ForegripPump * 0.075,
          k * 1.5
        );
      }
    }
    refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
      refs.buttstockGroup.position.z,
      e * 0.12,
      k
    );
    return;
  }

  if (familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY') {
    const isBreechOpen =
      Boolean(refs.familyContext.protectorBreechOpen) ||
      (refs.familyContext.singleRoundReloadPhase ?? 0) === 1 ||
      (refs.familyContext.singleRoundReloadPhase ?? 0) === 2;
    const reloadPhase = refs.familyContext.singleRoundReloadPhase ?? 0;
    const breakAngle = isBreechOpen ? -0.68 : -e * 0.55;

    refs.otbShroudGroup.rotation.x = THREE.MathUtils.lerp(
      refs.otbShroudGroup.rotation.x,
      breakAngle,
      k * 1.4
    );
    // Animate 2× .50 Scatter Sabots sliding into the dual chambers during Load Ammo phase
    const sabotInsertOffsetZ = reloadPhase === 1 ? 0.11 : reloadPhase === 2 ? 0.045 : e * 0.14;
    refs.rotaryMagGroup.position.z = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.position.z,
      sabotInsertOffsetZ,
      k * 1.5
    );
    refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.position.y,
      isBreechOpen ? 0.04 : e * 0.06,
      k * 1.5
    );

    // Animate post-muzzle 8-pellet break-apart scatter cone in Step 4/5 or on recoil
    const showScatter = stepIdx >= 3 || params.recoilImpulse > 0.05 || e > 0.25;
    for (const child of refs.customCadGroup.children) {
      if (child.userData?.isProtectorPostMuzzleScatterCloud) {
        child.visible = showScatter;
        const spreadFactor = params.recoilImpulse > 0.05 ? 1.6 : stepIdx === 4 ? 1.8 : 1.0;
        for (const flechette of child.children) {
          const ang = (flechette.userData?.flechetteAngle as number) ?? 0;
          flechette.position.x = Math.cos(ang) * 0.028 * spreadFactor;
          flechette.position.y = Math.sin(ang) * 0.028 * spreadFactor;
        }
      }
    }
    return;
  }

  if (familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
    // Authentic Redesigned .45 Cal Ascent × Vectis Kinematics:
    // 1. Lever-Action Operated Repeater (`foregripCamGroup`) swings forward 48° when cycling/exploding
    // 2. Caliber-Scaled Stainless Bolt Probe (`customCadGroup`) retracts 34mm rearward to clear the Rotary Mag (`rotaryMagGroup`)
    // 3. Compound 4-Bar Over-Center 300-Bar Hand Pump (`pumpLinkageGroup`) pivots downward around its front fulcrum (-0.46m) AND slides the bronze crosshead collar along the stationary pump tube!
    // 4. Screw-On QuietEnergy 6-Gill Moderator (`isAscentScrewOnSilencer`) unscrews (rotates & translates forward off M18×1.0 threads) when `ascentSilencerUnscrewed` is enabled!
    refs.foregripCamGroup.rotation.x = THREE.MathUtils.lerp(
      refs.foregripCamGroup.rotation.x,
      e * 0.72,
      k
    );
    refs.customCadGroup.position.z = THREE.MathUtils.lerp(
      refs.customCadGroup.position.z,
      e * 0.12 + params.recoilImpulse * 0.04,
      k
    );
    refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.position.y,
      0.09 + e * 0.065,
      k
    );
    refs.rotaryMagGroup.rotation.z = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.rotation.z,
      THREE.MathUtils.degToRad(params.rotaryIndexAngleDeg),
      k
    );

    // Compound 4-Bar Under-Barrel Pump Lever + Sliding Bronze Crosshead Collar
    refs.pumpLinkageGroup.position.set(0, -0.042 - e * 0.04, -0.46);
    const pumpActuation = Math.max(
      e * 0.55,
      params.pumpStrokeOffset * 0.96,
      stepIdx === 0 ? 0.68 : stepIdx === 1 ? 0.18 : 0
    );
    refs.pumpLinkageGroup.rotation.x = THREE.MathUtils.lerp(
      refs.pumpLinkageGroup.rotation.x,
      -pumpActuation,
      k
    );
    for (const child of refs.plenumGroup.children) {
      if (child.userData?.isAscentPumpCrosshead) {
        const baseZ = (child.userData.baseZ as number) ?? -0.32;
        const strokeSlideZ = baseZ + Math.sin(pumpActuation) * 0.14;
        child.position.z = THREE.MathUtils.lerp(child.position.z, strokeSlideZ, k);
      }
    }

    // Animate Quattro 2-Stage Match Trigger Blade, 92mm Transfer Bar, A2 Drop-Sear Dog, and 48.5g 4140 Hammer Striker!
    const isFiringStep = stepIdx === 3 || params.recoilImpulse > 0.04;
    for (const child of refs.foregripCamGroup.children) {
      if (child.userData?.isAscentTriggerShoe) {
        const baseRot = (child.userData.baseRotX as number) ?? 0.25;
        const targetRot = baseRot + (isFiringStep ? 0.34 : stepIdx === 2 ? 0.14 : 0);
        child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, targetRot, k * 1.4);
      } else if (child.userData?.isAscentTransferBar) {
        const baseZ = (child.userData.baseZ as number) ?? 0.088;
        const targetZ = baseZ + (isFiringStep ? 0.008 : stepIdx === 2 ? 0.003 : 0);
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, k * 1.4);
      } else if (child.userData?.isAscentDropSear) {
        const baseY = (child.userData.baseY as number) ?? 0.004;
        const targetY = baseY - (isFiringStep ? 0.007 : 0);
        child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, k * 1.5);
      } else if (child.userData?.isAscentHammerStriker) {
        const baseZ = (child.userData.baseZ as number) ?? 0.135;
        const targetZ = baseZ + (isFiringStep ? -0.022 : 0.012);
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, k * 1.6);
      }
    }

    // Screw-On QuietEnergy 6-Gill Moderator (`isAscentScrewOnSilencer`) unscrewing kinematics
    const isSilencerUnscrewed = Boolean(refs.familyContext.ascentSilencerUnscrewed);
    for (const child of refs.otbShroudGroup.children) {
      if (child.userData?.isAscentScrewOnSilencer) {
        const baseZ = (child.userData.baseZ as number) ?? -0.58;
        const targetSilencerZ =
          baseZ - (isSilencerUnscrewed ? 0.115 : 0) - e * 0.06;
        const targetSilencerRotZ = isSilencerUnscrewed ? Math.PI * 4 : 0;
        child.position.z = THREE.MathUtils.lerp(
          child.position.z,
          targetSilencerZ,
          k
        );
        child.rotation.z = THREE.MathUtils.lerp(
          child.rotation.z,
          targetSilencerRotZ,
          k
        );
      }
    }

    refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
      refs.otbShroudGroup.position.z,
      -e * 0.16,
      k
    );
    refs.plenumGroup.position.y = THREE.MathUtils.lerp(
      refs.plenumGroup.position.y,
      -e * 0.045,
      k
    );
    refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
      refs.buttstockGroup.position.z,
      e * 0.12,
      k
    );
    return;
  }

  if (familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
    // Animate 6-Petal CuNi Burst Disk shearing open when fired or exploded on both Pen Gun & AEA Defender!
    const burstShearedFactor = Math.max(
      e * 0.85,
      params.recoilImpulse > 0.04 || stepIdx >= 3 ? 1.0 : 0
    );
    refs.rotaryMagGroup.traverse((node) => {
      if (node.userData?.isBurstDiskPetalGroup) {
        for (const petal of node.children) {
          const pAng = (petal.userData?.petalAngle as number) ?? 0;
          const openAngle = burstShearedFactor * 0.55;
          petal.rotation.x = Math.sin(pAng) * openAngle;
          petal.rotation.y = -Math.cos(pAng) * openAngle;
        }
      }
    });

    if (burstStage === 'STAGE_1_BURST_DISK_FITTING') {
      refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
        refs.otbShroudGroup.position.z,
        -e * 0.24,
        k
      );
      refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.y,
        e * 0.08,
        k
      );
      refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
        refs.buttstockGroup.position.z,
        e * 0.22,
        k
      );
      return;
    }

    if (burstStage === 'STAGE_2_SIMPLE_RED_AIR_PEN') {
      // #01 MONGO: Animate Single-Round Coaxial Unthreading & SHELL-50-220B Loading (`singleRoundReloadPhase` 0..3)
      const reloadPhase = refs.familyContext.singleRoundReloadPhase ?? 0;
      const unthreadZ = reloadPhase === 1 || reloadPhase === 2 ? -0.14 : 0;
      const shellSlideY = reloadPhase === 1 ? 0.075 : reloadPhase === 2 ? 0.025 : 0;
      const shellSlideZ = reloadPhase === 1 ? -0.06 : 0;

      refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
        refs.otbShroudGroup.position.z,
        -e * 0.28 + unthreadZ,
        k * 1.4
      );
      refs.otbShroudGroup.rotation.z = THREE.MathUtils.lerp(
        refs.otbShroudGroup.rotation.z,
        reloadPhase === 1 || reloadPhase === 2 ? Math.PI * 2 : 0,
        k * 1.4
      );
      refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.y,
        e * 0.11 + shellSlideY,
        k * 1.4
      );
      refs.rotaryMagGroup.position.z = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.z,
        -e * 0.08 + shellSlideZ,
        k * 1.4
      );
      refs.plenumGroup.position.y = THREE.MathUtils.lerp(
        refs.plenumGroup.position.y,
        -e * 0.09,
        k
      );
      refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
        refs.buttstockGroup.position.z,
        e * 0.12 + (reloadPhase > 0 ? 0.035 : 0),
        k
      );
      return;
    }

    if (burstStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL') {
      const reloadPhase = refs.familyContext.singleRoundReloadPhase ?? 0;
      const isBreakOpenReload = reloadPhase === 1 || reloadPhase === 2;
      const isHammerCocked =
        refs.familyContext.defenderHammerCocked !== undefined
          ? Boolean(refs.familyContext.defenderHammerCocked)
          : true;

      // Animate Dual Over-Under Alternating Striker Hammers & Oscillating Ratchet Cam Selector
      for (const child of refs.plenumGroup.children) {
        if (child.userData?.isDefenderAlternatingHammer) {
          const baseZ = (child.userData.baseZ as number) ?? 0.195;
          const hIdx = (child.userData.hammerIndex as number) ?? 0;
          const cockOffsetZ = isHammerCocked
            ? hIdx === 0
              ? 0.022
              : 0.014
            : -0.014;
          child.position.z = THREE.MathUtils.lerp(
            child.position.z,
            baseZ + cockOffsetZ + e * 0.06,
            k
          );
        } else if (child.userData?.isDefenderRatchetCam) {
          const targetRatchetRot = isHammerCocked ? Math.PI : 0;
          child.rotation.x = THREE.MathUtils.lerp(
            child.rotation.x,
            targetRatchetRot + e * Math.PI,
            k
          );
        }
      }

      const breakOpenFactor = isBreakOpenReload ? 0.72 : e * 0.68;
      refs.otbShroudGroup.rotation.x = THREE.MathUtils.lerp(
        refs.otbShroudGroup.rotation.x,
        -breakOpenFactor,
        k * 1.4
      );
      refs.rotaryMagGroup.position.z = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.z,
        reloadPhase === 1 ? 0.16 : reloadPhase === 2 ? 0.06 : e * 0.22,
        k * 1.4
      );
      refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.y,
        (isBreakOpenReload ? 0.06 : 0) + e * 0.09,
        k * 1.4
      );
      refs.rotaryMagGroup.rotation.x = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.rotation.x,
        -(isBreakOpenReload ? 0.22 : e * 0.25),
        k * 1.4
      );
      refs.plenumGroup.position.z = THREE.MathUtils.lerp(
        refs.plenumGroup.position.z,
        e * 0.08,
        k
      );
      return;
    }

    refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
      refs.otbShroudGroup.position.z,
      -e * 0.22,
      k
    );
    refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.position.y,
      e * 0.12,
      k
    );
    refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
      refs.buttstockGroup.position.z,
      e * 0.22,
      k
    );
    return;
  }

  if (familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
    // #02 REX-P & "PRINCESS DONUT" FORK:
    // On Princess Donut Fork (REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL):
    // Pulling down the 5-Hole Trigger-Lock Underlever (#14) pulls the ENTIRE BARREL & SHROUD (`otbShroudGroup`)
    // FORWARD by +38mm (-0.088m Z) out of the receiver cone so the round drops directly into the exposed barrel leade,
    // then closing the Trigger-Lock wedges the 12° barrel cone into the Triple-O-Ring Watertight Seal!
    const isPrincessDonutFork =
      refs.familyContext.rexMode ===
      'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL';
    const reloadPhase = refs.familyContext.singleRoundReloadPhase ?? 0;
    const isCocked =
      Boolean(refs.familyContext.rexLeverCocked) ||
      reloadPhase === 1 ||
      reloadPhase === 2;
    const leverAngle = isCocked ? 0.78 : e * 0.66;
    refs.plenumGroup.rotation.x = THREE.MathUtils.lerp(
      refs.plenumGroup.rotation.x,
      leverAngle,
      k * 1.45
    );

    if (isPrincessDonutFork) {
      // Trigger-Lock pulls the barrel forward (-0.088m = +38mm) when unlatched (isCocked / Phase 1 & 2),
      // then pulls it rearward into the watertight triple-seal cone on Phase 3 / Locked (0)!
      const barrelPullForwardZ = isCocked
        ? -0.088 - e * 0.12
        : reloadPhase === 3
        ? 0.004 // Extra cam-over watertight seal compression squeeze!
        : -e * 0.14;
      refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
        refs.otbShroudGroup.position.z,
        barrelPullForwardZ,
        k * 1.55
      );
      refs.rotaryMagGroup.position.z = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.z,
        isCocked ? -0.042 : -e * 0.1,
        k * 1.45
      );
      refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.y,
        isCocked ? 0.008 : 0,
        k * 1.45
      );
    } else {
      // Standard REX-P: Breech Block #11 drops vertically (-0.018m) & slides back when underlever #14 is cocked open
      refs.rotaryMagGroup.position.z = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.z,
        -(isCocked ? 0.065 : e * 0.12),
        k * 1.45
      );
      refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
        refs.rotaryMagGroup.position.y,
        isCocked ? -0.016 : 0,
        k * 1.45
      );
      refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
        refs.otbShroudGroup.position.z,
        -e * 0.14,
        k
      );
    }

    // Animate the single .30/.45 Cal slug rising from the loading trough and seating directly into the pulled-out barrel leade cone!
    for (const child of refs.rotaryMagGroup.children) {
      if (child.userData?.isRexPSingleRoundSlug) {
        const baseY = (child.userData.baseY as number) ?? 0.055;
        const baseZ = (child.userData.baseZ as number) ?? -0.022;
        const slugTargetY =
          reloadPhase === 1
            ? baseY + 0.044
            : reloadPhase === 2
            ? baseY + 0.004
            : baseY;
        const slugTargetZ =
          reloadPhase === 1
            ? baseZ - (isPrincessDonutFork ? 0.038 : -0.055)
            : reloadPhase === 2
            ? baseZ - (isPrincessDonutFork ? 0.042 : -0.015)
            : baseZ;
        child.position.y = THREE.MathUtils.lerp(child.position.y, slugTargetY, k * 1.6);
        child.position.z = THREE.MathUtils.lerp(child.position.z, slugTargetZ, k * 1.6);
      }
    }

    refs.customCadGroup.position.z = THREE.MathUtils.lerp(
      refs.customCadGroup.position.z,
      -e * 0.24,
      k
    );
    refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
      refs.buttstockGroup.position.z,
      e * 0.16,
      k
    );
    return;
  }

  if (familyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY') {
    const stockFold = refs.familyContext.mp30StockFolded ? 1 : 0;
    const isContainerDetached = Boolean(refs.familyContext.mp30ContainerDetached);
    const isSideLeverCocked = Boolean(refs.familyContext.mp30SideLeverCocked);
    const fastFoldLerp = Math.min(1, k * 1.85); // Rapid 180° stock fold & QD cylinder hot-swap response!

    refs.foregripCamGroup.rotation.z = 0;
    refs.foregripCamGroup.position.z = -0.32;
    refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
      refs.rotaryMagGroup.position.y,
      -e * 0.12,
      k
    );
    refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
      refs.otbShroudGroup.position.z,
      -e * 0.18,
      k
    );
    // Quick-Detach (QD) Dual 300cc Over-Under Air Containers detach forward/downward via self-sealing M18×1.5 Dry-Break valves!
    refs.plenumGroup.position.z = THREE.MathUtils.lerp(
      refs.plenumGroup.position.z,
      isContainerDetached ? -0.145 : -e * 0.08,
      fastFoldLerp
    );
    refs.plenumGroup.position.y = THREE.MathUtils.lerp(
      refs.plenumGroup.position.y,
      isContainerDetached ? -0.055 : -e * 0.03,
      fastFoldLerp
    );
    // Articulated Biathlon Side-Lever & Bolt Probe cocking state
    refs.pumpLinkageGroup.position.z = THREE.MathUtils.lerp(
      refs.pumpLinkageGroup.position.z,
      isSideLeverCocked ? 0.045 : e * 0.04,
      fastFoldLerp
    );
    refs.customCadGroup.position.z = THREE.MathUtils.lerp(
      refs.customCadGroup.position.z,
      isSideLeverCocked ? 0.042 : e * 0.06,
      fastFoldLerp
    );
    refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
      refs.buttstockGroup.position.z,
      e * 0.14 - stockFold * 0.18,
      fastFoldLerp
    );
    refs.buttstockGroup.position.x = THREE.MathUtils.lerp(
      refs.buttstockGroup.position.x,
      -stockFold * 0.095,
      fastFoldLerp
    );
    refs.buttstockGroup.rotation.y = THREE.MathUtils.lerp(
      refs.buttstockGroup.rotation.y,
      -stockFold * 2.95,
      fastFoldLerp
    );
    return;
  }

  // EDgun Leshiy 2 (.30) & The Leaf (.45 on Leshiy 2): Fast 180° Left-Side Folding Stock + Quick-Detach Rear Pressurized Air Container!
  const isLeshiyFolded = Boolean(refs.familyContext.leshiyFolded);
  const isLeshiyContainerDetached = Boolean(
    refs.familyContext.leshiyContainerDetached
  );
  const foldFactor = isLeshiyFolded ? 1.0 : e;
  const fastLeshiyLerp = Math.min(1, k * 1.9);

  refs.otbShroudGroup.position.z = THREE.MathUtils.lerp(
    refs.otbShroudGroup.position.z,
    -e * 0.24,
    k
  );
  refs.otbShroudGroup.position.y = THREE.MathUtils.lerp(
    refs.otbShroudGroup.position.y,
    e * 0.1,
    k
  );
  refs.handguardGroup.position.z = THREE.MathUtils.lerp(
    refs.handguardGroup.position.z,
    -e * 0.14,
    k
  );
  refs.handguardGroup.position.y = THREE.MathUtils.lerp(
    refs.handguardGroup.position.y,
    -e * 0.05,
    k
  );
  refs.plenumGroup.position.z = THREE.MathUtils.lerp(
    refs.plenumGroup.position.z,
    e * 0.12,
    k
  );
  refs.plenumGroup.position.y = THREE.MathUtils.lerp(
    refs.plenumGroup.position.y,
    -e * 0.08,
    k
  );
  refs.manifoldCoreGroup.position.y = THREE.MathUtils.lerp(
    refs.manifoldCoreGroup.position.y,
    e * 0.06,
    k
  );
  refs.foregripCamGroup.position.z = THREE.MathUtils.lerp(
    refs.foregripCamGroup.position.z,
    -0.24 - e * 0.12,
    k
  );
  refs.foregripCamGroup.position.y = THREE.MathUtils.lerp(
    refs.foregripCamGroup.position.y,
    -0.06 - e * 0.08,
    k
  );
  refs.customCadGroup.position.z = THREE.MathUtils.lerp(
    refs.customCadGroup.position.z,
    -e * 0.34,
    k
  );

  // When folded (isLeshiyFolded = true), rotate buttstockGroup ~175° rapidly around left-side hinge (-0.036, 0.095)
  const targetStockRotY = isLeshiyFolded ? -2.98 : -e * 0.85;
  const targetStockPosX = isLeshiyFolded ? -0.095 : -e * 0.14;
  const targetStockPosZ = isLeshiyFolded ? 0.19 : e * 0.18;

  refs.buttstockGroup.position.z = THREE.MathUtils.lerp(
    refs.buttstockGroup.position.z,
    targetStockPosZ,
    fastLeshiyLerp
  );
  refs.buttstockGroup.position.x = THREE.MathUtils.lerp(
    refs.buttstockGroup.position.x,
    targetStockPosX,
    fastLeshiyLerp
  );
  refs.buttstockGroup.rotation.y = THREE.MathUtils.lerp(
    refs.buttstockGroup.rotation.y,
    targetStockRotY,
    fastLeshiyLerp
  );

  // Quick-Detach (QD) Rear Pressurized Container slides cleanly off its Twin-Pin Dry-Break Bayonet Couplers (folded or unfolded!)
  const detachOffsetZ = isLeshiyContainerDetached ? 0.155 : 0;
  for (const groupToScan of [refs.buttstockGroup, refs.plenumGroup]) {
    for (const child of groupToScan.children) {
      if (child.userData?.isLeshiyDetachableContainer) {
        const baseZ = (child.userData.baseZ as number) ?? child.position.z;
        child.position.z = THREE.MathUtils.lerp(
          child.position.z,
          baseZ + detachOffsetZ,
          fastLeshiyLerp
        );
      }
    }
  }

  refs.rotaryMagGroup.position.y = THREE.MathUtils.lerp(
    refs.rotaryMagGroup.position.y,
    0.048 + foldFactor * 0.045,
    k
  );
  refs.rotaryMagGroup.position.x = THREE.MathUtils.lerp(
    refs.rotaryMagGroup.position.x,
    e * 0.08,
    k
  );
  refs.rotaryMagGroup.rotation.z = THREE.MathUtils.lerp(
    refs.rotaryMagGroup.rotation.z,
    THREE.MathUtils.degToRad(params.rotaryIndexAngleDeg),
    k
  );

  refs.pumpLinkageGroup.position.y = THREE.MathUtils.lerp(
    refs.pumpLinkageGroup.position.y,
    -e * 0.14,
    k
  );
}

/**
 * Collects all explodable sub-component nodes inside a component `THREE.Group`.
 * If a direct child is a composite `THREE.Group` (such as `screwOnSilencerGroup`,
 * `edgunUpperReceiverAssembly`, `leshiyRotaryDrumCassette`, `sharedPenShell`), we explode
 * BOTH the sub-group and its internal child meshes so every individual sub-part separates cleanly!
 */
export function getExplodableSubComponentNodesForGroup(
  group: THREE.Group
): THREE.Object3D[] {
  const nodes: THREE.Object3D[] = [];
  for (const child of group.children) {
    if ((child as THREE.Group).isGroup && child.children.length > 0) {
      for (const subChild of child.children) {
        if (!subChild.userData?.isBurstDiskPetalGroup) {
          nodes.push(subChild);
        }
      }
    } else {
      nodes.push(child);
    }
  }
  return nodes;
}

/**
 * Separates the internal sub-parts *within* each weapon component (e.g., individual K-baffle cones,
 * Viton O-ring seals, Belleville washer stacks, regulator pistons, endcap plugs, clamp bolts, and
 * burst-disk petals) when `componentExplodeAmount > 0`.
 * Also handles `airOnlyStorageView` in the Virtual Physics Range by hiding external furniture and
 * rendering the storage vessel & moderator housing in high-contrast translucent X-ray mode.
 */
export function applyComponentLevelMicroExplodeAndAirView(
  refs: ModularWeapon3DRefs,
  componentExplodeAmount: number,
  airOnlyStorageView: boolean,
  lerpFactor = 0.35
): void {
  const cE = Math.max(0, Math.min(1, componentExplodeAmount));
  // Persist on refs.root.userData so `apply3DFocusIsolationAndCentering` never overwrites it!
  refs.root.userData = {
    ...refs.root.userData,
    activeComponentExplodeAmount: cE,
    activeAirOnlyStorageView: airOnlyStorageView,
  };

  const allGroups: Array<{ key: string; group: THREE.Group }> = [
    { key: 'otbShroudGroup', group: refs.otbShroudGroup },
    { key: 'plenumGroup', group: refs.plenumGroup },
    { key: 'handguardGroup', group: refs.handguardGroup },
    { key: 'buttstockGroup', group: refs.buttstockGroup },
    { key: 'rotaryMagGroup', group: refs.rotaryMagGroup },
    { key: 'pumpLinkageGroup', group: refs.pumpLinkageGroup },
    { key: 'foregripCamGroup', group: refs.foregripCamGroup },
    { key: 'manifoldCoreGroup', group: refs.manifoldCoreGroup },
    { key: 'customCadGroup', group: refs.customCadGroup },
  ];

  const familyId = refs.familyContext.familyId;
  const usesStockAirTank =
    familyId === 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY' ||
    familyId === 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY' ||
    familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY';
  const usesShellAirCartridge =
    familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY' ||
    familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY';

  for (const { key, group } of allGroups) {
    // Handle Air-Only Storage & Moderator View visibility for non-air structural furniture
    if (airOnlyStorageView) {
      if (key === 'handguardGroup') {
        group.visible = false;
      } else if (key === 'buttstockGroup' && !usesStockAirTank) {
        group.visible = false;
      } else if (
        key === 'foregripCamGroup' &&
        familyId !== 'P90_45_TOP_HELICAL_PLENUM_FAMILY'
      ) {
        group.visible = false;
      } else if (
        key === 'rotaryMagGroup' &&
        !usesShellAirCartridge &&
        familyId !== 'P90_45_TOP_HELICAL_PLENUM_FAMILY'
      ) {
        group.visible = false;
      } else {
        group.visible = true;
      }
    }

    const subNodes = getExplodableSubComponentNodesForGroup(group);
    const count = subNodes.length;
    for (let i = 0; i < count; i++) {
      const node = subNodes[i];
      if (!node.userData?.origBaseLocalPos) {
        node.userData = {
          ...node.userData,
          origBaseLocalPos: node.position.clone(),
          baseLocalPos: node.position.clone(),
        };
      }
      const basePos = node.userData.origBaseLocalPos as THREE.Vector3;

      const isDynamicCyclingChild =
        Boolean(node.userData?.isP50ActiveCyclingRound) ||
        Boolean(node.userData?.isP50SpineFollower) ||
        Boolean(node.userData?.isP50ElevatorFinger) ||
        Boolean(node.userData?.isRexPSingleRoundSlug) ||
        Boolean(node.userData?.isAscentPumpCrosshead);

      if (!isDynamicCyclingChild || cE > 0.01) {
        const centeredIdx = count > 1 ? i - (count - 1) * 0.5 : 0;
        const clampedAxialStep = Math.min(0.016, 0.16 / Math.max(1, count));
        const customVec = node.userData?.disassemblyOffset as
          | { x: number; y: number; z: number }
          | undefined;

        let dx = 0;
        let dy = 0;
        let dz = 0;

        if (cE > 0.001) {
          if (customVec) {
            dx = customVec.x * 0.68 * cE;
            dy = customVec.y * 0.68 * cE;
            dz = (customVec.z * 0.78 + centeredIdx * clampedAxialStep * 0.45) * cE;
          } else {
            // Clean Coaxial Bore-Axis Telescoping Separation (Zero random radial sky scatter!)
            dx = 0;
            dy = (i % 2 === 0 ? 1 : -1) * 0.005 * cE;
            dz = centeredIdx * clampedAxialStep * cE;
          }
        }

        const targetX = basePos.x + dx;
        const targetY = basePos.y + dy;
        const targetZ = basePos.z + dz;

        node.position.set(
          THREE.MathUtils.lerp(node.position.x, targetX, lerpFactor),
          THREE.MathUtils.lerp(node.position.y, targetY, lerpFactor),
          THREE.MathUtils.lerp(node.position.z, targetZ, lerpFactor)
        );
        // Save the exploded target so `apply3DFocusIsolationAndCentering` preserves it!
        node.userData.explodedTargetLocalPos = new THREE.Vector3(
          targetX,
          targetY,
          targetZ
        );
      }
    }

    // Apply or restore X-Ray translucency on outer pressure housings when `airOnlyStorageView` is toggled
    group.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat || Array.isArray(mat)) return;
        if (mesh.userData?.origOpacity === undefined) {
          mesh.userData = {
            ...mesh.userData,
            origOpacity: mat.opacity,
            origTransparent: mat.transparent,
            origDepthWrite: mat.depthWrite,
          };
        }
        if (airOnlyStorageView) {
          const isHighContrastInternal =
            mat.color.r > 0.65 || mat.emissiveIntensity > 0.25;
          if (!isHighContrastInternal) {
            mat.transparent = true;
            mat.opacity = 0.22;
            mat.depthWrite = false;
          }
        } else if (mesh.userData?.origOpacity !== undefined) {
          mat.opacity = mesh.userData.origOpacity as number;
          mat.transparent = Boolean(mesh.userData.origTransparent);
          mat.depthWrite = Boolean(mesh.userData.origDepthWrite);
        }
      }
    });
  }
}

/**
 * Isolates any of the 10 canonical 3D Focus categories (Silencer, Barrel Cover,
 * Receiver, Breech, Poppet, Mag, Plenum, Foregrip, Grip, Stock) by hiding the rest
 * of the weapon, centering the isolated part at [0,0,0], and preserving any active
 * `componentExplodeAmount` AND optional `selectedSubComponentIdx` separation!
 */
export function apply3DFocusIsolationAndCentering(
  refs: ModularWeapon3DRefs,
  focusPreset: string,
  selectedSubComponentIdx: number | null = null
): void {
  // Always hide airflowStreamGroup when isolating or inspecting components in the Workbench
  if (refs.airflowStreamGroup && !refs.root.userData?.activeAirOnlyStorageView) {
    refs.airflowStreamGroup.visible = false;
  }

  const cE = (refs.root.userData?.activeComponentExplodeAmount as number) ?? 0;
  const airOnlyView = Boolean(refs.root.userData?.activeAirOnlyStorageView);

  const allGroups: Array<{ key: string; group: THREE.Group }> = [
    { key: 'otbShroudGroup', group: refs.otbShroudGroup },
    { key: 'plenumGroup', group: refs.plenumGroup },
    { key: 'handguardGroup', group: refs.handguardGroup },
    { key: 'buttstockGroup', group: refs.buttstockGroup },
    { key: 'rotaryMagGroup', group: refs.rotaryMagGroup },
    { key: 'pumpLinkageGroup', group: refs.pumpLinkageGroup },
    { key: 'foregripCamGroup', group: refs.foregripCamGroup },
    { key: 'manifoldCoreGroup', group: refs.manifoldCoreGroup },
    { key: 'customCadGroup', group: refs.customCadGroup },
  ];

  // Restore visibility (unless airOnlyView hid furniture) and preserve exploded sub-component positions!
  for (const { group } of allGroups) {
    if (!airOnlyView) {
      group.visible = true;
    }
    const subNodes = getExplodableSubComponentNodesForGroup(group);
    for (const node of subNodes) {
      node.visible = true;
      if (!node.userData?.origBaseLocalPos) {
        node.userData = {
          ...node.userData,
          origBaseLocalPos: node.position.clone(),
          baseLocalPos: node.position.clone(),
        };
      }
      if (cE <= 0.001 && selectedSubComponentIdx === null) {
        node.position.copy(node.userData.origBaseLocalPos as THREE.Vector3);
      } else if (node.userData?.explodedTargetLocalPos) {
        node.position.copy(
          node.userData.explodedTargetLocalPos as THREE.Vector3
        );
      }
    }
  }

  if (!focusPreset || focusPreset === 'FULL_SIDE_PROFILE') {
    refs.root.position.set(0, 0, 0);
    return;
  }

  // Map per-weapon 3D Focus categories to the exact physical groups present on the active weapon (Zero Hallucinations!)
  const allowedGroups = new Set<string>();
  const famId = refs.familyContext.familyId;
  const bStage = refs.familyContext.burstStage;
  const isPenGun =
    famId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY' &&
    bStage === 'STAGE_2_SIMPLE_RED_AIR_PEN';
  const isDefender =
    famId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY' &&
    bStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL';
  const isRexP = famId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY';
  const isProtector =
    famId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY';

  switch (focusPreset) {
    case 'FOCUS_SILENCER':
    case 'OVER_BARREL_PLENUM_AND_SILENCER':
      if (isDefender) {
        // DEF-LATCH-05: Top Break-Barrel Stirrup Locking Latch
        allowedGroups.add('handguardGroup');
      } else {
        allowedGroups.add('otbShroudGroup');
        if (isRexP && refs.familyContext.rexMode === 'REX_SNIPER_CARBINE_MODERATED') {
          allowedGroups.add('customCadGroup');
        }
      }
      break;
    case 'FOCUS_BARREL_COVER':
      if (isPenGun || isDefender || isProtector) {
        allowedGroups.add('otbShroudGroup');
      } else if (isRexP) {
        // #29 Cantilever Scope Rail
        allowedGroups.add('handguardGroup');
      } else {
        allowedGroups.add('handguardGroup');
        allowedGroups.add('otbShroudGroup');
      }
      break;
    case 'FOCUS_RECEIVER':
      allowedGroups.add('manifoldCoreGroup');
      if (isDefender || isProtector) {
        allowedGroups.add('buttstockGroup');
      }
      break;
    case 'FOCUS_BREECH':
    case 'BREECH_VALVE_AND_ROTARY_MAG':
      if (isRexP) {
        // #11 Vertical Breech Slide / Princess Donut 12° Cone & Slug
        allowedGroups.add('rotaryMagGroup');
      } else if (isDefender || isProtector) {
        allowedGroups.add('customCadGroup');
      } else {
        allowedGroups.add('customCadGroup');
        allowedGroups.add('rotaryMagGroup');
      }
      break;
    case 'FOCUS_POPPET':
      allowedGroups.add('plenumGroup');
      break;
    case 'FOCUS_MAG':
      allowedGroups.add('rotaryMagGroup');
      break;
    case 'FOCUS_PLENUM':
      allowedGroups.add('plenumGroup');
      if (famId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
        allowedGroups.add('otbShroudGroup');
      }
      break;
    case 'FOCUS_FOREGRIP':
    case 'UNDER_BARREL_300B_PUMP_AND_RESERVE':
      if (isRexP || isDefender) {
        allowedGroups.add('pumpLinkageGroup');
      } else {
        allowedGroups.add('pumpLinkageGroup');
        allowedGroups.add('foregripCamGroup');
      }
      break;
    case 'FOCUS_GRIP':
    case 'STOCK_LEVER_AND_TRIGGER':
      allowedGroups.add('foregripCamGroup');
      allowedGroups.add('pumpLinkageGroup');
      break;
    case 'FOCUS_STOCK':
      allowedGroups.add('buttstockGroup');
      break;
    default:
      refs.root.position.set(0, 0, 0);
      return;
  }

  // Hide all non-focused groups so the rest of the weapon completely disappears!
  const visibleSubNodesList: THREE.Object3D[] = [];
  for (const { key, group } of allGroups) {
    if (!allowedGroups.has(key)) {
      group.visible = false;
      continue;
    }
    group.visible = true;
    const subNodes = getExplodableSubComponentNodesForGroup(group);
    for (const node of subNodes) {
      node.visible = true;
      visibleSubNodesList.push(node);
    }
  }

  if (visibleSubNodesList.length === 0) {
    refs.manifoldCoreGroup.visible = true;
    refs.otbShroudGroup.visible = true;
    for (const node of getExplodableSubComponentNodesForGroup(
      refs.manifoldCoreGroup
    )) {
      node.visible = true;
      visibleSubNodesList.push(node);
    }
  }

  // Additional Sub-Component Separation when a specific Sub-Component index is selected (or combined with cE)
  if (
    selectedSubComponentIdx !== null &&
    selectedSubComponentIdx >= 0 &&
    visibleSubNodesList.length > 1
  ) {
    const count = visibleSubNodesList.length;
    const targetMeshIdx = selectedSubComponentIdx % count;
    for (let i = 0; i < count; i++) {
      const node = visibleSubNodesList[i];
      const basePos =
        (node.userData?.explodedTargetLocalPos as THREE.Vector3) ||
        (node.userData?.origBaseLocalPos as THREE.Vector3) ||
        node.position;
      const customVec = node.userData?.disassemblyOffset as
        | { x: number; y: number; z: number }
        | undefined;
      const isTarget = i === targetMeshIdx;

      if (customVec) {
        const scale = isTarget ? 1.25 : 0.45;
        node.position.set(
          basePos.x + customVec.x * scale,
          basePos.y + customVec.y * scale + (isTarget ? 0.026 : 0),
          basePos.z + customVec.z * scale
        );
      } else {
        const centeredIdx = i - (count - 1) * 0.5;
        const axialClearanceZ = centeredIdx * 0.042;
        const verticalClearanceY = isTarget
          ? 0.034
          : i % 2 === 0
          ? 0.01
          : -0.01;
        node.position.set(
          basePos.x,
          basePos.y + verticalClearanceY,
          basePos.z + axialClearanceZ
        );
      }
    }
  }

  // Compute bounding box of the visible isolated meshes and center at [0, 0, 0]
  refs.root.position.set(0, 0, 0);
  refs.root.updateMatrixWorld(true);
  const isolatedBox = new THREE.Box3();
  for (const node of visibleSubNodesList) {
    if (node.visible) {
      isolatedBox.expandByObject(node);
    }
  }
  if (!isolatedBox.isEmpty()) {
    const worldCenter = new THREE.Vector3();
    isolatedBox.getCenter(worldCenter);
    const parentInv = new THREE.Matrix4();
    if (refs.root.parent) {
      refs.root.parent.updateMatrixWorld(true);
      parentInv.copy(refs.root.parent.matrixWorld).invert();
      worldCenter.applyMatrix4(parentInv);
    }
    refs.root.position.set(-worldCenter.x, -worldCenter.y, -worldCenter.z);
  }
}

/**
 * Mounts an imported, P2P-shared, or agent-synthesized .STL BufferGeometry directly onto the active 3D weapon
 * inside `customCadGroup` so the user can inspect, explode, and re-export it in the 3D Workbench.
 * Automatically centers the mesh and converts millimeter-unit STL files (0.001x) to the Three.js meter scale.
 */
export function mountCustomStlBufferGeometryOnWeapon(
  refs: ModularWeapon3DRefs,
  positionsFloat32: Float32Array,
  partTitle: string
): THREE.Mesh {
  // Remove any previously mounted custom imported STL mesh
  const existing = refs.customCadGroup.children.filter(
    (c) => c.userData?.isMountedExternalStl
  );
  for (const old of existing) {
    refs.customCadGroup.remove(old);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positionsFloat32), 3)
  );
  geometry.center();
  geometry.computeBoundingBox();

  // Convert millimeter-scale STL coordinates (e.g., 37.38 × 37.38 × 155 mm) to Three.js meters (0.001x)
  if (geometry.boundingBox) {
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 1.2) {
      geometry.scale(0.001, 0.001, 0.001);
    } else if (maxDim > 0.35) {
      const targetScale = 0.16 / maxDim;
      geometry.scale(targetScale, targetScale, targetScale);
    }
    geometry.computeBoundingBox();
  }
  geometry.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.25,
    roughness: 0.22,
    metalness: 0.86,
  });

  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(0, 0.072, -0.06);
  mesh.userData = {
    isMountedExternalStl: true,
    baseLocalPos: new THREE.Vector3(0, 0.072, -0.06),
    subAssemblyId: 'IMPORTED_STL_CAD_PART',
    subAssemblyTitle: partTitle,
    disassemblyOffset: { x: 0, y: 0.065, z: -0.04 },
  };
  refs.customCadGroup.add(mesh);
  return mesh;
}

export interface DccDivaCatCompanion3DRefs {
  root: THREE.Group;
  cushionGroup: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  tailMesh: THREE.Mesh;
  leftLaserBeam: THREE.Mesh;
  rightLaserBeam: THREE.Mesh;
}

/**
 * Builds the 3D Dungeon Crawler Carl Aristocratic Diva Show-Cat Companion
 * ("HRH Princess Chonk-Beam III") riding a floating royal-purple velvet hover-cushion,
 * wearing a jeweled gold tiara and magenta star-shaped sunglasses, with twin ocular
 * magic-missile eye-beams that fire autonomously at Evil Swarm enemies.
 */
export function createDccDivaShowCatCompanion3D(): DccDivaCatCompanion3DRefs {
  const root = new THREE.Group();
  const cushionGroup = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();

  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0x6b21a8,
    emissive: 0x3b0764,
    emissiveIntensity: 0.35,
    roughness: 0.55,
    metalness: 0.2,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.92,
  });
  const tortieFurMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.72,
    metalness: 0.1,
  });
  const creamChestMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.75,
    metalness: 0.05,
  });
  const magentaShadesMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    emissive: 0xdb2777,
    emissiveIntensity: 0.85,
    roughness: 0.12,
    metalness: 0.65,
  });
  const laserBeamMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.9,
  });

  // 1. Floating Royal Velvet Anti-Gravity Hover-Cushion + Gold Tassels
  const cushionDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.52, 0.14, 24),
    velvetMat
  );
  cushionGroup.add(cushionDisc);

  const goldRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.49, 0.032, 12, 28),
    goldTrimMat
  );
  goldRim.rotation.x = Math.PI / 2;
  goldRim.position.y = 0.02;
  cushionGroup.add(goldRim);

  // Under-cushion cyan anti-grav thruster glow
  const thrusterGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.18, 0.06, 20),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 })
  );
  thrusterGlow.position.y = -0.09;
  cushionGroup.add(thrusterGlow);
  root.add(cushionGroup);

  // 2. Fluffy Persian Show-Cat Torso, Chest Ruff & Paws
  const torso = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 18, 16),
    tortieFurMat
  );
  torso.scale.set(1.05, 0.95, 1.32);
  torso.position.set(0, 0.24, 0);
  bodyGroup.add(torso);

  const chestRuff = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 16, 14),
    creamChestMat
  );
  chestRuff.position.set(0, 0.27, 0.22);
  bodyGroup.add(chestRuff);

  for (const sx of [-0.13, 0.13]) {
    const frontPaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 10),
      creamChestMat
    );
    frontPaw.position.set(sx, 0.1, 0.28);
    bodyGroup.add(frontPaw);
  }

  // Fluffy animated tail
  const tailGeo = new THREE.CylinderGeometry(0.055, 0.075, 0.42, 12);
  tailGeo.translate(0, 0.21, 0);
  const tailMesh = new THREE.Mesh(tailGeo, tortieFurMat);
  tailMesh.position.set(0, 0.24, -0.32);
  tailMesh.rotation.x = -0.55;
  bodyGroup.add(tailMesh);
  root.add(bodyGroup);

  // 3. Head, Ears, Jeweled Gold Tiara & Star Sunglasses
  headGroup.position.set(0, 0.52, 0.22);
  const headSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 18, 16),
    tortieFurMat
  );
  headGroup.add(headSphere);

  // Pointed Persian Ears
  for (const sx of [-0.13, 0.13]) {
    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.075, 0.15, 6),
      tortieFurMat
    );
    ear.position.set(sx, 0.2, 0);
    ear.rotation.z = sx > 0 ? -0.25 : 0.25;
    headGroup.add(ear);
  }

  // Royal Gold Tiara with Ruby Center Jewel
  const tiaraCrown = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.018, 10, 20, Math.PI),
    goldTrimMat
  );
  tiaraCrown.position.set(0, 0.21, 0.05);
  headGroup.add(tiaraCrown);

  const tiaraJewel = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.042, 0),
    magentaShadesMat
  );
  tiaraJewel.position.set(0, 0.27, 0.08);
  headGroup.add(tiaraJewel);

  // Oversized Diva Star-Shaped Sunglasses
  for (const sx of [-0.085, 0.085]) {
    const starLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.068, 0.025, 5),
      magentaShadesMat
    );
    starLens.rotation.x = Math.PI / 2;
    starLens.position.set(sx, 0.03, 0.195);
    headGroup.add(starLens);
  }

  // 4. Twin Ocular Magic-Missile Eye-Beams (extend forward along +Z when firing)
  const beamGeo = new THREE.CylinderGeometry(0.022, 0.036, 1.0, 10);
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, 0.5);

  const leftLaserBeam = new THREE.Mesh(beamGeo, laserBeamMat);
  leftLaserBeam.position.set(-0.085, 0.03, 0.21);
  leftLaserBeam.visible = false;
  headGroup.add(leftLaserBeam);

  const rightLaserBeam = new THREE.Mesh(beamGeo, laserBeamMat);
  rightLaserBeam.position.set(0.085, 0.03, 0.21);
  rightLaserBeam.visible = false;
  headGroup.add(rightLaserBeam);

  root.add(headGroup);

  return {
    root,
    cushionGroup,
    bodyGroup,
    headGroup,
    tailMesh,
    leftLaserBeam,
    rightLaserBeam,
  };
}


