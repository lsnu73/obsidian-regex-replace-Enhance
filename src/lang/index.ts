import en from './en';
import zh from './zh';

export type languageType = 'en' | 'zh';

export const languages = {
    en,
    zh
};

export const getLanguage = (lang: languageType) => {
    return languages[lang] || languages.zh;
};
