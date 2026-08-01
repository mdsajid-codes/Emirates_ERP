# Enterprise SaaS Design System: Single Source of Truth

This document serves as the absolute, single source of truth for all UI/UX design and frontend development within the project. It defines a highly scalable, maintainable, and visually cohesive design language inspired by modern, premium enterprise SaaS platforms (e.g., Stripe, Linear, Vercel, Notion). 

Every new page, component, modal, table, form, and dashboard MUST strictly adhere to these guidelines to ensure zero inconsistency across the platform.

---

## 1. Design Philosophy

Our design system is built on the following core principles:

- **Minimalist & Clean:** Interfaces should be free of visual clutter. Use negative space (whitespace) to group elements logically rather than relying on heavy borders or background boxes.
- **Premium Enterprise Feel:** The UI must feel robust, polished, and trustworthy. We achieve this through subtle gradients, soft shadows, rounded geometry, and meticulous typography.
- **Dashboard-First Data Density:** As an enterprise tool, data density is critical. We balance displaying large amounts of information with high readability by employing strong information hierarchy and typographic contrast.
- **Component-Driven & Scalable:** Every UI element must be a reusable component based on semantic design tokens. No hardcoded colors or spacing values are permitted.
- **Accessibility by Default:** High contrast ratios, keyboard navigability, and screen-reader support are non-negotiable foundations, not afterthoughts.
- **Fluid & Responsive:** The system gracefully adapts from large 4K desktop monitors down to mobile devices without sacrificing functionality.

---

## 2. Color System

Our color palette is semantically driven. We define base scales (Gray, Blue, Emerald, Rose, Amber) and map them to functional semantic tokens.

### Base Palettes (Light & Dark mode agnostic)
- **Primary (Brand):** Indigo/Blue scale (e.g., `#1E1B4B` to `#EEF2FF`)
- **Success:** Emerald scale (e.g., `#064E3B` to `#ECFDF5`)
- **Warning:** Amber scale (e.g., `#78350F` to `#FFFBEB`)
- **Danger:** Rose scale (e.g., `#881337` to `#FFF1F2`)
- **Info:** Blue/Cyan scale
- **Neutral (Grayscale):** Slate/Gray scale (e.g., `#0F172A` to `#F8FAFC`)

### Semantic Tokens (Light Theme Example)
| Token | Value | Usage |
| :--- | :--- | :--- |
| `background` | `#F3F4F6` (Gray 100) | Main application background |
| `surface` | `#FFFFFF` (White) | Card and modal backgrounds |
| `surface-hover` | `#F9FAFB` (Gray 50) | Hover state for surface elements |
| `border` | `#E5E7EB` (Gray 200) | Default borders, dividers |
| `border-focus`| `#6366F1` (Indigo 500) | Focus rings on inputs |
| `text-primary` | `#111827` (Gray 900) | Headings, primary body text |
| `text-secondary`| `#6B7280` (Gray 500) | Secondary text, captions, placeholders |
| `text-disabled`| `#9CA3AF` (Gray 400) | Disabled text states |
| `brand-primary`| `#1E1B4B` (Indigo 950) | Primary buttons, active sidebar items |
| `sidebar-bg` | `#111827` (Gray 900) | Sidebar background |
| `sidebar-text` | `#F9FAFB` (Gray 50) | Sidebar unselected text |
| `sidebar-active`| `#1F2937` (Gray 800) | Sidebar selected item background |

### Semantic Tokens (Dark Theme Example)
| Token | Value | Usage |
| :--- | :--- | :--- |
| `background` | `#030712` (Gray 950) | Main application background |
| `surface` | `#111827` (Gray 900) | Card and modal backgrounds |
| `border` | `#1F2937` (Gray 800) | Default borders, dividers |
| `text-primary` | `#F9FAFB` (Gray 50) | Headings, primary body text |
| `text-secondary`| `#9CA3AF` (Gray 400) | Secondary text, captions |
| `brand-primary`| `#818CF8` (Indigo 400) | Primary buttons, active states |

