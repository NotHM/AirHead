import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PrinterStationId } from '../game/threePrinterRoomEngine';
import {
  PrincessDonutRoyalCourtAgent,
  RoyalCourtAgentId,
} from '../game/dccCompanionAndSwarmEngine';
import {
  Floating3DPartRadialMenu,
  RadialQuickMenuActionNode,
} from './Floating3DPartRadialMenu';

export interface AnimatedAgentAvatarTelemetry {
  avatarId: string;
  displayName: string;
  roleBadge: string;
  tier: 'ROYAL_COURT' | '1B_SCOUT' | '4B_SPECIALIST';
  assignedStationLabel: string;
  activeTaskSummary: string;
  delegatingToAvatarId?: string;
  royalAgentId?: RoyalCourtAgentId;
}

interface PrinterRoom3DAgentSwarmStageProps {
  selectedPrinterId: PrinterStationId;
  royalCourtAgents: PrincessDonutRoyalCourtAgent[];
  activeOllamaModelTag: string;
  strictLocalOllama: boolean;
  onSelectPrinterStation: (printerId: PrinterStationId) => void;
  onCommandRoyalAgent?: (agentId?: RoyalCourtAgentId, order?: string) => void;
  onTrigger1B4BSwarm: () => void;
  onResearchActiveStationParts: () => void;
}

// Pre-allocated module-scope scratch objects to guarantee zero GC in render loop
const _scratchVec3 = new THREE.Vector3();
const _projVec3 = new THREE.Vector3();

export const PrinterRoom3DAgentSwarmStage: React.FC<
  PrinterRoom3DAgentSwarmStageProps
