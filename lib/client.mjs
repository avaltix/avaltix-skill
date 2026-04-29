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

export const COMMANDS = new Set([
  'snapshot',
  'search',
  'indicators',
  'opportunities',
  'macro',
  'calendar',
  'events',
  'analyze'
]);

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
  if (!COMMANDS.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  return {
    path: '/api/v1/agent/command',
    method: 'POST',
    body: { command, args }
  };
}