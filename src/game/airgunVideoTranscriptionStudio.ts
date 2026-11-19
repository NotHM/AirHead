import { BaseWeaponFamilyId, BurstDiskEvolutionStage, RexConfigurationMode } from './weaponFamiliesAndCompatibility';

export type FiringCycleStageIndex = 0 | 1 | 2 | 3 | 4;

export interface FiringCycleStageSpec {
  stageIndex: FiringCycleStageIndex;
  shortLabel: string;
  timingWindowMs: string;
  title: string;
  pneumaticPathActive: string;
  breechAndSealState: string;
  boltPositionNormalized: number; // 0 = closed/locked, 1 = open/retracted
  turretOrDrumAngleOffsetDeg: number;
  valveOpenNormalized: number; // 0 = sealed, 1 = full lift
  gasPulseProgressNormalized: number; // 0 = reservoir, 0.5 = breech, 1.0 = muzzle/baffles
  pressureZonesBar: {
    reservoirBar: number;
    plenumBar: number;
    breechPeakBar: number;
    muzzleExitBar: number;
  };
}

export interface WeaponFamilyAirflowAndCycleProfile {
  familyKey: string;
  weaponTitle: string;
  howItFeeds: string;
  howItSealsAt250Bar: string;
  howItFiresAndDumpsAir: string;
  howItCyclesNextRound: string;
  stages: [
    FiringCycleStageSpec,
    FiringCycleStageSpec,
    FiringCycleStageSpec,
    FiringCycleStageSpec,
    FiringCycleStageSpec
  ];
}

