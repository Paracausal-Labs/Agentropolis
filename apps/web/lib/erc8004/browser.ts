export const IDENTITY_REGISTRY_ADDRESS = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const

export const REGISTER_ABI = [
  {
    inputs: [{ name: 'metadataURI', type: 'string' }],
    name: 'register',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export function addUserAgentTokenId(tokenId: number) {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem('agentropolis_user_agent_ids')
  const ids: number[] = stored ? JSON.parse(stored) : []
  if (!ids.includes(tokenId)) {
    ids.push(tokenId)
    localStorage.setItem('agentropolis_user_agent_ids', JSON.stringify(ids))
  }
}

export function getUserAgentTokenIds(): number[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('agentropolis_user_agent_ids')
  return stored ? JSON.parse(stored) : []
}

