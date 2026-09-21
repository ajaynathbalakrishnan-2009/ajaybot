# ⚡ AjayBot: Modern Open Source AI Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ajaynathbalakrishnan-2009/ajaybot/pulls)

**AjayBot** is an open-source, multi-task AI companion and developer workspace engineered with interactive **Artifacts**, provider-aware model routing, a local demo engine, and secure server-side connectivity to Google Gemini, OpenRouter, and Anthropic.

Styled in a sleek **Midnight Obsidian & Electric Indigo** palette with subtle glassmorphic surfaces.

---

## ✨ Key Capabilities

### 1. 🚀 Universal Multi-Task Intelligence
- **Full-Stack Software Engineering**: Generates production-ready backend architectures (FastAPI, Express, Django), modern frontend UI components, SQL schemas, algorithm implementations, and real-time debugging.
- **Interactive Live Artifacts**: When creating web applications, games, calculators, or diagrams, an isolated sandbox panel opens side-by-side with real-time execution and syntax-highlighted code inspection.
- **Mathematics & Calculus Proofs**: Formulates step-by-step rigorous proofs, integral derivations, linear algebra, and physics computations with LaTeX rendering.
- **Strategic Writing & Analysis**: Drafts executive project briefs, resumes, technical specifications, and creative literature.
- **Attachment & Code Analysis**: Upload and analyze source code files, documents, data CSVs, and images directly in chat.

### 2. 🧠 Analysis Status
- Shows a concise generation status/analysis summary rather than exposing private chain-of-thought.
- Provider and model status can be surfaced while a response streams.

### 3. 🔌 Multi-Provider Connectivity
Configure your preferred AI backend seamlessly via Settings:
- **Demo Engine**: A local rule-based demo mode for artifacts and sample workflows.
- **Google Gemini**: Server-side streaming using configurable current Gemini model IDs.
- **OpenRouter**: Server-side streaming using configurable model IDs.
- **Anthropic**: Server-side streaming using configurable Claude model IDs.
- **No API keys in browser storage**: Provider secrets are read only by the backend from environment variables.

### 4. 🎨 Distinct Modern Aesthetic
- Sleek **Midnight Obsidian & Electric Indigo/Cyan** theme.
- Modern `Plus Jakarta Sans` display headings paired with `Inter` body typography and `JetBrains Mono` code blocks.
- Glassmorphic translucent surfaces and glowing indicators.
- Instant Light / Dark mode toggle.

### 5. 🔒 Local Privacy & Session Management
- Conversations, UI settings, and theme are stored locally in the browser.
- Provider API keys are **not** stored in localStorage; they belong in the server environment.
- No analytics or telemetry is included by default.
- Chat renaming, inline message editing, and keyboard shortcuts are supported.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ajaynathbalakrishnan-2009/ajaybot.git
   cd ajaybot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create your local environment file**:
   ```bash
   copy .env.example .env
   ```
   Then add at least one provider key to `.env`.

4. **Start both the backend and frontend**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:5173](http://localhost:5173). The backend runs on `http://localhost:8787`.

---

## 🔐 Provider Configuration

The browser never receives provider API keys. Configure one or more of these in `.env`:

```env
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
```

Optional model overrides are documented in `.env.example`. Current provider model IDs should be kept configurable because providers can change availability.

### Health check

With the backend running, open:

```
http://localhost:8787/api/health
```

It reports which provider keys are configured without returning their values.

---

## 🛠️ Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 💡 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` / `Cmd + K` | Start new conversation |
| `Enter` | Send prompt |
| `Shift + Enter` | New line in chat input |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve AjayBot:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

Developed with ❤️ by **[Ajaynath Balakrishnan](https://github.com/ajaynathbalakrishnan-2009)**.
