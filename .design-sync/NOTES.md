# Design Sync Notes — @bf-suma/ui

## Package structure

- This is a Next.js e-commerce app, NOT a standalone design system repo.
- UI primitives were extracted from `src/components/ui/` into `packages/ui/`.
- The package uses tsup for bundling and Tailwind CSS for styling.
- Entry: `packages/ui/dist/index.mjs` (ESM) / `packages/ui/dist/index.js` (CJS).
- CSS: `packages/ui/dist/styles.css` (compiled Tailwind with all brand tokens).

## Build steps

1. `cd packages/ui && npm install` (installs tsup, tailwindcss, etc.)
2. `npm run build` (tsup builds JS + .d.ts)
3. `npx tailwindcss -i src/styles.css -o dist/styles.css --minify` (compiles CSS)

All three are combined in `buildCmd` in config.json.

## Components (13 total)

- **Badge** — variant: neutral/success/warning/danger/info
- **Button** — variant: primary/secondary/ghost/danger; size: sm/md/lg; isLoading
- **Card** — simple container with border + shadow
- **EmptyState** — dashed border card with title, description, optional action button
- **Input** — forwardRef input with focus ring
- **LoadingState** — inline loading indicator with label
- **Modal** — dialog overlay with title, close button, ESC key support
- **SectionHeader** — title + optional description + optional action slot
- **Select** — forwardRef select with ChevronDown icon (lucide-react)
- **Spinner** — animated border spinner, size: sm/md
- **Textarea** — forwardRef textarea with focus ring
- **Toast/ToastProvider/useToast** — toast notification system with success/error/info variants

## Dependencies

- `clsx` + `tailwind-merge` for className merging (`cn()` utility)
- `lucide-react` for the Select chevron icon
- `react` / `react-dom` as peer deps

## Brand tokens (Tailwind config)

- `brand-500`: #1E9E5A (primary green)
- `sky-500`: #00aadb (blue accent)
- `earth-500`: #f48132 (orange)
- `accent-sun`: #f9a533, `accent-berry`: #ec297b
- `surface-50`: #f7f6f2 (page background)
- `status-*`: success/warning/danger/info
- Shadows: `soft`, `card`
- Border radius: sm=0.5rem, md=0.75rem, lg=1rem

## Gotchas

- No Storybook exists — this is the package shape.
- Toast component uses `createPortal` and needs browser DOM — previews may need a provider wrapper for it.
- Modal uses `useId()` — React 18+ only.
- The `cn()` utility is exported but is a helper, not a component — exclude from component list if it appears.
- Font: Ubuntu (loaded by the Next.js app via `next/font`, NOT shipped by this package). Set `runtimeFontPrefixes: ["Ubuntu"]` if font-missing warns appear.

## Re-sync risks

- Tailwind classes are compiled from component source — adding new utility classes to components requires rebuilding CSS.
- `lucide-react` version changes could affect the Select chevron icon.
- If the main app's UI components diverge from this extracted package, they'll need manual re-sync.
