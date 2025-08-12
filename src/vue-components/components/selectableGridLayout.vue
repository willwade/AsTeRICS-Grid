<template>
    <div 
        class="selectable-grid-layout"
        :style="`
            display: grid; 
            grid-template-columns: repeat(${columns}, minmax(0, 1fr)); 
            grid-template-rows: repeat(${rows}, minmax(0, 1fr)); 
            gap: 1px;
            background-color: ${backgroundColor};
            width: 100%;
            height: 100%;
        `">
        
        <!-- Render all grid cells -->
        <selectable-grid-cell
            v-for="cell in allCells"
            :key="`cell-${cell.x}-${cell.y}`"
            :x="cell.x"
            :y="cell.y"
            :width="cell.width"
            :height="cell.height"
            :selection-mode="selectionMode"
            :is-selected="isCellSelected(cell.x, cell.y)"
            :is-empty="cell.isEmpty"
            @cell-select="handleCellSelect"
            @cell-create="handleCellCreate"
            @cell-click="handleCellClick">
            
            <!-- Render actual element if not empty -->
            <component
                v-if="!cell.isEmpty"
                :id="cell.element.id"
                :is="renderComponent"
                :element="cell.element"
                :metadata="metadata"
                :one-element-size="oneElementSize"
                :editable="editable"
                v-bind="$attrs"/>
        </selectable-grid-cell>
    </div>
</template>

<script>
import SelectableGridCell from './selectableGridCell.vue';

export default {
    name: 'SelectableGridLayout',
    components: { SelectableGridCell },
    props: {
        rows: Number,
        columns: Number,
        elements: Array,
        renderComponent: {
            type: [Object, String],
            default: null
        },
        backgroundColor: {
            type: String,
            default: '#ffffff'
        },
        editable: {
            type: Boolean,
            default: false
        },
        selectionMode: {
            type: Boolean,
            default: false
        },
        selectedCells: {
            type: Array,
            default: () => []
        },
        metadata: {
            type: Object,
            default: null
        },
        oneElementSize: {
            type: Object,
            default: null
        }
    },
    computed: {
        allCells() {
            const cells = [];
            const elementMap = new Map();
            
            // Create a map of existing elements by position
            this.elements.forEach(element => {
                for (let x = element.x; x < element.x + element.width; x++) {
                    for (let y = element.y; y < element.y + element.height; y++) {
                        elementMap.set(`${x}-${y}`, element);
                    }
                }
            });
            
            // Generate all grid cells
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.columns; x++) {
                    const key = `${x}-${y}`;
                    const existingElement = elementMap.get(key);
                    
                    if (existingElement && existingElement.x === x && existingElement.y === y) {
                        // This is the top-left corner of an existing element
                        cells.push({
                            x,
                            y,
                            width: existingElement.width,
                            height: existingElement.height,
                            isEmpty: false,
                            element: existingElement
                        });
                    } else if (!existingElement) {
                        // This is an empty cell
                        cells.push({
                            x,
                            y,
                            width: 1,
                            height: 1,
                            isEmpty: true,
                            element: null
                        });
                    }
                    // Skip cells that are part of a larger element (not top-left corner)
                }
            }
            
            return cells;
        }
    },
    methods: {
        isCellSelected(x, y) {
            return this.selectedCells.some(cell => cell.x === x && cell.y === y);
        },
        handleCellSelect(cellData) {
            this.$emit('cell-select', cellData);
        },
        handleCellCreate(cellData) {
            this.$emit('cell-create', cellData);
        },
        handleCellClick(cellData) {
            this.$emit('cell-click', cellData);
        }
    }
}
</script>

<style scoped>
.selectable-grid-layout {
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}
</style>
