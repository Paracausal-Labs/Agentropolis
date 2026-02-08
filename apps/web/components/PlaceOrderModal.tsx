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
    txHash?: string
    filledAt?: number
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050510]">
            <div className="w-[480px] max-h-[80vh] bg-[#050510] border border-[#FCEE0A]/40 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#FCEE0A]/10 border-b border-[#FCEE0A]/30">
                    <div>
                        <h2 className="text-lg font-black text-[#FCEE0A] uppercase tracking-widest">LIMIT_ORDER</h2>
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">CONSTRUCT TRADE TOWER // UNISWAP V4</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#FCEE0A] text-xl font-bold transition-colors">
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4 space-y-4 custom-scrollbar">
                    {!isConnected ? (
                        <div className="text-center py-8">
                            <span className="text-gray-500 font-mono text-sm uppercase">CONNECT WALLET TO PLACE ORDERS</span>
                        </div>
                    ) : (
                        <>
                            {/* Token Pair */}
                            <div className="bg-black/60 border border-[#FCEE0A]/20 p-4">
                                <label className="block text-[10px] font-mono text-[#FCEE0A] uppercase tracking-wider mb-2">
                                    TOKEN PAIR
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={tokenInIndex}
                                        onChange={(e) => setTokenInIndex(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 bg-black/80 border border-[#FCEE0A]/30 text-white text-xs font-mono focus:outline-none focus:border-[#FCEE0A]"
                                    >
                                        {TOKENS.map((token, idx) => (
                                            <option key={token.symbol} value={idx}>
                                                {token.symbol}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleSwapTokens}
                                        className="p-2 border border-[#FCEE0A]/30 hover:bg-[#FCEE0A]/10 transition-colors"
                                        title="Swap tokens"
                                    >
                                        <svg className="w-4 h-4 text-[#FCEE0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </button>
                                    <select
                                        value={tokenOutIndex}
                                        onChange={(e) => setTokenOutIndex(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 bg-black/80 border border-[#FCEE0A]/30 text-white text-xs font-mono focus:outline-none focus:border-[#FCEE0A]"
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
                                <label className="block text-[10px] font-mono text-[#FCEE0A] uppercase tracking-wider mb-2">
                                    DIRECTION
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setDirection('buy')}
                                        className={`px-4 py-2 font-bold text-xs uppercase tracking-wider font-mono transition-all ${direction === 'buy'
                                                ? 'bg-[#00FF88]/20 border border-[#00FF88] text-[#00FF88]'
                                                : 'bg-black/40 border border-gray-700 text-gray-500 hover:border-gray-500'
                                            }`}
                                    >
                                        BUY {TOKENS[tokenOutIndex].symbol}
                                    </button>
                                    <button
                                        onClick={() => setDirection('sell')}
                                        className={`px-4 py-2 font-bold text-xs uppercase tracking-wider font-mono transition-all ${direction === 'sell'
                                                ? 'bg-[#FF3366]/20 border border-[#FF3366] text-[#FF3366]'
                                                : 'bg-black/40 border border-gray-700 text-gray-500 hover:border-gray-500'
                                            }`}
                                    >
                                        SELL {TOKENS[tokenInIndex].symbol}
                                    </button>
                                </div>
                            </div>

                            {/* Target Price */}
                            <div>
                                <label htmlFor="targetPrice" className="block text-[10px] font-mono text-[#FCEE0A] uppercase tracking-wider mb-2">
                                    TARGET PRICE (USDC PER {TOKENS[tokenInIndex].symbol === 'WETH' ? 'ETH' : 'USDC'})
                                </label>
                                <input
                                    id="targetPrice"
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="2000"
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-black/80 border border-[#FCEE0A]/30 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-[#FCEE0A]"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label htmlFor="amount" className="block text-[10px] font-mono text-[#FCEE0A] uppercase tracking-wider mb-2">
                                    AMOUNT ({TOKENS[tokenInIndex].symbol})
                                </label>
                                <input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.1"
                                    step="0.001"
                                    className="w-full px-3 py-2 bg-black/80 border border-[#FCEE0A]/30 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-[#FCEE0A]"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 p-3">
                                <p className="text-[10px] text-[#00F0FF]/80 font-mono leading-relaxed">
                                    <span className="text-[#00F0FF] font-bold">PROTOCOL:</span> ORDER APPEARS AS TOWER IN CITY.
                                    WHEN MARKET REACHES TARGET, TOWER ACTIVATES. CLICK TO CLAIM.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacing || !targetPrice || !amount}
                                    className="flex-1 px-4 py-3 bg-[#FCEE0A] text-black font-black text-xs uppercase tracking-widest hover:bg-[#FF00FF] hover:text-white disabled:bg-gray-800 disabled:text-gray-600 disabled:border disabled:border-gray-700 transition-all"
                                >
                                    {isPlacing ? 'CONSTRUCTING...' : 'CONSTRUCT TOWER'}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isPlacing}
                                    className="px-4 py-3 border border-gray-700 text-gray-400 font-mono text-xs uppercase tracking-wider hover:border-gray-500 hover:text-gray-300 disabled:opacity-50 transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
