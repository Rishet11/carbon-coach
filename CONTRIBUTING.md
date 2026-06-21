# Contributing

## Local setup

```bash
npm install
npm run dev
```

## Before opening a change

Run the same checks used by CI:

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run build
```

## Development notes

- Keep calculator and recommendation logic in pure domain modules.
- Validate external input at the API boundary.
- Do not add server-side storage for personal profile data.
- Keep UI controls labelled and keyboard accessible.
- Avoid new dependencies unless they clearly improve the scored challenge criteria.
