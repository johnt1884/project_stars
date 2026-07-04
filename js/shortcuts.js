/**
 * Shortcut Manager
 * Handles the logic for selecting and managing shortcuts for videos.
 */
const ShortcutManager = (() => {
    const { Events, State } = window.ShortcutApp;

    function init() {
        setupListeners();
    }

    /**
     * Toggle a shortcut selection for a video
     * @param {string} videoName
     * @param {string} projectPath
     * @param {string} type - 'root-sc', 'subfolder-sc', 'both-sc', 'playlist-sc', 'delete-sc'
     */
    function toggleSelection(videoName, projectPath, type) {
        const key = `${projectPath}|${videoName}`;
        const currentSelections = State.get('shortcutSelections') || {};
        const current = currentSelections[key];

        if (current && current.type === type) {
            // Deselect if same type
            delete currentSelections[key];
        } else {
            // Update or create selection
            currentSelections[key] = {
                ...(current || {}),
                videoName,
                projectPath,
                type
            };
        }

        State.set('shortcutSelections', currentSelections);
        Events.emit('shortcuts:updated', { key, selection: currentSelections[key] });
    }

    /**
     * Update multiplier for a selection
     */
    function updateMultiplier(videoName, projectPath, multiplier) {
        const key = `${projectPath}|${videoName}`;
        const currentSelections = State.get('shortcutSelections');
        if (currentSelections[key]) {
            currentSelections[key].multiplier = parseInt(multiplier) || 1;
            State.set('shortcutSelections', currentSelections);
        }
    }

    function setupListeners() {
        // We can add global shortcut management logic here
    }

    return {
        init,
        toggleSelection,
        updateMultiplier
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.ShortcutManager = ShortcutManager;
