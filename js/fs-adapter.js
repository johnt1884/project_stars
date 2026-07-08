/**
 * File System Adapter
 */
const FSAdapter = (() => {
    async function showDirectoryPicker() {
        if (window.showDirectoryPicker) {
            return await window.showDirectoryPicker();
        }
        // Fallback...
    }
    return { showDirectoryPicker };
})();

window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.FSAdapter = FSAdapter;
