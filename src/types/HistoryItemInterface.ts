/**
 * 历史记录项接口
 */
export default interface HistoryItemInterface {
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
     * 是否忽略大小写
     */
    caseInsensitive: boolean;
    /**
     * 是否将\n处理为换行符
     */
    processLineBreak: boolean;
    /**
     * 是否将\t处理为制表符
     */
    processTab: boolean;
    /**
     * 创建时间
     */
    timestamp: number;
}