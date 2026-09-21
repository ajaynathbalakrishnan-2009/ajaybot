import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  Terminal,
  Cpu
} from 'lucide-react';

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  theme,
  onToggleTheme,
  onOpenSettings,
  isOpen,
  onCloseSidebar,
  userName = 'Ajay'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveRename = (chatId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseSidebar}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-brand-sidebar-light dark:bg-brand-sidebar border-r border-brand-border-light dark:border-brand-border transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 flex items-center justify-between border-b border-brand-border-light dark:border-brand-border">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewChat}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center text-white shadow-brand-glow">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                AjayBot
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-bold">
                Open Source AI
              </span>
            </div>
          </div>

          <button
            onClick={onCloseSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white dark:bg-brand-surface hover:bg-slate-50 dark:hover:bg-brand-surface-hover text-slate-800 dark:text-slate-100 text-sm font-medium border border-brand-border-light dark:border-brand-border shadow-xs hover:border-brand-primary/50 transition active:scale-[0.99] group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-brand-primary/15 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-display font-medium text-xs">New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-200/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary border border-transparent focus:border-brand-primary/40"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            History
          </div>

          {filteredChats.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              No conversations found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = chat.id === editingChatId;

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                    isActive
                      ? 'bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary dark:text-indigo-300 font-semibold border border-brand-primary/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-primary' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(chat.id, e);
                          if (e.key === 'Escape') cancelRename(e);
                        }}
                        className="w-full bg-white dark:bg-slate-900 px-1 py-0.5 text-xs rounded border border-brand-primary text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{chat.title}</span>
                    )}
                  </div>

                  {/* Action buttons (Rename / Delete) */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveRename(chat.id, e)}
                          className="p-1 hover:text-emerald-400 text-slate-400"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-1 hover:text-slate-400 text-slate-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startEditing(chat, e)}
                          title="Rename"
                          className="p-1 hover:text-slate-700 dark:hover:text-slate-200 text-slate-400 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          title="Delete"
                          className="p-1 hover:text-red-400 text-slate-400 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom User Profile & Settings */}
        <div className="p-3 border-t border-brand-border-light dark:border-brand-border bg-slate-100/60 dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userName ? userName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-brand-primary dark:text-indigo-400 block font-mono">
                  Autonomous AI
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                title="Settings"
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
