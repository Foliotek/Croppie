import { num } from './helpers';
import { TRANSLATE, TRANSLATE_OPTS, TRANSFORM} from './constants';

class Transform {
    constructor(x, y, scale) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
        this.scale = parseFloat(scale);
    }
    toString() {
        var suffix = TRANSLATE_OPTS[TRANSLATE].suffix || '';
        return TRANSLATE + '(' + this.x + 'px, ' + this.y + 'px' + suffix + ') scale(' + this.scale + ')';
    }

    static parse(v) {
        if (v.style) {
            return Transform.parse(v.style[TRANSFORM]);
        }
        else if (v.indexOf('matrix') > -1 || v.indexOf('none') > -1) {
            return Transform.fromMatrix(v);
        }
        else {
            return Transform.fromString(v);
        }
    }
    static fromMatrix(v) {
        var vals = v.substring(7).split(',');
        if (!vals.length || v === 'none') {
            vals = [1, 0, 0, 1, 0, 0];
        }

        return new Transform(num(vals[4]), num(vals[5]), parseFloat(vals[0]));
    }
    static fromString(v) {
        var values = v.split(') '),
            translate = values[0].substring(TRANSLATE.length + 1).split(','),
            scale = values.length > 1 ? values[1].substring(6) : 1,
            x = translate.length > 1 ? translate[0] : 0,
            y = translate.length > 1 ? translate[1] : 0;

        return new Transform(x, y, scale);
    }
}

export default Transform;
