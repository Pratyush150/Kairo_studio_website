import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import SaaSMicroScene from './microScenes/SaaSMicroScene';
import AutomationMicroScene from './microScenes/AutomationMicroScene';
import IntegrationMicroScene from './microScenes/IntegrationMicroScene';
import { zoomToModule, returnToMainView } from '../lib/cameraAnimations';

/**
 * MicroSceneManager Component
 * Manages all micro-scenes and camera transitions
 *
 * @param {Object} props
 * @param {string} props.activeModule - Currently active module ID
 * @param {Object} props.controls - OrbitControls instance
 */
export default function MicroSceneManager({ activeModule, controls }) {
  const { camera } = useThree();

  // Handle camera transitions when module changes
  useEffect(() => {
    if (!controls) return;

    if (activeModule) {
      // Zoom into module micro-scene
      console.log('[MicroSceneManager] Zooming to module:', activeModule);

      // Disable controls during transition
      controls.enabled = false;

      zoomToModule(camera, controls, activeModule, () => {
        // Re-enable controls after zoom
        controls.enabled = true;
        console.log('[MicroSceneManager] Zoom complete');
      });
    } else {
      // Return to main view
      console.log('[MicroSceneManager] Returning to main view');

      // Disable controls during transition
      controls.enabled = false;

      returnToMainView(camera, controls, () => {
        // Re-enable controls after return
        controls.enabled = true;
        console.log('[MicroSceneManager] Return complete');
      });
    }
  }, [activeModule, camera, controls]);

  return (
    <group>
      <SaaSMicroScene active={activeModule === 'saas'} />
      <AutomationMicroScene active={activeModule === 'automation'} />
      <IntegrationMicroScene active={activeModule === 'integration'} />
    </group>
  );
}
