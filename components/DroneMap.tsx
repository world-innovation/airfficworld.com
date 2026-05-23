'use client'

import { useEffect, useState } from 'react'
import ReactMap, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'
import type { DronePosition, TelemetryRecord } from '@/types/telemetry'

type PositionMap = Record<string, DronePosition>

export default function DroneMap() {
  const [positions, setPositions] = useState<PositionMap>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [pingIds, setPingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Fetch latest position per drone on mount
    async function fetchLatest() {
      const { data } = await supabase
        .from('flight_telemetry')
        .select('drone_id, latitude, longitude, altitude, timestamp')
        .order('timestamp', { ascending: false })
        .limit(200)

      if (data) {
        const seen: PositionMap = {}
        for (const row of data) {
          if (!seen[row.drone_id]) {
            seen[row.drone_id] = row as DronePosition
          }
        }
        setPositions(seen)
      }
    }

    fetchLatest()

    // Subscribe to real-time inserts
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
          // Trigger ping animation
          setPingIds((prev) => {
            const next = new Set(prev)
            next.add(r.drone_id)
            return next
          })
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const droneList = Object.values(positions)
  const selectedDrone = selected ? positions[selected] : null

  return (
    <ReactMap
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -122.4194, latitude: 37.7749, zoom: 10 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={() => setSelected(null)}
    >
      <NavigationControl position="top-right" />

      {droneList.map((drone) => (
        <Marker
          key={drone.drone_id}
          longitude={drone.longitude}
          latitude={drone.latitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            setSelected(drone.drone_id)
          }}
        >
          <div className="relative cursor-pointer group">
            {/* Ping animation on new data */}
            {pingIds.has(drone.drone_id) && (
              <div className="absolute inset-0 h-5 w-5 -translate-x-0.5 -translate-y-0.5 animate-ping rounded-full bg-[#00d4ff]/60" />
            )}
            {/* Outer glow ring */}
            <div className="absolute -inset-2 rounded-full bg-[#00d4ff]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Core dot */}
            <div className="relative h-4 w-4 rounded-full border-2 border-[#00d4ff] bg-[#00d4ff]/30 shadow-[0_0_10px_#00d4ff]" />
          </div>
        </Marker>
      ))}

      {selectedDrone && (
        <Popup
          longitude={selectedDrone.longitude}
          latitude={selectedDrone.latitude}
          anchor="bottom"
          offset={16}
          onClose={() => setSelected(null)}
          closeOnClick={false}
        >
          <div className="p-3 font-mono text-xs min-w-[180px]">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d4ff]" />
              <span className="font-bold text-[#00d4ff] tracking-wider">{selectedDrone.drone_id}</span>
            </div>
            <div className="space-y-1 text-[#94a3b8]">
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">LAT</span>
                <span>{selectedDrone.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">LON</span>
                <span>{selectedDrone.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">ALT</span>
                <span className="text-[#00ff87]">{selectedDrone.altitude.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">PING</span>
                <span>{new Date(selectedDrone.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </ReactMap>
  )
}
