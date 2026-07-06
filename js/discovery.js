/**
 * Project Discovery Module
 * Recursively scans directories to find video projects.
 */
const ProjectDiscovery = (() => {
    const { State, Events } = window.ShortcutApp;
    const EXCLUDED_DIRS = new Set(['edit thumbnails', 'thumbnails', 'sc', '.git', 'node_modules', 'recovery', '$recycle.bin', 'originals']);

    /**
     * Scan a directory handle for project folders
     */
    async function scan(dirHandle, path = '') {
        const projects = [];

        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'directory') {
                const lowerName = entry.name.toLowerCase();
                if (EXCLUDED_DIRS.has(lowerName)) continue;

                const subPath = path ? `${path}\\${entry.name}` : entry.name;

                // Check if this directory is a project (contains 'Edit Thumbnails')
                if (await isProject(entry)) {
                    projects.push({
                        handle: entry,
                        name: entry.name,
                        path: subPath
                    });
                } else {
                    // Recursive scan
                    const subProjects = await scan(entry, subPath);
                    projects.push(...subProjects);
                }
            }
        }

        return projects;
    }

    /**
     * Check if a directory handle contains an 'Edit Thumbnails' folder
     */
    async function isProject(dirHandle) {
        try {
            await dirHandle.getDirectoryHandle('Edit Thumbnails');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Load a specific project into the state
     */
    async function loadProject(project) {
        console.log(`Discovery: Loading project "${project.name}"`);
        State.set('currentProject', project);

        const videoFiles = [];
        for await (const entry of project.handle.values()) {
            if (entry.kind === 'file' && entry.name.match(/\.(mp4|avi|mov|mkv)$/i)) {
                const file = await entry.getFile();
                videoFiles.push({
                    name: entry.name,
                    handle: entry,
                    lastModified: file.lastModified
                });
            }
        }

        State.set('videoFiles', videoFiles);
        Events.emit('project:loaded', project);
    }

    return { scan, loadProject };
})();

// Export to application namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.ProjectDiscovery = ProjectDiscovery;
