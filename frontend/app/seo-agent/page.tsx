import ChatInterface from "@/components/chat-interface"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SEO Agent Chatbot",
  description: "An interactive SEO assistant chatbot",
}

export default function SEOAgentPage() {
  return (
    <main className="flex h-screen bg-white">
      <ChatInterface />
    </main>
  )
}

