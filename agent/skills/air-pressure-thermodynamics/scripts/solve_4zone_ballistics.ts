import {
  POPULAR_25_AIRGUNS,
  runCachedHuggingFacePhysicsSim,
} from '../../../../src/game/popular25Catalog';

export function runCli(args: string[]) {
  const upperIdx = args.indexOf('--upper');
  const lowerIdx = args.indexOf('--lower');
  const calIdx = args.indexOf('--caliber-mm');

  const upperId = upperIdx >= 0 ? args[upperIdx + 1] : 'av_seneca_ascent';
  const lowerId = lowerIdx >= 0 ? args[lowerIdx + 1] : 'edgun_leshiy2';
  const caliberMm = calIdx >= 0 ? parseFloat(args[calIdx + 1]) : 7.62;

  const upper =
    POPULAR_25_AIRGUNS.find((p) => p.id === upperId) || POPULAR_25_AIRGUNS[0];
  const lower =
    POPULAR_25_AIRGUNS.find((p) => p.id === lowerId) || POPULAR_25_AIRGUNS[1];

  const sim = runCachedHuggingFacePhysicsSim({
    upper,
    lower,
    dischargeType: 'REGULATED_BALANCED_POPPET_VALVE',
    regulatorBar: 150,
    plenumCc: 63,
    wallThicknessMm: 4.5,
    material: 'PA12_CF_CARBON_NYLON',
    hfModelId: 'hf.co/DeepMind/MeshGraphNet-Pneumatic-CFD-v2',
    customCaliberMm: caliberMm,
  });

  return {
    skill: 'air-pressure-thermodynamics',
    upperPlatform: upper.name,
    lowerPlatform: lower.name,
    part116BalancerPsi: 2000,
    zones: {
      z1OtbBar: 250,
      z2ButtstockBar: 250,
      z3ForegripBar: 250,
      z4PlenumBar: 150,
    },
    muzzleEnergyJoules: sim.predictedEnergyJoules,
    muzzleVelocityMs: sim.predictedVelocityMs,
  };
}
