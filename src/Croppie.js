import DEFAULTS from './defaults';
import objectAssignDeep from 'object-assign-deep';
import { initialize, hasExif, zoomable, draggable } from './private/index';
import { naturalImageDimensions, loadImage, fix, css, getExifOrientation, dispatchChange } from './helpers';
import { transferImageToCanvas } from './private/canvas';
import { TRANSFORM, TRANSFORM_ORIGIN } from './constants';
import Transform from './Transform';
import TransformOrigin from './TransformOrigin';
import { updateOverlay } from './private/overlay';
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

        this.options.enableZoom && zoomable(this);

        draggable(this);

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
                    Array.prototype.forEach.call(this.elements.img.classList, function(c) { img.classList.add(c); });
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
    updateZoomLimits (initial) {
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

        dispatchChange(zoomer);
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
        css(img, cssReset);

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
        css(img, cssReset);

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
        css(self.elements.preview, newCss);
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

        css(self.elements.preview, TRANSFORM, transform.toString());
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
        css(self.elements.preview, newCss);

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
}

export default Croppie;
