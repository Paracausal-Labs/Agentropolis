'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, AGENT_TYPES } from '@/lib/game-constants'

interface Agent3DProps {
    position: [number, number, number]
    agentType: keyof typeof AGENT_TYPES
    isWalking?: boolean
    walkDirection?: [number, number, number]
    scale?: number
}

export function Agent3D({
    position,
    agentType,
    isWalking = false,
    walkDirection = [1, 0, 0],
    scale = 1,
}: Agent3DProps) {
    const groupRef = useRef<THREE.Group>(null)
    const agent = AGENT_TYPES[agentType]

    // Walking animation
    useFrame((state) => {
        if (groupRef.current) {
            if (isWalking) {
                // Bob up and down while walking
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.1
            }

            // Gentle idle rotation
            if (!isWalking) {
                groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
            }
        }
    })

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Body (cylinder) */}
            <mesh castShadow>
                <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
                <meshStandardMaterial
                    color={agent.color}
                    emissive={agent.color}
                    emissiveIntensity={0.3}
                    metalness={0.5}
                    roughness={0.5}
                />
            </mesh>

            {/* Head (sphere) */}
            <mesh position={[0, 0.9, 0]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial
                    color={agent.color}
                    emissive={agent.color}
                    emissiveIntensity={0.5}
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* Glow ring */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial
                    color={agent.color}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Floating emoji/icon indicator */}
            <sprite position={[0, 1.8, 0]} scale={[0.6, 0.6, 1]}>
                <spriteMaterial
                    transparent
                    opacity={0.9}
                />
            </sprite>
        </group>
    )
}

// Particle system for agent deployment effect
export function DeploymentEffect({ position }: { position: [number, number, number] }) {
    const particlesRef = useRef<THREE.Points>(null)

    const particles = useMemo(() => {
        const geometry = new THREE.BufferGeometry()
        const count = 50
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2
            positions[i * 3 + 1] = Math.random() * 2
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        return geometry
    }, [])

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.02
                if (positions[i + 1] > 2) {
                    positions[i + 1] = 0
                }
            }

            particlesRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    return (
        <points ref={particlesRef} position={position}>
            <bufferGeometry attach="geometry" {...particles} />
            <pointsMaterial
                attach="material"
                color={COLORS.neon.cyan}
                size={0.1}
                transparent
                opacity={0.6}
            />
        </points>
    )
}
