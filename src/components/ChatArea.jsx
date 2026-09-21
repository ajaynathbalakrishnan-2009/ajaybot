import React, { useRef, useEffect } from 'react';
import {
  Menu,
  Layout,
  Calculator,
  Code2,
  Gamepad2,
  Atom,
  PenTool,
  Plus,
  Cpu,
  Sparkles
} from 'lucide-react';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';

export default function ChatArea({
  activeChat,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  onRetryMessage,
  onEditMessage,
  currentModelId,
  onSelectModel,
  onOpenSidebar,
  onNewChat,
  activeArtifact,
  onOpenArtifact,
  isArtifactPanelOpen,
  onToggleArtifactPanel,
  userName = 'Ajay'
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isStreaming]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const samplePrompts = [
    {
      title: 'Full-Stack & Systems Coding',
      desc: 'Build a FastAPI backend with async SQLAlchemy, JWT auth & validation',
      prompt: 'Write a production-grade FastAPI and SQLAlchemy backend architecture with JWT authentication',
      icon: <Code2 className="w-5 h-5 text-brand-primary" />
    },
    {
      title: 'Glassmorphic Cyber Calculator',
      desc: 'Interactive live artifact with animations and keyboard support',
      prompt: 'Build an interactive modern cyber glassmorphic calculator with live preview artifact',
      icon: <Calculator className="w-5 h-5 text-brand-cyan" />
    },
    {
      title: 'Arcade Space Runner Game',
      desc: 'Canvas 2D playable mini-game with score tracking & controls',
      prompt: 'Code a playable retro arcade space runner game in an interactive artifact',
      icon: <Gamepad2 className="w-5 h-5 text-brand-emerald" />
    },
    {
      title: 'Mathematics & Calculus Proofs',
      desc: 'Step-by-step Gaussian integral derivation with polar coordinates & LaTeX',
      prompt: 'Solve the Gaussian Integral step-by-step with polar coordinate transformation and LaTeX formulas',
      icon: <Atom className="w-5 h-5 text-brand-violet" />
    }
  ];

  const messages = activeChat?.messages || [];

  return (
    <main className="flex-1 flex flex-col h-full bg-brand-bg-light dark:bg-brand-bg overflow-hidden relative">
      {/* Top Navbar */}
      <header className="h-14 border-b border-brand-border-light dark:border-brand-border flex items-center justify-between px-4 bg-white/70 dark:bg-brand-bg/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="truncate">
            <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100 truncate">
              {activeChat?.title || 'New Conversation'}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Artifact Toggle Button */}
          {activeArtifact && (
            <button
              onClick={onToggleArtifactPanel}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                isArtifactPanelOpen
                  ? 'bg-brand-primary/15 border-brand-primary/40 text-brand-primary'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-primary'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isArtifactPanelOpen ? 'Hide Artifact' : 'View Artifact'}
              </span>
            </button>
          )}

          <button
            onClick={onNewChat}
            title="Start new conversation"
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 flex flex-col items-center text-center">
            {/* Glowing Brand Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary via-indigo-500 to-brand-cyan flex items-center justify-center text-white shadow-brand-glow">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-brand-bg flex items-center justify-center text-[10px] text-white">
                ✓
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-10 max-w-md">
              AjayBot is ready to write code, solve mathematics, craft documents, or build interactive live artifacts.
            </p>

            {/* Task Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
              {samplePrompts.map((item, index) => (
                <div
                  key={index}
                  onClick={() => onSendMessage(item.prompt, [])}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-brand-border bg-white dark:bg-brand-surface hover:border-brand-primary/50 dark:hover:border-brand-primary/50 hover:shadow-brand-card transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-primary transition font-display">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Messages Stream */
          <div className="pb-6">
            {messages.map((message, index) => (
              <MessageItem
                key={message.id || index}
                message={message}
                userName={userName}
                isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                onRetry={onRetryMessage}
                onEdit={onEditMessage}
                onOpenArtifact={onOpenArtifact}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Chat Input */}
      <div className="shrink-0 bg-gradient-to-t from-brand-bg-light via-brand-bg-light/90 to-transparent dark:from-brand-bg dark:via-brand-bg/90 pt-4">
        <ChatInput
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={onStopStreaming}
          currentModelId={currentModelId}
          onSelectModel={onSelectModel}
        />
      </div>
    </main>
  );
}
