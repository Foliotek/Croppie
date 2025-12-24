import type { Boundary, Viewport, ViewportType } from '../types.ts'
import { createElement } from '../utils/dom.ts'

/**
 * Creates the main container element
 */
export function createContainer(customClass?: string): HTMLDivElement {
  const container = createElement('div', {
    className: `croppie-container${customClass ? ` ${customClass}` : ''}`,
  })
  return container
}

/**
 * Creates the boundary element (outer container)
 */
export function createBoundary(boundary: Boundary): HTMLDivElement {
  const element = createElement('div', {
    className: 'cr-boundary',
    styles: {
      width: `${boundary.width}px`,
      height: `${boundary.height}px`,
      position: 'relative',
      overflow: 'hidden',
    },
  })
  return element
}

/**
 * Creates the viewport element (crop area overlay)
 */
export function createViewport(viewport: Viewport): HTMLDivElement {
  const element = createElement('div', {
    className: `cr-viewport cr-vp-${viewport.type}`,
    styles: {
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      borderRadius: viewport.type === 'circle' ? '50%' : '0',
    },
  })
  return element
}

/**
 * Creates the overlay element (darkened area outside viewport)
 */
export function createOverlay(boundary: Boundary, viewport: Viewport): HTMLDivElement {
  const element = createElement('div', {
    className: 'cr-overlay',
    styles: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
  })

  // The overlay uses a CSS mask or clip-path to create the cutout
  const maskImage = createMaskImage(boundary, viewport)
  element.style.background = 'rgba(0, 0, 0, 0.5)'
  element.style.maskImage = maskImage
  element.style.webkitMaskImage = maskImage

  return element
}

/**
 * Creates a CSS mask image for the viewport cutout
 */
function createMaskImage(boundary: Boundary, viewport: Viewport): string {
  const centerX = boundary.width / 2
  const centerY = boundary.height / 2

  if (viewport.type === 'circle') {
    const radius = viewport.width / 2
    // Create a radial gradient that's transparent in the center
    return `radial-gradient(circle ${radius}px at ${centerX}px ${centerY}px, transparent ${radius}px, black ${radius}px)`
  }

  // For square, use a more complex gradient
  const left = centerX - viewport.width / 2
  const right = centerX + viewport.width / 2
  const top = centerY - viewport.height / 2
  const bottom = centerY + viewport.height / 2

  // This creates a rectangular hole using CSS gradients
  return `
    linear-gradient(to right, black ${left}px, transparent ${left}px, transparent ${right}px, black ${right}px),
    linear-gradient(to bottom, black ${top}px, transparent ${top}px, transparent ${bottom}px, black ${bottom}px)
  `
}

/**
 * Creates the image preview element
 */
export function createPreview(): HTMLImageElement {
  const element = createElement('img', {
    className: 'cr-image',
    attributes: {
      alt: 'Cropper image',
      draggable: 'false',
    },
    styles: {
      position: 'absolute',
      top: '0',
      left: '0',
      transformOrigin: '0 0',
      maxWidth: 'none',
      maxHeight: 'none',
    },
  })
  return element
}

/**
 * Creates the zoom slider element
 */
export function createZoomSlider(min: number, max: number, value: number): HTMLInputElement {
  const element = createElement('input', {
    className: 'cr-slider',
    attributes: {
      type: 'range',
      min: String(min),
      max: String(max),
      step: '0.01',
      value: String(value),
    },
  })
  return element
}

/**
 * Creates the slider container
 */
export function createSliderContainer(): HTMLDivElement {
  return createElement('div', {
    className: 'cr-slider-wrap',
  })
}
