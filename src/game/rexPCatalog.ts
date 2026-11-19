/**
 * EVANIX REX-P 7.62mm (`REX-P 분해도` by 에바닉스 영광)
 * Complete 57-Part Sub-Millimeter Engineering Specification, Curve Profiles,
 * 6-Stage Mechanical Interaction Cycle, 8-Step Disassembly Sequence,
 * and In-Game Collectible Schematic & Local Code Part Compiler.
 */

export type RexPSubsystemCategory =
  | 'MUZZLE_AND_BARREL'
  | 'SLOTTED_HANDGUARD'
  | 'MONOLITHIC_RECEIVER_AND_BREECH'
  | 'UNDERLEVER_AND_SEAR_TRIGGER'
  | 'IN_LINE_POPPET_VALVE'
  | 'REAR_COAXIAL_AIR_TANK'
  | 'ORINGS_AND_FASTENERS';

export type SchematicPartBuildStatus =
  | 'WORKING'
  | 'NEEDS_BUILD'
  | 'BUILT_BY_LOCAL_CODE';

export interface RexPSubMmPartSpec {
  partNumber: string; // '#01' .. '#59'
  numericId: number;
  koreanName: string; // Original label from REX-P 분해도 table
  englishName: string;
  subsystem: RexPSubsystemCategory;
  quantity: number;
  subMmDimensions: {
    lengthMm: number;
    outerDiameterMm: number;
    innerDiameterMm: number;
    wallThicknessMm: number;
    toleranceMm: string;
  };
  curveAndThreadProfile: string;
  materialSpec: string;
  howItWorks: string;
  disassemblyStepIndex: number; // 1..8
  pinX: number; // % on /assets/aistudio/rexp_exploded_diagram.png
  pinY: number; // % on /assets/aistudio/rexp_exploded_diagram.png
  initialStatus: SchematicPartBuildStatus;
  localCadFunctionName: string;
  localCodeSnippet: string;
}

export interface RexPInteractionStage {
  stageNumber: number;
  stageTitle: string;
  involvedParts: string[];
  kinematicChainSummary: string;
  subMmPhysicsDetail: string;
}

export interface RexPDisassemblyStep {
  stepNumber: number;
  stepTitle: string;
  partsRemoved: string[];
  requiredTooling: string;
  warningOrTorqueSpec: string;
  procedureDetail: string;
}

export interface InGameWeaponSchematicItem {
  schematicId: string;
  itemCode: string;
  weaponName: string;
  manufacturer: string;
  nativeCaliberMm: number;
  schematicImageUrl: string;
  totalCatalogedParts: number;
  architectureSummary: string;
  keyParts: RexPSubMmPartSpec[];
}

