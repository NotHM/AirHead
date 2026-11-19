import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_7_WEAPONS_PROGRESSION,
  getCanonicalWeaponByProgressionId,
  INITIAL_PERSISTENT_ROADMAP_NODES,
  runDivideAndConquerRoadmapPass,
  INITIAL_MERCH_CATALOG,
  LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS,
  P50_EXTREME_ENVIRONMENTS,
  P50_HERMETIC_6PHASE_CYCLE_STAGES,
} from './canonicalProgressionAndBlueprints';
import {
  PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS,
  ISOLATED_3D_FOCUS_CATEGORIES,
  getSubComponentsForIsolatedPart,
} from './elonReverseEngineeringRoadmaps';

test('Canonical Weapon Progression starts with #01 Mongo / #02 REX-P -> #03 Defender -> #04 Leshiy 2 -> #05 The Leaf .45 -> #06 MP30 -> #07 P50 .50 Auto -> #08 .45 Ascent -> #09 The Protector', () => {
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION.length, 9);
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[0].progressionId, 'GUN_01_PEN');
  assert.ok(CANONICAL_7_WEAPONS_PROGRESSION[0].shortTitle.includes('Mongo'));
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[0].isDefaultStarterOption, true);
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[1].progressionId, 'GUN_02_REXP');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[1].isDefaultStarterOption, true);
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[2].progressionId, 'GUN_03_DEFENDER');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[3].progressionId, 'GUN_04_LESHIY');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[4].progressionId, 'GUN_04B_THE_LEAF_45');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[5].progressionId, 'GUN_05_MP30');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[6].progressionId, 'GUN_06_P50');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[7].progressionId, 'GUN_07_ASCENT45');
  assert.equal(CANONICAL_7_WEAPONS_PROGRESSION[8].progressionId, 'GUN_09_PROTECTOR');
});

test('Snowpeak / PP750L is completely purged and MP30 is reworked to authentic Dual-Cylinder SMG', () => {
  const serialized = JSON.stringify(CANONICAL_7_WEAPONS_PROGRESSION);
  assert.ok(!serialized.toLowerCase().includes('snowpeak'), 'Snowpeak must not exist anywhere in canonical progression');
  assert.ok(!serialized.toLowerCase().includes('pp750'), 'PP750L must not exist anywhere in canonical progression');

  const mp30 = getCanonicalWeaponByProgressionId('GUN_05_MP30');
  assert.equal(mp30.uniqueParts.length, 12, 'MP30 must have a complete 12-part high-precision blueprint');
  assert.equal(mp30.screwsAndFasteners.length, 6, 'MP30 must have 6 metric fasteners');
  assert.equal(mp30.oringPlacements.length, 6, 'MP30 must have 6 O-ring gland specs');
});

test('Leshiy 2 has its own 12-part blueprint, 6 fasteners, 6 O-rings, and 6 quantitative airflow & simulation checks', () => {
  const leshiy = getCanonicalWeaponByProgressionId('GUN_04_LESHIY');
  assert.equal(leshiy.uniqueParts.length, 12, 'Leshiy 2 must have 12 blueprint parts (LSH-01..LSH-12)');
  assert.equal(leshiy.screwsAndFasteners.length, 6, 'Leshiy 2 must have 6 metric screws');
  assert.equal(leshiy.oringPlacements.length, 6, 'Leshiy 2 must have 6 O-ring specs');
  assert.equal(LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS.length, 6, 'Leshiy 2 must have 6 quantitative simulation checks');
  for (const check of LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS) {
    assert.equal(check.status, 'PASSED_FACTORY_SPEC');
  }
});

test('P50 .50 Auto defines 6-Phase Cycle (Empty -> Rotate 90 -> Push Down -> Cycle Bolt -> Seal -> Fire) for Space, Sand, and Underwater', () => {
  assert.equal(P50_EXTREME_ENVIRONMENTS.length, 3);
  assert.deepEqual(
    P50_EXTREME_ENVIRONMENTS.map((e) => e.id),
    ['SPACE_VACUUM_0BAR', 'SAHARA_QUARTZ_SAND_IP69K', 'ABYSSAL_UNDERWATER_30M_4BAR']
  );
  assert.equal(P50_HERMETIC_6PHASE_CYCLE_STAGES.length, 6);
  assert.equal(P50_HERMETIC_6PHASE_CYCLE_STAGES[0].phaseIndex, 0);
  assert.equal(P50_HERMETIC_6PHASE_CYCLE_STAGES[5].phaseIndex, 5);
});

