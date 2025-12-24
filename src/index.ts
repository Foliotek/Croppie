/**
 * @bayinformatics/croppie
 *
 * A modern, TypeScript-first image cropper.
 * Fork of Foliotek/Croppie with ES modules, TypeScript, and modern APIs.
 *
 * @packageDocumentation
 */

export { Croppie } from './Croppie.ts'
export type {
  CroppieOptions,
  CroppieData,
  CroppieEvents,
  CroppieEventHandler,
  BindOptions,
  ResultOptions,
  CropPoints,
  Viewport,
  Boundary,
  ZoomConfig,
  ViewportType,
  OutputFormat,
  OutputType,
} from './types.ts'

// Default export for convenience
export { Croppie as default } from './Croppie.ts'
