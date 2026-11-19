/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dungeon Crawler Carl (DCC) Inspired Systems:
 * 1. HRH Princess Donut (Grand Champion Best-in-Dungeon) Aristocratic Show-Cat Companion
 *    with Autonomous Free-Will Banter, Twin Ocular Magic-Missile Eye-Beams, and Persistent Memory.
 * 2. Princess Donut's Royal Court of Agents (5 specialized court agents actively crafting
 *    and verifying bespoke Royal Guard gear & equipment for Princess Donut and her Guard).
 * 3. Post-Round Unhinged Sarcastic Game-Show System AI ("NEW ACHIEVEMENT!") & Loot Boxes.
 */

export interface DccCompanionChatEntry {
  id: string;
  senderTitle: string;
  message: string;
  combatAction: string;
  timestampIso: string;
  isPlayer?: boolean;
}

export type RoyalCourtAgentId =
  | 'COURT_01_SIR_REND_PAW'
  | 'COURT_02_LADY_WHISKER_CAD'
  | 'COURT_03_LORD_CHONK_FORGE'
  | 'COURT_04_DAME_VELOUR'
  | 'COURT_05_MASTER_MONGO_WRANGLER';

export type RoyalGuardEquipmentId = string;

export interface PrincessDonutRoyalCourtAgent {
  agentId: RoyalCourtAgentId;
  royalTitle: string;
  callsign: string;
  specialty: string;
  assignedEquipmentId: string;
  assignedEquipmentTitle: string;
  currentOrder: string;
  verificationStatus: 'VERIFIED_ROYAL_SPEC' | 'FORGING_UPGRADE' | 'AWAITING_DECREE';
  completionPct: number;
  qualityTierLabel: string;
  statBonusSummary: string;
  lastReportQuote: string;
}

export interface RoyalGuardEquipmentSpec {
  equipmentId: string;
  slotLabel: string;
  title: string;
  craftedByAgentId: RoyalCourtAgentId;
  materialSpec: string;
  tierLevel: number;
  ocularBeamBonusDmg: number;
  guardArmorBonusHp: number;
  verificationBadge: string;
  description: string;
}

export interface DccCompanionPersistentMemory {
  companionName: string;
  level: number;
  charismaScore: number;
  ocularBeamDamage: number;
  totalEyeBeamKills: number;
  learnedFacts: string[];
  chatHistory: DccCompanionChatEntry[];
  royalCourtAgents: PrincessDonutRoyalCourtAgent[];
  royalGuardEquipment: RoyalGuardEquipmentSpec[];
  courtDecreesIssued: number;
}

export interface DccSystemAiPostRoundBroadcast {
  waveNumber: number;
  isVictory: boolean;
  achievementTitle: string;
  aiMonologue: string;
  lootBoxTier: 'BRONZE_PNEUMATIC_BOX' | 'GOLD_CHONK_BOX' | 'CELESTIAL_300BAR_BOX';
  lootBoxName: string;
  rewardItemTitle: string;
  rewardDescription: string;
  bonusFilamentGrams: number;
  bonusBurstDisks: number;
  bonusPeekGrams: number;
  opened: boolean;
}

