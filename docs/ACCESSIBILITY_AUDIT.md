# Accessibility Audit Checklist

Comprehensive WCAG 2.1 AA compliance checklist for Cerebral Machine.

**Project**: Cerebral Machine
**Last Updated**: November 2025
**Target Compliance**: WCAG 2.1 Level AA

---

## WCAG 2.1 Principles

The four principles of accessibility (POUR):
1. **Perceivable** - Information must be presentable to users
2. **Operable** - UI components must be operable by all users
3. **Understandable** - Information and UI must be understandable
4. **Robust** - Content must work with current and future technologies

---

## 1. Perceivable

### 1.1 Text Alternatives

#### 1.1.1 Non-text Content (A)
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Canvas has accessible description
- [ ] Icons have aria-label or title
- [ ] SVG graphics have `<title>` and `<desc>`

**Test**:
```javascript
// Check for missing alt text
document.querySelectorAll('img').forEach(img => {
  if (!img.hasAttribute('alt')) {
    console.error('Missing alt:', img);
  }
});
```

### 1.2 Time-based Media
- [ ] Audio descriptions for video (if applicable)
- [ ] Captions for audio (if applicable)
- [ ] N/A - No time-based media

### 1.3 Adaptable

#### 1.3.1 Info and Relationships (A)
- [ ] Semantic HTML used (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Forms use `<label>` with `for` attribute
- [ ] ARIA roles used appropriately

**Test**:
```javascript
// Check heading hierarchy
const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
let lastLevel = 0;
headings.forEach(h => {
  const level = parseInt(h.tagName[1]);
  if (level > lastLevel + 1) {
    console.warn('Heading skip:', h);
  }
  lastLevel = level;
});
```

#### 1.3.2 Meaningful Sequence (A)
- [ ] Reading order matches visual order
- [ ] Tab order is logical
- [ ] Content makes sense when linearized

**Test**: Disable CSS and check if content makes sense

#### 1.3.3 Sensory Characteristics (A)
- [ ] Instructions don't rely solely on shape/color/position
- [ ] "Click the red button" → "Click the Submit button (red)"

### 1.4 Distinguishable

#### 1.4.1 Use of Color (A)
- [ ] Color not the only means of conveying information
- [ ] Links distinguishable without color
- [ ] Form errors shown with icons/text, not just color

#### 1.4.3 Contrast (Minimum) (AA)
- [ ] Normal text: 4.5:1 contrast ratio
- [ ] Large text (18pt+ or 14pt+ bold): 3:1
- [ ] UI components: 3:1

**Test with Chrome DevTools**:
1. Inspect element
2. Check "Contrast ratio" in Styles panel
3. Must show checkmarks for AA/AAA

**Automated Test**:
```bash
npm install -g pa11y
pa11y http://localhost:5173 --standard WCAG2AA
```

#### 1.4.4 Resize Text (AA)
- [ ] Text can be resized to 200% without loss of functionality
- [ ] No horizontal scrolling at 200% zoom
- [ ] Layout responsive to text size changes

**Test**: Browser zoom to 200%, verify usability

#### 1.4.10 Reflow (AA) [WCAG 2.1]
- [ ] Content reflows at 400% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] No loss of functionality

#### 1.4.11 Non-text Contrast (AA) [WCAG 2.1]
- [ ] UI components have 3:1 contrast
- [ ] Graphical objects have 3:1 contrast
- [ ] Focus indicators visible

#### 1.4.12 Text Spacing (AA) [WCAG 2.1]
- [ ] Content adapts to custom text spacing:
  - Line height: 1.5x font size
  - Paragraph spacing: 2x font size
  - Letter spacing: 0.12x font size
  - Word spacing: 0.16x font size

**Test**: Apply these CSS rules and verify layout

#### 1.4.13 Content on Hover or Focus (AA) [WCAG 2.1]
- [ ] Hover/focus content dismissible (ESC key)
- [ ] Pointer can move over content without it disappearing
- [ ] Content remains visible until dismissed

