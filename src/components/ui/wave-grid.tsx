"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface WaveGridBackgroundProps {
  className?: string
  children?: React.ReactNode
  /** Grid cell size */
  gridSize?: number
  /** Wave height */
  waveHeight?: number
  /** Wave animation speed */
  waveSpeed?: number
  /** Wave / grid line color (e.g. brand purple) */
  color?: string
  /** Canvas and container fill — match page background (e.g. landing beige) */
  backgroundColor?: string
  /** Softer edge tint for vignette (typically slightly darker than background) */
  vignetteEdgeColor?: string
  /** Vertical anchor for the wave horizon (fraction of canvas height). Higher ≈ waves sit lower (e.g. 0.85 for bottom band). */
  horizonRatio?: number
  /** When true, only the grid lines are drawn; parent can show CSS gradients / patterns behind. */
  transparentBackdrop?: boolean
  /** Disable wave animation on narrow screens to keep mobile UI stable. */
  disableAnimationOnMobile?: boolean
  /** Pin wave layer to viewport on mobile while scrolling. */
  lockToViewportOnMobile?: boolean
}

const DEFAULT_BG = "#e8e0d4"
const DEFAULT_VIGNETTE_EDGE = "#d4c9b0"

export function WaveGridBackground({
  className,
  children,
  gridSize = 30,
  waveHeight = 40,
  waveSpeed = 1,
  color = "#06b6d4",
  backgroundColor = DEFAULT_BG,
  vignetteEdgeColor = DEFAULT_VIGNETTE_EDGE,
  horizonRatio = 0.6,
  transparentBackdrop = false,
  disableAnimationOnMobile = true,
  lockToViewportOnMobile = false,
}: WaveGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    let width = rect.width
    let height = rect.height

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    let animationId: number
    let tick = 0

    // Resize handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    // Parse color
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
          }
        : { r: 6, g: 182, b: 212 }
    }

    const rgb = hexToRgb(color)

    const PERSPECTIVE = 600
    const CAMERA_Z = -200
    const CAMERA_Y = 150
    const ROW_COUNT = 25

    // Get wave height at a point
    const getWaveHeight = (x: number, z: number, t: number) => {
      return (
        Math.sin(x * 0.02 + t) * Math.cos(z * 0.02 + t * 0.8) * waveHeight +
        Math.sin(x * 0.01 - t * 0.5 + z * 0.015) * waveHeight * 0.5 +
        Math.sin((x + z) * 0.008 + t * 1.2) * waveHeight * 0.3
      )
    }

    // Project 3D to 2D with perspective
    const project = (x: number, y: number, z: number) => {
      const relZ = z - CAMERA_Z
      const scale = PERSPECTIVE / (PERSPECTIVE + relZ)

      return {
        x: width / 2 + x * scale,
        y: height * horizonRatio + (y - CAMERA_Y) * scale,
        scale,
      }
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches
    const shouldAnimate = !(prefersReducedMotion || (disableAnimationOnMobile && isMobileViewport))

    const drawFrame = () => {
      tick += 0.015 * waveSpeed

      if (transparentBackdrop) {
        ctx.clearRect(0, 0, width, height)
      } else {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      // Enough world-span so at the deepest row (smallest perspective scale) the grid still reaches left/right edges
      const maxZ = (ROW_COUNT - 1) * gridSize
      const relZMax = maxZ - CAMERA_Z
      const minScale = PERSPECTIVE / (PERSPECTIVE + relZMax)
      const halfWorldX = width / (2 * minScale)
      const cols = Math.ceil((2 * halfWorldX) / gridSize) + 10
      const startX = (-cols * gridSize) / 2
      const startZ = 0

      // Draw grid from back to front
      for (let row = ROW_COUNT - 1; row >= 0; row--) {
        const z = startZ + row * gridSize

        // Draw horizontal line
        ctx.beginPath()
        let firstPoint = true

        for (let col = 0; col <= cols; col++) {
          const x = startX + col * gridSize
          const waveY = getWaveHeight(x, z, tick)
          const projected = project(x, waveY, z)

          if (firstPoint) {
            ctx.moveTo(projected.x, projected.y)
            firstPoint = false
          } else {
            ctx.lineTo(projected.x, projected.y)
          }
        }

        const rowBrightness = 0.2 + (1 - row / ROW_COUNT) * 0.6
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rowBrightness})`
        ctx.lineWidth = Math.max(0.5, (1 - row / ROW_COUNT) * 1.5)
        ctx.stroke()

        // Draw vertical lines for this row
        if (row < ROW_COUNT - 1) {
          for (let col = 0; col <= cols; col++) {
            const x = startX + col * gridSize

            const z1 = z
            const z2 = z + gridSize
            const waveY1 = getWaveHeight(x, z1, tick)
            const waveY2 = getWaveHeight(x, z2, tick)

            const p1 = project(x, waveY1, z1)
            const p2 = project(x, waveY2, z2)

            // Height-based brightness
            const avgHeight = (waveY1 + waveY2) / 2
            const heightBrightness = 0.3 + (avgHeight / waveHeight + 1) * 0.35
            const distBrightness = 0.2 + (1 - row / ROW_COUNT) * 0.6
            const brightness = heightBrightness * distBrightness

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`
            ctx.lineWidth = Math.max(0.5, (1 - row / ROW_COUNT) * 1.2)
            ctx.stroke()
          }
        }
      }

      // Glow overlay at peaks
      if (!transparentBackdrop) {
        const gy = height * (horizonRatio + 0.04)
        const glowR = Math.max(width, height) * 0.55
        const gradient = ctx.createRadialGradient(
          width / 2,
          gy,
          0,
          width / 2,
          gy,
          glowR,
        )
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      if (shouldAnimate) {
        animationId = requestAnimationFrame(drawFrame)
      }
    }

    if (shouldAnimate) {
      animationId = requestAnimationFrame(drawFrame)
    } else {
      drawFrame()
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [
    gridSize,
    waveHeight,
    waveSpeed,
    color,
    backgroundColor,
    horizonRatio,
    transparentBackdrop,
    disableAnimationOnMobile,
  ])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full min-h-[24rem] overflow-hidden",
        transparentBackdrop && "bg-transparent",
        className,
      )}
      style={transparentBackdrop ? undefined : { backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full",
          lockToViewportOnMobile && "fixed z-[2] md:absolute md:z-auto",
        )}
      />

      {!transparentBackdrop ? (
        <>
          {/* Top fade — blend hero into header / sky */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
            style={{
              background: `linear-gradient(to bottom, ${backgroundColor} 0%, transparent 100%)`,
            }}
          />

          {/* Soft vignette — follows wave anchor so bottom-heavy layouts stay balanced */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% ${Math.min(96, Math.round(horizonRatio * 100))}%, transparent 0%, transparent 42%, ${vignetteEdgeColor} 100%)`,
            }}
          />
        </>
      ) : null}

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function WaveGridBackgroundDemo() {
  return (
    <div className="fixed inset-0">
      <WaveGridBackground className="min-h-screen" />
    </div>
  )
}
