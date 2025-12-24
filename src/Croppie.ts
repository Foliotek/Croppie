import type {
  BindOptions,
  Boundary,
  CropPoints,
  CroppieData,
  CroppieEventHandler,
  CroppieEvents,
  CroppieOptions,
  ResultOptions,
  TransformState,
  Viewport,
  ZoomConfig,
} from './types.ts'

import {
  createBoundary,
  createContainer,
  createOverlay,
  createPreview,
  createSliderContainer,
  createViewport,
  createZoomSlider,
} from './ui/index.ts'

import { canvasToBase64, canvasToBlob, drawCroppedImage } from './canvas/index.ts'
import { createDragHandler } from './input/drag.ts'
import { createPinchZoomHandler, createWheelZoomHandler } from './input/zoom.ts'
import {
  calculateInitialZoom,
  clamp,
  fileToDataUrl,
  loadImage,
  normalizePoints,
  setTransform,
} from './utils/index.ts'

const DEFAULT_ZOOM: ZoomConfig = {
  min: 0.1,
  max: 10,
}

/**
 * Modern, TypeScript-first image cropper.
 *
 * @example
 * ```ts
 * const croppie = new Croppie(element, {
 *   viewport: { width: 200, height: 200, type: 'circle' }
 * })
 *
 * await croppie.bind({ url: 'image.jpg' })
 * const blob = await croppie.result({ type: 'blob' })
 * ```
 */
export class Croppie {
  private readonly element: HTMLElement
  private readonly options: Required<
    Pick<CroppieOptions, 'viewport' | 'boundary' | 'showZoomer' | 'mouseWheelZoom'>
  > &
    CroppieOptions

  // DOM elements
  private container: HTMLDivElement | null = null
  private boundaryEl: HTMLDivElement | null = null
  private viewportEl: HTMLDivElement | null = null
  private overlayEl: HTMLDivElement | null = null
  private previewEl: HTMLImageElement | null = null
  private sliderEl: HTMLInputElement | null = null

  // State
  private image: HTMLImageElement | null = null
  private transform: TransformState = { x: 0, y: 0, scale: 1 }
  private zoomConfig: ZoomConfig

  // Event handlers
  private eventHandlers: Map<keyof CroppieEvents, Set<CroppieEventHandler<keyof CroppieEvents>>> =
    new Map()

  // Cleanup functions
  private cleanupFns: Array<() => void> = []

  constructor(element: HTMLElement, options: CroppieOptions) {
    this.element = element

    // Calculate default boundary (viewport + 100px padding)
    const defaultBoundary: Boundary = {
      width: options.viewport.width + 100,
      height: options.viewport.height + 100,
    }

    this.options = {
      ...options,
      boundary: options.boundary ?? defaultBoundary,
      showZoomer: options.showZoomer ?? true,
      mouseWheelZoom: options.mouseWheelZoom ?? true,
    }

    this.zoomConfig = {
      ...DEFAULT_ZOOM,
      ...options.zoom,
    }

    // Deprecation warning for v2.6 migration
    if (options.enableOrientation !== undefined) {
      console.warn(
        '[@bayinformatics/croppie] enableOrientation is deprecated and has no effect. Rotation support is planned for a future release.',
      )
    }

    this.createElements()
    this.attachEventHandlers()
  }

  /**
   * Creates all DOM elements
   */
  private createElements(): void {
    this.container = createContainer(this.options.customClass)
    this.boundaryEl = createBoundary(this.options.boundary)
    this.viewportEl = createViewport(this.options.viewport)
    this.overlayEl = createOverlay(this.options.boundary, this.options.viewport)
    this.previewEl = createPreview()

    // Assemble the DOM tree
    this.boundaryEl.appendChild(this.previewEl)
    this.boundaryEl.appendChild(this.overlayEl)
    this.boundaryEl.appendChild(this.viewportEl)
    this.container.appendChild(this.boundaryEl)

    // Add zoom slider if enabled
    if (this.options.showZoomer) {
      const sliderWrap = createSliderContainer()
      this.sliderEl = createZoomSlider(
        this.zoomConfig.min,
        this.zoomConfig.max,
        this.transform.scale,
      )
      sliderWrap.appendChild(this.sliderEl)
      this.container.appendChild(sliderWrap)

      // Slider input handler
      const handleSliderInput = () => {
        if (this.sliderEl) {
          const previousZoom = this.transform.scale
          this.setZoom(Number.parseFloat(this.sliderEl.value))
          this.emitEvent('zoom', { zoom: this.transform.scale, previousZoom })
        }
      }
      this.sliderEl.addEventListener('input', handleSliderInput)
      this.cleanupFns.push(() => {
        this.sliderEl?.removeEventListener('input', handleSliderInput)
      })
    }

    this.element.appendChild(this.container)
  }

