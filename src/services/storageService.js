// LocalStorage persistence service for AjayBot

const STORAGE_KEYS = {
  CHATS: 'ajaybot_chats',
  ACTIVE_CHAT: 'ajaybot_active_chat',
  SETTINGS: 'ajaybot_settings',
  THEME: 'ajaybot_theme',
};

const DEFAULT_SETTINGS = {
  model: 'balanced',
  enableThinking: true,
  systemPrompt: 'You are AjayBot, a thoughtful, articulate, and helpful AI assistant. Provide clear, accurate, well-structured answers.',
  provider: 'auto', // 'auto' | 'simulated' | 'gemini' | 'openrouter' | 'anthropic' | 'ollama',
  userName: 'Ajay',
};

const INITIAL_CHATS = [
  {
    id: 'welcome-chat',
    title: 'Welcome to AjayBot',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        thinking: 'The user has just opened AjayBot for the first time. I should give them a warm, articulate greeting, introducing my capabilities, Artifacts system, collapsible reasoning engine, and configuration options.',
        content: `Hello! I'm **AjayBot**, your AI assistant powered by deep reasoning and interactive artifact capabilities.

### What can I do for you today?
- **Interactive Artifacts**: When creating web apps, diagrams, or code, I render them in a real-time side panel where you can preview and test them instantly.
- **Deep Reasoning**: See my step-by-step thinking process on complex programming, math, and writing challenges.
- **Code & Markdown**: Syntax highlighting, copyable snippets, and clean document authoring.
- **Customizable**: Choose between different AjayBot models, configure custom system prompts, or connect a server-configured AI provider in Settings.

Feel free to ask a question, request code, or try one of the suggestions below!`,
      }
    ]
  }
];

export const getStoredChats = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHATS);
    return data ? JSON.parse(data) : INITIAL_CHATS;
  } catch (e) {
    console.error('Error loading chats from storage', e);
    return INITIAL_CHATS;
  }
};

export const saveChats = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error('Error saving chats to storage', e);
  }
};

export const getActiveChatId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT) || 'welcome-chat';
  } catch (e) {
    return 'welcome-chat';
  }
};

export const saveActiveChatId = (id) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, id);
  } catch (e) {
    console.error('Error saving active chat id', e);
  }
};

export const getStoredSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    if (!['flagship', 'fast', 'balanced', 'pro'].includes(parsed.model)) {
      parsed.model = 'balanced';
    }
    delete parsed.apiKey;
    delete parsed.apiKeys;
    if (!['auto', 'flagship', 'fast', 'balanced', 'pro'].includes(parsed.model)) {
      parsed.model = 'balanced';
    }
    if (!['auto', 'simulated', 'gemini', 'openrouter', 'anthropic', 'ollama'].includes(parsed.provider)) {
      parsed.provider = 'auto';
    }
    return parsed;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch (e) {
    return 'light';
  }
};

export const saveStoredTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
};
