import type { CropPoints, OutputFormat } from '../types.ts'

/**
 * Draws an image to a canvas with the specified crop and dimensions
 */
export function drawCroppedImage(
  image: HTMLImageElement,
  points: CropPoints,
  outputWidth: number,
  outputHeight: number,
  options?: {
    circle?: boolean
    backgroundColor?: string
  },
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  // Fill background if specified
  if (options?.backgroundColor) {
    ctx.fillStyle = options.backgroundColor
    ctx.fillRect(0, 0, outputWidth, outputHeight)
  }

  // Apply circular mask if needed
  if (options?.circle) {
    ctx.beginPath()
    ctx.arc(outputWidth / 2, outputHeight / 2, outputWidth / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
  }

  // Calculate source dimensions from points
  const sourceWidth = points.bottomRightX - points.topLeftX
  const sourceHeight = points.bottomRightY - points.topLeftY

  // Draw the cropped region
  ctx.drawImage(
    image,
    points.topLeftX,
    points.topLeftY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  )

  return canvas
}

/**
 * Converts a canvas to a Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat = 'png',
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = `image/${format}`

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      mimeType,
      quality,
    )
  })
}

/**
 * Converts a canvas to a base64 data URL
 */
export function canvasToBase64(
  canvas: HTMLCanvasElement,
  format: OutputFormat = 'png',
  quality = 0.92,
): string {
  const mimeType = `image/${format}`
  return canvas.toDataURL(mimeType, quality)
}
