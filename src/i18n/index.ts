import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Mobile Starter",
    },
  },
};

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  lng: Localization.getLocales()[0]?.languageCode ?? "en",
  resources,
});

export { i18n };
