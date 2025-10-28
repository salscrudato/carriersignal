#!/usr/bin/env node

/**
 * Generate Code Review File Script
 * Collects all code files with their full contents and paths into a single file
 * for external code review purposes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'CODE_REVIEW.md');

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
  content: string;
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

  if (CODE_EXTENSIONS.includes(ext)) {
    return true;
  }

  if (CODE_EXTENSIONS.includes(basename)) {
    return true;
  }

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
          const content = fs.readFileSync(filePath, 'utf-8');
          fileList.push({
            path: filePath,
            relativePath,
            content,
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

function getLanguageFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap: { [key: string]: string } = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.json': 'json',
    '.css': 'css',
    '.scss': 'scss',
    '.html': 'html',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'bash',
  };
  return languageMap[ext] || 'text';
}

function generateCodeReview(): void {
  console.log('🔍 Scanning for code files...');

  const files = walkDirectory(ROOT_DIR);

  // Sort by relative path
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  // Generate content
  let content = '# CarrierSignal - Code Review\n\n';
  content += `**Generated:** ${new Date().toISOString()}\n`;
  content += `**Total Files:** ${files.length}\n`;
  content += `**Total Size:** ${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}\n\n`;
  content += '---\n\n';
  content += '## Table of Contents\n\n';

  // Generate table of contents
  files.forEach((file, index) => {
    const anchor = file.relativePath.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    content += `${index + 1}. [${file.relativePath}](#${anchor})\n`;
  });

  content += '\n---\n\n';

  // Add file contents
  files.forEach((file, index) => {
    const anchor = file.relativePath.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const language = getLanguageFromExtension(file.relativePath);

    content += `## ${index + 1}. ${file.relativePath}\n\n`;
    content += `**Path:** \`${file.relativePath}\`\n`;
    content += `**Size:** ${formatFileSize(file.size)}\n`;
    content += `**Type:** ${language}\n\n`;
    content += '```' + language + '\n';
    content += file.content;
    if (!file.content.endsWith('\n')) {
      content += '\n';
    }
    content += '```\n\n';
    content += '---\n\n';
  });

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`✅ Code review file generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total files: ${files.length}`);
  console.log(`💾 Total size: ${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}`);
  console.log(`📄 Output file size: ${formatFileSize(fs.statSync(OUTPUT_FILE).size)}`);
}

// Run the script
try {
  generateCodeReview();
} catch (error) {
  console.error('❌ Error generating code review:', error);
  process.exit(1);
}