  /**
   * Attaches drag and zoom event handlers
   */
  private attachEventHandlers(): void {
    if (!this.boundaryEl || !this.previewEl) return

    // Drag handler
    const dragCleanup = createDragHandler(
      this.boundaryEl,
      () => this.transform,
      (x, y) => {
        this.transform.x = x
        this.transform.y = y
        this.updateTransform()
        this.emitUpdate()
      },
    )
    this.cleanupFns.push(dragCleanup)

    // Wheel zoom handler
    if (this.options.mouseWheelZoom) {
      const requireCtrl = this.options.mouseWheelZoom === 'ctrl'
      const wheelCleanup = createWheelZoomHandler(
        this.boundaryEl,
        () => this.transform.scale,
        (zoom) => this.setZoom(zoom),
        this.zoomConfig,
        {
          onChange: (zoom, previousZoom) => {
            this.emitEvent('zoom', { zoom, previousZoom })
          },
        },
        requireCtrl,
      )
      this.cleanupFns.push(wheelCleanup)
    }

    // Pinch zoom handler
    const pinchCleanup = createPinchZoomHandler(
      this.boundaryEl,
      () => this.transform.scale,
      (zoom) => this.setZoom(zoom),
      this.zoomConfig,
      {
        onChange: (zoom, previousZoom) => {
          this.emitEvent('zoom', { zoom, previousZoom })
        },
      },
    )
    this.cleanupFns.push(pinchCleanup)
  }

  /**
   * Loads an image into the cropper
   */
  async bind(options: BindOptions | string): Promise<void> {
    const bindOptions: BindOptions = typeof options === 'string' ? { url: options } : options

    this.image = await loadImage(bindOptions.url)

    if (this.previewEl) {
      this.previewEl.src = bindOptions.url
    }

    // Calculate initial zoom to fit viewport
    const initialZoom =
      bindOptions.zoom ??
      calculateInitialZoom(
        this.image.naturalWidth,
        this.image.naturalHeight,
        this.options.viewport.width,
        this.options.viewport.height,
      )

    this.transform = {
      x: 0,
      y: 0,
      scale: clamp(initialZoom, this.zoomConfig.min, this.zoomConfig.max),
    }

    // Apply initial points if provided
    if (bindOptions.points) {
      const normalizedPoints = normalizePoints(bindOptions.points)
      if (normalizedPoints) {
        // TODO: Calculate transform from points - not yet implemented
        console.warn(
          '[@bayinformatics/croppie] Initial points are not yet fully supported. Provided:',
          normalizedPoints,
        )
      }
    }

    this.updateTransform()
    this.updateSlider()
  }

  /**
   * Binds a File or Blob to the cropper
   */
  async bindFile(file: File | Blob): Promise<void> {
    const dataUrl = await fileToDataUrl(file)
    await this.bind({ url: dataUrl })
  }

  /**
   * Gets the current cropped result
   */
  async result(options: ResultOptions): Promise<Blob | string | HTMLCanvasElement> {
    if (!this.image) {
      throw new Error('No image bound')
    }

    const points = this.getPoints()
    const viewport = this.options.viewport

    // Determine output size
    let outputWidth: number
    let outputHeight: number

    if (options.size === 'viewport') {
      outputWidth = viewport.width
      outputHeight = viewport.height
    } else if (options.size === 'original') {
      outputWidth = points.bottomRightX - points.topLeftX
      outputHeight = points.bottomRightY - points.topLeftY
    } else if (options.size) {
      outputWidth = options.size.width
      outputHeight = options.size.height
    } else {
      outputWidth = viewport.width
      outputHeight = viewport.height
    }

    const canvas = drawCroppedImage(this.image, points, outputWidth, outputHeight, {
      circle: options.circle ?? viewport.type === 'circle',
      backgroundColor: options.backgroundColor,
    })

    switch (options.type) {
      case 'canvas':
        return canvas
      case 'base64':
        return canvasToBase64(canvas, options.format, options.quality)
      case 'blob':
        return canvasToBlob(canvas, options.format, options.quality)
      default:
        throw new Error(`Unknown result type: ${options.type}`)
    }
  }

  /**
   * Gets the current crop data
   */
  get(): CroppieData {
    return {
      points: this.getPoints(),
      zoom: this.transform.scale,
    }
  }

  /**
   * Gets the current zoom level
   */
  get zoom(): number {
    return this.transform.scale
  }

  /**
   * Sets the zoom level
   */
  set zoom(value: number) {
    this.setZoom(value)
  }

