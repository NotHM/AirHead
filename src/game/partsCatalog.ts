import { FourZonePneumaticState, PumpMode, OneWayFillTarget } from '../wasm/pneumaticWasm';

export type AirWeaponClass = 'AIR_RIFLE' | 'AIR_PISTOL' | 'AIR_SHOTGUN' | 'DIY_STEN_AIRGUN';

export type SubsystemCategory =
  | 'FX_DRS_OTB_AND_PLENUM'
  | 'LESHIY2_STOCK_AND_ROTARY'
  | 'SENECA_ASPEN_3STAGE_PUMP'
  | 'CAM_LOCK_FOREGRIP_AND_MANIFOLD'
  | 'CUSTOM_3D_CAD_GENERATOR';

export interface PneumaticComponentSpec {
  id: string;
  name: string;
  subsystem: string;
  category: SubsystemCategory;
  slot:
    | 'otb_shroud'
    | 'liner_seals'
    | 'fill_block'
    | 'primary_regulator'
    | 'modular_plenum'
    | 'manometer_bracket'
    | 'handguard_chassis'
    | 'buttstock_tank'
    | 'buttstock_extension'
    | 'stock_regulator'
    | 'hinge_manifold'
    | 'firing_valve'
    | 'power_jets'
    | 'rotary_magazine'
    | 'mag_plates'
    | 'indexing_roller'
    | 'transfer_puck'
    | 'pump_cylinder'
    | 'stage3_rod'
    | 'four_bar_linkage'
    | 'pump_release'
    | 'discharge_check'
    | 'relief_valve'
    | 'lube_port'
    | 'foregrip_bottle'
    | 'cam_collar'
    | 'coaxial_swivel'
    | 'pump_carriage'
    | 'stage3_pistons'
    | 'shuttle_manifold'
    | 'priority_check_block';
  partRef: string;
  capacityOrSpec: string;
  primaryFunction: string;
  // Physical modifiers
  otbVolumeCc?: number;
  buttstockVolumeCc?: number;
  foregripVolumeCc?: number;
  plenumVolumeCc?: number;
  regulatorBar?: number;
  powerJetMm?: number;
  magazineCapacity?: number;
  caliberMm?: number;
  projectileMassGrains?: number;
  pelletCount?: number;
  barrelLengthMm?: number;
  pumpSweptCc?: number;
  pumpMode?: PumpMode;
  massGrams: number;
  ergonomicsDelta: number;
}

export interface Custom3DPrintedPartConfig {
  enabled: boolean;
  partName: string;
  polymerMaterial: 'PA12_CF_CARBON_NYLON' | 'PEEK_GF30_AEROSPACE' | 'PLA_PRO_TOUGH' | 'CNC_7075_HYBRID';
  geometryType: 'STEN_SIDE_FEED_RECEIVER' | 'INTEGRATED_BAFFLE_MODERATOR' | 'BULLPUP_MANIFOLD_CHASSIS' | 'VENTURI_SHOTGUN_CHOKE';
  wallThicknessMm: number; // 2.5 to 8.0 mm
  gyroidInfillPct: number; // 35 to 100 %
  transferPortBoreMm: number; // 3.5 to 7.5 mm
  baffleChambers: number; // 0 to 8
}

export interface WeaponBuildLoadout {
  id: string;
  name: string;
  weaponClass: AirWeaponClass;
  description: string;
  // Selected part IDs per key slot
  otbShroudId: string;
  modularPlenumId: string;
  regulatorId: string;
  handguardId: string;
  buttstockTankId: string;
  buttstockExtensionId: string;
  firingValveId: string;
  powerJetsId: string;
  rotaryMagId: string;
  pumpCylinderId: string;
  fourBarLinkageId: string;
  foregripBottleId: string;
  camCollarId: string;
  stage3PistonsId: string;
  shuttleManifoldId: string;
  priorityCheckBlockId: string;
  // Fine tuning
  regulatorSetpointBar: number;
  oneWayFillTarget: OneWayFillTarget;
  finishColorHex: string;
  accentColorHex: string;
  custom3dPart: Custom3DPrintedPartConfig;
}

/**
 * Complete Component Catalog covering all 4 canonical subsystems from the specification
 * plus off-the-shelf & 3D-printed Sten / Air Shotgun / Air Pistol variants.
 */
