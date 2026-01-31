import { getAgents } from '../lib/erc8004'

async function testERC8004() {
  const useMock = process.env.ERC8004_MOCK === 'true'

  if (useMock) {
    console.log('Using mock agents')
  }

  try {
    const agents = await getAgents({ mockMode: useMock })

    console.log(`Found ${agents.length} agents`)

    agents.forEach((agent) => {
      console.log(`\n  Agent: ${agent.name}`)
      console.log(`  Description: ${agent.description}`)
      console.log(`  Strategy: ${agent.strategy}`)
      console.log(`  Risk Tolerance: ${agent.riskTolerance}`)
      console.log(`  Image: ${agent.image}`)
    })
  } catch (error: any) {
    console.error('Test failed:', error.message)
    process.exit(1)
  }
}

testERC8004()
  .then(() => {
    console.log('\nTest complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Test error:', err.message)
    process.exit(1)
  })
