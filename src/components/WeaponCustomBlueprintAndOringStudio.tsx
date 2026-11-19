import React, { useEffect, useState } from 'react';
import {
  CANONICAL_7_WEAPONS_PROGRESSION,
  CanonicalGunProgressionId,
  CanonicalWeaponBlueprintSpec,
  getCanonicalWeaponByProgressionId,
  LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS,
  P50_EXTREME_ENVIRONMENTS,
  P50_HERMETIC_6PHASE_CYCLE_STAGES,
} from '../game/canonicalProgressionAndBlueprints';
import { getElonRoadmapForGun } from '../game/elonReverseEngineeringRoadmaps';
import {
  ParametricStlArchetype,
  parseBlueprintPartDimensionsAndArchetype,
  synthesizeComponentWatertightStl,
} from '../game/airgunVideoTranscriptionStudio';

interface WeaponCustomBlueprintAndOringStudioProps {
  equippedGunId: CanonicalGunProgressionId;
  onEquipCanonicalGun: (gunSpec: CanonicalWeaponBlueprintSpec) => void;
  onTriggerDivideAndConquerAll?: () => void;
}

type BlueprintLayerFilter = 'ALL_LAYERS' | 'SCREWS_AND_THREADS' | 'ORING_SEALS' | 'UNIQUE_PARTS';

const STL_ARCHETYPE_OPTIONS: { value: ParametricStlArchetype; label: string }[] = [
  { value: 'ROTARY_DRUM_MAGAZINE', label: 'Rotary / Helical Drum Magazine (Chambers & Ratchet)' },
  { value: 'MULTI_BAFFLE_SILENCER', label: 'Multi-Baffle Silencer / Eccentric Moderator' },
  { value: 'RIFLED_BARREL_LINER', label: 'Rifled Barrel Liner (Lead-in & Choke Crown)' },
  { value: 'BURST_DISK_SHELL_CARTRIDGE', label: 'Shared .50 Cal 220-Bar Burst-Disk Shell Cartridge' },
  { value: 'LEVER_TRIGGER_LINKAGE', label: 'Lever-Trigger Guard & Sear Linkage Bar (#14-#20)' },
  { value: 'BELLEVILLE_REGULATOR_PLENUM', label: 'Belleville Regulator & Plenum Chamber' },
  { value: 'HELICAL_TURRET_BREECH', label: '90° Rotary / Sliding Breech Block & Shuttle' },
  { value: 'FINNED_HPA_BOTTLE', label: '300-Bar High-Pressure Air Cylinder / Over-Barrel Tube' },
  { value: 'HEX_TORX_FASTENER', label: 'Metric Socket Head / Torx Fastener Screw' },
  { value: 'TOROIDAL_ORING_SEAL', label: 'Viton / PU-90A Toroidal O-Ring Seal' },
];

export const WeaponCustomBlueprintAndOringStudio: React.FC<
  WeaponCustomBlueprintAndOringStudioProps
