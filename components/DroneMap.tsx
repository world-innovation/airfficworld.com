'use client'

import { useEffect, useState } from 'react'
import ReactMap, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/mapbox'
import type { LayerProps } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'
import type { DronePosition, TelemetryRecord } from '@/types/telemetry'

type PositionMap = Record<string, DronePosition>
type TrailMap = Record<string, [number, number][]>

const TRAIL_LENGTH = 30

const trailLineLayer: LayerProps = {
  id: 'drone-trails',
  type: 'line',
  paint: {
    'line-color': '#00d4ff',
    'line-width': 1.5,
    'line-opacity': 0.35,
    'line-dasharray': [2, 2],
  },
}

const trailGlowLayer: LayerProps = {
  id: 'drone-trails-glow',
  type: 'line',
  paint: {
    'line-color': '#00d4ff',
    'line-width': 6,
    'line-opacity': 0.06,
  },
}

function buildTrailGeoJSON(trails: TrailMap): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: Object.entries(trails)
      .filter(([, coords]) => coords.length >= 2)
      .map(([droneId, coords]) => ({
        type: 'Feature' as const,
        properties: { drone_id: droneId },
        geometry: { type: 'LineString' as const, coordinates: coords },
      })),
  }
}

function DroneSVGMarker({ pinging }: { pinging: boolean }) {
  return (
    <div className="relative cursor-pointer group select-none">
      {/* Outer ping ring on new data */}
      {pinging && (
        <div className="absolute -inset-3 animate-ping rounded-full bg-[#00d4ff]/20 pointer-events-none" />
      )}
      {/* Hover halo */}
      <div className="absolute -inset-3 rounded-full bg-[#00d4ff]/0 group-hover:bg-[#00d4ff]/10 transition-colors duration-300 pointer-events-none" />
      {/* Drone icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10 drop-shadow-[0_0_6px_rgba(0,212,255,0.9)]"
      >
        {/* Body */}
        <circle cx="12" cy="12" r="3" fill="#00d4ff" opacity="0.95" />
        {/* Radar ring */}
        <circle cx="12" cy="12" r="5.5" stroke="#00d4ff" strokeWidth="0.6" opacity="0.4" strokeDasharray="2.5 2" />
        {/* Arms */}
        <line x1="12" y1="9" x2="6.5" y2="4" stroke="#00d4ff" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
        <line x1="12" y1="9" x2="17.5" y2="4" stroke="#00d4ff" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
        <line x1="12" y1="15" x2="6.5" y2="20" stroke="#00d4ff" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
        <line x1="12" y1="15" x2="17.5" y2="20" stroke="#00d4ff" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
        {/* Propellers */}
        <circle cx="6.5" cy="4" r="2" fill="#00d4ff" opacity="0.85" />
        <circle cx="17.5" cy="4" r="2" fill="#00d4ff" opacity="0.85" />
        <circle cx="6.5" cy="20" r="2" fill="#00d4ff" opacity="0.85" />
        <circle cx="17.5" cy="20" r="2" fill="#00d4ff" opacity="0.85" />
      </svg>
    </div>
  )
}

export default function DroneMap() {
  const [positions, setPositions] = useState<PositionMap>({})
  const [trails, setTrails] = useState<TrailMap>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [pingIds, setPingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchLatest() {
      const { data } = await supabase
        .from('flight_telemetry')
        .select('drone_id, latitude, longitude, altitude, timestamp')
        .order('timestamp', { ascending: false })
        .limit(300)

      if (data) {
        const seen: PositionMap = {}
        const trailAccum: TrailMap = {}

        // Build trails oldest→newest
        for (const row of [...data].reverse()) {
          if (!trailAccum[row.drone_id]) trailAccum[row.drone_id] = []
          trailAccum[row.drone_id].push([row.longitude, row.latitude])
        }
        // Trim to TRAIL_LENGTH
        for (const id of Object.keys(trailAccum)) {
          if (trailAccum[id].length > TRAIL_LENGTH) {
            trailAccum[id] = trailAccum[id].slice(-TRAIL_LENGTH)
          }
        }
        // Latest position per drone (data is desc so first = latest)
        for (const row of data) {
          if (!seen[row.drone_id]) seen[row.drone_id] = row as DronePosition
        }

        setPositions(seen)
        setTrails(trailAccum)
      }
    }

    fetchLatest()

    const channel = supabase
      .channel('realtime:flight_telemetry')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flight_telemetry' },
        (payload) => {
          const r = payload.new as TelemetryRecord
          setPositions((prev) => ({
            ...prev,
            [r.drone_id]: {
              drone_id: r.drone_id,
              latitude: r.latitude,
              longitude: r.longitude,
              altitude: r.altitude,
              timestamp: r.timestamp,
            },
          }))
          setTrails((prev) => {
            const existing = prev[r.drone_id] ?? []
            const updated = [...existing, [r.longitude, r.latitude] as [number, number]]
            return { ...prev, [r.drone_id]: updated.length > TRAIL_LENGTH ? updated.slice(-TRAIL_LENGTH) : updated }
          })
          setPingIds((prev) => new Set(prev).add(r.drone_id))
          setTimeout(() => {
            setPingIds((prev) => {
              const next = new Set(prev)
              next.delete(r.drone_id)
              return next
            })
          }, 1500)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const droneList = Object.values(positions)
  const selectedDrone = selected ? positions[selected] : null
  const trailGeoJSON = buildTrailGeoJSON(trails)

  return (
    <ReactMap
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -122.4194, latitude: 37.7749, zoom: 10 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={() => setSelected(null)}
    >
      <NavigationControl position="top-right" />

      {/* Flight trails */}
      <Source id="drone-trails-src" type="geojson" data={trailGeoJSON}>
        <Layer {...trailGlowLayer} />
        <Layer {...trailLineLayer} />
      </Source>

      {/* Drone markers */}
      {droneList.map((drone) => (
        <Marker
          key={drone.drone_id}
          longitude={drone.longitude}
          latitude={drone.latitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            setSelected(selected === drone.drone_id ? null : drone.drone_id)
          }}
        >
          <DroneSVGMarker pinging={pingIds.has(drone.drone_id)} />
        </Marker>
      ))}

      {/* Info popup */}
      {selectedDrone && (
        <Popup
          longitude={selectedDrone.longitude}
          latitude={selectedDrone.latitude}
          anchor="bottom"
          offset={20}
          onClose={() => setSelected(null)}
          closeOnClick={false}
        >
          <div className="p-3 font-mono text-xs min-w-[200px]">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d4ff]" />
              <span className="font-bold tracking-widest text-[#00d4ff]">{selectedDrone.drone_id}</span>
            </div>
            <div className="space-y-1.5 text-[#94a3b8]">
              {[
                { key: 'LAT', val: selectedDrone.latitude.toFixed(7), color: undefined },
                { key: 'LON', val: selectedDrone.longitude.toFixed(7), color: undefined },
                { key: 'ALT', val: `${selectedDrone.altitude.toFixed(1)} m`, color: '#00ff87' },
                { key: 'TIME', val: new Date(selectedDrone.timestamp).toLocaleTimeString(), color: undefined },
              ].map(({ key, val, color }) => (
                <div key={key} className="flex justify-between gap-6">
                  <span className="text-[#475569]">{key}</span>
                  <span style={color ? { color } : undefined}>{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 border-t border-[#1e2d42] pt-2 text-[#475569]">
              Trail: {(trails[selectedDrone.drone_id] ?? []).length} points
            </div>
          </div>
        </Popup>
      )}
    </ReactMap>
  )
}
