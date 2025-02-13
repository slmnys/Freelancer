interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  isSender: boolean;
}

export type { Message, ChatMessage }; 