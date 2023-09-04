import { Editor, MarkdownView } from "obsidian";
import TextTransform from "./main";

export function toUpperCase(editor: Editor, view: MarkdownView) {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const selection = editor.getSelection();
    editor.replaceSelection(selection.toUpperCase());
    editor.setSelection(from, to);
}

export function toLowerCase(editor: Editor, view: MarkdownView) {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const selection = editor.getSelection();
    editor.replaceSelection(selection.toLowerCase());
    editor.setSelection(from, to);
}

export function toTitleCase(editor: Editor, plugin: TextTransform) {
    // Get the selected text
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const selection = editor.getSelection();

    // First put the string into lower case
    let transformed = selection.toLowerCase();
    // Replace all chars in wordBoundaryChars with spaces
    for (const char of plugin.settings.wordBoundaryChars) {
        transformed = transformed.replace(char, " ");
    }
    // Split using space as separator
    const words = transformed.split(" ");
    // Transform words
    transformed = "";
    for (const word of words) {
        // Check for ignored words
        if (plugin.settings.titleCaseIgnore.includes(word)) {
            transformed += word + " ";
            continue;
        }
        // Transform first character
        if (word.length > 0) {
            transformed += word[0].toUpperCase();
        }
        // Add in remaining characters
        if (word.length > 1) {
            transformed += word.slice(1);
        }
        // Add separator (space)
        transformed += " ";
    }
    // Replace spaces with original characters
    for (const [i, char] of [...selection].entries()) {
        if (plugin.settings.wordBoundaryChars.includes(char)) {
            transformed = transformed.slice(0, i) + char + transformed.slice(i + 1);
        }
    }

    // Replace the selection and re-highlight
    editor.replaceSelection(transformed.trim());
    editor.setSelection(from, to);
}
