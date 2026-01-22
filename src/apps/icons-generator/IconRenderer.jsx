import React from "react";
import { ShapeBackground } from "./BackgroundShapes.jsx";

export default function IconRenderer({
  Icon,
  size = 128,
  color = "#000",
  weight,
  // Background shape props
  shape = "none",
  shapeColor = "#3b82f6",
  shapeGradient = null,
  shapeGradientDirection = "to bottom",
  shapeBorderColor = null,
  shapeBorderWidth = 0,
  shapeShadowColor = null,
  shapeShadowBlur = 0,
  shapeRotation = 0,
  shapeOpacity = 1,
  // Icon adjustments
  iconPadding = 20,
  iconRotation = 0,
  iconOpacity = 1,
  // Icon effects
  iconGlow = 0,
  iconGlowColor = "#ffffff",
  // Preview background (for checking against different backgrounds)
  previewBackground = "transparent",
}) {
  const hasShape = shape && shape !== "none";
  const iconSize = hasShape ? size - (iconPadding * 2) : size;

  // Build filter for icon glow effect
  const iconFilter = iconGlow > 0
    ? `drop-shadow(0 0 ${iconGlow}px ${iconGlowColor}) drop-shadow(0 0 ${iconGlow * 0.5}px ${iconGlowColor})`
    : undefined;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: previewBackground,
        borderRadius: previewBackground !== "transparent" ? 8 : 0,
      }}
    >
      {hasShape && (
        <ShapeBackground
          shape={shape}
          size={size}
          backgroundColor={shapeColor}
          gradientColors={shapeGradient}
          gradientDirection={shapeGradientDirection}
          borderColor={shapeBorderColor}
          borderWidth={shapeBorderWidth}
          shadowColor={shapeShadowColor}
          shadowBlur={shapeShadowBlur}
          rotation={shapeRotation}
          opacity={shapeOpacity}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: iconSize,
          height: iconSize,
          transform: iconRotation ? `rotate(${iconRotation}deg)` : undefined,
          opacity: iconOpacity,
          filter: iconFilter,
        }}
      >
        <Icon
          size={iconSize}
          color={color}
          weight={weight}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

// Exportable SVG version for downloads
export function IconRendererSVG({
  Icon,
  size = 128,
  color = "#000",
  weight,
  shape = "none",
  shapeColor = "#3b82f6",
  shapeGradient = null,
  shapeGradientDirection = "to bottom",
  shapeBorderColor = null,
  shapeBorderWidth = 0,
  shapeRotation = 0,
  shapeOpacity = 1,
  iconPadding = 20,
  iconRotation = 0,
  iconOpacity = 1,
}) {
  // This component is the same but optimized for SVG export
  return (
    <IconRenderer
      Icon={Icon}
      size={size}
      color={color}
      weight={weight}
      shape={shape}
      shapeColor={shapeColor}
      shapeGradient={shapeGradient}
      shapeGradientDirection={shapeGradientDirection}
      shapeBorderColor={shapeBorderColor}
      shapeBorderWidth={shapeBorderWidth}
      shapeRotation={shapeRotation}
      shapeOpacity={shapeOpacity}
      iconPadding={iconPadding}
      iconRotation={iconRotation}
      iconOpacity={iconOpacity}
      previewBackground="transparent"
    />
  );
}