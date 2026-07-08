/**
 * Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Shortcuts Modular: Initializing Application...');

    const { LoadMenu, OptionsMenu, InfoMenu } = window.ShortcutApp.Components;
    const { Events } = window.ShortcutApp;

    /**
     * Bootstrap Function
     */
    function bootstrap() {
        // Initialize UI components
        LoadMenu.init();
        OptionsMenu.init();
        InfoMenu.init();

        // Global dropdown closer
        window.addEventListener('click', () => {
            Events.emit('ui:close-all-dropdowns');
        });

        console.log('Shortcuts Modular: Application Ready.');
    }

    bootstrap();
});
