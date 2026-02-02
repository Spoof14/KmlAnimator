"use client"

import React from "react"

import { useCallback, useState } from "react"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileLoad: (content: string, fileName: string) => void
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file.name.endsWith(".kml") || file.name.endsWith(".kmz") || file.name.endsWith(".kml.xml") || file.name.endsWith(".xml")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setFileName(file.name)
          onFileLoad(content, file.name)
        }
        reader.readAsText(file)
      }
    },
    [onFileLoad]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const clearFile = useCallback(() => {
    setFileName(null)
  }, [])

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center",
        isDragging
          ? "border-accent bg-accent/5"
          : "border-border hover:border-muted-foreground/50",
        fileName && "border-solid border-accent/50 bg-accent/5"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept=".kml,.kmz,.xml"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {fileName ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-accent" />
          <span className="font-medium text-foreground">{fileName}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              clearFile()
            }}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-foreground font-medium">Drop your KML or XML file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
