  sender: undefined
}
[ERC-8004] Failed to query agent 1: ContractFunctionExecutionError: HTTP request failed.

URL: https://sepolia.base.org/
Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000001","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}
 
Raw Call Arguments:
  to:    0x8004A818BFB912233c491871b3d84c89A494BD9e
  data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000001
 
Contract Call:
  address:   0x8004A818BFB912233c491871b3d84c89A494BD9e
  function:  getMetadataURI(uint256 id)
  args:                    (1)

Docs: https://viem.sh/docs/contract/readContract
Details: fetch failed
Version: viem@2.45.1
    at getContractError (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/errors/getContractError.js:42:12)
    at readContract (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/actions/public/readContract.js:67:98)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async queryERC8004Registry (webpack-internal:///(rsc)/./lib/erc8004/client.ts:142:37)
    ... 20 lines matching cause stack trace ...
    at async Server.requestListener (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/start-server.js:141:13) {
  cause: CallExecutionError: HTTP request failed.
  
  URL: https://sepolia.base.org/
  Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000001","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}
   
  Raw Call Arguments:
    to:    0x8004A818BFB912233c491871b3d84c89A494BD9e
    data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000001
  
  Details: fetch failed
  Version: viem@2.45.1
      at getCallError (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/errors/getCallError.js:18:12)
      at call (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/actions/public/call.js:174:91)
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
      at async readContract (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/actions/public/readContract.js:54:26)
      at async queryERC8004Registry (webpack-internal:///(rsc)/./lib/erc8004/client.ts:142:37)
      at async getAgents (webpack-internal:///(rsc)/./lib/erc8004/client.ts:184:24)
      at async getFreshAgents (webpack-internal:///(rsc)/./app/api/agents/list/route.ts:28:18)
      at async GET (webpack-internal:///(rsc)/./app/api/agents/list/route.ts:76:16)
      at async /Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228
      at async eT.execute (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)
      at async eT.handle (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)
      at async doRender (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1366:42)
      at async cacheEntry.responseCache.get.routeKind (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1588:28)
      at async DevServer.renderToResponseWithComponentsImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1496:28)
      at async DevServer.renderPageComponent (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1924:24)
      at async DevServer.renderToResponseImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1962:32)
      at async DevServer.pipeImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:922:25)
      at async NextNodeServer.handleCatchallRenderRequest (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/next-server.js:272:17)
      at async DevServer.handleRequestImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:818:17)
      at async /Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/dev/next-dev-server.js:339:20
      at async Span.traceAsyncFn (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/trace/trace.js:154:20)
      at async DevServer.handleRequest (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
      at async invokeRender (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/router-server.js:179:21)
      at async handleRequest (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/router-server.js:359:24)
      at async requestHandlerImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/router-server.js:383:13)
      at async Server.requestListener (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/start-server.js:141:13) {
    cause: HttpRequestError: HTTP request failed.
    
    URL: https://sepolia.base.org/
    Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000001","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}
    
    Details: fetch failed
    Version: viem@2.45.1
        at Object.request (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/rpc/http.js:88:23)
        at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
        at async fn (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/clients/transports/http.js:56:25)
        at async request (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/clients/transports/http.js:60:45)
        at async delay.count.count (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/buildRequest.js:40:24)
        at async attemptRetry (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/promise/withRetry.js:17:30) {
      details: 'fetch failed',
      docsPath: undefined,
      metaMessages: [Array],
      shortMessage: 'HTTP request failed.',
      version: '2.45.1',
      body: [Object],
      headers: undefined,
      status: undefined,
      url: 'https://sepolia.base.org/',
      [cause]: [TypeError]
    },
    details: 'fetch failed',
    docsPath: undefined,
    metaMessages: [
      'URL: https://sepolia.base.org/',
      'Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000001","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}',
      ' ',
      'Raw Call Arguments:',
      '  to:    0x8004A818BFB912233c491871b3d84c89A494BD9e\n' +
        '  data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000001'
    ],
    shortMessage: 'HTTP request failed.',
    version: '2.45.1'
  },
  details: 'fetch failed',
  docsPath: '/docs/contract/readContract',
  metaMessages: [
    'URL: https://sepolia.base.org/',
    'Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000001","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}',
    ' ',
    'Raw Call Arguments:',
    '  to:    0x8004A818BFB912233c491871b3d84c89A494BD9e\n' +
      '  data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000001',
    ' ',
    'Contract Call:',
    '  address:   0x8004A818BFB912233c491871b3d84c89A494BD9e\n' +
      '  function:  getMetadataURI(uint256 id)\n' +
      '  args:                    (1)'
  ],
  shortMessage: 'HTTP request failed.',
  version: '2.45.1',
  abi: [
    {
      inputs: [Array],
      name: 'getMetadataURI',
      outputs: [Array],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'totalAgents',
      outputs: [Array],
      stateMutability: 'view',
      type: 'function'
    }
  ],
  args: [ 1n ],
  contractAddress: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  formattedArgs: undefined,
  functionName: 'getMetadataURI',
  sender: undefined
}
[ERC-8004] Failed to query agent 2: ContractFunctionExecutionError: HTTP request failed.

