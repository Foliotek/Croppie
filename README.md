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

## Documentation
Documentation can be found [here](http://foliotek.github.io/Croppie#documentation)


## Developing on Croppie
**Minifying**

`uglifyjs croppie.js -c -m -r '$,require,exports' -o croppie.min.js`

**Running a static site**

I like to use `npm install node-static -g` and run `static` in the directory.
