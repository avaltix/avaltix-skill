# Avaltix Agent Command Gateway

The public skill uses one read-only gateway endpoint:

| Endpoint | Method | Purpose |
|---|---:|---|
| `/api/v1/agent/command` | POST | Execute an allowlisted read-only Avaltix command. |

Supported gateway commands: `snapshot`, `search`, `indicators`, `opportunities`, `macro`, `calendar`, `events`, `analyze`.

Public star workflows compose those gateway commands client-side: `market-brief`, `probabilistic-forecast`, `cross-asset-context`, `opportunity-scan`, `research-memo`.

The server maps each command to the correct internal read-only source and enforces the user's Agent API key scopes, paid plan, daily quota, and per-minute limit. Do not call internal, admin, billing, account mutation, MetaTrader bridge, worker, retry, sync, or trading execution endpoints from the skill.

Response envelope:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "req_...",
    "generated_at": "2026-04-28T00:00:00+00:00",
    "rate_limit": {}
  }
}
```

Never call excluded endpoints: admin, payments, account mutations, support/chatbot, MT bridge, provider toggles, sync/retry/settle workers.