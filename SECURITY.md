# Security

## Supported version

This repository is a challenge submission; the current `main` branch is the supported version.

## Reporting issues

Please open a GitHub issue for non-sensitive security concerns. Do not include secrets, personal data, or private user profiles in reports.

## Security posture

- CarbonCoach is a static, client-side site (Next.js `output: "export"`) deployed to GitHub Pages. There is no backend, so there is no server-side attack surface.
- No API keys, environment secrets, or credentials exist anywhere in the repository.
- No accounts, cookies, analytics, or third-party network calls. User input never leaves the browser.
- The only persisted data is the list of adopted action IDs in `localStorage`; it is parsed defensively and never transmitted.
- All profile input is validated with zod before it is used.
- GitHub Pages serves the site over HTTPS, with HSTS applied on the `github.io` domain.
