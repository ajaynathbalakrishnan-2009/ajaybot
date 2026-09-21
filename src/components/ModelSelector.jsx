import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap, BookOpen, Check, Cpu } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/chatService';

export default function ModelSelector({ currentModelId, onSelectModel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === currentModelId) || AVAILABLE_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (id) => {
    if (id.includes('ultra')) return <Cpu className="w-4 h-4 text-brand-primary" />;
    if (id.includes('flash')) return <Zap className="w-4 h-4 text-brand-cyan" />;
    if (id.includes('max')) return <BookOpen className="w-4 h-4 text-brand-violet" />;
    return <Sparkles className="w-4 h-4 text-brand-primary" />;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        {getModelIcon(currentModel.id)}
        <span className="font-semibold font-display">{currentModel.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-brand-surface shadow-brand-popover border border-slate-200 dark:border-brand-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Intelligence Model
          </div>
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = model.id === currentModelId;
            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 flex items-start space-x-3 transition ${
                  isSelected
                    ? 'bg-brand-primary/10 dark:bg-brand-primary/15 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="mt-0.5">{getModelIcon(model.id)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold font-display">{model.name}</span>
                    {model.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-brand-primary/15 text-brand-primary">
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {model.tagline}
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
