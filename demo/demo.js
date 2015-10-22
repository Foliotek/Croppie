var Demo = (function() {

	function output(html) {
		var existing = $('#result .imagecropper-result');
		if (existing.length > 0) {
			existing.replaceWith(html);
		}
		else {
			$('#result').append(html);
		}
	}

	function mainCropper () {
		var mc = $('#cropper-1');
		mc.imageCropper({
			viewport: {
				width: 150,
				height: 150,
				type: 'circle'
			}
		});
		mc.imageCropper('bind', 'demo/demo-1.jpg');
	}

	function demoBasic() {
		var cont = $('#demo-basic').imageCropper({
			viewport: {
				width: 150,
				height: 200
			},
			update: function (cropper) {
				var data = $(this).imageCropper('get');
				output($.imageCropper.generateImage(data));
			}
		});
		cont.imageCropper('bind', 'demo/cat.jpg');
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