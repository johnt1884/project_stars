/**
 * Central Event Bus
 */
const Events = (() => {
    const _listeners = new Map();

    function on(event, cb) {
        if (!_listeners.has(event)) _listeners.set(event, []);
        _listeners.get(event).push(cb);
    }

    function emit(event, data) {
        if (!_listeners.has(event)) return;
        _listeners.get(event).forEach(cb => cb(data));
    }

    return { on, emit };
})();

window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Events = Events;
