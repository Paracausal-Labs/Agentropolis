'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, AGENT_TYPES } from '@/lib/game-constants'
import { Html } from '@react-three/drei'

interface Agent3DProps {
    position: [number, number, number]
    agentType: keyof typeof AGENT_TYPES
    skinId?: string
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
    skinId: _skinId = 'default',
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
    const groupRef = useRef<any>(null)
    const bodyRef = useRef<any>(null)
    const agent = AGENT_TYPES[agentType]

    const skinColors = useMemo(() => ({
        primary: agent?.color || '#00ff88',
        secondary: agent?.secondary || '#333',
        glow: agent?.color || '#00ff88',
    }), [agent?.color, agent?.secondary])

    // Walking animation
    useFrame((state) => {
        if (!agent) return
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
        if (!agent) return <capsuleGeometry args={[0.3, 1, 4, 8]} />
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
    }, [agent])

    if (!agent) {
        console.error(`Agent3D: Unknown agent type "${agentType}"`)
        return null
    }

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
                    color={skinColors.primary}
                    emissive={skinColors.glow}
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
                    color={skinColors.primary}
                    emissive={skinColors.glow}
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
                <Html position={[0, 2.2, 0]} center zIndexRange={[0, 0]}>
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
    const particlesRef = useRef<any>(null)

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
            <primitive object={particles} attach="geometry" />
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
    const meshRef = useRef<any>(null)

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
    const ref = useRef<any>(null)

    useFrame(() => {
        if (ref.current) {
            ref.current.position.y += 0.03
        }
    })

