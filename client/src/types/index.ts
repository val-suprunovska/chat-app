export interface User {
  _id: string;
  email: string;
  token: string;
}

export interface Chat {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  messages: Message[];
  createdAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: "user" | "system";
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleOAuthSuccess: (token: string, userId: string) => Promise<void>;
  loading: boolean;
  shouldRefreshChats: boolean;
}