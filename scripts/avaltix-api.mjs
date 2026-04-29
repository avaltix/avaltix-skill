#!/usr/bin/env node

import { COMMANDS, avaltixRequest, endpointForCommand, redactSecrets } from '../lib/client.mjs';

function usage() {
  console.error(`Usage:
  avaltix-api snapshot
  avaltix-api search <query> [type]
  avaltix-api indicators <symbol> [timeframe]
  avaltix-api opportunities [limit]
  avaltix-api macro
  avaltix-api calendar <symbol> [user_tz]
  avaltix-api events [economic|earnings|dividends|crypto|all] [symbol] [days]
  avaltix-api analyze <symbol> [timeframe]`);
}

const [command, ...args] = process.argv.slice(2);

if (!command || !COMMANDS.has(command)) {
  usage();
  process.exit(2);
}

try {
  const request = endpointForCommand(command, args);
  const payload = await avaltixRequest(request.path, request);
  console.log(JSON.stringify(payload, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[avaltix] ${redactSecrets(message)}`);
  process.exit(1);
}