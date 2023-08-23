import { Editor, MarkdownView } from "obsidian";

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

export function toTitleCase(editor: Editor, view: MarkdownView) {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const selection = editor.getSelection();
    // First put the string into lower case
    let titleCase = selection.toLowerCase();
    // Then transform to title case
    titleCase = titleCase.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
    editor.replaceSelection(titleCase);
    editor.setSelection(from, to);
}
