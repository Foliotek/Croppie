import { GlobalWindow } from 'happy-dom'

const window = new GlobalWindow()

// Register globals
Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  HTMLDivElement: window.HTMLDivElement,
  HTMLImageElement: window.HTMLImageElement,
  HTMLInputElement: window.HTMLInputElement,
  Element: window.Element,
  Node: window.Node,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.PointerEvent,
  TouchEvent: window.TouchEvent,
  WheelEvent: window.WheelEvent,
})