export const INITIAL_ROYAL_COURT_AGENTS: PrincessDonutRoyalCourtAgent[] = [
  {
    agentId: 'COURT_01_SIR_REND_PAW',
    royalTitle: 'Sir Rend-Paw the Ballistic Armorer',
    callsign: 'ROYAL-ARMORER-01',
    specialty: 'Ti-6Al-4V Pet-Carrier Turret Mounts & #01 Mongo Coaxial Breech Collars',
    assignedEquipmentId: 'EQ_ROYAL_TURRET_HARNESS',
    assignedEquipmentTitle: ' Sovereign Floating Shoulder Palanquin & Gimbal Harness',
    currentOrder: 'Machining ±0.002mm gyro-stabilized Ti-6Al-4V shoulder palanquin rails for zero-recoil ocular beam lock.',
    verificationStatus: 'VERIFIED_ROYAL_SPEC',
    completionPct: 98,
    qualityTierLabel: 'Imperial Best-in-Show Mk.IV',
    statBonusSummary: '+14 Ocular Beam DMG · -22% Recoil Drift',
    lastReportQuote: 'Your Majesty, the titanium palanquin is balanced to 0.002mm. Even when Mongo fires a 220-Bar slug, your tiara will not tilt a single arc-second.',
  },
  {
    agentId: 'COURT_02_LADY_WHISKER_CAD',
    royalTitle: 'Lady Whisker-CAD the Tiara & Optics Smith',
    callsign: 'ROYAL-OPTICS-02',
    specialty: 'Sapphire Star-Shaped Lenses, Focusing Prisms & Crown Emitter Arrays',
    assignedEquipmentId: 'EQ_SAPPHIRE_TIARA_ARRAY',
    assignedEquipmentTitle: 'Grand Champion Diamond-Faceted Tiara & Star-Lens Focusing Array',
    currentOrder: 'Polishing synthetic ruby & AlON star-sunglasses prisms for twin coherent magic-missile beams.',
    verificationStatus: 'VERIFIED_ROYAL_SPEC',
    completionPct: 99,
    qualityTierLabel: 'Grand Champion Best-in-Dungeon',
    statBonusSummary: '+18 Ocular Beam DMG · +35% Beam Crit Coherence',
    lastReportQuote: 'The pink sapphire star-lenses have been laser-interferometer verified. Feral Swarm retinas stand zero chance against Your Grace.',
  },
  {
    agentId: 'COURT_03_LORD_CHONK_FORGE',
    royalTitle: 'Lord Chonk-Forge the 300-Bar Bespoke Metallurgist',
    callsign: 'ROYAL-FORGE-03',
    specialty: '17-4PH H900 Guard Pauldrons, Maraging C300 Sealer Rings & #09 Protector Barrels',
    assignedEquipmentId: 'EQ_GUARD_300B_CUIRASS',
    assignedEquipmentTitle: 'Royal Guard 300-Bar Pneumatic Exo-Cuirass & Pauldrons',
    currentOrder: 'Sintering DMLS 17-4PH pauldrons and dual-barrel air-reserve baffles for Princess Donut’s Personal Guard.',
    verificationStatus: 'VERIFIED_ROYAL_SPEC',
    completionPct: 96,
    qualityTierLabel: 'Syndicate Celestial Grade',
    statBonusSummary: '+25 Royal Guard Armor HP · 3.45× Lamé Burst Safety',
    lastReportQuote: 'Every Royal Guard breastplate has been hydro-tested to 450 Bar. No mere dungeon crawler ruffian shall breach Your Majesty’s perimeter.',
  },
  {
    agentId: 'COURT_04_DAME_VELOUR',
    royalTitle: 'Dame Velour the Royal Guard Shield-Weaver',
    callsign: 'ROYAL-SHIELD-04',
    specialty: 'PEEK-GF30 Ballistic Velour Capes & Acoustic Tishina Baffle Cloaks',
    assignedEquipmentId: 'EQ_VELOUR_BALLISTIC_MANTLE',
    assignedEquipmentTitle: 'Ermine-Trimmed PEEK-GF30 Ballistic Mantle & Acoustic Shroud',
    currentOrder: 'Weaving carbon-aramid ballistic lining inside royal purple velour so blood spatter never stains the fur.',
    verificationStatus: 'VERIFIED_ROYAL_SPEC',
    completionPct: 97,
    qualityTierLabel: 'Aristocratic Velour Mk.V',
    statBonusSummary: '+20 Guard Shield HP · Stain-Proof Fur Guarantee',
    lastReportQuote: 'I have triple-sealed the hem with FKM-90 fluorocarbon, Princess. Not a drop of goblin ichor shall ever touch your tortoiseshell coat.',
  },
  {
    agentId: 'COURT_05_MASTER_MONGO_WRANGLER',
    royalTitle: 'Master Mongo-Wrangler the Ordnance Scribe',
    callsign: 'ROYAL-ORDNANCE-05',
    specialty: 'Shared .50 Cal SHELL-50-220B Cartridges for #01 Mongo, #03 Defender & #09 The Protector',
    assignedEquipmentId: 'EQ_MONGO_ROYAL_BANDOLIER',
    assignedEquipmentTitle: 'Royal Guard Pressurized .50 SHELL-50-220B & Scatter Bandolier',
    currentOrder: 'Charging 220-Bar CuNi 90/10 burst-disk shells and 8-pellet flechette scatter sabots for #01 Mongo and #09 The Protector.',
    verificationStatus: 'VERIFIED_ROYAL_SPEC',
    completionPct: 100,
    qualityTierLabel: 'Royal Ordnance Masterwork',
    statBonusSummary: '+12 Ocular Beam DMG · Instant Single-Round Breech Reloads',
    lastReportQuote: 'Mongo’s .50 caliber 220-Bar shells and The Protector’s reverse-loop scatter cartridges are polished to a mirror sheen, Your Highness!',
  },
];

