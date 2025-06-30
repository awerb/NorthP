#!/bin/bash
# API Testing Script - Verify all endpoints are working

echo "🔍 NorthPoint Trial Law API Health Check"
echo "========================================"

BASE_URL="http://localhost:3002"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local description=$3
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
        status_code="${response: -3}"
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
        status_code="${response: -3}"
    fi
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($status_code)"
    else
        echo -e "${RED}✗ FAIL${NC} ($status_code)"
        echo "Response: ${response%???}" # Remove last 3 chars (status code)
    fi
}

echo
echo "🏥 Health & Status Endpoints"
echo "----------------------------"
test_endpoint "/health/status" "GET" "System Health Status"
test_endpoint "/keywords/status" "GET" "Keyword Tracking Status"

echo
echo "🔑 Keyword Monitoring"
echo "---------------------"
test_endpoint "/keywords/trends" "GET" "Keyword Trends"
test_endpoint "/keywords/metrics" "GET" "Keyword Metrics"

echo
echo "📰 News & Content"
echo "-----------------"
test_endpoint "/news/stats" "GET" "News Statistics"
test_endpoint "/news/all" "GET" "All News Articles"

echo
echo "🤝 Referral System"
echo "------------------"
test_endpoint "/referral/outbox" "GET" "Referral Outbox"

echo
echo "🤖 AI Services"
echo "--------------"
test_endpoint "/ai/history" "GET" "AI Ranking History"

echo
echo "💪 Union Strong"
echo "---------------"
test_endpoint "/union/dashboard" "GET" "Union Dashboard"
test_endpoint "/union/stats" "GET" "Union Statistics"

echo
echo "🔄 Update Operations (POST)"
echo "---------------------------"
test_endpoint "/keywords/update" "POST" "Keyword Data Update"

echo
echo "========================================"
echo "🎉 API Health Check Complete!"
echo
