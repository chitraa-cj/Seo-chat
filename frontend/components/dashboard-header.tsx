"use client"
import { useRouter } from "next/navigation"
import { Search, Bell, Settings, LogOut, ChevronDown } from "lucide-react"
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
import { useAuth } from "@/lib/auth-context"

type DashboardHeaderProps = {
  onSearch: (query: string) => void
  searchQuery: string
}

export default function DashboardHeader({ onSearch, searchQuery }: DashboardHeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    // In a real app, you would call your logout API here
    localStorage.removeItem("auth_token")
    router.push("/login")
  }

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
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
          onChange={(e) => onSearch(e.target.value)}
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
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={user?.name || 'User'} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

