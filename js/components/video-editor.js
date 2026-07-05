/**
 * Video Editor Component
 * Foundation for the complex video editing modal.
 */
const VideoEditor = (() => {
    const { Events, State, Utils } = window.ShortcutApp;

    let isScrubbing = false;
    let isCropping = false;
    let cropDragging = false;
    let cropResizing = null;
    let cropStartPos = { x: 0, y: 0 };
    let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
    let currentRotation = 0;
    let isFlipped = false;
    let pendingCutStart = null;
    let pendingCutEnd = null;
    let currentCuts = [];

    function init() {
        setupListeners();
    }

    function render() {
        const modal = document.createElement('div');
        modal.id = 'editor-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '3000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.9)';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.backgroundColor = '#121212';
        content.style.color = '#eee';
        content.style.width = '100%';
        content.style.height = '100%';
        content.style.maxWidth = 'none';
        content.style.margin = '0';
        content.style.padding = '20px';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.boxSizing = 'border-box';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '10px';

        const fileInfo = document.createElement('div');
        fileInfo.id = 'editor-file-info';
        fileInfo.textContent = 'No file selected';

        const close = document.createElement('span');
        close.className = 'close';
        close.innerHTML = '&times;';
        close.style.cursor = 'pointer';
        close.style.fontSize = '32px';
        close.onclick = closeEditor;

        header.appendChild(fileInfo);
        header.appendChild(close);

        // Video Container Area
        const videoArea = document.createElement('div');
        videoArea.id = 'editor-video-container';
        videoArea.style.flexGrow = '1';
        videoArea.style.display = 'flex';
        videoArea.style.alignItems = 'center';
        videoArea.style.justifyContent = 'center';
        videoArea.style.position = 'relative';
        videoArea.style.overflow = 'hidden';
        videoArea.style.minHeight = '260px';

        const video = document.createElement('video');
        video.id = 'editor-main-video';
        video.style.maxWidth = '95%';
        video.style.maxHeight = '75vh';
        video.style.background = 'black';
        video.controls = false; // We'll use custom controls

        videoArea.appendChild(video);

        // Crop UI
        const cropBox = document.createElement('div');
        cropBox.id = 'editor-crop-box';
        cropBox.style.position = 'absolute';
        cropBox.style.border = '2px dashed #00ff00';
        cropBox.style.boxSizing = 'border-box';
        cropBox.style.display = 'none';
        cropBox.style.zIndex = '20';
        cropBox.style.cursor = 'move';

        // Handles
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        handles.forEach(h => {
            const handle = document.createElement('div');
            handle.className = `crop-handle handle-${h}`;
            handle.dataset.handle = h;
            handle.style.position = 'absolute';
            handle.style.width = '12px';
            handle.style.height = '12px';
            handle.style.background = '#00ff00';
            handle.style.border = '1px solid #000';
            handle.style.borderRadius = '2px';

            if (h.includes('n')) handle.style.top = '-6px';
            if (h.includes('s')) handle.style.bottom = '-6px';
            if (h.includes('w')) handle.style.left = '-6px';
            if (h.includes('e')) handle.style.right = '-6px';
            if (h === 'n' || h === 's') handle.style.left = '50%', handle.style.transform = 'translateX(-50%)';
            if (h === 'e' || h === 'w') handle.style.top = '50%', handle.style.transform = 'translateY(-50%)';

            handle.style.cursor = h + '-resize';
            cropBox.appendChild(handle);
        });

        const cropConfirm = document.createElement('div');
        cropConfirm.id = 'editor-crop-confirm';
        cropConfirm.innerHTML = '✔';
        cropConfirm.title = 'Confirm Crop';
        cropConfirm.style.position = 'absolute';
        cropConfirm.style.top = '5px';
        cropConfirm.style.right = '35px';
        cropConfirm.style.width = '24px';
        cropConfirm.style.height = '24px';
        cropConfirm.style.background = 'rgba(0,0,0,0.8)';
        cropConfirm.style.border = '1px solid #43a047';
        cropConfirm.style.color = '#43a047';
        cropConfirm.style.display = 'flex';
        cropConfirm.style.alignItems = 'center';
        cropConfirm.style.justifyContent = 'center';
        cropConfirm.style.cursor = 'pointer';
        cropConfirm.style.borderRadius = '4px';
        cropBox.appendChild(cropConfirm);

        const cropCancel = document.createElement('div');
        cropCancel.id = 'editor-crop-cancel';
        cropCancel.innerHTML = '✖';
        cropCancel.title = 'Cancel Crop';
        cropCancel.style.position = 'absolute';
        cropCancel.style.top = '5px';
        cropCancel.style.right = '5px';
        cropCancel.style.width = '24px';
        cropCancel.style.height = '24px';
        cropCancel.style.background = 'rgba(0,0,0,0.8)';
        cropCancel.style.border = '1px solid #f44336';
        cropCancel.style.color = '#f44336';
        cropCancel.style.display = 'flex';
        cropCancel.style.alignItems = 'center';
        cropCancel.style.justifyContent = 'center';
        cropCancel.style.cursor = 'pointer';
        cropCancel.style.borderRadius = '4px';
        cropBox.appendChild(cropCancel);

        videoArea.appendChild(cropBox);

        // Timeline Area
        const timelineWrap = document.createElement('div');
        timelineWrap.id = 'editor-timeline-wrap';
        timelineWrap.style.width = '98%';
        timelineWrap.style.marginTop = '10px';
        timelineWrap.style.padding = '0 20px';

        const timeline = document.createElement('div');
        timeline.id = 'editor-timeline';
        timeline.style.height = '18px';
        timeline.style.background = '#333';
        timeline.style.borderRadius = '9px';
        timeline.style.position = 'relative';
        timeline.style.cursor = 'pointer';

        const progress = document.createElement('div');
        progress.id = 'editor-progress';
        progress.style.position = 'absolute';
        progress.style.height = '100%';
        progress.style.background = '#00acc1';
        progress.style.borderRadius = '9px';
        progress.style.width = '0%';

        const scrubber = document.createElement('div');
        scrubber.id = 'editor-scrubber';
        scrubber.style.position = 'absolute';
        scrubber.style.top = '50%';
        scrubber.style.width = '22px';
        scrubber.style.height = '22px';
        scrubber.style.background = '#fff';
        scrubber.style.borderRadius = '50%';
        scrubber.style.transform = 'translate(-50%, -50%)';
        scrubber.style.boxShadow = '0 2px 8px rgba(0,0,0,.5)';

        timeline.appendChild(progress);
        timeline.appendChild(scrubber);
        timelineWrap.appendChild(timeline);

        // Control Area
        const controls = document.createElement('div');
        controls.id = 'editor-controls';
        controls.style.padding = '20px';
        controls.style.display = 'flex';
        controls.style.justifyContent = 'space-between';
        controls.style.alignItems = 'center';
        controls.style.gap = '15px';

        const leftControls = document.createElement('div');
        leftControls.style.display = 'flex';
        leftControls.style.gap = '10px';

        const playPauseBtn = document.createElement('button');
        playPauseBtn.id = 'editor-play-pause';
        playPauseBtn.className = 'bar-button';
        playPauseBtn.textContent = '▶️ Play';
        leftControls.appendChild(playPauseBtn);

        const frameBackBtn = document.createElement('button');
        frameBackBtn.id = 'editor-frame-back-btn';
        frameBackBtn.className = 'bar-button';
        frameBackBtn.textContent = '←';
        leftControls.appendChild(frameBackBtn);

        const frameForwardBtn = document.createElement('button');
        frameForwardBtn.id = 'editor-frame-forward-btn';
        frameForwardBtn.className = 'bar-button';
        frameForwardBtn.textContent = '→';
        leftControls.appendChild(frameForwardBtn);

        // Visual Transforms
        const transformControls = document.createElement('div');
        transformControls.style.display = 'flex';
        transformControls.style.gap = '10px';

        const rotLeftBtn = document.createElement('button');
        rotLeftBtn.id = 'editor-rot-left-btn';
        rotLeftBtn.className = 'bar-button';
        rotLeftBtn.title = '90° Left';
        rotLeftBtn.style.borderColor = '#00e5ff';
        rotLeftBtn.textContent = '⟲';
        transformControls.appendChild(rotLeftBtn);

        const rot180Btn = document.createElement('button');
        rot180Btn.id = 'editor-rot-180-btn';
        rot180Btn.className = 'bar-button';
        rot180Btn.title = '180°';
        rot180Btn.style.borderColor = '#ffca28';
        rot180Btn.textContent = '↕';
        transformControls.appendChild(rot180Btn);

        const rotRightBtn = document.createElement('button');
        rotRightBtn.id = 'editor-rot-right-btn';
        rotRightBtn.className = 'bar-button';
        rotRightBtn.title = '90° Right';
        rotRightBtn.style.borderColor = '#ff4081';
        rotRightBtn.textContent = '⟳';
        transformControls.appendChild(rotRightBtn);

        const flipBtn = document.createElement('button');
        flipBtn.id = 'editor-flip-btn';
        flipBtn.className = 'bar-button';
        flipBtn.textContent = 'Flip H';
        transformControls.appendChild(flipBtn);

        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'editor-time-display';
        timeDisplay.style.fontSize = '14px';
        timeDisplay.style.color = '#888';
        timeDisplay.textContent = '00:00.000 / 00:00.000';

        // Cutting Controls
        const cutControls = document.createElement('div');
        cutControls.style.display = 'flex';
        cutControls.style.gap = '10px';

        const markStartBtn = document.createElement('button');
        markStartBtn.id = 'editor-mark-start-btn';
        markStartBtn.className = 'bar-button';
        markStartBtn.textContent = 'Mark Start';
        markStartBtn.style.borderColor = '#43a047';
        cutControls.appendChild(markStartBtn);

        const markEndBtn = document.createElement('button');
        markEndBtn.id = 'editor-mark-end-btn';
        markEndBtn.className = 'bar-button';
        markEndBtn.textContent = 'Mark End';
        markEndBtn.style.borderColor = '#43a047';
        cutControls.appendChild(markEndBtn);

        const cutSegmentBtn = document.createElement('button');
        cutSegmentBtn.id = 'editor-cut-segment-btn';
        cutSegmentBtn.className = 'bar-button';
        cutSegmentBtn.textContent = 'Cut Segment';
        cutSegmentBtn.style.background = '#d32f2f';
        cutSegmentBtn.style.color = 'white';
        cutSegmentBtn.disabled = true;
        cutControls.appendChild(cutSegmentBtn);

        const cropBtn = document.createElement('button');
        cropBtn.id = 'editor-crop-btn';
        cropBtn.className = 'bar-button';
        cropBtn.textContent = 'Crop';
        cropBtn.style.borderColor = '#43a047';
        cutControls.appendChild(cropBtn);

        // Cuts List
        const cutsListContainer = document.createElement('div');
        cutsListContainer.id = 'editor-cuts-list-container';
        cutsListContainer.style.marginTop = '10px';
        cutsListContainer.style.background = '#2a2a2a';
        cutsListContainer.style.borderRadius = '6px';
        cutsListContainer.style.padding = '8px';
        cutsListContainer.style.maxHeight = '120px';
        cutsListContainer.style.overflowY = 'auto';

        const commitBtn = document.createElement('button');
        commitBtn.id = 'editor-commit-btn';
        commitBtn.className = 'bar-button';
        commitBtn.textContent = 'Commit';
        commitBtn.style.backgroundColor = '#43a047';
        commitBtn.style.padding = '8px 16px';
        commitBtn.style.borderRadius = '6px';

        controls.appendChild(leftControls);
        controls.appendChild(transformControls);
        controls.appendChild(cutControls);
        controls.appendChild(timeDisplay);
        controls.appendChild(commitBtn);

        content.appendChild(header);
        content.appendChild(videoArea);
        content.appendChild(timelineWrap);
        content.appendChild(controls);
        content.appendChild(cutsListContainer);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    function applyVisualTransforms() {
        const video = document.getElementById('editor-main-video');
        let transform = `rotate(${currentRotation}deg)`;
        if (isFlipped) transform += ' scaleX(-1)';
        video.style.transform = transform;
        updateCropBoxVisibility();
    }

    function updateCropBoxVisibility() {
        const cropBox = document.getElementById('editor-crop-box');
        if (isCropping) {
            cropBox.style.display = 'block';
        } else {
            cropBox.style.display = 'none';
        }
    }

    /**
     * Open the editor for a specific video
     */
    async function openEditor(fileHandle, videoName, projectPath) {
        const modal = document.getElementById('editor-modal');
        const video = document.getElementById('editor-main-video');
        const info = document.getElementById('editor-file-info');

        info.textContent = `${videoName} (${projectPath})`;

        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);
        video.src = url;

        // Load existing edits from state
        const key = `${projectPath}|${videoName}`;
        const selection = State.get('shortcutSelections')[key] || {};

        currentRotation = selection.editRotation || 0;
        isFlipped = selection.editFlipped || false;
        currentCuts = selection.cuts ? JSON.parse(JSON.stringify(selection.cuts)) : [];

        applyVisualTransforms();
        renderCutsList();
        renderTimelineMarkers();

        State.set('editor.isOpen', true, true);
        State.set('editor.currentVideo', { fileHandle, videoName, projectPath }, true);

        modal.style.display = 'flex';
    }

    function closeEditor() {
        const modal = document.getElementById('editor-modal');
        const video = document.getElementById('editor-main-video');

        video.pause();
        if (video.src) {
            URL.revokeObjectURL(video.src);
            video.src = '';
        }

        State.set('editor.isOpen', false);
        modal.style.display = 'none';
    }

    function setupListeners() {
        const video = document.getElementById('editor-main-video');
        const playPauseBtn = document.getElementById('editor-play-pause');
        const timeline = document.getElementById('editor-timeline');
        const cropBox = document.getElementById('editor-crop-box');
        const frameBackBtn = document.getElementById('editor-frame-back'); // Note: added IDs in render
        const frameForwardBtn = document.getElementById('editor-frame-forward');

        Events.on('editor:open', ({ fileHandle, videoName, projectPath }) => {
            openEditor(fileHandle, videoName, projectPath);
        });

        playPauseBtn.onclick = () => {
            if (video.paused) {
                video.play();
                playPauseBtn.textContent = '⏸ Pause';
            } else {
                video.pause();
                playPauseBtn.textContent = '▶️ Play';
            }
        };

        video.ontimeupdate = () => {
            if (!isScrubbing) updateTimelineUI();
        };

        video.onloadedmetadata = () => {
            updateTimelineUI();
        };

        // Scrubbing Logic
        timeline.onmousedown = (e) => {
            isScrubbing = true;
            scrub(e);
        };

        window.addEventListener('mousemove', (e) => {
            if (isScrubbing) scrub(e);
        });

        window.addEventListener('mouseup', () => {
            isScrubbing = false;
        });

        // Frame by Frame
        const step = (delta) => {
            video.pause();
            playPauseBtn.textContent = '▶️ Play';
            video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
        };

        // We need to re-select elements because IDs weren't in previous diff's HTML strings
        document.getElementById('editor-frame-back-btn').onclick = () => step(-1/30);
        document.getElementById('editor-frame-forward-btn').onclick = () => step(1/30);

        // Rotation & Flip
        document.getElementById('editor-rot-left-btn').onclick = () => {
            currentRotation = (currentRotation - 90 + 360) % 360;
            applyVisualTransforms();
        };

        document.getElementById('editor-rot-180-btn').onclick = () => {
            currentRotation = (currentRotation + 180) % 360;
            applyVisualTransforms();
        };

        document.getElementById('editor-rot-right-btn').onclick = () => {
            currentRotation = (currentRotation + 90) % 360;
            applyVisualTransforms();
        };

        const flipBtn = document.getElementById('editor-flip-btn');
        flipBtn.onclick = () => {
            isFlipped = !isFlipped;
            flipBtn.classList.toggle('active', isFlipped);
            applyVisualTransforms();
        };

        // Cutting logic
        const cutBtn = document.getElementById('editor-cut-segment-btn');

        document.getElementById('editor-mark-start-btn').onclick = () => {
            pendingCutStart = video.currentTime;
            if (pendingCutEnd !== null && pendingCutEnd < pendingCutStart) {
                [pendingCutStart, pendingCutEnd] = [pendingCutEnd, pendingCutStart];
            }
            cutBtn.disabled = !(pendingCutStart !== null && pendingCutEnd !== null);
            renderTimelineMarkers();
        };

        document.getElementById('editor-mark-end-btn').onclick = () => {
            pendingCutEnd = video.currentTime;
            if (pendingCutStart !== null && pendingCutEnd < pendingCutStart) {
                [pendingCutStart, pendingCutEnd] = [pendingCutEnd, pendingCutStart];
            }
            cutBtn.disabled = !(pendingCutStart !== null && pendingCutEnd !== null);
            renderTimelineMarkers();
        };

        cutBtn.onclick = () => {
            if (pendingCutStart !== null && pendingCutEnd !== null) {
                currentCuts.push({ start: pendingCutStart, end: pendingCutEnd });
                pendingCutStart = null;
                pendingCutEnd = null;
                cutBtn.disabled = true;
                renderCutsList();
                renderTimelineMarkers();
            }
        };

        // Cropping Logic
        const cropBtn = document.getElementById('editor-crop-btn');
        const cropConfirm = document.getElementById('editor-crop-confirm');
        const cropCancel = document.getElementById('editor-crop-cancel');

        cropBtn.onclick = () => {
            isCropping = !isCropping;
            cropBox.style.display = isCropping ? 'block' : 'none';
            if (isCropping) {
                // Initialize crop box to 80% of video area
                const container = document.getElementById('editor-video-container');
                cropBox.style.width = '80%';
                cropBox.style.height = '80%';
                cropBox.style.left = '10%';
                cropBox.style.top = '10%';
            }
        };

        cropBox.onmousedown = (e) => {
            if (e.target.classList.contains('crop-handle')) {
                cropResizing = e.target.dataset.handle;
            } else if (e.target === cropBox) {
                cropDragging = true;
            } else {
                return;
            }

            cropStartPos = { x: e.clientX, y: e.clientY };
            cropBoxStart = {
                x: parseFloat(cropBox.style.left) || 0,
                y: parseFloat(cropBox.style.top) || 0,
                w: parseFloat(cropBox.style.width) || 0,
                h: parseFloat(cropBox.style.height) || 0
            };
            e.preventDefault();
        };

        window.addEventListener('mousemove', (e) => {
            if (!cropDragging && !cropResizing) return;

            const dx = e.clientX - cropStartPos.x;
            const dy = e.clientY - cropStartPos.y;
            const video = document.getElementById('editor-main-video');
            const vRect = video.getBoundingClientRect();
            const container = document.getElementById('editor-video-container');
            const cRect = container.getBoundingClientRect();

            // Calculate video bounds relative to container
            const minX = vRect.left - cRect.left;
            const minY = vRect.top - cRect.top;
            const maxX = minX + vRect.width;
            const maxY = minY + vRect.height;

            if (cropDragging) {
                let newX = cropBoxStart.x + dx;
                let newY = cropBoxStart.y + dy;

                newX = Math.max(minX, Math.min(newX, maxX - cropBoxStart.w));
                newY = Math.max(minY, Math.min(newY, maxY - cropBoxStart.h));

                cropBox.style.left = newX + 'px';
                cropBox.style.top = newY + 'px';
            } else if (cropResizing) {
                let newX = cropBoxStart.x;
                let newY = cropBoxStart.y;
                let newW = cropBoxStart.w;
                let newH = cropBoxStart.h;

                if (cropResizing.includes('w')) {
                    const actualDx = Math.max(minX - cropBoxStart.x, Math.min(dx, cropBoxStart.w - 20));
                    newX = cropBoxStart.x + actualDx;
                    newW = cropBoxStart.w - actualDx;
                }
                if (cropResizing.includes('e')) {
                    newW = Math.max(20, Math.min(cropBoxStart.w + dx, maxX - cropBoxStart.x));
                }
                if (cropResizing.includes('n')) {
                    const actualDy = Math.max(minY - cropBoxStart.y, Math.min(dy, cropBoxStart.h - 20));
                    newY = cropBoxStart.y + actualDy;
                    newH = cropBoxStart.h - actualDy;
                }
                if (cropResizing.includes('s')) {
                    newH = Math.max(20, Math.min(cropBoxStart.h + dy, maxY - cropBoxStart.y));
                }

                cropBox.style.left = newX + 'px';
                cropBox.style.top = newY + 'px';
                cropBox.style.width = newW + 'px';
                cropBox.style.height = newH + 'px';
            }
        });

        window.addEventListener('mouseup', () => {
            cropDragging = false;
            cropResizing = null;
        });

        cropConfirm.onclick = (e) => {
            e.stopPropagation();
            // Save crop state
            isCropping = false;
            cropBox.style.display = 'none';
            cropBtn.classList.add('active');
        };

        cropCancel.onclick = (e) => {
            e.stopPropagation();
            isCropping = false;
            cropBox.style.display = 'none';
            cropBtn.classList.remove('active');
        };

        // Commit Logic
        document.getElementById('editor-commit-btn').onclick = () => {
            const { currentVideo } = State.get('editor');
            const key = `${currentVideo.projectPath}|${currentVideo.videoName}`;
            const selection = State.get('shortcutSelections')[key] || {
                videoName: currentVideo.videoName,
                projectPath: currentVideo.projectPath,
                type: ''
            };

            // Update selection with editor state
            selection.editRotation = currentRotation;
            selection.editFlipped = isFlipped;
            selection.cuts = JSON.parse(JSON.stringify(currentCuts));
            selection.isEdited = (currentRotation !== 0 || isFlipped || currentCuts.length > 0);

            const shortcutSelections = State.get('shortcutSelections');
            shortcutSelections[key] = selection;
            State.set('shortcutSelections', shortcutSelections);

            Events.emit('shortcuts:updated', { key, selection });
            closeEditor();
        };
    }

    function scrub(e) {
        const video = document.getElementById('editor-main-video');
        const timeline = document.getElementById('editor-timeline');
        const rect = timeline.getBoundingClientRect();
        let p = (e.clientX - rect.left) / rect.width;
        p = Math.max(0, Math.min(1, p));

        video.currentTime = p * video.duration;
        updateTimelineUI();
    }

    function renderCutsList() {
        const container = document.getElementById('editor-cuts-list-container');
        container.innerHTML = '';

        if (currentCuts.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#888;font-size:12px;">No cuts defined.</div>';
            return;
        }

        currentCuts.sort((a,b) => a.start - b.start).forEach((cut, index) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.padding = '4px';
            item.style.borderBottom = '1px solid #333';

            item.innerHTML = `
                <span>Cut ${index + 1}: ${Utils.formatTime(cut.start)} – ${Utils.formatTime(cut.end)}</span>
                <span class="delete-cut" style="cursor:pointer;color:#ff5252;font-weight:bold;">❌</span>
            `;

            item.querySelector('.delete-cut').onclick = () => {
                currentCuts.splice(index, 1);
                renderCutsList();
                renderTimelineMarkers();
            };

            container.appendChild(item);
        });
    }

    function renderTimelineMarkers() {
        const timeline = document.getElementById('editor-timeline');
        const video = document.getElementById('editor-main-video');

        // Remove existing markers/regions
        timeline.querySelectorAll('.cut-region, .pending-marker').forEach(el => el.remove());

        if (!video.duration) return;

        // Render Cut Regions
        currentCuts.forEach(cut => {
            const startX = (cut.start / video.duration) * 100;
            const endX = (cut.end / video.duration) * 100;

            const region = document.createElement('div');
            region.className = 'cut-region';
            region.style.position = 'absolute';
            region.style.height = '100%';
            region.style.background = 'rgba(255, 82, 82, 0.5)';
            region.style.left = `${startX}%`;
            region.style.width = `${endX - startX}%`;
            region.style.pointerEvents = 'none';
            timeline.appendChild(region);
        });

        // Render Pending Markers
        if (pendingCutStart !== null) {
            renderPendingMarker(pendingCutStart, '#ff5252');
        }
        if (pendingCutEnd !== null) {
            renderPendingMarker(pendingCutEnd, '#ff5252');
        }
    }

    function renderPendingMarker(time, color) {
        const timeline = document.getElementById('editor-timeline');
        const video = document.getElementById('editor-main-video');
        const x = (time / video.duration) * 100;

        const marker = document.createElement('div');
        marker.className = 'pending-marker';
        marker.style.position = 'absolute';
        marker.style.top = '-4px';
        marker.style.height = '26px';
        marker.style.width = '4px';
        marker.style.background = color;
        marker.style.left = `${x}%`;
        marker.style.transform = 'translateX(-50%)';
        marker.style.borderRadius = '2px';
        timeline.appendChild(marker);
    }

    function updateTimelineUI() {
        const video = document.getElementById('editor-main-video');
        const progress = document.getElementById('editor-progress');
        const scrubber = document.getElementById('editor-scrubber');
        const timeDisplay = document.getElementById('editor-time-display');

        const p = (video.currentTime / video.duration) * 100 || 0;
        progress.style.width = `${p}%`;
        scrubber.style.left = `${p}%`;

        timeDisplay.textContent = `${Utils.formatTime(video.currentTime)} / ${Utils.formatTime(video.duration)}`;

        // Visual overlay for cut regions during playback
        const isCurrentlyCut = currentCuts.some(cut => video.currentTime >= cut.start && video.currentTime < cut.end);
        const videoArea = document.getElementById('editor-video-container');

        let overlay = document.getElementById('editor-cut-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'editor-cut-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(0,0,0,0.6)';
            overlay.style.pointerEvents = 'none';
            overlay.style.display = 'none';
            overlay.style.zIndex = '10';
            videoArea.appendChild(overlay);
        }
        overlay.style.display = isCurrentlyCut ? 'block' : 'none';
    }

    return { init, render };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.VideoEditor = VideoEditor;
