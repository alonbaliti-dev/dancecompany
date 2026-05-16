# Contributing

## Branch Strategy

Use:

- `main` for stable release-ready work.
- `develop` for integration work.
- `feature/*` for focused feature branches.
- `hotfix/*` for urgent production fixes.

## Development Flow

1. Create a branch from `develop`.
2. Keep changes scoped.
3. Run `npm run build` before opening a PR or committing release-ready work.
4. Do not commit secrets, local databases, uploads, caches or generated build output.

## Product Rules

- Preserve Hebrew RTL quality.
- Keep mobile-first layout centered and safe-area aware.
- Use V6 design-system primitives for repeated UI patterns.
- Use domain guards/selectors/operations for business logic.
- Log sensitive writes through audit helpers.
- Do not bypass AI approval workflows.

## Commit Style

Use concise messages that describe the product or architecture outcome.

Example:

```bash
git commit -m "Initialize LK Student Space V6 foundation"
```
