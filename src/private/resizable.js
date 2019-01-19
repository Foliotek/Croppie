import { USER_SELECT } from '../constants';
import { css, addClass } from '../helpers';
import { updateOverlay } from './overlay';

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

    addClass(wrap, 'cr-resizer');
    css(wrap, {
        width: options.viewport.width + 'px',
        height: options.viewport.height + 'px'
    });

    if (options.resizeControls.height) {
        vr = document.createElement('div');
        addClass(vr, 'cr-resizer-vertical');
        wrap.appendChild(vr);
    }

    if (options.resizeControls.width) {
        hr = document.createElement('div');
        addClass(hr, 'cr-resizer-horisontal');
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
            css(wrap, {
                height: newHeight + 'px'
            });

            options.boundary.height += deltaY;
            css(elements.boundary, {
                height: options.boundary.height + 'px'
            });

            options.viewport.height += deltaY;
            css(elements.viewport, {
                height: options.viewport.height + 'px'
            });
        }
        else if (direction === 'h' && newWidth >= minSize && newWidth <= maxWidth) {
            css(wrap, {
                width: newWidth + 'px'
            });

            options.boundary.width += deltaX;
            css(elements.boundary, {
                width: options.boundary.width + 'px'
            });

            options.viewport.width += deltaX;
            css(elements.viewport, {
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
}

export default resizable;
