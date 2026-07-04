/**
 * Row Action Bar Component
 * Handles per-video actions like selection type, rotate, flip, and delete.
 */
const RowActionBar = (() => {
    const { Events, State, Config, ShortcutManager } = window.ShortcutApp;

    /**
     * Create an action bar for a video row
     * @param {string} videoName
     * @param {string} projectPath
     * @param {string} subfolder
     * @param {string} projectName
     * @returns {HTMLElement}
     */
    function create(videoName, projectPath, subfolder, projectName) {
        const bar = document.createElement('div');
        bar.className = 'row-action-bar';
        bar.dataset.videoName = videoName;
        bar.dataset.projectPath = projectPath;

        const leftGroup = document.createElement('div');
        leftGroup.className = 'row-action-group-left';

        // Delete Cross
        const deleteCross = document.createElement('span');
        deleteCross.className = 'delete-cross';
        deleteCross.innerHTML = '&times;';
        deleteCross.title = 'Mark for Deletion';
        deleteCross.onclick = () => ShortcutManager.toggleSelection(videoName, projectPath, 'delete-sc');
        leftGroup.appendChild(deleteCross);

        // Selection Type Buttons
        const types = [
            { id: 'root-sc', title: 'Root Shortcut', color: 'var(--root-sc-color)' },
            { id: 'subfolder-sc', title: 'Subfolder Shortcut', color: 'var(--subfolder-sc-color)' },
            { id: 'both-sc', title: 'Both Shortcuts', color: 'var(--both-sc-color)' },
            { id: 'playlist-sc', title: 'Playlist', color: 'var(--playlist-sc-color)' }
        ];

        types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = `bar-button selection-type-button ${type.id}-btn`;
            btn.title = type.title;
            btn.style.borderLeft = `4px solid ${type.color}`;
            btn.textContent = type.id.split('-')[0].toUpperCase();
            btn.onclick = () => ShortcutManager.toggleSelection(videoName, projectPath, type.id);
            leftGroup.appendChild(btn);
        });

        const rightGroup = document.createElement('div');
        rightGroup.className = 'row-action-group-right';

        // Rotate/Flip/Edit Buttons (Placeholders for logic in later stages)
        const actions = [
            { id: 'rotate', text: 'Rotate' },
            { id: 'flip', text: 'Flip' },
            { id: 'edit', text: 'Edit' }
        ];

        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'bar-button';
            btn.textContent = action.text;

            if (action.id === 'edit') {
                btn.onclick = () => {
                    const videoFile = State.get('videoFiles').find(v => v.name === videoName);
                    if (videoFile) {
                        Events.emit('editor:open', {
                            fileHandle: videoFile,
                            videoName,
                            projectPath
                        });
                    }
                };
            }

            rightGroup.appendChild(btn);
        });

        // Multiplier (for playlist)
        const multiplier = document.createElement('input');
        multiplier.type = 'number';
        multiplier.className = 'multiplier-input';
        multiplier.value = 1;
        multiplier.min = 1;
        multiplier.oninput = () => ShortcutManager.updateMultiplier(videoName, projectPath, multiplier.value);
        rightGroup.appendChild(multiplier);

        bar.appendChild(leftGroup);
        bar.appendChild(rightGroup);

        return bar;
    }

    return {
        create
    };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.RowActionBar = RowActionBar;
