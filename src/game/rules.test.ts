import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getWasmKernel,
  equalizeAndRegulateZones,
  simulatePneumaticShot,
  simulatePumpStroke,
} from '../wasm/pneumaticWasm';
import {
  PRESET_LOADOUTS,
  computeWeaponStats,
  createInitialPneumaticState,
} from './partsCatalog';
import {
  generateRandomArena,
  collidesWithArenaWalls,
  stepArenaEnemies,
} from './rules';

test('WebAssembly pneumatic kernel computes kinetic energy and pump stroke delta accurately', () => {
  const kernel = getWasmKernel();
  // 38 grain slug at 275 m/s -> ~93.1 Joules
  const joules = kernel.wasm_kinetic_joules(38, 275);
  assert.ok(joules > 90 && joules < 96, `Expected ~93J, got ${joules}`);

  // Pump delta bar: 4200 cc swept into 200 cc reservoir at 0.95 efficiency -> ~19.95 bar
  const deltaBar = kernel.wasm_pump_delta_bar(4200, 200, 0.95);
  assert.ok(deltaBar > 19.5 && deltaBar < 20.5, `Expected ~19.95 bar, got ${deltaBar}`);
});

test('4-Zone Pneumatic Architecture enforces Cam-Lock Foregrip safety and Priority Isolation Check Block refill', () => {
  const rifleLoadout = PRESET_LOADOUTS[0];
  const stats = computeWeaponStats(rifleLoadout);
  let state = createInitialPneumaticState(rifleLoadout);

  assert.equal(state.foregripCamPosition, 'SIDE_LOCKED_3_OCLOCK');
  assert.equal(state.plenumPressureBar, 150);

  // Firing while locked at 3 o'clock succeeds and recharges plenum from reservoirs
  const shot1 = simulatePneumaticShot(state, {
    barrelLengthMm: stats.barrelLengthMm,
    caliberMm: stats.caliberMm,
    projectileMassGrains: stats.projectileMassGrains,
    pelletCount: stats.pelletCount,
  });
  assert.equal(shot1.fired, true);
  assert.ok(shot1.muzzleVelocityMs > 200);
  assert.equal(shot1.nextState.magazineLoaded, state.magazineLoaded - 1);
  // Plenum automatically stepped back up toward 145 bar via Priority Isolation Check Block
  assert.ok(shot1.nextState.plenumPressureBar > 135);

  // Attempting to pump while locked at 3 o'clock is blocked by the Interrupted-Lug Cam Collar
  const blockedPump = simulatePumpStroke(shot1.nextState, 'PULL');
  assert.equal(blockedPump.pumped, false);

  // Unlock Foregrip to 6 o'clock Pumping Mode
  state = {
    ...shot1.nextState,
    foregripCamPosition: 'BOTTOM_UNLOCKED_6_OCLOCK',
    buttstockPressureBar: 190,
    otbPressureBar: 190,
    foregripPressureBar: 190,
  };

  // Attempting to fire while unlocked at 6 o'clock is blocked
  const blockedShot = simulatePneumaticShot(state, {
    barrelLengthMm: stats.barrelLengthMm,
    caliberMm: stats.caliberMm,
    projectileMassGrains: stats.projectileMassGrains,
    pelletCount: stats.pelletCount,
  });
  assert.equal(blockedShot.fired, false);

  // Bi-directional Pull stroke charges Buttstock Reservoir
  const pullRes = simulatePumpStroke(state, 'PULL');
  assert.equal(pullRes.pumped, true);
  assert.ok(pullRes.nextState.buttstockPressureBar > 190);

  // Bi-directional Push stroke charges OTB Shroud & Foregrip Bottle
  const pushRes = simulatePumpStroke(pullRes.nextState, 'PUSH');
  assert.equal(pushRes.pumped, true);
  assert.ok(pushRes.nextState.otbPressureBar > 190);
  assert.ok(pushRes.nextState.foregripPressureBar > 190);
});