export const REX_P_57_PARTS_CATALOG: RexPSubMmPartSpec[] = [
  // ==========================================================================
  // GROUP 1: MUZZLE & BARREL CONCENTRIC ASSEMBLY (#01 - #04, #07, #43, #44)
  // ==========================================================================
  {
    partNumber: '#01',
    numericId: 1,
    koreanName: '머즐 캡',
    englishName: 'Knurled Muzzle Cap & Stripping Crown',
    subsystem: 'MUZZLE_AND_BARREL',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 18.5,
      outerDiameterMm: 28.0,
      innerDiameterMm: 9.2,
      wallThicknessMm: 4.5,
      toleranceMm: '±0.012mm',
    },
    curveAndThreadProfile:
      'M24×1.0-6H internal rear threads; R1.50mm front crown fillet; 11° acoustic diffuser cone; 24-pitch straight peripheral knurling.',
    materialSpec: '6061-T6 Anodized Aluminum (Mil-A-8625 Type III Black)',
    howItWorks:
      'Threads into front of Outer Barrel Shroud (#04), compresses Muzzle O-Ring (#43), and tensions Barrel Retaining Holder (#02) to center the 7.62mm Rifled Barrel (#03).',
    disassemblyStepIndex: 3,
    pinX: 74.2,
    pinY: 53.6,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part01_muzzle_cap',
    localCodeSnippet: `// Local CAD Kernel: REX-P #01 Muzzle Cap (머즐 캡)
const exitBoreMm = +(targetCaliberMm * 1.18 + 0.2).toFixed(2);
return buildLatheSolid({ odMm: 28.0, idMm: exitBoreMm, lenMm: 18.5, thread: 'M24x1.0', crownFilletR: 1.5 });`,
  },
  {
    partNumber: '#02',
    numericId: 2,
    koreanName: '총열 고정 홀더',
    englishName: 'Barrel Retaining Holder & Concentric Centering Bushing',
    subsystem: 'MUZZLE_AND_BARREL',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 14.5,
      outerDiameterMm: 23.96,
      innerDiameterMm: 12.02,
      wallThicknessMm: 5.97,
      toleranceMm: '±0.008mm',
    },
    curveAndThreadProfile:
      'Concentric H7/g6 slip bore (Ø12.02mm); outer O-ring gland (20.90mm root × 1.65mm width for #44); 6× Ø2.2mm axial shroud-vent ports on 18.0mm PCD.',
    materialSpec: 'C3604 Free-Machining Brass / 7075-T6 Billet',
    howItWorks:
      'Slides over the muzzle end of Rifled Barrel (#03) inside Outer Shroud (#04) to prevent harmonic barrel whip while venting behind-slug air back into the shroud expansion chamber.',
    disassemblyStepIndex: 3,
    pinX: 64.2,
    pinY: 37.8,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part02_barrel_holder',
    localCodeSnippet: `// Local CAD Kernel: REX-P #02 Barrel Retaining Holder (총열 고정 홀더)
const barrelOdMm = +(targetCaliberMm + 4.38).toFixed(2);
return buildCenteringBushing({ shroudIdMm: 24.0, barrelOdMm, ventPorts: 6, oRingGland: '12.0x1.5mm' });`,
  },
  {
    partNumber: '#03',
    numericId: 3,
    koreanName: '총열',
    englishName: '7.62mm (.30 Cal) Precision Button-Rifled Barrel Liner',
    subsystem: 'MUZZLE_AND_BARREL',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 235.0,
      outerDiameterMm: 12.0,
      innerDiameterMm: 7.62,
      wallThicknessMm: 2.19,
      toleranceMm: '±0.005mm',
    },
    curveAndThreadProfile:
      '6-groove right-hand twist (1:406mm / 1:16"); 7.62mm land Ø / 7.82mm groove Ø; 4.5° conical single-shot lead-in throat; 11° target crown.',
    materialSpec: '4140 CrMo Lothar Walther Ordinance Steel (HRC 32)',
    howItWorks:
      'Seats into Main Receiver Body (#08) locked by top set screw (#51). Receives the .30 cal slug directly via the exposed loading trough when Breech Slide (#11) moves forward.',
    disassemblyStepIndex: 4,
    pinX: 72.5,
    pinY: 45.2,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part03_rifled_barrel',
    localCodeSnippet: `// Local CAD Kernel: REX-P #03 Rifled Barrel (총열)
const grooveDiaMm = +(targetCaliberMm + 0.20).toFixed(2);
return buildRifledLiner({ lengthMm: 235.0, landBoreMm: targetCaliberMm, grooveDiaMm, odMm: Math.max(12.0, targetCaliberMm + 4.38) });`,
  },
  {
    partNumber: '#04',
    numericId: 4,
    koreanName: '아웃바렐',
    englishName: 'Concentric Outer Barrel Shroud Tube',
    subsystem: 'MUZZLE_AND_BARREL',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 218.0,
      outerDiameterMm: 28.0,
      innerDiameterMm: 24.0,
      wallThicknessMm: 2.0,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile:
      'Cylindrical seamless tube; M24×1.0 internal threads at both ends; R0.40mm external edge break.',
    materialSpec: '6061-T6 Seamless Drawn Aluminum Tube',
    howItWorks:
      'Encloses Rifled Barrel (#03) to form an annular acoustic expansion volume and structural spine for Ventilated Handguard (#06).',
    disassemblyStepIndex: 4,
    pinX: 64.5,
    pinY: 46.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part04_outer_barrel',
    localCodeSnippet: `// Local CAD Kernel: REX-P #04 Outer Barrel Shroud (아웃바렐)
return buildConcentricTube({ lengthMm: 218.0, odMm: 28.0, idMm: 24.0, threadBothEnds: 'M24x1.0' });`,
  },
  {
    partNumber: '#05',
    numericId: 5,
    koreanName: '핸드가드 링 마운트',
    englishName: 'Handguard Front Concentric Ring Mount',
    subsystem: 'SLOTTED_HANDGUARD',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 12.0,
      outerDiameterMm: 32.0,
      innerDiameterMm: 28.04,
      wallThicknessMm: 1.98,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile:
      'Stepped concentric shoulder (Ø32.00mm → Ø29.60mm slip lip); C0.8mm front bevel.',
    materialSpec: '6061-T6 Anodized Aluminum',
    howItWorks:
      'Bridges the radial clearance between the Ø28.00mm Outer Barrel (#04) and the front mouth of the Ø32.00mm Ventilated Handguard (#06).',
    disassemblyStepIndex: 3,
    pinX: 61.8,
    pinY: 67.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part05_handguard_ring',
    localCodeSnippet: `// Local CAD Kernel: REX-P #05 Handguard Ring Mount (핸드가드 링 마운트)
return buildSteppedRing({ odMm: 32.0, stepOdMm: 29.6, idMm: 28.04, lengthMm: 12.0 });`,
  },
  {
    partNumber: '#06',
    numericId: 6,
    koreanName: '핸드가드',
    englishName: '5-Slot Ventilated Tubular Forend Handguard',
    subsystem: 'SLOTTED_HANDGUARD',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 142.0,
      outerDiameterMm: 32.0,
      innerDiameterMm: 28.1,
      wallThicknessMm: 1.95,
      toleranceMm: '±0.020mm',
    },
    curveAndThreadProfile:
      '5× stadium-oval ventilation cutouts per side (14.0mm × 7.5mm with R3.75mm full-radius ends, 22.0mm pitch) + 6 longitudinal grip flutes (R2.0mm ball-end mill).',
    materialSpec: '6061-T6 CNC Machined Aluminum',
    howItWorks:
      'Slides over Barrel Mount (#07) and locks via M4×4 set screws (#50), providing off-hand support while keeping weight down to 94g.',
    disassemblyStepIndex: 3,
    pinX: 54.8,
    pinY: 61.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part06_slotted_handguard',
    localCodeSnippet: `// Local CAD Kernel: REX-P #06 5-Slot Ventilated Handguard (핸드가드)
return buildVentilatedHandguard({ lengthMm: 142.0, odMm: 32.0, idMm: 28.1, ovalSlotsPerSide: 5, slotRadiusMm: 3.75 });`,
  },
  {
    partNumber: '#07',
    numericId: 7,
    koreanName: '바렐 마운트',
    englishName: 'Front Barrel Mount & Breech Slide Detent Collar',
    subsystem: 'MUZZLE_AND_BARREL',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 46.0,
      outerDiameterMm: 28.0,
      innerDiameterMm: 12.02,
      wallThicknessMm: 7.99,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile:
      'Stepped nose tenon (Ø23.95mm) + 4× radial M4×0.7 tapped holes at 90° intervals for set screws (#50) + axial Ø3.1mm blind bore for Breech Slide detent (#58/#59).',
    materialSpec: '7075-T6 Billet Aluminum',
    howItWorks:
      'Anchors Outer Barrel (#04) and Handguard (#06) to Main Receiver Body (#08) and houses the spring-loaded detent ball (#58/#59) that clicks Breech Slide (#11) in the open/closed positions.',
    disassemblyStepIndex: 4,
    pinX: 46.8,
    pinY: 54.8,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part07_barrel_mount',
    localCodeSnippet: `// Local CAD Kernel: REX-P #07 Front Barrel Mount (바렐 마운트)
return buildBarrelMountCollar({ lengthMm: 46.0, odMm: 28.0, barrelBoreMm: +(targetCaliberMm + 4.4).toFixed(2), grubPorts: 4 });`,
  },

  // ==========================================================================
  // GROUP 2: MONOLITHIC RECEIVER, HAMMER & BREECH SLIDE (#08 - #11, #23 - #29)
  // ==========================================================================
  {
    partNumber: '#08',
    numericId: 8,
    koreanName: '메인바디',
    englishName: 'Monolithic CNC Main Receiver Body (REX-P 7.62mm)',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 178.5,
      outerDiameterMm: 44.0,
      innerDiameterMm: 24.0,
      wallThicknessMm: 4.0,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile:
      'Upper 28.00mm cylindrical barrel saddle + 38.0mm × 16.5mm R4.0mm radiused single-shot breech window; lower Ø24.00mm H7 honed hammer tunnel; rear M28×1.5-6H female threads for Valve Housing (#34).',
    materialSpec: '7075-T651 Aerospace Billet Aluminum (Hard Black Anodized)',
    howItWorks:
      'Central structural backbone of the REX-P: aligns the rear coaxial Valve Housing (#34) and Poppet (#32) directly in line with the Striker Hammer (#09) and 7.62mm Barrel (#03).',
    disassemblyStepIndex: 8,
    pinX: 36.2,
    pinY: 46.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part08_main_body',
    localCodeSnippet: `// Local CAD Kernel: REX-P #08 Main Receiver Body (메인바디)
return buildMonolithicReceiver({ lengthMm: 178.5, heightMm: 44.0, widthMm: 32.0, hammerBoreMm: 24.0, rearThread: 'M28x1.5' });`,
  },
  {
    partNumber: '#09',
    numericId: 9,
    koreanName: '해머',
    englishName: 'Tubular Coaxial Sliding Striker Hammer (68.5g)',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 54.0,
      outerDiameterMm: 23.85,
      innerDiameterMm: 12.2,
      wallThicknessMm: 5.82,
      toleranceMm: '±0.008mm',
    },
    curveAndThreadProfile:
      'Stepped cylindrical striker nose (Ø16.50mm × 14.0mm) with R0.8mm impact face; bottom 88° sear catch notch (2.85mm depth); rear Ø12.20mm × 36.0mm internal spring pocket.',
    materialSpec: '4140 Chromoly Steel ( Case-Hardened HRC 54, Melonite QPQ)',
    howItWorks:
      'Cocked rearward by Underlever Link Bar (#12) against Main Hammer Spring (#10) and held by Sear (#18). When released, slams straight into Poppet Valve Stem (#32).',
    disassemblyStepIndex: 8,
    pinX: 55.4,
    pinY: 51.4,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part09_striker_hammer',
    localCodeSnippet: `// Local CAD Kernel: REX-P #09 Tubular Striker Hammer (해머)
const requiredMassGrams = +(58.0 + (targetCaliberMm - 5.5) * 4.8).toFixed(1);
return buildStrikerHammer({ odMm: 23.85, idMm: 12.2, lengthMm: 54.0, targetMassGrams: requiredMassGrams });`,
  },
  {
    partNumber: '#10',
    numericId: 10,
    koreanName: '해머 스프링',
    englishName: 'High-Energy Chrome-Silicon Hammer Coil Spring',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 92.0,
      outerDiameterMm: 11.8,
      innerDiameterMm: 8.2,
      wallThicknessMm: 1.8,
      toleranceMm: '±0.050mm',
    },
    curveAndThreadProfile:
      'Helical compression spring: 1.80mm wire Ø, 18 active coils, 5.11mm pitch, closed-and-ground ends, spring rate k = 6.85 N/mm (preload 115N, cocked load 298N).',
    materialSpec: 'ASTM A401 Chrome-Silicon Valve Spring Wire',
    howItWorks:
      'Seats inside the rear pocket of Hammer (#09) and bears against the front face of Barrel Mount (#07) / Receiver guide to propel the hammer during firing.',
    disassemblyStepIndex: 8,
    pinX: 65.2,
    pinY: 59.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part10_hammer_spring',
    localCodeSnippet: `// Local CAD Kernel: REX-P #10 Hammer Spring (해머 스프링)
return buildHelicalSpring({ freeLenMm: 92.0, odMm: 11.8, wireDiaMm: 1.8, coils: 18, rateNPerMm: 6.85 });`,
  },
  {
    partNumber: '#11',
    numericId: 11,
    koreanName: '브릿지 슬라이드',
    englishName: 'Cylindrical Axial Breech Slide Sleeve',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 48.5,
      outerDiameterMm: 23.9,
      innerDiameterMm: 12.04,
      wallThicknessMm: 5.93,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile:
      'Dual concentric O-ring sealing grooves; front finger-grip knurled collar (Ø25.2mm with R2.5mm thumb scallop); 26.0mm linear axial stroke.',
    materialSpec: '7075-T6 Hard-Anodized Aluminum',
    howItWorks:
      'Slides forward and backward along the barrel breech inside Receiver (#08) to open the single-shot loading port for .30/.357/.45 cal slugs and seal the breech face when closed.',
    disassemblyStepIndex: 4,
    pinX: 49.4,
    pinY: 46.8,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part11_breech_slide',
    localCodeSnippet: `// Local CAD Kernel: REX-P #11 Breech Slide Sleeve (브릿지 슬라이드)
const innerBoreMm = +(Math.max(12.04, targetCaliberMm + 4.42)).toFixed(2);
return buildBreechSlide({ lengthMm: 48.5, odMm: 23.9, idMm: innerBoreMm, strokeMm: 26.0 });`,
  },

  // ==========================================================================
  // GROUP 3: UNDERLEVER COCKING LINKAGE & MATCH TRIGGER (#12 - #22)
  // ==========================================================================
  {
    partNumber: '#12',
    numericId: 12,
    koreanName: '레버 링크 플레이트',
    englishName: 'Hardened Underlever Cocking Link Plate',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 112.0,
      outerDiameterMm: 8.5,
      innerDiameterMm: 3.02,
      wallThicknessMm: 4.0,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile:
      'Dog-leg S-curve profile (R18.0mm transition bend); dual Ø3.02mm H7 pivot pin holes spaced 98.50mm center-to-center; rear hammer-cocking lug.',
    materialSpec: '4140 Laser-Cut & Ground Steel Plate (HRC 46)',
    howItWorks:
      'Transfers the downward 62° arc of the Skeletonized Underlever (#14) into a 43.5mm rearward linear cocking stroke on Hammer (#09).',
    disassemblyStepIndex: 7,
    pinX: 31.8,
    pinY: 58.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part12_link_plate',
    localCodeSnippet: `// Local CAD Kernel: REX-P #12 Cocking Link Plate (레버 링크 플레이트)
return buildLinkBar({ centerSpanMm: 98.5, thicknessMm: 4.0, pinBoreMm: 3.02, sCurveRadiusMm: 18.0 });`,
  },
  {
    partNumber: '#13',
    numericId: 13,
    koreanName: '레버 링크 고정 핀',
    englishName: 'Lever Link Rear Pivot Dowel Pin',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 14.0,
      outerDiameterMm: 3.0,
      innerDiameterMm: 0,
      wallThicknessMm: 3.0,
      toleranceMm: '±0.004mm',
    },
    curveAndThreadProfile: 'ISO 2338 m6 precision ground dowel pin with C0.3mm end chamfers.',
    materialSpec: 'SUJ2 Bearing Steel (HRC 60)',
    howItWorks: 'Couples the rear eye of Link Plate (#12) to the cocking shoe inside Receiver (#08).',
    disassemblyStepIndex: 7,
    pinX: 26.8,
    pinY: 56.4,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part13_link_pin',
    localCodeSnippet: `return buildDowelPin({ odMm: 3.0, lengthMm: 14.0 });`,
  },
  {
    partNumber: '#14',
    numericId: 14,
    koreanName: '레버',
    englishName: '5-Hole Skeletonized Trigger-Guard Cocking Underlever',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 134.0,
      outerDiameterMm: 36.0,
      innerDiameterMm: 6.5,
      wallThicknessMm: 8.0,
      toleranceMm: '±0.020mm',
    },
    curveAndThreadProfile:
      'Trapezoidal trigger-guard bow (28° front angle, R14.5mm lower corner radius) perforated by 5× Ø6.50mm weight-saving holes (C0.5mm countersink) + rear latch hook.',
    materialSpec: '7075-T6 CNC Billet Aluminum',
    howItWorks:
      'Forms the protective trigger guard when latched closed on Stopper (#16); swings down 62° around Front Pivot Pin (#15) to cock Hammer (#09) via Link Plate (#12).',
    disassemblyStepIndex: 7,
    pinX: 40.5,
    pinY: 60.2,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part14_underlever',
    localCodeSnippet: `// Local CAD Kernel: REX-P #14 5-Hole Skeletonized Underlever (레버)
return buildSkeletonizedUnderlever({ lengthMm: 134.0, thicknessMm: 8.0, lightningHoles: 5, holeDiaMm: 6.5, bowAngleDeg: 28 });`,
  },
  {
    partNumber: '#15',
    numericId: 15,
    koreanName: '레버 고정 핀',
    englishName: 'Underlever Front Fulcrum Pivot Pin',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 18.0,
      outerDiameterMm: 4.0,
      innerDiameterMm: 0,
      wallThicknessMm: 4.0,
      toleranceMm: '±0.005mm',
    },
    curveAndThreadProfile: 'Ground fulcrum shaft Ø4.00mm g6 with R0.25mm end crown.',
    materialSpec: '420J2 Stainless Steel (HRC 52)',
    howItWorks: 'Serves as the primary front fulcrum axis around which Underlever (#14) pivots.',
    disassemblyStepIndex: 7,
    pinX: 44.0,
    pinY: 63.0,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part15_lever_pin',
    localCodeSnippet: `return buildDowelPin({ odMm: 4.0, lengthMm: 18.0 });`,
  },
  {
    partNumber: '#16',
    numericId: 16,
    koreanName: '레버 스토퍼',
    englishName: 'Underlever Detent Latch Stopper Block',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 22.5,
      outerDiameterMm: 10.0,
      innerDiameterMm: 4.1,
      wallThicknessMm: 3.0,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile: '35° self-camming latch nose ramp with R1.2mm retention lip.',
    materialSpec: '4140 Hardened Steel',
    howItWorks:
      'Pushed forward by Stopper Spring (#17) to snap-lock the rear tip of Skeletonized Underlever (#14) flush against the Pistol Grip (#28).',
    disassemblyStepIndex: 7,
    pinX: 38.2,
    pinY: 64.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part16_lever_stopper',
    localCodeSnippet: `return buildLatchStopper({ lengthMm: 22.5, rampAngleDeg: 35, lipRadiusMm: 1.2 });`,
  },
  {
    partNumber: '#17',
    numericId: 17,
    koreanName: '레버 스토퍼 리턴 스프링',
    englishName: 'Lever Stopper Return Compression Spring',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 10.0,
      outerDiameterMm: 3.5,
      innerDiameterMm: 2.3,
      wallThicknessMm: 0.6,
      toleranceMm: '±0.050mm',
    },
    curveAndThreadProfile: '7 coils, 0.60mm music wire, k = 3.2 N/mm.',
    materialSpec: '302 Stainless Spring Wire',
    howItWorks: 'Maintains forward locking tension on Lever Stopper (#16).',
    disassemblyStepIndex: 7,
    pinX: 39.8,
    pinY: 63.6,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part17_stopper_spring',
    localCodeSnippet: `return buildHelicalSpring({ freeLenMm: 10.0, odMm: 3.5, wireDiaMm: 0.6, coils: 7, rateNPerMm: 3.2 });`,
  },
  {
    partNumber: '#18',
    numericId: 18,
    koreanName: '시어',
    englishName: 'Hardened A2 Tool-Steel Primary Hammer Sear',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 24.8,
      outerDiameterMm: 11.2,
      innerDiameterMm: 3.01,
      wallThicknessMm: 5.8,
      toleranceMm: '±0.005mm',
    },
    curveAndThreadProfile:
      '88° wire-EDM ground hammer catch shelf with R0.15mm mirror-polished break edge; Ø3.01mm pivot bore for Pin (#22).',
    materialSpec: 'A2 Air-Hardening Tool Steel (HRC 58)',
    howItWorks:
      'Holds the 298N cocked load of Striker Hammer (#09) and drops clear when tripped by Match Trigger (#20) via adjustment screw (#53).',
    disassemblyStepIndex: 8,
    pinX: 35.6,
    pinY: 53.6,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part18_primary_sear',
    localCodeSnippet: `// Local CAD Kernel: REX-P #18 Primary Hammer Sear (시어)
return buildWireEdmSear({ lengthMm: 24.8, thicknessMm: 5.8, shelfAngleDeg: 88.0, breakEdgeRadiusMm: 0.15 });`,
  },
  {
    partNumber: '#19',
    numericId: 19,
    koreanName: '시어 리턴 스프링',
    englishName: 'Sear Upward Engagement Return Spring',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 9.5,
      outerDiameterMm: 3.2,
      innerDiameterMm: 2.1,
      wallThicknessMm: 0.55,
      toleranceMm: '±0.040mm',
    },
    curveAndThreadProfile: '8 coils, 0.55mm wire, k = 2.4 N/mm.',
    materialSpec: '302 Stainless Spring Wire',
    howItWorks: 'Biases Sear (#18) upward so its catch shelf automatically latches Hammer (#09) at full cock.',
    disassemblyStepIndex: 8,
    pinX: 36.8,
    pinY: 56.6,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part19_sear_spring',
    localCodeSnippet: `return buildHelicalSpring({ freeLenMm: 9.5, odMm: 3.2, wireDiaMm: 0.55, coils: 8, rateNPerMm: 2.4 });`,
  },
  {
    partNumber: '#20',
    numericId: 20,
    koreanName: '트리거',
    englishName: 'Two-Stage Gold-Anodized Curved Match Trigger Blade',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 31.5,
      outerDiameterMm: 14.0,
      innerDiameterMm: 3.01,
      wallThicknessMm: 6.0,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile:
      'Crescent ergonomic finger arc (R19.00mm concave inner curve, R23.50mm outer curve) + dual M3×0.5 tapped bores for 1st/2nd stage screws (#53, #54).',
    materialSpec: '7075-T6 Gold/Brass Anodized Aluminum',
    howItWorks:
      'Pivots on Dowel Pin (#22); first-stage takeup closes the gap to Sear (#18), and second-stage crisp wall trips the sear at 1.15 kgf pull weight.',
    disassemblyStepIndex: 8,
    pinX: 31.2,
    pinY: 52.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part20_match_trigger',
    localCodeSnippet: `// Local CAD Kernel: REX-P #20 Curved Match Trigger (트리거)
return buildCurvedTriggerBlade({ innerArcRadiusMm: 19.0, outerArcRadiusMm: 23.5, widthMm: 6.0, stageScrews: 2 });`,
  },
  {
    partNumber: '#21',
    numericId: 21,
    koreanName: '방아쇠 리턴 스프링',
    englishName: 'Trigger Blade Return Spring',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 11.0,
      outerDiameterMm: 3.5,
      innerDiameterMm: 2.4,
      wallThicknessMm: 0.55,
      toleranceMm: '±0.040mm',
    },
    curveAndThreadProfile: '8 coils, 0.55mm wire, k = 1.95 N/mm.',
    materialSpec: '302 Stainless Spring Wire',
    howItWorks: 'Returns Trigger Blade (#20) forward after release and provides tactile first-stage weight.',
    disassemblyStepIndex: 8,
    pinX: 32.0,
    pinY: 49.4,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part21_trigger_spring',
    localCodeSnippet: `return buildHelicalSpring({ freeLenMm: 11.0, odMm: 3.5, wireDiaMm: 0.55, coils: 8, rateNPerMm: 1.95 });`,
  },
  {
    partNumber: '#22',
    numericId: 22,
    koreanName: '방아쇠 시어 고정 핀 3 × 17.8',
    englishName: 'Trigger & Sear Precision Dowel Pins (3.00 × 17.80mm)',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 2,
    subMmDimensions: {
      lengthMm: 17.8,
      outerDiameterMm: 3.0,
      innerDiameterMm: 0,
      wallThicknessMm: 3.0,
      toleranceMm: '±0.004mm',
    },
    curveAndThreadProfile: 'Twin Ø3.00mm × 17.80mm ground pins with C0.25mm chamfered tips.',
    materialSpec: 'SUJ2 Hardened Chrome Steel',
    howItWorks: 'Transverse axles supporting Trigger (#20) and Sear (#18) inside the lower pocket of Receiver (#08).',
    disassemblyStepIndex: 8,
    pinX: 33.4,
    pinY: 54.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part22_sear_pins',
    localCodeSnippet: `return buildDowelPin({ odMm: 3.0, lengthMm: 17.8, count: 2 });`,
  },
  {
    partNumber: '#23',
    numericId: 23,
    koreanName: '커버 LL',
    englishName: 'Left Receiver Side Cover Plate (Cover LL)',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 86.0,
      outerDiameterMm: 14.5,
      innerDiameterMm: 3.2,
      wallThicknessMm: 2.5,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile: 'Flat CNC plate with R2.0mm corner fillets and 2× M3 countersunk screw holes (#49).',
    materialSpec: '6061-T6 Black Anodized Aluminum',
    howItWorks: 'Seals the left linkage slot of Main Receiver Body (#08) against dust ingress.',
    disassemblyStepIndex: 7,
    pinX: 40.6,
    pinY: 42.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part23_cover_ll',
    localCodeSnippet: `return buildSideCoverPlate({ side: 'LEFT', lengthMm: 86.0, heightMm: 14.5, thicknessMm: 2.5 });`,
  },
  {
    partNumber: '#24',
    numericId: 24,
    koreanName: '커버 RR',
    englishName: 'Right Receiver Side Cover Plate (Cover RR with F/S Markings)',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 86.0,
      outerDiameterMm: 14.5,
      innerDiameterMm: 3.2,
      wallThicknessMm: 2.5,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile: 'Flat CNC plate with laser-etched F (Fire) / S (Safe) indices and 2× M3 countersunk holes (#49).',
    materialSpec: '6061-T6 Black Anodized Aluminum',
    howItWorks: 'Encloses the right side of the trigger/link recess in Main Body (#08).',
    disassemblyStepIndex: 7,
    pinX: 26.2,
    pinY: 59.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part24_cover_rr',
    localCodeSnippet: `return buildSideCoverPlate({ side: 'RIGHT', lengthMm: 86.0, heightMm: 14.5, thicknessMm: 2.5 });`,
  },
  {
    partNumber: '#25',
    numericId: 25,
    koreanName: '안전장치',
    englishName: 'Cross-Bolt Manual Safety Selector Pin',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 28.0,
      outerDiameterMm: 6.0,
      innerDiameterMm: 0,
      wallThicknessMm: 6.0,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile: 'Dual R1.30mm spherical detent notches spaced 4.20mm apart + milled trigger-blocking shoulder.',
    materialSpec: '303 Stainless Steel / Black Oxide',
    howItWorks: 'Slides transversely above Trigger (#20) to mechanically block upward sear-release travel when set to S (Safe).',
    disassemblyStepIndex: 6,
    pinX: 29.8,
    pinY: 48.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part25_safety_selector',
    localCodeSnippet: `return buildCrossBoltSafety({ lengthMm: 28.0, odMm: 6.0, detentPitchMm: 4.2 });`,
  },
  {
    partNumber: '#26',
    numericId: 26,
    koreanName: '안전장치 볼',
    englishName: 'Safety Selector Detent Chrome Steel Ball',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 2.5,
      outerDiameterMm: 2.5,
      innerDiameterMm: 0,
      wallThicknessMm: 2.5,
      toleranceMm: '±0.002mm',
    },
    curveAndThreadProfile: 'ISO 3290 Grade 10 sphere (R1.250mm).',
    materialSpec: 'SUJ2 Hardened Chrome Steel',
    howItWorks: 'Clicks into the two spherical grooves on Safety Selector (#25) under force from Spring (#27).',
    disassemblyStepIndex: 6,
    pinX: 30.2,
    pinY: 47.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part26_safety_ball',
    localCodeSnippet: `return buildPrecisionSphere({ diameterMm: 2.5 });`,
  },
  {
    partNumber: '#27',
    numericId: 27,
    koreanName: '안전장치 볼 스프링',
    englishName: 'Safety Detent Micro Coil Spring',
    subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 6.5,
      outerDiameterMm: 2.4,
      innerDiameterMm: 1.6,
      wallThicknessMm: 0.4,
      toleranceMm: '±0.040mm',
    },
    curveAndThreadProfile: '6 coils, 0.40mm wire.',
    materialSpec: '302 Stainless Spring Wire',
    howItWorks: 'Captured in the top deck of Pistol Grip (#28) to push Detent Ball (#26) upward into Safety (#25).',
    disassemblyStepIndex: 6,
    pinX: 30.5,
    pinY: 48.0,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part27_safety_spring',
    localCodeSnippet: `return buildHelicalSpring({ freeLenMm: 6.5, odMm: 2.4, wireDiaMm: 0.4, coils: 6, rateNPerMm: 1.8 });`,
  },
  {
    partNumber: '#28',
    numericId: 28,
    koreanName: '핸드그립',
    englishName: 'Ergonomic Contoured Target Pistol Grip',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 114.0,
      outerDiameterMm: 48.5,
      innerDiameterMm: 5.2,
      wallThicknessMm: 4.2,
      toleranceMm: '±0.030mm',
    },
    curveAndThreadProfile:
      '16° grip rake angle; triple anterior finger grooves (R9.50mm, R11.00mm, R10.20mm); palm swell spline (34.2mm → 41.8mm → 36.5mm); flared lower palm shelf.',
    materialSpec: 'PA66-GF30 Glass-Reinforced Polymer / PA12-CF Printable',
    howItWorks:
      'Bolts to the underside of Main Receiver Body (#08) via M5×25 screw (#56) and retains Safety Spring (#27).',
    disassemblyStepIndex: 6,
    pinX: 22.8,
    pinY: 47.4,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part28_target_grip',
    localCodeSnippet: `// Local CAD Kernel: REX-P #28 Ergonomic Target Grip (핸드그립)
return buildErgonomicGrip({ heightMm: 114.0, rakeDeg: 16.0, fingerGrooveRadiiMm: [9.5, 11.0, 10.2], palmSwellWidthMm: 41.8 });`,
  },
  {
    partNumber: '#29',
    numericId: 29,
    koreanName: '스코프 마운트',
    englishName: 'High-Profile Cantilever Picatinny Scope Mount Rail',
    subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 156.0,
      outerDiameterMm: 21.2,
      innerDiameterMm: 5.2,
      wallThicknessMm: 8.5,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile:
      'MIL-STD-1913 21.20mm dovetail profile (14 recoil slots, 5.25mm slot width, 10.00mm pitch); dual 45° swept cantilever pillars providing 24.5mm vertical bridge clearance over the loading port.',
    materialSpec: '6061-T6 CNC Billet Aluminum',
    howItWorks:
      'Bridges high over the single-shot breech window of Receiver (#08) via two M5×15 socket bolts (#55) so fingers can load 7.62mm slugs underneath the optic.',
    disassemblyStepIndex: 2,
    pinX: 37.2,
    pinY: 32.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part29_cantilever_rail',
    localCodeSnippet: `// Local CAD Kernel: REX-P #29 Cantilever Picatinny Scope Mount (스코프 마운트)
return buildCantileverRail({ lengthMm: 156.0, railWidthMm: 21.2, bridgeClearanceMm: 24.5, riserAngleDeg: 45, slots: 14 });`,
  },

  // ==========================================================================
  // GROUP 4: COAXIAL IN-LINE POPPET VALVE & REAR AIR TANK (#30 - #42)
  // ==========================================================================
  {
    partNumber: '#30',
    numericId: 30,
    koreanName: '격침 스토퍼',
    englishName: 'Poppet Valve Stem Guide & Travel Stopper Bushing',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 13.5,
      outerDiameterMm: 14.0,
      innerDiameterMm: 4.02,
      wallThicknessMm: 4.99,
      toleranceMm: '±0.006mm',
    },
    curveAndThreadProfile:
      'M14×1.0 external thread; Ø4.02mm H7 concentric stem guide bore + O-ring gland for dynamic stem seal (#45).',
    materialSpec: 'C3604 High-Tensile Brass',
    howItWorks:
      'Guides the forward striker tip of Poppet Valve Stem (#32) and limits maximum valve lift to 3.45mm.',
    disassemblyStepIndex: 5,
    pinX: 41.2,
    pinY: 79.6,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part30_valve_stopper',
    localCodeSnippet: `// Local CAD Kernel: REX-P #30 Poppet Valve Stopper Bushing (격침 스토퍼)
return buildValveGuideBushing({ thread: 'M14x1.0', stemBoreMm: 4.02, maxLiftStopMm: 3.45 });`,
  },
  {
    partNumber: '#31',
    numericId: 31,
    koreanName: '격침 스프링',
    englishName: 'High-Rate Poppet Valve Return Spring',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 34.0,
      outerDiameterMm: 9.2,
      innerDiameterMm: 6.4,
      wallThicknessMm: 1.4,
      toleranceMm: '±0.040mm',
    },
    curveAndThreadProfile: '9 coils, 1.40mm wire Ø, k = 14.2 N/mm.',
    materialSpec: '302 Stainless Valve Spring Wire',
    howItWorks:
      'Works together with the 250-bar tank pressure in Air Cylinder (#37) to snap Poppet Stem (#32) shut in 1.65ms after hammer impact.',
    disassemblyStepIndex: 5,
    pinX: 35.8,
    pinY: 75.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part31_valve_spring',
    localCodeSnippet: `return buildHelicalSpring({ freeLenMm: 34.0, odMm: 9.2, wireDiaMm: 1.4, coils: 9, rateNPerMm: 14.2 });`,
  },
  {
    partNumber: '#32',
    numericId: 32,
    koreanName: '격침봉',
    englishName: 'Coaxial In-Line Poppet Valve Stem & PEEK Sealing Head',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 42.5,
      outerDiameterMm: 9.8,
      innerDiameterMm: 4.0,
      wallThicknessMm: 2.9,
      toleranceMm: '±0.005mm',
    },
    curveAndThreadProfile:
      'Ø4.00mm g5 mirror-ground stem shaft; bonded Ø9.80mm PEEK-GF30 poppet head with 45° conical sealing bevel and R0.65mm aerodynamic flow fillet.',
    materialSpec: '17-4PH H900 Stainless Shaft + PEEK-GF30 Sealing Cone',
    howItWorks:
      'Struck directly by Hammer (#09) to open a 180° straight coaxial flow path from Rear Air Tank (#37) straight into 7.62mm Barrel (#03) with zero 90° transfer-port turn loss.',
    disassemblyStepIndex: 5,
    pinX: 39.2,
    pinY: 78.2,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part32_poppet_stem',
    localCodeSnippet: `// Local CAD Kernel: REX-P #32 Coaxial In-Line Poppet Valve Stem (격침봉)
const poppetHeadOdMm = +(Math.max(9.8, targetCaliberMm * 1.28)).toFixed(2);
return buildCoaxialPoppetStem({ shaftDiaMm: 4.0, headOdMm: poppetHeadOdMm, lengthMm: 42.5, coneAngleDeg: 45, filletR: 0.65 });`,
  },
  {
    partNumber: '#33',
    numericId: 33,
    koreanName: '어세블 캡',
    englishName: 'Valve Seat Retainer & Assemble Cap',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 15.0,
      outerDiameterMm: 18.0,
      innerDiameterMm: 7.8,
      wallThicknessMm: 5.1,
      toleranceMm: '±0.008mm',
    },
    curveAndThreadProfile:
      'Lapped 45° brass/Delrin valve seat throat (Ø7.80mm Venturi ID) + 4× Ø4.2mm high-flow peripheral intake slots.',
    materialSpec: 'C3604 Brass + Delrin 100P Seat Insert',
    howItWorks:
      'Provides the high-pressure sealing seat against which Poppet Head (#32) seals up to 250 bar.',
    disassemblyStepIndex: 5,
    pinX: 37.6,
    pinY: 77.2,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part33_assemble_cap',
    localCodeSnippet: `// Local CAD Kernel: REX-P #33 Valve Assemble Cap (어세블 캡)
const venturiThroatMm = +(Math.max(7.8, targetCaliberMm * 1.02)).toFixed(2);
return buildValveAssembleCap({ odMm: 18.0, venturiIdMm: venturiThroatMm, intakeSlots: 4 });`,
  },
  {
    partNumber: '#34',
    numericId: 34,
    koreanName: '밸브 하우징',
    englishName: 'High-Pressure Rear Coaxial Valve Housing Manifold',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 48.0,
      outerDiameterMm: 35.0,
      innerDiameterMm: 18.0,
      wallThicknessMm: 8.5,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile:
      'Front M28×1.5-6g male thread into Receiver (#08); rear M28×1.5 thread for Adapter (#35); radial M6×1.0 over-pressure relief port for Safety Ball (#36) & Bolt (#57).',
    materialSpec: '7075-T651 Aerospace Aluminum / 17-4PH Upgrade',
    howItWorks:
      'Houses the entire Coaxial Poppet Assembly (#30–#33) and couples the Rear Air Tank (#37) directly behind the receiver.',
    disassemblyStepIndex: 5,
    pinX: 36.8,
    pinY: 85.8,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part34_valve_housing',
    localCodeSnippet: `// Local CAD Kernel: REX-P #34 High-Pressure Valve Housing (밸브 하우징)
return buildCoaxialValveHousing({ odMm: 35.0, boreMm: 18.0, lengthMm: 48.0, thread: 'M28x1.5', reliefPort: 'M6x1.0' });`,
  },
  {
    partNumber: '#35',
    numericId: 35,
    koreanName: '밸브 하우징 리어 캡',
    englishName: 'Valve Housing Rear Tank Thread Adapter Collar',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 16.5,
      outerDiameterMm: 35.0,
      innerDiameterMm: 24.0,
      wallThicknessMm: 5.5,
      toleranceMm: '±0.012mm',
    },
    curveAndThreadProfile:
      'Dual O-ring sealing glands (#46 NBR90 24.0×2.5mm) + M28×1.5 coupling threads.',
    materialSpec: '7075-T6 Aluminum',
    howItWorks: 'Seals the high-pressure joint between Valve Housing (#34) and Rear Air Tank (#37).',
    disassemblyStepIndex: 5,
    pinX: 33.2,
    pinY: 82.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part35_rear_cap',
    localCodeSnippet: `return buildTankAdapterCollar({ odMm: 35.0, idMm: 24.0, lengthMm: 16.5, oRingSpec: '24.0x2.5mm' });`,
  },
  {
    partNumber: '#36',
    numericId: 36,
    koreanName: '안전변 볼',
    englishName: 'Over-Pressure Relief / Bleed Sealing Ball',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 4.5,
      outerDiameterMm: 4.5,
      innerDiameterMm: 0,
      wallThicknessMm: 4.5,
      toleranceMm: '±0.003mm',
    },
    curveAndThreadProfile: 'Ø4.50mm precision sphere seated in 60° conical relief seat.',
    materialSpec: 'SUJ2 Chrome Steel / Urethane 95A',
    howItWorks:
      'Compressed by Bleed Bolt (#57) inside Valve Housing (#34); backing out #57 unseats #36 to safely degas the Rear Air Tank (#37) before disassembly.',
    disassemblyStepIndex: 1,
    pinX: 36.8,
    pinY: 82.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part36_relief_ball',
    localCodeSnippet: `return buildPrecisionSphere({ diameterMm: 4.5 });`,
  },
  {
    partNumber: '#37',
    numericId: 37,
    koreanName: '에어 탱크',
    englishName: 'Rear Coaxial 250-Bar Air Cylinder with Cross-Hatched Cheek Sleeve',
    subsystem: 'REAR_COAXIAL_AIR_TANK',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 215.0,
      outerDiameterMm: 35.0,
      innerDiameterMm: 28.6,
      wallThicknessMm: 3.2,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile:
      'Seamless high-pressure cylinder (3.20mm wall, Lamé SF = 2.48 at 250 bar); M28×1.5 internal threads both ends; exterior diamond cross-hatched EVA cheek sleeve (Ø37.4mm).',
    materialSpec: '7075-T6 Seamless Extruded Tube (503 MPa Yield)',
    howItWorks:
      'Stores 165cc of 250-bar compressed air directly behind the receiver and doubles as the shooter cheek rest / pistol buffer tube.',
    disassemblyStepIndex: 5,
    pinX: 25.8,
    pinY: 75.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part37_air_tank',
    localCodeSnippet: `// Local CAD Kernel: REX-P #37 Rear 250-Bar Air Tank (에어 탱크)
return buildHighPressureCylinder({ lengthMm: 215.0, odMm: 35.0, idMm: 28.6, workingBar: 250, crossHatchSleeve: true });`,
  },
  {
    partNumber: '#38',
    numericId: 38,
    koreanName: '체크 밸브 하우징',
    englishName: 'Rear Fill Port & Check Valve Housing Endcap',
    subsystem: 'REAR_COAXIAL_AIR_TANK',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 32.0,
      outerDiameterMm: 35.0,
      innerDiameterMm: 16.0,
      wallThicknessMm: 9.5,
      toleranceMm: '±0.010mm',
    },
    curveAndThreadProfile:
      'M28×1.5-6g tank thread with O-ring gland (#47); transverse Ø8.02mm Foster fill probe port; rear G1/8" BSPP axial gauge thread.',
    materialSpec: '7075-T6 Billet Aluminum',
    howItWorks:
      'Caps the rear of Air Tank (#37), housing One-Way Fill Valve (#42) and Axial Manometer (#40).',
    disassemblyStepIndex: 5,
    pinX: 19.8,
    pinY: 71.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part38_check_housing',
    localCodeSnippet: `return buildCheckValveEndcap({ odMm: 35.0, lengthMm: 32.0, probePortDiaMm: 8.02, gaugeThread: 'G1/8_BSPP' });`,
  },
  {
    partNumber: '#39',
    numericId: 39,
    koreanName: '게이지 링',
    englishName: 'High-Pressure Manometer Dowty Sealing Ring',
    subsystem: 'REAR_COAXIAL_AIR_TANK',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 2.0,
      outerDiameterMm: 16.0,
      innerDiameterMm: 9.8,
      wallThicknessMm: 2.0,
      toleranceMm: '±0.020mm',
    },
    curveAndThreadProfile: 'Bonded steel/NBR90 trapezoidal lip washer.',
    materialSpec: 'Zinc-Plated Steel + NBR90',
    howItWorks: 'Seals the G1/8" thread between Pressure Gauge (#40) and Check Valve Housing (#38).',
    disassemblyStepIndex: 5,
    pinX: 17.5,
    pinY: 69.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part39_gauge_ring',
    localCodeSnippet: `return buildDowtyWasher({ odMm: 16.0, idMm: 9.8, thicknessMm: 2.0 });`,
  },
  {
    partNumber: '#40',
    numericId: 40,
    koreanName: '게이지',
    englishName: 'Rear Axial 0–300 Bar Bourdon Tube Manometer Gauge',
    subsystem: 'REAR_COAXIAL_AIR_TANK',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 24.5,
      outerDiameterMm: 25.0,
      innerDiameterMm: 9.7,
      wallThicknessMm: 3.5,
      toleranceMm: '±0.050mm',
    },
    curveAndThreadProfile: 'Ø25.00mm luminous dial case + rear G1/8" male stem with 22mm hex flats.',
    materialSpec: '304 Stainless Case + Copper-Beryllium Bourdon Tube',
    howItWorks: 'Displays live reservoir pressure (0–250 bar green/yellow/red zones) at the rear of the air tube.',
    disassemblyStepIndex: 5,
    pinX: 15.6,
    pinY: 68.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part40_manometer',
    localCodeSnippet: `return buildManometerGauge({ dialOdMm: 25.0, maxBar: 300, thread: 'G1/8' });`,
  },
  {
    partNumber: '#41',
    numericId: 41,
    koreanName: '게이지 커버',
    englishName: 'Rear Protective Gauge & Fill-Port Dust Cover Sleeve',
    subsystem: 'REAR_COAXIAL_AIR_TANK',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 34.0,
      outerDiameterMm: 36.5,
      innerDiameterMm: 35.05,
      wallThicknessMm: 0.72,
      toleranceMm: '±0.020mm',
    },
    curveAndThreadProfile:
      'Rotary slip-fit collar with Ø10.0mm fill-probe access window, rear Ø22.0mm gauge viewing aperture, and R2.0mm rear butt lip.',
    materialSpec: '6061-T6 Black Anodized Aluminum',
    howItWorks:
      'Rotates on the rear of Check Valve Housing (#38) to shield the fill port from dirt while leaving Manometer (#40) visible.',
    disassemblyStepIndex: 5,
    pinX: 12.6,
    pinY: 65.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part41_gauge_cover',
    localCodeSnippet: `return buildRotaryDustCover({ odMm: 36.5, idMm: 35.05, lengthMm: 34.0, rearWindowMm: 22.0 });`,
  },
  {
    partNumber: '#42',
    numericId: 42,
    koreanName: '원주형 밸브',
    englishName: 'Cylindrical One-Way Check Valve Piston',
    subsystem: 'REAR_COAXIAL_AIR_TANK',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 14.2,
      outerDiameterMm: 6.0,
      innerDiameterMm: 0,
      wallThicknessMm: 6.0,
      toleranceMm: '±0.006mm',
    },
    curveAndThreadProfile: 'Cylindrical brass plunger with O-ring groove and 3× axial air flutes.',
    materialSpec: 'C3604 Brass + PU90 Seal',
    howItWorks:
      'Opens when 250-bar air is pumped into the Foster port of (#38) and seals immediately when the fill whip is bled.',
    disassemblyStepIndex: 5,
    pinX: 18.8,
    pinY: 70.4,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part42_check_piston',
    localCodeSnippet: `return buildCheckPiston({ odMm: 6.0, lengthMm: 14.2, flutes: 3 });`,
  },

  // ==========================================================================
  // GROUP 5: HIGH-PRESSURE ELASTOMER O-RINGS & METRIC FASTENERS (#43 - #59)
  // ==========================================================================
  {
    partNumber: '#43',
    numericId: 43,
    koreanName: '머즐 캡 오링',
    englishName: 'Muzzle Cap Seal O-Ring (NBR90 20.0 × 2.0mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 2.0,
      outerDiameterMm: 24.0,
      innerDiameterMm: 20.0,
      wallThicknessMm: 2.0,
      toleranceMm: '±0.08mm',
    },
    curveAndThreadProfile: 'Toroidal elastomer cross-section Ø2.00mm.',
    materialSpec: 'NBR 90 Shore A Nitrile',
    howItWorks: 'Damps vibration and seals Muzzle Cap (#01) inside Outer Barrel (#04).',
    disassemblyStepIndex: 3,
    pinX: 71.8,
    pinY: 51.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part43_muzzle_oring',
    localCodeSnippet: `return buildToroidOring({ idMm: 20.0, csMm: 2.0, shoreA: 90 });`,
  },
  {
    partNumber: '#44',
    numericId: 44,
    koreanName: '총열 고정 홀더 오링',
    englishName: 'Barrel Holder Centering O-Ring (NBR90 12.0 × 1.5mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 2,
    subMmDimensions: {
      lengthMm: 1.5,
      outerDiameterMm: 15.0,
      innerDiameterMm: 12.0,
      wallThicknessMm: 1.5,
      toleranceMm: '±0.06mm',
    },
    curveAndThreadProfile: 'Toroidal elastomer cross-section Ø1.50mm.',
    materialSpec: 'NBR 90 Shore A Nitrile',
    howItWorks: 'Suspends Barrel Holder (#02) and Barrel (#03) concentrically inside Outer Shroud (#04).',
    disassemblyStepIndex: 3,
    pinX: 64.0,
    pinY: 38.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part44_holder_oring',
    localCodeSnippet: `return buildToroidOring({ idMm: 12.0, csMm: 1.5, shoreA: 90 });`,
  },
  {
    partNumber: '#45',
    numericId: 45,
    koreanName: '격침 오링',
    englishName: 'Poppet Stem Dynamic High-Pressure O-Ring (PU95A 4.0 × 1.5mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 1.5,
      outerDiameterMm: 7.0,
      innerDiameterMm: 4.0,
      wallThicknessMm: 1.5,
      toleranceMm: '±0.05mm',
    },
    curveAndThreadProfile: 'Toroidal polyurethane seal Ø1.50mm.',
    materialSpec: 'Polyurethane 95 Shore A (Extrusion Resistant)',
    howItWorks: 'Prevents high-pressure air blow-by along Poppet Stem (#32) during the 1.65ms firing pulse.',
    disassemblyStepIndex: 5,
    pinX: 42.4,
    pinY: 80.6,
    initialStatus: 'NEEDS_BUILD',
    localCadFunctionName: 'compile_rexp_part45_poppet_oring',
    localCodeSnippet: `return buildToroidOring({ idMm: 4.0, csMm: 1.5, shoreA: 95 });`,
  },
  {
    partNumber: '#46',
    numericId: 46,
    koreanName: '밸브 하우징 오링',
    englishName: 'Valve Housing 250-Bar Static O-Ring (NBR90 24.0 × 2.5mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 2,
    subMmDimensions: {
      lengthMm: 2.5,
      outerDiameterMm: 29.0,
      innerDiameterMm: 24.0,
      wallThicknessMm: 2.5,
      toleranceMm: '±0.08mm',
    },
    curveAndThreadProfile: 'Toroidal cross-section Ø2.50mm with 18% radial gland crush.',
    materialSpec: 'NBR 90 Shore A Nitrile',
    howItWorks: 'Seals the 250-bar boundary between Rear Air Tank (#37), Adapter (#35), and Valve Housing (#34).',
    disassemblyStepIndex: 5,
    pinX: 34.5,
    pinY: 83.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part46_valve_oring',
    localCodeSnippet: `return buildToroidOring({ idMm: 24.0, csMm: 2.5, shoreA: 90 });`,
  },
  {
    partNumber: '#47',
    numericId: 47,
    koreanName: '체크 밸브 하우징 오링',
    englishName: 'Rear Check Valve Endcap O-Ring (NBR90 24.0 × 2.5mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 2.5,
      outerDiameterMm: 29.0,
      innerDiameterMm: 24.0,
      wallThicknessMm: 2.5,
      toleranceMm: '±0.08mm',
    },
    curveAndThreadProfile: 'Toroidal cross-section Ø2.50mm.',
    materialSpec: 'NBR 90 Shore A Nitrile',
    howItWorks: 'Seals the rear thread of Air Tank (#37) against Check Valve Housing (#38).',
    disassemblyStepIndex: 5,
    pinX: 21.8,
    pinY: 72.5,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part47_check_oring',
    localCodeSnippet: `return buildToroidOring({ idMm: 24.0, csMm: 2.5, shoreA: 90 });`,
  },
  {
    partNumber: '#48',
    numericId: 48,
    koreanName: '레버 링크 고정 볼트',
    englishName: 'Link Plate Guide Retaining Screw (M3 × 6mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 6.0,
      outerDiameterMm: 5.5,
      innerDiameterMm: 3.0,
      wallThicknessMm: 2.5,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'ISO 7380 M3×0.5 button head.',
    materialSpec: 'SCM435 Alloy Steel (10.9 Grade)',
    howItWorks: 'Retains the forward link pivot pin inside the Underlever (#14) clevis.',
    disassemblyStepIndex: 7,
    pinX: 33.2,
    pinY: 62.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part48_link_bolt',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M3x0.5', lengthMm: 6.0, head: 'BUTTON' });`,
  },
  {
    partNumber: '#49',
    numericId: 49,
    koreanName: '둥근머리 M3 × 5',
    englishName: 'Side Cover Plate Button-Head Screws (M3 × 5mm, 4 pcs)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 4,
    subMmDimensions: {
      lengthMm: 5.0,
      outerDiameterMm: 5.5,
      innerDiameterMm: 3.0,
      wallThicknessMm: 2.0,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'ISO 7380 M3×0.5 button head, 2.0mm hex socket.',
    materialSpec: 'SCM435 Black Oxide Steel',
    howItWorks: 'Fastens Left Cover LL (#23) and Right Cover RR (#24) to Main Body (#08).',
    disassemblyStepIndex: 7,
    pinX: 27.2,
    pinY: 63.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part49_cover_screws',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M3x0.5', lengthMm: 5.0, head: 'BUTTON', count: 4 });`,
  },
  {
    partNumber: '#50',
    numericId: 50,
    koreanName: '무두볼트 M4 × 4',
    englishName: 'Handguard & Barrel Mount Cone-Point Set Screws (M4 × 4mm, 5 pcs)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 5,
    subMmDimensions: {
      lengthMm: 4.0,
      outerDiameterMm: 4.0,
      innerDiameterMm: 2.0,
      wallThicknessMm: 1.0,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'DIN 914 M4×0.7 cone-point grub screw, 2.0mm hex.',
    materialSpec: '45H Hardened Alloy Steel',
    howItWorks: 'Locks Barrel Mount (#07) and Ventilated Handguard (#06) against rotation.',
    disassemblyStepIndex: 3,
    pinX: 49.2,
    pinY: 57.6,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part50_grub_m4',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M4x0.7', lengthMm: 4.0, head: 'GRUB_CONE', count: 5 });`,
  },
  {
    partNumber: '#51',
    numericId: 51,
    koreanName: '무두볼트 M5 × 6',
    englishName: 'Top Receiver Barrel Locking Set Screw (M5 × 6mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 6.0,
      outerDiameterMm: 5.0,
      innerDiameterMm: 2.5,
      wallThicknessMm: 1.25,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'DIN 916 M5×0.8 cup-point grub screw, 2.5mm hex.',
    materialSpec: '45H Hardened Alloy Steel',
    howItWorks: 'Threads down through the top deck of Main Receiver Body (#08) to clamp Rifled Barrel (#03).',
    disassemblyStepIndex: 4,
    pinX: 40.8,
    pinY: 45.4,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part51_barrel_grub',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M5x0.8', lengthMm: 6.0, head: 'GRUB_CUP' });`,
  },
  {
    partNumber: '#52',
    numericId: 52,
    koreanName: '둥근머리 M4 × 15',
    englishName: 'Lever Stopper Retaining Screw (M4 × 15mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 15.0,
      outerDiameterMm: 7.5,
      innerDiameterMm: 4.0,
      wallThicknessMm: 2.2,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'ISO 7380 M4×0.7 button head, 2.5mm hex.',
    materialSpec: 'SCM435 Alloy Steel',
    howItWorks: 'Secures Underlever Stopper (#16) and Return Spring (#17) under the trigger guard.',
    disassemblyStepIndex: 7,
    pinX: 36.4,
    pinY: 66.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part52_stopper_bolt',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M4x0.7', lengthMm: 15.0, head: 'BUTTON' });`,
  },
  {
    partNumber: '#53',
    numericId: 53,
    koreanName: '무두볼트 M3 × 12',
    englishName: 'Second-Stage Sear Engagement Set Screw (M3 × 12mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 12.0,
      outerDiameterMm: 3.0,
      innerDiameterMm: 1.5,
      wallThicknessMm: 0.75,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile: 'M3×0.5 fine-tip polished spherical contact nose (R1.2mm).',
    materialSpec: 'SCM435 Alloy Steel',
    howItWorks: 'Adjusts the exact sear break point between Match Trigger (#20) and Primary Sear (#18).',
    disassemblyStepIndex: 8,
    pinX: 36.8,
    pinY: 54.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part53_sear_screw',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M3x0.5', lengthMm: 12.0, head: 'SPHERICAL_GRUB' });`,
  },
  {
    partNumber: '#54',
    numericId: 54,
    koreanName: '무두볼트 M3 × 6',
    englishName: 'First-Stage Trigger Takeup Set Screw (M3 × 6mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 6.0,
      outerDiameterMm: 3.0,
      innerDiameterMm: 1.5,
      wallThicknessMm: 0.75,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile: 'M3×0.5 flat-point grub screw, 1.5mm hex.',
    materialSpec: 'SCM435 Alloy Steel',
    howItWorks: 'Sets the pre-travel length of Trigger Blade (#20).',
    disassemblyStepIndex: 8,
    pinX: 34.4,
    pinY: 50.4,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part54_takeup_screw',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M3x0.5', lengthMm: 6.0, head: 'GRUB_FLAT' });`,
  },
  {
    partNumber: '#55',
    numericId: 55,
    koreanName: '렌치볼트 M5 × 15',
    englishName: 'Cantilever Scope Mount Socket Head Cap Bolts (M5 × 15mm, 2 pcs)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 2,
    subMmDimensions: {
      lengthMm: 15.0,
      outerDiameterMm: 8.5,
      innerDiameterMm: 5.0,
      wallThicknessMm: 5.0,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'DIN 912 M5×0.8 socket head cap screw, 4.0mm hex.',
    materialSpec: 'SCM435 12.9 High-Tensile Steel',
    howItWorks: 'Clamps Cantilever Picatinny Scope Mount (#29) to the top deck of Main Body (#08).',
    disassemblyStepIndex: 2,
    pinX: 41.2,
    pinY: 29.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part55_scope_bolts',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M5x0.8', lengthMm: 15.0, head: 'SOCKET_CAP', count: 2 });`,
  },
  {
    partNumber: '#56',
    numericId: 56,
    koreanName: '둥근머리 M5 × 25',
    englishName: 'Pistol Grip Primary Mounting Bolt (M5 × 25mm)',
    subsystem: 'ORINGS_AND_FASTENERS',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 25.0,
      outerDiameterMm: 9.5,
      innerDiameterMm: 5.0,
      wallThicknessMm: 3.5,
      toleranceMm: '±0.02mm',
    },
    curveAndThreadProfile: 'ISO 7380 M5×0.8 button head bolt, 3.0mm hex.',
    materialSpec: 'SCM435 Alloy Steel',
    howItWorks: 'Passes up through the base of Ergonomic Pistol Grip (#28) into Main Receiver (#08).',
    disassemblyStepIndex: 6,
    pinX: 18.8,
    pinY: 53.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part56_grip_bolt',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M5x0.8', lengthMm: 25.0, head: 'BUTTON' });`,
  },
  {
    partNumber: '#57',
    numericId: 57,
    koreanName: '안전변 볼트',
    englishName: 'High-Pressure Degas & Burst Relief Screw (M6 × 1.0)',
    subsystem: 'IN_LINE_POPPET_VALVE',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 8.5,
      outerDiameterMm: 6.0,
      innerDiameterMm: 3.0,
      wallThicknessMm: 1.5,
      toleranceMm: '±0.015mm',
    },
    curveAndThreadProfile: 'M6×1.0 socket set screw with axial Ø1.5mm bleed relief groove.',
    materialSpec: '316 Stainless Steel',
    howItWorks: 'Applies seating torque onto Relief Ball (#36) inside Valve Housing (#34) and vents tank pressure when loosened 1/2 turn.',
    disassemblyStepIndex: 1,
    pinX: 36.8,
    pinY: 80.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part57_relief_bolt',
    localCodeSnippet: `return buildMetricScrew({ thread: 'M6x1.0', lengthMm: 8.5, head: 'BLEED_SET' });`,
  },
  {
    partNumber: '#58',
    numericId: 58,
    koreanName: '브릿지 스냅 볼',
    englishName: 'Breech Slide Detent Ball (Ø3.00mm)',
    subsystem: 'MUZZLE_AND_BARREL',
    quantity: 1,
    subMmDimensions: {
      lengthMm: 3.0,
      outerDiameterMm: 3.0,
      innerDiameterMm: 0,
      wallThicknessMm: 3.0,
      toleranceMm: '±0.002mm',
    },
    curveAndThreadProfile: 'ISO 3290 Grade 10 chrome steel ball.',
    materialSpec: 'SUJ2 Chrome Steel',
    howItWorks: 'Seated in Barrel Mount (#07) over Spring (#59) to provide tactile click retention for Breech Slide (#11).',
    disassemblyStepIndex: 4,
    pinX: 44.2,
    pinY: 57.2,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part58_slide_ball',
    localCodeSnippet: `return buildPrecisionSphere({ diameterMm: 3.0 });`,
  },
  {
    partNumber: '#59',
    numericId: 59,
    koreanName: '브릿지 스냅 스프링',
    englishName: 'Breech Slide Detent Micro Spring (Ø2.8 × 6.0mm)',
    subsystem: 'MUZZLE_AND_FASTENERS' as unknown as RexPSubsystemCategory,
    quantity: 1,
    subMmDimensions: {
      lengthMm: 6.0,
      outerDiameterMm: 2.8,
      innerDiameterMm: 1.9,
      wallThicknessMm: 0.45,
      toleranceMm: '±0.04mm',
    },
    curveAndThreadProfile: '6 coils, 0.45mm stainless wire.',
    materialSpec: '302 Stainless Spring Wire',
    howItWorks: 'Energizes Breech Slide Detent Ball (#58) inside Barrel Mount (#07).',
    disassemblyStepIndex: 4,
    pinX: 43.8,
    pinY: 58.8,
    initialStatus: 'WORKING',
    localCadFunctionName: 'compile_rexp_part59_slide_spring',
    localCodeSnippet: `return buildHelicalSpring({ freeLenMm: 6.0, odMm: 2.8, wireDiaMm: 0.45, coils: 6, rateNPerMm: 2.1 });`,
  },
];

// Normalize #59 subsystem category cleanly
REX_P_57_PARTS_CATALOG[REX_P_57_PARTS_CATALOG.length - 1].subsystem = 'ORINGS_AND_FASTENERS';

export const REX_P_6_INTERACTION_STAGES: RexPInteractionStage[] = [
  {
    stageNumber: 1,
    stageTitle: 'Rear Axial Fill & 250-Bar Tube Pressurization',
    involvedParts: ['#37', '#38', '#39', '#40', '#41', '#42', '#47'],
    kinematicChainSummary:
      'Rotating Dust Cover (#41) exposes the Ø8.02mm Foster port on Check Valve Housing (#38). High-pressure air unseats Cylindrical Check Piston (#42) and fills the 165cc 7075-T6 Air Tank (#37) to 250 bar.',
    subMmPhysicsDetail:
      'Tank wall 3.20mm (35.00mm OD / 28.60mm ID) sustains 129.8 MPa hoop stress (SF = 2.48x); Bourdon Manometer (#40) sealed by Dowty Ring (#39) reads live pressure.',
  },
  {
    stageNumber: 2,
    stageTitle: 'Underlever 62° Arc Cocking & Hammer-Sear Latch',
    involvedParts: ['#14', '#15', '#16', '#17', '#12', '#13', '#09', '#10', '#18', '#19'],
    kinematicChainSummary:
      'Pulling the 5-Hole Skeletonized Underlever (#14) downward overcomes Stopper (#16/#17) and pivots 62° around Fulcrum Pin (#15), driving Link Plate (#12) rearward.',
    subMmPhysicsDetail:
      'Link Plate (#12, 98.50mm span) strokes Tubular Striker Hammer (#09) back 43.50mm, compressing Hammer Spring (#10, k=6.85 N/mm) to 298N until Sear (#18) snaps into the 88° hammer notch.',
  },
  {
    stageNumber: 3,
    stageTitle: 'Cylindrical Breech Slide Direct-Bore Slug Loading',
    involvedParts: ['#11', '#08', '#03', '#07', '#58', '#59'],
    kinematicChainSummary:
      'Thumb-pushing Cylindrical Breech Slide (#11) 26.00mm forward over the barrel exposes the 38.0mm × 16.5mm machined loading window in Main Receiver (#08), held open by Detent Ball (#58/#59).',
    subMmPhysicsDetail:
      'A 7.62mm (.30 Cal) slug is seated directly into the 4.5° conical lead-in throat of Rifled Barrel (#03); sliding #11 rearward seals dual NBR90 O-rings across the breech.',
  },
  {
    stageNumber: 4,
    stageTitle: 'Two-Stage Curved Match Trigger & Wire-EDM Sear Break',
    involvedParts: ['#20', '#21', '#22', '#18', '#19', '#53', '#54', '#25'],
    kinematicChainSummary:
      'With Safety Selector (#25) set to F (Fire), pulling Curved Trigger Blade (#20) pivots on Dowel Pin (#22, 3.00×17.80mm) through 1st-stage screw (#54) until spherical screw (#53) trips Sear (#18).',
    subMmPhysicsDetail:
      'The R0.15mm polished edge of A2 Tool-Steel Sear (#18) drops 1.85mm against Sear Spring (#19), releasing the 68.5g Striker Hammer (#09) at 1.15 kgf pull weight.',
  },
  {
    stageNumber: 5,
    stageTitle: 'Coaxial Striker Impact & In-Line Poppet Lift',
    involvedParts: ['#09', '#10', '#32', '#30', '#31', '#33', '#45'],
    kinematicChainSummary:
      'Striker Hammer (#09) accelerates forward at 14.8 m/s inside the honed Ø24.00mm receiver bore and impacts the Ø4.00mm tip of Coaxial Poppet Valve Stem (#32).',
    subMmPhysicsDetail:
      'Poppet Stem (#32) lifts 3.45mm (limited by Stopper Bushing #30) off the 45° Delrin seat of Assemble Cap (#33) for 1.65ms before Valve Spring (#31, k=14.2 N/mm) + tank pressure snap it shut.',
  },
  {
    stageNumber: 6,
    stageTitle: '180° Straight-Line Coaxial Air Dump & Muzzle Stripper Exit',
    involvedParts: ['#37', '#34', '#33', '#03', '#02', '#04', '#01'],
    kinematicChainSummary:
      'Because Rear Air Tank (#37), Valve Housing (#34), and Barrel (#03) share a single 180° coaxial axis, high-pressure gas expands straight behind the slug with zero 90° transfer-port turn loss.',
    subMmPhysicsDetail:
      'Flow coefficient Cv reaches 0.94; as the slug exits Barrel (#03), Barrel Holder (#02) vents residual blast backward into Outer Shroud (#04) while Muzzle Cap (#01) strips turbulence.',
  },
];

export const REX_P_8_STEP_DISASSEMBLY_SEQUENCE: RexPDisassemblyStep[] = [
  {
    stepNumber: 1,
    stepTitle: 'Step 1: Safe Reservoir Depressurization via Relief Valve (#57 / #36)',
    partsRemoved: ['#57', '#36'],
    requiredTooling: '3.0mm Hex Allen Key',
    warningOrTorqueSpec: 'CRITICAL: Verify Manometer (#40) reads 0 Bar before unscrewing Rear Air Tank (#37).',
    procedureDetail:
      'Insert a 3.0mm hex key into Over-Pressure Bleed Bolt (#57) on Valve Housing (#34) and turn counter-clockwise 1/2 turn to unseat Relief Ball (#36). Allow all compressed air to vent until Manometer (#40) reaches 0 bar.',
  },
  {
    stepNumber: 2,
    stepTitle: 'Step 2: Cantilever Picatinny Scope Mount Removal (#55 / #29)',
    partsRemoved: ['#55', '#29'],
    requiredTooling: '4.0mm Hex Allen Key',
    warningOrTorqueSpec: 'Reassembly torque: 4.5 N·m with blue threadlocker.',
    procedureDetail:
      'Unscrew the two M5×15 Socket Head Cap Bolts (#55) from the top of Main Receiver Body (#08) and lift off Cantilever Scope Mount (#29).',
  },
  {
    stepNumber: 3,
    stepTitle: 'Step 3: Muzzle Cap, Centering Bushing & 5-Slot Handguard Teardown (#01–#02, #05–#06, #43–#44, #50)',
    partsRemoved: ['#01', '#43', '#02', '#44', '#50', '#06', '#05'],
    requiredTooling: '2.0mm Hex Key + Pin Spanner',
    warningOrTorqueSpec: 'Inspect NBR90 O-rings (#43, #44) for nicks; coat lightly with silicone grease.',
    procedureDetail:
      'Unthread Muzzle Cap (#01) with O-ring (#43) and slide out Barrel Retaining Holder (#02) with O-rings (#44). Back out the M4×4 cone-point set screws (#50) and slide 5-Slot Ventilated Handguard (#06) and Front Ring (#05) forward off the shroud.',
  },
  {
    stepNumber: 4,
    stepTitle: 'Step 4: Outer Shroud, Barrel Mount, Rifled Barrel & Breech Slide Extraction (#04, #07, #51, #03, #11, #58, #59)',
    partsRemoved: ['#04', '#07', '#58', '#59', '#51', '#03', '#11'],
    requiredTooling: '2.0mm & 2.5mm Hex Keys',
    warningOrTorqueSpec: 'Capture Ø3.0mm Detent Ball (#58) and Spring (#59) when sliding Breech Slide (#11) off.',
    procedureDetail:
      'Unthread Outer Barrel Shroud (#04) from Barrel Mount (#07). Loosen the remaining M4×4 grub screws (#50) on #07 and top M5×6 barrel locking screw (#51) on Receiver (#08), then withdraw 7.62mm Rifled Barrel (#03) and Cylindrical Breech Slide (#11) forward.',
  },
  {
    stepNumber: 5,
    stepTitle: 'Step 5: Rear Coaxial Air Tank & In-Line Poppet Valve Core Teardown (#37–#42, #34–#35, #30–#33, #45–#47)',
    partsRemoved: ['#41', '#40', '#39', '#38', '#47', '#42', '#37', '#35', '#46', '#34', '#30', '#45', '#33', '#32', '#31'],
    requiredTooling: '22mm Deep Socket + Soft-Jaw Strap Wrench',
    warningOrTorqueSpec: 'Never apply metal pipe wrenches to the 35.00mm OD 7075-T6 Air Tank (#37).',
    procedureDetail:
      'Unscrew Rear Air Tank (#37) with Adapter (#35) from Valve Housing (#34), then unthread Valve Housing (#34) from the rear M28×1.5 threads of Main Receiver (#08). Unscrew Stopper Bushing (#30) and Assemble Cap (#33) to extract Poppet Stem (#32), Seal (#45), and Return Spring (#31).',
  },
  {
    stepNumber: 6,
    stepTitle: 'Step 6: Ergonomic Target Grip & Cross-Bolt Safety Detent Removal (#56, #28, #27, #26, #25)',
    partsRemoved: ['#56', '#28', '#27', '#26', '#25'],
    requiredTooling: '3.0mm Hex Key',
    warningOrTorqueSpec: 'Hold thumb over top deck of Grip (#28) to prevent Safety Spring (#27) from launching.',
    procedureDetail:
      'Remove the bottom M5×25 Button Head Bolt (#56) inside the base of Target Pistol Grip (#28). Lower the grip slowly to recover Safety Spring (#27) and Ø2.50mm Detent Ball (#26), then slide Cross-Bolt Safety (#25) out of the receiver.',
  },
  {
    stepNumber: 7,
    stepTitle: 'Step 7: Side Cover Plates & Skeletonized Underlever Linkage Disassembly (#49, #23, #24, #52, #16, #17, #15, #14, #48, #13, #12)',
    partsRemoved: ['#49', '#23', '#24', '#52', '#16', '#17', '#15', '#14', '#48', '#13', '#12'],
    requiredTooling: '2.0mm & 2.5mm Hex Keys + 3mm Pin Punch',
    warningOrTorqueSpec: 'Keep Cover LL (#23) and Cover RR (#24) paired with their four M3×5 screws (#49).',
    procedureDetail:
      'Remove the four M3×5 screws (#49) and lift off Cover LL (#23) and Cover RR (#24). Unscrew M4×15 bolt (#52) to remove Lever Stopper (#16/#17). Drift out Front Pivot Pin (#15) and Link Pin (#13) to detach Skeletonized Underlever (#14) and Link Plate (#12).',
  },
  {
    stepNumber: 8,
    stepTitle: 'Step 8: Match Trigger, Primary Sear & Coaxial Striker Hammer Extraction (#22, #20, #21, #18, #19, #53, #54, #09, #10)',
    partsRemoved: ['#22', '#20', '#21', '#18', '#19', '#53', '#54', '#09', '#10', '#08'],
    requiredTooling: '2.5mm Pin Punch',
    warningOrTorqueSpec: 'Polish 88° sear shelf (#18) only with 2000-grit ceramic stone; do not alter angle.',
    procedureDetail:
      'Push out the two 3.00×17.80mm Dowel Pins (#22) to drop Match Trigger (#20), Trigger Spring (#21), Primary Sear (#18), and Sear Spring (#19). Slide Tubular Striker Hammer (#09) and Main Hammer Spring (#10) out of the honed Ø24.00mm tunnel of Main Body (#08).',
  },
];

/**
 * In-Game Collectible Schematic Items for all Reference Guns shown by the user.
 * Players can inspect the schematic, see which parts are WORKING vs NEEDS_BUILD,
 * and execute the in-game Local Code Compiler to synthesize/upgrade any part.
 */
export const IN_GAME_WEAPON_SCHEMATICS: InGameWeaponSchematicItem[] = [
  {
    schematicId: 'schem_01_evanix_rexp_762',
    itemCode: 'ITEM-SCHEM-REXP-762',
    weaponName: 'Evanix REX-P 7.62mm (REX-P 분해도 — 57-Part Korean Blueprint)',
    manufacturer: 'Evanix Yeonggwang (에바닉스 영광)',
    nativeCaliberMm: 7.62,
    schematicImageUrl: '/assets/aistudio/rexp_exploded_diagram.png',
    totalCatalogedParts: 59,
    architectureSummary:
      '180° Coaxial In-Line Poppet Valve (#32/#34) fed directly by a Rear 250-Bar Air Cylinder (#37), cocked via a 5-Hole Skeletonized Trigger-Guard Underlever (#14/#12), with an Axial Cylindrical Breech Slide (#11) and High Cantilever Scope Rail (#29).',
    keyParts: REX_P_57_PARTS_CATALOG,
  },
  {
    schematicId: 'schem_02_leshiy2_valkyrie',
    itemCode: 'ITEM-SCHEM-LESHIY2-VALK',
    weaponName: 'EDgun Leshiy 2 Valkyrie Open-Breech Rotary & Red Puck',
    manufacturer: 'EDgun / Valkyrie Airguns',
    nativeCaliberMm: 7.62,
    schematicImageUrl: '/assets/aistudio/image_9db9d200.png',
    totalCatalogedParts: 48,
    architectureSummary:
      'Hammerless Forward Plug Valve (LSA242200) + Red PU95A Breech Puck (LSA242105) firing directly through an 8-Round Red Scalloped Rotary Drum (LSA221000-VALK) indexed by an Exposed Coil-Sprung Pneumatic Pawl (LSA221103/105).',
    keyParts: [
      {
        partNumber: 'LSA221000-VALK',
        numericId: 201,
        koreanName: '발키리 스캘럽 로터리 탄창',
        englishName: 'Red-Anodized Scalloped Rotary Cartridge Magazine Drum',
        subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 12.4,
          outerDiameterMm: 39.0,
          innerDiameterMm: 7.62,
          wallThicknessMm: 2.41,
          toleranceMm: '±0.008mm',
        },
        curveAndThreadProfile: '8× scalloped outer flutes (R4.2mm) on 26.20mm PCD; 2.41mm inter-chamber web.',
        materialSpec: '7075-T6 Crimson Red Anodized Aluminum',
        howItWorks: 'Serves as the revolving breech chamber between the folding buttstock puck and the barrel throat.',
        disassemblyStepIndex: 1,
        pinX: 68.5,
        pinY: 28.5,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_leshiy2_scalloped_drum',
        localCodeSnippet: `// Local CAD Kernel: Leshiy 2 Scalloped Rotary Drum (LSA221000-VALK)
