---
name: html-implement
description: Use when creating a new HTML file, editing an existing HTML file, applying CSS utility/component patterns, or changing vanilla HTML/CSS/JS UI while minimizing token-heavy rewrites.
---

# HTML Implement

Use this skill for standalone HTML work: creating new HTML files, editing existing HTML files, applying CSS patterns, or making small vanilla HTML/CSS/JS changes without rewriting large files.

## Core Rules

- Read `css-patterns.md` in this skill folder before adding or changing HTML/CSS.
- Reuse existing CSS variables, utilities, and component classes from `css-patterns.md`; do not invent new custom variables when an existing token covers the need.
- For existing HTML files, never rewrite the whole file and never paste long CSS blocks when a pattern class already exists.
- Use targeted replacements only. In environments with `str_replace`, use `str_replace`; in Codex, use minimal `apply_patch` hunks that behave like targeted string replacements.
- Prefer class names such as `.btn-primary`, `.badge-green`, `.table`, `.table-wrap`, `.card`, `.input`, `.field`, and `.alert-success` over restating their CSS.
- When the request includes a `<SPEC>` and code is created or edited, include a SPEC disclosure block either at the top of the file as a comment block when appropriate, or in the final result report.
- When creating specs or implementation plans, write full HTML documents and reuse CSS variables/classes from `css-patterns.md`; never save new project specs/plans as Markdown unless the user explicitly overrides this rule.

## When To Use

| Situation | Required Workflow |
|---|---|
| Create a new standalone HTML file | Workflow A |
| Edit, extend, or restyle an existing HTML file | Workflow B |
| Only adjust layout/style in HTML | Workflow B plus `css-patterns.md` class reuse |

## Workflow A - Create New HTML

1. Read `css-patterns.md`.
2. Identify the main layout: sidebar + content, full-width, centered, dashboard, or another explicit structure from the user.
3. Identify required components from `css-patterns.md`: button, card, form input, badge, table, modal, alert, sidebar, animation, dark mode, and breakpoint utilities.
4. Write a complete HTML document with:
   - `<!DOCTYPE html>`
   - `<html lang="vi">` unless the user requests another language
   - `<meta charset="UTF-8">`
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - a meaningful `<title>`
   - only the font links actually used
5. Include CSS in this order:
   - CSS variables copied as the smallest needed subset from `css-patterns.md`
   - reset/base styles from `css-patterns.md`
   - only utilities/component patterns used by the file
   - page-specific styles last
6. Use mobile-first CSS. Add desktop rules with media queries only when needed.
7. Use vanilla JS unless the user explicitly asks for a library.
8. Keep vanilla JS separated into state, render functions, and event binding.

### New HTML Skeleton

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <style>
    /* 1. CSS variables: subset from css-patterns.md */
    :root { }

    /* 2. Reset/base from css-patterns.md */

    /* 3. Layout utilities used by this page */

    /* 4. Component styles reused from css-patterns.md */

    /* 5. Page-specific styles */
  </style>
</head>
<body>
  <main>
  </main>
  <script>
    const state = {};

    function render() {
    }

    function bindEvents() {
    }

    document.addEventListener('DOMContentLoaded', () => {
      render();
      bindEvents();
    });
  </script>
</body>
</html>
```

## Workflow B - Edit Existing HTML

1. Read `css-patterns.md` first.
2. Read the current HTML file before editing.
3. Identify existing CSS variables, utility classes, component classes, and JS state/render/event patterns.
4. Make only the necessary targeted replacements:
   - Add a component by inserting markup at the exact location.
   - Add existing pattern classes directly to HTML.
   - Add new CSS only to the page-specific style section.
   - Modify JS inside the specific function or event binding that needs the change.
5. Do not rewrite the entire file.
6. Do not duplicate CSS from `css-patterns.md` when class reuse is enough.
7. Use one replacement hunk per logical change.

## Required SPEC Disclosure

When a task includes a `<SPEC>` and the implementation creates or edits code, include the following four items. Prefer the final result report for existing project files where adding a header comment would be noisy or inconsistent. Use a top-of-file comment block only when it fits the file type and local style.

```html
<!--
SPEC Disclosure
Autonomous Decisions: Decisions made to complete the product that were not explicitly stated in <SPEC>.
Deviations: Requirements changed or adjusted from the original <SPEC>, with reasons.
Trade-offs: Alternatives considered and why this implementation was chosen.
Context/Notes: Risks, structure notes, extension guidance, or operational notes.
-->
```

Never omit these headings for `<SPEC>` code tasks, even when the answer is short. If there were no deviations or trade-offs, write `None` and keep the heading.

## CSS Rules

- Use `var(--...)` for colors, spacing, radius, shadows, transitions, and layout tokens when a token exists.
- Do not add hardcoded color or spacing values unless the value is truly page-specific and no token fits.
- Keep specificity low; avoid `!important` and selectors deeper than three levels.
- If a pattern exists in `css-patterns.md`, use the class in HTML instead of writing equivalent CSS.
- If a page-specific style is required, add it under a page-specific section and include a short reason comment.
- If a component needs an override, use a context selector instead of changing the base class.

```css
/* Good: context override */
.sidebar .btn { width: 100%; }
```

## Vanilla JS Rules

- Use vanilla JS by default.
- Separate state, render, and event binding.
- Avoid `innerHTML` with user input; use `textContent` or `createElement`.
- Bind behavior through `data-*` attributes where practical.
- Prevent duplicate event listeners after re-render.
- Handle empty, loading, and error states when the UI fetches or mutates data.

```js
const state = { items: [], filter: 'all' };

