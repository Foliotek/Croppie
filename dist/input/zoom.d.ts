export interface ZoomCallbacks {
    onChange?: (zoom: number, previousZoom: number) => void;
}
export interface ZoomConfig {
    min: number;
    max: number;
}
/**
 * Creates mouse wheel zoom handler
 */
export declare function createWheelZoomHandler(element: HTMLElement, getZoom: () => number, setZoom: (zoom: number) => void, config: ZoomConfig, callbacks?: ZoomCallbacks, requireCtrl?: boolean): () => void;
/**
 * Creates pinch-to-zoom handler for touch devices
 */
export declare function createPinchZoomHandler(element: HTMLElement, getZoom: () => number, setZoom: (zoom: number) => void, config: ZoomConfig, callbacks?: ZoomCallbacks): () => void;
//# sourceMappingURL=zoom.d.ts.map