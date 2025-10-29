import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Bookmark, Trash2, ExternalLink, Calendar } from 'lucide-react';

interface BookmarkedArticle {
  id: string;
  url: string;
  title: string;
  source: string;
  clusterId?: string;
  savedAt: Date;
}

interface BookmarksProps {
  onArticleSelect?: (article: any) => void;
}

export function Bookmarks({ onArticleSelect }: BookmarksProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize device ID from localStorage
  useEffect(() => {
    let id = localStorage.getItem('carriersignal_device_id');
    if (!id) {
      id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('carriersignal_device_id', id);
    }
    setDeviceId(id);
  }, []);

  // Listen to bookmarks from Firestore
  useEffect(() => {
    if (!deviceId) return;

    const q = query(
      collection(db, 'bookmarks'),
      where('deviceId', '==', deviceId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          savedAt: doc.data().savedAt?.toDate?.() || new Date(),
        })) as BookmarkedArticle[];

        setBookmarks(items.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime()));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching bookmarks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full liquid-glass-premium flex items-center justify-center mx-auto mb-3 animate-pulse border border-[#5AA6FF]/30">
            <Bookmark size={24} className="text-[#5AA6FF]" />
          </div>
          <p className="text-[#64748B]">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full liquid-glass-light flex items-center justify-center mx-auto mb-4 border border-[#C7D2E1]/30">
            <Bookmark size={32} className="text-[#D4DFE8]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">No bookmarks yet</h3>
          <p className="text-sm text-[#64748B]">Save articles to read them later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-3">
        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="p-4 rounded-lg border border-[#C7D2E1]/40 hover:border-[#5AA6FF]/60 hover:shadow-md transition-all duration-300 liquid-glass-light micro-glow hover:bg-gradient-to-r hover:from-[#F9FBFF]/20 hover:to-[#E8F2FF]/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onArticleSelect?.({url: bookmark.url, title: bookmark.title})}
                  className="text-left hover:text-[#5AA6FF] transition-colors"
                >
                  <h3 className="font-semibold text-[#0F172A] line-clamp-2 hover:underline">
                    {bookmark.title}
                  </h3>
                </button>
                <p className="text-sm text-[#64748B] mt-1">{bookmark.source}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#94A3B8]">
                  <Calendar size={12} />
                  <span>{bookmark.savedAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:liquid-glass-premium rounded-lg transition-all border border-[#5AA6FF]/30 hover:border-[#5AA6FF]/60 hover:shadow-sm animate-iconGlow"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} className="text-[#5AA6FF]" />
                </a>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="p-2 hover:liquid-glass-premium rounded-lg transition-all border border-[#EF4444]/30 hover:border-[#EF4444]/60 hover:shadow-sm"
                  title="Remove bookmark"
                >
                  <Trash2 size={16} className="text-[#EF4444]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bookmarks;
