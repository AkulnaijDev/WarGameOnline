import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        //generic
        missingToken: "Missing token",

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
        armySavedSuccessfully: "Army list saved successfully",
        armyDeletedSuccessfully: "Army list deleted successfully",

        //HomePage
        welcomeHome: "Welcome to your home page",
        welcomeHomeSubtext: "Here you will find all you need to battle",
      },
    },
    it: {
      translation: {
        //generico
        missingToken: "Token mancante",

        //armyHeader
        nameYourArmy: "Dai un nome al tuo esercito...",
        selectGame: "-- Seleziona gioco --",

        //armyHeaderSavedArmies
        loadSavedList: "Carica una lista salvata",

        //armyLoader
        chooseSavedList: "Scegliere lista degli eserciti salvati",
        modifyArmyList: "Modifica lista delle armate",
        chooseWargameSystem: "Scegliere un sistema di gioco",

        //armySidebar
        yourArmyText: "Il tuo esercito",
        noUnitsAddedYet: "Nessuna unità aggiunta",
        totalUnits: "Unità totali: ",
        totalPoints: "Punti totali: ",
        minUnitsRequired: "Unità minime richieste: ",
        thresholdRule: "Regola di soglia: ogni ",
        allConstraintsSatisfied: "✅ Tutti i vincoli soddisfatti",
        constraintsViolated: "❌ Violazione dei vincoli",
        downloadPDF: "📄 Download PDF",
        saveChanges: "💾 Salva modifiche",
        saveArmy: "💾 Salva esercito",
        deleteArmy: "🗑️ Elimina esercito",

        //armyStartMenu
        armyCreatorTitle: "⚔️ Army Creator",
        whatDoYouWannaDo: "Cosa vuoi fare?",
        createNewArmyList: "➕ Crea un nuovo elenco di armate",
        editSavedArmyList: "🛠️ Modifica l'elenco delle armate",

        //authTabs
        registrationCompleted: "Registrazione completata!",
        registrationError: "Errori durante la registrazione",
        invalidCredentials: "Credenziali non valide",
        login: "Login",
        name: "Nome utente",
        email: "Email",
        password: "Password",
        register: "Registrati",

        //ChatWindow
        typeMessage: "Scrivi il tuo messaggio",
        send: "Invia",
        offlineUserNoMsgSent: "Questo utente è offline. Messaggio non inviato",
        userOfflineCantSend:
          "Questo utente è offline, non è possibile inviare il messaggio",
        userOffline: "L'utente è offline",

        //FactionSelector
        chooseFaction: "Scegli una fazione",

        //FriendsSidebar
        friends: "Amici",
        online: "Online",
        offline: "Offline",
        openChat: "Apri la chat",
        removeFriend: "Rimuovi amico",
        addFriend: "Aggiungi amico",
        arrivedFriendshipRequests: "Richieste in arrivo",
        friendshipRequestSent: "Richiesta di amicizia inviata",
        friendshipRequestError: "Errore nell'invio della richiesta di amicizia",
        networkError: "❌ Errore di rete",

        //Sidebar
        armyCreator: "Army Creator",
        play: "Play",
        settings: "Impostazioni",
        logout: "Logout",

        //UnitDetails
        rules: "Regole: ",

        //UnitTable
        nameShort: "Name",
        pointsShort: "Pti",
        propsShort: "Props",
        addShort: "Agg.",

        //AuthContext
        loginFailed: "Login fallito",
        registrationFailed: "Registrazione fallita",
        unauthorized: "Non autorizzato",
        authProviderAlert:
          "useAuth deve essere usato all'interno di AuthProvider",

        //FriendsContext
        callUseFriends:
          "Si prega di chiamare useFriends all'interno di FriendsProvider",

        //UseAuth
        accessDenied: "❌ Accesso negato",

        //useSocket
        newRequestReceived: "📬 Nuova richiesta ricevuta:",
        requestAccepted: "✅ Richiesta accettata, nuovo amico:",
        signalRIsConnected: "🛰️ SignalR è connesso",
        signalRConnectionFailed: "❌ Connessione a SignalR fallita:",

        //armyCreator
        atLeastText: "almeno ",
        atMostText: "al massimo ",
        gameOrFactionNotFound: "Gioco o fazione non trovati",
        errorLoadingArmyList: "Errore nel caricamento dell'esercito:",
        errorSavingArmy: "Errore nel salvataggio dell'esercito:",
        errorDeletingArmy: "Errore nell'eliminazione dell'esercito:",
        backToMenu: "← Torna al menu",
        pdfArmy: "Esercito:",
        pdfUnnamed: "Senza nome",
        pdfGame: "Gioco:",
        pdfFaction: "Fazione:",
        pdfPoints: "Punti:",
        pdfUnits: "Unità:",
        pdfUnitsSelected: "Unità selezionate:",
        pointsShortMinus: "Pti",
        pdfViolation: "⚠ Violazioni:",
        loadArmy: "Carica questo elenco di armate",
        noSelectedListAlert:
          "⚠ Nessun elenco selezionato. Scegliere una lista da modificare o tornare al menu",
        armySavedSuccessfully: "Elenco di armate salvato con successo",
        armyDeletedSuccessfully: "Elenco di armate cancellato con successo",

        //HomePage
        welcomeHome: "Benvenuti nella vostra home page",
        welcomeHomeSubtext:
          "Qui troverete tutto ciò che vi serve per combattere",
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