export const INITIAL_ROYAL_GUARD_EQUIPMENT: RoyalGuardEquipmentSpec[] = [
  {
    equipmentId: 'EQ_SAPPHIRE_TIARA_ARRAY',
    slotLabel: 'CROWN & OCULAR OPTICS',
    title: 'Grand Champion Diamond-Faceted Tiara & Star-Lens Focusing Array',
    craftedByAgentId: 'COURT_02_LADY_WHISKER_CAD',
    materialSpec: '24K Gold-Plated Ti-6Al-4V + AlON Pink Sapphire Prisms',
    tierLevel: 5,
    ocularBeamBonusDmg: 18,
    guardArmorBonusHp: 10,
    verificationBadge: '100% Court Verified (±0.001mm)',
    description: 'Collimates HRH Princess Donut’s twin ocular magic-missile eye-beams for pinpoint Swarm vaporization.',
  },
  {
    equipmentId: 'EQ_ROYAL_TURRET_HARNESS',
    slotLabel: 'HOVER PALANQUIN',
    title: 'Sovereign Floating Shoulder Palanquin & Gimbal Harness',
    craftedByAgentId: 'COURT_01_SIR_REND_PAW',
    materialSpec: 'Aerospace 7075-T651 + Carbon-Nylon PA12-CF Damper',
    tierLevel: 5,
    ocularBeamBonusDmg: 14,
    guardArmorBonusHp: 15,
    verificationBadge: '100% Court Verified (±0.002mm)',
    description: 'Keeps Princess Donut hovering in regal comfort above her Royal Guard while tracking targets 360°.',
  },
  {
    equipmentId: 'EQ_GUARD_300B_CUIRASS',
    slotLabel: 'ROYAL GUARD ARMOR',
    title: 'Royal Guard 300-Bar Pneumatic Exo-Cuirass & Pauldrons',
    craftedByAgentId: 'COURT_03_LORD_CHONK_FORGE',
    materialSpec: 'DMLS 17-4PH H900 Stainless + Maraging 300 Insert Plates',
    tierLevel: 5,
    ocularBeamBonusDmg: 8,
    guardArmorBonusHp: 25,
    verificationBadge: '100% Court Verified (450-Bar Hydro)',
    description: 'Heavy high-pressure plate armor worn by the Royal Guard escorting Princess Donut through the dungeon.',
  },
  {
    equipmentId: 'EQ_VELOUR_BALLISTIC_MANTLE',
    slotLabel: 'ROYAL MANTLE',
    title: 'Ermine-Trimmed PEEK-GF30 Ballistic Mantle & Acoustic Shroud',
    craftedByAgentId: 'COURT_04_DAME_VELOUR',
    materialSpec: 'PEEK-GF30 + Hydrophobic Royal Purple Velour Weave',
    tierLevel: 5,
    ocularBeamBonusDmg: 6,
    guardArmorBonusHp: 20,
    verificationBadge: '100% Court Verified (Zero-Spatter)',
    description: 'Repels shrapnel, acid, and unsightly dungeon grime while maintaining aristocratic pageant poise.',
  },
  {
    equipmentId: 'EQ_MONGO_ROYAL_BANDOLIER',
    slotLabel: 'ROYAL ORDNANCE RIG',
    title: 'Royal Guard Pressurized .50 SHELL-50-220B & Scatter Bandolier',
    craftedByAgentId: 'COURT_05_MASTER_MONGO_WRANGLER',
    materialSpec: '7075-T6 Anodized Gold + CuNi 90/10 220-Bar Burst Foils',
    tierLevel: 5,
    ocularBeamBonusDmg: 12,
    guardArmorBonusHp: 12,
    verificationBadge: '100% Court Verified (220-Bar Certified)',
    description: 'Supplies pre-charged .50 Cal cartridges for #01 Mongo, #03 Double Barrel Defender, and #09 The Protector.',
  },
];

