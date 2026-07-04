/**
 * File System Adapter
 * Provides an abstract interface for file and directory access,
 * supporting both the File System Access API and webkitdirectory fallback.
 */
const FSAdapter = (() => {
    const { Utils } = window.ShortcutApp;

    /**
     * Create a virtual handle from a File object (webkitdirectory fallback)
     * @param {File} file
     * @param {string} path
     * @returns {Object} Virtual Handle
     */
    function createVirtualFileHandle(file, path) {
        return {
            kind: 'file',
            name: file.name,
            path: path,
            getFile: async () => file
        };
    }

    /**
     * Create a virtual directory handle (webkitdirectory fallback)
     * @param {string} name
     * @param {string} path
     * @param {Array} allFiles - List of all virtual file handles in this hierarchy
     * @returns {Object} Virtual Handle
     */
    function createVirtualDirectoryHandle(name, path, allFiles) {
        return {
            kind: 'directory',
            name: name,
            path: path,

            /**
             * Iterates over immediate children
             */
            values: async function* () {
                const seen = new Set();
                const prefix = path ? path + '/' : '';

                for (const fileHandle of allFiles) {
                    const relative = fileHandle.path.substring(prefix.length);
                    if (!relative) continue;

                    const parts = relative.split('/');
                    const firstPart = parts[0];

                    if (seen.has(firstPart)) continue;
                    seen.add(firstPart);

                    if (parts.length === 1) {
                        yield fileHandle;
                    } else {
                        const subPath = prefix + firstPart;
                        const subFiles = allFiles.filter(f => f.path.startsWith(subPath + '/'));
                        yield createVirtualDirectoryHandle(firstPart, subPath, subFiles);
                    }
                }
            },

            /**
             * Get a directory handle by name
             */
            getDirectoryHandle: async function(subName) {
                const subPath = (path ? path + '/' : '') + subName;
                const subFiles = allFiles.filter(f => f.path.startsWith(subPath + '/'));
                if (subFiles.length === 0) throw new Error(`Directory not found: ${subName}`);
                return createVirtualDirectoryHandle(subName, subPath, subFiles);
            },

            /**
             * Get a file handle by name
             */
            getFileHandle: async function(fileName) {
                const filePath = (path ? path + '/' : '') + fileName;
                const file = allFiles.find(f => f.path === filePath);
                if (!file) throw new Error(`File not found: ${fileName}`);
                return file;
            },

            /**
             * Resolve path components to a descendant handle
             */
            resolve: async function(descendant) {
                if (descendant.path === path) return [];
                if (descendant.path.startsWith(path + '/')) {
                    const relative = descendant.path.substring(path ? path.length + 1 : 0);
                    return relative.split('/');
                }
                return null;
            }
        };
    }

    /**
     * Wrap a native FileSystemDirectoryHandle (Modern API)
     * @param {FileSystemDirectoryHandle} nativeHandle
     * @param {string} path
     * @returns {Object} Virtual Handle
     */
    function wrapNativeHandle(nativeHandle, path = '') {
        return {
            kind: nativeHandle.kind,
            name: nativeHandle.name,
            path: path,
            handle: nativeHandle, // Keep reference to native handle

            values: async function* () {
                for await (const entry of nativeHandle.values()) {
                    const subPath = (path ? path + '/' : '') + entry.name;
                    yield wrapNativeHandle(entry, subPath);
                }
            },

            getFile: async function() {
                if (nativeHandle.kind !== 'file') throw new Error('Not a file');
                return await nativeHandle.getFile();
            },

            getDirectoryHandle: async function(name) {
                const subHandle = await nativeHandle.getDirectoryHandle(name);
                return wrapNativeHandle(subHandle, (path ? path + '/' : '') + name);
            },

            getFileHandle: async function(name) {
                const subHandle = await nativeHandle.getFileHandle(name);
                return wrapNativeHandle(subHandle, (path ? path + '/' : '') + name);
            },

            resolve: async function(descendant) {
                if (!descendant.handle) return null;
                return await nativeHandle.resolve(descendant.handle);
            }
        };
    }

    /**
     * Request a directory from the user
     * @returns {Promise<Object>} Virtual Directory Handle
     */
    async function requestDirectory() {
        // 1. Try Native API first (showDirectoryPicker)
        if (window.showDirectoryPicker) {
            try {
                const handle = await window.showDirectoryPicker();
                return wrapNativeHandle(handle);
            } catch (e) {
                if (e.name === 'AbortError') throw e;
                console.warn('Native showDirectoryPicker failed, falling back to input:', e);
            }
        }

        // 2. Fallback to <input webkitdirectory>
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;

            input.onchange = () => {
                const files = Array.from(input.files);
                if (files.length === 0) {
                    reject(new Error('No files selected'));
                    return;
                }

                // Map Files to Virtual Handles
                const virtualFiles = files.map(f => {
                    // webkitRelativePath looks like "root/folder/file.ext"
                    // We remove the root folder name to match native behavior where the handle is the root
                    const parts = f.webkitRelativePath.split('/');
                    const pathWithoutRoot = parts.slice(1).join('/');
                    return createVirtualFileHandle(f, pathWithoutRoot);
                });

                // The first part of webkitRelativePath is the selected folder name
                const rootName = files[0].webkitRelativePath.split('/')[0];
                resolve(createVirtualDirectoryHandle(rootName, '', virtualFiles));
            };

            input.onerror = (err) => reject(err);
            input.click();
        });
    }

    return {
        requestDirectory
    };
})();

// Export to global namespace
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.FSAdapter = FSAdapter;
