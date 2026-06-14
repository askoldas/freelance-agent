# UI and Styling

## Styling rule

Use custom CSS only.

Allowed:

- global CSS for resets, tokens, typography, and application-wide foundations;
- CSS Modules for page and component styles;
- CSS custom properties for colors, spacing, typography, radii, shadows, and layout values;
- semantic class names;
- native CSS features such as grid, flexbox, container queries, and media queries.

Do not use:

- Tailwind CSS;
- utility-first CSS frameworks;
- Bootstrap;
- Material UI;
- Chakra UI;
- shadcn/ui as a styling system;
- styled-components or another CSS-in-JS framework unless explicitly approved later;
- large component libraries that dictate the visual language.

## UI direction

The product is an internal professional tool, not a generic admin-template demo.

The interface should feel:

- clear;
- calm;
- practical;
- information-dense without being cramped;
- easy to scan during daily project review.

Prefer:

- a restrained neutral palette;
- clear score and status hierarchy;
- readable project cards and tables;
- strong source links and primary actions;
- responsive layouts;
- accessible focus states;
- consistent spacing and typography tokens.

## CSS organization

Recommended structure:

```text
src/app/globals.css
src/styles/tokens.css
src/styles/reset.css
src/components/<Component>/<Component>.module.css
```

Avoid giant global stylesheets containing component-specific rules.

## Initial dashboard scope

The first implementation may include a minimal operational page showing:

- recent discovered opportunities;
- score, recommendation, category, source, and discovery time;
- search-run status;
- a manual search trigger for development;
- empty, loading, and error states.

This page should be functional and intentionally styled with custom CSS, but it does not need a polished marketing-site design.
