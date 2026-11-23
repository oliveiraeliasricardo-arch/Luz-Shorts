import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpLeft, Clock, Search, X } from 'lucide-react';
import type { ChristianShort } from '../types/shorts';

const RECENT_SEARCHES_KEY = 'gracaplay_recent_searches_v1';
const MAX_RECENT_SEARCHES = 6;
const QUICK_START_SUGGESTIONS = [
  'Novo Hinário Adventista',
  'CD Jovem Adventista',
  'Pr. Alejandro Bullón',
  'Rodrigo Silva Arqueologia',
  'Aline Barros',
  'Feliz7Play',
];

function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function readRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

function persistRecentSearches(list: string[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Ignore storage quota errors
  }
}

interface SearchBoxWithSuggestionsProps {
  value: string;
  onChange: (q: string) => void;
  onSubmit: (q: string) => void;
  onClear?: () => void;
  catalogShorts?: ChristianShort[];
  apiBaseUrl?: string;
  isSearching?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

interface SuggestionItem {
  text: string;
  kind: 'recent' | 'suggest';
}

export const SearchBoxWithSuggestions: React.FC<SearchBoxWithSuggestionsProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
  catalogShorts = [],
  apiBaseUrl = '',
  isSearching = false,
  placeholder = 'Pesquisar louvor, pregação, bíblia ou canal',
  autoFocus = false,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches());
  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecentSearches((prev) => {
      const folded = foldText(clean);
      const next = [clean, ...prev.filter((item) => foldText(item) !== folded)].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      persistRecentSearches(next);
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== term);
      persistRecentSearches(next);
      return next;
    });
  }, []);

  // Fetch live YouTube autocomplete suggestions (debounced 140ms)
  useEffect(() => {
    const trimmed = value.trim();
    if (!open || trimmed.length < 1) {
      setRemoteSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/search/suggest?q=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { suggestions?: string[] };
        if (!cancelled && Array.isArray(data.suggestions)) {
          setRemoteSuggestions(data.suggestions);
        }
      } catch {
        // Keep local matches if offline
      }
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, open, apiBaseUrl]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const suggestionItems = useMemo<SuggestionItem[]>(() => {
    const trimmed = value.trim();
    const folded = foldText(trimmed);

    if (!folded) {
      if (recentSearches.length > 0) {
        return recentSearches.map((text) => ({ text, kind: 'recent' }));
      }
      return QUICK_START_SUGGESTIONS.map((text) => ({ text, kind: 'suggest' }));
    }

    const seen = new Set<string>();
    const list: SuggestionItem[] = [];

    for (const r of recentSearches) {
      const key = foldText(r);
      if (key.includes(folded) && !seen.has(key)) {
        seen.add(key);
        list.push({ text: r, kind: 'recent' });
      }
    }

    for (const s of remoteSuggestions) {
      const key = foldText(s);
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ text: s, kind: 'suggest' });
      }
    }

    if (list.length < 8 && catalogShorts.length > 0) {
      for (const item of catalogShorts) {
        const channelKey = foldText(item.channelTitle);
        if (channelKey.includes(folded) && !seen.has(channelKey)) {
          seen.add(channelKey);
          list.push({ text: item.channelTitle, kind: 'suggest' });
          if (list.length >= 8) break;
        }
      }
    }

    return list.slice(0, 8);
  }, [value, recentSearches, remoteSuggestions, catalogShorts]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestionItems.length, value]);

  const executeSearch = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (clean.length < 2) return;
      saveRecentSearch(clean);
      onChange(clean);
      setOpen(false);
      inputRef.current?.blur();
      onSubmit(clean);
    },
    [onChange, onSubmit, saveRecentSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlightedIndex((prev) =>
        suggestionItems.length === 0 ? -1 : (prev + 1) % suggestionItems.length
      );
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        suggestionItems.length === 0
          ? -1
          : prev <= 0
            ? suggestionItems.length - 1
            : prev - 1
      );
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlightedIndex >= 0 && suggestionItems[highlightedIndex]) {
        executeSearch(suggestionItems[highlightedIndex].text);
      } else if (value.trim().length >= 2) {
        executeSearch(value);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center w-full bg-zinc-950 border transition-colors ${
          open ? 'border-zinc-500 ring-1 ring-white/25' : 'border-zinc-800/90'
        } ${compact ? 'h-9 rounded-lg pl-2.5 pr-1' : 'h-11 rounded-xl pl-3.5 pr-1.5'}`}
      >
        <input
          ref={inputRef}
          type="search"
          autoFocus={autoFocus}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Pesquisar no GraçaPlay"
          className="flex-1 min-w-0 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setRemoteSuggestions([]);
              onClear?.();
              inputRef.current?.focus();
            }}
            aria-label="Limpar pesquisa"
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (value.trim().length >= 2) {
              executeSearch(value);
            } else {
              setOpen(true);
              inputRef.current?.focus();
            }
          }}
          aria-label="Pesquisar"
          className={`flex items-center justify-center rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors shrink-0 cursor-pointer ${
            compact ? 'w-7 h-7 ml-0.5' : 'w-8 h-8 ml-1 bg-zinc-900 border border-zinc-800'
          }`}
        >
          <Search
            className={`w-4 h-4 ${isSearching ? 'animate-pulse text-white' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {open && suggestionItems.length > 0 && (
        <div
          role="listbox"
          aria-label="Sugestões de pesquisa"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1.5"
        >
          {suggestionItems.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={`${item.kind}-${item.text}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeSearch(item.text);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-200 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {item.kind === 'recent' ? (
                    <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate font-medium">{item.text}</span>
                </div>

                {item.kind === 'recent' ? (
                  <button
                    type="button"
                    onMouseDown={(e) => removeRecentSearch(item.text, e)}
                    aria-label={`Remover ${item.text} do histórico`}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(item.text);
                      inputRef.current?.focus();
                    }}
                    aria-label={`Completar com ${item.text}`}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 shrink-0"
                  >
                    <ArrowUpLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
