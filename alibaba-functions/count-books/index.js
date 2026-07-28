'use strict'

const books = require('./books.json')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json; charset=utf-8'
}

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(payload)
})

const parseEvent = (event) => {
  if (event && typeof event === 'object' && !Buffer.isBuffer(event)) return event
  return JSON.parse(Buffer.from(event).toString('utf8'))
}

exports.handler = async (event) => {
  try {
    const request = parseEvent(event)
    const method = request.requestContext?.http?.method ?? request.httpMethod ?? 'GET'

    if (method !== 'GET') {
      return jsonResponse(405, { ok: false, error: 'Method not allowed.' })
    }

    return jsonResponse(200, {
      ok: true,
      platform: 'Alibaba Cloud Function Compute',
      region: 'cn-hangzhou',
      dataSource: 'books.json',
      count: books.length
    })
  } catch (error) {
    console.error('countBooks failed:', error)
    return jsonResponse(500, { ok: false, error: 'Unable to count books.' })
  }
}
