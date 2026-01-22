import React from "react";

// SVG Path definitions for various shapes
export const SHAPES = {
  none: {
    name: "None",
    path: null,
    viewBox: "0 0 100 100",
  },
  circle: {
    name: "Circle",
    path: "M50 0 A50 50 0 1 1 50 100 A50 50 0 1 1 50 0",
    viewBox: "0 0 100 100",
  },
  square: {
    name: "Square",
    path: "M0 0 H100 V100 H0 Z",
    viewBox: "0 0 100 100",
  },
  roundedSquare: {
    name: "Rounded Square",
    path: "M15 0 H85 Q100 0 100 15 V85 Q100 100 85 100 H15 Q0 100 0 85 V15 Q0 0 15 0",
    viewBox: "0 0 100 100",
  },
  squircle: {
    name: "Squircle",
    path: "M50 0 C85 0 100 15 100 50 C100 85 85 100 50 100 C15 100 0 85 0 50 C0 15 15 0 50 0",
    viewBox: "0 0 100 100",
  },
  hexagon: {
    name: "Hexagon",
    path: "M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z",
    viewBox: "0 0 100 100",
  },
  octagon: {
    name: "Octagon",
    path: "M29.3 0 L70.7 0 L100 29.3 L100 70.7 L70.7 100 L29.3 100 L0 70.7 L0 29.3 Z",
    viewBox: "0 0 100 100",
  },
  diamond: {
    name: "Diamond",
    path: "M50 0 L100 50 L50 100 L0 50 Z",
    viewBox: "0 0 100 100",
  },
  pentagon: {
    name: "Pentagon",
    path: "M50 0 L97.55 34.55 L79.39 90.45 L20.61 90.45 L2.45 34.55 Z",
    viewBox: "0 0 100 100",
  },
  star: {
    name: "Star",
    path: "M50 0 L61.8 38.2 L100 38.2 L69.1 61.8 L80.9 100 L50 76.4 L19.1 100 L30.9 61.8 L0 38.2 L38.2 38.2 Z",
    viewBox: "0 0 100 100",
  },
  star6: {
    name: "6-Point Star",
    path: "M50 0 L62.5 37.5 L100 25 L75 50 L100 75 L62.5 62.5 L50 100 L37.5 62.5 L0 75 L25 50 L0 25 L37.5 37.5 Z",
    viewBox: "0 0 100 100",
  },
  heart: {
    name: "Heart",
    path: "M50 88.9 C-16.7 44.4 16.7 -5.6 50 22.2 C83.3 -5.6 116.7 44.4 50 88.9 Z",
    viewBox: "0 0 100 100",
  },
  shield: {
    name: "Shield",
    path: "M50 0 L100 15 L100 55 Q100 85 50 100 Q0 85 0 55 L0 15 Z",
    viewBox: "0 0 100 100",
  },
  badge: {
    name: "Badge",
    path: "M50 0 L65 10 L85 5 L85 25 L100 40 L90 55 L100 75 L80 80 L70 100 L50 90 L30 100 L20 80 L0 75 L10 55 L0 40 L15 25 L15 5 L35 10 Z",
    viewBox: "0 0 100 100",
  },
  ribbon: {
    name: "Ribbon",
    path: "M0 25 Q25 0 50 25 Q75 0 100 25 L100 75 Q75 100 50 75 Q25 100 0 75 Z",
    viewBox: "0 0 100 100",
  },
  cloud: {
    name: "Cloud",
    path: "M25 80 A20 20 0 0 1 25 40 A25 25 0 0 1 50 20 A30 30 0 0 1 85 45 A15 15 0 0 1 85 75 Q85 80 80 80 Z",
    viewBox: "0 0 100 100",
  },
  drop: {
    name: "Drop",
    path: "M50 0 Q100 50 50 100 Q0 50 50 0",
    viewBox: "0 0 100 100",
  },
  oval: {
    name: "Oval",
    path: "M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10",
    viewBox: "0 0 100 100",
  },
  cross: {
    name: "Cross",
    path: "M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z",
    viewBox: "0 0 100 100",
  },
  plus: {
    name: "Plus (Rounded)",
    path: "M40 0 H60 Q65 0 65 5 V35 H95 Q100 35 100 40 V60 Q100 65 95 65 H65 V95 Q65 100 60 100 H40 Q35 100 35 95 V65 H5 Q0 65 0 60 V40 Q0 35 5 35 H35 V5 Q35 0 40 0",
    viewBox: "0 0 100 100",
  },
  triangle: {
    name: "Triangle",
    path: "M50 0 L100 100 L0 100 Z",
    viewBox: "0 0 100 100",
  },
  triangleDown: {
    name: "Triangle Down",
    path: "M0 0 L100 0 L50 100 Z",
    viewBox: "0 0 100 100",
  },
  parallelogram: {
    name: "Parallelogram",
    path: "M25 0 L100 0 L75 100 L0 100 Z",
    viewBox: "0 0 100 100",
  },
  trapezoid: {
    name: "Trapezoid",
    path: "M20 0 L80 0 L100 100 L0 100 Z",
    viewBox: "0 0 100 100",
  },
  message: {
    name: "Message",
    path: "M0 0 H100 V70 H60 L50 85 L40 70 H0 Z",
    viewBox: "0 0 100 100",
  },
  messageRounded: {
    name: "Message (Rounded)",
    path: "M10 0 H90 Q100 0 100 10 V60 Q100 70 90 70 H60 L50 85 L40 70 H10 Q0 70 0 60 V10 Q0 0 10 0",
    viewBox: "0 0 100 100",
  },
  bookmark: {
    name: "Bookmark",
    path: "M10 0 H90 V100 L50 75 L10 100 Z",
    viewBox: "0 0 100 100",
  },
  ticket: {
    name: "Ticket",
    path: "M0 10 Q0 0 10 0 H90 Q100 0 100 10 V40 A10 10 0 0 0 100 60 V90 Q100 100 90 100 H10 Q0 100 0 90 V60 A10 10 0 0 0 0 40 Z",
    viewBox: "0 0 100 100",
  },
  burst: {
    name: "Burst",
    path: "M50 0 L56 35 L85 15 L65 44 L100 50 L65 56 L85 85 L56 65 L50 100 L44 65 L15 85 L35 56 L0 50 L35 44 L15 15 L44 35 Z",
    viewBox: "0 0 100 100",
  },
  gear: {
    name: "Gear",
    path: "M42 0 H58 L60 12 L72 8 L80 20 L70 28 L78 38 L68 44 L68 56 L78 62 L70 72 L80 80 L72 92 L60 88 L58 100 H42 L40 88 L28 92 L20 80 L30 72 L22 62 L32 56 L32 44 L22 38 L30 28 L20 20 L28 8 L40 12 Z M50 35 A15 15 0 1 0 50 65 A15 15 0 1 0 50 35",
    viewBox: "0 0 100 100",
  },
  flower: {
    name: "Flower",
    path: "M50 0 Q65 25 50 30 Q35 25 50 0 M100 50 Q75 65 70 50 Q75 35 100 50 M50 100 Q35 75 50 70 Q65 75 50 100 M0 50 Q25 35 30 50 Q25 65 0 50 M85 15 Q70 35 60 30 Q60 20 85 15 M85 85 Q65 70 70 60 Q80 60 85 85 M15 85 Q30 65 40 70 Q40 80 15 85 M15 15 Q35 30 30 40 Q20 40 15 15 M50 35 A15 15 0 1 0 50 65 A15 15 0 1 0 50 35",
    viewBox: "0 0 100 100",
  },
  sun: {
    name: "Sun",
    path: "M50 20 A30 30 0 1 0 50 80 A30 30 0 1 0 50 20 M50 0 L50 10 M50 90 L50 100 M0 50 L10 50 M90 50 L100 50 M14.6 14.6 L21.7 21.7 M78.3 78.3 L85.4 85.4 M85.4 14.6 L78.3 21.7 M21.7 78.3 L14.6 85.4",
    viewBox: "0 0 100 100",
  },
};