export const PNEUMATIC_PARTS_CATALOG: PneumaticComponentSpec[] = [
  // ============================================================================
  // 1. FX DRS Tactical: Over-the-Barrel Air Reservoir & Modular Plenum
  // ============================================================================
  {
    id: 'otb_fx_drs_208',
    name: 'OTB Air Cylinder Shroud (Carbine)',
    subsystem: 'Barrel Reservoir',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'FX-DRS-OTB-500',
    capacityOrSpec: '208 cc @ 250 bar',
    primaryFunction: 'Concentric high-pressure storage around barrel liner',
    otbVolumeCc: 208,
    barrelLengthMm: 500,
    massGrams: 480,
    ergonomicsDelta: 8,
  },
  {
    id: 'otb_fx_drs_307',
    name: 'OTB Air Cylinder Shroud (Sniper)',
    subsystem: 'Barrel Reservoir',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'FX-DRS-OTB-700',
    capacityOrSpec: '307 cc @ 250 bar',
    primaryFunction: 'Extended coaxial over-barrel reservoir for maximum shot count',
    otbVolumeCc: 307,
    barrelLengthMm: 700,
    massGrams: 690,
    ergonomicsDelta: 2,
  },
  {
    id: 'otb_sten_coaxial_165',
    name: 'Perforated Sten Coaxial Air Jacket',
    subsystem: 'Barrel Reservoir',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'DIY-STEN-OTB-165',
    capacityOrSpec: '165 cc Seamless Hydraulic Tube',
    primaryFunction: 'Off-the-shelf 4130 hydraulic tube Concentric Sten Barrel Jacket',
    otbVolumeCc: 165,
    barrelLengthMm: 380,
    massGrams: 520,
    ergonomicsDelta: 12,
  },
  {
    id: 'otb_pistol_micro_85',
    name: 'Micro-Bore Coaxial Pistol Shroud',
    subsystem: 'Barrel Reservoir',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'FX-AP-OTB-85',
    capacityOrSpec: '85 cc Compact Shroud',
    primaryFunction: 'Ultra-short concentric air pistol barrel reservoir',
    otbVolumeCc: 85,
    barrelLengthMm: 220,
    massGrams: 210,
    ergonomicsDelta: 24,
  },
  {
    id: 'seals_nbr90',
    name: 'Barrel Liner Seals',
    subsystem: 'Barrel Reservoir',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'liner_seals',
    partRef: 'NBR90-DUAL',
    capacityOrSpec: 'Dual NBR90 O-rings',
    primaryFunction: 'Isolates barrel liner from pressurized air',
    massGrams: 8,
    ergonomicsDelta: 0,
  },
  {
    id: 'fill_foster_block',
    name: 'Front Shroud Fill Block',
    subsystem: 'Barrel Reservoir',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'fill_block',
    partRef: 'FX-FOSTER-BLK',
    capacityOrSpec: 'Foster probe port',
    primaryFunction: 'Houses intake check valve and fill port',
    massGrams: 65,
    ergonomicsDelta: 0,
  },
  {
    id: 'reg_mkii_amp',
    name: 'MkII AMP Regulator',
    subsystem: 'Pressure Control',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'primary_regulator',
    partRef: 'FX-AMP-MK2',
    capacityOrSpec: 'Externally adjustable (90–170 bar)',
    primaryFunction: 'Steps down shroud & gallery pressure into Modular Plenum',
    regulatorBar: 145,
    massGrams: 95,
    ergonomicsDelta: 2,
  },
  {
    id: 'reg_ear_inline',
    name: 'Inline Stock Regulator (EAR)',
    subsystem: 'Pressure Control',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'primary_regulator',
    partRef: 'EAR LSA242500',
    capacityOrSpec: '110–160 bar Sub-Regulated',
    primaryFunction: 'Regulates air inside lower stock tube & feeds shared plenum',
    regulatorBar: 130,
    massGrams: 88,
    ergonomicsDelta: 3,
  },
  {
    id: 'reg_sten_highflow',
    name: 'Off-the-Shelf Paintball/HPA Myth Regulator',
    subsystem: 'Pressure Control',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'primary_regulator',
    partRef: 'OTS-HPA-120',
    capacityOrSpec: '120 bar Rapid-Refresh',
    primaryFunction: 'High-cycle-rate off-the-shelf regulator for automatic Sten builds',
    regulatorBar: 120,
    massGrams: 115,
    ergonomicsDelta: 1,
  },
  {
    id: 'plenum_hp_35',
    name: 'Modular HP Plenum (35 cc)',
    subsystem: 'Lower Plenum',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'modular_plenum',
    partRef: 'FX-PLEN-HP35',
    capacityOrSpec: '35 cc Regulated Chamber',
    primaryFunction: 'Detachable regulated chamber ahead of trigger for pellets & fast cycling',
    plenumVolumeCc: 35,
    massGrams: 140,
    ergonomicsDelta: 6,
  },
  {
    id: 'plenum_shp_63',
    name: 'Modular SHP Plenum (63 cc)',
    subsystem: 'Lower Plenum',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'modular_plenum',
    partRef: 'FX-PLEN-SHP63',
    capacityOrSpec: '63 cc Super High Power',
    primaryFunction: 'Box-magazine-profile high-volume chamber for heavy slugs',
    plenumVolumeCc: 63,
    massGrams: 225,
    ergonomicsDelta: 3,
  },
  {
    id: 'plenum_shotgun_92',
    name: 'Twin-Chamber Air Shotgun Blast Plenum (92 cc)',
    subsystem: 'Lower Plenum',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'modular_plenum',
    partRef: 'SEN-SG-PLEN92',
    capacityOrSpec: '92 cc High-Dump Chamber',
    primaryFunction: 'Massive staging plenum for .50 cal air shotgun multi-pellet buckshot',
    plenumVolumeCc: 92,
    massGrams: 310,
    ergonomicsDelta: -2,
  },
  {
    id: 'manometer_angled',
    name: 'Plenum Manometer Bracket',
    subsystem: 'Lower Plenum',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'manometer_bracket',
    partRef: 'FX-MANO-45',
    capacityOrSpec: 'Angled gauge mount',
    primaryFunction: 'Reads regulated plenum pressure directly in shooter line-of-sight',
    massGrams: 42,
    ergonomicsDelta: 2,
  },
  {
    id: 'handguard_mlok',
    name: 'Free-Float Tactical Handguard',
    subsystem: 'Chassis',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'handguard_chassis',
    partRef: 'FX-DRS-MLOK',
    capacityOrSpec: 'M-LOK 6061-T6 Aluminum',
    primaryFunction: 'Shields pressurized OTB shroud from barrel flex & houses cam slots',
    massGrams: 340,
    ergonomicsDelta: 10,
  },
  {
    id: 'handguard_sten_printed',
    name: '3D-Printed PA12-CF Sten Shroud Cage',
    subsystem: 'Chassis',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'handguard_chassis',
    partRef: 'CAD-STEN-HG01',
    capacityOrSpec: 'Gyroid Carbon-Nylon Sleeve',
    primaryFunction: 'Lightweight printed thermal/impact guard with integrated pump track',
    massGrams: 195,
    ergonomicsDelta: 15,
  },

  // ============================================================================
  // 2. EDgun Leshiy 2: Buttstock Air Reservoir & Rotary Cartridge System
  // ============================================================================
  {
    id: 'buttstock_leshiy_dual',
    name: 'Dual-Tube Buttstock Tank',
    subsystem: 'Rear Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'Assembly LSA242000',
    capacityOrSpec: '170 cc Folding Dual-Tube',
    primaryFunction: 'Stores primary air inside folding buttstock (upper HP + lower regulated)',
    buttstockVolumeCc: 170,
    massGrams: 540,
    ergonomicsDelta: 9,
  },
  {
    id: 'buttstock_sten_tstock',
    name: 'Welded Tubular Sten T-Stock Reservoir',
    subsystem: 'Rear Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'OTS-STEN-T130',
    capacityOrSpec: '130 cc Chromoly Strut Tank',
    primaryFunction: 'Uses hollow Sten Mk.II shoulder stock tube as pressurized air chamber',
    buttstockVolumeCc: 130,
    massGrams: 460,
    ergonomicsDelta: 11,
  },
  {
    id: 'buttstock_pistol_cap',
    name: 'Rear Endcap Micro-Chamber (Pistol)',
    subsystem: 'Rear Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'LSA-PISTOL-45',
    capacityOrSpec: '45 cc Grip-Heel Cell',
    primaryFunction: 'Stockless pistol rear plug reservoir for compact CQB handling',
    buttstockVolumeCc: 45,
    massGrams: 130,
    ergonomicsDelta: 22,
  },
  {
    id: 'ext_leshiy_carbon_350',
    name: 'Buttstock Bottle Extension (350 cc Carbon)',
    subsystem: 'Rear Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_extension',
    partRef: 'Part LSA242011',
    capacityOrSpec: '+350 cc Carbon-Fiber Bottle',
    primaryFunction: 'Expands rear air volume with 300-bar carbon-wrapped bottle',
    buttstockVolumeCc: 350,
    massGrams: 390,
    ergonomicsDelta: -3,
  },
  {
    id: 'ext_none',
    name: 'Standard Flush Tube Plug (No Bottle Extension)',
    subsystem: 'Rear Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_extension',
    partRef: 'LSA242001-PLUG',
    capacityOrSpec: '0 cc (Flush Streamlined)',
    primaryFunction: 'Keeps rear dual-tube buttstock ultra-compact for fast shouldering',
    buttstockVolumeCc: 0,
    massGrams: 25,
    ergonomicsDelta: 6,
  },
  {
    id: 'valve_forward_plug',
    name: 'Forward Plug Valve (Hammerless)',
    subsystem: 'Firing Valve',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'firing_valve',
    partRef: 'Assembly LSA242200',
    capacityOrSpec: 'Hammerless Differential Valve',
    primaryFunction: 'Dumps regulated plenum air straight through Rotary Cartridge Magazine',
    massGrams: 75,
    ergonomicsDelta: 4,
  },
  {
    id: 'jets_02mm',
    name: 'Dual Power Jets (0.2 mm Fast-Cycle)',
    subsystem: 'Cycling Control',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'power_jets',
    partRef: 'LSA-JET-02',
    capacityOrSpec: 'Dual 0.2 mm Nozzles',
    primaryFunction: 'High air conservation & crisp semi-auto indexing for precision rifles',
    powerJetMm: 0.2,
    massGrams: 6,
    ergonomicsDelta: 1,
  },
  {
    id: 'jets_07mm',
    name: 'Dual Power Jets (0.7 mm Tactical Balanced)',
    subsystem: 'Cycling Control',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'power_jets',
    partRef: 'LSA-JET-07',
    capacityOrSpec: 'Dual 0.7 mm Nozzles',
    primaryFunction: 'Balanced dwell time and aggressive pneumatic roller rotation',
    powerJetMm: 0.7,
    massGrams: 6,
    ergonomicsDelta: 1,
  },
  {
    id: 'jets_13mm',
    name: 'Dual Power Jets (1.3 mm Rapid / Heavy Slug)',
    subsystem: 'Cycling Control',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'power_jets',
    partRef: 'LSA-JET-13',
    capacityOrSpec: 'Dual 1.3 mm Nozzles',
    primaryFunction: 'Fast pressure bleed for ultra-rapid Sten cycling or heavy shotgun shells',
    powerJetMm: 1.3,
    massGrams: 6,
    ergonomicsDelta: 1,
  },
  {
    id: 'mag_leshiy_8rd_slug',
    name: 'Rotary Cartridge Magazine (.25 Cal 8-Round)',
    subsystem: 'Ammunition Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'LSA-MAG-25-8',
    capacityOrSpec: '8-round metal cylinder (.25 cal / 6.35mm 38gr Slugs)',
    primaryFunction: 'Fires projectile directly from magazine chamber via Transfer Port Puck',
    magazineCapacity: 8,
    caliberMm: 6.35,
    projectileMassGrains: 38,
    pelletCount: 1,
    massGrams: 110,
    ergonomicsDelta: 4,
  },
  {
    id: 'mag_sten_side_24rd',
    name: '3D-Printed Horizontal Sten Side-Indexing Drum (24-Round)',
    subsystem: 'Ammunition Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'CAD-STEN-MAG24',
    capacityOrSpec: '24-round .22 cal (5.5mm 25gr) Side-Feed Rotary',
    primaryFunction: 'Combines Sten left-side horizontal port with Leshiy pneumatic indexing roller',
    magazineCapacity: 24,
    caliberMm: 5.5,
    projectileMassGrains: 25,
    pelletCount: 1,
    massGrams: 185,
    ergonomicsDelta: 2,
  },
  {
    id: 'mag_shotgun_6rd_buck',
    name: 'Rotary Air Shotgun Cylinder (.50 Cal 6-Shell)',
    subsystem: 'Ammunition Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'SEN-SG-MAG6',
    capacityOrSpec: '6-shell .50 cal (12.7mm 8-Pellet Pneumatic Buckshot)',
    primaryFunction: 'Fires 8 high-velocity lead pellets per chamber directly from rotary cylinder',
    magazineCapacity: 6,
    caliberMm: 12.7,
    projectileMassGrains: 115,
    pelletCount: 8,
    massGrams: 240,
    ergonomicsDelta: -1,
  },
  {
    id: 'mag_pistol_12rd',
    name: 'High-Speed Pistol Rotary Ring (.177 Cal 12-Round)',
    subsystem: 'Ammunition Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'LSA-MAG-177-12',
    capacityOrSpec: '12-round .177 cal (4.5mm 13gr Heavy Diabolo)',
    primaryFunction: 'Low-inertia titanium cylinder for rapid air pistol double-taps',
    magazineCapacity: 12,
    caliberMm: 4.5,
    projectileMassGrains: 13.4,
    pelletCount: 1,
    massGrams: 75,
    ergonomicsDelta: 8,
  },

  // ============================================================================
  // 3. Air Venturi Seneca Aspen ("Airtari Accent"): Integrated 3-Stage Hand Pump
  // ============================================================================
  {
    id: 'pump_aspen_3stage',
    name: '3-Stage Telescopic Cylinder (250 bar)',
    subsystem: 'Compression Core',
    category: 'SENECA_ASPEN_3STAGE_PUMP',
    slot: 'pump_cylinder',
    partRef: 'AV-ASPEN-3STG',
    capacityOrSpec: '250 bar / 3,600 psi Nested Tubes',
    primaryFunction: 'Compresses ambient air across three coaxial stages parallel to barrel',
    pumpSweptCc: 4200, // Equivalent atmospheric cc compressed per full stroke
    massGrams: 580,
    ergonomicsDelta: -4,
  },
  {
    id: 'pump_compact_carbon',
    name: 'Lightweight Titanium 3-Stage Micro-Pump',
    subsystem: 'Compression Core',
    category: 'SENECA_ASPEN_3STAGE_PUMP',
    slot: 'pump_cylinder',
    partRef: 'AV-TI-3STG',
    capacityOrSpec: '250 bar Short-Stroke Core',
    primaryFunction: 'Reduced-weight nested compression core for pistols & Sten carbines',
    pumpSweptCc: 3100,
    massGrams: 360,
    ergonomicsDelta: 5,
  },
  {
    id: 'linkage_four_bar',
    name: 'Compound Four-Bar Linkage',
    subsystem: 'Leverage Arm',
    category: 'SENECA_ASPEN_3STAGE_PUMP',
    slot: 'four_bar_linkage',
    partRef: 'AV-4BAR-STRUT',
    capacityOrSpec: 'Pivoting hardened steel struts',
    primaryFunction: 'Multiplies mechanical advantage right as lever closes against stock',
    massGrams: 220,
    ergonomicsDelta: 3,
  },

  // ============================================================================
  // 4. Movable Foregrip Air Container & Cam-Locking Pump Mechanism
  // ============================================================================
  {
    id: 'foregrip_carbon_180',
    name: 'Pressurized Foregrip Bottle (180 cc Carbon)',
    subsystem: 'Foregrip Storage',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'foregrip_bottle',
    partRef: 'FG-CARB-180',
    capacityOrSpec: '180 cc Carbon-Wrapped Cylinder',
    primaryFunction: 'Acts as both third high-pressure air tank and ergonomic pump handle',
    foregripVolumeCc: 180,
    massGrams: 310,
    ergonomicsDelta: 7,
  },
  {
    id: 'foregrip_kevlar_260',
    name: 'Heavy Tactical Foregrip Bottle (260 cc)',
    subsystem: 'Foregrip Storage',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'foregrip_bottle',
    partRef: 'FG-KEV-260',
    capacityOrSpec: '260 cc Kevlar-Wrapped Cylinder',
    primaryFunction: 'High-capacity reciprocating foregrip tank for extended field autonomy',
    foregripVolumeCc: 260,
    massGrams: 430,
    ergonomicsDelta: 2,
  },
  {
    id: 'cam_interrupted_lug',
    name: 'Interrupted-Lug Cam Collar & Coaxial Swivel',
    subsystem: 'Lock / Unlock Hub',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'cam_collar',
    partRef: 'CAM-TRUNNION-90',
    capacityOrSpec: '90° Rotary Trunnion + Dual PTFE Swivel',
    primaryFunction: 'Locks at 3/9 o\'clock (feeds air bus); unlocks at 6 o\'clock to reciprocate pump',
    massGrams: 165,
    ergonomicsDelta: 6,
  },
  {
    id: 'pistons_opposed_dual',
    name: 'Opposed Dual-Stage-3 Pistons (Bi-Directional)',
    subsystem: 'Bi-Directional Pump',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'stage3_pistons',
    partRef: 'STG3-OPPOSED-2X',
    capacityOrSpec: 'Twin opposed check ports (Pull + Push output)',
    primaryFunction: 'Pull stroke charges Buttstock Tank; Push stroke charges OTB Shroud & Foregrip',
    pumpMode: 'BI_DIRECTIONAL_OPPOSED',
    massGrams: 145,
    ergonomicsDelta: 2,
  },
  {
    id: 'pistons_single_rotary',
    name: 'Single-Acting Stage-3 + 3-Pos Rotary Fill Collar',
    subsystem: 'Air Routing',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'stage3_pistons',
    partRef: 'STG3-ROTARY-1X',
    capacityOrSpec: 'Lowest physical effort + 3-Zone Selector',
    primaryFunction: 'Compresses on push stroke only; rotary collar selects Plenum/OTB, Stock, or Foregrip',
    pumpMode: 'ONE_WAY_ROTARY_SELECT',
    massGrams: 110,
    ergonomicsDelta: 5,
  },
  {
    id: 'shuttle_dual_manifold',
    name: 'Directional Shuttle Manifold',
    subsystem: 'Air Routing',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'shuttle_manifold',
    partRef: 'MAN-SHUTTLE-02',
    capacityOrSpec: 'Dual-check selector block',
    primaryFunction: 'Directs forward and rear pump strokes to isolated reservoir circuits',
    massGrams: 85,
    ergonomicsDelta: 2,
  },
  {
    id: 'priority_check_block_3tank',
    name: 'Priority Isolation Check Block',
    subsystem: '3-Tank Integration',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'priority_check_block',
    partRef: 'ISO-CHK-3WAY',
    capacityOrSpec: 'Sequenced parallel one-way valves',
    primaryFunction: 'Links Foregrip, OTB Shroud, and Buttstock Tank without cross-draining if serviced',
    massGrams: 95,
    ergonomicsDelta: 4,
  },

  // ============================================================================
  // 5. Reference Airgun Functional Parts (Welrod Cutaway, Evanix REX/REX-P,
  //    AEA Harpoon/Defender Red Cartridges, Texoma Pen, Carbon Cane Kit, Evanix MP30)
  // ============================================================================
  {
    id: 'otb_welrod_12baffle_cutaway',
    name: 'Welrod Mk.IIA 12-Baffle Integral Moderator & Red Bolt Tube',
    subsystem: 'Covert Integral Baffle Barrel',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'WELROD-MK2A-12B',
    capacityOrSpec: '140 cc Coaxial + 12 Stepped K-Baffles & Neoprene Wipes',
    primaryFunction: 'Continuous cylindrical outer tube housing red telescoping bolt probe and 12-chamber acoustic stack (58 dB)',
    otbVolumeCc: 140,
    barrelLengthMm: 340,
    massGrams: 390,
    ergonomicsDelta: 18,
  },
  {
    id: 'otb_aea_harpoon_twin_tubes',
    name: 'AEA Harpoon / Defender Twin Screw-In Barrel Tubes & Slotted Brake',
    subsystem: 'Modular Twin-Bore Barrel',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'AEA-HARP-2X-BBL',
    capacityOrSpec: '190 cc Twin Screw-In Tubes (.45 / .50 / 12-Ga)',
    primaryFunction: 'Interchangeable threaded twin barrels with front slotted muzzle brake shroud and under-barrel laser rail',
    otbVolumeCc: 190,
    barrelLengthMm: 360,
    massGrams: 540,
    ergonomicsDelta: 11,
  },
  {
    id: 'otb_cane_6barrel_insert_kit',
    name: 'Carbon Cane Shaft + 6 Multi-Caliber Screw-In Barrel Inserts & Arrow Tube',
    subsystem: 'Concealed Cane & Multi-Insert Kit',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'AEA-CANE-6KIT',
    capacityOrSpec: '220 cc Carbon Shaft + 6 Stepped Barrel Inserts (.22 to .45 + Air-Bow Arrow)',
    primaryFunction: 'Woven carbon walking cane housing modular threaded barrel inserts and fletched pneumatic arrow launch tube',
    otbVolumeCc: 220,
    barrelLengthMm: 680,
    massGrams: 460,
    ergonomicsDelta: 14,
  },
  {
    id: 'plenum_aea_red_burst_cartridges',
    name: 'AEA Dual Red-Anodized Screw-In Burst-Disk Air Cartridges (110 cc)',
    subsystem: 'Pre-Charged Cartridge Plenum',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'modular_plenum',
    partRef: 'AEA-RED-CART-2X',
    capacityOrSpec: '110 cc Twin 310-Bar Red Anodized Cartridges + Burst Disks',
    primaryFunction: 'Quick-change pre-charged red aluminum cartridges sealed with calibrated Mylar/Copper/Nickel sacrificial burst disks',
    plenumVolumeCc: 110,
    massGrams: 280,
    ergonomicsDelta: 7,
  },
  {
    id: 'handguard_evanix_rex_slotted',
    name: 'Evanix REX High-Rise Cantilever Weaver Rail & Slotted Shroud',
    subsystem: 'Chassis & Optic Bridge',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'handguard_chassis',
    partRef: 'EVX-REX-BRIDGE',
    capacityOrSpec: 'Cantilever Weaver/Picatinny Rail + Vent-Slotted Shroud',
    primaryFunction: 'Bridges inline breech with elevated optic rail and ventilated barrel shroud (REX / REX-P architecture)',
    massGrams: 260,
    ergonomicsDelta: 13,
  },
  {
    id: 'handguard_evanix_mp30_chevron',
    name: 'Evanix MP30 Chevron-Vented SMG Shroud & Ported Stainless Brake',
    subsystem: 'SMG Tactical Handguard',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'handguard_chassis',
    partRef: 'EVX-MP30-CHEV',
    capacityOrSpec: 'Chevron-Cut M-LOK Handguard + Stainless Muzzle Brake',
    primaryFunction: '2025 Evanix MP30 semi-auto submachine gun shroud with chevron cooling vents and full top Picatinny rail',
    massGrams: 310,
    ergonomicsDelta: 14,
  },
  {
    id: 'buttstock_evanix_rex_crosshatch',
    name: 'Evanix REX Cross-Hatched Rubber-Coated Rear Air Cylinder (290 cc)',
    subsystem: 'Rear Inline Cylinder Stock',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'EVX-REX-CYL290',
    capacityOrSpec: '290 cc Cross-Hatch Textured Rear Cylinder + Buttpad',
    primaryFunction: 'Threads directly into rear of receiver as inline high-pressure air tank with X-textured rubberized cheek/shoulder grip',
    buttstockVolumeCc: 290,
    massGrams: 490,
    ergonomicsDelta: 12,
  },
  {
    id: 'buttstock_texoma_red_pen_lslot',
    name: 'Texoma Red-Anodized Pellet Pen Body & L-Slot Striker Knob (38 cc)',
    subsystem: 'Micro-Pen Inline Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'TEX-PEN-RED38',
    capacityOrSpec: '38 cc Red-Anodized Tube + L-Slot Bolt Striker & Paracord Loop',
    primaryFunction: 'Ultra-compact pocket pen air reservoir with rear knurled collar and thumb-cocked L-slot striker pin',
    buttstockVolumeCc: 38,
    massGrams: 95,
    ergonomicsDelta: 28,
  },
  {
    id: 'valve_evanix_rex_underlever_guard',
    name: 'Evanix REX 5-Hole Trigger-Guard Underlever Drop-Block Action',
    subsystem: 'Underlever Breech & 2-Stage Trigger',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'firing_valve',
    partRef: 'EVX-REX-ULEVER',
    capacityOrSpec: '5-Hole Skeletonized Trigger-Guard Underlever + Inline Poppet',
    primaryFunction: 'Pivoting the 5-hole skeletonized trigger guard downward cocks the striker and opens the straight-line breech block',
    massGrams: 145,
    ergonomicsDelta: 9,
  },
  {
    id: 'valve_welrod_knurled_bolt',
    name: 'Welrod Rear Knurled Rotating Bolt Knob & Red Telescoping Probe',
    subsystem: 'Silent Bolt-Action Valve',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'firing_valve',
    partRef: 'WELROD-BOLT-RED',
    capacityOrSpec: 'Zero-Blowback Locked Breech + Grip Safety',
    primaryFunction: 'Locks red-anodized bolt probe directly behind pellet skirt with zero mechanical action clatter during discharge',
    massGrams: 110,
    ergonomicsDelta: 8,
  },
  {
    id: 'mag_evanix_mp30_tower_15rd',
    name: 'Evanix MP30 High-Tower .30 Cal (7.62mm) 15-Round Semi-Auto Magazine',
    subsystem: 'SMG Tower Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'EVX-MP30-MAG15',
    capacityOrSpec: '15-round .30 cal (7.62mm 50gr Slug) Vertical Tower Cassette',
    primaryFunction: 'High-profile top-indexing magazine block engineered for 2025 Evanix MP30 semi-automatic SMG cycling',
    magazineCapacity: 15,
    caliberMm: 7.62,
    projectileMassGrains: 50,
    pelletCount: 1,
    massGrams: 165,
    ergonomicsDelta: 6,
  },
  {
    id: 'mag_aea_twin_breach_2rd',
    name: 'AEA Harpoon / Defender Twin-Cartridge 2-Shot .50 Cal Breach',
    subsystem: 'Double-Barrel Cartridge Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'AEA-HARP-2RD',
    capacityOrSpec: '2-shot .50 cal (12.7mm 185gr Slug / 8-Pellet Buckshot / Arrow)',
    primaryFunction: 'Fires directly from twin screw-in barrel tubes backed by red anodized burst-disk air cartridges',
    magazineCapacity: 2,
    caliberMm: 12.7,
    projectileMassGrains: 185,
    pelletCount: 8,
    massGrams: 190,
    ergonomicsDelta: 5,
  },
  {
    id: 'foregrip_evanix_mp30_vertical_gauge',
    name: 'Evanix MP30 Vertical Foregrip HPA Cylinder w/ Bottom Manometer (220 cc)',
    subsystem: 'Vertical Grip Air Tank',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'foregrip_bottle',
    partRef: 'EVX-MP30-VGRIP-220',
    capacityOrSpec: '220 cc Finger-Grooved Vertical Grip Tank + Bottom Pressure Gauge',
    primaryFunction: 'Stores 250-bar air directly inside the ergonomic finger-grooved vertical SMG foregrip with recessed bottom manometer',
    foregripVolumeCc: 220,
    massGrams: 340,
    ergonomicsDelta: 12,
  },
  {
    id: 'reg_ascent_part116_balancer',
    name: 'Air Venturi Ascent Part 116 Floating Air-Spring Balancer (2,000 PSI)',
    subsystem: 'Counter-Pressure Balancer System',
    category: 'SENECA_ASPEN_3STAGE_PUMP',
    slot: 'primary_regulator',
    partRef: 'AV-ASCENT-PT116',
    capacityOrSpec: '150 bar (2,000 PSI) Factory Counter-Pressure Piston + Quad O-Rings 122/123',
    primaryFunction: 'Slides inside 170cc HPA tube as fill pressure drops, dynamically expanding firing-valve volume for a flat velocity curve',
    regulatorBar: 145,
    massGrams: 68,
    ergonomicsDelta: 4,
  },
  {
    id: 'pump_ascent_3stage_apex_170cc',
    name: 'Air Venturi Ascent 3-Stage Apex Pump & 170cc Enlarged Tube (Handle Lock)',
    subsystem: 'Gen-2 Built-In Apex Pump',
    category: 'SENECA_ASPEN_3STAGE_PUMP',
    slot: 'pump_cylinder',
    partRef: 'AV-ASCENT-APEX3',
    capacityOrSpec: '3,625 PSI (250 BAR) + In-Handle Lock Button + Auto Relief Valve',
    primaryFunction: '40% larger 170cc HPA tube (5,000-shot life tested) with side-of-action fill port, lube hole, and Allen depressurizing screw',
    pumpSweptCc: 4500,
    massGrams: 560,
    ergonomicsDelta: 2,
  },
  {
    id: 'valve_hatsan_vectis_lever_quattro',
    name: 'Hatsan Vectis Trigger-Guard Cowboy Lever-Action & Quattro 2-Stage Trigger',
    subsystem: 'Lever-Action Repeater',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'firing_valve',
    partRef: 'HAT-VECTIS-LVR',
    capacityOrSpec: 'Pivoting Finger-Loop Lever + Fully Adjustable Quattro Trigger',
    primaryFunction: 'Cycles 10/12/14-shot rotary magazine and cocks internal hammer via integrated trigger-guard finger loop',
    massGrams: 155,
    ergonomicsDelta: 11,
  },
  {
    id: 'otb_hatsan_vectis_qe_165cc',
    name: 'Hatsan Vectis QuietEnergy (QE) Moderator Barrel & 165cc Air Cylinder',
    subsystem: 'QE Shrouded Barrel & Tube',
    category: 'FX_DRS_OTB_AND_PLENUM',
    slot: 'otb_shroud',
    partRef: 'HAT-VECTIS-QE165',
    capacityOrSpec: '165 cc @ 200 bar + Choked Barrel + Flip-Up Fiber Sights',
    primaryFunction: 'Precision rifled and choked barrel with integrated QuietEnergy vented muzzle moderator and bottom pressure gauge',
    otbVolumeCc: 165,
    barrelLengthMm: 450,
    massGrams: 470,
    ergonomicsDelta: 10,
  },
  {
    id: 'foregrip_hatsan_velox_grip_cell',
    name: 'Hatsan Velox Part 4336 Under-Barrel Cylinder + Part 3340 Grip Spare Cell',
    subsystem: 'Dual Micro-Pistol Cylinders',
    category: 'CAM_LOCK_FOREGRIP_AND_MANIFOLD',
    slot: 'foregrip_bottle',
    partRef: 'VELOX-4336-3340',
    capacityOrSpec: '55 cc Under-Barrel + 40 cc In-Grip Quick-Swap Air Cylinder',
    primaryFunction: 'Combines detachable front air cylinder (Part 4336) with spare pressurized cylinder stored inside pistol grip (Part 3340)',
    foregripVolumeCc: 95,
    massGrams: 215,
    ergonomicsDelta: 16,
  },
  {
    id: 'buttstock_snowpeak_pp750l_telestock',
    name: 'Snowpeak PP750L Twin-Rod Telescoping Wire Buttstock & Regulated Tube',
    subsystem: 'Collapsible Pistol-Carbine Stock',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'SPK-PP750L-TELE',
    capacityOrSpec: '65 cc Regulated Tube + Twin Sliding Steel Struts',
    primaryFunction: 'Collapses flush against hardwood grip for pistol holstering or extends into a rigid shoulder carbine stock',
    buttstockVolumeCc: 65,
    massGrams: 240,
    ergonomicsDelta: 19,
  },
  {
    id: 'mag_leshiy_valkyrie_scalloped_red',
    name: 'EDgun Leshiy 2 Valkyrie Red-Anodized Scalloped Rotary Drum & 8-Tooth Star Ratchet',
    subsystem: 'Agent Benchmark Rotary Feed',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'LSA221000-VALK',
    capacityOrSpec: '8-Rd Red-Anodized Scalloped Drum + Central 8-Tooth Star Ratchet (LSA221002)',
    primaryFunction: 'Primary Agent CAD Benchmark: Scalloped outer flutes engage coil-sprung indexing pawl while front/rear magnetic rings retain heavy slugs',
    magazineCapacity: 8,
    caliberMm: 7.62,
    projectileMassGrains: 54,
    pelletCount: 1,
    massGrams: 118,
    ergonomicsDelta: 12,
  },
  {
    id: 'valve_leshiy_fluted_star_puck',
    name: 'EDgun Leshiy 2 Fluted Star Valve + Red Polyurethane Transfer Port Puck',
    subsystem: 'Agent Benchmark Breech Seal & Valve',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'firing_valve',
    partRef: 'LSA242200-PUCK',
    capacityOrSpec: 'Star-Serrated Exhaust Plug (LSA242200) + Red PU95A Breech Puck (LSA242105)',
    primaryFunction: 'Seals the folding buttstock manifold face directly against the aligned rotary magazine chamber with 0.38mm axial crush',
    massGrams: 92,
    ergonomicsDelta: 8,
  },
  {
    id: 'jets_leshiy_coil_pawl_indexer',
    name: 'EDgun Leshiy 2 Exposed Coil-Spring Pneumatic Indexing Pawl & Dual Power Jets',
    subsystem: 'Agent Benchmark Indexing Drivetrain',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'power_jets',
    partRef: 'LSA221103-COIL',
    capacityOrSpec: 'Coil Return Spring (LSA221105) + Pawl Lever (LSA221103) + 0.7mm Dual Jets',
    primaryFunction: 'Diverts residual valve exhaust pulse into lower plunger to drive the exposed coil-sprung pawl against the scalloped rotary drum',
    powerJetMm: 0.7,
    massGrams: 34,
    ergonomicsDelta: 6,
  },
  {
    id: 'buttstock_leshiy_valkyrie_g10',
    name: 'EDgun Leshiy 2 Silver CNC Twin-Lug Hinge Frame & Valkyrie Red/Black G10 Grip',
    subsystem: 'Agent Benchmark Folding Frame & Reservoir',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'buttstock_tank',
    partRef: 'LSA241100-VALK',
    capacityOrSpec: '190 cc Dual-Tube Stock + Silver Hinge (LSA241100) + Valkyrie G10 Medallion Grip',
    primaryFunction: 'Swings open 180° on twin hardened shear lugs via top push-button latch to expose the red transfer port puck and rotary drum',
    buttstockVolumeCc: 190,
    massGrams: 465,
    ergonomicsDelta: 15,
  },
  {
    id: 'mag_rexp_breech_slide_11',
    name: 'Evanix REX-P #11 Cylindrical Axial Breech Slide & #03 7.62mm LW Barrel Throat',
    subsystem: 'REX-P 7.62mm Korean Blueprint Breech',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'rotary_magazine',
    partRef: 'REXP-#11/#03',
    capacityOrSpec: '26.0mm Axial Stroke Sleeve (Ø23.90mm OD / Ø12.04mm ID) + #58/#59 Detent Ball',
    primaryFunction: 'Slides forward over the 7.62mm rifled barrel to open the 38.0×16.5mm receiver loading trough and seals dual NBR90 O-rings when closed',
    magazineCapacity: 6,
    caliberMm: 7.62,
    projectileMassGrains: 62,
    pelletCount: 1,
    massGrams: 95,
    ergonomicsDelta: 14,
  },
  {
    id: 'valve_rexp_coaxial_poppet_32',
    name: 'Evanix REX-P #32/#34 180° Coaxial In-Line Poppet Valve & #14 5-Hole Underlever',
    subsystem: 'REX-P 7.62mm Coaxial Discharge & Underlever',
    category: 'LESHIY2_STOCK_AND_ROTARY',
    slot: 'firing_valve',
    partRef: 'REXP-#32/#34/#14',
    capacityOrSpec: 'Ø9.80mm PEEK Poppet Cone (#32) + M28×1.5 Housing (#34) + 5-Hole Underlever (#14)',
    primaryFunction: 'Dumps 250-bar air from Rear Tank (#37) in a 180° straight coaxial line behind the slug with zero 90° transfer-port turn loss (Cv = 0.94)',
    massGrams: 142,
    ergonomicsDelta: 11,
  },
];

