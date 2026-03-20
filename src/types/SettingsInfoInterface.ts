import languageType from "../lang";

/**
 * 插件设置信息接口
 */
export default interface SettingsInfoInterface {
    /**
     * 查找文本
     */
    findText: string;
    /**
     * 替换文本
     */
    replaceText: string;
    /**
     * 是否使用正则表达式
     */
    useRegEx: boolean;
    /**
     * 是否仅在选择内容中替换
     */
    selOnly: boolean;
    /**
     * 是否忽略大小写
     */
    caseInsensitive: boolean;
    /**
     * 是否将\\n处理为换行符
     */
    processLineBreak: boolean;
    /**
     * 是否将\\t处理为制表符
     */
    processTab: boolean;
    /**
     * 是否预填查找字段
     */
    prefillFind: boolean;
    /**
     * 语言类型
     */
    language: languageType;
}