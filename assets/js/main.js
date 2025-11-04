// ═══════════════════════════════════════════════════════════
// KAIRO STUDIO OS - AI-Powered Operating System
// Modern robotics and AI aesthetic with full UX
// ═══════════════════════════════════════════════════════════

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    const state = {
        currentScreen: 'landing',
        openWindows: [],
        windowZIndex: 100,
        startMenuOpen: false
    };

    // ═══════════════════════════════════════════════════════════
    // AI PARTICLES GENERATION
    // ══════════════════════════════════════════════════════════

    function createAIParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            const tx = (Math.random() - 0.5) * 500;
            const ty = (Math.random() - 0.5) * 500;
            const delay = Math.random() * 15;

            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.animationDelay = delay + 's';

            container.appendChild(particle);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SCREEN TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    function switchScreen(from, to) {
        const fromScreen = document.getElementById(`${from}-screen`);
        const toScreen = document.getElementById(`${to}-screen`);

        if (fromScreen) {
            fromScreen.classList.remove('active');
        }

        if (toScreen) {
            setTimeout(() => {
                toScreen.classList.add('active');
            }, 100);
        }

        state.currentScreen = to;
    }

    // ═══════════════════════════════════════════════════════════
    // LANDING SCREEN - 3D COMPUTER CLICK
    // ═══════════════════════════════════════════════════════════

    const computer3d = document.getElementById('computer3d');

    if (computer3d) {
        computer3d.addEventListener('click', () => {
            startBootSequence();
        });
    }

    // ═══════════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════════

    function startBootSequence() {
        switchScreen('landing', 'boot');

        const bootProgress = document.getElementById('bootProgress');
        const bootText = document.getElementById('bootText');
        const bootLogs = document.getElementById('bootLogs');

        const bootSteps = [
            { progress: 10, text: 'INITIALIZING AI SYSTEMS...', log: '[OK] Neural network initialized' },
            { progress: 20, text: 'LOADING CORE MODULES...', log: '[OK] Core AI modules loaded' },
            { progress: 30, text: 'MOUNTING SERVICES...', log: '[OK] Brand Strategy service mounted' },
            { progress: 40, text: 'MOUNTING SERVICES...', log: '[OK] Product Marketing service mounted' },
            { progress: 50, text: 'MOUNTING SERVICES...', log: '[OK] Web Development service mounted' },
            { progress: 60, text: 'MOUNTING SERVICES...', log: '[OK] Growth Advisory service mounted' },
            { progress: 70, text: 'LOADING USER INTERFACE...', log: '[OK] UI components initialized' },
            { progress: 80, text: 'STARTING DESKTOP ENVIRONMENT...', log: '[OK] Desktop environment loaded' },
            { progress: 90, text: 'CONFIGURING WORKSPACE...', log: '[OK] Workspace configured' },
            { progress: 100, text: 'BOOT COMPLETE', log: '[OK] Welcome to KAIRO STUDIO OS v3.0' }
        ];

        let currentStep = 0;

        function runBootStep() {
            if (currentStep >= bootSteps.length) {
                setTimeout(() => {
                    switchScreen('boot', 'desktop');
                    initializeDesktop();
                }, 500);
                return;
            }

            const step = bootSteps[currentStep];
            bootProgress.style.width = step.progress + '%';
            bootText.textContent = step.text;

            const logEntry = document.createElement('div');
            logEntry.textContent = step.log;
            logEntry.style.opacity = '0';
            bootLogs.appendChild(logEntry);

            setTimeout(() => {
                logEntry.style.transition = 'opacity 0.3s';
                logEntry.style.opacity = '0.7';
            }, 50);

            bootLogs.scrollTop = bootLogs.scrollHeight;

            currentStep++;
            setTimeout(runBootStep, 300 + Math.random() * 200);
        }

        runBootStep();
    }

    // ═══════════════════════════════════════════════════════════
    // DESKTOP INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    function initializeDesktop() {
        updateClock();
        setInterval(updateClock, 1000);

        const appIcons = document.querySelectorAll('.app-icon');
        appIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const appName = icon.getAttribute('data-app');
                launchApp(appName);
            });
        });

        const startMenuItems = document.querySelectorAll('.start-menu-item');
        startMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                const appName = item.getAttribute('data-app');
                launchApp(appName);
                toggleStartMenu();
            });
        });

        const quickLinks = document.querySelectorAll('.quick-link');
        quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const appName = link.getAttribute('data-app');
                launchApp(appName);
            });
        });

        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', toggleStartMenu);
        }

        const powerBtn = document.getElementById('powerBtn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to exit KAIRO STUDIO OS?')) {
                    switchScreen('desktop', 'landing');
                    resetDesktop();
                }
            });
        }

        document.addEventListener('click', (e) => {
            const startMenu = document.getElementById('startMenu');
            const startBtn = document.getElementById('startBtn');

            if (state.startMenuOpen &&
                !startMenu.contains(e.target) &&
                !startBtn.contains(e.target)) {
                toggleStartMenu();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // CLOCK
    // ═══════════════════════════════════════════════════════════

    function updateClock() {
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}`;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // START MENU
    // ═══════════════════════════════════════════════════════════

    function toggleStartMenu() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            state.startMenuOpen = !state.startMenuOpen;
            startMenu.classList.toggle('active');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // WINDOW MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    function launchApp(appName) {
        const existingWindow = state.openWindows.find(w => w.appName === appName);
        if (existingWindow) {
            focusWindow(existingWindow.element);
            return;
        }

        const appContent = getAppContent(appName);
        const windowElement = createWindow(appName, appContent.title, appContent.content);

        // Show loading animation
        showLoadingAnimation(windowElement, appName);
    }

    function showLoadingAnimation(windowElement, appName) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'window-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">LOADING APPLICATION...</div>
        `;
        windowElement.appendChild(loadingOverlay);
        windowElement.classList.add('loading');

        // Simulate loading time
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.transition = 'opacity 0.3s';
            windowElement.classList.remove('loading');

            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }, 1000 + Math.random() * 500);
    }

    function createWindow(appName, title, content) {
        const windowsContainer = document.getElementById('windowsContainer');

        const windowEl = document.createElement('div');
        windowEl.className = 'os-window animate-fade-in';
        windowEl.setAttribute('data-app', appName);

        const randomX = 80 + Math.random() * 150;
        const randomY = 60 + Math.random() * 80;
        windowEl.style.left = randomX + 'px';
        windowEl.style.top = randomY + 'px';
        windowEl.style.width = '700px';
        windowEl.style.height = '500px';
        windowEl.style.zIndex = ++state.windowZIndex;

        windowEl.innerHTML = `
            <div class="window-titlebar">
                <div class="window-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>${title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-control-btn minimize-btn" title="Minimize">
                        <span style="font-size: 20px; line-height: 1;">−</span>
                    </button>
                    <button class="window-control-btn maximize-btn" title="Maximize">
                        <span style="font-size: 16px; line-height: 1;">□</span>
                    </button>
                    <button class="window-control-btn close-btn" title="Close">
                        <span style="font-size: 20px; line-height: 1;">×</span>
                    </button>
                </div>
            </div>
            <div class="window-content">
                ${content}
            </div>
        `;

        windowsContainer.appendChild(windowEl);

        state.openWindows.push({
            appName: appName,
            element: windowEl
        });

        setupWindowControls(windowEl, appName);
        makeWindowDraggable(windowEl);

        windowEl.addEventListener('mousedown', () => {
            focusWindow(windowEl);
        });

        addToTaskbar(appName, title);

        return windowEl;
    }

    function setupWindowControls(windowEl, appName) {
        const minimizeBtn = windowEl.querySelector('.minimize-btn');
        const maximizeBtn = windowEl.querySelector('.maximize-btn');
        const closeBtn = windowEl.querySelector('.close-btn');

        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.classList.add('minimized');
        });

        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.classList.toggle('maximized');
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeWindow(windowEl, appName);
        });
    }

    function makeWindowDraggable(windowEl) {
        const titlebar = windowEl.querySelector('.window-titlebar');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        titlebar.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target.closest('.window-controls')) return;
            if (windowEl.classList.contains('maximized')) return;

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            isDragging = true;
            focusWindow(windowEl);
        }

        function drag(e) {
            if (!isDragging) return;

            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, windowEl);
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            const rect = el.getBoundingClientRect();
            const newLeft = rect.left + xPos - (rect.left - parseFloat(el.style.left || 0));
            const newTop = rect.top + yPos - (rect.top - parseFloat(el.style.top || 0));

            el.style.left = newLeft + 'px';
            el.style.top = Math.max(0, newTop) + 'px';
        }
    }

    function focusWindow(windowEl) {
        windowEl.style.zIndex = ++state.windowZIndex;
    }

    function closeWindow(windowEl, appName) {
        windowEl.style.opacity = '0';
        windowEl.style.transform = 'scale(0.9)';

        setTimeout(() => {
            windowEl.remove();
            state.openWindows = state.openWindows.filter(w => w.appName !== appName);
            removeFromTaskbar(appName);
        }, 200);
    }

    function resetDesktop() {
        const windowsContainer = document.getElementById('windowsContainer');
        windowsContainer.innerHTML = '';
        state.openWindows = [];
        state.windowZIndex = 100;

        const taskbarApps = document.getElementById('taskbarApps');
        taskbarApps.innerHTML = '';
    }

    // ═══════════════════════════════════════════════════════════
    // TASKBAR
    // ═══════════════════════════════════════════════════════════

    function addToTaskbar(appName, title) {
        const taskbarApps = document.getElementById('taskbarApps');

        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-app-item';
        taskbarItem.setAttribute('data-app', appName);
        taskbarItem.style.cssText = `
            padding: 8px 16px;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.1));
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            color: var(--primary-cyan);
        `;
        taskbarItem.textContent = title;

        taskbarItem.addEventListener('click', () => {
            const window = state.openWindows.find(w => w.appName === appName);
            if (window) {
                if (window.element.classList.contains('minimized')) {
                    window.element.classList.remove('minimized');
                }
                focusWindow(window.element);
            }
        });

        taskbarItem.addEventListener('mouseenter', () => {
            taskbarItem.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(157, 0, 255, 0.2))';
            taskbarItem.style.transform = 'translateY(-2px)';
        });

        taskbarItem.addEventListener('mouseleave', () => {
            taskbarItem.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.1))';
            taskbarItem.style.transform = 'translateY(0)';
        });

        taskbarApps.appendChild(taskbarItem);
    }

    function removeFromTaskbar(appName) {
        const taskbarApps = document.getElementById('taskbarApps');
        const taskbarItem = taskbarApps.querySelector(`[data-app="${appName}"]`);
        if (taskbarItem) {
            taskbarItem.style.opacity = '0';
            taskbarItem.style.transform = 'scale(0.8)';
            setTimeout(() => taskbarItem.remove(), 200);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // APP CONTENT DEFINITIONS
    // ═══════════════════════════════════════════════════════════

    function getAppContent(appName) {
        const contents = {
            'about': {
                title: 'About_Us.app',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">About Kairo Studio</h2>

                    <div style="line-height: 1.8;">
                        <p style="font-size: 18px; margin-bottom: 24px; color: var(--primary-cyan);">Strategy that scales. Systems that deliver.</p>

                        <p style="margin-bottom: 20px;">Kairo Studio is an AI-powered business operating system designed for ambitious companies ready to scale. We combine data-driven strategy with creative excellence to build brands, launch products, and accelerate sustainable growth.</p>

                        <h3 style="font-size: 20px; margin: 30px 0 16px; color: var(--primary-cyan);">Our Mission</h3>
                        <p style="margin-bottom: 20px;">Transform how businesses operate by providing strategic clarity, operational excellence, and measurable results. We don't just offer services—we become your growth partner.</p>

                        <h3 style="font-size: 20px; margin: 30px 0 16px; color: var(--primary-cyan);">What Makes Us Different</h3>
                        <div style="display: grid; gap: 16px; margin-bottom: 24px;">
                            <div style="padding: 16px; background: rgba(0, 240, 255, 0.05); border-left: 3px solid var(--primary-cyan); border-radius: 6px;">
                                <strong>Data-Driven Strategy</strong> — Every decision backed by research and analytics
                            </div>
                            <div style="padding: 16px; background: rgba(157, 0, 255, 0.05); border-left: 3px solid var(--primary-purple); border-radius: 6px;">
                                <strong>Integrated Approach</strong> — From brand to growth, everything works together
                            </div>
                            <div style="padding: 16px; background: rgba(0, 240, 255, 0.05); border-left: 3px solid var(--primary-cyan); border-radius: 6px;">
                                <strong>Proven Results</strong> — 100+ successful projects, 99.9% client satisfaction
                            </div>
                        </div>

                        <h3 style="font-size: 20px; margin: 30px 0 16px; color: var(--primary-cyan);">Our Values</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="padding: 8px 0; border-bottom: 1px solid rgba(0, 240, 255, 0.1);">→ Creative Excellence in Everything</li>
                            <li style="padding: 8px 0; border-bottom: 1px solid rgba(0, 240, 255, 0.1);">→ Transparent Communication Always</li>
                            <li style="padding: 8px 0; border-bottom: 1px solid rgba(0, 240, 255, 0.1);">→ Sustainable Growth Over Quick Wins</li>
                            <li style="padding: 8px 0; border-bottom: 1px solid rgba(0, 240, 255, 0.1);">→ Continuous Innovation & Learning</li>
                            <li style="padding: 8px 0;">→ Partnership-First Mindset</li>
                        </ul>
                    </div>
                `
            },
            'services': {
                title: 'Services.app',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Our Services</h2>

                    <p style="margin-bottom: 30px; font-size: 16px;">Comprehensive solutions to build, scale, and optimize your business.</p>

                    <div style="display: grid; gap: 24px;">
                        <div style="padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 12px;">🎨 Brand Strategy</h3>
                            <p style="margin-bottom: 12px; opacity: 0.9;">Build a cohesive brand identity that resonates with your audience.</p>
                            <div style="font-size: 14px; opacity: 0.8;">
                                • Brand Positioning & Architecture<br>
                                • Visual Identity Design<br>
                                • Messaging Framework<br>
                                • Market Research & Analysis
                            </div>
                        </div>

                        <div style="padding: 24px; background: linear-gradient(135deg, rgba(157, 0, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(157, 0, 255, 0.3); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 12px;">⚡ Product Marketing</h3>
                            <p style="margin-bottom: 12px; opacity: 0.9;">Launch and scale products with strategic go-to-market execution.</p>
                            <div style="font-size: 14px; opacity: 0.8;">
                                • Go-to-Market Strategy<br>
                                • Product Positioning<br>
                                • Launch Campaigns<br>
                                • Performance Analytics
                            </div>
                        </div>

                        <div style="padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 12px;">💻 Web Development</h3>
                            <p style="margin-bottom: 12px; opacity: 0.9;">High-performance websites that convert visitors into customers.</p>
                            <div style="font-size: 14px; opacity: 0.8;">
                                • Custom Website Design<br>
                                • Responsive Development<br>
                                • Performance Optimization<br>
                                • CMS Integration
                            </div>
                        </div>

                        <div style="padding: 24px; background: linear-gradient(135deg, rgba(157, 0, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(157, 0, 255, 0.3); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 12px;">📈 Growth Advisory</h3>
                            <p style="margin-bottom: 12px; opacity: 0.9;">Strategic guidance to accelerate revenue and operational excellence.</p>
                            <div style="font-size: 14px; opacity: 0.8;">
                                • Growth Strategy & Roadmap<br>
                                • Customer Acquisition<br>
                                • Revenue Operations<br>
                                • Market Expansion
                            </div>
                        </div>

                        <div style="padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 12px;">🔧 SaaS Integration</h3>
                            <p style="margin-bottom: 12px; opacity: 0.9;">Optimize your tech stack for maximum efficiency and ROI.</p>
                            <div style="font-size: 14px; opacity: 0.8;">
                                • Stack Audit & Optimization<br>
                                • Tool Implementation<br>
                                • Integration & Automation<br>
                                • Team Training
                            </div>
                        </div>
                    </div>
                `
            },
            'projects': {
                title: 'Portfolio.app',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Our Portfolio</h2>

                    <p style="margin-bottom: 30px; font-size: 16px;">Success stories from 100+ projects across industries.</p>

                    <div style="display: grid; gap: 24px;">
                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                <div>
                                    <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 8px;">SaaS Platform Launch</h3>
                                    <div style="font-size: 14px; opacity: 0.7;">B2B Technology Startup</div>
                                </div>
                                <div style="padding: 4px 12px; background: rgba(0, 240, 255, 0.2); border-radius: 20px; font-size: 12px;">Completed</div>
                            </div>
                            <p style="margin-bottom: 16px; opacity: 0.9;">Complete go-to-market strategy for enterprise SaaS platform. From brand positioning to product launch.</p>
                            <div style="display: flex; gap: 16px; font-size: 14px;">
                                <div><strong style="color: var(--primary-cyan);">300%</strong> Lead Growth</div>
                                <div><strong style="color: var(--primary-cyan);">$2M</strong> ARR in Year 1</div>
                                <div><strong style="color: var(--primary-cyan);">50+</strong> Enterprise Clients</div>
                            </div>
                        </div>

                        <div style="padding: 24px; background: rgba(157, 0, 255, 0.05); border: 1px solid rgba(157, 0, 255, 0.2); border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                <div>
                                    <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 8px;">Brand Transformation</h3>
                                    <div style="font-size: 14px; opacity: 0.7;">Healthcare Technology</div>
                                </div>
                                <div style="padding: 4px 12px; background: rgba(157, 0, 255, 0.2); border-radius: 20px; font-size: 12px;">Completed</div>
                            </div>
                            <p style="margin-bottom: 16px; opacity: 0.9;">Complete rebrand for healthcare platform, including visual identity, messaging, and digital presence.</p>
                            <div style="display: flex; gap: 16px; font-size: 14px;">
                                <div><strong style="color: var(--primary-purple);">250%</strong> Brand Awareness</div>
                                <div><strong style="color: var(--primary-purple);">180%</strong> Engagement Rate</div>
                                <div><strong style="color: var(--primary-purple);">95%</strong> Client Satisfaction</div>
                            </div>
                        </div>

                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                <div>
                                    <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 8px;">E-Commerce Scale-Up</h3>
                                    <div style="font-size: 14px; opacity: 0.7;">Consumer Goods</div>
                                </div>
                                <div style="padding: 4px 12px; background: rgba(0, 240, 255, 0.2); border-radius: 20px; font-size: 12px;">Completed</div>
                            </div>
                            <p style="margin-bottom: 16px; opacity: 0.9;">Growth strategy and marketing execution for direct-to-consumer brand expansion.</p>
                            <div style="display: flex; gap: 16px; font-size: 14px;">
                                <div><strong style="color: var(--primary-cyan);">400%</strong> Revenue Growth</div>
                                <div><strong style="color: var(--primary-cyan);">10x</strong> ROAS</div>
                                <div><strong style="color: var(--primary-cyan);">200K+</strong> New Customers</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 32px; padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.1)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px; text-align: center;">
                        <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 12px;">Ready to Create Your Success Story?</h3>
                        <p style="margin-bottom: 16px; opacity: 0.9;">Let's discuss how we can help you achieve similar results.</p>
                    </div>
                `
            },
            'demo': {
                title: 'Demo.app',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Our Process</h2>

                    <p style="margin-bottom: 30px; font-size: 16px;">How we transform your business in 4 strategic phases.</p>

                    <div style="display: grid; gap: 20px;">
                        <div style="display: flex; gap: 20px; padding: 20px; background: rgba(0, 240, 255, 0.05); border-left: 4px solid var(--primary-cyan); border-radius: 8px;">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-cyan); min-width: 60px;">01</div>
                            <div>
                                <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 8px;">Discovery & Research</h3>
                                <p style="margin-bottom: 12px; opacity: 0.9;">We dive deep into your business, market, and competitors to understand opportunities and challenges.</p>
                                <div style="font-size: 14px; opacity: 0.7;">
                                    Duration: 1-2 weeks<br>
                                    Deliverables: Market analysis, competitive audit, strategic recommendations
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 20px; padding: 20px; background: rgba(157, 0, 255, 0.05); border-left: 4px solid var(--primary-purple); border-radius: 8px;">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-purple); min-width: 60px;">02</div>
                            <div>
                                <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 8px;">Strategy Development</h3>
                                <p style="margin-bottom: 12px; opacity: 0.9;">Creating your roadmap with clear objectives, tactics, and measurable KPIs.</p>
                                <div style="font-size: 14px; opacity: 0.7;">
                                    Duration: 2-3 weeks<br>
                                    Deliverables: Strategic plan, creative brief, implementation timeline
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 20px; padding: 20px; background: rgba(0, 240, 255, 0.05); border-left: 4px solid var(--primary-cyan); border-radius: 8px;">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-cyan); min-width: 60px;">03</div>
                            <div>
                                <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 8px;">Execution & Launch</h3>
                                <p style="margin-bottom: 12px; opacity: 0.9;">Bringing the strategy to life with flawless execution across all channels.</p>
                                <div style="font-size: 14px; opacity: 0.7;">
                                    Duration: 4-8 weeks<br>
                                    Deliverables: Brand assets, campaigns, website, marketing materials
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 20px; padding: 20px; background: rgba(157, 0, 255, 0.05); border-left: 4px solid var(--primary-purple); border-radius: 8px;">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-purple); min-width: 60px;">04</div>
                            <div>
                                <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 8px;">Optimize & Scale</h3>
                                <p style="margin-bottom: 12px; opacity: 0.9;">Continuous improvement based on data, feedback, and market response.</p>
                                <div style="font-size: 14px; opacity: 0.7;">
                                    Duration: Ongoing<br>
                                    Deliverables: Performance reports, optimization recommendations, scaling strategy
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 32px; padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.1)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
                        <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 12px;">Why Our Process Works</h3>
                        <div style="display: grid; gap: 12px; font-size: 14px;">
                            <div>✓ Data-driven decision making at every stage</div>
                            <div>✓ Transparent communication and regular check-ins</div>
                            <div>✓ Flexible approach that adapts to your needs</div>
                            <div>✓ Focus on measurable results and ROI</div>
                        </div>
                    </div>
                `
            },
            'contact': {
                title: 'Contact.app',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Get In Touch</h2>

                    <p style="margin-bottom: 30px; font-size: 16px;">Ready to transform your business? Let's start a conversation.</p>

                    <div style="display: grid; gap: 24px; margin-bottom: 32px;">
                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 18px; color: var(--primary-cyan); margin-bottom: 12px;">📧 Email</h3>
                            <a href="mailto:hello@kairostudio.com" style="color: var(--primary-cyan); text-decoration: none; font-size: 16px; display: block; margin-bottom: 8px;">hello@kairostudio.com</a>
                            <div style="font-size: 14px; opacity: 0.7;">Response time: Within 24 business hours</div>
                        </div>

                        <div style="padding: 24px; background: rgba(157, 0, 255, 0.05); border: 1px solid rgba(157, 0, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 18px; color: var(--primary-purple); margin-bottom: 12px;">📅 Schedule a Call</h3>
                            <p style="margin-bottom: 12px;">Book a free 30-minute strategy session to discuss your goals.</p>
                            <div style="font-size: 14px; opacity: 0.7;">Available: Monday - Friday, 9:00 AM - 6:00 PM EST</div>
                        </div>

                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 18px; color: var(--primary-cyan); margin-bottom: 12px;">💬 Quick Chat</h3>
                            <p style="margin-bottom: 12px;">Need a quick answer? Reach out via our instant messaging.</p>
                            <div style="font-size: 14px; opacity: 0.7;">Average response: 2-4 hours during business hours</div>
                        </div>
                    </div>

                    <div style="padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.1)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
                        <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 16px;">What to Expect</h3>
                        <div style="display: grid; gap: 12px; font-size: 14px;">
                            <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                <strong>Step 1:</strong> Reach out via email or schedule a call
                            </div>
                            <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                <strong>Step 2:</strong> 30-minute discovery call to understand your needs
                            </div>
                            <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                <strong>Step 3:</strong> Custom proposal with timeline and pricing
                            </div>
                            <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                <strong>Step 4:</strong> Kickoff and start transforming your business
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 24px; padding: 20px; background: rgba(0, 240, 255, 0.05); border-radius: 8px; text-align: center;">
                        <p style="margin: 0; opacity: 0.8;">🎯 <strong>Quick Response Guarantee:</strong> All inquiries receive a personalized response within 24 business hours</p>
                    </div>
                `
            },
            'requirements': {
                title: 'Process.app',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Getting Started</h2>

                    <p style="margin-bottom: 30px; font-size: 16px;">What we need to know before we begin your project.</p>

                    <div style="display: grid; gap: 24px;">
                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 16px;">📋 Initial Requirements</h3>
                            <div style="display: grid; gap: 12px; font-size: 14px;">
                                <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    <strong>Business Overview:</strong> Company size, industry, target market
                                </div>
                                <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    <strong>Project Goals:</strong> What you want to achieve and why
                                </div>
                                <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    <strong>Timeline:</strong> When you need results and key milestones
                                </div>
                                <div style="padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    <strong>Budget Range:</strong> Investment level you're comfortable with
                                </div>
                            </div>
                        </div>

                        <div style="padding: 24px; background: rgba(157, 0, 255, 0.05); border: 1px solid rgba(157, 0, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 16px;">🎯 Project-Specific Info</h3>

                            <h4 style="font-size: 16px; color: var(--primary-cyan); margin: 16px 0 8px;">For Branding Projects:</h4>
                            <ul style="list-style: none; padding: 0; font-size: 14px; opacity: 0.9;">
                                <li style="padding: 6px 0;">→ Current brand assets (if any)</li>
                                <li style="padding: 6px 0;">→ Competitor analysis done</li>
                                <li style="padding: 6px 0;">→ Target audience profiles</li>
                                <li style="padding: 6px 0;">→ Brand personality preferences</li>
                            </ul>

                            <h4 style="font-size: 16px; color: var(--primary-cyan); margin: 16px 0 8px;">For Web Development:</h4>
                            <ul style="list-style: none; padding: 0; font-size: 14px; opacity: 0.9;">
                                <li style="padding: 6px 0;">→ Website goals and features needed</li>
                                <li style="padding: 6px 0;">→ Content and copy readiness</li>
                                <li style="padding: 6px 0;">→ Hosting and domain info</li>
                                <li style="padding: 6px 0;">→ Integration requirements</li>
                            </ul>

                            <h4 style="font-size: 16px; color: var(--primary-cyan); margin: 16px 0 8px;">For Growth Strategy:</h4>
                            <ul style="list-style: none; padding: 0; font-size: 14px; opacity: 0.9;">
                                <li style="padding: 6px 0;">→ Current metrics and KPIs</li>
                                <li style="padding: 6px 0;">→ Past marketing efforts</li>
                                <li style="padding: 6px 0;">→ Sales process overview</li>
                                <li style="padding: 6px 0;">→ Growth blockers identified</li>
                            </ul>
                        </div>

                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 16px;">⚡ Quick Start Checklist</h3>
                            <div style="display: grid; gap: 8px; font-size: 14px;">
                                <div style="padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    ☐ Complete initial consultation call
                                </div>
                                <div style="padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    ☐ Review and sign proposal
                                </div>
                                <div style="padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    ☐ Provide access to necessary platforms
                                </div>
                                <div style="padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    ☐ Schedule kickoff meeting
                                </div>
                                <div style="padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;">
                                    ☐ Share brand assets and resources
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 32px; padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.1)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px; text-align: center;">
                        <h3 style="font-size: 18px; color: var(--primary-cyan); margin-bottom: 12px;">Not Sure Where to Start?</h3>
                        <p style="margin: 0; opacity: 0.9;">No problem! Schedule a discovery call and we'll help you figure out exactly what you need.</p>
                    </div>
                `
            },
            'brand-strategy': {
                title: 'Branding.tool',
                content: `
                    <h2 style="font-size: 28px; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Brand Strategy Deep Dive</h2>

                    <p style="margin-bottom: 30px; font-size: 16px;">Transform your brand into a market leader with data-driven strategy.</p>

                    <div style="display: grid; gap: 24px;">
                        <div style="padding: 24px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 0, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 16px;">What's Included</h3>
                            <div style="display: grid; gap: 12px;">
                                <div style="padding: 16px; background: rgba(0, 0, 0, 0.2); border-left: 3px solid var(--primary-cyan); border-radius: 6px;">
                                    <strong>Brand Positioning</strong><br>
                                    <span style="font-size: 14px; opacity: 0.8;">Define your unique place in the market and competitive advantage</span>
                                </div>
                                <div style="padding: 16px; background: rgba(0, 0, 0, 0.2); border-left: 3px solid var(--primary-purple); border-radius: 6px;">
                                    <strong>Visual Identity System</strong><br>
                                    <span style="font-size: 14px; opacity: 0.8;">Logo, color palette, typography, and design system</span>
                                </div>
                                <div style="padding: 16px; background: rgba(0, 0, 0, 0.2); border-left: 3px solid var(--primary-cyan); border-radius: 6px;">
                                    <strong>Messaging Framework</strong><br>
                                    <span style="font-size: 14px; opacity: 0.8;">Voice, tone, key messages, and storytelling approach</span>
                                </div>
                                <div style="padding: 16px; background: rgba(0, 0, 0, 0.2); border-left: 3px solid var(--primary-purple); border-radius: 6px;">
                                    <strong>Brand Guidelines</strong><br>
                                    <span style="font-size: 14px; opacity: 0.8;">Comprehensive documentation for consistent implementation</span>
                                </div>
                            </div>
                        </div>

                        <div style="padding: 24px; background: rgba(157, 0, 255, 0.05); border: 1px solid rgba(157, 0, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-purple); margin-bottom: 16px;">Expected Outcomes</h3>
                            <div style="font-size: 14px;">
                                ✓ Clear brand differentiation in your market<br><br>
                                ✓ Cohesive visual identity across all touchpoints<br><br>
                                ✓ Messaging that resonates with target audience<br><br>
                                ✓ Foundation for all future marketing efforts<br><br>
                                ✓ Increased brand recognition and recall
                            </div>
                        </div>

                        <div style="padding: 24px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px;">
                            <h3 style="font-size: 20px; color: var(--primary-cyan); margin-bottom: 16px;">Timeline & Investment</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
                                <div>
                                    <strong style="color: var(--primary-cyan);">Duration:</strong><br>
                                    6-8 weeks for complete brand development
                                </div>
                                <div>
                                    <strong style="color: var(--primary-cyan);">Investment:</strong><br>
                                    Starting at $15,000
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            'terminal': {
                title: 'Terminal.cmd',
                content: `
                    <div style="font-family: 'Space Mono', monospace; font-size: 14px;">
                        <div id="terminalOutput" style="margin-bottom: 16px;">
                            <div>KAIRO STUDIO OS [Version 3.0]</div>
                            <div>Copyright (c) Kairo Studio. All rights reserved.</div>
                            <div style="margin-top: 12px;">Type 'help' for available commands.</div>
                            <div style="margin-top: 12px;"></div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--primary-cyan);">kairo@studio:~$</span>
                            <input type="text" id="terminalInput" style="flex: 1; background: transparent; border: none; color: var(--text-primary); font-family: 'Space Mono', monospace; font-size: 14px; outline: none;" placeholder="Enter command..." />
                        </div>
                    </div>
                `
            }
        };

        return contents[appName] || {
            title: 'Application',
            content: '<p>Application content not found.</p>'
        };
    }

    // ═══════════════════════════════════════════════════════════
    // TERMINAL FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) {
                setupTerminal(terminalInput);
            }
        }, 1000);
    });

    function setupTerminal(inputElement) {
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = inputElement.value.trim();
                const output = document.getElementById('terminalOutput');

                const commandLine = document.createElement('div');
                commandLine.innerHTML = `<span style="color: var(--primary-cyan);">kairo@studio:~$</span> ${command}`;
                output.appendChild(commandLine);

                const response = processTerminalCommand(command);
                const responseLine = document.createElement('div');
                responseLine.style.marginTop = '8px';
                responseLine.style.marginBottom = '12px';
                responseLine.innerHTML = response;
                output.appendChild(responseLine);

                inputElement.value = '';
                output.parentElement.scrollTop = output.parentElement.scrollHeight;
            }
        });
    }

    function processTerminalCommand(command) {
        const cmd = command.toLowerCase();

        const commands = {
            'help': `
                <div>Available commands:</div>
                <div style="margin-top: 8px;">
                    <div>  help        - Show this help message</div>
                    <div>  services    - List all services</div>
                    <div>  about       - About Kairo Studio</div>
                    <div>  contact     - Contact information</div>
                    <div>  projects    - View portfolio</div>
                    <div>  clear       - Clear terminal screen</div>
                    <div>  version     - Show system version</div>
                </div>
            `,
            'services': `
                <div>Available Services:</div>
                <div style="margin-top: 8px;">
                    <div>  [1] Brand Strategy</div>
                    <div>  [2] Product Marketing</div>
                    <div>  [3] Web Development</div>
                    <div>  [4] Growth Advisory</div>
                    <div>  [5] SaaS Integration</div>
                </div>
            `,
            'about': `
                <div>KAIRO STUDIO OS v3.0</div>
                <div>Strategy that scales. Systems that deliver.</div>
                <div style="margin-top: 8px;">AI-powered business operating system for ambitious companies.</div>
            `,
            'contact': `
                <div>Contact Information:</div>
                <div style="margin-top: 8px;">
                    <div>  Email: hello@kairostudio.com</div>
                    <div>  Response Time: Within 24 hours</div>
                    <div>  Office Hours: Mon-Fri, 9AM-6PM EST</div>
                </div>
            `,
            'projects': `
                <div>Featured Projects:</div>
                <div style="margin-top: 8px;">
                    <div>  → SaaS Platform Launch (300% Lead Growth)</div>
                    <div>  → Brand Transformation (250% Brand Awareness)</div>
                    <div>  → E-Commerce Scale-Up (400% Revenue Growth)</div>
                </div>
            `,
            'clear': 'CLEAR_SCREEN',
            'version': 'KAIRO STUDIO OS Version 3.0 | Build 2025.01',
            'ls': 'About_Us.app  Services.app  Portfolio.app  Demo.app  Contact.app  Process.app',
            'pwd': '/home/kairo/studio',
            'whoami': 'kairo_user'
        };

        if (cmd === 'clear') {
            const output = document.getElementById('terminalOutput');
            output.innerHTML = '';
            return '';
        }

        return commands[cmd] || `<div style="color: var(--primary-pink);">Command not found: ${command}</div><div>Type 'help' for available commands.</div>`;
    }

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    // Generate AI particles
    createAIParticles();

    console.log('%c🤖 KAIRO STUDIO OS v3.0', 'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #00f0ff, #9d00ff); -webkit-background-clip: text; color: transparent;');
    console.log('%cAI-Powered Business Operating System', 'color: #00f0ff;');
    console.log('%cClick the computer to enter the system', 'color: #00f0ff;');

})();
