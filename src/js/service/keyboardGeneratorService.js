import indexData from 'worldalphabets/data/index.json';

const alphabetCache = new Map();
const languageMap = new Map();

function buildFileName(code, script) {
    if (script) {
        return `${code}-${script}.json`;
    }
    return `${code}.json`;
}

for (let entry of indexData) {
    let code = entry.language;
    let script = entry.script || '';
    let file = entry.file || buildFileName(code, script);
    let language = languageMap.get(code);
    if (!language) {
        language = {
            code,
            name: entry.name || code,
            entries: new Map(),
            scripts: new Set(),
            defaultScript: script,
        };
        languageMap.set(code, language);
    }
    language.entries.set(script, {
        script,
        file,
        hasFrequency: entry.hasFrequency !== false,
        letterCount: entry.letterCount,
    });
    if (script) {
        language.scripts.add(script);
    }
    if (!language.defaultScript && script !== undefined) {
        language.defaultScript = script;
    }
    if (!language.name && entry.name) {
        language.name = entry.name;
    }
}

const languagesList = Array.from(languageMap.values())
    .map((lang) => ({
        code: lang.code,
        name: lang.name || lang.code,
        scripts: Array.from(lang.scripts),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

function resolveScriptEntry(language, script) {
    const langEntry = languageMap.get(language);
    if (!langEntry) {
        return null;
    }
    if (!script && langEntry.defaultScript !== undefined) {
        return langEntry.entries.get(langEntry.defaultScript) || null;
    }
    if (script === undefined || script === null) {
        return langEntry.entries.values().next().value || null;
    }
    if (langEntry.entries.has(script)) {
        return langEntry.entries.get(script);
    }
    const normalized = script.toString();
    for (let key of langEntry.entries.keys()) {
        if (key.toLowerCase() === normalized.toLowerCase()) {
            return langEntry.entries.get(key);
        }
    }
    return langEntry.entries.values().next().value || null;
}

async function loadAlphabet(language, script) {
    const entry = resolveScriptEntry(language, script);
    if (!entry) {
        throw new Error(`No alphabet data found for language "${language}".`);
    }
    const fileName = entry.file || buildFileName(language, entry.script);
    if (!alphabetCache.has(fileName)) {
        const module = await import(
            /* webpackChunkName: "worldalphabet-data", webpackMode: "lazy-once" */ `worldalphabets/data/alphabets/${fileName}`
        );
        alphabetCache.set(fileName, module.default || module);
    }
    return alphabetCache.get(fileName);
}

function toCase(value, letterCase, locale) {
    if (!value) {
        return value;
    }
    if (letterCase === 'uppercase') {
        return value.toLocaleUpperCase(locale);
    }
    if (letterCase === 'lowercase') {
        return value.toLocaleLowerCase(locale);
    }
    return value;
}

function getAlphabetLetters(alphabetData, letterCase, locale) {
    const preferred =
        letterCase === 'uppercase' ? alphabetData.uppercase : letterCase === 'lowercase' ? alphabetData.lowercase : null;
    if (Array.isArray(preferred) && preferred.length > 0) {
        return preferred.filter((item) => item && item.trim().length > 0);
    }
    if (Array.isArray(alphabetData.alphabetical) && alphabetData.alphabetical.length > 0) {
        return alphabetData.alphabetical
            .map((char) => toCase(char, letterCase, locale))
            .filter((item) => item && item.trim().length > 0);
    }
    const fallback = letterCase === 'uppercase' ? alphabetData.lowercase : alphabetData.uppercase;
    if (Array.isArray(fallback) && fallback.length > 0) {
        return fallback
            .map((char) => toCase(char, letterCase, locale))
            .filter((item) => item && item.trim().length > 0);
    }
    return [];
}

function mergeUnique(values, additional) {
    const seen = new Set();
    const result = [];
    for (let value of values.concat(additional || [])) {
        if (!value || !value.trim || value.trim().length === 0) {
            continue;
        }
        const key = value;
        if (!seen.has(key)) {
            seen.add(key);
            result.push(value);
        }
    }
    return result;
}

function getFrequencyOrder(alphabetData, letterCase, locale) {
    const frequency = alphabetData.frequency || {};
    const entries = Object.entries(frequency)
        .filter(([char]) => char && char.trim().length > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([char]) => toCase(char, letterCase, locale));

    const baseLetters = getAlphabetLetters(alphabetData, letterCase, locale);
    return mergeUnique(entries, baseLetters);
}

function getAlphabeticalOrder(alphabetData, letterCase, locale) {
    return getAlphabetLetters(alphabetData, letterCase, locale);
}

async function getCharacters(options = {}) {
    const { language, script, letterCase = 'lowercase', order = 'alphabetical', includeDigits = false } = options;
    if (!language) {
        throw new Error('No language specified.');
    }
    const alphabetData = await loadAlphabet(language, script);
    const locale = alphabetData.iso639_1 || language;
    let characters;
    if (order === 'frequency') {
        characters = getFrequencyOrder(alphabetData, letterCase, locale);
    } else {
        characters = getAlphabeticalOrder(alphabetData, letterCase, locale);
    }
    const digits = Array.isArray(alphabetData.digits) ? alphabetData.digits.filter((item) => item && item.trim().length > 0) : [];
    if (includeDigits && digits.length > 0) {
        characters = characters.concat(digits);
    }
    characters = mergeUnique(characters, []);
    return {
        characters,
        digitsAvailable: digits.length > 0,
        locale,
        alphabetName: alphabetData.language || language,
    };
}

function getLanguages() {
    return languagesList.slice();
}

function getScripts(language) {
    const lang = languageMap.get(language);
    if (!lang) {
        return [];
    }
    return Array.from(lang.scripts);
}

function getLanguageName(language) {
    const lang = languageMap.get(language);
    return lang ? lang.name || language : language;
}

const keyboardGeneratorService = {
    getLanguages,
    getLanguageName,
    getScripts,
    getCharacters,
};

export { keyboardGeneratorService };
