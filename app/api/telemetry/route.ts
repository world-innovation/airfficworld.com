import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const { drone_id, latitude, longitude, altitude, timestamp } = body as Record<string, unknown>

  // Validate required fields
  if (typeof drone_id !== 'string' || drone_id.trim() === '') {
    return Response.json(
      { error: 'drone_id must be a non-empty string' },
      { status: 422, headers: CORS_HEADERS }
    )
  }
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return Response.json(
      { error: 'latitude must be a number between -90 and 90' },
      { status: 422, headers: CORS_HEADERS }
    )
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return Response.json(
      { error: 'longitude must be a number between -180 and 180' },
      { status: 422, headers: CORS_HEADERS }
    )
  }
  if (typeof altitude !== 'number' || altitude < 0) {
    return Response.json(
      { error: 'altitude must be a non-negative number' },
      { status: 422, headers: CORS_HEADERS }
    )
  }

  const ts = timestamp ?? new Date().toISOString()
  if (typeof ts !== 'string' || isNaN(Date.parse(ts as string))) {
    return Response.json(
      { error: 'timestamp must be a valid ISO 8601 string' },
      { status: 422, headers: CORS_HEADERS }
    )
  }

  const { data, error } = await supabase
    .from('flight_telemetry')
    .insert({
      drone_id: drone_id.trim(),
      latitude,
      longitude,
      altitude,
      timestamp: ts,
    })
    .select('id, drone_id, latitude, longitude, altitude, timestamp')
    .single()

  if (error) {
    console.error('[telemetry] Supabase insert error:', error)
    return Response.json(
      { error: 'Failed to persist telemetry', detail: error.message },
      { status: 500, headers: CORS_HEADERS }
    )
  }

  return Response.json(
    { success: true, record: data },
    { status: 201, headers: CORS_HEADERS }
  )
}
