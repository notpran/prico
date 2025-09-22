"use client"

import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { ReactNode } from "react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"

export function ConvexProvider({ children }: { children: ReactNode }) {
  // Create a basic client for development when no real Convex URL is configured
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.warn("Convex URL not configured. Running in development mode with placeholder data.");
    return <>{children}</>;
  }

  const convex = new ConvexReactClient(convexUrl)

  return (
    <ConvexProviderWithClerk 
      client={convex}
      useAuth={useAuth}
    >
      {children}
    </ConvexProviderWithClerk>
  )
}