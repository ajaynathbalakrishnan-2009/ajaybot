import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';

const PORT = Number(process.env.PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED != null
  ? process.env.OLLAMA_ENABLED === 'true'
  : process.env.RENDER !== 'true';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_AGENT_NAME = process.env.LIVEKIT_AGENT_NAME || 'ajaybot-voice';
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  : null;

const MODEL_MAP = {
  gemini: {
    flagship: process.env.GEMINI_FLAGSHIP_MODEL || 'gemini-3.7-flash',
    fast: process.env.GEMINI_FAST_MODEL || 'gemini-3.6-flash',
    pro: process.env.GEMINI_PRO_MODEL || 'gemini-3.7-flash',
    balanced: process.env.GEMINI_BALANCED_MODEL || 'gemini-3.6-flash',
  },
  anthropic: {
    flagship: process.env.ANTHROPIC_FLAGSHIP_MODEL || 'claude-opus-5',
    fast: process.env.ANTHROPIC_FAST_MODEL || 'claude-haiku-4-5-20251001',
    pro: process.env.ANTHROPIC_PRO_MODEL || 'claude-sonnet-5',
    balanced: process.env.ANTHROPIC_BALANCED_MODEL || 'claude-sonnet-5',
  },
  openrouter: {
    flagship: process.env.OPENROUTER_FLAGSHIP_MODEL || 'openrouter/free',
    fast: process.env.OPENROUTER_FAST_MODEL || 'openrouter/free',
    pro: process.env.OPENROUTER_PRO_MODEL || 'openrouter/free',
    balanced: process.env.OPENROUTER_BALANCED_MODEL || 'openrouter/free',
  },
  ollama: {
    flagship: process.env.OLLAMA_FLAGSHIP_MODEL || 'gemma3:latest',
    fast: process.env.OLLAMA_FAST_MODEL || 'llama3.2:latest',
    pro: process.env.OLLAMA_PRO_MODEL || 'qwen3:4b',
    balanced: process.env.OLLAMA_BALANCED_MODEL || 'qwen3:4b',
  },
};


function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  })[ext] || 'application/octet-stream';
}

function safeDistPath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relative = clean.replace(/^\/+/, '');
  const candidate = path.resolve(DIST_DIR, relative);
  return candidate.startsWith(DIST_DIR + path.sep) || candidate === DIST_DIR ? candidate : null;
}

function serveFile(res, filePath) {
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType(filePath),
      'Cache-Control': path.basename(filePath) === 'index.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

function serveFrontend(req, res) {
  if (!fs.existsSync(DIST_DIR)) {
    return json(res, 503, { error: 'Frontend build not found. Run npm run build before starting the production server.' });
  }

  const requested = safeDistPath(req.url);
  if (requested && fs.existsSync(requested) && fs.statSync(requested).isFile()) {
    return serveFile(res, requested);
  }

  return serveFile(res, path.join(DIST_DIR, 'index.html'));
}

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(body));
}

function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
  });
}

function sendEvent(res, type, data) {
  res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sendToken(res, text) {
  if (!text) return;
  res.__ajaybotHasToken = true;
  sendEvent(res, 'token', { text });
}

function providerOrder(preferred) {
  const cloudFirst = ['openrouter', 'gemini', 'anthropic'];
  if (preferred === 'auto') {
    // Local development: prefer the Ollama models installed on this machine.
    // Hosted Render: use cloud providers because the user's laptop is not reachable.
    return OLLAMA_ENABLED
      ? ['ollama', ...cloudFirst]
      : cloudFirst;
  }
  if (preferred === 'ollama') return OLLAMA_ENABLED ? ['ollama'] : [];
  const cloud = cloudFirst.filter(p => p !== preferred);
  return [preferred, ...cloud, ...(OLLAMA_ENABLED ? ['ollama'] : [])].filter(Boolean);
}

function errorStatus(message) {
  const match = String(message || '').match(/^(\d{3}):/);
  return match ? Number(match[1]) : null;
}

function shouldFallback(message) {
  const status = errorStatus(message);
  return status === 401 || status === 402 || status === 408 || status === 409 || status === 429 ||
    status === 500 || status === 502 || status === 503 || status === 504 ||
    /returned no response content|ECONNREFUSED|ENOTFOUND|fetch failed|timed out|timeout/i.test(String(message || ''));
}


async function requireUser(req) {
  if (!supabase) {
    throw new Error('Authentication is not configured on the server. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    const error = new Error('Sign in to use AjayBot.');
    error.statusCode = 401;
    throw error;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const authError = new Error('Your AjayBot session is invalid or expired. Please sign in again.');
    authError.statusCode = 401;
    throw authError;
  }

  return data.user;
}
}

async function createVoiceConnection(user) {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    const error = new Error('LiveKit voice is not configured on the server. Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.');
    error.statusCode = 503;
    throw error;
  }

  const roomName = `ajaybot-voice-${user.id}-${randomUUID().slice(0, 12)}`;
  const participantIdentity = `ajaybot-user-${user.id}-${randomUUID().slice(0, 8)}`;
  const displayName = user.user_metadata?.display_name || user.email || 'AjayBot User';

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: displayName,
  });

  const grant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  };

  token.addGrant(grant);

  token.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: LIVEKIT_AGENT_NAME,
        metadata: JSON.stringify({
          userId: user.id,
          displayName,
        }),
      }),
    ],
  });

  return {
    serverUrl: LIVEKIT_URL,
    participantToken: await token.toJwt(),
    roomName,
    agentName: LIVEKIT_AGENT_NAME,
  };


