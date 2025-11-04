// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    targetMode: 'individual',
    selectedElements: new Set(),
    animateChanges: true,
    cascadeToChildren: false,
    originalStyles: new Map()
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Canvas & Components
    canvas: document.getElementById('canvas'),
    components: null, // Will be initialized
    selectedCount: document.getElementById('selectedCount'),

    // Target Mode Buttons
    targetModeBtns: document.querySelectorAll('.target-mode-btn'),
    individualSelector: document.getElementById('individualSelector'),
    typeSelector: document.getElementById('typeSelector'),
    groupSelector: document.getElementById('groupSelector'),

    // Selectors
    typeSelect: document.getElementById('typeSelect'),
    groupSelect: document.getElementById('groupSelect'),
    selectedElementsContainer: document.getElementById('selectedElements'),
    clearSelection: document.getElementById('clearSelection'),

    // Color Controls
    bgColor: document.getElementById('bgColor'),
    bgOpacity: document.getElementById('bgOpacity'),
    textColor: document.getElementById('textColor'),
    borderColor: document.getElementById('borderColor'),

    // Typography Controls
    fontSize: document.getElementById('fontSize'),
    fontWeight: document.getElementById('fontWeight'),
    letterSpacing: document.getElementById('letterSpacing'),
    lineHeight: document.getElementById('lineHeight'),

    // Spacing Controls
    padding: document.getElementById('padding'),
    margin: document.getElementById('margin'),
    gap: document.getElementById('gap'),

    // Border & Shape
    borderWidth: document.getElementById('borderWidth'),
    borderRadius: document.getElementById('borderRadius'),

    // Effects
    shadowBlur: document.getElementById('shadowBlur'),
    shadowSpread: document.getElementById('shadowSpread'),
    opacity: document.getElementById('opacity'),
    blur: document.getElementById('blur'),

    // Layout
    displayMode: document.getElementById('displayMode'),
    width: document.getElementById('width'),
    scale: document.getElementById('scale'),
    rotate: document.getElementById('rotate'),

    // Advanced
    cascadeToChildren: document.getElementById('cascadeToChildren'),
    animateChanges: document.getElementById('animateChanges'),
    customClass: document.getElementById('customClass'),
    applyClass: document.getElementById('applyClass'),

    // Header Controls
    toggleTheme: document.getElementById('toggleTheme'),
    savePreset: document.getElementById('savePreset'),
    exportCSS: document.getElementById('exportCSS'),
    resetAll: document.getElementById('resetAll'),

    // View Mode
    modeBtns: document.querySelectorAll('.mode-btn'),

    // Presets
    presetBtns: document.querySelectorAll('.preset-btn'),

    // Panel
    controlPanel: document.getElementById('controlPanel'),
    togglePanel: document.getElementById('togglePanel')
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    elements.components = document.querySelectorAll('.component');

    // Store original styles
    elements.components.forEach((comp, index) => {
        const styles = window.getComputedStyle(comp);
        state.originalStyles.set(comp, {
            background: styles.background,
            color: styles.color,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            letterSpacing: styles.letterSpacing,
            lineHeight: styles.lineHeight,
            padding: styles.padding,
            margin: styles.margin,
            gap: styles.gap,
            borderWidth: styles.borderWidth,
            borderColor: styles.borderColor,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
            opacity: styles.opacity,
            filter: styles.filter,
            display: styles.display,
            width: styles.width,
            transform: styles.transform
        });
    });

    attachEventListeners();
    updateSelectionDisplay();
}

// ============================================
// TARGET SELECTION
// ============================================
function getTargetElements() {
    const targets = [];

    switch (state.targetMode) {
        case 'individual':
            return Array.from(state.selectedElements);

        case 'type':
            const type = elements.typeSelect.value;
            if (type) {
                return Array.from(document.querySelectorAll(`[data-type="${type}"]`));
            }
            return [];

        case 'group':
            const group = elements.groupSelect.value;
            if (group) {
                return Array.from(document.querySelectorAll(`[data-group="${group}"]`));
            }
            return [];

        case 'all':
            return Array.from(elements.components);

        default:
            return [];
    }
}

