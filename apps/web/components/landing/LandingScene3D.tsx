'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Floating 3D Buildings for background
function FloatingBuilding({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3
        }
    })

    return (
        <mesh ref={meshRef} position={position} castShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#2d2319" emissive="#FFAA00" emissiveIntensity={0.1} />
            {/* Gold edges */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(1, 2, 1)]} />
                <lineBasicMaterial color="#FFAA00" transparent opacity={0.3} />
            </lineSegments>
        </mesh>
    )
}

export default function LandingScene3D() {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#FFAA00" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF7F00" />

                {/* Stars background */}
                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

                {/* Floating buildings */}
                <FloatingBuilding position={[-4, 0, -5]} />
                <FloatingBuilding position={[3, 1, -6]} />
                <FloatingBuilding position={[-2, -1, -8]} />
                <FloatingBuilding position={[5, 0.5, -7]} />
                <FloatingBuilding position={[0, -0.5, -10]} />

                {/* Auto-rotate camera */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    )
}
