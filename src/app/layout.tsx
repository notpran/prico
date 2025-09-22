import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { ConvexProvider } from '@/components/convex-provider'
import { PerformanceProvider } from '@/lib/performance-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prico - Code, Chat, Collaborate',
  description: 'A Discord-like chat platform with VSCode-like collaborative coding and GitHub-like project management.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PerformanceProvider>
              <ConvexProvider>
                {children}
              </ConvexProvider>
            </PerformanceProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}