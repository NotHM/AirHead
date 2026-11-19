---
name: rust-cad-reboring
description: Re-engineer Over-the-Barrel (OTB) coaxial air cylinder shrouds and barrel liners to custom calibers (.177 to .50 cal) while preserving annular cc gas volume and Lamé thick-wall hoop stress safety factors.
---

# Rust + Physics CAD Caliber Re-Borer

When a barrel with a coaxial Over-the-Barrel (OTB) air container does not natively come in `.30 cal` (`7.62mm`), `.357 cal` (`9.00mm`), `.45 cal` (`11.43mm`), or `.50 cal` (`12.70mm`), this skill invokes the Rust/WASM thick-wall Lamé solver (`rust_redesign_otb_barrel_shroud_od_mm`) to autonomously expand the inner barrel liner OD and outer shroud OD while preserving exact annular gas volume (`208 cc` to `307 cc`) and structural safety factor ($SF \ge 1.85\times$).

## Prerequisites

Before running, make sure you have:
- Run `air-pressure-thermodynamics` or selected an upper platform from `src/game/popular25Catalog.ts`.
- Chosen a target caliber from `SUPPORTED_CAD_CALIBERS` (`4.5mm`, `5.5mm`, `6.35mm`, `7.62mm`, `9.0mm`, `11.43mm`, `12.7mm`).

## Script

```bash
npx tsx ./agent/skills/rust-cad-reboring/scripts/rebore_otb_barrel_cad.ts \
  --workspace ./workspace \
  --upper "fx_drs_tactical" \
  --target-caliber-mm 11.43 \
  --material "PA12_CF_CARBON_NYLON"
```

| Argument | Required | Description |
|----------|----------|-------------|
| `--workspace` | yes | Root workspace directory |
| `--upper` | yes | Upper platform ID to re-bore (e.g. `fx_drs_tactical`, `hatsan_vectis`) |
| `--target-caliber-mm` | yes | Desired bore diameter in mm (e.g. `7.62` for `.30 Cal` or `11.43` for `.45 Cal`) |
| `--material` | no | Printable polymer/composite (`PA12_CF_CARBON_NYLON`, `PEEK_GF30_AEROSPACE`, `ULTEM_9085_HT`) |

## What it does

1. Computes the new inner barrel liner Outer Diameter ($OD_{liner} = d_{bore} + 2 t_{liner}$).
2. Solves the exact inner shroud radius required to preserve the original annular air volume ($V_{cc} = \pi (r_{shroud,in}^2 - r_{liner,out}^2) L_{eff}$).
3. Applies Lamé's thick-walled pressure vessel equation ($\sigma_\theta = P \frac{r_o^2 + r_i^2}{r_o^2 - r_i^2}$) to compute the minimum safe outer shroud diameter ($OD_{shroud}$).
4. Emits the parametric CAD specification at `data/cad/otb_rebore_spec.json`.

## Output — `data/cad/otb_rebore_spec.json`

See the **Output Contract** in `AGENTS.md`. Key points:
- `redesignedByPhysicsCad` is `true` whenever `boreDiameterMm` differs from the stock platform caliber.
- `otbShroudOuterDiameterMm` and `shroudWallThicknessMm` are guaranteed to satisfy Lamé hoop-stress safety requirements at `250 bar`.

## Rules

- Never reduce annular gas capacity (`cc`) when upscaling bore diameter — always expand the outer shroud radius to compensate for the larger inner liner.
