var assert, Croppie;

assert = require('assert');

require('./stubs/window');
Croppie = require('../../croppie');

describe('Croppie', function () {
	var testCroppieObject, stubElement;

	beforeEach(function () {
		stubElement = new HTMLElement();
		testCroppieObject = new Croppie(stubElement);
	});

	describe('constructor', function () {
		it('should expose a reference to its bound element.', function () {
			assert.strictEqual(testCroppieObject.element, stubElement);
		});

		it('should use croppy defaults if no options are provided.', function () {
			function matchDefaults(actualOptionGroup, expectedOptionGroup, path) {
				path = path || 'options';

				Object
					.keys(expectedOptionGroup)
					.forEach(function (optionName) {
						var currentPath;

						currentPath = [
							path,
							optionName
						].join('.');

						if (typeof expectedOptionGroup[optionName] === 'object') {
							matchDefaults(actualOptionGroup[optionName], expectedOptionGroup[optionName], currentPath);
						} else {
							assert.equal(actualOptionGroup[optionName], expectedOptionGroup[optionName], 'Matching ' + currentPath);
						}
					});
			}

			matchDefaults(testCroppieObject.options, Croppie.defaults);
		});

	});

});
