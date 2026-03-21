import {
    App,
    ButtonComponent,
    Editor,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    TextComponent,
    ToggleComponent
} from 'obsidian';
import { getLanguage, getLanguageOptions, languageType } from './lang';
import SettingsInfoInterface from "./types/SettingsInfoInterface";
import LanguageTranslationInterface from "./types/LanguageTranslationInterface";
import HistoryItemInterface from "./types/HistoryItemInterface";


/**
 * 默认设置
 */
const DEFAULT_SETTINGS: SettingsInfoInterface = {
    findText: '',
    replaceText: '',
    useRegEx: true,
    selOnly: false,
    caseInsensitive: false,
    processLineBreak: false,
    processTab: false,
    prefillFind: false,
    language: languageType.zh,
    enableHistory: true,
    historyLimit: 10
}

// logThreshold: 0 ... 仅错误信息
//               9 ... 详细输出
const logThreshold = 9;
const logger = (logString: string, logLevel = 0): void => {
    if (logLevel <= logThreshold) console.log('RegexFiRe: ' + logString)
};

export default class RegexFindReplacePlugin extends Plugin {
    settings: SettingsInfoInterface;
    history: HistoryItemInterface[] = [];

    async onload() {
        logger('加载插件...', 9);
        await this.loadSettings();
        await this.loadHistory();

        // 添加设置选项卡
        this.addSettingTab(new RegexFindReplaceSettingTab(this.app, this));

        // 添加命令，用于打开查找替换模态框
        this.addCommand({
            id: 'Regex Find & Replace(Enhance)',
            name: getLanguage(this.settings.language).commandName,
            editorCallback: (editor) => {
                new FindAndReplaceModal(this.app, editor, this.settings, this).open();
            },
        });
    }

    onunload() {
        logger('再见！', 9);
    }

    async loadSettings() {
        logger('加载设置...', 6);
        // 合并默认设置和保存的设置，排除 history 字段
        const savedData = await this.loadData();
        if (savedData) {
            const { ...settingsData } = savedData;
            this.settings = Object.assign({}, DEFAULT_SETTINGS, settingsData);
        } else {
            this.settings = { ...DEFAULT_SETTINGS };
        }
        logger('   findVal:         ' + this.settings.findText, 6);
        logger('   replaceText:     ' + this.settings.replaceText, 6);
        logger('   caseInsensitive: ' + this.settings.caseInsensitive, 6);
        logger('   processLineBreak: ' + this.settings.processLineBreak, 6);

    }

    async saveSettings() {
        // 保存设置到磁盘，保留历史记录
        const currentData = await this.loadData();
        await this.saveData({
            ...currentData,
            ...this.settings
        });
    }

    async loadHistory() {
        logger('加载历史记录...', 6);
        const savedData = await this.loadData();
        if (savedData && Array.isArray(savedData.history)) {
            this.history = savedData.history;
            logger('   加载了 ' + this.history.length + ' 条历史记录', 6);
        }
    }

    async saveHistory() {
        logger('保存历史记录...', 6);
        const currentData = await this.loadData();
        await this.saveData({
            ...currentData,
            history: this.history
        });
    }

    async addToHistory(item: HistoryItemInterface) {
        if (!this.settings.enableHistory) return;

        // 移除重复项
        this.history = this.history.filter(h =>
            h.findText !== item.findText ||
            h.replaceText !== item.replaceText ||
            h.useRegEx !== item.useRegEx
        );

        // 添加到历史记录开头
        this.history.unshift(item);

        // 限制历史记录数量
        if (this.history.length > this.settings.historyLimit) {
            this.history = this.history.slice(0, this.settings.historyLimit);
        }

        await this.saveHistory();
    }

    getHistory() {
        return this.history;
    }

}

class FindAndReplaceModal extends Modal {
    constructor(app: App, editor: Editor, settings: SettingsInfoInterface, plugin: RegexFindReplacePlugin) {
        super(app);
        this.editor = editor;
        this.settings = settings;
        this.plugin = plugin;
        this.language = getLanguage(settings.language);
    }

    settings: SettingsInfoInterface;
    editor: Editor;
    plugin: RegexFindReplacePlugin;
    language: LanguageTranslationInterface;