  /**
   * Sets the zoom level with clamping
   */
  setZoom(value: number): void {
    const previousZoom = this.transform.scale
    this.transform.scale = clamp(value, this.zoomConfig.min, this.zoomConfig.max)
    this.updateTransform()
    this.updateSlider()

    if (previousZoom !== this.transform.scale) {
      this.emitUpdate()
    }
  }

  /**
   * Rotates the image by 90 degree increments
   */
  rotate(degrees: 90 | 180 | 270 | -90): void {
    // TODO: Implement rotation
    console.warn('Rotation not yet implemented:', degrees)
  }

  /**
   * Resets the cropper to initial state
   */
  reset(): void {
    if (this.image) {
      const initialZoom = calculateInitialZoom(
        this.image.naturalWidth,
        this.image.naturalHeight,
        this.options.viewport.width,
        this.options.viewport.height,
      )

      this.transform = { x: 0, y: 0, scale: initialZoom }
      this.updateTransform()
      this.updateSlider()
      this.emitUpdate()
    }
  }

  /**
   * Destroys the cropper and cleans up
   */
  destroy(): void {
    // Run all cleanup functions
    for (const cleanup of this.cleanupFns) {
      cleanup()
    }
    this.cleanupFns = []

    // Clear event handlers
    this.eventHandlers.clear()

    // Remove DOM elements
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }

    this.container = null
    this.boundaryEl = null
    this.viewportEl = null
    this.overlayEl = null
    this.previewEl = null
    this.sliderEl = null
    this.image = null
  }

  /**
   * Registers an event handler
   */
  on<K extends keyof CroppieEvents>(event: K, handler: CroppieEventHandler<K>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)?.add(handler as CroppieEventHandler<keyof CroppieEvents>)
  }

  /**
   * Removes an event handler
   */
  off<K extends keyof CroppieEvents>(event: K, handler: CroppieEventHandler<K>): void {
    this.eventHandlers.get(event)?.delete(handler as CroppieEventHandler<keyof CroppieEvents>)
  }

  /**
   * Updates the CSS transform on the preview element
   */
  private updateTransform(): void {
    if (this.previewEl) {
      // Center the image in the boundary
      const boundaryWidth = this.options.boundary.width
      const boundaryHeight = this.options.boundary.height
      const imageWidth = this.image?.naturalWidth ?? 0
      const imageHeight = this.image?.naturalHeight ?? 0

      const scaledWidth = imageWidth * this.transform.scale
      const scaledHeight = imageHeight * this.transform.scale

      const centerX = (boundaryWidth - scaledWidth) / 2 + this.transform.x
      const centerY = (boundaryHeight - scaledHeight) / 2 + this.transform.y

      setTransform(this.previewEl, centerX, centerY, this.transform.scale)
    }
  }

  /**
   * Updates the slider value to match current zoom
   */
  private updateSlider(): void {
    if (this.sliderEl) {
      this.sliderEl.value = String(this.transform.scale)
    }
  }

  /**
   * Calculates the crop points based on current transform
   */
  private getPoints(): CropPoints {
    if (!this.image) {
      return { topLeftX: 0, topLeftY: 0, bottomRightX: 0, bottomRightY: 0 }
    }

    const viewport = this.options.viewport
    const boundary = this.options.boundary
    const imageWidth = this.image.naturalWidth
    const imageHeight = this.image.naturalHeight

    // Calculate the visible area in image coordinates
    const scaledWidth = imageWidth * this.transform.scale
    const scaledHeight = imageHeight * this.transform.scale

    const imageLeft = (boundary.width - scaledWidth) / 2 + this.transform.x
    const imageTop = (boundary.height - scaledHeight) / 2 + this.transform.y

    const viewportLeft = (boundary.width - viewport.width) / 2
    const viewportTop = (boundary.height - viewport.height) / 2

    // Convert viewport coordinates to image coordinates
    const topLeftX = (viewportLeft - imageLeft) / this.transform.scale
    const topLeftY = (viewportTop - imageTop) / this.transform.scale
    const bottomRightX = topLeftX + viewport.width / this.transform.scale
    const bottomRightY = topLeftY + viewport.height / this.transform.scale

    return {
      topLeftX: Math.max(0, topLeftX),
      topLeftY: Math.max(0, topLeftY),
      bottomRightX: Math.min(imageWidth, bottomRightX),
      bottomRightY: Math.min(imageHeight, bottomRightY),
    }
  }

  /**
   * Emits an update event
   */
  private emitUpdate(): void {
    this.emitEvent('update', this.get())
  }

  /**
   * Emits an event to all registered handlers
   */
  private emitEvent<K extends keyof CroppieEvents>(event: K, data: CroppieEvents[K]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        ;(handler as CroppieEventHandler<K>)(data)
      }
    }
  }
}
