import assert from 'node:assert/strict';
import { COMMANDS, GATEWAY_COMMANDS, WORKFLOW_COMMANDS, buildUrl, endpointForCommand, normalizeBaseUrl } from '../lib/client.mjs';

assert.equal(normalizeBaseUrl('https://avaltix.io/'), 'https://avaltix.io');
assert.ok(COMMANDS.has('snapshot'));
assert.ok(COMMANDS.has('analyze'));
assert.ok(GATEWAY_COMMANDS.has('macro'));
assert.ok(WORKFLOW_COMMANDS.has('market-brief'));
assert.ok(WORKFLOW_COMMANDS.has('probabilistic-forecast'));
assert.ok(WORKFLOW_COMMANDS.has('cross-asset-context'));
assert.ok(WORKFLOW_COMMANDS.has('opportunity-scan'));
assert.ok(WORKFLOW_COMMANDS.has('research-memo'));

const search = endpointForCommand('search', ['AAPL', 'stock']);
assert.equal(search.path, '/api/v1/agent/command');
assert.equal(search.method, 'POST');
assert.equal(search.body.command, 'search');
assert.deepEqual(search.body.args, ['AAPL', 'stock']);

const url = buildUrl('/api/v1/agent/command', {}, 'https://avaltix.io');
assert.equal(url.toString(), 'https://avaltix.io/api/v1/agent/command');

const opportunities = endpointForCommand('opportunities', []);
assert.equal(opportunities.body.command, 'opportunities');

console.log('[avaltix] self-test ok');