---

## 3. Dynamic Theme System

We use a CSS Variable architecture mapped to Tailwind CSS config to enable seamless theme switching (Light, Dark, High Contrast, Custom Brands).

### CSS Variable Definition (`styles/globals.css`)
```css
:root {
  /* Colors */
  --bg-primary: 243 244 246; /* #F3F4F6 */
  --bg-surface: 255 255 255; /* #FFFFFF */
  --text-primary: 17 24 39;  /* #111827 */
  --text-secondary: 107 114 128; /* #6B7280 */
  --border-default: 229 231 235; /* #E5E7EB */
  --brand-primary: 30 27 75; /* #1E1B4B */
  
  /* Status */
  --color-success: 16 185 129;
  --color-success-bg: 209 250 229;
  --color-error: 239 68 68;
  --color-error-bg: 254 226 226;
}

.dark {
  --bg-primary: 3 7 18;
  --bg-surface: 17 24 39;
  --text-primary: 249 250 251;
  --text-secondary: 156 163 175;
  --border-default: 31 41 55;
  --brand-primary: 99 102 241;
}
```

### Tailwind Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-primary) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        content: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        brand: 'rgb(var(--brand-primary) / <alpha-value>)',
        border: 'rgb(var(--border-default) / <alpha-value>)',
      }
    }
  }
}
```
**Golden Rule:** NEVER use raw color values (e.g., `text-gray-900` or `bg-white`) in components. Always use semantic classes (`text-content-primary`, `bg-surface`).

---

## 4. Typography

We utilize a modern sans-serif typeface (e.g., **Inter** or **Geist**) to ensure maximum legibility at small sizes.

- **Font Family:** `Inter`, system-ui, sans-serif
- **Base Size:** 14px (`text-sm`) is the default body size for dashboards to maximize data density.

### Typographic Scale
| Level | Tailwind Class | Size (px) | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display | `text-4xl font-extrabold`| 36px | 800 | 1.2 | Hero numbers, major metrics |
| H1 | `text-2xl font-bold` | 24px | 700 | 1.2 | Page titles |
| H2 | `text-xl font-bold` | 20px | 700 | 1.3 | Section headers |
| H3 | `text-lg font-semibold` | 18px | 600 | 1.4 | Card titles |
| Body | `text-sm font-medium` | 14px | 500 | 1.5 | Default text, table data |
| Caption| `text-xs font-medium` | 12px | 500 | 1.5 | Meta text, timestamps |
| Tiny | `text-[10px] font-bold` | 10px | 700 | 1.2 | Micro-badges, uppercase labels|

**Letter Spacing:** Tighter letter spacing on large headings (`tracking-tight`), normal on body, and slightly wider on uppercase tiny text (`tracking-wider uppercase`).

---

## 5. Spacing System

All spacing (margins, padding, gaps) is based on a strict **4px/8px grid system**.

| Tailwind | Size (px) | Usage Example |
| :--- | :--- | :--- |
| `1` | 4px | Gap between icon and text inside a button |
| `2` | 8px | Gap between stacked inputs |
| `3` | 12px | Internal padding of a small badge |
| `4` | 16px | Internal padding of standard inputs/buttons |
| `5` | 20px | Internal padding of standard cards |
| `6` | 24px | Gap between layout columns |
| `8` | 32px | Section vertical spacing |
| `12`| 48px | Page margins on desktop |

---

## 6. Border Radius

Rounded geometry is a core signature of this design language. We use distinct, consistent radii for different element types.

| Size | Tailwind Class | Pixel Value | Application |
| :--- | :--- | :--- | :--- |
| **Small** | `rounded-md` | 6px | Checkboxes, tiny badges, tooltips |
| **Medium** | `rounded-lg` | 8px | Inputs, standard buttons, dropdown menus |
| **Large** | `rounded-xl` | 12px| Small cards, modals |
| **X-Large**| `rounded-2xl` | 16px| Main dashboard cards, metric widgets |
| **Giant** | `rounded-[32px]`| 32px| Main sidebar layout container |
| **Full** | `rounded-full` | 9999px| Avatars, status indicator dots, pill badges |

---

## 7. Shadow System

Shadows are used to create depth and indicate elevation (z-index). Shadows should be soft, diffuse, and slightly tinted with the brand color to avoid "muddy" gray shadows.

- **`shadow-sm`**: Subtle depth for inputs and standard cards.
- **`shadow-md`**: Hover states for cards, floating action buttons.
- **`shadow-lg`**: Dropdown menus, popovers.
- **`shadow-xl`**: Modals, slide-over drawers.

*In Dark Mode, shadows are generally replaced or supplemented by subtle borders (`border-gray-800`) to define edges, as shadows are invisible on black.*

---

## 8. Layout System

The standard layout is a "Dashboard Shell" comprising a persistent sidebar and a scrollable main content area.

- **Sidebar Width:** `260px` (Desktop). Collapses to a hamburger menu on mobile.
- **Header Height:** `64px`. Contains search, breadcrumbs, user profile, notifications.
- **Content Max-Width:** Fluid by default, bounded by `max-w-7xl` (1280px) for ultra-wide monitors to prevent infinite stretching.
- **Page Padding:** `p-4 sm:p-6 lg:p-8`
- **Dashboard Grid:** 12-column CSS grid. Standard split is `col-span-8` (main content) and `col-span-4` (side panel/widgets).

---

## 9. Navigation Guidelines

- **Sidebar:** Primary navigation. Group items by semantic category (e.g., "Overview", "Management"). Use a subtle active state (e.g., darker background, bold text) rather than loud colored backgrounds.
- **Topbar:** Contextual actions. Global search, notifications, and user settings reside here.
- **Breadcrumbs:** Use for nested views (e.g., `Customers / ACME Corp / Invoices`). Keep them subtle (`text-content-secondary`).
- **Tabs:** Use underline tabs for in-page navigation. Active tab gets a primary color bottom border; inactive tabs are muted.

---

## 10. Component Design Rules

Every component must support Hover, Focus, Disabled, Loading, Error, and Success states.

### Buttons
- **Primary:** Solid brand background, white text. Hover: slightly darker/lower opacity.
- **Secondary:** White background, subtle border, primary text. Hover: `bg-gray-50`.
- **Destructive:** Solid red background or red outline.
- **Ghost:** No background, subtle text. Hover: light gray background.
- **Focus State:** MUST include `focus:ring-2 focus:ring-offset-2 focus:ring-brand` for accessibility.

### Cards
- **Structure:** `bg-surface rounded-2xl shadow-sm border border-transparent` (or subtle border). 
- **Padding:** `p-5` or `p-6`.
- **Headers:** Should have a title (`text-sm font-bold`) and optional trailing actions (e.g., an ellipsis menu or filter dropdown).

### Badges & Tags
- **Pill Shape:** `px-2.5 py-0.5 rounded-full text-[11px] font-semibold`.
- **Colors:** Always use pale background + dark text of the same hue (e.g., `bg-emerald-100 text-emerald-700`).

---

## 11. Table Design

Enterprise applications live and die by their tables.

- **Layout:** `w-full text-left border-collapse`.
- **Row Height:** Dense (`py-2`) or Comfortable (`py-3.5`). Default to Comfortable.
- **Header:** `text-[11px] uppercase tracking-wider text-content-secondary font-semibold border-b`.
- **Rows:** `border-b border-border hover:bg-surface-hover transition-colors`.
- **Data:** Primary columns (e.g., Name, ID) should be bold (`text-content-primary font-semibold`). Secondary columns (Date, Email) should be muted (`text-content-secondary`).
- **Actions:** Place an ellipsis icon or specific icon buttons at the far right of the row. Use `opacity-0 group-hover:opacity-100` to keep the table clean, revealing actions on row hover.

---

## 12. Form Design

- **Labels:** Top-aligned, `text-xs font-semibold text-content-primary mb-1.5`.
- **Inputs:** `rounded-lg border border-border px-3 py-2 text-sm placeholder:text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent`.
- **Validation:** 
  - Error: Red border, red error message below input (`text-xs text-error mt-1`).
  - Required fields: Indicate with a red asterisk `*`.
- **Layout:** Use CSS Grid to organize complex forms into 1-column (mobile) and 2-column (desktop) layouts. Group related fields into distinct `<section>` blocks with their own headers.

---

## 13. Dashboard Guidelines

- **Hierarchy:** Place the most critical KPI cards at the top row.
- **KPI Cards:** Must show the metric value, the label, and a trend indicator (e.g., `+12%` in a green badge with a trending-up arrow).
- **Charts:** Avoid heavy borders or background grids on charts. Use clean tooltips. For Bar charts, consider creative CSS-based stacked bars with rounded corners for a premium feel.
- **Empty Space:** Don't stretch small widgets to fill space. Use appropriate column spans (`col-span-4`, `col-span-8`).

---

## 14. Icon System

- **Library:** `lucide-react` is the absolute standard.
- **Sizing:** `h-4 w-4` for inline text, `h-5 w-5` for standard buttons/sidebar, `h-6 w-6` for prominent actions.
- **Stroke Width:** Maintain default `strokeWidth={2}`.
- **Consistency:** Never mix icon libraries (e.g., do not use FontAwesome alongside Lucide).

---

## 15. Motion System

Animations should feel snappy, deliberate, and never slow down the user.

- **Hover States:** `transition-all duration-200 ease-in-out`.
- **Modals/Drawers:** Use `framer-motion`. Slide in from bottom/side with a subtle spring physics (`type: "spring", damping: 25, stiffness: 300`).
- **Page Transitions:** Keep them instantaneous or use a very fast fade (`duration-150`).
- **Micro-interactions:** Small scale bumps on button clicks (`active:scale-95`).

---

## 16. Responsive Rules

- **Mobile First:** Base classes dictate mobile view.
- **Breakpoints:**
  - `sm` (640px): Large phones / small tablets.
  - `md` (768px): Tablets. Sidebar transitions from drawer to fixed.
  - `lg` (1024px): Laptops. Complex grids split from 1 column to 2/3 columns.
  - `xl` (1280px): Desktop monitors.
- **Tables on Mobile:** Standard tables break on mobile. Use horizontal scrolling (`overflow-x-auto`) for data tables.

---

## 17. Accessibility (A11y)

- **Focus Rings:** Never remove focus outlines without providing a fallback. Default to `focus-visible:ring-2`.
- **Contrast:** Ensure all text passes WCAG AA guidelines (4.5:1 ratio). Watch out for gray-on-gray text.
- **ARIA Labels:** Icon-only buttons MUST have `aria-label` or visually hidden text (`sr-only`).
- **Semantic HTML:** Use `<button>` for actions, `<a>` for navigation, `<nav>` for sidebars, `<main>` for content.

---

## 18. Empty States

Empty states are an opportunity to onboard the user.
- **Visual:** Provide a subtle, muted icon or illustration.
- **Copy:** Clear title ("No invoices found") and helpful subtitle ("Create your first invoice to get started").
- **Action:** Primary button to create the item right there in the empty state.

---

## 19. Data Visualization

- **Colors:** Cycle through brand colors avoiding jarring contrasts. 
  - Category 1: Primary Brand
  - Category 2: Muted Blue
  - Category 3: Emerald
  - Category 4: Amber
- **Tooltips:** Must match the `surface` color with a strong shadow `shadow-lg` and rounded corners.
- **Legends:** Place below or to the right of the chart, using `text-[11px]` font size.

---

## 20. Design Tokens

Future integration points should utilize a token structure compatible with Style Dictionary or Figma Tokens.
Example JSON Structure:
```json
{
  "color": {
    "background": {
      "primary": { "value": "{color.gray.100}" },
      "surface": { "value": "{color.white}" }
    },
    "text": {
      "primary": { "value": "{color.gray.900}" },
      "secondary": { "value": "{color.gray.500}" }
    }
  },
  "spacing": {
    "4": { "value": "16px" },
    "5": { "value": "20px" }
  },
  "radii": {
    "lg": { "value": "8px" },
    "2xl": { "value": "16px" }
  }
}
```

---

## 21. Folder Organization

Maintain strict separation of concerns:
```text
src/
├── components/
│   ├── ui/          # Generic, reusable UI components (Button, Input, Modal)
│   └── feature/     # Domain-specific components (InvoiceTable, UserProfile)
├── layouts/         # Page wrappers (DashboardLayout, AuthLayout)
├── pages/           # Route components
├── styles/          # globals.css, theme variable definitions
├── hooks/           # useTheme, useMediaQuery
├── utils/           # formatters, clsx/tailwind-merge utilities
└── constants/       # Navlinks, static config
```

---

## 22. Naming Convention

- **Components:** PascalCase (e.g., `DataTable.jsx`, `PrimaryButton.jsx`).
- **CSS Variables:** Kebab-case prefixed with property (e.g., `--bg-surface`, `--text-muted`).
- **Utility Classes:** Use tailwind standards. When combining classes dynamically, use `clsx` and `twMerge` via a `cn()` utility.
- **Icons:** Suffix with "Icon" if imported locally to avoid namespace collisions, otherwise use Lucide defaults directly.

---

## 23. Do's and Don'ts

### DO ✅
- **DO** use semantic tailwind classes (`text-content-primary`) instead of raw colors (`text-gray-900`).
- **DO** use `flex` and `gap` for aligning items instead of complex margin math.
- **DO** limit line lengths for readability (`max-w-prose` for long text).
- **DO** use the designated 4px/8px spacing scale exclusively.
- **DO** ensure interactive elements have clear hover and focus states.

### DON'T ❌
- **DON'T** use heavy drop shadows on typography.
- **DON'T** use pure black (`#000000`) or pure gray; always tint grays slightly with the brand color (like slate).
- **DON'T** stack multiple borders on top of each other. Use background colors to separate hierarchy if borders get too noisy.
- **DON'T** use more than two font families. Stick to the primary sans-serif.
- **DON'T** invent new border radii for single components. Stick to the defined scale.

