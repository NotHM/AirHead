import React, { useState } from 'react';
import {
  ElonAlgoVersionState,
  HERMES_ROOT_ORCHESTRATOR_PROMPT,
  ELON_FIVE_STEP_ALGORITHM,
  VERTEX_AI_RAG_DATA_STORES,
  VERTEX_OPENAPI_CLOUD_RUN_TOOLS,
  HermesTriggerCategory,
  HermesSubAgentId,
  routeHermesOperationTrigger,
  calculateFrontDeskLeadFitScore,
  ENTERPRISE_SCHEDULED_TASK_USE_CASES,
  ComputeBudgetTierId,
  buildComputeBudgetDailyAndWeeklySmartPlan,
} from '../game/hermesVertexOrchestratorAndElonAlgo';

interface HermesVertexAndElonModalProps {
  isOpen: boolean;
  elonVersionState: ElonAlgoVersionState;
  onRunElonVersionUpgrade: () => void;
  onResolveHitlWebhook: (
    approvalId: string,
    decision: 'APPROVED_WEBHOOK_RECEIVED' | 'REJECTED_BY_HUMAN'
  ) => void;
  onClose: () => void;
}

export const HermesVertexAndElonModal: React.FC<HermesVertexAndElonModalProps> = ({
  isOpen,
  elonVersionState,
  onRunElonVersionUpgrade,
  onResolveHitlWebhook,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'ELON_ALGO_SMART_GOALS'
    | 'DAILY_SELF_MAINTAINING_ROUTINES'
    | 'HERMES_ROUTER_8_AGENTS'
    | 'HITL_GATE_AND_RAG_TOOLS'
  >('ELON_ALGO_SMART_GOALS');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<
    'ALL' | 'Root_Hermes_Orchestrator' | HermesSubAgentId
  >('ALL');
  const [selectedTriggerTest, setSelectedTriggerTest] = useState<HermesTriggerCategory>(
    'INBOUND_LEAD_WEB_CHAT_MISSED_CALL'
  );
  const [leadUnits, setLeadUnits] = useState<number>(8);
  const [leadBudgetUsd, setLeadBudgetUsd] = useState<number>(22000);
  const [leadStartDays, setLeadStartDays] = useState<number>(12);
  const [leadIsVoicemail, setLeadIsVoicemail] = useState<boolean>(true);
  const [copiedPromptAgentId, setCopiedPromptAgentId] = useState<string | null>(null);
  const [computeBudgetTier, setComputeBudgetTier] = useState<ComputeBudgetTierId>(
    'BALANCED_1B_4B_SWARM'
  );
  const [customVramGb, setCustomVramGb] = useState<number>(6);
  const [customGpuMinutesPerDay, setCustomGpuMinutesPerDay] = useState<number>(60);

  if (!isOpen) return null;

  const computeBudgetPlan = buildComputeBudgetDailyAndWeeklySmartPlan(
    computeBudgetTier,
    customVramGb,
    customGpuMinutesPerDay,
    elonVersionState.runCount
  );

  const routingResult = routeHermesOperationTrigger(selectedTriggerTest);
  const fitScoreResult = calculateFrontDeskLeadFitScore({
    teamOrOrderSizeUnits: leadUnits,
    roughBudgetUsd: leadBudgetUsd,
    targetStartDays: leadStartDays,
    isMissedCallVoicemail: leadIsVoicemail,
  });

  const handleCopyPrompt = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedPromptAgentId(id);
    setTimeout(() => setCopiedPromptAgentId(null), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-5 pointer-events-auto"
      role="dialog"
      aria-label="Hermes Multi-Agent Vertex AI OS and Elon 5-Step Algorithm Studio"
    >
      <div className="w-full max-w-[1440px] max-h-[92vh] bg-zinc-950 border-2 border-amber-500/70 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-zinc-900/95 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono font-bold text-[11px]">
                {elonVersionState.versionLabel} · RUN #{elonVersionState.runCount}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                VERTEX AI AGENT BUILDER ("HERMES" ROUTER + 8 SUB-AGENTS) · ELON&apos;S 5-STEP ALGO
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-zinc-100 mt-0.5">
              Hierarchical Multi-Agent OS &amp; Continuous Sub-mm Weapon Upgrade Engine (Write 3 SMART Goals → Accomplish 2 Every Run)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRunElonVersionUpgrade}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer shadow-lg"
            >
              ⚡ Run Elon&apos;s Algo + 9 Agents (+1 Version: Write 3 / Accomplish 2 Goals)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-amber-500 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-400 cursor-pointer"
            >
              Close Studio [ESC]
            </button>
          </div>
        </div>

        {/* Version Improvement Telemetry Bar */}
        <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 grid grid-cols-2 md:grid-cols-6 gap-2 font-mono text-[11px]">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded px-2.5 py-1.5">
            <div className="text-[9px] text-zinc-400">ACTIVE VERSION</div>
            <div className="text-amber-300 font-bold">
              {elonVersionState.versionLabel} ({elonVersionState.runCount} Runs)
            </div>
          </div>
          <div className="bg-zinc-950/90 border border-emerald-500/40 rounded px-2.5 py-1.5">
            <div className="text-[9px] text-emerald-300">SMART GOALS (2/3 RULE)</div>
            <div className="text-emerald-400 font-bold">
              {elonVersionState.totalSmartGoalsAccomplishedAcrossRuns} /{' '}
              {elonVersionState.totalSmartGoalsWrittenAcrossRuns} Accomplished
            </div>
          </div>
          <div className="bg-zinc-950/90 border border-sky-500/40 rounded px-2.5 py-1.5">
            <div className="text-[9px] text-sky-300">SUB-MM CAD PRECISION</div>
            <div className="text-sky-400 font-bold">
              ±{elonVersionState.subMmCadToleranceMm}mm B-Rep STL
            </div>
          </div>
          <div className="bg-zinc-950/90 border border-cyan-500/40 rounded px-2.5 py-1.5">
            <div className="text-[9px] text-cyan-300">210B PLENUM EFFICIENCY</div>
            <div className="text-cyan-400 font-bold">
              {elonVersionState.overBarrelPlenumEfficiencyPct}% (2.6 Shots)
            </div>
          </div>
          <div className="bg-zinc-950/90 border border-amber-500/40 rounded px-2.5 py-1.5">
            <div className="text-[9px] text-amber-300">300B CHECK VALVE LOCK</div>
            <div className="text-amber-400 font-bold">
              {elonVersionState.underBarrel300BCheckValveLockMs} ms Seal
            </div>
          </div>
          <div className="bg-zinc-950/90 border border-fuchsia-500/40 rounded px-2.5 py-1.5">
            <div className="text-[9px] text-fuchsia-300">WEBGL / STL SLICER</div>
            <div className="text-fuchsia-400 font-bold">
              {elonVersionState.stlMeshSlicingFrameTimeMs} ms (60 FPS)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ELON_ALGO_SMART_GOALS')}
            className={`px-3 py-1.5 rounded border cursor-pointer font-bold ${
              activeTab === 'ELON_ALGO_SMART_GOALS'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            01. Elon&apos;s 5-Step Algo &amp; 27 SMART Goals (2/3 Per Agent)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DAILY_SELF_MAINTAINING_ROUTINES')}
            className={`px-3 py-1.5 rounded border cursor-pointer font-bold ${
              activeTab === 'DAILY_SELF_MAINTAINING_ROUTINES'
                ? 'bg-fuchsia-500 text-zinc-950 border-fuchsia-400'
                : 'bg-zinc-900 border-zinc-700 text-fuchsia-300 hover:text-white'
            }`}
          >
            02. Self-Maintaining Daily Routines (/schedule · ≥1 Cycle/Day · 5 PR Trucks)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HERMES_ROUTER_8_AGENTS')}
            className={`px-3 py-1.5 rounded border cursor-pointer font-bold ${
              activeTab === 'HERMES_ROUTER_8_AGENTS'
                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            03. Root &quot;Hermes&quot; Orchestrator + 8 Sub-Agent Prompts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HITL_GATE_AND_RAG_TOOLS')}
            className={`px-3 py-1.5 rounded border cursor-pointer font-bold ${
              activeTab === 'HITL_GATE_AND_RAG_TOOLS'
                ? 'bg-sky-500 text-zinc-950 border-sky-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            04. Mandatory HITL #approvals Gate &amp; Vertex RAG/OpenAPI Tools
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* ================================================================= */}
          {/* TAB 1: ELON'S 5-STEP ALGO & 3 SMART GOALS (ACCOMPLISH 2 EVERY RUN) */}
          {/* ================================================================= */}
          {activeTab === 'ELON_ALGO_SMART_GOALS' && (
            <div className="space-y-4">
              {/* Elon's 5-Step Algorithm Strip */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                    ELON&apos;S 5-STEP ENGINEERING ALGORITHM (APPLIED EVERY VERSION RUN)
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300">
                    Guaranteed gradual improvement every version: {elonVersionState.versionLabel}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  {ELON_FIVE_STEP_ALGORITHM.map((step) => (
                    <div
                      key={step.stepId}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-amber-300 mb-1">{step.title}</div>
                        <p className="text-[11px] text-zinc-400 leading-snug mb-2">
                          {step.appliedToPneumaticWeaponsAndOs}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded px-2 py-1">
                        {step.currentVersionGainLabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Version Run Highlights */}
              <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3">
                <div className="text-[11px] font-mono font-bold text-emerald-300 uppercase mb-1.5">
                  LATEST VERSION RUN ({elonVersionState.versionLabel}) — 9 AGENTS × 3 SMART GOALS WRITTEN = 27 TOTAL · 18 ACCOMPLISHED (2 PER AGENT)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-zinc-200 font-mono">
                  {elonVersionState.lastRunAccomplishedHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter by Agent */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                <span className="text-zinc-400 mr-1">Filter Agent SMART Goals:</span>
                <button
                  type="button"
                  onClick={() => setSelectedAgentFilter('ALL')}
                  className={`px-2.5 py-1 rounded border cursor-pointer ${
                    selectedAgentFilter === 'ALL'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  All 9 Agents (27 Goals)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAgentFilter('Root_Hermes_Orchestrator')}
                  className={`px-2.5 py-1 rounded border cursor-pointer ${
                    selectedAgentFilter === 'Root_Hermes_Orchestrator'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  Root Hermes (2/3 Done)
                </button>
                {elonVersionState.subAgents.map((sa) => (
                  <button
                    key={sa.id}
                    type="button"
                    onClick={() => setSelectedAgentFilter(sa.id)}
                    className={`px-2.5 py-1 rounded border cursor-pointer ${
                      selectedAgentFilter === sa.id
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    #{sa.number} {sa.id.replace('_Agent', '')} (2/3)
                  </button>
                ))}
              </div>

              {/* Agent SMART Goals Cards (Each showing 3 SMART Goals: 2 Accomplished, 1 Queued) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {(selectedAgentFilter === 'ALL' ||
                  selectedAgentFilter === 'Root_Hermes_Orchestrator') && (
                  <div className="bg-zinc-900/90 border border-amber-500/50 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 mr-2">
                          ROOT ORCHESTRATOR
                        </span>
                        <span className="text-sm font-bold text-zinc-100">
                          The &quot;Hermes&quot; Central Operations Router
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        2 / 3 SMART Accomplished
                      </span>
                    </div>
                    <div className="space-y-2">
                      {elonVersionState.rootOrchestratorSmartGoals.map((g) => (
                        <div
                          key={g.goalId}
                          className={`p-2.5 rounded-lg border text-xs ${
                            g.status === 'ACCOMPLISHED_THIS_RUN'
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-100'
                              : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 font-mono text-[10px] mb-1">
                            <span className="font-bold text-amber-300">
                              SMART GOAL #{g.goalIndexInRun} · {g.elonStepApplied}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                g.status === 'ACCOMPLISHED_THIS_RUN'
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : 'bg-zinc-800 text-amber-300'
                              }`}
                            >
                              {g.status === 'ACCOMPLISHED_THIS_RUN'
                                ? '✓ ACCOMPLISHED THIS RUN'
                                : '→ QUEUED NEXT RUN'}
                            </span>
                          </div>
                          <div className="font-semibold mb-1">{g.specificObjective}</div>
                          <div className="text-[11px] font-mono text-sky-300">
                            Measurable Target: {g.measurableTarget}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-300 mt-0.5">
                            Result Delta: {g.metricDeltaSummary}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {elonVersionState.subAgents
                  .filter(
                    (sa) => selectedAgentFilter === 'ALL' || selectedAgentFilter === sa.id
                  )
                  .map((sa) => (
                    <div
                      key={sa.id}
                      className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 mr-2">
                            SUB-AGENT #{sa.number}
                          </span>
                          <span className="text-sm font-bold text-zinc-100">{sa.id}</span>
                          <span className="text-xs text-zinc-400 ml-2">
                            ({sa.departmentRole})
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          2 / 3 Accomplished (Total: {sa.totalGoalsAccomplished})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sa.activeSmartGoals.map((g) => (
                          <div
                            key={g.goalId}
                            className={`p-2.5 rounded-lg border text-xs ${
                              g.status === 'ACCOMPLISHED_THIS_RUN'
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-100'
                                : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 font-mono text-[10px] mb-1">
                              <span className="font-bold text-sky-300">
                                SMART GOAL #{g.goalIndexInRun} · {g.elonStepApplied}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold ${
                                  g.status === 'ACCOMPLISHED_THIS_RUN'
                                    ? 'bg-emerald-500 text-zinc-950'
                                    : 'bg-zinc-800 text-amber-300'
                                }`}
                              >
                                {g.status === 'ACCOMPLISHED_THIS_RUN'
                                  ? '✓ ACCOMPLISHED THIS RUN'
                                  : '→ QUEUED NEXT RUN'}
                              </span>
                            </div>
                            <div className="font-semibold mb-1">{g.specificObjective}</div>
                            <div className="text-[11px] font-mono text-sky-300">
                              Measurable: {g.measurableTarget}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-300 mt-0.5">
                              Delta: {g.metricDeltaSummary}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ROOT "HERMES" ORCHESTRATOR + 8 SUB-AGENT VERTEX AI PROMPTS */}
          {/* ================================================================= */}
          {activeTab === 'HERMES_ROUTER_8_AGENTS' && (
            <div className="space-y-4">
              {/* Root Orchestrator Prompt Card */}
              <div className="bg-zinc-900 border-2 border-amber-500/60 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="text-xs font-mono uppercase text-amber-400 font-bold">
                      1. ROOT ORCHESTRATOR PROMPT (THE &quot;HERMES&quot; ROUTER)
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      Paste into Goal &amp; Instructions of your Main Coordinating Agent in Vertex AI Agent Builder
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyPrompt('Root_Hermes', HERMES_ROOT_ORCHESTRATOR_PROMPT)
                    }
                    className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-400 cursor-pointer"
                  >
                    {copiedPromptAgentId === 'Root_Hermes'
                      ? '✓ Copied Root Prompt!'
                      : 'Copy Hermes Root Prompt'}
                  </button>
                </div>
                <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {HERMES_ROOT_ORCHESTRATOR_PROMPT}
                </pre>
              </div>

              {/* 8 Departmental Sub-Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {elonVersionState.subAgents.map((sa) => (
                  <div
                    key={sa.id}
                    className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div>
                          <span className="text-xs font-mono font-bold text-sky-400">
                            {sa.displayName}
                          </span>
                          <div className="text-xs font-bold text-zinc-200">
                            {sa.departmentRole}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPrompt(sa.id, sa.systemPromptInstructions)
                          }
                          className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-300 font-mono text-[11px] hover:bg-zinc-700 cursor-pointer"
                        >
                          {copiedPromptAgentId === sa.id ? '✓ Copied' : 'Copy Prompt'}
                        </button>
                      </div>

                      <div className="text-[11px] font-mono text-amber-300 mb-2">
                        Routing Trigger: {sa.routingTriggerDescription}
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-zinc-200 leading-relaxed mb-2">
                        {sa.systemPromptInstructions}
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="text-emerald-300">
                        <span className="text-zinc-400">RAG Data Stores:</span>{' '}
                        {sa.connectedDataStores.join(', ')}
                      </div>
                      <div className="text-sky-300">
                        <span className="text-zinc-400">OpenAPI / Cloud Run Tools:</span>{' '}
                        {sa.connectedTools.join(' · ')}
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-zinc-400">Weapon CAD Coupling:</span>{' '}
                        {sa.weaponCadAndAirflowCoupling}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: MANDATORY HITL #APPROVALS GATE, ROUTER SIM & VERTEX TOOLS  */}
          {/* ================================================================= */}
          {activeTab === 'HITL_GATE_AND_RAG_TOOLS' && (
            <div className="space-y-4">
              {/* Interactive Router + Front_Desk_Agent Lead Fit Score Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-2">
                    INTERACTIVE &quot;HERMES&quot; ROUTING &amp; GUARDRAIL SIMULATOR
                  </div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                    Select Incoming Client / Internal Trigger Event:
                  </label>
                  <select
                    aria-label="Select Incoming Client or Internal Trigger Event"
                    value={selectedTriggerTest}
                    onChange={(e) =>
                      setSelectedTriggerTest(e.target.value as HermesTriggerCategory)
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 mb-3"
                  >
                    <option value="INBOUND_LEAD_WEB_CHAT_MISSED_CALL">
                      Inbound Leads, Web Chat, or Missed Calls → Front_Desk_Agent
                    </option>
                    <option value="COMPLETED_DISCOVERY_CALL_PRICING">
                      Completed Discovery Calls or Pricing Requests → Quotes_Proposals_Agent
                    </option>
                    <option value="MEETING_RECORDING_TRANSCRIPT">
                      Meeting Recordings &amp; Transcripts → Meetings_Calls_Agent
                    </option>
                    <option value="PROJECT_COMPLETION_BILLING_EVENT">
                      Project Completion or Billing Events → Payments_Collections_Agent
                    </option>
                    <option value="INTERNAL_DOCUMENT_SOP_QUERY">
                      Internal Document Queries &amp; SOPs → Company_Brain_Agent
                    </option>
                    <option value="EMAIL_TRIAGE_TODO_SCHEDULING">
                      Email Triage, To-Dos &amp; Scheduling → Inbox_Tasks_Agent
                    </option>
                    <option value="EMPLOYEE_ONBOARDING_LEAVE_EQUIPMENT">
                      Employee Onboarding, Leave &amp; Equipment → HR_Onboarding_Agent
                    </option>
                    <option value="DAILY_METRICS_8AM_SCHEDULED_TRIGGER">
                      Daily Metrics &amp; Scheduled 8:00 AM Triggers → Reporting_Insights_Agent
                    </option>
                  </select>

                  <div className="bg-zinc-950 border border-amber-500/40 rounded-lg p-3 font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Routed Sub-Agent:</span>
                      <span className="text-amber-300 font-bold">
                        {routingResult.routedAgentId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Strict Data Privacy:</span>
                      <span className="text-emerald-400 font-bold">
                        {routingResult.privacyGuardrailStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Mandatory HITL Gate Required:</span>
                      <span
                        className={
                          routingResult.requiresHitlGate
                            ? 'text-rose-400 font-bold'
                            : 'text-sky-300 font-bold'
                        }
                      >
                        {routingResult.requiresHitlGate
                          ? 'YES — BLOCKED UNTIL #approvals WEBHOOK'
                          : 'INTERNAL / AUTOMATED QUALIFICATION'}
                      </span>
                    </div>
                    <div className="text-zinc-200 pt-1 border-t border-zinc-800">
                      {routingResult.routingSummary}
                    </div>
                  </div>
                </div>

                {/* Front_Desk_Agent Lead Fit Score Simulator */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2">
                    SUB-AGENT 1: FRONT_DESK_AGENT LEAD FIT SCORE CALCULATOR (≥ 75 QUALIFIED)
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 font-mono text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        Team / Order Units
                      </label>
                      <input
                        type="number"
                        aria-label="Team or Order Units"
                        value={leadUnits}
                        min={1}
                        max={100}
                        onChange={(e) => setLeadUnits(Number(e.target.value) || 1)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        Rough Budget ($ USD)
                      </label>
                      <input
                        type="number"
                        aria-label="Rough Budget USD"
                        value={leadBudgetUsd}
                        step={1000}
                        onChange={(e) => setLeadBudgetUsd(Number(e.target.value) || 0)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        Target Start (Days)
                      </label>
                      <input
                        type="number"
                        aria-label="Target Start Days"
                        value={leadStartDays}
                        min={1}
                        max={180}
                        onChange={(e) => setLeadStartDays(Number(e.target.value) || 30)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leadIsVoicemail}
                      onChange={(e) => setLeadIsVoicemail(e.target.checked)}
                    />
                    Triggered by Missed Call / Voicemail (Transcribe via Speech-to-Text + Send SMS Booking Link)
                  </label>

                  <div className="bg-zinc-950 border border-emerald-500/40 rounded-lg p-3 font-mono text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-400">Calculated Lead Fit Score:</span>
                      <span
                        className={`text-sm font-bold ${
                          fitScoreResult.fitScore >= 75
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {fitScoreResult.fitScore} / 100 ({fitScoreResult.crmQualificationStatus})
                      </span>
                    </div>
                    <div className="text-zinc-200">{fitScoreResult.responseSummary}</div>
                  </div>
                </div>
              </div>

              {/* Mandatory Human-in-the-Loop (HITL) #approvals Queue */}
              <div className="bg-zinc-900 border border-rose-500/50 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs font-mono uppercase text-rose-400 font-bold">
                      MANDATORY HUMAN-IN-THE-LOOP (HITL) APPROVAL GATE — GOOGLE CHAT #approvals CHANNEL
                    </div>
                    <div className="text-xs text-zinc-300">
                      Never dispatches external proposals, contracts, invoices, or emails without explicit human sign-off. Internal profit margins are hidden externally.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {elonVersionState.hitlApprovalQueue.map((card) => (
                    <div
                      key={card.approvalId}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-bold">
                          {card.channelName} · {card.sourceAgentId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            card.webhookStatus === 'APPROVED_WEBHOOK_RECEIVED'
                              ? 'bg-emerald-500 text-zinc-950'
                              : card.webhookStatus === 'REJECTED_BY_HUMAN'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {card.webhookStatus}
                        </span>
                      </div>

                      <div className="text-zinc-100 font-bold">{card.clientName}</div>
                      <div className="text-zinc-300 text-[11px]">{card.projectScopeSummary}</div>

                      <div className="grid grid-cols-3 gap-2 bg-zinc-900 p-2 rounded border border-zinc-800">
                        <div>
                          <div className="text-[9px] text-zinc-400">TOTAL QUOTE</div>
                          <div className="text-emerald-400 font-bold">
                            ${card.totalQuoteValueUsd.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-zinc-400">EST. MARGIN (INTERNAL)</div>
                          <div className="text-amber-300 font-bold">
                            {card.estimatedMarginPct}% [REDACTED EXT]
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-zinc-400">WON DEAL SIMILARITY</div>
                          <div className="text-sky-300 font-bold">
                            {card.wonDealSimilarityScorePct}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-zinc-400">
                          CRM Status:{' '}
                          <strong className="text-zinc-100">{card.crmDealStatus}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onResolveHitlWebhook(
                                card.approvalId,
                                'APPROVED_WEBHOOK_RECEIVED'
                              )
                            }
                            className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[11px] hover:bg-emerald-400 cursor-pointer"
                          >
                            ✓ Send APPROVED Webhook
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onResolveHitlWebhook(card.approvalId, 'REJECTED_BY_HUMAN')
                            }
                            className="px-2.5 py-1 rounded bg-zinc-800 text-rose-300 border border-rose-500/40 font-bold text-[11px] hover:bg-zinc-700 cursor-pointer"
                          >
                            Hold / Revise
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Vertex AI Search (RAG Data Stores) & OpenAPI / Cloud Run Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase text-sky-400 font-bold mb-2">
                    VERTEX AI SEARCH (RAG DATA STORES)
                  </div>
                  <div className="space-y-2">
                    {VERTEX_AI_RAG_DATA_STORES.map((ds) => (
                      <div
                        key={ds.id}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs"
                      >
                        <div className="font-mono font-bold text-sky-300">{ds.name}</div>
                        <div className="text-[11px] font-mono text-amber-300 mb-1">
                          Files: {ds.sourceFiles.join(', ')}
                        </div>
                        <div className="text-zinc-300 text-[11px] mb-1">{ds.description}</div>
                        <div className="text-[10px] font-mono text-emerald-400">
                          Guardrail: {ds.PrivacyGuardrail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-2">
                    OPENAPI / CLOUD RUN &amp; WORKSPACE TOOLS
                  </div>
                  <div className="space-y-2">
                    {VERTEX_OPENAPI_CLOUD_RUN_TOOLS.map((tool) => (
                      <div
                        key={tool.id}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-amber-300">{tool.name}</span>
                          <span className="text-[10px] text-zinc-400">{tool.endpointType}</span>
                        </div>
                        <div className="text-zinc-300 text-[11px] my-1">{tool.purpose}</div>
                        <div className="text-[10px] font-mono text-sky-300">
                          Connected Agents: {tool.connectedAgents.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: SELF-MAINTAINING DAILY ROUTINES (/schedule & /loop · >=1/Day) */}
          {/* ================================================================= */}
          {activeTab === 'DAILY_SELF_MAINTAINING_ROUTINES' && (
            <div className="space-y-4">
              {/* Top Banner: Guaranteed >= 1 Cycle Per Day + Pixel Agent & PR Truck Conveyor */}
              <div className="bg-zinc-900 border-2 border-fuchsia-500/60 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs font-mono uppercase text-fuchsia-400 font-bold">
                      SELF-MAINTAINING CODEBASE &amp; CAD ENGINE · GUARANTEED ≥ 1 CYCLE PER DAY (/schedule &amp; /loop)
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      Date: {elonVersionState.lastDailyCycleDateYmd} · Cycles Completed Today:{' '}
                      <span className="text-emerald-400">
                        {elonVersionState.dailyCyclesCompletedToday} (Target: ≥{elonVersionState.minimumCyclesPerDayTarget}/day · {elonVersionState.activeRoutinesPerDayCount} Daily Routines Active across CLI, iOS, Android &amp; Desktop)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onRunElonVersionUpgrade}
                    className="px-3.5 py-2 rounded-lg bg-fuchsia-500 text-zinc-950 font-mono text-xs font-bold hover:bg-fuchsia-400 cursor-pointer shadow"
                  >
                    🚀 Run All 21 Agents Now (+5 PR Trucks · +1 Version · Update SMART Schedule)
                  </button>
                </div>

                {/* Compute Budget Daily (Mon-Sun) & Weekly (W1-W4) SMART Goals Planner */}
                <div className="bg-zinc-950 border border-amber-500/50 rounded-lg p-3 mb-3 font-mono text-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-amber-300 font-bold uppercase">
                      🎯 COMPUTE-BUDGET DAILY (MON–SUN) &amp; WEEKLY (W1–W4) SMART GOALS PLANNER
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          ['EDGE_1B_SAVER', 'Eco Edge (2GB VRAM · 20m/day)'],
                          ['BALANCED_1B_4B_SWARM', 'Balanced 1B+4B (6GB VRAM · 60m/day)'],
                          ['MAX_4B_CLOUD_ARGON', 'Max 4B+Argon (16GB VRAM · 180m/day)'],
                        ] as Array<[ComputeBudgetTierId, string]>
                      ).map(([tKey, tLabel]) => (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => {
                            setComputeBudgetTier(tKey);
                            setCustomVramGb(
                              tKey === 'EDGE_1B_SAVER' ? 2 : tKey === 'BALANCED_1B_4B_SWARM' ? 6 : 16
                            );
                            setCustomGpuMinutesPerDay(
                              tKey === 'EDGE_1B_SAVER'
                                ? 20
                                : tKey === 'BALANCED_1B_4B_SWARM'
                                ? 60
                                : 180
                            );
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                            computeBudgetTier === tKey
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {tLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-300">
                    {computeBudgetPlan.budgetEfficiencySummary} ({computeBudgetPlan.estimatedTokensPerDay})
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {computeBudgetPlan.weeklySmartMilestones.map((wk) => (
                      <div
                        key={wk.weekNumber}
                        className="bg-zinc-900 border border-sky-500/30 rounded p-2 text-[10.5px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-300">{wk.weekTitle}</span>
                          <span className="text-emerald-400 font-bold">{wk.completionPct}%</span>
                        </div>
                        <div className="text-[9.5px] text-amber-300">{wk.weeklyComputeAllocation}</div>
                        <div className="text-zinc-200">{wk.specificObjective}</div>
                        <div className="text-emerald-300">KPI: {wk.measurableOutcome}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Pull Request Truck Conveyor across CLI / iOS / Android / Desktop */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center justify-between">
                    <span>
                      DAILY PULL REQUEST CONVEYOR TRUCKS (STATIC + DYNAMIC ANALYSIS ACROSS CLI · iOS · ANDROID · DESKTOP)
                    </span>
                    <span className="text-emerald-400 font-bold">
                      MON · TUE · WED · THU · FRI · SAT · SUN [AUTO-SCHEDULED]
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                    {elonVersionState.dailyPrTruckConveyor.map((pr) => (
                      <div
                        key={pr.prId}
                        className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 font-mono text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold">
                              [{pr.dayOfWeek}] PR #{pr.prNumber}
                            </span>
                            <span className="text-sky-300 font-bold">{pr.targetSurface}</span>
                          </div>
                          <div className="px-2 py-1 rounded bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-200 font-bold text-center my-1.5">
                            🚚 {pr.truckBadgeLabel}
                          </div>
                          <div className="text-[11px] text-zinc-200 leading-snug mb-1.5">
                            {pr.title}
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold">{pr.diffStatLabel}</span>
                          <span className="text-zinc-400">{pr.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* The 5 Core Self-Maintaining Prompts (/schedule) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {elonVersionState.selfMaintainingRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {routine.title}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPrompt(routine.id, routine.scheduleCliCommand)
                          }
                          className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-emerald-300 hover:bg-zinc-700 cursor-pointer"
                        >
                          {copiedPromptAgentId === routine.id
                            ? '✓ Copied /schedule'
                            : 'Copy /schedule'}
                        </button>
                      </div>

                      <div className="bg-zinc-950 border border-amber-500/40 rounded p-2 font-mono text-xs text-amber-200 mb-2">
                        <div className="text-[9px] text-zinc-400 uppercase">
                          Single-Sentence Daily Prompt:
                        </div>
                        <div className="font-bold">&quot;{routine.singleSentencePrompt}&quot;</div>
                        <div className="text-[10px] text-emerald-400 mt-1">
                          {routine.scheduleCliCommand}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-snug mb-2">
                        {routine.dailyPrSummary}
                      </p>
                      <p className="text-[11px] font-mono text-sky-300 leading-snug mb-2">
                        {routine.analysisMethod}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-rose-400 font-bold">
                        -{routine.linesDeleted} lines
                      </span>
                      <span className="text-emerald-400 font-bold">
                        +{routine.linesAdded} lines
                      </span>
                      <span className="text-zinc-400">
                        Targets: {routine.targetSurfaces.join('/')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 6 Enterprise Scheduled Task Use Cases (Schedule, API, GitHub PR Triggers) */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-mono uppercase text-sky-400 font-bold mb-2">
                  AUTOMATE WORK WITH SCHEDULED TASKS (CLOUD / SELF-HOSTED / CLI /schedule &amp; /loop)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {ENTERPRISE_SCHEDULED_TASK_USE_CASES.map((uc) => (
                    <div
                      key={uc.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono mb-1">
                        <span className="font-bold text-amber-300">{uc.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                          {uc.triggerType}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 mb-1">
                        {uc.scheduleOrEventLabel}
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-snug mb-1.5">
                        {uc.workflowSummary}
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Target: {uc.targetChannelOrRepo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
