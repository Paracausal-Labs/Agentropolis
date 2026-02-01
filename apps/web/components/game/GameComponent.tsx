'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { CityScene } from './scenes/CityScene'
import { CouncilScene } from './scenes/CouncilScene'

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      scene: [CityScene, CouncilScene],
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    gameRef.current = new Phaser.Game(config)
    
    gameRef.current.events.on('openCouncil', () => {
      gameRef.current?.scene.start('CouncilScene', { agents: [] })
    })

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return <div id="game-container" className="w-full h-screen" />
}
