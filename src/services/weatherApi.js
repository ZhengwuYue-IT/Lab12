import axios from 'axios'

export const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct'
export const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

const requireApiKey = (apiKey) => {
  if (!apiKey?.trim()) {
    throw new Error('OPENWEATHER_KEY_MISSING')
  }

  return apiKey.trim()
}

export const normaliseCityQuery = (city) => city.trim().replace(/\s*,\s*/g, ',')

export const fetchWeatherByCoordinates = async ({
  latitude,
  longitude,
  apiKey,
  httpClient = axios
}) => {
  const key = requireApiKey(apiKey)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('INVALID_COORDINATES')
  }

  const response = await httpClient.get(CURRENT_WEATHER_URL, {
    params: {
      lat: latitude,
      lon: longitude,
      appid: key,
      units: 'metric'
    },
    timeout: 15000
  })

  if (!response.data?.main || !response.data?.weather?.[0]) {
    throw new Error('INVALID_WEATHER_RESPONSE')
  }

  return response.data
}

export const fetchWeatherByCity = async ({ city, apiKey, httpClient = axios }) => {
  const key = requireApiKey(apiKey)
  const query = normaliseCityQuery(city)

  if (!query) {
    throw new Error('CITY_REQUIRED')
  }

  const geocodingResponse = await httpClient.get(GEOCODING_URL, {
    params: {
      q: query,
      limit: 1,
      appid: key
    },
    timeout: 15000
  })

  const location = geocodingResponse.data?.[0]

  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lon)) {
    throw new Error('CITY_NOT_FOUND')
  }

  const weather = await fetchWeatherByCoordinates({
    latitude: location.lat,
    longitude: location.lon,
    apiKey: key,
    httpClient
  })

  return { weather, location }
}

export const weatherErrorMessage = (error) => {
  const status = error?.response?.status

  if (error?.message === 'OPENWEATHER_KEY_MISSING') {
    return 'OpenWeather is not configured. Add the API key to the local environment file.'
  }

  if (error?.message === 'CITY_REQUIRED') {
    return 'Enter a city and country, for example Clayton, AU.'
  }

  if (error?.message === 'CITY_NOT_FOUND') {
    return 'No matching city was found. Check the spelling and country code.'
  }

  if (status === 401) {
    return 'OpenWeather rejected the API key. Check that the key is active.'
  }

  if (status === 429) {
    return 'The OpenWeather request limit has been reached. Please try again later.'
  }

  return 'Weather data is unavailable right now. Check the connection and try again.'
}
