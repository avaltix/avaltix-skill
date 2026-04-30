# Market Intelligence API Examples

## Market Brief

```bash
node scripts/avaltix-api.mjs market-brief USD/JPY 1h
```

Best for: asset desk update, pre-market context, quick technical plus macro read.

## Probabilistic Forecast

```bash
node scripts/avaltix-api.mjs probabilistic-forecast USD/JPY 1h
```

Best for: scenario framing, dominant/alternate path, confidence and invalidation language.

## Cross-Asset Context

```bash
node scripts/avaltix-api.mjs cross-asset-context EUR/USD 1h
```

Best for: explaining how USD, rates, risk appetite, and events may affect the queried asset.

## Opportunity Scan

```bash
node scripts/avaltix-api.mjs opportunity-scan USD/JPY,EUR/USD,THETA/USD 1h
```

Best for: ranking a small watchlist by available confidence and drivers.

## Research Memo

```bash
node scripts/avaltix-api.mjs research-memo SOXX 1h
```

Best for: a short institutional memo with thesis, signal stack, scenarios, risks, and next checks.