import { CanonicalGunProgressionId } from './canonicalProgressionAndBlueprints';

export type Isolated3DFocusPartId =
  | 'FULL_SIDE_PROFILE'
  | 'FOCUS_SILENCER'
  | 'FOCUS_BARREL_COVER'
  | 'FOCUS_RECEIVER'
  | 'FOCUS_BREECH'
  | 'FOCUS_POPPET'
  | 'FOCUS_MAG'
  | 'FOCUS_PLENUM'
  | 'FOCUS_FOREGRIP'
  | 'FOCUS_GRIP'
  | 'FOCUS_STOCK';

export interface IsolatedPartCategoryMeta {
  id: Isolated3DFocusPartId;
  shortLabel: string;
  fullTitle: string;
  accentColor: string;
  description: string;
}

export const ISOLATED_3D_FOCUS_CATEGORIES: IsolatedPartCategoryMeta[] = [
  {
    id: 'FULL_SIDE_PROFILE',
    shortLabel: 'Full Gun (All)',
    fullTitle: 'Full Assembled Weapon Profile (All Subsystems Visible)',
    accentColor: 'emerald',
    description: 'Complete weapon assembly centered at [0,0,0] with weapon-specific interactive mechanisms.',
  },
  {
    id: 'FOCUS_SILENCER',
    shortLabel: 'Silencer',
    fullTitle: 'Isolated Silencer / Acoustic Moderator & Baffle Stack',
    accentColor: 'sky',
    description: 'Hides the rest of the weapon and centers the acoustic moderator, K-baffles, and air-stripping diffuser.',
  },
  {
    id: 'FOCUS_BARREL_COVER',
    shortLabel: 'Barrel Cover',
    fullTitle: 'Isolated Barrel Cover / Shroud & Rifled Liner',
    accentColor: 'cyan',
    description: 'Hides the rest of the weapon and centers the outer barrel shroud, M-LOK handguard cover, and rifled barrel.',
  },
  {
    id: 'FOCUS_RECEIVER',
    shortLabel: 'Receiver',
    fullTitle: 'Isolated Upper & Lower Monolithic CNC Receiver',
    accentColor: 'amber',
    description: 'Hides the rest of the weapon and centers the CNC 7075-T6 receiver frame, optics rail, and structural bridge.',
  },
  {
    id: 'FOCUS_BREECH',
    shortLabel: 'Breech',
    fullTitle: 'Isolated Breech Block, Transfer Port & Face Seals',
    accentColor: 'rose',
    description: 'Hides the rest of the weapon and centers the breech interface, red PU-90A seal puck, sliding breech, or hinge latch.',
  },
  {
    id: 'FOCUS_POPPET',
    shortLabel: 'Poppet & Valve',
    fullTitle: 'Isolated Poppet Valve, Hammerless Plug / Burst Disk & Seat',
    accentColor: 'orange',
    description: 'Hides the rest of the weapon and centers the high-speed discharge valve, PEEK poppet cone, or CuNi burst disk.',
  },
  {
    id: 'FOCUS_MAG',
    shortLabel: 'Mag',
    fullTitle: 'Isolated Magazine, Rotary Ratchet, Helical Turret or Arrow/Buckshot Shell',
    accentColor: 'yellow',
    description: 'Hides the rest of the weapon and centers the scalloped rotary drum, star ratchet, helical feed turret, or buckshot/arrow payload.',
  },
  {
    id: 'FOCUS_PLENUM',
    shortLabel: 'Plenum',
    fullTitle: 'Isolated Regulated Plenum Chamber & Belleville Regulator',
    accentColor: 'teal',
    description: 'Hides the rest of the weapon and centers the regulated firing plenum, Belleville spring stack, and pressure gauges.',
  },
  {
    id: 'FOCUS_FOREGRIP',
    shortLabel: 'Foregrip & Pump',
    fullTitle: 'Isolated Foregrip, Lever-Action 300B Pump, Bipod & Laser',
    accentColor: 'purple',
    description: 'Hides the rest of the weapon and centers the lever-action 3-stage pump linkage, foregrip reserve bottle, bipod, and laser.',
  },
  {
    id: 'FOCUS_GRIP',
    shortLabel: 'Grip & Trigger',
    fullTitle: 'Isolated Pistol Grip & 2-Stage Trigger Sear Linkage',
    accentColor: 'pink',
    description: 'Hides the rest of the weapon and centers the rebuilt trigger blade, sear transfer bar, springs, underlever, and ergonomic grip.',
  },
  {
    id: 'FOCUS_STOCK',
    shortLabel: 'Stock',
    fullTitle: 'Isolated Buttstock, 180° Folding Hinge & Rear Air Cylinders',
    accentColor: 'indigo',
    description: 'Hides the rest of the weapon and centers the folding 300B stock tube, dual rear cylinders, or telescoping tactical stock.',
  },
];

export interface InspectableSubComponentSpec {
  subIndex: number;
  code: string;
  name: string;
  material: string;
  dimensionsMm: string;
  toleranceMm: string;
  pressureBar: number;
  engineeringFunction: string;
  assignedAgent: string;
}

export interface ElonGunReverseEngineeringMilestone {
  stepNumber: 1 | 2 | 3 | 4 | 5;
  elonPrinciple:
    | '01_QUESTION_REQUIREMENTS_AND_TEARDOWN'
    | '02_DELETE_OBSOLETE_PARTS'
    | '03_SIMPLIFY_AND_SUB_MM_TOLERANCE'
    | '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS'
    | '05_AUTOMATE_CNC_STL_AND_PLAYTEST';
  elonPrincipleLabel: string;
  milestoneTitle: string;
  assignedAgentName: string;
  targetPartFocus: Isolated3DFocusPartId;
  beforeDefectOrGap: string;
  reverseEngineeredSolution: string;
  subMillimeterSpecVerification: string;
  completionPct: number;
}

export interface PerGunElonRoadmapAndStateSpec {
  gunId: CanonicalGunProgressionId;
  gunShortTitle: string;
  gunFullTitle: string;
  blueprintCode: string;
  blueprintRevision: string;
  specAccuracyPct: number;
  elonExecutiveDirective: string;
  uniqueInteractiveStateSummary: string;
  interactiveControlsAvailable: string[];
  milestones: ElonGunReverseEngineeringMilestone[];
}

export const PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS: Record<
  CanonicalGunProgressionId,
  PerGunElonRoadmapAndStateSpec
