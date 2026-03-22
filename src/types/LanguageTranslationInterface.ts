/**
 * 语言包需要实现此接口，防止遗漏某些字段
 */
interface LanguageTranslationInterface {
  /**
   * 插件弹窗标题
   */
  modalTitle: string;
  /**
   * 查找字段标签
   */
  findLabel: string;
  /**
   * 替换字段标签
   */
  replaceLabel: string;
  /**
   * 是否使用正则表达式标签
   */
  useRegexLabel: string;
  /**
   * 是否使用正则表达式提示
   */
  useRegexTooltip: string;
  /**
   * 是否仅在选中区域替换标签
   */
  replaceOnlyInSelectionLabel: string;
  /**
   * 是否仅在选中区域替换提示
   */
  replaceOnlyInSelectionTooltip: string;
  /**
   * 取消按钮标签
   */
  cancelButton: string;
  /**
   * 替换所有按钮标签
   */
  replaceAllButton: string;
  /**
   * 未找到要替换的内容提示
   */
  nothingToSearchFor: string;
  /**
   * 替换结果标签
   */
  replacementResult: string;
  /**
   * 无效正则表达式
   */
  invalidRegex: string,
  /**
   * 查找范围标签
   */
  scopeDocument: string;
  /**
   * 查找范围标签
   */
  scopeSelection: string;
  /**
   * 设置标题
   */
  settingsTitle: string;
  /**
   * 不区分大小写标签
   */
  caseInsensitiveName: string;
  /**
   * 不区分大小写提示
   */
  caseInsensitiveDesc: string;
  /**
   * 一般设置标题
   */
  generalSettingsTitle: string;
  /**
   * 处理换行符标签
   */
  processLineBreakName: string;
  /**
   * 处理换行符提示
   */
  processLineBreakDesc: string;
  /**
   * 预填充查找标签
   */
  prefillFindName: string;
  /**
   * 预填充查找提示
   */
  prefillFindDesc: string;
  /**
   * 处理选项卡标签
   */
  processTabName: string;
  /**
   * 处理选项卡提示
   */
  processTabDesc: string;
  /**
   * 切换语言标签
   */
  langSettingName: string;
  /**
   * 语言选项描述
   */
  langSettingDesc: string;
  /**
   * 是否开启历史记录标签
   */
  enableHistoryName: string;
  /**
   * 是否开启历史记录描述
   */
  enableHistoryDesc: string;
  /**
   * 历史记录数量限制标签
   */
  historyLimitName: string;
  /**
   * 历史记录数量限制描述
   */
  historyLimitDesc: string;
  /**
   * 历史记录标题
   */
  historyTitle: string;
  /**
   * 无历史记录提示
   */
  noHistoryMessage: string;

}
export default LanguageTranslationInterface 