var Demo = (function() {

	function output(node) {
		var existing = $('#result .croppie-result');
		if (existing.length > 0) {
			existing[0].parentNode.replaceChild(node, existing[0]);
		}
		else {
			$('#result')[0].appendChild(node);
		}
	}

	function popupResult(result) {
		var html;
		if (result.html) {
			html = result.html;
		}
		if (result.src) {
			html = '<img src="' + result.src + '" />';
		}
		swal({
			title: '',
			html: true,
			text: html,
			allowOutsideClick: true
		});
		setTimeout(function(){
			$('.sweet-alert').css('margin', function() {
				var top = -1 * ($(this).height() / 2),
					left = -1 * ($(this).width() / 2);

				return top + 'px 0 0 ' + left + 'px';
			});
		}, 1);
	}

	function demoMain () {
		var mc = $('#cropper-1');
		mc.croppie({
			viewport: {
				width: 150,
				height: 150,
				type: 'circle'
			}
			// mouseWheelZoom: false
		});
		mc.croppie('bind', 'demo/demo-1.jpg');
		$('.js-main-image').on('click', function (ev) {
            mc.croppie('result', 'canvas').then(function (resp) {
				popupResult({
					src: resp
				});
			});
		});
	}

	function demoBasic() {
		var basic = $('#demo-basic').croppie({
			viewport: {
				width: 150,
				height: 200
			}
		});
		basic.croppie('bind', {
			url: 'demo/cat.jpg',
			points: [77,469,280,739]
		});
		$('.basic-result').on('click', function() {
			basic.croppie('result', 'html').then(function (resp) {
				popupResult({
					html: resp.outerHTML
				});
			});
		});
	}

	function demoVanilla() {
		var vanilla = new Croppie(document.getElementById('vanilla-demo'), {
			viewport: { width: 100, height: 100 },
			boundary: { width: 300, height: 300 },
			showZoomer: false
		});
		vanilla.bind('demo/demo-2.jpg');
		document.querySelector('.vanilla-result').addEventListener('click', function (ev) {
			vanilla.result('canvas').then(function (src) {
				popupResult({
					src: src
				});
			});
		});
	}

	function demoUpload() {
		var $uploadCrop;

		function readFile(input) {
 			if (input.files && input.files[0]) {
	            var reader = new FileReader();
	            
	            reader.onload = function (e) {
	            	$uploadCrop.croppie('bind', {
	            		url: e.target.result
	            	});
	            	$('.upload-demo').addClass('ready');
	            }
	            
	            reader.readAsDataURL(input.files[0]);
	        }
	        else {
		        swal("Sorry - you're browser doesn't support the FileReader API");
		    }
		}

		$uploadCrop = $('#upload-demo').croppie({
			viewport: {
				width: 200,
				height: 200,
				type: 'square'
			},
			boundary: {
				width: 300,
				height: 300
			},
			zoomer: {
				maxZoom: 1
			}
		});

		$('#upload').on('change', function () { readFile(this); });
		$('.upload-result').on('click', function (ev) {
			$uploadCrop.croppie('result', {
				type: 'canvas',
				size: 'viewport'
			}).then(function (resp) {
				popupResult({
					src: resp
				});
			});
		});
	}

	function demoHidden() {
		var $hid = $('#hidden-demo');

		$hid.croppie({
			viewport: {
				width: 175,
				height: 175,
				type: 'circle'
			},
			boundary: {
				width: 200,
				height: 200
			}
		});
		$hid.croppie('bind', 'demo/demo-3.jpg');
		$('.show-hidden').on('click', function () {
			$hid.toggle();
			$hid.croppie('bind');
		});
	}

	function bindNavigation () {
		var $body = $('body');
		$('nav a').on('click', function (ev) {
			var lnk = $(ev.currentTarget),
				href = lnk.attr('href'),
				targetTop = $('a[name=' + href.substring(1) + ']').offset().top;

			$body.animate({ scrollTop: targetTop });
			ev.preventDefault();
		});
	}

	function init() {
		bindNavigation();
		demoMain();
		demoBasic();	
		demoVanilla();	
		demoUpload();
		demoHidden();
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