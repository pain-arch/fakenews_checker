# Fake or Real — Clerk Authentication

## Goal

Add production-style Clerk authentication to the existing Next.js 16 App Router application. Keep the public homepage and public news details pages readable without an account, add real sign-in/sign-up/account controls to the shared header, provide dedicated branded authentication routes, and establish Clerk request context through the supported Next.js 16 `proxy.ts` convention.

## Skills read

- `.agents/skills/clerk/SKILL.md`
- `.agents/skills/clerk-setup/SKILL.md`, selected by the Clerk router because this is a new Clerk installation

No Supabase, Oxylabs, or AI SDK skill is needed. Authentication must remain separate from the existing server-only article data layer and must not change scraping, analysis, scheduling, or persistence behavior.

## Current documentation checked

### Clerk

- `https://clerk.com/docs/nextjs/getting-started/quickstart`
- `https://clerk.com/docs/reference/nextjs/clerk-middleware`
- `https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page`
- `https://clerk.com/docs/nextjs/guides/development/custom-sign-up-page`
- `https://clerk.com/docs/guides/customizing-clerk/appearance-prop/variables`

Use the current Clerk Core 3 SDK because this project has no existing Clerk dependency; the current package at prompt preparation is `@clerk/nextjs` 7.9.1. Follow the current requirements: initialize through the Clerk CLI first, use `proxy.ts` for Next.js 16+, place `ClerkProvider` inside `<body>`, keep `auth()` asynchronous if server authorization is added later, and never expose `CLERK_SECRET_KEY` to client code.

