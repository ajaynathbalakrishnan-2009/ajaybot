import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Eye, Code, RotateCw, ExternalLink } from 'lucide-react';

export default function ArtifactPanel({ artifact, onClose }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (artifact?.type?.includes('html') || artifact?.type?.includes('svg')) {
      setActiveTab('preview');
    } else {
      setActiveTab('code');
    }
  }, [artifact?.identifier]);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = artifact.type.includes('html') ? '.html' : artifact.type.includes('svg') ? '.svg' : '.txt';
    const filename = `${artifact.identifier || 'artifact'}${ext}`;
    const mimeType = artifact.type.includes('html')
      ? 'text/html;charset=utf-8'
      : artifact.type.includes('svg')
        ? 'image/svg+xml;charset=utf-8'
        : 'text/plain;charset=utf-8';
    const blob = new Blob([artifact.code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setIframeKey(k => k + 1);
  };

  const isExecutable = artifact.type.includes('html') || artifact.type.includes('svg');

  return (
    <aside className="w-full lg:w-[48%] h-full flex flex-col bg-white dark:bg-brand-surface border-l border-slate-200 dark:border-brand-border shadow-2xl z-20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-brand-border bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center space-x-3 truncate">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
          <div className="truncate">
            <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white truncate">
              {artifact.title || artifact.identifier}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {artifact.identifier}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1.5 text-slate-400">
          {/* Tabs */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl mr-2 text-xs font-semibold">
            {isExecutable && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {isExecutable && activeTab === 'preview' && (
            <button
              onClick={handleRefresh}
              title="Refresh Preview"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            title="Download file"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-800 mx-1" />

          <button
            onClick={onClose}
            title="Close Panel"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'preview' && isExecutable ? (
          <iframe
            key={iframeKey}
            srcDoc={artifact.code}
            title={artifact.title}
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none bg-white dark:bg-slate-950"
          />
        ) : (
          <div className="w-full h-full overflow-auto bg-[#090d16] text-slate-200 p-4 font-mono text-xs leading-relaxed">
            <pre className="select-text">
              <code>{artifact.code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-brand-border bg-slate-50/60 dark:bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-mono text-indigo-400">{artifact.type}</span>
        <span>Rendered in AjayBot Isolated Sandbox</span>
      </div>
    </aside>
  );
}