URL: https://sepolia.base.org/
Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000002","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}
 
Raw Call Arguments:
  to:    0x8004A818BFB912233c491871b3d84c89A494BD9e
  data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000002
 
Contract Call:
  address:   0x8004A818BFB912233c491871b3d84c89A494BD9e
  function:  getMetadataURI(uint256 id)
  args:                    (2)

Docs: https://viem.sh/docs/contract/readContract
Details: fetch failed
Version: viem@2.45.1
    at getContractError (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/errors/getContractError.js:42:12)
    at readContract (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/actions/public/readContract.js:67:98)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async queryERC8004Registry (webpack-internal:///(rsc)/./lib/erc8004/client.ts:142:37)
    ... 20 lines matching cause stack trace ...
    at async Server.requestListener (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/start-server.js:141:13) {
  cause: CallExecutionError: HTTP request failed.
  
  URL: https://sepolia.base.org/
  Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000002","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}
   
  Raw Call Arguments:
    to:    0x8004A818BFB912233c491871b3d84c89A494BD9e
    data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000002
  
  Details: fetch failed
  Version: viem@2.45.1
      at getCallError (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/errors/getCallError.js:18:12)
      at call (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/actions/public/call.js:174:91)
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
      at async readContract (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/actions/public/readContract.js:54:26)
      at async queryERC8004Registry (webpack-internal:///(rsc)/./lib/erc8004/client.ts:142:37)
      at async getAgents (webpack-internal:///(rsc)/./lib/erc8004/client.ts:184:24)
      at async getFreshAgents (webpack-internal:///(rsc)/./app/api/agents/list/route.ts:28:18)
      at async GET (webpack-internal:///(rsc)/./app/api/agents/list/route.ts:76:16)
      at async /Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228
      at async eT.execute (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)
      at async eT.handle (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)
      at async doRender (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1366:42)
      at async cacheEntry.responseCache.get.routeKind (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1588:28)
      at async DevServer.renderToResponseWithComponentsImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1496:28)
      at async DevServer.renderPageComponent (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1924:24)
      at async DevServer.renderToResponseImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:1962:32)
      at async DevServer.pipeImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:922:25)
      at async NextNodeServer.handleCatchallRenderRequest (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/next-server.js:272:17)
      at async DevServer.handleRequestImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/base-server.js:818:17)
      at async /Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/dev/next-dev-server.js:339:20
      at async Span.traceAsyncFn (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/trace/trace.js:154:20)
      at async DevServer.handleRequest (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
      at async invokeRender (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/router-server.js:179:21)
      at async handleRequest (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/router-server.js:359:24)
      at async requestHandlerImpl (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/router-server.js:383:13)
      at async Server.requestListener (/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/next@14.2.35+6dbf9a050bc9aadb/node_modules/next/dist/server/lib/start-server.js:141:13) {
    cause: HttpRequestError: HTTP request failed.
    
    URL: https://sepolia.base.org/
    Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000002","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}
    
    Details: fetch failed
    Version: viem@2.45.1
        at Object.request (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/rpc/http.js:88:23)
        at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
        at async fn (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/clients/transports/http.js:56:25)
        at async request (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/clients/transports/http.js:60:45)
        at async delay.count.count (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/buildRequest.js:40:24)
        at async attemptRetry (webpack-internal:///(rsc)/../../node_modules/.bun/viem@2.45.1+a78afc2fa6b43151/node_modules/viem/_esm/utils/promise/withRetry.js:17:30) {
      details: 'fetch failed',
      docsPath: undefined,
      metaMessages: [Array],
      shortMessage: 'HTTP request failed.',
      version: '2.45.1',
      body: [Object],
      headers: undefined,
      status: undefined,
      url: 'https://sepolia.base.org/',
      [cause]: [TypeError]
    },
    details: 'fetch failed',
    docsPath: undefined,
    metaMessages: [
      'URL: https://sepolia.base.org/',
      'Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000002","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}',
      ' ',
      'Raw Call Arguments:',
      '  to:    0x8004A818BFB912233c491871b3d84c89A494BD9e\n' +
        '  data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000002'
    ],
    shortMessage: 'HTTP request failed.',
    version: '2.45.1'
  },
  details: 'fetch failed',
  docsPath: '/docs/contract/readContract',
  metaMessages: [
    'URL: https://sepolia.base.org/',
    'Request body: {"method":"eth_call","params":[{"data":"0xbde644fb0000000000000000000000000000000000000000000000000000000000000002","to":"0x8004A818BFB912233c491871b3d84c89A494BD9e"},"latest"]}',
    ' ',
    'Raw Call Arguments:',
    '  to:    0x8004A818BFB912233c491871b3d84c89A494BD9e\n' +
      '  data:  0xbde644fb0000000000000000000000000000000000000000000000000000000000000002',
    ' ',
    'Contract Call:',
    '  address:   0x8004A818BFB912233c491871b3d84c89A494BD9e\n' +
      '  function:  getMetadataURI(uint256 id)\n' +
      '  args:                    (2)'
  ],
  shortMessage: 'HTTP request failed.',
  version: '2.45.1',
  abi: [
    {
      inputs: [Array],
      name: 'getMetadataURI',
      outputs: [Array],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'totalAgents',
      outputs: [Array],
      stateMutability: 'view',
      type: 'function'
    }
  ],
  args: [ 2n ],
  contractAddress: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  formattedArgs: undefined,
  functionName: 'getMetadataURI',
  sender: undefined
}
[ERC-8004] Registry empty, using mock agents
[ERC-8004] Using mock agents
 GET /api/agents/list 200 in 22980ms
 ⚠ ../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