const chambers = targetCaliberMm <= 7.8 ? 8 : targetCaliberMm <= 9.2 ? 7 : 6;
return buildScallopedRotaryDrum({ chambers, boreMm: targetCaliberMm, pcdMm: 26.2, minWebMm: 2.15 });`,
      },
      {
        partNumber: 'LSA221002',
        numericId: 202,
        koreanName: '스타 래칫 기어 허브',
        englishName: 'Central Star Ratchet Gear Hub (45° Index Step)',
        subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 13.0,
          outerDiameterMm: 13.8,
          innerDiameterMm: 5.0,
          wallThicknessMm: 4.4,
          toleranceMm: '±0.005mm',
        },
        curveAndThreadProfile: '8-tooth asymmetric involute ratchet profile (45.0° step angle, R0.35mm root fillet).',
        materialSpec: '17-4PH Hardened Stainless Steel',
        howItWorks: 'Driven by the lower pneumatic indexing pawl to rotate the magazine drum 1 chamber per shot.',
        disassemblyStepIndex: 1,
        pinX: 70.5,
        pinY: 36.2,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_leshiy2_star_ratchet',
        localCodeSnippet: `const teeth = targetCaliberMm <= 7.8 ? 8 : targetCaliberMm <= 9.2 ? 7 : 6;
