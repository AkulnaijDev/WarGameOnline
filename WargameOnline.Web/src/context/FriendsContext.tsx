import {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { initializeSocket } from "../hooks/useSocket";
import { API } from "../lib/api";
import { useTranslation } from "react-i18next";

export type Friend = {
  id: number;
  username: string;
  isOnline: boolean;
};

type PendingUser = {
  id: number;
  username: string;
};

type Message = {
  text: string;
  senderId: number;
  timestamp: string;
};

type FriendsContextType = {
  friends: Friend[];
  activeChats: Friend[];
  openChat: (f: Friend) => void;
  closeChat: (id: number) => void;
  setActiveChats: React.Dispatch<React.SetStateAction<Friend[]>>;
  messages: { [userId: number]: Message[] };
  setMessages: React.Dispatch<
    React.SetStateAction<{ [userId: number]: Message[] }>
  >;
  currentUserId: number;
  pendingUsers: PendingUser[];
  setPendingUsers: React.Dispatch<React.SetStateAction<PendingUser[]>>;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
  const { t } = useTranslation();
  const context = useContext(FriendsContext);
  if (!context) throw new Error(t("callUseFriends"));
  return context;
};

export const FriendsProvider = ({
  token,
  currentUserId,
  children,
}: {
  token: string;
  currentUserId: number;
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<{ [userId: number]: Message[] }>({});
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [activeChats, setActiveChats] = useState<Friend[]>([]);

  const friendsRef = useRef<Friend[]>([]);
  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

  const openChat = (friend: Friend) => {
    setActiveChats((prev) =>
      prev.find((f) => f.id === friend.id) ? prev : [...prev, friend]
    );
  };

  const closeChat = (id: number) => {
    setActiveChats((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    if (!token) return;

    fetch(API.friends, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Friend[]) =>
        setFriends(data.filter((f) => f.id !== currentUserId))
      )
      .catch(console.error);

    fetch(API.friendsPending, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPendingUsers)
      .catch(console.error);
  }, [token, currentUserId]);

  useEffect(() => {
    if (!token) return;

    initializeSocket(
      token,
      (fromId, text) => {
        const newMsg: Message = {
          text,
          senderId: fromId,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => ({
          ...prev,
          [fromId]: [...(prev[fromId] || []), newMsg],
        }));

        const sender = friendsRef.current.find((f) => f.id === fromId);
        if (sender) {
          openChat(sender);
        }
      },
      (id, online) => {
        setFriends((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isOnline: online } : f))
        );
      },
      {
        onFriendRequestReceived: (pending: PendingUser) => {
          setPendingUsers((prev) => [
            ...prev.filter((u) => u.id !== pending.id),
            pending,
          ]);
        },
        onFriendRequestAccepted: (newFriend: Friend) => {
          setFriends((prev) => [...prev, newFriend]);
        },
        onFriendRemoved: (id: number) => {
          setFriends((prev) => prev.filter((f) => f.id !== id));
          setActiveChats((prev) => prev.filter((c) => c.id !== id));
        },
        onFriendOnline: (id: number) => {
          setFriends((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isOnline: true } : f))
          );
        },
        onFriendOffline: (id: number) => {
          setFriends((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isOnline: false } : f))
          );
        },
      },
      t
    );
  }, [token, t]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        activeChats,
        setActiveChats,
        openChat,
        closeChat,
        messages,
        setMessages,
        currentUserId,
        pendingUsers,
        setPendingUsers,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};
