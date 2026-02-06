"use client"

import { Float, Sparkles, Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { AGENTS, AGENT_MAP } from "@/lib/game/data"
import { useGameStore } from "@/lib/game/store"
import type { AgentId } from "@/lib/game/types"

function CouncilAvatar({
  id,
  angle,
  isSpeaking,
  isSelected,
}: {
  id: AgentId
  angle: number
  isSpeaking: boolean
  isSelected: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const agent = AGENT_MAP[id]
  const radius = 6.2
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  const selectAgent = useGameStore((state) => state.selectAgent)

  useFrame((state) => {
    if (!groupRef.current || !ringRef.current) return

    groupRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 2.6 + angle) * 0.1
    groupRef.current.rotation.y = -angle + Math.sin(state.clock.elapsedTime * 0.8 + angle) * 0.08

    const scalePulse = isSpeaking ? 1.25 : isSelected ? 1.14 : 1
    ringRef.current.scale.setScalar(scalePulse + Math.sin(state.clock.elapsedTime * 4 + angle) * 0.08)
  })

  return (
    <group ref={groupRef} position={[x, 0.9, z]} onClick={() => selectAgent(id)}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial color={agent.modelColor} emissive={agent.glowColor} emissiveIntensity={isSpeaking ? 1 : 0.5} metalness={0.24} roughness={0.3} />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.66, 0]}>
        <torusGeometry args={[0.8, 0.07, 12, 40]} />
        <meshBasicMaterial color={isSpeaking ? "#fff2b8" : isSelected ? agent.glowColor : "#2b3a52"} transparent opacity={0.95} />
      </mesh>

      <Text position={[0, 1.1, 0]} fontSize={0.18} color="#d9f7ff" anchorX="center" anchorY="middle">
        {agent.name}
      </Text>
    </group>
  )
}

export function CouncilScene() {
  const deployed = useGameStore((state) => state.deployedAgents)
  const selectedAgentId = useGameStore((state) => state.selectedAgentId)
  const speakerIndex = useGameStore((state) => state.speakerIndex)
  const proposal = useGameStore((state) => state.proposal)
  const deliberating = useGameStore((state) => state.deliberating)

  const speakingOrder = useMemo(
    () => AGENTS.filter((agent) => deployed.includes(agent.id)).map((agent) => agent.id),
    [deployed],
  )
  const speakingId = speakerIndex >= 0 ? speakingOrder[speakerIndex] : null

  const holoRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!holoRef.current) return
    holoRef.current.rotation.y = state.clock.elapsedTime * 0.55
    holoRef.current.position.y = 1.25 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08
  })

  const holoColor = proposal
    ? proposal.risk === "low"
      ? "#2cffa6"
      : proposal.risk === "medium"
        ? "#ffd757"
        : "#ff5b76"
    : deliberating
      ? "#49c7ff"
      : "#5c7aff"

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#0d1527" emissive="#18264a" emissiveIntensity={0.25} />
      </mesh>

      <mesh position={[0, 0.46, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.5, 5.1, 0.9, 48]} />
        <meshStandardMaterial color="#22253f" emissive="#2f335e" emissiveIntensity={0.35} metalness={0.35} roughness={0.5} />
      </mesh>

      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
        <mesh ref={holoRef} position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial color={holoColor} emissive={holoColor} emissiveIntensity={0.95} metalness={0.2} roughness={0.15} transparent opacity={0.9} />
        </mesh>
      </Float>

      {deployed.map((id, index) => (
        <CouncilAvatar
          key={id}
          id={id}
          angle={(index / deployed.length) * Math.PI * 2 + Math.PI * 0.2}
          isSelected={selectedAgentId === id}
          isSpeaking={speakingId === id}
        />
      ))}

      <Sparkles count={55} scale={18} size={2.6} speed={0.45} color="#6de6ff" opacity={0.7} />

      <Text position={[0, 3.8, 0]} fontSize={0.44} color="#ffd77a" anchorX="center" anchorY="middle">
        AUTONOMOUS COUNCIL CHAMBER
      </Text>
    </group>
  )
}
