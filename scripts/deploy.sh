#!/bin/bash

# CarrierSignal Deployment Script
# 1. Generate code inventory
# 2. Deploy to Firebase
# 3. Push to GitHub

set -e  # Exit on error

echo "🚀 CarrierSignal Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${BLUE}📍 Working directory: $ROOT_DIR${NC}"
echo ""

# Step 1: Generate Code Inventory
echo -e "${BLUE}Step 1: Generating Code Inventory...${NC}"
if npx ts-node scripts/generateCodeInventory.ts; then
  echo -e "${GREEN}✅ Code inventory generated successfully${NC}"
else
  echo -e "${RED}❌ Failed to generate code inventory${NC}"
  exit 1
fi
echo ""

# Step 2: Build the application
echo -e "${BLUE}Step 2: Building application...${NC}"
if npm run build; then
  echo -e "${GREEN}✅ Build completed successfully${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
echo ""

# Step 3: Deploy to Firebase
echo -e "${BLUE}Step 3: Deploying to Firebase...${NC}"
if firebase deploy --only hosting,functions; then
  echo -e "${GREEN}✅ Firebase deployment completed successfully${NC}"
else
  echo -e "${RED}❌ Firebase deployment failed${NC}"
  exit 1
fi
echo ""

# Step 4: Commit and push to GitHub
echo -e "${BLUE}Step 4: Committing and pushing to GitHub...${NC}"

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
  echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
  # Add all changes
  git add -A
  
  # Create commit message
  COMMIT_MSG="chore: update code inventory and deploy

- Generated updated code inventory
- Built application
- Deployed to Firebase
- Timestamp: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
  
  # Commit
  if git commit -m "$COMMIT_MSG"; then
    echo -e "${GREEN}✅ Changes committed${NC}"
  else
    echo -e "${RED}❌ Failed to commit changes${NC}"
    exit 1
  fi
fi

# Push to GitHub
if git push origin main; then
  echo -e "${GREEN}✅ Pushed to GitHub successfully${NC}"
else
  echo -e "${RED}❌ Failed to push to GitHub${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  ✅ Code inventory generated"
echo "  ✅ Application built"
echo "  ✅ Deployed to Firebase"
echo "  ✅ Pushed to GitHub"
echo ""

