# Brand Guide - KAIRO STUDIO

Complete brand identity, visual design, and copywriting guidelines.

---

## Brand Identity

### Positioning

**What we do**: Build automation systems, marketing stacks, and AI-powered SaaS products that scale revenue.

**Who we serve**: Growth-focused companies (B2B SaaS, e-commerce, agencies) looking to automate operations and scale efficiently.

**How we're different**: We combine technical execution with business strategy. Every automation is tied to metrics. Every design decision drives conversion.

---

## Visual Identity

### Color Palette

#### Primary Colors

**Deep Space Purple** `#0f0724`
- Usage: Backgrounds, dark sections, hero areas
- Represents: Mystery, depth, innovation

**Electric Cyan** `#00E5FF`
- Usage: Primary CTAs, highlights, accents, glows
- Represents: Energy, technology, forward motion

**Neon Coral** `#FF6B6B`
- Usage: Secondary CTAs, warnings, highlights
- Represents: Action, urgency, human touch

#### Neutrals

**Off-White** `#F7F7F9`
- Usage: Body text on dark backgrounds, light sections

**Mid-Gray** `#9AA0B2`
- Usage: Secondary text, borders, disabled states

**Dark Gray** `#272B33`
- Usage: Text on light backgrounds, cards

#### Gradients

**Hero Gradient**
```css
background: linear-gradient(120deg, #0f0724 0%, #1a1233 50%, #00121f 100%);
```

**Card Glow**
```css
background: linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(255,107,107,0.1) 100%);
```

**Text Gradient (for headlines)**
```css
background: linear-gradient(90deg, #00E5FF 0%, #FF6B6B 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

### Typography

#### Font Families

**Primary: Inter (Variable)**
- Usage: Body text, UI, most content
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Why: Clean, modern, excellent readability, variable font for performance

**Display: Space Grotesk**
- Usage: Large headlines, hero text, section titles
- Weights: 500, 700
- Why: Distinctive, techy feel, pairs well with Inter

**Monospace: JetBrains Mono**
- Usage: Code snippets, technical details, numbers
- Weight: 400, 500
- Why: Clear distinction for technical content

#### Type Scale

```
Display: 64px / 4rem (line-height: 1.1)
H1: 48px / 3rem (line-height: 1.2)
H2: 36px / 2.25rem (line-height: 1.3)
H3: 28px / 1.75rem (line-height: 1.4)
H4: 24px / 1.5rem (line-height: 1.4)
Body Large: 18px / 1.125rem (line-height: 1.6)
Body: 16px / 1rem (line-height: 1.6)
Body Small: 14px / 0.875rem (line-height: 1.5)
Caption: 12px / 0.75rem (line-height: 1.4)
```

#### Typography Usage

```css
.heading-display {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.heading-1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
}

.body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}
```

---

### Spacing Scale

Use consistent 8px-based spacing:

```
4px   (0.25rem)  - Micro spacing
8px   (0.5rem)   - Tight spacing
12px  (0.75rem)  - Small spacing
16px  (1rem)     - Default spacing
24px  (1.5rem)   - Medium spacing
32px  (2rem)     - Large spacing
48px  (3rem)     - XL spacing
64px  (4rem)     - XXL spacing
96px  (6rem)     - Section spacing
128px (8rem)     - Hero spacing
```

---

### Border Radius

```
sm: 6px   - Buttons, small cards
md: 12px  - Cards, panels
lg: 20px  - Large cards, modals
xl: 32px  - Hero sections
```

---

### Elevation (Shadows)

**Subtle** (for cards on dark backgrounds)
```css
box-shadow: 0 4px 20px rgba(0, 229, 255, 0.1);
```

**Medium** (for floating panels)
```css
box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 229, 255, 0.15);
```

**Strong** (for modals)
```css
box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(0, 229, 255, 0.2);
```

---

## 3D Visual Style

### Aesthetic Guidelines

- **Low-poly, stylized**: Not photorealistic
- **Matte materials**: Minimal reflections
- **Strategic glow**: Emissive materials for key elements
- **Dark space theme**: Deep backgrounds, bright accents
- **Clean geometry**: Simple shapes, clear silhouettes

### Lighting

- Minimal real-time lights (performance)
- Baked ambient occlusion
- Emissive materials for glow effects
- HDRI skybox for subtle environment lighting

### Animation Principles

- **Smooth easing**: Use `ease-out` for most animations
- **Quick interactions**: 200-400ms for hover states
- **Cinematic transitions**: 1-2s for camera movements
- **Subtle motion**: Idle animations at 0.5x speed

---

## Copywriting Guidelines

### Voice & Tone

**Voice attributes**:
- Confident (not arrogant)
- Direct (not blunt)
- Technical (not jargony)
- Human (not corporate)

**Tone variations**:
- Hero/Marketing: Inspiring, bold
- Product descriptions: Clear, benefit-focused
- Documentation: Precise, helpful
- Error messages: Supportive, actionable

### Copy Principles

1. **Lead with value**: Start with what the user gets
2. **Be specific**: "42% cost reduction" not "significant savings"
3. **Active voice**: "We build" not "Solutions are built"
4. **Short sentences**: One idea per sentence
5. **Scannable**: Use bullets, short paragraphs, headers

---

## Copy Templates

### Hero Section

**Formula**: [Action verb] + [what] + [outcome]

Examples:
- "Automate repetitive work, ship faster"
- "Build AI products that generate revenue"
- "Scale marketing without scaling headcount"

### Service Descriptions

**Formula**: [Problem] → [Approach] → [Result]

Example:
```
Automation Solutions

