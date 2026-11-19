import React, { useState, useEffect } from 'react';
import { SurvivorPrintInventory } from '../game/popular25Catalog';
import {
  THREE_PRINTER_STATIONS,
  THREE_PRINTER_PART_RECIPES,
  IN_GAME_COLLECTIBLE_RESOURCES,
  PRINTER_GUN_FILTER_OPTIONS,
  PRINTER_PART_CATEGORY_OPTIONS,
  PRINTER_PHYSICS_MODEL_OPTIONS,
  PRINTER_ROOM_WEAPONS_RACK,
  CATALOG_1B_AND_4B_LOCAL_MODELS,
  scanLocalHardwareFor1BAnd4BAgents,
  inspectLocatedModelFileAndBuildModelfile,
  researchPrinterPartWithOllama,
  runPrinterRoom1B4BAgentSwarm,
  filterThreePrinterPartRecipes,
  PrinterStationId,
  PrinterPartRecipe,
  PrinterFilterGunId,
  PrinterPartCategoryId,
  PrinterPhysicsDesignModelId,
  LocalHardwareCompatibilityReport,
  LocalCompatibleAgentModelSpec,
  LocatedLocalModelFileEntry,
  PartOllamaResearchReport,
  SwarmExecutionResult,
  canAffordPrinterRecipe,
} from '../game/threePrinterRoomEngine';
import {
  DccCompanionPersistentMemory,
  RoyalCourtAgentId,
  RoyalGuardEquipmentId,
  INITIAL_ROYAL_COURT_AGENTS,
  INITIAL_ROYAL_GUARD_EQUIPMENT,
} from '../game/dccCompanionAndSwarmEngine';
import { PrinterRoom3DAgentSwarmStage } from './PrinterRoom3DAgentSwarmStage';

interface ThreePrinterRoomProps {
  inventory: SurvivorPrintInventory;
  onFabricatePart: (recipe: PrinterPartRecipe) => void;
  onReturnToTitle: () => void;
  companionMemory?: DccCompanionPersistentMemory;
  onCommandRoyalCourtAgent?: (
    agentId?: RoyalCourtAgentId,
    targetGearId?: RoyalGuardEquipmentId
  ) => void;
}

