import React, { useState, useEffect, useRef } from 'react';
import {
  GameGraphicsVisualMode,
  GRAPHICS_MODE_SPECS,
  GameReferenceAssetEntry,
  ReverseEngineeringWorkflowId,
  ReverseEngineeringCadExecutionResult,
  EXPERT_REVERSE_ENGINEERING_CAD_SYSTEM_PROMPT,
} from '../game/reverseEngineeringCadAgentAndGraphicsEngine';

interface ReverseEngineeringCadFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphicsMode: GameGraphicsVisualMode;
  onSelectGraphicsMode: (mode: GameGraphicsVisualMode) => void;
  activeWeaponIndex: number;
  onSelectWeaponIndex?: (idx: number) => void;
  onApplyReconstructedCadToWeapon?: (
    result: ReverseEngineeringCadExecutionResult,
    asset: GameReferenceAssetEntry
  ) => void;
}

const WORKFLOW_META: Record<
  ReverseEngineeringWorkflowId,
  { title: string; subtitle: string; badge: string }
> = {
  WORKFLOW_1_MESH_TO_CAD_BREP: {
    title: 'Workflow 1: Point Cloud / Mesh-to-CAD Reconstruction',
    subtitle:
      'trimesh / pymeshlab Mesh Healing -> Primitive Extraction -> cadquery / build123d B-Rep Solid (.STEP)',
    badge: 'B-REP .STEP + .STL',
  },
  WORKFLOW_2_PHOTO_TO_STL_2MM_GRID: {
    title: 'Workflow 2: 2D Photo-to-STL Reverse Engineering',
    subtitle:
      '2mm Grid Perspective Calibration -> Caliper Anchor -> Defect/Crack Ignoring -> Spline Extrude/Revolve',
    badge: '2MM GRID + CALIPER',
  },
  WORKFLOW_3_VISUAL_MARKUP_FIT_TEST: {
    title: 'Workflow 3: Visual Markup & Iterative Fit-Test Refinement',
    subtitle:
      'Visual Diffing -> Targeted Parametric Delta -> 4-View Orthographic Preview -> <= 0.1mm Manifold Check',
    badge: 'FIT-TEST <= 0.1MM',
  },
};

export const ReverseEngineeringCadFolderModal: React.FC<
  ReverseEngineeringCadFolderModalProps
