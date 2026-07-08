/**
 * Persistence Manager
 */
const Persistence = (() => {
    const STORAGE_KEY = 'shortcut_modular_prefs';

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            // Apply to state...
        }
    }

    function save() {
        const { State } = window.ShortcutApp;
        const data = {
            ui: State.get('ui')
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return { init, save };
})();

window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Persistence = Persistence;