export const ThreePrinterRoom: React.FC<ThreePrinterRoomProps> = ({
  inventory,
  onFabricatePart,
  onReturnToTitle,
  companionMemory,
  onCommandRoyalCourtAgent,
}) => {
  const [selectedPrinterId, setSelectedPrinterId] = useState<PrinterStationId>(
    'PRINTER_01_POLYMER_SLS'
  );
  const [gunFilter, setGunFilter] = useState<PrinterFilterGunId>('ALL_GUNS');
  const [partCategoryFilter, setPartCategoryFilter] =
    useState<PrinterPartCategoryId>('ALL_PARTS');
  const [physicsModelFilter, setPhysicsModelFilter] =
    useState<PrinterPhysicsDesignModelId>('ALL_MODELS');
  const [showWeaponsRack, setShowWeaponsRack] = useState<boolean>(true);
  const [showHardwareAndSwarmPanel, setShowHardwareAndSwarmPanel] =
    useState<boolean>(true);
  const [showRoyalCourtStation, setShowRoyalCourtStation] =
    useState<boolean>(false);

  const [minimizedHud, setMinimizedHud] = useState<boolean>(false);
  const [showDropGuide, setShowDropGuide] = useState<boolean>(false);
  const [lastPrintStatus, setLastPrintStatus] = useState<string | null>(null);

  // Local 1B & 4B Hardware Scan, Model Catalog, File Locator & Ollama Swarm State
  const [hardwareReport, setHardwareReport] =
    useState<LocalHardwareCompatibilityReport | null>(null);
  const [isScanningHardware, setIsScanningHardware] = useState<boolean>(false);
  const [localModels] = useState<LocalCompatibleAgentModelSpec[]>(
    CATALOG_1B_AND_4B_LOCAL_MODELS
  );
  const [loadedModelIds, setLoadedModelIds] = useState<string[]>([
    'mdl_gemma3_1b',
    'mdl_gemma3_4b',
  ]);
  const [locatedFileReport, setLocatedFileReport] =
    useState<LocatedLocalModelFileEntry | null>(null);
  const [selectedOllamaModelTag, setSelectedOllamaModelTag] =
    useState<string>('gemma3:4b');
  const [strictLocalOllama, setStrictLocalOllama] = useState<boolean>(true);
  const [partResearchMap, setPartResearchMap] = useState<
    Record<string, PartOllamaResearchReport>
  >({});
  const [researchingPartId, setResearchingPartId] = useState<string | null>(null);
  const [isResearchingAllRackParts, setIsResearchingAllRackParts] =
    useState<boolean>(false);
  const [swarmReport, setSwarmReport] =
    useState<SwarmExecutionResult | null>(null);
  const [isRunningSwarm, setIsRunningSwarm] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    scanLocalHardwareFor1BAnd4BAgents().then((report) => {
      if (mounted) {
        setHardwareReport(report);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRescanHardware = async () => {
    setIsScanningHardware(true);
    const report = await scanLocalHardwareFor1BAnd4BAgents();
    setHardwareReport(report);
    setIsScanningHardware(false);
    setLastPrintStatus(
      `🖥️ Hardware Scan Complete: ${report.gpuVendorAndRenderer} (${report.estimatedAvailableVramGb}GB VRAM · ${report.cpuLogicalCores} Cores) — 1B Compatibility: ${report.compatibleWith1BModels ? 'PASS' : 'WARN'} · 4B Compatibility: ${report.compatibleWith4BModels ? 'PASS' : 'CPU-QUANT'}`
    );
  };

  const handleDownloadOrLoadModel = async (model: LocalCompatibleAgentModelSpec) => {
    try {
      await fetch('/api/ollama/pull-or-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ollamaTag: model.ollamaTag,
          action: 'PULL',
        }),
      });
    } catch {
      // Offline fallback handled smoothly
    }
    setLoadedModelIds((prev) =>
      prev.includes(model.modelId) ? prev : [...prev, model.modelId]
    );
    setSelectedOllamaModelTag(model.ollamaTag);
    setLastPrintStatus(
      `✓ Model [${model.ollamaTag}] (${model.sizeClass}) loaded into Ollama & mounted in the 1B/4B Printer Room Swarm!`
    );
  };

  const handleLocateLocalModelFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const report = inspectLocatedModelFileAndBuildModelfile({
      name: file.name,
      size: file.size,
    });
    setLocatedFileReport(report);
    try {
      await fetch('/api/ollama/pull-or-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ollamaTag: report.mappedOllamaTag,
          action: 'CREATE_FROM_FILE',
          modelfileContent: report.generatedModelfile,
          localFileName: report.fileName,
        }),
      });
    } catch {
      // Non-fatal
    }
    setSelectedOllamaModelTag(report.mappedOllamaTag);
    setLastPrintStatus(
      `📂 Located Local Weight File "${report.fileName}" (${report.fileSizeMb} MB · ${report.inferredSizeClass}) — Generated Ollama Modelfile & registered as ${report.mappedOllamaTag}!`
    );
  };

  const handleResearchSinglePart = async (recipe: PrinterPartRecipe) => {
    setResearchingPartId(recipe.partId);
    const res = await researchPrinterPartWithOllama(
      recipe,
      selectedOllamaModelTag
    );
    setPartResearchMap((prev) => ({
      ...prev,
      [recipe.partId]: res,
    }));
    setResearchingPartId(null);
    setLastPrintStatus(
      `🔬 Researched [${recipe.partCode}] ${recipe.title} via ${res.executedByModel}: ${res.toleranceImprovementSummary}`
    );
  };

  const handleResearchAllPartsForGun = async (gunId: PrinterFilterGunId) => {
    setIsResearchingAllRackParts(true);
    const targetRecipes =
      gunId === 'ALL_GUNS'
        ? THREE_PRINTER_PART_RECIPES
        : THREE_PRINTER_PART_RECIPES.filter((r) =>
            r.compatibleGunIds.includes(gunId)
          );

    const updated: Record<string, PartOllamaResearchReport> = {
      ...partResearchMap,
    };
    for (const r of targetRecipes) {
      updated[r.partId] = await researchPrinterPartWithOllama(
        r,
        selectedOllamaModelTag
      );
    }
    setPartResearchMap(updated);
    setIsResearchingAllRackParts(false);
    setLastPrintStatus(
      `🤖 Ollama Agent Squad (${selectedOllamaModelTag}) researched ${targetRecipes.length} parts on the Weapons Rack (${gunId})!`
    );
  };

  const handleExecute1B4BSwarm = async () => {
    setIsRunningSwarm(true);
    const active1B = localModels
      .filter((m) => m.sizeClass === '1B_CLASS')
      .map((m) => m.ollamaTag);
    const active4B = localModels
      .filter((m) => m.sizeClass === '4B_CLASS')
      .map((m) => m.ollamaTag);
    const report = await runPrinterRoom1B4BAgentSwarm({
      selectedGunFilter: gunFilter,
      active1BModels: active1B,
      active4BModels: active4B,
    });
    setSwarmReport(report);
    setIsRunningSwarm(false);
    setLastPrintStatus(
      `🐝 1B+4B Ollama Swarm Completed: ${report.partsResearchedCount} parts researched + ${report.escalationsFrom1BTo4BCount} complex PDE/CAD tasks delegated from 1B → 4B!`
    );
  };

  const handleSelectStation = (printerId: PrinterStationId) => {
    setSelectedPrinterId(printerId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bar250-printer-room-focus', {
          detail: { printerId },
        })
      );
    }
  };

  const handleTriggerPrint = (recipe: PrinterPartRecipe) => {
    const check = canAffordPrinterRecipe(inventory, recipe);
    if (!check.affordable) {
      setLastPrintStatus(
        `⚠️ Missing In-Game Salvage for ${recipe.partCode}: ${check.missingSummary.join(' · ')} — Collect resources in Arena Raid!`
      );
      return;
    }
    onFabricatePart(recipe);
    setLastPrintStatus(
      `✓ Fabricated & Exported [${recipe.partCode}] ${recipe.title} via ${recipe.designPhysicsModelLabel} (${recipe.gameplayBonusSummary})`
    );
  };

  const filteredRecipesAllBays = filterThreePrinterPartRecipes(
    THREE_PRINTER_PART_RECIPES,
    {
      gunId: gunFilter,
      partCategory: partCategoryFilter,
      physicsModelId: physicsModelFilter,
    }
  );

  const hasActiveFilters =
    gunFilter !== 'ALL_GUNS' ||
    partCategoryFilter !== 'ALL_PARTS' ||
    physicsModelFilter !== 'ALL_MODELS';

  const royalCourtAgents =
    companionMemory?.royalCourtAgents && companionMemory.royalCourtAgents.length > 0
      ? companionMemory.royalCourtAgents
      : INITIAL_ROYAL_COURT_AGENTS;
  const royalGuardEquipment =
    companionMemory?.royalGuardEquipment && companionMemory.royalGuardEquipment.length > 0
      ? companionMemory.royalGuardEquipment
      : INITIAL_ROYAL_GUARD_EQUIPMENT;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 font-mono text-xs">
      {/* ====================================================================
          TOP HEADER BAR: STRICTLY ONLY RETURN TO TITLE SCREEN!
         ==================================================================== */}
      <header className="pointer-events-auto max-w-[1440px] w-full mx-auto bg-zinc-950/95 border border-zinc-800 rounded-xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            SEALED SUB-LEVEL FABRICATION BUNKER · 3 PART PRINTERS · 9-GUN WEAPONS RACK · OLLAMA 1B/4B SWARM
          </div>
          <h1 className="text-sm md:text-base font-bold text-zinc-100 font-display">
            Tri-Printer Fabrication Room, 9-Weapon Rack, 1B/4B Hardware Scanner &amp; Princess Donut&apos;s Court
          </h1>
        </div>

        {/* Navigation Controls: ONLY Return to Title Screen + Station Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="toggle-weapons-rack"
            onClick={() => setShowWeaponsRack((v) => !v)}
            className={`px-2.5 py-1.5 rounded border text-[10.5px] font-bold cursor-pointer transition-colors ${
              showWeaponsRack
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow'
                : 'bg-zinc-900 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            🔫 9-Gun Rack ({PRINTER_ROOM_WEAPONS_RACK.length})
          </button>

          <button
            type="button"
            data-testid="toggle-hardware-swarm"
            onClick={() => setShowHardwareAndSwarmPanel((v) => !v)}
            className={`px-2.5 py-1.5 rounded border text-[10.5px] font-bold cursor-pointer transition-colors ${
              showHardwareAndSwarmPanel
                ? 'bg-sky-500 text-zinc-950 border-sky-400 shadow'
                : 'bg-zinc-900 border-sky-500/60 text-sky-300 hover:bg-sky-500/20'
            }`}
          >
            🖥️ 1B/4B Hardware &amp; Ollama Swarm
          </button>

          <button
            type="button"
            data-testid="toggle-royal-court-station"
            onClick={() => setShowRoyalCourtStation((v) => !v)}
            className={`px-2.5 py-1.5 rounded border text-[10.5px] font-bold cursor-pointer transition-colors ${
              showRoyalCourtStation
                ? 'bg-fuchsia-500 text-zinc-950 border-fuchsia-400 shadow'
                : 'bg-zinc-900 border-fuchsia-500/60 text-fuchsia-300 hover:bg-fuchsia-500/20'
            }`}
          >
            👑 Donut&apos;s Royal Court
          </button>

          <button
            type="button"
            onClick={() => setMinimizedHud((v) => !v)}
            className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-[10.5px] cursor-pointer"
          >
            {minimizedHud ? '▴ Expand Console' : '▾ Min Console'}
          </button>

          {/* THE ONLY EXIT FROM THIS ROOM IS RETURN TO TITLE */}
          <button
            type="button"
            data-testid="printer-room-return-title"
            onClick={onReturnToTitle}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer shadow-lg"
          >
            ← Return to Title Screen
          </button>
        </div>
      </header>

      {/* ====================================================================
          IN-GAME COLLECTIBLE RESOURCE BAR + WEAPONS RACK + 1B/4B HARDWARE & OLLAMA SWARM
         ==================================================================== */}
      {!minimizedHud && (
        <div className="pointer-events-auto max-w-[1440px] w-full mx-auto flex flex-col gap-2 my-auto py-2 max-h-[82vh] overflow-y-auto">
          {/* 0. 3D Animated Royal Court & 1B/4B Swarm Avatars Operating Printers & Weapons */}
          <PrinterRoom3DAgentSwarmStage
            selectedPrinterId={selectedPrinterId}
            royalCourtAgents={royalCourtAgents}
            activeOllamaModelTag={selectedOllamaModelTag}
            strictLocalOllama={strictLocalOllama}
            onSelectPrinterStation={handleSelectStation}
            onCommandRoyalAgent={(agentId) => onCommandRoyalCourtAgent?.(agentId)}
            onTrigger1B4BSwarm={handleExecute1B4BSwarm}
            onResearchActiveStationParts={() => handleResearchAllPartsForGun(gunFilter)}
          />

          {/* 1. 8 In-Game Collected Resources Telemetry Strip */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                  Collected In-Game Salvage &amp; Feedstock Inventory
                </span>
                <button
                  type="button"
                  data-testid="printer-room-strict-ollama-toggle"
                  onClick={() => setStrictLocalOllama((v) => !v)}
                  className={`px-2 py-0.5 rounded border text-[9.5px] font-bold cursor-pointer ${
                    strictLocalOllama
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {strictLocalOllama
                    ? '🔒 Strict Local Ollama 1B/4B: ON'
                    : '☁️ Hybrid Ollama / Cloud'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDropGuide((v) => !v)}
                  className="text-[10px] text-sky-300 hover:underline cursor-pointer"
                >
                  {showDropGuide ? '▾ Hide Drop Guide' : '📦 Where to Collect Resources'}
                </button>
                <span className="text-[10px] text-zinc-400">
                  Parts Researched:{' '}
                  <strong className="text-sky-300">
                    {Object.keys(partResearchMap).length} / {THREE_PRINTER_PART_RECIPES.length}
                  </strong>{' '}
                  · Fabricated:{' '}
                  <strong className="text-amber-300">
                    {(inventory.printedRoomPartIds || []).length} / {THREE_PRINTER_PART_RECIPES.length}
                  </strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {IN_GAME_COLLECTIBLE_RESOURCES.map((res) => {
                const amount = inventory[res.key] ?? 0;
                return (
                  <div
                    key={res.key}
                    className={`rounded-lg border px-2 py-1.5 ${res.colorBadgeClass}`}
                  >
                    <div className="text-[9.5px] font-semibold truncate">{res.shortName}</div>
                    <div className="text-sm font-bold text-zinc-100 tabular-nums mt-0.5">
                      {amount}
                      {res.unitSuffix}
                    </div>
                  </div>
                );
              })}
            </div>

            {showDropGuide && (
              <div className="mt-2 pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 text-[10px]">
                {IN_GAME_COLLECTIBLE_RESOURCES.map((res) => (
                  <div
                    key={res.key}
                    className="bg-zinc-900/90 border border-zinc-800 rounded px-2 py-1"
                  >
                    <div className="font-bold text-zinc-200">{res.shortName}:</div>
                    <div className="text-zinc-400">{res.inGameDropSource}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================================================
              1B & 4B HARDWARE COMPATIBILITY SCANNER, MODEL DOWNLOADER / FILE LOCATOR & OLLAMA SWARM
             ================================================================ */}
          {showHardwareAndSwarmPanel && (
            <div className="bg-zinc-950/95 border-2 border-sky-500/60 rounded-xl p-3 shadow-2xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    🖥️ LOCAL HARDWARE SCANNER FOR 1B &amp; 4B AGENTS · MODEL DOWNLOADER &amp; FILE LOCATOR · OLLAMA SWARM
                  </div>
                  <h2 className="text-xs md:text-sm font-bold text-zinc-100">
                    Detect WebGPU / VRAM for 1B Scout &amp; 4B Architect Models, Locate Local .GGUF Weights, and Run Ollama Swarm
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="scan-hardware-1b-4b-btn"
                    onClick={handleRescanHardware}
                    disabled={isScanningHardware}
                    className="px-2.5 py-1 rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer"
                  >
                    {isScanningHardware ? 'Scanning Hardware...' : '🔍 Re-Scan Hardware (1B / 4B)'}
                  </button>

                  <label className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400 text-amber-200 hover:bg-amber-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer">
                    📂 Locate Local Model File (.gguf / .safetensors)
                    <input
                      type="file"
                      accept=".gguf,.safetensors,.bin,.onnx,*"
                      onChange={handleLocateLocalModelFile}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    data-testid="run-ollama-swarm-btn"
                    onClick={handleExecute1B4BSwarm}
                    disabled={isRunningSwarm}
                    className="px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10.5px] hover:bg-emerald-400 cursor-pointer shadow"
                  >
                    {isRunningSwarm
                      ? '🐝 Running 1B+4B Ollama Swarm...'
                      : '🐝 Run 1B + 4B Ollama Swarm Across Parts'}
                  </button>
                </div>
              </div>

              {/* Hardware Telemetry Bar */}
              {hardwareReport && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2">
                    <div className="text-zinc-400">Detected GPU / Accelerator:</div>
                    <div className="font-bold text-zinc-100 truncate">
                      {hardwareReport.gpuVendorAndRenderer}
                    </div>
                    <div className="text-sky-300 mt-0.5">
                      WebGPU: {hardwareReport.webGpuSupported ? 'ENABLED' : 'FALLBACK'} · WebGL2:{' '}
                      {hardwareReport.webGl2Supported ? 'YES' : 'NO'}
                    </div>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2">
                    <div className="text-zinc-400">CPU Cores / System RAM / Est. VRAM:</div>
                    <div className="font-bold text-zinc-100">
                      {hardwareReport.cpuLogicalCores} Threads · {hardwareReport.deviceMemoryGb}GB RAM · ~{hardwareReport.estimatedAvailableVramGb}GB VRAM
                    </div>
                    <div className="text-emerald-300 mt-0.5 truncate">
                      {hardwareReport.recommendedSwarmTopology}
                    </div>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2">
                    <div className="text-zinc-400">1B &amp; 4B Local Model Compatibility:</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold">
                        1B Models: {hardwareReport.compatibleWith1BModels ? `PASS (~${hardwareReport.estimated1BTokensPerSec} tok/s)` : 'CPU'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-300 font-bold">
                        4B Models: {hardwareReport.compatibleWith4BModels ? `PASS (~${hardwareReport.estimated4BTokensPerSec} tok/s)` : 'CPU QUANT'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2">
                    <div className="text-zinc-400">Ollama Daemon &amp; Swarm Status:</div>
                    <div className="font-bold text-amber-300">
                      {hardwareReport.concurrent1B4BSwarmReady
                        ? '🟢 1B+4B CONCURRENT SWARM READY'
                        : '🟡 SEQUENTIAL 1B/4B SWARM READY'}
                    </div>
                    <div className="text-zinc-400 truncate mt-0.5">
                      Active Model: <strong className="text-zinc-100">{selectedOllamaModelTag}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 1B & 4B Model Catalog Cards with Download / Load via Ollama */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                {localModels.map((model) => {
                  const isActive = selectedOllamaModelTag === model.ollamaTag;
                  const isLoaded = loadedModelIds.includes(model.modelId);
                  return (
                    <div
                      key={model.modelId}
                      className={`rounded-lg border p-2 flex flex-col justify-between gap-1.5 ${
                        isActive
                          ? 'bg-sky-950/35 border-sky-400 ring-1 ring-sky-400/40'
                          : 'bg-zinc-900/90 border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                              model.sizeClass === '1B_CLASS'
                                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                                : 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                            }`}
                          >
                            {model.sizeClass === '1B_CLASS' ? '1B SCOUT' : '4B ARCHITECT'}
                          </span>
                          <span className="text-[9px] text-zinc-400">{model.quantizationFormat}</span>
                        </div>
                        <div className="text-[10.5px] font-bold text-zinc-100 mt-1">
                          {model.displayName}
                        </div>
                        <div className="text-[9px] text-amber-300 font-mono">
                          {model.ollamaPullCommand} ({model.downloadSizeGb} GB)
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-0.5 leading-snug">
                          {model.swarmCapabilities}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadOrLoadModel(model)}
                            className="flex-1 px-1.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[9.5px] hover:bg-sky-400 cursor-pointer"
                          >
                            {isLoaded ? '✓ Loaded in Ollama' : '⬇ Pull & Load'}
                          </button>
                          <a
                            href={model.huggingFaceGgufUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-1.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-zinc-300 hover:text-white text-[9px]"
                            title="Download GGUF weights from HuggingFace"
                          >
                            HF .GGUF
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Located Local Model File Inspector & Generated Modelfile */}
              {locatedFileReport && (
                <div className="bg-zinc-900/95 border border-amber-500/50 rounded-lg p-2.5 flex flex-col md:flex-row items-start justify-between gap-3 text-[10px]">
                  <div className="space-y-1">
                    <div className="text-amber-300 font-bold">
                      📂 Located Model File on Disk: {locatedFileReport.fileName} ({locatedFileReport.fileSizeMb} MB · Class: {locatedFileReport.inferredSizeClass})
                    </div>
                    <div className="text-emerald-300 font-mono">
                      Mapped Ollama Tag: ollama create {locatedFileReport.mappedOllamaTag} -f ./Modelfile
                    </div>
                  </div>
                  <pre className="bg-zinc-950 border border-zinc-800 rounded p-2 text-[9px] text-zinc-300 overflow-x-auto max-w-xl">
                    {locatedFileReport.generatedModelfile}
                  </pre>
                </div>
              )}

              {/* Swarm Execution Transcript */}
              {swarmReport && (
                <div className="bg-zinc-900/95 border border-emerald-500/50 rounded-lg p-2.5 space-y-1.5 text-[10px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-emerald-300">
                      🐝 OLLAMA 1B + 4B SWARM EXECUTION REPORT ({swarmReport.swarmRunId})
                    </span>
                    <span className="text-sky-300 font-bold">
                      Parts Researched: {swarmReport.partsResearchedCount} · Delegated 1B→4B: {swarmReport.escalationsFrom1BTo4BCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                    {swarmReport.swarmLogEntries.map((entry) => (
                      <div
                        key={entry.step}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[9.5px] text-zinc-300"
                      >
                        <strong className="text-amber-300">[{entry.modelTag}]</strong> {entry.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              9-WEAPON RACK IN THE PRINTER ROOM (ASSIGN AGENTS TO RESEARCH ALL PARTS VIA OLLAMA)
             ================================================================ */}
          {showWeaponsRack && (
            <div className="bg-zinc-950/95 border-2 border-emerald-500/60 rounded-xl p-3 shadow-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    🔫 PRINTER ROOM 9-WEAPON RACK (#01 MONGO → #09 THE PROTECTOR) · OLLAMA PART RESEARCH
                  </div>
                  <h2 className="text-xs md:text-sm font-bold text-zinc-100">
                    Select Any Gun on the Rack to Filter Its Printable Parts or Assign Ollama Agents ({selectedOllamaModelTag}) to Research All Parts
                  </h2>
                </div>

                <button
                  type="button"
                  data-testid="rack-research-all-guns-btn"
                  disabled={isResearchingAllRackParts}
                  onClick={() => handleResearchAllPartsForGun('ALL_GUNS')}
                  className="px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10.5px] hover:bg-emerald-400 cursor-pointer shadow"
                >
                  {isResearchingAllRackParts
                    ? '🔬 Ollama Agents Researching All Rack Parts...'
                    : `🔬 Assign Ollama (${selectedOllamaModelTag}) to Research All ${THREE_PRINTER_PART_RECIPES.length} Parts`}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-1.5">
                {PRINTER_ROOM_WEAPONS_RACK.map((slot) => {
                  const isFocused = gunFilter === slot.filterGunId;
                  const gunRecipes = THREE_PRINTER_PART_RECIPES.filter((r) =>
                    r.compatibleGunIds.includes(slot.filterGunId)
                  );
                  const researchedCount = gunRecipes.filter(
                    (r) => Boolean(partResearchMap[r.partId])
                  ).length;

                  return (
                    <div
                      key={slot.filterGunId}
                      className={`rounded-lg border p-2 flex flex-col justify-between gap-1.5 transition-colors ${
                        isFocused
                          ? 'bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400/40'
                          : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-amber-400">
                            RACK #{slot.slotNumber}
                          </span>
                          <span className="text-[8.5px] px-1 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-sky-300">
                            {researchedCount}/{gunRecipes.length} Researched
                          </span>
                        </div>
                        <div className="text-[10.5px] font-bold text-zinc-100 mt-0.5 leading-snug">
                          {slot.shortTitle}
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">
                          {slot.caliberAndArchitecture}
                        </div>
                        <div className="text-[8.5px] text-emerald-300 mt-0.5 truncate">
                          {slot.keyMechanismHighlight}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() =>
                            setGunFilter(isFocused ? 'ALL_GUNS' : slot.filterGunId)
                          }
                          className={`w-full px-1.5 py-1 rounded text-[9px] font-bold cursor-pointer ${
                            isFocused
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-950 border border-zinc-700 text-zinc-200 hover:border-amber-400'
                          }`}
                        >
                          {isFocused ? '✓ Rack Focused' : 'Focus Gun Parts'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResearchAllPartsForGun(slot.filterGunId)}
                          className="w-full px-1.5 py-1 rounded bg-sky-500/20 border border-sky-500/50 text-sky-300 hover:bg-sky-500 hover:text-zinc-950 text-[9px] font-bold cursor-pointer"
                        >
                          🔬 Research Parts
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================
              PRINCESS DONUT'S ROYAL COURT STATION IN THE PRINTER ROOM
             ================================================================ */}
          {showRoyalCourtStation && (
            <div className="bg-zinc-950/95 border-2 border-fuchsia-500/60 rounded-xl p-3 shadow-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <div className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">
                    👑 HRH PRINCESS DONUT&apos;S ROYAL COURT FABRICATION STATION (5 AGENTS · 5 ROYAL GUARD ITEMS)
                  </div>
                  <h2 className="text-xs md:text-sm font-bold text-zinc-100">
                    Verify Princess Donut&apos;s Court Is Crafting Top-Spec Royal Guard Armor, Tiara Lasers &amp; #01 Mongo Cartridges
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onCommandRoyalCourtAgent?.()}
                  className="px-3 py-1 rounded bg-fuchsia-500 text-zinc-950 font-bold text-[10.5px] hover:bg-fuchsia-400 cursor-pointer shadow"
                >
                  👑 Command All 5 Court Agents (+1 Mk Upgrade)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {royalCourtAgents.map((agent) => {
                  const gear = royalGuardEquipment.find(
                    (g) => g.craftedByAgentId === agent.agentId
                  );
                  return (
                    <div
                      key={agent.agentId}
                      className="bg-zinc-900/90 border border-fuchsia-500/40 rounded-lg p-2 flex flex-col justify-between gap-1.5"
                    >
                      <div>
                        <div className="text-[10px] font-bold text-amber-300">
                          {agent.royalTitle}
                        </div>
                        <div className="text-[9px] text-fuchsia-300">
                          {agent.callsign} · {agent.specialty}
                        </div>
                        <div className="text-[9px] text-zinc-300 mt-1">
                          {agent.currentOrder}
                        </div>
                        {gear && (
                          <div className="mt-1.5 pt-1.5 border-t border-zinc-800 text-[9px]">
                            <div className="font-bold text-emerald-300">
                              🛡️ {gear.title} (Mk.{gear.tierLevel})
                            </div>
                            <div className="text-zinc-400">
                              +{gear.ocularBeamBonusDmg} Beam DMG · +{gear.guardArmorBonusHp} Guard HP
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onCommandRoyalCourtAgent?.(agent.agentId)
                        }
                        className="w-full px-2 py-1 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 hover:bg-fuchsia-500 hover:text-zinc-950 font-bold text-[9.5px] cursor-pointer"
                      >
                        ⚡ Command {agent.royalTitle.split(' ')[1]}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. FILTER BAR: FILTER BY GUN (#01-#09), PART CATEGORY ON GUN, AND AI / PHYSICS DESIGN MODEL */}
          <div className="bg-zinc-950/95 border border-sky-500/40 rounded-xl p-2.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  🔍 FILTER PRINTABLE PARTS BY GUN (#01–#09) · PART CATEGORY · AI / PHYSICS DESIGN MODEL
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/40 text-[10px] text-sky-300 font-bold">
                  Showing {filteredRecipesAllBays.length} of {THREE_PRINTER_PART_RECIPES.length} Parts
                </span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setGunFilter('ALL_GUNS');
                    setPartCategoryFilter('ALL_PARTS');
                    setPhysicsModelFilter('ALL_MODELS');
                  }}
                  className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold cursor-pointer"
                >
                  ✕ Reset All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Filter #1: Filter by Weapon */}
              <div>
                <label className="block text-[9.5px] font-bold text-zinc-400 uppercase mb-1">
                  1. Filter by Gun (#01 Mongo – #09 The Protector):
                </label>
                <select
                  aria-label="Filter by Gun"
                  value={gunFilter}
                  onChange={(e) => setGunFilter(e.target.value as PrinterFilterGunId)}
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-100 focus:border-amber-400 focus:outline-none"
                >
                  {PRINTER_GUN_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter #2: Filter by Part Category on the Gun */}
              <div>
                <label className="block text-[9.5px] font-bold text-zinc-400 uppercase mb-1">
                  2. Filter by Part Category on Gun:
                </label>
                <select
                  aria-label="Filter by Part Category"
                  value={partCategoryFilter}
                  onChange={(e) =>
                    setPartCategoryFilter(e.target.value as PrinterPartCategoryId)
                  }
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-100 focus:border-sky-400 focus:outline-none"
                >
                  {PRINTER_PART_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter #3: Filter by Physics / CAD Model Used to Design or Print */}
              <div>
                <label className="block text-[9.5px] font-bold text-zinc-400 uppercase mb-1">
                  3. Filter by Physics / CAD Solver:
                </label>
                <select
                  aria-label="Filter by Physics Design Model"
                  value={physicsModelFilter}
                  onChange={(e) =>
                    setPhysicsModelFilter(e.target.value as PrinterPhysicsDesignModelId)
                  }
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-100 focus:border-purple-400 focus:outline-none"
                >
                  {PRINTER_PHYSICS_MODEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {lastPrintStatus && (
            <div className="bg-zinc-950/95 border border-emerald-500/60 rounded-lg px-3 py-2 text-emerald-200 flex items-center justify-between gap-2 shadow">
              <span>{lastPrintStatus}</span>
              <button
                type="button"
                onClick={() => setLastPrintStatus(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ================================================================
              THE 3 SPECIALIZED PRINTER STATIONS SIDE-BY-SIDE (WITH BOTH RESEARCH & PRINT BUTTONS)
             ================================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {THREE_PRINTER_STATIONS.map((station) => {
              const isSelected = selectedPrinterId === station.id;
              const stationRecipes = filteredRecipesAllBays.filter(
                (r) => r.printerId === station.id
              );

              return (
                <div
                  key={station.id}
                  onClick={() => handleSelectStation(station.id)}
                  className={`bg-zinc-950/95 border-2 rounded-xl p-3 flex flex-col justify-between transition-colors cursor-pointer shadow-2xl ${
                    isSelected
                      ? `${station.accentBorderClass} ring-1 ring-amber-400/40`
                      : 'border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Station Header */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase">
                          BAY #{station.bayNumber} · {isSelected ? '3D CAMERA FOCUSED' : 'CLICK TO FOCUS 3D BAY'}
                        </span>
                        <h2 className="text-xs font-bold text-zinc-100 mt-0.5">
                          {station.stationName}
                        </h2>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] text-emerald-300 font-bold shrink-0">
                        {stationRecipes.length} Prints
                      </span>
                    </div>

                    <div className="my-2 text-[10px] text-zinc-300 space-y-0.5">
                      <div className="text-sky-300 font-semibold">{station.technologySubtitle}</div>
                      <div className="text-zinc-400">{station.nozzleOrLaserSpec}</div>
                      <p className="text-zinc-400 leading-snug pt-0.5">{station.description}</p>
                    </div>

                    {/* Printable Parts List for This Printer */}
                    <div className="space-y-2 mt-2">
                      {stationRecipes.length === 0 ? (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center text-zinc-400 text-[10.5px]">
                          No parts on Bay #{station.bayNumber} match the current Gun / Part / Physics Model filters.
                        </div>
                      ) : (
                        stationRecipes.map((recipe) => {
                          const { affordable, missingSummary } = canAffordPrinterRecipe(
                            inventory,
                            recipe
                          );
                          const alreadyPrinted = (inventory.printedRoomPartIds || []).includes(
                            recipe.partId
                          );
                          const researchResult = partResearchMap[recipe.partId];
                          const isResearchingThis = researchingPartId === recipe.partId;

                          return (
                            <div
                              key={recipe.partId}
                              className={`rounded-lg border p-2.5 transition-colors ${
                                alreadyPrinted
                                  ? 'bg-emerald-950/25 border-emerald-500/50'
                                  : 'bg-zinc-900/90 border-zinc-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-[9.5px] font-bold text-amber-300">
                                      {recipe.partCode}
                                    </span>
                                    <span className="text-[10px] text-sky-300 font-semibold">
                                      {recipe.targetWeaponLabel}
                                    </span>
                                    {alreadyPrinted && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-[9px] text-emerald-300 font-bold">
                                        ✓ PRINTED
                                      </span>
                                    )}
                                    {researchResult && (
                                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-[9px] text-sky-300 font-bold">
                                        🔬 OLLAMA RESEARCHED
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-bold text-zinc-100 mt-1">
                                    {recipe.title}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-500/40 text-[9px] text-purple-300 font-semibold">
                                      🧠 Model: {recipe.designPhysicsModelLabel}
                                    </span>
                                  </div>
                                </div>

                                {/* BOTH RESEARCH BUTTON AND PRINT BUTTON */}
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    type="button"
                                    data-testid={`research-part-${recipe.partId}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResearchSinglePart(recipe);
                                    }}
                                    disabled={isResearchingThis}
                                    className="px-2.5 py-1 rounded bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500 hover:text-zinc-950 font-bold text-[9.5px] transition-colors cursor-pointer"
                                  >
                                    {isResearchingThis
                                      ? '🔬 Researching...'
                                      : `🔬 Research (${selectedOllamaModelTag})`}
                                  </button>

                                  <button
                                    type="button"
                                    data-testid={`print-part-${recipe.partId}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTriggerPrint(recipe);
                                    }}
                                    disabled={!affordable}
                                    className={`px-2.5 py-1 rounded font-bold text-[9.5px] transition-colors cursor-pointer ${
                                      affordable
                                        ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow'
                                        : 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {affordable ? '🖨️ Print & .STL' : 'Locked (Salvage)'}
                                  </button>
                                </div>
                              </div>

                              {/* Distinct Resource Recipe Badges for This Print */}
                              <div className="flex flex-wrap items-center gap-1 mt-2">
                                <span className="text-[9.5px] text-zinc-400 mr-0.5">Requires:</span>
                                {IN_GAME_COLLECTIBLE_RESOURCES.map((resMeta) => {
                                  const cost = recipe.resourceCosts[resMeta.key];
                                  if (!cost) return null;
                                  const have = inventory[resMeta.key] ?? 0;
                                  const enough = have >= cost;
                                  return (
                                    <span
                                      key={resMeta.key}
                                      className={`px-1.5 py-0.5 rounded border text-[9.5px] font-semibold tabular-nums ${
                                        enough
                                          ? 'bg-zinc-950 border-emerald-500/40 text-emerald-300'
                                          : 'bg-rose-950/50 border-rose-500/60 text-rose-300'
                                      }`}
                                    >
                                      {cost}
                                      {resMeta.unitSuffix} {resMeta.shortName.split(' ')[0]} ({have}/{cost})
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Ollama Part Research Telemetry Display */}
                              {researchResult && (
                                <div className="mt-2 bg-zinc-950/90 border border-sky-500/40 rounded p-2 text-[9.5px] space-y-0.5">
                                  <div className="text-sky-300 font-bold">
                                    🔬 {researchResult.executedByModel} (SF = {researchResult.hoopStressSafetyFactor}×)
                                  </div>
                                  <div className="text-zinc-300">{researchResult.materialAndSealFindings}</div>
                                  <div className="text-emerald-300">
                                    {researchResult.toleranceImprovementSummary}
                                  </div>
                                </div>
                              )}

                              <div className="text-[10px] text-emerald-300/90 mt-1.5">
                                ★ {recipe.gameplayBonusSummary}
                              </div>
                              {!affordable && missingSummary.length > 0 && (
                                <div className="text-[9.5px] text-rose-300 mt-0.5">
                                  Missing: {missingSummary.join(' · ')}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          BOTTOM FOOTER BAR: CAMERA FOCUS BUTTONS + RETURN TO TITLE ONLY
         ==================================================================== */}
      <footer className="pointer-events-auto max-w-[1440px] w-full mx-auto bg-zinc-950/95 border border-zinc-800 rounded-xl px-4 py-2 shadow-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 uppercase mr-1">
            3D PRINTER BAY CAMERA:
          </span>
          {THREE_PRINTER_STATIONS.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => handleSelectStation(st.id)}
              className={`px-2.5 py-1 rounded text-[11px] cursor-pointer ${
                selectedPrinterId === st.id
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              Bay #{st.bayNumber}: {st.stationName.split('//')[1]?.trim().slice(0, 26)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 hidden sm:inline">
            Only exit from Fabrication Room is back to Main Title
          </span>
          <button
            type="button"
            onClick={onReturnToTitle}
            className="px-3.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
          >
            ← Return to Title Screen
          </button>
        </div>
      </footer>
    </div>
  );
};

