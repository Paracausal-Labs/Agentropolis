import Phaser from 'phaser'

const TILE_WIDTH = 64
const TILE_HEIGHT = 32
const GRID_SIZE = 12

// Tile types with colors
const TILE_COLORS = {
  grass: 0x4ade80,
  road: 0x6b7280,
  building: 0x3b82f6,
  park: 0x22c55e,
  water: 0x38bdf8,
}

// City layout - 0=grass, 1=road, 2=building, 3=park, 4=council (center)
const CITY_MAP = [
  [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0],
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
  [3, 1, 2, 0, 2, 1, 1, 2, 0, 2, 1, 3],
  [3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 3],
  [0, 1, 2, 0, 0, 1, 1, 0, 0, 2, 1, 0],
  [0, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 0],
  [0, 1, 2, 0, 0, 1, 1, 0, 0, 2, 1, 0],
  [3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 3],
  [3, 1, 2, 0, 2, 1, 1, 2, 0, 2, 1, 3],
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
  [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0],
]

export class CityScene extends Phaser.Scene {
  private isDragging = false
  private dragStartX = 0
  private dragStartY = 0
  private cameraStartX = 0
  private cameraStartY = 0
  private councilBuilding: Phaser.GameObjects.Container | null = null

  constructor() {
    super({ key: 'CityScene' })
  }

  preload() {}

  create() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    // Create tile container
    const tileContainer = this.add.container(centerX, centerY - 100)

    // Draw isometric tiles
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tileType = CITY_MAP[y][x]
        
        // Skip council tiles - we'll draw them separately
        if (tileType === 4) continue

        const screenPos = this.gridToIso(x, y)
        const color = this.getTileColor(tileType)
        
        this.drawIsometricTile(tileContainer, screenPos.x, screenPos.y, color)
        
