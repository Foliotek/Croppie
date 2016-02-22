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
[Documentation](http://foliotek.github.io/Croppie#documentation)


## Contributing
#### Static Server
`live-server`

#### Minifying
`uglifyjs croppie.js -c -m -r '$,require,exports' -o croppie.min.js`

#### Releasing a new version
1. Bump version in croppie.js
2. Minify/Uglify
3. Commit
4. npm version [new version]
5. `git push && git push --tags`
6. `npm publish`
7. Draft a new release with new tag on https://github.com/Foliotek/Croppie/releases