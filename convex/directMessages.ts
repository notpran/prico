import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all direct message conversations for a user
export const getDirectMessageConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("directMessages")
      .filter((q) => 
        q.or(
          q.eq(q.field("participant1Id"), args.userId),
          q.eq(q.field("participant2Id"), args.userId)
        )
      )
      .order("desc")
      .collect();

    const conversationsWithData = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.participant1Id === args.userId 
          ? conversation.participant2Id 
          : conversation.participant1Id;
        
        const otherUser = await ctx.db.get(otherUserId);
        
        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .order("desc")
          .first();

        return {
          ...conversation,
          otherUser,
          lastMessage,
        };
      })
    );

    return conversationsWithData
      .filter((c) => c.otherUser)
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  },
});

// Get or create a direct message conversation
export const getOrCreateDirectMessage = mutation({
  args: { participant1Id: v.id("users"), participant2Id: v.id("users") },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("directMessages")
      .filter((q) => 
        q.or(
          q.and(
            q.eq(q.field("participant1Id"), args.participant1Id),
            q.eq(q.field("participant2Id"), args.participant2Id)
          ),
          q.and(
            q.eq(q.field("participant1Id"), args.participant2Id),
            q.eq(q.field("participant2Id"), args.participant1Id)
          )
        )
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("directMessages", {
      participant1Id: args.participant1Id,
      participant2Id: args.participant2Id,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Get messages for a DM conversation
export const getDirectMessages = query({
  args: { conversationId: v.id("directMessages"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_time", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(args.limit || 50);

    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender,
        };
      })
    );

    return messagesWithSenders.reverse();
  },
});

// Send a direct message
export const sendDirectMessage = mutation({
  args: { 
    conversationId: v.id("directMessages"), 
    senderId: v.id("users"), 
    content: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      senderId: args.senderId,
      conversationId: args.conversationId,
      replyToId: args.replyToId,
      createdAt: now,
    });

    // Update conversation last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
    });

    // Get the other participant for notification
    const otherUserId = conversation.participant1Id === args.senderId 
      ? conversation.participant2Id 
      : conversation.participant1Id;

    // Create notification
    await ctx.db.insert("notifications", {
      userId: otherUserId,
      type: "message",
      title: "New direct message",
      content: args.content.substring(0, 100),
      data: { senderId: args.senderId },
      read: false,
      createdAt: now,
    });

    return messageId;
  },
});