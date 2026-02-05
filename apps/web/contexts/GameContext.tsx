'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { gameStore, MockGameState, Proposal } from '@/lib/mock/store'

interface GameContextValue {
    state: MockGameState
    actions: {
        deployAgent: (agentId: string) => Promise<void>
        removeAgent: (instanceId: string) => void
        collectCoin: (value: number) => void
        startDeliberation: () => void
        addProposal: (proposal: Proposal) => void
        executeProposal: (proposalId: string) => void
        resetGame: () => void
    }
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<MockGameState>(gameStore.getState())

    useEffect(() => {
        // Subscribe to store updates
        const unsubscribe = gameStore.subscribe(() => {
            setState(gameStore.getState())
        })
        return unsubscribe
    }, [])

    const actions = {
        deployAgent: async (agentId: string) => {
            // Add a small delay for "network" feel
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
        collectCoin: (value: number) => {
            gameStore.collectCoin(value)
        },
        startDeliberation: () => {
            gameStore.startDeliberation()
        },
        addProposal: (proposal: Proposal) => {
            gameStore.addProposal(proposal)
        },
        executeProposal: (proposalId: string) => {
            gameStore.executeProposal(proposalId)
        },
        resetGame: () => {
            gameStore.reset()
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
