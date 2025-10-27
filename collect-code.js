#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source directories and file patterns
const sourcePatterns = [
  // Frontend
  { dir: 'src', extensions: ['.tsx', '.ts'] },
  // Backend
  { dir: 'functions/src', extensions: ['.ts'] },
];

// Directories to exclude
const excludeDirs = new Set(['node_modules', 'dist', '.git', 'lib']);

// Collect all files
function collectFiles(baseDir, patterns) {
  const files = [];

  function walkDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (excludeDirs.has(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile()) {
          // Check if file matches any pattern
          for (const pattern of patterns) {
            if (pattern.extensions.some(ext => entry.name.endsWith(ext))) {
              files.push(fullPath);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dir}:`, err.message);
    }
  }

  for (const pattern of patterns) {
    const patternDir = path.join(baseDir, pattern.dir);
    if (fs.existsSync(patternDir)) {
      walkDir(patternDir);
    }
  }

  return files.sort();
}

// Main execution
const baseDir = process.cwd();
const files = collectFiles(baseDir, sourcePatterns);

if (files.length === 0) {
  console.error('No source files found');
  process.exit(1);
}

// Create output content
let output = `# CarrierSignal - Complete Code Review
# Generated: ${new Date().toISOString()}
# Total Files: ${files.length}

================================================================================
TABLE OF CONTENTS
================================================================================

`;

// Add table of contents
files.forEach((file, index) => {
  const relativePath = path.relative(baseDir, file);
  output += `${index + 1}. ${relativePath}\n`;
});

output += `\n${'='.repeat(80)}\nFULL SOURCE CODE\n${'='.repeat(80)}\n\n`;

// Add file contents
files.forEach((file, index) => {
  const relativePath = path.relative(baseDir, file);
  const content = fs.readFileSync(file, 'utf-8');

  output += `\n${'='.repeat(80)}\n`;
  output += `FILE ${index + 1}/${files.length}: ${relativePath}\n`;
  output += `${'='.repeat(80)}\n\n`;
  output += content;
  output += '\n\n';
});

// Write output file
const outputFile = path.join(baseDir, 'CODE_REVIEW.txt');
fs.writeFileSync(outputFile, output, 'utf-8');

console.log(`✓ Code review file created: ${outputFile}`);
console.log(`✓ Total files collected: ${files.length}`);
console.log(`✓ Output file size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

