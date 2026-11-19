import { DischargeMechanismType } from './popular25Catalog';

export type BaseWeaponFamilyId =
  | 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
  | 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY'
  | 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY'
  | 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY'
  | 'P90_45_TOP_HELICAL_PLENUM_FAMILY'
  | 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY'
  | 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY'
  | 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY';

export type BurstDiskEvolutionStage =
  | 'STAGE_1_BURST_DISK_FITTING'
  | 'STAGE_2_SIMPLE_RED_AIR_PEN'
  | 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL'
  | 'STAGE_4_CONCEALED_AIRGUN_CANE';

export type RexConfigurationMode =
  | 'REX_P_PISTOL_1SHOT'
  | 'REX_SNIPER_CARBINE_MODERATED'
  | 'REX_PRINCESS_DONUT_WATERTIGHT_SLIDING_BARREL';

export type P90AmmoPayloadType =
  | 'SLUG_45_BOATTAIL_220GR'
  | 'SABOT_45_BUCKSHOT_6PELLET'
  | 'SABOT_SLUG_45_BOATTAIL'
  | 'SABOT_BUCKSHOT_45_6PELLET';

export type CompatibilityGroupCode =
  | 'ISOLATED_BURST_CARTRIDGE_SHOTGUN'
  | 'REX_COAXIAL_MONOLITH_THREAD_M28'
  | 'MP30_FIXED_GRIP_SMG_CHASSIS'
  | 'LESHIY_CONCENTRIC_FOLDING_BREECH'
  | 'P90_TOP_BREECH_AND_PLENUM_BUS'
  | 'ONBOARD_3STAGE_PUMP_RECEIVER';

export interface P90HelicalPlenumSubStageSpec {
  stageNumber: 1 | 2 | 3 | 4 | 5 | 6;
  code: string;
  title: string;
  keyDimensionsMm: string;
  mechanicalAndPneumaticFunction: string;
  designFailurePrevented: string;
}

/**
 * Complete 6-Subsystem Redesign of the FN P90 Horizontal Helical Magazine for
 * .45 Cal (11.43mm) Heavy Slugs & Sabot Buckshot, Top-Mounted Integrated Breech,
 * and Self-Sealing Magazine-Reserve-to-Plenum Coupling.
 */
export const P90_45_HELICAL_PLENUM_MAG_SUBSYSTEMS: P90HelicalPlenumSubStageSpec[] = [
  {
    stageNumber: 1,
    code: 'P90-SUB-01',
    title: 'Flanged PTFE/Delrin Carrier Sabot for .45 Slugs & Buckshot (L/D = 2.5:1)',
    keyDimensionsMm: 'Sabot OD: 12.80mm · Bore ID: 11.43mm (.45 Cal) · Length: 32.00mm',
    mechanicalAndPneumaticFunction:
      'Encapsulates either a 220gr .45 boattail lead slug or 6× #1 buckshot pellets inside a rigid, low-friction Delrin/anodized sabot sleeve. Restores the 2.5:1 length-to-diameter ratio required for bind-free transverse double-stacking.',
    designFailurePrevented:
      'Prevents stubby raw lead .45 slugs (L/D 1.7:1) from tipping sideways or galling under follower spring load inside the horizontal feed spine.',
  },
  {
    stageNumber: 2,
    code: 'P90-SUB-02',
    title: 'Smoked Polycarbonate Transverse Double-Stack Spine + Pneumatic Follower Assist',
    keyDimensionsMm: 'Spine Length: 285.00mm · Width: 48.00mm · Capacity: 22 Rds (.45 Cal)',
    mechanicalAndPneumaticFunction:
      'Stacks 22 rounds of .45 slugs/sabots transversely (90° perpendicular to the barrel axis) in two staggered columns with 5/10/15/22 witness markings. Uses a dual-roller constant-force spring assisted by an 8-Bar regulated bleed cushion from the Mag Reserve.',
    designFailurePrevented:
      'Eliminates spring fatigue when pushing heavy 220-grain .45 lead payloads (3x heavier than 5.7x28mm cartridges) horizontally toward the rear turret.',
  },
  {
    stageNumber: 3,
    code: 'P90-SUB-03',
    title: 'Twin-Track 90° Helical Cam Turret (Transverse 0° → 45° → Axial 90°)',
    keyDimensionsMm: 'Turret OD: 54.00mm · Helix Lead Angle: 38.5° · Guide Rollers: 4× Ceramic',
    mechanicalAndPneumaticFunction:
      'As each .45 round enters the circular rear turret, dual helical cam tracks engage the front sabot shoulder and rear rim, smoothly rotating the round 90° through a compound spiral ramp so it exits aligned coaxially with the barrel bore.',
    designFailurePrevented:
      'Replaces the small-bore 5.7mm steep spiral with a wide-radius 38.5° twin-roller cam curve tailored for Ø12.80mm .45 sabot shells.',
  },
  {
    stageNumber: 4,
    code: 'P90-SUB-04',
    title: 'Top-Mount Drop-In Breech Turret Saddle (Zero Bolt-Stripping Required)',
    keyDimensionsMm: 'Breech Pocket Depth: 18.50mm · Radial Alignment Tolerance: ±0.015mm',
    mechanicalAndPneumaticFunction:
      'The bottom half of the circular P90 turret drops directly into the upper receiver breech block. The rotated 90° .45 round sits directly on the barrel axis between the Rear Poppet/Plug Valve and the Front .45 Rifled Barrel Throat.',
    designFailurePrevented:
      'Eliminates reciprocating bolt probes that crush soft lead pellet skirts or jam multi-pellet buckshot wads during chambering.',
  },
  {
    stageNumber: 5,
    code: 'P90-SUB-05',
    title: 'Dual Floating PU95A Concentric Breech Seal Collars + Geneva Star Indexer',
    keyDimensionsMm: 'Front/Rear Seal ID: 11.50mm · Actuation Time: 1.4ms @ 200 Bar',
    mechanicalAndPneumaticFunction:
      'Upon trigger sear release, high-pressure plenum gas expands the rear polyurethane 95A transfer sleeve forward by 1.2mm to clamp the turret chamber hermetically before dumping the air blast straight through the .45 sabot into the barrel.',
    designFailurePrevented:
      'Prevents high-pressure breech blow-by into the horizontal polycarbonate magazine spine during 200+ Bar .45 caliber discharge.',
  },
  {
    stageNumber: 6,
    code: 'P90-SUB-06',
    title: 'Integrated 145cc 250-Bar Magazine Spine Air Reserve + Dry-Break Plenum Stinger',
    keyDimensionsMm: 'Mag Reserve Volume: 145 cc @ 250 Bar · Stinger Port: Coaxial ISO-B / M14x1.25',
    mechanicalAndPneumaticFunction:
      'A high-pressure carbon/7075 air tube runs along the base of the P90 magazine spine and connects via a vertical Dry-Break Coaxial Check Stinger right below the rear turret directly into the rifle’s Lower Regulated Plenum.',
    designFailurePrevented:
      'Solves .45 big-bore air starvation: slapping on a fresh top P90 magazine simultaneously reloads 22 .45 slugs/sabots AND replenishes 145cc of 250-Bar HPA into the plenum.',
  },
];

export interface BurstDiskComponentSubSpec {
  id: string;
  label: string;
  schematicCallout: 'fitting body' | 'burst disk' | 'retainer' | 'fluid system';
  materialSpec: string;
  outerDiameterMm: number;
  innerBoreMm: number;
  lengthMm: number;
  ruptureOrRatedBar: number;
  subComponentFunction: string;
}

