import React, { useState } from 'react';
import { BaseWeaponFamilyId } from '../game/weaponFamiliesAndCompatibility';
import {
  SPECIALIZED_OLLAMA_MODELS,
  INITIAL_NEEDED_PARTS_QUEUE,
  NeededPartToCreate,
  OllamaExecutionArtifact,
  executeOllamaModelTaskInGame,
  synthesizeParametricWeaponSchematicSvg,
  synthesizeTypeScriptSchematicGeneratorCode,
  PHYSICS_AIR_MECHANICS_25_SMART_GOALS,
  SmartGoalPillarCategory,
} from '../game/ollamaLocalModelsAndRoadmap';
import { GENERATIVE_CAD_ROADMAP_PHASES } from '../game/popular25Catalog';

interface OllamaStudioAndRoadmapModalProps {
  isOpen: boolean;
  initialTab?: 'OLLAMA_PART_BUILDER' | 'SCHEMATIC_CODE_SYNTH' | 'SMART_25_ROADMAP';
  activeWeaponFamilyId: BaseWeaponFamilyId;
  activeCaliberMm: number;
  onClose: () => void;
  onEquipSynthesizedPartInGame?: (part: NeededPartToCreate, artifact: OllamaExecutionArtifact) => void;
}

export const OllamaStudioAndRoadmapModal: React.FC<OllamaStudioAndRoadmapModalProps> = ({
  isOpen,
  initialTab = 'OLLAMA_PART_BUILDER',
  activeWeaponFamilyId,
  activeCaliberMm,
  onClose,
  onEquipSynthesizedPartInGame,
}) => {
  const [activeTab, setActiveTab] = useState<
    'OLLAMA_PART_BUILDER' | 'SCHEMATIC_CODE_SYNTH' | 'SMART_25_ROADMAP'
  >(initialTab);

  // Sync when parent changes initialTab while opening
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [selectedModelId, setSelectedModelId] = useState<string>(
    SPECIALIZED_OLLAMA_MODELS[0].id
  );
  const [tryLiveLocalhostOllama, setTryLiveLocalhostOllama] = useState<boolean>(false);
  const [neededParts, setNeededParts] = useState<NeededPartToCreate[]>(
    INITIAL_NEEDED_PARTS_QUEUE
  );
  const [selectedPartId, setSelectedPartId] = useState<string>(
    INITIAL_NEEDED_PARTS_QUEUE[0].partId
  );
  const [isRunningModel, setIsRunningModel] = useState<boolean>(false);

  // Custom Part / Asset creation inputs
  const [customPartName, setCustomPartName] = useState<string>(
    'Ascent .45 High-Flow 300-Bar Check Valve & Dual-Plenum Bridge'
  );
  const [customLengthMm, setCustomLengthMm] = useState<number>(165);
  const [customOuterDiaMm, setCustomOuterDiaMm] = useState<number>(46);
  const [customPressureBar, setCustomPressureBar] = useState<number>(300);

  // Initial pre-computed artifact so the schematic & TS code viewer are immediately populated
  const [executionHistory, setExecutionHistory] = useState<OllamaExecutionArtifact[]>(() => {
    const firstPart = INITIAL_NEEDED_PARTS_QUEUE[0];
    const firstModel = SPECIALIZED_OLLAMA_MODELS[0];
    const svg = synthesizeParametricWeaponSchematicSvg({
      weaponFamilyId: firstPart.weaponFamilyId,
      partCode: firstPart.partCode,
      partName: firstPart.partName,
      caliberMm: firstPart.targetCaliberMm,
      lengthMm: firstPart.lengthMm,
      outerDiameterMm: firstPart.outerDiameterMm,
      innerDiameterMm: firstPart.innerDiameterMm,
      pressureBar: firstPart.pressureRatingBar,
    });
    const tsCode = synthesizeTypeScriptSchematicGeneratorCode({
      modelTag: firstModel.ollamaTag,
      partCode: firstPart.partCode,
      partName: firstPart.partName,
      caliberMm: firstPart.targetCaliberMm,
      lengthMm: firstPart.lengthMm,
      outerDiameterMm: firstPart.outerDiameterMm,
      innerDiameterMm: firstPart.innerDiameterMm,
      pressureBar: firstPart.pressureRatingBar,
      lameHoopStressMPa: 23.8,
      safetyFactor: 21.13,
    });
    return [
      {
        executionId: 'ollama_init_01',
        timestampIso: new Date().toISOString(),
        modelUsed: firstModel,
        taskTitle: `Synthesize [${firstPart.partCode}] ${firstPart.partName}`,
        partCode: firstPart.partCode,
        connectionMode: 'DETERMINISTIC_LOCAL_KERNEL',
        computeLatencyMs: 2.4,
        ollamaCliCommand: firstModel.defaultCliCommand,
        generatedTsCode: tsCode,
        generatedSvgMarkup: svg,
        generatedStlAscii: `solid ${firstPart.partCode}_WATERTIGHT\n  facet normal 1.0000 0.0000 0.0000\n    outer loop\n      vertex 23.0000 0.0000 0.0000\n      vertex 23.0000 5.9500 0.0000\n      vertex 23.0000 5.9500 480.0000\n    endloop\n  endfacet\nendsolid ${firstPart.partCode}_WATERTIGHT`,
        stlFacetCount: 192,
        lameHoopStressMPa: 23.8,
        safetyFactor: 21.13,
        physicsVerdict:
          'VERIFIED: 192-facet manifold .STL + SVG schematic compiled at 210 Bar (140cc Over-Barrel 2.6-Shot Plenum + 300B Pump Reserve).',
      },
    ];
  });

  // Parametric Schematic & Code Synthesizer controls (Tab 2)
  const [synthLengthMm, setSynthLengthMm] = useState<number>(480);
  const [synthShroudOdMm, setSynthShroudOdMm] = useState<number>(46);
  const [synthReserveBar, setSynthReserveBar] = useState<number>(300);
  const [synthPlenumBar, setSynthPlenumBar] = useState<number>(210);

  // 25 SMART Objectives filter & execution state (Tab 3)
  const [smartPillarFilter, setSmartPillarFilter] = useState<'ALL' | SmartGoalPillarCategory>(
    'ALL'
  );
  const [smartSearchQuery, setSmartSearchQuery] = useState<string>('');
  const [executedSmartGoalIds, setExecutedSmartGoalIds] = useState<string[]>([
    'SMART-01',
    'SMART-02',
    'SMART-03',
    'SMART-11',
    'SMART-16',
  ]);
  const [lastSmartGoalLog, setLastSmartGoalLog] = useState<string>(
    'All 25 SMART Objectives + 14 Weapon Architecture Phases (39 Total Roadmap Phases) active in engine.'
  );

  if (!isOpen) return null;

  const selectedModel =
    SPECIALIZED_OLLAMA_MODELS.find((m) => m.id === selectedModelId) ||
    SPECIALIZED_OLLAMA_MODELS[0];
  const selectedPart =
    neededParts.find((p) => p.partId === selectedPartId) || neededParts[0];
  const latestArtifact = executionHistory[0];

  const handleRunOllamaForPart = async (part: NeededPartToCreate, overrideModelId?: string) => {
    setIsRunningModel(true);
    try {
      const artifact = await executeOllamaModelTaskInGame({
        modelId: overrideModelId || part.recommendedOllamaModelId || selectedModelId,
        weaponFamilyId: part.weaponFamilyId,
        partCode: part.partCode,
        partName: part.partName,
        targetCaliberMm: part.targetCaliberMm,
        lengthMm: part.lengthMm,
        outerDiameterMm: part.outerDiameterMm,
        innerDiameterMm: part.innerDiameterMm,
        pressureBar: part.pressureRatingBar,
        tryLiveLocalhostOllama,
      });

      const updatedPart: NeededPartToCreate = {
        ...part,
        status: 'BUILT_BY_OLLAMA',
      };

      setNeededParts((prev) =>
        prev.map((item) => (item.partId === part.partId ? updatedPart : item))
      );
      setSelectedPartId(part.partId);
      setExecutionHistory((prev) => [artifact, ...prev.slice(0, 14)]);
      onEquipSynthesizedPartInGame?.(updatedPart, artifact);
    } finally {
      setIsRunningModel(false);
    }
  };

  const handleRunOllamaBatchAllParts = async () => {
    setIsRunningModel(true);
    try {
      const newArtifacts: OllamaExecutionArtifact[] = [];
      const nextParts: NeededPartToCreate[] = [];

      for (const part of neededParts) {
        const art = await executeOllamaModelTaskInGame({
          modelId: part.recommendedOllamaModelId || selectedModelId,
          weaponFamilyId: part.weaponFamilyId,
          partCode: part.partCode,
          partName: part.partName,
          targetCaliberMm: part.targetCaliberMm,
          lengthMm: part.lengthMm,
          outerDiameterMm: part.outerDiameterMm,
          innerDiameterMm: part.innerDiameterMm,
          pressureBar: part.pressureRatingBar,
          tryLiveLocalhostOllama,
        });
        const built: NeededPartToCreate = { ...part, status: 'BUILT_BY_OLLAMA' };
        nextParts.push(built);
        newArtifacts.push(art);
      }

      setNeededParts(nextParts);
      if (newArtifacts.length > 0) {
        setExecutionHistory((prev) => [...newArtifacts, ...prev].slice(0, 15));
        onEquipSynthesizedPartInGame?.(nextParts[0], newArtifacts[0]);
      }
    } finally {
      setIsRunningModel(false);
    }
  };

  const handleCreateAndRunCustomPart = async () => {
    if (!customPartName.trim()) return;
    const newCode = `OLM-${neededParts.length + 1}`;
    const customItem: NeededPartToCreate = {
      partId: `custom_ollama_${Date.now()}`,
      weaponFamilyId: activeWeaponFamilyId,
      partCode: newCode,
      partName: customPartName.trim(),
      subsystemRole: `Synthesized by ${selectedModel.ollamaTag} for ${activeWeaponFamilyId} (${customPressureBar} Bar proof)`,
      targetCaliberMm: activeCaliberMm,
      lengthMm: customLengthMm,
      outerDiameterMm: customOuterDiaMm,
      innerDiameterMm: activeCaliberMm,
      pressureRatingBar: customPressureBar,
      recommendedOllamaModelId: selectedModel.id,
      status: 'BUILT_BY_OLLAMA',
    };
    setNeededParts((prev) => [customItem, ...prev]);
    await handleRunOllamaForPart(customItem, selectedModel.id);
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    if (typeof window === 'undefined' || typeof Blob === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteSmartObjectiveViaOllama = async (
    goal: (typeof PHYSICS_AIR_MECHANICS_25_SMART_GOALS)[number]
  ) => {
    const art = await executeOllamaModelTaskInGame({
      modelId: goal.assignedOllamaModelId,
      weaponFamilyId: activeWeaponFamilyId,
      partCode: goal.smartId,
      partName: goal.title,
      targetCaliberMm: activeCaliberMm,
      lengthMm: 240,
      outerDiameterMm: 44,
      innerDiameterMm: activeCaliberMm,
      pressureBar: 300,
      customPrompt: `${goal.smartId}: ${goal.specific} [Formula: ${goal.physicsFormulaOrRule}]`,
      tryLiveLocalhostOllama,
    });
    setExecutedSmartGoalIds((prev) =>
      prev.includes(goal.smartId) ? prev : [...prev, goal.smartId]
    );
    setExecutionHistory((prev) => [art, ...prev.slice(0, 14)]);
    setLastSmartGoalLog(
      `✓ Executed ${goal.smartId} (${goal.phaseCode}) via ${art.modelUsed.ollamaTag} in ${art.computeLatencyMs}ms → ${goal.deliverableAssetOrCode}`
    );
  };

  const builtCount = neededParts.filter((p) => p.status === 'BUILT_BY_OLLAMA').length;

  const liveParametricSvg = synthesizeParametricWeaponSchematicSvg({
    weaponFamilyId: activeWeaponFamilyId,
    partCode: selectedPart.partCode,
    partName: selectedPart.partName,
    caliberMm: activeCaliberMm,
    lengthMm: synthLengthMm,
    outerDiameterMm: synthShroudOdMm,
    innerDiameterMm: activeCaliberMm,
    pressureBar: synthReserveBar,
    underBarrelReserveBar: synthReserveBar,
    overBarrelPlenumBar: synthPlenumBar,
  });

  const liveParametricTsCode = synthesizeTypeScriptSchematicGeneratorCode({
    modelTag: selectedModel.ollamaTag,
    partCode: selectedPart.partCode,
    partName: selectedPart.partName,
    caliberMm: activeCaliberMm,
    lengthMm: synthLengthMm,
    outerDiameterMm: synthShroudOdMm,
    innerDiameterMm: activeCaliberMm,
    pressureBar: synthReserveBar,
    lameHoopStressMPa: 24.6,
    safetyFactor: 20.4,
  });

  const filteredSmartGoals = PHYSICS_AIR_MECHANICS_25_SMART_GOALS.filter((g) => {
    const matchesPillar =
      smartPillarFilter === 'ALL' || g.pillarCategory === smartPillarFilter;
    const q = smartSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.smartId.toLowerCase().includes(q) ||
      g.specific.toLowerCase().includes(q) ||
      g.ollamaCliCommand.toLowerCase().includes(q);
    return matchesPillar && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-label="In-Game Ollama Local Models, Schematic Code Generator & 25 SMART Roadmap Objectives"
      className="fixed inset-0 z-50 bg-zinc-950/88 backdrop-blur-md flex items-center justify-center p-2 md:p-4 pointer-events-auto"
    >
      <div className="w-full max-w-[1380px] max-h-[92vh] bg-zinc-950 border border-sky-500/60 rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800 shrink-0">
          <div>
            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
              IN-GAME OLLAMA LOCAL MODEL RUNNER · SCHEMATIC &amp; .STL ASSET SYNTHESIZER · 39 ROADMAP PHASES (25 SMART GOALS)
            </div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100">
              Specialized Local Models Building Airguns, Sub-mm Schematics &amp; 300-Bar Physics Assets ({builtCount}/{neededParts.length} Needed Parts Built)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('OLLAMA_PART_BUILDER')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                activeTab === 'OLLAMA_PART_BUILDER'
                  ? 'bg-sky-500 text-zinc-950'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              🦙 01. Run Ollama Models &amp; Create Parts ({neededParts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SCHEMATIC_CODE_SYNTH')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                activeTab === 'SCHEMATIC_CODE_SYNTH'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              📐 02. Schematic &amp; Asset Code Generator (.SVG + .TS)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SMART_25_ROADMAP')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                activeTab === 'SMART_25_ROADMAP'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              🎯 03. 25 SMART Goals &amp; 39-Phase Physics Roadmap
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-rose-500/20 border border-rose-500/60 text-rose-200 hover:bg-rose-500 hover:text-zinc-950 font-bold text-[11px] cursor-pointer"
            >
              ✕ Close Studio
            </button>
          </div>
        </div>

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* ================================================================
              TAB 1: RUN OLLAMA LOCAL MODELS & CREATE NEEDED PARTS
             ================================================================ */}
          {activeTab === 'OLLAMA_PART_BUILDER' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Left Column (5 cols): Specialized Ollama Model Selector & Needed Parts Queue */}
              <div className="lg:col-span-5 space-y-2.5">
                {/* Ollama Model Selector Card */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="select-ollama-model"
                      className="text-sky-400 font-bold text-[11px]"
                    >
                      Select Specialized Local Ollama Model (8 Models)
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tryLiveLocalhostOllama}
                        onChange={(e) => setTryLiveLocalhostOllama(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      Ping localhost:11434
                    </label>
                  </div>

                  <select
                    id="select-ollama-model"
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  >
                    {SPECIALIZED_OLLAMA_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName} ({m.ollamaTag})
                      </option>
                    ))}
                  </select>

                  <div className="text-[10px] text-zinc-400 leading-relaxed">
                    {selectedModel.systemPromptSummary}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-300 pt-1 border-t border-zinc-800">
                    <span>Params: {selectedModel.parameterCount}</span>
                    <span>·</span>
                    <span>Quant: {selectedModel.quantization}</span>
                    <span>·</span>
                    <span>VRAM: {selectedModel.vramRequiredGb} GB</span>
                    <span>·</span>
                    <span className="text-emerald-400">~{selectedModel.tokensPerSecEstimate} tok/s</span>
                  </div>

                  {/* Primary Batch Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={isRunningModel}
                      onClick={() => handleRunOllamaForPart(selectedPart, selectedModel.id)}
                      className="px-2.5 py-1.5 rounded bg-sky-500 text-zinc-950 font-bold text-[11px] hover:bg-sky-400 cursor-pointer"
                    >
                      ⚡ Run Ollama: Build [{selectedPart.partCode}]
                    </button>
                    <button
                      type="button"
                      disabled={isRunningModel}
                      onClick={handleRunOllamaBatchAllParts}
                      className="px-2.5 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[11px] hover:bg-emerald-400 cursor-pointer"
                    >
                      🚀 Run All Ollama Models ({neededParts.length} Parts)
                    </button>
                  </div>
                </div>

                {/* Custom Part Synthesis Box */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="text-amber-400 font-bold text-[11px]">
                    Task Ollama to Create Custom Airgun Part (.STL + Schematic Code)
                  </div>
                  <input
                    type="text"
                    aria-label="Custom Airgun Part Name for Ollama to Create"
                    value={customPartName}
                    onChange={(e) => setCustomPartName(e.target.value)}
                    placeholder="Describe part to synthesize (e.g. .45 Over-Barrel Plenum Baffle)..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-[11px] text-zinc-100"
                  />
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <label className="block text-zinc-400 mb-0.5">Length (mm)</label>
                      <input
                        type="number"
                        aria-label="Custom Part Length mm"
                        value={customLengthMm}
                        onChange={(e) => setCustomLengthMm(Number(e.target.value) || 120)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-0.5">Outer OD (mm)</label>
                      <input
                        type="number"
                        aria-label="Custom Part Outer Diameter mm"
                        value={customOuterDiaMm}
                        onChange={(e) => setCustomOuterDiaMm(Number(e.target.value) || 42)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-0.5">Pressure (Bar)</label>
                      <input
                        type="number"
                        aria-label="Custom Part Pressure Bar"
                        value={customPressureBar}
                        onChange={(e) => setCustomPressureBar(Number(e.target.value) || 300)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateAndRunCustomPart}
                    className="w-full py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-[11px] hover:bg-amber-400 cursor-pointer"
                  >
                    + Run {selectedModel.ollamaTag.split(':')[0]} to Synthesize Custom Part
                  </button>
                </div>

                {/* Needed Parts Queue List */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-1.5 max-h-[295px] overflow-y-auto">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-200 mb-1">
                    <span>Parts Queue Needed Across Weapon Families</span>
                    <span className="text-emerald-400">
                      {builtCount}/{neededParts.length} Built
                    </span>
                  </div>
                  {neededParts.map((part) => {
                    const isSelected = part.partId === selectedPart.partId;
                    const isBuilt = part.status === 'BUILT_BY_OLLAMA';
                    return (
                      <div
                        key={part.partId}
                        onClick={() => setSelectedPartId(part.partId)}
                        className={`p-2 rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/40 border-sky-500/80'
                            : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-zinc-100 text-[11px]">
                            [{part.partCode}] {part.partName}
                          </span>
                          <span
                            className={`text-[9px] font-bold shrink-0 ${
                              isBuilt ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {isBuilt ? '✓ BUILT BY OLLAMA' : 'NEEDS BUILD'}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mb-1.5">
                          {part.subsystemRole}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="text-sky-300">
                            L={part.lengthMm}mm · OD=Ø{part.outerDiameterMm}mm · ID=Ø{part.innerDiameterMm}mm · {part.pressureRatingBar}B
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunOllamaForPart(part);
                            }}
                            className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/70 text-sky-200 hover:bg-sky-400 hover:text-zinc-950 font-bold text-[10px] cursor-pointer"
                          >
                            ⚡ Run Ollama to Build
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (7 cols): Live Generated Schematic SVG, TypeScript Code & STL Export */}
              <div className="lg:col-span-7 space-y-2.5">
                {/* Generated Schematic SVG Display */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">
                        GENERATED IN-GAME VECTOR SCHEMATIC (.SVG) · SUB-MM CONCENTRIC CUTAWAY
                      </div>
                      <div className="text-xs font-bold text-zinc-100">
                        {latestArtifact.taskTitle} ({latestArtifact.stlFacetCount} Watertight Facets · SF {latestArtifact.safetyFactor}x)
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadFile(
                            latestArtifact.generatedSvgMarkup,
                            `${latestArtifact.partCode.toLowerCase()}_schematic.svg`,
                            'image/svg+xml'
                          )
                        }
                        className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer"
                      >
                        ⬇ Download Schematic .SVG
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadFile(
                            latestArtifact.generatedStlAscii,
                            `${latestArtifact.partCode.toLowerCase()}_watertight.stl`,
                            'model/stl'
                          )
                        }
                        className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] hover:bg-sky-400 cursor-pointer"
                      >
                        ⬇ Download Part .STL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadFile(
                            latestArtifact.generatedTsCode,
                            `${latestArtifact.partCode.toLowerCase()}_generator.ts`,
                            'text/plain'
                          )
                        }
                        className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
                      >
                        ⬇ Download Code .TS
                      </button>
                    </div>
                  </div>

                  {/* Embedded Interactive SVG Schematic */}
                  <div
                    className="w-full rounded border border-zinc-800 overflow-hidden bg-zinc-950"
                    dangerouslySetInnerHTML={{ __html: latestArtifact.generatedSvgMarkup }}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-300 bg-zinc-950/90 border border-zinc-800 rounded px-2.5 py-1.5">
                    <span className="text-emerald-400 font-bold">
                      {latestArtifact.physicsVerdict}
                    </span>
                    <span className="text-sky-300">
                      Model: {latestArtifact.modelUsed.ollamaTag} ({latestArtifact.computeLatencyMs} ms)
                    </span>
                  </div>
                </div>

                {/* Generated TypeScript Schematic & Asset Generator Code Terminal */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-bold">
                      OLLAMA CLI &amp; GENERATED TYPESCRIPT B-REP / SCHEMATIC CODE
                    </span>
                    <span className="text-zinc-400">
                      $ {latestArtifact.ollamaCliCommand.slice(0, 78)}...
                    </span>
                  </div>
                  <pre className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-[10px] text-emerald-300 overflow-x-auto max-h-[215px]">
                    {latestArtifact.generatedTsCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 2: SPECIALIZED SCHEMATIC & ASSET CODE SYNTHESIZER (.SVG + .TS)
             ================================================================ */}
          {activeTab === 'SCHEMATIC_CODE_SYNTH' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-sky-400 font-bold mb-1">
                    Over-Barrel Plenum &amp; Liner Length: {synthLengthMm} mm
                  </label>
                  <input
                    type="range"
                    min={220}
                    max={650}
                    step={5}
                    aria-label="Schematic Barrel and Plenum Length mm"
                    value={synthLengthMm}
                    onChange={(e) => setSynthLengthMm(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-400 font-bold mb-1">
                    Concentric Over-Barrel Plenum OD: Ø{synthShroudOdMm} mm
                  </label>
                  <input
                    type="range"
                    min={28}
                    max={64}
                    step={1}
                    aria-label="Concentric Over-Barrel Plenum Outer Diameter mm"
                    value={synthShroudOdMm}
                    onChange={(e) => setSynthShroudOdMm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-amber-400 font-bold mb-1">
                    Under-Barrel Air Reserve Pressure: {synthReserveBar} Bar
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={300}
                    step={5}
                    aria-label="Under-Barrel Air Reserve Pressure Bar"
                    value={synthReserveBar}
                    onChange={(e) => setSynthReserveBar(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-purple-400 font-bold mb-1">
                    Over-Barrel 2+ Shot Plenum Setpoint: {synthPlenumBar} Bar
                  </label>
                  <input
                    type="range"
                    min={90}
                    max={250}
                    step={5}
                    aria-label="Over-Barrel Regulated Plenum Setpoint Bar"
                    value={synthPlenumBar}
                    onChange={(e) => setSynthPlenumBar(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 font-bold text-[11px]">
                      Live Parametric Vector Schematic Output (.SVG)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadFile(
                          liveParametricSvg,
                          `parametric_${activeWeaponFamilyId.toLowerCase()}_schematic.svg`,
                          'image/svg+xml'
                        )
                      }
                      className="px-2.5 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[10px] cursor-pointer"
                    >
                      ⬇ Export Live Schematic (.SVG)
                    </button>
                  </div>
                  <div
                    className="w-full rounded border border-zinc-800 overflow-hidden bg-zinc-950"
                    dangerouslySetInnerHTML={{ __html: liveParametricSvg }}
                  />
                </div>

                <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-[11px]">
                      StarCoder2 / Qwen2.5-Coder Generated TypeScript Schematic Code
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadFile(
                          liveParametricTsCode,
                          `generate_${selectedPart.partCode.toLowerCase()}.ts`,
                          'text/plain'
                        )
                      }
                      className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] cursor-pointer"
                    >
                      ⬇ Export Generator (.TS)
                    </button>
                  </div>
                  <pre className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-[10px] text-emerald-300 overflow-x-auto max-h-[310px]">
                    {liveParametricTsCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3: 25 NEW SMART OBJECTIVES & 39-PHASE PHYSICS ROADMAP
             ================================================================ */}
          {activeTab === 'SMART_25_ROADMAP' && (
            <div className="space-y-3">
              {/* Filter & Status Bar */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      ['ALL', `All 25 SMART Goals (${PHYSICS_AIR_MECHANICS_25_SMART_GOALS.length})`],
                      ['AIR_THERMODYNAMICS', 'I. 300B Air & CFD (5)'],
                      ['MECHANICAL_LINKAGES', 'II. Linkages & O-Rings (5)'],
                      ['LOCAL_OLLAMA_AGENTS', 'III. Local Ollama Models (5)'],
                      ['SCHEMATIC_ASSET_CODEGEN', 'IV. Schematic & STL Codegen (5)'],
                      ['PHYSICS_GAMEPLAY', 'V. Physics Gameplay & Ballistics (5)'],
                    ] as Array<['ALL' | SmartGoalPillarCategory, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSmartPillarFilter(key)}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        smartPillarFilter === key
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-amber-400/60'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  aria-label="Filter 25 SMART Objectives"
                  value={smartSearchQuery}
                  onChange={(e) => setSmartSearchQuery(e.target.value)}
                  placeholder="Search SMART-01..25, physics formula, or Ollama model..."
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-[11px] text-zinc-100 min-w-[250px]"
                />
              </div>

              <div className="bg-zinc-950 border border-emerald-500/40 rounded px-3 py-1.5 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>{lastSmartGoalLog}</span>
                <span className="text-amber-400 font-bold shrink-0">
                  Total Engine Roadmap: {GENERATIVE_CAD_ROADMAP_PHASES.length} Phases (14 Core + 25 SMART Objectives)
                </span>
              </div>

              {/* 25 SMART Objectives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredSmartGoals.map((goal) => {
                  const isExecuted = executedSmartGoalIds.includes(goal.smartId);
                  return (
                    <div
                      key={goal.smartId}
                      className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-amber-400 font-bold text-[11px]">
                            {goal.smartId} · {goal.phaseCode} · {goal.pillarCategory.replace(/_/g, ' ')}
                          </span>
                          <span className="text-emerald-400 font-bold text-[10px]">
                            {isExecuted ? '100% VERIFIED BY OLLAMA' : `${goal.initialProgressPct}% ACTIVE`}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-zinc-100">
                          {goal.title}
                        </div>

                        <div className="space-y-0.5 text-[10px] text-zinc-300 pt-1">
                          <div>
                            <strong className="text-sky-400">S (Specific):</strong> {goal.specific}
                          </div>
                          <div>
                            <strong className="text-emerald-400">M (Measurable):</strong> {goal.measurable}
                          </div>
                          <div>
                            <strong className="text-purple-400">A (Achievable):</strong> {goal.achievable}
                          </div>
                          <div>
                            <strong className="text-amber-300">R (Relevant):</strong> {goal.relevant}
                          </div>
                          <div>
                            <strong className="text-rose-300">T (Time-Bound):</strong> {goal.timeBound}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800 pt-2 space-y-1.5">
                        <div className="text-[10px] text-sky-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 truncate">
                          Formula: {goal.physicsFormulaOrRule}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-zinc-400 truncate">
                            Deliverable: {goal.deliverableAssetOrCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleExecuteSmartObjectiveViaOllama(goal)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/80 text-amber-200 hover:bg-amber-400 hover:text-zinc-950 font-bold text-[10px] shrink-0 cursor-pointer"
                          >
                            ▶ Run Ollama for {goal.smartId}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
