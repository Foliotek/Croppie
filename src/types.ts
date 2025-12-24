/**
 * Viewport shape type - determines the cropping mask shape
 */
export type ViewportType = 'circle' | 'square'

/**
 * Output format for the cropped image
 */
export type OutputFormat = 'png' | 'jpeg' | 'webp'

/**
 * Output type - what format to return the result in
 */
export type OutputType = 'blob' | 'base64' | 'canvas'

/**
 * Viewport configuration - defines the visible cropping area
 */
export interface Viewport {
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** Shape of the viewport mask */
  type: ViewportType
}

/**
 * Boundary configuration - defines the outer container
 */
export interface Boundary {
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
}

/**
 * Zoom configuration
 */
export interface ZoomConfig {
  /** Minimum zoom level (default: 0.1) */
  min: number
  /** Maximum zoom level (default: 10) */
  max: number
  /** Initial zoom level */
  initial?: number
}

/**
 * Main Croppie configuration options
 */
export interface CroppieOptions {
  /** Viewport (cropping area) configuration */
  viewport: Viewport
  /** Boundary (container) configuration - defaults to viewport + padding */
  boundary?: Boundary
  /** Zoom limits */
  zoom?: Partial<ZoomConfig>
  /** Show zoom slider control */
  showZoomer?: boolean
  /** Enable mouse wheel zoom */
  mouseWheelZoom?: boolean | 'ctrl'
  /** Enable EXIF orientation correction */
  enableExif?: boolean
  /**
   * @deprecated Use rotate() method instead. This option is a no-op for v2.6 migration compatibility.
   */
  enableOrientation?: boolean
  /** Enable resize handles on viewport */
  enableResize?: boolean
  /** Custom CSS class for the container */
  customClass?: string
}

/**
 * Crop points - the coordinates of the cropped region
 */
export interface CropPoints {
  /** Top-left X coordinate */
  topLeftX: number
  /** Top-left Y coordinate */
  topLeftY: number
  /** Bottom-right X coordinate */
  bottomRightX: number
  /** Bottom-right Y coordinate */
  bottomRightY: number
}

/**
 * Array format for crop points (v2.6 compatibility)
 * [topLeftX, topLeftY, bottomRightX, bottomRightY]
 */
export type PointsArray = [number, number, number, number]

/**
 * Current state of the cropper
 */
export interface CroppieData {
  /** Crop boundary points */
  points: CropPoints
  /** Current zoom level */
  zoom: number
  /** Current rotation in degrees */
  orientation?: number
}

/**
 * Bind options - for loading an image
 */
export interface BindOptions {
  /** Image URL or data URL */
  url: string
  /** Initial crop points (array [x1,y1,x2,y2] or object) */
  points?: CropPoints | PointsArray
  /** Initial zoom level */
  zoom?: number
  /** EXIF orientation (1-8) */
  orientation?: number
}

/**
 * Result options - for exporting the cropped image
 */
export interface ResultOptions {
  /** Output type */
  type: OutputType
  /** Output dimensions */
  size?: { width: number; height: number } | 'viewport' | 'original'
  /** Output format (for base64/blob) */
  format?: OutputFormat
  /** JPEG/WebP quality (0-1) */
  quality?: number
  /** Include circular mask in output (for circle viewport) */
  circle?: boolean
  /** Background color for transparent images */
  backgroundColor?: string
}

/**
 * Event types emitted by Croppie
 */
export interface CroppieEvents {
  /** Fired when zoom/pan changes */
  update: CroppieData
  /** Fired when zoom level changes */
  zoom: { zoom: number; previousZoom: number }
}

/**
 * Event handler type
 */
export type CroppieEventHandler<K extends keyof CroppieEvents> = (data: CroppieEvents[K]) => void

/**
 * Internal state for tracking transforms
 */
export interface TransformState {
  /** Current X translation */
  x: number
  /** Current Y translation */
  y: number
  /** Current scale/zoom */
  scale: number
}
