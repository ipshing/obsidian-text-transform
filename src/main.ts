import { Editor, EditorPosition, Plugin } from "obsidian";
import { convertToTitleCase } from "./text";
import { TextTransformSettingsTab } from "./settings";
import { lt, valid } from "semver";

interface TextTransformSettings {
    titleCaseIgnore: string[];
    wordBoundaryChars: string[];
    version: string;
    previousVersion: string;
}

const DEFAULT_SETTINGS: TextTransformSettings = {
    titleCaseIgnore: ["a", "an", "and", "as", "at", "but", "by", "for", "if", "in", "into", "nor", "of", "on", "or", "the", "to"],
    wordBoundaryChars: [],
    version: "",
    previousVersion: "",
};

export default class TextTransform extends Plugin {
    settings: TextTransformSettings;

    async onload() {
        // Load settings
        await this.loadSettings();
        // Check version
        await this.runVersionCheck();
        // Set up settings tab
        this.addSettingTab(new TextTransformSettingsTab(this.app, this));

        // Add default commands for transforming cases
        this.addCommand({
            id: "uppercase",
            name: "Transform to UPPERCASE",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor);
                    this.replaceSelection(editor, info.selectedText.toLocaleUpperCase(), info);
                }
            },
        });
        this.addCommand({
            id: "lowercase",
            name: "Transform to lowercase",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor);
                    this.replaceSelection(editor, info.selectedText.toLocaleLowerCase(), info);
                }
            },
        });
        this.addCommand({
            id: "title-case",
            name: "Transform to Title Case",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor);
                    const newText = convertToTitleCase(info.selectedText, this.settings.wordBoundaryChars, this.settings.titleCaseIgnore);
                    this.replaceSelection(editor, newText, info);
                }
            },
        });

        // Add command for selecting a word
        this.addCommand({
            id: "select-word",
            name: "Select word",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor);
                    editor.setSelection(info.wordFrom, info.wordTo);
                }
            },
        });
        this.addCommand({
            id: "select-word-ignore",
            name: "Select word (ignore boundary characters setting)",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor, true);
                    editor.setSelection(info.wordFrom, info.wordTo);
                }
            },
        });

        // Text manipulation
        this.addCommand({
            id: "delete-line",
            name: "Delete line",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    // Get cursor position for selection
                    const from = editor.getCursor("from");
                    const to = editor.getCursor("to");
                    // Determine new cursor position
                    const newCursor: EditorPosition = { ch: editor.getCursor("head").ch, line: from.line };
                    if (editor.getLine(to.line + 1).length < newCursor.ch) {
                        newCursor.ch = editor.getLine(to.line + 1).length;
                    }
                    // Set selection to encompass entire line(s)
                    from.ch = 0;
                    to.ch = editor.getLine(to.line).length;
                    // Replace with empty text then delete the line
                    editor.replaceRange("", from, to);
                    editor.exec("deleteLine");
                    // Set cursor
                    editor.setCursor(newCursor);
                }
            },
        });
        this.addCommand({
            id: "insert-line-above",
            name: "Insert line above",
            editorCallback: (editor) => {
                if (!editor.hasFocus()) return;
                // Get the cursor position using "head"
                const pos = editor.getCursor("head");
                // Get the full text of the line
                const lineText = editor.getLine(pos.line);
                // Get all white space at start of line
                const i = lineText.search(/\S/);
                const ws = i > -1 ? lineText.slice(0, i) : lineText;
                // Add line above, matching the leading white space
                editor.replaceRange(`${ws}\n`, { line: pos.line, ch: 0 });
                // Move cursor
                editor.setCursor({ line: pos.line, ch: ws.length });
            },
        });
        this.addCommand({
            id: "insert-line-below",
            name: "Insert line below",
            editorCallback: (editor) => {
                if (!editor.hasFocus()) return;
                // Get the cursor position using "head"
                const pos = editor.getCursor("head");
                // Get the full text of the line
                const lineText = editor.getLine(pos.line);
                // Get all white space at start of line
                const i = lineText.search(/\S/);
                const ws = i > -1 ? lineText.slice(0, i) : lineText;
                // Add line below, matching the leading white space
                editor.replaceRange(`\n${ws}`, { line: pos.line, ch: lineText.length });
                // Move cursor
                editor.setCursor({ line: pos.line + 1, ch: ws.length });
            },
        });

        console.log("Text Transform plugin loaded");
    }

    async onunload() {
        console.log("Text Transform plugin unloaded");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async runVersionCheck() {
        // Check previous version
        if (!valid(this.settings.version)) this.settings.version = "1.0.0";
        if (lt(this.settings.version, this.manifest.version)) {
            // Run updates here

            // Update version properties in settings
            this.settings.previousVersion = this.settings.version;
            this.settings.version = this.manifest.version;
            await this.saveSettings();
        }
    }

    getSelectionInfo(editor: Editor, ignoreBoundaryChars = false): SelectionInfo {
        // Get selected text/positions from editor
        let selectedText = editor.getSelection();
        const originalFrom = editor.getCursor("from");
        const originalTo = editor.getCursor("to");

        // Determine from/to positions for the whole word
        // (regardless of selected text)
        const wordFrom = structuredClone(originalFrom);
        const wordTo = structuredClone(originalTo);
        // Set up boundary chars (include space, tab)
        const boundaryChars = [" ", "\t"];
        if (!ignoreBoundaryChars) {
            boundaryChars.push(...this.settings.wordBoundaryChars);
        }
        // Get line text
        const lineText = editor.getLine(originalFrom.line);
        // Read backward from cursor pos to nearest boundary char
        for (let i = originalFrom.ch - 1; i >= 0; i--) {
            const char = lineText[i];
            if (boundaryChars.contains(char)) {
                wordFrom.ch = i + 1;
                break;
            }
        }
        // Read forward to next boundary char
        for (let i = originalTo.ch; i < lineText.length; i++) {
            const char = lineText[i];
            if (boundaryChars.contains(char)) {
                wordTo.ch = i;
                break;
            }
        }

        // Start selected positions using original positions
        let selectedFrom = structuredClone(originalFrom);
        let selectedTo = structuredClone(originalTo);
        // Use whole word positions if no text was selected
        if (selectedText.length == 0) {
            selectedFrom = structuredClone(wordFrom);
            selectedTo = structuredClone(wordTo);
        }

        // Get selected text based on modified range
        selectedText = editor.getRange(selectedFrom, selectedTo);

        return {
            selectedText,
            originalFrom: originalFrom,
            originalTo: originalTo,
            selectedFrom: selectedFrom,
            selectedTo: selectedTo,
            wordFrom: wordFrom,
            wordTo: wordTo,
        };
    }

    replaceSelection(editor: Editor, newText: string, info: SelectionInfo) {
        // Save original highlighted length
        const originalLength = editor.getSelection().length;

        // Replace the text using the specified range of the selected 'from' and 'to'
        editor.replaceRange(newText, info.selectedFrom, info.selectedTo);

        // If text is highlighted, check if 'newText' is shorter than 'originalLength'
        if (originalLength > 0 && newText.length < originalLength) {
            // Move 'to' cursor back by the difference
            info.originalTo.ch -= originalLength - newText.length;
        }
        // Reset selection (this will take care of no selected text, too)
        editor.setSelection(info.originalFrom, info.originalTo);
    }
}

interface SelectionInfo {
    selectedText: string;
    originalFrom: EditorPosition;
    originalTo: EditorPosition;
    selectedFrom: EditorPosition;
    selectedTo: EditorPosition;
    wordFrom: EditorPosition;
    wordTo: EditorPosition;
}
