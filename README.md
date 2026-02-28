# Nostalgie World Docs

Production-ready documentation application built with React, TypeScript, Vite, and Tailwind CSS. The app is fully driven by a single markdown source file and generates its navigation, routes, metadata, and page structure automatically.

## What This Project Does

This repository powers a GitBook-style documentation site for the Nostalgie World ecosystem.

Key characteristics:

- Single source of truth: `public/documentation.md`
- Automatic product and page generation from markdown headings
- Dynamic routes based on parsed markdown structure
- Persistent dark sidebar and responsive docs layout
- Right-side `Ask AI` placeholder panel
- Route-aware SEO metadata
- Hostinger/Apache-friendly deployment via `.htaccess`

## Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4 via PostCSS
- React Router
- React Markdown + `remark-gfm`
- React Icons
- Vitest

## Commands

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

## Project Structure

```text
public/
  documentation.md     Source of truth for all documentation content
  favicon.png          App favicon
  robots.txt           Crawl rules
  sitemap.xml          Static sitemap placeholder
  .htaccess            Apache rewrite rules for SPA hosting

src/
  assets/              Editorial images used by the UI
  features/docs/
    api/
      documentation-client.ts
    components/
      app-footer.tsx
      ask-ai-panel.tsx
      docs-loading-shell.tsx
      markdown-components.tsx
    hooks/
      use-documentation.ts
      use-theme.ts
    lib/
      doc-routing.ts
      documentation-parser.ts
      documentation-parser.test.ts
      seo.ts
      slug.ts
    types.ts
  pages/
    docs-page.tsx
    docs-redirect-page.tsx
    not-found-page.tsx
  App.tsx
  main.tsx
  index.css
```

## Content Model

The app treats markdown heading levels as application structure.

### Source of Truth

All docs content lives in:

[`public/documentation.md`](/Users/zafeirious/Desktop/nw-docs/public/documentation.md)

### Heading Rules

- `# Product Name`
  Creates a top-level product/manual
- `## Page Name`
  Creates a routable page inside that product
- `### Section Name`
  Creates in-page anchors and table-of-contents items
- `#### Nested Section`
  Also becomes an in-page anchor

### Example

```md
# Wall of Nostalgia

Intro copy for the product.

## Documentation overview

Landing page content.

## Create your account

Page content.

### Requirements

Subsection content.
```

This generates:

- Product: `Wall of Nostalgia`
- Page route: `/docs/wall-of-nostalgia/documentation-overview`
- Page route: `/docs/wall-of-nostalgia/create-your-account`
- In-page heading anchor: `#requirements`

## Parsing Rules

The parser lives in:

