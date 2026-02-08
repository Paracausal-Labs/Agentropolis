'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { COLORS } from '@/lib/game-constants'

interface BuildingProps {
    position: [number, number, number]
    width: number
    height: number
    depth: number
    type: 'council' | 'office' | 'residential' | 'commercial'
    onClick?: () => void
    isHovered?: boolean
}

export function Building({ position, width, height, depth, type, onClick, isHovered }: BuildingProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const edgesRef = useRef<THREE.LineSegments>(null)

    // Building visual config based on type
    const config = useMemo(() => {
        switch (type) {
            case 'council':
                return {
                    color: COLORS.neon.magenta,
                    edgeColor: COLORS.neon.cyan,
                    emissive: COLORS.neon.magenta,
                    emissiveIntensity: 0.5,
                    windowColor1: COLORS.building.windowCool,
                    windowColor2: COLORS.neon.purple,
                    label: 'COUNCIL HALL'
                }
            case 'office':
                return {
                    color: COLORS.building.office,
                    edgeColor: COLORS.neon.cyan,
                    emissive: '#000000',
                    emissiveIntensity: 0,
                    windowColor1: COLORS.building.windowCool,
                    windowColor2: '#ffffff',
                }
            case 'residential':
                return {
                    color: COLORS.building.residential,
                    edgeColor: COLORS.neon.orange,
                    emissive: '#000000',
                    emissiveIntensity: 0,
                    windowColor1: COLORS.building.windowWarm,
                    windowColor2: '#ffcc00',
                }
            case 'commercial':
                return {
                    color: COLORS.building.commercial,
                    edgeColor: COLORS.neon.green,
                    emissive: '#000000',
                    emissiveIntensity: 0,
                    windowColor1: COLORS.neon.green,
                    windowColor2: COLORS.neon.yellow,
                }
            default:
                return {
                    color: COLORS.building.base,
                    edgeColor: COLORS.neon.yellow,
                    emissive: '#000000',
                    emissiveIntensity: 0,
                    windowColor1: COLORS.building.windowWarm,
                    windowColor2: COLORS.building.windowCool,
                }
        }
    }, [type])

    const [clicked, setClicked] = useState(false)

    const handleClick = (e: any) => {
        if (onClick) {
            e.stopPropagation()
            setClicked(true)
            // Transition delay
            setTimeout(() => {
                onClick()
                // Reset after transition (though likely component unmounts)
                setTimeout(() => setClicked(false), 1000)
            }, 800)
        }
    }

    // Animated glow effect
    useFrame((state) => {
        if (meshRef.current && type === 'council') {
            if (clicked) {
                // Intense transition flash
                const pulse = Math.sin(state.clock.elapsedTime * 20) * 0.5 + 1.5 // Fast bright pulse
                    ; (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 2
                    ; (meshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0xffffff) // White hot
            } else {
                // Normal idle glow
                const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8
                    ; (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 0.5
                    ; (meshRef.current.material as THREE.MeshStandardMaterial).emissive.set(config.emissive)
            }
        }

        if (edgesRef.current && isHovered) {
            const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5
                ; (edgesRef.current.material as THREE.LineBasicMaterial).opacity = pulse
                ; (edgesRef.current.material as THREE.LineBasicMaterial).color.set(config.edgeColor)
        } else if (edgesRef.current) {
            (edgesRef.current.material as THREE.LineBasicMaterial).opacity = 0.3
        }
    })

    return (
        <group position={position}>
            {/* Main building */}
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow
                onClick={handleClick}
                onPointerOver={(e) => {
                    e.stopPropagation()
                    if (onClick) document.body.style.cursor = 'pointer'
                }}
                onPointerOut={(e) => {
                    e.stopPropagation()
                    document.body.style.cursor = 'default'
                }}
            >
                {/* Slightly reduce scale to avoid z-fighting with edges */}
                <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
                <meshStandardMaterial
                    color={config.color}
                    emissive={config.emissive}
                    emissiveIntensity={config.emissiveIntensity}
                    metalness={0.6}
                    roughness={0.2}
                />
            </mesh>

            {/* Door (Council Only) */}
            {type === 'council' && (
                <group position={[0, -height / 2 + 1.5, depth / 2 + 0.05]}>
                    {/* Door Frame */}
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[2.2, 3.2]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Glowing Portal */}
                    <mesh position={[0, -0.1, 0.02]}>
                        <planeGeometry args={[1.8, 3]} />
                        <meshStandardMaterial
                            color={COLORS.neon.cyan}
                            emissive={COLORS.neon.cyan}
                            emissiveIntensity={2}
                        />
                    </mesh>
                </group>
            )}

            {/* Neon edges */}
            <lineSegments ref={edgesRef}>
                <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
                <lineBasicMaterial
                    color={config.edgeColor}
                    transparent
                    opacity={0.3}
                    linewidth={2}
                />
            </lineSegments>

            {/* Windows (Grid Layout) */}
            {useMemo(() => {
                if (type === 'council') return null

                const windows: JSX.Element[] = []
                const wOffset = 0.06 // Distance from wall

                // Config per face
                const windowSize = [0.15, 0.25]
                const spacingX = 0.5
                const spacingY = 0.6

                // Helper to generate windows for a face
                const generateFace = (faceIdx: number) => {
                    let faceWidth = 0
                    let faceHeight = height * 0.8 // Margin top/bottom

                    if (faceIdx === 0 || faceIdx === 1) faceWidth = width * 0.8 // Front/Back
                    if (faceIdx === 2 || faceIdx === 3) faceWidth = depth * 0.8 // Sides

                    const cols = Math.floor(faceWidth / spacingX)
                    const rows = Math.floor(faceHeight / spacingY)

                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            // Skip some for variety, but keep grid structure
                            if (Math.random() > 0.7) continue

                            const u = (c - (cols - 1) / 2) * spacingX
                            const v = (r - (rows - 1) / 2) * spacingY

                            let x = 0, y = v, z = 0
                            let rotY = 0

                            if (faceIdx === 0) { // Front (+Z) -> actually in this logic 0 is +X maybe? Re-checking logic
                                // Original: face 0 x=width/2. So Face 0 is Right (+X)
                                x = width / 2 + wOffset; z = u; rotY = Math.PI / 2
                            } else if (faceIdx === 1) { // Left (-X)
                                x = -width / 2 - wOffset; z = u; rotY = Math.PI / 2
                            } else if (faceIdx === 2) { // Back (+Z)
                                z = depth / 2 + wOffset; x = u; rotY = 0
                            } else { // Front (-Z)
                                z = -depth / 2 - wOffset; x = u; rotY = 0
                            }

                            windows.push(
                                <mesh key={`${faceIdx}-${r}-${c}`} position={[x, y, z]} rotation={[0, rotY, 0]}>
                                    <planeGeometry args={[windowSize[0], windowSize[1]]} />
                                    <meshBasicMaterial
                                        color={Math.random() > 0.5 ? config.windowColor1 : config.windowColor2}
                                        side={THREE.DoubleSide}
                                    />
                                </mesh>
                            )
                        }
                    }
                }

                // Generate for all 4 faces
                for (let i = 0; i < 4; i++) generateFace(i)

                return windows
            }, [height, width, depth, type, config])}

            {/* Label for council */}
            {type === 'council' && (
                <Text
                    position={[0, height / 2 + 1, 0]}
                    fontSize={0.5}
                    color={COLORS.neon.cyan}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {config.label}
                </Text>
            )}
        </group>
    )
}

