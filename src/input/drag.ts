import type { TransformState } from '../types.ts'

export interface DragCallbacks {
  onStart?: (state: TransformState) => void
  onMove?: (state: TransformState) => void
  onEnd?: (state: TransformState) => void
}

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  startTransformX: number
  startTransformY: number
}

/**
 * Creates drag handlers for an element
 */
export function createDragHandler(
  element: HTMLElement,
  getTransform: () => TransformState,
  setTransform: (x: number, y: number) => void,
  callbacks?: DragCallbacks,
): () => void {
  const state: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    startTransformX: 0,
    startTransformY: 0,
  }

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return // Only left click

    state.isDragging = true
    state.startX = e.clientX
    state.startY = e.clientY

    const transform = getTransform()
    state.startTransformX = transform.x
    state.startTransformY = transform.y

    element.setPointerCapture(e.pointerId)
    element.style.cursor = 'grabbing'

    callbacks?.onStart?.(transform)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!state.isDragging) return

    const deltaX = e.clientX - state.startX
    const deltaY = e.clientY - state.startY

    const newX = state.startTransformX + deltaX
    const newY = state.startTransformY + deltaY

    setTransform(newX, newY)

    const transform = getTransform()
    callbacks?.onMove?.(transform)
  }

  const handlePointerUp = (e: PointerEvent) => {
    if (!state.isDragging) return

    state.isDragging = false
    element.releasePointerCapture(e.pointerId)
    element.style.cursor = 'grab'

    const transform = getTransform()
    callbacks?.onEnd?.(transform)
  }

  // Attach listeners
  element.addEventListener('pointerdown', handlePointerDown)
  element.addEventListener('pointermove', handlePointerMove)
  element.addEventListener('pointerup', handlePointerUp)
  element.addEventListener('pointercancel', handlePointerUp)

  element.style.cursor = 'grab'
  element.style.touchAction = 'none' // Prevent browser handling

  // Return cleanup function
  return () => {
    element.removeEventListener('pointerdown', handlePointerDown)
    element.removeEventListener('pointermove', handlePointerMove)
    element.removeEventListener('pointerup', handlePointerUp)
    element.removeEventListener('pointercancel', handlePointerUp)
  }
}