test('Elon Musk 5-Step Reverse-Engineering Roadmaps and 3D Focus Part Isolation cover all 9 guns and 11 isolated parts', () => {
  const roadmaps = Object.values(PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS);
  assert.equal(roadmaps.length, 9);
  for (const roadmap of roadmaps) {
    assert.equal(roadmap.milestones.length, 5, `${roadmap.gunId} must have all 5 Elon algorithm steps`);
  }
  assert.equal(ISOLATED_3D_FOCUS_CATEGORIES.length, 11);
  const subParts = getSubComponentsForIsolatedPart('GUN_04_LESHIY', 'FOCUS_POPPET');
  assert.ok(subParts.length >= 3, 'Isolated 3D Focus part must expose inspectable sub-components');
});

test('Every canonical weapon has a unique blueprint, metric screw torque specs, O-ring gland placements, and printable parts', () => {
  const versionIds = new Set<string>();
  for (const gun of CANONICAL_7_WEAPONS_PROGRESSION) {
    assert.ok(!versionIds.has(gun.versionId), `Duplicate versionId: ${gun.versionId}`);
    versionIds.add(gun.versionId);

    assert.ok(gun.screwsAndFasteners.length >= 4, `${gun.progressionId} must have at least 4 screw specs`);
    assert.ok(gun.oringPlacements.length >= 4, `${gun.progressionId} must have at least 4 O-ring specs`);
    assert.ok(gun.uniqueParts.length >= 4, `${gun.progressionId} must have at least 4 unique parts`);

    for (const screw of gun.screwsAndFasteners) {
      assert.ok(screw.torqueNm > 0, `Screw ${screw.code} must have positive torque`);
      assert.ok(screw.threadMetricSpec.length > 2);
    }
    for (const oring of gun.oringPlacements) {
      assert.ok(oring.maxRatedBar > 0, `O-ring ${oring.code} must specify maxRatedBar`);
      assert.ok(oring.isoOrParkerSizeMm.includes('×'));
    }
  }
});

test('Divide and Conquer roadmap pass advances both Game Development and Marketing & Merch nodes', () => {
  const gameDevNodes = INITIAL_PERSISTENT_ROADMAP_NODES.filter(
    (n) => n.department === 'GAME_DEVELOPMENT'
  );
  const merchNodes = INITIAL_PERSISTENT_ROADMAP_NODES.filter(
    (n) => n.department === 'MARKETING_AND_MERCH'
  );
  assert.ok(gameDevNodes.length >= 7);
  assert.ok(merchNodes.length >= 4);
  assert.ok(INITIAL_MERCH_CATALOG.length >= 4);

  const beforeAvg =
    INITIAL_PERSISTENT_ROADMAP_NODES.reduce((s, n) => s + n.completionPct, 0) /
    INITIAL_PERSISTENT_ROADMAP_NODES.length;
  const updated = runDivideAndConquerRoadmapPass(INITIAL_PERSISTENT_ROADMAP_NODES, 'ALL');
  const afterAvg =
    updated.nextNodes.reduce((s, n) => s + n.completionPct, 0) / updated.nextNodes.length;
  assert.ok(afterAvg > beforeAvg, 'Divide and conquer pass should increase completion percentage');

  const ascent = getCanonicalWeaponByProgressionId('GUN_07_ASCENT45');
  assert.equal(ascent.operatingPressureBar, 300);
});

