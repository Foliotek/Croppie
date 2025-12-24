import { clamp } from '../utils/clamp.ts';
/**
 * Creates mouse wheel zoom handler
 */
export function createWheelZoomHandler(element, getZoom, setZoom, config, callbacks, requireCtrl = false) {
    const handleWheel = (e) => {
        // Check for ctrl requirement
        if (requireCtrl && !e.ctrlKey)
            return;
        e.preventDefault();
        const previousZoom = getZoom();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = clamp(previousZoom + delta, config.min, config.max);
        if (newZoom !== previousZoom) {
            setZoom(newZoom);
            callbacks?.onChange?.(newZoom, previousZoom);
        }
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
        element.removeEventListener('wheel', handleWheel);
    };
}
/**
 * Creates pinch-to-zoom handler for touch devices
 */
export function createPinchZoomHandler(element, getZoom, setZoom, config, callbacks) {
    let initialDistance = 0;
    let initialZoom = 1;
    const getDistance = (touches) => {
        if (touches.length < 2)
            return 0;
        const touch1 = touches[0];
        const touch2 = touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = getDistance(e.touches);
            initialZoom = getZoom();
        }
    };
    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && initialDistance > 0) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            const scale = currentDistance / initialDistance;
            const previousZoom = getZoom();
            const newZoom = clamp(initialZoom * scale, config.min, config.max);
            if (newZoom !== previousZoom) {
                setZoom(newZoom);
                callbacks?.onChange?.(newZoom, previousZoom);
            }
        }
    };
    const handleTouchEnd = () => {
        initialDistance = 0;
    };
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
    };
}
//# sourceMappingURL=zoom.js.map