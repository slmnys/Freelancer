interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number | string;
  content: string;
  created_at: string;
  sender_id: number;
  recipient_id: number;
  project_id: number;
  isSender: boolean;
}

export type { Message }; 