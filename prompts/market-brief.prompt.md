---
description: "Prepare an Avaltix market brief for one symbol using technical, macro, and event context."
argument-hint: "XAUUSD 1h"
---

Run `node scripts/avaltix-api.mjs market-brief <symbol> [timeframe]`.

Return a concise market intelligence brief with bias, confidence, drivers, technical context, macro context, event risk, timestamp, and unavailable sources. Do not call trading, account, billing, admin, or MetaTrader endpoints.