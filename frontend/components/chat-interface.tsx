"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Lightbulb, PenLine, Settings, LogOut, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "./sidebar"
import { ChatMessage } from "./chat-message"
import SuggestionCard from "./suggestion-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot response (in a real app, this would call your Python backend)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thanks for your question about "${inputValue}". As an SEO assistant, I can help you optimize your content for better search engine rankings.`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    // Auto-submit the suggestion
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response
    setTimeout(() => {
      let response = ""

      if (suggestion.includes("analyze")) {
        response =
          "To analyze your latest campaign performance, I can help you track key metrics like organic traffic, keyword rankings, conversion rates, and backlink growth. Would you like me to create a detailed report?"
      } else if (suggestion.includes("plan")) {
        response =
          "I can help create your next marketing campaign plan with SEO-optimized content, keyword targeting, and distribution strategies. What specific goals do you have for this campaign?"
      } else if (suggestion.includes("social networks")) {
        response =
          "For your social networks, I recommend creating SEO-friendly content that drives traffic back to your website. Would you like content ideas for specific platforms like Instagram, Twitter, or LinkedIn?"
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

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

      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} messages={messages} />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
                  icon={<Lightbulb className="h-5 w-5" />}
                  text="How to analyze the performance of your latest campaign?"
                  onClick={() => handleSuggestionClick("How to analyze the performance of my latest campaign?")}
                />
                <SuggestionCard
                  icon={<PenLine className="h-5 w-5" />}
                  text="Would you like a plan for your next marketing campaign?"
                  onClick={() => handleSuggestionClick("I would like a plan for my next marketing campaign")}
                />
                <SuggestionCard
                  icon={<Settings className="h-5 w-5" />}
                  text="Need ideas for your social networks?"
                  onClick={() => handleSuggestionClick("I need ideas for my social networks")}
                />
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Hello ${displayName}...`}
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </>
  )
}

