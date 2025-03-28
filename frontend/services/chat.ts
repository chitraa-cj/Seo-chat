import { API_URL } from "@/config";

export interface Message {
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  reportId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: Date;
}

const getAuthToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    } else {
      throw new Error('Authentication failed');
    }
  }
  return response.json();
};

export const storeChatMessage = async (
  messages: Message[],
  reportId?: string,
  chatId?: string
): Promise<ChatHistory> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/chat/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      messages,
      reportId,
      chatId
    })
  });

  return handleResponse(response);
};

export const getChatHistory = async (page: number = 1, limit: number = 20): Promise<{ chats: ChatHistory[], totalPages: number }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_URL}/chat/history?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return handleResponse(response);
};

export const getChatById = async (chatId: string): Promise<ChatHistory> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/chat/history/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return handleResponse(response);
}; 