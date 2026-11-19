import {
  POPULAR_25_AIRGUNS,
  runCachedHuggingFacePhysicsSim,
  getCachedSimulationList,
} from '../../../../src/game/popular25Catalog';

export function runHfCacheCli() {
  const result = runCachedHuggingFacePhysicsSim({
    upper: POPULAR_25_AIRGUNS[0],
    lower: POPULAR_25_AIRGUNS[1],
    dischargeType: 'REGULATED_HAMMERLESS_PLUG_VALVE',
    regulatorBar: 150,
    plenumCc: 63,
    wallThicknessMm: 4.5,
    material: 'PA12_CF_CARBON_NYLON',
    hfModelId: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2 + Shap-E-CAD',
    customCaliberMm: 7.62,
  });
  return {
    latestSimulation: result,
    totalCachedEntries: getCachedSimulationList().length,
  };
}
