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
		cont.imageCropper("bind", "cat.jpg");
	}

	return {
		init: init
	};
})();