> = ({
  selectedPrinterId,
  royalCourtAgents,
  activeOllamaModelTag,
  strictLocalOllama,
  onSelectPrinterStation,
  onCommandRoyalAgent,
  onTrigger1B4BSwarm,
  onResearchActiveStationParts,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [selectedAvatar, setSelectedAvatar] =
    useState<AnimatedAgentAvatarTelemetry | null>(null);
  const [radialMenuCoords, setRadialMenuCoords] = useState<{
    xPct: number;
    yPct: number;
  }>({ xPct: 50, yPct: 48 });
  const [delegationPulseActive, setDelegationPulseActive] =
    useState<boolean>(true);
  const [collapsedStage, setCollapsedStage] = useState<boolean>(false);

  const avatarsList: AnimatedAgentAvatarTelemetry[] = [
    {
      avatarId: 'AVATAR_SIR_REND_PAW',
      displayName: 'Sir Rend-Paw',
      roleBadge: 'Royal Court · Ballistic & Tiara Optics',
      tier: 'ROYAL_COURT',
      assignedStationLabel: 'Printer #2 (Metal DMLS)',
      activeTaskSummary:
        'Sintering Ti-6Al-4V Crown Laser Array & #09 Protector M28×1.5 Annular Breech',
      royalAgentId: 'COURT_01_SIR_REND_PAW',
    },
    {
      avatarId: 'AVATAR_LADY_WHISKER_CAD',
      displayName: 'Lady Whisker-CAD',
      roleBadge: 'Royal Court · Sub-mm B-Rep & O-Rings',
      tier: 'ROYAL_COURT',
      assignedStationLabel: 'Printer #3 (Ordnance Synth)',
      activeTaskSummary:
        'Curing Viton 90A / Fluorosilicone Face-Seal Glands & P50 90° Breech Interlock',
      royalAgentId: 'COURT_02_LADY_WHISKER_CAD',
    },
    {
      avatarId: 'AVATAR_LORD_CHONK_FORGE',
      displayName: 'Lord Chonk-Forge',
      roleBadge: 'Royal Court · 300-Bar Pressure Vessels',
      tier: 'ROYAL_COURT',
      assignedStationLabel: 'Printer #2 (Metal DMLS)',
      activeTaskSummary:
        'Proof-testing 17-4PH H900 Hammer & Belleville Regulator Stack at 300 Bar',
      royalAgentId: 'COURT_03_LORD_CHONK_FORGE',
    },
    {
      avatarId: 'AVATAR_DAME_VELOUR',
      displayName: 'Dame Velour',
      roleBadge: 'Royal Court · Carbon-Nylon Chassis',
      tier: 'ROYAL_COURT',
      assignedStationLabel: 'Printer #1 (Polymer SLS/FDM)',
      activeTaskSummary:
        'Printing PA12-CF Folding Buttstock Latch & Extended P50 Pump Foregrip',
      royalAgentId: 'COURT_04_DAME_VELOUR',
    },
    {
      avatarId: 'AVATAR_MASTER_MONGO',
      displayName: 'Master Mongo-Wrangler',
      roleBadge: 'Royal Court · Burst-Disk & Scatter Lead',
      tier: 'ROYAL_COURT',
      assignedStationLabel: '9-Gun Weapons Rack',
      activeTaskSummary:
        'Loading SHELL-50-220B Burst-Disk Cartridges into #01 Mongo & #09 The Protector',
      royalAgentId: 'COURT_05_MASTER_MONGO_WRANGLER',
    },
    {
      avatarId: 'AVATAR_1B_SCOUT_GEMMA',
      displayName: '1B Scout (gemma3:1b)',
      roleBadge: 'Local 1B Fast Triage Agent',
      tier: '1B_SCOUT',
      assignedStationLabel: 'Patrolling Printers #1 → #3',
      activeTaskSummary:
        'Detected coupled 250-Bar Navier-Stokes + Belleville PDE → Delegating to 4B Specialist!',
      delegatingToAvatarId: 'AVATAR_4B_ARCHITECT_GEMMA',
    },
    {
      avatarId: 'AVATAR_1B_SCOUT_QWEN',
      displayName: '1B Scout (qwen2.5:1.5b)',
      roleBadge: 'Local 1.5B CAD Mesh Scanner',
      tier: '1B_SCOUT',
      assignedStationLabel: '9-Gun Weapons Rack',
      activeTaskSummary:
        'Auditing watertight .STL normals across #02 REX-P & #07 P50 → Escalating B-Rep to 4B!',
      delegatingToAvatarId: 'AVATAR_4B_ARCHITECT_GEMMA',
    },
    {
      avatarId: 'AVATAR_4B_ARCHITECT_GEMMA',
      displayName: `4B Specialist (${activeOllamaModelTag})`,
      roleBadge: 'Local 4B Heavy Physics & CAD Solver',
      tier: '4B_SPECIALIST',
      assignedStationLabel: 'Central Swarm Command Pylon',
      activeTaskSummary:
        'Completing delegated 1B tasks: Solving 3D Navier-Stokes Cd=0.92 & Lamé SF=2.68',
    },
  ];

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container || collapsedStage) return;

    // 1. Software-WebGL Guard (`isSoftwareGl`) per Three.js Skill
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(320, container.clientWidth || 920);
    const height = Math.max(260, container.clientHeight || 310);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.032);

    // 2. Mandatory Studio Environment Reflection (`RoomEnvironment`)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(0, 6.8, 12.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.3, 0);
    controls.minDistance = 4.5;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;

    // 3. Balanced 3-Point Studio Rig (Warm Key + Cool Hemisphere Fill + Rim)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    keyLight.position.set(7, 12, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.15);
    rimLight.position.set(-8, 6, -7);
    scene.add(rimLight);

    // Ground Floor & Technical Grid (offset by >= 0.02 on Y so coplanar faces never Z-fight)
    const floorGeo = new THREE.PlaneGeometry(34, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.78,
      metalness: 0.22,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(28, 28, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    const clickableMeshes: THREE.Object3D[] = [];

    // Helper: Build Composite 8-Part 3D Printer Station
    const printerPositions: Array<{
      id: PrinterStationId;
      x: number;
      z: number;
      color: number;
      label: string;
    }> = [
      {
        id: 'PRINTER_01_POLYMER_SLS',
        x: -5.4,
        z: -1.8,
        color: 0x10b981,
        label: 'Printer #1: Polymer SLS/FDM',
      },
      {
        id: 'PRINTER_02_METAL_DMLS',
        x: 0,
        z: -2.2,
        color: 0xd946ef,
        label: 'Printer #2: Metal DMLS Laser',
      },
      {
        id: 'PRINTER_03_ORDNANCE_SYNTH',
        x: 5.4,
        z: -1.8,
        color: 0xf59e0b,
        label: 'Printer #3: Ordnance & Seal Synth',
      },
    ];

    const printerHeadRefs: THREE.Mesh[] = [];

    printerPositions.forEach((p, idx) => {
      const group = new THREE.Group();
      group.position.set(p.x, 0, p.z);

      // Contact shadow grounding plane
      const shadowGeo = new THREE.CircleGeometry(1.75, 24);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.03;
      group.add(shadowMesh);

      // 1. Primary Base Chassis
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.42,
        metalness: 0.78,
      });
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.7, 2.0),
        baseMat
      );
      baseMesh.position.y = 0.35;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      // 2 & 3. Left & Right CNC Gantry Pillars
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.25,
        metalness: 0.88,
      });
      const leftPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 2.2, 0.28),
        pillarMat
      );
      leftPillar.position.set(-0.92, 1.8, 0);
      group.add(leftPillar);

      const rightPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 2.2, 0.28),
        pillarMat
      );
      rightPillar.position.set(0.92, 1.8, 0);
      group.add(rightPillar);

      // 4. Top Crossbar Bridge
      const bridgeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.26, 0.42),
        baseMat
      );
      bridgeMesh.position.set(0, 2.85, 0);
      group.add(bridgeMesh);

      // 5. Heated / Sinter Build Plate
      const plateMat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.3,
        metalness: 0.65,
      });
      const plateMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.78, 0.12, 24),
        plateMat
      );
      plateMesh.position.set(0, 0.78, 0);
      group.add(plateMesh);

      // 6. Moving Laser / Extruder Print Head
      const headMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.52, 16),
        new THREE.MeshStandardMaterial({
          color: p.color,
          emissive: p.color,
          emissiveIntensity: 0.45,
          roughness: 0.2,
          metalness: 0.9,
        })
      );
      headMesh.rotation.x = Math.PI;
      headMesh.position.set(0, 1.85, 0);
      group.add(headMesh);
      printerHeadRefs.push(headMesh);

      // 7. Part Being Fabricated on Build Plate (Torus + Coaxial Cylinder)
      const partMesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.26, 0.07, 48, 12),
        new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.18,
          metalness: 0.92,
        })
      );
      partMesh.position.set(0, 1.12, 0);
      group.add(partMesh);

      // 8. Feed Spool / Powder Silo Accent
      const siloMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.9, 16),
        plateMat
      );
      siloMesh.position.set(1.22, 1.2, -0.45);
      group.add(siloMesh);

      // Invisible Raycast Proxy on Layer 1
      const proxy = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 3.1, 2.2),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      proxy.position.set(0, 1.55, 0);
      proxy.layers.set(1);
      proxy.userData = {
        kind: 'PRINTER_STATION',
        printerId: p.id,
        label: p.label,
        avatarIndex: idx,
      };
      group.add(proxy);
      clickableMeshes.push(proxy);

      scene.add(group);
    });

    // Build Composite 9-Gun Weapons Rack at Right Rear (x = 4.6, z = 2.4)
    const rackGroup = new THREE.Group();
    rackGroup.position.set(4.6, 0, 2.4);
    const rackFrameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.82,
    });
    const rackBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.25, 1.1),
      rackFrameMat
    );
    rackBase.position.y = 0.125;
    rackGroup.add(rackBase);

    const rackBackboard = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 2.1, 0.16),
      rackFrameMat
    );
    rackBackboard.position.set(0, 1.15, -0.35);
    rackGroup.add(rackBackboard);

    // 9 Miniature Composite Rifles/Pistols (#01 Mongo -> #09 The Protector) on the Rack
    const gunBarrelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.94,
    });
    const gunStockMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.5,
      metalness: 0.45,
    });
    for (let g = 0; g < 9; g++) {
      const gx = -1.2 + g * 0.3;
      const gunMini = new THREE.Group();
      gunMini.position.set(gx, 0.65, 0);
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 1.25, 10),
        gunBarrelMat
      );
      barrel.position.y = 0.55;
      gunMini.add(barrel);
      if (g === 8) {
        // #09 The Protector Dual-Barrel Twin Reserve silhouette
        const secondBarrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 1.25, 10),
          gunBarrelMat
        );
        secondBarrel.position.set(0, 0.55, 0.08);
        gunMini.add(secondBarrel);
      }
      const stock = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.42, 0.24),
        gunStockMat
      );
      stock.position.set(0, 0.15, 0.05);
      gunMini.add(stock);
      rackGroup.add(gunMini);
    }
    scene.add(rackGroup);

    // Build 8 Composite 8-Part Animated 3D Agent Avatars (5 Royal Court + 2x 1B Scouts + 1x 4B Specialist)
    const avatarNodes: Array<{
      meta: AnimatedAgentAvatarTelemetry;
      group: THREE.Group;
      leftArm: THREE.Mesh;
      rightArm: THREE.Mesh;
      headGroup: THREE.Group;
      basePos: THREE.Vector3;
      orbitRadius: number;
      phaseOffset: number;
    }> = [];

    const stationAnchors: THREE.Vector3[] = [
      new THREE.Vector3(3.8, 0, -0.4), // Sir Rend-Paw near DMLS
      new THREE.Vector3(-0.9, 0, -0.4), // Lady Whisker-CAD near SLA
      new THREE.Vector3(5.6, 0, 0.2), // Lord Chonk-Forge near DMLS
      new THREE.Vector3(-4.6, 0, 0.2), // Dame Velour near Polymer SLS
      new THREE.Vector3(3.2, 0, 2.2), // Master Mongo near Weapons Rack
      new THREE.Vector3(-2.4, 0, 1.8), // 1B Scout (gemma3:1b)
      new THREE.Vector3(1.6, 0, 1.9), // 1B Scout (qwen2.5:1.5b)
      new THREE.Vector3(-0.2, 0, 2.5), // 4B Specialist (gemma3:4b)
    ];

    avatarsList.forEach((meta, idx) => {
      const avatarGroup = new THREE.Group();
      const anchor = stationAnchors[idx] || new THREE.Vector3(0, 0, 0);
      avatarGroup.position.copy(anchor);

      const isRoyal = meta.tier === 'ROYAL_COURT';
      const is4B = meta.tier === '4B_SPECIALIST';
      const primaryColor = isRoyal
        ? 0xf59e0b
        : is4B
        ? 0x10b981
        : 0x06b6d4;
      const accentColor = isRoyal
        ? 0xec4899
        : is4B
        ? 0x34d399
        : 0x38bdf8;

      // 1. Contact Shadow Plane at y = 0.02
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 16),
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      avatarGroup.add(shadow);

      // 2. Hover / Pedestal Locomotion Base
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.42, 0.22, 18),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.35,
          metalness: 0.85,
        })
      );
      baseMesh.position.y = 0.11;
      avatarGroup.add(baseMesh);

      // 3. Armored Torso Chassis
      const torsoScale = is4B ? 1.22 : 1.0;
      const torsoMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.28 * torsoScale,
          0.22 * torsoScale,
          0.72 * torsoScale,
          16
        ),
        new THREE.MeshStandardMaterial({
          color: primaryColor,
          roughness: 0.28,
          metalness: 0.78,
        })
      );
      torsoMesh.position.y = 0.62 * torsoScale;
      torsoMesh.castShadow = true;
      avatarGroup.add(torsoMesh);

      // 4. Head + Optical Visor + Royal Crown / Antenna Group
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.16 * torsoScale;
      const headMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.22 * torsoScale, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.22,
          metalness: 0.85,
        })
      );
      headGroup.add(headMesh);

      // 5. Glowing Optical Visor Band
      const visorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.32 * torsoScale, 0.09, 0.18),
        new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: 0.75,
          roughness: 0.15,
          metalness: 0.9,
        })
      );
      visorMesh.position.set(0, 0.02, 0.14 * torsoScale);
      headGroup.add(visorMesh);

      // 6. Royal Tiara Crest or Neural Telemetry Fin
      const crestMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.14 * torsoScale, 0.24, 6),
        new THREE.MeshStandardMaterial({
          color: isRoyal ? 0xfacc15 : accentColor,
          roughness: 0.18,
          metalness: 0.95,
        })
      );
      crestMesh.position.set(0, 0.28 * torsoScale, 0);
      headGroup.add(crestMesh);
      avatarGroup.add(headGroup);

      // 7 & 8. Articulated Left & Right Manipulator Arms
      const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.52, 10);
      const armMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.3,
        metalness: 0.88,
      });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.36 * torsoScale, 0.68 * torsoScale, 0.12);
      leftArm.rotation.x = -Math.PI / 4;
      avatarGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.36 * torsoScale, 0.68 * torsoScale, 0.12);
      rightArm.rotation.x = -Math.PI / 3;
      avatarGroup.add(rightArm);

      // Raycast Proxy Box on Layer 1
      const hitProxy = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 1.65, 0.95),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitProxy.position.y = 0.82;
      hitProxy.layers.set(1);
      hitProxy.userData = {
        kind: 'AGENT_AVATAR',
        avatarIndex: idx,
      };
      avatarGroup.add(hitProxy);
      clickableMeshes.push(hitProxy);

      scene.add(avatarGroup);
      avatarNodes.push({
        meta,
        group: avatarGroup,
        leftArm,
        rightArm,
        headGroup,
        basePos: anchor.clone(),
        orbitRadius: is4B ? 0.28 : 0.62,
        phaseOffset: idx * 0.85,
      });
    });

    // Build 3D Curved Task-Delegation Tethers connecting 1B Scouts (indices 5 & 6) -> 4B Specialist (index 7)
    const tetherMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.8,
    });
    const buildDelegationArc = (fromPos: THREE.Vector3, toPos: THREE.Vector3) => {
      const mid = fromPos.clone().lerp(toPos, 0.5);
      mid.y += 1.95;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(fromPos.x, 1.25, fromPos.z),
        mid,
        new THREE.Vector3(toPos.x, 1.45, toPos.z)
      );
      return new THREE.TubeGeometry(curve, 20, 0.032, 8, false);
    };

    const tether1Mesh = new THREE.Mesh(
      buildDelegationArc(stationAnchors[5], stationAnchors[7]),
      tetherMaterial
    );
    const tether2Mesh = new THREE.Mesh(
      buildDelegationArc(stationAnchors[6], stationAnchors[7]),
      tetherMaterial
    );
    scene.add(tether1Mesh);
    scene.add(tether2Mesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting on Click (restricted to Layer 1)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();

    const handleCanvasClick = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        hitObj.getWorldPosition(_projVec3);
        _projVec3.y += 0.9;
        _projVec3.project(camera);
        const xPct = ((_projVec3.x + 1) / 2) * 100;
        const yPct = ((-(_projVec3.y - 1)) / 2) * 100;
        setRadialMenuCoords({ xPct, yPct });

        if (hitObj.userData.kind === 'PRINTER_STATION') {
          onSelectPrinterStation(hitObj.userData.printerId as PrinterStationId);
          const mappedAvatar =
            avatarsList[hitObj.userData.avatarIndex] || avatarsList[0];
          setSelectedAvatar(mappedAvatar);
        } else if (hitObj.userData.kind === 'AGENT_AVATAR') {
          const picked = avatarsList[hitObj.userData.avatarIndex];
          if (picked) {
            setSelectedAvatar(picked);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Software-WebGL Paced Loop vs Hardware 60fps Loop
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();

      // Animate printer laser/extruder heads
      printerHeadRefs.forEach((head, idx) => {
        head.position.x = Math.sin(elapsed * 2.6 + idx) * 0.35;
        head.position.z = Math.cos(elapsed * 2.1 + idx) * 0.28;
      });

      // Animate 8 Agent Avatars patrolling & operating stations with smooth damping
      avatarNodes.forEach((node, idx) => {
        const targetX =
          node.basePos.x +
          Math.cos(elapsed * 0.85 + node.phaseOffset) * node.orbitRadius;
        const targetZ =
          node.basePos.z +
          Math.sin(elapsed * 1.1 + node.phaseOffset) * (node.orbitRadius * 0.65);

        node.group.position.x = THREE.MathUtils.damp(
          node.group.position.x,
          targetX,
          4.5,
          dt
        );
        node.group.position.z = THREE.MathUtils.damp(
          node.group.position.z,
          targetZ,
          4.5,
          dt
        );
        node.headGroup.rotation.y = Math.sin(elapsed * 1.8 + idx) * 0.38;
        node.leftArm.rotation.x =
          -Math.PI / 4 + Math.sin(elapsed * 4.2 + idx) * 0.32;
        node.rightArm.rotation.x =
          -Math.PI / 3 + Math.cos(elapsed * 4.2 + idx) * 0.32;
      });

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const nw = Math.max(320, container.clientWidth);
      const nh = Math.max(260, container.clientHeight);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
    };
  }, [collapsedStage, activeOllamaModelTag]);

  const radialNodes: RadialQuickMenuActionNode[] = selectedAvatar
    ? [
        {
          id: 'inspect-agent',
          angleDeg: 0,
          shortLabel: '1. Agent Spec',
          subLabel: selectedAvatar.tier,
          accentColor: 'amber',
          onTrigger: () => {
            setDelegationPulseActive((v) => !v);
          },
        },
        {
          id: 'command-royal',
          angleDeg: 60,
          shortLabel: '2. Task Agent',
          subLabel: '+1 Mk Upgrade',
          accentColor: 'fuchsia',
          onTrigger: () => {
            onCommandRoyalAgent?.(
              selectedAvatar.royalAgentId,
              `Accelerate ${selectedAvatar.assignedStationLabel} fabrication`
            );
            setSelectedAvatar(null);
          },
        },
        {
          id: 'delegate-1b-4b',
          angleDeg: 120,
          shortLabel: '3. 1B → 4B Swarm',
          subLabel: activeOllamaModelTag,
          accentColor: 'cyan',
          onTrigger: () => {
            onTrigger1B4BSwarm();
            setSelectedAvatar(null);
          },
        },
        {
          id: 'research-station',
          angleDeg: 180,
          shortLabel: '4. Research Parts',
          subLabel: strictLocalOllama ? 'Strict Local' : 'Ollama CFD',
          accentColor: 'emerald',
          onTrigger: () => {
            onResearchActiveStationParts();
            setSelectedAvatar(null);
          },
        },
        {
          id: 'focus-printer-1',
          angleDeg: 240,
          shortLabel: '5. Switch Station',
          subLabel: selectedPrinterId.replace('PRINTER_0', '#'),
          accentColor: 'sky',
          onTrigger: () => {
            const nextMap: Record<PrinterStationId, PrinterStationId> = {
              PRINTER_01_POLYMER_SLS: 'PRINTER_02_METAL_DMLS',
              PRINTER_02_METAL_DMLS: 'PRINTER_03_ORDNANCE_SYNTH',
              PRINTER_03_ORDNANCE_SYNTH: 'PRINTER_01_POLYMER_SLS',
            };
            onSelectPrinterStation(nextMap[selectedPrinterId]);
            setSelectedAvatar(null);
          },
        },
        {
          id: 'close-ring',
          angleDeg: 300,
          shortLabel: '6. Dismiss Ring',
          subLabel: 'Resume Orbit',
          accentColor: 'rose',
          onTrigger: () => setSelectedAvatar(null),
        },
      ]
    : [];

  return (
    <div className="bg-zinc-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-cyan-300">
            🤖 3D Live Agent Swarm &amp; Royal Court Floor (8 Animated Avatars · 3 Printers · 9-Gun Rack)
          </span>
          <span className="text-[11px] text-zinc-400">
            · Click any 3D Agent Avatar or Printer Station to open its Floating Radial Quick-Menu
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="open-avatar-radial-demo"
            onClick={() => {
              setSelectedAvatar((prev) => (prev ? null : avatarsList[5]));
              setRadialMenuCoords({ xPct: 50, yPct: 50 });
            }}
            className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-mono text-[10.5px] font-bold hover:bg-cyan-500 hover:text-zinc-950 cursor-pointer"
          >
            🎯 Inspect 1B → 4B Avatar Radial Menu
          </button>
          <button
            type="button"
            onClick={() => setCollapsedStage((v) => !v)}
            className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-[10.5px] cursor-pointer"
          >
            {collapsedStage ? '▴ Expand 3D Swarm Floor' : '▾ Collapse 3D Floor'}
          </button>
        </div>
      </div>

      {!collapsedStage && (
        <div className="relative w-full h-[320px] bg-zinc-950">
          {/* Isolated WebGL Mount Container */}
          <div ref={canvasMountRef} className="w-full h-full" />

          {/* Top-Left Live Legend Overlay (pointer-events-none) */}
          <div className="pointer-events-none absolute top-2.5 left-3 z-10 bg-zinc-950/90 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-[10px] space-y-0.5">
            <div className="text-amber-300 font-bold">
              👑 Gold/Magenta Avatars: Princess Donut&apos;s 5 Royal Court Agents ({royalCourtAgents.length} Active)
            </div>
            <div className="text-cyan-300">
              🐝 Cyan Arcs: 1B Scouts (gemma3:1b, qwen2.5:1.5b) delegating high-DOF tasks → 4B Specialist ({activeOllamaModelTag})
            </div>
            <div className="text-emerald-300">
              {delegationPulseActive
                ? '✓ Live 1B → 4B Hierarchical Handoff Tethers Active'
                : '· Handoff Telemetry Paused'}
            </div>
          </div>

          {/* Bottom Quick Avatar Selector Strip */}
          <div className="pointer-events-auto absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center justify-center gap-1 bg-zinc-950/95 border border-zinc-800 rounded-xl px-2.5 py-1 max-w-[96%]">
            {avatarsList.map((av) => (
              <button
                key={av.avatarId}
                type="button"
                onClick={() => {
                  setSelectedAvatar(av);
                  setRadialMenuCoords({ xPct: 50, yPct: 48 });
                }}
                className={`px-2 py-0.5 rounded font-mono text-[9.5px] font-bold cursor-pointer border whitespace-nowrap ${
                  selectedAvatar?.avatarId === av.avatarId
                    ? 'bg-amber-500 text-zinc-950 border-amber-300'
                    : av.tier === 'ROYAL_COURT'
                    ? 'bg-zinc-900 border-amber-500/40 text-amber-200 hover:border-amber-400'
                    : av.tier === '1B_SCOUT'
                    ? 'bg-zinc-900 border-cyan-500/40 text-cyan-200 hover:border-cyan-400'
                    : 'bg-zinc-900 border-emerald-500/40 text-emerald-200 hover:border-emerald-400'
                }`}
              >
                {av.displayName}
              </button>
            ))}
          </div>

          {/* Floating 3D Radial Quick-Menu Around Selected Avatar or Printer */}
          {selectedAvatar && (
            <Floating3DPartRadialMenu
              visible={Boolean(selectedAvatar)}
              anchorXPercent={radialMenuCoords.xPct}
              anchorYPercent={radialMenuCoords.yPct}
              partCode={selectedAvatar.roleBadge}
              partTitle={selectedAvatar.displayName}
              materialAndMassBadge={selectedAvatar.assignedStationLabel}
              safetyAndToleranceBadge={selectedAvatar.activeTaskSummary}
              delegationStatusBadge={
                selectedAvatar.delegatingToAvatarId
                  ? `1B → 4B Escalation to ${activeOllamaModelTag}`
                  : 'Verified 100% Spec'
              }
              nodes={radialNodes}
              onClose={() => setSelectedAvatar(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};