---

## 24. Future Scalability

This system is built for **Multi-tenant SaaS & White-labeling**. 
Because every color, spacing, and font choice relies on CSS variables defined in the `:root`, implementing a new brand theme requires changing only the `globals.css` variable block. 
Components never hardcode specific colors (e.g. `bg-blue-600`), meaning a tenant requiring a red theme simply overwrites `--brand-primary` to a red value, and the entire application safely adapts instantly.

---

## 25. Instructions for AI

> [!CAUTION]
> **CRITICAL AI DIRECTIVE:** 
> When acting as an AI coding assistant generating React components, pages, or layouts for this project, you **MUST STRICTLY OBEY** the rules outlined in this document.
> 
> 1. **NO INVENTING STYLES:** You are strictly forbidden from inventing new colors, shadows, border radii, or spacing scales. You must use the semantic Tailwind configuration and variables defined herein.
> 2. **NO HARDCODED COLORS:** Never use classes like `text-gray-500` or `bg-blue-600`. You must use the semantic equivalents (e.g., `text-content-secondary`, `bg-brand`, `border-border`).
> 3. **USE LUCIDE-REACT:** Always use `lucide-react` for icons. Do not use Heroicons, FontAwesome, or SVGs unless explicitly requested.
> 4. **GEOMETRY & SPACING:** Follow the defined radii (`rounded-2xl` for cards, `rounded-lg` for buttons) and the 4px/8px spacing grid.
> 5. **HIERARCHY:** Maintain the extreme minimalism and data-density philosophy. Use typography (font-weight, size, and text color opacity) rather than heavy borders to separate content.
> 
> Failure to adhere to these design constraints will result in broken UI consistency and rejected code. Treat this document as the absolute architectural law of the frontend.
