<template>
    <div 
        :class="['selectable-grid-cell', { 
            'selection-mode': selectionMode,
            'selected': isSelected,
            'empty': isEmpty
        }]"
        :style="`grid-column: ${x + 1} / ${x + 1 + width}; grid-row: ${y + 1} / ${y + 1 + height};`"
        @click="handleClick"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        :data-x="x"
        :data-y="y">
        
        <!-- Show a visual indicator when in selection mode -->
        <div v-if="selectionMode && isEmpty" class="empty-cell-indicator">
            <i class="fas fa-plus-circle"></i>
        </div>
        
        <!-- Render actual element if not empty -->
        <slot v-if="!isEmpty"></slot>
    </div>
</template>

<script>
export default {
    name: 'SelectableGridCell',
    props: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            default: 1
        },
        height: {
            type: Number,
            default: 1
        },
        selectionMode: {
            type: Boolean,
            default: false
        },
        isSelected: {
            type: Boolean,
            default: false
        },
        isEmpty: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            touchStartTime: 0
        }
    },
    methods: {
        handleClick(event) {
            if (this.selectionMode) {
                this.$emit('cell-select', { x: this.x, y: this.y, event });
            } else if (this.isEmpty) {
                this.$emit('cell-create', { x: this.x, y: this.y, event });
            } else {
                this.$emit('cell-click', { x: this.x, y: this.y, event });
            }
        },
        handleTouchStart(event) {
            this.touchStartTime = Date.now();
            // Prevent scrolling while in selection mode
            if (this.selectionMode) {
                event.preventDefault();
            }
        },
        handleTouchEnd(event) {
            const touchDuration = Date.now() - this.touchStartTime;
            
            // Only trigger if it's a quick tap (not a long press or scroll)
            if (touchDuration < 500) {
                this.handleClick(event);
            }
        }
    }
}
</script>

<style scoped>
.selectable-grid-cell {
    position: relative;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
}

.selectable-grid-cell.selection-mode {
    cursor: pointer;
}

.selectable-grid-cell.selection-mode.empty {
    border-color: #dee2e6;
    background: rgba(0, 123, 255, 0.05);
}

.selectable-grid-cell.selection-mode.empty:hover {
    background: rgba(0, 123, 255, 0.1);
    border-color: #007bff;
}

.selectable-grid-cell.selected {
    background: rgba(0, 123, 255, 0.2) !important;
    border-color: #007bff !important;
    box-shadow: inset 0 0 0 2px #007bff;
}

.empty-cell-indicator {
    opacity: 0.5;
    color: #6c757d;
    font-size: 24px;
    transition: opacity 0.2s ease;
}

.selectable-grid-cell.selection-mode.empty:hover .empty-cell-indicator {
    opacity: 0.8;
    color: #007bff;
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .selectable-grid-cell {
        min-height: 80px; /* Larger touch targets */
    }
    
    .selectable-grid-cell.selection-mode.empty {
        background: rgba(0, 123, 255, 0.1);
    }
    
    .empty-cell-indicator {
        font-size: 32px; /* Larger icons for touch */
    }
}
</style>
