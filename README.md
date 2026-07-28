# FIT5032 Assessed Lab 12 - GitHub Actions CI/CD

[![Verify and Deploy to Cloudflare Pages](https://github.com/ZhengwuYue-IT/Lab12/actions/workflows/pages-deployment.yml/badge.svg)](https://github.com/ZhengwuYue-IT/Lab12/actions/workflows/pages-deployment.yml)

This independent Lab 12 repository extends the completed Lab 11 NoMash Library application.
It keeps the existing Vue functionality while adding a GitHub Actions continuous integration and
deployment pipeline for Cloudflare Pages. The repository contains one Vue/Vite project, and all
earlier Lab repositories remain unchanged.

## Assessed Deployment

| Item | Value |
| --- | --- |
| GitHub repository | `https://github.com/ZhengwuYue-IT/Lab12` |
| GitHub workflow | `Verify and Deploy to Cloudflare Pages` |
| Cloudflare project | `fit5032-lab12` |
| Production branch | `main` |
| Build output | `dist` |
| Production URL | Pending the first verified GitHub Actions deployment |

The project uses Wrangler Direct Upload from GitHub Actions. It does not claim to use Cloudflare
Git Integration.

## Verified CI/CD Contract

Every push to `main`, and every manual `workflow_dispatch` run, performs these steps in order:

1. Check out the exact commit.
2. Use Node.js `22.16.0` and the npm cache.
3. Install the locked dependency graph with `npm ci`.
4. Confirm the OpenWeather build variable is present without printing its value.
5. Run ESLint, all Vitest tests, and the Vite production build through `npm run verify`.
6. Audit production dependencies at high severity.
7. Deploy the verified `dist` directory to the `fit5032-lab12` Cloudflare Pages project.
8. Smoke-test the exact deployment URL returned by Wrangler.

Deployment is gated: Cloudflare is not called when linting, tests, the build, or the production
dependency audit fails.

## Required GitHub Actions Secrets

The workflow references three repository secrets. Their values must never be committed:

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Least-privilege Cloudflare Pages deployment authentication |
| `CLOUDFLARE_ACCOUNT_ID` | Selects the Cloudflare account containing the Pages project |
| `VITE_OPENWEATHER_API_KEY` | Supplies the existing weather key during the Vite build |

GitHub supplies `GITHUB_TOKEN` automatically with the workflow's explicit `contents: read` and
`deployments: write` permissions. The live OpenWeather value remains client-visible after Vite
compilation, so it is treated as a course API key rather than a server-side secret.

## Local Setup

Requirements:

- Node.js `22.16.0`
- npm with lockfile support
- an ignored `.env.local` containing the required local values

Install and start the application:

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and replace only the placeholders needed for the activity.
Never commit `.env.local`.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | NoMash Library home page |
| `/WeatherCheck` | Current-location and city weather in Celsius |
| `/CountBookAPI` | Author and book totals as formatted JSON |
| `/GetAllBookAPI` | All six book records as formatted JSON |

Cloudflare Pages receives `public/_redirects`, so refreshing a Vue Router history URL resolves to
the application shell. `public/_headers` permits self-origin geolocation on the HTTPS deployment.

## Verification

Run the complete local gate:

```bash
npm run verify
```

Run the read-only production smoke test after a deployment:

```bash
LAB12_PRODUCTION_URL=https://DEPLOYMENT_URL npm run verify:production
```

The smoke test requires HTTP 200 for `/`, `/WeatherCheck`, `/CountBookAPI`,
`/GetAllBookAPI`, and the current hashed JavaScript asset. It also checks the production
`Permissions-Policy: geolocation=(self)` header.

## Lab 12 Research Boundary

The assessed PDF contains the two required research answers:

- Time To First Byte (TTFB), including measurement and reduction strategies.
- Hotlinking, including prevention controls and legitimate-sharing exceptions.

The lab instructions state that these optimisation topics are theoretical. No unverified
Hotlink Protection or custom-domain configuration is claimed in this repository.

## Repository Boundary

- Public source: this repository only.
- LaTeX evidence and assessment screenshots: stored outside the public repository.
- Local API values and deployment credentials: ignored local storage or GitHub Actions Secrets.
- Previous Lab repositories and PDFs: preserved unchanged.

## References

- [Cloudflare Pages - Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [GitHub Actions - Secrets](https://docs.github.com/en/actions/concepts/security/secrets)
- [web.dev - Time to First Byte](https://web.dev/articles/ttfb)
- [web.dev - Optimize Time to First Byte](https://web.dev/articles/optimize-ttfb)
- [Cloudflare - Hotlink Protection](https://developers.cloudflare.com/waf/tools/scrape-shield/hotlink-protection/)
