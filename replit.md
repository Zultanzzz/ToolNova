# ToolNova

ToolNova is a browser-first online tools platform for fast image, PDF, text, and developer utilities without accounts or file uploads.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/toolnova/src/data/tools.ts` — centralized registry for the 20 implemented tools, categories, metadata, and related-tool discovery.
- `artifacts/toolnova/src/App.tsx` — client-side routing, shared shell, homepage, discovery pages, tool pages, and legal/support pages.
- `artifacts/toolnova/src/components/toolnova-ui.tsx` — reusable file upload, tool card, SEO, privacy, and ad-slot primitives.
- `artifacts/toolnova/public/` — generated crawl assets including `sitemap.xml` and `robots.txt`.
- `artifacts/toolnova/src/index.css` — ToolNova visual tokens, light/dark themes, and shared utility styling.

## Architecture decisions

- File and text utilities process locally in the browser by default so user content does not need to leave the device.
- Tool discovery and route metadata are registry-driven so new tools can be added without duplicating navigation, cards, search, or SEO wiring.
- PDF and QR dependencies are loaded as focused client-side capabilities rather than introducing a backend or database for the first version.
- The app uses a shared page structure for tool routes: breadcrumb, focused interface, privacy note, supporting content, FAQ, and related tools.

## Product

ToolNova provides 20 working browser tools across Images, PDF, Text, and Developer categories. It includes client-side downloads, accessible file upload flows, fast global search, responsive navigation, persistent dark mode, SEO metadata, structured data, and future-ready ad-slot placeholders.

## User preferences

No additional preferences recorded.

## Gotchas

- ToolNova is intentionally frontend-only for the first version; do not introduce authentication, a database, or server-side file storage for browser utilities unless the product scope changes.
- When adding a new tool, update the registry first and keep its route, metadata, UI component, related-tool behavior, and sitemap generation aligned.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
