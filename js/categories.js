/**
 * Category Manager Logic
 * Handles global and project-level category creation and assignment.
 */
const CategoryManager = (() => {
    const { Events, State } = window.ShortcutApp;

    function init() {
        setupListeners();
    }

    /**
     * Add a category to the global list
     */
    function addGlobalCategory(name) {
        const categories = State.get('categories');
        if (!categories.global.includes(name)) {
            categories.global.push(name);
            State.set('categories', categories);
            Events.emit('categories:updated');
        }
    }

    /**
     * Toggle a category for a specific video
     */
    function toggleVideoCategory(videoName, projectPath, categoryName, isAdded) {
        const key = `${projectPath}|${videoName}`;
        const shortcutSelections = State.get('shortcutSelections') || {};

        if (!shortcutSelections[key]) {
            shortcutSelections[key] = { videoName, projectPath, type: '' };
        }

        const video = shortcutSelections[key];
        if (!video.categories) video.categories = [];

        if (isAdded) {
            if (!video.categories.includes(categoryName)) {
                video.categories.push(categoryName);

                // Also add to project-level categories for quick access
                const categories = State.get('categories');
                if (!categories.project[projectPath]) categories.project[projectPath] = [];
                if (!categories.project[projectPath].includes(categoryName)) {
                    categories.project[projectPath].push(categoryName);
                }

                // And ensure it exists globally
                if (!categories.global.includes(categoryName)) {
                    categories.global.push(categoryName);
                }

                State.set('categories', categories, true); // Silent update
            }
        } else {
            video.categories = video.categories.filter(c => c !== categoryName);
        }

        State.set('shortcutSelections', shortcutSelections);
        Events.emit('video:categories:updated', { key, video });
    }

    /**
     * Get all categories assigned to a video
     */
    function getVideoCategories(videoName, projectPath) {
        const key = `${projectPath}|${videoName}`;
        const selection = State.get('shortcutSelections')[key];
        return (selection && selection.categories) ? selection.categories : [];
    }

    /**
     * Get all categories associated with a project
     */
    function getProjectCategories(projectPath) {
        return State.get('categories.project')[projectPath] || [];
    }

    function setupListeners() {
        // Handle external category updates if needed
    }

    return {
        init,
        addGlobalCategory,
        toggleVideoCategory,
        getVideoCategories,
        getProjectCategories
    };
})();

// Export module
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.CategoryManager = CategoryManager;
