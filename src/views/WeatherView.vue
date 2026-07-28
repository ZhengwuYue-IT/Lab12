<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  weatherErrorMessage
} from '../services/weatherApi'

const city = ref('')
const weatherData = ref(null)
const resolvedLocation = ref(null)
const requestSource = ref('')
const statusMessage = ref('Preparing current-location weather...')
const errorMessage = ref('')
const isLoading = ref(false)
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim() ?? ''

let latestRequest = 0

const temperature = computed(() =>
  weatherData.value ? Math.round(weatherData.value.main.temp) : null
)

const feelsLike = computed(() =>
  weatherData.value ? Math.round(weatherData.value.main.feels_like) : null
)

const iconUrl = computed(() => {
  const icon = weatherData.value?.weather?.[0]?.icon
  return icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
})

const description = computed(() => {
  const value = weatherData.value?.weather?.[0]?.description ?? ''
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
})

const locationName = computed(() => {
  if (!weatherData.value) return ''
  if (resolvedLocation.value?.name && resolvedLocation.value?.country) {
    return `${resolvedLocation.value.name}, ${resolvedLocation.value.country}`
  }
  return `${weatherData.value.name}, ${weatherData.value.sys.country}`
})

const beginRequest = (message) => {
  latestRequest += 1
  isLoading.value = true
  errorMessage.value = ''
  statusMessage.value = message
  return latestRequest
}

const finishWithError = (requestId, message) => {
  if (requestId !== latestRequest) return
  isLoading.value = false
  statusMessage.value = ''
  errorMessage.value = message
}

const applyWeather = (requestId, weather, source, location = null) => {
  if (requestId !== latestRequest) return
  weatherData.value = weather
  resolvedLocation.value = location
  requestSource.value = source
  isLoading.value = false
  statusMessage.value = 'Live current weather loaded successfully.'
  errorMessage.value = ''
}

const loadCurrentLocation = () => {
  const requestId = beginRequest('Requesting permission to use your current location...')

  if (!apiKey) {
    finishWithError(
      requestId,
      'OpenWeather is not configured. Add the API key to the local environment file.'
    )
    return
  }

  if (!navigator.geolocation) {
    finishWithError(
      requestId,
      'This browser does not provide location access. You can still search by city.'
    )
    return
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      if (requestId !== latestRequest) return
      statusMessage.value = 'Loading weather for your current coordinates...'

      try {
        const weather = await fetchWeatherByCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
          apiKey
        })
        applyWeather(requestId, weather, 'Current location')
      } catch (error) {
        console.error('[OpenWeather] Current-location request failed:', error)
        finishWithError(requestId, weatherErrorMessage(error))
      }
    },
    (error) => {
      const messages = {
        1: 'Location permission was denied. You can still search by city.',
        2: 'Your current location is unavailable. You can still search by city.',
        3: 'Location lookup timed out. You can still search by city.'
      }
      finishWithError(requestId, messages[error.code] ?? 'Unable to determine your location.')
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
  )
}

const searchByCity = async () => {
  const requestId = beginRequest('Finding the city and loading its current weather...')

  try {
    const { weather, location } = await fetchWeatherByCity({ city: city.value, apiKey })
    applyWeather(requestId, weather, 'City search', location)
  } catch (error) {
    console.error('[OpenWeather] City search failed:', error)
    finishWithError(requestId, weatherErrorMessage(error))
  }
}

onMounted(loadCurrentLocation)
</script>

<template>
  <section class="page-wrap weather-page" aria-labelledby="weather-heading">
    <div class="weather-hero">
      <div>
        <p class="eyebrow">Lab 10 - External API service</p>
        <h1 id="weather-heading" class="page-title text-start">Current Weather</h1>
        <p class="page-lead">
          Allow location access or search for a city to retrieve live OpenWeather conditions in
          Celsius.
        </p>
      </div>
      <span class="live-badge"><span aria-hidden="true"></span> Live API</span>
    </div>

    <div class="weather-layout">
      <div class="search-panel surface-card">
        <form class="city-form" aria-label="Search weather by city" @submit.prevent="searchByCity">
          <label class="form-label" for="city-search">Search weather by city</label>
          <p class="form-hint">Include a two-letter country code for an accurate match.</p>
          <div class="input-group input-group-lg">
            <input
              id="city-search"
              v-model="city"
              class="form-control"
              type="text"
              autocomplete="off"
              placeholder="Clayton, AU"
              :disabled="isLoading"
            />
            <button class="btn btn-primary px-4" type="submit" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>
              {{ isLoading ? 'Loading...' : 'Search' }}
            </button>
          </div>
        </form>

        <button
          class="location-button"
          type="button"
          :disabled="isLoading"
          @click="loadCurrentLocation"
        >
          <span class="location-icon" aria-hidden="true">◎</span>
          Use my current location
        </button>

        <div class="status-area" aria-live="polite">
          <p v-if="statusMessage" class="status-message">
            <span class="status-dot" aria-hidden="true"></span>{{ statusMessage }}
          </p>
          <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
        </div>

        <div class="api-flow" aria-label="Weather API data flow">
          <span>Browser location / city</span>
          <strong aria-hidden="true">→</strong>
          <span>OpenWeather HTTPS API</span>
          <strong aria-hidden="true">→</strong>
          <span>Metric JSON</span>
        </div>
      </div>

      <article v-if="weatherData" class="weather-card" aria-live="polite">
        <div class="weather-card-top">
          <div>
            <span class="source-chip">{{ requestSource }}</span>
            <h2>{{ locationName }}</h2>
            <p v-if="resolvedLocation?.state" class="state-name">
              {{ resolvedLocation.state }}, {{ resolvedLocation.country }}
            </p>
          </div>
          <img :src="iconUrl" :alt="`${description} weather icon`" width="100" height="100" />
        </div>

        <div class="temperature-row">
          <strong>{{ temperature }}<sup>°C</sup></strong>
          <div>
            <p>{{ description }}</p>
            <span>Feels like {{ feelsLike }}°C</span>
          </div>
        </div>

        <dl class="weather-metrics">
          <div>
            <dt>Humidity</dt>
            <dd>{{ weatherData.main.humidity }}%</dd>
          </div>
          <div>
            <dt>Wind</dt>
            <dd>{{ weatherData.wind.speed }} m/s</dd>
          </div>
          <div>
            <dt>Pressure</dt>
            <dd>{{ weatherData.main.pressure }} hPa</dd>
          </div>
        </dl>
      </article>

      <aside v-else class="weather-placeholder surface-card" aria-hidden="true">
        <div class="placeholder-sun"></div>
        <h2>Weather result</h2>
        <p>Your live weather card will appear here.</p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.weather-page {
  padding-top: 2.8rem;
}

