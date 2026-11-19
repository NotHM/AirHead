import { DischargeMechanismType } from './popular25Catalog';
import {
  BaseWeaponFamilyId,
  BurstDiskEvolutionStage,
  RexConfigurationMode,
} from './weaponFamiliesAndCompatibility';
import { Weapon3DFamilyContext } from './weapon3d';

export type CanonicalGunProgressionId =
  | 'GUN_01_PEN'
  | 'GUN_02_REXP'
  | 'GUN_03_DEFENDER'
  | 'GUN_04_LESHIY'
  | 'GUN_04B_THE_LEAF_45'
  | 'GUN_05_MP30'
  | 'GUN_06_P50'
  | 'GUN_07_ASCENT45'
  | 'GUN_09_PROTECTOR';

export interface BlueprintScrewFastenerSpec {
  code: string;
  name: string;
  threadMetricSpec: string;
  headAndDrive: string;
  materialGrade: string;
  torqueNm: number;
  locationAndRole: string;
  pinX: number;
  pinY: number;
}

export interface BlueprintOringPlacementSpec {
  code: string;
  name: string;
  isoOrParkerSizeMm: string;
  compoundAndDurometer: string;
  sealType: 'STATIC_RADIAL' | 'STATIC_FACE' | 'DYNAMIC_PISTON_OR_PROBE' | 'BREECH_TRANSFER';
  glandSqueezePct: number;
  maxRatedBar: number;
  placementAndFunction: string;
  pinX: number;
  pinY: number;
}

export interface BlueprintUniquePartNode {
  partCode: string;
  partName: string;
  dimensionsMm: string;
  material: string;
  pressureZoneBar: number;
  roleDescription: string;
  pinX: number;
  pinY: number;
}

export interface CanonicalWeaponBlueprintSpec {
  progressionId: CanonicalGunProgressionId;
  tierOrder: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  versionId: string;
  versionTag: string;
  shortTitle: string;
  fullTitle: string;
  isDefaultStarterOption: boolean;
  familyId: BaseWeaponFamilyId;
  burstStage: BurstDiskEvolutionStage;
  rexMode: RexConfigurationMode;
  upperPlatformId: string;
  lowerPlatformId: string;
  dischargeType: DischargeMechanismType;
  defaultCaliberMm: number;
  imperialCaliberLabel: string;
  operatingPressureBar: number;
  muzzleEnergyJoules: number;
  magazineCapacity: number;
  functionalCycleSummary: string;
  airflowCompressionToReleaseSummary: string;
  screwsAndFasteners: BlueprintScrewFastenerSpec[];
  oringPlacements: BlueprintOringPlacementSpec[];
  uniqueParts: BlueprintUniquePartNode[];
}

