import test from 'node:test';
import assert from 'node:assert/strict';
import {
  THREE_PRINTER_STATIONS,
  IN_GAME_COLLECTIBLE_RESOURCES,
  THREE_PRINTER_PART_RECIPES,
  canAffordPrinterRecipe,
  executePrinterPartFabrication,
  filterThreePrinterPartRecipes,
  LARGE_PHYSICS_MODEL_DISTILLATION_ROADMAP,
} from './threePrinterRoomEngine';
import { INITIAL_SURVIVOR_INVENTORY, type SurvivorPrintInventory } from './popular25Catalog';

test('3-Printer Fabrication Room defines 3 distinct printer stations and 8 in-game collectible resources', () => {
  assert.equal(THREE_PRINTER_STATIONS.length, 3);
  const ids = THREE_PRINTER_STATIONS.map((s) => s.id);
  assert.deepEqual(ids, [
    'PRINTER_01_POLYMER_SLS',
    'PRINTER_02_METAL_DMLS',
    'PRINTER_03_ORDNANCE_SYNTH',
  ]);

  assert.equal(IN_GAME_COLLECTIBLE_RESOURCES.length, 8);
  for (const res of IN_GAME_COLLECTIBLE_RESOURCES) {
    assert.ok(res.inGameDropSource.length > 10);
    assert.equal(typeof INITIAL_SURVIVOR_INVENTORY[res.key], 'number');
  }
});

test('Each printer station has at least 4 part recipes with Gun, Part Category, and Physics Model filter metadata plus 5-stage Physics Distillation Roadmap', () => {
  assert.ok(THREE_PRINTER_PART_RECIPES.length >= 12);
  for (const station of THREE_PRINTER_STATIONS) {
    const recipes = THREE_PRINTER_PART_RECIPES.filter((r) => r.printerId === station.id);
    assert.ok(recipes.length >= 4);
    for (const r of recipes) {
      const costKeys = Object.keys(r.resourceCosts);
      assert.ok(costKeys.length >= 2, `${r.partId} must require multiple collected resources`);
      assert.ok(r.compatibleGunIds.length >= 1);
      assert.ok(r.partCategory.length > 3);
      assert.ok(r.designPhysicsModelId.length > 3);
    }
  }
  const defenderFiltered = filterThreePrinterPartRecipes(THREE_PRINTER_PART_RECIPES, {
    printerId: 'ALL_PRINTERS',
    gunId: 'GUN_03_DEFENDER',
    partCategory: 'ALL_PARTS',
    physicsModelId: 'ALL_MODELS',
  });
  assert.ok(defenderFiltered.length >= 2);
  assert.equal(LARGE_PHYSICS_MODEL_DISTILLATION_ROADMAP.length, 5);
});

test('executePrinterPartFabrication verifies affordability, deducts collected resources, and synthesizes watertight .STL', () => {
  const p50MagRecipe = THREE_PRINTER_PART_RECIPES[0];
  assert.ok(p50MagRecipe);

  const richInv: SurvivorPrintInventory = {
    ...INITIAL_SURVIVOR_INVENTORY,
    pa12CfFilamentGrams: 500,
    peekAerospaceGrams: 300,
    tpu95aSealFilamentGrams: 300,
    billet7075DustGrams: 500,
    chromoly4140Cores: 20,
    titaniumBellevilleSprings: 20,
    burstDiskFoils: 30,
    nbr90Oings: 30,
  };

  const check = canAffordPrinterRecipe(richInv, p50MagRecipe);
  assert.equal(check.affordable, true);

  const res = executePrinterPartFabrication(richInv, p50MagRecipe);
  assert.equal(res.success, true);
  assert.ok(res.nextInventory.printedRoomPartIds.includes(p50MagRecipe.partId));
  assert.equal(
    res.nextInventory.pa12CfFilamentGrams,
    500 - (p50MagRecipe.resourceCosts.pa12CfFilamentGrams || 0)
  );
  assert.ok(res.stlAsset.facetCount > 20);
  assert.ok(res.stlAsset.stlString.includes('solid'));

  const emptyInv: SurvivorPrintInventory = {
    ...INITIAL_SURVIVOR_INVENTORY,
    pa12CfFilamentGrams: 0,
    peekAerospaceGrams: 0,
    tpu95aSealFilamentGrams: 0,
    billet7075DustGrams: 0,
    chromoly4140Cores: 0,
    titaniumBellevilleSprings: 0,
    burstDiskFoils: 0,
    nbr90Oings: 0,
  };

  const blockedCheck = canAffordPrinterRecipe(emptyInv, p50MagRecipe);
  assert.equal(blockedCheck.affordable, false);
  const blockedExec = executePrinterPartFabrication(emptyInv, p50MagRecipe);
  assert.equal(blockedExec.success, false);
});
