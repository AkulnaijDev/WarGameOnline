import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LanguageSelector from "./components/LanguageSelector";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { FriendsProvider, useFriends } from "./context/FriendsContext";
import FriendsSidebar from "./components/FriendsSidebar";
import ChatWindow from "./components/ChatWindow";
import ArmyCreator from "./pages/ArmyCreator";
import { Toaster } from 'react-hot-toast'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/auth" replace />;
}

function ChatLayer() {
  const { activeChats, closeChat } = useFriends();

  return (
    <>
      {activeChats.map((friend) => (
        <ChatWindow
          key={friend.id}
          chatUser={friend}
          onClose={() => closeChat(friend.id)}
        />
      ))}
    </>
  );
}

function MainApp() {
  const { token, currentUserId } = useAuth();

  return token && currentUserId !== null ? (
    <FriendsProvider token={token} currentUserId={currentUserId}>
      <BrowserRouter>
        <div className="relative min-h-screen bg-bg text-white">
          <div className="absolute top-4 right-4 z-50">
            <LanguageSelector />
          </div>

          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/armyCreator"
              element={
                <ProtectedRoute>
                  <ArmyCreator />
                </ProtectedRoute>
              }
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>

          <FriendsSidebar />
          <ChatLayer />
        </div>
      </BrowserRouter>
    </FriendsProvider>
  ) : (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
    </AuthProvider>
  );
}
