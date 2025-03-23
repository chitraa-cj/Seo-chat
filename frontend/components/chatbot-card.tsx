"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Crown } from "lucide-react"

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

type ChatbotCardProps = {
  chatbot: Chatbot
  onClick: () => void
  featured?: boolean
}

export default function ChatbotCard({ chatbot, onClick, featured = false }: ChatbotCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-md ${featured ? "border-2 border-primary/20" : ""}`}
    >
      <CardContent className="p-0">
        {/* Card header with icon */}
        <div className={`${chatbot.color} p-6 text-white relative`}>
          <div className="flex justify-between items-start">
            <div className="bg-white/20 p-3 rounded-lg">{chatbot.icon}</div>

            <div className="flex gap-2">
              {chatbot.isNew && <Badge className="bg-white text-primary hover:bg-white/90">New</Badge>}
              {chatbot.isPremium && (
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/90">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold mt-4">{chatbot.name}</h3>
        </div>

        {/* Card body with description */}
        <div className="p-6">
          <p className="text-gray-600">{chatbot.description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={onClick}>
          Open Assistant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

