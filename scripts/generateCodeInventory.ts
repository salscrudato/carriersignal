#!/usr/bin/env node

/**
 * Generate Code Inventory Script
 * Collects all code files and their full paths into a single text file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'CODE_INVENTORY.txt');
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
  '.pytest_cache',
  '.env',
  '.env.local',
  '.env.*.local',
];

const CODE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.yml',
  '.yaml',
  '.env',
  '.env.example',
  '.gitignore',
  '.eslintrc',
  '.prettierrc',
];

interface FileInfo {
  path: string;
  relativePath: string;
  size: number;
}

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  return parts.some(part => IGNORE_DIRS.includes(part));
}

function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

function isCodeFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  const basename = path.basename(filePath);

  // Check if extension matches
  if (CODE_EXTENSIONS.includes(ext)) {
    return true;
  }

  // Check if filename matches (for files without extensions)
  if (CODE_EXTENSIONS.includes(basename)) {
    return true;
  }

  // Check for dotfiles that are code-related
  if (basename.startsWith('.') && CODE_EXTENSIONS.some(e => basename.endsWith(e))) {
    return true;
  }

  return false;
}

function walkDirectory(dir: string, fileList: FileInfo[] = []): FileInfo[] {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);

      if (shouldIgnore(filePath)) {
        return;
      }

      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDirectory(filePath, fileList);
        } else if (isCodeFile(filePath)) {
          const relativePath = path.relative(ROOT_DIR, filePath);
          fileList.push({
            path: filePath,
            relativePath,
            size: stat.size,
          });
        }
      } catch (err) {
        console.warn(`Warning: Could not process ${filePath}:`, err);
      }
    });
  } catch (err) {
    console.warn(`Warning: Could not read directory ${dir}:`, err);
  }

  return fileList;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function generateInventory(): void {
  console.log('🔍 Scanning for code files...');

  const files = walkDirectory(ROOT_DIR);

  // Sort by relative path
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  // Generate content
  let content = '# CarrierSignal - Code Inventory\n';
  content += `Generated: ${new Date().toISOString()}\n`;
  content += `Total Files: ${files.length}\n`;
  content += `Total Size: ${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}\n`;
  content += '\n' + '='.repeat(80) + '\n\n';

  // Group by directory
  const groupedByDir: { [key: string]: FileInfo[] } = {};

  files.forEach(file => {
    const dir = path.dirname(file.relativePath);
    if (!groupedByDir[dir]) {
      groupedByDir[dir] = [];
    }
    groupedByDir[dir].push(file);
  });

  // Write grouped files
  Object.keys(groupedByDir)
    .sort()
    .forEach(dir => {
      content += `\n📁 ${dir}\n`;
      content += '-'.repeat(80) + '\n';

      groupedByDir[dir].forEach(file => {
        const fileName = path.basename(file.relativePath);
        const fileSize = formatFileSize(file.size);
        content += `  📄 ${file.relativePath} (${fileSize})\n`;
      });
    });

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`✅ Code inventory generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total files: ${files.length}`);
  console.log(`💾 Total size: ${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}`);
}

// Run the script
try {
  generateInventory();
} catch (error) {
  console.error('❌ Error generating inventory:', error);
  process.exit(1);
}

