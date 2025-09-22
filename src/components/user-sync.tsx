'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useUserSync() {
  const { user } = useUser()
  const createUser = useMutation(api.users.createUser)

  useEffect(() => {
    if (user) {
      // Sync Clerk user with Convex database
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        username: user.username || user.id,
        displayName: user.fullName || user.username || 'User',
        avatarUrl: user.imageUrl,
        age: undefined, // This would need to be collected separately
      }).catch(console.error)
    }
  }, [user, createUser])

  return user
}