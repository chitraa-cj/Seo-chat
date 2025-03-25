import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketService } from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket service
    wsService.current = new WebSocketService();

    const handleConnectionError = (event: CustomEvent) => {
      setError(event.detail.message);
      setIsConnected(false);
    };

    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleChatMessage = (event: CustomEvent) => {
      const data = event.detail;
      if (data.type === 'chat_response') {
        // Handle chat response
        const chatResponseEvent = new CustomEvent('chatResponse', { 
          detail: { 
            message: data.message,
            timestamp: new Date()
          }
        });
        window.dispatchEvent(chatResponseEvent);
      }
    };

    // Add event listeners
    window.addEventListener('wsConnectionError', handleConnectionError as EventListener);
    window.addEventListener('wsConnected', handleConnected as EventListener);
    window.addEventListener('wsChatMessage', handleChatMessage as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('wsConnectionError', handleConnectionError as EventListener);
      window.removeEventListener('wsConnected', handleConnected as EventListener);
      window.removeEventListener('wsChatMessage', handleChatMessage as EventListener);
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  const sendChatMessage = useCallback((message: string, reportId?: string) => {
    if (wsService.current) {
      wsService.current.sendChatMessage(message, reportId);
    }
  }, []);

  const analyzeWebsite = (url: string) => {
    if (wsService.current) {
      wsService.current.analyzeWebsite(url);
    }
  };

  return {
    isConnected,
    error,
    sendChatMessage,
    analyzeWebsite,
  };
}; 