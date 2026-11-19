import {
  generatePrintableStlString,
  PrintableCadSubsystemType,
} from '../../../../src/game/popular25Catalog';
import { synthesizeOtbBarrelAndCadPart } from '../../../../src/wasm/pneumaticWasm';

export function synthesizeSubsystemStl(
  subsystemType: PrintableCadSubsystemType = 'OTB_COAXIAL_BARREL_SHROUD_ASSEMBLY'
) {
  const otbCadSpec = synthesizeOtbBarrelAndCadPart({
    nativeCaliberMm: 6.35,
    targetCaliberMm: 7.62,
    barrelLengthMm: 500,
    targetOtbVolumeCc: 307,
    maxOperatingBar: 250,
    material: 'PA12_CF_CARBON_NYLON',
  });

  const stl = generatePrintableStlString({
    partName: `bar250_${subsystemType.toLowerCase()}`,
    upperPort: 'COAXIAL_OTB_SLEEVE_PORT',
    lowerPort: 'BSPP_1_8_DOWTY_SEAL',
    wallThicknessMm: 4.5,
    subsystemType,
    otbCadSpec,
  });

  const facetCount = (stl.match(/facet normal/g) || []).length;
  return { subsystemType, facetCount, stlPreview: stl.slice(0, 240) };
}
