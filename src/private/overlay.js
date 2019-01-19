import { css } from '../helpers';
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
}
/**
 *
 * @param {import('../Croppie').default} croppie
 */
const updateOverlay = (croppie) => {
    const { elements } = croppie;
    if (!elements) return; // since this is debounced, it can be fired after destroy

    const boundRect = elements.boundary.getBoundingClientRect(),
        imgData = elements.preview.getBoundingClientRect();

    css(elements.overlay, {
        width: imgData.width + 'px',
        height: imgData.height + 'px',
        top: (imgData.top - boundRect.top) + 'px',
        left: (imgData.left - boundRect.left) + 'px'
    });
}
const debouncedOverlay = debounce(updateOverlay, 500);

export default debouncedOverlay;
export {
    updateOverlay
};
