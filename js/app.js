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

        // Initial Render of persistent UI components
        Components.VideoPlayer.render();
        Components.VideoEditor.render();
        Components.ScriptGenerator.render();

        // Trigger initial toolbar render
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
        // Apply initial visual state from persistence
        const { State, ThemeManager, Components } = window.ShortcutApp;

        document.querySelector('.main-container').classList.toggle('show-numbers', State.get('ui.showNumbers'));
        document.querySelector('.main-container').classList.toggle('show-dates', State.get('ui.showDates'));
    }

    // Run bootstrap
    bootstrap();
});