export const CANONICAL_7_WEAPONS_PROGRESSION: CanonicalWeaponBlueprintSpec[] = [
  {
    progressionId: 'GUN_01_PEN',
    tierOrder: 1,
    versionId: 'ver_v1_pen_gun',
    versionTag: 'v1.0',
    shortTitle: '#01 Mongo (VID105/107 .45 / 9mm / .410 Pen Gun)',
    fullTitle:
      '#01 Mongo — Texoma VID105/VID107 Air Pen Gun (.45 Cal, 9mm & .410 Shotgun Screw-On Barrels · 310B Front-Fill Burst Cartridge)',
    isDefaultStarterOption: true,
    familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_20_texoma_pellet_pen',
    lowerPlatformId: 'plat_20_texoma_pellet_pen',
    dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
    defaultCaliberMm: 11.43,
    imperialCaliberLabel: '.45 Cal / 9mm / .410 Shotgun (Modular Screw-On)',
    operatingPressureBar: 310,
    muzzleEnergyJoules: 165,
    magazineCapacity: 1,
    functionalCycleSummary:
      'Built to exact Texoma Precision Pellet VID105 (x9-JjJuyLOs), VID107 (x0ghlafy-AM) & Autumn’s Armory (x9feufnloKc) Spec: 3-piece unshrouded coaxial pen launcher with ZERO regulator, ZERO external plenum, and ZERO baffle moderator. (1) Unscrew the stainless rear cap on the AEA air cartridge, insert a flat 5,000 PSI metal burst disk, and pump 4,500 PSI (310 Bar) into the FRONT nozzle (pushing the internal O-ring shuttle piston rearward). (2) Drop the charged cartridge into the center chamber sleeve and screw on one of the 3 interchangeable front barrels: .45 Cal (11.43mm) rifled slug barrel, 9mm (.357) barrel, or .410 smoothbore shotgun barrel loaded with #4 buckshot, dual .32 balls, or #8 shot wads. (3) Pull the thumb cocking stud back into the rear L-slot safety notch, twist to release, and the rear firing pin ruptures the rear 5,000 PSI burst disk to dump 100% of the cartridge out the front nozzle.',
    airflowCompressionToReleaseSummary:
      'True Front-Fill Shuttle Piston + Rear 5,000 PSI Burst-Disk Cartridge Physics (x9feufnloKc & VID105/107): Air is pumped into the FRONT of the removable 11.2cc cartridge to 310 Bar (4,500 PSI), driving the internal O-ring shuttle piston rearward against its internal spring and molding the flat 5,000 PSI metal burst disk against the rear retainer seat. When the rear L-slot striker needle pierces the rear burst disk, the shuttle piston unseats and dumps 100% of the 310-Bar gas out the front nozzle straight into the interchangeable .45 Cal, 9mm, or .410 Shotgun barrel.',
    screwsAndFasteners: [
      {
        code: 'PEN-SCR-01',
        name: 'L-Slot Bolt Handle Radial Cocking Stud (Rear Tube)',
        threadMetricSpec: 'M4×0.7 × 8mm Hardened Shoulder Stud',
        headAndDrive: 'Knurled Thumb Cocking Knob (2.5mm Hex Socket Core)',
        materialGrade: '4140 Chromoly Black Oxide Steel (HRC 46)',
        torqueNm: 4.2,
        locationAndRole:
          'Threads radially into the internal striker hammer and locks into the rear L-shaped safety/cocking track (VID105/VID107).',
        pinX: 165,
        pinY: 162,
      },
      {
        code: 'PEN-SCR-02',
        name: 'Cartridge Rear Stainless 5,000 PSI Burst-Disk Retainer Cap',
        threadMetricSpec: 'M14×1.0 Fine Pitch Rear Cartridge Retainer Thread',
        headAndDrive: '14mm Spanner Wrench Flats on Rear Stainless Cap',
        materialGrade: '316L Stainless Steel Cap + 7075 Red Anodized Cartridge',
        torqueNm: 14.0,
        locationAndRole:
          'Unscrews at the BACK of the removable air cartridge to drop in a fresh flat circular 5,000 PSI metal burst disk (Video x9feufnloKc).',
        pinX: 305,
        pinY: 162,
      },
      {
        code: 'PEN-SCR-03',
        name: 'Center Cartridge Chamber-to-Striker Tube Coupler Thread',
        threadMetricSpec: 'M18×1.0 Fine Pitch Coaxial Receiver Thread',
        headAndDrive: 'Knurled Cylindrical Center Sleeve',
        materialGrade: '7075-T651 Hard Red Anodized Aluminum',
        torqueNm: 11.5,
        locationAndRole:
          'Joins the rear L-slot striker tube to the middle AEA air cartridge chamber after inserting the pre-charged cartridge.',
        pinX: 455,
        pinY: 162,
      },
      {
        code: 'PEN-SCR-04',
        name: 'Interchangeable Front Barrel Thread (.45 Cal / 9mm / .410 Shotgun)',
        threadMetricSpec: 'M18×1.0 × 14mm Modular Front Barrel Thread',
        headAndDrive: 'Knurled Barrel Collar (Hand-Tighten Against Front O-Ring)',
        materialGrade: '4140 Nitride Steel Barrel + 7075 Collar',
        torqueNm: 10.5,
        locationAndRole:
          'Allows rapid screw-on swapping between the .45 Cal rifled barrel, 9mm (.357) barrel, and .410 Bore Shotgun smoothbore barrel (VID105 & VID107).',
        pinX: 615,
        pinY: 162,
      },
    ],
    oringPlacements: [
      {
        code: 'PEN-OR-01',
        name: 'Striker Firing Pin Guide Bushing O-Ring',
        isoOrParkerSizeMm: '4.00mm ID × 1.50mm CS',
        compoundAndDurometer: 'PTFE-Coated Viton FKM-90',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 17.5,
        maxRatedBar: 310,
        placementAndFunction:
          'Buffers the forward-facing striker pin and prevents rear gas blow-by into the L-slot cocking channel upon rear burst-disk puncture.',
        pinX: 235,
        pinY: 162,
      },
      {
        code: 'PEN-OR-02',
        name: 'Cartridge Rear 5,000 PSI Burst-Disk Seat O-Ring',
        isoOrParkerSizeMm: '10.50mm ID × 1.50mm CS (Rear Retainer Seat)',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 23.0,
        maxRatedBar: 345,
        placementAndFunction:
          'Seals the flat circular 5,000 PSI metal burst disk inside the stainless rear retainer cap when pressurized from the front (x9feufnloKc).',
        pinX: 365,
        pinY: 162,
      },
      {
        code: 'PEN-OR-03',
        name: 'Cartridge Internal Front-Fill Sliding Shuttle Piston O-Rings (2×)',
        isoOrParkerSizeMm: '12.00mm ID × 1.80mm CS Dynamic Shuttle Gland',
        compoundAndDurometer: 'Polyurethane PU-95A + Viton FKM-90',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 19.5,
        maxRatedBar: 345,
        placementAndFunction:
          'Mounted on the internal sliding shuttle plunger inside the cartridge: slides rearward during front-end 4,500 PSI filling and dumps forward on firing.',
        pinX: 420,
        pinY: 162,
      },
      {
        code: 'PEN-OR-04',
        name: 'Cartridge Front Nozzle-to-Interchangeable Barrel Throat O-Ring',
        isoOrParkerSizeMm: '14.00mm ID × 2.00mm CS (Parker 2-015)',
        compoundAndDurometer: 'Viton FKM-90 Shore A (High-Temp Fluorocarbon)',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 20.5,
        maxRatedBar: 345,
        placementAndFunction:
          'Seals the front discharge nozzle of the air cartridge directly into the screw-on .45 Cal, 9mm, or .410 Shotgun barrel throat.',
        pinX: 525,
        pinY: 162,
      },
    ],
    uniqueParts: [
      {
        partCode: 'PEN-01',
        partName: 'Interchangeable Screw-On Barrels: .45 Cal Slug, 9mm (.357) & .410 Shotgun (VID105/107)',
        dimensionsMm: 'L=115.0mm · OD=Ø18.0mm · Bores: Ø11.43mm (.45) / Ø9.07mm (9mm) / Ø10.41mm (.410)',
        material: '4140 Nitride Rifled (.45/9mm) & Smoothbore (.410) Barrels',
        pressureZoneBar: 310,
        roleDescription:
          'Threads directly onto the front of the cartridge sleeve with zero shroud or baffles; fires .45/9mm lead slugs or .410 shot wads (#4 buckshot, dual .32 balls, #8 shot).',
        pinX: 655,
        pinY: 62,
      },
      {
        partCode: 'SHELL-50-220B',
        partName: 'AEA 4,500 PSI (310 Bar) Front-Fill Air Cartridge w/ Internal Shuttle Piston',
        dimensionsMm: 'L=68.0mm · OD=Ø18.0mm · Vol=11.2cc @ 310 Bar (4,500 PSI)',
        material: '7075-T651 Red Anodized Vessel + Internal Spring Shuttle Plunger',
        pressureZoneBar: 310,
        roleDescription:
          'Filled from the FRONT nozzle to 4,500 PSI (310 Bar), pushing the internal shuttle piston rearward against its spring (shared w/ #03 AEA Harpoon/Defender).',
        pinX: 435,
        pinY: 62,
      },
      {
        partCode: 'PEN-03',
        partName: 'Rear Stainless Retainer Cap & Flat 5,000 PSI (345 Bar) Metal Burst Disk',
        dimensionsMm: 'Disk Thick=0.12mm · OD=Ø13.80mm · M14×1.0 Stainless Rear Cap',
        material: '316L Stainless Retainer + 5,000 PSI CuNi Burst Disk',
        pressureZoneBar: 345,
        roleDescription:
          'Clamped at the BACK of the cartridge; molds into a dome under 4,500 PSI front fill and ruptures in 0.15ms when struck by the rear firing pin.',
        pinX: 305,
        pinY: 62,
      },
      {
        partCode: 'PEN-04',
        partName: 'Rear L-Slot Striker Tube, Coil Mainspring & Ti-6Al-4V Pocket Clip',
        dimensionsMm: 'L=112.0mm · OD=Ø20.5mm · ID=Ø18.10mm · Firing Pin=Ø2.5mm',
        material: '17-4PH H900 Striker + 7075-T651 Tube + Ti-6Al-4V Clip',
        pressureZoneBar: 0,
        roleDescription:
          'Houses the 42 N/mm coil mainspring, thumb cocking knob in the L-shaped safety slot, and forward firing pin that strikes the rear burst disk.',
        pinX: 155,
        pinY: 62,
      },
    ],
  },
  {
    progressionId: 'GUN_02_REXP',
    tierOrder: 2,
    versionId: 'ver_v2_evanix_rexp',
    versionTag: 'v2.0',
    shortTitle: '#02 REX-P (.30 Coaxial · Rebuilt #14–#20)',
    fullTitle:
      '#02 REX-P .30 Cal (7.62mm) Coaxial Monolith Pistol & Sniper Carbine (12-Part Blueprint · Rebuilt #14–#20 Lever-Trigger Group & Single-Round Breech Load)',
    isDefaultStarterOption: true,
    familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_22_fx_panthera',
    lowerPlatformId: 'plat_22_fx_panthera',
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
    defaultCaliberMm: 7.62,
    imperialCaliberLabel: '.30 Cal (7.62mm)',
    operatingPressureBar: 250,
    muzzleEnergyJoules: 135,
    magazineCapacity: 1,
    functionalCycleSummary:
      'Complete 57-Part Korean Factory Schematic Rebuild (12-Part Master Blueprint): Swing the skeletonized 5-hole steel underlever trigger guard (#14) downward 42° around front pivot axle (#15) to cam open the axial breech block (#11) and draw the coaxial striker (#31) onto the hardened A2 primary sear dog (#18). Thumb-load a .30 Cal (7.62mm) slug into the rifled barrel throat (#03), return lever (#14) flush, disengage cross-bolt safety (#20), and pull the curved 2-stage match trigger blade (#16) to pull horizontal sear transfer bar (#17) forward and fire the 180° inline PEEK poppet (#32).',
    airflowCompressionToReleaseSummary:
      '250-Bar HPA is stored inside the rear coaxial air cylinder (#37, 190cc Pistol / 480cc Sniper) monitored by rear axial manometer (#40). When sear dog (#18) releases coaxial striker (#31), it drives balanced PEEK poppet (#32) open 3.9mm in 1.65ms across brass Venturi seat (#33), blasting 250-Bar air straight down the 180° bore axis with zero 90° transfer-port turn loss.',
    screwsAndFasteners: [
      {
        code: 'REX-SCR-01',
        name: 'Part #15 Underlever Trigger Guard Front Pivot Axle & Lock Bolt',
        threadMetricSpec: 'Ø6.00mmH7 Hardened Pivot Pin + M4×0.7 Retaining Cap Screw',
        headAndDrive: '3.0mm Internal Hex Socket (12.9 Alloy Steel)',
        materialGrade: 'SCM435 Alloy Steel (HRC 44)',
        torqueNm: 6.5,
        locationAndRole:
          'Forms the zero-play front fulcrum for the 5-hole skeletonized underlever cocking guard (#14) at the front receiver lug.',
        pinX: 358,
        pinY: 152,
      },
      {
        code: 'REX-SCR-02',
        name: 'Part #16/#17 Trigger Blade & Horizontal Transfer Bar Clevis Pins (2×)',
        threadMetricSpec: 'Ø3.00mmh6 Precision Dowel Pins + E-Clip Retainers',
        headAndDrive: 'Ground Shoulder Dowel with Recessed Circlip Groove',
        materialGrade: '420J2 Hardened Stainless Steel',
        torqueNm: 2.4,
        locationAndRole:
          'Links the curved 2-stage match trigger blade (#16) to the 68mm horizontal sear transfer bar (#17) with zero radial collision.',
        pinX: 392,
        pinY: 162,
      },
      {
        code: 'REX-SCR-03',
        name: 'Part #18/#19 Rear Primary Sear Dog Fulcrum Pin & Overtravel Grub Screw',
        threadMetricSpec: 'Ø4.00mmH7 Sear Axle + M3×0.5 × 6mm Fine Adjustment Grub',
        headAndDrive: '1.5mm Hex Socket Set Screw (Loctite 222 Purple)',
        materialGrade: 'A2 Tool Steel Axle + 316L Set Screw',
        torqueNm: 1.8,
        locationAndRole:
          'Supports the hardened primary sear dog (#18) and tunes 1st/2nd stage sear engagement against coaxial striker (#31).',
        pinX: 438,
        pinY: 148,
      },
      {
        code: 'REX-SCR-04',
        name: 'Part #11 Axial Breech Slide Guide Shoulder Bolt',
        threadMetricSpec: 'M4×0.7 × 10mm Precision Ground Shoulder Screw',
        headAndDrive: '3.0mm Hex Socket Cap',
        materialGrade: 'SCM435 Alloy Steel (HRC 42)',
        torqueNm: 5.5,
        locationAndRole:
          'Tracks the axial/vertical travel of Breech Block (#11) inside Monolithic Receiver (#08).',
        pinX: 410,
        pinY: 88,
      },
      {
        code: 'REX-SCR-05',
        name: 'Part #04 Barrel & Slotted Shroud Retaining Grub Screws (3×)',
        threadMetricSpec: 'M5×0.8 × 6mm Cup-Point Grub Screws',
        headAndDrive: '2.5mm Internal Hex Drive',
        materialGrade: '4140 Black Oxide Steel',
        torqueNm: 6.8,
        locationAndRole:
          'Locks the 7.62mm rifled barrel (#03) and slotted shroud (#02) coaxially inside the front receiver monolith (#08).',
        pinX: 245,
        pinY: 96,
      },
      {
        code: 'REX-SCR-06',
        name: 'Part #37 Rear Coaxial Air Cylinder Buttstock Thread',
        threadMetricSpec: 'M28×1.25 Coaxial High-Pressure Butt Thread',
        headAndDrive: 'Spanner Wrench Slots + Knurled Lock Collar',
        materialGrade: '7075-T651 Hard Black Anodized',
        torqueNm: 28.0,
        locationAndRole:
          'Threads the 250-Bar rear air cylinder (#37) directly into the rear of Coaxial Valve Housing (#34).',
        pinX: 545,
        pinY: 132,
      },
    ],
    oringPlacements: [
      {
        code: 'REX-OR-01',
        name: 'Part #05/#06 Dual Opposed Breech Throat Transfer O-Rings',
        isoOrParkerSizeMm: '7.62mm ID × 1.50mm CS (Dual Opposed)',
        compoundAndDurometer: 'Polyurethane PU-90A (High-Extrusion Resistance)',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 19.5,
        maxRatedBar: 250,
        placementAndFunction:
          'Straddles the single-shot loading window on Breech Slide (#11) to seal the 250-Bar coaxial blast.',
        pinX: 415,
        pinY: 118,
      },
      {
        code: 'REX-OR-02',
        name: 'Part #32/#33 PEEK Poppet Conical Venturi Face Seal',
        isoOrParkerSizeMm: '9.20mm Seat OD × 2.20mm Conical Contact Band',
        compoundAndDurometer: 'Virgin Ketron PEEK-1000 on C36000 Brass Seat',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 22.0,
        maxRatedBar: 300,
        placementAndFunction:
          'Holds 250-Bar tank pressure at the 180° inline throat and snaps open 3.9mm when struck by Striker (#31).',
        pinX: 472,
        pinY: 122,
      },
      {
        code: 'REX-OR-03',
        name: 'Part #35 Coaxial Poppet Stem Dynamic Balance O-Ring',
        isoOrParkerSizeMm: '4.50mm ID × 1.50mm CS',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 15.8,
        maxRatedBar: 250,
        placementAndFunction:
          'Balances upstream 250-Bar pressure on the rear of Poppet (#32) so low hammer energy opens a massive 7.8mm flow port.',
        pinX: 495,
        pinY: 132,
      },
      {
        code: 'REX-OR-04',
        name: 'Part #36 Valve Housing High-Pressure Bulkhead O-Rings (2×)',
        isoOrParkerSizeMm: '24.00mm ID × 2.50mm CS',
        compoundAndDurometer: 'Nitrile NBR-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 21.2,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the M28×1.25 threaded joint between Rear Air Tube (#37) and Poppet Valve Housing (#34).',
        pinX: 525,
        pinY: 132,
      },
      {
        code: 'REX-OR-05',
        name: 'Part #07 Barrel Exterior Harmonic & Reflex Shroud O-Rings (2×)',
        isoOrParkerSizeMm: '12.00mm ID × 2.00mm CS',
        compoundAndDurometer: 'Nitrile NBR-70 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 17.0,
        maxRatedBar: 120,
        placementAndFunction:
          'Centers the 7.62mm barrel (#03) inside Slotted Shroud (#02) and seals rear reflex gas stripping.',
        pinX: 210,
        pinY: 118,
      },
      {
        code: 'REX-OR-06',
        name: 'Part #39 Rear Manometer & Foster Check-Valve Face Seal',
        isoOrParkerSizeMm: '10.00mm ID × 1.80mm CS Dowty/Viton Seal',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 20.4,
        maxRatedBar: 310,
        placementAndFunction:
          'Seals the rear 0–300 Bar axial pressure gauge (#40) and 1-way fill check valve at the tail of Tube (#37).',
        pinX: 685,
        pinY: 132,
      },
    ],
    uniqueParts: [
      {
        partCode: 'REX-01',
        partName: 'Part #01/#02 Slotted Coaxial Shroud & 8-Baffle Sniper Moderator',
        dimensionsMm: 'L=235.0mm (Pistol) / 580.0mm (Sniper) · OD=Ø28.0mm · ID=Ø22.0mm',
        material: '6061-T6 Matte Black Anodized + 7075 K-Baffles',
        pressureZoneBar: 45,
        roleDescription:
          'Vents stripped muzzle gas backward into reflex volume; extends with 8-baffle moderator in Sniper Carbine mode.',
        pinX: 145,
        pinY: 118,
      },
      {
        partCode: 'REX-02',
        partName: 'Part #03 Korean .30 Cal (7.62mm) Button-Rifled Barrel Liner',
        dimensionsMm: 'L=235.0mm / 580.0mm · OD=Ø14.0mm · Bore=Ø7.62mm (6-Groove)',
        material: 'SCM440 Chrome-Moly Precision Barrel Steel',
        pressureZoneBar: 240,
        roleDescription:
          'Coaxially aligned directly ahead of Poppet (#32) withchamfered single-shot thumb-loading leade.',
        pinX: 245,
        pinY: 118,
      },
      {
        partCode: 'REX-03',
        partName: 'Part #08 Monolithic CNC Receiver & #29 Cantilever Picatinny Scope Rail',
        dimensionsMm: 'L=220.0mm · OD=Ø32.0mm · Bore=Ø14.0mm',
        material: '7075-T651 Billet Aluminum (Hard Black Anodized)',
        pressureZoneBar: 250,
        roleDescription:
          'Unifies the barrel socket, open loading window, lower sear pocket, and cantilever 21.2mm optics bridge.',
        pinX: 335,
        pinY: 96,
      },
      {
        partCode: 'REX-04',
        partName: 'Part #11 Cylindrical Axial Breech Slide & Knurled Locking Collar',
        dimensionsMm: 'L=48.5mm · OD=Ø28.0mm · ID=Ø14.02mm',
        material: '17-4PH Condition H900 Stainless Steel',
        pressureZoneBar: 250,
        roleDescription:
          'Slides 26mm forward/upward to expose the .30 barrel throat (#03) and dual PU-90A O-rings (#05/#06) for direct loading.',
        pinX: 412,
        pinY: 108,
      },
      {
        partCode: 'REX-05',
        partName: 'Part #14 5-Hole Skeletonized Steel Underlever Cocking Guard',
        dimensionsMm: 'L=148.0mm · W=14.0mm · 5× Ø9.5mm Lightening Holes',
        material: '4140 Laser-Cut & CNC-Chamfered Chromoly Steel',
        pressureZoneBar: 0,
        roleDescription:
          'Pivots downward 42° around front pin (#15) to cam Striker (#31) rearward onto Sear Dog (#18) with zero frame collision.',
        pinX: 375,
        pinY: 185,
      },
      {
        partCode: 'REX-06',
        partName: 'Part #15 Underlever Front Fulcrum Boss & Breech Cocking Cam Link',
        dimensionsMm: 'L=44.0mm · OD=Ø12.0mm · ID=Ø6.00mmH7',
        material: 'SCM435 Case-Hardened Alloy Steel',
        pressureZoneBar: 0,
        roleDescription:
          'Translates the 42° angular throw of Underlever (#14) into a 22mm linear cocking stroke on Striker (#31).',
        pinX: 355,
        pinY: 152,
      },
      {
        partCode: 'REX-07',
        partName: 'Part #16 Curved 2-Stage Match Trigger Blade & Dedicated Inner Guard',
        dimensionsMm: 'L=38.0mm · W=8.0mm · 1st/2nd Stage Shoe',
        material: 'TiN Gold-Coated 7075-T6 Blade + CNC Inner Bow',
        pressureZoneBar: 0,
        roleDescription:
          'Housed inside its own inner trigger bow above Underlever (#14); pulls Transfer Bar (#17) forward on fire.',
        pinX: 392,
        pinY: 162,
      },
      {
        partCode: 'REX-08',
        partName: 'Part #17 Horizontal Sear Transfer Bar & #20 Cross-Bolt Manual Safety',
        dimensionsMm: 'L=68.0mm · W=4.0mm · H=6.5mm · Safety Ø5.0mm',
        material: '17-4PH Precision Wire-EDM Stainless Linkage',
        pressureZoneBar: 0,
        roleDescription:
          'Bridges front Trigger Blade (#16) to rear Primary Sear Dog (#18); physically blocked when Safety (#20) is engaged.',
        pinX: 418,
        pinY: 152,
      },
      {
        partCode: 'REX-09',
        partName: 'Part #18 Hardened Primary Sear Dog & #19 Dual Torsion Return Springs',
        dimensionsMm: 'L=24.0mm · OD=Ø14.0mm · ID=Ø4.00mmH7',
        material: 'A2 Tool Steel (HRC 58) + Music-Wire Torsion Springs',
        pressureZoneBar: 0,
        roleDescription:
          'Holds Coaxial Striker (#31) against 65 N/mm hammer spring load and drops cleanly when Transfer Bar (#17) advances.',
        pinX: 446,
        pinY: 148,
      },
      {
        partCode: 'REX-10',
        partName: 'Part #31 Coaxial Linear Striker & #28 Checkered Target Pistol Grip',
        dimensionsMm: 'L=52.0mm · OD=Ø22.0mm · ID=Ø9.5mm',
        material: '4140 Chromoly Striker + PA12-CF Ergonomic Grip',
        pressureZoneBar: 0,
        roleDescription:
          'Accelerates coaxially forward along the rear valve stem axis to strike PEEK Poppet (#32).',
        pinX: 472,
        pinY: 175,
      },
      {
        partCode: 'REX-11',
        partName: 'Part #32/#33/#34 Balanced Coaxial PEEK Poppet & Venturi Valve Manifold',
        dimensionsMm: 'L=56.0mm · OD=Ø32.0mm · Bore=Ø7.80mm Venturi',
        material: 'Ketron PEEK-1000 Poppet + C36000 Brass Seat + 7075 Body',
        pressureZoneBar: 250,
        roleDescription:
          'Opens a straight 180° inline flow path from Rear Tank (#37) directly into Barrel (#03) in 1.65ms.',
        pinX: 505,
        pinY: 128,
      },
      {
        partCode: 'REX-12',
        partName: 'Part #37/#40 250-Bar Coaxial Rear Air Cylinder & Luminous Manometer',
        dimensionsMm: 'L=245.0mm (190cc) / 380.0mm (480cc) · OD=Ø35.0mm · ID=Ø28.2mm',
        material: '7075-T651 Seamless Aircraft Tube + Wika 300B Gauge',
        pressureZoneBar: 250,
        roleDescription:
          'Forms the structural rear spine / shoulder stock holding 250-Bar HPA with rear axial gauge (#40) and fill port.',
        pinX: 615,
        pinY: 132,
      },
    ],
  },
  {
    progressionId: 'GUN_03_DEFENDER',
    tierOrder: 3,
    versionId: 'ver_v3_aea_defender',
    versionTag: 'v3.0',
    shortTitle: '#03 AEA Harpoon .50 & .72 Cane (x9feufnloKc / jgDYcypjHeI)',
    fullTitle:
      '#03 AEA Harpoon / Defender Over-Under .50 Cal & .72 Cal (18.3mm) Walking Cane System (310B Front-Fill 5,000 PSI Burst Cartridges)',
    isDefaultStarterOption: false,
    familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_23_aea_megalodon',
    lowerPlatformId: 'plat_23_aea_megalodon',
    dischargeType: 'SACRIFICIAL_BURST_DISK_3200PSI',
    defaultCaliberMm: 12.7,
    imperialCaliberLabel: '.50 Cal Harpoon / .72 Cal (18.3mm) Cane',
    operatingPressureBar: 310,
    muzzleEnergyJoules: 285,
    magazineCapacity: 2,
    functionalCycleSummary:
      'Built to exact Autumn’s Armory AEA Harpoon (x9feufnloKc) & Thomas Jay .72 Cal Walking Cane (jgDYcypjHeI) Spec: Uses removable pre-charged HPA cartridges (11.2cc standard or 25cc Magnum) with a stainless rear cap clamping a flat 5,000 PSI (345 Bar) metal burst disk and a FRONT-FILL internal O-ring shuttle piston pumped to 4,500 PSI (310 Bar). Press the top break-open latch to pivot the over-under twin barrels down 42°, drop in 2× front-filled cartridges, and load .50 Cal slugs, 8-pellet buckshot wads, 375gr carbon harpoon arrows, or thread on the concealed .72 Cal (18.3mm / 12-Ga) Walking Cane barrel shaft.',
    airflowCompressionToReleaseSummary:
      'Per Video x9feufnloKc & jgDYcypjHeI: There is zero onboard regulator or external plenum. Pumping 4,500–5,000 PSI into the FRONT of each cartridge drives its internal shuttle piston rearward against its spring, sealing the chamber and doming the rear 5,000 PSI metal burst disk. Pulling the alternating double-action trigger drives the rear firing pin through the rear burst disk, unseating the shuttle piston so 100% of the 310-Bar charge dumps out the front nozzle behind the .50 slug, buckshot wad, harpoon arrow, or .72 Cal (18.3mm) cane slug.',
    screwsAndFasteners: [
      {
        code: 'DEF-SCR-01',
        name: 'Ergonomic Grip & Alternating Double-Action Sear Screws (4×)',
        threadMetricSpec: 'M4×0.7 × 12mm Socket Head Cap Screws',
        headAndDrive: '2.5mm Internal Hex Drive',
        materialGrade: '12.9 Alloy Steel Black Oxide',
        torqueNm: 4.8,
        locationAndRole:
          'Secures the twin-striker alternating ratchet mechanism inside the AEA Harpoon grip frame.',
        pinX: 175,
        pinY: 168,
      },
      {
        code: 'DEF-SCR-02',
        name: 'Break-Action Barrel Hinge Pivot Axle & Retaining Screw',
        threadMetricSpec: 'Ø6.00mmH7 Hardened Axle + M4×0.7 Lock Screw',
        headAndDrive: '2.5mm Hex Socket Flush Retention Cap',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 7.5,
        locationAndRole:
          'Forms the front lower hinge axis around which the twin over-under barrel housing tilts open 42° to load cartridges.',
        pinX: 295,
        pinY: 168,
      },
      {
        code: 'DEF-SCR-03',
        name: 'Cartridge Rear Stainless 5,000 PSI Burst-Disk Retainer Caps (2×)',
        threadMetricSpec: 'M14×1.0 Fine Thread Rear Cartridge Retainer (Video x9feufnloKc)',
        headAndDrive: '14mm Hex Wrench Flats on Rear Stainless Cap',
        materialGrade: '316L Stainless Retainer + 7075 Red/Silver Shell',
        torqueNm: 14.0,
        locationAndRole:
          'Unscrews at the rear of each cartridge to replace the flat 5,000 PSI metal burst disk before front-filling to 4,500 PSI.',
        pinX: 415,
        pinY: 168,
      },
      {
        code: 'DEF-SCR-04',
        name: 'Modular Screw-On .50 Harpoon & .72 Cal (18.3mm) Cane Barrel Threads',
        threadMetricSpec: 'M22×1.0 Coaxial Barrel Lock Collar Threads',
        headAndDrive: 'Knurled Spanner Collar',
        materialGrade: '4140 Nitride Steel + 7075 Anodized Shroud',
        torqueNm: 16.0,
        locationAndRole:
          'Threads the twin .50 Cal Harpoon barrels or the full-length .72 Cal (18.3mm) Walking Cane barrel shaft directly ahead of the cartridge nozzles.',
        pinX: 585,
        pinY: 168,
      },
    ],
    oringPlacements: [
      {
        code: 'DEF-OR-01',
        name: 'Standing Breech Firing Pin Bushing Dynamic Seals (2×)',
        isoOrParkerSizeMm: '4.00mm ID × 1.50mm CS',
        compoundAndDurometer: 'Polyurethane PU-95A',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 17.5,
        maxRatedBar: 310,
        placementAndFunction:
          'Surrounds Upper and Lower striker pins in the standing breech face when puncturing the rear 5,000 PSI burst disks.',
        pinX: 235,
        pinY: 168,
      },
      {
        code: 'DEF-OR-02',
        name: 'Cartridge Rear 5,000 PSI Burst-Disk Seat Face O-Rings (2×)',
        isoOrParkerSizeMm: '10.50mm ID × 1.50mm CS (Shared w/ #01 Pen Gun)',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 23.0,
        maxRatedBar: 345,
        placementAndFunction:
          'Seals behind the flat 5,000 PSI metal burst disk inside each cartridge’s rear stainless retainer cap (x9feufnloKc).',
        pinX: 355,
        pinY: 168,
      },
      {
        code: 'DEF-OR-03',
        name: 'Cartridge Internal Front-Fill Sliding Shuttle Piston O-Rings (4×)',
        isoOrParkerSizeMm: '12.00mm ID × 1.80mm CS Dynamic Shuttle Seals',
        compoundAndDurometer: 'Polyurethane PU-95A + Viton FKM-90',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 20.5,
        maxRatedBar: 345,
        placementAndFunction:
          'Seals the internal sliding shuttle plunger inside each cartridge as 4,500 PSI air is pumped into the front nozzle.',
        pinX: 475,
        pinY: 168,
      },
      {
        code: 'DEF-OR-04',
        name: 'Cartridge Front Nozzle-to-.50/.72 Barrel Throat O-Rings (2×)',
        isoOrParkerSizeMm: '14.00mm ID × 2.00mm CS (Parker 2-015)',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 20.5,
        maxRatedBar: 345,
        placementAndFunction:
          'Seals the front discharge nozzle of each cartridge into the .50 Harpoon or .72 Walking Cane barrel throat.',
        pinX: 665,
        pinY: 168,
      },
    ],
    uniqueParts: [
      {
        partCode: 'DEF-01',
        partName: 'Over-Under Twin .50 Harpoon Barrels + .72 Cal (18.3mm) Walking Cane Shaft',
        dimensionsMm: 'Harpoon L=185mm (2× Ø12.70mm) · Cane Shaft L=860mm × Bore=Ø18.29mm (.72 Cal)',
        material: '7075-T6 Housing + 4140 Rifled .50 & .72 Cal Barrel Liners',
        pressureZoneBar: 310,
        roleDescription:
          'Supports twin over-under .50 Cal barrels (firing .50 slugs, buckshot wads, or 375gr carbon harpoon arrows per x9feufnloKc) plus the .72 Cal (18.3mm) Walking Cane shaft (jgDYcypjHeI).',
        pinX: 635,
        pinY: 60,
      },
      {
        partCode: 'SHELL-50-220B',
        partName: '2× AEA 4,500 PSI (310B) Front-Fill Cartridges (11.2cc Std / 25cc .72 Magnum)',
        dimensionsMm: 'Std: Ø18×68mm (11.2cc) · Cane Magnum: Ø24×82mm (25cc) @ 310–345 Bar',
        material: '7075-T651 Anodized Vessel + Internal Shuttle Piston + 316L Rear Cap + 5,000 PSI Burst Disk',
        pressureZoneBar: 310,
        roleDescription:
          'Exact front-fill shuttle piston + rear 5,000 PSI burst-disk cartridge demonstrated in x9feufnloKc and jgDYcypjHeI (shared w/ #01 Mongo Pen Gun).',
        pinX: 415,
        pinY: 60,
      },
      {
        partCode: 'DEF-03',
        partName: 'Dual Over-Under Alternating Striker Hammers, Ratchet Selector & 440C Pins',
        dimensionsMm: '2× Ø11.0mm Hammers · Ø14.0mm 180° Ratchet Cam · 2× Ø2.2mm 440C Needles',
        material: '17-4PH H900 Hammers + A2 Ratchet Cam + HRC 60 440C Firing Needles',
        pressureZoneBar: 0,
        roleDescription:
          'Alternates automatically between Upper Barrel #1 and Lower Barrel #2 on each trigger pull to puncture the rear 5,000 PSI burst disks.',
        pinX: 255,
        pinY: 60,
      },
      {
        partCode: 'DEF-04',
        partName: 'Top Stirrup Break-Barrel Latch, DAO Sear Bar & Cane/Pistol Grip Handle',
        dimensionsMm: 'Latch W=52.0mm · Sear Bar L=95.0mm · Grip L=142.0mm',
        material: '4140 Chromoly Stirrup Wedge + 17-4PH Sear Bar + PA12-CF / Hardwood Cane Handle',
        pressureZoneBar: 0,
        roleDescription:
          'Locks the breech against 310-Bar cartridge thrust and pivots open 42° for rapid cartridge and arrow/buckshot reloading.',
        pinX: 145,
        pinY: 60,
      },
    ],
  },
  {
    progressionId: 'GUN_04_LESHIY',
    tierOrder: 4,
    versionId: 'ver_v4_edgun_leshiy',
    versionTag: 'v4.0',
    shortTitle: '#04 Leshiy 2 (.30 Open-Breech Spec)',
    fullTitle: '#04 Leshiy 2 (350mm Barrel · 756mm/457mm Folded · 179cc [137cc+42cc Plenum] @ 130–240B · 8-Rd Mag)',
    isDefaultStarterOption: false,
    familyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_02_leshiy2',
    lowerPlatformId: 'plat_02_leshiy2',
    dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
    defaultCaliberMm: 7.62,
    imperialCaliberLabel: '.30 Cal (7.62mm)',
    operatingPressureBar: 300,
    muzzleEnergyJoules: 112,
    magazineCapacity: 8,
    functionalCycleSummary:
      'Real EDgun Leshiy 2 Factory Spec (12-Part Blueprint + 6-Stage EAR Airflow Simulation): 350mm Alfa Precision polygonal barrel inside Valkyrie Carbon M-LOK shroud & Tishina 200 eccentric 6-baffle moderator (756mm unfolded ⇄ 457mm folded, -299mm; 2.35 kg). Press right-side latch to fold the 179cc twin-tube buttstock 180° left (137cc 300-Bar lower tube + 42cc upper R.E.P.R. plenum @ 130 Bar default / 60–240 Bar externally adjustable), exposing the 8-round magnetic scalloped rotary magazine, 8-tooth 17-4PH star ratchet, red PU-90A breech face puck, and 1.8cc bleed-jet indexing pawl.',
    airflowCompressionToReleaseSummary:
      '6-Stage EAR & R.E.P.R. Airflow Simulation: (1) 300-Bar HPA stored in 137cc lower stock tube; (2) 16-disc DIN 2093 Belleville R.E.P.R. regulator steps 300 Bar down to 130 Bar in the 42cc upper plenum; (3) Balanced PEEK/Ti forward-plug spool (EAR valve) holds 130 Bar with 0.00 m/s leak; (4) Trigger pull vents the 0.35cc rear pilot chamber via the forward bleed rod, snapping the EAR spool open 3.2mm in 1.4ms; (5) Choked Mach 1.0 (343 m/s) gas blasts through the dynamically pressurized Red PU-90A puck and 8-rd drum into the 350mm Alfa barrel (268 m/s, 112.0 J); (6) Secondary 1.8cc bleed jet drives the lower indexing pawl to rotate the 8-tooth star ratchet 45° in 14ms while the 6-baffle Valkyrie moderator strips muzzle gas down to 98.4 dB.',
    screwsAndFasteners: [
      {
        code: 'LSH-SCR-01',
        name: '180° Left-Side Folding Buttstock Hinge Axle & Preload Clamp Bolts (2×)',
        threadMetricSpec: 'M5×0.8 × 18mm Socket Cap + Ø6.00mmH7 Hardened Hinge Pin',
        headAndDrive: '4.0mm Hex Drive (12.9 High-Tensile Steel)',
        materialGrade: '4140 Nitrided Steel',
        torqueNm: 9.5,
        locationAndRole:
          'Eliminates axial play across the 180° folding breech hinge (-299mm folded delta) so the 8-round rotary magazine seals air-tight against the barrel throat and red PU-90A puck.',
        pinX: 465,
        pinY: 112,
      },
      {
        code: 'LSH-SCR-02',
        name: 'Valkyrie Carbon/CNC M-LOK Handguard Mounting Screws (6×)',
        threadMetricSpec: 'M4×0.7 × 8mm Button Head Torx Screws',
        headAndDrive: 'Torx T20 Drive',
        materialGrade: 'Grade 5 Ti-6Al-4V Titanium',
        torqueNm: 4.5,
        locationAndRole:
          'Secures the octagonal Valkyrie M-LOK handguard over the 350mm barrel and Tishina 200 eccentric 6-baffle moderator.',
        pinX: 255,
        pinY: 102,
      },
      {
        code: 'LSH-SCR-03',
        name: 'Upper Receiver Quick-Change Barrel Clamp Pinch Bolts (2×)',
        threadMetricSpec: 'M5×0.8 × 16mm Socket Head Cap Screws',
        headAndDrive: '4.0mm Internal Hex Drive',
        materialGrade: '12.9 Alloy Steel',
        torqueNm: 8.8,
        locationAndRole:
          'Clamps the modular drop-in 250mm/350mm/450mm/600mm Alfa Precision rifled barrel inside the monolithic upper receiver bridge.',
        pinX: 375,
        pinY: 96,
      },
      {
        code: 'LSH-SCR-04',
        name: '8-Tooth Central Star Ratchet & Magnetic Rotary Spindle Screw',
        threadMetricSpec: 'M3×0.5 × 6mm Countersunk Flat Head + M10×1.0 Rear EDgun Gauge Thread',
        headAndDrive: '2.0mm Hex Drive',
        materialGrade: '316L Stainless Steel',
        torqueNm: 2.2,
        locationAndRole:
          'Retains the 8-tooth metallic central star ratchet hub and N52 magnetic 8-round carrier plate on the folding breech spindle.',
        pinX: 438,
        pinY: 126,
      },
      {
        code: 'LSH-SCR-05',
        name: 'R.E.P.R. External Regulator Micrometer Setpoint Screw',
        threadMetricSpec: 'M8×0.75 Fine-Pitch Brass/SS Micrometer Adjuster (15 Bar / Turn)',
        headAndDrive: '2.5mm Hex Socket (External Adjustment Without Venting)',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 1.8,
        locationAndRole:
          'Compresses the 16-disc DIN 2093 Belleville spring stack inside the 42cc upper plenum to tune regulated pressure from 60 Bar to 240 Bar.',
        pinX: 565,
        pinY: 112,
      },
      {
        code: 'LSH-SCR-06',
        name: 'EAR Hammerless Valve Housing M28×1.5 Buttstock Bulkhead Thread',
        threadMetricSpec: 'M28×1.5 × 14mm Precision Buttstock Manifold Thread',
        headAndDrive: '4-Pin Spanner Lock Face',
        materialGrade: '7075-T651 Hard Black Anodized',
        torqueNm: 32.0,
        locationAndRole:
          'Joins the 1.4ms Hammerless Forward-Plug (EAR) Valve housing to the 42cc upper plenum and 137cc lower 300B reservoir.',
        pinX: 525,
        pinY: 148,
      },
    ],
    oringPlacements: [
      {
        code: 'LSH-OR-01',
        name: 'Red Polyurethane PU-90A Breech Transfer Face Puck Seal',
        isoOrParkerSizeMm: '11.00mm ID × 3.20mm Thick Recessed Face Puck',
        compoundAndDurometer: 'Polyurethane PU-90A (Red Factory Breech Puck)',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 20.0,
        maxRatedBar: 300,
        placementAndFunction:
          'Recessed in the folding stock breech face; dynamically energizes at 130 Bar against the rear face of the 8-round rotary magazine for 0.00 m/s blow-by.',
        pinX: 455,
        pinY: 128,
      },
      {
        code: 'LSH-OR-02',
        name: 'Hammerless Forward-Plug (EAR) Differential Spool O-Rings (2×)',
        isoOrParkerSizeMm: '8.00mm ID × 1.50mm CS',
        compoundAndDurometer: 'PTFE-Blended Viton FKM-90',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 14.5,
        maxRatedBar: 300,
        placementAndFunction:
          'Allows the hammerless PEEK/Ti forward valve spool to snap open 3.2mm in 1.4ms when rear pilot pressure vents.',
        pinX: 505,
        pinY: 128,
      },
      {
        code: 'LSH-OR-03',
        name: 'Barrel Leade-to-Rotary Magazine Front Seal Ring',
        isoOrParkerSizeMm: '9.00mm ID × 1.50mm CS',
        compoundAndDurometer: 'Polyurethane PU-90A',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 18.5,
        maxRatedBar: 240,
        placementAndFunction:
          'Seals the front face of the active magazine chamber against the 350mm Alfa barrel entrance cone to prevent semi-auto blow-by.',
        pinX: 422,
        pinY: 120,
      },
      {
        code: 'LSH-OR-04',
        name: '179cc (137cc Tube + 42cc Plenum) Twin-Tube Stock Bulkhead O-Rings (4×)',
        isoOrParkerSizeMm: '24.00mm ID × 2.50mm CS',
        compoundAndDurometer: 'Nitrile NBR-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 21.5,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the 300-Bar 137cc lower reservoir tube and 42cc upper regulated plenum tube against the folding breech block and rear bridge.',
        pinX: 595,
        pinY: 128,
      },
      {
        code: 'LSH-OR-05',
        name: 'R.E.P.R. Belleville Regulator Dynamic Piston & Seat O-Rings (2×)',
        isoOrParkerSizeMm: '9.00mm ID × 1.50mm CS + 4.00mm × 1.50mm Stem Seal',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 16.2,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the R.E.P.R. regulator shuttle piston stepping 300-Bar lower tube storage down to 130 Bar (±0.8 Bar consistency).',
        pinX: 545,
        pinY: 112,
      },
      {
        code: 'LSH-OR-06',
        name: '1.8cc Bleed-Jet Indexing Pawl Plunger Seal Ring',
        isoOrParkerSizeMm: '4.50mm ID × 1.20mm CS',
        compoundAndDurometer: 'Polyurethane PU-90A',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 15.0,
        maxRatedBar: 150,
        placementAndFunction:
          'Seals the micro-actuator piston that converts the 1.8cc valve bleed pulse into a 45° indexing stroke on the 8-tooth star ratchet.',
        pinX: 448,
        pinY: 150,
      },
    ],
    uniqueParts: [
      {
        partCode: 'LSH-01',
        partName: 'Valkyrie Carbon-Fiber Octagonal M-LOK Handguard & 30-MOA Top Rail',
        dimensionsMm: 'L=265.0mm · OD=Ø46.0mm · ID=Ø38.0mm · 7-Slot M-LOK',
        material: '3K Autoclave Carbon Fiber + 7075-T6 Top Picatinny Bridge',
        pressureZoneBar: 0,
        roleDescription: 'Free-floats over the Tishina moderator and 350mm barrel; provides full-length top optics rail.',
        pinX: 145,
        pinY: 96,
      },
      {
        partCode: 'LSH-02',
        partName: 'Valkyrie Tishina 200 Eccentric 6-Baffle Reflex Moderator',
        dimensionsMm: 'L=185.0mm · OD=Ø42.0mm · Bore=Ø8.40mm (.30 Clearance)',
        material: '7075-T651 Hard Anodized + 6× Conical K-Baffles',
        pressureZoneBar: 65,
        roleDescription: 'Strips 130-Bar muzzle blast across 6 angled expansion chambers, reducing report from 129.8 dB to 98.4 dB.',
        pinX: 215,
        pinY: 116,
      },
      {
        partCode: 'LSH-03',
        partName: '350mm Alfa Precision Polygonal Choked .30 Cal (7.62mm) Barrel',
        dimensionsMm: 'L=350.0mm · OD=Ø14.00mm · Bore=Ø7.62mm (1:16" Twist)',
        material: '42CrMo4 Cold-Hammer-Forged Steel (Nitrided Bore)',
        pressureZoneBar: 130,
        roleDescription: 'Drop-in quick-change barrel clamped by 2× M5 pinch bolts; delivers 268 m/s (112.0 J) with 44.75gr pellets.',
        pinX: 305,
        pinY: 116,
      },
      {
        partCode: 'LSH-04',
        partName: 'Monolithic 7075-T6 Upper Receiver Clamp & Left-Side 180° Hinge',
        dimensionsMm: 'L=165.0mm · W=42.0mm · H=68.0mm · Hinge=Ø6.00mmH7',
        material: '7075-T651 Billet Aluminum + 4140 Hinge Pin',
        pressureZoneBar: 0,
        roleDescription: 'Bridges the barrel clamp to the 180° left-side folding stock hinge (756mm unfolded ⇄ 457mm folded).',
        pinX: 365,
        pinY: 98,
      },
      {
        partCode: 'LSH-05',
        partName: '8-Round .30 Cal Scalloped Magnetic Rotary Magazine Drum',
        dimensionsMm: 'OD=Ø44.50mm · Thick=11.00mm · 8× Ø7.65mm Chambers',
        material: '7075-T6 Crimson Hard Anodized + 4× N52 Neodymium Magnets',
        pressureZoneBar: 130,
        roleDescription: 'Fires directly from the chamber with zero bolt probe; retained magnetically against the stainless backing plate.',
        pinX: 428,
        pinY: 96,
      },
      {
        partCode: 'LSH-06',
        partName: '8-Tooth 17-4PH Central Star Ratchet Hub & Stainless Front Plate',
        dimensionsMm: 'Hub OD=Ø18.40mm · Plate OD=Ø44.50mm × 0.80mm Thick',
        material: '17-4PH Condition H900 Steel (HRC 44) + 301 Spring Steel Plate',
        pressureZoneBar: 0,
        roleDescription: 'Engages the lower indexing pawl to rotate the drum exactly 45.0° per shot while retaining pellets forward.',
        pinX: 438,
        pinY: 124,
      },
      {
        partCode: 'LSH-07',
        partName: '1.8cc Bleed-Jet Indexing Pawl, Plunger & Return Spring',
        dimensionsMm: 'L=34.0mm · Plunger OD=Ø6.00mm · Stroke=4.80mm (14ms Cycle)',
        material: 'A2 Tool Steel Pawl (HRC 58) + Chrome-Silicon Spring',
        pressureZoneBar: 130,
        roleDescription: 'Driven by a 1.8cc bleed pulse from the EAR valve to advance the 8-round rotary drum in 14 milliseconds.',
        pinX: 448,
        pinY: 156,
      },
      {
        partCode: 'LSH-08',
        partName: 'Red PU-90A Dynamic Pressure-Energized Breech Face Puck',
        dimensionsMm: 'OD=Ø22.00mm · ID=Ø11.00mm · Thick=4.50mm',
        material: 'Cast Polyurethane PU-90A Shore A (Factory Red)',
        pressureZoneBar: 130,
        roleDescription: 'Flexes 0.18mm forward under the 130-Bar discharge pulse to seal the gap behind the rotary drum.',
        pinX: 468,
        pinY: 124,
      },
      {
        partCode: 'LSH-09',
        partName: '1.4ms Hammerless Forward-Plug Balanced Spool Valve (EAR)',
        dimensionsMm: 'L=58.0mm · OD=Ø28.0mm · Spool Lift=3.20mm · Dwell=1.4ms',
        material: 'Ketron PEEK-1000 Spool Shuttle + Ti-6Al-4V Valve Body',
        pressureZoneBar: 130,
        roleDescription: 'Zero hammer or striker spring; vents rear pilot chamber to snap open in 1.4ms with zero lock-time vibration.',
        pinX: 505,
        pinY: 112,
      },
      {
        partCode: 'LSH-10',
        partName: 'Forward-Pull 2-Stage Trigger, Pilot Bleed Valve & AR Grip',
        dimensionsMm: 'Pull Weight=680g · Pilot Bleed Pin=Ø2.00mm · Grip Angle=104°',
        material: '7075-T6 Trigger Blade + 17-4PH Transfer Rod + Red/Black Grip',
        pressureZoneBar: 130,
        roleDescription: 'Depresses the rear pilot exhaust pin on trigger break to unbalance and fire the EAR spool valve.',
        pinX: 485,
        pinY: 175,
      },
      {
        partCode: 'LSH-11',
        partName: 'Upper 42cc Regulated Plenum Tube & R.E.P.R. 16-Disc Belleville Regulator',
        dimensionsMm: 'L=285.0mm · OD=Ø28.0mm · ID=Ø23.0mm · Setpoint=130B (60–240B)',
        material: '7075-T651 Seamless Tube + 16× DIN 2093 NiCr Belleville Discs',
        pressureZoneBar: 130,
        roleDescription: 'Stores 42cc of regulated 130-Bar firing gas directly behind the EAR valve with external micrometer tuning.',
        pinX: 585,
        pinY: 112,
      },
      {
        partCode: 'LSH-12',
        partName: 'Lower 137cc 300-Bar Reservoir Tube & Rear EDgun Digital Manometer',
        dimensionsMm: 'L=285.0mm · OD=Ø32.0mm · ID=Ø25.6mm · Total Vol=179cc (137+42cc)',
        material: '7075-T651 Seamless 300B Tube + M10×1.0 EDgun E.A.R. Digital Gauge',
        pressureZoneBar: 300,
        roleDescription: 'Stores 300-Bar primary air supply and folds 180° left with the upper plenum as the shoulder buttstock.',
        pinX: 645,
        pinY: 148,
      },
    ],
  },
  {
    progressionId: 'GUN_04B_THE_LEAF_45',
    tierOrder: 5,
    versionId: 'ver_v4b_the_leaf_45',
    versionTag: 'v5.0',
    shortTitle: '#05 The Leaf (.45 Cal Leshiy-2 Custom)',
    fullTitle: '#05 The Leaf (.45 Cal / 11.43mm Custom Built on Top of Leshiy 2 Open-Breech + Concentric Over-Barrel Air Reserve)',
    isDefaultStarterOption: false,
    familyId: 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_01_fx_drs',
    lowerPlatformId: 'plat_02_leshiy2',
    dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
    defaultCaliberMm: 11.43,
    imperialCaliberLabel: '.45 Cal (11.43mm)',
    operatingPressureBar: 300,
    muzzleEnergyJoules: 248,
    magazineCapacity: 6,
    functionalCycleSummary:
      'Custom .45 Cal (11.43mm) Big-Bore built directly on top of the EDgun Leshiy 2 180° folding open-breech architecture: retains the Leshiy 2 left-side hinge, hammerless forward-plug valve, and red PU-90A breech face puck, while scaling the magnetic scalloped rotary drum to 6× .45 Cal chambers, expanding the R.E.P.R. plenum to 68cc @ 195 Bar, and adding a Concentric Over-the-Barrel (OTB) Annular Air Reserve Jacket around the internal K-baffle moderator.',
    airflowCompressionToReleaseSummary:
      '300-Bar air stored in both the Twin-Tube Folding Stock (220cc) and the Concentric Over-the-Barrel Annular Jacket (165cc) feeds the enlarged 68cc R.E.P.R. plenum at 195 Bar. Pulling the trigger vents the Leshiy-2-derived forward-plug pilot chamber, dumping 195-Bar gas through the enlarged Ø12.5mm red PU-90A breech puck into the 6-round .45 rotary drum while bleeding gas to index the 6-tooth star ratchet 60°.',
    screwsAndFasteners: [
      {
        code: 'LEAF-SCR-01',
        name: 'Reinforced Leshiy-2 Folding Hinge Axle & Preload Bolts (2×)',
        threadMetricSpec: 'M6×1.0 × 20mm Socket Cap + Ø8.00mmH7 Nitrided Hinge Pin',
        headAndDrive: '5.0mm Hex Drive (12.9 Alloy Steel)',
        materialGrade: '4340 Chromoly Nitrided Steel',
        torqueNm: 13.5,
        locationAndRole:
          'Upgraded Leshiy-2 folding hinge to resist .45 Cal (195-Bar) breech thrust across the 6-round rotary drum.',
        pinX: 465,
        pinY: 112,
      },
      {
        code: 'LEAF-SCR-02',
        name: 'Concentric Over-Barrel Air Reserve Bulkhead Lock Threads (2×)',
        threadMetricSpec: 'M48×1.5 Coaxial Titanium Shroud Bulkhead Threads',
        headAndDrive: '4-Notch Pin-Spanner Lock Rings',
        materialGrade: 'Grade 5 Ti-6Al-4V Titanium',
        torqueNm: 38.0,
        locationAndRole:
          'Seals the outer Ø52mm concentric 300-Bar annular air reserve jacket around the inner .45 K-baffle moderator.',
        pinX: 245,
        pinY: 102,
      },
      {
        code: 'LEAF-SCR-03',
        name: 'Leshiy-2 Derived Upper Receiver .45 Barrel Clamp Bolts (2×)',
        threadMetricSpec: 'M6×1.0 × 18mm Socket Head Cap Screws',
        headAndDrive: '5.0mm Internal Hex Drive',
        materialGrade: '12.9 Alloy Steel',
        torqueNm: 12.0,
        locationAndRole:
          'Clamps the heavy .45 Cal (11.43mm) rifled barrel liner inside the widened Leshiy-2 upper receiver block.',
        pinX: 375,
        pinY: 96,
      },
      {
        code: 'LEAF-SCR-04',
        name: '6-Tooth .45 Star Ratchet Spindle & Pawl Retaining Screw',
        threadMetricSpec: 'M4×0.7 × 8mm Countersunk Torx T20 Screw',
        headAndDrive: 'Torx T20 Drive',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 3.8,
        locationAndRole:
          'Anchors the 6-tooth central star ratchet hub inside the 6-round .45 Cal scalloped rotary drum.',
        pinX: 438,
        pinY: 126,
      },
    ],
    oringPlacements: [
      {
        code: 'LEAF-OR-01',
        name: 'Enlarged .45 Cal Red PU-90A Breech Transfer Face Puck Seal',
        isoOrParkerSizeMm: '13.50mm ID × 3.50mm Thick Recessed Face Puck',
        compoundAndDurometer: 'Polyurethane PU-90A (High-Tear Red Puck)',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 21.0,
        maxRatedBar: 300,
        placementAndFunction:
          'Scaled-up Leshiy-2 red breech puck sealing the 68cc plenum outlet directly against the rear of the 6-round .45 drum.',
        pinX: 455,
        pinY: 128,
      },
      {
        code: 'LEAF-OR-02',
        name: 'Concentric Over-Barrel Annular Air Reserve Bulkhead O-Rings (4×)',
        isoOrParkerSizeMm: '46.00mm OD & 28.00mm ID × 2.50mm CS',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 19.5,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the outer 300-Bar annular air reserve jacket around the inner .45 silencer tube.',
        pinX: 225,
        pinY: 102,
      },
      {
        code: 'LEAF-OR-03',
        name: 'High-Flow .45 Hammerless Forward-Plug Valve O-Rings (2×)',
        isoOrParkerSizeMm: '12.00mm ID × 1.78mm CS (Parker 2-014)',
        compoundAndDurometer: 'PTFE-Blended Viton FKM-90',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 15.0,
        maxRatedBar: 300,
        placementAndFunction:
          'Enables 1.5ms hammerless forward-plug opening for massive 195-Bar .45 Cal gas dump.',
        pinX: 505,
        pinY: 128,
      },
      {
        code: 'LEAF-OR-04',
        name: '.45 Barrel Entrance Cone to 6-Rd Drum Front Seal Ring',
        isoOrParkerSizeMm: '12.50mm ID × 1.78mm CS',
        compoundAndDurometer: 'Polyurethane PU-90A',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 18.8,
        maxRatedBar: 250,
        placementAndFunction:
          'Seals the front face of the 6-round .45 rotary drum against the 11.43mm barrel leade.',
        pinX: 422,
        pinY: 120,
      },
    ],
    uniqueParts: [
      {
        partCode: 'LEAF-01',
        partName: 'Concentric Over-Barrel 165cc Air Reserve + Inner .45 Silencer Shroud',
        dimensionsMm: 'L=380.0mm · Outer Air OD=Ø52.0mm · Inner Silencer OD=Ø30.0mm',
        material: 'Ti-6Al-4V Outer Jacket + 7075-T6 Inner 6-Baffle Silencer',
        pressureZoneBar: 300,
        roleDescription: 'Wraps a 165cc 300-Bar annular air reserve directly around the .45 silencer and barrel.',
        pinX: 210,
        pinY: 120,
      },
      {
        partCode: 'LEAF-02',
        partName: '6-Round .45 Cal (11.43mm) Scalloped Rotary Drum + 6-Tooth Star Ratchet',
        dimensionsMm: 'OD=Ø48.5mm · Thick=15.0mm · 6× 11.43mm (.45) Chambers',
        material: '7075-T6 Hard Anodized + 17-4PH 6-Tooth Star Hub',
        pressureZoneBar: 195,
        roleDescription: 'Leshiy-2 open-breech magnetic drum scaled to 6× .45 Cal slugs with 60° pawl indexing.',
        pinX: 438,
        pinY: 120,
      },
      {
        partCode: 'LEAF-03',
        partName: 'Enlarged 68cc R.E.P.R. Plenum + .45 Forward-Plug Hammerless Valve',
        dimensionsMm: 'Plenum=68cc @ 195 Bar · Throat=Ø11.8mm · Dwell=1.5ms',
        material: 'PEEK-GF30 Forward Plug + 7075-T651 Manifold',
        pressureZoneBar: 195,
        roleDescription: 'Built on top of the Leshiy 2 forward-plug valve to deliver 248 Joules in .45 Cal.',
        pinX: 505,
        pinY: 128,
      },
      {
        partCode: 'LEAF-04',
        partName: 'Leshiy-2 Derived 180° Folding Twin-Tube Buttstock (220cc + 68cc)',
        dimensionsMm: 'L=305.0mm · Twin Tube OD=Ø36.0mm · 300 Bar Fill',
        material: '7075-T651 + Carbon Sleeve + Red PU-90A Breech Puck',
        pressureZoneBar: 300,
        roleDescription: 'Folds 180° left to expose the 6-round .45 rotary drum and red PU-90A breech face puck.',
        pinX: 615,
        pinY: 138,
      },
    ],
  },
  {
    progressionId: 'GUN_05_MP30',
    tierOrder: 6,
    versionId: 'ver_v5_evanix_mp30',
    versionTag: 'v6.0',
    shortTitle: '#06 MP30 (.30 Tactical SMG)',
    fullTitle: '#06 MP30 (.30 Cal / 7.62mm Dual-Cylinder 300cc Tactical PCP SMG · Complete 12-Part High-Precision Rework)',
    isDefaultStarterOption: false,
    familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_15_evanix_mp30',
    lowerPlatformId: 'plat_15_evanix_mp30',
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
    defaultCaliberMm: 7.62,
    imperialCaliberLabel: '.30 Cal (7.62mm)',
    operatingPressureBar: 250,
    muzzleEnergyJoules: 125,
    magazineCapacity: 9,
    functionalCycleSummary:
      'Complete High-Precision Korean Evanix MP30 (.30 Cal / 7.62mm) Tactical PCP SMG Rework (12-Part Blueprint): Dual Over-Under 250-Bar Carbon/7075 Air Cylinders (2 × 150cc = 300cc combined) linked through a CNC Figure-8 Regulator Manifold (165 Bar regulated) into a 48cc vertical receiver plenum; monolithic CNC 7075-T6 Upper & Flared Lower SMG Receiver with lightening pockets, full MIL-STD-1913 top rail & M-LOK forend, articulated Biathlon Side-Lever cocking linkage, 9-round .30 rotary magazine + spare magwell tower, reflex red-dot optic, and 180° side-folding 6-position M4 tactical buttstock (520mm folded / 755mm extended).',
    airflowCompressionToReleaseSummary:
      'Dual-Cylinder Parallel-to-Regulated Airflow: 250-Bar HPA in both Upper (150cc) and Lower (150cc) under-barrel cylinders flows through dual check valves in the CNC Figure-8 Manifold into the 165-Bar Belleville Regulator, charging the 48cc vertical receiver plenum. Pulling the 2-stage match trigger releases the linear hammer shuttle to open the balanced PEEK poppet 2.7mm for 1.6ms, routing 165-Bar gas up the Ø6.2mm vertical transfer port and through the hollow Ø7.60mm stainless bolt probe into the 270mm choked .30 barrel & 10-chamber K-baffle whisper shroud (278 m/s, 125.0 J).',
    screwsAndFasteners: [
      {
        code: 'MP30-SCR-01',
        name: 'Biathlon Side-Lever Toggle Linkage Shoulder Pivot Bolts (2×)',
        threadMetricSpec: 'M5×0.8 × 12mm Hardened Ground Shoulder Pivot Screws',
        headAndDrive: '3.0mm Hex Socket Head (12.9 Alloy Steel)',
        materialGrade: '4140 Hardened Alloy Steel (HRC 44)',
        torqueNm: 5.8,
        locationAndRole:
          'Connects the articulated right-side biathlon cocking handle and external linkage bar to the reciprocating .30 cal stainless bolt probe.',
        pinX: 425,
        pinY: 98,
      },
      {
        code: 'MP30-SCR-02',
        name: '180° Side-Folding M4 Buttstock Hinge Axle & Castle Lock Nut',
        threadMetricSpec: 'M6×1.0 Hinge Pin + 1-3/16"-16 UN Mil-Spec Castle Nut',
        headAndDrive: '4.0mm Hex Drive + Spanner Wrench',
        materialGrade: '4140 Nitrided Steel',
        torqueNm: 14.5,
        locationAndRole:
          'Secures the side-folding knuckle and 6-position telescoping M4 buffer tube (520mm folded / 755mm extended) to the rear SMG receiver.',
        pinX: 540,
        pinY: 122,
      },
      {
        code: 'MP30-SCR-03',
        name: 'Twin Figure-8 Over-Under Cylinder & Shroud Truss Clamp Bolts (4×)',
        threadMetricSpec: 'M5×0.8 × 18mm Socket Head Cap Screws',
        headAndDrive: '4.0mm Hex Drive',
        materialGrade: '12.9 Alloy Steel',
        torqueNm: 8.4,
        locationAndRole:
          'Clamps the Ø34mm K-baffle whisper shroud, Upper 150cc 250B Cylinder, and Lower 150cc 250B Cylinder into a zero-shift triangular truss.',
        pinX: 245,
        pinY: 122,
      },
      {
        code: 'MP30-SCR-04',
        name: 'Upper-to-Lower CNC SMG Receiver Takedown & Magwell Pins (2×)',
        threadMetricSpec: 'Ø6.35mm Captive Cross-Lock Takedown Pins + M4 Detent',
        headAndDrive: 'Push-Button Spring Detent',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 4.5,
        locationAndRole:
          'Locks the monolithic 7075-T6 upper breech receiver to the lower trigger housing and flared tactical spare-magwell tower.',
        pinX: 390,
        pinY: 148,
      },
      {
        code: 'MP30-SCR-05',
        name: 'M-LOK Vertical Foregrip & AR-15 Beavertail Grip Mounting Bolts',
        threadMetricSpec: 'M6×1.0 × 25mm Grip Bolt + Dual M5×0.8 M-LOK T-Nuts',
        headAndDrive: '4.0mm & 5.0mm Hex Socket',
        materialGrade: '4140 Black Oxide Steel',
        torqueNm: 8.2,
        locationAndRole:
          'Anchors the textured AR-15 pistol grip and forward M-LOK vertical stabilizer grip under the dual cylinders.',
        pinX: 285,
        pinY: 185,
      },
      {
        code: 'MP30-SCR-06',
        name: 'Dual Wika Manometer & Foster Quick-Fill Port Threads (3×)',
        threadMetricSpec: 'G1/8" BSPP Parallel High-Pressure Gauge & Fill Threads',
        headAndDrive: '14mm Hex Wrench Flats',
        materialGrade: 'C36000 High-Tensile Brass / 316L SS',
        torqueNm: 11.0,
        locationAndRole:
          'Mounts the front 250-Bar reserve gauge, side 165-Bar regulated plenum gauge, and male Foster quick-fill nipple.',
        pinX: 135,
        pinY: 135,
      },
    ],
    oringPlacements: [
      {
        code: 'MP30-OR-01',
        name: '.30 Cal (7.62mm) Stainless Bolt Probe Breech Sealing O-Ring',
        isoOrParkerSizeMm: '5.50mm ID × 1.50mm CS',
        compoundAndDurometer: 'Polyurethane PU-90A (High-Wear Dynamic)',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 18.5,
        maxRatedBar: 250,
        placementAndFunction:
          'Seals the 7.62mm barrel throat behind the 44.75gr .30 slug on every forward biathlon side-lever stroke.',
        pinX: 395,
        pinY: 98,
      },
      {
        code: 'MP30-OR-02',
        name: 'Figure-8 Dual-Cylinder Parallel Manifold Transfer O-Rings (4×)',
        isoOrParkerSizeMm: '8.00mm ID × 1.78mm CS (Parker 2-011)',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 21.0,
        maxRatedBar: 250,
        placementAndFunction:
          'Equalizes 250-Bar pressure between the Upper (150cc) and Lower (150cc) under-barrel cylinders into the regulator block.',
        pinX: 335,
        pinY: 132,
      },
      {
        code: 'MP30-OR-03',
        name: 'Upper & Lower 150cc 250-Bar Cylinder Bulkhead O-Rings (4×)',
        isoOrParkerSizeMm: '24.00mm ID × 2.50mm CS',
        compoundAndDurometer: 'Nitrile NBR-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 21.8,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the front Foster quick-fill/gauge endcaps and rear valve bulkheads on both 150cc cylinders (300cc total).',
        pinX: 215,
        pinY: 142,
      },
      {
        code: 'MP30-OR-04',
        name: '165-Bar Inline Belleville Regulator Piston Dynamic O-Ring',
        isoOrParkerSizeMm: '9.50mm ID × 1.78mm CS',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 16.5,
        maxRatedBar: 250,
        placementAndFunction:
          'Meters 250-Bar dual-cylinder storage down to a rock-solid 165-Bar setpoint inside the 48cc receiver plenum.',
        pinX: 355,
        pinY: 148,
      },
      {
        code: 'MP30-OR-05',
        name: 'High-Flow PEEK Poppet Stem Balance & Transfer Port O-Rings (2×)',
        isoOrParkerSizeMm: '4.50mm ID × 1.50mm CS + 7.00mm × 1.50mm Port Face Seal',
        compoundAndDurometer: 'PTFE-Blended Viton FKM-90',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 17.4,
        maxRatedBar: 250,
        placementAndFunction:
          'Seals the balanced poppet stem and Ø6.2mm vertical transfer port connecting the 48cc plenum to the .30 barrel leade.',
        pinX: 382,
        pinY: 122,
      },
      {
        code: 'MP30-OR-06',
        name: '10-Chamber K-Baffle Whisper Shroud Acoustic Bulkhead O-Rings (2×)',
        isoOrParkerSizeMm: '28.00mm ID × 2.00mm CS',
        compoundAndDurometer: 'Nitrile NBR-70 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 16.0,
        maxRatedBar: 85,
        placementAndFunction:
          'Centers the Ø34mm whisper moderator shroud coaxially around the 270mm barrel and prevents rear reflex gas leakage.',
        pinX: 165,
        pinY: 96,
      },
    ],
    uniqueParts: [
      {
        partCode: 'MP30-01',
        partName: 'Monolithic CNC 7075-T6 Billet Upper SMG Receiver & Lightening Pockets',
        dimensionsMm: 'L=285.0mm · W=38.0mm · H=62.0mm · 4× Side Milling Pockets',
        material: '7075-T651 Hard Black Anodized Billet Aluminum',
        pressureZoneBar: 165,
        roleDescription: 'Precision-milled SMG upper housing the .30 breech, 9-round magazine slot, and top 21.2mm Picatinny rail.',
        pinX: 430,
        pinY: 62,
      },
      {
        partCode: 'MP30-02',
        partName: 'CNC 6061-T6 Lower Trigger Receiver & Flared SMG Spare-Magwell Tower',
        dimensionsMm: 'L=210.0mm · Magwell H=115.0mm · Flared Bevel=18°',
        material: '6061-T6 Matte Black Anodized + 4140 Takedown Pins',
        pressureZoneBar: 0,
        roleDescription: 'Houses the 2-stage match sear linkage and angled lower SMG magwell tower holding two spare 9-rd rotary cassettes.',
        pinX: 390,
        pinY: 215,
      },
      {
        partCode: 'MP30-03',
        partName: '270mm Choked .30 Cal (7.62mm) Match Rifled Barrel',
        dimensionsMm: 'L=270.0mm · OD=Ø15.00mm · Bore=Ø7.62mm (6-Groove, 1:16" Twist)',
        material: '4140 CrMo Match Barrel Steel (Lapped Crown & Brass Leade)',
        pressureZoneBar: 165,
        roleDescription: 'Delivers 278 m/s (125.0 Joules) with 44.75gr .30 pellets and hollow-point slugs.',
        pinX: 255,
        pinY: 75,
      },
      {
        partCode: 'MP30-04',
        partName: '10-Chamber K-Baffle Whisper Moderator Shroud (Ø34.0mm)',
        dimensionsMm: 'L=315.0mm · OD=Ø34.00mm · 10× Anodized Conical K-Baffles',
        material: '7075-T6 Outer Shroud + Gold Anodized 7075 K-Baffle Stack',
        pressureZoneBar: 65,
        roleDescription: 'Full-length tensioned shroud with radial rear reflex vents and 1/2"-20 UNF front muzzle thread.',
        pinX: 165,
        pinY: 75,
      },
      {
        partCode: 'MP30-05',
        partName: 'Upper 150cc 250-Bar Under-Barrel Air Cylinder & Front Manometer',
        dimensionsMm: 'L=245.0mm · OD=Ø32.00mm · Wall=3.20mm · Vol=150cc @ 250 Bar',
        material: '7075-T651 Seamless High-Pressure Tube + 0–300B Gauge',
        pressureZoneBar: 250,
        roleDescription: 'Upper primary 250-Bar air cylinder mounted directly beneath the Ø34mm barrel shroud.',
        pinX: 205,
        pinY: 118,
      },
      {
        partCode: 'MP30-06',
        partName: 'Lower 150cc 250-Bar Under-Barrel Air Cylinder & Foster Quick-Fill',
        dimensionsMm: 'L=245.0mm · OD=Ø32.00mm · Wall=3.20mm · Combined=300cc @ 250B',
        material: '7075-T651 Seamless Tube + Male Stainless Foster Fill Nipple',
        pressureZoneBar: 250,
        roleDescription: 'Lower stacked 250-Bar cylinder doubling onboard air capacity to 300cc (36 regulated .30 Cal shots per fill).',
        pinX: 205,
        pinY: 162,
      },
      {
        partCode: 'MP30-07',
        partName: 'CNC Twin Figure-8 Over-Under Regulator Manifold & Harmonic Clamp',
        dimensionsMm: 'H=98.0mm · W=38.0mm · Thick=24.0mm · Tri-Bore Clamp',
        material: '7075-T651 CNC Billet + Dual 316L Check Valves',
        pressureZoneBar: 250,
        roleDescription: 'Joins Upper & Lower 150cc cylinders in parallel and locks the barrel shroud against harmonic whip.',
        pinX: 278,
        pinY: 122,
      },
      {
        partCode: 'MP30-08',
        partName: '165-Bar Belleville Regulator Cartridge & 48cc Receiver Plenum',
        dimensionsMm: 'Plenum Vol=48.0cc · Regulated Setpoint=165 Bar (±1.0 Bar)',
        material: '17-4PH Regulator Piston + 14× DIN 2093 Belleville Washers',
        pressureZoneBar: 165,
        roleDescription: 'Steps 250-Bar dual-cylinder storage down to 165 Bar inside the 48cc vertical firing plenum.',
        pinX: 342,
        pinY: 142,
      },
      {
        partCode: 'MP30-09',
        partName: 'High-Flow Balanced PEEK Poppet Valve & Linear Hammer Shuttle',
        dimensionsMm: 'Poppet Throat=Ø7.20mm · Lift=2.70mm · Dwell=1.6ms',
        material: 'Ketron PEEK-1000 Poppet + Hardened 4140 Hammer Shuttle',
        pressureZoneBar: 165,
        roleDescription: 'Unleashes 48cc of 165-Bar gas up the Ø6.2mm vertical transfer port into the .30 breech.',
        pinX: 365,
        pinY: 112,
      },
      {
        partCode: 'MP30-10',
        partName: 'Articulated Biathlon Side-Lever & Ø7.60mm Stainless Bolt Probe',
        dimensionsMm: 'Lever Throw=38.0mm · Probe OD=Ø7.60mm · Hollow Flow Tip',
        material: '316L Stainless Probe + Anodized Knurled Biathlon Drop Handle',
        pressureZoneBar: 165,
        roleDescription: 'Smooth two-finger rear pull cocks the hammer shuttle, indexes the 9-rd magazine, and seats the next .30 slug.',
        pinX: 485,
        pinY: 62,
      },
      {
        partCode: 'MP30-11',
        partName: '9-Round .30 Cal Auto-Indexing Rotary Magazine + M-LOK Foregrip & Red-Dot',
        dimensionsMm: 'Mag OD=Ø46.0mm (9× .30 Rds) · Foregrip L=95.0mm · Reflex Optic',
        material: 'CNC Anodized Aluminum Rotor + Smoked Polycarbonate Window',
        pressureZoneBar: 0,
        roleDescription: 'Auto-indexes 9× .30 Cal slugs; paired with M-LOK vertical foregrip and top MIL-STD-1913 reflex sight.',
        pinX: 318,
        pinY: 205,
      },
      {
        partCode: 'MP30-12',
        partName: '180° Side-Folding Knuckle & 6-Position Telescoping M4 Buttstock',
        dimensionsMm: 'OAL=520mm Folded / 755mm Extended · Cheek Riser +18mm · 2.70 kg',
        material: '7075-T6 Folding Hinge & Mil-Spec Buffer Tube + PA12-CF Stock',
        pressureZoneBar: 0,
        roleDescription: 'Locks folded at 520mm for compact CQB maneuverability or deploys to 755mm with adjustable cheek weld.',
        pinX: 655,
        pinY: 118,
      },
    ],
  },
  {
    progressionId: 'GUN_06_P50',
    tierOrder: 7,
    versionId: 'ver_v6_p50_p90_helical',
    versionTag: 'v7.0',
    shortTitle: '#07 P50 (.50 Pressurized Mag + Screw-Off Barrel Reserve)',
    fullTitle: '#07 P50 (.50 Cal / 12.7mm P90-Style Auto · Pressurized Mag w/ Breech-Alignment Interlock + Screw-Off Quick-Change Barrel Reserves + Forward Refill Foregrip)',
    isDefaultStarterOption: false,
    familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_01_fx_drs',
    lowerPlatformId: 'plat_02_leshiy2',
    dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
    defaultCaliberMm: 12.7,
    imperialCaliberLabel: '.50 Cal (12.7mm · Screw-Off Barrel Swap)',
    operatingPressureBar: 250,
    muzzleEnergyJoules: 318,
    magazineCapacity: 20,
    functionalCycleSummary:
      'Pressurized Magazine Behind-the-Round + Screw-Off Quick-Change Barrel Reserve + Extended Refill Foregrip: The air stored in the P50 top magazine (145cc @ 250 Bar) is positioned directly behind the staged round and ready to fire it, but is physically blocked by a Mechanical Breech-Alignment Safety Interlock until the round rotates 90° in the helical turret, drops -34mm into the breech saddle, and aligns within ±0.005mm of the barrel axis. Furthermore, the user can unscrew and swap the M32×1.5 quick-change barrel assembly to change BOTH the caliber (.30 Cal / .50 Cal / .50 Extended) AND the stored Over-Barrel Air Reserve volume (85cc / 160cc / 220cc), while the optional Refill Pump Foregrip mounted further down the barrel shroud pumps air into both the barrel reserve and the rest of the gun.',
    airflowCompressionToReleaseSummary:
      'Self-Contained Closed-Loop Pneumatic Cycle + Pressurized Mag Interlock: Air in the top magazine spine sits directly behind the staged round, mechanically locked until the round drops into the breech and aligns with the barrel. Unscrewing the barrel swaps both caliber and coaxial barrel reserve capacity (85cc–220cc), while the forward-mounted under-barrel Refill Foregrip can be pumped to recharge the barrel reserve, grip riser, and 280cc buttstock cylinders.',
    screwsAndFasteners: [
      {
        code: 'P50-SCR-01',
        name: 'Top 90° Helical Turret Saddle, Elevator Chute & Coaxial Laser Bolts (4×)',
        threadMetricSpec: 'M4×0.7 × 12mm Socket Head Cap Screws (WS₂ Dry-Film Space Lube)',
        headAndDrive: '3.0mm Hex Drive (A286 Superalloy)',
        materialGrade: 'A286 Precipitation-Hardened Stainless (Space/Subsea Rated)',
        torqueNm: 6.0,
        locationAndRole:
          'Secures the hermetic .50 Cal 90° helical rotation turret, vertical push-down elevator chute, and front coaxial laser bridge.',
        pinX: 415,
        pinY: 82,
      },
      {
        code: 'P50-SCR-02',
        name: '4-Zone Air Manifold Couplers (Mag M14×1.25 Stinger + Barrel/Stock/Foregrip Ports)',
        threadMetricSpec: 'M14×1.25 Mag Stinger + M18×1.5 Buttstock/Foregrip/Barrel Ports',
        headAndDrive: '17mm & 22mm Hex Spanner Collars',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 22.0,
        locationAndRole:
          'Couples all 4 pressurized reserves (Mag Spine, Barrel OTB Jacket, Buttstock Twin Tubes, and Foregrip Bottle) into the central automatic plenum.',
        pinX: 455,
        pinY: 118,
      },
      {
        code: 'P50-SCR-03',
        name: 'Folding Tactical Bipod Cradle Pivot & Picatinny Lock Bolt',
        threadMetricSpec: 'M5×0.8 × 26mm Cross-Locking Clamp Bolt + Dual Leg Detent Pins',
        headAndDrive: '4.0mm Hex Socket + Knurled Thumb Wheel',
        materialGrade: '4140 Nitrided Alloy Steel',
        torqueNm: 8.5,
        locationAndRole:
          'Anchors the folding telescopic twin-leg tactical bipod under the front barrel reserve shroud.',
        pinX: 215,
        pinY: 162,
      },
      {
        code: 'P50-SCR-04',
        name: 'Full-Auto Reciprocating Bolt Guide Rods & Buttstock Plenum Bolts (4×)',
        threadMetricSpec: 'M5×0.8 × 20mm Socket Cap Screws',
        headAndDrive: '4.0mm Internal Hex Drive',
        materialGrade: '12.9 Alloy Steel',
        torqueNm: 9.2,
        locationAndRole:
          'Guides the full-auto pneumatic blowback op-rod and anchors the 280cc buttstock air reserve.',
        pinX: 545,
        pinY: 148,
      },
    ],
    oringPlacements: [
      {
        code: 'P50-OR-01',
        name: '.50 Cal Dual Hermetic Breech Collar + PTFE Sand/Water Scraper Rings',
        isoOrParkerSizeMm: '12.70mm ID × 2.20mm CS (Dual Dynamic Lip + Spring-Energized PTFE)',
        compoundAndDurometer: 'FFKM Perfluoroelastomer + PU-95A (-150°C Space to 30m Subsea)',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 21.5,
        maxRatedBar: 300,
        placementAndFunction:
          'Phase 5 Seal: Expands radially 1.2mm under 200-Bar pilot pressure after the slug rotates 90° and drops down into the breech, sealing against vacuum outgassing, silica sand, or 4-Bar seawater.',
        pinX: 418,
        pinY: 118,
      },
      {
        code: 'P50-OR-02',
        name: 'Mag Spine & Foregrip Dry-Break Stinger Dual O-Rings (4×)',
        isoOrParkerSizeMm: '8.00mm ID × 1.78mm CS (Parker 2-011)',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 19.2,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the high-pressure transfer stingers connecting the Magazine Reserve (145cc) and Foregrip Reserve (120cc) into the receiver manifold.',
        pinX: 455,
        pinY: 112,
      },
      {
        code: 'P50-OR-03',
        name: 'Concentric Over-Barrel (160cc) & Buttstock (280cc) Reserve Bulkhead O-Rings (6×)',
        isoOrParkerSizeMm: '32.00mm ID × 2.50mm CS',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 20.4,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the 250-Bar Over-Barrel annular air jacket and rear Buttstock twin reserve cylinders.',
        pinX: 255,
        pinY: 118,
      },
      {
        code: 'P50-OR-04',
        name: 'Full-Auto Reciprocating Hollow-Probe Bolt Wiper & Seal O-Rings (2×)',
        isoOrParkerSizeMm: '12.70mm OD × 1.78mm CS',
        compoundAndDurometer: 'PTFE-Blended Polyurethane PU-95A + Bronze Sand Scraper',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 18.0,
        maxRatedBar: 250,
        placementAndFunction:
          'Wipes quartz sand particles and seawater off the reciprocating .50 Cal hollow-probe bolt during Phase 4 cycling.',
        pinX: 495,
        pinY: 118,
      },
    ],
    uniqueParts: [
      {
        partCode: 'P50-01',
        partName: 'Hermetic .50 Cal Top Spine Mag (Empty → Rotate 90° → Push Down) + 145cc Mag Reserve & Extended Plenum Stingers',
        dimensionsMm: 'L=285.0mm · W=52.0mm · 20× .50 Sabots + 145cc 250B Spine Reserve + Dual M14×1.25 Dry-Break Stingers',
        material: 'Smoked Lexan Polycarbonate + Nitinol Coil Follower + 90° Ti-6Al-4V Helical Cam',
        pressureZoneBar: 250,
        roleDescription: 'Depletes .50 slugs front-to-rear, rotates each 90° in the spiral turret, and pushes it down (-56mm) into the coaxial breech while coupling 145cc directly into the 110cc Extended Regulated Plenum.',
        pinX: 285,
        pinY: 88,
      },
      {
        partCode: 'P50-02',
        partName: 'Concentric .50 Barrel + 160cc Over-Barrel Reserve + Grip Fill Riser & Laminar Buttstock Bypass Bus',
        dimensionsMm: 'Barrel L=457.0mm · Bore=12.7mm (.50 Cal) · OTB Reserve=160cc + Twin Ø8.5mm Bypass Pipes',
        material: '4140 Nitride .50 Barrel + Ti-6Al-4V OTB Jacket + 316L High-Pressure Laminar Conduits',
        pressureZoneBar: 250,
        roleDescription: 'Receives 250B air from the ergonomic P90 grip base Foster fill port up the vertical riser into the 160cc barrel reserve, then flows past the grip via twin laminar bypass pipes into the 280cc buttstock tanks.',
        pinX: 195,
        pinY: 122,
      },
      {
        partCode: 'P50-03',
        partName: '180cc Pressurized Foregrip Reserve + Ergonomic P90 Grip Fill Manifold + Folding Tactical Bipod',
        dimensionsMm: 'Foregrip Vol=180cc @ 250B · Grip Fill Check Valve=250B · Bipod Leg=185–260mm',
        material: '7075-T651 Foregrip Bottle + PA12-CF Bullpup Grip w/ 316L Fill Core + Carbon Bipod',
        pressureZoneBar: 250,
        roleDescription: 'Houses the bottom Foster quick-fill port inside the pistol grip that charges the 160cc Barrel Reserve, 180cc Foregrip Reserve, and 280cc Buttstock.',
        pinX: 245,
        pinY: 168,
      },
      {
        partCode: 'P50-04',
        partName: '280cc Buttstock Dual Reserve + 110cc Extended Plenum + Hermetic 6-Phase Blowback Bolt',
        dimensionsMm: 'Buttstock Vol=280cc @ 250B · Extended Plenum=110cc @ 200B · 450 RPM Auto',
        material: 'PA12-CF Bullpup Chassis + Dual 7075-T651 Cylinders + WS₂-Coated 316L Bolt',
        pressureZoneBar: 250,
        roleDescription: 'Receives barrel reserve flow past the grip into 280cc rear cylinders and couples with the mag spine to feed the 110cc Extended Regulated Plenum for Space/Sand/Underwater full-auto fire.',
        pinX: 565,
        pinY: 138,
      },
    ],
  },
  {
    progressionId: 'GUN_07_ASCENT45',
    tierOrder: 8,
    versionId: 'ver_v7_ascent_45_300bar',
    versionTag: 'v8.0',
    shortTitle: '#08 Custom .45 Ascent (4-Bar Pump + Modular Barrel Plenum + Sniper Variant)',
    fullTitle: '#08 Custom Redesigned Ascent × Vectis .45 Cal (Compound 4-Bar 300B Pump · Modular Barrel Reserve/Plenum · Screw-On M18×1.0 Silencer · Carbine & Sniper Variants · Multi-Caliber Swap)',
    isDefaultStarterOption: false,
    familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
    burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_03_aspen_pump',
    lowerPlatformId: 'plat_03_aspen_pump',
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
    defaultCaliberMm: 11.43,
    imperialCaliberLabel: '.45 Cal (11.43mm · Multi-Cal Swap)',
    operatingPressureBar: 300,
    muzzleEnergyJoules: 286.6,
    magazineCapacity: 6,
    functionalCycleSummary:
      'Custom .45 Cal (11.43mm, live-swappable .22/.25/.30/.357/.45/.50 barrel & rotary mag) Compound 4-Bar Over-Center 300-Bar Pump Carbine & Sniper Variant: Pivot the 6.8:1 Compound 4-Bar Under-Barrel Lever (#12) to drive the sliding bronze crosshead and telescopic Stage-2/Stage-3 pistons to 300 Bar into both the 240cc Under-Barrel Reserve (#11) and Front Coaxial Barrel Reserve (#09A). An internal coaxial Belleville Regulator Bulkhead (#09B) steps 300 Bar down to 210 Bar in the Rear Coaxial Over-Barrel Firing Plenum (#09C). Features a Screw-On M18×1.0 QuietEnergy 6-Gill Silencer (#10) and toggleable Long-Range Sniper Variant (6-24×50 FFP Scope + Folding Carbon Bipod + Heavy Extended Barrel Plenum).',
    airflowCompressionToReleaseSummary:
      '[Step 1 Desiccant Intake 1B] → [Step 2 Compound 4-Bar Toggle & Sliding Crosshead drive Stage-2 (65B) & Stage-3 Ø6mm Rod (300B) past Part #116 Check Block into Under-Barrel Reserve #11 & Front Coaxial Barrel Reserve #09A] → [Step 3 Internal Coaxial Belleville Regulator Bulkhead #09B meters 210B into Rear Over-Barrel Plenum #09C] → [Step 4 Quattro Trigger #03 opens PEEK Poppet 2.8mm to blast 210B radially behind caliber-matched slug] → [Step 5 Screw-On M18×1.0 6-Gill QuietEnergy Silencer #10 strips muzzle gas (-28.5 dB)].',
    screwsAndFasteners: [
      {
        code: 'ASC-SCR-01',
        name: 'Compound 4-Bar Over-Center 300-Bar Pump Fulcrum & Crosshead Clevis Pins (#12)',
        threadMetricSpec: 'M6×1.0 × 24mm Shoulder Fulcrum Bolt + 2× Ø5.0mmH7 Crosshead Pins',
        headAndDrive: '5.0mm Hex Socket Head + Nord-Lock Wedge Washers',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 14.5,
        locationAndRole:
          'Provides 6.8:1 over-center mechanical advantage and zero side-load buckling on the Ø6.0mm Stage-3 300-Bar piston rod via the sliding phosphor-bronze crosshead collar.',
        pinX: 545,
        pinY: 162,
      },
      {
        code: 'ASC-SCR-02',
        name: 'Modular Coaxial Barrel Reserve (300B) & Regulator Bulkhead Threads (#09)',
        threadMetricSpec: 'M36×1.5 Coaxial Titanium Shroud + M32×1.0 Internal Regulator Bulkhead',
        headAndDrive: 'Pin-Spanner Bulkhead Lock Rings',
        materialGrade: 'Ti-6Al-4V Grade 5 Titanium',
        torqueNm: 34.0,
        locationAndRole:
          'Divides the Over-the-Barrel shroud into a Front 300-Bar Coaxial Air Reserve and Rear 210-Bar Regulated Firing Plenum around the quick-swap barrel liner (#08).',
        pinX: 590,
        pinY: 96,
      },
      {
        code: 'ASC-SCR-03',
        name: 'Screw-On QuietEnergy 6-Gill Silencer M18×1.0 Muzzle Threads (#10)',
        threadMetricSpec: 'M18×1.0 Right-Hand Precision Muzzle Spigot + FKM-90 Shoulder O-Ring',
        headAndDrive: 'Knurled Rear Thread Collar (Tool-Free Screw On / Off)',
        materialGrade: '7075-T651 Hard Black Anodized + 316L Thread Spigot',
        torqueNm: 16.0,
        locationAndRole:
          'Allows the 6-gill QuietEnergy moderator to screw cleanly onto or off the exposed M18×1.0 muzzle threads while maintaining sub-0.01mm bore concentricity.',
        pinX: 720,
        pinY: 96,
      },
      {
        code: 'ASC-SCR-04',
        name: 'Quattro 2-Stage Trigger Sear, Lever Pivot & Caliber-Swap Barrel Set Screws (#02/#03/#08)',
        threadMetricSpec: 'M4×0.7 Pivot Bolt + 2× M5×0.8 Barrel Liner Index Screws',
        headAndDrive: '2.5mm & 3.0mm Internal Hex Drives',
        materialGrade: 'A2 Tool Steel (HRC 58)',
        torqueNm: 5.5,
        locationAndRole:
          'Locks the caliber-matched barrel liner (.22 to .50 Cal) and indexes the matching rotary magazine cassette (#05).',
        pinX: 295,
        pinY: 158,
      },
    ],
    oringPlacements: [
      {
        code: 'ASC-OR-01',
        name: 'Stage-3 Ø5.6mm 300-Bar High-Pressure Pump Piston Seal (#12)',
        isoOrParkerSizeMm: '5.60mm OD × 1.80mm CS (Custom Step-Cut Backup + O-Ring)',
        compoundAndDurometer: '25% Glass-PTFE Backup Ring + Viton FKM-90 Core',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 21.8,
        maxRatedBar: 350,
        placementAndFunction:
          'Seals the final 300-Bar compression stage inside the onboard 3-stage pump without thermal extrusion.',
        pinX: 575,
        pinY: 162,
      },
      {
        code: 'ASC-OR-02',
        name: '1-Way 300-Bar Non-Return Check Valve Conical Seat Seal (#11)',
        isoOrParkerSizeMm: '6.00mm ID × 1.50mm CS',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_FACE',
        glandSqueezePct: 24.0,
        maxRatedBar: 350,
        placementAndFunction:
          'Opens at >12 Bar differential during pump push stroke and snaps shut to lock 300 Bar inside Under-Barrel Reserve (#11).',
        pinX: 485,
        pinY: 138,
      },
      {
        code: 'ASC-OR-03',
        name: '140cc Over-Barrel Plenum Coaxial Bulkhead O-Rings (4×, #09)',
        isoOrParkerSizeMm: '36.00mm OD & 18.00mm ID × 2.50mm CS',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 18.5,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals both outer Ø42mm titanium tube ends and inner Ø18mm barrel sleeve to hold 210 Bar around the barrel.',
        pinX: 555,
        pinY: 96,
      },
      {
        code: 'ASC-OR-04',
        name: '.45 Cal (11.43mm) Breech Probe & Rotary Mag Transfer O-Ring (#05)',
        isoOrParkerSizeMm: '11.43mm ID × 1.78mm CS (Parker 2-013)',
        compoundAndDurometer: 'Polyurethane PU-90A',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 19.8,
        maxRatedBar: 250,
        placementAndFunction:
          'Seals the rear of the 6-round .45 rotary magazine when the Vectis lever closes the bolt probe.',
        pinX: 365,
        pinY: 96,
      },
    ],
    uniqueParts: [
      {
        partCode: 'ASC-09',
        partName: '#09 140cc Concentric Over-Barrel 2+ Round Plenum (210 Bar)',
        dimensionsMm: 'L=420.0mm · OD=Ø42.0mm · ID=Ø18.0mm · 140cc',
        material: 'Ti-6Al-4V Grade 5 Titanium Coaxial Tube',
        pressureZoneBar: 210,
        roleDescription: 'Stores 140cc of regulated 210-Bar air directly around the .45 barrel for 2.6 full-power shots.',
        pinX: 555,
        pinY: 96,
      },
      {
        partCode: 'ASC-10',
        partName: '#10 QuietEnergy 6-Baffle Muzzle Silencer (-26.5 dB)',
        dimensionsMm: 'L=165.0mm · OD=Ø42.0mm · Bore=Ø13.2mm',
        material: '7075-T6 Monocore + 6× Angled K-Baffles',
        pressureZoneBar: 45,
        roleDescription: 'Strips and cools expanding .45 muzzle gas through 6 side diffuser gills.',
        pinX: 735,
        pinY: 96,
      },
      {
        partCode: 'ASC-11',
        partName: '#11 240cc 300-Bar Under-Barrel HPA Reserve & Regulator Bridge',
        dimensionsMm: 'L=360.0mm · OD=Ø36.0mm · Wall=3.6mm · 300 Bar',
        material: '7075-T651 + Carbon-Wrap Overwind',
        pressureZoneBar: 300,
        roleDescription: 'Receives 300-Bar air from the pump and feeds the Over-Barrel Plenum at 210 Bar.',
        pinX: 525,
        pinY: 132,
      },
      {
        partCode: 'ASC-12',
        partName: '#12 In-Game 3-Stage 300-Bar Under-Barrel Hand Pump',
        dimensionsMm: 'Stroke=210.0mm · Stage-3 Piston=Ø5.60mm · +28B/Stroke',
        material: '17-4PH H900 Rod + PTFE/Viton Seals',
        pressureZoneBar: 300,
        roleDescription: 'Interactive onboard 3-stage pump that charges the Under-Barrel Reserve to 300 Bar.',
        pinX: 575,
        pinY: 162,
      },
    ],
  },
  {
    progressionId: 'GUN_09_PROTECTOR',
    tierOrder: 9,
    versionId: 'ver_v9_the_protector',
    versionTag: 'v9.0',
    shortTitle: '#09 The Protector (.50 Dual Barrel-Reserve Scatter Gun)',
    fullTitle:
      '#09 The Protector (.50 Cal / 12.7mm Dual Threaded Barrel-Reserve Scatter Gun · Reverse-Loop Center-Barrel Airflow & Post-Muzzle Scatter)',
    isDefaultStarterOption: false,
    familyId: 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY',
    burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
    rexMode: 'REX_P_PISTOL_1SHOT',
    upperPlatformId: 'plat_23_aea_megalodon',
    lowerPlatformId: 'plat_23_aea_megalodon',
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
    defaultCaliberMm: 12.7,
    imperialCaliberLabel: '.50 Cal (12.7mm Dual Scatter)',
    operatingPressureBar: 250,
    muzzleEnergyJoules: 342,
    magazineCapacity: 2,
    functionalCycleSummary:
      'Dual Threaded Barrel-Reserves + Cock-Open/Load/Cock-Up/Select-Fire + Reverse-Loop Center-Barrel Scatter: Features TWO independent M28×1.5 threaded barrels stacked over/under where each barrel’s outer annular jacket is a self-contained 250-Bar air reserve (110cc × 2 = 220cc) for 2 separate shots. (1) Cock it open (break-action barrels pivot down 40°); (2) Load 2× .50 Cal Break-Apart Sabot Scatter Cartridges; (3) Cock it up to lock the standing breech; (4) Set the 3-Position Fire Selector (Barrel 1 Upper, Barrel 2 Lower, or Dual Salvo); (5) Fire: air flows from the selected barrel’s coaxial air reserve backward to the rear receiver manifold, loops 180° around, and injects into the middle of the barrel behind the round—launching the sabot which breaks apart into an 8-pellet tungsten flechette scatter cone immediately after leaving the barrel!',
    airflowCompressionToReleaseSummary:
      '[Step 1 Dual Threaded Barrel Reserves (2× 110cc @ 250 Bar)] → [Step 2 Cock Open 40°, Load 2× .50 Scatter Sabots, Cock Up & Select Barrel 1 / Barrel 2 / Salvo] → [Step 3 Trigger Releases Rear Valve: Air Flows from Barrel Reserve BACKWARD to Rear Receiver Manifold] → [Step 4 180° Reverse-Loop Manifold Channels 250B Gas into the MIDDLE of the Barrel Bore Behind the Round] → [Step 5 Projectile Exits Muzzle, Sabot Petals Strip & Break Apart, Scattering 8× Tungsten Flechettes in a High-Velocity Cone].',
    screwsAndFasteners: [
      {
        code: 'PROT-SCR-01',
        name: 'Upper & Lower M28×1.5 Self-Sealing Threaded Barrel-Reserve Spigots (2×)',
        threadMetricSpec: 'M28×1.5 Right-Hand Coaxial High-Pressure Barrel-Reserve Threads',
        headAndDrive: 'Knurled Fluted Barrel Collar + 26mm Spanner Flats',
        materialGrade: 'Ti-6Al-4V Grade 5 Titanium + 17-4PH Dry-Break Check Ring',
        torqueNm: 32.0,
        locationAndRole:
          'Threads the Upper (Barrel 1) and Lower (Barrel 2) self-contained 110cc 250-Bar barrel reserves into the break-action trunnion block.',
        pinX: 335,
        pinY: 74,
      },
      {
        code: 'PROT-SCR-02',
        name: 'Break-Action Cock-Open / Cock-Up Trunnion Hinge Axle Bolt',
        threadMetricSpec: 'Ø8.00mmH7 Hardened Trunnion Pin + M5×0.8 Retention Cap Screw',
        headAndDrive: '4.0mm Internal Hex Socket',
        materialGrade: '4340 Chromoly Nitrided Steel (HRC 48)',
        torqueNm: 14.0,
        locationAndRole:
          'Provides the heavy-duty pivot fulcrum allowing the dual threaded barrel reserves to cock open 40° for breech loading and cock up into battery.',
        pinX: 315,
        pinY: 168,
      },
      {
        code: 'PROT-SCR-03',
        name: '180° Reverse-Loop Rear Manifold Banjo & Center-Barrel Transfer Bolts (4×)',
        threadMetricSpec: 'M6×1.0 × 18mm High-Pressure Banjo Cap Bolts',
        headAndDrive: '5.0mm Internal Hex Drive',
        materialGrade: '17-4PH Condition H900 Stainless Steel',
        torqueNm: 16.5,
        locationAndRole:
          'Secures the rear 180° U-turn air loop manifold that routes barrel-reserve gas from the back of the receiver forward into the middle of the barrel bore.',
        pinX: 465,
        pinY: 74,
      },
      {
        code: 'PROT-SCR-04',
        name: '3-Position Fire Selector Detent & Top Break-Open Latch Crossbolt',
        threadMetricSpec: 'M4×0.7 Selector Detent Plunger + M5×0.8 Top Stirrup Lock Wedge',
        headAndDrive: 'Ambidextrous Thumb Selector Lever (1 / 2 / SALVO)',
        materialGrade: 'A2 Tool Steel (HRC 60)',
        torqueNm: 7.8,
        locationAndRole:
          'Selects between Upper Barrel Reserve #1, Lower Barrel Reserve #2, or Simultaneous Dual-Barrel Salvo.',
        pinX: 495,
        pinY: 178,
      },
    ],
    oringPlacements: [
      {
        code: 'PROT-OR-01',
        name: 'Upper & Lower Threaded Barrel-Reserve Coaxial Bulkhead O-Rings (4×)',
        isoOrParkerSizeMm: '24.00mm ID × 2.50mm CS (Parker 2-119)',
        compoundAndDurometer: 'Viton FKM-90 Shore A',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 21.4,
        maxRatedBar: 300,
        placementAndFunction:
          'Seals the 250-Bar annular air reserve inside each of the two M28×1.5 threaded barrels.',
        pinX: 225,
        pinY: 74,
      },
      {
        code: 'PROT-OR-02',
        name: 'Standing Breech-to-Rear Reverse-Loop Transfer Face O-Rings (4×)',
        isoOrParkerSizeMm: '11.00mm ID × 2.00mm CS',
        compoundAndDurometer: 'Polyurethane PU-95A (Dynamic Face Energized)',
        sealType: 'BREECH_TRANSFER',
        glandSqueezePct: 20.2,
        maxRatedBar: 280,
        placementAndFunction:
          'Couples the rear outlet of each threaded barrel reserve into the receiver’s 180° reverse-loop manifold when cocked up and locked.',
        pinX: 410,
        pinY: 74,
      },
      {
        code: 'PROT-OR-03',
        name: 'Center-Barrel Mid-Bore Radial Gas Injection Sleeve O-Rings (4×)',
        isoOrParkerSizeMm: '15.00mm ID × 1.78mm CS',
        compoundAndDurometer: 'PTFE-Blended Viton FKM-90',
        sealType: 'STATIC_RADIAL',
        glandSqueezePct: 19.0,
        maxRatedBar: 260,
        placementAndFunction:
          'Seals the mid-barrel injection ports where the 180° reverse-looped air enters the middle of the barrel to push the scatter sabot forward.',
        pinX: 285,
        pinY: 118,
      },
      {
        code: 'PROT-OR-04',
        name: 'Break-Apart Scatter Sabot Obturation & Petal-Shear Ring (2×)',
        isoOrParkerSizeMm: '12.70mm OD × 1.50mm CS',
        compoundAndDurometer: 'Low-Friction Virgin PTFE / Delrin Petal Collar',
        sealType: 'DYNAMIC_PISTON_OR_PROBE',
        glandSqueezePct: 15.5,
        maxRatedBar: 250,
        placementAndFunction:
          'Holds the 4-petal scatter sabot together inside the barrel bore and shears cleanly via muzzle crown spin + gas blast so the round breaks apart and scatters after leaving the barrel.',
        pinX: 165,
        pinY: 118,
      },
    ],
    uniqueParts: [
      {
        partCode: 'PROT-01',
        partName: 'Upper & Lower M28×1.5 Threaded Air-Reserve Barrels (2× 110cc @ 250 Bar)',
        dimensionsMm: '2× (L=340.0mm · Reserve OD=Ø34.0mm · Bore=Ø12.70mm · 110cc @ 250B)',
        material: 'Ti-6Al-4V Outer Reserve Jacket + 4140 Rifled .50 Inner Liner',
        pressureZoneBar: 250,
        roleDescription:
          'Two separate threaded barrels that each store 110cc of 250-Bar air in their coaxial outer sleeve for 2 independent shots.',
        pinX: 195,
        pinY: 72,
      },
      {
        partCode: 'PROT-02',
        partName: 'Break-Action Cock-Open / Cock-Up Trunnion Block & Twin Scatter Chambers',
        dimensionsMm: 'H=76.0mm · W=44.0mm · Pivot Angle=40.0° Cock-Open Throw',
        material: '7075-T651 Hard Anodized Trunnion + 17-4PH Dual Extractors',
        pressureZoneBar: 250,
        roleDescription:
          'Cock it open 40° to load 2× .50 Cal Sabot Scatter Cartridges into the breech, then cock it up to lock against the rear loop manifold.',
        pinX: 355,
        pinY: 72,
      },
      {
        partCode: 'PROT-03',
        partName: '180° Reverse-Loop Rear Manifold & Center-Barrel Mid-Bore Injector',
        dimensionsMm: 'Loop Radius=24.0mm · Conduit ID=Ø7.5mm · Mid-Bore Port @ L=155mm',
        material: '316L Seamless High-Pressure U-Loop + C36000 Venturi Injector Ring',
        pressureZoneBar: 250,
        roleDescription:
          'Routes air from the threaded barrel reserve out to the back of the gun, loops 180° around, and injects it into the middle of the barrel behind the projectile.',
        pinX: 455,
        pinY: 118,
      },
      {
        partCode: 'PROT-04',
        partName: '3-Position Fire Selector (Barrel 1 / Barrel 2 / Salvo) & Break-Apart Scatter Sabot',
        dimensionsMm: 'Selector=3-Pos · Payload=8× Ø4.8mm Tungsten Flechettes in 4-Petal Sabot',
        material: 'A2 Tool Steel Selector + Delrin 4-Petal Centrifugal Scatter Sabot',
        pressureZoneBar: 250,
        roleDescription:
          'Fires Barrel 1, Barrel 2, or both; once the sabot exits the muzzle crown, aerodynamic drag + rifling spin strips the 4 petals so the round breaks apart and scatters.',
        pinX: 555,
        pinY: 168,
      },
    ],
  },
];

