/**
 * Creates a debounced version of a function
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void;
//# sourceMappingURL=debounce.d.ts.map