/**
 * Info Menu Component
 * Displays application statistics and error logs.
 */
const InfoMenu = (() => {
    const { Events, State } = window.ShortcutApp;

    function init() {
        const btn = document.getElementById('info-menu-btn');
        const dropdown = document.getElementById('info-dropdown');

        if (!btn || !dropdown) return;

        btn.onclick = (e) => {
            e.stopPropagation();
            Events.emit('ui:close-all-dropdowns');
            const isVisible = dropdown.style.display === 'block';
            if (!isVisible) renderContent(dropdown);
            dropdown.style.display = isVisible ? 'none' : 'block';
        };

        Events.on('ui:close-all-dropdowns', () => {
            dropdown.style.display = 'none';
        });

        dropdown.onclick = (e) => e.stopPropagation();
    }

    function renderContent(container) {
        const projects = State.get('projects') || [];

        container.innerHTML = `
            <div class="info-section">
                <h3 style="margin-top: 0;">Application Info</h3>
                <p>Projects Loaded: ${projects.length}</p>
                <p>Status: Ready</p>
            </div>
            <div class="info-separator" style="height: 1px; background: #444; margin: 10px 0;"></div>
            <div class="info-section">
                <h3>Errors</h3>
                <div id="error-list" style="color: #888; font-style: italic;">No errors detected.</div>
            </div>
        `;
    }

    return { init };
})();

window.ShortcutApp.Components.InfoMenu = InfoMenu;
