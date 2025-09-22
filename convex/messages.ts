import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
  args: {
    content: v.string(),
    authorId: v.id("users"),
    communityId: v.id("communities"),
    channelId: v.id("channels"),
    replyTo: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.object({
      filename: v.string(),
      url: v.string(),
      size: v.number(),
      type: v.string()
    }))),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      senderId: args.authorId,
      content: args.content,
      type: "text",
      reactions: [],
      mentions: [],
      replyTo: args.replyTo,
      isPinned: false,
      createdAt: Date.now()
    });

    return messageId;
  },
});

// Get messages for a channel
export const getMessages = query({
  args: {
    channelId: v.id("channels"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    // Sort by creation time (newest first)
    messages.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

    // Get author information for each message
    const messagesWithAuthors = await Promise.all(
      messages.slice(0, limit).map(async (message) => {
        const author = await ctx.db.get(message.senderId);
        return {
          ...message,
          author
        };
      })
    );

    return messagesWithAuthors.filter(m => m.author);
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    authorId: v.id("users")
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.authorId) {
      throw new Error("Only the author can edit the message");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now()
    });

    return true;
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    authorId: v.id("users")
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.authorId) {
      throw new Error("Only the author can delete the message");
    }

    await ctx.db.delete(args.messageId);
    return true;
  },
});

// Pin/unpin a message
export const togglePinMessage = mutation({
  args: {
    messageId: v.id("messages"),
    authorId: v.id("users")
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Check if user has permission to pin (could be community admin check)
    // For now, allow any user to pin/unpin

    await ctx.db.patch(args.messageId, {
      isPinned: !message.isPinned
    });

    return !message.isPinned;
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

// Get pinned messages for a channel
export const getPinnedMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq(q.field("isPinned"), true))
      .collect();

    // Get author information for each message
    const messagesWithAuthors = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.senderId);
        return {
          ...message,
          author
        };
      })
    );

    return messagesWithAuthors.filter(m => m.author);
  },
});
