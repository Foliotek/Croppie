var Demo = (function() {

	function output(html) {
		var existing = $("#result .imagecropper-result");
		if (existing.length > 0) {
			existing.replaceWith(html);
		}
		else {
			$("#result").append(html);
		}
	}

	function init() {
		var dbgr = $("#dbgr");
		var debug = true;
		dbgr.toggle(debug);
		var cont = $("#container").imageCropper({
			viewportWidth: 150,
			viewportHeight: 200,
			debug: debug,
			update: function (cropper) {
				var data = $(this).imageCropper("get");
				output($.imageCropper.generateImage(data));

				// if (debug) {
				// 	var i = $(this).find(".ic-image");
				// 	dbgr.css({
				// 		top: i.offset().top,
				// 		left: i.offset().left,
				// 		width: i.width(),
				// 		height: i.height(),
				// 		zIndex: -1
				// 	});
				// }
			}
		});
		cont.imageCropper("bind", "demo/cat.jpg");
	}

	return {
		init: init
	};
})();


// Full version of `log` that:
//  * Prevents errors on console methods when no console present.
//  * Exposes a global 'log' function that preserves line numbering and formatting.
(function () {
  var method;
  var noop = function () { };
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});
 
  while (length--) {
    method = methods[length];
 
    // Only stub undefined methods.
    if (!console[method]) {
        console[method] = noop;
    }
  }
 
 
  if (Function.prototype.bind) {
    window.log = Function.prototype.bind.call(console.log, console);
  }
  else {
    window.log = function() { 
      Function.prototype.apply.call(console.log, console, arguments);
    };
  }
})();