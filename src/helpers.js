/**
 *
 * @param {HTMLElement} element
 * @param {string} className
 */
const addClass = (element, classNames) => {
    classNames = Array.isArray(classNames) ? classNames : [classNames];
    if (element.classList) {
        element.classList.add(...classNames);
    }
    else {
        element.className += ' ' + classNames.join(' ');
    }
}

/**
 *
 * @param {HTMLElement} el
 * @param {(Object|string)} styles
 * @param {string} val
 */
const css = (el, styles, val) => {
    //http://jsperf.com/vanilla-css
    if (typeof (styles) === 'string') {
        var tmp = styles;
        styles = {};
        styles[tmp] = val;
    }
    for (var prop in styles) {
        el.style[prop] = styles[prop];
    }
}

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
}

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
}

const dispatchChange = (element) => {
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        element.dispatchEvent(evt);
    }
    else {
        element.fireEvent("onchange");
    }
}

export {
    addClass,
    css,
    naturalImageDimensions,
    loadImage,
    getExifOrientation,
    fix,
    num,
    dispatchChange
}