---

## 2. Operable

### 2.1 Keyboard Accessible

#### 2.1.1 Keyboard (A)
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Tab order logical
- [ ] Enter/Space activate buttons
- [ ] Arrow keys navigate where appropriate

**Test Checklist**:
```
- [ ] Tab through entire page
- [ ] Activate all interactive elements with Enter/Space
- [ ] Navigate modules with Tab/Arrow keys
- [ ] Open module with Enter
- [ ] Close module with Escape
- [ ] Toggle debug panel with D key
- [ ] Toggle analytics with A key
- [ ] Jump to sections with number keys (1-3)
```

#### 2.1.2 No Keyboard Trap (A)
- [ ] Focus can always move away from any component
- [ ] Modal dialogs can be closed with Escape
- [ ] No infinite loops in focus order

**Test**: Tab through entire page, ensure you can return to start

#### 2.1.4 Character Key Shortcuts (A) [WCAG 2.1]
- [ ] Single-key shortcuts can be turned off, remapped, or only active on focus
- [ ] Keyboard shortcuts documented

### 2.2 Enough Time

#### 2.2.1 Timing Adjustable (A)
- [ ] No time limits on interactions
- [ ] If timeout exists, user can extend/disable
- [ ] N/A - No time limits

#### 2.2.2 Pause, Stop, Hide (A)
- [ ] Auto-updating content can be paused
- [ ] Moving/scrolling content can be stopped
- [ ] 3D animation respects prefers-reduced-motion

**Test**:
```css
/* Set in browser/OS */
@media (prefers-reduced-motion: reduce) {
  /* Animations should be minimal */
}
```

### 2.3 Seizures and Physical Reactions

#### 2.3.1 Three Flashes or Below Threshold (A)
- [ ] No content flashes more than 3 times per second
- [ ] No large flashing areas
- [ ] Bloom effect not too intense

### 2.4 Navigable

#### 2.4.1 Bypass Blocks (A)
- [ ] Skip links present ("Skip to main content")
- [ ] Keyboard shortcut to jump to sections

**Test**: Tab on page load, first element should be skip link

#### 2.4.2 Page Titled (A)
- [ ] Page has descriptive `<title>`
- [ ] Title identifies page content

#### 2.4.3 Focus Order (A)
- [ ] Focus order follows visual order
- [ ] Tab order makes sense

#### 2.4.4 Link Purpose (A)
- [ ] Link text describes destination
- [ ] No "click here" or "read more" without context

#### 2.4.5 Multiple Ways (AA)
- [ ] Multiple ways to find content
- [ ] Navigation menu
- [ ] Section jumps
- [ ] Search (if applicable)

#### 2.4.6 Headings and Labels (AA)
- [ ] Headings describe content
- [ ] Labels describe purpose
- [ ] Meaningful section titles

#### 2.4.7 Focus Visible (AA)
- [ ] Focus indicator visible on all interactive elements
- [ ] Minimum 3px outline
- [ ] High contrast color

**Test**: Tab through page with eyes closed, then verify focus is visible

### 2.5 Input Modalities [WCAG 2.1]

#### 2.5.1 Pointer Gestures (A)
- [ ] Multi-point gestures have single-point alternative
- [ ] Path-based gestures have simple alternative

#### 2.5.2 Pointer Cancellation (A)
- [ ] Down-event doesn't complete action
- [ ] Up-event completes action (can be aborted)

#### 2.5.3 Label in Name (A)
- [ ] Visible label matches accessible name
- [ ] Button text matches aria-label

#### 2.5.4 Motion Actuation (A)
- [ ] Device motion can be disabled
- [ ] UI alternative provided

---

## 3. Understandable

### 3.1 Readable

#### 3.1.1 Language of Page (A)
- [ ] `<html lang="en">` attribute set
- [ ] Correct language code

