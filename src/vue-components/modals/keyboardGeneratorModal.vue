<template>
    <div class="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container" @keyup.27="$emit('close')" @keyup.ctrl.enter="generate">
                    <a class="inline close-button" href="javascript:void(0);" @click="$emit('close')"><i class="fas fa-times"/></a>
                    <div class="modal-header">
                        <h1>{{ $t('keyboardGenerator') }}</h1>
                    </div>

                    <div class="modal-body">
                        <div class="srow">
                            <label class="four columns" for="keyboardLanguage">{{ $t('language') }}</label>
                            <div class="eight columns">
                                <select id="keyboardLanguage" v-model="selectedLanguage" @change="onLanguageSelect">
                                    <option value="" disabled>{{ $t('selectLanguage') }}</option>
                                    <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                                        {{ lang.name }} ({{ lang.code }})
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="srow" v-if="scripts.length > 0">
                            <label class="four columns" for="keyboardScript">{{ $t('script') }}</label>
                            <div class="eight columns">
                                <select id="keyboardScript" v-model="selectedScript" @change="onScriptSelect">
                                    <option v-for="script in scripts" :key="script" :value="script">{{ script }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="srow">
                            <label class="four columns">{{ $t('letterCase') }}</label>
                            <div class="eight columns radio-group">
                                <label>
                                    <input type="radio" value="lowercase" v-model="letterCase" @change="updatePreview"/>
                                    {{ $t('lowercase') }}
                                </label>
                                <label>
                                    <input type="radio" value="uppercase" v-model="letterCase" @change="updatePreview"/>
                                    {{ $t('uppercase') }}
                                </label>
                            </div>
                        </div>

                        <div class="srow">
                            <label class="four columns">{{ $t('order') }}</label>
                            <div class="eight columns radio-group">
                                <label>
                                    <input type="radio" value="frequency" v-model="order" @change="updatePreview"/>
                                    {{ $t('frequencyOrder') }}
                                </label>
                                <label>
                                    <input type="radio" value="alphabetical" v-model="order" @change="updatePreview"/>
                                    {{ $t('alphabeticalOrder') }}
                                </label>
                            </div>
                        </div>

                        <div class="srow">
                            <label class="four columns" for="includeDigits">{{ $t('includeDigits') }}</label>
                            <div class="eight columns">
                                <input id="includeDigits" type="checkbox" v-model="includeDigits" :disabled="!digitsAvailable" @change="onIncludeDigitsChange"/>
                                <span v-if="!digitsAvailable" class="hint">{{ $t('digitsNotAvailable') }}</span>
                            </div>
                        </div>

                        <div class="srow">
                            <label class="four columns">{{ $t('layoutStyle') }}</label>
                            <div class="eight columns radio-group">
                                <label>
                                    <input type="radio" value="grid" v-model="layout" @change="onLayoutChange"/>
                                    {{ $t('layoutRowColumn') }}
                                </label>
                                <label>
                                    <input type="radio" value="linear" v-model="layout" @change="onLayoutChange"/>
                                    {{ $t('layoutLinear') }}
                                </label>
                            </div>
                        </div>

                        <div class="srow" v-if="layout === 'grid'">
                            <label class="four columns" for="keyboardColumns">{{ $t('columns') }}</label>
                            <div class="eight columns">
                                <input
                                    id="keyboardColumns"
                                    type="number"
                                    min="1"
                                    v-model.number="columns"
                                    @input="onColumnsInput"
                                    @blur="normalizeColumns"
                                />
                                <div class="hint">{{ $t('keyboardColumnHint') }}</div>
                            </div>
                        </div>

                        <div class="srow">
                            <label class="four columns">{{ $t('keyboardPreview') }}</label>
                            <div class="eight columns">
                                <div class="preview-container" :class="{ loading: previewLoading }">
                                    <div v-if="previewLoading" class="preview-loading">
                                        <i class="fas fa-spinner fa-spin" aria-hidden="true"/>
                                    </div>
                                    <div v-else-if="previewError" class="preview-error">{{ previewError }}</div>
                                    <div v-else-if="previewCharacters.length === 0" class="preview-empty">{{ $t('noElements') }}</div>
                                    <div v-else class="preview-grid" :style="previewStyle">
                                        <div v-for="(char, index) in previewCharacters" :key="index" class="preview-cell">{{ char }}</div>
                                    </div>
                                </div>
                                <div class="preview-meta" v-if="previewCharacters.length > 0">
                                    <span>{{ previewCharacters.length }} {{ $t('elements') }}</span>
                                    <span>• {{ $t('keyboardLayoutSize', [previewRows, effectiveColumns]) }}</span>
                                </div>
                                <div class="hint">{{ $t('keyboardGenerationReplacesWarning') }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="button-container srow">
                            <button class="four columns offset-by-four" @click="$emit('close')" :title="$t('keyboardEsc')">
                                <i class="fas fa-times"/> <span>{{ $t('cancel') }}</span>
                            </button>
                            <button
                                class="four columns"
                                @click="generate"
                                :title="$t('keyboardCtrlEnter')"
                                :disabled="generating || !canGenerate"
                            >
                                <i v-if="!generating" class="fas fa-check"/>
                                <i v-else class="fas fa-spinner fa-spin"/>
                                <span>{{ $t('generateKeyboard') }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './../../css/modal.css';
import { GridElement } from '../../js/model/GridElement';
import { GridData } from '../../js/model/GridData';
import { i18nService } from '../../js/service/i18nService';
import { keyboardGeneratorService } from '../../js/service/keyboardGeneratorService';
import { log } from '../../js/util/log';

export default {
    props: ['gridData', 'undoService'],
    data() {
        return {
            languages: [],
            selectedLanguage: '',
            scripts: [],
            selectedScript: '',
            letterCase: 'lowercase',
            order: 'frequency',
            includeDigits: false,
            layout: 'grid',
            columns: 6,
            columnsTouched: false,
            previewCharacters: [],
            previewLoading: false,
            previewError: '',
            digitsAvailable: true,
            previewLocale: '',
            previewRequestId: 0,
            generating: false,
        };
    },
    computed: {
        effectiveColumns() {
            if (this.layout === 'linear') {
                return Math.max(1, this.previewCharacters.length || 1);
            }
            const parsed = parseInt(this.columns, 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
        },
        previewRows() {
            if (this.previewCharacters.length === 0) {
                return 0;
            }
            if (this.layout === 'linear') {
                return 1;
            }
            return Math.ceil(this.previewCharacters.length / this.effectiveColumns);
        },
        previewStyle() {
            const columns = this.layout === 'linear' ? Math.max(1, this.previewCharacters.length || 1) : this.effectiveColumns;
            return {
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            };
        },
        canGenerate() {
            return this.selectedLanguage && this.previewCharacters.length > 0 && !this.previewLoading;
        },
    },
    methods: {
        async loadLanguages() {
            this.languages = keyboardGeneratorService.getLanguages();
        },
        async mountedSetup() {
            await this.loadLanguages();
            const defaultLang = this.findDefaultLanguage();
            if (defaultLang) {
                this.selectedLanguage = defaultLang;
                await this.handleLanguageChange(defaultLang);
            }
        },
        findDefaultLanguage() {
            if (!this.languages || this.languages.length === 0) {
                return '';
            }
            const contentLang = i18nService.getContentLangBase();
            if (this.languages.some((lang) => lang.code === contentLang)) {
                return contentLang;
            }
            if (this.languages.some((lang) => lang.code === 'en')) {
                return 'en';
            }
            return this.languages[0].code;
        },
        async onLanguageSelect() {
            await this.handleLanguageChange(this.selectedLanguage);
        },
        async handleLanguageChange(language) {
            this.previewError = '';
            this.previewCharacters = [];
            this.columnsTouched = false;
            this.includeDigits = false;
            if (!language) {
                this.scripts = [];
                this.selectedScript = '';
                this.digitsAvailable = false;
                return;
            }
            const scripts = keyboardGeneratorService.getScripts(language) || [];
            this.scripts = scripts;
            this.selectedScript = scripts.length > 0 ? scripts[0] : '';
            await this.updatePreview();
        },
        async onScriptSelect() {
            this.columnsTouched = false;
            await this.updatePreview();
        },
        async onIncludeDigitsChange() {
            if (this.includeDigits && !this.digitsAvailable) {
                this.includeDigits = false;
                return;
            }
            await this.updatePreview();
        },
        onLayoutChange() {
            this.columnsTouched = false;
            if (this.layout === 'grid') {
                this.columns = this.suggestedColumns(this.previewCharacters.length);
            }
        },
        onColumnsInput() {
            this.columnsTouched = true;
        },
        normalizeColumns() {
            if (!this.columns || this.columns < 1) {
                this.columns = 1;
            }
        },
        suggestedColumns(length) {
            if (this.layout === 'linear') {
                return Math.max(1, length || 1);
            }
            if (!length) {
                return this.columns || 1;
            }
            const approx = Math.ceil(Math.sqrt(length));
            return Math.max(3, approx);
        },
        async updatePreview() {
            if (!this.selectedLanguage) {
                this.previewCharacters = [];
                this.digitsAvailable = false;
                this.previewLocale = '';
                return;
            }
            const requestId = ++this.previewRequestId;
            this.previewLoading = true;
            this.previewError = '';
            try {
                const result = await keyboardGeneratorService.getCharacters({
                    language: this.selectedLanguage,
                    script: this.selectedScript,
                    letterCase: this.letterCase,
                    order: this.order,
                    includeDigits: this.includeDigits,
                });
                if (requestId !== this.previewRequestId) {
                    return;
                }
                this.previewCharacters = result.characters;
                this.digitsAvailable = result.digitsAvailable;
                this.previewLocale = result.locale;
                if (this.includeDigits && !result.digitsAvailable) {
                    this.includeDigits = false;
                }
                if (!this.columnsTouched && this.layout === 'grid') {
                    this.columns = this.suggestedColumns(result.characters.length);
                }
            } catch (error) {
                if (requestId !== this.previewRequestId) {
                    return;
                }
                log.warn(error);
                this.previewError = error && error.message ? error.message : String(error);
                this.previewCharacters = [];
                this.digitsAvailable = false;
                this.previewLocale = '';
            } finally {
                if (requestId === this.previewRequestId) {
                    this.previewLoading = false;
                }
            }
        },
        async generate() {
            if (!this.canGenerate || this.generating) {
                return;
            }
            this.generating = true;
            this.previewError = '';
            try {
                const characters = this.previewCharacters.slice();
                if (!characters || characters.length === 0) {
                    this.previewError = this.$t('noElements');
                    this.generating = false;
                    return;
                }
                const columns = this.layout === 'linear' ? Math.max(1, characters.length) : this.effectiveColumns;
                const rows = this.layout === 'linear' ? 1 : Math.max(1, Math.ceil(characters.length / columns));
                const locale = this.previewLocale || this.selectedLanguage;

                const gridDataObject = new GridData(this.gridData);
                gridDataObject.gridElements = [];
                gridDataObject.minColumnCount = columns;
                gridDataObject.rowCount = rows;

                characters.forEach((char, index) => {
                    const element = new GridElement({
                        label: i18nService.getTranslationObject(char, locale),
                        x: index % columns,
                        y: Math.floor(index / columns),
                    });
                    gridDataObject.gridElements.push(element);
                });

                await this.undoService.updateGrid(gridDataObject);
                this.$emit('reload', gridDataObject);
                this.$emit('close');
            } catch (error) {
                log.warn(error);
                this.previewError = error && error.message ? error.message : String(error);
            } finally {
                this.generating = false;
            }
        },
    },
    async mounted() {
        await this.mountedSetup();
    },
};
</script>

<style scoped>
.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}

.srow {
    margin-top: 1em;
}

.radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
}

.radio-group label {
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.preview-container {
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    padding: 0.75em;
    min-height: 4em;
    position: relative;
}

.preview-container.loading {
    opacity: 0.7;
}

.preview-loading,
.preview-error,
.preview-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3em;
    text-align: center;
}

.preview-error {
    color: #c0392b;
}

.preview-grid {
    display: grid;
    gap: 0.5em;
    justify-items: center;
}

.preview-cell {
    border: 1px solid var(--border-color, #ccc);
    padding: 0.5em 0.75em;
    border-radius: 4px;
    font-size: 1.2em;
    line-height: 1.4;
    min-width: 2.5em;
}

.preview-meta {
    margin-top: 0.5em;
    display: flex;
    gap: 0.75em;
    font-size: 0.9em;
    color: var(--text-muted-color, #555);
}

.hint {
    font-size: 0.85em;
    color: var(--text-muted-color, #666);
    margin-top: 0.25em;
}
</style>
