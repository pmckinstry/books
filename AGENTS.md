# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js routes and API handlers (e.g., `api/.../route.ts`).
- `src/components`: Reusable React components (PascalCase, `.tsx`).
- `src/lib`: Server/client utilities (auth, DB, API, config).
- `src/__tests__`: Unit/integration tests using Vitest + Testing Library.
- `public`: Static assets; `docs/`: documentation; `scripts/`: data/migration tools.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server (Turbopack).
- `npm run build`: Production build of the Next.js app.
- `npm start`: Serve the production build.
- `npm run lint`: Lint with Next/ESLint config.
- `npm test` / `npm run test:watch`: Run tests (Vitest, jsdom env).
- `npm run test:ui`: Vitest UI runner for interactive debugging.

Example: `NODE_ENV=test npm run test`.

## Coding Style & Naming Conventions
- TypeScript throughout (`.ts`/`.tsx`), 2‑space indentation.
- React components: PascalCase file and export (e.g., `BookTable.tsx`).
- Hooks/utilities: camelCase (e.g., `databaseFactory.ts`).
- Paths: use alias `@` for `src` (e.g., `import x from '@/lib/api'`).
- Keep API routes RESTful under `src/app/api/.../route.ts`.
- ESLint config: Next + TypeScript (`eslint.config.mjs`). Fix issues before PR.

## Testing Guidelines
- Framework: Vitest (`vitest.config.ts`), environment `jsdom` with setup in `vitest.setup.ts`.
- Place tests in `src/__tests__`; name files `*.test.ts` or `*.test.tsx`.
- Prefer React Testing Library patterns for components; mock network/DB.
- Run all tests and ensure deterministic results: `npm test`.

## Commit & Pull Request Guidelines
- Commits: concise, imperative. Prefer types when helpful (e.g., `feat:`, `fix:`). Group related changes.
- PRs: clear description, linked issues, test steps, and screenshots/GIFs for UI changes.
- CI expectations: lint and tests must pass; include migrations/scripts notes when relevant.

## Security & Configuration Tips
- Use `.env.local` for secrets; never commit credentials. See `env.aws.template`.
- Node: use the LTS in `.nvmrc` (`nvm use`).
- DynamoDB: local/infra scripts live in `scripts/` (e.g., `setup-dynamodb-local.sh`, `create-aws-dynamodb-tables.sh`).
