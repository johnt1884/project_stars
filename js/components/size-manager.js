/**
 * Size Manager Component
 * Handles thumbnail scaling and overlay toggles.
 */
const SizeManager = (() => {
    const { Events, State, Config } = window.ShortcutApp;

    function init() {
        setupListeners();
    }

    function renderBasic() {
        const leftBar = document.getElementById('top-bar-left');

        // Horizontal Size Selector
        const hSelect = document.createElement('select');
        hSelect.id = 'h-size-selector';
        hSelect.title = 'Horizontal Thumbnail Size';
        const hOptions = [
            { v: 'auto', t: 'H Auto' },
            { v: '0.1', t: 'H 10%' },
            { v: '0.2', t: 'H 20%' },
            { v: '0.3', t: 'H 30%' },
            { v: '0.4', t: 'H 40%' },
            { v: '0.5', t: 'H 50%' },
            { v: '0.6', t: 'H 60%' },
            { v: '0.7', t: 'H 70%' },
            { v: '0.8', t: 'H 80%' },
            { v: '0.85', t: 'H 85%' },
            { v: '0.9', t: 'H 90%' },
            { v: '1', t: 'H 100%' },
            { v: 'custom', t: 'H Custom' }
        ];
        hOptions.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.v;
            el.textContent = opt.t;
            hSelect.appendChild(el);
        });
        hSelect.value = State.get('ui.thumbnailSize.h') || 'custom';

        // Vertical Size Selector
        const vSelect = document.createElement('select');
        vSelect.id = 'v-size-selector';
        vSelect.title = 'Vertical Thumbnail Size';
        const vOptions = [
            { v: 'auto', t: 'V Auto' },
            { v: '0.1', t: 'V 10%' },
            { v: '0.2', t: 'V 20%' },
            { v: '0.3', t: 'V 30%' },
            { v: '0.4', t: 'V 40%' },
            { v: '0.5', t: 'V 50%' },
            { v: '0.6', t: 'V 60%' },
            { v: '0.7', t: 'V 70%' },
            { v: '0.8', t: 'V 80%' },
            { v: '0.85', t: 'V 85%' },
            { v: '0.9', t: 'V 90%' },
            { v: '1', t: 'V 100%' },
            { v: 'custom', t: 'V Custom' }
        ];
        vOptions.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.v;
            el.textContent = opt.t;
            vSelect.appendChild(el);
        });
        vSelect.value = State.get('ui.thumbnailSize.v') || '0.85';

        // Custom Size Input
        const customInput = document.createElement('input');
        customInput.type = 'number';
        customInput.id = 'custom-size-input';
        customInput.placeholder = '%';
        customInput.min = 1;
        customInput.max = 500;
        customInput.value = State.get('ui.thumbnailSize.custom') || 150;
        customInput.style.width = '60px';
        customInput.style.height = '28px';
        customInput.style.background = 'var(--top-bar-color)';
        customInput.style.color = 'white';
        customInput.style.border = '1px solid #444444';
        customInput.style.marginLeft = '5px';
        customInput.style.textAlign = 'center';

        leftBar.appendChild(hSelect);
        leftBar.appendChild(vSelect);
        leftBar.appendChild(customInput);

        hSelect.onchange = () => updateSize('h', hSelect.value);
        vSelect.onchange = () => updateSize('v', vSelect.value);
        customInput.oninput = () => updateSize('custom', parseInt(customInput.value));
    }

    function renderToggles() {
        const leftBar = document.getElementById('top-bar-left');
        const dateToggle = createToggle('show-dates-checkbox', 'Show Dates', 'ui.showDates');
        const numberToggle = createToggle('show-numbers-checkbox', 'Show Numbers', 'ui.showNumbers');
        leftBar.appendChild(dateToggle);
        leftBar.appendChild(numberToggle);
    }

    function renderPreserve() {
        const leftBar = document.getElementById('top-bar-left');
        const preserveSizeToggle = createToggle('preserve-original-size-global-checkbox', 'Preserve Original Size', 'ui.preserveOriginalSize');
        leftBar.appendChild(preserveSizeToggle);
    }

    function createToggle(id, labelText, statePath) {
        const container = document.createElement('div');
        container.className = 'checkbox-container';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginLeft = '16px';
        container.style.fontSize = '14px';
        container.style.whiteSpace = 'nowrap';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = State.get(statePath);
        checkbox.onchange = () => State.set(statePath, checkbox.checked);

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        label.style.marginLeft = '4px';

        container.appendChild(checkbox);
        container.appendChild(label);
        return container;
    }

    function updateSize(type, value) {
        const size = State.get('ui.thumbnailSize');
        size[type] = value;
        State.set('ui.thumbnailSize', size);
        applyScales();
    }

    function applyInitialScales() {
        // Wait for images to load before applying initial scales if necessary
        // In this modular version, we apply whenever state changes
        applyScales();
    }

    function applyScales() {
        const hSize = State.get('ui.thumbnailSize.h');
        const vSize = State.get('ui.thumbnailSize.v');
        const custom = State.get('ui.thumbnailSize.custom');
        const showNumbers = State.get('ui.showNumbers');

        const wrappers = document.querySelectorAll('.thumbnail-wrapper');
        const container = document.getElementById('thumbnail-container');
        if (!container) return;

        const paddingLR = showNumbers ? 50 : 20;
        const containerWidth = container.clientWidth;

        const getScaleValue = (val) => {
            if (val === 'custom') return custom / 100;
            if (val !== 'auto') return parseFloat(val);
            return null;
        };

        let hScale = getScaleValue(hSize);
        let vScale = getScaleValue(vSize);

        let standardWidth = 320;
        let standardHeight = 180;
        const allThumbs = Array.from(document.querySelectorAll('.thumbnail[data-original-width]'));

        if (allThumbs.length > 0) {
            const dims = allThumbs.map(t => {
                const w = parseFloat(t.dataset.originalWidth);
                const h = parseFloat(t.dataset.originalHeight);
                const isRot90 = t.classList.contains('rotate-90') || t.classList.contains('rotate-270');
                return { w: isRot90 ? h : w, h: isRot90 ? w : h };
            });
            dims.sort((a,b) => a.w - b.w);
            standardWidth = dims[Math.floor(dims.length / 2)].w;
            dims.sort((a,b) => a.h - b.h);
            standardHeight = dims[Math.floor(dims.length / 2)].h;
        }

        if (hScale === null || vScale === null) {
            // Adjust containerWidth for categories panel if enabled
            let effectiveContainerWidth = window.innerWidth;
            const categoriesPanel = document.getElementById('categories-panel');
            if (State.get('ui.categoriesPanelEnabled') && categoriesPanel && categoriesPanel.style.display !== 'none') {
                effectiveContainerWidth -= categoriesPanel.offsetWidth;
            }

            const availableW = effectiveContainerWidth - (paddingLR * 2) - 10;
            let numToFit = 10;
            let targetScaledW = (availableW - (9 * 10)) / 10;
            if (targetScaledW < 210) {
                numToFit = Math.floor((availableW + 10) / (210 + 10));
                if (numToFit < 1) numToFit = 1;
                targetScaledW = (availableW - ((numToFit - 1) * 10)) / numToFit;
            }
            const auto = targetScaledW / standardWidth;
            if (hScale === null) hScale = auto;
            if (vScale === null) vScale = auto;
        }

        wrappers.forEach(wrapper => {
            const img = wrapper.querySelector('.thumbnail');
            if (!img || !img.dataset.originalWidth) return;

            const originalWidth = parseFloat(img.dataset.originalWidth);
            const originalHeight = parseFloat(img.dataset.originalHeight);
            const isRotated90 = img.classList.contains('rotate-90') || img.classList.contains('rotate-270');

            let effW = isRotated90 ? originalHeight : originalWidth;
            let effH = isRotated90 ? originalWidth : originalHeight;

            if (effW > standardWidth * 1.2 || effH > standardHeight * 1.2) {
                const scale = Math.min(standardWidth / effW, standardHeight / effH);
                effW *= scale;
                effH *= scale;
            }

            const currentScale = (effH > effW) ? vScale : hScale;
            const scaledWidth = effW * currentScale;
            const scaledHeight = effH * currentScale;

            wrapper.style.width = Math.round(scaledWidth) + 'px';
            wrapper.style.height = Math.round(scaledHeight) + 'px';

            if (isRotated90) {
                img.style.width = Math.round(scaledHeight) + 'px';
                img.style.height = Math.round(scaledWidth) + 'px';
            } else {
                img.style.width = Math.round(scaledWidth) + 'px';
                img.style.height = Math.round(scaledHeight) + 'px';
            }
        });
    }

    function setupListeners() {
        Events.on('project:selected', () => {
            // Apply scales after a short delay to allow images to begin loading
            setTimeout(applyScales, 500);
        });

        // Re-apply on window resize
        window.addEventListener('resize', applyScales);
    }

    return {
        init,
        renderBasic,
        renderToggles,
        renderPreserve,
        applyScales
    };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.SizeManager = SizeManager;
