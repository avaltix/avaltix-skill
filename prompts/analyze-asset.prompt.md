---
description: Analyze one asset with the Avaltix Agent API.
argument-hint: "XAUUSD 1h"
---

Analyze the requested asset using the Avaltix skill.

1. Run `node scripts/avaltix-api.mjs analyze <symbol> <timeframe>`.
2. If useful, run `node scripts/avaltix-api.mjs indicators <symbol> <timeframe>`.
3. Summarize bias, confidence, drivers, data timestamp and limitations.
4. State that this is market intelligence, not financial advice.