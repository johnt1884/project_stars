/**
 * Central State Management
 */
const State = (() => {
    const _state = {
        projects: [],
        currentProject: null,
        ui: {
            showDates: false,
            showNumbers: false,
            categoriesPanel: false,
            preserveSize: false
        }
    };

    function get(path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], _state);
    }

    function set(path, value) {
        const parts = path.split('.');
        const last = parts.pop();
        const target = parts.reduce((acc, part) => acc[part], _state);
        if (target[last] !== value) {
            target[last] = value;
            if (window.ShortcutApp?.Events) {
                window.ShortcutApp.Events.emit(`state:${path}`, value);
            }
        }
    }

    return { get, set };
})();

window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.State = State;
