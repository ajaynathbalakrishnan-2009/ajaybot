import React, { useEffect, useState } from 'react';
import { X, Sliders, Trash2, Check, AlertCircle, Cpu, Globe, Zap, Key, Laptop } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings, onClearAllChats, onSignOut }) {
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData({ ...settings });
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetChats = () => {
    if (window.confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
      onClearAllChats();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-brand-surface rounded-3xl border border-slate-200 dark:border-brand-border w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-brand-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">AjayBot Platform Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              value={formData.userName || ''}
              onChange={(e) => handleChange('userName', e.target.value)}
              placeholder="Ajay"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* AI Engine Provider */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              AI Inference Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['auto', 'Auto Fallback', 'Automatically uses available cloud providers and Ollama as the final fallback.', Sparkles],
                ['simulated', 'Demo Engine', 'Local rule-based demo; no API key required.', Cpu],
                ['gemini', 'Google Gemini', 'Uses the Gemini key configured on the AjayBot server.', Zap],
                ['openrouter', 'OpenRouter', 'Uses the OpenRouter key configured on the AjayBot server.', Globe],
                ['ollama', 'Ollama Local', 'Runs a local model on your computer. No API key required.', Laptop],
                ['anthropic', 'Anthropic', 'Uses the Anthropic key configured on the AjayBot server.', Key],
              ].map(([id, name, description, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleChange('provider', id)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    formData.provider === id
                      ? 'border-brand-primary bg-brand-primary/10 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-semibold text-xs mb-1">
                    <Icon className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Server-side credentials */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-brand-primary" />
              API keys are no longer stored in this browser.
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Auto Fallback uses any configured cloud provider and finishes with Ollama Local. Configure cloud API keys in .env; Ollama does not need an API key.
            </p>
          </div>

          {/* Reasoning / Thinking toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-brand-border bg-slate-50/50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Analysis Status
              </span>
              <span className="text-[11px] text-slate-400">
                Show a concise analysis/status summary instead of private chain-of-thought.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableThinking}
                onChange={(e) => handleChange('enableThinking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          {/* Custom Persona */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Custom Persona / Instructions
            </label>
            <textarea
              rows={3}
              value={formData.systemPrompt || ''}
              onChange={(e) => handleChange('systemPrompt', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs leading-relaxed border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Clear Data */}
          <div className="pt-2 border-t border-slate-200 dark:border-brand-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSignOut}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Sign out
            </button>
            <div className="flex items-center justify-between flex-1">
              <span className="text-xs text-slate-500">Reset conversation history</span>
            <button
              type="button"
              onClick={handleResetChats}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all chats</span>
            </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-200 dark:border-brand-border bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 text-xs font-medium bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl shadow-brand-glow transition"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
