import { useState, useEffect } from 'react';
import type { EntityData } from '../lib/sceneAPI';
import { loadEntityContent, enableContentHotReload } from '../lib/contentAPI';

interface UseContentLoaderResult {
  entities: EntityData[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * Hook to load and manage entity content from CMS
 * Supports hot-reload in development mode
 */
export function useContentLoader(): UseContentLoaderResult {
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await loadEntityContent();
      setEntities(content);
      console.log(`[useContentLoader] Loaded ${content.length} entities`);
    } catch (err) {
      console.error('[useContentLoader] Error loading content:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadContent();
  }, []);

  // Enable hot reload in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      enableContentHotReload((newEntities) => {
        setEntities(newEntities);
        console.log('[useContentLoader] Content hot-reloaded');
      });
    }
  }, []);

  return {
    entities,
    loading,
    error,
    reload: loadContent,
  };
}
