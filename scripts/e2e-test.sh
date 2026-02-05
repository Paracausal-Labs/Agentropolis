#!/bin/bash

# Agentropolis E2E Terminal Tests
# Run with: bash scripts/e2e-test.sh
# Requires: dev server running on localhost:3000

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Agentropolis E2E Terminal Tests"
echo "========================================"
echo ""

# Check if server is running
echo -n "Checking dev server... "
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Please start the dev server: cd apps/web && bun run dev"
    exit 1
fi

echo ""
echo "========================================" 
echo "  Test 1: Agent List API"
echo "========================================"

AGENT_LIST=$(curl -s "$BASE_URL/api/agents/list")
echo "Response: $AGENT_LIST"

if echo "$AGENT_LIST" | grep -q "agents"; then
    echo -e "${GREEN}✓ Agent list API working${NC}"
else
    echo -e "${RED}✗ Agent list API failed${NC}"
fi

echo ""
echo "========================================"
echo "  Test 2: Council Deliberation API"
echo "========================================"

COUNCIL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/agents/council" \
    -H "Content-Type: application/json" \
    -H "X-Guest-Session: test-session-$(date +%s)" \
    -d '{
        "userPrompt": "Should I swap 0.01 ETH for USDC?",
        "context": {
            "balance": "0.1 ETH",
            "preferredTokens": ["USDC", "WETH"],
            "riskLevel": "medium"
        },
        "deployedAgents": [
            {"id": "1", "name": "DCA Agent", "type": "dca"},
            {"id": "2", "name": "Momentum Agent", "type": "momentum"}
        ]
    }')

echo "Response preview: ${COUNCIL_RESPONSE:0:500}..."
echo ""

if echo "$COUNCIL_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Council deliberation API working${NC}"
    
    # Extract key fields
    if echo "$COUNCIL_RESPONSE" | grep -q "proposal"; then
        echo -e "${GREEN}✓ Proposal generated${NC}"
    fi
    
    if echo "$COUNCIL_RESPONSE" | grep -q "deliberation"; then
        echo -e "${GREEN}✓ Deliberation included${NC}"
    fi
else
    echo -e "${RED}✗ Council deliberation failed${NC}"
    echo "Full response: $COUNCIL_RESPONSE"
fi

echo ""
echo "========================================"
echo "  Test 3: ERC8004 Mock API"
echo "========================================"

ERC8004_RESPONSE=$(curl -s "$BASE_URL/api/agents/list?mock=true")
echo "Response: $ERC8004_RESPONSE"

if echo "$ERC8004_RESPONSE" | grep -q "agents"; then
    echo -e "${GREEN}✓ ERC8004 agent registry working${NC}"
else
    echo -e "${YELLOW}⚠ ERC8004 may need mock=true param${NC}"
fi

echo ""
echo "========================================"
echo "  Test Summary"
echo "========================================"
echo ""
echo "Terminal-testable components:"
echo "  - Agent List API: Check above"
echo "  - Council Deliberation: Check above"  
echo "  - ERC8004 Registry: Check above"
echo ""
echo -e "${YELLOW}Components requiring wallet (manual browser test):${NC}"
echo "  - Uniswap V4 swap execution"
echo "  - ENS text record writing"
echo "  - Yellow session (deposit/settle)"
echo ""
echo "========================================"
