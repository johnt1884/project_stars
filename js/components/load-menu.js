/**
 * Load Menu Component
 * Handles the directory selection and project discovery dropdown.
 */
const LoadMenu = (() => {
    const { Events, FSAdapter, ProjectDiscovery, State } = window.ShortcutApp;

    function init() {
        const btn = document.getElementById('load-menu-btn');
        const dropdown = document.getElementById('load-dropdown');

        if (!btn || !dropdown) return;

        // Toggle dropdown
        btn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        };

        // Close dropdown when clicking outside
        window.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        dropdown.onclick = (e) => e.stopPropagation();

        // Menu item actions
        document.getElementById('load-directory-btn').onclick = async () => {
            dropdown.style.display = 'none';
            try {
                const handle = await FSAdapter.showDirectoryPicker();
                const projects = await ProjectDiscovery.scan(handle);
                State.set('projects', projects);
                Events.emit('discovery:complete', projects);
            } catch (err) {
                if (err.name !== 'AbortError') console.error('LoadMenu: Error loading directory:', err);
            }
        };

        // Other modes (Stubs for now)
        ['load-latest-videos-btn', 'load-sc-btn', 'load-root-sc-btn', 'create-playlist-load-btn', 'create-playlist-root-load-btn', 'update-playlist-root-load-btn'].forEach(id => {
            document.getElementById(id).onclick = () => {
                dropdown.style.display = 'none';
                console.log(`LoadMenu: Mode "${id}" selected (not yet implemented).`);
            };
        });
    }

    return { init };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.LoadMenu = LoadMenu;
