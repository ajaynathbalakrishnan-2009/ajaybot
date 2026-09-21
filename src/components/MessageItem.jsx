import React, { useState } from 'react';
import { Copy, Check, RotateCw, ThumbsUp, ThumbsDown, Edit3, Sparkles, User, FileText, Image as ImageIcon } from 'lucide-react';
import ThinkingBlock from './ThinkingBlock';
import { MarkdownRenderer } from '../utils/markdown';

export default function MessageItem({
  message,
  isStreaming,
  onRetry,
  onEdit,
  onOpenArtifact,
  userName = 'Ajay'
}) {
  const [copied, setCopied] = useState(false);
  const [thumbState, setThumbState] = useState(null); // 'up' | 'down' | null
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit && onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div className={`py-6 px-4 md:px-6 transition-colors group ${
      isUser ? 'bg-transparent' : 'bg-slate-50/60 dark:bg-brand-surface/40 border-y border-slate-200/60 dark:border-brand-border/60'
    }`}>
      <div className="max-w-3xl mx-auto flex items-start space-x-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold shadow-xs">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan text-white flex items-center justify-center shadow-brand-glow">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header metadata */}
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-display font-bold text-slate-900 dark:text-white">
              {isUser ? userName : 'AjayBot'}
            </span>
            {!isUser && message.model && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-indigo-500 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                {message.model.replace('ajaybot-', '')}
              </span>
            )}
            {message.timestamp && (
              <span className="text-[11px] text-stone-400">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* User message edit mode */}
          {isUser && isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c96442]/50"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-xs font-medium bg-[#c96442] hover:bg-[#b25333] text-white rounded-lg transition"
                >
                  Save & Submit
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Attachments (if user message) */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {message.attachments.map((file, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-w-xs">
                      {file.isImage ? (
                        <img src={file.dataUrl} alt={file.name} className="max-h-48 w-auto object-cover" />
                      ) : (
                        <div className="flex items-center space-x-2 p-2.5 bg-stone-100 dark:bg-stone-800 text-xs">
                          <FileText className="w-4 h-4 text-[#c96442]" />
                          <span className="font-medium truncate">{file.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible Thinking block (if assistant and has thinking) */}
              {!isUser && message.thinking && (
                <ThinkingBlock
                  thinking={message.thinking}
                  isStreaming={isStreaming && !message.content}
                />
              )}

              {/* Main text content */}
              {message.content ? (
                <div className={isStreaming ? 'typing-cursor' : ''}>
                  <MarkdownRenderer
                    content={message.content}
                    onOpenArtifact={onOpenArtifact}
                  />
                </div>
              ) : (
                isStreaming && (
                  <div className="flex items-center space-x-1.5 py-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-brand-violet animate-bounce [animation-delay:0.4s]" />
                  </div>
                )
              )}
            </>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 mt-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
            <button
              onClick={handleCopy}
              title="Copy text"
              className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {isUser ? (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit message"
                className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.id)}
                    title="Retry response"
                    className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setThumbState(thumbState === 'up' ? null : 'up')}
                  title="Good response"
                  className={`p-1 rounded transition ${thumbState === 'up' ? 'text-emerald-500' : 'hover:text-stone-700 dark:hover:text-stone-200'}`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThumbState(thumbState === 'down' ? null : 'down')}
                  title="Poor response"
                  className={`p-1 rounded transition ${thumbState === 'down' ? 'text-red-500' : 'hover:text-stone-700 dark:hover:text-stone-200'}`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
