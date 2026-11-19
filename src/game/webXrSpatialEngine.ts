import * as THREE from 'three';

export type XrSessionMode =
  | 'OFF'
  | 'IMMERSIVE_VR_HEADSET'
  | 'IMMERSIVE_AR_PASSTHROUGH'
  | 'SIMULATED_6DOF_SPATIAL';

export interface XrHardwareSupportStatus {
  webXrApiAvailable: boolean;
  immersiveVrSupported: boolean;
  immersiveArSupported: boolean;
  recommendedMode: XrSessionMode;
  deviceSummary: string;
}

export interface WebXrRigRefs {
  rigRoot: THREE.Group;
  leftControllerGroup: THREE.Group;
  rightControllerGroup: THREE.Group;
  leftLaserRay: THREE.Mesh;
  rightLaserRay: THREE.Mesh;
  reticleRing: THREE.Mesh;
  spatialHudBillboard: THREE.Group;
}

/**
 * Probes `navigator.xr` for native `immersive-vr` and `immersive-ar` headset support,
 * while always providing a 100% functional `SIMULATED_6DOF_SPATIAL` mode for desktop
 * and non-headset browsers.
 */
export async function probeWebXrHardwareSupport(): Promise<XrHardwareSupportStatus> {
  if (typeof navigator === 'undefined' || !('xr' in navigator) || !navigator.xr) {
    return {
      webXrApiAvailable: false,
      immersiveVrSupported: false,
      immersiveArSupported: false,
      recommendedMode: 'SIMULATED_6DOF_SPATIAL',
      deviceSummary:
        'Desktop 6DoF Spatial XR Simulator Ready (WebXR API emulated with Dual 6DoF Controllers)',
    };
  }

  let vr = false;
  let ar = false;
  try {
    vr = await navigator.xr.isSessionSupported('immersive-vr');
  } catch {
    vr = false;
  }
  try {
    ar = await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    ar = false;
  }

  const recommendedMode: XrSessionMode = vr
    ? 'IMMERSIVE_VR_HEADSET'
    : ar
    ? 'IMMERSIVE_AR_PASSTHROUGH'
    : 'SIMULATED_6DOF_SPATIAL';

  return {
    webXrApiAvailable: true,
    immersiveVrSupported: vr,
    immersiveArSupported: ar,
    recommendedMode,
    deviceSummary:
      vr && ar
        ? 'Native WebXR Headset Detected (Immersive VR + Passthrough AR Ready)'
        : vr
        ? 'Native WebXR VR Headset Detected (Immersive VR Ready)'
        : ar
        ? 'Native WebXR AR Device Detected (Immersive AR Passthrough Ready)'
        : 'WebXR Runtime Active — Using 6DoF Spatial Simulator & Dual Hand Controllers',
  };
}

/**
 * Builds the 3D WebXR Player Rig (`WebXrRigRefs`) containing:
 * - Left 6DoF Hand Controller (Cocking / Breech Pull / Explode Grip) + Emerald Laser Ray
 * - Right 6DoF Hand Controller (Primary Aim / Trigger Fire / Part Raycast) + Cyan Laser Ray
 * - 3D Spatial Target Reticle Ring
 */
