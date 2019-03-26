/*************************
 * Croppie
 * Copyright 2018
 * Foliotek
 * Version: 2.6.2
 *************************/
// Promise polyfill

// CustomEvent polyfill

// HTMLCanvasElement.prototype.toBlob polyfill

declare global {
  interface Window {
    jQuery: any;
    EXIF: any;
  }
}

declare const Prototype: any;
declare const EXIF: any;

interface CroppieOptions {
  viewport: {
    width: number;
    height: number;
    type: string;
  };
  boundary: {
    width: number;
    height: number;
  };
  orientationControls: {
    enabled: boolean;
    leftClass: string;
    rightClass: string;
  };
  resizeControls: {
    width: boolean;
    height: boolean;
  };
  customClass: string;
  showZoomer: boolean;
  enableZoom: boolean;
  enableResize: boolean;
  mouseWheelZoom: boolean | string;
  enableExif: boolean;
  enforceBoundary: boolean;
  enableOrientation: boolean;
  enableKeyMovement: boolean;
  update: (
    data: { points: number[]; zoom: number; orientation: number }
  ) => void;
  url: string;
  points: number[];
  relative: boolean;
  useCanvas: boolean;
  maxZoom: number;
}

interface CroppieBindOptions {
  url?: string;
  points?: number[];
  zoom?: number;
  orientation?: number;
}

interface CroppieResultData {
  type?: 'canvas' | 'base64' | 'html' | 'blob' | 'rawcanvas';
  size?:
    | 'viewport'
    | 'original'
    | {
        width: number;
        height: number;
      };
  format?: string;
  quality?: number;
  circle?: boolean;
  points: number[];
  zoom: number;
  orientation: number;
  outputWidth?: number;
  outputHeight?: number;
  url?: string;
  backgroundColor?: string | CanvasGradient | CanvasPattern;
}

const cssPrefixes: string[] = ['Webkit', 'Moz', 'ms'],
  emptyStyles = document.createElement('div').style,
  EXIF_NORM = [1, 8, 3, 6],
  EXIF_FLIP = [2, 7, 4, 5];
let CSS_TRANS_ORG: string, CSS_TRANSFORM: string, CSS_USERSELECT: string;

const vendorPrefix = (prop: string) => {
  if (prop in emptyStyles) {
    return prop;
  }

  const capProp = prop[0].toUpperCase() + prop.slice(1);
  let i = cssPrefixes.length;

  while (i--) {
    prop = cssPrefixes[i] + capProp;
    if (prop in emptyStyles) {
      return prop;
    }
  }
};

CSS_TRANSFORM = vendorPrefix('transform');
CSS_TRANS_ORG = vendorPrefix('transformOrigin');
CSS_USERSELECT = vendorPrefix('userSelect');

const getExifOffset = (
  ornt: number,
  rotate: 90 | 180 | 270 | -90 | -180 | -270
) => {
  const arr = EXIF_NORM.indexOf(ornt) > -1 ? EXIF_NORM : EXIF_FLIP,
    index = arr.indexOf(ornt),
    offset = (rotate / 90) % arr.length; // 180 = 2%4 = 2 shift exif by 2 indexes

  return arr[(arr.length + index + (offset % arr.length)) % arr.length];
};

