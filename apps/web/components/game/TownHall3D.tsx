'use client'

import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Scene3D from './Scene3D'
import { COLORS } from '@/lib/game-constants'
import { useGame } from '@/contexts/GameContext'
import { Mission } from '@/lib/game-data'
import { Html } from '@react-three/drei'

interface TownHall3DProps {
    onBack: () => void
    onGoToMarketplace: () => void
    onGoToBattle: () => void
    onGoToLeaderboard: () => void
}

// Player sprite controlled by WASD
function PlayerSprite({
    onPositionUpdate
}: {
    onPositionUpdate: (x: number, z: number) => void
}) {
    const groupRef = useRef<THREE.Group>(null)
    const bodyRef = useRef<THREE.Mesh>(null)
    const position = useRef(new THREE.Vector3(0, 0, 0))
    const velocity = useRef(new THREE.Vector3())
    const targetRotation = useRef(0)
    const keys = useRef({ w: false, a: false, s: false, d: false })
    const { camera } = useThree()

    // SLOWER speed
    const speed = 0.04
    const friction = 0.9

    // Zoom control
    const zoomLevel = useRef(22)

    // Keyboard & Mouse handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            if (key in keys.current) {
                keys.current[key as keyof typeof keys.current] = true
                e.preventDefault()
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            if (key in keys.current) {
                keys.current[key as keyof typeof keys.current] = false
            }
        }

        const handleWheel = (e: WheelEvent) => {
            // Adjust zoom level (clamped)
            zoomLevel.current += e.deltaY * 0.02
            zoomLevel.current = Math.max(10, Math.min(40, zoomLevel.current))
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        window.addEventListener('wheel', handleWheel)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('wheel', handleWheel)
        }
    }, [])

    useFrame((state) => {
        if (!groupRef.current) return

        // Calculate movement direction (camera-relative)
        const dir = new THREE.Vector3()
        if (keys.current.w) dir.z -= 1
        if (keys.current.s) dir.z += 1
        if (keys.current.a) dir.x -= 1
        if (keys.current.d) dir.x += 1

        if (dir.length() > 0) {
            dir.normalize()
            velocity.current.add(dir.multiplyScalar(speed))
            targetRotation.current = Math.atan2(dir.x, dir.z)
        }

        // Apply friction
        velocity.current.multiplyScalar(friction)

        // Update position with bounds
        position.current.add(velocity.current)
        position.current.x = Math.max(-18, Math.min(18, position.current.x))
        position.current.z = Math.max(-18, Math.min(18, position.current.z))

        // Set group position
        groupRef.current.position.x = position.current.x
        groupRef.current.position.z = position.current.z
        groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 6) * 0.03

        // Smooth rotation
        if (velocity.current.length() > 0.005) {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetRotation.current,
                0.15
            )
        }

        // Wobble when moving
        if (bodyRef.current) {
            if (velocity.current.length() > 0.005) {
                bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 12) * 0.15
            } else {
                bodyRef.current.rotation.z *= 0.9
            }
        }

        // Update minimap position
        onPositionUpdate(position.current.x, position.current.z)

        // FIXED CAMERA - smooth isometric follow with DYNAMIC ZOOM
        const height = zoomLevel.current
        const zOffset = height * 0.8 // Maintain roughly the same angle
        const camX = position.current.x * 0.5
        const camZ = position.current.z * 0.5 + zOffset

        camera.position.lerp(new THREE.Vector3(camX, height, camZ), 0.05)
        camera.lookAt(position.current.x * 0.3, 0, position.current.z * 0.3)
    })

    return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
            {/* Player body */}
            <mesh ref={bodyRef} castShadow>
                <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
                <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={0.6} metalness={0.5} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={0.6} />
            </mesh>

            {/* Eye visor */}
            <mesh position={[0, 0.5, 0.15]}>
                <boxGeometry args={[0.28, 0.06, 0.04]} />
                <meshBasicMaterial color="#FF3366" />
            </mesh>

            {/* Glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
                <ringGeometry args={[0.3, 0.45, 16]} />
                <meshBasicMaterial color="#00FF88" opacity={0.7} transparent />
            </mesh>

            <pointLight color="#00FF88" intensity={1.5} distance={4} />
        </group>
    )
}

// Glowing Arrow component for "CLICK ME"
function GlowingArrow({ position }: { position: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            // Bounce up and down
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.3
        }
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Arrow pointing down */}
            <mesh rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshBasicMaterial color="#FCEE0A" />
            </mesh>
            {/* Glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                <ringGeometry args={[0.2, 0.4, 16]} />
                <meshBasicMaterial color="#FCEE0A" opacity={0.6} transparent />
            </mesh>
            {/* Light */}
            <pointLight color="#FCEE0A" intensity={2} distance={3} />
            {/* CLICK ME text */}
            <Html position={[0, 0.8, 0]} center>
                <div className="text-sm font-black text-[#FCEE0A] animate-pulse whitespace-nowrap" style={{ textShadow: '0 0 10px #FCEE0A, 0 0 20px #FCEE0A' }}>
                    ⬇️ CLICK ME!
                </div>
            </Html>
        </group>
    )
}

