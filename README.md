# @bayinformatics/croppie

A modern, TypeScript-first image cropper. Fork of [Foliotek/Croppie](https://github.com/Foliotek/Croppie).

## Why This Fork?

The original Croppie hasn't been updated since 2019 and has 270+ open issues. This fork modernizes the codebase with:

- 🦕 **ES Modules** - Native ESM, no more IIFE/UMD wrappers
- 📘 **TypeScript** - Full type definitions included
- 🔧 **Modern APIs** - Pointer Events, no polyfills needed
- 🪶 **Smaller Bundle** - Tree-shakeable, ~15KB gzipped (target)
- 📱 **Mobile First** - Touch and gesture support built-in
- 🧪 **Tested** - Unit and visual regression tests

## Installation

```bash
# npm
npm install @bayinformatics/croppie

# pnpm
pnpm add @bayinformatics/croppie

# bun
bun add @bayinformatics/croppie
```

## Quick Start

```typescript
import Croppie from '@bayinformatics/croppie'
import '@bayinformatics/croppie/style.css'

const cropper = new Croppie(document.getElementById('cropper')!, {
  viewport: { width: 200, height: 200, type: 'circle' }
})

// Load an image
await cropper.bind({ url: 'photo.jpg' })

// Get the cropped result
const blob = await cropper.result({ type: 'blob' })
```

## API

### Constructor

```typescript
new Croppie(element: HTMLElement, options: CroppieOptions)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `viewport` | `{ width, height, type }` | Required | Crop area dimensions and shape (`'circle'` or `'square'`) |
| `boundary` | `{ width, height }` | viewport + 100px | Container dimensions |
| `showZoomer` | `boolean` | `true` | Show zoom slider |
| `mouseWheelZoom` | `boolean \| 'ctrl'` | `true` | Enable scroll zoom (optionally require Ctrl key) |
| `zoom` | `{ min, max }` | `{ min: 0.1, max: 10 }` | Zoom limits |

### Methods

#### `bind(options: BindOptions | string): Promise<void>`

Load an image into the cropper.

```typescript
// Simple URL
await cropper.bind('photo.jpg')

// With options
await cropper.bind({
  url: 'photo.jpg',
  zoom: 1.5,
  points: { topLeftX: 0, topLeftY: 0, bottomRightX: 200, bottomRightY: 200 }
})
```

#### `bindFile(file: File | Blob): Promise<void>`

Load an image from a File input.

```typescript
const input = document.querySelector('input[type="file"]')
input.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  await cropper.bindFile(file)
})
```

#### `result(options: ResultOptions): Promise<Blob | string | HTMLCanvasElement>`

Get the cropped result.

```typescript
// Get as Blob (for uploading)
const blob = await cropper.result({ type: 'blob', format: 'png' })

// Get as base64 (for preview)
const base64 = await cropper.result({ type: 'base64', format: 'jpeg', quality: 0.9 })

// Get as Canvas (for further manipulation)
const canvas = await cropper.result({ type: 'canvas' })

// Custom output size
const blob = await cropper.result({
  type: 'blob',
  size: { width: 400, height: 400 }
})
```

#### `get(): CroppieData`

Get current crop data (points and zoom).

#### `setZoom(value: number): void`

Set the zoom level programmatically.

#### `reset(): void`

Reset to initial state.

#### `destroy(): void`

Clean up and remove the cropper.

### Events

```typescript
cropper.on('update', (data) => {
  console.log('Crop changed:', data.points, data.zoom)
})

cropper.on('zoom', ({ zoom, previousZoom }) => {
  console.log(`Zoom: ${previousZoom} → ${zoom}`)
})
```

## Migrating from Croppie v2

Most of the API is compatible, with a few changes:

```diff
- import Croppie from 'croppie'
+ import Croppie from '@bayinformatics/croppie'

- import 'croppie/croppie.css'
+ import '@bayinformatics/croppie/style.css'

// result() now returns a Promise for all types
- cropper.result({ type: 'canvas' }).then(canvas => {})
+ const canvas = await cropper.result({ type: 'canvas' })

// Points format changed
- points: [x1, y1, x2, y2]
+ points: { topLeftX, topLeftY, bottomRightX, bottomRightY }
```

## Framework Examples

### Stimulus (Hotwire)

```typescript
import { Controller } from '@hotwired/stimulus'
import Croppie from '@bayinformatics/croppie'

export default class extends Controller {
  static targets = ['input', 'preview']

  croppie?: Croppie

  connect() {
    this.croppie = new Croppie(this.previewTarget, {
      viewport: { width: 200, height: 200, type: 'circle' }
    })
  }

  async selectFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) await this.croppie?.bindFile(file)
  }

  async crop() {
    return this.croppie?.result({ type: 'blob' })
  }

  disconnect() {
    this.croppie?.destroy()
  }
}
```

### React

```tsx
import { useRef, useEffect } from 'react'
import Croppie from '@bayinformatics/croppie'

function ImageCropper({ src, onCrop }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const croppieRef = useRef<Croppie>()

  useEffect(() => {
    if (containerRef.current) {
      croppieRef.current = new Croppie(containerRef.current, {
        viewport: { width: 200, height: 200, type: 'circle' }
      })
      croppieRef.current.bind(src)
    }
    return () => croppieRef.current?.destroy()
  }, [src])

  const handleCrop = async () => {
    const blob = await croppieRef.current?.result({ type: 'blob' })
    onCrop(blob)
  }

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={handleCrop}>Crop</button>
    </div>
  )
}
```

## Development

```bash
# Install dependencies
bun install

# Run dev server with watch
bun run dev

# Run tests
bun test

# Build for production
bun run build

# Lint
bun run lint
```

## License

MIT - See [LICENSE](./LICENSE)

Original work Copyright (c) 2015 Foliotek Inc.
Modified work Copyright (c) 2025 Bay Informatics

## Credits

This project is a fork of [Croppie](https://github.com/Foliotek/Croppie) by Foliotek. Thanks to the original authors for their work!
