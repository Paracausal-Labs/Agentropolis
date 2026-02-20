```mermaid
graph TB
    %% --- User Layer ---
    User((👤 User))

    %% --- Frontend System ---
    subgraph Frontend ["🖥️ Agentropolis Frontend (Next.js 14 + Phaser 3)"]
        direction TB
        Landing[Landing Page]
        Game[Game Canvas]
        
        subgraph GameScenes ["🎮 Game Scenes"]
            City[City View (Isometric)]
            Council[Council Room (Roundtable)]
        end
        
        subgraph CoreComponents ["🧩 Core Components"]
            Session[Session Provider]
            Wallet[Wallet Provider]
            Swap[Swap Handler]
        end
        
        subgraph IntegrationLibs ["📚 Integration Libraries"]
            YellowLib[Yellow (State Channels)]
            ENS_Lib[ENS (Identity)]
            ERC8004_Lib[ERC-8004 (Registry)]
            x402_Lib[x402 (Micropayments)]
            UniExecutor[Uniswap Executor]
            ClankerLib[Clanker SDK]
        end
    end

    %% --- Backend / AI Layer ---
    subgraph AI_Layer ["🧠 AI & Backend Layer"]
        Groq[Groq LLM API]
        
        subgraph Agents ["🤖 AI Council Agents"]
            Alpha[🎯 Alpha Hunter]
            Risk[🛡️ Risk Sentinel]
            Macro[🔮 Macro Oracle]
            Devil[😈 Devil's Advocate]
            Clerk[📋 Council Clerk]
        end
        
        ExternalAgent[🌐 External Agent (BYOA)]
    end

    %% --- Blockchain Layer ---
    subgraph Blockchain ["⛓️ Base Sepolia & On-Chain"]
        subgraph Registries ["Infrastructure"]
            Registry[ERC-8004 Registry]
            ENSReg[ENS Registry]
        end
        
        subgraph Execution ["DeFi Execution"]
            UniversalRouter[Uniswap Universal Router]
            PoolManager[Pool Manager]
        end
        
        subgraph Hooks ["🪝 Custom Uniswap Hooks"]
            FeeHook[CouncilFeeHook]
            SentinelHook[SentimentOracleHook]
            GuardHook[SwapGuardHook]
        end
    end

    %% --- Connections ---
    User -->|Connects| Wallet
    User -->|Interacts| Game
    
    Game --> City
    City -->|Click Council| Council
    
    %% Deploy Flow
    City -->|Query Agents| ERC8004_Lib
    ERC8004_Lib -->|Read| Registry
    City -->|Micropayment| YellowLib
    
    %% Deliberation Flow
    Council -->|Prompt| Agents
    Agents -->|Inference| Groq
    Agents -->|Consult| ExternalAgent
    ExternalAgent -.->|Payment| x402_Lib
    
    %% Execution Flow
    Agents -->|Consensus Proposal| Clerk
    Clerk -->|Synthesized Plan| Swap
    Swap -->|Execute| UniExecutor
    UniExecutor -->|V4_SWAP| UniversalRouter
    UniversalRouter --> PoolManager
    PoolManager --> FeeHook
    PoolManager --> SentinelHook
    PoolManager --> GuardHook

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef blockchain fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef user fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    
    class Frontend,GameScenes,CoreComponents,IntegrationLibs frontend;
    class AI_Layer,Agents,Groq,ExternalAgent backend;
    class Blockchain,Registries,Execution,Hooks blockchain;
    class User user;
```
