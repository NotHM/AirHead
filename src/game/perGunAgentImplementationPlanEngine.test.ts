import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  getPerWeapon3DFocusCategories,
  generateAndRunAllPerGunImplementationPlans,
} from './perGunAgentImplementationPlanEngine';
import {
  createWebXrControllerRig3D,
  updateWebXrRigKinematics,
} from './webXrSpatialEngine';
import {
  AIRGUN_MECHANICS_VIDEO_LIBRARY,
  WEAPON_AIRFLOW_AND_CYCLE_PROFILES,
} from './airgunVideoTranscriptionStudio';
import { CANONICAL_7_WEAPONS_PROGRESSION } from './canonicalProgressionAndBlueprints';
import { generateAutomatedEngineeringBlueprintSpec } from './automatedBlueprintGenerator';
import { SavedWeaponVersion } from './popular25Catalog';

describe('Per-Airgun 3D Focus De-Hallucination & Automated Agent Implementation Plans', () => {
  it('tailors 3D Focus categories per airgun and prunes non-existent hallucinated rifle parts', () => {
    const penFocus = getPerWeapon3DFocusCategories('GUN_01_PEN');
    const penIds = penFocus.categories.map((c) => c.id);
    assert.ok(penIds.includes('FULL_SIDE_PROFILE'));
    assert.ok(penIds.includes('FOCUS_MAG'));
    assert.ok(
      !penIds.includes('FOCUS_FOREGRIP'),
      '#01 Mongo Pen Gun must not show a Foregrip Pump focus tab'
    );
    assert.ok(
      !penIds.includes('FOCUS_PLENUM'),
      '#01 Mongo Pen Gun must not show a Plenum & Regulator focus tab'
    );
    assert.ok(penFocus.prunedHallucinatedCategories.length >= 4);

    const defenderFocus = getPerWeapon3DFocusCategories('GUN_03_DEFENDER');
    const defenderIds = defenderFocus.categories.map((c) => c.id);
    assert.ok(defenderIds.includes('FOCUS_BREECH'));
    assert.ok(
      !defenderIds.includes('FOCUS_STOCK'),
      '#03 Double Barrel Defender pistol must not show a Stock tab'
    );

    const ascentFocus = getPerWeapon3DFocusCategories('GUN_07_ASCENT45');
    const ascentIds = ascentFocus.categories.map((c) => c.id);
    assert.ok(
      ascentIds.includes('FOCUS_FOREGRIP'),
      '#08 Ascent .45 300B must include its 4-Bar 3-Stage Foregrip Pump focus tab'
    );
    assert.ok(ascentIds.includes('FOCUS_STOCK'));
  });

  it('automates creating and running 5-step Agent Implementation Plans for all 9 canonical guns', () => {
    const plansMap = generateAndRunAllPerGunImplementationPlans();
    const plans = Object.values(plansMap);
    assert.equal(plans.length, 9);
    for (const plan of plans) {
      assert.equal(plan.overallStatus, 'COMPLETED_VERIFIED');
      assert.equal(plan.steps.length, 5);
      for (const step of plan.steps) {
        assert.equal(step.status, 'VERIFIED_PASS');
        assert.ok(step.cadAndPhysicsAction.length > 10);
      }
    }
  });

  it('builds and updates the WebXR 6DoF Dual-Hand Controller Rig kinematics cleanly', () => {
    const rig = createWebXrControllerRig3D();
    const cam = new THREE.PerspectiveCamera(70, 1.77, 0.1, 100);
    cam.position.set(0, 1.65, 5);
    cam.updateMatrixWorld();
    assert.equal(rig.rigRoot.visible, false);

    updateWebXrRigKinematics(rig, cam, {
      xrMode: 'SIMULATED_6DOF_SPATIAL',
      elapsedSec: 1.25,
      recoilImpulse: 0.4,
      pointerNdcX: 0.1,
      pointerNdcY: -0.05,
    });
    assert.equal(rig.rigRoot.visible, true);
    assert.ok(rig.rightControllerGroup.position.y > 0);
  });

  it('integrates all 4 YouTube reference videos (x9-JjJuyLOs, x0ghlafy-AM, x9feufnloKc, jgDYcypjHeI) and enforces 0cc plenum / 0-baffle direct cartridge dump specs', () => {
    const videoIds = AIRGUN_MECHANICS_VIDEO_LIBRARY.map((v) => v.videoId);
    for (const requiredId of ['x9-JjJuyLOs', 'x0ghlafy-AM', 'x9feufnloKc', 'jgDYcypjHeI']) {
      assert.ok(
        videoIds.includes(requiredId),
        `Expected AIRGUN_MECHANICS_VIDEO_LIBRARY to include YouTube video ${requiredId}`
      );
    }

    const burstProfile = WEAPON_AIRFLOW_AND_CYCLE_PROFILES.SHOTGUN_BURST_CARTRIDGE_FAMILY;
    for (const stage of burstProfile.stages) {
      assert.equal(
        stage.pressureZonesBar.plenumBar,
        0,
        'Burst-disk cartridge family must report 0 Bar regulated plenum (direct cartridge dump)'
      );
    }

    const penGun = CANONICAL_7_WEAPONS_PROGRESSION.find((g) => g.progressionId === 'GUN_01_PEN');
    assert.ok(penGun);
    assert.equal(penGun.operatingPressureBar, 310);

    const mockPenVersion: SavedWeaponVersion = {
      versionId: 'ver_v1_pen_gun',
      versionTag: 'v1.0',
      customName: '#01 Mongo Pen Gun',
      createdAtIso: '2026-11-10T00:00:00Z',
      upperPlatformId: 'plat_20_texoma_pellet_pen',
      lowerPlatformId: 'plat_20_texoma_pellet_pen',
      dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
      bridgePortAdapterPrinted: true,
      adapterPolymer: 'CNC_7075_HYBRID',
      wallThicknessMm: 3.5,
      gyroidInfillPct: 100,
      regulatorSetpointBar: 310,
      computedMuzzleVelocityMs: 245,
      computedEnergyJoules: 165,
      hoopStressSafetyFactor: 2.8,
    };

    const penSpec = generateAutomatedEngineeringBlueprintSpec(mockPenVersion, penGun);
    assert.equal(penSpec.plenumVolumeCc, 0);
    assert.equal(penSpec.baffleCount, 0);
    assert.equal(penSpec.operatingPressureBar, 310);
  });
});

