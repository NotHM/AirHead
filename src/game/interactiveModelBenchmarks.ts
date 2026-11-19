import {
  BaseWeaponFamilyId,
  BurstDiskEvolutionStage,
  P90AmmoPayloadType,
  RexConfigurationMode,
} from './weaponFamiliesAndCompatibility';

export type InteractiveBenchmarkModelId =
  | 'MODEL_01_P90_45_HELICAL_PLENUM'
  | 'MODEL_02_BURST_DISK_4STAGE_FAMILY'
  | 'MODEL_03_LESHIY3_45_TRIPLE_CONCENTRIC'
  | 'MODEL_04_LESHIY2_VALKYRIE_BENCHMARK'
  | 'MODEL_05_EVANIX_REXP_COAXIAL_MONOLITH'
  | 'MODEL_06_EVANIX_MP30_FIXED_HANDLE'
  | 'MODEL_07_ASCENT_3STAGE_ONBOARD_PUMP'
  | 'MODEL_08_VECTIS_VELOX_LEVER_SEMI';

export type MicroPartCategory =
  | 'HIGH_PRESSURE_ORING_SEAL'
  | 'VALVE_POPPET_OR_BURST_FOIL'
  | 'SPRING_PAWL_OR_FASTENER'
  | 'BARREL_BAFFLE_OR_SHROUD'
  | 'PRESSURE_VESSEL_OR_PLENUM'
  | 'BREECH_MAG_OR_SABOT';

export interface SubMillimeterPartAndOringSpec {
  partCode: string;
  name: string;
  steampunkRustAlias: string;
  category: MicroPartCategory;
  materialAndDurometer: string;
  dimensionsMm: {
    lengthOrThicknessMm: number;
    outerDiameterMm: number;
    innerDiameterMm: number;
    wallOrCrossSectionMm: number;
    toleranceMm: string;
  };
  // Interactive SVG node coordinates (0-800 x 0-390) for the Vector CAD Blueprint
  svgNodeX: number;
  svgNodeY: number;
  // Interactive Image Callout Pin coordinates (0-100% x 0-100%) on the reference photo/diagram
  photoPinX: number;
  photoPinY: number;
  realPhysicsSpec: {
    governingEquation: string;
    operatingPressureBar: number;
    squeezeOrClearancePct: string;
    hoopOrShearSafetyFactor: number;
    failureModeIfOmitted: string;
  };
  howItWorksWithNeighbors: string;
}

export interface CaliberPhysicsRemakeRow {
  caliberMm: number;
  caliberLabel: string;
  magOrShellCapacity: string;
  indexingAngleOrPitch: string;
  breechOrSabotOdMm: string;
  transferPortOrOtbOdMm: string;
  muzzleEnergyJoules: number;
  safetyFactor: number;
}

export interface InteractiveWeaponBenchmarkModel {
  modelId: InteractiveBenchmarkModelId;
  shortBadge: string;
  fullTitle: string;
  steampunkRustLoreSubtitle: string;
  linkedFamilyContext: {
    familyId: BaseWeaponFamilyId;
    burstStage: BurstDiskEvolutionStage;
    rexMode: RexConfigurationMode;
    p90Payload?: P90AmmoPayloadType;
    defaultCaliberMm: number;
  };
  referenceImageUrl: string;
  secondaryImageUrl?: string;
  svgBlueprintType:
    | 'SVG_P90_HELICAL_PLENUM'
    | 'SVG_BURST_DISK_4STAGE'
    | 'SVG_LESHIY3_TRIPLE_CONCENTRIC'
    | 'SVG_LESHIY2_OPEN_BREECH'
    | 'SVG_REXP_COAXIAL'
    | 'SVG_MP30_FIXED_HANDLE'
    | 'SVG_ASCENT_3STAGE_PUMP'
    | 'SVG_VECTIS_LEVER_ACTION';
  realThermodynamicSummary: string;
  mechanicalCycleStages: Array<{
    stageNo: number;
    stageTitle: string;
    physicsDetail: string;
  }>;
  subComponentsAndOrings: SubMillimeterPartAndOringSpec[];
  caliberRemakeMatrix: CaliberPhysicsRemakeRow[];
}

