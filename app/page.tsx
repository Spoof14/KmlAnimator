"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { FileUpload } from "@/components/file-upload"
import { AnimationControls } from "@/components/animation-controls"
import dynamic from "next/dynamic"
import { parseKML, calculateTotalDistance, calculateElevationStats } from "@/lib/kml-parser"
import type { Coordinate, RouteData } from "@/lib/kml-parser"
import type { VehicleType, MapStyle } from "@/lib/vehicle-icons"
import type { CameraMode } from "@/lib/camera"
import { MapPin, Route, Clock, Gauge, Mountain } from "lucide-react"

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
  const [cameraMode, setCameraMode] = useState<CameraMode>("cinematic")
  const [isExporting, setIsExporting] = useState(false)

  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingTimeoutRef = useRef<number | null>(null)

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

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsPlaying(false)
    startTimeRef.current = null
  }, [])

  const startAnimation = useCallback(
    (startAtProgress: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      const clamped = Math.min(Math.max(startAtProgress, 0), 1)
      setProgress(clamped)
      setIsPlaying(true)
      startTimeRef.current = performance.now() - clamped * duration * 1000
      animationRef.current = requestAnimationFrame(animate)
    },
    [animate, duration]
  )

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopAnimation()
      return
    }

    const nextProgress = progress >= 1 ? 0 : progress
    startAnimation(nextProgress)
  }, [isPlaying, progress, startAnimation, stopAnimation])

  const handleReset = useCallback(() => {
    stopAnimation()
    setProgress(0)
  }, [stopAnimation])

  const handleProgressChange = useCallback((value: number) => {
    stopAnimation()
    setProgress(value)
  }, [stopAnimation])

  const handleExport = useCallback(async () => {
    if (isExporting) return
    if (!currentCoordinates.length) {
      alert("Upload a route before exporting a video.")
      return
    }
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") {
      alert("Screen recording is not supported in this browser.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: false,
      })

      const supportedMimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ]
      const mimeType = supportedMimeTypes.find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        recordingTimeoutRef.current && clearTimeout(recordingTimeoutRef.current)
        recordingTimeoutRef.current = null

        stream.getTracks().forEach((track) => track.stop())
        recordingStreamRef.current = null
        recorderRef.current = null
        setIsExporting(false)

        if (!chunks.length) {
          return
        }

        const blob = new Blob(chunks, { type: mimeType ?? "video/webm" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `route-animation-${Date.now()}.webm`
        anchor.click()
        URL.revokeObjectURL(url)
      }

      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorder.state !== "inactive") {
          recorder.stop()
        }
        stopAnimation()
      })

      recorderRef.current = recorder
      recordingStreamRef.current = stream
      setIsExporting(true)
      recorder.start()

      startAnimation(0)

      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop()
        }
      }, (duration + 0.3) * 1000)
    } catch (error) {
      stopAnimation()
      setIsExporting(false)
      const err = error as DOMException
      if (err?.name !== "NotAllowedError") {
        alert("Recording failed. Please try again and allow screen recording.")
      }
    }
  }, [currentCoordinates.length, duration, isExporting, startAnimation, stopAnimation])

  useEffect(() => {
    return () => {
      stopAnimation()
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [stopAnimation])

  const totalDistance =
    currentCoordinates.length > 0
      ? calculateTotalDistance(currentCoordinates)
      : 0
  const elevationStats = useMemo(
    () => calculateElevationStats(currentCoordinates),
    [currentCoordinates]
  )
  const averageSpeed = useMemo(() => {
    if (duration <= 0) return 0
    return totalDistance / (duration / 3600)
  }, [duration, totalDistance])

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
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  {averageSpeed.toFixed(1)} km/h
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                <Mountain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  {elevationStats.hasElevation
                    ? `${Math.round(elevationStats.gain).toLocaleString()} m gain`
                    : "Elevation N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                <Mountain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  {elevationStats.hasElevation
                    ? `${Math.round(elevationStats.max).toLocaleString()} m max`
                    : "Max elevation N/A"}
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
                  cameraMode={cameraMode}
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
                  cameraMode={cameraMode}
                  onCameraModeChange={setCameraMode}
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
