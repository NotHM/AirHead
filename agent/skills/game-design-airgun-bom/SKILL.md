---
name: game-design-airgun-bom
description: Synthesize the 4-zone pneumatic profile, Rust CAD re-bore table, 6-part STL manifest, and all 14 reference airgun Bill of Materials (BOM) into a single structured report.json consumed by the Gunsmith Workbench.
---

# Game Design & Reference Airgun Master BOM Report

The final synthesis step. It gathers everything produced by the thermodynamic, Rust CAD re-boring, 3D-printing STL, and HuggingFace surrogate skills (`data/pneumatics_profile.json`, `data/cad/otb_rebore_spec.json`, `data/stl/*.stl`, and `data/analysis/hf_simulation_cache.json`) and synthesizes a complete engineering & Bill of Materials (BOM) report at `data/report.json`.

## Prerequisites

Before running, make sure you have:
- Run the `air-pressure-thermodynamics` skill (`data/pneumatics_profile.json` exists).
- Run the `rust-cad-reboring` skill (`data/cad/otb_rebore_spec.json` exists).
- Generated the 6 subsystem STL meshes via `3d-printing-stl-manifold`.

## Script

```bash
npx tsx ./agent/skills/game-design-airgun-bom/scripts/build_airgun_report.ts \
  --workspace ./workspace \
  --question "Which hybrid combination and CAD re-bore maximizes muzzle energy while remaining 3D-printable in PA12-CF?" \
  --dataset-name "25 Popular Airguns & 36 Functional CAD Subsystems"
```

| Argument | Required | Description |
|----------|----------|-------------|
| `--workspace` | yes | Root workspace directory |
| `--question` | yes | The engineering or tactical build question |
| `--dataset-name` | no | Friendly catalog name (defaults to `"BAR-250 Master Airgun Catalog"`) |

## What it does

1. Reads the 25-Airgun Platform Catalog (`POPULAR_25_AIRGUNS`) and all 36 functional components (`PNEUMATIC_PARTS_CATALOG`), including:
   - **FX DRS Tactical** (OTB Air Cylinder Shroud `208–307 cc`, MkII AMP Regulator, Modular HP/SHP Lower Plenum `35/63 cc`)
   - **EDgun Leshiy 2** (Dual-Tube Buttstock `LSA242000`, Forward Plug Valve `LSA242200`, 8-rd Rotary Cartridge & Pneumatic Indexing Roller `LSA221103`)
   - **Air Venturi Seneca Aspen & Ascent (Gen-2)** (`170 cc` reservoir, **Part 116 Floating Air-Spring Counter-Pressure Balancer [`2,000 PSI`]**, 3-Stage Apex Pump with in-handle release button, 4-minute quick-change `.177/.22/.25` barrel & pellet probe)
   - **Hatsan Velox Semi-Auto PCP Pistol** (Reciprocating upper slide `Part 6964`, detachable cylinder `Part 4336`, in-grip spare air cell `Part 3340`, striker valve `Part 4341`)
   - **Hatsan Vectis Lever-Action Repeater** (Trigger-guard cowboy lever loop, `QuietEnergy` moderator & `165 cc` tube, `Quattro` 2-stage trigger)
   - **Snowpeak / Artemis PP750L** (Twin-rod telescoping wire buttstock, regulated under-barrel tube, sidelever breech)
   - **Welrod Mk.IIA Cutaway**, **Evanix REX-P / REX**, **AEA Harpoon Twin Burst-Disk**, **Texoma Precision Pellet Pen**, **Airgun Walking Cane**, and **Evanix MP30 Foregrip Bottle SMG**
2. Evaluates all 5 domain agents via `evaluateMultiAgentEngineeringSuite`.
3. Validates the output against the contract in `AGENTS.md` and writes `data/report.json`.

## Output — `data/report.json`

See the **Output Contract** in `AGENTS.md`. Key points:
- `executive_summary` summarizes the hybrid build's ballistic energy ($J$), Lamé hoop-stress safety factor ($SF$), and filament cost (`g`).
- `bom_parts[]` lists every functional part reference (`Part 116`, `Part 6964`, `LSA242200`, etc.), slot, capacity/spec, and 3D printability status.
- `agent_verdicts[]` records the pass/warn status and metrics from all 5 specialized engineering agents.

## Rules

- Never fabricate part numbers or ballistic figures — every part reference and pressure rating must trace back to `src/game/partsCatalog.ts` and the uploaded schematic manuals.
