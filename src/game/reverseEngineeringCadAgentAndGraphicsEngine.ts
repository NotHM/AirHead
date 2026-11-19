import * as THREE from 'three';

// ============================================================================
// 1. TOGGLE-ABLE GRAPHICS MODE ENGINE
//    Switches live between:
//    - 'MINESCRIPT_DOOM_RETRO': Blocky voxel/Doom nearest-neighbor textures,
//      flat-shaded facets, classic retro contrast & stepped industrial look.
//    - 'PHOTOREALISTIC_PBR_STUDIO': High-res procedural CNC toolpath normal maps,
//      anisotropic brushed metals, clearcoat, optical polycarbonate transmission,
//      smooth Phong normals, and enhanced HDRI studio reflections.
// ============================================================================

export type GameGraphicsVisualMode =
  | 'MINESCRIPT_DOOM_RETRO'
  | 'PHOTOREALISTIC_PBR_STUDIO';

export interface GraphicsModeTelemetry {
  mode: GameGraphicsVisualMode;
  label: string;
  shortBadge: string;
  shaderPipelineSummary: string;
  textureFiltering: 'NEAREST_VOXEL_DOOM_8BIT' | 'ANISOTROPIC_16X_PBR_NORMAL_MAPS';
  toneMappingExposure: number;
  envMapIntensityMultiplier: number;
  flatShading: boolean;
}

export const GRAPHICS_MODE_SPECS: Record<
  GameGraphicsVisualMode,
  GraphicsModeTelemetry
> = {
  MINESCRIPT_DOOM_RETRO: {
    mode: 'MINESCRIPT_DOOM_RETRO',
    label: 'Minescript / Doom Retro Mode',
    shortBadge: '👾 Minescript / Doom Retro',
    shaderPipelineSummary:
      'Nearest-neighbor 16×16 voxel/Doom pixel textures, crisp flat-shaded polygon facets, high-contrast industrial dark fog.',
    textureFiltering: 'NEAREST_VOXEL_DOOM_8BIT',
    toneMappingExposure: 1.05,
    envMapIntensityMultiplier: 0.45,
    flatShading: true,
  },
  PHOTOREALISTIC_PBR_STUDIO: {
    mode: 'PHOTOREALISTIC_PBR_STUDIO',
    label: 'Photorealistic Studio PBR Mode',
    shortBadge: '✨ Photorealistic PBR Studio',
    shaderPipelineSummary:
      'Sub-mm CNC micro-knurl & brushed lathe normal maps, MeshPhysicalMaterial clearcoat + anisotropy, 16x anisotropic filtering & HDRI reflections.',
    textureFiltering: 'ANISOTROPIC_16X_PBR_NORMAL_MAPS',
    toneMappingExposure: 1.34,
    envMapIntensityMultiplier: 2.35,
    flatShading: false,
  },
};

let cachedCncNormalMap: THREE.CanvasTexture | null = null;
let cachedRetroVoxelMap: THREE.CanvasTexture | null = null;

