import { Plugin } from "obsidian";

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
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
