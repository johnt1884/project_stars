/**
 * Central Event System
 * Simple implementation of the PubSub pattern to facilitate communication between modules.
 */
const Events = {
    events: {},

    /**
     * Subscribe to an event
     * @param {string} eventName
     * @param {Function} callback
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} eventName
     * @param {Function} callback
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    },

    /**
     * Emit an event
     * @param {string} eventName
     * @param {any} data
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
    }
};

// Export to global namespace for modular use without ES modules (file:// compatibility)
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Events = Events;
