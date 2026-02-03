import { namehash, type WalletClient } from 'viem'
import { normalize } from 'viem/ens'
import { sepolia } from 'viem/chains'

/**
 * ENS NameWrapper contract address on Sepolia
 * Used for creating subnames with wrapped ENS names
 */
const NAME_WRAPPER_ADDRESS = '0x0635513f179D50A207757E05759CbD106d7dFcE8' as const

/**
 * NameWrapper ABI - only the setSubnodeRecord function we need
 */
const NAME_WRAPPER_ABI = [
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'ttl', type: 'uint64' },
      { name: 'fuses', type: 'uint32' },
      { name: 'expiry', type: 'uint64' },
    ],
    name: 'setSubnodeRecord',
    outputs: [{ name: 'node', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/**
 * Result of creating an agent subname
 */
export interface CreateSubnameResult {
  success: boolean
  txHash?: `0x${string}`
  subname?: string
  error?: string
}

/**
 * Creates an ENS subname for a deployed agent
 * 
 * Example: If parentName is "alice.eth" and agentLabel is "momentum",
 * this creates "momentum.alice.eth"
 * 
 * @param parentName - The parent ENS name (e.g., "alice.eth")
 * @param agentLabel - The label for the agent (e.g., "momentum")
 * @param walletClient - Viem wallet client for signing the transaction
 * @returns Result object with success status, tx hash, and subname
 * 
 * @example
 * ```typescript
 * const result = await createAgentSubname(
 *   "alice.eth",
 *   "momentum",
 *   walletClient
 * )
 * if (result.success) {
 *   console.log(`Created ${result.subname} - tx: ${result.txHash}`)
 * }
 * ```
 */
export async function createAgentSubname(
  parentName: string,
  agentLabel: string,
  walletClient: WalletClient
): Promise<CreateSubnameResult> {
  try {
    if (!parentName || !agentLabel) {
      return {
        success: false,
        error: 'Parent name and agent label are required',
      }
    }

    let normalizedParent: string
    try {
      normalizedParent = normalize(parentName)
    } catch (err) {
      return {
        success: false,
        error: `Invalid ENS name: ${parentName}`,
      }
    }

    const labelRegex = /^[a-z0-9-]+$/
    if (!labelRegex.test(agentLabel)) {
      return {
        success: false,
        error: 'Agent label must contain only lowercase letters, numbers, and hyphens',
      }
    }

    const account = walletClient.account
    if (!account) {
      return {
        success: false,
        error: 'No account found in wallet client',
      }
    }

    const parentNode = namehash(normalizedParent)
    const fullSubname = `${agentLabel}.${normalizedParent}`

    /**
     * Call NameWrapper.setSubnodeRecord with:
     * - parentNode: namehash of parent ENS name
     * - label: subname label string (not hashed)
     * - owner: account creating the subname
     * - resolver: 0x0 (no resolver initially)
     * - ttl: 0 (default)
     * - fuses: 0 (no permission restrictions)
     * - expiry: 0 (inherit from parent)
     */
    const hash = await walletClient.writeContract({
      account,
      address: NAME_WRAPPER_ADDRESS,
      abi: NAME_WRAPPER_ABI,
      functionName: 'setSubnodeRecord',
      args: [
        parentNode,
        agentLabel,
        account.address,
        '0x0000000000000000000000000000000000000000',
        BigInt(0),
        0,
        BigInt(0),
      ],
      chain: sepolia,
    })

    return {
      success: true,
      txHash: hash,
      subname: fullSubname,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    
    if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
      return {
        success: false,
        error: 'Transaction rejected by user',
      }
    }
    
    if (errorMessage.includes('Unauthorised') || errorMessage.includes('not authorized')) {
      return {
        success: false,
        error: 'You do not own this ENS name or it is not wrapped',
      }
    }

    return {
      success: false,
      error: `Failed to create subname: ${errorMessage}`,
    }
  }
}

/**
 * Validates if a user can create a subname for a given parent name
 * This is a helper to check before attempting creation
 * 
 * @param parentName - The parent ENS name
 * @param userAddress - The user's wallet address
 * @returns true if the user likely owns the wrapped name
 * 
 * Note: This is a basic check. Actual ownership verification requires
 * calling the NameWrapper contract's ownerOf function.
 */
export function canCreateSubname(parentName: string, userAddress: string): boolean {
  try {
    normalize(parentName)
    return !!userAddress && userAddress.startsWith('0x')
  } catch {
    return false
  }
}
