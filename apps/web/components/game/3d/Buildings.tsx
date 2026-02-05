'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { COLORS } from '@/lib/game-constants'

interface BuildingProps {
    position: [number, number, number]
    width: number
    height: number
    depth: number
    type: 'council' | 'office' | 'house' | 'shop'
    onClick?: () => void
    isHovered?: boolean
}

export function Building({ position, width, height, depth, type, onClick, isHovered }: BuildingProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const edgesRef = useRef<THREE.LineSegments>(null)

    // Building colors based on type
    const buildingColor = useMemo(() => {
        switch (type) {
            case 'council':
                return COLORS.neon.magenta
            case 'office':
                return COLORS.building.base
            case 'house':
                return COLORS.building.base
            case 'shop':
                return COLORS.building.base
            default:
                return COLORS.building.base
        }
    }, [type])

    // Animated glow effect
    useFrame((state) => {
        if (meshRef.current && type === 'council') {
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8
                ; (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
        }

        if (edgesRef.current && isHovered) {
            const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5
                ; (edgesRef.current.material as THREE.LineBasicMaterial).opacity = pulse
        }
    })

    return (
        <group position={position}>
            {/* Main building */}
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow
                onClick={onClick}
                onPointerOver={(e) => {
                    e.stopPropagation()
                    document.body.style.cursor = onClick ? 'pointer' : 'default'
                }}
                onPointerOut={(e) => {
                    e.stopPropagation()
                    document.body.style.cursor = 'default'
                }}
            >
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial
                    color={buildingColor}
                    emissive={type === 'council' ? COLORS.neon.magenta : '#000000'}
                    emissiveIntensity={type === 'council' ? 0.5 : 0}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* Neon edges */}
            <lineSegments ref={edgesRef}>
                <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
                <lineBasicMaterial
                    color={type === 'council' ? COLORS.neon.cyan : COLORS.neon.yellow}
                    transparent
                    opacity={isHovered ? 0.8 : 0.3}
                    linewidth={2}
                />
            </lineSegments>

            {/* Windows (random glowing dots) */}
            {Array.from({ length: Math.floor(height) * 2 }).map((_, i) => {
                const x = (Math.random() - 0.5) * width * 0.8
                const y = (Math.random() - 0.5) * height * 0.8
                const z = width / 2 + 0.01

                return (
                    <mesh key={i} position={[x, y, z]}>
                        <boxGeometry args={[0.2, 0.2, 0.1]} />
                        <meshStandardMaterial
                            color={Math.random() > 0.5 ? COLORS.building.windowWarm : COLORS.building.windowCool}
                            emissive={Math.random() > 0.5 ? COLORS.building.windowWarm : COLORS.building.windowCool}
                            emissiveIntensity={0.8}
                        />
                    </mesh>
                )
            })}

            {/* Label for council building */}
            {type === 'council' && (
                <Text
                    position={[0, height / 2 + 1, 0]}
                    fontSize={0.5}
                    color={COLORS.neon.cyan}
                    anchorX="center"
                    anchorY="middle"
                >
                    COUNCIL HALL
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
            <boxGeometry args={[width, 0.1, length]} />
            <meshStandardMaterial color={COLORS.building.road} />
        </mesh>
    )
}

export function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color={COLORS.building.grass} />
        </mesh>
    )
}
