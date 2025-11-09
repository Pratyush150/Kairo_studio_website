/**
 * Content Management System API
 * Handles dynamic loading and validation of entity content
 */

import type { EntityData } from './sceneAPI';

export interface ContentSchema {
  version: string;
  lastUpdated: string;
  entities: EntityData[];
}

/**
 * Validate entity content structure
 */
function validateEntity(entity: any): entity is EntityData {
  return (
    typeof entity.id === 'string' &&
    typeof entity.title === 'string' &&
    typeof entity.slug === 'string' &&
    typeof entity.type === 'string' &&
    typeof entity.description === 'string' &&
    typeof entity.color === 'string' &&
    Array.isArray(entity.position) &&
    entity.position.length === 3 &&
    typeof entity.orbitSpeed === 'number'
  );
}

/**
 * Validate content schema structure
 */
function validateContentSchema(data: any): data is ContentSchema {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.version !== 'string') return false;
  if (!Array.isArray(data.entities)) return false;

  return data.entities.every(validateEntity);
}

/**
 * Load entity content from JSON
 */
export async function loadEntityContent(): Promise<EntityData[]> {
  try {
    // Dynamic import of the JSON file
    const contentModule = await import('../content/entities.json');
    const content = contentModule.default;

    if (!validateContentSchema(content)) {
      console.error('[ContentAPI] Invalid content schema');
      return getDefaultEntities();
    }

    console.log(`[ContentAPI] Loaded ${content.entities.length} entities (v${content.version})`);
    return content.entities;
  } catch (error) {
    console.error('[ContentAPI] Failed to load content:', error);
    return getDefaultEntities();
  }
}

/**
 * Get default entities as fallback
 */
function getDefaultEntities(): EntityData[] {
  return [
    {
      id: '1',
      title: 'Brand Strategy',
      slug: 'brand-strategy',
      type: 'fractal',
      description: 'Fractal crystal cluster with pulsing core',
      color: '#A854FF',
      position: [120, 30, -50],
      orbitSpeed: 18,
    },
    {
      id: '2',
      title: 'Design & Creative',
      slug: 'design-creative',
      type: 'metaball',
      description: 'Fluid morphing metaball blob',
      color: '#00FFFF',
      position: [-100, -40, 60],
      orbitSpeed: 24,
    },
    {
      id: '3',
      title: 'SaaS & Automation',
      slug: 'saas-automation',
      type: 'cube-matrix',
      description: 'Modular expanding cube matrix',
      color: '#3B9CFF',
      position: [80, -50, 80],
      orbitSpeed: 20,
    },
  ];
}

/**
 * Get entity by ID
 */
export async function getEntityById(id: string): Promise<EntityData | null> {
  const entities = await loadEntityContent();
  return entities.find((entity) => entity.id === id) || null;
}

/**
 * Get entity by slug
 */
export async function getEntityBySlug(slug: string): Promise<EntityData | null> {
  const entities = await loadEntityContent();
  return entities.find((entity) => entity.slug === slug) || null;
}

/**
 * Get entities by type
 */
export async function getEntitiesByType(type: string): Promise<EntityData[]> {
  const entities = await loadEntityContent();
  return entities.filter((entity) => entity.type === type);
}

/**
 * Hot reload content (for development)
 */
export function enableContentHotReload(callback: (entities: EntityData[]) => void) {
  if (import.meta.hot) {
    import.meta.hot.accept('../content/entities.json', (newModule) => {
      if (newModule && validateContentSchema(newModule.default)) {
        console.log('[ContentAPI] Content hot-reloaded!');
        callback(newModule.default.entities);
      }
    });
  }
}
