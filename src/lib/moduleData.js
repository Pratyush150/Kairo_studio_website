/**
 * Module Data
 * Defines the three brain modules: SaaS, Automation, Integration
 */

export const MODULES = {
  saas: {
    id: 'saas',
    name: 'SaaS Solutions',
    shortName: 'SaaS',
    position: [0, 1.3, 0], // Top position
    color: '#00E5FF', // Cyan
    description: 'Cloud-based software solutions that scale with your business',
    icon: '☁️',
    features: [
      'Scalable Architecture',
      'Multi-tenant Support',
      'Auto-scaling Infrastructure',
      'Real-time Analytics',
      'API-first Design',
    ],
    angle: 0,
  },
  automation: {
    id: 'automation',
    name: 'Process Automation',
    shortName: 'Automation',
    position: [1.2, -0.3, 0], // Right position
    color: '#FF00E5', // Magenta
    description: 'Intelligent automation to streamline your workflows',
    icon: '⚡',
    features: [
      'Workflow Orchestration',
      'AI-powered Decision Making',
      'Event-driven Architecture',
      'Integration Pipelines',
      'Error Handling & Retry Logic',
    ],
    angle: 120,
  },
  integration: {
    id: 'integration',
    name: 'System Integration',
    shortName: 'Integration',
    position: [-1.2, -0.3, 0], // Left position
    color: '#FFE500', // Yellow
    description: 'Seamlessly connect your entire technology stack',
    icon: '🔗',
    features: [
      'RESTful & GraphQL APIs',
      'Webhook Support',
      'Data Transformation',
      'Authentication & Security',
      'Rate Limiting & Caching',
    ],
    angle: 240,
  },
};

/**
 * Get module by ID
 */
export function getModuleById(id) {
  return MODULES[id];
}

/**
 * Get all modules as array
 */
export function getAllModules() {
  return Object.values(MODULES);
}

/**
 * Get module position in 3D space
 */
export function getModulePosition(moduleId) {
  const module = MODULES[moduleId];
  return module ? module.position : [0, 0, 0];
}
