/**
 * Theme Manager
 * Manages CSS variables and UI preferences.
 */
const ThemeManager = (() => {
    const { Config, Events, State } = window.ShortcutApp;

    /**
     * Initialize Theme Manager
     */
    function init() {
        console.log('ThemeManager: Initializing...');
        applyCurrentTheme();
        setupListeners();
    }

    /**
     * Apply the theme stored in the state to the document root
     */
    function applyCurrentTheme() {
        const theme = State.get('ui.theme') || Config.DEFAULT_THEME;
        const root = document.documentElement;

        Object.entries(theme).forEach(([variable, value]) => {
            root.style.setProperty(variable, value);
        });
    }

    /**
     * Update a single theme variable
     * @param {string} variable - CSS variable name
     * @param {string} value - Color or value
     */
    function updateVariable(variable, value) {
        const theme = State.get('ui.theme') || { ...Config.DEFAULT_THEME };
        theme[variable] = value;
        State.set('ui.theme', theme);
    }

    /**
     * Revert theme to defaults
     */
    function revertToDefaults() {
        State.set('ui.theme', { ...Config.DEFAULT_THEME });
    }

    /**
     * Setup state listeners
     */
    function setupListeners() {
        // When state theme changes, re-apply to DOM
        Events.on('state:changed:ui.theme', () => {
            applyCurrentTheme();
        });

        // Toggle UI classes on main container based on state
        Events.on('state:changed:ui.showNumbers', ({ value }) => {
            document.querySelector('.main-container').classList.toggle('show-numbers', value);
            document.querySelectorAll('.row-number').forEach(el => el.style.display = value ? 'block' : 'none');
            window.ShortcutApp.Components.SizeManager.applyScales();
        });

        Events.on('state:changed:ui.showDates', ({ value }) => {
            document.querySelector('.main-container').classList.toggle('show-dates', value);
        });

        Events.on('state:changed:ui.uniformSelectionBg', ({ value }) => {
            document.querySelector('.main-container').classList.toggle('uniform-selection-bg', value);
        });
    }

    return {
        init,
        updateVariable,
        revertToDefaults
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.ThemeManager = ThemeManager;