function render() {
  // Re-render from state.
}

function handleAction(event) {
  // Update state, then call render().
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', handleAction);
  });
}
```

## Token-Saving Cheatsheet

| Instead of writing | Say/use |
|---|---|
| Button color, radius, padding, hover CSS | `.btn .btn-primary` from `css-patterns.md` |
| Success label CSS | `.badge .badge-green` from `css-patterns.md` |
| Table borders, header background, row hover | `.table-wrap` + `.table` from `css-patterns.md` |
| Card surface, border, radius, shadow | `.card`, `.card-header`, `.card-footer` |
| Form input styling | `.field`, `.label`, `.input`, `.hint` |

## Example: Simple New HTML Dashboard

Use this shape when the user asks for a small standalone dashboard and no framework is required. Keep only the CSS variables and patterns that the page actually uses.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-bg: #fff; --color-surface: #f5f5f5; --color-border: #e0e0e0;
      --color-text: #1a1a1a; --color-muted: #6b7280; --color-accent: #2563eb;
      --sp-2: .5rem; --sp-3: .75rem; --sp-4: 1rem; --sp-6: 1.5rem;
      --r-md: 8px; --r-lg: 12px; --t-base: 250ms ease;
      --shadow-sm: 0 1px 2px rgba(0,0,0,.06); --shadow-md: 0 4px 12px rgba(0,0,0,.1);
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; }
    .main { flex: 1; padding: var(--sp-6); }
    /* Reuse from css-patterns.md: .card, .btn, .btn-primary, .badge, .table, .table-wrap */
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar"></aside>
    <main class="main">
      <section class="card">
        <div class="card-header">
          <h1>Danh sách</h1>
          <button class="btn btn-primary btn-sm" type="button">+ Thêm</button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Tên</th><th>Trạng thái</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
  <script>
    const state = { items: [] };

    function render() {
    }

    document.addEventListener('DOMContentLoaded', render);
  </script>
</body>
</html>
```

## Pre-Output Checklist

### HTML
- [ ] `lang` attribute matches content language.
- [ ] Viewport meta is present.
- [ ] Semantic heading hierarchy is correct (`h1` -> `h2` -> `h3`).
- [ ] Meaningful images have `alt` text.
- [ ] Form controls have matching labels.

### CSS
- [ ] Existing classes, variables, and component patterns from `css-patterns.md` are reused.
- [ ] No duplicated long CSS blocks from existing patterns.
- [ ] No invented custom variables when existing tokens fit.
- [ ] Responsive behavior is checked at 375px and 1280px.
- [ ] Dark mode tokens are preserved when present.

### JS
- [ ] State, render, and events remain separated.
- [ ] No stale `console.log`.
- [ ] Event listeners are not duplicated by re-rendering.
- [ ] Empty, loading, and error states are handled when relevant.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Rewriting an existing HTML file to add one component | Use targeted replacement at the insertion point |
| Creating `--primary-blue` when `--color-accent` exists | Reuse `--color-accent` |
| Rewriting `.btn-primary` CSS in the page | Add `class="btn btn-primary"` |
| Adding table CSS manually | Use `.table-wrap` and `.table` |
| Mixing JS state changes directly into event handlers with DOM updates everywhere | Update state, call `render()`, keep binding separate |
