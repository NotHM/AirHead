import {
  RIDICULOUS_DCC_ENEMIES_CATALOG,
  RidiculousDccEnemyId,
} from './airPhysicsRangeAndStorageEngine';

export type EnemyArchetype = 'SWARMER_SCOUT' | 'KITER_SNIPER_DRONE' | 'HEAVY_BREACHER_MECH';

export interface ArenaEnemy {
  id: string;
  archetype: EnemyArchetype;
  dccEnemyId?: RidiculousDccEnemyId;
  dccTitle?: string;
  dccColorHex?: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  yaw: number;
  hp: number;
  maxHp: number;
  radius: number;
  state: 'IDLE_PATROL' | 'SEEK_OR_KITE' | 'WINDUP_TELEGRAPH' | 'ATTACK_ACTIVE' | 'KO_TOPPLE';
  stateTimer: number;
  hitFlashTimer: number;
  koProgress: number; // 0 to 1 over 0.4s before removal
  strafeSign: number;
}

export interface ArenaPickup {
  id: string;
  type: 'HPA_SCUBA_BOTTLE' | 'SLUG_TIN_AMMO' | 'SILICONE_LUBE_KIT' | 'MED_INJECTOR';
  x: number;
  z: number;
  collected: boolean;
  label: string;
}

export interface GeneratedArenaMap {
  seed: number;
  sectorName: string;
  gridSize: number;
  tileSize: number;
  /** 0 = open floor, 1 = tactical bunker wall/pillar, 2 = low cover crate, 3 = central landmark tower */
  cells: number[][];
  playerSpawn: { x: number; z: number; yaw: number };
  landmarkPos: { x: number; z: number };
  enemies: ArenaEnemy[];
  pickups: ArenaPickup[];
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SECTOR_PREFIXES = [
  'Quarantine Zone 04 // Pneumatic Foundry',
  'Dead-Sector B9 // OTB Outpost',
  'Gothenburg Bio-Containment Yard',
  'Karelian 250-Bar Survivor Depot',
  'Sub-Zero Zombie Breach Perimeter',
  'Silent-Bore Scavenger Industrial Sector',
];

/**
 * Generates a deterministic random tactical arena with >= 2-tile-wide corridors,
 * guaranteed open player spawn facing a clear vista toward the central landmark,
 * and BFS-verified connectivity.
 */
export function generateRandomArena(seed: number, wave: number = 1): GeneratedArenaMap {
  const rng = mulberry32(seed + wave * 7919);
  const gridSize = 18;
  const tileSize = 4.0;

  const cells: number[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
  );

  // Perimeter rocky outcrops / industrial barriers
  for (let i = 0; i < gridSize; i++) {
    cells[0][i] = 1;
    cells[gridSize - 1][i] = 1;
    cells[i][0] = 1;
    cells[i][gridSize - 1] = 1;
  }

  // Central Landmark High-Pressure Compressor Tower at (9, 9)
  cells[9][9] = 3;

  // Place symmetric/tactical cover clusters while keeping 2-tile-wide lanes clear
  // Player spawns at grid (9, 15) looking North (-Z, yaw = 0) along a guaranteed clear 3-tile wide boulevard
  for (let r = 2; r < gridSize - 2; r += 3) {
    for (let c = 2; c < gridSize - 2; c += 3) {
      // Keep spawn zone (rows 13..16, cols 7..11) and central vista avenue (cols 8..10, rows 9..16) 100% open
      if (c >= 7 && c <= 11 && r >= 10) continue;
      if (r === 9 && c === 9) continue;

      const roll = rng();
      if (roll < 0.38) {
        cells[r][c] = 1; // Tall bunker pillar
      } else if (roll < 0.68) {
        cells[r][c] = 2; // Low cover ballistic crate
      }
    }
  }

  const cellToWorld = (row: number, col: number) => ({
    x: (col - gridSize / 2 + 0.5) * tileSize,
    z: (row - gridSize / 2 + 0.5) * tileSize,
  });

  const playerSpawnWorld = cellToWorld(15, 9);
  const landmarkWorld = cellToWorld(9, 9);

  // BFS from player spawn (15, 9) to collect all reachable open cells
  const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const queue: Array<[number, number]> = [[15, 9]];
  visited[15][9] = true;
  const reachableOpenCells: Array<[number, number]> = [];

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    reachableOpenCells.push([cr, cc]);
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (
        nr > 0 &&
        nr < gridSize - 1 &&
        nc > 0 &&
        nc < gridSize - 1 &&
        !visited[nr][nc] &&
        cells[nr][nc] === 0
      ) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }

