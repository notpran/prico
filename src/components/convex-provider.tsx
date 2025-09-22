"use client"

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react"
import { ReactNode } from "react"

// Create a placeholder client if Convex URL is not configured
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
const convex = new ConvexReactClient(convexUrl)

export function ConvexProvider({ children }: { children: ReactNode }) {
  // If using placeholder URL, show a notice in development
  if (convexUrl === "https://placeholder.convex.cloud" && process.env.NODE_ENV === "development") {
    console.warn("Convex URL not configured. Using placeholder client.")
  }

  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>
}