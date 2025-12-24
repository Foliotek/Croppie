/**
 * Loads an image from a URL and returns a promise
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // Only set crossOrigin for actual URLs, not data URLs
    if (!url.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))

    img.src = url
  })
}

/**
 * Converts a File or Blob to a data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as data URL'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))

    reader.readAsDataURL(file)
  })
}

/**
 * Gets the natural dimensions of an image
 */
export function getImageDimensions(img: HTMLImageElement): { width: number; height: number } {
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
}

/**
 * Calculates the aspect ratio of dimensions
 */
export function aspectRatio(width: number, height: number): number {
  return width / height
}

/**
 * Calculates initial zoom to fit image in boundary
 */
export function calculateInitialZoom(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const widthRatio = viewportWidth / imageWidth
  const heightRatio = viewportHeight / imageHeight

  // Use the larger ratio to ensure viewport is filled
  return Math.max(widthRatio, heightRatio)
}
