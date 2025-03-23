"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  LineChart,
  FileText,
  MessageSquare,
  Code,
  ShoppingCart,
  Image,
  Lightbulb,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ChatbotCard from "@/components/chatbot-card"
import { useAuth } from "@/lib/auth-context"

// Chatbot type definition
type Chatbot = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  path: string
  isNew?: boolean
  isPremium?: boolean
}

// Utility function to capitalize name
const capitalizeName = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function DashboardContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const displayName = user?.name ? capitalizeName(user.name) : 'User'

  // List of available chatbots
  const chatbots: Chatbot[] = [
    {
      id: "seo-agent",
      name: "SEO AI Agent",
      description: "Optimize your content for search engines and improve your rankings",
      icon: <LineChart className="h-6 w-6" />,
      color: "bg-primary",
      path: "/seo-agent",
      isNew: true,
    },
    {
      id: "content-writer",
      name: "Content Writer",
      description: "Generate high-quality blog posts, articles, and marketing copy",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-500",
      path: "/content-writer",
    },
    {
      id: "customer-support",
      name: "Customer Support",
      description: "Provide instant answers to customer questions and resolve issues",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-green-500",
      path: "/customer-support",
    },
    {
      id: "code-assistant",
      name: "Code Assistant",
      description: "Get help with coding, debugging, and technical questions",
      icon: <Code className="h-6 w-6" />,
      color: "bg-orange-500",
      path: "/code-assistant",
      isPremium: true,
    },
    {
      id: "ecommerce-assistant",
      name: "E-commerce Assistant",
      description: "Boost sales with product descriptions and marketing strategies",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "bg-pink-500",
      path: "/ecommerce-assistant",
    },
    {
      id: "image-generator",
      name: "Image Generator",
      description: "Create custom images and graphics for your marketing materials",
      icon: <Image className="h-6 w-6" />,
      color: "bg-purple-600",
      path: "/image-generator",
      isPremium: true,
    },
    {
      id: "brainstorming",
      name: "Brainstorming Assistant",
      description: "Generate creative ideas and solutions for your business challenges",
      icon: <Lightbulb className="h-6 w-6" />,
      color: "bg-yellow-500",
      path: "/brainstorming",
    },
    {
      id: "general-assistant",
      name: "General Assistant",
      description: "Your all-purpose AI helper for a wide range of tasks",
      icon: <Sparkles className="h-6 w-6" />,
      color: "bg-indigo-500",
      path: "/general-assistant",
    },
  ]

  // Filter chatbots based on search query
  const filteredChatbots = chatbots.filter(
    (chatbot) =>
      chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLogout = () => {
    logout()
  }

  const handleChatbotClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
              A
            </div>
            <h1 className="text-xl font-bold">AI Assistant Hub</h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search assistants..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Settings className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="md:hidden p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search assistants..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Featured section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Assistants</h2>
            <Button variant="ghost" className="text-primary">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChatbots.slice(0, 4).map((chatbot) => (
              <ChatbotCard
                key={chatbot.id}
                chatbot={chatbot}
                onClick={() => handleChatbotClick(chatbot.path)}
                featured
              />
            ))}
          </div>
        </section>

        {/* All assistants section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Assistants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChatbots.map((chatbot) => (
              <ChatbotCard key={chatbot.id} chatbot={chatbot} onClick={() => handleChatbotClick(chatbot.path)} />
            ))}
          </div>

          {filteredChatbots.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-medium mb-2">No assistants found</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

