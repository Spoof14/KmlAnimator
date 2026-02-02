"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Coordinate } from "@/lib/kml-parser"
import { calculateBounds } from "@/lib/kml-parser"
import {
  type VehicleType,
  type MapStyle,
  drawVehicle,
  drawMapBackground,
} from "@/lib/vehicle-icons"

type RouteMapProps = {
  coordinates: Coordinate[]
  progress: number // 0 to 1
  lineColor: string
  lineWidth: number
  showDot: boolean
  dotColor: string
  backgroundColor: string
  vehicleType: VehicleType
  mapStyle: MapStyle
}

export function RouteMap({
  coordinates,
  progress,
  lineColor,
  lineWidth,
  showDot,
  dotColor,
  backgroundColor,
  vehicleType,
  mapStyle,
}: RouteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || coordinates.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match container
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    // Draw map background
    drawMapBackground(ctx, width, height, mapStyle, backgroundColor)

    // Calculate bounds with padding
    const bounds = calculateBounds(coordinates)
    const padding = 50
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    const latRange = bounds.maxLat - bounds.minLat || 0.01
    const lngRange = bounds.maxLng - bounds.minLng || 0.01

    // Calculate scale to fit route
    const scaleX = availableWidth / lngRange
    const scaleY = availableHeight / latRange
    const scale = Math.min(scaleX, scaleY)

    // Center offset
    const centerX = width / 2
    const centerY = height / 2
    const routeCenterX = (bounds.minLng + bounds.maxLng) / 2
    const routeCenterY = (bounds.minLat + bounds.maxLat) / 2

    // Convert coordinates to canvas points
    const toCanvas = (coord: Coordinate) => ({
      x: centerX + (coord.lng - routeCenterX) * scale,
      y: centerY - (coord.lat - routeCenterY) * scale, // Flip Y axis
    })

    // Draw full route as faded background
    ctx.beginPath()
    ctx.strokeStyle = `${lineColor}30`
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const firstPoint = toCanvas(coordinates[0])
    ctx.moveTo(firstPoint.x, firstPoint.y)

    for (let i = 1; i < coordinates.length; i++) {
      const point = toCanvas(coordinates[i])
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()

    // Calculate how many points to draw based on progress
    const totalPoints = coordinates.length
    const pointsToDraw = Math.floor(progress * totalPoints)

    if (pointsToDraw > 0) {
      // Draw animated portion
      ctx.beginPath()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      const startPoint = toCanvas(coordinates[0])
      ctx.moveTo(startPoint.x, startPoint.y)

      for (let i = 1; i < pointsToDraw; i++) {
        const point = toCanvas(coordinates[i])
        ctx.lineTo(point.x, point.y)
      }

      // Handle partial progress to next point
      let currentDotCoord: Coordinate
      if (pointsToDraw < totalPoints) {
        const partialProgress = (progress * totalPoints) % 1
        const prevCoord = coordinates[pointsToDraw - 1]
        const nextCoord = coordinates[pointsToDraw]
        currentDotCoord = {
          lat: prevCoord.lat + (nextCoord.lat - prevCoord.lat) * partialProgress,
          lng: prevCoord.lng + (nextCoord.lng - prevCoord.lng) * partialProgress,
        }
        const interpPoint = toCanvas(currentDotCoord)
        ctx.lineTo(interpPoint.x, interpPoint.y)
      } else {
        currentDotCoord = coordinates[coordinates.length - 1]
      }

      ctx.stroke()

      // Draw moving vehicle/dot
      if (showDot) {
        const dotPoint = toCanvas(currentDotCoord)

        // Calculate rotation based on direction
        let rotation = 0
        if (pointsToDraw > 1 && pointsToDraw < totalPoints) {
          const prevCoord = coordinates[pointsToDraw - 1]
          const nextCoord = coordinates[Math.min(pointsToDraw, totalPoints - 1)]
          rotation = Math.atan2(
            -(nextCoord.lat - prevCoord.lat),
            nextCoord.lng - prevCoord.lng
          )
        } else if (pointsToDraw >= totalPoints && coordinates.length > 1) {
          const prevCoord = coordinates[coordinates.length - 2]
          const lastCoord = coordinates[coordinates.length - 1]
          rotation = Math.atan2(
            -(lastCoord.lat - prevCoord.lat),
            lastCoord.lng - prevCoord.lng
          )
        }

        drawVehicle(
          ctx,
          dotPoint.x,
          dotPoint.y,
          vehicleType,
          dotColor,
          lineWidth * 4,
          rotation
        )
      }
    }

    // Draw start marker
    const startMarker = toCanvas(coordinates[0])
    ctx.beginPath()
    ctx.fillStyle = "#22c55e"
    ctx.arc(startMarker.x, startMarker.y, 6, 0, Math.PI * 2)
    ctx.fill()

    // Draw end marker
    if (coordinates.length > 1) {
      const endMarker = toCanvas(coordinates[coordinates.length - 1])
      ctx.beginPath()
      ctx.fillStyle = "#ef4444"
      ctx.arc(endMarker.x, endMarker.y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [
    coordinates,
    progress,
    lineColor,
    lineWidth,
    showDot,
    dotColor,
    backgroundColor,
    vehicleType,
    mapStyle,
  ])

  useEffect(() => {
    draw()

    const handleResize = () => draw()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [draw])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
