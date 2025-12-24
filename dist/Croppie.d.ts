import type { BindOptions, CroppieData, CroppieEventHandler, CroppieEvents, CroppieOptions, ResultOptions } from './types.ts';
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
export declare class Croppie {
    private readonly element;
    private readonly options;
    private container;
    private boundaryEl;
    private viewportEl;
    private overlayEl;
    private previewEl;
    private sliderEl;
    private image;
    private transform;
    private zoomConfig;
    private eventHandlers;
    private cleanupFns;
    constructor(element: HTMLElement, options: CroppieOptions);
    /**
     * Creates all DOM elements
     */
    private createElements;
    /**
     * Attaches drag and zoom event handlers
     */
    private attachEventHandlers;
    /**
     * Loads an image into the cropper
     */
    bind(options: BindOptions | string): Promise<void>;
    /**
     * Binds a File or Blob to the cropper
     */
    bindFile(file: File | Blob): Promise<void>;
    /**
     * Gets the current cropped result
     */
    result(options: ResultOptions): Promise<Blob | string | HTMLCanvasElement>;
    /**
     * Gets the current crop data
     */
    get(): CroppieData;
    /**
     * Gets the current zoom level
     */
    get zoom(): number;
    /**
     * Sets the zoom level
     */
    set zoom(value: number);
    /**
     * Sets the zoom level with clamping
     */
    setZoom(value: number): void;
    /**
     * Rotates the image by 90 degree increments
     */
    rotate(degrees: 90 | 180 | 270 | -90): void;
    /**
     * Resets the cropper to initial state
     */
    reset(): void;
    /**
     * Destroys the cropper and cleans up
     */
    destroy(): void;
    /**
     * Registers an event handler
     */
    on<K extends keyof CroppieEvents>(event: K, handler: CroppieEventHandler<K>): void;
    /**
     * Removes an event handler
     */
    off<K extends keyof CroppieEvents>(event: K, handler: CroppieEventHandler<K>): void;
    /**
     * Updates the CSS transform on the preview element
     */
    private updateTransform;
    /**
     * Updates the slider value to match current zoom
     */
    private updateSlider;
    /**
     * Calculates the crop points based on current transform
     */
    private getPoints;
    /**
     * Emits an update event
     */
    private emitUpdate;
    /**
     * Emits an event to all registered handlers
     */
    private emitEvent;
}
//# sourceMappingURL=Croppie.d.ts.map