  // Filter candidate spawn cells that are at least 5 tiles away from player spawn
  const enemyCandidates = reachableOpenCells.filter(
    ([r, c]) => Math.hypot(r - 15, c - 9) >= 5.5
  );

  const enemies: ArenaEnemy[] = [];
  const totalEnemies = Math.min(16, 8 + wave * 2);

  for (let i = 0; i < totalEnemies && enemyCandidates.length > 0; i++) {
    const idx = Math.floor(rng() * enemyCandidates.length);
    const [er, ec] = enemyCandidates.splice(idx, 1)[0];
    const pos = cellToWorld(er, ec);

    // Cycle through all 8 Ridiculous Dungeon Crawler Carl (DCC) enemies so every wave is packed with DCC chaos!
    const dccSpec =
      RIDICULOUS_DCC_ENEMIES_CATALOG[
        (i + wave - 1) % RIDICULOUS_DCC_ENEMIES_CATALOG.length
      ];
    const archetype = dccSpec.mappedArenaArchetype;
    const maxHp = Math.round(dccSpec.maxHp * (0.85 + wave * 0.12));

    enemies.push({
      id: `enemy_${wave}_${i}`,
      archetype,
      dccEnemyId: dccSpec.enemyId,
      dccTitle: dccSpec.shortName,
      dccColorHex: dccSpec.colorHex,
      x: pos.x,
      y: 0,
      z: pos.z,
      vx: 0,
      vz: 0,
      yaw: rng() * Math.PI * 2,
      hp: maxHp,
      maxHp,
      radius:
        dccSpec.enemyId === 'NEIGHBORHOOD_BOSS_HOARDER_GOLEM'
          ? 1.15
          : archetype === 'HEAVY_BREACHER_MECH'
          ? 0.95
          : 0.68,
      state: 'SEEK_OR_KITE',
      stateTimer: 0.4 + rng() * 0.8,
      hitFlashTimer: 0,
      koProgress: 0,
      strafeSign: rng() > 0.5 ? 1 : -1,
    });
  }

  // Spawn tactical scavenging crates on reachable open tiles
  const pickupTypes: Array<{
    type: ArenaPickup['type'];
    label: string;
  }> = [
    { type: 'HPA_SCUBA_BOTTLE', label: '300-Bar Scuba + 65g PA12-CF Filament Spool' },
    { type: 'SLUG_TIN_AMMO', label: 'CNC Slugs + 4x Copper Burst Disk Foils' },
    { type: 'SILICONE_LUBE_KIT', label: 'Airgun CAD Blueprint Schematic + Silicone Oil' },
    { type: 'MED_INJECTOR', label: 'Survivor Trauma Adrenaline (+35 HP)' },
  ];

  const pickups: ArenaPickup[] = [];
  for (let i = 0; i < 4 && enemyCandidates.length > 0; i++) {
    const idx = Math.floor(rng() * enemyCandidates.length);
    const [pr, pc] = enemyCandidates.splice(idx, 1)[0];
    const pos = cellToWorld(pr, pc);
    const meta = pickupTypes[i % pickupTypes.length];
    pickups.push({
      id: `pickup_${wave}_${i}`,
      type: meta.type,
      label: meta.label,
      x: pos.x,
      z: pos.z,
      collected: false,
    });
  }

  const sectorName =
    SECTOR_PREFIXES[Math.floor(rng() * SECTOR_PREFIXES.length)] +
    ` // Sector ${100 + (seed % 899)}`;

