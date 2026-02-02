export type Coordinate = {
  lat: number
  lng: number
  alt?: number
}

export type RouteData = {
  name: string
  coordinates: Coordinate[]
}

export type ElevationStats = {
  hasElevation: boolean
  min: number
  max: number
  gain: number
  loss: number
}

export function parseKML(kmlContent: string): RouteData[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(kmlContent, "text/xml")

  const routes: RouteData[] = []

  // Parse Placemarks with LineStrings
  const placemarks = doc.querySelectorAll("Placemark")

  placemarks.forEach((placemark, index) => {
    const nameElement = placemark.querySelector("name")
    const name = nameElement?.textContent || `Route ${index + 1}`

    // Look for coordinates in LineString or coordinates elements
    const coordinatesElement =
      placemark.querySelector("LineString coordinates") ||
      placemark.querySelector("coordinates")

    if (coordinatesElement?.textContent) {
      const coordText = coordinatesElement.textContent.trim()
      const coordPairs = coordText.split(/\s+/).filter((pair) => pair.length > 0)

      const coordinates: Coordinate[] = coordPairs
        .map((pair) => {
          const parts = pair.split(",")
          if (parts.length >= 2) {
            return {
              lng: parseFloat(parts[0]),
              lat: parseFloat(parts[1]),
              alt: parts[2] ? parseFloat(parts[2]) : undefined,
            }
          }
          return null
        })
        .filter((coord): coord is Coordinate => coord !== null && !isNaN(coord.lat) && !isNaN(coord.lng))

      if (coordinates.length > 0) {
        routes.push({ name, coordinates })
      }
    }
  })

  // Also look for gx:Track elements (Google Earth format)
  const tracks = doc.querySelectorAll("gx\\:Track, Track")

  tracks.forEach((track, index) => {
    const parent = track.closest("Placemark")
    const nameElement = parent?.querySelector("name")
    const name = nameElement?.textContent || `Track ${index + 1}`

    const coordElements = track.querySelectorAll("gx\\:coord, coord")
    const coordinates: Coordinate[] = []

    coordElements.forEach((coordEl) => {
      const parts = coordEl.textContent?.trim().split(" ")
      if (parts && parts.length >= 2) {
        coordinates.push({
          lng: parseFloat(parts[0]),
          lat: parseFloat(parts[1]),
          alt: parts[2] ? parseFloat(parts[2]) : undefined,
        })
      }
    })

    if (coordinates.length > 0) {
      routes.push({ name, coordinates })
    }
  })

  return routes
}

export function calculateBounds(coordinates: Coordinate[]): {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
  center: Coordinate
} {
  if (coordinates.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
      center: { lat: 0, lng: 0 },
    }
  }

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  coordinates.forEach((coord) => {
    minLat = Math.min(minLat, coord.lat)
    maxLat = Math.max(maxLat, coord.lat)
    minLng = Math.min(minLng, coord.lng)
    maxLng = Math.max(maxLng, coord.lng)
  })

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    center: {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    },
  }
}

export function calculateTotalDistance(coordinates: Coordinate[]): number {
  let totalDistance = 0

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1]
    const curr = coordinates[i]

    // Haversine formula
    const R = 6371 // Earth's radius in km
    const dLat = ((curr.lat - prev.lat) * Math.PI) / 180
    const dLng = ((curr.lng - prev.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((prev.lat * Math.PI) / 180) *
        Math.cos((curr.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    totalDistance += R * c
  }

  return totalDistance
}

export function calculateElevationStats(coordinates: Coordinate[]): ElevationStats {
  const coordsWithAlt = coordinates.filter(
    (coord): coord is Coordinate & { alt: number } =>
      typeof coord.alt === "number" && Number.isFinite(coord.alt)
  )

  if (coordsWithAlt.length === 0) {
    return {
      hasElevation: false,
      min: 0,
      max: 0,
      gain: 0,
      loss: 0,
    }
  }

  let min = coordsWithAlt[0].alt
  let max = coordsWithAlt[0].alt
  let gain = 0
  let loss = 0

  for (let i = 1; i < coordsWithAlt.length; i++) {
    const diff = coordsWithAlt[i].alt - coordsWithAlt[i - 1].alt
    if (diff > 0) {
      gain += diff
    } else if (diff < 0) {
      loss += Math.abs(diff)
    }

    min = Math.min(min, coordsWithAlt[i].alt)
    max = Math.max(max, coordsWithAlt[i].alt)
  }

  return {
    hasElevation: true,
    min,
    max,
    gain,
    loss,
  }
}