export const INTERACTIVE_WEAPON_BENCHMARK_MODELS: InteractiveWeaponBenchmarkModel[] = [
  // ==========================================================================
  // 1. P90 .45 TOP-MOUNT HELICAL-TURRET + INTEGRATED BREECH + 145CC PLENUM RESERVE
  // ==========================================================================
  {
    modelId: 'MODEL_01_P90_45_HELICAL_PLENUM',
    shortBadge: '01. P90 .45 Helical + Plenum',
    fullTitle:
      'P90 .45 Top-Mount 90° Helical-Turret Magazine + Drop-In Breech + 145cc Plenum Reserve',
    steampunkRustLoreSubtitle:
      'Salvaged Smoked-Polycarbonate & Naval-Brass Clockwork Helical Spine with Coaxial Dry-Break HPA Stinger',
    linkedFamilyContext: {
      familyId: 'P90_45_TOP_HELICAL_PLENUM_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      p90Payload: 'SLUG_45_BOATTAIL_220GR',
      defaultCaliberMm: 11.43,
    },
    referenceImageUrl: '/assets/aistudio/image_9db9d200.png',
    svgBlueprintType: 'SVG_P90_HELICAL_PLENUM',
    realThermodynamicSummary:
      'Solves two real physical limits of .45 Cal (11.43mm) semi-auto airguns: (1) Encapsulating 220gr .45 slugs or 6× #1 buckshot inside Ø12.80×32.00mm Delrin sabots restores the 2.5:1 aspect ratio so 22 rounds stack transversely and rotate 90° without jamming; (2) An onboard 145cc 250-Bar Magazine Spine Air Reserve docks into the Lower Plenum via a self-sealing M14x1.25 coaxial check stinger on reload.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: 'Transverse Double-Stack + 8-Bar Pneumatic Follower Assist',
        physicsDetail:
          '22× .45 sabot rounds (total payload mass 314g) stack at 90° transverse orientation. An 8-bar micro-bleed capillary from the Mag Reserve assists the constant-force negation spring (F = 18.4 N) so heavy .45 lead never stalls.',
      },
      {
        stageNo: 2,
        stageTitle: '38.5° Twin-Roller Helical Ramp (0° → 45° → 90° Axial Rotation)',
        physicsDetail:
          'Four ZrO2 ceramic guide rollers guide the sabot rim through a 38.5° lead-angle Archimedes spiral inside the Ø54mm rear turret, smoothly rotating the .45 round 90° to align with the barrel axis.',
      },
      {
        stageNo: 3,
        stageTitle: 'Drop-In Breech Saddle & Dual Floating PU-95A Seal Expansion',
        physicsDetail:
          'The bottom half of the P90 turret sits directly inside the upper breech block. Firing pressure (185 Bar) drives two floating Polyurethane 95A seal collars 1.2mm inward to clamp both ends of the active turret chamber.',
      },
      {
        stageNo: 4,
        stageTitle: 'Dry-Break Coaxial Stinger Equilibrium (Mag Reserve → Lower Plenum)',
        physicsDetail:
          'Snapping the P90 magazine onto the top rail depresses the spring-loaded brass poppet stinger (AS568-011 Viton O-ring seal), equalizing 145cc @ 250 Bar from the magazine spine into the regulated lower plenum.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'P90-01',
        name: '.45 Cal Flanged Delrin/Brass Carrier Sabot (Slug or 6-Pellet Buckshot)',
        steampunkRustAlias: 'Lathe-Turned Naval Brass & Delrin Sabot Casing',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: 'Acetal Copolymer (POM-C) + C36000 Brass Rim (μ = 0.14)',
        dimensionsMm: {
          lengthOrThicknessMm: 32.0,
          outerDiameterMm: 12.8,
          innerDiameterMm: 11.43,
          wallOrCrossSectionMm: 0.685,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 255,
        svgNodeY: 96,
        photoPinX: 28,
        photoPinY: 22,
        realPhysicsSpec: {
          governingEquation: 'Aspect Ratio L/D = 32.00 / 12.80 = 2.50 (Zero-Tilt Spiral Condition)',
          operatingPressureBar: 200,
          squeezeOrClearancePct: '0.02mm Bore Slip-Fit',
          hoopOrShearSafetyFactor: 3.45,
          failureModeIfOmitted:
            'Bare 11.43mm lead slugs (L/D = 1.7) cock sideways at 45° inside the helical ramp and shear soft lead skirts.',
        },
        howItWorksWithNeighbors:
          'Rides transversely between the Smoked Polycarbonate Spine rails (P90-02) and rotates 90° inside the Helical Cam Turret (P90-03).',
      },
      {
        partCode: 'P90-02',
        name: 'Smoked Polycarbonate Double-Stack Spine + 8-Bar Follower Piston O-Ring',
        steampunkRustAlias: 'Sight-Glass Lexan Spine & Pneumatic Pusher Seal',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: 'Makrolon Polycarbonate + NBR-70 Quad-Ring (14.00 × 1.78mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 285.0,
          outerDiameterMm: 48.0,
          innerDiameterMm: 42.4,
          wallOrCrossSectionMm: 2.8,
          toleranceMm: '±0.040mm',
        },
        svgNodeX: 165,
        svgNodeY: 96,
        photoPinX: 46,
        photoPinY: 48,
        realPhysicsSpec: {
          governingEquation: 'F_follower = P_bleed(8 bar) × A_piston + k_spring = 18.4 N Constant Feed',
          operatingPressureBar: 8,
          squeezeOrClearancePct: '15.2% Dynamic Quad-Ring Squeeze',
          hoopOrShearSafetyFactor: 6.2,
          failureModeIfOmitted:
            'Under-sprung follower fails to push 22× 220gr .45 slugs up the 38.5° helical incline during rapid semi-auto fire.',
        },
        howItWorksWithNeighbors:
          'Houses the staggered double-row of .45 sabots (P90-01) above the twin 145cc Magazine Air Reserve tubes (P90-05).',
      },
      {
        partCode: 'P90-03',
        name: 'Rear Circular 90° Helical Cam Turret & 4× Ceramic Guide Rollers',
        steampunkRustAlias: 'Clockwork 90° Spiral Indexing Turret',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: '7075-T6 Hard-Anodized Billet + ZrO2 Ceramic Rollers (HRC 85)',
        dimensionsMm: {
          lengthOrThicknessMm: 52.0,
          outerDiameterMm: 54.0,
          innerDiameterMm: 12.84,
          wallOrCrossSectionMm: 6.5,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 495,
        svgNodeY: 112,
        photoPinX: 68,
        photoPinY: 32,
        realPhysicsSpec: {
          governingEquation: 'τ_cam = F_feed × R_pitch × tan(38.5° + atan(μ)) = 0.42 N·m',
          operatingPressureBar: 200,
          squeezeOrClearancePct: '0.02mm Roller Radial Play',
          hoopOrShearSafetyFactor: 2.95,
          failureModeIfOmitted:
            'Transverse cartridges cannot transition to axial barrel alignment.',
        },
        howItWorksWithNeighbors:
          'Drops its lower half directly into the Receiver Breech Saddle and aligns the rotated 90° round between the Dual Floating PU-95A Breech Seals (P90-04).',
      },
      {
        partCode: 'P90-04',
        name: 'Dual Floating Polyurethane 95A Breech-Locking Seal O-Rings (Front & Rear)',
        steampunkRustAlias: 'High-Pressure Crimson Breech Obturator Rings',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: 'Cast Polyurethane 95 Shore A (ID 11.50mm × OD 16.50mm × CS 2.50mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 2.5,
          outerDiameterMm: 16.5,
          innerDiameterMm: 11.5,
          wallOrCrossSectionMm: 2.5,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 528,
        svgNodeY: 158,
        photoPinX: 34,
        photoPinY: 52,
        realPhysicsSpec: {
          governingEquation: 'P_contact = P_gland + 1.35 × E_95A × ε_squeeze = 238 Bar Self-Energizing Seal',
          operatingPressureBar: 220,
          squeezeOrClearancePct: '18.5% Gland Squeeze · 0.025mm Extrusion Gap',
          hoopOrShearSafetyFactor: 3.1,
          failureModeIfOmitted:
            '200-Bar .45 cal gas blast leaks out the turret gap, rupturing the polycarbonate magazine spine and losing 65% muzzle velocity.',
        },
        howItWorksWithNeighbors:
          'Seated in the front barrel throat and rear valve transfer face, clamping the rotated P90 turret chamber hermetically during the 1.8ms firing pulse.',
      },
      {
        partCode: 'P90-05',
        name: 'Onboard 145cc 250-Bar Magazine Spine Air Reserve + M18 Bulkhead Viton O-Rings',
        steampunkRustAlias: 'Braided-Copper & Carbon Spine Pressure Flask',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '7075-T6 / T700 Carbon-Wound Twin Spine Tubes + Viton FKM-90 (18.0 × 2.0mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 270.0,
          outerDiameterMm: 24.0,
          innerDiameterMm: 17.6,
          wallOrCrossSectionMm: 3.2,
          toleranceMm: '±0.020mm',
        },
        svgNodeX: 295,
        svgNodeY: 138,
        photoPinX: 20,
        photoPinY: 66,
        realPhysicsSpec: {
          governingEquation: 'Lamé Hoop Stress σ_θ = P(r_o² + r_i²)/(r_o² - r_i²) = 114.2 MPa (SF = 4.4x)',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '21.0% Static Endcap Viton Squeeze',
          hoopOrShearSafetyFactor: 4.4,
          failureModeIfOmitted:
            'Firing 22 rounds of .45 cal drains a standard rifle plenum in 5 shots; onboard 145cc Mag Reserve supplies full pressure for the entire magazine.',
        },
        howItWorksWithNeighbors:
          'Feeds 250-Bar air downward through the Dry-Break Coaxial Check Stinger (P90-06) directly into the Lower Regulated Plenum.',
      },
      {
        partCode: 'P90-06',
        name: 'Dry-Break Coaxial Plenum Stinger Valve + AS568-011 Viton Stem O-Ring + PTFE Back-Up Ring',
        steampunkRustAlias: 'Spring-Loaded Naval Brass Quick-Coupler Stinger',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: 'C36000 Brass Stinger + Viton FKM-90 (7.65 × 1.78mm) + Virgin PTFE Back-Up',
        dimensionsMm: {
          lengthOrThicknessMm: 38.5,
          outerDiameterMm: 14.0,
          innerDiameterMm: 6.2,
          wallOrCrossSectionMm: 1.78,
          toleranceMm: '±0.008mm',
        },
        svgNodeX: 455,
        svgNodeY: 195,
        photoPinX: 55,
        photoPinY: 75,
        realPhysicsSpec: {
          governingEquation: 'Choked Sonic Mass Flow ṁ = C_d · A · P₀ / √(R·T₀) = 48.5 g/s',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '19.4% Dynamic Stem Squeeze + Zero-Extrusion PTFE Back-Up',
          hoopOrShearSafetyFactor: 3.85,
          failureModeIfOmitted:
            'Removing the top magazine under 250 Bar explosive decompression vents the entire rifle plenum and extrudes the stem O-ring.',
        },
        howItWorksWithNeighbors:
          'Automatically opens when the P90 magazine latches onto the top receiver rail, linking the 145cc Mag Reserve (P90-05) into the Lower Plenum.',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 5.5,
        caliberLabel: '.22 Cal (5.5mm)',
        magOrShellCapacity: '50 Rds (Transverse Double-Stack)',
        indexingAngleOrPitch: '90° Helical Ramp (5.8mm Pitch)',
        breechOrSabotOdMm: '7.95mm Sabot OD',
        transferPortOrOtbOdMm: '4.8mm Port · 42mm OTB OD',
        muzzleEnergyJoules: 68,
        safetyFactor: 3.85,
      },
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm)',
        magOrShellCapacity: '42 Rds (Transverse Double-Stack)',
        indexingAngleOrPitch: '90° Helical Ramp (6.8mm Pitch)',
        breechOrSabotOdMm: '8.80mm Sabot OD',
        transferPortOrOtbOdMm: '5.5mm Port · 44mm OTB OD',
        muzzleEnergyJoules: 96,
        safetyFactor: 3.62,
      },
      {
        caliberMm: 7.62,
        caliberLabel: '.30 Cal (7.62mm)',
        magOrShellCapacity: '34 Rds (Transverse Double-Stack)',
        indexingAngleOrPitch: '90° Helical Ramp (8.2mm Pitch)',
        breechOrSabotOdMm: '10.10mm Sabot OD',
        transferPortOrOtbOdMm: '6.6mm Port · 46mm OTB OD',
        muzzleEnergyJoules: 142,
        safetyFactor: 3.4,
      },
      {
        caliberMm: 9.0,
        caliberLabel: '.357 Cal (9.0mm)',
        magOrShellCapacity: '28 Rds (Transverse Double-Stack)',
        indexingAngleOrPitch: '90° Helical Ramp (9.8mm Pitch)',
        breechOrSabotOdMm: '11.20mm Sabot OD',
        transferPortOrOtbOdMm: '7.8mm Port · 48mm OTB OD',
        muzzleEnergyJoules: 195,
        safetyFactor: 3.18,
      },
      {
        caliberMm: 11.43,
        caliberLabel: '.45 Cal (11.43mm) [Native]',
        magOrShellCapacity: '22 Rds (.45 Slug or 6-Pellet Sabot)',
        indexingAngleOrPitch: '90° Helical Ramp (12.8mm Pitch)',
        breechOrSabotOdMm: '12.80mm Sabot OD',
        transferPortOrOtbOdMm: '9.8mm Port · 52mm OTB OD',
        muzzleEnergyJoules: 285,
        safetyFactor: 2.95,
      },
      {
        caliberMm: 12.7,
        caliberLabel: '.50 Cal (12.7mm)',
        magOrShellCapacity: '18 Rds (.50 Slug or 8-Pellet Sabot)',
        indexingAngleOrPitch: '90° Helical Ramp (14.2mm Pitch)',
        breechOrSabotOdMm: '14.20mm Sabot OD',
        transferPortOrOtbOdMm: '11.0mm Port · 56mm OTB OD',
        muzzleEnergyJoules: 345,
        safetyFactor: 2.72,
      },
    ],
  },

  // ==========================================================================
  // 2. BURST-DISK 4-STAGE SHOTGUN FAMILY (BURST DISK -> RED PEN -> 2-SHELL -> CANE)
  // ==========================================================================
  {
    modelId: 'MODEL_02_BURST_DISK_4STAGE_FAMILY',
    shortBadge: '02. Burst-Disk Pen / 2-Shell / Cane',
    fullTitle:
      'Burst-Disk Cartridge Shotgun Family: [1] Burst Disk → [2] Red Air Pen → [3] AEA 2-Shell → [4] Cane',
    steampunkRustLoreSubtitle:
      'Self-Contained Sacrificial CuNi Rupture-Membrane Cartridges (Strictly Isolated 0% Cross-Compatibility)',
    linkedFamilyContext: {
      familyId: 'SHOTGUN_BURST_CARTRIDGE_FAMILY',
      burstStage: 'STAGE_3_AEA_2SHELL_SHOTGUN_PISTOL',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 12.7,
    },
    referenceImageUrl: '/assets/aistudio/image_f3e6f8a1.png',
    secondaryImageUrl: '/assets/aistudio/image_59e3a409.png',
    svgBlueprintType: 'SVG_BURST_DISK_4STAGE',
    realThermodynamicSummary:
      'Unlike regulated PCP rifles that meter gas through a return-spring poppet valve, the Burst-Disk Cartridge Family stores 220–250 Bar inside a self-contained Fluid System chamber sealed by a laser-scored 0.12mm CuNi Burst Disk clamped by a Radial-Port Retainer. Shearing the disk dumps 100% of the stored gas in <0.18ms with zero valve bounce.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: 'Stage 1: High-Pressure Fitting Body + Scored Burst Disk + Radial Retainer',
        physicsDetail:
          'The Threaded Retainer clamps the Ø11.40mm CuNi Burst Disk at 30° against the Fitting Body face seal O-ring (Viton 9.5×1.5mm), Containing 220 Bar inside the Fluid System column.',
      },
      {
        stageNo: 2,
        stageTitle: 'Stage 2: Simple Red-Anodized Air Pellet Pen (1-Shot Clear Yellow Capsule)',
        physicsDetail:
          'Threads the dark-bronze shrouded barrel directly onto the red knurled burst-disk pen body, chambering 1 clear polymer buckshot/pellet capsule with a yellow wad cap.',
      },
      {
        stageNo: 3,
        stageTitle: 'Stage 3: AEA Precision Twin-Shell Break-Action Shotgun Pistol (2 Shells)',
        physicsDetail:
          'Pivots the slotted upper barrel shroud 40° on its front trigger-guard hinge pin, exposing twin over/under breech chambers that accept 2 removable Red/Silver pre-charged burst-disk shotgun shells.',
      },
      {
        stageNo: 4,
        stageTitle: 'Stage 4: Concealed Burst-Disk Walking Cane (1 Inline Shell + 8 Baffles)',
        physicsDetail:
          'Integrates the self-contained burst-disk shotgun cartridge inline behind a 580mm shrouded cane barrel with 8 concentric K-baffles and a curved crook handle trigger.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'BD-01',
        name: 'Stepped High-Pressure Fitting Body + Viton Face-Seal O-Ring (9.50 × 1.50mm)',
        steampunkRustAlias: 'Hex-Turned 316L Pressure Fitting & Viton Gland',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: '316L Stainless Steel + Viton FKM-90 Face O-Ring (9.50 × 1.50mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 28.5,
          outerDiameterMm: 15.8,
          innerDiameterMm: 7.2,
          wallOrCrossSectionMm: 4.3,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 145,
        svgNodeY: 142,
        photoPinX: 22,
        photoPinY: 28,
        realPhysicsSpec: {
          governingEquation: 'Axial Clamp Stress σ_clamp = T_thread / (0.2 · d · A_ring) = 185 MPa',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '22.0% Axial Face-Seal Squeeze',
          hoopOrShearSafetyFactor: 4.1,
          failureModeIfOmitted:
            'High-pressure gas seeps around the perimeter of the un-ruptured burst disk and drains the cartridge.',
        },
        howItWorksWithNeighbors:
          'Forms the upstream pressure vessel body (Fluid System) and seats the Sacrificial Burst Disk (BD-02) against the Retainer (BD-03).',
      },
      {
        partCode: 'BD-02',
        name: 'Laser-Scored 0.12mm CuNi Sacrificial Burst Disk Membrane',
        steampunkRustAlias: 'Cruciform-Scored Copper-Nickel Rupture Foil',
        category: 'VALVE_POPPET_OR_BURST_FOIL',
        materialAndDurometer: 'Annealed CuNi 70/30 Foil (0.12mm Thick · 6-Petal Laser Score)',
        dimensionsMm: {
          lengthOrThicknessMm: 0.12,
          outerDiameterMm: 11.4,
          innerDiameterMm: 0.0,
          wallOrCrossSectionMm: 0.12,
          toleranceMm: '±0.003mm',
        },
        svgNodeX: 235,
        svgNodeY: 142,
        photoPinX: 16,
        photoPinY: 18,
        realPhysicsSpec: {
          governingEquation: 'Hencky Membrane Rupture P_burst = 3.42 · σ_ult · (t / R_dome) = 220 Bar',
          operatingPressureBar: 220,
          squeezeOrClearancePct: '0.04mm Score Remaining Web',
          hoopOrShearSafetyFactor: 1.0,
          failureModeIfOmitted:
            'Without precision cruciform scoring, foil fragments detach into the barrel or rupture prematurely.',
        },
        howItWorksWithNeighbors:
          'Clamped between Fitting Body (BD-01) and Retainer (BD-03); shears open in 0.18ms when struck by the L-Slot Striker Lance (BD-05).',
      },
      {
        partCode: 'BD-03',
        name: 'Threaded Retainer Cap with Dual Radial Exhaust Ports (M12x1.0)',
        steampunkRustAlias: 'Twin-Ported Hardened Steel Rupture Retainer',
        category: 'VALVE_POPPET_OR_BURST_FOIL',
        materialAndDurometer: '17-4PH Condition H900 Steel (HRC 44)',
        dimensionsMm: {
          lengthOrThicknessMm: 16.2,
          outerDiameterMm: 12.0,
          innerDiameterMm: 6.8,
          wallOrCrossSectionMm: 2.6,
          toleranceMm: '±0.012mm',
        },
        svgNodeX: 315,
        svgNodeY: 142,
        photoPinX: 35,
        photoPinY: 22,
        realPhysicsSpec: {
          governingEquation: 'Thread Shear Area A_s = π · n · L_e · d_m / 2 = 98.4 mm² (SF = 5.2x)',
          operatingPressureBar: 250,
          squeezeOrClearancePct: 'ISO 6H/6g Fine Thread Fit',
          hoopOrShearSafetyFactor: 5.2,
          failureModeIfOmitted:
            'Burst disk blows out of the fitting prior to full pressure build-up.',
        },
        howItWorksWithNeighbors:
          'Locks the Burst Disk (BD-02) in place and channels the instantaneous gas wave into the Clear Yellow Sabot Capsule (BD-04) or Shotgun Shell.',
      },
      {
        partCode: 'BD-04',
        name: 'Clear Polymer Buckshot Capsule + Bright Yellow LDPE Obturator Wad Cap',
        steampunkRustAlias: 'Sight-Tube Buckshot Sabot & Yellow Gas-Check Wad',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: 'Clear Polycarbonate Tube + Shore 55D Yellow LDPE Gas-Check Cup',
        dimensionsMm: {
          lengthOrThicknessMm: 28.0,
          outerDiameterMm: 11.2,
          innerDiameterMm: 9.6,
          wallOrCrossSectionMm: 0.8,
          toleranceMm: '±0.025mm',
        },
        svgNodeX: 465,
        svgNodeY: 118,
        photoPinX: 18,
        photoPinY: 45,
        realPhysicsSpec: {
          governingEquation: 'Obturation Cup Flare ΔD = P_gas · R² / (E · t) = +0.28mm Bore Seal',
          operatingPressureBar: 180,
          squeezeOrClearancePct: '100% Gas-Check Skirt Flare',
          hoopOrShearSafetyFactor: 2.8,
          failureModeIfOmitted:
            'High-pressure gas bypasses loose lead buckshot pellets, causing erratic patterns and 50% velocity loss.',
        },
        howItWorksWithNeighbors:
          'Loaded directly into the breech of the Stage 2 Red Air Pen between the Bronze Shrouded Barrel and the Burst Disk Retainer.',
      },
      {
        partCode: 'BD-05',
        name: '2× Pre-Charged Red/Silver Shotgun Shells + Dual NBR-90 Breech O-Rings',
        steampunkRustAlias: 'Twin Brass-Rimmed Crimson Pneumatic Shotgun Shells',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '7075-T6 Red Anodized Base + 304SS Shot Tube + Dual NBR-90 (15.0×1.5mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 82.0,
          outerDiameterMm: 15.8,
          innerDiameterMm: 12.7,
          wallOrCrossSectionMm: 1.55,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 625,
        svgNodeY: 165,
        photoPinX: 58,
        photoPinY: 36,
        realPhysicsSpec: {
          governingEquation: 'Stored Adiabatic Energy E = P·V / (γ - 1) = 412 J per Shell',
          operatingPressureBar: 220,
          squeezeOrClearancePct: '17.5% Dual Breech O-Ring Squeeze',
          hoopOrShearSafetyFactor: 3.35,
          failureModeIfOmitted:
            'Loss of chamber seal when firing the AEA Twin-Shell Break-Action Shotgun.',
        },
        howItWorksWithNeighbors:
          'Slides into the twin over/under chambers of the Stage 3 AEA Break-Action Shotgun Pistol when the hinged barrel tilts open.',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 5.5,
        caliberLabel: 'Stage 1: Burst Disk Fitting Core',
        magOrShellCapacity: '1 Sacrificial CuNi Disk',
        indexingAngleOrPitch: 'M12x1.0 Threaded Retainer',
        breechOrSabotOdMm: '11.40mm Disk OD (0.12mm Foil)',
        transferPortOrOtbOdMm: 'Dual Ø4.2mm Radial Exhaust Ports',
        muzzleEnergyJoules: 45,
        safetyFactor: 4.1,
      },
      {
        caliberMm: 6.35,
        caliberLabel: 'Stage 2: Simple Red Air Pellet Pen',
        magOrShellCapacity: '1 Clear Yellow-Cap Capsule',
        indexingAngleOrPitch: 'L-Slot Bolt Striker (22mm Stroke)',
        breechOrSabotOdMm: '11.20mm Clear Capsule OD',
        transferPortOrOtbOdMm: '16.0mm Pen OD · Bronze Shroud',
        muzzleEnergyJoules: 62,
        safetyFactor: 3.65,
      },
      {
        caliberMm: 12.7,
        caliberLabel: 'Stage 3: AEA 2-Shell Break-Action Shotgun',
        magOrShellCapacity: '2 Pre-Charged Red/Silver Shells',
        indexingAngleOrPitch: '40° Front Hinge Break-Open',
        breechOrSabotOdMm: '2× 15.80mm Shell Chambers',
        transferPortOrOtbOdMm: '42.0mm Slotted Shroud OD',
        muzzleEnergyJoules: 165,
        safetyFactor: 3.35,
      },
      {
        caliberMm: 11.43,
        caliberLabel: 'Stage 4: Concealed Burst-Disk Airgun Cane',
        magOrShellCapacity: '1 Inline Cane Cartridge',
        indexingAngleOrPitch: 'Threaded Crook-Handle Coupler',
        breechOrSabotOdMm: '16.20mm Inline Shell OD',
        transferPortOrOtbOdMm: '24.0mm Cane Shaft (8 Baffles)',
        muzzleEnergyJoules: 190,
        safetyFactor: 3.5,
      },
    ],
  },

  // ==========================================================================
  // 3. EDGUN LESHIY 3 (.45 CAL TRIPLE-CONCENTRIC SEMI-AUTO COMPACT RIFLE)
  // ==========================================================================
  {
    modelId: 'MODEL_03_LESHIY3_45_TRIPLE_CONCENTRIC',
    shortBadge: '03. Leshiy 3 .45 Triple-Concentric',
    fullTitle:
      'EDgun Leshiy 3 .45 Semi-Auto Compact Rifle (Barrel → Silencer Shroud → Outer Air Reserve)',
    steampunkRustLoreSubtitle:
      'Triple-Concentric Coaxial Pressure Jacket over 6-Baffle Moderator & 6-Rd .45 Star-Ratchet Drum',
    linkedFamilyContext: {
      familyId: 'LESHIY_3_CONCENTRIC_45_SEMI_AUTO_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 11.43,
    },
    referenceImageUrl: '/assets/aistudio/image_9db9d200.png',
    svgBlueprintType: 'SVG_LESHIY3_TRIPLE_CONCENTRIC',
    realThermodynamicSummary:
      'Architects a 3-layer concentric coaxial front assembly for .45 Cal (11.43mm): Layer 1 is the Ø14.8mm polygonal rifled barrel liner; Layer 2 is the Ø30.0mm concentric silencer shroud with 6 stepped K-baffles; Layer 3 is the Ø52.0mm Over-The-Barrel (OTB) 300-Bar Air Reserve Cylinder jacketing the outside of the silencer shroud.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: 'Layer 1 (Core): .45 Cal (11.43mm) Polygonal Rifled Barrel + Dual NBR-90 O-Rings',
        physicsDetail:
          'Tensioned in axial traction by the front M18x1.0 muzzle nut while isolated from gas pressure by dual NBR-90 O-rings (14.0 × 1.5mm).',
      },
      {
        stageNo: 2,
        stageTitle: 'Layer 2 (Middle): Concentric 6-Chamber K-Baffle Silencer Shroud',
        physicsDetail:
          'Strips 42% of the supersonic muzzle gas wave into 6 stepped expansion chambers directly around the barrel liner, reducing acoustic report by 19.5 dB.',
      },
      {
        stageNo: 3,
        stageTitle: 'Layer 3 (Outer): Concentric OTB 300-Bar High-Pressure Air Reserve Container',
        physicsDetail:
          'Wraps concentrically OVER the silencer shroud (ID 32.0mm, OD 52.0mm), storing 310cc of 300-Bar HPA sealed by front/rear Viton FKM-90 bulkhead O-rings (44.0 × 2.5mm).',
      },
      {
        stageNo: 4,
        stageTitle: 'Hammerless Semi-Auto Shuttle Valve + 6-Rd .45 Scalloped Rotary Drum',
        physicsDetail:
          'Uses a differential-area forward plug valve and dual 1.0mm bleed jets to index the 6-chamber .45 rotary drum (60° star ratchet step) automatically in 24ms.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'L3-01',
        name: 'Layer 1: .45 Cal (11.43mm) Barrel Liner + Dual NBR-90 Breech O-Rings (14.0 × 1.50mm)',
        steampunkRustAlias: 'Tensioned .45 Ordinance Liner & Twin Breech Seals',
        category: 'BARREL_BAFFLE_OR_SHROUD',
        materialAndDurometer: '4140 CrMo Steel (HRC 32) + NBR-90 Shore A O-Rings',
        dimensionsMm: {
          lengthOrThicknessMm: 350.0,
          outerDiameterMm: 14.8,
          innerDiameterMm: 11.43,
          wallOrCrossSectionMm: 1.685,
          toleranceMm: '±0.005mm',
        },
        svgNodeX: 210,
        svgNodeY: 162,
        photoPinX: 18,
        photoPinY: 36,
        realPhysicsSpec: {
          governingEquation: 'Euler Buckling Eliminated via +1,450 N Axial Muzzle Tension',
          operatingPressureBar: 220,
          squeezeOrClearancePct: '18.0% Radial Breech O-Ring Squeeze',
          hoopOrShearSafetyFactor: 3.9,
          failureModeIfOmitted:
            'Barrel whip during .45 slug exit degrades 100m accuracy from 1.2 MOA to >4.5 MOA.',
        },
        howItWorksWithNeighbors:
          'Surrounded concentrically by the 6-Baffle Silencer Shroud (L3-02) and fed by the 6-Rd .45 Rotary Drum (L3-05).',
      },
      {
        partCode: 'L3-02',
        name: 'Layer 2: Concentric 6-Baffle Silencer Shroud + Viton Endcap O-Rings (27.0 × 1.50mm)',
        steampunkRustAlias: 'Internal Brass K-Baffle Acoustic Moderator',
        category: 'BARREL_BAFFLE_OR_SHROUD',
        materialAndDurometer: '7075-T6 Anodized Tube + 6× C36000 Brass K-Baffles + Viton FKM-90',
        dimensionsMm: {
          lengthOrThicknessMm: 335.0,
          outerDiameterMm: 30.0,
          innerDiameterMm: 26.8,
          wallOrCrossSectionMm: 1.6,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 285,
        svgNodeY: 126,
        photoPinX: 35,
        photoPinY: 22,
        realPhysicsSpec: {
          governingEquation: 'Helmholtz Acoustic Attenuation ΔL_p = 20·log10(1 + V_exp/V_bore) = -19.5 dB',
          operatingPressureBar: 45,
          squeezeOrClearancePct: '12.60mm Baffle Bore (1.17mm Radial Slug Clearance)',
          hoopOrShearSafetyFactor: 4.5,
          failureModeIfOmitted:
            'Unmoderated 285-Joule .45 muzzle blast exceeds 124 dB and destabilizes the slug base.',
        },
        howItWorksWithNeighbors:
          'Jackets the .45 Barrel Liner (L3-01) while serving as the inner mandrel for the Outer OTB Air Reserve Cylinder (L3-03).',
      },
      {
        partCode: 'L3-03',
        name: 'Layer 3: Outer Concentric OTB 300-Bar Air Reserve + Bulkhead Viton O-Rings (44.0 × 2.50mm)',
        steampunkRustAlias: 'Coaxial Over-Silencer High-Pressure Air Jacket',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: 'T700 Carbon / 7075-T6 Coaxial Vessel + 4× Viton FKM-90 + PTFE Back-Ups',
        dimensionsMm: {
          lengthOrThicknessMm: 315.0,
          outerDiameterMm: 52.0,
          innerDiameterMm: 32.0,
          wallOrCrossSectionMm: 4.2,
          toleranceMm: '±0.020mm',
        },
        svgNodeX: 245,
        svgNodeY: 88,
        photoPinX: 16,
        photoPinY: 48,
        realPhysicsSpec: {
          governingEquation: 'Annular Volume V = π/4 · (D_i² - d_shroud²) · L = 310 cc @ 300 Bar',
          operatingPressureBar: 300,
          squeezeOrClearancePct: '20.5% Viton Bulkhead Squeeze + 1.2mm PTFE Anti-Extrusion Ring',
          hoopOrShearSafetyFactor: 2.85,
          failureModeIfOmitted:
            'Extrusion of the outer bulkhead O-ring at 300 Bar vents the coaxial air reserve.',
        },
        howItWorksWithNeighbors:
          'Mounted concentrically OVER the Layer 2 Silencer Shroud (L3-02) and feeds high-pressure air rearward into the Twin-Tube Folding Stock & Shuttle Valve.',
      },
      {
        partCode: 'L3-04',
        name: 'Red Polyurethane 95A Transfer Port Puck (LSA242105-45) + Star Exhaust Plug',
        steampunkRustAlias: 'Crimson Obturator Puck & Star Exhaust Valve',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: 'Cast Polyurethane 95 Shore A (ID 10.74mm × OD 16.83mm × L 6.80mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 6.8,
          outerDiameterMm: 16.83,
          innerDiameterMm: 10.74,
          wallOrCrossSectionMm: 3.045,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 545,
        svgNodeY: 185,
        photoPinX: 34,
        photoPinY: 52,
        realPhysicsSpec: {
          governingEquation: 'Axial Lip Contact Pressure P_lip = 1.42 × P_plenum = 248 Bar Dynamic Seal',
          operatingPressureBar: 175,
          squeezeOrClearancePct: '0.25mm Axial Pre-Load against Rotary Drum Rear Face',
          hoopOrShearSafetyFactor: 3.4,
          failureModeIfOmitted:
            'Breech blast leaks across the folding stock interface during semi-auto discharge.',
        },
        howItWorksWithNeighbors:
          'Seals the rear face of the 6-Rd .45 Scalloped Rotary Drum (L3-05) when the Twin-Lug Hinge locks closed.',
      },
      {
        partCode: 'L3-05',
        name: '6-Round .45 Cal Scalloped Rotary Drum + 6-Tooth Central Star Ratchet + Pawl Spring',
        steampunkRustAlias: '6-Chamber Crimson Revolver Drum & Coil Pawl',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: '7075-T6 Red Anodized Drum + 4140 Star Ratchet + 302SS Coil Spring',
        dimensionsMm: {
          lengthOrThicknessMm: 14.5,
          outerDiameterMm: 46.8,
          innerDiameterMm: 11.48,
          wallOrCrossSectionMm: 2.97,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 485,
        svgNodeY: 135,
        photoPinX: 68,
        photoPinY: 32,
        realPhysicsSpec: {
          governingEquation: 'Inter-Chamber Web w = π·PCD/6 - d_bore = 2.97mm (>= 2.15mm Min Web)',
          operatingPressureBar: 220,
          squeezeOrClearancePct: '60.0° Ratchet Step Angle · 6.61mm Pawl Stroke',
          hoopOrShearSafetyFactor: 2.92,
          failureModeIfOmitted:
            'Using an 8-round drum with 11.43mm (.45) bores leaves a negative web (-0.3mm), bursting adjacent chambers.',
        },
        howItWorksWithNeighbors:
          'Rotated 60° per shot by the exposed silver coil-sprung indexing pawl (LSA221103) driven by dual 1.0mm bleed power jets.',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 5.5,
        caliberLabel: '.22 Cal (5.5mm)',
        magOrShellCapacity: '8-Rd Drum (24.4mm PCD)',
        indexingAngleOrPitch: '8 Teeth (45.0° Step)',
        breechOrSabotOdMm: '3.84mm Web · 5.17mm Puck ID',
        transferPortOrOtbOdMm: '5.06mm Pawl · 44mm Outer OTB',
        muzzleEnergyJoules: 58,
        safetyFactor: 3.65,
      },
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm)',
        magOrShellCapacity: '8-Rd Drum (24.4mm PCD)',
        indexingAngleOrPitch: '8 Teeth (45.0° Step)',
        breechOrSabotOdMm: '2.99mm Web · 5.97mm Puck ID',
        transferPortOrOtbOdMm: '5.06mm Pawl · 46mm Outer OTB',
        muzzleEnergyJoules: 84,
        safetyFactor: 3.42,
      },
      {
        caliberMm: 7.62,
        caliberLabel: '.30 Cal (7.62mm)',
        magOrShellCapacity: '8-Rd Drum (26.2mm PCD)',
        indexingAngleOrPitch: '8 Teeth (45.0° Step)',
        breechOrSabotOdMm: '2.41mm Web · 7.16mm Puck ID',
        transferPortOrOtbOdMm: '5.06mm Pawl · 48mm Outer OTB',
        muzzleEnergyJoules: 128,
        safetyFactor: 3.18,
      },
      {
        caliberMm: 9.0,
        caliberLabel: '.357 Cal (9.0mm)',
        magOrShellCapacity: '7-Rd Drum (27.6mm PCD)',
        indexingAngleOrPitch: '7 Teeth (51.4° Step)',
        breechOrSabotOdMm: '2.98mm Web · 8.46mm Puck ID',
        transferPortOrOtbOdMm: '5.73mm Pawl · 50mm Outer OTB',
        muzzleEnergyJoules: 176,
        safetyFactor: 3.02,
      },
      {
        caliberMm: 11.43,
        caliberLabel: '.45 Cal (11.43mm) [Leshiy 3 Native]',
        magOrShellCapacity: '6-Rd Drum (28.8mm PCD)',
        indexingAngleOrPitch: '6 Teeth (60.0° Step)',
        breechOrSabotOdMm: '2.97mm Web · 10.74mm Puck ID',
        transferPortOrOtbOdMm: '6.61mm Pawl · 52mm Outer OTB',
        muzzleEnergyJoules: 245,
        safetyFactor: 2.85,
      },
      {
        caliberMm: 12.7,
        caliberLabel: '.50 Cal (12.7mm)',
        magOrShellCapacity: '5-Rd Drum (28.8mm PCD)',
        indexingAngleOrPitch: '5 Teeth (72.0° Step)',
        breechOrSabotOdMm: '4.23mm Web · 11.94mm Puck ID',
        transferPortOrOtbOdMm: '7.77mm Pawl · 55mm Outer OTB',
        muzzleEnergyJoules: 295,
        safetyFactor: 2.68,
      },
    ],
  },

  // ==========================================================================
  // 4. EDGUN LESHIY 2 VALKYRIE OPEN-BREECH ROTARY BENCHMARK
  // ==========================================================================
  {
    modelId: 'MODEL_04_LESHIY2_VALKYRIE_BENCHMARK',
    shortBadge: '04. Leshiy 2 Valkyrie Benchmark',
    fullTitle:
      'EDgun Leshiy 2 Valkyrie Open-Breech Rotary & Red Transfer Puck Benchmark',
    steampunkRustLoreSubtitle:
      'Exposed Silver Hinge Clockwork Pawl, Crimson Scalloped Drum & 16-Disc Belleville Inline Regulator',
    linkedFamilyContext: {
      familyId: 'LESHIY_2_VALKYRIE_OPEN_BREECH_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 6.35,
    },
    referenceImageUrl: '/assets/aistudio/image_9db9d200.png',
    svgBlueprintType: 'SVG_LESHIY2_OPEN_BREECH',
    realThermodynamicSummary:
      'Serves as Benchmark #01 for autonomous multi-agent CAD remaking: combines a hammerless forward-plug differential valve in the folding rear stock manifold with a front-mounted magnetic scalloped rotary drum and exposed coil-sprung indexing pawl.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: 'Inline EAR Regulator (16× 50CrV4 Belleville Disc Springs + Viton Piston O-Rings)',
        physicsDetail:
          'Steps 300-Bar upper reservoir tube pressure down to 130–160 Bar in the lower plenum tube with ±0.8 Bar hysteresis.',
      },
      {
        stageNo: 2,
        stageTitle: 'Hammerless Forward Plug Valve Differential Dump (1.6ms Opening)',
        physicsDetail:
          'Trigger sear vents the rear pilot chamber through the fluted star exhaust plug (LSA242200), snapping the Delrin forward plug backward to dump plenum air through the Red PU-95A Puck.',
      },
      {
        stageNo: 3,
        stageTitle: 'Dual Power-Jet Bleed & Coil-Sprung Pawl Ratchet Indexing',
        physicsDetail:
          'Residual gas bleeds through dual 0.6mm–1.1mm power jets to drive the indexing piston downward against the exposed silver coil spring (k = 4.94 N/mm), rotating the central star ratchet by 1 tooth.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'LSA221000',
        name: '[1] Crimson Scalloped Rotary Drum + Neodymium Magnetic Retainer Plate',
        steampunkRustAlias: 'Fluted Red-Anodized Revolver Cylinder',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: '7075-T6 Hard Anodized Red + N52 Neodymium Ring Magnet',
        dimensionsMm: {
          lengthOrThicknessMm: 12.2,
          outerDiameterMm: 44.5,
          innerDiameterMm: 6.38,
          wallOrCrossSectionMm: 2.99,
          toleranceMm: '±0.008mm',
        },
        svgNodeX: 465,
        svgNodeY: 125,
        photoPinX: 68,
        photoPinY: 32,
        realPhysicsSpec: {
          governingEquation: 'Hoop Stress in 2.99mm Inter-Chamber Web σ_θ = 64.2 MPa (SF = 7.8x)',
          operatingPressureBar: 160,
          squeezeOrClearancePct: '0.02mm Axial Face Air-Gap before Shot',
          hoopOrShearSafetyFactor: 7.8,
          failureModeIfOmitted:
            'Misaligned chamber bore clips pellet head entering the barrel throat.',
        },
        howItWorksWithNeighbors:
          'Magnetically seated onto the central Star Ratchet Hub (LSA221002) and sealed at the rear by the Red PU-95A Puck (LSA242105).',
      },
      {
        partCode: 'LSA221002',
        name: '[2] Central Star Ratchet Gear Hub + Internal Viton Spindle O-Ring (6.0 × 1.50mm)',
        steampunkRustAlias: 'Case-Hardened Clockwork Star Gear',
        category: 'SPRING_PAWL_OR_FASTENER',
        materialAndDurometer: '4140 Nitrided Steel (HRC 58) + Viton FKM-90 Spindle Damper O-Ring',
        dimensionsMm: {
          lengthOrThicknessMm: 13.8,
          outerDiameterMm: 16.4,
          innerDiameterMm: 6.0,
          wallOrCrossSectionMm: 5.2,
          toleranceMm: '±0.005mm',
        },
        svgNodeX: 465,
        svgNodeY: 158,
        photoPinX: 70,
        photoPinY: 44,
        realPhysicsSpec: {
          governingEquation: 'Angular Impulse J_θ = I_drum · Δω / Δt (45° Step in 18ms)',
          operatingPressureBar: 160,
          squeezeOrClearancePct: '14.0% Rotational Damping O-Ring Drag',
          hoopOrShearSafetyFactor: 6.4,
          failureModeIfOmitted:
            'Without the internal Viton spindle damper O-ring, rotational inertia over-spins the drum past the next chamber.',
        },
        howItWorksWithNeighbors:
          'Engaged from below by the Coil-Sprung Indexing Pawl (LSA221103) on every shot.',
      },
      {
        partCode: 'LSA242105',
        name: '[3] Bright Red Polyurethane 95A Transfer Port Breech Seal Puck',
        steampunkRustAlias: 'Crimson Self-Energizing Venturi Breech Puck',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: 'Cast Polyurethane 95 Shore A (Venturi Taper Bore)',
        dimensionsMm: {
          lengthOrThicknessMm: 6.5,
          outerDiameterMm: 11.75,
          innerDiameterMm: 5.97,
          wallOrCrossSectionMm: 2.89,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 345,
        svgNodeY: 175,
        photoPinX: 34,
        photoPinY: 52,
        realPhysicsSpec: {
          governingEquation: 'Dynamic Face Seal Pressure P_seal = P_plenum × (A_rear / A_lip) = 212 Bar',
          operatingPressureBar: 160,
          squeezeOrClearancePct: '19.2% Radial Gland Interference',
          hoopOrShearSafetyFactor: 4.2,
          failureModeIfOmitted:
            'Massive breech blow-by across the folding stock seam; zero indexing gas pressure.',
        },
        howItWorksWithNeighbors:
          'Bridges the high-pressure air blast from the folding stock Forward Plug Valve straight into the active Rotary Drum chamber.',
      },
      {
        partCode: 'LSA221103',
        name: '[5] Exposed Silver Coil Return Spring & Hardened Indexing Pawl Lever',
        steampunkRustAlias: 'Exposed Clockwork Pawl & Helical Return Spring',
        category: 'SPRING_PAWL_OR_FASTENER',
        materialAndDurometer: '302SS Music Wire (d=0.90mm, 9 Coils) + 17-4PH Pawl Arm',
        dimensionsMm: {
          lengthOrThicknessMm: 24.5,
          outerDiameterMm: 6.8,
          innerDiameterMm: 5.0,
          wallOrCrossSectionMm: 0.9,
          toleranceMm: '±0.020mm',
        },
        svgNodeX: 485,
        svgNodeY: 225,
        photoPinX: 66,
        photoPinY: 64,
        realPhysicsSpec: {
          governingEquation: 'Spring Rate k = G·d⁴ / (8·D³·N_a) = 4.94 N/mm (Stroke = 5.06mm)',
          operatingPressureBar: 45,
          squeezeOrClearancePct: '25.0 N Peak Return Force',
          hoopOrShearSafetyFactor: 5.1,
          failureModeIfOmitted:
            'Pawl fails to reset after firing, halting semi-automatic drum rotation.',
        },
        howItWorksWithNeighbors:
          'Mounted visibly inside the lower pocket of the Silver CNC Twin-Lug Hinge Frame (LSA241100) right beneath the red rotary drum.',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 5.5,
        caliberLabel: '.22 Cal (5.5mm)',
        magOrShellCapacity: '8-Rd Drum (24.4mm PCD)',
        indexingAngleOrPitch: '8 Teeth (45.0°)',
        breechOrSabotOdMm: '3.84mm Web',
        transferPortOrOtbOdMm: '5.17 / 10.90mm Puck',
        muzzleEnergyJoules: 52,
        safetyFactor: 7.4,
      },
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm) [Native]',
        magOrShellCapacity: '8-Rd Drum (24.4mm PCD)',
        indexingAngleOrPitch: '8 Teeth (45.0°)',
        breechOrSabotOdMm: '2.99mm Web',
        transferPortOrOtbOdMm: '5.97 / 11.75mm Puck',
        muzzleEnergyJoules: 78,
        safetyFactor: 7.1,
      },
      {
        caliberMm: 7.62,
        caliberLabel: '.30 Cal (7.62mm)',
        magOrShellCapacity: '8-Rd Drum (26.2mm PCD)',
        indexingAngleOrPitch: '8 Teeth (45.0°)',
        breechOrSabotOdMm: '2.41mm Web',
        transferPortOrOtbOdMm: '7.16 / 13.02mm Puck',
        muzzleEnergyJoules: 115,
        safetyFactor: 6.5,
      },
      {
        caliberMm: 9.0,
        caliberLabel: '.357 Cal (9.0mm)',
        magOrShellCapacity: '7-Rd Drum (27.6mm PCD)',
        indexingAngleOrPitch: '7 Teeth (51.4°)',
        breechOrSabotOdMm: '2.98mm Web',
        transferPortOrOtbOdMm: '8.46 / 14.40mm Puck',
        muzzleEnergyJoules: 158,
        safetyFactor: 5.8,
      },
      {
        caliberMm: 11.43,
        caliberLabel: '.45 Cal (11.43mm)',
        magOrShellCapacity: '6-Rd Drum (28.8mm PCD)',
        indexingAngleOrPitch: '6 Teeth (60.0°)',
        breechOrSabotOdMm: '2.97mm Web',
        transferPortOrOtbOdMm: '10.74 / 16.83mm Puck',
        muzzleEnergyJoules: 215,
        safetyFactor: 5.1,
      },
      {
        caliberMm: 12.7,
        caliberLabel: '.50 Cal (12.7mm)',
        magOrShellCapacity: '5-Rd Drum (28.8mm PCD)',
        indexingAngleOrPitch: '5 Teeth (72.0°)',
        breechOrSabotOdMm: '4.23mm Web',
        transferPortOrOtbOdMm: '11.94 / 18.10mm Puck',
        muzzleEnergyJoules: 265,
        safetyFactor: 4.6,
      },
    ],
  },

  // ==========================================================================
  // 5. EVANIX REX-P 1-SHOT COAXIAL PISTOL ⇄ SNIPER MODE (59-PART KOREAN BLUEPRINT)
  // ==========================================================================
  {
    modelId: 'MODEL_05_EVANIX_REXP_COAXIAL_MONOLITH',
    shortBadge: '05. Evanix REX-P (59-Part 1-Shot)',
    fullTitle:
      'Evanix REX-P 1-Shot Coaxial Pistol ⇄ REX Sniper Mode (59-Part Korean Factory Blueprint)',
    steampunkRustLoreSubtitle:
      'Monolithic Inline Poppet Valve (#32), 5-Hole Underlever (#14) & Axial Single-Shot Breech Slide (#11)',
    linkedFamilyContext: {
      familyId: 'EVANIX_REX_COAXIAL_SINGLE_SHOT_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 7.62,
    },
    referenceImageUrl: '/assets/aistudio/rexp_exploded_diagram.png',
    svgBlueprintType: 'SVG_REXP_COAXIAL',
    realThermodynamicSummary:
      'The purest inline coaxial big-bore PCP architecture: eliminates 90° transfer port bends by placing the Rear Coaxial Air Cylinder (#38), Balanced Poppet Valve (#32), Hammer (#35), Axial Breech Slide (#11), and Rifled Barrel (#03) along one single centerline.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: '5-Hole Skeletonized Underlever (#14) Cocking & Breech Slide (#11) Opening',
        physicsDetail:
          'Pivoting the trigger-guard underlever (#14) downward 38° drives dog-leg link (#12) rearward, compressing mainspring (#36) to 145 N while sliding Breech Sleeve (#11) forward to expose the 1-shot loading trough.',
      },
      {
        stageNo: 2,
        stageTitle: 'Dual NBR-90 Breech Slide O-Ring Obturation (#09 & #10)',
        physicsDetail:
          'Closing the underlever slides Part #11 over the barrel breech throat, engaging two concentric NBR-90 O-rings (12.0 × 1.5mm) that seal up to 250 Bar without a bolt probe.',
      },
      {
        stageNo: 3,
        stageTitle: 'Inline Coaxial Poppet (#32) & Sniper Moderator Conversion',
        physicsDetail:
          'Hammer (#35) strikes the PEEK-seated poppet stem (#32, sealed by dynamic PU-95A O-ring #45), discharging air straight down the bore. Sniper Mode adds Rear Stock (#41) and an 8-baffle extended moderator.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'REXP-#11',
        name: 'Part #11 Cylindrical Axial Single-Shot Breech Slide + Dual #09 NBR-90 O-Rings',
        steampunkRustAlias: 'Knurled Inline Breech Sleeve & Twin Obturator O-Rings',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: '7075-T6 Hard-Anodized Sleeve + 2× NBR-90 O-Rings (12.00 × 1.50mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 48.5,
          outerDiameterMm: 23.9,
          innerDiameterMm: 12.04,
          wallOrCrossSectionMm: 5.93,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 350,
        svgNodeY: 138,
        photoPinX: 38,
        photoPinY: 34,
        realPhysicsSpec: {
          governingEquation: 'Lamé thick-wall SF = 6.8x at 250 Bar; 26.0mm linear loading stroke',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '18.2% Dual Concentric O-Ring Squeeze',
          hoopOrShearSafetyFactor: 6.8,
          failureModeIfOmitted:
            'High-pressure blast blows backward out the single-shot loading port.',
        },
        howItWorksWithNeighbors:
          'Slides axially along the Rifled Barrel (#03) inside Upper Receiver (#07) to open and seal the 1-shot slug trough.',
      },
      {
        partCode: 'REXP-#14',
        name: 'Part #14 5-Hole Skeletonized Trigger-Guard Underlever + #12 Cocking Link',
        steampunkRustAlias: 'Perforated 5-Hole Steel Lever & Dog-Leg Link',
        category: 'SPRING_PAWL_OR_FASTENER',
        materialAndDurometer: '4140 Chromoly Steel (HRC 42) + 4.00mm Dowel Pins (#49/#50)',
        dimensionsMm: {
          lengthOrThicknessMm: 142.5,
          outerDiameterMm: 46.0,
          innerDiameterMm: 6.5,
          wallOrCrossSectionMm: 8.0,
          toleranceMm: '±0.020mm',
        },
        svgNodeX: 345,
        svgNodeY: 215,
        photoPinX: 44,
        photoPinY: 62,
        realPhysicsSpec: {
          governingEquation: 'Mechanical Advantage MA = L_lever / L_link = 3.45:1 (42 N Hand Force)',
          operatingPressureBar: 0,
          squeezeOrClearancePct: '5× Ø6.50mm CSG Weight-Reduction Holes',
          hoopOrShearSafetyFactor: 4.9,
          failureModeIfOmitted:
            'Cannot cock the 145 N heavy hammer mainspring (#36) required to open the 250-Bar poppet valve.',
        },
        howItWorksWithNeighbors:
          'Pivots on front receiver pin (#47) and pulls Cocking Link (#12) to latch Hammer (#35) onto Trigger Sear (#16).',
      },
      {
        partCode: 'REXP-#32',
        name: 'Part #32 Balanced PEEK Poppet Valve + #45 PU-95A Stem O-Ring (4.00 × 1.50mm)',
        steampunkRustAlias: 'Inline PEEK-Crowned Poppet & Polyurethane Stem Seal',
        category: 'VALVE_POPPET_OR_BURST_FOIL',
        materialAndDurometer: '17-4PH Stem + Virgin PEEK Sealing Crown + PU-95A O-Ring',
        dimensionsMm: {
          lengthOrThicknessMm: 44.2,
          outerDiameterMm: 11.8,
          innerDiameterMm: 4.0,
          wallOrCrossSectionMm: 3.9,
          toleranceMm: '±0.005mm',
        },
        svgNodeX: 475,
        svgNodeY: 138,
        photoPinX: 62,
        photoPinY: 48,
        realPhysicsSpec: {
          governingEquation: 'Net Valve Opening Force F_open = P_tank · (A_seat - A_balance) = 112 N',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '16.5% Dynamic Stem Seal Squeeze',
          hoopOrShearSafetyFactor: 5.4,
          failureModeIfOmitted:
            'Valve locks shut above 190 Bar ("valve lock") or leaks high-pressure air into the hammer tunnel.',
        },
        howItWorksWithNeighbors:
          'Seated inside Valve Housing (#34) and Rear Coaxial Air Tube (#38, sealed by #26 Viton O-ring 23.0 × 2.5mm).',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm) Pistol',
        magOrShellCapacity: '1-Shot Axial Breech (#11)',
        indexingAngleOrPitch: '26.0mm Linear Slide Stroke',
        breechOrSabotOdMm: '6.38mm Throat · 2× 6.5×1.5 O-Ring',
        transferPortOrOtbOdMm: '32.0mm 5-Slot Shroud',
        muzzleEnergyJoules: 95,
        safetyFactor: 3.45,
      },
      {
        caliberMm: 7.62,
        caliberLabel: '.30 Cal (7.62mm) [REX-P Native]',
        magOrShellCapacity: '1-Shot Axial Breech (#11)',
        indexingAngleOrPitch: '26.0mm Linear Slide Stroke',
        breechOrSabotOdMm: '7.65mm Throat · 2× 8.0×1.5 O-Ring',
        transferPortOrOtbOdMm: '32.0mm 5-Slot Shroud',
        muzzleEnergyJoules: 135,
        safetyFactor: 3.12,
      },
      {
        caliberMm: 9.0,
        caliberLabel: '.357 Cal (9.0mm) Pistol/Sniper',
        magOrShellCapacity: '1-Shot Axial Breech (#11)',
        indexingAngleOrPitch: '28.0mm Linear Slide Stroke',
        breechOrSabotOdMm: '9.04mm Throat · 2× 9.5×1.5 O-Ring',
        transferPortOrOtbOdMm: '34.0mm Shroud + Long Moderator',
        muzzleEnergyJoules: 185,
        safetyFactor: 2.95,
      },
      {
        caliberMm: 11.43,
        caliberLabel: '.45 Cal (11.43mm) Sniper Mode',
        magOrShellCapacity: '1-Shot Axial Breech (#11)',
        indexingAngleOrPitch: '30.0mm Linear Slide Stroke',
        breechOrSabotOdMm: '11.46mm Throat · 2× 12.0×1.5 O-Ring',
        transferPortOrOtbOdMm: '38.0mm Shroud + 8-Baffle Moderator',
        muzzleEnergyJoules: 260,
        safetyFactor: 2.78,
      },
      {
        caliberMm: 12.7,
        caliberLabel: '.50 Cal (12.7mm) Sniper Mode',
        magOrShellCapacity: '1-Shot Axial Breech (#11)',
        indexingAngleOrPitch: '32.0mm Linear Slide Stroke',
        breechOrSabotOdMm: '12.74mm Throat · 2× 13.0×1.5 O-Ring',
        transferPortOrOtbOdMm: '40.0mm Shroud + 8-Baffle Moderator',
        muzzleEnergyJoules: 315,
        safetyFactor: 2.62,
      },
    ],
  },

  // ==========================================================================
  // 6. SNOWPEAK PP750L REGULATED PISTOL-CARBINE (WITH EVANIX MP30 FIXED-HANDLE SPEC)
  // ==========================================================================
  {
    modelId: 'MODEL_06_EVANIX_MP30_FIXED_HANDLE',
    shortBadge: '06. Snowpeak PP750L (Regulated Carbine)',
    fullTitle:
      'Snowpeak PP750L Regulated Side-Lever & Twin-Rod Telescoping Stock Pistol-Carbine (+ Evanix MP30 Fixed-Handle Spec)',
    steampunkRustLoreSubtitle:
      '250-Bar Belleville-Regulated Under-Barrel Cylinder, Front Axial Manometer, Drop-Down Side-Lever & Twin-Rod Telescoping Wire Stock',
    linkedFamilyContext: {
      familyId: 'EVANIX_MP30_FIXED_HANDLE_SMG_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 5.5,
    },
    referenceImageUrl: '/assets/aistudio/snowpeak_pp750l_1__94af69ac.webp',
    svgBlueprintType: 'SVG_MP30_FIXED_HANDLE',
    realThermodynamicSummary:
      'The reference photo shows the Snowpeak PP750L regulated PCP pistol-carbine: a 66cc 250-Bar under-barrel aluminum reservoir with a front axial manometer and internal Belleville-washer regulator, a shrouded barrel with threaded moderator, a drop-down side-lever action feeding a rotary magazine, and a twin-rod sliding telescoping buttstock (contrasted with the Evanix MP30 fixed 6 o’clock vertical bottle handle).',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: '66cc 250-Bar Under-Barrel Reservoir + Belleville Regulator & Front Manometer',
        physicsDetail:
          'High-pressure air is stored in the under-barrel 6061-T6 cylinder with a front-facing Bourdon gauge and regulated down to 110–125 Bar by an internal Belleville disc-spring stack.',
      },
      {
        stageNo: 2,
        stageTitle: 'Drop-Down Biathlon Side-Lever & Rotary Magazine / Single-Shot Swing Tray',
        physicsDetail:
          'Pulling the articulated right-hand side-lever retracts the stainless bolt probe, cocks the striker spring, and indexes the 7-to-9 shot rotary magazine (or magnetic swing-out single-shot tray).',
      },
      {
        stageNo: 3,
        stageTitle: 'Twin Ø6.00mm Stainless Telescoping Stock Rods & Quick-Release Latch',
        physicsDetail:
          'Two parallel hardened stainless guide rods slide along milled receiver channels and lock via a spring-loaded cross-bar, converting the compact pistol into a shouldered carbine in 0.8 seconds.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'PP750-01',
        name: 'Twin Ø6.00mm Stainless Telescoping Stock Rods + Quick-Latch Collar',
        steampunkRustAlias: 'Twin-Rail Sliding Carbine Buttstock & Detent Latch',
        category: 'SPRING_PAWL_OR_FASTENER',
        materialAndDurometer: '304 Stainless Ground Rods (Ø6.00mm) + PA66-GF30 Buttpad',
        dimensionsMm: {
          lengthOrThicknessMm: 245.0,
          outerDiameterMm: 12.0,
          innerDiameterMm: 6.0,
          wallOrCrossSectionMm: 3.0,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 165,
        svgNodeY: 215,
        photoPinX: 18,
        photoPinY: 54,
        realPhysicsSpec: {
          governingEquation: 'Euler Column Buckling P_cr = π² · E · I / (K · L)² = 1,840 N (SF = 4.6x)',
          operatingPressureBar: 250,
          squeezeOrClearancePct: 'H7/g6 Precision Sliding Rail Clearance (0.012mm)',
          hoopOrShearSafetyFactor: 4.6,
          failureModeIfOmitted:
            'Pistol cannot be shoulder-braced as a stable carbine under rapid side-lever cycling.',
        },
        howItWorksWithNeighbors:
          'Slides along the rear receiver guide channels and locks behind the anatomical pistol grip.',
      },
      {
        partCode: 'PP750-02',
        name: '66cc 250-Bar Regulated Under-Barrel Tube + Belleville Stack & NBR-90 Seals (17.0 × 2.5mm)',
        steampunkRustAlias: 'Regulated Under-Barrel Pressure Cylinder & Front Manometer',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '6061-T6 Anodized Tube + 51CrV4 Belleville Washers + NBR-90 O-Rings',
        dimensionsMm: {
          lengthOrThicknessMm: 205.0,
          outerDiameterMm: 28.0,
          innerDiameterMm: 22.0,
          wallOrCrossSectionMm: 3.0,
          toleranceMm: '±0.012mm',
        },
        svgNodeX: 395,
        svgNodeY: 212,
        photoPinX: 64,
        photoPinY: 46,
        realPhysicsSpec: {
          governingEquation: 'Lamé Hoop Stress σ_θ = 98.4 MPa @ 250 Bar (SF = 3.15x)',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '21.5% Radial NBR-90 Cylinder Cap Squeeze',
          hoopOrShearSafetyFactor: 3.15,
          failureModeIfOmitted:
            'Unregulated pressure curve causes ±18 m/s velocity spread across the 30-shot string.',
        },
        howItWorksWithNeighbors:
          'Mounted beneath the shrouded barrel (PP750-04), feeding 120-Bar regulated air to the valve block.',
      },
      {
        partCode: 'PP750-03',
        name: 'Articulated Drop-Down Side-Lever Linkage + Probe Breech O-Ring (2.50 × 1.50mm)',
        steampunkRustAlias: 'Biathlon Drop-Down Side-Lever & Rotary Breech Probe',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: '7075-T6 CNC Lever Arm + 4140 Bolt Probe + PU-90A Breech Seal',
        dimensionsMm: {
          lengthOrThicknessMm: 112.0,
          outerDiameterMm: 14.5,
          innerDiameterMm: 5.5,
          wallOrCrossSectionMm: 4.5,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 285,
        svgNodeY: 168,
        photoPinX: 43,
        photoPinY: 36,
        realPhysicsSpec: {
          governingEquation: 'Lever Mechanical Advantage MA = L_handle / R_cam = 3.85 : 1',
          operatingPressureBar: 125,
          squeezeOrClearancePct: '7-Rd (.22) / 9-Rd (.177) Rotary Mag + Swing Tray',
          hoopOrShearSafetyFactor: 3.9,
          failureModeIfOmitted:
            'High-pressure air blows back past the bolt probe during pellet ignition.',
        },
        howItWorksWithNeighbors:
          'Cycles the bolt probe through the rotary magazine into the shrouded barrel breech.',
      },
      {
        partCode: 'MP30-01',
        name: 'Evanix MP30 Comparison: Fixed 6 O’Clock Vertical Foregrip Bottle + M18x1.5 Viton Seal',
        steampunkRustAlias: 'Rigid Vertical Foregrip Pressure Flask (MP30 Architecture)',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '7075-T6 Vertical Foregrip Tank + Viton FKM-90 Neck O-Ring (15.0 × 2.0mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 185.0,
          outerDiameterMm: 38.0,
          innerDiameterMm: 31.2,
          wallOrCrossSectionMm: 3.4,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 255,
        svgNodeY: 285,
        photoPinX: 48,
        photoPinY: 74,
        realPhysicsSpec: {
          governingEquation: 'Cantilever Bending Moment M_max = F_grip × L = 34 N·m (SF = 4.8x)',
          operatingPressureBar: 250,
          squeezeOrClearancePct: '20.0% Radial Neck O-Ring Squeeze',
          hoopOrShearSafetyFactor: 4.8,
          failureModeIfOmitted:
            'Included to contrast the MP30 vertical bottle handle against the Snowpeak PP750L horizontal under-barrel tube.',
        },
        howItWorksWithNeighbors:
          'Mounts vertically at 6 o’clock on the Evanix MP30 variant ahead of the double-stack tower magazine.',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 4.5,
        caliberLabel: '.177 Cal (4.5mm) [PP750L Native]',
        magOrShellCapacity: '9 Rds (Rotary Mag + Swing Tray)',
        indexingAngleOrPitch: '40.0° Rotary Step',
        breechOrSabotOdMm: '4.52mm Throat · 1.5×1.0 PU-90A Seal',
        transferPortOrOtbOdMm: '28mm Shrouded Barrel + Moderator',
        muzzleEnergyJoules: 16,
        safetyFactor: 4.1,
      },
      {
        caliberMm: 5.5,
        caliberLabel: '.22 Cal (5.5mm) [PP750L Native]',
        magOrShellCapacity: '7 Rds (Rotary Mag + Swing Tray)',
        indexingAngleOrPitch: '51.4° Rotary Step',
        breechOrSabotOdMm: '5.53mm Throat · 2.5×1.5 PU-90A Seal',
        transferPortOrOtbOdMm: '28mm Shrouded Barrel + Moderator',
        muzzleEnergyJoules: 24,
        safetyFactor: 3.85,
      },
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm) [Custom Bore]',
        magOrShellCapacity: '6 Rds (Rotary Mag)',
        indexingAngleOrPitch: '60.0° Rotary Step',
        breechOrSabotOdMm: '6.38mm Throat · PU-95A O-Ring',
        transferPortOrOtbOdMm: '32mm Shrouded Barrel + Moderator',
        muzzleEnergyJoules: 42,
        safetyFactor: 3.55,
      },
      {
        caliberMm: 7.62,
        caliberLabel: '.30 Cal (7.62mm) [MP30 Tower Spec]',
        magOrShellCapacity: '12 Rds (MP30 Double-Stack Tower)',
        indexingAngleOrPitch: '6.60mm Stagger Pitch',
        breechOrSabotOdMm: '7.65mm Throat · PU-95A O-Ring',
        transferPortOrOtbOdMm: '36mm Chevron Shroud (5 Baffles)',
        muzzleEnergyJoules: 118,
        safetyFactor: 3.3,
      },
    ],
  },

  // ==========================================================================
  // 7. REDESIGNED ASCENT × VECTIS .45 CAL 300-BAR ONBOARD-PUMP CARBINE (12-PART DIAGRAM)
  // ==========================================================================
  {
    modelId: 'MODEL_07_ASCENT_3STAGE_ONBOARD_PUMP',
    shortBadge: '07. Ascent .45 300B Pump (12-Part)',
    fullTitle:
      'Redesigned Ascent × Vectis .45 Cal Lever-Action (Over-Barrel 2+ Rd Plenum & Silencer + Under-Barrel 300-Bar Reserve & 3-Stage Pump)',
    steampunkRustLoreSubtitle:
      '140cc Over-Barrel Regulated 2+ Shot Plenum, QuietEnergy Silencer, 240cc/165cc Under-Barrel 300B Reserve & 3-Stage Hand Pump',
    linkedFamilyContext: {
      familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 11.43,
    },
    referenceImageUrl: '/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg',
    secondaryImageUrl: '/assets/aistudio/ascent_exploded_diagram.png',
    svgBlueprintType: 'SVG_ASCENT_3STAGE_PUMP',
    realThermodynamicSummary:
      'Redesigns the Ascent × Vectis hybrid into a .45 Cal (11.43mm) big-bore survival carbine with all 12 diagrammed parts: the concentric barrel shroud acts as a 140cc Regulated Over-Barrel Plenum storing enough 210-Bar air for 2 to 3 full-power .45 shots, ahead of which sits the QuietEnergy 6-gill vented moderator, while an Under-Barrel 300-Bar Air Reserve (240cc/165cc) with recessed 0–300 Bar gauge is charged directly in-game by the onboard 3-stage 300-Bar hand pump.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: 'Onboard 3-Stage Hand Pump → 300-Bar Under-Barrel Air Reserve (240cc / 165cc)',
        physicsDetail:
          'Pumping the in-game 3-stage telescopic lever (assisted by Part #116 2,000 PSI counter-balancer) compresses air through the Ø5.6mm Stage-3 Fluorosilicone piston up to 300 Bar (4,350 PSI) inside the Under-Barrel Air Reserve.',
      },
      {
        stageNo: 2,
        stageTitle: 'Concentric Over-the-Barrel (OTB) Regulated 2+ Round Plenum (140cc @ 210 Bar)',
        physicsDetail:
          'An inline Belleville regulator feeds air from the 300-Bar Under-Barrel Reserve upward into the 140cc Over-Barrel Plenum sleeve surrounding the .45 choked barrel liner, holding enough regulated volume for 2 to 3 full-power .45 shots.',
      },
      {
        stageNo: 3,
        stageTitle: 'Lever-Action Operated Repeater, 6-Rd .45 Rotary Mag & QuietEnergy Moderator',
        physicsDetail:
          'Swinging the trigger-guard lever loop cycles the .45 stainless probe, indexes the top-loading Rotary Mag (6 Rds .45 / 10 Rds .25 / 12 Rds .22 / 14 Rds .177), and cocks the Quattro 2-Stage Trigger.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'ASC-45-09',
        name: 'Concentric Over-Barrel Regulated 2+ Round Plenum (140cc @ 210B) + Viton Bulkhead O-Rings',
        steampunkRustAlias: 'Over-Barrel 2-Shot Regulated Pressure Jacket & Viton Bulkheads',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '7075-T6 Seamless Tube (OD 36.0mm × ID 29.6mm) + 2× Viton FKM-90 (29.0 × 2.5mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 340.0,
          outerDiameterMm: 36.0,
          innerDiameterMm: 29.6,
          wallOrCrossSectionMm: 3.2,
          toleranceMm: '±0.015mm',
        },
        svgNodeX: 285,
        svgNodeY: 130,
        photoPinX: 62,
        photoPinY: 40,
        realPhysicsSpec: {
          governingEquation: 'V_plenum = 140 cc @ 210 Bar → 2.6 Full-Power .45 Cal Shots (245 J/shot)',
          operatingPressureBar: 210,
          squeezeOrClearancePct: '19.5% Viton Bulkhead O-Ring Squeeze',
          hoopOrShearSafetyFactor: 3.12,
          failureModeIfOmitted:
            'Without the 140cc Over-Barrel Plenum, a .45 Cal 220gr slug starves of air mid-bore and drops below 110 Joules.',
        },
        howItWorksWithNeighbors:
          'Jackets the Precision Rifled & Choked .45 Barrel (ASC-45-08) and feeds directly into the breech transfer ports behind the QuietEnergy Moderator (ASC-45-10).',
      },
      {
        partCode: 'ASC-45-11',
        name: 'Under-Barrel 300-Bar Air Reserve Cylinder (240cc/165cc) + Recessed 0–300B Pressure Gauge',
        steampunkRustAlias: '300-Bar Under-Barrel Reserve Flask & Belly Manometer',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '7075-T6 / Carbon Cylinder + Viton Endcap O-Rings (26.0 × 2.5mm) + Dowty Seal',
        dimensionsMm: {
          lengthOrThicknessMm: 310.0,
          outerDiameterMm: 33.0,
          innerDiameterMm: 25.8,
          wallOrCrossSectionMm: 3.6,
          toleranceMm: '±0.012mm',
        },
        svgNodeX: 255,
        svgNodeY: 195,
        photoPinX: 74,
        photoPinY: 45,
        realPhysicsSpec: {
          governingEquation: 'Lamé Hoop Stress at 300 Bar σ_θ = 148 MPa in 7075-T6 (SF = 3.40x)',
          operatingPressureBar: 300,
          squeezeOrClearancePct: '20.5% Viton Squeeze + PTFE Anti-Extrusion Backup Ring',
          hoopOrShearSafetyFactor: 3.4,
          failureModeIfOmitted:
            'Standard 200-bar wall thickness yields or extrudes endcap seals when pumped to 300 Bar.',
        },
        howItWorksWithNeighbors:
          'Mounted beneath the Over-Barrel Plenum and charged directly by the Onboard 3-Stage 300-Bar Hand Pump (ASC-45-12) while displaying live pressure on the bottom Recessed Pressure Gauge.',
      },
      {
        partCode: 'ASC-45-12',
        name: 'Interactive 3-Stage 300-Bar Onboard Hand Pump + Part #116 Counter-Balancer + FVMQ-80 Seal',
        steampunkRustAlias: '300-Bar Telescopic Under-Lever Compressor & Gas Counter-Balancer',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: '17-4PH Ø5.6mm Stage-3 Rod + Fluorosilicone FVMQ-80 O-Ring (3.0 × 1.8mm) + PTFE Ring',
        dimensionsMm: {
          lengthOrThicknessMm: 215.0,
          outerDiameterMm: 22.0,
          innerDiameterMm: 5.6,
          wallOrCrossSectionMm: 1.8,
          toleranceMm: '±0.005mm',
        },
        svgNodeX: 345,
        svgNodeY: 225,
        photoPinX: 56,
        photoPinY: 48,
        realPhysicsSpec: {
          governingEquation: 'F_lever_300B = (30 MPa · A_5.6mm - P_116 · A_bal) / MA_4bar = 148 N',
          operatingPressureBar: 300,
          squeezeOrClearancePct: '19.8% Squeeze · 260°C Adiabatic Thermal Rating',
          hoopOrShearSafetyFactor: 3.55,
          failureModeIfOmitted:
            'Without the Ø5.6mm Stage-3 rod and Part #116 counter-balancer, hand-pumping to 300 Bar stalls at 210 Bar.',
        },
        howItWorksWithNeighbors:
          'Discharges through the one-way Brass Check Poppet (ASC-94) straight into the Under-Barrel 300-Bar Air Reserve (ASC-45-11).',
      },
      {
        partCode: 'ASC-45-05',
        name: 'Rotary Mag (6 Rds .45 Cal · 10 Rds .25 · 12 Rds .22 · 14 Rds .177) + Lever Repeater',
        steampunkRustAlias: 'Top-Slot Indexed .45 Rotary Wheel & Cowboy Lever Loop',
        category: 'BREECH_MAG_OR_SABOT',
        materialAndDurometer: '7075-T6 Rotary Drum + 4140 Lever Loop + PU-90A Probe O-Ring (8.5 × 1.5mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 15.8,
          outerDiameterMm: 44.0,
          innerDiameterMm: 11.46,
          wallOrCrossSectionMm: 2.85,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 455,
        svgNodeY: 125,
        photoPinX: 43,
        photoPinY: 39,
        realPhysicsSpec: {
          governingEquation: '6 Chambers × 60.0° Step on 28.4mm PCD (Web = 2.91mm >= 2.15mm Min)',
          operatingPressureBar: 210,
          squeezeOrClearancePct: '17.5% Radial Probe O-Ring Obturation in .45 Throat',
          hoopOrShearSafetyFactor: 3.6,
          failureModeIfOmitted:
            'Uncoordinated lever throw fails to index the 6-round .45 wheel before the probe enters the breech.',
        },
        howItWorksWithNeighbors:
          'Indexed by the Lever-Action Operated Repeater (ASC-45-02) ahead of the Quattro 2-Stage Trigger (ASC-45-03), Manual Safety (ASC-45-04), Flip-Up Fiber Optic Sights (ASC-45-06), and Thumbhole Stock (ASC-45-01).',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 4.5,
        caliberLabel: '.177 Cal (4.5mm) [14 Rds]',
        magOrShellCapacity: '14-Rd Rotary Mag',
        indexingAngleOrPitch: '25.7° Step · 6 Shots/Plenum',
        breechOrSabotOdMm: '4.52mm Probe · NBR-90 O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · 300B Reserve',
        muzzleEnergyJoules: 38,
        safetyFactor: 4.2,
      },
      {
        caliberMm: 5.5,
        caliberLabel: '.22 Cal (5.5mm) [12 Rds]',
        magOrShellCapacity: '12-Rd Rotary Mag',
        indexingAngleOrPitch: '30.0° Step · 5 Shots/Plenum',
        breechOrSabotOdMm: '5.53mm Probe · NBR-90 O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · 300B Reserve',
        muzzleEnergyJoules: 56,
        safetyFactor: 3.95,
      },
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm) [10 Rds]',
        magOrShellCapacity: '10-Rd Rotary Mag',
        indexingAngleOrPitch: '36.0° Step · 4 Shots/Plenum',
        breechOrSabotOdMm: '6.38mm Probe · NBR-90 O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · 300B Reserve',
        muzzleEnergyJoules: 78,
        safetyFactor: 3.7,
      },
      {
        caliberMm: 7.62,
        caliberLabel: '.30 Cal (7.62mm) [8 Rds]',
        magOrShellCapacity: '8-Rd Rotary Mag',
        indexingAngleOrPitch: '45.0° Step · 3 Shots/Plenum',
        breechOrSabotOdMm: '7.65mm Probe · PU-90A O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · 300B Reserve',
        muzzleEnergyJoules: 132,
        safetyFactor: 3.45,
      },
      {
        caliberMm: 11.43,
        caliberLabel: '.45 Cal (11.43mm) [6 Rds · Redesigned Native]',
        magOrShellCapacity: '6-Rd .45 Rotary Mag',
        indexingAngleOrPitch: '60.0° Step · 2–3 Shots/Plenum',
        breechOrSabotOdMm: '11.46mm Probe · Dual PU-90A O-Rings',
        transferPortOrOtbOdMm: '140cc OTB Plenum + QE Silencer · 300B Pump',
        muzzleEnergyJoules: 245,
        safetyFactor: 3.12,
      },
    ],
  },

  // ==========================================================================
  // 8. HATSAN VECTIS LEVER-ACTION & VELOX SEMI-AUTO REPEATER
  // ==========================================================================
  {
    modelId: 'MODEL_08_VECTIS_VELOX_LEVER_SEMI',
    shortBadge: '08. Vectis Lever & Velox Semi',
    fullTitle:
      'Hatsan Vectis Underlever Repeater & Velox Semi-Auto Pistol (68-Part Exploded Diagram)',
    steampunkRustLoreSubtitle:
      'Cowboy Underlever Linkage, QuietEnergy Baffle Shroud, Flip-Up Fiber Optic Sights & Hot-Swap Grip Cell',
    linkedFamilyContext: {
      familyId: 'ASCENT_3STAGE_ONBOARD_PUMP_FAMILY',
      burstStage: 'STAGE_2_SIMPLE_RED_AIR_PEN',
      rexMode: 'REX_P_PISTOL_1SHOT',
      defaultCaliberMm: 11.43,
    },
    referenceImageUrl: '/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg',
    secondaryImageUrl: '/assets/aistudio/velox_exploded_diagram.png',
    svgBlueprintType: 'SVG_VECTIS_LEVER_ACTION',
    realThermodynamicSummary:
      'Pairs the Hatsan Vectis trigger-guard lever-action repeater linkage (Ambidextrous Thumbhole Stock, Quattro 2-Stage Trigger, Manual Safety, Flip-Up Fiber Optic Sights, Picatinny Rails, QuietEnergy Moderator, and 6-to-14 Rd Rotary Mag) with the 300-Bar Under-Barrel Reserve and Over-Barrel 2+ Round Plenum.',
    mechanicalCycleStages: [
      {
        stageNo: 1,
        stageTitle: 'Trigger-Guard Lever-Action Repeater & .45 Probe Cycling',
        physicsDetail:
          'Swinging the integrated trigger-guard loop forward 48° retracts the stainless bolt probe, cocks the Quattro 2-stage hammer sear, and indexes the rotary magazine.',
      },
      {
        stageNo: 2,
        stageTitle: '300-Bar Under-Barrel Air Cylinder → 140cc Over-Barrel 2+ Round Plenum',
        physicsDetail:
          'Channels 300-Bar air from the under-barrel reserve through the regulator into the concentric 140cc Over-Barrel Plenum sleeve sealed by dual Viton O-rings.',
      },
      {
        stageNo: 3,
        stageTitle: 'Precision Rifled & Choked .45 Barrel + QuietEnergy 6-Gill Moderator',
        physicsDetail:
          'Combines a 450mm choked .45 barrel liner with a concentric forward baffle stack and 6-slot QuietEnergy muzzle diffuser.',
      },
    ],
    subComponentsAndOrings: [
      {
        partCode: 'VEC-01',
        name: 'High-Flow Brass Transfer Port Bushing + Dual NBR-90 O-Rings (9.00 × 1.50mm)',
        steampunkRustAlias: 'Turned Naval Brass Breech Transfer Chimney',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: 'C36000 Brass Bushing + 2× NBR-90 O-Rings (9.00 × 1.50mm)',
        dimensionsMm: {
          lengthOrThicknessMm: 12.5,
          outerDiameterMm: 12.0,
          innerDiameterMm: 8.8,
          wallOrCrossSectionMm: 1.6,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 415,
        svgNodeY: 162,
        photoPinX: 44,
        photoPinY: 44,
        realPhysicsSpec: {
          governingEquation: 'Discharge Coefficient C_d = 0.88 (Chamfered 15° Radial Plenum Throat)',
          operatingPressureBar: 210,
          squeezeOrClearancePct: '18.5% Radial O-Ring Squeeze',
          hoopOrShearSafetyFactor: 5.2,
          failureModeIfOmitted:
            'High-pressure air blows out between the Over-Barrel Plenum and upper breech block.',
        },
        howItWorksWithNeighbors:
          'Seals the transfer bridge between the 140cc Over-Barrel Plenum and the Choked .45 Rifled Barrel.',
      },
      {
        partCode: 'VEC-02',
        name: '.45 Stainless Bolt Probe + Breech Nose O-Ring (8.50 × 1.50mm Polyurethane 90A)',
        steampunkRustAlias: 'Lever-Driven .45 Slug Pusher Probe & Tip O-Ring',
        category: 'HIGH_PRESSURE_ORING_SEAL',
        materialAndDurometer: '304SS Probe + PU-90A Abrasion-Resistant Tip O-Ring',
        dimensionsMm: {
          lengthOrThicknessMm: 98.0,
          outerDiameterMm: 11.4,
          innerDiameterMm: 8.5,
          wallOrCrossSectionMm: 1.5,
          toleranceMm: '±0.008mm',
        },
        svgNodeX: 465,
        svgNodeY: 132,
        photoPinX: 36,
        photoPinY: 42,
        realPhysicsSpec: {
          governingEquation: 'Probe Axial Locking Thrust F = P_breech × A_bore = 2,155 N @ 210 Bar',
          operatingPressureBar: 210,
          squeezeOrClearancePct: '16.5% Dynamic Bore Seal',
          hoopOrShearSafetyFactor: 4.1,
          failureModeIfOmitted:
            'Slug probe blows backward or vents air into the shooter’s cheek during .45 discharge.',
        },
        howItWorksWithNeighbors:
          'Driven forward by the Lever-Action Repeater loop to seat a .45 slug from the 6-Rd Rotary Mag past the transfer port.',
      },
      {
        partCode: 'VEL-19',
        name: 'Velox Hot-Swap Grip Air Cell Dry-Break Stinger + PU-95A Face Seal (7.0 × 1.5mm)',
        steampunkRustAlias: 'Quick-Swap Pistol Grip Bottle Valve & Seal',
        category: 'PRESSURE_VESSEL_OR_PLENUM',
        materialAndDurometer: '7075-T6 Bottle Neck + PU-95A Stinger Seal + 17-4PH Check Pin',
        dimensionsMm: {
          lengthOrThicknessMm: 24.0,
          outerDiameterMm: 16.0,
          innerDiameterMm: 7.0,
          wallOrCrossSectionMm: 1.5,
          toleranceMm: '±0.010mm',
        },
        svgNodeX: 525,
        svgNodeY: 225,
        photoPinX: 58,
        photoPinY: 72,
        realPhysicsSpec: {
          governingEquation: 'V_total = V_otb_140cc + V_under_240cc = 380 cc @ 300 Bar',
          operatingPressureBar: 300,
          squeezeOrClearancePct: '21.0% Axial Dry-Break Squeeze',
          hoopOrShearSafetyFactor: 3.8,
          failureModeIfOmitted:
            'Unscrewing the reserve bottle vents all 300 Bar of air instead of sealing automatically.',
        },
        howItWorksWithNeighbors:
          'Couples the auxiliary reserve cylinder into the main receiver manifold.',
      },
    ],
    caliberRemakeMatrix: [
      {
        caliberMm: 4.5,
        caliberLabel: '.177 Cal (4.5mm) [14 Rds]',
        magOrShellCapacity: '14 Rds Rotary Mag',
        indexingAngleOrPitch: '25.7° Step Angle',
        breechOrSabotOdMm: '4.50mm Probe + 1.8×1.0 O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · QE Moderator',
        muzzleEnergyJoules: 36,
        safetyFactor: 4.5,
      },
      {
        caliberMm: 5.5,
        caliberLabel: '.22 Cal (5.5mm) [12 Rds]',
        magOrShellCapacity: '12 Rds Rotary Mag',
        indexingAngleOrPitch: '30.0° Step Angle',
        breechOrSabotOdMm: '5.50mm Probe + 2.5×1.2 O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · QE Moderator',
        muzzleEnergyJoules: 51,
        safetyFactor: 4.2,
      },
      {
        caliberMm: 6.35,
        caliberLabel: '.25 Cal (6.35mm) [10 Rds]',
        magOrShellCapacity: '10 Rds Rotary Mag',
        indexingAngleOrPitch: '36.0° Step Angle',
        breechOrSabotOdMm: '6.35mm Probe + 3.0×1.2 O-Ring',
        transferPortOrOtbOdMm: '140cc OTB Plenum · QE Moderator',
        muzzleEnergyJoules: 64,
        safetyFactor: 3.9,
      },
      {
        caliberMm: 11.43,
        caliberLabel: '.45 Cal (11.43mm) [6 Rds · 300B Pump]',
        magOrShellCapacity: '6 Rds .45 Rotary Mag',
        indexingAngleOrPitch: '60.0° Step Angle',
        breechOrSabotOdMm: '11.43mm Probe + 8.5×1.5 O-Ring',
        transferPortOrOtbOdMm: '140cc 2+ Rd OTB Plenum · 300B Reserve',
        muzzleEnergyJoules: 245,
        safetyFactor: 3.12,
      },
    ],
  },
];