export function Road({ position, width, length, rotation = 0 }: {
    position: [number, number, number]
    width: number
    length: number
    rotation?: number
}) {
    return (
        <mesh position={position} rotation={[0, rotation, 0]} receiveShadow>
            <boxGeometry args={[width, 0.05, length]} />
            <meshStandardMaterial color={COLORS.building.road} roughness={0.9} />
            {/* Road markings */}
            <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.2, length * 0.8]} />
                <meshBasicMaterial color="#444444" /> {/* Center line base */}
            </mesh>
        </mesh>
    )
}

export function StreetLamp({ position }: { position: [number, number, number] }) {
    const lightRef = useRef<THREE.PointLight>(null)

    // Flicker effect
    useFrame(() => {
        if (lightRef.current && Math.random() < 0.05) {
            lightRef.current.intensity = 0.5 + Math.random() * 0.5
        } else if (lightRef.current) {
            lightRef.current.intensity = 0.8
        }
    })

    return (
        <group position={position}>
            {/* Pole */}
            <mesh position={[0, 1.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 2.5]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.5, 0.2]}>
                <boxGeometry args={[0.2, 0.1, 0.4]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Light Source */}
            <mesh position={[0, 2.45, 0.2]}>
                <boxGeometry args={[0.15, 0.05, 0.3]} />
                <meshBasicMaterial color="#ffffaa" />
            </mesh>
            <pointLight
                ref={lightRef}
                position={[0, 2.3, 0.2]}
                color="#ffffaa"
                distance={6}
                decay={2}
                intensity={0.8}
                castShadow
            />
            {/* Base Glow */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.6, 16]} />
                <meshBasicMaterial color="#ffffaa" transparent opacity={0.1} />
            </mesh>
        </group>
    )
}

