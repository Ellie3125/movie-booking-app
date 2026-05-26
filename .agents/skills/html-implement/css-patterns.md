# CSS Patterns Reference
<!-- Dùng file này khi EDIT HTML để tránh mô tả lại CSS từ đầu. -->

## Reset & Base
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; }
body { min-height: 100vh; line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, video { max-width: 100%; display: block; }
input, button, textarea, select { font: inherit; }
```

## CSS Variables (design tokens)
```css
:root {
  /* Colors */
  --color-bg:        #ffffff;
  --color-surface:   #f5f5f5;
  --color-border:    #e0e0e0;
  --color-text:      #1a1a1a;
  --color-muted:     #6b7280;
  --color-accent:    #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-danger:    #dc2626;
  --color-success:   #16a34a;

  /* Typography */
  --font-sans:   'Inter', system-ui, sans-serif;
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace;
  --text-xs:     0.75rem;   /* 12px */
  --text-sm:     0.875rem;  /* 14px */
  --text-base:   1rem;      /* 16px */
  --text-lg:     1.125rem;  /* 18px */
  --text-xl:     1.25rem;   /* 20px */
  --text-2xl:    1.5rem;    /* 24px */
  --text-3xl:    1.875rem;  /* 30px */
  --text-4xl:    2.25rem;   /* 36px */

  /* Spacing (4px grid) */
  --sp-1: 0.25rem;   --sp-2: 0.5rem;    --sp-3: 0.75rem;
  --sp-4: 1rem;      --sp-6: 1.5rem;    --sp-8: 2rem;
  --sp-10: 2.5rem;   --sp-12: 3rem;     --sp-16: 4rem;

  /* Radius */
  --r-sm: 4px;   --r-md: 8px;   --r-lg: 12px;   --r-xl: 16px;   --r-full: 9999px;

  /* Shadow */
  --shadow-sm:  0 1px 2px rgba(0,0,0,.06);
  --shadow-md:  0 4px 12px rgba(0,0,0,.1);
  --shadow-lg:  0 8px 24px rgba(0,0,0,.12);

  /* Transition */
  --t-fast:   150ms ease;
  --t-base:   250ms ease;
  --t-slow:   400ms ease;

  /* Layout */
  --container: 1200px;
  --sidebar:   260px;
}
```

## Layout Utilities
```css
/* Flex */
.flex        { display: flex; }
.flex-col    { display: flex; flex-direction: column; }
.items-center{ align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center  { justify-content: center; }
.gap-1  { gap: var(--sp-1); }  .gap-2  { gap: var(--sp-2); }
.gap-4  { gap: var(--sp-4); }  .gap-6  { gap: var(--sp-6); }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }

/* Grid */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-4); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); }
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

