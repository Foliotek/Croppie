/**
 * Creates a debounced version of a function
 */
export function debounce(fn, delay) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}
//# sourceMappingURL=debounce.js.map