import * as Phaser from 'phaser'
import type { LimitOrder } from '../PlaceOrderModal'

const TILE_WIDTH = 64
const TILE_HEIGHT = 32

export class LimitOrderBuilding extends Phaser.GameObjects.Container {
    private order: LimitOrder
    private buildingGraphics: Phaser.GameObjects.Graphics
    private labelText: Phaser.GameObjects.Text
    private statusText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number, order: LimitOrder) {
        super(scene, x, y)

        this.order = order
        this.buildingGraphics = scene.add.graphics()
        this.add(this.buildingGraphics)

        // Label
        this.labelText = scene.add.text(0, -75, '🏗️ Trade Tower', {
            fontSize: '10px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        }).setOrigin(0.5)
        this.add(this.labelText)

        // Status info
        this.statusText = scene.add.text(0, -60, this.getStatusLabel(), {
            fontSize: '8px',
            color: '#94a3b8',
            fontFamily: 'Arial',
        }).setOrigin(0.5)
        this.add(this.statusText)

        this.drawBuilding()
        this.setupInteractivity()

        scene.add.existing(this)
    }

    private getStatusLabel(): string {
        const tokenOut = this.order.tokenOut.includes('WETH') ? 'ETH' : 'USDC'
        return `${this.order.direction === 'buy' ? 'Buy' : 'Sell'} ${tokenOut} @ $${this.order.targetPrice}`
    }

    private drawBuilding() {
        const graphics = this.buildingGraphics
        graphics.clear()

        const w = TILE_WIDTH * 0.6
        const h = TILE_HEIGHT * 0.6
        const height = 40

        let color: number
        let glowStrength = 0

        switch (this.order.status) {
            case 'construction':
                color = 0x6b7280 // Gray
                this.labelText.setText('🏗️ Pending')
                break
            case 'active':
                color = 0x3b82f6 // Blue
                glowStrength = 0.3
                this.labelText.setText('⚡ Active')
                break
            case 'completed':
                color = 0xfbbf24 // Gold
                glowStrength = 0.8
                this.labelText.setText('✨ Ready!')
                break
        }

        // Add glow effect for active/completed
        if (glowStrength > 0) {
            graphics.fillStyle(color, glowStrength * 0.3)
            graphics.fillCircle(0, -height / 2, 50)
        }

        // Front face
        graphics.fillStyle(color, 1)
        graphics.beginPath()
        graphics.moveTo(0, -height)
        graphics.lineTo(w / 2, -height + h / 2)
        graphics.lineTo(w / 2, h / 2)
        graphics.lineTo(0, 0)
        graphics.closePath()
        graphics.fillPath()

        // Right face (darker)
        const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(30).color
        graphics.fillStyle(darkerColor, 1)
        graphics.beginPath()
        graphics.moveTo(0, -height)
        graphics.lineTo(-w / 2, -height + h / 2)
        graphics.lineTo(-w / 2, h / 2)
        graphics.lineTo(0, 0)
        graphics.closePath()
        graphics.fillPath()

        // Top face (lighter)
        const lighterColor = Phaser.Display.Color.ValueToColor(color).lighten(20).color
        graphics.fillStyle(lighterColor, 1)
        graphics.beginPath()
        graphics.moveTo(0, -height)
        graphics.lineTo(w / 2, -height + h / 2)
        graphics.lineTo(0, -height + h)
        graphics.lineTo(-w / 2, -height + h / 2)
        graphics.closePath()
        graphics.fillPath()

        // Pulse animation for completed
        if (this.order.status === 'completed') {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.7,
                duration: 1000,
                yoyo: true,
                repeat: -1,
            })
        }
    }

    private setupInteractivity() {
        const w = TILE_WIDTH * 0.6
        const h = TILE_HEIGHT * 0.6
        const height = 40

        const hitArea = new Phaser.Geom.Rectangle(-w / 2, -height, w, height + h)
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)

        this.on('pointerover', () => {
            this.scene.input.setDefaultCursor('pointer')
            this.labelText.setScale(1.1)
        })

        this.on('pointerout', () => {
            this.scene.input.setDefaultCursor('default')
            this.labelText.setScale(1)
        })

        this.on('pointerdown', () => {
            this.handleClick()
        })
    }

    private handleClick() {
        console.log('[LimitOrderBuilding] Clicked:', this.order)

        if (this.order.status === 'completed') {
            // Emit event for claiming
            this.scene.events.emit('claimLimitOrder', this.order.id)
            this.scene.game.events.emit('claimLimitOrder', this.order.id)
        } else {
            // Show order details
            this.scene.events.emit('showLimitOrderDetails', this.order)
            this.scene.game.events.emit('showLimitOrderDetails', this.order)
        }
    }

    public updateOrder(order: LimitOrder) {
        if (order.id !== this.order.id) return

        const statusChanged = this.order.status !== order.status
        this.order = order
        this.statusText.setText(this.getStatusLabel())

        if (statusChanged) {
            this.drawBuilding()
        }
    }
}
