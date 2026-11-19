/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  PRESET_LOADOUTS,
  WeaponBuildLoadout,
  computeWeaponStats,
  createInitialPneumaticState,
} from './game/partsCatalog';
import {
  FourZonePneumaticState,
  OneWayFillTarget,
  simulatePneumaticShot,
  simulatePumpStroke,
  simulateAscentPumpStrokeTo300Bar,
  equalizeAndRegulateZones,
} from './wasm/pneumaticWasm';
import {
  GeneratedArenaMap,
  generateRandomArena,
  collidesWithArenaWalls,
  stepArenaEnemies,
  EnemyArchetype,
} from './game/rules';
import {
  ModularWeapon3DRefs,
  Weapon3DFamilyContext,
  buildModularAirgunMesh,
  updateModularAirgunKinematics,
  apply3DFocusIsolationAndCentering,
  mountCustomStlBufferGeometryOnWeapon,
  createDccDivaShowCatCompanion3D,
  DccDivaCatCompanion3DRefs,
} from './game/weapon3d';
import { exportThreeObjectToWatertightStl } from './game/workbenchElonPhysicsAndStlEngine';
import {
  computeAccurateMagCapacityByWeaponAndCaliber,
  evaluateWeaponFamilyCompatibility,
  resolveActiveWeaponFamily,
} from './game/weaponFamiliesAndCompatibility';
import { soundEngine } from './game/sound';
import { GunsmithWorkbench } from './components/GunsmithWorkbench';
import { GameHudAndModals, GameShellState } from './components/GameHudAndModals';
import { VirtualPhysicsRange } from './components/VirtualPhysicsRange';
import {
  POPULAR_25_AIRGUNS,
  DischargeMechanismType,
  SavedWeaponVersion,
  SurvivorPrintInventory,
  INITIAL_SURVIVOR_INVENTORY,
  runCachedPhysicsSimulation,
} from './game/popular25Catalog';
import {
  ElonAlgoVersionState,
  createInitialElonAlgoVersionState,
  executeElonAlgoAndAgentsVersionRun,
  resolveHitlApprovalWebhook,
  ensureAtLeastOneCyclePerDay,
} from './game/hermesVertexOrchestratorAndElonAlgo';
import { HermesVertexAndElonModal } from './components/HermesVertexAndElonModal';
import {
  DccCompanionPersistentMemory,
  DccSystemAiPostRoundBroadcast,
  RoyalCourtAgentId,
  RoyalGuardEquipmentId,
  loadDccCompanionMemory,
  saveDccCompanionMemory,
  requestGenerativeCompanionBanter,
  requestPostRoundSystemAiBroadcast,
  commandRoyalCourtAgentWork,
} from './game/dccCompanionAndSwarmEngine';
import { DccCompanionAndSystemAiHud } from './components/DccCompanionAndSystemAiHud';
import { ThreePrinterRoom } from './components/ThreePrinterRoom';
import {
  PrinterPartRecipe,
  PrinterStationId,
  executePrinterPartFabrication,
} from './game/threePrinterRoomEngine';
import {
  GameGraphicsVisualMode,
  GRAPHICS_MODE_SPECS,
  applyGraphicsModeToSceneAndRenderer,
} from './game/reverseEngineeringCadAgentAndGraphicsEngine';
import { ReverseEngineeringCadFolderModal } from './components/ReverseEngineeringCadFolderModal';
import { RidiculousDccEnemyId } from './game/airPhysicsRangeAndStorageEngine';
import {
  XrSessionMode,
  XrHardwareSupportStatus,
  probeWebXrHardwareSupport,
  createWebXrControllerRig3D,
  updateWebXrRigKinematics,
} from './game/webXrSpatialEngine';

// Pre-allocated scratch vectors outside render loop (Zero GC)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _enemyPos = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();

interface PooledSlugProjectile {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  damage: number;
  life: number;
}

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
}

/**
 * Builds a composite 3D enemy group with contact shadow disc, windup telegraph ring,
 * and Ridiculous Dungeon Crawler Carl (DCC) procedural 3D visual details.
 */
function createCompositeEnemyMesh(
  archetype: EnemyArchetype,
  dccEnemyId?: RidiculousDccEnemyId,
  dccColorHex?: number
): {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  telegraphRing: THREE.Mesh;
} {
  const group = new THREE.Group();

  // Contact shadow disc at floor level
  const shadowGeo = new THREE.CircleGeometry(
    archetype === 'HEAVY_BREACHER_MECH' ? 1.15 : 0.75,
    16
  );
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.position.y = 0.015;
  group.add(shadowDisc);

  // Telegraph ground ring (visible during WINDUP_TELEGRAPH)
  const teleGeo = new THREE.RingGeometry(0.75, 1.05, 24);
  teleGeo.rotateX(-Math.PI / 2);
  const teleMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const telegraphRing = new THREE.Mesh(teleGeo, teleMat);
  telegraphRing.position.y = 0.03;
  telegraphRing.visible = false;
  group.add(telegraphRing);

  const hullColor =
    dccColorHex ??
    (archetype === 'HEAVY_BREACHER_MECH'
      ? 0x7f1d1d
      : archetype === 'KITER_SNIPER_DRONE'
      ? 0x0369a1
      : 0xb45309);

  const hullMat = new THREE.MeshStandardMaterial({
    color: hullColor,
    roughness: 0.55,
    metalness: 0.4,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.3,
    metalness: 0.82,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: archetype === 'KITER_SNIPER_DRONE' ? 0x38bdf8 : 0xef4444,
    emissive: archetype === 'KITER_SNIPER_DRONE' ? 0x0284c7 : 0xdc2626,
    emissiveIntensity: 0.8,
    roughness: 0.15,
    metalness: 0.5,
  });

  // Ridiculous Dungeon Crawler Carl (DCC) Special Signatures
  if (dccEnemyId === 'BALL_OF_SWINE_BERSERKER') {
    const bodyGeo = new THREE.DodecahedronGeometry(0.85, 1);
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
    bodyMesh.position.y = 0.88;
    group.add(bodyMesh);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const tusk = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.42, 8),
        visorMat
      );
      tusk.position.set(
        Math.cos(ang) * 0.78,
        0.88 + (i % 2 === 0 ? 0.25 : -0.25),
        Math.sin(ang) * 0.78
      );
      tusk.rotation.z = -Math.cos(ang) * 0.9;
      tusk.rotation.x = Math.sin(ang) * 0.9;
      group.add(tusk);
    }
    return { group, bodyMesh, telegraphRing };
  }

  if (dccEnemyId === 'LLAMA_METH_SPITTER') {
    const bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.58, 1.15),
      hullMat
    );
    bodyMesh.position.y = 0.78;
    group.add(bodyMesh);
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 1.05, 10),
      hullMat
    );
    neck.position.set(0, 1.42, 0.42);
    neck.rotation.x = 0.22;
    group.add(neck);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.28, 0.54),
      visorMat
    );
    head.position.set(0, 1.92, 0.58);
    group.add(head);
    for (const [lx, lz] of [
      [-0.24, -0.4],
      [0.24, -0.4],
      [-0.24, 0.4],
      [0.24, 0.4],
    ]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.06, 0.65, 8),
        trimMat
      );
      leg.position.set(lx, 0.32, lz);
      group.add(leg);
    }
    return { group, bodyMesh, telegraphRing };
  }

  if (dccEnemyId === 'PUG_GLADIATOR_CHARIOT') {
    const roombaDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.82, 0.26, 20),
      trimMat
    );
    roombaDisc.position.y = 0.2;
    group.add(roombaDisc);
    const bodyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 14, 14),
      hullMat
    );
    bodyMesh.position.set(0, 0.68, 0.05);
    group.add(bodyMesh);
    const capeOrSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.55, 8),
      visorMat
    );
    capeOrSpike.rotation.x = Math.PI / 2;
    capeOrSpike.position.set(0, 0.32, 0.85);
    group.add(capeOrSpike);
    return { group, bodyMesh, telegraphRing };
  }

  if (archetype === 'SWARMER_SCOUT') {
    // 1. Primary low-slung chassis (or Goblin Murder-Dozer)
    const bodyGeo = new THREE.BoxGeometry(0.82, 0.58, 1.12);
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
    bodyMesh.position.y = 0.55;
    group.add(bodyMesh);

    // Flaming Dozer Blade at front
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.44, 0.16),
      visorMat
    );
    blade.position.set(0, 0.38, 0.65);
    group.add(blade);

    // Twin side pneumatic cylinders / tracks
    for (const side of [-0.46, 0.46]) {
      const tankGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.88, 12);
      tankGeo.rotateX(Math.PI / 2);
      const tank = new THREE.Mesh(tankGeo, trimMat);
      tank.position.set(side, 0.42, 0);
      group.add(tank);
    }

    return { group, bodyMesh, telegraphRing };
  } else if (archetype === 'KITER_SNIPER_DRONE') {
    // 1. Primary aerodynamic turbine core (or Karen HOA Hover-Harpy)
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.32, 1.18, 14);
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
    bodyMesh.position.y = 1.25;
    group.add(bodyMesh);

    // 2. Twin stabilizer wings / HOA Clipboard Wings
    const wingGeo = new THREE.BoxGeometry(1.62, 0.09, 0.44);
    const wings = new THREE.Mesh(wingGeo, trimMat);
    wings.position.set(0, 1.38, 0);
    group.add(wings);

    // 3. Long over-the-barrel megaphone / sniper lance
    const barrelGeo = new THREE.CylinderGeometry(0.07, 0.14, 1.05, 10);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, trimMat);
    barrel.position.set(0, 1.12, 0.55);
    group.add(barrel);

    // 4. Glowing optical eye
    const eyeGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const eye = new THREE.Mesh(eyeGeo, visorMat);
    eye.position.set(0, 1.38, 0.44);
    group.add(eye);

    return { group, bodyMesh, telegraphRing };
  } else {
    // HEAVY_BREACHER_MECH (Krakaren Vending Mimic / Sewer Rat Mech / Hoarder Golem)
    const scaleBoost = dccEnemyId === 'NEIGHBORHOOD_BOSS_HOARDER_GOLEM' ? 1.25 : 1.0;
    const bodyGeo = new THREE.BoxGeometry(
      1.28 * scaleBoost,
      1.42 * scaleBoost,
      0.98 * scaleBoost
    );
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
    bodyMesh.position.y = 1.28 * scaleBoost;
    group.add(bodyMesh);

    // Twin shoulder 300-bar HPA tanks / Vending towers
    for (const side of [-0.54 * scaleBoost, 0.54 * scaleBoost]) {
      const tankGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.1, 14);
      const tank = new THREE.Mesh(tankGeo, trimMat);
      tank.position.set(side, 1.58 * scaleBoost, -0.35);
      group.add(tank);
    }

    // Front ballistic riot shield / CRT TV Belly Plate
    const shieldGeo = new THREE.BoxGeometry(
      1.4 * scaleBoost,
      1.12 * scaleBoost,
      0.16
    );
    const shield = new THREE.Mesh(shieldGeo, trimMat);
    shield.position.set(0, 1.15 * scaleBoost, 0.55 * scaleBoost);
    group.add(shield);

    // Heavy glowing visor / CRT screen
    const visorGeo = new THREE.BoxGeometry(
      0.86 * scaleBoost,
      0.26 * scaleBoost,
      0.18
    );
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.68 * scaleBoost, 0.5 * scaleBoost);
    group.add(visor);

    // Twin hydraulic pillar legs
    for (const side of [-0.38 * scaleBoost, 0.38 * scaleBoost]) {
      const legGeo = new THREE.BoxGeometry(0.36, 0.72, 0.46);
      const leg = new THREE.Mesh(legGeo, trimMat);
      leg.position.set(side, 0.36, 0);
      group.add(leg);
    }

    return { group, bodyMesh, telegraphRing };
  }
}

/**
 * Builds the central tall landmark: 250-Bar Pneumatic Compressor Tower (`THREE.Group` of 6 parts)
 */
function createCompressorLandmarkTower(x: number, z: number): THREE.Group {
  const tower = new THREE.Group();
  tower.position.set(x, 0, z);

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x3f3f46,
    roughness: 0.85,
    metalness: 0.15,
  });
  const vesselMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.28,
    metalness: 0.78,
  });
  const gantryMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.45,
    metalness: 0.65,
  });
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  // 1. Octagonal Plinth Base
  const baseGeo = new THREE.CylinderGeometry(1.9, 2.1, 0.8, 8);
  const base = new THREE.Mesh(baseGeo, concreteMat);
  base.position.y = 0.4;
  tower.add(base);

  // 2 & 3. Twin Tall High-Pressure Storage Vessels
  for (const offsetX of [-0.72, 0.72]) {
    const tankGeo = new THREE.CylinderGeometry(0.55, 0.55, 5.8, 18);
    const tank = new THREE.Mesh(tankGeo, vesselMat);
    tank.position.set(offsetX, 3.5, 0);
    tower.add(tank);
  }

  // 4. Overhead Cross-Manifold Bridge
  const bridgeGeo = new THREE.BoxGeometry(2.4, 0.55, 0.9);
  const bridge = new THREE.Mesh(bridgeGeo, gantryMat);
  bridge.position.set(0, 6.5, 0);
  tower.add(bridge);

  // 5. Spire Antenna Mast
  const mastGeo = new THREE.CylinderGeometry(0.12, 0.22, 2.8, 10);
  const mast = new THREE.Mesh(mastGeo, concreteMat);
  mast.position.set(0, 8.1, 0);
  tower.add(mast);

  // 6. Top Beacon
  const beaconGeo = new THREE.SphereGeometry(0.36, 12, 12);
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, 9.6, 0);
  tower.add(beacon);

  return tower;
}

/**
 * Builds the 3D Sealed Fabrication Bunker Room containing 3 distinct industrial 3D Printers:
 * - Left (-3.2, 0, 0): Printer #01 Voron-X High-Temp Polymer & Composite SLS (Emerald)
 * - Center (0, 0, -0.4): Printer #02 EOS-M300 Direct Metal Laser Sintering DMLS & CNC (Sky Blue)
 * - Right (3.2, 0, 0): Printer #03 300-Bar Ordnance & Burst-Disk Cartridge Synthesizer (Amber)
 */
function createTriPrinterRoom3DBay(): {
  root: THREE.Group;
  gantryHeads: THREE.Mesh[];
  printingWorkpieces: THREE.Mesh[];
} {
  const root = new THREE.Group();
  const gantryHeads: THREE.Mesh[] = [];
  const printingWorkpieces: THREE.Mesh[] = [];

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.45,
    metalness: 0.78,
  });
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.3,
    metalness: 0.85,
  });

  const stations: Array<{ x: number; z: number; accentHex: number; workGeo: THREE.BufferGeometry }> = [
    {
      x: -3.2,
      z: 0,
      accentHex: 0x10b981,
      workGeo: new THREE.CylinderGeometry(0.32, 0.32, 0.24, 16),
    },
    {
      x: 0,
      z: -0.35,
      accentHex: 0x38bdf8,
      workGeo: new THREE.CylinderGeometry(0.16, 0.16, 0.85, 16),
    },
    {
      x: 3.2,
      z: 0,
      accentHex: 0xf59e0b,
      workGeo: new THREE.CapsuleGeometry(0.18, 0.42, 8, 16),
    },
  ];

  for (const st of stations) {
    const bay = new THREE.Group();
    bay.position.set(st.x, 0, st.z);

    const accentMat = new THREE.MeshStandardMaterial({
      color: st.accentHex,
      emissive: st.accentHex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.7,
    });

    // Armored Pedestal Cabinet
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 1.8), frameMat);
    pedestal.position.y = 0.5;
    bay.add(pedestal);

    // Heated Build Plate
    const buildPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.12, 24), bedMat);
    buildPlate.position.y = 1.08;
    bay.add(buildPlate);

    // 4 Vertical Linear Rail Columns
    for (const cx of [-0.82, 0.82]) {
      for (const cz of [-0.68, 0.68]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.75, 10), frameMat);
        col.position.set(cx, 1.88, cz);
        bay.add(col);
      }
    }

    // Top Printer Crown Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.28, 1.75), frameMat);
    hood.position.y = 2.82;
    bay.add(hood);

    const hoodTrim = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 1.8), accentMat);
    hoodTrim.position.y = 2.98;
    bay.add(hoodTrim);

    // Animated X/Y/Z Gantry Print Head / Laser Sinter Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.42), accentMat);
    head.position.set(0, 2.05, 0);
    bay.add(head);
    gantryHeads.push(head);

    // Workpiece actively being fabricated on the build plate
    const work = new THREE.Mesh(st.workGeo, accentMat);
    work.position.set(0, 1.42, 0);
    bay.add(work);
    printingWorkpieces.push(work);

    root.add(bay);
  }

  // 4. Back-Wall 9-Weapon Illuminated Armory Rack (#01 Mongo through #09 The Protector)
  const rackGroup = new THREE.Group();
  rackGroup.position.set(0, 0, -2.55);
  const rackBackboard = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 2.5, 0.18),
    frameMat
  );
  rackBackboard.position.set(0, 1.55, 0);
  rackGroup.add(rackBackboard);

  const rackNeonTrim = new THREE.Mesh(
    new THREE.BoxGeometry(8.66, 0.08, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    })
  );
  rackNeonTrim.position.set(0, 2.78, 0.02);
  rackGroup.add(rackNeonTrim);

  // 9 mounted weapon silhouette barrels across the back wall rack
  const weaponColors = [
    0xdc2626, 0x38bdf8, 0xf59e0b, 0x10b981, 0x34d399, 0x60a5fa, 0xa855f7, 0xfbbf24, 0xf43f5e,
  ];
  for (let i = 0; i < 9; i++) {
    const slotX = -3.6 + i * 0.9;
    const gunMount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.78 + (i % 3) * 0.16, 12),
      new THREE.MeshStandardMaterial({
        color: weaponColors[i],
        emissive: weaponColors[i],
        emissiveIntensity: 0.25,
        metalness: 0.85,
        roughness: 0.25,
      })
    );
    gunMount.rotation.z = Math.PI * 0.12;
    gunMount.position.set(slotX, 1.55, 0.18);
    rackGroup.add(gunMount);
  }
  root.add(rackGroup);

  // 5. HRH Princess Donut's Royal Court Command Pedestal (Velvet & Gold Dais)
  const royalPedestal = new THREE.Group();
  royalPedestal.position.set(0, 0, 1.85);
  const royalBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.1, 0.36, 20),
    new THREE.MeshStandardMaterial({
      color: 0x581c87,
      emissive: 0x3b0764,
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.5,
    })
  );
  royalBase.position.y = 0.18;
  royalPedestal.add(royalBase);

  const royalGoldRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.045, 12, 32),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.2,
    })
  );
  royalGoldRing.rotation.x = Math.PI / 2;
  royalGoldRing.position.y = 0.36;
  royalPedestal.add(royalGoldRing);
  root.add(royalPedestal);

  return { root, gantryHeads, printingWorkpieces };
}