test('Priority Isolation Check Block isolates Foregrip tank when rotated to 6 o\'clock', () => {
  const loadout = PRESET_LOADOUTS[0];
  let state = createInitialPneumaticState(loadout);
  state.otbPressureBar = 100;
  state.buttstockPressureBar = 100;
  state.foregripPressureBar = 230; // Only foregrip has high pressure
  state.plenumPressureBar = 80;
  state.foregripCamPosition = 'BOTTOM_UNLOCKED_6_OCLOCK'; // Coaxial swivel port disconnected from main bus

  const isolated = equalizeAndRegulateZones(state);
  assert.equal(isolated.foregripPressureBar, 230); // Foregrip did not drain

  // Rotate to 3 o'clock -> Coaxial swivel aligns and feeds regulator into plenum
  state.foregripCamPosition = 'SIDE_LOCKED_3_OCLOCK';
  const connected = equalizeAndRegulateZones(state);
  assert.ok(connected.plenumPressureBar > 120);
  assert.ok(connected.foregripPressureBar < 230);
});

test('Random Arena generator creates open player spawn facing clear vista and 3 enemy archetypes', () => {
  const map = generateRandomArena(4242, 1);
  // Player spawn must not collide with walls
  assert.equal(
    collidesWithArenaWalls(map, map.playerSpawn.x, map.playerSpawn.z, 0.5),
    false
  );
  // Tile directly ahead of player spawn (-Z direction) must also be open
  assert.equal(
    collidesWithArenaWalls(map, map.playerSpawn.x, map.playerSpawn.z - 4.0, 0.5),
    false
  );
  // All 3 enemy archetypes exist
  const types = new Set(map.enemies.map((e) => e.archetype));
  assert.equal(types.has('SWARMER_SCOUT'), true);
  assert.equal(types.has('KITER_SNIPER_DRONE'), true);
  // Stepping enemies advances their positions without throwing
  const stepResult = stepArenaEnemies(map.enemies, map, map.playerSpawn, 0.05);
  assert.equal(typeof stepResult.playerDamageTaken, 'number');
});

test('25 Popular Airguns catalog includes requested platforms, burst disks, and cached HuggingFace physics + STL export', async () => {
  const {
    POPULAR_25_AIRGUNS,
    runCachedPhysicsSimulation,
    generatePrintableStlString,
  } = await import('./popular25Catalog');

  assert.equal(POPULAR_25_AIRGUNS.length, 25);
  const ids = new Set(POPULAR_25_AIRGUNS.map((p) => p.id));
  assert.equal(ids.has('plat_12_hatsan_blitz'), true);
  assert.equal(ids.has('plat_13_hatsan_invader'), true);
  assert.equal(ids.has('plat_14_western_sidewinder'), true);
  assert.equal(ids.has('plat_15_evanix_mp30'), true);
  assert.equal(ids.has('plat_16_bintac_t9'), true);
  assert.equal(ids.has('plat_17_bintac_t50_extreme'), true);
  assert.equal(ids.has('plat_18_evanix_viper'), true);
  assert.equal(ids.has('plat_11_huben_gk1'), true);
  assert.equal(ids.has('plat_19_pneumatic_welrod'), true);
  assert.equal(ids.has('plat_20_texoma_pellet_pen'), true);
  assert.equal(ids.has('plat_21_aea_airgun_cane'), true);

  const sim1 = runCachedPhysicsSimulation({
    upperPlatformId: 'plat_14_western_sidewinder',
    lowerPlatformId: 'plat_17_bintac_t50_extreme',
    dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
    adapterPolymer: 'PA12_CF_CARBON_NYLON',
    wallThicknessMm: 5.5,
    gyroidInfillPct: 65,
    operatingPressureBar: 250,
    hfModelName: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD',
  });
  assert.equal(sim1.fromCache, false);
  assert.ok(sim1.predictedMuzzleVelocityMs > 180);
  assert.ok(sim1.gelPenetrationCm > 10);

  // Second call with identical inputs hits the local simulation cache
  const sim2 = runCachedPhysicsSimulation({
    upperPlatformId: 'plat_14_western_sidewinder',
    lowerPlatformId: 'plat_17_bintac_t50_extreme',
    dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
    adapterPolymer: 'PA12_CF_CARBON_NYLON',
    wallThicknessMm: 5.5,
    gyroidInfillPct: 65,
    operatingPressureBar: 250,
    hfModelName: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD',
  });
  assert.equal(sim2.fromCache, true);
  assert.equal(sim2.cacheKey, sim1.cacheKey);

  const stl = generatePrintableStlString({
    partName: 'Sidewinder_to_BinTacT50_Adapter',
    upperPort: 'M18x1.5_DIN_300BAR',
    lowerPort: 'COAXIAL_DUAL_PTFE_SWIVEL',
    wallThicknessMm: 5.5,
  });
  assert.ok(stl.startsWith('solid Sidewinder_to_BinTacT50_Adapter'));
  assert.ok(stl.includes('facet normal'));
  assert.ok(stl.trim().endsWith('endsolid Sidewinder_to_BinTacT50_Adapter_CONNECTOR_PORT_BRIDGE_MANIFOLD'));
});

