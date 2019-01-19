/**
 *
 * @param {import("../Croppie")} croppie
 */
const hasExif = (croppie) => {
    return croppie.options.enableExif && window.EXIF;
}

export default hasExif;
