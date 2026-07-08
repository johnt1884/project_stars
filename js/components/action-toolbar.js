/**
 * Video Action Toolbar Component
 * Handles per-video actions like shortcut selection, rotation, and move.
 */
const ActionToolbar = (() => {

    /**
     * Render the action toolbar for a specific video row
     */
    function render() {
        const bar = document.createElement('div');
        bar.className = 'row-action-bar';

        // 1. Delete Button (Reference Style: White square, bold red X)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn-ref';
        deleteBtn.innerHTML = '&times;';
        bar.appendChild(deleteBtn);

        // 2. Rotation Group
        const rotGroup = document.createElement('div');
        rotGroup.className = 'action-group';
        rotGroup.appendChild(createBtn('Rotate Left'));
        rotGroup.appendChild(createBtn('Rotate Right'));
        bar.appendChild(rotGroup);

        // 3. Shortcut Group (Order: Both, Subfolder, Root)
        const shortcutGroup = document.createElement('div');
        shortcutGroup.className = 'action-group';
        shortcutGroup.appendChild(createShortcutBtn('Both', 'both'));
        shortcutGroup.appendChild(createShortcutBtn('Subfolder', 'subfolder'));
        shortcutGroup.appendChild(createShortcutBtn('Root', 'root'));
        bar.appendChild(shortcutGroup);

        // 4. Extended Controls
        const extraGroup = document.createElement('div');
        extraGroup.className = 'action-group';
        extraGroup.appendChild(createBtn('Rotate 180°'));
        extraGroup.appendChild(createBtn('H Flip'));
        bar.appendChild(extraGroup);

        // 5. Move Controls
        const moveGroup = document.createElement('div');
        moveGroup.className = 'action-group';
        const moveSelect = document.createElement('select');
        moveSelect.className = 'toolbar-select';
        const opt = document.createElement('option');
        opt.textContent = 'Move to...';
        moveSelect.appendChild(opt);
        moveGroup.appendChild(moveSelect);
        moveGroup.appendChild(createBtn('Move'));
        bar.appendChild(moveGroup);

        // 6. Icon Actions (Edit, Category)
        const iconGroup = document.createElement('div');
        iconGroup.className = 'action-group';
        iconGroup.appendChild(createIconBtn(`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        `));
        iconGroup.appendChild(createIconBtn(`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
        `));
        bar.appendChild(iconGroup);

        return bar;
    }

    function createBtn(text) {
        const btn = document.createElement('button');
        btn.className = 'bar-button';
        btn.textContent = text;
        return btn;
    }

    function createShortcutBtn(text, type) {
        const btn = document.createElement('button');
        btn.className = 'bar-button';
        const dot = document.createElement('span');
        dot.className = `dot dot-${type}`;
        btn.appendChild(dot);
        btn.appendChild(document.createTextNode(text));
        return btn;
    }

    function createIconBtn(svg) {
        const btn = document.createElement('button');
        btn.className = 'bar-button icon-btn';
        btn.innerHTML = svg;
        return btn;
    }

    return { render };
})();

window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.ActionToolbar = ActionToolbar;
