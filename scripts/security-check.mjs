#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ignoredNames = new Set(['.git', 'node_modules']);
const forbiddenNames = new Set(['.env']);
const secretPatterns = [
  /avx_agent_[a-f0-9]{64}/i,
  /sk_(live|test)_[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |OPENSSH |EC |)?PRIVATE KEY-----/
];

async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignoredNames.has(entry.name)) {
      continue;
    }

    if (forbiddenNames.has(entry.name)) {
      throw new Error(`forbidden publish artifact found: ${relative(root, join(dir, entry.name))}`);
    }

    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path, files);
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

const files = await walk(root);
for (const file of files) {
  const info = await stat(file);
  if (info.size > 1024 * 1024) {
    continue;
  }
  const text = await readFile(file, 'utf8').catch(() => '');
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      throw new Error(`possible secret found in ${relative(root, file)}`);
    }
  }
}

console.log('[avaltix] security-check ok');