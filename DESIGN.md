---
name: Academic Intelligence
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#bdc7d9'
  on-secondary: '#27313f'
  secondary-container: '#404a59'
  on-secondary-container: '#afb9cb'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  sidebar-width: 260px
  card-padding: 20px
  table-cell-padding: 12px 16px
---

## Brand & Style

This design system is engineered for efficiency, clarity, and authority in educational data management. The brand personality is **Professional, Analytical, and Focused**, catering to educators and administrators who require immediate insight into student performance.

The visual style is **Corporate / Modern**, heavily influenced by high-density dashboard patterns. It utilizes a sophisticated dark theme to reduce eye strain during prolonged use, while using vibrant primary accents to draw attention to critical actions and data points. The interface relies on a structured, systematic approach to information density, ensuring that complex grade sets and statistics remain legible and actionable.

## Colors

The palette is optimized for a high-contrast dark mode environment.

- **Primary:** A vibrant blue used for call-to-action buttons, active navigation states, and primary data highlights.
- **Surface & Background:** A deep navy/slate hierarchy. `#111827` (Darkest) is used for page backgrounds, while `#1F2937` (Lighter) is used for cards, sidebars, and header elements to create depth.
- **Semantic States:** 
    - **Success (Green):** Passing grades, positive attendance, and completed tasks.
    - **Warning (Orange):** At-risk grades, pending submissions, or borderline performance.
    - **Error (Red):** Failing grades, critical alerts, or overdue assignments.
- **Typography:** Pure white or off-white for primary headings to ensure maximum readability against the dark background, with medium grays for supporting text and metadata.

## Typography

This design system utilizes **Inter** across all levels to maintain a clean, utilitarian aesthetic that prioritizes legibility in data-dense environments.

- **Scale:** The hierarchy is tight. For data tables and dashboards, `body-md` is the primary workhorse font.
- **Hierarchy:** Use `headline-lg` sparingly for page titles. `label-md` with uppercase styling is reserved for table headers and sidebar category labels to provide clear structural breaks.
- **Numbers:** Since this is a grade management system, ensure tabular lining figures are used for grades and statistics to maintain alignment in vertical columns.

## Layout & Spacing

The layout follows a **Fixed Sidebar + Fluid Content** model. 

- **Grid:** A 12-column fluid grid system is used for the main content area. Statistics cards typically span 3 columns on desktop, while data tables span the full 12 columns.
- **Rhythm:** An 8px/4px base grid ensures consistent vertical rhythm.
- **Breakpoints:**
    - **Desktop (1024px+):** Sidebar is permanently expanded; 24px margins.
    - **Tablet (768px - 1023px):** Sidebar collapses to icons-only; 16px margins.
    - **Mobile (<767px):** Sidebar becomes a hidden drawer; content stacks vertically; margins reduce to 12px.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to maintain a sleek, modern professional look.

- **Level 0 (Background):** `#111827` - The canvas.
- **Level 1 (Cards/Sidebar):** `#1F2937` - Elevated slightly through color contrast. These elements should use a subtle 1px border of `#374151` to define their edges.
- **Level 2 (Modals/Popovers):** `#374151` - Highest elevation. These use a soft, diffused ambient shadow (Color: `#000000`, Opacity: 30%, Blur: 10px) to separate them from the dashboard background.
- **Interactive States:** Hover states on table rows or navigation items should use a subtle background tint (`#374151` or primary blue at 10% opacity) rather than changing elevation.

## Shapes

The shape language is **Rounded (8px base)**, striking a balance between the clinical nature of data and the approachability of a modern SaaS tool.

- **Standard Elements:** Buttons, input fields, and cards use `rounded` (8px).
- **Large Elements:** Modals and large containers use `rounded-lg` (16px).
- **Small Elements:** Status indicators (pills) and checkboxes use `rounded-sm` (4px) or full `pill` (999px) for status badges to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#3B82F6` with white text. High emphasis.
- **Secondary:** Ghost style with `#374151` border and white text.
- **Destructive:** Solid `#EF4444` for "Delete" or "Withdraw" actions.

### Data Tables
- **Header:** Background `#374151`, text `label-md` (uppercase grays).
- **Rows:** Background `#1F2937` with a 1px bottom border `#374151`. Row height should be comfortable (approx 56px).
- **Cells:** Grades should be highlighted using semantic text colors (Success/Warning/Error).

### Statistics Cards
- Compact containers showing "GPA," "Attendance Rate," or "Total Credits."
- Include a small trend indicator (sparkline or percentage) in the bottom corner using semantic colors.

### Input Fields
- Dark background (`#111827`), subtle border (`#374151`), and a 2px blue glow on focus.
- Placeholder text in `#6B7280`.

### Navigation (Sidebar)
- Active state: Background tint of primary blue (10%) with a solid 4px primary blue left-border indicator.
- Iconography: Stroke-based, 20px size, using a medium gray that turns white on hover.