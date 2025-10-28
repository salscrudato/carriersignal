/**
 * Pagination Context Provider
 * 
 * Manages:
 * - Pagination state (current page, page size, total count)
 * - Loading states
 * - Data caching
 * - Cursor-based pagination for Firestore
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  lastCursor: any | null;
}

export interface PaginationContextType {
  state: PaginationState;
  nextPage: () => void;
  resetPagination: () => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastCursor: (cursor: any) => void;
}

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

interface PaginationProviderProps {
  children: ReactNode;
  initialPageSize?: number;
}

export function PaginationProvider({
  children,
  initialPageSize = 20,
}: PaginationProviderProps) {
  const [state, setState] = useState<PaginationState>({
    currentPage: 1,
    pageSize: initialPageSize,
    totalCount: 0,
    isLoading: false,
    hasMore: true,
    error: null,
    lastCursor: null,
  });

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: prev.currentPage + 1,
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setState({
      currentPage: 1,
      pageSize: initialPageSize,
      totalCount: 0,
      isLoading: false,
      hasMore: true,
      error: null,
      lastCursor: null,
    });
  }, [initialPageSize]);

  const setPageSize = useCallback((size: number) => {
    setState((prev) => ({
      ...prev,
      pageSize: size,
    }));
  }, []);

  const setTotalCount = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      totalCount: count,
      hasMore: prev.currentPage * prev.pageSize < count,
    }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  const setLastCursor = useCallback((cursor: any) => {
    setState((prev) => ({
      ...prev,
      lastCursor: cursor,
    }));
  }, []);

  const value: PaginationContextType = {
    state,
    nextPage,
    resetPagination,
    setPageSize,
    setTotalCount,
    setIsLoading,
    setError,
    setLastCursor,
  };

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
}

export function usePagination(): PaginationContextType {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePagination must be used within PaginationProvider');
  }
  return context;
}