test('Rust/Physics CAD engine autonomously re-bores .25 cal OTB barrel & air shroud to .30 cal and .45 cal while preserving volume and Lamé safety factor', async () => {
  const { synthesizeOtbBarrelAndCadPart } = await import('../wasm/pneumaticWasm');
  const { PRINTABLE_CAD_SUBSYSTEMS, generatePrintableStlString } = await import('./popular25Catalog');

  const native25 = synthesizeOtbBarrelAndCadPart({
    nativeCaliberMm: 6.35,
    targetCaliberMm: 6.35,
    barrelLengthMm: 600,
    targetOtbVolumeCc: 307,
    maxOperatingBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });
  assert.equal(native25.wasReboredByCadEngine, false);

  const rebored30 = synthesizeOtbBarrelAndCadPart({
    nativeCaliberMm: 6.35,
    targetCaliberMm: 7.62, // .30 cal
    barrelLengthMm: 600,
    targetOtbVolumeCc: 307,
    maxOperatingBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });
  assert.equal(rebored30.wasReboredByCadEngine, true);
  assert.ok(rebored30.linerOuterDiameterMm > native25.linerOuterDiameterMm);
  assert.ok(rebored30.otbShroudOuterDiameterMm > native25.otbShroudOuterDiameterMm);
  assert.equal(rebored30.preservedAnnularVolumeCc, 307);
  assert.ok(rebored30.safetyFactor >= 1.8);

  const rebored45 = synthesizeOtbBarrelAndCadPart({
    nativeCaliberMm: 6.35,
    targetCaliberMm: 11.43, // .45 cal
    barrelLengthMm: 600,
    targetOtbVolumeCc: 307,
    maxOperatingBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });
  assert.equal(rebored45.wasReboredByCadEngine, true);
  assert.ok(rebored45.otbShroudInnerDiameterMm > rebored30.otbShroudInnerDiameterMm);
  assert.ok(rebored45.otbShroudOuterDiameterMm > rebored30.otbShroudOuterDiameterMm);
  assert.equal(rebored45.preservedAnnularVolumeCc, 307);
  assert.ok(rebored45.safetyFactor >= 1.8);

  // Verify all 6 printable subsystems generate watertight manifold STL solids
  assert.equal(PRINTABLE_CAD_SUBSYSTEMS.length, 6);
  for (const sub of PRINTABLE_CAD_SUBSYSTEMS) {
    const subStl = generatePrintableStlString({
      partName: 'FX_DRS_Rebored45',
      upperPort: 'M18x1.5_DIN_300BAR',
      lowerPort: 'COAXIAL_DUAL_PTFE_SWIVEL',
      wallThicknessMm: 5.5,
      subsystemType: sub.id,
      otbCadSpec: rebored45,
    });
    const facetMatches = subStl.match(/facet normal/g) || [];
    assert.ok(
      facetMatches.length >= 384,
      `Expected >= 384 watertight facets for ${sub.id}, got ${facetMatches.length}`
    );
  }
});

