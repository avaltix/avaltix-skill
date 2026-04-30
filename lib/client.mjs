const DEFAULT_BASE_URL = 'https://avaltix.io';
const CONFIG_PATH = `${process.env.HOME || process.env.USERPROFILE || '.'}/.config/avaltix-skill/config.json`;

async function readLocalConfig() {
  try {
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const GATEWAY_COMMANDS = new Set([
  'snapshot',
  'search',
  'indicators',
  'opportunities',
  'macro',
  'calendar',
  'events',
  'analyze'
]);

export const WORKFLOW_COMMANDS = new Set([
  'market-brief',
  'probabilistic-forecast',
  'cross-asset-context',
  'opportunity-scan',
  'research-memo'
]);

export const COMMANDS = new Set([...GATEWAY_COMMANDS, ...WORKFLOW_COMMANDS]);

export function normalizeBaseUrl(value = process.env.AVALTIX_BASE_URL || DEFAULT_BASE_URL) {
  return String(value || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

export async function runtimeConfig() {
  const localConfig = await readLocalConfig();
  return {
    baseUrl: normalizeBaseUrl(process.env.AVALTIX_BASE_URL || localConfig.baseUrl || DEFAULT_BASE_URL),
    apiKey: process.env.AVALTIX_API_KEY || localConfig.apiKey || ''
  };
}

export function buildUrl(path, params = {}, baseUrl = normalizeBaseUrl()) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export async function avaltixRequest(path, { method = 'GET', params = {}, body = null } = {}) {
  const { baseUrl, apiKey } = await runtimeConfig();
  if (!apiKey) {
    throw new Error('AVALTIX_API_KEY is required. Run `npm run configure` or set it as an environment variable.');
  }

  const url = buildUrl(path, params, baseUrl);
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { ok: false, error: { code: 'invalid_json', message: text.slice(0, 500) } };
  }

  if (!response.ok || payload?.ok === false) {
    const error = payload?.error?.message || `Avaltix API error ${response.status}`;
    const code = payload?.error?.code || 'api_error';
    throw new Error(`${code}: ${error}`);
  }

  return payload;
}

export function redactSecrets(value) {
  const configuredKey = process.env.AVALTIX_API_KEY || '';
  return String(value)
    .replace(/avx_agent_[a-f0-9]{64}/gi, 'avx_agent_[redacted]')
    .replace(configuredKey, configuredKey ? '[redacted]' : '');
}

export function endpointForCommand(command, args) {
  if (!GATEWAY_COMMANDS.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  return {
    path: '/api/v1/agent/command',
    method: 'POST',
    body: { command, args }
  };
}

export async function runGatewayCommand(command, args = []) {
  const request = endpointForCommand(command, args);
  return avaltixRequest(request.path, request);
}

async function safeGatewayCommand(command, args = []) {
  try {
    return await runGatewayCommand(command, args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/AVALTIX_API_KEY|required|missing_bearer_token|invalid_api_key|daily_quota_exceeded|rate_limit_exceeded/i.test(message)) {
      throw error;
    }
    return {
      ok: false,
      data: null,
      error: { code: 'workflow_source_unavailable', message: redactSecrets(message) },
      meta: { command, args }
    };
  }
}

function sourceData(result) {
  return result?.ok === true ? result.data : null;
}

function sourceState(result) {
  if (result?.partial === true) return 'partial';
  return result?.ok === true ? 'available' : 'unavailable';
}

function dominantScenario(analysis) {
  const bias = analysis?.bias || 'neutral';
  const confidence = Number(analysis?.confidence || 0);
  if (bias === 'bullish') {
    return { name: 'bullish continuation', probability_hint: confidence, condition: 'drivers remain aligned and no macro shock invalidates the setup' };
  }
  if (bias === 'bearish') {
    return { name: 'bearish continuation', probability_hint: confidence, condition: 'downside drivers remain dominant and risk appetite does not recover' };
  }
  return { name: 'range or wait state', probability_hint: Math.max(0.35, confidence), condition: 'mixed drivers keep the setup below conviction threshold' };
}

function alternateScenario(analysis) {
  const bias = analysis?.bias || 'neutral';
  const confidence = Number(analysis?.confidence || 0);
  const probabilityHint = Math.max(0, Number((1 - Math.min(0.95, confidence)).toFixed(4)));
  if (bias === 'bullish') {
    return { name: 'bullish failure or mean reversion', probability_hint: probabilityHint, condition: 'momentum fades, overbought signals dominate, or macro risk turns adverse' };
  }
  if (bias === 'bearish') {
    return { name: 'bearish failure or relief rebound', probability_hint: probabilityHint, condition: 'selling pressure fades, oversold signals dominate, or macro risk improves' };
  }
  return { name: 'breakout from range', probability_hint: probabilityHint, condition: 'technical and macro drivers converge after a neutral state' };
}

function envelope(workflow, data, sources) {
  return {
    ok: true,
    data: {
      workflow,
      ...data,
      sources: Object.fromEntries(Object.entries(sources).map(([name, result]) => [name, sourceState(result)]))
    },
    error: null,
    meta: {
      generated_at: new Date().toISOString(),
      client: 'avaltix-skill',
      note: 'Read-only workflow composed from Avaltix Agent API gateway commands.'
    }
  };
}

export async function runWorkflowCommand(command, args = []) {
  const symbol = String(args[0] || '').trim().toUpperCase();
  const timeframe = String(args[1] || '1h').trim();

  switch (command) {
    case 'market-brief': {
      if (!symbol) throw new Error('market-brief requires <symbol> [timeframe]');
      const [analysis, indicators, macro, events] = await Promise.all([
        safeGatewayCommand('analyze', [symbol, timeframe]),
        safeGatewayCommand('indicators', [symbol, timeframe]),
        safeGatewayCommand('macro', []),
        safeGatewayCommand('events', ['economic', symbol, 14])
      ]);
      const analysisData = sourceData(analysis) || {};
      return envelope('avaltix-market-brief', {
        symbol,
        timeframe,
        summary: {
          bias: analysisData.bias || 'unavailable',
          confidence: analysisData.confidence ?? null,
          drivers: analysisData.drivers || [],
          calculated_at: analysisData.calculated_at || null
        },
        technical: sourceData(indicators),
        macro: sourceData(macro),
        events: sourceData(events)
      }, { analysis, indicators, macro, events });
    }

    case 'probabilistic-forecast': {
      if (!symbol) throw new Error('probabilistic-forecast requires <symbol> [timeframe]');
      const [analysis, opportunities] = await Promise.all([
        safeGatewayCommand('analyze', [symbol, timeframe]),
        safeGatewayCommand('opportunities', [10])
      ]);
      const analysisData = sourceData(analysis) || {};
      return envelope('avaltix-probabilistic-forecast', {
        symbol,
        timeframe,
        bias: analysisData.bias || 'unavailable',
        confidence: analysisData.confidence ?? null,
        scenarios: [dominantScenario(analysisData), alternateScenario(analysisData)],
        drivers: analysisData.drivers || [],
        opportunity_context: sourceData(opportunities)
      }, { analysis, opportunities });
    }

    case 'cross-asset-context': {
      if (!symbol) throw new Error('cross-asset-context requires <symbol> [timeframe]');
      const [analysis, macro, snapshot, events] = await Promise.all([
        safeGatewayCommand('analyze', [symbol, timeframe]),
        safeGatewayCommand('macro', []),
        safeGatewayCommand('snapshot', []),
        safeGatewayCommand('events', ['economic', symbol, 30])
      ]);
      return envelope('avaltix-cross-asset-context', {
        symbol,
        timeframe,
        asset_signal: sourceData(analysis),
        macro_context: sourceData(macro),
        market_snapshot: sourceData(snapshot),
        relevant_events: sourceData(events),
        context_questions: ['USD direction', 'rates sensitivity', 'risk appetite', 'event risk', 'cross-asset confirmation']
      }, { analysis, macro, snapshot, events });
    }

    case 'opportunity-scan': {
      const rawWatchlist = symbol ? String(args[0]).split(',').map((item) => item.trim().toUpperCase()).filter(Boolean) : [];
      const scanTimeframe = rawWatchlist.length > 0 ? timeframe : '1h';
      const opportunityLimit = rawWatchlist.length > 0 ? 10 : Number(args[0] || 10);
      const opportunities = await safeGatewayCommand('opportunities', [opportunityLimit]);
      const analyses = await Promise.all(rawWatchlist.slice(0, 12).map(async (item) => ({
        symbol: item,
        result: await safeGatewayCommand('analyze', [item, scanTimeframe])
      })));
      const ranked_watchlist = analyses.map(({ symbol: item, result }) => {
        const data = sourceData(result) || {};
        return {
          symbol: item,
          timeframe: scanTimeframe,
          bias: data.bias || 'unavailable',
          confidence: data.confidence ?? null,
          drivers: data.drivers || [],
          source: sourceState(result)
        };
      }).sort((left, right) => Number(right.confidence || 0) - Number(left.confidence || 0));
      const availableAnalyses = analyses.filter((item) => item.result.ok).length;
      return envelope('avaltix-opportunity-scan', {
        watchlist: rawWatchlist,
        timeframe: scanTimeframe,
        ranked_watchlist,
        top_opportunities: sourceData(opportunities)
      }, { opportunities, analyses: { ok: availableAnalyses > 0, partial: availableAnalyses > 0 && availableAnalyses < analyses.length, data: ranked_watchlist } });
    }

    case 'research-memo': {
      if (!symbol) throw new Error('research-memo requires <symbol> [timeframe]');
      const [brief, forecast, context] = await Promise.all([
        runWorkflowCommand('market-brief', [symbol, timeframe]),
        runWorkflowCommand('probabilistic-forecast', [symbol, timeframe]),
        runWorkflowCommand('cross-asset-context', [symbol, timeframe])
      ]);
      return envelope('avaltix-research-memo', {
        symbol,
        timeframe,
        thesis: brief.data.summary,
        scenarios: forecast.data.scenarios,
        cross_asset_context: context.data,
        memo_sections: ['executive view', 'signal stack', 'scenario map', 'macro/cross-asset context', 'risks and invalidation']
      }, { brief, forecast, context });
    }
  }

  throw new Error(`Unknown workflow: ${command}`);
}

export async function runAvaltixCommand(command, args = []) {
  if (GATEWAY_COMMANDS.has(command)) {
    return runGatewayCommand(command, args);
  }
  if (WORKFLOW_COMMANDS.has(command)) {
    return runWorkflowCommand(command, args);
  }
  throw new Error(`Unknown command: ${command}`);
}