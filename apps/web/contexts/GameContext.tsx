'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { gameStore, MockGameState, Proposal, BattleResult } from '@/lib/mock/store'
import { ChestType } from '@/lib/game-data'

interface GameContextValue {
    state: MockGameState
    actions: {
        // Agent Actions
        deployAgent: (agentId: string) => Promise<void>
        removeAgent: (instanceId: string) => void

        // Currency Actions
        collectCoin: (value: number) => void
        addGold: (amount: number) => void
        addGems: (amount: number) => void

        // Skin Actions
        unlockSkin: (skinId: string) => void
        equipSkin: (agentType: string, skinId: string) => void

        // Shop Actions
        purchaseAgent: (agentId: string, price: { currency: 'gold' | 'gems', amount: number }) => boolean
        purchaseSkin: (skinId: string, price: { currency: 'gold' | 'gems', amount: number }) => boolean
        purchaseChest: (chestType: ChestType, price: { currency: 'gold' | 'gems', amount: number }) => boolean

        // Chest Actions
        startChestUnlock: (chestId: string, slotIndex: number) => void
        checkChestReady: (slotIndex: number) => boolean
        openChest: (slotIndex: number) => { gold: number, gems: number, skinId?: string } | null

        // Battle Actions
        startBattle: (opponent: { name: string; trophies: number; level: number; agents: string[] }) => void
        updateBattle: (update: any) => void
        endBattle: (won: boolean) => BattleResult | undefined

        // Mission Actions
        claimMissionReward: (missionId: string) => void

        // Council Actions
        startDeliberation: () => void
        addProposal: (proposal: Proposal) => void
        executeProposal: (proposalId: string) => void

        // Utility
        resetGame: () => void
        getLeague: () => ReturnType<typeof gameStore.getLeague>
    }
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<MockGameState>(gameStore.getState())

    useEffect(() => {
        const unsubscribe = gameStore.subscribe(() => {
            setState(gameStore.getState())
        })
        return () => { unsubscribe() }
    }, [])

    const actions: GameContextValue['actions'] = {
        // Agent Actions
        deployAgent: async (agentId: string) => {
            await new Promise(resolve => setTimeout(resolve, 500))
            try {
                gameStore.deployAgent(agentId)
            } catch (e) {
                console.error(e)
                alert(e instanceof Error ? e.message : 'Failed to deploy')
            }
        },
        removeAgent: (instanceId: string) => {
            gameStore.removeAgent(instanceId)
        },

        // Currency Actions
        collectCoin: (value: number) => {
            gameStore.collectCoin(value)
        },
        addGold: (amount: number) => {
            gameStore.addGold(amount)
        },
        addGems: (amount: number) => {
            gameStore.addGems(amount)
        },

        // Skin Actions
        unlockSkin: (skinId: string) => {
            gameStore.unlockSkin(skinId)
        },
        equipSkin: (agentType: string, skinId: string) => {
            gameStore.equipSkin(agentType, skinId)
        },

        // Shop Actions
        purchaseAgent: (agentId: string, price: { currency: 'gold' | 'gems', amount: number }) => {
            return gameStore.purchaseAgent(agentId, price)
        },
        purchaseSkin: (skinId: string, price: { currency: 'gold' | 'gems', amount: number }) => {
            return gameStore.purchaseSkin(skinId, price)
        },
        purchaseChest: (chestType: ChestType, price: { currency: 'gold' | 'gems', amount: number }) => {
            return gameStore.purchaseChest(chestType, price)
        },

        // Chest Actions
        startChestUnlock: (chestId: string, slotIndex: number) => {
            gameStore.startChestUnlock(chestId, slotIndex)
        },
        checkChestReady: (slotIndex: number) => {
            return gameStore.checkChestReady(slotIndex)
        },
        openChest: (slotIndex: number) => {
            return gameStore.openChest(slotIndex)
        },

        // Battle Actions
        startBattle: (opponent) => {
            gameStore.startBattle(opponent)
        },
        updateBattle: (update) => {
            gameStore.updateBattle(update)
        },
        endBattle: (won: boolean) => {
            return gameStore.endBattle(won)
        },

        // Mission Actions
        claimMissionReward: (missionId: string) => {
            gameStore.claimMissionReward(missionId)
        },

        // Council Actions
        startDeliberation: () => {
            gameStore.startDeliberation()
        },
        addProposal: (proposal: Proposal) => {
            gameStore.addProposal(proposal)
        },
        executeProposal: (proposalId: string) => {
            gameStore.executeProposal(proposalId)
        },

        // Utility
        resetGame: () => {
            gameStore.reset()
        },
        getLeague: () => {
            return gameStore.getLeague()
        }
    }

    return (
        <GameContext.Provider value={{ state, actions }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const context = useContext(GameContext)
    if (!context) {
        throw new Error('useGame must be used within a GameProvider')
    }
    return context
}
