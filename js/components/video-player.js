/**
 * Video Player Component
 * Handles the video preview modal and playback.
 */
const VideoPlayer = (() => {
    const { Events } = window.ShortcutApp;

    function init() {
        render();
        setupListeners();
    }

    function render() {
        // Create Modal
        const modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '2500';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.maxWidth = '90%';
        content.style.maxHeight = '90%';
        content.style.padding = '0';
        content.style.background = 'black';
        content.style.position = 'relative';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';

        const close = document.createElement('span');
        close.className = 'close';
        close.innerHTML = '&times;';
        close.style.position = 'absolute';
        close.style.right = '10px';
        close.style.top = '4px';
        close.style.color = 'white';
        close.style.fontSize = '32px';
        close.style.cursor = 'pointer';
        close.style.zIndex = '3000';
        close.onclick = closePlayer;

        const video = document.createElement('video');
        video.id = 'player';
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '100%';
        video.style.display = 'block';
        video.style.objectFit = 'contain';

        content.appendChild(close);
        content.appendChild(video);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) closePlayer();
        };
    }

    /**
     * Open player and load video
     */
    async function openPlayer(fileHandle, rotation = 0, flipped = false) {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('player');

        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);

        video.src = url;

        // Apply transforms
        let transform = `rotate(${rotation}deg)`;
        if (flipped) transform += ' scaleX(-1)';
        video.style.transform = transform;

        modal.style.display = 'flex';
        video.play();
    }

    function closePlayer() {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('player');

        video.pause();
        if (video.src) {
            URL.revokeObjectURL(video.src);
            video.src = '';
        }
        modal.style.display = 'none';
    }

    function setupListeners() {
        // Listen for preview requests
        Events.on('video:preview', ({ fileHandle, rotation, flipped }) => {
            openPlayer(fileHandle, rotation, flipped);
        });
    }

    return {
        init,
        openPlayer,
        closePlayer
    };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.VideoPlayer = VideoPlayer;
