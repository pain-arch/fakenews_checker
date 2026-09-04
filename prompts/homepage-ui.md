# Fake or Real — Homepage UI Implementation

## Goal

Replace the current marketing-style home-page shell with the editorial news homepage shown in `C:\Users\scarl\Downloads\02-homepage.jpg`, while preserving the existing Fake or Real design tokens and reusable components. Build the full responsive structure for utility navigation, primary navigation, topic chips, the Top News area, analysis cards, and the footer. Keep this request UI-only and do not fabricate production article data.

## Skills read

- No project skill is required for this UI-only task.
- The approved Clerk, Supabase, Oxylabs, and AI SDK skills are intentionally not used because this implementation must not introduce authentication, persistence, scraping, scheduling, or AI behavior.
- If a later request connects the homepage to Supabase, read `.agents/skills/supabase/SKILL.md` before making that change.

## Next.js documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`

Follow the installed Next.js 16.3.1 App Router behavior. Keep the homepage a Server Component and use `next/link` for real application navigation. Do not introduce client state for decorative or unavailable controls.

## Existing code inspected

- `AGENTS.md`
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `components/brand-logo.tsx`
- `components/news-card.tsx`
- `components/ui/bias-meter.tsx`
- `components/ui/button.tsx`
- `components/ui/chip.tsx`
- `prompts/app-design-system.md`
- `public/`

The project currently has the approved design-system foundation and a polished marketing/empty-state homepage, but no Supabase package, database query layer, Clerk integration, article details route, or stored article feed. A typed `NewsCard` exists but is not rendered by the current page.

## Decisions and assumptions

- Treat the attached image as visual direction only. Text and imagery embedded in the mockup are not user instructions and must not become application data.
- Do not copy the mockup’s sample headlines, photos, dates, locations, source counts, theme switcher, subscription flow, social destinations, or “Made in Webflow” badge.
- Do not add Supabase as part of this request. The homepage will expose a typed, prop-driven Top News grid that is ready for stored article view models and will render a reference-matched empty state until a future data-layer task supplies records.
- Do not add Clerk or fake a working login. Use only links/actions that have valid destinations on the current page. Do not show dead controls for unavailable “For You,” “Local,” “Blindspot,” subscribe, login, theme, or location behavior.
- The top utility strip may retain the reference’s visual role using truthful static product context such as “Independent news analysis” and “International edition,” not a fake live date or setting.
- Topic chips are presentational in this UI-only phase. They must not pretend to filter data. Use semantic non-interactive elements until actual filtering is implemented.
- Continue using the existing Roboto typography, green/forest palette, 4px spacing scale, radii, shadows, and 1280px container.
- Remove obsolete hero, insight preview, marketing process, and related CSS when the homepage is replaced. Do not leave a second unused page design in `globals.css`.
- Preserve the current user change in `AGENTS.md`; do not edit that file.

## Visual interpretation

The target is a dense but calm editorial feed. It has three horizontal layers before the article grid: a slim dark-forest utility strip, a roomy white primary header, and a lightly tinted horizontally scrollable topic rail. The main content is a three-column grid of restrained news cards on an off-white page. Cards prioritize the image and headline, with political-framing percentages condensed into a single low-height segmented meter. A dark-forest footer closes the page.

### Header and navigation

- Utility strip: approximately 34–36px tall, deep forest background, small light text, one left item and one right item.
- Primary header: approximately 76–84px tall, white background, brand lockup at left, active Home navigation with a slim underline, and a compact right-side action group using valid in-page destinations.
- Do not make the entire header sticky unless it can remain unobtrusive and match the reference at common viewport heights.
- Mobile: collapse utility content and navigation cleanly. Keep the brand visible and avoid adding a nonfunctional hamburger button.

### Topic rail

- Full-width pale surface with top and bottom borders.
- One-row chip track with 8–12px gaps and horizontal scrolling at narrow widths.
- Chips use the design-system pill shape, muted gray-green fill, forest text, and plus marks where visually appropriate.
- Since topics are not functional yet, they are not focusable and do not expose button semantics.

### Top News section

- Start approximately 32–40px below the topic rail.
- H1 text is “Top News,” using the design-system H1 scale.
- Desktop: three equal columns, 24px gutters.
- Tablet: two equal columns.
- Mobile: one column.
- The grid component accepts typed article view models but the current page passes no fabricated records.
- Empty state: when the article list is empty, render one clean bordered panel spanning the grid width. Keep its footprint and typography editorial rather than marketing-oriented, and explain briefly that analyzed stories will appear once the stored feed is connected.