export function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color={COLORS.building.grass} roughness={1} />
            <gridHelper args={[80, 80, '#222', '#111']} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
    )
}

interface LimitOrderTowerProps {
    position: [number, number, number]
    order: {
        id: string
        direction: 'buy' | 'sell'
        targetPrice: string
        amount: string
        status: 'construction' | 'active' | 'completed'
    }
    onClick?: () => void
}

export function LimitOrderTower({ position, order, onClick }: LimitOrderTowerProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.PointLight>(null)

    const config = useMemo(() => {
        switch (order.status) {
            case 'construction':
                return { color: '#6b7280', emissive: '#6b7280', intensity: 0.1, edgeColor: '#9ca3af' }
            case 'active':
                return { color: '#3b82f6', emissive: '#3b82f6', intensity: 0.5, edgeColor: '#60a5fa' }
            case 'completed':
                return { color: '#fbbf24', emissive: '#fbbf24', intensity: 1.0, edgeColor: '#fcd34d' }
        }
    }, [order.status])

    useFrame((state) => {
        if (!meshRef.current) return
        const mat = meshRef.current.material as THREE.MeshStandardMaterial
        if (order.status === 'completed') {
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7
            mat.emissiveIntensity = pulse
            if (glowRef.current) glowRef.current.intensity = pulse * 2
        } else if (order.status === 'active') {
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 0.35
            mat.emissiveIntensity = pulse
        }
    })

    const h = 4
    const w = 1.5

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.() }}
            onPointerOver={() => { if (onClick) document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'default' }}
        >
            <mesh ref={meshRef} position={[0, h / 2, 0]} castShadow>
                <boxGeometry args={[w, h, w]} />
                <meshStandardMaterial
                    color={config.color}
                    emissive={config.emissive}
                    emissiveIntensity={config.intensity}
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            <lineSegments position={[0, h / 2, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(w, h, w)]} />
                <lineBasicMaterial color={config.edgeColor} transparent opacity={0.6} />
            </lineSegments>

            <mesh position={[0, h + 0.5, 0]}>
                <cylinderGeometry args={[0.05, 0.15, 1, 8]} />
                <meshStandardMaterial color={config.edgeColor} emissive={config.edgeColor} emissiveIntensity={0.8} />
            </mesh>

            <pointLight
                ref={glowRef}
                position={[0, h + 1, 0]}
                color={config.emissive}
                distance={8}
                decay={2}
                intensity={config.intensity}
            />

            <Text
                position={[0, h + 1.5, 0]}
                fontSize={0.35}
                color={config.edgeColor}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {`${order.direction === 'buy' ? 'BUY' : 'SELL'} @ $${order.targetPrice}`}
            </Text>

            <Text
                position={[0, h + 1.1, 0]}
                fontSize={0.25}
                color={order.status === 'completed' ? '#fcd34d' : '#9ca3af'}
                anchorX="center"
                anchorY="middle"
            >
                {order.status === 'completed' ? 'FILLED' : order.status === 'active' ? 'ACTIVE' : 'PENDING'}
            </Text>

            {order.status === 'construction' && (
                <lineSegments position={[0, h / 2, 0]}>
                    <edgesGeometry args={[new THREE.BoxGeometry(w + 0.3, h + 0.3, w + 0.3)]} />
                    <lineBasicMaterial color="#fbbf24" transparent opacity={0.3} />
                </lineSegments>
            )}
        </group>
    )
}