    // 存储组件引用，用于在onClose中保存设置
    findInputComponent: TextComponent;
    replaceWithInputComponent: TextComponent;
    regToggleComponent: ToggleComponent;
    selToggleComponent: ToggleComponent;
    caseInsensitiveToggleComponent: ToggleComponent;
    processLineBreakToggleComponent: ToggleComponent;
    processTabToggleComponent: ToggleComponent;
    prefillFindToggleComponent: ToggleComponent;

    // 保存设置选项
    saveSettings(findInputComponent: TextComponent, replaceWithInputComponent: TextComponent, regToggleComponent: ToggleComponent, selToggleComponent: ToggleComponent, caseInsensitiveToggleComponent: ToggleComponent, processLineBreakToggleComponent: ToggleComponent, processTabToggleComponent: ToggleComponent, prefillFindToggleComponent: ToggleComponent) {
        // 保存设置（查找/替换文本和开关状态）
        this.settings.findText = findInputComponent.getValue();
        this.settings.replaceText = replaceWithInputComponent.getValue();
        this.settings.useRegEx = regToggleComponent.getValue();
        this.settings.selOnly = selToggleComponent.getValue();
        this.settings.caseInsensitive = caseInsensitiveToggleComponent.getValue();
        this.settings.processLineBreak = processLineBreakToggleComponent.getValue();
        this.settings.processTab = processTabToggleComponent.getValue();
        this.settings.prefillFind = prefillFindToggleComponent.getValue();
        this.plugin.saveData(this.settings);
        logger('设置已保存', 6);
    }

