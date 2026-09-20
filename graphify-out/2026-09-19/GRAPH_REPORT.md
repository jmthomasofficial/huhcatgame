# Graph Report - huhcatgame  (2026-09-16)

## Corpus Check
- 18 files · ~943,119 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 301 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `79214bff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- renderer.ts
- dependencies
- devDependencies
- engine.ts
- audio.ts
- compilerOptions
- chain.ts
- Summary of This Session
- App.tsx
- README.md
- TutorialModal.tsx

## God Nodes (most connected - your core abstractions)
1. `updatePlayer()` - 17 edges
2. `render()` - 14 edges
3. `update()` - 13 edges
4. `compilerOptions` - 12 edges
5. `HuhcatGame()` - 11 edges
6. `getAudioContext()` - 11 edges
7. `updateOrangies()` - 7 edges
8. `playHuhSound()` - 6 edges
9. `initAudio()` - 5 edges
10. `playCoinSound()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `HuhcatGame()` --calls--> `update()`  [EXTRACTED]
  src/game/HuhcatGame.tsx → src/game/engine.ts
- `HuhcatGame()` --calls--> `render()`  [EXTRACTED]
  src/game/HuhcatGame.tsx → src/game/renderer.ts
- `updatePlayer()` --calls--> `playHuhSound()`  [EXTRACTED]
  src/game/engine.ts → src/game/audio.ts
- `updatePlayer()` --calls--> `playStompSound()`  [EXTRACTED]
  src/game/engine.ts → src/game/audio.ts
- `applyPowerup()` --calls--> `playCoinSound()`  [EXTRACTED]
  src/game/engine.ts → src/game/audio.ts

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "renderer.ts"
Cohesion: 0.11
Nodes (32): generateLevel(), seededRandom(), drawOrangie(), drawOrangieBase(), drawOrangieRescue(), getPowerupIcon(), COLORS, drawBackground() (+24 more)

### Community 1 - "dependencies"
Cohesion: 0.07
Nodes (27): canvas-confetti, date-fns, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, lucide-react, dependencies (+19 more)

### Community 2 - "devDependencies"
Cohesion: 0.07
Nodes (26): devDependencies, tailwindcss, @tailwindcss/vite, @types/canvas-confetti, @types/react, @types/react-dom, @types/uuid, typescript (+18 more)

### Community 3 - "engine.ts"
Cohesion: 0.17
Nodes (24): applyPowerup(), checkPlayerCoinCollision(), checkPlayerMouseCollision(), checkPlayerOrangieCollision(), checkPlayerPlatformCollision(), getPowerupText(), playerDie(), spawnBrickBreakParticles() (+16 more)

### Community 4 - "audio.ts"
Cohesion: 0.18
Nodes (21): bgmVolume, getAudioContext(), getBgmAudio(), getBgmVolume(), initAudio(), isBgmMuted(), loadSoundBuffer(), playBrickBreakSound() (+13 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (17): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, esModuleInterop, isolatedModules (+9 more)

### Community 6 - "chain.ts"
Cohesion: 0.33
Nodes (8): fetchHuhcatProof(), HuhcatProof, loadBundledSnapshot(), metadataFromAccount(), rpcCall(), RpcOk, RPCS, uriFromTransaction()

### Community 7 - "Summary of This Session"
Cohesion: 0.50
Nodes (3): 1. Verified Twitter / X Branding Suite Created (`public/social/`), HUHCAT Game Handoff — Official Verified Twitter/X Branding Suite (1500x500 Banners & PFPs), Summary of This Session

## Knowledge Gaps
- **54 isolated node(s):** `name`, `private`, `type`, `dev`, `build` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `render()` connect `renderer.ts` to `audio.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `renderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._