import 'blueimp-canvas-to-blob';
import { num } from '../helpers';

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
}

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
}

const base64Result = (croppie, resultParameters) => {
    return canvasResult(croppie, resultParameters).toDataURL(resultParameters.format, resultParameters.quality);
}

const blobResult = (croppie, resultParameters) => {
    return new Promise(resolve => {
        canvasResult(croppie, resultParameters).toBlob(blob => {
            resolve(blob);
        }, resultParameters.format, resultParameters.quality);
    }).catch(console.error);
}

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
}

export default result;