### Installed Next.js 16.3.1 documentation

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`

The installed framework deprecates the old `middleware.ts` filename in favor of root-level `proxy.ts`. Proxy is request plumbing, not the sole authorization boundary; protected resources must perform authorization close to the resource if such resources are introduced later.

## Existing code inspected

- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `.gitignore`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/news/[id]/page.tsx`
- `app/news/[id]/not-found.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `components/brand-logo.tsx`
- `components/ui/button.tsx`

The project currently has no Clerk SDK, provider, proxy, auth routes, or auth-aware UI. It has a shared header and button primitives. `.env.local` exists, but its contents have not been and must not be read or printed. `.env.example` is currently absent even though `AGENTS.md` defines it as the canonical environment-variable template. There is no `components.json`, so the Clerk shadcn theme package is not required.

## Decisions and assumptions

- This request establishes user authentication only. Do not invent a dashboard, profile page, saved-story feature, subscription system, roles, organizations, billing, webhook sync, or Supabase user table.
- The homepage and news details route remain public. There is currently no resource whose product requirements call for authentication, so `proxy.ts` will make Clerk context available but will not globally protect routes.
- Signed-out users see clear `Log in` and `Sign up` actions in the shared header. Signed-in users see Clerk’s `UserButton`, which provides account management and sign-out behavior.
- Add dedicated optional catch-all routes at `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` using Clerk’s prebuilt components. Keep both routes public.
- After successful sign-in or sign-up, fall back to `/`. The canonical environment template documents the corresponding `NEXT_PUBLIC_CLERK_*` route variables.
- Integrate Clerk through the CLI first, as required by the current Clerk setup instructions. After approval, run `npx -y clerk@latest init` from the project root. Use its default agent/keyless behavior if no existing linked Clerk app is detected.
- `clerk init` may provision a temporary claimable development application and update `.env.local`. Do not print, inspect, or transmit the resulting keys. Do not overwrite unrelated variables already present in `.env.local`.
- If the CLI requests selection of an existing application, an interactive login, or another decision that cannot be inferred safely, stop and ask rather than selecting or creating an account-bound app without direction.
- If and only if CLI initialization fails or leaves the integration incomplete, finish the documented setup manually: install the current `@clerk/nextjs`, add `proxy.ts`, add the provider, and add auth routes.
- Inspect every CLI-created file/diff before keeping it. Preserve all existing homepage, details-page, Supabase, prompt, and user-authored `AGENTS.md` changes. Remove or revise only generated boilerplate that conflicts with the Fake or Real design.
- Do not read `.env.local`. Only check for its existence and allow Clerk tooling/runtime to use it.
- Restore or create `.env.example` with placeholders for the complete canonical variable list from `AGENTS.md`, and update `.gitignore` so `.env.example` is trackable while all real env files remain ignored.
- Apply Clerk’s supported `appearance.variables` at the root provider using direct color values for broad compatibility. Match the existing forest/green palette, Roboto typography, 8px radius, white surface, muted text, and accessible focus treatment. Do not add `@clerk/ui` because this repository is not configured with shadcn’s `components.json`.
- Keep auth rendering within Clerk components and the existing header; do not create custom password/session logic.

## Implementation requirements

### CLI and dependency

- Run `npx -y clerk@latest init` only after this prompt is approved.
- Use the current `@clerk/nextjs` package installed by the CLI; ensure it is a direct production dependency and the npm lockfile is updated.
- Do not add obsolete `@clerk/clerk-react`, `@clerk/themes`, or custom JWT/session packages.
- Run `npx -y clerk@latest doctor --json` after setup if supported. If the CLI writes or reports secrets, do not echo those values in the final response.

### Provider

Update `app/layout.tsx`:

- Import `ClerkProvider` from `@clerk/nextjs`.
- Keep `<html>` as the outer root and place `<ClerkProvider>` inside `<body>` around application children.
- Configure Clerk appearance with direct Fake or Real design-system values: forest primary, white surface, deep-forest foreground, muted gray-green secondary text, existing border/focus colors, Roboto, and 8px radius.
- Do not make unrelated metadata or font changes.

### Next.js proxy

Add root-level `proxy.ts`:

- Export `clerkMiddleware()` from `@clerk/nextjs/server`.
- Use Clerk’s current matcher that skips Next.js internals and ordinary static files while including application pages, API routes, and Clerk frontend API routes.
- Do not call `auth.protect()` globally. `/`, `/news/:path*`, `/sign-in/:path*`, and `/sign-up/:path*` remain public.
- Do not put slow database work or authorization policy into Proxy.

### Shared header

Update `components/site-header.tsx` without changing its layout hierarchy:

- Use Clerk’s current `Show`, `SignInButton`, `SignUpButton`, and `UserButton` components.
- Signed out: show a secondary `Log in` button and primary `Sign up` button, using the existing `Button` component/classes and redirect-mode auth pages.
- Signed in: show the `UserButton` with an accessible account menu and redirect to `/` after sign-out.
- Keep the existing Home navigation and responsive behavior.
- Remove the current non-auth `About analysis` and `Top news` header actions; their in-page content remains available through normal page flow.
- Ensure the mobile header keeps at least the primary auth action usable without overflow. If both signed-out actions cannot fit below 390px, hide only the secondary login control using the existing responsive pattern; the sign-up flow itself links back to sign-in.

### Authentication pages

Add:

- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- a small shared auth-shell component and/or CSS module if it avoids duplication

Each route must:

- Use Clerk’s prebuilt `SignIn` or `SignUp` component, not a hand-rolled credentials form.
- Render within a branded Fake or Real auth shell using the existing logo and product message.
- Be centered, responsive, keyboard accessible, and visually consistent with the design system.
- Link correctly between sign-in and sign-up through the configured Clerk routes.
- Avoid fake testimonials, claims, legal links, or social providers. Enabled authentication methods come from Clerk configuration.
- Avoid duplicating the main site header, which would repeat auth controls on the auth pages.

### Environment documentation

Create/restore `.env.example` with placeholders for all canonical variables in `AGENTS.md`, including:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`
- the existing Supabase, Oxylabs, OpenAI, admin, batch-size, and Vercel Cron placeholders

Keep `.env*` ignored except `.env.example`. Do not add `CRON_SECRET` to `.env.local`; it is documented in the example as Vercel-injected only.

## Visual interpretation

No new auth-page screenshot was supplied, so extend the approved Fake or Real design system rather than introducing a new visual language.

