import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        //generic
        missingToken: "Missing token",
        //errorSavingArmylist: "Error saving army list",
        //expiredSession: "Session expired",
        //nonJsonFormResponse: "Response is not JSON format",

        //sessionManager.ts
        //impossibleRegenerateSession: "Impossibile rigenerare la sessione",

        //armyHeader
        nameYourArmy: "Name your army...",
        selectGame: "-- Select Game --",

        //armyHeaderSavedArmies
        loadSavedList: "Load a saved list",

        //armyLoader
        chooseSavedList: "Choose saved army list",
        modifyArmyList: "Edit army list",
        chooseWargameSystem: "Choose a game system",

        //armySidebar
        yourArmyText: "Your army",
        noUnitsAddedYet: "No units added yet",
        totalUnits: "Total Units: ",
        totalPoints: "Total Points: ",
        minUnitsRequired: "Min Units Required: ",
        thresholdRule: "Threshold Rule: every ",
        allConstraintsSatisfied: "✅ All constraints satisfied",
        constraintsViolated: "❌ Constraint violation",
        downloadPDF: "📄 Download PDF",
        saveChanges: "💾 Save Changes",
        saveArmy: "💾 Save Army",
        deleteArmy: "🗑️ Delete Army",

        //armyStartMenu
        armyCreatorTitle: "⚔️ Army Creator",
        whatDoYouWannaDo: "What do you want to do?",
        createNewArmyList: "➕ Create new army list",
        editSavedArmyList: "🛠️ Edit army list",

        //authTabs
        registrationCompleted: "Registration completed!",
        registrationError: "Errors during the registration",
        invalidCredentials: "Credentials not valid",
        login: "Login",
        name: "Username",
        email: "Email",
        password: "Password",
        register: "Register",

        //ChatWindow
        typeMessage: "Type your msg",
        send: "Send",
        offlineUserNoMsgSent: "This user is offline. Messge not send.",
        userOfflineCantSend: "This user is offline, you cant send the message",
        userOffline: "User is offline",

        //FactionSelector
        chooseFaction: "Choose a faction",

        //FriendsSidebar
        friends: "Friends",
        online: "Online",
        offline: "Offline",
        openChat: "Open chat",
        removeFriend: "Remove friend",
        addFriend: "Add friend",
        arrivedFriendshipRequests: "Incoming requests",
        friendshipRequestSent: "Sent friendship request",
        friendshipRequestError: "Error in sending friendship request",
        networkError: "❌ Network error",

        //Sidebar
        armyCreator: "Army Creator",
        play: "Play",
        settings: "Settings",
        logout: "Logout",

        //UnitDetails
        rules: "Rules: ",

        //UnitTable
        nameShort: "Name",
        pointsShort: "Pts",
        propsShort: "Props",
        addShort: "Add",

        //AuthContext
        loginFailed: "Login failed",
        registrationFailed: "Registration failed",
        unauthorized: "Unauthorized",
        authProviderAlert: "useAuth must be used within AuthProvider",

        //FriendsContext
        callUseFriends: "Please call useFriends inside FriendsProvider",

        //UseAuth
        accessDenied: "❌ Access denied",

        //useSocket
        newRequestReceived: "📬 New request received:",
        requestAccepted: "✅ Request accepted, new friend:",
        signalRIsConnected: "🛰️ SignalR is connected",
        signalRConnectionFailed: "❌ SignalR connection failed:",

        //armyCreator
        atLeastText: "at least ",
        atMostText: "at most ",
        gameOrFactionNotFound: "Game or Faction not found",
        errorLoadingArmyList: "Error loading army:",
        errorSavingArmy: "Error saving army:",
        errorDeletingArmy: "Error deleting army:",
        backToMenu: "← Back to menu",
        pdfArmy: "Army:",
        pdfUnnamed: "Unnamed",
        pdfGame: "Game:",
        pdfFaction: "Faction:",
        pdfPoints: "Points:",
        pdfUnits: "Units:",
        pdfUnitsSelected: "Units selected:",
        pointsShortMinus: "Pts",
        pdfViolation: "⚠ Violations:",
        loadArmy: "Load this army list",
        noSelectedListAlert:
          "⚠ No list selected. Choose a list to edit or go back to menu.",

        //HomePage
        welcomeHome: "Welcome to your home page",
        welcomeHomeSubtext: "Here you will find all you need to battle",
      },
    },
    it: {
      translation: {
        // Registration Box
        register: "Registrati",
        registrationCompleted: "Registrazione completata!",
        registrationError: "Errori durante la registrazione",
        registrationNetworkError: "Errori di rete durante la registrazione",

        // Login Box
        login: "Login",
        invalidCredentials: "Credenziali non valide",
        networkErrorsOnLogin: "Errori di rete durante il login",
        name: "Nome utente",
        email: "Email",
        password: "Password",

        //Side menu home page
        welcome: "Benvenuto in WarGame Online",
        armyCreator: "Editor Armata",
        play: "Gioca",
        settings: "Opzioni",
        logout: "Logout",

        //Home page content
        welcomeHome: "Benvenuto nella tua home page",
        welcomeHomeSubtext: "Eccoti tutto quello che riguarda la guerra",

        //Chat box content
        friends: "Amici",
        online: "Online",
        offline: "Offline",
        openChat: "Apri chat",
        removeFriend: "Rimuovi amico",
        addFriend: "Aggiungi amico",
        typeMessage: "Scrivi",
        send: "Invia",
        arrivedFriendshipRequests: "Richieste in sospeso",
      },
    },
    fr: {
      translation: {
        login: "Connexion",
        register: "Inscription",
        email: "Email",
        password: "Mot de passe",
        welcome: "Bienvenue sur WarGame Online",
      },
    },
    de: {
      translation: {
        login: "Anmelden",
        register: "Registrieren",
        email: "E-Mail",
        password: "Passwort",
        welcome: "Willkommen bei WarGame Online",
      },
    },
    jp: {
      translation: {
        login: "ログイン",
        register: "登録",
        email: "メール",
        password: "パスワード",
        welcome: "WarGame Onlineへようこそ",
      },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
