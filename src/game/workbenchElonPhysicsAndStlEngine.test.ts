import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  getWeaponUnique5StepAirflowProfile,
  computePartMaterialMassAndCollisionSpec,
  ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS,
  computeNonOverlappingExplodedTransform,
  runAgentPartResearchAndUpgrade,
  exportThreeObjectToWatertightStl,
  parseStlContentToMeshSummary,
  filterCuratedExternal3DStlParts,
} from './workbenchElonPhysicsAndStlEngine';
import { CANONICAL_7_WEAPONS_PROGRESSION } from './canonicalProgressionAndBlueprints';
import {
  buildModularAirgunMesh,
  apply3DFocusIsolationAndCentering,
  mountCustomStlBufferGeometryOnWeapon,
} from './weapon3d';
import { PRESET_LOADOUTS } from './partsCatalog';

test('Every canonical weapon (1 to 8) has a unique, agent-verified 5-Step Airflow & Thermodynamics profile', () => {
  const seenHeadlines = new Set<string>();
  for (const gun of CANONICAL_7_WEAPONS_PROGRESSION) {
    const profile = getWeaponUnique5StepAirflowProfile(gun.progressionId);
    assert.equal(profile.gunId, gun.progressionId);
    assert.equal(profile.steps.length, 5);
    assert.ok(profile.verifyingAgentName.length > 5);

    const maxFlowVel = Math.max(...profile.steps.map((s) => s.flowVelocityMs));
    const maxMach = Math.max(...profile.steps.map((s) => s.machNumber));
    const maxMassFlow = Math.max(...profile.steps.map((s) => s.massFlowRateGs));
    assert.ok(maxFlowVel >= 200);
    assert.ok(maxMach > 0.5);
    assert.ok(maxMassFlow > 5);

    const step4 = profile.steps[3];
    assert.ok(step4.agentVerificationNote.length > 15);
    seenHeadlines.add(`${gun.progressionId}:${step4.headline}`);
  }
  assert.equal(
    seenHeadlines.size,
    CANONICAL_7_WEAPONS_PROGRESSION.length,
    'All 8 weapons must have distinct Step 4 airflow headlines'
  );
});

test('Hyper-real part material density, volume, mass, weight, inertia, and collision clearance calculation', () => {
  const spec = computePartMaterialMassAndCollisionSpec(
    {
      subIndex: 0,
      code: 'ASC45-09-OTB-PLENUM',
      name: 'Concentric Over-the-Barrel 140cc Regulated Plenum',
      dimensionsMm: '420mm × Ø38.0mm OD × Ø16.0mm ID',
      toleranceMm: '±0.025mm',
      material: '7075-T651 Aerospace Aluminum + Dual FKM-90 Viton O-Rings',
      pressureBar: 210,
      engineeringFunction: 'Stores 140cc of 210-Bar regulated air concentrically around the barrel liner.',
      assignedAgent: 'GD-Agent-08',
    },
    'FOCUS_PLENUM',
    0
  );

  assert.equal(spec.materialSpec.materialId, 'AL_7075_T6');
  assert.equal(spec.materialSpec.densityGPerCm3, 2.81);
  assert.ok(spec.solidVolumeCm3 > 100);
  assert.ok(spec.massGrams > 280);
  assert.ok(spec.weightNewtons > 2.5);
  assert.ok(spec.hoopOrContactSafetyFactor >= 1.5);
  assert.ok(spec.minNeighborClearanceMm >= 0.01);
});

test('Ascent .45 Quattro 2-Stage Match Trigger and Compound 4-Bar 300B Pump have 7 complete sub-mechanisms', () => {
  assert.equal(ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS.length, 7);
  const triggerParts = ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS.filter((c) =>
    c.componentCode.includes('TRIG')
  );
  const pumpParts = ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS.filter((c) =>
    c.componentCode.includes('PUMP')
  );
  assert.equal(triggerParts.length, 5);
  assert.equal(pumpParts.length, 2);
  for (const comp of ASCENT_TRIGGER_AND_PUMP_7_COMPONENTS) {
    assert.ok(comp.densityGPerCm3 > 1.0);
    assert.ok(comp.massGrams > 1.0);
    assert.ok(comp.clearanceMm.length > 5);
  }
});

