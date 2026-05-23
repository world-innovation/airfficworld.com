#!/usr/bin/env python3
"""
Airspace OS – Drone Flight Simulator
=====================================
Sends realistic telemetry pings to the local (or deployed) API.

Usage:
    python simulate_drone.py                      # default: localhost
    python simulate_drone.py --url https://your-deployment.vercel.app
    python simulate_drone.py --drone UAV-ALPHA --interval 1.5
    python simulate_drone.py --lat 35.6762 --lon 139.6503  # Tokyo

Requirements:
    pip install requests
"""

import argparse
import math
import time
import datetime
import random
import sys

try:
    import requests
except ImportError:
    print("Missing dependency: pip install requests")
    sys.exit(1)

# ── Defaults ──────────────────────────────────────────────────────────────────
DEFAULT_URL      = "http://localhost:3000"
DEFAULT_DRONE_ID = "DRONE-001"
DEFAULT_LAT      = 37.7749   # San Francisco
DEFAULT_LON      = -122.4194
DEFAULT_ALT      = 50.0      # metres AGL
DEFAULT_INTERVAL = 2.0       # seconds between pings
RADIUS_DEG       = 0.01      # ~1 km circular orbit radius


def simulate(api_url: str, drone_id: str, lat: float, lon: float,
             altitude: float, interval: float) -> None:
    endpoint = f"{api_url.rstrip('/')}/api/telemetry"
    print(f"\n{'='*60}")
    print(f"  Airspace OS  |  Drone Simulator")
    print(f"{'='*60}")
    print(f"  Drone ID  : {drone_id}")
    print(f"  Origin    : {lat:.6f}, {lon:.6f}  @ {altitude:.1f} m")
    print(f"  Endpoint  : {endpoint}")
    print(f"  Interval  : {interval}s")
    print(f"{'='*60}\n")

    angle = 0.0
    ping  = 0

    while True:
        ping += 1
        # Fly a slow circular orbit with gentle altitude oscillation
        rad       = math.radians(angle)
        cur_lat   = lat + RADIUS_DEG * math.cos(rad)
        cur_lon   = lon + RADIUS_DEG * math.sin(rad)
        cur_alt   = altitude + 10 * math.sin(rad * 2) + random.uniform(-1, 1)
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        payload = {
            "drone_id":  drone_id,
            "latitude":  round(cur_lat, 7),
            "longitude": round(cur_lon, 7),
            "altitude":  round(max(0, cur_alt), 2),
            "timestamp": timestamp,
        }

        try:
            resp = requests.post(endpoint, json=payload, timeout=5)
            status = resp.status_code
            icon   = "✓" if status == 201 else "✗"
            print(f"  [{ping:04d}] {icon} {status} | lat={payload['latitude']:>12.7f}  "
                  f"lon={payload['longitude']:>13.7f}  alt={payload['altitude']:>6.1f}m")
            if status not in (200, 201):
                print(f"         └─ {resp.text[:120]}")
        except requests.exceptions.ConnectionError:
            print(f"  [{ping:04d}] ✗ Connection refused – is the server running?")
        except requests.exceptions.Timeout:
            print(f"  [{ping:04d}] ✗ Request timed out")

        angle = (angle + 5) % 360
        time.sleep(interval)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Airspace OS drone flight simulator")
    parser.add_argument("--url",      default=DEFAULT_URL,      help="Base URL of the API server")
    parser.add_argument("--drone",    default=DEFAULT_DRONE_ID, help="Drone identifier string")
    parser.add_argument("--lat",      default=DEFAULT_LAT,      type=float, help="Starting latitude")
    parser.add_argument("--lon",      default=DEFAULT_LON,      type=float, help="Starting longitude")
    parser.add_argument("--alt",      default=DEFAULT_ALT,      type=float, help="Starting altitude (metres)")
    parser.add_argument("--interval", default=DEFAULT_INTERVAL, type=float, help="Seconds between pings")
    args = parser.parse_args()

    try:
        simulate(args.url, args.drone, args.lat, args.lon, args.alt, args.interval)
    except KeyboardInterrupt:
        print("\n\n  Simulation stopped. Flight complete.\n")
