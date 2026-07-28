# FIT5032 Assessed Lab 11 - Vue Deployment with Cloudflare Pages

This independent Lab 11 repository extends the completed Lab 10 NoMash Library application and
deploys the single Vue/Vite project to Cloudflare Pages. The public source remains in one GitHub
repository, while Cloudflare's official Wrangler Direct Upload workflow publishes the verified
`dist` build. The application retains the current-location and city weather page, the two local
JSON API-style pages, and the earlier Firebase and cloud-function learning activities.

## Assessed Deployment

The deployed project uses the following production settings:

| Setting | Value |
| --- | --- |
| Cloudflare project | `fit5032-lab11` |
| Deployment method | Wrangler Direct Upload |
| Production branch metadata | `main` |
| Local build command | `npm run build` |
| Uploaded directory | `dist` |
| Node version | `22.16.0` from `.node-version` |
| Weather variable | `VITE_OPENWEATHER_API_KEY` from ignored `.env.local` at build time |

The API key and temporary Cloudflare deployment token are never committed. For this coursework
architecture the OpenWeather key is supplied as a Vite build-time variable, so it is client-visible
after compilation and should be rotated after the assessment if it is not intended for continued
public use.

## Verified Deployment Result

- Production: `https://fit5032-lab11-1l0.pages.dev`
- Initial diagnostic deployment: omitted the production weather key and reproduced the expected
  `OpenWeather is not configured` state.
- Corrected production deployment: rebuilt with the ignored environment value and verified live
  current-location and `Clayton, AU` weather in Celsius with the corresponding icon.
- Cloudflare deployment history preserves both diagnostic and corrected deployments for assessment
  traceability.

## Production Routing and Geolocation

- `public/_redirects` serves `index.html` for Vue Router history URLs such as `/WeatherCheck`.
- `public/_headers` explicitly allows geolocation for the deployed application origin.
- OpenWeather Direct Geocoding resolves city searches before Current Weather is requested with
  `units=metric`.
- Location denial or failure does not disable manual city search.

## Assessed Routes

| Route | Expected production result |
| --- | --- |
| `/` | NoMash Library home page |
| `/WeatherCheck` | Current-location and city weather in Celsius with an icon |
| `/CountBookAPI` | 3 authors and 6 books as formatted JSON |
| `/GetAllBookAPI` | All six famous works with title, year and author |

## Local Setup

Install the locked dependencies:

```powershell
npm ci
```

Copy `.env.example` to `.env.local` and add an active OpenWeather API key:

```text
VITE_OPENWEATHER_API_KEY=your_local_key
```

Start the development server:

```powershell
npm run dev
```

Open `http://localhost:5173/WeatherCheck` and grant location permission when prompted.

## Verification

Run the complete local gate:

```powershell
npm run verify
```

It runs ESLint, Vitest and the Vite production build. Automated coverage includes:

- catalogue totals and six flattened book records;
- OpenWeather geocoding, coordinate requests, metric units and error handling;
- the three assessed Lab 10 routes;
- Cloudflare Node, SPA fallback, geolocation header and single-project configuration.

Run the read-only production smoke gate:

```powershell
npm run verify:production
```

It checks `/`, `/WeatherCheck`, `/CountBookAPI`, and `/GetAllBookAPI` for HTTP 200 responses,
confirms the built JavaScript asset is available, and verifies the production
`Permissions-Policy: geolocation=(self)` header.

Production acceptance additionally checks direct route refreshes, real current-location weather,
the assessed `Clayton, AU` search, mobile layout and a clean browser console.

## Repository and Evidence Boundary

- Source repository: `https://github.com/ZhengwuYue-IT/Lab11`
- Production URL: `https://fit5032-lab11-1l0.pages.dev`
- LaTeX evidence and screenshots: stored outside this public repository
- Local API keys and deployment tokens: stored only in ignored local files or transient process
  environment variables
- Previous Lab repositories: preserved unchanged

## References

- [Cloudflare Pages - Deploy a Vue site](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/)
- [Cloudflare Pages - Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Wrangler - Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/)
- [Cloudflare Pages - Serving Pages and SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [OpenWeather Current Weather API](https://openweathermap.org/api/current)
- [OpenWeather Geocoding API](https://openweathermap.org/api/geocoding-api)
