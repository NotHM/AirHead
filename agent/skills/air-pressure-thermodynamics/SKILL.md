---
name: air-pressure-thermodynamics
description: Solve 4-zone high-pressure pneumatic thermodynamics (Z1 OTB Shroud, Z2 Buttstock Tank, Z3 Cam-Lock Foregrip, Z4 Regulated Plenum), Air Venturi Ascent Part 116 2,000 PSI Floating Air-Spring Counter-Pressure Balancer, and adiabatic gas discharge into data/pneumatics_profile.json.
---

# Air Pressure & 4-Zone Pneumatic Thermodynamics

The foundational thermodynamic step. It solves the 4-zone high-pressure reservoir network (`250 bar / 3,625 PSI` storage down to `110–175 bar` regulated plenum), models the **Air Venturi Ascent Part 116 Floating Air-Spring Counter-Pressure Balancer (`2,000 PSI / 150 bar`)**, and computes adiabatic expansion ($P_1 V_1^\gamma = P_2 V_2^\gamma$, $\gamma = 1.4$) across regulated valves vs. sacrificial burst-disk foils.

## Prerequisites

Before running, make sure you have:
- Selected an upper and lower platform from the 25-Airgun Catalog (`src/game/popular25Catalog.ts`).
- Configured the discharge architecture (`REGULATED_HAMMERLESS_PLUG_VALVE`, `REGULATED_BALANCED_POPPET_VALVE`, or `SACRIFICIAL_COPPER_BURST_DISK_250B`).

## Script

```bash
npx tsx ./agent/skills/air-pressure-thermodynamics/scripts/solve_4zone_ballistics.ts \
  --workspace ./workspace \
  --upper "av_seneca_ascent" \
  --lower "edgun_leshiy2" \
  --caliber-mm 7.62
```

| Argument | Required | Description |
|----------|----------|-------------|
| `--workspace` | yes | Root workspace directory where `data/pneumatics_profile.json` is written |
| `--upper` | yes | Upper platform ID from the 25-Airgun Catalog (e.g. `fx_drs_tactical`, `av_seneca_ascent`, `hatsan_vectis`) |
| `--lower` | yes | Lower platform ID from the 25-Airgun Catalog (e.g. `edgun_leshiy2`, `hatsan_velox`, `snowpeak_pp750l`) |
| `--caliber-mm` | no | Target bore diameter in mm (`4.5`, `5.5`, `6.35`, `7.62`, `9.0`, `11.43`, `12.7`) |

## What it does

1. Reads the upper and lower pneumatic specifications from `src/game/popular25Catalog.ts` and `src/game/partsCatalog.ts`.
2. Evaluates the 4-zone gas state (`Z1 OTB Shroud`, `Z2 Buttstock Tank`, `Z3 Cam-Lock Foregrip Bottle`, `Z4 Lower Plenum`) and calculates net hammer opening force when **Part 116 Floating Air-Spring Balancer (`2,000 PSI`)** is installed.
3. Computes adiabatic muzzle energy ($J$), muzzle velocity ($m/s$), and 3-Stage compound four-bar linkage pump replenishment (`+4.2 bar/stroke`).
4. Writes the validated thermodynamic profile to `data/pneumatics_profile.json`.

## Output — `data/pneumatics_profile.json`

See the **Output Contract** in `AGENTS.md`. Key points:
- `zones` must report exact pressures (`bar`) and volumes (`cc`) for all 4 pneumatic zones.
- `part116BalancerActive` indicates whether the `2,000 PSI` counter-pressure air spring is equalizing valve stem load.
- `muzzleEnergyJoules` and `muzzleVelocityMs` must trace directly to the Rust/WASM adiabatic solver.

## Rules

- Never fabricate pressures or muzzle energies — every figure must come from `src/wasm/pneumaticWasm.ts` and `src/game/popular25Catalog.ts`.
- Enforce the `250 bar` (`3,625 PSI`) auto-bleed overpressure relief ceiling on all 3-stage hand pump strokes.
