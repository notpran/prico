"use client"

import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { ReactNode } from "react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
const convex = new ConvexReactClient(convexUrl)

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk 
      client={convex}
      useAuth={useAuth}
    >
      {children}
    </ConvexProviderWithClerk>
  )
}