# BAR-250: Tactical Pneumatic FPS, Generative CAD & 3D-Printable Gunsmith Roadmap

## 1. Executive Architecture Vision
**BAR-250** combines an *Escape from Tarkov*-depth radial weapon build node tree (`WEAPON BUILDS`) with a deterministic **Rust/WebAssembly Pneumatic & Structural CAD Kernel (`pneumatic_core.rs`)** and **Cached HuggingFace Physics Surrogates (`MeshGraphNet-Pneumatic-CFD-v2`, `FEBio-Polymer-Stress`, `Shap-E-CAD`)**.

Instead of treating weapon parts as static meshes, **every part in BAR-250 is a parametric, physics-validated, watertight 3D-printable CAD solid**:
1. **Swap Compatible Parts Directly**: When two platforms share a connector standard (e.g., `M18x1.5 DIN 300-Bar`), parts thread together with zero flow penalty.
2. **Autonomous Physics/Rust Part Re-Design for Incompatible Parts**:
   - **Caliber Re-Boring of Coaxial OTB Barrel Air Containers**: If a barrel with an Over-the-Barrel (OTB) concentric air shroud (such as the *FX DRS Tactical* `.22`/`.25` or *Pneumatic Welrod Mk.IIA*) does not natively come in `.30 cal (7.62mm)`, `.357 cal (9.0mm)`, `.45 cal (11.43mm)`, or `.50 cal (12.7mm)`, the Rust engine automatically re-engineers the barrel liner bore, expands the concentric OTB shroud inner/outer diameter to preserve 100% of the annular high-pressure gas volume (`cc`), solves Lamé's thick-walled cylinder hoop-stress equation at `230–310 bar`, updates the 3D viewport mesh in real time, and outputs a watertight `.STL`.
   - **Inter-Platform Thread & Burst-Disk Bridge Manifolds**: When splicing any two of the 25 airgun platforms with mismatched threads (`M18x1.5` to `G1/2-14`, `5/8-18 UNF`, `8mm Foster`, or `3/8-24 UNF Burst-Disk Union`), the CAD engine synthesizes a stepped high-pressure bridge manifold rated to a minimum `1.8x–2.5x` burst safety factor.

---

## 2. Four-Phase Technical & Generative CAD Roadmap

### PHASE 1 — Rust/WASM Parametric B-Rep & Lamé Hoop-Stress Kernel (`COMPLETED IN ENGINE`)
* **Objective**: Real-time deterministic internal ballistics, 4-zone pneumatic equalization, and structural wall-thickness synthesis.
* **Key Equations Implemented (`src/wasm/pneumatic_core.rs` & `src/wasm/pneumaticWasm.ts`)**:
  1. **Annular Volume Preservation Under Caliber Re-Boring**:
     $$r_{\text{shroud,inner}} = \sqrt{r_{\text{liner,outer}}^2 + \frac{V_{\text{annular}}}{\pi \cdot L_{\text{barrel}}}}$$
     When boring a `6.35mm (.25 cal)` barrel out to `7.62mm (.30 cal)` or `11.43mm (.45 cal)`, $r_{\text{liner,outer}}$ grows to maintain rifled steel/carbon-sleeve wall integrity, and $r_{\text{shroud,inner}}$ automatically expands so zero cubic centimeters of 250-bar air storage are lost.
  2. **Lamé Thick-Walled Cylinder Hoop-Stress Solver**:
     $$\sigma_\theta = P \cdot \frac{r_o^2 + r_i^2}{r_o^2 - r_i^2}, \quad r_o = r_i \cdot \sqrt{\frac{\sigma_{\text{allow}} + P}{\sigma_{\text{allow}} - P}}$$
     Where $\sigma_{\text{allow}} = \sigma_{\text{yield}} / \text{SF}_{\text{target}}$ for `PA12-CF15 Carbon Nylon (112 MPa)`, `PEEK-GF30 Aerospace Polymer (185 MPa)`, or `7075-T6 CNC Hybrid (503 MPa)`.
  3. **Adiabatic Polytropic Gas Expansion ($\gamma = 1.4$)**:
     Computes muzzle velocity ($m/s$), kinetic energy ($J$), and priority isolation check-block recharge across Zone 1 (OTB Shroud), Zone 2 (Leshiy 2 Buttstock), Zone 3 (Cam-Lock Foregrip Bottle), and Zone 4 (Modular HP/SHP Plenum).

