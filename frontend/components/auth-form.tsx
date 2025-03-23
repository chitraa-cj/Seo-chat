"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Github, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, register } = useAuth()

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Signup form state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Form validation state
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" })
  const [signupErrors, setSignupErrors] = useState({ name: "", email: "", password: "", terms: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setLoginErrors({ email: "", password: "" })

    // Validate form
    let hasError = false
    const errors = { email: "", password: "" }

    if (!loginEmail) {
      errors.email = "Email is required"
      hasError = true
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errors.email = "Email is invalid"
      hasError = true
    }

    if (!loginPassword) {
      errors.password = "Password is required"
      hasError = true
    }

    if (hasError) {
      setLoginErrors(errors)
      return
    }

    // Submit form
    setIsLoading(true)

    try {
      await login(loginEmail, loginPassword)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setLoginErrors({ ...errors, password: "Invalid email or password" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setSignupErrors({ name: "", email: "", password: "", terms: "" })

    // Validate form
    let hasError = false
    const errors = { name: "", email: "", password: "", terms: "" }

    if (!signupName) {
      errors.name = "Name is required"
      hasError = true
    }

    if (!signupEmail) {
      errors.email = "Email is required"
      hasError = true
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      errors.email = "Email is invalid"
      hasError = true
    }

    if (!signupPassword) {
      errors.password = "Password is required"
      hasError = true
    } else if (signupPassword.length < 8) {
      errors.password = "Password must be at least 8 characters"
      hasError = true
    }

    if (!agreeTerms) {
      errors.terms = "You must agree to the terms and conditions"
      hasError = true
    }

    if (hasError) {
      setSignupErrors(errors)
      return
    }

    // Submit form
    setIsLoading(true)

    try {
      await register(signupEmail, signupPassword, signupName)
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
      setSignupErrors({ ...errors, email: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      {/* Login Form */}
      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className={`pl-10 ${loginErrors.email ? "border-red-500" : ""}`}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {loginErrors.email && <p className="text-xs text-red-500">{loginErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="login-password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 ${loginErrors.password ? "border-red-500" : ""}`}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginErrors.password && <p className="text-xs text-red-500">{loginErrors.password}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember-me" className="text-sm">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" disabled={isLoading}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
          </div>
        </form>
      </TabsContent>

      {/* Signup Form */}
      <TabsContent value="signup">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="signup-name"
                type="text"
                placeholder="David"
                className={`pl-10 ${signupErrors.name ? "border-red-500" : ""}`}
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {signupErrors.name && <p className="text-xs text-red-500">{signupErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                className={`pl-10 ${signupErrors.email ? "border-red-500" : ""}`}
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {signupErrors.email && <p className="text-xs text-red-500">{signupErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 ${signupErrors.password ? "border-red-500" : ""}`}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signupErrors.password && <p className="text-xs text-red-500">{signupErrors.password}</p>}
            <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              className="mt-1"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>
          {signupErrors.terms && <p className="text-xs text-red-500">{signupErrors.terms}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" disabled={isLoading}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  )
}