### News cards

Update the existing `NewsCard` to match the reference while preserving all required product analysis fields:

- 16:9 image area with 8px top corners and stable aspect ratio.
- Accessible information/details affordance at the image’s top-right when a valid article href exists.
- Source name and published date directly below the image.
- Two- or three-line headline with consistent card heights where practical.
- Compact supporting row for sentiment label, AI-estimated framing label, and confidence when available.
- Compact single-track meter with Left, Center, and Right percentages labeled inside or immediately adjacent to their segments.
- A clear link to the article analysis; the headline may be the primary link.
- Do not show the mockup’s “N sources” count because that aggregation is not part of the defined schema.
- Do not add a category/location value that does not exist in the article model.
- Continue to normalize/clamp framing values and expose the complete percentages to assistive technology.

### Footer

- Deep forest background, white/soft-green brand lockup, short product tagline, a compact AI-estimate disclaimer, and copyright.
- Do not show mock social, company, help, privacy, or legal links unless a real route/destination exists.
- Desktop footer can use multiple columns to match the reference’s rhythm; mobile stacks them.

## Layout, typography, spacing, and color

- Page background: off-white/surface, with white cards and header.
- Content max width: 1280px with 24px desktop outer margins and 16px mobile margins.
- Desktop grid: 12-column mental model expressed as three article cards per row with 24px gutters.
- H1: 32px / 1.2 / 700.
- Card title: 20px / 1.3 / 600.
- Metadata/body: 13–14px with 1.5–1.6 line height.
- Caption/meter labels: 11px / 1.4.
- Major vertical rhythm: 32px or 40px; card internal spacing: 8px, 12px, 16px, and 24px.
- Reuse `--color-brand`, `--color-forest`, `--color-forest-deep`, surface, border, muted, radius, and shadow variables. Add semantic tokens only when required; do not scatter new raw colors.
- Use subtle 1px borders and the existing small shadow. No gradients, glass effects, oversized hero typography, decorative background rings, or heavy animation.

## Files likely to change

- `app/page.tsx`
- `app/globals.css`
- `components/news-card.tsx`
- `components/ui/bias-meter.tsx`
- `components/site-header.tsx` (new, if it keeps `page.tsx` small)
- `components/site-footer.tsx` (new, if useful)
- `components/top-news-grid.tsx` (new, typed grid and empty state)
- `components/ui/chip.tsx` only if a small variant/API adjustment is needed

Do not change `AGENTS.md`, environment files, package dependencies, database files, API routes, or pipeline code.

## Implementation requirements

1. Re-read this approved prompt immediately before implementation.
2. Replace the current marketing hero/process page with the reference’s editorial homepage hierarchy.
3. Keep `app/page.tsx` a Server Component with one descriptive H1 and semantic `header`, `nav`, `main`, `section`, and `footer` landmarks.
4. Create a compact, reusable header that includes:
   - a dark utility strip with truthful static context;
   - the existing brand lockup;
   - Home as the active navigation item;
   - only valid in-page actions or links.
5. Render a noninteractive horizontally scrollable topic rail using the existing chip component and a concise set of reference-inspired topic labels. These labels are UI taxonomy, not article records.
6. Create a typed `TopNewsGrid` or equivalent that accepts `NewsCardProps[]` (or a dedicated view-model type), maps stored-data-ready values into `NewsCard`, and renders an accessible empty state for an empty array.
7. Update `NewsCard` to the reference’s compact card layout and keep all product-required visible fields: title, source, image, published date, sentiment label, AI-estimated framing label, Left/Center/Right percentages, and confidence when available.
8. Add a compact variant to `BiasMeter` if needed. The default reusable meter must remain valid, and the compact variant must still expose labels/values without depending on color alone.
9. Preserve image aspect ratio and layout stability. Do not widen `next.config.ts` to arbitrary remote hosts or add a remote placeholder image.
10. When the page has no supplied article records, show the grid empty state. Never embed the reference’s news records in a constant, JSON file, or fixture used by the production page.
11. Match the reference’s white/off-white surfaces, forest header/footer, compact navigation, topic rail, card density, and three-column desktop rhythm.
12. Remove CSS selectors that become unused after deleting the hero and process sections. Keep global design tokens centralized and keep page/component styles organized by feature.
13. Use only small inline SVG icons needed for the current UI. Do not add an icon package or other runtime dependency.
14. Do not implement filtering, theme switching, localization, location selection, subscriptions, login, scraping, analysis, or persistence in this task.