        // Add small building on building tiles
        if (tileType === 2) {
          this.drawBuilding(tileContainer, screenPos.x, screenPos.y, 0x1e40af, 20)
        }
      }
    }

    // Draw council building (larger, golden, in center)
    const councilPos = this.gridToIso(5.5, 5.5)
    this.councilBuilding = this.createCouncilBuilding(councilPos.x, councilPos.y)
    tileContainer.add(this.councilBuilding)

    // Add title
    this.add.text(centerX, 30, 'AGENTROPOLIS', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    }).setOrigin(0.5)

    // Add instructions
    this.add.text(centerX, this.cameras.main.height - 30, 
      'Drag to pan • Scroll to zoom • Click Council Building to enter', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Camera controls
    this.setupCameraControls()

    // Expose game to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).game = this.game
    }
  }

  private gridToIso(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: (gridX - gridY) * (TILE_WIDTH / 2),
      y: (gridX + gridY) * (TILE_HEIGHT / 2),
    }
  }

  private getTileColor(tileType: number): number {
    switch (tileType) {
      case 0: return TILE_COLORS.grass
      case 1: return TILE_COLORS.road
      case 2: return TILE_COLORS.grass // Building sits on grass
      case 3: return TILE_COLORS.park
      default: return TILE_COLORS.grass
    }
  }

  private drawIsometricTile(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    color: number
  ) {
    const graphics = this.add.graphics()
    
    // Draw tile
    graphics.fillStyle(color, 1)
    graphics.beginPath()
    graphics.moveTo(x, y - TILE_HEIGHT / 2)
    graphics.lineTo(x + TILE_WIDTH / 2, y)
    graphics.lineTo(x, y + TILE_HEIGHT / 2)
    graphics.lineTo(x - TILE_WIDTH / 2, y)
    graphics.closePath()
    graphics.fillPath()

    // Draw outline
    graphics.lineStyle(1, 0x000000, 0.2)
    graphics.strokePath()

    container.add(graphics)
  }

  private drawBuilding(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    color: number,
    height: number
  ) {
    const graphics = this.add.graphics()
    const w = TILE_WIDTH * 0.4
    const h = TILE_HEIGHT * 0.4

    // Front face
    graphics.fillStyle(color, 1)
    graphics.beginPath()
    graphics.moveTo(x, y - height)
    graphics.lineTo(x + w / 2, y - height + h / 2)
    graphics.lineTo(x + w / 2, y + h / 2)
    graphics.lineTo(x, y)
    graphics.closePath()
    graphics.fillPath()

    // Right face (darker)
    graphics.fillStyle(Phaser.Display.Color.ValueToColor(color).darken(30).color, 1)
    graphics.beginPath()
    graphics.moveTo(x, y - height)
    graphics.lineTo(x - w / 2, y - height + h / 2)
    graphics.lineTo(x - w / 2, y + h / 2)
    graphics.lineTo(x, y)
    graphics.closePath()
    graphics.fillPath()

    // Top face (lighter)
    graphics.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(20).color, 1)
    graphics.beginPath()
    graphics.moveTo(x, y - height)
    graphics.lineTo(x + w / 2, y - height + h / 2)
    graphics.lineTo(x, y - height + h)
    graphics.lineTo(x - w / 2, y - height + h / 2)
    graphics.closePath()
    graphics.fillPath()

    container.add(graphics)
  }

  private createCouncilBuilding(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const graphics = this.add.graphics()
    
    const w = TILE_WIDTH * 1.2
    const h = TILE_HEIGHT * 1.2
    const height = 50

    // Base platform
    graphics.fillStyle(0x94a3b8, 1)
    graphics.beginPath()
    graphics.moveTo(0, 0)
    graphics.lineTo(w / 2, h / 2)
    graphics.lineTo(0, h)
    graphics.lineTo(-w / 2, h / 2)
    graphics.closePath()
    graphics.fillPath()

    // Building front face (gold)
    graphics.fillStyle(0xfbbf24, 1)
    graphics.beginPath()
    graphics.moveTo(0, -height)
    graphics.lineTo(w / 2 - 10, -height + h / 2)
    graphics.lineTo(w / 2 - 10, h / 2)
    graphics.lineTo(0, 0)
    graphics.closePath()
    graphics.fillPath()

    // Building right face (darker gold)
    graphics.fillStyle(0xd97706, 1)
    graphics.beginPath()
    graphics.moveTo(0, -height)
    graphics.lineTo(-w / 2 + 10, -height + h / 2)
    graphics.lineTo(-w / 2 + 10, h / 2)
    graphics.lineTo(0, 0)
    graphics.closePath()
    graphics.fillPath()

    // Roof (bright gold)
    graphics.fillStyle(0xfcd34d, 1)
    graphics.beginPath()
    graphics.moveTo(0, -height - 15)
    graphics.lineTo(w / 2 - 10, -height + h / 2 - 15)
    graphics.lineTo(0, -height + h - 15)
    graphics.lineTo(-w / 2 + 10, -height + h / 2 - 15)
    graphics.closePath()
    graphics.fillPath()

    // Door
    graphics.fillStyle(0x78350f, 1)
    graphics.fillRect(-8, -20, 16, 20)

    // Windows
    graphics.fillStyle(0x7dd3fc, 1)
    graphics.fillRect(-20, -45, 10, 10)
    graphics.fillRect(10, -45, 10, 10)

    container.add(graphics)

    // Add label
    const label = this.add.text(0, -height - 35, 'COUNCIL', {
      fontSize: '12px',
      color: '#fbbf24',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    container.add(label)

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -height - 35, w, height + h + 35)
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
    
    container.on('pointerover', () => {
      this.input.setDefaultCursor('pointer')
      label.setColor('#ffffff')
      graphics.setAlpha(1.1)
    })

    container.on('pointerout', () => {
      this.input.setDefaultCursor('default')
      label.setColor('#fbbf24')
      graphics.setAlpha(1)
    })

    container.on('pointerdown', () => {
      console.log('[CityScene] Council building clicked - opening Council Room')
      // Emit event for React to handle scene transition
      this.events.emit('openCouncil')
      this.game.events.emit('openCouncil')
    })

    return container
  }

  private setupCameraControls() {
    // Drag to pan
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.isDragging = true
        this.dragStartX = pointer.x
        this.dragStartY = pointer.y
        this.cameraStartX = this.cameras.main.scrollX
        this.cameraStartY = this.cameras.main.scrollY
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = pointer.x - this.dragStartX
        const dy = pointer.y - this.dragStartY
        this.cameras.main.scrollX = this.cameraStartX - dx
        this.cameras.main.scrollY = this.cameraStartY - dy
      }
    })

    this.input.on('pointerup', () => {
      this.isDragging = false
    })

    // Scroll to zoom
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.1 : 0.1
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + zoomDelta, 0.5, 2)
      this.cameras.main.setZoom(newZoom)
    })
  }

  update() {}
}
