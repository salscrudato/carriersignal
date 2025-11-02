import { useEffect, useState, useRef } from 'react';
import { Search, Loader, AlertCircle } from 'lucide-react';
import type { Article } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onArticleSelect: (article: Article) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  articles,
  onArticleSelect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Article[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search articles
  useEffect(() => {
    if (!query.trim()) {
      setResults(articles.slice(0, 8));
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const queryLower = query.toLowerCase();
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(queryLower) ||
        article.source.toLowerCase().includes(queryLower) ||
        article.bullets5?.some(b => b.toLowerCase().includes(queryLower)) ||
        article.tags?.companies?.some(c => c.toLowerCase().includes(queryLower)) ||
        article.tags?.trends?.some(t => t.toLowerCase().includes(queryLower))
      );
      setResults(filtered.slice(0, 8));
      setSelectedIndex(0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, articles]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onArticleSelect(results[selectedIndex]);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden border border-[#E5E7EB] mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="border-b border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-[#10A37F]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search articles, companies, trends..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-base outline-none text-[#0D0D0D] placeholder-[#ABABBA] font-medium"
            />
            {isLoading && <Loader size={20} className="text-[#10A37F] animate-spin" />}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-[#D1D5DB] mb-2" />
              <p className="text-[#ABABBA]">No articles found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {results.map((article, idx) => (
                <button
                  key={article.id}
                  onClick={() => {
                    onArticleSelect(article);
                    onClose();
                  }}
                  className={`w-full text-left p-4 transition-all duration-200 ${
                    idx === selectedIndex
                      ? 'bg-[#F7F7F8] border-l-4 border-[#10A37F]'
                      : 'hover:bg-[#F7F7F8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0D0D0D] line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#8B8B9A] mt-1">{article.source}</p>
                      {article.bullets5?.[0] && (
                        <p className="text-sm text-[#565869] mt-2 line-clamp-1">
                          {article.bullets5[0]}
                        </p>
                      )}
                    </div>
                    {article.tags?.companies && article.tags.companies.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-end">
                        {article.tags.companies.slice(0, 2).map(company => (
                          <span
                            key={company}
                            className="text-xs text-[#0D0D0D] px-2 py-1 rounded-md bg-[#F7F7F8] border border-[#E5E7EB]"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] bg-[#F7F7F8] px-4 py-3 text-xs text-[#8B8B9A] flex items-center justify-between">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>⏎ Select</span>
            <span>ESC Close</span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}

