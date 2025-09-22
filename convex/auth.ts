import { defineAuth } from '@convex-dev/auth/server'
import GitHub from '@auth/github'
import Resend from '@auth/resend'

export default defineAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Resend({
      id: 'resend',
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { profile, provider } = args
      
      // Check if user already exists
      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_external_id')
        .filter(q => q.eq(q.field('externalId'), profile.id))
        .first()

      const userData = {
        externalId: profile.id,
        email: profile.email || '',
        displayName: profile.name || profile.login || '',
        username: profile.login || profile.email?.split('@')[0] || '',
        avatarUrl: profile.avatar_url,
        status: 'online' as const,
        lastSeen: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        role: 'user' as const,
        skills: [],
        preferences: {
          theme: 'dark' as const,
          notifications: {
            directMessages: true,
            friendRequests: true,
            mentions: true,
            communities: true,
            projects: true
          },
          privacy: {
            showOnlineStatus: true,
            allowDirectMessages: 'everyone' as const,
            showProfile: 'public' as const
          }
        }
      }

      if (existingUser) {
        // Update existing user
        await ctx.db.patch(existingUser._id, {
          ...userData,
          createdAt: existingUser.createdAt // Keep original creation date
        })
        return existingUser._id
      } else {
        // Create new user
        const userId = await ctx.db.insert('users', {
          ...userData,
          createdAt: Date.now()
        })
        return userId
      }
    }
  }
})