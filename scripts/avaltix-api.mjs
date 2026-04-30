#!/usr/bin/env node

import { COMMANDS, redactSecrets, runAvaltixCommand } from '../lib/client.mjs';

function usage() {
  console.error(`Usage:
  avaltix-api snapshot
  avaltix-api search <query> [type]
  avaltix-api indicators <symbol> [timeframe]
  avaltix-api opportunities [limit]
  avaltix-api macro
  avaltix-api calendar <symbol> [user_tz]
  avaltix-api events [economic|earnings|dividends|crypto|all] [symbol] [days]
  avaltix-api analyze <symbol> [timeframe]

Star workflows:
  avaltix-api market-brief <symbol> [timeframe]
  avaltix-api probabilistic-forecast <symbol> [timeframe]
  avaltix-api cross-asset-context <symbol> [timeframe]
  avaltix-api opportunity-scan [AAPL,MSFT,EUR/USD] [timeframe]
  avaltix-api research-memo <symbol> [timeframe]`);
}

const [command, ...args] = process.argv.slice(2);

if (!command || !COMMANDS.has(command)) {
  usage();
  process.exit(2);
}

try {
  const payload = await runAvaltixCommand(command, args);
  console.log(JSON.stringify(payload, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[avaltix] ${redactSecrets(message)}`);
  process.exit(1);
}