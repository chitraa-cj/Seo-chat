import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import AuthGuard from "@/components/auth-guard"
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SEO Chatbot",
  description: "AI-powered SEO analysis and recommendations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="grammarly-handler" strategy="beforeInteractive">
          {`
            // Remove Grammarly attributes that cause hydration mismatch
            window.addEventListener('load', function() {
              const removeGrammarlyAttributes = () => {
                document.querySelectorAll('[data-new-gr-c-s-check-loaded]').forEach(el => {
                  el.removeAttribute('data-new-gr-c-s-check-loaded');
                });
                document.querySelectorAll('[data-gr-ext-installed]').forEach(el => {
                  el.removeAttribute('data-gr-ext-installed');
                });
              };
              removeGrammarlyAttributes();
              // Run periodically to catch any new elements
              setInterval(removeGrammarlyAttributes, 1000);
            });
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <AuthGuard>{children}</AuthGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'