const COMPANION_MEMORY_STORAGE_KEY = 'bar250_dcc_companion_memory_v2';

export function createInitialDccCompanionMemory(): DccCompanionPersistentMemory {
  return {
    companionName: 'HRH Princess Donut (Grand Champion Best-in-Dungeon)',
    level: 7,
    charismaScore: 98,
    ocularBeamDamage: 48,
    totalEyeBeamKills: 14,
    learnedFacts: [
      'Player standardized #01 Mongo and #03 Double Barrel Defender on the shared .50 Cal (12.7mm) 220-Bar SHELL-50-220B cartridge.',
      'Princess Donut’s Royal Court of 5 Agents continuously forges and verifies bespoke Royal Guard gear and tiara optics.',
      'Added #09 The Protector with dual threaded air-reserve barrels and reverse-loop center-barrel scatter airflow.',
    ],
    chatHistory: [
      {
        id: 'init-msg-1',
        senderTitle: 'HRH Princess Donut',
        message:
          'CARL! Ensure my Royal Court of Agents has polished my sapphire tiara and loaded #01 Mongo with a fresh 220-Bar .50 shell before those dreadful Swarm creatures ruin my coat!',
        combatAction: 'Polishing Tiara & Charging Twin Ocular Eye-Beams',
        timestampIso: '2026-10-31T08:00:00Z',
      },
    ],
    royalCourtAgents: INITIAL_ROYAL_COURT_AGENTS,
    royalGuardEquipment: INITIAL_ROYAL_GUARD_EQUIPMENT,
    courtDecreesIssued: 5,
  };
}

export function loadDccCompanionMemory(): DccCompanionPersistentMemory {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(COMPANION_MEMORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DccCompanionPersistentMemory>;
        if (parsed && parsed.companionName && Array.isArray(parsed.learnedFacts)) {
          return {
            ...createInitialDccCompanionMemory(),
            ...parsed,
            royalCourtAgents:
              Array.isArray(parsed.royalCourtAgents) && parsed.royalCourtAgents.length === 5
                ? parsed.royalCourtAgents
                : INITIAL_ROYAL_COURT_AGENTS,
            royalGuardEquipment:
              Array.isArray(parsed.royalGuardEquipment) && parsed.royalGuardEquipment.length === 5
                ? parsed.royalGuardEquipment
                : INITIAL_ROYAL_GUARD_EQUIPMENT,
          };
        }
      }
    }
  } catch {
    // Ignore storage read errors in restricted frames
  }
  return createInitialDccCompanionMemory();
}

