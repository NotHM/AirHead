import { SavedWeaponVersion, POPULAR_25_AIRGUNS } from './popular25Catalog';
import { CanonicalWeaponBlueprintSpec } from './canonicalProgressionAndBlueprints';

export interface AutomatedBlueprintDimensionCallout {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  textX: number;
  textY: number;
  color: string;
}

export interface AutomatedBlueprintLoupeSpec {
  title: string;
  subtitle: string;
  toleranceCallout: string;
  sealAndThreadNote: string;
}

export interface AutomatedWeaponBlueprintDrawingSpec {
  blueprintSerialCode: string;
  isoStandardLabel: string;
  overallLengthMm: number;
  shroudOuterDiaMm: number;
  boreInnerDiaMm: number;
  plenumVolumeCc: number;
  operatingPressureBar: number;
  baffleCount: number;
  dimensionCallouts: AutomatedBlueprintDimensionCallout[];
  breechDetailLoupe: AutomatedBlueprintLoupeSpec;
  moderatorDetailLoupe: AutomatedBlueprintLoupeSpec;
  automatedPipelineNote: string;
}

/**
 * Automated Parametric CAD Blueprint Generator (ISO-128 / ASME Y14.5-2018).
 * Automatically synthesizes high-precision engineering blueprint geometry, dimension callouts,
 * section lines, and magnified detail loupes for all 9 canonical airguns AND any future
 * custom weapon versions (`SavedWeaponVersion`) created by the player or agent swarm.
 */