export default function App() {
  const initialAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [shellState, setShellState] = useState<GameShellState>(
    initialAutostart ? 'playing' : 'title'
  );
  const [loadout, setLoadout] = useState<WeaponBuildLoadout>(PRESET_LOADOUTS[0]);
  const [upperPlatformId, setUpperPlatformId] = useState<string>('plat_20_texoma_pellet_pen');
  const [lowerPlatformId, setLowerPlatformId] = useState<string>('plat_20_texoma_pellet_pen');
  const [dischargeType, setDischargeType] = useState<DischargeMechanismType>(
    'SACRIFICIAL_BURST_DISK_3200PSI'
  );
  const [customCaliberMm, setCustomCaliberMm] = useState<number>(12.7);
  const [selectedHfModel, setSelectedHfModel] = useState<string>(
    'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD'
  );
  const [inventory, setInventory] = useState<SurvivorPrintInventory>(
    INITIAL_SURVIVOR_INVENTORY
  );
  const [savedVersions, setSavedVersions] = useState<SavedWeaponVersion[]>(() => [
    {
      versionId: 'ver_v1_pen_gun',
      versionTag: 'v1.0',
      customName: '#01 Starter: Mongo (.50 Cal 12.7mm Single-Shot Burst-Disk Pen Gun · SHELL-50-220B)',
      createdAtIso: '2026-10-31T06:00:00Z',
      upperPlatformId: 'plat_20_texoma_pellet_pen',
      lowerPlatformId: 'plat_20_texoma_pellet_pen',
      dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'PA12_CF_CARBON_NYLON',
      wallThicknessMm: 5.0,
      gyroidInfillPct: 75,
      regulatorSetpointBar: 220,
      computedMuzzleVelocityMs: 245,
      computedEnergyJoules: 165,
      hoopStressSafetyFactor: 2.85,
    },
    {
      versionId: 'ver_v2_evanix_rexp',
      versionTag: 'v2.0',
      customName: '#02 Starter: REX-P .30 Coaxial Single-Shot Pistol & Sniper Carbine (57-Part Blueprint)',
      createdAtIso: '2026-10-31T06:05:00Z',
      upperPlatformId: 'plat_22_fx_panthera',
      lowerPlatformId: 'plat_22_fx_panthera',
      dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'CNC_7075_HYBRID',
      wallThicknessMm: 3.2,
      gyroidInfillPct: 95,
      regulatorSetpointBar: 215,
      computedMuzzleVelocityMs: 268,
      computedEnergyJoules: 135,
      hoopStressSafetyFactor: 3.12,
    },
    {
      versionId: 'ver_v3_aea_defender',
      versionTag: 'v3.0',
      customName: '#03 Double Barrel Defender .50 Twin-Shell Break-Action (.50 Slug & 8-Pellet Buckshot · 2 Shells)',
      createdAtIso: '2026-10-31T06:10:00Z',
      upperPlatformId: 'plat_23_aea_megalodon',
      lowerPlatformId: 'plat_23_aea_megalodon',
      dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'PEEK_GF30_AEROSPACE',
      wallThicknessMm: 7.0,
      gyroidInfillPct: 85,
      regulatorSetpointBar: 220,
      computedMuzzleVelocityMs: 318,
      computedEnergyJoules: 285,
      hoopStressSafetyFactor: 2.95,
    },
    {
      versionId: 'ver_v4_edgun_leshiy',
      versionTag: 'v4.0',
      customName: '#04 Leshiy 2 (.30 Spec: 350mm · 756mm/457mm Quick-Detach Folded · 179cc [137cc+42cc Plenum] · 8-Rd Mag)',
      createdAtIso: '2026-10-31T06:20:00Z',
      upperPlatformId: 'plat_02_leshiy2',
      lowerPlatformId: 'plat_02_leshiy2',
      dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'CNC_7075_HYBRID',
      wallThicknessMm: 5.5,
      gyroidInfillPct: 85,
      regulatorSetpointBar: 130,
      computedMuzzleVelocityMs: 268,
      computedEnergyJoules: 112,
      hoopStressSafetyFactor: 2.85,
    },
    {
      versionId: 'ver_v4b_the_leaf_45',
      versionTag: 'v4.5',
      customName: '#05 The Leaf (.45 Cal Built on Leshiy 2 Open-Breech + 165cc Over-Barrel Air Reserve)',
      createdAtIso: '2026-10-31T06:25:00Z',
      upperPlatformId: 'plat_01_fx_drs',
      lowerPlatformId: 'plat_02_leshiy2',
      dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'CNC_7075_HYBRID',
      wallThicknessMm: 5.5,
      gyroidInfillPct: 90,
      regulatorSetpointBar: 195,
      computedMuzzleVelocityMs: 278,
      computedEnergyJoules: 248,
      hoopStressSafetyFactor: 2.94,
    },
    {
      versionId: 'ver_v5_evanix_mp30',
      versionTag: 'v5.0',
      customName: '#06 MP30 (.30 Cal Dual-Cylinder 300cc Tactical PCP SMG · 165B Reg · Quick-Detach Fold Stock)',
      createdAtIso: '2026-10-31T06:30:00Z',
      upperPlatformId: 'plat_15_evanix_mp30',
      lowerPlatformId: 'plat_15_evanix_mp30',
      dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'PA12_CF_CARBON_NYLON',
      wallThicknessMm: 5.0,
      gyroidInfillPct: 85,
      regulatorSetpointBar: 165,
      computedMuzzleVelocityMs: 282,
      computedEnergyJoules: 124,
      hoopStressSafetyFactor: 2.88,
    },
    {
      versionId: 'ver_v6_p50_p90_helical',
      versionTag: 'v6.0',
      customName: '#07 The P50 (.50 Cal Pressurized-Mag Breech-Interlock + Screw-Off Barrel Swap + Extended Refill Foregrip)',
      createdAtIso: '2026-10-31T06:35:00Z',
      upperPlatformId: 'plat_01_fx_drs',
      lowerPlatformId: 'plat_02_leshiy2',
      dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'CNC_7075_HYBRID',
      wallThicknessMm: 5.2,
      gyroidInfillPct: 90,
      regulatorSetpointBar: 200,
      computedMuzzleVelocityMs: 298,
      computedEnergyJoules: 318,
      hoopStressSafetyFactor: 2.88,
    },
    {
      versionId: 'ver_v7_ascent_45_300bar',
      versionTag: 'v7.0',
      customName: '#08 Custom .45 Ascent (140cc Over-Barrel 2+ Rd Plenum & M18×1 Silencer + 300B 3-Stage Pump)',
      createdAtIso: '2026-10-31T06:40:00Z',
      upperPlatformId: 'plat_03_aspen_pump',
      lowerPlatformId: 'plat_03_aspen_pump',
      dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'CNC_7075_HYBRID',
      wallThicknessMm: 5.4,
      gyroidInfillPct: 92,
      regulatorSetpointBar: 210,
      computedMuzzleVelocityMs: 294,
      computedEnergyJoules: 286.6,
      hoopStressSafetyFactor: 3.18,
    },
    {
      versionId: 'ver_v9_the_protector',
      versionTag: 'v9.0',
      customName: '#09 The Protector (.50 Cal Dual Threaded Barrel-Reserve Break-Action Scatter Gun · 2×110cc @ 250B)',
      createdAtIso: '2026-10-31T06:45:00Z',
      upperPlatformId: 'plat_23_aea_megalodon',
      lowerPlatformId: 'plat_23_aea_megalodon',
      dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'PEEK_GF30_AEROSPACE',
      wallThicknessMm: 6.4,
      gyroidInfillPct: 94,
      regulatorSetpointBar: 250,
      computedMuzzleVelocityMs: 312,
      computedEnergyJoules: 342,
      hoopStressSafetyFactor: 3.25,
    },
  ]);
  const [activeVersionId, setActiveVersionId] = useState<string>('ver_v1_pen_gun');
  const [weaponFamilyContext, setWeaponFamilyContext] = useState<Weapon3DFamilyContext>({
    familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
  });
  const [simResult, setSimResult] = useState(() =>
    runCachedPhysicsSimulation({
      upperPlatformId: 'plat_20_texoma_pellet_pen',
      lowerPlatformId: 'plat_20_texoma_pellet_pen',
      dischargeType: 'SACRIFICIAL_BURST_DISK_1800PSI',
      adapterPolymer: 'PA12_CF_CARBON_NYLON',
      wallThicknessMm: 5.0,
      gyroidInfillPct: 75,
      operatingPressureBar: 220,
      hfModelName: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD',
      customCaliberOverrideMm: 12.7,
    })
  );

  const [pneumaticState, setPneumaticState] = useState<FourZonePneumaticState>(() =>
    createInitialPneumaticState(PRESET_LOADOUTS[0])
  );
  const [arenaMap, setArenaMap] = useState<GeneratedArenaMap>(() =>
    generateRandomArena(2501, 1)
  );
  const [playerPos, setPlayerPos] = useState({
    x: arenaMap.playerSpawn.x,
    z: arenaMap.playerSpawn.z,
    yaw: arenaMap.playerSpawn.yaw,
  });
  const [playerHp, setPlayerHp] = useState(100);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [clearTimeSec, setClearTimeSec] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [muted, setMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Triple-Reservoir FX-Leshiy-Aspen Architecture Ready'
  );
  const [hitMarkerActive, setHitMarkerActive] = useState(false);
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [componentExplodeAmount, setComponentExplodeAmount] = useState(0);
  const [xrayGasMode, setXrayGasMode] = useState(false);
  const [elonVersionState, setElonVersionState] = useState<ElonAlgoVersionState>(() => {
    const todayYmd = new Date().toISOString().slice(0, 10);
    let storedYmd = '2026-10-31';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        storedYmd = window.localStorage.getItem('bar250_last_daily_cycle_ymd') || '2026-10-31';
      }
    } catch {
      // Ignore storage access errors in restricted frames
    }
    const base = createInitialElonAlgoVersionState(storedYmd);
    const { nextState, didAutoRunCycle } = ensureAtLeastOneCyclePerDay(base, todayYmd);
    if (didAutoRunCycle) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('bar250_last_daily_cycle_ymd', todayYmd);
        }
      } catch {
        // Ignore
      }
    }
    return nextState;
  });
  const [showHermesModal, setShowHermesModal] = useState(false);
  const [graphicsMode, setGraphicsMode] = useState<GameGraphicsVisualMode>('PHOTOREALISTIC_PBR_STUDIO');
  const [showCadReferencesModal, setShowCadReferencesModal] = useState(false);
  const [xrSessionMode, setXrSessionMode] = useState<XrSessionMode>('OFF');
  const [xrHardwareSupport, setXrHardwareSupport] =
    useState<XrHardwareSupportStatus>({
      webXrApiAvailable: false,
      immersiveVrSupported: false,
      immersiveArSupported: false,
      recommendedMode: 'SIMULATED_6DOF_SPATIAL',
      deviceSummary: 'Spatial 6DoF Simulator Ready',
    });

  useEffect(() => {
    let mounted = true;
    void probeWebXrHardwareSupport().then((status) => {
      if (mounted) setXrHardwareSupport(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Dungeon Crawler Carl (DCC) Aristocratic Diva Show-Cat Companion & Post-Round System AI State
  const [dccCompanionMemory, setDccCompanionMemory] =
    useState<DccCompanionPersistentMemory>(() => loadDccCompanionMemory());
  const [isCompanionThinking, setIsCompanionThinking] = useState(false);
  const [systemAiBroadcast, setSystemAiBroadcast] =
    useState<DccSystemAiPostRoundBroadcast | null>(null);

  const handleSendCompanionChat = useCallback(
    async (
      userPrompt?: string,
      triggerType:
        | 'AUTONOMOUS_FREE_WILL'
        | 'PLAYER_CHAT'
        | 'WEAPON_SWITCHED'
        | 'SWARM_WAVE_STARTED'
        | 'STL_PART_SYNTHESIZED' = 'PLAYER_CHAT'
    ) => {
      setIsCompanionThinking(true);
      try {
        const activeVer =
          savedVersions.find((v) => v.versionId === activeVersionId) || savedVersions[0];
        const res = await requestGenerativeCompanionBanter({
          triggerType,
          playerMessage: userPrompt,
          equippedWeaponTitle: activeVer.customName,
          caliberMm: customCaliberMm,
          waveNumber: wave,
          swarmKills: inventory.zombiesEliminated,
          currentMemory: dccCompanionMemory,
        });
        setDccCompanionMemory((prev: DccCompanionPersistentMemory) => {
          const nextHistory = [
            ...prev.chatHistory,
            ...(userPrompt
              ? [
                  {
                    id: `usr-${Date.now()}`,
                    senderTitle: 'Crawler Player',
                    message: userPrompt,
                    combatAction: 'Direct Comms to Princess Chonk-Beam',
                    timestampIso: new Date().toISOString(),
                    isPlayer: true,
                  },
                ]
              : []),
            res.entry,
          ].slice(-14);
          const nextFacts = Array.from(
            new Set([res.newLearnedFact, ...prev.learnedFacts])
          ).slice(0, 8);
          const updated: DccCompanionPersistentMemory = {
            ...prev,
            learnedFacts: nextFacts,
            chatHistory: nextHistory,
          };
          saveDccCompanionMemory(updated);
          return updated;
        });
      } finally {
        setIsCompanionThinking(false);
      }
    },
    [activeVersionId, customCaliberMm, dccCompanionMemory, inventory.zombiesEliminated, savedVersions, wave]
  );

  const handleCommandRoyalCourtAgent = useCallback(
    (agentId?: RoyalCourtAgentId, customDecree?: RoyalGuardEquipmentId) => {
      setDccCompanionMemory((prev: DccCompanionPersistentMemory) => {
        const res = commandRoyalCourtAgentWork(
          prev,
          agentId || 'ALL_ROYAL_COURT',
          customDecree
        );
        saveDccCompanionMemory(res.nextMemory);
        setStatusMessage(`👑 ${res.statusSummary}`);
        return res.nextMemory;
      });
    },
    []
  );

  // Autonomous Free-Will Companion Banter Timer (Chonk-Beam speaks on her own free will periodically)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isCompanionThinking && Math.random() < 0.65) {
        void handleSendCompanionChat(undefined, 'AUTONOMOUS_FREE_WILL');
      }
    }, 34000);
    return () => window.clearInterval(interval);
  }, [handleSendCompanionChat, isCompanionThinking]);

  const triggerPostRoundSystemAiBroadcast = useCallback(
    async (victoryFlag: boolean, finalScore: number, clearSec: number) => {
      const activeVer =
        savedVersions.find((v) => v.versionId === activeVersionId) || savedVersions[0];
      const broadcast = await requestPostRoundSystemAiBroadcast({
        waveNumber: wave,
        isVictory: victoryFlag,
        clearTimeSec: clearSec,
        score: finalScore,
        equippedWeaponTitle: activeVer.customName,
        caliberMm: customCaliberMm,
        companionBeamsFired: dccCompanionMemory.totalEyeBeamKills,
      });
      setSystemAiBroadcast(broadcast);
      setDccCompanionMemory((prev: DccCompanionPersistentMemory) => {
        const updated: DccCompanionPersistentMemory = {
          ...prev,
          level: prev.level + (victoryFlag ? 1 : 0),
        };
        saveDccCompanionMemory(updated);
        return updated;
      });
    },
    [activeVersionId, customCaliberMm, dccCompanionMemory.totalEyeBeamKills, savedVersions, wave]
  );

  const handleRunElonVersionUpgrade = useCallback(() => {
    setElonVersionState((prev) => {
      const next = executeElonAlgoAndAgentsVersionRun(prev);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(
            'bar250_last_daily_cycle_ymd',
            next.lastDailyCycleDateYmd
          );
        }
      } catch {
        // Ignore
      }
      setStatusMessage(
        `Daily /schedule + Elon Algo ${next.versionLabel}: 5 PR Trucks + 9 Agents (18/27 SMART Done · ±${next.subMmCadToleranceMm}mm)`
      );
      return next;
    });
  }, []);

  const handleResolveHitlWebhook = useCallback(
    (
      approvalId: string,
      decision: 'APPROVED_WEBHOOK_RECEIVED' | 'REJECTED_BY_HUMAN'
    ) => {
      setElonVersionState((prev) =>
        resolveHitlApprovalWebhook(prev, approvalId, decision)
      );
    },
    []
  );

  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Authoritative simulation ref so 60Hz loop never tears down or re-creates WebGL scene
  const simRef = useRef({
    shellState: initialAutostart ? ('playing' as GameShellState) : ('title' as GameShellState),
    loadout: PRESET_LOADOUTS[0],
    pneumatic: createInitialPneumaticState(PRESET_LOADOUTS[0]),
    customCaliberMm: 12.7,
    companionBeamPulseTimer: 0,
    companionAutonomousFireCooldown: 1.4,
    weaponFamilyContext: {
      familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
    } as Weapon3DFamilyContext,
    map: arenaMap,
    playerX: arenaMap.playerSpawn.x,
    playerY: 1.65,
    playerZ: arenaMap.playerSpawn.z,
    playerYaw: 0,
    playerPitch: 0,
    playerHp: 100,
    score: 0,
    bestScore: 0,
    wave: 1,
    clearTimeSec: 0,
    isVictory: false,
    explodedAmount: 0,
    componentExplodeAmount: 0,
    airOnlyStorageView: false,
    xrayGasMode: false,
    workbenchTurntableYaw: -1.52,
    workbenchTurntablePitch: 0.04,
    workbenchCameraPreset: 'FULL_SIDE_PROFILE' as string,
    workbenchSubComponentIdx: null as number | null,
    workbenchZoom: 1.65,
    workbenchPanX: 0,
    workbenchPanY: 0,
    workbenchDragMode: 'MOVE' as 'ORBIT' | 'MOVE' | 'ZOOM',
    workbenchAutoOrbit: false,
    workbenchCompressionStep: 2,
    rangePose: 'CENTER_INSPECT' as string,
    rangeZoom: 1.85,
    rangePanX: 0,
    rangePanY: 0,
    rangeAutoSpin: false,
    printerRoomFocusStation: 'PRINTER_01_POLYMER_SLS' as PrinterStationId,
    recoilImpulse: 0,
    cameraShakeTrauma: 0,
    hitstopTimer: 0,
    walkBobPhase: 0,
    rebuildWeaponMeshFlag: true,
    rebuildArenaMeshFlag: true,
    graphicsMode: 'PHOTOREALISTIC_PBR_STUDIO' as GameGraphicsVisualMode,
    xrSessionMode: 'OFF' as XrSessionMode,
    applyGraphicsMode: ((_mode: GameGraphicsVisualMode) => {}) as (mode: GameGraphicsVisualMode) => void,
    toggleWebXrSession: (() => {}) as (preferred?: XrSessionMode) => void,
    forceImmediateRender: (() => {}) as () => void,
  });

  const handleToggleWebXrMode = useCallback((preferred?: XrSessionMode) => {
    simRef.current.toggleWebXrSession(preferred);
  }, []);

  const handleSelectGraphicsMode = useCallback((nextMode: GameGraphicsVisualMode) => {
    setGraphicsMode(nextMode);
    simRef.current.graphicsMode = nextMode;
    simRef.current.applyGraphicsMode(nextMode);
    setStatusMessage(
      nextMode === 'MINESCRIPT_DOOM_RETRO'
        ? '👾 Switched Graphics Engine -> Minescript / Doom Retro Mode (Nearest-Neighbor Voxel Grid & Flat Facets)'
        : '✨ Switched Graphics Engine -> Photorealistic Studio PBR Mode (CNC Normal Maps, Clearcoat & Studio Reflections)'
    );
  }, []);

  // Sync body[data-state] for Ultra Mode verification & ensure Range starts cleanly assembled
  useEffect(() => {
    simRef.current.shellState = shellState;
    if (shellState === 'range') {
      simRef.current.explodedAmount = 0;
      simRef.current.componentExplodeAmount = 0;
      setExplodedAmount(0);
      setComponentExplodeAmount(0);
      simRef.current.forceImmediateRender();
    }
    if (typeof document !== 'undefined') {
      document.body.dataset.state =
        shellState === 'workbench' || shellState === 'range' ? 'title' : shellState;
      if (shellState !== 'playing') {
        document.exitPointerLock?.();
      }
    }
  }, [shellState]);

  // Re-run cached HuggingFace physics surrogate whenever hybrid pieces, caliber, or discharge architecture change
  useEffect(() => {
    const nextSim = runCachedPhysicsSimulation({
      upperPlatformId,
      lowerPlatformId,
      dischargeType,
      adapterPolymer: loadout.custom3dPart.polymerMaterial,
      wallThicknessMm: loadout.custom3dPart.wallThicknessMm,
      gyroidInfillPct: loadout.custom3dPart.gyroidInfillPct,
      operatingPressureBar: 230,
      hfModelName: selectedHfModel,
      customCaliberOverrideMm: customCaliberMm,
    });
    setSimResult(nextSim);
  }, [upperPlatformId, lowerPlatformId, dischargeType, loadout, selectedHfModel, customCaliberMm]);

  // Handlers
  const syncPneumaticToReact = useCallback((nextPneu: FourZonePneumaticState, msg?: string) => {
    simRef.current.pneumatic = nextPneu;
    setPneumaticState({ ...nextPneu });
    if (msg) setStatusMessage(msg);
  }, []);

  const handleUpdateLoadout = useCallback((nextLoadout: WeaponBuildLoadout) => {
    simRef.current.loadout = nextLoadout;
    simRef.current.rebuildWeaponMeshFlag = true;
    const freshPneu = createInitialPneumaticState(nextLoadout);
    simRef.current.pneumatic = freshPneu;
    simRef.current.forceImmediateRender();
    setLoadout(nextLoadout);
    setPneumaticState(freshPneu);
    setStatusMessage(`Configured: ${nextLoadout.name}`);
  }, []);

  const handleChangeWeaponFamilyContext = useCallback(
    (nextCtx: Weapon3DFamilyContext, customCalOverride?: number) => {
      const calToUse = customCalOverride ?? simRef.current.customCaliberMm;
      simRef.current.weaponFamilyContext = nextCtx;
      simRef.current.rebuildWeaponMeshFlag = true;
      setWeaponFamilyContext(nextCtx);

      // Sync upperPlatformId, lowerPlatformId & activeVersionId across the 7 canonical weapons
      if (nextCtx.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
        if (nextCtx.burstStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL') {
          setUpperPlatformId('plat_23_aea_megalodon');
          setLowerPlatformId('plat_23_aea_megalodon');
          setDischargeType('SACRIFICIAL_BURST_DISK_3200PSI');
          setActiveVersionId('ver_v3_aea_defender');
        } else if (nextCtx.burstStage === 'STAGE_4_CONCEALED_AIRGUN_CANE') {
          setUpperPlatformId('plat_21_aea_airgun_cane');
          setLowerPlatformId('plat_21_aea_airgun_cane');
          setDischargeType('SACRIFICIAL_BURST_DISK_1800PSI');
        } else {
          setUpperPlatformId('plat_20_texoma_pellet_pen');
          setLowerPlatformId('plat_20_texoma_pellet_pen');
          setDischargeType('SACRIFICIAL_BURST_DISK_1800PSI');
          setActiveVersionId('ver_v1_pen_gun');
        }
      } else if (nextCtx.familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
        setUpperPlatformId('plat_22_fx_panthera');
        setLowerPlatformId('plat_22_fx_panthera');
        setDischargeType('REGULATED_BALANCED_POPPET_VALVE');
        setActiveVersionId('ver_v2_evanix_rexp');
      } else if (nextCtx.familyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY') {
        setUpperPlatformId('plat_15_evanix_mp30');
        setLowerPlatformId('plat_15_evanix_mp30');
        setDischargeType('REGULATED_BALANCED_POPPET_VALVE');
        setActiveVersionId('ver_v5_evanix_mp30');
      } else if (nextCtx.familyId === 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY') {
        setUpperPlatformId('plat_01_fx_drs');
        setLowerPlatformId('plat_02_leshiy2');
        setDischargeType('REGULATED_HAMMERLESS_PLUG_VALVE');
        setActiveVersionId('ver_v4b_the_leaf_45');
      } else if (nextCtx.familyId === 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY') {
        setUpperPlatformId('plat_02_leshiy2');
        setLowerPlatformId('plat_02_leshiy2');
        setDischargeType('REGULATED_HAMMERLESS_PLUG_VALVE');
        setActiveVersionId('ver_v4_edgun_leshiy');
      } else if (nextCtx.familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
        setUpperPlatformId('plat_01_fx_drs');
        setLowerPlatformId('plat_02_leshiy2');
        setDischargeType('REGULATED_HAMMERLESS_PLUG_VALVE');
        setActiveVersionId('ver_v6_p50_p90_helical');
      } else if (nextCtx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
        setUpperPlatformId('plat_03_aspen_pump');
        setLowerPlatformId('plat_03_aspen_pump');
        setDischargeType('REGULATED_BALANCED_POPPET_VALVE');
        setActiveVersionId('ver_v7_ascent_45_300bar');
      } else if (nextCtx.familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY') {
        setUpperPlatformId('plat_23_aea_megalodon');
        setLowerPlatformId('plat_23_aea_megalodon');
        setDischargeType('REGULATED_BALANCED_POPPET_VALVE');
        setActiveVersionId('ver_v9_the_protector');
      }

      // Reset pan, focus isolation, & center weapon whenever switching weapons so state transitions cleanly
      simRef.current.workbenchPanX = 0;
      simRef.current.workbenchPanY = 0;
      simRef.current.workbenchTurntableYaw = -1.52;
      simRef.current.workbenchTurntablePitch = 0.04;
      simRef.current.workbenchSubComponentIdx = null;

      const magSpec = computeAccurateMagCapacityByWeaponAndCaliber(
        nextCtx.familyId,
        calToUse,
        nextCtx.burstStage
      );
      const isAscent45 = nextCtx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY';
      const nextPneu: FourZonePneumaticState = {
        ...simRef.current.pneumatic,
        magazineCapacity: magSpec.exactCapacity,
        magazineLoaded: magSpec.exactCapacity,
        rotaryIndexAngleDeg: 0,
        ...(isAscent45
          ? {
              maxReliefBar: 300,
              regulatorSetpointBar: 210,
              plenumVolumeCc: 140,
              otbVolumeCc: 240,
            }
          : {}),
      };
      simRef.current.pneumatic = nextPneu;
      simRef.current.forceImmediateRender();
      setPneumaticState(nextPneu);
      setStatusMessage(
        `Base Model: ${nextCtx.familyId.replace(/_/g, ' ')} — Ammo Capacity: ${magSpec.capacityDisplayBadge}`
      );
    },
    []
  );

  const handleChangeCustomCaliber = useCallback((calMm: number) => {
    simRef.current.customCaliberMm = calMm;
    simRef.current.rebuildWeaponMeshFlag = true;
    setCustomCaliberMm(calMm);

    const ctx = simRef.current.weaponFamilyContext;
    const magSpec = computeAccurateMagCapacityByWeaponAndCaliber(
      ctx.familyId,
      calMm,
      ctx.burstStage
    );
    const nextPneu: FourZonePneumaticState = {
      ...simRef.current.pneumatic,
      magazineCapacity: magSpec.exactCapacity,
      magazineLoaded: magSpec.exactCapacity,
      rotaryIndexAngleDeg: 0,
    };
    simRef.current.pneumatic = nextPneu;
    simRef.current.forceImmediateRender();
    setPneumaticState(nextPneu);

    setStatusMessage(
      `Re-Bored to ${calMm.toFixed(2)}mm (${magSpec.imperialCaliberLabel}) — Magazine: ${magSpec.capacityDisplayBadge}`
    );
  }, []);

  const handleSelectHybridPair = useCallback(
    (nextUpperId: string, nextLowerId: string) => {
      let upper =
        POPULAR_25_AIRGUNS.find((p) => p.id === nextUpperId) || POPULAR_25_AIRGUNS[0];
      let lower =
        POPULAR_25_AIRGUNS.find((p) => p.id === nextLowerId) || POPULAR_25_AIRGUNS[1];

      const upperFam = resolveActiveWeaponFamily({
        upperPlatformId: upper.id,
        lowerPlatformId: upper.id,
        dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
      });
      const lowerFam = resolveActiveWeaponFamily({
        upperPlatformId: lower.id,
        lowerPlatformId: lower.id,
        dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
      });
      const compat = evaluateWeaponFamilyCompatibility(upperFam, lowerFam);

      // Enforce Strict Compatibility Index: Burst-Disk Shotgun/Pen/Cane cannot mix with other weapons!
      if (!compat.compatible) {
        lower = upper;
      }

      setUpperPlatformId(upper.id);
      setLowerPlatformId(lower.id);

      const resolvedFam = resolveActiveWeaponFamily({
        upperPlatformId: upper.id,
        lowerPlatformId: lower.id,
        dischargeType:
          upperFam === 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
            ? 'SACRIFICIAL_BURST_DISK_1800PSI'
            : 'REGULATED_BALANCED_POPPET_VALVE',
      });

      const nextBurstStage =
        upper.id === 'plat_20_texoma_pellet_pen'
          ? 'STAGE_2_SIMPLE_RED_AIR_PEN'
          : upper.id === 'plat_21_aea_airgun_cane'
          ? 'STAGE_4_CONCEALED_AIRGUN_CANE'
          : 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL';

      const nextCtx: Weapon3DFamilyContext = {
        familyId: resolvedFam,
        burstStage: nextBurstStage,
        rexMode: simRef.current.weaponFamilyContext.rexMode,
      };
      simRef.current.weaponFamilyContext = nextCtx;
      setWeaponFamilyContext(nextCtx);

      setInventory((prev) => {
        const nextUnlocked = new Set(prev.unlockedPlatformIds);
        nextUnlocked.add(upper.id);
        nextUnlocked.add(lower.id);
        return {
          ...prev,
          unlockedPlatformIds: Array.from(nextUnlocked),
        };
      });

      const nextLoadout: WeaponBuildLoadout = {
        ...simRef.current.loadout,
        name: `${upper.name.split(' ')[0]} × ${lower.name.split(' ')[0]} Hybrid`,
        weaponClass: upper.weaponClass,
        otbShroudId:
          upper.id === 'plat_19_pneumatic_welrod'
            ? 'otb_welrod_12baffle_cutaway'
            : upper.id === 'plat_23_aea_megalodon'
            ? 'otb_aea_harpoon_twin_tubes'
            : upper.id === 'plat_21_aea_airgun_cane'
            ? 'otb_cane_6barrel_insert_kit'
            : simRef.current.loadout.otbShroudId,
        modularPlenumId:
          lower.id === 'plat_23_aea_megalodon' || upper.id === 'plat_23_aea_megalodon'
            ? 'plenum_aea_red_burst_cartridges'
            : simRef.current.loadout.modularPlenumId,
        handguardId:
          upper.id === 'plat_22_fx_panthera'
            ? 'handguard_evanix_rex_slotted'
            : upper.id === 'plat_15_evanix_mp30'
            ? 'handguard_evanix_mp30_chevron'
            : simRef.current.loadout.handguardId,
        buttstockTankId:
          lower.id === 'plat_22_fx_panthera'
            ? 'buttstock_evanix_rex_crosshatch'
            : lower.id === 'plat_20_texoma_pellet_pen'
            ? 'buttstock_texoma_red_pen_lslot'
            : simRef.current.loadout.buttstockTankId,
        rotaryMagId:
          upper.id === 'plat_22_fx_panthera'
            ? 'mag_rexp_breech_slide_11'
            : simRef.current.loadout.rotaryMagId,
        firingValveId:
          upper.id === 'plat_22_fx_panthera'
            ? 'valve_rexp_coaxial_poppet_32'
            : upper.id === 'plat_19_pneumatic_welrod'
            ? 'valve_welrod_knurled_bolt'
            : simRef.current.loadout.firingValveId,
        foregripBottleId:
          lower.id === 'plat_15_evanix_mp30' || upper.id === 'plat_15_evanix_mp30'
            ? 'foregrip_evanix_mp30_vertical_gauge'
            : simRef.current.loadout.foregripBottleId,
        custom3dPart: {
          ...simRef.current.loadout.custom3dPart,
          enabled: true,
          partName: `${upper.upperConnectorPort} -> ${lower.lowerConnectorPort} Bridge`,
          geometryType:
            upper.id === 'plat_19_pneumatic_welrod'
              ? 'INTEGRATED_BAFFLE_MODERATOR'
              : upper.id === 'plat_24_diy_sten_mk2'
              ? 'STEN_SIDE_FEED_RECEIVER'
              : 'BULLPUP_MANIFOLD_CHASSIS',
        },
      };

      const magSpec = computeAccurateMagCapacityByWeaponAndCaliber(
        nextCtx.familyId,
        simRef.current.customCaliberMm,
        nextCtx.burstStage
      );
      const nextPneu: FourZonePneumaticState = {
        ...simRef.current.pneumatic,
        magazineCapacity: magSpec.exactCapacity,
        magazineLoaded: magSpec.exactCapacity,
        rotaryIndexAngleDeg: 0,
      };
      simRef.current.pneumatic = nextPneu;
      setPneumaticState(nextPneu);

      simRef.current.loadout = nextLoadout;
      simRef.current.rebuildWeaponMeshFlag = true;
      simRef.current.forceImmediateRender();
      setLoadout(nextLoadout);
      setStatusMessage(
        !compat.compatible
          ? compat.engineeringExplanation
          : `Configured ${upper.name} — Capacity: ${magSpec.capacityDisplayBadge}`
      );
    },
    []
  );

  const handleSaveNewVersion = useCallback(
    (customLabel: string) => {
      const nextIndex = savedVersions.length + 1;
      const versionTag = `v${nextIndex}.0`;
      const newVer: SavedWeaponVersion = {
        versionId: `ver_${Date.now()}`,
        versionTag,
        customName: customLabel || `${upperPlatformId} × ${lowerPlatformId}`,
        createdAtIso: new Date().toISOString(),
        upperPlatformId,
        lowerPlatformId,
        dischargeType,
        bridgePortAdapterPrinted: true,
        adapterPolymer: loadout.custom3dPart.polymerMaterial,
        wallThicknessMm: loadout.custom3dPart.wallThicknessMm,
        gyroidInfillPct: loadout.custom3dPart.gyroidInfillPct,
        regulatorSetpointBar: pneumaticState.regulatorSetpointBar,
        computedMuzzleVelocityMs: simResult.predictedMuzzleVelocityMs,
        computedEnergyJoules: simResult.predictedEnergyJoules,
        hoopStressSafetyFactor: simResult.safetyFactor,
      };
      setSavedVersions((prev) => [...prev, newVer]);
      setActiveVersionId(newVer.versionId);
      setInventory((prev) => ({
        ...prev,
        pa12CfFilamentGrams: Math.max(0, prev.pa12CfFilamentGrams - 35),
      }));
      soundEngine.playCamLockToggle(true);
      setStatusMessage(
        `3D-Printed & Saved ${versionTag}: ${newVer.customName} (-35g PA12-CF Filament)`
      );
    },
    [
      dischargeType,
      loadout.custom3dPart.gyroidInfillPct,
      loadout.custom3dPart.polymerMaterial,
      loadout.custom3dPart.wallThicknessMm,
      lowerPlatformId,
      pneumaticState.regulatorSetpointBar,
      savedVersions.length,
      simResult.predictedEnergyJoules,
      simResult.predictedMuzzleVelocityMs,
      simResult.safetyFactor,
      upperPlatformId,
    ]
  );

  const handleLoadVersion = useCallback(
    (ver: SavedWeaponVersion) => {
      setActiveVersionId(ver.versionId);
      setUpperPlatformId(ver.upperPlatformId);
      setLowerPlatformId(ver.lowerPlatformId);
      setDischargeType(ver.dischargeType);
      handleSelectHybridPair(ver.upperPlatformId, ver.lowerPlatformId);

      if (ver.versionId === 'ver_v1_pen_gun') {
        handleChangeCustomCaliber(12.7);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
          },
          12.7
        );
      } else if (ver.versionId === 'ver_v2_evanix_rexp') {
        handleChangeCustomCaliber(7.62);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
          },
          7.62
        );
      } else if (ver.versionId === 'ver_v3_aea_defender') {
        handleChangeCustomCaliber(12.7);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
            burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
            rexMode: 'REX_P_PISTOL_1SHOT',
          },
          12.7
        );
      } else if (ver.versionId === 'ver_v4_edgun_leshiy') {
        handleChangeCustomCaliber(7.62);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
            leshiyFolded: false,
          },
          7.62
        );
      } else if (ver.versionId === 'ver_v4b_the_leaf_45') {
        handleChangeCustomCaliber(11.43);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
            leshiyFolded: false,
          },
          11.43
        );
      } else if (ver.versionId === 'ver_v5_evanix_mp30') {
        handleChangeCustomCaliber(7.62);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
            mp30StockFolded: false,
          },
          7.62
        );
      } else if (ver.versionId === 'ver_v6_p50_p90_helical') {
        handleChangeCustomCaliber(12.7);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
            p90AmmoType: 'SABOT_SLUG_45_BOATTAIL',
            p50Environment: 'SPACE_VACUUM_0BAR',
            p50CyclePhase: 0,
            p50AutoCycleLoop: true,
          },
          12.7
        );
      } else if (ver.versionId === 'ver_v7_ascent_45_300bar') {
        handleChangeCustomCaliber(11.43);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
          },
          11.43
        );
      } else if (ver.versionId === 'ver_v9_the_protector') {
        handleChangeCustomCaliber(12.7);
        handleChangeWeaponFamilyContext(
          {
            familyId: 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY',
            burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
            rexMode: 'REX_P_PISTOL_1SHOT',
            protectorCockPhase: 2,
            protectorFireSelector: 'DUAL_SALVO',
            protectorUpperReserveBar: 250,
            protectorLowerReserveBar: 250,
            protectorScatterActive: true,
          },
          12.7
        );
      }

      soundEngine.playCamLockToggle(true);
      setStatusMessage(`Loaded Build ${ver.versionTag}: ${ver.customName}`);
    },
    [handleChangeCustomCaliber, handleChangeWeaponFamilyContext, handleSelectHybridPair]
  );

  const handlePrintAdapterAndPart = useCallback(() => {
    setInventory((prev) => ({
      ...prev,
      pa12CfFilamentGrams: Math.max(0, prev.pa12CfFilamentGrams - 45),
      nbr90Oings: Math.max(0, prev.nbr90Oings - 2),
    }));
    soundEngine.playPumpStroke('PUSH');
    setStatusMessage(
      '3D-Printed Custom Connector Port Adapter & Seated Dual NBR90 O-Rings (-45g PA12-CF)'
    );
  }, []);

  const handleFireWeapon = useCallback(() => {
    const s = simRef.current;
    const stats = computeWeaponStats(s.loadout);
    const res = simulatePneumaticShot(s.pneumatic, {
      barrelLengthMm: stats.barrelLengthMm,
      caliberMm: stats.caliberMm,
      projectileMassGrains: stats.projectileMassGrains,
      pelletCount: stats.pelletCount,
    });

    if (!res.fired) {
      soundEngine.playCamLockToggle(false);
      if (res.reason) setStatusMessage(res.reason);
      return;
    }

    soundEngine.playPneumaticShot(
      s.pneumatic.plenumPressureBar,
      stats.acousticRatingDb,
      s.loadout.weaponClass === 'AIR_SHOTGUN'
    );
    s.recoilImpulse = s.loadout.weaponClass === 'AIR_SHOTGUN' ? 1.0 : 0.55;
    s.cameraShakeTrauma = Math.min(1, s.cameraShakeTrauma + 0.22);

    syncPneumaticToReact(
      res.nextState,
      `Fired ${stats.caliberMm}mm (${res.muzzleVelocityMs} m/s · ${res.muzzleEnergyJoules} J) — Plenum Recharged to ${Math.round(res.nextState.plenumPressureBar)} bar`
    );

    // Trigger projectile spawn in Three.js loop via custom event on window
    window.dispatchEvent(
      new CustomEvent('bar250-spawn-slug', {
        detail: {
          pelletCount: stats.pelletCount,
          velocityMs: res.muzzleVelocityMs,
          energyJoules: res.muzzleEnergyJoules,
        },
      })
    );
  }, [syncPneumaticToReact]);

  const handleReloadMagazine = useCallback(() => {
    const s = simRef.current;
    const next: FourZonePneumaticState = {
      ...s.pneumatic,
      magazineLoaded: s.pneumatic.magazineCapacity,
      rotaryIndexAngleDeg: 0,
    };
    soundEngine.playCamLockToggle(true);
    syncPneumaticToReact(
      next,
      `Indexed Fresh ${next.magazineCapacity}-Round Rotary Cartridge Magazine`
    );
  }, [syncPneumaticToReact]);

  const handleToggleForegripCamLock = useCallback(() => {
    const s = simRef.current;
    const nextPos =
      s.pneumatic.foregripCamPosition === 'SIDE_LOCKED_3_OCLOCK'
        ? 'BOTTOM_UNLOCKED_6_OCLOCK'
        : 'SIDE_LOCKED_3_OCLOCK';

    let nextState: FourZonePneumaticState = {
      ...s.pneumatic,
      foregripCamPosition: nextPos,
      pumpStrokePhase: 'READY_PULL',
    };

    if (nextPos === 'SIDE_LOCKED_3_OCLOCK') {
      // Aligning Coaxial High-Pressure Swivel at 3 o'clock immediately connects Foregrip tank to Priority Isolation Check Block
      nextState = equalizeAndRegulateZones(nextState);
    }

    soundEngine.playCamLockToggle(nextPos === 'SIDE_LOCKED_3_OCLOCK');
    syncPneumaticToReact(
      nextState,
      nextPos === 'SIDE_LOCKED_3_OCLOCK'
        ? 'Interrupted-Lug Cam Collar Locked at 3 O\'Clock — Coaxial Swivel Connected & Ready to Fire'
        : 'Foregrip Rotated to 6 O\'Clock — Carriage Unlocked for 3-Stage Pumping ([Q] Pull / [E] Push)'
    );
  }, [syncPneumaticToReact]);

  const handlePumpStroke = useCallback(
    (dir: 'PULL' | 'PUSH') => {
      const s = simRef.current;
      const res = simulatePumpStroke(s.pneumatic, dir);
      if (res.pumped) {
        soundEngine.playPumpStroke(dir);
      } else {
        soundEngine.playCamLockToggle(false);
      }
      syncPneumaticToReact(res.nextState, res.message);
    },
    [syncPneumaticToReact]
  );

  const handleCycleOneWayTarget = useCallback(() => {
    const s = simRef.current;
    const order: OneWayFillTarget[] = [
      'PLENUM_AND_OTB',
      'BUTTSTOCK_TANK',
      'FOREGRIP_BOTTLE',
    ];
    const nextTarget =
      order[(order.indexOf(s.pneumatic.oneWayFillTarget) + 1) % order.length];
    const next: FourZonePneumaticState = {
      ...s.pneumatic,
      oneWayFillTarget: nextTarget,
    };
    soundEngine.playCamLockToggle(true);
    syncPneumaticToReact(
      next,
      `Directional Shuttle Manifold Collar -> ${nextTarget.replace(/_/g, ' ')}`
    );
  }, [syncPneumaticToReact]);

  const handleBenchRefill250Bar = useCallback(() => {
    const s = simRef.current;
    const isAscent45 =
      s.weaponFamilyContext.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY';
    const targetMax = isAscent45 ? 300 : 250;
    const targetReg = isAscent45 ? 210 : s.pneumatic.regulatorSetpointBar;
    const next: FourZonePneumaticState = {
      ...s.pneumatic,
      maxReliefBar: targetMax,
      regulatorSetpointBar: targetReg,
      otbPressureBar: targetMax,
      buttstockPressureBar: targetMax,
      foregripPressureBar: targetMax,
      plenumPressureBar: targetReg,
      magazineLoaded: s.pneumatic.magazineCapacity,
      shotsSinceLubrication: 0,
    };
    soundEngine.playPumpStroke('PUSH');
    syncPneumaticToReact(
      next,
      `Foster Probe Quick-Fill Complete: All Reservoirs Topped to ${targetMax} Bar (Regulated Plenum: ${targetReg} Bar)`
    );
  }, [syncPneumaticToReact]);

  const handlePumpAscentTo300Bar = useCallback(
    (mode: 'SINGLE_3STAGE_STROKE' | 'FULL_300BAR_PUMP_UP' = 'SINGLE_3STAGE_STROKE') => {
      const s = simRef.current;
      const res = simulateAscentPumpStrokeTo300Bar(s.pneumatic, mode);
      soundEngine.playPumpStroke('PUSH');
      s.recoilImpulse = 0.38;
      // Animate the 3D pump linkage out and back
      s.pneumatic = { ...res.nextState, pumpStrokePhase: 'PULLED_REAR' };
      simRef.current.forceImmediateRender();
      setTimeout(() => {
        simRef.current.pneumatic = { ...res.nextState, pumpStrokePhase: 'READY_PULL' };
        simRef.current.forceImmediateRender();
      }, 220);
      syncPneumaticToReact(res.nextState, res.message);
    },
    [syncPneumaticToReact]
  );

  const handleStartOrRestartArena = useCallback(
    (nextWave: number = 1, customSeed?: number) => {
      const s = simRef.current;
      const seedToUse = customSeed ?? s.map.seed;
      const newMap = generateRandomArena(seedToUse, nextWave);
      s.map = newMap;
      s.playerX = newMap.playerSpawn.x;
      s.playerZ = newMap.playerSpawn.z;
      s.playerYaw = newMap.playerSpawn.yaw;
      s.playerPitch = 0;
      s.playerHp = 100;
      if (nextWave === 1) {
        s.score = 0;
        s.clearTimeSec = 0;
      }
      s.wave = nextWave;
      s.isVictory = false;
      s.rebuildArenaMeshFlag = true;
      s.rebuildWeaponMeshFlag = true;

      const freshPneu = createInitialPneumaticState(s.loadout);
      s.pneumatic = freshPneu;

      setArenaMap(newMap);
      setPlayerPos({ x: newMap.playerSpawn.x, z: newMap.playerSpawn.z, yaw: 0 });
      setPlayerHp(100);
      setScore(s.score);
      setWave(nextWave);
      setIsVictory(false);
      setPneumaticState(freshPneu);
      setShellState('playing');
      setStatusMessage(`Deployed to ${newMap.sectorName}`);

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    []
  );

  // ============================================================================
  // MAIN THREE.JS SCENE & GAME LOOP (MOUNTED ONCE)
  // ============================================================================
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    // 1. Software WebGL Detection (Three.js Skill Directive)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x0c1017);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x0c1017, 0.018);

    // 2. Studio Environment Map Reflection (Mandatory for Brushed Steel & Anodized Aluminum)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.08,
      180
    );
    scene.add(camera);

    // 3. Warm/Cool Color-Temperature Lighting Contrast
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x18181b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
    keyLight.position.set(22, 38, 18);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -40;
      keyLight.shadow.camera.right = 40;
      keyLight.shadow.camera.top = 40;
      keyLight.shadow.camera.bottom = -40;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-20, 14, -24);
    scene.add(rimLight);

    // 4. Procedural Tactical Floor Texture with Anisotropy & SRGBColorSpace
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#18181b';
    fCtx.fillRect(0, 0, 256, 256);
    fCtx.strokeStyle = '#27272a';
    fCtx.lineWidth = 3;
    fCtx.strokeRect(0, 0, 256, 256);
    fCtx.fillStyle = '#222226';
    fCtx.fillRect(16, 16, 224, 224);
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(36, 36);
    floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const floorGeo = new THREE.PlaneGeometry(160, 160);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTex,
      roughness: 0.8,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Arena Static & Dynamic Containers
    const arenaEnvironmentGroup = new THREE.Group();
    scene.add(arenaEnvironmentGroup);

    const enemiesGroup = new THREE.Group();
    scene.add(enemiesGroup);
    const enemyMeshMap = new Map<
      string,
      { group: THREE.Group; bodyMesh: THREE.Mesh; telegraphRing: THREE.Mesh }
    >();

    const pickupsGroup = new THREE.Group();
    scene.add(pickupsGroup);
    const pickupMeshMap = new Map<string, THREE.Group>();

    // First-person / Workbench Modular Airgun Rig
    const weaponRigContainer = new THREE.Group();
    camera.add(weaponRigContainer);
    let activeWeaponRefs: ModularWeapon3DRefs | null = null;

    // WebXR 6DoF Spatial Dual-Hand Controller Rig (Mounted to scene and tracked relative to camera)
    const webXrRigRefs = createWebXrControllerRig3D();
    scene.add(webXrRigRefs.rigRoot);

    // 3D Dungeon Crawler Carl Aristocratic Diva Show-Cat Companion ("HRH Princess Chonk-Beam III")
    const divaCatCompanionRefs: DccDivaCatCompanion3DRefs = createDccDivaShowCatCompanion3D();
    scene.add(divaCatCompanionRefs.root);

    // 3D Sealed Tri-Printer Fabrication Room Bay (Visible when shellState === 'printer_room')
    const triPrinterBayRefs = createTriPrinterRoom3DBay();
    triPrinterBayRefs.root.visible = false;
    scene.add(triPrinterBayRefs.root);

    // Pooled Slugs & Particles (InstancedMesh for Zero-GC)
    const MAX_SLUGS = 32;
    const slugPool: PooledSlugProjectile[] = Array.from({ length: MAX_SLUGS }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      damage: 45,
      life: 0,
    }));
    const slugInstanced = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
      MAX_SLUGS
    );
    slugInstanced.frustumCulled = false;
    scene.add(slugInstanced);

    const MAX_PARTICLES = 64;
    const particlePool: PooledParticle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.4,
      scale: 0.1,
    }));
    const particleInstanced = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      MAX_PARTICLES
    );
    particleInstanced.frustumCulled = false;
    scene.add(particleInstanced);

    const spawnBurstParticles = (x: number, y: number, z: number, count: number) => {
      let spawned = 0;
      for (const p of particlePool) {
        if (!p.active) {
          p.active = true;
          p.x = x;
          p.y = y;
          p.z = z;
          p.vx = (Math.random() - 0.5) * 8;
          p.vy = 1.5 + Math.random() * 5;
          p.vz = (Math.random() - 0.5) * 8;
          p.maxLife = 0.25 + Math.random() * 0.25;
          p.life = p.maxLife;
          p.scale = 0.6 + Math.random() * 0.8;
          spawned++;
          if (spawned >= count) break;
        }
      }
    };

    // Rebuild 3D Arena Geometry when seed/wave changes
    const rebuildArenaScene = () => {
      const map = simRef.current.map;
      arenaEnvironmentGroup.clear();
      enemiesGroup.clear();
      enemyMeshMap.clear();
      pickupsGroup.clear();
      pickupMeshMap.clear();

      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.72,
        metalness: 0.25,
      });
      const trimCapMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.4,
        metalness: 0.6,
      });
      const crateMat = new THREE.MeshStandardMaterial({
        color: 0x3f3f46,
        roughness: 0.55,
        metalness: 0.45,
      });

      for (let r = 0; r < map.gridSize; r++) {
        for (let c = 0; c < map.gridSize; c++) {
          const cell = map.cells[r][c];
          if (cell === 0) continue;
          const wx = (c - map.gridSize / 2 + 0.5) * map.tileSize;
          const wz = (r - map.gridSize / 2 + 0.5) * map.tileSize;

          if (cell === 3) {
            // Central 6-part High-Pressure Compressor Landmark Tower
            const tower = createCompressorLandmarkTower(wx, wz);
            arenaEnvironmentGroup.add(tower);
          } else if (
            r === 0 ||
            r === map.gridSize - 1 ||
            c === 0 ||
            c === map.gridSize - 1
          ) {
            // Natural Stepped Rock Outcrop + Industrial Containment Silo Perimeter (not a flat uniform indoor wall)
            const perimGroup = new THREE.Group();
            perimGroup.position.set(wx, 0, wz);
            const heightVar = 2.6 + ((r * 7 + c * 13) % 5) * 0.85;

            const rockBase = new THREE.Mesh(
              new THREE.DodecahedronGeometry(map.tileSize * 0.68, 0),
              wallMat
            );
            rockBase.scale.set(1.1, heightVar * 0.38, 1.1);
            rockBase.position.y = heightVar * 0.32;
            perimGroup.add(rockBase);

            if ((r + c) % 3 === 0) {
              const silo = new THREE.Mesh(
                new THREE.CylinderGeometry(1.1, 1.2, heightVar + 1.4, 10),
                crateMat
              );
              silo.position.y = (heightVar + 1.4) * 0.5;
              perimGroup.add(silo);

              const siloRing = new THREE.Mesh(
                new THREE.CylinderGeometry(1.18, 1.18, 0.24, 10),
                trimCapMat
              );
              siloRing.position.y = heightVar + 0.9;
              perimGroup.add(siloRing);
            }

            arenaEnvironmentGroup.add(perimGroup);
          } else if (cell === 1) {
            // Composite 3-part Tactical Bunker Pillar
            const pillarGroup = new THREE.Group();
            pillarGroup.position.set(wx, 0, wz);

            const baseGeo = new THREE.BoxGeometry(map.tileSize * 0.96, 0.4, map.tileSize * 0.96);
            const base = new THREE.Mesh(baseGeo, crateMat);
            base.position.y = 0.2;
            pillarGroup.add(base);

            const bodyGeo = new THREE.BoxGeometry(map.tileSize * 0.88, 3.6, map.tileSize * 0.88);
            const body = new THREE.Mesh(bodyGeo, wallMat);
            body.position.y = 2.0;
            pillarGroup.add(body);

            const capGeo = new THREE.BoxGeometry(map.tileSize * 0.92, 0.22, map.tileSize * 0.92);
            const cap = new THREE.Mesh(capGeo, trimCapMat);
            cap.position.y = 3.9;
            pillarGroup.add(cap);

            arenaEnvironmentGroup.add(pillarGroup);
          } else if (cell === 2) {
            // Composite 3-part Ballistic HPA Crate Cluster
            const crateGroup = new THREE.Group();
            crateGroup.position.set(wx, 0, wz);

            const mainBox = new THREE.Mesh(
              new THREE.BoxGeometry(2.2, 1.35, 2.2),
              crateMat
            );
            mainBox.position.y = 0.675;
            crateGroup.add(mainBox);

            const strap = new THREE.Mesh(
              new THREE.BoxGeometry(2.28, 0.18, 2.28),
              trimCapMat
            );
            strap.position.y = 1.1;
            crateGroup.add(strap);

            const sideBottle = new THREE.Mesh(
              new THREE.CylinderGeometry(0.28, 0.28, 1.2, 12),
              new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 })
            );
            sideBottle.position.set(1.25, 0.6, 0);
            crateGroup.add(sideBottle);

            arenaEnvironmentGroup.add(crateGroup);
          }
        }
      }

      // Create Enemy 3D Groups (with Ridiculous DCC Enemy Visuals)
      for (const enemy of map.enemies) {
        const built = createCompositeEnemyMesh(
          enemy.archetype,
          enemy.dccEnemyId,
          enemy.dccColorHex
        );
        built.group.position.set(enemy.x, 0, enemy.z);
        enemiesGroup.add(built.group);
        enemyMeshMap.set(enemy.id, built);
      }

      // Create Pickup 3D Groups
      for (const p of map.pickups) {
        const pGroup = new THREE.Group();
        pGroup.position.set(p.x, 0, p.z);

        const disc = new THREE.Mesh(
          new THREE.RingGeometry(0.45, 0.65, 18),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
        );
        disc.rotation.x = -Math.PI / 2;
        disc.position.y = 0.02;
        pGroup.add(disc);

        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 0.75, 14),
          new THREE.MeshStandardMaterial({
            color: p.type === 'HPA_SCUBA_BOTTLE' ? 0x38bdf8 : p.type === 'MED_INJECTOR' ? 0x10b981 : 0xf59e0b,
            roughness: 0.25,
            metalness: 0.75,
          })
        );
        bottle.position.y = 0.55;
        pGroup.add(bottle);

        const valveCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.14, 0.2, 10),
          new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.2, metalness: 0.9 })
        );
        valveCap.position.y = 1.0;
        pGroup.add(valveCap);

        pickupsGroup.add(pGroup);
        pickupMeshMap.set(p.id, pGroup);
      }
      applyGraphicsModeToSceneAndRenderer(scene, renderer, simRef.current.graphicsMode);
    };

    const rebuildWeaponViewmodel = () => {
      weaponRigContainer.clear();
      activeWeaponRefs = buildModularAirgunMesh(
        simRef.current.loadout,
        simRef.current.xrayGasMode,
        simRef.current.customCaliberMm,
        simRef.current.weaponFamilyContext
      );
      weaponRigContainer.add(activeWeaponRefs.root);
      applyGraphicsModeToSceneAndRenderer(scene, renderer, simRef.current.graphicsMode);
    };

    simRef.current.applyGraphicsMode = (mode: GameGraphicsVisualMode) => {
      simRef.current.graphicsMode = mode;
      applyGraphicsModeToSceneAndRenderer(scene, renderer, mode);
      renderer.render(scene, camera);
    };

    simRef.current.toggleWebXrSession = (preferred?: XrSessionMode) => {
      const current = simRef.current.xrSessionMode;
      const nextMode: XrSessionMode =
        preferred ||
        (current === 'OFF'
          ? 'SIMULATED_6DOF_SPATIAL'
          : current === 'SIMULATED_6DOF_SPATIAL'
          ? 'IMMERSIVE_AR_PASSTHROUGH'
          : 'OFF');

      simRef.current.xrSessionMode = nextMode;
      setXrSessionMode(nextMode);

      if (nextMode === 'IMMERSIVE_AR_PASSTHROUGH') {
        scene.background = new THREE.Color(0x05141c);
      } else {
        scene.background = skyColor;
      }

      // Attempt native WebXR session if requested & available on headset browser
      if (
        (nextMode === 'IMMERSIVE_VR_HEADSET' ||
          nextMode === 'IMMERSIVE_AR_PASSTHROUGH') &&
        typeof navigator !== 'undefined' &&
        'xr' in navigator &&
        navigator.xr
      ) {
        const xrApi = navigator.xr as {
          requestSession?: (mode: string) => Promise<unknown>;
        };
        const sessionType =
          nextMode === 'IMMERSIVE_AR_PASSTHROUGH' ? 'immersive-ar' : 'immersive-vr';
        xrApi
          .requestSession?.(sessionType)
          .then((session) => {
            (
              renderer.xr as unknown as {
                setSession?: (s: unknown) => Promise<void>;
              }
            ).setSession?.(session);
          })
          .catch(() => {
            // Keep 3D spatial 6DoF controller rig active on standard desktop displays
          });
      }

      setStatusMessage(
        nextMode === 'OFF'
          ? '🥽 WebXR Spatial Mode: OFF (Standard 3D Viewport)'
          : nextMode === 'IMMERSIVE_AR_PASSTHROUGH'
          ? '🥽 WebXR Passthrough AR Active — Dual 6DoF Spatial Controllers & Laser Ray Targeting Online'
          : '🥽 WebXR 6DoF Spatial Mode Active — Dual Articulated Hand Controllers, Laser Sightline & Spatial HUD Ring Online [Press X to cycle]'
      );
      simRef.current.forceImmediateRender();
    };

    simRef.current.forceImmediateRender = () => {
      const s = simRef.current;
      if (s.rebuildWeaponMeshFlag) {
        rebuildWeaponViewmodel();
        s.rebuildWeaponMeshFlag = false;
      }
      if (activeWeaponRefs) {
        updateModularAirgunKinematics(activeWeaponRefs, {
          explodedAmount:
            s.shellState === 'workbench' || s.shellState === 'range'
              ? s.explodedAmount
              : 0,
          componentExplodeAmount:
            s.shellState === 'workbench' || s.shellState === 'range'
              ? s.componentExplodeAmount
              : 0,
          airOnlyStorageView:
            s.shellState === 'range' ? s.airOnlyStorageView : false,
          airflowActive: s.shellState === 'range',
          foregripCamPosition: s.pneumatic.foregripCamPosition,
          pumpStrokeOffset: s.pneumatic.pumpStrokePhase === 'PULLED_REAR' ? 1 : 0,
          rotaryIndexAngleDeg: s.pneumatic.rotaryIndexAngleDeg,
          recoilImpulse: s.recoilImpulse,
          compressionStepIndex: s.workbenchCompressionStep,
          magazineLoaded: s.pneumatic.magazineLoaded,
          magazineCapacity: s.pneumatic.magazineCapacity,
          dt: 0.016,
        });
        apply3DFocusIsolationAndCentering(
          activeWeaponRefs,
          s.shellState === 'workbench' ? s.workbenchCameraPreset : 'FULL_SIDE_PROFILE',
          s.shellState === 'workbench' ? s.workbenchSubComponentIdx : null
        );
      }
      renderer.render(scene, camera);
    };

    // Input Tracking
    const keysPressed = new Set<string>();
    let pointerDown = false;

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const s = simRef.current;

      // STRICT RULE: When inside 'printer_room', the ONLY exit is back to 'title'
      if (s.shellState === 'printer_room') {
        if (code === 'Escape') {
          setShellState('title');
        }
        return;
      }

      if (s.shellState === 'title') {
        if (code === 'Enter' || code === 'Space') {
          e.preventDefault();
          handleStartOrRestartArena(1);
          return;
        }
        if (code === 'KeyB') {
          setShellState('workbench');
          return;
        }
        if (code === 'KeyT') {
          setShellState('range');
          return;
        }
        if (code === 'KeyP') {
          setShellState('printer_room');
          return;
        }
      }

      if (code === 'Escape' || code === 'KeyP') {
        if (s.shellState === 'playing') {
          setShellState('paused');
        } else if (s.shellState === 'paused') {
          setShellState('playing');
        }
        return;
      }

      if (code === 'KeyB' && (s.shellState === 'playing' || s.shellState === 'paused' || s.shellState === 'range')) {
        setShellState('workbench');
        return;
      }

      if (code === 'KeyT' && (s.shellState === 'playing' || s.shellState === 'paused' || s.shellState === 'workbench')) {
        setShellState('range');
        return;
      }

      if (code === 'KeyM') {
        soundEngine.muted = !soundEngine.muted;
        setMuted(soundEngine.muted);
        return;
      }

      if (code === 'KeyH') {
        setShowHermesModal((prev) => !prev);
        return;
      }

      if (code === 'KeyG') {
        const nextMode: GameGraphicsVisualMode =
          simRef.current.graphicsMode === 'MINESCRIPT_DOOM_RETRO'
            ? 'PHOTOREALISTIC_PBR_STUDIO'
            : 'MINESCRIPT_DOOM_RETRO';
        handleSelectGraphicsMode(nextMode);
        return;
      }

      if (code === 'KeyK') {
        setShowCadReferencesModal((prev) => !prev);
        return;
      }

      if (code === 'KeyX') {
        simRef.current.toggleWebXrSession();
        return;
      }

      if (!keysPressed.has(code)) {
        // Edge-triggered one-shot actions
        if (code === 'Space' && (s.shellState === 'playing' || s.shellState === 'range')) {
          e.preventDefault();
          handleFireWeapon();
        } else if (code === 'KeyF') {
          handleToggleForegripCamLock();
        } else if (code === 'KeyQ') {
          handlePumpStroke('PULL');
        } else if (code === 'KeyE') {
          handlePumpStroke('PUSH');
        } else if (code === 'KeyR') {
          handleReloadMagazine();
        } else if (code === 'KeyV') {
          handleCycleOneWayTarget();
        }
      } else if (s.shellState === 'workbench' || s.shellState === 'range') {
        if (code === 'KeyC' || code === 'Digit0') {
          s.workbenchPanX = 0;
          s.workbenchPanY = 0;
          s.workbenchTurntableYaw = -1.52;
          s.workbenchTurntablePitch = 0.04;
          s.workbenchZoom = 1.65;
          s.rangePanX = 0;
          s.rangePanY = 0;
          s.rangeZoom = 1.85;
          s.forceImmediateRender();
        }
      }

      keysPressed.add(code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
    };

    const onWindowBlur = () => {
      keysPressed.clear();
      pointerDown = false;
    };

    const raycaster = new THREE.Raycaster();
    const mouseNdc = new THREE.Vector2();

    const onContextMenu = (e: MouseEvent) => {
      if (e.target === renderer.domElement) {
        e.preventDefault();
      }
    };

    const onDblClick = (e: MouseEvent) => {
      if (e.target !== renderer.domElement) return;
      const s = simRef.current;
      if (s.shellState === 'workbench' || s.shellState === 'range') {
        s.workbenchPanX = 0;
        s.workbenchPanY = 0;
        s.workbenchTurntableYaw = -1.52;
        s.workbenchTurntablePitch = 0.04;
        s.workbenchZoom = 1.65;
        s.rangePanX = 0;
        s.rangePanY = 0;
        s.rangeZoom = 1.85;
        s.forceImmediateRender();
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.target !== renderer.domElement) return;
      pointerDown = true;
      const s = simRef.current;
      if (s.shellState === 'playing') {
        if (document.pointerLockElement !== renderer.domElement) {
          renderer.domElement.requestPointerLock?.();
        }
        handleFireWeapon();
      } else if (s.shellState === 'range' && e.button === 0 && !e.shiftKey) {
        handleFireWeapon();
      } else if (s.shellState === 'workbench' && activeWeaponRefs && e.button === 0 && !e.shiftKey) {
        // Raycast for interactive 3D objects (Ascent 300B Hand Pump + Clicking any 3D Part to inspect & task an agent!)
        const rect = renderer.domElement.getBoundingClientRect();
        mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseNdc, camera);
        const pumpHits = raycaster.intersectObject(activeWeaponRefs.pumpLinkageGroup, true);
        if (pumpHits.length > 0 && activeWeaponRefs.pumpLinkageGroup.visible) {
          handlePumpAscentTo300Bar('SINGLE_3STAGE_STROKE');
        }
        const allHits = raycaster.intersectObject(activeWeaponRefs.root, true);
        const visibleHit = allHits.find((h) => {
          let curr: THREE.Object3D | null = h.object;
          while (curr) {
            if (!curr.visible) return false;
            curr = curr.parent;
          }
          return true;
        });
        if (visibleHit) {
          let curr: THREE.Object3D | null = visibleHit.object;
          let subAssemblyTitle = '';
          let subAssemblyId = '';
          let groupKey = 'FULL_SIDE_PROFILE';
          const groupEntries: Array<[string, THREE.Group]> = [
            ['FOCUS_SILENCER', activeWeaponRefs.otbShroudGroup],
            ['FOCUS_BARREL_COVER', activeWeaponRefs.handguardGroup],
            ['FOCUS_BREECH', activeWeaponRefs.rotaryMagGroup],
            ['FOCUS_POPPET', activeWeaponRefs.plenumGroup],
            ['FOCUS_FOREGRIP', activeWeaponRefs.pumpLinkageGroup],
            ['FOCUS_GRIP', activeWeaponRefs.foregripCamGroup],
            ['FOCUS_STOCK', activeWeaponRefs.buttstockGroup],
            ['FOCUS_RECEIVER', activeWeaponRefs.manifoldCoreGroup],
          ];
          while (curr && curr !== activeWeaponRefs.root) {
            if (!subAssemblyTitle && curr.userData?.subAssemblyTitle) {
              subAssemblyTitle = String(curr.userData.subAssemblyTitle);
            }
            if (!subAssemblyId && curr.userData?.subAssemblyId) {
              subAssemblyId = String(curr.userData.subAssemblyId);
            }
            for (const [presetKey, grp] of groupEntries) {
              if (curr === grp) {
                groupKey = presetKey;
              }
            }
            curr = curr.parent;
          }
          window.dispatchEvent(
            new CustomEvent('bar250-3d-part-clicked', {
              detail: {
                groupKey,
                subAssemblyId,
                subAssemblyTitle,
              },
            })
          );
        }
      }
    };

    const onMouseUp = () => {
      pointerDown = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      const s = simRef.current;
      if (s.shellState === 'playing') {
        if (document.pointerLockElement === renderer.domElement || pointerDown) {
          s.playerYaw -= e.movementX * 0.0026;
          s.playerPitch = THREE.MathUtils.clamp(
            s.playerPitch - e.movementY * 0.0022,
            -0.65,
            0.65
          );
        }
      } else if (s.shellState === 'workbench' && pointerDown) {
        const isPanModifier = e.shiftKey || (e.buttons & 2) !== 0 || (e.buttons & 4) !== 0;
        if (s.workbenchDragMode === 'MOVE' || isPanModifier) {
          s.workbenchPanX = THREE.MathUtils.clamp(
            s.workbenchPanX + e.movementX * 0.0015,
            -0.65,
            0.65
          );
          s.workbenchPanY = THREE.MathUtils.clamp(
            s.workbenchPanY - e.movementY * 0.0015,
            -0.45,
            0.45
          );
        } else if (s.workbenchDragMode === 'ZOOM') {
          s.workbenchZoom = THREE.MathUtils.clamp(
            s.workbenchZoom - e.movementY * 0.008,
            0.75,
            3.6
          );
          s.workbenchPanX = THREE.MathUtils.clamp(
            s.workbenchPanX + e.movementX * 0.0014,
            -0.65,
            0.65
          );
        } else {
          s.workbenchTurntableYaw += e.movementX * 0.008;
          s.workbenchTurntablePitch = THREE.MathUtils.clamp(
            s.workbenchTurntablePitch + e.movementY * 0.006,
            -0.6,
            0.75
          );
        }
      } else if (s.shellState === 'range' && pointerDown) {
        const isPanModifier = e.shiftKey || (e.buttons & 2) !== 0;
        if (isPanModifier) {
          s.rangePanX = THREE.MathUtils.clamp(s.rangePanX + e.movementX * 0.0015, -0.55, 0.55);
          s.rangePanY = THREE.MathUtils.clamp(s.rangePanY - e.movementY * 0.0015, -0.4, 0.4);
        } else {
          s.workbenchTurntableYaw += e.movementX * 0.008;
          s.workbenchTurntablePitch = THREE.MathUtils.clamp(
            s.workbenchTurntablePitch + e.movementY * 0.006,
            -0.6,
            0.75
          );
        }
      }
    };

    const onSpawnSlugEvent = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          pelletCount: number;
          velocityMs: number;
          energyJoules: number;
        }>
      ).detail;
      const s = simRef.current;
      if (s.shellState !== 'playing' && s.shellState !== 'range') return;

      camera.getWorldPosition(_rayOrigin);
      camera.getWorldDirection(_rayDir);

      const count = detail.pelletCount || 1;
      const perPelletDamage =
        count > 1
          ? Math.max(18, Math.round(detail.energyJoules * 0.32))
          : Math.max(42, Math.round(detail.energyJoules * 0.72));

      for (let i = 0; i < count; i++) {
        const spread = count > 1 ? 0.048 : 0.003;
        const dirX = _rayDir.x + (Math.random() - 0.5) * spread;
        const dirY = _rayDir.y + (Math.random() - 0.5) * spread;
        const dirZ = _rayDir.z + (Math.random() - 0.5) * spread;
        const len = Math.hypot(dirX, dirY, dirZ) || 1;

        const slot = slugPool.find((sl) => !sl.active);
        if (slot) {
          slot.active = true;
          slot.x = _rayOrigin.x + (dirX / len) * 0.6;
          slot.y = _rayOrigin.y - 0.08 + (dirY / len) * 0.6;
          slot.z = _rayOrigin.z + (dirZ / len) * 0.6;
          const speed = Math.min(82, Math.max(42, detail.velocityMs * 0.25));
          slot.vx = (dirX / len) * speed;
          slot.vy = (dirY / len) * speed;
          slot.vz = (dirZ / len) * speed;
          slot.damage = perPelletDamage;
          slot.life = 1.6;
        }
      }
    };

    const onWorkbenchCameraEvent = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          preset?: string;
          subComponentIdx?: number | null;
          zoom?: number;
          nudgeZoom?: number;
          panX?: number;
          panY?: number;
          nudgePanX?: number;
          nudgePanY?: number;
          dragMode?: 'ORBIT' | 'MOVE' | 'ZOOM';
          resetToCenter?: boolean;
          autoOrbit?: boolean;
          compressionStep?: number;
        }>
      ).detail;
      const s = simRef.current;
      if (!detail) return;
      if (detail.resetToCenter) {
        s.workbenchCameraPreset = 'FULL_SIDE_PROFILE';
        s.workbenchSubComponentIdx = null;
        s.workbenchPanX = 0;
        s.workbenchPanY = 0;
        s.workbenchZoom = 1.65;
        s.workbenchTurntableYaw = -1.52;
        s.workbenchTurntablePitch = 0.04;
      }
      if (typeof detail.preset === 'string') {
        const changedPreset = s.workbenchCameraPreset !== detail.preset;
        s.workbenchCameraPreset = detail.preset;
        if (changedPreset) {
          s.workbenchSubComponentIdx = null;
          s.workbenchPanX = 0;
          s.workbenchPanY = 0;
          s.workbenchTurntableYaw = -1.52;
          s.workbenchTurntablePitch = 0.04;
        }
      }
      if (detail.subComponentIdx !== undefined) {
        s.workbenchSubComponentIdx = detail.subComponentIdx;
      }
      if (typeof detail.zoom === 'number') {
        s.workbenchZoom = THREE.MathUtils.clamp(detail.zoom, 0.75, 3.6);
      }
      if (typeof detail.nudgeZoom === 'number') {
        s.workbenchZoom = THREE.MathUtils.clamp(s.workbenchZoom + detail.nudgeZoom, 0.75, 3.6);
      }
      if (typeof detail.panX === 'number') {
        s.workbenchPanX = THREE.MathUtils.clamp(detail.panX, -0.65, 0.65);
      }
      if (typeof detail.panY === 'number') {
        s.workbenchPanY = THREE.MathUtils.clamp(detail.panY, -0.45, 0.45);
      }
      if (typeof detail.nudgePanX === 'number') {
        s.workbenchPanX = THREE.MathUtils.clamp(s.workbenchPanX + detail.nudgePanX, -0.65, 0.65);
      }
      if (typeof detail.nudgePanY === 'number') {
        s.workbenchPanY = THREE.MathUtils.clamp(s.workbenchPanY + detail.nudgePanY, -0.45, 0.45);
      }
      if (typeof detail.dragMode === 'string') {
        s.workbenchDragMode = detail.dragMode;
      }
      if (typeof detail.autoOrbit === 'boolean') {
        s.workbenchAutoOrbit = detail.autoOrbit;
      }
      if (typeof detail.compressionStep === 'number') {
        s.workbenchCompressionStep = detail.compressionStep;
      }
      s.forceImmediateRender();
    };

    const onRangeManipulateEvent = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          pose?: string;
          zoom?: number;
          panX?: number;
          panY?: number;
          autoSpin?: boolean;
          resetRotation?: boolean;
        }>
      ).detail;
      const s = simRef.current;
      if (!detail) return;
      if (typeof detail.pose === 'string') {
        s.rangePose = detail.pose;
      }
      if (typeof detail.zoom === 'number') {
        s.rangeZoom = THREE.MathUtils.clamp(detail.zoom, 0.9, 3.4);
      }
      if (typeof detail.panX === 'number') {
        s.rangePanX = detail.panX;
      }
      if (typeof detail.panY === 'number') {
        s.rangePanY = detail.panY;
      }
      if (typeof detail.autoSpin === 'boolean') {
        s.rangeAutoSpin = detail.autoSpin;
      }
      if (detail.resetRotation) {
        s.workbenchTurntableYaw = -1.52;
        s.workbenchTurntablePitch = 0.04;
      }
      s.forceImmediateRender();
    };

    const onPrinterRoomFocusEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ printerId?: PrinterStationId }>).detail;
      if (detail && detail.printerId) {
        simRef.current.printerRoomFocusStation = detail.printerId;
        simRef.current.forceImmediateRender();
      }
    };

    const onWheel = (e: WheelEvent) => {
      const s = simRef.current;
      if (
        (s.shellState === 'workbench' || s.shellState === 'range') &&
        e.target === renderer.domElement
      ) {
        e.preventDefault();
        if (s.shellState === 'range') {
          s.rangeZoom = THREE.MathUtils.clamp(
            s.rangeZoom - e.deltaY * 0.0015,
            0.9,
            3.4
          );
        } else {
          s.workbenchZoom = THREE.MathUtils.clamp(
            s.workbenchZoom - e.deltaY * 0.0015,
            0.75,
            3.6
          );
        }
      }
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('dblclick', onDblClick);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('bar250-spawn-slug', onSpawnSlugEvent);
    const onExportLive3dStlEvent = (e: Event) => {
      if (!activeWeaponRefs) return;
      const detail = (
        e as CustomEvent<{
          scope?: 'FULL_WEAPON' | 'ISOLATED_FOCUS_GROUP';
          solidName?: string;
          fileName?: string;
        }>
      ).detail;
      const s = simRef.current;
      let targetObj: THREE.Object3D = activeWeaponRefs.root;
      if (detail?.scope === 'ISOLATED_FOCUS_GROUP' && s.workbenchCameraPreset !== 'FULL_SIDE_PROFILE') {
        const mapPresetToGroup: Record<string, THREE.Group> = {
          FOCUS_SILENCER: activeWeaponRefs.otbShroudGroup,
          FOCUS_BARREL_COVER: activeWeaponRefs.handguardGroup,
          FOCUS_RECEIVER: activeWeaponRefs.manifoldCoreGroup,
          FOCUS_BREECH: activeWeaponRefs.rotaryMagGroup,
          FOCUS_MAG: activeWeaponRefs.rotaryMagGroup,
          FOCUS_POPPET: activeWeaponRefs.plenumGroup,
          FOCUS_PLENUM: activeWeaponRefs.plenumGroup,
          FOCUS_FOREGRIP: activeWeaponRefs.pumpLinkageGroup,
          FOCUS_GRIP: activeWeaponRefs.foregripCamGroup,
          FOCUS_STOCK: activeWeaponRefs.buttstockGroup,
        };
        targetObj = mapPresetToGroup[s.workbenchCameraPreset] || activeWeaponRefs.root;
      }
      const solidName = detail?.solidName || 'BAR250_LIVE_3D_OBJECT';
      const exported = exportThreeObjectToWatertightStl(targetObj, solidName);
      if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
        const blob = new Blob([exported.stlAscii], { type: 'model/stl' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = detail?.fileName || exported.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setStatusMessage(
        `Exported Live 3D Object to Watertight .STL (${exported.fileName} · ${exported.triangleCount} Triangles)`
      );
    };

    const onMountCustomStlEvent = (e: Event) => {
      if (!activeWeaponRefs) return;
      const detail = (
        e as CustomEvent<{
          positionsFloat32: Float32Array;
          partTitle: string;
          colorHex?: number;
        }>
      ).detail;
      if (!detail || !detail.positionsFloat32) return;
      mountCustomStlBufferGeometryOnWeapon(
        activeWeaponRefs,
        detail.positionsFloat32,
        detail.partTitle
      );
      simRef.current.forceImmediateRender();
      setStatusMessage(
        `Mounted Custom 3D .STL Mesh onto Live Weapon Rig: ${detail.partTitle}`
      );
    };

    const onComponentExplodeEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ componentExplodeAmount?: number }>).detail;
      if (detail && typeof detail.componentExplodeAmount === 'number') {
        simRef.current.componentExplodeAmount = THREE.MathUtils.clamp(
          detail.componentExplodeAmount,
          0,
          1
        );
        setComponentExplodeAmount(simRef.current.componentExplodeAmount);
        simRef.current.forceImmediateRender();
      }
    };

    const onAirOnlyStorageViewEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ airOnlyStorageView?: boolean }>).detail;
      if (detail && typeof detail.airOnlyStorageView === 'boolean') {
        simRef.current.airOnlyStorageView = detail.airOnlyStorageView;
        simRef.current.forceImmediateRender();
      }
    };

    const onToggleWebXrEvent = () => {
      simRef.current.toggleWebXrSession();
    };

    window.addEventListener('bar250-workbench-camera', onWorkbenchCameraEvent);
    window.addEventListener('bar250-range-manipulate', onRangeManipulateEvent);
    window.addEventListener('bar250-printer-room-focus', onPrinterRoomFocusEvent);
    window.addEventListener('bar250-export-live-3d-stl', onExportLive3dStlEvent);
    window.addEventListener('bar250-mount-custom-stl', onMountCustomStlEvent);
    window.addEventListener('bar250-component-explode', onComponentExplodeEvent);
    window.addEventListener('bar250-air-only-storage-view', onAirOnlyStorageViewEvent);
    window.addEventListener('bar250-toggle-webxr', onToggleWebXrEvent);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    // Pre-build initial meshes
    rebuildArenaScene();
    rebuildWeaponViewmodel();
    simRef.current.rebuildArenaMeshFlag = false;
    simRef.current.rebuildWeaponMeshFlag = false;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Software-WebGL Paced Loop Helper (`afterDraw`)
    let frameId = 0;
    let unmounted = false;
    const clock = new THREE.Clock();
    let hudSyncAccumulator = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (unmounted) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();
      const s = simRef.current;

      if (s.rebuildArenaMeshFlag) {
        rebuildArenaScene();
        s.rebuildArenaMeshFlag = false;
      }
      if (s.rebuildWeaponMeshFlag) {
        rebuildWeaponViewmodel();
        s.rebuildWeaponMeshFlag = false;
      }

      // Decay recoil and camera trauma
      s.recoilImpulse = THREE.MathUtils.damp(s.recoilImpulse, 0, 14, dt);
      s.cameraShakeTrauma = Math.max(0, s.cameraShakeTrauma - dt * 1.8);

      // Update Modular 3D Weapon Kinematics (Cam Collar 3 vs 6 o'clock, Pump Stroke, Rotary Mag, Weapon & Component Exploded View)
      if (activeWeaponRefs) {
        updateModularAirgunKinematics(activeWeaponRefs, {
          explodedAmount:
            s.shellState === 'workbench' || s.shellState === 'range'
              ? s.explodedAmount
              : 0,
          componentExplodeAmount:
            s.shellState === 'workbench' || s.shellState === 'range'
              ? s.componentExplodeAmount
              : 0,
          airOnlyStorageView:
            s.shellState === 'range' ? s.airOnlyStorageView : false,
          airflowActive: s.shellState === 'range',
          foregripCamPosition: s.pneumatic.foregripCamPosition,
          pumpStrokeOffset: s.pneumatic.pumpStrokePhase === 'PULLED_REAR' ? 1 : 0,
          rotaryIndexAngleDeg: s.pneumatic.rotaryIndexAngleDeg,
          recoilImpulse: s.recoilImpulse,
          compressionStepIndex: s.workbenchCompressionStep,
          magazineLoaded: s.pneumatic.magazineLoaded,
          magazineCapacity: s.pneumatic.magazineCapacity,
          dt,
        });
        apply3DFocusIsolationAndCentering(
          activeWeaponRefs,
          s.shellState === 'workbench' ? s.workbenchCameraPreset : 'FULL_SIDE_PROFILE',
          s.shellState === 'workbench' ? s.workbenchSubComponentIdx : null
        );
      }

      // Hide arena clutter & uninitialized pool meshes during Gunsmith Workbench or 3-Printer Room inspection
      const isWorkbenchStudio = s.shellState === 'workbench';
      const isPrinterRoom = s.shellState === 'printer_room';
      const hideArenaWorld = isWorkbenchStudio || isPrinterRoom;
      arenaEnvironmentGroup.visible = !hideArenaWorld;
      enemiesGroup.visible = !hideArenaWorld;
      pickupsGroup.visible = !hideArenaWorld;
      floorMesh.visible = !isWorkbenchStudio;
      slugInstanced.visible = !hideArenaWorld;
      particleInstanced.visible = !hideArenaWorld;
      divaCatCompanionRefs.root.visible = !hideArenaWorld;
      triPrinterBayRefs.root.visible = isPrinterRoom;
      weaponRigContainer.visible = !isPrinterRoom;

      // ======================================================================
      // STATE A: TITLE SCREEN (Live World Camera Tour + Hero Weapon Showcase)
      // ======================================================================
      if (s.shellState === 'title') {
        const orbitRadius = 18;
        const angle = elapsed * 0.22;
        camera.position.set(
          s.map.landmarkPos.x + Math.sin(angle) * orbitRadius,
          6.2,
          s.map.landmarkPos.z + Math.cos(angle) * orbitRadius
        );
        camera.lookAt(s.map.landmarkPos.x, 3.2, s.map.landmarkPos.z);
        divaCatCompanionRefs.root.position.set(
          s.map.landmarkPos.x + 2.2,
          2.1 + Math.sin(elapsed * 2.8) * 0.12,
          s.map.landmarkPos.z + 2.2
        );
        divaCatCompanionRefs.root.rotation.y = elapsed * 0.6;

        // Stage the 3D Hero Weapon in the right two-thirds negative space
        weaponRigContainer.position.set(0.32, -0.06, -1.18);
        weaponRigContainer.rotation.set(
          0.14 + Math.sin(elapsed * 1.1) * 0.04,
          -0.65 + Math.cos(elapsed * 0.7) * 0.22,
          0
        );
      }
      // ======================================================================
      // STATE B: GUNSMITH WORKBENCH (Centered 3D Focus Studio — Zero Off-Screen Drift!)
      // ======================================================================
      else if (s.shellState === 'workbench') {
        camera.position.set(0, 2.2, 5.0);
        camera.lookAt(0, 2.2, 0);

        // When any FOCUS_* part isolation is active, apply3DFocusIsolationAndCentering already centers the part at [0,0,0],
        // so keep panX = 0 and bring the camera closer (-0.54m) for sub-component inspection!
        const isIsolatedPartFocus =
          s.workbenchCameraPreset && s.workbenchCameraPreset !== 'FULL_SIDE_PROFILE';
        const panX = 0.0;
        const panY = -0.02;
        const baseDist = isIsolatedPartFocus ? -0.54 : -0.82;

        const zoomScale = THREE.MathUtils.clamp(s.workbenchZoom / 1.65, 0.48, 1.95);
        const targetZ = THREE.MathUtils.clamp(baseDist / zoomScale, -1.45, -0.38);

        weaponRigContainer.position.set(
          panX + s.workbenchPanX,
          panY + s.workbenchPanY,
          targetZ
        );
        if (s.workbenchAutoOrbit) {
          s.workbenchTurntableYaw += dt * 0.18;
        }
        weaponRigContainer.rotation.set(
          s.workbenchTurntablePitch,
          s.workbenchTurntableYaw,
          0
        );
      }
      // ======================================================================
      // STATE B2: VIRTUAL PHYSICS RANGE (Center Inspect, Pan, Zoom, Rotate & Fire)
      // ======================================================================
      else if (s.shellState === 'range') {
        camera.position.set(s.map.playerSpawn.x, 2.2, s.map.playerSpawn.z);
        camera.lookAt(s.map.landmarkPos.x, 1.8, s.map.landmarkPos.z);

        let baseX = 0.0;
        let baseY = 0.08;
        let baseZ = -0.82;
        if (s.rangePose === 'SHOULDER_AIM') {
          baseX = 0.22;
          baseY = -0.14;
          baseZ = -0.62;
        } else if (s.rangePose === 'MACRO_BREECH') {
          baseX = 0.06;
          baseY = 0.12;
          baseZ = -0.54;
        } else if (s.rangePose === 'OVER_BARREL') {
          baseX = -0.24;
          baseY = 0.12;
          baseZ = -0.58;
        }

        const zoomScale = THREE.MathUtils.clamp(s.rangeZoom / 1.85, 0.55, 1.85);
        const targetZ = THREE.MathUtils.clamp(baseZ / zoomScale, -1.4, -0.35);

        weaponRigContainer.position.set(
          baseX + s.rangePanX,
          baseY + s.rangePanY,
          targetZ + s.recoilImpulse * 0.09
        );

        if (s.rangeAutoSpin) {
          s.workbenchTurntableYaw += dt * 0.24;
        }

        if (s.rangePose === 'SHOULDER_AIM') {
          weaponRigContainer.rotation.set(
            s.recoilImpulse * 0.14,
            0.04,
            0
          );
        } else {
          weaponRigContainer.rotation.set(
            s.workbenchTurntablePitch + s.recoilImpulse * 0.08,
            s.workbenchTurntableYaw,
            0
          );
        }
      }
      // ======================================================================
      // STATE B3: 3-PRINTER FABRICATION ROOM (3 Animated Industrial Printers)
      // ======================================================================
      else if (s.shellState === 'printer_room') {
        const targetX =
          s.printerRoomFocusStation === 'PRINTER_01_POLYMER_SLS'
            ? -1.6
            : s.printerRoomFocusStation === 'PRINTER_03_ORDNANCE_SYNTH'
            ? 1.6
            : 0;
        camera.position.set(targetX, 2.35, 5.2);
        camera.lookAt(targetX * 0.65, 1.55, 0);

        for (let idx = 0; idx < triPrinterBayRefs.gantryHeads.length; idx++) {
          const head = triPrinterBayRefs.gantryHeads[idx];
          const work = triPrinterBayRefs.printingWorkpieces[idx];
          head.position.x = Math.sin(elapsed * 2.6 + idx * 1.4) * 0.42;
          head.position.z = Math.cos(elapsed * 3.1 + idx * 1.1) * 0.32;
          head.position.y = 1.95 + Math.sin(elapsed * 1.8 + idx) * 0.12;
          work.rotation.y = elapsed * (0.8 + idx * 0.25);
        }
      }
      // ======================================================================
      // STATE C: PLAYING IN ARENA (First-Person Doom-Paced Zombie Survival)
      // ======================================================================
      else if (s.shellState === 'playing') {
        s.clearTimeSec += dt;

        // Keyboard turning (ArrowLeft / ArrowRight)
        if (keysPressed.has('ArrowLeft')) s.playerYaw += 2.1 * dt;
        if (keysPressed.has('ArrowRight')) s.playerYaw -= 2.1 * dt;

        // WASD / ArrowUp-Down Movement
        let moveForward = 0;
        let moveRight = 0;
        if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) moveForward += 1;
        if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) moveForward -= 1;
        if (keysPressed.has('KeyD')) moveRight += 1;
        if (keysPressed.has('KeyA')) moveRight -= 1;

        const moveLen = Math.hypot(moveForward, moveRight);
        const stats = computeWeaponStats(s.loadout);
        const speed = 7.4 + (stats.ergonomicsScore - 50) * 0.035;

        if (moveLen > 0.01) {
          const nf = moveForward / moveLen;
          const nr = moveRight / moveLen;
          _forward.set(-Math.sin(s.playerYaw), 0, -Math.cos(s.playerYaw));
          _right.set(Math.cos(s.playerYaw), 0, -Math.sin(s.playerYaw));

          const dx = (_forward.x * nf + _right.x * nr) * speed * dt;
          const dz = (_forward.z * nf + _right.z * nr) * speed * dt;

          if (!collidesWithArenaWalls(s.map, s.playerX + dx, s.playerZ, 0.48)) {
            s.playerX += dx;
          }
          if (!collidesWithArenaWalls(s.map, s.playerX, s.playerZ + dz, 0.48)) {
            s.playerZ += dz;
          }
          s.walkBobPhase += dt * speed * 1.45;
        }

        const shake = s.cameraShakeTrauma * s.cameraShakeTrauma * 0.04;
        camera.position.set(
          s.playerX + (Math.random() - 0.5) * shake,
          s.playerY + Math.sin(s.walkBobPhase) * 0.045,
          s.playerZ + (Math.random() - 0.5) * shake
        );
        camera.rotation.order = 'YXZ';
        camera.rotation.y = s.playerYaw;
        camera.rotation.x = s.playerPitch + s.recoilImpulse * 0.08;
        camera.rotation.z = 0;

        // Position First-Person Modular Airgun Viewmodel
        weaponRigContainer.position.set(
          0.26 + Math.cos(s.walkBobPhase * 0.5) * 0.01,
          -0.21 + Math.abs(Math.sin(s.walkBobPhase)) * 0.012,
          -0.48 + s.recoilImpulse * 0.09
        );
        weaponRigContainer.rotation.set(s.recoilImpulse * 0.14, 0.04, 0);

        // Step Projectiles & Check Enemy Hits
        for (let i = 0; i < MAX_SLUGS; i++) {
          const sl = slugPool[i];
          if (!sl.active) {
            _dummyObj.position.set(0, -50, 0);
            _dummyObj.scale.setScalar(0.001);
            _dummyObj.updateMatrix();
            slugInstanced.setMatrixAt(i, _dummyObj.matrix);
            continue;
          }

          sl.life -= dt;
          // Gravity ballistic drop
          sl.vy -= 4.2 * dt;
          sl.x += sl.vx * dt;
          sl.y += sl.vy * dt;
          sl.z += sl.vz * dt;

          if (sl.life <= 0 || sl.y <= 0.05 || collidesWithArenaWalls(s.map, sl.x, sl.z, 0.08)) {
            sl.active = false;
            spawnBurstParticles(sl.x, Math.max(0.1, sl.y), sl.z, 4);
            continue;
          }

          // Check hit against active enemies
          for (const enemy of s.map.enemies) {
            if (enemy.hp <= 0) continue;
            const dXZ = Math.hypot(sl.x - enemy.x, sl.z - enemy.z);
            if (dXZ < enemy.radius + 0.38 && sl.y > 0.1 && sl.y < 2.2) {
              enemy.hp = Math.max(0, enemy.hp - sl.damage);
              enemy.hitFlashTimer = 0.08;
              sl.active = false;

              const isKill = enemy.hp <= 0;
              s.hitstopTimer = isKill ? 0.065 : s.customCaliberMm >= 11.4 ? 0.042 : 0.028;
              s.cameraShakeTrauma = Math.min(
                1,
                s.cameraShakeTrauma + (isKill ? 0.32 : 0.14)
              );
              soundEngine.playHitConfirm(isKill);
              spawnBurstParticles(sl.x, sl.y, sl.z, isKill ? 16 : 6);
              s.score += isKill ? 150 : 25;
              s.bestScore = Math.max(s.bestScore, s.score);
              setHitMarkerActive(true);
              window.setTimeout(() => setHitMarkerActive(false), 110);

              if (isKill) {
                const isHeavyBreacher = enemy.archetype === 'HEAVY_BREACHER_MECH';
                const isKiterDrone = enemy.archetype === 'KITER_SNIPER_DRONE';
                setInventory((prev) => ({
                  ...prev,
                  pa12CfFilamentGrams: prev.pa12CfFilamentGrams + 22,
                  peekAerospaceGrams:
                    prev.peekAerospaceGrams + (isKiterDrone ? 18 : 6),
                  tpu95aSealFilamentGrams: prev.tpu95aSealFilamentGrams + 12,
                  billet7075DustGrams:
                    prev.billet7075DustGrams + (isHeavyBreacher ? 35 : 14),
                  chromoly4140Cores:
                    prev.chromoly4140Cores + (isHeavyBreacher ? 1 : 0),
                  titaniumBellevilleSprings:
                    prev.titaniumBellevilleSprings + (isKiterDrone ? 1 : 0),
                  burstDiskFoils: prev.burstDiskFoils + 1,
                  nbr90Oings: prev.nbr90Oings + 1,
                  zombiesEliminated: prev.zombiesEliminated + 1,
                }));
                setStatusMessage(
                  isHeavyBreacher
                    ? 'Breacher Mech Down! Collected +35g DMLS Sinter Powder, +1× 4140 Chromoly Core & +22g PA12-CF!'
                    : isKiterDrone
                    ? 'Kiter Drone Down! Collected +18g PEEK-GF30, +1× Ti Belleville Spring & +12g TPU-95A!'
                    : 'Swarmer Down! Collected +22g PA12-CF, +14g Sinter Powder, +12g TPU-95A & +1 Burst Foil!'
                );
              }
              break;
            }
          }

          _dummyObj.position.set(sl.x, sl.y, sl.z);
          _dummyObj.scale.setScalar(1);
          _dummyObj.updateMatrix();
          slugInstanced.setMatrixAt(i, _dummyObj.matrix);
        }
        slugInstanced.instanceMatrix.needsUpdate = true;

        // Step Pickups (Scavenging Filament, Burst Disks & Blueprints)
        for (const p of s.map.pickups) {
          const pMesh = pickupMeshMap.get(p.id);
          if (p.collected) {
            if (pMesh) pMesh.visible = false;
            continue;
          }
          if (pMesh) {
            pMesh.rotation.y += dt * 1.8;
          }
          if (Math.hypot(s.playerX - p.x, s.playerZ - p.z) < 1.65) {
            p.collected = true;
            soundEngine.playCamLockToggle(true);
            if (p.type === 'HPA_SCUBA_BOTTLE') {
              handleBenchRefill250Bar();
              setInventory((prev) => ({
                ...prev,
                pa12CfFilamentGrams: prev.pa12CfFilamentGrams + 65,
                tpu95aSealFilamentGrams: prev.tpu95aSealFilamentGrams + 25,
              }));
              setStatusMessage(
                'Scavenged 300-Bar Scuba Bottle + 65g PA12-CF + 25g TPU-95A Spool for Printer #01!'
              );
            } else if (p.type === 'SLUG_TIN_AMMO') {
              handleReloadMagazine();
              setInventory((prev) => ({
                ...prev,
                burstDiskFoils: prev.burstDiskFoils + 4,
                billet7075DustGrams: prev.billet7075DustGrams + 45,
              }));
              setStatusMessage(
                'Scavenged Ordnance Tin: +45g DMLS Sinter Powder & +4x CuNi Burst Foils for Printers #02/#03!'
              );
            } else if (p.type === 'SILICONE_LUBE_KIT') {
              s.pneumatic.shotsSinceLubrication = 0;
              setInventory((prev) => {
                const locked = POPULAR_25_AIRGUNS.filter(
                  (g) => !prev.unlockedPlatformIds.includes(g.id)
                );
                const newlyUnlocked =
                  locked.length > 0
                    ? [...prev.unlockedPlatformIds, locked[0].id]
                    : prev.unlockedPlatformIds;
                return {
                  ...prev,
                  peekAerospaceGrams: prev.peekAerospaceGrams + 40,
                  tpu95aSealFilamentGrams: prev.tpu95aSealFilamentGrams + 35,
                  nbr90Oings: prev.nbr90Oings + 4,
                  titaniumBellevilleSprings: prev.titaniumBellevilleSprings + 1,
                  unlockedPlatformIds: newlyUnlocked,
                };
              });
              setStatusMessage(
                'Recovered Blueprint + 40g PEEK-GF30 + 35g TPU-95A + 4× Viton O-Rings + 1× Ti Belleville Spring!'
              );
            } else if (p.type === 'MED_INJECTOR') {
              s.playerHp = Math.min(100, s.playerHp + 35);
              setPlayerHp(s.playerHp);
              setStatusMessage('Survivor Trauma Adrenaline Injector (+35 HP)');
            }
          }
        }

        // Update 3D Diva Show-Cat Companion ("HRH Princess Chonk-Beam III") Hovering & Autonomous Eye-Beams
        divaCatCompanionRefs.root.visible = true;
        const catWorldX = s.playerX + Math.cos(s.playerYaw) * -0.75 - Math.sin(s.playerYaw) * 1.35;
        const catWorldZ = s.playerZ - Math.sin(s.playerYaw) * -0.75 - Math.cos(s.playerYaw) * 1.35;
        divaCatCompanionRefs.root.position.set(
          catWorldX,
          1.32 + Math.sin(elapsed * 3.2) * 0.08,
          catWorldZ
        );
        divaCatCompanionRefs.tailMesh.rotation.z = Math.sin(elapsed * 5.5) * 0.35;

        s.companionAutonomousFireCooldown -= dt;
        s.companionBeamPulseTimer = Math.max(0, s.companionBeamPulseTimer - dt);

        // Find nearest live Evil Swarm enemy within 22m for Princess Chonk-Beam's autonomous ocular eye-beams
        let nearestSwarmEnemy: (typeof s.map.enemies)[0] | null = null;
        let nearestSwarmDist = 22.0;
        for (const en of s.map.enemies) {
          if (en.hp <= 0) continue;
          const dist = Math.hypot(en.x - catWorldX, en.z - catWorldZ);
          if (dist < nearestSwarmDist) {
            nearestSwarmDist = dist;
            nearestSwarmEnemy = en;
          }
        }

        if (nearestSwarmEnemy) {
          const targetYaw = Math.atan2(
            nearestSwarmEnemy.x - catWorldX,
            nearestSwarmEnemy.z - catWorldZ
          );
          divaCatCompanionRefs.root.rotation.y = targetYaw;

          if (s.companionAutonomousFireCooldown <= 0) {
            s.companionAutonomousFireCooldown = 2.15;
            s.companionBeamPulseTimer = 0.28;
            nearestSwarmEnemy.hp = Math.max(0, nearestSwarmEnemy.hp - 48);
            nearestSwarmEnemy.hitFlashTimer = 0.12;
            spawnBurstParticles(nearestSwarmEnemy.x, 0.9, nearestSwarmEnemy.z, 10);

            if (nearestSwarmEnemy.hp <= 0) {
              soundEngine.playHitConfirm(true);
              s.score += 175;
              s.bestScore = Math.max(s.bestScore, s.score);
              setDccCompanionMemory((prev: DccCompanionPersistentMemory) => {
                const updated: DccCompanionPersistentMemory = {
                  ...prev,
                  totalEyeBeamKills: prev.totalEyeBeamKills + 1,
                };
                saveDccCompanionMemory(updated);
                return updated;
              });
              setStatusMessage(
                '👑 Princess Chonk-Beam vaporized a Feral Swarm Enemy with Twin Ocular Magic-Missile Eye-Beams! (+175 Score)'
              );
            }
          }
        } else {
          divaCatCompanionRefs.root.rotation.y = s.playerYaw + Math.PI;
        }

        const showEyeBeams = s.companionBeamPulseTimer > 0;
        divaCatCompanionRefs.leftLaserBeam.visible = showEyeBeams;
        divaCatCompanionRefs.rightLaserBeam.visible = showEyeBeams;

        // Step Enemies (with 30-80ms simulation hitstop freeze on heavy slug/scatter impacts)
        s.hitstopTimer = Math.max(0, s.hitstopTimer - dt);
        const enemySimDt = s.hitstopTimer > 0 ? dt * 0.08 : dt;
        const stepOut = stepArenaEnemies(
          s.map.enemies,
          s.map,
          { x: s.playerX, z: s.playerZ },
          enemySimDt
        );

        if (stepOut.telegraphTriggeredCount > 0) {
          soundEngine.playTelegraphAlert();
        }

        if (stepOut.playerDamageTaken > 0) {
          s.playerHp = Math.max(0, s.playerHp - stepOut.playerDamageTaken);
          s.cameraShakeTrauma = Math.min(1, s.cameraShakeTrauma + 0.45);
          setPlayerHp(s.playerHp);

          if (s.playerHp <= 0) {
            s.isVictory = false;
            setIsVictory(false);
            setScore(s.score);
            setBestScore(s.bestScore);
            setClearTimeSec(s.clearTimeSec);
            setShellState('gameover');
            void triggerPostRoundSystemAiBroadcast(false, s.score, s.clearTimeSec);
          }
        }

        if (stepOut.activeWaveComplete && s.playerHp > 0) {
          s.isVictory = true;
          s.score += 500;
          s.bestScore = Math.max(s.bestScore, s.score);
          setIsVictory(true);
          setScore(s.score);
          setBestScore(s.bestScore);
          setClearTimeSec(s.clearTimeSec);
          setShellState('gameover');
          void triggerPostRoundSystemAiBroadcast(true, s.score, s.clearTimeSec);
        }

        // Sync Enemy 3D Meshes
        for (const enemy of s.map.enemies) {
          const entry = enemyMeshMap.get(enemy.id);
          if (!entry) continue;
          entry.group.position.set(enemy.x, 0, enemy.z);
          entry.group.rotation.y = enemy.yaw;
          entry.telegraphRing.visible = enemy.state === 'WINDUP_TELEGRAPH';
          if (enemy.state === 'KO_TOPPLE') {
            entry.group.rotation.x = -enemy.koProgress * (Math.PI / 2);
            entry.group.visible = enemy.koProgress < 1;
          } else {
            entry.group.rotation.x = 0;
            entry.group.visible = true;
          }
          const mat = entry.bodyMesh.material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(enemy.hitFlashTimer > 0 ? 0xffffff : 0x000000);
          mat.emissiveIntensity = enemy.hitFlashTimer > 0 ? 0.9 : 0;
        }

        // Throttled HUD Sync (<= 10Hz)
        hudSyncAccumulator += dt;
        if (hudSyncAccumulator >= 0.12) {
          hudSyncAccumulator = 0;
          setPlayerPos({ x: s.playerX, z: s.playerZ, yaw: s.playerYaw });
          setScore(s.score);
          setBestScore(s.bestScore);
          setClearTimeSec(s.clearTimeSec);
        }
      }

      // Step Pooled Particles
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const pt = particlePool[i];
        if (!pt.active) {
          _dummyObj.position.set(0, -50, 0);
          _dummyObj.scale.setScalar(0.001);
          _dummyObj.updateMatrix();
          particleInstanced.setMatrixAt(i, _dummyObj.matrix);
          continue;
        }
        pt.life -= dt;
        if (pt.life <= 0) {
          pt.active = false;
          continue;
        }
        pt.vy -= 9.8 * dt;
        pt.x += pt.vx * dt;
        pt.y = Math.max(0.05, pt.y + pt.vy * dt);
        pt.z += pt.vz * dt;
        _dummyObj.position.set(pt.x, pt.y, pt.z);
        _dummyObj.scale.setScalar((pt.life / pt.maxLife) * pt.scale);
        _dummyObj.updateMatrix();
        particleInstanced.setMatrixAt(i, _dummyObj.matrix);
      }
      particleInstanced.instanceMatrix.needsUpdate = true;

      // Update WebXR 6DoF Spatial Dual-Hand Controllers & Telemetry Ring
      updateWebXrRigKinematics(webXrRigRefs, camera, {
        xrMode: s.xrSessionMode,
        elapsedSec: elapsed,
        recoilImpulse: s.recoilImpulse,
        pointerNdcX: (s.workbenchPanX || 0) * 0.5,
        pointerNdcY: (s.workbenchPanY || 0) * 0.5,
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      unmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('bar250-spawn-slug', onSpawnSlugEvent);
      window.removeEventListener('bar250-workbench-camera', onWorkbenchCameraEvent);
      window.removeEventListener('bar250-range-manipulate', onRangeManipulateEvent);
      window.removeEventListener('bar250-printer-room-focus', onPrinterRoomFocusEvent);
      window.removeEventListener('bar250-export-live-3d-stl', onExportLive3dStlEvent);
      window.removeEventListener('bar250-mount-custom-stl', onMountCustomStlEvent);
      window.removeEventListener('bar250-component-explode', onComponentExplodeEvent);
      window.removeEventListener('bar250-air-only-storage-view', onAirOnlyStorageViewEvent);
      window.removeEventListener('bar250-toggle-webxr', onToggleWebXrEvent);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [
    handleBenchRefill250Bar,
    handleCycleOneWayTarget,
    handleFireWeapon,
    handlePumpAscentTo300Bar,
    handlePumpStroke,
    handleReloadMagazine,
    handleSelectGraphicsMode,
    handleStartOrRestartArena,
    handleToggleForegripCamLock,
    triggerPostRoundSystemAiBroadcast,
  ]);

  const activeVersionObj =
    savedVersions.find((v) => v.versionId === activeVersionId) || savedVersions[0];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none">
      {/* Dedicated Isolated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        data-testid="webgl-viewport"
        className="fixed inset-0 w-full h-full z-0"
      />

      {/* Gunsmith Workbench Screen */}
      {shellState === 'workbench' && (
        <GunsmithWorkbench
          loadout={loadout}
          pneumaticState={pneumaticState}
          explodedAmount={explodedAmount}
          componentExplodeAmount={componentExplodeAmount}
          xrayGasMode={xrayGasMode}
          statusBanner={statusMessage}
          upperPlatformId={upperPlatformId}
          lowerPlatformId={lowerPlatformId}
          dischargeType={dischargeType}
          customCaliberMm={customCaliberMm}
          weaponFamilyContext={weaponFamilyContext}
          onChangeWeaponFamilyContext={handleChangeWeaponFamilyContext}
          savedVersions={savedVersions}
          activeVersionId={activeVersionId}
          inventory={inventory}
          simResult={simResult}
          selectedHfModel={selectedHfModel}
          onChangeHybridPlatforms={handleSelectHybridPair}
          onChangeDischargeType={setDischargeType}
          onChangeCustomCaliber={handleChangeCustomCaliber}
          onSaveNewVersion={handleSaveNewVersion}
          onSelectSavedVersion={handleLoadVersion}
          onChangeHfModel={setSelectedHfModel}
          onPrintAdapterAndPart={handlePrintAdapterAndPart}
          onOpenPhysicsRange={() => setShellState('range')}
          onUpdateLoadout={handleUpdateLoadout}
          onSetExploded={(val) => {
            simRef.current.explodedAmount = val;
            simRef.current.forceImmediateRender();
            setExplodedAmount(val);
          }}
          onSetComponentExploded={(val) => {
            simRef.current.componentExplodeAmount = val;
            simRef.current.forceImmediateRender();
            setComponentExplodeAmount(val);
          }}
          onToggleXray={() => {
            const next = !simRef.current.xrayGasMode;
            simRef.current.xrayGasMode = next;
            simRef.current.rebuildWeaponMeshFlag = true;
            simRef.current.forceImmediateRender();
            setXrayGasMode(next);
          }}
          onBenchFire={handleFireWeapon}
          onBenchToggleCamLock={handleToggleForegripCamLock}
          onBenchPumpStroke={handlePumpStroke}
          onBenchRefill250Bar={handleBenchRefill250Bar}
          onPumpAscentTo300Bar={handlePumpAscentTo300Bar}
          onDeployToArena={() => handleStartOrRestartArena(wave)}
          onBackToTitle={() => setShellState('title')}
          elonVersionState={elonVersionState}
          onRunElonVersionUpgrade={handleRunElonVersionUpgrade}
          onOpenHermesModal={() => setShowHermesModal(true)}
          onResolveHitlWebhook={handleResolveHitlWebhook}
        />
      )}

      {/* Virtual Physics Range Screen (Exclusive Air Physics, Container-to-Moderator Gas Expansion & .25–.72 DCC Enemy Ballistics) */}
      {shellState === 'range' && (
        <VirtualPhysicsRange
          activeVersion={activeVersionObj}
          savedVersions={savedVersions}
          pneumaticState={pneumaticState}
          simResult={simResult}
          inventory={inventory}
          customCaliberMm={customCaliberMm}
          explodedAmount={explodedAmount}
          componentExplodeAmount={componentExplodeAmount}
          xrayGasMode={xrayGasMode}
          onSetExploded={(val) => {
            simRef.current.explodedAmount = val;
            simRef.current.forceImmediateRender();
            setExplodedAmount(val);
          }}
          onSetComponentExploded={(val) => {
            simRef.current.componentExplodeAmount = val;
            simRef.current.forceImmediateRender();
            setComponentExplodeAmount(val);
          }}
          onToggleXray={() => {
            const next = !simRef.current.xrayGasMode;
            simRef.current.xrayGasMode = next;
            simRef.current.rebuildWeaponMeshFlag = true;
            simRef.current.forceImmediateRender();
            setXrayGasMode(next);
          }}
          onSelectVersion={handleLoadVersion}
          onChangeCustomCaliber={handleChangeCustomCaliber}
          onFireRangeShot={() => {
            handleFireWeapon();
            if (
              dischargeType !== 'REGULATED_HAMMERLESS_PLUG_VALVE' &&
              dischargeType !== 'REGULATED_BALANCED_POPPET_VALVE' &&
              dischargeType !== 'PILOT_DUMP_QEV_DIAPHRAGM'
            ) {
              setInventory((prev) => ({
                ...prev,
                burstDiskFoils: Math.max(0, prev.burstDiskFoils - 1),
              }));
            }
          }}
          onPumpRangeStroke={() => handlePumpAscentTo300Bar('SINGLE_3STAGE_STROKE')}
          onPumpStroke={() => handlePumpAscentTo300Bar('SINGLE_3STAGE_STROKE')}
          onRefillRange250Bar={handleBenchRefill250Bar}
          onBackToWorkbench={() => setShellState('workbench')}
          onDeployToArena={() => handleStartOrRestartArena(wave)}
          onDeployZombieRaid={() => handleStartOrRestartArena(wave)}
        />
      )}

      {/* 3-Printer Part Fabrication Room (ONLY Exit Returns to Title Screen!) */}
      {shellState === 'printer_room' && (
        <ThreePrinterRoom
          inventory={inventory}
          onFabricatePart={(recipe: PrinterPartRecipe) => {
            const res = executePrinterPartFabrication(inventory, recipe);
            if (res.success) {
              setInventory(res.nextInventory);
              setStatusMessage(res.message);
              if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
                const blob = new Blob([res.stlAsset.stlString], { type: 'model/stl' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.stlAsset.fileName;
                a.click();
                URL.revokeObjectURL(url);
              }
            } else {
              setStatusMessage(res.message);
            }
          }}
          onReturnToTitle={() => setShellState('title')}
          companionMemory={dccCompanionMemory}
          onCommandRoyalCourtAgent={handleCommandRoyalCourtAgent}
        />
      )}

      {/* Title Screen, Playing HUD & Pause/GameOver Modals */}
      <GameHudAndModals
        shellState={shellState}
        loadout={loadout}
        pneumaticState={pneumaticState}
        arenaMap={arenaMap}
        inventory={inventory}
        playerPos={playerPos}
        playerHp={playerHp}
        maxPlayerHp={100}
        score={score}
        bestScore={bestScore}
        wave={wave}
        clearTimeSec={clearTimeSec}
        isVictory={isVictory}
        muted={muted}
        statusMessage={statusMessage}
        hitMarkerActive={hitMarkerActive}
        savedVersions={savedVersions}
        activeVersionId={activeVersionId}
        onSelectSavedVersion={handleLoadVersion}
        elonVersionState={elonVersionState}
        onRunElonVersionUpgrade={handleRunElonVersionUpgrade}
        onOpenHermesModal={() => setShowHermesModal(true)}
        onPumpAscentTo300Bar={handlePumpAscentTo300Bar}
        onStartGame={() => handleStartOrRestartArena(1)}
        onOpenWorkbench={() => setShellState('workbench')}
        onOpenRange={() => setShellState('range')}
        onOpenPrinterRoom={() => setShellState('printer_room')}
        onSelectPreset={handleUpdateLoadout}
        onRerollMapSeed={() => {
          const nextSeed = 1000 + Math.floor(Math.random() * 8999);
          const nextMap = generateRandomArena(nextSeed, 1);
          simRef.current.map = nextMap;
          simRef.current.rebuildArenaMeshFlag = true;
          setArenaMap(nextMap);
        }}
        onResumeGame={() => setShellState('playing')}
        onPauseGame={() => setShellState('paused')}
        onRestartGame={() => handleStartOrRestartArena(isVictory ? wave + 1 : 1)}
        onReturnToTitle={() => setShellState('title')}
        onToggleMute={() => {
          soundEngine.muted = !soundEngine.muted;
          setMuted(soundEngine.muted);
        }}
        onFireWeapon={handleFireWeapon}
        onReloadMagazine={handleReloadMagazine}
        onToggleForegripCamLock={handleToggleForegripCamLock}
        onPumpStroke={handlePumpStroke}
        onCycleOneWayTarget={handleCycleOneWayTarget}
        graphicsModeBadge={GRAPHICS_MODE_SPECS[graphicsMode].shortBadge}
        isRetroGraphics={graphicsMode === 'MINESCRIPT_DOOM_RETRO'}
        onToggleGraphicsMode={() =>
          handleSelectGraphicsMode(
            graphicsMode === 'MINESCRIPT_DOOM_RETRO'
              ? 'PHOTOREALISTIC_PBR_STUDIO'
              : 'MINESCRIPT_DOOM_RETRO'
          )
        }
        onOpenCadReferencesModal={() => setShowCadReferencesModal(true)}
        onAutoGenerateFutureBlueprintVersion={() => {
          const nextNum = savedVersions.length + 1;
          handleSaveNewVersion(
            `#${String(nextNum).padStart(2, '0')} Auto-Synthesized Custom CAD Airgun (${customCaliberMm.toFixed(2)}mm · ${pneumaticState.regulatorSetpointBar}B Regulated)`
          );
        }}
      />

      {/* Hierarchical Vertex AI "Hermes" Orchestrator + 8 Sub-Agents + Elon's 5-Step Algo Studio */}
      <HermesVertexAndElonModal
        isOpen={showHermesModal}
        elonVersionState={elonVersionState}
        onRunElonVersionUpgrade={handleRunElonVersionUpgrade}
        onResolveHitlWebhook={handleResolveHitlWebhook}
        onClose={() => setShowHermesModal(false)}
      />

      {/* Dungeon Crawler Carl (DCC) Aristocratic Diva Show-Cat Companion & Post-Round Weird System AI */}
      <DccCompanionAndSystemAiHud
        companionMemory={dccCompanionMemory}
        isGeneratingChat={isCompanionThinking}
        onSendPlayerChat={(msg: string) => void handleSendCompanionChat(msg, 'PLAYER_CHAT')}
        onTriggerAutonomousBanter={() =>
          void handleSendCompanionChat(undefined, 'AUTONOMOUS_FREE_WILL')
        }
        onFireManualOcularBeam={() => {
          simRef.current.companionAutonomousFireCooldown = 0;
          simRef.current.companionBeamPulseTimer = 0.45;
          setStatusMessage(
            '👑 Commanded HRH Princess Chonk-Beam III: Firing Twin Ocular Magic-Missile Eye-Beams!'
          );
        }}
        postRoundBroadcast={systemAiBroadcast}
        onOpenLootBox={() => {
          if (systemAiBroadcast && !systemAiBroadcast.opened) {
            setInventory((prev) => ({
              ...prev,
              pa12CfFilamentGrams:
                prev.pa12CfFilamentGrams + systemAiBroadcast.bonusFilamentGrams,
              peekAerospaceGrams:
                prev.peekAerospaceGrams + systemAiBroadcast.bonusPeekGrams,
              tpu95aSealFilamentGrams: prev.tpu95aSealFilamentGrams + 30,
              billet7075DustGrams: prev.billet7075DustGrams + 60,
              chromoly4140Cores: prev.chromoly4140Cores + 1,
              titaniumBellevilleSprings: prev.titaniumBellevilleSprings + 2,
              burstDiskFoils: prev.burstDiskFoils + systemAiBroadcast.bonusBurstDisks,
              nbr90Oings: prev.nbr90Oings + 3,
            }));
            setSystemAiBroadcast({
              ...systemAiBroadcast,
              opened: true,
            });
            setStatusMessage(
              `Opened ${systemAiBroadcast.lootBoxName}: +${systemAiBroadcast.bonusFilamentGrams}g PA12-CF, +60g Sinter Powder, +1× 4140 Core, +2× Ti Springs, +${systemAiBroadcast.bonusBurstDisks}× SHELL-50-220B Foils!`
            );
          }
        }}
        onDismissPostRoundBroadcast={() => setSystemAiBroadcast(null)}
        compactMode={shellState === 'workbench' || shellState === 'printer_room'}
        onCommandRoyalCourtAgent={handleCommandRoyalCourtAgent}
      />

      {/* Persistent Graphics Mode Switcher & /game_references/ CAD Agent Button (Shown outside Title Screen; Title Screen embeds them in the top banner) */}
      {shellState !== 'title' && (
        <div className="fixed bottom-3 left-3 z-40 flex flex-wrap items-center gap-1.5 pointer-events-auto font-mono">
          <button
            onClick={() =>
              handleSelectGraphicsMode(
                graphicsMode === 'MINESCRIPT_DOOM_RETRO'
                  ? 'PHOTOREALISTIC_PBR_STUDIO'
                  : 'MINESCRIPT_DOOM_RETRO'
              )
            }
            className={`rounded border px-2.5 py-1 text-[11px] font-bold shadow-lg transition cursor-pointer ${
              graphicsMode === 'MINESCRIPT_DOOM_RETRO'
                ? 'border-amber-400 bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'border-cyan-400 bg-cyan-950/90 text-cyan-200 hover:bg-cyan-900'
            }`}
            title="Toggle live between Minescript/Doom Retro Voxel Graphics and Photorealistic Studio PBR Graphics [Shortcut: G]"
          >
            {GRAPHICS_MODE_SPECS[graphicsMode].shortBadge} ⇄ [G]
          </button>

          <button
            onClick={() => setShowCadReferencesModal(true)}
            className="rounded border border-emerald-400/80 bg-emerald-950/90 px-2.5 py-1 text-[11px] font-bold text-emerald-200 shadow-lg hover:bg-emerald-900 transition cursor-pointer"
            title="Open /game_references/ folder, inspect caliper dimensions & agent notes, upload files, and run the Expert Reverse-Engineering & Parametric CAD Agent [Shortcut: K]"
          >
            📂 /game_references &amp; CAD Agent [K]
          </button>

          <button
            data-testid="global-webxr-toggle-btn"
            onClick={() => handleToggleWebXrMode()}
            className={`rounded border px-2.5 py-1 text-[11px] font-bold shadow-lg transition cursor-pointer ${
              xrSessionMode !== 'OFF'
                ? 'border-fuchsia-300 bg-fuchsia-500 text-zinc-950 hover:bg-fuchsia-400'
                : 'border-fuchsia-400/80 bg-fuchsia-950/90 text-fuchsia-200 hover:bg-fuchsia-900'
            }`}
            title={`Toggle WebXR Spatial Mode (${xrHardwareSupport.deviceSummary}) [Shortcut: X]`}
          >
            🥽 WebXR: {xrSessionMode === 'OFF' ? 'OFF' : xrSessionMode === 'IMMERSIVE_AR_PASSTHROUGH' ? 'AR Passthrough' : '6DoF Spatial'} [X]
          </button>
        </div>
      )}

      {/* Expert Reverse-Engineering & Parametric CAD Agent + /game_references/ Browser Modal */}
      <ReverseEngineeringCadFolderModal
        isOpen={showCadReferencesModal}
        onClose={() => setShowCadReferencesModal(false)}
        graphicsMode={graphicsMode}
        onSelectGraphicsMode={handleSelectGraphicsMode}
        activeWeaponIndex={ Math.max(0, savedVersions.findIndex((v) => v.versionId === activeVersionId)) }
        onSelectWeaponIndex={(idx) => {
          const targetVer = savedVersions[idx];
          if (targetVer) {
            handleLoadVersion(targetVer);
          }
        }}
        onApplyReconstructedCadToWeapon={(result, asset) => {
          handleSelectGraphicsMode('PHOTOREALISTIC_PBR_STUDIO');
          simRef.current.rebuildWeaponMeshFlag = true;
          simRef.current.forceImmediateRender();
          setStatusMessage(
            `🔧 Applied Reconstructed B-Rep Solid (${asset.fileName} · ±${result.manifoldCheck.boundingBoxErrorMm}mm) in Photorealistic PBR Mode`
          );
        }}
      />
    </main>
  );
}
