'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

interface PlaceOrderModalProps {
    isOpen: boolean
    onClose: () => void
    onPlaceOrder: (order: LimitOrder) => Promise<void>
}

export interface LimitOrder {
    id: string
    tokenIn: string
    tokenOut: string
    direction: 'buy' | 'sell'
    targetPrice: string
    amount: string
    status: 'construction' | 'active' | 'completed'
    createdAt: number
}

const TOKENS = [
    { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006' },
    { symbol: 'USDC', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' },
]

export function PlaceOrderModal({ isOpen, onClose, onPlaceOrder }: PlaceOrderModalProps) {
    const { isConnected } = useAccount()
    const [tokenInIndex, setTokenInIndex] = useState(0)
    const [tokenOutIndex, setTokenOutIndex] = useState(1)
    const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
    const [targetPrice, setTargetPrice] = useState('')
    const [amount, setAmount] = useState('')
    const [isPlacing, setIsPlacing] = useState(false)

    const handleSwapTokens = () => {
        setTokenInIndex(tokenOutIndex)
        setTokenOutIndex(tokenInIndex)
        setDirection(direction === 'buy' ? 'sell' : 'buy')
    }

    const handlePlaceOrder = async () => {
        if (!targetPrice || !amount) return

        setIsPlacing(true)
        try {
            const order: LimitOrder = {
                id: `order-${Date.now()}`,
                tokenIn: TOKENS[tokenInIndex].address,
                tokenOut: TOKENS[tokenOutIndex].address,
                direction,
                targetPrice,
                amount,
                status: 'construction',
                createdAt: Date.now(),
            }

            await onPlaceOrder(order)
            onClose()
            setTargetPrice('')
            setAmount('')
        } catch (error) {
            console.error('[PlaceOrderModal] Failed to place order:', error)
        } finally {
            setIsPlacing(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md mx-4 p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    🏗️ Construct Trade Tower
                </h2>

                {!isConnected ? (
                    <p className="text-gray-400">Connect your wallet to place limit orders.</p>
                ) : (
                    <div className="space-y-4">
                        {/* Token Pair */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Token Pair
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={tokenInIndex}
                                    onChange={(e) => setTokenInIndex(Number(e.target.value))}
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {TOKENS.map((token, idx) => (
                                        <option key={token.symbol} value={idx}>
                                            {token.symbol}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleSwapTokens}
                                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    title="Swap tokens"
                                >
                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>
                                <select
                                    value={tokenOutIndex}
                                    onChange={(e) => setTokenOutIndex(Number(e.target.value))}
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {TOKENS.map((token, idx) => (
                                        <option key={token.symbol} value={idx}>
                                            {token.symbol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Direction */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Direction
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setDirection('buy')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${direction === 'buy'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Buy {TOKENS[tokenOutIndex].symbol}
                                </button>
                                <button
                                    onClick={() => setDirection('sell')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${direction === 'sell'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Sell {TOKENS[tokenInIndex].symbol}
                                </button>
                            </div>
                        </div>

                        {/* Target Price */}
                        <div>
                            <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-300 mb-2">
                                Target Price (USDC per {TOKENS[tokenInIndex].symbol === 'WETH' ? 'ETH' : 'USDC'})
                            </label>
                            <input
                                id="targetPrice"
                                type="number"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="e.g., 2000"
                                step="0.01"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                                Amount ({TOKENS[tokenInIndex].symbol})
                            </label>
                            <input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g., 0.1"
                                step="0.001"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                            <p className="text-xs text-blue-300">
                                <span className="font-semibold">How it works:</span> Your order will appear as a building in the city.
                                When the market price reaches your target, the order automatically fills and the building lights up gold.
                                Click it to claim your tokens!
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacing || !targetPrice || !amount}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all shadow-lg disabled:shadow-none"
                            >
                                {isPlacing ? '🏗️ Constructing...' : '🏗️ Construct Tower'}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isPlacing}
                                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
