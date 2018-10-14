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
* https://gitlab.com/michel.werren/croppie-dart
* https://github.com/allenRoyston/ngCroppie
* https://github.com/lpsBetty/angular-croppie
* https://github.com/dima-kov/django-croppie
* https://github.com/jofftiquez/vue-croppie

## Contributing
First, thanks for contributing.  This project is difficult to maintain with one person.  Here's a "checklist" of things to remember when contributing to croppie.
* Don't forget to update the documentation.
* If you're adding a new option/event/method, try adding to an example on the documentation.  Or create a new example, if you feel the need.
* We don't have tests for Croppie :( (if you want to create tests I'd be forever grateful), so please try to test the functionality you're changing on the demo page.  I've tried to add as many use-cases as I can think of on there.  Compare the functionality in your branch to the one on the official page.  If they all still work, then great!

If you're looking for a simple server to load the demo page, I use https://github.com/tapio/live-server.

#### Minifying
`uglifyjs croppie.js -c -m -r '$,require,exports' -o croppie.min.js`

#### Releasing a new version
For the most part, you shouldn't worry about these steps unless you're the one handling the release.  Please don't bump the release and don't minify/uglify in a PR.  That just creates merge conflicts when merging.  Those steps will be performed when the release is created.
1. Bump version in croppie.js
2. Minify/Uglify
3. Commit
4. npm version [new version]
5. `git push && git push --tags`
6. `npm publish`
7. Draft a new release with new tag on https://github.com/Foliotek/Croppie/releases
8. Deploy to gh-pages `npm run deploy`
