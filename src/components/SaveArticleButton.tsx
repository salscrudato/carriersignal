import { useState, useEffect } from 'react';

interface SaveArticleButtonProps {
  articleUrl: string;
  articleTitle: string;
}

export function SaveArticleButton({ articleUrl, articleTitle }: SaveArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Check if article is saved on mount
  useEffect(() => {
    const saved = localStorage.getItem(`saved_${articleUrl}`);
    setIsSaved(!!saved);
  }, [articleUrl]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      localStorage.removeItem(`saved_${articleUrl}`);
      setIsSaved(false);
    } else {
      localStorage.setItem(`saved_${articleUrl}`, JSON.stringify({
        url: articleUrl,
        title: articleTitle,
        savedAt: new Date().toISOString(),
      }));
      setIsSaved(true);
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleSave}
        className={`p-2 rounded-lg transition-all duration-300 ${
          isSaved
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
        title={isSaved ? 'Remove from saved' : 'Save article'}
        aria-label={isSaved ? 'Remove from saved' : 'Save article'}
      >
        <svg
          className="w-5 h-5"
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z"
          />
        </svg>
      </button>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium animate-slideInUp z-50">
          {isSaved ? 'Article saved!' : 'Article removed from saved'}
        </div>
      )}
    </>
  );
}

