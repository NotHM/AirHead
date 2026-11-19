import { synthesizeOtbBarrelAndCadPart } from '../../../../src/wasm/pneumaticWasm';

export function runReboreCli(targetCaliberMm = 11.43) {
  return synthesizeOtbBarrelAndCadPart({
    nativeCaliberMm: 6.35,
    targetCaliberMm,
    barrelLengthMm: 500,
    targetOtbVolumeCc: 307,
    maxOperatingBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });
}