export function createWebXrControllerRig3D(): WebXrRigRefs {
  const rigRoot = new THREE.Group();
  rigRoot.name = 'BAR250_WEBXR_6DOF_RIG';
  rigRoot.visible = false;

  const controllerBodyMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.28,
    metalness: 0.82,
  });
  const trackingRingMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.7,
  });
  const triggerGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.9,
  });

  const buildHandController = (isRight: boolean): { group: THREE.Group; ray: THREE.Mesh } => {
    const group = new THREE.Group();

    // Ergonomic 6DoF Grip Handle
    const handleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.13, 16),
      controllerBodyMat
    );
    handleMesh.rotation.x = Math.PI * 0.32;
    handleMesh.position.set(0, -0.035, 0.035);
    group.add(handleMesh);

    // Halo Tracking Ring (Quest Pro / Index / Vision Spatial style)
    const haloRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.044, 0.006, 12, 24),
      trackingRingMat
    );
    haloRing.rotation.x = Math.PI * 0.45;
    haloRing.position.set(0, 0.012, -0.015);
    group.add(haloRing);

    // Thumbstick + Index Trigger Button
    const thumbstick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.006, 0.018, 12),
      triggerGoldMat
    );
    thumbstick.position.set(isRight ? -0.008 : 0.008, 0.016, 0.005);
    group.add(thumbstick);

    const indexTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.024, 0.018),
      triggerGoldMat
    );
    indexTrigger.position.set(0, -0.018, -0.012);
    indexTrigger.rotation.x = -0.35;
    group.add(indexTrigger);

    // Forward Laser Pointer Ray (-Z axis)
    const rayLen = 2.4;
    const rayGeo = new THREE.CylinderGeometry(0.0018, 0.0028, rayLen, 10);
    rayGeo.rotateX(Math.PI / 2);
    rayGeo.translate(0, 0, -rayLen * 0.5);
    const rayMat = new THREE.MeshBasicMaterial({
      color: isRight ? 0x38bdf8 : 0x10b981,
      transparent: true,
      opacity: 0.72,
    });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    group.add(ray);

    return { group, ray };
  };

  const leftBuilt = buildHandController(false);
  const rightBuilt = buildHandController(true);

  const reticleRing = new THREE.Mesh(
    new THREE.RingGeometry(0.022, 0.032, 24),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    })
  );
  reticleRing.position.set(0, 2.15, 3.6);

  const spatialHudBillboard = new THREE.Group();
  const hudFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.12, 0.008),
    new THREE.MeshStandardMaterial({
      color: 0x09090b,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.75,
    })
  );
  spatialHudBillboard.add(hudFrame);
  spatialHudBillboard.position.set(-0.48, 2.45, 4.1);
  spatialHudBillboard.rotation.y = 0.28;

  rigRoot.add(
    leftBuilt.group,
    rightBuilt.group,
    reticleRing,
    spatialHudBillboard
  );

  return {
    rigRoot,
    leftControllerGroup: leftBuilt.group,
    rightControllerGroup: rightBuilt.group,
    leftLaserRay: leftBuilt.ray,
    rightLaserRay: rightBuilt.ray,
    reticleRing,
    spatialHudBillboard,
  };
}

/**
 * Updates the 3D WebXR Controllers and Spatial Reticle each frame when XR Mode is active.
 */
export function updateWebXrRigKinematics(
  xrRefs: WebXrRigRefs,
  camera: THREE.Camera,
  params: {
    xrMode: XrSessionMode;
    elapsedSec: number;
    recoilImpulse: number;
    pointerNdcX: number;
    pointerNdcY: number;
  }
): void {
  const isActive = params.xrMode !== 'OFF';
  xrRefs.rigRoot.visible = isActive;
  if (!isActive) return;

  // Position the 6DoF hands relative to the active camera so they track in both native WebXR and 6DoF Simulator
  const camPos = new THREE.Vector3();
  const camQuat = new THREE.Quaternion();
  camera.getWorldPosition(camPos);
  camera.getWorldQuaternion(camQuat);

  const leftOffset = new THREE.Vector3(
    -0.26 + params.pointerNdcX * 0.08,
    -0.22 + params.pointerNdcY * 0.06 + Math.sin(params.elapsedSec * 2.2) * 0.006,
    -0.46
  ).applyQuaternion(camQuat);

  const rightOffset = new THREE.Vector3(
    0.26 + params.pointerNdcX * 0.14,
    -0.21 + params.pointerNdcY * 0.12 - params.recoilImpulse * 0.04,
    -0.44 + params.recoilImpulse * 0.07
  ).applyQuaternion(camQuat);

  xrRefs.leftControllerGroup.position.copy(camPos).add(leftOffset);
  xrRefs.leftControllerGroup.quaternion.copy(camQuat);
  xrRefs.leftControllerGroup.rotateY(-0.12 + params.pointerNdcX * 0.18);
  xrRefs.leftControllerGroup.rotateX(params.pointerNdcY * 0.15);

  xrRefs.rightControllerGroup.position.copy(camPos).add(rightOffset);
  xrRefs.rightControllerGroup.quaternion.copy(camQuat);
  xrRefs.rightControllerGroup.rotateY(0.08 - params.pointerNdcX * 0.22);
  xrRefs.rightControllerGroup.rotateX(
    params.pointerNdcY * 0.22 + params.recoilImpulse * 0.18
  );

  // Project reticle 1.4m ahead of the right controller laser
  const reticleForward = new THREE.Vector3(0, 0, -1.35).applyQuaternion(
    xrRefs.rightControllerGroup.quaternion
  );
  xrRefs.reticleRing.position
    .copy(xrRefs.rightControllerGroup.position)
    .add(reticleForward);
  xrRefs.reticleRing.quaternion.copy(camQuat);

  // Float spatial telemetry frame slightly to upper-left of user's field of view
  const hudOffset = new THREE.Vector3(-0.52, 0.24, -1.15).applyQuaternion(camQuat);
  xrRefs.spatialHudBillboard.position.copy(camPos).add(hudOffset);
  xrRefs.spatialHudBillboard.quaternion.copy(camQuat);
}
