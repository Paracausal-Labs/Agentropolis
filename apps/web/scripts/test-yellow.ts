import WebSocket from 'ws'
import { Wallet, keccak256, toUtf8Bytes, getBytes } from 'ethers'

const YELLOW_SANDBOX_URL = 'wss://clearnet-sandbox.yellow.com/ws'
const MOCK_MODE = process.env.YELLOW_MOCK === 'true'

async function testYellowConnection() {
  if (MOCK_MODE) {
    console.log('Running in mock mode')
    console.log('Yellow connection: MOCKED')
    return
  }

  console.log('Testing Yellow sandbox connection...')
  console.log(`Endpoint: ${YELLOW_SANDBOX_URL}`)

  const testWallet = Wallet.createRandom()
  console.log(`Test wallet: ${testWallet.address}`)

  return new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(YELLOW_SANDBOX_URL)
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Connection timeout after 10s'))
    }, 10000)

    ws.on('open', () => {
      console.log('Connected to Yellow sandbox')
      clearTimeout(timeout)
      
      const authPayload = {
        jsonrpc: '2.0',
        method: 'auth',
        params: {
          address: testWallet.address,
          timestamp: Date.now(),
        },
        id: 1,
      }

      const jsonStr = JSON.stringify(authPayload.params)
      const hash = keccak256(toUtf8Bytes(jsonStr))
      
      testWallet.signMessage(getBytes(hash)).then(signature => {
        const authRequest = {
          ...authPayload,
          params: {
            ...authPayload.params,
            signature,
          },
        }
        
        console.log('Sending auth request...')
        ws.send(JSON.stringify(authRequest))
      })
    })

    ws.on('message', (data) => {
      const response = JSON.parse(data.toString())
      console.log('Response:', JSON.stringify(response, null, 2))
      
      if (response.result) {
        console.log('Authentication successful')
      } else if (response.error) {
        console.log('Authentication failed:', response.error.message)
      }
      
      ws.close()
      resolve()
    })

    ws.on('error', (err) => {
      clearTimeout(timeout)
      console.log('WebSocket error:', err.message)
      reject(err)
    })

    ws.on('close', () => {
      console.log('Connection closed')
    })
  })
}

testYellowConnection()
  .then(() => {
    console.log('Test complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Test failed:', err.message)
    process.exit(1)
  })
