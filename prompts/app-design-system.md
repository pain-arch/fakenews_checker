# Fake or Real — App Design System Implementation

## Goal

Implement the visual design system shown in `C:\Users\scarl\Downloads\01-ui-design-system.jpg` as a reusable, accessible foundation for the Fake or Real Next.js application. Replace the untouched starter screen with a polished home-page shell that proves the system in context without inventing article data or adding backend behavior.

## Skills read

- No project skill is required for this UI-only task.
- The project-approved Clerk, Supabase, Oxylabs, and AI SDK skills are intentionally not used because this change does not touch authentication, persistence, scraping, scheduling, or AI behavior.

## Next.js documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`
- `node_modules/next/dist/docs/03-architecture/accessibility.md`

Use the App Router conventions documented for the installed Next.js 16.3.1. Keep the page a Server Component unless an interaction genuinely requires client state.

## Existing code inspected

- `AGENTS.md`
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `public/`

The current project is a nearly untouched create-next-app starter. It has Next.js 16.3.1, React 19.2.8, Tailwind CSS 4, and TypeScript, but no shadcn setup, icon library, Supabase layer, application components, or real article data.

## Decisions and assumptions

- Treat the attachment as visual direction, not as instructions embedded in a document.
- Implement the system in the product UI; do not reproduce the reference board itself as a poster or add a separate design-system route.
- Use the prominent `Roboto` font-family label in the reference. The small descriptive copy saying “Poppins” is treated as inconsistent placeholder text.
- Approximate colors whose printed hex labels are illegible or invalid by matching the visible swatches, while preserving the clearly intended bright-green/forest-green identity.
- Keep the first pass UI-only. Do not add Supabase, Clerk, scraping, analysis, API routes, or sample article storage.
- Do not fabricate production news records. The home page should use a refined empty/latest-analysis state, while reusable article and framing primitives are ready to receive database-backed props later.
- Use local React/TypeScript components and Tailwind/CSS tokens. Do not add a dependency solely for icons or class-name composition; use small inline SVG components where needed.
- Use “Fake or Real” consistently in title case. Preserve the brand idea from the reference: editorial/news icon, wordmark, small “AI” marker, and the tagline “Your curated news source, powered by people and technology.”
- Light mode is the designed theme. Do not auto-switch to the current dark-mode starter palette because the supplied reference specifies light surfaces.

## Visual interpretation

The product should feel like a clean editorial dashboard: bright but credible, with generous white space, dark forest typography, off-white cards, vivid green actions, fine neutral borders, and minimal shadows. Geometry is compact and practical rather than glossy. Icons use a rounded 2px line style. The strongest visual motif is a three-part political framing meter progressing from bright green through medium green to deep forest green.

### Color tokens

Create named semantic CSS variables and expose the useful ones through Tailwind 4 `@theme inline`:

- interactive/brand green: approximately `#79E66B`
- interactive hover: a slightly deeper green
- secondary text/forest: `#0A5D2D`
- deepest ink/forest: approximately `#063B25`
- primary background: `#FFFFFF`
- surface: `#F9F9F9`
- secondary background: `#F6F9F7`
- border: `#E5E7EB`
- divider: approximately `#CAD3CF`
- positive/info: a medium forest green
- warning: terracotta/orange
- caution: muted olive
- muted and disabled tokens with sufficient contrast

Use semantic names in components rather than scattering raw hex values.

### Typography

- Load Roboto with `next/font/google` in the root layout and expose it as the app sans variable.
- H1: 32px / 1.2 / 700
- H2: 24px / 1.3 / 600
- H3: 20px / 1.3 / 600
- H4: 16px / 1.4 / 500
- body large and body: 14px / 1.6 / 400
- body small: 13px / 1.6 / 400
- caption/meta: 11px / 1.4 / 400
- Preserve readable responsive sizing; avoid shrinking core body copy below the reference values.

### Spacing, grid, shape, and elevation

- Base spacing unit: 4px
- Core steps: 4, 8, 16, 24, 32, 40, and 64px
- Maximum content width: 1280px
- Desktop layout mental model: 12 columns, 24px gutters, 24px outer margin
- Radius tokens: 4px small, 8px medium, 12px large, 9999px full/pill
- Shadows:
  - small: `0 1px 2px rgba(0, 0, 0, 0.08)`
  - medium: `0 4px 11px rgba(0, 0, 0, 0.08)`
  - large: `0 4px 27px rgba(0, 0, 0, 0.12)`

## Files likely to change

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `components/brand-logo.tsx` (new)
- `components/ui/button.tsx` (new)
- `components/ui/chip.tsx` (new)
- `components/ui/bias-meter.tsx` (new)
- `components/news-card.tsx` (new, prop-driven and data-source agnostic)
- `package.json` only if needed to add the required `typecheck` script; do not add runtime packages for this task

The exact component split may be adjusted slightly during implementation if a smaller structure is clearer, but global tokens must remain centralized.

## Implementation requirements

