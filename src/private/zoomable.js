import debouncedOverlay from './overlay';
import boundaries from './boundaries';
import TransformOrigin from '../TransformOrigin';
import Transform from '../Transform';
import { TRANSFORM, TRANSFORM_ORIGIN } from '../constants';
import { css } from '../helpers';


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

        targetZoom = self._currentZoom + (delta * self._currentZoom);

        ev.preventDefault();
        croppie.setZoomerVal(targetZoom);
        change.call(self);
    }

    elements.zoomer.addEventListener('input', change);// this is being fired twice on keypress
    elements.zoomer.addEventListener('change', change);

    if (options.mouseWheelZoom) {
        elements.boundary.addEventListener('mousewheel', scroll);
        elements.boundary.addEventListener('DOMMouseScroll', scroll);
    }
}
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
        css(elements.preview, transCss);
    }

    croppie._currentZoom = ui ? ui.value : self._currentZoom;
    transform.scale = self._currentZoom;
    elements.zoomer.setAttribute('aria-valuenow', self._currentZoom);
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
}

export default zoomable;
