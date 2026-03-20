import LanguageTranslationInterface from "../types/LanguageTranslationInterface";
import en from './en';
import zh from './zh';
/**
 * 语言类型枚举
 * @enum en 英文
 * @enum zh 中文
 */
export enum languageType {
    en = 'en',
    zh = 'zh'
}
/**
 * 运行时存储和获取语言包
 */
const languages: Record<languageType, LanguageTranslationInterface> = {
    [languageType.en]: en,
    [languageType.zh]: zh
};
/**
 * 获取语言翻译
 * @param lang 语言类型
 * @returns 语言翻译
 */
export const getLanguage = (lang: languageType) => {
    return languages[lang] || languages[languageType.zh];
};
/**
 * 获取语言选项（用于设置插件的语言）
 * @returns 语言选项数组
 */
export const getLanguageOptions = () => {
    return Object.entries(languages).map(([code, translation]) => ({
        code,
        name: translation.languageName || code
    }));
};

export default languageType;