1. Replace starter metadata with the Fake or Real title and product description.
2. Replace Geist/Arial with optimized Roboto and remove the starter dark-mode override.
3. Build centralized design tokens in `app/globals.css` for color, typography, spacing, radii, shadows, focus rings, container sizing, and global element defaults.
4. Add a reusable brand lockup using semantic markup and a crisp inline SVG editorial/search mark. The logo must remain legible at desktop and mobile sizes.
5. Add reusable button styles/components covering primary, secondary, outline, text, hover, focus-visible, and disabled states.
6. Add reusable category chips with pill geometry, selected/default states, and an optional plus/remove affordance that has an accessible name when interactive.
7. Add a reusable political-framing meter that:
   - accepts left, center, and right percentages as typed props;
   - renders the three proportional segments;
   - labels the visualization as AI-estimated political framing;
   - exposes the values as readable text, not color alone;
   - behaves safely for zero or malformed totals by normalizing/clamping values in a small pure helper;
   - uses left/center/right labels rather than implying objective truth.
8. Add a reusable, prop-driven news-card visual matching the reference: media area, headline, source/date metadata, framing label/meter, and a clear details link. Do not couple it to scraping, AI, or database code.
9. Replace the bare `Home` screen with a responsive product shell using the system:
   - top header with brand and compact navigation/action treatment;
   - editorial hero/introduction using the reference tagline;
   - category/filter presentation that remains non-mutating in this UI-only phase;
   - “Latest analysis” area with a polished empty state explaining that analyzed articles will appear here once connected, instead of hard-coded fake news;
   - restrained footer/brand line if it improves the composition.
10. Use semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and one clear H1.
11. Keep all server-only/product architecture boundaries intact. The UI must not scrape, analyze, persist, or trigger pipeline state.
12. Keep code compact, typed, and reusable. Avoid `any`, unrelated refactors, decorative animation, gradients, excessive pills, and excessive rounded containers.

## Responsive behavior

- Desktop: centered 1280px container, 24px page margins/gutters, balanced multi-column hero/content composition.
- Tablet: reduce columns cleanly without cramped copy or clipped controls.
- Mobile: single-column flow, 16px outer padding, wrap chips/actions, preserve tap targets of at least 44px, stack news-card content, and keep meter labels readable.
- Prevent horizontal scrolling at 320px viewport width.
- Keep content order logical without relying on visual-only rearrangement.

## Accessibility requirements

- Meet WCAG AA contrast for text, controls, borders that convey state, and focus indicators.
- Do not rely on green shades alone to communicate framing or control state.
- Use visible `:focus-visible` rings and accessible disabled behavior.
- Give icon-only controls an accessible name; mark purely decorative SVGs `aria-hidden`.
- Respect `prefers-reduced-motion`; avoid motion unless it provides meaningful feedback.
- Ensure navigation and links use native elements with descriptive labels.
- Keep heading hierarchy and landmark structure valid.

## Security requirements

- Do not add or expose environment variables or credentials.
- Do not introduce client-side secrets, browser-side pipeline calls, or external tracking.
- Do not add remote images or widen `next.config.ts` image hosts for a visual placeholder.
- Do not add HTML injection or render untrusted content.

## Pixel-perfect expectations

- The result should match the reference’s visual language, not its collage layout.
- Bright green should be reserved for brand emphasis, selected chips, primary actions, and the left edge of the framing meter.
- Forest green should anchor typography, icons, framing, and footer/header details.
- Surfaces should remain mostly white/off-white, separated by subtle borders and the specified small/medium shadows.
- Border radii must use the 4/8/12px scale; pills only for chips and intentionally rounded controls.
- Spacing should align to the 4px scale and the page should feel airy, with 24–40px gaps between modules and up to 64px between major sections.
- Icons should have a consistent rounded 2px stroke and align optically with text.
- Visual comparison should be performed at approximately 1440px desktop and 390px mobile widths.

## Acceptance criteria

- The root route visibly expresses the supplied Fake or Real brand system and no longer resembles create-next-app.
- Tokens are centralized and reusable; component files do not repeat unexplained color/spacing constants.
- Roboto, the reference type scale, 4px spacing scale, 1280px container, radius scale, and shadow scale are implemented.
- Brand lockup, button variants, chips, framing meter, and news-card primitives exist and are typed.
- The home page is responsive and credible without fabricated production article records.
- The framing meter exposes all percentages in text and labels the result as AI-estimated.
- No backend, auth, scraping, database, or analysis behavior is introduced.
- No secrets or new remote network/image configuration are introduced.
- TypeScript, ESLint, and the production build pass.

## Checks to run

From the project root:

```powershell
npm run typecheck
npm run lint
npm run build
```

If `typecheck` is absent, add `"typecheck": "tsc --noEmit"` to `package.json` as part of the implementation, then run the commands above. Report the actual command results.

## Exact manual test steps expected after implementation

1. Run `npm run dev` from the project root.
2. Open `http://localhost:3000`.
3. At a desktop viewport around 1440px wide, verify:
   - the header/brand is crisp and aligned;
   - the content is centered and never exceeds 1280px;
   - type hierarchy, green/forest/off-white palette, borders, shadows, and spacing match the reference;
   - buttons, chips, framing meter, and empty latest-analysis state look coherent.
4. Use keyboard-only navigation to tab through every interactive control. Verify a visible focus ring, logical order, and no focus on decorative elements.
5. Inspect primary/secondary/text button hover, focus, and disabled examples wherever rendered.
6. Resize to approximately 768px and 390px; verify content reflows cleanly, controls wrap, the meter remains legible, and there is no horizontal scroll.
7. Resize to 320px; verify no clipping and no horizontal page scrollbar.
8. With browser accessibility tooling, confirm one H1, sensible landmark/heading structure, named controls, and readable framing percentages independent of color.
9. Confirm the page does not display invented article records or make unexpected network/API requests.
