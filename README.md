# BAR 250 // Pneumatic CAD Gunsmith, 300-Bar Air Physics & Local Ollama Agent Studio

**BAR 250** is a physics-driven pneumatic engineering & survival game built around real high-pressure air thermodynamics (200–300 Bar / 4,350 PSI), Parker O-ring tribology, sub-millimeter B-Rep CAD synthesis, and **specialized local Ollama models** that autonomously write schematic code (`.SVG` + `.TS`) and build watertight 3D-printable parts (`.STL`) and in-game 3D assets.

---

## 🍎 macOS Guide: Running the Game & Autonomous Agents in the Background

On macOS (Apple Silicon M1 / M2 / M3 / M4 with unified Metal GPU memory), you can run **both** the local Ollama inference server, the BAR 250 game server, and the **autonomous background agent builder loop** in the background so agents continuously compile missing weapon schematics, generate unique `.STL` parts, and verify the 25 SMART physics objectives even when you close your terminal window.

### 1. Prerequisites on macOS (Homebrew + Ollama)

```bash
# Install Homebrew packages (Node 20+, tmux, jq)
brew install node tmux ollama jq

# Pull the specialized local models used by the in-game Ollama Studio
ollama pull qwen2.5-coder:32b
ollama pull deepseek-r1:14b
ollama pull starcoder2:15b
ollama pull llama3.2-vision:11b
ollama pull codellama:34b
ollama pull mistral-nemo:12b
ollama pull phi4:14b
ollama pull gemma2:27b
```

---

### 2. Quick One-Command Background Launch on macOS (`scripts/mac-background-agents.sh`)

We provide a ready-to-run macOS background supervisor script at `scripts/mac-background-agents.sh`.

```bash
chmod +x scripts/mac-background-agents.sh

# Start Ollama + BAR 250 Dev Server (Port 3000) + Autonomous Agent Loop in background:
./scripts/mac-background-agents.sh start

# Check live status of background processes and agent progress:
./scripts/mac-background-agents.sh status

# Tail live agent CAD / STL / Physics verification logs:
./scripts/mac-background-agents.sh logs

# Stop all background services cleanly:
./scripts/mac-background-agents.sh stop
```

---

### 3. Method A: Running in the Background with `nohup` (Survives Terminal Close)

If you want to launch everything manually with `nohup` so it keeps running in the background while you work or sleep:

```bash
mkdir -p .logs

# 1. Start Ollama with Apple Metal Flash Attention & CORS enabled for localhost:3000
OLLAMA_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,*" \
OLLAMA_FLASH_ATTENTION=1 \
OLLAMA_NUM_PARALLEL=2 \
nohup ollama serve > .logs/ollama.log 2>&1 &

# 2. Start the BAR 250 Web + CAD Engine on Port 3000 in the background
nohup npm run dev -- --port=3000 --host=0.0.0.0 > .logs/dev-server.log 2>&1 &

# 3. Start the Autonomous Background Agent Loop (runs unit tests, builds missing STL parts & schematics)
nohup bash scripts/mac-background-agents.sh worker-loop > .logs/agent-worker.log 2>&1 &
```

---

### 4. Method B: Persistent `tmux` Multi-Pane Engineering Session on macOS

If you want to detach and re-attach to watch the agents live at any time:

```bash
# Create a detached 3-pane tmux session named 'bar250-agents'
tmux new-session -d -s bar250-agents -n "ollama" \
  "OLLAMA_ORIGINS='*' OLLAMA_FLASH_ATTENTION=1 ollama serve"

tmux new-window -t bar250-agents -n "game-server" \
  "npm run dev -- --port=3000 --host=0.0.0.0"

tmux new-window -t bar250-agents -n "autonomous-agents" \
  "bash scripts/mac-background-agents.sh worker-loop"

# Attach whenever you want to inspect the agents:
tmux attach -t bar250-agents
# (Press Ctrl+B then D to detach again without stopping the agents)
```

---

### 5. Method C: Native macOS `launchd` Background Service (`~/Library/LaunchAgents`)

To make macOS automatically keep the autonomous agents and game server alive in the background across logins or reboots:

