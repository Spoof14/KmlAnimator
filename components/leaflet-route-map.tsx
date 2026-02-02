"use client"

import { useEffect, useRef } from "react"
import type { Coordinate } from "@/lib/kml-parser"
import type { VehicleType, MapStyle } from "@/lib/vehicle-icons"
import type { CameraMode } from "@/lib/camera"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type LeafletRouteMapProps = {
  coordinates: Coordinate[]
  progress: number
  lineColor: string
  lineWidth: number
  showDot: boolean
  dotColor: string
  vehicleType: VehicleType
  mapStyle: MapStyle
  cameraMode: CameraMode
}

// Map tile providers
const tileProviders: Record<MapStyle, { url: string; attribution: string }> = {
  world: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  "world-dark": {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  "world-outline": {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

// Vehicle SVG icons - simple dark icons for visibility
function getVehicleSvg(type: VehicleType, color: string, size: number): string {
  const encodedColor = encodeURIComponent(color)
  const fill = encodedColor
  const stroke = encodedColor
  
  switch (type) {
    case "car":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 24' width='${size}' height='${size * 0.6}'%3E%3Cpath d='M4 18 L4 12 C4 12 4 8 8 6 L12 5 L28 5 L32 6 C36 8 36 12 36 12 L36 18' fill='${fill}' stroke='${stroke}' strokeWidth='2'/%3E%3Ccircle cx='10' cy='18' r='3' fill='${fill}'/%3E%3Ccircle cx='30' cy='18' r='3' fill='${fill}'/%3E%3Cpath d='M10 9 L14 7 L26 7 L30 9' fill='white' stroke='white' strokeWidth='1'/%3E%3C/svg%3E`
    case "suv":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 28' width='${size}' height='${size * 0.64}'%3E%3Cpath d='M4 20 L4 12 L8 6 L14 4 L30 4 L36 6 L40 12 L40 20' fill='${fill}' stroke='${stroke}' strokeWidth='2'/%3E%3Ccircle cx='12' cy='20' r='4' fill='${fill}'/%3E%3Ccircle cx='32' cy='20' r='4' fill='${fill}'/%3E%3Crect x='10' y='6' width='24' height='8' rx='2' fill='white' stroke='white' strokeWidth='1'/%3E%3C/svg%3E`
    case "truck":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 28' width='${size * 1.2}' height='${size * 0.65}'%3E%3Crect x='2' y='6' width='28' height='16' rx='2' fill='${fill}' stroke='${stroke}' strokeWidth='2'/%3E%3Cpath d='M30 10 L30 22 L48 22 L48 14 L42 8 L30 8' fill='${fill}' stroke='${stroke}' strokeWidth='2'/%3E%3Ccircle cx='10' cy='22' r='4' fill='${fill}'/%3E%3Ccircle cx='40' cy='22' r='4' fill='${fill}'/%3E%3Crect x='32' y='10' width='8' height='6' fill='white'/%3E%3C/svg%3E`
    case "plane":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 32' width='${size * 1.2}' height='${size * 0.8}'%3E%3Cpath d='M2 16 L12 14 L12 6 C12 4 14 4 16 4 L16 14 L36 14 L40 10 L44 10 L44 14 L46 14 L46 18 L44 18 L44 22 L40 22 L36 18 L16 18 L16 28 C14 28 12 28 12 26 L12 18 L2 16 Z' fill='${fill}' stroke='${stroke}' strokeWidth='1.5'/%3E%3C/svg%3E`
    case "boat":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 28' width='${size}' height='${size * 0.64}'%3E%3Cpath d='M4 20 L10 10 L34 10 L40 20 L38 22 C32 26 12 26 6 22 L4 20 Z' fill='${fill}' stroke='${stroke}' strokeWidth='2'/%3E%3Crect x='18' y='4' width='8' height='8' fill='${fill}'/%3E%3Cpath d='M12 12 L32 12' stroke='white' strokeWidth='2'/%3E%3C/svg%3E`
    case "motorcycle":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 24' width='${size}' height='${size * 0.6}'%3E%3Ccircle cx='8' cy='16' r='5' fill='none' stroke='${stroke}' strokeWidth='2'/%3E%3Ccircle cx='32' cy='16' r='5' fill='none' stroke='${stroke}' strokeWidth='2'/%3E%3Cpath d='M13 16 L18 8 L26 8 L28 12 L27 16' fill='${fill}' stroke='${stroke}' strokeWidth='2'/%3E%3Ccircle cx='20' cy='6' r='3' fill='${fill}'/%3E%3C/svg%3E`
    case "bicycle":
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 24' width='${size}' height='${size * 0.6}'%3E%3Ccircle cx='8' cy='16' r='5' fill='none' stroke='${stroke}' strokeWidth='2'/%3E%3Ccircle cx='32' cy='16' r='5' fill='none' stroke='${stroke}' strokeWidth='2'/%3E%3Cpath d='M8 16 L16 6 L24 6 L32 16' fill='none' stroke='${stroke}' strokeWidth='2'/%3E%3Cpath d='M16 6 L20 2 M24 6 L20 2' stroke='${stroke}' strokeWidth='2'/%3E%3C/svg%3E`
    case "dot":
    default:
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${size}' height='${size}'%3E%3Ccircle cx='12' cy='12' r='10' fill='${fill}' fillOpacity='0.3'/%3E%3Ccircle cx='12' cy='12' r='6' fill='${fill}'/%3E%3C/svg%3E`
  }
}

// Calculate bearing between two points
function calculateBearing(from: Coordinate, to: Coordinate): number {
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const dLon = ((to.lng - from.lng) * Math.PI) / 180

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}

// Smooth angle interpolation
function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from
  while (diff > 180) diff -= 360
  while (diff < -180) diff += 360
  return from + diff * t
}

export function LeafletRouteMap({
  coordinates,
  progress,
  lineColor,
  lineWidth,
  showDot,
  dotColor,
  vehicleType,
  mapStyle,
  cameraMode,
}: LeafletRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const fullRouteRef = useRef<L.Polyline | null>(null)
  const animatedRouteRef = useRef<L.Polyline | null>(null)
  const vehicleMarkerRef = useRef<L.Marker | null>(null)
  const startMarkerRef = useRef<L.CircleMarker | null>(null)
  const endMarkerRef = useRef<L.CircleMarker | null>(null)
  const smoothBearingRef = useRef(0)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const zoomRangeRef = useRef<{ start: number; end: number } | null>(null)

  const updateCamera = (center: L.LatLng, zoom: number) => {
    const map = mapRef.current
    if (!map) return

    const currentZoom = map.getZoom()
    const currentCenter = map.getCenter()
    const zoomDelta = Math.abs(currentZoom - zoom)
    const centerDelta = currentCenter.distanceTo(center)

    if (zoomDelta < 0.01 && centerDelta < 0.5) return
    map.setView(center, zoom, { animate: false })
  }

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    })

    // Add tile layer
    const tileConfig = tileProviders[mapStyle]
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    tileLayerRef.current = tileLayer

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update tile layer when map style changes
  useEffect(() => {
    if (!mapRef.current) return

    if (tileLayerRef.current) {
      tileLayerRef.current.remove()
    }

    const tileConfig = tileProviders[mapStyle]
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current)
  }, [mapStyle])

  // Update route and bounds when coordinates change
  useEffect(() => {
    const map = mapRef.current
    if (!map || coordinates.length === 0) return

    // Remove existing layers
    if (fullRouteRef.current) fullRouteRef.current.remove()
    if (animatedRouteRef.current) animatedRouteRef.current.remove()
    if (startMarkerRef.current) startMarkerRef.current.remove()
    if (endMarkerRef.current) endMarkerRef.current.remove()
    if (vehicleMarkerRef.current) vehicleMarkerRef.current.remove()

    // Convert coordinates to LatLng
    const latLngs = coordinates.map((c) => L.latLng(c.lat, c.lng))

    const bounds = L.latLngBounds(latLngs)
    boundsRef.current = bounds

    const padding: [number, number] = [50, 50]
    const boundsZoom = map.getBoundsZoom(bounds, false, padding)
    const startZoom = clamp(boundsZoom - 1.25, 2, 18)
    const endZoom = Math.max(startZoom + 0.5, clamp(boundsZoom + 2, 3, 19))
    zoomRangeRef.current = { start: startZoom, end: endZoom }

    if (cameraMode === "static") {
      map.fitBounds(bounds, { padding })
    } else {
      map.setView(bounds.getCenter(), startZoom, { animate: false })
    }

    // Draw full route (faded)
    fullRouteRef.current = L.polyline(latLngs, {
      color: lineColor,
      weight: lineWidth,
      opacity: 0.2,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map)

    // Draw animated portion (will be updated)
    animatedRouteRef.current = L.polyline([], {
      color: lineColor,
      weight: lineWidth,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map)

    // Add start marker
    startMarkerRef.current = L.circleMarker(latLngs[0], {
      radius: 8,
      fillColor: "#22c55e",
      color: "#16a34a",
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(map)

    // Add end marker
    if (latLngs.length > 1) {
      endMarkerRef.current = L.circleMarker(latLngs[latLngs.length - 1], {
        radius: 8,
        fillColor: "#ef4444",
        color: "#dc2626",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map)
    }
  }, [cameraMode, coordinates, lineColor, lineWidth])

  // Update animated route and vehicle position
  useEffect(() => {
    const map = mapRef.current
    if (!map || coordinates.length === 0) return

    const totalPoints = coordinates.length
    const exactProgress = progress * totalPoints
    const pointsToDraw = Math.floor(exactProgress)
    const partialProgress = exactProgress % 1

    // Build animated path
    const animatedLatLngs: L.LatLng[] = []
    for (let i = 0; i <= Math.min(pointsToDraw, totalPoints - 1); i++) {
      animatedLatLngs.push(L.latLng(coordinates[i].lat, coordinates[i].lng))
    }

    // Add interpolated point
    let currentPosition: L.LatLng
    let targetBearing = smoothBearingRef.current

    if (pointsToDraw < totalPoints - 1 && partialProgress > 0) {
      const prevCoord = coordinates[pointsToDraw]
      const nextCoord = coordinates[pointsToDraw + 1]
      const interpLat = prevCoord.lat + (nextCoord.lat - prevCoord.lat) * partialProgress
      const interpLng = prevCoord.lng + (nextCoord.lng - prevCoord.lng) * partialProgress
      currentPosition = L.latLng(interpLat, interpLng)
      animatedLatLngs.push(currentPosition)
      targetBearing = calculateBearing(prevCoord, nextCoord)
    } else if (pointsToDraw > 0) {
      currentPosition = L.latLng(
        coordinates[Math.min(pointsToDraw, totalPoints - 1)].lat,
        coordinates[Math.min(pointsToDraw, totalPoints - 1)].lng
      )
      // Calculate bearing from previous segment
      if (pointsToDraw >= 1 && pointsToDraw < totalPoints) {
        const prevIdx = Math.max(0, pointsToDraw - 1)
        const currIdx = Math.min(pointsToDraw, totalPoints - 1)
        targetBearing = calculateBearing(coordinates[prevIdx], coordinates[currIdx])
      }
    } else {
      currentPosition = L.latLng(coordinates[0].lat, coordinates[0].lng)
    }

    // Smooth bearing transition
    const smoothedBearing = lerpAngle(smoothBearingRef.current, targetBearing, 0.15)
    smoothBearingRef.current = smoothedBearing

    // Update animated route
    if (animatedRouteRef.current) {
      animatedRouteRef.current.setLatLngs(animatedLatLngs)
      animatedRouteRef.current.setStyle({ color: lineColor, weight: lineWidth })
    }

    // Update full route opacity
    if (fullRouteRef.current) {
      fullRouteRef.current.setStyle({ color: lineColor, weight: lineWidth, opacity: 0.2 })
    }

    // Update or create vehicle marker
    if (showDot && currentPosition) {
      const iconSize = vehicleType === "dot" ? 24 : 40
      const vehicleIcon = L.divIcon({
        html: `<div style="transform: rotate(${smoothedBearing - 90}deg); transform-origin: center center;"><img src="${getVehicleSvg(vehicleType, dotColor, iconSize)}" style="display: block;" /></div>`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
        className: "vehicle-marker",
      })

      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng(currentPosition)
        vehicleMarkerRef.current.setIcon(vehicleIcon)
      } else {
        vehicleMarkerRef.current = L.marker(currentPosition, { icon: vehicleIcon }).addTo(map)
      }
    } else if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.remove()
      vehicleMarkerRef.current = null
    }
    const bounds = boundsRef.current
    const zoomRange = zoomRangeRef.current
    if (cameraMode !== "static" && bounds && zoomRange && currentPosition) {
      const normalizedProgress = clamp(progress, 0, 1)
      const targetCenter =
        normalizedProgress === 0 ? bounds.getCenter() : currentPosition

      let targetZoom =
        cameraMode === "follow"
          ? zoomRange.end
          : zoomRange.start +
            (zoomRange.end - zoomRange.start) * easeOutCubic(normalizedProgress)

      if (cameraMode === "cinematic" && normalizedProgress >= 0.98) {
        targetZoom = clamp(targetZoom + 0.8, 2, 19)
      }

      updateCamera(targetCenter, targetZoom)
    }
  }, [cameraMode, coordinates, progress, lineColor, lineWidth, showDot, dotColor, vehicleType])

  return (
    <>
      <style jsx global>{`
        .vehicle-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #f8f9fa;
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full min-h-[400px] rounded-lg overflow-hidden" />
    </>
  )
}
