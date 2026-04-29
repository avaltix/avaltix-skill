#!/usr/bin/env node

import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const configPath = `${process.env.HOME || process.env.USERPROFILE || '.'}/.config/avaltix-skill/config.json`;

async function promptHidden(label) {
  if (!input.isTTY) {
    let value = '';
    for await (const chunk of input) {
      value += chunk;
    }
    return value.trim();
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const wasRaw = input.isRaw;

    function cleanup() {
      input.off('data', onData);
      input.setRawMode(wasRaw);
      input.pause();
    }

    function onData(chunk) {
      const char = String(chunk);
      if (char === '\u0003') {
        cleanup();
        output.write('\n');
        reject(new Error('Aborted'));
        return;
      }
      if (char === '\r' || char === '\n') {
        cleanup();
        output.write('\n');
        resolve(value.trim());
        return;
      }
      if (char === '\u007f' || char === '\b') {
        value = value.slice(0, -1);
        return;
      }
      if (char >= ' ') {
        value += char;
      }
    }

    output.write(label);
    input.setEncoding('utf8');
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}

const rl = createInterface({ input, output });

try {
  const baseUrl = (await rl.question('Avaltix base URL [https://avaltix.io]: ')).trim() || 'https://avaltix.io';
  rl.close();

  const apiKey = await promptHidden('Avaltix Agent API key: ');
  if (!/^avx_agent_[a-f0-9]{64}$/i.test(apiKey)) {
    throw new Error('Invalid Avaltix Agent API key format. Expected avx_agent_ followed by 64 hex chars.');
  }

  const payload = `${JSON.stringify({ baseUrl: baseUrl.replace(/\/+$/, ''), apiKey }, null, 2)}\n`;
  await mkdir(dirname(configPath), { recursive: true, mode: 0o700 });
  await writeFile(configPath, payload, { mode: 0o600 });
  await chmod(configPath, 0o600);

  console.log(`[avaltix] configuration saved to ${configPath}`);
  console.log('[avaltix] run `node scripts/avaltix-api.mjs snapshot` to test access');
} catch (error) {
  rl.close();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[avaltix] ${message.replace(/avx_agent_[a-f0-9]{64}/gi, 'avx_agent_[redacted]')}`);
  process.exit(1);
}