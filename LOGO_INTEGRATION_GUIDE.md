# Kairo Studio Logo Integration Guide 🧭

**Status:** ⚠️ Awaiting Logo Upload
**Your Logo:** `C:\Users\praty\Downloads\Kairo studio logo.jpg` (on your local machine)

---

## 🚨 IMPORTANT: Cannot Access Your Local Files

I **cannot access files** from your Windows computer at:
```
C:\Users\praty\Downloads\Kairo studio logo.jpg
```

### You Need To Upload The Logo First

**Method 1: Using SCP (Secure Copy)**
```bash
# From your local Windows machine (PowerShell or Command Prompt):
scp "C:\Users\praty\Downloads\Kairo studio logo.jpg" ubuntu@152.67.2.20:/home/ubuntu/kairo_studio/assets/images/kairo-logo.jpg

# If using SSH key:
scp -i /path/to/key.pem "C:\Users\praty\Downloads\Kairo studio logo.jpg" ubuntu@152.67.2.20:/home/ubuntu/kairo_studio/assets/images/kairo-logo.jpg
```

**Method 2: Using WinSCP (GUI Tool)**
1. Download WinSCP: https://winscp.net/
2. Connect to: `152.67.2.20`
3. Navigate to: `/home/ubuntu/kairo_studio/assets/images/`
4. Drag and drop: `Kairo studio logo.jpg`
5. Rename to: `kairo-logo.jpg`

**Method 3: Using SSH + Copy/Paste**
```bash
# SSH into server
ssh ubuntu@152.67.2.20

# Create base64 version of logo on your local machine first:
# (In PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\praty\Downloads\Kairo studio logo.jpg"))

# Then paste the base64 string and decode on server:
echo "PASTE_BASE64_HERE" | base64 -d > /home/ubuntu/kairo_studio/assets/images/kairo-logo.jpg
```

---

## 🎯 8-Point Logo Integration Plan

Once your logo is uploaded, I will implement all 8 features from your plan:

### 1. ✨ Central Orb Core Version
**Implementation:**
- Load logo texture from `/assets/images/kairo-logo.jpg`
- Create plane geometry with logo texture
- Add transparent background support (alpha channel)
- Position at scene center (0, 0.5, 0)
- Add double-sided rendering for visibility from all angles

**Code Structure:**
```javascript
function createLogoCore() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/images/kairo-logo.jpg', (texture) => {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        const logoMesh = new THREE.Mesh(geometry, material);
        state.scene.add(logoMesh);
        state.logoCore = logoMesh;
    });
}
```

---

### 2. 🌈 Lighting Sync
**Implementation:**
- Cycle logo glow through wall colors during navigation
- Color sequence: Orange → Cyan → Blue → Violet → Pink → Green
- Smooth transition using GSAP (1-second ease)
- Sync with `navigateToSection()` function

**Color Map:**
```javascript
const wallColorMap = {
    'entry': 0xB388FF,    // Violet
    'about': 0x2979FF,    // Blue
    'work': 0x00E5FF,     // Cyan
    'services': 0xFFA726, // Orange
    'demos': 0x00E676,    // Green
    'contact': 0xF06292   // Pink
};

// On navigation:
gsap.to(logoMaterial, {
    emissive: wallColorMap[section],
    emissiveIntensity: 0.8,
    duration: 1,
    ease: 'power2.inOut'
});
```

---

### 3. 🎬 Entry Animation
**Implementation:**
- Logo materializes from particle dust (500 particles)
- Particles converge to form logo shape
- Square speech shape locks in first (0.5s)
- Text extrudes with light burst (1s)
- Camera pulls back to reveal full scene (1.5s)

**Timeline:**
```javascript
const entryTimeline = gsap.timeline();
entryTimeline
    .call(() => createParticleBurst(logo.position, 0xffffff)) // Particle dust
    .to(logoMaterial, { opacity: 0 → 1, duration: 0.5 }, 0)    // Fade in
    .to(logoMesh.scale, { x: 0.8 → 1, y: 0.8 → 1, duration: 0.5, ease: 'back.out' }, 0.5) // Scale up
    .call(() => playSound('lightBurst'), null, 1)             // Sound effect
    .to(camera.position, { z: 8, duration: 1.5, ease: 'power2.out' }, 1.5); // Camera pullback
```

---

### 4. 📱 Responsive Behavior
**Implementation:**
- Desktop: Full 3D logo with effects
- Mobile (< 768px): Fade to 2D SVG overlay
- Performance threshold: If FPS < 30, switch to 2D

**Code:**
```javascript
function updateLogoMode() {
    if (state.isMobile || state.performance.fps < 30) {
        // Hide 3D logo
        if (state.logoCore) state.logoCore.visible = false;

        // Show 2D overlay
        document.getElementById('logo-2d-overlay').style.display = 'block';
    } else {
        // Show 3D logo
        if (state.logoCore) state.logoCore.visible = true;

        // Hide 2D overlay
        document.getElementById('logo-2d-overlay').style.display = 'none';
    }
}
```

---

### 5. 🎯 Hover Interaction
**Implementation:**
- Detect mouse proximity to logo (raycaster)
- Camera zoom-in on hover (FOV: 45° → 40°)
- Logo rotates 10° on Y-axis
- Emit pulse wave across grid
- Play ambient "ping" sound (800Hz, 0.15s)