test('EDgun Leshiy 2 Valkyrie Open-Breech Agent Remake Benchmark dynamically scales scalloped drum, star ratchet, red puck, and coil-sprung pawl from .22 to .50 cal', async () => {
  const { synthesizeLeshiy2OpenBreechBenchmark } = await import('../wasm/pneumaticWasm');

  const cal25 = synthesizeLeshiy2OpenBreechBenchmark({
    targetCaliberMm: 6.35,
    operatingPressureBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });
  assert.equal(cal25.rotaryChamberCount, 8);
  assert.equal(cal25.starRatchetToothCount, 8);
  assert.equal(cal25.ratchetStepAngleDeg, 45);
  assert.ok(cal25.interChamberWebMm >= 2.15);

  const cal357 = synthesizeLeshiy2OpenBreechBenchmark({
    targetCaliberMm: 9.0,
    operatingPressureBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });
  assert.equal(cal357.rotaryChamberCount, 7);
  assert.equal(cal357.starRatchetToothCount, 7);
  assert.ok(cal357.interChamberWebMm >= 2.15);

  const cal45 = synthesizeLeshiy2OpenBreechBenchmark({
    targetCaliberMm: 11.43,
    operatingPressureBar: 250,
    material: 'PEEK_GF30_AEROSPACE',
  });
  assert.equal(cal45.rotaryChamberCount, 6);
  assert.equal(cal45.ratchetStepAngleDeg, 60);
  assert.ok(cal45.puckInnerVenturiMm > cal25.puckInnerVenturiMm);
  assert.ok(cal45.indexingPawlStrokeMm > cal25.indexingPawlStrokeMm);

  const cal50 = synthesizeLeshiy2OpenBreechBenchmark({
    targetCaliberMm: 12.7,
    operatingPressureBar: 250,
    material: 'CNC_7075_HYBRID',
  });
  assert.equal(cal50.rotaryChamberCount, 5);
  assert.equal(cal50.ratchetStepAngleDeg, 72);
  assert.ok(cal50.interChamberWebMm >= 2.15);
  assert.ok(cal50.hingeShearSafetyFactor > 1.2);
});

test('Evanix REX-P 57-Part Korean Blueprint catalog, 10 collectible schematics, and in-game Local Code Part Compiler work end-to-end', async () => {
  const {
    REX_P_57_PARTS_CATALOG,
    REX_P_6_INTERACTION_STAGES,
    REX_P_8_STEP_DISASSEMBLY_SEQUENCE,
    IN_GAME_WEAPON_SCHEMATICS,
    executeLocalPartBuildCode,
  } = await import('./rexPCatalog');

  assert.equal(REX_P_57_PARTS_CATALOG.length, 59);
  assert.equal(REX_P_6_INTERACTION_STAGES.length, 6);
  assert.equal(REX_P_8_STEP_DISASSEMBLY_SEQUENCE.length, 8);
  assert.equal(IN_GAME_WEAPON_SCHEMATICS.length, 10);

  const breechSlide11 = REX_P_57_PARTS_CATALOG.find((p) => p.partNumber === '#11');
  assert.ok(breechSlide11);
  assert.equal(breechSlide11.initialStatus, 'NEEDS_BUILD');

  const compiled = executeLocalPartBuildCode({
    part: breechSlide11,
    targetCaliberMm: 7.62,
    operatingPressureBar: 250,
    polymerOrAlloy: 'CNC_7075_HYBRID',
  });
  assert.equal(compiled.partNumber, '#11');
  assert.equal(compiled.statusAfterBuild, 'BUILT_BY_LOCAL_CODE');
  assert.ok(compiled.watertightFacets >= 384);
  assert.ok(compiled.computedSafetyFactor >= 1.5);
  assert.ok(compiled.generatedStlHeader.includes('solid REXP_PART_11'));
});