export function saveDccCompanionMemory(mem: DccCompanionPersistentMemory): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(COMPANION_MEMORY_STORAGE_KEY, JSON.stringify(mem));
    }
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Commands one of Princess Donut's Royal Court Agents (or the entire Royal Court)
 * to execute an immediate upgrade & verification pass on Princess Donut's and her Royal Guard's gear.
 */
export function commandRoyalCourtAgentWork(
  memory: DccCompanionPersistentMemory,
  targetAgentId: RoyalCourtAgentId | 'ALL_ROYAL_COURT' = 'ALL_ROYAL_COURT',
  customRoyalDecree?: string
): {
  nextMemory: DccCompanionPersistentMemory;
  statusSummary: string;
} {
  const decreeText =
    customRoyalDecree?.trim() ||
    'Tighten sub-millimeter tolerances, hydro-test to 300 Bar, and increase Ocular Beam & Royal Guard armor output.';

  const updatedAgents = memory.royalCourtAgents.map((ag) => {
    if (targetAgentId !== 'ALL_ROYAL_COURT' && ag.agentId !== targetAgentId) {
      return ag;
    }
    return {
      ...ag,
      verificationStatus: 'VERIFIED_ROYAL_SPEC' as const,
      completionPct: 100,
      currentOrder: `Royal Decree Executed: ${decreeText}`,
      lastReportQuote: `[Verified v${memory.courtDecreesIssued + 1}.0] ${ag.royalTitle} upgraded ${ag.assignedEquipmentTitle} under Princess Donut’s direct royal decree!`,
    };
  });

  const updatedEquipment = memory.royalGuardEquipment.map((eq) => {
    if (targetAgentId !== 'ALL_ROYAL_COURT' && eq.craftedByAgentId !== targetAgentId) {
      return eq;
    }
    return {
      ...eq,
      tierLevel: eq.tierLevel + 1,
      ocularBeamBonusDmg: eq.ocularBeamBonusDmg + 4,
      guardArmorBonusHp: eq.guardArmorBonusHp + 5,
      verificationBadge: `100% Court Verified (Tier ${eq.tierLevel + 1} · ±0.001mm)`,
    };
  });

  const totalBeamBonus = updatedEquipment.reduce((acc, e) => acc + e.ocularBeamBonusDmg, 0);
  const nextBeamDamage = Math.max(memory.ocularBeamDamage + 4, 36 + Math.round(totalBeamBonus * 0.45));

  const royalChatEntry: DccCompanionChatEntry = {
    id: `court-decree-${Date.now()}`,
    senderTitle: 'HRH Princess Donut',
    message:
      targetAgentId === 'ALL_ROYAL_COURT'
        ? `ROYAL DECREE ISSUED! All 5 members of my Royal Court have upgraded my Tiara Optics, Hover Palanquin, and Royal Guard 300-Bar Armor! Ocular Beam now hits for ${nextBeamDamage} DMG!`
        : `Well done, ${updatedAgents.find((a) => a.agentId === targetAgentId)?.royalTitle}! That equipment is finally worthy of a Grand Champion Best-in-Dungeon!`,
    combatAction: 'Royal Court Equipment Verification Complete',
    timestampIso: new Date().toISOString(),
  };

  const nextMemory: DccCompanionPersistentMemory = {
    ...memory,
    level: memory.level + (targetAgentId === 'ALL_ROYAL_COURT' ? 1 : 0),
    ocularBeamDamage: nextBeamDamage,
    royalCourtAgents: updatedAgents,
    royalGuardEquipment: updatedEquipment,
    courtDecreesIssued: memory.courtDecreesIssued + 1,
    learnedFacts: [
      `Royal Court Decree #${memory.courtDecreesIssued + 1}: Upgraded Royal Guard gear & Tiara array (${decreeText.slice(0, 64)})`,
      ...memory.learnedFacts,
    ].slice(0, 10),
    chatHistory: [...memory.chatHistory, royalChatEntry].slice(-14),
  };

  saveDccCompanionMemory(nextMemory);

  return {
    nextMemory,
    statusSummary:
      targetAgentId === 'ALL_ROYAL_COURT'
        ? `👑 Princess Donut's Royal Court (5/5 Agents) completed a full Royal Guard & Tiara upgrade! Ocular Beam: ${nextBeamDamage} DMG.`
        : `👑 Commanded ${updatedAgents.find((a) => a.agentId === targetAgentId)?.royalTitle}: Upgraded ${updatedEquipment.find((e) => e.craftedByAgentId === targetAgentId)?.title}!`,
  };
}