> = ({ equippedGunId, onEquipCanonicalGun, onTriggerDivideAndConquerAll }) => {
  // Allows viewing the equipped gun's blueprint OR cross-inspecting any other gun's blueprint!
  const [inspectedGunId, setInspectedGunId] =
    useState<CanonicalGunProgressionId>(equippedGunId);
  const [compareSideBySide, setCompareSideBySide] = useState<boolean>(false);
  const [layerFilter, setLayerFilter] = useState<BlueprintLayerFilter>('ALL_LAYERS');
  const [selectedCalloutCode, setSelectedCalloutCode] = useState<string>('');
  const [stlDownloadNotice, setStlDownloadNotice] = useState<string | null>(null);

  // Custom Prompt & Spec-to-STL Builder State
  const [customPartName, setCustomPartName] = useState<string>(
    'Shared SHELL-50-220B .50 Cal 220-Bar Burst Cartridge'
  );
  const [customPartPrompt, setCustomPartPrompt] = useState<string>(
    'Ø18.0mm OD × Ø12.70mm ID × 68.0mm L pre-charged 220-Bar burst-disk cartridge with M16×1.0 rear union and 0.12mm CuNi foil retainer'
  );
  const [customArchetype, setCustomArchetype] = useState<ParametricStlArchetype>(
    'BURST_DISK_SHELL_CARTRIDGE'
  );
  const [customLengthMm, setCustomLengthMm] = useState<number>(68.0);
  const [customOdMm, setCustomOdMm] = useState<number>(18.0);
  const [customIdMm, setCustomIdMm] = useState<number>(12.7);
  const [customChamberCount, setCustomChamberCount] = useState<number>(8);
  const [isAiSynthesizingStl, setIsAiSynthesizingStl] = useState<boolean>(false);

  // Minimize / Expand Controls for Blueprint Studio & Sub-Sections
  const [blueprintStudioMinimized, setBlueprintStudioMinimized] = useState<boolean>(false);
  const [minimizeCadDiagram, setMinimizeCadDiagram] = useState<boolean>(false);
  const [minimizeSpecsColumns, setMinimizeSpecsColumns] = useState<boolean>(false);
  const [minimizeStlSynthesizer, setMinimizeStlSynthesizer] = useState<boolean>(false);
  const [minimizeElonRoadmap, setMinimizeElonRoadmap] = useState<boolean>(false);

  // Sync inspected gun when equipped gun changes unless user is cross-comparing
  useEffect(() => {
    setInspectedGunId(equippedGunId);
  }, [equippedGunId]);

  const equippedGun = getCanonicalWeaponByProgressionId(equippedGunId);
  const inspectedGun = getCanonicalWeaponByProgressionId(inspectedGunId);
  const inspectedElonRoadmap = getElonRoadmapForGun(inspectedGun.progressionId);
  const isCrossInspectingOtherGun = inspectedGun.progressionId !== equippedGun.progressionId;

  const triggerStlBrowserDownload = (stlString: string, filename: string) => {
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([stlString], { type: 'model/stl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPartStl = (
    partCode: string,
    partName: string,
    caliberMm: number,
    dimensionsMm?: string,
    roleDescription?: string
  ) => {
    const parsed = parseBlueprintPartDimensionsAndArchetype({
      partCode,
      partName,
      dimensionsSpecString:
        dimensionsMm ||
        `Ø${(caliberMm + 16).toFixed(1)}mm OD × Ø${caliberMm.toFixed(2)}mm ID × 92.0mm L`,
      customDescription: roleDescription || partName,
      caliberMm,
    });
    const res = synthesizeComponentWatertightStl({
      partCode,
      partName,
      lengthMm: parsed.lengthMm,
      outerDiameterMm: parsed.outerDiameterMm,
      innerDiameterMm: parsed.innerDiameterMm,
      caliberMm,
      dimensionsSpecString: dimensionsMm,
      customDescription: roleDescription,
      archetypeOverride: parsed.archetype,
      chamberOrBaffleCount: parsed.chamberOrBaffleCount,
    });
    setStlDownloadNotice(
      `Exported ${partCode} (${partName}) [${res.resolvedArchetype}] — ${res.parsedDimensionsSummary} · ${res.facetCount} watertight facets (±0.005mm)`
    );
    triggerStlBrowserDownload(
      res.stlString,
      `${partCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${res.resolvedArchetype.toLowerCase()}_${caliberMm.toFixed(2)}mm.stl`
    );
  };

  const handleSynthesizeCustomPromptStl = async () => {
    setIsAiSynthesizingStl(true);
    let synthLength = customLengthMm;
    let synthOd = customOdMm;
    let synthId = customIdMm;
    let synthArchetype = customArchetype;
    let synthChambers = customChamberCount;
    let codeLabel = `CUSTOM-${inspectedGun.progressionId.replace('GUN_', '')}`;

    try {
      const resp = await fetch('/api/dcc/prompt-to-stl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partName: customPartName,
          description: customPartPrompt,
          caliberMm: inspectedGun.defaultCaliberMm,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (typeof data.lengthMm === 'number') synthLength = data.lengthMm;
        if (typeof data.outerDiameterMm === 'number') synthOd = data.outerDiameterMm;
        if (typeof data.innerDiameterMm === 'number') synthId = data.innerDiameterMm;
        if (typeof data.archetype === 'string') synthArchetype = data.archetype as ParametricStlArchetype;
        if (typeof data.chamberOrBaffleCount === 'number') synthChambers = data.chamberOrBaffleCount;
        if (typeof data.partCode === 'string') codeLabel = data.partCode;
        setCustomLengthMm(synthLength);
        setCustomOdMm(synthOd);
        setCustomIdMm(synthId);
        setCustomArchetype(synthArchetype);
        setCustomChamberCount(synthChambers);
      }
    } catch {
      // Fallback to local parametric parser if offline
    } finally {
      setIsAiSynthesizingStl(false);
    }

    const res = synthesizeComponentWatertightStl({
      partCode: codeLabel,
      partName: customPartName,
      lengthMm: synthLength,
      outerDiameterMm: synthOd,
      innerDiameterMm: synthId,
      caliberMm: inspectedGun.defaultCaliberMm,
      dimensionsSpecString: `Ø${synthOd.toFixed(2)}mm OD × Ø${synthId.toFixed(2)}mm ID × ${synthLength.toFixed(1)}mm L`,
      customDescription: customPartPrompt,
      archetypeOverride: synthArchetype,
      chamberOrBaffleCount: synthChambers,
    });
    setStlDownloadNotice(
      `Synthesized Custom .STL: ${customPartName} [${res.resolvedArchetype}] — ${res.parsedDimensionsSummary} · ${res.facetCount} watertight facets`
    );
    triggerStlBrowserDownload(
      res.stlString,
      `${codeLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${res.resolvedArchetype.toLowerCase()}.stl`
    );
  };

  /**
   * Renders a distinct, weapon-accurate CAD cross-section geometry for each of the 8 canonical guns
   */
  const renderUniqueWeaponBlueprintSvg = (
    gun: CanonicalWeaponBlueprintSpec,
    compactMode: boolean = false
  ) => {
    const showScrews = layerFilter === 'ALL_LAYERS' || layerFilter === 'SCREWS_AND_THREADS';
    const showOrings = layerFilter === 'ALL_LAYERS' || layerFilter === 'ORING_SEALS';
    const showParts = layerFilter === 'ALL_LAYERS' || layerFilter === 'UNIQUE_PARTS';

    return (
      <svg
        viewBox="0 0 820 235"
        className={`w-full ${compactMode ? 'h-40' : 'h-52'} bg-zinc-950 rounded-lg border border-zinc-800`}
      >
        <defs>
          <pattern
            id={`cad-grid-${gun.progressionId}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(56,189,248,0.08)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="820" height="235" fill={`url(#cad-grid-${gun.progressionId})`} />

        {/* Blueprint Title Block Header */}
        <text x="14" y="18" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
          CAD BLUEPRINT // {gun.fullTitle.toUpperCase()}
        </text>
        <text x="14" y="31" fill="#a1a1aa" fontSize="8.5" fontFamily="JetBrains Mono">
          {gun.familyId === 'SHOTGUN_BURST_CARTRIDGE_FAMILY'
            ? `CALIBER: ${gun.imperialCaliberLabel} · FRONT-FILL CARTRIDGE: 310 BAR (4,500 PSI) · 0cc PLENUM (DIRECT DUMP) · REAR 5,000 PSI BURST DISK`
            : `CALIBER: ${gun.imperialCaliberLabel} · PRESSURE: ${gun.operatingPressureBar} BAR · ENERGY: ${gun.muzzleEnergyJoules} J · MAG: ${gun.magazineCapacity} RDS · PARTS: ${gun.uniqueParts.length}`}
        </text>

        {/* WEAPON-SPECIFIC MECHANICAL SILHOUETTE & INTERNAL CROSS-SECTION */}
        {gun.progressionId === 'GUN_01_PEN' && (
          <g>
            {/* 1. Rear L-Slot Striker Receiver Tube (#4 PEN-04) + Coil Spring + Pocket Clip */}
            <rect x="42" y="92" width="185" height="48" rx="5" fill="rgba(39,39,42,0.9)" stroke="#a1a1aa" strokeWidth="1.8" />
            <path d="M 58 92 L 58 80 L 172 80 L 184 88" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
            <path d="M 52 116 Q 64 102 76 116 T 100 116 T 124 116 T 148 116" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <rect x="155" y="102" width="42" height="28" rx="3" fill="#52525b" stroke="#f4f4f5" strokeWidth="1.4" />
            <polygon points="197,112 222,116 197,120" fill="#facc15" />
            <path d="M 118 96 L 185 96 L 185 108" fill="none" stroke="#f59e0b" strokeWidth="2.8" />
            <text x="134" y="75" textAnchor="middle" fill="#7dd3fc" fontSize="7.2" fontWeight="bold" fontFamily="JetBrains Mono">
              [PEN-04] L-SLOT STRIKER TUBE
            </text>

            {/* 2. Center AEA 310B Front-Fill Shuttle Cartridge + Rear 5,000 PSI Burst Disk (#3 PEN-03 & #2 SHELL-50-220B) */}
            <rect x="232" y="88" width="235" height="56" rx="5" fill="rgba(24,24,27,0.95)" stroke="#f59e0b" strokeWidth="1.8" />
            <rect x="238" y="94" width="44" height="44" rx="3" fill="rgba(161,161,170,0.28)" stroke="#e4e4e7" strokeWidth="1.6" />
            <line x1="282" y1="95" x2="282" y2="137" stroke="#facc15" strokeWidth="3" strokeDasharray="3 2" />
            <text x="260" y="114" textAnchor="middle" fill="#fde047" fontSize="6.8" fontWeight="bold" fontFamily="JetBrains Mono">
              5000 PSI
            </text>
            <text x="260" y="125" textAnchor="middle" fill="#fef08a" fontSize="6.5" fontFamily="JetBrains Mono">
              REAR DISK
            </text>
            <rect x="284" y="94" width="176" height="44" rx="4" fill="rgba(220,38,38,0.34)" stroke="#ef4444" strokeWidth="1.8" />
            <path d="M 292 116 Q 302 106 312 116 T 332 116 T 352 116" fill="none" stroke="#fca5a5" strokeWidth="1.6" />
            <rect x="356" y="99" width="32" height="34" rx="3" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1.4" />
            <text x="372" y="119" textAnchor="middle" fill="#09090b" fontSize="6.5" fontWeight="bold" fontFamily="JetBrains Mono">
              SHUTTLE
            </text>
            <text x="424" y="114" textAnchor="middle" fill="#fef2f2" fontSize="6.8" fontWeight="bold" fontFamily="JetBrains Mono">
              ← FRONT FILL
            </text>
            <text x="424" y="126" textAnchor="middle" fill="#bae6fd" fontSize="6.8" fontWeight="bold" fontFamily="JetBrains Mono">
              310B DUMP →
            </text>
            <text x="350" y="82" textAnchor="middle" fill="#fecaca" fontSize="7.2" fontWeight="bold" fontFamily="JetBrains Mono">
              [SHELL-50-220B] FRONT-FILL SHUTTLE + REAR 5,000 PSI DISK (x9feufnloKc)
            </text>

            {/* 3. Front Interchangeable Screw-On Barrels (.410 Shotgun / .45 Cal Slug / 9mm — VID105 & VID107) */}
            <rect x="474" y="80" width="310" height="22" rx="3" fill="rgba(220,38,38,0.24)" stroke="#ef4444" strokeWidth="1.6" />
            <rect x="482" y="84" width="296" height="14" fill="#09090b" stroke="#f59e0b" strokeWidth="1.2" />
            <text x="630" y="94" textAnchor="middle" fill="#fef3c7" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
              .410 SHOTGUN SMOOTHBORE (#4 BUCK / 2×.32 BALLS — VID107)
            </text>
            <rect x="474" y="106" width="275" height="20" rx="3" fill="rgba(14,165,233,0.24)" stroke="#38bdf8" strokeWidth="1.6" />
            <rect x="482" y="110" width="260" height="12" fill="#09090b" stroke="#38bdf8" strokeWidth="1.2" />
            <text x="615" y="119" textAnchor="middle" fill="#e0f2fe" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
              .45 CAL (11.43mm) RIFLED SLUG BARREL (VID105)
            </text>
            <rect x="474" y="130" width="245" height="20" rx="3" fill="rgba(16,185,129,0.22)" stroke="#10b981" strokeWidth="1.6" />
            <rect x="482" y="134" width="230" height="12" fill="#09090b" stroke="#10b981" strokeWidth="1.2" />
            <text x="600" y="143" textAnchor="middle" fill="#a7f3d0" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
              9mm (.357 CAL) SCREW-ON BARREL (VID105)
            </text>
          </g>
        )}

        {gun.progressionId === 'GUN_02_REXP' && (
          <g>
            {/* Slotted Barrel Shroud (#02) */}
            <rect x="85" y="98" width="290" height="38" rx="4" fill="rgba(39,39,42,0.85)" stroke="#38bdf8" strokeWidth="1.8" />
            <line x1="85" y1="117" x2="395" y2="117" stroke="#f4f4f5" strokeWidth="5" />
            {/* Vertical Sliding Breech Block (#11) & Twist Lever (#14) */}
            <rect x="395" y="78" width="38" height="62" rx="3" fill="rgba(245,158,11,0.28)" stroke="#f59e0b" strokeWidth="2" />
            {/* Coaxial Balanced Poppet (#31/#32) & Rear 250-Bar Air Tube (#38) */}
            <rect x="433" y="104" width="275" height="48" rx="8" fill="rgba(14,165,233,0.24)" stroke="#38bdf8" strokeWidth="2" />
            <text x="505" y="132" fill="#e0f2fe" fontSize="8.5" fontWeight="bold" fontFamily="JetBrains Mono">
              #31/#32 COAXIAL POPPET · #38 190cc 250B TUBE
            </text>
            {/* Rebuilt Factory Trigger Group (#14 Blade -> #15 Transfer Bar -> #16 Sear -> #19 Striker -> #20 5-Hole Underlever) */}
            <rect x="372" y="142" width="68" height="14" rx="2" fill="rgba(16,185,129,0.28)" stroke="#10b981" strokeWidth="1.5" />
            <text x="376" y="152" fill="#a7f3d0" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
              #14-#19 SEAR LINK
            </text>
            <path d="M 355 156 L 385 186 L 442 186 L 448 154" fill="none" stroke="#f59e0b" strokeWidth="3" />
            <polygon points="445,152 495,152 478,188 432,188" fill="rgba(63,63,70,0.8)" stroke="#a1a1aa" strokeWidth="1.5" />
          </g>
        )}

        {gun.progressionId === 'GUN_03_DEFENDER' && (
          <g>
            {/* Standing Breech & Alternating Twin Strikers */}
            <rect x="52" y="84" width="142" height="72" rx="5" fill="rgba(63,63,70,0.88)" stroke="#a1a1aa" strokeWidth="1.8" />
            <rect x="64" y="92" width="46" height="18" rx="2" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="64" y="128" width="46" height="18" rx="2" fill="rgba(14,165,233,0.3)" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="122" y="78" textAnchor="middle" fill="#fde047" fontSize="7.2" fontWeight="bold" fontFamily="JetBrains Mono">
              ALTERNATING STRIKERS
            </text>
            <circle cx="202" cy="160" r="6" fill="#facc15" stroke="#18181b" strokeWidth="1.5" />

            {/* Over-Under Twin .50 Harpoon & .72 Walking Cane Barrel Block */}
            <rect x="200" y="80" width="565" height="80" rx="5" fill="rgba(39,39,42,0.9)" stroke="#f87171" strokeWidth="2" />
            {/* 2x Front-Fill 310B Shuttle Cartridges w/ Rear 5,000 PSI Burst Disks (x9feufnloKc) */}
            <rect x="210" y="88" width="155" height="28" rx="3" fill="rgba(239,68,68,0.42)" stroke="#ef4444" strokeWidth="1.8" />
            <line x1="218" y1="90" x2="218" y2="114" stroke="#facc15" strokeWidth="2.8" strokeDasharray="3 2" />
            <rect x="272" y="92" width="22" height="20" rx="2" fill="#38bdf8" />
            <text x="300" y="105" fill="#fef2f2" fontSize="6.8" fontWeight="bold" fontFamily="JetBrains Mono">
              310B CART #1
            </text>

            <rect x="210" y="124" width="155" height="28" rx="3" fill="rgba(239,68,68,0.42)" stroke="#ef4444" strokeWidth="1.8" />
            <line x1="218" y1="126" x2="218" y2="150" stroke="#facc15" strokeWidth="2.8" strokeDasharray="3 2" />
            <rect x="272" y="128" width="22" height="20" rx="2" fill="#38bdf8" />
            <text x="300" y="141" fill="#fef2f2" fontSize="6.8" fontWeight="bold" fontFamily="JetBrains Mono">
              310B CART #2
            </text>

            {/* Upper Barrel: .50 Buckshot/Slug or .72 Cal (18.3mm) Walking Cane Shaft (jgDYcypjHeI) */}
            <rect x="368" y="90" width="388" height="22" fill="#09090b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="562" y="104" textAnchor="middle" fill="#e0f2fe" fontSize="7.2" fontWeight="bold" fontFamily="JetBrains Mono">
              UPPER: .50 SLUG / BUCKSHOT OR .72 CAL (18.3mm) CANE SHAFT (jgDYcypjHeI)
            </text>

            {/* Lower Barrel: 375gr Giant Carbon Harpoon Arrow (x9feufnloKc) */}
            <rect x="368" y="126" width="388" height="22" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
            <line x1="378" y1="137" x2="782" y2="137" stroke="#10b981" strokeWidth="4" />
            <polygon points="802,137 778,129 778,145" fill="#facc15" />
            <text x="562" y="140" textAnchor="middle" fill="#6ee7b7" fontSize="7.2" fontWeight="bold" fontFamily="JetBrains Mono">
              LOWER: 375gr CARBON HARPOON ARROW (x9feufnloKc)
            </text>
          </g>
        )}

        {gun.progressionId === 'GUN_04_LESHIY' && (
          <g>
            {/* LSH-03 Tishina 200 6-Baffle Eccentric Moderator + LSH-02 Valkyrie Carbon M-LOK + LSH-01 350mm Alfa Barrel */}
            <rect x="85" y="88" width="135" height="54" rx="4" fill="rgba(16,185,129,0.22)" stroke="#10b981" strokeWidth="1.8" />
            <rect x="220" y="92" width="195" height="46" rx="4" fill="rgba(24,24,27,0.92)" stroke="#38bdf8" strokeWidth="1.8" />
            <line x1="85" y1="115" x2="415" y2="115" stroke="#e4e4e7" strokeWidth="4.5" />
            <text x="94" y="103" fill="#a7f3d0" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              LSH-03 TISHINA 6-BAFFLE
            </text>
            <text x="230" y="105" fill="#bae6fd" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              LSH-01 350mm ALFA · LSH-02 VALKYRIE M-LOK
            </text>
            {/* LSH-06 8-Round Magnetic Drum + LSH-08 1.8cc Bleed-Jet Indexing Pawl + LSH-07 Red PU-90A Puff-Seal Puck */}
            <rect x="418" y="84" width="28" height="64" rx="3" fill="rgba(239,68,68,0.42)" stroke="#ef4444" strokeWidth="2" />
            <circle cx="450" cy="115" r="7" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
            {/* LSH-09 1.4ms EAR Hammerless Forward-Plug Balanced Spool + LSH-10 Upper 42cc R.E.P.R. Plenum + Lower 137cc 300B Tube */}
            <rect x="458" y="92" width="265" height="34" rx="6" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="1.8" />
            <rect x="458" y="132" width="255" height="30" rx="6" fill="rgba(168,85,247,0.26)" stroke="#a855f7" strokeWidth="1.8" />
            <path d="M 520 147 L 690 147 L 690 109 L 420 109 L 110 115" fill="none" stroke="#facc15" strokeWidth="1.8" strokeDasharray="4 2" />
            <text x="470" y="112" fill="#bae6fd" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
              LSH-09 1.4ms EAR SPOOL + 42cc R.E.P.R. PLENUM (130B)
            </text>
            <text x="470" y="151" fill="#e9d5ff" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
              137cc 300B LOWER TUBE · 180° FOLD HINGE (756→457mm)
            </text>
          </g>
        )}

        {gun.progressionId === 'GUN_04B_THE_LEAF_45' && (
          <g>
            {/* Concentric 165cc Over-the-Barrel Air Reserve Jacket around 6-Baffle Silencer & .45 Barrel */}
            <rect x="90" y="82" width="325" height="68" rx="6" fill="rgba(16,185,129,0.24)" stroke="#10b981" strokeWidth="2" />
            <rect x="100" y="96" width="305" height="40" rx="4" fill="rgba(220,38,38,0.28)" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="90" y1="116" x2="415" y2="116" stroke="#f4f4f5" strokeWidth="5.5" />
            <text x="108" y="93" fill="#a7f3d0" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
              165cc CONCENTRIC OVER-BARREL AIR RESERVE (.45 CAL / 11.43mm)
            </text>
            {/* 6-Round .45 Scalloped Rotary Drum + 6-Tooth Star Ratchet + Enlarged Red PU-90A Puck */}
            <rect x="420" y="84" width="30" height="66" rx="4" fill="rgba(239,68,68,0.45)" stroke="#ef4444" strokeWidth="2" />
            {/* Leshiy-2 Based 180° Folding Twin-Tube Stock (68cc 195B Plenum + 220cc 300B Lower Tube) */}
            <rect x="454" y="94" width="265" height="34" rx="6" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="1.8" />
            <rect x="454" y="134" width="255" height="30" rx="6" fill="rgba(168,85,247,0.28)" stroke="#a855f7" strokeWidth="1.8" />
            <text x="470" y="114" fill="#bae6fd" fontSize="8.5" fontWeight="bold" fontFamily="JetBrains Mono">
              68cc 195-BAR R.E.P.R. BIG-BORE PLENUM
            </text>
            <text x="470" y="153" fill="#e9d5ff" fontSize="8.5" fontWeight="bold" fontFamily="JetBrains Mono">
              220cc 300-BAR FOLDING STOCK TUBE
            </text>
          </g>
        )}

        {gun.progressionId === 'GUN_05_MP30' && (
          <g>
            {/* MP30-01/02: 320mm .30 Barrel + 10-Chamber Whisper Shroud + MP30-03 M-LOK Handguard */}
            <rect x="95" y="84" width="285" height="28" rx="4" fill="rgba(39,39,42,0.92)" stroke="#38bdf8" strokeWidth="1.8" />
            <line x1="95" y1="98" x2="380" y2="98" stroke="#f4f4f5" strokeWidth="4.5" />
            <text x="108" y="95" fill="#bae6fd" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              MP30-01/02 320mm .30 BARREL + 10-BAFFLE WHISPER SHROUD
            </text>
            {/* MP30-04/05: Korean Over-Under Dual 150cc = 300cc 250-Bar Air Cylinders + Figure-8 Manifold */}
            <rect x="125" y="116" width="250" height="20" rx="5" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="1.6" />
            <rect x="125" y="140" width="250" height="20" rx="5" fill="rgba(16,185,129,0.28)" stroke="#10b981" strokeWidth="1.6" />
            <rect x="342" y="112" width="28" height="52" rx="3" fill="rgba(245,158,11,0.35)" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="138" y="129" fill="#e0f2fe" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              UPPER 150cc CYLINDER (250B)
            </text>
            <text x="138" y="153" fill="#a7f3d0" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              LOWER 150cc CYLINDER (300cc TOTAL) + 165B REG
            </text>
            {/* MP30-07/08/09: 48cc Vertical Plenum + Monolithic SMG Receiver + 12-Rd .30 Drum */}
            <rect x="380" y="84" width="135" height="68" rx="4" fill="rgba(63,63,70,0.88)" stroke="#d4d4d8" strokeWidth="1.8" />
            <rect x="415" y="152" width="44" height="36" rx="3" fill="rgba(245,158,11,0.28)" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="390" y="116" fill="#fef3c7" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              48cc PLENUM · 12-RD .30 MAG
            </text>
            {/* MP30-12: Side-Folding M4 Telescoping Buttstock */}
            <rect x="515" y="96" width="185" height="22" rx="3" fill="#27272a" stroke="#a1a1aa" strokeWidth="1.6" />
            <rect x="680" y="92" width="24" height="64" rx="3" fill="#18181b" stroke="#38bdf8" strokeWidth="1.6" />
          </g>
        )}

        {gun.progressionId === 'GUN_06_P50' && (
          <g>
            {/* Top Smoked-Polycarbonate Horizontal .50 Cal Spine + Visible Emptying Slugs + Nitinol Follower */}
            <rect x="195" y="68" width="245" height="22" rx="4" fill="rgba(245,158,11,0.26)" stroke="#f59e0b" strokeWidth="1.8" />
            <rect x="202" y="72" width="16" height="14" rx="2" fill="#10b981" />
            {[0, 1, 2, 3, 4, 5, 6].map((sIdx) => (
              <rect
                key={sIdx}
                x={226 + sIdx * 24}
                y="73"
                width="16"
                height="12"
                rx="2"
                fill="#facc15"
                stroke="#ca8a04"
                strokeWidth="0.8"
              />
            ))}
            <rect x="210" y="92" width="195" height="12" rx="3" fill="rgba(56,189,248,0.35)" stroke="#38bdf8" strokeWidth="1.4" />
            {/* Rear 90° Helical Cam Turret Saddle + Push-Down Elevator Finger + Dual Hermetic Collars */}
            <circle cx="432" cy="96" r="20" fill="rgba(16,185,129,0.32)" stroke="#10b981" strokeWidth="2" />
            <path d="M 432 82 L 432 114" stroke="#facc15" strokeWidth="3" />
            {/* Reserve #2 (160cc Barrel Concentric OTB Jacket) + .50 Cal Barrel */}
            <rect x="95" y="106" width="275" height="32" rx="5" fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth="1.8" />
            <line x1="85" y1="122" x2="465" y2="122" stroke="#f4f4f5" strokeWidth="5.5" />
            <text x="108" y="118" fill="#a7f3d0" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              RES #2 BARREL OTB (160cc) · SPACE/SAND/UNDERWATER SEALED
            </text>
            {/* Reserve #4 (180cc Pressurized Foregrip Bottle) */}
            <rect x="255" y="142" width="44" height="44" rx="6" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" strokeWidth="1.8" />
            {/* Reserve #3 (225cc Buttstock Dual Cylinders + 110cc 200B Full-Auto Plenum) */}
            <rect x="455" y="112" width="265" height="52" rx="7" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2" />
            <text x="468" y="142" fill="#bae6fd" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
              RES #3 BUTTSTOCK (225cc) + 110cc 200B AUTO PLENUM
            </text>
          </g>
        )}

        {gun.progressionId === 'GUN_07_ASCENT45' && (
          <g>
            {/* Thumbhole Stock & Lever */}
            <path d="M 45 144 L 165 112 L 325 112 L 325 152 L 175 158 L 60 182 Z" fill="#27272a" stroke="#71717a" strokeWidth="1.6" />
            {/* #09 Concentric 140cc Over-Barrel 210-Bar Plenum + #08 .45 Barrel */}
            <rect x="355" y="76" width="335" height="38" rx="5" fill="rgba(16,185,129,0.26)" stroke="#10b981" strokeWidth="2" />
            <line x1="340" y1="95" x2="775" y2="95" stroke="#e4e4e7" strokeWidth="5" />
            <text x="385" y="91" fill="#a7f3d0" fontSize="8.5" fontWeight="bold" fontFamily="JetBrains Mono">
              #09 140cc OVER-BARREL PLENUM (210B · 2.6 SHOTS)
            </text>
            {/* #10 QuietEnergy 6-Baffle Silencer */}
            <rect x="690" y="74" width="95" height="42" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1.8" />
            {/* #11 240cc 300-Bar Under-Barrel Reserve */}
            <rect x="380" y="120" width="265" height="26" rx="5" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="1.8" />
            <text x="405" y="136" fill="#bae6fd" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
              #11 240cc 300-BAR UNDER-BARREL RESERVE
            </text>
            {/* #12 Traditional Lever-Action 3-Stage 300-Bar Hand Pump (Front Fulcrum + 4-Bar Toggle Linkage) */}
            <circle cx="638" cy="154" r="5.5" fill="#facc15" stroke="#18181b" strokeWidth="1.5" />
            <line x1="638" y1="154" x2="435" y2="178" stroke="#ef4444" strokeWidth="4.5" />
            <line x1="545" y1="166" x2="505" y2="146" stroke="#facc15" strokeWidth="2.5" />
          </g>
        )}

        {gun.progressionId === 'GUN_09_PROTECTOR' && (
          <g>
            {/* Dual Threaded Annular Barrel Air Reserves (2× 110cc @ 250-Bar) */}
            <rect x="85" y="74" width="335" height="34" rx="5" fill="rgba(14,165,233,0.28)" stroke="#38bdf8" strokeWidth="2" />
            <line x1="85" y1="91" x2="420" y2="91" stroke="#f4f4f5" strokeWidth="5.5" />
            <text x="98" y="85" fill="#bae6fd" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              UPPER M28×1.5 THREADED BARREL AIR RESERVE (110cc @ 250B · .50 BORE)
            </text>
            <rect x="85" y="114" width="335" height="34" rx="5" fill="rgba(16,185,129,0.26)" stroke="#10b981" strokeWidth="2" />
            <line x1="85" y1="131" x2="420" y2="131" stroke="#f4f4f5" strokeWidth="5.5" />
            <text x="98" y="125" fill="#a7f3d0" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              LOWER M28×1.5 THREADED BARREL AIR RESERVE (110cc @ 250B · .50 BORE)
            </text>
            {/* 180° Reverse-Loop Rear Manifold Routing Air to Middle of Barrel */}
            <path d="M 285 74 L 455 74 L 455 91 L 255 91" fill="none" stroke="#facc15" strokeWidth="2.2" strokeDasharray="4 2" />
            <path d="M 285 148 L 455 148 L 455 131 L 255 131" fill="none" stroke="#facc15" strokeWidth="2.2" strokeDasharray="4 2" />
            <circle cx="255" cy="91" r="4.5" fill="#ef4444" stroke="#fef2f2" strokeWidth="1.2" />
            <circle cx="255" cy="131" r="4.5" fill="#ef4444" stroke="#fef2f2" strokeWidth="1.2" />
            {/* Post-Muzzle 8-Flechette Break-Apart Scatter Cone */}
            <polygon points="85,89 22,68 22,114" fill="rgba(250,204,21,0.18)" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 2" />
            <polygon points="85,129 22,108 22,154" fill="rgba(250,204,21,0.18)" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Break-Action Pivot Hinge & 3-Position Selector Receiver */}
            <circle cx="418" cy="154" r="6" fill="#facc15" stroke="#18181b" strokeWidth="1.5" />
            <rect x="424" y="72" width="145" height="80" rx="5" fill="rgba(39,39,42,0.92)" stroke="#f59e0b" strokeWidth="1.8" />
            <text x="434" y="106" fill="#fde047" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
              180° REAR GAS LOOP
            </text>
            <text x="434" y="122" fill="#fed7aa" fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono">
              TOP / BOT / DUAL SALVO
            </text>
            {/* Tactical Sawed-Off Grip & Buttstock */}
            <path d="M 569 86 L 745 96 L 745 158 L 595 144 L 555 186 L 502 186 L 525 148 Z" fill="#27272a" stroke="#a1a1aa" strokeWidth="1.6" />
          </g>
        )}

        {/* INTERACTIVE CALLOUT PINS ON NON-OVERLAPPING RAILS WITH LEADER LINES */}
        {showParts &&
          gun.uniqueParts.map((pt, idx) => {
            const isSel = selectedCalloutCode === pt.partCode;
            const totalPts = gun.uniqueParts.length;
            const slotX = Math.round(75 + (idx * 670) / Math.max(1, totalPts - 1));
            const py = 52;
            return (
              <g
                key={pt.partCode}
                onClick={() => setSelectedCalloutCode(pt.partCode)}
                className="cursor-pointer"
              >
                <line
                  x1={slotX}
                  y1={py + 8}
                  x2={pt.pinX}
                  y2="92"
                  stroke={isSel ? '#10b981' : 'rgba(16,185,129,0.4)'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <rect
                  x={slotX - 11}
                  y={py - 7}
                  width="22"
                  height="15"
                  rx="3"
                  fill={isSel ? '#10b981' : '#09090b'}
                  stroke="#10b981"
                  strokeWidth="1.4"
                />
                <text
                  x={slotX}
                  y={py + 3}
                  textAnchor="middle"
                  fill={isSel ? '#09090b' : '#6ee7b7'}
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  P{idx + 1}
                </text>
              </g>
            );
          })}

        {showOrings &&
          gun.oringPlacements.map((or, idx) => {
            const isSel = selectedCalloutCode === or.code;
            const totalOr = gun.oringPlacements.length;
            const slotX = Math.round(80 + (idx * 660) / Math.max(1, totalOr - 1));
            const oy = 198;
            return (
              <g
                key={or.code}
                onClick={() => setSelectedCalloutCode(or.code)}
                className="cursor-pointer"
              >
                <line
                  x1={slotX}
                  y1={oy - 8}
                  x2={or.pinX}
                  y2="145"
                  stroke={isSel ? '#38bdf8' : 'rgba(56,189,248,0.38)'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={slotX}
                  cy={oy}
                  r={isSel ? 9.5 : 8}
                  fill={isSel ? '#38bdf8' : '#09090b'}
                  stroke="#38bdf8"
                  strokeWidth={isSel ? '2.2' : '1.5'}
                />
                <text
                  x={slotX}
                  y={oy + 3}
                  textAnchor="middle"
                  fill={isSel ? '#09090b' : '#7dd3fc'}
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  O{idx + 1}
                </text>
              </g>
            );
          })}

        {showScrews &&
          gun.screwsAndFasteners.map((scr, idx) => {
            const isSel = selectedCalloutCode === scr.code;
            const totalScr = gun.screwsAndFasteners.length;
            const slotX = Math.round(115 + (idx * 620) / Math.max(1, totalScr - 1));
            const sy = 219;
            return (
              <g
                key={scr.code}
                onClick={() => setSelectedCalloutCode(scr.code)}
                className="cursor-pointer"
              >
                <line
                  x1={slotX}
                  y1={sy - 8}
                  x2={scr.pinX}
                  y2="152"
                  stroke={isSel ? '#facc15' : 'rgba(250,204,21,0.35)'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <rect
                  x={slotX - 9}
                  y={sy - 7.5}
                  width="18"
                  height="15"
                  rx="3"
                  fill={isSel ? '#facc15' : '#18181b'}
                  stroke="#facc15"
                  strokeWidth={isSel ? '2.0' : '1.3'}
                />
                <text
                  x={slotX}
                  y={sy + 2.5}
                  textAnchor="middle"
                  fill={isSel ? '#09090b' : '#fde047'}
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  S{idx + 1}
                </text>
              </g>
            );
          })}
      </svg>
    );
  };

  if (blueprintStudioMinimized) {
    return (
      <div className="pointer-events-auto w-full bg-zinc-950/95 border border-sky-500/50 rounded-xl px-3.5 py-2 font-mono text-xs shadow-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 font-bold text-[10px]">
            📐 BLUEPRINT MINIMIZED
          </span>
          <span className="text-zinc-200 font-bold">{inspectedGun.fullTitle}</span>
          <span className="text-zinc-400 text-[10px]">
            ({inspectedGun.screwsAndFasteners.length} Screws · {inspectedGun.oringPlacements.length} O-Rings · {inspectedGun.uniqueParts.length} Parts)
          </span>
        </div>
        <button
          type="button"
          data-testid="expand-blueprint-studio"
          onClick={() => setBlueprintStudioMinimized(false)}
          className="px-3 py-1 rounded bg-sky-500 text-zinc-950 font-bold text-[11px] hover:bg-sky-400 cursor-pointer"
        >
          ▴ Expand Blueprint Studio
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto w-full bg-zinc-950/96 border border-zinc-800 rounded-xl p-3 font-mono text-xs shadow-2xl flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto">
      {/* Top Blueprint Bar: Equipped Gun vs Cross-Inspect Any Gun's Blueprint + Minimize Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-amber-400 font-bold uppercase">
            Inspect Blueprint (1–9 Progression):
          </span>
          {CANONICAL_7_WEAPONS_PROGRESSION.map((gun) => {
            const isInspecting = gun.progressionId === inspectedGun.progressionId;
            const isEquipped = gun.progressionId === equippedGun.progressionId;
            return (
              <button
                key={gun.progressionId}
                type="button"
                onClick={() => setInspectedGunId(gun.progressionId)}
                className={`px-2 py-1 rounded text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                  isInspecting
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {gun.shortTitle}
                {isEquipped ? ' [EQUIPPED]' : ''}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {isCrossInspectingOtherGun && (
            <button
              type="button"
              onClick={() => onEquipCanonicalGun(inspectedGun)}
              className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer whitespace-nowrap"
            >
              Equip {inspectedGun.shortTitle} in 3D
            </button>
          )}
          <button
            type="button"
            onClick={() => setCompareSideBySide((v) => !v)}
            className={`px-2.5 py-1 rounded border text-[10px] font-semibold cursor-pointer whitespace-nowrap ${
              compareSideBySide
                ? 'bg-sky-500 text-zinc-950 border-sky-300'
                : 'bg-zinc-900 text-sky-300 border-zinc-700 hover:border-sky-400'
            }`}
          >
            {compareSideBySide ? 'Side-by-Side Compare: ON' : 'Compare w/ Equipped Gun'}
          </button>
          {onTriggerDivideAndConquerAll && (
            <button
              type="button"
              onClick={onTriggerDivideAndConquerAll}
              className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/70 text-purple-200 hover:bg-purple-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer whitespace-nowrap"
            >
              Agents: Divide &amp; Conquer All 8 Blueprints
            </button>
          )}
          <button
            type="button"
            data-testid="minimize-blueprint-studio"
            onClick={() => setBlueprintStudioMinimized(true)}
            className="px-2.5 py-1 rounded bg-zinc-900 border border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer whitespace-nowrap"
          >
            ▾ Minimize Blueprint
          </button>
        </div>
      </div>

      {/* Quick Section Minimize Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 bg-zinc-900/70 border border-zinc-800/80 rounded-lg px-2.5 py-1 text-[10px]">
        <span className="text-zinc-400 uppercase font-bold">Blueprint Sections:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMinimizeCadDiagram((v) => !v)}
            className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-sky-300 hover:text-white cursor-pointer"
          >
            {minimizeCadDiagram ? '▸ Show CAD Diagram' : '▾ Min CAD Diagram'}
          </button>
          <button
            type="button"
            onClick={() => setMinimizeSpecsColumns((v) => !v)}
            className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-amber-300 hover:text-white cursor-pointer"
          >
            {minimizeSpecsColumns ? '▸ Show Screws/O-Rings/Parts' : '▾ Min Screws/O-Rings/Parts'}
          </button>
          <button
            type="button"
            onClick={() => setMinimizeStlSynthesizer((v) => !v)}
            className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-emerald-300 hover:text-white cursor-pointer"
          >
            {minimizeStlSynthesizer ? '▸ Show Custom .STL Builder' : '▾ Min Custom .STL Builder'}
          </button>
          <button
            type="button"
            onClick={() => setMinimizeElonRoadmap((v) => !v)}
            className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-purple-300 hover:text-white cursor-pointer"
          >
            {minimizeElonRoadmap ? '▸ Show Elon Roadmap' : '▾ Min Elon Roadmap'}
          </button>
        </div>
      </div>

      {/* Filter Bar for Callout Pins */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5">
          {(
            [
              ['ALL_LAYERS', `All Callouts (${inspectedGun.screwsAndFasteners.length} Screws + ${inspectedGun.oringPlacements.length} O-Rings + ${inspectedGun.uniqueParts.length} Parts)`],
              ['SCREWS_AND_THREADS', `Screws, Threads & Torque (S1–S${inspectedGun.screwsAndFasteners.length})`],
              ['ORING_SEALS', `O-Ring Placement & Squeeze % (O1–O${inspectedGun.oringPlacements.length})`],
              ['UNIQUE_PARTS', `Unique Sub-mm Parts & .STL (P1–P${inspectedGun.uniqueParts.length})`],
            ] as Array<[BlueprintLayerFilter, string]>
          ).map(([fKey, label]) => (
            <button
              key={fKey}
              type="button"
              onClick={() => setLayerFilter(fKey)}
              className={`px-2.5 py-1 rounded text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                layerFilter === fKey
                  ? 'bg-sky-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-zinc-400">
          {isCrossInspectingOtherGun ? (
            <span className="text-amber-300">
              Viewing Blueprint of <strong>{inspectedGun.shortTitle}</strong> while{' '}
              <strong>{equippedGun.shortTitle}</strong> is equipped
            </span>
          ) : (
            <span className="text-emerald-400">
              Showing Custom Blueprint for Equipped {equippedGun.shortTitle}
            </span>
          )}
        </div>
      </div>

      {/* Custom SVG Cross-Section Blueprint(s) */}
      {!minimizeCadDiagram &&
        (compareSideBySide && isCrossInspectingOtherGun ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <div>
              <div className="text-[10px] text-emerald-400 font-bold mb-1">
                EQUIPPED GUN: {equippedGun.fullTitle}
              </div>
              {renderUniqueWeaponBlueprintSvg(equippedGun, true)}
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold mb-1">
                COMPARED BLUEPRINT: {inspectedGun.fullTitle}
              </div>
              {renderUniqueWeaponBlueprintSvg(inspectedGun, true)}
            </div>
          </div>
        ) : (
          renderUniqueWeaponBlueprintSvg(inspectedGun, false)
        ))}

      {/* EDGUN LESHIY 2 / THE LEAF .45: 6 QUANTITATIVE AIRFLOW & SIMULATION CHECKS */}
      {(inspectedGun.progressionId === 'GUN_04_LESHIY' ||
        inspectedGun.progressionId === 'GUN_04B_THE_LEAF_45') && (
        <div className="bg-zinc-900/90 border border-emerald-500/40 rounded-lg p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">
              EDgun Leshiy 2 — 6 Quantitative Air Flow &amp; Simulation Checks (100% PASS)
            </span>
            <span className="text-[10px] text-sky-300">
              300B 137cc Lower Tube → 16-Disc Belleville R.E.P.R. → 42cc 130B Plenum → 1.4ms EAR Balanced Spool → 1.8cc Bleed Pawl
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {LESHIY_2_AIRFLOW_AND_SIMULATION_CHECKS.map((chk) => (
              <div
                key={chk.checkId}
                className="bg-zinc-950/85 border border-zinc-800 rounded p-2 text-[10px]"
              >
                <div className="flex items-center justify-between font-bold text-zinc-100">
                  <span className="text-amber-300">[{chk.checkId}] {chk.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px]">
                    {chk.status}
                  </span>
                </div>
                <div className="text-sky-300 mt-0.5">
                  Target: {chk.targetThreshold} · Sim: <strong>{chk.measuredValue}</strong>
                </div>
                <div className="text-zinc-400 text-[9.5px] mt-0.5">{chk.engineeringExplanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THE P50 (.50 CAL AUTO): 6-PHASE SPACE / SAND / UNDERWATER HERMETIC CYCLE MATRIX */}
      {inspectedGun.progressionId === 'GUN_06_P50' && (
        <div className="bg-zinc-900/90 border border-sky-500/40 rounded-lg p-2.5 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase">
              The P50 (.50 Cal Auto) — 6-Phase Hermetic Slug Cycle (Space 0B · Quartz Sand IP69K · Underwater 30m)
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              {P50_EXTREME_ENVIRONMENTS.map((env) => (
                <span
                  key={env.id}
                  className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-500/40 text-amber-300"
                >
                  {env.shortBadge}: {env.ambientPressureBar} Bar ({env.temperatureRangeC})
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-1.5">
            {P50_HERMETIC_6PHASE_CYCLE_STAGES.map((st) => (
              <div
                key={st.phaseCode}
                className="bg-zinc-950/90 border border-zinc-800 rounded p-2 text-[10px]"
              >
                <div className="text-amber-400 font-bold">{st.phaseCode}</div>
                <div className="text-zinc-100 font-semibold mt-0.5">{st.shortTitle}</div>
                <div className="text-zinc-400 text-[9.5px] mt-1">{st.mechanicalAction}</div>
                <div className="text-emerald-300 text-[9px] mt-1 border-t border-zinc-800/80 pt-1">
                  {st.spaceSandUnderwaterFeature}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stlDownloadNotice && (
        <div className="bg-emerald-950/60 border border-emerald-500/60 rounded px-3 py-1.5 text-[11px] text-emerald-200 flex items-center justify-between">
          <span>{stlDownloadNotice}</span>
          <button
            type="button"
            onClick={() => setStlDownloadNotice(null)}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Complete Engineering Specification: Screws/Threads | O-Ring Placements | Unique Printable Parts */}
      {!minimizeSpecsColumns && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          {/* Column 1: Exact Fasteners, Screws, Threads & Torque Specs */}
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5">
            <div className="text-[11px] font-bold text-amber-400 mb-1.5">
              01. Screws, Threads &amp; Fastener Schedule ({inspectedGun.screwsAndFasteners.length})
            </div>
            <div className="space-y-1.5">
              {inspectedGun.screwsAndFasteners.map((scr, idx) => (
                <div
                  key={scr.code}
                  onClick={() => setSelectedCalloutCode(scr.code)}
                  className={`p-2 rounded border transition-colors cursor-pointer ${
                    selectedCalloutCode === scr.code
                      ? 'bg-amber-500/15 border-amber-400'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-100">
                    <span>
                      [S{idx + 1}] {scr.name}
                    </span>
                    <span className="text-amber-300 tabular-nums">{scr.torqueNm} N·m</span>
                  </div>
                  <div className="text-[10px] text-amber-200/90 mt-0.5">
                    {scr.threadMetricSpec} · {scr.headAndDrive}
                  </div>
                  <div className="text-[9.5px] text-zinc-400 mt-0.5">
                    {scr.materialGrade} — {scr.locationAndRole}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Exact O-Ring Placement, Gland Squeeze & Durometer Specs */}
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5">
            <div className="text-[11px] font-bold text-sky-400 mb-1.5">
              02. O-Ring Placement, Compound &amp; Squeeze ({inspectedGun.oringPlacements.length})
            </div>
            <div className="space-y-1.5">
              {inspectedGun.oringPlacements.map((or, idx) => (
                <div
                  key={or.code}
                  onClick={() => setSelectedCalloutCode(or.code)}
                  className={`p-2 rounded border transition-colors cursor-pointer ${
                    selectedCalloutCode === or.code
                      ? 'bg-sky-500/15 border-sky-400'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-100">
                    <span>
                      [O{idx + 1}] {or.name}
                    </span>
                    <span className="text-sky-300 tabular-nums">
                      {or.glandSqueezePct}% Squeeze · {or.maxRatedBar}B
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-200/90 mt-0.5">
                    {or.isoOrParkerSizeMm} · {or.compoundAndDurometer}
                  </div>
                  <div className="text-[9.5px] text-zinc-400 mt-0.5">
                    [{or.sealType.replace(/_/g, ' ')}] {or.placementAndFunction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Unique Sub-mm Weapon Parts & 1-Click .STL Synthesis */}
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-2.5 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-400 mb-1.5">
                03. Unique Weapon Parts &amp; Sub-mm .STL ({inspectedGun.uniqueParts.length})
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {inspectedGun.uniqueParts.map((pt, idx) => (
                  <div
                    key={pt.partCode}
                    onClick={() => setSelectedCalloutCode(pt.partCode)}
                    className={`p-2 rounded border transition-colors cursor-pointer ${
                      selectedCalloutCode === pt.partCode
                        ? 'bg-emerald-500/15 border-emerald-400'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-zinc-100">
                      <span className="truncate">
                        [P{idx + 1}] {pt.partName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPartStl(
                            pt.partCode,
                            pt.partName,
                            inspectedGun.defaultCaliberMm,
                            pt.dimensionsMm,
                            pt.roleDescription
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[9px] hover:bg-emerald-400 cursor-pointer shrink-0"
                      >
                        Create .STL
                      </button>
                    </div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">{pt.dimensionsMm}</div>
                    <div className="text-[9.5px] text-zinc-400 mt-0.5">
                      {pt.material} — {pt.roleDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800 text-[10px] text-zinc-300">
              <span className="text-amber-400 font-bold">Cycle &amp; Seal Physics: </span>
              {inspectedGun.functionalCycleSummary}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PROMPT & SPEC-TO-STL BUILDER (Generates Unique Watertight .STL Mesh From Description & Specs) */}
      {!minimizeStlSynthesizer && (
        <div className="bg-zinc-900/90 border border-emerald-500/40 rounded-lg p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Custom Prompt &amp; Spec-to-.STL CAD Synthesizer (10 Distinct 3D Mesh Archetypes)
              </span>
              <p className="text-[10px] text-zinc-400">
                Every blueprint part and custom prompt generates a unique watertight 3D manifold .STL based on exact dimensions (OD, ID, Length, Chambers/Baffles, Threads) — never a duplicate cylinder.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSynthesizeCustomPromptStl}
              disabled={isAiSynthesizingStl}
              className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[10.5px] hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
            >
              {isAiSynthesizingStl
                ? 'Synthesizing Unique .STL...'
                : '⚡ Create Custom .STL From Specs & Description'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[10px]">
            <div className="md:col-span-3">
              <label className="block text-zinc-400 mb-0.5">Custom Part Title</label>
              <input
                type="text"
                value={customPartName}
                onChange={(e) => setCustomPartName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-zinc-400 mb-0.5">3D Geometry Archetype</label>
              <select
                value={customArchetype}
                onChange={(e) => setCustomArchetype(e.target.value as ParametricStlArchetype)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-emerald-300 font-semibold"
              >
                {STL_ARCHETYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-6">
              <label className="block text-zinc-400 mb-0.5">
                Engineering Description &amp; Sub-mm Specs (Parsed by Gemini / CAD Engine)
              </label>
              <input
                type="text"
                value={customPartPrompt}
                onChange={(e) => setCustomPartPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 flex items-center justify-between">
              <span className="text-zinc-400">Length (mm):</span>
              <input
                type="number"
                step="0.5"
                value={customLengthMm}
                onChange={(e) => setCustomLengthMm(Math.max(2, Number(e.target.value) || 20))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right text-amber-300 font-bold"
              />
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 flex items-center justify-between">
              <span className="text-zinc-400">Outer Ø OD (mm):</span>
              <input
                type="number"
                step="0.25"
                value={customOdMm}
                onChange={(e) => setCustomOdMm(Math.max(3, Number(e.target.value) || 16))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right text-sky-300 font-bold"
              />
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 flex items-center justify-between">
              <span className="text-zinc-400">Inner Bore Ø ID (mm):</span>
              <input
                type="number"
                step="0.05"
                value={customIdMm}
                onChange={(e) => setCustomIdMm(Math.max(0, Number(e.target.value) || 6.35))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right text-emerald-300 font-bold"
              />
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 flex items-center justify-between">
              <span className="text-zinc-400">Chambers / Baffles:</span>
              <input
                type="number"
                step="1"
                min={1}
                max={24}
                value={customChamberCount}
                onChange={(e) => setCustomChamberCount(Math.max(1, Number(e.target.value) || 6))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right text-purple-300 font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* ELON MUSK 5-STEP FIRST-PRINCIPLES AGENT REVERSE-ENGINEERING ROADMAP FOR THIS WEAPON */}
      {!minimizeElonRoadmap && (
        <div className="bg-zinc-900/85 border border-amber-500/40 rounded-lg p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase">
                Elon Musk 5-Step Agent Reverse-Engineering Roadmap — {inspectedElonRoadmap.gunFullTitle}
              </span>
              <p className="text-[10px] text-zinc-300 mt-0.5">
                {inspectedElonRoadmap.elonExecutiveDirective}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
              Spec Accuracy: {inspectedElonRoadmap.specAccuracyPct}% ({inspectedElonRoadmap.blueprintRevision})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {inspectedElonRoadmap.milestones.map((m) => (
              <div
                key={m.stepNumber}
                className="bg-zinc-950/90 border border-zinc-800 rounded p-2 text-[10px]"
              >
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>{m.elonPrincipleLabel}</span>
                  <span className="text-emerald-400 text-[9px]">{m.completionPct}%</span>
                </div>
                <div className="text-sky-300 text-[9.5px] mt-0.5">{m.assignedAgentName}</div>
                <div className="text-zinc-300 text-[9.5px] mt-1">{m.reverseEngineeredSolution}</div>
                <div className="text-emerald-300/90 text-[9px] mt-1 border-t border-zinc-800 pt-1">
                  Target: {m.subMillimeterSpecVerification}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

