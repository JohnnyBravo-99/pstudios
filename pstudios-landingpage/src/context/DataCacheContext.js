import React, { createContext, useContext, useState, useCallback } from 'react';
import API_BASE_URL from '../config/api';

const DataCacheContext = createContext();

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
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
    portfolioItems: {}, // Individual items by slug
  });

  // Prefetch portfolio list
  const prefetchPortfolio = useCallback(async (force = false) => {
    const portfolioCache = cache.portfolio;
    
    // Return cached data if still valid and not forcing refresh
    if (!force && portfolioCache.data && portfolioCache.lastFetched) {
      const age = Date.now() - portfolioCache.lastFetched;
      if (age < portfolioCache.cacheTime) {
        return portfolioCache.data;
      }
    }

    // Don't fetch if already loading
    if (portfolioCache.loading) {
      return portfolioCache.data;
    }

    setCache(prev => ({
      ...prev,
      portfolio: { ...prev.portfolio, loading: true, error: null }
    }));

    const fetchUrl = `${API_BASE_URL}/api/portfolio`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'default', // Allow browser caching
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setCache(prev => ({
          ...prev,
          portfolio: {
            data,
            loading: false,
            error: null,
            lastFetched: Date.now(),
            cacheTime: prev.portfolio.cacheTime,
          }
        }));
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      const error = err.name === 'AbortError' 
        ? 'Request timed out' 
        : 'Failed to load portfolio';
      
      setCache(prev => ({
        ...prev,
        portfolio: {
          ...prev.portfolio,
          loading: false,
          error,
        }
      }));
      return null;
    }
  }, [cache.portfolio]);

  // Prefetch individual portfolio item
  const prefetchPortfolioItem = useCallback(async (slug) => {
    if (!slug) return null;

    // Return cached if available
    if (cache.portfolioItems[slug]) {
      const cached = cache.portfolioItems[slug];
      const age = Date.now() - cached.lastFetched;
      if (age < 5 * 60 * 1000) { // 5 minute cache
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolio/${slug}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'default',
      });

      if (response.ok) {
        const data = await response.json();
        setCache(prev => ({
          ...prev,
          portfolioItems: {
            ...prev.portfolioItems,
            [slug]: {
              data,
              lastFetched: Date.now(),
            }
          }
        }));
        return data;
      }
    } catch (err) {
      console.error('Error prefetching portfolio item:', err);
    }
    return null;
  }, [cache.portfolioItems]);

  // Get portfolio data (from cache or fetch)
  const getPortfolio = useCallback(async () => {
    if (cache.portfolio.data && cache.portfolio.lastFetched) {
      const age = Date.now() - cache.portfolio.lastFetched;
      if (age < cache.portfolio.cacheTime) {
        return cache.portfolio.data;
      }
    }
    return await prefetchPortfolio();
  }, [cache.portfolio, prefetchPortfolio]);

  // Get individual item
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
      portfolio: { data: null, loading: false, error: null, lastFetched: null, cacheTime: 5 * 60 * 1000 },
      portfolioItems: {},
    }),
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};