// Gradient presets
export const GRADIENT_PRESETS = [
  { name: "None", colors: null },
  { name: "Sunset", colors: ["#ff6b6b", "#feca57"] },
  { name: "Ocean", colors: ["#0077b6", "#00b4d8", "#90e0ef"] },
  { name: "Forest", colors: ["#2d6a4f", "#40916c", "#95d5b2"] },
  { name: "Purple Haze", colors: ["#7b2cbf", "#c77dff"] },
  { name: "Fire", colors: ["#d00000", "#e85d04", "#ffba08"] },
  { name: "Midnight", colors: ["#0d1b2a", "#1b263b", "#415a77"] },
  { name: "Cotton Candy", colors: ["#ff99c8", "#a9def9", "#e4c1f9"] },
  { name: "Gold", colors: ["#9d4e00", "#d4a373", "#fefae0"] },
  { name: "Neon", colors: ["#f72585", "#7209b7", "#3a0ca3", "#4cc9f0"] },
  { name: "Aurora", colors: ["#00f5d4", "#00bbf9", "#9b5de5", "#f15bb5"] },
  { name: "Earth", colors: ["#6b4423", "#8b5a2b", "#a0522d", "#cd853f"] },
  { name: "Ice", colors: ["#caf0f8", "#90e0ef", "#00b4d8", "#0077b6"] },
  { name: "Lavender", colors: ["#e0aaff", "#c77dff", "#9d4edd", "#7b2cbf"] },
  { name: "Tropical", colors: ["#06d6a0", "#118ab2", "#ef476f"] },
  { name: "Metal", colors: ["#6c757d", "#adb5bd", "#dee2e6", "#f8f9fa"] },
  { name: "Rose Gold", colors: ["#b76e79", "#e8c4c4", "#f7e1d7"] },
  { name: "Cyberpunk", colors: ["#ff00ff", "#00ffff", "#ff00ff"] },
];

