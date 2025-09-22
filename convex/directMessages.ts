import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all direct message conversations for a user
export const getDirectMessageConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("directMessageConversations")
      .collect();

    // Filter conversations where the user is a participant
    const userConversations = conversations.filter(conv => 
      conv.participants.includes(args.userId)
    );

    const conversationsWithData = await Promise.all(
      userConversations.map(async (conversation) => {
        const otherUserId = conversation.participants.find((id: string) => id !== args.userId);
        
        const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

        return {
          ...conversation,
          otherUser,
        };
      })
    );

    return conversationsWithData.filter((c) => c.otherUser);
  },
});

// Get or create a direct message conversation
export const getOrCreateDirectMessage = mutation({
  args: { participant1Id: v.id("users"), participant2Id: v.id("users") },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const conversations = await ctx.db
      .query("directMessageConversations")
      .collect();

    const existingConversation = conversations.find(conv =>
      conv.participants.includes(args.participant1Id) && 
      conv.participants.includes(args.participant2Id) &&
      conv.participants.length === 2
    );

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("directMessageConversations", {
      participants: [args.participant1Id, args.participant2Id],
      createdAt: Date.now()
    });

    return conversationId;
  },
});

// Send direct message
export const sendDirectMessage = mutation({
  args: {
    conversationId: v.id("directMessageConversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.optional(v.union(v.literal('text'), v.literal('file'), v.literal('image'), v.literal('code'))),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("directMessages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type || "text",
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      reactions: [],
      createdAt: Date.now()
    });

    // Update conversation's last message
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageAt: Date.now()
    });

    return messageId;
  },
});

// Get messages for a direct message conversation
export const getDirectMessages = query({
  args: {
    conversationId: v.id("directMessageConversations"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const messages = await ctx.db
      .query("directMessages")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .collect();

    // Sort by creation time (newest first)
    messages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Get sender information for each message
    const messagesWithSenders = await Promise.all(
      messages.slice(0, limit).map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender
        };
      })
    );

    return messagesWithSenders.filter(m => m.sender);
  },
});

// Add reaction to direct message
export const addReaction = mutation({
  args: {
    messageId: v.id("directMessages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const existingReaction = message.reactions.find(
      (r: any) => r.emoji === args.emoji && r.userId === args.userId
    );

    if (existingReaction) {
      // User already reacted with this emoji, remove it
      const updatedReactions = message.reactions.filter(
        (r: any) => !(r.emoji === args.emoji && r.userId === args.userId)
      );
      await ctx.db.patch(args.messageId, {
        reactions: updatedReactions
      });
    } else {
      // Add new reaction
      const updatedReactions = [...message.reactions, {
        emoji: args.emoji,
        userId: args.userId,
        createdAt: Date.now()
      }];
      await ctx.db.patch(args.messageId, {
        reactions: updatedReactions
      });
    }

    return true;
  },
});
