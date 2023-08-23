import { Plugin } from "obsidian";
import { toUpperCase, toLowerCase, toTitleCase } from "./text";

interface TextTransformSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: TextTransformSettings = {
    mySetting: "default",
};

export default class TextTransform extends Plugin {
    settings: TextTransformSettings;

    async onload() {
        await this.loadSettings();

        // Add default commands for transforming cases
        this.addCommand({
            id: "text-transform-uppercase",
            name: "Transform to Uppercase",
            hotkeys: [
                {
                    modifiers: ["Mod", "Shift"],
                    key: "U",
                },
            ],
            editorCallback: toUpperCase,
        });

        this.addCommand({
            id: "text-transform-Lowercase",
            name: "Transform to Lowercase",
            hotkeys: [
                {
                    modifiers: ["Mod"],
                    key: "U",
                },
            ],
            editorCallback: toLowerCase,
        });
        this.addCommand({
            id: "text-transform-title-case",
            name: "Transform to Title Case",
            hotkeys: [
                {
                    modifiers: ["Mod", "Alt"],
                    key: "U",
                },
            ],
            editorCallback: toTitleCase,
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
