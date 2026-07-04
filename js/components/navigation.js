/**
 * Load Menu Component
 * Handles directory picking and different loading modes.
 */
const LoadMenu = (() => {
    const { Events, FSAdapter, ProjectDiscovery } = window.ShortcutApp;

    function init() {
        setupListeners();
    }

    function render() {
        const leftBar = document.getElementById('top-bar-left');
        leftBar.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'menu-container';
        container.style.position = 'relative';
        container.style.marginRight = '10px';

        const btn = document.createElement('button');
        btn.id = 'load-menu-btn';
        btn.title = 'Load';
        btn.className = 'bar-button';
        btn.style.padding = '0 8px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
        `;

        // 1. Add Options (Cog) Button
        const optionsBtn = document.createElement('button');
        optionsBtn.id = 'options-menu-btn';
        optionsBtn.title = 'Options';
        optionsBtn.className = 'bar-button';
        optionsBtn.style.padding = '0 8px';
        optionsBtn.style.marginRight = '10px';
        optionsBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;

        // 2. Add Info Button
        const infoBtn = document.createElement('button');
        infoBtn.id = 'info-menu-btn';
        infoBtn.title = 'Information';
        infoBtn.className = 'bar-button';
        infoBtn.style.padding = '0 8px';
        infoBtn.style.marginRight = '10px';
        infoBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;

        const dropdown = document.createElement('div');
        dropdown.id = 'load-dropdown';
        dropdown.className = 'dropdown-content';
        dropdown.style.display = 'none';

        const actions = [
            { id: 'load-all-videos', text: 'Load all videos' },
            { id: 'load-new-videos', text: 'Load new videos' },
            { id: 'load-all-shortcuts', text: 'Load all shortcuts' },
            { id: 'load-root-sc', text: 'Load root shortcut directory' },
            { id: 'create-playlist', text: 'Create playlist' },
            { id: 'create-playlist-root', text: 'Create playlist root' },
            { id: 'update-playlist-root', text: 'Update playlist root' }
        ];

        actions.forEach(action => {
            const item = document.createElement('button');
            item.id = action.id;
            item.textContent = action.text;
            item.onclick = () => handleAction(action.id);
            dropdown.appendChild(item);
        });

        container.appendChild(btn);
        container.appendChild(optionsBtn);
        container.appendChild(infoBtn);
        container.appendChild(dropdown);
        leftBar.appendChild(container);

        btn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        };

        window.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        // 3. Render the rest of the toolbar in order
        const { SizeManager, CategoriesPanel, CategoryMenu } = window.ShortcutApp.Components;
        const { SortingManager } = window.ShortcutApp;

        SizeManager.renderBasic();
        SortingManager.render();

        // Project select buttons
        const prevBtn = document.createElement('button');
        prevBtn.id = 'prev-canvas-btn';
        prevBtn.className = 'bar-button';
        prevBtn.textContent = '<';

        const select = document.createElement('select');
        select.id = 'canvas-select';

        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-canvas-btn';
        nextBtn.className = 'bar-button';
        nextBtn.textContent = '>';

        const groupSelect = document.createElement('select');
        groupSelect.id = 'group-selector';

        leftBar.appendChild(prevBtn);
        leftBar.appendChild(select);
        leftBar.appendChild(nextBtn);
        leftBar.appendChild(groupSelect);

        prevBtn.onclick = () => navigate(-1);
        nextBtn.onclick = () => navigate(1);
        select.onchange = () => {
            const index = parseInt(select.value);
            const projects = State.get('projects');
            ProjectDiscovery.loadProject(projects[index]);
        };

        SizeManager.renderToggles();
        CategoriesPanel.renderBasic();
        SizeManager.renderPreserve();
    }

    async function handleAction(actionId) {
        console.log(`LoadMenu: Action triggered: ${actionId}`);
        State.set('ui.activeMode', actionId);

        if (actionId === 'load-all-videos' || actionId === 'create-playlist' || actionId === 'update-playlist-root') {
            try {
                const rootHandle = await FSAdapter.requestDirectory();
                await ProjectDiscovery.scan(rootHandle);

                if (actionId === 'create-playlist') {
                    Events.emit('mode:playlist:start');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('LoadMenu: Error picking directory:', error);
                }
            }
        } else {
            console.warn(`LoadMenu: Action ${actionId} not yet implemented.`);
        }
    }

    function setupListeners() {
        // Any additional listeners
    }

    return { init };
})();

/**
 * Project Navigation Component
 * Handles project selection and < > buttons.
 */
const ProjectNavigation = (() => {
    const { Events, State, ProjectDiscovery } = window.ShortcutApp;

    function init() {
        render();
        setupListeners();
    }

    function render() {
        const leftBar = document.getElementById('top-bar-left');

        const prevBtn = document.createElement('button');
        prevBtn.id = 'prev-canvas-btn';
        prevBtn.className = 'bar-button';
        prevBtn.textContent = '<';

        const select = document.createElement('select');
        select.id = 'canvas-select';

        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-canvas-btn';
        nextBtn.className = 'bar-button';
        nextBtn.textContent = '>';

        // Find sort selector to insert after it
        const sortSelector = document.getElementById('sort-selector');
        if (sortSelector) {
            sortSelector.after(prevBtn);
            prevBtn.after(select);
            select.after(nextBtn);
        } else {
            leftBar.appendChild(prevBtn);
            leftBar.appendChild(select);
            leftBar.appendChild(nextBtn);
        }

        select.onchange = () => {
            const index = parseInt(select.value);
            const projects = State.get('projects');
            ProjectDiscovery.loadProject(projects[index]);
        };

        prevBtn.onclick = () => navigate(-1);
        nextBtn.onclick = () => navigate(1);
    }

    function navigate(direction) {
        const projects = State.get('projects');
        if (!projects.length) return;

        const current = State.get('currentProject');
        let index = projects.findIndex(p => p === current);

        index += direction;
        if (index < 0) index = projects.length - 1;
        if (index >= projects.length) index = 0;

        ProjectDiscovery.loadProject(projects[index]);
    }

    function updateDropdown() {
        const select = document.getElementById('canvas-select');
        const projects = State.get('projects');
        const current = State.get('currentProject');

        select.innerHTML = '';
        projects.forEach((project, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = project.name;
            if (project === current) option.selected = true;
            select.appendChild(option);
        });
    }

    function setupListeners() {
        Events.on('discovery:complete', () => {
            updateDropdown();
            // Automatically load first project if none selected
            const projects = State.get('projects');
            if (projects.length > 0 && !State.get('currentProject')) {
                ProjectDiscovery.loadProject(projects[0]);
            }
        });

        Events.on('project:selected', () => {
            updateDropdown();
        });
    }

    return { init };
})();

// Export components
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.LoadMenu = LoadMenu;
window.ShortcutApp.Components.ProjectNavigation = ProjectNavigation;