/**
 * Calls the server-side Gemini 3.8 Flash proxy `/api/dcc/companion-banter`
 * so HRH Princess Donut generates real contextual banter and learns a new fact.
 * Includes a deterministic aristocratic fallback if offline.
 */
export async function requestGenerativeCompanionBanter(params: {
  triggerType:
    | 'AUTONOMOUS_FREE_WILL'
    | 'PLAYER_CHAT'
    | 'WEAPON_SWITCHED'
    | 'SWARM_WAVE_STARTED'
    | 'STL_PART_SYNTHESIZED';
  playerMessage?: string;
  equippedWeaponTitle: string;
  caliberMm: number;
  waveNumber: number;
  swarmKills: number;
  currentMemory: DccCompanionPersistentMemory;
}): Promise<{
  entry: DccCompanionChatEntry;
  newLearnedFact: string;
}> {
  try {
    const resp = await fetch('/api/dcc/companion-banter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triggerType: params.triggerType,
        playerMessage: params.playerMessage || '',
        equippedWeaponTitle: params.equippedWeaponTitle,
        caliberMm: params.caliberMm,
        waveNumber: params.waveNumber,
        swarmKills: params.swarmKills,
        learnedFacts: params.currentMemory.learnedFacts,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.banter) {
        return {
          entry: {
            id: `chat-${Date.now()}`,
            senderTitle: params.currentMemory.companionName,
            message: String(data.banter),
            combatAction: String(data.combatAction || 'Firing Twin Ocular Magic-Missile Eye-Beams'),
            timestampIso: new Date().toISOString(),
          },
          newLearnedFact: String(
            data.learnedMemoryFact ||
              `Player tested ${params.equippedWeaponTitle} (${params.caliberMm}mm) on Wave ${params.waveNumber}.`
          ),
        };
      }
    }
  } catch {
    // Fall through to deterministic aristocratic show-cat banter
  }

  const fallbackLines: Record<typeof params.triggerType, string> = {
    AUTONOMOUS_FREE_WILL: `Honestly, Carl, watching these Feral Swarm creatures waddle toward us while you admire the ${params.equippedWeaponTitle} is exhausting. Stand back—my Royal Court calibrated my tiara eye-beams for this!`,
    PLAYER_CHAT: `I heard every word, darling! Make sure that ${params.caliberMm}mm chamber is sealed to 250 Bar—my Royal Court refuses to let soot touch my championship fur.`,
    WEAPON_SWITCHED: `Ooh, switching to the ${params.equippedWeaponTitle} in ${params.caliberMm}mm! A vastly more photogenic choice for the intergalactic broadcast feeds.`,
    SWARM_WAVE_STARTED: `Wave ${params.waveNumber} of the Evil Swarm is breaching the sector! Focus your ${params.caliberMm}mm slugs on the heavy armor while my ocular beams vaporize the flankers!`,
    STL_PART_SYNTHESIZED: `A fresh watertight .STL component! Tell Sir Rend-Paw and Lady Whisker-CAD to inspect the sub-millimeter tolerances immediately.`,
  };

  return {
    entry: {
      id: `chat-${Date.now()}`,
      senderTitle: params.currentMemory.companionName,
      message: fallbackLines[params.triggerType],
      combatAction: 'Autonomous Ocular Turret Lock Active',
      timestampIso: new Date().toISOString(),
    },
    newLearnedFact: `Player deployed ${params.equippedWeaponTitle} (${params.caliberMm}mm) during Wave ${params.waveNumber}.`,
  };
}