### PHASE 2 — Multi-Subsystem Watertight Manifold `.STL` CAD Synthesis (`COMPLETED IN ENGINE`)
* **Objective**: Every weapon subsystem is individually synthesized as a watertight, closed, manifold `.STL` mesh ready for slicing.
* **6 Printable Subsystems (`src/game/popular25Catalog.ts`)**:
  1. `OTB_COAXIAL_BARREL_SHROUD_ASSEMBLY`: Re-bored inner barrel liner + expanded concentric OTB air cylinder shroud + rear breech transfer manifold with dual NBR90 O-ring glands.
  2. `CONNECTOR_PORT_BRIDGE_MANIFOLD`: Stepped high-pressure thread adapter bridging any 2 of the 7 connector standards (`M18x1.5 DIN`, `G1/2-14`, `5/8-18 UNF`, `8mm Foster`, `M12x1.25 Coaxial`, `1/8 BSPP`, `3/8-24 Burst-Disk Union`).
  3. `MODULAR_HP_SHP_PLENUM`: Detachable `35cc` / `63cc` / `95cc` lower regulated plenum with angled manometer port.
  4. `ROTARY_8_ROUND_CARTRIDGE_MAGAZINE`: Self-indexing rotary cylinder automatically re-spaced and re-bored to match `.22`, `.25`, `.30`, `.357`, `.45`, or `.50` cal slugs.
  5. `CAM_LOCK_PRESSURIZED_FOREGRIP_COLLAR`: Interrupted-lug 90° bayonet cam collar (`3 o'clock` locked reservoir bus vs. `6 o'clock` unlocked 3-stage hand pump stroke).
  6. `INTEGRAL_K_BAFFLE_MODERATOR`: Multi-cone acoustic moderator (*Pneumatic Welrod Mk.IIA* / *DIY Sten Mk.II*) automatically bored to `caliber + 1.2mm` clip-free clearance.

### PHASE 3 — HuggingFace Physics Surrogate & Local/Remote Simulation Cache (`COMPLETED IN ENGINE`)
* **Objective**: Run general-purpose physics & CAD surrogates (`DeepMind/MeshGraphNet-Pneumatic-CFD-v2`, `FEBio-Polymer-Hoop-Stress`, `Shap-E-CAD`) and cache every simulated build (`bar250_hf_physics_sim_cache_v2`).
* **Deliverables**:
  - Instant `0.4 ms` cache lookup for any Upper × Lower × Caliber × Discharge Mechanism × Polymer combination.
  - Full comparison of **Regulated Valves** (`MkII AMP` / `Leshiy 2 EAR`) vs. **Sacrificial Burst Disks** (`1,800 PSI Copper`, `3,200 PSI Scored Nickel`, `4,500 PSI Scavenged Brass Shim`) vs. **Pilot QEV Diaphragm Dump**.
  - **Virtual Physics Range** with live chronograph, 250-bar chamber decay curve, and 10% FBI ballistic gel penetration profiling.

### PHASE 4 — Helical SDF Thread Profiles, `.3MF` Slicer Modifiers & WebGPU FEA (`COMPLETED IN ENGINE`)
* **Objective**: Transition from stepped cylindrical manifold bosses to sub-millimeter helical ISO/UNF screw threads via Signed Distance Field (SDF) Dual Contouring and export `.3MF` files with embedded slicer infill modifiers.
* **Deliverables**:
  - True helical thread tooth generation (`M18x1.5`, `1/2-20 UNF`, `G1/2-14`) with configurable `+0.12mm` XY hole/thread tolerance compensation.
  - `.3MF` package generator embedding 6-wall concentric perimeters around O-ring grooves and 85% gyroid infill in pressure-bearing walls.
  - WebGPU compute shader for live 3D Von Mises stress heatmaps overlaid directly on the Tarkov `WEAPON BUILDS` node tree.

---

## 3. Phases 5–14: 10 Collectible In-Game Weapon Blueprints & Per-Component Unique `.STL` Synthesis (`COMPLETED IN ENGINE`)

* **PHASE 5**: Evanix REX-P (7.62mm / .30 Cal) — 59-Part Coaxial Monolithic Blueprint & In-Game 3D Asset (`ITEM-SCHEM-REXP-762`)
* **PHASE 6**: EDgun Leshiy 2 Valkyrie (9.0mm / .357 Cal) — 48-Part Folding Open-Breech Rotary Blueprint (`ITEM-SCHEM-LESHIY2-VALK`)
* **PHASE 7**: Redesigned Ascent × Vectis (.45 Cal) — 12-Part 300-Bar Onboard-Pump + 140cc Over-the-Barrel 2+ Round Plenum & Silencer (`ITEM-SCHEM-ASCENT-PUMP`)
* **PHASE 8**: Hatsan Velox (.25 Cal) — 68-Part Semi-Auto Blowback & Removable Cylinder Blueprint (`ITEM-SCHEM-VELOX-SEMI`)
* **PHASE 9**: Hatsan Jet II (.25 Cal) — 74-Part Twin-Cylinder Side-Lever Carbine Blueprint (`ITEM-SCHEM-JET2-TWIN`)
* **PHASE 10**: Huben GK1 (.25 Cal) — 82-Part Hammerless 350-Bar Rotary Pistol Blueprint (`ITEM-SCHEM-HUBEN-GK1`)
* **PHASE 11**: AEA HP SS Plus / Twin-Shell Break-Action (.30 / .50 Cal) — 64-Part Semi-Auto & 2-Shell Shotgun Blueprint (`ITEM-SCHEM-AEA-HPSS`)
* **PHASE 12**: FX DRS Tactical (.30 Cal) — 91-Part Over-the-Barrel (OTB) Concentric Plenum Rifle Blueprint (`ITEM-SCHEM-FX-DRS-OTB`)
* **PHASE 13**: Snowpeak PP750L Regulated Side-Lever & Twin-Rod Telescoping Carbine (+ Evanix MP30 Fixed-Handle Spec) (`ITEM-SCHEM-MP30-DUAL`)
* **PHASE 14**: Western Mordax (.30 Cal) — 88-Part Select-Fire Side-Mag Carbine Blueprint (`ITEM-SCHEM-MORDAX-SELECT`)