/**
 * Exact 4-Part Sub-Component Engineering Spec of the Burst Disk Assembly
 * from the user's schematic `/assets/aistudio/image_59e3a409.png`.
 */
export const BURST_DISK_FITTING_SUBCOMPONENTS: BurstDiskComponentSubSpec[] = [
  {
    id: 'bd_sub_01_fitting_body',
    label: 'High-Pressure Stepped Fitting Body',
    schematicCallout: 'fitting body',
    materialSpec: '316L Stainless Steel / 7075-T6 Hex-Stepped Body',
    outerDiameterMm: 15.8,
    innerBoreMm: 7.2,
    lengthMm: 28.5,
    ruptureOrRatedBar: 310,
    subComponentFunction:
      'Houses the upstream high-pressure fluid column and precision 30° conical seat for the sacrificial burst disk.',
  },
  {
    id: 'bd_sub_02_burst_disk',
    label: 'Calibrated Sacrificial Burst Disk Membrane',
    schematicCallout: 'burst disk',
    materialSpec: 'Laser-Scored CuNi / 316L Foil (0.12mm Precision Rupture Dome)',
    outerDiameterMm: 11.4,
    innerBoreMm: 0.0,
    lengthMm: 0.45,
    ruptureOrRatedBar: 220,
    subComponentFunction:
      'Seals the self-contained shotgun/pen cartridge until mechanical striker or over-pressure shears the scored foil in <0.18ms (105% instantaneous dump).',
  },
  {
    id: 'bd_sub_03_retainer',
    label: 'Threaded Retainer Cap with Dual Radial Exhaust Ports',
    schematicCallout: 'retainer',
    materialSpec: '17-4PH Hardened Steel (M12x1.0 Fine Thread + 2× Ø4.2mm Radial Vent Slots)',
    outerDiameterMm: 12.0,
    innerBoreMm: 6.8,
    lengthMm: 16.2,
    ruptureOrRatedBar: 310,
    subComponentFunction:
      'Clamps the burst disk perimeter against the fitting body and channels ruptured gas straight into the barrel throat or dual radial relief ports.',
  },
  {
    id: 'bd_sub_04_fluid_system',
    label: 'High-Pressure Pneumatic / Fluid System Core',
    schematicCallout: 'fluid system',
    materialSpec: '220–250 Bar Dry Nitrogen / HPA Micro-Cartridge Charge',
    outerDiameterMm: 7.2,
    innerBoreMm: 7.2,
    lengthMm: 42.0,
    ruptureOrRatedBar: 250,
    subComponentFunction:
      'Self-contained high-pressure gas column stored behind the burst disk inside the Pen, 2-Shell Shotgun Cartridge, or Airgun Cane.',
  },
];

export interface BurstDiskStageBlueprint {
  stage: BurstDiskEvolutionStage;
  stageNumber: 1 | 2 | 3 | 4;
  title: string;
  shortBadge: string;
  referenceAssetPath: string;
  overallLengthMm: number;
  outerDiameterMm: number;
  shellOrShotCapacity: number;
  capacityLabel: string;
  ammoDescription: string;
  breechOpenKinematics: string;
  xrayInternalLayers: string[];
  strictlyIncompatibleNote: string;
}

export const BURST_DISK_4_STAGE_EVOLUTION: Record<
  BurstDiskEvolutionStage,
  BurstDiskStageBlueprint
> = {
  STAGE_1_BURST_DISK_FITTING: {
    stage: 'STAGE_1_BURST_DISK_FITTING',
    stageNumber: 1,
    title: 'Stage 1: Redesigned High-Flow Burst Disk Fitting Unit',
    shortBadge: '1. Burst Disk Core',
    referenceAssetPath: '/assets/aistudio/image_59e3a409.png',
    overallLengthMm: 52,
    outerDiameterMm: 15.8,
    shellOrShotCapacity: 1,
    capacityLabel: '1 Rupture Core',
    ammoDescription: 'Calibrated 0.12mm Scored Copper/Nickel Burst Disk + Retainer',
    breechOpenKinematics:
      'Unthreads the slotted Retainer cap forward to expose the gold laser-scored Burst Disk foil, stepped Fitting Body seat, and cyan Fluid System pressure column.',
    xrayInternalLayers: [
      'Stepped Fitting Body (Outer Housing)',
      'Calibrated Burst Disk Foil (0.12mm Rupture Dome)',
      'Threaded Retainer with Dual Radial Exhaust Ports',
      'Pressurized Fluid System Core (220 Bar HPA)',
    ],
    strictlyIncompatibleNote:
      'ISOLATED SHOTGUN/PEN FAMILY: Cannot be threaded into regulated PCP rifles (Leshiy, FX, REX-P, MP30). Upgrades strictly into Stage 2 Pen, Stage 3 Twin-Shell Shotgun, or Stage 4 Cane.',
  },
  STAGE_2_SIMPLE_RED_AIR_PEN: {
    stage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
    stageNumber: 2,
    title: 'Stage 2: #01 Mongo Coaxial .50 Shared Shell-50-220B Launcher',
    shortBadge: '2. #01 Mongo (1-Shot .50)',
    referenceAssetPath: '/assets/aistudio/image_02eeaeea.png',
    overallLengthMm: 188,
    outerDiameterMm: 22.0,
    shellOrShotCapacity: 1,
    capacityLabel: '1 Shared .50 Shell',
    ammoDescription:
      'Shared .50 Cal (12.7mm) 220-Bar Pre-Charged SHELL-50-220B Cartridge (335gr HP Slug or 8-Pellet Buckshot)',
    breechOpenKinematics:
      'Unscrews the front coaxial barrel tube from the crimson-anodized knurled Mongo receiver body, retracts the bolt striker knob in the rear L-slot, and inserts 1 shared .50 Cal SHELL-50-220B cartridge.',
    xrayInternalLayers: [
      'Inner Rifled .50 Cal (12.7mm) Barrel Liner',
      'Concentric Bronze Micro-Silencer Shroud (3 Expansion Baffles)',
      'Shared .50 Cal 220-Bar SHELL-50-220B Cartridge at Breech',
      'Crimson-Anodized Knurled Mongo Receiver + Rear Striker Spring',
    ],
    strictlyIncompatibleNote:
      'ISOLATED BURST-CARTRIDGE FAMILY: Self-contained 1-shot tubular #01 Mongo launcher. Incompatible with rifle stocks, rotary drums, and under-barrel hand pumps.',
  },
  STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL: {
    stage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
    stageNumber: 3,
    title: 'Stage 3: #03 Double Barrel Defender Twin-Shell Break-Action Launcher',
    shortBadge: '3. #03 Defender (2-Shell)',
    referenceAssetPath: '/assets/aistudio/image_f3e6f8a1.png',
    overallLengthMm: 245,
    outerDiameterMm: 42.0,
    shellOrShotCapacity: 2,
    capacityLabel: '2 Shared .50 Shells',
    ammoDescription:
      '2× Pre-Charged Shared .50 Cal SHELL-50-220B Cartridges (.50 Slug / 8-Pellet Buckshot / Giant Carbon Arrow)',
    breechOpenKinematics:
      'Pivots the slotted upper twin-barrel housing downward 40° on its front trigger-guard hinge and slides both shared .50 Cal SHELL-50-220B cartridges into the twin over/under chambers.',
    xrayInternalLayers: [
      'Twin Over/Under .50 Cal Barrel Liners (Ø12.7mm)',
      'Slotted Twin-Bore Shroud with Integrated Sound Moderator Baffles',
      '2× Removable Red/Silver Pre-Charged SHELL-50-220B Cartridges',
      'Dual Rear Firing Pins & Break-Action Hinge Latch',
    ],
    strictlyIncompatibleNote:
      'ISOLATED BURST-CARTRIDGE FAMILY: Fires self-contained pre-charged burst-disk shells. Cannot accept regulated PCP rifle plenums or rotary magazines.',
  },
  STAGE_4_CONCEALED_AIRGUN_CANE: {
    stage: 'STAGE_4_CONCEALED_AIRGUN_CANE',
    stageNumber: 4,
    title: 'Stage 4: Concealed Burst-Disk Shotgun Walking Cane',
    shortBadge: '4. Airgun Cane (1-Shell)',
    referenceAssetPath: '/assets/aistudio/images_9a63ee5a.jpeg',
    overallLengthMm: 910,
    outerDiameterMm: 24.0,
    shellOrShotCapacity: 1,
    capacityLabel: '1 Inline Shell',
    ammoDescription: '1× Extended High-Pressure Burst-Disk Cane Cartridge (.50 Buckshot / Slug)',
    breechOpenKinematics:
      'Separates the ergonomic crook handle from the upper shaft coupler to expose the inline pre-charged burst-disk shotgun shell and concentric shrouded cane barrel.',
    xrayInternalLayers: [
      'Full-Length Inner Rifled/Choked Cane Barrel Liner (580mm)',
      'Concentric Full-Shaft Acoustic Silencer Baffle Stack (8 Baffles)',
      'Inline Pre-Charged Burst-Disk Air Cartridge Container',
      'Ergonomic Crook Handle Concealed Trigger & Striker Cam',
    ],
    strictlyIncompatibleNote:
      'ISOLATED SHOTGUN/PEN FAMILY: Terminal evolution of the Burst-Disk Cartridge architecture. Incompatible with external rifle stocks or rotary drums.',
  },
};