test('Phase 4 SDF Thread + .GCODE Slicer Export and all 14 CAD & Weapon Roadmap Phases are COMPLETED_IN_ENGINE', async () => {
  const {
    GENERATIVE_CAD_ROADMAP_PHASES,
    generateSdfHelicalThreadAndGcode,
  } = await import('./popular25Catalog');

  assert.equal(GENERATIVE_CAD_ROADMAP_PHASES.length, 39);
  for (const phase of GENERATIVE_CAD_ROADMAP_PHASES) {
    assert.equal(
      phase.status,
      'COMPLETED_IN_ENGINE',
      `Expected ${phase.phaseCode} to be COMPLETED_IN_ENGINE`
    );
  }

  const sdfRes = generateSdfHelicalThreadAndGcode({
    partName: 'REX_P_M28x125_Adapter',
    threadStandard: 'M18x1.5_DIN_300BAR',
    targetCaliberMm: 7.62,
    polymerMaterial: 'PA12_CF_CARBON_NYLON',
    wallThicknessMm: 5.5,
    gyroidInfillPct: 75,
  });
  assert.equal(sdfRes.concentricSealLoops, 6);
  assert.ok(sdfRes.gcodeString.includes('; BAR-250 PHASE 4 SDF HELICAL THREAD'));
  assert.ok(sdfRes.gcodeString.includes('M104 S285'));
});

test('General-Purpose Expert Agents hire Executive Bosses, author Sub-Skills, write SMART Goals, and synthesize directives from user chat', async () => {
  const {
    evaluateMultiAgentEngineeringSuite,
    synthesizeDynamicDirectiveFromUserChat,
  } = await import('../agents/pneumaticCadAgents');
  const { runCachedPhysicsSimulation } = await import('./popular25Catalog');

  const simResult = runCachedPhysicsSimulation({
    upperPlatformId: 'plat_22_fx_panthera',
    lowerPlatformId: 'plat_22_fx_panthera',
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
    adapterPolymer: 'CNC_7075_HYBRID',
    wallThicknessMm: 5.5,
    gyroidInfillPct: 80,
    operatingPressureBar: 250,
    hfModelName: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD',
    customCaliberOverrideMm: 7.62,
  });

  const suite = evaluateMultiAgentEngineeringSuite({
    loadout: PRESET_LOADOUTS[0],
    pneumaticState: createInitialPneumaticState(PRESET_LOADOUTS[0]),
    simResult,
    upperPlatformId: 'plat_22_fx_panthera',
    lowerPlatformId: 'plat_22_fx_panthera',
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
  });

  assert.equal(suite.agents.length, 5);
  assert.ok(suite.hiredBosses.length >= 3);
  assert.ok(suite.authoredSubSkills.length >= 3);
  assert.ok(suite.smartGoals.length >= 4);
  assert.ok(suite.taskBacklog.length >= 5);
  assert.ok(suite.chatIngestionLog.length >= 4);

  const dynamic = synthesizeDynamicDirectiveFromUserChat(
    'Machine a titanium #32 Poppet Valve and #14 5-Hole Underlever for .30 cal REX-P',
    1
  );
  assert.ok(dynamic.newBoss.bossTitle.startsWith('BOSS-'));
  assert.ok(dynamic.newSubSkill.skillFolderName.includes('/agent/skills/'));
  assert.equal(dynamic.newSmartGoal.progressPct, 100);
  assert.equal(dynamic.newTask.status, 'COMPLETED');
});

