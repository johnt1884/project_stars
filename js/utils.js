/**
 * Core Utilities
 * Shared helper functions for the application.
 */
const Utils = (() => {

    /**
     * Format seconds into MM:SS.mmm format
     * @param {number} seconds
     * @returns {string}
     */
    function formatTime(seconds) {
        if (!isFinite(seconds) || isNaN(seconds)) seconds = 0;
        const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    }

    /**
     * Escape a string for use in a PowerShell script
     * @param {string} str
     * @returns {string}
     */
    function escapePSString(str) {
        if (!str) return '';
        return str.replace(/'/g, "''");
    }

    /**
     * Normalize a path or string for consistent comparison
     * @param {string} str
     * @returns {string}
     */
    function normalize(str) {
        if (!str) return '';
        return str.trim().replace(/^["']|["']$/g, '').toLowerCase();
    }

    /**
     * Normalize a project key/path
     * @param {string} key
     * @returns {string}
     */
    function normalizeProjectKey(key) {
        if (!key) return '';
        return key.trim()
            .replace(/^[\\/"'\[\]]+|[\\/"'\[\]]+$/g, '')
            .replace(/\\/g, '/')
            .toLowerCase();
    }

    /**
     * Debounce a function
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Generate a unique ID
     * @returns {string}
     */
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    return {
        formatTime,
        escapePSString,
        normalize,
        normalizeProjectKey,
        debounce,
        generateId
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Utils = Utils;
