export class WebSocketService {
  private chatWs: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000;
  private isConnecting: boolean = false;
  private messageQueue: Array<{message: string, reportId?: string}> = [];
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
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/chat`;
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      // Initialize Chat WebSocket
      this.chatWs = new WebSocket(wsUrl);
      this.setupChatHandlers();

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
      console.log('Chat WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      // Dispatch connected event
      window.dispatchEvent(new CustomEvent('wsConnected'));
    };

    this.chatWs.onclose = (event) => {
      // Don't log error if it's an intentional close
      if (!this.isIntentionalClose) {
        console.log('Chat WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Handle specific close codes
        switch (event.code) {
          case 1000: // Normal closure
            console.log('WebSocket closed normally');
            break;
          case 1001: // Going away
            console.log('WebSocket connection going away');
            break;
          case 1002: // Protocol error
            console.log('WebSocket protocol error');
            break;
          case 1003: // Unsupported data
            console.log('WebSocket received unsupported data');
            break;
          case 1005: // No status received
            console.log('WebSocket closed without status');
            break;
          case 1006: // Abnormal closure
            console.log('WebSocket closed abnormally');
            break;
          case 1007: // Invalid frame payload data
            console.log('WebSocket received invalid frame payload');
            break;
          case 1008: // Policy violation
            console.log('WebSocket policy violation');
            break;
          case 1009: // Message too big
            console.log('WebSocket message too big');
            break;
          case 1010: // Mandatory extension
            console.log('WebSocket mandatory extension missing');
            break;
          case 1011: // Internal server error
            console.log('WebSocket internal server error');
            break;
          case 1012: // Service restart
            console.log('WebSocket service restart');
            break;
          case 1013: // Try again later
            console.log('WebSocket try again later');
            break;
          case 1014: // Bad gateway
            console.log('WebSocket bad gateway');
            break;
          case 1015: // TLS handshake
            console.log('WebSocket TLS handshake failed');
            break;
          default:
            console.log('WebSocket closed with unknown code:', event.code);
        }
      }

      this.handleDisconnection();
    };

    this.chatWs.onerror = (event) => {
      // Only log error if it's not an intentional close
      if (!this.isIntentionalClose) {
        console.error('Chat WebSocket error event received');
        this.handleConnectionError('WebSocket connection error occurred');
      }
    };

    this.chatWs.onmessage = (event) => {
      try {
        console.log('Received WebSocket message:', event.data);
        const data = JSON.parse(event.data);
        this.handleChatMessage(data);
      } catch (error) {
        console.error('Error parsing chat message:', error);
        this.handleConnectionError('Failed to parse chat message');
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
      
      setTimeout(() => {
        this.chatWs = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/chat`);
        this.setupChatHandlers();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error(`Failed to reconnect WebSocket after ${this.maxReconnectAttempts} attempts`);
      this.notifyConnectionError('Failed to reconnect after multiple attempts');
    }
  }

  private handleConnectionError(errorMessage: string) {
    this.isConnecting = false;
    this.notifyConnectionError(errorMessage);
  }

  private notifyConnectionError(errorMessage: string) {
    console.error('WebSocket connection error:', errorMessage);
    const event = new CustomEvent('wsConnectionError', {
      detail: { message: errorMessage }
    });
    window.dispatchEvent(event);
  }

  private processMessageQueue() {
    console.log('Processing message queue:', this.messageQueue.length, 'messages');
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        console.log('Sending queued message:', message);
        this.sendChatMessage(message.message, message.reportId);
      }
    }
  }

  public analyzeWebsite(url: string) {
    // Extract URL from text using regex
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = url.match(urlRegex);
    
    if (!match) {
      console.error('No valid URL found in input:', url);
      this.handleConnectionError('No valid URL found in the input');
      return;
    }

    const extractedUrl = match[1];
    
    // Validate and parse URL
    try {
      const parsedUrl = new URL(extractedUrl);
      const data = JSON.stringify({
        type: 'analyze_website',
        url: parsedUrl.toString(),
        timestamp: new Date().toISOString()
      });
      
      console.log('Sending website analysis request:', data);
      
      if (this.chatWs?.readyState === WebSocket.OPEN) {
        this.chatWs.send(data);
      } else {
        console.log('WebSocket not open, queueing analysis request');
        this.messageQueue.push({ message: data });
      }
    } catch (error) {
      console.error('Invalid URL:', error);
      this.handleConnectionError('Invalid website URL provided');
    }
  }

  public sendChatMessage(message: string, reportId?: string) {
    const data = JSON.stringify({ 
      type: 'chat',
      message,
      report_id: reportId || this.currentReportId
    });
    
    console.log('Sending WebSocket message:', data);
    
    if (this.chatWs?.readyState === WebSocket.OPEN) {
      this.chatWs.send(data);
    } else {
      console.log('WebSocket not open, queueing message');
      this.messageQueue.push({ message, reportId: reportId || this.currentReportId });
    }
  }

  private handleChatMessage(data: any) {
    console.log('Handling chat message:', data);
    
    // Handle different message types
    switch (data.type) {
      case 'analysis_started':
        this.currentReportId = data.report_id;
        console.log('Analysis started with report ID:', this.currentReportId);
        break;
      
      case 'analysis_progress':
        console.log('Analysis progress:', data.progress);
        // Dispatch progress event
        window.dispatchEvent(new CustomEvent('wsAnalysisProgress', { 
          detail: { progress: data.progress, reportId: data.report_id }
        }));
        break;
      
      case 'analysis_complete':
        console.log('Analysis complete:', data.report_id);
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('wsAnalysisComplete', { 
          detail: { reportId: data.report_id }
        }));
        break;
      
      case 'analysis_error':
        console.error('Analysis error:', data.error);
        this.handleConnectionError(data.error);
        break;
      
      case 'chat_response':
        // Handle regular chat response
        const event = new CustomEvent('wsChatMessage', { detail: data });
        window.dispatchEvent(event);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  public disconnect() {
    console.log('Disconnecting WebSocket...');
    this.isIntentionalClose = true;
    if (this.chatWs) {
      this.chatWs.close();
      this.chatWs = null;
    }
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }
} 