// Shape background component
export function ShapeBackground({
  shape = "circle",
  size = 128,
  backgroundColor = "#3b82f6",
  gradientColors = null,
  gradientDirection = "to bottom",
  borderColor = null,
  borderWidth = 0,
  shadowColor = null,
  shadowBlur = 0,
  rotation = 0,
  opacity = 1,
}) {
  const shapeData = SHAPES[shape];
  if (!shapeData || !shapeData.path) return null;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  const shadowId = `shadow-${Math.random().toString(36).substr(2, 9)}`;

  // Parse gradient direction to SVG coordinates
  const getGradientCoords = (direction) => {
    const coords = {
      "to bottom": { x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
      "to top": { x1: "0%", y1: "100%", x2: "0%", y2: "0%" },
      "to right": { x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
      "to left": { x1: "100%", y1: "0%", x2: "0%", y2: "0%" },
      "to bottom right": { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
      "to bottom left": { x1: "100%", y1: "0%", x2: "0%", y2: "100%" },
      "to top right": { x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
      "to top left": { x1: "100%", y1: "100%", x2: "0%", y2: "0%" },
    };
    return coords[direction] || coords["to bottom"];
  };

  const gradientCoords = getGradientCoords(gradientDirection);

  return (
    <svg
      width={size}
      height={size}
      viewBox={shapeData.viewBox}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        opacity,
      }}
    >
      <defs>
        {gradientColors && gradientColors.length > 0 && (
          <linearGradient id={gradientId} {...gradientCoords}>
            {gradientColors.map((color, i) => (
              <stop
                key={i}
                offset={`${(i / (gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        )}
        {shadowBlur > 0 && (
          <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation={shadowBlur}
              floodColor={shadowColor || "#000"}
              floodOpacity="0.5"
            />
          </filter>
        )}
      </defs>
      <path
        d={shapeData.path}
        fill={gradientColors ? `url(#${gradientId})` : backgroundColor}
        stroke={borderColor}
        strokeWidth={borderWidth}
        filter={shadowBlur > 0 ? `url(#${shadowId})` : undefined}
      />
    </svg>
  );
}

// Export shape names for dropdown
export const SHAPE_NAMES = Object.keys(SHAPES);

export default ShapeBackground;