export interface P50ScrewOnBarrelOptionSpec {
  optionId: 'BRL_30CAL_85CC' | 'BRL_50CAL_160CC' | 'BRL_50CAL_EXT_220CC';
  label: string;
  shortBadge: string;
  caliberMm: number;
  imperialCaliberLabel: string;
  barrelLengthMm: number;
  barrelReserveVolumeCc: number;
  maxPressureBar: number;
  magazineCapacity: number;
  muzzleEnergyJoules: number;
  threadSpec: string;
  engineeringSummary: string;
}

export const P50_SCREW_ON_BARREL_OPTIONS: P50ScrewOnBarrelOptionSpec[] = [
  {
    optionId: 'BRL_30CAL_85CC',
    label: '.30 Cal (7.62mm) Compact 320mm Screw-On Barrel + 85cc Reserve',
    shortBadge: '🔩 .30 Cal (320mm · 85cc Air)',
    caliberMm: 7.62,
    imperialCaliberLabel: '.30 Cal (7.62mm)',
    barrelLengthMm: 320,
    barrelReserveVolumeCc: 85,
    maxPressureBar: 250,
    magazineCapacity: 34,
    muzzleEnergyJoules: 168,
    threadSpec: 'M32×1.5 Self-Sealing Dry-Break Barrel Thread',
    engineeringSummary:
      'Unscrews the .50 barrel and threads on a compact 320mm .30 Cal barrel with an 85cc coaxial air reserve, increasing top helical magazine capacity to 34 rounds.',
  },
  {
    optionId: 'BRL_50CAL_160CC',
    label: '.50 Cal (12.7mm) Standard 457mm Screw-On Barrel + 160cc Reserve',
    shortBadge: '🔩 .50 Cal Std (457mm · 160cc Air)',
    caliberMm: 12.7,
    imperialCaliberLabel: '.50 Cal (12.7mm)',
    barrelLengthMm: 457,
    barrelReserveVolumeCc: 160,
    maxPressureBar: 250,
    magazineCapacity: 20,
    muzzleEnergyJoules: 318,
    threadSpec: 'M32×1.5 Self-Sealing Dry-Break Barrel Thread',
    engineeringSummary:
      'Factory .50 Cal 457mm screw-on barrel housing a 160cc 250-Bar coaxial air reserve and forward mounting rail for the optional Refill Pump Foregrip.',
  },
  {
    optionId: 'BRL_50CAL_EXT_220CC',
    label: '.50 Cal (12.7mm) Heavy Extended 580mm Screw-On Barrel + 220cc Reserve',
    shortBadge: '🔩 .50 Cal Heavy (580mm · 220cc Air)',
    caliberMm: 12.7,
    imperialCaliberLabel: '.50 Cal Heavy (12.7mm)',
    barrelLengthMm: 580,
    barrelReserveVolumeCc: 220,
    maxPressureBar: 250,
    magazineCapacity: 20,
    muzzleEnergyJoules: 375,
    threadSpec: 'M32×1.5 Self-Sealing Dry-Break Barrel Thread',
    engineeringSummary:
      'Extended 580mm heavy .50 Cal barrel with an enlarged 220cc 250-Bar coaxial air reserve and long distal shroud section for the forward Refill Pump Foregrip.',
  },
];

