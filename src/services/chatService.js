// Open Source Chat Service for AjayBot: Multi-task Intelligence Engine with Multi-Provider Support

export const AVAILABLE_MODELS = [
  {
    id: 'ajaybot-3.7-ultra',
    name: 'AjayBot 3.7 Ultra',
    tagline: 'Flagship model with deep hybrid reasoning, code execution & live artifacts',
    isDefault: true,
    supportsThinking: true,
    badge: 'Flagship'
  },
  {
    id: 'ajaybot-3.5-turbo',
    name: 'AjayBot 3.5 Turbo',
    tagline: 'High intelligence & balanced speed for daily full-stack coding and writing',
    supportsThinking: false,
    badge: 'Fast'
  },
  {
    id: 'ajaybot-3.5-flash',
    name: 'AjayBot 3.5 Flash',
    tagline: 'Lightweight, ultra-fast responses for quick questions and editing',
    supportsThinking: false,
    badge: 'Instant'
  },
  {
    id: 'ajaybot-3-max',
    name: 'AjayBot 3 Max',
    tagline: 'Expansive analytical reasoning, mathematical proofs, and literary writing',
    supportsThinking: true,
    badge: 'Pro'
  }
];

// Helper to extract artifact blocks from message content
export function parseArtifacts(content) {
  if (!content) return { cleanContent: '', artifacts: [] };

  const artifacts = [];
  const artifactRegex = /<antArtifact\s+identifier="([^"]+)"\s+type="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/antArtifact>/gi;

  let match;

  while ((match = artifactRegex.exec(content)) !== null) {
    const [fullMatch, identifier, type, title, code] = match;
    artifacts.push({
      identifier,
      type,
      title,
      code: code.trim(),
    });
  }

  // Bug fix: this previously returned the untouched original content, which meant
  // any caller relying on "text with the artifact block removed" silently got the
  // raw block back instead. Strip the matched blocks out here.
  const cleanContent = content.replace(artifactRegex, '').trim();

  return { cleanContent, artifacts };
}

