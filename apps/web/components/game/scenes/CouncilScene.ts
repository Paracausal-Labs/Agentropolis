import * as Phaser from 'phaser'
import type { CouncilMessage, DeliberationResult } from '@agentropolis/shared'

const AGENT_EMOJIS: Record<string, string> = {
  alpha: '🎯',
  risk: '🛡️',
  macro: '🔮',
  devil: '😈',
  clerk: '📋',
}

const OPINION_COLORS: Record<string, number> = {
  SUPPORT: 0x22c55e,
  CONCERN: 0xeab308,
  OPPOSE: 0xef4444,
  NEUTRAL: 0x64748b,
}

interface AgentSeat {
  id: string
  name: string
  role?: string
  x: number
  y: number
  sprite: Phaser.GameObjects.Container
}

interface TradeProposalUI {
  id: string
  agentName: string
  pair: { tokenIn: { symbol: string }; tokenOut: { symbol: string } }
  amountIn: string
  expectedAmountOut: string
  reasoning: string
  confidence: number
  riskLevel: string
  strategyType?: string
  deliberation?: DeliberationResult
}

interface TokenLaunchProposalUI {
  id: string
  agentName: string
  action: 'token_launch'
  strategyType: 'token_launch'
  tokenName: string
  tokenSymbol: string
  tokenDescription: string
  reasoning: string
  confidence: number
  riskLevel: string
  rewardRecipient: string
  rewardBps: number
  vaultPercentage?: number
  deliberation?: DeliberationResult
}

type Proposal = TradeProposalUI | TokenLaunchProposalUI

function isTokenLaunchProposal(proposal: Proposal): proposal is TokenLaunchProposalUI {
  return proposal.strategyType === 'token_launch'
}

const PRESET_PROMPTS = [
  { label: '💰 Passive Income', prompt: 'I want passive income from my 0.1 ETH' },
  { label: '🔄 Simple Swap', prompt: 'Swap 0.05 ETH to USDC' },
  { label: '📈 High Yield LP', prompt: 'Provide liquidity for maximum yield' },
  { label: '🚀 Launch Token', prompt: 'Launch a memecoin for the lobster community' },
]

const MAX_DELIBERATION_RETRIES = 3
const RETRY_DELAY_MS = 2000

export class CouncilScene extends Phaser.Scene {
  private seats: AgentSeat[] = []
  private councilSeats: AgentSeat[] = []
  private currentProposal: Proposal | null = null
  private proposalCard: Phaser.GameObjects.Container | null = null
  private approveBtn: Phaser.GameObjects.Container | null = null
  private rejectBtn: Phaser.GameObjects.Container | null = null
  private currentBubble: Phaser.GameObjects.Container | null = null
  private isDeliberating = false
  private loadingText: Phaser.GameObjects.Text | null = null
  private promptSelector: Phaser.GameObjects.Container | null = null
  private deliberationRetries = 0

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
    this.createPromptSelector(centerX, centerY + 120)

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
    const councilAgents = [
      { role: 'alpha', name: 'Alpha Hunter' },
      { role: 'risk', name: 'Risk Sentinel' },
      { role: 'macro', name: 'Macro Oracle' },
      { role: 'devil', name: "Devil's Advocate" },
      { role: 'clerk', name: 'Council Clerk' },
    ]

    const deployedAgentNames = this.seats.map(s => s.name).filter(Boolean)
    const getAgentLabel = (index: number, defaultName: string): string => {
      if (deployedAgentNames.length > index) {
        return deployedAgentNames[index]
      }
      return defaultName
    }

    const seatPositions = [
      { angle: -90, distance: 220, label: 'YOU', role: 'user' },
      { angle: -45, distance: 200, label: getAgentLabel(0, councilAgents[0].name), role: councilAgents[0].role },
      { angle: 0, distance: 190, label: getAgentLabel(1, councilAgents[1].name), role: councilAgents[1].role },
      { angle: 45, distance: 200, label: getAgentLabel(2, councilAgents[2].name), role: councilAgents[2].role },
      { angle: 90, distance: 220, label: getAgentLabel(3, councilAgents[3].name), role: councilAgents[3].role },
      { angle: 180, distance: 190, label: councilAgents[4].name, role: councilAgents[4].role },
    ]

    this.councilSeats = []

