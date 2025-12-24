/**
 * Loads an image from a URL and returns a promise
 */
export declare function loadImage(url: string): Promise<HTMLImageElement>;
/**
 * Converts a File or Blob to a data URL
 */
export declare function fileToDataUrl(file: File | Blob): Promise<string>;
/**
 * Gets the natural dimensions of an image
 */
export declare function getImageDimensions(img: HTMLImageElement): {
    width: number;
    height: number;
};
/**
 * Calculates the aspect ratio of dimensions
 */
export declare function aspectRatio(width: number, height: number): number;
/**
 * Calculates initial zoom to fit image in boundary
 */
export declare function calculateInitialZoom(imageWidth: number, imageHeight: number, viewportWidth: number, viewportHeight: number): number;
//# sourceMappingURL=image.d.ts.map