export function getCanonicalWeaponByProgressionId(
  id: CanonicalGunProgressionId
): CanonicalWeaponBlueprintSpec {
  return (
    CANONICAL_7_WEAPONS_PROGRESSION.find((w) => w.progressionId === id) ||
    CANONICAL_7_WEAPONS_PROGRESSION[0]
  );
}

export function resolveCanonicalWeaponFromContext(
  ctx?: Weapon3DFamilyContext,
  activeVersionId?: string
): CanonicalWeaponBlueprintSpec {
  if (activeVersionId) {
    const byVer = CANONICAL_7_WEAPONS_PROGRESSION.find(
      (w) => w.versionId === activeVersionId
    );
    if (byVer) return byVer;
  }
  if (!ctx) return CANONICAL_7_WEAPONS_PROGRESSION[0];
  if (ctx.familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_09_PROTECTOR');
  }
  if (ctx.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
    if (ctx.burstStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL') {
      return getCanonicalWeaponByProgressionId('GUN_03_DEFENDER');
    }
    return getCanonicalWeaponByProgressionId('GUN_01_PEN');
  }
  if (ctx.familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_02_REXP');
  }
  if (ctx.familyId === 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_04B_THE_LEAF_45');
  }
  if (ctx.familyId === 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_04_LESHIY');
  }
  if (ctx.familyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_05_MP30');
  }
  if (ctx.familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_06_P50');
  }
  if (ctx.familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
    return getCanonicalWeaponByProgressionId('GUN_07_ASCENT45');
  }
  return CANONICAL_7_WEAPONS_PROGRESSION[0];
}

