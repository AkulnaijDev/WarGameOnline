import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        welcome: 'Welcome to WarGame Online',
        armyCreator : 'Army Creator',
        play:'Play',
        settings:'Settings',

      }
    },
    it: {
      translation: {
        login: 'Accedi',
        register: 'Registrati',
        email: 'Email',
        password: 'Password',
        welcome: 'Benvenuto in WarGame Online',
        armyCreator : 'Editor armate',
        play:'Gioca',
        settings:'Opzioni',
      }
    },
    fr: { translation: { login: 'Connexion', register: 'Inscription', email: 'Email', password: 'Mot de passe', welcome: 'Bienvenue sur WarGame Online' } },
    de: { translation: { login: 'Anmelden', register: 'Registrieren', email: 'E-Mail', password: 'Passwort', welcome: 'Willkommen bei WarGame Online' } },
    jp: { translation: { login: 'ログイン', register: '登録', email: 'メール', password: 'パスワード', welcome: 'WarGame Onlineへようこそ' } },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
