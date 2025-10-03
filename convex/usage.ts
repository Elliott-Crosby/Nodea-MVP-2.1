import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const recordUsage = internalMutation({
  args: {
    userId: v.id("users"),
    boardId: v.id("boards"),
    nodeId: v.optional(v.id("nodes")),
    provider: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costEstimate: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      userId: args.userId,
      boardId: args.boardId,
      nodeId: args.nodeId,
      provider: args.provider,
      model: args.model,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      costEstimate: args.costEstimate,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});
