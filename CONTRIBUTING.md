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
- Validate untrusted input (form values and anything read from `localStorage`) before use.
- Keep the app static and client-side; do not add a backend or server-side storage for personal data.
- Keep UI controls labelled and keyboard accessible.
- Avoid new dependencies unless they clearly improve the scored challenge criteria.