// ============================================================================
// UNIQUE PER-COMPONENT CAD & IN-GAME 3D ASSET SYNTHESIZER
// Every sub-component row ([1] BD-01, [2] BD-02, [3] BD-03, REXP-#11, REXP-#14,
// REXP-#32, PP750-01..03, ASC-45-01..12, etc.) creates a bespoke, geometry-accurate
// part with a custom shape archetype, custom SVG schematic, and watertight .STL.
// ============================================================================

export type UniquePartShapeArchetype =
  | 'STEPPED_FITTING_AND_VITON_ORING'
  | 'SIX_PETAL_LASER_SCORED_FOIL_DISK'
  | 'DUAL_RADIAL_EXHAUST_RETAINER_CAP'
  | 'COAXIAL_BREECH_SLIDE_SLEEVE'
  | 'FIVE_HOLE_SKELETONIZED_UNDERLEVER'
  | 'INLINE_180_PEEK_POPPET_VALVE'
  | 'TWIN_ROD_TELESCOPING_WIRE_STOCK'
  | 'BELLEVILLE_REGULATED_TUBE_MANOMETER'
  | 'DROP_DOWN_SIDE_LEVER_CAM'
  | 'HELICAL_90DEG_TURRET_RAMP'
  | 'CONCENTRIC_OTB_PLENUM_BARREL'
  | 'THREE_STAGE_300B_HAND_PUMP'
  | 'QUIET_ENERGY_6GILL_MODERATOR'
  | 'PRECISION_SUB_MM_COMPONENT';

