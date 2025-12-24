import type { CropPoints, OutputFormat } from '../types.ts';
/**
 * Draws an image to a canvas with the specified crop and dimensions
 */
export declare function drawCroppedImage(image: HTMLImageElement, points: CropPoints, outputWidth: number, outputHeight: number, options?: {
    circle?: boolean;
    backgroundColor?: string;
}): HTMLCanvasElement;
/**
 * Converts a canvas to a Blob
 */
export declare function canvasToBlob(canvas: HTMLCanvasElement, format?: OutputFormat, quality?: number): Promise<Blob>;
/**
 * Converts a canvas to a base64 data URL
 */
export declare function canvasToBase64(canvas: HTMLCanvasElement, format?: OutputFormat, quality?: number): string;
//# sourceMappingURL=draw.d.ts.map