Manual workflows slow you down and introduce errors.

We design automated systems that handle repetitive tasks
reliably, freeing your team for high-value work.

Result: 40-60% time savings on operational tasks.
```

### Case Study Headlines

**Formula**: "How we [specific metric] for [client]"

Examples:
- "How we cut lead cost by 42% for Acme Corp"
- "How we automated 120 hours of monthly work for TechCo"
- "How we built an AI feature that increased ARR by $200K"

### CTAs (Call-to-Actions)

**Primary CTAs** (high intent):
- "Start the Orbit" (hero)
- "Get Started"
- "Schedule a Call"
- "See How We Work"

**Secondary CTAs** (exploratory):
- "View Case Studies"
- "Explore Services"
- "Read More"
- "Learn How"

---

## Microcopy

### Form Labels

```
Name → "Your name"
Email → "Email address"
Message → "Describe your challenge in one line"
Submit → "Start the Orbit" or "Send Message"
```

### Success Messages

```
Form submission → "Thanks. We'll reply within 2 business days with a suggested next step."
Signup → "Welcome! Check your email to verify your account."
Save → "Saved successfully"
```

### Error Messages

```
Required field → "This field is required"
Invalid email → "Please enter a valid email address"
Server error → "Something went wrong. Please try again."
404 → "This page doesn't exist. Return to home or contact us."
```

---

## Content Library

### Taglines by Service

**Automation**
"Automate repetitive work, ship faster. Build reliable workflows that reduce manual hours and increase throughput."

**Marketing**
"Data-driven campaigns that convert. From creative to paid, we run growth like engineering."

**SaaS & AI**
"Ship AI-enabled features and SaaS products with production reliability."

**Branding**
"Design that communicates trust, instantly."

**Strategy**
"Operational strategy and roadmaps tied to metrics."

---

## UI Component Patterns

### Buttons

**Primary Button**
```css
background: linear-gradient(135deg, #00E5FF, #0099CC);
color: #0f0724;
padding: 12px 32px;
border-radius: 6px;
font-weight: 600;
transition: transform 200ms ease-out;

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 229, 255, 0.3);
}
```

**Secondary Button**
```css
background: transparent;
border: 2px solid #00E5FF;
color: #00E5FF;
padding: 10px 30px;
border-radius: 6px;
```

### Cards

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
padding: 24px;
transition: all 300ms ease-out;

&:hover {
  border-color: rgba(0, 229, 255, 0.5);
  box-shadow: 0 8px 40px rgba(0, 229, 255, 0.15);
  transform: translateY(-4px);
}
```

---

## Accessibility

### Color Contrast

- Text on dark: `#F7F7F9` (off-white) passes WCAG AA
- Text on light: `#272B33` (dark gray) passes WCAG AA
- Accent colors used for decoration only, not critical info

### Focus States

```css
:focus-visible {
  outline: 2px solid #00E5FF;
  outline-offset: 4px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Asset Guidelines

### Icons

- Style: Line icons, 2px stroke
- Size: 24x24px default
- Format: SVG
- Color: Inherit from parent (for flexibility)

### Images

- Format: WebP (with JPG fallback)
- Compression: 85% quality
- Sizes: Responsive srcset (640w, 1024w, 1920w)

### 3D Models

- Format: GLB (GLTF binary)
- Compression: Draco
- Textures: KTX2 (Basis Universal)
- LOD levels: 3 (low, mid, high)
- Budget: < 200KB per model (LOD0)

---

## Example Pages

### Landing Page

```
[Hero]
- Headline: "Kairo Studio — Automations that move your business"
- Subhead: "We design marketing systems, AI products and automation
  stacks that scale revenue. Explore the Automation Universe."
- CTA: "Start the Orbit"
- Visual: 3D orbital with planets

[Services Preview]
- Grid of 5 planets
- Hover reveals service name + tagline

[Case Studies]
- 3 featured case studies
- Each with 3D thumbnail + metric highlight

[Social Proof]
- Client logos
- Key metrics (X projects, Y% avg growth)

[CTA Section]
- "Ready to automate your growth?"
- CTA: "Schedule a Call"
```

---

## Brand Applications

### Email Signature

```
[Name]
[Role] @ KAIRO STUDIO
[email] | [phone]
kairostudio.com
```

### Social Media

- **Profile image**: Minimal logo (white on cyan gradient)
- **Cover image**: Space theme with floating planets
- **Post style**: Dark backgrounds, cyan/coral accents, technical content

---

## File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `HeroOrbit.tsx`)
- Styles: `kebab-case.css` (e.g., `hero-section.css`)
- Images: `kebab-case-descriptor.webp` (e.g., `automation-planet-hero.webp`)
- Models: `kebab-case-lod.glb` (e.g., `marketing-planet-mid.glb`)

---

## Usage Examples

See implementation in:
- `/app/(marketing)/page.tsx` - Landing page
- `/components/ui/Button.tsx` - Button component
- `/styles/globals.css` - Global styles with design tokens

---

This brand guide is a living document. Update as the brand evolves.
