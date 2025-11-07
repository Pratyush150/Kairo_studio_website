// ===================================
// KAIRO STUDIO - HIGH-FIDELITY 3D IMMERSIVE EXPERIENCE
// Three.js + GSAP + Performance-Conscious Implementation
// ===================================

(function() {
    'use strict';

    // ===================================
    // CONFIGURATION & CONSTANTS
    // ===================================

    const CONFIG = {
        TARGET_FPS: 60,
        TARGET_FRAME_TIME: 1000 / 60, // ~16.67ms
        PERFORMANCE_SAMPLE_SIZE: 60,

        // Animation timing (in ms, multiples of 150)
        TIMING: {
            PRELOADER_DOT_PULSE: 600,
            ASSET_LOAD: 1200,
            HERO_REVEAL: 900,
            IDENTITY_REVEAL: 900,
            INTERACTION_HINT: 600,

            CAMERA_DOLLY_SHORT: 600,
            CAMERA_DOLLY_MEDIUM: 900,
            CAMERA_ORBIT: 1200,
            CAMERA_SNAP: 280,

            HOVER_SCALE: 180,
            MODAL_EXPAND: 320,
            MODAL_CAMERA: 700,

            MICROINTERACTION_FAST: 70,
            MICROINTERACTION_BASE: 180,
            MICROINTERACTION_MEDIUM: 320
        },

        // Easing functions
        EASING: {
            PRIMARY: 'cubic-bezier(0.22, 1, 0.36, 1)', // fast-out-slow-in
            SNAPPY: 'cubic-bezier(0.4, 0, 0.2, 1)',
            SOFT_POP: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            EXPO_OUT: 'expo.out',
            POWER3_OUT: 'power3.out',
            SINE: 'sine.inOut'
        },

        // Performance budgets
        BUDGETS: {
            MAX_POLYCOUNT_HERO: 35000,
            MAX_POLYCOUNT_CARD: 15000,
            MAX_TEXTURE_SIZE_HERO: 2048,
            MAX_TEXTURE_SIZE_CARD: 1024
        },

        // Camera settings
        CAMERA: {
            FOV: 45,
            NEAR: 0.1,
            FAR: 1000,
            DEFAULT_Z: 8,
            DEFAULT_Y: 0,
            DEFAULT_X: 0,
            PARALLAX_MAX_OFFSET: 20,
            PARALLAX_MOBILE_OFFSET: 10,
            PARALLAX_STIFFNESS: 120,
            PARALLAX_DAMPING: 16
        }
    };

    // ===================================
    // STATE MANAGEMENT
    // ===================================

    const state = {
        // Core
        currentSection: 'entry',
        currentWorkflowStep: 'research',
        loadingProgress: 0,
        isLoaded: false,

        // Device & capabilities
        is3DSupported: true,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isLowPowerMode: false,
        supportsWebGL2: false,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),

        // Motion preferences
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        motionEnabled: true,

        // Three.js objects
        scene: null,
        camera: null,
        renderer: null,
        clock: null,

        // Scene objects
        walls: [],
        projects3D: [],
        workflowStations: [],
        particles: null,
        heroObject: null,
        lights: {
            ambient: null,
            key: null,
            fill: null,
            accent: null
        },

        // Animation
        animationId: null,
        activeTimelines: [],

        // Performance
        performance: {
            fps: 60,
            frameTimes: [],
            lastFrameTime: 0,
            deltaTime: 0,
            isThrottled: false
        },

        // Interaction
        raycaster: null,
        mouse: new THREE.Vector2(),
        hoveredObject: null,
        cameraTarget: { x: 0, y: 0, z: CONFIG.CAMERA.DEFAULT_Z },
        cameraVelocity: { x: 0, y: 0, z: 0 },
        cameraLookAtTarget: null, // Target point for camera to look at

        // LOD
        currentLOD: 'low',
        lodLevels: ['low', 'medium', 'high']
    };

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================

    const Utils = {
        // Easing functions for manual animations
        easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

        easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

        // Spring interpolation for camera parallax
        springInterpolate: (current, target, velocity, stiffness, damping, deltaTime) => {
            const springForce = (target - current) * stiffness;
            const dampingForce = velocity * damping;
            const acceleration = (springForce - dampingForce);

            velocity += acceleration * deltaTime;
            current += velocity * deltaTime;

            return { value: current, velocity: velocity };
        },

        // Lerp
        lerp: (start, end, alpha) => start + (end - start) * alpha,

        // Clamp
        clamp: (value, min, max) => Math.min(Math.max(value, min), max),

        // Random range
        randomRange: (min, max) => Math.random() * (max - min) + min,

        // Detect WebGL2
        detectWebGL2: () => {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl2'));
        },

        // Detect low power mode (heuristic)
        detectLowPowerMode: () => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return true;

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                // Check for software renderer or integrated graphics on mobile
                return /SwiftShader|software|llvmpipe/i.test(renderer);
            }
            return false;
        },

        // Counter animation
        animateCounter: (element, start, end, duration, easing = 'expo.out') => {
            const obj = { value: start };
            gsap.to(obj, {
                value: end,
                duration: duration / 1000,
                ease: easing,
                onUpdate: () => {
                    const formatted = Math.round(obj.value);
                    element.textContent = formatted;
                },
                onComplete: () => {
                    element.textContent = end;
                }
            });
        }
    };

    // ===================================
    // PERFORMANCE MONITORING
    // ===================================

    const PerformanceMonitor = {
        init() {
            this.perfDisplay = document.getElementById('perfMonitor');
            this.fpsDisplay = this.perfDisplay?.querySelector('.perf-fps');
        },

        update(deltaTime) {
            const frameTime = deltaTime * 1000; // Convert to ms
            state.performance.frameTimes.push(frameTime);

            if (state.performance.frameTimes.length > CONFIG.PERFORMANCE_SAMPLE_SIZE) {
                state.performance.frameTimes.shift();
            }

            // Calculate average FPS
            const avgFrameTime = state.performance.frameTimes.reduce((a, b) => a + b, 0) / state.performance.frameTimes.length;
            state.performance.fps = Math.round(1000 / avgFrameTime);

            // Update display every 30 frames
            if (state.performance.frameTimes.length % 30 === 0) {
                this.updateDisplay();
                this.checkPerformance();
            }
        },

        updateDisplay() {
            if (this.fpsDisplay) {
                const fps = state.performance.fps;
                this.fpsDisplay.textContent = `${fps} FPS`;

                // Color code based on performance
                if (fps >= 55) {
                    this.fpsDisplay.style.color = '#00ff00';
                } else if (fps >= 45) {
                    this.fpsDisplay.style.color = '#ffff00';
                } else {
                    this.fpsDisplay.style.color = '#ff0000';
                }
            }
        },

        checkPerformance() {
            const fps = state.performance.fps;

            // If FPS drops below 45, enable throttling
            if (fps < 45 && !state.performance.isThrottled) {
                console.warn('Performance degradation detected. Enabling throttling...');
                state.performance.isThrottled = true;
                this.enableThrottling();
            }

            // If FPS recovers above 55, disable throttling
            if (fps >= 55 && state.performance.isThrottled) {
                console.log('Performance recovered. Disabling throttling...');
                state.performance.isThrottled = false;
                this.disableThrottling();
            }
        },

        enableThrottling() {
            // Reduce particle count
            if (state.particles) {
                const positions = state.particles.geometry.attributes.position.array;
                const reducedCount = Math.floor(positions.length / 2);
                const newPositions = new Float32Array(reducedCount);

                for (let i = 0; i < reducedCount; i++) {
                    newPositions[i] = positions[i];
                }

                state.particles.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
            }

            // Lower device pixel ratio
            if (state.renderer) {
                state.renderer.setPixelRatio(1);
            }
        },

        disableThrottling() {
            // Restore device pixel ratio
            if (state.renderer) {
                state.renderer.setPixelRatio(state.devicePixelRatio);
            }
        }
    };

    // ===================================
    // PRELOADER & LOADING ANIMATIONS
    // ===================================

    const LoadingSequence = {
        async init() {
            console.log('Starting loading sequence...');

            this.loadingScreen = document.getElementById('loading-screen');
            this.loadingProgress = document.getElementById('loadingProgress');
            this.loadingText = document.getElementById('loadingText');
            this.loadingLogo = document.querySelector('.loading-logo');

            // Start preloader animation
            this.animatePreloader();

            // Load assets in sequence
            await this.loadAssets();

            // Hero reveal sequence
            await this.heroReveal();

            // Identity reveal
            await this.identityReveal();

            // Interaction hint
            await this.interactionHint();

            // Hide loading screen
            this.hideLoadingScreen();
        },

        animatePreloader() {
            // Pulse animation on loading logo (600ms loop)
            if (this.loadingLogo) {
                gsap.to(this.loadingLogo, {
                    scale: 1.05,
                    duration: CONFIG.TIMING.PRELOADER_DOT_PULSE / 1000,
                    ease: CONFIG.EASING.SINE,
                    repeat: -1,
                    yoyo: true
                });
            }
        },

        async loadAssets() {
            // Simulate asset loading with progress updates
            const stages = [
                { progress: 10, text: 'Initializing 3D environment...', delay: 200 },
                { progress: 25, text: 'Loading hero model...', delay: 300 },
                { progress: 40, text: 'Loading textures...', delay: 250 },
                { progress: 55, text: 'Building scene...', delay: 300 },
                { progress: 70, text: 'Setting up interactions...', delay: 200 },
                { progress: 85, text: 'Optimizing performance...', delay: 200 },
                { progress: 95, text: 'Finalizing...', delay: 150 }
            ];

            for (const stage of stages) {
                await this.updateProgress(stage.progress, stage.text, stage.delay);
            }

            await this.updateProgress(100, 'Ready!', 100);
        },

        updateProgress(progress, text, delay) {
            return new Promise(resolve => {
                state.loadingProgress = progress;

                if (this.loadingProgress) {
                    gsap.to(this.loadingProgress, {
                        width: `${progress}%`,
                        duration: 0.3,
                        ease: CONFIG.EASING.PRIMARY
                    });
                }

                if (this.loadingText && text) {
                    this.loadingText.textContent = text;
                }

                setTimeout(resolve, delay);
            });
        },

        async heroReveal() {
            // 1200-2200ms: silhouette fades in, camera dollies forward
            return new Promise(resolve => {
                const tl = gsap.timeline({
                    onComplete: resolve
                });

                // Fade in scene canvas (silhouette effect)
                const canvas = document.getElementById('scene-canvas');
                if (canvas) {
                    tl.to(canvas, {
                        opacity: 1,
                        duration: 0.4,
                        ease: CONFIG.EASING.PRIMARY
                    }, 0);
                }

                // Camera dolly forward
                if (state.camera) {
                    tl.to(state.camera.position, {
                        z: 6,
                        duration: 0.9,
                        ease: CONFIG.EASING.PRIMARY
                    }, 0.4);
                }

                // Light sweep
                if (state.lights.key) {
                    tl.to(state.lights.key, {
                        intensity: 1.2,
                        duration: 0.6,
                        ease: CONFIG.EASING.PRIMARY
                    }, 0.5);

                    tl.to(state.lights.key, {
                        intensity: 0.9,
                        duration: 0.3,
                        ease: CONFIG.EASING.PRIMARY
                    }, 1.1);
                }
            });
        },

        async identityReveal() {
            // 1700-2600ms: Kairo wordmark types in
            return new Promise(resolve => {
                const header = document.querySelector('.header-3d');
                if (header) {
                    gsap.from(header, {
                        y: -100,
                        opacity: 0,
                        duration: 0.6,
                        ease: CONFIG.EASING.SOFT_POP,
                        onComplete: resolve
                    });
                } else {
                    resolve();
                }
            });
        },

        async interactionHint() {
            // 2600-3200ms: micro-bounce on hints
            return new Promise(resolve => {
                const hints = document.getElementById('navHints');
                if (hints) {
                    gsap.from(hints.children, {
                        y: 20,
                        opacity: 0,
                        duration: 0.4,
                        stagger: 0.1,
                        ease: CONFIG.EASING.SOFT_POP,
                        onComplete: resolve
                    });
                } else {
                    resolve();
                }
            });
        },

        hideLoadingScreen() {
            if (this.loadingScreen) {
                gsap.to(this.loadingScreen, {
                    opacity: 0,
                    duration: 0.5,
                    ease: CONFIG.EASING.PRIMARY,
                    onComplete: () => {
                        this.loadingScreen.style.display = 'none';
                        state.isLoaded = true;

                        // Announce to screen readers
                        this.announceLoaded();
                    }
                });
            }
        },

        announceLoaded() {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = 'Kairo Studio experience loaded. Use arrow keys or click to navigate.';
            document.body.appendChild(announcement);

            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 3000);
        }
    };

    // ===================================
    // MOBILE DETECTION & FALLBACK
    // ===================================

    function checkMobileAndWebGL() {
        console.log('Checking device capabilities...');

        const mobileFallback = document.getElementById('mobileFallback');
        const continueBtn = document.getElementById('continueMobile');

        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            state.is3DSupported = false;
            console.error('WebGL is not supported');
            alert('Your browser doesn\'t support WebGL. Please use a modern browser.');
            return false;
        }

        state.supportsWebGL2 = Utils.detectWebGL2();
        state.isLowPowerMode = Utils.detectLowPowerMode();

        console.log('WebGL supported:', true);
        console.log('WebGL2 supported:', state.supportsWebGL2);
        console.log('Low power mode:', state.isLowPowerMode);

        // Show mobile warning on small screens
        if (state.isMobile && window.innerWidth < 768) {
            console.log('Mobile device detected');
            if (mobileFallback) {
                mobileFallback.classList.add('active');
            }

            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    mobileFallback.classList.remove('active');
                    initApp();
                });
            }

            return false;
        }

        console.log('Desktop/tablet mode detected');
        return true;
    }

    // ===================================
    // 3D SCENE INITIALIZATION
    // ===================================

    function init3DScene() {
        console.log('Initializing 3D scene...');

        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded!');
            alert('Three.js library failed to load. Please check your internet connection and refresh.');
            return;
        }

        if (typeof gsap === 'undefined') {
            console.error('GSAP is not loaded!');
            alert('GSAP library failed to load. Please check your internet connection and refresh.');
            return;
        }

        const canvas = document.getElementById('scene-canvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        try {
            // Scene
            state.scene = new THREE.Scene();
            state.scene.background = new THREE.Color(0x000000);
            state.scene.fog = new THREE.Fog(0x000000, 15, 60);

            // Clock for delta time
            state.clock = new THREE.Clock();

            // Camera
            state.camera = new THREE.PerspectiveCamera(
                CONFIG.CAMERA.FOV,
                window.innerWidth / window.innerHeight,
                CONFIG.CAMERA.NEAR,
                CONFIG.CAMERA.FAR
            );
            state.camera.position.set(
                CONFIG.CAMERA.DEFAULT_X,
                CONFIG.CAMERA.DEFAULT_Y,
                CONFIG.CAMERA.DEFAULT_Z + 2 // Start further back for dolly
            );

            // Renderer
            state.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !state.isMobile,
                alpha: true,
                powerPreference: state.isLowPowerMode ? 'low-power' : 'high-performance'
            });
            state.renderer.setSize(window.innerWidth, window.innerHeight);
            state.renderer.setPixelRatio(state.devicePixelRatio);
            state.renderer.shadowMap.enabled = !state.isMobile;
            state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Raycaster for interactions
            state.raycaster = new THREE.Raycaster();

            // Lighting
            createLighting();

            // Create environment
            createStudioEnvironment();

            // Create interactive elements
            createInteractiveElements();

            // Create workflow stations
            createWorkflowStations();

            // Setup interactions
            setupInteractions();

            // Setup accessibility
            setupAccessibility();

            // Start animation loop
            animate();

            console.log('3D scene initialized successfully!');
        } catch (error) {
            console.error('Error initializing 3D scene:', error);
            alert('Failed to initialize 3D scene: ' + error.message);
        }
    }

    // ===================================
    // LIGHTING SETUP
    // ===================================

    function createLighting() {
        // Ambient light
        state.lights.ambient = new THREE.AmbientLight(0xffffff, 0.4);
        state.scene.add(state.lights.ambient);

        // Key light (directional, for sweeps)
        state.lights.key = new THREE.DirectionalLight(0x0066ff, 0.9);
        state.lights.key.position.set(10, 10, 10);
        state.lights.key.castShadow = !state.isMobile;
        state.scene.add(state.lights.key);

        // Fill light
        state.lights.fill = new THREE.PointLight(0xff6b00, 0.6, 50);
        state.lights.fill.position.set(-10, 5, 5);
        state.scene.add(state.lights.fill);

        // Accent light
        state.lights.accent = new THREE.PointLight(0x00ccff, 0.4, 30);
        state.lights.accent.position.set(0, -5, 8);
        state.scene.add(state.lights.accent);

        // Animate key light sweep (9-14s cycle)
        animateKeyLightSweep();
    }

    function animateKeyLightSweep() {
        if (state.motionEnabled && !state.prefersReducedMotion) {
            const duration = Utils.randomRange(9, 14);

            const tl = gsap.timeline({
                repeat: -1,
                repeatDelay: duration - 2.4
            });

            tl.to(state.lights.key, {
                intensity: 1.5,
                duration: 1.2,
                ease: CONFIG.EASING.SINE
            });

            tl.to(state.lights.key, {
                intensity: 0.9,
                duration: 1.2,
                ease: CONFIG.EASING.SINE
            });
        }
    }

    // ===================================
    // STUDIO ENVIRONMENT
    // ===================================

    function createStudioEnvironment() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -3;
        floor.receiveShadow = !state.isMobile;
        state.scene.add(floor);

        // Grid helper (subtle)
        const gridHelper = new THREE.GridHelper(50, 50, 0x0066ff, 0x1a1a1a);
        gridHelper.position.y = -2.99;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        state.scene.add(gridHelper);

        // Create walls (navigation sections)
        createWalls();

        // Floating particles
        createFloatingParticles();

        // Hero object (central focus)
        createHeroObject();
    }

    function createWalls() {
        // Create 6 hexagonal walls arranged in a hexagonal pattern around the center
        const wallConfigs = [
            { label: 'Entry', position: [0, 0, -10], rotation: Math.PI, color: 0x9966ff, index: 0 },
            { label: 'About', position: [-8.66, 0, -5], rotation: 2 * Math.PI / 3, color: 0x0066ff, index: 1 },
            { label: 'Work', position: [-8.66, 0, 5], rotation: Math.PI / 3, color: 0x00ccff, index: 2 },
            { label: 'Services', position: [0, 0, 10], rotation: 0, color: 0xff6b00, index: 3 },
            { label: 'Demos', position: [8.66, 0, 5], rotation: -Math.PI / 3, color: 0x00ff88, index: 4 },
            { label: 'Contact', position: [8.66, 0, -5], rotation: -2 * Math.PI / 3, color: 0xff3366, index: 5 }
        ];

        wallConfigs.forEach(config => {
            const wall = createWall(config);
            state.walls.push(wall);
            state.scene.add(wall);
        });
    }

    function createHexagonShape(width, height) {
        // Create a hexagon shape
        const shape = new THREE.Shape();
        const hexWidth = width;
        const hexHeight = height;

        // Hexagon vertices (pointy-top orientation)
        const angle = Math.PI / 3; // 60 degrees
        const radius = hexHeight / 2;

        shape.moveTo(0, radius);
        for (let i = 1; i <= 6; i++) {
            const x = radius * Math.sin(i * angle);
            const y = radius * Math.cos(i * angle);
            shape.lineTo(x, y);
        }

        return shape;
    }

    function createWall(config) {
        const group = new THREE.Group();

        // Create hexagonal wall panel
        const hexShape = createHexagonShape(7, 7);
        const extrudeSettings = {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.05,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide,
            emissive: config.color,
            emissiveIntensity: 0.1,
            roughness: 0.7,
            metalness: 0.3
        });

        const wall = new THREE.Mesh(geometry, material);
        wall.castShadow = false;
        wall.receiveShadow = false;
        group.add(wall);

        // Hexagonal border
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        const border = new THREE.LineSegments(edges, lineMaterial);
        group.add(border);

        // Larger invisible hitbox for better click detection (hexagonal)
        const hitboxShape = createHexagonShape(9, 9);
        const hitboxGeometry = new THREE.ShapeGeometry(hitboxShape);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.userData.isHitbox = true;
        hitbox.userData.isWall = true;
        group.add(hitbox);

        // Text sprite
        const textSprite = createTextSprite(config.label, config.color);
        textSprite.position.y = 0;
        textSprite.position.z = 0.1; // Slightly in front to avoid z-fighting
        group.add(textSprite);

        // Position and rotation
        group.position.set(...config.position);
        group.rotation.y = config.rotation;

        // User data
        group.userData = {
            type: 'wall',
            section: config.label.toLowerCase(),
            color: config.color,
            originalOpacity: 0.05,
            index: config.index
        };

        return group;
    }

    function createTextSprite(text, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 2048; // Increased resolution for better clarity
        canvas.height = 512;

        // Clear canvas with transparency
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Add subtle glow effect for better visibility
        context.shadowColor = '#' + color.toString(16).padStart(6, '0');
        context.shadowBlur = 20;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        // Draw text with better styling
        context.fillStyle = '#ffffff'; // Pure white for maximum contrast
        context.font = 'Bold 180px Space Grotesk, Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text.toUpperCase(), 1024, 256);

        // Add a second layer with color for depth
        context.shadowBlur = 40;
        context.fillStyle = '#' + color.toString(16).padStart(6, '0');
        context.globalAlpha = 0.8;
        context.fillText(text.toUpperCase(), 1024, 256);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            depthTest: false, // Ensure text is always visible
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(8, 2, 1); // Larger scale for better visibility

        return sprite;
    }

    function createFloatingParticles() {
        const particleCount = state.isMobile ? 300 : 800;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = Utils.randomRange(-25, 25);     // x
            positions[i + 1] = Utils.randomRange(-10, 10);  // y
            positions[i + 2] = Utils.randomRange(-25, 25);  // z
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x0066ff,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        state.particles = new THREE.Points(geometry, material);
        state.scene.add(state.particles);

        // Store original positions for animation
        state.particles.userData.originalPositions = positions.slice();
        state.particles.userData.velocities = new Float32Array(particleCount * 3);

        // Initialize random velocities
        for (let i = 0; i < particleCount * 3; i++) {
            state.particles.userData.velocities[i] = Utils.randomRange(-0.02, 0.02);
        }
    }

    function createHeroObject() {
        // Central hero object (abstract geometric shape)
        const group = new THREE.Group();

        // Main shape - icosahedron
        const geometry = new THREE.IcosahedronGeometry(1.5, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0066ff,
            emissive: 0x0033aa,
            emissiveIntensity: 0.3,
            roughness: 0.3,
            metalness: 0.7,
            wireframe: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = !state.isMobile;
        mesh.receiveShadow = !state.isMobile;
        group.add(mesh);

        // Wireframe overlay
        const wireframeGeometry = new THREE.IcosahedronGeometry(1.52, 1);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ccff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        group.add(wireframe);

        group.position.set(0, 0, 0);

        state.heroObject = group;
        state.scene.add(group);

        // Ambient rotation animation
        if (state.motionEnabled && !state.prefersReducedMotion) {
            gsap.to(group.rotation, {
                y: Math.PI * 2,
                duration: 120,
                ease: 'none',
                repeat: -1
            });
        }
    }

    // ===================================
    // INTERACTIVE PROJECT CARDS
    // ===================================

    function createInteractiveElements() {
        const projectConfigs = [
            {
                name: 'CANON',
                position: [-4, 1.2, 3],
                color: 0x0066ff,
                rotation: 0.2
            },
            {
                name: 'AMUL',
                position: [0, 1.8, 4],
                color: 0x00ccff,
                rotation: -0.1
            },
            {
                name: 'LOCAL',
                position: [4, 1, 3],
                color: 0xff6b00,
                rotation: 0.15
            }
        ];

        projectConfigs.forEach((config, index) => {
            const card = createProjectCard(config, index);
            state.projects3D.push(card);
            state.scene.add(card);
        });
    }

    function createProjectCard(config, index) {
        const group = new THREE.Group();

        // Card base
        const cardGeometry = new THREE.BoxGeometry(2.2, 1.6, 0.12);
        const cardMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.85,
            roughness: 0.4,
            metalness: 0.6
        });

        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        card.castShadow = !state.isMobile;
        card.receiveShadow = !state.isMobile;
        group.add(card);

        // Border frame
        const frameGeometry = new THREE.BoxGeometry(2.3, 1.7, 0.1);
        const frameEdges = new THREE.EdgesGeometry(frameGeometry);
        const frameMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });
        const frame = new THREE.LineSegments(frameEdges, frameMaterial);
        group.add(frame);

        // Text
        const textSprite = createTextSprite(config.name, config.color);
        textSprite.scale.set(1.8, 0.45, 1);
        textSprite.position.z = 0.07;
        group.add(textSprite);

        // Position
        group.position.set(...config.position);
        group.rotation.y = config.rotation;

        // User data
        group.userData = {
            type: 'project',
            name: config.name,
            color: config.color,
            originalPosition: { ...config.position },
            originalRotation: config.rotation,
            originalScale: 1,
            floatOffset: index * Math.PI * 0.66, // Phase offset for floating
            isExpanded: false
        };

        return group;
    }

    // ===================================
    // WORKFLOW STATIONS
    // ===================================

    function createWorkflowStations() {
        const stationConfigs = [
            {
                name: 'Research',
                position: [-6, -1, 2],
                color: 0x0066ff,
                icon: 'magnifier'
            },
            {
                name: 'Strategy',
                position: [-2, -1, 3],
                color: 0x00aaff,
                icon: 'nodes'
            },
            {
                name: 'Design',
                position: [2, -1, 3],
                color: 0xff6b00,
                icon: 'screen'
            },
            {
                name: 'Development',
                position: [6, -1, 2],
                color: 0xff3366,
                icon: 'code'
            }
        ];

        stationConfigs.forEach((config, index) => {
            const station = createWorkflowStation(config, index);
            state.workflowStations.push(station);
            state.scene.add(station);
        });

        // Create connection lines
        createWorkflowConnections();
    }

    function createWorkflowStation(config, index) {
        const group = new THREE.Group();

        // Base platform
        const platformGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6,
            roughness: 0.5,
            metalness: 0.5
        });

        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.castShadow = !state.isMobile;
        group.add(platform);

        // Icon representation (simple geometric shape)
        let iconMesh;
        switch(config.icon) {
            case 'magnifier':
                iconMesh = new THREE.Mesh(
                    new THREE.TorusGeometry(0.3, 0.05, 16, 32),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                break;
            case 'nodes':
                iconMesh = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.3),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                break;
            case 'screen':
                iconMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.5, 0.35),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                break;
            case 'code':
                iconMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.4, 0.1),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                break;
        }

        if (iconMesh) {
            iconMesh.position.y = 0.5;
            group.add(iconMesh);
        }

        // Label
        const labelSprite = createTextSprite(config.name, config.color);
        labelSprite.scale.set(2, 0.5, 1);
        labelSprite.position.y = -0.5;
        group.add(labelSprite);

        group.position.set(...config.position);

        group.userData = {
            type: 'workflowStation',
            name: config.name.toLowerCase(),
            color: config.color,
            index: index,
            isActive: index === 0, // Research is active by default
            iconMesh: iconMesh
        };

        return group;
    }

    function createWorkflowConnections() {
        for (let i = 0; i < state.workflowStations.length - 1; i++) {
            const start = state.workflowStations[i].position;
            const end = state.workflowStations[i + 1].position;

            const points = [
                new THREE.Vector3(start.x, start.y, start.z),
                new THREE.Vector3(end.x, end.y, end.z)
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineDashedMaterial({
                color: 0x0066ff,
                dashSize: 0.2,
                gapSize: 0.1,
                transparent: true,
                opacity: 0.3
            });

            const line = new THREE.Line(geometry, material);
            line.computeLineDistances();

            line.userData = {
                type: 'workflowConnection',
                fromIndex: i,
                toIndex: i + 1
            };

            state.scene.add(line);
        }
    }

    // ===================================
    // PROJECT CARD EXPAND/COLLAPSE
    // ===================================

    function expandProjectCard(card) {
        if (card.userData.isExpanded) return;

        card.userData.isExpanded = true;

        const tl = gsap.timeline();

        // Stage 1: Dim background (200ms)
        tl.to(state.scene.fog, {
            near: 5,
            far: 20,
            duration: 0.2,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        // Dim other elements
        state.walls.forEach(wall => {
            tl.to(wall.children[0].material, {
                opacity: 0.02,
                duration: 0.2
            }, 0);
        });

        state.projects3D.forEach(otherCard => {
            if (otherCard !== card) {
                tl.to(otherCard.children[0].material, {
                    opacity: 0.3,
                    duration: 0.2
                }, 0);
            }
        });

        // Stage 2: Card lifts and scales (320ms)
        const liftAmount = 2;
        tl.to(card.position, {
            z: card.position.z + liftAmount,
            duration: CONFIG.TIMING.MODAL_EXPAND / 1000,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        tl.to(card.scale, {
            x: 1.4,
            y: 1.4,
            z: 1.4,
            duration: CONFIG.TIMING.MODAL_EXPAND / 1000,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        // Stage 3: Camera dollies and centers (700ms)
        const targetCameraPos = {
            x: card.position.x * 0.5,
            y: card.position.y,
            z: card.position.z + 4
        };

        tl.to(state.camera.position, {
            x: targetCameraPos.x,
            y: targetCameraPos.y,
            z: targetCameraPos.z,
            duration: CONFIG.TIMING.MODAL_CAMERA / 1000,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        // Stage 4: Open project modal with content
        tl.call(() => {
            openProjectModal(card.userData.name);
        }, null, 0.7);

        state.activeTimelines.push(tl);
    }

    function collapseProjectCard(card) {
        if (!card.userData.isExpanded) return;

        card.userData.isExpanded = false;

        // Kill existing timeline
        state.activeTimelines.forEach(tl => tl.kill());
        state.activeTimelines = [];

        const tl = gsap.timeline();

        // Restore fog
        tl.to(state.scene.fog, {
            near: 15,
            far: 60,
            duration: 0.42,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        // Restore walls
        state.walls.forEach(wall => {
            tl.to(wall.children[0].material, {
                opacity: wall.userData.originalOpacity,
                duration: 0.42
            }, 0);
        });

        // Restore cards
        state.projects3D.forEach(otherCard => {
            tl.to(otherCard.children[0].material, {
                opacity: 0.85,
                duration: 0.42
            }, 0);
        });

        // Restore card position and scale
        tl.to(card.position, {
            x: card.userData.originalPosition[0],
            y: card.userData.originalPosition[1],
            z: card.userData.originalPosition[2],
            duration: 0.42,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        tl.to(card.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.42,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        // Restore camera
        tl.to(state.camera.position, {
            x: CONFIG.CAMERA.DEFAULT_X,
            y: CONFIG.CAMERA.DEFAULT_Y,
            z: CONFIG.CAMERA.DEFAULT_Z,
            duration: 0.42,
            ease: CONFIG.EASING.PRIMARY
        }, 0);

        state.activeTimelines.push(tl);
    }

    // ===================================
    // WORKFLOW STATION TRANSITIONS
    // ===================================

    function transitionToWorkflowStep(stepName) {
        const station = state.workflowStations.find(s => s.userData.name === stepName);
        if (!station) return;

        const previousIndex = state.workflowStations.findIndex(s => s.userData.isActive);
        const newIndex = station.userData.index;

        // Deactivate previous
        if (previousIndex >= 0) {
            state.workflowStations[previousIndex].userData.isActive = false;
        }

        // Activate new
        station.userData.isActive = true;
        state.currentWorkflowStep = stepName;

        const tl = gsap.timeline();

        // Station pulse (180ms)
        tl.to(station.scale, {
            x: 1.08,
            y: 1.08,
            z: 1.08,
            duration: 0.18,
            ease: CONFIG.EASING.SOFT_POP,
            yoyo: true,
            repeat: 1
        }, 0);

        // Connector animation - draw line (420ms)
        const connectionLines = state.scene.children.filter(
            child => child.userData.type === 'workflowConnection'
        );

        connectionLines.forEach(line => {
            if (line.userData.fromIndex === Math.min(previousIndex, newIndex) &&
                line.userData.toIndex === Math.max(previousIndex, newIndex)) {

                // Animate line dash
                tl.to(line.material, {
                    opacity: 0.8,
                    duration: 0.42,
                    ease: CONFIG.EASING.PRIMARY,
                    onComplete: () => {
                        gsap.to(line.material, {
                            opacity: 0.3,
                            duration: 0.3,
                            delay: 0.5
                        });
                    }
                }, 0.18);
            }
        });

        // Station icon animation (520ms)
        if (station.userData.iconMesh) {
            // Rotate icon
            tl.to(station.userData.iconMesh.rotation, {
                y: station.userData.iconMesh.rotation.y + Math.PI * 2,
                duration: 0.52,
                ease: CONFIG.EASING.PRIMARY
            }, 0.18);
        }

        state.activeTimelines.push(tl);
    }

    // ===================================
    // CAMERA CHOREOGRAPHY
    // ===================================

    function navigateToSection(section) {
        state.currentSection = section;
        console.log('Navigating to:', section);

        // Update section indicator
        const sectionIndicator = document.querySelector('.indicator-text');
        if (sectionIndicator) {
            sectionIndicator.textContent = section.toUpperCase();
        }

        // Find wall
        const wall = state.walls.find(w => w.userData.section === section);
        if (!wall) return;

        const tl = gsap.timeline();

        // Calculate proper camera position to face the wall
        // Position camera perpendicular to the wall at a good viewing distance
        let targetPos = { x: 0, y: 0, z: 0 };
        const viewDistance = 6; // Distance from wall for optimal viewing

        // Calculate position based on wall location - use the wall's rotation to position camera
        const wallAngle = wall.rotation.y;
        const offsetX = Math.sin(wallAngle) * viewDistance;
        const offsetZ = Math.cos(wallAngle) * viewDistance;

        targetPos = {
            x: wall.position.x - offsetX,
            y: 0.5, // Slightly elevated for better view
            z: wall.position.z - offsetZ
        };

        // Store target look-at point for the camera
        state.cameraLookAtTarget = new THREE.Vector3(wall.position.x, wall.position.y, wall.position.z);

        // Stage 1: Camera zoom out slightly (220ms)
        const currentZ = state.camera.position.z;
        tl.to(state.camera.position, {
            z: currentZ + 0.5,
            duration: 0.22,
            ease: CONFIG.EASING.SNAPPY
        }, 0);

        // Stage 2: Main move to target (700ms)
        tl.to(state.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 0.7,
            ease: CONFIG.EASING.PRIMARY
        }, 0.22);

        // Stage 3: Subtle zoom in (200ms)
        tl.to(state.camera.position, {
            z: targetPos.z * 0.95,
            duration: 0.2,
            ease: CONFIG.EASING.SOFT_POP
        }, 0.92);

        // Open panel
        tl.call(() => {
            openPanel(section + 'Panel');
        }, null, 0.7);

        state.activeTimelines.push(tl);
    }

    // ===================================
    // INTERACTIONS SETUP
    // ===================================

    function setupInteractions() {
        const canvas = document.getElementById('scene-canvas');
        if (!canvas) return;

        // Mouse move for parallax and hover
        window.addEventListener('mousemove', onMouseMove);

        // Click events
        canvas.addEventListener('click', onClick);

        // Scroll for camera zoom
        window.addEventListener('wheel', onWheel, { passive: true });

        // Touch support for mobile
        if (state.isMobile) {
            canvas.addEventListener('touchstart', onTouchStart);
            canvas.addEventListener('touchmove', onTouchMove);
        }

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                navigateToSection(section);
            });
        });

        // Panel close buttons
        document.querySelectorAll('.panel-close').forEach(btn => {
            btn.addEventListener('click', closeAllPanels);
        });

        // Modal close
        const modalClose = document.querySelector('.project-modal .modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', closeProjectModal);
        }

        // Workflow timeline steps
        document.querySelectorAll('.timeline-step').forEach(step => {
            step.addEventListener('click', () => {
                const stepName = step.getAttribute('data-step');
                activateWorkflowStep(stepName);
            });

            // Keyboard support
            step.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const stepName = step.getAttribute('data-step');
                    activateWorkflowStep(stepName);
                }
            });
        });

        // Window resize
        window.addEventListener('resize', onWindowResize);

        // Keyboard navigation
        document.addEventListener('keydown', onKeyDown);
    }

    function onMouseMove(event) {
        // Update mouse normalized coordinates
        state.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        state.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Parallax camera effect (spring interpolation)
        if (state.motionEnabled && !state.prefersReducedMotion && state.camera) {
            const maxOffset = CONFIG.CAMERA.PARALLAX_MAX_OFFSET;
            const targetX = state.mouse.x * maxOffset;
            const targetY = -state.mouse.y * maxOffset * 0.5;

            state.cameraTarget.x = targetX;
            state.cameraTarget.y = targetY;
        }

        // Raycasting for hover effects
        updateRaycasting();
    }

    function updateRaycasting() {
        if (!state.raycaster || !state.camera) return;

        state.raycaster.setFromCamera(state.mouse, state.camera);

        // Check walls - recursively check all children including hitbox
        let intersected = false;
        state.walls.forEach(wall => {
            const intersects = state.raycaster.intersectObjects(wall.children, true);

            // Check if any of the intersected objects belong to this wall
            const hasIntersection = intersects.length > 0;

            if (hasIntersection) {
                // Hover effect: increase opacity and scale
                const wallMesh = wall.children[0];
                const border = wall.children[1];

                gsap.to(wallMesh.material, {
                    opacity: 0.25,
                    emissiveIntensity: 0.4,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000,
                    ease: CONFIG.EASING.SOFT_POP
                });

                gsap.to(border.material, {
                    opacity: 1,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000,
                    ease: CONFIG.EASING.SOFT_POP
                });

                gsap.to(wall.scale, {
                    x: 1.08,
                    y: 1.08,
                    z: 1.08,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000,
                    ease: CONFIG.EASING.SOFT_POP
                });

                document.body.style.cursor = 'pointer';
                intersected = true;

                // Store hovered wall for better interaction
                state.hoveredObject = wall;
            } else {
                // Reset
                const wallMesh = wall.children[0];
                const border = wall.children[1];

                gsap.to(wallMesh.material, {
                    opacity: wall.userData.originalOpacity,
                    emissiveIntensity: 0.1,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000
                });

                gsap.to(border.material, {
                    opacity: 0.8,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000
                });

                gsap.to(wall.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000
                });
            }
        });

        // Check project cards
        state.projects3D.forEach(card => {
            if (card.userData.isExpanded) return;

            const intersects = state.raycaster.intersectObjects(card.children, false);
            if (intersects.length > 0) {
                // Hover effect: scale and elevation
                gsap.to(card.scale, {
                    x: 1.08,
                    y: 1.08,
                    z: 1.08,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000,
                    ease: CONFIG.EASING.SOFT_POP
                });

                gsap.to(card.position, {
                    y: card.userData.originalPosition[1] + 0.3,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000,
                    ease: CONFIG.EASING.SOFT_POP
                });

                document.body.style.cursor = 'pointer';
                intersected = true;
            } else {
                // Reset
                gsap.to(card.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: CONFIG.TIMING.HOVER_SCALE / 1000
                });
            }
        });

        if (!intersected) {
            document.body.style.cursor = 'default';
        }
    }

    function onClick(event) {
        // Update mouse position
        state.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        state.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (!state.raycaster || !state.camera) return;

        state.raycaster.setFromCamera(state.mouse, state.camera);

        // Check walls
        state.walls.forEach(wall => {
            const intersects = state.raycaster.intersectObjects(wall.children, true);
            if (intersects.length > 0) {
                navigateToSection(wall.userData.section);

                // Button click animation
                gsap.to(wall.scale, {
                    x: 0.98,
                    y: 0.98,
                    z: 0.98,
                    duration: CONFIG.TIMING.MICROINTERACTION_FAST / 1000,
                    ease: CONFIG.EASING.SNAPPY,
                    yoyo: true,
                    repeat: 1
                });
            }
        });

        // Check project cards
        state.projects3D.forEach(card => {
            const intersects = state.raycaster.intersectObjects(card.children, true);
            if (intersects.length > 0) {
                expandProjectCard(card);
            }
        });
    }

    function onWheel(event) {
        if (!state.camera || !state.motionEnabled) return;

        // Zoom camera
        const zoomSpeed = 0.01;
        const targetZ = state.camera.position.z + event.deltaY * zoomSpeed;
        const clampedZ = Utils.clamp(targetZ, 4, 12);

        gsap.to(state.camera.position, {
            z: clampedZ,
            duration: 0.3,
            ease: CONFIG.EASING.PRIMARY
        });

        // Auto-return to default after scroll stops
        clearTimeout(state.scrollTimeout);
        state.scrollTimeout = setTimeout(() => {
            if (!document.querySelector('.content-panel.active')) {
                gsap.to(state.camera.position, {
                    z: CONFIG.CAMERA.DEFAULT_Z,
                    duration: 1,
                    ease: CONFIG.EASING.PRIMARY
                });
            }
        }, 500);
    }

    function onTouchStart(event) {
        // Store touch position for mobile interactions
        if (event.touches.length > 0) {
            state.touchStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    function onTouchMove(event) {
        if (!state.touchStart || event.touches.length === 0) return;

        const deltaX = event.touches[0].clientX - state.touchStart.x;
        const deltaY = event.touches[0].clientY - state.touchStart.y;

        // Simplified parallax for mobile
        if (state.camera && state.motionEnabled) {
            const sensitivity = 0.001;
            state.camera.position.x += deltaX * sensitivity;
            state.camera.position.y -= deltaY * sensitivity;
        }

        state.touchStart = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    function onWindowResize() {
        if (!state.camera || !state.renderer) return;

        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onKeyDown(e) {
        // Escape key
        if (e.key === 'Escape') {
            closeAllPanels();
            closeProjectModal();
            return;
        }

        // Arrow keys for sequential section navigation through all 6 walls
        if (!document.querySelector('.content-panel.active')) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                // Navigate to next wall (clockwise)
                e.preventDefault();
                navigateToNextWall(1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                // Navigate to previous wall (counter-clockwise)
                e.preventDefault();
                navigateToNextWall(-1);
            }
        }

        // Number keys 1-6 for direct wall navigation
        if (e.key >= '1' && e.key <= '6') {
            const wallIndex = parseInt(e.key) - 1;
            if (state.walls[wallIndex]) {
                navigateToSection(state.walls[wallIndex].userData.section);
            }
        }

        // Letter keys for workflow steps
        if (e.key === 'r' || e.key === 'R') {
            activateWorkflowStep('research');
        } else if (e.key === 't' || e.key === 'T') {
            activateWorkflowStep('strategy');
        } else if (e.key === 'd' || e.key === 'D') {
            activateWorkflowStep('design');
        } else if (e.key === 'v' || e.key === 'V') {
            activateWorkflowStep('development');
        }
    }

    // Helper function to navigate to next/previous wall sequentially
    function navigateToNextWall(direction) {
        // Find current wall index
        let currentIndex = state.walls.findIndex(wall => wall.userData.section === state.currentSection);

        // If no current section or not found, start from entry (index 0)
        if (currentIndex === -1) {
            currentIndex = 0;
        } else {
            // Move to next/previous wall (with wrapping)
            currentIndex = (currentIndex + direction + state.walls.length) % state.walls.length;
        }

        // Navigate to the wall at the new index
        const targetWall = state.walls[currentIndex];
        if (targetWall) {
            navigateToSection(targetWall.userData.section);
        }
    }

    // ===================================
    // PANEL MANAGEMENT
    // ===================================

    function openPanel(panelId) {
        // Close all panels
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Open requested panel
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('active');

            // Animate panel content with stagger
            const panelContent = panel.querySelector('.panel-content');
            if (panelContent) {
                gsap.from(panelContent.children, {
                    y: 30,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: CONFIG.EASING.SOFT_POP,
                    clearProps: 'all'
                });
            }

            // Animate stats if present
            const stats = panel.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const targetValue = parseInt(stat.textContent.replace(/\D/g, ''));
                if (!isNaN(targetValue)) {
                    Utils.animateCounter(stat, 0, targetValue, 800);
                }
            });
        }
    }

    function closeAllPanels() {
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Reset camera to default
        if (state.camera) {
            gsap.to(state.camera.position, {
                x: CONFIG.CAMERA.DEFAULT_X,
                y: CONFIG.CAMERA.DEFAULT_Y,
                z: CONFIG.CAMERA.DEFAULT_Z,
                duration: 0.7,
                ease: CONFIG.EASING.PRIMARY
            });
        }

        // Reset camera look-at target
        state.cameraLookAtTarget = null;

        // Collapse any expanded cards
        state.projects3D.forEach(card => {
            if (card.userData.isExpanded) {
                collapseProjectCard(card);
            }
        });
    }

    // ===================================
    // PROJECT MODAL
    // ===================================

    function openProjectModal(projectName) {
        const modal = document.getElementById('projectModal');
        const modalContent = document.getElementById('projectModalContent');

        if (!modal || !modalContent) return;

        // Generate project content
        modalContent.innerHTML = `
            <h2 style="font-family: var(--font-heading); font-size: 3rem; margin-bottom: 2rem;
                       background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
                       -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ${projectName} Project
            </h2>
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, rgba(0,102,255,0.2), rgba(255,107,0,0.2));
                        border-radius: 1rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 4rem; opacity: 0.3; font-family: var(--font-heading);">${projectName}</span>
            </div>
            <p style="font-size: 1.25rem; margin-bottom: 2rem; color: var(--color-gray-300); line-height: 1.6;">
                Complete brand digital experience redesign showcasing our research-driven approach, strategic thinking, and technical excellence.
            </p>
            <h3 style="font-family: var(--font-heading); margin: 2rem 0 1rem; color: white; font-size: 1.75rem;">Impact Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 2rem;">
                <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
                    <div class="metric-value" style="font-size: 3rem; font-weight: 700; color: var(--color-primary); font-family: var(--font-heading);" data-value="150">0</div>
                    <div style="color: var(--color-gray-600); text-transform: uppercase; font-size: 0.875rem; margin-top: 0.5rem; letter-spacing: 0.05em;">User Engagement</div>
                </div>
                <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
                    <div class="metric-value" style="font-size: 3rem; font-weight: 700; color: var(--color-primary); font-family: var(--font-heading);" data-value="200">0</div>
                    <div style="color: var(--color-gray-600); text-transform: uppercase; font-size: 0.875rem; margin-top: 0.5rem; letter-spacing: 0.05em;">Conversion Rate</div>
                </div>
                <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
                    <div class="metric-value" style="font-size: 3rem; font-weight: 700; color: var(--color-primary); font-family: var(--font-heading);" data-value="95">0</div>
                    <div style="color: var(--color-gray-600); text-transform: uppercase; font-size: 0.875rem; margin-top: 0.5rem; letter-spacing: 0.05em;">Client Satisfaction</div>
                </div>
            </div>
        `;

        // Show modal
        modal.classList.add('active');

        // Animate modal content
        gsap.from(modalContent.children, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: CONFIG.EASING.SOFT_POP,
            clearProps: 'all'
        });

        // Animate metrics with counter
        setTimeout(() => {
            const metrics = modalContent.querySelectorAll('.metric-value');
            metrics.forEach(metric => {
                const targetValue = parseInt(metric.getAttribute('data-value'));
                Utils.animateCounter(metric, 0, targetValue, 800);
            });
        }, 400);
    }

    function closeProjectModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.remove('active');
        }

        // Collapse any expanded cards
        state.projects3D.forEach(card => {
            if (card.userData.isExpanded) {
                collapseProjectCard(card);
            }
        });
    }

    // ===================================
    // WORKFLOW STEP ACTIVATION
    // ===================================

    function activateWorkflowStep(stepName) {
        // Update UI
        document.querySelectorAll('.timeline-step').forEach(step => {
            if (step.getAttribute('data-step') === stepName) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Transition 3D station
        transitionToWorkflowStep(stepName);
    }

    // ===================================
    // ACCESSIBILITY
    // ===================================

    function setupAccessibility() {
        // Motion toggle button
        const motionToggle = document.getElementById('motionToggle');
        if (motionToggle) {
            // Set initial state
            if (state.prefersReducedMotion) {
                state.motionEnabled = false;
                motionToggle.classList.add('active');
                document.body.classList.add('motion-reduced');
            }

            motionToggle.addEventListener('click', () => {
                state.motionEnabled = !state.motionEnabled;
                motionToggle.classList.toggle('active');
                document.body.classList.toggle('motion-reduced');

                // Announce change
                const announcement = document.createElement('div');
                announcement.setAttribute('role', 'status');
                announcement.setAttribute('aria-live', 'polite');
                announcement.className = 'sr-only';
                announcement.textContent = state.motionEnabled ?
                    'Animations enabled' : 'Animations disabled';
                document.body.appendChild(announcement);

                setTimeout(() => {
                    document.body.removeChild(announcement);
                }, 2000);

                // Update animations
                if (!state.motionEnabled) {
                    disableMotion();
                } else {
                    enableMotion();
                }
            });
        }

        // Listen for system preference changes
        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionMediaQuery.addEventListener('change', (e) => {
            state.prefersReducedMotion = e.matches;
            if (e.matches) {
                state.motionEnabled = false;
                document.body.classList.add('motion-reduced');
                if (motionToggle) {
                    motionToggle.classList.add('active');
                }
                disableMotion();
            }
        });
    }

    function disableMotion() {
        // Kill all GSAP animations
        gsap.killTweensOf('*');
        state.activeTimelines.forEach(tl => tl.kill());
        state.activeTimelines = [];

        // Reduce scene animations
        if (state.heroObject) {
            state.heroObject.rotation.set(0, 0, 0);
        }
    }

    function enableMotion() {
        // Restart ambient animations
        if (state.heroObject) {
            gsap.to(state.heroObject.rotation, {
                y: Math.PI * 2,
                duration: 120,
                ease: 'none',
                repeat: -1
            });
        }

        animateKeyLightSweep();
    }

    // ===================================
    // ANIMATION LOOP
    // ===================================

    function animate() {
        state.animationId = requestAnimationFrame(animate);

        const deltaTime = state.clock.getDelta();
        state.performance.deltaTime = deltaTime;

        // Performance monitoring
        PerformanceMonitor.update(deltaTime);

        // Update camera parallax (spring interpolation)
        if (state.motionEnabled && !state.prefersReducedMotion && state.camera) {
            const result = Utils.springInterpolate(
                state.camera.position.x,
                state.cameraTarget.x,
                state.cameraVelocity.x,
                CONFIG.CAMERA.PARALLAX_STIFFNESS,
                CONFIG.CAMERA.PARALLAX_DAMPING,
                deltaTime
            );
            state.camera.position.x = result.value;
            state.cameraVelocity.x = result.velocity;

            const resultY = Utils.springInterpolate(
                state.camera.position.y,
                state.cameraTarget.y,
                state.cameraVelocity.y,
                CONFIG.CAMERA.PARALLAX_STIFFNESS,
                CONFIG.CAMERA.PARALLAX_DAMPING,
                deltaTime
            );
            state.camera.position.y = resultY.value;
            state.cameraVelocity.y = resultY.velocity;
        }

        // Animate particles (ambient motion)
        if (state.particles && state.motionEnabled && !state.prefersReducedMotion) {
            const positions = state.particles.geometry.attributes.position.array;
            const velocities = state.particles.userData.velocities;
            const time = Date.now() * 0.0001;

            for (let i = 0; i < positions.length; i += 3) {
                // Slow sine wave motion
                positions[i + 1] += Math.sin(time + i) * 0.002;
            }

            state.particles.geometry.attributes.position.needsUpdate = true;
            state.particles.rotation.y += 0.0001;
        }

        // Float project cards (ambient motion)
        if (state.motionEnabled && !state.prefersReducedMotion) {
            const time = Date.now() * 0.001;

            state.projects3D.forEach((card) => {
                if (!card.userData.isExpanded) {
                    const floatY = Math.sin(time + card.userData.floatOffset) * 0.08;
                    card.position.y = card.userData.originalPosition[1] + floatY;

                    // Subtle rotation
                    card.rotation.y = card.userData.originalRotation + Math.sin(time * 0.5 + card.userData.floatOffset) * 0.02;
                }
            });
        }

        // Rotate workflow station icons
        if (state.motionEnabled && !state.prefersReducedMotion) {
            state.workflowStations.forEach(station => {
                if (station.userData.iconMesh && station.userData.isActive) {
                    station.userData.iconMesh.rotation.y += 0.01;
                }
            });
        }

        // Gentle wall rotation
        if (state.motionEnabled && !state.prefersReducedMotion) {
            state.walls.forEach((wall, index) => {
                wall.rotation.y += 0.0001 * (index % 2 === 0 ? 1 : -1);
            });
        }

        // Camera look at - use target if set, otherwise look at center
        if (state.camera) {
            if (state.cameraLookAtTarget) {
                state.camera.lookAt(state.cameraLookAtTarget);
            } else {
                state.camera.lookAt(0, 0, 0);
            }
        }

        // Render
        if (state.renderer && state.scene && state.camera) {
            state.renderer.render(state.scene, state.camera);
        }
    }

    // ===================================
    // CONTACT FORM
    // ===================================

    function setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);

                console.log('Form submitted:', data);

                // Button click animation
                const submitBtn = contactForm.querySelector('.submit-btn');
                if (submitBtn) {
                    gsap.to(submitBtn, {
                        scale: 0.95,
                        duration: CONFIG.TIMING.MICROINTERACTION_FAST / 1000,
                        ease: CONFIG.EASING.SNAPPY,
                        yoyo: true,
                        repeat: 1
                    });
                }

                // Show success message with better UX
                setTimeout(() => {
                    // Create success message overlay
                    const successMsg = document.createElement('div');
                    successMsg.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: linear-gradient(135deg, rgba(0,102,255,0.95), rgba(0,204,255,0.95));
                        padding: 3rem;
                        border-radius: 1rem;
                        text-align: center;
                        z-index: 10000;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                        max-width: 500px;
                    `;
                    successMsg.innerHTML = `
                        <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
                        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1rem; color: white;">Message Sent Successfully!</h3>
                        <p style="color: rgba(255,255,255,0.9); margin-bottom: 1.5rem;">Thank you for reaching out. We'll review your inquiry and get back to you within 24 hours.</p>
                        <button onclick="this.parentElement.remove()" style="padding: 0.75rem 2rem; background: white; color: var(--color-primary); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem;">Close</button>
                    `;
                    document.body.appendChild(successMsg);

                    // Animate in
                    gsap.from(successMsg, {
                        scale: 0.8,
                        opacity: 0,
                        duration: 0.4,
                        ease: 'back.out(1.7)'
                    });

                    contactForm.reset();

                    // Auto close after 5 seconds
                    setTimeout(() => {
                        if (successMsg.parentElement) {
                            gsap.to(successMsg, {
                                opacity: 0,
                                scale: 0.9,
                                duration: 0.3,
                                onComplete: () => successMsg.remove()
                            });
                        }
                    }, 5000);
                }, 300);
            });

            // Form field validation animations
            const inputs = contactForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('invalid', (e) => {
                    e.preventDefault();

                    // Shake animation
                    gsap.to(input, {
                        x: -8,
                        duration: 0.05,
                        repeat: 5,
                        yoyo: true,
                        ease: 'none',
                        onComplete: () => {
                            gsap.set(input, { x: 0 });
                        }
                    });

                    input.style.borderColor = '#ff3366';
                });

                input.addEventListener('input', () => {
                    if (input.validity.valid) {
                        input.style.borderColor = '';
                    }
                });
            });
        }
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    async function initApp() {
        console.log('Kairo Studio - High-Fidelity 3D Experience');
        console.log('Three.js loaded:', typeof THREE !== 'undefined');
        console.log('GSAP loaded:', typeof gsap !== 'undefined');

        // Initialize performance monitor
        PerformanceMonitor.init();

        // Initialize 3D scene
        init3DScene();

        // Setup contact form
        setupContactForm();

        // Start loading sequence
        await LoadingSequence.init();

        console.log('✓ Kairo Studio experience ready');
    }

    // ===================================
    // START APPLICATION
    // ===================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (checkMobileAndWebGL()) {
                    initApp();
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (checkMobileAndWebGL()) {
                initApp();
            }
        }, 100);
    }

})();
