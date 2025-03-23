import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type ChatMessageProps = {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth()
  const isUser = message.sender === "user"

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar>
        {isUser ? (
          <>
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt={user?.name || 'User'} />
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className={`flex flex-col ${isUser ? 'items-end' : ''}`}>
        <div className="text-sm text-gray-500 mb-1">
          {isUser ? user?.name || 'User' : 'AI Assistant'}
        </div>
        <div className={`p-3 rounded-lg ${
          isUser ? 'bg-primary text-white' : 'bg-gray-100'
        }`}>
          {message.content}
        </div>
        <div className="text-xs mt-1 opacity-70">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  )
}

