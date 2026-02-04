'use client'

import type { TokenLaunchProposal, TokenLaunchResult } from '@agentropolis/shared'
import type { WalletClient, PublicClient } from 'viem'
import { CLANKER_URLS } from './constants'

const mockEnabled = process.env.NEXT_PUBLIC_CLANKER_MOCK === 'true'

function generateMockAddress(): string {
  const chars = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)]
  }
  return addr
}

function generateMockTxHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

function mockLaunch(proposal: TokenLaunchProposal): TokenLaunchResult {
  const tokenAddress = generateMockAddress()
  return {
    success: true,
    txHash: generateMockTxHash(),
    tokenAddress,
    clankerUrl: `${CLANKER_URLS.CLANKER_WORLD}/${tokenAddress}`,
  }
}

export async function launchToken(
  proposal: TokenLaunchProposal,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<TokenLaunchResult> {
  if (mockEnabled) {
    console.log('[Clanker] Mock mode - simulating token launch')
    await new Promise(resolve => setTimeout(resolve, 2000))
    return mockLaunch(proposal)
  }

  if (!walletClient.account?.address) {
    return { success: false, error: 'Wallet not connected' }
  }

  try {
    const { Clanker } = await import('clanker-sdk/v4')
    
    const clanker = new Clanker({ publicClient, wallet: walletClient })

    console.log('[Clanker] Deploying token:', proposal.tokenName, proposal.tokenSymbol)

    const { txHash, waitForTransaction, error } = await clanker.deploy({
      name: proposal.tokenName,
      symbol: proposal.tokenSymbol,
      tokenAdmin: walletClient.account.address,
      metadata: {
        description: proposal.tokenDescription,
        ...(proposal.tokenImage && { image: proposal.tokenImage }),
      },
      context: {
        interface: 'Agentropolis',
        platform: 'agentropolis',
      },
      rewards: {
        recipients: [{
          recipient: proposal.rewardRecipient as `0x${string}`,
          admin: proposal.rewardRecipient as `0x${string}`,
          bps: proposal.rewardBps,
          token: 'Paired',
        }]
      },
      ...(proposal.vaultPercentage && {
        vault: {
          percentage: proposal.vaultPercentage,
          lockupDuration: (proposal.lockupDays || 7) * 86400,
          vestingDuration: 0,
        }
      }),
    })

    if (error) {
      console.error('[Clanker] Deploy error:', error)
      return { success: false, error: error.message }
    }

    console.log('[Clanker] Waiting for transaction:', txHash)
    const { address } = await waitForTransaction()

    console.log('[Clanker] Token deployed at:', address)
    return {
      success: true,
      txHash,
      tokenAddress: address,
      clankerUrl: `${CLANKER_URLS.CLANKER_WORLD}/${address}`,
    }
  } catch (err) {
    console.error('[Clanker] Launch failed:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }
  }
}

export { mockEnabled as isClankerMockMode }