> = {
  GUN_01_PEN: {
    gunId: 'GUN_01_PEN',
    gunShortTitle: '#01 Mongo (.50 Shared Shell-50-220B)',
    gunFullTitle:
      '#01 Mongo (.50 Cal / 12.7mm Coaxial Single-Cartridge Launcher · Shared SHELL-50-220B Application)',
    blueprintCode: 'BP-01-MONGO-50-SHARED-SHELL',
    blueprintRevision: 'REV 5.2 (Mongo Coaxial + Single-Round Thread Reload)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Standardize #01 Mongo and #03 Double Barrel Defender on the exact same .50 Cal (12.7mm) 220-Bar pre-charged burst-disk cartridge (SHELL-50-220B: Ø18.0mm OD × 68.0mm L, 12.70mm bore, 0.12mm CuNi burst disk) and Ø16.0mm OD × Ø12.70mm ID barrel liner. Show the singular round being loaded/reloaded by unthreading the front M18×1.0 coaxial barrel coupler.',
    uniqueInteractiveStateSummary:
      'Shared .50 Cal SHELL-50-220B Single-Cartridge Coaxial Launcher · Animated Single-Round Unthread/Reload · L-Slot Thumb Striker',
    interactiveControlsAvailable: [
      'Animate Single-Round Coaxial Reload (Unthread Barrel → Load SHELL-50-220B → Lock)',
      'Cock L-Slot Thumb Striker',
      'Inspect Parker 2-015 Viton Neck Seal & 0.12mm CuNi Foil',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: First-Principles Teardown',
        milestoneTitle: 'Unify #01 Mongo & #03 Double Barrel Defender on Shared SHELL-50-220B (.50 Cal) Cartridge',
        assignedAgentName: 'GD-Agent-01 (Burst-Disk & Fastener Boss)',
        targetPartFocus: 'FOCUS_RECEIVER',
        beforeDefectOrGap: 'Required complete brand removal and animated single-round loading of the shared .50 Cal 220B shell.',
        reverseEngineeredSolution:
          'Standardized both #01 Mongo and #03 Defender on SHELL-50-220B (Ø18.0mm OD × 68.0mm L, M16×1.0 base) with visible single-cartridge insertion.',
        subMillimeterSpecVerification: 'SHELL-50-220B: 68.0 × Ø18.0 × Ø12.70mm (±0.005mm)',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Delete Redundant Parts',
        milestoneTitle: 'Delete Separate Valve Springs in Favor of Shared 0.12mm CuNi Burst Disk',
        assignedAgentName: 'GD-Agent-03 (Discharge Physics Specialist)',
        targetPartFocus: 'FOCUS_POPPET',
        beforeDefectOrGap: 'Separate valve cores doubled part SKU count between Pen Gun and Defender.',
        reverseEngineeredSolution:
          'Installed identical 6-petal laser-scored 0.12mm CuNi 70/30 sacrificial foil inside the M16×1.0 cartridge base.',
        subMillimeterSpecVerification: '0.12mm Foil · Ø13.80mm OD · 0.14ms Full 12.7mm Bore Opening',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: Sub-mm Seal & Collision Audit',
        milestoneTitle: 'Verify +0.05mm Radial Chamber Clearance & Parker 2-015 Neck Seal',
        assignedAgentName: 'GD-Agent-07 (Sub-Millimeter Collision & Interference Resolver)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Shell outer wall and barrel liner risked radial overlap in 3D assembly.',
        reverseEngineeredSolution:
          'Enforced Ø18.00mm shell OD inside Ø18.10mm chamber ID (+0.05mm radial clearance) and Ø16.0mm OD × Ø12.70mm ID barrel liner.',
        subMillimeterSpecVerification: 'Zero BVH Mesh Intersections · 20.5% Viton FKM-90 Squeeze',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: Accelerate Striker Impulse',
        milestoneTitle: 'Optimize 42 N/mm L-Slot Striker Needle Puncture Energy',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_GRIP',
        beforeDefectOrGap: 'Short striker travel risked incomplete petal shear at 220 Bar.',
        reverseEngineeredSolution: 'Tuned 18.5mm L-slot cocking stroke with 60° diamond-ground 440C needle.',
        subMillimeterSpecVerification: '44.0 × Ø14.8mm Striker · 0.14ms Rupture',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Automate STL & Range QA',
        milestoneTitle: 'Verify 165 Joule .50 Cal Pocket Pen Ballistics & Archetype .STL',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_BARREL_COVER',
        beforeDefectOrGap: 'Verified coaxial alignment between 135mm .50 barrel liner and SHELL-50-220B cartridge.',
        reverseEngineeredSolution: 'Passed 100% contiguity & 165 Joule .50 Cal playtest benchmark.',
        subMillimeterSpecVerification: '135.0 × Ø16.0 × Ø12.70mm Shared Barrel Liner',
        completionPct: 100,
      },
    ],
  },

  GUN_02_REXP: {
    gunId: 'GUN_02_REXP',
    gunShortTitle: '#02 REX-P (.30 Coaxial Underlever)',
    gunFullTitle: '#02 REX-P (.30 Cal / 7.62mm Coaxial Single-Shot Pistol & Sniper Carbine · 57-Part Schematic)',
    blueprintCode: 'BP-02-REXP-762-KR57',
    blueprintRevision: 'REV 5.2 (Animated Single-Slug Breech Load + #14–#20 Linkage)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Keep #02 REX-P strictly distinct from #01 Mongo. Rebuild the REX-P trigger and underlever group (#14–#20) from the 57-part schematic. When the 5-hole underlever guard (#14) pivots 42° on front pin (#15), it drops the vertical sliding breech block (#11) 14mm and animates a single .30 Cal (7.62mm) 50gr slug sliding directly into the barrel throat before snapping Breech #11 shut.',
    uniqueInteractiveStateSummary:
      'Animated Single-Round .30 Slug Breech Loading (#11 Vertical Slide) · Pivoting 5-Hole Underlever (#14) · Pistol ⇄ Sniper Carbine',
    interactiveControlsAvailable: [
      'Animate Single-Round .30 Slug Load (Cock #14 Lever → Drop #11 Breech → Insert .30 Slug → Close)',
      'Inspect Rebuilt Trigger & Sear Linkage (#16/#17/#18/#19/#20)',
      'Toggle Pistol ⇄ Sniper Carbine Moderator Variant',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: Korean 57-Part Teardown',
        milestoneTitle: 'Rebuild #14–#20 Trigger Group & Sear Transfer Bar from Korean Factory Drawing',
        assignedAgentName: 'GD-Agent-02 (Korean 57-Part REX-P Boss)',
        targetPartFocus: 'FOCUS_GRIP',
        beforeDefectOrGap: 'Trigger group previously lacked the #17 horizontal sear transfer bar, #18 primary sear dog, #19 dual coil springs, and #15 front underlever pivot geometry.',
        reverseEngineeredSolution: 'Rebuilt full 7-part trigger & underlever mechanism (#14 5-hole lever, #15 Ø5mm front axle, #16 curved blade, #17 68mm transfer bar, #18 HRC-58 sear dog, #19 dual springs, #20 cross-bolt safety).',
        subMillimeterSpecVerification: '#14 (148mm Lever) + #17 (68.0×4.0mm Sear Bar) + #18 Sear Dog',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Coaxial Flow Path',
        milestoneTitle: 'Maintain Zero-Turn 180° Coaxial In-Line Poppet (#32/#34)',
        assignedAgentName: 'GD-Agent-03 (Discharge Physics Specialist)',
        targetPartFocus: 'FOCUS_POPPET',
        beforeDefectOrGap: '90-degree transfer ports waste 18% of flow coefficient (Cv).',
        reverseEngineeredSolution: 'Preserved straight-line 180° coaxial PEEK poppet cone (#32) dumping directly behind the 7.62mm breech (Cv = 0.94).',
        subMillimeterSpecVerification: 'Ø9.80mm PEEK Cone (#32) + M28×1.5 Valve Body (#34)',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: Sub-mm Breech Slide (#11)',
        milestoneTitle: 'Calibrate #11 Cylindrical Breech Slide & #58/#59 Ball Detent',
        assignedAgentName: 'GD-Agent-02 (Korean 57-Part REX-P Boss)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Sliding breech sleeve required dual internal NBR-90 O-ring grooves to seal the exposed loading trough.',
        reverseEngineeredSolution: 'Machined Ø23.90mm OD × Ø12.04mm ID sliding breech sleeve (#11) with dual 12.0 × 1.50mm O-rings (#10/#12).',
        subMillimeterSpecVerification: '54.0 × Ø23.90 × Ø12.04mm (26.0mm Axial Stroke)',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: Rear Tank & Striker Timing',
        milestoneTitle: 'Verify #37 Rear 250-Bar Air Cylinder & #31 Coaxial Striker Sleeve',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_STOCK',
        beforeDefectOrGap: 'Rear tank threads M28×1.5 needed exact coaxial alignment with #34 valve housing.',
        reverseEngineeredSolution: 'Aligned 245mm × Ø38.0mm rear tank (#37), cheekpiece (#38), and rear 300B manometer (#40).',
        subMillimeterSpecVerification: '245.0 × Ø38.0 × Ø31.2mm (195cc @ 250 Bar)',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Pistol ⇄ Sniper Carbine QA',
        milestoneTitle: 'Validate 205mm Pistol vs. 480mm Moderated Sniper Carbine Barrel',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_SILENCER',
        beforeDefectOrGap: 'Ensured Sniper Carbine reflex moderator mounts flush to M18×1.0 muzzle thread.',
        reverseEngineeredSolution: 'Verified both REX-P Pistol (135 J) and REX Sniper Carbine (168 J) configurations.',
        subMillimeterSpecVerification: 'M18×1.0 Shroud Cap (#01) + 6-Baffle Moderator',
        completionPct: 100,
      },
    ],
  },

  GUN_03_DEFENDER: {
    gunId: 'GUN_03_DEFENDER',
    gunShortTitle: '#03 Double Barrel Defender (.50 Twin-Shell)',
    gunFullTitle: '#03 Double Barrel Defender (.50 Cal Over-Under Break-Action · 8-Pellet Buckshot OR Giant 375gr Carbon Arrow)',
    blueprintCode: 'BP-03-DEFENDER-50-BUCK-ARROW',
    blueprintRevision: 'REV 5.2 (Animated Twin-Shell Break-Action Reload)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Engineer the Double Barrel Defender over-under twin-barrel break-action to animate ejecting and reloading both shared .50 Cal 220-Bar burst-disk shells (SHELL-50-220B) when the Ø6.00mmH7 hinge breaks open 42°, supporting both .50 Cal 8-Pellet #000 Buckshot Wad Cartridges and Giant 375-Grain Coaxial Carbon Arrows.',
    uniqueInteractiveStateSummary:
      'Animated Break-Action Twin Shell Reload · .50 Cal Buckshot (8× Pellets) ⇄ Giant 375gr Carbon Arrow · Twin 220B Cartridges',
    interactiveControlsAvailable: [
      'Animate Break-Action Twin Shell Reload (Open 42° → Eject → Insert 2× SHELL-50-220B → Lock)',
      'Switch Payload: .50 Buckshot (8-Pellet) ⇄ Giant Carbon Arrow (375gr)',
      'Inspect Upper/Lower Alternating Striker Selector',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: Dual-Payload Teardown',
        milestoneTitle: 'Configure Twin Over-Under Barrels for .50 Buckshot Wad & Giant Carbon Arrow',
        assignedAgentName: 'GD-Agent-01 (Break-Action & Cartridge Boss)',
        targetPartFocus: 'FOCUS_MAG',
        beforeDefectOrGap: 'Previously only modeled static shells without animated break-action shell insertion.',
        reverseEngineeredSolution: 'Added full 3D break-action reload animation plus .50 Cal 8-Pellet Buckshot Shells and 375gr Ø8.8×380mm Carbon Arrows.',
        subMillimeterSpecVerification: '8× Ø6.0mm Buckshot Wad OR 380mm × Ø8.8mm Carbon Arrow (375gr)',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Self-Contained 220B Shells',
        milestoneTitle: 'Eliminate Fixed Internal Air Tank via Twin Screw-In 220-Bar Cartridges',
        assignedAgentName: 'GD-Agent-03 (Discharge Physics Specialist)',
        targetPartFocus: 'FOCUS_PLENUM',
        beforeDefectOrGap: 'Fixed tanks require slow scuba tether refills between two-shot volleys.',
        reverseEngineeredSolution: 'Uses 2× removable 7075-T6 red-anodized 220-Bar cartridges with rear CuNi burst disks.',
        subMillimeterSpecVerification: '2× 68.0 × Ø18.0mm Shared SHELL-50-220B Cartridges',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: Break-Action Hinge & Stirrup',
        milestoneTitle: 'Harden Ø6.00mmH7 Front Hinge Axle & Top Stirrup Standing Breech Latch',
        assignedAgentName: 'GD-Agent-01 (Break-Action & Cartridge Boss)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: '220-Bar twin cartridge thrust creates 6.2 kN breech separation force.',
        reverseEngineeredSolution: 'Locked 4140 steel top stirrup latch hooks into dual standing breech lugs.',
        subMillimeterSpecVerification: 'Ø6.00mmH7 Hinge Pin + Dual Viton 14.0×2.0mm Breech Face O-Rings',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: Alternating Dual Strikers',
        milestoneTitle: 'Verify Mechanical Ratchet Selector for Upper Barrel #1 → Lower Barrel #2',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_POPPET',
        beforeDefectOrGap: 'Double-pull trigger must automatically index from upper to lower firing pin.',
        reverseEngineeredSolution: 'Built oscillating ratchet cam selector toggling between upper and lower 440C striker needles.',
        subMillimeterSpecVerification: '52.0 × 28.0 × 18.0mm Dual-Striker Block',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Buckshot & Arrow Playtest QA',
        milestoneTitle: 'Validate 285 Joule Buckshot Spread & Giant Arrow Penetration in Physics Range',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_BARREL_COVER',
        beforeDefectOrGap: 'Verified 3D arrow broadhead clearance and buckshot wad dispersion.',
        reverseEngineeredSolution: 'Both Buckshot and Giant Arrow modes render and fire accurately in Workbench & Range.',
        subMillimeterSpecVerification: '195.0 × 32.0 × 58.0mm Over-Under Monoblock',
        completionPct: 100,
      },
    ],
  },

  GUN_04_LESHIY: {
    gunId: 'GUN_04_LESHIY',
    gunShortTitle: '#04 Leshiy 2 (.30 Folding Spec)',
    gunFullTitle: '#04 Leshiy 2 (.30 Cal / 7.62mm · 350mm Barrel · 756mm / 457mm 180° Folding Stock · 179cc [137cc+42cc] · 8-Rd Mag)',
    blueprintCode: 'BP-04-LESHIY2-30-FOLDING',
    blueprintRevision: 'REV 6.0 (Interactive 180° Folding Stock & Open Breech)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Implement the signature Leshiy 2 180° left-side folding stock and quick-detach lower container mechanism. When folded (-299mm, reducing OAL from 756mm to 457mm), the buttstock swings 180° around the left twin-lug hinge pin (LSA241100), exposing the 8-round magnetic scalloped rotary magazine, 8-tooth central star ratchet, lower coil-sprung indexing pawl, and red Polyurethane 90A breech face seal puck.',
    uniqueInteractiveStateSummary:
      'Interactive 180° Left-Side Folding Stock (756mm Unfolded ⇄ 457mm Folded) · Exposed 8-Rd Scalloped Mag & Red PU-90A Puck · 179cc (137cc+42cc)',
    interactiveControlsAvailable: [
      'Fold / Unfold Buttstock 180° (756mm ⇄ 457mm Open Breech)',
      'Index 8-Round Scalloped Rotary Drum & 8-Tooth Star Ratchet',
      'Inspect 1.4ms Hammerless EAR Valve & R.E.P.R. Regulator (130–240B)',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: Factory Spec Verification',
        milestoneTitle: 'Lock Real 350mm Barrel, 756mm/457mm Fold Length (-299mm), 2.35 kg & 179cc Volume',
        assignedAgentName: 'GD-Agent-03 (EDgun Leshiy 2 Specialist)',
        targetPartFocus: 'FOCUS_STOCK',
        beforeDefectOrGap: 'Needed interactive 180° folding hinge articulation so user can fold stock and inspect open breech.',
        reverseEngineeredSolution: 'Engineered live 0°–180° hinge pivot around left-side Ø8.0mmH7 pin (LSA241102) exposing the magnetic rotary drum and red PU-90A breech puck.',
        subMillimeterSpecVerification: '756mm Unfolded → 457mm Folded (-299mm) · 137cc + 42cc = 179cc',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Hammerless EAR Valve',
        milestoneTitle: 'Eliminate Mechanical Hammer & Spring via 1.4ms Differential EAR Plug Valve',
        assignedAgentName: 'GD-Agent-03 (EDgun Leshiy 2 Specialist)',
        targetPartFocus: 'FOCUS_POPPET',
        beforeDefectOrGap: 'Traditional hammer springs add lock time and bounce during semi-auto cycling.',
        reverseEngineeredSolution: 'Modeled differential-pressure PEEK forward-plug valve (LSA242200) with 1.4ms opening and dual 0.7mm indexer bleed jets.',
        subMillimeterSpecVerification: '48.0 × Ø24.0mm EAR Valve · 1.4ms Opening',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: Open-Breech Seal & Mag',
        milestoneTitle: 'Calibrate Red PU-90A Breech Face Puck (LSA242105) & 8-Rd Scalloped Drum',
        assignedAgentName: 'GD-Agent-01 (Seals & Fastener Boss)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Folding breech interface requires zero-leak axial crush across 8 rotary chambers.',
        reverseEngineeredSolution: 'Set 0.38mm axial crush on 12.50 × 2.20mm red PU-90A face puck against 4140 star ratchet.',
        subMillimeterSpecVerification: 'Ø44.5 × 12.2mm 8-Rd Mag + 12.5×2.2mm Red PU-90A Puck',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: R.E.P.R. Plenum & Pawl',
        milestoneTitle: 'Tune 42cc Upper R.E.P.R. Plenum (60–240B) & Coil-Sprung Indexing Pawl',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_PLENUM',
        beforeDefectOrGap: 'Semi-auto indexing requires 45° drum rotation per shot before next trigger pull.',
        reverseEngineeredSolution: 'Synchronized 0.7mm bleed jet plunger with lower coil-sprung pawl (LSA221103/LSA221105).',
        subMillimeterSpecVerification: '42cc Plenum @ 130B Default (60–240B) + 45° Pawl Step',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Valkyrie Shroud & Silencer QA',
        milestoneTitle: 'Verify 350mm Alfa Precision Barrel & Octagonal Valkyrie M-LOK Moderator',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_BARREL_COVER',
        beforeDefectOrGap: 'Confirmed twin M6×20mm clamp bolts (9.5 N·m) lock the 350mm barrel coaxially.',
        reverseEngineeredSolution: 'Full 8-shot semi-auto playtest & 180° fold inspection verified.',
        subMillimeterSpecVerification: '350.0 × Ø14.0 × Ø7.62mm Barrel + 380mm Valkyrie Shroud',
        completionPct: 100,
      },
    ],
  },

  GUN_04B_THE_LEAF_45: {
    gunId: 'GUN_04B_THE_LEAF_45',
    gunShortTitle: '#05 The Leaf (.45 Leshiy-2 OTB)',
    gunFullTitle: '#05 "The Leaf" (.45 Cal / 11.43mm Built on Leshiy 2 180° Folding Open-Breech + 165cc Over-Barrel Air Reserve)',
    blueprintCode: 'BP-05-LEAF-45-LESHIY-OTB',
    blueprintRevision: 'REV 5.2 (.45 Cal + 180° Folding + 165cc OTB Reserve)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Scale the proven EDgun Leshiy 2 180° folding open-breech architecture up to .45 Cal (11.43mm) while preserving the 180° left-side folding stock feature. Add a 165cc Concentric Over-the-Barrel (OTB) Annular Air Reserve Jacket around the 6-baffle silencer and enlarge the R.E.P.R. plenum to 68cc @ 195 Bar to drive 6-round .45 boattail slugs at 248 Joules.',
    uniqueInteractiveStateSummary:
      '.45 Cal (11.43mm) Leshiy-2 Derivative · Interactive 180° Folding Stock · 6-Rd .45 Scalloped Drum · 165cc Concentric OTB Reserve',
    interactiveControlsAvailable: [
      'Fold / Unfold .45 Open-Breech Stock 180°',
      'Index 6-Round .45 Cal (11.43mm) Scalloped Rotary Drum',
      'Inspect 165cc Concentric Over-the-Barrel Air Reserve & 6-Baffle Core',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: .45 Big-Bore Scaling',
        milestoneTitle: 'Scale Leshiy 2 Open-Breech & 180° Folding Hinge to .45 Cal (11.43mm)',
        assignedAgentName: 'GD-Agent-03 (Leshiy-2 & Leaf .45 Architect)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: '.30 cal transfer port and 8-round drum cannot pass 11.43mm (.45 cal) slugs.',
        reverseEngineeredSolution: 'Bored transfer port to Ø11.6mm, enlarged red PU-90A puck to 15.5×2.50mm, and built 6-round .45 scalloped drum.',
        subMillimeterSpecVerification: 'Ø52.0 × 15.5mm 6-Rd .45 Drum + 15.5×2.50mm Red PU-90A Puck',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Coaxial Shroud + Tank Merge',
        milestoneTitle: 'Merge Barrel Shroud & Secondary Bottle into 165cc Concentric OTB Reserve',
        assignedAgentName: 'GD-Agent-04 (Concentric OTB Vessel Boss)',
        targetPartFocus: 'FOCUS_BARREL_COVER',
        beforeDefectOrGap: 'Hanging a heavy bottle under a folding gun blocks the 180° stock fold.',
        reverseEngineeredSolution: 'Wrapped a 165cc 300-Bar concentric annular air jacket around the 420mm .45 barrel so the stock still folds 180° flush!',
        subMillimeterSpecVerification: '410.0 × Ø46.0 × Ø16.0mm Concentric OTB Reserve (165cc)',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: Coaxial Baffle Stack',
        milestoneTitle: 'Integrate 6-Chamber Slotted Silencer Inside OTB Annular Reserve Core',
        assignedAgentName: 'GD-Agent-01 (Seals & Fastener Boss)',
        targetPartFocus: 'FOCUS_SILENCER',
        beforeDefectOrGap: 'Big-bore .45 muzzle blast exceeds 112 dB without coaxial expansion volume.',
        reverseEngineeredSolution: 'Machined 6-chamber monolithic 7075-T6 baffle core inside the forward OTB sleeve with dual Parker 2-128 Viton O-rings.',
        subMillimeterSpecVerification: '145.0 × Ø42.0 × Ø12.2mm 6-Baffle Core',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: 68cc 195-Bar Plenum',
        milestoneTitle: 'Expand Upper R.E.P.R. Plenum to 68cc @ 195 Bar & 60° Pawl Stroke',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_PLENUM',
        beforeDefectOrGap: '42cc plenum drops pressure too steeply behind a 185gr .45 slug.',
        reverseEngineeredSolution: 'Enlarged upper regulated plenum tube to 68cc @ 195 Bar with 0.9mm dual indexer bleed jets.',
        subMillimeterSpecVerification: '295.0 × Ø32.0 × Ø25.0mm (68cc @ 195 Bar)',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: .45 Semi-Auto Playtest',
        milestoneTitle: 'Verify 248 Joule 6-Shot Semi-Auto Cycling & 180° Folding Clearance',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_STOCK',
        beforeDefectOrGap: 'Verified 180° stock fold clears the Ø46mm concentric OTB reserve.',
        reverseEngineeredSolution: 'Passed full 6-shot .45 playtest and 3D isolation check.',
        subMillimeterSpecVerification: '445cc Total Air (190cc Stock + 165cc OTB + 68cc Plenum)',
        completionPct: 100,
      },
    ],
  },

  GUN_05_MP30: {
    gunId: 'GUN_05_MP30',
    gunShortTitle: '#06 Evanix MP30 (.30 Tactical SMG)',
    gunFullTitle: '#06 Evanix MP30 (.30 Cal / 7.62mm Dual-Cylinder 300cc Tactical PCP SMG · Biathlon Side-Lever & Folding AR Stock)',
    blueprintCode: 'BP-06-EVANIX-MP30-762-SMG',
    blueprintRevision: 'REV 5.4 (100% Korean Evanix MP30 Spec — Zero Snowpeak)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Purge all Snowpeak/PP750L artifacts and build the authentic Korean Evanix MP30 (.30 Cal / 7.62mm) Tactical PCP Submachine Gun to 100% factory spec: dual stacked under-barrel 250-Bar air cylinders (300cc combined), monolithic CNC tactical SMG receiver with full-length Picatinny optics & accessory rails, biathlon side-lever cocking linkage, 9-round .30 rotary magazine, AR-15 pistol grip, and folding/telescoping M4-style tactical buttstock (520mm folded / 755mm extended).',
    uniqueInteractiveStateSummary:
      'Authentic Korean Evanix MP30 Spec · Dual Stacked 300cc 250B Cylinders · Biathlon Side-Lever · 9-Rd .30 Mag · Folding Tactical Stock',
    interactiveControlsAvailable: [
      'Cycle Biathlon Side-Lever & .30 Cal Probe',
      'Inspect Dual Stacked 300cc Under-Barrel 250B Air Cylinders',
      'Inspect Monolithic SMG Receiver & Folding Tactical Stock (520mm/755mm)',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: True Evanix MP30 Teardown',
        milestoneTitle: 'Replace Generic Tube with Authentic Evanix MP30 Dual Stacked 300cc 250B Cylinders',
        assignedAgentName: 'GD-Agent-02 (Korean Evanix Blueprint Boss)',
        targetPartFocus: 'FOCUS_PLENUM',
        beforeDefectOrGap: 'Previously mixed PP750L single tube specs with MP30; Snowpeak does not exist in this game.',
        reverseEngineeredSolution: 'Built authentic Korean Evanix MP30 dual stacked 250-Bar cylinders (300cc total) joined by an over-under CNC regulator manifold block (165 Bar regulated).',
        subMillimeterSpecVerification: '2× 240.0 × Ø32.0mm Dual Stacked Cylinders (300cc @ 250 Bar)',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Monolithic SMG Receiver',
        milestoneTitle: 'Machine Monolithic CNC 7075-T6 MP30 Tactical SMG Receiver & Full Top Rail',
        assignedAgentName: 'GD-Agent-04 (Monolithic Receiver Architect)',
        targetPartFocus: 'FOCUS_RECEIVER',
        beforeDefectOrGap: 'Receiver needed full-length MIL-STD-1913 top rail, side M-LOK/Picatinny handguard, and integrated mag well.',
        reverseEngineeredSolution: 'Machined 285mm monolithic CNC SMG receiver housing the .30 breech, balanced poppet valve, and side-lever track.',
        subMillimeterSpecVerification: '285.0 × 42.0 × 58.0mm Monolithic CNC 7075-T6 Receiver',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: .30 Side-Lever & 9-Rd Mag',
        milestoneTitle: 'Calibrate Biathlon Side-Lever Toggle & 9-Round .30 Cal (7.62mm) Rotary Magazine',
        assignedAgentName: 'GD-Agent-02 (Korean Evanix Blueprint Boss)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Probe O-ring needed exact 7.62mm (.30 cal) breech seating geometry.',
        reverseEngineeredSolution: 'Fitted Ø7.60mm 316L stainless probe with Parker 5.00 × 1.50mm Polyurethane 90A breech O-ring and 9-round rotary cassette.',
        subMillimeterSpecVerification: '95.0 × Ø7.60mm Probe + 9-Rd .30 Rotary Magazine',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: AR Grip & 2-Stage Trigger',
        milestoneTitle: 'Install AR-15 Tactical Grip, 2-Stage Match Sear & Folding M4 Buttstock',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_STOCK',
        beforeDefectOrGap: 'Stock needed true Evanix MP30 side-folding / telescoping M4 buffer-tube geometry (520mm folded / 755mm extended).',
        reverseEngineeredSolution: 'Built side-folding hinge knuckle + 6-position telescoping tactical buttstock and ergonomic AR grip.',
        subMillimeterSpecVerification: '520mm Folded / 755mm Extended · 2.70 kg Mass',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Shrouded 270mm Barrel QA',
        milestoneTitle: 'Validate 270mm Rifled .30 Barrel, Integrated Baffle Shroud & 125 Joule Output',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_SILENCER',
        beforeDefectOrGap: 'Verified coaxial alignment of integrated moderator shroud over dual cylinders.',
        reverseEngineeredSolution: 'Passed 9-shot .30 cal playtest and 100% Evanix MP30 spec audit.',
        subMillimeterSpecVerification: '270.0mm Barrel + Ø34.0mm Integrated Baffle Shroud',
        completionPct: 100,
      },
    ],
  },

  GUN_06_P50: {
    gunId: 'GUN_06_P50',
    gunShortTitle: '#07 The P50 (.50 Auto 4-Reserve)',
    gunFullTitle: '#07 The P50 (.50 Cal / 12.7mm P90-Style Automatic · 4 Air Reserves [Mag/Barrel/Buttstock/Foregrip] + Bipod + Laser)',
    blueprintCode: 'BP-07-P50-50CAL-AUTO-4RES',
    blueprintRevision: 'REV 6.1 (Concept Fine-Tuned Sub-mm & 4-Reserve Auto QA)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Take the P50 .50 Cal P90-style bullpup concept and fine-tune every sub-millimeter interface across all 4 interconnected 250-Bar air reserves (145cc Mag Spine, 160cc Over-Barrel Jacket, 280cc Dual Buttstock Cylinders, 120cc Foregrip Bottle = 705cc), the 90° helical feed turret, the folding twin-leg bipod, and the coaxial 650nm tactical laser.',
    uniqueInteractiveStateSummary:
      '4 Interconnected 250B Reserves (705cc Total) · 90° Helical .50 Turret · Folding Twin-Leg Bipod · Coaxial 650nm Laser Beam',
    interactiveControlsAvailable: [
      'Inspect All 4 Interconnected 250B Air Reserves (Mag/Barrel/Buttstock/Foregrip)',
      'Cycle 20-Round .50 Cal 90° Helical Feed Turret',
      'Inspect Folding Tactical Bipod & Coaxial 650nm Laser Sight',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: 4-Reserve Manifold Bus',
        milestoneTitle: 'Balance 4-Way Priority Check Manifold Across Mag, Barrel, Buttstock & Foregrip',
        assignedAgentName: 'GD-Agent-04 (P50 4-Reserve & Helical Boss)',
        targetPartFocus: 'FOCUS_PLENUM',
        beforeDefectOrGap: 'Full-auto .50 cal cyclic rate (450 RPM) starves single-bottle plenums after 3 shots.',
        reverseEngineeredSolution: 'Linked 145cc Mag + 160cc Barrel OTB + 280cc Buttstock + 120cc Foregrip (705cc @ 250B) into a 78cc 200-Bar blowback plenum.',
        subMillimeterSpecVerification: '705cc Total Storage → 78cc Regulated Plenum @ 200 Bar',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Dry-Break Mag Spine Reserve',
        milestoneTitle: 'Integrate 145cc Twin HPA Tubes Directly Into Top .50 Cal Helical Magazine',
        assignedAgentName: 'GD-Agent-04 (P50 4-Reserve & Helical Boss)',
        targetPartFocus: 'FOCUS_MAG',
        beforeDefectOrGap: 'Swapping magazines on a big-bore automatic usually requires stopping to refill air.',
        reverseEngineeredSolution: 'Built M14×1.25 self-sealing dry-break stinger coupling so seating a fresh 20-round magazine adds 145cc of 250-Bar air automatically.',
        subMillimeterSpecVerification: '295.0 × 64.0 × 38.0mm Mag + Parker 2-011 FKM-90 Stinger Seal',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: 90° Helical Turret Ramp',
        milestoneTitle: 'Machine Sub-mm 17-4PH 90° Helical Feed Ramp for .50 Cal (12.7mm) Slugs',
        assignedAgentName: 'GD-Agent-05 (Kinematics & Spring Architect)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Horizontal magazine rounds must rotate 90° into the coaxial barrel axis without jamming.',
        reverseEngineeredSolution: 'Precision-ground Ø46.0 × 28.0mm 90° helical cam track synchronized with pneumatic blowback bolt carrier.',
        subMillimeterSpecVerification: 'Ø46.0 × 28.0mm Helical Ramp (±0.005mm)',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: Barrel Reserve & Silencer',
        milestoneTitle: 'Tune 160cc Concentric Barrel Reserve Jacket & 6-Chamber .50 Moderator',
        assignedAgentName: 'GD-Agent-03 (Discharge Physics Specialist)',
        targetPartFocus: 'FOCUS_SILENCER',
        beforeDefectOrGap: '318 Joule .50 cal full-auto bursts generate high muzzle climb and acoustic report.',
        reverseEngineeredSolution: 'Added 6-chamber ported suppressor ahead of the 160cc Grade-9 Titanium Over-Barrel reserve jacket.',
        subMillimeterSpecVerification: '360.0 × Ø48.0 × Ø16.0mm Barrel Reserve + 6-Baffle Moderator',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Bipod, Laser & Auto QA',
        milestoneTitle: 'Verify Folding Twin-Leg Bipod, Coaxial 650nm Laser & 20-Shot Full-Auto Playtest',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_FOREGRIP',
        beforeDefectOrGap: 'Verified front foregrip 120cc bottle, folding bipod legs, and coaxial laser beam alignment.',
        reverseEngineeredSolution: 'Passed 20-round full-auto playtest and sub-component isolation audit.',
        subMillimeterSpecVerification: '185mm Folding Bipod + 650nm Coaxial Laser + 120cc Foregrip Reserve',
        completionPct: 100,
      },
    ],
  },

  GUN_07_ASCENT45: {
    gunId: 'GUN_07_ASCENT45',
    gunShortTitle: '#08 Custom .45 Ascent (Lever-Pump)',
    gunFullTitle: '#08 Custom .45 Ascent (11.43mm Lever-Action Repeater · Traditional Lever-Action 300B Pump + 140cc Over-Barrel Plenum & Silencer)',
    blueprintCode: 'BP-08-ASCENT-45-LEVER-PUMP',
    blueprintRevision: 'REV 6.5 (Rebuilt Traditional Lever-Action 300B Pump Linkage)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Fix the .45 Ascent onboard 300-Bar hand pump kinematics: a traditional onboard multi-stage PCP pump does NOT slide linearly like a shotgun forend—it pivots like a Lever Action around a front fulcrum pin with a 4-bar toggle linkage driving the concentric 3-stage piston rod! Rebuild the pump linkage with a front pivot fulcrum, twin 4-bar toggle links, and a 58° downward lever arc, while fine-tuning sub-mm tolerances across all 12 parts.',
    uniqueInteractiveStateSummary:
      'Rebuilt Traditional Lever-Action 300B Pump (58° Front-Fulcrum Arc + 4-Bar Toggle Linkage) · 140cc Over-Barrel Plenum + 6-Gill Silencer',
    interactiveControlsAvailable: [
      'Pump Traditional Lever-Action Under-Barrel 300B Arm (+28B / Stroke)',
      'Fill Full 300 Bar Reserve & 210 Bar Over-Barrel Plenum',
      'Inspect 4-Bar Toggle Pump Linkage & Monolithic Receiver Bridge',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: Lever-Pump Kinematics Fix',
        milestoneTitle: 'Replace Linear Slide Pump with Traditional Lever-Action Front-Pivot + 4-Bar Toggle Linkage',
        assignedAgentName: 'GD-Agent-05 (Custom .45 Ascent & Lever-Pump Boss)',
        targetPartFocus: 'FOCUS_FOREGRIP',
        beforeDefectOrGap: 'Pumping previously translated linearly instead of swinging like a traditional lever-action PCP pump with mechanical advantage.',
        reverseEngineeredSolution: 'Rebuilt pump around a Front Clevis Fulcrum Pin (X=+0.26m) where the forged lever arm swings down 58° while twin 4-bar toggle links drive the Ø6.0mm 17-4PH 3-stage piston rod axially into the 300B check head.',
        subMillimeterSpecVerification: 'Front Fulcrum M6×1.0 + 92mm 4-Bar Toggle Links + Ø6.0mm 3-Stage Rod',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Monolithic Receiver Bridge',
        milestoneTitle: 'Eliminate Floating Breech Gaps via Monolithic CNC 7075-T6 Upper/Lower Receiver',
        assignedAgentName: 'GD-Agent-04 (Monolithic Receiver Architect)',
        targetPartFocus: 'FOCUS_RECEIVER',
        beforeDefectOrGap: 'Early exploded offsets left a visual gap between the thumbhole stock and OTB plenum.',
        reverseEngineeredSolution: 'Machined contiguous CNC upper/lower receiver bridge locking the stock, 6-round rotary mag well, lever-action repeater loop, and OTB plenum.',
        subMillimeterSpecVerification: '220.0 × 44.0 × 62.0mm Monolithic CNC Receiver Bridge',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: 140cc Over-Barrel Plenum',
        milestoneTitle: 'Fine-Tune 140cc Over-Barrel 210-Bar Regulated Plenum & Vertical Transfer Port (#120)',
        assignedAgentName: 'GD-Agent-03 (Discharge Physics Specialist)',
        targetPartFocus: 'FOCUS_PLENUM',
        beforeDefectOrGap: 'Needs enough regulated air above the barrel for 2 to 3 full-power .45 shots before pumping.',
        reverseEngineeredSolution: 'Validated 140cc coaxial Over-Barrel plenum @ 210 Bar fed from the 240cc 300-Bar under-barrel reserve via Part #116 inline regulator.',
        subMillimeterSpecVerification: '380.0 × Ø36.0 × Ø16.0mm (140cc @ 210 Bar = 2.6 Shots)',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: QuietEnergy 6-Gill Silencer',
        milestoneTitle: 'Verify Forward 6-Chamber QuietEnergy Silencer & Air-Stripping Radial Vents',
        assignedAgentName: 'GD-Agent-01 (Seals & Fastener Boss)',
        targetPartFocus: 'FOCUS_SILENCER',
        beforeDefectOrGap: '286.6 Joule .45 cal muzzle report requires coaxial gas stripping prior to baffle stack.',
        reverseEngineeredSolution: 'Integrated 6 angled acoustic gills and K-cup baffle stack at the front of the Over-Barrel plenum shroud.',
        subMillimeterSpecVerification: '165.0 × Ø38.0 × Ø12.2mm 6-Gill Silencer (-21 dB)',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Lever-Repeater & Pump QA',
        milestoneTitle: 'Playtest 6-Round .45 Rotary Mag, Trigger-Guard Repeater Lever & 300B Lever-Pump',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Tested full 6-shot firing cycle + 300B lever-pump recharge.',
        reverseEngineeredSolution: 'Verified 286.6 J ballistics, lever-action pump kinematics, and 10-part 3D isolation.',
        subMillimeterSpecVerification: '12/12 Parts Verified · ±0.005mm Manifold Tolerance',
        completionPct: 100,
      },
    ],
  },

  GUN_09_PROTECTOR: {
    gunId: 'GUN_09_PROTECTOR',
    gunShortTitle: '#09 The Protector (.50 Dual-Barrel Air-Reserve Scatter Gun)',
    gunFullTitle:
      '#09 The Protector (.50 Cal / 12.7mm Dual Threaded Air-Reserve Barrel Scatter Gun · Cock Open / Load / Cock Up / Select Fire / 180° Reverse-Loop Center-Barrel Airflow)',
    blueprintCode: 'BP-09-PROTECTOR-50-REVERSE-LOOP',
    blueprintRevision: 'REV 6.0 (Dual Threaded Barrel Reserves + 180° Reverse-Loop + Post-Muzzle Scatter)',
    specAccuracyPct: 100,
    elonExecutiveDirective:
      'Engineer #09 The Protector with two M28×1.5 threaded over-under barrels where each barrel’s outer annular jacket is a self-contained 110cc 250-Bar air reserve for 2 separate shots. Cock it open (break-action tilts 40°), load the ammo (2× .50 Cal 8-Segment Break-Apart Scatter Sabots), cock it up, set the 3-position fire selector, and fire: air travels from the barrel reserve out to the back manifold, loops 180° around, and pushes the projectile out from the middle of the barrel—then the payload breaks apart and scatters into 8 flechettes after leaving the muzzle!',
    uniqueInteractiveStateSummary:
      '2× 110cc 250B Threaded Barrel Reserves · Cock Open / Load / Cock Up · 3-Pos Fire Selector · 180° Reverse-Loop Center-Barrel Airflow · Post-Muzzle Scatter',
    interactiveControlsAvailable: [
      'Cock Open / Load 2× Scatter Sabots / Cock Up Breech (0° ⇄ 40°)',
      'Switch 3-Position Fire Selector: BARREL 1 [UPPER] · BARREL 2 [LOWER] · DUAL SALVO',
      'Inspect 180° Rear U-Turn Loop & Post-Muzzle Break-Apart Scatter Cone',
    ],
    milestones: [
      {
        stepNumber: 1,
        elonPrinciple: '01_QUESTION_REQUIREMENTS_AND_TEARDOWN',
        elonPrincipleLabel: 'Step 1: Dual Threaded Barrel Reserves',
        milestoneTitle: 'Build Upper & Lower M28×1.5 Threaded Barrels as Independent 110cc 250-Bar Air Reserves',
        assignedAgentName: 'GD-Agent-09 (Dual-Barrel Reserve & Reverse-Loop Scatter Architect)',
        targetPartFocus: 'FOCUS_BARREL_COVER',
        beforeDefectOrGap: 'Conventional double-barrel airguns share a single tank and suffer shot-to-shot pressure drop.',
        reverseEngineeredSolution: 'Machined two independent M28×1.5 screw-in barrels (PRT-01 Upper / PRT-02 Lower), each carrying its own 110cc @ 250 Bar annular titanium jacket.',
        subMillimeterSpecVerification: '2× 420.0 × Ø34.0 × Ø12.70mm Barrels (2× 110cc @ 250 Bar)',
        completionPct: 100,
      },
      {
        stepNumber: 2,
        elonPrinciple: '02_DELETE_OBSOLETE_PARTS',
        elonPrincipleLabel: 'Step 2: Break-Action Cock Open & Load',
        milestoneTitle: 'Integrate Ø8.00mmH7 Break-Action Cocking Hinge & Dual Extractor Star',
        assignedAgentName: 'GD-Agent-01 (Break-Action & Cartridge Boss)',
        targetPartFocus: 'FOCUS_BREECH',
        beforeDefectOrGap: 'Loading dual center-fed barrels requires simultaneous sear cocking and breech exposure.',
        reverseEngineeredSolution: 'Breaking the twin barrels down 40° cocks both internal striker sears and exposes the rear chambers for 2× .50 Scatter Sabots; cocking up locks the top stirrup.',
        subMillimeterSpecVerification: 'Ø8.00mmH7 Hinge Axle + 40° Cock-Open / Cock-Up Lock',
        completionPct: 100,
      },
      {
        stepNumber: 3,
        elonPrinciple: '03_SIMPLIFY_AND_SUB_MM_TOLERANCE',
        elonPrincipleLabel: 'Step 3: 3-Position Fire Selector',
        milestoneTitle: 'Machine Ambidextrous 3-Position Rotary Fire Selector Cam (PRT-04)',
        assignedAgentName: 'GD-Agent-02 (Trigger & Sear Architect)',
        targetPartFocus: 'FOCUS_GRIP',
        beforeDefectOrGap: 'Shooter needs instant selection between independent barrels or simultaneous double salvo.',
        reverseEngineeredSolution: 'Engineered 3-position ball-detent rotary selector: Position 1 = Upper Barrel, Position 2 = Lower Barrel, Position 3 = Dual Simultaneous Salvo.',
        subMillimeterSpecVerification: '38.0 × Ø14.0mm Selector Cam (Upper / Lower / Dual Salvo)',
        completionPct: 100,
      },
      {
        stepNumber: 4,
        elonPrinciple: '04_ACCELERATE_VALVE_AND_CYCLE_PHYSICS',
        elonPrincipleLabel: 'Step 4: 180° Reverse-Loop Center Injection',
        milestoneTitle: 'Route Air From Barrel Reserve → Back Manifold → 180° U-Turn Loop → Middle of Barrel Bore',
        assignedAgentName: 'GD-Agent-03 (Discharge Physics Specialist)',
        targetPartFocus: 'FOCUS_POPPET',
        beforeDefectOrGap: 'Standard rear-only ports lose pressure before reaching mid-bore acceleration zone.',
        reverseEngineeredSolution: 'Air discharges from the barrel reserve rearward into the standing breech collector (PRT-05), loops 180° through twin external return tubes, and injects through 6× Ø4.2mm angled ports at the middle of the barrel (Z=-210mm).',
        subMillimeterSpecVerification: '180° Rear U-Turn Manifold + 6× Ø4.2mm Mid-Barrel Injection Ports',
        completionPct: 100,
      },
      {
        stepNumber: 5,
        elonPrinciple: '05_AUTOMATE_CNC_STL_AND_PLAYTEST',
        elonPrincipleLabel: 'Step 5: Post-Muzzle Break-Apart Scatter',
        milestoneTitle: 'Verify Centrifugal Sabot Stripping & 8-Pellet tungsten Flechette Scatter Cone Outside Barrel',
        assignedAgentName: 'GD-Agent-06 (Automated Playtest QA)',
        targetPartFocus: 'FOCUS_SILENCER',
        beforeDefectOrGap: 'Sabot must remain unitary inside the mid-barrel injection ports and only break apart after exiting the muzzle.',
        reverseEngineeredSolution: '4-petal scored Delrin sabot unlocks via centrifugal spin 15mm past the muzzle crown, scattering 8× 45gr tungsten flechettes in a 6.5° cone.',
        subMillimeterSpecVerification: '340 Joules · 8-Segment Post-Muzzle Scatter Verified',
        completionPct: 100,
      },
    ],
  },
};

