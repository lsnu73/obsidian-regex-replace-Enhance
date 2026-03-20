/**
 * 语言包需要实现此接口，防止遗漏某些字段
 */
export interface LanguageInterface {
  modalTitle: string;
  findLabel: string;
  replaceLabel: string;
  useRegexLabel: string;
  useRegexTooltip: string;
  replaceOnlyInSelectionLabel: string;
  replaceOnlyInSelectionTooltip: string;
  cancelButton: string;
  replaceAllButton: string;
  nothingToSearchFor: string;
  replacementResult: string;
  scopeDocument: string;
  scopeSelection: string;
  settingsTitle: string;
  caseInsensitiveName: string;
  caseInsensitiveDesc: string;
  generalSettingsTitle: string;
  processLineBreakName: string;
  processLineBreakDesc: string;
  prefillFindName: string;
  prefillFindDesc: string;
  processTabName: string;
  processTabDesc: string;
}