#### 3.1.2 Language of Parts (AA)
- [ ] Mixed-language content marked with `lang` attribute

### 3.2 Predictable

#### 3.2.1 On Focus (A)
- [ ] Focus doesn't trigger unexpected changes
- [ ] No auto-submit on focus
- [ ] No navigation changes on focus

#### 3.2.2 On Input (A)
- [ ] Input doesn't trigger unexpected changes
- [ ] Form submission requires explicit action

#### 3.2.3 Consistent Navigation (AA)
- [ ] Navigation menu consistent across pages
- [ ] Navigation order consistent

#### 3.2.4 Consistent Identification (AA)
- [ ] Icons have consistent meaning
- [ ] Similar components labeled consistently

### 3.3 Input Assistance

#### 3.3.1 Error Identification (A)
- [ ] Errors identified in text
- [ ] Error messages clear and specific

#### 3.3.2 Labels or Instructions (A)
- [ ] Form fields have labels
- [ ] Required fields indicated
- [ ] Format requirements explained

#### 3.3.3 Error Suggestion (AA)
- [ ] Error corrections suggested
- [ ] Examples provided

#### 3.3.4 Error Prevention (AA)
- [ ] Reversible submissions
- [ ] Confirmation for data changes
- [ ] Validation before submission

---

## 4. Robust

### 4.1 Compatible

#### 4.1.1 Parsing (A)
- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] Opening/closing tags match

**Test**:
```bash
# W3C HTML Validator
curl -H "Content-Type: text/html; charset=utf-8" \
     --data-binary @index.html \
     https://validator.w3.org/nu/?out=json
```

#### 4.1.2 Name, Role, Value (A)
- [ ] All UI components have accessible name
- [ ] Roles set correctly
- [ ] States communicated (aria-expanded, aria-checked, etc.)

#### 4.1.3 Status Messages (AA) [WCAG 2.1]
- [ ] Status messages use aria-live
- [ ] Success/error messages announced
- [ ] Loading states announced

**Example**:
```html
<div role="status" aria-live="polite" aria-atomic="true">
  Module loaded successfully
</div>
```

---

## Automated Testing Tools

### 1. axe DevTools

```bash
# Install Chrome extension
# https://chrome.google.com/webstore/detail/axe-devtools

# Run audit in DevTools
# Shows violations with severity
```

### 2. WAVE Browser Extension

```bash
# Install extension
# https://wave.webaim.org/extension/

# Run on page
# Visual overlay shows issues
```

### 3. Lighthouse Accessibility Audit

```bash
lighthouse http://localhost:5173 \
  --only-categories=accessibility \
  --output=html \
  --output-path=./accessibility-report.html
```

**Target Score**: ≥ 90

### 4. pa11y

```bash
npm install -g pa11y

pa11y http://localhost:5173 \
  --standard WCAG2AA \
  --reporter cli

# Expected: 0 errors
```

### 5. axe-core (Automated Tests)

```javascript
// tests/accessibility.test.js
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await injectAxe(page);

    const violations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });

    expect(violations).toHaveLength(0);
  });
});
```

---

## Manual Testing with Screen Readers

### NVDA (Windows - Free)

**Installation**:
```bash
# Download from https://www.nvaccess.org/
# Install and restart
```

**Test Steps**:
1. Launch NVDA (Ctrl+Alt+N)
2. Navigate with Tab key
3. Listen to announcements
4. Verify all content is read correctly
5. Test all interactive elements

**Common Commands**:
- **Tab**: Next focusable element
- **Shift+Tab**: Previous focusable element
- **Enter**: Activate element
- **Arrow keys**: Navigate content
- **H**: Next heading
- **B**: Next button
- **F**: Next form field

### JAWS (Windows - Commercial)

Similar to NVDA, industry standard for testing.

### VoiceOver (macOS/iOS - Built-in)

**macOS Activation**: Cmd+F5

