# 🎨 TalkItOut Final Design System Implementation

## Color Palette (Applied Globally)

```css
Primary Green:    #22C55E  /* Buttons, progress, highlights */
Teal Accent:      #10B981  /* Hovers, links, charts */
Warm Beige BG:    #FFF9F0  /* App background */
Surface White:    #FFFFFF  /* Cards, chat bubbles */
Peach Accent:     #FCD9B8  /* Toasts, streaks, empty states */
Ink Text:         #1E293B  /* Headings & body text */
```

## Gradient System

### Background Gradients
```typescript
// Page background (applied to Layout)
bg-hero-soft  // Soft radial green + warm yellow

// Alternative page gradient
bg-gradient-to-br from-ti-beige-50 via-white to-ti-green-500/10

// Card gradients
bg-gradient-to-br from-ti-green-500/10 to-white  // Stats
bg-gradient-to-br from-ti-peach-100 to-white     // Warm cards
```

### Button Gradients
```typescript
bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white
hover:opacity-90 rounded-xl shadow-md
```

## Typography Scale

```typescript
// Headings
H1: text-3xl font-extrabold tracking-tight text-ti-ink
H2: text-2xl font-bold text-ti-ink-900
H3: text-xl font-semibold text-ti-ink-900

// Body
Base: text-base leading-relaxed text-ti-ink/85
Small: text-sm text-ti-ink/70
```

## Component Patterns

### Stat Card
```tsx
<div className="bg-gradient-to-br from-ti-green-500/10 to-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
  >
    {/* content */}
  </motion.div>
</div>
```

### Chat Bubble (Assistant)
```tsx
<div className="bg-ti-green-500/15 border-2 border-ti-green-500/40 text-ti-ink rounded-2xl px-4 py-3">
  {message}
</div>
```

### Chat Bubble (User)
```tsx
<div className="bg-ti-beige-100 text-ti-ink-900 border-2 border-ti-beige-300 rounded-2xl px-4 py-3">
  {message}
</div>
```

### Primary Button
```tsx
<button className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg hover:scale-105 transition-all">
  {label}
</button>
```

### Input Field
```tsx
<input className="bg-ti-beige-50 focus:ring-2 focus:ring-ti-green-500 focus:border-ti-green-500 focus:bg-white rounded-xl border-2 border-ti-beige-300 px-4 py-2 transition-all" />
```

## Motion Language (Framer Motion)

### Fade Up Pattern (Use on all page roots)
```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

// Apply to page wrapper
<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeUp}
>
  {/* page content */}
</motion.div>
```

### Staggered Children
```typescript
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

### Hover Interactions
```typescript
// Cards
whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)' }}

// Buttons
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

## Page-Specific Implementations

