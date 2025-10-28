#!/bin/bash

# CarrierSignal Smoke Test Script
# Verifies that all components are working correctly before deployment

set -e

echo "🚀 CarrierSignal Smoke Test Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
  local test_name=$1
  local test_command=$2
  
  echo -n "Testing: $test_name... "
  
  if eval "$test_command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
  fi
}

# Test 1: Frontend Build
echo -e "${YELLOW}Frontend Tests${NC}"
run_test "Frontend TypeScript compilation" "cd /Users/salscrudato/Projects/carriersignal && npm run build"
run_test "Frontend build output exists" "test -f /Users/salscrudato/Projects/carriersignal/dist/index.html"

echo ""

# Test 2: Backend Build
echo -e "${YELLOW}Backend Tests${NC}"
run_test "Backend TypeScript compilation" "cd /Users/salscrudato/Projects/carriersignal/functions && npm run build"
run_test "Backend build output exists" "test -f /Users/salscrudato/Projects/carriersignal/functions/lib/index.js"

echo ""

# Test 3: Unit Tests
echo -e "${YELLOW}Unit Tests${NC}"
run_test "Backend unit tests" "cd /Users/salscrudato/Projects/carriersignal/functions && npm test -- --passWithNoTests"

echo ""

# Test 4: Configuration Files
echo -e "${YELLOW}Configuration Tests${NC}"
run_test "Firestore rules exist" "test -f /Users/salscrudato/Projects/carriersignal/firestore.rules"
run_test "Frontend config exists" "test -f /Users/salscrudato/Projects/carriersignal/src/config.ts"
run_test "Link validator exists" "test -f /Users/salscrudato/Projects/carriersignal/src/utils/linkValidator.ts"

echo ""

# Test 5: Key Files Exist
echo -e "${YELLOW}File Structure Tests${NC}"
run_test "App.tsx exists" "test -f /Users/salscrudato/Projects/carriersignal/src/App.tsx"
run_test "SearchFirst.tsx exists" "test -f /Users/salscrudato/Projects/carriersignal/src/components/SearchFirst.tsx"
run_test "BriefPanel.tsx exists" "test -f /Users/salscrudato/Projects/carriersignal/src/components/BriefPanel.tsx"
run_test "Cloud Functions index.ts exists" "test -f /Users/salscrudato/Projects/carriersignal/functions/src/index.ts"
run_test "Cloud Functions agents.ts exists" "test -f /Users/salscrudato/Projects/carriersignal/functions/src/agents.ts"
run_test "Cloud Functions utils.ts exists" "test -f /Users/salscrudato/Projects/carriersignal/functions/src/utils.ts"

echo ""

# Test 6: Dependencies
echo -e "${YELLOW}Dependency Tests${NC}"
run_test "Frontend dependencies installed" "test -d /Users/salscrudato/Projects/carriersignal/node_modules"
run_test "Backend dependencies installed" "test -d /Users/salscrudato/Projects/carriersignal/functions/node_modules"

echo ""

# Summary
echo "=================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi

