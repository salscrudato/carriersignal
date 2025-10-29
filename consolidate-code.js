#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = process.cwd();
const OUTPUT_FILE = path.join(ROOT_DIR, 'CODE_REVIEW.txt');
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  '.git',
  '.next',
  'build',
  'coverage',
  '.vscode',
  '.idea',
];

const INCLUDE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.scss',
  '.json',
  '.html',
  '.md',
  '.yml',
  '.yaml',
];

// Specific files to include
const INCLUDE_FILES = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'firebase.json',
  'firestore.rules',
  'eslint.config.js',
];

let output = '';
let fileCount = 0;

function shouldIncludeFile(filePath) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);
  
  return (
    INCLUDE_EXTENSIONS.includes(ext) ||
    INCLUDE_FILES.includes(basename)
  );
}

function shouldExcludeDir(dirPath) {
  const parts = dirPath.split(path.sep);
  return parts.some(part => EXCLUDE_DIRS.includes(part));
}

function walkDir(dir, relativePath = '') {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (shouldExcludeDir(fullPath)) {
        return;
      }
      
      if (entry.isDirectory()) {
        walkDir(fullPath, relPath);
      } else if (shouldIncludeFile(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          output += `\n${'='.repeat(80)}\n`;
          output += `FILE: ${relPath}\n`;
          output += `${'='.repeat(80)}\n\n`;
          output += content;
          output += '\n\n';
          fileCount++;
        } catch (err) {
          console.error(`Error reading file ${fullPath}:`, err.message);
        }
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
}

// Start consolidation
console.log('Starting code consolidation...');
console.log(`Root directory: ${ROOT_DIR}`);

output += `CODE REVIEW CONSOLIDATION\n`;
output += `Generated: ${new Date().toISOString()}\n`;
output += `Repository: ${ROOT_DIR}\n`;
output += `${'='.repeat(80)}\n\n`;

walkDir(ROOT_DIR);

// Write output file
try {
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(`✓ Successfully created ${OUTPUT_FILE}`);
  console.log(`✓ Total files included: ${fileCount}`);
  console.log(`✓ Output file size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
} catch (err) {
  console.error(`Error writing output file: ${err.message}`);
  process.exit(1);
}

