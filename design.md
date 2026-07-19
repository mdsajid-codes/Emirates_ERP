# 🎨 Emirates ERP — Website Design Theme

> A complete reference for the design system, visual language, and component patterns used across the Emirates ERP website.

---

## 📋 Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations & Motion](#animations--motion)
7. [Icons](#icons)
8. [Page Structure](#page-structure)
9. [CSS Utilities](#css-utilities)

---

## 🏢 Brand Identity

| Property     | Value                             |
|--------------|-----------------------------------|
| **Brand**    | Emirates ERP                      |
| **Tagline**  | Empowering Businesses Through Technology |
| **Domain**   | emirateserp.com                   |
| **Locale**   | en_AE (UAE-focused)               |
| **Logo**     | `/Logo_Name.svg` · `/icon.svg`    |

---

## 🎨 Color Palette

These are the official brand colors defined in `globals.css` via the `@theme` block (Tailwind v4).

### Primary Colors

| Token                    | Hex       | Usage                                           | Preview              |
|--------------------------|-----------|-------------------------------------------------|----------------------|
| `--color-brand-primary`  | `#112D48` | Dark navy — headings, hero bg, footer bg, CTA secondary | 🟦 Deep Navy  |
| `--color-brand-accent`   | `#2AA2A5` | Teal — active links, badges, accents, CTA primary       | 🩵 Vibrant Teal |
| `--color-brand-accent-dark` | `#1d8a8d` | Darker teal — hover state of accent             | 🔵 Dark Teal   |
| `--color-brand-secondary`| `#296198` | Medium blue — gradient partner, icon tints      | 🔷 Steel Blue  |
| `--color-brand-surface`  | `#1e293b` | Slate surface — dark cards, social icon bg      | ⬛ Dark Slate  |

### Neutral / Slate Scale (Tailwind defaults used)

| Token         | Usage                                              |
|---------------|----------------------------------------------------|
| `slate-50`    | Page background, light section backgrounds         |
| `slate-100`   | Card backgrounds, divider lines                    |
| `slate-300`   | Hero body text on dark backgrounds                 |
| `slate-400`   | Footer body text, muted paragraphs                 |
| `slate-500`   | Stats labels, subtext                              |
| `slate-600`   | Card body text                                     |
| `slate-700`   | Navbar link default color                          |
| `slate-800`   | Body text default                                  |
| `slate-900`   | Headings default                                   |
| `white`       | Card backgrounds, button text on dark              |

### Color Usage Examples

```
Hero Section:       bg-[#112D48] + text-white + accent text-[#2AA2A5]
Navbar:             bg-white / bg-white/90 + active link text-[#2AA2A5]
Service Cards:      glass (white/70 backdrop-blur) on bg-slate-50
CTA Banner:         bg-gradient from-[#296198] to-[#112D48]
Footer:             bg-[#112D48] + text-slate-300/400
Button Primary:     bg-[#2AA2A5] hover:bg-[#1d8a8d] text-white
Button Secondary:   bg-[#112D48] hover:bg-[#1e293b] text-white
```

---

## ✍️ Typography

### Font Families

| Variable          | Family   | Weight(s)       | Usage                                       |
|-------------------|----------|-----------------|---------------------------------------------|
| `--font-sans`     | **Inter**    | 400, 500, 600   | Body text, nav links, labels, paragraphs    |
| `--font-heading`  | **Poppins**  | 600, 700, 800   | All headings: `h1`–`h6`, section titles     |

> Loaded via Google Fonts CDN in `globals.css`:
> ```
> @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700;800&display=swap');
> ```

### Type Scale

| Element           | Classes                                         | Notes                          |
|-------------------|-------------------------------------------------|--------------------------------|
| `h1` (Hero)       | `text-5xl md:text-6xl lg:text-7xl font-bold`    | 80px max, bold white           |
| `h2` (Sections)   | `text-3xl md:text-4xl lg:text-5xl font-bold`    | Teal underline bar below       |
| `h3` (Cards)      | `text-xl font-bold`                             | Hovers to `text-[#2AA2A5]`     |
| `h4` (List items) | `font-bold text-lg text-[#112D48]`              | Feature list titles            |
| Body              | `text-base font-sans text-slate-800`            | Default readable                |
| Subtitle/Eyebrow  | `text-sm font-semibold uppercase tracking-wider text-[#2AA2A5]` | Above section headers |
| Muted text        | `text-slate-400 text-sm`                        | Footer, helper text            |
| Hero body         | `text-xl text-slate-300 leading-relaxed`        | Hero sub-paragraph             |

---

## 📐 Spacing & Layout

### Container

```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

- Max width: **1280px** (`max-w-7xl`)
- Responsive horizontal padding: `px-4` → `sm:px-6` → `lg:px-8`

### Section Spacing

| Section Type     | Vertical Padding | Notes                               |
|------------------|------------------|-------------------------------------|
| Hero             | `pt-20 min-h-[90vh]` | Full-bleed, overlapping next section |
| Main sections    | `py-24`          | ~96px top/bottom                    |
| CTA Banner       | `py-16`          | Slightly compact                    |
| Stats Card       | `py-16 px-8`     | Floating card, `-mt-8` overlap      |
| Navbar height    | `h-20`           | 80px fixed top bar                  |
| Body offset      | `pt-20`          | Compensates for fixed navbar        |

### Grid Systems

| Section           | Grid                           |
|-------------------|--------------------------------|
| Stats             | `grid-cols-2 md:grid-cols-4`   |
| Core Modules      | `grid-cols-1 md:grid-cols-3`   |
| Why Us            | `grid-cols-1 lg:grid-cols-2`   |
| Footer            | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` |

---

## 🧩 Components

### Navbar

- **Fixed** top, full-width, `z-50`
- Background: `bg-white/90 backdrop-blur-sm` → scrolled: `bg-white shadow-md`
- Height: `h-20`
- Active link: `text-[#2AA2A5]` + `h-0.5 bg-[#2AA2A5]` underline bar
- CTA Button: `bg-[#2AA2A5] hover:bg-[#112D48] rounded-full px-5 py-2.5`
- Mobile: Hamburger (`Menu` / `X` icons), animated slide-down drawer

### Button Component (`Button.tsx`)

| Variant     | Styles                                                                       |
|-------------|------------------------------------------------------------------------------|
| `primary`   | `bg-[#2AA2A5] hover:bg-[#1d8a8d] text-white shadow-md`                       |
| `secondary` | `bg-[#112D48] hover:bg-[#1e293b] text-white shadow-md`                       |
| `outline`   | `border-2 border-[#112D48] text-[#112D48] hover:bg-slate-50`                 |
| `ghost`     | `text-slate-600 hover:text-[#112D48] hover:bg-slate-100`                     |

| Size  | Padding & Font              |
|-------|-----------------------------|
| `sm`  | `px-4 py-2 text-sm`         |
| `md`  | `px-6 py-3 text-base`       |
| `lg`  | `px-8 py-4 text-lg`         |

- Shape: `rounded-lg` (default), `rounded-full` (navbar CTA variant)
- Can render as `<button>`, `<Link>`, or `<a>` depending on `href` prop

### SectionHeader Component

```
Eyebrow label:   text-[#2AA2A5] font-semibold tracking-wider uppercase text-sm
Title:           text-3xl md:text-4xl lg:text-5xl font-bold text-[#112D48]
Underline bar:   w-16 h-1.5 bg-[#2AA2A5] rounded-full (centered or left-aligned)
```

- Supports `align`: `center` | `left` | `right`
- Has built-in `IntersectionObserver` scroll reveal animation

### Service Cards (Glass Cards)

```css
.glass {
  bg-white/70 backdrop-blur-md border border-white/20 shadow-sm
}
```

- `rounded-2xl` container
- Image area: `h-48` with `group-hover:scale-110 transition-transform duration-700`
- Icon badge: `w-12 h-12 bg-white rounded-full shadow-lg text-[#296198]`
- Hover: `-translate-y-2 transition-transform duration-300`
- Content: `p-6`, title hovers to `text-[#2AA2A5]`

### Stats Card (Floating)

- Positioned with `-mt-8 mx-4 rounded-2xl shadow-xl bg-white`
- Numbers: `AnimatedCounter` with `IntersectionObserver`-triggered count-up
- Animated counter label: `text-slate-500 font-medium`

### Footer

- Background: `bg-[#112D48]` text: `text-slate-300`
- 4-column grid at `lg` breakpoint
- Section titles: `text-white font-semibold` + `bg-[#2AA2A5]` dot indicator
- Tagline styled with `border-l-2 border-[#2AA2A5] pl-4 italic`
- Social icons: `w-10 h-10 rounded-full bg-[#1e293b]` → hover: `bg-[#2AA2A5]` + `hover:-translate-y-1`
- Footer links: slide-in `ArrowRight` icon on hover

---

## 🎬 Animations & Motion

### CSS Keyframes

| Animation      | Keyframe Definition                                 | Usage                  |
|----------------|-----------------------------------------------------|------------------------|
| `fadeUp`       | `opacity: 0; translateY(20px)` → `opacity:1; translateY(0)` | Hero headline entrance |
| `pulseSlow`    | `opacity: 1` → `opacity: 0.7` → `opacity: 1`       | Primary CTA button pulse |

### Custom Tailwind Animations

```css
--animate-fade-up:    fadeUp 0.8s ease-out forwards;
--animate-pulse-slow: pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

Usage in JSX:
```jsx
className="animate-[fadeUp_0.8s_ease-out_forwards]"
className="animate-[pulseSlow_3s_infinite]"
```

### Scroll Reveal System

**Classes:**

| Class              | Effect                                           |
|--------------------|--------------------------------------------------|
| `.reveal`          | `opacity:0; translateY(30px)` initial hidden state |
| `.reveal.active`   | `opacity:1; translateY(0)` — triggered by IntersectionObserver |
| `.reveal-delay-100` | `transition-delay: 100ms`                       |
| `.reveal-delay-200` | `transition-delay: 200ms`                       |
| `.reveal-delay-300` | `transition-delay: 300ms`                       |

**RevealWrapper Component:** Wraps content with `IntersectionObserver` that adds `.active` class on viewport entry (threshold: 10%).

### Transition Standards

| Interaction         | Duration / Easing                   |
|---------------------|-------------------------------------|
| Color changes       | `transition-colors` (150ms default) |
| Card hover lift     | `duration-300`                      |
| Image zoom          | `duration-700`                      |
| Scroll reveal       | `0.8s ease-out`                     |
| Mobile menu         | `duration-300` (max-height + opacity)|
| Navbar background   | `duration-300`                      |

---

## 🔷 Icons

Library: **Lucide React** (`lucide-react`)

| Icon          | Used In                                          |
|---------------|--------------------------------------------------|
| `Menu` / `X`  | Navbar mobile hamburger toggle                   |
| `Zap`         | Navbar & mobile CTA "Request Demo" button        |
| `ArrowRight`  | Hero CTA, "Read More" links, Footer link hover   |
| `CheckCircle2`| "Why Choose Us" feature list                     |
| `Building2`   | HR & Payroll card icon badge                     |
| `Users`       | CRM & Sales card icon badge                      |
| `Ruler`       | Financial Management card icon badge             |
| `ShieldCheck` | Floating "99.9% Uptime" guarantee card           |
| `MapPin`      | Footer address                                   |
| `Phone`       | Footer phone numbers                             |
| `Mail`        | Footer email                                     |

---

## 📄 Page Structure

### Global Layout (`layout.tsx`)

```
<html lang="en">
  <body>
    <div class="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />           ← Fixed top, z-50
      <main class="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  </body>
</html>
```

### Home Page Section Order

| # | Section               | Background                          | Key Feature                        |
|---|-----------------------|-------------------------------------|------------------------------------|
| 1 | **Hero**              | `bg-[#112D48]` + image overlay      | Full-bleed, fade-up animation      |
| 2 | **Stats / Numbers**   | `bg-white` floating card            | AnimatedCounter, overlaps hero     |
| 3 | **Core Modules**      | `bg-slate-50`                       | 3-column glass cards, image zoom   |
| 4 | **Why Choose Us**     | `bg-white`                          | 2-col split, feature list          |
| 5 | **CTA / Pricing Banner** | gradient `#296198` → `#112D48`   | Dark gradient, glow blob effect    |

### Navigation Pages

- `/` — Home
- `/services` — Services / Modules
- `/pricing` — Pricing Plans
- `/about` — About Us
- `/contact` — Contact Form

---

## 🛠️ CSS Utilities

### Glassmorphism

```css
/* Light glass — used on service cards */
.glass {
  background: rgba(255,255,255,0.70);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.20);
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}

/* Dark glass — for dark-background overlays */
.glass-dark {
  background: rgba(15,23,42,0.80);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51,65,85,0.50);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

### Text Balance

```css
.text-balance { text-wrap: balance; }
```
Used for headings to prevent orphaned words.

### Gradient Glow Blob (CTA Section)

```jsx
<div className="absolute right-0 top-0 w-1/2 h-full opacity-10 blur-3xl rounded-full bg-[#2AA2A5] translate-x-1/2" />
```
Creates a soft ambient glow behind CTA sections.

### Image Reveal Overlay

```jsx
<div className="absolute inset-0 bg-gradient-to-r from-[#112D48] via-[#112D48]/80 to-transparent" />
```
Used in hero to fade the background image from left to transparent right.

---

## 📦 Tech Stack

| Tool              | Version / Notes                         |
|-------------------|-----------------------------------------|
| **Framework**     | Next.js 15 (App Router)                 |
| **Language**      | TypeScript + TSX                        |
| **Styling**       | Tailwind CSS v4 (`@import "tailwindcss"`) |
| **Fonts**         | Google Fonts (Inter + Poppins)          |
| **Icons**         | Lucide React                            |
| **Images**        | Next.js `<Image />` (optimized)         |
| **Animations**    | CSS keyframes + IntersectionObserver    |

---

*Last updated: July 2026 · Emirates ERP Design System v1.0*
