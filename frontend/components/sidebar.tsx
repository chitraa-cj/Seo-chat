"use client"

import { useState, useEffect } from "react"
import { Search, Image, Film, FileText, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getChatHistory } from "@/services/chat"
import type { Message, ChatHistory } from "@/services/chat"

type SidebarProps = {
  isOpen: boolean
  messages: Message[]
  onNewChat: () => void
  onLoadChat: (chatId: string) => Promise<void>
}

// Utility function to capitalize name
const capitalizeName = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function Sidebar({ isOpen, messages, onNewChat, onLoadChat }: SidebarProps) {
  const { user } = useAuth()
  const displayName = user?.name ? capitalizeName(user.name) : 'User'
  const [activeTab, setActiveTab] = useState<"history" | "powers">("powers")
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreChats, setHasMoreChats] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Load chat history when the history tab is active
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const { chats, totalPages } = await getChatHistory(currentPage)
        setChatHistory(prev => [...prev, ...chats])
        setHasMoreChats(currentPage < totalPages)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }

    if (activeTab === "history") {
      loadChatHistory()
    }
  }, [activeTab, currentPage])

  // Handle loading more chats
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreChats) return
    setIsLoadingMore(true)
    setCurrentPage(prev => prev + 1)
    setIsLoadingMore(false)
  }

  // Get unique conversations by grouping messages by day
  const getConversations = () => {
    if (!chatHistory || chatHistory.length === 0) return [];

    return chatHistory.map((chat) => ({
      date: new Date(chat.createdAt).toLocaleDateString(),
      preview: chat.messages?.[0]?.content ? 
        chat.messages[0].content.substring(0, 30) + (chat.messages[0].content.length > 30 ? "..." : "") :
        "New Chat",
      id: chat.id
    }));
  }

  return (
    <div
      className={`bg-primary text-white w-64 flex-shrink-0 flex flex-col h-full transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} fixed md:static z-40`}
    >
      {/* Profile section */}
      <div className="p-4 border-b border-primary-foreground/20">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt={displayName} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-xl">{displayName}</h2>
            <p className="text-sm text-white">{user?.email}</p>
          </div>
        </div>
        <Button 
          onClick={onNewChat}
          className="w-full mt-4 bg-primary-foreground/10 hover:bg-primary-foreground/20"
        >
          Start New Chat
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary-foreground/20">
        <button
          className={`flex-1 py-2 text-center ${activeTab === "powers" ? "font-bold" : "text-primary-foreground/70"}`}
          onClick={() => setActiveTab("powers")}
        >
          Powers-up
        </button>
        <button
          className={`flex-1 py-2 text-center ${activeTab === "history" ? "font-bold" : "text-primary-foreground/70"}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "powers" && (
          <div className="p-4 grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20"
            >
              <Image className="h-6 w-6" />
              <span className="text-xs">Images</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20"
            >
              <Film className="h-6 w-6" />
              <span className="text-xs">Videos</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20"
            >
              <FileText className="h-6 w-6" />
              <span className="text-xs">Reports</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20"
            >
              <Globe className="h-6 w-6" />
              <span className="text-xs">Web Audit</span>
            </Button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/50" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-md py-2 pl-10 pr-3 text-sm"
              />
            </div>

            {getConversations().length > 0 ? (
              <div className="space-y-2">
                {getConversations().map((convo) => (
                  <div 
                    key={convo.id} 
                    className="p-3 rounded-md hover:bg-primary-foreground/10 cursor-pointer"
                    onClick={() => onLoadChat(convo.id)}
                  >
                    <div className="text-sm font-medium">{convo.date}</div>
                    <div className="text-xs text-primary-foreground/70">{convo.preview}</div>
                  </div>
                ))}
                {hasMoreChats && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full py-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-primary-foreground/50 py-4">No conversation history yet</div>
            )}
          </div>
        )}
      </div>

      {/* Language selector */}
      <div className="p-5 border-t border-primary-foreground/20">
        <select className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-md py-2 px-4 text-sm">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
  )
}

