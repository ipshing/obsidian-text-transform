import { Editor, EditorPosition, Plugin } from "obsidian";
import { convertToTitleCase } from "./text";
import { TextTransformSettingsTab } from "./settings";

interface TextTransformSettings {
    titleCaseIgnore: string[];
    wordBoundaryChars: string[];
}

const DEFAULT_SETTINGS: TextTransformSettings = {
    titleCaseIgnore: ["a", "an", "and", "as", "at", "but", "by", "for", "if", "in", "into", "nor", "of", "on", "or", "the", "to"],
    wordBoundaryChars: [],
};

export default class TextTransform extends Plugin {
    settings: TextTransformSettings;

    async onload() {
        // Load settings
        await this.loadSettings();
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
            name: "Select Word",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor);
                    editor.setSelection(info.fromSel, info.toSel);
                }
            },
        });
        this.addCommand({
            id: "select-word-ignore",
            name: "Select Word (Ignore Boundary Characters setting)",
            editorCallback: (editor) => {
                if (editor.hasFocus()) {
                    const info = this.getSelectionInfo(editor, true);
                    editor.setSelection(info.fromSel, info.toSel);
                }
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

    getSelectionInfo(editor: Editor, ignoreBoundaryChars = false): SelectionInfo {
        // check if selection has a length > 0
        let selectedText = editor.getSelection();
        const fromOrig = editor.getCursor("from");
        const toOrig = editor.getCursor("to");
        // Clone original positions
        const fromSel = structuredClone(fromOrig);
        const toSel = structuredClone(toOrig);
        // if === 0, get the word the cursor is in
        if (selectedText.length === 0) {
            // Set up boundary chars (include space, tab)
            const chars = [" ", "\t"];
            if (!ignoreBoundaryChars) {
                chars.push(...this.settings.wordBoundaryChars);
            }
            // Get line text
            const lineText = editor.getLine(fromOrig.line);
            fromSel.ch = 0;
            toSel.ch = lineText.length;
            // Read backward from cursor pos to nearest boundary char
            for (let i = fromOrig.ch - 1; i >= 0; i--) {
                const char = lineText[i];
                if (chars.contains(char)) {
                    fromSel.ch = i + 1;
                    break;
                }
            }
            // Read forward to next boundary char
            for (let i = toOrig.ch; i < lineText.length; i++) {
                const char = lineText[i];
                if (chars.contains(char)) {
                    toSel.ch = i;
                    break;
                }
            }
            // Get selected text based on modified range
            selectedText = editor.getRange(fromSel, toSel);
        }
        return { selectedText, fromOrig, toOrig, fromSel, toSel };
    }

    replaceSelection(editor: Editor, newText: string, info: SelectionInfo) {
        // Save original highlighted length
        const originalLength = editor.getSelection().length;

        // Replace the text using the specified range of the selected 'from' and 'to'
        editor.replaceRange(newText, info.fromSel, info.toSel);

        // If text is highlighted, check if 'newText' is shorter than 'originalLength'
        if (originalLength > 0 && newText.length < originalLength) {
            // Move 'to' cursor back by the difference
            info.toOrig.ch -= originalLength - newText.length;
        }
        // Reset selection (this will take care of no selected text, too)
        editor.setSelection(info.fromOrig, info.toOrig);
    }
}

interface SelectionInfo {
    selectedText: string;
    fromOrig: EditorPosition;
    toOrig: EditorPosition;
    fromSel: EditorPosition;
    toSel: EditorPosition;
}
