/**
 * Central State Management
 * Single source of truth for the application state.
 */
const State = (() => {
    const { Events } = window.ShortcutApp;

    // Initial State Schema
    let state = {
        projects: [],           // Array of project objects
        currentProject: null,   // Currently selected project
        videoFiles: [],         // All video files in current project
        shortcutSelections: {}, // key: projectPath|videoName, value: selection object
        categories: {
            global: [],         // Global category names
            project: {}         // key: projectPath, value: Set of category names
        },
        ui: {
            showDates: false,
            showNumbers: false,
            categoriesPanelEnabled: false,
            categoriesPanelWidth: 250,
            preserveOriginalSize: false,
            thumbnailSize: {
                h: 'custom',
                v: '0.85',
                custom: 150
            },
            sortMode: 'name-asc',
            activeCanvasId: null
        },
        editor: {
            isOpen: false,
            currentVideo: null,
            cuts: [],
            markers: [],
            rotation: 0,
            flipped: false,
            crop: null
        }
    };

    /**
     * Get a copy of the current state or a specific property
     * @param {string} path - Optional dot-notation path to property
     * @returns {any}
     */
    function get(path) {
        if (!path) return JSON.parse(JSON.stringify(state));

        return path.split('.').reduce((acc, part) => acc && acc[part], state);
    }

    /**
     * Update state and notify subscribers
     * @param {string} path - Dot-notation path to property
     * @param {any} value - New value
     * @param {boolean} silent - If true, doesn't emit event
     */
    function set(path, value, silent = false) {
        const parts = path.split('.');
        const last = parts.pop();
        const target = parts.reduce((acc, part) => acc[part], state);

        if (target && target[last] !== value) {
            target[last] = value;
            if (!silent) {
                Events.emit('state:changed', { path, value, state: get() });
                Events.emit(`state:changed:${path}`, { value, state: get() });
            }
        }
    }

    /**
     * Update multiple state properties at once
     * @param {Object} updates - Key-value pairs of updates
     * @param {boolean} silent - If true, doesn't emit event
     */
    function update(updates, silent = false) {
        Object.entries(updates).forEach(([path, value]) => {
            set(path, value, true);
        });

        if (!silent) {
            Events.emit('state:changed', { updates, state: get() });
        }
    }

    return {
        get,
        set,
        update
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.State = State;