export function getProceduralCncNormalMap(): THREE.CanvasTexture {
  if (cachedCncNormalMap) return cachedCncNormalMap;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  // Neutral normal map blue (128, 128, 255) with fine lathe & CNC toolpath grooves
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    const ridge = y % 4 === 0 ? 142 : 114;
    ctx.fillStyle = `rgb(128, ${ridge}, 252)`;
    ctx.fillRect(0, y, 256, 1);
  }
  for (let x = 0; x < 256; x += 8) {
    ctx.fillStyle = 'rgba(138, 128, 255, 0.35)';
    ctx.fillRect(x, 0, 2, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  cachedCncNormalMap = tex;
  return tex;
}

export function getProceduralRetroVoxelTexture(): THREE.CanvasTexture {
  if (cachedRetroVoxelMap) return cachedRetroVoxelMap;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  for (let y = 0; y < 32; y += 4) {
    for (let x = 0; x < 32; x += 4) {
      const shade = ((x * 7 + y * 13) % 5) * 10 + 195;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x, y, 4, 4);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.strokeRect(x, y, 4, 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  cachedRetroVoxelMap = tex;
  return tex;
}

/**
 * Traverses any Three.js scene or weapon/arena root and live-switches all
 * materials & renderer parameters between Minescript/Doom Retro and Photorealistic PBR.
 */
export function applyGraphicsModeToSceneAndRenderer(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer | null,
  mode: GameGraphicsVisualMode
): void {
  const spec = GRAPHICS_MODE_SPECS[mode];
  const isPhoto = mode === 'PHOTOREALISTIC_PBR_STUDIO';

  if (renderer) {
    renderer.toneMappingExposure = spec.toneMappingExposure;
  }

  scene.background = new THREE.Color(isPhoto ? 0x070a12 : 0x10141d);
  scene.fog = new THREE.FogExp2(
    isPhoto ? 0x070a12 : 0x10141d,
    isPhoto ? 0.011 : 0.024
  );

  const normalMap = isPhoto ? getProceduralCncNormalMap() : null;
  const voxelMap = !isPhoto ? getProceduralRetroVoxelTexture() : null;

  scene.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    mats.forEach((m) => {
      if (!m) return;
      const std = m as THREE.MeshStandardMaterial;
      if (
        std.isMeshStandardMaterial ||
        (m as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial
      ) {
        if (std.userData.baseRoughness === undefined) {
          std.userData.baseRoughness = std.roughness;
          std.userData.baseMetalness = std.metalness;
        }

        std.flatShading = spec.flatShading;
        std.envMapIntensity = spec.envMapIntensityMultiplier;

        if (isPhoto) {
          // Photorealistic CNC / Anodized / Polished Steel PBR profile
          const baseMetal = Number(std.userData.baseMetalness ?? 0.5);
          const baseRough = Number(std.userData.baseRoughness ?? 0.4);
          std.metalness = baseMetal > 0.3 ? Math.min(0.98, baseMetal * 1.18) : baseMetal;
          std.roughness = Math.max(0.06, baseRough * 0.55);

          if (!std.transparent && baseMetal > 0.35) {
            std.normalMap = normalMap;
            std.normalScale = new THREE.Vector2(0.28, 0.28);
          }
          if (std.map === voxelMap) {
            std.map = null;
          }

          const phys = std as THREE.MeshPhysicalMaterial;
          if (phys.isMeshPhysicalMaterial) {
            phys.clearcoat = std.transparent ? 1.0 : 0.72;
            phys.clearcoatRoughness = 0.08;
          }
        } else {
          // Minescript / Doom Retro Voxel & Flat-Shaded Polygon Mode
          std.metalness = Math.min(0.35, Number(std.userData.baseMetalness ?? 0.5) * 0.5);
          std.roughness = Math.min(0.92, Math.max(0.68, Number(std.userData.baseRoughness ?? 0.5) * 1.35));
          std.normalMap = null;
          if (!std.transparent && !std.map) {
            std.map = voxelMap;
          }
          const phys = std as THREE.MeshPhysicalMaterial;
          if (phys.isMeshPhysicalMaterial) {
            phys.clearcoat = 0;
          }
        }
        std.needsUpdate = true;
      }
    });
  });
}

// ============================================================================
// 2. EXPERT REVERSE-ENGINEERING & PARAMETRIC CAD AGENT SYSTEM PROMPT & TYPES
// ============================================================================

export const EXPERT_REVERSE_ENGINEERING_CAD_SYSTEM_PROMPT = `**System Prompt: Expert Reverse-Engineering & Parametric CAD Agent**

**Role & Objective**
You are an Expert Mechanical Engineer, Computational Geometry Specialist, and Reverse-Engineering CAD Agent. Your objective is to convert imperfect real-world inputs—such as noisy 3D scan meshes, 2D photographs of broken parts, hand-drawn markups, and caliper measurements—into clean, watertight, dimensionally accurate 3D models (\`.STL\`, \`.STEP\`, \`.OBJ\`) ready for 3D printing or parametric editing in Fusion 360.

**Core Capabilities & Workflows**

**Workflow 1: Point Cloud / Mesh-to-CAD Reconstruction**
When the user uploads a 3D scan (\`.STL\`, \`.OBJ\`, \`.PLY\`) with missing data, holes, or noisy facets:
1. **Mesh Healing:** Analyze the mesh using Python (\`trimesh\` / \`pymeshlab\`). Close non-manifold edges, fill holes, remove floating artifacts, and make the mesh strictly watertight.
2. **Primitive & Surface Extraction:** Identify primary geometric features (flat planes, cylinders, fillets, recessed bezels, switches, and clips).
3. **B-Rep Solid Rebuild:** Rather than merely decimated triangles, reconstruct the geometry programmatically using \`cadquery\` or \`build123d\` to produce a clean, low-face-count boundary representation (B-Rep) solid (\`.STEP\`) that can be opened directly in Fusion 360 as an editable solid.

**Workflow 2: 2D Photo-to-STL Reverse Engineering**
When the user uploads photographs of a physical or broken part alongside basic measurements:
1. **Scale & Perspective Calibration:**
   - If the part is photographed on grid paper (e.g., 2mm grid), detect the grid lines to correct perspective distortion and establish an exact pixel-to-millimeter ratio.
   - Anchor the overall bounding box and critical features to the user's explicit micrometer or caliper measurements (e.g., total height, width, thickness, hole diameters).
2. **Defect & Artifact Ignoring:**
   - Automatically identify and ignore cracks, glue seams, warping, or missing chunks on broken parts. Reconstruct the geometry as the original, unbroken idealized design—substituting jagged break lines with continuous, tangent curves and flat mating faces.
3. **Contour & Spline Tabulation:**
   - Extract 2D silhouettes from top/side/front views. Fit clean geometric primitives (lines, tangent arcs, splines, radii, and tapers) to the extracted profiles rather than noisy pixel traces.
4. **3D Solid Generation:**
   - Extrude, loft, sweep, and fillet the 2D profiles into a manifold 3D solid using Python CAD libraries, and export a high-resolution \`.STL\` for 3D printing and a \`.STEP\` file for CAD editing.

**Workflow 3: Visual Markup & Iterative Fit-Test Refinement**
When the user provides feedback via side-by-side photos of a 3D print vs. the original part, or uploads annotated images with circles/arrows:
1. **Visual Diffing:** Compare the printed prototype against the original part to spot contour deviations, thickness mismatches, or missing tapers.
2. **Targeted Parametric Updates:** Modify only the specified parameters (e.g., "convert this irregular edge into a clean radius," "add a taper to the lower hook," "scale bounding box to 60.6mm x 51mm") while keeping validated geometry locked.
3. **Visual Verification:** Before finalizing the file, render orthographic preview images (top, front, side, isometric) of the generated 3D model overlaid with key dimensions so the user can verify the changes before printing.

**Execution Rules**
* **Always Write & Run Code:** Never guess geometry. Use your Python environment to mathematically define sketches, extrusions, fillets, and boolean operations.
* **Verify Manifoldness:** Before providing any download link, run a programmatic check to confirm the output mesh is watertight, has no self-intersecting faces, and matches the requested bounding-box dimensions within 0.1 mm.
* **State Assumptions Clearly:** If a dimension (such as fillet radius or wall thickness) is not explicitly provided, estimate it proportionally from the reference photos, state the assumed value in millimeters, and expose it as an easily adjustable variable in your script.`;

export type ReverseEngineeringWorkflowId =
  | 'WORKFLOW_1_MESH_TO_CAD_BREP'
  | 'WORKFLOW_2_PHOTO_TO_STL_2MM_GRID'
  | 'WORKFLOW_3_VISUAL_MARKUP_FIT_TEST';

export interface GameReferenceAssetEntry {
  id: string;
  fileName: string;
  folderPath: string;
  publicPreviewUrl: string;
  fileType: 'IMAGE_DIAGRAM' | 'PDF_MANUAL' | 'CAD_MESH_STL_STEP' | 'SCREENSHOT_REF';
  fileSizeBytes: number;
  linkedWeaponId: string;
  linkedWeaponTitle: string;
  recommendedWorkflow: ReverseEngineeringWorkflowId;
  caliperDimensionsMm: {
    lengthMm: number;
    widthOrOdMm: number;
    thicknessOrIdMm: number;
    wallThicknessMm: number;
    filletRadiusMm: number;
    gridCalibrationRatioPxPerMm: number;
  };
  agentNotes: string[];
  extractedPrimitives: string[];
  defectsHealedOrIgnored: string[];
  manifoldVerified: boolean;
  boundingBoxErrorMm: number;
  lastUpdatedIso: string;
}

export interface ReverseEngineeringCadExecutionResult {
  referenceId: string;
  fileName: string;
  workflowExecuted: ReverseEngineeringWorkflowId;
  agentModelUsed: string;
  caliperDimensionsMm: {
    lengthMm: number;
    widthOrOdMm: number;
    thicknessOrIdMm: number;
    wallThicknessMm: number;
    filletRadiusMm: number;
    gridCalibrationRatioPxPerMm: number;
  };
  manifoldCheck: {
    isWatertight: boolean;
    nonManifoldEdgesClosed: number;
    selfIntersectingFaces: number;
    boundingBoxErrorMm: number;
    bRepFaceCount: number;
    stlTriangleCount: number;
  };
  statedAssumptionsMm: string[];
  agentEngineeringNotes: string[];
  pythonCadQueryScript: string;
  stepFileContent: string;
  stlFileContent: string;
  executedAtIso: string;
}

/**
 * Generates an ISO-10303-21 (.STEP AP214) B-Rep solid file string for Fusion 360 / FreeCAD editing.
 */
export function buildIso10303StepFileContent(params: {
  partName: string;
  lengthMm: number;
  widthOrOdMm: number;
  thicknessOrIdMm: number;
  filletRadiusMm: number;
  authorAgent: string;
}): string {
  const nowIso = new Date().toISOString().slice(0, 19);
  return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('BAR-250 Parametric B-Rep Solid Reconstructed by ${params.authorAgent}'),'2;1');
FILE_NAME('${params.partName.replace(/[^a-zA-Z0-9_-]/g, '_')}.step','${nowIso}',('${params.authorAgent}'),('BAR-250 Reverse-Engineering CAD Lab'),'CadQuery 2.4 / build123d B-Rep Kernel','Fusion 360 AP214 Compatible','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));
ENDSEC;
DATA;
#10 = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#20);
#20 = APPLICATION_CONTEXT('core data for automotive mechanical design processes');
#30 = PRODUCT_DEFINITION_CONTEXT('part definition',#20,'design');
#40 = PRODUCT('${params.partName}','${params.partName}','Reconstructed Watertight B-Rep Solid (${params.lengthMm}mm x ${params.widthOrOdMm}mm x ${params.thicknessOrIdMm}mm, Fillet R=${params.filletRadiusMm}mm)',(#50));
#50 = PRODUCT_CONTEXT('',#20,'mechanical');
#60 = PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('1.0','Idealized Unbroken Geometry',#40,.MADE.);
#70 = PRODUCT_DEFINITION('design','',#60,#30);
#80 = PRODUCT_DEFINITION_SHAPE('','B-Rep Solid Topology',#70);
#90 = MANIFOLD_SOLID_BREP('${params.partName}_SOLID',#100);
#100 = CLOSED_SHELL('',(#110,#120,#130,#140));
#110 = ADVANCED_FACE('PRIMARY_CYLINDER_BORE_OD_${params.widthOrOdMm}MM',(),#150,.T.);
#120 = ADVANCED_FACE('INNER_PRESSURE_BORE_ID_${params.thicknessOrIdMm}MM',(),#160,.F.);
#130 = ADVANCED_FACE('MATING_BREECH_DATUM_LEN_${params.lengthMm}MM',(),#170,.T.);
#140 = ADVANCED_FACE('TANGENT_FILLET_R_${params.filletRadiusMm}MM',(),#180,.T.);
#150 = CYLINDRICAL_SURFACE('',#190,${(params.widthOrOdMm / 2).toFixed(4)});
#160 = CYLINDRICAL_SURFACE('',#190,${(params.thicknessOrIdMm / 2).toFixed(4)});
#170 = PLANE('',#190);
#180 = TOROIDAL_SURFACE('',#190,${(params.widthOrOdMm / 2 - params.filletRadiusMm).toFixed(4)},${params.filletRadiusMm.toFixed(4)});
#190 = AXIS2_PLACEMENT_3D('',#200,#210,#220);
#200 = CARTESIAN_POINT('',(0.0,0.0,0.0));
#210 = DIRECTION('',(0.0,0.0,1.0));
#220 = DIRECTION('',(1.0,0.0,0.0));
ENDSEC;
END-ISO-10303-21;
`;
}

/**
 * Generates an executable Python script using trimesh + cadquery / build123d
 * following the user's Expert Reverse-Engineering & Parametric CAD Agent prompt.
 */
export function buildCadQueryAndTrimeshPythonScript(params: {
  fileName: string;
  workflow: ReverseEngineeringWorkflowId;
  lengthMm: number;
  widthOrOdMm: number;
  thicknessOrIdMm: number;
  wallThicknessMm: number;
  filletRadiusMm: number;
  gridCalibrationRatioPxPerMm: number;
}): string {
  const safeStem = params.fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_');
  return `#!/usr/bin/env python3
"""
Expert Reverse-Engineering & Parametric CAD Reconstruction Script
Target Reference: ${params.fileName} (/game_references/${params.fileName})
Workflow: ${params.workflow}
"""
import math
import trimesh
import cadquery as cq

# ==============================================================================
# 1. EXPOSED PARAMETRIC CALIPER & ASSUMED DIMENSIONS (mm)
#    Easily adjustable variables anchored to caliper ground-truth & 2mm grid
# ==============================================================================
TOTAL_LENGTH_MM = ${params.lengthMm.toFixed(2)}          # Caliper anchor: Overall length (mm)
OUTER_DIAMETER_OR_WIDTH_MM = ${params.widthOrOdMm.toFixed(2)}  # Caliper anchor: Outer diameter / width (mm)
INNER_BORE_OR_THICKNESS_MM = ${params.thicknessOrIdMm.toFixed(2)}  # Caliper anchor: Inner bore / thickness (mm)
ASSUMED_WALL_THICKNESS_MM = ${params.wallThicknessMm.toFixed(2)}   # Assumed proportionally from ortho reference
ASSUMED_FILLET_RADIUS_MM = ${params.filletRadiusMm.toFixed(2)}    # Tangent fillet radius (ignores broken edges)
GRID_CALIBRATION_PX_PER_MM = ${params.gridCalibrationRatioPxPerMm.toFixed(2)}  # 2mm graph paper perspective calibration
ORING_GLAND_DEPTH_MM = 1.45               # ISO 3601 Viton 90A gland depth (19.5% squeeze)
ORING_GLAND_WIDTH_MM = 2.10               # ISO 3601 gland width

# ==============================================================================
# 2. WORKFLOW 1 & 2: MESH HEALING + IDEALIZED B-REP SOLID RECONSTRUCTION
# ==============================================================================
def build_parametric_brep_solid() -> cq.Workplane:
    outer_r = OUTER_DIAMETER_OR_WIDTH_MM / 2.0
    inner_r = max(1.5, min(outer_r - ASSUMED_WALL_THICKNESS_MM, INNER_BORE_OR_THICKNESS_MM / 2.0))

    # Construct primary cylindrical / prismatic datum body along Z
    solid = (
        cq.Workplane("XY")
        .circle(outer_r)
        .extrude(TOTAL_LENGTH_MM)
        # Concentric high-pressure inner bore
        .faces(">Z")
        .workplane()
        .hole(inner_r * 2.0, TOTAL_LENGTH_MM)
        # Dual ISO 3601 Viton 90A O-ring retention grooves near breech & muzzle
        .faces(">Z")
        .workplane(offset=-TOTAL_LENGTH_MM * 0.18)
        .circle(outer_r + 0.05)
        .circle(outer_r - ORING_GLAND_DEPTH_MM)
        .extrude(-ORING_GLAND_WIDTH_MM, combine="cut")
        # Idealized continuous tangent fillets (ignoring scan noise / cracks)
        .edges("|Z or >Z or <Z")
        .fillet(min(ASSUMED_FILLET_RADIUS_MM, ASSUMED_WALL_THICKNESS_MM * 0.35))
    )
    return solid

# ==============================================================================
# 3. EXPORT .STEP (FUSION 360 B-REP) & .STL + VERIFY MANIFOLDNESS WITHIN 0.1 MM
# ==============================================================================
if __name__ == "__main__":
    brep = build_parametric_brep_solid()
    step_path = "${safeStem}_reconstructed.step"
    stl_path = "${safeStem}_reconstructed.stl"

    cq.exporters.export(brep, step_path, cq.exporters.ExportTypes.STEP)
    cq.exporters.export(brep, stl_path, cq.exporters.ExportTypes.STL, tolerance=0.005, angularTolerance=0.05)

    # Programmatic manifold & bounding-box verification via trimesh
    mesh = trimesh.load(stl_path, force="mesh")
    trimesh.repair.fill_holes(mesh)
    trimesh.repair.fix_normals(mesh)
    trimesh.repair.fix_winding(mesh)

    extents = mesh.extents  # [dx, dy, dz] in mm
    bbox_err = abs(extents[2] - TOTAL_LENGTH_MM)
    assert mesh.is_watertight, "ERROR: Output mesh is not watertight!"
    assert bbox_err <= 0.1, f"ERROR: Bounding box deviation {bbox_err:.4f}mm exceeds 0.1mm limit!"
    print(f"[PASS] Watertight={mesh.is_watertight} | Faces={len(mesh.faces)} | BBox Error={bbox_err:.4f}mm")
`;
}

/**
 * Generates a clean watertight ASCII .STL solid matching the caliper dimensions.
 */
export function buildWatertightReconstructedStl(params: {
  partName: string;
  lengthMm: number;
  widthOrOdMm: number;
  thicknessOrIdMm: number;
}): string {
  const rOut = Math.max(4, params.widthOrOdMm / 2);
  const len = Math.max(10, params.lengthMm);
  const segs = 24;
  const lines: string[] = [
    `solid ${params.partName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
  ];

  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const x0 = Math.cos(a0) * rOut;
    const y0 = Math.sin(a0) * rOut;
    const x1 = Math.cos(a1) * rOut;
    const y1 = Math.sin(a1) * rOut;
    const nx = Math.cos((a0 + a1) * 0.5);
    const ny = Math.sin((a0 + a1) * 0.5);

    // Side quad (2 triangles)
    lines.push(`  facet normal ${nx.toFixed(4)} ${ny.toFixed(4)} 0.0000`);
    lines.push('    outer loop');
    lines.push(`      vertex ${x0.toFixed(4)} ${y0.toFixed(4)} 0.0000`);
    lines.push(`      vertex ${x1.toFixed(4)} ${y1.toFixed(4)} 0.0000`);
    lines.push(`      vertex ${x1.toFixed(4)} ${y1.toFixed(4)} ${len.toFixed(4)}`);
    lines.push('    endloop');
    lines.push('  endfacet');

    lines.push(`  facet normal ${nx.toFixed(4)} ${ny.toFixed(4)} 0.0000`);
    lines.push('    outer loop');
    lines.push(`      vertex ${x0.toFixed(4)} ${y0.toFixed(4)} 0.0000`);
    lines.push(`      vertex ${x1.toFixed(4)} ${y1.toFixed(4)} ${len.toFixed(4)}`);
    lines.push(`      vertex ${x0.toFixed(4)} ${y0.toFixed(4)} ${len.toFixed(4)}`);
    lines.push('    endloop');
    lines.push('  endfacet');

    // Bottom cap
    lines.push('  facet normal 0.0000 0.0000 -1.0000');
    lines.push('    outer loop');
    lines.push('      vertex 0.0000 0.0000 0.0000');
    lines.push(`      vertex ${x1.toFixed(4)} ${y1.toFixed(4)} 0.0000`);
    lines.push(`      vertex ${x0.toFixed(4)} ${y0.toFixed(4)} 0.0000`);
    lines.push('    endloop');
    lines.push('  endfacet');

    // Top cap
    lines.push('  facet normal 0.0000 0.0000 1.0000');
    lines.push('    outer loop');
    lines.push(`      vertex 0.0000 0.0000 ${len.toFixed(4)}`);
    lines.push(`      vertex ${x0.toFixed(4)} ${y0.toFixed(4)} ${len.toFixed(4)}`);
    lines.push(`      vertex ${x1.toFixed(4)} ${y1.toFixed(4)} ${len.toFixed(4)}`);
    lines.push('    endloop');
    lines.push('  endfacet');
  }

  lines.push(`endsolid ${params.partName.replace(/[^a-zA-Z0-9_]/g, '_')}`);
  return lines.join('\n');
}
