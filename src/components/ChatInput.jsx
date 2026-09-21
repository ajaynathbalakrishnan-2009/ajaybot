import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Paperclip, X, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function ChatInput({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  currentModelId,
  onSelectModel,
}) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;
    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            isImage,
            dataUrl: event.target.result,
          },
        ]);
      };
      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 select-none">
      <div className="relative rounded-3xl border border-slate-200 dark:border-brand-border bg-white dark:bg-brand-surface shadow-brand-card transition-all duration-200 focus-within:border-brand-primary/60 dark:focus-within:border-brand-primary/60 focus-within:shadow-brand-glow">
        
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-800"
              >
                {file.isImage ? (
                  <ImageIcon className="w-3.5 h-3.5 text-brand-cyan" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-brand-primary" />
                )}
                <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AjayBot to code, solve math, write, or build an artifact..."
          className="w-full px-5 pt-4 pb-2 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-[15px] focus:outline-none resize-none leading-relaxed max-h-48"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
          <div className="flex items-center space-x-2">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add attachment"
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Model Selector */}
            <ModelSelector
              currentModelId={currentModelId}
              onSelectModel={onSelectModel}
            />
          </div>

          {/* Send / Stop Action Button */}
          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                title="Stop response"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center shadow-xs transition active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                title="Send message"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 ${
                  input.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-indigo-500 hover:to-cyan-400 text-white shadow-brand-glow cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
          AjayBot Open Source AI • Capable of Coding, Mathematics, Writing & Interactive Artifacts
        </span>
      </div>
    </div>
  );
}