/* Container */
.container { max-width: var(--container); margin: 0 auto; padding: 0 var(--sp-6); }
```

## Component Patterns

### Button
```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--sp-2); padding: var(--sp-2) var(--sp-4);
  font-size: var(--text-sm); font-weight: 500;
  border: none; border-radius: var(--r-md); cursor: pointer;
  transition: background var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast);
  white-space: nowrap; user-select: none;
}
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--color-accent); color: #fff; }
.btn-primary:hover { background: var(--color-accent-hover); box-shadow: var(--shadow-sm); }
.btn-outline { background: transparent; color: var(--color-accent); border: 1.5px solid var(--color-accent); }
.btn-outline:hover { background: var(--color-accent); color: #fff; }
.btn-ghost { background: transparent; color: var(--color-text); }
.btn-ghost:hover { background: var(--color-surface); }
.btn-sm { padding: var(--sp-1) var(--sp-3); font-size: var(--text-xs); }
.btn-lg { padding: var(--sp-3) var(--sp-6); font-size: var(--text-base); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
```

### Card
```css
.card {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--r-lg); padding: var(--sp-6);
  box-shadow: var(--shadow-sm); transition: box-shadow var(--t-base);
}
.card:hover { box-shadow: var(--shadow-md); }
.card-header { border-bottom: 1px solid var(--color-border); padding-bottom: var(--sp-4); margin-bottom: var(--sp-4); }
.card-footer { border-top: 1px solid var(--color-border); padding-top: var(--sp-4); margin-top: var(--sp-4); }
```

### Form Input
```css
.input {
  width: 100%; padding: var(--sp-2) var(--sp-3);
  font-size: var(--text-sm); color: var(--color-text);
  background: var(--color-bg); border: 1.5px solid var(--color-border);
  border-radius: var(--r-md); outline: none;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}
.input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
.input::placeholder { color: var(--color-muted); }
.input-error { border-color: var(--color-danger); }
.label { display: block; font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--sp-1); color: var(--color-text); }
.field { display: flex; flex-direction: column; gap: var(--sp-1); }
.hint  { font-size: var(--text-xs); color: var(--color-muted); }
```

### Badge / Tag
```css
.badge {
  display: inline-flex; align-items: center;
  padding: 2px var(--sp-2); font-size: var(--text-xs); font-weight: 500;
  border-radius: var(--r-full); line-height: 1.6;
}
.badge-blue    { background: #dbeafe; color: #1e40af; }
.badge-green   { background: #dcfce7; color: #166534; }
.badge-red     { background: #fee2e2; color: #991b1b; }
.badge-yellow  { background: #fef9c3; color: #854d0e; }
.badge-gray    { background: var(--color-surface); color: var(--color-muted); }
```

### Table
```css
.table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--r-lg); }
.table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.table th { background: var(--color-surface); font-weight: 600; text-align: left; }
.table th, .table td { padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--color-border); }
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: var(--color-surface); }
```

### Modal / Overlay
```css
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  padding: var(--sp-4); z-index: 100;
  opacity: 0; pointer-events: none; transition: opacity var(--t-base);
}
.overlay.open { opacity: 1; pointer-events: all; }
.modal {
  background: var(--color-bg); border-radius: var(--r-xl);
  padding: var(--sp-8); width: 100%; max-width: 520px;
  box-shadow: var(--shadow-lg); transform: translateY(12px);
  transition: transform var(--t-base);
}
.overlay.open .modal { transform: translateY(0); }
```

### Toast / Alert
```css
.alert {
  display: flex; align-items: flex-start; gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md);
  font-size: var(--text-sm); border-left: 3px solid;
}
.alert-info    { background: #eff6ff; border-color: var(--color-accent); color: #1e40af; }
.alert-success { background: #f0fdf4; border-color: var(--color-success); color: #166534; }
.alert-warning { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
.alert-error   { background: #fef2f2; border-color: var(--color-danger); color: #991b1b; }
```

### Navigation / Sidebar
```css
.sidebar {
  width: var(--sidebar); height: 100vh; position: sticky; top: 0;
  background: var(--color-bg); border-right: 1px solid var(--color-border);
  display: flex; flex-direction: column; overflow-y: auto; padding: var(--sp-4);
}
.nav-item {
  display: flex; align-items: center; gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md);
  font-size: var(--text-sm); color: var(--color-muted);
  text-decoration: none; cursor: pointer; transition: all var(--t-fast);
}
.nav-item:hover  { background: var(--color-surface); color: var(--color-text); }
.nav-item.active { background: #eff6ff; color: var(--color-accent); font-weight: 500; }
```

## Animation Snippets
```css
/* Fade in */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation: fadeIn var(--t-base) ease forwards; }

/* Slide up */
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.slide-up { animation: slideUp var(--t-slow) ease forwards; }

/* Spin (loader) */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 20px; height: 20px; border: 2px solid var(--color-border);
  border-top-color: var(--color-accent); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Pulse skeleton */
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
.skeleton { background: var(--color-surface); border-radius: var(--r-sm); animation: pulse 1.5s ease infinite; }
```

## Dark Mode (media or class toggle)
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:      #0f172a;
    --color-surface: #1e293b;
    --color-border:  #334155;
    --color-text:    #f1f5f9;
    --color-muted:   #94a3b8;
  }
}
/* Or via .dark class on <html> */
.dark {
  --color-bg:      #0f172a;
  --color-surface: #1e293b;
  --color-border:  #334155;
  --color-text:    #f1f5f9;
  --color-muted:   #94a3b8;
}
```

## Responsive Breakpoints
```
xs:  < 480px   (mobile portrait)
sm:  480–767px (mobile landscape)
md:  768–1023px (tablet)
lg:  1024–1279px (desktop)
xl:  ≥ 1280px  (wide)
```
```css
/* Usage */
@media (max-width: 767px)  { /* mobile  */ }
@media (max-width: 1023px) { /* tablet  */ }
@media (min-width: 1280px) { /* wide    */ }
```
