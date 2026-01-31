import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {}

  create() {
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'Agentropolis',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5)

    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 20,
      'City loading...',
      {
        fontSize: '18px',
        color: '#888888',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5)

    if (typeof window !== 'undefined') {
      (window as any).game = this.game
    }
  }

  update() {}
}
