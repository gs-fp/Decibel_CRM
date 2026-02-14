#!/usr/bin/env node
/**
 * Generates decibel_crm_repo_compressed.xml with repo structure and file contents
 * for LLM context. Excludes node_modules, .git, dist, etc. Truncates very large files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'decibel_crm_repo_compressed.xml');
const MAX_LINES_PER_FILE = 600;
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', '.nx', 'coverage', 'storybook-static',
  '.cache', '.next', 'build', '.turbo', '.vercel', '.swc', '.pnp.',
  'logs', '.nyc_output', 'test-results', '.react-email', '.notes',
]);
const INCLUDE_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.mdc', '.graphql', '.gql',
  '.yaml', '.yml', '.css', '.scss', '.html', '.sql', '.sh',
  '.env.example', '.cursorignore', '.gitignore', '.eslintrc', '.prettierrc',
]);
const SKIP_PATTERNS = [
  /\.tsbuildinfo$/,
  /\.eslintcache$/,
  /^\.env$/,
  /\/\.env$/,
  /node_modules/,
  /\.nx\//,
  /dist\//,
  /coverage\//,
  /storybook-static\//,
  /\.next\//,
  /\.pnp\./,
  /dump\.rdb$/,
  /\.tinyb$/,
];

function shouldSkip(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }
  const parts = normalized.split('/');
  for (const part of parts) {
    if (SKIP_DIRS.has(part)) return true;
    if (part.startsWith('.') && part !== '.cursor' && part !== '.cursorignore' && part !== '.gitignore') return true;
  }
  return false;
}

function hasIncludedExt(filePath) {
  const base = path.basename(filePath);
  for (const ext of INCLUDE_EXT) {
    if (ext.startsWith('.')) {
      if (base.endsWith(ext) || base === ext.slice(1)) return true;
    } else if (base === ext) return true;
  }
  return /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdc|graphql|gql|yaml|yml|css|scss|html|sql|sh)$/i.test(filePath);
}

function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getFiles(dir, relativeDir = '') {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(path.join(dir, relativeDir), { withFileTypes: true });
  } catch (error) {
    return results;
  }
  for (const entry of entries) {
    const rel = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (shouldSkip(rel)) continue;
    const full = path.join(dir, rel);
    if (entry.isDirectory()) {
      results.push(...getFiles(dir, rel));
    } else if (entry.isFile() && hasIncludedExt(entry.name)) {
      results.push(rel);
    }
  }
  return results.sort();
}

function readFileContent(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const truncated = lines.length > MAX_LINES_PER_FILE;
    const truncatedLines = lines.length - MAX_LINES_PER_FILE;
    const content = truncated
      ? lines.slice(0, MAX_LINES_PER_FILE).join('\n') + `\n\n... [truncated: ${truncatedLines} more lines]\n`
      : raw;
    return { content, truncated, lineCount: lines.length };
  } catch {
    return { content: '[read error]', truncated: false, lineCount: 0 };
  }
}

function main() {
  const files = getFiles(ROOT);
  const out = fs.createWriteStream(OUT_PATH, { encoding: 'utf8' });

  out.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  out.write('<repo name="decibel_crm" root=".">\n');
  out.write(`<meta fileCount="${files.length}" maxLinesPerFile="${MAX_LINES_PER_FILE}" purpose="LLM context"/>\n`);

  for (const rel of files) {
    const fullPath = path.join(ROOT, rel);
    const { content, truncated, lineCount } = readFileContent(fullPath);
    const escapedPath = escapeXml(rel);
    const ext = path.extname(rel).slice(1) || 'none';
    const truncatedAttr = truncated ? ` truncated="true" originalLines="${lineCount}"` : '';
    out.write(`<file path="${escapedPath}" ext="${escapeXml(ext)}"${truncatedAttr}>\n`);
    out.write('<![CDATA[');
    out.write(content.replace(/]]>/g, ']]]]><![CDATA[>'));
    out.write(']]>\n</file>\n');
  }

  out.write('</repo>\n');
  out.end();

  return new Promise((resolve, reject) => {
    out.on('finish', () => {
      const stats = fs.statSync(OUT_PATH);
      console.log(`Wrote ${OUT_PATH}`);
      console.log(`Files included: ${files.length}`);
      console.log(`Output size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });
    out.on('error', reject);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
