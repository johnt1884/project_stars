/**
 * Category Menu Component
 * Handles the bulk category assignment menu in the top bar.
 */
const CategoryMenu = (() => {
    const { Events, State, CategoryManager } = window.ShortcutApp;

    function init() {
    }

    function renderBasic() {
        const leftBar = document.getElementById('top-bar-left');

        const container = document.createElement('div');
        container.className = 'menu-container';
        container.style.position = 'relative';
        container.style.marginRight = '10px';

        const btn = document.createElement('button');
        btn.id = 'top-categories-menu-btn';
        btn.title = 'Categories';
        btn.className = 'bar-button';
        btn.style.padding = '0 8px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
        `;

        const dropdown = document.createElement('div');
        dropdown.id = 'top-categories-dropdown';
        dropdown.className = 'dropdown-content';
        dropdown.style.display = 'none';
        dropdown.style.minWidth = '300px';
        dropdown.style.padding = '12px';

        container.appendChild(btn);
        container.appendChild(dropdown);
        leftBar.appendChild(container);

        btn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            if (!isVisible) updateDropdownContent(dropdown);
            dropdown.style.display = isVisible ? 'none' : 'block';
        };

        window.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        dropdown.onclick = (e) => e.stopPropagation();
    }

    function updateDropdownContent(dropdown) {
        const currentProject = State.get('currentProject');
        if (!currentProject) {
            dropdown.innerHTML = '<div style="color: #888;">Load a project first.</div>';
            return;
        }

        const projCats = CategoryManager.getProjectCategories(currentProject.path);
        const globalCats = State.get('categories.global');
        const allAvailable = [...new Set([...projCats, ...globalCats])].sort();

        if (allAvailable.length === 0) {
            dropdown.innerHTML = '<div style="color: #888;">No categories available. Add one in the sidebar.</div>';
            return;
        }

        dropdown.innerHTML = '';

        const title = document.createElement('div');
        title.textContent = 'Apply Category to ALL videos in this project:';
        title.style.fontSize = '12px';
        title.style.color = '#ccc';
        title.style.marginBottom = '10px';
        dropdown.appendChild(title);

        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.marginBottom = '10px';
        select.style.color = 'black';
        select.style.backgroundColor = 'white';

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '-- Select Category --';
        select.appendChild(defaultOpt);

        allAvailable.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
        dropdown.appendChild(select);

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '10px';

        const addAllBtn = document.createElement('button');
        addAllBtn.className = 'bar-button';
        addAllBtn.style.flex = '1';
        addAllBtn.style.backgroundColor = '#43a047';
        addAllBtn.textContent = 'Add All';
        addAllBtn.onclick = () => {
            if (select.value) {
                bulkApply(select.value, true);
                dropdown.style.display = 'none';
            }
        };

        const remAllBtn = document.createElement('button');
        remAllBtn.className = 'bar-button';
        remAllBtn.style.flex = '1';
        remAllBtn.style.backgroundColor = '#d32f2f';
        remAllBtn.textContent = 'Remove All';
        remAllBtn.onclick = () => {
            if (select.value) {
                bulkApply(select.value, false);
                dropdown.style.display = 'none';
            }
        };

        btnRow.appendChild(addAllBtn);
        btnRow.appendChild(remAllBtn);
        dropdown.appendChild(btnRow);
    }

    /**
     * Apply or remove category for all videos in current project
     */
    function bulkApply(categoryName, isAdd) {
        const currentProject = State.get('currentProject');
        const videoFiles = State.get('videoFiles');

        videoFiles.forEach(v => {
            CategoryManager.toggleVideoCategory(v.name, currentProject.path, categoryName, isAdd);
        });

        console.log(`BulkCategory: ${isAdd ? 'Added' : 'Removed'} category "${categoryName}" for all videos in ${currentProject.name}.`);
    }

    return { init, renderBasic };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.CategoryMenu = CategoryMenu;
