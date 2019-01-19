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
        var img = new Image();
        img.src = result.src;
		swal({
			title: '',
			content: img,
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
			},
			boundary: {
				width: 300,
				height: 300
			},
			// url: 'demo/demo-1.jpg',
			// enforceBoundary: false
			// mouseWheelZoom: false
		});
		mc.on('update.croppie', function (ev, data) {
			// console.log('jquery update', ev, data);
		});
		$('.js-main-image').on('click', function (ev) {
            mc.croppie('result', {
				type: 'rawcanvas',
				circle: true,
				// size: { width: 300, height: 300 },
            	format: 'png'
            }).then(function (canvas) {
				popupResult({
					src: canvas.toDataURL()
				});
			});
		});
	}

	function demoBasic() {
		var $w = $('.basic-width'),
			$h = $('.basic-height'),
			basic = $('#demo-basic').croppie({
			viewport: {
				width: 150,
				height: 200
			},
			boundary: {
				width: 300,
				height: 300
			}
		});
		basic.croppie('bind', {
			url: 'demo/cat.jpg',
			points: [77,469,280,739]
		});

		$('.basic-result').on('click', function() {
			var w = parseInt($w.val(), 10),
				h = parseInt($h.val(), 10),s
				size = 'viewport';
			if (w || h) {
				size = { width: w, height: h };
			}
			basic.croppie('result', {
				type: 'canvas',
				size: size,
				resultSize: {
					width: 50,
					height: 50
				}
			}).then(function (resp) {
				popupResult({
					src: resp
				});
			});
		});
	}

	function demoVanilla() {
		var vEl = document.getElementById('vanilla-demo'),
			vanilla = new Croppie(vEl, {
			viewport: { width: 200, height: 100 },
			boundary: { width: 300, height: 300 },
			// showZoomer: false,
            enableOrientation: true
        });
        window.vanilla = vanilla;
		vanilla.bind({
            url: 'demo/demo-2.jpg',
            orientation: 4,
            zoom: 0
        });
        vEl.addEventListener('update', function (ev) {
        	// console.log('vanilla update', ev);
        });
		document.querySelector('.vanilla-result').addEventListener('click', function (ev) {
			vanilla.result({
				type: 'blob'
			}).then(function (blob) {
                console.log(window.URL.createObjectURL(blob));
                popupResult({
					src: window.URL.createObjectURL(blob)
				});
			}).catch(console.error);
		});

		$('.vanilla-rotate').on('click', function(ev) {
			vanilla.rotate(parseInt($(this).data('deg')));
		});
	}

    function demoResizer() {
		var vEl = document.getElementById('resizer-demo'),
			resize = new Croppie(vEl, {
			viewport: { width: 100, height: 100 },
			boundary: { width: 300, height: 300 },
			showZoomer: false,
            enableResize: true,
            enableOrientation: true,
            mouseWheelZoom: 'ctrl'
		});
		resize.bind({
            url: 'demo/demo-2.jpg',
            zoom: 0
        });
        vEl.addEventListener('update', function (ev) {
        	console.log('resize update', ev);
        });
		document.querySelector('.resizer-result').addEventListener('click', function (ev) {
			resize.result({
				type: 'blob'
			}).then(function (blob) {
				popupResult({
					src: window.URL.createObjectURL(blob)
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
					$('.upload-demo').addClass('ready');
	            	$uploadCrop.croppie('bind', {
	            		url: e.target.result
	            	}).then(function(){
	            		console.log('jQuery bind complete');
	            	});

	            }

	            reader.readAsDataURL(input.files[0]);
	        }
	        else {
		        swal("Sorry - you're browser doesn't support the FileReader API");
		    }
		}

		$uploadCrop = $('#upload-demo').croppie({
			viewport: {
				width: 100,
				height: 100,
				type: 'circle'
			},
			enableExif: true
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
		var $html = $('html');
		$('nav a').on('click', function (ev) {
			var lnk = $(ev.currentTarget),
				href = lnk.attr('href'),
				targetTop = $('a[name=' + href.substring(1) + ']').offset().top;

			$html.animate({ scrollTop: targetTop });
			ev.preventDefault();
		});
	}

	function init() {
		// bindNavigation();
		// demoMain();
		// demoBasic();
		demoVanilla();
		demoResizer();
		// demoUpload();
		// demoHidden();
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