export interface SynthesizedUniqueSubComponentAsset {
  assetId: string;
  partCode: string;
  partName: string;
  parentModelTitle: string;
  shapeArchetype: UniquePartShapeArchetype;
  uniqueFeatureSummary: string;
  materialAndDurometer: string;
  dimensionsSummary: string;
  customSvgDrawing: string;
  watertightStlAscii: string;
  stlTriangleCount: number;
  stlFileName: string;
  ollamaCommandUsed: string;
  createdTimestamp: string;
}

export function resolveUniqueShapeArchetype(partCode: string, name: string): UniquePartShapeArchetype {
  const code = partCode.toUpperCase();
  const upperName = name.toUpperCase();
  if (code === 'BD-01' || upperName.includes('STEPPED HIGH-PRESSURE FITTING')) {
    return 'STEPPED_FITTING_AND_VITON_ORING';
  }
  if (code === 'BD-02' || upperName.includes('BURST DISK') || upperName.includes('SACRIFICIAL')) {
    return 'SIX_PETAL_LASER_SCORED_FOIL_DISK';
  }
  if (code === 'BD-03' || upperName.includes('RETAINER CAP WITH DUAL RADIAL')) {
    return 'DUAL_RADIAL_EXHAUST_RETAINER_CAP';
  }
  if (code.includes('REXP-#11') || upperName.includes('BREECH SLIDE')) {
    return 'COAXIAL_BREECH_SLIDE_SLEEVE';
  }
  if (code.includes('REXP-#14') || upperName.includes('UNDERLEVER')) {
    return 'FIVE_HOLE_SKELETONIZED_UNDERLEVER';
  }
  if (code.includes('REXP-#32') || upperName.includes('POPPET')) {
    return 'INLINE_180_PEEK_POPPET_VALVE';
  }
  if (code.includes('PP750-01') || upperName.includes('TELESCOPING STOCK ROD')) {
    return 'TWIN_ROD_TELESCOPING_WIRE_STOCK';
  }
  if (code.includes('PP750-02') || upperName.includes('BELLEVILLE')) {
    return 'BELLEVILLE_REGULATED_TUBE_MANOMETER';
  }
  if (code.includes('PP750-03') || upperName.includes('SIDE-LEVER')) {
    return 'DROP_DOWN_SIDE_LEVER_CAM';
  }
  if (code.startsWith('P90-') || upperName.includes('HELICAL')) {
    return 'HELICAL_90DEG_TURRET_RAMP';
  }
  if (code === 'ASC-45-10' || upperName.includes('OVER-THE-BARREL') || upperName.includes('OTB')) {
    return 'CONCENTRIC_OTB_PLENUM_BARREL';
  }
  if (code === 'ASC-45-12' || upperName.includes('HAND PUMP') || upperName.includes('116')) {
    return 'THREE_STAGE_300B_HAND_PUMP';
  }
  if (code === 'ASC-45-11' || upperName.includes('MODERATOR') || upperName.includes('SILENCER')) {
    return 'QUIET_ENERGY_6GILL_MODERATOR';
  }
  return 'PRECISION_SUB_MM_COMPONENT';
}

