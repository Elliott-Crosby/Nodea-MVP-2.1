import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  boards: defineTable({
    ownerUserId: v.id("users"),
    orgId: v.optional(v.id("orgs")),
    title: v.string(),
    description: v.optional(v.string()),
    settingsJson: v.optional(v.string()),
    defaultApiKeyId: v.optional(v.id("apiKeys")),
    isPublic: v.boolean(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerUserId"]),

  nodes: defineTable({
    boardId: v.id("boards"),
    type: v.union(v.literal("prompt"), v.literal("message"), v.literal("response"), v.literal("note"), v.literal("frame")),
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"))),
    title: v.optional(v.string()),
    content: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    size: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    collapsed: v.boolean(),
    color: v.optional(v.string()),
    meta: v.object({
      model: v.optional(v.string()),
      provider: v.optional(v.string()),
      tokens: v.optional(v.object({
        input: v.number(),
        output: v.number(),
      })),
      sources: v.optional(v.array(v.object({
        url: v.string(),
        title: v.string(),
        at: v.number(),
      }))),
    }),
    createdBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_board", ["boardId"]),

  edges: defineTable({
    boardId: v.id("boards"),
    srcNodeId: v.id("nodes"),
    dstNodeId: v.id("nodes"),
    kind: v.union(v.literal("lineage"), v.literal("reference")),
    label: v.optional(v.string()),
  }).index("by_board", ["boardId"])
    .index("by_src", ["srcNodeId"])
    .index("by_dst", ["dstNodeId"]),

  tags: defineTable({
    boardId: v.id("boards"),
    name: v.string(),
    color: v.string(),
  }).index("by_board", ["boardId"]),

  nodeTags: defineTable({
    nodeId: v.id("nodes"),
    tagId: v.id("tags"),
  }).index("by_node", ["nodeId"])
    .index("by_tag", ["tagId"]),

  snapshots: defineTable({
    boardId: v.id("boards"),
    label: v.string(),
    graphJson: v.string(),
    createdBy: v.id("users"),
  }).index("by_board", ["boardId"]),

  apiKeys: defineTable({
    ownerUserId: v.id("users"),
    provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("google")),
    nickname: v.string(),
    last4: v.string(),
    encryptedKey: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerUserId"]),

  usageEvents: defineTable({
    userId: v.id("users"),
    boardId: v.id("boards"),
    nodeId: v.optional(v.id("nodes")),
    provider: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costEstimate: v.number(),
    status: v.string(),
  }).index("by_user", ["userId"])
    .index("by_board", ["boardId"]),

  sharingTokens: defineTable({
    boardId: v.id("boards"),
    token: v.string(),
    access: v.union(v.literal("view"), v.literal("comment")),
    expiresAt: v.number(),
  }).index("by_board", ["boardId"])
    .index("by_token", ["token"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