  return {
    seed,
    sectorName,
    gridSize,
    tileSize,
    cells,
    playerSpawn: { x: playerSpawnWorld.x, z: playerSpawnWorld.z, yaw: 0 },
    landmarkPos: landmarkWorld,
    enemies,
    pickups,
  };
}

/**
 * Checks if a world position (x, z) with given radius collides with any solid cell in the arena.
 */
export function collidesWithArenaWalls(
  map: GeneratedArenaMap,
  x: number,
  z: number,
  radius: number = 0.45
): boolean {
  const halfExtent = (map.gridSize * map.tileSize) / 2;
  if (
    x - radius < -halfExtent + map.tileSize ||
    x + radius > halfExtent - map.tileSize ||
    z - radius < -halfExtent + map.tileSize ||
    z + radius > halfExtent - map.tileSize
  ) {
    return true;
  }

  const checkOffsets = [
    [0, 0],
    [radius, 0],
    [-radius, 0],
    [0, radius],
    [0, -radius],
    [radius * 0.7, radius * 0.7],
    [-radius * 0.7, radius * 0.7],
    [radius * 0.7, -radius * 0.7],
    [-radius * 0.7, -radius * 0.7],
  ];

  for (const [ox, oz] of checkOffsets) {
    const col = Math.floor((x + ox) / map.tileSize + map.gridSize / 2);
    const row = Math.floor((z + oz) / map.tileSize + map.gridSize / 2);
    if (row < 0 || row >= map.gridSize || col < 0 || col >= map.gridSize) {
      return true;
    }
    if (map.cells[row][col] !== 0) {
      return true;
    }
  }
  return false;
}

/**
 * Steps all enemies using 3 distinct movement & decision policies, an attack token pool
 * (`maxConcurrentAttackers = 3`), and visible/audible windup telegraphs before dealing damage.
 */