export const PRESET_LOADOUTS: WeaponBuildLoadout[] = [
  {
    id: 'preset_triple_hybrid_rifle',
    name: '#01 Benchmark: EDgun Leshiy 2 Valkyrie Open-Breech × FX DRS OTB',
    weaponClass: 'AIR_RIFLE',
    description:
      'Primary Agent CAD Remake Benchmark: Combines the EDgun Leshiy 2 Valkyrie Red Scalloped Rotary Drum (LSA221000-VALK), 8-Tooth Star Ratchet, Red Transfer Port Breech Puck (LSA242105), Exposed Coil-Sprung Indexing Pawl (LSA221103), and Silver CNC Hinge Frame with the FX DRS 307cc OTB Shroud & Seneca Aspen 3-Stage Pump.',
    otbShroudId: 'otb_fx_drs_307',
    modularPlenumId: 'plenum_shp_63',
    regulatorId: 'reg_mkii_amp',
    handguardId: 'handguard_mlok',
    buttstockTankId: 'buttstock_leshiy_valkyrie_g10',
    buttstockExtensionId: 'ext_leshiy_carbon_350',
    firingValveId: 'valve_leshiy_fluted_star_puck',
    powerJetsId: 'jets_leshiy_coil_pawl_indexer',
    rotaryMagId: 'mag_leshiy_valkyrie_scalloped_red',
    pumpCylinderId: 'pump_aspen_3stage',
    fourBarLinkageId: 'linkage_four_bar',
    foregripBottleId: 'foregrip_carbon_180',
    camCollarId: 'cam_interrupted_lug',
    stage3PistonsId: 'pistons_opposed_dual',
    shuttleManifoldId: 'shuttle_dual_manifold',
    priorityCheckBlockId: 'priority_check_block_3tank',
    regulatorSetpointBar: 150,
    oneWayFillTarget: 'PLENUM_AND_OTB',
    finishColorHex: '#18181b',
    accentColorHex: '#dc2626',
    custom3dPart: {
      enabled: true,
      partName: 'Leshiy-2 Valkyrie Open-Breech CAD Remake',
      polymerMaterial: 'CNC_7075_HYBRID',
      geometryType: 'BULLPUP_MANIFOLD_CHASSIS',
      wallThicknessMm: 4.5,
      gyroidInfillPct: 85,
      transferPortBoreMm: 7.2,
      baffleChambers: 3,
    },
  },
  {
    id: 'preset_evanix_rexp_762_master',
    name: '#02 Master CAD: Evanix REX-P 7.62mm (57-Part Korean Blueprint)',
    weaponClass: 'AIR_PISTOL',
    description:
      'Complete 57-Part Sub-Millimeter Evanix REX-P 7.62mm (REX-P 분해도) Base Model: Rear Coaxial 250-Bar Air Tank (#37) with Cross-Hatched Cheek Sleeve & 300B Gauge (#40), 180° In-Line Poppet (#32/#34), Monolithic Receiver (#08) with Cantilever Picatinny Rail (#29), Cylindrical Breech Slide (#11), 5-Hole Skeletonized Underlever (#14), and 5-Slot Handguard (#06).',
    otbShroudId: 'otb_fx_drs_208',
    modularPlenumId: 'plenum_hp_35',
    regulatorId: 'reg_ascent_part116_balancer',
    handguardId: 'handguard_evanix_rex_slotted',
    buttstockTankId: 'buttstock_evanix_rex_crosshatch',
    buttstockExtensionId: 'ext_none',
    firingValveId: 'valve_rexp_coaxial_poppet_32',
    powerJetsId: 'jets_08mm',
    rotaryMagId: 'mag_rexp_breech_slide_11',
    pumpCylinderId: 'pump_compact_carbon',
    fourBarLinkageId: 'linkage_four_bar',
    foregripBottleId: 'foregrip_velox_dual_tank_3340',
    camCollarId: 'cam_interrupted_lug',
    stage3PistonsId: 'pistons_opposed_dual',
    shuttleManifoldId: 'shuttle_dual_manifold',
    priorityCheckBlockId: 'priority_check_block_3tank',
    regulatorSetpointBar: 185,
    oneWayFillTarget: 'BUTTSTOCK_TANK',
    finishColorHex: '#18181b',
    accentColorHex: '#f59e0b',
    custom3dPart: {
      enabled: true,
      partName: 'REX-P 7.62mm 57-Part Sub-mm Coaxial Assembly',
      polymerMaterial: 'CNC_7075_HYBRID',
      geometryType: 'INTEGRATED_BAFFLE_MODERATOR',
      wallThicknessMm: 4.5,
      gyroidInfillPct: 85,
      transferPortBoreMm: 7.8,
      baffleChambers: 4,
    },
  },
  {
    id: 'preset_pneumatic_sten_mk2',
    name: 'Pneumatic Sten Mk.II (Off-the-Shelf + 3D-Printed Receiver)',
    weaponClass: 'DIY_STEN_AIRGUN',
    description:
      'Functional side-fed pneumatic Sten carbine built from a 4130 hydraulic OTB shroud, welded T-stock reservoir, off-the-shelf HPA regulator, 24-round horizontal rotary drum, and a custom generated PA12-CF 3D-printed receiver block.',
    otbShroudId: 'otb_sten_coaxial_165',
    modularPlenumId: 'plenum_hp_35',
    regulatorId: 'reg_sten_highflow',
    handguardId: 'handguard_sten_printed',
    buttstockTankId: 'buttstock_sten_tstock',
    buttstockExtensionId: 'ext_none',
    firingValveId: 'valve_forward_plug',
    powerJetsId: 'jets_13mm',
    rotaryMagId: 'mag_sten_side_24rd',
    pumpCylinderId: 'pump_compact_carbon',
    fourBarLinkageId: 'linkage_four_bar',
    foregripBottleId: 'foregrip_carbon_180',
    camCollarId: 'cam_interrupted_lug',
    stage3PistonsId: 'pistons_opposed_dual',
    shuttleManifoldId: 'shuttle_dual_manifold',
    priorityCheckBlockId: 'priority_check_block_3tank',
    regulatorSetpointBar: 120,
    oneWayFillTarget: 'PLENUM_AND_OTB',
    finishColorHex: '#1e293b',
    accentColorHex: '#10b981',
    custom3dPart: {
      enabled: true,
      partName: 'Sten-PCP Mk.II Side-Breech Monolith',
      polymerMaterial: 'PA12_CF_CARBON_NYLON',
      geometryType: 'STEN_SIDE_FEED_RECEIVER',
      wallThicknessMm: 5.2,
      gyroidInfillPct: 90,
      transferPortBoreMm: 5.2,
      baffleChambers: 4,
    },
  },
  {
    id: 'preset_air_shotgun_breacher',
    name: 'Seneca-DRS .50 Cal Pneumatic Breacher Shotgun',
    weaponClass: 'AIR_SHOTGUN',
    description:
      'High-displacement 92cc twin-chamber blast plenum paired with a 6-shell .50 cal 8-pellet pneumatic buckshot rotary cylinder and heavy 260cc Kevlar foregrip pump tank.',
    otbShroudId: 'otb_fx_drs_208',
    modularPlenumId: 'plenum_shotgun_92',
    regulatorId: 'reg_mkii_amp',
    handguardId: 'handguard_mlok',
    buttstockTankId: 'buttstock_leshiy_dual',
    buttstockExtensionId: 'ext_leshiy_carbon_350',
    firingValveId: 'valve_forward_plug',
    powerJetsId: 'jets_13mm',
    rotaryMagId: 'mag_shotgun_6rd_buck',
    pumpCylinderId: 'pump_aspen_3stage',
    fourBarLinkageId: 'linkage_four_bar',
    foregripBottleId: 'foregrip_kevlar_260',
    camCollarId: 'cam_interrupted_lug',
    stage3PistonsId: 'pistons_opposed_dual',
    shuttleManifoldId: 'shuttle_dual_manifold',
    priorityCheckBlockId: 'priority_check_block_3tank',
    regulatorSetpointBar: 160,
    oneWayFillTarget: 'PLENUM_AND_OTB',
    finishColorHex: '#3f2e21',
    accentColorHex: '#ef4444',
    custom3dPart: {
      enabled: true,
      partName: 'Venturi Multi-Pellet Choke Diffuser',
      polymerMaterial: 'PEEK_GF30_AEROSPACE',
      geometryType: 'VENTURI_SHOTGUN_CHOKE',
      wallThicknessMm: 6.0,
      gyroidInfillPct: 100,
      transferPortBoreMm: 7.2,
      baffleChambers: 2,
    },
  },
  {
    id: 'preset_air_pistol_viper',
    name: 'Leshiy-DRS Micro-Bore Tactical Air Pistol',
    weaponClass: 'AIR_PISTOL',
    description:
      'Ultra-compact stockless CQB air pistol combining an 85cc coaxial OTB shroud, 35cc HP plenum, 12-round .177 titanium rotary ring, and a 3-position One-Way Rotary Fill foregrip pump.',
    otbShroudId: 'otb_pistol_micro_85',
    modularPlenumId: 'plenum_hp_35',
    regulatorId: 'reg_ear_inline',
    handguardId: 'handguard_mlok',
    buttstockTankId: 'buttstock_pistol_cap',
    buttstockExtensionId: 'ext_none',
    firingValveId: 'valve_forward_plug',
    powerJetsId: 'jets_02mm',
    rotaryMagId: 'mag_pistol_12rd',
    pumpCylinderId: 'pump_compact_carbon',
    fourBarLinkageId: 'linkage_four_bar',
    foregripBottleId: 'foregrip_carbon_180',
    camCollarId: 'cam_interrupted_lug',
    stage3PistonsId: 'pistons_single_rotary',
    shuttleManifoldId: 'shuttle_dual_manifold',
    priorityCheckBlockId: 'priority_check_block_3tank',
    regulatorSetpointBar: 115,
    oneWayFillTarget: 'PLENUM_AND_OTB',
    finishColorHex: '#18181b',
    accentColorHex: '#06b6d4',
    custom3dPart: {
      enabled: false,
      partName: 'Micro-Baffle Pistol Moderator',
      polymerMaterial: 'PA12_CF_CARBON_NYLON',
      geometryType: 'INTEGRATED_BAFFLE_MODERATOR',
      wallThicknessMm: 3.2,
      gyroidInfillPct: 75,
      transferPortBoreMm: 4.5,
      baffleChambers: 5,
    },
  },
];

