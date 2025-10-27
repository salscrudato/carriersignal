import { useState, useEffect } from 'react';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  isOpen: boolean;
}

const TRENDING_TOPICS = [
  'Catastrophe bonds',
  'Climate risk',
  'Cyber insurance',
  'Workers compensation',
  'Commercial auto',
  'Homeowners insurance',
  'Reinsurance',
  'Underwriting trends',
  'Claims management',
  'Insurance technology',
];

export function SearchSuggestions({ query, onSelect, isOpen }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(TRENDING_TOPICS.slice(0, 5));
      return;
    }

    const filtered = TRENDING_TOPICS.filter(topic =>
      topic.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [query]);

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-40 overflow-hidden">
      <div className="max-h-64 overflow-y-auto">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion)}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

