/**
 * Agent Build & Scaffolding CLI (`npm run scaffold:schematic`)
 *
 * Verifies all 5 built-in airgun schematics (FX Bottle Valve & 45° AMP Regulator Cutaway,
 * Texoma Tactical Pen Gun, Evanix REX-P, Air Venturi Ascent, and Hatsan Velox),
 * runs deterministic dimensional + Lamé 250-bar pressure unit tests on every part & sub-part,
 * and can scaffold a custom schematic JSON + exploded `.SVG` blueprint from a part list.
 */

import {
  ALL_WEAPON_SCHEMATICS,
  validateSchematicPartWithTests,
  generateExplodedBlueprintSvg,
  generateIndividualPartStl,
} from '../src/game/schematicPartsLibrary';

function runBuildScaffolderVerification() {
  console.log('====================================================================');
  console.log(' SURVIVOR 3D-PRINT GUNSMITH — AGENT CAD & SUB-PART BUILD SCAFFOLDER');
  console.log('====================================================================');

  let totalPartsVerified = 0;
  let totalSubPartsVerified = 0;

  for (const schem of ALL_WEAPON_SCHEMATICS) {
    console.log(
      `\n[SCHEMATIC] ${schem.weaponName} (${schem.modelCode}) — ${schem.parts.length} Master Parts`
    );
    for (const part of schem.parts) {
      const res = validateSchematicPartWithTests(
        part,
        schem.parts,
        schem.workingPressureBar
      );
      if (!res.passedAllTests) {
        throw new Error(
          `Part #${part.partNumber} (${part.name}) failed verification: ${res.assertions.join(
            '; '
          )}`
        );
      }
      totalPartsVerified++;
      totalSubPartsVerified += res.subPartCountVerified;
    }

    const svg = generateExplodedBlueprintSvg(schem, 0.85);
    const firstPartStl = generateIndividualPartStl(schem.parts[0], schem.nativeCaliberMm);
    console.log(
      `  ✓ Verified ${schem.parts.length} parts & sub-parts | Exploded SVG (${svg.length} bytes) | Sample STL (${firstPartStl.length} bytes)`
    );
  }

  console.log('\n--------------------------------------------------------------------');
  console.log(
    `✓ BUILD SCAFFOLDER COMPLETE: ${ALL_WEAPON_SCHEMATICS.length} Schematics, ${totalPartsVerified} Master Parts, and ${totalSubPartsVerified} Sub-Parts passed 100% of CAD & 3D Printing Expert tests.`
  );
  console.log('--------------------------------------------------------------------');
}

runBuildScaffolderVerification();
