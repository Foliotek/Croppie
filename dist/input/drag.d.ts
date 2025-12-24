import type { TransformState } from '../types.ts';
export interface DragCallbacks {
    onStart?: (state: TransformState) => void;
    onMove?: (state: TransformState) => void;
    onEnd?: (state: TransformState) => void;
}
/**
 * Creates drag handlers for an element
 */
export declare function createDragHandler(element: HTMLElement, getTransform: () => TransformState, setTransform: (x: number, y: number) => void, callbacks?: DragCallbacks): () => void;
//# sourceMappingURL=drag.d.ts.map