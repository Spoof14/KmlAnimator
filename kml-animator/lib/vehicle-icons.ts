export type VehicleType = "dot" | "car" | "suv" | "truck" | "plane" | "boat" | "motorcycle" | "bicycle"

export type VehicleOption = {
  id: VehicleType
  name: string
  icon: string // SVG path data
}

export const vehicles: VehicleOption[] = [
  {
    id: "dot",
    name: "Dot",
    icon: "circle", // Will render as circle
  },
  {
    id: "car",
    name: "Car",
    icon: "M3,18 L3,14 C3,14 3,11 5,9 L7,7 L9,7 L10,4 L14,4 L15,7 L17,7 L19,9 C21,11 21,14 21,14 L21,18 M6,18 A2,2 0 1,0 6,14 A2,2 0 1,0 6,18 M18,18 A2,2 0 1,0 18,14 A2,2 0 1,0 18,18",
  },
  {
    id: "suv",
    name: "SUV",
    icon: "M2,16 L2,12 L4,8 L8,6 L16,6 L20,8 L22,12 L22,16 M5,18 A2.5,2.5 0 1,0 5,13 A2.5,2.5 0 1,0 5,18 M19,18 A2.5,2.5 0 1,0 19,13 A2.5,2.5 0 1,0 19,18 L4,10 L8,8 L16,8 L20,10",
  },
  {
    id: "truck",
    name: "Truck",
    icon: "M1,14 L1,11 L3,11 L3,7 L14,7 L14,11 L16,11 L18,8 L22,8 L23,14 L23,17 M5,19 A2,2 0 1,0 5,15 A2,2 0 1,0 5,19 M19,19 A2,2 0 1,0 19,15 A2,2 0 1,0 19,19",
  },
  {
    id: "plane",
    name: "Airplane",
    icon: "M21,16 L12,12 L12,4 C12,2.9 11.1,2 10,2 L10,2 C8.9,2 8,2.9 8,4 L8,12 L-1,16 L-1,18 L8,15 L8,20 L5,22 L5,24 L10,22 L15,24 L15,22 L12,20 L12,15 L21,18 Z",
  },
  {
    id: "boat",
    name: "Boat",
    icon: "M2,20 C4,22 6,22 8,20 C10,22 12,22 14,20 C16,22 18,22 20,20 L22,20 L20,14 L18,14 L18,8 L14,8 L14,4 L10,4 L10,8 L6,8 L6,14 L4,14 L2,20",
  },
  {
    id: "motorcycle",
    name: "Motorcycle",
    icon: "M5,18 A3,3 0 1,0 5,12 A3,3 0 1,0 5,18 M19,18 A3,3 0 1,0 19,12 A3,3 0 1,0 19,18 M8,15 L11,10 L15,10 L16,15 M11,10 L10,7 L13,7",
  },
  {
    id: "bicycle",
    name: "Bicycle",
    icon: "M5,18 A3,3 0 1,0 5,12 A3,3 0 1,0 5,18 M19,18 A3,3 0 1,0 19,12 A3,3 0 1,0 19,18 M5,15 L10,8 L14,8 L19,15 M10,8 L12,5 M14,8 L12,5",
  },
]

export type MapStyle = "world" | "world-dark" | "world-outline" | "satellite" | "terrain"

export type MapStyleOption = {
  id: MapStyle
  name: string
  description: string
}

export const mapStyles: MapStyleOption[] = [
  {
    id: "world",
    name: "Light",
    description: "Clean light map style",
  },
  {
    id: "world-dark",
    name: "Dark",
    description: "Dark map style",
  },
  {
    id: "world-outline",
    name: "Minimal",
    description: "Minimal map with no labels",
  },
  {
    id: "terrain",
    name: "Terrain",
    description: "Topographic terrain map",
  },
  {
    id: "satellite",
    name: "Satellite",
    description: "Satellite imagery",
  },
]

