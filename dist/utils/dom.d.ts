/**
 * Creates an HTML element with optional attributes and classes
 */
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {
    className?: string;
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
}): HTMLElementTagNameMap[K];
/**
 * Gets the computed CSS transform matrix values
 */
export declare function getTransformValues(element: HTMLElement): {
    x: number;
    y: number;
    scale: number;
};
/**
 * Applies transform to an element
 */
export declare function setTransform(element: HTMLElement, x: number, y: number, scale: number): void;
//# sourceMappingURL=dom.d.ts.map