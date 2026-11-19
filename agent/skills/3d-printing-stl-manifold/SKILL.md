---
name: 3d-printing-stl-manifold
description: Synthesize watertight 2-manifold ASCII .STL meshes for all 6 weapon subsystems with outward unit normals, NBR90 O-ring gland tolerances, and PA12-CF / PEEK-GF30 slicer settings.
---

# 3D-Printing & Watertight STL Manifold Generator

Every weapon component in **BAR-250: Pneumatic Blueprint** is engineered to 3D-printable quality. This skill runs the procedural hollow-cylinder solid-of-revolution kernel (`emitWatertightHollowTubeSegment`) to output 2-manifold ASCII `.STL` files across all 6 functional subsystems.

## Prerequisites

Before running, make sure you have:
- Generated the CAD re-bore specification (`data/cad/otb_rebore_spec.json`).
- Selected one of the 6 printable subsystems (`OTB_COAXIAL_BARREL_SHROUD_ASSEMBLY`, `STEPPED_PORT_BRIDGE_ADAPTER`, `MODULAR_SHP_LOWER_PLENUM_CHAMBER`, `SELF_INDEXING_ROTARY_MAGAZINE_DRUM`, `CAM_LOCK_FOREGRIP_SWIVEL_TRUNNION`, `SACRIFICIAL_BURST_DISK_UNION_CARTRIDGE`).

## Script

```bash
npx tsx ./agent/skills/3d-printing-stl-manifold/scripts/synthesize_printable_stl.ts \
  --workspace ./workspace \
  --subsystem "OTB_COAXIAL_BARREL_SHROUD_ASSEMBLY" \
  --wall-mm 4.5
```

| Argument | Required | Description |
|----------|----------|-------------|
| `--workspace` | yes | Root workspace directory |
| `--subsystem` | yes | Printable subsystem ID from `PRINTABLE_CAD_SUBSYSTEMS` |
| `--wall-mm` | no | Minimum wall thickness in mm (defaults to `4.5`) |

## What it does

1. Builds a 24-segment hollow cylindrical manifold with sealed inner bore walls, outer walls, and annular top/bottom end-caps.
2. Computes exact outward-pointing unit normal vectors ($\vec{n} = \frac{(\vec{v}_2 - \vec{v}_1) \times (\vec{v}_3 - \vec{v}_1)}{\|(\vec{v}_2 - \vec{v}_1) \times (\vec{v}_3 - \vec{v}_1)\|}$) for every triangle facet.
3. Validates zero non-manifold edges and writes the ASCII `.STL` file to `data/stl/<subsystem>.stl`.

## Output — `data/stl/<subsystem>.stl`

See the **Output Contract** in `AGENTS.md`. Key points:
- Every `.STL` file starts with `solid <partName>` and ends with `endsolid <partName>`.
- Includes dual NBR90 O-ring gland steps and thread pitch bosses suitable for `0.12mm` layer height + `55%` Gyroid infill slicing.

## Rules

- Never emit single-surface shells or zero-thickness triangles — every exported `.STL` must be a closed 2-manifold solid.
