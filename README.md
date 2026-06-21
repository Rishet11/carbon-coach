# CarbonCoach

![CI](https://github.com/Rishet11/carbon-coach/actions/workflows/ci.yml/badge.svg)

CarbonCoach is a personal carbon-footprint awareness platform for Prompt Wars Challenge 3. It helps individuals estimate, understand, track, and reduce their annual footprint through contextual recommendations.

## Chosen vertical

Challenge 3: Carbon Footprint Awareness Platform.

The target user is an individual who wants a practical estimate of their yearly lifestyle emissions and a short list of realistic next actions. The app avoids accounts, ads, analytics, and external API calls so the experience stays private and fast.

## Approach and logic

CarbonCoach works like a lightweight decision assistant:

- It collects a lifestyle profile across home energy, transport, flights, diet, shopping, and user constraints.
- It calculates annual kg CO2e by category using rounded public emission factors.
- It benchmarks the result against country averages, a global average, and a 2.3 t 2030 Paris-aligned reference.
- It ranks recommendations by estimated saving, effort, cost impact, feasibility, user goal, budget sensitivity, and home ownership/renter context.
- It explains why each action was selected with numbers from the user's own profile.

The recommendation engine is intentionally contextual. For example, it does not suggest car replacement to someone without a car, does not suggest diet shifts to a vegan profile, and gives renter-friendly heating advice instead of owner-only retrofit advice.

## How it works

```text
Profile form
  -> POST /api/analyze
  -> zod validation
  -> pure TypeScript domain engine
  -> footprint, benchmarks, insight, recommendations
  -> dashboard + local action tracker
```

No database is used. Adopted actions are stored in `localStorage` in the current browser only.

## Assumptions

- Results are educational estimates, not certified greenhouse-gas inventory calculations.
- Home energy is split by household size.
- Electricity uses country-level grid intensity and the user's renewable-share estimate.
- Gas/oil heating uses separate monthly fuel kWh; electric and heat-pump heating are assumed to be included in electricity.
- Flight estimates are annual return-trip estimates with a radiative-forcing uplift.
- Shopping estimates are broad lifestyle bands, not receipt-level lifecycle analysis.

## Sources

- [GOV.UK greenhouse gas reporting conversion factors 2024](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024)
- [Our World in Data: food choices and carbon footprint](https://ourworldindata.org/food-choice-vs-eating-local)
- [Oxfam: Carbon inequality in 2030](https://www.oxfam.org/en/research/carbon-inequality-2030)
- Country grid-intensity assumptions are rounded from IEA/Ember-style public electricity data.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run build
npm audit --omit=dev
```

Current test suite: 21 tests covering the domain engine, API validation, component rendering, local tracking, and accessibility checks with `jest-axe`.

## Security and privacy

- No accounts, cookies, analytics, external API calls, or server-side storage.
- Request bodies are validated with zod.
- Personal analysis responses use `Cache-Control: no-store`.
- Security headers and a strict script Content-Security-Policy are configured in the app.
