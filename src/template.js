const template = (croppie) => {
    const { options } = croppie;
    const { boundary, viewport } = options;
    const preview = croppie.useCanvas ? '<canvas class="cr-preview"></canvas>' : '<img class="cr-preview" />';
    const zoomTemplate = `
<div class="cr-slider-wrap">
    <input class="cr-slider" type="range" aria-label="zoom" step="0.0001" />
</div>`;
    return `
<div class="cr-boundary" aria-dropeffect="none"
  style="width: ${boundary.width}px; height: ${boundary.height}px;">
    ${preview}
    <div class="cr-viewport cr-vp-${viewport.type}" style="width: ${viewport.width}px; height: ${viewport.height}px;" tabindex="0"></div>
    <div class="cr-overlay""></div>
</div>
${options.enableZoom ? zoomTemplate : ''}
`;
}
export default template;
