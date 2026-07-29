const retryableStatuses = new Set([
  408,
  425,
  429,
  500,
  502,
  503,
  504,
  520,
  521,
  522,
  523,
  524,
])

const defaultSleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

export const isRetryableStatus = (status) => retryableStatuses.has(status)

export const fetchWithRetry = async (
  url,
  {
    attempts = 10,
    delayMilliseconds = 3000,
    fetchImpl = fetch,
    requestOptions = {},
    sleep = defaultSleep,
  } = {},
) => {
  let lastError = null
  let lastResponse = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, requestOptions)
      lastResponse = response

      if (response.ok || !isRetryableStatus(response.status)) {
        return { response, attemptsUsed: attempt }
      }

      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    if (attempt < attempts) {
      console.error(
        `Production endpoint is not ready (attempt ${attempt}/${attempts}); retrying`,
      )
      await sleep(delayMilliseconds)
    }
  }

  if (lastResponse) {
    return { response: lastResponse, attemptsUsed: attempts }
  }

  throw lastError ?? new Error('Production verification request failed')
}