export function findPart(id: string): PneumaticComponentSpec {
  return (
    PNEUMATIC_PARTS_CATALOG.find((p) => p.id === id) || PNEUMATIC_PARTS_CATALOG[0]
  );
}

export interface ComputedWeaponStats {
  otbVolumeCc: number;
  buttstockVolumeCc: number;
  foregripVolumeCc: number;
  plenumVolumeCc: number;
  totalStorageVolumeCc: number;
  regulatorSetpointBar: number;
  powerJetMm: number;
  magazineCapacity: number;
  caliberMm: number;
  projectileMassGrains: number;
  pelletCount: number;
  barrelLengthMm: number;
  pumpSweptCc: number;
  pumpMode: PumpMode;
  totalMassKg: number;
  ergonomicsScore: number;
  acousticRatingDb: number;
  estimatedMuzzleVelocityMs: number;
  estimatedEnergyJoules: number;
  estimatedEnergyFpe: number;
  estimatedFullShotsBeforePump: number;
}

export function computeWeaponStats(loadout: WeaponBuildLoadout): ComputedWeaponStats {
  const otb = findPart(loadout.otbShroudId);
  const plenum = findPart(loadout.modularPlenumId);
  const reg = findPart(loadout.regulatorId);
  const hg = findPart(loadout.handguardId);
  const stock = findPart(loadout.buttstockTankId);
  const ext = findPart(loadout.buttstockExtensionId);
  const jets = findPart(loadout.powerJetsId);
  const mag = findPart(loadout.rotaryMagId);
  const pump = findPart(loadout.pumpCylinderId);
  const fg = findPart(loadout.foregripBottleId);
  const pistons = findPart(loadout.stage3PistonsId);

  const otbVolumeCc = otb.otbVolumeCc ?? 208;
  const buttstockVolumeCc = (stock.buttstockVolumeCc ?? 170) + (ext.buttstockVolumeCc ?? 0);
  const foregripVolumeCc = fg.foregripVolumeCc ?? 180;

  // Custom 3D-printed part bonus volume & flow efficiency
  const cadBonusPlenumCc =
    loadout.custom3dPart.enabled &&
    loadout.custom3dPart.geometryType === 'BULLPUP_MANIFOLD_CHASSIS'
      ? 12
      : 0;
  const plenumVolumeCc = (plenum.plenumVolumeCc ?? 35) + cadBonusPlenumCc;
  const totalStorageVolumeCc = otbVolumeCc + buttstockVolumeCc + foregripVolumeCc + plenumVolumeCc;

  const regulatorSetpointBar = loadout.regulatorSetpointBar || reg.regulatorBar || 140;
  const powerJetMm = jets.powerJetMm ?? 0.7;
  const magazineCapacity = mag.magazineCapacity ?? 8;
  const caliberMm = mag.caliberMm ?? 6.35;
  const projectileMassGrains = mag.projectileMassGrains ?? 38;
  const pelletCount = mag.pelletCount ?? 1;
  const barrelLengthMm = otb.barrelLengthMm ?? 500;
  const pumpSweptCc = pump.pumpSweptCc ?? 4200;
  const pumpMode = pistons.pumpMode ?? 'BI_DIRECTIONAL_OPPOSED';

  const cadMassGrams = loadout.custom3dPart.enabled
    ? Math.round(
        80 +
          loadout.custom3dPart.wallThicknessMm * 18 +
          loadout.custom3dPart.gyroidInfillPct * 0.9
      )
    : 0;

  const rawMassGrams =
    otb.massGrams +
    plenum.massGrams +
    reg.massGrams +
    hg.massGrams +
    stock.massGrams +
    ext.massGrams +
    jets.massGrams +
    mag.massGrams +
    pump.massGrams +
    fg.massGrams +
    pistons.massGrams +
    cadMassGrams +
    420; // core frame & valves

  const totalMassKg = Math.round((rawMassGrams / 1000) * 100) / 100;

  const ergonomicsScore = Math.max(
    15,
    Math.min(
      100,
      55 +
        otb.ergonomicsDelta +
        plenum.ergonomicsDelta +
        hg.ergonomicsDelta +
        stock.ergonomicsDelta +
        ext.ergonomicsDelta +
        mag.ergonomicsDelta +
        pump.ergonomicsDelta +
        fg.ergonomicsDelta
    )
  );

  const baffleReductionDb = loadout.custom3dPart.enabled
    ? loadout.custom3dPart.baffleChambers * 2.8
    : 0;
  const acousticRatingDb = Math.max(
    68,
    Math.round(96 + (regulatorSetpointBar - 110) * 0.18 - baffleReductionDb)
  );

  // Estimate initial velocity & energy
  const portBoost = loadout.custom3dPart.enabled
    ? 1 + (loadout.custom3dPart.transferPortBoreMm - 4.5) * 0.035
    : 1.0;
  const pPa = regulatorSetpointBar * 100_000;
  const vPlenumM3 = plenumVolumeCc * 1e-6;
  const boreRadiusM = (caliberMm * 0.5) * 1e-3;
  const vBarrelM3 = Math.PI * boreRadiusM * boreRadiusM * (barrelLengthMm * 1e-3);
  const expRatio = (vPlenumM3 + vBarrelM3) / vPlenumM3;
  const jetBleed = 0.08 + (powerJetMm - 0.2) * 0.11;
  const workJoules =
    pPa * vPlenumM3 * (1 - Math.pow(expRatio, -0.28)) * 1.85 * (1 - jetBleed * 0.35) * portBoost;
  const massKg = projectileMassGrains * 0.00006479891;
  const estimatedMuzzleVelocityMs = Math.min(
    340,
    Math.round(Math.sqrt(Math.max(0, (2 * workJoules) / massKg)))
  );
  const estimatedEnergyJoules =
    Math.round(0.5 * massKg * estimatedMuzzleVelocityMs * estimatedMuzzleVelocityMs * 10) / 10;
  const estimatedEnergyFpe = Math.round(estimatedEnergyJoules * 0.737562 * 10) / 10;

  // Usable bar-cc above regulator setpoint across all 3 high-pressure reservoirs at 250 bar
  const usableBarCc =
    (250 - regulatorSetpointBar) * (otbVolumeCc + buttstockVolumeCc + foregripVolumeCc);
  const perShotBarCc = regulatorSetpointBar * plenumVolumeCc * (0.36 + jetBleed * 0.45);
  const estimatedFullShotsBeforePump = Math.max(
    4,
    Math.round(usableBarCc / Math.max(500, perShotBarCc))
  );

  return {
    otbVolumeCc,
    buttstockVolumeCc,
    foregripVolumeCc,
    plenumVolumeCc,
    totalStorageVolumeCc,
    regulatorSetpointBar,
    powerJetMm,
    magazineCapacity,
    caliberMm,
    projectileMassGrains,
    pelletCount,
    barrelLengthMm,
    pumpSweptCc,
    pumpMode,
    totalMassKg,
    ergonomicsScore,
    acousticRatingDb,
    estimatedMuzzleVelocityMs,
    estimatedEnergyJoules,
    estimatedEnergyFpe,
    estimatedFullShotsBeforePump,
  };
}

