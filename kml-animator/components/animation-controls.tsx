"use client"

import { Play, Pause, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  type VehicleType,
  type MapStyle,
  vehicles,
  mapStyles,
} from "@/lib/vehicle-icons"

interface AnimationControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  progress: number
  onProgressChange: (value: number) => void
  duration: number
  onDurationChange: (value: number) => void
  lineColor: string
  onLineColorChange: (value: string) => void
  lineWidth: number
  onLineWidthChange: (value: number) => void
  showDot: boolean
  onShowDotChange: (value: boolean) => void
  dotColor: string
  onDotColorChange: (value: string) => void
  vehicleType: VehicleType
  onVehicleTypeChange: (value: VehicleType) => void
  mapStyle: MapStyle
  onMapStyleChange: (value: MapStyle) => void
  onExport: () => void
  isExporting: boolean
}

export function AnimationControls({
  isPlaying,
  onPlayPause,
  onReset,
  progress,
  onProgressChange,
  duration,
  onDurationChange,
  lineColor,
  onLineColorChange,
  lineWidth,
  onLineWidthChange,
  showDot,
  onShowDotChange,
  dotColor,
  onDotColorChange,
  vehicleType,
  onVehicleTypeChange,
  mapStyle,
  onMapStyleChange,
  onExport,
  isExporting,
}: AnimationControlsProps) {
  return (
    <div className="space-y-6">
      {/* Playback Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button onClick={onPlayPause} size="lg" className="flex-1">
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button onClick={onReset} variant="outline" size="lg" className="bg-transparent">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <Slider
            value={[progress * 100]}
            onValueChange={([value]) => onProgressChange(value / 100)}
            max={100}
            step={0.1}
          />
        </div>
      </div>

      {/* Map Style Settings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-semibold text-foreground">Map Style</h3>

        <div className="grid grid-cols-2 gap-2">
          {mapStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onMapStyleChange(style.id)}
              className={`px-3 py-2 text-sm rounded-md text-left transition-colors ${
                mapStyle === style.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Route Settings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-semibold text-foreground">Route Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            max={120}
            value={duration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Line Width: {lineWidth}px</Label>
          <Slider
            value={[lineWidth]}
            onValueChange={([value]) => onLineWidthChange(value)}
            min={1}
            max={10}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lineColor">Line Color</Label>
          <div className="flex gap-2">
            <Input
              id="lineColor"
              type="color"
              value={lineColor}
              onChange={(e) => onLineColorChange(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={lineColor}
              onChange={(e) => onLineColorChange(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Settings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Vehicle Icon</h3>
          <button
            type="button"
            role="switch"
            aria-checked={showDot}
            onClick={() => onShowDotChange(!showDot)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showDot ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                showDot ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {showDot && (
          <>
            <div className="grid grid-cols-4 gap-2">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => onVehicleTypeChange(vehicle.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-md text-xs transition-colors ${
                    vehicleType === vehicle.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  title={vehicle.name}
                >
                  <span className="text-base mb-0.5">
                    {vehicle.id === "dot" && "●"}
                    {vehicle.id === "car" && "🚗"}
                    {vehicle.id === "suv" && "🚙"}
                    {vehicle.id === "truck" && "🚚"}
                    {vehicle.id === "plane" && "✈️"}
                    {vehicle.id === "boat" && "⛵"}
                    {vehicle.id === "motorcycle" && "🏍️"}
                    {vehicle.id === "bicycle" && "🚲"}
                  </span>
                  <span className="truncate w-full text-center text-[10px]">{vehicle.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Vehicle Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={dotColor}
                  onChange={(e) => onDotColorChange(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={dotColor}
                  onChange={(e) => onDotColorChange(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Export */}
      <div className="pt-4 border-t border-border">
        <Button
          onClick={onExport}
          variant="outline"
          className="w-full bg-transparent"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Recording..." : "Export as Video"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Use screen recording for best results
        </p>
      </div>
    </div>
  )
}
