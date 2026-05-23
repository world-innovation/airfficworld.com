export interface TelemetryRecord {
  id: string
  drone_id: string
  latitude: number
  longitude: number
  altitude: number
  timestamp: string
  created_at: string
}

export interface DronePosition {
  drone_id: string
  latitude: number
  longitude: number
  altitude: number
  timestamp: string
}
