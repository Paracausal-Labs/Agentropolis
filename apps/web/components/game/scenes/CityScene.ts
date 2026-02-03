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

interface DeployedAgent {
  id: string
  name: string
  sprite: Phaser.GameObjects.Container
  gridX: number
  gridY: number
  isWalking?: boolean
}

const AGENT_POSITIONS = [
  { x: 3, y: 3 },
  { x: 8, y: 3 },
  { x: 3, y: 8 },
  { x: 8, y: 8 },
  { x: 2, y: 5 },
  { x: 9, y: 5 },
]

const STORAGE_KEY = 'agentropolis-agents'

interface StoredAgent {
  id: string
  name: string
  gridX: number
  gridY: number
}

export class CityScene extends Phaser.Scene {
  private isDragging = false
  private dragStartX = 0
  private dragStartY = 0
  private cameraStartX = 0
  private cameraStartY = 0
  private councilBuilding: Phaser.GameObjects.Container | null = null
  private tileContainer: Phaser.GameObjects.Container | null = null
  private deployedAgents: DeployedAgent[] = []
  private deployButton: Phaser.GameObjects.Container | null = null
  private agentPanel: Phaser.GameObjects.Container | null = null
  private isPanelOpen = false

  constructor() {
    super({ key: 'CityScene' })
  }

