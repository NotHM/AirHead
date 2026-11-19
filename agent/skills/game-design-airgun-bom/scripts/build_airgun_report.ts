import {
  PNEUMATIC_PARTS_CATALOG,
  PRESET_LOADOUTS,
  createInitialPneumaticState,
} from '../../../../src/game/partsCatalog';
import {
  POPULAR_25_AIRGUNS,
  runCachedHuggingFacePhysicsSim,
} from '../../../../src/game/popular25Catalog';
import { evaluateMultiAgentEngineeringSuite } from '../../../../src/agents/pneumaticCadAgents';

export function buildAirgunReport() {
  const loadout = PRESET_LOADOUTS[0];
  const upper = POPULAR_25_AIRGUNS[0];
  const lower = POPULAR_25_AIRGUNS[1];
  const pneu = createInitialPneumaticState(loadout);
  const sim = runCachedHuggingFacePhysicsSim({
    upper,
    lower,
    dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
    regulatorBar: loadout.regulatorSetpointBar,
    plenumCc: 63,
    wallThicknessMm: loadout.custom3dPart.wallThicknessMm,
    material: loadout.custom3dPart.polymerMaterial,
    hfModelId: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD',
    customCaliberMm: 7.62,
  });

  const suite = evaluateMultiAgentEngineeringSuite({
    loadout,
    pneumaticState: pneu,
    simResult: sim,
    upperPlatformId: upper.id,
    lowerPlatformId: lower.id,
    dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
  });

  return {
    executive_summary: `Hybrid ${upper.name} [Upper] × ${lower.name} [Lower] re-bored to ${sim.otbCadSpec.targetCaliberMm}mm delivers ${sim.predictedEnergyJoules} J (${sim.predictedVelocityMs} m/s) with a ${sim.safetyFactor}× Lamé hoop-stress safety factor.`,
    total_platforms: POPULAR_25_AIRGUNS.length,
    total_functional_parts: PNEUMATIC_PARTS_CATALOG.length,
    agent_verdicts: suite.agents,
    bom_parts: PNEUMATIC_PARTS_CATALOG.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      slot: p.slot,
      partRef: p.partRef,
      capacityOrSpec: p.capacityOrSpec,
      primaryFunction: p.primaryFunction,
    })),
  };
}
