function output(html) {
	var existing = $("#result .imagecropper-result");
	if (existing.length > 0) {
		existing.replaceWith(html);
	}
	else {
		$("#result").append(html);
	}
}

var cont = $("#container").imageCropper({
	viewportWidth: 150,
	viewportHeight: 200,
	update: function (cropper) {
		var data = $(this).imageCropper("get");
		output($.imageCropper.generateImage(data));

		// $.imageCropper.canvasImage(data).done(function (img) {
		// 	$("#result").append(img);
		// });
	}
});
cont.imageCropper("bind", "cat.jpg");