**Test Steps**:
1. Enable VoiceOver
2. Navigate with Tab or VO keys (Ctrl+Option+Arrow)
3. Listen to announcements
4. Test rotor (Ctrl+Option+U)

**Common Commands**:
- **VO+Right Arrow**: Next element
- **VO+Left Arrow**: Previous element
- **VO+Space**: Activate element
- **VO+U**: Rotor menu

### TalkBack (Android - Built-in)

**Activation**: Settings → Accessibility → TalkBack

**Test Steps**:
1. Enable TalkBack
2. Swipe right to navigate
3. Double-tap to activate
4. Test all interactions

---

## Color Contrast Testing

### Manual Testing

**Tool**: Chrome DevTools
1. Inspect element
2. Check contrast ratio in Styles panel
3. Verify AA compliance (checkmark)

### Automated Testing

```bash
# Install contrast checker
npm install --save-dev pa11y-ci

# Create .pa11yci config
{
  "defaults": {
    "runners": ["axe"],
    "standard": "WCAG2AA"
  },
  "urls": [
    "http://localhost:5173"
  ]
}

# Run tests
npx pa11y-ci
```

### Color Blindness Simulation

**Tool**: Chrome DevTools
1. Cmd+Shift+P → "Rendering"
2. Emulate vision deficiencies
3. Test with:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
   - Achromatopsia (no color)

---

## Keyboard Navigation Test Script

```javascript
// tests/keyboard-navigation.test.js
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('should navigate with Tab key', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Tab through all interactive elements
    const focusableElements = await page.locator(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    ).count();

    for (let i = 0; i < focusableElements; i++) {
      await page.keyboard.press('Tab');

      // Verify focus indicator is visible
      const focused = await page.locator(':focus');
      const outline = await focused.evaluate(el =>
        getComputedStyle(el).outline
      );

      expect(outline).not.toBe('none');
    }
  });

  test('should activate elements with Enter/Space', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Tab to first button
    await page.keyboard.press('Tab');

    // Activate with Enter
    await page.keyboard.press('Enter');

    // Verify action occurred
    // (test specific to your app)
  });

  test('should close module with Escape', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open module
    await page.click('[data-module-id="saas"]');

    // Close with Escape
    await page.keyboard.press('Escape');

    // Verify closed
    const module = await page.locator('[data-module-active="true"]');
    await expect(module).toHaveCount(0);
  });
});
```

---

## Accessibility Checklist Summary

### Critical (Must Fix)
- [ ] All images have alt text
- [ ] Keyboard navigation works everywhere
- [ ] Focus indicators visible (3:1 contrast)
- [ ] Color contrast meets AA (4.5:1 text, 3:1 UI)
- [ ] ARIA labels on interactive elements
- [ ] No keyboard traps
- [ ] prefers-reduced-motion respected

### Important (Should Fix)
- [ ] Semantic HTML structure
- [ ] Heading hierarchy logical
- [ ] Skip links present
- [ ] Form labels associated
- [ ] Error messages descriptive
- [ ] Page title descriptive
- [ ] Lang attribute set

### Nice to Have (Polish)
- [ ] Screen reader tested
- [ ] Multiple navigation methods
- [ ] Consistent identification
- [ ] Status messages announced
- [ ] Help text provided

---

## Sign-off Checklist

- [ ] Lighthouse accessibility score ≥ 90
- [ ] pa11y reports 0 errors
- [ ] axe DevTools reports 0 violations
- [ ] Manual keyboard testing passed
- [ ] Screen reader testing passed (NVDA/VoiceOver)
- [ ] Color contrast verified
- [ ] Focus indicators visible
- [ ] WCAG 2.1 AA criteria met
- [ ] Documentation updated
- [ ] Stakeholder approval obtained

---

**Audit Status**: ⏳ Ready to Execute
**Target Compliance**: WCAG 2.1 Level AA
**Last Updated**: November 2025
