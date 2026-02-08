'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import Scene3D from './Scene3D'
import { COLORS, CONFERENCE_ROOM_CONFIG } from '@/lib/game-constants'
import { Agent3D } from './3d/Agents'

export default function TownHall3D({ onBack }: { onBack?: () => void }) {
    return (
        <div className="w-full h-full relative font-[Rajdhani]">
            <Scene3D
                cameraPosition={[8, 8, 8]}
                cameraMode="orbital"
                enablePostProcessing
            >
                {/* Environment */}
                <IndustrialRoom />

                {/* Centerpiece */}
                <ConferenceTable />

                {/* Seating */}
                {CONFERENCE_ROOM_CONFIG.chairPositions.map((pos, i) => {
                    // Calculate rotation to face table center (0,0,0)
                    const angle = Math.atan2(pos[0], pos[2]) + Math.PI
                    return (
                        <FuturisticChair
                            key={i}
                            position={pos}
                            rotation={angle}
                        />
                    )
                })}

                {/* Ambient Elements */}
                <CeilingCables />
                <WallTerminal position={[-9, 2, 0]} rotation={[0, Math.PI / 2, 0]} />
                <WallTerminal position={[9, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />

                {/* Hologram Pedestals */}
                <HologramPedestal position={[-8, 0, -8]} color={COLORS.neon.cyan} />
                <HologramPedestal position={[8, 0, -8]} color={COLORS.neon.magenta} />
                <HologramPedestal position={[-8, 0, 8]} color={COLORS.neon.purple} />
                <HologramPedestal position={[8, 0, 8]} color={COLORS.neon.yellow} />

                {/* Sample Agents (Optional - can be passed as props later) */}
                {/* We'll leave the room empty of agents primarily to show off the furniture first, 
                    or add a couple to demonstrate scale if needed. Let's add one "User" agent. */}
                <Agent3D
                    position={[0, 0, 5]}
                    agentType="user"
                    rotation={Math.PI}
                    showNameTag
                />

            </Scene3D>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 pointer-events-auto">
                    {onBack && (
                        <button onClick={onBack} className="btn-cyber-outline px-6 py-2 bg-black/80">
                            {'<'} EXIT_TOWN_HALL
                        </button>
                    )}
                    <div className="mt-4 cyber-panel p-4 bg-black/60 backdrop-blur w-72">
                        <h1 className="text-xl font-bold text-[#FCEE0A] uppercase tracking-widest">Town Hall</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Use mouse to rotate view. <br />
                            <span className="text-[#00F0FF]">NEO-TOKYO PROJECT</span> deliberation in progress.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ConferenceTable() {
    const { width, depth, height } = CONFERENCE_ROOM_CONFIG.table

    return (
        <group position={[0, height / 2, 0]}>
            {/* Table Top */}
            <mesh receiveShadow castShadow>
                <boxGeometry args={[width, 0.2, depth]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    metalness={0.9}
                    roughness={0.2}
                />
            </mesh>

            {/* Glowing Edge */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[width + 0.1, 0.18, depth + 0.1]} />
                <meshStandardMaterial
                    color="#000"
                    emissive={COLORS.neon.cyan}
                    emissiveIntensity={2}
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {/* Table Base */}
            <mesh position={[0, -height / 2, 0]} castShadow>
                <cylinderGeometry args={[1.5, 2, height, 8]} />
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.5} />
            </mesh>

            {/* Tech Panels on surface */}
            <mesh position={[-2, 0.11, 1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.6]} />
                <meshBasicMaterial color="#000" />
            </mesh>
            <mesh position={[2, 0.11, -1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.6]} />
                <meshBasicMaterial color="#000" />
            </mesh>

            {/* Hologram Projector Center */}
            <mesh position={[0, 0.11, 0]}>
                <boxGeometry args={[4, 0.05, 2.5]} />
                <meshStandardMaterial color="#000" metalness={1} roughness={0.1} />
            </mesh>

            {/* Hologram Content */}
            <group position={[0, 0.5, 0]}>
                <CityHologram />
            </group>

            {/* Table Legs details */}
            <mesh position={[3, -height / 2, 1.5]}>
                <cylinderGeometry args={[0.2, 0.2, height, 8]} />
                <meshStandardMaterial color="#333" metalness={1} />
            </mesh>
            <mesh position={[-3, -height / 2, 1.5]}>
                <cylinderGeometry args={[0.2, 0.2, height, 8]} />
                <meshStandardMaterial color="#333" metalness={1} />
            </mesh>
            <mesh position={[3, -height / 2, -1.5]}>
                <cylinderGeometry args={[0.2, 0.2, height, 8]} />
                <meshStandardMaterial color="#333" metalness={1} />
            </mesh>
            <mesh position={[-3, -height / 2, -1.5]}>
                <cylinderGeometry args={[0.2, 0.2, height, 8]} />
                <meshStandardMaterial color="#333" metalness={1} />
            </mesh>
        </group>
    )
}

function CityHologram() {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
        }
    })

    return (
        <group ref={groupRef}>
            {/* Hologram Base Glow */}
            <pointLight distance={3} intensity={2} color={COLORS.neon.cyan} />

            {/* City Grid */}
            <gridHelper args={[3, 20, COLORS.neon.cyan, COLORS.neon.cyan]} />

            {/* Abstract Buildings */}
            {[...Array(15)].map((_, i) => {
                const h = Math.random() * 0.8 + 0.2
                const x = (Math.random() - 0.5) * 2
                const z = (Math.random() - 0.5) * 2
                return (
                    <mesh key={i} position={[x, h / 2, z]}>
                        <boxGeometry args={[0.1, h, 0.1]} />
                        <meshBasicMaterial
                            color={COLORS.neon.cyan}
                            transparent
                            opacity={0.6}
                            wireframe
                        />
                    </mesh>
                )
            })}

            {/* Floating Text */}
            <group position={[0, 1, 0]} rotation={[0, 0, 0]}>
                <Text
                    scale={[0.2, 0.2, 0.2]}
                    color={COLORS.neon.cyan}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Inter-Bold.woff"
                >
                    NEO-TOKYO PROJECT
                </Text>
            </group>
        </group>
    )
}

function FuturisticChair({ position, rotation }: { position: [number, number, number], rotation: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Seat Base */}
            <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.8, 0.1, 0.8]} />
                <meshStandardMaterial color="#222" roughness={0.8} />
            </mesh>

            {/* Backrest */}
            <mesh position={[0, 0.8, -0.35]} castShadow>
                <boxGeometry args={[0.8, 1.2, 0.1]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>

            {/* Armrests */}
            <mesh position={[-0.45, 0.6, 0]}>
                <boxGeometry args={[0.1, 0.05, 0.6]} />
                <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>
            <mesh position={[0.45, 0.6, 0]}>
                <boxGeometry args={[0.1, 0.05, 0.6]} />
                <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>

            {/* Neon Strips on Back */}
            <mesh position={[0, 0.8, -0.4]}>
                <boxGeometry args={[0.05, 1, 0.05]} />
                <meshBasicMaterial color={COLORS.neon.magenta} />
            </mesh>
            <mesh position={[-0.3, 0.8, -0.4]}>
                <boxGeometry args={[0.02, 0.8, 0.02]} />
                <meshBasicMaterial color={COLORS.neon.cyan} />
            </mesh>
            <mesh position={[0.3, 0.8, -0.4]}>
                <boxGeometry args={[0.02, 0.8, 0.02]} />
                <meshBasicMaterial color={COLORS.neon.cyan} />
            </mesh>

            {/* Stand */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.1, 0.3, 0.3, 8]} />
                <meshStandardMaterial color="#444" metalness={1} />
            </mesh>
        </group>
    )
}