    return (
        <group ref={ref} position={position}>
            <Html center zIndexRange={[0, 0]}>
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

// Battle Agent with attack animations
interface BattleAgent3DProps {
    position: [number, number, number]
    agentType: keyof typeof AGENT_TYPES
    isPlayer: boolean
    isAttacking: boolean
    hp: number
    maxHp: number
}

export function BattleAgent3D({
    position,
    agentType,
    isPlayer,
    isAttacking,
    hp,
    maxHp
}: BattleAgent3DProps) {
    const groupRef = useRef<any>(null)
    const bodyRef = useRef<any>(null)
    const attackTime = useRef(0)
    const agent = AGENT_TYPES[agentType]

    const baseColor = agent?.color || (isPlayer ? '#00FF88' : '#FF3366')
    const hpRatio = hp / maxHp

    useFrame((state, delta) => {
        if (!groupRef.current || !bodyRef.current) return

        const time = state.clock.elapsedTime

        // Base idle animation - floating
        const idleY = Math.sin(time * 3) * 0.05

        if (isAttacking) {
            attackTime.current += delta * 8

            // Attack lunge towards enemy
            const lungeOffset = Math.sin(attackTime.current * 3) * 2
            const lungeDirection = isPlayer ? -1 : 1

            groupRef.current.position.x = position[0] + lungeOffset * lungeDirection
            groupRef.current.position.y = position[1] + idleY + Math.abs(Math.sin(attackTime.current * 4)) * 0.3
            groupRef.current.position.z = position[2]

            // Aggressive wobble during attack
            bodyRef.current.rotation.z = Math.sin(time * 20) * 0.3
            bodyRef.current.rotation.x = Math.sin(time * 15) * 0.2

            // Scale pulse on attack
            const scalePulse = 1 + Math.sin(attackTime.current * 6) * 0.15
            bodyRef.current.scale.setScalar(scalePulse)
        } else {
            attackTime.current = 0

            // Normal idle state
            groupRef.current.position.x = position[0]
            groupRef.current.position.y = position[1] + idleY
            groupRef.current.position.z = position[2]

            // Gentle idle sway
            bodyRef.current.rotation.z = Math.sin(time * 2) * 0.05
            bodyRef.current.rotation.x = 0
            bodyRef.current.scale.setScalar(1)
        }

        // Face opponent
        groupRef.current.rotation.y = isPlayer ? -Math.PI / 4 : Math.PI / 4 + Math.PI
    })

    // Geometry based on shape
    const geometry = useMemo(() => {
        if (!agent) return <capsuleGeometry args={[0.4, 1.5, 4, 8]} />
        const shape = agent.shape
        switch (shape) {
            case 'angular':
                return <coneGeometry args={[0.5, 1.5, 5]} />
            case 'blocky':
                return <boxGeometry args={[0.8, 1.5, 0.8]} />
            case 'ethereal':
                return <octahedronGeometry args={[0.6, 0]} />
            case 'spiky':
                return <coneGeometry args={[0.5, 1.5, 8]} />
            case 'geometric':
                return <dodecahedronGeometry args={[0.6]} />
            case 'balanced':
            default:
                return <capsuleGeometry args={[0.4, 1.5, 4, 8]} />
        }
    }, [agent])

    return (
        <group ref={groupRef} position={position}>
            {/* Main Body */}
            <mesh ref={bodyRef} castShadow>
                {geometry}
                <meshStandardMaterial
                    color={baseColor}
                    emissive={baseColor}
                    emissiveIntensity={isAttacking ? 1 : 0.3}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* HP indicator above */}
            <group position={[0, 1.5, 0]}>
                {/* HP bar background */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1.2, 0.12, 0.05]} />
                    <meshBasicMaterial color="#000" />
                </mesh>
                {/* HP bar fill */}
                <mesh position={[(hpRatio - 1) * 0.55, 0, 0.03]}>
                    <boxGeometry args={[1.1 * hpRatio, 0.08, 0.05]} />
                    <meshBasicMaterial color={hpRatio > 0.5 ? '#00FF88' : hpRatio > 0.25 ? '#FCEE0A' : '#FF3366'} />
                </mesh>
            </group>

            {/* Attack effect particles */}
            {isAttacking && (
                <group>
                    {[...Array(5)].map((_, i) => (
                        <mesh key={i} position={[
                            Math.sin(i * 72 * Math.PI / 180) * 0.8,
                            Math.cos(i * 72 * Math.PI / 180) * 0.8 + 0.5,
                            0.3
                        ]}>
                            <sphereGeometry args={[0.1]} />
                            <meshBasicMaterial color={baseColor} transparent opacity={0.8} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Player/Enemy glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <ringGeometry args={[0.6, 0.8, 32]} />
                <meshBasicMaterial
                    color={isPlayer ? '#00FF88' : '#FF3366'}
                    transparent
                    opacity={isAttacking ? 0.8 : 0.4}
                />
            </mesh>

            {/* Glow light */}
            <pointLight
                color={baseColor}
                intensity={isAttacking ? 3 : 1}
                distance={4}
            />
        </group>
    )
}

// Attack effect burst
export function AttackBurst({ position, color = '#FCEE0A' }: { position: [number, number, number], color?: string }) {
    const ref = useRef<any>(null)
    const scaleRef = useRef(0.1)

    useFrame((_, delta) => {
        if (ref.current) {
            scaleRef.current += delta * 8
            ref.current.scale.setScalar(scaleRef.current)
            ref.current.rotation.z += delta * 5

            // Fade out
            const opacity = Math.max(0, 1 - scaleRef.current / 3)
            ref.current.children.forEach((child: any) => {
                if ((child as THREE.Mesh).material) {
                    const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
                    mat.opacity = opacity
                }
            })
        }
    })

    if (scaleRef.current > 3) return null

    return (
        <group ref={ref} position={position}>
            {[...Array(8)].map((_, i) => (
                <mesh key={i} position={[
                    Math.cos(i * 45 * Math.PI / 180) * 0.5,
                    Math.sin(i * 45 * Math.PI / 180) * 0.5,
                    0
                ]}>
                    <octahedronGeometry args={[0.15]} />
                    <meshBasicMaterial color={color} transparent />
                </mesh>
            ))}
            <mesh>
                <ringGeometry args={[0.3, 0.5, 16]} />
                <meshBasicMaterial color={color} transparent />
            </mesh>
        </group>
    )
}
