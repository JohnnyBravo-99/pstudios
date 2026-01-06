import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDataCache } from '../context/DataCacheContext';

export function RoutePrefetcher() {
  const location = useLocation();
  const { prefetchPortfolio } = useDataCache();

  useEffect(() => {
    // Prefetch data for routes before navigation
    if (location.pathname === '/portfolio') {
      prefetchPortfolio();
    }
  }, [location.pathname, prefetchPortfolio]);

  return null;
}

