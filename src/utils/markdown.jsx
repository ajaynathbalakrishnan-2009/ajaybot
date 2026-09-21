import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, Code2, Sparkles, Layout } from 'lucide-react';

// Code block component with copy button
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0c101b] text-slate-100 text-sm shadow-brand-card">
      <div className="flex items-center justify-between px-4 py-2 bg-[#141b2d] border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2 font-mono">
          <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 hover:text-white transition px-2 py-1 rounded hover:bg-white/5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Artifact Badge / Card inside message stream
function ArtifactCard({ title, type, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="my-3 p-3.5 rounded-2xl border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 dark:bg-brand-primary/10 dark:hover:bg-brand-primary/15 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
    >
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center text-white shadow-xs">
          <Layout className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary dark:text-indigo-400">Artifact</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {type.includes('html') ? 'HTML App' : type.includes('react') ? 'React App' : 'Code Tool'}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-primary transition">
            {title}
          </h4>
        </div>
      </div>
      <div className="flex items-center space-x-1 text-xs font-semibold text-brand-primary dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
        <span>Open Preview</span>
        <ExternalLink className="w-4 h-4" />
      </div>
    </div>
  );
}

// Markdown renderer
export function MarkdownRenderer({ content = '', onOpenArtifact }) {
  if (!content) return null;

  // Process and replace <antArtifact> with clickable artifact cards
  const artifactRegex = /<antArtifact\s+identifier="([^"]+)"\s+type="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/antArtifact>/gi;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = artifactRegex.exec(content)) !== null) {
    const [fullMatch, identifier, type, title, code] = match;
    const startIndex = match.index;

    // Text before artifact
    if (startIndex > lastIndex) {
      segments.push({
        type: 'text',
        data: content.substring(lastIndex, startIndex),
      });
    }

    // Artifact item
    segments.push({
      type: 'artifact',
      identifier,
      artifactType: type,
      title,
      code: code.trim(),
    });

    lastIndex = startIndex + fullMatch.length;
  }

  // Trailing text
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      data: content.substring(lastIndex),
    });
  }

  return (
    <div className="prose-custom text-slate-800 dark:text-slate-200">
      {segments.map((segment, idx) => {
        if (segment.type === 'artifact') {
          return (
            <ArtifactCard
              key={idx}
              title={segment.title}
              type={segment.artifactType}
              onOpen={() => onOpenArtifact && onOpenArtifact(segment)}
            />
          );
        }
        return <FormattedText key={idx} text={segment.data} />;
      })}
    </div>
  );
}

// Helper to format standard markdown text, code blocks, lists, headers
function FormattedText({ text }) {
  // Split into code blocks and normal paragraphs
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const [full, lang, code] = match;
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      parts.push({ type: 'prose', data: text.substring(lastIndex, startIndex) });
    }

    parts.push({ type: 'code', lang: lang || 'plaintext', code: code.replace(/\n$/, '') });
    lastIndex = startIndex + full.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'prose', data: text.substring(lastIndex) });
  }

  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} language={part.lang} code={part.code} />;
        }

        // Render prose lines
        const lines = part.data.split('\n');
        return (
          <React.Fragment key={pIdx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              // Empty line
              if (!trimmed) {
                return <div key={lIdx} className="h-2.5" />;
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-4 mb-2 font-serif">
                    {parseInline(trimmed.substring(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="text-xl font-semibold text-stone-900 dark:text-stone-100 mt-5 mb-2.5 font-serif">
                    {parseInline(trimmed.substring(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lIdx} className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-6 mb-3 font-serif">
                    {parseInline(trimmed.substring(2))}
                  </h1>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="border-l-4 border-claude-accent pl-4 my-3 text-stone-600 dark:text-stone-300 italic">
                    {parseInline(trimmed.substring(2))}
                  </blockquote>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start space-x-2.5 my-1 pl-2">
                    <span className="text-[#c96442] mt-1.5">•</span>
                    <span className="flex-1 leading-relaxed">{parseInline(trimmed.substring(2))}</span>
                  </div>
                );
              }

              // Horizontal Rule
              if (trimmed === '---' || trimmed === '***') {
                return <hr key={lIdx} className="my-5 border-stone-200 dark:border-stone-800" />;
              }

              // Regular paragraph
              return (
                <p key={lIdx} className="leading-relaxed mb-2.5">
                  {parseInline(line)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

// Inline formatting (bold, italic, inline code)
function parseInline(str) {
  const parts = [];
  // Tokenize bold, italic, code
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match;

  while ((match = tokenRegex.exec(str)) !== null) {
    const raw = match[0];
    const idx = match.index;

    if (idx > lastIdx) {
      parts.push(str.substring(lastIdx, idx));
    }

    if (raw.startsWith('**') && raw.endsWith('**')) {
      parts.push(<strong key={idx} className="font-semibold text-stone-900 dark:text-stone-100">{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      parts.push(<em key={idx} className="italic text-stone-700 dark:text-stone-300">{raw.slice(1, -1)}</em>);
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      parts.push(
        <code key={idx} className="font-mono text-xs px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-[#b94b22] dark:text-[#e07a5f]">
          {raw.slice(1, -1)}
        </code>
      );
    }

    lastIdx = idx + raw.length;
  }

  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }

  return parts.length > 0 ? parts : str;
}
