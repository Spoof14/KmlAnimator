"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { FileUpload } from "@/components/file-upload"
import { AnimationControls } from "@/components/animation-controls"
import dynamic from "next/dynamic"
import { parseKML, calculateTotalDistance } from "@/lib/kml-parser"
import type { Coordinate, RouteData } from "@/lib/kml-parser"
import type { VehicleType, MapStyle } from "@/lib/vehicle-icons"
import { MapPin, Route, Clock } from "lucide-react"

// Dynamic import for Leaflet to avoid SSR issues
const LeafletRouteMap = dynamic(
  () => import("@/components/leaflet-route-map").then((mod) => mod.LeafletRouteMap),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">
        Loading map...
      </div>
    ) 
  }
)

export default function Home() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [selectedRoute, setSelectedRoute] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(10)
  const [lineColor, setLineColor] = useState("#8b5cf6")
  const [lineWidth, setLineWidth] = useState(3)
  const [showDot, setShowDot] = useState(true)
  const [dotColor, setDotColor] = useState("#ffffff")
  const [vehicleType, setVehicleType] = useState<VehicleType>("car")
  const [mapStyle, setMapStyle] = useState<MapStyle>("world")
  const [isExporting, setIsExporting] = useState(false)

  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const currentCoordinates: Coordinate[] =
    routes.length > 0 ? routes[selectedRoute]?.coordinates || [] : []

  const handleFileLoad = useCallback((content: string, _fileName: string) => {
    const parsedRoutes = parseKML(content)
    if (parsedRoutes.length > 0) {
      setRoutes(parsedRoutes)
      setSelectedRoute(0)
      setProgress(0)
      setIsPlaying(false)
    }
  }, [])

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const newProgress = Math.min(elapsed / (duration * 1000), 1)

      setProgress(newProgress)

      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
        startTimeRef.current = null
      }
    },
    [duration]
  )

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setIsPlaying(false)
      startTimeRef.current = null
    } else {
      if (progress >= 1) {
        setProgress(0)
      }
      startTimeRef.current = null
      if (progress > 0 && progress < 1) {
        startTimeRef.current = performance.now() - progress * duration * 1000
      }
      setIsPlaying(true)
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [isPlaying, progress, duration, animate])

  const handleReset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setProgress(0)
    setIsPlaying(false)
    startTimeRef.current = null
  }, [])

  const handleProgressChange = useCallback((value: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setProgress(value)
    setIsPlaying(false)
    startTimeRef.current = null
  }, [])

  const handleExport = useCallback(async () => {
    // Note: Leaflet maps don't support canvas capture directly
    // This would need html2canvas or a different approach
    alert("Video export coming soon! For now, use screen recording software to capture your animation.")
  }, [])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const totalDistance =
    currentCoordinates.length > 0
      ? calculateTotalDistance(currentCoordinates)
      : 0

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Route className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              RouteMotion
            </span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Transform KML files into animated routes
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {routes.length === 0 ? (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">
                Animate your travel routes
              </h1>
              <p className="text-lg text-muted-foreground">
                Upload your Google Maps KML file and create beautiful animated
                routes for your travel videos.
              </p>
            </div>

            <FileUpload onFileLoad={handleFileLoad} />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="text-2xl font-bold text-foreground">1</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Export KML from Google Maps
                </div>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="text-2xl font-bold text-foreground">2</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Upload and customize
                </div>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="text-2xl font-bold text-foreground">3</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Export video
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              {/* Route Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">
                    {currentCoordinates.length.toLocaleString()} points
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">
                    {totalDistance.toFixed(1)} km
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">
                    {duration}s animation
                  </span>
                </div>
              </div>

              {/* Route Selector */}
              {routes.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {routes.map((route, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedRoute(index)
                        setProgress(0)
                        setIsPlaying(false)
                      }}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        selectedRoute === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {route.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Map Container */}
              <div
                ref={mapContainerRef}
                className="aspect-video rounded-lg overflow-hidden border border-border shadow-lg"
              >
                <LeafletRouteMap
                  coordinates={currentCoordinates}
                  progress={progress}
                  lineColor={lineColor}
                  lineWidth={lineWidth}
                  showDot={showDot}
                  dotColor={dotColor}
                  vehicleType={vehicleType}
                  mapStyle={mapStyle}
                />
              </div>

              {/* Upload New */}
              <div className="flex justify-center">
                <label className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input
                    type="file"
                    accept=".kml,.kmz,.xml"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          const content = ev.target?.result as string
                          handleFileLoad(content, file.name)
                        }
                        reader.readAsText(file)
                      }
                    }}
                  />
                  Upload a different file
                </label>
              </div>
            </div>

            {/* Controls Sidebar */}
            <div className="lg:sticky lg:top-4 h-fit">
              <div className="rounded-lg border border-border bg-card p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <AnimationControls
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onReset={handleReset}
                  progress={progress}
                  onProgressChange={handleProgressChange}
                  duration={duration}
                  onDurationChange={setDuration}
                  lineColor={lineColor}
                  onLineColorChange={setLineColor}
                  lineWidth={lineWidth}
                  onLineWidthChange={setLineWidth}
                  showDot={showDot}
                  onShowDotChange={setShowDot}
                  dotColor={dotColor}
                  onDotColorChange={setDotColor}
                  vehicleType={vehicleType}
                  onVehicleTypeChange={setVehicleType}
                  mapStyle={mapStyle}
                  onMapStyleChange={setMapStyle}
                  onExport={handleExport}
                  isExporting={isExporting}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