export function createInitialPneumaticState(loadout: WeaponBuildLoadout): FourZonePneumaticState {
  const stats = computeWeaponStats(loadout);
  return {
    otbVolumeCc: stats.otbVolumeCc,
    otbPressureBar: 240,
    buttstockVolumeCc: stats.buttstockVolumeCc,
    buttstockPressureBar: 240,
    foregripVolumeCc: stats.foregripVolumeCc,
    foregripPressureBar: 240,
    plenumVolumeCc: stats.plenumVolumeCc,
    plenumPressureBar: stats.regulatorSetpointBar,
    regulatorSetpointBar: stats.regulatorSetpointBar,
    powerJetMm: stats.powerJetMm,
    maxReliefBar: 250,
    foregripCamPosition: 'SIDE_LOCKED_3_OCLOCK',
    pumpMode: stats.pumpMode,
    oneWayFillTarget: loadout.oneWayFillTarget,
    pumpSweptVolumeCc: stats.pumpSweptCc,
    pumpStrokePhase: 'READY_PULL',
    shotsSinceLubrication: 0,
    overpressureVented: false,
    magazineCapacity: stats.magazineCapacity,
    magazineLoaded: stats.magazineCapacity,
    rotaryIndexAngleDeg: 0,
    lastCycleTimeMs: Math.round(145 - (stats.powerJetMm - 0.2) * 65),
    lastShotVelocityMs: stats.estimatedMuzzleVelocityMs,
    lastShotEnergyJoules: stats.estimatedEnergyJoules,
  };
}
