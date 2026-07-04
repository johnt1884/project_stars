/**
 * Configuration System
 * Global constants and default settings.
 */
const Config = {
    DEFAULT_THEME: {
        '--bg-color': '#3d0021',
        '--top-bar-color': '#1c1c1c',
        '--toolbar-color': '#1c1c1c',
        '--root-sc-color': '#ffe11f',
        '--subfolder-sc-color': '#00ff1e',
        '--both-sc-color': '#009dff',
        '--delete-sc-color': '#ff0101',
        '--header-text-color': '#01ff01',
        '--row-number-color': '#fcfc01',
        '--date-text-color': '#01ffff',
        '--playlist-sc-color': '#ff00ff',
        '--selected-cat-color': '#ff0000',
        '--edit-cuts-color': '#ff8c00',
        '--played-video-color': '#4b0082',
        '--root-sc-bg-color': '#ffe11f',
        '--subfolder-sc-bg-color': '#00ff1e',
        '--both-sc-bg-color': '#009dff',
        '--delete-sc-bg-color': '#ff0101',
        '--playlist-sc-bg-color': '#ff00ff',
        '--shortcut-bg-color': '#008000',
        '--selection-tint-color': '#ffffff',
        '--selection-opacity': '0.4',
        '--shortcut-opacity': '0.4'
    },

    UI: {
        CATEGORIES_PANEL_DEFAULT_WIDTH: 250,
        THUMBNAIL_SIZE_STORAGE_KEY: 'shortcut_app_thumb_size',
    },

    STORAGE_KEYS: {
        STATE: 'shortcut_app_state',
        SETTINGS: 'shortcut_app_settings'
    },

    SKIP_DIRS: new Set([
        'edit thumbnails',
        'thumbnails',
        'sc',
        '.git',
        'node_modules',
        'recovery',
        '$recycle.bin',
        'system volume information',
        'originals'
    ])
};

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Config = Config;