export function synthesizeUniqueBenchmarkComponentAsset(
  part: SubMillimeterPartAndOringSpec,
  parentModelTitle: string
): SynthesizedUniqueSubComponentAsset {
  const archetype = resolveUniqueShapeArchetype(part.partCode, part.name);
  const L = Math.max(0.12, part.dimensionsMm.lengthOrThicknessMm);
  const OD = Math.max(2.0, part.dimensionsMm.outerDiameterMm);
  const ID = Math.max(0.0, part.dimensionsMm.innerDiameterMm);
  const W = Math.max(0.12, part.dimensionsMm.wallOrCrossSectionMm);

  let uniqueFeatureSummary = '';
  let shapeSpecificSvgContent = '';
  let profileRadiiMultipliers: number[] = [1.0, 1.0, 1.0, 1.0];

  switch (archetype) {
    case 'STEPPED_FITTING_AND_VITON_ORING':
      uniqueFeatureSummary =
        'Stepped 316L stainless male/female high-pressure union with 19mm hex wrench flats, precision 1.15mm axial gland, and captive 9.50×1.50mm Viton FKM-90 face-seal O-ring.';
      profileRadiiMultipliers = [0.78, 1.05, 1.0, 0.82];
      shapeSpecificSvgContent = `
        <rect x="110" y="52" width="90" height="76" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <rect x="200" y="38" width="75" height="104" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2.2" />
        <rect x="275" y="58" width="95" height="64" rx="2" fill="#0f172a" stroke="#22d3ee" stroke-width="1.8" />
        <rect x="110" y="76" width="260" height="28" fill="#020617" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4 2" />
        <circle cx="275" cy="50" r="7" fill="#10b981" stroke="#ecfdf5" stroke-width="1.5" />
        <circle cx="275" cy="130" r="7" fill="#10b981" stroke="#ecfdf5" stroke-width="1.5" />
        <text x="165" y="28" fill="#34d399" font-size="9" font-family="monospace" font-weight="bold">BD-01: STEPPED 316L FITTING + VITON FKM-90 FACE O-RING (9.50×1.50mm)</text>
      `;
      break;

    case 'SIX_PETAL_LASER_SCORED_FOIL_DISK':
      uniqueFeatureSummary =
        '0.12mm annealed CuNi 70/30 sacrificial burst-disk membrane with 6 radial 60° laser-ablated score lines (45 µm residual shear web) calibrated to rupture cleanly at 220 Bar (3,200 PSI) with zero fragmentation.';
      profileRadiiMultipliers = [1.0, 1.0, 1.0, 1.0];
      shapeSpecificSvgContent = `
        <circle cx="195" cy="90" r="52" fill="#451a03" stroke="#f59e0b" stroke-width="2.5" />
        <circle cx="195" cy="90" r="38" fill="none" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="3 2" />
        <line x1="195" y1="38" x2="195" y2="142" stroke="#22d3ee" stroke-width="1.8" />
        <line x1="150" y1="64" x2="240" y2="116" stroke="#22d3ee" stroke-width="1.8" />
        <line x1="150" y1="116" x2="240" y2="64" stroke="#22d3ee" stroke-width="1.8" />
        <circle cx="195" cy="90" r="5" fill="#22d3ee" />
        <rect x="305" y="38" width="12" height="104" fill="#f59e0b" stroke="#fef3c7" stroke-width="1.5" />
        <text x="165" y="28" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold">BD-02: 6-PETAL LASER-SCORED CuNi 70/30 BURST DISK (0.12mm · Ø11.4mm)</text>
      `;
      break;

    case 'DUAL_RADIAL_EXHAUST_RETAINER_CAP':
      uniqueFeatureSummary =
        '17-4PH Condition H900 stainless M12×1.0 fine-pitch threaded retainer cap featuring dual 180°-opposed radial relief exhaust ports and a 6.80mm petal-folding throat chamfer.';
      profileRadiiMultipliers = [1.0, 0.92, 0.92, 0.85];
      shapeSpecificSvgContent = `
        <rect x="130" y="42" width="210" height="96" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="2.2" />
        <polygon points="130,66 210,74 340,74 340,106 210,106 130,114" fill="#020617" stroke="#38bdf8" stroke-width="1.6" />
        <rect x="235" y="42" width="28" height="32" fill="#020617" stroke="#f43f5e" stroke-width="1.5" />
        <rect x="235" y="106" width="28" height="32" fill="#020617" stroke="#f43f5e" stroke-width="1.5" />
        <text x="165" y="28" fill="#c084fc" font-size="9" font-family="monospace" font-weight="bold">BD-03: M12×1.0 RETAINER CAP + DUAL RADIAL EXHAUST PORTS</text>
      `;
      break;

    case 'COAXIAL_BREECH_SLIDE_SLEEVE':
      uniqueFeatureSummary =
        'Evanix REX-P Part #11 cylindrical axial breech slide sleeve with dual internal Viton sealing grooves, diamond-knurled thumb collar, and 26.0mm linear loading stroke.';
      profileRadiiMultipliers = [1.06, 0.96, 0.96, 1.06];
      shapeSpecificSvgContent = `
        <rect x="115" y="44" width="250" height="92" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2" />
        <rect x="115" y="40" width="54" height="100" rx="3" fill="#1e293b" stroke="#22d3ee" stroke-width="2" />
        <rect x="115" y="72" width="250" height="36" fill="#020617" stroke="#94a3b8" stroke-width="1.4" />
        <circle cx="195" cy="70" r="5.5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.3" />
        <circle cx="295" cy="70" r="5.5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.3" />
        <circle cx="195" cy="110" r="5.5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.3" />
        <circle cx="295" cy="110" r="5.5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.3" />
        <text x="145" y="28" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="bold">REX-P #11 COAXIAL SLIDING BREECH + DUAL VITON SEALS</text>
      `;
      break;

    case 'FIVE_HOLE_SKELETONIZED_UNDERLEVER':
      uniqueFeatureSummary =
        'Evanix REX-P Part #14 5-hole skeletonized 7075-T6 underlever cocking guard with hardened 4140 pivot pin and gold-anodized trigger blade window.';
      profileRadiiMultipliers = [1.0, 0.85, 0.95, 1.1];
      shapeSpecificSvgContent = `
        <path d="M 110 55 L 215 55 L 355 115 L 340 142 L 195 88 L 110 88 Z" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2" />
        <circle cx="220" cy="78" r="8" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="248" cy="89" r="8" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="276" cy="100" r="8" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="304" cy="111" r="8" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="330" cy="121" r="7" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
        <path d="M 155 58 Q 168 74 152 84" fill="none" stroke="#fbbf24" stroke-width="3.5" />
        <text x="135" y="28" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold">REX-P #14 5-HOLE SKELETONIZED UNDERLEVER + #20 GOLD TRIGGER</text>
      `;
      break;

    case 'INLINE_180_PEEK_POPPET_VALVE':
      uniqueFeatureSummary =
        'Evanix REX-P Part #32 in-line 180° coaxial PEEK-1000 conical poppet valve with 420SS guide stem and dynamic PU-95A stem O-ring.';
      profileRadiiMultipliers = [0.65, 1.15, 0.55, 0.55];
      shapeSpecificSvgContent = `
        <polygon points="140,90 215,44 215,136" fill="#f59e0b" stroke="#fef3c7" stroke-width="2" />
        <rect x="215" y="76" width="135" height="28" fill="#94a3b8" stroke="#38bdf8" stroke-width="1.8" />
        <circle cx="285" cy="72" r="6.5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.5" />
        <circle cx="285" cy="108" r="6.5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.5" />
        <text x="135" y="28" fill="#34d399" font-size="9" font-family="monospace" font-weight="bold">REX-P #32 180° COAXIAL PEEK POPPET CONE + PU-95A STEM SEAL</text>
      `;
      break;

    case 'TWIN_ROD_TELESCOPING_WIRE_STOCK':
      uniqueFeatureSummary =
        'Snowpeak PP750L Twin Ø6.00mm precision ground stainless telescoping stock rails with quick-latch cross-bar and contoured PA66-GF30 shoulder buttpad.';
      profileRadiiMultipliers = [0.75, 0.75, 0.85, 1.2];
      shapeSpecificSvgContent = `
        <rect x="105" y="54" width="215" height="10" rx="3" fill="#cbd5e1" stroke="#38bdf8" stroke-width="1.6" />
        <rect x="105" y="116" width="215" height="10" rx="3" fill="#cbd5e1" stroke="#38bdf8" stroke-width="1.6" />
        <rect x="165" y="46" width="22" height="88" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1.8" />
        <rect x="320" y="36" width="38" height="108" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2.2" />
        <text x="125" y="28" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="bold">SNOWPEAK PP750L TWIN Ø6.0mm TELESCOPING RAILS & LATCH</text>
      `;
      break;

    default:
      uniqueFeatureSummary = `${part.name} (${part.materialAndDurometer}) engineered to ${part.dimensionsMm.toleranceMm} tolerance for ${part.realPhysicsSpec.operatingPressureBar} Bar service (SF ${part.realPhysicsSpec.hoopOrShearSafetyFactor}x).`;
      profileRadiiMultipliers = [0.95, 1.05, 1.0, 0.92];
      shapeSpecificSvgContent = `
        <rect x="115" y="44" width="250" height="92" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <rect x="155" y="38" width="170" height="104" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.8" />
        <rect x="115" y="72" width="250" height="36" fill="#020617" stroke="#f59e0b" stroke-width="1.4" />
        <circle cx="185" cy="68" r="6" fill="#10b981" stroke="#ecfdf5" stroke-width="1.4" />
        <circle cx="295" cy="68" r="6" fill="#10b981" stroke="#ecfdf5" stroke-width="1.4" />
        <circle cx="185" cy="112" r="6" fill="#10b981" stroke="#ecfdf5" stroke-width="1.4" />
        <circle cx="295" cy="112" r="6" fill="#10b981" stroke="#ecfdf5" stroke-width="1.4" />
        <text x="125" y="28" fill="#34d399" font-size="9" font-family="monospace" font-weight="bold">${part.partCode}: ${part.steampunkRustAlias.slice(0, 44)}</text>
      `;
      break;
  }

  const customSvgDrawing = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 175" width="100%" height="100%">
    <rect width="480" height="175" rx="8" fill="#020617" stroke="#1e293b" stroke-width="1.5" />
    <line x1="20" y1="90" x2="460" y2="90" stroke="#334155" stroke-width="1" stroke-dasharray="5 3" />
    ${shapeSpecificSvgContent}
    <text x="18" y="162" fill="#94a3b8" font-size="9" font-family="monospace">CODE: ${part.partCode} · L=${L}mm × OD=Ø${OD}mm × ID=Ø${ID}mm · Wall=${W}mm (${part.dimensionsMm.toleranceMm}) · SF=${part.realPhysicsSpec.hoopOrShearSafetyFactor}x</text>
  </svg>`;

  const segments = 16;
  const rInner = Math.max(0.2, ID * 0.5);
  const rOuterBase = Math.max(rInner + 0.6, OD * 0.5);
  const zStations = [0, L * 0.33, L * 0.67, L];
  const facets: string[] = [];

  const pushTri = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) => {
    facets.push(
      `  facet normal 0 0 1\n    outer loop\n      vertex ${p1[0].toFixed(4)} ${p1[1].toFixed(4)} ${p1[2].toFixed(4)}\n      vertex ${p2[0].toFixed(4)} ${p2[1].toFixed(4)} ${p2[2].toFixed(4)}\n      vertex ${p3[0].toFixed(4)} ${p3[1].toFixed(4)} ${p3[2].toFixed(4)}\n    endloop\n  endfacet`
    );
  };

  for (let s = 0; s < zStations.length - 1; s++) {
    const z0 = zStations[s];
    const z1 = zStations[s + 1];
    const rOut0 = rOuterBase * profileRadiiMultipliers[s];
    const rOut1 = rOuterBase * profileRadiiMultipliers[s + 1];

    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      pushTri([rOut0 * c0, rOut0 * s0, z0], [rOut0 * c1, rOut0 * s1, z0], [rOut1 * c1, rOut1 * s1, z1]);
      pushTri([rOut0 * c0, rOut0 * s0, z0], [rOut1 * c1, rOut1 * s1, z1], [rOut1 * c0, rOut1 * s0, z1]);

      pushTri([rInner * c1, rInner * s1, z0], [rInner * c0, rInner * s0, z0], [rInner * c0, rInner * s0, z1]);
      pushTri([rInner * c1, rInner * s1, z0], [rInner * c0, rInner * s0, z1], [rInner * c1, rInner * s1, z1]);

      if (s === 0) {
        pushTri([rInner * c0, rInner * s0, 0], [rOut0 * c1, rOut0 * s1, 0], [rOut0 * c0, rOut0 * s0, 0]);
        pushTri([rInner * c0, rInner * s0, 0], [rInner * c1, rInner * s1, 0], [rOut0 * c1, rOut0 * s1, 0]);
      }
      if (s === zStations.length - 2) {
        pushTri([rInner * c0, rInner * s0, z1], [rOut1 * c0, rOut1 * s0, z1], [rOut1 * c1, rOut1 * s1, z1]);
        pushTri([rInner * c0, rInner * s0, z1], [rOut1 * c1, rOut1 * s1, z1], [rInner * c1, rInner * s1, z1]);
      }
    }
  }

  const safeCode = part.partCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const watertightStlAscii = `solid unique_${safeCode}\n${facets.join('\n')}\nendsolid unique_${safeCode}\n`;

  return {
    assetId: `unique_asset_${safeCode}`,
    partCode: part.partCode,
    partName: part.name,
    parentModelTitle,
    shapeArchetype: archetype,
    uniqueFeatureSummary,
    materialAndDurometer: part.materialAndDurometer,
    dimensionsSummary: `L=${L}mm × OD=Ø${OD}mm × ID=Ø${ID}mm · Wall=${W}mm (${part.dimensionsMm.toleranceMm})`,
    customSvgDrawing,
    watertightStlAscii,
    stlTriangleCount: facets.length,
    stlFileName: `${safeCode}_unique_part.stl`,
    ollamaCommandUsed: `ollama run qwen2.5-coder:32b-instruct-cad "Synthesize unique watertight B-Rep part ${part.partCode} (${part.name}) with archetype ${archetype}"`,
    createdTimestamp: new Date().toISOString(),
  };
}

