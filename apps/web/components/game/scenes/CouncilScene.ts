import Phaser from 'phaser'

interface AgentSeat {
  id: string
  name: string
  x: number
  y: number
  sprite: Phaser.GameObjects.Container
}

interface Proposal {
  id: string
  agentName: string
  pair: { tokenIn: { symbol: string }; tokenOut: { symbol: string } }
  amountIn: string
  expectedAmountOut: string
  reasoning: string
  confidence: number
  riskLevel: string
}

export class CouncilScene extends Phaser.Scene {
  private seats: AgentSeat[] = []
  private currentProposal: Proposal | null = null
  private proposalCard: Phaser.GameObjects.Container | null = null
  private approveBtn: Phaser.GameObjects.Container | null = null
  private rejectBtn: Phaser.GameObjects.Container | null = null

  constructor() {
    super({ key: 'CouncilScene' })
  }

  init(data: { agents?: Array<{ id: string; name: string }> }) {
    this.seats = []
    if (data.agents) {
      data.agents.forEach((agent) => {
        this.seats.push({
          id: agent.id,
          name: agent.name,
          x: 0,
          y: 0,
          sprite: null as unknown as Phaser.GameObjects.Container,
        })
      })
    }
  }

  create() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0f172a)

    this.add.text(centerX, 40, 'THE COUNCIL', {
      fontSize: '28px',
      color: '#fbbf24',
      fontFamily: 'Arial Black',
    }).setOrigin(0.5)

    this.drawRoundtable(centerX, centerY - 50)
    this.placeSeats(centerX, centerY - 50)
    this.createProposalCard(centerX, centerY + 180)
    this.createBackButton()
    this.fetchProposal()

    if (typeof window !== 'undefined') {
      (window as any).game = this.game
    }
  }

  private drawRoundtable(x: number, y: number) {
    const graphics = this.add.graphics()
    
    graphics.fillStyle(0x78350f, 1)
    graphics.fillEllipse(x, y + 20, 400, 180)
    
    graphics.fillStyle(0x92400e, 1)
    graphics.fillEllipse(x, y, 400, 180)
    
    graphics.lineStyle(3, 0xfbbf24, 0.5)
    graphics.strokeEllipse(x, y, 400, 180)
    
    const innerGraphics = this.add.graphics()
    innerGraphics.fillStyle(0x451a03, 1)
    innerGraphics.fillEllipse(x, y, 300, 130)
  }

  private placeSeats(tableX: number, tableY: number) {
    const seatPositions = [
      { angle: -90, distance: 220, label: 'YOU' },
      { angle: -45, distance: 200, label: '' },
      { angle: 0, distance: 190, label: '' },
      { angle: 45, distance: 200, label: '' },
      { angle: 90, distance: 220, label: '' },
      { angle: 135, distance: 200, label: '' },
      { angle: 180, distance: 190, label: '' },
      { angle: 225, distance: 200, label: '' },
    ]

    seatPositions.forEach((pos, i) => {
      const radians = (pos.angle * Math.PI) / 180
      const x = tableX + Math.cos(radians) * pos.distance
      const y = tableY + Math.sin(radians) * (pos.distance * 0.45)
      
      const isUser = i === 0
      const agent = this.seats[i - 1]
      
      const seat = this.createSeatSprite(x, y, isUser, agent?.name || pos.label)
      
      if (agent) {
        agent.x = x
        agent.y = y
        agent.sprite = seat
      }
    })
  }

  private createSeatSprite(x: number, y: number, isUser: boolean, name: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const graphics = this.add.graphics()
    
    if (isUser) {
      graphics.fillStyle(0x3b82f6, 1)
    } else if (name) {
      graphics.fillStyle(0x1e293b, 1)
    } else {
      graphics.fillStyle(0x374151, 0.5)
    }
    
    graphics.fillCircle(0, 0, 25)
    
    if (name) {
      graphics.lineStyle(2, isUser ? 0x60a5fa : 0x475569)
      graphics.strokeCircle(0, 0, 25)
    }
    
    container.add(graphics)
    
    if (name) {
      const icon = this.add.text(0, -2, isUser ? '👤' : '🤖', {
        fontSize: '20px',
      }).setOrigin(0.5)
      container.add(icon)
      
      const label = this.add.text(0, 35, name.substring(0, 12), {
        fontSize: '11px',
        color: isUser ? '#60a5fa' : '#94a3b8',
        fontFamily: 'Arial',
      }).setOrigin(0.5)
      container.add(label)
    }
    
    return container
  }

  private createProposalCard(x: number, y: number) {
    this.proposalCard = this.add.container(x, y)
    
    const cardWidth = 500
    const cardHeight = 160
    
    const bg = this.add.graphics()
    bg.fillStyle(0x1e293b, 1)
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12)
    bg.lineStyle(2, 0x475569)
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12)
    this.proposalCard.add(bg)
    
    const loadingText = this.add.text(0, 0, 'Waiting for proposal...', {
      fontSize: '16px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.proposalCard.add(loadingText)
    
    this.approveBtn = this.createButton(x - 80, y + 110, 'APPROVE', 0x22c55e, () => this.handleApprove())
    this.rejectBtn = this.createButton(x + 80, y + 110, 'REJECT', 0xef4444, () => this.handleReject())
    
    this.approveBtn.setVisible(false)
    this.rejectBtn.setVisible(false)
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-60, -18, 120, 36, 8)
    container.add(bg)
    
    const label = this.add.text(0, 0, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    container.add(label)
    
    container.setInteractive(new Phaser.Geom.Rectangle(-60, -18, 120, 36), Phaser.Geom.Rectangle.Contains)
    
    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(20).color, 1)
      bg.fillRoundedRect(-60, -18, 120, 36, 8)
      this.input.setDefaultCursor('pointer')
    })
    
    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(color, 1)
      bg.fillRoundedRect(-60, -18, 120, 36, 8)
      this.input.setDefaultCursor('default')
    })
    
    container.on('pointerdown', onClick)
    
    return container
  }

  private createBackButton() {
    const btn = this.add.text(30, 30, '← Back to City', {
      fontSize: '14px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setInteractive()
    
    btn.on('pointerover', () => {
      btn.setColor('#ffffff')
      this.input.setDefaultCursor('pointer')
    })
    
    btn.on('pointerout', () => {
      btn.setColor('#94a3b8')
      this.input.setDefaultCursor('default')
    })
    
    btn.on('pointerdown', () => {
      this.scene.start('CityScene')
    })
  }

  private async fetchProposal() {
    try {
      const res = await fetch('/api/agents/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.seats[0]?.id || '1',
          context: { balance: '1 ETH', riskLevel: 'medium' },
        }),
      })
      
      const proposal = await res.json()
      this.displayProposal(proposal)
    } catch (err) {
      console.error('[CouncilScene] Failed to fetch proposal:', err)
    }
  }

  private displayProposal(proposal: Proposal) {
    this.currentProposal = proposal
    
    if (!this.proposalCard) return
    
    while (this.proposalCard.list.length > 1) {
      const child = this.proposalCard.list[this.proposalCard.list.length - 1]
      if (child instanceof Phaser.GameObjects.GameObject) child.destroy()
      this.proposalCard.list.pop()
    }

    this.proposalCard.setAlpha(0)
    this.proposalCard.setScale(0.9)
    
    const riskColors: Record<string, number> = { low: 0x22c55e, medium: 0xeab308, high: 0xef4444 }
    const riskColor = riskColors[proposal.riskLevel] || 0x94a3b8
    
    const riskIndicator = this.add.graphics()
    riskIndicator.fillStyle(riskColor, 1)
    riskIndicator.fillRoundedRect(-250, -80, 6, 160, 3)
    this.proposalCard.add(riskIndicator)
    
    const title = this.add.text(0, -55, `📊 Trade Proposal from ${proposal.agentName}`, {
      fontSize: '14px',
      color: '#fbbf24',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.proposalCard.add(title)
    
    const swapText = this.add.text(0, -25, 
      `${proposal.amountIn} ${proposal.pair.tokenIn.symbol} → ${proposal.expectedAmountOut} ${proposal.pair.tokenOut.symbol}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.proposalCard.add(swapText)
    
    const reasonText = this.add.text(0, 15, proposal.reasoning.substring(0, 80), {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'Arial',
      wordWrap: { width: 420 },
    }).setOrigin(0.5)
    this.proposalCard.add(reasonText)

    const confidenceBarBg = this.add.graphics()
    confidenceBarBg.fillStyle(0x374151, 1)
    confidenceBarBg.fillRoundedRect(-100, 48, 200, 12, 6)
    this.proposalCard.add(confidenceBarBg)

    const confidenceBar = this.add.graphics()
    const barColor = proposal.confidence >= 75 ? 0x22c55e : proposal.confidence >= 50 ? 0xeab308 : 0xef4444
    confidenceBar.fillStyle(barColor, 1)
    confidenceBar.fillRoundedRect(-100, 48, (proposal.confidence / 100) * 200, 12, 6)
    this.proposalCard.add(confidenceBar)

    const confidenceLabel = this.add.text(-110, 47, `${proposal.confidence}%`, {
      fontSize: '10px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(1, 0)
    this.proposalCard.add(confidenceLabel)

    const riskLabel = this.add.text(110, 47, proposal.riskLevel.toUpperCase(), {
      fontSize: '10px',
      color: Phaser.Display.Color.IntegerToColor(riskColor).rgba,
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0, 0)
    this.proposalCard.add(riskLabel)

    this.tweens.add({
      targets: this.proposalCard,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    })
    
    this.approveBtn?.setVisible(true)
    this.rejectBtn?.setVisible(true)

    if (this.approveBtn) {
      this.approveBtn.setScale(0)
      this.tweens.add({
        targets: this.approveBtn,
        scale: 1,
        duration: 200,
        delay: 200,
        ease: 'Back.easeOut',
      })
    }
    if (this.rejectBtn) {
      this.rejectBtn.setScale(0)
      this.tweens.add({
        targets: this.rejectBtn,
        scale: 1,
        duration: 200,
        delay: 250,
        ease: 'Back.easeOut',
      })
    }
  }

  private handleApprove() {
    if (!this.currentProposal) return
    
    console.log('[CouncilScene] Proposal approved:', this.currentProposal.id)
    this.game.events.emit('proposalApproved', this.currentProposal)
    
    this.showResult('✓ Approved! Executing swap...', 0x22c55e)
  }

  private handleReject() {
    if (!this.currentProposal) return
    
    console.log('[CouncilScene] Proposal rejected:', this.currentProposal.id)
    this.game.events.emit('proposalRejected', this.currentProposal)
    
    this.showResult('✗ Rejected', 0xef4444)
    
    this.time.delayedCall(1500, () => this.fetchProposal())
  }

  private showResult(message: string, color: number) {
    this.approveBtn?.setVisible(false)
    this.rejectBtn?.setVisible(false)
    
    const resultText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 230,
      message,
      {
        fontSize: '18px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)
    
    this.time.delayedCall(2000, () => {
      resultText.destroy()
    })
  }

  update() {}
}