// Building component
function CyberBuilding({ position, size, color, name, glowColor = '#FCEE0A', showArrow = false, onClick }: {
    position: [number, number, number], size: [number, number, number], color: string, name: string, glowColor?: string, showArrow?: boolean, onClick?: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.015
        }
    })

    return (
        <group position={position}>
            {/* Glowing arrow */}
            {showArrow && <GlowingArrow position={[0, size[1] + 1.5, 0]} />}

            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size[0] + 0.15, size[2] + 0.15]} />
                <meshBasicMaterial color="#000" opacity={0.4} transparent />
            </mesh>

            <mesh ref={meshRef} position={[0, size[1] / 2, 0]} castShadow onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                <boxGeometry args={size} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} emissive={glowColor} emissiveIntensity={0.08} />
            </mesh>
            <mesh position={[0, size[1] + 0.03, 0]}>
                <boxGeometry args={[size[0] + 0.08, 0.06, size[2] + 0.08]} />
                <meshBasicMaterial color={glowColor} opacity={0.5} transparent />
            </mesh>

            {name && (
                <Html position={[0, size[1] + 0.4, 0]} center>
                    <div className="text-[7px] font-bold text-white bg-black/80 px-1 py-0.5 whitespace-nowrap border border-[#FCEE0A]/30">
                        {name}
                    </div>
                </Html>
            )}
        </group>
    )
}

// Tree
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.3, 6]} />
                <meshStandardMaterial color="#4a3728" />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.2, 6, 6]} />
                <meshStandardMaterial color="#1a5c32" emissive="#00FF88" emissiveIntensity={0.08} />
            </mesh>
        </group>
    )
}

// Fountain
function Fountain({ position }: { position: [number, number, number] }) {
    const waterRef = useRef<THREE.Mesh>(null)
    useFrame((state) => { if (waterRef.current) waterRef.current.rotation.y = state.clock.elapsedTime * 0.3 })

    return (
        <group position={position}>
            <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[1, 1.2, 0.08, 8]} />
                <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
            </mesh>
            <mesh ref={waterRef} position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.9, 0.9, 0.04, 8]} />
                <meshStandardMaterial color="#00F5FF" opacity={0.6} transparent emissive="#00F5FF" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.1, 0.15, 0.5, 6]} />
                <meshStandardMaterial color="#2a2a4a" metalness={0.9} />
            </mesh>
            <pointLight position={[0, 0.5, 0]} color="#00F5FF" intensity={1.5} distance={2.5} />
        </group>
    )
}