  private saveAgentsToStorage() {
    if (typeof window === 'undefined') return
    
    const data: StoredAgent[] = this.deployedAgents.map(a => ({
      id: a.id,
      name: a.name,
      gridX: a.gridX,
      gridY: a.gridY,
    }))
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('[CityScene] Saved', data.length, 'agents to storage')
    } catch (err) {
      console.error('[CityScene] Failed to save agents:', err)
    }
  }

  private loadAgentsFromStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      
      const agents = JSON.parse(stored) as StoredAgent[]
      console.log('[CityScene] Loading', agents.length, 'agents from storage')
      
      agents.forEach((agent, index) => {
        if (index >= AGENT_POSITIONS.length) return
        
        const screenPos = this.gridToIso(agent.gridX, agent.gridY)
        const sprite = this.createAgentSprite(screenPos.x, screenPos.y, agent.name)
        this.tileContainer!.add(sprite)
        
        const deployedAgent: DeployedAgent = {
          id: agent.id,
          name: agent.name,
          sprite,
          gridX: agent.gridX,
          gridY: agent.gridY,
          isWalking: false,
        }
        
        this.deployedAgents.push(deployedAgent)
        this.time.delayedCall(1000 + index * 500, () => this.startAgentWalking(deployedAgent))
      })
    } catch (err) {
      console.error('[CityScene] Failed to load agents:', err)
    }
  }

  public clearStoredAgents() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    console.log('[CityScene] Cleared stored agents')
  }

  preload() {}

  create() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    this.tileContainer = this.add.container(centerX, centerY - 100)

    // Draw isometric tiles
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tileType = CITY_MAP[y][x]
        
        // Skip council tiles - we'll draw them separately
        if (tileType === 4) continue

        const screenPos = this.gridToIso(x, y)
        const color = this.getTileColor(tileType)
        
        this.drawIsometricTile(this.tileContainer!, screenPos.x, screenPos.y, color)
        
        // Add small building on building tiles
        if (tileType === 2) {
          this.drawBuilding(this.tileContainer!, screenPos.x, screenPos.y, 0x1e40af, 20)
        }
      }
    }

    // Draw council building (larger, golden, in center)
    const councilPos = this.gridToIso(5.5, 5.5)
    this.councilBuilding = this.createCouncilBuilding(councilPos.x, councilPos.y)
    this.tileContainer!.add(this.councilBuilding)

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

    this.setupCameraControls()
    this.createDeployButton()
    this.createAgentPanel()
    this.loadAgentsFromStorage()

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
      const agents = this.deployedAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
      }))
      this.events.emit('openCouncil', agents)
      this.game.events.emit('openCouncil', agents)
    })

    return container
  }

  private createDeployButton() {
    const x = this.cameras.main.width - 120
    const y = 60
    
    this.deployButton = this.add.container(x, y)
    
    const bg = this.add.graphics()
    bg.fillStyle(0x22c55e, 1)
    bg.fillRoundedRect(-60, -20, 120, 40, 8)
    this.deployButton.add(bg)
    
    const text = this.add.text(0, 0, 'Deploy Agent', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.deployButton.add(text)
    
    this.deployButton.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains)
    
    this.deployButton.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x16a34a, 1)
      bg.fillRoundedRect(-60, -20, 120, 40, 8)
      this.input.setDefaultCursor('pointer')
    })
    
    this.deployButton.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x22c55e, 1)
      bg.fillRoundedRect(-60, -20, 120, 40, 8)
      this.input.setDefaultCursor('default')
    })
    
    this.deployButton.on('pointerdown', () => {
      this.toggleAgentPanel()
    })
    
    this.deployButton.setScrollFactor(0)
  }

  private createAgentPanel() {
    const panelWidth = 250
    const panelHeight = 300
    const x = this.cameras.main.width - panelWidth / 2 - 20
    const y = 200
    
    this.agentPanel = this.add.container(x, y)
    this.agentPanel.setVisible(false)
    this.agentPanel.setScrollFactor(0)
    
    const bg = this.add.graphics()
    bg.fillStyle(0x1e293b, 0.95)
    bg.fillRoundedRect(-panelWidth / 2, -20, panelWidth, panelHeight, 12)
    bg.lineStyle(2, 0x475569)
    bg.strokeRoundedRect(-panelWidth / 2, -20, panelWidth, panelHeight, 12)
    this.agentPanel.add(bg)
    
    const title = this.add.text(0, 0, 'Select Agent', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.agentPanel.add(title)
    
    const loadingText = this.add.text(0, 100, 'Loading agents...', {
      fontSize: '14px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.agentPanel.add(loadingText)
  }

  private async toggleAgentPanel() {
    if (this.isPanelOpen) {
      this.agentPanel?.setVisible(false)
      this.isPanelOpen = false
      return
    }
    
    this.agentPanel?.setVisible(true)
    this.isPanelOpen = true
    
    try {
      const res = await fetch('/api/agents/list')
      const agents = await res.json()
      this.populateAgentPanel(agents)
    } catch (err) {
      console.error('[CityScene] Failed to fetch agents:', err)
    }
  }

  private populateAgentPanel(agents: Array<{ agentId: number; name: string; strategy: string }>) {
    if (!this.agentPanel) return
    
    while (this.agentPanel.list.length > 2) {
      const child = this.agentPanel.list[this.agentPanel.list.length - 1]
      if (child instanceof Phaser.GameObjects.GameObject) {
        child.destroy()
      }
      this.agentPanel.list.pop()
    }
    
    agents.slice(0, 5).forEach((agent, i) => {
      const y = 50 + i * 50
      
      const itemBg = this.add.graphics()
      itemBg.fillStyle(0x334155, 1)
      itemBg.fillRoundedRect(-100, y - 18, 200, 40, 6)
      this.agentPanel!.add(itemBg)
      
      const nameText = this.add.text(-90, y - 8, agent.name, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      this.agentPanel!.add(nameText)
      
      const strategyText = this.add.text(-90, y + 8, agent.strategy, {
        fontSize: '11px',
        color: '#94a3b8',
        fontFamily: 'Arial',
      })
      this.agentPanel!.add(strategyText)
      
      const deployBtn = this.add.text(70, y, 'Deploy', {
        fontSize: '12px',
        color: '#22c55e',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5).setInteractive()
      
      deployBtn.on('pointerover', () => {
        deployBtn.setColor('#4ade80')
        this.input.setDefaultCursor('pointer')
      })
      
      deployBtn.on('pointerout', () => {
        deployBtn.setColor('#22c55e')
        this.input.setDefaultCursor('default')
      })
      
      deployBtn.on('pointerdown', () => {
        this.deployAgent(agent)
      })
      
      this.agentPanel!.add(deployBtn)
    })
  }

  private async deployAgent(agent: { agentId: number; name: string }) {
    if (this.deployedAgents.length >= AGENT_POSITIONS.length) {
      console.log('[CityScene] Max agents deployed')
      this.showDeployError('Max agents deployed')
      return
    }
    
    if (this.deployedAgents.some(a => a.id === String(agent.agentId))) {
      console.log('[CityScene] Agent already deployed')
      this.showDeployError('Agent already deployed')
      return
    }

    const agentropolis = (window as unknown as { agentropolis?: { 
      chargeAgentDeploy: () => Promise<{ success: boolean; error?: string }>
      isSessionActive: () => boolean 
    } }).agentropolis

    if (agentropolis?.isSessionActive()) {
      console.log('[CityScene] Charging agent deploy fee...')
      const result = await agentropolis.chargeAgentDeploy()
      
      if (!result.success) {
        console.log('[CityScene] Deploy charge failed:', result.error)
        this.showDeployError(result.error || 'Insufficient balance')
        return
      }
      
      console.log('[CityScene] Deploy fee charged successfully')
    } else {
      console.log('[CityScene] No active session - deploying without charge (demo mode)')
    }
    
    const pos = AGENT_POSITIONS[this.deployedAgents.length]
    const screenPos = this.gridToIso(pos.x, pos.y)
    
    const agentSprite = this.createAgentSprite(screenPos.x, screenPos.y, agent.name)
    this.tileContainer!.add(agentSprite)
    
    const deployedAgent: DeployedAgent = {
      id: String(agent.agentId),
      name: agent.name,
      sprite: agentSprite,
      gridX: pos.x,
      gridY: pos.y,
      isWalking: false,
    }
    
    this.deployedAgents.push(deployedAgent)
    this.saveAgentsToStorage()
    
    console.log(`[CityScene] Deployed agent: ${agent.name}`)
    this.game.events.emit('agentDeployed', agent)
    
    this.time.delayedCall(1000, () => this.startAgentWalking(deployedAgent))
    
    this.agentPanel?.setVisible(false)
    this.isPanelOpen = false
  }

  private showDeployError(message: string) {
    const errorText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      message,
      {
        fontSize: '16px',
        color: '#ef4444',
        fontFamily: 'Arial',
        backgroundColor: '#1e293b',
        padding: { x: 16, y: 8 },
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000)

    this.time.delayedCall(2000, () => {
      errorText.destroy()
    })
  }

  private createAgentSprite(x: number, y: number, name: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y - 10)
    const graphics = this.add.graphics()
    
    graphics.fillStyle(0x1e293b, 1)
    graphics.fillCircle(0, -20, 8)
    
    graphics.fillStyle(0x0f172a, 1)
    graphics.beginPath()
    graphics.moveTo(0, -12)
    graphics.lineTo(10, 8)
    graphics.lineTo(5, 8)
    graphics.lineTo(5, 18)
    graphics.lineTo(-5, 18)
    graphics.lineTo(-5, 8)
    graphics.lineTo(-10, 8)
    graphics.closePath()
    graphics.fillPath()
    
    graphics.lineStyle(1, 0x475569)
    graphics.strokeCircle(0, -20, 8)
    
    container.add(graphics)
    
    const label = this.add.text(0, -35, name.substring(0, 10), {
      fontSize: '10px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(0.5)
    container.add(label)
    
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

  private getAdjacentRoadTiles(x: number, y: number): Array<{ x: number; y: number }> {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ]

    return directions
      .map(d => ({ x: x + d.dx, y: y + d.dy }))
      .filter(pos => {
        if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return false
        const tile = CITY_MAP[pos.y]?.[pos.x]
        return tile === 1
      })
  }

  private startAgentWalking(agent: DeployedAgent) {
    if (agent.isWalking) return
    agent.isWalking = true
    this.walkToNextTile(agent)
  }

  private walkToNextTile(agent: DeployedAgent) {
    const adjacentRoads = this.getAdjacentRoadTiles(agent.gridX, agent.gridY)
    
    if (adjacentRoads.length === 0) {
      this.time.delayedCall(2000, () => this.walkToNextTile(agent))
      return
    }

    const nextTile = adjacentRoads[Math.floor(Math.random() * adjacentRoads.length)]
    const screenPos = this.gridToIso(nextTile.x, nextTile.y)

    this.tweens.add({
      targets: agent.sprite,
      x: screenPos.x,
      y: screenPos.y - 10,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => {
        agent.gridX = nextTile.x
        agent.gridY = nextTile.y
        this.time.delayedCall(500 + Math.random() * 1500, () => this.walkToNextTile(agent))
      }
    })
  }

  update() {}
}