Module not found: Can't resolve '@react-native-async-storage/async-storage' in '/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es'

Import trace for requested module:
../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/metaMask.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/exports/index.js
./lib/wagmi.ts
./components/WalletProvider.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
Module not found: Can't resolve '@react-native-async-storage/async-storage' in '/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es'

Import trace for requested module:
../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/metaMask.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/exports/index.js
./lib/wagmi.ts
./components/WalletProvider.tsx
 ⚠ ../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
Module not found: Can't resolve '@react-native-async-storage/async-storage' in '/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es'

Import trace for requested module:
../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/metaMask.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/exports/index.js
./lib/wagmi.ts
./components/WalletProvider.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/GameComponent.tsx
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CityScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CityScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

./components/game/scenes/CouncilScene.ts
Attempted import error: 'phaser' does not contain a default export (imported as 'Phaser').

Import trace for requested module:
./components/game/scenes/CouncilScene.ts
./components/game/GameComponent.tsx
./components/game/PhaserGame.tsx
./components/AppPageContent.tsx

../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
Module not found: Can't resolve '@react-native-async-storage/async-storage' in '/Users/kryptos/Desktop/Projects/Agentropolis/node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es'

Import trace for requested module:
../../node_modules/.bun/@metamask+sdk@0.34.0+4789783d1fa00420/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/metaMask.js
../../node_modules/.bun/@wagmi+connectors@7.1.5+5c96e2be92f46ae5/node_modules/@wagmi/connectors/dist/esm/exports/index.js
./lib/wagmi.ts
./components/WalletProvider.tsx
[Council] Mock mode - returning mock deliberation
 POST /api/agents/council 200 in 2050ms
