<template>
    <div
        v-if="selectedElementIds.length > 0"
        class="element-action-toolbar"
        :class="{ 'single-element': selectedElementIds.length === 1 }"
    >
        <div class="selection-info">
            <span class="selected-count">
                {{ $t('selectedElementsContextMenu') }}
            </span>
        </div>

        <!-- Single Element Actions -->
        <template v-if="selectedElementIds.length === 1">
            <button @click="editElement" class="action-btn primary-action" :aria-label="$t('edit')">
                <i class="fas fa-edit"></i>
                <span class="btn-text">{{ $t('edit') }}</span>
            </button>

            <button @click="showNavigationSetup" class="action-btn" :aria-label="$t('navigateToOtherGrid')">
                <i class="fas fa-arrow-right"></i>
                <span class="btn-text">{{ $t('navigation') }}</span>
            </button>

            <button @click="showPropertyTransfer" class="action-btn" :aria-label="$t('transferProperties')">
                <i class="fas fa-angle-double-right"></i>
                <span class="btn-text">{{ $t('transferProperties') }}</span>
            </button>
        </template>

        <!-- Multi-Element Actions -->
        <div class="action-group">
            <button @click="duplicateElements" class="action-btn" :aria-label="$t('clone')">
                <i class="fas fa-clone"></i>
                <span class="btn-text">{{ $t('clone') }}</span>
            </button>

            <button @click="copyElements" class="action-btn" :aria-label="$t('copy')">
                <i class="fas fa-copy"></i>
                <span class="btn-text">{{ $t('copy') }}</span>
            </button>

            <button @click="cutElements" class="action-btn" :aria-label="$t('cut')">
                <i class="fas fa-cut"></i>
                <span class="btn-text">{{ $t('cut') }}</span>
            </button>

            <button @click="hideUnhideElements" class="action-btn" :aria-label="$t('hideUnhide')">
                <i class="fas fa-eye-slash"></i>
                <span class="btn-text">{{ $t('hideUnhide') }}</span>
            </button>
        </div>

        <div class="action-spacer"></div>

        <button @click="deleteElements" class="action-btn delete-btn" :aria-label="$t('delete')">
            <i class="fas fa-trash"></i>
            <span class="btn-text">{{ $t('delete') }}</span>
        </button>

        <button @click="clearSelection" class="action-btn clear-btn" :aria-label="$t('clearSelection')">
            <i class="fas fa-times"></i>
        </button>
    </div>
</template>

<script>
export default {
    name: 'ElementActionToolbar',
    props: {
        selectedElementIds: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        editElement() {
            this.$emit('edit-element', this.selectedElementIds[0]);
        },
        showNavigationSetup() {
            this.$emit('show-navigation-setup', this.selectedElementIds[0]);
        },
        showPropertyTransfer() {
            this.$emit('show-property-transfer', this.selectedElementIds[0]);
        },
        duplicateElements() {
            this.$emit('duplicate-elements', this.selectedElementIds);
        },
        copyElements() {
            this.$emit('copy-elements', this.selectedElementIds);
        },
        cutElements() {
            this.$emit('cut-elements', this.selectedElementIds);
        },
        hideUnhideElements() {
            this.$emit('hide-unhide-elements', this.selectedElementIds);
        },
        deleteElements() {
            this.$emit('delete-elements', this.selectedElementIds);
        },
        clearSelection() {
            this.$emit('clear-selection');
        }
    }
};
</script>

<style scoped>
.element-action-toolbar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 90vw;
    overflow-x: auto;
}

.selection-info {
    display: flex;
    align-items: center;
    margin-right: 8px;
    padding-right: 8px;
    border-right: 1px solid #dee2e6;
}

.selected-count {
    font-size: 12px;
    font-weight: 600;
    color: #6c757d;
    white-space: nowrap;
}

.action-group {
    display: flex;
    align-items: center;
    gap: 4px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    background: #fff;
    color: #495057;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.action-btn:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
}

.action-btn:active {
    background: #e9ecef;
}

.action-btn i {
    font-size: 14px;
}

.primary-action {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.primary-action:hover {
    background: #0056b3;
    border-color: #004085;
}

.delete-btn {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
}

.delete-btn:hover {
    background: #c82333;
    border-color: #bd2130;
}

.clear-btn {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
    background: #6c757d;
    color: white;
    border-color: #6c757d;
}

.clear-btn:hover {
    background: #545b62;
    border-color: #4e555b;
}

.action-spacer {
    flex: 1;
    min-width: 8px;
}

@media (max-width: 768px) {
    .element-action-toolbar {
        bottom: 10px;
        padding: 8px 12px;
        gap: 4px;
    }

    .btn-text {
        display: none;
    }

    .action-btn {
        padding: 8px;
        min-width: 36px;
        justify-content: center;
    }

    .selection-info {
        margin-right: 4px;
        padding-right: 4px;
    }

    .selected-count {
        font-size: 10px;
    }
}

@media (max-width: 480px) {
    .element-action-toolbar {
        left: 10px;
        right: 10px;
        transform: none;
    }

    .action-group {
        gap: 2px;
    }
}
</style>