- Header actions retain the existing 40–44px control height, 8px radius, forest outline, and bright-green primary fill.
- The signed-in avatar should occupy approximately the same visual footprint as one compact header button.
- Authentication pages use the off-white page background, a restrained green brand area, and Clerk’s white form card.
- Desktop auth layout may use two balanced columns—brand/context on one side and the Clerk form on the other—within the existing 1280px container, but should remain visually quiet.
- Tablet/mobile stack into one centered column. Keep at least 16px side gutters, no horizontal overflow, and a readable form width around 360–440px.
- Typography remains Roboto with the existing 32px H1/24px H2 hierarchy, 14px body size, 4px spacing scale, and current focus ring.
- Preserve strong contrast and do not rely on color alone for auth/error state meaning.

## Files likely to change

- `package.json`
- `package-lock.json`
- `.gitignore`
- `.env.example` (new/restored, credential-free)
- `app/layout.tsx`
- `app/globals.css` or a scoped auth CSS module
- `components/site-header.tsx`
- `proxy.ts` (new)
- `app/sign-in/[[...sign-in]]/page.tsx` (new)
- `app/sign-up/[[...sign-up]]/page.tsx` (new)
- optionally `components/auth-shell.tsx` and `components/auth-shell.module.css` (new)
- any exact integration files created by `clerk init`, after review

Do not alter Supabase schema/query behavior, public article routes, scraping, analysis, scheduler, cron, or unrelated UI.

## Security requirements

- Never read, print, commit, expose, or pass `CLERK_SECRET_KEY` to browser code.
- Only `NEXT_PUBLIC_CLERK_*` variables may be referenced by client-visible configuration.
- Keep `.env.local` ignored and preserve its unrelated existing values.
- Use Clerk SDK components and middleware; do not store passwords, sessions, tokens, or user objects in Supabase/local storage.
- Keep all existing content routes public until a specific protected resource is added.
- For future protected Server Actions, Route Handlers, or database writes, require `await auth()` at the resource boundary; Proxy alone is not authorization.
- Do not log tokens, cookies, complete user profiles, or environment values.
- Do not create users, send invitations, configure social providers, or enable billing/organizations.

## Acceptance criteria

- The app is wrapped in `ClerkProvider` inside `<body>`.
- Root `proxy.ts` uses current `clerkMiddleware()` and the official Next.js 16-compatible matcher.
- Public pages continue to render for signed-out visitors.
- Signed-out header shows working Log in and Sign up actions.
- Signed-in header shows a working account avatar/menu and supports sign-out.
- `/sign-in` and `/sign-up` render Clerk’s real prebuilt authentication flows in a responsive Fake or Real shell.
- Sign-in and sign-up routes link to each other and return to `/` through fallback redirects.
- No custom password handling, fake authentication, Supabase Auth, or invented protected feature is added.
- No secret appears in tracked files, browser props, logs, or final output.
- Existing homepage and news details functionality remains intact.
- The auth UI is usable at desktop, tablet, and mobile widths with keyboard navigation and no overflow.
- TypeScript, ESLint, and the production build pass.

## Checks to run

From the project root:

1. `npx -y clerk@latest doctor --json`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. Start the app and verify `/`, `/news/<valid-id>`, `/sign-in`, and `/sign-up` respond as expected without exposing secrets.

If a full browser/auth round-trip cannot be completed because the CLI application is unclaimed, credentials are invalid, or no browser surface is available, report that exact external/testing limitation rather than claiming success.

## Exact manual test steps after implementation

1. Run `npm run dev`.
2. Visit `http://localhost:3000/` in a private/incognito window.
3. Confirm the homepage remains public and the header shows `Log in` and `Sign up`.
4. Select `Sign up`, complete Clerk’s configured development signup flow, and confirm the app returns to `/` with a user avatar in the header.
5. Open the avatar, confirm Clerk’s account menu appears, then sign out and confirm the signed-out buttons return.
6. Select `Log in`, complete sign-in with the test account, and confirm the fallback return to `/`.
7. Visit `http://localhost:3000/sign-in` and `http://localhost:3000/sign-up` directly; verify both render, link to each other, and remain usable on a 390px-wide viewport.
8. While signed out, open a real `http://localhost:3000/news/<article-uuid>` route and confirm public article access is unchanged.
9. Confirm `.env.local` remains ignored with `git status --ignored --short`, `.env.example` contains placeholders only, and neither Clerk key appears in the browser page source or tracked diff.
10. If Clerk created a keyless application, use its “Configure your application” flow later to claim it to the intended Clerk account before production deployment.
