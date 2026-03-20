import { LanguageInterface } from "./LanguageInterface";
const en: LanguageInterface = {
    modalTitle: "Regex Find/Replace Enhance",
    findLabel: "Find:",
    replaceLabel: "Replace:",
    useRegexLabel: "Use regular expressions",
    useRegexTooltip: "If enabled, regular expressions in the find field are processed as such, and regex groups might be addressed in the replace field",
    replaceOnlyInSelectionLabel: "Replace only in selection",
    replaceOnlyInSelectionTooltip: "If enabled, replaces only occurances in the currently selected text",
    cancelButton: "Cancel",
    replaceAllButton: "Replace All",
    nothingToSearchFor: "Nothing to search for!",
    replacementResult: "Made {{count}} replacement(s) in {{scope}}",
    scopeDocument: "document",
    scopeSelection: "selection",
    settingsTitle: "Regular Expression Settings",
    caseInsensitiveName: "Case Insensitive",
    caseInsensitiveDesc: "When using regular expressions, apply the '/i' modifier for case insensitive search)",
    generalSettingsTitle: "General Settings",
    processLineBreakName: "Process \\n as line break",
    processLineBreakDesc: "When '\\n' is used in the replace field, a 'line break' will be inserted accordingly",
    prefillFindName: "Prefill Find Field",
    prefillFindDesc: "Copy the currently selected text (if any) into the 'Find' text field. This setting is only applied if the selection does not contain linebreaks",
    processTabName: "Process \\t as tab",
    processTabDesc: "When '\\t' is used in the replace field, a 'tab' will be inserted accordingly"
}
export default en;