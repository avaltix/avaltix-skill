# Avaltix Agent API Product Brief

Avaltix Agent API v1 is a read-only market intelligence API for agentic research workflows. It is designed for OpenClaw, Claude Code, internal research agents, and lightweight trading dashboards that need structured market context without account mutation or trade execution.

## Surface

Public integrations should use the command gateway:

| Endpoint | Method | Auth | Purpose |
|---|---:|---|---|
| `/api/v1/agent/command` | POST | Bearer Agent API key | Executes allowlisted read-only commands. |

Gateway commands:

| Command | Primary Scope | Use Case |
|---|---|---|
| `snapshot` | `market.read` | Current cached market snapshot. |
| `search` | `market.read` | Search supported assets and active/baseline state. |
| `indicators` | `market.read` | Cached indicator stack for one symbol/timeframe. |
| `analyze` | `predictions.read` | Bias, confidence, drivers, and indicator-derived analysis. |
| `opportunities` | `predictions.read` | Top cached opportunity feed. |
| `macro` | `macro.read` | Macro snapshot for cross-asset context. |
| `calendar` | `market.read` | Asset calendar and market state. |
| `events` | `macro.read` | Economic, earnings, dividends, and crypto events. |

## Response Envelope

Every gateway response uses the same envelope:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "req_...",
    "generated_at": "2026-04-30T00:00:00+00:00",
    "rate_limit": {},
    "daily_quota": {}
  }
}
```

Error responses keep the same shape with `ok: false`, `data: null`, and an `error.code` such as `missing_bearer_token`, `invalid_api_key`, `scope_required`, `upgrade_required`, `rate_limit_exceeded`, or `daily_quota_exceeded`.

## Core Objects

`analysis` returns:

```json
{
  "symbol": "XAUUSD",
  "timeframe": "1h",
  "bias": "bullish",
  "confidence": 0.6833,
  "drivers": [{ "name": "macd", "signal": "bullish", "value": 0.14 }],
  "indicators": {},
  "calculated_at": "2026-04-30T00:00:00+00:00"
}
```

`confidence` is a normalized 0-1 conviction score derived from available signal agreement. `drivers` describe the direction and source of the signal stack. `concordance` should be treated as the qualitative agreement between drivers and cross-asset context; public v0.1.0 exposes the underlying drivers and workflow sources rather than a separate `concordance` scalar.

## Assets And Timeframes

Supported asset classes are stocks, forex, crypto, ETFs, indices, and commodities. Use `search` before assuming a symbol is supported.

Supported technical timeframes: `1min`, `5min`, `15min`, `30min`, `1h`, `4h`, `1d`, `1day`.

Plan access can restrict symbols, scopes, and timeframes. The API returns `upgrade_required` or plan-specific denial errors instead of silently degrading access.

## Limits And Auth

Use `Authorization: Bearer <avx_agent_key>`. Keys are created from Avaltix account settings, stored hashed server-side, scoped, quota-limited, rate-limited, revocable, and bound to the account plan.

Typical plan limits are returned in response metadata as `rate_limit` and `daily_quota`. The public skill never stores keys in the repository; `npm run configure` stores local config in `~/.config/avaltix-skill/config.json` with user-only permissions.

## Commercial Use Cases

- Build a market brief agent for one symbol.
- Build a probabilistic scenario assistant.
- Scan a watchlist for prioritized opportunities.
- Add macro and cross-asset context to technical research.
- Generate short institutional research memos from Avaltix signals.