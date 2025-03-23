"use client"

import { useState } from "react"
import { Search, Image, Film, FileText, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type SidebarProps = {
  isOpen: boolean
  messages: Message[]
}

// Utility function to capitalize name
const capitalizeName = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function Sidebar({ isOpen, messages }: SidebarProps) {
  const { user } = useAuth()
  const displayName = user?.name ? capitalizeName(user.name) : 'User'
  const [activeTab, setActiveTab] = useState<"history" | "powers">("powers")

  // Get unique conversations by grouping messages by day
  const getConversations = () => {
    const userMessages = messages.filter((m) => m.sender === "user")
    if (userMessages.length === 0) return []

    // Group by date (simple version - in a real app you'd group by conversation)
    const conversations: { date: string; preview: string }[] = []
    userMessages.forEach((message) => {
      const date = message.timestamp.toLocaleDateString()
      if (!conversations.find((c) => c.date === date)) {
        conversations.push({
          date,
          preview: message.content.substring(0, 30) + (message.content.length > 30 ? "..." : ""),
        })
      }
    })

    return conversations
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
                {getConversations().map((convo, index) => (
                  <div key={index} className="p-3 rounded-md hover:bg-primary-foreground/10 cursor-pointer">
                    <div className="text-sm font-medium">{convo.date}</div>
                    <div className="text-xs text-primary-foreground/70">{convo.preview}</div>
                  </div>
                ))}
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