// Road - horizontal or vertical
function Road({ position, width, length, isHorizontal = true }: { position: [number, number, number], width: number, length: number, isHorizontal?: boolean }) {
    const sizeX = isHorizontal ? length : width
    const sizeZ = isHorizontal ? width : length

    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[sizeX, sizeZ]} />
                <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
            </mesh>
            {/* Center line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={isHorizontal ? [length * 0.9, 0.08] : [0.08, length * 0.9]} />
                <meshBasicMaterial color="#FCEE0A" opacity={0.6} transparent />
            </mesh>
        </group>
    )
}

// Parking lot
function ParkingLot({ position, size }: { position: [number, number, number], size: [number, number] }) {
    const cars = []
    const spacesX = Math.floor(size[0] / 0.7)
    const spacesZ = Math.floor(size[1] / 1)

    for (let x = 0; x < spacesX; x++) {
        for (let z = 0; z < spacesZ; z++) {
            if (Math.random() > 0.4) {
                cars.push(
                    <mesh key={`car-${x}-${z}`} position={[(x - spacesX / 2) * 0.7 + 0.35, 0.12, (z - spacesZ / 2) * 1 + 0.5]}>
                        <boxGeometry args={[0.4, 0.25, 0.7]} />
                        <meshStandardMaterial color={['#FF3366', '#00F5FF', '#FCEE0A', '#9D00FF', '#00FF88'][Math.floor(Math.random() * 5)]} metalness={0.7} />
                    </mesh>
                )
            }
        }
    }

    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={size} />
                <meshStandardMaterial color="#1a1a2a" roughness={0.9} />
            </mesh>
            {cars}
        </group>
    )
}

// Bench
function Bench({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.4, 0.04, 0.16]} />
                <meshStandardMaterial color="#4a3728" />
            </mesh>
        </group>
    )
}

// Street lamp
function StreetLamp({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.025, 0.04, 0.7, 6]} />
                <meshStandardMaterial color="#2a2a4a" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshBasicMaterial color="#FCEE0A" />
            </mesh>
            <pointLight position={[0, 0.72, 0]} color="#FCEE0A" intensity={0.4} distance={1.8} />
        </group>
    )
}

// River
function River({ position, size }: { position: [number, number, number], size: [number, number] }) {
    const waterRef = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        if (waterRef.current && waterRef.current.material instanceof THREE.MeshStandardMaterial) {
            waterRef.current.material.emissiveIntensity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.08
        }
    })

    return (
        <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={position}>
            <planeGeometry args={size} />
            <meshStandardMaterial color="#00F5FF" opacity={0.6} transparent emissive="#00F5FF" emissiveIntensity={0.15} metalness={0.4} />
        </mesh>
    )
}

// MINIMAP Component
function MiniMap({ playerX, playerZ }: { playerX: number, playerZ: number }) {
    // Map bounds: -18 to 18 => 0 to 100%
    const mapSize = 36
    const dotX = ((playerX + 18) / mapSize) * 100
    const dotY = ((playerZ + 18) / mapSize) * 100

    return (
        <div className="absolute bottom-4 right-4 w-40 h-40 bg-black/80 border border-[#FCEE0A]/50 rounded overflow-hidden pointer-events-auto">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-500" />
            </div>

            {/* Road grid overlay */}
            <div className="absolute inset-0 opacity-30">
                {/* Main horizontal road */}
                <div className="absolute top-[45%] left-0 right-0 h-2 bg-gray-600" />
                {/* Left vertical road */}
                <div className="absolute left-[15%] top-0 bottom-0 w-1.5 bg-gray-600" />
                {/* Right vertical road */}
                <div className="absolute right-[15%] top-0 bottom-0 w-1.5 bg-gray-600" />
            </div>

            {/* Buildings */}
            <div className="absolute top-[15%] left-[40%] w-[20%] h-[15%] bg-[#FCEE0A]/40 border border-[#FCEE0A]/60" title="Town Hall" />
            <div className="absolute top-[60%] left-[25%] w-[50%] h-[10%] bg-[#00F5FF]/30 border border-[#00F5FF]/50" title="Shops" />
            <div className="absolute top-[40%] left-[5%] w-[10%] h-[30%] bg-[#FF6B00]/30 border border-[#FF6B00]/50" title="Residential" />
            <div className="absolute top-[45%] right-[5%] w-[15%] h-[40%] bg-[#00FF88]/20 border border-[#00FF88]/40" title="Park" />

            {/* Player dot */}
            <div
                className="absolute w-3 h-3 bg-[#00FF88] rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{
                    left: `calc(${dotX}% - 6px)`,
                    top: `calc(${dotY}% - 6px)`,
                    boxShadow: '0 0 8px #00FF88'
                }}
            />

            {/* Legend */}
            <div className="absolute top-1 left-1 text-[8px] text-[#FCEE0A] font-bold">MAP</div>
        </div>
    )
}