export interface WeaponFamilyBlueprint {
  familyId: BaseWeaponFamilyId;
  familyName: string;
  shortTabLabel: string;
  compatibilityGroup: CompatibilityGroupCode;
  compatibilityIndexPct: number; // 0% cross-family for isolated shotgun pen/cane
  actionMechanism:
    | 'SINGLE_SHOT_BURST_CARTRIDGE'
    | 'BREAK_ACTION_TWIN_SHELL'
    | 'SINGLE_SHOT_UNDERLEVER_SLIDE'
    | 'SEMI_AUTO_FIXED_GRIP_SMG'
    | 'SEMI_AUTO_CONCENTRIC_OTB_RIFLE'
    | 'TOP_MOUNT_P90_HELICAL_BREECH_PLENUM';
  defaultCaliberMm: number;
  supportedCalibersMm: number[];
  hasShroudedSilencerBaffles: boolean;
  hasConcentricOverBarrelAirReserve: boolean;
  hasFixedVerticalHandle: boolean;
  architectureSummary: string;
  subComponentsList: string[];
}

export const BASE_WEAPON_FAMILIES: Record<BaseWeaponFamilyId, WeaponFamilyBlueprint> = {
  P90_45_TOP_HELICAL_PLENUM_FAMILY: {
    familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
    familyName: 'P90 .45 Top-Mount Helical-Turret Magazine + Integrated Breech + Mag-Reserve-to-Plenum',
    shortTabLabel: '🌀 P90 .45 Helical Mag + Plenum Reserve',
    compatibilityGroup: 'P90_TOP_BREECH_AND_PLENUM_BUS',
    compatibilityIndexPct: 98,
    actionMechanism: 'TOP_MOUNT_P90_HELICAL_BREECH_PLENUM',
    defaultCaliberMm: 11.43,
    supportedCalibersMm: [5.5, 6.35, 7.62, 9.0, 11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: true,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Top-mounted horizontal FN P90 magazine redesigned for .45 Cal (11.43mm) Boattail Slugs & 6-Pellet Sabot Buckshot: stacks 22 rounds transversely (90°) in a smoked polycarbonate spine, rotates each round 90° through a twin-roller helical cam turret that drops directly into the breech, and couples an onboard 145cc 250-Bar Magazine Air Reserve straight into the Lower Regulated Plenum via a dry-break coaxial stinger.',
    subComponentsList: [
      'Smoked Polycarbonate Transverse Double-Stack Spine (22× .45 Slugs or Sabot Buckshot)',
      'Rear Circular 90° Helical Cam Turret (0° Transverse → 45° Spiral → 90° Axial in Breech)',
      'Drop-In Breech Turret Saddle + Dual Floating PU95A High-Pressure Breech Seals',
      'Onboard 145cc 250-Bar Magazine Air Reserve + Dry-Break Vertical Plenum Coupler',
    ],
  },
  SHOTGUN_BURST_CARTRIDGE_FAMILY: {
    familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
    familyName: 'Burst-Disk Cartridge Family (#01 Mongo → #03 Double Barrel Defender → Cane)',
    shortTabLabel: '🧨 Burst-Disk Family (#01 Mongo / #03 Defender)',
    compatibilityGroup: 'ISOLATED_BURST_CARTRIDGE_SHOTGUN',
    compatibilityIndexPct: 0,
    actionMechanism: 'SINGLE_SHOT_BURST_CARTRIDGE',
    defaultCaliberMm: 12.7,
    supportedCalibersMm: [5.5, 6.35, 11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: true,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Self-contained sacrificial burst-disk cartridge family standardized on the shared .50 Cal (12.7mm) 220-Bar SHELL-50-220B container. Evolves from #01 Mongo (1-shot coaxial launcher) -> #03 Double Barrel Defender (2-shell break-action). Strictly incompatible with regulated PCP rifles.',
    subComponentsList: [
      'Fitting Body + Scored Burst Disk + Radial-Port Retainer + Fluid System',
      'Inner Barrel Liner + Concentric Silencer Baffle Shroud',
      '1× Shared .50 SHELL-50-220B (#01 Mongo) / 2× Shared .50 Shells (#03 Defender)',
      'L-Slot Bolt Striker (#01 Mongo) / Hinged Twin-Breech Receiver (#03 Defender)',
    ],
  },
  EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY: {
    familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
    familyName: '#02 REX-P (1-Shot Coaxial Underlever Pistol) ⇄ REX Sniper Carbine Mode',
    shortTabLabel: '🎯 #02 REX-P Pistol ⇄ Sniper',
    compatibilityGroup: 'REX_COAXIAL_MONOLITH_THREAD_M28',
    compatibilityIndexPct: 94,
    actionMechanism: 'SINGLE_SHOT_UNDERLEVER_SLIDE',
    defaultCaliberMm: 7.62,
    supportedCalibersMm: [6.35, 7.62, 9.0, 11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: false,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Pure coaxial single-shot PCP design (never confused with #01 Mongo): 1-shot vertical/axial breech slide (#11), 5-hole skeletonized trigger-guard underlever (#14), shrouded barrel (#02/#06), and coaxial rear air container (#37/#38). Converts to REX Sniper Carbine Mode by adding the rear shoulder stock and extended multi-baffle moderator.',
    subComponentsList: [
      '#03 Rifled Barrel Liner + #02/#06 5-Slot Shrouded Silencer Baffles',
      '#11 Single-Shot Breech Slide (1-Round Direct Slug Loading into Barrel Throat)',
      '#14 5-Hole Skeletonized Trigger-Guard Underlever + #20 Match Trigger',
      '#32 Coaxial Poppet Valve + #35 Hammer + #37/#38 Rear Air Cylinder (+ Sniper Stock/Moderator)',
    ],
  },
  EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY: {
    familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
    familyName: '#06 MP30 (.30 Cal Dual-Cylinder 300cc Tactical PCP SMG)',
    shortTabLabel: '⚡ #06 MP30 Dual-Cylinder SMG',
    compatibilityGroup: 'MP30_FIXED_GRIP_SMG_CHASSIS',
    compatibilityIndexPct: 88,
    actionMechanism: 'SEMI_AUTO_FIXED_GRIP_SMG',
    defaultCaliberMm: 7.62,
    supportedCalibersMm: [4.5, 5.5, 6.35, 7.62, 9.0],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: false,
    hasFixedVerticalHandle: true,
    architectureSummary:
      '#06 MP30 regulated side-lever tactical SMG with dual over/under 250-Bar aluminum cylinders (300cc total), Figure-8 regulator bridge, shrouded barrel moderator, and fast side-folding M4 buttstock.',
    subComponentsList: [
      'MP30-01: Upper 150cc & Lower 150cc 250-Bar Air Cylinders (300cc Total)',
      'MP30-02: Figure-8 Dual-Vessel Clamping Bridge & 165-Bar Regulator',
      'MP30-03: Biathlon Side-Lever & 12-Rd .30 Cal Rotary Magazine',
      'MP30-04: Fast 180° Side-Folding M4 Tactical Buttstock',
    ],
  },
  LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY: {
    familyId: 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY',
    familyName: '#05 The Leaf (.45 Cal Compact Semi-Auto · Shrouded Silencer + 165cc Outer Air Reserve)',
    shortTabLabel: '🔥 #05 The Leaf .45 (Shroud + Air Reserve)',
    compatibilityGroup: 'LESHIY_CONCENTRIC_FOLDING_BREECH',
    compatibilityIndexPct: 96,
    actionMechanism: 'SEMI_AUTO_CONCENTRIC_OTB_RIFLE',
    defaultCaliberMm: 11.43,
    supportedCalibersMm: [5.5, 6.35, 7.62, 9.0, 11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: true,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Complex .45 caliber (11.43mm) semi-automatic compact folding rifle. Features a 3-layer concentric front assembly: (1) .45 Rifled Barrel Liner -> (2) Concentric Multi-Baffle Silencer Shroud -> (3) Outer Over-The-Barrel (OTB) High-Pressure Air Reserve Cylinder over the shroud, plus folding twin-tube stock.',
    subComponentsList: [
      'Layer 1 (Core): .45 Cal (11.43mm) Polygonal Rifled Barrel Liner',
      'Layer 2 (Middle): Concentric Multi-Baffle Silencer Shroud around Barrel',
      'Layer 3 (Outer): Over-The-Barrel (OTB) High-Pressure Air Reserve Container over Silencer',
      'Semi-Auto Hammerless Shuttle Valve + 6-Rd .45 Scalloped Rotary Drum + Folding Stock',
    ],
  },
  LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY: {
    familyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
    familyName: '#04 Leshiy 2 Open-Breech Rotary Benchmark',
    shortTabLabel: '🔬 #04 Leshiy 2 Open-Breech',
    compatibilityGroup: 'LESHIY_CONCENTRIC_FOLDING_BREECH',
    compatibilityIndexPct: 96,
    actionMechanism: 'SEMI_AUTO_CONCENTRIC_OTB_RIFLE',
    defaultCaliberMm: 7.62,
    supportedCalibersMm: [4.5, 5.5, 6.35, 7.62, 9.0, 11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: true,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Side-folding open-breech semi-auto benchmark featuring the crimson scalloped rotary drum, central star ratchet, red polyurethane transfer port puck, and exposed silver coil-sprung indexing pawl.',
    subComponentsList: [
      'Inner Barrel Liner + Carbon M-LOK Silencer Shroud',
      'Crimson Scalloped Rotary Drum + Central Star Ratchet Hub',
      'Bright Red Polyurethane 95A Breech Seal Puck + Star Exhaust Plug',
      'Silver CNC Twin-Lug Hinge + Exposed Coil-Sprung Indexing Pawl + Twin-Tube Stock',
    ],
  },
  ASCENT_3STAGE_ONBOARD_PUMP_FAMILY: {
    familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
    familyName:
      '#08 Custom .45 Ascent Lever-Action (Over-Barrel 2+ Rd Plenum & Screw-On Silencer + Under-Barrel 300-Bar Air Reserve & 4-Bar Pump)',
    shortTabLabel: '🛠️ #08 .45 Ascent (300B Pump + Barrel Plenum)',
    compatibilityGroup: 'ONBOARD_3STAGE_PUMP_RECEIVER',
    compatibilityIndexPct: 92,
    actionMechanism: 'SEMI_AUTO_CONCENTRIC_OTB_RIFLE',
    defaultCaliberMm: 11.43,
    supportedCalibersMm: [4.5, 5.5, 6.35, 7.62, 9.0, 11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: true,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Redesigned .45 Cal (11.43mm) Lever-Action & 300-Bar Onboard-Pump Hybrid combining all 12 diagrammed parts: (1) Ambidextrous Thumbhole Synthetic Stock, (2) Lever-Action Operated Repeater, (3) 2-Stage Match Adjustable Trigger, (4) Manual Safety, (5) Rotary Mag (6 Rds .45 / 10 Rds .25 / 12 Rds .22 / 14 Rds .177), (6) Removable Flip-Up Fiber Optic Open Sights, (7) Top & Lower Picatinny Accessory Rails, (8) Precision Rifled & Choked .45 Barrel, (9) Concentric Over-Barrel Regulated Plenum (140cc for 2–3 full .45 shots), (10) Screw-On Quiet Energy Moderator, (11) Under-Barrel 300-Bar Air Reserve (240cc/165cc) + Recessed Pressure Gauge, and (12) Interactive Compound 4-Bar 300-Bar Onboard Hand Pump.',
    subComponentsList: [
      'Over-Barrel Regulated 2+ Round Plenum (140cc @ 210 Bar) + Precision Rifled & Choked .45 Barrel + Screw-On Moderator',
      'Under-Barrel 300-Bar Air Reserve Cylinder (240cc / 165cc) + Recessed Bottom 0–300 Bar Pressure Gauge',
      'In-Game Interactive Compound 4-Bar 3-Stage 300-Bar Onboard Hand Pump + Counter-Balancer Piston',
      'Lever-Action Operated Repeater + 2-Stage Match Trigger + Manual Safety + Rotary Mag + Flip-Up Sights + Thumbhole Stock',
    ],
  },
  PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY: {
    familyId: 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY',
    familyName:
      '#09 The Protector (.50 Cal Dual Threaded Barrel-Reserve Scatter Gun · Reverse-Loop Center-Barrel Airflow)',
    shortTabLabel: '💥 #09 The Protector (Dual Barrel-Reserve Scatter)',
    compatibilityGroup: 'ISOLATED_BURST_CARTRIDGE_SHOTGUN',
    compatibilityIndexPct: 90,
    actionMechanism: 'BREAK_ACTION_TWIN_SHELL',
    defaultCaliberMm: 12.7,
    supportedCalibersMm: [11.43, 12.7],
    hasShroudedSilencerBaffles: true,
    hasConcentricOverBarrelAirReserve: true,
    hasFixedVerticalHandle: false,
    architectureSummary:
      'Dual-barrel break-action scatter gun with two independent M28×1.5 threaded barrels where each barrel’s outer annular jacket is a self-contained 250-Bar air reserve (110cc × 2) for 2 separate shots. Cock it open to load 2× .50 Cal Sabot Scatter Cartridges, cock it up to lock, select fire (Barrel 1, Barrel 2, or Dual Salvo), and fire: air flows from the barrel reserve out to the rear manifold, loops 180° around, and pushes the round out the middle of the barrel—breaking apart and scattering after leaving the muzzle.',
    subComponentsList: [
      'PROT-01/02: Upper & Lower M28×1.5 Threaded Barrel-Reserves (110cc @ 250 Bar each)',
      'PROT-03/04: Break-Action Cock-Open/Cock-Up Hinge & 3-Position Fire Selector (Barrel 1 / Barrel 2 / Salvo)',
      'PROT-05/06: Rearward Barrel-to-Back Transfer Tube & 180° Reverse-Loop Center-Barrel Injection Manifold',
      'PROT-07/08: Mid-Bore Radial Gas Injection Throat & Post-Muzzle Break-Apart 8-Pellet Flechette Scatter Sabot',
    ],
  },
};

export interface Ascent45PartSpec {
  partNumber: number;
  partCode: string;
  diagramCalloutTitle: string;
  redesigned45EngineeringRole: string;
  materialAndSealSpec: string;
  dimensionsMm: string;
  operatingPressureBar: number;
  photoPinX: number;
  photoPinY: number;
}

/**
 * Permanent 12-Part Engineering Catalog for the Redesigned .45 Cal Ascent × Vectis
 * 300-Bar Onboard-Pump Carbine (recording every callout from `/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg`
 * plus the Over-Barrel 2+ Round Plenum, Silencer, and 300-Bar Under-Barrel Reserve + Pump).
 */
export const ASCENT_45_300BAR_12_PARTS_CATALOG: Ascent45PartSpec[] = [
  {
    partNumber: 1,
    partCode: 'ASC-45-01',
    diagramCalloutTitle: 'Ambidextrous, Thumbhole Synthetic Stock',
    redesigned45EngineeringRole:
      'Glass-filled nylon thumbhole chassis with raised Monte Carlo cheek comb, twin ambidextrous palm swells, and soft rubber recoil pad rated for 245-Joule .45 Cal recoil impulse.',
    materialAndSealSpec: 'PA66-GF30 Glass-Reinforced Polymer + 60A Santoprene Buttpad',
    dimensionsMm: 'L=365.0mm · Comb H=138.0mm · Thumbhole Aperture=64.0×42.0mm',
    operatingPressureBar: 0,
    photoPinX: 24,
    photoPinY: 44,
  },
  {
    partNumber: 2,
    partCode: 'ASC-45-02',
    diagramCalloutTitle: 'Lever Action Operated Repeater',
    redesigned45EngineeringRole:
      'Integrated trigger-guard cowboy underlever loop (48° throw, 3.6:1 mechanical advantage) that retracts the .45 stainless bolt probe, cocks the hammer spring, and indexes the rotary magazine.',
    materialAndSealSpec: '4140 Chromoly Steel Loop (HRC 42) + Hardened Toggle Link Pins',
    dimensionsMm: 'Loop L=128.0mm · Throw=48.0° · Probe Linear Stroke=34.0mm',
    operatingPressureBar: 0,
    photoPinX: 31,
    photoPinY: 56,
  },
  {
    partNumber: 3,
    partCode: 'ASC-45-03',
    diagramCalloutTitle: 'Quattro Trigger: Two Stage, Fully Adjustable',
    redesigned45EngineeringRole:
      '2-stage match sear mechanism with 3 hex adjustment screws for 1st-stage travel, 2nd-stage crisp wall break (4.5 N pull), and over-travel stop.',
    materialAndSealSpec: 'A2 Tool Steel Sear Surfaces (HRC 60) + Anodized Trigger Blade',
    dimensionsMm: 'Blade H=28.5mm · 1st Stage=2.2mm · Break Weight=4.5 N (1.01 lbf)',
    operatingPressureBar: 0,
    photoPinX: 35,
    photoPinY: 51,
  },
  {
    partNumber: 4,
    partCode: 'ASC-45-04',
    diagramCalloutTitle: 'Manual Safety (S <-> F Toggle)',
    redesigned45EngineeringRole:
      'Positive cross-blade manual safety toggle positioned directly ahead of the Quattro Trigger inside the lever loop; physically blocks both sear drop and lever opening when set to S.',
    materialAndSealSpec: '17-4PH Stainless Toggle + Detent Ball & Coil Spring',
    dimensionsMm: 'Toggle L=18.0mm · Detent Throw=22.0° (S=Safe / F=Fire)',
    operatingPressureBar: 0,
    photoPinX: 38,
    photoPinY: 51,
  },
  {
    partNumber: 5,
    partCode: 'ASC-45-05',
    diagramCalloutTitle: 'Rotary Mag (6 Rds .45 Cal · 10 Rds .25 · 12 Rds .22 · 14 Rds .177)',
    redesigned45EngineeringRole:
      'Top-loading spring-indexed rotary magazine that seats vertically into the receiver breech slot. Scales from 14 Rds (.177), 12 Rds (.22), 10 Rds (.25), 8 Rds (.30), 7 Rds (.357) to 6 Rds of .45 Cal (11.43mm) 220gr slugs.',
    materialAndSealSpec: '7075-T6 CNC Drum + Smoked Lexan Cover + Viton Hub O-Ring (8.0×1.5mm)',
    dimensionsMm: 'OD=44.0mm · Thickness=15.8mm · .45 Bore=Ø11.46mm (6 Chambers @ 60°)',
    operatingPressureBar: 210,
    photoPinX: 43,
    photoPinY: 39,
  },
  {
    partNumber: 6,
    partCode: 'ASC-45-06',
    diagramCalloutTitle: 'Removable, Flip Up Fiber Optic Open Sights',
    redesigned45EngineeringRole:
      'Spring-loaded folding TruGlo fiber-optic iron sights clamped to the top Picatinny rail: Rear adjustable green dual-dot sight (0.9mm fiber) + Front hooded red fiber-optic post (1.0mm fiber).',
    materialAndSealSpec: '6061-T6 Folding Sight Towers + Green/Red PMMA Optical Fibers',
    dimensionsMm: 'Sight Radius=465.0mm · Elevation/Windage Click=0.25 MOA',
    operatingPressureBar: 0,
    photoPinX: 48,
    photoPinY: 36,
  },
  {
    partNumber: 7,
    partCode: 'ASC-45-07',
    diagramCalloutTitle: 'Picatinny Accessory Rails (Full Top 22mm Rail + Lower Forend Rail)',
    redesigned45EngineeringRole:
      'Dual MIL-STD-1913 / 11mm dovetail combo top rail spanning the receiver and over-barrel plenum shroud for optics, plus a lower 5-slot forend Picatinny rail for bipods/lasers.',
    materialAndSealSpec: 'CNC-Milled 7075-T6 Hard Anodized Black (MIL-STD-1913)',
    dimensionsMm: 'Top Rail L=490.0mm × W=21.2mm · Lower Forend Rail L=85.0mm',
    operatingPressureBar: 0,
    photoPinX: 67,
    photoPinY: 50,
  },
  {
    partNumber: 8,
    partCode: 'ASC-45-08',
    diagramCalloutTitle: 'Precision Rifled And Choked .45 Cal (11.43mm) Barrel',
    redesigned45EngineeringRole:
      '450mm button-rifled and choked .45 Cal (11.43mm, 1:16" twist) barrel liner. Radial gas transfer ports at the breech throat admit regulated 210-Bar air from the concentric Over-Barrel Plenum.',
    materialAndSealSpec: '4140 CrMo Ordinance Steel (HRC 32) + Dual NBR-90 Breech O-Rings (14.5×1.5mm)',
    dimensionsMm: 'L=450.0mm · Bore=Ø11.43mm (.45 Cal) · Liner OD=Ø15.2mm',
    operatingPressureBar: 210,
    photoPinX: 79,
    photoPinY: 41,
  },
  {
    partNumber: 9,
    partCode: 'ASC-45-09',
    diagramCalloutTitle: 'Concentric Over-the-Barrel (OTB) Regulated 2+ Round Plenum (140cc @ 210 Bar)',
    redesigned45EngineeringRole:
      'The outer barrel tube itself is a 140cc regulated coaxial plenum jacket surrounding the rear/mid 340mm of the .45 barrel! Stores enough regulated 210-Bar air for 2 to 3 full-power .45 Cal shots (245 J each) before dropping below setpoint.',
    materialAndSealSpec: '7075-T6 Seamless Tube (OD 36.0mm × ID 29.6mm) + 2× Viton Bulkhead O-Rings (29.0×2.5mm)',
    dimensionsMm: 'Plenum Volume=140.0 cc @ 210 Bar · OD=36.0mm · Wall=3.20mm (SF 3.1x)',
    operatingPressureBar: 210,
    photoPinX: 62,
    photoPinY: 40,
  },
  {
    partNumber: 10,
    partCode: 'ASC-45-10',
    diagramCalloutTitle: 'Quiet Energy Moderator (Concentric Baffles + 6-Gill Vented Muzzle Brake)',
    redesigned45EngineeringRole:
      'Mounted coaxially at the front of the Over-Barrel Plenum: uses 5 internal K-baffles plus the signature 6-slot angled QuietEnergy muzzle diffuser to strip .45 muzzle blast by -18.5 dB.',
    materialAndSealSpec: '7075-T6 Vented Muzzle Shroud + 5× C36000 Brass Conical Baffles',
    dimensionsMm: 'L=135.0mm · OD=34.0mm · Baffle Bore=Ø12.60mm (6 Angled Side Gills)',
    operatingPressureBar: 48,
    photoPinX: 90,
    photoPinY: 41,
  },
  {
    partNumber: 11,
    partCode: 'ASC-45-11',
    diagramCalloutTitle: 'Under-Barrel 300-Bar Air Reserve (240cc / 165cc) + Recessed Pressure Gauge',
    redesigned45EngineeringRole:
      'High-pressure 300-Bar (4,350 PSI) primary air reserve cylinder mounted beneath the Over-Barrel Plenum and connected directly to the onboard pump check valve and recessed bottom 0–300 Bar Bourdon manometer.',
    materialAndSealSpec: '7075-T6 / Carbon-Wrapped Cylinder + Viton FKM-90 Endcap O-Rings (26.0×2.5mm) + Dowty Gauge Seal',
    dimensionsMm: 'Reserve Volume=240 cc (165cc base) @ 300 Bar · OD=33.0mm · Wall=3.60mm',
    operatingPressureBar: 300,
    photoPinX: 74,
    photoPinY: 45,
  },
  {
    partNumber: 12,
    partCode: 'ASC-45-12',
    diagramCalloutTitle: 'In-Game Interactive 3-Stage 300-Bar Onboard Hand Pump + Part #116 Counter-Balancer',
    redesigned45EngineeringRole:
      'Telescopic 3-stage compressor integrated into the under-barrel forend linkage and coupled directly to the Under-Barrel 300-Bar Air Reserve. Can be pumped in-game via lever strokes or 1-click pump cycles all the way to 300 Bar, feeding the Over-Barrel 2+ Round Plenum through a 210-Bar Belleville regulator.',
    materialAndSealSpec: '17-4PH Stage-3 Ø5.6mm Piston + Fluorosilicone FVMQ-80 O-Ring (260°C) + PTFE Back-Up + Brass Check Poppet',
    dimensionsMm: 'Stroke=215.0mm · Stage-3 Bore=Ø5.60mm · Max Output=300 Bar (4,350 PSI)',
    operatingPressureBar: 300,
    photoPinX: 56,
    photoPinY: 48,
  },
];

export interface AmmoAccurateMagazineSpec {
  familyId: BaseWeaponFamilyId;
  caliberMm: number;
  imperialCaliberLabel: string;
  magazineTypeLabel: string;
  exactCapacity: number;
  capacityDisplayBadge: string;
  projectileType: string;
  pelletOrSlugCountPerShot: number;
  chamberDiameterMm: number;
  geometricRationale: string;
}

/**
 * Computes the exact, physically authentic magazine or chamber capacity based on Weapon Family + Ammo Caliber:
 * - P90 Top Helical-Turret + Plenum Reserve Magazine: .45=22 Rds, .50=18 Rds, .357=28 Rds, .30=34 Rds, .25=42 Rds, .22=50 Rds
 * - Evanix REX-P / REX Sniper: Strictly 1-Shot Single-Load Axial Breech across all calibers
 * - Burst-Disk Pen / Cane: Strictly 1-Shot Self-Contained Capsule / Cartridge
 * - Burst-Disk AEA Twin-Shell Break-Action Shotgun: Strictly 2 Pre-Charged Shotgun Shells
 * - EDgun Leshiy 3 / Leshiy 2 Rotary Drum: .177=10, .22=8, .25=8, .30=8, .357=7, .45=6, .50=5
 * - Evanix MP30 Double-Stack Tower Mag: .177=20, .22=18, .25=15, .30=12, .357=9, .45=7, .50=6
 * - Ascent / Vectis Rotary Mag: .177=14, .22=12, .25=10, .30=8, .357=7, .45=6, .50=5
 */
export function computeAccurateMagCapacityByWeaponAndCaliber(
  familyId: BaseWeaponFamilyId,
  caliberMm: number,
  burstStage: BurstDiskEvolutionStage = 'STAGE_2_SIMPLE_RED_AIR_PEN',
  p90Payload: P90AmmoPayloadType = 'SLUG_45_BOATTAIL_220GR'
): AmmoAccurateMagazineSpec {
  const imperialMap: Record<string, string> = {
    '4.50': '.177 Cal (4.5mm)',
    '5.50': '.22 Cal (5.5mm)',
    '6.35': '.25 Cal (6.35mm)',
    '7.62': '.30 Cal (7.62mm)',
    '9.00': '.357 Cal (9.0mm)',
    '11.43': '.45 Cal (11.43mm)',
    '12.70': '.50 Cal (12.7mm)',
  };
  const imperialCaliberLabel =
    imperialMap[caliberMm.toFixed(2)] || `${caliberMm.toFixed(2)}mm Custom`;

  if (familyId === 'P90_45_TOP_HELICAL_PLENUM_FAMILY') {
    const p90Cap =
      caliberMm <= 5.6
        ? 50
        : caliberMm <= 6.5
        ? 42
        : caliberMm <= 7.8
        ? 34
        : caliberMm <= 9.2
        ? 28
        : caliberMm <= 11.6
        ? 22
        : 18;
    const isBuckshot = p90Payload === 'SABOT_45_BUCKSHOT_6PELLET';
    return {
      familyId,
      caliberMm,
      imperialCaliberLabel,
      magazineTypeLabel:
        'P90 Top-Mount 90° Helical-Breech Mag + 145cc Plenum Reserve',
      exactCapacity: p90Cap,
      capacityDisplayBadge: `${p90Cap} Rds (P90 90° Helical + 145cc Plenum)`,
      projectileType: isBuckshot
        ? `${imperialCaliberLabel} Delrin Sabot Buckshot (6× #1 Lead Pellets)`
        : `${imperialCaliberLabel} Flanged Sabot 220gr Boattail Slug`,
      pelletOrSlugCountPerShot: isBuckshot ? 6 : 1,
      chamberDiameterMm: Number((caliberMm + 1.37).toFixed(2)),
      geometricRationale: `285mm horizontal double-stack spine holds ${p90Cap} transverse rounds (${caliberMm}mm bore inside Ø${(caliberMm + 1.37).toFixed(1)}mm carrier sabot), rotating 90° via twin helical cam tracks directly into the breech while feeding 145cc @ 250 Bar into the lower plenum.`,
    };
  }

  if (familyId === 'PROTECTOR_DUAL_BARREL_RESERVE_SCATTER_FAMILY') {
    return {
      familyId,
      caliberMm: 12.7,
      imperialCaliberLabel: '.50 Cal Scatter Sabot (12.7mm)',
      magazineTypeLabel: 'Dual Threaded Barrel-Reserve Break-Action Chambers (2 Separate Air Reserves)',
      exactCapacity: 2,
      capacityDisplayBadge: '2 Scatter Rounds (2× 110cc 250B Barrel Reserves)',
      projectileType: '.50 Cal Break-Apart Sabot Scatter Cartridge (8× Hardened Tungsten Flechettes)',
      pelletOrSlugCountPerShot: 8,
      chamberDiameterMm: 14.8,
      geometricRationale:
        'Each M28×1.5 threaded barrel stores its own 110cc 250-Bar air reserve for 2 separate shots; air routes to the back, loops 180°, and pushes the round out the middle of the barrel where it breaks apart and scatters after leaving the muzzle.',
    };
  }

  if (familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY') {
    if (burstStage === 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL') {
      return {
        familyId,
        caliberMm: 12.7,
        imperialCaliberLabel: '.50 Cal Shared Shell (12.7mm)',
        magazineTypeLabel: 'Twin Break-Action Over/Under Chambers (#03 Defender)',
        exactCapacity: 2,
        capacityDisplayBadge: '2 Shells (Break-Action)',
        projectileType: 'Pre-Charged Shared .50 SHELL-50-220B Cartridge (8× #000 Buckshot or 335gr Slug)',
        pelletOrSlugCountPerShot: 8,
        chamberDiameterMm: 15.8,
        geometricRationale:
          'Twin-bore break-open receiver holds 2 self-contained pre-charged .50 Cal SHELL-50-220B cartridges.',
      };
    }
    if (burstStage === 'STAGE_4_CONCEALED_AIRGUN_CANE') {
      return {
        familyId,
        caliberMm,
        imperialCaliberLabel,
        magazineTypeLabel: 'Inline Concealed Cane Burst Cartridge Chamber',
        exactCapacity: 1,
        capacityDisplayBadge: '1 Shell (Inline Cane)',
        projectileType: 'Pre-Charged Inline Burst-Disk Cane Cartridge',
        pelletOrSlugCountPerShot: caliberMm >= 11.0 ? 8 : 1,
        chamberDiameterMm: 16.2,
        geometricRationale:
          'Tubular Ø24mm walking cane shaft houses 1 inline high-pressure burst-disk cartridge directly behind the shrouded barrel.',
      };
    }
    return {
      familyId,
      caliberMm: 12.7,
      imperialCaliberLabel: '.50 Cal Shared Shell (12.7mm)',
      magazineTypeLabel: 'Single Coaxial Breech Chamber (#01 Mongo)',
      exactCapacity: 1,
      capacityDisplayBadge: '1 Shell (#01 Mongo Single-Shot)',
      projectileType: 'Shared .50 Cal 220-Bar Pre-Charged SHELL-50-220B Cartridge',
      pelletOrSlugCountPerShot: 1,
      chamberDiameterMm: 18.0,
      geometricRationale:
        'Crimson-anodized #01 Mongo coaxial launcher threads directly onto 1 shared .50 Cal 220-Bar SHELL-50-220B cartridge.',
    };
  }

  if (familyId === 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY') {
    return {
      familyId,
      caliberMm,
      imperialCaliberLabel,
      magazineTypeLabel: 'Part #11 Single-Shot Axial Breech Slide',
      exactCapacity: 1,
      capacityDisplayBadge: '1 Shot (Direct Axial Breech #11)',
      projectileType: `${imperialCaliberLabel} Heavy Cast Boattail Slug`,
      pelletOrSlugCountPerShot: 1,
      chamberDiameterMm: Number((caliberMm + 0.35).toFixed(2)),
      geometricRationale:
        'Evanix REX-P / REX Sniper is a pure 1-shot coaxial design: pivoting the 5-hole underlever (#14) slides Breech Block (#11) forward to load 1 heavy slug directly into the rifled barrel throat (#03).',
    };
  }

  if (familyId === 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY') {
    const mp30Cap =
      caliberMm <= 4.6
        ? 20
        : caliberMm <= 5.6
        ? 18
        : caliberMm <= 6.5
        ? 15
        : caliberMm <= 7.8
        ? 12
        : caliberMm <= 9.2
        ? 9
        : 6;
    return {
      familyId,
      caliberMm,
      imperialCaliberLabel,
      magazineTypeLabel: 'MP30 Double-Stack High-Tower Magazine',
      exactCapacity: mp30Cap,
      capacityDisplayBadge: `${mp30Cap} Rds (MP30 Tower Mag)`,
      projectileType: `${imperialCaliberLabel} Hollow-Point Pellet / Slug`,
      pelletOrSlugCountPerShot: 1,
      chamberDiameterMm: Number((caliberMm + 0.3).toFixed(2)),
      geometricRationale: `Double-stack vertical tower magazine scales column pitch by ${caliberMm}mm diameter -> ${mp30Cap} rounds.`,
    };
  }

  if (familyId === 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY') {
    const ascentCap =
      caliberMm <= 4.6
        ? 14
        : caliberMm <= 5.6
        ? 12
        : caliberMm <= 6.5
        ? 10
        : caliberMm <= 7.8
        ? 8
        : caliberMm <= 9.2
        ? 7
        : caliberMm <= 11.6
        ? 6
        : 5;
    return {
      familyId,
      caliberMm,
      imperialCaliberLabel,
      magazineTypeLabel:
        'Top-Loading Lever-Indexed Rotary Mag + 140cc Over-Barrel 2+ Rd Plenum',
      exactCapacity: ascentCap,
      capacityDisplayBadge: `${ascentCap} Rds Rotary (2–3 Shots/Plenum · 300B Pump)`,
      projectileType: `${imperialCaliberLabel} Heavy Hollow-Point Slug`,
      pelletOrSlugCountPerShot: 1,
      chamberDiameterMm: Number((caliberMm + 0.25).toFixed(2)),
      geometricRationale: `Hatsan Vectis / Redesigned .45 Ascent rotary wheel holds ${ascentCap} rounds at ${caliberMm}mm bore pitch (14/.177, 12/.22, 10/.25, 8/.30, 7/.357, 6/.45), backed by a 140cc Over-Barrel Plenum (2–3 shots) and 300-Bar Under-Barrel Pump Reserve.`,
    };
  }

  // LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY or LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY
  const leshiyCap =
    caliberMm <= 4.6
      ? 10
      : caliberMm <= 7.8
      ? 8
      : caliberMm <= 9.2
      ? 7
      : caliberMm <= 11.6
      ? 6
      : 5;
  return {
    familyId,
    caliberMm,
    imperialCaliberLabel,
    magazineTypeLabel:
      familyId === 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY'
        ? 'Leshiy 3 CNC Scalloped Semi-Auto Rotary Drum'
        : 'Leshiy 2 Valkyrie Crimson Scalloped Rotary Drum',
    exactCapacity: leshiyCap,
    capacityDisplayBadge: `${leshiyCap} Rds (${Math.round(360 / leshiyCap)}° Star Ratchet)`,
    projectileType: `${imperialCaliberLabel} Precision Hollow-Point Slug`,
    pelletOrSlugCountPerShot: 1,
    chamberDiameterMm: Number((caliberMm + 0.22).toFixed(2)),
    geometricRationale: `Pitch-circle diameter (PCD=31.0mm) with >=2.15mm inter-chamber web fits ${leshiyCap} chambers at ${caliberMm}mm (${Math.round(360 / leshiyCap)}° indexing step).`,
  };
}

export interface CompatibilityCheckResult {
  compatible: boolean;
  compatibilityScorePct: number;
  sourceFamily: BaseWeaponFamilyId;
  targetFamily: BaseWeaponFamilyId;
  verdictBadge:
    | 'NATIVE 100% FIT'
    | 'INTRA-FAMILY EVOLUTION'
    | 'THREAD ADAPTER BRIDGE'
    | 'STRICTLY INCOMPATIBLE (ISOLATED SHOTGUN/PEN FAMILY)';
  engineeringExplanation: string;
  allowedEvolutions: string[];
}

/**
 * Enforces the strict Compatibility Index across Weapon Families:
 * - `SHOTGUN_BURST_CARTRIDGE_FAMILY` (Burst Disk -> Air Pen -> 2-Shell Break-Action -> Airgun Cane)
 *   is strictly isolated (`compatible = false`, `score = 0%`) from all regulated PCP rifles/pistols and vice versa.
 */
export function evaluateWeaponFamilyCompatibility(
  sourceFamily: BaseWeaponFamilyId,
  targetFamily: BaseWeaponFamilyId
): CompatibilityCheckResult {
  const srcIsBurst = sourceFamily === 'SHOTGUN_BURST_CARTRIDGE_FAMILY';
  const tgtIsBurst = targetFamily === 'SHOTGUN_BURST_CARTRIDGE_FAMILY';

  if (srcIsBurst && tgtIsBurst) {
    return {
      compatible: true,
      compatibilityScorePct: 100,
      sourceFamily,
      targetFamily,
      verdictBadge: 'INTRA-FAMILY EVOLUTION',
      engineeringExplanation:
        '100% Compatible within the Self-Contained Burst-Disk Cartridge Family: Stage 1 Burst Disk Fitting threads directly into Stage 2 Red Air Pen, Stage 3 AEA 2-Shell Break-Action Shotgun Cartridges, and Stage 4 Concealed Airgun Cane.',
      allowedEvolutions: [
        'Stage 1: Redesigned Burst Disk Fitting (Body + Disk + Retainer + Fluid System)',
        'Stage 2: Simple Red-Anodized Air Pellet Pen (1-Shot Clear Yellow Capsule)',
        'Stage 3: AEA Twin-Shell Break-Action Shotgun Pistol (2 Red/Silver Shells)',
        'Stage 4: Concealed Burst-Disk Walking Cane (Inline Cartridge + Shrouded Barrel)',
      ],
    };
  }

  if (srcIsBurst !== tgtIsBurst) {
    return {
      compatible: false,
      compatibilityScorePct: 0,
      sourceFamily,
      targetFamily,
      verdictBadge: 'STRICTLY INCOMPATIBLE (ISOLATED SHOTGUN/PEN FAMILY)',
      engineeringExplanation:
        'BLOCKED BY COMPATIBILITY INDEX (0%): Self-contained Burst-Disk Shotgun/Pen/Cane components use sacrificial cartridge rupture chambers and cannot be mounted onto regulated PCP rifles/pistols (and regulated PCP tanks, rotary drums, and pumps cannot mount onto the Pen, 2-Shell Shotgun, or Cane).',
      allowedEvolutions: [
        'Keep within Burst-Disk Family: Burst Disk -> Pen -> 2-Shell Shotgun -> Cane',
      ],
    };
  }

  if (sourceFamily === targetFamily) {
    return {
      compatible: true,
      compatibilityScorePct: 100,
      sourceFamily,
      targetFamily,
      verdictBadge: 'NATIVE 100% FIT',
      engineeringExplanation: `Native 100% factory interface match within ${BASE_WEAPON_FAMILIES[sourceFamily].familyName}.`,
      allowedEvolutions: BASE_WEAPON_FAMILIES[sourceFamily].subComponentsList,
    };
  }

  return {
    compatible: true,
    compatibilityScorePct: 88,
    sourceFamily,
    targetFamily,
    verdictBadge: 'THREAD ADAPTER BRIDGE',
    engineeringExplanation: `Cross-platform PCP integration between ${BASE_WEAPON_FAMILIES[sourceFamily].shortTabLabel} and ${BASE_WEAPON_FAMILIES[targetFamily].shortTabLabel} via CNC/PA12-CF M28x1.25 / Dry-Break Coaxial Plenum Stinger.`,
    allowedEvolutions: BASE_WEAPON_FAMILIES[sourceFamily].subComponentsList,
  };
}

/**
 * Infers the active Base Weapon Family from the selected platform IDs or explicit family override.
 */
export function resolveActiveWeaponFamily(params: {
  explicitFamily?: BaseWeaponFamilyId;
  upperPlatformId: string;
  lowerPlatformId: string;
  dischargeType: DischargeMechanismType;
}): BaseWeaponFamilyId {
  if (params.explicitFamily) {
    return params.explicitFamily;
  }
  const { upperPlatformId, lowerPlatformId, dischargeType } = params;
  if (
    upperPlatformId === 'plat_20_texoma_pellet_pen' ||
    lowerPlatformId === 'plat_20_texoma_pellet_pen' ||
    upperPlatformId === 'plat_21_aea_airgun_cane' ||
    lowerPlatformId === 'plat_21_aea_airgun_cane' ||
    upperPlatformId === 'plat_23_aea_megalodon' ||
    dischargeType === 'SACRIFICIAL_BURST_DISK_1800PSI' ||
    dischargeType === 'SACRIFICIAL_BURST_DISK_3200PSI'
  ) {
    return 'SHOTGUN_BURST_CARTRIDGE_FAMILY';
  }
  if (
    upperPlatformId === 'plat_22_fx_panthera' ||
    lowerPlatformId === 'plat_22_fx_panthera'
  ) {
    return 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY';
  }
  if (
    upperPlatformId === 'plat_15_evanix_mp30' ||
    lowerPlatformId === 'plat_15_evanix_mp30'
  ) {
    return 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY';
  }
  if (
    upperPlatformId === 'plat_03_ascent_pump' ||
    lowerPlatformId === 'plat_03_ascent_pump' ||
    upperPlatformId === 'plat_25_hatsan_vectis'
  ) {
    return 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY';
  }
  return 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY';
}
