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
		var cont = $("#container").imageCropper({
			viewportWidth: 150,
			viewportHeight: 200,
			update: function (cropper) {
				var data = $(this).imageCropper("get");
				Demo.output($.imageCropper.generateImage(data));
			}
		});
		cont.imageCropper("bind", "cat.jpg");
	}
};