[`src/features/docs/lib/documentation-parser.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/lib/documentation-parser.ts)

Current behavior:

- Ignores content before the first `#`
- Creates one product for every top-level `#`
- Creates one page for every `##`
- Treats `###` and `####` as local page headings only
- Creates an automatic fallback `Overview` page if a product has no `##` sections
- Removes noisy markdown artifacts from summaries and search text
- Hides internal pages when the page title matches:
  - `Needs Confirmation`
  - `Internal Notes`
  - `Draft`
  - `Open Questions`

## Routing Model

Routing is defined in:

[`src/App.tsx`](/Users/zafeirious/Desktop/nw-docs/src/App.tsx)

Current routes:

- `/`
- `/docs`
- `/docs/:productSlug/:pageSlug`
- `*`

Routing helpers live in:

[`src/features/docs/lib/doc-routing.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/lib/doc-routing.ts)

Current rules:

- `/` redirects to the default docs page
- `/docs` redirects to the same destination
- The app prefers a page titled `Documentation overview` as the default landing page
- If no `Documentation overview` exists, the first visible product/page is used
- Invalid product/page pairs render the in-app `Route mismatch` state
- Unknown browser routes render the standalone `Page not found` page

## Caching and Data Loading

Documentation loading is intentionally simple and fast.

Relevant files:

- [`src/features/docs/api/documentation-client.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/api/documentation-client.ts)
- [`src/features/docs/hooks/use-documentation.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/hooks/use-documentation.ts)

Behavior:

- Fetches `public/documentation.md`
- Parses it into the internal docs library model
- Stores the raw markdown in `sessionStorage`
- Restores from cache on reload when available
- Refreshes from network after initial render
- Keeps cached content visible if refresh fails

This means content updates in `documentation.md` are reflected automatically without creating new React pages.

## UI Architecture

Main page shell:

- [`src/pages/docs-page.tsx`](/Users/zafeirious/Desktop/nw-docs/src/pages/docs-page.tsx)

Styling:

- [`src/index.css`](/Users/zafeirious/Desktop/nw-docs/src/index.css)

Supporting UI:

- [`src/features/docs/components/docs-loading-shell.tsx`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/components/docs-loading-shell.tsx)
- [`src/features/docs/components/ask-ai-panel.tsx`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/components/ask-ai-panel.tsx)
- [`src/features/docs/components/app-footer.tsx`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/components/app-footer.tsx)
- [`src/features/docs/components/markdown-components.tsx`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/components/markdown-components.tsx)

Current UI features:

- Dark desktop sidebar
- Mobile drawer navigation
- Search filtering inside the sidebar
- Product grouping with collapsible sections
- Generated previous/next navigation
- Custom markdown styling for tables, lists, links, checklists, and blockquotes
- Responsive image-driven header card
- Docked `Ask AI` panel on desktop and overlay behavior on smaller screens
- Footer with legal links

## SEO and Metadata

Default metadata:

- [`index.html`](/Users/zafeirious/Desktop/nw-docs/index.html)

Dynamic metadata:

- [`src/features/docs/lib/seo.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/lib/seo.ts)

Route-level metadata is applied from:

- [`src/pages/docs-page.tsx`](/Users/zafeirious/Desktop/nw-docs/src/pages/docs-page.tsx)
- [`src/pages/docs-redirect-page.tsx`](/Users/zafeirious/Desktop/nw-docs/src/pages/docs-redirect-page.tsx)
- [`src/pages/not-found-page.tsx`](/Users/zafeirious/Desktop/nw-docs/src/pages/not-found-page.tsx)

Current behavior:

- Dynamic page titles follow the route content
- Canonical tags are generated from `window.location`
- Open Graph and Twitter description tags are updated dynamically
- Invalid routes are marked with `noindex,follow`
- Product-level header descriptions are standardized

## Robots, Sitemap, and Domain Notes

Files:

- [`public/robots.txt`](/Users/zafeirious/Desktop/nw-docs/public/robots.txt)
- [`public/sitemap.xml`](/Users/zafeirious/Desktop/nw-docs/public/sitemap.xml)

Important:

- The current `robots.txt` and `sitemap.xml` use `https://docs.nostalgie.world`
- If your final production domain is different, update both files before publishing
- Canonical URLs in runtime metadata automatically use the actual browser origin

## Apache / Hostinger Deployment

The repo includes:

- [`public/.htaccess`](/Users/zafeirious/Desktop/nw-docs/public/.htaccess)

This file ensures:

- existing files are served normally
- React routes are rewritten to `index.html`
- static assets get long cache headers
- HTML/XML/TXT files avoid aggressive caching

### Shared Hosting Deploy Steps

1. Run:

```bash
npm run build
```

2. Upload the contents of `dist/` to your server public root.
3. Make sure `.htaccess` is uploaded with the rest of the build output.
4. Verify:
   - `/`
   - `/docs`
   - a deep route like `/docs/wall-of-nostalgia/documentation-overview`
5. Update `robots.txt` and `sitemap.xml` if the production domain changed.

## How To Add or Update Documentation

Open:

[`public/documentation.md`](/Users/zafeirious/Desktop/nw-docs/public/documentation.md)

### To Add a New Product

Add a new top-level `#` heading:

```md
# New Product

Intro copy.

## Documentation overview

Landing content.
```

### To Add a New Page

Add a `##` heading inside an existing product:

```md
## Billing

Billing content goes here.
```

### To Add In-Page Sections

Use `###` or `####`:

```md
### Payment methods
#### Supported regions
```

### To Hide a Page From Navigation

Use one of the reserved section titles:

```md
## Draft
```

That page is parsed, but hidden from normal navigation and routing.

## Markdown Authoring Guidance

To keep the site stable:

- Use exactly one `#` heading per product
- Keep routable pages at `##`
- Use `###` for FAQ items and troubleshooting items
- Do not flatten every question into `##` headings
- Prefer clean sentence openings because summaries are generated from page body text
- Use standard markdown links: `[label](https://example.com)`

### Links

External links from markdown are rendered as:

- purple text
- underlined
- hover-reactive
- pointer cursor
- new-tab links for `http/https`

### Lists

Lists use custom UI styling instead of browser-default bullets, including:

- branded unordered markers
- numbered ordered-list chips
- checklist support

## Feature Development Guide

This repo is already structured to support iterative feature work without changing the content model.

### Good Extension Points

#### Add richer search

Current search is local and string-based. A safe upgrade path:

- add keyword weighting in `documentation-parser.ts`
- add highlighted matches in `docs-page.tsx`
- keep the source of truth in markdown

#### Add generated sitemap routes

The current sitemap is static. A good next step:

- generate `sitemap.xml` during build from parsed markdown
- include every visible docs route
- keep product/page slug generation consistent with `doc-routing.ts`

#### Add AI later

The `Ask AI` panel is presentational only. To implement it properly:

- create a server endpoint or edge function
- pass current `productSlug`, `pageSlug`, and markdown content as context
- add streaming UI only after backend response shape is stable

#### Add analytics

Recommended approach:

- track route changes in `docs-page.tsx`
- avoid coupling analytics into the markdown parser
- keep page identity based on `product.slug` + `page.slug`

#### Add theme persistence enhancements

Theme logic already lives in:

- [`src/features/docs/hooks/use-theme.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/hooks/use-theme.ts)

Future improvements should stay inside the hook rather than being scattered through components.

## Testing

Current tests:

- [`src/features/docs/lib/documentation-parser.test.ts`](/Users/zafeirious/Desktop/nw-docs/src/features/docs/lib/documentation-parser.test.ts)

Covered cases:

- multiple top-level products
- hidden internal sections
- fallback overview generation
- summary cleanup
- stable slugs and heading IDs
- `Documentation overview` default route preference

### Recommended Next Tests

- route rendering tests for valid and invalid doc paths
- UI tests for sidebar search and product expansion
- metadata tests for route changes
- markdown rendering tests for links, tables, and lists

## Publish Readiness Checklist

Current codebase status:

- `npm run lint`: passing
- `npm run test`: passing
- `npm run build`: passing
- SPA rewrites for Apache: present
- robots file: present
- sitemap file: present
- dynamic metadata: present
- responsive layout: present

Before production publish, confirm:

1. The production domain is final.
2. `public/robots.txt` points to the correct sitemap URL.
3. `public/sitemap.xml` uses the correct domain.
4. You upload the built `dist/` output, not the source repo.
5. `documentation.md` content is final and free of malformed markdown.

## Known Constraints

- The sitemap is currently static, not generated from markdown pages.
- The `Ask AI` panel is visual only; input is intentionally disabled.
- Descriptions in the header are standardized by product and overview context, not extracted per page.
- Shared hosting rewrites assume Apache with `mod_rewrite` enabled.

## Recommended Future Improvements

1. Generate the sitemap from visible docs routes during build.
2. Add integration tests for route rendering and SEO tags.
3. Add image compression for the larger JPG assets.
4. Add a production domain constant or env-based config for robots/sitemap generation.
5. Add optional copy-to-anchor-link behavior for heading IDs.

## Final Notes

This app is designed so content changes happen in markdown first, while the UI, routes, and metadata stay in sync automatically. For most future work, prefer extending the parser, routing helpers, and shared docs components instead of hardcoding special cases in page-level JSX.
