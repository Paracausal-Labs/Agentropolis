# Agentropolis — Game Design & Frontend Specification

**Version**: 2.0.0  
**Last Updated**: Feb 4, 2026  
**Target**: HackMoney 2026 Hackathon  
**Deadline**: Feb 8, 2026 — 10:30 PM IST

---

## Table of Contents

### Part A: Visual & Game Design
1. [Game Vision](#1-game-vision)
2. [Art Direction & Style](#2-art-direction--style)
3. [Screen Layouts & Mockups](#3-screen-layouts--mockups)
4. [Animation & Interaction Design](#4-animation--interaction-design)
5. [Asset Requirements](#5-asset-requirements)

### Part B: Technical Specification
6. [Overview](#6-overview)
7. [Tech Stack](#7-tech-stack)
8. [Architecture](#8-architecture)
9. [Game Scenes](#9-game-scenes)
10. [React Components](#10-react-components)
11. [TypeScript Interfaces](#11-typescript-interfaces)
12. [API Endpoints](#12-api-endpoints)
13. [Integration Libraries](#13-integration-libraries)
14. [Smart Contract Addresses](#14-smart-contract-addresses)
15. [User Flows](#15-user-flows)
16. [UI/UX Requirements](#16-uiux-requirements)
17. [What's Implemented vs TODO](#17-whats-implemented-vs-todo)

---

# PART A: VISUAL & GAME DESIGN

---

## 1. Game Vision

### The Elevator Pitch

**"SimCity meets DeFi."**

Imagine a neon-lit cyberpunk city where AI agents walk the streets. You deploy them like citizens. They gather in a council room around a glowing roundtable and debate your financial future. You watch them argue, then approve or reject their proposal. When you approve - real money moves on-chain.

### The Feeling We Want

- **Atmosphere**: Cyberpunk noir meets cozy city-builder
- **Mood**: Smart, sleek, slightly playful - not intimidating
- **Vibe**: "I'm commanding an AI council, and it's kinda cool"
- **Trust**: Transparency is everything - show the user what agents are thinking

### What Makes This Different

Most DeFi is spreadsheets and buttons. We make it:
1. **Visual** - See your agents walking around, see them debate
2. **Understandable** - Watch the reasoning unfold, not just the result
3. **Fun** - It's a game, not a finance app
4. **Human-in-the-loop** - User always approves before money moves

---

## 2. Art Direction & Style

### 2.1 Visual Style: "Neon Isometric"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   STYLE REFERENCE: Crossy Road meets Blade Runner               │
│                                                                 │
│   - Low-poly isometric 3D (or 2.5D sprite-based)                │
│   - Dark backgrounds (deep blue/purple gradients)               │
│   - Neon accent lights (cyan, magenta, yellow)                  │
│   - Glowing edges on buildings                                  │
│   - Soft ambient occlusion shadows                              │
│   - Subtle fog/atmosphere                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Color Palette

```
BACKGROUNDS
├── Primary:    #0a0a1a  (Deep space black-blue)
├── Secondary:  #0f172a  (Slate 950)
├── Tertiary:   #1e1e3f  (Purple-tinted dark)
└── Gradient:   #0a0a1a → #1a0a2a (subtle purple shift)

NEON ACCENTS
├── Cyan:       #00f5ff  (Primary action, highlights)
├── Magenta:    #ff00ff  (Secondary, warnings)
├── Yellow:     #ffd700  (Gold, rewards, success)
├── Green:      #00ff88  (Positive, approve, support)
└── Red:        #ff3366  (Negative, reject, danger)

BUILDING COLORS
├── Base:       #2a2a4a  (Dark purple-gray)
├── Windows:    #ffff00 (warm) or #00ffff (cool) - glowing
├── Roads:      #1a1a2a  (Slightly lighter than bg)
└── Grass:      #0a2a1a  (Dark teal-green)

UI ELEMENTS
├── Card BG:    #1a1a2a  (with 80% opacity)
├── Border:     #3a3a5a  (subtle)
├── Text:       #ffffff  (primary) / #8a8aa0 (secondary)
└── Glass:      rgba(255,255,255,0.05) with blur
```

### 2.3 Typography

```
FONTS
├── Headings:   "Space Grotesk" or "Orbitron" (techy, geometric)
├── Body:       "Inter" or "DM Sans" (clean, readable)
└── Monospace:  "JetBrains Mono" (code, addresses, numbers)

SIZES
├── Hero:       48-72px (landing page title)
├── H1:         32-40px (section headers)
├── H2:         24-28px (card titles)
├── Body:       16px (standard text)
├── Small:      14px (labels, metadata)
└── Tiny:       12px (timestamps, addresses)
```

### 2.4 The Agent Visual Identity

Agents should look like **stylized humanoid figures** - not realistic, but recognizable.

```
AGENT APPEARANCE
├── Style: Simplified 3D models or high-quality 2D sprites
├── Height: ~48-64px in isometric view
├── Silhouette: Clearly distinguishable from buildings/props
└── Movement: Smooth walking animation (8-12 frames)

AGENT TYPES (Visual Differentiation)
┌──────────────────┬────────────────────────────────────────┐
│ Alpha Hunter 🎯  │ Sharp suit, gold tie, confident pose   │
│                  │ Color: Gold/Yellow accents             │
├──────────────────┼────────────────────────────────────────┤
│ Risk Sentinel 🛡️ │ Armor-like outfit, defensive stance    │
│                  │ Color: Blue/Silver accents             │
├──────────────────┼────────────────────────────────────────┤
│ Macro Oracle 🔮  │ Flowing robes, mysterious vibe         │
│                  │ Color: Purple/Magenta accents          │
├──────────────────┼────────────────────────────────────────┤
│ Devil's Advocate │ Red suit, skeptical expression         │
│ 😈               │ Color: Red/Orange accents              │
├──────────────────┼────────────────────────────────────────┤
│ Council Clerk 📋 │ Neutral suit, holding clipboard        │
│                  │ Color: White/Gray accents              │
├──────────────────┼────────────────────────────────────────┤
│ User Avatar 👤   │ Customizable or default "you" marker   │
│                  │ Color: Cyan glow outline               │
└──────────────────┴────────────────────────────────────────┘
```

---

## 3. Screen Layouts & Mockups

### 3.1 Landing Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                         │
│                              🏙️                                         │
│                                                                         │
│              ╔═══════════════════════════════════╗                      │
│              ║      A G E N T R O P O L I S      ║ ← Glowing text       │
│              ╚═══════════════════════════════════╝   animated gradient  │
│                                                                         │
│        Build a city of agents. Approve their plans.                     │
│              Execute trades on-chain.                                   │
│                                                                         │
│        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│        │ 🚀 LAUNCH APP │  │ 👀 TRY GUEST │  │   📚 DOCS    │            │
│        └──────────────┘  └──────────────┘  └──────────────┘            │
│              ↑                   ↑                                      │
│         Primary CTA        Secondary CTA                                │
│         (Gold glow)        (Outline style)                              │
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│   │ ⚡ Yellow        │  │ 🤖 AI Agents    │  │ 🦄 Uniswap v4   │        │
│   │                 │  │                 │  │                 │        │
│   │ Instant micro-  │  │ Deploy agents   │  │ Real swaps on   │        │
│   │ actions, no gas │  │ from ERC-8004   │  │ chain with      │        │
│   │ fees            │  │ registry        │  │ full TxIDs      │        │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│         ↑                                                               │
│   Feature cards with subtle hover glow                                  │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                    Built for HackMoney 2026 🏆                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Landing Page Interactions:**
- Title has animated gradient (gold → orange → red, cycling)
- Primary CTA has pulsing glow effect
- Feature cards have hover state: lift + border glow
- Background: subtle animated particles or grid lines

### 3.2 Main App - City View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                  │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │  🏙️ Agentropolis    │ Session: ●  │ vitalik.eth │ ⚙️ │ [Connect] │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                   ↑         ↑      ↑                    │
│                              Green dot   ENS+    Settings               │
│                              if active   Avatar   Modal                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CITY VIEW (Phaser Canvas)                         AGENT PANEL          │
│  ┌─────────────────────────────────────────┐    ┌───────────────────┐   │
│  │                                         │    │  SELECT AGENT     │   │
│  │      ┌───┐                              │    │  ─────────────    │   │
│  │      │🏢│  Road  ┌───┐                  │    │                   │   │
│  │      └───┘ ══════│🏬│                   │    │  ┌─────────────┐  │   │
│  │           ║      └───┘                  │    │  │ Luna DCA    │  │   │
│  │     🤖 ───╫────────────                 │    │  │ dca │ ★ 85  │  │   │
│  │   Agent   ║     ┌─────────┐             │    │  │ [🔗] [Deploy]│  │   │
│  │  walking  ║     │ COUNCIL │ ← Click     │    │  └─────────────┘  │   │
│  │           ║     │  HALL   │   to enter  │    │                   │   │
│  │           ║     │  🏛️     │             │    │  ┌─────────────┐  │   │
│  │      ┌───┐║     └─────────┘             │    │  │ Vortex      │  │   │
│  │      │🏠│╠═════════════════             │    │  │ momentum    │  │   │
│  │      └───┘                              │    │  │ ★ 72 [Deploy]│  │   │
│  │                                         │    │  └─────────────┘  │   │
│  │   Park 🌳🌳              🤖 ← Another    │    │                   │   │
│  │                          deployed       │    │  ┌─────────────┐  │   │
│  │                          agent          │    │  │ Sentinel    │  │   │
│  └─────────────────────────────────────────┘    │  │ yield │ ★ 91│  │   │
│                                                  │  │ [Deploy]    │  │   │
│                                                  │  └─────────────┘  │   │
│                                                  │                   │   │
│                                                  │  ────────────     │   │
│                                                  │  Deployed: 2/6    │   │
│                                                  └───────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ BOTTOM BAR (optional)                                                   │
│ │ Balance: 0.95 ytest.USD │ Agents: 2 │ Proposals: 3 pending │         │
└─────────────────────────────────────────────────────────────────────────┘
```

**City View Interactions:**
- **Hover building**: Slight lift, glow outline
- **Click Council Hall**: Zoom-in transition to Council Scene
- **Agent walking**: Smooth 8-direction movement on roads
- **Deploy button**: Requires active session, charges 0.01 fee
- **Agent card hover**: Expand to show full description

### 3.3 Council Room (The Main Event)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │  🏛️ THE COUNCIL                                     [← Back]      │   │
│ └───────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ROUNDTABLE VIEW                                  │
│                                                                         │
│                  🎯 Alpha          🛡️ Risk                             │
│                    Hunter           Sentinel                            │
│                       ↖               ↗                                 │
│                         ╭─────────╮                                     │
│            🔮 Oracle ←  │ ⬡ TABLE │  → 😈 Devil                        │
│                         ╰─────────╯                                     │
│                       ↙               ↘                                 │
│                  📋 Clerk           👤 YOU                              │
│                                                                         │
│    ┌─────────────────────────────────────────────────────────────┐     │
│    │ 💬 "This swap aligns with your                              │     │
│    │     risk tolerance. I SUPPORT."                             │ ←   │
│    │                          - Alpha Hunter                     │ Speech │
│    └─────────────────────────────────────────────────────────────┘ bubble │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PROMPT INPUT                                                            │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ What would you like to do?                                          │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Type your request or use a preset...                        🎤 │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                     │ │
│ │ PRESETS:                                                            │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │ │
│ │ │💰 Passive    │ │🔄 Simple     │ │📈 High Yield │ │🚀 Launch    │ │ │
│ │ │   Income     │ │   Swap       │ │   LP         │ │   Token     │ │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │ │
│ │                                                                     │ │
│ │                                         [🚀 CONSULT COUNCIL]        │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ PROPOSAL CARD (appears after deliberation)                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │  📜 COUNCIL PROPOSAL                              Consensus: ██████ │ │
│ │  ───────────────────────────────────────────────  MAJORITY (3-1)   │ │
│ │                                                                     │ │
│ │  ACTION:  Swap 0.1 WETH → USDC                                      │ │
│ │  AMOUNT:  0.1 WETH (~$330)                                          │ │
│ │  EXPECT:  ~328 USDC (0.5% slippage)                                 │ │
│ │  RISK:    ██░░░ Medium                                              │ │
│ │                                                                     │ │
│ │  REASONING:                                                         │ │
│ │  "Based on current market conditions and your moderate risk         │ │
│ │   profile, swapping to USDC provides stability while ETH shows..."  │ │
│ │                                                                     │ │
│ │  VOTES:   🟢 Support: 3  │  🔴 Oppose: 1  │  ⚪ Abstain: 0          │ │
│ │                                                                     │ │
│ │  ┌─────────────────────┐         ┌─────────────────────┐           │ │
│ │  │   ✅ APPROVE TRADE   │         │   ❌ REJECT          │           │ │
│ │  └─────────────────────┘         └─────────────────────┘           │ │
│ │       (executes swap)                (dismiss)                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Council Room Interactions:**
- **Agents seated**: Each agent has idle animation (subtle movement)
- **Speaking agent**: Highlighted with glow, speech bubble appears
- **Opinion colors**: Support=green glow, Concern=yellow, Oppose=red
- **Deliberation flow**: Sequential, 2-3 seconds per agent
- **Preset buttons**: Click → auto-fill → can edit before submit
- **Approve button**: Pulsing green glow, triggers transaction

### 3.4 Agent Settings Modal

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ Agent Settings                                   ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BRING YOUR OWN AGENT (BYOA)                            │
│  ─────────────────────────────                          │
│                                                         │
│  Connect an external AI agent endpoint.                 │
│  Your agent will be consulted alongside the council.    │
│                                                         │
│  Endpoint URL:                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ https://my-agent.example.com/propose              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ⚠️  External agents may charge micropayments           │
│      (~$0.01 USDC per request via x402)                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Current: http://localhost:4021/propose          │    │
│  │ Status:  ● Connected                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ENS STORAGE                                            │
│  ─────────────                                          │
│  Save your endpoint to your ENS name so it persists     │
│  across sessions and devices.                           │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  💾 Save to ENS   │  │  🗑️ Clear        │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Transaction Progress States

```
IDLE STATE
┌───────────────────────────────────┐
│   ✅ APPROVE TRADE                 │
└───────────────────────────────────┘

PENDING STATE
┌───────────────────────────────────┐
│   ⏳ EXECUTING...                  │  ← Spinner animation
│   ├── Approving token...          │
│   └── Waiting for confirmation    │
└───────────────────────────────────┘

SUCCESS STATE
┌───────────────────────────────────┐
│   ✅ TRADE EXECUTED               │
│   TxID: 0x1234...5678 [View ↗]    │  ← Links to BaseScan
│   Received: 328.45 USDC           │
└───────────────────────────────────┘

ERROR STATE
┌───────────────────────────────────┐
│   ❌ TRADE FAILED                 │
│   User rejected transaction       │
│                     [Try Again]   │
└───────────────────────────────────┘
```

---

## 4. Animation & Interaction Design

### 4.1 Page Transitions

| Transition | Effect | Duration |
|------------|--------|----------|
| Landing → App | Fade + slight zoom in | 400ms |
| City → Council | Zoom into council building, fade to council scene | 600ms |
| Council → City | Zoom out, fade back to city | 500ms |
| Modal open | Fade in + scale from 0.95 | 200ms |
| Modal close | Fade out + scale to 0.95 | 150ms |

### 4.2 Agent Animations

```
WALKING (City Scene)
├── Frames: 8-12 per direction
├── Speed: 100ms per frame
├── Directions: 8 (N, NE, E, SE, S, SW, W, NW)
└── Idle: Subtle breathing/bob animation

SPEAKING (Council Scene)
├── Glow pulse: 0% → 30% → 0% opacity (1s cycle)
├── Speech bubble: Fade in + slide up (300ms)
├── Text: Typewriter effect (30ms per char)
└── Exit: Fade out (200ms)

OPINION INDICATOR
├── SUPPORT: Green pulse glow
├── CONCERN: Yellow pulse glow  
├── OPPOSE: Red pulse glow
├── NEUTRAL: No glow, gray tint
└── Duration: Hold during speech + 2s after
```

### 4.3 Button States

```
PRIMARY BUTTON (e.g., "Approve Trade")
├── Default: Solid fill, subtle shadow
├── Hover: Lift (translateY -2px) + glow
├── Active: Press down (translateY +1px) + brighter
├── Loading: Pulse animation + spinner
└── Disabled: 50% opacity, no hover effect

SECONDARY BUTTON (e.g., "Reject")
├── Default: Outline only
├── Hover: Fill with 20% bg color
├── Active: Fill with 40% bg color
└── Disabled: 30% opacity
```

### 4.4 Micro-interactions

| Element | Interaction | Effect |
|---------|-------------|--------|
| Agent card | Hover | Lift + expand description |
| Building | Hover | Glow outline |
| Proposal card | Appear | Slide up + fade in |
| Vote tally | Update | Count-up animation |
| Balance | Change | Flash yellow + number roll |
| Status dot | Active | Pulse green |
| Error toast | Appear | Slide in from top-right |

### 4.5 Sound Design (Optional but Nice)

```
SOUNDS (if implemented)
├── button_click.mp3     - Soft "tick" (100ms)
├── agent_deploy.mp3     - Sci-fi "whoosh" (300ms)
├── agent_speak.mp3      - Subtle "ping" (200ms)
├── approve.mp3          - Positive chime (400ms)
├── reject.mp3           - Low "thud" (200ms)
├── success.mp3          - Victory jingle (600ms)
└── error.mp3            - Warning tone (300ms)

All sounds should be:
- Short (under 1 second)
- Not annoying on repeat
- Disable-able in settings
```

---

## 5. Asset Requirements

### 5.1 Required Sprites/Images

```
CITY TILES (isometric, 64x32 base)
├── tile_grass.png       - Dark green/teal grass
├── tile_road.png        - Dark gray road
├── tile_road_corner.png - Road corners (4 variants)
├── tile_park.png        - Park with trees
└── tile_water.png       - (optional) decorative

BUILDINGS (isometric, ~128x96)
├── building_council.png - Main council hall (prominent)
├── building_office.png  - Generic office building
├── building_house.png   - Small house
├── building_shop.png    - Shop/store
└── building_registry.png - Agent registry building

AGENTS (sprite sheets, 48x48 per frame)
├── agent_alpha.png      - Alpha Hunter (8 dir × 8 frames)
├── agent_risk.png       - Risk Sentinel
├── agent_oracle.png     - Macro Oracle
├── agent_devil.png      - Devil's Advocate
├── agent_clerk.png      - Council Clerk
└── agent_user.png       - User avatar

UI ELEMENTS
├── icon_support.svg     - Green checkmark
├── icon_oppose.svg      - Red X
├── icon_concern.svg     - Yellow warning
├── icon_neutral.svg     - Gray circle
├── speech_bubble.svg    - 9-slice scalable
├── logo.svg             - Agentropolis logo
└── loading_spinner.svg  - Animated spinner
```

### 5.2 Placeholder Strategy

For hackathon, we can use:
- **Colored rectangles** for buildings (current implementation)
- **Emoji** for agent indicators (🤖, 🎯, 🛡️, etc.)
- **CSS-drawn** shapes for UI elements
- **Google Fonts** for typography

**Post-hackathon**: Replace with proper pixel art or 3D renders.

### 5.3 Performance Considerations

```
TARGET PERFORMANCE
├── 60 FPS on desktop
├── < 3s initial load
├── < 100ms interaction response
└── < 500KB total assets (compressed)

OPTIMIZATION STRATEGIES
├── Sprite atlases (combine small images)
├── Lazy load non-critical assets
├── Use WebP format where possible
├── Preload critical path assets
└── Code-split Phaser (only load on /app)
```

---

# PART B: TECHNICAL SPECIFICATION

---

---

## 6. Overview

### What is Agentropolis?

A **gamified DeFi trading platform** presented as an isometric city-builder. Users deploy AI agents in a living city, agents collaborate and propose trades in a Council Room, and approved proposals execute real swaps on Uniswap v4.

### Core Loop

```
1. Connect Wallet → Start Yellow Session
2. Deploy Agents from Registry → Pay off-chain fee
3. Enter Council Room → Agents deliberate
4. Review Proposal → Approve or Reject
5. Execute Trade → On-chain Uniswap v4 swap
6. End Session → On-chain settlement
```

### Sponsor Tracks

| Sponsor | Prize | Integration |
|---------|-------|-------------|
| Yellow Network | $15,000 | Session-based off-chain micro-actions |
| Uniswap Foundation | $10,000 | Agent-driven swaps via v4 |
| ENS | $5,000 | Identity + config storage in text records |

### New Features (Recently Added)

| Feature | Description |
|---------|-------------|
| **ERC-8004** | On-chain agent discovery from Base Sepolia registry |
| **x402** | Micropayments for external agent endpoints |
| **BYOA** | Bring Your Own Agent - configure external endpoint |
| **Reputation** | Display agent reputation scores (0-100) |
| **8004scan** | Links to view agents on block explorer |

---

## 7. Tech Stack

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── Phaser 3 (isometric game engine)
├── Tailwind CSS
├── wagmi / viem (Web3)
└── TanStack Query (data fetching)

Backend:
├── Next.js API Routes
├── Groq LLM (llama-3.3-70b-versatile)
└── External agent support (x402)

Blockchain:
├── Base Sepolia (primary chain)
├── Ethereum Sepolia (ENS)
└── Uniswap v4 Universal Router
```

---

## 8. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENTROPOLIS                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + Phaser)                                │
│  ├── CityScene: Isometric city with deployable agents       │
│  ├── CouncilScene: Roundtable deliberation UI               │
│  ├── AgentSettings: BYOA endpoint configuration modal       │
│  └── Components: WalletProvider, SessionProvider, etc.      │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                 │
│  ├── /api/agents/list: ERC-8004 registry + reputation       │
│  ├── /api/agents/council: Multi-agent deliberation + BYOA   │
│  ├── /api/agents/propose: Single-agent proposal             │
│  └── /api/agents/launch-token: Token launch via Clanker     │
├─────────────────────────────────────────────────────────────┤
│  Integration Libraries                                      │
│  ├── Yellow: Session lifecycle, off-chain micro-actions     │
│  ├── Uniswap v4: Swaps + LP via Universal Router            │
│  ├── Clanker: Token launches with v4 hooks                  │
│  ├── ERC-8004: Agent discovery + reputation from registry   │
│  ├── x402: HTTP micropayments for external agents           │
│  └── ENS: Name resolution, avatar, BYOA config storage      │
└─────────────────────────────────────────────────────────────┘
```

### Phaser ↔ React Communication

```typescript
// React → Phaser
game.events.emit('eventName', data)
scene.start('SceneName', data)

// Phaser → React (via global API)
window.agentropolis = {
  chargeAgentDeploy: () => Promise<{ success, error? }>,
  getBalance: () => bigint,
  isSessionActive: () => boolean,
}

// Phaser → React (via events)
game.events.on('proposalApproved', (proposal) => { ... })
game.events.on('openCouncil', () => { ... })
```

---

## 9. Game Scenes

### 9.1 CityScene (`apps/web/components/game/scenes/CityScene.ts`)

**Purpose**: Main isometric city view where users deploy agents.

**Layout**:
```
12x12 grid with:
- Grass tiles (0)
- Road tiles (1)
- Building tiles (2)
- Park tiles (3)
- Council building (4) - center 2x2
```

**Key Features**:
- Isometric tile rendering (64x32 pixels)
- Agent deployment panel (right side)
- Agent sprites walk on road tiles
- Click council building → transition to CouncilScene
- Agents persist to localStorage

**Agent Panel**:
```
┌─────────────────────────────┐
│      Select Agent           │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Luna DCA                │ │
│ │ dca | ★ 85         [🔗] │ │
│ │                [Deploy] │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Vortex Momentum         │ │
│ │ momentum | ★ 72    [🔗] │ │
│ │                [Deploy] │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Agent Positions** (max 6 agents):
```typescript
const AGENT_POSITIONS = [
  { x: 3, y: 3 }, { x: 8, y: 3 },
  { x: 3, y: 8 }, { x: 8, y: 8 },
  { x: 2, y: 5 }, { x: 9, y: 5 },
]
```

### 9.2 CouncilScene (`apps/web/components/game/scenes/CouncilScene.ts`)

**Purpose**: Roundtable deliberation where AI agents debate proposals.

**Layout**:
```
┌─────────────────────────────────────────────┐
│              THE COUNCIL                     │
├─────────────────────────────────────────────┤
│                                             │
│     🎯 Alpha    🛡️ Risk    🔮 Macro         │
│           ╭─────────────╮                   │
│           │  ROUNDTABLE │                   │
│           ╰─────────────╯                   │
│     😈 Devil    📋 Clerk    👤 You          │
│                                             │
├─────────────────────────────────────────────┤
│  [💰 Passive Income] [🔄 Swap] [📈 LP]      │
│  [🚀 Launch Token]   [Custom prompt...]     │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ PROPOSAL: Swap 0.1 WETH → USDC      │   │
│  │ Confidence: 85% | Risk: Medium      │   │
│  │ Reasoning: Based on your...         │   │
│  │                                     │   │
│  │ [✅ APPROVE]        [❌ REJECT]     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Council Agents** (5 AI personas):
| Agent | Role | Emoji | Behavior |
|-------|------|-------|----------|
| Alpha Hunter | Seeks yield | 🎯 | Optimistic, supports high APY |
| Risk Sentinel | Identifies risks | 🛡️ | Conservative, can VETO |
| Macro Oracle | Market context | 🔮 | Neutral, provides sentiment |
| Devil's Advocate | Challenges | 😈 | Skeptical, worst-case |
| Council Clerk | Synthesizes | 📋 | Creates final proposal |

**Deliberation Flow**:
1. User enters prompt (preset or custom)
2. Each agent speaks in sequence with speech bubbles
3. Opinions animate: SUPPORT (green), CONCERN (yellow), OPPOSE (red), NEUTRAL (gray)
4. Clerk synthesizes into final proposal
5. Consensus calculated: unanimous | majority | contested | vetoed
6. Proposal card shown with Approve/Reject buttons

**Preset Prompts**:
```typescript
const PRESET_PROMPTS = [
  { label: '💰 Passive Income', prompt: 'I want passive income from my 0.1 ETH' },
  { label: '🔄 Simple Swap', prompt: 'Swap 0.05 ETH to USDC' },
  { label: '📈 High Yield LP', prompt: 'Provide liquidity for maximum yield' },
  { label: '🚀 Launch Token', prompt: 'Launch a memecoin for the lobster community' },
]
```

---

## 10. React Components

### 10.1 Core Components

| Component | File | Purpose |
|-----------|------|---------|
| `WalletProvider` | `components/WalletProvider.tsx` | wagmi/viem setup |
| `SessionProvider` | `components/SessionProvider.tsx` | Yellow session management |
| `ConnectButton` | `components/ConnectButton.tsx` | Wallet connection UI |
| `UserIdentity` | `components/UserIdentity.tsx` | ENS name/avatar display |
| `AgentSettings` | `components/AgentSettings.tsx` | BYOA endpoint config modal |
| `SwapHandler` | `components/SwapHandler.tsx` | Listens for Phaser events, executes swaps |
| `GuestMode` | `components/GuestMode.tsx` | Demo mode indicator |

### 10.2 AppPageContent (`components/AppPageContent.tsx`)

Main app layout with header:
```tsx
<header className="...">
  <h1>Agentropolis</h1>
  <div className="flex items-center gap-4">
    <SessionStatus />      {/* Yellow session indicator */}
    <UserIdentity />       {/* ENS name/avatar */}
    <AgentSettingsButton /> {/* ⚙️ gear icon */}
    <ConnectButton />      {/* Connect wallet */}
  </div>
</header>
<PhaserGame />             {/* Game canvas */}
<SwapHandler />            {/* Hidden - listens for events */}
```

### 10.3 AgentSettings Modal

**Trigger**: Gear icon (⚙️) in header (only when wallet connected)

**Modal Contents**:
```
┌─────────────────────────────────────┐
│ Agent Settings                   ✕  │
├─────────────────────────────────────┤
│ External Agent Endpoint             │
│ ┌─────────────────────────────────┐ │
│ │ https://your-agent.example.com  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ External agents may charge a fee │
│    (~$0.01 USDC per proposal)       │
│                                     │
│ Current: http://localhost:4021/...  │
│                                     │
│ [Save to ENS]           [Clear]     │
└─────────────────────────────────────┘
```

**ENS Text Record**: `com.agentropolis.endpoint`

---

## 11. TypeScript Interfaces

### 11.1 Agent Profiles

```typescript
interface AgentProfile {
  agentId: number
  name: string
  description: string
  image: string
  strategy: 'momentum' | 'dca' | 'arbitrage' | 'yield'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  services: { name: string; endpoint: string; version: string }[]
  // ERC-8004 additions
  reputation?: number           // 0-100 scale
  registrySource?: 'erc8004' | 'mock'
  serviceEndpoint?: string      // External agent URL
}
```

### 11.2 Trade Proposals

```typescript
interface TradeProposal {
  id: string
  agentId: string
  agentName: string
  pair: {
    tokenIn: { symbol: string; address: string }
    tokenOut: { symbol: string; address: string }
  }
  action: 'swap' | 'rebalance' | 'dca'
  strategyType?: 'swap' | 'dca' | 'lp_full_range' | 'lp_concentrated' | 'token_launch'
  amountIn: string
  expectedAmountOut: string
  maxSlippage: number           // basis points (50 = 0.5%)
  deadline: number              // timestamp
  reasoning: string
  confidence: number            // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  tickLower?: number            // LP only
  tickUpper?: number            // LP only
  deliberation?: DeliberationResult
}
```

### 11.3 Token Launch Proposals

```typescript
interface TokenLaunchProposal {
  id: string
  agentId: string
  agentName: string
  action: 'token_launch'
  strategyType: 'token_launch'
  tokenName: string
  tokenSymbol: string
  tokenDescription: string
  tokenImage?: string
  pairedToken: string           // e.g., 'WETH'
  rewardRecipient: string       // wallet address
  rewardBps: number             // fee share (8000 = 80%)
  vaultPercentage?: number      // locked %
  lockupDays?: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  deliberation?: DeliberationResult
}
```

### 11.4 Deliberation

```typescript
type AgentRole = 'alpha' | 'risk' | 'macro' | 'devil' | 'clerk'

interface CouncilMessage {
  agentId: string
  agentName: string
  agentRole: AgentRole
  opinion: 'SUPPORT' | 'CONCERN' | 'OPPOSE' | 'NEUTRAL'
  reasoning: string
  confidence: number            // 0-100
  timestamp: number
}

interface DeliberationResult {
  messages: CouncilMessage[]
  consensus: 'unanimous' | 'majority' | 'contested' | 'vetoed'
  voteTally: { support: number; oppose: number; abstain: number }
  rounds: number
}
```

### 11.5 External Agent Protocol (BYOA)

```typescript
// Request sent TO external agent
interface ExternalAgentRequest {
  prompt: string
  context: {
    balance?: string
    riskLevel?: 'low' | 'medium' | 'high'
    preferredTokens?: string[]
  }
  requestId: string
}

// Response FROM external agent
interface ExternalAgentResponse {
  success: boolean
  proposal?: TradeProposal | TokenLaunchProposal
  error?: string
  processingTime?: number
  paymentTxHash?: string        // x402 payment if applicable
}
```

### 11.6 Yellow Session

```typescript
interface YellowSession {
  sessionId: string
  userAddress: string
  balance: string
  isActive: boolean
  createdAt: number
  expiresAt: number
}

type ChannelStatus = 
  | 'disconnected'
  | 'approving'
  | 'depositing'
  | 'connecting'
  | 'creating'
  | 'active'
  | 'closing'
  | 'settled'
  | 'error'
```

---

## 12. API Endpoints

### 12.1 GET `/api/agents/list`

**Purpose**: Fetch available agents from ERC-8004 registry

**Response**:
```json
[
  {
    "agentId": 0,
    "name": "Luna DCA",
    "description": "Dollar-cost averaging specialist",
    "strategy": "dca",
    "riskTolerance": "conservative",
    "reputation": 85,
    "registrySource": "mock"
  }
]
```

### 12.2 POST `/api/agents/council`

**Purpose**: Run multi-agent deliberation

**Request**:
```json
{
  "userPrompt": "swap 0.1 ETH to USDC",
  "context": {
    "balance": "1 ETH",
    "riskLevel": "medium",
    "preferredTokens": ["USDC", "WETH"]
  },
  "deployedAgents": [{ "id": "0", "name": "Luna DCA" }],
  "agentEndpoint": "http://localhost:4021/propose"  // Optional BYOA
}
```

**Response**:
```json
{
  "success": true,
  "deliberation": {
    "messages": [...],
    "consensus": "majority",
    "voteTally": { "support": 3, "oppose": 1, "abstain": 0 }
  },
  "proposal": {
    "id": "council-1234",
    "pair": { "tokenIn": {...}, "tokenOut": {...} },
    "amountIn": "0.1",
    "expectedAmountOut": "330",
    ...
  }
}
```

### 12.3 POST `/api/agents/launch-token`

**Purpose**: Launch a token via Clanker

**Request**:
```json
{
  "tokenName": "Lobster Coin",
  "tokenSymbol": "LOBSTR",
  "tokenDescription": "The clawsome token",
  "rewardRecipient": "0x...",
  "rewardBps": 8000
}
```

---

## 13. Integration Libraries

### 13.1 Yellow Network (`lib/yellow/`)

**Files**: `channel.tsx`, `client.ts`, `constants.ts`

**Usage**:
```typescript
// Start session
const { deposit, createChannel, state } = useYellowChannel()
await deposit(parseUnits('1', 6))  // 1 ytest.USD
await createChannel()

// Off-chain transfer (e.g., deploy agent)
await executeOffChainTransfer(recipient, amount)

// End session
await closeChannel()  // Settles on-chain
```

**Key Constants**:
```typescript
YELLOW_DEFAULTS = {
  DEPOSIT_AMOUNT: parseUnits('1', 6),  // 1 ytest.USD
  AGENT_DEPLOY_FEE: parseUnits('0.01', 6),  // 0.01 ytest.USD
}
```

### 13.2 Uniswap v4 (`lib/uniswap/`)

**Files**: `executor.ts`, `lp-executor.ts`, `strategy-router.ts`, `constants.ts`

**Execution Flow**:
```typescript
const { executeSwap } = useSwapExecutor()
const result = await executeSwap(proposal)
// Returns: { success, txHash, error? }
```

**V4 Commands**:
```typescript
V4_SWAP_COMMAND = 0x10
V4_ACTIONS = {
  SWAP_EXACT_IN_SINGLE: 0x06,
  SETTLE_ALL: 0x0c,
  TAKE_ALL: 0x0f,
}
```

### 13.3 ENS (`lib/ens/`)

**Files**: `textRecords.ts`

**Text Record Keys**:
```typescript
TEXT_RECORD_KEYS = {
  RISK: 'com.agentropolis.risk',
  STRATEGY: 'com.agentropolis.strategy',
  TOKENS: 'com.agentropolis.tokens',
  ENDPOINT: 'com.agentropolis.endpoint',
}
```

**Usage**:
```typescript
// Read
const { config } = useAgentConfig(ensName)

// Write
await writeAgentConfig(ensName, { agentEndpoint: url }, walletClient)
```

### 13.4 ERC-8004 (`lib/erc8004/`)

**Files**: `client.ts`, `mocks.ts`

**Registry Addresses** (Base Sepolia):
```typescript
IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713'
```

**Usage**:
```typescript
const agents = await getAgents({ mockMode: false })
const url = get8004ScanUrl(agentId)  // -> 8004scan.io link
```

### 13.5 x402 (`lib/x402/`)

**Files**: `client.ts`, `index.ts`

**Usage**:
```typescript
const { x402Fetch, isReady } = useX402Fetch()

// Automatically handles 402 Payment Required
const response = await x402Fetch(endpoint, { method: 'POST', body: ... })
```

### 13.6 Clanker (`lib/clanker/`)

**Files**: `client.ts`, `constants.ts`

**Factory Address**: `0xE85A59c628F7d27878ACeB4bf3b35733630083a9`

---

## 14. Smart Contract Addresses

### Base Sepolia (Chain ID: 84532)

| Contract | Address |
|----------|---------|
| Universal Router | `0x492E6456D9528771018DeB9E87ef7750EF184104` |
| Pool Manager | `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` |
| Position Manager | `0xABD2e846ea3927eA90e5e4Caa2A0fFd0CcbF60f8` |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| WETH | `0x4200000000000000000000000000000000000006` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| ERC-8004 Identity | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ERC-8004 Reputation | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |
| Clanker Factory | `0xE85A59c628F7d27878ACeB4bf3b35733630083a9` |

### Ethereum Sepolia (Chain ID: 11155111)

| Contract | Address |
|----------|---------|
| ENS Public Resolver | `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5` |

---

## 15. User Flows

### 15.1 Complete Demo Flow

```
1. Landing Page (/)
   └── Click "Launch App"

2. App Page (/app)
   ├── City loads with isometric view
   └── Header shows: [SessionStatus] [UserIdentity] [⚙️] [Connect]

3. Connect Wallet
   ├── MetaMask popup
   ├── Select account
   └── ENS name/avatar loads (if available)

4. Start Yellow Session
   ├── Click "Start Session"
   ├── Approve ytest.USD allowance
   ├── Deposit (e.g., 1 ytest.USD)
   └── Channel created → balance shown

5. Configure BYOA (Optional)
   ├── Click ⚙️ gear icon
   ├── Enter endpoint URL
   ├── Save to ENS (requires Sepolia switch)
   └── Close modal

6. Deploy Agent
   ├── Click registry building
   ├── Panel opens with agents (+ reputation)
   ├── Click "Deploy" on agent
   ├── Off-chain fee charged (0.01)
   └── Agent appears in city, starts walking

7. Enter Council
   ├── Click council building (center)
   └── Transition to CouncilScene

8. Deliberation
   ├── Select preset or type custom prompt
   ├── Watch agents debate (speech bubbles)
   ├── See opinions: SUPPORT/CONCERN/OPPOSE
   ├── Clerk synthesizes proposal
   └── Consensus shown

9. Review Proposal
   ├── Proposal card appears
   ├── Shows: pair, amount, reasoning, confidence, risk
   └── Approve or Reject buttons

10. Execute Trade
    ├── Click "Approve"
    ├── Token approval tx (if needed)
    ├── Swap tx via Universal Router
    ├── TxID displayed
    └── Click TxID → BaseScan

11. End Session
    ├── Click "End Session"
    ├── Settlement tx on-chain
    └── Final balance shown
```

### 15.2 BYOA Flow

```
1. External agent server running (e.g., localhost:4021)
2. User configures endpoint in AgentSettings modal
3. Endpoint saved to ENS text record
4. User enters council and submits prompt
5. Council API calls external endpoint with x402 payment
6. External agent returns proposal
7. Proposal displayed (or fallback to Groq if failed)
```

---

## 16. UI/UX Requirements

### 16.1 Design System

**Colors**:
```css
--bg-primary: #0f172a (gray-950)
--bg-secondary: #1e293b (gray-800)
--bg-card: #334155 (gray-700)
--text-primary: #ffffff
--text-secondary: #94a3b8 (gray-400)
--accent-blue: #3b82f6
--accent-yellow: #fbbf24
--accent-green: #22c55e
--accent-red: #ef4444
```

**Opinion Colors**:
```css
SUPPORT: #22c55e (green)
CONCERN: #eab308 (yellow)
OPPOSE: #ef4444 (red)
NEUTRAL: #64748b (gray)
```

### 16.2 Responsive Requirements

- **Desktop**: Full isometric city (1200px+)
- **Tablet**: Scaled city, stacked panels (768-1199px)
- **Mobile**: Simplified list view (not required for hackathon)

### 16.3 Loading States

- Agent panel: "Loading agents..."
- Deliberation: Animated thinking dots
- Transaction: "Executing..." with spinner
- Settlement: "Settling..." with progress

### 16.4 Error States

- Network error: Red toast with retry button
- Transaction failed: Error message with TxID link
- External agent failed: "Falling back to Groq..."

---

## 17. What's Implemented vs TODO

### ✅ Implemented

| Feature | Status | Files |
|---------|--------|-------|
| CityScene with isometric tiles | ✅ Done | `CityScene.ts` |
| Agent deployment | ✅ Done | `CityScene.ts` |
| Agent walking animation | ✅ Done | `CityScene.ts` |
| CouncilScene roundtable | ✅ Done | `CouncilScene.ts` |
| Multi-agent deliberation | ✅ Done | `council.ts` |
| Speech bubble animations | ✅ Done | `CouncilScene.ts` |
| Proposal card UI | ✅ Done | `CouncilScene.ts` |
| Uniswap v4 swaps | ✅ Done | `executor.ts` |
| Yellow session mock | ✅ Done | `channel.tsx` |
| ENS name/avatar | ✅ Done | `UserIdentity.tsx` |
| ENS text records | ✅ Done | `textRecords.ts` |
| ERC-8004 registry query | ✅ Done | `client.ts` |
| Reputation display | ✅ Done | `CityScene.ts` |
| 8004scan links | ✅ Done | `CityScene.ts` |
| Agent settings modal | ✅ Done | `AgentSettings.tsx` |
| x402 client | ✅ Done | `x402/client.ts` |
| External agent support | ✅ Done | `council.ts` |
| Demo x402 server | ✅ Done | `demo-x402-server.ts` |
| Token launch flow | ✅ Done | `council.ts`, Clanker |
| Docs page | ✅ Done | `/docs/page.tsx` |

### ⚠️ Needs Testing / Polish

| Feature | Status | Notes |
|---------|--------|-------|
| Yellow real integration | ⚠️ Mock only | Real Nitrolite needs testing |
| ERC-8004 real registry | ⚠️ Fallback | Registry may be empty |
| x402 real payments | ⚠️ Mock mode | Needs USDC on Base Sepolia |
| LP execution | ⚠️ Untested | Position manager integration |

### ❌ Not Implemented (Optional)

| Feature | Priority | Notes |
|---------|----------|-------|
| NPC civilians | Low | Cosmetic only |
| Cosmetic shop | Low | Credits system |
| Multiple council rounds | Low | Currently 1 round |
| Mobile responsive | Low | Desktop focus for hackathon |
| Sound effects | Low | Optional polish |

---

## Quick Reference: Key File Locations

```
apps/web/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── app/page.tsx                # Main app (loads PhaserGame)
│   ├── docs/page.tsx               # Documentation
│   └── api/agents/
│       ├── list/route.ts           # GET agents
│       ├── council/route.ts        # POST deliberation
│       └── launch-token/route.ts   # POST token launch
├── components/
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── CityScene.ts        # Main city view
│   │   │   └── CouncilScene.ts     # Deliberation room
│   │   ├── GameComponent.tsx       # React-Phaser bridge
│   │   └── PhaserGame.tsx          # Dynamic import wrapper
│   ├── AgentSettings.tsx           # BYOA config modal
│   ├── UserIdentity.tsx            # ENS display
│   ├── SessionProvider.tsx         # Yellow session
│   └── SwapHandler.tsx             # Trade execution listener
├── lib/
│   ├── agents/council.ts           # Multi-agent orchestration
│   ├── uniswap/executor.ts         # V4 swap execution
│   ├── yellow/channel.tsx          # Session management
│   ├── ens/textRecords.ts          # ENS read/write
│   ├── erc8004/client.ts           # Registry query
│   └── x402/client.ts              # Micropayment client
└── scripts/
    ├── demo-x402-server.ts         # Demo external agent
    └── test-x402-erc8004.ts        # E2E tests
```

---

## Commands for Development

```bash
# Install dependencies
bun install

# Build shared package
cd packages/shared && bun run build && cd ../..

# Start dev server
cd apps/web && PORT=3002 bun run dev

# Start demo x402 agent
cd apps/web && bun run demo:agent

# Run tests
cd apps/web && bun run test:e2e

# Type check
cd apps/web && bun run type-check

# Production build
cd apps/web && bun run build
```

---

## 18. Quick Start for Frontend Devs

### TL;DR - What Needs Visual Work

The **functionality is done**. What needs work is making it **look amazing**.

### Priority 1: Make It Pretty (HIGH IMPACT)

| Task | Current State | Target State |
|------|---------------|--------------|
| **City tiles** | Colored rectangles | Isometric pixel art tiles |
| **Buildings** | Boxes with emoji | Stylized cyberpunk buildings |
| **Agent sprites** | Emoji markers (🤖) | Animated walking characters |
| **Council room** | Basic HTML layout | Dramatic roundtable with lighting |
| **Speech bubbles** | Plain white boxes | Stylized comic-style bubbles |

### Priority 2: Polish (MEDIUM IMPACT)

| Task | Current State | Target State |
|------|---------------|--------------|
| **Transitions** | Instant scene switch | Smooth fade/zoom transitions |
| **Button hover** | Basic CSS | Glow + lift effects |
| **Agent opinions** | Text color | Particle effects + glow aura |
| **Loading states** | Plain text | Animated skeletons/spinners |
| **Background** | Solid dark | Animated stars/grid |

### Priority 3: Nice-to-Have (LOW IMPACT for hackathon)

| Task | Notes |
|------|-------|
| NPC civilians | Walk around city, purely cosmetic |
| Sound effects | Clicks, approvals, errors |
| Mobile layout | Desktop-first for hackathon |
| Dark/light mode | Dark only for hackathon |

### Files to Focus On

```
PHASER GAME (visuals)
├── apps/web/components/game/scenes/CityScene.ts    ← City rendering
├── apps/web/components/game/scenes/CouncilScene.ts ← Council rendering
└── apps/web/public/assets/                         ← Put sprites here

REACT UI (panels, modals, buttons)
├── apps/web/components/AppPageContent.tsx          ← Main layout
├── apps/web/components/AgentSettings.tsx           ← Settings modal
├── apps/web/app/page.tsx                           ← Landing page
└── apps/web/app/docs/page.tsx                      ← Docs page

STYLES
└── apps/web/app/globals.css                        ← Global CSS
└── Tailwind config in tailwind.config.ts
```

### How to Run

```bash
# Install
bun install
cd packages/shared && bun run build && cd ../..

# Dev server
cd apps/web && PORT=3002 bun run dev

# Open http://localhost:3002
```

### Key Visual References

**City Style Inspiration:**
- Crossy Road (low-poly isometric)
- Monument Valley (clean geometric)
- Blade Runner (neon noir)

**UI Style Inspiration:**
- Linear.app (clean, dark, minimal)
- Figma (floating panels)
- Discord (dark theme)

**Council Room Inspiration:**
- Knights of the Round Table
- Star Wars Jedi Council
- UN Security Council (circular seating)

---

## 19. Visual Reference: Screen States

### Landing Page States

```
STATE: Initial Load
┌─────────────────────────────────┐
│  [Skeleton loading animation]   │
│  Logo fades in first            │
│  Then title, then buttons       │
└─────────────────────────────────┘

STATE: Loaded (idle)
┌─────────────────────────────────┐
│  Logo has subtle float/glow     │
│  Title gradient slowly animates │
│  Feature cards have idle shine  │
└─────────────────────────────────┘

STATE: Hover on CTA
┌─────────────────────────────────┐
│  Button lifts up (translateY)   │
│  Glow intensifies               │
│  Cursor: pointer                │
└─────────────────────────────────┘
```

### City View States

```
STATE: No Wallet Connected
┌─────────────────────────────────┐
│  City visible but muted         │
│  "Connect Wallet" prompt        │
│  Agent panel disabled (grayed)  │
└─────────────────────────────────┘

STATE: Wallet Connected, No Session
┌─────────────────────────────────┐
│  City bright                    │
│  "Start Session" prompt         │
│  Deploy buttons say "Session    │
│  Required"                      │
└─────────────────────────────────┘

STATE: Session Active
┌─────────────────────────────────┐
│  Full color city                │
│  Green dot in header            │
│  Deploy buttons enabled         │
│  Balance shown                  │
└─────────────────────────────────┘

STATE: Agent Deployed
┌─────────────────────────────────┐
│  Agent appears at position      │
│  Spawn animation (fade in +     │
│    scale from 0 → 1)            │
│  Agent starts walking pattern   │
│  Counter updates: "1/6"         │
└─────────────────────────────────┘
```

### Council Room States

```
STATE: Idle (waiting for input)
┌─────────────────────────────────┐
│  Agents seated, subtle idle     │
│  animation (breathing)          │
│  Prompt input focused           │
│  Presets visible                │
└─────────────────────────────────┘

STATE: Deliberating
┌─────────────────────────────────┐
│  Current speaker highlighted    │
│  Speech bubble appears          │
│  Text types out                 │
│  Other agents slightly dimmed   │
│  Progress: "Agent 2/5 speaking" │
└─────────────────────────────────┘

STATE: Proposal Ready
┌─────────────────────────────────┐
│  All agents back to idle        │
│  Proposal card slides up        │
│  Approve button pulses          │
│  Consensus indicator shows      │
└─────────────────────────────────┘

STATE: Executing Trade
┌─────────────────────────────────┐
│  Approve button → spinner       │
│  Progress steps shown:          │
│    ✓ Approving token...         │
│    ⏳ Executing swap...          │
│  City/council slightly blurred  │
└─────────────────────────────────┘

STATE: Trade Complete
┌─────────────────────────────────┐
│  Success animation (confetti?)  │
│  TxID displayed with link       │
│  "View on BaseScan" button      │
│  Option to "New Proposal"       │
└─────────────────────────────────┘
```

---

## 20. Component Styling Guide

### Button Variants

```css
/* Primary Button (Approve, Launch, Connect) */
.btn-primary {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  color: #000;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
}

/* Secondary Button (Reject, Cancel) */
.btn-secondary {
  background: transparent;
  border: 1px solid #3a3a5a;
  color: #8a8aa0;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #5a5a7a;
  color: #fff;
}

/* Danger Button (only for destructive actions) */
.btn-danger {
  background: linear-gradient(135deg, #ff3366 0%, #ff0044 100%);
  box-shadow: 0 4px 20px rgba(255, 51, 102, 0.3);
}
```

### Card Styles

```css
/* Agent Card */
.card-agent {
  background: rgba(26, 26, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid #3a3a5a;
  border-radius: 12px;
  transition: all 0.2s ease;
}
.card-agent:hover {
  transform: translateY(-4px);
  border-color: #00f5ff;
  box-shadow: 0 8px 30px rgba(0, 245, 255, 0.2);
}

/* Proposal Card */
.card-proposal {
  background: linear-gradient(180deg, #1a1a2a 0%, #0a0a1a 100%);
  border: 2px solid #3a3a5a;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
```

### Opinion Indicators

```css
/* Support */
.opinion-support {
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  animation: pulse-green 2s ease-in-out infinite;
}

/* Concern */
.opinion-concern {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: pulse-yellow 2s ease-in-out infinite;
}

/* Oppose */
.opinion-oppose {
  color: #ff3366;
  text-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
  animation: pulse-red 2s ease-in-out infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Glass Morphism (for panels)

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

---

## 21. Checklist for Frontend Dev

### Before Submission (Feb 8)

- [ ] City tiles render correctly (even if basic)
- [ ] Agents appear when deployed
- [ ] Council building is clickable
- [ ] Council scene shows all 5 agents
- [ ] Speech bubbles appear during deliberation
- [ ] Proposal card is readable
- [ ] Approve/Reject buttons work
- [ ] Transaction states (loading, success, error) are clear
- [ ] ENS name shows in header
- [ ] Session status indicator works
- [ ] Settings modal opens/closes
- [ ] Landing page looks professional
- [ ] Docs page is readable

### Nice to Have (if time)

- [ ] Smooth page transitions
- [ ] Agent walking animations
- [ ] Glow effects on hover
- [ ] Loading skeletons
- [ ] Confetti on success
- [ ] Sound effects

### Don't Worry About (for hackathon)

- [ ] Mobile responsive
- [ ] Accessibility (a11y)
- [ ] i18n / localization
- [ ] Dark/light theme toggle
- [ ] Performance optimization
- [ ] Unit tests for UI

---

*Document generated for HackMoney 2026 submission.*
*Last updated: Feb 4, 2026*
