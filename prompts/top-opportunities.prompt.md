---
description: Get top Avaltix opportunities for the current market.
argument-hint: "top 3"
---

Use the Avaltix skill to fetch top opportunities.

1. Run `node scripts/avaltix-api.mjs opportunities 3` unless the user asked for another limit.
2. Present the strongest opportunities first.
3. Include symbol, direction/bias, confidence/score, main drivers and cache timestamp when present.
4. Avoid raw JSON unless requested.