---

## 4. Phases 15–39: 25 SMART Objectives for Air Physics, Mechanical Linkages & Local Ollama Models (`COMPLETED IN ENGINE`)

### Pillar I: High-Pressure Air Thermodynamics & Fluid Dynamics (SMART-01 to SMART-05)
1. **SMART-01 (PHASE 15)** — **300-Bar Real-Gas Compressibility ($Z$-Factor) & Polytropic Expansion Solver**: Solve Abel-Noble / Virial compressibility ($Z \approx 1.08$ at 300 Bar) across all 4 pressure zones in `< 0.15 ms`.
2. **SMART-02 (PHASE 16)** — **Ascent .45 140cc Over-the-Barrel (OTB) 2+ Round Regulated Plenum Recharge**: Size concentric annular plenum ($\text{OD } 46\text{mm} \times 480\text{mm} = 140\text{cc}$ at 210 Bar) for `2.6` consecutive full-power `.45 Cal` shots (`245 J`) before pressure drop.
3. **SMART-03 (PHASE 17)** — **3-Stage 300-Bar Telescopic Under-Barrel Hand Pump & Part 116 Check Valve**: Model 3-stage interstage compression ratios (`1:4.2`, `1:3.8`, `1:3.1` with $\varnothing 6.2\text{mm}$ 3rd-stage core) and Viton FKM-90 check cone (`+12 Bar/stroke` up to `300 Bar`).
4. **SMART-04 (PHASE 18)** — **QuietEnergy (QE) 6-Gill Vented Moderator & Concentric K-Baffle Stripping**: Achieve `-16.5 dB` acoustic reduction via 5 conical K-baffles and 6 angled gill vents (`12.80mm` clip-free `.45` bore).
5. **SMART-05 (PHASE 19)** — **Leshiy 3 .45 Triple-Concentric Barrel + Silencer + 280-Bar Outer Air Reserve**: Model radial pressure differential across inner `.45` liner, middle 110-Bar silencer chamber, and outer 280-Bar composite reserve (`SF >= 3.25x`).

### Pillar II: Mechanical Linkages, Breech Kinematics & Parker O-Ring Tribology (SMART-06 to SMART-10)
6. **SMART-06 (PHASE 20)** — **P90 .45 Top-Mount 90° Helical-Turret Rotation & 145cc Mag-Reserve-to-Plenum Coupling**: Rotate 22 transverse `.45` slugs/sabots $0^\circ \to 45^\circ \to 90^\circ$ while coupling the 145cc magazine air reserve into the lower regulated plenum.
7. **SMART-07 (PHASE 21)** — **Ascent × Vectis 4-Bar Underlever Cocking Linkage & 6-Round .45 Rotary Indexing**: Compute `4.2 : 1` mechanical advantage across the $38^\circ$ underlever throw and $60.0^\circ$ `.45` drum step.
8. **SMART-08 (PHASE 22)** — **Quattro 2-Stage Adjustable Sear & Cross-Bolt Anti-Bear-Trap Safety Interlock**: Model 1st-stage take-up (`0.85mm`), 2nd-stage sear wall (`6.4 N / 1.45 lbs`), and 17-4PH safety shear block (`SF = 6.8x`).
9. **SMART-09 (PHASE 23)** — **4-Stage Isolated Burst-Disk Shotgun Evolution (`BD-01`..`BD-05`)**: Enforce `0%` cross-family compatibility for the 3,200 PSI 6-petal laser-scored CuNi burst-disk union across the Red Air Pen, AEA 2-Shell Break-Action Shotgun, and Concealed Cane.
10. **SMART-10 (PHASE 24)** — **Parker AS568 / ISO 3601 O-Ring Gland Squeeze & Extrusion Gap Verifier**: Verify `18%–24%` radial/axial squeeze and zero extrusion gap violations at 300 Bar for Viton FKM-90, PU-95A, and NBR-90 seals.

