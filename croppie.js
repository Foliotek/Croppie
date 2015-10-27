(function ($) {

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

  /* Prototype Extensions */
  $.croppie.prototype._create = function () {
    var self = this;
    var contClass = $.trim('croppie-container ' + self.options.customClass);
    self.$container.addClass(contClass);
    self.$boundary = $('<div class="cr-boundary" />').appendTo(self.$container).css({
      width: self.options.boundary.width,
      height: self.options.boundary.height
    });
    self.$img = $('<img class="cr-image" />').appendTo(self.$boundary);
    self.$viewport = $('<div class="cr-viewport" />').appendTo(self.$boundary).css({
      width: self.options.viewport.width,
      height: self.options.viewport.height
    });
    self.$viewport.addClass('croppie-vp-' + self.options.viewport.type);
    self.$overlay = $('<div class="cr-overlay" />').appendTo(self.$boundary);
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
    var origin, viewportRect;
    self.$zoomer = $('<input type="range" class="cr-slider" step="0.01" />').appendTo(wrap);

    function start () {
      self._updateCenterPoint();
      var oArray = self.$img.css('transform-origin').split(' ');
      origin = {
        x: parseFloat(oArray[0]),
        y: parseFloat(oArray[1])
      };

      viewportRect = self.$viewport[0].getBoundingClientRect();
    }

    function change () {
      self._onZoom({
        value: parseFloat(self.$zoomer.val()),
        origin: origin,
        viewportRect: viewportRect
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

    self.$zoomer.on('mousedown.croppie', start);
    self.$zoomer.on('input.croppie change.croppie', change);
    self.$zoomer.on('manualchange.croppie', function () {
      start();
      change();
    });

    if (self.options.mouseWheelZoom) {
      self.$boundary.on('mousewheel.croppie', scroll);
    }
    
    self._currentZoom = 1;
  };

  $.croppie.prototype._onZoom = function (ui) {
    var self = this,
        transform = Transform.parse(self.$img.css('transform')),
        vpRect = ui.viewportRect,
        origin = ui.origin;

    self._currentZoom = ui.value;
    transform.scale = self._currentZoom;

    var boundaries = self._getVirtualBoundaries(vpRect),
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

    self.$img.css({
      transformOrigin: origin.x + 'px ' + origin.y + 'px',
      transform:  transform.toString()
    });
    
    self._updateOverlay();
    self._triggerUpdate();
  };

  $.croppie.prototype._getVirtualBoundaries = function (vpRect) {
    var self = this,
        scale = self._currentZoom,
        vpWidth = vpRect.width,
        vpHeight = vpRect.height,
        centerFromBoundaryX = self.options.boundary.width / 2,
        centerFromBoundaryY = self.options.boundary.height / 2,
        originalImgWidth = self._originalImageWidth,
        originalImgHeight = self._originalImageHeight,
        curImgWidth = originalImgWidth * scale,
        curImgHeight = originalImgHeight * scale,
        halfWidth = vpWidth / 2,
        halfHeight = vpHeight / 2;


    var maxX = ((halfWidth / scale) - centerFromBoundaryX) * -1;
    var minX = maxX - ((curImgWidth * (1 / scale)) - (vpWidth * (1 / scale)));

    var maxY = ((halfHeight / scale) - centerFromBoundaryY) * -1;
    var minY = maxY - ((curImgHeight * (1 / scale)) - (vpHeight * (1 / scale)));

    var originMinX = (1 / scale) * halfWidth;
    var originMaxX = (curImgWidth * (1 / scale)) - originMinX;

    var originMinY = (1 / scale) * halfHeight;
    var originMaxY = (curImgHeight * (1 / scale)) - originMinY;

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

  $.croppie.prototype._getImageRect = function () {
    return this.$img[0].getBoundingClientRect();
  };

  $.croppie.prototype._updateCenterPoint = function () {
    var self = this,
        scale = self._currentZoom,
        data = self.$img[0].getBoundingClientRect(),
        vpData = self.$viewport[0].getBoundingClientRect(),
        transform = Transform.parse(self.$img.css('transform')),
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

    transform.x -= adj.left;
    transform.y -= adj.top;
    self.$img.css({
      transformOrigin: center.left + 'px ' + center.top + 'px', 
      transform: transform.toString()
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
        scrollers,
        vpRect;

    function mouseDown(ev) {
      if (isDragging) return;
      isDragging = true;
      originalX = ev.pageX;
      originalY = ev.pageY;
      transform = Transform.parse(self.$img.css('transform'));
      $win.on('mousemove.croppie', mouseMove);
      $win.on('mouseup.croppie', mouseUp);
      $body.css('-webkit-user-select', 'none');
      vpRect = self.$viewport[0].getBoundingClientRect();
      scrollers = disableScrollableParents();
    };

    function disableScrollableParents() {
      var scrollers = self.$container.parents().filter(function() {
        var el = this,
            $el = $(this),
            testRx = /scroll|auto/i,
            vertScroll, horizScroll;

        if (($el.css('overflow') + $el.css('overflowX') + $el.css('overflowY')).indexOf('scroll') >= 0) 
          return true;

        vertScroll = (el.clientHeight < el.scrollHeight) && ($el.css('overflowY') + $el.css('overflow')).match(testRx);

        if (vertScroll) 
          return true;

        horizScroll = (el.clientWidth < el.scrollWidth) && ($el.css('overflowY') + $el.css('overflow')).match(testRx);
        
        return horizScroll;
      });

      scrollers.each(function() {
        var $el = $(this);
        $el.data('croppieScrollTopStart', $el.scrollTop());
        $el.data('croppieScrollLeftStart', $el.scrollLeft());
      });

      scrollers.on('scroll.croppie', function(ev) {
        var $el = $(ev.currentTarget);
        $el.scrollTop($el.data('croppieScrollTopStart'));
        $el.scrollLeft($el.data('croppieScrollLeftStart'));
      })

      
      var docScrollTopStart = $(document).scrollTop();
      var docScrollLeftStart = $(document).scrollLeft();
      $(document).on('scroll.croppie', function() {
        $(document).scrollTop(docScrollTopStart);
        $(document).scrollLeft(docScrollLeftStart);
      });

      return scrollers;
    }

    function mouseMove (ev) {
      var deltaX = ev.pageX - originalX,
          deltaY = ev.pageY - originalY,
          imgRect = self._getImageRect(),
          top = transform.y + deltaY,
          left = transform.x + deltaX;

      if (vpRect.top > imgRect.top + deltaY && vpRect.bottom < imgRect.bottom + deltaY) {
        transform.y = top;
      }

      if (vpRect.left > imgRect.left + deltaX && vpRect.right < imgRect.right + deltaX) {
        transform.x = left;
      }

      self.$img.css('transform', transform.toString());
      self._updateOverlay();
      originalY = ev.pageY;
      originalX = ev.pageX;
    };

    function mouseUp (ev) {
      isDragging = false;
      $win.off('mousemove.croppie mouseup.croppie');
      scrollers.off('scroll.croppie');
      $(document).off('scroll.croppie');
      $body.css('-webkit-user-select', '');
      self._updateCenterPoint();
      self._triggerUpdate();
    }

    self.$overlay.on('mousedown.croppie', mouseDown);
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

  $.croppie.prototype._bindPoints = function (points) {
    if (points.length != 4) {
      throw "Croppie - Invalid number of points supplied";
    }
    var self = this,
        pointsWidth = points[2] - points[0],
        pointsHeight = points[3] - points[1],
        vpData = self.$viewport[0].getBoundingClientRect(),
        boundRect = self.$boundary[0].getBoundingClientRect(),
        vpOffset = {
          left: vpData.left - boundRect.left,
          top: vpData.top - boundRect.top
        },
        scale = vpData.width / pointsWidth,
        originTop = points[1],
        originLeft = points[0],
        transformTop = (-1 * points[1]) + vpOffset.top,
        transformLeft = (-1 * points[0]) + vpOffset.left;

    log(vpOffset, originTop, originLeft, transformTop, transformLeft);
    self.$img.css('transform-origin', originLeft + 'px ' + originTop + 'px');
    self.$img.css('transform', new Transform(transformLeft, transformTop, scale).toString());
    self.$zoomer.val(scale);
    self._currentZoom = scale;
  };

  $.croppie.prototype.bind = function (options, cb) {
    var self = this,
        src,
        points = [];

    if (typeof(options) === 'string') {
      src = options;
      options = {};
    }
    else {
      src = options.src;
      points = options.points;
    }

    var prom = loadImage(src);
    prom.done(function () {
      self.$img.attr('src', src);
      self._updatePropertiesFromImage();
      if (points.length) {
        self._bindPoints(points);
      }
      self._triggerUpdate();
      if (cb) {
        cb();
      }
    });
  };

  $.croppie.prototype.get = function () {
    var self = this,
        imgSrc = self.$img.attr('src'),
        imgData = self._getImageRect(),
        vpData = self.$viewport[0].getBoundingClientRect(),
        x1 = vpData.left - imgData.left,
        y1 = vpData.top - imgData.top,
        x2 = x1 + vpData.width,
        y2 = y1 + vpData.height,
        scale = self._currentZoom;

    x1 /= scale;
    x2 /= scale;
    y1 /= scale;
    y2 /= scale;

    return {
      src: imgSrc,
      imgWidth: imgData.width,
      imgHeight: imgData.height,
      coords: [x1, y1, x2, y2],
      zoom: scale,
      circle: self.options.viewport.type === 'circle'
    };
  };

  $.croppie.prototype.result = function (type) {
    type = type || 'html';
    var data = this.get(),
        def = $.Deferred();

    if (type === 'canvas') {
      loadImage(data.src).done(function (img) {
        def.resolve(getCanvasImage(img, data));
      });
    }
    else {
      def.resolve(getHtmlImage(data));
    }
    return def.promise();
  }
  /* End Prototype Extensions */

  $.fn.croppie = function (opts) {
    var ot = typeof opts;

    if (ot === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);
      var singleInst = $(this).data('croppie');

      if (opts === 'get') {
        return singleInst.get();
      }
      else if (opts === 'result') {
        return singleInst.result.apply(singleInst, args);
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

  /* Image Drawing Functions */
  function getHtmlImage(data) {
      var coords = data.coords,
          div = $('<div class="croppie-result" />'),
          img = $('<img />').appendTo(div),
          width = coords[2] - coords[0],
          height = coords[3] - coords[1],
          scale = data.zoom;

      img.css({
        left: (-1 * coords[0]),
        top: (-1 * coords[1]),
      }).attr('src', data.src);

      div.css({
        width: width,
        height: height
      });
      return div;
  }

  function getCanvasImage(img, data) {
      var coords = data.coords,
          scale = data.zoom,
          left = coords[0],
          top = coords[1],
          width = (coords[2] - coords[0]),
          height = (coords[3] - coords[1]),
          circle = data.circle;

      var canvas = document.createElement('canvas');
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

  /* CSS Transform Prototype */
  var Transform = function (x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  };

  Transform.parse = function (v) {
    if (v.indexOf('matrix') > -1 || v.indexOf('none') > -1) {
      return Transform.fromMatrix(v);
    }
    else {
      return Transform.fromString(v);
    }
  };

  Transform.fromMatrix = function (v) {
    var vals = v.substring(7).split(',');
    if (!vals.length || v === 'none') {
      vals = [1, 0, 0, 1, 0, 0];
    }

    return new Transform(parseInt(vals[4], 10), parseInt(vals[5], 10), parseFloat(vals[0]));
  };

  Transform.fromString = function (v) {
    var values = v.split(') '),
        translate = values[0].substring(10).split(','),
        scale = values[1].substring(6);

    return new Transform(translate[0], translate[1], parseFloat(scale));
  }

  Transform.prototype.toString = function () {
    return 'translate(' + this.x + 'px, ' + this.y + 'px) scale(' + this.scale + ')';
  };

})($);