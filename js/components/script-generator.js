/**
 * Script Generator UI Component
 * Handles the generation and display of the PowerShell action script.
 */
const ScriptGenerator = (() => {
    const { Events, State, Utils } = window.ShortcutApp;

    function init() {
    }

    function render() {
        const modal = document.createElement('div');
        modal.id = 'script-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '3000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.backgroundColor = '#ffffff';
        content.style.color = '#000000';
        content.style.padding = '24px';
        content.style.borderRadius = '8px';
        content.style.width = '90%';
        content.style.maxWidth = '680px';
        content.style.maxHeight = '90vh';
        content.style.overflow = 'auto';

        const close = document.createElement('span');
        close.className = 'close';
        close.innerHTML = '&times;';
        close.style.float = 'right';
        close.style.fontSize = '32px';
        close.style.fontWeight = 'bold';
        close.style.cursor = 'pointer';
        close.onclick = () => modal.style.display = 'none';

        const title = document.createElement('h2');
        title.textContent = 'Generate Action PowerShell Script';
        title.style.marginTop = '0';

        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Action Summary';

        const summaryContent = document.createElement('div');
        summaryContent.id = 'action-summary-content';
        summaryContent.style.marginBottom = '20px';
        summaryContent.style.maxHeight = '200px';
        summaryContent.style.overflowY = 'auto';
        summaryContent.style.padding = '10px';
        summaryContent.style.border = '1px solid #ddd';
        summaryContent.style.fontSize = '14px';

        const desc = document.createElement('p');
        desc.textContent = 'This script will perform the actions listed above. Right-click and "Run with PowerShell" in your main video directory.';
        desc.style.fontSize = '14px';

        const textarea = document.createElement('textarea');
        textarea.id = 'batch-script';
        textarea.rows = '10';
        textarea.style.width = '100%';
        textarea.style.boxSizing = 'border-box';
        textarea.style.fontFamily = 'monospace';
        textarea.style.padding = '10px';
        textarea.readOnly = true;

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '10px';
        btnRow.style.marginTop = '20px';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'bar-button';
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.style.backgroundColor = '#166fe5';
        copyBtn.onclick = () => {
            textarea.select();
            document.execCommand('copy');
        };

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'bar-button';
        downloadBtn.textContent = 'Download .ps1 File';
        downloadBtn.style.backgroundColor = '#43a047';
        downloadBtn.onclick = () => {
            const blob = new Blob([textarea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sc_actions.ps1';
            a.click();
            URL.revokeObjectURL(url);
        };

        btnRow.appendChild(copyBtn);
        btnRow.appendChild(downloadBtn);

        content.appendChild(close);
        content.appendChild(title);
        content.appendChild(summaryTitle);
        content.appendChild(summaryContent);
        content.appendChild(desc);
        content.appendChild(textarea);
        content.appendChild(btnRow);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add Generate button to Top Bar Right
        const rightBar = document.getElementById('top-bar-right');
        const genBtn = document.createElement('button');
        genBtn.className = 'bar-button';
        genBtn.textContent = 'Generate Action Script';
        genBtn.style.borderRadius = '4px';
        genBtn.onclick = () => showScriptModal();
        rightBar.appendChild(genBtn);
    }

    function showScriptModal() {
        const modal = document.getElementById('script-modal');
        const summary = document.getElementById('action-summary-content');
        const textarea = document.getElementById('batch-script');

        const selections = State.get('shortcutSelections');
        const selectionList = Object.values(selections).filter(sel => sel.type || sel.isEdited);

        if (selectionList.length === 0) {
            alert('No actions or edits selected yet.');
            return;
        }

        // 1. Update Summary
        summary.innerHTML = '';
        const list = document.createElement('ul');
        selectionList.forEach(sel => {
            const li = document.createElement('li');
            let actions = [];
            if (sel.type) actions.push(sel.type.replace('-sc', '').toUpperCase());
            if (sel.isEdited) actions.push('EDIT');

            li.textContent = `${sel.videoName}: ${actions.join(' + ')}`;
            list.appendChild(li);
        });
        summary.appendChild(list);

        // 2. Generate Script
        textarea.value = generatePowerShell(selectionList);

        modal.style.display = 'flex';
    }

    /**
     * Build the PowerShell script string
     */
    function generatePowerShell(selections) {
        let script = [
            '# PowerShell Action Script for Shortcuts App',
            '$BaseDir = $PSScriptRoot',
            'if (-not $BaseDir) { $BaseDir = Get-Location }',
            '',
            'function Send-ToRecycleBin {',
            '    param([string]$path)',
            '    if (Test-Path -LiteralPath $path) {',
            '        Add-Type -AssemblyName Microsoft.VisualBasic',
            '        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($path, "OnlyErrorDialogs", "SendToRecycleBin")',
            '    }',
            '}',
            '',
            '# --- Start Actions ---',
            ''
        ];

        selections.forEach(sel => {
            const videoName = sel.videoName;
            const projectPath = sel.projectPath;
            const escapedName = Utils.escapePSString(videoName);
            const escapedPath = Utils.escapePSString(projectPath);

            script.push(`# Action for: ${videoName}`);

            // 1. Handle Edits (Placeholder for FFmpeg logic)
            if (sel.isEdited) {
                script.push(`Write-Host "Applying edits to ${escapedName}..."`);
                if (sel.editRotation) script.push(`# Rotate: ${sel.editRotation}`);
                if (sel.cuts && sel.cuts.length > 0) script.push(`# Cuts: ${sel.cuts.length} segments`);
            }

            // 2. Handle Shortcuts/Files
            if (sel.type === 'delete-sc') {
                script.push(`Send-ToRecycleBin (Join-Path $BaseDir "${escapedPath}\\${escapedName}")`);
            } else if (sel.type) {
                script.push(`# Logic for ${sel.type} shortcut creation...`);
            }

            script.push('');
        });

        script.push('Write-Host "All actions completed."');
        script.push('Read-Host "Press Enter to exit"');

        return script.join('\r\n');
    }

    return { init, render };
})();

// Export component
window.ShortcutApp = window.ShortcutApp || {};
window.ShortcutApp.Components = window.ShortcutApp.Components || {};
window.ShortcutApp.Components.ScriptGenerator = ScriptGenerator;
