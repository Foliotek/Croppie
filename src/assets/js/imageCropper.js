(function ($) {

  var pre = "imagecropper-";
  $.imageCropper = function (container, opts ) {
    this.$container = $(container);
    this.options = $.extend({}, $.imageCropper.defaults, opts);

    this._create();
  };

  $.imageCropper.generateImage = function (opts) {
    var coords = opts.coords;
    var div = $("<div class='imagecropper-result' />");
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
    return div.wrapAll("<div></div>").parent().clone();
  };

  $.imageCropper.canvasImage = function (opts) {
    var def = $.Deferred();
    var coords = opts.coords;
    var prom = loadImage(opts.src);
    prom.done(function (img) {
      var canvas = document.createElement("canvas");
      var tarWidth = coords[2] - coords[0];
      var tarHeight = coords[3] - coords[1];
      canvas.width = tarWidth;
      canvas.height = tarHeight;
      var context = canvas.getContext('2d');
      context.drawImage(img, coords[0], coords[1], tarWidth, tarHeight);
      def.resolve("<img src='" + canvas.toDataURL() +"' />");
    });

    return def.promise();
  };

  $.imageCropper.defaults = {
    viewportWidth: 100,
    viewportHeight: 100,
    boundaryWidth: 300,
    boundaryHeight: 300,
    customClass: '',
    update: $.noop,
    showZoom: true
  };
  
  /* Prototype Extensions */
  $.imageCropper.prototype._create = function () {
    var self = this;
    var contClass = $.trim("imagecropper-container " + self.options.customClass);
    self.$container.addClass(contClass);
    self.$boundary = $("<div class='ic-boundary' />").appendTo(self.$container).css({
      width: self.options.boundaryWidth,
      height: self.options.boundaryHeight
    });
    self.$img = $("<img class='ic-image' />").appendTo(self.$boundary);
    self.$viewport = $("<div class='ic-viewport' />").appendTo(self.$boundary).css({
      width: self.options.viewportWidth,
      height: self.options.viewportHeight
    })
    self.$overlay = $("<div class='ic-overlay' />").appendTo(self.$boundary);
    self._initDraggable();

    if (self.options.showZoom) {
      self._initializeZoom();
    }

    if (self.options.debug) {
      self.$viewport.addClass('debug');
    }
  };

  $.imageCropper.prototype._initializeZoom = function () {
    var self = this;
    var wrap = $('<div class="ic-slider-wrap" />').appendTo(self.$container);
    self.$zoomer = $('<input type="range" class="ic-slider" step="0.01" />').appendTo(wrap);

    function start () {
      self._updateCenterPoint();
    }

    function change () {
      self._onZoom({
        value: parseFloat(self.$zoomer.val())
      });
    }

    function stop () {
      var m = parseMatrix(self.$img.css('transform')),
          pos = self._getImageRect();

      self.$img.css({
        // transformOrigin: '',
        // transform: matrix(m.scale, pos.left, pos.top)
      });
    }

    self.$zoomer.on('mousedown', start);
    self.$zoomer.on('input', change);
    self.$zoomer.on('change mouseup', stop);
    
    self._currentZoom = 1;
  };

  $.imageCropper.prototype._onZoom = function (ui) {
    var self = this,
        curMatrix = parseMatrix(self.$img.css('transform'));

    self._currentZoom = ui.value;
    self.$img.css('transform', getTransformString(ui.value, curMatrix.x, curMatrix.y));
    self._updateContainment();
    
    self._triggerUpdate();
  };

  $.imageCropper.prototype._getImageRect = function () {
    var imgRect = this.$img[0].getBoundingClientRect();
        // boundRect = this.$boundary[0].getBoundingClientRect();

    return imgRect; 
    // return $.extend({}, imgRect, {
    //   top: imgRect.top - boundRect.top,
    //   left: imgRect.left - boundRect.left
    // });
  };

  $.imageCropper.prototype._updateCenterPoint = function () {
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
    log('===========');
    log("center", center);
    log("pc", pc);
    log("parsed", parsed);
    log("adj", adj);
    log("scale", scale);
    log(getTransformString(parsed.scale, parsed.x - adj.left, parsed.y - adj.top));
    log('===========');
    self.$img.css({
      transformOrigin: center.left + 'px ' + center.top + 'px', 
      transform: getTransformString(parsed.scale, parsed.x - adj.left, parsed.y - adj.top)
    });
  };
  
  $.imageCropper.prototype._initDraggable = function () {
    var self = this,
        $win = $(window),
        $body = $('body'),
        isDragging = false,
        cssChange = {},
        cssStart,
        originalX,
        originalY,
        contain,
        vpRect;

    function mouseDown(ev) {
      if (isDragging) return;
      self._updateContainment();
      isDragging = true;
      originalX = ev.pageX;
      originalY = ev.pageY;
      cssStart = parseTransform(self.$img.css('transform'));
      // cssStart = self._getImageRect();
      // cssStart = self.$img[0].getBoundingClientRect();
      contain = self._dragContainment;
      $win.on('mousemove.cropper', mouseMove);
      $win.on('mouseup.cropper', mouseUp);
      $body.css('-webkit-user-select', 'none');
      vpRect = self.$viewport[0].getBoundingClientRect();
    };

    function mouseMove (ev) {
      var x = ev.pageX - originalX,
          y = ev.pageY - originalY,
          top = cssStart.y + y,
          left = cssStart.x + x,
          imgRect = self._getImageRect();

      if (vpRect.top >= imgRect.top && vpRect.bottom <= imgRect.bottom) {
        cssChange.top = top;
      }

      if (vpRect.left >= imgRect.left && vpRect.right <= imgRect.right) {
        cssChange.left = left;
      }

      // if (top <= contain.bottom && top >= contain.top) {
      //   cssChange.top = top;
      // }
      // if (left <= contain.right && left >= contain.left) {
      //   cssChange.left = left;
      // }
      
      var m = getTransformString(self._currentZoom, cssChange.left, cssChange.top);
      self.$img.css('transform', m);
      self._updateContainment();
    };

    function mouseUp (ev) {
      isDragging = false;
      // self._updateCenterPoint()
      $win.off('mousemove.cropper');
      $body.css('-webkit-user-select', '');
      self._triggerUpdate();
    }

    self.$overlay.on('mousedown.cropper', mouseDown);
  };

  $.imageCropper.prototype._updateContainment = function () {
    var self = this,
        boundRect = this.$boundary[0].getBoundingClientRect(),
        vpPos = self.$viewport[0].getBoundingClientRect(),
        imgData = self._getImageRect(),
        top = vpPos.bottom - imgData.height,
        bottom = vpPos.top,
        right = vpPos.left,
        left = vpPos.right - imgData.width;

    self.$overlay.css({
      width: imgData.width,
      height: imgData.height,
      top: imgData.top - boundRect.top,
      left: imgData.left - boundRect.left
    });

    self._dragContainment = {
      top: top,
      left: left,
      bottom: bottom,
      right: right
    };
  };

  $.imageCropper.prototype._triggerUpdate = function () {
    var self = this;
    self.options.update.apply(self.$container, self);
  }

  $.imageCropper.prototype._updatePropertiesFromImage = function () {
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

    self._updateContainment();
  };

  $.imageCropper.prototype.bind = function (src, cb) {
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

  $.imageCropper.prototype.get = function () {
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
      zoom: self._currentZoom
    };
  };
  /* End Prototype Extensions */


  $.fn.imageCropper = function (opts) {
    var ot = typeof opts;

    if (ot === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);

      if (opts === 'get') {
        var i = $(this).data('imageCropper');
        return i.get();
      }

      return this.each(function () {
        var i = $(this).data('imageCropper');
        if (!i) return;

        var method = i[opts];
        if ($.isFunction(method)) {
          method.apply(i, args);
        }
        else {
          throw 'Image Cropper ' + options + ' method not found';
        }
      });
    }
    else {
      return this.each(function () {
        var i = new $.imageCropper(this, opts);
        $(this).data('imageCropper', i);
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