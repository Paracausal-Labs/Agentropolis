'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, AGENT_TYPES } from '@/lib/game-constants'
import { Html } from '@react-three/drei'

interface Agent3DProps {
    position: [number, number, number]
    agentType: keyof typeof AGENT_TYPES
    isWalking?: boolean
    walkDirection?: [number, number, number]
    rotation?: number
    scale?: number
    isSelected?: boolean
    isHovered?: boolean
    showNameTag?: boolean
    onClick?: () => void
    onPointerOver?: (e: any) => void
    onPointerOut?: (e: any) => void
}

export function Agent3D({
    position,
    agentType,
    isWalking = false,
    rotation = 0,
    scale = 1,
    isSelected = false,
    isHovered = false,
    showNameTag = false,
    onClick,
    onPointerOver,
    onPointerOut,
}: Agent3DProps) {
    const groupRef = useRef<THREE.Group>(null)
    const bodyRef = useRef<THREE.Mesh>(null)
    const agent = AGENT_TYPES[agentType]

    if (!agent) {
        console.error(`Agent3D: Unknown agent type "${agentType}"`)
        return null
    }

    // Walking animation
    useFrame((state) => {
        if (groupRef.current) {
            if (isWalking) {
                // Bob up and down while walking
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 12) * 0.1

                // Tilt in walk direction
                if (bodyRef.current) {
                    bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 12) * 0.1
                }
            } else {
                // Idle hover
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
                if (bodyRef.current) bodyRef.current.rotation.z = 0
            }

            // Selection rotation
            if (isSelected && groupRef.current) {
                groupRef.current.rotation.y += 0.01
            } else {
                // Smooth look direction (simplified)
                groupRef.current.rotation.y = rotation
            }
        }
    })

    // Geometry based on shape
    const geometry = useMemo(() => {
        const shape = agent.shape
        switch (shape) {
            case 'angular':
                return <coneGeometry args={[0.4, 1.2, 5]} />
            case 'blocky':
                return <boxGeometry args={[0.6, 1.2, 0.6]} />
            case 'ethereal':
                return <octahedronGeometry args={[0.5, 0]} />
            case 'spiky':
                return <coneGeometry args={[0.4, 1.2, 8]} /> // Add spikes via material/shader later
            case 'geometric':
                return <dodecahedronGeometry args={[0.5]} />
            case 'balanced':
            default:
                return <capsuleGeometry args={[0.3, 1, 4, 8]} />
        }
    }, [agent.shape])

    return (
        <group
            ref={groupRef}
            position={position}
            scale={scale}
            onClick={(e) => {
                e.stopPropagation()
                onClick?.()
            }}
            onPointerOver={(e) => {
                e.stopPropagation()
                onPointerOver?.(e)
            }}
            onPointerOut={onPointerOut}
        >
            {/* Selection Ring */}
            {(isSelected || isHovered) && (
                <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.6, 0.7, 32]} />
                    <meshBasicMaterial
                        color={isSelected ? agent.color : '#ffffff'}
                        transparent
                        opacity={isSelected ? 0.8 : 0.4}
                    />
                </mesh>
            )}

            {/* Body */}
            <mesh ref={bodyRef} castShadow position={[0, 0.6, 0]}>
                {geometry}
                <meshStandardMaterial
                    color={agent.color}
                    emissive={agent.color}
                    emissiveIntensity={isSelected ? 0.6 : 0.3}
                    metalness={0.7}
                    roughness={0.2}
                    wireframe={agent.shape === 'ethereal'}
                />
            </mesh>

            {/* Head/Floater */}
            <mesh position={[0, 1.4, 0]} castShadow>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial
                    color={agent.color}
                    emissive="#ffffff"
                    emissiveIntensity={0.2}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Glowing Eyes/Visor */}
            <mesh position={[0, 1.4, 0.2]}>
                <boxGeometry args={[0.3, 0.05, 0.1]} />
                <meshBasicMaterial color={COLORS.neon.cyan} />
            </mesh>

            {/* Name Tag (HTML) */}
            {(showNameTag || isHovered || isSelected) && (
                <Html position={[0, 2.2, 0]} center>
                    <div className="flex flex-col items-center pointer-events-none whitespace-nowrap">
                        <div className="bg-black/80 backdrop-blur border border-[#FCEE0A] px-2 py-1 rounded text-xs font-bold text-[#FCEE0A] uppercase tracking-wider mb-1">
                            {agent.name}
                        </div>
                        <div className="text-[8px] text-white bg-black/50 px-1 rounded">
                            {agent.role}
                        </div>
                    </div>
                </Html>
            )}
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
            particlesRef.current.rotation.y = state.clock.elapsedTime * 2
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.05
                if (positions[i + 1] > 3) {
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
                size={0.15}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export function Coin3D({ position, type = 'gold', isCollected }: { position: [number, number, number], type: 'bronze' | 'silver' | 'gold', isCollected: boolean }) {
    const meshRef = useRef<THREE.Group>(null)

    const color = type === 'gold' ? COLORS.neon.yellow : type === 'silver' ? '#cccccc' : '#cd7f32'

    useFrame((state) => {
        if (meshRef.current && !isCollected) {
            meshRef.current.rotation.y += 0.05
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1
        }
    })

    if (isCollected) return null

    return (
        <group ref={meshRef} position={position}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
                <meshStandardMaterial color={color} metalness={1} roughness={0.1} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
                <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
        </group>
    )
}

export function FloatingText({ position, text, color = '#FCEE0A', onComplete }: { position: [number, number, number], text: string, color?: string, onComplete?: () => void }) {
    const ref = useRef<THREE.Group>(null)

    useFrame(() => {
        if (ref.current) {
            ref.current.position.y += 0.03
        }
    })

    return (
        <group ref={ref} position={position}>
            <Html center>
                <div
                    className="pointer-events-none font-bold text-xl select-none"
                    style={{
                        color: color,
                        textShadow: '0 0 10px currentColor',
                        animation: 'float-fade 1s ease-out forwards'
                    }}
                    onAnimationEnd={onComplete}
                >
                    {text}
                </div>
            </Html>
        </group>
    )
}
