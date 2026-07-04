/**
 * Project Discovery Module
 * Scans the file system for video projects and updates the state.
 */
const ProjectDiscovery = (() => {
    const { Config, Events, State, FSAdapter } = window.ShortcutApp;

    /**
     * Scan a directory for projects
     * A project is defined by having an 'Edit Thumbnails' subfolder.
     * @param {Object} rootHandle - Virtual Directory Handle
     */
    async function scan(rootHandle) {
        console.log('ProjectDiscovery: Starting scan...');
        const projects = [];

        await findProjectsRecursive(rootHandle, '', projects);

        // Sort projects by name
        projects.sort((a, b) => a.name.localeCompare(b.name));

        State.set('projects', projects);
        Events.emit('discovery:complete', projects);
        console.log(`ProjectDiscovery: Found ${projects.length} projects.`);
    }

    /**
     * Recursively search for directories containing 'Edit Thumbnails'
     */
    async function findProjectsRecursive(dirHandle, path, projects) {
        let isProject = false;
        const subDirs = [];

        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'directory') {
                if (entry.name.toLowerCase() === 'edit thumbnails') {
                    isProject = true;
                } else if (!Config.SKIP_DIRS.has(entry.name.toLowerCase())) {
                    subDirs.push(entry);
                }
            }
        }

        if (isProject) {
            projects.push({
                handle: dirHandle,
                name: dirHandle.name,
                path: path || dirHandle.name
            });
            // If it's a project, we don't look for nested projects (original behavior)
            return;
        }

        // Continue searching in subdirectories
        for (const subDir of subDirs) {
            const subPath = path ? `${path}\\${subDir.name}` : subDir.name;
            await findProjectsRecursive(subDir, subPath, projects);
        }
    }

    /**
     * Load a specific project by index or handle
     */
    function loadProject(project) {
        if (!project) return;
        State.set('currentProject', project);
        Events.emit('project:selected', project);
    }

    return {
        scan,
        loadProject
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.ProjectDiscovery = ProjectDiscovery;