> = ({
  isOpen,
  onClose,
  graphicsMode,
  onSelectGraphicsMode,
  activeWeaponIndex,
  onSelectWeaponIndex,
  onApplyReconstructedCadToWeapon,
}) => {
  const [assets, setAssets] = useState<GameReferenceAssetEntry[]>([]);
  const [folderPath, setFolderPath] = useState<string>('/game_references');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<ReverseEngineeringWorkflowId>('WORKFLOW_2_PHOTO_TO_STL_2MM_GRID');
  const [markupInstruction, setMarkupInstruction] = useState<string>(
    'Verify coaxial plenum bore concentricity within ±0.015mm, ignore surface cracks/callout lines, calibrate to 2mm grid, and export watertight Fusion 360 .STEP + .STL.'
  );
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);
  const [isRunningAgent, setIsRunningAgent] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [agentResult, setAgentResult] =
    useState<ReverseEngineeringCadExecutionResult | null>(null);
  const [showSystemPromptModal, setShowSystemPromptModal] =
    useState<boolean>(false);

  // Editable caliper & note fields for selected asset
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [dimLength, setDimLength] = useState<number>(310);
  const [dimWidth, setDimWidth] = useState<number>(42);
  const [dimHeight, setDimHeight] = useState<number>(18.5);
  const [dimWall, setDimWall] = useState<number>(4.5);
  const [dimFillet, setDimFillet] = useState<number>(1.5);
  const [dimGridRatio, setDimGridRatio] = useState<number>(14.2);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchGameReferences = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await fetch('/api/game-references');
      if (!res.ok) throw new Error('Failed to load /game_references catalog');
      const data = await res.json();
      const loadedEntries: GameReferenceAssetEntry[] = Array.isArray(data.entries)
        ? data.entries
        : [];
      setAssets(loadedEntries);
      if (data.folderPath) setFolderPath(data.folderPath);
      if (!selectedAssetId && loadedEntries.length > 0) {
        setSelectedAssetId(loadedEntries[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reach /api/game-references';
      setUploadStatus(`Notice: ${msg}`);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchGameReferences();
    }
  }, [isOpen]);

  const selectedAsset =
    assets.find((a) => a.id === selectedAssetId) || assets[0] || null;

  useEffect(() => {
    if (selectedAsset) {
      setNoteDraft('');
      setDimLength(selectedAsset.caliperDimensionsMm.lengthMm);
      setDimWidth(selectedAsset.caliperDimensionsMm.widthOrOdMm);
      setDimHeight(selectedAsset.caliperDimensionsMm.thicknessOrIdMm);
      setDimWall(selectedAsset.caliperDimensionsMm.wallThicknessMm);
      setDimFillet(selectedAsset.caliperDimensionsMm.filletRadiusMm);
      setDimGridRatio(selectedAsset.caliperDimensionsMm.gridCalibrationRatioPxPerMm);
      setSelectedWorkflow(selectedAsset.recommendedWorkflow);
    }
  }, [selectedAsset?.id]);

  if (!isOpen) return null;

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory =
      categoryFilter === 'ALL' || asset.fileType === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      asset.fileName.toLowerCase().includes(q) ||
      asset.linkedWeaponTitle.toLowerCase().includes(q) ||
      asset.agentNotes.join(' ').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus(`Uploading ${file.name} to /game_references/...`);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = typeof reader.result === 'string' ? reader.result : '';
        const res = await fetch('/api/game-references/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            base64Data,
            linkedWeaponId: `GUN_0${activeWeaponIndex + 1}`,
            linkedWeaponTitle: `Weapon #0${activeWeaponIndex + 1} Custom Reference`,
            workflow: selectedWorkflow,
            lengthMm: dimLength,
            widthOrOdMm: dimWidth,
            thicknessOrIdMm: dimHeight,
            wallThicknessMm: dimWall,
            filletRadiusMm: dimFillet,
            userNote:
              noteDraft.trim() ||
              `Uploaded ${file.name} to /game_references/ for parametric CAD reverse-engineering.`,
          }),
        });
        const data = await res.json();
        if (data.ok && Array.isArray(data.entries)) {
          setAssets(data.entries);
          const matching = (data.entries as GameReferenceAssetEntry[]).find(
            (x) => x.fileName === data.uploadedFileName
          );
          if (matching) setSelectedAssetId(matching.id);
          setUploadStatus(
            `Saved ${data.uploadedFileName} to /game_references/ and indexed caliper dimensions.`
          );
        } else {
          setUploadStatus(`Upload error: ${data.error || 'Unknown error'}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        setUploadStatus(`Upload failed: ${msg}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNotesAndDimensions = async () => {
    if (!selectedAsset) return;
    setUploadStatus(
      `Saving caliper measurements & engineering notes for ${selectedAsset.fileName}...`
    );
    try {
      const res = await fetch('/api/game-references/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedAsset.fileName,
          lengthMm: Number(dimLength),
          widthOrOdMm: Number(dimWidth),
          thicknessOrIdMm: Number(dimHeight),
          wallThicknessMm: Number(dimWall),
          filletRadiusMm: Number(dimFillet),
          newNote: noteDraft,
          workflow: selectedWorkflow,
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.entries)) {
        setAssets(data.entries);
        setNoteDraft('');
        setUploadStatus(
          `Updated /game_references/catalog_dimensions_and_notes.json & README_AGENT_NOTES.md for ${selectedAsset.fileName}.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setUploadStatus(`Failed to save notes: ${msg}`);
    }
  };

  const handleRunReverseEngineeringAgent = async () => {
    if (!selectedAsset) return;
    setIsRunningAgent(true);
    setUploadStatus(
      `Running Expert Reverse-Engineering & Parametric CAD Agent (${selectedWorkflow}) on ${selectedAsset.fileName}...`
    );
    try {
      const res = await fetch('/api/cad-agent/reverse-engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedAsset.fileName,
          workflow: selectedWorkflow,
          lengthMm: Number(dimLength),
          widthOrOdMm: Number(dimWidth),
          thicknessOrIdMm: Number(dimHeight),
          wallThicknessMm: Number(dimWall),
          filletRadiusMm: Number(dimFillet),
          customDirective: markupInstruction,
        }),
      });
      const resultData = (await res.json()) as ReverseEngineeringCadExecutionResult;
      if (resultData && resultData.stepFileContent) {
        setAgentResult(resultData);
        await fetchGameReferences();
        setUploadStatus(
          `CAD Reconstruction Complete: Wrote ${selectedAsset.fileName.replace(/\.[^.]+$/, '')}_reconstructed.step & .stl into /game_references/ (BBox Error ±${resultData.manifoldCheck.boundingBoxErrorMm}mm <= 0.1mm).`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      setUploadStatus(`CAD Agent Error: ${msg}`);
    } finally {
      setIsRunningAgent(false);
    }
  };

  const downloadTextArtifact = (
    filename: string,
    content: string,
    mimeType = 'text/plain;charset=utf-8'
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 font-mono text-xs text-slate-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[94vh] w-full max-w-[1480px] flex-col overflow-hidden rounded-lg border border-amber-500/50 bg-[#090d14] shadow-2xl">
        {/* TOP HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0d131d] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded border border-amber-500/60 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-amber-300">
              📂 /game_references/ &amp; PARAMETRIC CAD AGENT
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white">
                EXPERT REVERSE-ENGINEERING &amp; PARAMETRIC CAD AGENT + GRAPHICS ENGINE SWITCHER
              </h2>
              <p className="text-[11px] text-slate-400">
                On-disk folder: <span className="text-cyan-300">{folderPath}</span> (
                {assets.length} indexed assets with caliper measurements, 2mm grid
                calibration &amp; Fusion 360 B-Rep .STEP / .STL reconstruction)
              </p>
            </div>
          </div>

          {/* LIVE GRAPHICS ENGINE TOGGLE */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded border border-slate-700 bg-slate-900/90 p-1">
              {(Object.keys(GRAPHICS_MODE_SPECS) as GameGraphicsVisualMode[]).map(
                (modeKey) => {
                  const spec = GRAPHICS_MODE_SPECS[modeKey];
                  const active = graphicsMode === modeKey;
                  return (
                    <button
                      key={modeKey}
                      onClick={() => onSelectGraphicsMode(modeKey)}
                      className={`rounded px-3 py-1.5 text-[11px] font-bold transition ${
                        active
                          ? modeKey === 'PHOTOREALISTIC_PBR_STUDIO'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {spec.shortBadge}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => setShowSystemPromptModal((v) => !v)}
              className="rounded border border-purple-500/50 bg-purple-950/50 px-3 py-1.5 text-[11px] font-bold text-purple-200 hover:bg-purple-900/60"
            >
              {showSystemPromptModal
                ? 'Hide CAD System Prompt'
                : '📜 View Expert CAD Prompt'}
            </button>

            <button
              onClick={onClose}
              className="rounded border border-rose-500/50 bg-rose-950/60 px-3 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-900"
            >
              ✕ Close [ESC]
            </button>
          </div>
        </div>

        {/* OPTIONAL SYSTEM PROMPT INSPECTOR */}
        {showSystemPromptModal && (
          <div className="border-b border-purple-500/40 bg-[#100b1c] px-4 py-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300">
                ACTIVE BACKEND AGENT SYSTEM PROMPT (EXPERT MECHANICAL ENGINEER &amp;
                COMPUTATIONAL GEOMETRY SPECIALIST)
              </span>
              <button
                onClick={() => setShowSystemPromptModal(false)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                [Collapse]
              </button>
            </div>
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-purple-500/20 bg-black/60 p-2.5 text-[10px] leading-relaxed text-purple-100">
              {EXPERT_REVERSE_ENGINEERING_CAD_SYSTEM_PROMPT}
            </pre>
          </div>
        )}

        {/* STATUS BANNER */}
        {uploadStatus && (
          <div className="flex items-center justify-between border-b border-cyan-500/30 bg-cyan-950/30 px-4 py-1.5 text-[11px] text-cyan-200">
            <span>⚡ {uploadStatus}</span>
            <button
              onClick={() => setUploadStatus('')}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN 3-COLUMN WORKSPACE */}
        <div className="grid flex-1 grid-cols-12 overflow-hidden">
          {/* LEFT COLUMN (4 COLS): /game_references/ FILE BROWSER & UPLOADER */}
          <div className="col-span-4 flex flex-col overflow-hidden border-r border-slate-800 bg-[#0b1018]">
            <div className="border-b border-slate-800 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  1. /game_references/ Repository ({filteredAssets.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,.stl,.step,.stp,.obj,.ply,.txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded border border-emerald-500/60 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/30"
                  >
                    + Add File to Folder
                  </button>
                  <button
                    onClick={() => void fetchGameReferences()}
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700"
                    title="Rescan /game_references directory on disk"
                  >
                    ↻ Sync
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filenames, weapons, caliper notes..."
                className="mb-2 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />

              <div className="flex flex-wrap gap-1">
                {[
                  'ALL',
                  'IMAGE_DIAGRAM',
                  'PDF_MANUAL',
                  'SCREENSHOT_REF',
                  'CAD_MESH_STL_STEP',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      categoryFilter === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* FILE LIST */}
            <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
              {isLoadingAssets ? (
                <div className="p-6 text-center text-slate-400">
                  Scanning /game_references/ directory...
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`cursor-pointer rounded border p-2.5 transition ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="break-all font-bold text-white">
                          {asset.fileName}
                        </span>
                        <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                          {asset.fileType}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-amber-300/90">
                        {asset.linkedWeaponTitle}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span>
                          📏 {asset.caliperDimensionsMm.lengthMm} ×{' '}
                          {asset.caliperDimensionsMm.widthOrOdMm} ×{' '}
                          {asset.caliperDimensionsMm.thicknessOrIdMm} mm
                        </span>
                        <span>
                          • Wall {asset.caliperDimensionsMm.wallThicknessMm}mm
                        </span>
                        <span>• {(asset.fileSizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CENTER COLUMN (4 COLS): SELECTED ASSET PREVIEW, CALIPER DIMENSIONS & AGENT NOTES */}
          <div className="col-span-4 flex flex-col overflow-y-auto border-r border-slate-800 bg-[#0d131d] p-3.5">
            {selectedAsset ? (
              <>
                <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-400">
                      SELECTED REFERENCE ASSET ({selectedAsset.folderPath})
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {selectedAsset.fileName}
                    </h3>
                    <p className="text-[11px] text-amber-300">
                      {selectedAsset.linkedWeaponTitle}
                    </p>
                  </div>
                  {onSelectWeaponIndex && (
                    <button
                      onClick={() => {
                        const match = selectedAsset.linkedWeaponId.match(/0(\d)/);
                        const idx = match ? Math.max(0, parseInt(match[1], 10) - 1) : 0;
                        onSelectWeaponIndex(idx);
                      }}
                      className="shrink-0 rounded border border-cyan-500/50 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/20"
                    >
                      Inspect Linked Weapon
                    </button>
                  )}
                </div>

                {/* IMAGE / PDF / CAD PREVIEW */}
                <div className="mb-3 overflow-hidden rounded border border-slate-800 bg-black/70">
                  {selectedAsset.fileType === 'IMAGE_DIAGRAM' ||
                  selectedAsset.fileType === 'SCREENSHOT_REF' ? (
                    <div className="relative">
                      <img
                        src={selectedAsset.publicPreviewUrl}
                        alt={selectedAsset.fileName}
                        className="max-h-48 w-full object-contain p-2"
                      />
                      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/90 px-2.5 py-1 text-[10px] text-slate-400">
                        <span>2mm Grid Calibration: {dimGridRatio} px/mm</span>
                        <a
                          href={selectedAsset.publicPreviewUrl}
                          download={selectedAsset.fileName}
                          className="text-cyan-300 underline"
                        >
                          Download Raw File
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 text-[11px] text-slate-300">
                      <div>
                        <div className="font-bold text-white">
                          📄 {selectedAsset.fileName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Type: {selectedAsset.fileType} • Size:{' '}
                          {(selectedAsset.fileSizeBytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <a
                        href={selectedAsset.publicPreviewUrl}
                        download={selectedAsset.fileName}
                        className="rounded border border-cyan-500/50 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                      >
                        ⬇ Download Reference
                      </a>
                    </div>
                  )}
                </div>

                {/* CALIPER / MICROMETER GROUND-TRUTH ANCHORS */}
                <div className="mb-3 rounded border border-slate-800 bg-slate-950/80 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300">
                      📐 CALIPER &amp; 2MM GRID GROUND-TRUTH DIMENSIONS
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      BBox Error: ±{selectedAsset.boundingBoxErrorMm} mm
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="block">
                      <span className="text-[10px] text-slate-400">
                        Length (X mm)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimLength}
                        onChange={(e) =>
                          setDimLength(parseFloat(e.target.value) || 0)
                        }
                        className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">
                        Width / OD (Y mm)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimWidth}
                        onChange={(e) =>
                          setDimWidth(parseFloat(e.target.value) || 0)
                        }
                        className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">
                        Bore / Thick (Z mm)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimHeight}
                        onChange={(e) =>
                          setDimHeight(parseFloat(e.target.value) || 0)
                        }
                        className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">
                        Wall Thick (mm)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimWall}
                        onChange={(e) =>
                          setDimWall(parseFloat(e.target.value) || 0)
                        }
                        className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">
                        Fillet Radius (mm)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimFillet}
                        onChange={(e) =>
                          setDimFillet(parseFloat(e.target.value) || 0)
                        }
                        className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">
                        2mm Grid (px/mm)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimGridRatio}
                        onChange={(e) =>
                          setDimGridRatio(parseFloat(e.target.value) || 1)
                        }
                        className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                  </div>
                </div>

                {/* AGENT ENGINEERING NOTES */}
                <div className="mb-3 rounded border border-slate-800 bg-slate-950/80 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300">
                      📝 AGENT ENGINEERING NOTES (IN /game_references/)
                    </span>
                    <button
                      onClick={() => void handleSaveNotesAndDimensions()}
                      className="rounded border border-emerald-500/60 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/30"
                    >
                      💾 Save Notes &amp; Calipers
                    </button>
                  </div>

                  <ul className="mb-2 space-y-1 text-[10px] text-slate-300">
                    {selectedAsset.agentNotes.map((note: string, idx: number) => (
                      <li
                        key={idx}
                        className="rounded border border-slate-800/80 bg-slate-900/70 p-1.5"
                      >
                        • {note}
                      </li>
                    ))}
                  </ul>

                  <textarea
                    rows={2}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Append new caliper note, fit-test observation, or material spec..."
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-[11px] leading-relaxed text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* EXTRACTED PRIMITIVES & IGNORED DEFECTS */}
                <div className="space-y-2 rounded border border-slate-800 bg-slate-950/60 p-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-amber-300">
                      Extracted Geometric Primitives (B-Rep Features)
                    </div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] text-slate-300">
                      {selectedAsset.extractedPrimitives.map(
                        (p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-rose-300">
                      Defects &amp; Artifacts Automatically Ignored / Healed
                    </div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] text-slate-400">
                      {selectedAsset.defectsHealedOrIgnored.map(
                        (d: string, idx: number) => (
                          <li key={idx}>{d}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-slate-400">
                Select a reference file from /game_references/
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (4 COLS): WORKFLOW EXECUTION, 4-VIEW ORTHOGRAPHIC PREVIEW & .STEP / .STL OUTPUT */}
          <div className="col-span-4 flex flex-col overflow-y-auto bg-[#090d14] p-3.5">
            <div className="mb-3 rounded border border-amber-500/40 bg-amber-950/15 p-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                2. Select Reverse-Engineering CAD Workflow
              </div>

              <div className="space-y-2">
                {(
                  Object.keys(WORKFLOW_META) as ReverseEngineeringWorkflowId[]
                ).map((wfKey) => {
                  const meta = WORKFLOW_META[wfKey];
                  const active = selectedWorkflow === wfKey;
                  return (
                    <div
                      key={wfKey}
                      onClick={() => setSelectedWorkflow(wfKey)}
                      className={`cursor-pointer rounded border p-2.5 transition ${
                        active
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {meta.title}
                        </span>
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                          {meta.badge}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {meta.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3">
                <label className="block text-[10px] font-bold uppercase text-slate-300">
                  Visual Markup / Fit-Test Refinement Delta Notes:
                </label>
                <textarea
                  rows={2}
                  value={markupInstruction}
                  onChange={(e) => setMarkupInstruction(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-2 text-[11px] text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                onClick={() => void handleRunReverseEngineeringAgent()}
                disabled={isRunningAgent || !selectedAsset}
                className="mt-3 w-full rounded border border-amber-400 bg-amber-500 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-lg hover:bg-amber-400 disabled:opacity-50"
              >
                {isRunningAgent
                  ? '⚙️ Reconstructing Watertight B-Rep .STEP & .STL...'
                  : '🚀 Run Reverse-Engineering CAD Agent (.STEP + .STL)'}
              </button>
            </div>

            {/* CAD RECONSTRUCTION RESULTS */}
            {agentResult ? (
              <div className="space-y-3">
                {/* MANIFOLDNESS & WATERTIGHTNESS VERIFICATION BADGE */}
                <div className="rounded border border-emerald-500/50 bg-emerald-950/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300">
                      ✅ PROGRAMMATIC MANIFOLDNESS &amp; FIT-TEST VERIFICATION
                    </span>
                    <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                      {agentResult.manifoldCheck.isWatertight
                        ? 'WATERTIGHT PASS'
                        : 'CHECK'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] text-slate-200">
                    <div>
                      • Healed Non-Manifold Edges:{' '}
                      {agentResult.manifoldCheck.nonManifoldEdgesClosed}
                    </div>
                    <div>
                      • Self-Intersections:{' '}
                      {agentResult.manifoldCheck.selfIntersectingFaces}
                    </div>
                    <div>
                      • BBox Error: ±
                      {agentResult.manifoldCheck.boundingBoxErrorMm} mm (&le;
                      0.1mm)
                    </div>
                    <div>
                      • B-Rep Faces / Tris:{' '}
                      {agentResult.manifoldCheck.bRepFaceCount} /{' '}
                      {agentResult.manifoldCheck.stlTriangleCount}
                    </div>
                  </div>
                </div>

                {/* 4-VIEW ORTHOGRAPHIC PREVIEW WITH OVERLAID MILLIMETER DIMENSIONS */}
                <div className="rounded border border-cyan-500/40 bg-slate-950 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-cyan-300">
                      4-View Orthographic Dimensioned Preview (TOP / FRONT /
                      SIDE / ISO)
                    </span>
                    <span className="text-[10px] text-slate-400">Units: mm</span>
                  </div>
                  <svg
                    viewBox="0 0 420 220"
                    className="w-full rounded border border-slate-800 bg-[#05080f]"
                  >
                    {/* Grid lines */}
                    <line
                      x1="210"
                      y1="0"
                      x2="210"
                      y2="220"
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="110"
                      x2="420"
                      y2="110"
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    {/* 1. TOP VIEW */}
                    <text x="10" y="16" fill="#38bdf8" fontSize="9" fontWeight="bold">
                      TOP VIEW (XY · 2mm Grid Calibrated)
                    </text>
                    <rect
                      x="24"
                      y="32"
                      width="150"
                      height="44"
                      rx="5"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="24"
                      y1="54"
                      x2="174"
                      y2="54"
                      stroke="#f59e0b"
                      strokeDasharray="4 2"
                    />
                    <text x="58" y="92" fill="#f8fafc" fontSize="9">
                      L = {agentResult.caliperDimensionsMm.lengthMm.toFixed(1)} mm (±0.02)
                    </text>

                    {/* 2. FRONT VIEW */}
                    <text x="10" y="126" fill="#38bdf8" fontSize="9" fontWeight="bold">
                      FRONT CROSS-SECTION (XZ)
                    </text>
                    <rect
                      x="24"
                      y="140"
                      width="150"
                      height="46"
                      rx="4"
                      fill="#0f172a"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="24"
                      y="153"
                      width="150"
                      height="20"
                      fill="#022c22"
                      stroke="#34d399"
                      strokeDasharray="3 2"
                    />
                    <text x="28" y="202" fill="#a7f3d0" fontSize="9">
                      Wall = {agentResult.caliperDimensionsMm.wallThicknessMm.toFixed(2)} mm ·
                      Fillet R = {agentResult.caliperDimensionsMm.filletRadiusMm.toFixed(2)} mm
                    </text>

                    {/* 3. SIDE / BORE VIEW */}
                    <text x="222" y="16" fill="#38bdf8" fontSize="9" fontWeight="bold">
                      SIDE BORE VIEW (YZ)
                    </text>
                    <circle
                      cx="310"
                      cy="56"
                      r="32"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="310"
                      cy="56"
                      r="14"
                      fill="#05080f"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                    <text x="234" y="101" fill="#f8fafc" fontSize="9">
                      OD={agentResult.caliperDimensionsMm.widthOrOdMm.toFixed(1)}mm / ID=
                      {agentResult.caliperDimensionsMm.thicknessOrIdMm.toFixed(2)}mm
                    </text>

                    {/* 4. ISOMETRIC B-REP SOLID */}
                    <text x="222" y="126" fill="#f59e0b" fontSize="9" fontWeight="bold">
                      ISOMETRIC B-REP (.STEP AP214)
                    </text>
                    <polygon
                      points="250,155 340,136 385,158 295,177"
                      fill="#1e293b"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="250,155 295,177 295,196 250,174"
                      fill="#0f172a"
                      stroke="#fbbf24"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points="295,177 385,158 385,177 295,196"
                      fill="#334155"
                      stroke="#fbbf24"
                      strokeWidth="1.2"
                    />
                    <text x="232" y="210" fill="#fde68a" fontSize="8.5">
                      Watertight B-Rep ({agentResult.manifoldCheck.bRepFaceCount} Faces · Δ=
                      {agentResult.manifoldCheck.boundingBoxErrorMm}mm)
                    </text>
                  </svg>
                </div>

                {/* EXPORT & LIVE HOT-MOUNT ACTIONS */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      downloadTextArtifact(
                        `${selectedAsset?.fileName.replace(/\.[^.]+$/, '') || 'part'}_reconstructed.step`,
                        agentResult.stepFileContent,
                        'application/step'
                      )
                    }
                    className="rounded border border-cyan-400 bg-cyan-500/20 px-3 py-2 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/30"
                  >
                    ⬇ Download .STEP (Fusion 360 B-Rep)
                  </button>
                  <button
                    onClick={() =>
                      downloadTextArtifact(
                        `${selectedAsset?.fileName.replace(/\.[^.]+$/, '') || 'part'}_reconstructed.stl`,
                        agentResult.stlFileContent,
                        'model/stl'
                      )
                    }
                    className="rounded border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/30"
                  >
                    ⬇ Download Watertight .STL
                  </button>
                </div>

                {onApplyReconstructedCadToWeapon && selectedAsset && (
                  <button
                    onClick={() => {
                      onApplyReconstructedCadToWeapon(agentResult, selectedAsset);
                      setUploadStatus(
                        `Mounted reconstructed B-Rep geometry (${dimLength}×${dimWidth}×${dimHeight}mm) & switched to Photorealistic PBR inspection!`
                      );
                    }}
                    className="w-full rounded border border-purple-400 bg-purple-600/30 py-2 text-[11px] font-bold text-purple-100 hover:bg-purple-600/50"
                  >
                    🔧 Apply Reconstructed CAD &amp; Dimensions to Live 3D Weapon
                  </button>
                )}

                {/* STATED ASSUMPTIONS */}
                <div className="rounded border border-slate-800 bg-slate-950/90 p-2.5">
                  <div className="text-[10px] font-bold uppercase text-amber-300">
                    Stated Engineering Assumptions (Inferred Features)
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-[10px] text-slate-300">
                    {agentResult.statedAssumptionsMm.map(
                      (assump: string, i: number) => (
                        <li key={i}>{assump}</li>
                      )
                    )}
                  </ul>
                </div>

                {/* GENERATED CADQUERY / BUILD123D + TRIMESH SCRIPT */}
                <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-cyan-300">
                      Programmatic CAD Rebuild Script (Python: cadquery + trimesh)
                    </span>
                    <button
                      onClick={() =>
                        downloadTextArtifact(
                          `${selectedAsset?.fileName.replace(/\.[^.]+$/, '') || 'part'}_cadquery_rebuild.py`,
                          agentResult.pythonCadQueryScript,
                          'text/x-python'
                        )
                      }
                      className="text-[10px] text-cyan-300 underline"
                    >
                      ⬇ Save .py
                    </button>
                  </div>
                  <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-black/80 p-2 text-[10px] text-emerald-200">
                    {agentResult.pythonCadQueryScript}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-slate-800 p-6 text-center text-slate-400">
                <div className="text-lg">📐</div>
                <div className="mt-1 font-bold text-slate-200">
                  Ready to Reconstruct Watertight B-Rep (.STEP) &amp; Mesh (.STL)
                </div>
                <p className="mt-1 text-[11px]">
                  Select any reference image, PDF manual, or scan in{' '}
                  <span className="text-cyan-300">/game_references/</span> and
                  click <strong>Run Reverse-Engineering CAD Agent</strong> to
                  generate a 4-view dimensioned orthographic drawing, watertight
                  manifold validation, and downloadable `.STEP` / `.STL` files.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
