# Use With OpenClaw And Claude Code

This repository is a Claude/OpenClaw-compatible skill package. Install it locally, configure an Avaltix Agent API key, then ask the agent for one of the star workflows.

## OpenClaw

```bash
git clone https://github.com/avaltix/avaltix-skill.git
cd avaltix-skill
bash install.sh
```

OpenClaw-compatible installers can import `~/.claude/skills/avaltix` into their own skill folder during setup/update.

## Claude Code

After install, ask for:

- `market brief de XAUUSD 1h`
- `forecast probabilístico de BTC-USD 4h`
- `contexto cross-asset de EUR/USD`
- `escanea AAPL,MSFT,NVDA`
- `memo institucional de NVDA`

The agent should call only `node scripts/avaltix-api.mjs ...` and should never call admin, billing, account mutation, trading execution, MetaTrader bridge, provider toggle, worker, retry, sync, or settlement endpoints.