'use client'

import { useState } from 'react'
import Scene3D from './Scene3D'
import { Agent3D } from './3d/Agents'
import { COLORS, AGENT_TYPES } from '@/lib/game-constants'
import { AGENT_SKINS, FEATURED_SHOP_ITEMS, DAILY_DEALS, ShopItem, AgentSkin, SKIN_TIERS } from '@/lib/game-data'
import { useGame } from '@/contexts/GameContext'

interface Marketplace3DProps {
    onBack: () => void
}

type TabType = 'agents' | 'skins' | 'chests' | 'deals'

export default function Marketplace3D({ onBack }: Marketplace3DProps) {
    const { state, actions } = useGame()
    const [activeTab, setActiveTab] = useState<TabType>('agents')
    const [selectedAgentType, setSelectedAgentType] = useState<string>('alphaHunter')
    const [previewSkin, setPreviewSkin] = useState<string>('default')

    const handlePurchase = (item: ShopItem) => {
        let success = false
        if (item.type === 'agent') {
            success = actions.purchaseAgent(item.agentId!, item.price)
        } else if (item.type === 'skin') {
            success = actions.purchaseSkin(item.skinId!, item.price)
        } else if (item.type === 'chest') {
            success = actions.purchaseChest(item.id as any, item.price)
        } else if (item.type === 'currency') {
            if (item.price.currency === 'gems') {
                success = actions.purchaseSkin('_currency_' + item.id, item.price) // Abuse purchase for currency
                if (success && item.quantity) {
                    actions.addGold(item.quantity)
                }
            }
        }

        if (!success) {
            alert('Insufficient funds!')
        }
    }

    const handleSkinPurchase = (skin: AgentSkin) => {
        if (state.unlockedSkins.includes(skin.id)) {
            // Already owned - equip it
            actions.equipSkin(selectedAgentType, skin.id)
            setPreviewSkin(skin.id)
        } else {
            // Purchase
            const success = actions.purchaseSkin(skin.id, skin.price)
            if (success) {
                setPreviewSkin(skin.id)
            } else {
                alert('Insufficient funds!')
            }
        }
    }

    return (
        <div className="w-full h-full relative font-[Rajdhani]">
            {/* 3D Preview Scene */}
            <div className="absolute inset-0">
                <Scene3D cameraPosition={[0, 2, 6]} cameraMode="orbital" enablePostProcessing>
                    {/* Floor */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                        <planeGeometry args={[20, 20]} />
                        <meshStandardMaterial color="#0a0a1a" metalness={0.3} roughness={0.7} />
                    </mesh>

                    {/* Display Platform */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[2, 2.5, 0.3, 32]} />
                        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[1.8, 1.9, 64]} />
                        <meshBasicMaterial color={COLORS.neon.cyan} />
                    </mesh>

                    {/* Preview Agent */}
                    {activeTab === 'skins' && (
                        <Agent3D
                            position={[0, 0.5, 0]}
                            agentType={selectedAgentType as keyof typeof AGENT_TYPES}
                            rotation={0}
                            skinId={previewSkin}
                            showNameTag
                            isHovered
                        />
                    )}

                    {/* Ambient Lights */}
                    <pointLight position={[3, 3, 3]} intensity={1} color="#FCEE0A" />
                    <pointLight position={[-3, 3, -3]} intensity={1} color="#00F5FF" />
                </Scene3D>
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Back Button + Title (positioned below main header) */}
                <div className="absolute top-12 left-4 pointer-events-auto">
                    <button onClick={onBack} className="px-4 py-2 bg-black/90 border border-[#FCEE0A]/50 text-[#FCEE0A] text-xs font-bold uppercase tracking-wider hover:bg-[#FCEE0A] hover:text-black transition-all">
                        {'<'} EXIT
                    </button>
                </div>

                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
                    <h1 className="text-2xl font-black text-[#FCEE0A] uppercase tracking-widest">Marketplace</h1>
                    <p className="text-xs text-gray-500">Agents • Skins • Chests • Deals</p>
                </div>

                {/* Left Panel - Categories */}
                <div className="absolute top-24 left-4 bottom-8 w-40 pointer-events-auto">
                    <div className="cyber-panel bg-black/90 p-2 h-full flex flex-col gap-2">
                        {(['agents', 'skins', 'chests', 'deals'] as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`p-4 text-left uppercase tracking-wider font-bold transition-all ${activeTab === tab
                                    ? 'bg-[#FCEE0A] text-black'
                                    : 'bg-black/60 text-gray-400 hover:bg-[#FCEE0A]/20 hover:text-[#FCEE0A]'
                                    }`}
                            >
                                {tab === 'agents' && '🤖 '}
                                {tab === 'skins' && '🎨 '}
                                {tab === 'chests' && '📦 '}
                                {tab === 'deals' && '🔥 '}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Items */}
                <div className="absolute top-24 left-48 right-4 bottom-8 pointer-events-auto overflow-y-auto">
                    <div className="cyber-panel bg-black/90 p-6 min-h-full">
                        {activeTab === 'agents' && (
                            <AgentsTab items={FEATURED_SHOP_ITEMS} onPurchase={handlePurchase} ownedAgents={state.ownedAgents} />
                        )}
                        {activeTab === 'skins' && (
                            <SkinsTab
                                selectedAgentType={selectedAgentType}
                                onSelectAgentType={setSelectedAgentType}
                                skins={AGENT_SKINS[selectedAgentType] || []}
                                unlockedSkins={state.unlockedSkins}
                                equippedSkins={state.equippedSkins}
                                onPurchase={handleSkinPurchase}
                                onPreview={setPreviewSkin}
                            />
                        )}
                        {activeTab === 'chests' && (
                            <ChestsTab onPurchase={handlePurchase} />
                        )}
                        {activeTab === 'deals' && (
                            <DealsTab items={DAILY_DEALS} onPurchase={handlePurchase} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// === Sub Components ===

function AgentsTab({ items, onPurchase, ownedAgents }: { items: ShopItem[], onPurchase: (item: ShopItem) => void, ownedAgents: string[] }) {
    return (
        <div>
            <h2 className="text-xl font-bold text-[#FCEE0A] uppercase tracking-wider mb-4">Featured Agents</h2>
            <div className="grid grid-cols-3 gap-4">
                {items.filter(i => i.type === 'agent').map(item => {
                    const owned = ownedAgents.includes(item.agentId!)
                    return (
                        <div key={item.id} className={`cyber-panel p-4 ${owned ? 'border-green-500' : 'border-[#FCEE0A]/30'}`}>
                            <div className="text-4xl text-center mb-2">{item.icon}</div>
                            <h3 className="font-bold text-white text-center">{item.name}</h3>
                            <p className="text-xs text-gray-400 text-center mb-3">{item.description}</p>
                            <div className={`text-center text-sm px-2 py-1 rounded mb-3 ${item.rarity === 'gold' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                                item.rarity === 'silver' ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                                    'bg-gray-600/20 text-gray-400'
                                }`}>
                                {item.rarity.toUpperCase()}
                            </div>
                            {owned ? (
                                <div className="text-center text-green-500 font-bold py-2">✓ OWNED</div>
                            ) : (
                                <button
                                    onClick={() => onPurchase(item)}
                                    className="w-full btn-cyber py-2"
                                >
                                    {item.price.currency === 'gems' ? '💎' : '🪙'} {item.price.amount}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function SkinsTab({
    selectedAgentType,
    onSelectAgentType,
    skins,
    unlockedSkins,
    equippedSkins,
    onPurchase,
    onPreview
}: {
    selectedAgentType: string
    onSelectAgentType: (type: string) => void
    skins: AgentSkin[]
    unlockedSkins: string[]
    equippedSkins: Record<string, string>
    onPurchase: (skin: AgentSkin) => void
    onPreview: (skinId: string) => void
}) {
    const agentTypes = Object.keys(AGENT_SKINS)

    return (
        <div>
            <h2 className="text-xl font-bold text-[#FCEE0A] uppercase tracking-wider mb-4">Agent Skins</h2>

            {/* Agent Type Selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {agentTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => {
                            onSelectAgentType(type)
                            onPreview(equippedSkins[type] || 'default')
                        }}
                        className={`px-4 py-2 text-sm font-bold uppercase transition-all ${selectedAgentType === type
                            ? 'bg-[#FCEE0A] text-black'
                            : 'bg-black/60 text-gray-400 hover:bg-[#FCEE0A]/20'
                            }`}
                    >
                        {AGENT_TYPES[type as keyof typeof AGENT_TYPES]?.emoji} {type}
                    </button>
                ))}
            </div>

            {/* Skins Grid */}
            <div className="grid grid-cols-4 gap-3">
                {skins.map(skin => {
                    const owned = unlockedSkins.includes(skin.id)
                    const equipped = equippedSkins[selectedAgentType] === skin.id
                    const tierInfo = SKIN_TIERS[skin.tier]

                    return (
                        <div
                            key={skin.id}
                            className={`cyber-panel p-3 cursor-pointer transition-all hover:scale-105 ${equipped ? 'border-[#00FF88] ring-2 ring-[#00FF88]/50' :
                                owned ? 'border-[#FCEE0A]/50' : 'border-gray-700'
                                }`}
                            onClick={() => onPreview(skin.id)}
                            onMouseEnter={() => onPreview(skin.id)}
                        >
                            {/* Color Preview */}
                            <div
                                className="w-full h-16 rounded mb-2 flex items-center justify-center"
                                style={{
                                    backgroundColor: skin.colors.secondary,
                                    boxShadow: `0 0 20px ${skin.colors.glow}40`
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full"
                                    style={{ backgroundColor: skin.colors.primary }}
                                />
                            </div>

                            <h4 className="font-bold text-white text-sm truncate">{skin.name}</h4>
                            <div
                                className="text-[10px] uppercase font-bold"
                                style={{ color: tierInfo.color }}
                            >
                                {tierInfo.name}
                            </div>

                            {equipped && (
                                <div className="text-[10px] text-[#00FF88] font-bold mt-1">✓ EQUIPPED</div>
                            )}

                            {!owned && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPurchase(skin) }}
                                    className="w-full mt-2 py-1 text-[10px] font-bold bg-[#FCEE0A]/20 text-[#FCEE0A] hover:bg-[#FCEE0A] hover:text-black transition-all"
                                >
                                    {skin.price.currency === 'gems' ? '💎' : '🪙'} {skin.price.amount}
                                </button>
                            )}

                            {owned && !equipped && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPurchase(skin) }}
                                    className="w-full mt-2 py-1 text-[10px] font-bold bg-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88] hover:text-black transition-all"
                                >
                                    EQUIP
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function ChestsTab({ onPurchase }: { onPurchase: (item: ShopItem) => void }) {
    const chestItems: ShopItem[] = [
        { id: 'wooden', type: 'chest', name: 'Wooden Chest', description: 'Basic rewards', icon: '📦', price: { currency: 'gold', amount: 100 }, rarity: 'common' },
        { id: 'silver', type: 'chest', name: 'Silver Chest', description: 'Better rewards', icon: '🪙', price: { currency: 'gold', amount: 500 }, rarity: 'silver' },
        { id: 'golden', type: 'chest', name: 'Golden Chest', description: 'Great rewards', icon: '🎁', price: { currency: 'gems', amount: 50 }, rarity: 'gold' },
        { id: 'magical', type: 'chest', name: 'Magical Chest', description: 'Amazing rewards', icon: '🔮', price: { currency: 'gems', amount: 150 }, rarity: 'platinum' },
        { id: 'legendary', type: 'chest', name: 'Legendary Chest', description: 'Best rewards', icon: '👑', price: { currency: 'gems', amount: 500 }, rarity: 'legendary' },
    ]

    return (
        <div>
            <h2 className="text-xl font-bold text-[#FCEE0A] uppercase tracking-wider mb-4">Chests</h2>
            <div className="grid grid-cols-3 gap-4">
                {chestItems.map(item => (
                    <div key={item.id} className="cyber-panel p-6 text-center">
                        <div className="text-6xl mb-3">{item.icon}</div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                        <button
                            onClick={() => onPurchase(item)}
                            className="w-full btn-cyber py-2"
                        >
                            {item.price.currency === 'gems' ? '💎' : '🪙'} {item.price.amount}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function DealsTab({ items, onPurchase }: { items: ShopItem[], onPurchase: (item: ShopItem) => void }) {
    return (
        <div>
            <h2 className="text-xl font-bold text-[#FF6B00] uppercase tracking-wider mb-4">🔥 Daily Deals</h2>
            <p className="text-gray-400 mb-4">Limited time offers! Refreshes daily.</p>
            <div className="grid grid-cols-2 gap-4">
                {items.map(item => (
                    <div key={item.id} className="cyber-panel p-4 relative overflow-hidden">
                        {item.discount && (
                            <div className="absolute top-2 right-2 bg-[#FF3366] text-white text-xs font-bold px-2 py-1 rotate-12">
                                -{item.discount}%
                            </div>
                        )}
                        <div className="text-4xl text-center mb-2">{item.icon}</div>
                        <h3 className="font-bold text-white text-center">{item.name}</h3>
                        <p className="text-xs text-gray-400 text-center mb-3">{item.description}</p>
                        <button
                            onClick={() => onPurchase(item)}
                            className="w-full btn-cyber py-2"
                        >
                            {item.price.currency === 'gems' ? '💎' : '🪙'} {item.price.amount}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
