(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.Croppie = factory());
}(this, function () { 'use strict';

	/*
	 * OBJECT ASSIGN DEEP
	 * Allows deep cloning of plain objects that contain primitives, nested plain objects, or nested plain arrays.
	 */

	/*
	 * A unified way of returning a string that describes the type of the given variable.
	 */
	function getTypeOf (input) {

		if (input === null) {
			return 'null';
		}

		else if (typeof input === 'undefined') {
			return 'undefined';
		}

		else if (typeof input === 'object') {
			return (Array.isArray(input) ? 'array' : 'object');
		}

		return typeof input;

	}

	/*
	 * Branching logic which calls the correct function to clone the given value base on its type.
	 */
	function cloneValue (value) {

		// The value is an object so lets clone it.
		if (getTypeOf(value) === 'object') {
			return quickCloneObject(value);
		}

		// The value is an array so lets clone it.
		else if (getTypeOf(value) === 'array') {
			return quickCloneArray(value);
		}

		// Any other value can just be copied.
		return value;

	}

	/*
	 * Enumerates the given array and returns a new array, with each of its values cloned (i.e. references broken).
	 */
	function quickCloneArray (input) {
		return input.map(cloneValue);
	}

	/*
	 * Enumerates the properties of the given object (ignoring the prototype chain) and returns a new object, with each of
	 * its values cloned (i.e. references broken).
	 */
	function quickCloneObject (input) {

		const output = {};

		for (const key in input) {
			if (!input.hasOwnProperty(key)) { continue; }

			output[key] = cloneValue(input[key]);
		}

		return output;

	}

	/*
	 * Does the actual deep merging.
	 */
	function executeDeepMerge (target, _objects = [], _options = {}) {

		const options = {
			arrayBehaviour: _options.arrayBehaviour || 'replace',  // Can be "merge" or "replace".
		};

		// Ensure we have actual objects for each.
		const objects = _objects.map(object => object || {});
		const output = target || {};

		// Enumerate the objects and their keys.
		for (let oindex = 0; oindex < objects.length; oindex++) {
			const object = objects[oindex];
			const keys = Object.keys(object);

			for (let kindex = 0; kindex < keys.length; kindex++) {
				const key = keys[kindex];
				const value = object[key];
				const type = getTypeOf(value);
				const existingValueType = getTypeOf(output[key]);

				if (type === 'object') {
					if (existingValueType !== 'undefined') {
						const existingValue = (existingValueType === 'object' ? output[key] : {});
						output[key] = executeDeepMerge({}, [existingValue, quickCloneObject(value)], options);
					}
					else {
						output[key] = quickCloneObject(value);
					}
				}

				else if (type === 'array') {
					if (existingValueType === 'array') {
						const newValue = quickCloneArray(value);
						output[key] = (options.arrayBehaviour === 'merge' ? output[key].concat(newValue) : newValue);
					}
					else {
						output[key] = quickCloneArray(value);
					}
				}

				else {
					output[key] = value;
				}

			}
		}

		return output;

	}

	/*
	 * Merge all the supplied objects into the target object, breaking all references, including those of nested objects
	 * and arrays, and even objects nested inside arrays. The first parameter is not mutated unlike Object.assign().
	 * Properties in later objects will always overwrite.
	 */
	var objectAssignDeep = function objectAssignDeep (target, ...objects) {
		return executeDeepMerge(target, objects);
	};

	/*
	 * Same as objectAssignDeep() except it doesn't mutate the target object and returns an entirely new object.
	 */
	var noMutate = function objectAssignDeepInto (...objects) {
		return executeDeepMerge({}, objects);
	};

	/*
	 * Allows an options object to be passed in to customise the behaviour of the function.
	 */
	var withOptions = function objectAssignDeepInto (target, objects, options) {
		return executeDeepMerge(target, objects, options);
	};
	objectAssignDeep.noMutate = noMutate;
	objectAssignDeep.withOptions = withOptions;

	var DEFAULTS = {
	  viewport: {
	    width: 100,
	    height: 100,
	    type: 'square'
	  },
	  boundary: {},
	  orientationControls: {
	    enabled: true,
	    leftClass: '',
	    rightClass: ''
	  },
	  resizeControls: {
	    width: true,
	    height: true
	  },
	  customClass: '',
	  showZoomer: true,
	  enableZoom: true,
	  enableResize: false,
	  mouseWheelZoom: true,
	  enableExif: false,
	  enforceBoundary: true,
	  enableOrientation: false,
	  enableKeyMovement: true,
	  update: function () { }
	};

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {string} className
	 */
	const addClass$1 = (element, classNames) => {
	    classNames = Array.isArray(classNames) ? classNames : [classNames];
	    if (element.classList) {
	        element.classList.add(...classNames);
	    }
	    else {
	        element.className += ' ' + classNames.join(' ');
	    }
	};

	/**
	 *
	 * @param {HTMLElement} el
	 * @param {(Object|string)} styles
	 * @param {string} val
	 */
	const css$1 = (el, styles, val) => {
	    //http://jsperf.com/vanilla-css
	    if (typeof (styles) === 'string') {
	        var tmp = styles;
	        styles = {};
	        styles[tmp] = val;
	    }
	    for (var prop in styles) {
	        el.style[prop] = styles[prop];
	    }
	};

	/**
	 *
	 * @param {HTMLImageElement} img
	 * @param {number} orientation
	 */
	const naturalImageDimensions = (img, orientation) => {
	    let w = img.naturalWidth;
	    let h = img.naturalHeight;
	    let orient = orientation || getExifOrientation(img);
	    if (orient && orient >= 5) {
	        let x = w;
	        w = h;
	        h = x;
	    }
	    return { width: w, height: h };
	};

	/**
	 *
	 * @param {HTMLImageElement} img
	 */
	const getExifOrientation = (img) => {
	    return img.exifdata && img.exifdata.Orientation ? num(img.exifdata.Orientation) : 1;
	};

	const EXIF_NORM = [1, 8, 3, 6];
	const EXIF_FLIP = [2, 7, 4, 5];
	const getExifOffset = (orientation, degrees) => {
	    var arr = EXIF_NORM.indexOf(orientation) > -1 ? EXIF_NORM : EXIF_FLIP,
	        index = arr.indexOf(orientation),
	        offset = (degrees / 90) % arr.length;// 180 = 2%4 = 2 shift exif by 2 indexes

	    return arr[(arr.length + index + (offset % arr.length)) % arr.length];
	};

	/**
	 *
	 * @param {(number|string)} v
	 */
	const num = (v) => {
	    return parseInt(v, 10);
	};

	const loadImage = (src, doExif) => {
	    var img = new Image();
	    img.style.opacity = '0';
	    return new Promise(function (resolve, reject) {
	        function _resolve() {
	            img.style.opacity = '1';
	            setTimeout(function () {
	                resolve(img);
	            }, 1);
	        }

	        img.removeAttribute('crossOrigin');
	        if (src.match(/^https?:\/\/|^\/\//)) {
	            img.setAttribute('crossOrigin', 'anonymous');
	        }

	        img.onload = function () {
	            if (doExif) {
	                EXIF.getData(img, function () {
	                    _resolve();
	                });
	            }
	            else {
	                _resolve();
	            }
	        };
	        img.onerror = function (ev) {
	            img.style.opacity = 1;
	            setTimeout(function () {
	                reject(ev);
	            }, 1);
	        };
	        img.src = src;
	    });
	};

	const fix = (v, decimalPoints = 0) => {
	    return parseFloat(v).toFixed(decimalPoints);
	};

	const dispatchChange$1 = (element) => {
	    if ("createEvent" in document) {
	        var evt = document.createEvent("HTMLEvents");
	        evt.initEvent("change", false, true);
	        element.dispatchEvent(evt);
	    }
	    else {
	        element.fireEvent("onchange");
	    }
	};

	const template = (croppie) => {
	    const { options } = croppie;
	    const { boundary, viewport } = options;
	    const preview = croppie.useCanvas ? '<canvas class="cr-preview"></canvas>' : '<img class="cr-preview" />';
	    const zoomTemplate = `
<div class="cr-slider-wrap">
    <input class="cr-slider" type="range" aria-label="zoom" step="0.0001" />
</div>`;
	    return `
<div class="cr-boundary" aria-dropeffect="none"
  style="width: ${boundary.width}px; height: ${boundary.height}px;">
    ${preview}
    <div class="cr-viewport cr-vp-${viewport.type}" style="width: ${viewport.width}px; height: ${viewport.height}px;" tabindex="0"></div>
    <div class="cr-overlay""></div>
</div>
${options.enableZoom ? zoomTemplate : ''}
`;
	};

	const PREFIX = '.cr-';

	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 */
	const initialize = (croppie) => {
	    let { element, elements, options } = croppie;
	    var contClass = 'croppie-container',
	        customViewportClass = options.viewport.type ? 'cr-vp-' + options.viewport.type : null;

	    addClass$1(element, contClass, options.customClass);
	    element.innerHTML = template(croppie);

	    elements.boundary = element.querySelector(`${PREFIX}boundary`);
	    elements.viewport = element.querySelector(`${PREFIX}viewport`);
	    elements.overlay = element.querySelector(`${PREFIX}overlay`);
	    elements.preview = element.querySelector(`${PREFIX}preview`);
	    elements.img = croppie.useCanvas ? document.createElement('img') : elements.preview;
	    elements.canvas = !croppie.useCanvas ? document.createElement('canvas') : elements.preview;

	    // addClass(self.elements.preview, 'cr-image');
	    // setAttributes(self.elements.preview, { 'alt': 'preview', 'aria-grabbed': 'false' });

	    // _initDraggable.call(this);

	    // if (options.enableZoom) {
	    //     _initializeZoom.call(self);
	    // }

	    // if (options.enableOrientation) {
	    //     _initRotationControls.call(self);
	    // }

	    // if (options.enableResize) {
	    //     _initializeResize.call(self);
	    // }
	};

	/**
	 *
	 * @param {import("../Croppie")} croppie
	 */
	const hasExif = (croppie) => {
	    return croppie.options.enableExif && window.EXIF;
	};

	const TRANSFORM = 'transform';
	const TRANSFORM_ORIGIN = 'transform-origin';
	const TRANSLATE = 'translate';
	const USER_SELECT = 'user-select';

	class Transform {
	    constructor(x, y, scale) {
	        this.x = parseFloat(x);
	        this.y = parseFloat(y);
	        this.scale = parseFloat(scale);
	    }
	    toString() {
	        var suffix = '';
	        return TRANSLATE + '(' + this.x + 'px, ' + this.y + 'px' + suffix + ') scale(' + this.scale + ')';
	    }

	    static parse(v) {
	        if (v.style) {
	            return Transform.parse(v.style[TRANSFORM]);
	        }
	        else if (v.indexOf('matrix') > -1 || v.indexOf('none') > -1) {
	            return Transform.fromMatrix(v);
	        }
	        else {
	            return Transform.fromString(v);
	        }
	    }
	    static fromMatrix(v) {
	        var vals = v.substring(7).split(',');
	        if (!vals.length || v === 'none') {
	            vals = [1, 0, 0, 1, 0, 0];
	        }

	        return new Transform(num(vals[4]), num(vals[5]), parseFloat(vals[0]));
	    }
	    static fromString(v) {
	        var values = v.split(') '),
	            translate = values[0].substring(TRANSLATE.length + 1).split(','),
	            scale = values.length > 1 ? values[1].substring(6) : 1,
	            x = translate.length > 1 ? translate[0] : 0,
	            y = translate.length > 1 ? translate[1] : 0;

	        return new Transform(x, y, scale);
	    }
	}

	/**
	 *
	 * @param {Function} func
	 * @param {number} wait
	 * @param {boolean} immediate
	 */
	const debounce = (func, wait, immediate) => {
	    var timeout;
	    return function () {
	        var context = this, args = arguments;
	        var later = function () {
	            timeout = null;
	            if (!immediate) func.apply(context, args);
	        };
	        var callNow = immediate && !timeout;
	        clearTimeout(timeout);
	        timeout = setTimeout(later, wait);
	        if (callNow) func.apply(context, args);
	    };
	};
	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 */
	const updateOverlay = (croppie) => {
	    const { elements } = croppie;
	    if (!elements) return; // since this is debounced, it can be fired after destroy

	    const boundRect = elements.boundary.getBoundingClientRect(),
	        imgData = elements.preview.getBoundingClientRect();

	    css$1(elements.overlay, {
	        width: imgData.width + 'px',
	        height: imgData.height + 'px',
	        top: (imgData.top - boundRect.top) + 'px',
	        left: (imgData.left - boundRect.left) + 'px'
	    });
	};
	const debouncedOverlay = debounce(updateOverlay, 500);

	/**
	 *
	 * @param {import("../Croppie").default} croppie
	 */
	const draggable = (croppie) => {
	    let { elements, options } = croppie;
	    let { preview, boundary, zoomer, viewport, overlay } = elements;

	    let isDragging = false,
	        originalX,
	        originalY,
	        originalDistance,
	        vpRect,
	        transform;

	    function assignTransformCoordinates(deltaX, deltaY) {
	        var imgRect = preview.getBoundingClientRect(),
	            top = transform.y + deltaY,
	            left = transform.x + deltaX;

	        if (options.enforceBoundary) {
	            if (vpRect.top > imgRect.top + deltaY && vpRect.bottom < imgRect.bottom + deltaY) {
	                transform.y = top;
	            }

	            if (vpRect.left > imgRect.left + deltaX && vpRect.right < imgRect.right + deltaX) {
	                transform.x = left;
	            }
	        }
	        else {
	            transform.y = top;
	            transform.x = left;
	        }
	    }

	    function toggleGrabState(isDragging) {
	        preview.setAttribute('aria-grabbed', isDragging);
	        boundary.setAttribute('aria-dropeffect', isDragging ? 'move' : 'none');
	    }

	    function keyDown(ev) {
	        var LEFT_ARROW = 37,
	            UP_ARROW = 38,
	            RIGHT_ARROW = 39,
	            DOWN_ARROW = 40;

	        if (ev.shiftKey && (ev.keyCode === UP_ARROW || ev.keyCode === DOWN_ARROW)) {
	            var zoom;
	            if (ev.keyCode === UP_ARROW) {
	                zoom = parseFloat(zoomer.value) + parseFloat(zoomer.step);
	            }
	            else {
	                zoom = parseFloat(zoomer.value) - parseFloat(zoomer.step);
	            }
	            croppie.setZoom(zoom);
	        }
	        else if (options.enableKeyMovement && (ev.keyCode >= 37 && ev.keyCode <= 40)) {
	            ev.preventDefault();
	            var movement = parseKeyDown(ev.keyCode);

	            transform = Transform.parse(preview);
	            document.body.style[USER_SELECT] = 'none';
	            vpRect = viewport.getBoundingClientRect();
	            keyMove(movement);
	        }

	        function parseKeyDown(key) {
	            switch (key) {
	                case LEFT_ARROW:
	                    return [1, 0];
	                case UP_ARROW:
	                    return [0, 1];
	                case RIGHT_ARROW:
	                    return [-1, 0];
	                case DOWN_ARROW:
	                    return [0, -1];
	            }
	        }
	    }

	    function keyMove(movement) {
	        var deltaX = movement[0],
	            deltaY = movement[1],
	            newCss = {};

	        assignTransformCoordinates(deltaX, deltaY);

	        newCss[TRANSFORM] = transform.toString();
	        css$1(preview, newCss);
	        updateOverlay(croppie);
	        document.body.style[USER_SELECT] = '';
	        croppie_updateCenterPoint.call(self);
	        _triggerUpdate.call(self);
	        originalDistance = 0;
	    }

	    function mouseDown(ev) {
	        if (ev.button !== undefined && ev.button !== 0) return;

	        ev.preventDefault();
	        if (isDragging) return;
	        isDragging = true;
	        originalX = ev.pageX;
	        originalY = ev.pageY;

	        if (ev.touches) {
	            var touches = ev.touches[0];
	            originalX = touches.pageX;
	            originalY = touches.pageY;
	        }
	        toggleGrabState(isDragging);
	        transform = Transform.parse(preview);
	        window.addEventListener('mousemove', mouseMove);
	        window.addEventListener('touchmove', mouseMove);
	        window.addEventListener('mouseup', mouseUp);
	        window.addEventListener('touchend', mouseUp);
	        document.body.style[USER_SELECT] = 'none';
	        vpRect = viewport.getBoundingClientRect();
	    }

	    function mouseMove(ev) {
	        ev.preventDefault();
	        var pageX = ev.pageX,
	            pageY = ev.pageY;

	        if (ev.touches) {
	            var touches = ev.touches[0];
	            pageX = touches.pageX;
	            pageY = touches.pageY;
	        }

	        var deltaX = pageX - originalX,
	            deltaY = pageY - originalY,
	            newCss = {};

	        if (ev.type === 'touchmove') {
	            if (ev.touches.length > 1) {
	                var touch1 = ev.touches[0];
	                var touch2 = ev.touches[1];
	                var dist = Math.sqrt((touch1.pageX - touch2.pageX) * (touch1.pageX - touch2.pageX) + (touch1.pageY - touch2.pageY) * (touch1.pageY - touch2.pageY));

	                if (!originalDistance) {
	                    originalDistance = dist / croppie._currentZoom;
	                }

	                var scale = dist / originalDistance;

	                croppie.setZoomerVal(scale);
	                dispatchChange(zoomer);
	                return;
	            }
	        }

	        assignTransformCoordinates(deltaX, deltaY);

	        newCss[TRANSFORM] = transform.toString();
	        css$1(preview, newCss);
	        updateOverlay(croppie);
	        originalY = pageY;
	        originalX = pageX;
	    }

	    function mouseUp() {
	        isDragging = false;
	        toggleGrabState(isDragging);
	        window.removeEventListener('mousemove', mouseMove);
	        window.removeEventListener('touchmove', mouseMove);
	        window.removeEventListener('mouseup', mouseUp);
	        window.removeEventListener('touchend', mouseUp);
	        document.body.style[USER_SELECT] = '';
	        croppie.updateCenterPoint();
	        croppie.triggerUpdate();
	        originalDistance = 0;
	    }

	    overlay.addEventListener('mousedown', mouseDown);
	    viewport.addEventListener('keydown', keyDown);
	    overlay.addEventListener('touchstart', mouseDown);

	};

	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 */
	const boundaries = (croppie, viewportRect) => {
	    const { elements, _currentZoom } = croppie;
	    const scale = _currentZoom;
	    let vpWidth = viewportRect.width,
	        vpHeight = viewportRect.height,
	        centerFromBoundaryX = elements.boundary.clientWidth / 2,
	        centerFromBoundaryY = elements.boundary.clientHeight / 2,
	        imgRect = elements.preview.getBoundingClientRect(),
	        curImgWidth = imgRect.width,
	        curImgHeight = imgRect.height,
	        halfWidth = vpWidth / 2,
	        halfHeight = vpHeight / 2;

	    const maxX = ((halfWidth / scale) - centerFromBoundaryX) * -1;
	    const minX = maxX - ((curImgWidth * (1 / scale)) - (vpWidth * (1 / scale)));

	    const maxY = ((halfHeight / scale) - centerFromBoundaryY) * -1;
	    const minY = maxY - ((curImgHeight * (1 / scale)) - (vpHeight * (1 / scale)));

	    const originMinX = (1 / scale) * halfWidth;
	    const originMaxX = (curImgWidth * (1 / scale)) - originMinX;

	    const originMinY = (1 / scale) * halfHeight;
	    const originMaxY = (curImgHeight * (1 / scale)) - originMinY;

	    return {
	        translate: {
	            maxX: maxX,
	            minX: minX,
	            maxY: maxY,
	            minY: minY
	        },
	        origin: {
	            maxX: originMaxX,
	            minX: originMinX,
	            maxY: originMaxY,
	            minY: originMinY
	        }
	    };
	};

	class TransformOrigin {
	    constructor(el) {
	        if (!el || !el.style[TRANSFORM_ORIGIN]) {
	            this.x = 0;
	            this.y = 0;
	            return;
	        }
	        var css = el.style[TRANSFORM_ORIGIN].split(' ');
	        this.x = parseFloat(css[0]);
	        this.y = parseFloat(css[1]);
	    }
	    toString() {
	        return this.x + 'px ' + this.y + 'px';
	    }
	}

	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 */
	const zoomable = (croppie) => {
	    let { element, elements, options } = croppie;
	    elements.zoomer = element.querySelector('.cr-slider');
	    elements.zoomer.style.display = options.showZoomer ? '' : 'none';

	    croppie._currentZoom = 1;

	    function change() {
	        onZoom(croppie, {
	            value: parseFloat(elements.zoomer.value),
	            origin: new TransformOrigin(elements.preview),
	            viewportRect: elements.viewport.getBoundingClientRect(),
	            transform: Transform.parse(elements.preview)
	        });
	    }

	    function scroll(ev) {
	        var delta, targetZoom;

	        if (options.mouseWheelZoom === 'ctrl' && ev.ctrlKey !== true) {
	            return 0;
	        } else if (ev.wheelDelta) {
	            delta = ev.wheelDelta / 1200; //wheelDelta min: -120 max: 120 // max x 10 x 2
	        } else if (ev.deltaY) {
	            delta = ev.deltaY / 1060; //deltaY min: -53 max: 53 // max x 10 x 2
	        } else if (ev.detail) {
	            delta = ev.detail / -60; //delta min: -3 max: 3 // max x 10 x 2
	        } else {
	            delta = 0;
	        }

	        targetZoom = croppie._currentZoom + (delta * croppie._currentZoom);

	        ev.preventDefault();
	        croppie.setZoomerVal(targetZoom);
	        change();
	    }

	    elements.zoomer.addEventListener('input', change);// this is being fired twice on keypress
	    elements.zoomer.addEventListener('change', change);

	    if (options.mouseWheelZoom) {
	        elements.boundary.addEventListener('mousewheel', scroll);
	        elements.boundary.addEventListener('DOMMouseScroll', scroll);
	    }
	};
	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 * @param {*} ui
	 */
	const onZoom = (croppie, ui) => {
	    let { elements, options } = croppie;
	    let transform = ui ? ui.transform : Transform.parse(elements.preview),
	        vpRect = ui ? ui.viewportRect : elements.viewport.getBoundingClientRect(),
	        origin = ui ? ui.origin : new TransformOrigin(elements.preview);


	    function applyCss() {
	        var transCss = {};
	        transCss[TRANSFORM] = transform.toString();
	        transCss[TRANSFORM_ORIGIN] = origin.toString();
	        css$1(elements.preview, transCss);
	    }

	    croppie._currentZoom = ui ? ui.value : croppie._currentZoom;
	    transform.scale = croppie._currentZoom;
	    elements.zoomer.setAttribute('aria-valuenow', croppie._currentZoom);
	    applyCss();

	    if (options.enforceBoundary) {
	        var bounds = boundaries(croppie, vpRect),
	            transBoundaries = bounds.translate,
	            oBoundaries = bounds.origin;

	        if (transform.x >= transBoundaries.maxX) {
	            origin.x = oBoundaries.minX;
	            transform.x = transBoundaries.maxX;
	        }

	        if (transform.x <= transBoundaries.minX) {
	            origin.x = oBoundaries.maxX;
	            transform.x = transBoundaries.minX;
	        }

	        if (transform.y >= transBoundaries.maxY) {
	            origin.y = oBoundaries.minY;
	            transform.y = transBoundaries.maxY;
	        }

	        if (transform.y <= transBoundaries.minY) {
	            origin.y = oBoundaries.maxY;
	            transform.y = transBoundaries.minY;
	        }
	    }
	    applyCss();
	    debouncedOverlay(croppie);
	    croppie.triggerUpdate();
	};

	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 */
	const resizable = (croppie) => {
	    let { options, elements } = croppie;
	    var wrap = document.createElement('div');
	    var isDragging = false;
	    var direction;
	    var originalX;
	    var originalY;
	    var minSize = 50;
	    var maxWidth;
	    var maxHeight;
	    var vr;
	    var hr;

	    addClass$1(wrap, 'cr-resizer');
	    css$1(wrap, {
	        width: options.viewport.width + 'px',
	        height: options.viewport.height + 'px'
	    });

	    if (options.resizeControls.height) {
	        vr = document.createElement('div');
	        addClass$1(vr, 'cr-resizer-vertical');
	        wrap.appendChild(vr);
	    }

	    if (options.resizeControls.width) {
	        hr = document.createElement('div');
	        addClass$1(hr, 'cr-resizer-horisontal');
	        wrap.appendChild(hr);
	    }

	    function mouseDown(ev) {
	        if (ev.button !== undefined && ev.button !== 0) return;

	        ev.preventDefault();
	        if (isDragging) {
	            return;
	        }

	        var overlayRect = elements.overlay.getBoundingClientRect();

	        isDragging = true;
	        originalX = ev.pageX;
	        originalY = ev.pageY;
	        direction = ev.currentTarget.className.indexOf('vertical') !== -1 ? 'v' : 'h';
	        maxWidth = overlayRect.width;
	        maxHeight = overlayRect.height;

	        if (ev.touches) {
	            var touches = ev.touches[0];
	            originalX = touches.pageX;
	            originalY = touches.pageY;
	        }

	        window.addEventListener('mousemove', mouseMove);
	        window.addEventListener('touchmove', mouseMove);
	        window.addEventListener('mouseup', mouseUp);
	        window.addEventListener('touchend', mouseUp);
	        document.body.style[USER_SELECT] = 'none';
	    }

	    function mouseMove(ev) {
	        var pageX = ev.pageX;
	        var pageY = ev.pageY;

	        ev.preventDefault();

	        if (ev.touches) {
	            var touches = ev.touches[0];
	            pageX = touches.pageX;
	            pageY = touches.pageY;
	        }

	        var deltaX = pageX - originalX;
	        var deltaY = pageY - originalY;
	        var newHeight = options.viewport.height + deltaY;
	        var newWidth = options.viewport.width + deltaX;

	        if (direction === 'v' && newHeight >= minSize && newHeight <= maxHeight) {
	            css$1(wrap, {
	                height: newHeight + 'px'
	            });

	            options.boundary.height += deltaY;
	            css$1(elements.boundary, {
	                height: options.boundary.height + 'px'
	            });

	            options.viewport.height += deltaY;
	            css$1(elements.viewport, {
	                height: options.viewport.height + 'px'
	            });
	        }
	        else if (direction === 'h' && newWidth >= minSize && newWidth <= maxWidth) {
	            css$1(wrap, {
	                width: newWidth + 'px'
	            });

	            options.boundary.width += deltaX;
	            css$1(elements.boundary, {
	                width: options.boundary.width + 'px'
	            });

	            options.viewport.width += deltaX;
	            css$1(elements.viewport, {
	                width: options.viewport.width + 'px'
	            });
	        }

	        updateOverlay(croppie);
	        croppie.updateZoomLimits();
	        croppie.updateCenterPoint();
	        croppie.triggerUpdate();
	        originalY = pageY;
	        originalX = pageX;
	    }

	    function mouseUp() {
	        isDragging = false;
	        window.removeEventListener('mousemove', mouseMove);
	        window.removeEventListener('touchmove', mouseMove);
	        window.removeEventListener('mouseup', mouseUp);
	        window.removeEventListener('touchend', mouseUp);
	        document.body.style[USER_SELECT] = '';
	    }

	    if (vr) {
	        vr.addEventListener('mousedown', mouseDown);
	        vr.addEventListener('touchstart', mouseDown);
	    }

	    if (hr) {
	        hr.addEventListener('mousedown', mouseDown);
	        hr.addEventListener('touchstart', mouseDown);
	    }

	    elements.boundary.appendChild(wrap);
	};

	/**
	 *
	 * @param {HTMLCanvasElement} canvas
	 * @param {HTMLImageElement} img
	 * @param {number} orientation
	 */
	const drawCanvas = (canvas, img, orientation) => {
	    var width = img.width,
	        height = img.height,
	        ctx = canvas.getContext('2d');

	    canvas.width = img.width;
	    canvas.height = img.height;

	    ctx.save();
	    switch (orientation) {
	      case 2:
	         ctx.translate(width, 0);
	         ctx.scale(-1, 1);
	         break;

	      case 3:
	          ctx.translate(width, height);
	          ctx.rotate(180*Math.PI/180);
	          break;

	      case 4:
	          ctx.translate(0, height);
	          ctx.scale(1, -1);
	          break;

	      case 5:
	          canvas.width = height;
	          canvas.height = width;
	          ctx.rotate(90*Math.PI/180);
	          ctx.scale(1, -1);
	          break;

	      case 6:
	          canvas.width = height;
	          canvas.height = width;
	          ctx.rotate(90*Math.PI/180);
	          ctx.translate(0, -height);
	          break;

	      case 7:
	          canvas.width = height;
	          canvas.height = width;
	          ctx.rotate(-90*Math.PI/180);
	          ctx.translate(-width, height);
	          ctx.scale(1, -1);
	          break;

	      case 8:
	          canvas.width = height;
	          canvas.height = width;
	          ctx.translate(0, width);
	          ctx.rotate(-90*Math.PI/180);
	          break;
	    }
	    ctx.drawImage(img, 0,0, width, height);
	    ctx.restore();
	};

	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 * @param {number} customOrientation
	 */
	const transferImageToCanvas = (croppie, customOrientation) => {
	    const canvas = croppie.elements.canvas,
	        img = croppie.elements.img,
	        ctx = canvas.getContext('2d'),
	        orientation = croppie.options.enableOrientation && customOrientation || getExifOrientation(img);

	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    canvas.width = img.width;
	    canvas.height = img.height;
	    console.log('drawing canvas', canvas, img);
	    drawCanvas(canvas, img, orientation);
	};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var canvasToBlob = createCommonjsModule(function (module) {
	(function (window) {

	  var CanvasPrototype =
	    window.HTMLCanvasElement && window.HTMLCanvasElement.prototype;
	  var hasBlobConstructor =
	    window.Blob &&
	    (function () {
	      try {
	        return Boolean(new Blob())
	      } catch (e) {
	        return false
	      }
	    })();
	  var hasArrayBufferViewSupport =
	    hasBlobConstructor &&
	    window.Uint8Array &&
	    (function () {
	      try {
	        return new Blob([new Uint8Array(100)]).size === 100
	      } catch (e) {
	        return false
	      }
	    })();
	  var BlobBuilder =
	    window.BlobBuilder ||
	    window.WebKitBlobBuilder ||
	    window.MozBlobBuilder ||
	    window.MSBlobBuilder;
	  var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;
	  var dataURLtoBlob =
	    (hasBlobConstructor || BlobBuilder) &&
	    window.atob &&
	    window.ArrayBuffer &&
	    window.Uint8Array &&
	    function (dataURI) {
	      var matches,
	        mediaType,
	        isBase64,
	        dataString,
	        byteString,
	        arrayBuffer,
	        intArray,
	        i,
	        bb;
	      // Parse the dataURI components as per RFC 2397
	      matches = dataURI.match(dataURIPattern);
	      if (!matches) {
	        throw new Error('invalid data URI')
	      }
	      // Default to text/plain;charset=US-ASCII
	      mediaType = matches[2]
	        ? matches[1]
	        : 'text/plain' + (matches[3] || ';charset=US-ASCII');
	      isBase64 = !!matches[4];
	      dataString = dataURI.slice(matches[0].length);
	      if (isBase64) {
	        // Convert base64 to raw binary data held in a string:
	        byteString = atob(dataString);
	      } else {
	        // Convert base64/URLEncoded data component to raw binary:
	        byteString = decodeURIComponent(dataString);
	      }
	      // Write the bytes of the string to an ArrayBuffer:
	      arrayBuffer = new ArrayBuffer(byteString.length);
	      intArray = new Uint8Array(arrayBuffer);
	      for (i = 0; i < byteString.length; i += 1) {
	        intArray[i] = byteString.charCodeAt(i);
	      }
	      // Write the ArrayBuffer (or ArrayBufferView) to a blob:
	      if (hasBlobConstructor) {
	        return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
	          type: mediaType
	        })
	      }
	      bb = new BlobBuilder();
	      bb.append(arrayBuffer);
	      return bb.getBlob(mediaType)
	    };
	  if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
	    if (CanvasPrototype.mozGetAsFile) {
	      CanvasPrototype.toBlob = function (callback, type, quality) {
	        var self = this;
	        setTimeout(function () {
	          if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
	            callback(dataURLtoBlob(self.toDataURL(type, quality)));
	          } else {
	            callback(self.mozGetAsFile('blob', type));
	          }
	        });
	      };
	    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
	      CanvasPrototype.toBlob = function (callback, type, quality) {
	        var self = this;
	        setTimeout(function () {
	          callback(dataURLtoBlob(self.toDataURL(type, quality)));
	        });
	      };
	    }
	  }
	  if (module.exports) {
	    module.exports = dataURLtoBlob;
	  } else {
	    window.dataURLtoBlob = dataURLtoBlob;
	  }
	})(window);
	});

	const canvasResult = (croppie, resultParameters) => {
	    let points = resultParameters.points,
	        left = num(points[0]),
	        top = num(points[1]),
	        right = num(points[2]),
	        bottom = num(points[3]),
	        width = right - left,
	        height = bottom - top,
	        circle = resultParameters.circle,
	        canvas = document.createElement('canvas'),
	        ctx = canvas.getContext('2d'),
	        canvasWidth = resultParameters.outputWidth || width,
	        canvasHeight = resultParameters.outputHeight || height,
	        sx = left,
	        sy = top,
	        sWidth = width,
	        sHeight = height,
	        dx = 0,
	        dy = 0,
	        dWidth = canvasWidth,
	        dHeight = canvasHeight;

	    canvas.width = canvasWidth;
	    canvas.height = canvasHeight;

	    if (resultParameters.backgroundColor) {
	        ctx.fillStyle = resultParameters.backgroundColor;
	        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	    }

	    // By default assume we're going to draw the entire
	    // source image onto the destination canvas.


	    //
	    // Do not go outside of the original image's bounds along the x-axis.
	    // Handle translations when projecting onto the destination canvas.
	    //

	    // The smallest possible source x-position is 0.
	    if (left < 0) {
	        sx = 0;
	        dx = (Math.abs(left) / width) * canvasWidth;
	    }

	    // The largest possible source width is the original image's width.
	    if (sWidth + sx > croppie._originalImageWidth) {
	        sWidth = croppie._originalImageWidth - sx;
	        dWidth = (sWidth / width) * canvasWidth;
	    }

	    //
	    // Do not go outside of the original image's bounds along the y-axis.
	    //

	    // The smallest possible source y-position is 0.
	    if (top < 0) {
	        sy = 0;
	        dy = (Math.abs(top) / height) * canvasHeight;
	    }

	    // The largest possible source height is the original image's height.
	    if (sHeight + sy > croppie._originalImageHeight) {
	        sHeight = croppie._originalImageHeight - sy;
	        dHeight = (sHeight / height) * canvasHeight;
	    }

	    // console.table({ left, right, top, bottom, canvasWidth, canvasHeight, width, height, startX, startY, circle, sx, sy, dx, dy, sWidth, sHeight, dWidth, dHeight });

	    ctx.drawImage(croppie.elements.preview, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	    if (circle) {
	        ctx.fillStyle = '#fff';
	        ctx.globalCompositeOperation = 'destination-in';
	        ctx.beginPath();
	        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2, true);
	        ctx.closePath();
	        ctx.fill();
	    }
	    return canvas;
	};

	const htmlResult = (croppie, resultParameters) => {
	    var points = resultParameters.points,
	        div = document.createElement('div'),
	        img = document.createElement('img'),
	        width = points[2] - points[0],
	        height = points[3] - points[1];

	    addClass(div, 'croppie-result');
	    div.appendChild(img);
	    css(img, {
	        left: (-1 * points[0]) + 'px',
	        top: (-1 * points[1]) + 'px'
	    });
	    img.src = resultParameters.url;
	    css(div, {
	        width: width + 'px',
	        height: height + 'px'
	    });

	    return div;
	};

	const base64Result = (croppie, resultParameters) => {
	    return canvasResult(croppie, resultParameters).toDataURL(resultParameters.format, resultParameters.quality);
	};

	const blobResult = (croppie, resultParameters) => {
	    return new Promise(resolve => {
	        canvasResult(croppie, resultParameters).toBlob(blob => {
	            resolve(blob);
	        }, resultParameters.format, resultParameters.quality);
	    }).catch(console.error);
	};

	/**
	 *
	 * @param {import('../Croppie').default} croppie
	 * @param {Object} options
	 */
	const result = (croppie, resultType, resultOptions) => {
	    return new Promise(resolve => {
	        switch (resultType.toLowerCase()) {
	            case 'rawcanvas':
	                resolve(canvasResult(croppie, resultOptions));
	                break;
	            case 'canvas':
	            case 'base64':
	                resolve(base64Result(croppie, resultOptions));
	                break;
	            case 'blob':
	                blobResult(croppie, resultOptions).then(resolve);
	                break;
	            default:
	                resolve(htmlResult(croppie, resultOptions));
	                break;
	        }
	    }).catch(console.error);
	};

	class Croppie {
	    /**
	     *
	     * @param {HTMLElement} element
	     * @param {Object} options
	     */
	    constructor(element, options) {
	        if (element.className.indexOf('croppie-container') > -1) {
	            throw new Error("Croppie: Can't initialize croppie more than once");
	        }
	        this.element = element;
	        this.options = objectAssignDeep({}, DEFAULTS, options);
	        this.elements = {};
	        this.data = {};
	        this.useCanvas = this.options.enableOrientation || hasExif(croppie);

	        if (this.element.tagName.toLowerCase() === 'img') {
	            var origImage = this.element;
	            addClass(origImage, 'cr-original-image');
	            setAttributes(origImage, { 'aria-hidden': 'true', 'alt': '' });
	            var replacementDiv = document.createElement('div');
	            this.element.parentNode.appendChild(replacementDiv);
	            replacementDiv.appendChild(origImage);
	            this.element = replacementDiv;
	            this.options.url = this.options.url || origImage.src;
	        }

	        initialize(this);
	        draggable(this);

	        this.options.enableZoom && zoomable(this);
	        this.options.enableResize && resizable(this);

	        if (this.options.url) {
	            var bindOpts = {
	                url: this.options.url,
	                points: this.options.points
	            };
	            delete this.options['url'];
	            delete this.options['points'];
	            this.bind(bindOpts);
	        }
	    }
	    get() {
	        var self = this,
	            imgData = self.elements.preview.getBoundingClientRect(),
	            vpData = self.elements.viewport.getBoundingClientRect(),
	            x1 = vpData.left - imgData.left,
	            y1 = vpData.top - imgData.top,
	            widthDiff = (vpData.width - self.elements.viewport.offsetWidth) / 2, //border
	            heightDiff = (vpData.height - self.elements.viewport.offsetHeight) / 2,
	            x2 = x1 + self.elements.viewport.offsetWidth + widthDiff,
	            y2 = y1 + self.elements.viewport.offsetHeight + heightDiff,
	            scale = self._currentZoom;

	        if (scale === Infinity || isNaN(scale)) {
	            scale = 1;
	        }

	        var max = self.options.enforceBoundary ? 0 : Number.NEGATIVE_INFINITY;
	        x1 = Math.max(max, x1 / scale);
	        y1 = Math.max(max, y1 / scale);
	        x2 = Math.max(max, x2 / scale);
	        y2 = Math.max(max, y2 / scale);

	        return {
	            points: [fix(x1), fix(y1), fix(x2), fix(y2)],
	            zoom: scale,
	            orientation: self.data.orientation
	        };
	    }
	    triggerUpdate() {
	        var self = this,
	            data = self.get();

	        if (!this.isVisible()) {
	            return;
	        }

	        self.options.update.call(self, data);
	        if (self.$ && typeof Prototype === 'undefined') {
	            self.$(self.element).trigger('update.croppie', data);
	        }
	        else {
	            var ev;
	            if (window.CustomEvent) {
	                ev = new CustomEvent('update', { detail: data });
	            } else {
	                ev = document.createEvent('CustomEvent');
	                ev.initCustomEvent('update', true, true, data);
	            }

	            self.element.dispatchEvent(ev);
	        }
	    }
	    isVisible() {
	        return this.elements.preview.offsetHeight > 0 && this.elements.preview.offsetWidth > 0;
	    }
	    bind(data, callback) {
	        return new Promise(resolve => {
	            var url,
	                points = [],
	                zoom = null,
	                exifEnabled = hasExif(this);

	            if (typeof (data) === 'string') {
	                url = data;
	                data = {};
	            }
	            else if (Array.isArray(data)) {
	                points = data.slice();
	            }
	            else if (typeof (data) === 'undefined' && this.data.url) { //refreshing
	                this.updatePropertiesFromImage();
	                this.triggerUpdate();
	                return null;
	            }
	            else {
	                url = data.url;
	                points = data.points || [];
	                zoom = typeof (data.zoom) === 'undefined' ? null : data.zoom;
	            }

	            this.data.bound = false;
	            this.data.url = url || this.data.url;
	            this.data.boundZoom = zoom;
	            console.log(url);
	            return loadImage(url, exifEnabled).then((img) => {
	                console.log('in here', this.useCanvas);
	                if (this.elements.img.parentNode) {
	                    Array.prototype.forEach.call(this.elements.img.classList, function (c) { img.classList.add(c); });
	                    this.elements.img.parentNode.replaceChild(img, this.elements.img);
	                    this.elements.preview = img; // if the img is attached to the DOM, they're not using the canvas
	                }
	                this.elements.img = img;
	                if (!points.length) {
	                    var natDim = naturalImageDimensions(img);
	                    var rect = this.elements.viewport.getBoundingClientRect();
	                    var aspectRatio = rect.width / rect.height;
	                    var imgAspectRatio = natDim.width / natDim.height;
	                    var width, height;

	                    if (imgAspectRatio > aspectRatio) {
	                        height = natDim.height;
	                        width = height * aspectRatio;
	                    }
	                    else {
	                        width = natDim.width;
	                        height = natDim.height / aspectRatio;
	                    }

	                    var x0 = (natDim.width - width) / 2;
	                    var y0 = (natDim.height - height) / 2;
	                    var x1 = x0 + width;
	                    var y1 = y0 + height;
	                    this.data.points = [x0, y0, x1, y1];
	                }
	                else if (this.options.relative) {
	                    points = [
	                        points[0] * img.naturalWidth / 100,
	                        points[1] * img.naturalHeight / 100,
	                        points[2] * img.naturalWidth / 100,
	                        points[3] * img.naturalHeight / 100
	                    ];
	                }

	                this.data.points = points.map(function (p) {
	                    return parseFloat(p);
	                });
	                if (this.useCanvas) {
	                    transferImageToCanvas(this, data.orientation);
	                }
	                this.updatePropertiesFromImage();
	                this.triggerUpdate();
	                resolve();
	                callback && callback();
	            }).catch(console.error);
	        }).catch(console.error);
	    }
	    updateZoomLimits(initial) {
	        var self = this,
	            minZoom = Math.max(self.options.minZoom, 0) || 0,
	            maxZoom = self.options.maxZoom || 1.5,
	            initialZoom,
	            defaultInitialZoom,
	            zoomer = self.elements.zoomer,
	            scale = parseFloat(zoomer.value),
	            boundaryData = self.elements.boundary.getBoundingClientRect(),
	            imgData = naturalImageDimensions(self.elements.img, self.data.orientation),
	            vpData = self.elements.viewport.getBoundingClientRect(),
	            minW,
	            minH;
	        if (self.options.enforceBoundary) {
	            minW = vpData.width / imgData.width;
	            minH = vpData.height / imgData.height;
	            minZoom = Math.max(minW, minH);
	        }

	        if (minZoom >= maxZoom) {
	            maxZoom = minZoom + 1;
	        }

	        zoomer.min = fix(minZoom, 4);
	        zoomer.max = fix(maxZoom, 4);

	        if (!initial && (scale < zoomer.min || scale > zoomer.max)) {
	            this.setZoomerVal(scale < zoomer.min ? zoomer.min : zoomer.max);
	        }
	        else if (initial) {
	            defaultInitialZoom = Math.max((boundaryData.width / imgData.width), (boundaryData.height / imgData.height));
	            initialZoom = self.data.boundZoom !== null ? self.data.boundZoom : defaultInitialZoom;
	            this.setZoomerVal(initialZoom);
	        }

	        dispatchChange$1(zoomer);
	    }
	    updatePropertiesFromImage() {
	        var self = this,
	            initialZoom = 1,
	            cssReset = {},
	            img = self.elements.preview,
	            imgData,
	            transformReset = new Transform(0, 0, initialZoom),
	            originReset = new TransformOrigin(),
	            isVisible = this.isVisible();

	        if (!isVisible || self.data.bound) {// if the croppie isn't visible or it doesn't need binding
	            return;
	        }

	        self.data.bound = true;
	        cssReset[TRANSFORM] = transformReset.toString();
	        cssReset[TRANSFORM_ORIGIN] = originReset.toString();
	        cssReset['opacity'] = 1;
	        css$1(img, cssReset);

	        imgData = self.elements.preview.getBoundingClientRect();

	        self._originalImageWidth = imgData.width;
	        self._originalImageHeight = imgData.height;
	        self.data.orientation = getExifOrientation(self.elements.img);

	        if (self.options.enableZoom) {
	            this.updateZoomLimits(true);
	        }
	        else {
	            self._currentZoom = initialZoom;
	        }

	        transformReset.scale = self._currentZoom;
	        cssReset[TRANSFORM] = transformReset.toString();
	        css$1(img, cssReset);

	        if (self.data.points.length) {
	            this.bindPoints(self.data.points);
	        }
	        else {
	            this.centerImage();
	        }

	        this.updateCenterPoint();
	        updateOverlay(this);
	    }
	    updateCenterPoint(rotate) {
	        var self = this,
	            scale = self._currentZoom,
	            data = self.elements.preview.getBoundingClientRect(),
	            vpData = self.elements.viewport.getBoundingClientRect(),
	            transform = Transform.parse(self.elements.preview.style[TRANSFORM]),
	            pc = new TransformOrigin(self.elements.preview),
	            top = (vpData.top - data.top) + (vpData.height / 2),
	            left = (vpData.left - data.left) + (vpData.width / 2),
	            center = {},
	            adj = {};

	        if (rotate) {
	            var cx = pc.x;
	            var cy = pc.y;
	            var tx = transform.x;
	            var ty = transform.y;

	            center.y = cx;
	            center.x = cy;
	            transform.y = tx;
	            transform.x = ty;
	        }
	        else {
	            center.y = top / scale;
	            center.x = left / scale;

	            adj.y = (center.y - pc.y) * (1 - scale);
	            adj.x = (center.x - pc.x) * (1 - scale);

	            transform.x -= adj.x;
	            transform.y -= adj.y;
	        }

	        var newCss = {};
	        newCss[TRANSFORM_ORIGIN] = center.x + 'px ' + center.y + 'px';
	        newCss[TRANSFORM] = transform.toString();
	        css$1(self.elements.preview, newCss);
	    }
	    centerImage() {
	        var self = this,
	            imgDim = self.elements.preview.getBoundingClientRect(),
	            vpDim = self.elements.viewport.getBoundingClientRect(),
	            boundDim = self.elements.boundary.getBoundingClientRect(),
	            vpLeft = vpDim.left - boundDim.left,
	            vpTop = vpDim.top - boundDim.top,
	            w = vpLeft - ((imgDim.width - vpDim.width) / 2),
	            h = vpTop - ((imgDim.height - vpDim.height) / 2),
	            transform = new Transform(w, h, self._currentZoom);

	        css$1(self.elements.preview, TRANSFORM, transform.toString());
	    }
	    bindPoints(points) {
	        if (points.length !== 4) {
	            throw "Croppie - Invalid number of points supplied: " + points;
	        }
	        var self = this,
	            pointsWidth = points[2] - points[0],
	            // pointsHeight = points[3] - points[1],
	            vpData = self.elements.viewport.getBoundingClientRect(),
	            boundRect = self.elements.boundary.getBoundingClientRect(),
	            vpOffset = {
	                left: vpData.left - boundRect.left,
	                top: vpData.top - boundRect.top
	            },
	            scale = vpData.width / pointsWidth,
	            originTop = points[1],
	            originLeft = points[0],
	            transformTop = (-1 * points[1]) + vpOffset.top,
	            transformLeft = (-1 * points[0]) + vpOffset.left,
	            newCss = {};

	        newCss[TRANSFORM_ORIGIN] = originLeft + 'px ' + originTop + 'px';
	        newCss[TRANSFORM] = new Transform(transformLeft, transformTop, scale).toString();
	        css$1(self.elements.preview, newCss);

	        this.setZoomerVal(scale);
	        self._currentZoom = scale;
	    }
	    setZoomerVal(v) {
	        if (this.options.enableZoom) {
	            var z = this.elements.zoomer,
	                val = fix(v, 4);

	            z.value = Math.max(parseFloat(z.min), Math.min(parseFloat(z.max), val)).toString();
	        }
	    }
	    result(resultOptions) {
	        const RESULT_DEFAULTS = {
	            type: 'canvas',
	            format: 'png',
	            quality: 1
	        },
	        RESULT_FORMATS = ['jpeg', 'webp', 'png'];

	        var self = this,
	            data = this.get(),
	            opts = objectAssignDeep({}, RESULT_DEFAULTS, resultOptions),
	            resultType = (typeof (resultOptions) === 'string' ? resultOptions : (opts.type || 'base64')),
	            size = opts.size || 'viewport',
	            format = opts.format,
	            quality = opts.quality,
	            backgroundColor = opts.backgroundColor,
	            circle = typeof opts.circle === 'boolean' ? opts.circle : (self.options.viewport.type === 'circle'),
	            vpRect = this.elements.viewport.getBoundingClientRect(),
	            ratio = vpRect.width / vpRect.height;

	        if (size === 'viewport') {
	            data.outputWidth = vpRect.width;
	            data.outputHeight = vpRect.height;
	        } else if (typeof size === 'object') {
	            data.outputWidth = size.width || size.height * ratio;
	            data.outputHeight = size.height || size.width / ratio;
	        }

	        if (RESULT_FORMATS.indexOf(format) > -1) {
	            data.format = 'image/' + format;
	            data.quality = quality;
	        }

	        data.circle = circle;
	        data.url = self.data.url;
	        data.backgroundColor = backgroundColor;

	        return result(this, resultType, data);
	    }
	    rotate(deg) {
	        if (!this.useCanvas || !this.options.enableOrientation) {
	            throw 'Croppie: Cannot rotate without enableOrientation && EXIF.js included';
	        }

	        const canvas = this.elements.canvas;
	        this.data.orientation = getExifOffset(this.data.orientation, deg);
	        drawCanvas(canvas, this.elements.img, this.data.orientation);
	        this.updateCenterPoint(true);
	        this.updateZoomLimits();
	    }
	}

	return Croppie;

}));
