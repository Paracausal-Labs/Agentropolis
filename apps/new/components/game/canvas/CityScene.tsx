"use client"

import { Line, Sparkles, Stars, Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { AGENT_MAP, CITY_WAYPOINTS } from "@/lib/game/data"
import { useGameStore } from "@/lib/game/store"
import type { AgentId } from "@/lib/game/types"

function Walker({ agentId, offset }: { agentId: AgentId; offset: number }) {
  const ref = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const path = useMemo(() => CITY_WAYPOINTS.map((point) => new THREE.Vector3(...point)), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const agent = AGENT_MAP[agentId]

  useFrame((state) => {
    if (!ref.current) return

    const t = (state.clock.elapsedTime * 0.23 + offset) % path.length
    const i = Math.floor(t)
    const next = (i + 1) % path.length
    const alpha = t - i

    tmp.copy(path[i]).lerp(path[next], alpha)
    ref.current.position.copy(tmp)

    const look = path[next].clone().sub(path[i])
    ref.current.rotation.y = Math.atan2(look.x, look.z)

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5 + offset) * 0.08)
    }
  })

  return (
    <group ref={ref}>
      <mesh castShadow>
        <capsuleGeometry args={[0.26, 0.58, 4, 10]} />
        <meshStandardMaterial color={agent.modelColor} emissive={agent.glowColor} emissiveIntensity={0.6} metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh ref={glowRef} position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.34, 32]} />
        <meshBasicMaterial color={agent.glowColor} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function CityScene() {
  const deployed = useGameStore((state) => state.deployedAgents)
  const setView = useGameStore((state) => state.setView)

  const roads = [
    [-8, 0.02, -6, 16, 1.4],
    [-8, 0.02, 0, 16, 1.4],
    [-8, 0.02, 6, 16, 1.4],
    [-10, 0.02, -4, 1.4, 10],
    [-2, 0.02, -4, 1.4, 10],
    [6, 0.02, -4, 1.4, 10],
  ]

  const skyline = useMemo(
    () => [
      { p: [-11, 2.4, -9], h: 4.8, c: "#1f2d44" },
      { p: [-7, 2, -9.5], h: 4.1, c: "#273a5d" },
      { p: [-2.4, 2.7, -9.6], h: 5.5, c: "#2d2f63" },
      { p: [2.8, 1.8, -9.2], h: 3.7, c: "#34417e" },
      { p: [7.7, 2.4, -9], h: 4.9, c: "#283559" },
      { p: [11, 1.8, -9], h: 3.6, c: "#2d3f66" },
      { p: [11.6, 2.1, -3], h: 4.2, c: "#3f305f" },
      { p: [11.8, 2.7, 2], h: 5.4, c: "#293f66" },
      { p: [11.1, 2.1, 7], h: 4.1, c: "#2a3461" },
      { p: [-11.7, 2.2, 7], h: 4.5, c: "#343768" },
      { p: [-10.5, 1.7, 10], h: 3.4, c: "#1f2f53" },
      { p: [-5.2, 2.3, 10.5], h: 4.7, c: "#304970" },
      { p: [0, 1.9, 10.8], h: 3.8, c: "#264169" },
      { p: [6, 2.5, 10], h: 5.1, c: "#3a2c56" },
    ],
    [],
  )

  return (
    <group>
      <Stars radius={70} depth={26} count={2200} factor={4} saturation={0} fade speed={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#101929" roughness={0.9} metalness={0.05} />
      </mesh>

      {roads.map((road, index) => (
        <mesh key={`road-${index}`} position={[road[0], road[1], road[2]]} receiveShadow>
          <boxGeometry args={[road[3], 0.05, road[4]]} />
          <meshStandardMaterial color="#151a28" emissive="#09203f" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {skyline.map((building, index) => (
        <group key={`building-${index}`} position={building.p as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.3, building.h, 2.3]} />
            <meshStandardMaterial color={building.c} emissive={building.c} emissiveIntensity={0.28} metalness={0.22} roughness={0.45} />
          </mesh>
          <mesh position={[0, building.h * 0.5 + 0.1, 0]}>
            <boxGeometry args={[2, 0.1, 2]} />
            <meshStandardMaterial color="#3ce6ff" emissive="#3ce6ff" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0, 0]} onClick={() => setView("council")}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.95, 2.4, 2.8, 32]} />
          <meshStandardMaterial color="#461f68" emissive="#7d3db5" emissiveIntensity={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <torusGeometry args={[2.5, 0.08, 16, 80]} />
          <meshStandardMaterial color="#ff4de6" emissive="#ff4de6" emissiveIntensity={1.1} />
        </mesh>
        <Text position={[0, 3.15, 0]} fontSize={0.34} color="#ffd757" anchorX="center" anchorY="middle">
          COUNCIL HALL
        </Text>
      </group>

      <Sparkles count={65} scale={24} size={2.4} speed={0.5} color="#1ed8ff" opacity={0.7} />

      <Line
        points={CITY_WAYPOINTS.map((point) => new THREE.Vector3(...point))}
        color="#4ce8ff"
        lineWidth={1.4}
        transparent
        opacity={0.42}
      />

      {deployed.map((agentId, index) => (
        <Walker key={agentId} agentId={agentId} offset={index * 1.2} />
      ))}
    </group>
  )
}