test('Weapon Families, Compatibility Index (0% Isolated Burst-Disk vs Regulated PCPs), P90 .45 Helical-Turret + Plenum Reserve, REX-P 1-Shot, MP30 Fixed Handle, and Leshiy 3 .45 capacities work accurately', async () => {
  const {
    BASE_WEAPON_FAMILIES,
    BURST_DISK_4_STAGE_EVOLUTION,
    P90_45_HELICAL_PLENUM_MAG_SUBSYSTEMS,
    computeAccurateMagCapacityByWeaponAndCaliber,
    evaluateWeaponFamilyCompatibility,
  } = await import('./weaponFamiliesAndCompatibility');

  assert.equal(Object.keys(BASE_WEAPON_FAMILIES).length, 7);
  assert.equal(Object.keys(BURST_DISK_4_STAGE_EVOLUTION).length, 4);
  assert.equal(P90_45_HELICAL_PLENUM_MAG_SUBSYSTEMS.length, 6);

  // 1. P90 .45 Top Helical-Turret Magazine + 145cc Plenum Reserve -> 22 Rds at .45 Cal
  const p90Cap45 = computeAccurateMagCapacityByWeaponAndCaliber(
    'P90_45_TOP_HELICAL_PLENUM_FAMILY',
    11.43
  );
  assert.equal(p90Cap45.exactCapacity, 22);
  assert.ok(p90Cap45.capacityDisplayBadge.includes('22 Rds'));

  // 2. Burst-Disk Shotgun/Pen/2-Shell/Cane family is 0% cross-compatible with regulated PCPs
  const isolatedCheck = evaluateWeaponFamilyCompatibility(
    'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY'
  );
  assert.equal(isolatedCheck.compatible, false);
  assert.equal(isolatedCheck.compatibilityScorePct, 0);

  // 3. Stage 2 Simple Red Air Pen is 1-Shot Capsule, Stage 3 AEA Shotgun is 2 Pre-Charged Shells
  const penCap = computeAccurateMagCapacityByWeaponAndCaliber(
    'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    6.35,
    'STAGE_2_SIMPLE_RED_AIR_PEN'
  );
  assert.equal(penCap.exactCapacity, 1);

  const twoShellCap = computeAccurateMagCapacityByWeaponAndCaliber(
    'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    12.7,
    'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL'
  );
  assert.equal(twoShellCap.exactCapacity, 2);

  // 4. Evanix REX-P is strictly a 1-Shot Single-Load Coaxial Pistol/Sniper across all calibers
  const rexCap = computeAccurateMagCapacityByWeaponAndCaliber(
    'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
    9.0
  );
  assert.equal(rexCap.exactCapacity, 1);

  // 5. Evanix MP30 Fixed-Handle SMG scales double-stack magazine accurately (.30 cal = 12 Rds)
  const mp30Cap30 = computeAccurateMagCapacityByWeaponAndCaliber(
    'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
    7.62
  );
  assert.equal(mp30Cap30.exactCapacity, 12);

  // 6. EDgun Leshiy 3 .45 Semi-Auto Compact Rifle has 6-Rd Scalloped Rotary Drum at .45 Cal
  const leshiy3Cap45 = computeAccurateMagCapacityByWeaponAndCaliber(
    'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY',
    11.43
  );
  assert.equal(leshiy3Cap45.exactCapacity, 6);
});

test('8-Model Interactive Sub-Component, O-Ring & Real-Physics Benchmark Suite provides Parker O-ring gland squeeze and caliber remake matrices for all 8 models', async () => {
  const { INTERACTIVE_WEAPON_BENCHMARK_MODELS } = await import(
    './interactiveModelBenchmarks'
  );

  assert.equal(INTERACTIVE_WEAPON_BENCHMARK_MODELS.length, 8);
  for (const model of INTERACTIVE_WEAPON_BENCHMARK_MODELS) {
    assert.ok(
      model.subComponentsAndOrings.length >= 3,
      `Expected >= 3 sub-components/O-rings for ${model.modelId}`
    );
    assert.ok(model.caliberRemakeMatrix.length >= 3);
    for (const part of model.subComponentsAndOrings) {
      assert.ok(part.realPhysicsSpec.squeezeOrClearancePct.length > 5);
      assert.ok(part.realPhysicsSpec.governingEquation.length > 10);
      assert.ok(part.realPhysicsSpec.failureModeIfOmitted.length > 10);
    }
  }
});

