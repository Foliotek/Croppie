# Croppie - A Javascript Image Cropper


## To Install
Bower: `bower install croppie`

Npm: `npm install croppie`

Download:
[croppie.js](croppie.js) & [croppie.css](croppie.css)

## Adding croppie to your site
```
<link rel="stylesheet" href="croppie.css" />
<script src="croppie.js"></script>
```

## The API
### Options

**boundary** `{ width: px, height: px }`
The outer container of the cropper

**customClass** *string*

A class of your choosing to add to the container to add custom styles to your croppie


**mouseWheelZoom** *Boolean (default true)*

Enable or disable the ability to use the mouse wheel to zoom in and out on a croppie instance

**showZoom** *Boolean (default true)*

Hide or Show the zoom slider

**viewport** `{ width: px, height: px, type: 'circle|square' }`

The inner container of the coppie.  The visible part of the image


### Methods

**get()** *returns [object]*

Get the crop points, and the zoom of the image.

**bind({ url: 'path/to/image.jpg', points: [x1, y1, x2, y2] })** *returns Promise*

Bind an image the croppie.  Returns a promise to be resolved when the image has been loaded and the croppie has been initialized.

**result({ type: 'canvas|html', size: 'viewport|originall' })** *returns Promise*
Get the resulting crop of the image.
* `type: 'canvas'` returns a base64 encoded image string.
* `type: 'html'` returns html with the positioned correctly and overflow hidden.
* `size: 'viewport'` returns the cropped image sized the same as the viewport.
* `size: 'original'`  returns the cropped image at the image's original dimensions.
* `format: 'jpg|png|webp'` indicating the image format. Default is `jpg`.
* `quality: '1'` number between 0 and 1 indicating image quality. Default is `1`.
* * size, format and quality are only applicable on canvas results.
* * quality is only applicable with formats `jpg` and `webp`.

**refresh()** *void*

Used to notify croppie of a change in visibility of the croppie element.  Since croppie relies on positioning of elements, it depends on the element being visible when bound.  This method provides the ability update these positions after the element is shown.

**destroy()** *void*
Destroy a croppie instance and remove it from the DOM

### Events
**update(Croppie)**

Fired when a drag or zoom occurs


## Developing on Croppie
**Minifying**

`uglifyjs croppie.js -c -m -r '$,require,exports' -o croppie.min.js`

**Running a static site**

I like to use `npm install node-static -g` and run `static` in the directory.