async function readBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (body.length > 2_000_000) throw new Error('Request is too large.');
  return JSON.parse(body || '{}');
}

function getKey(provider) {
  const raw = {
    gemini: process.env.GEMINI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  }[provider];

  if (typeof raw !== 'string') return null;

  const key = raw.trim();
  if (!key || /^YOUR_.*_HERE$/i.test(key)) return null;

  return key;
}

function modelFor(provider, tier) {
  const model = MODEL_MAP[provider]?.[tier] || MODEL_MAP[provider]?.balanced;
  if (!model) throw new Error(`No model configured for ${provider}.`);
  return model;
}
function decodeDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?;base64,(.*)$/s.exec(dataUrl || '');
  return match ? { mediaType: match[1] || 'application/octet-stream', data: match[2] } : null;
}

function textAttachments(attachments = []) {
  return attachments
    .filter(a => !a.isImage && typeof a.dataUrl === 'string')
    .map(a => {
      const decoded = decodeDataUrl(a.dataUrl);
      if (!decoded) return `\n\n[Attached file: ${a.name}]\n(No readable data.)`;
      try {
        const text = Buffer.from(decoded.data, 'base64').toString('utf8');
        return `\n\n[Attached file: ${a.name}]\n${text.slice(0, 500000)}`;
      } catch {
        return `\n\n[Attached file: ${a.name}]\n(Binary file; contents could not be decoded as text.)`;
      }
    })
    .join('');
}

function lastUserIndex(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return i;
  }
  return -1;
}