// Credits to : Andrew Dupont - http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
const deepExtend = (destination: any, source: any) => {
  destination = destination || {};
  for (const property in source) {
    if (
      source[property] &&
      source[property].constructor &&
      source[property].constructor === Object
    ) {
      destination[property] = destination[property] || {};
      deepExtend(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

const clone = (object: any) => {
  return deepExtend({}, object);
};

//http://jsperf.com/vanilla-css
const css = (el: HTMLElement, styles: any | string, val?: string) => {
  if (typeof styles === 'string') {
    const tmp: string = styles;
    styles = {};
    styles[tmp] = val;
  }

  for (const prop in styles) {
    (el.style as any)[prop] = styles[prop];
  }
};

const addClass = (el: HTMLElement, c: string) => {
  if (el.classList) {
    el.classList.add(c);
  } else {
    el.className += ' ' + c;
  }
};

const removeClass = (el: HTMLElement, c: string) => {
  if (el.classList) {
    el.classList.remove(c);
  } else {
    el.className = el.className.replace(c, '');
  }
};

const setAttributes = (el: HTMLElement, attrs: object) => {
  for (const key in attrs) {
    el.setAttribute(key, (attrs as any)[key]);
  }
};

const num = (v: string) => {
  return parseInt(v, 10);
};

/* Utilities */
const loadImage = (src: string, doExif: boolean) => {
  const img = new Image();
  img.style.opacity = '0';
  return new Promise<HTMLImageElement & { exifdata: { Orientation: string } }>(
    (resolve, reject) => {
      const _resolve = () => {
        img.style.opacity = '1';
        setTimeout(() => {
          resolve(img as HTMLImageElement & {
            exifdata: { Orientation: string };
          });
        }, 1);
      };

      img.removeAttribute('crossOrigin');
      if (src.match(/^https?:\/\/|^\/\//)) {
        img.setAttribute('crossOrigin', 'anonymous');
      }

      img.onload = () => {
        if (doExif) {
          EXIF.getData(img, () => {
            _resolve();
          });
        } else {
          _resolve();
        }
      };
      img.onerror = (ev) => {
        img.style.opacity = '1';
        setTimeout(() => {
          reject(ev);
        }, 1);
      };
      img.src = src;
    }
  );
};

const naturalImageDimensions = (
  img: HTMLImageElement & { exifdata: { Orientation: string } },
  ornt?: number
) => {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const orient = ornt || getExifOrientation(img);
  if (orient && orient >= 5) {
    const x = w;
    w = h;
    h = x;
  }
  return { width: w, height: h };
};

class Transform {
  constructor(public x: number, public y: number, public scale: number) {}
  toString() {
    return `translate3d(${this.x}px, ${this.y}px, 0px) scale(${this.scale})`;
  }
  static parse(v: HTMLElement | string): Transform {
    if ((v as HTMLElement).style) {
      return Transform.parse(((v as HTMLElement).style as any)[CSS_TRANSFORM]);
    } else if (
      (v as string).indexOf('matrix') > -1 ||
      (v as string).indexOf('none') > -1
    ) {
      return Transform.fromMatrix(v as string);
    } else {
      return Transform.fromString(v as string);
    }
  }
  static fromMatrix(v: string) {
    let vals = v.substring(7).split(',');
    if (!vals.length || v === 'none') {
      return new Transform(0, 0, 1);
    }
    return new Transform(num(vals[4]), num(vals[5]), parseFloat(vals[0]));
  }
  static fromString(v: string) {
    const values = v.split(') '),
      translate = values[0].substring(12).split(','),
      scale = values.length > 1 ? parseFloat(values[1].substring(6)) : 1,
      x = translate.length > 1 ? parseFloat(translate[0]) : 0,
      y = translate.length > 1 ? parseFloat(translate[1]) : 0;
    return new Transform(x, y, scale);
  }
}

class TransformOrigin {
  x: number;
  y: number;
  constructor(el?: HTMLElement) {
    if (!el || !(el.style as any)[CSS_TRANS_ORG]) {
      this.x = 0;
      this.y = 0;
      return;
    }
    const css = (el.style as any)[CSS_TRANS_ORG].split(' ');
    this.x = parseFloat(css[0]);
    this.y = parseFloat(css[1]);
  }
  toString() {
    return `${this.x}px ${this.y}px`;
  }
}

const getExifOrientation = (
  img: HTMLImageElement & { exifdata: { Orientation: string } }
) => {
  return img.exifdata && img.exifdata.Orientation
    ? num(img.exifdata.Orientation)
    : 1;
};

const drawCanvas = (
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  orientation: number
) => {
  const width = img.width,
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
      ctx.rotate((180 * Math.PI) / 180);
      break;

    case 4:
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;

    case 5:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate((90 * Math.PI) / 180);
      ctx.scale(1, -1);
      break;

    case 6:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate((90 * Math.PI) / 180);
      ctx.translate(0, -height);
      break;

    case 7:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate((-90 * Math.PI) / 180);
      ctx.translate(-width, height);
      ctx.scale(1, -1);
      break;

    case 8:
      canvas.width = height;
      canvas.height = width;
      ctx.translate(0, width);
      ctx.rotate((-90 * Math.PI) / 180);
      break;
  }
  ctx.drawImage(img, 0, 0, width, height);
  ctx.restore();
};

const fix = (v: number, decimalPoints?: number) => {
  return parseFloat(v.toFixed(decimalPoints || 0)); // TODO: de-wrapped?
};

//#region jQuery
if (window.jQuery) {
  const $ = window.jQuery;
  $.fn.croppie = function(...allOpts: any[]) {
    const opts = allOpts[0];
    const ot = typeof opts;

    if (ot === 'string') {
      const args = allOpts.slice(1);
      const singleInst = $(this).data('croppie');

      if (opts === 'get') {
        return singleInst.get();
      } else if (opts === 'result') {
        return singleInst.result.apply(singleInst, args);
      } else if (opts === 'bind') {
        return singleInst.bind.apply(singleInst, args);
      }

      return this.each(function() {
        const i = $(this).data('croppie');
        if (!i) return;

        const method = i[opts];
        if ($.isFunction(method)) {
          method.apply(i, args);
          if (opts === 'destroy') {
            $(this).removeData('croppie');
          }
        } else {
          throw 'Croppie ' + opts + ' method not found';
        }
      });
    } else {
      return this.each(function() {
        const i = new Croppie(this, opts);
        i.$ = $;
        $(this).data('croppie', i);
      });
    }
  };
}
//#endregion
class Croppie {
  elements: {
    viewport?: HTMLDivElement;
    img?: HTMLImageElement & { exifdata: { Orientation: string } };
    zoomer?: HTMLInputElement;
    canvas?: HTMLCanvasElement;
    boundary?: HTMLDivElement;
    zoomerWrap?: HTMLDivElement;
    overlay?: HTMLDivElement;
    preview?: HTMLImageElement | HTMLCanvasElement;
  } = {};
  data: {
    bound?: boolean;
    url?: string;
    boundZoom?: number;
    points?: number[];
    orientation?: number;
  } = {};
  _currentZoom: number;
  _debouncedOverlay = this._getDebouncedOverlay();
  _originalImageWidth: number;
  _originalImageHeight: number;
  $: any;
  element: HTMLElement;
  options: CroppieOptions;

  constructor(element: HTMLElement, opts: Partial<CroppieOptions>) {
    if (element.className.indexOf('croppie-container') > -1) {
      throw new Error("Croppie: Can't initialize croppie more than once");
    }
    this.element = element;
    this.options = deepExtend(clone(Croppie.defaults), opts);
    if (this.element.tagName.toLowerCase() === 'img') {
      const origImage = this.element;
      addClass(origImage, 'cr-original-image');
      setAttributes(origImage, { 'aria-hidden': 'true', alt: '' });
      const replacementDiv = document.createElement('div');
      this.element.parentNode.appendChild(replacementDiv);
      replacementDiv.appendChild(origImage);
      this.element = replacementDiv;
      this.options.url =
        this.options.url || (origImage as HTMLImageElement).src;
    }
    this._create();
    if (this.options.url) {
      const bindOpts = {
        url: this.options.url,
        points: this.options.points
      };
      delete this.options['url'];
      delete this.options['points'];
      this.bind(bindOpts);
    }
  }
  static defaults: Partial<CroppieOptions> = {
    viewport: {
      width: 100,
      height: 100,
      type: 'square'
    },
    boundary: {} as any,
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
    update: function() {}
  };

  static RESULT_DEFAULTS = {
    type: 'canvas',
    format: 'png',
    quality: 1
  };

  static RESULT_FORMATS = ['jpeg', 'webp', 'png'];

  async bind(
    options: string | CroppieBindOptions | number[],
    cb?: () => void
  ): Promise<void> {
    const hasExif = this._hasExif();

    let url: string,
      points: number[] = [],
      zoom: number = null;

    if (typeof options === 'string') {
      url = options;
      options = {};
    } else if (Array.isArray(options)) {
      points = options.slice();
    } else if (typeof options === 'undefined' && this.data.url) {
      // Refreshing
      this._updatePropertiesFromImage();
      this._triggerUpdate();
      return null;
    } else {
      url = options.url;
      points = options.points || [];
      zoom = typeof options.zoom === 'undefined' ? null : options.zoom;
    }

    this.data.bound = false;
    this.data.url = url || this.data.url;
    this.data.boundZoom = zoom;

    const img = await loadImage(url, hasExif);
    this._replaceImage(img);
    if (!points.length) {
      const natDim = naturalImageDimensions(img);
      const rect = this.elements.viewport.getBoundingClientRect();
      const aspectRatio = rect.width / rect.height;
      const imgAspectRatio = natDim.width / natDim.height;
      let width: number, height: number;
      if (imgAspectRatio > aspectRatio) {
        height = natDim.height;
        width = height * aspectRatio;
      } else {
        width = natDim.width;
        height = natDim.height / aspectRatio;
      }
      const x0 = (natDim.width - width) / 2;
      const y0 = (natDim.height - height) / 2;
      const x1 = x0 + width;
      const y1 = y0 + height;
      this.data.points = [x0, y0, x1, y1];
    } else if (this.options.relative) {
      points = [
        (points[0] * img.naturalWidth) / 100,
        (points[1] * img.naturalHeight) / 100,
        (points[2] * img.naturalWidth) / 100,
        (points[3] * img.naturalHeight) / 100
      ];
    }
    this.data.points = points;
    if (this.options.useCanvas) {
      this._transferImageToCanvas((options as CroppieBindOptions).orientation);
    }
    this._updatePropertiesFromImage();
    this._triggerUpdate();
    cb && cb();
  }

  get() {
    const data = this._get();
    const points = data.points;
    if (this.options.relative) {
      points[0] /= this.elements.img.naturalWidth / 100;
      points[1] /= this.elements.img.naturalHeight / 100;
      points[2] /= this.elements.img.naturalWidth / 100;
      points[3] /= this.elements.img.naturalHeight / 100;
    }
    return data;
  }

  result(type: {
    type: 'canvas' | 'base64' | 'html' | 'blob' | 'rawcanvas';
    size:
      | 'viewport'
      | 'original'
      | {
          width: number;
          height: number;
        };
    format: 'jpeg' | 'png' | 'webp';
    quality: number;
    circle: boolean;
  }) {
    const data: CroppieResultData = this._get(),
      opts: CroppieResultData = deepExtend(
        clone(Croppie.RESULT_DEFAULTS),
        clone(type)
      ),
      resultType = typeof type === 'string' ? type : opts.type || 'base64',
      size = opts.size || 'viewport',
      format = opts.format,
      quality = opts.quality,
      backgroundColor = opts.backgroundColor,
      circle =
        typeof opts.circle === 'boolean'
          ? opts.circle
          : this.options.viewport.type === 'circle',
      vpRect = this.elements.viewport.getBoundingClientRect(),
      ratio = vpRect.width / vpRect.height;

    if (size === 'viewport') {
      data.outputWidth = vpRect.width;
      data.outputHeight = vpRect.height;
    } else if (typeof size === 'object') {
      if (size.width && size.height) {
        data.outputWidth = size.width;
        data.outputHeight = size.height;
      } else if (size.width) {
        data.outputWidth = size.width;
        data.outputHeight = size.width / ratio;
      } else if (size.height) {
        data.outputWidth = size.height * ratio;
        data.outputHeight = size.height;
      }
    }

    if (Croppie.RESULT_FORMATS.indexOf(format) > -1) {
      data.format = 'image/' + format;
      data.quality = quality;
    }

    data.circle = circle;
    data.url = this.data.url;
    data.backgroundColor = backgroundColor;

    const prom = new Promise<
      HTMLCanvasElement | string | Blob | HTMLDivElement
    >((resolve) => {
      switch (resultType.toLowerCase()) {
        case 'rawcanvas':
          resolve(this._getCanvas(data));
          break;
        case 'canvas':
        case 'base64':
          resolve(this._getBase64Result(data));
          break;
        case 'blob':
          this._getBlobResult(data).then(resolve);
          break;
        default:
          resolve(this._getHtmlResult(data));
      }
    });
    return prom;
  }

  refresh() {
    this._updatePropertiesFromImage();
  }

  setZoom(v: number) {
    this._setZoomerVal(v);
    this.dispatchChange(this.elements.zoomer);
  }

  rotate(deg: 90 | 180 | 270 | -90 | -180 | -270) {
    if (!this.options.useCanvas || !this.options.enableOrientation) {
      throw 'Croppie: Cannot rotate without enableOrientation && EXIF.js included';
    }
    const canvas = this.elements.canvas;

    this.data.orientation = getExifOffset(this.data.orientation, deg);
    drawCanvas(canvas, this.elements.img, this.data.orientation);
    this._updateCenterPoint(true);
    this._updateZoomLimits();
  }

  destroy() {
    this.element.removeChild(this.elements.boundary);
    removeClass(this.element, 'croppie-container');
    if (this.options.enableZoom) {
      this.element.removeChild(this.elements.zoomerWrap);
    }
    delete this.elements;
  }

  //#region Private Methods
  _create() {
    const contClass = 'croppie-container',
      customViewportClass = this.options.viewport.type
        ? 'cr-vp-' + this.options.viewport.type
        : null;

    this.options.useCanvas = this.options.enableOrientation || this._hasExif();

    const boundary = (this.elements.boundary = document.createElement('div'));
    const viewport = (this.elements.viewport = document.createElement('div'));
    const img = (this.elements.img = document.createElement(
      'img'
    ) as HTMLImageElement & {
      exifdata: { Orientation: string };
    });
    const overlay = (this.elements.overlay = document.createElement('div'));

    if (this.options.useCanvas) {
      this.elements.canvas = document.createElement('canvas');
      // Disable this? why?
      this.elements.preview = this.elements.canvas;
      // this.elements.preview = img;
    } else {
      this.elements.preview = img;
    }

    addClass(boundary, 'cr-boundary');
    boundary.setAttribute('aria-dropeffect', 'none');
    const bw = this.options.boundary.width;
    const bh = this.options.boundary.height;
    css(boundary, {
      width: bw + (isNaN(bw) ? '' : 'px'),
      height: bh + (isNaN(bh) ? '' : 'px')
    });

    addClass(viewport, 'cr-viewport');
    if (customViewportClass) {
      addClass(viewport, customViewportClass);
    }
    css(viewport, {
      width: this.options.viewport.width + 'px',
      height: this.options.viewport.height + 'px'
    });
    viewport.setAttribute('tabindex', '0');

    addClass(this.elements.preview, 'cr-image');
    setAttributes(this.elements.preview, {
      alt: 'preview',
      'aria-grabbed': 'false'
    });
    addClass(overlay, 'cr-overlay');

    this.element.appendChild(boundary);
    boundary.appendChild(this.elements.preview);
    boundary.appendChild(viewport);
    boundary.appendChild(overlay);

    addClass(this.element, contClass);
    if (this.options.customClass) {
      addClass(this.element, this.options.customClass);
    }

    this._initDraggable();

    if (this.options.enableZoom) {
      this._initializeZoom();
    }

    // if (this.options.enableOrientation) {
    //     this._initRotationControls();
    // }

    if (this.options.enableResize) {
      this._initializeResize();
    }
  }

  _initDraggable() {
    let isDragging = false,
      originalX: number,
      originalY: number,
      originalDistance: number,
      vpRect: ClientRect | DOMRect,
      transform: Transform;

    const assignTransformCoordinates = (deltaX: number, deltaY: number) => {
      const imgRect = this.elements.preview.getBoundingClientRect(),
        top = transform.y + deltaY,
        left = transform.x + deltaX;

      if (this.options.enforceBoundary) {
        if (
          vpRect.top > imgRect.top + deltaY &&
          vpRect.bottom < imgRect.bottom + deltaY
        ) {
          transform.y = top;
        }

        if (
          vpRect.left > imgRect.left + deltaX &&
          vpRect.right < imgRect.right + deltaX
        ) {
          transform.x = left;
        }
      } else {
        transform.y = top;
        transform.x = left;
      }
    };

    const keyDown = (ev: KeyboardEvent) => {
      const LEFT_ARROW = 37,
        UP_ARROW = 38,
        RIGHT_ARROW = 39,
        DOWN_ARROW = 40;

      const parseKeyDown = (key: number) => {
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
      };

      if (
        ev.shiftKey &&
        (ev.keyCode === UP_ARROW || ev.keyCode === DOWN_ARROW)
      ) {
        let zoom: number;
        // Should we use keycode? It is deprecated.
        if (ev.keyCode === UP_ARROW) {
          zoom =
            parseFloat(this.elements.zoomer.value) +
            parseFloat(this.elements.zoomer.step);
        } else {
          zoom =
            parseFloat(this.elements.zoomer.value) -
            parseFloat(this.elements.zoomer.step);
        }
        this.setZoom(zoom);
      } else if (
        this.options.enableKeyMovement &&
        (ev.keyCode >= 37 && ev.keyCode <= 40)
      ) {
        ev.preventDefault();
        const movement = parseKeyDown(ev.keyCode);

        transform = Transform.parse(this.elements.preview);
        (document.body.style as any)[CSS_USERSELECT] = 'none';
        vpRect = this.elements.viewport.getBoundingClientRect();
        keyMove(movement);
      }
    };

    const keyMove = (movement: number[]) => {
      const deltaX = movement[0],
        deltaY = movement[1],
        newCss: object = {};

      assignTransformCoordinates(deltaX, deltaY);

      (newCss as any)[CSS_TRANSFORM] = transform.toString();
      css(this.elements.preview, newCss);
      this._updateOverlay();
      (document.body.style as any)[CSS_USERSELECT] = '';
      this._updateCenterPoint();
      this._triggerUpdate();
      originalDistance = 0;
    };

    const mouseDown = (ev: MouseEvent | TouchEvent) => {
      if (
        (ev as MouseEvent).button !== undefined &&
        (ev as MouseEvent).button !== 0
      )
        return;

      ev.preventDefault();
      if (isDragging) return;
      isDragging = true;
      originalX = (ev as MouseEvent).pageX;
      originalY = (ev as MouseEvent).pageY;

      if ((ev as TouchEvent).touches) {
        const touches = (ev as TouchEvent).touches[0];
        originalX = touches.pageX;
        originalY = touches.pageY;
      }
      this.toggleGrabState(isDragging);
      transform = Transform.parse(this.elements.preview);
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('touchmove', mouseMove);
      window.addEventListener('mouseup', mouseUp);
      window.addEventListener('touchend', mouseUp);
      (document.body.style as any)[CSS_USERSELECT] = 'none';
      vpRect = this.elements.viewport.getBoundingClientRect();
    };

    const mouseMove = (ev: MouseEvent | TouchEvent) => {
      ev.preventDefault();
      let pageX = (ev as MouseEvent).pageX,
        pageY = (ev as MouseEvent).pageY;

      if ((ev as TouchEvent).touches) {
        const touches = (ev as TouchEvent).touches[0];
        pageX = touches.pageX;
        pageY = touches.pageY;
      }

      const deltaX = pageX - originalX,
        deltaY = pageY - originalY,
        newCss: object = {};

      if (ev.type === 'touchmove') {
        if ((ev as TouchEvent).touches.length > 1) {
          const touch1 = (ev as TouchEvent).touches[0];
          const touch2 = (ev as TouchEvent).touches[1];
          const dist = Math.sqrt(
            (touch1.pageX - touch2.pageX) * (touch1.pageX - touch2.pageX) +
              (touch1.pageY - touch2.pageY) * (touch1.pageY - touch2.pageY)
          );

          if (!originalDistance) {
            originalDistance = dist / this._currentZoom;
          }

          const scale = dist / originalDistance;

          this._setZoomerVal(scale);
          this.dispatchChange(this.elements.zoomer);
          return;
        }
      }

      assignTransformCoordinates(deltaX, deltaY);

      (newCss as any)[CSS_TRANSFORM] = transform.toString();
      css(this.elements.preview, newCss);
      this._updateOverlay();
      originalY = pageY;
      originalX = pageX;
    };

    const mouseUp = () => {
      isDragging = false;
      this.toggleGrabState(isDragging);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchend', mouseUp);
      (document.body.style as any)[CSS_USERSELECT] = '';
      this._updateCenterPoint();
      this._triggerUpdate();
      originalDistance = 0;
    };

    this.elements.overlay.addEventListener('mousedown', mouseDown);
    this.elements.viewport.addEventListener('keydown', keyDown);
    this.elements.overlay.addEventListener('touchstart', mouseDown);
  }

  toggleGrabState(isDragging: boolean) {
    this.elements.preview.setAttribute(
      'aria-grabbed',
      isDragging ? 'true' : 'false'
    );
    this.elements.boundary.setAttribute(
      'aria-dropeffect',
      isDragging ? 'move' : 'none'
    );
  }

  _setZoomerVal(v: number) {
    if (this.options.enableZoom) {
      const z = this.elements.zoomer,
        val = fix(v, 4);

      z.value = Math.max(
        parseFloat(z.min),
        Math.min(parseFloat(z.max), val)
      ).toString();
    }
  }

  dispatchChange(element: HTMLElement) {
    if ('createEvent' in document) {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('change', false, true);
      element.dispatchEvent(evt);
    } else {
      // For Internet Explorer 6-8
      (element as any).fireEvent('onchange');
    }
  }

  _updateOverlay() {
    if (!this.elements) return; // since this is debounced, it can be fired after destroy
    const boundRect = this.elements.boundary.getBoundingClientRect(),
      imgData = this.elements.preview.getBoundingClientRect();

    css(this.elements.overlay, {
      width: imgData.width + 'px',
      height: imgData.height + 'px',
      top: imgData.top - boundRect.top + 'px',
      left: imgData.left - boundRect.left + 'px'
    });
  }

  _updateCenterPoint(rotate?: boolean) {
    const scale = this._currentZoom,
      data = this.elements.preview.getBoundingClientRect(),
      vpData = this.elements.viewport.getBoundingClientRect(),
      transform = Transform.parse(
        (this.elements.preview.style as any)[CSS_TRANSFORM]
      ),
      pc = new TransformOrigin(this.elements.preview),
      top = vpData.top - data.top + vpData.height / 2,
      left = vpData.left - data.left + vpData.width / 2,
      center: { x?: number; y?: number } = {},
      adj: { x?: number; y?: number } = {};

    if (rotate) {
      const cx = pc.x;
      const cy = pc.y;
      const tx = transform.x;
      const ty = transform.y;

      center.y = cx;
      center.x = cy;
      transform.y = tx;
      transform.x = ty;
    } else {
      center.y = top / scale;
      center.x = left / scale;

      adj.y = (center.y - pc.y) * (1 - scale);
      adj.x = (center.x - pc.x) * (1 - scale);

      transform.x -= adj.x;
      transform.y -= adj.y;
    }

    const newCss = {};
    (newCss as any)[CSS_TRANS_ORG] = center.x + 'px ' + center.y + 'px';
    (newCss as any)[CSS_TRANSFORM] = transform.toString();
    css(this.elements.preview, newCss);
  }

  _triggerUpdate() {
    const data = this.get();

    if (!this._isVisible()) {
      return;
    }

    this.options.update.call(this, data);
    if (this.$ && typeof Prototype === 'undefined') {
      this.$(this.element).trigger('update.croppie', data);
    } else {
      const ev = new CustomEvent('update', { detail: data });
      this.element.dispatchEvent(ev);
    }
  }

  _isVisible() {
    return (
      this.elements.preview.offsetHeight > 0 &&
      this.elements.preview.offsetWidth > 0
    );
  }

  _initializeZoom() {
    const wrap = (this.elements.zoomerWrap = document.createElement('div')),
      zoomer = (this.elements.zoomer = document.createElement('input'));

    addClass(wrap, 'cr-slider-wrap');
    addClass(zoomer, 'cr-slider');
    zoomer.type = 'range';
    zoomer.step = '0.0001';
    zoomer.value = '1';
    zoomer.style.display = this.options.showZoomer ? '' : 'none';
    zoomer.setAttribute('aria-label', 'zoom');

    this.element.appendChild(wrap);
    wrap.appendChild(zoomer);

    this._currentZoom = 1;

    const change = () => {
      this._onZoom({
        value: parseFloat(zoomer.value),
        origin: new TransformOrigin(this.elements.preview),
        viewportRect: this.elements.viewport.getBoundingClientRect(),
        transform: Transform.parse(this.elements.preview)
      });
    };

    const scroll = (ev: WheelEvent) => {
      let delta, targetZoom;

      if (this.options.mouseWheelZoom === 'ctrl' && ev.ctrlKey !== true) {
        return 0;
      } else if (ev.deltaY) {
        delta = ev.deltaY / 1060; //deltaY min: -53 max: 53 // max x 10 x 2
      } else if (ev.detail) {
        delta = ev.detail / -60; //delta min: -3 max: 3 // max x 10 x 2
      } else {
        delta = 0;
      }

      targetZoom = this._currentZoom + delta * this._currentZoom;

      ev.preventDefault();
      this._setZoomerVal(targetZoom);
      change();
    };

    this.elements.zoomer.addEventListener('input', change); // this is being fired twice on keypress
    this.elements.zoomer.addEventListener('change', change);

    if (this.options.mouseWheelZoom) {
      this.elements.boundary.addEventListener('wheel', scroll);
    }
  }

  _hasExif() {
    return this.options.enableExif && !!window.EXIF;
  }

  _onZoom(ui: {
    value: number;
    origin: TransformOrigin;
    viewportRect: ClientRect | DOMRect;
    transform: Transform;
  }) {
    const transform = ui
        ? ui.transform
        : Transform.parse(this.elements.preview),
      vpRect = ui
        ? ui.viewportRect
        : this.elements.viewport.getBoundingClientRect(),
      origin = ui ? ui.origin : new TransformOrigin(this.elements.preview);

    const applyCss = () => {
      const transCss = {};
      (transCss as any)[CSS_TRANSFORM] = transform.toString();
      (transCss as any)[CSS_TRANS_ORG] = origin.toString();
      css(this.elements.preview, transCss);
    };

    this._currentZoom = ui ? ui.value : this._currentZoom;
    transform.scale = this._currentZoom;
    this.elements.zoomer.setAttribute(
      'aria-valuenow',
      this._currentZoom.toString()
    );
    applyCss();

    if (this.options.enforceBoundary) {
      const boundaries = this._getVirtualBoundaries(vpRect),
        transBoundaries = boundaries.translate,
        oBoundaries = boundaries.origin;

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
    this._debouncedOverlay();
    this._triggerUpdate();
  }

  _getVirtualBoundaries(viewport: ClientRect | DOMRect) {
    const scale = this._currentZoom,
      vpWidth = viewport.width,
      vpHeight = viewport.height,
      centerFromBoundaryX = this.elements.boundary.clientWidth / 2,
      centerFromBoundaryY = this.elements.boundary.clientHeight / 2,
      imgRect = this.elements.preview.getBoundingClientRect(),
      curImgWidth = imgRect.width,
      curImgHeight = imgRect.height,
      halfWidth = vpWidth / 2,
      halfHeight = vpHeight / 2,
      maxX = (halfWidth / scale - centerFromBoundaryX) * -1,
      minX = maxX - (curImgWidth * (1 / scale) - vpWidth * (1 / scale)),
      maxY = (halfHeight / scale - centerFromBoundaryY) * -1,
      minY = maxY - (curImgHeight * (1 / scale) - vpHeight * (1 / scale)),
      originMinX = (1 / scale) * halfWidth,
      originMaxX = curImgWidth * (1 / scale) - originMinX,
      originMinY = (1 / scale) * halfHeight,
      originMaxY = curImgHeight * (1 / scale) - originMinY;

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
  }

  _initializeResize() {
    const wrap = document.createElement('div');
    let isDragging = false;
    let direction: 'v' | 'h';
    let originalX: number;
    let originalY: number;
    const minSize = 50;
    let maxWidth: number;
    let maxHeight: number;
    let vr: HTMLDivElement;
    let hr: HTMLDivElement;

    addClass(wrap, 'cr-resizer');
    css(wrap, {
      width: this.options.viewport.width + 'px',
      height: this.options.viewport.height + 'px'
    });

    if (this.options.resizeControls.height) {
      vr = document.createElement('div');
      addClass(vr, 'cr-resizer-vertical');
      wrap.appendChild(vr);
    }

    if (this.options.resizeControls.width) {
      hr = document.createElement('div');
      addClass(hr, 'cr-resizer-horisontal');
      wrap.appendChild(hr);
    }

    const mouseDown = (ev: MouseEvent | TouchEvent) => {
      if (
        (ev as MouseEvent).button !== undefined &&
        (ev as MouseEvent).button !== 0
      )
        return;

      ev.preventDefault();
      if (isDragging) {
        return;
      }

      const overlayRect = this.elements.overlay.getBoundingClientRect();

      isDragging = true;
      originalX = (ev as MouseEvent).pageX;
      originalY = (ev as MouseEvent).pageY;
      direction =
        (ev.currentTarget as HTMLDivElement).className.indexOf('vertical') !==
        -1
          ? 'v'
          : 'h';
      maxWidth = overlayRect.width;
      maxHeight = overlayRect.height;

      if ((ev as TouchEvent).touches) {
        const touches = (ev as TouchEvent).touches[0];
        originalX = touches.pageX;
        originalY = touches.pageY;
      }

      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('touchmove', mouseMove);
      window.addEventListener('mouseup', mouseUp);
      window.addEventListener('touchend', mouseUp);
      (document.body.style as any)[CSS_USERSELECT] = 'none';
    };

    const mouseMove = (ev: MouseEvent | TouchEvent) => {
      let pageX = (ev as MouseEvent).pageX;
      let pageY = (ev as MouseEvent).pageY;

      ev.preventDefault();

      if ((ev as TouchEvent).touches) {
        const touches = (ev as TouchEvent).touches[0];
        pageX = touches.pageX;
        pageY = touches.pageY;
      }

      const deltaX = pageX - originalX;
      const deltaY = pageY - originalY;
      const newHeight = this.options.viewport.height + deltaY;
      const newWidth = this.options.viewport.width + deltaX;

      if (direction === 'v' && newHeight >= minSize && newHeight <= maxHeight) {
        css(wrap, {
          height: newHeight + 'px'
        });

        this.options.boundary.height += deltaY;
        css(this.elements.boundary, {
          height: this.options.boundary.height + 'px'
        });

        this.options.viewport.height += deltaY;
        css(this.elements.viewport, {
          height: this.options.viewport.height + 'px'
        });
      } else if (
        direction === 'h' &&
        newWidth >= minSize &&
        newWidth <= maxWidth
      ) {
        css(wrap, {
          width: newWidth + 'px'
        });

        this.options.boundary.width += deltaX;
        css(this.elements.boundary, {
          width: this.options.boundary.width + 'px'
        });

        this.options.viewport.width += deltaX;
        css(this.elements.viewport, {
          width: this.options.viewport.width + 'px'
        });
      }

      this._updateOverlay();
      this._updateZoomLimits();
      this._updateCenterPoint();
      this._triggerUpdate();
      originalY = pageY;
      originalX = pageX;
    };

    const mouseUp = () => {
      isDragging = false;
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchend', mouseUp);
      (document.body.style as any)[CSS_USERSELECT] = '';
    };

    if (vr) {
      vr.addEventListener('mousedown', mouseDown);
      vr.addEventListener('touchstart', mouseDown);
    }

    if (hr) {
      hr.addEventListener('mousedown', mouseDown);
      hr.addEventListener('touchstart', mouseDown);
    }

    this.elements.boundary.appendChild(wrap);
  }

  _updateZoomLimits(initial?: boolean) {
    const zoomer = this.elements.zoomer,
      scale = parseFloat(zoomer.value),
      boundaryData = this.elements.boundary.getBoundingClientRect(),
      imgData = naturalImageDimensions(
        this.elements.img,
        this.data.orientation
      ),
      vpData = this.elements.viewport.getBoundingClientRect();
    let initialZoom: number,
      defaultInitialZoom: number,
      minW: number,
      minH: number,
      minZoom = 0,
      maxZoom = this.options.maxZoom || 1.5;

    if (this.options.enforceBoundary) {
      minW = vpData.width / imgData.width;
      minH = vpData.height / imgData.height;
      minZoom = Math.max(minW, minH);
    }

    if (minZoom >= maxZoom) {
      maxZoom = minZoom + 1;
    }

    zoomer.min = fix(minZoom, 4).toString();
    zoomer.max = fix(maxZoom, 4).toString();

    if (!initial && (scale < minZoom || scale > maxZoom)) {
      this._setZoomerVal(scale < minZoom ? minZoom : maxZoom);
    } else if (initial) {
      defaultInitialZoom = Math.max(
        boundaryData.width / imgData.width,
        boundaryData.height / imgData.height
      );
      initialZoom =
        this.data.boundZoom !== null ? this.data.boundZoom : defaultInitialZoom;
      this._setZoomerVal(initialZoom);
    }

    this.dispatchChange(zoomer);
  }

  _replaceImage(img: HTMLImageElement & { exifdata: { Orientation: string } }) {
    if (this.elements.img.parentNode) {
      this.elements.img.classList.forEach((c) => {
        img.classList.add(c);
      });
      this.elements.img.parentNode.replaceChild(img, this.elements.img);
      this.elements.preview = img; // if the img is attached to the DOM, they're not using the canvas
    }
    this.elements.img = img;
  }

  _transferImageToCanvas(customOrientation?: number) {
    const canvas = this.elements.canvas,
      img = this.elements.img,
      ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;

    const orientation =
      (this.options.enableOrientation && customOrientation) ||
      getExifOrientation(img);
    drawCanvas(canvas, img, orientation);
  }

  _updatePropertiesFromImage() {
    const initialZoom = 1,
      cssReset: object = {},
      img = this.elements.preview,
      transformReset = new Transform(0, 0, initialZoom),
      originReset = new TransformOrigin(),
      isVisible = this._isVisible();

    if (!isVisible || this.data.bound) {
      // if the croppie isn't visible or it doesn't need binding
      return;
    }

    this.data.bound = true;
    (cssReset as any)[CSS_TRANSFORM] = transformReset.toString();
    (cssReset as any)[CSS_TRANS_ORG] = originReset.toString();
    (cssReset as any)['opacity'] = 1;
    css(img, cssReset);

    const imgData = this.elements.preview.getBoundingClientRect();

    this._originalImageWidth = imgData.width;
    this._originalImageHeight = imgData.height;
    this.data.orientation = getExifOrientation(this.elements.img);

    if (this.options.enableZoom) {
      this._updateZoomLimits(true);
    } else {
      this._currentZoom = initialZoom;
    }

    transformReset.scale = this._currentZoom;
    (cssReset as any)[CSS_TRANSFORM] = transformReset.toString();
    css(img, cssReset);

    if (this.data.points.length) {
      this._bindPoints(this.data.points);
    } else {
      this._centerImage();
    }

    this._updateCenterPoint();
    this._updateOverlay();
  }

  _bindPoints(points: number[]) {
    if (points.length !== 4) {
      throw 'Croppie - Invalid number of points supplied: ' + points;
    }
    const pointsWidth = points[2] - points[0],
      vpData = this.elements.viewport.getBoundingClientRect(),
      boundRect = this.elements.boundary.getBoundingClientRect(),
      vpOffset = {
        left: vpData.left - boundRect.left,
        top: vpData.top - boundRect.top
      },
      scale = vpData.width / pointsWidth,
      originTop = points[1],
      originLeft = points[0],
      transformTop = -1 * points[1] + vpOffset.top,
      transformLeft = -1 * points[0] + vpOffset.left,
      newCss: object = {};

    (newCss as any)[CSS_TRANS_ORG] = originLeft + 'px ' + originTop + 'px';
    (newCss as any)[CSS_TRANSFORM] = new Transform(
      transformLeft,
      transformTop,
      scale
    ).toString();
    css(this.elements.preview, newCss);

    this._setZoomerVal(scale);
    this._currentZoom = scale;
  }

  _centerImage() {
    const imgDim = this.elements.preview.getBoundingClientRect(),
      vpDim = this.elements.viewport.getBoundingClientRect(),
      boundDim = this.elements.boundary.getBoundingClientRect(),
      vpLeft = vpDim.left - boundDim.left,
      vpTop = vpDim.top - boundDim.top,
      w = vpLeft - (imgDim.width - vpDim.width) / 2,
      h = vpTop - (imgDim.height - vpDim.height) / 2,
      transform = new Transform(w, h, this._currentZoom);

    css(this.elements.preview, CSS_TRANSFORM, transform.toString());
  }

  _get() {
    const imgData = this.elements.preview.getBoundingClientRect(),
      vpData = this.elements.viewport.getBoundingClientRect(),
      widthDiff = (vpData.width - this.elements.viewport.offsetWidth) / 2, //border
      heightDiff = (vpData.height - this.elements.viewport.offsetHeight) / 2;
    let scale = this._currentZoom,
      x1 = vpData.left - imgData.left,
      y1 = vpData.top - imgData.top,
      x2 = x1 + this.elements.viewport.offsetWidth + widthDiff,
      y2 = y1 + this.elements.viewport.offsetHeight + heightDiff;

    if (scale === Infinity || isNaN(scale)) {
      scale = 1;
    }

    const max = this.options.enforceBoundary ? 0 : Number.NEGATIVE_INFINITY;
    x1 = Math.max(max, x1 / scale);
    y1 = Math.max(max, y1 / scale);
    x2 = Math.max(max, x2 / scale);
    y2 = Math.max(max, y2 / scale);

    return {
      points: [fix(x1), fix(y1), fix(x2), fix(y2)],
      zoom: scale,
      orientation: this.data.orientation
    };
  }

  _getCanvas(data: CroppieResultData) {
    const points = data.points,
      left = points[0],
      top = points[1],
      right = points[2],
      bottom = points[3],
      circle = data.circle,
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      startX = 0,
      startY = 0;
    let width = right - left,
      height = bottom - top;
    const canvasWidth = data.outputWidth || width,
      canvasHeight = data.outputHeight || height;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (data.backgroundColor) {
      ctx.fillStyle = data.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    if (this.options.enforceBoundary !== false) {
      width = Math.min(width, this._originalImageWidth);
      height = Math.min(height, this._originalImageHeight);
    }
    ctx.drawImage(
      this.elements.preview,
      left,
      top,
      width,
      height,
      startX,
      startY,
      canvasWidth,
      canvasHeight
    );
    if (circle) {
      ctx.fillStyle = '#fff';
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.fill();
    }
    return canvas;
  }

  _getBase64Result(data: CroppieResultData) {
    return this._getCanvas(data).toDataURL(data.format, data.quality);
  }

  _getBlobResult(data: CroppieResultData) {
    return new Promise<Blob>((resolve) => {
      this._getCanvas(data).toBlob(
        (blob) => {
          resolve(blob);
        },
        data.format,
        data.quality
      );
    });
  }

  _getHtmlResult(data: CroppieResultData) {
    const points = data.points,
      div = document.createElement('div'),
      img = document.createElement('img'),
      width = points[2] - points[0],
      height = points[3] - points[1];

    addClass(div, 'croppie-result');
    div.appendChild(img);
    css(img, {
      left: -1 * points[0] + 'px',
      top: -1 * points[1] + 'px'
    });
    img.src = data.url;
    css(div, {
      width: width + 'px',
      height: height + 'px'
    });

    return div;
  }

  // _initRotationControls () {
  //     let wrap, btnLeft, btnRight, iLeft, iRight;

  //     wrap = document.createElement('div');
  //     this.elements.orientationBtnLeft = btnLeft = document.createElement('button');
  //     this.elements.orientationBtnRight = btnRight = document.createElement('button');

  //     wrap.appendChild(btnLeft);
  //     wrap.appendChild(btnRight);

  //     iLeft = document.createElement('i');
  //     iRight = document.createElement('i');
  //     btnLeft.appendChild(iLeft);
  //     btnRight.appendChild(iRight);

  //     addClass(wrap, 'cr-rotate-controls');
  //     addClass(btnLeft, 'cr-rotate-l');
  //     addClass(btnRight, 'cr-rotate-r');

  //     this.elements.boundary.appendChild(wrap);

  //     btnLeft.addEventListener('click', () => {
  //         this.rotate(-90);
  //     });
  //     btnRight.addEventListener('click', () => {
  //         this.rotate(90);
  //     });
  // }

  _getDebouncedOverlay() {
    let timeout: NodeJS.Timeout;
    return () => {
      const later = () => {
        timeout = null;
        this._updateOverlay();
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, 500);
    };
  }

  //#endregion
}
export default Croppie;
