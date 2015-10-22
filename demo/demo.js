var Demo = (function() {

	function output(html) {
		var existing = $('#result .croppie-result');
		if (existing.length > 0) {
			existing.replaceWith(html);
		}
		else {
			$('#result').append(html);
		}
	}

	function mainCropper () {
		var mc = $('#cropper-1');
		mc.croppie({
			viewport: {
				width: 150,
				height: 150,
				type: 'circle'
			},
			// mouseWheelZoom: false
		});
		mc.croppie('bind', 'demo/demo-1.jpg');
		$('.js-main-image').on('click', function (ev){
			var data = mc.croppie('get');
			$.croppie.canvasImage(data).done(function (resp){
				window.open(resp);
			});
		});
	}

	function demoBasic() {
		var cont = $('#demo-basic').croppie({
			viewport: {
				width: 150,
				height: 200
			},
			update: function (cropper) {
				var data = $(this).croppie('get');
				output($.croppie.generateImage(data));
			}
		});
		cont.croppie('bind', 'demo/cat.jpg');
	}

	function init() {
		mainCropper();
		demoBasic();		
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