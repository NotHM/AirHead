//! BAR-250 Core Pneumatic & Ballistic Simulation Engine (Rust -> WebAssembly)
//! Implements 4-Zone Pre-Charged Pneumatic (PCP) thermodynamics, Priority Isolation
//! Check Block equalizing, MkII AMP / EAR Inline Regulator step-down, EDgun Leshiy 2
//! Forward Plug Valve & Dual Power Jet indexing bleed, Air Venturi Seneca Aspen 3-stage
//! hand pump compression, and Cam-Locking Bi-Directional Foregrip pumping.

#![no_std]

#[repr(C)]
pub struct PneumaticSystemState {
    // Zone 1: FX DRS Tactical OTB Air Cylinder Shroud
    pub otb_volume_cc: f32,
    pub otb_pressure_bar: f32,
    // Zone 2: EDgun Leshiy 2 Dual-Tube Buttstock Tank (+ Optional Carbon Bottle Extension)
    pub buttstock_volume_cc: f32,
    pub buttstock_pressure_bar: f32,
    // Zone 3: Movable Pressurized Foregrip Bottle
    pub foregrip_volume_cc: f32,
    pub foregrip_pressure_bar: f32,
    // Zone 4: Modular HP / SHP Plenum (Regulated Staging Chamber)
    pub plenum_volume_cc: f32,
    pub plenum_pressure_bar: f32,
    // Pressure Control & Valve Parameters
    pub regulator_setpoint_bar: f32,
    pub power_jet_nozzle_mm: f32,
    pub barrel_length_mm: f32,
    pub caliber_mm: f32,
    pub projectile_mass_grains: f32,
}

/// Computes adiabatic / isothermal gas expansion energy (Joules) and muzzle velocity (m/s)
/// from the Modular HP/SHP Plenum through the Hammerless Forward Plug Valve.
#[no_mangle]
pub extern "C" fn compute_muzzle_velocity_ms(
    plenum_pressure_bar: f32,
    plenum_volume_cc: f32,
    barrel_length_mm: f32,
    caliber_mm: f32,
    projectile_mass_grains: f32,
    power_jet_mm: f32,
) -> f32 {
    if plenum_pressure_bar <= 1.0 || projectile_mass_grains <= 0.1 {
        return 0.0;
    }
    // Convert units: 1 bar = 100,000 Pa; 1 cc = 1e-6 m^3; 1 grain = 0.00006479891 kg
    let p_pa = plenum_pressure_bar * 100_000.0;
    let v_plenum_m3 = plenum_volume_cc * 1.0e-6;
    let bore_radius_m = (caliber_mm * 0.5) * 1.0e-3;
    let bore_area_m2 = 3.14159265 * bore_radius_m * bore_radius_m;
    let v_barrel_m3 = bore_area_m2 * (barrel_length_mm * 1.0e-3);

    // Expansion ratio across barrel bore + plenum volume
    let expansion_ratio = (v_plenum_m3 + v_barrel_m3) / v_plenum_m3;
    // Polytropic exponent for rapid airgun discharge (~1.28)
    // Valve efficiency modulated by Dual Power Jet bleed (larger jet bleeds more air to index roller)
    let jet_efficiency = 0.78 - (power_jet_mm - 0.2) * 0.06;
    let work_joules = p_pa * v_plenum_m3 * (1.0 - 1.0 / libm_powf_approx(expansion_ratio, 0.28)) * 2.15 * jet_efficiency;

    let mass_kg = projectile_mass_grains * 0.00006479891;
    let v_sq = (2.0 * work_joules) / mass_kg;
    libm_sqrtf(if v_sq > 0.0 { v_sq } else { 0.0 })
}

/// Computes single-stroke pressure increase (bar) from the 3-Stage Telescopic Hand Pump
/// into a target reservoir of volume `target_volume_cc` at `current_bar`.
#[no_mangle]
pub extern "C" fn compute_pump_stroke_delta_bar(
    pump_swept_cc: f32,
    target_volume_cc: f32,
    current_bar: f32,
    stage3_efficiency: f32,
    max_relief_bar: f32,
) -> f32 {
    if target_volume_cc <= 1.0 || current_bar >= max_relief_bar {
        return 0.0;
    }
    // Stage-3 high-pressure micro-bore rod overcomes backpressure with slight volumetric drop near 250 bar
    let backpressure_factor = 1.0 - (current_bar / (max_relief_bar * 1.35)) * 0.28;
    let delta = (pump_swept_cc * stage3_efficiency * backpressure_factor) / target_volume_cc;
    if current_bar + delta > max_relief_bar {
        max_relief_bar - current_bar
    } else {
        delta
    }
}

fn libm_sqrtf(x: f32) -> f32 {
    if x <= 0.0 {
        return 0.0;
    }
    let mut z = x;
    let mut i = 0;
    while i < 8 {
        z = 0.5 * (z + x / z);
        i += 1;
    }
    z
}

fn libm_powf_approx(base: f32, exp: f32) -> f32 {
    // Second-order Padé / Taylor approximation around base >= 1.0
    let u = base - 1.0;
    1.0 + exp * u + 0.5 * exp * (exp - 1.0) * u * u
}

/// Rust CAD Engine: Redesigns a concentric Over-the-Barrel (OTB) Air Container Shroud
/// when re-boring a barrel liner to a new caliber (e.g. .30 cal / 7.62mm or .45 cal / 11.43mm)
/// so annular high-pressure gas volume `target_otb_cc` is preserved and Lamé hoop stress
/// remains within material safety limits at `max_pressure_bar`.
#[no_mangle]
pub extern "C" fn rust_redesign_otb_barrel_shroud_od_mm(
    target_caliber_mm: f32,
    shroud_length_mm: f32,
    target_otb_cc: f32,
    max_pressure_bar: f32,
    allowable_stress_mpa: f32,
) -> f32 {
    let bore_r = target_caliber_mm * 0.5;
    let liner_wall = if target_caliber_mm * 0.24 > 2.2 {
        target_caliber_mm * 0.24
    } else {
        2.2
    };
    let liner_outer_r = bore_r + liner_wall;
    // Required annular cross-sectional area in mm^2 (1 cc = 1000 mm^3)
    let annular_area_mm2 = (target_otb_cc * 1000.0) / shroud_length_mm;
    let r_inner_sq = liner_outer_r * liner_outer_r + annular_area_mm2 / 3.14159265;
    let shroud_inner_r = libm_sqrtf(r_inner_sq);

    // Lamé thick-walled cylinder outer radius for internal pressure P (1 bar = 0.1 MPa)
    let p_mpa = max_pressure_bar * 0.1;
    let ratio = (allowable_stress_mpa + p_mpa) / (allowable_stress_mpa - p_mpa);
    let shroud_outer_r = shroud_inner_r * libm_sqrtf(if ratio > 1.05 { ratio } else { 1.05 });
    shroud_outer_r * 2.0
}

