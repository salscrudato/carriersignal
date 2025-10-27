import { useState, useEffect } from 'react';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('carriersignal-bookmarks');
    return new Set(stored ? JSON.parse(stored) : []);
  });

  useEffect(() => {
    localStorage.setItem('carriersignal-bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  const toggleBookmark = (url: string) => {
    setBookmarks(prev => {
      const updated = new Set(prev);
      if (updated.has(url)) {
        updated.delete(url);
      } else {
        updated.add(url);
      }
      return updated;
    });
  };

  const isBookmarked = (url: string) => bookmarks.has(url);

  return { bookmarks, toggleBookmark, isBookmarked };
}

export function shareArticle(title: string, url: string, platform: 'twitter' | 'linkedin' | 'email' | 'copy') {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
      break;
    case 'linkedin':
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
      break;
    case 'email':
      window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
      break;
    case 'copy':
      navigator.clipboard.writeText(url);
      break;
  }
}

