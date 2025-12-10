# Motion Design System
## FinSIght Landing Page

> **Philosophy**: Subtle, performant, purposeful motion that enhances usability without distraction.

---

## 🎯 Motion Principles

### Core Guidelines
1. **Fast & Responsive** - Most interactions: 150-250ms
2. **Natural Easing** - Use `ease-out` for entrances, `ease-in-out` for state changes
3. **Purposeful** - Every animation should communicate state or guide attention
4. **Performant** - GPU-accelerated properties only (transform, opacity)
5. **Accessible** - Respect `prefers-reduced-motion`

### Timing Scale
```
Instant:    50ms   - Hover feedback, tooltips
Quick:      150ms  - Button states, links
Standard:   250ms  - Cards, modals, dropdowns
Smooth:     350ms  - Page transitions, large movements
Gentle:     500ms  - Loading states, success confirmations
```

### Easing Functions
```
ease-out:     Entrances, appearing elements
ease-in:      Exits, disappearing elements
ease-in-out:  State changes, transforms
spring:       Playful interactions (subtle bounces)
```

---

## 📊 Component Animation Specifications

| Component | Trigger | Properties | Duration | Easing | Notes |
|-----------|---------|------------|----------|--------|-------|
| **Primary Button** | Hover | scale: 1.02, shadow: lg→xl | 150ms | ease-out | Lift effect |
| **Primary Button** | Active/Press | scale: 0.98 | 100ms | ease-in | Press down |
| **Primary Button** | Disabled | opacity: 0.5 | 200ms | ease-out | Fade |
| **Primary Button** | Loading | rotate spinner | 600ms | linear | Continuous |
| **Outline Button** | Hover | bg: transparent→accent, border-color | 150ms | ease-out | Fill background |
| **Outline Button** | Active/Press | scale: 0.98 | 100ms | ease-in | Press down |
| **Nav Links** | Hover | color, translateY: -1px | 150ms | ease-out | Subtle lift |
| **Nav Links** | Active | color, scale: 0.95 | 100ms | ease-in | Compress |
| **Theme Toggle** | Click | rotate: 180deg | 250ms | ease-in-out | Spin transition |
| **Theme Toggle** | Hover | scale: 1.1, bg: accent | 150ms | ease-out | Expand |
| **Feature Card** | Hover | translateY: -4px, shadow: sm→lg | 250ms | ease-out | Lift up |
| **Feature Card** | Focus | ring: 2px, ring-offset: 2px | 150ms | ease-out | Accessibility |
| **Feature Card Icon** | Card Hover | scale: 1.15, rotate: 5deg | 250ms | ease-out | Playful |
| **Step Card Number** | Scroll In | opacity: 0→1, scale: 0.8→1 | 350ms | ease-out | Fade + scale |
| **Step Card Content** | Scroll In | opacity: 0→1, translateY: 20→0 | 350ms | ease-out | Slide up (stagger 100ms) |
| **Stat Counter** | Scroll In | count: 0→value | 1000ms | ease-out | Animated number |
| **Hero Badge** | Page Load | opacity: 0→1, translateY: -10→0 | 350ms | ease-out | Slide down |
| **Hero Heading** | Page Load | opacity: 0→1, translateY: 20→0 | 400ms | ease-out | Slide up (delay 100ms) |
| **Hero Description** | Page Load | opacity: 0→1 | 350ms | ease-out | Fade (delay 200ms) |
| **Hero CTA Buttons** | Page Load | opacity: 0→1, translateY: 10→0 | 350ms | ease-out | Slide up (delay 300ms) |
| **Hero Dashboard Card** | Page Load | opacity: 0→1, scale: 0.95→1 | 500ms | ease-out | Fade + scale (delay 400ms) |
| **CTA Card** | Scroll In | opacity: 0→1, scale: 0.95→1 | 400ms | ease-out | Attention grab |
| **Footer Links** | Hover | color, translateX: 2px | 150ms | ease-out | Slide right |
| **Logo** | Hover | scale: 1.05 | 200ms | ease-out | Subtle growth |
| **Arrow Icon** | Button Hover | translateX: 0→4px | 200ms | ease-out | Point forward |
| **Check Icon** | Appear | scale: 0→1, opacity: 0→1 | 250ms | spring | Pop in |
| **Section Headings** | Scroll In | opacity: 0→1, translateY: 20→0 | 400ms | ease-out | Slide up |

---

## 🎨 Interaction States