### Pillar III: Specialized Local Ollama Models & Autonomous Agent Tooling (SMART-11 to SMART-15)
11. **SMART-11 (PHASE 25)** — **Local Ollama HTTP Bridge (`127.0.0.1:11434`) & Deterministic Offline CAD Synthesizer**: Connect in-game buttons to local Ollama models with zero-latency deterministic B-Rep fallback.
12. **SMART-12 (PHASE 26)** — **`qwen2.5-coder:32b` Sub-Millimeter Parametric Part & Thread Generator**: Synthesize TypeScript/OpenSCAD B-Rep code and watertight `.STL` solids from any in-game component button.
13. **SMART-13 (PHASE 27)** — **`deepseek-r1:14b` Thermodynamic & Lamé Hoop-Stress Auditor Agent**: Audit wall thicknesses, O-ring squeezes, and 300-Bar safety factors (`SF >= 3.0x`).
14. **SMART-14 (PHASE 28)** — **`llama3.2-vision:11b` Reference Diagram & Video Frame Callout Extractor**: Extract numbered mechanical callouts and O-ring tables from reference diagrams (including the Snowpeak PP750L, Evanix REX-P, and 12-Part Ascent × Vectis).
15. **SMART-15 (PHASE 29)** — **Autonomous Agent Component Task Queue, `.STL` Compiler & Working/Needs-Fix Ledger**: Let players task agents to compile `.STL` files and maintain a live `WORKING` vs. `NEEDS_FIX` reminder ledger.

### Pillar IV: Automated Schematic (`.SVG` + `.TS`) & 3D Asset Code Generation (SMART-16 to SMART-20)
16. **SMART-16 (PHASE 30)** — **`starcoder2:15b` Live Interactive Vector Schematic (`.SVG`) Synthesizer**: Generate multi-layer dark-mode `.SVG` schematics with dimension lines, callout pins, and 300-Bar gas vectors.
17. **SMART-17 (PHASE 31)** — **Self-Hosting TypeScript Schematic Module Code Generator (`.ts`)**: Output copy-pasteable TypeScript modules implementing `WeaponSchematicBlueprint` and procedural Three.js geometry.
18. **SMART-18 (PHASE 32)** — **Zero-Non-Manifold Watertight ASCII/Binary `.STL` Solid Compiler for Every Sub-Component**: Every component row (`[1] BD-01`, `[2] BD-02`, `[3] BD-03`, `REXP-#11`, `PP750-01`, `ASC-45-10`, etc.) features a **`⚡ Create Unique Part`** button that generates a bespoke, shape-accurate `.STL` solid and custom SVG cross-section.
19. **SMART-19 (PHASE 33)** — **`codellama:34b` Automated `.3MF` / G-Code Slicer Modifier Profile Generator**: Output 6-perimeter O-ring boss rules and 85% gyroid infill modifiers for `PA12-CF15` and `PEEK-GF30`.
20. **SMART-20 (PHASE 34)** — **`gemma2:27b` Procedural Three.js In-Game 3D Asset Forge (Evanix REX-P & 300B Pump)**: Build and equip the complete Evanix REX-P coaxial in-game 3D asset and interactive 300-Bar hand pump directly on the workbench.

### Pillar V: Physics-Driven Gameplay, Ballistic Range & Survival Crafting Loop (SMART-21 to SMART-25)
21. **SMART-21 (PHASE 35)** — **Interactive 300-Bar Hand-Pumping Gameplay Mechanic & Thermal Interstage Gauge**: Pump the Ascent `.45` reserve to `300 Bar` stroke-by-stroke (`+12 Bar/stroke`) or full charge on the workbench.
22. **SMART-22 (PHASE 36)** — **Real-Time External Ballistics, Aerodynamic Drag & Multi-Pellet Sabot Buckshot Dispersion**: Simulate `.177` to `.50 cal` boattail slugs and 6-pellet sabot buckshot trajectories at 60 Hz.
23. **SMART-23 (PHASE 37)** — **FBI 10% Ballistic Ordnance Gel Penetration & Wound Cavity Profiler**: Verify `>= 30 cm` ordnance gel penetration for `.45 Cal` 220gr slugs in the Virtual Physics Range.
24. **SMART-24 (PHASE 38)** — **Scavenged Polymer Filament (`PA12-CF` / `PEEK-GF30`), Burst Foils & Local Part Crafting**: Link survival scavenging to gram-accurate 3D part printing.
25. **SMART-25 (PHASE 39)** — **Self-Testing Deterministic Physics & CAD Invariant Suite (`node:test` + macOS Background Daemon)**: Run `npx --yes tsx --test src/game/rules.test.ts` and `./scripts/mac-background-agents.sh` for continuous background agent verification on macOS.

