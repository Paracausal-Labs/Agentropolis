/**
 * Initialize USDC/WETH pool on Base Sepolia for Agentropolis
 * 
 * Prerequisites:
 * 1. Set PRIVATE_KEY env var with a funded Base Sepolia wallet
 * 2. Wallet needs: Base Sepolia ETH, USDC, and WETH
 * 
 * Run: cd apps/web && PRIVATE_KEY=0x... bun run scripts/init-pool.ts
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  encodeAbiParameters,
  encodePacked,
  type Address,
  type Hex,
} from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const RPC_URL = 'https://sepolia.base.org'

const CONTRACTS = {
  POOL_MANAGER: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408' as Address,
  POSITION_MANAGER: '0xABD2e846ea3927eA90e5e4Caa2A0fFd0CcbF60f8' as Address,
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,
  WETH: '0x4200000000000000000000000000000000000006' as Address,
}

const POOL_KEY = {
  currency0: CONTRACTS.USDC,
  currency1: CONTRACTS.WETH,
  fee: 3000,
  tickSpacing: 60,
  hooks: '0x0000000000000000000000000000000000000000' as Address,
}

// ~$3300 ETH price: sqrtPriceX96 = sqrt(10^12 / 3300) * 2^96
// This puts tick around 195303
const SQRT_PRICE_X96 = 1379185281616022422483768677761024n

const POOL_MANAGER_ABI = [
  {
    type: 'function',
    name: 'initialize',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'key',
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      { name: 'sqrtPriceX96', type: 'uint160' },
    ],
    outputs: [{ name: 'tick', type: 'int24' }],
  },
] as const

const POSITION_MANAGER_ABI = [
  {
    type: 'function',
    name: 'modifyLiquidities',
    stateMutability: 'payable',
    inputs: [
      { name: 'unlockData', type: 'bytes' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const WETH_ABI = [
  ...ERC20_ABI,
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
] as const

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('ERROR: Set PRIVATE_KEY environment variable')
    console.log('Usage: PRIVATE_KEY=0x... bun run scripts/init-pool.ts')
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey as Hex)
  console.log('Using account:', account.address)

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  })

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  })

  // Check balances
  const [ethBalance, usdcBalance, wethBalance] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: CONTRACTS.USDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    }),
    publicClient.readContract({
      address: CONTRACTS.WETH,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    }),
  ])

  console.log('\nBalances:')
  console.log(`  ETH:  ${Number(ethBalance) / 1e18}`)
  console.log(`  USDC: ${Number(usdcBalance) / 1e6}`)
  console.log(`  WETH: ${Number(wethBalance) / 1e18}`)

  if (ethBalance < parseUnits('0.01', 18)) {
    console.error('\nERROR: Need at least 0.01 ETH for gas')
    console.log('Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia')
    process.exit(1)
  }

  // Step 1: Initialize the pool
  console.log('\n--- Step 1: Initialize Pool ---')
  console.log('Pool Key:', POOL_KEY)
  console.log('sqrtPriceX96:', SQRT_PRICE_X96.toString())

  try {
    const initHash = await walletClient.writeContract({
      address: CONTRACTS.POOL_MANAGER,
      abi: POOL_MANAGER_ABI,
      functionName: 'initialize',
      args: [POOL_KEY, SQRT_PRICE_X96],
    })

    console.log('Initialize TX:', initHash)
    const initReceipt = await publicClient.waitForTransactionReceipt({ hash: initHash })
    console.log('Status:', initReceipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED')

    if (initReceipt.status !== 'success') {
      console.error('Pool initialization failed')
      process.exit(1)
    }
  } catch (err: any) {
    if (err.message?.includes('already initialized') || err.message?.includes('PoolAlreadyInitialized')) {
      console.log('Pool already initialized - continuing to add liquidity')
    } else {
      console.error('Initialize error:', err.message || err)
      process.exit(1)
    }
  }

  // Step 2: Wrap ETH to WETH if needed
  const minWeth = parseUnits('0.01', 18)
  if (wethBalance < minWeth && ethBalance > minWeth + parseUnits('0.01', 18)) {
    console.log('\n--- Step 2: Wrap ETH to WETH ---')
    const wrapAmount = parseUnits('0.05', 18)
    const wrapHash = await walletClient.writeContract({
      address: CONTRACTS.WETH,
      abi: WETH_ABI,
      functionName: 'deposit',
      value: wrapAmount,
    })
    console.log('Wrap TX:', wrapHash)
    await publicClient.waitForTransactionReceipt({ hash: wrapHash })
    console.log('Wrapped 0.05 ETH to WETH')
  }

  // Step 3: Approve tokens for Position Manager
  console.log('\n--- Step 3: Approve Tokens ---')
  
  const approveAmount = parseUnits('1000000', 18)
  
  const approveUsdcHash = await walletClient.writeContract({
    address: CONTRACTS.USDC,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [CONTRACTS.POSITION_MANAGER, approveAmount],
  })
  console.log('Approve USDC TX:', approveUsdcHash)
  await publicClient.waitForTransactionReceipt({ hash: approveUsdcHash })

  const approveWethHash = await walletClient.writeContract({
    address: CONTRACTS.WETH,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [CONTRACTS.POSITION_MANAGER, approveAmount],
  })
  console.log('Approve WETH TX:', approveWethHash)
  await publicClient.waitForTransactionReceipt({ hash: approveWethHash })

  console.log('Tokens approved')

  // Step 4: Add liquidity
  console.log('\n--- Step 4: Add Liquidity ---')

  // For a full-range position around current price
  // tickSpacing = 60, so ticks must be multiples of 60
  // Current tick ~195300, let's do a range around it
  const tickLower = 195240
  const tickUpper = 195360
  const liquidityAmount = parseUnits('100', 18) // Liquidity units

  // Encode MINT_POSITION action
  const mintParams = encodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      { type: 'int24' },
      { type: 'int24' },
      { type: 'uint256' },
      { type: 'uint128' },
      { type: 'uint128' },
      { type: 'address' },
      { type: 'bytes' },
    ],
    [
      POOL_KEY,
      tickLower,
      tickUpper,
      liquidityAmount,
      parseUnits('1000', 6),  // amount0Max (USDC)
      parseUnits('1', 18),    // amount1Max (WETH)
      account.address,
      '0x',
    ]
  )

  // Encode SETTLE_PAIR action
  const settleParams = encodeAbiParameters(
    [{ type: 'address' }, { type: 'address' }],
    [CONTRACTS.USDC, CONTRACTS.WETH]
  )

  // Actions: 0x02 = MINT_POSITION, 0x0d = SETTLE_PAIR
  const actions = encodePacked(['uint8', 'uint8'], [0x02, 0x0d])

  const unlockData = encodeAbiParameters(
    [{ type: 'bytes' }, { type: 'bytes[]' }],
    [actions, [mintParams, settleParams]]
  )

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)

  try {
    const mintHash = await walletClient.writeContract({
      address: CONTRACTS.POSITION_MANAGER,
      abi: POSITION_MANAGER_ABI,
      functionName: 'modifyLiquidities',
      args: [unlockData, deadline],
    })

    console.log('Add Liquidity TX:', mintHash)
    const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintHash })
    console.log('Status:', mintReceipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED')
  } catch (err: any) {
    console.error('Add liquidity error:', err.message || err)
    console.log('\nNote: If you lack USDC, get some from a testnet faucet or bridge')
  }

  console.log('\n--- Done ---')
  console.log('Pool should now be initialized and have liquidity!')
  console.log('You can now test swaps in Agentropolis.')
}

main().catch(console.error)