### Button States
```css
/* Default */
transform: scale(1);
shadow: shadow-md;

/* Hover */
transform: scale(1.02);
shadow: shadow-lg;
transition: transform 150ms ease-out, box-shadow 150ms ease-out;

/* Active/Pressed */
transform: scale(0.98);
transition: transform 100ms ease-in;

/* Disabled */
opacity: 0.5;
pointer-events: none;
transition: opacity 200ms ease-out;

/* Loading */
opacity: 0.7;
cursor: wait;
/* Spinner rotates continuously */
```

### Link States
```css
/* Default */
color: var(--muted-foreground);
transform: translateY(0);

/* Hover */
color: var(--foreground);
transform: translateY(-1px);
transition: color 150ms ease-out, transform 150ms ease-out;

/* Active */
transform: scale(0.95);
transition: transform 100ms ease-in;
```

### Card States
```css
/* Default */
transform: translateY(0);
box-shadow: var(--shadow-sm);

/* Hover */
transform: translateY(-4px);
box-shadow: var(--shadow-lg);
transition: transform 250ms ease-out, box-shadow 250ms ease-out;

/* Focus-visible */
outline: 2px solid var(--ring);
outline-offset: 2px;
transition: outline 150ms ease-out;
```

---

## 🌊 Scroll Animations

### Fade In
```
Initial: opacity: 0
Final: opacity: 1
Duration: 350ms
Easing: ease-out
Trigger: Element enters viewport (threshold: 20%)
```

### Slide Up
```
Initial: opacity: 0, translateY: 20px
Final: opacity: 1, translateY: 0
Duration: 400ms
Easing: ease-out
Trigger: Element enters viewport (threshold: 20%)
```

### Scale In
```
Initial: opacity: 0, scale: 0.95
Final: opacity: 1, scale: 1
Duration: 500ms
Easing: ease-out
Trigger: Element enters viewport (threshold: 20%)
```

### Stagger Pattern
For grids of cards:
- Stagger delay: 100ms per item
- Max stagger: 300ms (after 3 items, simultaneous)

---

## ⚡ Micro-interactions

### Success Feedback
```typescript
// Checkmark animation
scale: [0, 1.2, 1]
opacity: [0, 1, 1]
duration: 400ms
easing: spring(stiffness: 200, damping: 15)
```

### Error Shake
```typescript
// Input field validation error
translateX: [0, -8, 8, -4, 4, 0]
duration: 400ms
easing: ease-in-out
```

### Loading Spinner
```typescript
// Continuous rotation
rotate: [0, 360]
duration: 600ms
easing: linear
repeat: infinite
```

### Pulse (Attention)
```typescript
// For notification badges
scale: [1, 1.1, 1]
opacity: [1, 0.8, 1]
duration: 2000ms
easing: ease-in-out
repeat: infinite
```

---

## 🎬 Page Load Sequence

```
Timeline:
0ms     → Badge fade in + slide down
100ms   → Heading fade in + slide up
200ms   → Description fade in
300ms   → CTA buttons fade in + slide up
400ms   → Dashboard card fade in + scale
```

---

## 🛠️ Implementation Approaches

### Option 1: Tailwind + CSS Transitions
```tsx
// Simple hover states
className="transition-all duration-150 ease-out hover:scale-105"
```

### Option 2: Framer Motion (Recommended for complex animations)
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  Content
</motion.div>
```

### Option 3: CSS Keyframes (for loops)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## ♿ Accessibility

### Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Implementation
```tsx
const prefersReducedMotion = useReducedMotion()

const animationProps = prefersReducedMotion 
  ? {} 
  : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 }
    }
```

---

## 📈 Performance Checklist

- ✅ Use `transform` and `opacity` only (GPU-accelerated)
- ✅ Avoid animating `width`, `height`, `top`, `left`
- ✅ Use `will-change` sparingly (only for complex animations)
- ✅ Keep durations under 500ms for most interactions
- ✅ Debounce scroll listeners (use IntersectionObserver)
- ✅ Test on lower-end devices
- ✅ Monitor frame rate (aim for 60fps)

---

## 🎯 Quick Reference

**Button hover**: `150ms ease-out scale(1.02)`
**Card hover**: `250ms ease-out translateY(-4px)`
**Link hover**: `150ms ease-out color + translateY(-1px)`
**Scroll in**: `400ms ease-out opacity + translateY(20→0)`
**Loading**: `600ms linear rotate(360deg) infinite`

---

## 📦 Dependencies

```json
{
  "framer-motion": "^11.0.0",
  "tailwindcss-animate": "^1.0.7"
}
```

---

**Last Updated**: December 10, 2025
**Version**: 1.0.0
