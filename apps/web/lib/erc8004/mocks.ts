import type { AgentProfile } from '@agentropolis/shared'

export const MOCK_AGENTS: AgentProfile[] = [
  {
    agentId: 0,
    name: 'Luna DCA',
    description: 'Dollar-cost averaging specialist. Executes consistent weekly purchases to reduce volatility impact.',
    image: 'https://images.unsplash.com/photo-1579546929662-711aa33e6b14?w=200&h=200&fit=crop',
    strategy: 'dca',
    riskTolerance: 'conservative',
    services: [
      {
        name: 'dca-executor',
        endpoint: 'https://api.agentropolis.local/dca',
        version: '1.0.0',
      },
    ],
  },
  {
    agentId: 1,
    name: 'Vortex Momentum',
    description: 'Momentum trader riding market trends. Identifies breakouts and executes swing trades with technical analysis.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    strategy: 'momentum',
    riskTolerance: 'aggressive',
    services: [
      {
        name: 'momentum-analyzer',
        endpoint: 'https://api.agentropolis.local/momentum',
        version: '1.0.0',
      },
    ],
  },
  {
    agentId: 2,
    name: 'Arbitrage Alpha',
    description: 'Cross-exchange arbitrage hunter. Exploits price discrepancies between DEXs for risk-free profits.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop',
    strategy: 'arbitrage',
    riskTolerance: 'moderate',
    services: [
      {
        name: 'arbitrage-detector',
        endpoint: 'https://api.agentropolis.local/arb',
        version: '1.0.0',
      },
    ],
  },
]

export function getMockAgents(): AgentProfile[] {
  console.log('[ERC-8004] Using mock agents')
  return MOCK_AGENTS
}