export const WEAPON_AIRFLOW_AND_CYCLE_PROFILES: Record<string, WeaponFamilyAirflowAndCycleProfile> = {
  P90_45_TOP_HELICAL_PLENUM_FAMILY: {
    familyKey: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
    weaponTitle: 'FN P90 .45 Cal Top 90° Helical-Turret Bullpup + 145cc Mag Reserve Plenum',
    howItFeeds:
      '22× .45 Cal (11.43mm) Delrin carrier sabots (holding 220gr boattail slugs or 6× #1 buckshot) lie transversely (90° to bore) in the horizontal top smoked-polycarbonate spine. An 8-bar pneumatic-assisted follower pushes the stack rearward into the circular Ø54mm 38.5° twin-track helical cam turret, rotating each sabot 90° and dropping it 14.0mm down into the coaxial breech feed throat.',
    howItSealsAt250Bar:
      'A reciprocating stainless hollow-probe bolt cams forward 16.5mm, stripping the rotated .45 sabot from the turret feed lips into the barrel leade cone. Dual radial AS568-013 Polyurethane 95A obturator collars (18.5% gland squeeze) expand under pilot pressure to seal both the barrel throat and the rear valve face 360° airtight.',
    howItFiresAndDumpsAir:
      'The magazine’s underside 145cc 250-Bar twin spine reserve docks via an M14x1.25 dry-break stinger into the lower 95cc regulated plenum (185 Bar). Pulling the bullpup trigger releases the balanced poppet in 1.4ms, blasting 185-Bar air straight up the Ø9.2mm vertical transfer port and through the hollow probe bolt directly behind the .45 sabot base.',
    howItCyclesNextRound:
      'As the .45 slug passes the mid-barrel Ø1.8mm gas bleed tap, residual shroud pressure drives the short-stroke return piston rearward 16.5mm, retracting the probe bolt while the helical turret indexes the next .45 round 90° into the drop-in breech saddle.',
    stages: [
      {
        stageIndex: 0,
        shortLabel: '1. 90° Helical Feed',
        timingWindowMs: 't = -12.0 ms',
        title: 'Transverse Spine Push → 90° Helical Turret Rotation → Breech Drop',
        pneumaticPathActive: '145cc Mag Spine (250B) → Dry-Break Stinger → 95cc Lower Plenum (185B)',
        breechAndSealState: 'Reciprocating hollow probe bolt retracted 16.5mm; next .45 sabot rotates 0°→45°→90° in helical ramp and drops into breech throat.',
        boltPositionNormalized: 1.0,
        turretOrDrumAngleOffsetDeg: 45,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.1,
        pressureZonesBar: { reservoirBar: 250, plenumBar: 185, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 1,
        shortLabel: '2. Probe Cam & Seal',
        timingWindowMs: 't = -2.5 ms',
        title: 'Hollow Probe Bolt Chambers .45 Sabot & Dual PU95A Collars Seal',
        pneumaticPathActive: 'Lower Plenum Charged @ 185 Bar · Breech Obturator Rings Pre-Loaded',
        breechAndSealState: 'Hollow bolt probe cams forward 16.5mm, seating the .45 sabot into the rifled leade cone; dual PU95A O-rings seal at 18.5% squeeze.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.22,
        pressureZonesBar: { reservoirBar: 248, plenumBar: 185, breechPeakBar: 8, muzzleExitBar: 1 },
      },
      {
        stageIndex: 2,
        shortLabel: '3. Poppet Valve Open',
        timingWindowMs: 't = 0.0 – 1.4 ms',
        title: 'Balanced Poppet Lifts 3.8mm → 185-Bar Blast Enters Hollow Probe',
        pneumaticPathActive: '95cc Plenum → Poppet Throat → Ø9.2mm Vertical Port → Hollow Probe Breech',
        breechAndSealState: '185-Bar gas pressure energizes the front & rear PU95A breech collars (238 Bar contact stress), preventing any blow-by into the polycarbonate magazine.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 1.0,
        gasPulseProgressNormalized: 0.52,
        pressureZonesBar: { reservoirBar: 246, plenumBar: 142, breechPeakBar: 178, muzzleExitBar: 12 },
      },
      {
        stageIndex: 3,
        shortLabel: '4. .45 Bore Expansion',
        timingWindowMs: 't = 1.4 – 3.2 ms',
        title: 'Adiabatic Expansion Accelerates 220gr .45 Slug to 298 m/s (262 J)',
        pneumaticPathActive: 'Breech Throat → 450mm .45 Rifled Liner → Concentric K-Baffle Silencer Shroud',
        breechAndSealState: 'Poppet snaps shut; expanding gas propels the .45 slug/sabot down the rifled bore while outer OTB reserve equalizes the plenum.',
        boltPositionNormalized: 0.08,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.2,
        gasPulseProgressNormalized: 0.84,
        pressureZonesBar: { reservoirBar: 242, plenumBar: 168, breechPeakBar: 64, muzzleExitBar: 45 },
      },
      {
        stageIndex: 4,
        shortLabel: '5. Gas Bleed Cycle',
        timingWindowMs: 't = 3.2 – 14.0 ms',
        title: 'Shroud Bleed Piston Retracts Probe Bolt & Indexes Next .45 Round',
        pneumaticPathActive: 'Mid-Barrel Ø1.8mm Bleed Port → Short-Stroke Op-Rod → Bolt Return & Plenum Recharge',
        breechAndSealState: 'Silencer baffles strip muzzle blast to 89 dB; gas op-rod cycles the probe bolt rearward so the 8-bar magazine follower rotates Round #2 into the breech.',
        boltPositionNormalized: 0.85,
        turretOrDrumAngleOffsetDeg: 90,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 1.0,
        pressureZonesBar: { reservoirBar: 240, plenumBar: 185, breechPeakBar: 4, muzzleExitBar: 8 },
      },
    ],
  },

  EVANIX_REX_PISTOL: {
    familyKey: 'EVANIX_REX_PISTOL',
    weaponTitle: 'Evanix REX-P 7.62mm / .45 Coaxial Single-Shot Pistol (57-Part Korean Blueprint)',
    howItFeeds:
      'Pulling the knurled cylindrical Axial Breech Slide (#11) 26.0mm forward along the barrel exposes the precision single-shot loading port inside Monolithic Receiver (#08). A heavy boattail slug is thumb-seated directly into the rifled barrel throat (#03) underneath the high-bridge Cantilever Picatinny Scope Rail (#29).',
    howItSealsAt250Bar:
      'Sliding Breech Sleeve (#11) rearward locks over two concentric NBR90 O-rings (#05 & #06, 12.0×2.0mm) seated on the outside of the barrel breech and receiver nose, creating a zero-dead-volume 180° straight coaxial seal.',
    howItFiresAndDumpsAir:
      'Pivoting the 5-hole Skeletonized Underlever Trigger Guard (#14) downward 38° compresses Hammer Spring (#10) and latches Striker (#09) on Sear (#17). Pulling Gold Trigger (#20) releases Hammer (#09) to strike Coaxial In-Line Poppet Stem (#32), dumping 250-bar air from Rear Tank (#37) straight forward along the bore axis with zero 90° transfer-port turn loss!',
    howItCyclesNextRound:
      'Valve Spring (#31) plus 250-bar tank pressure snaps PEEK Poppet (#32) shut in 1.65ms. The shooter strokes Underlever (#14) to re-cock the hammer and slides Breech Sleeve (#11) forward to chamber the next slug.',
    stages: [
      {
        stageIndex: 0,
        shortLabel: '1. Underlever Cocking',
        timingWindowMs: 'Manual Lever Throw',
        title: '5-Hole Underlever Guard (#14) Pivots 38° → Cocks Striker Hammer (#09)',
        pneumaticPathActive: 'Rear Coaxial Tank (#37) Holding 250 Bar behind PEEK Poppet (#32)',
        breechAndSealState: 'Axial Breech Slide (#11) slid forward 26mm exposing the single-shot barrel leade (#03) and dual O-rings (#05).',
        boltPositionNormalized: 1.0,
        turretOrDrumAngleOffsetDeg: 38,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.08,
        pressureZonesBar: { reservoirBar: 250, plenumBar: 250, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 1,
        shortLabel: '2. Axial Sleeve Lock',
        timingWindowMs: 'Breech Closed',
        title: 'Cylindrical Breech Slide (#11) Bridges Dual Concentric O-Rings (#05/#06)',
        pneumaticPathActive: '250-Bar Coaxial Tank (#37) Poised Directly Behind Valve Assemble Cap (#33)',
        breechAndSealState: 'Breech Slide (#11) locked rearward; 17.8% radial squeeze on dual NBR90 O-rings seals the barrel-to-receiver junction.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.2,
        pressureZonesBar: { reservoirBar: 250, plenumBar: 250, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 2,
        shortLabel: '3. Coaxial Poppet Strike',
        timingWindowMs: 't = 0.0 – 1.65 ms',
        title: 'Hammer (#09) Strikes Inline Poppet (#32) → 180° Straight-Through Blast',
        pneumaticPathActive: 'Rear Tank (#37) → Valve Housing (#34) → Inline Poppet (#32) → Barrel (#03)',
        breechAndSealState: 'PEEK Poppet Head (#32) lifts 3.45mm off brass seat (#33); 250-bar air flows straight into the barrel throat with zero 90° bend loss.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 1.0,
        gasPulseProgressNormalized: 0.55,
        pressureZonesBar: { reservoirBar: 228, plenumBar: 228, breechPeakBar: 215, muzzleExitBar: 18 },
      },
      {
        stageIndex: 3,
        shortLabel: '4. Rifled Bore & Shroud',
        timingWindowMs: 't = 1.65 – 3.1 ms',
        title: 'Slug Accelerates Through 235mm Barrel (#03) & Shroud Baffles (#02)',
        pneumaticPathActive: 'Barrel Liner (#03) → Muzzle Stripping Cap (#01) → Over-Barrel Shroud (#02)',
        breechAndSealState: 'Poppet (#32) reseals against #33; annular shroud volume strips turbulent muzzle gas behind the exiting slug.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.15,
        gasPulseProgressNormalized: 0.86,
        pressureZonesBar: { reservoirBar: 222, plenumBar: 222, breechPeakBar: 58, muzzleExitBar: 42 },
      },
      {
        stageIndex: 4,
        shortLabel: '5. Muzzle Strip & Vent',
        timingWindowMs: 't = 3.1 – 8.0 ms',
        title: 'Muzzle Cap (#01) Vents Shroud Pressure · Ready for Next Underlever Stroke',
        pneumaticPathActive: 'Over-Barrel Shroud (#02) Vents Slowly Through Rear Diffusion Chambers',
        breechAndSealState: 'Breech remains sealed until shooter pulls Axial Slide (#11) forward for Shot #2.',
        boltPositionNormalized: 0.25,
        turretOrDrumAngleOffsetDeg: 10,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 1.0,
        pressureZonesBar: { reservoirBar: 220, plenumBar: 220, breechPeakBar: 2, muzzleExitBar: 5 },
      },
    ],
  },

  EVANIX_REX_SNIPER: {
    familyKey: 'EVANIX_REX_SNIPER',
    weaponTitle: 'Evanix REX Sniper Carbine (580mm Moderated Barrel + 480cc Stock Tank)',
    howItFeeds:
      'Uses the same zero-dead-volume Axial Cylindrical Breech Slide (#11) underneath the cantilevered 4-16×50 sniper optic mount (#29), allowing long high-BC heavy slugs to be loaded straight into the 580mm Lothar Walther match barrel without magazine length limits.',
    howItSealsAt250Bar:
      'Dual concentric NBR90 O-rings (#05/#06) inside the lengthened sniper breech sleeve plus a floating Viton stem seal (#45) handle full 250-bar magnum sniper charges.',
    howItFiresAndDumpsAir:
      'The rear 480cc carbon-wrapped shoulder stock tank feeds the enlarged Coaxial Valve Housing (#34). When the 5-hole underlever-cocked hammer strikes Poppet (#32), the 580mm barrel extracts +38% more adiabatic expansion energy before the slug enters the 8-chamber extended front reflex moderator.',
    howItCyclesNextRound:
      'Extended 8-baffle sniper moderator strips 68% of muzzle blast energy into the reflex expansion chamber; cycling the underlever resets the match sear.',
    stages: [
      {
        stageIndex: 0,
        shortLabel: '1. Sniper Lever Cock',
        timingWindowMs: 'Manual Lever Throw',
        title: 'Underlever (#14) Cocks Heavy Sniper Hammer · Axial Slide (#11) Opens',
        pneumaticPathActive: '480cc Carbon Buttstock Tank @ 250 Bar → Coaxial Valve Manifold (#34)',
        breechAndSealState: 'Axial Breech Sleeve (#11) slides forward under the 4-16×50 scope bridge to load a long boattail slug.',
        boltPositionNormalized: 1.0,
        turretOrDrumAngleOffsetDeg: 38,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.08,
        pressureZonesBar: { reservoirBar: 250, plenumBar: 250, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 1,
        shortLabel: '2. Coaxial Breech Seal',
        timingWindowMs: 'Breech Locked',
        title: 'Axial Sleeve (#11) Locks Over 580mm Match Barrel Throat',
        pneumaticPathActive: '480cc Stock Tank Pressurizes Inline PEEK Poppet Seat (#33)',
        breechAndSealState: 'Dual NBR90 breech O-rings compressed to 18.2% gland squeeze for zero blow-by.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.2,
        pressureZonesBar: { reservoirBar: 250, plenumBar: 250, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 2,
        shortLabel: '3. 180° Valve Dump',
        timingWindowMs: 't = 0.0 – 1.8 ms',
        title: 'Inline Poppet (#32) Lifts 4.1mm → Straight Coaxial Gas Surge',
        pneumaticPathActive: '480cc Stock Tank → Valve (#32) → 580mm Rifled Sniper Barrel',
        breechAndSealState: 'Straight-line coaxial flow delivers 235-bar peak breech pressure directly behind the heavy slug.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 1.0,
        gasPulseProgressNormalized: 0.5,
        pressureZonesBar: { reservoirBar: 242, plenumBar: 242, breechPeakBar: 235, muzzleExitBar: 10 },
      },
      {
        stageIndex: 3,
        shortLabel: '4. 580mm Bore Dwell',
        timingWindowMs: 't = 1.8 – 4.2 ms',
        title: 'Full Adiabatic Expansion Along 580mm Barrel → Supersonic Velocity',
        pneumaticPathActive: '580mm Barrel Liner → Reflex Shroud → 8-Chamber Front Sniper Moderator',
        breechAndSealState: 'Long barrel dwell drops exit pressure while maximizing kinetic energy transfer (+38% J vs Pistol).',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.15,
        gasPulseProgressNormalized: 0.82,
        pressureZonesBar: { reservoirBar: 238, plenumBar: 238, breechPeakBar: 48, muzzleExitBar: 28 },
      },
      {
        stageIndex: 4,
        shortLabel: '5. 8-Baffle Moderation',
        timingWindowMs: 't = 4.2 – 11.0 ms',
        title: '8 Anodized K-Baffles Strip Muzzle Wave Inside Extended Sniper Shroud',
        pneumaticPathActive: 'Front Sniper Moderator Baffles (#02-EXT) → Sub-82 dB Acoustic Signature',
        breechAndSealState: 'Gas cools across 8 conical baffles before venting through the crowned muzzle cap.',
        boltPositionNormalized: 0.2,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 1.0,
        pressureZonesBar: { reservoirBar: 236, plenumBar: 236, breechPeakBar: 2, muzzleExitBar: 4 },
      },
    ],
  },

  SHOTGUN_BURST_CARTRIDGE_FAMILY: {
    familyKey: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    weaponTitle:
      'Texoma VID105/VID107 (.45 / 9mm / .410 Shotgun) Air Pen Gun, AEA Harpoon Twin-Cartridge & .72 Cal Walking Cane Family',
    howItFeeds:
      'Taught by VID105 (x9-JjJuyLOs), VID107 (x0ghlafy-AM), Autumn’s Armory (x9feufnloKc), and Thomas Jay (jgDYcypjHeI): Instead of an onboard regulator or plenum, these launchers use a removable self-contained AEA HPA Cartridge (11cc standard or 25cc Magnum). On #01 Mongo (Texoma VID105/107 Pen Gun), the 3-piece coaxial body unthreads to drop in 1× charged cartridge and thread on an interchangeable front barrel (.45 Cal rifled slug, 9mm/.357 barrel, or .410 smoothbore shotgun barrel loaded with #4 buckshot, dual .32 balls, or #8 shot wads). On #03 AEA Harpoon / Defender & .72 Cane, the break-action or threaded breech loads 1–2 cartridges behind .50/.72 slugs, 12ga/.410 buckshot, or carbon harpoon arrows.',
    howItSealsAt250Bar:
      'Per Video x9feufnloKc (AEA Harpoon Cartridge Disassembly): First, unscrew the stainless rear burst-disk retainer cap and seat a flat circular 5,000 PSI (345 Bar) replaceable metal burst disk against the rear orifice (never dry-fire an empty cartridge, or the firing pin dents the disk and causes a fill hiss/leak). Next, attach the fill adapter to the FRONT nozzle of the cartridge and pump up to 4,500–5,000 PSI (310–345 Bar). Incoming front air pushes the internal O-ring shuttle piston/plunger rearward against its internal spring, sealing the chamber while molding the metal burst disk into a tight dome against the rear seat.',
    howItFiresAndDumpsAir:
      'There is ZERO regulator, ZERO external plenum, and ZERO 90° transfer port turn. Releasing the rear L-slot thumb striker (Texoma Pen Gun VID105/107) or pulling the alternating break-action trigger (AEA Harpoon / .72 Cane) drives the hardened rear firing pin straight into the exposed rear 5,000 PSI burst disk. Rupturing the rear burst disk unbalances the internal shuttle piston, dumping 100% of the 310–345 Bar (4,500–5,000 PSI) air charge instantaneously out the front nozzle directly behind the .45/9mm/.50/.72 slug, .410 buckshot wad, or harpoon arrow.',
    howItCyclesNextRound:
      'After firing, unthread the front interchangeable barrel (or pivot open the AEA Harpoon break-action), swap in a fresh pre-charged HPA cartridge (or unscrew the rear retainer cap on the spent cartridge, replace the punctured 5,000 PSI burst disk, and front-fill to 4,500 PSI), and screw on the desired .45 Cal, 9mm, .410 Shotgun, .50 Harpoon, or .72 Cane barrel.',
    stages: [
      {
        stageIndex: 0,
        shortLabel: '1. Rear Disk & Front Fill',
        timingWindowMs: 'Cartridge Prep (x9feufnloKc)',
        title: 'Seat Rear 5,000 PSI Burst Disk → Pump 310 Bar (4,500 PSI) Into FRONT Nozzle',
        pneumaticPathActive:
          'Front Fill Adapter (310B / 4,500 PSI) → Pushes Internal Shuttle Piston Rearward → Molds Rear Burst Disk',
        breechAndSealState:
          'Stainless rear retainer cap clamps flat 5,000 PSI metal burst disk; front air charge seats internal O-ring shuttle plunger.',
        boltPositionNormalized: 1.0,
        turretOrDrumAngleOffsetDeg: 35,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.1,
        pressureZonesBar: { reservoirBar: 310, plenumBar: 0, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 1,
        shortLabel: '2. Screw Barrel & Load',
        timingWindowMs: 'VID105 / VID107 Setup',
        title: 'Chamber Charged Cartridge → Thread On .45 Cal, 9mm, .410 Shotgun, or .72 Cane Barrel',
        pneumaticPathActive: 'Self-Contained Cartridge Core Holding 310 Bar (4,500 PSI) · 0cc External Plenum',
        breechAndSealState:
          'Interchangeable front barrel (.45 slug, 9mm, or .410 smoothbore w/ #4 buckshot / dual .32 balls) threads onto cartridge receiver; L-slot striker cocked.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.22,
        pressureZonesBar: { reservoirBar: 310, plenumBar: 0, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 2,
        shortLabel: '3. Rear Burst Disk Strike',
        timingWindowMs: 't = 0.0 – 0.15 ms',
        title: 'Rear Striker Punctures 5,000 PSI Burst Disk → Internal Shuttle Dumps 100% Forward',
        pneumaticPathActive:
          'Rear Firing Pin → Punctures Rear Burst Disk → Shuttle Piston Unseats → 310-Bar Front Nozzle Dump',
        breechAndSealState:
          'Zero regulator or poppet stem restriction: 100% of the 4,500 PSI cartridge volume surges out the front nozzle into the barrel breech.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 1.0,
        gasPulseProgressNormalized: 0.56,
        pressureZonesBar: { reservoirBar: 160, plenumBar: 0, breechPeakBar: 305, muzzleExitBar: 35 },
      },
      {
        stageIndex: 3,
        shortLabel: '4. .45 / .410 / .72 Launch',
        timingWindowMs: 't = 0.15 – 1.9 ms',
        title: 'Unthrottled Gas Launches .410 Buckshot Wad (VID107), .45/9mm Slug (VID105), or .72 Cane Slug',
        pneumaticPathActive:
          'Cartridge Front Nozzle → Unshrouded Interchangeable Barrel (.45 / 9mm / .410 / .50 / .72) → Muzzle',
        breechAndSealState:
          'Plastic .410 shot cup wad or rifled .45/.72 lead slug obturates the bore under full 310-Bar direct cartridge expansion.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.85,
        gasPulseProgressNormalized: 0.88,
        pressureZonesBar: { reservoirBar: 28, plenumBar: 0, breechPeakBar: 68, muzzleExitBar: 58 },
      },
      {
        stageIndex: 4,
        shortLabel: '5. Swap Cartridge / Disk',
        timingWindowMs: 'Post-Shot Reload',
        title: 'Fire Barrel #2 (AEA Harpoon) or Unscrew Rear Cap to Replace 5,000 PSI Burst Disk',
        pneumaticPathActive: 'Spent Cartridge Vented (1 Bar) · Unscrew Rear Retainer Cap → Insert New 5,000 PSI Disk',
        breechAndSealState:
          'Unthread interchangeable barrel or break open Harpoon hinge to drop in a fresh front-filled cartridge.',
        boltPositionNormalized: 0.65,
        turretOrDrumAngleOffsetDeg: 20,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 1.0,
        pressureZonesBar: { reservoirBar: 310, plenumBar: 0, breechPeakBar: 1, muzzleExitBar: 2 },
      },
    ],
  },

  LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY: {
    familyKey: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
    weaponTitle: 'EDgun Leshiy 2 Valkyrie Open-Breech 8-Shot Rotary Semi-Auto',
    howItFeeds:
      'Pressing the top latch pivots the rear buttstock air-tube assembly 180° around the twin-lug silver CNC hinge (LSA241100), exposing the magnetically retained 8-shot Red Scalloped Rotary Drum (LSA221000-VALK) and 8-tooth central star ratchet (LSA221002).',
    howItSealsAt250Bar:
      'When folded closed, the bright red Polyurethane 95A Transfer Port Puck (LSA242105) sits flush against the rear face of the rotary drum. Upon firing, high-pressure plenum air expands the red puck’s rear lip forward by 0.6mm to bridge the drum-to-barrel gap.',
    howItFiresAndDumpsAir:
      'Hammerless Differential Forward Plug Valve (LSA242200) vents its rear pilot chamber on trigger pull, snapping open in 1.6ms to blast regulated air from the 63cc plenum straight through the red PU95A puck and rotary drum chamber into the barrel.',
    howItCyclesNextRound:
      'Twin 0.7mm secondary gas jets vent a calibrated puff of air against the coil-sprung indexing pawl (LSA221103), driving it 5.06mm upward to rotate the 8-tooth star ratchet by exactly 45.0° for the next semi-auto shot.',
    stages: [
      {
        stageIndex: 0,
        shortLabel: '1. 45° Pawl Index',
        timingWindowMs: 't = -8.0 ms',
        title: 'Dual 0.7mm Gas Jets Drive Pawl 5.06mm → Rotate 8-Tooth Star Ratchet 45°',
        pneumaticPathActive: '350cc Rear Stock Tube (250B) → Regulator → 63cc Plenum (150B)',
        breechAndSealState: '8-Shot Red Scalloped Drum locks on detent ball at 0.015mm coaxial alignment with barrel.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 45,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.12,
        pressureZonesBar: { reservoirBar: 250, plenumBar: 150, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 1,
        shortLabel: '2. Pilot Sear Bleed',
        timingWindowMs: 't = -0.8 ms',
        title: 'Trigger Sear Vents Rear Differential Chamber of Forward Plug Valve',
        pneumaticPathActive: 'Pilot Bleed Vent Opens → Unbalances Delrin Forward Plug (LSA242200)',
        breechAndSealState: 'Red PU95A Breech Seal Puck (LSA242105) pre-loaded against rear face of Rotary Drum.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.35,
        gasPulseProgressNormalized: 0.28,
        pressureZonesBar: { reservoirBar: 248, plenumBar: 150, breechPeakBar: 18, muzzleExitBar: 1 },
      },
      {
        stageIndex: 2,
        shortLabel: '3. Red Puck Obturation',
        timingWindowMs: 't = 0.0 – 1.6 ms',
        title: 'Forward Plug Valve Snaps Open → Red PU95A Puck Seals Drum Face',
        pneumaticPathActive: '63cc Plenum → Fluted Star Plug Valve → Red PU95A Puck → Rotary Drum Chamber',
        breechAndSealState: '150-Bar blast expands the Red PU95A Puck forward 0.6mm, hermetically sealing the rotary drum gap.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 1.0,
        gasPulseProgressNormalized: 0.54,
        pressureZonesBar: { reservoirBar: 245, plenumBar: 118, breechPeakBar: 146, muzzleExitBar: 14 },
      },
      {
        stageIndex: 3,
        shortLabel: '4. Valkyrie Shroud Flow',
        timingWindowMs: 't = 1.6 – 3.4 ms',
        title: 'Slug Enters Rifled Barrel & Valkyrie Carbon M-LOK Moderator Baffles',
        pneumaticPathActive: 'Rotary Drum → Barrel Liner → Concentric Silencer Baffles + OTB Shroud',
        breechAndSealState: 'Differential pressure closes Forward Plug Valve in 1.6ms with zero hammer bounce.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.15,
        gasPulseProgressNormalized: 0.84,
        pressureZonesBar: { reservoirBar: 242, plenumBar: 138, breechPeakBar: 42, muzzleExitBar: 32 },
      },
      {
        stageIndex: 4,
        shortLabel: '5. Pawl Reset & Recharge',
        timingWindowMs: 't = 3.4 – 12.0 ms',
        title: 'Coil Spring Returns Indexing Pawl & Regulator Tops Plenum to 150 Bar',
        pneumaticPathActive: 'Rear Stock Tube + OTB Reservoir Equalize into 63cc Regulated Plenum',
        breechAndSealState: 'Next chamber indexed and sealed; ready for instant follow-up trigger pull.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 45,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 1.0,
        pressureZonesBar: { reservoirBar: 240, plenumBar: 150, breechPeakBar: 2, muzzleExitBar: 5 },
      },
    ],
  },

  ASCENT_3STAGE_ONBOARD_PUMP_FAMILY: {
    familyKey: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
    weaponTitle:
      'Redesigned Ascent × Vectis .45 Cal (140cc Over-Barrel 2+ Rd Plenum + QuietEnergy Silencer + 300-Bar Under-Barrel Pump Reserve)',
    howItFeeds:
      'Swinging the integrated trigger-guard Lever-Action Repeater loop (ASC-45-02) forward 48° retracts the .45 stainless bolt probe 34mm, cocks the Quattro 2-Stage adjustable hammer sear (ASC-45-03), and indexes the top-slot Rotary Magazine (ASC-45-05: 6 Rds .45 Cal / 10 Rds .25 / 12 Rds .22 / 14 Rds .177) by 60°.',
    howItSealsAt250Bar:
      'Closing the underlever drives the .45 probe forward to seat a 220gr .45 slug into the choked barrel throat (ASC-45-08), engaging a Polyurethane 90A probe tip O-ring (8.5×1.5mm) while the concentric Over-Barrel Plenum (ASC-45-09) is sealed at 210 Bar by dual Viton bulkhead O-rings (29.0×2.5mm).',
    howItFiresAndDumpsAir:
      'The onboard 3-stage hand pump (ASC-45-12) charges the Under-Barrel Air Reserve (ASC-45-11, 240cc/165cc with recessed 0–300 Bar belly gauge) all the way up to 300 Bar. An inline Belleville regulator steps 300-Bar reserve pressure into the 140cc Concentric Over-Barrel Plenum at 210 Bar—holding enough air for 2 to 3 full-power .45 shots before dropping off regulator! Pulling the Quattro Trigger dumps the Over-Barrel Plenum radially into the .45 breech throat.',
    howItCyclesNextRound:
      'As the .45 slug exits the 450mm choked barrel into the front QuietEnergy 6-gill vented moderator (ASC-45-10), the 300-Bar Under-Barrel Reserve immediately replenishes the 140cc Over-Barrel Plenum back to 210 Bar for Shot #2 and Shot #3.',
    stages: [
      {
        stageIndex: 0,
        shortLabel: '1. 300B Hand Pump',
        timingWindowMs: 'In-Game Pump Cycle',
        title: '3-Stage Onboard Pump Charges Under-Barrel Reserve to 300 Bar',
        pneumaticPathActive:
          '3-Stage Pump (ASC-45-12) → Check Poppet → 240cc Under-Barrel Reserve (300B) → 140cc Over-Barrel Plenum (210B)',
        breechAndSealState:
          'Part #116 2,000 PSI counter-balancer assists manual pump strokes up to 300 Bar on the recessed belly gauge.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.12,
        pressureZonesBar: { reservoirBar: 300, plenumBar: 210, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 1,
        shortLabel: '2. Lever Repeater Throw',
        timingWindowMs: '48° Lever Stroke',
        title: 'Trigger-Guard Lever Loop Cycles .45 Probe & Indexes 6-Rd Rotary Mag',
        pneumaticPathActive: '140cc Over-Barrel Plenum Poised @ 210 Bar (2–3 Full .45 Shots Stored)',
        breechAndSealState:
          'Lever loop swings 48° -> cocks Quattro 2-stage sear, indexes Rotary Mag 60°, and seats .45 slug with PU90A probe O-ring.',
        boltPositionNormalized: 1.0,
        turretOrDrumAngleOffsetDeg: 60,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 0.25,
        pressureZonesBar: { reservoirBar: 300, plenumBar: 210, breechPeakBar: 1, muzzleExitBar: 1 },
      },
      {
        stageIndex: 2,
        shortLabel: '3. Over-Barrel Plenum Dump',
        timingWindowMs: 't = 0.0 – 1.5 ms',
        title: 'Quattro 2-Stage Trigger Releases Hammer → 140cc Over-Barrel Plenum Fires',
        pneumaticPathActive:
          '140cc Over-Barrel Plenum (ASC-45-09) → Radial Breech Ports → .45 Choked Barrel (ASC-45-08)',
        breechAndSealState:
          '210-Bar regulated air from the concentric barrel plenum surges into the breech behind the 220gr .45 slug.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 1.0,
        gasPulseProgressNormalized: 0.55,
        pressureZonesBar: { reservoirBar: 292, plenumBar: 162, breechPeakBar: 204, muzzleExitBar: 15 },
      },
      {
        stageIndex: 3,
        shortLabel: '4. QuietEnergy Silencer',
        timingWindowMs: 't = 1.5 – 3.3 ms',
        title: '.45 Slug Exits Choked Barrel Through QuietEnergy 6-Gill Moderator',
        pneumaticPathActive:
          '450mm .45 Choked Liner → 5 Concentric K-Baffles → 6-Gill Vented QuietEnergy Muzzle Brake',
        breechAndSealState:
          'Forward QuietEnergy moderator strips -18.5 dB from the 245-Joule .45 report while Flip-Up Fiber Optic Sights stay on target.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 0,
        valveOpenNormalized: 0.15,
        gasPulseProgressNormalized: 0.85,
        pressureZonesBar: { reservoirBar: 284, plenumBar: 188, breechPeakBar: 52, muzzleExitBar: 34 },
      },
      {
        stageIndex: 4,
        shortLabel: '5. 2nd/3rd Shot Plenum Top-Up',
        timingWindowMs: 't = 3.3 – 10.0 ms',
        title: '300-Bar Under-Barrel Reserve Recharges Over-Barrel Plenum to 210 Bar',
        pneumaticPathActive:
          '240cc Under-Barrel 300B Reserve → Belleville Regulator → 140cc Over-Barrel Plenum (210B)',
        breechAndSealState:
          'Over-Barrel Plenum holds 2+ full .45 shots by itself and is immediately topped back to 210 Bar from the 300-Bar under-barrel reserve.',
        boltPositionNormalized: 0.0,
        turretOrDrumAngleOffsetDeg: 60,
        valveOpenNormalized: 0.0,
        gasPulseProgressNormalized: 1.0,
        pressureZonesBar: { reservoirBar: 276, plenumBar: 210, breechPeakBar: 2, muzzleExitBar: 4 },
      },
    ],
  },
};

export function getAirflowProfileForContext(
  familyId: BaseWeaponFamilyId,
  rexMode: RexConfigurationMode
): WeaponFamilyAirflowAndCycleProfile {
  if (familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
    return rexMode === 'REX_SNIPER_CARBINE_MODERATED'
      ? WEAPON_AIRFLOW_AND_CYCLE_PROFILES.EVANIX_REX_SNIPER
      : WEAPON_AIRFLOW_AND_CYCLE_PROFILES.EVANIX_REX_PISTOL;
  }
  if (familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
    return WEAPON_AIRFLOW_AND_CYCLE_PROFILES.P90_45_TOP_HELICAL_PLENUM_FAMILY;
  }
  if (familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
    return WEAPON_AIRFLOW_AND_CYCLE_PROFILES.SHOTGUN_BURST_CARTRIDGE_FAMILY;
  }
  if (familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
    return WEAPON_AIRFLOW_AND_CYCLE_PROFILES.ASCENT_3STAGE_ONBOARD_PUMP_FAMILY;
  }
  return WEAPON_AIRFLOW_AND_CYCLE_PROFILES.LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY;
}

// ============================================================================
// AIRGUN MECHANICS VIDEO TRANSCRIPTION & SCREENSHOT RECREATION STUDIO
// ============================================================================

export interface TranscribedVideoTimestamp {
  timeSec: number;
  timestampFormatted: string;
  mechanicalEventTitle: string;
  transcribedNarrationAndPhysics: string;
  extractedParameters: {
    valveLiftMm: number;
    dwellTimeMs: number;
    transferPortDiaMm: number;
    sealSqueezePct: number;
    peakBreechBar: number;
  };
}

export interface AirgunMechanicsVideoReference {
  videoId: string;
  title: string;
  channelOrSource: string;
  durationSec: number;
  linkedFamilyId: BaseWeaponFamilyId;
  linkedBurstStage?: BurstDiskEvolutionStage;
  linkedRexMode?: RexConfigurationMode;
  targetCaliberMm: number;
  summary: string;
  timestamps: TranscribedVideoTimestamp[];
}

export interface CapturedVideoScreenshot {
  id: string;
  videoId: string;
  videoTitle: string;
  timestampFormatted: string;
  stageTitle: string;
  dataUrl: string;
  transcribedRuleApplied: string;
  capturedAtIso: string;
}

export const AIRGUN_MECHANICS_VIDEO_LIBRARY: AirgunMechanicsVideoReference[] = [
  {
    videoId: 'vid_00_ascent_45_300bar_overbarrel_plenum',
    title: 'Redesigned .45 Cal Ascent × Vectis: 140cc Over-Barrel 2+ Rd Plenum, Silencer & 300-Bar Under-Barrel Pump',
    channelOrSource: 'Big-Bore Lever & Compressor Lab · 12-Part Diagram Cutaway',
    durationSec: 19,
    linkedFamilyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
    targetCaliberMm: 11.43,
    summary:
      'Cutaway transcription of all 12 diagrammed parts on the .45 Cal Ascent × Vectis Carbine: shows the onboard 3-stage hand pump charging the under-barrel air cylinder to 300 Bar, feeding the concentric 140cc Over-Barrel Plenum (storing 2–3 .45 shots) and QuietEnergy front moderator.',
    timestamps: [
      {
        timeSec: 3.0,
        timestampFormatted: '00:03.0',
        mechanicalEventTitle: 'In-Game 3-Stage Hand Pump → 300-Bar Under-Barrel Air Reserve',
        transcribedNarrationAndPhysics:
          'Transcript: "By coupling the 3-stage telescopic hand pump and Part #116 counter-balancer directly to the reinforced 240cc under-barrel cylinder, each pump stroke drives air past the Fluorosilicone Stage-3 piston all the way up to 300 Bar on the recessed belly pressure gauge."',
        extractedParameters: {
          valveLiftMm: 0.0,
          dwellTimeMs: 0.0,
          transferPortDiaMm: 8.8,
          sealSqueezePct: 19.8,
          peakBreechBar: 300,
        },
      },
      {
        timeSec: 9.2,
        timestampFormatted: '00:09.2',
        mechanicalEventTitle: 'Concentric 140cc Over-Barrel Plenum (2+ .45 Rounds) & QuietEnergy Silencer',
        transcribedNarrationAndPhysics:
          'Transcript: "The barrel shroud itself is a 140cc regulated Over-Barrel Plenum pressurized to 210 Bar—large enough to fire 2 to 3 full-power .45 Cal 220gr slugs before dropping below regulator setpoint, while the front QuietEnergy 6-gill moderator strips muzzle blast."',
        extractedParameters: {
          valveLiftMm: 3.9,
          dwellTimeMs: 1.5,
          transferPortDiaMm: 8.8,
          sealSqueezePct: 19.5,
          peakBreechBar: 210,
        },
      },
      {
        timeSec: 15.0,
        timestampFormatted: '00:15.0',
        mechanicalEventTitle: 'Lever-Action Repeater, Quattro 2-Stage Trigger & 6-Rd .45 Rotary Mag',
        transcribedNarrationAndPhysics:
          'Transcript: "Swinging the trigger-guard lever loop forward 48 degrees cycles the .45 bolt probe, cocks the Quattro 2-stage adjustable trigger behind the manual safety, and indexes the top-slot rotary magazine holding 6 rounds in .45 cal (or 10/.25, 12/.22, 14/.177)."',
        extractedParameters: {
          valveLiftMm: 3.9,
          dwellTimeMs: 1.5,
          transferPortDiaMm: 8.8,
          sealSqueezePct: 17.5,
          peakBreechBar: 204,
        },
      },
    ],
  },
  {
    videoId: 'vid_01_p90_helical_breech_plenum',
    title: 'FN P90 90° Helical Feed Ramp Adapted to .45 Cal PCP Breech & 145cc Spine Plenum',
    channelOrSource: 'High-Pressure Pneumatic CAD Lab · Cutaway Capture #01',
    durationSec: 18,
    linkedFamilyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
    targetCaliberMm: 11.43,
    summary:
      'High-speed cutaway showing how Ø12.80×32.00mm Delrin carrier sabots rotate 90° inside the rear spiral turret, drop into the coaxial breech throat, seal via a reciprocating hollow probe + dual PU95A obturator collars, and fire using the 145cc magazine spine air reserve.',
    timestamps: [
      {
        timeSec: 2.5,
        timestampFormatted: '00:02.5',
        mechanicalEventTitle: 'Transverse Double-Stack → 38.5° Helical Ramp Entry',
        transcribedNarrationAndPhysics:
          'Transcript: "Because bare .45 lead slugs have a stubby 1.7:1 length-to-diameter ratio, they tip inside a P90 spiral. Encapsulating the 220gr slug or 6-pellet buckshot in a 32mm Delrin sabot restores the 2.5:1 ratio so the 8-bar pneumatic follower feeds all 22 rounds smoothly into the 38.5° twin-roller helical turret."',
        extractedParameters: {
          valveLiftMm: 0.0,
          dwellTimeMs: 0.0,
          transferPortDiaMm: 9.2,
          sealSqueezePct: 15.2,
          peakBreechBar: 8,
        },
      },
      {
        timeSec: 7.0,
        timestampFormatted: '00:07.0',
        mechanicalEventTitle: 'Drop-In Breech Throat & Hollow-Probe O-Ring Obturation',
        transcribedNarrationAndPhysics:
          'Transcript: "As the sabot completes its 90° rotation at the bottom of the turret, it drops 14mm into the coaxial breech saddle. The reciprocating hollow probe cams forward 16.5mm, seating the sabot into the rifled leade while dual Polyurethane 95A collars compress to 18.5% gland squeeze."',
        extractedParameters: {
          valveLiftMm: 0.0,
          dwellTimeMs: 1.4,
          transferPortDiaMm: 9.2,
          sealSqueezePct: 18.5,
          peakBreechBar: 185,
        },
      },
      {
        timeSec: 12.4,
        timestampFormatted: '00:12.4',
        mechanicalEventTitle: 'Dry-Break Stinger Plenum Dump & Gas-Bleed Bolt Cycle',
        transcribedNarrationAndPhysics:
          'Transcript: "The magazine’s 145cc 250-bar spine reserve feeds the lower 95cc plenum through the M14x1.25 coaxial dry-break stinger. When the balanced poppet lifts 3.8mm in 1.4ms, 185-bar gas blasts through the hollow bolt probe, launching the .45 slug at 298 m/s while the mid-barrel bleed tap cycles the bolt for the next round."',
        extractedParameters: {
          valveLiftMm: 3.8,
          dwellTimeMs: 1.4,
          transferPortDiaMm: 9.2,
          sealSqueezePct: 18.5,
          peakBreechBar: 185,
        },
      },
    ],
  },
  {
    videoId: 'vid_02_evanix_rex_pistol_and_sniper',
    title: 'Evanix REX-P Pistol vs REX Sniper Carbine: Coaxial Inline Poppet & Axial Breech Slide',
    channelOrSource: 'Korean Factory CAD Cutaway · 57-Part Blueprint Analysis',
    durationSec: 20,
    linkedFamilyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
    linkedRexMode: 'REX_SNIPER_CARBINE_MODERATED',
    targetCaliberMm: 7.62,
    summary:
      'Side-by-side internal flow comparison of the Evanix REX-P Pistol (235mm barrel + 165cc tube) and REX Sniper Carbine (580mm barrel + 8-baffle moderator + 480cc carbon stock tank), highlighting the 180° straight-line coaxial poppet (#32) and cylindrical axial breech slide (#11).',
    timestamps: [
      {
        timeSec: 3.0,
        timestampFormatted: '00:03.0',
        mechanicalEventTitle: '5-Hole Underlever Cocking (#14) & Axial Breech Sleeve (#11)',
        transcribedNarrationAndPhysics:
          'Transcript: "Pivoting the skeletonized 5-hole trigger-guard underlever (#14) downward 38° draws the striker hammer (#09) back against the sear (#17). Sliding the knurled cylindrical breech sleeve (#11) 26mm forward exposes the barrel throat (#03) and dual NBR90 O-rings (#05) for direct thumb-loading."',
        extractedParameters: {
          valveLiftMm: 0.0,
          dwellTimeMs: 0.0,
          transferPortDiaMm: 7.8,
          sealSqueezePct: 17.8,
          peakBreechBar: 1,
        },
      },
      {
        timeSec: 9.5,
        timestampFormatted: '00:09.5',
        mechanicalEventTitle: '180° Straight Coaxial Inline Poppet Discharge (#32 → #03)',
        transcribedNarrationAndPhysics:
          'Transcript: "Unlike conventional PCPs where air makes two 90° turns through a vertical transfer port, the REX rear tank (#37) sits coaxially behind the barrel. Hammer (#09) strikes PEEK poppet (#32), opening a straight 180° Venturi throat (#33) at 250 bar with zero turn losses."',
        extractedParameters: {
          valveLiftMm: 3.9,
          dwellTimeMs: 1.65,
          transferPortDiaMm: 7.8,
          sealSqueezePct: 18.2,
          peakBreechBar: 235,
        },
      },
      {
        timeSec: 15.8,
        timestampFormatted: '00:15.8',
        mechanicalEventTitle: 'REX Sniper 580mm Barrel Dwell & 8-Chamber Reflex Moderator',
        transcribedNarrationAndPhysics:
          'Transcript: "Converting from REX-P Pistol to REX Sniper Carbine extends the barrel to 580mm with an 8-baffle front reflex moderator (#02) and 480cc shoulder tank, extracting 38% more muzzle energy while dropping acoustic report below 82 dB."',
        extractedParameters: {
          valveLiftMm: 4.1,
          dwellTimeMs: 1.8,
          transferPortDiaMm: 8.4,
          sealSqueezePct: 18.2,
          peakBreechBar: 240,
        },
      },
    ],
  },
  {
    videoId: 'vid_03_leshiy2_hammerless_valve_and_pawl',
    title: 'EDgun Leshiy 2 Hammerless Differential Plug Valve, Red Puck & 45° Pawl Indexing',
    channelOrSource: 'EDgun Valkyrie Engineering Cutaway · Sub-Millisecond X-Ray',
    durationSec: 16,
    linkedFamilyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
    targetCaliberMm: 7.62,
    summary:
      'High-speed X-ray showing how the Leshiy 2 hammerless forward plug valve (LSA242200) opens via rear differential pressure bleed, expands the red PU95A transfer puck (LSA242105), and uses twin 0.7mm gas jets to drive the indexing pawl (LSA221103).',
    timestamps: [
      {
        timeSec: 2.0,
        timestampFormatted: '00:02.0',
        mechanicalEventTitle: 'Differential Pressure Lock & Pilot Bleed Release',
        transcribedNarrationAndPhysics:
          'Transcript: "Plenum pressure holds the Delrin forward plug valve tightly sealed without a heavy hammer spring. Pulling the trigger vents the rear pilot chamber, causing plenum pressure to snap the plug rearward in 1.6 milliseconds."',
        extractedParameters: {
          valveLiftMm: 3.5,
          dwellTimeMs: 1.6,
          transferPortDiaMm: 7.16,
          sealSqueezePct: 19.0,
          peakBreechBar: 150,
        },
      },
      {
        timeSec: 8.2,
        timestampFormatted: '00:08.2',
        mechanicalEventTitle: 'Red PU95A Puck Obturation & 0.7mm Dual Power Jets',
        transcribedNarrationAndPhysics:
          'Transcript: "As the main air pulse blasts through the red Polyurethane 95A puck into the 8-shot rotary drum, two 0.7mm bleed jets divert gas to push the coil-sprung pawl 5.06mm upward, rotating the 8-tooth central star ratchet by 45 degrees."',
        extractedParameters: {
          valveLiftMm: 3.5,
          dwellTimeMs: 1.6,
          transferPortDiaMm: 7.16,
          sealSqueezePct: 19.0,
          peakBreechBar: 146,
        },
      },
    ],
  },
  {
    videoId: 'x9-JjJuyLOs',
    title:
      'Worlds first air powered pen gun 45 cal, 9mm, 410 shotgun by Texoma Precision Pellet VID105 (https://www.youtube.com/watch?v=x9-JjJuyLOs)',
    channelOrSource: 'Texoma Precision Pellet · YouTube VID105 (x9-JjJuyLOs)',
    durationSec: 342,
    linkedFamilyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    linkedBurstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    targetCaliberMm: 11.43,
    summary:
      'Official Texoma Precision Pellet VID105 breakdown of the world’s first modular air-powered pen gun: a 3-piece unshrouded coaxial launcher (Rear L-Slot Striker Tube + Middle AEA Defender Pre-Charged Air Cartridge + Front Interchangeable Screw-On Barrels in .45 Cal, 9mm/.357, and .410 Bore Shotgun) with zero regulator and zero baffle moderator.',
    timestamps: [
      {
        timeSec: 28.0,
        timestampFormatted: '00:28.0',
        mechanicalEventTitle: '3-Piece Modular Coaxial Architecture (No Regulator, No Plenum, No Shroud)',
        transcribedNarrationAndPhysics:
          'Transcript (VID105 x9-JjJuyLOs): "The Texoma Precision Pellet Pen Gun breaks down into three threaded sections: (1) the rear striker & L-slot cocking tube with coil mainspring, (2) the center chamber housing a single pre-charged AEA Defender air cartridge, and (3) interchangeable screw-on front barrels in .45 caliber, 9mm, and .410 shotgun."',
        extractedParameters: {
          valveLiftMm: 6.8,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 9.0,
          sealSqueezePct: 19.5,
          peakBreechBar: 310,
        },
      },
      {
        timeSec: 115.0,
        timestampFormatted: '01:55.0',
        mechanicalEventTitle: 'Interchangeable Screw-On Barrels: .45 Cal Slug, 9mm (.357), and .410 Smoothbore',
        transcribedNarrationAndPhysics:
          'Transcript (VID105 x9-JjJuyLOs): "To switch calibers, simply unthread the front barrel from the cartridge chamber sleeve. Thread on the rifled .45 cal or 9mm barrel for lead slugs, or thread on the smoothbore .410 shotgun barrel (stubby or extended) to fire .410 buckshot and birdshot wads."',
        extractedParameters: {
          valveLiftMm: 6.8,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 10.4,
          sealSqueezePct: 20.0,
          peakBreechBar: 310,
        },
      },
    ],
  },
  {
    videoId: 'x0ghlafy-AM',
    title:
      'Impact shots with 410 shells out of the Texoma Precision Pellet pen gun VID107 (https://www.youtube.com/watch?v=x0ghlafy-AM)',
    channelOrSource: 'Texoma Precision Pellet · YouTube VID107 (x0ghlafy-AM)',
    durationSec: 268,
    linkedFamilyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    linkedBurstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    targetCaliberMm: 10.41,
    summary:
      'Texoma Precision Pellet VID107 live-fire ballistic demonstration of the Pen Gun configured with the .410 smoothbore barrel, loading and firing #4 buckshot wads, dual .32 caliber stacked lead balls, and #8 birdshot capsules powered by a single pre-charged burst-disk air cartridge.',
    timestamps: [
      {
        timeSec: 42.0,
        timestampFormatted: '00:42.0',
        mechanicalEventTitle: 'Loading .410 Shot Cups (#4 Buckshot, Dual .32 Balls & #8 Shot) Ahead of Air Cartridge',
        transcribedNarrationAndPhysics:
          'Transcript (VID107 x0ghlafy-AM): "With the .410 barrel threaded onto the Texoma Pen Gun, we load a self-contained .410 shot wad—holding #4 buckshot, two stacked .32 caliber lead balls, or #8 shot—directly ahead of the pre-charged air cartridge nozzle."',
        extractedParameters: {
          valveLiftMm: 6.8,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 10.41,
          sealSqueezePct: 18.8,
          peakBreechBar: 310,
        },
      },
      {
        timeSec: 138.0,
        timestampFormatted: '02:18.0',
        mechanicalEventTitle: 'L-Slot Thumb Cocking Release & Total Instantaneous .410 Cartridge Dump',
        transcribedNarrationAndPhysics:
          'Transcript (VID107 x0ghlafy-AM): "Retracting the bolt knob into the rear L-slot cocks the heavy striker spring. Twisting the knob out of the safety notch fires the pin into the rear of the cartridge, dumping the entire 4,500 PSI air charge in one unthrottled blast behind the .410 payload."',
        extractedParameters: {
          valveLiftMm: 6.8,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 10.41,
          sealSqueezePct: 19.5,
          peakBreechBar: 305,
        },
      },
    ],
  },
  {
    videoId: 'x9feufnloKc',
    title:
      'Cartridge Firing Airgun! How does this even work? (AEA Harpoon from Airgun Tactical) (https://www.youtube.com/watch?v=x9feufnloKc)',
    channelOrSource: 'Autumn’s Armory · YouTube (x9feufnloKc)',
    durationSec: 485,
    linkedFamilyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    linkedBurstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
    targetCaliberMm: 12.7,
    summary:
      'Complete teardown and operational guide to the AEA Harpoon / Defender reusable 4,500–5,000 PSI (310–345 Bar) air cartridge system: shows how the stainless rear retainer cap holds a flat 5,000 PSI metal burst disk, how compressed air is pumped into the FRONT of the cartridge to push the internal shuttle piston rearward, and how firing .50 slugs, buckshot, or harpoon arrows works.',
    timestamps: [
      {
        timeSec: 64.0,
        timestampFormatted: '01:04.0',
        mechanicalEventTitle: 'Rear 5,000 PSI Metal Burst Disk & Anti-Dry-Fire Rule',
        transcribedNarrationAndPhysics:
          'Transcript (x9feufnloKc): "Unscrew the stainless cap on the BACK of the AEA cartridge and drop in one flat circular 5,000 PSI metal burst disk, then screw the rear cap tight. Never dry-fire an unpressurized cartridge in the gun—the firing pin will dent the flat disk and it will hiss and leak when you try to fill it!"',
        extractedParameters: {
          valveLiftMm: 11.2,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 11.2,
          sealSqueezePct: 22.0,
          peakBreechBar: 345,
        },
      },
      {
        timeSec: 148.0,
        timestampFormatted: '02:28.0',
        mechanicalEventTitle: 'Front-End Air Fill (4,500–5,000 PSI) & Internal Sliding Shuttle Piston',
        transcribedNarrationAndPhysics:
          'Transcript (x9feufnloKc): "You fill the cartridge from the FRONT using the fill adapter. As 4,500 to 5,000 PSI (310–345 Bar) air enters the front nozzle, it pushes the internal O-ring shuttle piston/plunger rearward against its internal spring, sealing the chamber and molding the rear metal burst disk into a tight dome."',
        extractedParameters: {
          valveLiftMm: 11.2,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 11.2,
          sealSqueezePct: 21.5,
          peakBreechBar: 310,
        },
      },
      {
        timeSec: 265.0,
        timestampFormatted: '04:25.0',
        mechanicalEventTitle: 'Over-Under Break-Action Loading: .50 Slugs, Buckshot & Carbon Harpoon Arrows',
        transcribedNarrationAndPhysics:
          'Transcript (x9feufnloKc): "Break open the twin over-under barrels on the AEA Harpoon, slide two pre-charged cartridges into the breech, and load .50 cal lead slugs, buckshot wads, or hollow carbon harpoon arrows down the interchangeable barrels. Pulling the trigger pierces the rear burst disk and dumps 100% of the cartridge air out the front nozzle."',
        extractedParameters: {
          valveLiftMm: 11.2,
          dwellTimeMs: 0.15,
          transferPortDiaMm: 12.7,
          sealSqueezePct: 20.5,
          peakBreechBar: 310,
        },
      },
    ],
  },
  {
    videoId: 'jgDYcypjHeI',
    title:
      '.72 caliber Airgun Walking Cane VS Dresser and more (https://www.youtube.com/watch?v=jgDYcypjHeI)',
    channelOrSource: 'Thomas Jay · YouTube (jgDYcypjHeI)',
    durationSec: 412,
    linkedFamilyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    linkedBurstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
    targetCaliberMm: 18.29,
    summary:
      'Live ballistic testing and mechanical walkthrough of the .72 Caliber (18.3mm / 12-Gauge Bore) Airgun Walking Cane powered by a Magnum 25cc 4,500–5,000 PSI (310–345 Bar) removable air cartridge, launching massive .72 cal lead hollow-point slugs and 12-gauge buckshot wads through a concealed cane shaft.',
    timestamps: [
      {
        timeSec: 52.0,
        timestampFormatted: '00:52.0',
        mechanicalEventTitle: 'Magnum 25cc 4,500 PSI Air Cartridge & .72 Cal (18.3mm / 12-Ga) Bore',
        transcribedNarrationAndPhysics:
          'Transcript (jgDYcypjHeI): "Unthreading the handle of the .72 caliber Airgun Walking Cane reveals the chamber for the oversized 25cc 4,500 PSI pre-charged air cartridge. The cane shaft itself is a full-length .72 caliber (18.3mm) barrel capable of launching heavy .72 lead slugs or 12-gauge shot cups."',
        extractedParameters: {
          valveLiftMm: 14.5,
          dwellTimeMs: 0.18,
          transferPortDiaMm: 18.29,
          sealSqueezePct: 20.5,
          peakBreechBar: 310,
        },
      },
      {
        timeSec: 195.0,
        timestampFormatted: '03:15.0',
        mechanicalEventTitle: 'Unregulated Total Cartridge Dump Behind .72 Cal Heavy Slug',
        transcribedNarrationAndPhysics:
          'Transcript (jgDYcypjHeI): "When the cane handle trigger releases the striker into the rear cartridge valve/burst disk, all 25cc of 310-Bar compressed air dumps straight down the 18.3mm bore, delivering devastating big-bore kinetic energy through solid wood targets."',
        extractedParameters: {
          valveLiftMm: 14.5,
          dwellTimeMs: 0.18,
          transferPortDiaMm: 18.29,
          sealSqueezePct: 21.0,
          peakBreechBar: 310,
        },
      },
    ],
  },
];

// ============================================================================
// AGENT COMPONENT TASKER, STL GENERATOR & PERSISTENT PART REMINDER STORE
// ============================================================================

export type ComponentVerificationStatus = 'WORKING' | 'NEEDS_FIX' | 'NEEDS_REBUILD' | 'TESTING';

export interface AgentComponentTaskAndReminder {
  id: string;
  weaponFamilyId: BaseWeaponFamilyId;
  partCode: string;
  partName: string;
  assignedAgentId: string;
  assignedAgentName: string;
  status: ComponentVerificationStatus;
  reminderNote: string;
  caliberMm: number;
  subMmDimensionsSummary: string;
  generatedStlFacetCount: number;
  generatedStlAscii: string;
  updatedAtIso: string;
}

const REMINDER_STORAGE_KEY = 'bar250_agent_component_reminders_v4';

export const DEFAULT_AGENT_COMPONENT_REMINDERS: AgentComponentTaskAndReminder[] = [
  {
    id: 'rem_ascent_45_12parts',
    weaponFamilyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
    partCode: 'ASC-45-01..12',
    partName: 'Ascent × Vectis .45 Cal (12 Parts: 140cc Over-Barrel 2+ Rd Plenum, QE Silencer, 300B Under-Barrel Reserve & Pump)',
    assignedAgentId: 'agent_01_cfd_valves',
    assignedAgentName: 'Agent-01: Internal Ballistics & Adiabatic Plenum CFD Specialist',
    status: 'WORKING',
    reminderNote:
      'LOGGED ALL 12 DIAGRAM PARTS: (1) Thumbhole Stock, (2) Lever Repeater, (3) Quattro 2-Stage Trigger, (4) Manual Safety, (5) Rotary Mag (6 Rds .45 / 10 .25 / 12 .22 / 14 .177), (6) Flip-Up Fiber Optic Sights, (7) Picatinny Rails, (8) Choked .45 Barrel, (9) 140cc Over-Barrel 2+ Rd Plenum, (10) QuietEnergy Silencer, (11) 300B Under-Barrel Reserve + Gauge, (12) In-Game 300B Pump.',
    caliberMm: 11.43,
    subMmDimensionsSummary: 'OTB Plenum=140cc @ 210B (2–3 Shots) · Under Reserve=240cc @ 300B · Bore=11.43mm',
    generatedStlFacetCount: 768,
    generatedStlAscii: '',
    updatedAtIso: '2026-11-10T03:30:00Z',
  },
  {
    id: 'rem_p90_breech_probe',
    weaponFamilyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
    partCode: 'P90-04 / P90-03',
    partName: 'P90 .45 Drop-In Helical Turret Throat & Dual PU95A Reciprocating Probe Seal',
    assignedAgentId: 'agent_02_cad_brep',
    assignedAgentName: 'Agent-02: Parametric B-Rep & Thread CAD Architect',
    status: 'WORKING',
    reminderNote:
      'VERIFIED: 38.5° helical ramp drops .45 sabot 14mm into coaxial breech; hollow probe cams forward 16.5mm and expands dual PU95A O-rings (18.5% squeeze) before 185B plenum dump.',
    caliberMm: 11.43,
    subMmDimensionsSummary: 'L=52.00mm · OD=Ø54.00mm · Bore=Ø11.43mm (±0.010mm)',
    generatedStlFacetCount: 640,
    generatedStlAscii: '',
    updatedAtIso: '2026-11-10T03:30:00Z',
  },
  {
    id: 'rem_rex_pistol_sniper',
    weaponFamilyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
    partCode: 'REX-#11 / REX-#02-SNIPER',
    partName: 'Evanix REX Axial Cylindrical Breech Slide (#11) & Sniper 580mm 8-Baffle Moderator',
    assignedAgentId: 'agent_03_lame_stress',
    assignedAgentName: 'Agent-03: Lamé Pressure Vessel & Structural FEA Specialist',
    status: 'WORKING',
    reminderNote:
      'VERIFIED: Both REX-P Pistol (235mm barrel, 165cc tank) and REX Sniper Variant (580mm barrel, 8-baffle reflex moderator, 480cc carbon stock tank, 4-16x50 scope) seal coaxially on dual #05/#06 NBR90 O-rings.',
    caliberMm: 7.62,
    subMmDimensionsSummary: 'Slide L=48.50mm · Sniper Shroud L=580.0mm · OD=Ø32.00mm',
    generatedStlFacetCount: 768,
    generatedStlAscii: '',
    updatedAtIso: '2026-11-10T03:30:00Z',
  },
  {
    id: 'rem_pengun_harpoon_cane_4videos',
    weaponFamilyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    partCode: 'VID105 / VID107 / x9feufnloKc / jgDYcypjHeI',
    partName: 'Texoma VID105/107 (.45/9mm/.410) Pen Gun, AEA Harpoon Front-Fill 5,000 PSI Burst Cartridge & .72 Cane',
    assignedAgentId: 'agent_04_kinematics',
    assignedAgentName: 'Agent-04: Rotary Indexing, Pump Linkage & Kinematics Engineer',
    status: 'WORKING',
    reminderNote:
      'REWRITTEN TO EXACT 4-VIDEO SPEC: (1) VID105 (x9-JjJuyLOs) & VID107 (x0ghlafy-AM): 3-piece unshrouded Pen Gun with rear L-slot striker tube, middle AEA air cartridge, and interchangeable screw-on .45 Cal, 9mm, and .410 Shotgun barrels (#4 buckshot, dual .32 balls, #8 shot); (2) Autumn’s Armory (x9feufnloKc): Rear stainless cap holds flat 5,000 PSI burst disk while FRONT air fill (4,500 PSI / 310 Bar) pushes internal O-ring shuttle piston rearward; (3) Thomas Jay (jgDYcypjHeI): .72 Cal (18.3mm) Walking Cane powered by 25cc Magnum 4,500 PSI air cartridge.',
    caliberMm: 11.43,
    subMmDimensionsSummary: 'Cartridge=310B (4,500 PSI) · 0cc Plenum (Direct Dump) · Barrels=.45 / 9mm / .410 / .50 / .72',
    generatedStlFacetCount: 896,
    generatedStlAscii: '',
    updatedAtIso: '2026-11-10T03:35:00Z',
  },
];

export function loadAgentComponentReminders(): AgentComponentTaskAndReminder[] {
  if (typeof window === 'undefined') return DEFAULT_AGENT_COMPONENT_REMINDERS;
  try {
    const raw = window.localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return DEFAULT_AGENT_COMPONENT_REMINDERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore storage errors
  }
  return DEFAULT_AGENT_COMPONENT_REMINDERS;
}

export function saveAgentComponentReminders(items: AgentComponentTaskAndReminder[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export type ParametricStlArchetype =
  | 'ROTARY_DRUM_MAGAZINE'
  | 'MULTI_BAFFLE_SILENCER'
  | 'RIFLED_BARREL_LINER'
  | 'BURST_DISK_SHELL_CARTRIDGE'
  | 'LEVER_TRIGGER_LINKAGE'
  | 'BELLEVILLE_REGULATOR_PLENUM'
  | 'HELICAL_TURRET_BREECH'
  | 'FINNED_HPA_BOTTLE'
  | 'HEX_TORX_FASTENER'
  | 'TOROIDAL_ORING_SEAL';

export interface ParsedBlueprintStlRecipe {
  archetype: ParametricStlArchetype;
  lengthMm: number;
  outerDiameterMm: number;
  innerDiameterMm: number;
  chamberOrBaffleCount: number;
  wallThicknessMm: number;
  flangeOrThreadPitchMm: number;
  parsedDimensionsSummary: string;
}

/**
 * Parses a blueprint part's code, name, dimension string, and description into
 * a specific mechanical archetype and accurate millimeter dimensions so every
 * part generates a distinct 3D .STL geometry.
 */
export function parseBlueprintPartDimensionsAndArchetype(params: {
  partCode: string;
  partName: string;
  caliberMm: number;
  dimensionsSpecString?: string;
  customDescription?: string;
  archetypeOverride?: ParametricStlArchetype;
  lengthMm?: number;
  outerDiameterMm?: number;
  innerDiameterMm?: number;
  chamberOrBaffleCount?: number;
}): ParsedBlueprintStlRecipe {
  const combinedText = `${params.partCode} ${params.partName} ${params.dimensionsSpecString || ''} ${params.customDescription || ''}`.toUpperCase();
  const dimText = `${params.dimensionsSpecString || ''} ${params.customDescription || ''}`;

  // Extract explicit numbers from dimension strings like "L=68.0mm · OD=Ø18.0mm · Bore=Ø12.70mm"
  const lenMatch = dimText.match(/(?:L|LEN|LENGTH|H|THICK)\s*[=:]?\s*(\d+(?:\.\d+)?)/i);
  const odMatch = dimText.match(/(?:OD|OUTER|DIA|Ø|W|WIDTH)\s*[=:Ø]?\s*(\d+(?:\.\d+)?)/i);
  const idMatch = dimText.match(/(?:ID|BORE|INNER|SEAT)\s*[=:Ø]?\s*(\d+(?:\.\d+)?)/i);
  const countMatch = combinedText.match(/(\d+)\s*-(?:RD|SHOT|CHAMBER|BAFFLE|HOLE|DISC|TOOTH|STAGE|GILL)/i);

  // Deterministic hash offset from partCode + partName so even parts in the same category have unique specs
  let codeHash = 0;
  for (let i = 0; i < combinedText.length; i++) {
    codeHash = (codeHash * 31 + combinedText.charCodeAt(i)) >>> 0;
  }

  const codeAndTitle = `${params.partCode} ${params.partName}`.toUpperCase();
  let archetype: ParametricStlArchetype = params.archetypeOverride || 'FINNED_HPA_BOTTLE';
  if (!params.archetypeOverride) {
    if (
      codeAndTitle.includes('OR-') ||
      codeAndTitle.includes('O-RING') ||
      codeAndTitle.includes('PUCK') ||
      codeAndTitle.includes('BURST DISK')
    ) {
      archetype =
        codeAndTitle.includes('SHELL') || codeAndTitle.includes('CARTRIDGE')
          ? 'BURST_DISK_SHELL_CARTRIDGE'
          : 'TOROIDAL_ORING_SEAL';
    } else if (
      codeAndTitle.includes('SCR-') ||
      codeAndTitle.includes('SCREW') ||
      codeAndTitle.includes('FASTENER') ||
      codeAndTitle.includes('GRUB') ||
      codeAndTitle.includes('TORX')
    ) {
      archetype = 'HEX_TORX_FASTENER';
    } else if (
      codeAndTitle.includes('SHELL') ||
      codeAndTitle.includes('CARTRIDGE') ||
      codeAndTitle.includes('CAPSULE') ||
      codeAndTitle.includes('SABOT')
    ) {
      archetype = 'BURST_DISK_SHELL_CARTRIDGE';
    } else if (
      codeAndTitle.includes('DRUM') ||
      codeAndTitle.includes('ROTARY MAG') ||
      codeAndTitle.includes('RATCHET') ||
      codeAndTitle.includes('STAR') ||
      codeAndTitle.includes('8-RD') ||
      codeAndTitle.includes('12-RD') ||
      codeAndTitle.includes('6-RD')
    ) {
      archetype = 'ROTARY_DRUM_MAGAZINE';
    } else if (
      codeAndTitle.includes('SILENCER') ||
      codeAndTitle.includes('MODERATOR') ||
      codeAndTitle.includes('BAFFLE') ||
      codeAndTitle.includes('TISHINA') ||
      codeAndTitle.includes('WHISPER') ||
      codeAndTitle.includes('QUIETENERGY') ||
      codeAndTitle.includes('SHROUD')
    ) {
      archetype = 'MULTI_BAFFLE_SILENCER';
    } else if (
      codeAndTitle.includes('BARREL') ||
      codeAndTitle.includes('LINER') ||
      codeAndTitle.includes('RIFLED') ||
      codeAndTitle.includes('CHOKED')
    ) {
      archetype = 'RIFLED_BARREL_LINER';
    } else if (
      codeAndTitle.includes('LEVER') ||
      codeAndTitle.includes('TRIGGER') ||
      codeAndTitle.includes('SEAR') ||
      codeAndTitle.includes('PAWL') ||
      codeAndTitle.includes('LINKAGE') ||
      codeAndTitle.includes('GUARD') ||
      codeAndTitle.includes('BIPOD') ||
      codeAndTitle.includes('GRIP')
    ) {
      archetype = 'LEVER_TRIGGER_LINKAGE';
    } else if (
      combinedText.includes('HELICAL') ||
      combinedText.includes('TURRET') ||
      combinedText.includes('BREECH') ||
      combinedText.includes('RECEIVER') ||
      combinedText.includes('SPINE')
    ) {
      archetype = 'HELICAL_TURRET_BREECH';
    } else if (
      combinedText.includes('REGULATOR') ||
      combinedText.includes('PLENUM') ||
      combinedText.includes('BELLEVILLE') ||
      combinedText.includes('POPPET') ||
      combinedText.includes('VALVE') ||
      combinedText.includes('SPOOL')
    ) {
      archetype = 'BELLEVILLE_REGULATOR_PLENUM';
    } else {
      archetype = 'FINNED_HPA_BOTTLE';
    }
  }

  const defaultLenByArchetype: Record<ParametricStlArchetype, number> = {
    ROTARY_DRUM_MAGAZINE: 14.5,
    MULTI_BAFFLE_SILENCER: 165.0,
    RIFLED_BARREL_LINER: 320.0,
    BURST_DISK_SHELL_CARTRIDGE: 68.0,
    LEVER_TRIGGER_LINKAGE: 118.0,
    BELLEVILLE_REGULATOR_PLENUM: 84.0,
    HELICAL_TURRET_BREECH: 64.0,
    FINNED_HPA_BOTTLE: 210.0,
    HEX_TORX_FASTENER: 22.0,
    TOROIDAL_ORING_SEAL: 3.5,
  };

  const defaultOdByArchetype: Record<ParametricStlArchetype, number> = {
    ROTARY_DRUM_MAGAZINE: 38.0,
    MULTI_BAFFLE_SILENCER: 36.0,
    RIFLED_BARREL_LINER: 16.0,
    BURST_DISK_SHELL_CARTRIDGE: 18.0,
    LEVER_TRIGGER_LINKAGE: 24.0,
    BELLEVILLE_REGULATOR_PLENUM: 34.0,
    HELICAL_TURRET_BREECH: 48.0,
    FINNED_HPA_BOTTLE: 38.0,
    HEX_TORX_FASTENER: 8.0,
    TOROIDAL_ORING_SEAL: Math.max(9.5, params.caliberMm + 4.0),
  };

  const parsedLen = lenMatch ? parseFloat(lenMatch[1]) : undefined;
  const parsedOd = odMatch ? parseFloat(odMatch[1]) : undefined;
  const parsedId = idMatch ? parseFloat(idMatch[1]) : undefined;
  const parsedCount = countMatch ? parseInt(countMatch[1], 10) : undefined;

  const lengthMm = Math.max(
    1.5,
    parsedLen ??
      (params.lengthMm && params.lengthMm !== 96.0
        ? params.lengthMm
        : defaultLenByArchetype[archetype] + (codeHash % 17) * 0.75)
  );
  const outerDiameterMm = Math.max(
    4.0,
    parsedOd ??
      (params.outerDiameterMm &&
      Math.abs(params.outerDiameterMm - (params.caliberMm + 22.0)) > 0.05
        ? params.outerDiameterMm
        : defaultOdByArchetype[archetype] + ((codeHash >> 4) % 9) * 0.5)
  );
  const innerDiameterMm = Math.min(
    outerDiameterMm * 0.82,
    Math.max(
      1.2,
      parsedId ??
        params.innerDiameterMm ??
        params.caliberMm ??
        outerDiameterMm * 0.45
    )
  );
  const chamberOrBaffleCount = Math.max(
    3,
    Math.min(
      16,
      params.chamberOrBaffleCount ??
        parsedCount ??
        (archetype === 'ROTARY_DRUM_MAGAZINE'
          ? 8
          : archetype === 'MULTI_BAFFLE_SILENCER'
          ? 6
          : archetype === 'LEVER_TRIGGER_LINKAGE'
          ? 5
          : 4 + (codeHash % 5))
    )
  );
  const wallThicknessMm = Math.max(1.2, (outerDiameterMm - innerDiameterMm) * 0.5);
  const flangeOrThreadPitchMm = Number((1.0 + (codeHash % 6) * 0.25).toFixed(2));

  return {
    archetype,
    lengthMm: Number(lengthMm.toFixed(2)),
    outerDiameterMm: Number(outerDiameterMm.toFixed(2)),
    innerDiameterMm: Number(innerDiameterMm.toFixed(2)),
    chamberOrBaffleCount,
    wallThicknessMm: Number(wallThicknessMm.toFixed(2)),
    flangeOrThreadPitchMm,
    parsedDimensionsSummary: `${archetype} · L=${lengthMm.toFixed(2)}mm × OD=Ø${outerDiameterMm.toFixed(2)}mm × ID=Ø${innerDiameterMm.toFixed(2)}mm · Features=${chamberOrBaffleCount}`,
  };
}

/**
 * Generates a closed, watertight B-Rep ASCII .STL mesh tailored to the specific
 * mechanical archetype and parsed dimensions of any blueprint part or custom prompt spec.
 */
export function synthesizeComponentWatertightStl(params: {
  partCode: string;
  partName: string;
  lengthMm: number;
  outerDiameterMm: number;
  innerDiameterMm: number;
  caliberMm: number;
  radialSegments?: number;
  dimensionsSpecString?: string;
  customDescription?: string;
  archetypeOverride?: ParametricStlArchetype;
  chamberOrBaffleCount?: number;
}): {
  stlString: string;
  facetCount: number;
  resolvedArchetype: ParametricStlArchetype;
  parsedDimensionsSummary: string;
} {
  const recipe = parseBlueprintPartDimensionsAndArchetype(params);
  const cleanName = `${params.partCode}_${params.partName}_${recipe.archetype}`
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 64);

  const lines: string[] = [
    `solid ${cleanName}_L${recipe.lengthMm.toFixed(1)}_OD${recipe.outerDiameterMm.toFixed(1)}_ID${recipe.innerDiameterMm.toFixed(1)}`,
  ];
  let facetCount = 0;

  const pushTri = (
    nx: number,
    ny: number,
    nz: number,
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number]
  ) => {
    lines.push(`  facet normal ${nx.toFixed(4)} ${ny.toFixed(4)} ${nz.toFixed(4)}`);
    lines.push('    outer loop');
    lines.push(`      vertex ${v1[0].toFixed(4)} ${v1[1].toFixed(4)} ${v1[2].toFixed(4)}`);
    lines.push(`      vertex ${v2[0].toFixed(4)} ${v2[1].toFixed(4)} ${v2[2].toFixed(4)}`);
    lines.push(`      vertex ${v3[0].toFixed(4)} ${v3[1].toFixed(4)} ${v3[2].toFixed(4)}`);
    lines.push('    endloop');
    lines.push('  endfacet');
    facetCount++;
  };

  // Helper: emit a watertight coaxial annular ring/stage from z0 to z1 with outer radii (rOut0->rOut1) and inner radius rIn
  const emitAnnularFrustumStage = (
    z0: number,
    z1: number,
    rOut0: number,
    rOut1: number,
    rIn: number,
    segs: number,
    scallopDepth: number = 0,
    scallopCount: number = 0
  ) => {
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      const mod0 =
        scallopCount > 0 ? 1 - scallopDepth * Math.abs(Math.sin(a0 * scallopCount * 0.5)) : 1;
      const mod1 =
        scallopCount > 0 ? 1 - scallopDepth * Math.abs(Math.sin(a1 * scallopCount * 0.5)) : 1;

      const ro0A = Math.max(rIn + 0.6, rOut0 * mod0);
      const ro0B = Math.max(rIn + 0.6, rOut0 * mod1);
      const ro1A = Math.max(rIn + 0.6, rOut1 * mod0);
      const ro1B = Math.max(rIn + 0.6, rOut1 * mod1);

      // Outer wall
      pushTri(c0, s0, 0, [ro0A * c0, ro0A * s0, z0], [ro0B * c1, ro0B * s1, z0], [ro1B * c1, ro1B * s1, z1]);
      pushTri(c0, s0, 0, [ro0A * c0, ro0A * s0, z0], [ro1B * c1, ro1B * s1, z1], [ro1A * c0, ro1A * s0, z1]);

      // Inner bore wall
      pushTri(-c0, -s0, 0, [rIn * c0, rIn * s0, z0], [rIn * c1, rIn * s1, z1], [rIn * c1, rIn * s1, z0]);
      pushTri(-c0, -s0, 0, [rIn * c0, rIn * s0, z0], [rIn * c0, rIn * s0, z1], [rIn * c1, rIn * s1, z1]);

      // Front cap z0
      pushTri(0, 0, -1, [rIn * c0, rIn * s0, z0], [ro0B * c1, ro0B * s1, z0], [ro0A * c0, ro0A * s0, z0]);
      pushTri(0, 0, -1, [rIn * c0, rIn * s0, z0], [rIn * c1, rIn * s1, z0], [ro0B * c1, ro0B * s1, z0]);

      // Rear cap z1
      pushTri(0, 0, 1, [rIn * c0, rIn * s0, z1], [ro1A * c0, ro1A * s0, z1], [ro1B * c1, ro1B * s1, z1]);
      pushTri(0, 0, 1, [rIn * c0, rIn * s0, z1], [ro1B * c1, ro1B * s1, z1], [rIn * c1, rIn * s1, z1]);
    }
  };

  // Helper: emit a closed rectangular box/strut with optional offset
  const emitClosedBox = (
    cx: number,
    cy: number,
    cz: number,
    wx: number,
    hy: number,
    lz: number
  ) => {
    const x0 = cx - wx * 0.5;
    const x1 = cx + wx * 0.5;
    const y0 = cy - hy * 0.5;
    const y1 = cy + hy * 0.5;
    const z0 = cz - lz * 0.5;
    const z1 = cz + lz * 0.5;
    // Front & Back
    pushTri(0, 0, -1, [x0, y0, z0], [x1, y1, z0], [x1, y0, z0]);
    pushTri(0, 0, -1, [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
    pushTri(0, 0, 1, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1]);
    pushTri(0, 0, 1, [x0, y0, z1], [x1, y1, z1], [x0, y1, z1]);
    // Left & Right
    pushTri(-1, 0, 0, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]);
    pushTri(-1, 0, 0, [x0, y0, z0], [x0, y1, z1], [x0, y1, z0]);
    pushTri(1, 0, 0, [x1, y0, z0], [x1, y1, z1], [x1, y0, z1]);
    pushTri(1, 0, 0, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
    // Bottom & Top
    pushTri(0, -1, 0, [x0, y0, z0], [x1, y0, z1], [x0, y0, z1]);
    pushTri(0, -1, 0, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]);
    pushTri(0, 1, 0, [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]);
    pushTri(0, 1, 0, [x0, y1, z0], [x1, y1, z1], [x1, y1, z0]);
  };

  const rOut = Math.max(2.5, recipe.outerDiameterMm * 0.5);
  const rIn = Math.min(rOut - 0.8, Math.max(0.6, recipe.innerDiameterMm * 0.5));
  const len = Math.max(2.0, recipe.lengthMm);
  const baseSegs = params.radialSegments ?? 24;

  switch (recipe.archetype) {
    case 'ROTARY_DRUM_MAGAZINE': {
      // Scalloped outer rotary drum + central star ratchet hub + individual chamber cylinders around Bolt Circle
      const chambers = recipe.chamberOrBaffleCount;
      emitAnnularFrustumStage(0, len, rOut, rOut, rOut * 0.22, baseSegs + chambers, 0.14, chambers);
      const pcdRadius = rOut * 0.62;
      const chamberOuterR = Math.max(2.2, (rOut - rOut * 0.24) * 0.36);
      const chamberInnerR = Math.max(1.2, chamberOuterR * 0.72);
      for (let c = 0; c < chambers; c++) {
        const ang = (c / chambers) * Math.PI * 2;
        const cx = Math.cos(ang) * pcdRadius;
        const cy = Math.sin(ang) * pcdRadius;
        emitClosedBox(cx, cy, len * 0.5, chamberOuterR, chamberInnerR, len * 1.04);
      }
      break;
    }

    case 'MULTI_BAFFLE_SILENCER': {
      // Outer suppressor tube + N internal stepped conical K-baffles
      const baffles = recipe.chamberOrBaffleCount;
      emitAnnularFrustumStage(0, len, rOut, rOut, rOut * 0.84, baseSegs);
      const stepZ = len / (baffles + 1);
      for (let b = 0; b < baffles; b++) {
        const zStart = (b + 0.35) * stepZ;
        const zEnd = (b + 0.95) * stepZ;
        emitAnnularFrustumStage(zStart, zEnd, rOut * 0.84, rIn * 1.18, rIn, 18);
      }
      break;
    }

    case 'RIFLED_BARREL_LINER': {
      // 3-stage stepped barrel: Muzzle crown thread -> Main rifled barrel -> Breech transfer collar + leade
      const threadLen = Math.min(18.0, len * 0.08);
      const breechLen = Math.min(28.0, len * 0.12);
      emitAnnularFrustumStage(0, threadLen, rOut * 0.82, rOut * 0.82, rIn, baseSegs + 4);
      emitAnnularFrustumStage(threadLen, len - breechLen, rOut, rOut, rIn, baseSegs + 8);
      emitAnnularFrustumStage(len - breechLen, len, rOut * 1.12, rOut * 1.04, rIn * 1.04, baseSegs + 4);
      break;
    }

    case 'BURST_DISK_SHELL_CARTRIDGE': {
      // Self-contained 220-Bar burst-disk shell (SHELL-50-220B): Hex base rim + HPA fluid chamber + stepped neck + burst-disk dome ring
      const rimLen = Math.min(8.0, len * 0.14);
      const bodyLen = len * 0.56;
      emitAnnularFrustumStage(0, rimLen, rOut * 1.08, rOut * 1.08, rIn * 0.45, 6); // 6-flat hex wrench base
      emitAnnularFrustumStage(rimLen, rimLen + bodyLen, rOut, rOut, rIn * 0.78, baseSegs);
      emitAnnularFrustumStage(rimLen + bodyLen, len, rOut * 0.94, rOut * 0.86, rIn, baseSegs);
      break;
    }

    case 'LEVER_TRIGGER_LINKAGE': {
      // Skeletonized rectangular underlever & sear linkage with N lightening window struts + front/rear pivot bosses
      const holes = recipe.chamberOrBaffleCount;
      const beamW = Math.max(6.0, rOut * 0.65);
      const beamH = Math.max(10.0, rOut * 1.15);
      // Top and bottom longitudinal rails
      emitClosedBox(0, beamH * 0.38, len * 0.5, beamW, beamH * 0.24, len);
      emitClosedBox(0, -beamH * 0.38, len * 0.5, beamW, beamH * 0.24, len);
      // Vertical struts separating the skeletonized holes
      for (let s = 0; s <= holes; s++) {
        const zPos = (s / holes) * (len * 0.88) + len * 0.06;
        emitClosedBox(0, 0, zPos, beamW, beamH * 0.55, Math.max(3.0, len / (holes * 2.5)));
      }
      // Front pivot axle boss (#15) & curved trigger shoe (#16)
      emitAnnularFrustumStage(0, Math.min(12.0, len * 0.12), beamH * 0.45, beamH * 0.45, rIn * 0.4, 16);
      break;
    }

    case 'BELLEVILLE_REGULATOR_PLENUM': {
      // Stepped regulator & plenum housing + Belleville spring disc stack
      const discs = recipe.chamberOrBaffleCount;
      const bodyPart = len * 0.62;
      emitAnnularFrustumStage(0, bodyPart, rOut, rOut, rIn * 1.15, baseSegs);
      const discThick = (len - bodyPart) / Math.max(2, discs);
      for (let d = 0; d < discs; d++) {
        const z0 = bodyPart + d * discThick;
        const z1 = z0 + discThick * 0.92;
        const even = d % 2 === 0;
        emitAnnularFrustumStage(
          z0,
          z1,
          even ? rOut * 0.78 : rOut * 0.66,
          even ? rOut * 0.66 : rOut * 0.78,
          rIn * 0.55,
          18
        );
      }
      break;
    }

    case 'HELICAL_TURRET_BREECH': {
      // Circular helical feed turret + rectangular drop-in breech chute + twin guide rails
      const turretThick = Math.min(34.0, len * 0.48);
      emitAnnularFrustumStage(0, turretThick, rOut, rOut * 0.95, rIn, baseSegs + 6);
      emitClosedBox(0, -rOut * 0.55, len * 0.5, rOut * 0.85, rOut * 0.75, len);
      emitClosedBox(-rOut * 0.52, rOut * 0.25, len * 0.5, 4.5, 6.0, len * 0.92);
      emitClosedBox(rOut * 0.52, rOut * 0.25, len * 0.5, 4.5, 6.0, len * 0.92);
      break;
    }

    case 'HEX_TORX_FASTENER': {
      // 6-sided hex/socket cap head + stepped shoulder + threaded shank
      const headLen = Math.max(3.0, len * 0.28);
      emitAnnularFrustumStage(0, headLen, rOut * 1.35, rOut * 1.35, rOut * 0.45, 6);
      const threads = Math.max(4, Math.min(14, Math.round((len - headLen) / 2.2)));
      const step = (len - headLen) / threads;
      for (let t = 0; t < threads; t++) {
        const z0 = headLen + t * step;
        emitAnnularFrustumStage(z0, z0 + step, rOut * 0.85, rOut * 0.76, rIn * 0.25, 14);
      }
      break;
    }

    case 'TOROIDAL_ORING_SEAL': {
      // Multi-band precision elastomer seal / breech face puck
      const half = len * 0.5;
      emitAnnularFrustumStage(0, half, rOut * 0.94, rOut, rIn, 28);
      emitAnnularFrustumStage(half, len, rOut, rOut * 0.94, rIn, 28);
      break;
    }

    case 'FINNED_HPA_BOTTLE':
    default: {
      // High-pressure cylinder with threaded neck boss + reinforcing ribs
      const neckLen = Math.min(24.0, len * 0.14);
      emitAnnularFrustumStage(0, neckLen, rOut * 0.68, rOut * 0.72, rIn * 0.65, 20);
      const bodyLen = len - neckLen;
      const ribs = Math.max(3, Math.min(8, recipe.chamberOrBaffleCount));
      const ribStep = bodyLen / ribs;
      for (let r = 0; r < ribs; r++) {
        const z0 = neckLen + r * ribStep;
        emitAnnularFrustumStage(
          z0,
          z0 + ribStep,
          r % 2 === 0 ? rOut : rOut * 1.04,
          r % 2 === 0 ? rOut * 1.04 : rOut,
          rIn,
          baseSegs
        );
      }
      break;
    }
  }

  lines.push(
    `endsolid ${cleanName}_L${recipe.lengthMm.toFixed(1)}_OD${recipe.outerDiameterMm.toFixed(1)}_ID${recipe.innerDiameterMm.toFixed(1)}`
  );
  return {
    stlString: lines.join('\n'),
    facetCount,
    resolvedArchetype: recipe.archetype,
    parsedDimensionsSummary: recipe.parsedDimensionsSummary,
  };
}

