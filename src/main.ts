import {
	App,
	ButtonComponent,
	Editor,
	Modal,
	Notice,
	Plugin,
	TextComponent,
	ToggleComponent,
	PluginSettingTab,
	Setting
} from 'obsidian';
import { getLanguage, languageType, getLanguageOptions } from './lang';



const DEFAULT_SETTINGS: RfrPluginSettings = {
	findText: '',
	replaceText: '',
	useRegEx: true,
	selOnly: false,
	caseInsensitive: false,
	processLineBreak: false,
	processTab: false,
	prefillFind: false,
	language: languageType.zh
}

// logThreshold: 0 ... only error messages
//               9 ... verbose output
const logThreshold = 9;
const logger = (logString: string, logLevel = 0): void => { if (logLevel <= logThreshold) console.log('RegexFiRe: ' + logString) };

export default class RegexFindReplacePlugin extends Plugin {
	settings: RfrPluginSettings;

	async onload() {
		logger('Loading Plugin...', 9);
		await this.loadSettings();

		this.addSettingTab(new RegexFindReplaceSettingTab(this.app, this));


		this.addCommand({
			id: 'obsidian-regex-replace',
			name: 'Find and Replace using regular expressions',
			editorCallback: (editor) => {
				new FindAndReplaceModal(this.app, editor, this.settings, this).open();
			},
		});
	}

	onunload() {
		logger('Bye!', 9);
	}

