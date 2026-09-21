import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ArtifactPanel from './components/ArtifactPanel';
import SettingsModal from './components/SettingsModal';
import {
  getStoredChats,
  saveChats,
  getActiveChatId,
  saveActiveChatId,
  getStoredSettings,
  saveStoredSettings,
  getStoredTheme,
  saveStoredTheme,
} from './services/storageService';
import { streamChatResponse, parseArtifacts } from './services/chatService';
import AuthScreen from './components/AuthScreen';
import { supabase, isAuthConfigured } from './lib/supabase';

function AuthenticatedApp() {
  // State
  const [chats, setChats] = useState(getStoredChats);
  const [activeChatId, setActiveChatId] = useState(getActiveChatId);
  const [settings, setSettings] = useState(getStoredSettings);
  const [theme, setTheme] = useState(getStoredTheme);

  // UI Panels
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  // Apply Theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Sync Chats & Active ID to Storage
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  // Keyboard shortcut Ctrl+K / Cmd+K for new chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Inspect existing messages of active chat for existing artifacts
  useEffect(() => {
    if (activeChat && activeChat.messages) {
      for (let i = activeChat.messages.length - 1; i >= 0; i--) {
        const msg = activeChat.messages[i];
        if (msg.role === 'assistant' && msg.content) {
          const { artifacts } = parseArtifacts(msg.content);
          if (artifacts.length > 0) {
            setActiveArtifact(artifacts[artifacts.length - 1]);
            break;
          }
        }
      }
    }
  }, [activeChatId]);

  // Actions
  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNewChat = () => {
    const newId = 'chat-' + Date.now();
    const newChat = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setIsSidebarOpen(false);
    setActiveArtifact(null);
    setIsArtifactPanelOpen(false);
  };

  const handleDeleteChat = (id) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fallback = {
          id: 'chat-' + Date.now(),
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
        };
        setActiveChatId(fallback.id);
        return [fallback];
      }
      if (activeChatId === id) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const handleSelectModel = (modelId) => {
    const updated = { ...settings, model: modelId };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleClearAllChats = () => {
    const freshChat = {
      id: 'chat-' + Date.now(),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats([freshChat]);
    setActiveChatId(freshChat.id);
    setActiveArtifact(null);
    setIsArtifactPanelOpen(false);
  };

  // Chat Execution
  const handleSendMessage = async (prompt, attachments = [], baseMessages = null) => {
    if (!prompt.trim() && attachments.length === 0) return;

    const userMessageId = 'msg-' + Date.now();
    const assistantMessageId = 'msg-' + (Date.now() + 1);

    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: prompt,
      attachments,
      timestamp: new Date().toISOString(),
    };

    const initialAssistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thinking: '',
      model: settings.model,
      timestamp: new Date().toISOString(),
    };

    // Update active chat with messages
    const currentMessages = baseMessages ?? activeChat.messages ?? [];

    // Auto title chat from first prompt if title is default
    const isFirstUserMessage = currentMessages.length === 0;
    const updatedTitle = isFirstUserMessage
      ? prompt.slice(0, 36) + (prompt.length > 36 ? '...' : '')
      : activeChat.title;
    const updatedMessages = [...currentMessages, userMessage, initialAssistantMessage];

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, title: updatedTitle, messages: updatedMessages }
          : c
      )
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      await streamChatResponse({
        messages: updatedMessages.slice(0, -1), // send up to user prompt
        model: settings.model,
        settings,
        attachments,
        signal: abortControllerRef.current.signal,
        onThinking: (thinkingTokens) => {
          setChats(prev =>
            prev.map(c => {
              if (c.id !== activeChatId) return c;
              return {
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantMessageId ? { ...m, thinking: thinkingTokens } : m
                ),
              };
            })
          );
        },
        onToken: (accumulatedTokens) => {
          setChats(prev =>
            prev.map(c => {
              if (c.id !== activeChatId) return c;
              return {
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantMessageId ? { ...m, content: accumulatedTokens } : m
                ),
              };
            })
          );
        },
        onArtifactFound: (artifact) => {
          setActiveArtifact(artifact);
          setIsArtifactPanelOpen(true);
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Streaming error:', err);
        const message = err?.message || 'AjayBot could not reach the AI service.';
        setChats(prev =>
          prev.map(c =>
            c.id === activeChatId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, content: `**AjayBot error**\\n\\n${message}\\n\\nCheck the provider settings and make sure the backend is running.`, thinking: '' }
                      : m
                  )
                }
              : c
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleRetryMessage = (messageId) => {
    // Find index of assistant message to retry
    const msgs = activeChat.messages;
    const idx = msgs.findIndex(m => m.id === messageId);
    if (idx > 0 && msgs[idx - 1].role === 'user') {
      const userPrompt = msgs[idx - 1].content;
      const attachments = msgs[idx - 1].attachments || [];
      // Remove this assistant message and retry
      const trimmed = msgs.slice(0, idx - 1);
      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId ? { ...c, messages: trimmed } : c
        )
      );
      handleSendMessage(userPrompt, attachments, trimmed);
    }
  };

  const handleEditMessage = (messageId, newContent) => {
    const msgs = activeChat.messages;
    const idx = msgs.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      // Trim all messages after this edit
      const trimmed = msgs.slice(0, idx);
      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId ? { ...c, messages: trimmed } : c
        )
      );
      handleSendMessage(newContent, [], trimmed);
    }
  };

  const handleOpenArtifact = (artifact) => {
    setActiveArtifact(artifact);
    setIsArtifactPanelOpen(true);
  };

  const handleToggleArtifactPanel = () => {
    setIsArtifactPanelOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg-light dark:bg-brand-bg font-sans text-brand-text-light dark:text-brand-text">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        userName={settings.userName}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <ChatArea
          activeChat={activeChat}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          onRetryMessage={handleRetryMessage}
          onEditMessage={handleEditMessage}
          currentModelId={settings.model}
          onSelectModel={handleSelectModel}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDemoMode={settings.provider === 'simulated'}
          activeArtifact={activeArtifact}
          onOpenArtifact={handleOpenArtifact}
          isArtifactPanelOpen={isArtifactPanelOpen}
          onToggleArtifactPanel={handleToggleArtifactPanel}
          userName={settings.userName}
        />

        {/* Claude Artifacts Split Screen Panel */}
        {isArtifactPanelOpen && activeArtifact && (
          <ArtifactPanel
            artifact={activeArtifact}
            onClose={() => setIsArtifactPanelOpen(false)}
          />
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllChats={handleClearAllChats}
        onSignOut={async () => {
          await supabase.auth.signOut();
        }}
      />
    </div>
  );
}

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isAuthConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getUser()
      .then(async ({ data }) => {
        if (!mounted) return;
        setAuthUser(data.user || null);
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return <div className="min-h-screen w-screen flex items-center justify-center bg-brand-bg-light dark:bg-brand-bg text-slate-500">Loading AjayBot...</div>;
  }

  if (!isAuthConfigured || !authUser) {
    return <AuthScreen />;
  }

  return <AuthenticatedApp />;
}