    onOpen() {
        const { contentEl, titleEl, editor, modalEl } = this;

        modalEl.addClass('find-replace-modal');
        titleEl.setText(this.language.modalTitle);

        const rowClass = 'row';
        const divClass = 'div';

        // 创建两列容器
        const leftColumn = document.createElement(divClass);
        leftColumn.style.display = 'flex';
        leftColumn.style.flexDirection = 'column';
        leftColumn.style.width = '48%';
        leftColumn.style.marginRight = '4%';

        const rightColumn = document.createElement(divClass);
        rightColumn.style.display = 'flex';
        rightColumn.style.flexDirection = 'column';
        rightColumn.style.width = '48%';

        // 创建容器来包裹两列
        const toggleContainer = document.createElement(divClass);
        toggleContainer.style.display = 'flex';
        toggleContainer.style.flexWrap = 'wrap';
        toggleContainer.style.width = '100%';
        toggleContainer.appendChild(leftColumn);
        toggleContainer.appendChild(rightColumn);

        // 添加到主内容容器
        contentEl.appendChild(toggleContainer);
        //是否未选中文字
        const noSelection: boolean = editor.getSelection() === '';
        // 初始化正则表达式标志
        let regexFlags = 'gm';
        if (this.settings.caseInsensitive) regexFlags = regexFlags.concat('i');

        logger('是否未选择文本?: ' + noSelection, 9);

        // 添加文本输入组件
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

        // 添加开关组件
        const addToggleComponent = (label: string, tooltip: string, hide = false, column?: HTMLElement): [ToggleComponent, HTMLDivElement] => {
            const containerEl = document.createElement(divClass);
            containerEl.addClass(rowClass);
            containerEl.style.display = 'flex';
            containerEl.style.alignItems = 'center';
            containerEl.style.marginBottom = '10px';
            containerEl.style.width = '100%';
            containerEl.style.marginTop = "0";
            containerEl.style.justifyContent = 'space-between';

            const targetEl = document.createElement(divClass);
            targetEl.addClass(rowClass);
            targetEl.style.marginTop = "0";
            const component = new ToggleComponent(targetEl);
            component.setTooltip(tooltip);

            const labelEl = document.createElement(divClass);
            labelEl.addClass('check-label');
            labelEl.setText(label);
            labelEl.style.whiteSpace = 'nowrap';

            containerEl.appendChild(labelEl);
            containerEl.appendChild(targetEl);
            if (!hide) {
                if (column) {
                    column.appendChild(containerEl);
                } else {
                    contentEl.appendChild(containerEl);
                }
            }
            return [component, containerEl];
        };

        // 创建输入字段
        const findRow = addTextComponent(this.language.findLabel, '例如: (.*)', '/' + regexFlags);
        this.findInputComponent = findRow[0];
        const findInputComponent = this.findInputComponent;
        const findRegexFlags = findRow[1];
        const replaceRow = addTextComponent(this.language.replaceLabel, '例如: $1', this.settings.processLineBreak ? '\n=LF' : '');
        this.replaceWithInputComponent = replaceRow[0];
        const replaceWithInputComponent = this.replaceWithInputComponent;

        // 创建并显示正则表达式开关
        const regToggleRow = addToggleComponent(this.language.useRegexLabel, this.language.useRegexTooltip, false, leftColumn);
        this.regToggleComponent = regToggleRow[0];
        const regToggleComponent = this.regToggleComponent;
        // const regToggleContainer = regToggleRow[1];

        // 仅当有文本被选中时创建并显示选择开关
        const selToggleRow = addToggleComponent(this.language.replaceOnlyInSelectionLabel, this.language.replaceOnlyInSelectionTooltip, noSelection, leftColumn);
        this.selToggleComponent = selToggleRow[0];
        const selToggleComponent = this.selToggleComponent;
        // const selToggleContainer = selToggleRow[1];

        // 创建其他设置开关
        const caseInsensitiveToggleRow = addToggleComponent(this.language.caseInsensitiveName, this.language.caseInsensitiveDesc, false, rightColumn);
        this.caseInsensitiveToggleComponent = caseInsensitiveToggleRow[0];
        const caseInsensitiveToggleComponent = this.caseInsensitiveToggleComponent;
        const caseInsensitiveToggleContainer = caseInsensitiveToggleRow[1];

        const processLineBreakToggleRow = addToggleComponent(this.language.processLineBreakName, this.language.processLineBreakDesc, false, rightColumn);
        this.processLineBreakToggleComponent = processLineBreakToggleRow[0];
        const processLineBreakToggleComponent = this.processLineBreakToggleComponent;
        const processLineBreakToggleContainer = processLineBreakToggleRow[1];

        const processTabToggleRow = addToggleComponent(this.language.processTabName, this.language.processTabDesc, false, rightColumn);
        this.processTabToggleComponent = processTabToggleRow[0];
        const processTabToggleComponent = this.processTabToggleComponent;
        const processTabToggleContainer = processTabToggleRow[1];

        const prefillFindToggleRow = addToggleComponent(this.language.prefillFindName, this.language.prefillFindDesc, false, leftColumn);
        this.prefillFindToggleComponent = prefillFindToggleRow[0];
        const prefillFindToggleComponent = this.prefillFindToggleComponent;
        // const prefillFindToggleContainer = prefillFindToggleRow[1];

        // 当正则表达式启用或禁用时更新正则标志标签
        regToggleComponent.onChange(regNew => {
            if (regNew) {
                findRegexFlags.setText('/' + regexFlags);
                // 显示正则相关的选项
                caseInsensitiveToggleContainer.style.display = 'flex';
                processLineBreakToggleContainer.style.display = 'flex';
                processTabToggleContainer.style.display = 'flex';
            } else {
                findRegexFlags.setText('');
                // 隐藏正则相关的选项
                caseInsensitiveToggleContainer.style.display = 'none';
                processLineBreakToggleContainer.style.display = 'none';
                processTabToggleContainer.style.display = 'none';
            }
        })

        // 当大小写不敏感选项改变时更新正则标志
        caseInsensitiveToggleComponent.onChange(caseInsensitiveNew => {
            regexFlags = 'gm';
            if (caseInsensitiveNew) regexFlags = regexFlags.concat('i');
            if (regToggleComponent.getValue()) {
                findRegexFlags.setText('/' + regexFlags);
            }
        })

        // 当处理换行符选项改变时更新后缀标签
        processLineBreakToggleComponent.onChange(processLineBreakNew => {
            replaceRow[1].setText(processLineBreakNew ? '\\n=LF' : '');
        })

        // 创建按钮
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
            logger('操作已取消。', 8);
            this.saveSettings(findInputComponent, replaceWithInputComponent, regToggleComponent, selToggleComponent, caseInsensitiveToggleComponent, processLineBreakToggleComponent, processTabToggleComponent, prefillFindToggleComponent);
            this.close();
        });

        submitButtonComponent.setButtonText(this.language.replaceAllButton);
        submitButtonComponent.setCta();
        submitButtonComponent.onClick(() => {
            let resultString = '无匹配';
            let scope = '';
            const searchString = findInputComponent.getValue();
            let replaceString = replaceWithInputComponent.getValue();
            const selectedText = editor.getSelection();

            if (searchString === '') {
                new Notice(this.language.nothingToSearchFor);
                return;
            }

            // 如果启用了处理换行符选项，则替换替换字段中的换行符
            if (processLineBreakToggleComponent.getValue()) {
                logger('替换替换字段中的换行符', 9);
                logger('  旧: ' + replaceString, 9);
                replaceString = replaceString.replace(/\\n/gm, '\n');
                logger('  新: ' + replaceString, 9);
            }

            // 如果启用了处理制表符选项，则替换替换字段中的制表符
            if (processTabToggleComponent.getValue()) {
                logger('替换替换字段中的制表符', 9);
                logger('  旧: ' + replaceString, 9);
                replaceString = replaceString.replace(/\\t/gm, '\t');
                logger('  新: ' + replaceString, 9);
            }

            // 检查是否应该使用正则表达式
            if (regToggleComponent.getValue()) {
                logger('使用正则表达式，标志: ' + regexFlags, 8);

                const searchRegex = new RegExp(searchString, regexFlags);
                if (!selToggleComponent.getValue()) {
                    logger('   范围: 整个文档', 9);
                    const documentText = editor.getValue();
                    const rresult = documentText.match(searchRegex);
                    if (rresult) {
                        editor.setValue(documentText.replace(searchRegex, replaceString));
                        scope = this.language.scopeDocument;
                        resultString = this.language.replacementResult.replace('{{count}}', rresult.length.toString()).replace('{{scope}}', scope);
                    }
                } else {
                    logger('   范围: 选择的文本', 9);
                    const rresult = selectedText.match(searchRegex);
                    if (rresult) {
                        editor.replaceSelection(selectedText.replace(searchRegex, replaceString));
                        scope = this.language.scopeSelection;
                        resultString = this.language.replacementResult.replace('{{count}}', rresult.length.toString()).replace('{{scope}}', scope);
                    }
                }
            } else {
                logger('不使用正则表达式', 8);
                let nrOfHits: number;
                if (!selToggleComponent.getValue()) {
                    logger('   范围: 整个文档', 9);
                    scope = this.language.scopeDocument;
                    const documentText = editor.getValue();
                    const documentSplit = documentText.split(searchString);
                    nrOfHits = documentSplit.length - 1;
                    editor.setValue(documentSplit.join(replaceString));
                } else {
                    logger('   范围: 选择的文本', 9);
                    scope = this.language.scopeSelection;
                    const selectedSplit = selectedText.split(searchString);
                    nrOfHits = selectedSplit.length - 1;
                    editor.replaceSelection(selectedSplit.join(replaceString));
                }
                resultString = this.language.replacementResult.replace('{{count}}', nrOfHits.toString()).replace('{{scope}}', scope);
            }

            // 保存设置（查找/替换文本和开关状态）
            this.saveSettings(findInputComponent, replaceWithInputComponent, regToggleComponent, selToggleComponent, caseInsensitiveToggleComponent, processLineBreakToggleComponent, processTabToggleComponent, prefillFindToggleComponent);

            // 添加到历史记录
            if (this.settings.enableHistory) {
                const historyItem: HistoryItemInterface = {
                    findText: findInputComponent.getValue(),
                    replaceText: replaceWithInputComponent.getValue(),
                    useRegEx: regToggleComponent.getValue(),
                    caseInsensitive: caseInsensitiveToggleComponent.getValue(),
                    processLineBreak: processLineBreakToggleComponent.getValue(),
                    processTab: processTabToggleComponent.getValue(),
                    timestamp: Date.now()
                };
                this.plugin.addToHistory(historyItem);
            }

            this.close();
            new Notice(resultString);
        });

        // 应用设置
        regToggleComponent.setValue(this.settings.useRegEx);
        selToggleComponent.setValue(this.settings.selOnly);
        caseInsensitiveToggleComponent.setValue(this.settings.caseInsensitive);
        processLineBreakToggleComponent.setValue(this.settings.processLineBreak);
        processTabToggleComponent.setValue(this.settings.processTab);
        prefillFindToggleComponent.setValue(this.settings.prefillFind);
        replaceWithInputComponent.setValue(this.settings.replaceText);

        // 初始化正则相关选项的显示状态
        if (this.settings.useRegEx) {
            caseInsensitiveToggleContainer.style.display = 'flex';
            processLineBreakToggleContainer.style.display = 'flex';
            processTabToggleContainer.style.display = 'flex';
        } else {
            caseInsensitiveToggleContainer.style.display = 'none';
            processLineBreakToggleContainer.style.display = 'none';
            processTabToggleContainer.style.display = 'none';
        }

        // 检查预填充查找选项是否启用且选择的文本不包含换行符
        if (this.settings.prefillFind && editor.getSelection().indexOf('\n') < 0 && !noSelection) {
            logger('找到不包含换行符的选择且选项已启用 -> 填充', 9);
            findInputComponent.setValue(editor.getSelection());
            selToggleComponent.setValue(false);
        } else {
            logger('恢复查找文本', 9);
            findInputComponent.setValue(this.settings.findText);
        }

        // 添加历史记录区域
        if (this.settings.enableHistory) {
            const historyContainer = document.createElement(divClass);
            historyContainer.style.marginTop = '20px';

            const historyTitle = document.createElement('h5');
            historyTitle.setText(this.language.historyTitle);
            historyContainer.appendChild(historyTitle);

            const historyList = document.createElement('div');
            historyList.style.maxHeight = '200px';
            historyList.style.overflowY = 'auto';
            historyList.style.border = '1px solid var(--background-modifier-border)';
            historyList.style.borderRadius = '4px';
            historyList.style.padding = '5px';

            const historyItems = this.plugin.getHistory();
            if (historyItems.length > 0) {
                historyItems.forEach((item, index) => {
                    const historyItem = document.createElement('div');
                    historyItem.style.padding = '8px';
                    historyItem.style.borderBottom = '1px solid var(--background-modifier-border)';
                    historyItem.style.cursor = 'pointer';
                    historyItem.style.transition = 'background-color 0.3s ease';
                    historyItem.style.display = 'flex';
                    historyItem.style.alignItems = 'center';
                    historyItem.style.justifyContent = 'space-between';
                    historyItem.style.flexWrap = 'wrap';

                    const contentContainer = document.createElement('div');
                    contentContainer.style.display = 'flex';
                    contentContainer.style.alignItems = 'center';
                    contentContainer.style.flex = '1';
                    contentContainer.style.minWidth = '0';

                    const findText = document.createElement('span');
                    findText.style.fontSize = '12px';
                    findText.style.color = 'var(--text-muted)';
                    findText.style.marginRight = '10px';
                    findText.setText(this.language.findLabel + ' ' + item.findText);

                    const arrow = document.createElement('span');
                    arrow.style.fontSize = '12px';
                    arrow.style.color = 'var(--text-faint)';
                    arrow.style.marginRight = '10px';
                    arrow.setText('→');

                    const replaceText = document.createElement('span');
                    replaceText.style.fontSize = '12px';
                    replaceText.style.color = 'var(--text-muted)';
                    replaceText.setText(this.language.replaceLabel + ' ' + item.replaceText);

                    const dateText = document.createElement('span');
                    dateText.style.fontSize = '10px';
                    dateText.style.color = 'var(--text-faint)';
                    dateText.style.marginLeft = '15px';

                    // 格式化日期
                    const date = new Date(item.timestamp);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    dateText.setText(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);

                    contentContainer.appendChild(findText);
                    contentContainer.appendChild(arrow);
                    contentContainer.appendChild(replaceText);

                    historyItem.appendChild(contentContainer);
                    historyItem.appendChild(dateText);

                    historyItem.addEventListener('click', () => {
                        // 填充历史记录到输入字段
                        findInputComponent.setValue(item.findText);
                        replaceWithInputComponent.setValue(item.replaceText);
                        regToggleComponent.setValue(item.useRegEx);
                        caseInsensitiveToggleComponent.setValue(item.caseInsensitive);
                        processLineBreakToggleComponent.setValue(item.processLineBreak);
                        processTabToggleComponent.setValue(item.processTab);

                        // 更新正则标志
                        regexFlags = 'gm';
                        if (item.caseInsensitive) regexFlags = regexFlags.concat('i');
                        if (item.useRegEx) {
                            findRegexFlags.setText('/' + regexFlags);
                            caseInsensitiveToggleContainer.style.display = 'flex';
                            processLineBreakToggleContainer.style.display = 'flex';
                            processTabToggleContainer.style.display = 'flex';
                        } else {
                            findRegexFlags.setText('');
                            caseInsensitiveToggleContainer.style.display = 'none';
                            processLineBreakToggleContainer.style.display = 'none';
                            processTabToggleContainer.style.display = 'none';
                        }

                        // 更新替换字段后缀标签
                        replaceRow[1].setText(item.processLineBreak ? '\n=LF' : '');
                    });

                    // 添加鼠标悬停效果
                    historyItem.addEventListener('mouseenter', () => {
                        historyItem.style.backgroundColor = 'var(--background-modifier-hover)';
                    });

                    historyItem.addEventListener('mouseleave', () => {
                        historyItem.style.backgroundColor = 'transparent';
                    });

                    historyList.appendChild(historyItem);
                });
            } else {
                const noHistory = document.createElement('div');
                noHistory.style.padding = '10px';
                noHistory.style.textAlign = 'center';
                noHistory.style.color = 'var(--text-muted)';
                noHistory.setText(this.language.noHistoryMessage);
                historyList.appendChild(noHistory);
            }

            historyContainer.appendChild(historyList);
            contentEl.appendChild(historyContainer);
        }

        // 添加按钮行到对话框
        buttonContainerEl.appendChild(submitButtonTarget);
        buttonContainerEl.appendChild(cancelButtonTarget);
        contentEl.appendChild(buttonContainerEl);

        // 如果没有选择文本，禁用选择开关
        if (noSelection) selToggleComponent.setValue(false);
    }

    onClose() {
        // 保存设置
        if (this.findInputComponent && this.replaceWithInputComponent && this.regToggleComponent && this.selToggleComponent && this.caseInsensitiveToggleComponent && this.processLineBreakToggleComponent && this.processTabToggleComponent && this.prefillFindToggleComponent) {
            this.saveSettings(this.findInputComponent, this.replaceWithInputComponent, this.regToggleComponent, this.selToggleComponent, this.caseInsensitiveToggleComponent, this.processLineBreakToggleComponent, this.processTabToggleComponent, this.prefillFindToggleComponent);
        }
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

        containerEl.createEl('h4', { text: currentLanguage.generalSettingsTitle });

        // 设置语言
        const languageOptions = getLanguageOptions();
        new Setting(containerEl)
            .setName(currentLanguage.langSettingName)
            .setDesc(currentLanguage.langSettingDesc)
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

        // 是否开启历史记录
        new Setting(containerEl)
            .setName(currentLanguage.enableHistoryName)
            .setDesc(currentLanguage.enableHistoryDesc)
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings.enableHistory)
                    .onChange(async (value) => {
                        logger('Settings update: enableHistory: ' + value);
                        this.plugin.settings.enableHistory = value;
                        await this.plugin.saveSettings();
                    });
            });

        // 历史记录数量限制
        new Setting(containerEl)
            .setName(currentLanguage.historyLimitName)
            .setDesc(currentLanguage.historyLimitDesc)
            .addText(text => {
                text.setValue(this.plugin.settings.historyLimit.toString())
                    .onChange(async (value) => {
                        const limit = parseInt(value);
                        if (!isNaN(limit) && limit > 0) {
                            logger('Settings update: historyLimit: ' + limit);
                            this.plugin.settings.historyLimit = limit;
                            await this.plugin.saveSettings();
                        }
                    });
            });
    }
}