// Simplified world map paths for SVG rendering (low detail for performance)
export const worldMapPaths = {
  // Simplified continent outlines
  northAmerica: "M-170,15 L-170,70 L-50,70 L-50,25 L-80,10 L-125,15 L-170,15",
  southAmerica: "M-80,-5 L-80,-55 L-35,-55 L-35,-5 L-60,10 L-80,-5",
  europe: "M-10,35 L-10,70 L40,70 L40,45 L20,35 L-10,35",
  africa: "M-20,-35 L-20,35 L50,35 L50,-35 L15,-35 L-20,-35",
  asia: "M40,10 L40,75 L180,75 L180,10 L100,25 L40,10",
  australia: "M110,-45 L110,-10 L155,-10 L155,-45 L130,-35 L110,-45",
}

// More detailed continent paths for better rendering
export const detailedWorldPaths = `
M-124,49 L-123,48 L-119,49 L-117,49 L-114,48 L-110,47 L-106,46 L-102,48 L-98,48 L-94,47 L-90,46 L-86,46 L-82,48 L-78,50 L-76,52 L-74,55 L-72,58 L-68,60 L-64,62 L-60,61 L-56,58 L-53,55 L-52,50 L-55,47 L-58,44 L-62,41 L-66,38 L-70,36 L-74,35 L-78,34 L-82,33 L-86,32 L-90,32 L-94,33 L-98,35 L-102,36 L-106,37 L-110,38 L-114,39 L-118,41 L-122,44 L-124,47 Z
M-82,25 L-80,27 L-76,28 L-72,27 L-68,25 L-64,22 L-60,19 L-56,17 L-52,16 L-48,17 L-44,20 L-40,23 L-36,25 L-34,27 L-35,30 L-38,33 L-42,35 L-46,36 L-50,36 L-54,34 L-58,32 L-62,30 L-66,28 L-70,27 L-74,26 L-78,25 L-82,25 Z
M-10,36 L-8,38 L-4,40 L0,42 L4,44 L8,46 L12,47 L16,48 L20,48 L24,47 L28,45 L32,43 L36,41 L40,40 L44,42 L48,45 L52,48 L56,50 L60,52 L64,53 L68,52 L72,50 L76,48 L80,47 L84,48 L88,50 L92,52 L96,54 L100,55 L104,54 L108,52 L112,50 L116,49 L120,50 L124,52 L128,55 L132,57 L136,58 L140,57 L144,55 L148,52 L152,50 L156,49 L160,50 L164,52 L168,54 L172,55 L176,54 L180,52 Z
M-18,-35 L-15,-33 L-10,-32 L-5,-33 L0,-35 L5,-36 L10,-35 L15,-33 L20,-32 L25,-33 L30,-35 L35,-34 L38,-32 L40,-28 L38,-24 L35,-20 L30,-17 L25,-15 L20,-14 L15,-15 L10,-17 L5,-20 L0,-22 L-5,-23 L-10,-22 L-15,-20 L-18,-17 L-20,-14 L-20,-10 L-18,-6 L-15,-3 L-10,-1 L-5,0 L0,-1 L5,-3 L10,-5 L15,-6 L20,-5 L25,-3 L28,0 L30,4 L28,8 L25,12 L20,15 L15,17 L10,18 L5,17 L0,15 L-5,12 L-10,10 L-15,9 L-18,10 L-20,14 L-18,18 L-15,22 L-10,25 L-5,27 L0,28 L5,27 L10,25 L15,23 L20,22 L25,23 L30,26 L35,30 L38,33 L35,35 L30,34 L25,32 L20,30 L15,29 L10,30 L5,32 L0,35 L-5,36 L-10,35 L-15,33 L-18,30 L-18,-35 Z
M45,5 L50,7 L55,10 L60,12 L65,13 L70,12 L75,10 L80,8 L85,7 L90,8 L95,10 L100,13 L105,15 L110,16 L115,15 L120,13 L125,11 L130,10 L135,11 L140,14 L145,18 L150,22 L155,25 L160,27 L165,26 L170,23 L175,20 L180,18 L180,65 L45,65 Z
M112,-10 L118,-8 L124,-7 L130,-8 L136,-10 L142,-12 L148,-13 L153,-12 L156,-8 L155,-4 L152,0 L147,3 L142,5 L136,6 L130,5 L124,3 L118,1 L114,-2 L112,-6 L112,-10 Z
`

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vehicle: VehicleType,
  color: string,
  size: number,
  rotation: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  const scale = size / 24 // Base icon size is 24

  if (vehicle === "dot") {
    // Outer glow
    ctx.beginPath()
    ctx.fillStyle = `${color}40`
    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Inner dot
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.scale(scale, scale)
    ctx.translate(-12, -12) // Center the 24x24 icon

    const vehicleData = vehicles.find((v) => v.id === vehicle)
    if (vehicleData) {
      const path = new Path2D(vehicleData.icon)
      ctx.stroke(path)
      ctx.globalAlpha = 0.3
      ctx.fill(path)
    }
  }

  ctx.restore()
}