async function streamFetch(res, response, parser) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${response.status}: ${text.slice(0, 800)}`);
  }
  if (!response.body) throw new Error('Provider returned no streaming body.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Provider SSE streams may use either LF or CRLF line endings.
    // Normalize line endings before splitting events so we never lose
    // all but the first streamed token.
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) parser(part, res);
  }

  // Flush any remaining decoder bytes and normalize line endings.
  buffer += decoder.decode();
  buffer = buffer.replace(/\r\n/g, '\n');
  if (buffer.trim()) parser(buffer, res);
}

async function callGemini(res, body, key, model) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastIndex = lastUserIndex(messages);
  const attachments = body.attachments || [];
  const contents = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      const originalIndex = messages.indexOf(m);
      const parts = [{ text: String(m.content || '') }];
      if (originalIndex === lastIndex) {
        const extraText = textAttachments(attachments);
        if (extraText) parts[0].text += extraText;
        for (const attachment of attachments.filter(a => a.isImage)) {
          const decoded = decodeDataUrl(attachment.dataUrl);
          if (decoded) parts.push({ inlineData: { mimeType: decoded.mediaType, data: decoded.data } });
        }
      }
      return { role: m.role === 'assistant' ? 'model' : 'user', parts };
    });

  const candidates = [
    model,
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
  ].filter((value, index, all) => value && all.indexOf(value) === index);

  let lastError = null;

  for (const candidateModel of candidates) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: body.systemPrompt ? { parts: [{ text: body.systemPrompt }] } : undefined,
          contents,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const message = `Gemini ${response.status}: ${errorText.slice(0, 800)}`;
      lastError = new Error(message);

      // Temporary capacity/rate errors should try another stable Gemini model.
      if (response.status === 429 || response.status === 503) {
        continue;
      }
      throw lastError;
    }

    if (!response.body) {
      lastError = new Error('Gemini returned no streaming body.');
      continue;
    }

    await streamFetch(res, response, (part, out) => {
      const line = part.split('\n').find(x => x.startsWith('data:'));
      if (!line) return;
      try {
        const data = JSON.parse(line.slice(5).trim());
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
        if (text) sendToken(out, text);
      } catch {}
    });

    if (res.__ajaybotHasToken) return;
    lastError = new Error(`Gemini ${candidateModel} returned no response content.`);
  }

  throw lastError || new Error('Gemini did not return a response.');
}

async function callAnthropic(res, body, key, model) {
  const messages = (body.messages || [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: String(m.content || '') }));

  const attachments = body.attachments || [];
  const last = messages[messages.length - 1];
  if (last?.role === 'user') {
    const content = [{ type: 'text', text: last.content + textAttachments(attachments) }];
    for (const attachment of attachments.filter(a => a.isImage)) {
      const decoded = decodeDataUrl(attachment.dataUrl);
      if (decoded) content.push({ type: 'image', source: { type: 'base64', media_type: decoded.mediaType, data: decoded.data } });
    }
    last.content = content;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: body.systemPrompt || undefined,
      messages,
      stream: true,
    }),
  });

  await streamFetch(res, response, (part, out) => {
    for (const line of part.split('\n')) {
      if (!line.startsWith('data:')) continue;
      try {
        const data = JSON.parse(line.slice(5).trim());
        if (data.type === 'content_block_delta' && data.delta?.text) sendToken(out, data.delta.text);
      } catch {}
    }
  });
}

async function callOllama(res, body, model) {
  const messages = [
    ...(body.systemPrompt ? [{ role: 'system', content: String(body.systemPrompt) }] : []),
    ...(body.messages || [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: String(m.content || '') })),
  ];

  const attachments = body.attachments || [];
  const last = messages[messages.length - 1];

  if (last?.role === 'user') {
    last.content += textAttachments(attachments);
    const images = attachments
      .filter(a => a.isImage && typeof a.dataUrl === 'string')
      .map(a => decodeDataUrl(a.dataUrl))
      .filter(Boolean)
      .map(({ data }) => data);

    if (images.length) last.images = images;
  }

  const response = await fetch(OLLAMA_BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      think: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('Ollama ' + response.status + ': ' + text.slice(0, 800));
  }

  if (!response.body) throw new Error('Ollama returned no streaming body.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        if (data.message?.content) sendToken(res, data.message.content);
      } catch {}
    }
  }

  if (buffer.trim()) {
    try {
      const data = JSON.parse(buffer);
      if (data.message?.content) sendToken(res, data.message.content);
    } catch {}
  }
}

async function callOpenRouter(res, body, key, model) {
  const messages = [
    ...(body.systemPrompt ? [{ role: 'system', content: body.systemPrompt }] : []),
    ...(body.messages || []).map(m => ({ role: m.role, content: String(m.content || '') })),
  ];

  const attachments = body.attachments || [];
  const last = messages[messages.length - 1];
  if (last?.role === 'user') {
    const content = [{ type: 'text', text: last.content + textAttachments(attachments) }];
    for (const attachment of attachments.filter(a => a.isImage)) {
      content.push({ type: 'image_url', image_url: { url: attachment.dataUrl } });
    }
    last.content = content;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Title': 'AjayBot',
      'HTTP-Referer': 'http://localhost:5173',
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  await streamFetch(res, response, (part, out) => {
    for (const line of part.split('\n')) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') continue;
      try {
        const data = JSON.parse(raw);
        const text = data.choices?.[0]?.delta?.content;
        if (text) sendToken(out, text);
      } catch {}
    }
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    });
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/api/voice-token') {
    try {
      const user = await requireUser(req);
      const connection = await createVoiceConnection(user);
      return json(res, 200, connection);
    } catch (error) {
      return json(res, error.statusCode || 500, { error: error.message || 'Voice session could not be created.' });
    }
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    return json(res, 200, {
      ok: true,
      configured: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        livekit: Boolean(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET),
        ollama: OLLAMA_ENABLED && await fetch(OLLAMA_BASE_URL + '/api/version').then(r => r.ok).catch(() => false),
      },
    });
  }

  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    return serveFrontend(req, res);
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    return json(res, 404, { error: 'Not found' });
  }

  try {
    const user = await requireUser(req);
    const body = await readBody(req);
    const preferredProvider = ['auto', 'gemini', 'anthropic', 'openrouter', 'ollama'].includes(body.provider)
      ? body.provider
      : null;

    if (!preferredProvider) throw new Error('Select Auto Fallback, a real AI provider, Ollama Local, or use Demo Engine.');

    const order = providerOrder(preferredProvider);
    sseHeaders(res);
    let lastError = null;

    for (const provider of order) {
      res.__ajaybotHasToken = false;

      if (provider !== 'ollama' && !getKey(provider)) {
        sendEvent(res, 'status', { provider, skipped: true, message: provider + ' is not configured; trying the next provider...' });
        continue;
      }

      const model = modelFor(provider, body.modelTier || 'balanced');
      sendEvent(res, 'status', { provider, model, message: 'Trying ' + provider + '...' });

      try {
        if (provider === 'gemini') await callGemini(res, body, getKey(provider), model);
        if (provider === 'anthropic') await callAnthropic(res, body, getKey(provider), model);
        if (provider === 'openrouter') await callOpenRouter(res, body, getKey(provider), model);
        if (provider === 'ollama') await callOllama(res, body, model);

        if (res.__ajaybotHasToken) {
          sendEvent(res, 'done', { provider, model });
          return res.end();
        }

        throw new Error(provider + ' returned no response content.');
      } catch (error) {
        lastError = error;
        if (res.__ajaybotHasToken || !shouldFallback(error.message)) throw error;
        sendEvent(res, 'status', {
          provider,
          failed: true,
          message: provider + ' unavailable (' + error.message + '). Switching to the next provider...',
        });
      }
    }

    throw lastError || new Error('No AI provider is configured. Add a cloud API key on the server or enable Ollama locally.');
  } catch (error) {
    if (!res.headersSent) {
      return json(res, error.statusCode || 500, { error: error.message || 'Server error' });
    }
    sendEvent(res, 'error', { message: error.message || 'Provider request failed.' });
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`AjayBot AI backend listening on http://localhost:${PORT}`);
});
