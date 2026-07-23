import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { api } from '../api.js';

export default function GlobalSearch({ onOpenResult }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await api.globalSearch(q);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [q]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result) => {
    onOpenResult(result.module, result.id);
    setQ('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-80">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search everything…"
          className="w-full text-sm border border-ink/15 rounded-sm pl-9 pr-8 py-1.5 bg-paper focus:outline-none focus:border-brass focus:bg-white transition-colors"
        />
        {q && (
          <button
            onClick={() => {
              setQ('');
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-light/50 hover:text-ink"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-ink/15 rounded-sm shadow-card-hover max-h-96 overflow-y-auto z-50">
          {loading && <p className="px-4 py-3 text-sm text-ink-light/60">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-light/60">No matches found.</p>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={`${r.module}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-brass/5 border-b border-ink/[0.05] last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink truncate">{r.title}</span>
                  {r.status && (
                    <span className="text-xs font-mono uppercase text-ink-light/60 shrink-0 ml-2">{r.status.replace(/_/g, ' ')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-brass font-medium">{r.moduleLabel}</span>
                  {r.subtitle && <span className="text-xs text-ink-light/60 truncate">— {r.subtitle}</span>}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
