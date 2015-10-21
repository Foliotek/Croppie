var Demo = {
	output: function (html) {
		var existing = $("#result .imagecropper-result");
		if (existing.length > 0) {
			existing.replaceWith(html);
		}
		else {
			$("#result").append(html);
		}
	},

	init: function () {
		var dbgr = $("#dbgr");
		var debug = true;
		dbgr.toggle(debug);
		var cont = $("#container").imageCropper({
			viewportWidth: 150,
			viewportHeight: 200,
			debug: debug,
			update: function (cropper) {
				var data = $(this).imageCropper("get");
				Demo.output($.imageCropper.generateImage(data));

				if (debug) {
					var i = $(this).find(".ic-image");
					dbgr.css({
						top: i.offset().top,
						left: i.offset().left,
						width: i.width(),
						height: i.height()
					});
				}
			}
		});
		cont.imageCropper("bind", "cat.jpg");
	}
};