function toggleElementSelection(element) {
    if (state.selectedElements.has(element)) {
        state.selectedElements.delete(element);
        element.classList.remove('selected');
    } else {
        state.selectedElements.add(element);
        element.classList.add('selected');
    }
    updateSelectionDisplay();
}

function clearAllSelections() {
    state.selectedElements.forEach(el => {
        el.classList.remove('selected');
    });
    state.selectedElements.clear();
    updateSelectionDisplay();
}

function updateSelectionDisplay() {
    const count = state.selectedElements.size;
    elements.selectedCount.textContent = `${count} selected`;

    // Update tags display
    elements.selectedElementsContainer.innerHTML = '';
    state.selectedElements.forEach(el => {
        const tag = document.createElement('div');
        tag.className = 'selected-tag';
        tag.innerHTML = `
            ${el.className.split(' ')[1] || 'element'}
            <span class="remove">×</span>
        `;
        tag.querySelector('.remove').addEventListener('click', () => {
            toggleElementSelection(el);
        });
        elements.selectedElementsContainer.appendChild(tag);
    });
}

// ============================================
// STYLE APPLICATION
// ============================================
function applyStyle(styleProperty, value, animate = true) {
    const targets = getTargetElements();

    if (targets.length === 0) return;

    targets.forEach(target => {
        if (animate && state.animateChanges) {
            target.classList.add('animate');
            setTimeout(() => target.classList.remove('animate'), 300);
        }

        target.style[styleProperty] = value;

        // Cascade to children if enabled
        if (state.cascadeToChildren) {
            const children = target.querySelectorAll('*');
            children.forEach(child => {
                child.style[styleProperty] = value;
            });
        }
    });
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners() {
    // Component Click Selection
    elements.components.forEach(comp => {
        comp.addEventListener('click', (e) => {
            if (state.targetMode === 'individual') {
                e.stopPropagation();
                toggleElementSelection(comp);
            }
        });
    });

    // Target Mode Switching
    elements.targetModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.targetMode = btn.dataset.targetMode;

            // Update UI
            elements.targetModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show/hide selector panels
            elements.individualSelector.classList.toggle('hidden', state.targetMode !== 'individual');
            elements.typeSelector.classList.toggle('hidden', state.targetMode !== 'type');
            elements.groupSelector.classList.toggle('hidden', state.targetMode !== 'group');
        });
    });

    // Clear Selection
    elements.clearSelection.addEventListener('click', clearAllSelections);

    // Type Select
    elements.typeSelect.addEventListener('change', () => {
        updateSelectionDisplay();
    });

    // Group Select
    elements.groupSelect.addEventListener('change', () => {
        updateSelectionDisplay();
    });

    // ========== COLOR CONTROLS ==========
    elements.bgColor.addEventListener('input', (e) => {
        const alpha = elements.bgOpacity.value / 100;
        const color = hexToRgba(e.target.value, alpha);
        applyStyle('background', color);
    });

    elements.bgOpacity.addEventListener('input', (e) => {
        const alpha = e.target.value / 100;
        const color = hexToRgba(elements.bgColor.value, alpha);
        applyStyle('background', color);
        e.target.nextElementSibling.textContent = `${e.target.value}%`;
    });

    elements.textColor.addEventListener('input', (e) => {
        applyStyle('color', e.target.value);
    });

    elements.borderColor.addEventListener('input', (e) => {
        applyStyle('borderColor', e.target.value);
    });

    // ========== TYPOGRAPHY CONTROLS ==========
    elements.fontSize.addEventListener('input', (e) => {
        applyStyle('fontSize', `${e.target.value}px`);
        document.getElementById('fontSizeValue').textContent = `${e.target.value}px`;
    });

    elements.fontWeight.addEventListener('input', (e) => {
        applyStyle('fontWeight', e.target.value);
        document.getElementById('fontWeightValue').textContent = e.target.value;
    });

    elements.letterSpacing.addEventListener('input', (e) => {
        applyStyle('letterSpacing', `${e.target.value}px`);
        document.getElementById('letterSpacingValue').textContent = `${e.target.value}px`;
    });

    elements.lineHeight.addEventListener('input', (e) => {
        applyStyle('lineHeight', e.target.value);
        document.getElementById('lineHeightValue').textContent = e.target.value;
    });

    // ========== SPACING CONTROLS ==========
    elements.padding.addEventListener('input', (e) => {
        applyStyle('padding', `${e.target.value}px`);
        document.getElementById('paddingValue').textContent = `${e.target.value}px`;
    });

    elements.margin.addEventListener('input', (e) => {
        applyStyle('margin', `${e.target.value}px`);
        document.getElementById('marginValue').textContent = `${e.target.value}px`;
    });

    elements.gap.addEventListener('input', (e) => {
        applyStyle('gap', `${e.target.value}px`);
        document.getElementById('gapValue').textContent = `${e.target.value}px`;
    });

    // ========== BORDER & SHAPE CONTROLS ==========
    elements.borderWidth.addEventListener('input', (e) => {
        applyStyle('borderWidth', `${e.target.value}px`);
        const targets = getTargetElements();
        targets.forEach(t => t.style.borderStyle = 'solid');
        document.getElementById('borderWidthValue').textContent = `${e.target.value}px`;
    });

    elements.borderRadius.addEventListener('input', (e) => {
        applyStyle('borderRadius', `${e.target.value}px`);
        document.getElementById('borderRadiusValue').textContent = `${e.target.value}px`;
    });

    // ========== EFFECTS CONTROLS ==========
    elements.shadowBlur.addEventListener('input', (e) => {
        const blur = e.target.value;
        const spread = elements.shadowSpread.value;
        applyStyle('boxShadow', `0 4px ${blur}px ${spread}px rgba(0, 0, 0, 0.3)`);
        document.getElementById('shadowBlurValue').textContent = `${blur}px`;
    });

    elements.shadowSpread.addEventListener('input', (e) => {
        const blur = elements.shadowBlur.value;
        const spread = e.target.value;
        applyStyle('boxShadow', `0 4px ${blur}px ${spread}px rgba(0, 0, 0, 0.3)`);
        document.getElementById('shadowSpreadValue').textContent = `${spread}px`;
    });

    elements.opacity.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        applyStyle('opacity', value);
        document.getElementById('opacityValue').textContent = `${e.target.value}%`;
    });

    elements.blur.addEventListener('input', (e) => {
        applyStyle('filter', `blur(${e.target.value}px)`);
        document.getElementById('blurValue').textContent = `${e.target.value}px`;
    });

    // ========== LAYOUT CONTROLS ==========
    elements.displayMode.addEventListener('change', (e) => {
        if (e.target.value) {
            applyStyle('display', e.target.value);
        }
    });

    elements.width.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value == 0) {
            applyStyle('width', 'auto');
            document.getElementById('widthValue').textContent = 'auto';
        } else {
            applyStyle('width', `${value}%`);
            document.getElementById('widthValue').textContent = `${value}%`;
        }
    });

    elements.scale.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        const rotate = elements.rotate.value;
        applyStyle('transform', `scale(${value}) rotate(${rotate}deg)`);
        document.getElementById('scaleValue').textContent = `${e.target.value}%`;
    });

    elements.rotate.addEventListener('input', (e) => {
        const scale = elements.scale.value / 100;
        const rotate = e.target.value;
        applyStyle('transform', `scale(${scale}) rotate(${rotate}deg)`);
        document.getElementById('rotateValue').textContent = `${rotate}deg`;
    });

    // ========== ADVANCED CONTROLS ==========
    elements.cascadeToChildren.addEventListener('change', (e) => {
        state.cascadeToChildren = e.target.checked;
    });

    elements.animateChanges.addEventListener('change', (e) => {
        state.animateChanges = e.target.checked;
    });

    elements.applyClass.addEventListener('click', () => {
        const className = elements.customClass.value.trim();
        if (className) {
            const targets = getTargetElements();
            targets.forEach(target => {
                target.classList.add(className);
            });
        }
    });

    // ========== HEADER CONTROLS ==========
    elements.toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    elements.savePreset.addEventListener('click', () => {
        saveCurrentState();
    });

    elements.exportCSS.addEventListener('click', () => {
        exportCSS();
    });

    elements.resetAll.addEventListener('click', () => {
        resetAllStyles();
    });

    // ========== VIEW MODE ==========
    elements.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            elements.canvas.classList.remove('tablet', 'mobile');
            if (mode !== 'desktop') {
                elements.canvas.classList.add(mode);
            }
        });
    });

    // ========== PRESETS ==========
    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
        });
    });

    // ========== PANEL TOGGLE ==========
    elements.togglePanel.addEventListener('click', () => {
        elements.controlPanel.classList.toggle('collapsed');
        elements.togglePanel.textContent = elements.controlPanel.classList.contains('collapsed') ? '▶' : '◀';
    });
}

