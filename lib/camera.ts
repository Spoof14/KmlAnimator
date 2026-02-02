export type CameraMode = "static" | "follow" | "cinematic"

export type CameraModeOption = {
  id: CameraMode
  name: string
  description: string
}

export const cameraModes: CameraModeOption[] = [
  {
    id: "static",
    name: "Static",
    description: "Lock the view to the full route",
  },
  {
    id: "follow",
    name: "Follow",
    description: "Keep the vehicle centered",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Zoom out at the start and in at the end",
  },
]
