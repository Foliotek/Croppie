# Croppie - A Javascript Image Cropper


## To Install
You can use bower:
`bower install croppie`

Npm:
`npm install croppie`

Or you can download the files manually:
`croppie.js` & `croppie.css`

## Adding it to your site
```
<link rel="stylesheet" href="croppie.css" />
<script src="croppie.js"></script>
```

## The API
TODO: Document API in README


## Developing on Croppie
**Minifying**

`uglifyjs croppie.js -c -m -r '$,require,exports' -o croppie.min.js`

**Running a static site**

I like to use `npm install node-static -g` and run `static` in the directory.
