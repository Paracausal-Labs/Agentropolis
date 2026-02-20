'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles, Grid, Icosahedron, Float } from '@react-three/drei'
import { useRef } from 'react'


function CyberCore() {
    const meshRef = useRef<any>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group>
                <Icosahedron args={[1, 0]} ref={meshRef}>
                    <meshStandardMaterial
                        color="#050510"
                        emissive="#00F0FF"
                        emissiveIntensity={2}
                        wireframe
                    />
                </Icosahedron>
                <Icosahedron args={[0.8, 0]}>
                    <meshBasicMaterial color="#FCEE0A" wireframe transparent opacity={0.2} />
                </Icosahedron>
            </group>
        </Float>
    )
}

export default function LandingScene3D() {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
                <color attach="background" args={['#050510']} />

                {/* Atmosphere */}
                <fog attach="fog" args={['#050510', 5, 25]} />
                <ambientLight intensity={2} />

                {/* Cyber Core Hero */}
                <CyberCore />

                {/* Infinite Grid */}
                <Grid
                    position={[0, -2, 0]}
                    args={[10.5, 10.5]}
                    cellSize={0.6}
                    cellThickness={1}
                    cellColor="#00F0FF"
                    sectionSize={3.3}
                    sectionThickness={1.5}
                    sectionColor="#FCEE0A"
                    fadeDistance={20}
                    fadeStrength={1.5}
                    infiniteGrid
                />

                {/* Cyber Particles */}
                <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
                <Sparkles
                    count={300}
                    scale={12}
                    size={2}
                    speed={0.4}
                    opacity={0.6}
                    color="#00F0FF"
                />

                {/* Camera Controls */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2 - 0.05}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>
        </div>
    )
}
