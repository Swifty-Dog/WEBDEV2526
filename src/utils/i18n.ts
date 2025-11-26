import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';
import { LANGUAGE_MAP } from '../data/SettingsOptions';

const savedLang = localStorage.getItem('appLanguage') || 'English';
const initialCode = LANGUAGE_MAP[savedLang] || 'en';

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: initialCode,
        fallbackLng: 'en',

        backend: {
            loadPath: '../../locales/{{lng}}/{{ns}}.json',
        },

        ns: ['common', 'rooms', 'api', 'settings'],
        defaultNS: 'common',

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: true,
        }
    });

export default i18n;
