import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);

const MODEL_MAP = {
  gemini: {
    flagship: 'gemini-3.8-flash',
    fast: 'gemini-3.6-flash',
    pro: 'gemini-3.7-flash',
    balanced: 'gemini-3.6-flash',
  },
  anthropic: {
    flagship: 'claude-opus-5',
    fast: 'claude-haiku-4-5-20251001',
    pro: 'claude-sonnet-5',
    balanced: 'claude-sonnet-5',
  },
  openrouter: {
    flagship: 'openai/gpt-5.2',
    fast: 'openai/gpt-5-mini',
    pro: 'openai/gpt-5.2',
    balanced: 'openai/gpt-5',
  },
};

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(body));
}

function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
}

function sendEvent(res, type, data) {
  res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (body.length > 2_000_000) throw new Error('Request is too large.');
  return JSON.parse(body || '{}');
}

function getKey(provider) {
  return {
    gemini: process.env.GEMINI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  }[provider];
}

function modelFor(provider, tier) {
  return MODEL_MAP[provider]?.[tier] || MODEL_MAP[provider]?.balanced;
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
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) parser(part, res);
  }
  if (buffer.trim()) parser(buffer, res);
}

async function callGemini(res, body, key, model) {
  const contents = (body.messages || [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: body.systemPrompt
          ? { parts: [{ text: body.systemPrompt }] }
          : undefined,
        contents,
      }),
    }
  );

  await streamFetch(res, response, (part, out) => {
    const line = part.split('\n').find(x => x.startsWith('data:'));
    if (!line) return;
    try {
      const data = JSON.parse(line.slice(5).trim());
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
      if (text) sendEvent(out, 'token', { text });
    } catch {}
  });
}

async function callAnthropic(res, body, key, model) {
  const messages = (body.messages || [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: String(m.content || '') }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
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
        if (data.type === 'content_block_delta' && data.delta?.text) {
          sendEvent(out, 'token', { text: data.delta.text });
        }
      } catch {}
    }
  });
}

async function callOpenRouter(res, body, key, model) {
  const messages = [
    ...(body.systemPrompt ? [{ role: 'system', content: body.systemPrompt }] : []),
    ...(body.messages || []).map(m => ({
      role: m.role,
      content: String(m.content || ''),
    })),
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Title': 'AjayBot',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  await streamFetch(res, response, (part, out) => {
    for (const line of part.split('\n')) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') continue;
      try {
        const data = JSON.parse(raw);
        const text = data.choices?.[0]?.delta?.content;
        if (text) sendEvent(out, 'token', { text });
      } catch {}
    }
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    });
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    return json(res, 200, {
      ok: true,
      configured: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      },
    });
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    return json(res, 404, { error: 'Not found' });
  }

  try {
    const body = await readBody(req);
    const provider = ['gemini', 'anthropic', 'openrouter'].includes(body.provider)
      ? body.provider
      : null;

    if (!provider) throw new Error('Select a real AI provider or use Demo Engine.');
    const key = getKey(provider);
    if (!key) throw new Error(`${provider} is not configured on the server. Add its API key to .env.`);

    const model = modelFor(provider, body.modelTier || 'balanced');
    sseHeaders(res);
    sendEvent(res, 'status', { provider, model });

    if (provider === 'gemini') await callGemini(res, body, key, model);
    if (provider === 'anthropic') await callAnthropic(res, body, key, model);
    if (provider === 'openrouter') await callOpenRouter(res, body, key, model);

    sendEvent(res, 'done', {});
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      return json(res, 500, { error: error.message || 'Server error' });
    }
    sendEvent(res, 'error', { message: error.message || 'Provider request failed.' });
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`AjayBot AI backend listening on http://localhost:${PORT}`);
});
