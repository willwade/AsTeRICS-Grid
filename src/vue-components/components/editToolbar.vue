<template>
    <div class="edit-toolbar-container">
        <!-- Primary Toolbar -->
        <header class="primary-toolbar" role="toolbar">
            <button @click="exitEditMode" class="toolbar-btn exit-edit-btn" :aria-label="$t('editingOff')">
                <i class="fas fa-eye"></i>
                <span class="btn-text">{{ $t('editingOff') }}</span>
            </button>

            <div class="toolbar-divider"></div>

            <button @click="save" class="toolbar-btn save-btn" :aria-label="$t('save')" :disabled="!canSave">
                <i class="fas fa-check"></i>
                <span class="btn-text">{{ $t('save') }}</span>
            </button>

            <button @click="showGridProperties" class="toolbar-btn" :aria-label="$t('gridSettings')">
                <i class="fas fa-cog"></i>
                <span class="btn-text">{{ $t('gridSettings') }}</span>
            </button>

            <button @click="createNewGrid" class="toolbar-btn" :aria-label="$t('newGrid')">
                <i class="fas fa-plus"></i>
                <span class="btn-text">{{ $t('newGrid') }}</span>
            </button>

            <button @click="showSearch" class="toolbar-btn" :aria-label="$t('search')">
                <i class="fas fa-search"></i>
                <span class="btn-text search-text">{{ $t('search') }}</span>
            </button>

            <button @click="showLayoutOptions" class="toolbar-btn" :aria-label="$t('layout')" ref="layoutButton">
                <i class="fas fa-th-large"></i>
                <span class="btn-text layout-text">{{ $t('layout') }}</span>
            </button>

            <div class="toolbar-spacer"></div>

            <button @click="undo" class="toolbar-btn" :aria-label="$t('undo')" :disabled="!canUndo">
                <i class="fas fa-undo"></i>
                <span class="btn-text">{{ $t('undo') }}</span>
            </button>

            <button @click="redo" class="toolbar-btn" :aria-label="$t('redo')" :disabled="!canRedo">
                <i class="fas fa-redo"></i>
                <span class="btn-text">{{ $t('redo') }}</span>
            </button>
        </header>

        <!-- Secondary Toolbar -->
        <header class="secondary-toolbar" role="toolbar">
            <button
                @click="toggleSelectionMode"
                class="toolbar-btn selection-mode-btn"
                :class="{ active: selectionMode }"
                :aria-label="$t('selectedElementsContextMenu')"
                ref="selectButton"
            >
                <i class="fas fa-mouse-pointer"></i>
                <span class="btn-text">{{ selectionMode ? $t('clear') : $t('select') }}</span>
            </button>

            <!-- Selection Mode Dropdown -->
            <div v-if="showSelectionOptions" class="selection-dropdown" ref="selectionDropdown">
                <button @click="setSingleSelectMode" class="dropdown-item" :class="{ active: !multiSelectMode }">
                    <i class="fas fa-mouse-pointer"></i>
                    {{ $t('selectedItem') }}
                </button>
                <button @click="setMultiSelectMode" class="dropdown-item" :class="{ active: multiSelectMode }">
                    <i class="fas fa-hand-pointer"></i>
                    {{ $t('allSelected') }}
                </button>
            </div>

            <div class="toolbar-divider"></div>

            <button @click="copyAllElements" class="toolbar-btn" :aria-label="$t('copyAllElements')">
                <i class="fas fa-copy"></i>
                <span class="btn-text">{{ $t('copyAllElements') }}</span>
            </button>

            <div class="toolbar-divider"></div>

            <button @click="createNewElement" class="toolbar-btn new-element-btn" :aria-label="$t('newElement')">
                <i class="fas fa-plus-square"></i>
                <span class="btn-text">{{ $t('newElement') }}</span>
            </button>

            <button @click="createManyElements" class="toolbar-btn" :aria-label="$t('manyNewElements')">
                <i class="fas fa-clone"></i>
                <span class="btn-text">{{ $t('manyNewElements') }}</span>
            </button>

            <div class="toolbar-divider"></div>

            <button
                @click="editGlobalGrid"
                class="toolbar-btn"
                :aria-label="$t('globalGrid')"
                v-if="showGlobalGridButton"
            >
                <i class="fas fa-globe"></i>
                <span class="btn-text">{{ $t('globalGrid') }}</span>
            </button>
        </header>

        <!-- Layout/Tools Dropdown Menu -->
        <div v-if="showTools" class="tools-dropdown" ref="toolsDropdown" :style="dropdownStyle">
            <div class="tools-section">
                <h4>{{ $t('layout') }}</h4>
                <button @click="moveAllUp" class="dropdown-item">
                    <i class="fas fa-angle-double-up"></i>
                    {{ $t('moveAllUp') }}
                </button>
                <button @click="moveAllRight" class="dropdown-item">
                    <i class="fas fa-angle-double-right"></i>
                    {{ $t('moveAllRight') }}
                </button>
                <button @click="moveAllDown" class="dropdown-item">
                    <i class="fas fa-angle-double-down"></i>
                    {{ $t('moveAllDown') }}
                </button>
                <button @click="moveAllLeft" class="dropdown-item">
                    <i class="fas fa-angle-double-left"></i>
                    {{ $t('moveAllLeft') }}
                </button>
                <div class="dropdown-divider"></div>
                <button @click="normalizeLayout" class="dropdown-item">
                    <i class="fas fa-th"></i>
                    {{ $t('normalizeGridLayout') }}
                </button>
                <button @click="fillWithEmpty" class="dropdown-item" :disabled="gridIsFull">
                    <i class="fas fa-fill"></i>
                    {{ $t('fillWithEmptyElements') }}
                </button>
            </div>

            <div class="tools-section">
                <h4>{{ $t('gridSettings') }}</h4>
                <button @click="translateGrid" class="dropdown-item">
                    <i class="fas fa-language"></i>
                    {{ $t('translateGrid') }}
                </button>
                <button @click="clearAllElements" class="dropdown-item">
                    <i class="fas fa-minus-circle"></i>
                    {{ $t('deleteAllElements') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'EditToolbar',
    props: {
        canSave: {
            type: Boolean,
            default: true
        },
        canUndo: {
            type: Boolean,
            default: false
        },
        canRedo: {
            type: Boolean,
            default: false
        },
        selectionMode: {
            type: Boolean,
            default: false
        },
        gridIsFull: {
            type: Boolean,
            default: false
        },
        showGlobalGridButton: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showTools: false,
            showSelectionOptions: false,
            multiSelectMode: false
        };
    },
    computed: {
        dropdownStyle() {
            // Calculate position relative to the layout button
            return {
                transform: 'translateX(-50%)',
                left: '50%'
            };
        }
    },
    methods: {
        exitEditMode() {
            this.$emit('exit-edit-mode');
        },
        save() {
            this.$emit('save');
        },
        showGridProperties() {
            this.$emit('show-grid-properties');
        },
        createNewGrid() {
            this.$emit('create-new-grid');
        },
        showSearch() {
            this.$emit('show-search');
        },
        showLayoutOptions() {
            this.showTools = !this.showTools;
        },
        undo() {
            this.$emit('undo');
        },
        redo() {
            this.$emit('redo');
        },
        copyAllElements() {
            this.$emit('copy-all-elements');
        },
        createNewElement() {
            this.$emit('create-new-element');
        },
        createManyElements() {
            this.$emit('create-many-elements');
        },
        editGlobalGrid() {
            this.$emit('edit-global-grid');
        },
        moveAllUp() {
            this.$emit('move-all', 'up');
            this.showTools = false;
        },
        moveAllRight() {
            this.$emit('move-all', 'right');
            this.showTools = false;
        },
        moveAllDown() {
            this.$emit('move-all', 'down');
            this.showTools = false;
        },
        moveAllLeft() {
            this.$emit('move-all', 'left');
            this.showTools = false;
        },
        normalizeLayout() {
            this.$emit('normalize-layout');
            this.showTools = false;
        },
        fillWithEmpty() {
            this.$emit('fill-with-empty');
            this.showTools = false;
        },
        translateGrid() {
            this.$emit('translate-grid');
            this.showTools = false;
        },
        clearAllElements() {
            this.$emit('clear-all-elements');
            this.showTools = false;
        },
        toggleSelectionMode() {
            if (this.selectionMode) {
                // Exit selection mode
                this.$emit('toggle-selection-mode');
                this.showSelectionOptions = false;
            } else {
                // Show selection options
                this.showSelectionOptions = !this.showSelectionOptions;
                if (this.showSelectionOptions) {
                    this.showTools = false; // Close layout dropdown if open
                }
            }
        },
        setSingleSelectMode() {
            this.multiSelectMode = false;
            this.showSelectionOptions = false;
            this.$emit('toggle-selection-mode', { multiSelect: false });
        },
        setMultiSelectMode() {
            this.multiSelectMode = true;
            this.showSelectionOptions = false;
            this.$emit('toggle-selection-mode', { multiSelect: true });
        },
        handleClickOutside(event) {
            // Handle layout dropdown
            if (
                this.showTools &&
                this.$refs.toolsDropdown &&
                this.$refs.layoutButton &&
                event.target &&
                !this.$refs.toolsDropdown.contains(event.target) &&
                !this.$refs.layoutButton.contains(event.target)
            ) {
                this.showTools = false;
            }

            // Handle selection dropdown
            if (
                this.showSelectionOptions &&
                this.$refs.selectionDropdown &&
                this.$refs.selectButton &&
                event.target &&
                !this.$refs.selectionDropdown.contains(event.target) &&
                !this.$refs.selectButton.contains(event.target)
            ) {
                this.showSelectionOptions = false;
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
    }
};
</script>

<style scoped>
.edit-toolbar-container {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.primary-toolbar,
.secondary-toolbar {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 8px;
    min-height: 48px;
}

.primary-toolbar {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.secondary-toolbar {
    background: #ffffff;
}

.toolbar-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: #fff;
    color: #495057;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
}

.toolbar-btn:active:not(:disabled) {
    background: #dee2e6;
}

.toolbar-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.toolbar-btn i {
    font-size: 16px;
}

.save-btn {
    background: #28a745;
    color: white;
    border-color: #28a745;
}

.save-btn:hover:not(:disabled) {
    background: #218838;
    border-color: #1e7e34;
}

.new-element-btn {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.new-element-btn:hover:not(:disabled) {
    background: #0056b3;
    border-color: #004085;
}

.selection-mode-btn.active {
    background: #ffc107;
    color: #212529;
    border-color: #ffc107;
}

.selection-mode-btn.active:hover {
    background: #e0a800;
    border-color: #d39e00;
}

/* Ensure dropdown positioning works correctly */
.toolbar-btn {
    position: relative;
}

.toolbar-spacer {
    flex: 1;
}

.toolbar-divider {
    width: 1px;
    height: 24px;
    background: #dee2e6;
    margin: 0 4px;
}

.tools-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    min-width: 220px;
    max-height: 400px;
    overflow-y: auto;
}

.selection-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    min-width: 180px;
    padding: 8px;
}

.tools-section {
    padding: 12px;
}

.tools-section:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
}

.tools-section h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    font-weight: 600;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: none;
    color: #495057;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    text-align: left;
}

.dropdown-item:hover:not(:disabled) {
    background: #f8f9fa;
}

.dropdown-item:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.dropdown-divider {
    height: 1px;
    background: #e9ecef;
    margin: 4px 0;
}

.btn-text {
    font-weight: 500;
}

.layout-text {
    margin: 0 auto;
}

@media (max-width: 768px) {
    .btn-text {
        display: none;
    }

    .search-text {
        display: none !important;
    }

    .toolbar-btn {
        padding: 8px;
        min-width: 40px;
        justify-content: center;
    }

    .primary-toolbar,
    .secondary-toolbar {
        padding: 6px 8px;
        gap: 4px;
    }
}

@media (max-width: 480px) {
    .toolbar-divider {
        display: none;
    }

    .tools-dropdown {
        right: 8px;
        left: 8px;
        transform: none !important;
    }
}
</style>
