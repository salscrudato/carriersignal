#!/bin/bash

# CarrierSignal Complete Code Review Generator
# Consolidates all frontend and backend code into a single file
# Usage: ./generate-code-review.sh

set -e

OUTPUT_FILE="COMPLETE_CODE_REVIEW.md"
TEMP_FILE=$(mktemp)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Generating Complete Code Review...${NC}"
echo ""

# Create header
cat > "$TEMP_FILE" << 'EOF'
# CarrierSignal - Complete Code Review
## Full Codebase Consolidation for External Review

**Generated:** $(date -u +'%Y-%m-%d %H:%M:%S UTC')
**Project:** CarrierSignal - AI-Curated Insurance News Web Application
**Repository:** https://github.com/salscrudato/carriersignal

---

## Table of Contents

### Frontend Code
- React Components
- Hooks
- Utilities
- Configuration
- Styles

### Backend Code
- Cloud Functions
- Agents & AI
- Utilities

---

EOF

# Function to add file to review
add_file_to_review() {
  local file_path=$1
  local display_name=$2
  
  if [ -f "$file_path" ]; then
    echo "" >> "$TEMP_FILE"
    echo "## File: $display_name" >> "$TEMP_FILE"
    echo "**Path:** \`$file_path\`" >> "$TEMP_FILE"
    echo "**Size:** $(wc -c < "$file_path") bytes" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo '```' >> "$TEMP_FILE"
    cat "$file_path" >> "$TEMP_FILE"
    echo '```' >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
  fi
}

# Frontend - Main App
echo -e "${BLUE}Processing Frontend Code...${NC}"
add_file_to_review "src/App.tsx" "src/App.tsx - Main Application Component"
add_file_to_review "src/firebase.ts" "src/firebase.ts - Firebase Configuration"
add_file_to_review "src/config.ts" "src/config.ts - Application Configuration"
add_file_to_review "src/index.css" "src/index.css - Global Styles & Design System"

# Frontend - Components
echo -e "${BLUE}Processing Components...${NC}"
for component in src/components/*.tsx; do
  if [ -f "$component" ]; then
    add_file_to_review "$component" "$component"
  fi
done

# Frontend - Hooks
echo -e "${BLUE}Processing Hooks...${NC}"
for hook in src/hooks/*.ts; do
  if [ -f "$hook" ]; then
    add_file_to_review "$hook" "$hook"
  fi
done

# Frontend - Utils
echo -e "${BLUE}Processing Frontend Utilities...${NC}"
for util in src/utils/*.ts; do
  if [ -f "$util" ]; then
    add_file_to_review "$util" "$util"
  fi
done

# Frontend - Types
echo -e "${BLUE}Processing Type Definitions...${NC}"
for type_file in src/types/*.ts; do
  if [ -f "$type_file" ]; then
    add_file_to_review "$type_file" "$type_file"
  fi
done

# Frontend - Constants
echo -e "${BLUE}Processing Constants...${NC}"
for const_file in src/constants/*.ts; do
  if [ -f "$const_file" ]; then
    add_file_to_review "$const_file" "$const_file"
  fi
done

# Backend - Cloud Functions
echo -e "${BLUE}Processing Backend Code...${NC}"
add_file_to_review "functions/src/index.ts" "functions/src/index.ts - Cloud Functions Entry Point"
add_file_to_review "functions/src/agents.ts" "functions/src/agents.ts - AI Agents & Summarization"
add_file_to_review "functions/src/utils.ts" "functions/src/utils.ts - Backend Utilities"

# Configuration Files
echo -e "${BLUE}Processing Configuration Files...${NC}"
add_file_to_review "package.json" "package.json - Frontend Dependencies"
add_file_to_review "functions/package.json" "functions/package.json - Backend Dependencies"
add_file_to_review "tsconfig.json" "tsconfig.json - TypeScript Configuration"
add_file_to_review "firebase.json" "firebase.json - Firebase Configuration"
add_file_to_review "vite.config.ts" "vite.config.ts - Vite Build Configuration"

# Move temp file to final location
mv "$TEMP_FILE" "$OUTPUT_FILE"

echo -e "${GREEN}✅ Code review generated successfully!${NC}"
echo -e "${GREEN}📄 Output file: $OUTPUT_FILE${NC}"
echo ""
echo "File Statistics:"
echo "  Lines: $(wc -l < "$OUTPUT_FILE")"
echo "  Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo -e "${BLUE}Ready for external code review!${NC}"