	async loadSettings() {
		logger('Loading Settings...', 6);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		logger('   findVal:         ' + this.settings.findText, 6);
		logger('   replaceText:     ' + this.settings.replaceText, 6);
		logger('   caseInsensitive: ' + this.settings.caseInsensitive, 6);
		logger('   processLineBreak: ' + this.settings.processLineBreak, 6);

	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

class FindAndReplaceModal extends Modal {
	constructor(app: App, editor: Editor, settings: RfrPluginSettings, plugin: Plugin) {
		super(app);
		this.editor = editor;
		this.settings = settings;
		this.plugin = plugin;
		this.language = getLanguage(settings.language);
	}

	settings: RfrPluginSettings;
	editor: Editor;
	plugin: Plugin;
	language: any;

	onOpen() {
		const { contentEl, titleEl, editor, modalEl } = this;

		modalEl.addClass('find-replace-modal');
		titleEl.setText(this.language.modalTitle);

		const rowClass = 'row';
		const divClass = 'div';
		const noSelection = editor.getSelection() === '';
		let regexFlags = 'gm';
		if (this.settings.caseInsensitive) regexFlags = regexFlags.concat('i');

		logger('No text selected?: ' + noSelection, 9);

		const addTextComponent = (label: string, placeholder: string, postfix = ''): [TextComponent, HTMLDivElement] => {
			const containerEl = document.createElement(divClass);
			containerEl.addClass(rowClass);

			const targetEl = document.createElement(divClass);
			targetEl.addClass('input-wrapper');

			const labelEl = document.createElement(divClass);
			labelEl.addClass('input-label');
			labelEl.setText(label);

			const labelEl2 = document.createElement(divClass);
			labelEl2.addClass('postfix-label');
			labelEl2.setText(postfix);

			containerEl.appendChild(labelEl);
			containerEl.appendChild(targetEl);
			containerEl.appendChild(labelEl2);

			const component = new TextComponent(targetEl);
			component.setPlaceholder(placeholder);

			contentEl.append(containerEl);
			return [component, labelEl2];
		};

		const addToggleComponent = (label: string, tooltip: string, hide = false): ToggleComponent => {
			const containerEl = document.createElement(divClass);
			containerEl.addClass(rowClass);

			const targetEl = document.createElement(divClass);
			targetEl.addClass(rowClass);

			const component = new ToggleComponent(targetEl);
			component.setTooltip(tooltip);

			const labelEl = document.createElement(divClass);
			labelEl.addClass('check-label');
			labelEl.setText(label);

			containerEl.appendChild(labelEl);
			containerEl.appendChild(targetEl);
			if (!hide) contentEl.appendChild(containerEl);
			return component;
		};

		// Create input fields
		const findRow = addTextComponent(this.language.findLabel, 'e.g. (.*)', '/' + regexFlags);
		const findInputComponent = findRow[0];
		const findRegexFlags = findRow[1];
		const replaceRow = addTextComponent(this.language.replaceLabel, 'e.g. $1', this.settings.processLineBreak ? '\\n=LF' : '');
		const replaceWithInputComponent = replaceRow[0];

		// Create and show regular expression toggle switch
		const regToggleComponent = addToggleComponent(this.language.useRegexLabel, this.language.useRegexTooltip);

		// Update regex-flags label if regular expressions are enabled or disabled
		regToggleComponent.onChange(regNew => {
			if (regNew) {
				findRegexFlags.setText('/' + regexFlags);
			}
			else {
				findRegexFlags.setText('');
			}
		})

		// Create and show selection toggle switch only if any text is selected
		const selToggleComponent = addToggleComponent(this.language.replaceOnlyInSelectionLabel, this.language.replaceOnlyInSelectionTooltip, noSelection);

		// Create Buttons
		const buttonContainerEl = document.createElement(divClass);
		buttonContainerEl.addClass(rowClass);

		const submitButtonTarget = document.createElement(divClass);
		submitButtonTarget.addClass('button-wrapper');
		submitButtonTarget.addClass(rowClass);

		const cancelButtonTarget = document.createElement(divClass);
		cancelButtonTarget.addClass('button-wrapper');
		cancelButtonTarget.addClass(rowClass);

		const submitButtonComponent = new ButtonComponent(submitButtonTarget);
		const cancelButtonComponent = new ButtonComponent(cancelButtonTarget);

		cancelButtonComponent.setButtonText(this.language.cancelButton);
		cancelButtonComponent.onClick(() => {
			logger('Action cancelled.', 8);
			this.close();
		});

		submitButtonComponent.setButtonText(this.language.replaceAllButton);
		submitButtonComponent.setCta();
		submitButtonComponent.onClick(() => {
			let resultString = 'No match';
			let scope = '';
			const searchString = findInputComponent.getValue();
			let replaceString = replaceWithInputComponent.getValue();
			const selectedText = editor.getSelection();

			if (searchString === '') {
				new Notice(this.language.nothingToSearchFor);
				return;
			}

			// Replace line breaks in find-field if option is enabled
			if (this.settings.processLineBreak) {
				logger('Replacing linebreaks in replace-field', 9);
				logger('  old: ' + replaceString, 9);
				replaceString = replaceString.replace(/\\n/gm, '\n');
				logger('  new: ' + replaceString, 9);
			}

			// Replace line breaks in find-field if option is enabled
			if (this.settings.processTab) {
				logger('Replacing tabs in replace-field', 9);
				logger('  old: ' + replaceString, 9);
				replaceString = replaceString.replace(/\\t/gm, '\t');
				logger('  new: ' + replaceString, 9);
			}

			// Check if regular expressions should be used
			if (regToggleComponent.getValue()) {
				logger('USING regex with flags: ' + regexFlags, 8);

				const searchRegex = new RegExp(searchString, regexFlags);
				if (!selToggleComponent.getValue()) {
					logger('   SCOPE: Full document', 9);
					const documentText = editor.getValue();
					const rresult = documentText.match(searchRegex);
					if (rresult) {
						editor.setValue(documentText.replace(searchRegex, replaceString));
						scope = this.language.scopeDocument;
						resultString = this.language.replacementResult.replace('{{count}}', rresult.length.toString()).replace('{{scope}}', scope);
					}
				}
				else {
					logger('   SCOPE: Selection', 9);
					const rresult = selectedText.match(searchRegex);
					if (rresult) {
						editor.replaceSelection(selectedText.replace(searchRegex, replaceString));
						scope = this.language.scopeSelection;
						resultString = this.language.replacementResult.replace('{{count}}', rresult.length.toString()).replace('{{scope}}', scope);
					}
				}
			}
			else {
				logger('NOT using regex', 8);
				let nrOfHits: number;
				if (!selToggleComponent.getValue()) {
					logger('   SCOPE: Full document', 9);
					scope = this.language.scopeDocument;
					const documentText = editor.getValue();
					const documentSplit = documentText.split(searchString);
					nrOfHits = documentSplit.length - 1;
					editor.setValue(documentSplit.join(replaceString));
				}
				else {
					logger('   SCOPE: Selection', 9);
					scope = this.language.scopeSelection;
					const selectedSplit = selectedText.split(searchString);
					nrOfHits = selectedSplit.length - 1;
					editor.replaceSelection(selectedSplit.join(replaceString));
				}
				resultString = this.language.replacementResult.replace('{{count}}', nrOfHits.toString()).replace('{{scope}}', scope);
			}

			// Saving settings (find/replace text and toggle switch states)
			this.settings.findText = searchString;
			this.settings.replaceText = replaceString;
			this.settings.useRegEx = regToggleComponent.getValue();
			this.settings.selOnly = selToggleComponent.getValue();
			this.plugin.saveData(this.settings);

			this.close();
			new Notice(resultString);
		});

		// Apply settings
		regToggleComponent.setValue(this.settings.useRegEx);
		selToggleComponent.setValue(this.settings.selOnly);
		replaceWithInputComponent.setValue(this.settings.replaceText);

		// Check if the prefill find option is enabled and the selection does not contain linebreaks
		if (this.settings.prefillFind && editor.getSelection().indexOf('\n') < 0 && !noSelection) {
			logger('Found selection without linebreaks and option is enabled -> fill', 9);
			findInputComponent.setValue(editor.getSelection());
			selToggleComponent.setValue(false);
		}
		else {
			logger('Restore find text', 9);
			findInputComponent.setValue(this.settings.findText);
		}

		// Add button row to dialog
		buttonContainerEl.appendChild(submitButtonTarget);
		buttonContainerEl.appendChild(cancelButtonTarget);
		contentEl.appendChild(buttonContainerEl);

		// If no text is selected, disable selection-toggle-switch
		if (noSelection) selToggleComponent.setValue(false);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class RegexFindReplaceSettingTab extends PluginSettingTab {
	plugin: RegexFindReplacePlugin;

	constructor(app: App, plugin: RegexFindReplacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Get current language
		const currentLanguage = getLanguage(this.plugin.settings.language);

		containerEl.createEl('h4', { text: currentLanguage.settingsTitle });

		new Setting(containerEl)
			.setName(currentLanguage.caseInsensitiveName)
			.setDesc(currentLanguage.caseInsensitiveDesc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.caseInsensitive)
				.onChange(async (value) => {
					logger('Settings update: caseInsensitive: ' + value);
					this.plugin.settings.caseInsensitive = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h4', { text: currentLanguage.generalSettingsTitle });

		// 设置语言
		const languageOptions = getLanguageOptions();
		new Setting(containerEl)
			.setName(currentLanguage.languageName)
			.setDesc(currentLanguage.languageDesc)
			.addDropdown(dropdown => {
				languageOptions.forEach(opt => {
					dropdown.addOption(opt.code, opt.name);
				});
				dropdown.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						logger('Settings update: language: ' + value);
						this.plugin.settings.language = value as languageType;
						await this.plugin.saveSettings();
						this.display();
					});
			});

		new Setting(containerEl)
			.setName(currentLanguage.processLineBreakName)
			.setDesc(currentLanguage.processLineBreakDesc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.processLineBreak)
				.onChange(async (value) => {
					logger('Settings update: processLineBreak: ' + value);
					this.plugin.settings.processLineBreak = value;
					await this.plugin.saveSettings();
				}));

		// Add processTab setting if not already present
		new Setting(containerEl)
			.setName(currentLanguage.processTabName)
			.setDesc(currentLanguage.processTabDesc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.processTab)
				.onChange(async (value) => {
					logger('Settings update: processTab: ' + value);
					this.plugin.settings.processTab = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(currentLanguage.prefillFindName)
			.setDesc(currentLanguage.prefillFindDesc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.prefillFind)
				.onChange(async (value) => {
					logger('Settings update: prefillFind: ' + value);
					this.plugin.settings.prefillFind = value;
					await this.plugin.saveSettings();
				}));
	}
}