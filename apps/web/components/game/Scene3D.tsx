'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface Scene3DProps {
    children: React.ReactNode
    cameraPosition?: [number, number, number]
    cameraMode?: 'isometric' | 'orbital' | 'firstPerson'
    enablePostProcessing?: boolean
}

export default function Scene3D({
    children,
    cameraPosition = [10, 10, 10],
    cameraMode = 'isometric',
    enablePostProcessing = true,
}: Scene3DProps) {
    return (
        <div className="w-full h-full">
            <Canvas
                shadows
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
            >
                {/* Camera Setup */}
                <PerspectiveCamera
                    makeDefault
                    position={cameraPosition}
                    fov={cameraMode === 'isometric' ? 50 : 75}
                />

                {/* Controls */}
                <OrbitControls
                    enablePan={cameraMode === 'isometric'}
                    enableRotate={true}
                    enableZoom={true}
                    minDistance={cameraMode === 'isometric' ? 8 : 5}
                    maxDistance={cameraMode === 'isometric' ? 100 : 50}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.2}
                    dampingFactor={0.05}
                    enableDamping={true}
                />

                {/* Cyberpunk Lighting */}
                <ambientLight intensity={0.3} color="#0a0a1a" />

                {/* Key neon lights */}
                <pointLight position={[4, 8, 4]} intensity={2} color="#00f5ff" distance={20} />
                <pointLight position={[-4, 8, -4]} intensity={2} color="#ff00ff" distance={20} />
                <pointLight position={[0, 10, 0]} intensity={1.5} color="#ffd700" distance={15} />

                {/* Rim light for depth */}
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={0.5}
                    color="#ffffff"
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                {/* Atmosphere - Cyberpunk fog */}
                <fog attach="fog" args={['#0a0a1a', 10, 50]} />

                {/* Scene Content */}
                {children}

                {/* Post-processing Effects */}
                {enablePostProcessing && (
                    <EffectComposer>
                        <Bloom
                            intensity={1.5}
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.9}
                            height={300}
                            opacity={1}
                        />
                    </EffectComposer>
                )}
            </Canvas>
        </div>
    )
}
