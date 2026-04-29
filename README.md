# Avaltix Skill

Read-only OpenClaw/Claude Code skill for Avaltix Agent API v1.

The distributable skill contains only a thin command client, prompts, templates, and read-only usage rules. Proprietary market logic, provider integrations, billing, user data, endpoint routing, and API secrets stay on Avaltix servers.

## Commercial Model

Distribute this repository as the installer. Monetization happens through Avaltix accounts and Agent API keys:

- Users can install the skill from GitHub.
- The skill is useless without an Avaltix Agent API key.
- Keys are created from Avaltix account settings and inherit the user's paid plan, scopes, daily quota, and per-minute limit.
- API keys are stored hashed server-side and are shown only once during create/rotate.
- The client never calls admin, billing, account mutation, MetaTrader bridge, worker, retry, sync, or trading execution endpoints.

## Install

```bash
git clone https://github.com/avaltix/avaltix-skill.git
cd avaltix-skill
bash install.sh
```

OmeniaClaw imports compatible Claude skills from `~/.claude/skills` into `~/.omeniaclaw/skills` during install/update.

Portable package download:

```bash
curl -L -o avaltix-skill-0.1.0.tar.gz https://github.com/avaltix/avaltix-skill/raw/main/dist/avaltix-skill-0.1.0.tar.gz
curl -L -o avaltix-skill-0.1.0.tar.gz.sha256 https://github.com/avaltix/avaltix-skill/raw/main/dist/avaltix-skill-0.1.0.tar.gz.sha256
sha256sum -c avaltix-skill-0.1.0.tar.gz.sha256
tar -xzf avaltix-skill-0.1.0.tar.gz
cd avaltix
bash install.sh
```

## Configure

Preferred local config, saved outside the repo with `0600` permissions:

```bash
npm run configure
```

Environment variables are also supported:

```bash
export AVALTIX_BASE_URL="https://avaltix.io"
export AVALTIX_API_KEY="avx_agent_..."
```

The key must be created in Avaltix with one or more scopes: `market.read`, `macro.read`, `predictions.read`.

## Smoke Test

```bash
npm run self-test
node scripts/avaltix-api.mjs snapshot
```

## Publisher Safety Check

Before pushing or releasing:

```bash
npm run security-check
```

Do not publish the full Avaltix application repository. Publish only this skill folder.