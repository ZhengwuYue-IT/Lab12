import process from 'node:process'

const productionBaseUrl = process.env.LAB12_PRODUCTION_URL?.trim()

if (!productionBaseUrl) {
  throw new Error('LAB12_PRODUCTION_URL is required for production verification')
}

const assessedRoutes = ['/', '/WeatherCheck', '/CountBookAPI', '/GetAllBookAPI']

const routeResults = await Promise.all(
  assessedRoutes.map(async (route) => {
    const url = new URL(route, productionBaseUrl)
    const response = await fetch(url, { redirect: 'error' })
    const body = await response.text()

    if (!response.ok) {
      throw new Error(`${route} returned HTTP ${response.status}`)
    }

    if (!response.headers.get('content-type')?.includes('text/html')) {
      throw new Error(`${route} did not return the Vue HTML shell`)
    }

    if (!body.includes('<div id="app"></div>')) {
      throw new Error(`${route} is missing the Vue mount element`)
    }

    return {
      route,
      status: response.status,
      permissionsPolicy: response.headers.get('permissions-policy'),
      body,
    }
  }),
)

const rootResult = routeResults.find(({ route }) => route === '/')
const assetPath = rootResult?.body.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1]

if (!assetPath) {
  throw new Error('The production HTML does not reference the built JavaScript asset')
}

const assetResponse = await fetch(new URL(assetPath, productionBaseUrl), {
  redirect: 'error',
})

if (!assetResponse.ok) {
  throw new Error(`The production JavaScript asset returned HTTP ${assetResponse.status}`)
}

if (
  !routeResults.every(
    ({ permissionsPolicy }) => permissionsPolicy === 'geolocation=(self)',
  )
) {
  throw new Error('The production geolocation Permissions-Policy header is missing')
}

console.log(
  JSON.stringify(
    {
      productionBaseUrl,
      routes: routeResults.map(({ route, status }) => ({ route, status })),
      asset: { path: assetPath, status: assetResponse.status },
      permissionsPolicy: 'geolocation=(self)',
    },
    null,
    2,
  ),
)
