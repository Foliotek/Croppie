import { describe, test, expect } from 'bun:test'
import { normalizePoints, pointsToArray } from '../../src/utils/points'

describe('normalizePoints', () => {
  test('converts array format to object', () => {
    const result = normalizePoints([10, 20, 110, 120])
    expect(result).toEqual({
      topLeftX: 10,
      topLeftY: 20,
      bottomRightX: 110,
      bottomRightY: 120
    })
  })

  test('passes through object format unchanged', () => {
    const input = { topLeftX: 10, topLeftY: 20, bottomRightX: 110, bottomRightY: 120 }
    const result = normalizePoints(input)
    expect(result).toEqual(input)
  })

  test('returns undefined for undefined input', () => {
    expect(normalizePoints(undefined)).toBeUndefined()
  })

  test('throws error for array with wrong length', () => {
    expect(() => normalizePoints([10, 20, 110] as any)).toThrow(
      'PointsArray must have exactly 4 elements',
    )
    expect(() => normalizePoints([10, 20] as any)).toThrow(
      'PointsArray must have exactly 4 elements',
    )
    expect(() => normalizePoints([] as any)).toThrow(
      'PointsArray must have exactly 4 elements',
    )
  })
})

describe('pointsToArray', () => {
  test('converts object to array format', () => {
    const result = pointsToArray({
      topLeftX: 10,
      topLeftY: 20,
      bottomRightX: 110,
      bottomRightY: 120
    })
    expect(result).toEqual([10, 20, 110, 120])
  })
})
