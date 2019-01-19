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

export default boundaries;