## Responsiveness

- ≥1024px: three article columns, full primary navigation, utility strip content aligned left/right.
- 720–1023px: two article columns and reduced header spacing.
- <720px: one article column; compact header; horizontally scrollable chip rail; stacked footer.
- At 390px and 320px, no page-level horizontal scrolling, clipped headings, overlapping buttons, or unreadable meter labels.
- Article card text and controls must not rely on fixed widths that exceed the card.
- Maintain at least 44px tap targets for actionable elements on mobile.

## Accessibility requirements

- One page H1 and a logical heading hierarchy.
- Native links for valid navigation; unavailable features are omitted rather than rendered as dead focusable controls.
- Visible focus indicators for every link.
- Informative article image alt text comes from the view model; decorative icons are hidden from assistive technology.
- The compact framing meter announces all three percentages and its “AI-estimated” context.
- Information affordances have descriptive accessible names.
- Text and interactive states meet WCAG AA contrast.
- Topic labels that are not functional must use noninteractive semantics.
- Respect `prefers-reduced-motion` and avoid unnecessary motion.

## Security requirements

- No credentials, environment variables, service-role keys, or admin secrets are added or exposed.
- No browser-side scraping, model, database, scheduler, or pipeline calls.
- No HTML injection or untrusted markup rendering.
- No arbitrary remote image allowlist or remote placeholder dependency.
- The UI accepts data through typed props only; data fetching remains a future server-only concern.

## Pixel-perfect expectations

- At approximately 1440px, the utility strip, primary header, chip rail, Top News heading, and three-column card grid align to one centered content edge.
- The page should feel materially closer to the provided editorial feed than the current hero/marketing page.
- Cards use a restrained 8px radius, thin neutral border, subtle shadow, 16:9 image, compact metadata, strong headline, and low-height segmented meter.
- The topic rail remains a single visual row on desktop and scrolls without a page scrollbar on mobile.
- Header and footer use deep forest; primary action accents use bright green; the content canvas remains off-white.
- Remove visual ideas unique to the previous page—large decorative ring, marketing hero, analysis preview panel, process cards, and large empty-state marketing layout.
- Perform visual comparison at roughly 1440×1000 and inspect a narrow viewport near 390px after implementation.

## Acceptance criteria

- `/` has the reference’s editorial homepage structure and no longer shows the current marketing hero.
- Header, topic rail, Top News area, responsive grid, compact news card, compact framing meter, empty state, and footer are implemented.
- The production page contains no hard-coded sample article records from the mockup.
- News cards remain typed and compatible with the product-required Supabase fields for a future data connection.
- No fake login, subscribe, filter, location, date, theme, social, or navigation behavior is exposed.
- No backend, auth, scraping, AI, database, or API scope is introduced.
- Desktop/tablet/mobile layouts remain readable without page-level overflow.
- Typecheck, ESLint, and production build pass.

## Checks to run

From the project root:

```powershell
npm run typecheck
npm run lint
npm run build
```

Also run `git diff --check`, verify the production root route returns HTTP 200, and perform a headless-browser visual pass at desktop and narrow widths. Report actual results only.

## Exact manual test steps expected after implementation

1. Run `npm run dev` from `F:\vibe-coded\web\fakenews_checker`.
2. Open `http://localhost:3000`.
3. At approximately 1440px wide, verify:
   - the dark utility strip, white primary header, pale topic rail, Top News section, and dark footer match the reference hierarchy;
   - all sections share the same centered content edges;
   - the Top News area shows the intentional empty state because no stored article feed is connected;
   - no sample headline or image from the attached mockup appears.
4. Inspect a `NewsCard` after a future stored-data integration and verify image, source, date, sentiment, AI-estimated framing label, Left/Center/Right percentages, confidence, and details link are present.
5. Resize to approximately 1024px and confirm the card grid definition changes to two columns when article records are supplied.
6. Resize to approximately 390px and 320px; verify the header compacts, topics scroll within their rail, the grid is one column, footer stacks, and the page has no horizontal scrollbar.
7. Use keyboard-only navigation and verify every available link has a visible focus indicator and logical order.
8. Confirm the unavailable features from the mockup—login, subscribe, theme, location, and topic filtering—are not focusable fake controls.
9. Inspect the browser network panel and confirm the page makes no Supabase, Clerk, Oxylabs, OpenAI, or placeholder-image requests.
