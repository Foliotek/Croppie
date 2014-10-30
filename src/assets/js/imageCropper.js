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
    self._initializeJQUI();

    if (self.options.showZoom) {
      self._initializeZoom();
    }
  };

  $.imageCropper.prototype._initializeZoom = function () {
    var self = this;
    self.$zoomer = $("<div class='ic-slider' />").appendTo(self.$container);
    self.$zoomer.slider({
      animate: true,
      step: 0.01
    });
    self.$zoomer.on('slide', function (e, ui) {
      self._onZoom(ui);
    });
  };

  $.imageCropper.prototype._keepWithinBoundaries = function () {
    var self = this,
        imgWidth = self.$img.width(),
        imgHeight = self.$img.height(),
        curPos = self.$img.position(),
        minLeft = (self.$boundary.width() - self.$viewport.width()) / 2,
        minTop = (self.$boundary.height() - self.$viewport.height()) / 2,
        maxLeft = minLeft + self.$viewport.width() - imgWidth,
        maxTop = minTop + self.$viewport.height() - imgHeight;

    self.$img.css({
      left: Math.max(Math.min(minLeft, curPos.left), maxLeft),
      top: Math.max(Math.min(minTop, curPos.top), maxTop)
    })
  };

  $.imageCropper.prototype._onZoom = function (ui) {
    var self = this;
    var prevWidth = self.$img.width(),
        prevHeight = self.$img.height(),
        newWidth = num(self._originalImageWidth * ui.value),
        newHeight = num(self._originalImageHeight * ui.value);

    // TODO ... we may need to cache the center point here.  Not exactly sure.

    // my attempt at centering
    // var curPos = self.$img.position(),
    //     newLeft = num(curPos.left + ((prevWidth - newWidth) / 4)),
    //     newTop = num(curPos.top + ((prevHeight - newHeight) / 4));

    self.$img.css({
      width: newWidth,
      height: newHeight,
      // left: newLeft,
      // top: newTop
    });

    self._currentZoom = ui.value;
    self._updateContainment();
    self._keepWithinBoundaries();

    // TODO update top and left of image to keep it centered on the point it was before adjusting the width and height

    self._triggerUpdate();
  };

  $.imageCropper.prototype._initializeJQUI = function () {
    var self = this;
    self.$overlay.draggable({
      drag: function (e, ui) {
        self.$img.css(ui.position);
      },
      stop: function (e, ui) {
        self._triggerUpdate();
      }
    });
  };

  $.imageCropper.prototype._triggerUpdate = function () {
    var self = this;
    self.options.update.apply(self.$container, self);
  }

  $.imageCropper.prototype._updateContainment = function () {
    var self = this;
    var vpPos = self.$viewport.offset();
    var x1 = vpPos.left + self.$viewport.outerWidth() - self.$img.width();
    var y1 = vpPos.top + self.$viewport.outerHeight() - self.$img.height();
    var x2 = x1 + self.$img.width() - self.$viewport.outerWidth();
    var y2 = y1 + self.$img.height() - self.$viewport.outerHeight();

    var imgPos = self.$img.position();
    self.$overlay.css({
      width: self.$img.width(),
      height: self.$img.height(),
      top: imgPos.top,
      left: imgPos.left
    });

    var containment = [x1, y1, x2, y2];
    self.$overlay.draggable("option", "containment", containment);
    return containment;
  };

  $.imageCropper.prototype._updatePropertiesFromImage = function () {
    var self = this;
    self._originalImageWidth = self.$img.width();
    self._originalImageHeight = self.$img.height();

    if (self.options.showZoom) {
      var minZoom = self.$boundary.width() / self.$img.width();
      var maxZoom = 1.5;
      self.$zoomer.slider("option", "min", minZoom);
      self.$zoomer.slider("option", "max", maxZoom);
      self.$zoomer.slider("value", 1);
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
    var vpOff = self.$viewport.offset();
    var imgOff = self.$img.offset();
    var x1 = vpOff.left - imgOff.left;
    var y1 = vpOff.top - imgOff.top;
    var x2 = x1 + self.$viewport.width();
    var y2 = y1 + self.$viewport.height();


    return {
      src: imgSrc,
      imgWidth: self.$img.width(),
      imgHeight: self.$img.height(),
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


})($);