export default function TownHall3D({ onBack, onGoToMarketplace, onGoToBattle, onGoToLeaderboard }: TownHall3DProps) {
    const { state, actions } = useGame()
    const [activeTab, setActiveTab] = useState<'missions' | 'rewards' | 'stats'>('missions')
    const [showPanel, setShowPanel] = useState(false) // Default to explore mode (panel hidden)
    const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 })
    const league = actions.getLeague()

    const currentLevelXp = (state.level - 1) ** 2 * 100
    const nextLevelXp = state.level ** 2 * 100
    const progressToNext = ((state.xpTotal - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100

    return (
        <div className="w-full h-full relative font-[Rajdhani]">
            {/* 3D City View */}
            <Scene3D cameraPosition={[0, 22, 18]} cameraMode="fixed" enablePostProcessing>
                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                    <planeGeometry args={[50, 50]} />
                    <meshStandardMaterial color="#0a0a12" roughness={0.95} />
                </mesh>

                {/* Player */}
                <PlayerSprite onPositionUpdate={(x, z) => setPlayerPos({ x, z })} />

                {/* === ROAD GRID - HORIZONTAL + VERTICAL === */}

                {/* Main horizontal road (Main Street) */}
                <Road position={[0, 0, 0]} width={2.5} length={40} isHorizontal={true} />

                {/* Second horizontal road (bottom) */}
                <Road position={[0, 0, 10]} width={2} length={40} isHorizontal={true} />

                {/* Left vertical road */}
                <Road position={[-10, 0, 0]} width={2} length={40} isHorizontal={false} />

                {/* Right vertical road */}
                <Road position={[10, 0, 0]} width={2} length={40} isHorizontal={false} />

                {/* Intersection overlays */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.015, 0]}>
                    <planeGeometry args={[3, 3]} />
                    <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.015, 0]}>
                    <planeGeometry args={[3, 3]} />
                    <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
                </mesh>

                {/* === TOWN HALL BLOCK (top center) === */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -8]}>
                    <planeGeometry args={[16, 10]} />
                    <meshStandardMaterial color="#1a1a22" roughness={0.85} />
                </mesh>
                <CyberBuilding position={[0, 0, -10]} size={[5, 2.5, 3.5]} color="#1a1a2e" name="COUNCIL CHAMBER" glowColor="#FCEE0A" showArrow={!showPanel} onClick={() => setShowPanel(true)} />
                <CyberBuilding position={[0, 0, -6]} size={[2.5, 1.2, 1.2]} color="#1a1a2e" name="" glowColor="#FCEE0A" />
                <Fountain position={[0, 0, -4]} />
                <Bench position={[-2.5, 0, -5]} rotation={Math.PI / 2} />
                <Bench position={[2.5, 0, -5]} rotation={-Math.PI / 2} />
                <Tree position={[-4, 0, -6]} />
                <Tree position={[4, 0, -6]} />
                <Tree position={[-4, 0, -10]} />
                <Tree position={[4, 0, -10]} />

                {/* Service buildings behind town hall */}
                <CyberBuilding position={[-6, 0, -12]} size={[2.5, 1.2, 2]} color="#1a1a28" name="Service" glowColor="#666" />
                <CyberBuilding position={[6, 0, -12]} size={[2.5, 1.2, 2]} color="#1a1a28" name="Storage" glowColor="#666" />

                {/* === RESIDENTIAL BLOCK (top left) === */}
                <CyberBuilding position={[-14, 0, -8]} size={[2, 1.4, 2.5]} color="#2a2035" name="Residential" glowColor="#FF6B00" />
                <CyberBuilding position={[-14, 0, -4]} size={[1.8, 1.1, 2]} color="#2a2035" name="" glowColor="#FF6B00" />
                <CyberBuilding position={[-14, 0, 4]} size={[2, 1.5, 2.5]} color="#2a2035" name="Residential" glowColor="#FF6B00" />
                <Tree position={[-12, 0, -6]} scale={0.8} />
                <Tree position={[-12, 0, 2]} scale={0.8} />

                {/* === COMMERCIAL BLOCK (bottom center) === */}
                <CyberBuilding position={[-5, 0, 5]} size={[1.8, 1.2, 2]} color="#1e2836" name="Cafe" glowColor="#00F5FF" />
                <CyberBuilding position={[-2, 0, 5]} size={[2.2, 1.4, 2]} color="#1e2836" name="Grocery" glowColor="#00FF88" />
                <CyberBuilding position={[1.5, 0, 5]} size={[2, 1.2, 2]} color="#1e2836" name="Pharmacy" glowColor="#FF3366" />
                <CyberBuilding position={[5, 0, 5]} size={[2.2, 1.3, 2]} color="#1e2836" name="Bookstore" glowColor="#9D00FF" />

                {/* Public services */}
                <CyberBuilding position={[-5, 0, 14]} size={[2, 1.3, 1.8]} color="#252540" name="Police" glowColor="#3366FF" />
                <CyberBuilding position={[-1, 0, 14]} size={[2, 1.5, 1.8]} color="#3a2020" name="Fire Dept" glowColor="#FF3300" />
                <CyberBuilding position={[3, 0, 14]} size={[1.8, 1.2, 1.8]} color="#203a20" name="Clinic" glowColor="#00FF88" />

                {/* Parking */}
                <ParkingLot position={[0, 0, 8]} size={[8, 3]} />

                {/* === PARK BLOCK (right side) === */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14, 0.02, 4]}>
                    <planeGeometry args={[6, 10]} />
                    <meshStandardMaterial color="#0a2a15" roughness={0.9} />
                </mesh>
                <Tree position={[12, 0, 0]} scale={1} />
                <Tree position={[14, 0, 2]} scale={0.9} />
                <Tree position={[16, 0, 1]} scale={0.8} />
                <Tree position={[13, 0, 5]} scale={1.1} />
                <Tree position={[15, 0, 6]} />
                <Tree position={[14, 0, 8]} scale={1.2} />
                <Tree position={[12, 0, 7]} scale={0.9} />
                <Bench position={[13, 0, 4]} />
                <Bench position={[15, 0, 7]} rotation={Math.PI} />
                <River position={[17.5, 0.03, 4]} size={[1, 12]} />

                {/* Street lamps along roads */}
                <StreetLamp position={[-6, 0, -1.5]} />
                <StreetLamp position={[-2, 0, -1.5]} />
                <StreetLamp position={[2, 0, -1.5]} />
                <StreetLamp position={[6, 0, -1.5]} />
                <StreetLamp position={[-6, 0, 1.5]} />
                <StreetLamp position={[6, 0, 1.5]} />

                {/* Lighting */}
                <ambientLight intensity={0.35} />
                <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
                <pointLight position={[0, 3, -10]} color="#FCEE0A" intensity={1.5} distance={12} />
            </Scene3D>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Back Button - moved down to avoid header overlap */}
                <div className="absolute top-20 left-4 pointer-events-auto">
                    <button onClick={onBack} className="px-4 py-2 bg-black/90 border border-[#FCEE0A]/50 text-[#FCEE0A] text-xs font-bold uppercase tracking-wider hover:bg-[#FCEE0A] hover:text-black transition-all">
                        {'<'} EXIT
                    </button>
                </div>

                {/* Town Hall Button (opens popup) - moved down */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <button
                        onClick={() => setShowPanel(!showPanel)}
                        className={`px-6 py-2 font-bold uppercase tracking-wider text-sm transition-all border ${showPanel
                            ? 'bg-[#FCEE0A] text-black border-[#FCEE0A]'
                            : 'bg-black/90 text-[#FCEE0A] border-[#FCEE0A]/50 hover:bg-[#FCEE0A]/20'
                            }`}
                    >
                        🏛️ COUNCIL CHAMBER
                    </button>
                </div>

                {/* Controls hint */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 border border-[#00FF88]/30 px-4 py-2 text-center">
                    <div className="text-[#00FF88] text-xs font-bold">
                        <span className="text-white">WASD</span> to move around the town
                    </div>
                </div>

                {/* Quick Nav Buttons */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
                    <button onClick={onGoToMarketplace} className="px-4 py-2 bg-black/90 border border-[#00F5FF]/50 text-[#00F5FF] text-xs font-bold uppercase hover:bg-[#00F5FF] hover:text-black transition-all">🛒 SHOP</button>
                    <button onClick={onGoToBattle} className="px-4 py-2 bg-[#FF3366] border border-[#FF3366] text-white text-xs font-bold uppercase hover:bg-[#FF0044] transition-all">⚔️ BATTLE</button>
                    <button onClick={onGoToLeaderboard} className="px-4 py-2 bg-black/90 border border-[#FFD700]/50 text-[#FFD700] text-xs font-bold uppercase hover:bg-[#FFD700] hover:text-black transition-all">🏆 RANKS</button>
                </div>

                {/* MINIMAP */}
                <MiniMap playerX={playerPos.x} playerZ={playerPos.z} />

                {/* Town Hall Panel Popup */}
                {showPanel && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" onClick={() => setShowPanel(false)}>
                        <div className="w-full max-w-3xl bg-black/95 border border-[#FCEE0A]/50 p-6 mx-4" onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{league.icon}</div>
                                    <div>
                                        <div className="text-xl font-black text-white">{league.name}</div>
                                        <div className="text-[#FCEE0A] font-mono text-sm">🏆 {state.trophies} Trophies</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400">Level {state.level}</div>
                                    <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#FCEE0A] to-[#FF6B00]" style={{ width: `${progressToNext}%` }} />
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">{state.xpTotal}/{nextLevelXp} XP</div>
                                </div>
                                <button onClick={() => setShowPanel(false)} className="text-2xl text-gray-500 hover:text-white">✕</button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-4">
                                {(['missions', 'rewards', 'stats'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-all border ${activeTab === tab
                                            ? 'bg-[#FCEE0A] text-black border-[#FCEE0A]'
                                            : 'bg-black/80 text-gray-500 border-gray-700 hover:border-[#FCEE0A] hover:text-[#FCEE0A]'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="max-h-[350px] overflow-y-auto">
                                {activeTab === 'missions' && <MissionsTab dailyMissions={state.dailyMissions} weeklyMissions={state.weeklyMissions} onClaim={actions.claimMissionReward} />}
                                {activeTab === 'rewards' && <RewardsTab chests={state.chestInventory} chestSlots={state.chestSlots} />}
                                {activeTab === 'stats' && <StatsTab stats={state.stats} winStreak={state.winStreak} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Sub Components
function MissionsTab({ dailyMissions, weeklyMissions, onClaim }: { dailyMissions: Mission[], weeklyMissions: Mission[], onClaim: (id: string) => void }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-[#FCEE0A] font-bold uppercase text-sm mb-2">📅 Daily Missions</h3>
                {dailyMissions.slice(0, 3).map(m => <MissionCard key={m.id} mission={m} onClaim={onClaim} />)}
            </div>
            <div>
                <h3 className="text-[#00F5FF] font-bold uppercase text-sm mb-2">📆 Weekly</h3>
                {weeklyMissions.slice(0, 2).map(m => <MissionCard key={m.id} mission={m} onClaim={onClaim} />)}
            </div>
        </div>
    )
}

function MissionCard({ mission, onClaim }: { mission: Mission, onClaim: (id: string) => void }) {
    const progress = Math.min(100, (mission.progress / mission.target) * 100)
    return (
        <div className={`p-2 mb-1 border-l-2 ${mission.claimed ? 'bg-green-900/20 border-green-500' : mission.completed ? 'bg-[#FCEE0A]/10 border-[#FCEE0A]' : 'bg-black/40 border-gray-700'}`}>
            <div className="flex justify-between items-center">
                <span className="text-white text-sm"><span className="mr-1">{mission.icon}</span>{mission.title}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[#FCEE0A] text-xs">{mission.reward.type === 'gold' ? '🪙' : mission.reward.type === 'gems' ? '💎' : '⭐'} {mission.reward.amount}</span>
                    {mission.completed && !mission.claimed && <button onClick={() => onClaim(mission.id)} className="px-2 py-0.5 bg-[#00FF88] text-black text-[10px] font-bold">CLAIM</button>}
                </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-gray-800 rounded-full"><div className="h-full bg-[#FCEE0A] rounded-full" style={{ width: `${progress}%` }} /></div>
                <span className="text-[10px] text-gray-400">{mission.progress}/{mission.target}</span>
            </div>
        </div>
    )
}

function RewardsTab({ chests, chestSlots }: { chests: any[], chestSlots: any[] }) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {chestSlots.map((slot, i) => (
                <div key={i} className={`p-3 text-center border ${slot ? 'bg-[#FCEE0A]/10 border-[#FCEE0A]/50' : 'bg-black/40 border-gray-700'}`}>
                    <div className="text-xl">{slot ? '🔓' : '➕'}</div>
                    <div className="text-[10px] text-gray-400">{slot ? 'Unlocking' : 'Empty'}</div>
                </div>
            ))}
        </div>
    )
}

function StatsTab({ stats, winStreak }: { stats: any, winStreak: number }) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {[
                { label: 'Wins', value: stats.battlesWon, icon: '⚔️' },
                { label: 'Losses', value: stats.battlesLost, icon: '💀' },
                { label: 'Streak', value: winStreak, icon: '🔥' },
                { label: 'Coins', value: stats.coinsCollected, icon: '🪙' }
            ].map((s, i) => (
                <div key={i} className="p-2 text-center bg-black/60 border border-gray-700">
                    <div className="text-lg">{s.icon}</div>
                    <div className="text-white font-bold">{s.value}</div>
                    <div className="text-[10px] text-gray-400">{s.label}</div>
                </div>
            ))}
        </div>
    )
}
