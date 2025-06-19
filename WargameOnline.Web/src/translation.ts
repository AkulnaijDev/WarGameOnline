import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        // Registration Box
        register: 'Register',
        registrationCompleted:'Registration completed!',
        registrationError: 'Errors during the registration',
        registrationNetworkError: 'Network errors during the registration',

        // Login Box
        login: 'Login',
        invalidCredentials: 'Credentials not valid',
        networkErrorsOnLogin: 'Network errors during login',
        name: 'Username',
        email: 'Email',
        password: 'Password',

        //Side menu home page
        welcome: 'Welcome to WarGame Online',
        armyCreator : 'Army Creator',
        play:'Play',
        settings:'Settings',
        logout: 'Logout',

        //Home page content
        welcomeHome: 'Welcome to your home page',
        welcomeHomeSubtext: 'Here you will find all you need to battle',

        //Chat box content
        friends: 'Friends',
        online:'Online',
        offline:'Offline',
        openChat: 'Open chat',
        removeFriend: 'Remove friend',
        addFriend: 'Add friend',
        typeMessage: 'Type your msg',
        send: 'Send',
        arrivedFriendshipRequests: 'Incoming requests',
        friendshipRequestSent:'Sent friendship request',
        friendshipRequestError:'Error in sending friendship request',
      }
    },
    it: {
      translation: {
        // Registration Box
        register: 'Registrati',
        registrationCompleted:'Registrazione completata!',
        registrationError: 'Errori durante la registrazione',
        registrationNetworkError: 'Errori di rete durante la registrazione',

        // Login Box
        login: 'Login',
        invalidCredentials: 'Credenziali non valide',
        networkErrorsOnLogin: 'Errori di rete durante il login',
        name: 'Nome utente',
        email: 'Email',
        password: 'Password',

        //Side menu home page
        welcome: 'Benvenuto in WarGame Online',
        armyCreator : 'Editor Armata',
        play: 'Gioca',
        settings:'Opzioni',
        logout: 'Logout',

        //Home page content
        welcomeHome: 'Benvenuto nella tua home page',
        welcomeHomeSubtext: 'Eccoti tutto quello che riguarda la guerra',

        //Chat box content
        friends: 'Amici',
        online:'Online',
        offline:'Offline',
        openChat: 'Apri chat',
        removeFriend: 'Rimuovi amico',
        addFriend: 'Aggiungi amico',
        typeMessage: 'Scrivi',
        send: 'Invia',
        arrivedFriendshipRequests: 'Richieste in sospeso',    
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
