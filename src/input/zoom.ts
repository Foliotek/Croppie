import { clamp } from '../utils/clamp.ts'

export interface ZoomCallbacks {
  onChange?: (zoom: number, previousZoom: number) => void
}

export interface ZoomConfig {
  min: number
  max: number
}

/**
 * Creates mouse wheel zoom handler
 */
export function createWheelZoomHandler(
  element: HTMLElement,
  getZoom: () => number,
  setZoom: (zoom: number) => void,
  config: ZoomConfig,
  callbacks?: ZoomCallbacks,
  requireCtrl = false,
): () => void {
  const handleWheel = (e: WheelEvent) => {
    // Check for ctrl requirement
    if (requireCtrl && !e.ctrlKey) return

    e.preventDefault()

    const previousZoom = getZoom()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = clamp(previousZoom + delta, config.min, config.max)

    if (newZoom !== previousZoom) {
      setZoom(newZoom)
      callbacks?.onChange?.(newZoom, previousZoom)
    }
  }

  element.addEventListener('wheel', handleWheel, { passive: false })

  return () => {
    element.removeEventListener('wheel', handleWheel)
  }
}

/**
 * Creates pinch-to-zoom handler for touch devices
 */
export function createPinchZoomHandler(
  element: HTMLElement,
  getZoom: () => number,
  setZoom: (zoom: number) => void,
  config: ZoomConfig,
  callbacks?: ZoomCallbacks,
): () => void {
  let initialDistance = 0
  let initialZoom = 1

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0
    const touch1 = touches.item(0)
    const touch2 = touches.item(1)
    if (!touch1 || !touch2) return 0
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      initialDistance = getDistance(e.touches)
      initialZoom = getZoom()
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance > 0) {
      e.preventDefault()

      const currentDistance = getDistance(e.touches)
      const scale = currentDistance / initialDistance
      const previousZoom = getZoom()
      const newZoom = clamp(initialZoom * scale, config.min, config.max)

      if (newZoom !== previousZoom) {
        setZoom(newZoom)
        callbacks?.onChange?.(newZoom, previousZoom)
      }
    }
  }

  const handleTouchEnd = () => {
    initialDistance = 0
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: false })
  element.addEventListener('touchmove', handleTouchMove, { passive: false })
  element.addEventListener('touchend', handleTouchEnd)

  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  }
}
