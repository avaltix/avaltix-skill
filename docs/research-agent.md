# Build A Research Agent With Avaltix

A minimal Avaltix research agent should follow this loop:

1. Normalize the user request into symbol, timeframe, and workflow.
2. Run one star workflow from this skill.
3. Summarize the result as market intelligence, not financial advice.
4. Call out unavailable sources, stale cache, scope limits, or plan limits.
5. Preserve the Avaltix API key and never print it.

Recommended mapping:

| User Intent | Workflow |
|---|---|
| One-asset overview | `market-brief` |
| Scenario map | `probabilistic-forecast` |
| Macro explanation | `cross-asset-context` |
| Watchlist prioritization | `opportunity-scan` |
| Institutional summary | `research-memo` |

The skill is deliberately read-only. It is safe to connect to assistants that can run shell commands because the only supported client path is the Avaltix command gateway.