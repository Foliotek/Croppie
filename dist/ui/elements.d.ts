import type { Boundary, Viewport } from '../types.ts';
/**
 * Creates the main container element
 */
export declare function createContainer(customClass?: string): HTMLDivElement;
/**
 * Creates the boundary element (outer container)
 */
export declare function createBoundary(boundary: Boundary): HTMLDivElement;
/**
 * Creates the viewport element (crop area overlay)
 */
export declare function createViewport(viewport: Viewport): HTMLDivElement;
/**
 * Creates the overlay element (darkened area outside viewport)
 */
export declare function createOverlay(boundary: Boundary, viewport: Viewport): HTMLDivElement;
/**
 * Creates the image preview element
 */
export declare function createPreview(): HTMLImageElement;
/**
 * Creates the zoom slider element
 */
export declare function createZoomSlider(min: number, max: number, value: number): HTMLInputElement;
/**
 * Creates the slider container
 */
export declare function createSliderContainer(): HTMLDivElement;
//# sourceMappingURL=elements.d.ts.map