// ============================================================================
// PERSISTENT INTERACTIVE ROADMAP MAP & 2-DEPARTMENT AGENT OPERATING SYSTEM
// (Department 1: Game Development & CAD Physics | Department 2: Marketing & Merch)
// ============================================================================

export type StudioDepartmentId = 'GAME_DEVELOPMENT' | 'MARKETING_AND_MERCH';

export interface PersistentRoadmapMapNode {
  nodeId: string;
  code: string;
  title: string;
  department: StudioDepartmentId;
  linkedGunId?: CanonicalGunProgressionId;
  mapX: number; // 0..1000 SVG coordinate
  mapY: number; // 0..420 SVG coordinate
  dependsOnNodeIds: string[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUEUED';
  completionPct: number;
  assignedAgentName: string;
  screwsAndOringsAudited: boolean;
  stlToleranceMm: number;
  deliverableSummary: string;
  smartGoals: [string, string, string];
  accomplishedGoalCount: 2 | 3;
}

export interface MerchAndMarketingItemSpec {
  itemId: string;
  skuCode: string;
  title: string;
  category: '1_TO_1_CUTAWAY_MODEL' | 'BLUEPRINT_DESK_MAT' | 'CNC_BRASS_KEYCHAIN' | 'DEVLOG_TRAILER_CAMPAIGN';
  linkedGunId: CanonicalGunProgressionId;
  unitCostUsd: number;
  retailPriceUsd: number;
  grossMarginPct: number;
  status: 'LIVE_IN_STORE' | 'PROTOTYPE_READY' | 'AWAITING_HITL_APPROVAL';
  assignedMarketingAgent: string;
  specSummary: string;
}

export const INITIAL_PERSISTENT_ROADMAP_NODES: PersistentRoadmapMapNode[] = [
  // Row 1: Game Development Department (7 Canonical Weapons Divide & Conquer Track)
  {
    nodeId: 'node_gd_01_pen',
    code: 'GD-01',
    title: '#01 Pen Gun: M14×1.0 Retainer + FKM-90 Face O-Ring & 0.14ms Foil Rupture',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_01_PEN',
    mapX: 95,
    mapY: 105,
    dependsOnNodeIds: [],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-01 (Fasteners, Screws & Parker O-Ring Architect)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Verified starter #01 Red Pellet Pen with 4 metric screw specs (M14×1.0, M4×0.7 L-slot stud, M3×0.5 grub, M12×1.0 fill plug) & 4 Viton/PU O-rings.',
    smartGoals: [
      'Audit all 4 metric threads & torque values (1.8–11.0 N·m) on #01 Pen Gun',
      'Verify 22.4% Viton FKM-90 face-seal squeeze behind 0.12mm CuNi burst disk',
      'Export 6.35mm (.25 Cal) watertight .STL at ±0.005mm manifold tolerance',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_02_rexp',
    code: 'GD-02',
    title: '#02 Evanix REX-P: #11 Vertical Breech Slide + #32 Coaxial Poppet & Sniper Kit',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_02_REXP',
    mapX: 235,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_01_pen'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-02 (Korean 57-Part Blueprint & Coaxial Valve Boss)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Completed #02 REX-P Pistol & 9-Baffle Sniper Carbine with #15 shoulder screw, #33 bulkhead O-rings, and coaxial 250-Bar poppet dump.',
    smartGoals: [
      'Map #11 Sliding Breech Block dual PU-90A face O-rings (19.5% squeeze)',
      'Verify M28×1.25 rear coaxial air tube thread hoop stress at 250 Bar (SF 3.12×)',
      'Build 1-click Pistol ↔ Sniper Carbine 9-baffle moderator transformation',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_03_defender',
    code: 'GD-03',
    title: '#03 AEA Defender .50: Break-Action Hinge Pin + Twin 220B Cartridge Neck Seals',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_03_DEFENDER',
    mapX: 375,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_02_rexp'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-01 (Fasteners, Screws & Parker O-Ring Architect)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.006,
    deliverableSummary:
      'Verified #03 Defender .50 twin-shell break-action hinge axle (Ø6mmH7 + M4 lock screw), M16×1.0 shell caps, and Viton neck O-rings.',
    smartGoals: [
      'Specify Ø6.00mmH7 17-4PH hinge pin & M5×0.8 top stirrup latch crossbolt',
      'Model dual 14.0×2.0mm Viton FKM-90 cartridge neck seals at 3,200 PSI',
      'Verify alternating upper/lower striker ratchet sequence in Physics Range',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_04_leshiy',
    code: 'GD-04',
    title: '#04 EDgun Leshiy 2 (.30 Real Spec): 350mm Barrel + 179cc (137cc+42cc Plenum) + 8-Rd Mag',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_04_LESHIY',
    mapX: 485,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_03_defender'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-03 (Pneumatic CFD & Semi-Auto Indexer Engineer)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Recreated real EDgun Leshiy 2 to exact spec: 350mm barrel (756mm unfolded / 457mm folded, -299mm), 179cc (137cc+42cc plenum @ 130–240B), 8-rd mag, star ratchet, and red PU-90A puck.',
    smartGoals: [
      'Eliminate folding hinge axial lash via dual M5×18mm 12.9 preload bolts (-299mm fold delta)',
      'Simulate 1.4ms differential pilot-vented Delrin plug valve (EAR) from 42cc R.E.P.R. plenum',
      'Verify 8-round magnetic rotary plate + 8-tooth central star ratchet + lower indexing pawl',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_04b_leaf45',
    code: 'GD-05',
    title: '#05 The Leaf (.45 Cal on Leshiy 2): 165cc Over-Barrel Reserve + 68cc Plenum + 6-Rd .45 Mag',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_04B_THE_LEAF_45',
    mapX: 595,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_04_leshiy'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-03 (Pneumatic CFD & Semi-Auto Indexer Engineer)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Built #05 The Leaf (.45 Cal / 11.43mm) on top of the Leshiy 2 open-breech architecture with 6-rd .45 scalloped rotary drum, 68cc 195B plenum, and 165cc concentric Over-the-Barrel air reserve.',
    smartGoals: [
      'Scale Leshiy 2 open-breech folding frame to .45 Cal (11.43mm) with 6-round scalloped drum',
      'Couple 165cc concentric Over-the-Barrel air reserve jacket around 6-baffle silencer',
      'Verify enlarged 15.5×2.5mm red PU-90A breech face seal puck at 195 Bar regulated plenum',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_05_mp30',
    code: 'GD-06',
    title: '#06 Evanix MP30 (.30 Tactical SMG): Dual 300cc Cylinders, Side-Lever & Folding Stock',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_05_MP30',
    mapX: 705,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_04b_leaf45'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-02 (Korean Evanix Blueprint & Coaxial Valve Boss)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Reverse-engineered authentic Korean Evanix MP30 .30 Cal SMG: dual stacked 300cc 250-Bar cylinders, monolithic CNC receiver, biathlon side-lever probe, 9-rd rotary mag, and folding M4 stock.',
    smartGoals: [
      'Detail 5.5×1.5mm PU-90A .30 cal reciprocating bolt probe O-ring & dual-cylinder bridge',
      'Calibrate 250B → 165B Belleville regulator piston O-ring squeeze for 300cc twin tubes',
      'Generate printable PA12-CF folding M4 stock & monolithic receiver .STL',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_06_p50',
    code: 'GD-07',
    title: '#07 P50 (.50 Cal P90 Auto): 4 Air Reserves (Mag/Barrel/Buttstock/Foregrip) + Bipod + Laser',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_06_P50',
    mapX: 815,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_05_mp30'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-03 (Pneumatic CFD & Semi-Auto Indexer Engineer)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Engineered .50 Cal P90-style automatic P50 with 4 interconnected 250B reserves (145cc Mag, 160cc Barrel, 280cc Buttstock, 120cc Foregrip = 705cc), folding bipod, and coaxial laser.',
    smartGoals: [
      'Plumb 4 air reserves (Mag 145cc, Barrel 160cc, Buttstock 280cc, Foregrip 120cc) into 200B plenum',
      'Seal 90° .50 Cal helical turret at 200 Bar using dual pneumatic-clamping PU-95A collars',
      'Integrate folding twin-leg tactical bipod and coaxial 650nm/520nm laser sight on front shroud',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_gd_07_ascent45',
    code: 'GD-08',
    title: '#08 Custom .45 Ascent 300B: 3-Stage Under-Barrel Pump + 140cc Over-Barrel Plenum',
    department: 'GAME_DEVELOPMENT',
    linkedGunId: 'GUN_07_ASCENT45',
    mapX: 930,
    mapY: 105,
    dependsOnNodeIds: ['node_gd_06_p50'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'GD-Agent-04 (300-Bar Pump, Over-Barrel Plenum & .STL CI Boss)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Completed custom 12-part .45 Ascent with contiguous CNC upper/lower receiver bridge, Ø5.6mm Stage-3 300-Bar pump, 240cc under-barrel reserve, 140cc 210B over-barrel plenum, and 6-baffle silencer.',
    smartGoals: [
      'Verify 300-Bar 1-way check valve lockup and 210-Bar Belleville regulator bridge',
      'Ensure 140cc Over-Barrel Plenum delivers 2.6 regulated .45 shots (286.6 J) with zero floating CAD gaps',
      'Export all 12 sub-mm .STL components with M36×1.5 & M28×1.25 helical threads',
    ],
    accomplishedGoalCount: 3,
  },

  // Row 2: Marketing, Community & Merch Department Track (Connected to Game Dev Nodes)
  {
    nodeId: 'node_mm_01_pen_defender_drop',
    code: 'MM-01',
    title: 'Starter Merch Drop: 1:1 Transparent Acrylic Pen Gun & Brass Burst-Disk Keychain',
    department: 'MARKETING_AND_MERCH',
    linkedGunId: 'GUN_01_PEN',
    mapX: 165,
    mapY: 295,
    dependsOnNodeIds: ['node_gd_01_pen', 'node_gd_03_defender'],
    status: 'COMPLETED',
    completionPct: 100,
    assignedAgentName: 'MM-Agent-01 (Collector Cutaway Merch & CAD Poster Director)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Launched CNC C36000 Brass Burst-Disk Fitting Keychain ($29, 74% margin) and 1:1 Clear Acrylic Red Pen Cutaway Display Model ($89).',
    smartGoals: [
      'Generate laser-etched ISO screw & O-ring callout plaque for 1:1 Pen Cutaway',
      'Package 5-pack collector laser-scored copper burst disk display coins',
      'Achieve >70% gross margin on Starter Merch Bundle with supplier quote sign-off',
    ],
    accomplishedGoalCount: 3,
  },
  {
    nodeId: 'node_mm_02_blueprint_mats',
    code: 'MM-02',
    title: '7-Weapon Technical Blueprint Desk Mats (900×400mm Stitched Neoprene)',
    department: 'MARKETING_AND_MERCH',
    linkedGunId: 'GUN_02_REXP',
    mapX: 445,
    mapY: 295,
    dependsOnNodeIds: ['node_gd_02_rexp', 'node_gd_04_leshiy', 'node_mm_01_pen_defender_drop'],
    status: 'COMPLETED',
    completionPct: 96,
    assignedAgentName: 'MM-Agent-01 (Collector Cutaway Merch & CAD Poster Director)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Rendered high-DPI vector CAD desk mats showing all 7 weapons (#01 Pen → #07 Ascent .45) with full metric screw & Parker O-ring tables ($39 retail).',
    smartGoals: [
      'Print 300-DPI vector cross-sections with exact screw torque & O-ring squeeze tables',
      'Bundle QR code on each desk mat unlocking the matching in-game .STL pack',
      'Route bulk print quote ($4,200) through Hermes #approvals HITL gate',
    ],
    accomplishedGoalCount: 2,
  },
  {
    nodeId: 'node_mm_03_physics_trailer',
    code: 'MM-03',
    title: 'Viral 5-Step 300-Bar Airflow & Ballistic Gel Slow-Mo Devlog Campaign',
    department: 'MARKETING_AND_MERCH',
    linkedGunId: 'GUN_06_P50',
    mapX: 695,
    mapY: 295,
    dependsOnNodeIds: ['node_gd_05_mp30', 'node_gd_06_p50', 'node_mm_02_blueprint_mats'],
    status: 'IN_PROGRESS',
    completionPct: 90,
    assignedAgentName: 'MM-Agent-02 (Viral Physics Trailer, Devlog & Community Growth Boss)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.006,
    deliverableSummary:
      'Published side-by-side 3D Physics Range + 5-Step Air Compression cutaway showcase comparing P50 Helical Breech vs. .45 Ascent 300B.',
    smartGoals: [
      'Capture 60fps centered 3D weapon manipulation & X-ray airflow in Physics Range',
      'Publish interactive WebGL blueprint comparator demo for airgun engineering creators',
      'Convert >18% of devlog viewers to wishlist & starter merch store leads',
    ],
    accomplishedGoalCount: 2,
  },
  {
    nodeId: 'node_mm_04_ascent_flagship_kit',
    code: 'MM-04',
    title: 'Flagship Collector Edition: 1:2 Scale .45 Ascent 300B Working Cutaway Rig',
    department: 'MARKETING_AND_MERCH',
    linkedGunId: 'GUN_07_ASCENT45',
    mapX: 915,
    mapY: 295,
    dependsOnNodeIds: ['node_gd_07_ascent45', 'node_mm_03_physics_trailer'],
    status: 'IN_PROGRESS',
    completionPct: 94,
    assignedAgentName: 'MM-Agent-03 (Hermes Lead Qualification, Pricing & Merch Fulfillment)',
    screwsAndOringsAudited: true,
    stlToleranceMm: 0.005,
    deliverableSummary:
      'Designed 1:2 scale desktop cutaway of the #07 .45 Ascent with transparent polycarbonate Over-Barrel Plenum, LED pressure zones, and working 3-stage pump linkage ($179).',
    smartGoals: [
      'Include color-coded Viton/PU O-rings and real stainless M3/M4 socket head screws',
      'Sync LED strip colors with the 5-step intake/300B/210B/fire cutaway cycle',
      'Auto-qualify B2B/creator wholesale inquiries (Fit Score ≥ 75) via Front_Desk_Agent',
    ],
    accomplishedGoalCount: 2,
  },
];

export const INITIAL_MERCH_CATALOG: MerchAndMarketingItemSpec[] = [
  {
    itemId: 'merch_01_pen_cutaway',
    skuCode: 'BAR-MERCH-01',
    title: '1:1 Clear Acrylic #01 Red Pellet Pen Cutaway + 5× Scored CuNi Burst Disks',
    category: '1_TO_1_CUTAWAY_MODEL',
    linkedGunId: 'GUN_01_PEN',
    unitCostUsd: 21.5,
    retailPriceUsd: 89.0,
    grossMarginPct: 75.8,
    status: 'LIVE_IN_STORE',
    assignedMarketingAgent: 'MM-Agent-01 (Collector Cutaway Merch Director)',
    specSummary:
      'CNC-machined clear PMMA receiver sleeve showing the L-slot tungsten striker, M14×1.0 barrel thread, Parker 2-012 Viton face O-ring, and real 0.12mm laser-scored CuNi foil.',
  },
  {
    itemId: 'merch_02_blueprint_mat_7guns',
    skuCode: 'BAR-MERCH-02',
    title: 'Master 7-Gun Pneumatic CAD Blueprint Desk Mat (900×400×4mm)',
    category: 'BLUEPRINT_DESK_MAT',
    linkedGunId: 'GUN_02_REXP',
    unitCostUsd: 8.4,
    retailPriceUsd: 39.0,
    grossMarginPct: 78.5,
    status: 'LIVE_IN_STORE',
    assignedMarketingAgent: 'MM-Agent-01 (Collector Cutaway Merch Director)',
    specSummary:
      'Features all 7 canonical weapons (#01 Pen → #02 REX-P → #03 Defender → #04 Leshiy → #05 MP30 → #06 P50 → #07 .45 Ascent) with metric screw torque tables and O-ring gland charts.',
  },
  {
    itemId: 'merch_03_defender_shell_keychain',
    skuCode: 'BAR-MERCH-03',
    title: 'Anodized Red #03 Defender .50 Burst-Disk Shell Keychain (Unthreads to Inspect O-Rings)',
    category: 'CNC_BRASS_KEYCHAIN',
    linkedGunId: 'GUN_03_DEFENDER',
    unitCostUsd: 6.8,
    retailPriceUsd: 29.0,
    grossMarginPct: 76.6,
    status: 'LIVE_IN_STORE',
    assignedMarketingAgent: 'MM-Agent-03 (Hermes Fulfillment & Pricing)',
    specSummary:
      '1:1 CNC 7075-T6 red anodized cartridge shell with working M16×1.0 stainless base retainer, Viton FKM-90 neck O-rings, and Inert .50 Delrin sabot slug.',
  },
  {
    itemId: 'merch_04_ascent_45_desktop_rig',
    skuCode: 'BAR-MERCH-04',
    title: '1:2 Scale #07 .45 Ascent 300B Working Pump & Over-Barrel Plenum Cutaway Rig',
    category: '1_TO_1_CUTAWAY_MODEL',
    linkedGunId: 'GUN_07_ASCENT45',
    unitCostUsd: 46.0,
    retailPriceUsd: 179.0,
    grossMarginPct: 74.3,
    status: 'PROTOTYPE_READY',
    assignedMarketingAgent: 'MM-Agent-02 (Viral Physics Trailer & Devlog Boss)',
    specSummary:
      'Interactive desk model with working 3-stage under-barrel hand pump linkage, spring check valve, transparent 140cc over-barrel plenum, and 6-baffle QuietEnergy moderator.',
  },
];

const ROADMAP_STORAGE_KEY = 'bar250_persistent_roadmap_nodes_v2';

export function loadPersistentRoadmapNodes(): PersistentRoadmapMapNode[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ROADMAP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistentRoadmapMapNode[];
        if (Array.isArray(parsed) && parsed.length === INITIAL_PERSISTENT_ROADMAP_NODES.length) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
  return INITIAL_PERSISTENT_ROADMAP_NODES;
}

export function savePersistentRoadmapNodes(nodes: PersistentRoadmapMapNode[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(nodes));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Executes a Divide & Conquer multi-agent pass across all 7 canonical weapons and both departments
 * (Game Development + Marketing & Merch), advancing node completion, tightening .STL tolerances,
 * and persisting the updated roadmap state.
 */
export function runDivideAndConquerRoadmapPass(
  currentNodes: PersistentRoadmapMapNode[],
  targetDepartment?: StudioDepartmentId | 'ALL'
): {
  nextNodes: PersistentRoadmapMapNode[];
  summaryBanner: string;
} {
  const nextNodes = currentNodes.map((node) => {
    if (targetDepartment && targetDepartment !== 'ALL' && node.department !== targetDepartment) {
      return node;
    }
    const nextPct = Math.min(100, node.completionPct + 6);
    const nextTol = Math.max(0.002, Number((node.stlToleranceMm - 0.0005).toFixed(4)));
    return {
      ...node,
      completionPct: nextPct,
      status: nextPct >= 100 ? ('COMPLETED' as const) : ('IN_PROGRESS' as const),
      screwsAndOringsAudited: true,
      stlToleranceMm: nextTol,
      accomplishedGoalCount: (nextPct >= 100 ? 3 : 2) as 2 | 3,
    };
  });

  savePersistentRoadmapNodes(nextNodes);

  const completedCount = nextNodes.filter((n) => n.status === 'COMPLETED').length;
  return {
    nextNodes,
    summaryBanner: `Divide & Conquer Complete: Game Dev + Marketing/Merch Agents audited all 7 weapons (${completedCount}/${nextNodes.length} Roadmap Nodes at 100% · Screw & O-Ring Tables Verified)`,
  };
}

export interface Leshiy2AirflowSimCheckSpec {
  checkId: string;
  stageNumber: number;
  title: string;
  partCodesInvolved: string[];
  pressureBar: number;
  gasVelocityMs: number;
  machNumber: number;
  reynoldsNumber: string;
  targetThreshold: string;
  measuredValue: string;
  status: 'PASSED_FACTORY_SPEC';
  engineeringExplanation: string;
}

export const LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS: Leshiy2AirflowSimCheckSpec[] = [
  {
    checkId: 'L2-CHK-01',
    stageNumber: 1,
    title: 'Stage 1: 300-Bar Lower Tube Containment & R.E.P.R. 16-Disc Belleville Equilibrium',
    partCodesInvolved: ['LSH-12', 'LSH-11', 'LSH-OR-04', 'LSH-OR-05'],
    pressureBar: 300,
    gasVelocityMs: 18.4,
    machNumber: 0.05,
    reynoldsNumber: 'Re = 4.2 × 10⁴',
    targetThreshold: '130.0 Bar ± 0.8 Bar Setpoint (SF ≥ 2.75)',
    measuredValue: '130.0 Bar (±0.42 Bar) · Lamé SF = 2.85',
    status: 'PASSED_FACTORY_SPEC',
    engineeringExplanation:
      'Lower 137cc 7075-T651 tube stores 300 Bar safely and feeds the inline R.E.P.R. 16× DIN 2093 Belleville stack, charging the 42cc upper plenum to 130 Bar in 38ms.',
  },
  {
    checkId: 'L2-CHK-02',
    stageNumber: 2,
    title: 'Stage 2: Hammerless Forward-Plug Balanced Spool (EAR) Differential Lock & Pilot Vent',
    partCodesInvolved: ['LSH-09', 'LSH-10', 'LSH-OR-02', 'LSH-SCR-06'],
    pressureBar: 130,
    gasVelocityMs: 0.0,
    machNumber: 0.0,
    reynoldsNumber: 'Re = 0 (Static Balance) → 2.8 × 10⁵ (Pilot Bleed)',
    targetThreshold: '0.00 m/s Leak · Opening Time ≤ 1.50 ms',
    measuredValue: '0.00 m/s Leak · 1.40 ms Spool Snap (3.20mm Lift)',
    status: 'PASSED_FACTORY_SPEC',
    engineeringExplanation:
      'With zero hammer or striker spring, pulling the 2-stage trigger vents the 0.35cc rear pilot chamber, unbalancing the Ketron PEEK-1000 forward spool so it snaps open 3.20mm in 1.40ms.',
  },
  {
    checkId: 'L2-CHK-03',
    stageNumber: 3,
    title: 'Stage 3: Choked Mach 1.0 Transfer Port & Red PU-90A Dynamic Face-Seal Puck',
    partCodesInvolved: ['LSH-08', 'LSH-05', 'LSH-OR-01', 'LSH-SCR-01'],
    pressureBar: 126,
    gasVelocityMs: 343.0,
    machNumber: 1.0,
    reynoldsNumber: 'Re = 1.92 × 10⁶ (Sonic Choked Throat)',
    targetThreshold: 'Face-Seal Blow-By = 0.0% at 130–240 Bar',
    measuredValue: '0.18mm Axial Puck Energization · 0.0% Blow-By',
    status: 'PASSED_FACTORY_SPEC',
    engineeringExplanation:
      'The 130-Bar pulse pressurizes the rear groove of the Red PU-90A puck (LSH-08), driving its lip 0.18mm forward against the 8-round rotary drum (LSH-05) with zero gas loss across the folding hinge.',
  },
  {
    checkId: 'L2-CHK-04',
    stageNumber: 4,
    title: 'Stage 4: 350mm Alfa Precision Polygonal Barrel Adiabatic Expansion (.30 Cal)',
    partCodesInvolved: ['LSH-03', 'LSH-04', 'LSH-OR-03', 'LSH-SCR-03'],
    pressureBar: 94,
    gasVelocityMs: 268.0,
    machNumber: 0.78,
    reynoldsNumber: 'Re = 1.45 × 10⁶',
    targetThreshold: '268 m/s (112.0 J) w/ 44.75gr JSB Exact .30',
    measuredValue: '268.4 m/s · 112.3 Joules · ES = 2.1 m/s',
    status: 'PASSED_FACTORY_SPEC',
    engineeringExplanation:
      '42cc of 130-Bar gas accelerates the 44.75-grain .30 Cal pellet directly out of the scalloped magnetic chamber down the 350mm Alfa polygonal bore with zero bolt probe obstruction.',
  },
  {
    checkId: 'L2-CHK-05',
    stageNumber: 5,
    title: 'Stage 5: 1.8cc Bleed-Jet Indexing Pawl vs 8-Tooth 17-4PH Star Ratchet Torque',
    partCodesInvolved: ['LSH-06', 'LSH-07', 'LSH-OR-06', 'LSH-SCR-04'],
    pressureBar: 48,
    gasVelocityMs: 142.0,
    machNumber: 0.41,
    reynoldsNumber: 'Re = 3.1 × 10⁵',
    targetThreshold: '45.0° Drum Index in ≤ 16.0 ms (N52 Magnet Detent Lock)',
    measuredValue: '45.0° Exact Index in 14.0 ms (2.8× Torque Margin)',
    status: 'PASSED_FACTORY_SPEC',
    engineeringExplanation:
      'A calibrated 1.8cc bleed port taps post-valve gas into plunger LSH-07, driving the A2 tool-steel pawl against the 8-tooth star ratchet (LSH-06) to index the next .30 round in 14ms.',
  },
  {
    checkId: 'L2-CHK-06',
    stageNumber: 6,
    title: 'Stage 6: Valkyrie Tishina 200 6-Baffle Reflex Stripping & Carbon Handguard Thermal Check',
    partCodesInvolved: ['LSH-01', 'LSH-02', 'LSH-SCR-02'],
    pressureBar: 14,
    gasVelocityMs: 64.0,
    machNumber: 0.19,
    reynoldsNumber: 'Re = 8.4 × 10⁴ (Turbulent Baffle Eddy)',
    targetThreshold: 'Acoustic Report ≤ 100.0 dB · ΔT Handguard ≤ 4°C',
    measuredValue: '98.4 dB (-31.4 dB Reduction) · ΔT = +1.8°C',
    status: 'PASSED_FACTORY_SPEC',
    engineeringExplanation:
      'Six eccentric K-baffles inside the Tishina moderator (LSH-02) strip and cool muzzle gas inside the octagonal Valkyrie 3K carbon handguard (LSH-01).',
  },
];

export type P50ExtremeEnvironmentId =
  | 'SPACE_VACUUM_0BAR'
  | 'SAHARA_QUARTZ_SAND_IP69K'
  | 'ABYSSAL_UNDERWATER_30M_4BAR';

export interface P50ExtremeEnvironmentSpec {
  id: P50ExtremeEnvironmentId;
  label: string;
  shortBadge: string;
  ambientPressureBar: number;
  temperatureRangeC: string;
  externalMedium: string;
  sealingAndCyclingAdaptation: string;
  muzzleVelocityMs: number;
  muzzleEnergyJoules: number;
}

export const P50_EXTREME_ENVIRONMENTS: P50ExtremeEnvironmentSpec[] = [
  {
    id: 'SPACE_VACUUM_0BAR',
    label: 'Hard Space Vacuum (10⁻⁹ Torr · Orbital Zero-G)',
    shortBadge: '🛰️ Space (0 Bar · Zero-G)',
    ambientPressureBar: 0.0,
    temperatureRangeC: '-150°C to +120°C',
    externalMedium: 'Hard Vacuum (Zero Oxygen / Zero Gravity)',
    sealingAndCyclingAdaptation:
      'Requires zero atmospheric oxygen (self-contained 250B HPA/N₂ in 4 reserves). Nitinol constant-force spring + pneumatic follower feeds slugs in 0-G without gravity; WS₂ dry-film disulfide lubricant & FFKM perfluoroelastomer collars prevent vacuum outgassing or cold-welding.',
    muzzleVelocityMs: 312,
    muzzleEnergyJoules: 348,
  },
  {
    id: 'SAHARA_QUARTZ_SAND_IP69K',
    label: 'Blowing Quartz Sand & Dust Storm (MIL-STD-810H / IP69K)',
    shortBadge: '🏜️ Sandstorm (IP69K)',
    ambientPressureBar: 1.01,
    temperatureRangeC: '+58°C Abrasive Silica Dust',
    externalMedium: '140 μm Quartz Sand @ 28 m/s Wind',
    sealingAndCyclingAdaptation:
      'Top polycarbonate magazine spine and 90° turret are 100% hermetically enclosed. During Phase 4 bolt advance, a 3-Bar positive-pressure micro-bleed purges the breech chute outward while bronze/PTFE scraper rings wipe the hollow probe clean.',
    muzzleVelocityMs: 298,
    muzzleEnergyJoules: 318,
  },
  {
    id: 'ABYSSAL_UNDERWATER_30M_4BAR',
    label: '30m Maritime Underwater Operations (4.0 Bar Hydrostatic)',
    shortBadge: '🌊 Underwater (30m · 4 Bar)',
    ambientPressureBar: 4.0,
    temperatureRangeC: '+2°C Saline Seawater',
    externalMedium: '1,025 kg/m³ Seawater @ 4.0 Bar',
    sealingAndCyclingAdaptation:
      '200-Bar plenum overcomes 4-Bar seawater backpressure with a 50:1 pressure ratio. Phase 5 Dual PU-95A collars seal seawater out of the breech, while the flat-meplat .50 sabot tip + 200-Bar muzzle gas jet form a supercavitating vapor tunnel underwater.',
    muzzleVelocityMs: 264,
    muzzleEnergyJoules: 250,
  },
];

export interface P50Hermetic6PhaseStageSpec {
  phaseIndex: number; // 0..5
  phaseCode: string;
  shortTitle: string;
  mechanicalAction: string;
  spaceSandUnderwaterFeature: string;
  durationMs: number;
  breechPressureBar: number;
}

export const P50_HERMETIC_6PHASE_CYCLE_STAGES: P50Hermetic6PhaseStageSpec[] = [
  {
    phaseIndex: 0,
    phaseCode: 'P50-PH1-EMPTY',
    shortTitle: '1. Mag Empty & Feed',
    mechanicalAction:
      'Slugs in the top horizontal spine empty front-to-rear as the Nitinol constant-force spring + 5-Bar pneumatic follower pushes the transverse .50 Cal stack toward the rear turret.',
    spaceSandUnderwaterFeature:
      'Zero-G positive spring/pneumatic feed works upside-down in orbital microgravity or submerged at any pitch angle.',
    durationMs: 18,
    breechPressureBar: 5,
  },
  {
    phaseIndex: 1,
    phaseCode: 'P50-PH2-ROTATE90',
    shortTitle: '2. Rotate 90° Helical',
    mechanicalAction:
      'The rear 90° spiral cam ramp rotates the incoming .50 Cal (12.7mm) sabot slug from transverse (90° sideways) to axial (0° aligned with the barrel bore).',
    spaceSandUnderwaterFeature:
      'WS₂ dry-film coated Ti-6Al-4V helical tracks operate without wet oil that would freeze in space or trap desert sand.',
    durationMs: 22,
    breechPressureBar: 5,
  },
  {
    phaseIndex: 2,
    phaseCode: 'P50-PH3-PUSHDOWN',
    shortTitle: '3. Push Down (-34mm)',
    mechanicalAction:
      'The cam-driven elevator finger pushes the rotated .50 Cal round vertically downward (-34mm Y-drop) from the upper turret into the coaxial breech saddle.',
    spaceSandUnderwaterFeature:
      'Mechanical cam finger positively drives the cartridge downward without relying on gravity.',
    durationMs: 16,
    breechPressureBar: 5,
  },
  {
    phaseIndex: 3,
    phaseCode: 'P50-PH4-CYCLE',
    shortTitle: '4. Cycle Bolt & Purge',
    mechanicalAction:
      'The reciprocating hollow-probe 316L bolt cycles forward 38mm, seating the .50 Cal sabot into the rifled leade while venting a 3-Bar positive-pressure wiper puff.',
    spaceSandUnderwaterFeature:
      'Bronze/PTFE scraper ring + 3-Bar outward purge expels any quartz sand grains or seawater droplets from the chamber.',
    durationMs: 24,
    breechPressureBar: 12,
  },
  {
    phaseIndex: 4,
    phaseCode: 'P50-PH5-SEAL',
    shortTitle: '5. Hermetic Collar Seal',
    mechanicalAction:
      '200-Bar pilot pressure inflates the Dual Opposed FFKM / PU-95A Breech Collars radially by 1.20mm, locking the chamber into a 300-Bar-rated hermetic pressure vessel.',
    spaceSandUnderwaterFeature:
      'Zero leak in 10⁻⁹ Torr space vacuum and 100% water/sand exclusion up to 40 Bar external pressure.',
    durationMs: 8,
    breechPressureBar: 200,
  },
  {
    phaseIndex: 5,
    phaseCode: 'P50-PH6-FIRE',
    shortTitle: '6. Fire 318J & Repeat',
    mechanicalAction:
      'Hammerless spool valve dumps 200-Bar gas from all 4 Reserves (705cc total) through the hollow bolt probe, launching the .50 slug at 318 J and cycling the blowback bolt to repeat Phase 1!',
    spaceSandUnderwaterFeature:
      'Fires with zero oxygen in space and creates a supercavitating gas envelope for underwater ballistic stability.',
    durationMs: 14,
    breechPressureBar: 200,
  },
];

// ============================================================================
// VERSION-PROGRESSIVE BLUEPRINT ACCURACY ENGINE & MULTI-AGENT REVIEW REPORTS
// Each time a new version of the game is run (`versionNumber` increments),
// every weapon's blueprint tightens sub-millimeter tolerances, increases CAD
// mesh/facet density, and logs verified multi-agent reverse-engineering upgrades.
// ============================================================================
export interface VersionEvolvedBlueprintTelemetry {
  versionNumber: number;
  evolvedRevisionTag: string;
  dimensionalAccuracyPct: string;
  machiningToleranceMm: string;
  cadMeshFacetCount: number;
  cfdConvergenceResidual: string;
  verifiedSealLeakRateCcMin: string;
  versionUpgradeHighlight: string;
}

export function computeVersionEvolvedBlueprintAccuracy(
  gun: CanonicalWeaponBlueprintSpec,
  versionNumber: number
): VersionEvolvedBlueprintTelemetry {
  const v = Math.max(1, Math.floor(versionNumber || 1));
  const baseAccuracy = 98.2 + Math.min(1.79, (v - 1) * 0.28 + gun.tierOrder * 0.04);
  const toleranceMm = Math.max(0.0008, 0.0085 * Math.pow(0.82, v - 1));
  const baseFacets =
    18400 +
    gun.uniqueParts.length * 3200 +
    gun.screwsAndFasteners.length * 1450 +
    gun.oringPlacements.length * 1100 +
    (v - 1) * 6400;
  const residualExp = Math.min(9, 4 + Math.floor(v / 2));

  const perGunHighlights: Record<CanonicalGunProgressionId, string[]> = {
    GUN_01_PEN: [
      'v1: Standardized Ø18.0×68mm SHELL-50-220B coaxial chamber & 12.70mm (.50 Cal) liner.',
      'v2+: Added M16×1.0 6-petal CuNi burst-disk container in both 335gr Hollow-Point Slug & 8-Pellet #000 Buckshot + M18×1.0 coupler threads & Titanium Torx clip.',
      'v3+: Sub-micron FKM-90 neck squeeze calibration & zero-whip 3-baffle micro-moderator.',
    ],
    GUN_02_REXP: [
      'v1: Rebuilt Korean 57-part 5-hole underlever trigger group (#14–#20) & coaxial PEEK poppet (#32).',
      'v2+: Added luminous 250B Wika manometer needle dial (#40), knurled rotary dust collar (#41), and spring-loaded breech ball detent (#58/#59).',
      'v3+: Harmonic-tuned Sniper Carbine 8-baffle reflex shroud & zero-creep A2 sear hook.',
    ],
    GUN_03_DEFENDER: [
      'v1: Twin Over-Under 12.70mm (.50 Cal) break-action block sharing SHELL-50-220B with Pen Gun.',
      'v2+: Generated Dual Over-Under Alternating Striker Hammers (DEF-HAMMER-01/02), 180° Ratchet Selector Cam (DEF-RATCHET-03), 440C Needles, Top Stirrup Latch, and Slug/Buckshot/Arrow burst containers.',
      'v3+: Synchronized twin-extractor star timing & zero-blowby standing breech pin seals.',
    ],
    GUN_04_LESHIY: [
      'v1: Real 350mm Alfa barrel, 179cc (137cc+42cc) R.E.P.R. plenum, and 6-stage EAR valve.',
      'v2+: Added Quarter-Turn Quick-Detach (QD) Dry-Break Self-Sealing Container Couplers (LSH-QD-01/02) for instant container detachment & rapid 180° stock fold.',
      'v3+: External R.E.P.R. micrometer scale ring & dynamic PU-90A breech puck lip profiling.',
    ],
    GUN_04B_THE_LEAF_45: [
      'v1: Concentric 3-layer Over-the-Barrel 220cc reserve + 68cc R.E.P.R. plenum in .45 Cal.',
      'v2+: Added Quick-Detach (QD) Dry-Break rear container couplers, fast 180° folding hinge, and 6-round .45 rotary star ratchet.',
      'v3+: Balanced tri-layer carbon harmonic shroud tensioning.',
    ],
    GUN_05_MP30: [
      'v1: Korean Dual-Cylinder 300cc (2×150cc) 250B SMG with Figure-8 regulator bridge & 9-rd .30 mag.',
      'v2+: Added Self-Sealing M18×1.5 Dry-Break Quick-Detach Cylinder Valves (MP30-QD-01/02), fast 180° folding M4 stock, and interactive Biathlon side-lever cocking.',
      'v3+: 10-chamber K-baffle whisper shroud acoustic stripping (-29.5 dB).',
    ],
    GUN_06_P50: [
      'v1: Hermetic 6-phase Space/Sand/Underwater .50 Cal P90-style bullpup auto.',
      'v2+: Elon-verified closed-loop air bus: P90 Grip Foster Fill -> Vertical Riser -> 160cc Barrel Reserve -> Laminar Bypass past Grip -> 280cc Buttstock + Top Mag Spine Stingers -> 110cc Extended Plenum & accurate 6-phase round loading.',
      'v3+: Nitinol constant-force spine coil & dual FFKM/PU-95A radial chamber lock.',
    ],
    GUN_07_ASCENT45: [
      'v1: 12-Part .45 Cal 300-Bar Onboard-Pump Carbine with Over-Barrel Plenum.',
      'v2+: Rebuilt 6.8:1 Compound 4-Bar Over-Center Pump w/ Sliding Bronze Crosshead & Telescopic Stage-2/3 Rods, Dual-Zone Modular Barrel Reserve/Plenum, Screw-On M18×1.0 Silencer, Sniper Variant, and Live Caliber Swap (.22–.50).',
      'v3+: Adiabatic interstage finned heat exchanger & zero-whip coaxial regulator bulkhead.',
    ],
    GUN_09_PROTECTOR: [
      'v1: Dual M28×1.5 Threaded Barrel-Reserves (2× 110cc @ 250B) with Cock-Open/Load/Cock-Up break action.',
      'v2+: 180° Reverse-Loop Rear Manifold injecting 250-Bar gas into the middle of the barrel bore + Post-Muzzle Break-Apart 8-Pellet Scatter Sabot.',
      'v3+: Precision 3-position fire selector (Barrel 1 / Barrel 2 / Dual Salvo) & Ti-6Al-4V dry-break barrel threads.',
    ],
  };

  const highlights = perGunHighlights[gun.progressionId] || [
    'v1: Baseline CAD Blueprint',
    'v2+: Sub-mm Multi-Agent Tolerance Refinement',
  ];
  const highlightIdx = Math.min(highlights.length - 1, Math.max(0, v - 1));

  return {
    versionNumber: v,
    evolvedRevisionTag: `${gun.versionTag}-REV.${v}.0`,
    dimensionalAccuracyPct: `${baseAccuracy.toFixed(2)}%`,
    machiningToleranceMm: `±${toleranceMm.toFixed(4)} mm`,
    cadMeshFacetCount: baseFacets,
    cfdConvergenceResidual: `1.0 × 10⁻${residualExp}`,
    verifiedSealLeakRateCcMin: '0.000 cc/min (Hermetic)',
    versionUpgradeHighlight: highlights[highlightIdx],
  };
}

export interface AgentGunReviewReport {
  progressionId: CanonicalGunProgressionId;
  weaponTitle: string;
  assignedAgentCallsign: string;
  agentSpecialty: string;
  auditStatus: 'ELON_SIGNED_OFF_100_SPEC';
  toleranceAchieved: string;
  keyFixesAndUpgradesCompleted: string[];
  elonChiefEngineerVerdict: string;
}

export const MULTI_AGENT_GUN_REVIEW_REPORTS: AgentGunReviewReport[] = [
  {
    progressionId: 'GUN_01_PEN',
    weaponTitle: '#01 Mongo (.50 Cal Shared Burst-Disk Shell Launcher)',
    assignedAgentCallsign: 'AGENT-ALPHA (Micro-Pressure Vessels & Burst Foil Metallurgy)',
    agentSpecialty: 'Sub-mm Coaxial Clearances & CuNi 90/10 Sacrificial Discs',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.002 mm Coaxial Bore/Shell Fit',
    keyFixesAndUpgradesCompleted: [
      'Renamed #01 to Mongo and stripped all third-party manufacturer markings across the coaxial receiver and SHELL-50-220B cartridge.',
      'Animated single-round loading/reloading: unthreads M18×1.0 front barrel sleeve, inserts 1× .50 Cal SHELL-50-220B cartridge, and re-threads tight.',
      'Added full functional payload switching between .50 Cal 335gr Hollow-Point Boattail Slug and 8-Pellet #000 Buckshot splitting sabot wad.',
    ],
    elonChiefEngineerVerdict:
      'Same round, compact #01 Mongo coaxial application. Single-round reload animation and 235-Bar 6-petal rupture operate with zero blow-by.',
  },
  {
    progressionId: 'GUN_02_REXP',
    weaponTitle: '#02 REX-P (.30/.45/.50 57-Part Coaxial Pistol & Carbine)',
    assignedAgentCallsign: 'AGENT-BRAVO (Kinematic Linkages & Coaxial Poppet Dynamics)',
    agentSpecialty: '57-Part Blueprint Verification & Single-Round Axial Breech Loading',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.002 mm Sear/Striker Engagement',
    keyFixesAndUpgradesCompleted: [
      'Kept #02 REX-P strictly distinct from #01 Mongo and improved its 3D animation: 5-hole underlever (#14) pivots down 42°, Breech Block (#11) drops to expose the barrel throat, a single slug animates into the breech leade, and the breech snaps shut.',
      'Verified 2-stage match trigger (#16), 68mm transfer bar (#17), A2 sear dog (#18), and coaxial striker (#31).',
      'Added luminous 250-Bar manometer dial face + indicator needle (#40) and knurled rotary Foster dust collar (#41).',
    ],
    elonChiefEngineerVerdict:
      'Every pin, spring, and transfer bar from the 57-part exploded diagram cycles cleanly with full single-round breech loading animation.',
  },
  {
    progressionId: 'GUN_03_DEFENDER',
    weaponTitle: '#03 Double Barrel Defender (Over-Under .50 Cal 2-Shell Break-Action)',
    assignedAgentCallsign: 'AGENT-CHARLIE (Double-Action Ratchet Locks & Over-Under Ballistics)',
    agentSpecialty: 'Alternating Hammer Mechanisms & Shared Cartridge Integration',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.002 mm Over-Under Firing Pin Concentricity',
    keyFixesAndUpgradesCompleted: [
      'Animated single/twin-shell break-open loading & reloading: tilts 42° open, extracts spent shells, slides in fresh shared .50 Cal SHELL-50-220B cartridges, and locks shut.',
      'Generated Dual Over-Under 17-4PH Alternating Striker Hammers (DEF-HAMMER-01/02) with exposed rear cocking spurs and 180° Ratchet Selector Cam (DEF-RATCHET-03).',
      'Integrated shared SHELL-50-220B burst-disk containers supporting .50 Cal 335gr Hollow-Point Slugs, 8-Pellet #000 Buckshot, and Giant 375gr Carbon Arrows.',
    ],
    elonChiefEngineerVerdict:
      'Hammer and ratchet selector index reliably between upper and lower burst-disk containers with full break-open shell loading animation.',
  },
  {
    progressionId: 'GUN_04_LESHIY',
    weaponTitle: '#04 Leshiy 2 (.30 Cal Open-Breech Factory Spec)',
    assignedAgentCallsign: 'AGENT-DELTA (Hammerless Spool Valves & Rapid Folding Architecture)',
    agentSpecialty: '6-Stage EAR/R.E.P.R. CFD & Quick-Detach Pressure Vessels',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.0015 mm Folding Breech Face Alignment',
    keyFixesAndUpgradesCompleted: [
      'Upgraded the 180° left-side folding stock with Quarter-Turn Quick-Detach (QD) Dry-Break Self-Sealing Bayonet Couplers (LSH-QD-01/02) so the 300B rear container detaches and folds rapidly with zero air loss.',
      'Added external R.E.P.R. micrometer pressure scale ring on the upper plenum tube and verified all 6 stages of the 1.4ms EAR forward-plug airflow simulation.',
      'Refined the Red PU-90A dynamic breech face puck and 1.8cc bleed-jet indexing pawl against the 8-tooth 17-4PH star ratchet.',
    ],
    elonChiefEngineerVerdict:
      'Stock folds 180° in a fraction of a second and the pressurized rear container hot-swaps on dry-break bayonets without venting the R.E.P.R. plenum.',
  },
  {
    progressionId: 'GUN_04B_THE_LEAF_45',
    weaponTitle: '#05 The Leaf (.45 Cal Concentric OTB Open-Breech)',
    assignedAgentCallsign: 'AGENT-ECHO (Concentric Tri-Layer Composite Vessels)',
    agentSpecialty: 'Annular Over-Barrel Reserves & .45 Semi-Auto Indexing',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.002 mm Tri-Layer Concentricity',
    keyFixesAndUpgradesCompleted: [
      'Equipped with the same fast 180° folding hinge and Quick-Detach (QD) Dry-Break rear container couplers.',
      'Verified 220cc outer concentric barrel air jacket feeding the 68cc 195-Bar R.E.P.R. plenum for 6-shot .45 Cal semi-auto strings.',
    ],
    elonChiefEngineerVerdict:
      'Concentric tri-layer barrel reserve balances the .45 Cal mass right over the hinge while keeping the rapid fold and QD bottle swap.',
  },
  {
    progressionId: 'GUN_05_MP30',
    weaponTitle: '#06 MP30 (.30 Cal Dual-Cylinder 300cc Tactical SMG)',
    assignedAgentCallsign: 'AGENT-FOXTROT (Dual-Vessel Manifolds & SMG Ergonomics)',
    agentSpecialty: 'Dual-Cylinder PCP Architecture & Non-Overlapping Blueprint Callouts',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.002 mm Figure-8 Tri-Bore Alignment',
    keyFixesAndUpgradesCompleted: [
      'De-overlapped all 12 blueprint callout pins (#1–#12) on the Main Menu and Workbench schematics so pins sit cleanly along perimeter leader tracks without colliding with shroud or container labels.',
      'Added Self-Sealing M18×1.5 Dry-Break Quick-Detach Valves (MP30-QD-01/02) on the upper and lower 150cc cylinders so the 300cc container pack detaches rapidly.',
      'Accelerated the 180° left-side folding M4 buttstock hinge and added interactive Biathlon side-lever cocking.',
    ],
    elonChiefEngineerVerdict:
      'Dual 300cc containers detach cleanly on dry-break valves, blueprint callout pins have zero overlap, and the side-folding stock + biathlon lever cycle smoothly.',
  },
  {
    progressionId: 'GUN_06_P50',
    weaponTitle: '#07 The P50 (.50 Cal Pressurized Mag + Screw-Off Barrel Reserve + Forward Refill Foregrip)',
    assignedAgentCallsign: 'AGENT-OMEGA (ELON DIRECT AUDIT — Pressurized Mag Interlock & Screw-Off Barrel Reserves)',
    agentSpecialty: 'Helical 90° Breech-Alignment Interlocks & Quick-Change Barrel Reserves',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.001 mm Hermetic Turret & Seal Collar Fit',
    keyFixesAndUpgradesCompleted: [
      'Positioned the 145cc 250-Bar magazine air reserve directly behind the staged round with a Mechanical Breech-Alignment Safety Interlock that blocks firing until the round rotates 90°, drops into the breech saddle, and aligns coaxially with the barrel.',
      'Added M32×1.5 Screw-Off Quick-Change Barrel Reserve swapping (.30 Cal 85cc / .50 Cal 160cc / .50 Cal Extended 220cc) so unscrewing and swapping the barrel changes BOTH caliber and stored air volume.',
      'Moved the optional Refill Pump Foregrip further forward along the barrel shroud so it can be pumped to refill both the screw-on barrel reserve and the main buttstock/grip reserves.',
    ],
    elonChiefEngineerVerdict:
      'Personally verified: the pressurized magazine behind-the-round interlock, screw-off caliber/air-volume barrel swap, and forward refill pump foregrip work together seamlessly.',
  },
  {
    progressionId: 'GUN_07_ASCENT45',
    weaponTitle: '#08 Custom .45 Ascent (Compound 4-Bar 300B Pump + Modular Barrel Plenum + Sniper Variant)',
    assignedAgentCallsign: 'AGENT-SIERRA (High-Ratio Compound Linkages & Coaxial Modular Plenums)',
    agentSpecialty: '300-Bar Multi-Stage Hand Pumps, Muzzle Thread Acoustics & Multi-Caliber Scaling',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.0015 mm Stage-3 Plunger & M18×1.0 Thread Runout',
    keyFixesAndUpgradesCompleted: [
      'Rebuilt the onboard 300-Bar hand pump with a 6.8:1 Compound 4-Bar Over-Center Toggle Linkage, sliding phosphor-bronze linear crosshead collar, finned Stage-3 heat exchanger, and telescopic Stage-2/Stage-3 piston rods.',
      'Redesigned the barrel shroud into a Dual-Zone Modular Coaxial Air Reserve (300B Front) + Internal Belleville Regulator Bulkhead + 210B Rear Firing Plenum.',
      'Made the QuietEnergy 6-Gill Silencer screw on and off exposed M18×1.0 male muzzle threads and added the Sniper Variant + Live Caliber Swap (.22–.50).',
    ],
    elonChiefEngineerVerdict:
      'Compound 4-bar crosshead pump mechanics, dual-zone modular barrel reserve/plenum, screw-on M18×1.0 silencer, sniper variant, and live caliber-reactive barrel + mag are production-ready.',
  },
  {
    progressionId: 'GUN_09_PROTECTOR',
    weaponTitle: '#09 The Protector (.50 Cal Dual Threaded Barrel-Reserve Scatter Gun)',
    assignedAgentCallsign: 'AGENT-VANGUARD (Dual Barrel-Reserve Vessels & Reverse-Loop Center-Bore CFD)',
    agentSpecialty: '180° Reverse-Loop Manifold Dynamics & Post-Muzzle Centrifugal Sabot Scatter',
    auditStatus: 'ELON_SIGNED_OFF_100_SPEC',
    toleranceAchieved: '±0.0015 mm Mid-Bore Injection & M28×1.5 Barrel Thread Fit',
    keyFixesAndUpgradesCompleted: [
      'Engineered two independent M28×1.5 threaded barrels where each barrel’s outer annular jacket is a self-contained 110cc 250-Bar air reserve for 2 separate shots.',
      'Implemented the 5-step mechanical cycle: Cock Open (40° break-action) → Load 2× .50 Scatter Sabots → Cock Up (lock breech) → 3-Position Fire Selector (Barrel 1 / Barrel 2 / Salvo) → Fire.',
      'Built the 180° Reverse-Loop Airflow path: gas exits the rear of the barrel reserve into the back receiver manifold, loops 180° forward, and injects into the middle of the barrel behind the round—which breaks apart and scatters into 8 tungsten flechettes after leaving the muzzle.',
    ],
    elonChiefEngineerVerdict:
      'Dual threaded air-reserve barrels and the 180° rear-to-center-barrel loop deliver devastating post-muzzle flechette scatter with zero cross-barrel pressure bleed.',
  },
];


