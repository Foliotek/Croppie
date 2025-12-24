import { describe, expect, test } from 'bun:test'
import { clamp } from '../../src/utils/clamp.ts'
import { debounce } from '../../src/utils/debounce.ts'
import { aspectRatio, calculateInitialZoom } from '../../src/utils/image.ts'

describe('clamp', () => {
  test('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  test('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  test('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  test('handles equal min and max', () => {
    expect(clamp(5, 5, 5)).toBe(5)
  })
})

describe('debounce', () => {
  test('delays function execution', async () => {
    let callCount = 0
    const fn = debounce(() => callCount++, 50)

    fn()
    fn()
    fn()

    expect(callCount).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(callCount).toBe(1)
  })
})

describe('aspectRatio', () => {
  test('calculates correct ratio for landscape', () => {
    expect(aspectRatio(1920, 1080)).toBeCloseTo(1.778, 2)
  })

  test('calculates correct ratio for portrait', () => {
    expect(aspectRatio(1080, 1920)).toBeCloseTo(0.5625, 4)
  })

  test('calculates correct ratio for square', () => {
    expect(aspectRatio(100, 100)).toBe(1)
  })
})

describe('calculateInitialZoom', () => {
  test('returns correct zoom for image smaller than viewport', () => {
    // 100x100 image, 200x200 viewport
    // Should zoom to 2x to fill viewport
    const zoom = calculateInitialZoom(100, 100, 200, 200)
    expect(zoom).toBe(2)
  })

  test('returns correct zoom for image larger than viewport', () => {
    // 400x400 image, 200x200 viewport
    // Should zoom to 0.5x to fill viewport
    const zoom = calculateInitialZoom(400, 400, 200, 200)
    expect(zoom).toBe(0.5)
  })

  test('uses larger ratio for non-square image', () => {
    // 200x100 image (landscape), 100x100 viewport
    // Width ratio: 100/200 = 0.5
    // Height ratio: 100/100 = 1.0
    // Should use 1.0 (larger) to ensure viewport is filled
    const zoom = calculateInitialZoom(200, 100, 100, 100)
    expect(zoom).toBe(1)
  })
})