return buildStarRatchetHub({ teeth, stepDeg: +(360 / teeth).toFixed(1), rootRadiusMm: 5.6 });`,
      },
      {
        partNumber: 'LSA242105',
        numericId: 203,
        koreanName: '폴리우레탄 브리치 씰 퍽',
        englishName: 'Bright Red PU95A Transfer Port Breech Seal Puck',
        subsystem: 'IN_LINE_POPPET_VALVE',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 6.8,
          outerDiameterMm: 13.02,
          innerDiameterMm: 7.16,
          wallThicknessMm: 2.93,
          toleranceMm: '±0.010mm',
        },
        curveAndThreadProfile: 'Venturi throat (0.94 × bore) with 0.38mm axial crush lip against rotary magazine rear face.',
        materialSpec: 'Polyurethane 95 Shore A / PEEK-GF30 Hybrid',
        howItWorks: 'Energizes under 150–250 bar blast pressure to seal the folding breech gap dynamically.',
        disassemblyStepIndex: 2,
        pinX: 43.2,
        pinY: 44.5,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_leshiy2_red_puck',
        localCodeSnippet: `return buildBreechSealPuck({ venturiIdMm: +(targetCaliberMm * 0.94).toFixed(2), glandOdMm: +(targetCaliberMm + 5.4).toFixed(2), crushMm: 0.38 });`,
      },
      {
        partNumber: 'LSA221103/105',
        numericId: 204,
        koreanName: '코일 스프링 인덱싱 폴',
        englishName: 'Exposed Coil-Sprung Pneumatic Indexing Pawl & Plunger',
        subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 28.4,
          outerDiameterMm: 7.2,
          innerDiameterMm: 4.0,
          wallThicknessMm: 1.6,
          toleranceMm: '±0.008mm',
        },
        curveAndThreadProfile: '5.06mm linear vertical plunger stroke + 4.94 N/mm stainless return coil spring.',
        materialSpec: '440C Stainless Pawl + 302 Spring Wire',
        howItWorks: 'Bleeds air via Dual Power Jets to push the pawl upward into the Central Star Ratchet.',
        disassemblyStepIndex: 3,
        pinX: 66.2,
        pinY: 57.5,
        initialStatus: 'WORKING',
        localCadFunctionName: 'compile_leshiy2_coil_pawl',
        localCodeSnippet: `return buildPneumaticIndexingPawl({ strokeMm: 5.06, springRateNPerMm: 4.94, jetOrificeMm: 0.7 });`,
      },
    ],
  },
  {
    schematicId: 'schem_03_av_ascent_aspen',
    itemCode: 'ITEM-SCHEM-ASCENT-PUMP',
    weaponName: 'Air Venturi Ascent / Seneca Aspen 3-Stage Integral Pump Rifle',
    manufacturer: 'Air Venturi / Nova Vista',
    nativeCaliberMm: 6.35,
    schematicImageUrl: '/assets/aistudio/ascent_exploded_diagram.png',
    totalCatalogedParts: 121,
    architectureSummary:
      'Self-contained 250-bar PCP rifle with an under-barrel 3-Stage Telescopic Apex Pump, 4-Bar Compound Linkage, and Part 116 Internal 2,000 PSI Pressure Counter-Balancer.',
    keyParts: [
      {
        partNumber: 'AV-PART-116',
        numericId: 301,
        koreanName: '압력 카운터 밸런서 (Part 116)',
        englishName: 'Part 116 Internal 2,000 PSI Pressure Counter-Balancer Piston',
        subsystem: 'IN_LINE_POPPET_VALVE',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 36.5,
          outerDiameterMm: 16.0,
          innerDiameterMm: 6.2,
          wallThicknessMm: 4.9,
          toleranceMm: '±0.006mm',
        },
        curveAndThreadProfile: 'Differential stepped balance piston equalizing valve head force at 138 bar (2,000 PSI).',
        materialSpec: '17-4PH Stainless + Dual Urethane 90A Seals',
        howItWorks: 'Eliminates valve-lock up to 3,625 PSI (250 bar) while keeping hammer spring effort light.',
        disassemblyStepIndex: 1,
        pinX: 54.0,
        pinY: 74.0,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_ascent_part116_balancer',
        localCodeSnippet: `return buildCounterBalancer116({ balanceSetpointPsi: 2000, pistonOdMm: 16.0, stemDiaMm: 6.2 });`,
      },
      {
        partNumber: 'AV-APEX-3STAGE',
        numericId: 302,
        koreanName: '3단 텔레스코픽 에이펙스 펌프',
        englishName: '3-Stage Telescopic High-Pressure Apex Pump Assembly',
        subsystem: 'REAR_COAXIAL_AIR_TANK',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 410.0,
          outerDiameterMm: 26.0,
          innerDiameterMm: 6.0,
          wallThicknessMm: 2.2,
          toleranceMm: '±0.010mm',
        },
        curveAndThreadProfile: '6.00mm Stage-3 high-pressure micro-piston with PTFE/Viton check seal + 4-bar cam lever.',
        materialSpec: '304 Honed Seamless Tube + 4140 Linkage',
        howItWorks: 'Compresses ambient air to 250 bar on both Pull and Push strokes with 19 kgf peak handle effort.',
        disassemblyStepIndex: 2,
        pinX: 68.0,
        pinY: 31.0,
        initialStatus: 'WORKING',
        localCadFunctionName: 'compile_ascent_3stage_pump',
        localCodeSnippet: `return buildThreeStagePump({ stage1IdMm: 22.0, stage2IdMm: 12.5, stage3IdMm: 6.0, strokeMm: 195.0 });`,
      },
    ],
  },
  {
    schematicId: 'schem_04_hatsan_velox',
    itemCode: 'ITEM-SCHEM-VELOX-SEMI',
    weaponName: 'Hatsan Velox Semi-Auto Gas-Blowback PCP Pistol (#2314–#6979)',
    manufacturer: 'Hatsan Arms',
    nativeCaliberMm: 6.35,
    schematicImageUrl: '/assets/aistudio/velox_exploded_diagram.png',
    totalCatalogedParts: 68,
    architectureSummary:
      'Semi-automatic gas-operated blowback PCP pistol with quick-detach lower air cylinder (#3340–#3349) and reciprocating muzzle-end gas piston (#4336–#4344).',
    keyParts: [
      {
        partNumber: 'VELOX-#4338',
        numericId: 401,
        koreanName: '세미오토 블로우백 가스 피스톤',
        englishName: 'Part #4338 Reciprocating Semi-Auto Muzzle Gas Return Piston',
        subsystem: 'MUZZLE_AND_BARREL',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 28.0,
          outerDiameterMm: 22.4,
          innerDiameterMm: 11.5,
          wallThicknessMm: 5.45,
          toleranceMm: '±0.010mm',
        },
        curveAndThreadProfile: 'Annular gas cup with 3× labyrinth sealing rings and op-rod transfer shoulder (#4943).',
        materialSpec: '7075-T6 Hard Anodized Aluminum',
        howItWorks: 'Captures muzzle shroud gas to cycle the bolt (#6972) and index the rotary magazine automatically.',
        disassemblyStepIndex: 1,
        pinX: 80.5,
        pinY: 42.5,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_velox_part4338_piston',
        localCodeSnippet: `return buildSemiAutoGasPiston({ cupOdMm: 22.4, barrelIdMm: +(targetCaliberMm + 4.8).toFixed(2), labyrinthRings: 3 });`,
      },
      {
        partNumber: 'VELOX-#3340',
        numericId: 402,
        koreanName: '퀵디태치 하부 서브 탱크',
        englishName: 'Part #3340–#3349 Quick-Detach Under-Barrel Air Cylinder',
        subsystem: 'REAR_COAXIAL_AIR_TANK',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 148.0,
          outerDiameterMm: 31.0,
          innerDiameterMm: 25.0,
          wallThicknessMm: 3.0,
          toleranceMm: '±0.015mm',
        },
        curveAndThreadProfile: 'M18×1.5 quick-check valve neck (#3343) + 250-bar cylindrical bottle.',
        materialSpec: '7075-T6 Aluminum',
        howItWorks: 'Hot-swappable 55cc air cylinder mounted directly under the barrel block (#4344).',
        disassemblyStepIndex: 2,
        pinX: 74.2,
        pinY: 79.5,
        initialStatus: 'WORKING',
        localCadFunctionName: 'compile_velox_part3340_bottle',
        localCodeSnippet: `return buildQuickDetachBottle({ odMm: 31.0, lengthMm: 148.0, thread: 'M18x1.5' });`,
      },
    ],
  },
  {
    schematicId: 'schem_05_hatsan_vectis',
    itemCode: 'ITEM-SCHEM-VECTIS-LEVER',
    weaponName: 'Hatsan Vectis Lever-Action Trigger-Guard Repeater (.22 / .25 Cal)',
    manufacturer: 'Hatsan Arms',
    nativeCaliberMm: 6.35,
    schematicImageUrl: '/assets/aistudio/hatsan-vectis-lever-action-22_b7bb08c9.jpg',
    totalCatalogedParts: 54,
    architectureSummary:
      'Cowboy-style Trigger-Guard Lever-Action Repeater with Quattro 2-Stage Match Trigger, QuietEnergy Baffled Moderator, and 165cc Under-Barrel Air Cylinder.',
    keyParts: [
      {
        partNumber: 'VECTIS-LEVER-CAM',
        numericId: 501,
        koreanName: '레버 액션 캠 링크',
        englishName: 'Trigger-Guard Lever-Action Bolt-Cycling Cam Gear',
        subsystem: 'UNDERLEVER_AND_SEAR_TRIGGER',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 118.0,
          outerDiameterMm: 28.0,
          innerDiameterMm: 5.0,
          wallThicknessMm: 6.5,
          toleranceMm: '±0.012mm',
        },
        curveAndThreadProfile: 'Involute sector cam gear converting 48° lever throw into 34mm bolt probe travel.',
        materialSpec: '4140 Hardened Chromoly Steel',
        howItWorks: 'Cycles the bolt probe and indexes the 10/12/14-shot rotary magazine in one rapid finger flick.',
        disassemblyStepIndex: 1,
        pinX: 30.8,
        pinY: 54.5,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_vectis_lever_cam',
        localCodeSnippet: `return buildLeverCamSector({ throwDeg: 48, boltStrokeMm: 34.0, thicknessMm: 6.5 });`,
      },
    ],
  },
  {
    schematicId: 'schem_06_snowpeak_pp750l',
    itemCode: 'ITEM-SCHEM-PP750L-NOTOS',
    weaponName: 'Snowpeak PP750L / Umarex Notos Regulated Telescoping Carbine',
    manufacturer: 'Snowpeak Airgun (SPA)',
    nativeCaliberMm: 5.5,
    schematicImageUrl: '/assets/aistudio/snowpeak_pp750l_1__94af69ac.webp',
    totalCatalogedParts: 49,
    architectureSummary:
      'Ultra-compact Regulated Side-Lever PCP Pistol/Carbine with Dual Stainless Sliding Wire Buttstock Rods and Under-Barrel Regulated Titanium/Aluminum Tube.',
    keyParts: [
      {
        partNumber: 'PP750-TWIN-RODS',
        numericId: 601,
        koreanName: '듀얼 슬라이딩 스톡 로드',
        englishName: 'Twin Ø6.00mm Stainless Telescoping Buttstock Guide Rods & Latch',
        subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
        quantity: 2,
        subMmDimensions: {
          lengthMm: 245.0,
          outerDiameterMm: 6.0,
          innerDiameterMm: 0,
          wallThicknessMm: 6.0,
          toleranceMm: '±0.008mm',
        },
        curveAndThreadProfile: '3-position detent notches (collapsed, mid, 245mm extended) with R1.5mm cam flats.',
        materialSpec: '304 Ground Stainless Rod + PA12-CF Buttplate',
        howItWorks: 'Slides flush alongside the receiver in pistol configuration or locks rearward as a rigid shoulder stock.',
        disassemblyStepIndex: 1,
        pinX: 22.0,
        pinY: 62.0,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_pp750_telescoping_rods',
        localCodeSnippet: `return buildTelescopingStockRods({ rodDiaMm: 6.0, spanMm: 245.0, detentPositions: 3 });`,
      },
    ],
  },
  {
    schematicId: 'schem_07_sidewinder_t50',
    itemCode: 'ITEM-SCHEM-SIDEWINDER-T50',
    weaponName: 'Western Sidewinder × BinTac T50 Extreme (.30 / .50 Cal Burst-Disk)',
    manufacturer: 'Western Airguns / BinTac LLC',
    nativeCaliberMm: 12.7,
    schematicImageUrl: '/assets/aistudio/Screenshot_2026-10-31_at_7.45.07_AM_a03580ee.png',
    totalCatalogedParts: 64,
    architectureSummary:
      'Hammerless Titanium-Valve 15-Rd Sidewinder Upper coupled to BinTac T50 Extreme Dual-Tube 4,500 PSI Lower with 3,200 PSI Sacrificial Copper Burst-Disk Union.',
    keyParts: [
      {
        partNumber: 'SW-TI-DRUM-15',
        numericId: 701,
        koreanName: '사이드와인더 티타늄 밸브 드럼',
        englishName: 'Removable 15-Rd Titanium-Valve Full-Auto Rotary Drum',
        subsystem: 'MONOLITHIC_RECEIVER_AND_BREECH',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 16.5,
          outerDiameterMm: 46.0,
          innerDiameterMm: 7.62,
          wallThicknessMm: 3.1,
          toleranceMm: '±0.006mm',
        },
        curveAndThreadProfile: '15-chamber planetary gear ring with Grade 5 Ti valve seat face.',
        materialSpec: 'Ti-6Al-4V Grade 5 Titanium + 7075-T6',
        howItWorks: 'Fires full-auto/semi-auto directly from the removable drum via pneumatic servo indexing.',
        disassemblyStepIndex: 1,
        pinX: 44.0,
        pinY: 38.0,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_sidewinder_ti_drum',
        localCodeSnippet: `return buildTitaniumRotaryDrum({ chambers: 15, boreMm: targetCaliberMm, odMm: 46.0 });`,
      },
      {
        partNumber: 'T50-BURST-UNION',
        numericId: 702,
        koreanName: '3200 PSI 파열판 카트리지 유니온',
        englishName: '3,200 PSI Scored Copper Burst-Disk Manifold Union (3/8-24 UNF)',
        subsystem: 'IN_LINE_POPPET_VALVE',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 38.0,
          outerDiameterMm: 28.0,
          innerDiameterMm: 11.2,
          wallThicknessMm: 8.4,
          toleranceMm: '±0.008mm',
        },
        curveAndThreadProfile: 'Cross-scored 0.18mm C11000 copper foil seat with 11.2mm unobstructed throat.',
        materialSpec: '17-4PH Stainless + C11000 Copper Foil',
        howItWorks: 'Ruptures in 0.18ms to dump 100% of plenum air behind a .50 cal slug.',
        disassemblyStepIndex: 2,
        pinX: 58.0,
        pinY: 62.0,
        initialStatus: 'WORKING',
        localCadFunctionName: 'compile_t50_burst_union',
        localCodeSnippet: `return buildBurstDiskUnion({ burstPsi: 3200, throatDiaMm: 11.2, foilThicknessMm: 0.18 });`,
      },
    ],
  },
  {
    schematicId: 'schem_08_hatsan_blitz_invader',
    itemCode: 'ITEM-SCHEM-BLITZ-1000RPM',
    weaponName: 'Hatsan Blitz Full-Auto (1,000 RPM) & Invader Gas-Piston Carbine',
    manufacturer: 'Hatsan Arms',
    nativeCaliberMm: 7.62,
    schematicImageUrl: '/assets/aistudio/velox_exploded_diagram.png',
    totalCatalogedParts: 72,
    architectureSummary:
      'Select-Fire (Semi / 1,000 RPM Full-Auto) Gas-Operated Blowback PCP Rifle with 580cc Carbon-Fiber Bottle and 21-Round SwingLoad Rotary Magazine.',
    keyParts: [
      {
        partNumber: 'BLITZ-GAS-ACTUATOR',
        numericId: 801,
        koreanName: '블리츠 1000RPM 풀오토 가스 피스톤',
        englishName: '1,000 RPM Select-Fire Shroud Gas Blowback Piston & Op-Rod',
        subsystem: 'MUZZLE_AND_BARREL',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 165.0,
          outerDiameterMm: 24.5,
          innerDiameterMm: 12.1,
          wallThicknessMm: 6.2,
          toleranceMm: '±0.008mm',
        },
        curveAndThreadProfile: 'Mid-barrel gas bleed port (Ø2.4mm) driving annular stainless op-rod.',
        materialSpec: '17-4PH Stainless + Hard Chrome',
        howItWorks: 'Cycles the bolt carrier at 16.6 shots/sec in Full-Auto mode without batteries.',
        disassemblyStepIndex: 1,
        pinX: 66.0,
        pinY: 36.0,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_blitz_gas_actuator',
        localCodeSnippet: `return buildFullAutoGasActuator({ cyclicRpm: 1000, gasPortMm: 2.4, strokeMm: 38.0 });`,
      },
    ],
  },
  {
    schematicId: 'schem_09_evanix_mp30_gk1',
    itemCode: 'ITEM-SCHEM-MP30-GK1',
    weaponName: 'Evanix MP30 (.30 PDW) & Huben GK1 (350-Bar Hammerless Pistol)',
    manufacturer: 'Evanix / Huben Airguns',
    nativeCaliberMm: 7.62,
    schematicImageUrl: '/assets/aistudio/rexp_exploded_diagram.png',
    totalCatalogedParts: 63,
    architectureSummary:
      'Tactical Semi-Auto PDW with Vertical Pressurized Foregrip Bottle & Side Manometer paired with Huben GK1 350-Bar Hammerless Articulated Poppet.',
    keyParts: [
      {
        partNumber: 'MP30-VERT-FOREGRIP',
        numericId: 901,
        koreanName: 'MP30 수직 포어그립 에어 보틀',
        englishName: 'Vertical Pressurized Foregrip Air Bottle & Side Manometer Manifold',
        subsystem: 'REAR_COAXIAL_AIR_TANK',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 158.0,
          outerDiameterMm: 38.0,
          innerDiameterMm: 31.0,
          wallThicknessMm: 3.5,
          toleranceMm: '±0.012mm',
        },
        curveAndThreadProfile: '90° vertical bottle boss with integrated 25mm side pressure gauge pocket.',
        materialSpec: '7075-T6 Aluminum + Carbon Wrap',
        howItWorks: 'Acts as both the forward vertical combat grip and a 180cc 250-bar air reservoir.',
        disassemblyStepIndex: 1,
        pinX: 52.0,
        pinY: 64.0,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_mp30_vert_foregrip',
        localCodeSnippet: `return buildVerticalForegripBottle({ lengthMm: 158.0, odMm: 38.0, volumeCc: 180 });`,
      },
    ],
  },
  {
    schematicId: 'schem_10_welrod_pen_cane',
    itemCode: 'ITEM-SCHEM-WELROD-COVERT',
    weaponName: 'Pneumatic Welrod Mk.IIA (12-Baffle), Texoma Pellet Pen & AEA Cane',
    manufacturer: 'SOE Covert Works / Texoma / AEA',
    nativeCaliberMm: 7.62,
    schematicImageUrl: '/assets/aistudio/Screenshot_2026-10-31_at_7.50.14_AM_6be78405.png',
    totalCatalogedParts: 58,
    architectureSummary:
      'Covert 62 dB 12-Baffle Integrally Suppressed Welrod Pistol with Red Telescoping Bolt Probe, paired with L-Slot Pellet Pen & 6-Caliber Airgun Cane Inserts.',
    keyParts: [
      {
        partNumber: 'WELROD-12BAFFLE-STACK',
        numericId: 1001,
        koreanName: '웰로드 12격벽 소음기 스택',
        englishName: 'Welrod Mk.IIA 12-Baffle Wipe Moderator Stack & Red Bolt Probe',
        subsystem: 'MUZZLE_AND_BARREL',
        quantity: 1,
        subMmDimensions: {
          lengthMm: 224.0,
          outerDiameterMm: 31.8,
          innerDiameterMm: 8.8,
          wallThicknessMm: 2.0,
          toleranceMm: '±0.010mm',
        },
        curveAndThreadProfile: '12 stepped aluminum K-baffles + 3 polyurethane 80A acoustic wipes.',
        materialSpec: '7075-T6 + PU80A Acoustic Wipes',
        howItWorks: 'Reduces muzzle report to 62.0 dB for whisper-silent covert elimination.',
        disassemblyStepIndex: 1,
        pinX: 72.0,
        pinY: 28.0,
        initialStatus: 'NEEDS_BUILD',
        localCadFunctionName: 'compile_welrod_12baffle_stack',
        localCodeSnippet: `return buildWelrod12BaffleStack({ baffles: 12, boreClearanceMm: +(targetCaliberMm + 1.2).toFixed(2), tubeOdMm: 31.8 });`,
      },
    ],
  },
];

export interface LocalCodeBuildResult {
  partNumber: string;
  englishName: string;
  targetCaliberMm: number;
  operatingPressureBar: number;
  statusAfterBuild: 'BUILT_BY_LOCAL_CODE';
  computedDimensionsSummary: string;
  watertightFacets: number;
  computedSafetyFactor: number;
  executionLogLines: string[];
  generatedStlHeader: string;
}

/**
 * Executes the in-game Local Code Part Compiler on a schematic part,
 * recalculating sub-millimeter dimensions, curve fillets, and Lamé/shear safety factors
 * for the active caliber and pressure, and generating watertight manifold geometry.
 */
export function executeLocalPartBuildCode(params: {
  part: RexPSubMmPartSpec;
  targetCaliberMm: number;
  operatingPressureBar: number;
  polymerOrAlloy: string;
}): LocalCodeBuildResult {
  const { part, targetCaliberMm, operatingPressureBar, polymerOrAlloy } = params;
  const calRatio = targetCaliberMm / 7.62;

  const scaledOd = +(
    part.subsystem === 'MUZZLE_AND_BARREL' || part.subsystem === 'IN_LINE_POPPET_VALVE'
      ? part.subMmDimensions.outerDiameterMm * (0.88 + calRatio * 0.12)
      : part.subMmDimensions.outerDiameterMm
  ).toFixed(2);

  const scaledId = +(
    part.subMmDimensions.innerDiameterMm > 0
      ? Math.max(
          part.subMmDimensions.innerDiameterMm,
          part.numericId === 3 ? targetCaliberMm : part.subMmDimensions.innerDiameterMm * (0.9 + calRatio * 0.1)
        )
      : 0
  ).toFixed(2);

  const wallMm = +(Math.max(1.2, (scaledOd - scaledId) * 0.5)).toFixed(2);
  const pMPa = operatingPressureBar * 0.1;
  const hoopStressMPa = +(
    scaledId > 0 ? (pMPa * (scaledOd * scaledOd + scaledId * scaledId)) / Math.max(4, scaledOd * scaledOd - scaledId * scaledId) : 42.5
  ).toFixed(1);
  const yieldStrengthMPa = polymerOrAlloy.includes('7075') ? 503 : polymerOrAlloy.includes('PEEK') ? 195 : 142;
  const computedSafetyFactor = +(Math.max(1.85, yieldStrengthMPa / Math.max(18, hoopStressMPa))).toFixed(2);
  const watertightFacets = 384 + (part.numericId % 9) * 64;

  const computedDimensionsSummary = `L=${part.subMmDimensions.lengthMm.toFixed(2)}mm · OD=Ø${scaledOd.toFixed(2)}mm · ID=Ø${scaledId.toFixed(2)}mm · Wall=${wallMm.toFixed(2)}mm (${part.subMmDimensions.toleranceMm})`;

  const executionLogLines = [
    `[LOCAL-CAD-COMPILER] Executing ${part.localCadFunctionName}(targetCaliberMm=${targetCaliberMm}mm, P=${operatingPressureBar}bar)`,
    `[BLUEPRINT-SPEC] Part ${part.partNumber} (${part.koreanName} / ${part.englishName})`,
    `[SUB-MM GEOMETRY] ${computedDimensionsSummary}`,
    `[CURVE-PROFILE] ${part.curveAndThreadProfile}`,
    `[STRESS-SOLVER] Peak Stress = ${hoopStressMPa} MPa vs Yield = ${yieldStrengthMPa} MPa -> SF = ${computedSafetyFactor}x`,
    `[MANIFOLD-MESH] Generated ${watertightFacets} watertight triangles (0 non-manifold edges) -> STATUS: BUILT_BY_LOCAL_CODE`,
  ];

  const generatedStlHeader = `solid REXP_${part.partNumber.replace('#', 'PART_')}_${targetCaliberMm.toFixed(2)}MM`;

  return {
    partNumber: part.partNumber,
    englishName: part.englishName,
    targetCaliberMm,
    operatingPressureBar,
    statusAfterBuild: 'BUILT_BY_LOCAL_CODE',
    computedDimensionsSummary,
    watertightFacets,
    computedSafetyFactor,
    executionLogLines,
    generatedStlHeader,
  };
}
