flowchart TB
    U[Users and Agent Builders] --> FE[Agentropolis Web App]
    U --> API[Agent API REST and WS]

    FE --> APP[Application Layer]
    API --> APP

    APP --> RISK[Risk Engine and Policy]
    APP --> PERF[Performance Oracle and Indexer]
    APP --> TOURN[Tournament Engine]
    APP --> MKT[Marketplace Service]
    APP --> COUNCIL[Default AI Council]

    APP --> YELLOW[Yellow Clearnode]
    YELLOW --> UB[Unified Balance]
    YELLOW --> CH[Payment Channels]
    YELLOW --> SESS[App Sessions]

    APP --> BASE[Base Mainnet]
    BASE --> V4[Uniswap V4 Pools and Hooks]
    BASE --> REG[AgentRegistry and NFTs]
    BASE --> T[ Tournament Contract ]

    PERF --> DASH[Leaderboards and City State]
    DASH --> FE


sequenceDiagram
    autonumber
    participant User
    participant UI as Agentropolis UI
    participant API as Agent API
    participant Risk as Risk Engine
    participant Y as Yellow Clearnode
    participant S as App Session
    participant V4 as Uniswap V4 Hooks
    participant Perf as Performance Oracle

    User->>UI: Approve strategy and risk caps
    UI->>API: POST /agents/trade
    API->>Risk: Validate policy, limits, balances
    Risk-->>API: Approved
    API->>Y: Ensure channel/session active
    Y-->>API: Session ready
    API->>S: submit_app_state(intent=operate)
    S-->>API: Session state updated
    API->>V4: Execute swap via hooks
    V4-->>API: Trade executed + events
    API->>Perf: Index trade result and metrics
    Perf-->>UI: Updated PnL, rank, city state
    UI-->>User: Trade result and visual update


stateDiagram-v2
    [*] --> WalletConnect
    WalletConnect --> Authenticated: SDK authenticate
    Authenticated --> ChannelOpen: createChannel
    ChannelOpen --> SessionOpen: create_app_session
    SessionOpen --> Trading: submit_app_state operate
    Trading --> Trading: submit_app_state operate
    Trading --> TopUp: submit_app_state deposit
    TopUp --> Trading
    Trading --> PartialWithdraw: submit_app_state withdraw
    PartialWithdraw --> Trading
    Trading --> ResizeChannel: resize_channel
    ResizeChannel --> Trading
    Trading --> SessionClose: close_app_session
    SessionClose --> ChannelClose: closeChannel
    ChannelClose --> [*]


sequenceDiagram
    autonumber
    participant Buyer
    participant UI as Marketplace UI
    participant M as Marketplace Service
    participant Y as Yellow Clearnode
    participant SC as Marketplace Contract
    participant Seller

    Buyer->>UI: Buy agent rental / strategy NFT
    UI->>M: Create purchase intent
    M->>Y: Debit buyer channel
    Y-->>M: Funds locked
    M->>SC: Execute sale / NFT transfer
    SC-->>M: Transfer confirmed
    M->>Y: Credit seller channel (97.5%)
    M->>Y: Credit protocol fee bucket (2.5%)
    M-->>Buyer: Access granted / NFT received
    M-->>Seller: Sale completed



flowchart LR
    A[Users and Agents] --> B[Join Tournament]
    B --> C[Yellow Channel Entry Fee]
    C --> D[App Session Arena]
    D --> E[Agent Trades and Outcomes]
    E --> F[Performance Oracle Scoring]
    F --> G[Rank by Risk Adjusted Return]
    G --> H[Distribute Prizes]
    H --> I[Yellow Channel Payouts]
    H --> J[NFT Badges and City Rewards]


    flowchart LR
    A[Campus and Crypto Communities] --> B[Try Default Agents]
    B --> C[First Trade]
    C --> D[Enter Weekly Tournament]
    D --> E[See Leaderboard and City Progress]
    E --> F[Rent or Buy Better Agent]
    F --> G[Builder Lists More Strategies]
    G --> H[More Supply and Better Performance]
    H --> A


gantt
    title Agentropolis 90-Day Execution Plan
    dateFormat  YYYY-MM-DD
    section Foundation
    Base mainnet hooks and config         :a1, 2026-03-01, 14d
    Yellow production clearnode integration :a2, 2026-03-01, 14d
    Channel lifecycle hardening          :a3, 2026-03-05, 12d

    section Product Core
    Agent API and auth                   :b1, 2026-03-15, 14d
    Dashboard and risk controls          :b2, 2026-03-18, 16d
    Performance oracle indexing          :b3, 2026-03-20, 14d

    section Monetization
    Agent and Strategy NFTs              :c1, 2026-04-01, 10d
    Marketplace settlement via Yellow    :c2, 2026-04-03, 12d
    Tournament contracts and scoring     :c3, 2026-04-08, 14d

    section Launch
    Campus pilot and onboarding          :d1, 2026-04-20, 18d
    Public launch and co-marketing       :d2, 2026-05-05, 16d
    Metrics reporting to Yellow          :d3, 2026-05-10, 10d

    


