/**
 * Creates an HTML element with optional attributes and classes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string
    attributes?: Record<string, string>
    styles?: Partial<CSSStyleDeclaration>
  },
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)

  if (options?.className) {
    element.className = options.className
  }

  if (options?.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value)
    }
  }

  if (options?.styles) {
    Object.assign(element.style, options.styles)
  }

  return element
}

/**
 * Gets the computed CSS transform matrix values
 */
export function getTransformValues(element: HTMLElement): {
  x: number
  y: number
  scale: number
} {
  const style = window.getComputedStyle(element)
  const transform = style.transform

  if (!transform || transform === 'none') {
    return { x: 0, y: 0, scale: 1 }
  }

  // matrix(a, b, c, d, tx, ty) or matrix3d(...)
  const match = transform.match(/matrix.*\((.+)\)/)
  if (!match?.[1]) {
    return { x: 0, y: 0, scale: 1 }
  }

  const values = match[1].split(', ').map(Number)

  if (values.length === 6) {
    // 2D matrix
    return {
      x: values[4] ?? 0,
      y: values[5] ?? 0,
      scale: Math.sqrt((values[0] ?? 1) ** 2 + (values[1] ?? 0) ** 2),
    }
  }

  // 3D matrix (16 values)
  return {
    x: values[12] ?? 0,
    y: values[13] ?? 0,
    scale: values[0] ?? 1,
  }
}

/**
 * Applies transform to an element
 */
export function setTransform(element: HTMLElement, x: number, y: number, scale: number): void {
  element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
}
