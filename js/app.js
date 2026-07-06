/**
 * Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Shortcuts Modular: Initializing Application...');

    const { ActionToolbar } = window.ShortcutApp.Components;

    /**
     * Bootstrap Function
     */
    function bootstrap() {
        // Render a sample action bar for visual verification of parity
        const container = document.getElementById('thumbnail-container');
        const sampleBar = ActionToolbar.render();
        container.appendChild(sampleBar);

        console.log('Shortcuts Modular: Application Ready.');
    }

    bootstrap();
});
