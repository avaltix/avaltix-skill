---
name: avaltix
description: "Use when: the user asks OpenClaw or Claude Code to analyze markets with Avaltix, inspect AI trading opportunities, search assets, read macro snapshots, explain indicators, or prepare a market brief from the Avaltix Agent API. Read-only only: never execute trades, change accounts, manage billing, call admin endpoints, or use MT bridge endpoints. Requires AVALTIX_BASE_URL and AVALTIX_API_KEY."
argument-hint: "market-brief XAUUSD 1h | probabilistic-forecast BTC-USD 4h | opportunity-scan AAPL,MSFT,NVDA"
---

# Avaltix

## Mission

Use the Avaltix Agent API v1 as a read-only market intelligence source for OpenClaw and Claude Code. The skill turns natural-language requests into safe API reads, then explains the result to the user in plain language.

## When To Use

| User asks for | Action |
|---|---|
| "analiza XAUUSD" | Run `node scripts/avaltix-api.mjs analyze XAUUSD 1h` |
| "market brief de XAUUSD" | Run `node scripts/avaltix-api.mjs market-brief XAUUSD 1h` |
| "forecast probabilístico de BTC" | Run `node scripts/avaltix-api.mjs probabilistic-forecast BTC-USD 4h` |
| "contexto cross-asset de EUR/USD" | Run `node scripts/avaltix-api.mjs cross-asset-context EUR/USD 1h` |
| "mejores oportunidades" | Run `node scripts/avaltix-api.mjs opportunities 3` |
| "escanea mi watchlist" | Run `node scripts/avaltix-api.mjs opportunity-scan AAPL,MSFT,NVDA 1h` |
| "memo institucional de NVDA" | Run `node scripts/avaltix-api.mjs research-memo NVDA 1h` |
| "snapshot de mercado" | Run `node scripts/avaltix-api.mjs snapshot` |
| "busca AAPL/BTC/EURUSD" | Run `node scripts/avaltix-api.mjs search <query>` |
| "indicadores de BTC 1h" | Run `node scripts/avaltix-api.mjs indicators BTC 1h` |
| "macro" | Run `node scripts/avaltix-api.mjs macro` |
| "calendario de AAPL" | Run `node scripts/avaltix-api.mjs calendar AAPL` |
| "eventos FOMC / earnings" | Run `node scripts/avaltix-api.mjs events economic` or `events earnings AAPL` |

## Rules

1. Read-only only. Do not call admin, payments, account mutation, support/chatbot, provider toggle, sync, retry, settle, MT bridge, or trading execution endpoints.
2. Use only `node scripts/avaltix-api.mjs ...`; the client sends commands through the read-only gateway in `references/api-v1.md`.
3. Do not expose `AVALTIX_API_KEY` in output, logs, examples, or error messages.
4. Do not present Avaltix output as financial advice or guaranteed performance.
5. If an endpoint returns missing cache or unavailable data, say what was unavailable and suggest the closest read-only alternative.
6. Prefer concise summaries: bias, confidence, drivers, risks, data timestamp, and the endpoint used.
## Configuration

Run `npm run configure` from the installed skill directory to store local configuration in `~/.config/avaltix-skill/config.json` with user-only permissions. Environment variables override local config when present.

| Variable | Required | Description |
|---|---:|---|
| `AVALTIX_BASE_URL` | no | Defaults to `https://avaltix.io`. |
| `AVALTIX_API_KEY` | yes | Agent API Bearer key with scopes. |

## Commands

```bash
node scripts/avaltix-api.mjs snapshot
node scripts/avaltix-api.mjs search AAPL
node scripts/avaltix-api.mjs indicators XAUUSD 1h
node scripts/avaltix-api.mjs opportunities 3
node scripts/avaltix-api.mjs macro
node scripts/avaltix-api.mjs calendar AAPL
node scripts/avaltix-api.mjs events earnings AAPL
node scripts/avaltix-api.mjs analyze XAUUSD 1h
node scripts/avaltix-api.mjs market-brief XAUUSD 1h
node scripts/avaltix-api.mjs probabilistic-forecast BTC-USD 4h
node scripts/avaltix-api.mjs cross-asset-context EUR/USD 1h
node scripts/avaltix-api.mjs opportunity-scan AAPL,MSFT,NVDA 1h
node scripts/avaltix-api.mjs research-memo NVDA 1h
npm run self-test
```

## Output Style

Do not dump raw JSON unless the user asks. Present:

- What was checked.
- Main signal or state.
- Supporting drivers.
- Cache/data timestamp when present.
- Any limits or missing data.

Use `templates/market-brief.md` when the user asks for a reusable brief.