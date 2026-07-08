/**
 * Options Menu Component
 * Handles theme color selection and opacity settings.
 */
const OptionsMenu = (() => {
    const { Events, State } = window.ShortcutApp;

    function init() {
        const btn = document.getElementById('options-menu-btn');
        const dropdown = document.getElementById('options-dropdown');

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
        container.innerHTML = `
            <div class="options-grid" style="padding: 10px;">
                ${createColorRow('Page Background', '--bg-color')}
                ${createColorRow('Top Toolbar', '--top-bar-color')}
                ${createColorRow('Action Toolbars', '--toolbar-color')}
                ${createColorRow('Root SC Outline', '--root-sc-color')}
                ${createColorRow('Subfolder SC Outline', '--subfolder-sc-color')}
                ${createColorRow('Both SC Outline', '--both-sc-color')}
                ${createColorRow('Delete Selection Outline', '--delete-sc-color')}

                <div class="options-separator" style="height: 1px; background: #444; margin: 10px 0;"></div>

                <div class="options-row" style="display: flex; align-items: center; justify-content: space-between; padding: 5px 0;">
                    <label>Selection Opacity</label>
                    <input type="range" id="selection-opacity-slider" min="0" max="1" step="0.05" value="0.4">
                </div>
            </div>
        `;

        // Add listeners for color pickers (omitted for brevity in this stage)
    }

    function createColorRow(label, cssVar) {
        const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        return `
            <div class="options-row" style="display: flex; align-items: center; justify-content: space-between; padding: 5px 0;">
                <label>${label}</label>
                <input type="color" value="${val}" data-var="${cssVar}">
            </div>
        `;
    }

    return { init };
})();

window.ShortcutApp.Components.OptionsMenu = OptionsMenu;
