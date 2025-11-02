import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import type { Article } from '../types';

interface BookmarkedArticle {
  id: string;
  url: string;
  title: string;
  source: string;
  clusterId?: string;
  savedAt: Date;
}

interface BookmarksProps {
  onArticleSelect?: (article: Article) => void;
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
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  const handleRemoveBookmark = useCallback(async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
    } catch {
      // Silently fail - error already handled by Firestore
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#F7F7F8] flex items-center justify-center mx-auto mb-3 animate-pulse border border-[#E5E7EB]">
            <Bookmark size={24} className="text-[#10A37F]" />
          </div>
          <p className="text-[#8B8B9A]">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F7F7F8] flex items-center justify-center mx-auto mb-4 border border-[#E5E7EB]">
            <Bookmark size={32} className="text-[#D1D5DB]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0D0D0D] mb-1">No bookmarks yet</h3>
          <p className="text-sm text-[#8B8B9A]">Save articles to read them later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-2">
        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200 bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onArticleSelect?.({ url: bookmark.url, title: bookmark.title } as Article)}
                  className="text-left hover:text-[#10A37F] transition-colors"
                >
                  <h3 className="font-semibold text-[#0D0D0D] line-clamp-2 hover:underline">
                    {bookmark.title}
                  </h3>
                </button>
                <p className="text-sm text-[#8B8B9A] mt-1">{bookmark.source}</p>
                <p className="text-xs text-[#ABABBA] mt-2">
                  {bookmark.savedAt.toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md transition-all duration-200 border border-[#E5E7EB] hover:border-[#10A37F]/30 hover:bg-[#E8F5F0]"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} className="text-[#10A37F]" />
                </a>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="p-2 rounded-md transition-all duration-200 border border-[#E5E7EB] hover:border-[#EF4444]/30 hover:bg-[#FEE2E2]"
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
