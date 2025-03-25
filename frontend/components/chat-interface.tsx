"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Lightbulb, PenLine, Settings, LogOut, LayoutDashboard, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "./sidebar"
import { ChatMessage } from "./chat-message"
import SuggestionCard from "./suggestion-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useWebSocket } from "@/hooks/useWebSocket"
import ClientOnly from "./client-only"
import TypingIndicator from "./typing-indicator"

// Utility function to capitalize name
const capitalizeName = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Message type definition
type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isConnected, error, sendChatMessage, analyzeWebsite } = useWebSocket()

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

  // Handle chat responses
  useEffect(() => {
    const handleChatResponse = (event: CustomEvent) => {
      console.log('Received chat response:', event.detail);
      const { message, timestamp } = event.detail;
      const botMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "bot",
        timestamp: new Date(timestamp),
      };
      console.log('Adding bot message to chat:', botMessage);
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    };

    window.addEventListener('chatResponse', handleChatResponse as EventListener);
    return () => {
      window.removeEventListener('chatResponse', handleChatResponse as EventListener);
    };
  }, []);

  // Handle analysis progress
  useEffect(() => {
    const handleAnalysisProgress = (event: CustomEvent) => {
      const { progress, reportId } = event.detail;
      setAnalysisProgress(progress);
      setCurrentReportId(reportId);
    };

    window.addEventListener('wsAnalysisProgress', handleAnalysisProgress as EventListener);
    return () => {
      window.removeEventListener('wsAnalysisProgress', handleAnalysisProgress as EventListener);
    };
  }, []);

  // Handle analysis completion
  useEffect(() => {
    const handleAnalysisComplete = (event: CustomEvent) => {
      const { reportId } = event.detail;
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      setCurrentReportId(reportId);
      
      // Add completion message
      const botMessage: Message = {
        id: Date.now().toString(),
        content: "Website analysis complete! You can now ask questions about the analysis.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    };

    window.addEventListener('wsAnalysisComplete', handleAnalysisComplete as EventListener);
    return () => {
      window.removeEventListener('wsAnalysisComplete', handleAnalysisComplete as EventListener);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !isConnected) {
      console.log('Cannot submit message:', { inputValue, isConnected });
      return;
    }

    // Check if input contains a URL
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = inputValue.match(urlRegex);
    
    if (match) {
      // If it contains a URL, start analysis
      const extractedUrl = match[1];
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      analyzeWebsite(inputValue);
      
      // Add user message with context
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `Analyzing website: ${extractedUrl}`,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
    } else {
      // If not a URL, handle as regular chat message
      console.log('Submitting message:', inputValue);
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      sendChatMessage(inputValue, currentReportId || undefined);
    }

    setInputValue("");
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    console.log('Suggestion clicked:', suggestion);
    setInputValue(suggestion)
    // Auto-submit the suggestion
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      sender: "user",
      timestamp: new Date(),
    }

    console.log('Adding suggestion message to chat:', userMessage);
    setMessages((prev) => [...prev, userMessage])
    sendChatMessage(suggestion)
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <ClientOnly>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isMobileMenuOpen} messages={messages} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col relative">
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

          {/* Status indicators */}
          <div className="fixed top-20 right-4 z-50 space-y-2">
            {/* Connection error */}
            {connectionError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
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

            {/* Connection status */}
            <div className={`px-4 py-2 rounded ${
              isConnected 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
            }`}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>

            {/* Analysis progress */}
            {isAnalyzing && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
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
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Welcome message */}
            {messages.length === 0 && (
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
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isAnalyzing ? "Analysis in progress..." : `Hello ${displayName}...`}
                className="flex-1"
                disabled={!isConnected || isAnalyzing || isTyping}
              />
              <Button type="submit" disabled={!isConnected || isAnalyzing || isTyping}>
                {isAnalyzing ? "Analyzing..." : isTyping ? "Waiting..." : "Send"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}

