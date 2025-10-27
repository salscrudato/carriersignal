import { Bookmark, Download, Trash2, ExternalLink } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';

export function BookmarksView() {
  const { bookmarks, removeBookmark, downloadCSV } = useBookmarks();

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
              <Bookmark size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Bookmarks</h1>
              <p className="text-sm text-slate-600">{bookmarks.length} saved articles</p>
            </div>
          </div>

          {bookmarks.length > 0 && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Download size={18} />
              Export CSV
            </button>
          )}
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} className="text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-slate-600 mb-2">No bookmarks yet</p>
            <p className="text-sm text-slate-500">Start bookmarking articles to save them for later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map(bookmark => (
              <div
                key={bookmark.url}
                className="liquid-glass rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {bookmark.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {bookmark.source}
                      </span>
                      <span className="text-slate-500">{getTimeAgo(bookmark.bookmarkedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Open article"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button
                      onClick={() => removeBookmark(bookmark.url)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