export function stepArenaEnemies(
  enemies: ArenaEnemy[],
  map: GeneratedArenaMap,
  playerPos: { x: number; z: number },
  dt: number
): {
  playerDamageTaken: number;
  telegraphTriggeredCount: number;
  activeWaveComplete: boolean;
} {
  let playerDamageTaken = 0;
  let telegraphTriggeredCount = 0;

  // Count how many enemies are currently in windup or active attack (Crowd Token Pool = 3)
  let currentAttackers = enemies.filter(
    (e) =>
      e.hp > 0 &&
      (e.state === 'WINDUP_TELEGRAPH' || e.state === 'ATTACK_ACTIVE')
  ).length;
  const maxConcurrentAttackers = 3;

  for (const enemy of enemies) {
    if (enemy.hitFlashTimer > 0) {
      enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
    }

    if (enemy.hp <= 0) {
      enemy.state = 'KO_TOPPLE';
      enemy.koProgress = Math.min(1, enemy.koProgress + dt * 2.8);
      continue;
    }

    const dx = playerPos.x - enemy.x;
    const dz = playerPos.z - enemy.z;
    const dist = Math.max(0.001, Math.hypot(dx, dz));
    const dirX = dx / dist;
    const dirZ = dz / dist;
    const perpX = -dirZ * enemy.strafeSign;
    const perpZ = dirX * enemy.strafeSign;

    enemy.yaw = Math.atan2(dx, dz);
    enemy.stateTimer -= dt;

    if (enemy.state === 'WINDUP_TELEGRAPH') {
      // Windup telegraph completes -> transition to active attack frame
      if (enemy.stateTimer <= 0) {
        enemy.state = 'ATTACK_ACTIVE';
        enemy.stateTimer = 0.25;

        // Deal damage if player hasn't dodged out of attack envelope
        if (enemy.archetype === 'SWARMER_SCOUT' && dist < 3.4) {
          playerDamageTaken += 11;
        } else if (enemy.archetype === 'KITER_SNIPER_DRONE' && dist < 24) {
          playerDamageTaken += 14;
        } else if (enemy.archetype === 'HEAVY_BREACHER_MECH' && dist < 6.0) {
          playerDamageTaken += 22;
        }
      }
      continue;
    }

    if (enemy.state === 'ATTACK_ACTIVE') {
      if (enemy.stateTimer <= 0) {
        enemy.state = 'SEEK_OR_KITE';
        enemy.stateTimer = 1.1;
        enemy.strafeSign *= -1;
      }
      continue;
    }

    // Distinct Policy 1: SWARMER_SCOUT (fast zig-zag rush + close lunge)
    if (enemy.archetype === 'SWARMER_SCOUT') {
      const speed = 5.4;
      const moveX = (dirX * 0.82 + perpX * 0.45) * speed * dt;
      const moveZ = (dirZ * 0.82 + perpZ * 0.45) * speed * dt;
      if (!collidesWithArenaWalls(map, enemy.x + moveX, enemy.z, enemy.radius)) {
        enemy.x += moveX;
      }
      if (!collidesWithArenaWalls(map, enemy.x, enemy.z + moveZ, enemy.radius)) {
        enemy.z += moveZ;
      }

      if (dist < 2.8 && enemy.stateTimer <= 0 && currentAttackers < maxConcurrentAttackers) {
        enemy.state = 'WINDUP_TELEGRAPH';
        enemy.stateTimer = 0.42; // 0.42s visible telegraph before strike
        currentAttackers++;
        telegraphTriggeredCount++;
      }
    }
    // Distinct Policy 2: KITER_SNIPER_DRONE (retreats if < 10m, orbits at 10-18m, ranged dart)
    else if (enemy.archetype === 'KITER_SNIPER_DRONE') {
      const speed = 4.1;
      let radialFactor = 0;
      if (dist < 9.5) radialFactor = -0.85; // kite away from player
      else if (dist > 16.5) radialFactor = 0.75; // close into optimal sniper band

      const moveX = (dirX * radialFactor + perpX * 0.8) * speed * dt;
      const moveZ = (dirZ * radialFactor + perpZ * 0.8) * speed * dt;
      if (!collidesWithArenaWalls(map, enemy.x + moveX, enemy.z, enemy.radius)) {
        enemy.x += moveX;
      } else {
        enemy.strafeSign *= -1;
      }
      if (!collidesWithArenaWalls(map, enemy.x, enemy.z + moveZ, enemy.radius)) {
        enemy.z += moveZ;
      }

      if (dist < 20 && enemy.stateTimer <= 0 && currentAttackers < maxConcurrentAttackers) {
        enemy.state = 'WINDUP_TELEGRAPH';
        enemy.stateTimer = 0.65; // 0.65s laser sight windup telegraph
        currentAttackers++;
        telegraphTriggeredCount++;
      }
    }
    // Distinct Policy 3: HEAVY_BREACHER_MECH (deliberate advance + line-of-sight charge)
    else if (enemy.archetype === 'HEAVY_BREACHER_MECH') {
      const speed = 3.1;
      const moveX = dirX * speed * dt;
      const moveZ = dirZ * speed * dt;
      if (!collidesWithArenaWalls(map, enemy.x + moveX, enemy.z, enemy.radius)) {
        enemy.x += moveX;
      }
      if (!collidesWithArenaWalls(map, enemy.x, enemy.z + moveZ, enemy.radius)) {
        enemy.z += moveZ;
      }

      if (dist < 5.2 && enemy.stateTimer <= 0 && currentAttackers < maxConcurrentAttackers) {
        enemy.state = 'WINDUP_TELEGRAPH';
        enemy.stateTimer = 0.72; // 0.72s heavy pressure-vent telegraph
        currentAttackers++;
        telegraphTriggeredCount++;
      }
    }
  }

  const activeWaveComplete = enemies.every((e) => e.hp <= 0 && e.koProgress >= 1);

  return {
    playerDamageTaken,
    telegraphTriggeredCount,
    activeWaveComplete,
  };
}