.weather-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.7rem;
}

.live-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid #b6e2cf;
  border-radius: 999px;
  color: #176b47;
  background: #edfdf5;
  font-size: 0.8rem;
  font-weight: 800;
}

.live-badge span,
.status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #20a66a;
  box-shadow: 0 0 0 0.2rem rgba(32, 166, 106, 0.14);
}

.weather-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: 1.6rem;
}

.search-panel {
  padding: clamp(1.35rem, 3vw, 2.2rem);
}

.form-label {
  margin-bottom: 0.2rem;
  color: #102a43;
  font-weight: 800;
}

.form-hint {
  margin-bottom: 1rem;
  color: #627d98;
  font-size: 0.9rem;
}

.location-button {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1rem;
  padding: 0.6rem 0.8rem;
  border: 0;
  border-radius: 0.6rem;
  color: #086f77;
  background: #eaf8f8;
  font-weight: 750;
}

.location-button:hover:not(:disabled),
.location-button:focus-visible {
  background: #d8f0f1;
}

.location-icon {
  font-size: 1.3rem;
}

.status-area {
  min-height: 4.3rem;
  margin-top: 1.1rem;
}

.status-message,
.error-message {
  margin: 0;
  padding: 0.8rem 0.95rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #245b46;
  background: #edfdf5;
}

.error-message {
  color: #9b2c2c;
  background: #fff1f1;
}

.api-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1.4rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e4edf3;
}

.api-flow span {
  padding: 0.35rem 0.55rem;
  border-radius: 0.5rem;
  color: #486581;
  background: #f0f4f8;
  font-size: 0.75rem;
  font-weight: 700;
}

.api-flow strong {
  color: #829ab1;
}

.weather-card,
.weather-placeholder {
  min-height: 430px;
  border-radius: 1.1rem;
}

.weather-card {
  overflow: hidden;
  padding: clamp(1.5rem, 3vw, 2.35rem);
  color: white;
  background:
    radial-gradient(circle at 88% 9%, rgba(255, 213, 112, 0.42), transparent 11rem),
    linear-gradient(145deg, #0a7580, #143a5b 72%);
  box-shadow: 0 18px 40px rgba(16, 42, 67, 0.2);
}

.weather-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.weather-card h2 {
  margin: 0.8rem 0 0;
  color: white;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  font-weight: 800;
}

.source-chip {
  padding: 0.3rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 999px;
  color: #d9f6f8;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.state-name {
  margin: 0.3rem 0 0;
  color: #c4e9ed;
  font-size: 0.9rem;
}

.temperature-row {
  display: flex;
  align-items: center;
  gap: 1.3rem;
  margin: 2rem 0;
}

.temperature-row > strong {
  font-size: clamp(4.2rem, 9vw, 6.4rem);
  line-height: 0.9;
  letter-spacing: -0.08em;
}

.temperature-row sup {
  margin-left: 0.2rem;
  font-size: 1.4rem;
  letter-spacing: 0;
  vertical-align: top;
}

.temperature-row p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.temperature-row span {
  color: #c4e9ed;
  font-size: 0.9rem;
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 0;
}

.weather-metrics div {
  padding: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
}

.weather-metrics dt {
  color: #b8d8e7;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.weather-metrics dd {
  margin: 0.25rem 0 0;
  font-weight: 800;
}

.weather-placeholder {
  display: grid;
  place-content: center;
  text-align: center;
  background:
    radial-gradient(circle at 65% 28%, rgba(255, 202, 88, 0.38), transparent 8rem),
    linear-gradient(160deg, #edf8fa, #dbeafe);
}

.weather-placeholder h2 {
  margin: 1rem 0 0.25rem;
  color: #174f63;
  font-weight: 800;
}

.weather-placeholder p {
  color: #627d98;
}

.placeholder-sun {
  width: 74px;
  height: 74px;
  margin: 0 auto;
  border: 10px solid rgba(255, 202, 88, 0.36);
  border-radius: 50%;
  background: #ffca58;
  box-shadow: 55px 18px 0 -18px #b8d8e7;
}

@media (max-width: 991.98px) {
  .weather-layout {
    grid-template-columns: 1fr;
  }

  .weather-card,
  .weather-placeholder {
    min-height: 380px;
  }
}

@media (max-width: 575.98px) {
  .weather-page {
    padding-top: 1.5rem;
  }

  .weather-hero {
    flex-direction: column;
    gap: 0.4rem;
  }

  .input-group {
    display: grid;
    gap: 0.6rem;
  }

  .input-group > .form-control,
  .input-group > .btn {
    width: 100%;
    border-radius: 0.55rem !important;
  }

  .weather-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
