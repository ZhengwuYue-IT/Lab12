import { describe, expect, it } from 'vitest'
import router from './index'

describe('Lab 10 routes', () => {
  it.each([
    ['GetWeather', '/WeatherCheck'],
    ['CountBookAPI', '/CountBookAPI'],
    ['GetAllBookAPI', '/GetAllBookAPI']
  ])('registers %s at %s', (name, path) => {
    const route = router.getRoutes().find((candidate) => candidate.name === name)

    expect(route).toBeDefined()
    expect(route.path).toBe(path)
  })
})