    seatPositions.forEach((pos, i) => {
      const radians = (pos.angle * Math.PI) / 180
      const x = tableX + Math.cos(radians) * pos.distance
      const y = tableY + Math.sin(radians) * (pos.distance * 0.45)

      const isUser = i === 0
      const isDeployed = !isUser && deployedAgentNames.length > (i - 1) && i <= 5
      const emoji = isUser ? '👤' : isDeployed ? '🤖' : AGENT_EMOJIS[pos.role] || '🤖'
      const seat = this.createSeatSprite(x, y, isUser, pos.label, emoji)

      if (!isUser) {
        this.councilSeats.push({
          id: pos.role,
          name: pos.label,
          role: pos.role,
          x,
          y,
          sprite: seat,
        })
      }
    })
  }

  private createSeatSprite(x: number, y: number, isUser: boolean, name: string, emoji = '🤖'): Phaser.GameObjects.Container {
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
      const icon = this.add.text(0, -2, emoji, {
        fontSize: '20px',
      }).setOrigin(0.5)
      container.add(icon)

      const label = this.add.text(0, 35, name.substring(0, 14), {
        fontSize: '10px',
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

  private createPromptSelector(x: number, y: number) {
    this.promptSelector = this.add.container(x, y)

    const title = this.add.text(0, -60, '🎯 What would you like the Council to discuss?', {
      fontSize: '14px',
      color: '#fbbf24',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.promptSelector.add(title)

    PRESET_PROMPTS.forEach((preset, i) => {
      const btnX = (i % 2 === 0 ? -1 : 1) * 130
      const btnY = Math.floor(i / 2) * 45 - 15

      const btn = this.createPromptButton(btnX, btnY, preset.label, () => {
        this.hidePromptSelector()
        this.runDeliberation(preset.prompt)
      })
      this.promptSelector!.add(btn)
    })
  }

  private createPromptButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const width = 240
    const height = 36

    const bg = this.add.graphics()
    bg.fillStyle(0x1e293b, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
    bg.lineStyle(1, 0x475569)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
    container.add(bg)

    const text = this.add.text(0, 0, label, {
      fontSize: '13px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
    }).setOrigin(0.5)
    container.add(text)

    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains)

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x334155, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(1, 0xfbbf24)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      this.input.setDefaultCursor('pointer')
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x1e293b, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(1, 0x475569)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      this.input.setDefaultCursor('default')
    })

    container.on('pointerdown', onClick)

    return container
  }

  private hidePromptSelector() {
    if (this.promptSelector) {
      this.tweens.add({
        targets: this.promptSelector,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.promptSelector?.setVisible(false)
        },
      })
    }
  }

  private showPromptSelector() {
    if (this.promptSelector) {
      this.promptSelector.setVisible(true)
      this.promptSelector.setAlpha(0)
      this.tweens.add({
        targets: this.promptSelector,
        alpha: 1,
        duration: 200,
      })
    }
  }

  private showSpeechBubble(seat: AgentSeat, message: CouncilMessage): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentBubble) {
        this.currentBubble.destroy()
        this.currentBubble = null
      }

      const bubbleWidth = 220
      const bubbleHeight = 80
      const bubbleX = seat.x
      const bubbleY = seat.y - 70

      const container = this.add.container(bubbleX, bubbleY)
      container.setAlpha(0)
      container.setScale(0.5)

      const bg = this.add.graphics()
      const opinionColor = OPINION_COLORS[message.opinion] || 0x64748b
      bg.fillStyle(0x1e293b, 0.95)
      bg.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10)
      bg.lineStyle(2, opinionColor)
      bg.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10)

      bg.fillStyle(0x1e293b, 0.95)
      bg.fillTriangle(0, bubbleHeight / 2, -10, bubbleHeight / 2 + 15, 10, bubbleHeight / 2)
      bg.lineStyle(2, opinionColor)
      bg.lineBetween(-10, bubbleHeight / 2 + 15, 0, bubbleHeight / 2)
      bg.lineBetween(10, bubbleHeight / 2 + 15, 0, bubbleHeight / 2)

      container.add(bg)

      const emoji = AGENT_EMOJIS[message.agentRole] || '🤖'
      const header = this.add.text(-bubbleWidth / 2 + 10, -bubbleHeight / 2 + 8, `${emoji} ${message.agentName}`, {
        fontSize: '11px',
        color: '#fbbf24',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      container.add(header)

      const badge = this.add.graphics()
      badge.fillStyle(opinionColor, 1)
      badge.fillRoundedRect(bubbleWidth / 2 - 60, -bubbleHeight / 2 + 6, 50, 16, 4)
      container.add(badge)

      const opinionText = this.add.text(bubbleWidth / 2 - 35, -bubbleHeight / 2 + 8, message.opinion, {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0)
      container.add(opinionText)

      const truncatedReason = message.reasoning.length > 70 ? message.reasoning.substring(0, 67) + '...' : message.reasoning
      const reasonText = this.add.text(0, 5, truncatedReason, {
        fontSize: '10px',
        color: '#94a3b8',
        fontFamily: 'Arial',
        wordWrap: { width: bubbleWidth - 20 },
        align: 'center',
      }).setOrigin(0.5)
      container.add(reasonText)

      this.currentBubble = container

      this.tweens.add({
        targets: container,
        alpha: 1,
        scale: 1,
        duration: 250,
        ease: 'Back.easeOut',
      })

      this.time.delayedCall(2500, () => {
        if (this.currentBubble === container) {
          this.tweens.add({
            targets: container,
            alpha: 0,
            scale: 0.8,
            duration: 200,
            onComplete: () => {
              container.destroy()
              if (this.currentBubble === container) {
                this.currentBubble = null
              }
              resolve()
            },
          })
        } else {
          resolve()
        }
      })
    })
  }

  private async runDeliberation(prompt: string) {
    if (this.isDeliberating) return
    this.isDeliberating = true

    if (this.loadingText) {
      this.loadingText.destroy()
    }

    const centerX = this.cameras.main.width / 2
    this.loadingText = this.add.text(centerX, this.cameras.main.height / 2 + 100, '🔮 Council is deliberating...', {
      fontSize: '16px',
      color: '#fbbf24',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    this.tweens.add({
      targets: this.loadingText,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    })

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      
      // Guest session key matches GuestMode.tsx
      const guestSessionData = typeof localStorage !== 'undefined' ? localStorage.getItem('agentropolis_guest_session') : null
      if (guestSessionData) {
        try {
          const session = JSON.parse(guestSessionData)
          // Use startTime as a stable session identifier for rate limiting
          headers['X-Guest-Session'] = String(session.startTime)
        } catch {
          // If parse fails, use raw value
          headers['X-Guest-Session'] = guestSessionData
        }
      }

      const agentEndpoint = typeof localStorage !== 'undefined' ? localStorage.getItem('agentEndpoint') : null

      const res = await fetch('/api/agents/council', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userPrompt: prompt,
          context: { balance: '0.1 ETH', riskLevel: 'medium' },
          deployedAgents: this.seats.map(s => ({ id: s.id, name: s.name })),
          ...(agentEndpoint && { agentEndpoint }),
        }),
      })

      const data = await res.json()

      if (!data.success || !data.deliberation) {
        throw new Error(data.error || data.message || 'Invalid council response')
      }

      this.deliberationRetries = 0

      if (this.loadingText) {
        this.loadingText.destroy()
        this.loadingText = null
      }

      const messages = data.deliberation.messages as CouncilMessage[]

      for (const message of messages) {
        const seat = this.councilSeats.find((s) => s.role === message.agentRole)
        if (seat) {
          await this.showSpeechBubble(seat, message)
          await this.delay(300)
        }
      }

      if (this.currentBubble) {
        this.currentBubble.destroy()
        this.currentBubble = null
      }

      this.showConsensus(data.deliberation)
      await this.delay(1500)
      this.displayProposal(data.proposal)
    } catch (err) {
      console.error('[CouncilScene] Deliberation failed:', err)
      
      this.deliberationRetries++
      
      if (this.loadingText) {
        if (this.deliberationRetries < MAX_DELIBERATION_RETRIES) {
          this.loadingText.setText(`❌ Deliberation failed. Retrying (${this.deliberationRetries}/${MAX_DELIBERATION_RETRIES})...`)
          this.time.delayedCall(RETRY_DELAY_MS, () => {
            this.isDeliberating = false
            this.runDeliberation(prompt)
          })
        } else {
          this.loadingText.setText('❌ Deliberation failed after multiple attempts.')
          this.time.delayedCall(3000, () => {
            if (this.loadingText) {
              this.loadingText.destroy()
              this.loadingText = null
            }
            this.deliberationRetries = 0
            this.isDeliberating = false
            this.showPromptSelector()
          })
        }
      }
      return
    }

    this.isDeliberating = false
  }

  private showConsensus(deliberation: DeliberationResult) {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    const consensusColors: Record<string, number> = {
      unanimous: 0x22c55e,
      majority: 0x3b82f6,
      contested: 0xeab308,
      vetoed: 0xef4444,
    }

    const color = consensusColors[deliberation.consensus] || 0x64748b
    const { support, oppose, abstain } = deliberation.voteTally

    const text = this.add.text(
      centerX,
      centerY - 50,
      `${deliberation.consensus.toUpperCase()}\n${support} support · ${oppose} oppose · ${abstain} abstain`,
      {
        fontSize: '20px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center',
      }
    ).setOrigin(0.5)

    text.setAlpha(0)
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 300,
    })

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 300,
        onComplete: () => text.destroy(),
      })
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve))
  }

  private displayProposal(proposal: Proposal) {
    this.currentProposal = proposal
    
    if (!this.proposalCard) return
    
    while (this.proposalCard.list.length > 1) {
      const child = this.proposalCard.list[this.proposalCard.list.length - 1]
      if (child instanceof Phaser.GameObjects.GameObject) child.destroy()
      this.proposalCard.list.pop()
    }

    this.proposalCard.setVisible(true)
    this.proposalCard.setAlpha(0)
    this.proposalCard.setScale(0.9)
    
    const riskColors: Record<string, number> = { low: 0x22c55e, medium: 0xeab308, high: 0xef4444 }
    const riskColor = riskColors[proposal.riskLevel] || 0x94a3b8
    
    const riskIndicator = this.add.graphics()
    riskIndicator.fillStyle(riskColor, 1)
    riskIndicator.fillRoundedRect(-250, -80, 6, 160, 3)
    this.proposalCard.add(riskIndicator)

    if (isTokenLaunchProposal(proposal)) {
      this.displayTokenLaunchProposal(proposal, riskColor)
    } else {
      this.displayTradeProposal(proposal, riskColor)
    }

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

  private displayTradeProposal(proposal: TradeProposalUI, riskColor: number) {
    if (!this.proposalCard) return

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

    this.addConfidenceBar(proposal.confidence, riskColor, proposal.riskLevel)
  }

  private displayTokenLaunchProposal(proposal: TokenLaunchProposalUI, riskColor: number) {
    if (!this.proposalCard) return

    const title = this.add.text(0, -55, `🚀 Token Launch Proposal`, {
      fontSize: '14px',
      color: '#f97316',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.proposalCard.add(title)
    
    const tokenText = this.add.text(0, -25, 
      `${proposal.tokenName} ($${proposal.tokenSymbol})`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.proposalCard.add(tokenText)
    
    const descText = this.add.text(0, 5, proposal.tokenDescription, {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'Arial',
      wordWrap: { width: 420 },
    }).setOrigin(0.5)
    this.proposalCard.add(descText)

    const feesText = this.add.text(0, 30, `You earn 80% of trading fees`, {
      fontSize: '11px',
      color: '#22c55e',
      fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.proposalCard.add(feesText)

    this.addConfidenceBar(proposal.confidence, riskColor, proposal.riskLevel)
  }

  private addConfidenceBar(confidence: number, riskColor: number, riskLevel: string) {
    if (!this.proposalCard) return

    const confidenceBarBg = this.add.graphics()
    confidenceBarBg.fillStyle(0x374151, 1)
    confidenceBarBg.fillRoundedRect(-100, 48, 200, 12, 6)
    this.proposalCard.add(confidenceBarBg)

    const confidenceBar = this.add.graphics()
    const barColor = confidence >= 75 ? 0x22c55e : confidence >= 50 ? 0xeab308 : 0xef4444
    confidenceBar.fillStyle(barColor, 1)
    confidenceBar.fillRoundedRect(-100, 48, (confidence / 100) * 200, 12, 6)
    this.proposalCard.add(confidenceBar)

    const confidenceLabel = this.add.text(-110, 47, `${confidence}%`, {
      fontSize: '10px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(1, 0)
    this.proposalCard.add(confidenceLabel)

    const riskLabel = this.add.text(110, 47, riskLevel.toUpperCase(), {
      fontSize: '10px',
      color: Phaser.Display.Color.IntegerToColor(riskColor).rgba,
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0, 0)
    this.proposalCard.add(riskLabel)
  }

  private handleApprove() {
    if (!this.currentProposal) return
    
    console.log('[CouncilScene] Proposal approved:', this.currentProposal.id)
    
    if (isTokenLaunchProposal(this.currentProposal)) {
      this.game.events.emit('tokenLaunchApproved', this.currentProposal)
      this.showResult('🚀 Launching token...', 0xf97316)
    } else {
      this.game.events.emit('proposalApproved', this.currentProposal)
      this.showResult('✓ Approved! Executing swap...', 0x22c55e)
    }
  }

  private handleReject() {
    if (!this.currentProposal) return

    console.log('[CouncilScene] Proposal rejected:', this.currentProposal.id)
    this.game.events.emit('proposalRejected', this.currentProposal)

    this.showResult('✗ Rejected', 0xef4444)
    this.time.delayedCall(1500, () => this.resetForNewDiscussion())
  }

  private resetForNewDiscussion() {
    this.currentProposal = null
    if (this.proposalCard) {
      this.proposalCard.setVisible(false)
    }
    this.approveBtn?.setVisible(false)
    this.rejectBtn?.setVisible(false)
    this.showPromptSelector()
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