export function drawMapBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapStyle: MapStyle,
  backgroundColor: string
) {
  // Fill background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  if (mapStyle === "none") return

  if (mapStyle === "grid") {
    // Draw grid
    ctx.strokeStyle = `${backgroundColor === "#1a1a2e" || backgroundColor.startsWith("#1") || backgroundColor.startsWith("#0") ? "#ffffff" : "#000000"}15`
    ctx.lineWidth = 1

    const gridSize = 40
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    return
  }

  // World map rendering
  const isDark = mapStyle === "world-dark"
  const isOutline = mapStyle === "world-outline"

  // Map projection settings
  const mapWidth = width * 0.9
  const mapHeight = height * 0.8
  const offsetX = (width - mapWidth) / 2
  const offsetY = (height - mapHeight) / 2

  // Draw simplified world map
  ctx.save()
  ctx.translate(offsetX + mapWidth / 2, offsetY + mapHeight / 2)

  const scaleX = mapWidth / 360
  const scaleY = mapHeight / 180

  // Continent color based on style
  if (isOutline) {
    ctx.strokeStyle = isDark ? "#ffffff30" : "#00000020"
    ctx.lineWidth = 1
    ctx.fillStyle = "transparent"
  } else {
    ctx.fillStyle = isDark ? "#2a2a4a" : "#e8e8e8"
    ctx.strokeStyle = isDark ? "#3a3a5a" : "#d0d0d0"
    ctx.lineWidth = 0.5
  }

  // Draw simplified continent shapes
  const continents = [
    // North America
    [
      [-130, 55],
      [-125, 60],
      [-100, 70],
      [-80, 70],
      [-60, 50],
      [-65, 45],
      [-75, 35],
      [-80, 25],
      [-100, 20],
      [-105, 25],
      [-115, 30],
      [-125, 35],
      [-130, 45],
    ],
    // South America
    [
      [-80, 10],
      [-60, 5],
      [-35, -5],
      [-35, -25],
      [-45, -35],
      [-55, -55],
      [-70, -55],
      [-75, -45],
      [-80, -20],
      [-80, 0],
    ],
    // Europe
    [
      [-10, 35],
      [0, 40],
      [5, 45],
      [10, 50],
      [20, 55],
      [30, 60],
      [40, 55],
      [45, 45],
      [40, 40],
      [25, 35],
      [10, 36],
      [0, 36],
    ],
    // Africa
    [
      [-15, 35],
      [10, 35],
      [35, 30],
      [40, 20],
      [50, 10],
      [50, -5],
      [40, -20],
      [30, -35],
      [20, -35],
      [15, -25],
      [10, -5],
      [-5, 5],
      [-15, 15],
    ],
    // Asia
    [
      [40, 40],
      [60, 55],
      [80, 70],
      [100, 75],
      [130, 70],
      [170, 65],
      [160, 55],
      [140, 45],
      [130, 35],
      [120, 25],
      [105, 20],
      [95, 10],
      [80, 10],
      [65, 25],
      [50, 30],
      [45, 35],
    ],
    // Australia
    [
      [115, -10],
      [130, -10],
      [145, -15],
      [150, -25],
      [145, -40],
      [135, -35],
      [120, -35],
      [115, -25],
    ],
  ]

  for (const continent of continents) {
    ctx.beginPath()
    const firstPoint = continent[0]
    ctx.moveTo(firstPoint[0] * scaleX, -firstPoint[1] * scaleY)

    for (let i = 1; i < continent.length; i++) {
      const point = continent[i]
      ctx.lineTo(point[0] * scaleX, -point[1] * scaleY)
    }

    ctx.closePath()
    if (!isOutline) {
      ctx.fill()
    }
    ctx.stroke()
  }

  ctx.restore()
}
