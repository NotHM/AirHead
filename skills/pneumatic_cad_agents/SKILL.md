---
name: pneumatic-cad-physics-agents
description: Specialized domain skills and autonomous engineering agents for high-pressure pneumatic ballistics (100-350 bar), Rust/WASM parametric CAD re-boring, 3D-printable watertight manifold STL generation, HuggingFace physics model surrogates, and tactical FPS game design.
---

# Pneumatic Ballistics, Generative CAD, 3D Printing & Physics Surrogate Agents Skill

## Overview
This skill defines the 5 specialized engineering agents that power **BAR-250**'s autonomous part modification, high-pressure gas thermodynamics, additive manufacturing validation, and tactical survival balance.

---

## 1. `PneumaticPressureAgent` (Air Pressure & Internal Ballistics Skill)
* **Domain**: 4-Zone High-Pressure Air (HPA) thermodynamics (`100–350 bar` / `1,450–5,075 PSI`), adiabatic polytropic expansion ($\gamma = 1.4$), regulator vs. counter-pressure balancer vs. sacrificial burst-disk discharge.
* **Core Capabilities**:
  - Models **Zone 1 (Coaxial OTB Shroud)**, **Zone 2 (Buttstock Dual-Tube / Cross-Hatched Cylinder)**, **Zone 3 (Cam-Lock Foregrip / Vertical Grip Gauge Tank / Velox Grip Cell)**, and **Zone 4 (Modular HP/SHP Plenum / Red Anodized Burst-Disk Cartridges)**.
  - Implements the **Air Venturi Ascent Part 116 Floating Air-Spring Balancer (`2,000 PSI / 150 bar` factory counter-pressure)** which dynamically increases effective firing-valve volume as reservoir pressure drops.
  - Compares **Regulated Hammerless Plug Valves (`1.6 ms`)** against **Sacrificial Foil Burst Disks (`1,800 PSI Copper`, `3,200 PSI Scored Nickel`, `4,500 PSI Brass Shim`, `0.09–0.14 ms` opening time)**.

## 2. `ParametricCadReboreAgent` (Rust/WASM B-Rep & Caliber Re-Engineering Skill)
* **Domain**: Autonomous geometric re-design of incompatible airgun barrels, OTB concentric air shrouds, rotary magazines, and K-baffle moderators.
* **Core Capabilities**:
  - When a barrel with an Over-the-Barrel (OTB) air container does not come in `.30 cal (7.62mm)`, `.357 cal (9.0mm)`, `.45 cal (11.43mm)`, or `.50 cal (12.7mm)`, automatically expands the inner barrel liner bore and outer diameter ($r_{\text{liner,out}}$).
  - Expands the concentric OTB shroud inner radius ($r_{\text{shroud,in}} = \sqrt{r_{\text{liner,out}}^2 + V_{\text{annular}} / (\pi L)}$) so **100% of the annular high-pressure gas volume (`cc`) is preserved**.
  - Solves **Lamé's Thick-Walled Cylinder Hoop-Stress Equation** ($\sigma_\theta = P(r_o^2 + r_i^2)/(r_o^2 - r_i^2)$) to size the outer wall thickness for a minimum `1.8x–2.5x` safety factor.

## 3. `AdditiveManufacturingStlAgent` (3D Printing, Slicer & Manifold Mesh Skill)
* **Domain**: Watertight (2-manifold) `.STL` solid generation, anisotropic polymer mechanics (`PA12-CF15 Carbon Nylon`, `PEEK-GF30 Aerospace`, `7075-T6 CNC Hybrid`), and O-ring gland tolerances.
* **Core Capabilities**:
  - Synthesizes closed triangulated solids (outer cylindrical wall + inner bore wall + front/rear annular flange caps) with zero non-manifold edges across all **6 printable weapon subsystems**.
  - Applies `+0.12 mm` XY bore clearance compensation and `Dual NBR90` / `PTFE` O-ring gland steps.
  - Computes structural infill derating ($f_{\text{gyroid}} = 0.45 + 0.55 \cdot \text{Infill}\%$) for pressure-bearing printed manifolds.

## 4. `HuggingFacePhysicsSurrogateAgent` (Physics Model Runner & Cache Skill)
* **Domain**: Local & remote neural operator surrogate execution (`DeepMind/MeshGraphNet-Pneumatic-CFD-v2`, `OpenFOAM-Supersonic-Port-Flow-1D`, `FEBio-Anisotropic-PA12-CF-Hoop-Stress`, `Shap-E-CAD`) and deterministic hash caching.
* **Core Capabilities**:
  - Evaluates flow coefficient ($C_v$) and throat pressure drop ($\Delta P$) across any pair of the 7 industrial connector standards (`M18x1.5 DIN`, `G1/2-14`, `5/8-18 UNF`, `8mm Foster`, `Coaxial PTFE Swivel`, `1/8 BSPP`, `TR21-4 / 3/8-24 Burst Union`).
  - Caches every simulated build in `localStorage` + memory (`0.4 ms` cache retrieval latency).

## 5. `TacticalGameDesignAgent` (FPS Combat, Acoustic Signature & Scavenging Balance Skill)
* **Domain**: Doom-paced 3D FPS kinematics combined with Escape from Tarkov gunsmith depth and zombie survival resource economy.
* **Core Capabilities**:
  - Balances muzzle energy ($J$), recoil impulse, ergonomics/ADS handling, and acoustic signature (`58 dB` whisper-quiet Welrod 12-baffle wipe moderator vs. `112 dB` `.50 cal` burst-disk trench cannon).
  - Tunes filament scavenging costs (`PA12-CF grams`, `PEEK grams`, `Copper Burst-Disk Foils`, `NBR90 O-Rings`) across procedural zombie waves.
