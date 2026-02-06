"use client"

import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing"
import { Canvas } from "@react-three/fiber"
import { Suspense, useMemo } from "react"
import { Vector2 } from "three"

import { CouncilScene } from "@/components/game/canvas/CouncilScene"
import { CityScene } from "@/components/game/canvas/CityScene"
import { useGameStore } from "@/lib/game/store"

function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 14, 6]} intensity={1.3} castShadow shadow-mapSize={2048} />
      <pointLight position={[-10, 5, -10]} intensity={1.2} color="#2bd8ff" />
      <pointLight position={[10, 5, 8]} intensity={1.3} color="#ff8a3d" />
    </>
  )
}

export function GameViewport() {
  const view = useGameStore((state) => state.view)
  const aberrationOffset = useMemo(() => new Vector2(0.0008, 0.0014), [])

  return (
    <Canvas shadows camera={{ position: [18, 13, 18], fov: 45 }}>
      <color attach="background" args={["#050812"]} />
      <fog attach="fog" args={["#050812", 18, 46]} />

      <LightingRig />

      <Suspense fallback={null}>{view === "city" ? <CityScene /> : <CouncilScene />}</Suspense>

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={0.65} mipmapBlur />
        <ChromaticAberration offset={aberrationOffset} radialModulation={false} modulationOffset={0} />
        <Vignette eskil={false} offset={0.15} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  )
}
