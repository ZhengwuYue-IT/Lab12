import { describe, expect, it, vi } from 'vitest'
import {
  CURRENT_WEATHER_URL,
  GEOCODING_URL,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  normaliseCityQuery,
  weatherErrorMessage
} from './weatherApi'

const weatherPayload = {
  name: 'Clayton',
  sys: { country: 'AU' },
  main: { temp: 16, feels_like: 15, humidity: 70, pressure: 1020 },
  wind: { speed: 3.2 },
  weather: [{ description: 'clear sky', icon: '01d' }]
}

describe('OpenWeather service', () => {
  it('normalises city and country input', () => {
    expect(normaliseCityQuery('  Clayton, AU  ')).toBe('Clayton,AU')
  })

  it('requests current weather by coordinates in metric units', async () => {
    const httpClient = { get: vi.fn().mockResolvedValue({ data: weatherPayload }) }

    const response = await fetchWeatherByCoordinates({
      latitude: -37.92,
      longitude: 145.12,
      apiKey: 'test-key',
      httpClient
    })

    expect(response).toBe(weatherPayload)
    expect(httpClient.get).toHaveBeenCalledWith(CURRENT_WEATHER_URL, {
      params: {
        lat: -37.92,
        lon: 145.12,
        appid: 'test-key',
        units: 'metric'
      },
      timeout: 15000
    })
  })

  it('geocodes a city before requesting its weather', async () => {
    const location = { name: 'Clayton', state: 'Victoria', country: 'AU', lat: -37.92, lon: 145.12 }
    const httpClient = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: [location] })
        .mockResolvedValueOnce({ data: weatherPayload })
    }

    const result = await fetchWeatherByCity({
      city: 'Clayton, AU',
      apiKey: 'test-key',
      httpClient
    })

    expect(result).toEqual({ weather: weatherPayload, location })
    expect(httpClient.get).toHaveBeenNthCalledWith(1, GEOCODING_URL, {
      params: { q: 'Clayton,AU', limit: 1, appid: 'test-key' },
      timeout: 15000
    })
    expect(httpClient.get).toHaveBeenNthCalledWith(
      2,
      CURRENT_WEATHER_URL,
      expect.objectContaining({ params: expect.objectContaining({ units: 'metric' }) })
    )
  })

  it('rejects an empty query or missing geocoding result', async () => {
    await expect(fetchWeatherByCity({ city: ' ', apiKey: 'test-key' })).rejects.toThrow(
      'CITY_REQUIRED'
    )

    const httpClient = { get: vi.fn().mockResolvedValue({ data: [] }) }
    await expect(
      fetchWeatherByCity({ city: 'Not a real city', apiKey: 'test-key', httpClient })
    ).rejects.toThrow('CITY_NOT_FOUND')
  })

  it('maps API and configuration errors to helpful user messages', () => {
    expect(weatherErrorMessage(new Error('OPENWEATHER_KEY_MISSING'))).toContain('not configured')
    expect(weatherErrorMessage({ response: { status: 401 } })).toContain('rejected the API key')
    expect(weatherErrorMessage({ response: { status: 429 } })).toContain('request limit')
  })
})
