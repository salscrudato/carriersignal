#!/bin/bash

# Script to generate a comprehensive code review file
# Collects all frontend and backend coding files into a single text file

OUTPUT_FILE="CODE_REVIEW_$(date +%Y%m%d_%H%M%S).txt"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Generating code review file: $OUTPUT_FILE"
echo "Repository root: $REPO_ROOT"

# Initialize output file with header
cat > "$OUTPUT_FILE" << 'EOF'
================================================================================
                    CARRIERSIGNAL - COMPREHENSIVE CODE REVIEW
================================================================================
Generated: $(date)
Repository: CarrierSignal P&C Insurance News App
Purpose: External code review of all frontend and backend code

================================================================================
                              TABLE OF CONTENTS
================================================================================

FRONTEND CODE:
- TypeScript/React Components
- Hooks and Utilities
- Design System and Styling
- Configuration Files

BACKEND CODE:
- Firebase Cloud Functions
- Utilities and Services
- Configuration Files

================================================================================
                            FRONTEND CODE FILES
================================================================================

EOF

# Function to add file to output
add_file_to_output() {
    local file_path="$1"
    local display_path="${file_path#$REPO_ROOT/}"
    
    if [ -f "$file_path" ]; then
        echo "" >> "$OUTPUT_FILE"
        echo "=================================================================================" >> "$OUTPUT_FILE"
        echo "FILE: $display_path" >> "$OUTPUT_FILE"
        echo "=================================================================================" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        cat "$file_path" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
}

# Frontend TypeScript/React files
echo "Collecting frontend files..." >&2

# Main app files
for file in "$REPO_ROOT"/src/*.tsx "$REPO_ROOT"/src/*.ts; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Components
for file in "$REPO_ROOT"/src/components/*.tsx "$REPO_ROOT"/src/components/*.ts; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Primitive components
for file in "$REPO_ROOT"/src/components/primitives/*.tsx "$REPO_ROOT"/src/components/primitives/*.ts; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Hooks
for file in "$REPO_ROOT"/src/hooks/*.ts "$REPO_ROOT"/src/hooks/*.tsx; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Utils
for file in "$REPO_ROOT"/src/utils/*.ts "$REPO_ROOT"/src/utils/*.tsx; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Design system
for file in "$REPO_ROOT"/src/design/*.ts "$REPO_ROOT"/src/design/*.tsx; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Frontend config files
for file in "$REPO_ROOT"/tsconfig.json "$REPO_ROOT"/vite.config.ts "$REPO_ROOT"/tailwind.config.js "$REPO_ROOT"/postcss.config.js; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Frontend CSS
for file in "$REPO_ROOT"/src/*.css; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Backend section header
cat >> "$OUTPUT_FILE" << 'EOF'

================================================================================
                            BACKEND CODE FILES
================================================================================

EOF

echo "Collecting backend files..." >&2

# Backend TypeScript files
for file in "$REPO_ROOT"/functions/src/*.ts; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Backend utils
for file in "$REPO_ROOT"/functions/src/utils/*.ts; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Backend services
for file in "$REPO_ROOT"/functions/src/services/*.ts; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Backend config files
for file in "$REPO_ROOT"/functions/tsconfig.json "$REPO_ROOT"/functions/.eslintrc.js "$REPO_ROOT"/firebase.json; do
    [ -f "$file" ] && add_file_to_output "$file"
done

# Add footer
cat >> "$OUTPUT_FILE" << 'EOF'

================================================================================
                              END OF CODE REVIEW
================================================================================
Generated for external code review
All code files from frontend (src/) and backend (functions/src/) included
================================================================================
EOF

echo "✅ Code review file generated successfully!"
echo "📄 Output file: $OUTPUT_FILE"
echo "📊 File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo "📝 Total lines: $(wc -l < "$OUTPUT_FILE")"

