# SKILLS.md

## Workflow Skills

Location:
.agents/skills/workflow/

Use these skills during development:

### brainstorming

Use before:

* major features
* architecture changes
* schema redesigns
* large UI redesigns

Requirements:

* analyze current code first
* provide options/tradeoffs
* avoid coding immediately

---

### writing-plans

Use before:

* multi-file modifications
* backend/frontend synchronization
* complex feature implementation

Requirements:

* clear steps
* affected files
* no vague TODOs
* actionable implementation plan

---

### systematic-debugging

Use when:

* runtime errors
* API bugs
* state issues
* rendering problems

Requirements:

* reproduce issue
* inspect logs/errors
* identify root cause
* verify final fix

---

### test-driven-development

Use mainly for:

* booking logic
* payment logic
* seat selection logic
* critical backend services

Flow:

1. failing test
2. minimal implementation
3. refactor safely

---

### verification-before-completion

Use before finishing any task.

Verify:

* build
* lint
* runtime
* responsive behavior
* regressions

---

### requesting-code-review

Use before:

* merge
* release
* large commits

Check:

* maintainability
* consistency
* performance
* readability
* regressions

---

## Part 1: Backend Skills

### be-core

Location: `.agents/skills/be-core/`

Use for:

* setting up backend structure
* creating app/server bootstrap
* defining MVC layers (Model, Service, Controller, Route)
* configuring database or environment
* creating standard middlewares (error, notFound)

Requirements:

* follow strict MVC separation
* use standardized response formats
* keep logic in services
* use asyncHandler for all async operations

---

---

## Part 2 & 3: Frontend & Mobile Skills

### ui-ux-pro-max

Location: `.agents/skills/ui-ux-pro-max/`

Use for:

* admin dashboard
* booking flow
* seat layout editor
* modals/forms
* statistics pages
* mobile screens

---

## UI/UX Expectations

Apply:

* premium modern design
* spacing consistency
* typography hierarchy
* smooth micro interactions
* responsive layouts
* reusable components

Avoid:

* default styling
* inconsistent spacing
* cluttered interfaces
* oversized components

---

## Design Rules

Use:

* proper spacing scale
* consistent border radius
* soft shadows
* subtle animations
* clear visual hierarchy

Animation:

* 150ms–300ms preferred
* use transform/opacity
* avoid heavy repaint animations

Accessibility:

* proper contrast
* touch targets >= 44x44
* readable typography