/**
 * Calls `/api/dcc/system-ai-round-end` to generate an unhinged, sarcastic
 * Dungeon Crawler Carl-style System AI post-round broadcast ("NEW ACHIEVEMENT!")
 * and a tiered Loot Box reward.
 */
export async function requestPostRoundSystemAiBroadcast(params: {
  waveNumber: number;
  isVictory: boolean;
  clearTimeSec: number;
  score: number;
  equippedWeaponTitle: string;
  caliberMm: number;
  companionBeamsFired: number;
}): Promise<DccSystemAiPostRoundBroadcast> {
  try {
    const resp = await fetch('/api/dcc/system-ai-round-end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.achievementTitle && data.aiMonologue) {
        return {
          waveNumber: params.waveNumber,
          isVictory: params.isVictory,
          achievementTitle: String(data.achievementTitle),
          aiMonologue: String(data.aiMonologue),
          lootBoxTier: data.lootBoxTier || 'GOLD_CHONK_BOX',
          lootBoxName: String(data.lootBoxName || 'Gold Royal Pneumatic Syndicate Box'),
          rewardItemTitle: String(
            data.rewardItemTitle || 'Royal Court 300-Bar Titanium Valve & Foil Bundle'
          ),
          rewardDescription: String(
            data.rewardDescription ||
              'Contains aerospace PEEK-GF30 filament, pre-scored .50 Cal SHELL-50-220B burst foils, and Viton FKM-90 seals.'
          ),
          bonusFilamentGrams: Number(data.bonusFilamentGrams) || 120,
          bonusBurstDisks: Number(data.bonusBurstDisks) || 6,
          bonusPeekGrams: Number(data.bonusPeekGrams) || 65,
          opened: false,
        };
      }
    }
  } catch {
    // Fall through to deterministic System AI broadcast
  }

  return {
    waveNumber: params.waveNumber,
    isVictory: params.isVictory,
    achievementTitle: params.isVictory
      ? `NEW ACHIEVEMENT! PNEUMATIC OVERPRESSURE SURVIVOR (WAVE ${params.waveNumber})!`
      : `NEW ACHIEVEMENT! DEPRESSURIZED CRAWLER PANCAKE!`,
    aiMonologue: params.isVictory
      ? `NEEEEW ACHIEVEMENT! You cleared Wave ${params.waveNumber} in ${params.clearTimeSec.toFixed(
          1
        )} seconds using the ${params.equippedWeaponTitle} (${
          params.caliberMm
        }mm) while HRH Princess Donut judged your footwork and fried ${
          params.companionBeamsFired
        } Swarm freaks with her eyeballs! The Syndicate sponsors are mildly entertained. Have a shiny box!`
      : `NEEEEW ACHIEVEMENT! You let the Feral Swarm overrun your position while holding a 250-Bar air cannon! Princess Donut is filing for a new bodyguard as we speak. Take this pity box and pump faster next time!`,
    lootBoxTier: params.isVictory ? 'CELESTIAL_300BAR_BOX' : 'BRONZE_PNEUMATIC_BOX',
    lootBoxName: params.isVictory
      ? 'Celestial 300-Bar Syndicate Sponsor Crate'
      : 'Bronze Crawler Consolation Pneumatic Box',
    rewardItemTitle: params.isVictory
      ? 'Syndicate Overpressure .50 SHELL-50-220B & PEEK-GF30 Master Kit'
      : 'Emergency Field Viton Seal & PA12-CF Patch Spool',
    rewardDescription:
      'Directly credits your Survivor 3D-Printer inventory with aerospace polymers and pre-scored CuNi 90/10 burst disks.',
    bonusFilamentGrams: params.isVictory ? 150 : 75,
    bonusBurstDisks: params.isVictory ? 8 : 4,
    bonusPeekGrams: params.isVictory ? 80 : 40,
    opened: false,
  };
}
