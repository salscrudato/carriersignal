import { useState, useEffect } from 'react';

interface BookmarkedArticle {
  url: string;
  title: string;
  source: string;
  image?: string;
  bookmarkedAt: number;
}

const BOOKMARKS_KEY = 'carriersignal_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Error saving bookmarks:', error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = (article: Omit<BookmarkedArticle, 'bookmarkedAt'>) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.url === article.url);
      if (exists) return prev;
      return [...prev, { ...article, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (url: string) => {
    setBookmarks(prev => prev.filter(b => b.url !== url));
  };

  const isBookmarked = (url: string) => {
    return bookmarks.some(b => b.url === url);
  };

  const exportToCSV = () => {
    if (bookmarks.length === 0) return '';

    const headers = ['Title', 'Source', 'URL', 'Bookmarked At'];
    const rows = bookmarks.map(b => [
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.source.replace(/"/g, '""')}"`,
      `"${b.url}"`,
      new Date(b.bookmarkedAt).toISOString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  };

  const downloadCSV = () => {
    const csv = exportToCSV();
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `carriersignal-bookmarks-${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    exportToCSV,
    downloadCSV,
  };
}