/**
 * Returns the weapon-specific inspectable sub-components when the user isolates
 * any of the 10 3D Focus categories (Silencer, Barrel Cover, Receiver, Breech,
 * Poppet, Mag, Plenum, Foregrip, Grip, Stock) for the currently selected weapon.
 */
export function getSubComponentsForIsolatedPart(
  gunId: CanonicalGunProgressionId,
  focusPart: Isolated3DFocusPartId
): InspectableSubComponentSpec[] {
  const roadmap = PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS[gunId];
  const prefix = gunId.replace('GUN_', '');

  switch (focusPart) {
    case 'FOCUS_SILENCER':
      return [
        {
          subIndex: 0,
          code: `${prefix}-SIL-01`,
          name:
            gunId === 'GUN_07_ASCENT45'
              ? 'QuietEnergy 6-Gill Outer Moderator Housing (7075-T6)'
              : gunId === 'GUN_04_LESHIY'
              ? 'Valkyrie Octagonal Integrated Moderator Sleeve'
              : `${roadmap.gunShortTitle} Outer Acoustic Moderator Tube`,
          material: '7075-T6 Hard Black Anodized Aluminum',
          dimensionsMm: '155.0 × Ø38.0 × Ø33.0mm',
          toleranceMm: '±0.008mm',
          pressureBar: 85,
          engineeringFunction: 'Primary outer containment sleeve for muzzle gas expansion and radial air-stripping vents.',
          assignedAgent: 'GD-Agent-01 (Acoustic & Baffle Boss)',
        },
        {
          subIndex: 1,
          code: `${prefix}-SIL-02`,
          name: 'Monolithic 6-Chamber Conical K-Baffle Core',
          material: '7075-T6 CNC Billet / PA12-CF Carbon-Nylon',
          dimensionsMm: '142.0 × Ø32.9 × Ø12.2mm',
          toleranceMm: '±0.005mm',
          pressureBar: 85,
          engineeringFunction: 'Strips supersonic turbulent gas cone behind the exiting slug to reduce report by 18–22 dB.',
          assignedAgent: 'GD-Agent-03 (CFD Airflow Specialist)',
        },
        {
          subIndex: 2,
          code: `${prefix}-SIL-03`,
          name: 'Rear Coaxial Thread Mount & Air-Stripping Diffuser Cone',
          material: '17-4PH Condition H900 Stainless Steel',
          dimensionsMm: '24.0 × M14×1.25 / M18×1.0',
          toleranceMm: '±0.004mm',
          pressureBar: 110,
          engineeringFunction: 'Concentric barrel thread mount with 8 rear-facing diffuser holes feeding the reflex chamber.',
          assignedAgent: 'GD-Agent-01 (Fastener & Thread Boss)',
        },
        {
          subIndex: 3,
          code: `${prefix}-SIL-04`,
          name: 'Parker 2-024 Viton FKM-90 Moderator Endcap Seal O-Ring',
          material: 'Viton FKM-90 Fluorocarbon (90 Shore A)',
          dimensionsMm: '28.30 × 1.78mm (21.5% Radial Squeeze)',
          toleranceMm: '±0.003mm',
          pressureBar: 110,
          engineeringFunction: 'Maintains gas-tight concentric alignment between the outer moderator tube and baffle stack.',
          assignedAgent: 'GD-Agent-01 (Parker O-Ring Architect)',
        },
      ];

    case 'FOCUS_BARREL_COVER':
      return [
        {
          subIndex: 0,
          code: `${prefix}-BRL-01`,
          name:
            gunId === 'GUN_04_LESHIY'
              ? '350mm Alfa Precision Polygonal Rifled Drop-In Barrel (.30)'
              : gunId === 'GUN_05_MP30'
              ? '270mm Korean Precision Rifled .30 Cal (7.62mm) Barrel'
              : `Precision Cold-Hammer-Forged Rifled Barrel Liner`,
          material: '4140 CrMo Ordnance Steel (6-Groove Polygonal)',
          dimensionsMm:
            gunId === 'GUN_04_LESHIY' ? '350.0 × Ø14.0 × Ø7.62mm' : '380.0 × Ø15.0 × Bore',
          toleranceMm: '±0.002mm',
          pressureBar: 250,
          engineeringFunction: 'Imparts gyroscopic spin stabilization with choked muzzle crown for sub-MOA accuracy.',
          assignedAgent: 'GD-Agent-03 (Ballistics & Barrel Boss)',
        },
        {
          subIndex: 1,
          code: `${prefix}-BRL-02`,
          name:
            gunId === 'GUN_04B_THE_LEAF_45'
              ? '165cc Concentric Over-the-Barrel (OTB) Annular Air Reserve Jacket'
              : gunId === 'GUN_06_P50'
              ? '160cc Grade-9 Titanium Over-Barrel Reserve Jacket'
              : 'Tactical M-LOK / Coaxial Outer Barrel Shroud Cover',
          material: '7075-T6 / Grade-9 Ti-3Al-2.5V Seamless Tube',
          dimensionsMm: '360.0 × Ø42.0 × Ø16.0mm',
          toleranceMm: '±0.006mm',
          pressureBar: 250,
          engineeringFunction: 'Free-floats or coaxially pressurizes the barrel assembly while providing M-LOK mounting slots.',
          assignedAgent: 'GD-Agent-04 (Concentric OTB Vessel Boss)',
        },
        {
          subIndex: 2,
          code: `${prefix}-BRL-03`,
          name: 'Dual Barrel Centering Delrin / Viton Harmonic Bushings',
          material: 'Acetal Copolymer (POM-C) + Viton FKM-90 Dual O-Rings',
          dimensionsMm: '16.0 × Ø32.0 × Ø14.02mm',
          toleranceMm: '±0.004mm',
          pressureBar: 250,
          engineeringFunction: 'Eliminates barrel whip harmonics and seals coaxial OTB air galleries.',
          assignedAgent: 'GD-Agent-01 (Parker O-Ring Architect)',
        },
      ];

    case 'FOCUS_RECEIVER':
      return [
        {
          subIndex: 0,
          code: `${prefix}-RCV-01`,
          name: `${roadmap.gunShortTitle} Upper Monolithic CNC 7075-T6 Receiver Block`,
          material: '7075-T651 Billet Aluminum (5-Axis CNC)',
          dimensionsMm: '220.0 × 42.0 × 54.0mm',
          toleranceMm: '±0.005mm',
          pressureBar: 250,
          engineeringFunction: 'Structural backbone uniting barrel tenon, breech block, transfer port, and lower frame.',
          assignedAgent: 'GD-Agent-04 (Monolithic Receiver Architect)',
        },
        {
          subIndex: 1,
          code: `${prefix}-RCV-02`,
          name: 'Integral 20-MOA MIL-STD-1913 Picatinny Optics Rail',
          material: '7075-T6 Hard Anodized (MIL-A-8625 Type III)',
          dimensionsMm: '195.0 × 21.2 × 12.0mm',
          toleranceMm: '±0.005mm',
          pressureBar: 0,
          engineeringFunction: 'Zero-shift cantilever optics platform bridging the breech and forward barrel shroud.',
          assignedAgent: 'GD-Agent-04 (Monolithic Receiver Architect)',
        },
        {
          subIndex: 2,
          code: `${prefix}-RCV-03`,
          name: 'Lower Receiver Trigger & Valve Manifold Frame',
          material: '7075-T6 Billet + Grade 12.9 M5×18mm Socket Cap Bolts (6.5 N·m)',
          dimensionsMm: '185.0 × 38.0 × 46.0mm',
          toleranceMm: '±0.005mm',
          pressureBar: 250,
          engineeringFunction: 'Houses high-pressure valve gallery, indexing pawl plunger, and fire-control group.',
          assignedAgent: 'GD-Agent-02 (Receiver & Fastener Boss)',
        },
      ];

    case 'FOCUS_BREECH':
      return [
        {
          subIndex: 0,
          code: `${prefix}-BRC-01`,
          name:
            gunId === 'GUN_02_REXP'
              ? 'Evanix REX-P #11 Cylindrical Axial Sliding Breech Sleeve (26mm Stroke)'
              : gunId === 'GUN_04_LESHIY' || gunId === 'GUN_04B_THE_LEAF_45'
              ? 'EDgun Leshiy 2 Red Polyurethane 90A Open-Breech Face Seal Puck (LSA242105)'
              : gunId === 'GUN_03_DEFENDER'
              ? 'AEA Defender Ø6.00mmH7 Break-Action Hinge & Top Stirrup Breech Latch'
              : 'High-Pressure Stainless Breech Bolt Probe & Transfer Port Bush',
          material:
            gunId === 'GUN_04_LESHIY' || gunId === 'GUN_04B_THE_LEAF_45'
              ? 'Cast Polyurethane 90 Shore A + 17-4PH Backing Seat'
              : '316L / 17-4PH Hardened Stainless Steel',
          dimensionsMm:
            gunId === 'GUN_02_REXP' ? '54.0 × Ø23.90 × Ø12.04mm' : '28.0 × Ø15.5 × Ø7.62mm',
          toleranceMm: '±0.003mm',
          pressureBar: 250,
          engineeringFunction: 'Contains peak 210–250 Bar breech blast without blow-by during slug obturation.',
          assignedAgent: 'GD-Agent-02 (Breech & Seal Specialist)',
        },
        {
          subIndex: 1,
          code: `${prefix}-BRC-02`,
          name: 'High-Velocity Venturi Transfer Port Sleeve (#120)',
          material: 'C36000 Free-Machining Naval Brass + Dual Viton 8.0×1.5mm O-Rings',
          dimensionsMm: '18.5 × Ø11.0 × Ø7.2mm',
          toleranceMm: '±0.004mm',
          pressureBar: 250,
          engineeringFunction: 'Directs regulated plenum air into the barrel throat behind the projectile skirt.',
          assignedAgent: 'GD-Agent-03 (CFD Airflow Specialist)',
        },
        {
          subIndex: 2,
          code: `${prefix}-BRC-03`,
          name: 'Breech Probe / Face-Seal High-Durometer O-Ring Pair',
          material: 'Polyurethane 90A / Viton FKM-90 (22.8% Gland Squeeze)',
          dimensionsMm: '7.62 × 1.78mm / 12.0 × 1.50mm',
          toleranceMm: '±0.003mm',
          pressureBar: 250,
          engineeringFunction: 'Dynamic extrusion-resistant seal surviving 5,000+ high-pressure firing cycles.',
          assignedAgent: 'GD-Agent-01 (Parker O-Ring Architect)',
        },
      ];

    case 'FOCUS_POPPET':
      return [
        {
          subIndex: 0,
          code: `${prefix}-VAL-01`,
          name:
            gunId === 'GUN_01_PEN' || gunId === 'GUN_03_DEFENDER'
              ? '0.12mm CuNi 70/30 Laser-Scored 6-Petal Sacrificial Burst Disk'
              : gunId === 'GUN_04_LESHIY' || gunId === 'GUN_04B_THE_LEAF_45'
              ? 'EDgun 1.4ms Hammerless EAR Differential PEEK Forward-Plug Valve (LSA242200)'
              : gunId === 'GUN_02_REXP'
              ? 'Evanix REX-P #32/#34 180° Coaxial In-Line PEEK Poppet Cone'
              : 'Balanced High-Flow PEEK-GF30 Poppet Valve & Stainless Stem',
          material:
            gunId === 'GUN_01_PEN' || gunId === 'GUN_03_DEFENDER'
              ? 'Annealed CuNi 70/30 Foil (0.12mm)'
              : 'Victrex PEEK-GF30 + 17-4PH Condition H900 Stem',
          dimensionsMm: '34.0 × Ø11.8 × Ø4.0mm',
          toleranceMm: '±0.003mm',
          pressureBar: 250,
          engineeringFunction: 'Opens in 0.15ms–1.6ms to dump regulated plenum gas with Cv up to 0.94.',
          assignedAgent: 'GD-Agent-03 (Discharge Physics Specialist)',
        },
        {
          subIndex: 1,
          code: `${prefix}-VAL-02`,
          name: 'M24×1.5 / M28×1.5 High-Pressure Valve Seat Housing',
          material: '7075-T6 / 17-4PH Stainless + Parker 2-118 Viton O-Ring',
          dimensionsMm: '42.0 × Ø28.0 × Ø14.0mm',
          toleranceMm: '±0.004mm',
          pressureBar: 250,
          engineeringFunction: 'Precision lapped 45° valve seat ensuring zero slow-leak creep at 250–300 Bar.',
          assignedAgent: 'GD-Agent-03 (Discharge Physics Specialist)',
        },
        {
          subIndex: 2,
          code: `${prefix}-VAL-03`,
          name: 'Differential Pilot Bleed Jet / Return Spring Assembly',
          material: 'Chrome-Silicon Music Wire (ASTM A228)',
          dimensionsMm: '26.0 × Ø9.5mm (38 N/mm)',
          toleranceMm: '±0.010mm',
          pressureBar: 220,
          engineeringFunction: 'Snaps the poppet shut immediately after projectile exit to eliminate air waste.',
          assignedAgent: 'GD-Agent-05 (Kinematics & Spring Architect)',
        },
      ];

    case 'FOCUS_MAG':
      return [
        {
          subIndex: 0,
          code: `${prefix}-MAG-01`,
          name:
            gunId === 'GUN_03_DEFENDER'
              ? 'Dual Payload: .50 Cal 8-Pellet Buckshot Wad Shell OR Giant 375gr Carbon Hunting Arrow'
              : gunId === 'GUN_04_LESHIY'
              ? 'EDgun Leshiy 2 8-Round .30 Scalloped Magnetic Rotary Drum (LSA221000-VALK)'
              : gunId === 'GUN_04B_THE_LEAF_45'
              ? 'The Leaf 6-Round .45 Cal (11.43mm) Scalloped Magnetic Rotary Drum'
              : gunId === 'GUN_06_P50'
              ? 'P50 20-Round .50 Cal Horizontal Helical Magazine + 145cc Twin Spine Tubes'
              : `${roadmap.gunShortTitle} Precision CNC Rotary Magazine Cassette`,
          material:
            gunId === 'GUN_03_DEFENDER'
              ? 'Toray T800 Woven Carbon Shaft + 3-Blade Stainless Broadhead / #000 Lead Buckshot'
              : '7075-T6 Anodized Aluminum + N52 Neodymium Indexing Magnets',
          dimensionsMm:
            gunId === 'GUN_03_DEFENDER'
              ? '380.0 × Ø8.8mm Arrow (375gr) / Ø12.7mm 8-Pellet Wad'
              : 'Ø48.0 × 14.5mm',
          toleranceMm: '±0.005mm',
          pressureBar: 250,
          engineeringFunction: 'Positions each projectile coaxially with the rifled barrel throat to ±0.01mm.',
          assignedAgent: 'GD-Agent-04 (Magazine & Payload Boss)',
        },
        {
          subIndex: 1,
          code: `${prefix}-MAG-02`,
          name:
            gunId === 'GUN_06_P50'
              ? '90° Helical Feed Turret Ramp & M14×1.25 Dry-Break Air Stinger'
              : 'Central 4140 Hardened Star Ratchet & Coil-Sprung Indexing Pawl',
          material: '4140 Nitride-Hardened Steel (HRC 54)',
          dimensionsMm: 'Ø22.0 × 12.2mm',
          toleranceMm: '±0.004mm',
          pressureBar: 0,
          engineeringFunction: 'Indexes the drum by exactly one chamber angle per shot with positive mechanical lock.',
          assignedAgent: 'GD-Agent-05 (Kinematics & Spring Architect)',
        },
      ];

    case 'FOCUS_PLENUM':
      return [
        {
          subIndex: 0,
          code: `${prefix}-PLN-01`,
          name:
            gunId === 'GUN_07_ASCENT45'
              ? '140cc Over-the-Barrel (OTB) 210-Bar Regulated 2+ Round Plenum Cylinder'
              : gunId === 'GUN_04_LESHIY'
              ? 'EDgun 42cc Upper R.E.P.R. Regulated Plenum Tube (130B Default / 60–240B)'
              : gunId === 'GUN_04B_THE_LEAF_45'
              ? 'The Leaf 68cc Upper R.E.P.R. Big-Bore Plenum Tube (195 Bar)'
              : gunId === 'GUN_05_MP30'
              ? 'Evanix MP30 Dual Stacked 300cc 250-Bar Cylinders & Figure-8 Regulator Manifold'
              : 'High-Pressure Regulated Firing Plenum Chamber',
          material: '7075-T651 Seamless Cold-Drawn Pressure Tube',
          dimensionsMm: '310.0 × Ø36.0 × Ø28.4mm',
          toleranceMm: '±0.005mm',
          pressureBar: 250,
          engineeringFunction: 'Stores regulated firing-stage air immediately upstream of the main discharge valve.',
          assignedAgent: 'GD-Agent-03 (Plenum & Regulator Boss)',
        },
        {
          subIndex: 1,
          code: `${prefix}-PLN-02`,
          name: '16-Washer Inconel 718 Belleville Spring Regulator Piston (#116 / R.E.P.R.)',
          material: '17-4PH Piston + Inconel 718 Disc Springs + PEEK Seat',
          dimensionsMm: '46.0 × Ø24.0mm',
          toleranceMm: '±0.003mm',
          pressureBar: 300,
          engineeringFunction: 'Steps 250–300 Bar storage air down to a flat regulated setpoint (±0.8 Bar ES).',
          assignedAgent: 'GD-Agent-03 (Plenum & Regulator Boss)',
        },
        {
          subIndex: 2,
          code: `${prefix}-PLN-03`,
          name: 'Dual Parker 2-122 Viton FKM-90 High-Pressure Plenum Seals',
          material: 'Viton FKM-90 + PTFE Anti-Extrusion Backup Rings',
          dimensionsMm: '28.24 × 2.62mm (21.8% Gland Squeeze)',
          toleranceMm: '±0.003mm',
          pressureBar: 300,
          engineeringFunction: 'Prevents high-pressure bypass between the 300B reserve and regulated plenum.',
          assignedAgent: 'GD-Agent-01 (Parker O-Ring Architect)',
        },
      ];

    case 'FOCUS_FOREGRIP':
      return [
        {
          subIndex: 0,
          code: `${prefix}-FGP-01`,
          name:
            gunId === 'GUN_07_ASCENT45'
              ? 'Traditional Lever-Action Under-Barrel 300B Pump Arm (58° Front-Pivot Arc)'
              : gunId === 'GUN_06_P50'
              ? 'P50 120cc Pressurized Foregrip Reserve + Folding Bipod + 650nm Coaxial Laser'
              : 'Tactical M-LOK Foregrip & Under-Barrel Support Assembly',
          material: '7075-T6 Forged Aluminum + Toray T800 Carbon Fiber',
          dimensionsMm: '245.0 × 34.0 × 48.0mm',
          toleranceMm: '±0.006mm',
          pressureBar: 300,
          engineeringFunction:
            gunId === 'GUN_07_ASCENT45'
              ? 'Pivots around the front clevis fulcrum pin like a traditional lever action to multiply hand torque 4.8× at 300 Bar.'
              : 'Provides forward stabilization, auxiliary 250B air storage, folding bipod support, and coaxial laser aiming.',
          assignedAgent: 'GD-Agent-05 (Lever-Pump & Foregrip Boss)',
        },
        {
          subIndex: 1,
          code: `${prefix}-FGP-02`,
          name:
            gunId === 'GUN_07_ASCENT45'
              ? 'Twin 4-Bar Toggle Linkage Struts & Front M6×1.0 Fulcrum Clevis Pin'
              : gunId === 'GUN_06_P50'
              ? 'Spring-Detent Folding Twin-Leg Tactical Bipod (185mm Carbon Legs)'
              : 'Front Coaxial Swivel & Cam-Lock Collar Assembly',
          material: '17-4PH Condition H900 Stainless Steel (HRC 44)',
          dimensionsMm: '92.0 × 14.0 × 6.0mm',
          toleranceMm: '±0.004mm',
          pressureBar: 300,
          engineeringFunction:
            gunId === 'GUN_07_ASCENT45'
              ? 'Converts the 58° downward lever arc into linear axial compression of the 3-stage inner piston rod.'
              : 'Locks foregrip subsystem into firing or deployed benchrest position.',
          assignedAgent: 'GD-Agent-05 (Lever-Pump & Foregrip Boss)',
        },
        {
          subIndex: 2,
          code: `${prefix}-FGP-03`,
          name:
            gunId === 'GUN_07_ASCENT45'
              ? 'Ø6.0mm 17-4PH 3-Stage High-Pressure Piston Rod & 300B One-Way Check Valve'
              : 'Coaxial 650nm Red Laser Sight Emitter & Windage Turret',
          material: '17-4PH Ground Rod + PTFE-Bronze Guide Rings + Viton Dynamic Seals',
          dimensionsMm: '285.0 × Ø6.00mmh6',
          toleranceMm: '±0.002mm',
          pressureBar: 300,
          engineeringFunction: 'Compresses atmospheric air in 3 concentric stages up to 300 Bar (+28 Bar per lever stroke).',
          assignedAgent: 'GD-Agent-05 (Lever-Pump & Foregrip Boss)',
        },
      ];

    case 'FOCUS_GRIP':
      return [
        {
          subIndex: 0,
          code: `${prefix}-GRP-01`,
          name:
            gunId === 'GUN_02_REXP'
              ? 'Rebuilt Korean #16 Curved Match Trigger Blade & #14 5-Hole Underlever Guard'
              : gunId === 'GUN_07_ASCENT45'
              ? '2-Stage Match Trigger & Under-Grip Lever-Action Repeater Loop'
              : '2-Stage Match Trigger Blade & CNC Trigger Guard Bow',
          material: '7075-T6 Anodized Trigger + 4140 Hardened Lever Loop',
          dimensionsMm: '148.0 × 18.0 × 44.0mm',
          toleranceMm: '±0.005mm',
          pressureBar: 0,
          engineeringFunction: 'Provides crisp 1.8 lb two-stage break and mechanical lever-cocking actuation.',
          assignedAgent: 'GD-Agent-02 (Trigger & Sear Architect)',
        },
        {
          subIndex: 1,
          code: `${prefix}-GRP-02`,
          name:
            gunId === 'GUN_02_REXP'
              ? 'Rebuilt #17 Horizontal Sear Transfer Bar, #18 Primary Sear Dog & #19 Dual Springs'
              : 'Hardened Primary Sear Dog, Transfer Bar & Torsion Return Springs',
          material: 'A2 Tool Steel (HRC 58) + Music Wire Springs',
          dimensionsMm: '68.0 × 4.0 × 8.5mm',
          toleranceMm: '±0.003mm',
          pressureBar: 0,
          engineeringFunction: 'Transfers trigger pull cleanly to the rear valve release sear with zero creep.',
          assignedAgent: 'GD-Agent-02 (Trigger & Sear Architect)',
        },
        {
          subIndex: 2,
          code: `${prefix}-GRP-03`,
          name:
            gunId === 'GUN_04_LESHIY' || gunId === 'GUN_04B_THE_LEAF_45'
              ? 'EDgun Valkyrie Red/Black Layered G10 Beavertail Pistol Grip'
              : 'Ergonomic Checkered AR-15 / Target Pistol Grip Frame',
          material: 'CNC Textured G10 Composite / Carbon-Reinforced PA12',
          dimensionsMm: '108.0 × 32.0 × 52.0mm',
          toleranceMm: '±0.010mm',
          pressureBar: 0,
          engineeringFunction: 'Secures firing hand ergonomics and houses the trigger safety plunger (#20).',
          assignedAgent: 'GD-Agent-04 (Ergonomics & Frame Boss)',
        },
      ];

    case 'FOCUS_STOCK':
    default:
      return [
        {
          subIndex: 0,
          code: `${prefix}-STK-01`,
          name:
            gunId === 'GUN_04_LESHIY' || gunId === 'GUN_04B_THE_LEAF_45'
              ? '180° Left-Side Folding 137cc 300-Bar Lower Stock Tube & Hinge Frame (LSA241100)'
              : gunId === 'GUN_05_MP30'
              ? 'Evanix MP30 Side-Folding & 6-Position Telescoping M4 Tactical Buttstock'
              : gunId === 'GUN_06_P50'
              ? 'P50 280cc Dual Rear Carbon-Wrapped Buttstock Reserve Cylinders'
              : 'Rear Buttstock Frame / Coaxial 250-Bar Tank & Recoil Pad',
          material: '7075-T6 + Toray T800 Carbon Filament Winding',
          dimensionsMm: '265.0 × Ø38.0 × 115.0mm',
          toleranceMm: '±0.005mm',
          pressureBar: 300,
          engineeringFunction: 'Provides primary shoulder weld, 180° folding storage, and rear 250–300 Bar HPA capacity.',
          assignedAgent: 'GD-Agent-04 (Stock & Pressure Vessel Boss)',
        },
        {
          subIndex: 1,
          code: `${prefix}-STK-02`,
          name:
            gunId === 'GUN_04_LESHIY' || gunId === 'GUN_04B_THE_LEAF_45'
              ? 'Ø8.00mmH7 Hardened 180° Folding Hinge Pin & Top Push-Button Latch (LSA241102)'
              : 'Rear 300-Bar WIKA / EDgun Digital Manometer & Foster Quick-Fill Port',
          material: '17-4PH Stainless + Sapphire Crystal Gauge Face',
          dimensionsMm: 'Ø28.0 × 22.0mm (G1/8 BSPP)',
          toleranceMm: '±0.004mm',
          pressureBar: 300,
          engineeringFunction: 'Displays real-time reservoir pressure and locks the stock assembly with zero play.',
          assignedAgent: 'GD-Agent-03 (Telemetry & Hinge Specialist)',
        },
      ];
  }
}

export function getElonRoadmapForGun(
  gunId: CanonicalGunProgressionId
): PerGunElonRoadmapAndStateSpec {
  return (
    PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS[gunId] ||
    PER_GUN_ELON_REVERSE_ENGINEERING_ROADMAPS.GUN_01_PEN
  );
}

