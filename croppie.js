(function ($) {

  function drawImage (img, top, left, width, height, scale, circle) {
      if (scale !== 1) {
        var scaleCanvas = document.createElement('canvas'),
            scaleCtx = scaleCanvas.getContext('2d'),
            scaleW = img.width * scale,
            scaleH = img.height * scale;

        scaleCanvas.width = scaleW;
        scaleCanvas.height = scaleH;
        scaleCtx.drawImage(img, 0, 0, scaleW, scaleH);
        img = scaleCanvas; //draw image takes in canvas as well as image
      }
      
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      if (circle) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, left, top, width, height, 0, 0, width, height);

      return canvas.toDataURL();
  }

  $.croppie = function (container, opts ) {
    this.$container = $(container);
    this.options = $.extend(true, {}, $.croppie.defaults, opts);

    this._create();
  };

  $.croppie.defaults = {
    viewport: {
      width: 100,
      height: 100,
      type: 'square'
    },
    boundary: {
      width: 300,
      height: 300
    },
    customClass: '',
    showZoom: true,
    mouseWheelZoom: true,
    update: $.noop
  };

  $.croppie.generateImage = function (opts) {
    var coords = opts.coords;
    var div = $("<div class='croppie-result' />");
    var img = $("<img />").appendTo(div);
    img.css({
      left: (-1 * coords[0]),
      top: (-1 * coords[1]),
      width: opts.imgWidth,
      height: opts.imgHeight
    }).attr("src", opts.src);

    div.css({
      width: coords[2] - coords[0],
      height: coords[3] - coords[1]
    });
    return div;
  };

  $.croppie.canvasImage = function (opts) {
    var def = $.Deferred(),
        coords = opts.coords;
        width = coords[2] - coords[0],
        height = coords[3] - coords[1],
        imgLoad = loadImage(opts.src);

    imgLoad.done(function (img) {
      var dataUrl = drawImage(img, coords[0], coords[1], width, height, opts.zoom, opts.circle);
      def.resolve(dataUrl);
    });

    return def.promise();
  };

  
  /* Prototype Extensions */
  $.croppie.prototype._create = function () {
    var self = this;
    var contClass = $.trim("croppie-container " + self.options.customClass);
    self.$container.addClass(contClass);
    self.$boundary = $("<div class='cr-boundary' />").appendTo(self.$container).css({
      width: self.options.boundary.width,
      height: self.options.boundary.height
    });
    self.$img = $("<img class='cr-image' />").appendTo(self.$boundary);
    self.$viewport = $("<div class='cr-viewport' />").appendTo(self.$boundary).css({
      width: self.options.viewport.width,
      height: self.options.viewport.height
    });
    self.$viewport.addClass('croppie-vp-' + self.options.viewport.type);
    self.$overlay = $("<div class='cr-overlay' />").appendTo(self.$boundary);
    self._initDraggable();

    if (self.options.showZoom) {
      self._initializeZoom();
    }

    if (self.options.debug) {
      self.$viewport.addClass('debug');
    }
  };

  $.croppie.prototype._initializeZoom = function () {
    var self = this;
    var wrap = $('<div class="cr-slider-wrap" />').appendTo(self.$container);
    var vpRect;
    self.$zoomer = $('<input type="range" class="cr-slider" step="0.01" />').appendTo(wrap);

    function start () {
      self._updateCenterPoint();
      vpRect = self.$viewport[0].getBoundingClientRect();
    }

    function change () {
      self._onZoom({
        value: parseFloat(self.$zoomer.val()),
        vpRect: vpRect
      });
    }

    function scroll (ev) { 
      var delta = ev.originalEvent.deltaY / -1000,
          targetZoom = self._currentZoom + delta;

      ev.preventDefault();
      start();
      self.$zoomer.val(targetZoom);
      change()      
    }

    /*function stop () {
      var m = parseMatrix(self.$img.css('transform')),
          pos = self._getImageRect();

      self.$img.css({
        // transformOrigin: '',
        // transform: matrix(m.scale, pos.left, pos.top)
      });
    }*/

    self.$zoomer.on('mousedown.croppie', start);
    self.$zoomer.on('input.croppie change.croppie', change);
    // self.$zoomer.on('mouseup', stop);

    if (self.options.mouseWheelZoom) {
      self.$boundary.on('mousewheel.croppie', scroll);
    }
    
    self._currentZoom = 1;
  };

  $.croppie.prototype._onZoom = function (ui) {
    var self = this,
        curMatrix = parseMatrix(self.$img.css('transform')),
        vpRect = ui.vpRect,
        imgRect = self._getImageRect(),
        oldZoom = (self._currentZoom || 1) * 1,
        adjY = 0, adjX = 0;

    self._currentZoom = ui.value;

    var origin = self.$img.css('transform-origin').split(' '),
        originX = parseFloat(origin[0]),
        originY = parseFloat(origin[1]),
        difZoom = (oldZoom - ui.value),
        projected = {
          bottom: (originY - imgRect.height) * difZoom + imgRect.bottom,
          left: originX * difZoom + imgRect.left,
          right: (originX - imgRect.width) * difZoom + imgRect.right,
          top: originY * difZoom + imgRect.top
        };
    
    if (vpRect.top < projected.top) {
      adjY = projected.top - vpRect.top;
    } 
    else if (vpRect.bottom > projected.bottom) {
      adjY = projected.bottom - vpRect.bottom;
    }

    if (vpRect.left < projected.left) {
      adjX = projected.left - vpRect.left;
    }
    else if (vpRect.right > projected.right) {
      adjX = projected.right - vpRect.right;
    }

    self.$img.css('transform', getTransformString(ui.value, curMatrix.x - adjX, curMatrix.y - adjY));

    self._updateOverlay();
    self._triggerUpdate();
  };

  $.croppie.prototype._getImageRect = function () {
    var imgRect = this.$img[0].getBoundingClientRect();
        // boundRect = this.$boundary[0].getBoundingClientRect();

    return imgRect; 
    // return $.extend({}, imgRect, {
    //   top: imgRect.top - boundRect.top,
    //   left: imgRect.left - boundRect.left
    // });
  };

  $.croppie.prototype._updateCenterPoint = function () {
    var self = this,
        scale = self._currentZoom,
        data = self.$img[0].getBoundingClientRect(),
        vpData = self.$viewport[0].getBoundingClientRect(),
        parsed = parseMatrix(self.$img.css('transform')),
        previousOrigin = self.$img.css('transform-origin').split(' '),
        pc = {
          left: parseFloat(previousOrigin[0]),
          top: parseFloat(previousOrigin[1])
        },
        top = (vpData.top - data.top) + (vpData.height / 2),
        left = (vpData.left - data.left) + (vpData.width / 2),
        center = {},
        adj = {};

    center.top = top / scale;
    center.left = left / scale;

    adj.top = (center.top - pc.top) * (1 - scale);
    adj.left = (center.left - pc.left) * (1 - scale);

    self.$img.css({
      transformOrigin: center.left + 'px ' + center.top + 'px', 
      transform: getTransformString(parsed.scale, parsed.x - adj.left, parsed.y - adj.top)
    });
  };
  
  $.croppie.prototype._initDraggable = function () {
    var self = this,
        $win = $(window),
        $body = $('body'),
        isDragging = false,
        cssPos = {},
        originalX,
        originalY,
        vpRect;

    function mouseDown(ev) {
      if (isDragging) return;
      isDragging = true;
      originalX = ev.pageX;
      originalY = ev.pageY;
      cssPos = parseTransform(self.$img.css('transform'));
      $win.on('mousemove.croppie', mouseMove);
      $body.css('-webkit-user-select', 'none');
      vpRect = self.$viewport[0].getBoundingClientRect();
    };

    function mouseMove (ev) {
      var deltaX = ev.pageX - originalX,
          deltaY = ev.pageY - originalY,
          imgRect = self._getImageRect(),
          top = cssPos.y + deltaY,
          left = cssPos.x + deltaX;

      if (vpRect.top > imgRect.top + deltaY && vpRect.bottom < imgRect.bottom + deltaY) {
        cssPos.y = top;
      }

      if (vpRect.left > imgRect.left + deltaX && vpRect.right < imgRect.right + deltaX) {
        cssPos.x = left;
      }

      var m = getTransformString(self._currentZoom, cssPos.x, cssPos.y);
      self.$img.css('transform', m);
      self._updateOverlay();
      originalY = ev.pageY;
      originalX = ev.pageX;
    };

    function mouseUp (ev) {
      isDragging = false;
      $win.off('mousemove.croppie');
      $body.css('-webkit-user-select', '');
      self._triggerUpdate();
    }

    self.$overlay.on('mousedown.croppie', mouseDown);
    $win.on('mouseup.croppie', mouseUp);
  };

  $.croppie.prototype._updateOverlay = function () {
    var self = this,
        boundRect = this.$boundary[0].getBoundingClientRect(),
        imgData = self.$img[0].getBoundingClientRect();

    self.$overlay.css({
      width: imgData.width,
      height: imgData.height,
      top: imgData.top - boundRect.top,
      left: imgData.left - boundRect.left
    });
  };

  $.croppie.prototype._triggerUpdate = function () {
    var self = this;
    self.options.update.apply(self.$container, self);
  }

  $.croppie.prototype._updatePropertiesFromImage = function () {
    var self = this;
    var imgData = self._getImageRect();
    self._originalImageWidth = imgData.width;
    self._originalImageHeight = imgData.height;

    if (self.options.showZoom) {
      var minZoom = self.$boundary.width() / imgData.width;
      var maxZoom = 1.5;
      self.$zoomer.attr('min', minZoom);
      self.$zoomer.attr('max', maxZoom);
      self.$zoomer.val(1);
    }

    self._updateOverlay();
  };

  $.croppie.prototype.bind = function (src, cb) {
    var self = this;
    var prom = loadImage(src);
    prom.done(function () {
      self.$img.attr("src", src);
      self._updatePropertiesFromImage();
      self._triggerUpdate();
      if (cb) {
        cb();
      }
    });
  };

  $.croppie.prototype.get = function () {
    var self = this;
    var imgSrc = self.$img.attr('src');
    var imgData = self._getImageRect();
    var vpOff = self.$viewport.offset();
    var imgOff = self.$img.offset();
    var x1 = vpOff.left - imgOff.left;
    var y1 = vpOff.top - imgOff.top;
    var x2 = x1 + self.$viewport.width();
    var y2 = y1 + self.$viewport.height();


    return {
      src: imgSrc,
      imgWidth: imgData.width,
      imgHeight: imgData.height,
      coords: [x1, y1, x2, y2],
      zoom: self._currentZoom,
      circle: self.options.viewport.type === 'circle'
    };
  };
  /* End Prototype Extensions */


  $.fn.croppie = function (opts) {
    var ot = typeof opts;

    if (ot === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);

      if (opts === 'get') {
        var i = $(this).data('croppie');
        return i.get();
      }

      return this.each(function () {
        var i = $(this).data('croppie');
        if (!i) return;

        var method = i[opts];
        if ($.isFunction(method)) {
          method.apply(i, args);
        }
        else {
          throw 'Croppie ' + options + ' method not found';
        }
      });
    }
    else {
      return this.each(function () {
        var i = new $.croppie(this, opts);
        $(this).data('croppie', i);
      });
    }
  };


  /* Utilities */
  function loadImage (src) {
    var img = new Image();
    var def = $.Deferred();

    img.onload = function () {
      def.resolve(img);
    };
    img.src = src;
    return def.promise();
  }

  function num (v) {
    return parseInt(v, 10);
  }

  function parseMatrix (v) {
    var vals = v.substring(7).split(',');
    if (!vals.length || v === 'none') {
      vals = [1, 0, 0, 1, 0, 0];
    }
    return {
      scale: parseFloat(vals[0]),
      x: parseInt(vals[4], 10),
      y: parseInt(vals[5], 10)
    };
  }

  function parseTransform (v) {
    if (v.indexOf('matrix') > -1 || v.indexOf('none') > -1) {
      return parseMatrix(v);
    }

    var values = v.split(') '),
        translate = values[0].substring(10).split(','),
        scale = values[1].substring(6);

    return {
      scale: parseFloat(scale),
      x: parseFloat(translate[0]),
      y: parseFloat(translate[1])
    };
  }

  function getTransformString(scale, x, y) {
    return 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
  }

  function matrix(scale, x, y) {
    return 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + x + ', ' + y + ')';
  }

})($);