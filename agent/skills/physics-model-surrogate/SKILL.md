---
name: physics-model-surrogate
description: Run and cache HuggingFace general-purpose physics and CAD surrogate models (MeshGraphNet-Pneumatic-CFD-v2, OpenFOAM-Neural-Operator, FEBio-Surrogate) with sub-millisecond deterministic lookup.
---

# HuggingFace Physics & CAD Surrogate Runner

Runs general-purpose physics and 3D CAD neural surrogates locally or via cached lookup (`localStorage` + in-memory Map) so that any hybrid combination of two pieces out of the 25 popular airguns can be evaluated and tested in the Virtual Physics Range in `<0.5ms`.

## Prerequisites

Before running, make sure you have:
- Selected the HuggingFace model identifier (`hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD`, `hf.co/OpenFOAM-Neural-Operator/Supersonic-Port-Flow-1D`, or `hf.co/FEBio-Surrogate/Anisotropic-PA12-CF-Hoop-Stress`).

## Script

```bash
npx tsx ./agent/skills/physics-model-surrogate/scripts/run_hf_physics_cache.ts \
  --workspace ./workspace \
  --model "hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2" \
  --upper "fx_drs_tactical" \
  --lower "edgun_leshiy2"
```

| Argument | Required | Description |
|----------|----------|-------------|
| `--workspace` | yes | Root workspace directory |
| `--model` | yes | HuggingFace physics/CAD surrogate repository ID |
| `--upper` | yes | Upper piece platform ID |
| `--lower` | yes | Lower piece platform ID |

## What it does

1. Computes a deterministic cache key from `(upperId, lowerId, dischargeType, regulatorBar, plenumCc, wallThicknessMm, material, customCaliberMm)`.
2. Checks the persistent simulation cache (`bar250_hf_physics_cache_v2`) for an existing CFD + FEA evaluation.
3. On cache miss, executes the coupled 1D supersonic transfer-port flow + Lamé anisotropic stress solver and stores the result for instant retrieval.

## Output — `data/analysis/hf_simulation_cache.json`

See the **Output Contract** in `AGENTS.md`. Key points:
- `cacheKey` uniquely identifies the hybrid assembly and caliber re-bore state.
- `gelPenetrationCm` and `zombieStaggerRating` drive the Virtual Physics Range ballistic gel block and zombie stagger mechanics.

## Rules

- Always cache every simulation run so repeated Gunsmith Workbench edits resolve with zero frame drops.