**Code:**
```javascript
function onLogoHover() {
    // Camera zoom
    gsap.to(state.camera, { fov: 40, duration: 0.5, ease: 'power2.out' });
    state.camera.updateProjectionMatrix();

    // Logo rotation
    gsap.to(state.logoCore.rotation, { y: '+=0.174', duration: 0.5, ease: 'power2.out' }); // 10° in radians

    // Grid pulse
    createGridPulse(state.logoCore.position);

    // Sound
    playHoverSound(); // 800Hz ping
}
```

---

### 6. 🎵 Sound Synchronization
**Implementation:**
- Use Web Audio API AnalyserNode
- Extract low-frequency data (40-100 Hz)
- Scale logo geometry on beat (1.0 → 1.05)
- Sync emissive intensity with amplitude

**Code:**
```javascript
function syncLogoWithAudio() {
    if (!state.audioContext || !state.backgroundMusic) return;

    const analyser = state.audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Connect to audio source
    state.backgroundMusic.connect(analyser);

    // Animation loop
    function updateLogoScale() {
        analyser.getByteFrequencyData(dataArray);

        // Get bass frequencies (0-10 bins = 40-100Hz)
        const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10 / 255;

        // Scale logo
        const scale = 1.0 + (bass * 0.05); // 1.0 → 1.05
        state.logoCore.scale.set(scale, scale, scale);

        requestAnimationFrame(updateLogoScale);
    }
    updateLogoScale();
}
```

---

### 7. 😴 Idle Mode Animation
**Implementation:**
- If user idle > 10 seconds (currently 15s, will update)
- Logo starts slow continuous rotation (0.001 rad/frame)
- 100 particles orbit around logo like satellites
- Grid below emits soft ripples (sine wave)

**Code:**
```javascript
function updateIdleLogoAnimation() {
    if (!state.isIdleMode || !state.logoCore) return;

    // Slow rotation
    state.logoCore.rotation.y += 0.001;

    // Orbital particles
    if (!state.logoOrbitParticles) {
        state.logoOrbitParticles = createOrbitParticles(100, 1.5); // 100 particles, 1.5 radius
    }

    // Update particle orbits
    state.logoOrbitParticles.forEach((particle, i) => {
        const angle = (Date.now() * 0.0005) + (i / 100) * Math.PI * 2;
        particle.position.x = Math.cos(angle) * 1.5;
        particle.position.z = Math.sin(angle) * 1.5;
        particle.position.y = 0.5 + Math.sin(angle * 3) * 0.1;
    });

    // Grid ripples
    createGridRipple();
}
```

---

### 8. 🎨 Consistency With UI
**Implementation:**
- Extract font family from logo image metadata
- Apply to all UI text (menu items: Entry, Work, etc.)
- Match kerning and weight
- Use `font-family: 'Space Grotesk', sans-serif` (current geometric sans)

**CSS Updates:**
```css
/* Logo font consistency */
.logo-text, .nav-btn, .panel-title {
    font-family: 'Space Grotesk', 'Arial', sans-serif;
    font-weight: 700; /* Bold */
    letter-spacing: 0.05em; /* Kerning */
}
```

---

## 📋 Implementation Checklist

Once logo is uploaded to `/assets/images/kairo-logo.jpg`:

- [ ] **1. Central Orb Core:** Logo texture loaded and rendered
- [ ] **2. Lighting Sync:** Color cycling with wall navigation
- [ ] **3. Entry Animation:** Particle materialization on load
- [ ] **4. Responsive:** 2D fallback for mobile/low-FPS
- [ ] **5. Hover Interaction:** Zoom, rotation, pulse, sound
- [ ] **6. Sound Sync:** Audio analyser scaling
- [ ] **7. Idle Mode:** Rotation, orbital particles, ripples
- [ ] **8. UI Consistency:** Font matching across site

---

## 🚀 Next Steps

### Step 1: Upload Your Logo
Choose one of the 3 methods above to upload:
```
Kairo studio logo.jpg → /assets/images/kairo-logo.jpg
```

### Step 2: Tell Me It's Ready
Once uploaded, say: **"Logo uploaded, proceed with integration"**

### Step 3: I Will Implement
I'll implement all 8 features from the plan (estimated 30-45 minutes)

---

## 📊 Expected Results

### Visual Impact:
- Logo becomes the **centerpiece** of the 3D universe
- Dynamic glow synced with navigation
- Cinematic entry animation
- Interactive hover effects
- Audio-reactive pulsing
- Cohesive brand experience

### Performance:
- Desktop: 60 FPS (logo adds ~1-2ms)
- Mobile: Fallback to 2D (no impact)
- Texture loading: Async (non-blocking)

### User Experience:
- **Professional:** Logo integration elevates brand
- **Interactive:** Logo responds to user actions
- **Cohesive:** Unified design language
- **Memorable:** Unique 3D logo experience

---

## ⚠️ Important Notes

1. **Logo Format:** JPG is supported, but PNG with transparency is better
2. **Resolution:** Recommend 512x512 or 1024x1024 for clarity
3. **File Size:** Keep under 500KB for fast loading
4. **Aspect Ratio:** Square works best for 3D placement

If your logo has transparency (alpha channel), please upload as PNG:
```
kairo-logo.png (with transparent background)
```

---

**Ready when you are!** Upload the logo and I'll implement the complete integration. 🚀
