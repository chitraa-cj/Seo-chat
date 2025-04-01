"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Lightbulb, PenLine, Settings, LogOut, LayoutDashboard, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "./sidebar"
import ChatMessage from "./chat-message"
import SuggestionCard from "./suggestion-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useWebSocket } from "@/hooks/useWebSocket"
import { storeChatMessage, getChatHistory, ChatHistory, getChatById, Message } from '@/services/chat'

// Utility function to capitalize name
const capitalizeName = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

type ChatInterfaceProps = {
  // ... rest of the types
};

export default function ChatInterface() {
  const { user, logout } = useAuth()
  const displayName = user?.name ? capitalizeName(user.name) : 'User'
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentReportId, setCurrentReportId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isConnected, error, sendChatMessage, analyzeWebsite } = useWebSocket()
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreChats, setHasMoreChats] = useState(true)

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const { chats, totalPages } = await getChatHistory(currentPage);
        if (chats.length > 0) {
          setCurrentChatId(chats[0].id);
          setMessages(Array.isArray(chats[0].messages) ? chats[0].messages : []);
          setCurrentReportId(chats[0].reportId || null);
        }
        setHasMoreChats(currentPage < totalPages);
      } catch (error: any) {
        console.error('Failed to load chat history:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Authentication failed')) {
          // Redirect to login if authentication failed
          router.push('/login');
          return;
        }
        
        // Show error message to user
        setConnectionError(error.message || 'Failed to load chat history');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (user) {
      loadChatHistory();
    }
  }, [user, router, currentPage]);

  // Log connection status changes
  useEffect(() => {
    console.log('WebSocket connection status:', { isConnected, error });
    if (error) {
      setConnectionError(error);
    } else {
      setConnectionError(null);
    }
  }, [isConnected, error]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle WebSocket events
  useEffect(() => {
    const handleChatResponse = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Received chat response event:', customEvent.detail);
      const { message, timestamp, reportId } = customEvent.detail;
      
      // Create bot message
      const botMessage: Message = {
        sender: 'bot',
        content: message,
        timestamp: new Date(timestamp || Date.now())
      };

      // Update messages state
      const updatedMessages = Array.isArray(messages) ? [...messages, botMessage] : [botMessage];
      setMessages(updatedMessages);

      // Store updated chat history
      try {
        const updatedChat = await storeChatMessage(
          updatedMessages,
          reportId || currentReportId || undefined,
          currentChatId || undefined
        );
        setCurrentChatId(updatedChat.id);
      } catch (error: any) {
        console.error('Failed to store chat message:', error);
        if (!error.message?.includes('No authentication token found')) {
          setConnectionError('Failed to save chat message');
        }
      }

      setIsTyping(false);
    };

    const handleAnalysisStarted = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Received analysis started event:', customEvent.detail);
      const { reportId } = customEvent.detail;
      setCurrentReportId(reportId);
      setIsAnalyzing(true);
      setIsTyping(true);
      
      // Add analysis started message
      const botMessage: Message = {
        sender: 'bot',
        content: 'Starting website analysis...',
        timestamp: new Date()
      };
      setMessages(prev => Array.isArray(prev) ? [...prev, botMessage] : [botMessage]);
    };

    const handleAnalysisProgress = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Received analysis progress event:', customEvent.detail);
      const { progress, message } = customEvent.detail;
      setAnalysisProgress(progress);
      
      // Update progress message
      const botMessage: Message = {
        sender: 'bot',
        content: `Analysis progress: ${progress}% - ${message || ''}`,
        timestamp: new Date()
      };
      setMessages(prev => Array.isArray(prev) ? [...prev, botMessage] : [botMessage]);
    };

    const handleMetrics = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Received metrics event:', customEvent.detail);
      const { data } = customEvent.detail;
      
      // Format metrics message
      const metricsMessage = `Analysis Metrics:
• Analysis Time: ${data.analysis_time}
• Word Count: ${data.word_count}
• Link Count: ${data.link_count}`;
      
      const botMessage: Message = {
        sender: 'bot',
        content: metricsMessage,
        timestamp: new Date()
      };
      setMessages(prev => Array.isArray(prev) ? [...prev, botMessage] : [botMessage]);
    };

    const handleAnalysis = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Received analysis event:', customEvent.detail);
      const { data } = customEvent.detail;
      
      // Check if data and analysis exist
      if (!data || !data.analysis) {
        console.error('Invalid analysis data received:', data);
        return;
      }

      // Use the analysis data directly
      const botMessage: Message = {
        sender: 'bot',
        content: data.analysis,
        timestamp: new Date()
      };
      setMessages(prev => Array.isArray(prev) ? [...prev, botMessage] : [botMessage]);
      
      // Reset states after analysis is complete
      setIsAnalyzing(false);
      setIsTyping(false);
      setAnalysisProgress(100);
    };

    const handleAnalysisComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Received analysis complete event:', customEvent.detail);
      const { reportId } = customEvent.detail;
      
      // Reset all states
      setIsAnalyzing(false);
      setIsTyping(false);
      setAnalysisProgress(100);
      
      // Add completion message
      const botMessage: Message = {
        sender: 'bot',
        content: 'Analysis complete! You can now ask questions about the website.',
        timestamp: new Date()
      };
      setMessages(prev => Array.isArray(prev) ? [...prev, botMessage] : [botMessage]);
    };

    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.error('Received error event:', customEvent.detail);
      const { message } = customEvent.detail;
      
      // Add error message
      const botMessage: Message = {
        sender: 'bot',
        content: `Error: ${message}`,
        timestamp: new Date()
      };
      setMessages(prev => Array.isArray(prev) ? [...prev, botMessage] : [botMessage]);
      setConnectionError(message);
      setIsAnalyzing(false);
      setIsTyping(false);
    };

    const handleConnectionError = (event: CustomEvent) => {
      try {
        const message = event.detail?.message || 'Connection error occurred';
        setConnectionError(message);
        setIsLoadingHistory(false);
      } catch (error) {
        console.log('Error in handleConnectionError:', error);
      }
    };

    // Add event listeners
    window.addEventListener('wsChatMessage', handleChatResponse as EventListener);
    window.addEventListener('wsAnalysisStarted', handleAnalysisStarted as EventListener);
    window.addEventListener('wsAnalysisProgress', handleAnalysisProgress as EventListener);
    window.addEventListener('wsMetrics', handleMetrics as EventListener);
    window.addEventListener('wsAnalysis', handleAnalysis as EventListener);
    window.addEventListener('wsAnalysisComplete', handleAnalysisComplete as EventListener);
    window.addEventListener('wsError', handleError as EventListener);
    window.addEventListener('wsConnectionError', handleConnectionError as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('wsChatMessage', handleChatResponse as EventListener);
      window.removeEventListener('wsAnalysisStarted', handleAnalysisStarted as EventListener);
      window.removeEventListener('wsAnalysisProgress', handleAnalysisProgress as EventListener);
      window.removeEventListener('wsMetrics', handleMetrics as EventListener);
      window.removeEventListener('wsAnalysis', handleAnalysis as EventListener);
      window.removeEventListener('wsAnalysisComplete', handleAnalysisComplete as EventListener);
      window.removeEventListener('wsError', handleError as EventListener);
      window.removeEventListener('wsConnectionError', handleConnectionError as EventListener);
    };
  }, [messages, currentReportId, currentChatId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isAnalyzing || isTyping) return;

    const message = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      content: message,
      timestamp: new Date()
    };

    // Update messages state
    const updatedMessages = Array.isArray(messages) ? [...messages, userMessage] : [userMessage];
    setMessages(updatedMessages);

    // Store updated chat history
    try {
      const updatedChat = await storeChatMessage(
        updatedMessages,
        currentReportId || undefined,
        currentChatId || undefined
      );
      setCurrentChatId(updatedChat.id);
    } catch (error: any) {
      console.error('Failed to store chat message:', error);
      if (!error.message?.includes('No authentication token found')) {
        setConnectionError('Failed to save message');
      }
    }

    // Check if the message contains a URL
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = message.match(urlRegex);
    
    if (match) {
      const url = match[0];
      // Check if it's a request for SEO report
      const isReportRequest = message.toLowerCase().includes('seo report') || 
                            message.toLowerCase().includes('analyze') ||
                            message.toLowerCase().includes('report');
      
      if (isReportRequest) {
        // Verify WebSocket connection before starting analysis
        if (!isConnected) {
          const errorMessage = 'WebSocket connection not available. Please try again.';
          console.error(errorMessage);
          setConnectionError(errorMessage);
          
          // Add error message to chat
          const botMessage: Message = {
            sender: 'bot',
            content: errorMessage,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          return;
        }

        // Start comprehensive website analysis
        setIsTyping(true);
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        console.log('Starting comprehensive website analysis for:', url);
        
        try {
          // Send analysis request through WebSocket
          analyzeWebsite(url);
          
          // Add initial bot message about starting analysis
          const botMessage: Message = {
            sender: 'bot',
            content: `Starting comprehensive SEO analysis for ${url}. This may take a few minutes...`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error('Failed to start website analysis:', error);
          const errorMessage = 'Failed to start website analysis. Please try again.';
          setConnectionError(errorMessage);
          
          // Add error message to chat
          const botMessage: Message = {
            sender: 'bot',
            content: errorMessage,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsAnalyzing(false);
          setIsTyping(false);
        }
      } else {
        // Handle regular URL message
        if (!isConnected) {
          const errorMessage = 'WebSocket connection not available. Please try again.';
          console.error(errorMessage);
          setConnectionError(errorMessage);
          
          // Add error message to chat
          const botMessage: Message = {
            sender: 'bot',
            content: errorMessage,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          return;
        }

        setIsTyping(true);
        console.log('Processing URL message:', message);
        sendChatMessage(message, currentReportId || undefined);
      }
    } else {
      // Handle regular chat message
      if (!isConnected) {
        const errorMessage = 'WebSocket connection not available. Please try again.';
        console.error(errorMessage);
        setConnectionError(errorMessage);
        
        // Add error message to chat
        const botMessage: Message = {
          sender: 'bot',
          content: errorMessage,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }

      setIsTyping(true);
      console.log('Sending regular chat message:', message);
      sendChatMessage(message, currentReportId || undefined);
    }
  }

  // Add WebSocket connection status monitoring
  useEffect(() => {
    const checkConnection = () => {
      if (!isConnected) {
        console.warn('WebSocket connection lost. Attempting to reconnect...');
        // You might want to trigger a reconnection here
      }
    };

    // Check connection status every 30 seconds
    const connectionCheckInterval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [isConnected]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    console.log('Suggestion clicked:', suggestion);
    setInputValue(suggestion);
    setIsTyping(true);
    // Auto-submit the suggestion
    const userMessage: Message = {
      sender: "user",
      content: suggestion,
      timestamp: new Date(),
    }

    console.log('Adding suggestion message to chat:', userMessage);
    setMessages((prev) => Array.isArray(prev) ? [...prev, userMessage] : [userMessage]);
    sendChatMessage(suggestion, currentReportId || undefined);
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  const addMessage = (message: Message) => {
    setMessages((prev) => Array.isArray(prev) ? [...prev, message] : [message]);
  }

  // Handle new chat creation
  const handleNewChat = () => {
    setMessages([]);
    setCurrentReportId(null);
    setCurrentChatId(null); // Reset currentChatId to create new chat
    setConnectionError(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  }

  const handleLoadChat = async (chatId: string) => {
    try {
      setIsLoadingHistory(true);
      const chat = await getChatById(chatId);
      setCurrentChatId(chat.id);
      setMessages(Array.isArray(chat.messages) ? chat.messages : []);
      setCurrentReportId(chat.reportId || null);
    } catch (error) {
      console.error('Failed to load chat:', error);
      setConnectionError('Failed to load chat');
    } finally {
      setIsLoadingHistory(false);
    }
  }

  // Add useEffect for client-side initialization
  useEffect(() => {
    // Initialize messages state on client side only
    if (typeof window !== 'undefined') {
      setMessages([]);
    }
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-full"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? "X" : "☰"}
      </button>

      {/* Dashboard button */}
      <button
        className="fixed top-4 right-4 z-50 bg-primary text-white p-2 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
        onClick={handleDashboard}
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>

      {/* Connection status */}
      {connectionError && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <div className="flex-1">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm">{connectionError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Connection status indicator */}
      <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded ${
        isConnected 
          ? 'bg-green-100 border border-green-400 text-green-700' 
          : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
      }`}>
        {isConnected ? 'Connected' : 'Connecting...'}
      </div>

      {/* Analysis progress */}
      {isAnalyzing && (
        <div className="fixed top-20 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 animate-spin" />
            <div className="flex-1">
              <p className="font-semibold">Analyzing Website</p>
              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-sm mt-1">{analysisProgress}% complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoadingHistory && (
        <div className="fixed top-20 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Loading chat history...
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        messages={messages} 
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome message */}
          {Array.isArray(messages) && messages.length === 0 && (
            <div className="mb-8">
              <div className="text-3xl font-bold mb-2 text-gray-800">
                Hey, <span className="text-primary">{displayName}</span> 👋
              </div>
              <div className="text-2xl text-gray-700">How can I help you?</div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <SuggestionCard
                  icon={<Globe className="h-5 w-5" />}
                  text="Enter a website URL to analyze"
                  onClick={() => setInputValue("https://")}
                />
                <SuggestionCard
                  icon={<Lightbulb className="h-5 w-5" />}
                  text="How to analyze the performance of your latest campaign?"
                  onClick={() => handleSuggestionClick("How to analyze the performance of my latest campaign?")}
                />
                <SuggestionCard
                  icon={<PenLine className="h-5 w-5" />}
                  text="Would you like a plan for your next marketing campaign?"
                  onClick={() => handleSuggestionClick("I would like a plan for my next marketing campaign")}
                />
              </div>
            </div>
          )}

          {/* Chat messages */}
          {Array.isArray(messages) && messages.map((message, index) => {
            const timestamp = new Date(message.timestamp);
            // Create a unique key using multiple properties
            const messageKey = `${message.sender}-${timestamp.getTime()}-${index}-${message.content.substring(0, 10)}`;
            return (
              <ChatMessage 
                key={messageKey}
                message={{
                  ...message,
                  timestamp
                }} 
              />
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">AI Assistant</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isAnalyzing ? "Analysis in progress..." : isTyping ? "AI is typing..." : `Hello ${displayName}...`}
              className="flex-1"
              disabled={!isConnected || isAnalyzing || isTyping}
            />
            <Button 
              type="submit" 
              disabled={!isConnected || isAnalyzing || isTyping}
              className={isTyping ? "opacity-50" : ""}
            >
              {isAnalyzing ? "Analyzing..." : isTyping ? "Waiting..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}