test('Pen Gun (#01) and AEA Defender (#03) share the exact same .50 Cal (12.70mm) 220-Bar SHELL-50-220B burst-disk cartridge and 12.70mm barrel bore', () => {
  const pen = getCanonicalWeaponByProgressionId('GUN_01_PEN');
  const defender = getCanonicalWeaponByProgressionId('GUN_03_DEFENDER');
  assert.equal(pen.defaultCaliberMm, 12.7);
  assert.equal(defender.defaultCaliberMm, 12.7);
  assert.equal(pen.operatingPressureBar, 220);
  assert.equal(defender.operatingPressureBar, 220);

  const penShell = pen.uniqueParts.find((p) => p.partCode.includes('SHELL-50-220B'));
  const defShell = defender.uniqueParts.find((p) => p.partCode.includes('SHELL-50-220B'));
  assert.ok(penShell, 'Pen Gun must include shared SHELL-50-220B cartridge');
  assert.ok(defShell, 'AEA Defender must include shared SHELL-50-220B cartridge');
  assert.ok(penShell.dimensionsMm.includes('18.0mm') && penShell.dimensionsMm.includes('68.0mm'));
  assert.ok(defShell.dimensionsMm.includes('18.0mm') && defShell.dimensionsMm.includes('68.0mm'));
});

test('Evanix REX-P (#02) has a complete 12-part blueprint (REX-01..REX-12), 6 fasteners, and 6 O-rings covering the rebuilt #14-#20 lever-trigger group', () => {
  const rexp = getCanonicalWeaponByProgressionId('GUN_02_REXP');
  assert.equal(rexp.uniqueParts.length, 12);
  assert.equal(rexp.screwsAndFasteners.length, 6);
  assert.equal(rexp.oringPlacements.length, 6);
  const triggerParts = rexp.uniqueParts.filter((p) =>
    ['REX-04', 'REX-05', 'REX-06', 'REX-07', 'REX-08'].includes(p.partCode)
  );
  assert.equal(triggerParts.length, 5);
});

test('synthesizeComponentWatertightStl generates distinct watertight 3D mesh archetypes and dimensions per blueprint part', async () => {
  const { synthesizeComponentWatertightStl } = await import('./airgunVideoTranscriptionStudio');
  const leshiy = getCanonicalWeaponByProgressionId('GUN_04_LESHIY');
  const rexp = getCanonicalWeaponByProgressionId('GUN_02_REXP');

  const magPart = leshiy.uniqueParts.find((p) => p.partCode === 'LSH-05')!;
  const silencerPart = leshiy.uniqueParts.find((p) => p.partCode === 'LSH-02')!;
  const triggerPart = rexp.uniqueParts.find((p) => p.partCode === 'REX-05')!;

  const magStl = synthesizeComponentWatertightStl({
    partCode: magPart.partCode,
    partName: magPart.partName,
    lengthMm: 14.5,
    outerDiameterMm: 46,
    innerDiameterMm: 7.62,
    caliberMm: 7.62,
    dimensionsSpecString: magPart.dimensionsMm,
    customDescription: magPart.roleDescription,
  });
  const silencerStl = synthesizeComponentWatertightStl({
    partCode: silencerPart.partCode,
    partName: silencerPart.partName,
    lengthMm: 158,
    outerDiameterMm: 42,
    innerDiameterMm: 7.62,
    caliberMm: 7.62,
    dimensionsSpecString: silencerPart.dimensionsMm,
    customDescription: silencerPart.roleDescription,
  });
  const triggerStl = synthesizeComponentWatertightStl({
    partCode: triggerPart.partCode,
    partName: triggerPart.partName,
    lengthMm: 142,
    outerDiameterMm: 16,
    innerDiameterMm: 4,
    caliberMm: 7.62,
    dimensionsSpecString: triggerPart.dimensionsMm,
    customDescription: triggerPart.roleDescription,
  });

  assert.equal(magStl.resolvedArchetype, 'ROTARY_DRUM_MAGAZINE');
  assert.equal(silencerStl.resolvedArchetype, 'MULTI_BAFFLE_SILENCER');
  assert.equal(triggerStl.resolvedArchetype, 'LEVER_TRIGGER_LINKAGE');
  assert.notEqual(magStl.stlString, silencerStl.stlString);
  assert.notEqual(silencerStl.stlString, triggerStl.stlString);
  assert.notEqual(magStl.facetCount, triggerStl.facetCount);
});


