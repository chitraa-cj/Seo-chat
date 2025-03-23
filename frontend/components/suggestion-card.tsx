"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

type SuggestionCardProps = {
  icon: ReactNode
  text: string
  onClick: () => void
}

export default function SuggestionCard({ icon, text, onClick }: SuggestionCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full text-primary">{icon}</div>
        <p className="text-sm text-gray-700">{text}</p>
      </CardContent>
    </Card>
  )
}