// ============================================
// PRESETS
// ============================================
function applyPreset(preset) {
    const targets = getTargetElements();
    if (targets.length === 0) return;

    const presets = {
        modern: {
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            fontWeight: '500'
        },
        minimal: {
            borderRadius: '0px',
            padding: '16px',
            boxShadow: 'none',
            fontSize: '14px',
            fontWeight: '400',
            borderWidth: '1px',
            borderColor: '#e2e8f0'
        },
        bold: {
            borderRadius: '8px',
            padding: '32px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            fontSize: '20px',
            fontWeight: '700'
        },
        elegant: {
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            fontSize: '16px',
            fontWeight: '300',
            letterSpacing: '0.5px'
        },
        neon: {
            background: '#1e293b',
            color: '#0ff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            borderWidth: '2px',
            borderColor: '#0ff'
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.2)'
        }
    };

    const styles = presets[preset];
    if (styles) {
        targets.forEach(target => {
            Object.keys(styles).forEach(prop => {
                target.style[prop] = styles[prop];
                if (prop === 'borderWidth' || prop === 'borderColor') {
                    target.style.borderStyle = 'solid';
                }
            });
        });
    }
}

// ============================================
// SAVE & EXPORT
// ============================================
function saveCurrentState() {
    const stateToSave = {
        selectedElements: Array.from(state.selectedElements).map(el => el.className),
        targetMode: state.targetMode
    };
    localStorage.setItem('labState', JSON.stringify(stateToSave));
    alert('State saved successfully!');
}

function exportCSS() {
    const targets = getTargetElements();
    if (targets.length === 0) {
        alert('No elements selected to export');
        return;
    }

    let css = '/* Exported CSS from Web Component Laboratory */\n\n';

    targets.forEach((target, index) => {
        const className = target.className.replace('component', '').replace('selected', '').trim();
        css += `.${className || `element-${index + 1}`} {\n`;

        const style = target.style;
        for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            const value = style.getPropertyValue(prop);
            css += `  ${prop}: ${value};\n`;
        }

        css += '}\n\n';
    });

    // Copy to clipboard
    navigator.clipboard.writeText(css).then(() => {
        alert('CSS copied to clipboard!');
    }).catch(() => {
        // Fallback: show in alert
        alert(css);
    });
}

function resetAllStyles() {
    if (confirm('Reset all styles to original? This cannot be undone.')) {
        elements.components.forEach(comp => {
            const original = state.originalStyles.get(comp);
            if (original) {
                comp.style.cssText = '';
                comp.classList.remove('selected');
            }
        });
        state.selectedElements.clear();
        updateSelectionDisplay();
    }
}

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);
