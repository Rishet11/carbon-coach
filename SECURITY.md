# Security

## Supported version

This repository is a challenge submission and supports the current `main` branch.

## Reporting issues

Please open a GitHub issue for non-sensitive security concerns. Do not include secrets, personal data, or private user profiles in reports.

## Security posture

- The app does not require API keys or environment secrets.
- The app does not create accounts or store profile data on a server.
- `/api/analyze` validates input with zod and returns `Cache-Control: no-store`.
- Security headers and Content-Security-Policy are configured in `next.config.ts` and `src/proxy.ts`.
