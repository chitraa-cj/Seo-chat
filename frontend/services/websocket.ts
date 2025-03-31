export class WebSocketService {
  private chatWs: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000;
  private isConnecting: boolean = false;
  private messageQueue: Array<{message: string, reportId?: string | null}> = [];
  private isIntentionalClose: boolean = false;
  private currentReportId: string | null = null;

  constructor() {
    console.log('Initializing WebSocket service...');
    this.initializeConnection();
  }

  private initializeConnection() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      // Get the WebSocket URL from environment variable
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) {
        throw new Error('NEXT_PUBLIC_WS_URL environment variable is not set');
      }

      // Ensure the URL starts with ws:// or wss://
      const fullWsUrl = wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://') 
        ? `${wsUrl}/chat`
        : `ws://${wsUrl}/chat`;

      console.log('Environment variables:', {
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
        NODE_ENV: process.env.NODE_ENV
      });
      console.log('Attempting to connect to WebSocket:', fullWsUrl);
      
      // Initialize WebSocket with error handling
      try {
        this.chatWs = new WebSocket(fullWsUrl);
      } catch (wsError) {
        console.error('Failed to create WebSocket:', wsError);
        // Try fallback to non-secure connection if secure fails
        if (fullWsUrl.startsWith('wss://')) {
          const fallbackUrl = fullWsUrl.replace('wss://', 'ws://');
          console.log('Attempting fallback to non-secure connection:', fallbackUrl);
          this.chatWs = new WebSocket(fallbackUrl);
        } else {
          throw wsError;
        }
      }
      
      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.chatWs?.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          this.handleConnectionError('Connection timeout');
        }
      }, 5000);

      this.chatWs.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connected successfully');
        this.setupChatHandlers();
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
        window.dispatchEvent(new CustomEvent('wsConnected'));
      };

      this.chatWs.onerror = (event) => {
        clearTimeout(connectionTimeout);
        // Prevent error from propagating to React's error boundary
        try {
          console.log('WebSocket error event received:', event);
          // Try fallback to non-secure connection if secure fails
          if (this.chatWs?.url.startsWith('wss://')) {
            const fallbackUrl = this.chatWs.url.replace('wss://', 'ws://');
            console.log('Attempting fallback to non-secure connection:', fallbackUrl);
            this.chatWs = new WebSocket(fallbackUrl);
            this.setupChatHandlers();
          } else {
            this.handleConnectionError('WebSocket connection error occurred');
          }
        } catch (error) {
          console.log('Error in WebSocket error handler:', error);
          this.handleConnectionError('WebSocket connection error occurred');
        }
      };

      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.isIntentionalClose = false;
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.handleConnectionError('Failed to initialize WebSocket connection');
    }
  }

  private setupChatHandlers() {
    if (!this.chatWs) return;

    this.chatWs.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      // Dispatch connected event
      window.dispatchEvent(new CustomEvent('wsConnected'));
    };

    this.chatWs.onclose = (event) => {
      // Don't log error if it's an intentional close
      if (!this.isIntentionalClose) {
        console.log('WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      }

      this.handleDisconnection();
    };

    this.chatWs.onerror = (event) => {
      // Only log error if it's not an intentional close
      if (!this.isIntentionalClose) {
        console.error('WebSocket error event received');
        this.handleConnectionError('WebSocket connection error occurred');
      }
    };

    this.chatWs.onmessage = (event) => {
      try {
        console.log('Raw WebSocket message received:', event.data);
        const data = JSON.parse(event.data);
        console.log('Parsed WebSocket message:', data);
        this.handleChatMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.handleConnectionError('Failed to parse message');
      }
    };
  }

  private handleDisconnection() {
    if (this.isIntentionalClose) {
      console.log('WebSocket disconnected intentionally');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) {
        console.error('Cannot reconnect: NEXT_PUBLIC_WS_URL environment variable is not set');
        return;
      }

      setTimeout(() => {
        this.chatWs = new WebSocket(`${wsUrl}/chat`);
        this.setupChatHandlers();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error(`Failed to reconnect WebSocket after ${this.maxReconnectAttempts} attempts`);
      this.notifyConnectionError('Failed to reconnect after multiple attempts');
    }
  }

  private handleConnectionError(message: string) {
    try {
      this.isConnecting = false;
      this.notifyConnectionError(message);
    } catch (error) {
      console.log('Error in handleConnectionError:', error);
    }
  }

  private notifyConnectionError(message: string) {
    try {
      const event = new CustomEvent('wsConnectionError', {
        detail: { message }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.log('Error in notifyConnectionError:', error);
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendChatMessage(message.message, message.reportId);
      }
    }
  }

  public sendChatMessage(message: string, reportId?: string | null) {
    const data = {
      type: 'chat',
      message,
      report_id: reportId || this.currentReportId
    };
    
    console.log('Preparing to send chat message:', data);
    
    if (this.chatWs?.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(data);
      console.log('Sending WebSocket message:', messageStr);
      this.chatWs.send(messageStr);
    } else {
      console.log('WebSocket not open, queueing message');
      this.messageQueue.push({ message, reportId: reportId || (this.currentReportId || undefined) });
    }
  }

  private handleChatMessage(data: any) {
    console.log('Handling message:', data);

    switch (data.type) {
      case 'analysis_started':
        console.log('Analysis started:', data);
        window.dispatchEvent(new CustomEvent('wsAnalysisStarted', { 
          detail: { reportId: data.report_id }
        }));
        break;
      
      case 'analysis_progress':
        console.log('Analysis progress:', data);
        window.dispatchEvent(new CustomEvent('wsAnalysisProgress', { 
          detail: { 
            progress: data.progress,
            message: data.message,
            reportId: data.report_id
          }
        }));
        break;
      
      case 'analysis':
        console.log('Analysis complete:', data);
        window.dispatchEvent(new CustomEvent('wsAnalysis', { 
          detail: { 
            data: data.data,
            reportId: data.report_id
          }
        }));
        window.dispatchEvent(new CustomEvent('wsAnalysisComplete', { 
          detail: { reportId: data.report_id }
        }));
        break;
      
      case 'analysis_error':
        console.error('Analysis error:', data.error);
        window.dispatchEvent(new CustomEvent('wsError', { 
          detail: { message: data.error }
        }));
        break;
      
      case 'chat_response':
        console.log('Dispatching chat response:', data);
        window.dispatchEvent(new CustomEvent('wsChatMessage', { 
          detail: { 
            message: data.message,
            timestamp: new Date().toISOString(),
            reportId: data.report_id
          }
        }));
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.chatWs) {
      this.chatWs.close();
      this.chatWs = null;
    }
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }
} 