export function generateAutomatedEngineeringBlueprintSpec(
  version: SavedWeaponVersion,
  canonicalGun?: CanonicalWeaponBlueprintSpec
): AutomatedWeaponBlueprintDrawingSpec {
  const upperPlat =
    POPULAR_25_AIRGUNS.find((p) => p.id === version.upperPlatformId) ||
    POPULAR_25_AIRGUNS[0];
  const lowerPlat =
    POPULAR_25_AIRGUNS.find((p) => p.id === version.lowerPlatformId) ||
    POPULAR_25_AIRGUNS[1];

  const boreInnerDiaMm = Number(
    (canonicalGun?.defaultCaliberMm || upperPlat.caliberMm || 12.7).toFixed(2)
  );
  const shroudOuterDiaMm = Number(
    Math.max(boreInnerDiaMm + 16.5, boreInnerDiaMm * 2.45).toFixed(1)
  );

  const isCompactPen =
    canonicalGun?.progressionId === 'GUN_01_PEN' ||
    version.upperPlatformId === 'plat_20_texoma_pellet_pen';
  const isBurstCartridgeWeapon =
    isCompactPen ||
    canonicalGun?.progressionId === 'GUN_03_DEFENDER' ||
    canonicalGun?.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY';
  const isPistolOrDefender =
    canonicalGun?.progressionId === 'GUN_03_DEFENDER' ||
    canonicalGun?.progressionId === 'GUN_02_REXP';
  const overallLengthMm = isCompactPen
    ? 205
    : isPistolOrDefender
    ? 345
    : Math.round(480 + boreInnerDiaMm * 14);

  // Burst-disk cartridge weapons (VID105, VID107, x9feufnloKc, jgDYcypjHeI) have ZERO external plenum and ZERO moderator baffles
  const plenumVolumeCc = isBurstCartridgeWeapon
    ? 0
    : Math.round(
        (upperPlat.defaultPlenumCc || 65) + (lowerPlat.defaultStorageCc || 180) * 0.35
      );
  const operatingPressureBar =
    canonicalGun?.operatingPressureBar ||
    version.regulatorSetpointBar ||
    (isBurstCartridgeWeapon ? 310 : 250);
  const baffleCount = isBurstCartridgeWeapon ? 0 : boreInnerDiaMm >= 12.7 ? 6 : 8;

  const serialPrefix = canonicalGun
    ? canonicalGun.progressionId.replace(/[^A-Z0-9]/g, '')
    : `AUTO-${version.versionId.slice(-5).toUpperCase()}`;

  const dimensionCallouts: AutomatedBlueprintDimensionCallout[] = [
    {
      id: 'DIM_OAL',
      label: `OAL ${overallLengthMm}.0 mm ±0.02`,
      x1: 36,
      y1: 22,
      x2: 688,
      y2: 22,
      textX: 362,
      textY: 16,
      color: '#38bdf8',
    },
    {
      id: 'DIM_SHROUD_OD',
      label: isBurstCartridgeWeapon
        ? `Ø20.5mm UNSHROUDED TUBE`
        : `Ø${shroudOuterDiaMm}mm SHROUD`,
      x1: 486,
      y1: 42,
      x2: 486,
      y2: 112,
      textX: 492,
      textY: 36,
      color: '#10b981',
    },
    {
      id: 'DIM_BORE_ID',
      label: isCompactPen
        ? `MODULAR .45 / 9mm / .410 BORE`
        : `BORE Ø${boreInnerDiaMm}mm`,
      x1: 565,
      y1: 68,
      x2: 565,
      y2: 86,
      textX: 570,
      textY: 63,
      color: '#f59e0b',
    },
  ];

  const breechDetailLoupe: AutomatedBlueprintLoupeSpec = isBurstCartridgeWeapon
    ? {
        title: 'DETAIL B (4:1): REAR 5,000 PSI BURST DISK & FRONT-FILL SHUTTLE PISTON',
        subtitle:
          'Rear Cap Clamps Flat 5,000 PSI Metal Disk · Front 310B Fill Pushes Internal O-Ring Piston Rearward',
        toleranceCallout: '0cc External Plenum · 0.15ms Total Dump',
        sealAndThreadNote:
          'Video x9feufnloKc Spec: Never dry-fire unpressurized cartridge or rear disk dents & leaks',
      }
    : {
        title: 'DETAIL B (4:1): BREECH & HERMETIC SEAL',
        subtitle: `Ø${boreInnerDiaMm}mm Leade Cone + Dual Viton 90A Gland`,
        toleranceCallout: 'Concentricity ≤ 0.005 mm · Squeeze 19.8%',
        sealAndThreadNote: `${upperPlat.upperConnectorPort} → ${lowerPlat.lowerConnectorPort} (${operatingPressureBar} Bar Rated)`,
      };

  const moderatorDetailLoupe: AutomatedBlueprintLoupeSpec = isCompactPen
    ? {
        title: 'DETAIL C (3:1): INTERCHANGEABLE SCREW-ON BARRELS (VID105 & VID107)',
        subtitle:
          'Unshrouded M18×1.0 Front Threads Swap .45 Cal Slug, 9mm (.357), and .410 Shotgun Smoothbore',
        toleranceCallout: '.410 Loads: #4 Buck / 2× .32 Balls / #8 Shot',
        sealAndThreadNote:
          'Zero Baffle Moderator — Pure Direct-Dump Muzzle Velocity from 11cc 310-Bar Cartridge',
      }
    : isBurstCartridgeWeapon
    ? {
        title: 'DETAIL C (3:1): OVER-UNDER HARPOON & .72 CAL WALKING CANE BORES',
        subtitle:
          'Swaps Between Twin .50 Cal Slugs/Buckshot/Carbon Arrows (x9feufnloKc) & .72 Cal (18.3mm) Cane (jgDYcypjHeI)',
        toleranceCallout: '11cc Std / 25cc Magnum @ 310–345 Bar',
        sealAndThreadNote:
          'Direct Cartridge Nozzle-to-Breech Obturation · Zero Regulator or Transfer Port Loss',
      }
    : {
        title: `DETAIL C (3:1): ${baffleCount}-CHAMBER K-BAFFLE STACK`,
        subtitle: `Ø${(boreInnerDiaMm + 0.8).toFixed(1)}mm Bore Aperture · 60° Skimmer Cones`,
        toleranceCallout: `Strips 38% Muzzle Gas · -${Math.round(11 + baffleCount * 0.9)} dB`,
        sealAndThreadNote: 'M18×1.0 Concentric Shoulder + Viton 75A Endcap Seal',
      };

  return {
    blueprintSerialCode: `ISO-128 // ${serialPrefix}-${Math.round(boreInnerDiaMm * 10)}`,
    isoStandardLabel: 'ISO-128 / ASME Y14.5M AUTO-GENERATED CAD BLUEPRINT',
    overallLengthMm,
    shroudOuterDiaMm: isCompactPen ? 20.5 : shroudOuterDiaMm,
    boreInnerDiaMm,
    plenumVolumeCc,
    operatingPressureBar,
    baffleCount,
    dimensionCallouts,
    breechDetailLoupe,
    moderatorDetailLoupe,
    automatedPipelineNote: isBurstCartridgeWeapon
      ? `Verified against YouTube Specs: VID105 (x9-JjJuyLOs), VID107 (x0ghlafy-AM), Harpoon (x9feufnloKc) & .72 Cane (jgDYcypjHeI)`
      : `Auto-Synthesized from 3D Scene & Loadout (${upperPlat.name} × ${lowerPlat.name})`,
  };
}
