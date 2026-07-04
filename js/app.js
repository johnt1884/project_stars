/**
 * Application Bootstrap
 * Initializes the application and coordinates module loading.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Shortcuts Modular: Initializing Application...');

    const { Events, Config, Persistence, ThemeManager, Components, ThumbnailEngine, ShortcutManager, SortingManager, CategoryManager } = window.ShortcutApp;

    /**
     * Bootstrap Function
     */
    function bootstrap() {
        // Initialize Persistence
        Persistence.init();

        // Initialize Theme
        ThemeManager.init();

        // Initialize Managers
        ShortcutManager.init();
        SortingManager.init();
        CategoryManager.init();

        // Initialize Engine
        ThumbnailEngine.init();

        // Initialize UI components
        Components.LoadMenu.init();
        Components.ProjectNavigation.init();
        Components.SizeManager.init();
        Components.VideoPlayer.init();
        Components.CategoriesPanel.init();
        Components.CategoryMenu.init();
        Components.VideoEditor.init();
        Components.ScriptGenerator.init();

        // Initial Render of Toolbar
        Components.LoadMenu.render();

        initUI();

        // Signal that the app is ready
        Events.emit('app:ready');
        console.log('Shortcuts Modular: Application Ready.');
    }

    /**
     * Initial UI setup
     */
    function initUI() {
        // Basic UI interactions can be established here
        const categoriesPanel = document.getElementById('categories-panel');
        // Initial state for UI elements from Config if needed
    }

    // Run bootstrap
    bootstrap();
});
