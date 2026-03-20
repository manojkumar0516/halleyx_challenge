import { useState, useEffect } from 'react';
import { Order } from '../types';

/**
 * Hook to filter orders by date range
 */
export function useFilteredOrders(orders: Order[], filter: 'All time' | 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days') {
  return orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (filter) {
      case 'Today':
        return diffDays === 0;
      case 'Last 7 Days':
        return diffDays <= 7;
      case 'Last 30 Days':
        return diffDays <= 30;
      case 'Last 90 Days':
        return diffDays <= 90;
      default:
        return true;
    }
  });
}

/**
 * Hook for debounced search
 */
export function useDebouncedValue<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for detecting window size
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook to get responsive breakpoint
 */
export function useResponsiveBreakpoint() {
  const { width } = useWindowSize();

  if (width >= 1200) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 480) return 'sm';
  return 'xs';
}

/**
 * Hook for local storage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Hook for async data loading
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [asyncFunction, immediate]);

  return { execute, status, value, error };
}

/**
 * Hook for mutation (API calls with loading state)
 */
export function useMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<T>
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: V) => {
    setStatus('pending');
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      setStatus('success');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
      throw err;
    }
  };

  const reset = () => {
    setStatus('idle');
    setData(null);
    setError(null);
  };

  return { mutate, status, data, error, reset, isLoading: status === 'pending' };
}
