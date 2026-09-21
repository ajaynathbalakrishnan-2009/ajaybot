import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit, Sparkles } from 'lucide-react';

export default function ThinkingBlock({ thinking, isStreaming = false }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!thinking) return null;

  return (
    <div className="mb-4 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden text-xs transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition select-none"
      >
        <div className="flex items-center space-x-2">
          {isStreaming ? (
            <div className="flex items-center space-x-1.5 text-brand-primary">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span className="font-semibold">Deep Reasoning in progress...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-indigo-200">Reasoning Process (3.2s)</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <span className="text-[11px] font-medium">{isOpen ? 'Collapse' : 'Inspect reasoning'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-3 border-t border-indigo-500/20 dark:border-indigo-500/20 bg-white/60 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-[12px] whitespace-pre-wrap selection:bg-brand-primary/30">
          {thinking}
          {isStreaming && <span className="inline-block w-1.5 h-3.5 ml-1 bg-brand-primary animate-pulse" />}
        </div>
      )}
    </div>
  );
}
