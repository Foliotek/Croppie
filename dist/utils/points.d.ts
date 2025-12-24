import type { CropPoints, PointsArray } from '../types';
export type { PointsArray };
/**
 * Input type that accepts either format
 */
export type PointsInput = CropPoints | PointsArray;
/**
 * Normalizes points input to object format
 */
export declare function normalizePoints(points: PointsInput | undefined): CropPoints | undefined;
/**
 * Converts object points to array format (for v2.6 compatibility if needed)
 */
export declare function pointsToArray(points: CropPoints): PointsArray;
//# sourceMappingURL=points.d.ts.map