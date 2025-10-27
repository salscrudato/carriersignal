import { useState, useEffect } from 'react';

interface SavedArticle {
  url: string;
  title: string;
  savedAt: string;
}

export function ReadingList() {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved articles from localStorage
    const saved: SavedArticle[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('saved_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            saved.push(JSON.parse(data));
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    setSavedArticles(saved.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ));
  }, [isOpen]);

  const removeSaved = (url: string) => {
    localStorage.removeItem(`saved_${url}`);
    setSavedArticles(prev => prev.filter(a => a.url !== url));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all saved articles?')) {
      savedArticles.forEach(article => {
        localStorage.removeItem(`saved_${article.url}`);
      });
      setSavedArticles([]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center font-bold text-lg hover:scale-110 active:scale-95 z-40"
        title="Reading list"
        aria-label="Open reading list"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
        </svg>
        {savedArticles.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {savedArticles.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden flex flex-col animate-slideInUp sm:animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Reading List</h2>
                <p className="text-xs text-blue-100">{savedArticles.length} saved articles</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-blue-100 transition-colors"
                aria-label="Close reading list"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {savedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 text-center font-medium">
                    No saved articles yet. Click the bookmark icon on any article to save it.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {savedArticles.map((article) => (
                    <div key={article.url} className="p-4 hover:bg-slate-50 transition-colors group">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2"
                      >
                        {article.title}
                      </a>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {new Date(article.savedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => removeSaved(article.url)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {savedArticles.length > 0 && (
              <div className="border-t border-slate-200 p-4">
                <button
                  onClick={clearAll}
                  className="w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

