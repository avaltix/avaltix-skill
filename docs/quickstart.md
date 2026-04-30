# Quickstart

## Install From GitHub

```bash
git clone https://github.com/avaltix/avaltix-skill.git
cd avaltix-skill
bash install.sh
```

## Configure Access

Create an Agent API key from Avaltix account settings, then run:

```bash
npm run configure
```

Or use environment variables:

```bash
export AVALTIX_BASE_URL="https://avaltix.io"
export AVALTIX_API_KEY="avx_agent_..."
```

## Verify

```bash
npm run self-test
node scripts/avaltix-api.mjs snapshot
node scripts/avaltix-api.mjs market-brief USD/JPY 1h
```

If the API key is missing or invalid, the skill fails closed and does not return market data.