import Transform from '../Transform';
import { TRANSFORM, USER_SELECT } from '../constants';
import { css } from '../helpers';
import { updateOverlay } from './overlay';
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
                zoom = parseFloat(zoomer.value) + parseFloat(zoomer.step)
            }
            else {
                zoom = parseFloat(zoomer.value) - parseFloat(zoomer.step)
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
        css(preview, newCss);
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
        css(preview, newCss);
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

}

export default draggable;
