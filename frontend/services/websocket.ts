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
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/chat`;
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      // Initialize WebSocket
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
      const data = {
        type: 'analyze_website',
        url: parsedUrl.toString(),
        timestamp: new Date().toISOString()
      };
      
      console.log('Preparing to send website analysis request:', data);
      
      if (this.chatWs?.readyState === WebSocket.OPEN) {
        const messageStr = JSON.stringify(data);
        console.log('Sending analysis request:', messageStr);
        this.chatWs.send(messageStr);
      } else {
        console.log('WebSocket not open, queueing analysis request');
        this.messageQueue.push({ 
          message: JSON.stringify(data),
          reportId: null 
        });
      }
    } catch (error) {
      console.error('Invalid URL:', error);
      this.handleConnectionError('Invalid website URL provided');
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

  private formatAnalysisMessage(data: any): string {
    const { url, analysis, metrics } = data;
    
    // Format the analysis content
    const formattedAnalysis = analysis
      .replace(/##/g, '\n\n###') // Convert markdown headers to new sections
      .replace(/#/g, '') // Remove single # headers
      .replace(/\n\n+/g, '\n\n') // Remove extra newlines
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/(\d+\.)\s/g, '\n$1 ') // Add newline before numbered points
      .trim();

    // Format metrics
    const formattedMetrics = Object.entries(metrics)
      .map(([key, value]) => {
        const formattedKey = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `• ${formattedKey}: ${value}`;
      })
      .join('\n');

    // Extract recommendations
    const recommendations = analysis.match(/### 8\. Top 3 Prioritized Action Items\n([\s\S]*?)(?=###|$)/)?.[1] || '';
    const formattedRecommendations = recommendations
      .split('\n')
      .filter((line: string) => line.trim().match(/^\d+\./))
      .map((line: string) => line.replace(/^\d+\.\s*/, ''))
      .join('\n• ');

    // Extract SEO score
    const seoScore = analysis.match(/Overall SEO Score\s+(\d+)\/100/)?.[1] || 'N/A';

    // Create the final formatted message
    return `🔍 SEO Analysis Report for ${url}

${formattedAnalysis}

📊 Analysis Metrics:
${formattedMetrics}

💡 Key Recommendations:
• ${formattedRecommendations}

🎯 Overall SEO Score: ${seoScore}/100

✅ Analysis complete! You can now ask questions about the website.`;
  }

  private handleChatMessage(data: any) {
    console.log('Handling message:', data);
    
    // Handle different message types
    switch (data.type) {
      case 'analysis_started':
        this.currentReportId = data.report_id;
        console.log('Analysis started with report ID:', this.currentReportId);
        // Dispatch analysis started event
        window.dispatchEvent(new CustomEvent('wsAnalysisStarted', { 
          detail: { reportId: data.report_id }
        }));
        break;
      
      case 'analysis_progress':
        console.log('Analysis progress:', data.progress);
        // Dispatch progress event with message
        window.dispatchEvent(new CustomEvent('wsAnalysisProgress', { 
          detail: { 
            progress: data.progress, 
            message: data.message,
            reportId: data.report_id 
          }
        }));
        break;
      
      case 'metrics':
        console.log('Received metrics:', data.data);
        // Dispatch metrics event
        window.dispatchEvent(new CustomEvent('wsMetrics', { 
          detail: { 
            data: data.data,
            reportId: data.report_id
          }
        }));
        break;
      
      case 'analysis':
        console.log('Received analysis:', data.data);
        // Format and dispatch analysis event
        const formattedMessage = this.formatAnalysisMessage(data.data);
        window.dispatchEvent(new CustomEvent('wsAnalysis', { 
          detail: { 
            data: {
              ...data.data,
              formattedMessage
            },
            reportId: data.report_id
          }
        }));
        // Automatically dispatch analysis complete after analysis is received
        window.dispatchEvent(new CustomEvent('wsAnalysisComplete', { 
          detail: { reportId: data.report_id }
        }));
        break;
      
      case 'analysis_error':
        console.error('Analysis error:', data.error);
        // Dispatch error event
        window.dispatchEvent(new CustomEvent('wsError', { 
          detail: { message: data.error }
        }));
        break;
      
      case 'chat_response':
        console.log('Dispatching chat response:', data);
        // Handle regular chat response
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