```bash
# Install and load the macOS LaunchAgent plist automatically:
./scripts/mac-background-agents.sh install-launchd

# Or inspect / unload it with launchctl:
launchctl list | grep com.bar250.agents
launchctl unload ~/Library/LaunchAgents/com.bar250.agents.plist
```

---

## 🛠️ Key In-Game Engineering & Local Model Features

1. **8-Model Sub-Component, O-Ring & Unique Part Creator (`🔬 8-Model O-Rings`)**:
   - Inspects every weapon family down to sub-millimeter Parker O-rings and tolerances:
     - **01. P90 .45 Top Helical + 145cc Plenum** (`P90-01`..`P90-04`)
     - **02. 4-Stage Burst-Disk Shotgun Family** (`BD-01` Stepped 316L Fitting + Viton Face O-Ring, `BD-02` 6-Petal Laser-Scored CuNi Foil, `BD-03` M12×1.0 Dual Radial Exhaust Retainer Cap, `BD-04` 1-Shot Red Pen Capsule, `BD-05` Twin-Shell Break-Action Breech)
     - **03. EDgun Leshiy 2 Valkyrie Open-Breech Benchmark** (`LSA221000` Front PU-90A Indexing Seal, `LSA220800` Rear Face Seal, `L2-03` Hammerless Shuttle Valve)
     - **04. Evanix REX-P Coaxial 1-Shot Pistol ⇄ REX Sniper Mode** (`REXP-#11` Sliding Breech, `REXP-#14` 5-Hole Skeletonized Underlever, `REXP-#32` 180° In-Line PEEK Poppet Valve, plus **`⚡ Create & Equip Evanix REX-P In-Game 3D Asset`** button)
     - **05. EDgun Leshiy 3 .45 Concentric Semi-Auto** (Inner .45 Barrel + Middle Silencer Baffles + Outer 280-Bar Air Reserve)
     - **06. Snowpeak PP750L Regulated Side-Lever & Twin-Rod Telescoping Carbine (+ Evanix MP30 Fixed-Handle Spec)** (`PP750-01` Twin Ø6.00mm Stainless Telescoping Stock Rods, `PP750-02` 66cc 250-Bar Regulated Under-Barrel Tube & Belleville Stack, `PP750-03` Drop-Down Side-Lever, `MP30-01` Fixed 6 O'Clock Vertical Bottle Handle)
     - **07. Redesigned Ascent × Vectis .45 Cal 300-Bar Onboard-Pump Carbine (12 Parts)** (`ASC-45-01`..`ASC-45-12` with 140cc Over-the-Barrel 2+ Round Regulated Plenum, QuietEnergy Silencer, and 300-Bar Under-Barrel Reserve + 3-Stage Hand Pump)
   - **Per-Component Unique Part Button (`⚡ Create Unique Part`)**: Every single component row (`[1] BD-01`, `[2] BD-02`, `[3] BD-03`, `REXP-#11`, `REXP-#14`, `REXP-#32`, `PP750-01`, etc.) has its own button that synthesizes a **unique, shape-accurate SVG cross-section and watertight `.STL` 3D solid** for that exact component.

2. **In-Game Ollama Studio & Schematic Code Generator (`🦙 Ollama Models & Asset Synth`)**:
   - Run 8 specialized local Ollama models in-game to generate parametric `.SVG` schematics, TypeScript schematic generator modules (`.ts`), and watertight `.STL` parts.

3. **39-Phase Generative CAD Roadmap (`🎯 25 SMART Goals (39 Phases)`)**:
   - Phases 1–14 (Core Engine + 10 Weapon Blueprints) + Phases 15–39 (**25 SMART Objectives** across Air Thermodynamics, Mechanical Linkages, Local Ollama Agents, Schematic/Asset Codegen, and Physics Gameplay).

---

## 🧪 Verification & Deterministic Physics Test Suite

```bash
# Run the deterministic Node test suite (verifies 4-zone pneumatics, 300B Ascent pump,
# Snowpeak PP750L / REX-P unique part synthesis, Ollama codegen, and all 25 SMART goals):
npx --yes tsx --test src/game/rules.test.ts

# Type-check & build production bundle:
npm run lint
npm run build
```
