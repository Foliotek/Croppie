import { addClass } from '../helpers';
import template from '../template';
const PREFIX = '.cr-';

/**
 *
 * @param {import('../Croppie').default} croppie
 */
const initialize = (croppie) => {
    let { element, elements, options } = croppie;
    var contClass = 'croppie-container',
        customViewportClass = options.viewport.type ? 'cr-vp-' + options.viewport.type : null,
        boundary, img, viewport, overlay, bw, bh;

    addClass(element, contClass, options.customClass);
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

    if (options.enableResize) {
        _initializeResize.call(self);
    }
}

export default initialize;
