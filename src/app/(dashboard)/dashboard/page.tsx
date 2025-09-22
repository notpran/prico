'use client'

import { useUser } from '@clerk/nextjs'
import { Dashboard } from '@/components/dashboard'
import { SocketProvider } from '@/lib/socket-context'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  // Convert Clerk user to our user format
  const pricoDashboardUser = {
    id: user.id,
    name: user.fullName || user.username || 'User',
    email: user.primaryEmailAddress?.emailAddress || '',
    avatar: user.imageUrl,
    status: 'online' as const,
    username: user.username || user.id,
    displayName: user.fullName || user.username || 'User',
  }

  return (
    <SocketProvider>
      <Dashboard 
        user={pricoDashboardUser} 
        onLogout={handleLogout} 
      />
    </SocketProvider>
  )
}