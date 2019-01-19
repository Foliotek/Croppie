import { getExifOrientation } from '../helpers';
/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 * @param {number} orientation
 */
const drawCanvas = (canvas, img, orientation) => {
    var width = img.width,
        height = img.height,
        ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.save();
    switch (orientation) {
      case 2:
         ctx.translate(width, 0);
         ctx.scale(-1, 1);
         break;

      case 3:
          ctx.translate(width, height);
          ctx.rotate(180*Math.PI/180);
          break;

      case 4:
          ctx.translate(0, height);
          ctx.scale(1, -1);
          break;

      case 5:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(90*Math.PI/180);
          ctx.scale(1, -1);
          break;

      case 6:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(90*Math.PI/180);
          ctx.translate(0, -height);
          break;

      case 7:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(-90*Math.PI/180);
          ctx.translate(-width, height);
          ctx.scale(1, -1);
          break;

      case 8:
          canvas.width = height;
          canvas.height = width;
          ctx.translate(0, width);
          ctx.rotate(-90*Math.PI/180);
          break;
    }
    ctx.drawImage(img, 0,0, width, height);
    ctx.restore();
};

/**
 *
 * @param {import('../Croppie').default} croppie
 * @param {number} customOrientation
 */
const transferImageToCanvas = (croppie, customOrientation) => {
    const canvas = croppie.elements.canvas,
        img = croppie.elements.img,
        ctx = canvas.getContext('2d'),
        orientation = croppie.options.enableOrientation && customOrientation || getExifOrientation(img);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;
    console.log('drawing canvas', canvas, img);
    drawCanvas(canvas, img, orientation);
}
export {
    drawCanvas,
    transferImageToCanvas
}
