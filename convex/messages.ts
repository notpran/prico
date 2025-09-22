import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a message
export const sendMessage = mutation({
  args: {
    content: v.string(),
    senderId: v.id("users"),
    communityId: v.id("communities"),
    channelId: v.id("channels"),
    replyToId: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      senderId: args.senderId,
      communityId: args.communityId,
      channelId: args.channelId,
      replyToId: args.replyToId,
      attachments: args.attachments,
      reactions: [],
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a channel
export const getChannelMessages = query({
  args: { 
    channelId: v.id("channels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_time", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(limit);

    // Get sender information for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender ? {
            _id: sender._id,
            username: sender.username,
            displayName: sender.displayName,
            avatarUrl: sender.avatarUrl,
          } : null,
        };
      })
    );

    return messagesWithSenders.reverse(); // Return in chronological order
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.userId) {
      throw new Error("Unauthorized: Can only edit your own messages");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.userId) {
      throw new Error("Unauthorized: Can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
    });
  },
});

// Add reaction to message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const reactions = message.reactions || [];
    const existingReaction = reactions.find(r => r.emoji === args.emoji);

    if (existingReaction) {
      if (existingReaction.userIds.includes(args.userId)) {
        // Remove reaction
        existingReaction.userIds = existingReaction.userIds.filter(id => id !== args.userId);
        if (existingReaction.userIds.length === 0) {
          // Remove empty reaction
          const updatedReactions = reactions.filter(r => r.emoji !== args.emoji);
          await ctx.db.patch(args.messageId, { reactions: updatedReactions });
        } else {
          await ctx.db.patch(args.messageId, { reactions });
        }
      } else {
        // Add user to existing reaction
        existingReaction.userIds.push(args.userId);
        await ctx.db.patch(args.messageId, { reactions });
      }
    } else {
      // Create new reaction
      reactions.push({
        emoji: args.emoji,
        userIds: [args.userId],
      });
      await ctx.db.patch(args.messageId, { reactions });
    }
  },
});