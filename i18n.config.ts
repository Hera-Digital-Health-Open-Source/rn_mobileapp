import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, ar, tr } from "./translations";

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  tr: {
    translation: tr,
  }
};

i18n.use(initReactI18next).init({
  resources,
  //language to use if translations in user language are not available
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // not needed for react!!
  },
});

export default i18n;