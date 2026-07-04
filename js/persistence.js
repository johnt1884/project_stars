/**
 * Persistence System
 * Handles saving and loading application state to/from localStorage.
 */
const Persistence = (() => {
    const { Config, Events, State } = window.ShortcutApp;

    /**
     * Initialize Persistence
     * Loads saved state and sets up auto-save on state changes.
     */
    function init() {
        console.log('Persistence: Initializing...');
        loadState();
        setupAutoSave();
    }

    /**
     * Load state from localStorage
     */
    function loadState() {
        try {
            const savedState = localStorage.getItem(Config.STORAGE_KEYS.STATE);
            if (savedState) {
                const parsedState = JSON.parse(savedState);

                // Only merge persistent parts of the state
                // We don't want to persist transient data like file handles or current video files
                const persistentState = {
                    shortcutSelections: parsedState.shortcutSelections || {},
                    categories: parsedState.categories || { global: [], project: {} },
                    ui: parsedState.ui || State.get('ui')
                };

                State.update(persistentState);
                console.log('Persistence: State loaded successfully.');
            }
        } catch (error) {
            console.error('Persistence: Error loading state:', error);
        }
    }

    /**
     * Save current state to localStorage
     */
    function saveState() {
        try {
            const currentState = State.get();

            // Only persist specific parts of the state
            const stateToPersist = {
                shortcutSelections: currentState.shortcutSelections,
                categories: currentState.categories,
                ui: currentState.ui
            };

            localStorage.setItem(Config.STORAGE_KEYS.STATE, JSON.stringify(stateToPersist));
        } catch (error) {
            console.error('Persistence: Error saving state:', error);
        }
    }

    /**
     * Set up listeners to auto-save on state changes
     */
    function setupAutoSave() {
        Events.on('state:changed', () => {
            saveState();
        });
    }

    /**
     * Reset all saved data
     */
    function reset() {
        localStorage.removeItem(Config.STORAGE_KEYS.STATE);
        console.log('Persistence: All saved data has been reset.');
        // Optionally reload page to return to initial state
    }

    return {
        init,
        saveState,
        loadState,
        reset
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Persistence = Persistence;
