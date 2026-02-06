# Asset Pipeline (AI + Free Libraries)

This app works end-to-end with procedural geometry only. Use this pipeline to upgrade visuals quickly.

## 1) Best-fit stack
- Runtime: `React + Next.js + React Three Fiber + Drei + Postprocessing`
- Preferred asset format: `glb` (PBR metallic-roughness)
- Texture set per model: `baseColor`, `normal`, `roughness`, optional `emissive`
- Target budgets:
  - Hero model: 12k triangles
  - Regular building: 2k to 5k triangles
  - Agent avatar: 2k to 4k triangles

## 2) Gemini prompt pack
Use these prompts in your image-to-3D or concept generation workflow.

### Cyberpunk Council Hall
"Low-poly cyberpunk circular council hall, neon magenta ring lights, emissive trim, dark steel and glass, isometric readability, game-ready PBR, clean silhouette, no text, transparent background"

### City Building Set
"Modular neon city building kit, 12 variants, low-poly but premium look, cyan and amber windows, rooftop props, consistent scale, game-ready PBR textures"

### Agent Avatars (6)
"Stylized humanoid AI agent statue, futuristic cloak and armor blend, glowing chest core, low-poly 3D game asset, rig-ready proportions, unique color variants"

### Road + Props
"Cyberpunk street props pack: lamps, kiosks, hologram signs, vents, barriers, low-poly stylized, emissive accents, modular pivots"

### Ground Materials
"Seamless texture set for dark asphalt with subtle neon reflections, PBR maps included, game-ready, no baked shadows"

## 3) Free sources if needed
- Poly Pizza: https://poly.pizza/
- Kenney 3D packs: https://kenney.nl/assets
- Quaternius 3D packs: https://quaternius.com/

## 4) Placement in this repo
- Put generated files in: `apps/new/public/assets/generated/`
- Keep lowercase names and hyphen format, for example:
  - `council-hall.glb`
  - `agent-alpha.glb`
  - `city-office-a.glb`

## 5) Integration notes
- Replace procedural meshes scene-by-scene in:
  - `apps/new/components/game/canvas/CityScene.tsx`
  - `apps/new/components/game/canvas/CouncilScene.tsx`
- Keep fallback geometry available for any missing asset.
