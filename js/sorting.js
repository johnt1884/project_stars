/**
 * Sorting Module
 * Handles sorting of video rows based on name or date.
 */
const SortingManager = (() => {
    const { Events, State, ThumbnailEngine } = window.ShortcutApp;

    function init() {
        render();
        setupListeners();
    }

    function render() {
        const leftBar = document.getElementById('top-bar-left');

        const select = document.createElement('select');
        select.id = 'sort-selector';
        select.id = 'sort-selector';
        const options = [
            { v: '', t: 'Sort', hidden: true },
            { v: 'name-asc', t: 'Name (A-Z)' },
            { v: 'name-desc', t: 'Name (Z-A)' },
            { v: 'date-new', t: 'Date (Newest)' },
            { v: 'date-old', t: 'Date (Oldest)' }
        ];

        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.v;
            el.textContent = opt.t;
            if (opt.hidden) {
                el.disabled = true;
                el.selected = true;
                el.hidden = true;
            }
            select.appendChild(el);
        });

        leftBar.appendChild(select);

        select.onchange = () => {
            const mode = select.value;
            State.set('ui.sortMode', mode);
            sortAndReRender();
        };
    }

    /**
     * Re-sorts the current project's videos and triggers a re-render
     */
    function sortAndReRender() {
        const currentProject = State.get('currentProject');
        if (!currentProject) return;

        // The ThumbnailEngine's renderProject already uses State.get('ui.sortMode')
        // to sort if we modify it to do so.
        ThumbnailEngine.renderProject(currentProject);
    }

    function setupListeners() {
        // Any global sorting listeners
    }

    return {
        init
    };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.SortingManager = SortingManager;
