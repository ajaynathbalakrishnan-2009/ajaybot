# ⚡ AjayBot: Modern Open Source AI Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ajaynathbalakrishnan-2009/ajaybot/pulls)

**AjayBot** is an open-source, multi-task AI companion and developer workspace engineered with deep reasoning, live interactive **Artifacts**, multi-model intelligence, and multi-provider connectivity (Autonomous Engine, Google Gemini, OpenRouter, and Anthropic).

Styled in a sleek **Midnight Obsidian & Electric Indigo** palette with subtle glassmorphic surfaces.

---

## ✨ Key Capabilities

### 1. 🚀 Universal Multi-Task Intelligence
- **Full-Stack Software Engineering**: Generates production-ready backend architectures (FastAPI, Express, Django), modern frontend UI components, SQL schemas, algorithm implementations, and real-time debugging.
- **Interactive Live Artifacts**: When creating web applications, games, calculators, or diagrams, an isolated sandbox panel opens side-by-side with real-time execution and syntax-highlighted code inspection.
- **Mathematics & Calculus Proofs**: Formulates step-by-step rigorous proofs, integral derivations, linear algebra, and physics computations with LaTeX rendering.
- **Strategic Writing & Analysis**: Drafts executive project briefs, resumes, technical specifications, and creative literature.
- **Attachment & Code Analysis**: Upload and analyze source code files, documents, data CSVs, and images directly in chat.

### 2. 🧠 Transparent Reasoning ("Thinking Process")
- Follow step-by-step chain-of-thought reasoning before answers with collapsible inspection cards, timing metrics, and verification steps.

### 3. 🔌 Multi-Provider Connectivity
Configure your preferred AI backend seamlessly via Settings:
- **Autonomous Built-in Engine**: Works offline out-of-the-box with zero configuration or API keys.
- **Google Gemini API**: Connect free-tier keys directly from Google AI Studio (`gemini-1.5-flash` / `gemini-2.0-flash`).
- **OpenRouter / OpenAI**: Plug in any open-weights model (Llama-3, Mistral, Qwen) or GPT-4o.
- **Anthropic API**: Direct streaming connection with custom API keys.

### 4. 🎨 Distinct Modern Aesthetic
- Sleek **Midnight Obsidian & Electric Indigo/Cyan** theme.
- Modern `Plus Jakarta Sans` display headings paired with `Inter` body typography and `JetBrains Mono` code blocks.
- Glassmorphic translucent surfaces and glowing indicators.
- Instant Light / Dark mode toggle.

### 5. 🔒 Local Privacy & Session Management
- All conversations and settings are stored locally in your browser (`localStorage`).
- Zero tracking, zero telemetry.
- Instant search, chat renaming, inline message editing, and keyboard shortcuts (`Ctrl + K`).

---

## 🏗️ Project Architecture

```
ajaybot/
├── index.html                  # HTML entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                # Dependencies & build scripts
├── vite.config.js              # Vite bundler configuration
├── tailwind.config.js          # Midnight Obsidian & Electric Indigo tokens
├── LICENSE                     # MIT Open Source License
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Core workspace layout & streaming orchestrator
    ├── index.css               # Glassmorphism, typography & scrollbars
    ├── components/
    │   ├── Sidebar.jsx         # Conversation history, search, and user profile
    │   ├── ChatArea.jsx        # Navigation bar, task capability cards & stream
    │   ├── MessageItem.jsx     # User & Assistant messages, avatars, actions
    │   ├── ThinkingBlock.jsx   # Collapsible chain-of-thought reasoning
    │   ├── ArtifactPanel.jsx   # Split-screen interactive preview & code viewer
    │   ├── ChatInput.jsx       # Floating auto-growing input with attachments
    │   ├── ModelSelector.jsx   # Model tier switcher (Ultra, Turbo, Flash, Max)
    │   └── SettingsModal.jsx   # Multi-provider configuration & persona controls
    ├── services/
    │   ├── chatService.js      # Multi-task AI engine & API streaming client
    │   └── storageService.js   # LocalStorage synchronization
    └── utils/
        └── markdown.jsx        # Markdown parser with interactive Artifact cards
```

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

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

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
