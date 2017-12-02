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

## CDN
cdnjs.com provides croppie via cdn https://cdnjs.com/libraries/croppie
```
https://cdnjs.cloudflare.com/ajax/libs/croppie/{version}/croppie.min.css
https://cdnjs.cloudflare.com/ajax/libs/croppie/{version}/croppie.min.js
```


## Documentation
[Documentation](http://foliotek.github.io/Croppie#documentation)

## Related Libraries
* https://github.com/wem/croppie-dart
* https://github.com/allenRoyston/ngCroppie
* https://github.com/lpsBetty/angular-croppie
* https://github.com/dima-kov/django-croppie
* https://github.com/jofftiquez/vue-croppie

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
8. Deploy to gh-pages `npm run deploy`
