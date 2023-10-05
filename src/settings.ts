import { App, PluginSettingTab, Setting } from "obsidian";
import TextTransform from "./main";

export class TextTransformSettingsTab extends PluginSettingTab {
    plugin: TextTransform;

    constructor(app: App, plugin: TextTransform) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.addClass("text-transform-settings");

        new Setting(containerEl)
            .setName("Title case exceptions")
            .setDesc("These words will be ignored when transforming text to title case. Each entry must be separated by a comma or space. Entries are case-insensitive.")
            .addText((text) => {
                // Set the value of the text box from the settings
                text.setValue(this.plugin.settings.titleCaseIgnore.join(", "));
                // Set up onChange handler
                text.onChange(async (value) => {
                    // Convert the string to an array, remove empty entries, ensure all lowercase
                    this.plugin.settings.titleCaseIgnore = value.split(/[\s,]+/).map((word) => word.toLowerCase());
                    // Save the updated list of words
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Word boundary characters")
            .setDesc("These characters will be used to determine word boundaries when transforming text. Spaces and tabs are always included.")
            .addText((text) => {
                // Set the value of the text box from the settings
                text.setValue(this.plugin.settings.wordBoundaryChars.join(""));
                // Set up onChange handler
                text.onChange(async (value) => {
                    this.plugin.settings.wordBoundaryChars = [...value.trim()];
                    await this.plugin.saveSettings();
                });
            });
    }
}
