import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import API_BASE_URL from '../config/api';

const DataCacheContext = createContext();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 45000; // 45 seconds

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
};

export const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    portfolio: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    portfolioItems: {},
  });

  // Deduplication refs — a single in-flight promise shared across all callers
  const portfolioInflight = useRef(null);
  const itemInflight = useRef({});

  const prefetchPortfolio = useCallback(async (force = false) => {
    // Return cached data if still valid
    const { data, lastFetched } = cache.portfolio;
    if (!force && data && lastFetched && Date.now() - lastFetched < CACHE_TTL) {
      return data;
    }

    // If a request is already in-flight, piggyback on it instead of firing another
    if (portfolioInflight.current) {
      return portfolioInflight.current;
    }

    setCache(prev => ({
      ...prev,
      portfolio: { ...prev.portfolio, loading: true, error: null }
    }));

    const fetchUrl = `${API_BASE_URL}/api/portfolio`;

    const promise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(fetchUrl, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          signal: controller.signal,
          cache: 'default',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          setCache(prev => ({
            ...prev,
            portfolio: { data: result, loading: false, error: null, lastFetched: Date.now() }
          }));
          return result;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (err) {
        const error = err.name === 'AbortError'
          ? 'Request timed out'
          : 'Failed to load portfolio';

        setCache(prev => ({
          ...prev,
          portfolio: { ...prev.portfolio, loading: false, error }
        }));
        return null;
      } finally {
        portfolioInflight.current = null;
      }
    })();

    portfolioInflight.current = promise;
    return promise;
  }, [cache.portfolio]);

  const prefetchPortfolioItem = useCallback(async (slug) => {
    if (!slug) return null;

    if (cache.portfolioItems[slug]) {
      const cached = cache.portfolioItems[slug];
      if (Date.now() - cached.lastFetched < CACHE_TTL) {
        return cached.data;
      }
    }

    // Deduplicate per-slug requests
    if (itemInflight.current[slug]) {
      return itemInflight.current[slug];
    }

    const promise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${API_BASE_URL}/api/portfolio/${slug}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
          cache: 'default',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          setCache(prev => ({
            ...prev,
            portfolioItems: {
              ...prev.portfolioItems,
              [slug]: { data: result, lastFetched: Date.now() }
            }
          }));
          return result;
        }
      } catch (err) {
        console.error('Error prefetching portfolio item:', err);
      } finally {
        delete itemInflight.current[slug];
      }
      return null;
    })();

    itemInflight.current[slug] = promise;
    return promise;
  }, [cache.portfolioItems]);

  const getPortfolio = useCallback(async () => {
    const { data, lastFetched } = cache.portfolio;
    if (data && lastFetched && Date.now() - lastFetched < CACHE_TTL) {
      return data;
    }
    return await prefetchPortfolio();
  }, [cache.portfolio, prefetchPortfolio]);

  const getPortfolioItem = useCallback((slug) => {
    return cache.portfolioItems[slug]?.data || null;
  }, [cache.portfolioItems]);

  const value = {
    cache,
    prefetchPortfolio,
    prefetchPortfolioItem,
    getPortfolio,
    getPortfolioItem,
    clearCache: () => setCache({
      portfolio: { data: null, loading: false, error: null, lastFetched: null },
      portfolioItems: {},
    }),
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};

