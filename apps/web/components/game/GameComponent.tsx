'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      scene: {
        create: function () {
          this.add.text(400, 300, 'Phaser Game Ready', {
            fontSize: '32px',
            color: '#ffffff',
          })
        },
      },
      backgroundColor: '#222222',
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return <div id="game-container" className="w-full h-screen" />
}
