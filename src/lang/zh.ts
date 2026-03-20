import LanguageTranslationInterface from "../types/LanguageTranslationInterface";

const zh: LanguageTranslationInterface = {
  "modalTitle": "正则表达式查找/替换",
  "findLabel": "查找：",
  "replaceLabel": "替换：",
  "useRegexLabel": "使用正则表达式",
  "useRegexTooltip": "如果启用，查找字段中的正则表达式将被视为正则表达式处理，并且可以在替换字段中引用正则表达式组",
  "replaceOnlyInSelectionLabel": "仅在选择内容中替换",
  "replaceOnlyInSelectionTooltip": "如果启用，仅替换当前选中文本中的匹配项",
  "cancelButton": "取消",
  "replaceAllButton": "全部替换",
  "nothingToSearchFor": "没有要搜索的内容！",
  "replacementResult": "在{{scope}}中进行了{{count}}次替换",
  "scopeDocument": "文档",
  "scopeSelection": "选择内容",
  "settingsTitle": "正则表达式设置",
  "caseInsensitiveName": "忽略大小写",
  "caseInsensitiveDesc": "使用正则表达式时，应用'/i'修饰符进行不区分大小写的搜索",
  "generalSettingsTitle": "通用设置",
  "processLineBreakName": "将\\n处理为换行符",
  "processLineBreakDesc": "当在替换字段中使用'\\n'时，将相应插入'换行符'",
  "prefillFindName": "预填查找字段",
  "prefillFindDesc": "将当前选中的文本（如果有）复制到'查找'文本字段中。此设置仅在选择内容不包含换行符时应用",
  "processTabName": "将\\t处理为制表符",
  "processTabDesc": "当在替换字段中使用'\\t'时，将相应插入'制表符'",
  "languageName": "语言",
  "languageDesc": "选择插件的语言，影响插件的界面和功能"
}
export default zh;