/**
 * Thumbnail Engine
 * Handles scanning projects for video files and rendering the thumbnail grid.
 */
const ThumbnailEngine = (() => {
    const { Config, Events, State, Utils } = window.ShortcutApp;

    function init() {
        setupListeners();
    }

    /**
     * Update the visual state of a row based on its selection
     */
    function updateRowVisuals(videoName, projectPath) {
        const row = document.querySelector(`.landscape-row[data-video-name="${videoName}"][data-project-path="${projectPath}"]`);
        if (!row) return;

        const key = `${projectPath}|${videoName}`;
        const selection = State.get('shortcutSelections')[key];
        const type = selection ? selection.type : null;

        // Update Edit button appearance
        const editBtn = row.querySelector('.bar-button:nth-child(3)'); // This is a bit fragile, let's improve
        if (editBtn && editBtn.textContent === 'Edit') {
            editBtn.style.color = (selection && selection.isEdited) ? 'var(--edit-cuts-color)' : '';
            if (selection && selection.isEdited) {
                editBtn.style.borderColor = 'var(--edit-cuts-color)';
            } else {
                editBtn.style.borderColor = '';
            }
        }

        // Update action bar buttons
        const isPlaylistMode = State.get('ui.activeMode') === 'create-playlist';
        const buttons = row.querySelectorAll('.selection-type-button');

        buttons.forEach(btn => {
            const btnType = btn.classList[2].replace('-btn', '');

            if (isPlaylistMode) {
                btn.style.display = (btnType === 'playlist-sc') ? 'block' : 'none';
            } else {
                btn.style.display = (btnType === 'playlist-sc') ? 'none' : 'block';
            }

            btn.classList.toggle('active', type === btnType);
        });

        const deleteCross = row.querySelector('.delete-cross');
        if (deleteCross) {
            deleteCross.classList.toggle('active', type === 'delete-sc');
        }

        // Update thumbnails
        const wrappers = row.querySelectorAll('.thumbnail-wrapper');
        const thumbnails = row.querySelectorAll('.thumbnail');

        const selectionTypes = ['root-sc', 'subfolder-sc', 'both-sc', 'playlist-sc', 'delete-sc'];

        wrappers.forEach(w => {
            selectionTypes.forEach(t => w.classList.remove(`selected-${t}`));
            if (type) w.classList.add(`selected-${type}`);
        });

        thumbnails.forEach(t => {
            selectionTypes.forEach(st => t.classList.remove(`selected-${st}`));
            if (type) t.classList.add(`selected-${type}`);
        });
    }

    /**
     * Scan a project for video files and their corresponding thumbnails
     * @param {Object} projectHandle - Virtual Directory Handle
     */
    async function renderProject(project) {
        console.log(`ThumbnailEngine: Rendering project ${project.name}...`);
        const container = document.getElementById('thumbnail-container');
        container.innerHTML = '';

        try {
            // 1. Get all video files recursively
            const videoFiles = [];
            await findVideos(project.handle, '', videoFiles);

            // 2. Get Edit Thumbnails directory
            const editThumbsHandle = await project.handle.getDirectoryHandle('Edit Thumbnails');

            // 3. Map thumbnails to videos
            const videoMap = await mapThumbnailsToVideos(videoFiles, editThumbsHandle);

            // 4. Sort video names based on UI preference
            const sortMode = State.get('ui.sortMode');
            const sortedVideoNames = Object.keys(videoMap).sort((a, b) => {
                const dataA = videoMap[a];
                const dataB = videoMap[b];

                switch (sortMode) {
                    case 'name-asc': return a.localeCompare(b);
                    case 'name-desc': return b.localeCompare(a);
                    case 'date-new': return dataB.file.lastModified - dataA.file.lastModified;
                    case 'date-old': return dataA.file.lastModified - dataB.file.lastModified;
                    default: return a.localeCompare(b);
                }
            });

            // 5. Render project header
            const header = document.createElement('h2');
            header.className = 'project-header';
            header.innerHTML = `<span>${project.name} (${sortedVideoNames.length} videos)</span>`;
            container.appendChild(header);

            // 6. Render rows
            let rowIdx = 1;
            for (const videoName of sortedVideoNames) {
                const row = renderVideoRow(videoName, videoMap[videoName], rowIdx++);
                container.appendChild(row);
                updateRowVisuals(videoMap[videoName].file.name, project.path);
            }

            State.set('videoFiles', videoFiles);
            console.log(`ThumbnailEngine: Rendered ${sortedVideoNames.length} video rows.`);

        } catch (error) {
            console.error('ThumbnailEngine: Error rendering project:', error);
            container.innerHTML = `<div style="padding: 20px; color: #ff4444;">Error: ${error.message}. Make sure the project contains an 'Edit Thumbnails' folder.</div>`;
        }
    }

    /**
     * Recursively find video files
     */
    async function findVideos(dirHandle, subfolder, videoFiles) {
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file' && entry.name.match(/\.(mp4|avi|mov|mkv)$/i)) {
                entry.subfolder = subfolder;
                videoFiles.push(entry);
            } else if (entry.kind === 'directory' && !Config.SKIP_DIRS.has(entry.name.toLowerCase())) {
                await findVideos(entry, subfolder ? `${subfolder}\\${entry.name}` : entry.name, videoFiles);
            }
        }
    }

    /**
     * Group thumbnail files by their parent video
     */
    async function mapThumbnailsToVideos(videoFiles, editThumbsHandle) {
        const videoMap = {};

        // Initialize map with video file names (without extension)
        videoFiles.forEach(v => {
            const baseName = v.name.substring(0, v.name.lastIndexOf('.'));
            videoMap[baseName] = {
                file: v,
                thumbnails: []
            };
        });

        // Scan thumbnails
        for await (const entry of editThumbsHandle.values()) {
            if (entry.kind === 'file' && entry.name.match(/\.(jpe?g|png|webp)$/i)) {
                // Original app uses "videoName_0.jpg" format
                const match = entry.name.match(/^(.*?)_(\d+)\.[^.]+$/);
                if (match) {
                    const baseName = match[1];
                    if (videoMap[baseName]) {
                        videoMap[baseName].thumbnails.push(entry);
                    }
                }
            }
        }

        // Sort thumbnails numerically by their index (_0, _1, etc)
        Object.values(videoMap).forEach(v => {
            v.thumbnails.sort((a, b) => {
                const aIdx = parseInt(a.name.match(/_(\d+)\./)[1]);
                const bIdx = parseInt(b.name.match(/_(\d+)\./)[1]);
                return aIdx - bIdx;
            });
        });

        return videoMap;
    }

    /**
     * Create a row for a single video and its thumbnails
     */
    function renderVideoRow(videoBaseName, videoData, rowIndex) {
        const project = State.get('currentProject');
        const row = document.createElement('div');
        row.className = 'landscape-row';
        row.dataset.videoName = videoData.file.name;
        row.dataset.projectPath = project.path;

        // Row Number
        const rowNumber = document.createElement('span');
        rowNumber.className = 'row-number';
        rowNumber.textContent = rowIndex;
        rowNumber.style.display = State.get('ui.showNumbers') ? 'block' : 'none';
        row.appendChild(rowNumber);

        // Row Action Bar
        const actionBar = window.ShortcutApp.Components.RowActionBar.create(
            videoData.file.name,
            project.path,
            videoData.file.subfolder,
            project.name
        );
        row.appendChild(actionBar);

        // Row Info
        const info = document.createElement('div');
        info.className = 'row-info';
        info.style.padding = '4px 20px';

        let dateText = `Created: ${new Date(videoData.file.lastModified).toLocaleString()}`;
        if (State.get('ui.activeMode') === 'update-playlist-root' && videoData.file.shortcutDate) {
            dateText = `Shortcut: ${new Date(videoData.file.shortcutDate).toLocaleString()}`;
        }

        info.innerHTML = `
            <span class="row-video-name" style="color: var(--header-text-color); font-weight: bold;">${videoData.file.name}</span>
            <span class="date-info" style="margin-left: 10px; font-size: 0.8em; color: var(--date-text-color);">
                ${dateText}
            </span>
        `;
        row.appendChild(info);

        // Thumbnails Container
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'thumbnails-container';
        thumbContainer.style.display = 'flex';
        thumbContainer.style.flexWrap = 'wrap';
        thumbContainer.style.padding = '10px 20px';
        thumbContainer.style.gap = '10px';
        thumbContainer.style.justifyContent = 'center';

        // Clicking the container plays the video or selects for categories
        thumbContainer.onclick = (e) => {
            const key = `${project.path}|${videoData.file.name}`;
            Events.emit('video:selected', key);

            if (e.target === thumbContainer) {
                Events.emit('video:preview', {
                    fileHandle: videoData.file,
                    rotation: 0, // Logic for saved rotations will be added later
                    flipped: false
                });
            }
        };

        videoData.thumbnails.forEach(async (thumbHandle) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'thumbnail-wrapper';
            wrapper.style.display = 'inline-block';
            wrapper.style.marginRight = '10px';
            wrapper.style.marginBottom = '10px';
            wrapper.style.verticalAlign = 'top';
            wrapper.style.position = 'relative';
            wrapper.style.overflow = 'hidden';

            const img = document.createElement('img');
            img.className = 'thumbnail';

            // Load image blob
            const file = await thumbHandle.getFile();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                img.dataset.originalWidth = img.width;
                img.dataset.originalHeight = img.height;
                window.ShortcutApp.Components.SizeManager.applyScales();
            };
            img.src = url;

            img.onclick = (e) => {
                e.stopPropagation();
                const key = `${project.path}|${videoData.file.name}`;
                Events.emit('video:selected', key);

                Events.emit('video:preview', {
                    fileHandle: videoData.file,
                    rotation: 0,
                    flipped: false
                });
            };

            wrapper.appendChild(img);
            thumbContainer.appendChild(wrapper);
        });

        row.appendChild(thumbContainer);
        return row;
    }

    function setupListeners() {
        Events.on('project:selected', (project) => {
            renderProject(project);
        });

        Events.on('shortcuts:updated', ({ key }) => {
            const [projectPath, videoName] = key.split('|');
            updateRowVisuals(videoName, projectPath);
        });
    }

    return {
        init
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.ThumbnailEngine = ThumbnailEngine;
