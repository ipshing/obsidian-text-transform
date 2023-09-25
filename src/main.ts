import { Plugin } from "obsidian";
import { toUpperCase, toLowerCase, toTitleCase } from "./text";
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
            name: "Transform to Uppercase",
            editorCallback: toUpperCase,
        });

        this.addCommand({
            id: "lowercase",
            name: "Transform to Lowercase",
            editorCallback: toLowerCase,
        });
        this.addCommand({
            id: "title-case",
            name: "Transform to Title Case",
            editorCallback: (editor) => toTitleCase(editor, this),
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
}