test('Non-overlapping exploded part transform guarantees positive clearance and natural disassembly vectors', () => {
  const sampleSubComp = {
    subIndex: 0,
    code: 'L2-BREECH-01',
    name: 'Upper Monoblock Receiver',
    dimensionsMm: '185mm × 42mm × 34mm',
    toleranceMm: '±0.020mm',
    material: '7075-T6 Billet',
    pressureBar: 300,
    engineeringFunction: 'Holds barrel and rotary magazine.',
    assignedAgent: 'GD-Agent-04',
  };
  const child0 = computeNonOverlappingExplodedTransform(
    sampleSubComp,
    0,
    4,
    'FOCUS_BREECH',
    0.72,
    false
  );
  const child3 = computeNonOverlappingExplodedTransform(
    sampleSubComp,
    3,
    4,
    'FOCUS_BREECH',
    0.72,
    true
  );
  assert.notEqual(child0.offsetMeters.z, child3.offsetMeters.z);
  assert.ok(child3.clearanceGapMm >= 10);
});

test('Agent custom-prompt part research upgrades material, physics telemetry, and synthesizes watertight STL', () => {
  const result = runAgentPartResearchAndUpgrade({
    subComp: {
      subIndex: 0,
      code: 'L2-03-EAR-SPOOL',
      name: 'Hammerless EAR Spool Valve',
      dimensionsMm: '24.5mm × Ø11.0mm × Ø4.0mm',
      toleranceMm: '±0.005mm',
      material: 'PEEK-GF30 + Titanium Grade 5',
      pressureBar: 300,
      engineeringFunction: '1.4ms differential exhaust pilot valve.',
      assignedAgent: 'GD-Agent-04',
    },
    focusCategory: 'FOCUS_POPPET',
    gunTitle: '#04 EDgun Leshiy 2',
    customPrompt:
      'Upgrade to Titanium Ti-6Al-4V with 300-Bar fatigue life and sub-millimeter tolerances',
  });

  assert.equal(result.partCode, 'L2-03-EAR-SPOOL');
  assert.ok(result.updatedMaterialSpec.includes('Ti-6Al-4V'));
  assert.ok(result.triangleCount > 20);
  assert.ok(result.watertightStlAscii.includes('solid L2-03-EAR-SPOOL_AGENT_REV'));
  assert.ok(result.watertightStlAscii.includes('endsolid L2-03-EAR-SPOOL_AGENT_REV'));
});

test('Export any Three.js 3D object to watertight STL and re-import ASCII STL into Float32Array geometry', () => {
  const refs = buildModularAirgunMesh(PRESET_LOADOUTS[0], false, 7.62, {
    familyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    leshiyFolded: false,
  });

  // Verify Breech isolation with null subComponentIdx keeps rotary drum cassette intact (no staircase hallucination)
  apply3DFocusIsolationAndCentering(refs, 'FOCUS_BREECH', null);
  assert.equal(refs.rotaryMagGroup.visible, true);
  assert.equal(refs.otbShroudGroup.visible, false);

  const exported = exportThreeObjectToWatertightStl(
    refs.rotaryMagGroup,
    'LESHIY_2_BREECH_GROUP'
  );
  assert.ok(exported.triangleCount >= 40);
  assert.ok(exported.stlAscii.startsWith('solid LESHIY_2_BREECH_GROUP'));

  // Parse the exported STL back via parseStlContentToMeshSummary
  const imported = parseStlContentToMeshSummary(
    exported.stlAscii,
    'leshiy_2_breech_group.stl',
    'AL_7075_T6'
  );
  assert.equal(imported.format, 'ASCII_STL');
  assert.equal(imported.triangleCount, exported.triangleCount);
  assert.equal(imported.positionsFloat32.length, exported.triangleCount * 9);
  assert.ok(imported.boundingBoxMm.xMm > 5);

  // Mount imported custom STL geometry onto the live 3D weapon
  const mountedMesh = mountCustomStlBufferGeometryOnWeapon(
    refs,
    imported.positionsFloat32,
    'Custom Imported Breech STL'
  );
  assert.ok(mountedMesh instanceof THREE.Mesh);
  assert.equal(mountedMesh.userData.isMountedExternalStl, true);
});

test('HuggingFace 3D Hub & Thingiverse external 3D STL part search filters accurately', () => {
  const allParts = filterCuratedExternal3DStlParts('', 'ALL');
  assert.ok(allParts.length >= 6);

  const hfOnly = filterCuratedExternal3DStlParts('Leshiy', 'HUGGINGFACE_3D_HUB');
  assert.ok(hfOnly.length >= 1);
  assert.equal(hfOnly[0].sourcePlatform, 'HUGGINGFACE_3D_HUB');
});
