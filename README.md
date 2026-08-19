# TaleOrience Web

Frontend client for the [TaleOrience World Engine](https://github.com/mechv0d/taleorience-backend)
— a local-first worldbuilding platform.

Built with React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Query and Tiptap.

## Prerequisites

- Node.js >= 20.19 (pnpm via corepack)
- A running backend. The dev server proxies `/api` to `http://localhost:4000`.

### Running the backend (from source, branch `dev`)

```bash
git clone https://github.com/mechv0d/taleorience-backend.git
cd taleorience-backend
git checkout dev
docker compose up --build
# API: http://localhost:4000/api/v1
# Swagger: http://localhost:4000/api/v1/docs
```

The API contract is maintained in `docs/API.md`.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start Vite dev server with API proxy         |
| `pnpm build`        | Type-check and build for production          |
| `pnpm preview`      | Preview the production build                 |
| `pnpm lint`         | ESLint                                       |
| `pnpm typecheck`    | TypeScript type check (`tsc -b`)             |
| `pnpm test`         | Unit tests (Vitest + Testing Library)        |
| `pnpm test:e2e`     | End-to-end tests (Playwright, needs backend) |
| `pnpm format`       | Prettier write                               |

## Git workflow

Branches follow the project guidelines in `docs/FREE_GIT_GUIDELINES.md`:

```
feature/* → dev → main → release tag → production
```

Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).

## Architecture notes

- All API traffic goes through `/api/v1/*` and is proxied to the backend in dev.
- The backend is stateless HTTP; the UI refetches after mutations (TanStack Query).
- Design tokens live in `src/index.css` (`@theme`) and are the only source of color
  values — components must never hard-code hex colors.
- Text blocks store Markdown (including `[[GameObject]]` wiki links) as `data.content`.