test('Redesigned Ascent × Hatsan Vectis .45 Cal persists all 12 parts, 140cc Over-Barrel 2+ Rd Plenum + Silencer, and 300-Bar Under-Barrel Pump up to 300 Bar', async () => {
  const {
    ASCENT_45_300BAR_12_PARTS_CATALOG,
    BASE_WEAPON_FAMILIES,
    computeAccurateMagCapacityByWeaponAndCaliber,
  } = await import('./weaponFamiliesAndCompatibility');
  const { simulateAscentPumpStrokeTo300Bar } = await import('../wasm/pneumaticWasm');

  assert.equal(ASCENT_45_300BAR_12_PARTS_CATALOG.length, 12);
  assert.equal(
    BASE_WEAPON_FAMILIES.ASCENT_3STAGE_ONBOARD_PUMP_FAMILY.defaultCaliberMm,
    11.43
  );

  // Verify reference diagram rotary mag capacities (14/.177, 12/.22, 10/.25) + .45 Cal (6 Rds)
  assert.equal(
    computeAccurateMagCapacityByWeaponAndCaliber('ASCENT_3STAGE_ONBOARD_PUMP_FAMILY', 4.5)
      .exactCapacity,
    14
  );
  assert.equal(
    computeAccurateMagCapacityByWeaponAndCaliber('ASCENT_3STAGE_ONBOARD_PUMP_FAMILY', 5.5)
      .exactCapacity,
    12
  );
  assert.equal(
    computeAccurateMagCapacityByWeaponAndCaliber('ASCENT_3STAGE_ONBOARD_PUMP_FAMILY', 6.35)
      .exactCapacity,
    10
  );
  assert.equal(
    computeAccurateMagCapacityByWeaponAndCaliber('ASCENT_3STAGE_ONBOARD_PUMP_FAMILY', 11.43)
      .exactCapacity,
    6
  );

  // Verify pumping the Under-Barrel Air Reserve to 300 Bar and charging the 140cc Over-Barrel Plenum to 210 Bar (2.6 .45 shots)
  const initial = createInitialPneumaticState(PRESET_LOADOUTS[0]);
  const singleStroke = simulateAscentPumpStrokeTo300Bar(
    { ...initial, otbPressureBar: 200 },
    'SINGLE_3STAGE_STROKE'
  );
  assert.equal(singleStroke.pumped, true);
  assert.ok(singleStroke.underBarrelReserveBar > 200);
  assert.ok(singleStroke.estimatedFullPower45ShotsInPlenum >= 2.0);

  const full300 = simulateAscentPumpStrokeTo300Bar(
    singleStroke.nextState,
    'FULL_300BAR_PUMP_UP'
  );
  assert.equal(full300.underBarrelReserveBar, 300);
  assert.equal(full300.overBarrelPlenumBar, 210);
  assert.equal(full300.nextState.maxReliefBar, 300);
  assert.ok(full300.estimatedFullPower45ShotsInPlenum >= 2.5);
});

