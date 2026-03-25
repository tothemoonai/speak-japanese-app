import { useState, useEffect, useCallback } from 'react';
import { bookService } from '@/services/supabase/book.service';
import type {
  Book,
  BookWithProgress,
  BookFilter,
} from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Hook for fetching all books
 */
export function useBooks(userId?: string) {
  const [data, setData] = useState<BookWithProgress[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    const { data: books, error: err } = await bookService.getAllBooks(userId);
    setData(books);
    setError(err);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { data, error, isLoading, refetch: fetchBooks };
}

/**
 * Hook for fetching a single book by ID
 */
export function useBook(bookId: number, userId?: string) {
  const [data, setData] = useState<BookWithProgress | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBook = useCallback(async () => {
    if (!bookId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data: book, error: err } = await bookService.getBookById(bookId, userId);
    setData(book);
    setError(err);
    setIsLoading(false);
  }, [bookId, userId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  return { data, error, isLoading, refetch: fetchBook };
}

/**
 * Hook for fetching books with filters
 */
export function useBooksFilter(filter: BookFilter, userId?: string) {
  const [data, setData] = useState<BookWithProgress[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    const { data: books, error: err } = await bookService.getBooksByFilter(filter, userId);
    setData(books);
    setError(err);
    setIsLoading(false);
  }, [JSON.stringify(filter), userId]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { data, error, isLoading, refetch: fetchBooks };
}
