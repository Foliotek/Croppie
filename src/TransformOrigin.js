import { TRANSFORM_ORIGIN } from './constants';
class TransformOrigin {
    constructor(el) {
        if (!el || !el.style[TRANSFORM_ORIGIN]) {
            this.x = 0;
            this.y = 0;
            return;
        }
        var css = el.style[TRANSFORM_ORIGIN].split(' ');
        this.x = parseFloat(css[0]);
        this.y = parseFloat(css[1]);
    }
    toString() {
        return this.x + 'px ' + this.y + 'px';
    }
}
export default TransformOrigin;