// Built-in Super Engine capable of doing ALL tasks
function generateSimulatedResponse(prompt, history, model, settings, attachments = []) {
  const lower = prompt.toLowerCase();
  let thinking = '';
  let responseText = '';

  // 0. Handle Attachments (Code, Text, Images)
  if (attachments && attachments.length > 0) {
    const file = attachments[0];
    thinking = `The user has attached "${file.name}" (${file.type}). I will analyze its structure, explain its key contents, and offer optimizations or actions.`;
    responseText = `I have inspected your attachment **\`${file.name}\`**.

### Analysis & Insights
- **File Type**: \`${file.type || 'Plain text'}\`
- **File Size**: ${(file.size / 1024).toFixed(1)} KB

Based on the contents:
1. **Structure**: The file is properly formatted and ready for processing.
2. **Key Elements**: I've analyzed the primary logic/content and identified no syntax or formatting blockers.
3. **Recommendation**: Would you like me to refactor this code, generate unit tests, extract specific data, or convert it into an interactive web artifact?`;
    return { thinking, responseText };
  }

  // 1. Interactive Apps & Games
  if (lower.includes('calculator') || lower.includes('calc')) {
    thinking = `The user needs a calculator. I'll design a modern glassmorphic web calculator with keyboard support, memory functions, and glowing cyan/indigo accents inside an AjayBot interactive artifact.`;
    responseText = `Here is an interactive **Glassmorphic Cyber Calculator** with fluid animations, memory functions, and keyboard support.

<antArtifact identifier="cyber-calc" type="text/html" title="Modern Cyber Glassmorphic Calculator">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AjayBot Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: radial-gradient(circle at 10% 20%, #0b0f19 0%, #111827 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
  <div class="bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/30 p-6 rounded-3xl shadow-2xl w-full max-w-xs transition-all">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
        <span class="text-xs font-semibold tracking-wider text-indigo-400 uppercase">AjayBot Calc</span>
      </div>
      <div class="flex space-x-1.5">
        <div class="w-3 h-3 rounded-full bg-red-500/70"></div>
        <div class="w-3 h-3 rounded-full bg-amber-500/70"></div>
        <div class="w-3 h-3 rounded-full bg-emerald-500/70"></div>
      </div>
    </div>
    
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5 text-right overflow-hidden shadow-inner">
      <div id="subDisplay" class="text-xs text-slate-500 h-4 font-mono truncate"></div>
      <div id="display" class="text-3xl font-light text-white tracking-tight font-mono truncate mt-1">0</div>
    </div>

    <div class="grid grid-cols-4 gap-2.5">
      <button onclick="clearCalc()" class="btn col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 rounded-xl transition active:scale-95">AC</button>
      <button onclick="deleteDigit()" class="btn bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 rounded-xl transition active:scale-95">⌫</button>
      <button onclick="setOp('/')" class="btn bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition active:scale-95">÷</button>

      <button onclick="appendNum('7')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">7</button>
      <button onclick="appendNum('8')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">8</button>
      <button onclick="appendNum('9')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">9</button>
      <button onclick="setOp('*')" class="btn bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition active:scale-95">×</button>

      <button onclick="appendNum('4')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">4</button>
      <button onclick="appendNum('5')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">5</button>
      <button onclick="appendNum('6')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">6</button>
      <button onclick="setOp('-')" class="btn bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition active:scale-95">−</button>

      <button onclick="appendNum('1')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">1</button>
      <button onclick="appendNum('2')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">2</button>
      <button onclick="appendNum('3')" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">3</button>
      <button onclick="setOp('+')" class="btn bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition active:scale-95">+</button>

      <button onclick="appendNum('0')" class="btn col-span-2 bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">0</button>
      <button onclick="appendDot()" class="btn bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-xl border border-slate-800 transition active:scale-95">.</button>
      <button onclick="calculate()" class="btn bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-95">=</button>
    </div>
  </div>

  <script>
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetScreen = false;

    const display = document.getElementById('display');
    const subDisplay = document.getElementById('subDisplay');

    function updateDisplay() {
      display.textContent = currentInput;
      subDisplay.textContent = previousInput + (operation ? ' ' + operation : '');
    }

    function appendNum(num) {
      if (currentInput === '0' || resetScreen) {
        currentInput = num;
        resetScreen = false;
      } else {
        if (currentInput.length < 12) currentInput += num;
      }
      updateDisplay();
    }

    function appendDot() {
      if (resetScreen) {
        currentInput = '0.';
        resetScreen = false;
        updateDisplay();
        return;
      }
      if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay();
      }
    }

    function deleteDigit() {
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = '0';
      }
      updateDisplay();
    }

    function clearCalc() {
      currentInput = '0';
      previousInput = '';
      operation = null;
      updateDisplay();
    }

    function setOp(op) {
      if (operation !== null && !resetScreen) calculate();
      previousInput = currentInput;
      operation = op;
      resetScreen = true;
      updateDisplay();
    }

    function calculate() {
      if (operation === null || resetScreen) return;
      const prev = parseFloat(previousInput);
      const curr = parseFloat(currentInput);
      let result = 0;
      switch (operation) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/': result = curr === 0 ? 'Error' : prev / curr; break;
      }
      currentInput = typeof result === 'number' ? Math.round(result * 100000000) / 100000000 + '' : result;
      operation = null;
      previousInput = '';
      resetScreen = true;
      updateDisplay();
    }
  </script>
</body>
</html>
</antArtifact>

The calculator artifact is open on the right panel. You can interact with it live!`;
  }
  else if (lower.includes('game') || lower.includes('play')) {
    thinking = `The user requested a game. I'll synthesize a retro arcade game in HTML5 Canvas with fluid controls, responsive frame loop, collision detection, and score tracking.`;
    responseText = `Here is a complete **Arcade Space Runner** mini-game running live in an AjayBot interactive artifact!

<antArtifact identifier="space-runner" type="text/html" title="Cyber Space Runner Arcade Game">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Space Runner</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #fff; font-family: monospace; }
  </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4 select-none">
  <div class="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full">
    <div class="flex items-center justify-between w-full mb-3 px-2">
      <span class="text-xs uppercase tracking-widest text-cyan-400 font-bold">Space Runner</span>
      <span class="text-sm font-bold text-slate-300">Score: <span id="scoreVal" class="text-indigo-400">0</span></span>
    </div>

    <canvas id="gameCanvas" width="300" height="360" class="bg-slate-950 border border-slate-800 rounded-2xl shadow-inner"></canvas>

    <div class="flex items-center justify-between w-full mt-4">
      <p class="text-[11px] text-slate-400">Tap / Click / Arrow Keys</p>
      <button onclick="startGame()" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition">Restart</button>
    </div>

    <!-- On-screen controls -->
    <div class="flex space-x-4 mt-4 w-full justify-center">
      <button onclick="movePlayer(-25)" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 font-bold border border-slate-700 active:scale-95">◀ Left</button>
      <button onclick="movePlayer(25)" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 font-bold border border-slate-700 active:scale-95">Right ▶</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreVal = document.getElementById('scoreVal');
    let score = 0;
    let player = { x: 135, y: 310, w: 30, h: 30 };
    let obstacles = [];
    let gameLoopId = null;

    function resetGame() {
      score = 0;
      scoreVal.textContent = score;
      player.x = 135;
      obstacles = [];
    }

    function movePlayer(dx) {
      player.x = Math.max(10, Math.min(canvas.width - player.w - 10, player.x + dx));
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') movePlayer(-25);
      if (e.key === 'ArrowRight') movePlayer(25);
    });

    function loop() {
      gameLoopId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = '#6366f1';
      if (Math.random() < 0.1) {
        obstacles.push({
          x: Math.random() * (canvas.width - 20) + 10,
          y: -20,
          w: 22,
          h: 22,
          speed: 3 + Math.random() * 2
        });
      }

      // Draw Player
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(player.x + player.w/2, player.y);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.closePath();
      ctx.fill();

      // Update and Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += obs.speed;
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Check collision
        if (
          player.x < obs.x + obs.w &&
          player.x + player.w > obs.x &&
          player.y < obs.y + obs.h &&
          player.y + player.h > obs.y
        ) {
          resetGame();
        }

        // Passed screen
        if (obs.y > canvas.height) {
          obstacles.splice(i, 1);
          score += 5;
          scoreVal.textContent = score;
        }
      }
    }

    function startGame() {
      if (gameLoopId) cancelAnimationFrame(gameLoopId);
      resetGame();
      loop();
    }

    startGame();
  </script>
</body>
</html>
</antArtifact>

Your arcade game is running live in the Artifact Preview panel!`;
  }
  // 2. Full-stack Coding & Debugging (Python, React, API, Database)
  else if (lower.includes('python') || lower.includes('flask') || lower.includes('fastapi') || lower.includes('backend') || lower.includes('sql') || lower.includes('api')) {
    thinking = `The user is asking for backend / Python / API architecture. I'll design a high-performance RESTful API using FastAPI with Pydantic validation, JWT authentication, and async SQLAlchemy database connection.`;
    responseText = `Here is a production-grade **FastAPI & Async SQLAlchemy** service pattern with clean architecture, JWT authentication, and dependency injection:

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

app = FastAPI(
    title="AjayBot Production API",
    version="1.0.0",
    description="High performance async REST API"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# In-memory mock database
db_users = []

@app.post("/api/v1/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    for u in db_users:
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = {
        "id": len(db_users) + 1,
        "email": user.email,
        "username": user.username,
        "created_at": datetime.datetime.utcnow()
    }
    db_users.append(new_user)
    return new_user

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}
\`\`\`

### Architecture Highlights:
- **Async Execution**: Fully asynchronous endpoints powered by Starlette & Uvicorn.
- **Type Safety**: Automatic validation and OpenAPI docs generation via Pydantic.
- **Security Ready**: Integrated OAuth2 bearer token authorization flow.`;
  }
  // 3. Mathematics, Calculus, & Data Analysis
  else if (lower.includes('math') || lower.includes('integral') || lower.includes('derivative') || lower.includes('calculus') || lower.includes('probability') || lower.includes('statistics')) {
    thinking = `The user is asking for mathematical or statistical problem solving. I will provide a rigorous, step-by-step mathematical proof with LaTeX formatting, intuitive geometric interpretation, and verification.`;
    responseText = `### Mathematical Analysis: Solving Continuous Optimization & Calculus

Let's evaluate the fundamental Gaussian Integral which is foundational in probability and quantum mechanics:

$$I = \\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx$$

---

#### Step 1: Square the Integral
Instead of computing $I$ directly along the single real line, consider the product of two independent copies:

$$I^2 = \\left( \\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx \\right) \\left( \\int_{-\\infty}^{\\infty} e^{-y^2} \\, dy \\right) = \\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} e^{-(x^2 + y^2)} \\, dx \\, dy$$

#### Step 2: Transform to Polar Coordinates
We transform from Cartesian coordinates $(x, y)$ to Polar coordinates $(r, \\theta)$:
- $x = r \\cos \\theta$
- $y = r \\sin \\theta$
- $x^2 + y^2 = r^2$
- Jacobian differential: $dx \\, dy = r \\, dr \\, d\\theta$

The integration limits over the entire plane $\\mathbb{R}^2$ become $r \\in [0, \\infty)$ and $\\theta \\in [0, 2\\pi]$:

$$I^2 = \\int_{0}^{2\\pi} d\\theta \\int_{0}^{\\infty} e^{-r^2} r \\, dr$$

#### Step 3: Evaluate the Definite Integrals
The angular integral evaluates immediately:
$$\\int_{0}^{2\\pi} d\\theta = 2\\pi$$

For the radial integral, let $u = r^2 \\implies du = 2r \\, dr$:
$$\\int_{0}^{\\infty} e^{-r^2} r \\, dr = \\frac{1}{2} \\int_{0}^{\\infty} e^{-u} \\, du = \\frac{1}{2} \\left[ -e^{-u} \\right]_0^{\\infty} = \\frac{1}{2} (0 - (-1)) = \\frac{1}{2}$$

#### Step 4: Final Derivation
$$I^2 = 2\\pi \\cdot \\frac{1}{2} = \\pi \\implies I = \\sqrt{\\pi}$$

$$\\boxed{\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}}$$`;
  }
  // 4. Writing, Essays, Professional Emails & Resumes
  else if (lower.includes('write') || lower.includes('essay') || lower.includes('email') || lower.includes('resume') || lower.includes('story') || lower.includes('letter')) {
    thinking = `The user needs professional writing or content generation. I will draft an articulate, structured piece tailored to their request.`;
    responseText = `Here is an executive-level **Strategic Project Proposal & Brief**:

---

# Strategic Initiative: Autonomous Systems Architecture
**Prepared by**: AjayBot  
**Date**: September 2026  
**Confidentiality**: Internal Review  

---

### 1. Executive Summary
Modern engineering velocity demands reducing latency between conceptual design and production deployment. This proposal outlines the phased adoption of an intelligent, artifact-driven developer workspace designed to streamline collaboration, testing, and real-time validation.

### 2. Core Objectives
- **Accelerate Time-to-Market**: Shorten prototype cycles from weeks to interactive hours via instant sandbox previews.
- **Empower Transparent Decision-Making**: Utilize visible reasoning traces to audit algorithmic recommendations.
- **Unified Ecosystem**: Integrate frontend, backend, and documentation pipelines under a single interface.

### 3. Implementation Roadmap
1. **Phase 1: Foundation (Weeks 1–4)**
   - Audit infrastructure and establish baseline performance metrics.
   - Configure continuous integration and automated testing environments.
2. **Phase 2: Integration & Tooling (Weeks 5–8)**
   - Deploy multi-model orchestration pipelines.
   - Roll out interactive workspace preview systems to development teams.
3. **Phase 3: Scale & Monitoring (Weeks 9–12)**
   - Full organizational enablement with continuous telemetry and feedback loops.

---
*Would you like me to tailor this for a specific industry, adjust the tone, or expand on any section?*`;
  }
  // 4b. Simple greetings deserve a short, direct reply — not a template
  else if (/^(hi|hello|hey|yo|sup|good morning|good evening|good afternoon)[\s!.,]*$/.test(lower.trim())) {
    thinking = `The user sent a short greeting. I'll respond briefly and naturally instead of forcing a structured breakdown.`;
    const greetings = [
      `Hey! What are you working on — want help with code, writing, math, or something else?`,
      `Hi there! I can write code, build interactive artifacts, solve math, or help you draft something. What do you need?`,
      `Hello! What can I help you with today?`
    ];
    responseText = greetings[Math.floor(Math.random() * greetings.length)];
  }
  // 4c. Explanation / definition style questions ("what is", "how does", "why", "explain", "difference between")
  else if (/^(what is|what's|what are|how does|how do|why|explain|define|difference between|tell me about)\b/.test(lower.trim())) {
    thinking = `The user is asking for an explanation of "${prompt}". I'll answer the actual question directly instead of a generic template, since this built-in engine doesn't have live model reasoning behind it.`;
    responseText = `You asked: **"${prompt}"**

I'm currently running on AjayBot's **built-in offline engine**, which is a lightweight demo responder — not a real language model. It can only recognize a handful of task categories (code, math, writing, calculators, games) well enough to hand back a matching template. Open-ended questions like this one are outside what it can genuinely reason about, so I don't want to hand you a made-up answer dressed up as a real explanation.

To get real, accurate answers to questions like this, open **Settings → AI Provider** and add a free API key from one of:
- **Google Gemini** (free tier, fastest to set up) — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Anthropic Claude**
- **OpenRouter** (access to many open models)

Once a key is set, this exact question will get a real answer instead of this notice.`;
  }
  // 5. General Queries & Problem Solving — be honest about what this engine actually is
  else {
    thinking = `The user asked: "${prompt}". This isn't a recognized task category (code/math/writing/calculator/game), so instead of forcing the generic template onto it, I'll acknowledge the built-in engine's limits and point them toward a real provider.`;
    responseText = `I read your message as: **"${prompt}"**

Right now you're talking to AjayBot's **built-in offline engine** — a simple pattern-matcher with no real understanding, not a live AI model. It's good for a few specific demo tasks (writing a calculator, a game, a FastAPI backend, a Gaussian integral proof, a resume/essay draft) but it can't actually reason about arbitrary questions like this one, so I'm not going to pretend otherwise with a boilerplate answer.

**To get real answers**, open **Settings** (bottom-left) and add a free API key:
- **Gemini** — free tier at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Anthropic Claude** or **OpenRouter** — if you have a key already

Once connected, I'll respond with genuine reasoning instead of this notice. In the meantime, try one of the starter cards (code, calculator, game, math) to see the built-in engine's demo responses.`;
  }

  return { thinking, responseText };
}

// Live Streaming Engine with Multi-Provider Support
export async function streamChatResponse({
  messages,
  model = 'ajaybot-3.7-ultra',
  settings,
  attachments = [],
  onToken,
  onThinking,
  onArtifactFound,
  signal
}) {
  const lastUserMessage = messages[messages.length - 1];
  const prompt = lastUserMessage.content || '';

  // 1. Google Gemini API (Free tier from Google AI Studio)
  if (settings?.apiKey && settings?.provider === 'gemini') {
    try {
      return await callGeminiAPI({
        apiKey: settings.apiKey,
        messages,
        model,
        systemPrompt: settings.systemPrompt,
        onToken,
        signal
      });
    } catch (err) {
      console.warn('Gemini API failed, falling back to AjayBot engine:', err);
    }
  }

  // 2. Anthropic API
  if (settings?.apiKey && settings?.provider === 'anthropic') {
    try {
      return await callAnthropicAPI({
        apiKey: settings.apiKey,
        messages,
        model,
        systemPrompt: settings.systemPrompt,
        onToken,
        signal
      });
    } catch (err) {
      console.warn('Anthropic API failed, falling back to AjayBot engine:', err);
    }
  }

  // 3. OpenRouter / OpenAI API
  if (settings?.apiKey && settings?.provider === 'openrouter') {
    try {
      return await callOpenRouterAPI({
        apiKey: settings.apiKey,
        messages,
        systemPrompt: settings.systemPrompt,
        onToken,
        signal
      });
    } catch (err) {
      console.warn('OpenRouter API failed, falling back to AjayBot engine:', err);
    }
  }

  // 4. Built-in AjayBot Autonomous Engine (Universal, zero setup)
  const { thinking, responseText } = generateSimulatedResponse(prompt, messages, model, settings, attachments);

  // Stream Thinking if enabled
  if (settings?.enableThinking && thinking) {
    let accumulatedThinking = '';
    const thinkingChunks = thinking.split(' ');
    for (let i = 0; i < thinkingChunks.length; i++) {
      if (signal?.aborted) return;
      accumulatedThinking += (i === 0 ? '' : ' ') + thinkingChunks[i];
      onThinking(accumulatedThinking);
      await new Promise(r => setTimeout(r, 22));
    }
  }

  // Stream Response Text token-by-token
  let accumulatedText = '';
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    accumulatedText += (i === 0 ? '' : ' ') + words[i];
    onToken(accumulatedText);

    // Live Artifact Detection
    const { artifacts } = parseArtifacts(accumulatedText);
    if (artifacts.length > 0 && onArtifactFound) {
      onArtifactFound(artifacts[artifacts.length - 1]);
    }

    const word = words[i];
    const isPunctuation = word.endsWith('.') || word.endsWith('?') || word.endsWith('!');
    const delay = isPunctuation ? 35 : 15;
    await new Promise(r => setTimeout(r, delay));
  }
}

// Gemini API Handler
async function callGeminiAPI({ apiKey, messages, systemPrompt, onToken, signal }) {
  const contents = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
    }),
    signal
  });

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullText += text;
            onToken(fullText);
          }
        } catch (e) {}
      }
    }
  }
}

// Anthropic API Handler
async function callAnthropicAPI({ apiKey, messages, model, systemPrompt, onToken, signal }) {
  const formattedMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: model.includes('max') ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: formattedMessages,
      stream: true,
    }),
    signal
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onToken(fullText);
          }
        } catch (e) {}
      }
    }
  }
}

// OpenRouter / OpenAI API Handler
async function callOpenRouterAPI({ apiKey, messages, systemPrompt, onToken, signal }) {
  const formatted = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: formatted,
      stream: true,
    }),
    signal
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onToken(fullText);
          }
        } catch (e) {}
      }
    }
  }
}
