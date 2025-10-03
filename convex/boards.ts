import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAuth, requireUserOwnership } from "./security";
import { validateBoardTitle, validateBoardDescription } from "./validation";
import { checkAccess, requireAccess, logAccessAttempt } from "./acl";

export const listBoards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    return await ctx.db
      .query("boards")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
      .order("desc")
      .collect();
  },
});

export const createBoard = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Validate and sanitize inputs
    const validatedTitle = validateBoardTitle(args.title);
    const validatedDescription = validateBoardDescription(args.description);

    const boardId = await ctx.db.insert("boards", {
      ownerUserId: userId,
      title: validatedTitle,
      description: validatedDescription,
      isPublic: false,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return boardId;
  },
});

export const getBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    // Check access using ACL system
    const hasAccess = await checkAccess(ctx, "board", args.boardId, "read");
    if (!hasAccess) {
      await logAccessAttempt(ctx, userId, "board", args.boardId, "read", false);
      throw new Error("Access denied");
    }

    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    // Log successful access
    await logAccessAttempt(ctx, userId, "board", args.boardId, "read", true);

    // Update last accessed metadata (only in mutations, not queries)
    // This will be handled in the mutation layer

    return board;
  },
});

export const updateBoardMeta = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    // Check write access using ACL system
    const hasAccess = await checkAccess(ctx, "board", args.boardId, "write");
    if (!hasAccess) {
      await logAccessAttempt(ctx, userId, "board", args.boardId, "update", false);
      throw new Error("Access denied");
    }

    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    // Validate inputs
    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = validateBoardTitle(args.title);
    if (args.description !== undefined) updates.description = validateBoardDescription(args.description);
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.boardId, updates);
    
    // Log successful update
    await logAccessAttempt(ctx, userId, "board", args.boardId, "update", true);
  },
});

export const clearBoard = mutation({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    // Check write access using ACL system
    const hasAccess = await checkAccess(ctx, "board", args.boardId, "write");
    if (!hasAccess) {
      await logAccessAttempt(ctx, userId, "board", args.boardId, "clear", false);
      throw new Error("Access denied");
    }

    try {
      // Delete all nodes for this board
      const nodes = await ctx.db
        .query("nodes")
        .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
        .collect();
      
      // Security: No logging of sensitive data
      for (const node of nodes) {
        await ctx.db.delete(node._id);
      }

      // Delete all edges for this board
      const edges = await ctx.db
        .query("edges")
        .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
        .collect();
      
      // Security: No logging of sensitive data
      for (const edge of edges) {
        await ctx.db.delete(edge._id);
      }

      // Delete all tags for this board
      const tags = await ctx.db
        .query("tags")
        .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
        .collect();
      
      // Security: No logging of sensitive data
      for (const tag of tags) {
        await ctx.db.delete(tag._id);
      }

      // Delete all node tags - get all node tags and filter by board
      const allNodeTags = await ctx.db.query("nodeTags").collect();
      const boardNodeTags = allNodeTags.filter(nt => 
        nodes.some(node => node._id === nt.nodeId)
      );
      
      // Security: No logging of sensitive data
      for (const nodeTag of boardNodeTags) {
        await ctx.db.delete(nodeTag._id);
      }

      // Board cleared successfully
      await logAccessAttempt(ctx, userId, "board", args.boardId, "clear", true);
      return { success: true, deleted: { nodes: nodes.length, edges: edges.length, tags: tags.length, nodeTags: boardNodeTags.length } };
    } catch (error) {
      // Security: Log error without sensitive data
      await logAccessAttempt(ctx, userId, "board", args.boardId, "clear", false, error instanceof Error ? error.message : String(error));
      console.error("Error clearing board");
      throw new Error(`Failed to clear board: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const deleteBoard = mutation({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    // Check admin access using ACL system
    const hasAccess = await checkAccess(ctx, "board", args.boardId, "admin");
    if (!hasAccess) {
      await logAccessAttempt(ctx, userId, "board", args.boardId, "delete", false);
      throw new Error("Access denied");
    }

    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    // Delete all nodes, edges, tags, etc. for this board
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
    
    for (const node of nodes) {
      await ctx.db.delete(node._id);
    }

    const edges = await ctx.db
      .query("edges")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
    
    for (const edge of edges) {
      await ctx.db.delete(edge._id);
    }

    // Delete all tags for this board
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
    
    for (const tag of tags) {
      await ctx.db.delete(tag._id);
    }

    // Delete all node tags for this board
    // First get all nodes, then delete their tags
    for (const node of nodes) {
      const nodeTags = await ctx.db
        .query("nodeTags")
        .withIndex("by_node", (q) => q.eq("nodeId", node._id))
        .collect();
      
      for (const nodeTag of nodeTags) {
        await ctx.db.delete(nodeTag._id);
      }
    }

    await ctx.db.delete(args.boardId);
    
    // Log successful deletion
    await logAccessAttempt(ctx, userId, "board", args.boardId, "delete", true);
  },
});

export const updateAccessMetadata = mutation({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    // Check access using ACL system
    const hasAccess = await checkAccess(ctx, "board", args.boardId, "read");
    if (!hasAccess) {
      await logAccessAttempt(ctx, userId, "board", args.boardId, "update-access", false);
      throw new Error("Access denied");
    }

    // Update last accessed metadata
    await ctx.db.patch(args.boardId, {
      lastAccessedAt: Date.now(),
      lastAccessedBy: userId,
    });
    
    await logAccessAttempt(ctx, userId, "board", args.boardId, "update-access", true);
  },
});
