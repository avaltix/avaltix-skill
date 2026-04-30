# Productization Review Plan

This checklist defines when Avaltix Skill is considered ready for distribution.

## Priority 1: API Productized

Status: complete for v0.2.0.

Covered:

- Public gateway endpoint: `/api/v1/agent/command`
- Gateway commands: `snapshot`, `search`, `indicators`, `analyze`, `opportunities`, `macro`, `calendar`, `events`
- Response envelope and error envelope
- Core objects: analysis, confidence, drivers, indicators, opportunities, macro/event context
- Asset classes: stocks, forex, crypto, ETFs, indices, commodities through `search`
- Timeframes: `1min`, `5min`, `15min`, `30min`, `1h`, `4h`, `1d`, `1day`
- Auth: Bearer Agent API key with scopes, plan gating, quota, rate limit, and revocation
- Limits: per-minute and daily quota metadata returned by API
- Use cases: market brief, scenario forecast, cross-asset context, opportunity scan, research memo

## Priority 2: Star Workflows

Status: complete for v0.2.0.

Only five product workflows are exposed:

| Workflow | Command |
|---|---|
| Avaltix Market Brief | `market-brief` |
| Avaltix Probabilistic Forecast | `probabilistic-forecast` |
| Avaltix Cross-Asset Context | `cross-asset-context` |
| Avaltix Opportunity Scan | `opportunity-scan` |
| Avaltix Research Memo | `research-memo` |

Each workflow composes read-only gateway commands. None of them call admin, billing, account mutation, trade execution, MetaTrader bridge, provider toggle, worker, retry, sync, or settlement endpoints.

## Priority 3: Documentation That Sells

Status: complete for v0.2.0.

Included docs:

- Quickstart
- Market intelligence API examples
- OpenClaw and Claude Code usage
- Research agent build guide
- API product brief
- Productization review plan

## E2E Validation Gate

The release is not complete unless all checks pass:

- `npm run self-test`
- `scripts/security-check.mjs`
- Missing API key fails closed
- Public GitHub clone works
- Portable package checksum verifies
- Portable package self-test passes
- Production gateway accepts a valid temporary key
- Production gateway rejects missing/invalid keys
- All five star workflows return `ok: true`
- Workflow sources do not return `unavailable` for the selected E2E fixture set
- Temporary E2E key is revoked after validation

Latest validated fixture set:

- `USD/JPY 1h` for market brief and forecast
- `EUR/USD 1h` for cross-asset context
- `USD/JPY,EUR/USD,THETA/USD 1h` for opportunity scan
- `SOXX 1h` for research memo