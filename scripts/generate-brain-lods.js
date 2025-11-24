/**
 * Generate Brain LOD Models Script
 * Creates 3 levels of procedural brain geometry for testing LOD system
 *
 * Run with: node scripts/generate-brain-lods.js
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a procedural brain-like geometry
 * @param {number} detail - Subdivision level (0 = low, 1 = medium, 2 = high)
 */
function createBrainGeometry(detail) {
  const group = new THREE.Group();
  group.name = `brain_core_lod${detail}`;

  // Core sphere with varying detail
  const coreDetail = [1, 2, 3][detail]; // icosahedron subdivisions
  const coreGeo = new THREE.IcosahedronGeometry(1, coreDetail);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.2,
    roughness: 0.7,
    metalness: 0.3,
  });

  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.name = 'core';
  group.add(coreMesh);

  // Add "brain folds" using torus knots (fewer for lower LODs)
  const foldCount = [2, 4, 8][detail];
  for (let i = 0; i < foldCount; i++) {
    const angle = (i / foldCount) * Math.PI * 2;
    const x = Math.cos(angle) * 0.8;
    const y = Math.sin(angle * 1.5) * 0.3;
    const z = Math.sin(angle) * 0.8;

    const foldDetail = [8, 16, 32][detail];
    const foldGeo = new THREE.TorusKnotGeometry(0.2, 0.05, foldDetail, 4, 2, 3);
    const foldMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.3,
      roughness: 0.6,
      metalness: 0.4,
    });

    const foldMesh = new THREE.Mesh(foldGeo, foldMat);
    foldMesh.position.set(x, y, z);
    foldMesh.scale.setScalar(0.5);
    foldMesh.name = `fold_${i}`;
    group.add(foldMesh);
  }

  // Add module connection points
  const modulePositions = [
    [0, 1.3, 0], // Top (SaaS)
    [1.2, -0.3, 0], // Right (Automation)
    [-1.2, -0.3, 0], // Left (Integration)
  ];

  modulePositions.forEach((pos, i) => {
    const moduleDetail = [6, 12, 24][detail];
    const moduleGeo = new THREE.SphereGeometry(0.15, moduleDetail, moduleDetail);
    const colors = [0x00e5ff, 0xff00e5, 0xffe500];
    const moduleMat = new THREE.MeshStandardMaterial({
      color: colors[i],
      emissive: colors[i],
      emissiveIntensity: 0.5,
    });

    const moduleMesh = new THREE.Mesh(moduleGeo, moduleMat);
    moduleMesh.position.fromArray(pos);
    moduleMesh.name = `module_hotspot_${i}`;
    group.add(moduleMesh);
  });

  console.log(`Created LOD${detail} geometry:`);
  console.log(`  - Core detail: ${coreDetail} subdivisions`);
  console.log(`  - Folds: ${foldCount}`);
  console.log(`  - Total meshes: ${group.children.length}`);

  return group;
}

/**
 * Export geometry as GLTF
 */
function exportGLTF(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    const options = {
      binary: true, // Export as .glb
      embedImages: true,
    };

    exporter.parse(
      scene,
      (result) => {
        const outputPath = path.join(__dirname, '..', 'public', 'assets', 'models', filename);

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, Buffer.from(result));
        console.log(`✓ Exported: ${filename}`);
        resolve();
      },
      (error) => {
        console.error(`✗ Error exporting ${filename}:`, error);
        reject(error);
      },
      options
    );
  });
}

/**
 * Main generation function
 */
async function generateBrainLODs() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Generating Brain LOD Models');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Generate LOD 0 (Low detail)
    console.log('[LOD 0] Generating low-detail model...');
    const lod0 = createBrainGeometry(0);
    await exportGLTF(lod0, 'brain_core.lod0.glb');
    console.log('');

    // Generate LOD 1 (Medium detail)
    console.log('[LOD 1] Generating medium-detail model...');
    const lod1 = createBrainGeometry(1);
    await exportGLTF(lod1, 'brain_core.lod1.glb');
    console.log('');

    // Generate LOD 2 (High detail)
    console.log('[LOD 2] Generating high-detail model...');
    const lod2 = createBrainGeometry(2);
    await exportGLTF(lod2, 'brain_core.lod2.glb');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ All LOD models generated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nModels saved to: public/assets/models/');
    console.log('  - brain_core.lod0.glb (Low detail)');
    console.log('  - brain_core.lod1.glb (Medium detail)');
    console.log('  - brain_core.lod2.glb (High detail)');
  } catch (error) {
    console.error('\n✗ Error generating models:', error);
    process.exit(1);
  }
}

// Run the generator
generateBrainLODs();
