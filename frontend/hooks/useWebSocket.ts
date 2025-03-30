import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketService } from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
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

    const handleAnalysisStarted = (event: CustomEvent) => {
      console.log('Analysis started:', event.detail);
      setCurrentReportId(event.detail.reportId);
    };

    const handleAnalysisProgress = (event: CustomEvent) => {
      console.log('Analysis progress:', event.detail);
      setAnalysisProgress(event.detail.progress);
    };

    const handleMetrics = (event: CustomEvent) => {
      console.log('Received metrics:', event.detail);
    };

    const handleAnalysis = (event: CustomEvent) => {
      console.log('Received analysis:', event.detail);
    };

    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('Analysis complete:', event.detail);
      setAnalysisProgress(100);
    };

    const handleError = (event: CustomEvent) => {
      console.error('Analysis error:', event.detail);
      setError(event.detail.message);
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
    window.addEventListener('wsAnalysisStarted', handleAnalysisStarted as EventListener);
    window.addEventListener('wsAnalysisProgress', handleAnalysisProgress as EventListener);
    window.addEventListener('wsMetrics', handleMetrics as EventListener);
    window.addEventListener('wsAnalysis', handleAnalysis as EventListener);
    window.addEventListener('wsAnalysisComplete', handleAnalysisComplete as EventListener);
    window.addEventListener('wsError', handleError as EventListener);
    window.addEventListener('wsChatMessage', handleChatMessage as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('wsConnectionError', handleConnectionError as EventListener);
      window.removeEventListener('wsConnected', handleConnected as EventListener);
      window.removeEventListener('wsAnalysisStarted', handleAnalysisStarted as EventListener);
      window.removeEventListener('wsAnalysisProgress', handleAnalysisProgress as EventListener);
      window.removeEventListener('wsMetrics', handleMetrics as EventListener);
      window.removeEventListener('wsAnalysis', handleAnalysis as EventListener);
      window.removeEventListener('wsAnalysisComplete', handleAnalysisComplete as EventListener);
      window.removeEventListener('wsError', handleError as EventListener);
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

  const analyzeWebsite = useCallback((url: string) => {
    if (wsService.current) {
      wsService.current.analyzeWebsite(url);
    }
  }, []);

  return {
    isConnected,
    error,
    analysisProgress,
    currentReportId,
    sendChatMessage,
    analyzeWebsite,
  };
}; 