### 1. Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  Welcome back, [Name]! 👋                      │
│  [Gradient banner: green→teal, rounded-3xl]     │
├─────────────────────────────────────────────────┤
│  Grid: [Mood Chart] [Goals] [Streaks]          │
│         [white cards, green accents]            │
├─────────────────────────────────────────────────┤
│  Quick Actions: [Check-in] [Chat] [Focus]      │
│                 [gradient buttons]              │
├─────────────────────────────────────────────────┤
│  Tasks (Kanban): [To Do] [Doing] [Done]        │
│                  [white cards, wide]            │
└─────────────────────────────────────────────────┘
```

### 2. Chat Page
```
┌─────────────────────────────────────────────────┐
│  [Assistant: green/15 + green border, left]     │
│  [User: beige surface, right]                   │
│  [Assistant: fade-in animation]                 │
│  ─────────────────────────────────────────────  │
│  [Input: beige bg] [Send: gradient]             │
│  Crisis note: Emergency 999                     │
└─────────────────────────────────────────────────┘
```

### 3. Focus (Pomodoro)
```
┌─────────────────────────────────────────────────┐
│  Take a moment for yourself 🧘                  │
│  [Circular timer: conic gradient ring]          │
│  [25:00 center, huge text]                      │
│  [Start] [Pause] [Reset]                        │
│  Right panel: Activity cards (Box Breathing)    │
└─────────────────────────────────────────────────┘
```

### 4. Check-ins
```
┌─────────────────────────────────────────────────┐
│  How are you feeling? ❤️                        │
│  [😢 😟 😐 🙂 😄] Large mood buttons             │
│  [gradient borders when selected]               │
│  [Textarea: beige bg]                           │
│  Recent check-ins: timeline with mood colors    │
└─────────────────────────────────────────────────┘
```

### 5. Tasks (Kanban)
```
┌─────────────────────────────────────────────────┐
│  Need help organizing? 📝                       │
│  [Supportive intro card: purple→beige]          │
│  ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ ToDo │ │Doing │ │ Done │                   │
│  │ ⚪   │ │ 🔵   │ │ 🟢   │                   │
│  │ Card │ │ Card │ │ Card │                   │
│  └──────┘ └──────┘ └──────┘                   │
└─────────────────────────────────────────────────┘
```

## Implementation Checklist

### Global (Layout.tsx)
- [x] bg-hero-soft on root div
- [x] Navigation reordered (Chat first)
- [ ] Footer with gradient background
- [ ] Sticky header with glassmorphism

### Dashboard
- [ ] Gradient welcome banner
- [ ] Mood chart with teal line on white
- [ ] Stat cards with green gradients
- [ ] Quick actions with gradient buttons
- [ ] Kanban task cards
- [ ] fadeUp motion on mount

### Chat
- [ ] Assistant bubbles: green/15 + border
- [ ] User bubbles: beige surface
- [ ] Empty state with welcoming message
- [ ] Fade-in animation on new messages
- [ ] Gradient Send button
- [ ] bg-chat-pattern background

### Focus
- [ ] Conic gradient timer ring
- [ ] Large centered time display
- [ ] Breathing animation when active
- [ ] Activity cards (Box Breathing, etc.)
- [ ] Supportive intro text
- [ ] Peach/mint gradient backgrounds

### Check-ins
- [ ] Large emoji mood selectors
- [ ] Gradient borders on selected
- [ ] Timeline with mood-colored dots
- [ ] Beige textarea
- [ ] Celebration animation on save

### Tasks
- [ ] Supportive intro card
- [ ] Three-column kanban
- [ ] Color-coded status dots
- [ ] Hover lift on task cards
- [ ] Priority badges with colors
- [ ] Drag-to-reorder (future)

### Settings
- [ ] White cards with green accents
- [ ] Icon headers (⚙️, 🔔, 🎨)
- [ ] Toggle switches with green
- [ ] Export button with gradient

### Counselor Dashboard
- [ ] Professional teal/white variant
- [ ] Clear severity chips
- [ ] Risk flag cards with borders
- [ ] Animated counters
- [ ] Student mood chart

## Animation Timing

```typescript
// Standard transitions
duration: 0.22  // Fast, snappy
duration: 0.3   // Default
duration: 0.5   // Slow, dramatic

// Stagger
staggerChildren: 0.1

// Spring
type: 'spring'
stiffness: 300
damping: 30
```

## Accessibility Notes

- All colors meet WCAG AA contrast ratios
- Motion respects `prefers-reduced-motion`
- Focus rings use green (#22C55E)
- Touch targets minimum 44x44px
- Alt text on all emoji and icons

---

## Quick Reference

**Primary Action**: `bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white rounded-xl`

**Card**: `bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-ti-beige-300`

**Input**: `bg-ti-beige-50 focus:ring-2 focus:ring-ti-green-500 rounded-xl border-2 border-ti-beige-300`

**Motion**: `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}`

---

**Next Step**: Apply these patterns systematically to each page component, starting with the most visible (Dashboard, Chat).
