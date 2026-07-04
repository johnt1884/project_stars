/**
 * Categories Panel Component
 * Handles the resizable sidebar for managing video categories.
 */
const CategoriesPanel = (() => {
    const { Events, State, Config, CategoryManager } = window.ShortcutApp;

    let isResizing = false;
    let selectedVideoKey = null;

    function init() {
        render();
        setupListeners();
    }

    function renderBasic() {
        const leftBar = document.getElementById('top-bar-left');
        const panel = document.getElementById('categories-panel');
        const resizer = document.getElementById('panel-resizer');

        // 1. Add "Categories" toggle to Top Bar
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'checkbox-container';
        toggleContainer.style.display = 'flex';
        toggleContainer.style.alignItems = 'center';
        toggleContainer.style.marginLeft = '16px';
        toggleContainer.style.fontSize = '14px';
        toggleContainer.style.whiteSpace = 'nowrap';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'enable-categories-panel-checkbox';
        checkbox.checked = State.get('ui.categoriesPanelEnabled');
        checkbox.onchange = () => {
            State.set('ui.categoriesPanelEnabled', checkbox.checked);
        };

        const label = document.createElement('label');
        label.htmlFor = 'enable-categories-panel-checkbox';
        label.textContent = 'Categories';
        label.style.marginLeft = '4px';

        toggleContainer.appendChild(checkbox);
        toggleContainer.appendChild(label);
        // Find correct position to insert (after Show Numbers)
        const showNumbersCheckbox = document.getElementById('show-numbers-checkbox');
        if (showNumbersCheckbox && showNumbersCheckbox.parentElement) {
            showNumbersCheckbox.parentElement.after(toggleContainer);
        } else {
            leftBar.appendChild(toggleContainer);
        }

        // 2. Initial Panel State
        const enabled = State.get('ui.categoriesPanelEnabled');
        panel.style.display = enabled ? 'block' : 'none';

        const savedWidth = State.get('ui.categoriesPanelWidth');
        if (savedWidth) panel.style.width = `${savedWidth}px`;

        // 3. Resizer Logic
        resizer.onmousedown = (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        };

        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const contentArea = document.getElementById('content-area');
            const rect = contentArea.getBoundingClientRect();

            // Panel is on the right, so we calculate width based on distance from right edge
            let newWidth = rect.right - e.clientX;

            // Constraints
            newWidth = Math.max(150, Math.min(600, newWidth));

            panel.style.width = `${newWidth}px`;
        });

        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                const width = parseInt(panel.style.width);
                State.set('ui.categoriesPanelWidth', width);
            }
        });
    }

    function updatePanelVisibility() {
        const panel = document.getElementById('categories-panel');
        const enabled = State.get('ui.categoriesPanelEnabled');
        panel.style.display = enabled ? 'block' : 'none';
        if (enabled) renderContent();
    }

    /**
     * Render the list of categories for the selected video
     */
    function renderContent() {
        const container = document.getElementById('panel-content');
        container.innerHTML = '';

        if (!selectedVideoKey) {
            container.innerHTML = '<div style="color: #888; text-align: center; margin-top: 20px;">Select a video to manage categories.</div>';
            return;
        }

        const [projectPath, videoName] = selectedVideoKey.split('|');
        const videoCats = CategoryManager.getVideoCategories(videoName, projectPath);
        const projCats = CategoryManager.getProjectCategories(projectPath);
        const globalCats = State.get('categories.global').filter(c => !projCats.includes(c));

        // Header
        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.color = 'var(--header-text-color)';
        header.textContent = videoName;
        container.appendChild(header);

        // Add Category UI
        const addRow = document.createElement('div');
        addRow.style.display = 'flex';
        addRow.style.gap = '5px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'New category...';
        input.style.flexGrow = '1';

        const addBtn = document.createElement('button');
        addBtn.className = 'bar-button';
        addBtn.textContent = 'Add';
        addBtn.onclick = () => {
            const val = input.value.trim();
            if (val) {
                CategoryManager.toggleVideoCategory(videoName, projectPath, val, true);
                input.value = '';
                renderContent();
            }
        };

        addRow.appendChild(input);
        addRow.appendChild(addBtn);
        container.appendChild(addRow);

        // Categories List
        const list = document.createElement('div');
        list.className = 'panel-cat-list';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '4px';

        // Combine all relevant categories for the list
        const allRelevant = [...new Set([...projCats, ...globalCats])].sort();

        allRelevant.forEach(cat => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '8px';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = `cat-${cat}`;
            cb.checked = videoCats.includes(cat);
            cb.onchange = () => {
                CategoryManager.toggleVideoCategory(videoName, projectPath, cat, cb.checked);
            };

            const label = document.createElement('label');
            label.htmlFor = `cat-${cat}`;
            label.textContent = cat;
            label.style.cursor = 'pointer';

            item.appendChild(cb);
            item.appendChild(label);
            list.appendChild(item);
        });

        container.appendChild(list);
    }

    function setupListeners() {
        Events.on('state:changed:ui.categoriesPanelEnabled', () => {
            updatePanelVisibility();
        });

        // Use a generic event for video selection in the future,
        // for now we'll listen for row clicks or thumbnail clicks
        Events.on('video:selected', (key) => {
            selectedVideoKey = key;
            if (State.get('ui.categoriesPanelEnabled')) {
                renderContent();
            }
        });

        Events.on('video:categories:updated', () => {
            if (State.get('ui.categoriesPanelEnabled')) {
                renderContent();
            }
        });
    }

    return {
        init,
        renderBasic
    };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.CategoriesPanel = CategoriesPanel;