test('Snowpeak PP750L benchmark identification, per-component unique part synthesis, and 25 SMART Ollama objectives (39 total phases)', async () => {
  const {
    INTERACTIVE_WEAPON_BENCHMARK_MODELS,
    synthesizeUniqueBenchmarkComponentAsset,
  } = await import('./interactiveModelBenchmarks');
  const {
    SPECIALIZED_OLLAMA_MODELS,
    PHYSICS_AIR_MECHANICS_25_SMART_GOALS,
    INITIAL_NEEDED_PARTS_QUEUE,
    executeOllamaModelTaskInGame,
  } = await import('./ollamaLocalModelsAndRoadmap');
  const { GENERATIVE_CAD_ROADMAP_PHASES } = await import('./popular25Catalog');

  // 1. Verify 25 SMART goals and 39 total roadmap phases (14 core + 25 SMART)
  assert.equal(PHYSICS_AIR_MECHANICS_25_SMART_GOALS.length, 25);
  assert.equal(GENERATIVE_CAD_ROADMAP_PHASES.length, 39);
  assert.equal(SPECIALIZED_OLLAMA_MODELS.length, 8);

  // 2. Verify Snowpeak PP750L photo (/assets/aistudio/snowpeak_pp750l_1__94af69ac.webp) is accurately identified
  const pp750Model = INTERACTIVE_WEAPON_BENCHMARK_MODELS.find(
    (m) => m.modelId === 'MODEL_06_EVANIX_MP30_FIXED_HANDLE'
  );
  assert.ok(pp750Model);
  assert.ok(pp750Model.fullTitle.includes('Snowpeak PP750L'));
  assert.equal(pp750Model.subComponentsAndOrings[0].partCode, 'PP750-01');
  assert.equal(pp750Model.subComponentsAndOrings[1].partCode, 'PP750-02');
  assert.equal(pp750Model.subComponentsAndOrings[2].partCode, 'PP750-03');

  // 3. Verify every component button creates a genuinely unique part with distinct shape archetype & watertight STL
  const burstModel = INTERACTIVE_WEAPON_BENCHMARK_MODELS.find(
    (m) => m.modelId === 'MODEL_02_BURST_DISK_4STAGE_FAMILY'
  )!;
  const bd01Asset = synthesizeUniqueBenchmarkComponentAsset(
    burstModel.subComponentsAndOrings[0],
    burstModel.fullTitle
  );
  const bd02Asset = synthesizeUniqueBenchmarkComponentAsset(
    burstModel.subComponentsAndOrings[1],
    burstModel.fullTitle
  );
  const bd03Asset = synthesizeUniqueBenchmarkComponentAsset(
    burstModel.subComponentsAndOrings[2],
    burstModel.fullTitle
  );

  assert.equal(bd01Asset.shapeArchetype, 'STEPPED_FITTING_AND_VITON_ORING');
  assert.equal(bd02Asset.shapeArchetype, 'SIX_PETAL_LASER_SCORED_FOIL_DISK');
  assert.equal(bd03Asset.shapeArchetype, 'DUAL_RADIAL_EXHAUST_RETAINER_CAP');
  assert.notEqual(bd01Asset.customSvgDrawing, bd02Asset.customSvgDrawing);
  assert.notEqual(bd02Asset.watertightStlAscii, bd03Asset.watertightStlAscii);
  assert.ok(bd01Asset.stlTriangleCount >= 128);

  // 4. Verify Evanix REX-P sub-components generate unique REX-P archetypes
  const rexModel = INTERACTIVE_WEAPON_BENCHMARK_MODELS.find(
    (m) => m.modelId === 'MODEL_05_EVANIX_REXP_COAXIAL_MONOLITH'
  )!;
  const rex11Asset = synthesizeUniqueBenchmarkComponentAsset(
    rexModel.subComponentsAndOrings[0],
    rexModel.fullTitle
  );
  const rex14Asset = synthesizeUniqueBenchmarkComponentAsset(
    rexModel.subComponentsAndOrings[1],
    rexModel.fullTitle
  );
  const rex32Asset = synthesizeUniqueBenchmarkComponentAsset(
    rexModel.subComponentsAndOrings[2],
    rexModel.fullTitle
  );
  assert.equal(rex11Asset.shapeArchetype, 'COAXIAL_BREECH_SLIDE_SLEEVE');
  assert.equal(rex14Asset.shapeArchetype, 'FIVE_HOLE_SKELETONIZED_UNDERLEVER');
  assert.equal(rex32Asset.shapeArchetype, 'INLINE_180_PEEK_POPPET_VALVE');

  // 5. Verify in-game Ollama model task execution produces SVG schematic, TS code, and watertight STL
  const part = INITIAL_NEEDED_PARTS_QUEUE[0];
  const ollamaArtifact = await executeOllamaModelTaskInGame({
    modelId: SPECIALIZED_OLLAMA_MODELS[0].id,
    weaponFamilyId: part.weaponFamilyId,
    partCode: part.partCode,
    partName: part.partName,
    targetCaliberMm: part.targetCaliberMm,
    lengthMm: part.lengthMm,
    outerDiameterMm: part.outerDiameterMm,
    innerDiameterMm: part.innerDiameterMm,
    pressureBar: part.pressureRatingBar,
    tryLiveLocalhostOllama: false,
  });
  assert.ok(ollamaArtifact.generatedSvgMarkup.includes('<svg'));
  assert.ok(ollamaArtifact.generatedTsCode.includes('export'));
  assert.ok(ollamaArtifact.generatedStlAscii.startsWith('solid '));
});


