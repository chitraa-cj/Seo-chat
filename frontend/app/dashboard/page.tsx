import type { Metadata } from "next"
import DashboardContent from "@/components/dashboard-content"

export const metadata: Metadata = {
  title: "AI Assistant Dashboard",
  description: "Access all your AI assistants in one place",
}

export default function DashboardPage() {
  return <DashboardContent />
}