function IndustrialRoom() {
    const size = CONFERENCE_ROOM_CONFIG.floorSize

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[size, size]} />
                <meshStandardMaterial color="#050510" roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Floor Grid Patterns */}
            <gridHelper args={[size, 20, '#222', '#111']} />

            {/* Glowing Floor Strips */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]}>
                <planeGeometry args={[size, 0.2]} />
                <meshBasicMaterial color={COLORS.neon.purple} toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}>
                <planeGeometry args={[size, 0.2]} />
                <meshBasicMaterial color={COLORS.neon.purple} toneMapped={false} />
            </mesh>

            {/* Walls */}
            <mesh position={[0, 5, -10]} receiveShadow>
                <planeGeometry args={[size, 10]} />
                <meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />
            </mesh>
            <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
                <planeGeometry args={[size, 10]} />
                <meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />
            </mesh>
            <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[size, 10]} />
                <meshStandardMaterial color="#151520" metalness={0.6} roughness={0.7} />
            </mesh>
            <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[size, 10]} />
                <meshStandardMaterial color="#151520" metalness={0.6} roughness={0.7} />
            </mesh>

            {/* Wall Details - Pipes/Vents */}
            <mesh position={[-9.5, 8, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 18, 16]} />
                <meshStandardMaterial color="#222" metalness={0.8} />
            </mesh>
            <mesh position={[9.5, 8, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 18, 16]} />
                <meshStandardMaterial color="#222" metalness={0.8} />
            </mesh>
        </group>
    )
}

function WallTerminal({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Screen Frame */}
            <mesh position={[0, 0, 0.1]}>
                <boxGeometry args={[3, 2, 0.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Screen Glow */}
            <mesh position={[0, 0, 0.21]}>
                <planeGeometry args={[2.8, 1.8]} />
                <meshBasicMaterial color={COLORS.neon.cyan} transparent opacity={0.1} />
            </mesh>
            {/* Data Text Lines (simulated) */}
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[-1 + Math.random(), 0.5 - i * 0.3, 0.22]}>
                    <planeGeometry args={[0.8, 0.05]} />
                    <meshBasicMaterial color={COLORS.neon.green} />
                </mesh>
            ))}
        </group>
    )
}

function HologramPedestal({ position, color }: { position: [number, number, number], color: string }) {
    const gemRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (gemRef.current) {
            gemRef.current.rotation.y = state.clock.elapsedTime
            gemRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        }
    })

    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#222" metalness={0.8} />
            </mesh>
            {/* Light Beam */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.1, 0.4, 2, 8, 1, true]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
            {/* Floating Info Gem */}
            <mesh ref={gemRef} position={[0, 1.2, 0]}>
                <octahedronGeometry args={[0.3]} />
                <meshBasicMaterial color={color} wireframe />
            </mesh>
        </group>
    )
}

function CeilingCables() {
    return (
        <group position={[0, 9, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0.2]}>
                <torusGeometry args={[8, 0.1, 8, 50, Math.PI * 2]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[2, -1, 0]} rotation={[0, 0, -0.1]}>
                <torusGeometry args={[6, 0.08, 8, 40, Math.PI * 2]} />
                <meshStandardMaterial color="#222" />
            </mesh>
        </group>
    )
} 
