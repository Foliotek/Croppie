import type { CropPoints, PointsArray } from '../types'

// Re-export for convenience
export type { PointsArray }

/**
 * Input type that accepts either format
 */
export type PointsInput = CropPoints | PointsArray

/**
 * Normalizes points input to object format
 */
export function normalizePoints(points: PointsInput | undefined): CropPoints | undefined {
  if (points === undefined) {
    return undefined
  }

  if (Array.isArray(points)) {
    if (points.length !== 4) {
      throw new Error(
        'PointsArray must have exactly 4 elements: [topLeftX, topLeftY, bottomRightX, bottomRightY]',
      )
    }
    return {
      topLeftX: points[0],
      topLeftY: points[1],
      bottomRightX: points[2],
      bottomRightY: points[3],
    }
  }

  return points
}

/**
 * Converts object points to array format (for v2.6 compatibility if needed)
 */
export function pointsToArray(points: CropPoints): PointsArray {
  return [points.topLeftX, points.topLeftY, points.bottomRightX, points.bottomRightY]
}
